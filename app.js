(async function(){
var C=CONFIG;
function cmsAsset(value){
 if(typeof value!=="string"||!value.trim())return "";
 var v=value.trim();
 if(/^https:\/\//i.test(v))return v;
 v=v.replace(/^\/+/, "");
 if(v.indexOf("..")!==-1||! /^[a-zA-Z0-9_./-]+$/.test(v))return "";
 return v.indexOf("/")===-1?"img/"+v:v;
}
function cmsText(value){return String(value==null?"":value).replace(/[&<>"']/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]})}
try{
 var response=await fetch("/api/admin/public",{cache:"no-store",credentials:"same-origin"});
 if(response.ok){
  var payload=await response.json(),groups=payload.records||{};
  var themeRows=groups.theme_settings||[];if(themeRows.length){var td=themeRows[0].data||{};if(td.active!==false){var root=document.documentElement;var vars={primary:"--y",secondary:"--r",background:"--bg",text:"--ink",muted:"--m",border:"--ln"};Object.keys(vars).forEach(function(k){if(/^#[0-9a-f]{6}$/i.test(String(td[k]||"")))root.style.setProperty(vars[k],td[k])});if(/^#[0-9a-f]{6}$/i.test(String(td.surface||"")))root.style.setProperty("--theme-surface",td.surface);if(/^#[0-9a-f]{6}$/i.test(String(td.accent||"")))root.style.setProperty("--theme-accent",td.accent);}}var cats=(groups.menu_categories||[]).filter(function(row){return (row.data||{}).active!==false;}).sort(function(a,b){return (Number((a.data||{}).sort_order)||0)-(Number((b.data||{}).sort_order)||0);}),items=groups.menu_items||[];
  if(cats.length){
   C.categories=cats.map(function(row){
    var d=row.data||{},name=String(d.name||d.title||"Menu"),slug=String(d.slug||name.toLowerCase().trim().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"")),key=slug||String(row.id);
    var keys=[String(row.id),key,name.toLowerCase(),name.toLowerCase().trim().replace(/[^a-z0-9]+/g,"-")];
    var matched=items.filter(function(item){
     var x=item.data||{};if(x.active===false)return false;var refs=[x.category_id,x.category,x.category_slug,x.category_name].filter(function(v){return v!==undefined&&v!==null&&String(v).trim()!==""}).map(function(v){return String(v).toLowerCase().trim()});
     return refs.some(function(v){return keys.some(function(k){return String(k).toLowerCase()===v;})});
    }).sort(function(a,b){return (Number((a.data||{}).sort_order)||0)-(Number((b.data||{}).sort_order)||0);});
    var dishes=matched.map(function(item){
     var x=item.data||{};return {name:x.name||x.title||"",description:x.description||"",price:x.price==null?"":x.price,image:cmsAsset(x.image||x.photo||x.cover),available:x.available!==false&&x.active!==false,featured:!!x.featured,showInList:x.showInList!==false,badge:x.badge||{}};
    }).filter(function(dish){return dish.name;});
    if(!dishes.length&&Array.isArray(d.dishes))dishes=d.dishes;
    return {id:key,name:name,cover:cmsAsset(d.background_image||d.cover||d.image),pics:[],dishes:dishes};
   });
  }
  var photos=(groups.gallery||[]).map(function(row){var d=row.data||{};return cmsAsset(d.image||d.src||d.file)}).filter(Boolean);
  if(photos.length)C.photos=photos;
  var homeDishes=items.filter(function(row){var d=row.data||{};return d.homeFeatured===true&&(d.active!==false)&&(d.available!==false)&&(d.image||d.photo||d.cover);}).map(function(row){var d=row.data||{};return {image:cmsAsset(d.image||d.photo||d.cover),title:d.name||d.title||"",badge:d.badge&&d.badge.enabled?d.badge:{enabled:true,text:(d.badge&&d.badge.text)||"Featured",background:(d.badge&&d.badge.background)||"#f5b324",color:(d.badge&&d.badge.color)||"#17130a",shape:(d.badge&&d.badge.shape)||"price-tag",animation:(d.badge&&d.badge.animation)||"wobble"},link:"menu.html#"+encodeURIComponent(d.category_slug||d.category_id||d.category||"")};}).filter(function(x){return x.image;});
  var circles=homeDishes.length?homeDishes:(groups.circles||[]).map(function(row){var d=row.data||{};return {image:cmsAsset(d.image||d.photo),title:d.title||"",badge:Object.assign({},d.badge||{},{enabled:true,text:(d.badge&&d.badge.text)||"Featured"}),link:d.link||""};}).filter(function(x){return x.image;});
  if(circles.length){C.orbit=circles.map(function(x){return x.image});C.orbitDetails=circles;}
 }
}catch(e){/* Existing cfg.js content remains the fallback if CMS is unavailable. */}
var $=function(i){return document.getElementById(i)},pg=document.body.getAttribute("data-page"),still=matchMedia("(prefers-reduced-motion: reduce)").matches;
var P='viewBox="0 0 100 100"';
document.body.insertAdjacentHTML("afterbegin",'<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs>'+
'<radialGradient id="gr" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="#ff6a4a"/><stop offset="1" stop-color="#a81a10"/></radialGradient>'+
'<radialGradient id="gc" cx=".35" cy=".3" r=".9"><stop offset="0" stop-color="#fffaf0"/><stop offset="1" stop-color="#d3c29c"/></radialGradient>'+
'<linearGradient id="gl" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#78b64f"/><stop offset="1" stop-color="#2c6428"/></linearGradient>'+
'<radialGradient id="gy" cx=".4" cy=".35" r=".8"><stop offset="0" stop-color="#ffe874"/><stop offset="1" stop-color="#dba310"/></radialGradient>'+
'<radialGradient id="gb" cx=".4" cy=".35" r=".8"><stop offset="0" stop-color="#6f4325"/><stop offset="1" stop-color="#231209"/></radialGradient>'+
'<radialGradient id="gp" cx=".4" cy=".3" r=".8"><stop offset="0" stop-color="#d78bb7"/><stop offset="1" stop-color="#7d2c63"/></radialGradient>'+
'<linearGradient id="gm" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#c8333a"/><stop offset="1" stop-color="#76101a"/></linearGradient>'+
'<radialGradient id="gu" cx=".35" cy=".3" r=".7"><stop offset="0" stop-color="#fff" stop-opacity=".95"/><stop offset=".6" stop-color="#9ad7ff" stop-opacity=".22"/><stop offset="1" stop-color="#5eaee8" stop-opacity=".55"/></radialGradient>'+
'<radialGradient id="go" cx=".4" cy=".35" r=".8"><stop offset="0" stop-color="#ffb04a"/><stop offset="1" stop-color="#d9620f"/></radialGradient></defs>'+
'<symbol id="rose" '+P+'><ellipse cx="22" cy="74" rx="16" ry="8" fill="url(#gl)" transform="rotate(-30 22 74)"/><ellipse cx="78" cy="74" rx="16" ry="8" fill="url(#gl)" transform="rotate(30 78 74)"/><circle cx="50" cy="48" r="34" fill="#a60f2a"/><path d="M50 48m-24 0a24 24 0 1 1 24 24M50 48m-14 0a14 14 0 1 1 14 14M50 48m-6 0a6 6 0 1 1 6 6" stroke="#e8586f" stroke-width="4" fill="none" stroke-linecap="round"/></symbol>'+
'<symbol id="heart" '+P+'><path d="M50 90C14 62 8 40 24 24 36 12 48 20 50 30 52 20 64 12 76 24 92 40 86 62 50 90z" fill="url(#gr)"/></symbol>'+
'<symbol id="ornament" '+P+'><rect x="42" y="4" width="16" height="12" rx="2" fill="#d9a93a"/><circle cx="50" cy="58" r="36" fill="url(#gr)"/><ellipse cx="38" cy="42" rx="10" ry="6" fill="#fff" opacity=".4" transform="rotate(-30 38 42)"/></symbol>'+
'<symbol id="holly" '+P+'><path d="M50 52C34 30 8 38 14 56 20 70 40 62 50 52zM50 52C66 30 92 38 86 56 80 70 60 62 50 52z" fill="url(#gl)"/><circle cx="44" cy="54" r="9" fill="url(#gr)"/><circle cx="58" cy="56" r="9" fill="url(#gr)"/><circle cx="51" cy="68" r="9" fill="url(#gr)"/></symbol>'+
'<symbol id="bat" '+P+'><path d="M50 36C44 24 30 24 6 34 16 38 18 50 26 56 32 48 40 52 44 62 46 54 48 50 50 50 52 50 54 54 56 62 60 52 68 48 74 56 82 50 84 38 94 34 70 24 56 24 50 36z" fill="#0f0d0d"/><path d="M44 30l-2-10 8 6 8-6-2 10z" fill="#0f0d0d"/><circle cx="46" cy="38" r="2" fill="#f5b324"/><circle cx="54" cy="38" r="2" fill="#f5b324"/></symbol>'+
'<symbol id="pumpkin" '+P+'><ellipse cx="50" cy="58" rx="40" ry="32" fill="url(#go)"/><path d="M50 28C40 46 40 70 50 88M50 28C60 46 60 70 50 88M30 36C20 52 22 72 34 84M70 36C80 52 78 72 66 84" stroke="#b34a08" stroke-width="2.4" fill="none" opacity=".7"/><path d="M46 28c0-10 8-14 12-14" stroke="#3f8a2e" stroke-width="6" fill="none" stroke-linecap="round"/></symbol>'+
'<symbol id="flagke" viewBox="0 0 100 70"><rect width="100" height="70" fill="#fff"/><rect width="100" height="20" fill="#111"/><rect y="25" width="100" height="20" fill="#bb1b1b"/><rect y="50" width="100" height="20" fill="#0a6b2f"/><rect y="20" width="100" height="5" fill="#fff"/><rect y="45" width="100" height="5" fill="#fff"/><ellipse cx="50" cy="35" rx="9" ry="14" fill="#bb1b1b" stroke="#111" stroke-width="2"/></symbol>'+
'<symbol id="santahat" '+P+'><path d="M16 70C20 30 50 10 80 20 70 26 74 44 84 70z" fill="#d93a2f"/><rect x="10" y="66" width="80" height="16" rx="8" fill="#fff"/><circle cx="82" cy="20" r="9" fill="#fff"/></symbol></svg>');
function rng(s){return function(){s|=0;s=s+0x6D2B79F5|0;var t=Math.imul(s^s>>>15,1|s);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
/* ---------- holidays (date encoded; add ?holiday=christmas to preview) ---------- */
var H=(function(){var q=/[?&]holiday=(\w+)/.exec(location.search);if(q)return q[1]==="none"?null:q[1];var d=new Date(),m=d.getMonth()+1,x=d.getDate();
 if(m===2&&x>=10&&x<=14)return"valentine";if((m===5&&x>=29)||(m===6&&x===1))return"madaraka";if(m===10&&x>=25)return"halloween";if(m===12&&x>=18&&x<=26)return"christmas";return null})();
var HD={valentine:{b:"rose",msg:"Happy Valentine’s Day from Hightable Gardens",p:["rose","heart","rose","heart","rose"],g:1},christmas:{b:"santahat",msg:"Merry Christmas from Hightable Gardens",p:["ornament","holly","ornament","holly","ornament"],g:1},halloween:{b:"bat",msg:"Happy Halloween from Hightable Gardens",p:["bat","pumpkin","bat","pumpkin","bat"],g:0},madaraka:{b:"flagke",msg:"Happy Madaraka Day from Hightable Gardens",p:["flagke","flagke","flagke"],g:0}};
var HX=H&&HD[H],GIFT=HX&&HX.g?" gift":"";
/* ---------- header and footer ---------- */
var L=[["index.html","Home","home"],["menu.html","Our menu","menu"],["index.html#about","About us",""]],R=[["events.html","Events","events"],["promotions.html","Offers","promotions"],["careers.html","Careers","careers"],["gallery.html","Gallery","gallery"],["contact.html#faq","Good to know",""],["contact.html#talk","Talk to us","contact"]];
function lk(n){return '<a href="'+n[0]+'"'+(n[2]&&n[2]===pg?' style="color:var(--y)"':"")+">"+n[1]+"</a>"}
var badge=HX?'<span class="hb"><svg viewBox="'+(HX.b==="flagke"?"0 0 100 70":"0 0 100 100")+'"><use href="#'+HX.b+'"/></svg></span>':"";
$("hdr").innerHTML=(HX?'<div class="hs">'+HX.msg+"</div>":"")+'<header><div class="w"><button class="mb" type="button" aria-label="Toggle page navigation" aria-expanded="false">Explore</button><a class="lg" href="index.html" aria-label="Hightable Gardens home"><span class="lw"><img src="img/logo.png" alt="Namaiyana Hightable Gardens logo">'+badge+'</span></a><div class="header-actions"><a class="bt header-reserve" href="contact.html#book">Reserve a table</a><a class="bt header-order" data-tel href="#">Order we deliver</a></div></div><div class="mn" aria-label="Page navigation">'+L.concat(R).map(lk).join("")+'<a href="contact.html#book">Reserve a table</a></div></header>';
(function(){
var host=document.getElementById("hdr"),head=host&&host.querySelector("header"),btn=host&&host.querySelector(".mb"),nav=host&&host.querySelector(".mn");
if(!host||!head||!btn||!nav)return;
function setExplore(open){
host.classList.toggle("explore-open",open);
head.classList.toggle("open",open);
btn.setAttribute("aria-expanded",open?"true":"false");
}
btn.addEventListener("click",function(e){e.preventDefault();e.stopPropagation();setExplore(!host.classList.contains("explore-open"));});
btn.addEventListener("keydown",function(e){if(e.key==="Enter"||e.key===" "){e.preventDefault();setExplore(!host.classList.contains("explore-open"));}if(e.key==="Escape")setExplore(false);});
nav.addEventListener("click",function(e){if(e.target.closest("a"))setExplore(false);});
document.addEventListener("click",function(e){if(!host.contains(e.target))setExplore(false);});
})();
var map="https://www.google.com/maps/search/?api=1&query="+encodeURIComponent(C.mapQuery),tel="tel:+"+C.whatsapp,wa="https://wa.me/"+C.whatsapp;
var so='<div class="so"><a href="'+C.tiktok+'" target="_blank" rel="noopener" aria-label="TikTok"><svg viewBox="0 0 24 24"><path d="M16.6 5.8A4.3 4.3 0 0 1 15.5 3h-3.1v12.4a2.6 2.6 0 1 1-2.6-2.6c.3 0 .5 0 .8.1V9.7a5.7 5.7 0 1 0 4.9 5.6V9a7.3 7.3 0 0 0 4.2 1.3V7.2a4.3 4.3 0 0 1-3.1-1.4z"/></svg></a><a href="'+C.facebook+'" target="_blank" rel="noopener" aria-label="Facebook"><svg viewBox="0 0 24 24"><path d="M13.5 21v-8h2.7l.4-3.2h-3.1V7.8c0-.9.3-1.5 1.6-1.5h1.7V3.4c-.3 0-1.3-.1-2.4-.1-2.4 0-4.1 1.5-4.1 4.2v2.3H7.5V13h2.8v8h3.2z"/></svg></a><a href="'+C.instagram+'" target="_blank" rel="noopener" aria-label="Instagram"><svg class="s" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4.2"/><circle cx="17.3" cy="6.7" r="1.1" fill="currentColor" stroke="none"/></svg></a></div>';
$("ftr").innerHTML='<div class="site-footer"><div class="footer-top"><div class="footer-brand"><span class="sc">Hightable Gardens</span><p>Good food, warm hospitality and moments worth sharing in Narok.</p>'+so+'</div><nav class="footer-nav" aria-label="All pages">'+L.concat(R).map(lk).join("")+'</nav><div class="footer-contact"><a href="'+tel+'">Call us</a><a href="'+wa+'" target="_blank" rel="noopener">WhatsApp</a><a href="'+map+'" target="_blank" rel="noopener">Directions</a></div></div><footer>© Hightable Gardens Narok. All rights reserved.</footer><div class="footer-links"><a href="careers.html">Careers</a><a href="privacy.html">Privacy</a><a href="terms.html">Terms</a></div><div class="bar"><a href="'+tel+'">Call</a><a href="'+wa+'" target="_blank" rel="noopener">WhatsApp</a><a href="'+map+'" target="_blank" rel="noopener">Directions</a></div>';
document.querySelectorAll("[data-tel]").forEach(function(a){a.href=tel});document.querySelectorAll("[data-map]").forEach(function(a){a.href=map});
/* holiday decorations at the page edges */
if(HX){var hp=document.createElement("div");hp.className="hp";document.body.insertBefore(hp,document.body.firstChild);
 var fit=function(){hp.style.height=document.documentElement.scrollHeight+"px";hp.innerHTML="";var r=rng(11),mob=innerWidth<700;HX.p.forEach(function(s,i){var e=document.createElement("div");e.className="hpi";e.style.width=(mob?52:80)+"px";e.style.top=(8+(i/HX.p.length)*86)+"%";e.style[i%2?"right":"left"]=(mob?-10:14+r()*30)+"px";e.style.transform="rotate("+(r()*50-25).toFixed(0)+"deg)";e.innerHTML='<svg viewBox="'+(s==="flagke"?"0 0 100 70":"0 0 100 100")+'"><use href="#'+s+'"/></svg>';hp.appendChild(e)})};
 addEventListener("load",fit);addEventListener("resize",fit)}
/* reveal on scroll */
var rv=[].slice.call(document.querySelectorAll(".rv"));
if("IntersectionObserver" in window){var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add("in");io.unobserve(e.target)}})},{threshold:.08});rv.forEach(function(n){io.observe(n)})}else rv.forEach(function(n){n.classList.add("in")});
/* ---------- home: rotating circles + rolling coin ---------- */
if(pg==="home"){
 var st=$("stage"),sizes=[250,200,270,220,210,240,180,200,210,220],nodes=C.orbit.map(function(f,i){
  var e=document.createElement("div"),detail=(C.orbitDetails||[])[i]||{};
  e.className="ob"+GIFT;e.style.width=sizes[i%sizes.length]+"px";e.style.opacity=0;
  var im=document.createElement("img");im.src=cmsAsset(f)||"img/"+f;im.alt=detail.title||"Hightable Gardens food and venue";im.loading="lazy";e.appendChild(im);
  var b=detail.badge||{};
  if(b.enabled&&b.text){
   var tag=document.createElement("span");tag.className="orbit-badge "+(b.shape||"price-tag")+" "+(b.animation==="shake"?"badge-shake":b.animation==="wobble"?"badge-wobble":"");
   tag.textContent=String(b.text);tag.style.background=b.background||"#f5b324";tag.style.color=b.color||"#17130a";
   if(b.borderColor)tag.style.borderColor=b.borderColor;
   if(b.width)tag.style.width=Number(b.width)+"px";
   if(b.height)tag.style.height=Number(b.height)+"px";
   if(b.fontSize)tag.style.fontSize=Number(b.fontSize)+"px";
   if(b.rotation!==undefined)tag.style.setProperty("--badge-rotation",Number(b.rotation)+"deg");
   if(b.offsetX!==undefined)tag.style.right="calc(4% + "+Number(b.offsetX)+"px)";
   if(b.offsetY!==undefined)tag.style.top="calc(-2% + "+Number(b.offsetY)+"px)";
   e.appendChild(tag);
  }
  st.appendChild(e);return e;
 }),run=true,t0=performance.now();
 function place(t){var W=st.clientWidth,Hh=st.clientHeight,mob=W<700,rx=W*(mob?.7:.45),ry=Hh*(mob?.41:.4),cx=W/2,cy=Hh*(mob?.5:.52),N=nodes.length;
  nodes.forEach(function(n,i){var a=i*2*Math.PI/N+t*.00013,s=(mob?.4:.5)+.64*(1+Math.sin(a))/2,w=sizes[i%sizes.length]*(mob?.72:1);n.style.width=w+"px";n.style.opacity=1;
   n.style.transform="translate("+(cx+rx*Math.cos(a)-w/2)+"px,"+(cy-ry*Math.sin(a)-w/2)+"px) scale("+s.toFixed(3)+")";n.style.zIndex=Math.round(s*100)})}
 function loop(t){if(run&&!still)place(t-t0);requestAnimationFrame(loop)}place(0);requestAnimationFrame(loop);
 new IntersectionObserver(function(e){run=e[0].isIntersecting}).observe(st);addEventListener("resize",function(){place(performance.now()-t0)});
 var cs=$("coinsec"),coin=$("coin3d"),fa=$("fa"),fb=$("fb"),cap=$("ccap"),ci=0,deg=0,flips=0;
 fa.src="img/"+C.coin[0][0];fb.src="img/"+C.coin[1%C.coin.length][0];cap.textContent=C.coin[0][1];
 function flip(){var nx=(ci+1)%C.coin.length,hidden=flips%2===0?fb:fa;hidden.src="img/"+C.coin[nx][0];cap.textContent=C.coin[nx][1];deg+=540;coin.style.transform="rotateY("+deg+"deg)";ci=nx;flips++}
 new IntersectionObserver(function(e,o){if(e[0].isIntersecting){cs.classList.add("go");o.disconnect();if(!still)setTimeout(function(){flip();setInterval(flip,4600)},3200)}},{threshold:.35}).observe(cs);
 function dishSlug(name){return String(name||"dish").toLowerCase().trim().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"")||"dish"}
 function showHomeCategory(cat){
  var wrap=$("homeCategoryFeatured");
  var featured=(cat.dishes||[]).filter(function(d){return d&&typeof d==="object"&&!Array.isArray(d)&&d.featured===true&&d.available!==false&&d.image;});
  wrap.innerHTML='<div class="home-featured-heading"><h3>'+cmsText(cat.name)+'</h3><p>Featured from this category</p></div>'+(featured.length?'<div class="home-featured-grid">'+featured.map(function(d){var anchor="dish-"+cat.id+"-"+dishSlug(d.name);return '<a class="home-featured-circle" href="menu.html#'+cmsText(anchor)+'"><img src="'+cmsText(cmsAsset(d.image))+'" alt="'+cmsText(d.name)+'" loading="lazy"><span>'+cmsText(d.name)+'</span></a>';}).join(""):'<p class="home-featured-empty">No featured dishes in this category yet.</p>');
 }
 $("hcats").innerHTML=C.categories.map(function(c){return '<button class="tab home-cat-tab" type="button" aria-pressed="false" data-category="'+cmsText(c.id)+'">'+cmsText(c.name)+'</button>'}).join("");
 $("hcats").addEventListener("click",function(e){var b=e.target.closest("[data-category]");if(!b)return;var cat=C.categories.find(function(c){return c.id===b.getAttribute("data-category")});if(!cat)return;$("hcats").querySelectorAll("[data-category]").forEach(function(x){x.setAttribute("aria-pressed",x===b?"true":"false")});showHomeCategory(cat);});
 if(C.categories.length)showHomeCategory(C.categories[0]);
}
/* ---------- menu page: chips, optional featured circles, complete priced list ---------- */
if(pg==="menu"){
 var cats=C.categories,hash=decodeURIComponent((location.hash||"").slice(1)),cur=hash;
 if(hash.indexOf("dish-")===0){var found=cats.find(function(c){return (c.dishes||[]).some(function(d){return d&&typeof d==="object"&&!Array.isArray(d)&&("dish-"+c.id+"-"+String(d.name||d.title||"").toLowerCase().trim().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,""))===hash;});});if(found)cur=found.id;}
 if(!cats.some(function(c){return c.id===cur}))cur=cats[0].id;
 function escapeMenu(value){return cmsText(value)}
 function featuredDish(raw){
  var d=Array.isArray(raw)?{name:raw[0],description:raw[1],price:raw[2],image:raw[3]}:(raw||{}),img=d.image||d.photo||d.cover,b=d.badge||{},badgeText=b.text||"Featured";
  return '<article class="menu-feature-circle">' +(img?'<img src="'+escapeMenu(cmsAsset(img))+'" alt="'+escapeMenu(d.name||d.title||"Menu dish")+'" loading="lazy">' :'<div class="menu-feature-placeholder">Hightable Gardens</div>')+'<span class="menu-circle-badge '+escapeMenu(b.shape||"price-tag")+' '+escapeMenu(b.animation||"")+'" style="background:'+escapeMenu(b.background||"#f5b324")+' ;color:'+escapeMenu(b.color||"#17130a")+';'+(b.width?'width:'+Number(b.width)+'px;':'')+(b.height?'height:'+Number(b.height)+'px;':'')+(b.fontSize?'font-size:'+Number(b.fontSize)+'px;':'')+(b.offsetX?'right:calc(4% + '+Number(b.offsetX)+'px);':'')+(b.offsetY?'top:calc(4% + '+Number(b.offsetY)+'px);':'')+'">'+escapeMenu(badgeText)+'</span><h3>'+escapeMenu(d.name||d.title||"")+'</h3></article>';
 }
 function menuListDish(raw){
  var d=Array.isArray(raw)?{name:raw[0],description:raw[1],price:raw[2],image:raw[3]}:(raw||{});
  var anchor="dish-"+cur+"-"+dishSlug(d.name||d.title);
  var dishName=String(d.name||d.title||"Menu item"),priceText=d.price!==undefined&&d.price!==null&&String(d.price)!==""?"KSh "+String(d.price):"Price on request",orderText="Hello Hightable Gardens, I’d like to order: "+dishName+" from "+String(cats.find(function(x){return x.id===cur})?.name||cur)+". Price: "+priceText+". Please confirm availability and delivery/pickup details.";return '<article class="it" id="'+escapeMenu(anchor)+'"><div class="l"><h4>'+escapeMenu(dishName)+'</h4><i></i><b>'+escapeMenu(priceText)+'</b></div>'+(d.description?'<p>'+escapeMenu(d.description)+'</p>':'')+'<a class="dish-order" href="'+wa+'?text='+encodeURIComponent(orderText)+'" target="_blank" rel="noopener">Order via WhatsApp <span aria-hidden="true">↗</span></a></article>';
 }
 function draw(){
  var c=cats.filter(function(x){return x.id===cur})[0];
  $('tabs').innerHTML=cats.map(function(x){return '<button class="tab" type="button" role="tab" aria-selected="'+(x.id===cur)+'" data-id="'+escapeMenu(x.id)+'">'+escapeMenu(x.name)+'</button>'}).join('');
  var dishes=(c.dishes||[]).filter(function(d){return !(d&&typeof d==="object"&&!Array.isArray(d)&&(d.available===false||d.showInList===false));});
  var featured=dishes.filter(function(d){return d&&typeof d==="object"&&!Array.isArray(d)&&d.featured===true;});
  $('menuFeatured').innerHTML=featured.length?'<div class="menu-feature-grid">'+featured.map(featuredDish).join('')+'</div>':'';
  $('mlist').innerHTML=dishes.length?dishes.map(menuListDish).join(''):'<div class="menu-empty">No dishes have been added to this category yet.</div>';
  var bg=c.background||c.background_image||c.cover;
  $('menuStage').style.backgroundImage=bg?'url("'+cmsAsset(bg)+'")':'';
  $('menuEyebrow').textContent=c.name+' · menu';
 }
 $('tabs').addEventListener('click',function(e){var id=e.target.getAttribute('data-id');if(id&&cats.some(function(c){return c.id===id})){cur=id;history.replaceState(null,'','#'+id);draw()}});
 draw();
 if(hash.indexOf("dish-")===0)setTimeout(function(){var target=document.getElementById(hash);if(target)target.scrollIntoView({behavior:"smooth",block:"center"});},150);
}
/* CMS-backed careers listings */
if(pg==="careers"){var todayCareer=new Date().toISOString().slice(0,10),jobs=(groups.careers||[]).map(function(r){return r.data||{};}).filter(function(d){return d.active!==false&&(!d.deadline||String(d.deadline)>=todayCareer);}).sort(function(a,b){return (Number(a.sort_order)||0)-(Number(b.sort_order)||0);});var jobGrid=$("careersGrid");if(jobGrid)jobGrid.innerHTML=jobs.length?jobs.map(function(d){var title=cmsText(d.title||"Open position"),desc=cmsText(d.description||""),department=cmsText(d.department||""),location=cmsText(d.location||"Narok"),type=cmsText(d.employment_type||""),deadline=cmsText(d.deadline||""),url=d.apply_url?cmsText(d.apply_url):"contact.html#talk";return '<article class="career-card"><div class="career-info">'+(department?'<span class="career-dept">'+department+'</span>':'')+'<h2>'+title+'</h2><p>'+desc+'</p><div class="career-meta">'+(type?'<span>'+type+'</span>':'')+'<span>'+location+'</span>'+(deadline?'<span>Apply by '+deadline+'</span>':'')+'</div><a class="career-cta" href="'+url+'"'+(d.apply_url?' target="_blank" rel="noopener"':'')+'>Apply / enquire</a></div></article>';}).join(""):'<div class="career-empty">There are no vacancies listed at the moment. Feel free to contact us to express your interest.</div>';}
/* CMS-backed public promotions */
if(pg==="promotions"){var todayPromo=new Date().toISOString().slice(0,10),offers=(groups.promotions||[]).map(function(r){return r.data||{};}).filter(function(d){return d.active!==false&&(!d.start_date||String(d.start_date)<=todayPromo)&&(!d.end_date||String(d.end_date)>=todayPromo);}).sort(function(a,b){return (Number(b.priority)||0)-(Number(a.priority)||0);});var promoGrid=$("promotionsGrid");if(promoGrid)promoGrid.innerHTML=offers.length?offers.map(function(d){var title=cmsText(d.title||"Special offer"),image=cmsText(cmsAsset(d.image||d.poster||d.cover)||"img/garden.jpg"),desc=cmsText(d.description||""),badge=d.badge_text?'<span class="promotion-badge">'+cmsText(d.badge_text)+'</span>':"",cta=cmsText(d.cta_text||"Discover offer"),href=cmsText(d.cta_link||"contact.html#talk");return '<article class="promotion-card" style="background-image:url(\''+image+'\')"><div class="promotion-overlay">'+badge+'<h2>'+title+'</h2><p>'+desc+'</p><a class="promotion-cta" href="'+href+'">'+cta+'</a></div></article>';}).join(""):'<div class="promotion-empty">No special offers right now. Please contact us for today’s experiences.</div>';}
/* CMS-backed public events */
if(pg==="events"){var rows=(groups.events||[]).map(function(r){return r.data||{};}).filter(function(d){if(d.active===false)return false;var today=new Date().toISOString().slice(0,10);return (!d.end_date||String(d.end_date)>=today);}).sort(function(a,b){return String(a.start_date||"").localeCompare(String(b.start_date||""));});var grid=$("eventsGrid");if(grid)grid.innerHTML=rows.length?rows.map(function(d){var title=cmsText(d.title||"Event at Hightable Gardens"),poster=cmsText(cmsAsset(d.poster||d.image||d.cover)||"img/garden.jpg"),desc=cmsText(d.description||""),date=cmsText(d.start_date||"Date to be announced"),time=cmsText(d.start_time||""),loc=cmsText(d.location||"Hightable Gardens, Narok"),price=d.price==null||String(d.price)===""?"Price on request":cmsText(d.price),href=d.booking_url?cmsText(d.booking_url):"contact.html#talk";return '<article class="event-card" style="background-image:url(\''+poster+'\')"><div class="event-frost"><h2>'+title+'</h2><p>'+desc+'</p><div class="event-meta"><span>'+date+'</span>'+(time?'<span>'+time+'</span>':'')+'<span>'+loc+'</span><span>'+price+'</span></div><a class="event-cta" href="'+href+'"'+(d.booking_url?' target="_blank" rel="noopener"':'')+'>'+(d.booking_url?'Book / tickets':'Enquire')+'</a></div></article>';}).join(""):'<div class="event-empty">No events are listed right now. Contact us to plan your occasion.</div>';}
/* ---------- gallery: image-led categories and lightbox ---------- 
if(pg==="gallery"){
 var galleryRows=(groups.gallery||[]).filter(function(row){return (row.data||{}).active!==false;}).sort(function(a,b){return (Number((a.data||{}).sort_order)||0)-(Number((b.data||{}).sort_order)||0);}).map(function(row){var d=row.data||{};return {image:cmsAsset(d.image||d.src||d.file),category:String(d.category||d.album||"The Gardens"),caption:String(d.caption||d.title||"Hightable Gardens")};}).filter(function(x){return x.image;});
 if(!galleryRows.length)C.photos.forEach(function(p,i){galleryRows.push({image:cmsAsset(p),category:i<4?"Food & Grill":i<8?"The Gardens":"Moments",caption:"Hightable Gardens"});});
 var albums={};galleryRows.forEach(function(p){(albums[p.category]||(albums[p.category]=[])).push(p);});
 $("gal").innerHTML=Object.keys(albums).map(function(name){var photos=albums[name];return '<button type="button" class="gallery-album" data-album="'+cmsText(name)+'" style="background-image:linear-gradient(0deg,rgba(8,9,10,.9),rgba(8,9,10,.05) 75%),url('+cmsText(photos[0].image)+')"><span class="gallery-album-meta"><b>'+cmsText(name)+'</b><span>'+photos.length+' '+(photos.length===1?'photo':'photos')+' <i aria-hidden="true">↗</i></span></span></button>';}).join("");
 var light=document.createElement("div");light.className="gallery-lightbox";light.hidden=true;light.innerHTML='<button type="button" class="gallery-close" aria-label="Close gallery">×</button><button type="button" class="gallery-prev" aria-label="Previous photo">‹</button><figure><img alt=""><figcaption></figcaption></figure><button type="button" class="gallery-next" aria-label="Next photo">›</button>';document.body.appendChild(light);
 var activeAlbum=[],activeIndex=0,img=light.querySelector("img"),caption=light.querySelector("figcaption");
 function showPhoto(i){activeIndex=(i+activeAlbum.length)%activeAlbum.length;img.src=activeAlbum[activeIndex].image;img.alt=activeAlbum[activeIndex].caption;caption.textContent=activeAlbum[activeIndex].caption;}
 $("gal").addEventListener("click",function(e){var b=e.target.closest("[data-album]");if(!b)return;activeAlbum=albums[b.getAttribute("data-album")]||[];if(activeAlbum.length){light.hidden=false;document.body.classList.add("gallery-open");showPhoto(0);}});
 light.addEventListener("click",function(e){if(e.target===light||e.target.closest(".gallery-close")){light.hidden=true;document.body.classList.remove("gallery-open");}else if(e.target.closest(".gallery-next"))showPhoto(activeIndex+1);else if(e.target.closest(".gallery-prev"))showPhoto(activeIndex-1);});
 document.addEventListener("keydown",function(e){if(light.hidden)return;if(e.key==="Escape"){light.hidden=true;document.body.classList.remove("gallery-open");}if(e.key==="ArrowRight")showPhoto(activeIndex+1);if(e.key==="ArrowLeft")showPhoto(activeIndex-1);});
 var play='<span class="pl"><svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg></span>';
 $("rls").innerHTML=C.videos.map(function(u,i){if(/\.(mp4|webm)(\?|$)/i.test(u))return '<video controls playsinline preload="metadata" src="'+u+'"></video>';var cv=C.videoCovers[i%C.videoCovers.length];return '<a class="rl" href="'+u+'" target="_blank" rel="noopener" style="background-image:linear-gradient(180deg,rgba(10,10,10,.25),rgba(10,10,10,.8)),url(img/'+cv+')">'+play+"<b>Watch reel</b><small>on "+(/instagram/.test(u)?"Instagram":"TikTok")+"</small></a>"}).join("");
}
/* ---------- contact ---------- */
if(pg==="contact"){
 try{var kenyaDateParts=new Intl.DateTimeFormat("en-CA",{timeZone:"Africa/Nairobi",year:"numeric",month:"2-digit",day:"2-digit"}).formatToParts(new Date()),kenyaToday=kenyaDateParts.filter(function(p){return p.type==="year"||p.type==="month"||p.type==="day";}).map(function(p){return p.value;}).join("-");$("d").min=kenyaToday}catch(e){}
 $("ct2").href="tel:+"+C.phone2;$("ce").href="mailto:"+C.email;$("ce").lastChild.textContent=C.email;
 var occasion=$("occasion"),customWrap=$("customOccasionWrap"),customInput=$("customOccasion");function syncCustom(){customWrap.hidden=occasion.value!=="Custom";customInput.required=occasion.value==="Custom";}occasion.addEventListener("change",syncCustom);syncCustom();
 $("f").addEventListener("submit",function(e){e.preventDefault();var kind=occasion.value==="Custom"?(customInput.value.trim()||"Custom"):occasion.value;var t="Hello Hightable Gardens, I’d like to reserve a table.\nOccasion: "+kind+"\nName: "+$("n").value+"\nDate: "+$("d").value+"\nTime: "+$("t").value+"\nGuests: "+$("g").value;$("msg").textContent="Opening WhatsApp…";window.open(wa+"?text="+encodeURIComponent(t),"_blank")});
 if(location.hash){var el=document.querySelector(location.hash);if(el)setTimeout(function(){el.scrollIntoView()},60)}
}
})();
