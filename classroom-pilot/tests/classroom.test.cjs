const {test}=require('node:test'),assert=require('node:assert/strict');
const {handler}=require('../functions/classroom.js');
const vars=['CLASSROOM_ENABLED','SUPABASE_URL','SUPABASE_SERVICE_ROLE_KEY'];
function env(){Object.assign(process.env,{CLASSROOM_ENABLED:'true',SUPABASE_URL:'https://example.supabase.co',SUPABASE_SERVICE_ROLE_KEY:'test-server-secret'});}
test('pilot fails closed before any Supabase request',async()=>{
 delete process.env.CLASSROOM_ENABLED;
 assert.equal((await handler({httpMethod:'POST',body:'{"action":"check"}'})).statusCode,503);
});
test('room control still requires a session token',async()=>{
 env();assert.equal((await handler({httpMethod:'POST',body:'{"action":"start","pin":"123456"}'})).statusCode,400);
});
test('host creates a game without a teacher key and never receives server credentials',async()=>{
 env();const original=global.fetch;let payload;
 global.fetch=async(url,options)=>{payload=JSON.parse(options.body);return {ok:true,json:async()=>({pin:payload.p_pin,phase:'lobby'})};};
 try{
  const response=await handler({httpMethod:'POST',body:JSON.stringify({action:'create',level:'N3',count:10})});
  assert.equal(response.statusCode,200);assert.equal(payload.p_data.questions.length,10);
  assert.ok(payload.p_data.questions.every(q=>!q.black&&q.pitch<=12));
  const result=JSON.parse(response.body);assert.match(result.token,/^[a-f0-9]{64}$/);assert.notEqual(result.token,payload.p_token);
  assert.ok(!response.body.includes('test-server-secret'));assert.ok(!response.body.includes('test-invite'));
 }finally{global.fetch=original;vars.forEach(key=>delete process.env[key]);}
});
test('database denies public access and atomically limits rooms and duplicate answers',()=>{
 const sql=require('node:fs').readFileSync(require('node:path').join(__dirname,'../schema.sql'),'utf8');
 assert.match(sql,/enable row level security/);assert.match(sql,/from public,anon,authenticated/);
 assert.match(sql,/for update/);assert.match(sql,/Answer already submitted/);assert.match(sql,/Pilot usage limit reached/);
});

test('pupil action waits for an active poll and prevents a duplicate click',async()=>{
 const html=require('node:fs').readFileSync(require('node:path').join(__dirname,'../../keyboard-classroom.html'),'utf8');
 const body=html.slice(html.indexOf(' async function act('),html.indexOf(' useEffect(()=>{let timeout;'));
 let release;const read=new Promise(resolve=>{release=resolve;});let calls=0,busy=false;
 const refs={session:{current:{pin:'123456',token:'test'}},inFlight:{current:true},actionPending:{current:false},pendingRead:{current:read}};
 const context={...refs,setBusy:value=>{busy=value;},setError:()=>{},request:async()=>{calls++;return {phase:'question'};},update:()=>{},setSelected:()=>{}};
 require('node:vm').runInNewContext(body+';this.act=act;',context);
 const answer=context.act('answer',{answer:'E',index:0});
 assert.equal(busy,true);assert.equal(calls,0);
 await context.act('answer',{answer:'E',index:0});
 release();await answer;
 assert.equal(calls,1);assert.equal(busy,false);assert.equal(refs.actionPending.current,false);
});

test('teacher customisation controls room questions, answers and C labels',async()=>{
 env();const original=global.fetch;let payload;
 global.fetch=async(url,options)=>{payload=JSON.parse(options.body);return {ok:true,json:async()=>({phase:'lobby'})};};
 try{
  const options={octaves:2,naturals:false,sharps:false,flats:true,enharmonics:true};
  const response=await handler({httpMethod:'POST',body:JSON.stringify({action:'create',level:'N5',options,showC:true,count:5})});
  assert.equal(response.statusCode,200);assert.deepEqual(payload.p_data.options,options);assert.equal(payload.p_data.showC,true);
  assert.ok(payload.p_data.allowedAnswers.every(answer=>answer.endsWith('b')));
  const K=require('../../keyboard-notes.js');
  const allowed=new Set(K.answers(options).map(a=>a.pitch));
  assert.ok(payload.p_data.questions.every(q=>allowed.has(q.pitch%12)));
 }finally{global.fetch=original;vars.forEach(key=>delete process.env[key]);}
});

test('empty or out-of-level classroom customisation is rejected before database access',async()=>{
 env();const original=global.fetch;let called=false;
 global.fetch=async()=>{called=true;throw Error('Unexpected database call');};
 try{
  for(const setup of [
   {level:'N5',options:{octaves:2,naturals:false,sharps:false,flats:false,enharmonics:true}},
   {level:'N3',options:{octaves:1,naturals:true,sharps:true,flats:false,enharmonics:false}},
   {level:'N5',options:{octaves:200,naturals:true,sharps:true,flats:true,enharmonics:false}},
  ])assert.equal((await handler({httpMethod:'POST',body:JSON.stringify({action:'create',...setup,count:5})})).statusCode,400);
  assert.equal(called,false);
 }finally{global.fetch=original;vars.forEach(key=>delete process.env[key]);}
});
