// Authenticated wp-admin REST session for the sanctioned Hostinger site.
// testcookie login, admin-ajax rest-nonce, bounded re-login on nonce expiry.
import assert from 'node:assert/strict';
import {setTimeout as delay} from 'node:timers/promises';
export async function restSession(base,login,password){
 const jar=new Map();
 const cookie=()=>[...jar.entries()].map(([k,v])=>k+'='+v).join('; ');
 const absorb=res=>{for(const c of res.headers.getSetCookie()){const pair=c.split(';')[0];const i=pair.indexOf('=');jar.set(pair.slice(0,i).trim(),pair.slice(i+1).trim());}};
 const loginOnce=async()=>{
  jar.clear();
  let res=await fetch(base+'/wp-login.php',{redirect:'manual'});absorb(res);
  res=await fetch(base+'/wp-login.php',{method:'POST',redirect:'manual',headers:{Cookie:cookie(),'Content-Type':'application/x-www-form-urlencoded'},body:`log=${encodeURIComponent(login)}&pwd=${encodeURIComponent(password)}&redirect_to=${encodeURIComponent(base+'/wp-admin/')}&testcookie=1`});
  absorb(res);assert.equal(res.status,302,'wp-login did not redirect after POST');
  res=await fetch(base+'/wp-admin/',{headers:{Cookie:cookie()}});absorb(res);
  assert.ok(res.ok&&(await res.text()).includes('wpadminbar'),'wp-admin login failed');
  const nonceRes=await fetch(base+'/wp-admin/admin-ajax.php?action=rest-nonce',{headers:{Cookie:cookie()}});
  const nonce=(await nonceRes.text()).trim();
  assert.match(nonce,/^[a-f0-9]{10}$/,'REST nonce endpoint returned unexpected payload');
  return nonce;
 };
 let nonce=await loginOnce();
 const request=async(path,{method='GET',body,retry=true}={})=>{
  let res;
  for(let attempt=1;;attempt++){
   try{
    res=await fetch(base+'/wp-json/'+path,{method,headers:{Cookie:cookie(),'X-WP-Nonce':nonce,'Content-Type':'application/json'},body:body===undefined?undefined:JSON.stringify(body)});
    break;
   }catch(error){
    const code=error?.cause?.code??error?.code;
    const connectPhase=code==='UND_ERR_CONNECT_TIMEOUT'||code==='ECONNREFUSED';
    const idempotent=method==='GET'||method==='HEAD';
    const readError=code==='ECONNRESET'||code==='UND_ERR_SOCKET'||code==='UND_ERR_ABORTED';
    if(attempt>=3||!(connectPhase||(idempotent&&readError)))throw error;
    await delay(2000*attempt);
   }
  }
  if(res.status===403&&retry&&/nonce/.test(await res.clone().text().catch(()=>''))){
   nonce=await loginOnce();
   return request(path,{method,body,retry:false});
  }
  return res;
 };
 return {
  api:async path=>{const r=await request(path);assert.equal(r.status,200,path+': '+r.status);return r.json();},
  request,
 };
}
