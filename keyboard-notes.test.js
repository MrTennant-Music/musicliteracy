const test = require('node:test');
const assert = require('node:assert/strict');
const K = require('./keyboard-notes.js');
test('natural-note level marks only white keys and offers seven names', () => {
  assert.equal(K.answers(K.defaults.N3).length, 7);
  assert.ok(K.pool(K.defaults.N3).every(key => !key.black));
  assert.deepEqual(K.keys.filter(key => !key.black).map(key => key.pitch), [0,2,4,5,7,9,11,12,14,16,17,19,21,23,24]);
});
test('black keys occupy the two-and-three pattern and accept sharp or flat names', () => {
  assert.deepEqual(K.keys.filter(key => key.black).map(key => key.pitch), [1,3,6,8,10,13,15,18,20,22]);
  const answers = K.answers(K.defaults.N5);
  const expected = {'C#':1,Db:1,'D#':3,Eb:3,'F#':6,Gb:6,'G#':8,Ab:8,'A#':10,Bb:10};
  for (const [id,pitch] of Object.entries(expected)) {
    assert.equal(answers.find(a=>a.id===id).pitch,pitch);
    assert.ok(K.correct(answers.find(a=>a.id===id),{pitch:pitch+12}));
  }
  assert.equal(answers.length,17);
});
test('enharmonic white-key names wrap correctly at octave boundaries', () => {
  const answers = K.answers({...K.defaults.N5, enharmonics:true});
  for (const [id,pitch] of Object.entries({'E#':5,'B#':0,Cb:11,Fb:4})) {
    assert.ok(K.correct(answers.find(a=>a.id===id),{pitch}));
  }
  assert.equal(answers.length,21);
});
test('custom groups restrict both questions and names, avoiding immediate repeats', () => {
  const options={naturals:false,sharps:false,flats:true,enharmonics:false};
  assert.deepEqual(K.answers(options).map(a=>a.id),['Db','Eb','Gb','Ab','Bb']);
  for(let index=0;index<100;index++){
    const key=K.question(options,1,()=>index/100);
    assert.notEqual(key.pitch,1);
    assert.ok(key.black);
    assert.ok(K.answers(options).some(a=>K.correct(a,key)));
  }
  assert.throws(()=>K.question({}),/Select at least one/);
});

test('National 3 has a single octave and later levels have two', () => {
  assert.deepEqual(K.pool(K.defaults.N3).map(key => key.pitch), [0,2,4,5,7,9,11,12]);
  assert.equal(K.visibleKeys(K.defaults.N3).length, 13);
  assert.equal(K.visibleKeys(K.defaults.N4).length, 25);
  assert.equal(K.visibleKeys(K.defaults.N5).length, 25);
  assert.deepEqual(K.subtitles, {N3:'One octave',N4:'Two octaves',N5:'Tones, semitones, accidentals — flats, sharps and naturals'});
});
