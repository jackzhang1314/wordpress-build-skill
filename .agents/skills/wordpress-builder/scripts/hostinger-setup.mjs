// Portable with the Skill bundle; no repository paths or credential output.
import {execFileSync} from 'node:child_process';
import {pathToFileURL} from 'node:url';
import {resolve} from 'node:path';
const execute=(name,args,timeout=30000)=>execFileSync(name,args,{encoding:'utf8',stdio:['ignore','pipe','pipe'],timeout,maxBuffer:4*1024*1024});
export function setupHostinger({install=false,connect=false,platform=process.platform,run=execute}={}){
 const report={scope:'hostinger-tool-bootstrap',platform,cli:'missing',installation:'not-requested',account:'not-checked',mcp:'optional-not-installed',deployment:'not-executed'};
 const probe=()=>{try{const v=run('hostinger',['version']);report.cli='available';report.version=v.trim();return true;}catch(error){report.cli=error.code==='ENOENT'?'missing':'not-working';return false;}};
 if(!probe()){
  if(report.cli!=='missing'){report.next='Inspect existing CLI installation; do not overwrite it automatically';return report;}
  if(!install){report.next='Run with --install to install the official CLI when needed';return report;}
  let brew=false;if(['darwin','linux'].includes(platform)){try{run('brew',['--version']);brew=true;}catch{/* No supported package manager. */}}
  if(!brew){report.installation='official-release-required';report.next='Install the matching official binary from https://github.com/hostinger/api-cli/releases, verify its release checksum, add it to PATH, then rerun. No system package manager is installed automatically.';return report;}
  try{run('brew',['install','hostinger/tap/hostinger'],180000);report.installation='installed';}catch{report.installation='failed';report.next='Review Homebrew locally; raw output withheld';return report;}
  if(!probe()){report.next='Installation finished but CLI is not on PATH or not working';return report;}
 }
 if(connect){
  try{const result=JSON.parse(run('hostinger',['hosting','orders','list','--format','json'],60000));if(!result||typeof result!=='object'||'message' in result||'error' in result)throw new Error('Unexpected API response');report.account='hosting-orders-readable';report.next='Confirm account ownership, plan and target before deployment';}
  catch{report.account='login-or-api-check-incomplete';report.next='Complete official browser sign-in if prompted, then rerun --connect. If authorization still fails, check a stale HOSTINGER_API_TOKEN or local config without printing secrets. Network/API errors may also cause this state.';}
 }else report.next='Run --connect for a read-only account check; this may open official browser sign-in';
 return report;
}
if(process.argv[1]&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href){
 const args=process.argv.slice(2);if(args.some(a=>!['--install','--connect'].includes(a)))throw new Error('Usage: hostinger-setup.mjs [--install] [--connect]');
 const report=setupHostinger({install:args.includes('--install'),connect:args.includes('--connect')});console.log(JSON.stringify(report,null,2));
 if(report.cli!=='available'||(args.includes('--connect')&&report.account!=='hosting-orders-readable'))process.exitCode=1;
}
