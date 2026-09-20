import { z } from 'zod';
import type { ConnectionStatus } from './apify';
import { seoHash } from './dataforseo';
const key='agent-connection-google-v1';
const configSchema=z.object({clientId:z.string().regex(/^[a-zA-Z0-9-]+\.apps\.googleusercontent\.com$/).optional(),apiKey:z.string().regex(/^[A-Za-z0-9_-]{10,200}$/).optional(),token:z.string().optional(),expiresAt:z.number().optional(),scopes:z.array(z.string()).default([]),nonce:z.string().optional(),checkedAt:z.string().optional(),cruxCheckedAt:z.string().optional()}).refine(v=>!!v.clientId||!!v.apiKey);
export const googleScopes={search:'https://www.googleapis.com/auth/webmasters.readonly',mailRead:'https://www.googleapis.com/auth/gmail.readonly',mailSend:'https://www.googleapis.com/auth/gmail.send'} as const;
async function area(){await chrome.storage.local.setAccessLevel({accessLevel:'TRUSTED_CONTEXTS'});return chrome.storage.local;}
async function read(){const value=(await(await area()).get(key))[key];return configSchema.safeParse(value);}
export async function saveGoogle(clientId:string,apiKey?:string){const parsed=configSchema.parse({...(clientId.trim()?{clientId:clientId.trim()}:{}),...(apiKey?.trim()?{apiKey:apiKey.trim()}:{}),scopes:[]});await(await area()).set({[key]:parsed});}
export async function removeGoogle(){await(await area()).remove(key);}
export async function googleStatus():Promise<ConnectionStatus>{const v=await read();return {configured:v.success,checkedAt:v.success&&v.data.expiresAt&&v.data.expiresAt>Date.now()?v.data.checkedAt:v.success?v.data.cruxCheckedAt:undefined};}
export async function authorizeGoogle(mode:'search'|'mail'|'both'){
 const saved=await read();if(!saved.success||!saved.data.clientId)throw new Error('先保存 Google OAuth Client ID。');
 const scopes=mode==='search'?[googleScopes.search]:mode==='mail'?[googleScopes.mailRead,googleScopes.mailSend]:Object.values(googleScopes);
 const nonce=crypto.randomUUID(),config={...saved.data,nonce};await(await area()).set({[key]:config});
 const redirect=chrome.identity.getRedirectURL('google');
 const url=new URL('https://accounts.google.com/o/oauth2/v2/auth');url.search=new URLSearchParams({client_id:saved.data.clientId,redirect_uri:redirect,response_type:'token',scope:scopes.join(' '),state:nonce,prompt:'consent'}).toString();
 const returned=await chrome.identity.launchWebAuthFlow({url:url.href,interactive:true});
 if(!returned)throw new Error('Google 授权未完成。');
 const response=new URL(returned),expected=new URL(redirect),params=new URLSearchParams(response.hash.slice(1));
 if(response.origin!==expected.origin||response.pathname!==expected.pathname||params.get('state')!==nonce)throw new Error('Google 授权回调校验失败。');
 const token=params.get('access_token'),seconds=Number(params.get('expires_in')),granted=(params.get('scope')??'').split(' ');
 if(!token||!Number.isFinite(seconds)||seconds<=0||!scopes.every(scope=>granted.includes(scope)))throw new Error('Google 未授予所选权限。');
 const current=await read();if(!current.success||current.data.nonce!==nonce)throw new Error('授权配置已更改，请重新连接。');
 await(await area()).set({[key]:{...config,nonce:undefined,token,expiresAt:Date.now()+seconds*1000,scopes:granted,checkedAt:new Date().toISOString()}});
 return googleStatus();
}
export async function googleConnection(scope:string){
 const saved=await read();if(!saved.success||!saved.data.token||!saved.data.expiresAt||saved.data.expiresAt<=Date.now()+30000||!saved.data.scopes.includes(scope))throw new Error('Google 授权缺失、权限不足或已到期，请在设置 → 连接器 → Google 重新授权。');
 const config=saved.data,identity=await seoHash(JSON.stringify([config.clientId,config.token]));
 return {identity,request:async(path:string,signal:AbortSignal,body?:object)=>{
  const allowed=/^https:\/\/www\.googleapis\.com\/webmasters\/v3\/sites(?:\/[^/]+\/searchAnalytics\/query)?$/.test(path)||path==='https://searchconsole.googleapis.com/v1/urlInspection/index:inspect'||/^https:\/\/gmail\.googleapis\.com\/gmail\/v1\/users\/me\/(?:profile|messages\/send|messages(?:\?[^#]*)?|messages\/[a-zA-Z0-9]+(?:\?[^#]*)?)$/.test(path);
  if(!allowed)throw new Error('不支持的 Google API 地址。');
  const current=await read();if(!current.success||current.data.token!==config.token)throw new Error('Google 授权已更改。');
  signal.throwIfAborted();
  let response:Response;try{response=await fetch(path,{method:body?'POST':'GET',headers:{Authorization:`Bearer ${config.token}`,'Content-Type':'application/json'},body:body?JSON.stringify(body):undefined,credentials:'omit',redirect:'error',signal:AbortSignal.any([signal,AbortSignal.timeout(60000)])});}catch{throw new Error('Google 请求中断；发送结果可能未知，请核对记录，不重复发送。');}
  if(!response.ok)throw new Error(`Google API HTTP ${response.status}；请检查授权、权限与配额。`);
  const text=await response.text();if(text.length>4000000)throw new Error('Google 响应超出本次读取范围。');
  try{return JSON.parse(text.replaceAll(config.token!,'[REDACTED]')) as unknown;}catch{throw new Error('Google 响应格式异常。');}
 }};
}
export async function testGoogle(){const saved=await read();if(!saved.success)throw new Error('尚未配置 Google。');if(!saved.data.token&&saved.data.apiKey){await cruxRequest('https://example.com/',new AbortController().signal);const current=await read();if(!current.success||current.data.apiKey!==saved.data.apiKey)throw new Error('配置已更改，请重新测试。');await(await area()).set({[key]:{...current.data,cruxCheckedAt:new Date().toISOString()}});return googleStatus();}const scope=saved.data.scopes.includes(googleScopes.search)?googleScopes.search:googleScopes.mailRead;await(await googleConnection(scope)).request(scope===googleScopes.search?'https://www.googleapis.com/webmasters/v3/sites':'https://gmail.googleapis.com/gmail/v1/users/me/profile',new AbortController().signal);return googleStatus();}
export async function cruxRequest(url:string,signal:AbortSignal){const saved=await read();if(!saved.success||!saved.data.apiKey)throw new Error('请在 Google 连接器配置启用了 Chrome UX Report API 的 API Key。');
 const response=await fetch('https://chromeuxreport.googleapis.com/v1/records:queryRecord',{method:'POST',headers:{'Content-Type':'application/json','X-Goog-Api-Key':saved.data.apiKey},body:JSON.stringify({url,formFactor:'PHONE'}),credentials:'omit',redirect:'error',signal:AbortSignal.any([signal,AbortSignal.timeout(60000)])});
 if(response.status===404)return {available:false,note:'CrUX 未覆盖此 URL，不等于体验良好或流量为零。'};if(!response.ok)throw new Error(`CrUX HTTP ${response.status}，检查 API Key 与配额。`);return {available:true,data:await response.json() as unknown};
}
