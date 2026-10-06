const {test}=require('node:test'),assert=require('node:assert/strict');
const {handler}=require('../functions/classroom.js');
const vars=['CLASSROOM_ENABLED','SUPABASE_URL','SUPABASE_SERVICE_ROLE_KEY','CLASSROOM_HOST_KEY'];
function env(){Object.assign(process.env,{CLASSROOM_ENABLED:'true',SUPABASE_URL:'https://example.supabase.co',SUPABASE_SERVICE_ROLE_KEY:'test-server-secret',CLASSROOM_HOST_KEY:'test-invite'});}
test('pilot fails closed before any Supabase request',async()=>{
 delete process.env.CLASSROOM_ENABLED;
 assert.equal((await handler({httpMethod:'POST',body:'{"action":"check"}'})).statusCode,503);
});
test('host creation requires the private teacher key',async()=>{
 env();assert.equal((await handler({httpMethod:'POST',body:'{"action":"create","hostKey":"wrong"}'})).statusCode,403);
});
test('server creates level-correct questions and never returns server credentials',async()=>{
 env();const original=global.fetch;let payload;
 global.fetch=async(url,options)=>{payload=JSON.parse(options.body);return {ok:true,json:async()=>({pin:payload.p_pin,phase:'lobby'})};};
 try{
  const response=await handler({httpMethod:'POST',body:JSON.stringify({action:'create',hostKey:'test-invite',level:'N3',count:10})});
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
