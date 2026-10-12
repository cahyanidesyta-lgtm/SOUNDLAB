'use strict';
const {randomUUID}=require('node:crypto');
const {enabled,sql,getSession,json,validateOrigin}=require('../lib/server');
module.exports=async(req,res)=>{
 if(!enabled())return json(res,503,{error:'Database belum dikonfigurasi.'});
 const user=getSession(req);if(!user)return json(res,401,{error:'Harus masuk terlebih dahulu.'});
 const db=sql();
 try{
   if(req.method==='GET'){
     const rows=await db`SELECT id, lab, timestamp, summary, result, parameters, calculations FROM soundlab_experiments WHERE user_id=${user.id} ORDER BY timestamp DESC LIMIT 300`;
     return json(res,200,{items:rows});
   }
   if(!validateOrigin(req))return json(res,403,{error:'Origin tidak diizinkan'});
   if(req.method==='POST'){
     const data=req.body||{};
     if(![1,2,3,4].includes(Number(data.lab)))return json(res,400,{error:'Laboratorium tidak valid'});
     const summary=String(data.summary||'').slice(0,400),result=String(data.result||'').slice(0,400);
     const parameters=JSON.stringify(data.parameters||{}),calculations=JSON.stringify(data.calculations||{});
     if(parameters.length>12000||calculations.length>12000)return json(res,413,{error:'Data terlalu besar.'});
     const id=randomUUID();
     await db`INSERT INTO soundlab_experiments (id,user_id,lab,summary,result,parameters,calculations) VALUES (${id},${user.id},${Number(data.lab)},${summary},${result},${parameters}::jsonb,${calculations}::jsonb)`;
     return json(res,201,{id});
   }
   if(req.method==='DELETE'){
     const id=String(req.query.id||'');if(!/^[0-9a-f-]{36}$/i.test(id))return json(res,400,{error:'ID tidak valid'});
     const deleted=await db`DELETE FROM soundlab_experiments WHERE id=${id} AND user_id=${user.id} RETURNING id`;
     return json(res,deleted.length?200:404,{ok:deleted.length>0});
   }
   return json(res,405,{error:'Method not allowed'});
 }catch(error){console.error('Experiments:',error);return json(res,500,{error:'Kesalahan database. Pastikan schema.sql telah dijalankan.'})}
};
