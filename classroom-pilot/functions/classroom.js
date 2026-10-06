'use strict';
const crypto=require('node:crypto');
const K=require('../../keyboard-notes.js');
const hash=value=>crypto.createHash('sha256').update(value).digest('hex');
const reply=(statusCode,value)=>({statusCode,headers:{'Content-Type':'application/json','Cache-Control':'no-store'},body:JSON.stringify(value)});
exports.handler=async event=>{
 if(event.httpMethod!=='POST')return reply(405,{error:'Use POST.'});
 if(process.env.CLASSROOM_ENABLED!=='true')return reply(503,{error:'Classroom pilot is switched off. Individual practice is still available.'});
 if(!process.env.SUPABASE_URL||!process.env.SUPABASE_SERVICE_ROLE_KEY)return reply(503,{error:'Classroom pilot has not been configured.'});
 if(event.body?.length>4096)return reply(413,{error:'Request too large.'});
 try{
  const input=JSON.parse(event.body||'{}'),action=input.action;
  if(!['check','create','join','read','start','answer','reveal','next','end'].includes(action))return reply(400,{error:'Unknown action.'});
  let pin=String(input.pin||''),token=String(input.token||''),data={};
  if(action!=='check'&&action!=='create'&&!/^\d{6}$/.test(pin))return reply(400,{error:'Enter a six-digit game PIN.'});
  if(action==='create'){
   const settings=K.classroomSettings({level:input.level,options:input.options||K.defaults[input.level],showC:input.showC});
   if(!settings)return reply(400,{error:'Return to individual practice and choose valid game settings.'});
   const {level,options,showC}=settings;
   const count=Math.max(5,Math.min(20,Number(input.count)||10));
   const questions=[];let previous=null;
   for(let i=0;i<count;i++){const q=K.question(options,previous);questions.push(q);previous=q.pitch;}
   pin=String(crypto.randomInt(100000,1000000));token=crypto.randomBytes(32).toString('hex');
   data={phase:'lobby',level,options,showC,questions,allowedAnswers:K.answers(options).map(a=>a.id),index:0};
  }else if(action!=='check'){
   if(!/^[a-f0-9]{64}$/.test(token))return reply(400,{error:'Please rejoin this game.'});
   if(action==='join'){const name=String(input.name||'').trim();if(!name||name.length>24)return reply(400,{error:'Use a nickname of 1–24 characters.'});data={name};}
   if(action==='answer'){
    // Validate the submitted note; grading happens inside the atomic database transaction.
    const answer=K.answers({naturals:true,sharps:true,flats:true,enharmonics:true}).find(a=>a.id===input.answer);
    if(!answer||!Number.isInteger(input.index))return reply(400,{error:'Choose a valid note.'});
    data={answer:answer.id,pitch:answer.pitch,index:input.index};
   }
  }
  const response=await fetch(process.env.SUPABASE_URL+'/rest/v1/rpc/keyboard_pilot',{method:'POST',headers:{apikey:process.env.SUPABASE_SERVICE_ROLE_KEY,Authorization:'Bearer '+process.env.SUPABASE_SERVICE_ROLE_KEY,'Content-Type':'application/json'},body:JSON.stringify({p_action:action,p_pin:pin,p_token:hash(token),p_data:data}),signal:AbortSignal.timeout(8000)});
  const result=await response.json();
  if(!response.ok)return reply(400,{error:result.code==='23505'?'Please try creating the game again.':result.code==='P0001'?result.message:'Classroom service unavailable. Use individual practice.'});
  return reply(200,action==='create'?{...result,token}:result);
 }catch{return reply(503,{error:'Cannot connect to the classroom service. Use individual practice or retry.'});}
};
