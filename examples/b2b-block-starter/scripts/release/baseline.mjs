// Derive incremental change paths from a saved baseline instead of manual input.
// Accepted baselines: a local inventory snapshot ({shape:'local-inventory',files:{path:sha}})
// or the Hostinger read-only report produced by scripts/hostinger/theme-baseline.mjs.
import {readFile} from 'node:fs/promises';
import {join,resolve} from 'node:path';
import {createHash} from 'node:crypto';
import {themeInventory} from './theme-diff.mjs';
import {OVERRIDE_PATH_PATTERN} from './overrides.mjs';
const digest=data=>createHash('sha256').update(data).digest('hex');
const safeRelativePath=path=>typeof path==='string'&&!path.startsWith('/')&&path.split('/').every(seg=>seg&&seg!=='.'&&seg!=='..'&&/^[a-zA-Z0-9._-]+$/.test(seg));
const isSha256=value=>typeof value==='string'&&/^[a-f0-9]{64}$/.test(value);
export function loadBaselineFiles(report){
 if(!report||typeof report!=='object'||Array.isArray(report))throw new Error('Baseline report must be a JSON object');
 if(report.files!==undefined){
  if(typeof report.files!=='object'||report.files===null||Array.isArray(report.files))throw new Error('files must be a path-to-SHA-256 map');
  for(const [path,fileHash] of Object.entries(report.files)){
   if(!safeRelativePath(path))throw new Error('Unexpected baseline path: '+String(path));
   if(!isSha256(fileHash))throw new Error('Invalid SHA-256 for '+path);
  }
  return {shape:'local-inventory',files:{...report.files},normalized:[],unverified:[]};
 }
 if(report.remoteResponseHashes!==undefined){
  const {remoteResponseHashes}=report;
  if(typeof remoteResponseHashes!=='object'||remoteResponseHashes===null||Array.isArray(remoteResponseHashes))throw new Error('remoteResponseHashes must be a path-to-SHA-256 map');
  for(const [path,fileHash] of Object.entries(remoteResponseHashes)){
   if(!safeRelativePath(path))throw new Error('Unexpected baseline path: '+String(path));
   if(!isSha256(fileHash))throw new Error('Invalid remote SHA-256 for '+path);
  }
  const normalized=report.normalizedFinalNewlineMatches??[],unverified=report.unverified??[];
  if(!Array.isArray(normalized)||!Array.isArray(unverified)||!normalized.every(safeRelativePath)||!unverified.every(safeRelativePath))throw new Error('normalizedFinalNewlineMatches and unverified must be arrays of safe relative paths');
  return {shape:'hostinger-baseline',files:{...remoteResponseHashes},normalized:[...normalized],unverified:[...unverified]};
 }
 throw new Error('Baseline must contain a files inventory or a Hostinger remoteResponseHashes map');
}
async function strippedHash(file){
 const data=await readFile(file);
 return digest(data.at(-1)===10?data.subarray(0,-1):data);
}
async function extendedHash(file){
 const data=await readFile(file);
 return digest(Buffer.concat([data,Buffer.from('\n')]));
}
export async function deriveBaselineChanges(baselineReport,candidateDir){
 const baseline=loadBaselineFiles(baselineReport);
 const candidate=await themeInventory(candidateDir);
 const unverified=new Set(baseline.unverified);
 const changes=[];
 for(const path of [...new Set([...Object.keys(baseline.files),...Object.keys(candidate)])].sort()){
  if(unverified.has(path))continue;
  const before=baseline.files[path],after=candidate[path];
  if(before===undefined){changes.push({path,kind:'candidate-added'});continue;}
  if(after===undefined){changes.push({path,kind:'candidate-deleted'});continue;}
  if(before===after)continue;
  if(await strippedHash(join(resolve(candidateDir),path))===before)continue;
  if(await extendedHash(join(resolve(candidateDir),path))===before)continue;
  changes.push({path,kind:'modified'});
 }
 const overridePaths=[...new Set(changes.map(change=>change.path).filter(path=>OVERRIDE_PATH_PATTERN.test(path)))];
 return {shape:baseline.shape,candidateFiles:Object.keys(candidate).length,baselineFiles:Object.keys(baseline.files).length,changes,overridePaths,unverified:baseline.unverified,requiresPageRegression:changes.some(change=>!OVERRIDE_PATH_PATTERN.test(change.path))};
}
