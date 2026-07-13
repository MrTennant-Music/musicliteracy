const { useEffect: useGenericEffect, useMemo: useGenericMemo, useState: useGenericState } = React;

(() => {
  const CONFIG = (() => { try { return JSON.parse(sessionStorage.getItem("worksheetSourceConfig") || "null"); } catch { return null; } })();
  if (!CONFIG || CONFIG.version !== 1 || CONFIG.activityId === "intervals") return;

  const DEFINITIONS = {
    enharmonics: { title: "Enharmonic Equivalents", icon: "enharmonic-icon.svg", instructions: "Write the enharmonic equivalent of each note.", response: "stave" },
    keysig: { title: "Key Signatures", icon: "key-signatures-icon.svg", instructions: "Identify or create the key signatures shown below.", response: "mixed" },
    notenaming: { title: "Note Identification", icon: "notenaming-icon.svg", instructions: "Name each note shown below.", response: "text" },
    tonic: { title: "Scale Degrees", icon: "scale-degrees-icon.svg", instructions: "Circle the requested scale degree in each melody.", response: "mark" },
    transposing: { title: "Transposing", icon: "transposing-icon.svg", instructions: "Rewrite each example at the requested pitch.", response: "stave" },
    barlines: { title: "Barlines", icon: "barlines-icon.svg", instructions: "Insert the missing barlines in each example.", response: "mark", large: true },
    rests: { title: "Rests", icon: "rests-icon.svg", instructions: "Write the missing rest in each outlined space.", response: "stave" },
    rhythmsums: { title: "Rhythm Sums", icon: "rhythm-sums-icon.svg", instructions: "Calculate the total number of beats in each sum.", response: "text" },
    timesig: { title: "Time Signatures", icon: "time-signatures-icon.svg", instructions: "Identify or insert the time signatures shown below.", response: "text", large: true },
    triplets: { title: "Triplets", icon: "triplets-icon.svg", instructions: "Mark each group of three notes and identify the triplet type.", response: "text", large: true },
    accidentals: { title: "Accidentals", icon: "accidentals-icon.svg", instructions: "Identify tones and semitones or write the requested note.", response: "mixed" },
    chords: { title: "Chords", icon: "chords-icon.svg", instructions: "Name or complete the chords shown below.", response: "mixed" },
    articulation: { title: "Articulation Markings", icon: "articulation-markings-icon.svg", instructions: "Explain or apply the articulation markings shown below.", response: "mixed" },
    missingnotes: { title: "Melodic Dictation", icon: "insert-missing-notes-icon.svg", instructions: "Complete each musical pattern in the blank bar.", response: "stave", large: true },
    practicequestions: { title: "Practice Questions", icon: "practice-app-icon.svg", instructions: "Complete the mixed music literacy questions below.", response: "mixed" },
  };
  const DEF = DEFINITIONS[CONFIG.activityId];
  if (!DEF) return;
  const LEVEL_NAMES = { N3: "National 3", N4: "National 4", N5: "National 5", H: "Higher", AH: "Advanced Higher", Custom: "Custom" };
  const level = CONFIG.settings?.level || "Custom";
  const random = (items) => items[Math.floor(Math.random() * items.length)];
  const NOTES = [0,1,2,3,4,5,6,7,8];
  const NOTE_NAMES = ["E", "F", "G", "A", "B", "C", "D", "E", "F"];
  const KEYS = ["C major", "G major", "F major", "D major", "B♭ major", "A minor", "E minor", "D minor"];
  const RHYTHMS = [{ symbolKey:"noteheadBlack", beats:4 },{ symbolKey:"wholeNote", beats:2 },{ symbolKey:"quarterNoteStemUp", beats:1 },{ symbolKey:"eighthNoteStemUp", beats:.5 }];
  const id = () => Math.random().toString(36).slice(2);

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

  function makeQuestion(index) {
    const step = random(NOTES), step2 = Math.max(0, Math.min(8, step + random([-3,-2,-1,1,2,3])));
    const base = { id: id(), step, step2, prompt: "", answer: "", response: DEF.response };
    switch (CONFIG.activityId) {
      case "enharmonics": {
        const pairs = [["F♯","G♭"],["C♯","D♭"],["A♯","B♭"],["D♯","E♭"],["G♯","A♭"],["B","C♭"],["E","F♭"]];
        const pair = random(pairs); return { ...base, prompt: `Rewrite ${pair[0]} as its enharmonic equivalent.`, label: pair[0], answer: pair[1] };
      }
      case "keysig": { const key = random(KEYS); const modes=CONFIG.settings?.modes||{identify:true,build:false}; const build=modes.build&&(!modes.identify||index%2===1); return { ...base, prompt: build ? `Create the key signature of ${key}.` : "Name this key signature.", key, build, answer: key, response: build ? "stave" : "text" }; }
      case "notenaming": return { ...base, prompt: "Name the note.", answer: NOTE_NAMES[step] };
      case "tonic": { const enabled=Object.entries(CONFIG.settings?.questionTypes||{}).filter(([,on])=>on).map(([name])=>name); const degree=random(enabled.length?enabled:["tonic","subdominant","dominant"]); return { ...base, prompt: `Circle the ${degree} note.`, degree, melody: Array.from({length:8}, () => random(NOTES)), answer: degree }; }
      case "transposing": return { ...base, prompt: random(["Rewrite the note one octave higher.", "Rewrite the note one octave lower.", "Rewrite the note at the same pitch in the other clef."]), answerStep: step2 };
      case "barlines": return { ...base, prompt: "Insert the missing barlines.", melody: Array.from({length:12}, () => random(NOTES)), answer: "Correct barlines shown" };
      case "rests": { const rests = ["crotchet rest", "quaver rest", "minim rest", "semibreve rest"]; const answer = random(rests); return { ...base, prompt: "Write the missing rest.", answer }; }
      case "rhythmsums": { const left=random(RHYTHMS), right=random(RHYTHMS), plus=Math.random()<.7; return { ...base, prompt:"Calculate the number of beats.", left, right, operator:plus?"+":"−", answer: plus ? left.beats+right.beats : Math.abs(left.beats-right.beats) }; }
      case "timesig": { const answer=random(["2/4","3/4","4/4","6/8"]); return { ...base, prompt:"Identify the time signature.", melody:Array.from({length:12},()=>random(NOTES)), answer }; }
      case "triplets": { const answer=random(["Quaver triplet","Crotchet triplet"]); return { ...base, prompt:"Mark the triplet and name its type.", melody:Array.from({length:12},()=>random(NOTES)), answer }; }
      case "accidentals": { const create=index%2===1; const useAccidental=index<0||index%3!==0; if(useAccidental){const accidentalQuestion=create?accidentalCreationQuestion(base):accidentalIdentificationQuestion(base);if(accidentalQuestion)return accidentalQuestion;} const distance=random(["tone","semitone"]), direction=random(["higher","lower"]); const pairs=distance==="tone"?[[1,2],[2,3],[3,4],[5,6],[6,7]]:[[0,1],[4,5],[7,8]]; const [low,high]=random(pairs); if(create){const startStep=direction==="higher"?low:high, answerStep=direction==="higher"?high:low; return { ...base, step:startStep, answerStep, firstAccidental:null, answerAccidental:null, prompt:`Write a note a ${distance} ${direction} than the note shown.`, answer:NOTE_NAMES[answerStep], response:"stave" };} return { ...base, step:low, step2:high, firstAccidental:null, secondAccidental:null, prompt:"Are the two notes a tone or a semitone apart?", answer:distance[0].toUpperCase()+distance.slice(1), response:"text" }; }
      case "chords": { if(level==="N5"){const answer=random(["C major","G major","F major","A minor"]);return {...base,prompt:"Name the outlined chord.",stack:[step,Math.min(8,step+2),Math.min(8,step+4)],answer,response:"text"};} const bass=index%2===0; return bass ? {...base,clef:"bass",prompt:"Write the missing bass note using the chord information shown.",answer:random(NOTE_NAMES),response:"stave"} : {...base,clef:"bass",prompt:"Name the chord and its position.",stack:[step,Math.min(8,step+2),Math.min(8,step+4)],answer:random(["C major, root position","G major, first inversion","D minor, second inversion","Diminished 7th"]),response:"text"}; }
      case "articulation": { const markings=[{name:"staccato",meaning:"Short and detached"},{name:"slur",meaning:"Smoothly and connected"},{name:"accent",meaning:"With extra emphasis"},{name:"phrase mark",meaning:"Shows the musical phrase"}]; const marking=random(markings), apply=index%2===1; return {...base,prompt:apply?`Apply a ${marking.name} to the notes.`:`Write the meaning of the ${marking.name} marking shown.`,melody:Array.from({length:4},()=>random(NOTES)),marking:apply?null:marking.name,answer:apply?marking.name:marking.meaning,response:apply?"stave":"text"}; }
      case "missingnotes": { const direction=level==="N4"?random(["higher","lower"]):null; const source=Array.from({length:4},()=>random([2,3,4,5,6])); return {...base,prompt:direction?`Write the sequence one step ${direction} in the blank bar.`:"Repeat the previous bar exactly in the blank bar.",sourceMelody:source,answerMelody:direction?source.map(n=>n+(direction==="higher"?1:-1)):source,answer:direction?`One step ${direction}`:"Exact repeat",response:"stave"}; }
      case "practicequestions": return makePracticeQuestion(index, base);
      default: return base;
    }
  }

  function makePracticeQuestion(index, base) {
    const definitions=[
      ["What does p mean?","Piano — quiet"],["What does f mean?","Forte — loud"],["What does crescendo mean?","Gradually getting louder"],["What does diminuendo mean?","Gradually getting quieter"],
      ["What does Adagio mean?","Slow"],["What does Andante mean?","At a walking pace"],["What does Moderato mean?","At a moderate speed"],["What does Allegro mean?","Fast"],
      ["What does a sharp do to a note?","Raises it by a semitone"],["What does a flat do to a note?","Lowers it by a semitone"],["What does a natural do?","Cancels a sharp or flat"],
      ["What does staccato mean?","Short and detached"],["What does an accent mean?","Play the note with extra emphasis"],["What does a slur mean?","Play smoothly and connected"],["What does a phrase mark show?","The musical phrase"],
      ["What does 4/4 mean?","Four crotchet beats in each bar"],["What does 3/4 mean?","Three crotchet beats in each bar"],["What do repeat signs mean?","Repeat the enclosed section of music"],
    ];
    const type=index%6;
    if(type===0){const [prompt,answer]=random(definitions);return {...base,prompt,answer,response:"text"};}
    if(type===1)return {...base,prompt:"Draw a start repeat sign at the beginning and an end repeat sign at the end of the stave.",answer:"Correct start and end repeat signs",repeatSigns:true,response:"stave"};
    if((level==="N3"||level==="N4")&&type===2){const direction=level==="N4"?random(["higher","lower"]):null,source=Array.from({length:4},()=>random([2,3,4,5,6]));return {...base,prompt:direction?`Write this sequence one step ${direction}.`:"Repeat the previous bar exactly.",sourceMelody:source,answerMelody:direction?source.map(n=>n+(direction==="higher"?1:-1)):source,answer:direction?`One step ${direction}`:"Exact repeat",response:"stave"};}
    if(type===3)return {...base,prompt:"Name the note.",answer:NOTE_NAMES[base.step],response:"text"};
    if(type===4)return {...base,prompt:"Identify the time signature.",melody:Array.from({length:8},()=>random(NOTES)),answer:random(["2/4","3/4","4/4","6/8"]),response:"text"};
    return {...base,prompt:"Insert the missing barline in the correct place.",melody:Array.from({length:8},()=>random(NOTES)),answer:"Correct barline",response:"stave"};
  }

  function worksheetSymbolKey(key) {
    if (key === "flatInScore") return "flat";
    if (key === "naturalInScore") return "natural";
    if (key === "sharpInScore") return "sharp";
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

  function Staff({ question, completed=false, muted=false }) {
    if (CONFIG.activityId === "accidentals") return <AccidentalsStaff question={question} completed={completed} muted={muted} />;
    const ink = muted ? "#78716c" : "#000";
    const y = (step) => 72 - step * 6;
    const notes = question.sourceMelody || question.melody || [question.step];
    const positions=question.sourceMelody?notes.map((_,i)=>90+i*28):notes.map((_,i)=>112+i*(174/Math.max(1,notes.length-1)));
    return <svg viewBox="0 0 320 120" className="h-full max-h-28 w-full" aria-label="Music notation">
      <g stroke={ink} strokeWidth="1">{[0,1,2,3,4].map(i=><line key={i} x1="28" x2="304" y1={48+i*12} y2={48+i*12}/>)}</g>
      <WorksheetOutlineGlyph symbolKey={question.clef==="bass" ? "fClef" : "gClef"} x={38} y={91} fontSize={58} colour={ink} anchor="start" />
      {question.sourceMelody&&<line x1="210" x2="210" y1="48" y2="96" stroke={ink}/>}
      {question.label && <text x="112" y="75" fill={ink} fontSize="20" fontWeight="700">{question.label}</text>}
      {question.stack
        ? question.stack.map((s,i)=><WorksheetOutlineGlyph key={i} symbolKey="quarterNoteStemUp" x={145} y={y(s)+7} fontSize={34} colour={ink} anchor="start" />)
        : notes.map((s,i)=><WorksheetOutlineGlyph key={i} symbolKey="quarterNoteStemUp" x={positions[i]} y={y(s)+7} fontSize={34} colour={ink} anchor="start" />)}
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
    return <section className={`generic-question ${example ? "bg-stone-100 text-stone-500" : ""}`}><div className="flex min-h-9 items-start gap-1 text-sm"><strong>{example ? "Example Answer" : numbers ? `${number}.` : ""}</strong><span><EmphasisedPrompt>{question.prompt}</EmphasisedPrompt></span></div>{CONFIG.activityId==="rhythmsums" ? <div className="flex flex-1 items-center justify-center gap-5 text-4xl"><WorksheetRhythmGlyph symbolKey={question.left.symbolKey}/><strong>{question.operator}</strong><WorksheetRhythmGlyph symbolKey={question.right.symbolKey}/></div> : <Staff question={question} completed={completed} muted={example}/>}<div className="relative flex min-h-8 items-end justify-center">{question.response!=="mark" && question.response!=="stave" ? <div className="w-4/5 border-b border-black pb-1 text-center font-semibold">{completed ? question.answer : ""}</div> : completed ? <strong className="text-sm">{question.answer}</strong> : null}{marks && !example ? <strong className="absolute bottom-1 right-1 text-sm">1</strong> : null}</div></section>;
  }

  function Pages({ data, answers=false, offset=0, total=1 }) {
    const perPage = DEF.large ? 4 : 6;
    const items = answers ? data.questions : data.example ? [data.example, ...data.questions] : data.questions;
    const pages=[]; for(let i=0;i<items.length;i+=perPage) pages.push(items.slice(i,i+perPage));
    return pages.map((items,pageIndex)=><article className="worksheet-page generic-page" key={`${answers}-${pageIndex}`}><div className="worksheet-header-card mb-4 rounded-xl border border-black p-4"><div className="flex items-center gap-3"><img src={DEF.icon} className="h-12 w-12 object-contain" alt=""/><div className="min-w-0"><h1 className="text-xl font-bold leading-tight">{answers ? `${data.title} - Answers` : data.title}</h1>{!answers&&<p className="text-sm text-stone-700">{data.instructions}</p>}</div></div>{!answers&&pageIndex===0?<div className="mt-4 flex gap-5 text-sm">{data.name&&<span className="flex min-w-0 flex-[2] items-end gap-2"><span className="shrink-0">Name:</span><span className="mb-[3px] h-px min-w-8 flex-1 bg-black"/></span>}{data.classField&&<span className="flex min-w-0 flex-1 items-end gap-2"><span className="shrink-0">Class:</span><span className="mb-[3px] h-px min-w-8 flex-1 bg-black"/></span>}{data.date&&<span className="flex min-w-0 flex-1 items-end gap-2"><span className="shrink-0">Date:</span><span className="mb-[3px] h-px min-w-8 flex-1 bg-black"/></span>}</div>:null}</div><div className={`generic-grid grid flex-1 grid-cols-2 ${data.gridlines?"with-gridlines":""}`}>{items.map((q,i)=>{const example=!answers&&data.example&&pageIndex===0&&i===0; const n=answers?pageIndex*perPage+i+1:pageIndex*perPage+i+(data.example?0:1); return <Question key={q.id} question={q} number={n} example={example} answers={answers} numbers={data.numbers} marks={data.marks}/>})}</div>{!answers&&data.marks&&pageIndex===pages.length-1?<div className="mt-3 flex justify-end gap-3 text-sm font-bold"><span className="h-8 leading-8">Total marks</span><span className="total-marks-box relative h-8 w-24 border border-black"><span className="total-marks-value absolute left-2 right-2 text-right leading-none">/ {data.questions.length}</span></span></div>:null}<footer className="mt-2 flex justify-between text-[10px] text-stone-400"><span>The Music Literacy Hub</span><span>Page {offset+pageIndex+1} of {total}</span></footer></article>);
  }

  function GenericApp() {
    const initialCount=10;
    const [count,setCount]=useGenericState(initialCount), [questions,setQuestions]=useGenericState(()=>Array.from({length:initialCount},(_,i)=>makeQuestion(i)));
    const [title,setTitle]=useGenericState(`${DEF.title} · ${LEVEL_NAMES[level]||level}`), [instructions,setInstructions]=useGenericState(DEF.instructions);
    const [name,setName]=useGenericState(true), [classField,setClassField]=useGenericState(true), [date,setDate]=useGenericState(true), [numbers,setNumbers]=useGenericState(true), [marks,setMarks]=useGenericState(true), [gridlines,setGridlines]=useGenericState(true), [exampleOn,setExampleOn]=useGenericState(true), [answersOn,setAnswersOn]=useGenericState(false), [downloading,setDownloading]=useGenericState(false);
    const example=useGenericMemo(()=>makeQuestion(-1),[]);
    const data={questions,title,instructions,name,classField,date,numbers,marks,gridlines,example:exampleOn?example:null};
    const perPage=DEF.large?4:6, qPages=Math.ceil((questions.length+(exampleOn?1:0))/perPage), aPages=answersOn?Math.ceil(questions.length/perPage):0, total=qPages+aPages;
    const changeCount=(value)=>{const n=Number(value);setCount(n);setQuestions(current=>current.length>=n?current.slice(0,n):[...current,...Array.from({length:n-current.length},(_,i)=>makeQuestion(current.length+i))]);};
    const refresh=()=>setQuestions(Array.from({length:count},(_,i)=>makeQuestion(i)));
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
    window.MLH.worksheetHeaderMode={title:DEF.title,subtitle:CONFIG.subtitle||"",icon:DEF.icon,assets:{},onExit:()=>{const saved=sessionStorage.getItem("worksheetReturnUrl");if(saved&&history.length>1)history.back();else location.href=saved||CONFIG.sourceUrl||"index.html";}};
    return <div className={window.MLH.shell.pageShellClass}><window.MLH.AppHeader icon={DEF.icon} title="Create a worksheet" subtitle={`Generate a printable worksheet from ${DEF.title}.`}/><div className={`${window.MLH.shell.pageContentClass} worksheet-page-content`}><main className={`${window.MLH.shell.mainShellClass} worksheet-builder h-auto min-h-0 p-4 md:p-6`}><div className="no-print"><div className="mb-6 rounded-xl border border-stone-200 bg-stone-50 px-4 py-3"><h2 className="flex items-center gap-2 text-xl font-bold"><img src={DEF.icon} className="h-7 w-7 object-contain" alt=""/>{DEF.title} · {LEVEL_NAMES[level]||level}</h2><p className="mt-1 text-sm text-stone-600">Generate a printable worksheet using the current activity and settings.</p></div><div className="rounded-xl border border-stone-200 bg-white p-4"><h2 className="flex items-center gap-2 text-xl font-bold"><img src="customise.svg" className="h-6 w-6" alt=""/>Customise</h2><p className="text-sm text-stone-600">Adjust the worksheet content and layout.</p><div className="mt-4 space-y-4"><label className="block text-sm font-semibold">Title<input className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 font-normal" value={title} onChange={e=>setTitle(e.target.value)}/></label><label className="block text-sm font-semibold">Instructions<textarea ref={window.MLH.resizeWorksheetTextarea} rows="2" className="mt-1 min-h-16 w-full resize-none overflow-hidden rounded-lg border border-stone-300 px-3 py-2 font-normal" value={instructions} onChange={e=>{window.MLH.resizeWorksheetTextarea(e.currentTarget);setInstructions(e.target.value);}}/></label><div className="flex flex-wrap gap-7">{check("Name",name,setName)}{check("Class",classField,setClassField)}{check("Date",date,setDate)}</div><label className="flex items-center justify-between border-t border-stone-200 pt-4 text-sm font-semibold">Number of Questions<select className="w-32 rounded-lg border border-stone-300 px-3 py-2" value={count} onChange={e=>changeCount(e.target.value)}>{[10,15,20,25].map(n=><option key={n}>{n}</option>)}</select></label><div className="grid grid-cols-[minmax(0,1fr)_max-content_max-content] gap-x-3 gap-y-3">{check("Question Numbers",numbers,setNumbers)}{check("Marks",marks,setMarks)}{check("Gridlines",gridlines,setGridlines)}{check("Example Answer",exampleOn,setExampleOn)}{check("Print Answers",answersOn,setAnswersOn)}</div><div className="grid grid-cols-3 gap-2 border-t border-stone-200 pt-4"><button onClick={refresh} className="flex h-11 items-center justify-center gap-2 rounded-xl border border-stone-300 font-semibold"><img src="restart.svg" className="h-5 w-5" alt=""/>Refresh</button><button onClick={download} disabled={downloading} className="flex h-11 items-center justify-center gap-2 rounded-xl bg-black font-bold text-white"><img src="download.svg" className="h-5 w-5 invert" alt=""/>{downloading?"Preparing…":"Download"}</button><button onClick={()=>print()} className="flex h-11 items-center justify-center gap-2 rounded-xl bg-black font-bold text-white"><img src="worksheet.svg" className="h-4 w-4 invert" alt=""/>Print</button></div></div></div></div><section className="print-area worksheet-preview-panel"><div className="no-print mb-4"><h2 className="flex items-center gap-2 text-xl font-bold"><img src="worksheet.svg" className="h-6 w-6" alt=""/>Preview</h2><p className="text-sm text-stone-600">Updates automatically as you change the options.</p></div><Pages data={data} total={total}/>{answersOn?<div className="answer-sheet-start-new"><Pages data={{...data,example:null}} answers offset={qPages} total={total}/></div>:null}</section></main></div></div>;
  }
  window.MLHGenericWorksheetApp=GenericApp;
  ReactDOM.createRoot(document.getElementById("root")).render(<GenericApp />);
})();
