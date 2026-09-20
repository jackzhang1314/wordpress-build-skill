import {z} from 'zod';
import type {ConnectionStatus} from './apify';
import {publicUrl} from './seo-advanced';
import {seoHash} from './dataforseo';
const key='agent-connection-wordpress-v1';
const schema=z.object({url:publicUrl.refine(v=>v.startsWith('https://')&&!new URL(v).search&&!new URL(v).hash),username:z.string().trim().min(1).max(100).refine(v=>!v.includes(':')&&!/[\r\n]/.test(v)),password:z.string().min(1).max(2048),checkedAt:z.string().optional()});
async function area(){await chrome.storage.local.setAccessLevel({accessLevel:'TRUSTED_CONTEXTS'});return chrome.storage.local;}
async function read(){return schema.safeParse((await(await area()).get(key))[key]);}
export async function saveWordpress(url:string,username:string,password:string){await(await area()).set({[key]:schema.parse({url:url.replace(/\/+$/,''),username,password})});}
export async function removeWordpress(){await(await area()).remove(key);}
export async function wordpressStatus():Promise<ConnectionStatus>{const v=await read();return {configured:v.success,checkedAt:v.success?v.data.checkedAt:undefined};}
export class WordpressError extends Error {constructor(readonly status:number){super(`WordPress HTTP ${status}，请检查应用密码、权限与站点 REST API。`);}}
export type WpMethod='GET'|'POST'|'OPTIONS';
export async function wordpressConnection(){
 const saved=await read();if(!saved.success)throw new Error('请先在连接器配置 WordPress 站点和应用密码。');const config=saved.data;
 const identity=await seoHash(JSON.stringify([config.url,config.username,config.password]));
 const auth=`Basic ${btoa(Array.from(new TextEncoder().encode(`${config.username}:${config.password}`),b=>String.fromCharCode(b)).join(''))}`;
 // Paths are built by typed adapters, never accepted as arbitrary URLs from an Agent.
 const api=async(path:string,signal:AbortSignal,method:WpMethod='GET',body?:object|FormData)=>{
  const [pathname]=path.split('?');
  if(!pathname||(!/^\/(?:wp\/v2|wp-abilities\/v1)(?:\/[a-zA-Z0-9_-]+)*\/?$/.test(pathname)&&!/^\/wp\/v2\/template-parts\/[a-zA-Z0-9_-]+\/\/[a-zA-Z0-9_-]+$/.test(pathname)&&pathname!=='/octopus/v1/site')||path.includes('#')||/[\r\n\\]/.test(path))throw new Error('不支持的 WordPress 路径。');
  const current=await read();if(!current.success||current.data.password!==config.password||current.data.url!==config.url||current.data.username!==config.username)throw new Error('WordPress 配置已更改。');
  const multipart=body instanceof FormData;
  let response:Response;try{response=await fetch(`${config.url}/wp-json${path}`,{method,headers:{Authorization:auth,...(multipart?{}:{'Content-Type':'application/json'})},body:body?(multipart?body:JSON.stringify(body)):undefined,credentials:'omit',redirect:'error',signal:AbortSignal.any([signal,AbortSignal.timeout(60000)])});}catch{throw new Error('WordPress 请求中断，保存结果可能未知，请先核对后台，不重复创建文章。');}
  if(!response.ok)throw new WordpressError(response.status);
  const text=await response.text();if(text.length>4000000)throw new Error('WordPress 响应超出读取范围。');
  try{return JSON.parse(text) as unknown;}catch{throw new Error('WordPress 响应格式异常。');}
 };
 return {identity,site:config.url,api,request:async(path:string,signal:AbortSignal,body?:object)=>{
  if(!/^\/(?:users\/me|posts(?:\/[1-9]\d*)?)(?:\?[^#]*)?$/.test(path))throw new Error('不支持的 WordPress 路径。');
  return api(`/wp/v2${path}`,signal,body?'POST':'GET',body);
 }};
}
export async function testWordpress(){const connection=await wordpressConnection();await connection.request('/users/me',new AbortController().signal);const saved=await read();if(!saved.success||(await wordpressConnection()).identity!==connection.identity)throw new Error('配置已更改。');await(await area()).set({[key]:{...saved.data,checkedAt:new Date().toISOString()}});return wordpressStatus();}
