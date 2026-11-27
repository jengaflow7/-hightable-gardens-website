# Hightable Gardens CMS (development)

This CMS work is on `cms-foundation`. It does not change the production `main` branch.

## Cloudflare prerequisites

1. In Cloudflare Pages, open the Hightable Gardens project.
2. Confirm the existing D1 binding is named `DB` and points to `hightable-cms-db`.
3. In **Settings → Variables and Secrets**, add a secret named `ADMIN_PASSWORD`. Use a long, unique password (at least 16 characters). Do not put it in a source file or share it in chat.
4. Trigger a deployment of the `cms-foundation` branch / open its Pages preview URL.
5. Visit `/admin/` on that preview URL and sign in.

The first authenticated API request creates two additional D1 tables: `cms_admin_sessions` and `cms_records`. Existing restaurant tables are not dropped or overwritten.

## Current development scope

- Private admin sign-in with an HttpOnly, Secure, SameSite=Strict session cookie.
- Authenticated create, list, update and delete API operations for CMS records.
- Collections: menu categories, menu items, events, promotions, gallery, homepage content, site settings and rotating circles.
- Public read-only endpoint for active records; expired events and out-of-date promotions are filtered using the Kenya calendar date.
- The current website can read CMS-managed menu categories/items, gallery images and rotating circles, while retaining `cfg.js` as a fallback.
- Circle badge settings are supported in circle records and are rendered inside the animated circle wrapper.

## Record field guide

The admin currently edits a record as JSON. Image fields accept an existing filename in `img/` (for example `ribsph.jpg`) or an HTTPS image URL. Do not paste private credentials into content records.

- **menu_categories**: `name`, `slug`, `cover`, optional `dishes` array, `sort_order`, `active`.
- **menu_items**: `name`, `description`, `price`, `category_id`, `sort_order`, `active`. Set `category_id` to the category record ID or its slug.
- **gallery**: `title`, `image`, `sort_order`, `active`.
- **circles**: `title`, `image`, `sort_order`, `active`, and optional `badge` object. Example:

```json
{
  "title": "Weekend platter",
  "image": "topph.jpg",
  "sort_order": 1,
  "active": true,
  "badge": {
    "enabled": true,
    "text": "WEEKEND\nSPECIAL",
    "background": "#f5b324",
    "color": "#17130a",
    "borderColor": "#ffffff",
    "shape": "price-tag",
    "animation": "wobble",
    "rotation": 8,
    "offsetX": 0,
    "offsetY": 0
  }
}
```

- **events**: `title`, `description`, `poster`, `start_date`, `end_date`, `start_time`, `location`, `price`, `booking_url`, `contact`, `active`.
- **promotions**: `title`, `description`, `image`, `badge_text`, `start_date`, `end_date`, `placement`, `priority`, `active`.
- **homepage_content**: `section`, `title`, `subtitle`, `body`, `image`, `active`.
- **site_settings**: `key`, `value`.

## Important limitations before launch

- The current editor is a first working foundation and uses a JSON editor. It is not yet the final friendly form-based owner dashboard.
- Events, promotions, homepage text and site settings can be stored, but their public-page presentation and all corresponding friendly controls still need to be completed.
- Image upload/storage has not been implemented. No R2 bucket or paid storage has been enabled. Use existing `img/` assets or HTTPS image URLs for now.
- Test the Pages preview and D1 integration before merging anything to `main`.
