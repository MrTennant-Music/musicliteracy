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
  const RHYTHMS = [{ glyph:"\uE0A4", beats:4 },{ glyph:"\uE1D2", beats:2 },{ glyph:"\uE1D5", beats:1 },{ glyph:"\uE1D7", beats:.5 }];
  const id = () => Math.random().toString(36).slice(2);

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
      case "accidentals": { const create=index%2===1; const distance=random(["tone","semitone"]), direction=random(["higher","lower"]); const pairs=distance==="tone"?[[1,2],[2,3],[3,4],[5,6],[6,7]]:[[0,1],[4,5],[7,8]]; const [low,high]=random(pairs); if(create){const startStep=direction==="higher"?low:high, answerStep=direction==="higher"?high:low; return { ...base, step:startStep, answerStep, prompt:`Write a note a ${distance} ${direction} than the note shown.`, answer:NOTE_NAMES[answerStep], response:"stave" };} return { ...base, step:low, step2:high, prompt:"Are the two notes a tone or a semitone apart?", answer:distance[0].toUpperCase()+distance.slice(1), response:"text" }; }
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

  function Staff({ question, completed=false, muted=false }) {
    const ink = muted ? "#78716c" : "#000";
    const y = (step) => 72 - step * 6;
    const notes = question.sourceMelody || question.melody || [question.step];
    const positions=question.sourceMelody?notes.map((_,i)=>90+i*28):notes.map((_,i)=>112+i*(174/Math.max(1,notes.length-1)));
    const clefGlyph=question.clef==="bass"?(window.BRAVURA_SYMBOLS?.fClef||"𝄢"):(window.BRAVURA_SYMBOLS?.gClef||"𝄞");
    return <svg viewBox="0 0 320 120" className="h-full max-h-28 w-full" aria-label="Music notation"><g stroke={ink} strokeWidth="1">{[0,1,2,3,4].map(i=><line key={i} x1="28" x2="304" y1={48+i*12} y2={48+i*12}/>)}</g><text x="38" y="91" fill={ink} className="music-symbol" fontSize="58">{clefGlyph}</text>{question.sourceMelody&&<line x1="210" x2="210" y1="48" y2="96" stroke={ink}/>} {question.label && <text x="112" y="75" fill={ink} fontSize="20" fontWeight="700">{question.label}</text>}{question.stack?(question.stack.map((s,i)=><text key={i} x="145" y={y(s)+7} fill={ink} className="music-symbol" fontSize="34">{window.BRAVURA_SYMBOLS?.quarterNoteStemUp||"♩"}</text>)):notes.map((s,i)=><text key={i} x={positions[i]} y={y(s)+7} fill={ink} className="music-symbol" fontSize="34">{window.BRAVURA_SYMBOLS?.quarterNoteStemUp || "♩"}</text>)}{completed&&Number.isInteger(question.answerStep)?<text x="230" y={y(question.answerStep)+7} fill={ink} className="music-symbol" fontSize="34">{window.BRAVURA_SYMBOLS?.quarterNoteStemUp||"♩"}</text>:null}{completed&&question.sourceMelody&&question.answerMelody?.map((s,i)=><text key={`a${i}`} x={226+i*18} y={y(s)+7} fill={ink} className="music-symbol" fontSize="30">{window.BRAVURA_SYMBOLS?.quarterNoteStemUp||"♩"}</text>)}{question.marking&&!completed?<text x="175" y="43" fill={ink} fontWeight="700">{question.marking}</text>:null}{question.repeatSigns&&completed?<><text x="69" y="84" fontSize="28" fill={ink}>𝄆</text><text x="270" y="84" fontSize="28" fill={ink}>𝄇</text></>:null}{question.build && !completed ? <rect x="105" y="38" width="120" height="58" rx="6" fill="none" stroke={ink} strokeDasharray="4 3"/> : null}{CONFIG.activityId==="rests" && !completed ? <rect x="150" y="38" width="48" height="58" rx="6" fill="none" stroke={ink}/> : null}{completed && ["enharmonics","transposing","keysig","rests","accidentals","chords","articulation"].includes(CONFIG.activityId) ? <text x="240" y="110" fill={ink} fontSize="14" fontWeight="700">{question.answer || "✓"}</text> : null}</svg>;
  }

  function Question({ question, number, example=false, answers=false, numbers=true, marks=true }) {
    const completed = example || answers;
    return <section className={`generic-question ${example ? "bg-stone-100 text-stone-500" : ""}`}><div className="flex min-h-9 items-start gap-1 text-sm"><strong>{example ? "Example Answer" : numbers ? `${number}.` : ""}</strong><span>{question.prompt}</span></div>{CONFIG.activityId==="rhythmsums" ? <div className="flex flex-1 items-center justify-center gap-5 text-4xl"><span className="music-symbol">{question.left.glyph}</span><strong>{question.operator}</strong><span className="music-symbol">{question.right.glyph}</span></div> : <Staff question={question} completed={completed} muted={example}/>}<div className="relative flex min-h-8 items-end justify-center">{question.response!=="mark" && question.response!=="stave" ? <div className="w-4/5 border-b border-black pb-1 text-center font-semibold">{completed ? question.answer : ""}</div> : completed ? <strong className="text-sm">{question.answer}</strong> : null}{marks && !example ? <strong className="absolute bottom-1 right-1 text-sm">1</strong> : null}</div></section>;
  }

  function Pages({ data, answers=false, offset=0, total=1 }) {
    const perPage = DEF.large ? 4 : 6;
    const items = answers ? data.questions : data.example ? [data.example, ...data.questions] : data.questions;
    const pages=[]; for(let i=0;i<items.length;i+=perPage) pages.push(items.slice(i,i+perPage));
    return pages.map((items,pageIndex)=><article className="worksheet-page generic-page" key={`${answers}-${pageIndex}`}><div className="worksheet-header-card mb-4 rounded-xl border border-black p-4"><div className="flex items-center gap-3"><img src={DEF.icon} className="h-12 w-12 object-contain" alt=""/><div className="min-w-0"><h1 className="text-xl font-bold leading-tight">{answers ? `${data.title} - Answers` : data.title}</h1>{!answers&&<p className="text-sm text-stone-700">{data.instructions}</p>}</div></div>{!answers&&pageIndex===0?<div className="mt-4 flex gap-5 text-sm">{data.name&&<span className="flex-[2]">Name: <span className="inline-block w-3/4 border-b border-black"/></span>}{data.classField&&<span className="flex-1">Class: <span className="inline-block w-1/2 border-b border-black"/></span>}{data.date&&<span className="flex-1">Date: <span className="inline-block w-1/2 border-b border-black"/></span>}</div>:null}</div><div className={`generic-grid grid flex-1 grid-cols-2 ${data.gridlines?"with-gridlines":""}`}>{items.map((q,i)=>{const example=!answers&&data.example&&pageIndex===0&&i===0; const n=answers?pageIndex*perPage+i+1:pageIndex*perPage+i+(data.example?0:1); return <Question key={q.id} question={q} number={n} example={example} answers={answers} numbers={data.numbers} marks={data.marks}/>})}</div>{!answers&&pageIndex===pages.length-1?<div className="mt-3 flex items-center justify-end gap-3 text-sm font-bold"><span>Total marks</span><span className="flex h-8 w-24 items-center justify-end border border-black px-2">/ {data.questions.length}</span></div>:null}<footer className="mt-2 flex justify-between text-[10px] text-stone-400"><span>The Music Literacy Hub</span><span>Page {offset+pageIndex+1} of {total}</span></footer></article>);
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
    const check=(label,value,setter)=><label className="flex items-center gap-2 text-sm"><input className="worksheet-checkbox" type="checkbox" checked={value} onChange={e=>setter(e.target.checked)}/>{label}</label>;
    async function download(){setDownloading(true);try{await document.fonts.ready;const pages=[...document.querySelectorAll(".generic-page")];const {jsPDF}=window.jspdf;const pdf=new jsPDF({unit:"mm",format:"a4",orientation:"portrait"});for(let i=0;i<pages.length;i++){if(i)pdf.addPage();const canvas=await html2canvas(pages[i],{scale:2.5,backgroundColor:"#fff",useCORS:true});pdf.addImage(canvas.toDataURL("image/png"),"PNG",0,0,210,297,undefined,"FAST");}pdf.save(`${title.replace(/[·•]/g," - ").replace(/[^a-z0-9 _-]/gi,"").trim()||DEF.title}.pdf`);}finally{setDownloading(false);}}
    window.MLH.worksheetHeaderMode={title:DEF.title,subtitle:CONFIG.subtitle||"",icon:DEF.icon,assets:{},onExit:()=>{const saved=sessionStorage.getItem("worksheetReturnUrl");if(saved&&history.length>1)history.back();else location.href=saved||CONFIG.sourceUrl||"index.html";}};
    return <div className={window.MLH.shell.pageShellClass}><window.MLH.AppHeader icon={DEF.icon} title="Create a worksheet" subtitle={`Generate a printable worksheet from ${DEF.title}.`}/><div className={`${window.MLH.shell.pageContentClass} worksheet-page-content`}><main className={`${window.MLH.shell.mainShellClass} worksheet-builder h-auto min-h-0 p-4 md:p-6`}><div className="no-print"><div className="mb-6 rounded-xl border border-stone-200 bg-stone-50 px-4 py-3"><h2 className="flex items-center gap-2 text-xl font-bold"><img src={DEF.icon} className="h-7 w-7 object-contain" alt=""/>{DEF.title} · {LEVEL_NAMES[level]||level}</h2><p className="mt-1 text-sm text-stone-600">Generate a printable worksheet using the current activity and settings.</p></div><div className="rounded-xl border border-stone-200 bg-white p-4"><h2 className="flex items-center gap-2 text-xl font-bold"><img src="customise.svg" className="h-6 w-6" alt=""/>Customise</h2><p className="text-sm text-stone-600">Adjust the worksheet content and layout.</p><div className="mt-4 space-y-4"><label className="block text-sm font-semibold">Title<input className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2" value={title} onChange={e=>setTitle(e.target.value)}/></label><label className="block text-sm font-semibold">Instructions<input className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2" value={instructions} onChange={e=>setInstructions(e.target.value)}/></label><div className="flex flex-wrap gap-7">{check("Name",name,setName)}{check("Class",classField,setClassField)}{check("Date",date,setDate)}</div><label className="flex items-center justify-between border-t border-stone-200 pt-4 text-sm font-semibold">Number of Questions<select className="w-32 rounded-lg border border-stone-300 px-3 py-2" value={count} onChange={e=>changeCount(e.target.value)}>{[10,15,20,25].map(n=><option key={n}>{n}</option>)}</select></label><div className="flex flex-wrap gap-7">{check("Question Numbers",numbers,setNumbers)}{check("Marks",marks,setMarks)}{check("Gridlines",gridlines,setGridlines)}</div><div className="flex flex-wrap gap-7">{check("Example Answer",exampleOn,setExampleOn)}{check("Print Answers",answersOn,setAnswersOn)}</div><div className="grid grid-cols-3 gap-2 border-t border-stone-200 pt-4"><button onClick={refresh} className="flex h-11 items-center justify-center gap-2 rounded-xl border border-stone-300 font-semibold"><img src="restart.svg" className="h-5 w-5" alt=""/>Refresh</button><button onClick={download} disabled={downloading} className="flex h-11 items-center justify-center gap-2 rounded-xl bg-black font-bold text-white"><img src="download.svg" className="h-5 w-5 invert" alt=""/>{downloading?"Preparing…":"Download"}</button><button onClick={()=>print()} className="flex h-11 items-center justify-center gap-2 rounded-xl bg-black font-bold text-white"><img src="worksheet.svg" className="h-4 w-4 invert" alt=""/>Print</button></div></div></div></div><section className="print-area worksheet-preview-panel"><div className="no-print mb-4"><h2 className="flex items-center gap-2 text-xl font-bold"><img src="worksheet.svg" className="h-6 w-6" alt=""/>Preview</h2><p className="text-sm text-stone-600">Updates automatically as you change the options.</p></div><Pages data={data} total={total}/>{answersOn?<div className="answer-sheet-start-new"><Pages data={{...data,example:null}} answers offset={qPages} total={total}/></div>:null}</section></main></div></div>;
  }
  window.MLHGenericWorksheetApp=GenericApp;
  ReactDOM.createRoot(document.getElementById("root")).render(<GenericApp />);
})();
