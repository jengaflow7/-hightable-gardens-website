const COOKIE = "hightable_admin";
const SESSION_HOURS = 12;
const COLLECTIONS = new Set([
  "menu_categories", "menu_items", "events", "promotions",
  "gallery", "homepage_content", "site_settings", "circles"
]);

function json(data, status = 200, headers = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store", ...headers }
  });
}
function bytesToHex(bytes) {
  return Array.from(new Uint8Array(bytes), b => b.toString(16).padStart(2, "0")).join("");
}
async function digest(value) {
  return bytesToHex(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value)));
}
function cookieValue(request) {
  const raw = request.headers.get("Cookie") || "";
  const item = raw.split(";").map(v => v.trim()).find(v => v.startsWith(COOKIE + "="));
  return item ? decodeURIComponent(item.slice(COOKIE.length + 1)) : "";
}
function cookieHeader(value, maxAge) {
  return COOKIE + "=" + encodeURIComponent(value) + "; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=" + maxAge;
}
async function ensureSchema(db) {
  await db.prepare(`CREATE TABLE IF NOT EXISTS cms_admin_sessions (
    token_hash TEXT PRIMARY KEY,
    expires_at INTEGER NOT NULL,
    created_at INTEGER NOT NULL
  )`).run();
  await db.prepare(`CREATE TABLE IF NOT EXISTS cms_records (
    id TEXT PRIMARY KEY,
    collection TEXT NOT NULL,
    title TEXT NOT NULL DEFAULT '',
    data_json TEXT NOT NULL DEFAULT '{}',
    sort_order INTEGER NOT NULL DEFAULT 0,
    active INTEGER NOT NULL DEFAULT 1,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
  )`).run();
  await db.prepare("CREATE INDEX IF NOT EXISTS idx_cms_records_collection_order ON cms_records(collection, sort_order, updated_at)").run();
}
async function authenticated(request, env) {
  const token = cookieValue(request);
  if (!token) return false;
  const hash = await digest(token);
  const row = await env.DB.prepare("SELECT token_hash FROM cms_admin_sessions WHERE token_hash = ? AND expires_at > ?")
    .bind(hash, Math.floor(Date.now() / 1000)).first();
  return !!row;
}
function validCollection(value) {
  return typeof value === "string" && COLLECTIONS.has(value);
}
export async function onRequest(context) {
  const { request, env } = context;
  if (!env.DB) return json({ error: "The Cloudflare Pages D1 binding named DB is missing." }, 503);
  await ensureSchema(env.DB);
  const url = new URL(request.url);
  const path = (Array.isArray(context.params.path) ? context.params.path.join("/") : context.params.path || "").replace(/^\/+|\/+$/g, "");

  if (path === "login" && request.method === "POST") {
    if (!env.ADMIN_PASSWORD) return json({ error: "Set the ADMIN_PASSWORD secret in Cloudflare Pages before enabling admin login." }, 503);
    let body;
    try { body = await request.json(); } catch { return json({ error: "Invalid request body." }, 400); }
    const supplied = String(body.password || "");
    if (!supplied || supplied.length > 256 || supplied !== env.ADMIN_PASSWORD) {
      return json({ error: "Incorrect password." }, 401);
    }
    const tokenBytes = crypto.getRandomValues(new Uint8Array(32));
    const token = bytesToHex(tokenBytes);
    const now = Math.floor(Date.now() / 1000);
    const expires = now + SESSION_HOURS * 3600;
    await env.DB.prepare("INSERT INTO cms_admin_sessions(token_hash, expires_at, created_at) VALUES(?, ?, ?)")
      .bind(await digest(token), expires, now).run();
    return json({ ok: true, expiresAt: expires }, 200, { "set-cookie": cookieHeader(token, SESSION_HOURS * 3600) });
  }

  if (path === "logout" && request.method === "POST") {
    const token = cookieValue(request);
    if (token) await env.DB.prepare("DELETE FROM cms_admin_sessions WHERE token_hash = ?").bind(await digest(token)).run();
    return json({ ok: true }, 200, { "set-cookie": cookieHeader("", 0) });
  }

  if (path === "public" && request.method === "GET") {
    const today = new Intl.DateTimeFormat("en-CA", { timeZone: "Africa/Nairobi" }).format(new Date());
    const result = await env.DB.prepare("SELECT id, collection, data_json, sort_order, active, created_at, updated_at FROM cms_records WHERE active = 1 ORDER BY sort_order ASC, updated_at DESC").all();
    const records = (result.results || []).map(row => ({
      id: row.id, collection: row.collection, data: safeJson(row.data_json),
      sort_order: row.sort_order, active: !!row.active,
      created_at: row.created_at, updated_at: row.updated_at
    })).filter(row => {
      const d = row.data || {};
      if (d.active === false || d.active === 0) return false;
      if (row.collection === "events" && d.end_date && String(d.end_date) < today) return false;
      if (row.collection === "promotions") {
        if (d.start_date && String(d.start_date) > today) return false;
        if (d.end_date && String(d.end_date) < today) return false;
      }
      return true;
    });
    const grouped = {};
    for (const row of records) (grouped[row.collection] ||= []).push(row);
    return json({ records: grouped, today });
  }

  if (path === "session" && request.method === "GET") {
    return json({ authenticated: await authenticated(request, env) });
  }

  if (!(await authenticated(request, env))) return json({ error: "Authentication required." }, 401);

  if (path === "collections" && request.method === "GET") {
    return json({ collections: Array.from(COLLECTIONS) });
  }

  if (path === "records" && request.method === "GET") {
    const collection = url.searchParams.get("collection");
    if (!validCollection(collection)) return json({ error: "Unknown collection." }, 400);
    const result = await env.DB.prepare("SELECT id, title, data_json, sort_order, active, created_at, updated_at FROM cms_records WHERE collection = ? ORDER BY sort_order ASC, updated_at DESC")
      .bind(collection).all();
    return json({ records: (result.results || []).map(row => ({
      id: row.id, title: row.title, data: safeJson(row.data_json),
      sort_order: row.sort_order, active: !!row.active,
      created_at: row.created_at, updated_at: row.updated_at
    })) });
  }

  if (path === "record" && request.method === "POST") {
    let body;
    try { body = await request.json(); } catch { return json({ error: "Invalid request body." }, 400); }
    const collection = body.collection;
    if (!validCollection(collection)) return json({ error: "Unknown collection." }, 400);
    if (!body.data || typeof body.data !== "object" || Array.isArray(body.data)) return json({ error: "Record data must be an object." }, 400);
    const dataJson = JSON.stringify(body.data);
    if (dataJson.length > 200000) return json({ error: "Record is too large (maximum 200 KB)." }, 413);
    const id = typeof body.id === "string" && /^[a-zA-Z0-9_-]{1,80}$/.test(body.id)
      ? body.id : crypto.randomUUID();
    const now = Math.floor(Date.now() / 1000);
    const title = String(body.data.title || body.data.name || body.data.label || "").slice(0, 180);
    const sortOrder = Number.isFinite(Number(body.data.sort_order)) ? Math.trunc(Number(body.data.sort_order)) : 0;
    const active = body.data.active === false || body.data.active === 0 ? 0 : 1;
    await env.DB.prepare(`INSERT INTO cms_records(id, collection, title, data_json, sort_order, active, created_at, updated_at)
      VALUES(?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET collection=excluded.collection, title=excluded.title,
      data_json=excluded.data_json, sort_order=excluded.sort_order, active=excluded.active, updated_at=excluded.updated_at`)
      .bind(id, collection, title, dataJson, sortOrder, active, now, now).run();
    return json({ ok: true, id });
  }

  if (path === "record" && request.method === "DELETE") {
    const id = url.searchParams.get("id") || "";
    const collection = url.searchParams.get("collection") || "";
    if (!/^[a-zA-Z0-9_-]{1,80}$/.test(id) || !validCollection(collection)) return json({ error: "Invalid record reference." }, 400);
    await env.DB.prepare("DELETE FROM cms_records WHERE id = ? AND collection = ?").bind(id, collection).run();
    return json({ ok: true });
  }

  return json({ error: "Not found." }, 404);
}
function safeJson(value) {
  try { return JSON.parse(value || "{}"); } catch { return {}; }
}
