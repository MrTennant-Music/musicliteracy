const { useEffect: useGenericEffect, useMemo: useGenericMemo, useRef: useGenericRef, useState: useGenericState } = React;

(() => {
  const CONFIG = (() => { try { return JSON.parse(sessionStorage.getItem("worksheetSourceConfig") || "null"); } catch { return null; } })();
  if (!CONFIG || CONFIG.version !== 1 || CONFIG.activityId === "intervals") return;

  const DEFINITIONS = {
    enharmonics: { title: "Enharmonic Equivalents", subtitle: "Identify and rewrite enharmonic equivalent notes.", icon: "enharmonic-icon.svg", instructions: "Write the enharmonic equivalent of each note.", response: "stave" },
    keysig: { title: "Key Signatures", subtitle: "Identify key signatures.", icon: "key-signatures-icon.svg", instructions: "Identify the key signatures shown below.", response: "mixed" },
    notenaming: { title: "Note Identification", subtitle: "Identify note names in the treble and bass clef.", icon: "notenaming-icon.svg", instructions: "Name each note shown below.", response: "text" },
    tonic: { title: "Scale Degrees", subtitle: "Identify tonic, subdominant and dominant notes.", icon: "scale-degrees-icon.svg", instructions: "Circle the requested scale degree in each melody.", response: "mark" },
    transposing: { title: "Transposing", subtitle: "Transpose between the treble and bass clefs.", icon: "transposing-icon.svg", instructions: "Transpose the following notes one octave lower into the bass clef.", response: "stave" },
    barlines: { title: "Barlines", subtitle: "Insert barlines at the correct place in the music.", icon: "barlines-icon.svg", instructions: "Insert the missing barlines in each example and finish with a double barline.", response: "mark", large: true },
    rests: { title: "Rests", subtitle: "Identify and apply rests.", icon: "rests-icon.svg", instructions: "Write the missing rest in each outlined space. Be sure to check the time signature.", response: "stave", large: true },
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
  document.body.classList.toggle("worksheet-activity-tonic", CONFIG.activityId === "tonic");
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
  const BARLINES_LEVEL_RULES={
    N3:{rhythms:["crotchet","minim","dotted-minim","semibreve"],times:["2/4","3/4","4/4"],range:[0,8]},
    N4:{rhythms:["crotchet","minim","dotted-minim","semibreve","quaver","semiquaver"],times:["2/4","3/4","4/4"],range:[-2,10]},
    N5:{rhythms:["crotchet","minim","dotted-minim","semibreve","quaver","semiquaver","dotted-crotchet","dotted-quaver"],times:["2/4","3/4","4/4"],range:[-2,10]},
    H:{rhythms:["crotchet","minim","dotted-minim","semibreve","quaver","semiquaver","dotted-crotchet","dotted-quaver","rests"],times:["2/4","3/4","4/4","6/8","9/8","12/8"],range:[-2,10]},
    AH:{rhythms:["crotchet","minim","dotted-minim","semibreve","quaver","semiquaver","dotted-crotchet","dotted-quaver","rests","ties","syncopation"],times:["2/4","3/4","4/4","5/4","6/8","9/8","12/8"],range:[-4,12]},
  };
  const BARLINES_SIMPLE_PATTERNS={
    "2/4":[["minim"],["crotchet","crotchet"],["quaver-group-2","crotchet"],["crotchet","quaver-group-2"],["quaver-group-2","quaver-group-2"],["semiquaver-group-4","semiquaver-group-4"],["semiquaver-group-4","crotchet"],["crotchet","semiquaver-group-4"],["quaver-2semiquavers","crotchet"],["2semiquavers-quaver","crotchet"],["dotted-quaver-semiquaver","crotchet"],["dotted-crotchet","quaver"],["quaver","dotted-crotchet"],["crotchet-rest","crotchet"],["crotchet","crotchet-rest"],["quaver-rest","quaver","crotchet"]],
    "3/4":[["dotted-minim"],["minim","crotchet"],["crotchet","minim"],["crotchet","crotchet","crotchet"],["quaver-group-2","crotchet","crotchet"],["crotchet","quaver-group-2","crotchet"],["crotchet","crotchet","quaver-group-2"],["semiquaver-group-4","semiquaver-group-4","semiquaver-group-4"],["semiquaver-group-4","crotchet","crotchet"],["crotchet","semiquaver-group-4","crotchet"],["dotted-crotchet","quaver","crotchet"],["crotchet","dotted-crotchet","quaver"],["crotchet-rest","crotchet","crotchet"],["crotchet","crotchet-rest","crotchet"],["crotchet","crotchet","crotchet-rest"]],
    "4/4":[["semibreve"],["minim","minim"],["minim","crotchet","crotchet"],["crotchet","crotchet","minim"],["crotchet","crotchet","crotchet","crotchet"],["quaver-group-2","crotchet","crotchet","crotchet"],["crotchet","quaver-group-2","crotchet","crotchet"],["crotchet","crotchet","quaver-group-2","crotchet"],["quaver-group-2","quaver-group-2","minim"],["semiquaver-group-4","semiquaver-group-4","semiquaver-group-4","semiquaver-group-4"],["semiquaver-group-4","crotchet","crotchet","crotchet"],["crotchet","quaver-2semiquavers","crotchet","crotchet"],["crotchet","crotchet","2semiquavers-quaver","crotchet"],["dotted-crotchet","quaver","minim"],["minim","dotted-crotchet","quaver"],["semibreve-rest"],["minim-rest","minim"],["crotchet","crotchet-rest","minim"]],
    "5/4":[["semibreve","crotchet"],["crotchet","semibreve"],["minim","minim","crotchet"],["crotchet","minim","minim"],["crotchet","crotchet","crotchet","crotchet","crotchet"],["syncopated-crotchets","minim","crotchet"],["minim","syncopated-crotchets","crotchet"],["dotted-crotchet","quaver","minim","crotchet"],["crotchet","dotted-crotchet","quaver","minim"],["quaver-group-2","crotchet","crotchet","minim"],["semiquaver-group-4","crotchet","crotchet","minim"]],
  };
  const BARLINES_COMPOUND_BEATS=[["dotted-crotchet"],["crotchet","quaver"],["quaver","crotchet"],["quaver-group-3"],["dotted-crotchet-rest"]];
  const BARLINES_RHYTHM_SPACING={semibreve:8,"dotted-minim":6,minim:4,"dotted-crotchet":3,crotchet:2.2,quaver:1.15,"dotted-quaver":1.5,semiquaver:.72,"semibreve-rest":8,"minim-rest":4,"dotted-crotchet-rest":3,"crotchet-rest":2.2,"quaver-rest":1.15};
  const barlinesExpandToken=(token)=>token==="syncopated-crotchets"?["quaver","tie","crotchet","quaver"]:token==="quaver-group-2"?["quaver","quaver"]:token==="quaver-group-3"?["quaver","quaver","quaver"]:token==="semiquaver-group-4"?["semiquaver","semiquaver","semiquaver","semiquaver"]:token==="quaver-2semiquavers"?["quaver","semiquaver","semiquaver"]:token==="2semiquavers-quaver"?["semiquaver","semiquaver","quaver"]:token==="dotted-quaver-semiquaver"?["dotted-quaver","semiquaver"]:[token];
  const barlinesExplicitBeam=(token)=>["quaver-group-2","quaver-group-3","semiquaver-group-4","quaver-2semiquavers","2semiquavers-quaver","dotted-quaver-semiquaver"].includes(token);
  function barlinesEnabledRhythms(){
    const rules=BARLINES_LEVEL_RULES[level]||BARLINES_LEVEL_RULES.N3, configured=CONFIG.settings?.enabledRhythms||{};
    if(Object.keys(configured).length)return configured;
    return Object.fromEntries([...rules.rhythms.map(rhythm=>[rhythm,true]),...rules.times.map(signature=>[`time-${signature}`,true])]);
  }
  function barlinesRhythmAllowed(rhythm,enabled,restsEnabled){
    if(rhythm==="tie")return !!enabled.ties;
    if(rhythm.endsWith("-rest")){
      if(!restsEnabled||!enabled.rests)return false;
      if(rhythm==="semibreve-rest")return !!enabled.semibreve;
      if(rhythm==="minim-rest")return !!enabled.minim;
      if(rhythm==="dotted-crotchet-rest")return !!enabled["dotted-crotchet"];
      if(rhythm==="quaver-rest")return !!enabled.quaver;
      return !!enabled.crotchet;
    }
    return !!enabled[rhythm];
  }
  function barlinesTokenAllowed(token,enabled,restsEnabled){
    if(token==="syncopated-crotchets")return !!enabled.syncopation&&!!enabled.ties&&!!enabled.quaver&&!!enabled.crotchet;
    return barlinesExpandToken(token).every(rhythm=>barlinesRhythmAllowed(rhythm,enabled,restsEnabled));
  }
  const barlinesPatternAllowed=(pattern,enabled,restsEnabled)=>pattern.reduce((count,token)=>count+barlinesExpandToken(token).filter(rhythm=>rhythm==="semiquaver").length,0)<=8&&pattern.every(token=>barlinesTokenAllowed(token,enabled,restsEnabled));
  function makeBarlinesQuestion(base,index){
    const rules=BARLINES_LEVEL_RULES[level]||BARLINES_LEVEL_RULES.N3, enabled=barlinesEnabledRhythms(), restsEnabled=CONFIG.settings?.restsEnabled!==false;
    const supported=(configuredTimeSignatures().filter(signature=>rules.times.includes(signature))).filter(signature=>signature.includes("/8")?BARLINES_COMPOUND_BEATS.some(pattern=>barlinesPatternAllowed(pattern,enabled,restsEnabled)):(BARLINES_SIMPLE_PATTERNS[signature]||[]).some(pattern=>barlinesPatternAllowed(pattern,enabled,restsEnabled)));
    const timeSignature=(supported.length?supported:rules.times)[Math.abs(index)%Math.max(1,(supported.length?supported:rules.times).length)];
    const preferredByLevel={N4:["semiquaver","quaver",null],N5:["dotted-quaver","dotted-crotchet","semiquaver","quaver",null],H:["rest","dotted-quaver","semiquaver",null],AH:["semiquaver","dotted-quaver","rest","syncopated",null]};
    const preferred=(preferredByLevel[level]||[])[Math.abs(index)%(preferredByLevel[level]||[null]).length];
    const containsPreferred=(pattern)=>!preferred||(preferred==="rest"?pattern.some(token=>token.includes("rest")):preferred==="syncopated"?pattern.includes("syncopated-crotchets"):pattern.some(token=>barlinesExpandToken(token).includes(preferred)));
    const barCount=["5/4","9/8","12/8"].includes(timeSignature)?3:4, tokenBars=[];
    for(let barIndex=0;barIndex<barCount;barIndex+=1){
      if(timeSignature.includes("/8")){
        const groupCount=Number(timeSignature.split("/")[0])/3, allowed=BARLINES_COMPOUND_BEATS.filter(pattern=>barlinesPatternAllowed(pattern,enabled,restsEnabled));
        tokenBars.push(Array.from({length:groupCount},(_,groupIndex)=>{const preferredGroups=allowed.filter(containsPreferred), pool=barIndex===0&&groupIndex===0&&preferredGroups.length?preferredGroups:allowed;return pool[(Math.abs(index)+barIndex+groupIndex)%pool.length];}).flat());
      }else{
        const allowed=(BARLINES_SIMPLE_PATTERNS[timeSignature]||BARLINES_SIMPLE_PATTERNS["4/4"]).filter(pattern=>barlinesPatternAllowed(pattern,enabled,restsEnabled));
        const preferredPatterns=allowed.filter(containsPreferred), pool=barIndex===0&&preferredPatterns.length?preferredPatterns:allowed;
        tokenBars.push(pool[(Math.abs(index)+barIndex)%pool.length]);
      }
    }
    const items=[], bars=[], [minStep,maxStep]=rules.range;let previous=Math.max(minStep,Math.min(maxStep,random([1,2,3,4,5,6]))), pendingTie=false;
    tokenBars.forEach((tokens,barIndex)=>{const barItems=[];tokens.forEach((token,tokenIndex)=>{const expanded=barlinesExpandToken(token), beamGroupId=barlinesExplicitBeam(token)?`bar-${barIndex}-group-${tokenIndex}`:null;expanded.forEach(rhythm=>{if(rhythm==="tie"){if(items.length)items[items.length-1].tieToNext=true;pendingTie=true;return;}const isRest=rhythm.endsWith("-rest");if(!isRest){if(!pendingTie){const choices=[previous-2,previous-1,previous,previous+1,previous+2].filter(step=>step>=minStep&&step<=maxStep);previous=random(choices);}pendingTie=false;}const item={rhythm,step:previous,isRest,beamGroupId,tieToNext:false,barIndex};items.push(item);barItems.push(item);});});bars.push(barItems);});
    if(level==="AH"&&enabled.ties&&items.length>3&&Math.abs(index)%3===0){const boundary=bars[1].length?items.indexOf(bars[1][bars[1].length-1]):-1,next=boundary+1;if(boundary>=0&&items[next]&&!items[boundary].isRest&&!items[next].isRest){items[boundary].tieToNext=true;items[next].step=items[boundary].step;}}
    items.forEach((item,itemIndex)=>{const tiedNote=items[itemIndex+1];if(item.tieToNext&&tiedNote&&!item.isRest&&!tiedNote.isRest)tiedNote.step=item.step;});
    return {...base,prompt:"",timeSignature,bars,barlineItems:items,answer:"Correct barlines shown",response:"mark"};
  }
  const RESTS_TIME_SIGNATURES={
    "2/4":{type:"simple",units:8},"3/4":{type:"simple",units:12},"4/4":{type:"simple",units:16},
    "6/8":{type:"compound",units:12,groups:2},"9/8":{type:"compound",units:18,groups:3},"12/8":{type:"compound",units:24,groups:4},
  };
  const RESTS_OPTIONS=["semibreve-rest","minim-rest","dotted-crotchet-rest","crotchet-rest","quaver-rest"];
  const RESTS_UNITS={"semibreve-rest":999,"minim-rest":8,"dotted-crotchet-rest":6,"crotchet-rest":4,"quaver-rest":2};
  const RESTS_LABELS={"semibreve-rest":"Semibreve rest","minim-rest":"Minim rest","dotted-crotchet-rest":"Dotted crotchet rest","crotchet-rest":"Crotchet rest","quaver-rest":"Quaver rest"};
  function restsEnabledOptions(){
    const options=CONFIG.settings?.enabledOptions||{};
    const times=Object.keys(RESTS_TIME_SIGNATURES).filter(signature=>options[`time-${signature}`]!==false&&(!Object.keys(options).some(key=>key.startsWith("time-"))||options[`time-${signature}`]));
    const rests=RESTS_OPTIONS.filter(rest=>options[`rest-${rest}`]!==false&&(!Object.keys(options).some(key=>key.startsWith("rest-"))||options[`rest-${rest}`]));
    return {times:times.length?times:Object.keys(RESTS_TIME_SIGNATURES),rests:rests.length?rests:RESTS_OPTIONS};
  }
  function restsCompatibleTimes(rest,times){
    const compatible=times.filter(signature=>rest==="dotted-crotchet-rest"?RESTS_TIME_SIGNATURES[signature].type==="compound":rest==="minim-rest"?signature==="4/4":true);
    if(compatible.length)return compatible;
    return Object.keys(RESTS_TIME_SIGNATURES).filter(signature=>rest==="dotted-crotchet-rest"?RESTS_TIME_SIGNATURES[signature].type==="compound":rest==="minim-rest"?signature==="4/4":true);
  }
  function restsTemplate(timeSignature,answer,index){
    const info=RESTS_TIME_SIGNATURES[timeSignature], fullBar=answer==="semibreve-rest";
    if(fullBar)return {answers:[answer],before:[],after:[],isFullBar:true};
    if(info.type==="compound"){
      const targetGroup=Math.abs(index)%info.groups, before=Array.from({length:targetGroup},()=>["dotted-crotchet"]).flat(), after=Array.from({length:info.groups-targetGroup-1},()=>["dotted-crotchet"]).flat();
      if(answer==="dotted-crotchet-rest")return {answers:[answer],before,after};
      if(answer==="crotchet-rest")return Math.abs(index)%2?{answers:[answer],before:[...before,"quaver"],after}:{answers:[answer],before,after:["quaver",...after]};
      return Math.abs(index)%2?{answers:[answer],before:[...before,"quaver-group-2"],after}:{answers:[answer],before,after:["quaver-group-2",...after]};
    }
    const beats=Number(timeSignature.split("/")[0]);
    if(answer==="minim-rest")return Math.abs(index)%2?{answers:[answer],before:["minim"],after:[]}:{answers:[answer],before:[],after:["minim"]};
    if(answer==="crotchet-rest"){
      const beforeCount=Math.abs(index)%beats;
      return {answers:[answer],before:Array.from({length:beforeCount},()=>"crotchet"),after:Array.from({length:beats-beforeCount-1},()=>"crotchet")};
    }
    const beforeCount=Math.abs(index)%beats;
    return Math.abs(index)%2
      ? {answers:[answer],before:[...Array.from({length:beforeCount},()=>"crotchet"),"quaver"],after:Array.from({length:beats-beforeCount-1},()=>"crotchet")}
      : {answers:[answer],before:Array.from({length:beforeCount},()=>"crotchet"),after:["quaver",...Array.from({length:beats-beforeCount-1},()=>"crotchet")]};
  }
  function restsNotesFromTokens(tokens,startStep,prefix){
    let step=startStep;
    const items=[];
    tokens.forEach((token,tokenIndex)=>{
      const expanded=barlinesExpandToken(token),beamGroupId=barlinesExplicitBeam(token)?`${prefix}-${tokenIndex}`:null;
      expanded.forEach(rhythm=>{const choices=[step-1,step,step+1].filter(value=>value>=0&&value<=8);step=random(choices);items.push({rhythm,step,isRest:false,beamGroupId,tieToNext:false});});
    });
    return {items,nextStep:step};
  }
  function makeRestsQuestion(base,index){
    const enabled=restsEnabledOptions(), regularRests=enabled.rests.filter(rest=>rest!=="semibreve-rest"), useWholeBar=enabled.rests.includes("semibreve-rest")&&(regularRests.length===0||(index>=0&&index%15===14)), answer=useWholeBar?"semibreve-rest":regularRests[Math.abs(index)%regularRests.length], compatibleTimes=restsCompatibleTimes(answer,enabled.times), timeSignature=compatibleTimes[Math.abs(index)%compatibleTimes.length], template=restsTemplate(timeSignature,answer,index);
    const before=restsNotesFromTokens(template.before,random([1,2,3,4,5,6]),`rests-before-${base.id}`), after=restsNotesFromTokens(template.after,before.nextStep,`rests-after-${base.id}`);
    const missingBoxes=template.answers.map((rest,boxIndex)=>({id:`${base.id}-missing-${boxIndex}`,answer:rest,units:template.isFullBar?RESTS_TIME_SIGNATURES[timeSignature].units:RESTS_UNITS[rest],isFullBar:Boolean(template.isFullBar)}));
    const missingItems=missingBoxes.map(box=>({rhythm:"missing",missingBoxId:box.id,units:box.units,isFullBar:box.isFullBar}));
    return {...base,prompt:"",timeSignature,restItems:[...before.items,...missingItems,...after.items],missingBoxes,answer:template.answers.map(rest=>RESTS_LABELS[rest]).join(" and "),response:"stave"};
  }
  function missingNotesBarPositions(rhythms,start,end,{first=false,final=false}={}){
    const scoreStart=start+(first?4:15), scoreEnd=end-(final?24:4);
    const units=rhythms.reduce((sum,rhythm)=>sum+(MISSING_NOTES_RHYTHM_SPACING[rhythm]||1.35),0);
    const unit=Math.max(1,scoreEnd-scoreStart)/Math.max(1,units);
    let cursor=scoreStart+unit*.38;
    return rhythms.map(rhythm=>{const x=cursor;cursor+=(MISSING_NOTES_RHYTHM_SPACING[rhythm]||1.35)*unit;return x;});
  }
  const RHYTHM_SUMS_LEVELS={
    N3:{rhythmIds:["crotchet","minim","dotted-minim","semibreve"],beamedIds:[],includeRests:false},
    N4:{rhythmIds:["crotchet","minim","dotted-minim","semibreve","quaver","semiquaver"],beamedIds:["two-quavers","four-semiquavers"],includeRests:false},
    N5:{rhythmIds:["crotchet","minim","dotted-minim","semibreve","quaver","semiquaver","dotted-crotchet","dotted-quaver"],beamedIds:["two-quavers","four-semiquavers","dotted-quaver-semiquaver","scotch-snap"],includeRests:false},
    H:{rhythmIds:["crotchet","minim","dotted-minim","semibreve","quaver","semiquaver","dotted-crotchet","dotted-quaver"],beamedIds:["two-quavers","four-semiquavers","dotted-quaver-semiquaver","scotch-snap","triplet-quavers","triplet-crotchets"],includeRests:true},
  };
  const WORKSHEET_RHYTHMS = {
    semibreve:{id:"semibreve",kind:"single",rhythm:"semibreve",beats:4}, "dotted-minim":{id:"dotted-minim",kind:"single",rhythm:"dotted-minim",beats:3},
    minim:{id:"minim",kind:"single",rhythm:"minim",beats:2}, "dotted-crotchet":{id:"dotted-crotchet",kind:"single",rhythm:"dotted-crotchet",beats:1.5},
    crotchet:{id:"crotchet",kind:"single",rhythm:"crotchet",beats:1}, "dotted-quaver":{id:"dotted-quaver",kind:"single",rhythm:"dotted-quaver",beats:.75},
    quaver:{id:"quaver",kind:"single",rhythm:"quaver",beats:.5}, semiquaver:{id:"semiquaver",kind:"single",rhythm:"semiquaver",beats:.25},
    "two-quavers":{id:"two-quavers",kind:"beamed",rhythms:["quaver","quaver"],beats:1}, "four-semiquavers":{id:"four-semiquavers",kind:"beamed",rhythms:["semiquaver","semiquaver","semiquaver","semiquaver"],beats:1},
    "dotted-quaver-semiquaver":{id:"dotted-quaver-semiquaver",kind:"beamed",rhythms:["dotted-quaver","semiquaver"],beats:1}, "scotch-snap":{id:"scotch-snap",kind:"beamed",rhythms:["semiquaver","dotted-quaver"],beats:1},
    "triplet-quavers":{id:"triplet-quavers",kind:"triplet",rhythms:["quaver","quaver","quaver"],beats:1}, "triplet-crotchets":{id:"triplet-crotchets",kind:"triplet",rhythms:["crotchet","crotchet","crotchet"],beats:2},
  };
  const RHYTHM_SUM_RESTS={semibreve:"semibreve-rest","dotted-minim":"dotted-minim-rest",minim:"minim-rest","dotted-crotchet":"dotted-crotchet-rest",crotchet:"crotchet-rest","dotted-quaver":"dotted-quaver-rest",quaver:"quaver-rest"};
  const TRANSPOSING_BAR_PATTERNS = [
    {rhythms:["minim","crotchet","crotchet"]},
    {rhythms:["dotted-crotchet","quaver","crotchet","crotchet"]},
    {rhythms:["crotchet","crotchet","dotted-crotchet","quaver"]},
    {rhythms:["crotchet","crotchet","crotchet","crotchet"]},
    {rhythms:["dotted-crotchet","quaver","dotted-crotchet","quaver"]},
    {rhythms:["crotchet","crotchet","minim"]},
    {rhythms:["minim","minim"]},
    {rhythms:["dotted-crotchet","quaver","minim"]},
    {rhythms:["crotchet","quaver","quaver","crotchet","crotchet"],stepwise:true},
    {rhythms:["quaver","quaver","quaver","quaver","minim"],stepwise:true},
    {rhythms:["crotchet","quaver","quaver","quaver","quaver","crotchet"],stepwise:true},
    {rhythms:["minim","quaver","quaver","quaver","quaver"],stepwise:true},
    {rhythms:["crotchet","quaver","quaver","minim"],tieStart:2},
    {rhythms:["crotchet","quaver","quaver","crotchet","crotchet"],tieStart:2},
    {rhythms:["dotted-crotchet","quaver","quaver","quaver","crotchet"],tieStart:1},
  ];
  const TRANSPOSING_RHYTHM_SPACING={minim:3.4,"dotted-crotchet":2.45,crotchet:1.65,quaver:.95};
  const N5_WORKSHEET_CHORDS = [
    { answer:"C major", notes:[{step:-2,letter:"C"},{step:0,letter:"E"},{step:2,letter:"G"}] },
    { answer:"F major", notes:[{step:1,letter:"F"},{step:3,letter:"A"},{step:5,letter:"C"}] },
    { answer:"G major", notes:[{step:2,letter:"G"},{step:4,letter:"B"},{step:6,letter:"D"}] },
    { answer:"A minor", notes:[{step:3,letter:"A"},{step:5,letter:"C"},{step:7,letter:"E"}] },
  ];
  const N5_CHORD_RHYTHMS = [["quarter","quarter","half"],["half","quarter","quarter"]];
  const TONIC_WORKSHEET_KEYS = [
    {id:"c-major",name:"C major",signature:[],tonicStep:5,targets:{tonic:"C",subdominant:"F",dominant:"G"}},
    {id:"g-major",name:"G major",signature:[{type:"sharp",step:8}],tonicStep:2,targets:{tonic:"G",subdominant:"C",dominant:"D"}},
    {id:"f-major",name:"F major",signature:[{type:"flat",step:4}],tonicStep:1,targets:{tonic:"F",subdominant:"B",dominant:"C"}},
    {id:"a-minor",name:"A minor",signature:[],tonicStep:3,targets:{tonic:"A",subdominant:"D",dominant:"E"}},
  ];
  const TONIC_BAR_PATTERNS = [
    ["minim","crotchet","crotchet"],["crotchet","crotchet","minim"],["minim","minim"],
    ["crotchet","crotchet","crotchet","crotchet"],["dotted-crotchet","quaver","crotchet","crotchet"],
    ["crotchet","quaver","quaver","crotchet","crotchet"],
  ];
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
        : CONFIG.activityId === "transposing" && level === "AH"
          ? "Transpose the following notes as instructed."
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
  function makeNoteNamingQuestion(base){
    const settings=CONFIG.settings||{};
    const clefs=[settings.treble!==false?"treble":null,settings.bass?"bass":null].filter(Boolean);
    const range=settings.advancedRange?[-4,-3,-2,-1,0,1,2,3,4,5,6,7,8,9,10,11,12]:settings.ledger===false?[0,1,2,3,4,5,6,7,8]:[-2,-1,0,1,2,3,4,5,6,7,8,9,10];
    const clef=random(clefs.length?clefs:["treble"]), noteStep=random(range), letter=noteNameForStep(noteStep,clef);
    const accidentalChoices=[null];
    if(settings.accidentals&&!["B","E"].includes(letter))accidentalChoices.push("sharp");
    if(settings.accidentals&&!["C","F"].includes(letter))accidentalChoices.push("flat");
    const noteAccidental=random(accidentalChoices);
    return {...base,step:noteStep,clef,noteAccidental,prompt:"",answer:`${letter}${accidentalText(noteAccidental)}`,response:"text"};
  }
  function makeTonicQuestion(base,index){
    const enabled=Object.entries(CONFIG.settings?.questionTypes||{}).filter(([,on])=>on).map(([name])=>name);
    const degreeChoices=enabled.length?enabled:["tonic","subdominant","dominant"], degree=degreeChoices[Math.abs(index)%degreeChoices.length], key=TONIC_WORKSHEET_KEYS[Math.abs(index)%TONIC_WORKSHEET_KEYS.length];
    const patterns=[random(TONIC_BAR_PATTERNS),random(TONIC_BAR_PATTERNS)], noteCount=patterns[0].length+patterns[1].length, targetLetter=key.targets[degree];
    let melody=[];
    for(let attempt=0;attempt<60;attempt+=1){
      const next=[key.tonicStep];
      while(next.length<noteCount-1){const previous=next[next.length-1], options=[-2,-1,1,2].map(delta=>previous+delta).filter(step=>step>=-2&&step<=10&&Math.abs(step-key.tonicStep)<=4);next.push(random(options));}
      next.push(key.tonicStep);
      if(!next.some(step=>noteNameForStep(step)===targetLetter)){const place=1+Math.floor(Math.random()*Math.max(1,next.length-2)), targetSteps=[-2,-1,0,1,2,3,4,5,6,7,8,9,10].filter(step=>noteNameForStep(step)===targetLetter).sort((a,b)=>Math.max(Math.abs(a-next[place-1]),Math.abs(a-next[place+1]))-Math.max(Math.abs(b-next[place-1]),Math.abs(b-next[place+1])));next[place]=targetSteps[0];}
      const intervals=next.slice(1).map((step,noteIndex)=>step-next[noteIndex]), range=Math.max(...next)-Math.min(...next);
      if(range<=7&&intervals.every(interval=>Math.abs(interval)<=4)&&intervals.some(interval=>interval>0)&&intervals.some(interval=>interval<0)){melody=next;break;}
    }
    if(!melody.length)melody=Array.from({length:noteCount},(_,noteIndex)=>noteIndex===0||noteIndex===noteCount-1?key.tonicStep:key.tonicStep+[1,2,1,-1][(noteIndex-1)%4]);
    const bars=[{rhythms:patterns[0],notes:melody.slice(0,patterns[0].length)},{rhythms:patterns[1],notes:melody.slice(patterns[0].length)}];
    const writtenAccidental=(step)=>key.name==="A minor"&&noteNameForStep(step)==="G"?"sharp":null;
    return {...base,prompt:`Circle an example of the ${degree} note.`,degree,key,tonicBars:bars.map(bar=>({...bar,accidentals:bar.notes.map(writtenAccidental)})),targetLetter,answer:degree,response:"mark"};
  }
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
    const settings=CONFIG.settings||{},profile=RHYTHM_SUMS_LEVELS[level]||RHYTHM_SUMS_LEVELS.N3;
    const baseIds=Array.isArray(settings.enabledItems)&&settings.enabledItems.length?settings.enabledItems:profile.rhythmIds;
    const beamedIds=settings.includeBeamedGroups===false?[]:Array.isArray(settings.enabledBeamedItems)&&settings.enabledBeamedItems.length?settings.enabledBeamedItems:profile.beamedIds;
    const pool=[...baseIds,...beamedIds].map(rhythmId=>WORKSHEET_RHYTHMS[rhythmId]).filter(Boolean);
    return pool.length?pool:profile.rhythmIds.map(rhythmId=>WORKSHEET_RHYTHMS[rhythmId]);
  }
  function rhythmSumDisplayItem(item){
    const profile=RHYTHM_SUMS_LEVELS[level]||RHYTHM_SUMS_LEVELS.N3,includeRests=(CONFIG.settings?.includeRests??profile.includeRests)&&item.kind==="single";
    const rest=includeRests&&RHYTHM_SUM_RESTS[item.id]&&Math.random()<.5?RHYTHM_SUM_RESTS[item.id]:null;
    return rest?{...item,kind:"rest",rhythm:rest}:item;
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
      case "notenaming": return makeNoteNamingQuestion(base);
      case "tonic": return makeTonicQuestion(base,index);
      case "transposing": {
        const questionOptions=CONFIG.settings?.questionOptions||{};
        const transforms=level==="AH"?[
          questionOptions.octaveLower!==false?{id:"octave-lower",sourceClef:"treble",answerClef:"bass",range:[-2,5],delta:5,prompt:"Transpose the notes one octave lower into the bass clef."}:null,
          questionOptions.octaveHigher!==false?{id:"octave-higher",sourceClef:"bass",answerClef:"treble",range:[3,10],delta:-5,prompt:"Transpose the notes one octave higher into the treble clef."}:null,
          questionOptions.samePitch!==false?{id:"same-pitch",samePitch:true,prompt:"Rewrite the notes at the same pitch in the other clef."}:null,
          questionOptions.ottava?{id:"8va",sourceClef:"treble",answerClef:"treble",range:[-2,3],delta:7,marking:"8va",prompt:"Rewrite the notes as they would sound."}:null,
          questionOptions.ottava?{id:"8vb",sourceClef:"bass",answerClef:"bass",range:[3,10],delta:-7,marking:"8vb",prompt:"Rewrite the notes as they would sound."}:null,
        ].filter(Boolean):[{id:"octave-lower",sourceClef:"treble",answerClef:"bass",range:[-2,5],delta:5,prompt:""}];
        const transform={...(transforms.length?transforms[Math.abs(index)%transforms.length]:{id:"octave-lower",sourceClef:"treble",answerClef:"bass",range:[-2,5],delta:5,prompt:"Transpose the notes one octave lower into the bass clef."})};
        if(transform.samePitch){transform.sourceClef=Math.random()<.5?"treble":"bass";transform.answerClef=transform.sourceClef==="treble"?"bass":"treble";transform.range=transform.sourceClef==="treble"?[-4,0]:[8,12];transform.delta=transform.sourceClef==="treble"?12:-12;}
        const pattern=random(TRANSPOSING_BAR_PATTERNS), rhythms=pattern.rhythms, sourceMelody=[];
        const sourceRange=Array.from({length:transform.range[1]-transform.range[0]+1},(_,rangeIndex)=>transform.range[0]+rangeIndex);
        if(pattern.stepwise){sourceMelody.push(random(sourceRange));while(sourceMelody.length<rhythms.length){const previous=sourceMelody[sourceMelody.length-1],choices=[previous-1,previous+1].filter(value=>value>=transform.range[0]&&value<=transform.range[1]);sourceMelody.push(random(choices));}}else{rhythms.forEach(()=>sourceMelody.push(random(sourceRange)));}
        if(Number.isInteger(pattern.tieStart)&&sourceMelody[pattern.tieStart+1]!==undefined)sourceMelody[pattern.tieStart+1]=sourceMelody[pattern.tieStart];
        const ties=rhythms.map((_,rhythmIndex)=>rhythmIndex===pattern.tieStart);
        return {...base,transposingType:transform.id,step:sourceMelody[0],answerStep:sourceMelody[0]+transform.delta,sourceMelody,answerMelody:sourceMelody.map(value=>value+transform.delta),rhythms,ties,clef:transform.sourceClef,sourceClef:transform.sourceClef,answerClef:transform.answerClef,marking:transform.marking||null,prompt:level==="AH"?transform.prompt:"",answer:"Transposed passage",response:"stave"};
      }
      case "barlines": return makeBarlinesQuestion(base,index);
      case "rests": return makeRestsQuestion(base,index);
      case "rhythmsums": { const pool=configuredRhythmPool(), operators=(CONFIG.settings?.enabledOperators||["+","−"]).filter(operator=>["+","−","×","÷"].includes(operator)), left=rhythmSumDisplayItem(random(pool)), right=rhythmSumDisplayItem(random(pool)), operator=random(operators.length?operators:["+"]), raw=operator==="+"?left.beats+right.beats:operator==="−"?Math.abs(left.beats-right.beats):operator==="×"?left.beats*right.beats:left.beats/right.beats; return {...base,prompt:"",left,right,operator,answer:Math.round(raw*100)/100}; }
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
    if (key === "augmentationDotLine" || key === "augmentationDotSpace") return "augmentationDot";
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

  function worksheetRestSymbolKey(rhythm) {
    if(rhythm==="semibreve-rest")return "wholeRest";
    if(rhythm==="minim-rest"||rhythm==="dotted-minim-rest")return "halfRest";
    if(rhythm==="quaver-rest"||rhythm==="dotted-quaver-rest")return "eighthRest";
    return "quarterRest";
  }

  function WorksheetRhythmGlyph({ symbolKey }) {
    return <svg viewBox="0 0 64 64" className="h-12 w-12 overflow-visible" aria-hidden="true"><WorksheetOutlineGlyph symbolKey={symbolKey} x={32} y={48} fontSize={52} colour="currentColor" /></svg>;
  }

  function WorksheetRhythmSumRest({ rhythm }) {
    const gap=10, x=60, visualScale=1, symbolKey=worksheetRestSymbolKey(rhythm), blockRest=rhythm==="semibreve-rest"||rhythm==="minim-rest"||rhythm==="dotted-minim-rest";
    const settings=worksheetSymbolSettings(symbolKey), baseY=rhythm==="semibreve-rest"?39:(rhythm==="minim-rest"||rhythm==="dotted-minim-rest")?57:(rhythm==="crotchet-rest"||rhythm==="dotted-crotchet-rest")?49:54;
    const adjustedX=x+gap*Number(settings.xOffsetScale||0)+Number(settings.opticalXOffset||0), adjustedY=baseY+(blockRest?0:gap*Number(settings.yOffsetScale||0)+Number(settings.opticalYOffset||0));
    const dotted=rhythm.startsWith("dotted-"), dotSettings=worksheetSymbolSettings("augmentationDotSpace"), dotOffset=rhythm==="dotted-quaver-rest"?2.3:1.3, dotX=x+gap*dotOffset, dotY=baseY-gap*.35;
    return <svg viewBox="0 0 120 86" className="h-16 w-20 overflow-visible" aria-label={rhythm.replaceAll("-"," ")}>
      {blockRest?<line x1={x-10} x2={x+10} y1={adjustedY} y2={adjustedY} stroke="currentColor" strokeWidth="1.5"/>:null}
      <WorksheetOutlineGlyph symbolKey={symbolKey} x={adjustedX} y={adjustedY} fontSize={gap*Number(settings.fontSizeScale||3.4)*visualScale} colour="currentColor" widthScale={settings.widthScale||1} heightScale={settings.heightScale||1}/>
      {dotted?<WorksheetOutlineGlyph symbolKey="augmentationDotSpace" x={dotX} y={dotY} fontSize={gap*Number(dotSettings.fontSizeScale||3.4)*visualScale} colour="currentColor" widthScale={dotSettings.widthScale||1} heightScale={dotSettings.heightScale||1}/>:null}
    </svg>;
  }

  function WorksheetRhythmSumItem({ item }) {
    const rhythms=item.rhythms||[item.rhythm],count=rhythms.length,xs=count===1?[60]:count===2?[37,83]:count===3?[27,60,93]:[18,46,74,102],top=34,gap=10;
    if(item.kind==="rest")return <WorksheetRhythmSumRest rhythm={rhythms[0]}/>;
    const crotchetTriplet=item.kind==="triplet"&&rhythms.every(rhythm=>rhythm==="crotchet"),beamGroupId=!crotchetTriplet&&item.kind!=="single"&&item.kind!=="rest"?`rhythm-sum-${item.id}`:null;
    const items=rhythms.map(rhythm=>({rhythm,step:4,isRest:item.kind==="rest",beamGroupId,tieToNext:false}));
    return <svg viewBox="0 0 120 86" className="h-16 w-20 overflow-visible" aria-label={item.id.replaceAll("-"," ")}>
      <BarlinesMelodyItems items={items} xs={xs} top={top} gap={gap} ink="currentColor" dottedQuaverDotOffset={1.8}/>
      {item.kind==="triplet"?(crotchetTriplet?<g fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><path d="M 20 15 L 20 9 L 50 9"/><path d="M 70 9 L 100 9 L 100 15"/><text x="60" y="14" fill="currentColor" stroke="none" textAnchor="middle" fontFamily="serif" fontSize="17" fontWeight="700">3</text></g>:<text x="60" y="14" fill="currentColor" textAnchor="middle" fontFamily="serif" fontSize="17" fontWeight="700">3</text>):null}
    </svg>;
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

  function NoteNamingStaff({ question, muted=false }) {
    const ink=muted?"#78716c":"#000";
    const left=20, right=304, top=51, gap=13, noteX=170;
    const y=(step)=>top+gap*4-step*(gap/2);
    const fadeId=`notenaming-staff-fade-${question.id}`;
    const ledgerSteps=[];
    if(question.step<=-2)ledgerSteps.push(-2);
    if(question.step<=-4)ledgerSteps.push(-4);
    if(question.step>=10)ledgerSteps.push(10);
    if(question.step>=12)ledgerSteps.push(12);
    const ledgerSettings=worksheetSymbolSettings("ledgerLines"), ledgerXOffset=gap*Number(ledgerSettings.xOffsetScale||0)+Number(ledgerSettings.opticalXOffset||0), ledgerYOffset=gap*Number(ledgerSettings.yOffsetScale||0)+Number(ledgerSettings.opticalYOffset||0);
    const ledgerHalfWidth=gap*Number(window.SHARED_NOTATION_CONFIG?.drawing?.ledgerLineWidthScale||2.4)*Number(ledgerSettings.widthScale||1)/2;
    const ledgerThickness=Math.max(1,gap*Number(window.SHARED_NOTATION_CONFIG?.drawing?.ledgerLineThicknessScale||.11)*Number(ledgerSettings.heightScale||1));
    const isLedgerLineNote=question.step<=-2||question.step>=10, accidentalLedgerOffset=isLedgerLineNote?-gap*.48:0;
    const accidentalX=question.noteAccidental==="sharp"?noteX-gap*2.33+accidentalLedgerOffset:noteX-gap*2.17+accidentalLedgerOffset;
    return <svg viewBox="0 0 320 132" className="h-full max-h-32 w-full" aria-label={`${question.clef} clef note to identify`}>
      <defs><linearGradient id={fadeId} x1={left} x2={right} y1="0" y2="0" gradientUnits="userSpaceOnUse"><stop offset="0%" stopColor={ink} stopOpacity="1"/><stop offset="84%" stopColor={ink} stopOpacity="1"/><stop offset="100%" stopColor={ink} stopOpacity="0"/></linearGradient></defs>
      {[0,1,2,3,4].map(line=><line key={line} x1={left} x2={right} y1={top+line*gap} y2={top+line*gap} stroke={`url(#${fadeId})`} strokeWidth="1.5"/>)}
      <WorksheetGlyph symbolKey={question.clef==="bass"?"fClef":"gClef"} x={left+52/18.9*gap} y={y(question.clef==="bass"?6:2)} gap={gap} colour={ink}/>
      {ledgerSteps.map(step=><line key={step} x1={noteX-ledgerHalfWidth+ledgerXOffset} x2={noteX+ledgerHalfWidth+ledgerXOffset} y1={y(step)+ledgerYOffset} y2={y(step)+ledgerYOffset} stroke={ink} strokeWidth={ledgerThickness}/>)}
      {question.noteAccidental?<WorksheetGlyph symbolKey={question.noteAccidental==="sharp"?"sharpInScore":"flatInScore"} x={accidentalX} y={y(question.step)} gap={gap} colour={ink}/>:null}
      <WorksheetGlyph symbolKey={question.step>4?"quarterNoteStemDown":"quarterNoteStemUp"} x={noteX} y={y(question.step)} gap={gap} colour={ink}/>
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

  function WorksheetMelodyNotes({ steps, rhythms, xs, top, gap, ink, prefix, accidentals=[], circled=[], ties=[] }) {
    const y=(step)=>top+gap*4-step*(gap/2);
    const noteSymbol=(rhythm,step)=>rhythm==="semibreve"?"wholeNote":rhythm==="minim"||rhythm==="dotted-minim"?(step>4?"halfNoteStemDown":"halfNoteStemUp"):rhythm==="quaver"?(step>4?"eighthNoteStemDown":"eighthNoteStemUp"):(step>4?"quarterNoteStemDown":"quarterNoteStemUp");
    const groups=[];
    for(let index=0;index<rhythms.length;){
      if(rhythms[index]!=="quaver"){index+=1;continue;}
      let end=index;
      while(end+1<rhythms.length&&rhythms[end+1]==="quaver"&&!ties[end]&&end-index<3)end+=1;
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
      {steps.map((step,index)=>{const group=groupFor(index), x=xs[index], accidental=accidentals[index], dotted=rhythms[index]?.startsWith("dotted-"), dotY=y(step)-(Math.abs(step)%2?0:gap*.25), dotKey=Math.abs(step)%2?"augmentationDotSpace":"augmentationDotLine";if(!group)return <g key={`${prefix}-note-${index}`}>{ledger(step,x,`${prefix}-ledger-${index}`)}{accidental?<WorksheetGlyph symbolKey={accidental==="sharp"?"sharpInScore":"flatInScore"} x={x-gap*2.3} y={y(step)} gap={gap} colour={ink}/>:null}<WorksheetGlyph symbolKey={noteSymbol(rhythms[index],step)} x={x} y={y(step)} gap={gap} colour={ink}/>{dotted?<WorksheetGlyph symbolKey={dotKey} x={x+gap*1.3} y={dotY} gap={gap} colour={ink}/>:null}{circled[index]?<ellipse cx={x} cy={y(step)} rx={gap*1.45} ry={gap*1.05} fill="none" stroke={ink} strokeWidth="1.5"/>:null}</g>;const beam=beamFor(group), stemX=stemXFor(x,beam.down);return <g key={`${prefix}-note-${index}`}>{ledger(step,x,`${prefix}-ledger-${index}`)}{accidental?<WorksheetGlyph symbolKey={accidental==="sharp"?"sharpInScore":"flatInScore"} x={x-gap*2.3} y={y(step)} gap={gap} colour={ink}/>:null}<WorksheetGlyph symbolKey="noteheadBlack" x={x} y={y(step)} gap={gap} colour={ink}/><line x1={stemX} x2={stemX} y1={y(step)} y2={beamY(beam,stemX)} stroke={ink} strokeWidth={gap*.125}/>{circled[index]?<ellipse cx={x} cy={y(step)} rx={gap*1.45} ry={gap*1.05} fill="none" stroke={ink} strokeWidth="1.5"/>:null}</g>;})}
      {groups.map((group,index)=>{const beam=beamFor(group), half=gap*.21;return <polygon key={`${prefix}-beam-${index}`} points={`${beam.start.x},${beam.start.y-half} ${beam.end.x},${beam.end.y-half} ${beam.end.x},${beam.end.y+half} ${beam.start.x},${beam.start.y+half}`} fill={ink}/>;})}
    </g>;
  }

  function BarlinesMelodyItems({ items, xs, top, gap, ink, dottedQuaverDotOffset=1.3 }) {
    const y=(step)=>top+gap*4-step*(gap/2), stemX=(x,down)=>x+(down?-gap*.6+1:gap*.6-1);
    const ledger=(step,x,key)=>{const lines=[];for(let ledgerStep=-2;ledgerStep>=step;ledgerStep-=2)lines.push(ledgerStep);for(let ledgerStep=10;ledgerStep<=step;ledgerStep+=2)lines.push(ledgerStep);return lines.map(ledgerStep=><line key={`${key}-${ledgerStep}`} x1={x-gap*1.125} x2={x+gap*1.125} y1={y(ledgerStep)} y2={y(ledgerStep)} stroke={ink} strokeWidth={gap*.125}/>);};
    const vectorGlyph=(symbolKey,x,yPosition,key)=><WorksheetGlyph key={key} symbolKey={symbolKey} x={x} y={yPosition} gap={gap} colour={ink}/>;
    const groupIds=[...new Set(items.map(item=>item.beamGroupId).filter(Boolean))];
    const groups=groupIds.map(id=>{const indices=items.map((item,index)=>item.beamGroupId===id&&!item.isRest?index:null).filter(index=>index!==null);return {id,indices};}).filter(group=>group.indices.length>1);
    const groupFor=(index)=>groups.find(group=>group.indices.includes(index));
    const beamData=(group)=>{const average=group.indices.reduce((sum,index)=>sum+items[index].step,0)/group.indices.length, down=average>4, first=group.indices[0], last=group.indices[group.indices.length-1], length=gap*3.1;return {down,start:{x:stemX(xs[first],down),y:y(items[first].step)+(down?length:-length)},end:{x:stemX(xs[last],down),y:y(items[last].step)+(down?length:-length)}};};
    const beamY=(beam,x)=>beam.start.y+(x-beam.start.x)/((beam.end.x-beam.start.x)||1)*(beam.end.y-beam.start.y);
    const beamPolygon=(x1,y1,x2,y2,thickness)=>`${x1},${y1-thickness/2} ${x2},${y2-thickness/2} ${x2},${y2+thickness/2} ${x1},${y1+thickness/2}`;
    const standaloneSymbol=(item)=>item.rhythm==="semibreve"?"wholeNote":item.rhythm==="minim"||item.rhythm==="dotted-minim"?(item.step>4?"halfNoteStemDown":"halfNoteStemUp"):item.rhythm==="quaver"||item.rhythm==="dotted-quaver"?(item.step>4?"eighthNoteStemDown":"eighthNoteStemUp"):item.rhythm==="semiquaver"?(item.step>4?"sixteenthNoteStemDown":"sixteenthNoteStemUp"):(item.step>4?"quarterNoteStemDown":"quarterNoteStemUp");
    return <g>
      {items.map((item,index)=>{const x=xs[index];if(item.isRest)return <g key={`rest-${index}`}>{vectorGlyph(worksheetRestSymbolKey(item.rhythm),x,y(4),`rest-glyph-${index}`)}{item.rhythm.startsWith("dotted-")?<WorksheetGlyph symbolKey="augmentationDotSpace" x={x+gap*1.1} y={y(4)-gap*.4} gap={gap} colour={ink}/>:null}</g>;const group=groupFor(index), dotted=item.rhythm.startsWith("dotted-"), dotY=y(item.step)-(Math.abs(item.step)%2?0:gap*.25), dotKey=Math.abs(item.step)%2?"augmentationDotSpace":"augmentationDotLine", dotOffset=item.rhythm==="dotted-quaver"?dottedQuaverDotOffset:1.3;return <g key={`note-${index}`}>{ledger(item.step,x,`ledger-${index}`)}{group?(()=>{const beam=beamData(group), sx=stemX(x,beam.down);return <><WorksheetGlyph symbolKey="noteheadBlack" x={x} y={y(item.step)} gap={gap} colour={ink}/><line x1={sx} x2={sx} y1={y(item.step)} y2={beamY(beam,sx)} stroke={ink} strokeWidth={gap*.125}/></>;})():<WorksheetGlyph symbolKey={standaloneSymbol(item)} x={x} y={y(item.step)} gap={gap} colour={ink}/>} {dotted?<WorksheetGlyph symbolKey={dotKey} x={x+gap*dotOffset} y={dotY} gap={gap} colour={ink}/>:null}</g>;})}
      {groups.map(group=>{const beam=beamData(group), thickness=gap*.42, secondaryOffset=(beam.down?-1:1)*gap*.72, semis=group.indices.filter(index=>items[index].rhythm==="semiquaver"), secondary=[];for(let position=0;position<semis.length;){let end=position;while(end+1<semis.length&&semis[end+1]===semis[end]+1)end+=1;const firstIndex=semis[position],lastIndex=semis[end],single=firstIndex===lastIndex,x1=stemX(xs[firstIndex],beam.down),x2=single?x1+(group.indices.indexOf(firstIndex)>0?-gap*1.15:gap*1.15):stemX(xs[lastIndex],beam.down);secondary.push(<polygon key={`${group.id}-secondary-${position}`} points={beamPolygon(x1,beamY(beam,x1)+secondaryOffset,x2,beamY(beam,x2)+secondaryOffset,thickness)} fill={ink}/>);position=end+1;}return <g key={group.id}><polygon points={beamPolygon(beam.start.x,beam.start.y,beam.end.x,beam.end.y,thickness)} fill={ink}/>{secondary}</g>;})}
      {items.map((item,index)=>{if(!item.tieToNext||!items[index+1]||item.isRest||items[index+1].isRest)return null;const next=items[index+1],left=xs[index],right=xs[index+1],above=(item.step+next.step)/2>4,base=(y(item.step)+y(next.step))/2+(above?-gap*.8:gap*.8),arch=above?-gap:gap;return <path key={`tie-${index}`} d={`M ${left} ${base} Q ${(left+right)/2} ${base+arch} ${right} ${base} Q ${(left+right)/2} ${base+arch*.72} ${left} ${base} Z`} fill={ink}/>;})}
    </g>;
  }

  function BarlinesStaff({ question, completed=false, muted=false }) {
    const ink=muted?"#78716c":"#000", left=12, right=668, top=32, gap=12, clefX=40, timeX=82, musicStart=108;
    const noteXs=[], boundaryXs=[], items=question.barlineItems;
    const totalSpacing=items.reduce((sum,item)=>sum+(BARLINES_RHYTHM_SPACING[item.rhythm]||2.2),0);
    const spacingUnit=Math.max(1,right-10-musicStart)/Math.max(1,totalSpacing);
    let cursor=musicStart+spacingUnit*.4;
    question.bars.forEach((bar,barIndex)=>{
      bar.forEach((item,barNoteIndex)=>{
        const spacing=BARLINES_RHYTHM_SPACING[item.rhythm]||2.2;
        const x=cursor;
        noteXs.push(x);
        cursor+=spacing*spacingUnit;
        if(barNoteIndex===bar.length-1&&barIndex<question.bars.length-1)boundaryXs.push(x+spacing*spacingUnit*.55);
      });
    });
    const [topNumber,bottomNumber]=question.timeSignature.split("/");
    const timeNumber=(number,y,key)=>{const digits=number.split("");return <g key={key}>{digits.map((digit,digitIndex)=><WorksheetOutlineGlyph key={`${key}-${digitIndex}`} symbolKey={`timeSig${digit}`} x={timeX+(digitIndex-(digits.length-1)/2)*gap*1.45} y={y} fontSize={gap*3.5} colour={ink}/>)}</g>;};
    return <svg viewBox="0 0 680 125" className="h-full max-h-32 w-full overflow-visible" aria-label={`${question.bars.length} bars in ${question.timeSignature}`}>
      {[0,1,2,3,4].map(line=><line key={line} x1={left} x2={right} y1={top+line*gap} y2={top+line*gap} stroke={ink} strokeWidth="1.2"/>)}
      <WorksheetGlyph symbolKey="gClef" x={clefX} y={top+gap*3} gap={gap} colour={ink}/>
      {timeNumber(topNumber,top+gap*1.12-1,"time-top")}
      {timeNumber(bottomNumber,top+gap*3.12-1,"time-bottom")}
      <BarlinesMelodyItems items={items} xs={noteXs} top={top} gap={gap} ink={ink}/>
      {completed?boundaryXs.map((x,boundaryIndex)=><line key={boundaryIndex} x1={x} x2={x} y1={top} y2={top+gap*4} stroke={ink} strokeWidth="1.6"/>):null}
      {completed&&muted?boundaryXs.map((x,boundaryIndex)=><g key={`arrow-${boundaryIndex}`} fill={ink} stroke={ink} strokeLinecap="round" strokeLinejoin="round"><line x1={x} x2={x} y1="-2" y2="19" strokeWidth="2"/><path d={`M ${x-5} 14 L ${x} 21 L ${x+5} 14`} fill="none" strokeWidth="2"/></g>):null}
      {level==="N3"&&completed?<WorksheetOutlineGlyph symbolKey="barlineFinal" x={right} y={top+gap*4} fontSize={gap*4} colour={ink} anchor="end"/>:<line x1={right} x2={right} y1={top} y2={top+gap*4} stroke={ink} strokeWidth="1.6"/>}
    </svg>;
  }

  function RestsStaff({ question, completed=false, muted=false }) {
    const ink=muted?"#78716c":"#000", left=92, right=588, top=24, gap=12, clefX=120, timeX=163, musicStart=196;
    const y=(step)=>top+gap*4-step*(gap/2), items=question.restItems||[], positions=[];
    const spacingFor=(item)=>item.rhythm==="missing"?Math.max(1.15,item.units/2):(BARLINES_RHYTHM_SPACING[item.rhythm]||2.2);
    const totalSpacing=items.reduce((sum,item)=>sum+spacingFor(item),0),spacingUnit=Math.max(1,right-musicStart-12)/Math.max(1,totalSpacing);
    let cursor=musicStart+spacingUnit*.35;
    items.forEach(item=>{positions.push(item.isFullBar?(musicStart+right)/2:cursor);cursor+=spacingFor(item)*spacingUnit;});
    const visibleItems=[],visibleXs=[];
    items.forEach((item,itemIndex)=>{if(item.rhythm!=="missing"){visibleItems.push(item);visibleXs.push(positions[itemIndex]);}});
    const [topNumber,bottomNumber]=question.timeSignature.split("/");
    const timeNumber=(number,yPosition,key)=>number.split("").map((digit,digitIndex)=><WorksheetOutlineGlyph key={`${key}-${digitIndex}`} symbolKey={`timeSig${digit}`} x={timeX+(digitIndex-(number.length-1)/2)*gap*1.45} y={yPosition} fontSize={gap*3.5} colour={ink}/>);
    const answerGlyph=(box,x,key)=><g key={key}><WorksheetGlyph symbolKey={worksheetRestSymbolKey(box.answer)} x={x} y={y(4)} gap={gap} colour={ink}/>{box.answer.startsWith("dotted-")?<WorksheetGlyph symbolKey="augmentationDotSpace" x={x+gap*1.1} y={y(4)-gap*.4} gap={gap} colour={ink}/>:null}</g>;
    return <svg viewBox="0 0 680 128" className="h-full max-h-32 w-full overflow-visible" aria-label={`One bar in ${question.timeSignature} with missing rests`}>
      {[0,1,2,3,4].map(line=><line key={line} x1={left} x2={right} y1={top+line*gap} y2={top+line*gap} stroke={ink} strokeWidth="1.2"/>)}
      <WorksheetGlyph symbolKey="gClef" x={clefX} y={y(2)} gap={gap} colour={ink}/>
      {timeNumber(topNumber,top+gap*1.12-1,"rests-time-top")}{timeNumber(bottomNumber,top+gap*3.12-1,"rests-time-bottom")}
      <BarlinesMelodyItems items={visibleItems} xs={visibleXs} top={top} gap={gap} ink={ink}/>
      {items.map((item,itemIndex)=>{if(item.rhythm!=="missing")return null;const box=question.missingBoxes.find(entry=>entry.id===item.missingBoxId),x=positions[itemIndex],width=box?.isFullBar?78:Math.max(42,Math.min(58,spacingFor(item)*spacingUnit*.78));return <g key={item.missingBoxId}><rect x={x-width/2} y={top-9} width={width} height={gap*4+17} rx="7" fill="none" stroke={ink} strokeWidth="1.6"/>{completed&&box?answerGlyph(box,x,`rests-answer-${itemIndex}`):null}</g>;})}
      <WorksheetOutlineGlyph symbolKey="barlineFinal" x={right} y={top+gap*4} fontSize={gap*4} colour={ink} anchor="end"/>
    </svg>;
  }

  function TonicStaff({ question, completed=false, muted=false }) {
    const ink=muted?"#78716c":"#000", left=2, right=338, top=35, gap=10.925*1.15, clefX=35, keyX=62, musicStart=85, middle=211.5;
    const y=(step)=>top+gap*4-step*(gap/2);
    const units={semibreve:3.2,minim:2.2,"dotted-crotchet":1.8,crotchet:1.3,quaver:1};
    const noteSymbol=(rhythm,down,beamed=false)=>rhythm==="semibreve"?"wholeNote":rhythm==="minim"?(down?"halfNoteStemDown":"halfNoteStemUp"):beamed?"noteheadBlack":rhythm==="quaver"?(down?"eighthNoteStemDown":"eighthNoteStemUp"):(down?"quarterNoteStemDown":"quarterNoteStemUp");
    const barPositions=(bar,start,end,barIndex)=>{const scoreStart=start+(barIndex===0?4:15),scoreEnd=end-(barIndex===1?24:4),total=bar.rhythms.reduce((sum,rhythm)=>sum+units[rhythm],0),unit=Math.max(1,scoreEnd-scoreStart)/Math.max(1,total);let cursor=scoreStart+unit*.38;return bar.rhythms.map(rhythm=>{const current=cursor;cursor+=units[rhythm]*unit;return current;});};
    const groupsFor=(rhythms)=>{const groups=[];for(let noteIndex=0;noteIndex<rhythms.length;noteIndex+=1){if(rhythms[noteIndex]!=="quaver")continue;const start=noteIndex;while(rhythms[noteIndex+1]==="quaver")noteIndex+=1;if(noteIndex>start)groups.push({start,end:noteIndex});}return groups;};
    const ledgerLines=(step,x,key)=>{const settings=worksheetSymbolSettings("ledgerLines"),xOffset=gap*Number(settings.xOffsetScale||0)+Number(settings.opticalXOffset||0),yOffset=gap*Number(settings.yOffsetScale||0)+Number(settings.opticalYOffset||0),halfWidth=gap*Number(window.SHARED_NOTATION_CONFIG?.drawing?.ledgerLineWidthScale||2.4)*Number(settings.widthScale||1)/2,thickness=Math.max(1,gap*Number(window.SHARED_NOTATION_CONFIG?.drawing?.ledgerLineThicknessScale||.11)*Number(settings.heightScale||1)),steps=[];for(let ledger=-2;ledger>=step;ledger-=2)steps.push(ledger);for(let ledger=10;ledger<=step;ledger+=2)steps.push(ledger);return steps.map(ledger=><line key={`${key}-${ledger}`} x1={x-halfWidth+xOffset} x2={x+halfWidth+xOffset} y1={y(ledger)+yOffset} y2={y(ledger)+yOffset} stroke={ink} strokeWidth={thickness}/>);};
    const noteheadSettings=worksheetSymbolSettings("noteheadBlack"),noteheadOutline=window.BRAVURA_WORKSHEET_OUTLINES?.symbols?.noteheadBlack,noteheadCentreOffset=gap*Number(noteheadSettings.xOffsetScale||0)+Number(noteheadSettings.opticalXOffset||0),noteheadHalfWidth=gap*Number(noteheadSettings.fontSizeScale||3.75)*(Number(noteheadOutline?.advance||295)/Number(window.BRAVURA_WORKSHEET_OUTLINES?.unitsPerEm||1000))*Number(noteheadSettings.widthScale||1)/2,tonicStemX=(x,down)=>x+noteheadCentreOffset+(down?-noteheadHalfWidth:noteheadHalfWidth);
    const renderBar=(bar,barIndex)=>{const start=barIndex?middle:musicStart,end=barIndex?right:middle,xs=barPositions(bar,start,end,barIndex),groups=groupsFor(bar.rhythms);return <g key={`bar-${barIndex}`}>{bar.notes.map((step,noteIndex)=>{const group=groups.find(item=>noteIndex>=item.start&&noteIndex<=item.end),down=group?bar.notes.slice(group.start,group.end+1).filter(value=>value>4).length>(group.end-group.start+1)/2:step>4,x=xs[noteIndex],stemX=tonicStemX(x,down),settings=worksheetSymbolSettings("quaverBeam"),stemLength=gap*3.1*Number(settings.heightScale||1),yOffset=gap*Number(settings.yOffsetScale||0),startStemX=group?tonicStemX(xs[group.start],down):0,endStemX=group?tonicStemX(xs[group.end],down):0,beam=group?{start:{x:startStemX,y:y(bar.notes[group.start])+yOffset+(down?stemLength:-stemLength)},end:{x:endStemX,y:y(bar.notes[group.end])+yOffset+(down?stemLength:-stemLength)}}:null,beamY=beam?beam.start.y+(stemX-beam.start.x)/((beam.end.x-beam.start.x)||1)*(beam.end.y-beam.start.y):null,dotted=bar.rhythms[noteIndex]==="dotted-crotchet",dotKey=step%2===0?"augmentationDotLine":"augmentationDotSpace",dotY=step%2===0?y(step)-gap*.25:y(step),circled=completed&&noteNameForStep(step)===question.targetLetter;return <g key={`note-${noteIndex}`}>{ledgerLines(step,x,`${barIndex}-${noteIndex}`)}{bar.accidentals[noteIndex]?<WorksheetGlyph symbolKey="sharpInScore" x={x-gap*2.1} y={y(step)} gap={gap} colour={ink}/>:null}<WorksheetGlyph symbolKey={noteSymbol(bar.rhythms[noteIndex],down,Boolean(group))} x={x} y={y(step)} gap={gap} colour={ink}/>{group?<line x1={stemX} x2={stemX} y1={y(step)} y2={beamY} stroke={ink} strokeWidth={Math.max(1,gap*Number(window.SHARED_NOTATION_CONFIG?.drawing?.stemThicknessScale||.12))}/>:null}{dotted?<WorksheetGlyph symbolKey={dotKey} x={x+gap*1.3} y={dotY} gap={gap} colour={ink}/>:null}{circled?<ellipse cx={x} cy={y(step)} rx={gap*1.45} ry={gap*1.05} fill="none" stroke={ink} strokeWidth="1.5"/>:null}{group&&group.start===noteIndex?(()=>{const half=Math.max(1,gap*.2*Number(settings.fontSizeScale||1));return <polygon points={`${beam.start.x},${beam.start.y-half} ${beam.end.x},${beam.end.y-half} ${beam.end.x},${beam.end.y+half} ${beam.start.x},${beam.start.y+half}`} fill={ink}/>;})():null}</g>;})}</g>;};
    return <svg viewBox="0 0 340 125" className="block h-auto w-full shrink-0 overflow-visible" aria-label={`Two-bar melody in ${question.key.name}`}>
      {[0,1,2,3,4].map(line=><line key={line} x1={left} x2={right} y1={top+line*gap} y2={top+line*gap} stroke={ink} strokeWidth="1.5"/>)}
      <WorksheetGlyph symbolKey="gClef" x={clefX} y={y(2)} gap={gap} colour={ink}/>{question.key.signature.map((item,index)=><WorksheetGlyph key={`${item.type}-${index}`} symbolKey={item.type==="sharp"?"sharpKeySignature":"flatKeySignature"} x={keyX+index*gap*1.15} y={y(item.step)} gap={gap} colour={ink}/>) }
      <line x1={middle} x2={middle} y1={top} y2={top+gap*4} stroke={ink} strokeWidth="1.5"/><WorksheetOutlineGlyph symbolKey="barlineFinal" x={right} y={top+gap*4} fontSize={gap*4} colour={ink} anchor="end"/>
      {question.tonicBars.map(renderBar)}
    </svg>;
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

  function TransposingStaff({ question, completed=false, muted=false }) {
    const ink=muted?"#78716c":"#000";
    const left=18, right=318, gap=10, ahOffset=level==="AH"?10:0, exampleOffset=completed&&muted?10:0, upperTop=13+ahOffset+exampleOffset, lowerTop=92+ahOffset+exampleOffset, musicStart=82, systemsSwapped=question.sourceClef==="bass"&&question.answerClef==="treble", sourceTop=(systemsSwapped?lowerTop:upperTop)+(level==="AH"&&question.sourceClef==="bass"?5:0), answerTop=(systemsSwapped?upperTop:lowerTop)+(level==="AH"&&question.answerClef==="bass"?5:0), svgHeight=completed&&muted?174:154;
    const sourceY=(step)=>sourceTop+gap*4-step*(gap/2);
    const answerY=(step)=>answerTop+gap*4-step*(gap/2);
    const fadeId=`transposing-staff-fade-${question.id}-${completed?"answer":"question"}`;
    const noteGap=.34, totalUnits=question.rhythms.reduce((sum,rhythm)=>sum+(TRANSPOSING_RHYTHM_SPACING[rhythm]||1.3),0)+Math.max(0,question.rhythms.length-1)*noteGap, unit=(right-musicStart-18)/Math.max(1,totalUnits);
    let cursor=musicStart;
    const noteXs=question.rhythms.map((rhythm,index)=>{const width=(TRANSPOSING_RHYTHM_SPACING[rhythm]||1.3)*unit,x=index===0?musicStart+7:cursor+width/2;cursor+=width+(index<question.rhythms.length-1?noteGap*unit:0);return x;});
    const tieLayer=(steps,top,prefix)=><g>{question.ties.map((tied,index)=>{if(!tied||steps[index+1]===undefined)return null;const y1=top+gap*4-steps[index]*(gap/2),y2=top+gap*4-steps[index+1]*(gap/2),stemsUp=steps[index]<=4&&steps[index+1]<=4,baseY=stemsUp?Math.max(y1,y2)+gap*.72:Math.min(y1,y2)-gap*.72,direction=stemsUp?1:-1,x1=noteXs[index]-gap*.15,x2=noteXs[index+1]+gap*.15,curve=gap*.68;return <path key={`${prefix}-tie-${index}`} d={`M ${x1} ${baseY} C ${x1+(x2-x1)*.25} ${baseY+direction*curve}, ${x1+(x2-x1)*.75} ${baseY+direction*curve}, ${x2} ${baseY} C ${x1+(x2-x1)*.75} ${baseY+direction*curve*.58}, ${x1+(x2-x1)*.25} ${baseY+direction*curve*.58}, ${x1} ${baseY} Z`} fill={ink}/>;})}</g>;
    const stave=(top,clef,key,yForStep)=><g key={key}>
      {[0,1,2,3,4].map(line=><line key={line} x1={left} x2={right} y1={top+line*gap} y2={top+line*gap} stroke={`url(#${fadeId})`} strokeWidth="1.2"/>)}
      <WorksheetGlyph symbolKey={clef==="bass"?"fClef":"gClef"} x={left+gap*3.2} y={yForStep(clef==="bass"?6:2)} gap={gap} colour={ink}/>
    </g>;
    const ottavaMark=question.marking?(()=>{const above=question.marking==="8va",labelY=above?sourceTop-14:sourceTop+gap*4+17,lineY=above?sourceTop-20:sourceTop+gap*4+14;return <g fill={ink} stroke={ink}><text x={musicStart-15} y={labelY} fontSize="13" fontFamily="Georgia, serif" fontStyle="italic" fontWeight="400" stroke="none" textAnchor="start">{question.marking}</text><line x1={musicStart+18} x2={right-28} y1={lineY} y2={lineY} strokeWidth="1" strokeDasharray="3 3"/><line x1={right-28} x2={right-28} y1={lineY} y2={lineY+(above?7:-7)} strokeWidth="1"/></g>;})():null;
    return <svg viewBox={`0 0 320 ${svgHeight}`} className="h-full max-h-36 w-full overflow-visible" aria-label="Treble-clef bar above an empty bass-clef answer stave">
      <defs><linearGradient id={fadeId} gradientUnits="userSpaceOnUse" x1={left} x2={right} y1="0" y2="0"><stop offset="0%" stopColor={ink} stopOpacity="1"/><stop offset="84%" stopColor={ink} stopOpacity="1"/><stop offset="100%" stopColor={ink} stopOpacity="0"/></linearGradient></defs>
      {stave(sourceTop,question.sourceClef,"source-stave",sourceY)}
      {stave(answerTop,question.answerClef,"answer-stave",answerY)}
      {ottavaMark}
      {tieLayer(question.sourceMelody,sourceTop,"source")}
      <WorksheetMelodyNotes steps={question.sourceMelody} rhythms={question.rhythms} xs={noteXs} top={sourceTop} gap={gap} ink={ink} prefix="transposing-source" ties={question.ties}/>
      {completed?<>{tieLayer(question.answerMelody,answerTop,"answer")}<WorksheetMelodyNotes steps={question.answerMelody} rhythms={question.rhythms} xs={noteXs} top={answerTop} gap={gap} ink={ink} prefix="transposing-answer" ties={question.ties}/></>:null}
      {completed&&muted?<rect className="transposing-example-answer-box" x={left-4} y={answerTop-13} width={right-left+8} height={gap*4+26} fill="none" stroke={ink} strokeWidth="1.5"/>:null}
    </svg>;
  }

  function Staff({ question, completed=false, muted=false, showNoteNames=false }) {
    if (CONFIG.activityId === "barlines") return <BarlinesStaff question={question} completed={completed} muted={muted} />;
    if (CONFIG.activityId === "rests") return <RestsStaff question={question} completed={completed} muted={muted} />;
    if (CONFIG.activityId === "accidentals") return <AccidentalsStaff question={question} completed={completed} muted={muted} />;
    if (CONFIG.activityId === "enharmonics") return <EnharmonicsStaff question={question} completed={completed} muted={muted} />;
    if (CONFIG.activityId === "keysig") return <KeySignatureStaff question={question} completed={completed} muted={muted} />;
    if (CONFIG.activityId === "notenaming") return <NoteNamingStaff question={question} muted={muted} />;
    if (CONFIG.activityId === "tonic") return <div className="tonic-staff-wrap flex min-h-0 flex-1 flex-col"><TonicStaff question={question} completed={completed} muted={muted}/><p className="text-center text-sm">The key is <strong>{question.key.name}</strong>.</p></div>;
    if (CONFIG.activityId === "transposing") return <TransposingStaff question={question} completed={completed} muted={muted} />;
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

  const QUESTION_VARIABLE_PATTERN = /(one octave (?:higher|lower)|at the same pitch|one step (?:higher|lower)|(?:tone|semitone) (?:higher|lower)|\b(?:tone|semitone)\b|(?:root position|first inversion|second inversion|1st inversion|2nd inversion)|(?:tonic|subdominant|dominant)|(?:staccato|slur|accent|phrase mark)|(?:quaver triplet|crotchet triplet)|(?:crescendo|diminuendo|Adagio|Andante|Moderato|Allegro)|(?:sharp|flat|natural)|\b(?:p|f)\b|(?:\b[A-G](?:#|b)\b|\b[A-G][♯♭])|(?:C|G|F|D|B♭|A|E) (?:major|minor)|(?:2|3|4|5|6|7|9|12)\/(?:2|4|8|16)|bars? \d+(?:\s*(?:and|to|-|–)\s*\d+)?)/gi;
  const QUESTION_VARIABLE_ONLY_PATTERN = /^(?:one octave (?:higher|lower)|at the same pitch|one step (?:higher|lower)|(?:tone|semitone) (?:higher|lower)|(?:tone|semitone)|(?:root position|first inversion|second inversion|1st inversion|2nd inversion)|(?:tonic|subdominant|dominant)|(?:staccato|slur|accent|phrase mark)|(?:quaver triplet|crotchet triplet)|(?:crescendo|diminuendo|Adagio|Andante|Moderato|Allegro)|(?:sharp|flat|natural)|(?:p|f)|[A-G](?:♯|♭|#|b)|(?:C|G|F|D|B♭|A|E) (?:major|minor)|(?:2|3|4|5|6|7|9|12)\/(?:2|4|8|16)|bars? \d+(?:\s*(?:and|to|-|–)\s*\d+)?)$/i;

  function EmphasisedPrompt({ children }) {
    if (typeof children !== "string") return children;
    return <>{children.split(QUESTION_VARIABLE_PATTERN).map((part,index)=><React.Fragment key={`${index}-${part}`}>{QUESTION_VARIABLE_ONLY_PATTERN.test(part)?<strong>{part}</strong>:part}</React.Fragment>)}</>;
  }

  function Question({ question, number, example=false, answers=false, numbers=true, marks=true, firstPage=false, continuationPage=false }) {
    const completed = example || answers;
    const compactChord = CONFIG.activityId === "chords" && level === "N5";
    const compactRepetition = CONFIG.activityId === "missingnotes" && level === "N3";
    const compactBarlines = CONFIG.activityId === "barlines";
    const compactRests = CONFIG.activityId === "rests";
    const compactRhythmSums = CONFIG.activityId === "rhythmsums";
    const smallAHChordPrompt = CONFIG.activityId === "chords" && level === "AH";
    const smallAHTransposingPrompt = CONFIG.activityId === "transposing" && level === "AH";
    const smallAHChordPromptClass=smallAHChordPrompt?"text-xs":"";
    const answerIsInNotation = CONFIG.activityId === "barlines" || CONFIG.activityId === "rests" || CONFIG.activityId === "enharmonics" || CONFIG.activityId === "missingnotes" || CONFIG.activityId === "tonic" || CONFIG.activityId === "transposing" || (CONFIG.activityId === "keysig" && question.build) || (CONFIG.activityId === "chords" && level === "AH");
    return <section className={`generic-question ${example ? "bg-stone-100 text-stone-500" : ""} ${example&&CONFIG.activityId==="rhythmsums"?"rhythm-sums-example col-span-2":""}`}>{compactChord||compactRepetition||compactBarlines||compactRests||compactRhythmSums?<div className="min-h-6 text-sm"><strong>{example ? "Example Answer" : numbers ? `${number}.` : ""}</strong></div>:<div className="flex min-h-9 items-start gap-1 text-sm"><strong>{example ? "Example Answer" : numbers ? `${number}.` : ""}</strong><span className={`${smallAHChordPromptClass} ${smallAHTransposingPrompt?"text-xs leading-tight":""}`}><EmphasisedPrompt>{question.prompt}</EmphasisedPrompt></span></div>}{CONFIG.activityId==="rhythmsums" ? <div className="relative -top-[10px] flex flex-1 items-center justify-center gap-1 text-[1.625rem]"><WorksheetRhythmSumItem item={question.left}/><strong>{question.operator}</strong><WorksheetRhythmSumItem item={question.right}/></div> : <Staff question={question} completed={completed} muted={example} showNoteNames={example}/>}<div className={`relative flex min-h-8 items-end justify-center ${CONFIG.activityId==="rhythmsums"?(continuationPage?"-top-[25px]":"-top-[35px]"):""}`}>{question.response!=="mark" && question.response!=="stave" ? <div className="w-4/5 border-b border-black pb-1 text-center font-semibold">{completed ? question.answer : ""}</div> : completed && !answerIsInNotation ? <strong className="text-sm">{question.answer}</strong> : null}{marks && !example ? <strong className={`absolute right-1 text-sm ${CONFIG.activityId==="transposing"?(level==="AH"?"bottom-2":"bottom-4"):CONFIG.activityId==="barlines"?(firstPage?"bottom-[30px]":"bottom-[22px]"):CONFIG.activityId==="rests"?"bottom-[29px]":"bottom-1"}`}>1</strong> : null}</div></section>;
  }

  function Pages({ data, answers=false, offset=0, total=1 }) {
    const rhythmSums=CONFIG.activityId==="rhythmsums";
    const perPage = rhythmSums ? 8 : DEF.large || (CONFIG.activityId === "chords" && level === "AH") ? 4 : 6;
    const examples = answers ? [] : data.examples?.length ? data.examples : data.example ? [data.example] : [];
    const items = answers ? data.questions : [...examples, ...data.questions];
    const pages=[];
    if(rhythmSums&&!answers){pages.push([...examples,...data.questions.slice(0,perPage)]);for(let questionIndex=perPage;questionIndex<data.questions.length;questionIndex+=perPage)pages.push(data.questions.slice(questionIndex,questionIndex+perPage));}
    else for(let itemIndex=0;itemIndex<items.length;itemIndex+=perPage)pages.push(items.slice(itemIndex,itemIndex+perPage));
    return pages.map((items,pageIndex)=><article className="worksheet-page generic-page" key={`${answers}-${pageIndex}`}><div className="worksheet-header-card mb-4 rounded-xl border border-black p-4"><div className="flex items-center gap-3"><img src={DEF.icon} className="h-12 w-12 object-contain" alt=""/><div className="min-w-0"><h1 className="text-xl font-bold leading-tight">{answers ? `${data.title} - Answers` : data.title}</h1>{!answers&&<p className="text-sm text-stone-700">{data.instructions}</p>}</div></div>{!answers&&pageIndex===0?<div className="mt-4 flex gap-5 text-sm">{data.name&&<span className="flex min-w-0 flex-[2] items-end gap-2"><span className="shrink-0">Name:</span><span className="pupil-detail-line mb-[3px] h-px min-w-8 flex-1 bg-black"/></span>}{data.classField&&<span className="flex min-w-0 flex-1 items-end gap-2"><span className="shrink-0">Class:</span><span className="pupil-detail-line mb-[3px] h-px min-w-8 flex-1 bg-black"/></span>}{data.date&&<span className="flex min-w-0 flex-1 items-end gap-2"><span className="shrink-0">Date:</span><span className="pupil-detail-line mb-[3px] h-px min-w-8 flex-1 bg-black"/></span>}</div>:null}</div><div className={`generic-grid grid flex-1 ${CONFIG.activityId==="barlines"||CONFIG.activityId==="rests"?"grid-cols-1":"grid-cols-2"} ${data.gridlines?"with-gridlines":""}`}>{items.map((q,i)=>{const example=!answers&&pageIndex===0&&i<examples.length; const n=answers?pageIndex*perPage+i+1:rhythmSums?(pageIndex===0?i-examples.length+1:perPage+(pageIndex-1)*perPage+i+1):pageIndex*perPage+i-examples.length+1; return <Question key={q.id} question={q} number={n} example={example} answers={answers} numbers={data.numbers} marks={data.marks} firstPage={!answers&&pageIndex===0} continuationPage={pageIndex>0}/>})}</div>{!answers&&data.marks&&pageIndex===pages.length-1?<div className="mt-3 flex justify-end gap-3 text-sm font-bold"><span className="h-8 leading-8">Total marks</span><span className="total-marks-box relative h-8 w-24 border border-black"><span className="total-marks-value absolute left-2 right-2 text-right leading-none">/ {data.questions.length}</span></span></div>:null}<footer className="mt-2 flex justify-between text-[10px] text-stone-400"><span>The Music Literacy Hub</span><span>Page {offset+pageIndex+1} of {total}</span></footer></article>);
  }

  function GenericApp() {
    const initialCount=CONFIG.activityId==="rhythmsums"?15:10;
    const [count,setCount]=useGenericState(initialCount), [questions,setQuestions]=useGenericState(()=>Array.from({length:initialCount},(_,i)=>makeQuestion(i)));
    const [title,setTitle]=useGenericState(defaultTitle), [instructions,setInstructions]=useGenericState(defaultInstructions);
    const [name,setName]=useGenericState(true), [classField,setClassField]=useGenericState(true), [date,setDate]=useGenericState(true), [numbers,setNumbers]=useGenericState(true), [marks,setMarks]=useGenericState(true), [gridlines,setGridlines]=useGenericState(true), [exampleOn,setExampleOn]=useGenericState(true), [answersOn,setAnswersOn]=useGenericState(false), [downloading,setDownloading]=useGenericState(false);
    const [previewVisible,setPreviewVisible]=useGenericState(true), refreshTimer=useGenericRef(null);
    const examples=useGenericMemo(()=>CONFIG.activityId==="chords"&&level==="AH"?AH_WORKSHEET_TYPES.map((type,typeIndex)=>makeQuestion(-1-typeIndex,type)):[makeQuestion(-1)],[]);
    const activeExamples=exampleOn?examples:[];
    const data={questions,title,instructions,name,classField,date,numbers,marks,gridlines,examples:activeExamples,example:activeExamples[0]||null};
    const rhythmSums=CONFIG.activityId==="rhythmsums",perPage=rhythmSums?8:DEF.large||(CONFIG.activityId==="chords"&&level==="AH")?4:6, qPages=rhythmSums?Math.ceil(questions.length/perPage):Math.ceil((questions.length+activeExamples.length)/perPage), aPages=answersOn?Math.ceil(questions.length/perPage):0, total=qPages+aPages;
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
