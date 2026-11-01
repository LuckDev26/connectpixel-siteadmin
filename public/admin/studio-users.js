/* ConnectPixel Studio user administration and password rotation.
 * No credentials in localStorage, sessionStorage or the URL.
 */
(()=>{
"use strict";
const by=id=>document.getElementById(id);
const escape=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const roleNames={owner:"Proprietário",admin:"Administrador",editor:"Editor",viewer:"Visualizador"};
const defaultPermissions={
 viewer:["site.read"],editor:["site.read","site.edit","portfolio.edit","media.read"],
 admin:["site.read","site.edit","portfolio.edit","media.read","publish","users.manage"]
};
let current=null;
const json=async (url,opts={})=>{
 const res=await fetch(url,{credentials:"same-origin",cache:"no-store",...opts,headers:{"Content-Type":"application/json",...(opts.headers||{})}});
 const out=await res.json().catch(()=>({}));
 if(!res.ok)throw new Error(out.error||"Falha na operação ("+res.status+")");
 return out;
};
const announce=(msg)=>{if(by("studioUsersStatus"))by("studioUsersStatus").textContent=msg;};
function controlsMarkup(u){
 if(u.role==="owner")return '<span class="studio-user-meta">Acesso principal protegido</span>';
 const choices=Object.entries(roleNames).filter(([k])=>k!=="owner"&&(current?.role==="owner"||k!=="admin"))
   .map(([key,label])=>'<option value="'+key+'" '+(u.role===key?'selected':'')+'>'+label+'</option>').join("");
 return '<select aria-label="Perfil de '+escape(u.username)+'" data-studio-role="'+escape(u.id)+'">'+choices+'</select>'+
 '<label class="studio-user-active"><input type="checkbox" data-studio-active="'+escape(u.id)+'" '+(u.active?'checked':'')+'> Ativo</label>';
}
window.cpStudioUserReady=function(user){
 current=user;
 const nav=by("studioUsersNav");
 if(nav){
  const canManage=user?.role==="owner"||user?.role==="admin"||(user?.permissions||[]).includes("users.manage");
  nav.hidden=!canManage;nav.style.display=canManage?"":"none";
 }
 if(user?.role==="admin"){
   const op=by("studioNewRole")?.querySelector('option[value="admin"]');
   if(op)op.remove();
 }
 if(user?.role==="owner"||user?.role==="admin"){
   const tab=by("studioUsersNav");
   tab?.addEventListener("click",()=>window.cpStudioRefreshUsers(),{once:true});
 }
};
window.cpStudioRefreshUsers=async function(){
 try{
  announce("Carregando usuários...");
  const result=await json("/api/admin/users");
  const list=by("studioUsersList");if(!list)return;
  list.innerHTML=(result.users||[]).map(u=>'<div class="studio-user-row"><div><div class="studio-user-name">'+escape(u.username)+'</div><div class="studio-user-meta">'+escape(u.email)+' · '+escape(roleNames[u.role]||u.role)+(u.mustChangePassword?' · Senha provisória':'')+'</div></div><div class="studio-user-controls">'+controlsMarkup(u)+'</div></div>').join('');
  if(!result.users?.length)list.textContent="Nenhum usuário cadastrado.";
  announce(result.users?.length+" usuário(s) cadastrado(s).");
  for(const sel of list.querySelectorAll("[data-studio-role]"))sel.addEventListener("change",async e=>{
    try{await json("/api/admin/users/"+encodeURIComponent(sel.dataset.studioRole),{method:"PATCH",body:JSON.stringify({role:sel.value})});announce("Perfil atualizado.");await window.cpStudioRefreshUsers();}
    catch(err){announce(err.message);await window.cpStudioRefreshUsers();}
  });
  for(const checkbox of list.querySelectorAll("[data-studio-active]"))checkbox.addEventListener("change",async()=>{
    try{await json("/api/admin/users/"+encodeURIComponent(checkbox.dataset.studioActive),{method:"PATCH",body:JSON.stringify({active:checkbox.checked})});announce("Situação do usuário atualizada.");}
    catch(err){announce(err.message);checkbox.checked=!checkbox.checked;}
  });
 }catch(e){announce(e.message);}
};
window.cpStudioInviteUser=async function(){
 const username=by("studioNewUsername")?.value.trim().toLowerCase();
 const email=by("studioNewEmail")?.value.trim().toLowerCase();
 const role=by("studioNewRole")?.value;
 if(!/^[a-z0-9._-]{3,40}$/.test(username||""))return announce("O usuário precisa ter de 3 a 40 caracteres, sem espaços.");
 if(!email||!email.includes("@"))return announce("Informe um e-mail válido.");
 try{
  announce("Criando acesso...");
  const result=await json("/api/admin/users/invite",{method:"POST",body:JSON.stringify({username,email,role})});
  const block=by("studioTemporaryPassword");
  block.hidden=false;
  block.innerHTML='<strong>Acesso criado. Copie a senha provisória agora.</strong><p class="small">Por segurança, ela só aparece nesta tela uma vez. O novo usuário deverá alterá-la ao entrar.</p><code id="studioOneTimePassword">'+escape(result.temporaryPassword)+'</code><button type="button" class="btn ghost" id="studioCopyTemporary">Copiar senha provisória</button>';
  by("studioCopyTemporary")?.addEventListener("click",async()=>{
   try{await navigator.clipboard.writeText(result.temporaryPassword);announce("Senha provisória copiada.");}
   catch{announce("Selecione e copie o código exibido acima.");}
  });
  by("studioNewUsername").value="";by("studioNewEmail").value="";
  announce("Usuário criado. Compartilhe a senha provisória por um canal seguro.");
  await window.cpStudioRefreshUsers();
 }catch(err){announce(err.message);}
};
window.cpStudioRequirePasswordChange=function(){
 const modal=by("studioPasswordDialog");if(!modal)return;
 if(!modal.open)modal.showModal();
};
function initialize(){
 const form=by("studioPasswordForm");
 if(!form)return;
 form.addEventListener("submit",async e=>{
   e.preventDefault();
   const oldPassword=by("studioCurrentPassword").value,newPassword=by("studioNextPassword").value;
   const status=by("studioPasswordStatus");
   status.textContent="";
   try{
    await json("/api/admin/change-password",{method:"POST",body:JSON.stringify({oldPassword,newPassword})});
    by("studioCurrentPassword").value="";by("studioNextPassword").value="";
    by("studioPasswordDialog")?.close();
    if(window.cpStudioSessionUser)window.cpStudioSessionUser.mustChangePassword=false;
    status.textContent="Senha atualizada.";
    if(typeof loadAll==="function")await loadAll();
   }catch(err){status.textContent=err.message;}
 });
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",initialize,{once:true});else initialize();
})();
