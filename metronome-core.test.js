const test=require('node:test'),assert=require('node:assert/strict');
const M=require('./metronome-core.js');
test('tap tempo averages recent intervals and rejects interrupted tapping',()=>{
 assert.equal(M.tapTempo([0,500,1000,1500]),120);
 assert.equal(M.tapTempo([0,1000,2000]),60);
 assert.equal(M.tapTempo([0]),null);
 assert.equal(M.tapTempo([0,3000]),null);
});
test('settings clamp tempo and beats safely',()=>{
 assert.equal(M.settings({bpm:500}).bpm,240);
 assert.equal(M.settings({bpm:0,beats:0}).bpm,30);
 assert.equal(M.settings({bpm:0,beats:0}).beats,1);
 assert.equal(M.settings({subdivision:'bad'}).subdivision,'beat');
});
test('audio schedule keeps beats evenly spaced and accents only bar starts',()=>{
 const transport=new M.Transport(0,()=>({...M.defaults,bpm:120,beats:3}));
 const events=transport.take(0,3);
 assert.deepEqual(events.map(e=>e.time),[0,.5,1,1.5,2,2.5]);
 assert.deepEqual(events.map(e=>e.beat),[0,1,2,0,1,2]);
 assert.deepEqual(events.map(e=>e.accent),[true,false,false,true,false,false]);
});
test('triplets and asymmetric subdivisions retain the beat duration',()=>{
 for(const id of ['triplets','dotted','snap','semiquavers']){
  const transport=new M.Transport(0,()=>({...M.defaults,bpm:60,subdivision:id}));
  const events=transport.take(0,1.01);
  assert.deepEqual(events.slice(0,-1).map(e=>e.time),M.subdivisions[id].offsets);
  assert.equal(events.at(-1).time,1);
  assert.ok(events.slice(1,-1).every(e=>!e.accent));
 }
});
test('live tempo changes apply on next beat and delayed callbacks skip missed clicks',()=>{
 let bpm=120;
 const transport=new M.Transport(0,()=>({...M.defaults,bpm}));
 assert.equal(transport.take(0,.01)[0].time,0);
 bpm=60;
 assert.equal(transport.take(.5,.01)[0].time,.5);
 assert.equal(transport.take(1.5,.01)[0].time,1.5);
 const afterDelay=transport.take(10,.1);
 assert.equal(afterDelay.length,1);
 assert.equal(afterDelay[0].time,10.03);
});
