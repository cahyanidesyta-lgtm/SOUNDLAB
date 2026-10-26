'use strict';
// Tes akses API tanpa kredensial / koneksi Neon sungguhan.
const assert=require('node:assert/strict');
const path=require('node:path');

async function runRoute(rel,req,user,execute){
 const serverPath=require.resolve('../lib/server');
 const routePath=require.resolve('../'+rel);
 const originalServer=require.cache[serverPath];
 const originalRoute=require.cache[routePath];
 let captured=[];
 const fake={
  enabled:()=>true,
  sql:()=>async (literals,...params)=>{
   const query=literals.join('?');captured.push({query,params});
   return execute?execute(query,params):[];
  },
  getCurrentUser:async()=>user,
  json:(res,status,body)=>{res.status=status;res.body=body},
  validateOrigin:()=>true,
  createSession:()=> 'signed-session',
  setCookie:(res,token)=>{res.cookie=token},
  clearCookie:()=>{},
  hashPassword:()=> 'hashed-not-plaintext',
  checkPassword:()=>true
 };
 require.cache[serverPath]={id:serverPath,filename:serverPath,loaded:true,exports:fake};
 delete require.cache[routePath];
 try{const route=require(routePath);const res={};await route(req,res);return {res,captured}}
 finally{if(originalServer)require.cache[serverPath]=originalServer;else delete require.cache[serverPath];if(originalRoute)require.cache[routePath]=originalRoute;else delete require.cache[routePath]}
}
const uuid='11111111-1111-4111-8111-111111111111';
const guru={id:uuid,name:'Guru Uji',email:'guru@example.test',role:'guru'};
const siswa={id:'22222222-2222-4222-8222-222222222222',name:'Siswa Uji',email:'siswa@example.test',role:'siswa'};
(async()=>{
 let r;
 r=await runRoute('api/classes.js',{method:'GET'},null);
 assert.equal(r.res.status,401,'Tanpa login tidak boleh mengakses kelas');
 r=await runRoute('api/classes.js',{method:'GET'},{...guru,role:'admin'});
 assert.equal(r.res.status,403,'Role selain guru/siswa dibatasi');
 r=await runRoute('api/classes.js',{method:'POST',body:{action:'create',name:'VI A'}},siswa);
 assert.equal(r.res.status,403,'Siswa tidak boleh membuat kelas');
 r=await runRoute('api/classes.js',{method:'POST',body:{action:'join',code:'AABBCCDDEEFF'}},guru);
 assert.equal(r.res.status,403,'Guru tidak boleh menyamar sebagai siswa untuk bergabung');
 r=await runRoute('api/classes.js',{method:'POST',body:{action:'join',code:'123'}},siswa);
 assert.equal(r.res.status,400,'Format kode kelas harus divalidasi');
 r=await runRoute('api/classes.js',{method:'POST',body:{action:'create',name:'VI A'}},guru,(query)=>{
  if(query.includes('count(*)'))return [{total:0}];
  if(query.includes('INSERT INTO soundlab_classes'))return [{id:uuid,name:'VI A',join_code:'ABCDEF123456'}];
  return [];
 });
 assert.equal(r.res.status,201,'Guru harus dapat membuat kelas');
 assert.equal(r.res.body.class.join_code.length,12);
 assert(r.captured.some(c=>c.query.includes('teacher_id=?') && c.params.includes(guru.id)),'Create dibatasi teacher id');
 r=await runRoute('api/classes.js',{method:'POST',body:{action:'join',code:'abcdef123456'}},siswa,(query)=>{
  if(query.includes('SELECT id,name FROM soundlab_classes'))return [{id:uuid,name:'VI A'}];
  return [];
 });
 assert.equal(r.res.status,200,'Siswa harus bisa gabung kelas');
 assert(r.captured.some(c=>c.query.includes('INSERT INTO soundlab_class_students')&&c.params.includes(siswa.id)));
 r=await runRoute('api/classes.js',{method:'GET'},guru,()=>[]);
 assert.equal(r.res.status,200);
 assert.equal(r.captured.length,3);
 assert(r.captured.every(c=>c.params.includes(guru.id)),'Query dashboard guru harus difilter menurut guru');
 assert(!r.captured.some(c=>c.query.includes('password_hash')),'Tidak boleh mengambil hash password siswa');
 r=await runRoute('api/classes.js',{method:'GET'},siswa,()=>[]);
 assert.equal(r.res.status,200);
 assert.equal(r.captured.length,1);
 assert(r.captured[0].query.includes('cs.student_id=?'),'Siswa hanya melihat kelasnya sendiri');
 r=await runRoute('api/experiments.js',{method:'GET'},null);
 assert.equal(r.res.status,401);
 r=await runRoute('api/experiments.js',{method:'GET'},siswa,()=>[]);
 assert.equal(r.res.status,200);
 assert(r.captured[0].query.includes('WHERE user_id=?'));
 assert.equal(r.captured[0].params[0],siswa.id);
 r=await runRoute('api/auth.js',{method:'POST',body:{action:'register',role:'guru',email:'siswa@example.test',password:'abcdefgh',name:'Siswa Uji'}},null,query=>{
  if(query.includes('INSERT INTO soundlab_users'))return [siswa];
  return [];
 });
 assert.equal(r.res.status,200);
 assert(r.captured[0].query.includes("'siswa'"),'Registrasi tidak boleh menerima role guru dari klien');
 assert(!r.captured[0].query.includes('role=?'),'Role tidak boleh berasal dari parameter klien');
 console.log('Tes akses lulus: registrasi siswa, pembuatan kelas guru, join siswa, pembatasan riwayat, autentikasi.');
})().catch(e=>{console.error(e);process.exitCode=1});
