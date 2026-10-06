(function(root){
  const subdivisions = {
    beat: {label:'Crotchets', offsets:[0]},
    quavers: {label:'Quavers', offsets:[0,.5]},
    triplets: {label:'Triplet quavers', offsets:[0,1/3,2/3]},
    semiquavers: {label:'Semiquavers', offsets:[0,.25,.5,.75]},
    dotted: {label:'Dotted quaver and semiquaver', offsets:[0,.75]},
    snap: {label:'Scotch snap', offsets:[0,.25]},
  };
  const defaults={bpm:120,beats:4,accent:true,subdivision:'beat'};
  function settings(value={}){
    const number=(key,min,max)=>Number.isFinite(Number(value[key]))?Math.max(min,Math.min(max,Math.round(Number(value[key])))):defaults[key];
    return {bpm:number('bpm',30,240),beats:number('beats',1,12),accent:typeof value.accent==='boolean'?value.accent:true,subdivision:subdivisions[value.subdivision]?value.subdivision:'beat'};
  }
  function tempoLabel(bpm){return bpm<40?'Grave':bpm<60?'Largo':bpm<76?'Adagio':bpm<108?'Andante':bpm<120?'Moderato':bpm<168?'Allegro':bpm<200?'Vivace':'Presto';}
  function tapTempo(taps){
    const recent=taps.slice(-7);
    if(recent.length<2)return null;
    const intervals=recent.slice(1).map((time,index)=>time-recent[index]);
    if(intervals.some(interval=>interval<=0||interval>2500))return null;
    return settings({bpm:60000/(intervals.reduce((a,b)=>a+b,0)/intervals.length)}).bpm;
  }
  class Transport {
    constructor(start,getSettings){this.next=start;this.getSettings=getSettings;this.beat=0;this.part=0;this.options=null;}
    take(now,horizon=.1){
      if(this.next<now-.1){this.next=now+.03;this.part=0;this.beat=0;}
      const events=[];
      while(this.next<now+horizon){
        if(this.part===0){this.options=settings(this.getSettings());this.beat%=this.options.beats;this.origin=this.next;}
        const offsets=subdivisions[this.options.subdivision].offsets;
        events.push({duration:60/this.options.bpm,time:this.next,beat:this.beat,part:this.part,accent:this.options.accent&&this.beat===0&&this.part===0});
        this.part++;
        if(this.part===offsets.length){this.part=0;this.beat=(this.beat+1)%this.options.beats;this.next=this.origin+60/this.options.bpm;}
        else this.next=this.origin+offsets[this.part]*60/this.options.bpm;
      }
      return events;
    }
  }
  const api={defaults,subdivisions,settings,tempoLabel,tapTempo,Transport};
  if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.MetronomeCore=api;
})(typeof window!=='undefined'?window:globalThis);
