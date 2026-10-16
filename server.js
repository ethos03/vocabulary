const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const PORT = process.env.PORT || 3000;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin';
const ROOT = __dirname;
const DATA = path.join(ROOT, 'data.json');
const INDEX = path.join(ROOT, 'index.html');
const sessions = new Set();
function readData(){ try { return JSON.parse(fs.readFileSync(DATA,'utf8')); } catch { return {words:[], evaluations:[]}; } }
function writeData(d){ fs.writeFileSync(DATA, JSON.stringify(d,null,2)); }
function send(res,status,obj,headers={}){ const body=typeof obj==='string'?obj:JSON.stringify(obj); res.writeHead(status,{'Content-Type':typeof obj==='string'?'text/plain; charset=utf-8':'application/json; charset=utf-8','Access-Control-Allow-Origin':'*',...headers}); res.end(body); }
function body(req){ return new Promise((resolve,reject)=>{let b=''; req.on('data',c=>{b+=c;if(b.length>1e6) req.destroy();});req.on('end',()=>{try{resolve(b?JSON.parse(b):{})}catch(e){reject(e)}});}); }
function isAdmin(req){ const t=(req.headers.authorization||'').replace(/^Bearer\s+/,''); return t && sessions.has(t); }
function id(){ return crypto.randomUUID(); }
const server=http.createServer(async (req,res)=>{
  if(req.method==='OPTIONS'){res.writeHead(204,{'Access-Control-Allow-Origin':'*','Access-Control-Allow-Headers':'Content-Type, Authorization','Access-Control-Allow-Methods':'GET,POST,PUT,DELETE,OPTIONS'});return res.end();}
  const url=new URL(req.url,`http://${req.headers.host}`), p=url.pathname;
  try{
    if(p==='/api/login'&&req.method==='POST'){const b=await body(req); if(b.password!==ADMIN_PASSWORD)return send(res,401,{error:'Mot de passe incorrect.'}); const token=crypto.randomBytes(24).toString('hex');sessions.add(token);return send(res,200,{token});}
    if(p==='/api/words'&&req.method==='GET') return send(res,200,readData().words);
    if(p==='/api/words'&&['POST','PUT','DELETE'].includes(req.method)){
      if(!isAdmin(req))return send(res,403,{error:'Accès admin requis.'}); const d=readData();
      if(req.method==='POST'){const b=await body(req); if(!b.english||!b.translation)return send(res,400,{error:'anglais et français requis'});const w={id:id(),english:String(b.english).trim(),translation:String(b.translation).trim(),synonym:String(b.synonym||'').trim(),antonym:String(b.antonym||'').trim()};d.words.push(w);writeData(d);return send(res,201,w);}
      const ident=p.split('/')[3]; const i=d.words.findIndex(w=>w.id===ident); if(i<0)return send(res,404,{error:'Mot introuvable'});
      if(req.method==='DELETE')d.words.splice(i,1); else {const b=await body(req);d.words[i]={...d.words[i],...b,id:ident};} writeData(d); return send(res,200,d.words[i]||{ok:true});
    }
    if(p==='/api/evaluations'&&req.method==='GET') return send(res,200,readData().evaluations);
    if(p==='/api/evaluations'&&req.method==='POST'){if(!isAdmin(req))return send(res,403,{error:'Ajout des évaluations réservé à l’admin.'});const b=await body(req);if(!b.name||!b.date||!b.words)return send(res,400,{error:'nom, date et mots requis'});const d=readData();const e={id:id(),name:String(b.name).trim(),date:String(b.date),words:String(b.words).split(/[,;\n]/).map(x=>x.trim()).filter(Boolean)};d.evaluations.push(e);writeData(d);return send(res,201,e);}
    if(p==='/api/config'&&req.method==='GET')return send(res,200,{adminPasswordConfigured:true});
    if(p==='/api/health')return send(res,200,{ok:true});
    if(p==='/'||p==='/index.html')return send(res,200,fs.readFileSync(INDEX),{'Content-Type':'text/html; charset=utf-8'});
    return send(res,404,{error:'Not found'});
  }catch(e){console.error(e);send(res,500,{error:'Erreur serveur'});}
});
server.listen(PORT,()=>console.log(`Vocabulaire lancé sur http://localhost:${PORT} (mot de passe admin via ADMIN_PASSWORD, défaut: admin)`));
