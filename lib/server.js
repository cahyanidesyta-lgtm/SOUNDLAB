'use strict';
const crypto=require('node:crypto');
function enabled(){return Boolean(process.env.DATABASE_URL && process.env.SESSION_SECRET && process.env.SESSION_SECRET.length>=32)}
function sql(){if(!enabled())throw new Error('Neon belum dikonfigurasi.');const {neon}=require('@neondatabase/serverless');return neon(process.env.DATABASE_URL)}
const base64=x=>Buffer.from(x).toString('base64url');
function sign(value){return crypto.createHmac('sha256',process.env.SESSION_SECRET).update(value).digest('base64url')}
function createSession(user){const p=base64(JSON.stringify({id:user.id,name:user.name,email:user.email,role:user.role,exp:Date.now()+7*86400000}));return p+'.'+sign(p)}
function getSession(req){try{if(!enabled())return null;const cookies=(req.headers.cookie||'').split(';').map(x=>x.trim());const tok=cookies.find(x=>x.startsWith('sl_session='))?.slice(11);if(!tok)return null;const [payload,sig]=tok.split('.');if(!payload||!sig)return null;const a=Buffer.from(sig,'base64url'),b=Buffer.from(sign(payload),'base64url');if(a.length!==b.length||!crypto.timingSafeEqual(a,b))return null;const user=JSON.parse(Buffer.from(payload,'base64url').toString('utf8'));if(!user.id||Date.now()>user.exp)return null;return user}catch(_){return null}}
// Periksa role di PostgreSQL pada SETIAP request: perubahan hak akses langsung berlaku.
async function getCurrentUser(req){
 const session=getSession(req);
 if(!session)return null;
 const users=await sql()`SELECT id,name,email,role FROM soundlab_users WHERE id=${session.id} LIMIT 1`;
 return users[0]||null;
}
function setCookie(res,token){res.setHeader('Set-Cookie',`sl_session=${token}; HttpOnly; Path=/; SameSite=Lax; Max-Age=${7*86400}; ${process.env.VERCEL?'Secure; ':''}`)}
function clearCookie(res){res.setHeader('Set-Cookie',`sl_session=; HttpOnly; Path=/; SameSite=Lax; Max-Age=0; ${process.env.VERCEL?'Secure; ':''}`)}
function json(res,status,body){res.statusCode=status;res.setHeader('Content-Type','application/json; charset=utf-8');res.setHeader('Cache-Control','no-store');res.end(JSON.stringify(body))}
function validateOrigin(req){const origin=req.headers.origin;if(!origin)return true;try{return new URL(origin).host===(req.headers['x-forwarded-host']||req.headers.host)}catch(_){return false}}
function hashPassword(password,salt=crypto.randomBytes(16).toString('hex')){const hash=crypto.scryptSync(password,salt,64).toString('hex');return salt+':'+hash}
function checkPassword(password,stored){try{const [salt,hex]=stored.split(':');const test=Buffer.from(crypto.scryptSync(password,salt,64).toString('hex'),'hex');const saved=Buffer.from(hex,'hex');return test.length===saved.length&&crypto.timingSafeEqual(test,saved)}catch(_){return false}}
module.exports={enabled,sql,getSession,getCurrentUser,createSession,setCookie,clearCookie,json,validateOrigin,hashPassword,checkPassword};
