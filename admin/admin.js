(function(){
"use strict";
const API="/api/admin/";
const names={
 menu_categories:"Menu categories",menu_items:"Menu items",events:"Events",promotions:"Promotions",
 gallery:"Gallery",homepage_content:"Homepage content",site_settings:"Site settings",circles:"Rotating circles"
};
let collection="menu_categories",records=[];
const $=id=>document.getElementById(id);
async function call(path,options){
 const response=await fetch(API+path,{credentials:"same-origin",cache:"no-store",...options,headers:{"content-type":"application/json",...(options&&options.headers||{})}});
 let data={};try{data=await response.json()}catch(e){}
 if(!response.ok)throw new Error(data.error||"Request failed ("+response.status+").");
 return data;
}
function showWorkspace(){ $("login").hidden=true;$("workspace").hidden=false;renderNav();loadRecords(); }
async function checkSession(){try{const r=await call("session");if(r.authenticated)showWorkspace();}catch(e){$("loginMessage").textContent=e.message;}}
function renderNav(){
 $("nav").innerHTML="";
 Object.keys(names).forEach(key=>{
  const b=document.createElement("button");b.textContent=names[key];b.className=key===collection?"active":"";
  b.addEventListener("click",()=>{collection=key;renderNav();loadRecords();$("recordForm").hidden=true;});
  $("nav").appendChild(b);
 });
}
async function loadRecords(){
 $("sectionTitle").textContent=names[collection];
 $("records").innerHTML='<div class="empty">Loading content…</div>';
 try{
  const data=await call("records?collection="+encodeURIComponent(collection));
  records=data.records||[];renderRecords();
 }catch(e){$("records").innerHTML='<div class="empty">'+escapeHtml(e.message)+'</div>';}
}
function renderRecords(){
 const host=$("records");host.innerHTML="";
 if(!records.length){host.innerHTML='<div class="empty">No records yet. Select “Add new” to create the first one.</div>';return;}
 records.forEach(record=>{
  const row=document.createElement("div");row.className="record";
  const info=document.createElement("div"),title=document.createElement("strong"),meta=document.createElement("small");
  title.textContent=record.title||record.data.name||record.data.title||"Untitled record";
  meta.textContent=(record.active?"Visible":"Hidden")+" · "+record.id;
  info.append(title,meta);
  const actions=document.createElement("div"),edit=document.createElement("button"),del=document.createElement("button");
  edit.textContent="Edit";edit.addEventListener("click",()=>editRecord(record));
  del.textContent="Delete";del.className="delete";del.addEventListener("click",()=>deleteRecord(record));
  actions.append(edit,del);row.append(info,actions);host.appendChild(row);
 });
}
function editRecord(record){
 $("recordId").value=record?record.id:"";
 $("recordJson").value=JSON.stringify(record?record.data:defaultData(),null,2);
 $("saveMessage").textContent="";$("recordForm").hidden=false;
 $("recordForm").scrollIntoView({behavior:"smooth",block:"start"});
}
function defaultData(){
 const defaults={
 menu_categories:{name:"New category",slug:"new-category",description:"",cover:"",sort_order:0,active:true},
 menu_items:{name:"New dish",description:"",price:"",category_id:"",image:"",featured:false,available:true,sort_order:0,active:true},
 events:{title:"New event",description:"",poster:"",start_date:"",end_date:"",start_time:"",location:"Hightable Gardens, Narok",price:"",booking_url:"",contact:"",active:true},
 promotions:{title:"New offer",description:"",image:"",badge_text:"",start_date:"",end_date:"",placement:"homepage",priority:0,active:true},
 gallery:{title:"",image:"",category:"",sort_order:0,active:true},
 homepage_content:{section:"hero",title:"",subtitle:"",body:"",image:"",active:true},
 site_settings:{key:"phone",value:""},
 circles:{title:"New circle",image:"",description:"",link:"",sort_order:0,active:true,badge:{enabled:false,text:"",background:"#f5b324",color:"#17130a",shape:"price-tag",animation:"wobble"}}
 };
 return defaults[collection]||{};
}
async function deleteRecord(record){
 if(!confirm("Delete “"+(record.title||record.id)+"”? This cannot be undone."))return;
 try{await call("record?collection="+encodeURIComponent(collection)+"&id="+encodeURIComponent(record.id),{method:"DELETE"});await loadRecords();}
 catch(e){alert(e.message);}
}
$("loginForm").addEventListener("submit",async e=>{
 e.preventDefault();$("loginMessage").textContent="Signing in…";
 try{await call("login",{method:"POST",body:JSON.stringify({password:$("password").value})});$("password").value="";showWorkspace();}
 catch(err){$("loginMessage").textContent=err.message;}
});
$("logout").addEventListener("click",async()=>{try{await call("logout",{method:"POST",body:"{}"});}finally{$("workspace").hidden=true;$("login").hidden=false;}});
$("newRecord").addEventListener("click",()=>editRecord(null));
$("cancelEdit").addEventListener("click",()=>{$("recordForm").hidden=true;});
$("recordForm").addEventListener("submit",async e=>{
 e.preventDefault();let data;
 try{data=JSON.parse($("recordJson").value);}catch(err){$("saveMessage").textContent="JSON error: "+err.message;return;}
 $("saveMessage").textContent="Saving…";
 try{
  await call("record",{method:"POST",body:JSON.stringify({id:$("recordId").value||undefined,collection,data})});
  $("saveMessage").textContent="Saved successfully."; $("recordForm").hidden=true;await loadRecords();
 }catch(err){$("saveMessage").textContent=err.message;}
});
function escapeHtml(value){return String(value).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
checkSession();
})();