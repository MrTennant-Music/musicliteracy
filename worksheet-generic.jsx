const { useEffect: useGenericEffect, useMemo: useGenericMemo, useRef: useGenericRef, useState: useGenericState } = React;

(() => {
  const CONFIG = (() => { try { return JSON.parse(sessionStorage.getItem("worksheetSourceConfig") || "null"); } catch { return null; } })();
  if (!CONFIG || CONFIG.version !== 1 || CONFIG.activityId === "intervals") return;

  const DEFINITIONS = {
    enharmonics: { title: "Enharmonic Equivalents", subtitle: "Identify and rewrite enharmonic equivalent notes.", icon: "enharmonic-icon.svg", instructions: "Write the enharmonic equivalent of each note.", response: "stave" },
    keysig: { title: "Key Signatures", subtitle: "Identify key signatures.", icon: "key-signatures-icon.svg", instructions: "Identify the key signatures shown below.", response: "mixed" },
    notenaming: { title: "Note Identification", subtitle: "Identify note names in the treble and bass clef.", icon: "notenaming-icon.svg", instructions: "Name each note shown below.", response: "text" },
    tonic: { title: "Scale Degrees", subtitle: "Identify tonic, subdominant and dominant notes.", icon: "scale-degrees-icon.svg", instructions: "Circle the requested scale degree in each melody.", response: "mark" },
    transposing: { title: "Transposing", subtitle: "Transpose between the treble and bass clefs.", icon: "transposing-icon.svg", instructions: "Rewrite each example at the requested pitch.", response: "stave" },
    barlines: { title: "Barlines", subtitle: "Insert barlines at the correct place in the music.", icon: "barlines-icon.svg", instructions: "Insert the missing barlines in each example.", response: "mark", large: true },
    rests: { title: "Rests", subtitle: "Identify and apply rests.", icon: "rests-icon.svg", instructions: "Write the missing rest in each outlined space.", response: "stave" },
    rhythmsums: { title: "Rhythm Sums", subtitle: "Calculate rhythm values.", icon: "rhythm-sums-icon.svg", instructions: "Calculate the total number of beats in each sum.", response: "text" },
    timesig: { title: "Time Signatures", subtitle: "Identify time signatures.", icon: "time-signatures-icon.svg", instructions: "Identify or insert the time signatures shown below.", response: "text", large: true },
    triplets: { title: "Triplets", subtitle: "Identify quaver triplets and crotchet triplets.", icon: "triplets-icon.svg", instructions: "Mark each group of three notes and identify the triplet type.", response: "text", large: true },
    accidentals: { title: "Accidentals", subtitle: "Identify and apply flats, sharps and naturals.", icon: "accidentals-icon.svg", instructions: "Identify tones and semitones or write the requested note.", response: "mixed" },
    chords: { title: "Chords", subtitle: "Identify, create and apply chords in music.", icon: "chords-icon.svg", instructions: "Name or complete the chords shown below.", response: "mixed" },
    articulation: { title: "Articulation Markings", subtitle: "Identify and apply staccatos, slurs, accents and phrase markings.", icon: "articulation-markings-icon.svg", instructions: "Explain or apply the articulation markings shown below.", response: "mixed" },
    missingnotes: { title: "Melodic Dictation", subtitle: "Identify and complete melodic patterns.", icon: "insert-missing-notes-icon.svg", instructions: "Complete each musical pattern in the blank bar.", response: "stave", large: true },
    practicequestions: { title: "Practice Questions", subtitle: "Complete exam-style questions combining multiple music literacy concepts.", icon: "practice-app-icon.svg", instructions: "Complete the mixed music literacy questions below.", response: "mixed" },
  };
  const DEF = DEFINITIONS[CONFIG.activityId];
  if (!DEF) return;
  const LEVEL_NAMES = { N3: "National 3", N4: "National 4", N5: "National 5", H: "Higher", AH: "Advanced Higher", Custom: "Custom" };
  const level = CONFIG.settings?.level || "Custom";
  const random = (items) => items[Math.floor(Math.random() * items.length)];
  const NOTES = [0,1,2,3,4,5,6,7,8];
  const NOTE_NAMES = ["E", "F", "G", "A", "B", "C", "D", "E", "F"];
  const KEYS = ["C major", "G major", "F major", "D major", "B♭ major", "A minor", "E minor", "D minor"];
  const KEYSIG_WORKSHEET_KEYS={
    "c-major":{id:"c-major",label:"C major",signature:[],tonicStep:-2},
    "a-minor":{id:"a-minor",label:"A minor",signature:[],tonicStep:3,leadingStep:2},
    "g-major":{id:"g-major",label:"G major",signature:[{type:"sharp",step:8}],tonicStep:2},
    "f-major":{id:"f-major",label:"F major",signature:[{type:"flat",step:4}],tonicStep:1},
    "d-major":{id:"d-major",label:"D major",signature:[{type:"sharp",step:8},{type:"sharp",step:5}],tonicStep:-1},
    "bb-major":{id:"bb-major",label:"B flat major",signature:[{type:"flat",step:4},{type:"flat",step:7}],tonicStep:4},
    "e-minor":{id:"e-minor",label:"E minor",signature:[{type:"sharp",step:8}],tonicStep:0,leadingStep:6},
    "d-minor":{id:"d-minor",label:"D minor",signature:[{type:"flat",step:4}],tonicStep:-1,leadingStep:5},
  };
  const KEYSIG_LEVEL_KEYS={N5:["c-major","a-minor","g-major","f-major"],AH:["c-major","a-minor","g-major","f-major","d-major","bb-major","e-minor","d-minor"]};
  const MISSING_NOTES_PATTERNS={
    "2/4":[["crotchet","crotchet"],["minim"],["quaver","quaver","crotchet"]],
    "3/4":[["crotchet","crotchet","crotchet"],["minim","crotchet"],["crotchet","minim"],["quaver","quaver","crotchet","crotchet"]],
    "4/4":[["crotchet","crotchet","crotchet","crotchet"],["minim","crotchet","crotchet"],["crotchet","crotchet","minim"],["semibreve"],["quaver","quaver","crotchet","minim"]],
  };
  const MISSING_NOTES_RHYTHM_SPACING={semibreve:3.4,minim:2.15,crotchet:1.35,quaver:.95};
  function missingNotesBarPositions(rhythms,start,end,{first=false,final=false}={}){
    const scoreStart=start+(first?4:15), scoreEnd=end-(final?24:4);
    const units=rhythms.reduce((sum,rhythm)=>sum+(MISSING_NOTES_RHYTHM_SPACING[rhythm]||1.35),0);
    const unit=Math.max(1,scoreEnd-scoreStart)/Math.max(1,units);
    let cursor=scoreStart+unit*.38;
    return rhythms.map(rhythm=>{const x=cursor;cursor+=(MISSING_NOTES_RHYTHM_SPACING[rhythm]||1.35)*unit;return x;});
  }
  const WORKSHEET_RHYTHMS = {
    semibreve:{symbolKey:"wholeNote",beats:4}, "dotted-minim":{symbolKey:"halfNoteStemUp",beats:3},
    minim:{symbolKey:"halfNoteStemUp",beats:2}, "dotted-crotchet":{symbolKey:"quarterNoteStemUp",beats:1.5},
    crotchet:{symbolKey:"quarterNoteStemUp",beats:1}, "dotted-quaver":{symbolKey:"eighthNoteStemUp",beats:.75},
    quaver:{symbolKey:"eighthNoteStemUp",beats:.5}, semiquaver:{symbolKey:"eighthNoteStemUp",beats:.25},
    "two-quavers":{symbolKey:"eighthNoteStemUp",beats:1}, "four-semiquavers":{symbolKey:"eighthNoteStemUp",beats:1},
    "dotted-quaver-semiquaver":{symbolKey:"eighthNoteStemUp",beats:1}, "scotch-snap":{symbolKey:"eighthNoteStemUp",beats:1},
    "triplet-quavers":{symbolKey:"eighthNoteStemUp",beats:1}, "triplet-crotchets":{symbolKey:"quarterNoteStemUp",beats:2},
  };
  const N5_WORKSHEET_CHORDS = [
    { answer:"C major", notes:[{step:-2,letter:"C"},{step:0,letter:"E"},{step:2,letter:"G"}] },
    { answer:"F major", notes:[{step:1,letter:"F"},{step:3,letter:"A"},{step:5,letter:"C"}] },
    { answer:"G major", notes:[{step:2,letter:"G"},{step:4,letter:"B"},{step:6,letter:"D"}] },
    { answer:"A minor", notes:[{step:3,letter:"A"},{step:5,letter:"C"},{step:7,letter:"E"}] },
  ];
  const N5_CHORD_RHYTHMS = [["quarter","quarter","half"],["half","quarter","quarter"]];
  const shuffled = (items) => items.map(value=>({value,sort:Math.random()})).sort((a,b)=>a.sort-b.sort).map(({value})=>value);
  const AH_LETTERS = ["C","D","E","F","G","A","B"];
  const AH_WORKSHEET_KEYS = [
    { name:"C major", accidentals:{}, major:true, chords:{I:{name:"C",tones:[["C",0],["E",0],["G",0]]},II:{name:"Dm",tones:[["D",0],["F",0],["A",0]],inversions:[0,1]},IV:{name:"F",tones:[["F",0],["A",0],["C",0]]},V:{name:"G",tones:[["G",0],["B",0],["D",0]]},VI:{name:"Am",tones:[["A",0],["C",0],["E",0]]}}},
    { name:"G major", accidentals:{F:1}, major:true, chords:{I:{name:"G",tones:[["G",0],["B",0],["D",0]]},II:{name:"Am",tones:[["A",0],["C",0],["E",0]],inversions:[0,1]},IV:{name:"C",tones:[["C",0],["E",0],["G",0]]},V:{name:"D",tones:[["D",0],["F",1],["A",0]]},VI:{name:"Em",tones:[["E",0],["G",0],["B",0]]}}},
    { name:"F major", accidentals:{B:-1}, major:true, chords:{I:{name:"F",tones:[["F",0],["A",0],["C",0]]},II:{name:"Gm",tones:[["G",0],["B",-1],["D",0]],inversions:[0,1]},IV:{name:"B♭",tones:[["B",-1],["D",0],["F",0]]},V:{name:"C",tones:[["C",0],["E",0],["G",0]]},VI:{name:"Dm",tones:[["D",0],["F",0],["A",0]]}}},
    { name:"D major", accidentals:{F:1,C:1}, major:true, chords:{I:{name:"D",tones:[["D",0],["F",1],["A",0]]},II:{name:"Em",tones:[["E",0],["G",0],["B",0]],inversions:[0,1]},IV:{name:"G",tones:[["G",0],["B",0],["D",0]]},V:{name:"A",tones:[["A",0],["C",1],["E",0]]},VI:{name:"Bm",tones:[["B",0],["D",0],["F",1]]}}},
    { name:"B♭ major", accidentals:{B:-1,E:-1}, major:true, chords:{I:{name:"B♭",tones:[["B",-1],["D",0],["F",0]]},II:{name:"Cm",tones:[["C",0],["E",-1],["G",0]],inversions:[0,1]},IV:{name:"E♭",tones:[["E",-1],["G",0],["B",-1]]},V:{name:"F",tones:[["F",0],["A",0],["C",0]]},VI:{name:"Gm",tones:[["G",0],["B",-1],["D",0]]}}},
    { name:"A minor", accidentals:{}, major:false, chords:{I:{name:"Am",tones:[["A",0],["C",0],["E",0]]},IV:{name:"Dm",tones:[["D",0],["F",0],["A",0]]},V:{name:"E",tones:[["E",0],["G",1],["B",0]]},VI:{name:"F",tones:[["F",0],["A",0],["C",0]]}}},
    { name:"E minor", accidentals:{F:1}, major:false, chords:{I:{name:"Em",tones:[["E",0],["G",0],["B",0]]},IV:{name:"Am",tones:[["A",0],["C",0],["E",0]]},V:{name:"B",tones:[["B",0],["D",1],["F",1]]},VI:{name:"C",tones:[["C",0],["E",0],["G",0]]}}},
    { name:"D minor", accidentals:{B:-1}, major:false, chords:{I:{name:"Dm",tones:[["D",0],["F",0],["A",0]]},IV:{name:"Gm",tones:[["G",0],["B",-1],["D",0]]},V:{name:"A",tones:[["A",0],["C",1],["E",0]]},VI:{name:"B♭",tones:[["B",-1],["D",0],["F",0]]}}},
  ];
  const ahStep = (letter,octave,clef) => octave*7+AH_LETTERS.indexOf(letter)-(clef==="bass"?2*7+AH_LETTERS.indexOf("G"):4*7+AH_LETTERS.indexOf("E"));
  const ahTone = (key,[letter,accidental],octave,clef) => ({letter,step:ahStep(letter,octave,clef),writtenAccidental:accidental===(key.accidentals[letter]||0)?null:accidental});
  const ahPositionName = (inversion) => inversion===1?"1st inversion":inversion===2?"2nd inversion":"root position";
  function ahWorksheetVoicing(key,chord,inversion){const bassTone=chord.tones[inversion]||chord.tones[0], remaining=chord.tones.filter((_,toneIndex)=>toneIndex!==inversion), bass=ahTone(key,bassTone,bassTone[0]==="B"?2:3,"bass"), treble=[remaining[0],remaining[1],bassTone].map(tone=>ahTone(key,tone,tone[0]==="C"||tone[0]==="D"?5:4,"treble")).sort((a,b)=>a.step-b.step);while(treble[treble.length-1].step-treble[0].step>7)treble[treble.length-1]={...treble[treble.length-1],step:treble[treble.length-1].step-7};return {bass,treble:treble.sort((a,b)=>a.step-b.step)};}
  const configuredAHWorksheetTypes = CONFIG.settings?.ahCustomise
    ? [CONFIG.settings.ahCustomise.insertPosition?"position":null,CONFIG.settings.ahCustomise.createBassLine?"bass":null].filter(Boolean)
    : ["position","bass"];
  const AH_WORKSHEET_TYPES = configuredAHWorksheetTypes.length ? configuredAHWorksheetTypes : ["position","bass"];
  const defaultInstructions = CONFIG.activityId === "chords" && level === "N5"
    ? "Name the outlined chord – your options are C major, F major, G major or A minor."
    : CONFIG.activityId === "chords" && level === "AH"
      ? AH_WORKSHEET_TYPES.length===1
        ? AH_WORKSHEET_TYPES[0]==="bass" ? "Draw in the bass note using the chord information provided." : "Write the chord and position."
        : "Write the chord and position or draw in the bass note for the given chord."
      : CONFIG.activityId === "keysig"
        ? "Identify the key signatures shown below."
        : CONFIG.activityId === "missingnotes" && level === "N3"
          ? "Copy each bar to create an exact repetition."
        : CONFIG.activityId === "missingnotes" && level === "N4"
          ? "Create musical sequences by writing notes onto the stave."
        : DEF.instructions;
  const defaultTitle=CONFIG.activityId==="missingnotes"&&level==="N3"?"Repetition • National 3":CONFIG.activityId==="missingnotes"&&level==="N4"?"Sequences • National 4":`${DEF.title} · ${LEVEL_NAMES[level]||level}`;
  const id = () => Math.random().toString(36).slice(2);

  const enabledKeys = (object, prefix="") => Object.entries(object||{}).filter(([key,on])=>on&&key.startsWith(prefix)).map(([key])=>key.slice(prefix.length));
  const accidentalText = (value) => value==="sharp"?"♯":value==="flat"?"♭":"";
  const ENHARMONIC_LETTERS=["C","D","E","F","G","A","B"];
  const ENHARMONIC_ORDINARY_PAIRS=[
    [{letter:"C",accidental:"sharp"},{letter:"D",accidental:"flat"}],
    [{letter:"D",accidental:"sharp"},{letter:"E",accidental:"flat"}],
    [{letter:"F",accidental:"sharp"},{letter:"G",accidental:"flat"}],
    [{letter:"G",accidental:"sharp"},{letter:"A",accidental:"flat"}],
    [{letter:"A",accidental:"sharp"},{letter:"B",accidental:"flat"}],
  ];
  const ENHARMONIC_UNUSUAL_PAIRS={
    eSharpFflat:[
      {source:{letter:"E",accidental:"sharp"},target:{letter:"F",accidental:null}},
      {source:{letter:"F",accidental:"flat"},target:{letter:"E",accidental:null}},
    ],
    bSharpCflat:[
      {source:{letter:"B",accidental:"sharp"},target:{letter:"C",accidental:null},targetOctaveOffset:1},
      {source:{letter:"C",accidental:"flat"},target:{letter:"B",accidental:null},targetOctaveOffset:-1},
    ],
  };
  const enharmonicStep=(note,clef)=>note.octave*7+ENHARMONIC_LETTERS.indexOf(note.letter)-(clef==="bass"?2*7+ENHARMONIC_LETTERS.indexOf("G"):4*7+ENHARMONIC_LETTERS.indexOf("E"));
  const enharmonicName=(note)=>`${note.letter}${accidentalText(note.accidental)}`;
  const noteNameForStep = (step, clef="treble") => {
    const names=clef==="bass"?["G","A","B","C","D","E","F"]:["E","F","G","A","B","C","D"];
    return names[((step%7)+7)%7];
  };
  function configuredEnharmonicPairs(){
    const options=CONFIG.settings?.options||{};
    const pairs=[["F♯","G♭"],["C♯","D♭"],["A♯","B♭"],["D♯","E♭"],["G♯","A♭"]];
    if(options.eSharpFflat!==false)pairs.push(["E♯","F"],["F♭","E"]);
    if(options.bSharpCflat!==false)pairs.push(["B♯","C"],["C♭","B"]);
    return pairs;
  }
  function makeEnharmonicQuestion(index,base){
    const options=CONFIG.settings?.options||{};
    const clefs=[options.treble!==false?"treble":null,options.bass!==false?"bass":null].filter(Boolean);
    const unusual=[...(options.eSharpFflat!==false?ENHARMONIC_UNUSUAL_PAIRS.eSharpFflat:[]),...(options.bSharpCflat!==false?ENHARMONIC_UNUSUAL_PAIRS.bSharpCflat:[])];
    const useUnusual=index>=0&&index%10===9&&unusual.length>0;
    const directions=useUnusual?unusual:ENHARMONIC_ORDINARY_PAIRS.flatMap(([first,second])=>[{source:first,target:second},{source:second,target:first}]);
    const candidates=[];
    for(const clef of (clefs.length?clefs:["treble"]))for(const item of directions)for(let octave=2;octave<=6;octave+=1){
      const source={...item.source,octave}, target={...item.target,octave:octave+(item.targetOctaveOffset||0)};
      const sourceStep=enharmonicStep(source,clef), targetStep=enharmonicStep(target,clef);
      if(sourceStep>=-4&&sourceStep<=12&&targetStep>=-4&&targetStep<=12)candidates.push({clef,source:{...source,step:sourceStep},target:{...target,step:targetStep}});
    }
    const chosen=random(candidates);
    return {...base,...chosen,prompt:"Write the enharmonic equivalent of the note shown.",answer:enharmonicName(chosen.target),unusualSpelling:useUnusual,response:"stave"};
  }
  function configuredRhythmPool(){
    const settings=CONFIG.settings||{};
    const ids=(settings.enabledItems||[]).concat(settings.includeBeamedGroups===false?[]:(settings.enabledBeamedItems||[]));
    const pool=ids.map(rhythmId=>WORKSHEET_RHYTHMS[rhythmId]).filter(Boolean);
    return pool.length?pool:Object.values(WORKSHEET_RHYTHMS).slice(0,6);
  }
  function configuredTimeSignatures(){
    const selected=enabledKeys(CONFIG.settings?.enabledRhythms,"time-");
    return selected.length?selected:(level==="H"||level==="AH"?["2/4","3/4","4/4","6/8","9/8","12/8"]:["2/4","3/4","4/4"]);
  }
  function makeKeySignatureQuestion(index,base){
    const keys=(KEYSIG_LEVEL_KEYS[level]||KEYSIG_LEVEL_KEYS.N5).map(keyId=>KEYSIG_WORKSHEET_KEYS[keyId]);
    const key=random(keys);
    const rhythmPatterns=[["half","quarter","quarter"],["quarter","quarter","half"]];
    const notes=[];
    for(let barIndex=0;barIndex<4;barIndex+=1){
      const pattern=rhythmPatterns[barIndex%rhythmPatterns.length];
      pattern.forEach((rhythm,noteIndex)=>{const finalNote=barIndex===3&&noteIndex===pattern.length-1, firstNote=barIndex===0&&noteIndex===0;let step=firstNote||finalNote?key.tonicStep:Math.max(-2,Math.min(10,key.tonicStep+random([-2,-1,1,2,3,4])));const writtenAccidental=key.leadingStep===step&&barIndex>=2?"sharp":null;notes.push({barIndex,rhythm,step,writtenAccidental});});
    }
    if(Number.isInteger(key.leadingStep)){const leadingNote=notes.find(note=>note.barIndex===1&&note.rhythm==="quarter")||notes.find(note=>note.barIndex===1);if(leadingNote){leadingNote.step=key.leadingStep;leadingNote.writtenAccidental="sharp";}}
    return {...base,key,build:false,notes,prompt:"",answer:key.label,response:"text"};
  }

  const ACCIDENTAL_VALUES = { flat: -1, natural: 0, sharp: 1 };
  const NOTE_PITCHES = [64,65,67,69,71,72,74,76,77];
  const configuredWorksheetAccidentals = CONFIG.settings?.enabledAccidentals;
  const enabledWorksheetAccidentals = (configuredWorksheetAccidentals?.length ? configuredWorksheetAccidentals : ["sharp", "flat", "natural"])
    .map((name) => ACCIDENTAL_VALUES[name])
    .filter((value) => value === -1 || value === 1);
  function validWrittenAccidental(step, accidental) {
    if (accidental === null) return true;
    const letter = NOTE_NAMES[step];
    return !((accidental === 1 && (letter === "B" || letter === "E")) || (accidental === -1 && (letter === "C" || letter === "F")));
  }
  function writtenNoteName(step, accidental = null) {
    return `${NOTE_NAMES[step]}${accidental === 1 ? "♯" : accidental === -1 ? "♭" : accidental === 0 ? "♮" : ""}`;
  }
  function accidentalIdentificationQuestion(base) {
    const choices = [null, ...enabledWorksheetAccidentals];
    const candidates = [];
    for (let step = 0; step < NOTE_NAMES.length - 1; step += 1) {
      for (const firstAccidental of choices) for (const secondAccidental of choices) {
        if (firstAccidental === null && secondAccidental === null) continue;
        if (!validWrittenAccidental(step, firstAccidental) || !validWrittenAccidental(step + 1, secondAccidental)) continue;
        const firstPitch = NOTE_PITCHES[step] + (firstAccidental ?? 0);
        const secondPitch = NOTE_PITCHES[step + 1] + (secondAccidental ?? 0);
        const semitones = secondPitch - firstPitch;
        if (semitones === 1 || semitones === 2) candidates.push({ step, step2: step + 1, firstAccidental, secondAccidental, distance: semitones === 1 ? "semitone" : "tone" });
      }
    }
    const question = random(candidates);
    if (!question) return null;
    return { ...base, ...question, prompt:"Are the two notes a tone or a semitone apart?", answer:question.distance[0].toUpperCase()+question.distance.slice(1), response:"text" };
  }
  function accidentalCreationQuestion(base) {
    const startChoices = [null, ...enabledWorksheetAccidentals];
    const candidates = [];
    for (let step = 0; step < NOTE_NAMES.length; step += 1) {
      for (const direction of ["higher", "lower"]) for (const distance of ["tone", "semitone"]) {
        const answerStep = step + (direction === "higher" ? 1 : -1);
        if (answerStep < 0 || answerStep >= NOTE_NAMES.length) continue;
        for (const firstAccidental of startChoices) for (const answerAccidental of enabledWorksheetAccidentals) {
          if (!validWrittenAccidental(step, firstAccidental) || !validWrittenAccidental(answerStep, answerAccidental)) continue;
          const firstPitch = NOTE_PITCHES[step] + (firstAccidental ?? 0);
          const answerPitch = NOTE_PITCHES[answerStep] + answerAccidental;
          const semitones = Math.abs(answerPitch - firstPitch);
          const correctDirection = direction === "higher" ? answerPitch > firstPitch : answerPitch < firstPitch;
          if (correctDirection && semitones === (distance === "tone" ? 2 : 1)) candidates.push({ step, answerStep, firstAccidental, answerAccidental, distance, direction });
        }
      }
    }
    const question = random(candidates);
    if (!question) return null;
    return { ...base, ...question, prompt:`Write a note a ${question.distance} ${question.direction} than the note shown.`, answer:writtenNoteName(question.answerStep, question.answerAccidental), response:"stave" };
  }

  function makeQuestion(index, forcedAHType=null) {
    const step = random(NOTES), step2 = Math.max(0, Math.min(8, step + random([-3,-2,-1,1,2,3])));
    const base = { id: id(), step, step2, prompt: "", answer: "", response: DEF.response };
    switch (CONFIG.activityId) {
      case "enharmonics": {
        return makeEnharmonicQuestion(index,base);
      }
      case "keysig": return makeKeySignatureQuestion(index,base);
      case "notenaming": { const settings=CONFIG.settings||{}, clefs=[settings.treble!==false?"treble":null,settings.bass?"bass":null].filter(Boolean), clef=random(clefs.length?clefs:["treble"]), range=settings.ledger===false?[0,1,2,3,4,5,6,7,8]:settings.advancedRange?[-4,-3,-2,-1,0,1,2,3,4,5,6,7,8,9,10,11,12]:[-2,-1,0,1,2,3,4,5,6,7,8,9,10], noteStep=random(range), accidental=settings.accidentals?random([null,null,"sharp","flat"]):null; return {...base,step:noteStep,clef,prompt:"Name the note.",answer:`${noteNameForStep(noteStep,clef)}${accidentalText(accidental)}`,noteAccidental:accidental}; }
      case "tonic": { const enabled=Object.entries(CONFIG.settings?.questionTypes||{}).filter(([,on])=>on).map(([name])=>name); const degree=random(enabled.length?enabled:["tonic","subdominant","dominant"]); return { ...base, prompt: `Circle the ${degree} note.`, degree, melody: Array.from({length:8}, () => random(NOTES)), answer: degree }; }
      case "transposing": { const options=CONFIG.settings?.questionOptions||{}, choices=[options.octaveHigher!==false?{prompt:"Rewrite the note one octave higher.",delta:7}:null,options.octaveLower!==false?{prompt:"Rewrite the note one octave lower.",delta:-7}:null,options.samePitch!==false?{prompt:"Rewrite the note at the same pitch in the other clef.",delta:0,otherClef:true}:null,options.ottava?{prompt:random(["Rewrite the note shown by 8va.","Rewrite the note shown by 8vb."]),delta:random([7,-7])}:null].filter(Boolean), choice=random(choices.length?choices:[{prompt:"Rewrite the note at the same pitch in the other clef.",delta:0,otherClef:true}]); return {...base,prompt:choice.prompt,answerStep:Math.max(-4,Math.min(12,step+choice.delta)),clef:choice.otherClef&&index%2?"bass":"treble"}; }
      case "barlines": { const timeSignature=random(configuredTimeSignatures()); return {...base,prompt:`Insert the missing barlines in ${timeSignature}.`,timeSignature,melody:Array.from({length:12},()=>random(NOTES)),answer:"Correct barlines shown"}; }
      case "rests": { const selected=enabledKeys(CONFIG.settings?.enabledOptions,"rest-").map(name=>name.replaceAll("-"," ")), rests=selected.length?selected:["crotchet rest","quaver rest","minim rest","semibreve rest"], answer=random(rests); return {...base,prompt:"Write the missing rest.",answer}; }
      case "rhythmsums": { const pool=configuredRhythmPool(), operators=(CONFIG.settings?.enabledOperators||["+","−"]).filter(operator=>["+","−","×","÷"].includes(operator)), left=random(pool), right=random(pool), operator=random(operators.length?operators:["+"]), raw=operator==="+"?left.beats+right.beats:operator==="−"?Math.abs(left.beats-right.beats):operator==="×"?left.beats*right.beats:left.beats/right.beats; return {...base,prompt:"Calculate the number of beats.",left,right,operator,answer:Math.round(raw*100)/100}; }
      case "timesig": { const answer=random(configuredTimeSignatures()); return {...base,prompt:"Identify the time signature.",melody:Array.from({length:12},()=>random(NOTES)),answer}; }
      case "triplets": { const answer=random(["Quaver triplet","Crotchet triplet"]); return { ...base, prompt:"Mark the triplet and name its type.", melody:Array.from({length:12},()=>random(NOTES)), answer }; }
      case "accidentals": { const create=index%2===1; const useAccidental=index<0||index%3!==0; if(useAccidental){const accidentalQuestion=create?accidentalCreationQuestion(base):accidentalIdentificationQuestion(base);if(accidentalQuestion)return accidentalQuestion;} const distance=random(["tone","semitone"]), direction=random(["higher","lower"]); const pairs=distance==="tone"?[[1,2],[2,3],[3,4],[5,6],[6,7]]:[[0,1],[4,5],[7,8]]; const [low,high]=random(pairs); if(create){const startStep=direction==="higher"?low:high, answerStep=direction==="higher"?high:low; return { ...base, step:startStep, answerStep, firstAccidental:null, answerAccidental:null, prompt:`Write a note a ${distance} ${direction} than the note shown.`, answer:NOTE_NAMES[answerStep], response:"stave" };} return { ...base, step:low, step2:high, firstAccidental:null, secondAccidental:null, prompt:"Are the two notes a tone or a semitone apart?", answer:distance[0].toUpperCase()+distance.slice(1), response:"text" }; }
      case "chords": { if(level==="N5"){const chord=random(N5_WORKSHEET_CHORDS), rhythmPattern=random(N5_CHORD_RHYTHMS);return {...base,prompt:"",chordNotes:shuffled(chord.notes).map((chordNote,noteIndex)=>({...chordNote,rhythm:rhythmPattern[noteIndex]})),answer:chord.answer,response:"text"};} if(level==="AH"){const ahType=forcedAHType||AH_WORKSHEET_TYPES[Math.abs(index)%AH_WORKSHEET_TYPES.length], key=random(AH_WORKSHEET_KEYS), symbols=key.major?["I","II","IV","V","VI"]:["I","IV","V","VI"], choices=[];symbols.forEach(symbol=>{const chord=key.chords[symbol];(chord.inversions||[0,1,2]).forEach(inversion=>{const voicing=ahWorksheetVoicing(key,chord,inversion);if(ahType!=="bass"||voicing.bass.writtenAccidental===null)choices.push({symbol,chord,inversion,voicing});});});const first=random(choices), second=random(choices.filter(choice=>choice.symbol!==first.symbol));const ahItems=[first,second].map(item=>({symbol:item.symbol,chordName:item.chord.name,inversion:item.inversion,trebleTones:item.voicing.treble,bassTone:item.voicing.bass}));return {...base,prompt:ahType==="position"?"Identify the chord and its position. The first has been done for you.":"Insert the correct note in the bass line using the chord information provided.",ahType,key,ahItems,answer:ahType==="position"?`${second.symbol} – ${ahPositionName(second.inversion)}`:second.voicing.bass.letter,response:"mark"};} const bass=index%2===0; return bass ? {...base,clef:"bass",prompt:"Write the missing bass note using the chord information shown.",answer:random(NOTE_NAMES),response:"stave"} : {...base,clef:"bass",prompt:"Name the chord and its position.",stack:[step,Math.min(8,step+2),Math.min(8,step+4)],answer:random(["C major, root position","G major, first inversion","D minor, second inversion","Diminished 7th"]),response:"text"}; }
      case "articulation": { const all=[{id:"staccato",name:"staccato",meaning:"Short and detached"},{id:"slur",name:"slur",meaning:"Smoothly and connected"},{id:"accent",name:"accent",meaning:"With extra emphasis"},{id:"phrase",name:"phrase mark",meaning:"Shows the musical phrase"}], selected=CONFIG.settings?.enabledMarkings||[], markings=all.filter(mark=>!selected.length||selected.includes(mark.id)), types=CONFIG.settings?.enabledTypes||[], applyEnabled=!types.length||types.includes("apply"), identifyEnabled=!types.length||types.some(type=>type.startsWith("identify")), apply=applyEnabled&&(!identifyEnabled||index%2===1), marking=random(markings.length?markings:all); return {...base,prompt:apply?`Apply a ${marking.name} to the notes.`:`Write the meaning of the ${marking.name} marking shown.`,melody:Array.from({length:4},()=>random(NOTES)),marking:apply?null:marking.name,answer:apply?marking.name:marking.meaning,response:apply?"stave":"text"}; }
      case "missingnotes": {
        const direction=level==="N4"?random(["higher","lower"]):null;
        const delta=direction==="higher"?1:direction==="lower"?-1:0;
        const timeSignature=random(Object.keys(MISSING_NOTES_PATTERNS));
        const rhythms=random(MISSING_NOTES_PATTERNS[timeSignature]);
        const first=random(direction==="higher"?[1,2,3,4,5]:direction==="lower"?[2,3,4,5,6]:[1,2,3,4,5,6]);
        const sourceMelody=[first];
        while(sourceMelody.length<rhythms.length){
          const previous=sourceMelody[sourceMelody.length-1];
          const possible=[previous-1,previous,previous+1].filter(note=>note>=1&&note<=6&&note+delta>=0&&note+delta<=8);
          sourceMelody.push(random(possible));
        }
        return {...base,key:KEYSIG_WORKSHEET_KEYS["c-major"],timeSignature,rhythms,prompt:direction?`Write the sequence one step ${direction} in the blank bar.`:"",sourceMelody,answerMelody:sourceMelody.map(note=>note+delta),answer:direction?`One step ${direction}`:"Exact repeat",response:"stave"};
      }
      case "practicequestions": return makePracticeQuestion(index, base);
      default: return base;
    }
  }

  function makePracticeQuestion(index, base) {
    const enabled=CONFIG.settings?.enabledQuestionTypes||{};
    const selected=Object.entries(enabled).filter(([,on])=>on).map(([type])=>type).filter(type=>!["rhythmIdentification","cadence","chord","dynamic","missing","rhythmicDictation","accidentals","articulation","tempoQuestion"].includes(type));
    const types=selected.length?selected:["barlines","noteIdentification","repeatSigns","time"];
    const type=types[Math.abs(index)%types.length];
    if(type==="repeatSigns")return {...base,prompt:"Draw a start repeat sign at the beginning and an end repeat sign at the end of the stave.",answer:"Correct start and end repeat signs",repeatSigns:true,response:"stave"};
    if(type==="noteIdentification")return {...base,prompt:"Name the note.",answer:NOTE_NAMES[base.step],response:"text"};
    if(type==="time")return {...base,prompt:"Identify the time signature.",melody:Array.from({length:8},()=>random(NOTES)),answer:random(["2/4","3/4","4/4","6/8"]),response:"text"};
    if(type==="barlines")return {...base,prompt:"Insert the missing barline in the correct place.",melody:Array.from({length:8},()=>random(NOTES)),answer:"Correct barline",response:"stave"};
    if(type==="enharmonics"){const pair=random(configuredEnharmonicPairs());return {...base,prompt:`Write the enharmonic equivalent of ${pair[0]}.`,label:pair[0],answer:pair[1],response:"stave"};}
    if(type==="triplets")return {...base,prompt:"Name the triplet type shown.",melody:Array.from({length:6},()=>random(NOTES)),answer:random(["Quaver triplet","Crotchet triplet"]),response:"text"};
    if(type==="rests")return {...base,prompt:"Write the missing rest.",answer:random(["crotchet rest","quaver rest","minim rest","semibreve rest"]),response:"stave"};
    if(type==="scaleDegrees")return {...base,prompt:"Circle the tonic note.",melody:Array.from({length:8},()=>random(NOTES)),answer:"Tonic",response:"mark"};
    if(type==="interval")return {...base,prompt:"Name the interval between the two notes.",step2:Math.min(8,base.step+random([1,2,3,4])),answer:random(["2nd","3rd","4th","5th"]),response:"text"};
    if(type==="key"){const key=random(KEYS);return {...base,prompt:"Name this key signature.",key,answer:key,response:"text"};}
    if(type==="transposition")return {...base,prompt:"Rewrite the note one octave higher.",answerStep:Math.min(12,base.step+7),response:"stave"};
    if(type==="ahChord")return {...base,prompt:"Identify the chord and its position.",stack:[base.step,Math.min(8,base.step+2),Math.min(8,base.step+4)],answer:"Chord and position",response:"text"};
    if(type==="ahBassLine")return {...base,clef:"bass",prompt:"Insert the correct bass note using the chord information provided.",answerStep:base.step,answer:NOTE_NAMES[base.step],response:"stave"};
    return {...base,prompt:"Complete the question.",answer:"Teacher answer",response:"text"};
  }

  function worksheetSymbolKey(key) {
    if (key === "flatInScore" || key === "flatKeySignature") return "flat";
    if (key === "naturalInScore") return "natural";
    if (key === "sharpInScore" || key === "sharpKeySignature") return "sharp";
    return key;
  }

  function worksheetSymbolSettings(key) {
    const settingsKey = ["flatInScore", "naturalInScore", "sharpInScore"].includes(key) ? "flatInScore" : key;
    const symbols = window.SHARED_NOTATION_CONFIG?.symbols || {};
    return symbols[settingsKey] || symbols[worksheetSymbolKey(settingsKey)] || {
      fontSizeScale: 3.4,
      xOffsetScale: 0,
      yOffsetScale: 0,
      widthScale: 1,
      heightScale: 1,
    };
  }

  function WorksheetOutlineGlyph({ symbolKey, x, y, fontSize, colour, anchor = "middle", widthScale = 1, heightScale = 1 }) {
    const outlineSet = window.BRAVURA_WORKSHEET_OUTLINES;
    const outline = outlineSet?.symbols?.[worksheetSymbolKey(symbolKey)];
    if (!outline) return null;
    const scale = fontSize / outlineSet.unitsPerEm;
    const anchorOffset = anchor === "start" ? 0 : anchor === "end" ? outline.advance : outline.advance / 2;
    return <g transform={`translate(${x} ${y}) scale(${widthScale} ${heightScale}) translate(${-x} ${-y})`} fill={colour}>
      <g transform={`translate(${x} ${y}) scale(${scale} ${-scale}) translate(${-anchorOffset} 0)`}>
        <path d={outline.path} />
      </g>
    </g>;
  }

  function WorksheetGlyph({ symbolKey, x, y, gap, colour }) {
    const settings = worksheetSymbolSettings(symbolKey);
    const adjustedX = x + gap * Number(settings.xOffsetScale || 0) + Number(settings.opticalXOffset || 0);
    const adjustedY = y + gap * Number(settings.yOffsetScale || 0) + Number(settings.opticalYOffset || 0);
    return <WorksheetOutlineGlyph symbolKey={symbolKey} x={adjustedX} y={adjustedY} fontSize={gap * Number(settings.fontSizeScale || 3.4)} colour={colour} widthScale={settings.widthScale || 1} heightScale={settings.heightScale || 1} />;
  }

  function WorksheetRhythmGlyph({ symbolKey }) {
    return <svg viewBox="0 0 64 64" className="h-12 w-12 overflow-visible" aria-hidden="true"><WorksheetOutlineGlyph symbolKey={symbolKey} x={32} y={48} fontSize={52} colour="currentColor" /></svg>;
  }

  function AccidentalsStaff({ question, completed=false, muted=false }) {
    const ink = muted ? "#78716c" : "#000";
    const left = 28, right = 304, top = 48, gap = 12;
    const y = (step) => top + gap * 4 - step * (gap / 2);
    const gradientId = `accidentals-staff-fade-${question.id}-${completed ? "answer" : "question"}`;
    const drawNote = (step, accidental, x, key) => <g key={key}>
      {accidental !== null && accidental !== undefined ? <WorksheetGlyph symbolKey={accidental === 1 ? "sharpInScore" : accidental === -1 ? "flatInScore" : "naturalInScore"} x={x - gap * 2.1} y={y(step)} gap={gap} colour={ink} /> : null}
      <WorksheetGlyph symbolKey={step > 4 ? "quarterNoteStemDown" : "quarterNoteStemUp"} x={x} y={y(step)} gap={gap} colour={ink} />
    </g>;
    const showSecondNote = question.response === "text" || (completed && Number.isInteger(question.answerStep));
    const secondStep = question.response === "text" ? question.step2 : question.answerStep;
    return <svg viewBox="0 0 320 120" className="h-full max-h-28 w-full" aria-label="Accidentals notation">
      <defs>
        <linearGradient id={gradientId} gradientUnits="userSpaceOnUse" x1={left} x2={right} y1="0" y2="0">
          <stop offset="0%" stopColor={ink} stopOpacity="1" />
          <stop offset="72%" stopColor={ink} stopOpacity="1" />
          <stop offset="100%" stopColor={ink} stopOpacity="0" />
        </linearGradient>
      </defs>
      <g>{[0,1,2,3,4].map((line) => <line key={line} x1={left} x2={right} y1={top + line * gap} y2={top + line * gap} stroke={`url(#${gradientId})`} strokeWidth="1.2" />)}</g>
      <WorksheetGlyph symbolKey="gClef" x={left + gap * 3.2} y={y(2)} gap={gap} colour={ink} />
      {drawNote(question.step, question.firstAccidental, 130, "first")}
      {showSecondNote && Number.isInteger(secondStep) ? drawNote(secondStep, question.response === "text" ? question.secondAccidental : question.answerAccidental, 218, "second") : null}
    </svg>;
  }

  function EnharmonicsStaff({ question, completed=false, muted=false }) {
    const ink=muted?"#78716c":"#000";
    const left=24, right=304, top=54, gap=12, sourceX=142, answerX=232;
    const y=(step)=>top+gap*4-step*(gap/2);
    const gradientId=`enharmonics-staff-fade-${question.id}-${completed?"answer":"question"}`;
    const drawLedger=(note,x,key)=>{const lines=[];if(note.step<=-2)lines.push(-2);if(note.step<=-4)lines.push(-4);if(note.step>=10)lines.push(10);if(note.step>=12)lines.push(12);return lines.map(step=><line key={`${key}-${step}`} x1={x-14} x2={x+14} y1={y(step)} y2={y(step)} stroke={ink} strokeWidth="1.2"/>);};
    const drawNote=(note,x,key)=><g key={key}>{drawLedger(note,x,key)}{note.accidental?<WorksheetGlyph symbolKey={note.accidental==="sharp"?"sharpInScore":"flatInScore"} x={x-gap*2.1-(note.step<=-2||note.step>=10?5:0)} y={y(note.step)} gap={gap} colour={ink}/>:null}<WorksheetGlyph symbolKey={note.step>4?"quarterNoteStemDown":"quarterNoteStemUp"} x={x} y={y(note.step)} gap={gap} colour={ink}/></g>;
    return <svg viewBox="0 0 320 132" className="h-full max-h-32 w-full" aria-label="Enharmonic equivalent notation">
      <defs><linearGradient id={gradientId} gradientUnits="userSpaceOnUse" x1={left} x2={right} y1="0" y2="0"><stop offset="0%" stopColor={ink} stopOpacity="1"/><stop offset="86%" stopColor={ink} stopOpacity="1"/><stop offset="100%" stopColor={ink} stopOpacity="0"/></linearGradient></defs>
      {[0,1,2,3,4].map(line=><line key={line} x1={left} x2={right} y1={top+line*gap} y2={top+line*gap} stroke={`url(#${gradientId})`} strokeWidth="1.2"/>)}
      <WorksheetGlyph symbolKey={question.clef==="bass"?"fClef":"gClef"} x={left+gap*3.2} y={y(question.clef==="bass"?6:2)} gap={gap} colour={ink}/>
      {drawNote(question.source,sourceX,"source")}
      {completed?drawNote(question.target,answerX,"target"):null}
    </svg>;
  }

  function KeySignatureStaff({ question, completed=false, muted=false }) {
    const ink=muted?"#78716c":"#000";
    const left=18, visibleRight=320, fullRight=510, top=48, gap=10, signatureX=68, timeX=101, musicStart=122, barWidth=(fullRight-musicStart)/4;
    const y=(step)=>top+gap*4-step*(gap/2);
    const fadeId=`keysig-mobile-fade-${question.id}`;
    const noteSymbol=(note)=>note.rhythm==="half"?(note.step>4?"halfNoteStemDown":"halfNoteStemUp"):(note.step>4?"quarterNoteStemDown":"quarterNoteStemUp");
    const drawLedger=(note,x,key)=>{const lines=[];for(let step=-2;step>=note.step;step-=2)lines.push(step);for(let step=10;step<=note.step;step+=2)lines.push(step);return lines.map(step=><line key={`${key}-${step}`} x1={x-11} x2={x+11} y1={y(step)} y2={y(step)} stroke={ink} strokeWidth="1"/>);};
    const signatureVisible=!question.build||completed;
    return <svg viewBox="0 0 320 122" className="h-full max-h-28 w-full" aria-label="Key signature excerpt">
      <defs><linearGradient id={fadeId} x1={visibleRight-52} x2={visibleRight} y1="0" y2="0" gradientUnits="userSpaceOnUse"><stop offset="0%" stopColor="white"/><stop offset="28%" stopColor="white"/><stop offset="100%" stopColor="black"/></linearGradient><mask id={`${fadeId}-mask`} maskUnits="userSpaceOnUse" x="0" y="0" width={visibleRight} height="122"><rect x="0" y="0" width={visibleRight} height="122" fill={`url(#${fadeId})`}/></mask></defs>
      <g mask={`url(#${fadeId}-mask)`}>
      {[0,1,2,3,4].map(line=><line key={line} x1={left} x2={fullRight} y1={top+line*gap} y2={top+line*gap} stroke={ink} strokeWidth="1.2"/>)}
      <WorksheetGlyph symbolKey="gClef" x={left+gap*3.2} y={y(2)} gap={gap} colour={ink}/>
      {signatureVisible?question.key.signature.map((item,index)=><WorksheetGlyph key={`${item.type}-${index}`} symbolKey={item.type==="sharp"?"sharpKeySignature":"flatKeySignature"} x={signatureX+index*14} y={y(item.step)} gap={gap} colour={ink}/>):null}
      <WorksheetOutlineGlyph symbolKey="timeSig4" x={timeX} y={top+11} fontSize={35} colour={ink}/>
      <WorksheetOutlineGlyph symbolKey="timeSig4" x={timeX} y={top+31} fontSize={35} colour={ink}/>
      {[1,2,3].map(bar=><line key={bar} x1={musicStart+barWidth*bar} x2={musicStart+barWidth*bar} y1={top} y2={top+gap*4} stroke={ink} strokeWidth="1.2"/>)}
      <WorksheetOutlineGlyph symbolKey="barlineFinal" x={fullRight} y={top+gap*4} fontSize={gap*4} colour={ink} anchor="end"/>
      {question.notes.map((note,noteIndex)=>{const notesInBar=question.notes.filter(item=>item.barIndex===note.barIndex), localIndex=notesInBar.indexOf(note), x=musicStart+barWidth*note.barIndex+barWidth*(localIndex+1)/(notesInBar.length+1);return <g key={`key-note-${noteIndex}`}>{drawLedger(note,x,`key-ledger-${noteIndex}`)}{note.writtenAccidental?<WorksheetGlyph symbolKey="sharpInScore" x={x-gap*2.1} y={y(note.step)} gap={gap} colour={ink}/>:null}<WorksheetGlyph symbolKey={noteSymbol(note)} x={x} y={y(note.step)} gap={gap} colour={ink}/></g>;})}
      </g>
    </svg>;
  }

  function N5ChordStaff({ question, muted=false, showNoteNames=false }) {
    const ink = muted ? "#78716c" : "#000";
    const left = 28, right = 304, top = 48, gap = 12;
    const noteXs = [112, 190, 268];
    const y = (step) => top + gap * 4 - step * (gap / 2);
    const gradientId = `n5-chord-staff-fade-${question.id}`;
    const symbolKey = (note) => note.rhythm === "half"
      ? (note.step > 4 ? "halfNoteStemDown" : "halfNoteStemUp")
      : (note.step > 4 ? "quarterNoteStemDown" : "quarterNoteStemUp");
    return <svg viewBox={`0 0 320 ${showNoteNames ? 132 : 120}`} className="h-full max-h-28 w-full" aria-label="Outlined chord notation">
      <defs>
        <linearGradient id={gradientId} gradientUnits="userSpaceOnUse" x1={left} x2={right} y1="0" y2="0">
          <stop offset="0%" stopColor={ink} stopOpacity="1" />
          <stop offset="72%" stopColor={ink} stopOpacity="1" />
          <stop offset="100%" stopColor={ink} stopOpacity="0" />
        </linearGradient>
      </defs>
      <g>{[0,1,2,3,4].map((line) => <line key={line} x1={left} x2={right} y1={top + line * gap} y2={top + line * gap} stroke={`url(#${gradientId})`} strokeWidth="1.2" />)}</g>
      <WorksheetGlyph symbolKey="gClef" x={left + gap * 3.2} y={y(2)} gap={gap} colour={ink} />
      {question.chordNotes.map((note,index)=><g key={`${question.id}-chord-note-${index}`}>
        {note.step <= -2 ? <line x1={noteXs[index]-14} x2={noteXs[index]+14} y1={y(-2)} y2={y(-2)} stroke={ink} strokeWidth="1.2" /> : null}
        <WorksheetGlyph symbolKey={symbolKey(note)} x={noteXs[index]} y={y(note.step)} gap={gap} colour={ink} />
        {note.step % 2 === 0 ? <line x1={noteXs[index]-9} x2={noteXs[index]+9} y1={y(note.step)} y2={y(note.step)} stroke={ink} strokeWidth="1.2" /> : null}
        {showNoteNames ? <text x={noteXs[index]} y="126" fill={ink} fontSize="13" fontWeight="700" textAnchor="middle">{note.letter}</text> : null}
      </g>)}
    </svg>;
  }

  function AHChordStaff({ question, completed=false, muted=false }) {
    const ink = muted ? "#78716c" : "#000";
    const left=22, right=304, trebleTop=54, bassTop=139, gap=8, chordXs=[122,220], keyX=58;
    const y=(step,top)=>top+gap*4-step*(gap/2);
    const gradientId=`ah-chord-staff-fade-${question.id}`;
    const keySteps={treble:{sharp:{F:8,C:5},flat:{B:4,E:7}},bass:{sharp:{F:6,C:3},flat:{B:2,E:5}}};
    const keyEntries=Object.entries(question.key.accidentals||{});
    const drawLedger=(tone,x,top,key)=>{const lines=[];for(let ledgerStep=-2;ledgerStep>=tone.step;ledgerStep-=2)lines.push(ledgerStep);for(let ledgerStep=10;ledgerStep<=tone.step;ledgerStep+=2)lines.push(ledgerStep);return lines.map(step=><line key={`${key}-${step}`} x1={x-11} x2={x+11} y1={y(step,top)} y2={y(step,top)} stroke={ink} strokeWidth="1"/>);};
    const drawTone=(tone,x,top,key)=><g key={key}>{drawLedger(tone,x,top,key)}{tone.writtenAccidental!==null?<WorksheetGlyph symbolKey={tone.writtenAccidental===1?"sharpInScore":tone.writtenAccidental===-1?"flatInScore":"naturalInScore"} x={x-gap*2.1} y={y(tone.step,top)} gap={gap} colour={ink}/>:null}<WorksheetGlyph symbolKey={tone.step>4?"quarterNoteStemDown":"quarterNoteStemUp"} x={x} y={y(tone.step,top)} gap={gap} colour={ink}/>{tone.step%2===0?<line x1={x-7} x2={x+7} y1={y(tone.step,top)} y2={y(tone.step,top)} stroke={ink} strokeWidth="1"/>:null}</g>;
    const drawStack=(tones,x,top,key,down=false)=>{
      const offsets=tones.map(()=>0);
      for(let toneIndex=1;toneIndex<tones.length;toneIndex+=1){if(tones[toneIndex].step-tones[toneIndex-1].step===1){if(down)offsets[toneIndex-1]=-7;else offsets[toneIndex]=7;}}
      const accidentalIndices=tones.map((tone,toneIndex)=>tone.writtenAccidental!==null?toneIndex:null).filter(toneIndex=>toneIndex!==null);
      const accidentalOffset=(toneIndex)=>{if(accidentalIndices.length<=1)return 0;const accidentalIndex=accidentalIndices.indexOf(toneIndex);if(accidentalIndices.length===2)return accidentalIndex===0?gap:0;return accidentalIndex%2===1?gap:0;};
      const ys=tones.map(tone=>y(tone.step,top)), stemX=x+(down?-4:4), stemStart=down?Math.min(...ys):Math.max(...ys), stemEnd=down?Math.max(...ys)+27:Math.min(...ys)-27;
      return <g key={key}>{tones.map((tone,toneIndex)=>{const noteX=x+offsets[toneIndex];return <g key={`${key}-${toneIndex}`}>{drawLedger(tone,noteX,top,`${key}-ledger-${toneIndex}`)}{tone.writtenAccidental!==null?<WorksheetGlyph symbolKey={tone.writtenAccidental===1?"sharpInScore":tone.writtenAccidental===-1?"flatInScore":"naturalInScore"} x={x-gap*2.1-accidentalOffset(toneIndex)} y={y(tone.step,top)} gap={gap} colour={ink}/>:null}<WorksheetGlyph symbolKey="noteheadBlack" x={noteX} y={y(tone.step,top)} gap={gap} colour={ink}/>{tone.step%2===0?<line x1={noteX-7} x2={noteX+7} y1={y(tone.step,top)} y2={y(tone.step,top)} stroke={ink} strokeWidth="1"/>:null}</g>;})}<line x1={stemX} x2={stemX} y1={stemStart} y2={stemEnd} stroke={ink} strokeWidth="1.2"/></g>;
    };
    const drawKeySignature=(clef,top)=>keyEntries.map(([letter,value],index)=>{const kind=value===1?"sharp":"flat", step=keySteps[clef][kind][letter];return Number.isFinite(step)?<WorksheetGlyph key={`${clef}-${letter}`} symbolKey={value===1?"sharpInScore":"flatInScore"} x={keyX+index*gap*1.4} y={y(step,top)} gap={gap} colour={ink}/>:null;});
    const shortPosition=(inversion)=>inversion===1?"1st inv.":inversion===2?"2nd inv.":"Root";
    const tableX=20, tableY=199, columnWidth=140, rowHeight=43;
    return <svg viewBox="0 0 320 315" className="h-full max-h-[315px] w-full" aria-label="Advanced Higher chord notation">
      <defs><linearGradient id={gradientId} gradientUnits="userSpaceOnUse" x1={left} x2={right} y1="0" y2="0"><stop offset="0%" stopColor={ink} stopOpacity="1"/><stop offset="84%" stopColor={ink} stopOpacity="1"/><stop offset="100%" stopColor={ink} stopOpacity="0"/></linearGradient></defs>
      {[trebleTop,bassTop].map((top,staffIndex)=><g key={top}>{[0,1,2,3,4].map(line=><line key={line} x1={left} x2={right} y1={top+line*gap} y2={top+line*gap} stroke={`url(#${gradientId})`} strokeWidth="1.1"/>)}<WorksheetGlyph symbolKey={staffIndex===0?"gClef":"fClef"} x={left+gap*3.2} y={y(staffIndex===0?2:6,top)} gap={gap} colour={ink}/>{drawKeySignature(staffIndex===0?"treble":"bass",top)}</g>)}
      <line x1={left} x2={left} y1={trebleTop} y2={bassTop+gap*4} stroke={ink} strokeWidth="1.2"/>
      <WorksheetOutlineGlyph symbolKey="brace" x={left-9} y={bassTop+gap*4} fontSize={bassTop+gap*4-trebleTop} colour={ink} widthScale="1.15" />
      {question.ahItems.map((item,itemIndex)=><g key={`ah-item-${itemIndex}`}>
        {drawStack(item.trebleTones,chordXs[itemIndex],trebleTop,`treble-${itemIndex}`,!item.trebleTones.some(tone=>tone.step<4))}
        {question.ahType==="position"||itemIndex===0||completed?drawTone(item.bassTone,chordXs[itemIndex],bassTop,`bass-${itemIndex}`):<g opacity="0.25"><WorksheetGlyph symbolKey="quarterNoteStemUp" x={chordXs[itemIndex]} y={bassTop-18} gap={gap} colour={ink}/></g>}
      </g>)}
      {completed&&question.ahType==="bass"?<rect className="ah-answer-highlight" x={chordXs[1]-22} y={y(question.ahItems[1].bassTone.step,bassTop)+(question.ahItems[1].bassTone.step>4?-10:-34)} width="44" height="44" fill="none" stroke={ink} strokeWidth="2"/>:null}
      <rect x={tableX} y={tableY} width={columnWidth*2} height={rowHeight*2} fill="white" stroke={ink} strokeWidth="1"/>
      <line x1={tableX+columnWidth} x2={tableX+columnWidth} y1={tableY} y2={tableY+rowHeight*2} stroke={ink} strokeWidth="1"/>
      <line x1={tableX} x2={tableX+columnWidth*2} y1={tableY+rowHeight} y2={tableY+rowHeight} stroke={ink} strokeWidth="1"/>
      {question.ahItems.map((item,itemIndex)=>{const filled=question.ahType==="bass"||itemIndex===0||completed, topLabel=`${item.symbol} or ${item.chordName}`, bottomLabel=shortPosition(item.inversion);return filled?<g key={`table-${itemIndex}`} fill={ink} fontSize="16" fontWeight="700" textAnchor="middle"><text x={tableX+columnWidth*(itemIndex+.5)} y={tableY+28}>{topLabel}</text><text x={tableX+columnWidth*(itemIndex+.5)} y={tableY+rowHeight+28}>{bottomLabel}</text></g>:null;})}
      {completed&&question.ahType==="position"?<rect className="ah-answer-highlight" x={tableX+columnWidth} y={tableY} width={columnWidth} height={rowHeight*2} fill="none" stroke={ink} strokeWidth="2"/>:null}
      <text x="160" y="307" fill={ink} fontSize="14" textAnchor="middle">The key is <tspan fontWeight="700">{question.key.name}</tspan>.</text>
    </svg>;
  }

  function WorksheetMelodyNotes({ steps, rhythms, xs, top, gap, ink, prefix }) {
    const y=(step)=>top+gap*4-step*(gap/2);
    const noteSymbol=(rhythm,step)=>rhythm==="semibreve"?"wholeNote":rhythm==="minim"?(step>4?"halfNoteStemDown":"halfNoteStemUp"):rhythm==="quaver"?(step>4?"eighthNoteStemDown":"eighthNoteStemUp"):(step>4?"quarterNoteStemDown":"quarterNoteStemUp");
    const groups=[];
    for(let index=0;index<rhythms.length;){
      if(rhythms[index]!=="quaver"){index+=1;continue;}
      let end=index;
      while(end+1<rhythms.length&&rhythms[end+1]==="quaver"&&end-index<3)end+=1;
      if(end>index)groups.push({start:index,end});
      index=end+1;
    }
    const groupFor=(index)=>groups.find(group=>index>=group.start&&index<=group.end);
    const stemXFor=(x,down)=>x+(down?-gap*.6+1:gap*.6-1);
    const beamFor=(group)=>{
      const groupSteps=steps.slice(group.start,group.end+1), down=groupSteps.filter(step=>step>4).length>groupSteps.length/2;
      const settings=worksheetSymbolSettings("quaverBeam"), stemLength=gap*3.1*Number(settings.heightScale||1), yOffset=gap*Number(settings.yOffsetScale||0);
      const firstX=stemXFor(xs[group.start],down), lastX=stemXFor(xs[group.end],down);
      return {down,start:{x:firstX,y:y(steps[group.start])+yOffset+(down?stemLength:-stemLength)},end:{x:lastX,y:y(steps[group.end])+yOffset+(down?stemLength:-stemLength)}};
    };
    const beamY=(beam,x)=>beam.start.y+(x-beam.start.x)/((beam.end.x-beam.start.x)||1)*(beam.end.y-beam.start.y);
    const ledger=(step,x,key)=>{const lines=[];for(let ledgerStep=-2;ledgerStep>=step;ledgerStep-=2)lines.push(ledgerStep);for(let ledgerStep=10;ledgerStep<=step;ledgerStep+=2)lines.push(ledgerStep);return lines.map(ledgerStep=><line key={`${key}-${ledgerStep}`} x1={x-gap*1.125} x2={x+gap*1.125} y1={y(ledgerStep)} y2={y(ledgerStep)} stroke={ink} strokeWidth={gap*.125}/>);};
    return <g>
      {steps.map((step,index)=>{const group=groupFor(index), x=xs[index];if(!group)return <g key={`${prefix}-note-${index}`}>{ledger(step,x,`${prefix}-ledger-${index}`)}<WorksheetGlyph symbolKey={noteSymbol(rhythms[index],step)} x={x} y={y(step)} gap={gap} colour={ink}/></g>;const beam=beamFor(group), stemX=stemXFor(x,beam.down);return <g key={`${prefix}-note-${index}`}>{ledger(step,x,`${prefix}-ledger-${index}`)}<WorksheetGlyph symbolKey="noteheadBlack" x={x} y={y(step)} gap={gap} colour={ink}/><line x1={stemX} x2={stemX} y1={y(step)} y2={beamY(beam,stemX)} stroke={ink} strokeWidth={gap*.125}/></g>;})}
      {groups.map((group,index)=>{const beam=beamFor(group), half=gap*.21;return <polygon key={`${prefix}-beam-${index}`} points={`${beam.start.x},${beam.start.y-half} ${beam.end.x},${beam.end.y-half} ${beam.end.x},${beam.end.y+half} ${beam.start.x},${beam.start.y+half}`} fill={ink}/>;})}
    </g>;
  }

  function MissingNotesStaff({ question, completed=false, muted=false }) {
    const ink=muted?"#78716c":"#000";
    if(level==="N3"||level==="N4"){
      const left=30, right=290, gap=9.6, topBar=28, bottomBar=138, clefX=49, timeX=73, musicStart=96, staveZoom=1.15;
      const y=(step,top)=>top+gap*4-step*(gap/2);
      const noteXs=missingNotesBarPositions(question.rhythms,musicStart,right,{first:true,final:true});
      const drawStave=(top,key)=><g key={key}>{[0,1,2,3,4].map(line=><line key={line} x1={left} x2={right} y1={top+line*gap} y2={top+line*gap} stroke={ink} strokeWidth="1.32"/>)}<WorksheetGlyph symbolKey="gClef" x={clefX} y={y(2,top)} gap={gap} colour={ink}/><WorksheetOutlineGlyph symbolKey={`timeSig${question.timeSignature.split("/")[0]}`} x={timeX} y={top+gap*1.125} fontSize={gap*3.5} colour={ink}/><WorksheetOutlineGlyph symbolKey="timeSig4" x={timeX} y={top+gap*3.125} fontSize={gap*3.5} colour={ink}/><WorksheetOutlineGlyph symbolKey="barlineFinal" x={right} y={top+gap*4} fontSize={gap*4} colour={ink} anchor="end"/></g>;
      const zoomTransform=(top)=>`translate(160 ${top+gap*2}) scale(${staveZoom}) translate(-160 ${-(top+gap*2)})`;
      return <svg viewBox="0 0 320 200" className="h-full max-h-48 w-full" aria-label={level==="N3"?"Completed bar above an empty repetition bar":"Sequence source bar above an empty answer stave"}>
        <g transform={zoomTransform(topBar)}>{drawStave(topBar,"source-stave")}<WorksheetMelodyNotes steps={question.sourceMelody} rhythms={question.rhythms} xs={noteXs} top={topBar} gap={gap} ink={ink} prefix="source"/></g>
        <g transform={zoomTransform(bottomBar)}>{drawStave(bottomBar,"copy-stave")}{completed?<WorksheetMelodyNotes steps={question.answerMelody} rhythms={question.rhythms} xs={noteXs} top={bottomBar} gap={gap} ink={ink} prefix="answer"/>:null}{completed&&muted?<rect className="melodic-example-answer-box" x={left-5} y={bottomBar-13} width={right-left+10} height={gap*4+26} fill="none" stroke={ink} strokeWidth="1.5"/>:null}</g>
      </svg>;
    }
    const left=18, right=320, top=55, gap=10, signatureX=65, timeX=88, musicStart=112, middle=214;
    const y=(step)=>top+gap*4-step*(gap/2);
    const fadeId=`missingnotes-staff-fade-${question.id}-${completed?"answer":"question"}`;
    const sourceXs=missingNotesBarPositions(question.rhythms,musicStart,middle,{first:true}), answerXs=missingNotesBarPositions(question.rhythms,middle,right+2,{final:true});
    return <svg viewBox="0 0 320 132" className="h-full max-h-32 w-full" aria-label="Two-bar melodic pattern with a missing second bar">
      <defs><linearGradient id={fadeId} x1="304" x2={right} y1="0" y2="0" gradientUnits="userSpaceOnUse"><stop offset="0%" stopColor="white"/><stop offset="35%" stopColor="white"/><stop offset="100%" stopColor="black"/></linearGradient><mask id={`${fadeId}-mask`} maskUnits="userSpaceOnUse" x="0" y="0" width={right} height="132"><rect x="0" y="0" width={right} height="132" fill={`url(#${fadeId})`}/></mask></defs>
      <g mask={`url(#${fadeId}-mask)`}>
        {[0,1,2,3,4].map(line=><line key={line} x1={left} x2={right+34} y1={top+line*gap} y2={top+line*gap} stroke={ink} strokeWidth="1.2"/>)}
        <WorksheetGlyph symbolKey="gClef" x={left+gap*3.2} y={y(2)} gap={gap} colour={ink}/>
        <WorksheetOutlineGlyph symbolKey={`timeSig${question.timeSignature.split("/")[0]}`} x={timeX} y={top+11} fontSize={35} colour={ink}/>
        <WorksheetOutlineGlyph symbolKey="timeSig4" x={timeX} y={top+31} fontSize={35} colour={ink}/>
        <line x1={middle} x2={middle} y1={top} y2={top+gap*4} stroke={ink} strokeWidth="1.2"/>
        <WorksheetOutlineGlyph symbolKey="barlineFinal" x={right} y={top+gap*4} fontSize={gap*4} colour={ink} anchor="end"/>
        <WorksheetMelodyNotes steps={question.sourceMelody} rhythms={question.rhythms} xs={sourceXs} top={top} gap={gap} ink={ink} prefix="source"/>
        {!completed?<WorksheetMelodyNotes steps={question.rhythms.map(()=>2)} rhythms={question.rhythms} xs={answerXs} top={0} gap={7} ink={ink} prefix="guide"/>:<WorksheetMelodyNotes steps={question.answerMelody} rhythms={question.rhythms} xs={answerXs} top={top} gap={gap} ink={ink} prefix="answer"/>}
      </g>
    </svg>;
  }

  function Staff({ question, completed=false, muted=false, showNoteNames=false }) {
    if (CONFIG.activityId === "accidentals") return <AccidentalsStaff question={question} completed={completed} muted={muted} />;
    if (CONFIG.activityId === "enharmonics") return <EnharmonicsStaff question={question} completed={completed} muted={muted} />;
    if (CONFIG.activityId === "keysig") return <KeySignatureStaff question={question} completed={completed} muted={muted} />;
    if (CONFIG.activityId === "chords" && level === "N5") return <N5ChordStaff question={question} muted={muted} showNoteNames={showNoteNames} />;
    if (CONFIG.activityId === "chords" && level === "AH") return <AHChordStaff question={question} completed={completed} muted={muted} />;
    if (CONFIG.activityId === "missingnotes") return <MissingNotesStaff question={question} completed={completed} muted={muted} />;
    const ink = muted ? "#78716c" : "#000";
    const y = (step) => 72 - step * 6;
    const notes = question.sourceMelody || question.melody || [question.step];
    const positions=question.sourceMelody?notes.map((_,i)=>90+i*28):notes.map((_,i)=>112+i*(174/Math.max(1,notes.length-1)));
    const ledgerLines=(step,x,key)=>{const lines=[];for(let ledger=-2;ledger>=step;ledger-=2)lines.push(ledger);for(let ledger=10;ledger<=step;ledger+=2)lines.push(ledger);return lines.map(ledger=><line key={`${key}-${ledger}`} x1={x-12} x2={x+12} y1={y(ledger)} y2={y(ledger)} stroke={ink} strokeWidth="1"/>);};
    return <svg viewBox="0 0 320 120" className="h-full max-h-28 w-full" aria-label="Music notation">
      <g stroke={ink} strokeWidth="1">{[0,1,2,3,4].map(i=><line key={i} x1="28" x2="304" y1={48+i*12} y2={48+i*12}/>)}</g>
      <WorksheetOutlineGlyph symbolKey={question.clef==="bass" ? "fClef" : "gClef"} x={38} y={91} fontSize={58} colour={ink} anchor="start" />
      {question.sourceMelody&&<line x1="210" x2="210" y1="48" y2="96" stroke={ink}/>}
      {question.label && <text x="112" y="75" fill={ink} fontSize="20" fontWeight="700">{question.label}</text>}
      {question.stack
        ? question.stack.map((s,i)=><WorksheetOutlineGlyph key={i} symbolKey="quarterNoteStemUp" x={145} y={y(s)+7} fontSize={34} colour={ink} anchor="start" />)
        : notes.map((s,i)=><g key={i}>{ledgerLines(s,positions[i],`ledger-${i}`)}{CONFIG.activityId==="notenaming"&&question.noteAccidental?<WorksheetGlyph symbolKey={question.noteAccidental==="sharp"?"sharpInScore":"flatInScore"} x={positions[i]-20} y={y(s)} gap={10} colour={ink}/>:null}<WorksheetOutlineGlyph symbolKey="quarterNoteStemUp" x={positions[i]} y={y(s)+7} fontSize={34} colour={ink} anchor="start" /></g>)}
      {completed&&Number.isInteger(question.answerStep)?<WorksheetOutlineGlyph symbolKey="quarterNoteStemUp" x={230} y={y(question.answerStep)+7} fontSize={34} colour={ink} anchor="start" />:null}
      {completed&&question.sourceMelody&&question.answerMelody?.map((s,i)=><WorksheetOutlineGlyph key={`a${i}`} symbolKey="quarterNoteStemUp" x={226+i*18} y={y(s)+7} fontSize={30} colour={ink} anchor="start" />)}
      {question.marking&&!completed?<text x="175" y="43" fill={ink} fontWeight="700">{question.marking}</text>:null}
      {question.repeatSigns&&completed?<><WorksheetOutlineGlyph symbolKey="repeatLeft" x={69} y={84} fontSize={28} colour={ink} anchor="start" /><WorksheetOutlineGlyph symbolKey="repeatRight" x={270} y={84} fontSize={28} colour={ink} anchor="start" /></>:null}
      {question.build && !completed ? <rect x="105" y="38" width="120" height="58" rx="6" fill="none" stroke={ink} strokeDasharray="4 3"/> : null}
      {CONFIG.activityId==="rests" && !completed ? <rect x="150" y="38" width="48" height="58" rx="6" fill="none" stroke={ink}/> : null}
      {completed && ["enharmonics","transposing","keysig","rests","accidentals","chords","articulation"].includes(CONFIG.activityId) ? <text x="240" y="110" fill={ink} fontSize="14" fontWeight="700">{question.answer || "✓"}</text> : null}
    </svg>;
  }

  const QUESTION_VARIABLE_PATTERN = /(one octave (?:higher|lower)|at the same pitch|one step (?:higher|lower)|(?:tone|semitone) (?:higher|lower)|\b(?:tone|semitone)\b|(?:root position|first inversion|second inversion|1st inversion|2nd inversion)|(?:tonic|subdominant|dominant)|(?:staccato|slur|accent|phrase mark)|(?:quaver triplet|crotchet triplet)|(?:crescendo|diminuendo|Adagio|Andante|Moderato|Allegro)|(?:sharp|flat|natural)|\b(?:p|f)\b|[A-G](?:♯|♭|#|b)|(?:C|G|F|D|B♭|A|E) (?:major|minor)|(?:2|3|4|5|6|7|9|12)\/(?:2|4|8|16)|bars? \d+(?:\s*(?:and|to|-|–)\s*\d+)?)/gi;
  const QUESTION_VARIABLE_ONLY_PATTERN = /^(?:one octave (?:higher|lower)|at the same pitch|one step (?:higher|lower)|(?:tone|semitone) (?:higher|lower)|(?:tone|semitone)|(?:root position|first inversion|second inversion|1st inversion|2nd inversion)|(?:tonic|subdominant|dominant)|(?:staccato|slur|accent|phrase mark)|(?:quaver triplet|crotchet triplet)|(?:crescendo|diminuendo|Adagio|Andante|Moderato|Allegro)|(?:sharp|flat|natural)|(?:p|f)|[A-G](?:♯|♭|#|b)|(?:C|G|F|D|B♭|A|E) (?:major|minor)|(?:2|3|4|5|6|7|9|12)\/(?:2|4|8|16)|bars? \d+(?:\s*(?:and|to|-|–)\s*\d+)?)$/i;

  function EmphasisedPrompt({ children }) {
    if (typeof children !== "string") return children;
    return <>{children.split(QUESTION_VARIABLE_PATTERN).map((part,index)=><React.Fragment key={`${index}-${part}`}>{QUESTION_VARIABLE_ONLY_PATTERN.test(part)?<strong>{part}</strong>:part}</React.Fragment>)}</>;
  }

  function Question({ question, number, example=false, answers=false, numbers=true, marks=true }) {
    const completed = example || answers;
    const compactChord = CONFIG.activityId === "chords" && level === "N5";
    const compactRepetition = CONFIG.activityId === "missingnotes" && level === "N3";
    const smallAHChordPrompt = CONFIG.activityId === "chords" && level === "AH";
    const answerIsInNotation = CONFIG.activityId === "enharmonics" || CONFIG.activityId === "missingnotes" || (CONFIG.activityId === "keysig" && question.build) || (CONFIG.activityId === "chords" && level === "AH");
    return <section className={`generic-question ${example ? "bg-stone-100 text-stone-500" : ""}`}>{compactChord||compactRepetition?<div className="min-h-6 text-sm"><strong>{example ? "Example Answer" : numbers ? `${number}.` : ""}</strong></div>:<div className="flex min-h-9 items-start gap-1 text-sm"><strong>{example ? "Example Answer" : numbers ? `${number}.` : ""}</strong><span className={smallAHChordPrompt?"text-xs":""}><EmphasisedPrompt>{question.prompt}</EmphasisedPrompt></span></div>}{CONFIG.activityId==="rhythmsums" ? <div className="flex flex-1 items-center justify-center gap-5 text-4xl"><WorksheetRhythmGlyph symbolKey={question.left.symbolKey}/><strong>{question.operator}</strong><WorksheetRhythmGlyph symbolKey={question.right.symbolKey}/></div> : <Staff question={question} completed={completed} muted={example} showNoteNames={example}/>}<div className="relative flex min-h-8 items-end justify-center">{question.response!=="mark" && question.response!=="stave" ? <div className="w-4/5 border-b border-black pb-1 text-center font-semibold">{completed ? question.answer : ""}</div> : completed && !answerIsInNotation ? <strong className="text-sm">{question.answer}</strong> : null}{marks && !example ? <strong className="absolute bottom-1 right-1 text-sm">1</strong> : null}</div></section>;
  }

  function Pages({ data, answers=false, offset=0, total=1 }) {
    const perPage = DEF.large || (CONFIG.activityId === "chords" && level === "AH") ? 4 : 6;
    const examples = answers ? [] : data.examples?.length ? data.examples : data.example ? [data.example] : [];
    const items = answers ? data.questions : [...examples, ...data.questions];
    const pages=[]; for(let i=0;i<items.length;i+=perPage) pages.push(items.slice(i,i+perPage));
    return pages.map((items,pageIndex)=><article className="worksheet-page generic-page" key={`${answers}-${pageIndex}`}><div className="worksheet-header-card mb-4 rounded-xl border border-black p-4"><div className="flex items-center gap-3"><img src={DEF.icon} className="h-12 w-12 object-contain" alt=""/><div className="min-w-0"><h1 className="text-xl font-bold leading-tight">{answers ? `${data.title} - Answers` : data.title}</h1>{!answers&&<p className="text-sm text-stone-700">{data.instructions}</p>}</div></div>{!answers&&pageIndex===0?<div className="mt-4 flex gap-5 text-sm">{data.name&&<span className="flex min-w-0 flex-[2] items-end gap-2"><span className="shrink-0">Name:</span><span className="pupil-detail-line mb-[3px] h-px min-w-8 flex-1 bg-black"/></span>}{data.classField&&<span className="flex min-w-0 flex-1 items-end gap-2"><span className="shrink-0">Class:</span><span className="pupil-detail-line mb-[3px] h-px min-w-8 flex-1 bg-black"/></span>}{data.date&&<span className="flex min-w-0 flex-1 items-end gap-2"><span className="shrink-0">Date:</span><span className="pupil-detail-line mb-[3px] h-px min-w-8 flex-1 bg-black"/></span>}</div>:null}</div><div className={`generic-grid grid flex-1 grid-cols-2 ${data.gridlines?"with-gridlines":""}`}>{items.map((q,i)=>{const example=!answers&&pageIndex===0&&i<examples.length; const n=answers?pageIndex*perPage+i+1:pageIndex*perPage+i-examples.length+1; return <Question key={q.id} question={q} number={n} example={example} answers={answers} numbers={data.numbers} marks={data.marks}/>})}</div>{!answers&&data.marks&&pageIndex===pages.length-1?<div className="mt-3 flex justify-end gap-3 text-sm font-bold"><span className="h-8 leading-8">Total marks</span><span className="total-marks-box relative h-8 w-24 border border-black"><span className="total-marks-value absolute left-2 right-2 text-right leading-none">/ {data.questions.length}</span></span></div>:null}<footer className="mt-2 flex justify-between text-[10px] text-stone-400"><span>The Music Literacy Hub</span><span>Page {offset+pageIndex+1} of {total}</span></footer></article>);
  }

  function GenericApp() {
    const initialCount=10;
    const [count,setCount]=useGenericState(initialCount), [questions,setQuestions]=useGenericState(()=>Array.from({length:initialCount},(_,i)=>makeQuestion(i)));
    const [title,setTitle]=useGenericState(defaultTitle), [instructions,setInstructions]=useGenericState(defaultInstructions);
    const [name,setName]=useGenericState(true), [classField,setClassField]=useGenericState(true), [date,setDate]=useGenericState(true), [numbers,setNumbers]=useGenericState(true), [marks,setMarks]=useGenericState(true), [gridlines,setGridlines]=useGenericState(true), [exampleOn,setExampleOn]=useGenericState(true), [answersOn,setAnswersOn]=useGenericState(false), [downloading,setDownloading]=useGenericState(false);
    const [previewVisible,setPreviewVisible]=useGenericState(true), refreshTimer=useGenericRef(null);
    const examples=useGenericMemo(()=>CONFIG.activityId==="chords"&&level==="AH"?AH_WORKSHEET_TYPES.map((type,typeIndex)=>makeQuestion(-1-typeIndex,type)):[makeQuestion(-1)],[]);
    const activeExamples=exampleOn?examples:[];
    const data={questions,title,instructions,name,classField,date,numbers,marks,gridlines,examples:activeExamples,example:activeExamples[0]||null};
    const perPage=DEF.large||(CONFIG.activityId==="chords"&&level==="AH")?4:6, qPages=Math.ceil((questions.length+activeExamples.length)/perPage), aPages=answersOn?Math.ceil(questions.length/perPage):0, total=qPages+aPages;
    const changeCount=(value)=>{const n=Number(value);setCount(n);setQuestions(current=>current.length>=n?current.slice(0,n):[...current,...Array.from({length:n-current.length},(_,i)=>makeQuestion(current.length+i))]);};
    const refresh=()=>{if(refreshTimer.current)clearTimeout(refreshTimer.current);setPreviewVisible(false);refreshTimer.current=setTimeout(()=>{setQuestions(Array.from({length:count},(_,i)=>makeQuestion(i)));setPreviewVisible(true);refreshTimer.current=null;},260);};
    useGenericEffect(()=>()=>{if(refreshTimer.current)clearTimeout(refreshTimer.current);},[]);
    const check=(label,value,setter)=><label className="flex items-center gap-2 whitespace-nowrap text-sm"><input className="worksheet-checkbox" type="checkbox" checked={value} onChange={e=>setter(e.target.checked)}/>{label}</label>;
    async function download(){
      setDownloading(true);
      const pages=[...document.querySelectorAll(".generic-page")];
      try {
        pages.forEach((page) => page.classList.add("pdf-capture"));
        const {jsPDF}=window.jspdf;
        const pdf=new jsPDF({unit:"mm",format:"a4",orientation:"portrait"});
        for(let i=0;i<pages.length;i++){
          if(i)pdf.addPage();
          const canvas=await html2canvas(pages[i],{
            scale:2.5,
            backgroundColor:"#fff",
            useCORS:true,
          });
          pdf.addImage(canvas.toDataURL("image/png"),"PNG",0,0,210,297,undefined,"FAST");
        }
        pdf.save(`${window.MLH.safePdfTitle(title, DEF.title)}.pdf`);
      } catch (error) {
        window.alert(error?.message || "The worksheet PDF could not be created. Please try again.");
      } finally {
        pages.forEach((page) => page.classList.remove("pdf-capture"));
        setDownloading(false);
      }
    }
    window.MLH.worksheetHeaderMode={title:DEF.title,subtitle:CONFIG.subtitle||DEF.subtitle,icon:DEF.icon,assets:{},onExit:()=>{const saved=sessionStorage.getItem("worksheetReturnUrl");if(saved&&history.length>1)history.back();else location.href=saved||CONFIG.sourceUrl||"index.html";}};
    return <div className={window.MLH.shell.pageShellClass}><window.MLH.AppHeader icon={DEF.icon} title="Create a worksheet" subtitle={CONFIG.subtitle||DEF.subtitle}/><div className={`${window.MLH.shell.pageContentClass} worksheet-page-content`}><main className={`${window.MLH.shell.mainShellClass} worksheet-builder h-auto min-h-0 p-4 md:p-6`}><div className="no-print"><div className="mb-6 rounded-xl border border-stone-200 bg-stone-50 px-4 py-3"><h2 className="flex items-center gap-2 text-xl font-bold"><img src={DEF.icon} className="h-7 w-7 object-contain" alt=""/>{DEF.title} · {LEVEL_NAMES[level]||level}</h2><p className="mt-1 text-sm text-stone-600">Generate a printable worksheet using the current activity and settings.</p></div><div className="rounded-xl border border-stone-200 bg-white p-4"><h2 className="flex items-center gap-2 text-xl font-bold"><img src="customise.svg" className="h-6 w-6" alt=""/>Customise</h2><p className="text-sm text-stone-600">Adjust the worksheet content and layout.</p><div className="mt-4 space-y-4"><label className="block text-sm font-semibold">Title<input className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 font-normal" value={title} onChange={e=>setTitle(e.target.value)}/></label><label className="block text-sm font-semibold">Instructions<textarea ref={window.MLH.resizeWorksheetTextarea} rows="2" className="mt-1 min-h-16 w-full resize-none overflow-hidden rounded-lg border border-stone-300 px-3 py-2 font-normal" value={instructions} onChange={e=>{window.MLH.resizeWorksheetTextarea(e.currentTarget);setInstructions(e.target.value);}}/></label><div className="flex flex-wrap gap-7">{check("Name",name,setName)}{check("Class",classField,setClassField)}{check("Date",date,setDate)}</div><label className="flex items-center justify-between border-t border-stone-200 pt-4 text-sm font-semibold">Number of Questions<select className="w-32 rounded-lg border border-stone-300 px-3 py-2" value={count} onChange={e=>changeCount(e.target.value)}>{[10,15,20,25].map(n=><option key={n}>{n}</option>)}</select></label><div className="grid grid-cols-[minmax(0,1fr)_max-content_max-content] gap-x-3 gap-y-3">{check("Question Numbers",numbers,setNumbers)}{check("Marks",marks,setMarks)}{check("Gridlines",gridlines,setGridlines)}{check("Example Answer",exampleOn,setExampleOn)}{check("Print Answers",answersOn,setAnswersOn)}</div><div className="grid grid-cols-3 gap-2 border-t border-stone-200 pt-4"><button onClick={refresh} className="flex h-11 items-center justify-center gap-2 rounded-xl border border-stone-300 font-semibold"><img src="restart.svg" className="h-5 w-5" alt=""/>Refresh</button><button onClick={download} disabled={downloading} className="flex h-11 items-center justify-center gap-2 rounded-xl bg-black font-bold text-white"><img src="download.svg" className="h-5 w-5 invert" alt=""/>{downloading?"Preparing…":"Download"}</button><button onClick={()=>print()} className="flex h-11 items-center justify-center gap-2 rounded-xl bg-black font-bold text-white"><img src="worksheet.svg" className="h-4 w-4 invert" alt=""/>Print</button></div></div></div></div><section className="print-area worksheet-preview-panel"><div className="no-print mb-4"><h2 className="flex items-center gap-2 text-xl font-bold"><img src="worksheet.svg" className="h-6 w-6" alt=""/>Preview</h2><p className="text-sm text-stone-600">Updates automatically as you change the options.</p></div><div className={`transition-opacity duration-300 ${previewVisible?"opacity-100":"opacity-0"}`}><Pages data={data} total={total}/>{answersOn?<div className="answer-sheet-start-new"><Pages data={{...data,example:null}} answers offset={qPages} total={total}/></div>:null}</div></section></main></div></div>;
  }
  window.MLHGenericWorksheetApp=GenericApp;
  ReactDOM.createRoot(document.getElementById("root")).render(<GenericApp />);
})();
