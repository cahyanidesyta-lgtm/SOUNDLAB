'use strict';
const {randomUUID}=require('node:crypto');
const {enabled,sql,getSession,createSession,setCookie,clearCookie,json,validateOrigin,hashPassword,checkPassword}=require('../lib/server');
module.exports=async(req,res)=>{
 if(!enabled())return json(res,503,{error:'Neon belum diatur. Isi DATABASE_URL dan SESSION_SECRET di Vercel.'});
 if(req.method==='GET'){if(req.query.action!=='me')return json(res,405,{error:'Action tidak valid'});const user=getSession(req);return json(res,200,{user:user?{id:user.id,name:user.name,email:user.email,role:user.role}:null})}
 if(req.method!=='POST')return json(res,405,{error:'Method not allowed'});
 if(!validateOrigin(req))return json(res,403,{error:'Origin tidak diizinkan'});
 try{
   const data=req.body||{},action=String(data.action||'');
   if(action==='logout'){clearCookie(res);return json(res,200,{ok:true})}
   const email=String(data.email||'').trim().toLowerCase(),password=String(data.password||'');
   if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)||email.length>254)return json(res,400,{error:'Format email tidak valid.'});
   if(password.length<8||password.length>128)return json(res,400,{error:'Kata sandi harus 8–128 karakter.'});
   const db=sql();let user;
   if(action==='register'){
     const name=String(data.name||'').trim().slice(0,80);
     if(name.length<2)return json(res,400,{error:'Nama minimal 2 karakter.'});
     const passhash=hashPassword(password);
     const created=await db`INSERT INTO soundlab_users (id, name, email, password_hash, role) VALUES (${randomUUID()}, ${name}, ${email}, ${passhash}, 'siswa') RETURNING id,name,email,role`;
     user=created[0];
   } else if(action==='login'){
     const users=await db`SELECT id,name,email,role,password_hash FROM soundlab_users WHERE email=${email} LIMIT 1`;
     if(!users.length||!checkPassword(password,users[0].password_hash))return json(res,401,{error:'Email atau kata sandi salah.'});
     user=users[0];
   } else return json(res,400,{error:'Aksi tidak valid.'});
   setCookie(res,createSession(user));return json(res,200,{user:{id:user.id,name:user.name,email:user.email,role:user.role}});
 }catch(error){if(error.code==='23505')return json(res,409,{error:'Email sudah terdaftar.'});console.error('Auth:',error);return json(res,500,{error:'Gangguan server autentikasi. Periksa tabel database.'})}
};
