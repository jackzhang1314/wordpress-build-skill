// Development-only TLS proxy. Binds loopback, never changes system DNS/trust.
import {createServer as tlsServer} from 'node:https';
import {createServer,request} from 'node:http';
import {readFile} from 'node:fs/promises';
import {resolve} from 'node:path';
if(!process.argv[2])throw new Error('Provide private fixture directory.');
const dir=resolve(process.argv[2]),control=JSON.parse(await readFile(dir+'/control.json','utf8'));
const tls=tlsServer({key:await readFile(dir+'/key.pem'),cert:await readFile(dir+'/cert.pem')},(req,res)=>{
 if(req.headers.host!=='wp-agent.test'){res.writeHead(403).end();return;}
 const upstream=request({hostname:'127.0.0.1',port:9418,path:req.url,method:req.method,headers:{...req.headers,'x-forwarded-proto':'https'}},reply=>{res.writeHead(reply.statusCode??502,reply.headers);reply.pipe(res);});
 upstream.on('error',()=>res.writeHead(502).end());req.pipe(upstream);
});
let seeded=false;
const bootstrap=createServer(async(req,res)=>{
 const origin='chrome-extension://'+control.id;
 if(req.headers.origin&&req.headers.origin!==origin){res.writeHead(403).end();return;}
 res.setHeader('Access-Control-Allow-Origin',origin);res.setHeader('Cache-Control','no-store');
 if(req.method==='GET'&&req.url==='/bootstrap/'+control.token&&!seeded){seeded=true;res.setHeader('Content-Type','application/json');res.end(await readFile(dir+'/wordpress.json'));return;}
 res.writeHead(404).end();
});
tls.listen(9443,'127.0.0.1',()=>console.log('Isolated WordPress TLS listener ready'));
bootstrap.listen(4548,'127.0.0.1',()=>console.log('Single-use extension bootstrap ready'));
