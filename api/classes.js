'use strict';
const {randomUUID, randomBytes}=require('node:crypto');
const {enabled,sql,getCurrentUser,json,validateOrigin}=require('../lib/server');

// Kelas milik guru; siswa hanya dapat melihat kelas yang diikutinya.
// Guru hanya dapat membaca hasil praktikum siswa yang masuk ke kelasnya.
module.exports=async(req,res)=>{
 if(!enabled())return json(res,503,{error:'Neon belum dikonfigurasi.'});
 let user;
 try{user=await getCurrentUser(req)}catch(error){console.error('Class session:',error);return json(res,500,{error:'Gagal memeriksa sesi.'})}
 if(!user)return json(res,401,{error:'Silakan masuk terlebih dahulu.'});
 if(!['guru','siswa'].includes(user.role))return json(res,403,{error:'Role tidak diizinkan untuk fitur kelas.'});
 const db=sql();
 try{
  if(req.method==='GET'){
   if(user.role==='guru'){
    const classes=await db`SELECT id,name,join_code,created_at FROM soundlab_classes WHERE teacher_id=${user.id} ORDER BY created_at DESC LIMIT 30`;
    const students=await db`SELECT cs.class_id,u.id AS student_id,u.name AS student_name,u.email AS student_email,
      count(e.id)::int AS experiment_count
      FROM soundlab_class_students cs
      JOIN soundlab_classes c ON c.id=cs.class_id
      JOIN soundlab_users u ON u.id=cs.student_id AND u.role='siswa'
      LEFT JOIN soundlab_experiments e ON e.user_id=u.id
      WHERE c.teacher_id=${user.id}
      GROUP BY cs.class_id,u.id,u.name,u.email ORDER BY u.name LIMIT 500`;
    const recent=await db`SELECT c.id AS class_id,e.id,e.lab,e.summary,e.result,e.timestamp,
      u.name AS student_name
      FROM soundlab_experiments e
      JOIN soundlab_users u ON u.id=e.user_id AND u.role='siswa'
      JOIN soundlab_class_students cs ON cs.student_id=u.id
      JOIN soundlab_classes c ON c.id=cs.class_id
      WHERE c.teacher_id=${user.id}
      ORDER BY e.timestamp DESC LIMIT 100`;
    return json(res,200,{classes,students,recent});
   }
   const classes=await db`SELECT c.id,c.name,u.name AS teacher_name,cs.joined_at
     FROM soundlab_class_students cs
     JOIN soundlab_classes c ON c.id=cs.class_id
     JOIN soundlab_users u ON u.id=c.teacher_id
     WHERE cs.student_id=${user.id} ORDER BY cs.joined_at DESC LIMIT 30`;
   return json(res,200,{classes});
  }
  if(req.method!=='POST')return json(res,405,{error:'Method not allowed'});
  if(!validateOrigin(req))return json(res,403,{error:'Origin tidak diizinkan'});
  const data=req.body||{};
  if(data.action==='create' && user.role==='guru'){
   const name=String(data.name||'').trim();
   if(name.length<2||name.length>80)return json(res,400,{error:'Nama kelas harus 2–80 karakter.'});
   const count=await db`SELECT count(*)::int AS total FROM soundlab_classes WHERE teacher_id=${user.id}`;
   if(count[0]?.total>=20)return json(res,403,{error:'Maksimal 20 kelas per guru.'});
   const id=randomUUID(),code=randomBytes(6).toString('hex').toUpperCase();
   const created=await db`INSERT INTO soundlab_classes (id,teacher_id,name,join_code)
      VALUES (${id},${user.id},${name},${code}) RETURNING id,name,join_code`;
   return json(res,201,{class:created[0]});
  }
  if(data.action==='join' && user.role==='siswa'){
   const code=String(data.code||'').trim().toUpperCase();
   if(!/^[A-Z0-9]{12}$/.test(code))return json(res,400,{error:'Kode kelas harus 12 karakter.'});
   const matching=await db`SELECT id,name FROM soundlab_classes WHERE join_code=${code} LIMIT 1`;
   if(!matching.length)return json(res,404,{error:'Kode kelas tidak ditemukan.'});
   await db`INSERT INTO soundlab_class_students (class_id,student_id)
       VALUES (${matching[0].id},${user.id}) ON CONFLICT DO NOTHING`;
   return json(res,200,{class:matching[0]});
  }
  return json(res,403,{error:'Aksi tidak diizinkan untuk role pengguna.'});
 }catch(error){console.error('Classes:',error);return json(res,500,{error:'Gagal mengakses kelas di database.'})}
};
