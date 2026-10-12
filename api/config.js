const {enabled,json}=require('../lib/server');
module.exports=(req,res)=>{if(req.method!=='GET')return json(res,405,{error:'Method not allowed'});json(res,200,{enabled:enabled(),provider:enabled()?'neon':'demo'})};
