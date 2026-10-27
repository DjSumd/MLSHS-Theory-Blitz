// engrave.js — notation engine for ATAR Music Aural Blitz.
// Generates dictations (rhythm + melody, full WACE rhythm vocabulary) and renders them as
// proper notation: key signatures, bar-accidental rules, dots, flags, beams (with partial beams),
// rests, ties, triplets, anacrusis, multi-system layout with justified spacing.
(function(){
  // ---------- shared geometry (also exported for index.html) ----------
  const SS=16, GS=SS/250, TOPK=3;              // staff space, glyph scale (glyph units = 1000/4 per space), top margin (spaces)
  const LORD=['C','D','E','F','G','A','B'], LETPC={C:0,D:2,E:4,F:5,G:7,A:9,B:11}, AOFF={C:0,D:1,E:2,F:3,G:4,A:5,B:6};
  const ACCOFF={'':0,s:1,f:-1,n:0,ss:2,ff:-2};
  const dia=(l,o)=>o*7+AOFF[l];
  const letterOf=d=>LORD[((d%7)+7)%7], octOf=d=>Math.floor(d/7);
  const midiOf=(d,a)=>(octOf(d)+1)*12+LETPC[letterOf(d)]+ACCOFF[a||''];
  function clefData(c){return c==='bass'?{topLineDia:dia('A',3),glyph:'bassClef',lineDia:dia('F',3),clefW:3.1}:{topLineDia:dia('F',5),glyph:'trebleClef',lineDia:dia('G',4),clefW:2.9};}
  const yOf=(top,d)=>TOPK*SS+(top-d)*(SS/2);
  const gEl=(n,x,y,f)=>`<path d="${GLYPHS[n]}" transform="translate(${x.toFixed(2)},${y.toFixed(2)}) scale(${GS},${-GS})" fill="${f}"/>`;
  function ledgerYs(t,b,d){const o=[];if(d>t)for(let e=t+2;e<=d;e+=2)o.push(e);if(d<b)for(let e=b-2;e>=d;e-=2)o.push(e);return o;}
  const NW=400*GS;
  const accW=a=>(a==='s'?189:a==='f'?194:a==='ss'?230:a==='ff'?330:150)*GS;
  function accEl(a,x,y,col){ // x = right edge of the accidental
    if(a==='ss') return `<text x="${(x-SS*0.55).toFixed(1)}" y="${(y+SS*0.32).toFixed(1)}" text-anchor="middle" font-size="${(SS*1.15).toFixed(1)}" font-weight="700" fill="${col}" font-family="Georgia,serif">x</text>`;
    if(a==='ff') return gEl('flat',x-accW('f')*2+SS*0.05,y,col)+gEl('flat',x-accW('f'),y,col);
    return gEl(a==='s'?'sharp':a==='f'?'flat':'natural',x-accW(a),y,col);
  }
  const drawWholeNote=(x,y,a,f)=>(a?accEl(a,x-NW/2-SS*0.18,y,f):'')+gEl('noteheadWhole',x-NW/2,y,f);

  // ---------- key signatures ----------
  const SHARPS=['F','C','G','D','A','E','B'], FLATS=['B','E','A','D','G','C','F'];
  const KS_POS={treble:{s:[dia('F',5),dia('C',5),dia('G',5),dia('D',5),dia('A',4),dia('E',5),dia('B',4)],
                        f:[dia('B',4),dia('E',5),dia('A',4),dia('D',5),dia('G',4),dia('C',5),dia('F',4)]},
                bass:  {s:[dia('F',3),dia('C',3),dia('G',3),dia('D',3),dia('A',2),dia('E',3),dia('B',2)],
                        f:[dia('B',2),dia('E',3),dia('A',2),dia('D',3),dia('G',2),dia('C',3),dia('F',2)]}};
  function keyAccMap(ks){const m={};if(ks>0)SHARPS.slice(0,ks).forEach(l=>m[l]='s');if(ks<0)FLATS.slice(0,-ks).forEach(l=>m[l]='f');return m;}
  // major key name -> sharps(+)/flats(-)
  const MAJ_KS={'C':0,'G':1,'D':2,'A':3,'E':4,'B':5,'F':-1,'Bb':-2,'Eb':-3,'Ab':-4};
  const KEYNAME=k=>k.replace('b','♭').replace('#','♯');

  // ---------- pitch resolution by notation rules ----------
  // Accidentals apply for the rest of the bar to the same letter+octave (d). Key signature sets the start state.
  function barOf(onset,pickup,bpb){return onset<pickup-1e-6?0:Math.floor((onset-pickup)/bpb+1e-6)+(pickup>1e-6?1:0);}
  function posInBar(onset,pickup,bpb){return onset<pickup-1e-6?onset+(bpb-pickup):((onset-pickup)%bpb+bpb)%bpb;}
  // mode 'true': note.acc is the real spelling ('' = natural) -> returns {shown[], midi[]}
  // mode 'raw' : note.acc is what the student wrote (''|s|f|n) -> returns {shown[] (as written), midi[]}
  function resolveLine(notes,ks,pickup,bpb,mode){
    const km=keyAccMap(ks); let bar=-1, st={}, carry=null; const shown=[], midi=[];
    notes.forEach(n=>{
      const b=barOf(n.onset,pickup,bpb); if(b!==bar){bar=b;st={};}
      if(n.rest||n.d===undefined||n.state==='empty'){shown.push('');midi.push(null);carry=null;return;}
      const L=letterOf(n.d); let cur=(n.d in st)?st[n.d]:(km[L]||'');
      const tiedIn=carry&&carry.d===n.d;   // a tie carries its accidental across the barline without restating it
      if(mode==='true'){const a=n.acc||''; shown.push((tiedIn&&a===carry.acc)?'':(a!==cur?(a===''?'n':a):'')); if(!tiedIn||a!==carry.acc)st[n.d]=a; midi.push(midiOf(n.d,a)); carry=n.tie?{d:n.d,acc:a}:null;}
      else {const raw=n.acc||''; const eff=raw===''?(tiedIn?carry.acc:cur):(raw==='n'?'':raw); if(!(tiedIn&&raw===''))st[n.d]=eff; shown.push(raw); midi.push(midiOf(n.d,eff)); carry=n.tie?{d:n.d,acc:eff}:null;}
    });
    return {shown,midi};
  }

  // ---------- scales for dictation ----------
  // deg = [semitone, letter-step]; keys = [tonicLetter, parentMajorKey]
  const SCALES=[
    {name:'major',          deg:[[0,0],[2,1],[4,2],[5,3],[7,4],[9,5],[11,6]], keys:[['C','C'],['G','G'],['D','D'],['A','A'],['F','F'],['B','Bb'],['E','Eb']]},
    {name:'natural minor',  deg:[[0,0],[2,1],[3,2],[5,3],[7,4],[8,5],[10,6]], keys:[['A','C'],['E','G'],['B','D'],['D','F'],['G','Bb'],['C','Eb']]},
    {name:'harmonic minor', deg:[[0,0],[2,1],[3,2],[5,3],[7,4],[8,5],[11,6]], keys:[['A','C'],['E','G'],['B','D'],['D','F'],['G','Bb'],['C','Eb']]},
    {name:'melodic minor',  deg:[[0,0],[2,1],[3,2],[5,3],[7,4],[9,5],[11,6]], keys:[['A','C'],['E','G'],['B','D'],['D','F'],['G','Bb'],['C','Eb']]},
    {name:'major pentatonic',deg:[[0,0],[2,1],[4,2],[7,4],[9,5]],             keys:[['C','C'],['G','G'],['D','D'],['F','F'],['B','Bb']]},
    {name:'mixolydian',     deg:[[0,0],[2,1],[4,2],[5,3],[7,4],[9,5],[10,6]], keys:[['G','C'],['D','G'],['A','D'],['C','F'],['F','Bb']]},
    {name:'dorian',         deg:[[0,0],[2,1],[3,2],[5,3],[7,4],[9,5],[10,6]], keys:[['D','C'],['A','G'],['E','D'],['G','F'],['C','Bb']]},
    {name:'minor pentatonic',deg:[[0,0],[3,2],[5,3],[7,4],[10,6]],            keys:[['A','C'],['E','G'],['B','D'],['D','F'],['G','Bb']]},
    {name:'blues',          deg:[[0,0],[3,2],[5,3],[6,3],[7,4],[10,6]],       keys:[['A','C'],['E','G'],['D','F'],['G','Bb'],['C','Eb']]}
  ];
  const Epick=a=>a[(Math.random()*a.length)|0];
  function spellNote(midi,letter){const base=LETPC[letter];let acc=((midi%12)-base+12)%12;if(acc>6)acc-=12;
    const o=Math.round((midi-base-acc)/12)-1;const code=acc===0?'':acc===1?'s':acc===-1?'f':acc===2?'ss':acc===-2?'ff':'';
    return {letter,octave:o,acc:code,d:dia(letter,o),midi};}
  function tonicMidiFor(letter,parent,lo,hi){ // tonic pitch class from letter + parent-key accidental
    const km=keyAccMap(MAJ_KS[parent]); const pc=(LETPC[letter]+ACCOFF[km[letter]||''])+120;
    const mid=(lo+hi)/2; let best=null; for(let m=lo;m<=hi;m++) if((m-pc)%12===0&&(best===null||Math.abs(m-mid)<Math.abs(best-mid)))best=m; return best;}
  function scalePool(sc,tl,tm,lo,hi){const ti=LORD.indexOf(tl),pool=[];
    for(let oct=-2;oct<=2;oct++)sc.deg.forEach(([semi,ls])=>{const m=tm+oct*12+semi;if(m<lo||m>hi)return;pool.push(spellNote(m,LORD[(ti+ls)%7]));});
    pool.sort((a,b)=>a.midi-b.midi);return pool;}

  // ---------- metres (crotchet = 1 beat unit internally) ----------
  // g = beat-group starts; pair = group indices where a 2-group (2-beat) unit may begin; acc = accented onsets
  const METRES={
    '2/4': {numer:2, denom:4, bpb:2,   g:[0,1],         pair:[0],   acc:[0],           compound:false, pickups:[1,0.5]},
    '3/4': {numer:3, denom:4, bpb:3,   g:[0,1,2],       pair:[0,1], acc:[0],           compound:false, pickups:[1,0.5]},
    '4/4': {numer:4, denom:4, bpb:4,   g:[0,1,2,3],     pair:[0,2], acc:[0,2],         compound:false, pickups:[1,0.5]},
    '5/4': {numer:5, denom:4, bpb:5,   g:[0,1,2,3,4],   pair:[0,3], acc:[0,3],         compound:false, pickups:[1]},
    '6/8': {numer:6, denom:8, bpb:3,   g:[0,1.5],       pair:[],    acc:[0,1.5],       compound:true,  pickups:[0.5]},
    '9/8': {numer:9, denom:8, bpb:4.5, g:[0,1.5,3],     pair:[],    acc:[0,1.5,3],     compound:true,  pickups:[0.5]},
    '12/8':{numer:12,denom:8, bpb:6,   g:[0,1.5,3,4.5], pair:[],    acc:[0,1.5,3,4.5], compound:true,  pickups:[0.5]},
    '7/8': {numer:7, denom:8, bpb:3.5, g:[0,1,2],       pair:[],    acc:[0,1,2],       compound:false, pickups:[]}
  };
  const eq=(a,b)=>Math.abs(a-b)<1e-6;
  const grpLens=M=>M.g.map((s,i)=>((M.g[i+1]!==undefined?M.g[i+1]:M.bpb)-s));
  const T3=1/3;
  const VALL={semis:true,mixedSemis:true,dotted:true,quaverCrotchet:true,sixSemis:true,crotDotQuav:true,whole:true};
  function fills1(diff,o){ // one simple beat
    const w=o.vocab||VALL, v=[[1],[1]];
    if(diff!=='easy'||Math.random()<0.6)v.push([0.5,0.5]);
    if(diff!=='easy')v.push([0.5,0.5]);
    if(diff==='hard'||o.vocabEasy){ if(w.semis)v.push([0.25,0.25,0.25,0.25]); if(w.mixedSemis)v.push([0.5,0.25,0.25],[0.25,0.25,0.5]); if(w.dotted)v.push([0.75,0.25]); if(o.triplets)v.push([T3,T3,T3]);}
    return v;}
  function fills15(diff,o){ // one compound beat (dotted crotchet)
    const w=(o&&o.vocab)||VALL, v=[[1.5],[1,0.5],[0.5,0.5,0.5],[0.5,0.5,0.5]];
    if((diff!=='easy'||(o&&o.vocabEasy))&&w.quaverCrotchet)v.push([0.5,1]);
    if(diff==='hard'||(o&&o.vocabEasy)){ if(w.mixedSemis)v.push([0.5,0.25,0.25,0.5],[0.25,0.25,0.5,0.5],[1,0.25,0.25]); if(w.sixSemis)v.push([0.25,0.25,0.25,0.25,0.25,0.25]); }
    return v;}
  function fills2(diff,o){ // two simple beats as one unit
    const w=o.vocab||VALL, v=[[2],[2]]; if(w.dotted)v.push([1.5,0.5]);
    if((diff!=='easy'||o.vocabEasy)&&o.syncopation)v.push([0.5,1,0.5],[0.5,1.5]);
    if(diff==='hard'&&o.syncopation)v.push([0.5,1,0.5]);
    return v;}
  // fill a bar (or a partial bar of `len` beats, starting at group index gi0) -> [{dur,trip?}]
  function fillBar(diff,M,o,len){
    const gl=grpLens(M), out=[]; let gi=0, pos=0;
    // whole-bar values occasionally
    const w=o.vocab||VALL;
    if(eq(len,M.bpb)&&!o.noWhole&&w.whole!==false){
      if(!M.compound&&eq(M.bpb,4)&&Math.random()<0.06)return [{dur:4}];
      if(!M.compound&&eq(M.bpb,3)&&Math.random()<0.08)return [{dur:3}];
      if(!M.compound&&eq(M.bpb,2)&&Math.random()<0.10)return [{dur:2}];
      if(M.compound&&eq(M.bpb,3)&&Math.random()<0.05)return [{dur:3}];
      if(M.compound&&eq(M.bpb,3)&&w.crotDotQuav&&Math.random()<0.12)return [{dur:1},{dur:1.5},{dur:0.5}];
    }
    while(pos<len-1e-6&&gi<gl.length){
      const L=gl[gi], rem=len-pos;
      if(L>rem+1e-6){ // partial group (shortened last bar): one note or quavers
        const c=Math.random()<0.5?[rem]:(eq(rem,1)?[0.5,0.5]:[rem]); c.forEach(d=>out.push({dur:d})); pos+=rem; break; }
      if(!M.compound&&eq(L,1)&&gi+1<gl.length&&eq(gl[gi+1],1)&&M.pair.indexOf(gi)>=0&&rem>=2-1e-6&&Math.random()<(diff==='easy'?0.22:0.30)){
        Epick(fills2(diff,o)).forEach(d=>out.push({dur:d})); pos+=2; gi+=2; continue; }
      const fills=eq(L,1)?fills1(diff,o):eq(L,1.5)?fills15(diff,o):[[L]];
      const c=Epick(fills); c.forEach(d=>out.push({dur:d,trip:eq(d,T3)||undefined})); pos+=L; gi++;
    }
    return out;
  }
  // ---------- phrase-shaped rhythm ----------
  // A 4-bar phrase is question + answer: A (motif) · B (half-close, held) · A' (motif again, maybe varied) · C (cadence, held tonic).
  // 2 bars = A C; 8 bars = A B A' C · A B2 A' C. The rhythm of A is the phrase's motif, so bars relate instead of being independent lottery draws.
  const sumD=a=>a.reduce((t,e)=>t+e.dur,0);
  function densityRange(diff,M,len){const base=diff==='easy'?[2,5]:diff==='med'?[3,7]:[5,10];const f=len/4;return [Math.max(1,Math.round(base[0]*f)),Math.max(2,Math.round(base[1]*f))];}
  function motifBar(diff,M,o,len){let best=null;const [lo,hi]=densityRange(diff,M,len);
    for(let t=0;t<10;t++){const b=fillBar(diff,M,Object.assign({},o,{noWhole:true}),len);const n=b.length;if(n>=lo&&n<=hi)return b;if(!best||Math.abs(n-(lo+hi)/2)<Math.abs(best.length-(lo+hi)/2))best=b;}return best;}
  function holdFor(M,role){ // how long the phrase-end note is held
    if(M.compound)return M.bpb>=6?3:1.5;
    if(eq(M.bpb,3.5))return 1.5; if(M.bpb>=4)return 2; if(eq(M.bpb,3))return role==='C'?2:(Math.random()<0.5?1:2); return 1;}
  function closeBar(diff,M,o,len,role,A,bars){const hold=Math.min(holdFor(M,role),len);const pre=len-hold;let out=[];
    if(pre>1e-6){ // the cadence bar opens with the motif's own opening when it fits exactly, so the answer echoes the question
      let fromA=null;if(A&&role==='C'&&(bars<=2||Math.random()<0.6)){let acc=0;for(let i=0;i<A.length;i++){acc+=A[i].dur;if(eq(acc,pre)){fromA=A.slice(0,i+1).map(e=>({dur:e.dur,trip:e.trip}));break;}if(acc>pre+1e-6)break;}}
      const d2=role==='C'?(diff==='hard'?'med':'easy'):diff;out=fromA||fillBar(d2,M,Object.assign({},o,{noWhole:true}),pre);}
    if(role==='C'&&bars>2&&!M.compound&&eq(len,M.bpb)&&M.bpb>=3&&Math.random()<0.12)return [{dur:len}]; // the occasional whole-bar final note
    out.push({dur:hold,hold:true});return out;}
  function varyBar(A,diff,M,o,len){ // A' : repeat the motif exactly, or keep its first half and refresh the second
    const copy=()=>A.map(e=>({dur:e.dur,trip:e.trip,rest:e.rest}));
    if(diff==='easy'||Math.random()<0.6)return copy();
    const half=len/2;let acc=0,cut=-1;for(let i=0;i<A.length;i++){acc+=A[i].dur;if(eq(acc,half)){cut=i+1;break;}}
    if(cut<0)return copy();const first=A.slice(0,cut).map(e=>({dur:e.dur,trip:e.trip,rest:e.rest}));const rest=fillBar(diff,M,Object.assign({},o,{noWhole:true}),len-half);return first.concat(rest);}
  function roles(bars){if(bars<=1)return ['C'];if(bars===2)return ['A','C'];if(bars===3)return ['A','B','C'];const r=[];for(let b=0;b<bars;b+=4){const left=bars-b;if(left>=4)r.push('A','B',"A'",'C');else if(left===3)r.push('A','B','C');else if(left===2)r.push('A','C');else r.push('C');}return r;}
  function genRhythm(diff,bars,M,o){
    o=o||{}; let pickup=0;
    if(o.anacrusis&&diff!=='easy'&&M.pickups.length&&Math.random()<0.35)pickup=Epick(M.pickups);
    const ev=[]; if(pickup>0){(pickup===1&&Math.random()<0.4?[0.5,0.5]:[pickup]).forEach(d=>ev.push({dur:d}));}
    const R=roles(bars);let A=null;const barsOut=[];
    for(let b=0;b<bars;b++){const role=R[b];const len=(b===bars-1&&pickup>0)?M.bpb-pickup:M.bpb;let barEv;
      if(role==='A'){A=motifBar(diff,M,o,len);barEv=A.map(e=>({dur:e.dur,trip:e.trip}));}
      else if(role==="A'"){barEv=A?varyBar(A,diff,M,o,len):motifBar(diff,M,o,len);}
      else barEv=closeBar(diff,M,o,len,role,A,bars);
      barEv.forEach(e=>e.barStart=false);barEv[0].barStart=true;barEv.forEach(e=>{e.role=role;ev.push(e);});barsOut.push(barEv);}
    ev[ev.length-1].last=true;
    // rests: a breath after the half-close, and a motivic rest in A (copied into A') on a weak beat
    if(o.rests){
      const allowed=d=>!o.restDurs||o.restDurs.some(x=>eq(x,d));
      barsOut.forEach((bar,b)=>{const role=R[b];
        if(role==='B'){const h=bar[bar.length-1];const p=diff==='easy'?0.25:0.45;
          if(h.hold&&Math.random()<p){const half=h.dur/2;const ok=[0.5,0.75,1,1.5,2].some(v=>eq(v,half));if(ok&&allowed(half)){h.dur=half;bar.push({dur:half,rest:true,role});const k=ev.indexOf(h);ev.splice(k+1,0,bar[bar.length-1]);}}}
        if(role==='A'){const p=diff==='easy'?0.12:diff==='med'?0.3:0.35;
          let pos=0;const cands=bar.map((e,i)=>{const c={e,i,pos};pos+=e.dur;return c;}).filter(({e,i,pos})=>i>0&&i<bar.length-1&&!e.trip&&allowed(e.dur)&&(M.compound?(eq(e.dur,0.5)&&!eq(pos%1.5,0)):(eq(e.dur,1)&&eq(pos%1,0))||(diff==='hard'&&eq(e.dur,0.5)&&eq(pos%1,0.5))));
          if(cands.length&&Math.random()<p){const c=Epick(cands);c.e.rest=true;c.e.restIdx=c.i;}}
        if(role==="A'"&&A){const src=barsOut[R.slice(0,b).lastIndexOf('A')];if(src){const r=src.find(e=>e.rest);if(r){const same=bar[r.restIdx];if(same&&eq(same.dur,r.dur))same.rest=true;}}}});
    }
    // ties: only across the A→B or A'→C barline, so the tie is part of the motif's shape rather than a random hazard
    if(o.ties&&diff!=='easy'){
      for(let i=0;i<ev.length-1;i++){const e=ev[i],n=ev[i+1];
        if(n.barStart&&(e.role==='A'||e.role==="A'")&&!e.rest&&!n.rest&&!e.trip&&!n.trip&&e.dur>=0.5-1e-6&&e.dur<=2+1e-6&&n.dur<=1+1e-6&&Math.random()<0.25)e.tie=true;}
    }
    ev.forEach(e=>{delete e.restIdx;});
    return {events:ev,pickup,roles:R};
  }

  // ---------- melody: implied harmony, planned contour, motif repetition ----------
  function buildDictation(opts){
    opts=(typeof opts==='string')?{diff:opts}:(opts||{});
    const diff=opts.diff||'easy', bars=opts.bars||4, clef=opts.clef||'treble';
    let list=SCALES; if(opts.scaleNames&&opts.scaleNames.length){const w=SCALES.filter(s=>opts.scaleNames.indexOf(s.name)>=0);if(w.length)list=w;}
    const sc=Epick(list); let keys=sc.keys; if(opts.maxKs!=null){const k2=keys.filter(k=>Math.abs(MAJ_KS[k[1]])<=opts.maxKs);if(k2.length)keys=k2;}
    const [tl,parent]=Epick(keys), ks=MAJ_KS[parent];
    const lo=clef==='bass'?40:60, hi=clef==='bass'?60:81;             // E2–C4 / C4–A5
    const tm=tonicMidiFor(tl,parent,lo+2,hi-7);
    const pool=scalePool(sc,tl,tm,lo,hi);
    const M=METRES[opts.metre]||METRES['4/4'];
    const rh=genRhythm(diff,bars,M,{rests:opts.rests!==false,ties:opts.ties!==false,triplets:!!opts.triplets&&!M.compound,syncopation:opts.syncopation!==false,anacrusis:opts.anacrusis!==false,vocab:opts.vocab,vocabEasy:!!opts.vocabEasy,restDurs:opts.restDurs});
    const ev=rh.events, pickup=rh.pickup;
    // scale-degree helpers (semitones above the tonic)
    const semiOf=p=>((p.midi-tm)%12+12)%12;
    const has=x=>sc.deg.some(d=>d[0]===x);
    const TON=[0,has(4)?4:3,7].filter(has);                       // I chord tones
    const DOM=[7,has(11)?11:(has(10)?10:-1),2,has(5)?5:-1].filter(x=>x>=0&&has(x)); // V(7) tones (2 and 5 keep modes/pentatonics playable)
    const SUB=[5,has(9)?9:(has(8)?8:-1),0].filter(x=>x>=0&&has(x));
    const tonicIdx=(()=>{let b=0;pool.forEach((p,i)=>{if(p.midi===tm)b=i;});return b;})();
    const tonicIdxs=pool.map((p,i)=>semiOf(p)===0?i:-1).filter(i=>i>=0);
    const ltSemi=has(11)?11:-1;
    // range plan: tonic sits low-ish; climax a planned number of scale steps up
    const spanSteps=diff==='easy'?5:diff==='med'?7:9;
    const minIdx=Math.max(0,tonicIdx-(diff==='easy'?1:2)), maxIdx=Math.min(pool.length-1,minIdx+spanSteps);
    const climaxIdx=Math.min(maxIdx,tonicIdx+(diff==='easy'?Epick([3,4,5]):diff==='med'?Epick([4,5,6,7]):Epick([5,6,7,8,9])));
    // which bar each event is in, its chord, and whether it sits on an accent
    const barOf=on=>Math.floor((on+pickup)/M.bpb+1e-6);
    const R=rh.roles;const nb=bars;
    const chordFor=(b,posInBar,role,isLast)=>{ if(role==='C'){return isLast?TON:(posInBar<M.bpb/2-1e-6?DOM:TON);} if(role==='B')return posInBar<M.bpb/2-1e-6?(Math.random()<0.5?SUB:TON):DOM; return TON; };
    let onset=0;const meta=ev.map(e=>{const o2=onset;onset+=e.dur;const b=Math.max(0,barOf(o2));const pos=((o2+pickup)%M.bpb+M.bpb)%M.bpb;const role=R[Math.min(b,R.length-1)]||'A';
      return {on:o2,bar:b,pos,role,strong:M.acc.some(a=>eq(a,pos))||eq(pos,0),last:!!e.last};});
    // climax placement: in the B bar (or A' for 4+ bars) — the phrase rises to it and falls to the cadence
    const climaxBar=nb>=4?(Math.random()<0.5?1:2):(nb===2?0:1);
    const soundIdx=[];ev.forEach((e,i)=>{if(!e.rest&&!(i>0&&ev[i-1].tie))soundIdx.push(i);});
    const climaxAt=(()=>{const inBar=soundIdx.filter(i=>meta[i].bar===climaxBar);if(!inBar.length)return soundIdx[Math.floor(soundIdx.length/2)];return inBar[Math.floor(inBar.length*0.4)];})();
    const chosen=new Array(ev.length).fill(null);
    const nearestOf=(set,from,dir,maxDist)=>{ // nearest pool index whose scale degree is in set, preferring direction dir
      let best=-1,bd=99;for(let i=minIdx;i<=maxIdx;i++){if(!set.includes(semiOf(pool[i])))continue;const d=Math.abs(i-from);const pen=d+((dir&&Math.sign(i-from)!==dir&&i!==from)?1.5:0);if(d<=maxDist&&pen<bd){bd=pen;best=i;}}return best;};
    let idx=tonicIdx,dir=1,lastLeap=0,sameRun=0;
    const motifPitches={}; // bar role 'A' → pitches by sounding position, for A'
    for(let k=0;k<soundIdx.length;k++){const i=soundIdx[k];const m=meta[i];const e=ev[i];
      if(k===0){ // start on a tonic-chord tone, usually the tonic
        const st=Math.random()<0.6?tonicIdx:nearestOf(TON,tonicIdx,1,4);idx=st<0?tonicIdx:st;chosen[i]=pool[idx];continue;}
      // A': repeat the motif's pitches when the rhythm matches (exact repeat, or a sequence a step away at med/hard)
      if(m.role==="A'"&&motifPitches.A&&motifPitches.A[k-soundIdx.findIndex(j=>meta[j].role==="A'")]!==undefined){const rel=k-soundIdx.findIndex(j=>meta[j].role==="A'");const src=motifPitches.A[rel];
        if(src!==undefined){const shift=motifPitches.shift;const ni=Math.max(minIdx,Math.min(maxIdx,src+shift));idx=ni;chosen[i]=pool[idx];lastLeap=0;continue;}}
      const chord=chordFor(m.bar,m.pos,m.role,m.last);
      // final note: tonic, approached by step
      if(m.last){const prevI=soundIdx[k-1];const near=tonicIdxs.reduce((b,ti)=>Math.abs(ti-idx)<Math.abs(b-idx)?ti:b,tonicIdxs[0]);
        if(Math.abs(near-idx)>2&&prevI!==undefined){const ap=near+(idx<near?-1:1);if(ap>=minIdx&&ap<=maxIdx){chosen[prevI]=pool[ap];let q=prevI;while(q>0&&ev[q-1].tie){chosen[q-1]=pool[ap];q--;}}}
        idx=near;chosen[i]=pool[idx];continue;}
      // half-close: last note of a B bar lands on a V tone (2, 5 or 7), by step where possible
      const isHalfClose=m.role==='B'&&(k+1>=soundIdx.length||meta[soundIdx[k+1]].bar!==m.bar);
      if(isHalfClose){let t=nearestOf(DOM.filter(x=>x!==5),idx,0,2);if(t<0)t=nearestOf(DOM,idx,0,6);if(t<0)t=idx;idx=t;chosen[i]=pool[idx];lastLeap=0;continue;}
      // contour intent: towards the climax, then back down towards the tonic
      const goal=(k<=soundIdx.indexOf(climaxAt))?climaxIdx:tonicIdx;const gdir=Math.sign(goal-idx)||dir;
      if(Math.random()<(k<soundIdx.indexOf(climaxAt)?0.75:0.65))dir=gdir;else if(Math.random()<0.35)dir=-dir;
      if(k===soundIdx.indexOf(climaxAt)){dir=Math.sign(climaxIdx-idx)||1;}
      // step size: mostly steps, some repeats, a few 3rds, rare bigger leaps; a leap is answered by a step back
      let size;const r=Math.random();
      if(lastLeap>2){size=1;dir=-Math.sign(lastLeap);}
      else if(r<(diff==='easy'?0.11:0.09)&&sameRun<1)size=0;
      else if(r<0.85)size=1;else if(r<(diff==='hard'?0.93:0.96))size=2;else size=diff==='easy'?2:Epick([3,4]);
      if(k===soundIdx.indexOf(climaxAt))size=Math.max(size,Math.min(Math.abs(climaxIdx-idx),2));
      let ni=idx+dir*size;
      if(ni<minIdx||ni>maxIdx){dir=-dir;ni=idx+dir*size;}
      ni=Math.max(minIdx,Math.min(maxIdx,ni));
      if(m.strong&&size!==0){const t=nearestOf(chord,ni,dir,1);if(t>=0)ni=t;}
      if(ltSemi>=0&&semiOf(pool[idx])===ltSemi&&idx+1<=maxIdx&&Math.random()<0.85){ni=idx+1;dir=1;}
      // keep the leap musical: no tritone, nothing beyond a 6th
      const iv=Math.abs(pool[ni].midi-pool[idx].midi);if(iv===6||iv>9){ni=idx+dir;ni=Math.max(minIdx,Math.min(maxIdx,ni));}
      sameRun=ni===idx?sameRun+1:0;lastLeap=Math.abs(ni-idx)>=2?(ni-idx):0;idx=ni;chosen[i]=pool[idx];
      // remember the motif
      if(m.role==='A'){const start=soundIdx.findIndex(j=>meta[j].role==='A');motifPitches.A=motifPitches.A||[];motifPitches.A[k-start]=idx;if(motifPitches.shift===undefined)motifPitches.shift=0;}
      if(m.role==='B'&&motifPitches.shift===0&&diff!=='easy'&&Math.random()<0.35)motifPitches.shift=Epick([-1,1]);
    }
    // tied notes repeat their pitch; rests stay silent
    ev.forEach((e,i)=>{if(e.rest){chosen[i]=null;return;}if(i>0&&ev[i-1].tie&&!e.rest)chosen[i]=chosen[i-1];});
    let on2=0; const notes=ev.map((e,i)=>{const p=chosen[i];
      const n={onset:on2,dur:e.dur,rest:!!e.rest,tie:!!e.tie,trip:!!e.trip,midi:p?p.midi:null,d:p?p.d:undefined,acc:p?p.acc:'',letter:p?p.letter:''};
      on2+=e.dur;return n;});
    const kmT=keyAccMap(ks), tonicName=tl+(kmT[tl]==='f'?'♭':kmT[tl]==='s'?'♯':'');
    const keyName=tonicName+' '+sc.name;
    return {pool, scaleName:keyName, scaleType:sc.name, keyLabel:keyName, tonicName, ks, tonicMidi:tm, tonicLetter:tl, notes, difficulty:diff, bars, pickup, totalBeats:bars*M.bpb, clef,
            metre:{id:opts.metre||'4/4',numer:M.numer,denom:M.denom,bpb:M.bpb,g:M.g.slice(),acc:M.acc.slice(),compound:M.compound}};
  }

  // ---------- RENDERER ----------
  // spec: {clef, ks, numer, denom, bpb, g, pickup, bars, notes:[{onset,dur,rest,tie,trip,d,acc,state,color,showD,clearable}],
  //        mode:'true'|'raw', cursorBeat, barsPerSystem, rhythmOnly, compact}
  const w_of=dur=>SS*(1.25+1.95*Math.sqrt(Math.min(dur,4)));
  function drawScore(spec){
    const cd=clefData(spec.clef||'treble'), top=cd.topLineDia, bot=top-8;
    const bpb=spec.bpb||4, g=spec.g||[0,1,2,3], pickup=spec.pickup||0, bars=spec.bars||Math.max(1,Math.round((spec.totalBeats||16)/bpb));
    const totalBeats=bars*bpb, ks=spec.ks||0, numer=spec.numer||4, denom=spec.denom||4;
    const notes=spec.notes.slice().sort((a,b)=>a.onset-b.onset);
    const res=resolveLine(notes,ks,pickup,bpb,spec.mode||'true');
    // bar boundaries (beats)
    const bounds=[]; if(pickup>1e-6)bounds.push(pickup); for(let k=1;k<bars;k++)bounds.push(pickup+k*bpb); bounds.push(totalBeats);
    const segStarts=[0].concat(bounds.slice(0,-1)); // start beat of each bar segment
    const nSeg=segStarts.length;
    // ---- horizontal layout: slots ----
    const cw=w_of(1), barPad=SS*1.0;
    const pieces=[]; let t=0,x=0;
    const addGap=(to)=>{if(to>t+1e-6){pieces.push({t0:t,t1:to,x0:x,x1:x+(to-t)*cw,gap:true});x+=(to-t)*cw;t=to;}};
    const slotX=[]; // raw x of each note's slot start
    let bi=0; const barX={}; // raw x at each boundary
    const crossBoundary=(to)=>{while(bi<bounds.length&&bounds[bi]<=to+1e-6){barX[bi]=x;x+=barPad;bi++;}};
    notes.forEach((n,i)=>{ addGap(n.onset); crossBoundary(n.onset); const w=w_of(n.dur);
      slotX[i]=x; pieces.push({t0:n.onset,t1:n.onset+n.dur,x0:x,x1:x+w}); x+=w; t=n.onset+n.dur; });
    addGap(totalBeats); crossBoundary(totalBeats-1e-9); if(barX[bounds.length-1]===undefined)barX[bounds.length-1]=x;
    const xAt=(beat)=>{ if(beat<=0)return 0; for(const p of pieces){ if(beat<p.t1-1e-6&&beat>=p.t0-1e-6){ return p.gap?p.x0+(beat-p.t0)/(p.t1-p.t0)*(p.x1-p.x0):p.x0; } }
      // at a boundary: return x after the barline pad
      for(let k=0;k<bounds.length;k++) if(eq(bounds[k],beat)) return barX[k]+barPad; return x; };
    // ---- systems ----
    let bps=spec.barsPerSystem||(bars<=4?bars:(bars%4===0?4:bars%3===0?3:4));
    if(spec.compact&&notes.length<=18)bps=nSeg;
    if(spec.barsPerSystem)bps=spec.barsPerSystem;
    const systems=[]; { let s=0; while(s<nSeg){ let cnt=bps; if(s===0&&pickup>1e-6&&nSeg>bps)cnt=bps+1; systems.push({segA:s,segB:Math.min(nSeg,s+cnt)-1}); s+=cnt; } }
    const ksW=Math.abs(ks)*SS*0.62, tsW=SS*1.9;
    const leftOf=si=>SS*0.5+cd.clefW*SS+SS*0.5+(ks?ksW+SS*0.3:0)+(si===0?tsW:SS*0.2);
    systems.forEach((sy,si)=>{ sy.beat0=segStarts[sy.segA]; sy.beat1=(sy.segB<nSeg-1)?segStarts[sy.segB+1]:totalBeats;
      sy.rawX0=(sy.segA===0)?0:barX[sy.segA-1]+barPad; sy.rawX1=barX[sy.segB]; sy.nat=sy.rawX1-sy.rawX0; sy.left=leftOf(si); });
    const rightPad=SS*0.8, perBeat=SS*4.6;   // stable minimum width per beat so the layout doesn't jump during step entry
    systems.forEach(sy=>{ sy.target=Math.max(sy.nat,(sy.beat1-sy.beat0)*perBeat); });
    const W=Math.max.apply(null,systems.map(s=>s.left+s.target+rightPad));
    systems.forEach((sy,si)=>{ const avail=W-sy.left-rightPad; const full=(systems[0].beat1-systems[0].beat0); const shortLast=(si===systems.length-1&&systems.length>1&&(sy.beat1-sy.beat0)<full*0.6);
      sy.scale=shortLast?Math.max(1,sy.target/sy.nat):avail/sy.nat; sy.mapX=rx=>sy.left+(rx-sy.rawX0)*sy.scale; sy.endX=sy.mapX(sy.rawX1); });
    const sysOfBeat=beat=>{for(let i=0;i<systems.length;i++){if(beat<systems[i].beat1-1e-6||i===systems.length-1)return i;}return systems.length-1;};
    const sysH=(spec.rhythmOnly?9.5:11.5)*SS;
    const E=[]; let minY=1e9,maxY=-1e9; const track=y=>{if(y<minY)minY=y;if(y>maxY)maxY=y;};
    const rx=SS*0.62, ry=SS*0.44, stemLen=SS*3.4, beamT=SS*0.48;
    const xs=[], sysOf=[], ys=[];
    // ---- per-system furniture ----
    systems.forEach((sy,si)=>{ const oy=si*sysH;
      for(let k=0;k<5;k++){const y=oy+TOPK*SS+k*SS;E.push(`<line x1="${(SS*0.3).toFixed(1)}" y1="${y.toFixed(1)}" x2="${sy.endX.toFixed(1)}" y2="${y.toFixed(1)}" stroke="var(--line)" stroke-width="1.25"/>`);}
      track(oy+TOPK*SS-SS*2.6); track(oy+TOPK*SS+4*SS+SS*2.6);
      E.push(gEl(cd.glyph,SS*0.5,oy+yOf(top,cd.lineDia),'var(--ink)'));
      let kx=SS*0.5+cd.clefW*SS+SS*0.5; const pos=KS_POS[spec.clef==='bass'?'bass':'treble'][ks>0?'s':'f'];
      for(let k=0;k<Math.abs(ks);k++){E.push(gEl(ks>0?'sharp':'flat',kx,oy+yOf(top,pos[k]),'var(--ink)'));kx+=SS*0.62;}
      if(si===0){const tsx=kx+(ks?SS*0.3:0)+tsW*0.5;
        E.push(`<text x="${tsx.toFixed(1)}" y="${(oy+TOPK*SS+1.62*SS).toFixed(1)}" text-anchor="middle" font-size="${(SS*2.05).toFixed(1)}" font-weight="700" font-family="Georgia,'Times New Roman',serif" fill="var(--ink)">${numer}</text>`);
        E.push(`<text x="${tsx.toFixed(1)}" y="${(oy+TOPK*SS+3.68*SS).toFixed(1)}" text-anchor="middle" font-size="${(SS*2.05).toFixed(1)}" font-weight="700" font-family="Georgia,'Times New Roman',serif" fill="var(--ink)">${denom}</text>`);}
      // barlines
      for(let s=sy.segA;s<=sy.segB;s++){const bx=sy.mapX(barX[s])+barPad*sy.scale*0.5*(s===sy.segB?0:1); const last=(s===nSeg-1);
        const X=last?sy.endX-SS*0.1:bx;
        E.push(`<line x1="${X.toFixed(1)}" y1="${(oy+TOPK*SS).toFixed(1)}" x2="${X.toFixed(1)}" y2="${(oy+TOPK*SS+4*SS).toFixed(1)}" stroke="var(--ink)" stroke-width="${last?3.2:1.4}"/>`);
        if(last)E.push(`<line x1="${(X-SS*0.55).toFixed(1)}" y1="${(oy+TOPK*SS).toFixed(1)}" x2="${(X-SS*0.55).toFixed(1)}" y2="${(oy+TOPK*SS+4*SS).toFixed(1)}" stroke="var(--ink)" stroke-width="1.3"/>`);
        if(s===sy.segB&&!last)E.push(`<line x1="${sy.endX.toFixed(1)}" y1="${(oy+TOPK*SS).toFixed(1)}" x2="${sy.endX.toFixed(1)}" y2="${(oy+TOPK*SS+4*SS).toFixed(1)}" stroke="var(--ink)" stroke-width="1.4"/>`);
      }
    });
    // ---- note positions ----
    notes.forEach((n,i)=>{ const si=sysOfBeat(n.onset); const sy=systems[si]; sysOf[i]=si;
      xs[i]=sy.mapX(slotX[i])+SS*0.95; });
    const dd=notes.map(n=> n.state==='empty'?(top-4):(n.showD!==undefined?n.showD:(n.d!==undefined?n.d:top-4)));
    // ---- beam groups ----
    const grpKey=on=>{const b=barOf(on,pickup,bpb),p=posInBar(on,pickup,bpb);let gi=0;for(let k=0;k<g.length;k++)if(p>=g[k]-1e-6)gi=k;return b*100+gi;};
    const groups=[]; let cur=null;
    notes.forEach((n,i)=>{ if(n.dur<1-1e-6&&!n.rest){const k=grpKey(n.onset); if(cur&&cur.k===k&&sysOf[i]===cur.sys)cur.idx.push(i); else {cur={k,idx:[i],sys:sysOf[i]};groups.push(cur);} } else cur=null; });
    const beamed=groups.filter(gp=>gp.idx.length>1), inGroup={}; beamed.forEach((gp,gi)=>gp.idx.forEach(k=>inGroup[k]=gi));
    const groupDir=beamed.map(gp=>{const avg=gp.idx.reduce((s,k)=>s+dd[k],0)/gp.idx.length;return avg<top-4?'up':'down';});
    const headCol=n=>n.state==='empty'?'#b9b3a6':(n.color||'var(--ink)');
    const onLine=d=>((top-d)%2===0);
    const dotEl=(x,y,d,col)=>`<circle cx="${(x+rx+SS*0.42).toFixed(1)}" cy="${(onLine(d)?y-SS*0.5:y).toFixed(1)}" r="${(SS*0.17).toFixed(1)}" fill="${col}"/>`;
    const isDotted=dur=>eq(dur,1.5)||eq(dur,3)||eq(dur,0.75);
    // ---- rests ----
    function restEl(n,i,oy){ const x=xs[i], col=headCol(n), mid=oy+TOPK*SS+2*SS, d=n.dur; let s='';
      const wholeBar=eq(d,bpb)||eq(d,3)&&bpb===3||eq(d,4)&&bpb===4;
      if(d>=4-1e-6||wholeBar||eq(d,3)&&!(bpb===4)){ // semibreve rest hangs from the 2nd line
        s+=`<rect x="${(x-SS*0.6).toFixed(1)}" y="${(oy+TOPK*SS+SS).toFixed(1)}" width="${(SS*1.2).toFixed(1)}" height="${(SS*0.5).toFixed(1)}" fill="${col}"/>`; }
      else if(d>=2-1e-6){ s+=`<rect x="${(x-SS*0.6).toFixed(1)}" y="${(mid-SS*0.5).toFixed(1)}" width="${(SS*1.2).toFixed(1)}" height="${(SS*0.5).toFixed(1)}" fill="${col}"/>`; if(eq(d,3))s+=dotEl(x,mid-SS*0.25,top-3,col); }
      else if(d>=1-1e-6){ // crotchet rest
        const p=[[-0.28,-1.25],[0.32,-0.55],[-0.22,0.12],[0.34,0.78],[0.02,0.62],[-0.22,0.72],[-0.08,1.12]].map(q=>`${(x+q[0]*SS).toFixed(1)},${(mid+q[1]*SS).toFixed(1)}`);
        s+=`<path d="M${p[0]} L${p[1]} L${p[2]} L${p[3]} C${p[4]} ${p[5]} ${p[6]}" fill="none" stroke="${col}" stroke-width="${(SS*0.3).toFixed(1)}" stroke-linejoin="round" stroke-linecap="round"/>`;
        if(eq(d,1.5))s+=dotEl(x-SS*0.1,mid-SS*0.5,top-3,col); }
      else { // quaver / semiquaver rests
        const flags=(d<0.5-1e-6&&!n.trip)?2:1; const x0=x+SS*0.3, y0=mid-SS*0.55;
        s+=`<line x1="${x0.toFixed(1)}" y1="${y0.toFixed(1)}" x2="${(x-SS*0.25).toFixed(1)}" y2="${(mid+SS*(flags===2?1.2:0.75)).toFixed(1)}" stroke="${col}" stroke-width="${(SS*0.16).toFixed(1)}" stroke-linecap="round"/>`;
        for(let f=0;f<flags;f++){const fy=y0+f*SS*0.75, fx=x0-f*SS*0.22; s+=`<circle cx="${(fx-SS*0.42).toFixed(1)}" cy="${(fy+SS*0.02).toFixed(1)}" r="${(SS*0.2).toFixed(1)}" fill="${col}"/>`;
          s+=`<path d="M${(fx-SS*0.42).toFixed(1)},${(fy+SS*0.1).toFixed(1)} Q${(fx-SS*0.1).toFixed(1)},${(fy+SS*0.32).toFixed(1)} ${fx.toFixed(1)},${(fy).toFixed(1)}" fill="none" stroke="${col}" stroke-width="${(SS*0.12).toFixed(1)}"/>`;}
        if(eq(d,0.75))s+=dotEl(x+SS*0.1,mid-SS*0.5,top-3,col); }
      return s; }
    // ---- draw notes ----
    const flagPath=(sx,sy,up,col)=>{ const k=up?1:-1;
      return `<path d="M${sx.toFixed(1)},${sy.toFixed(1)} c0,${(k*SS*1.0).toFixed(1)} ${(SS*1.15).toFixed(1)},${(k*SS*0.95).toFixed(1)} ${(SS*0.95).toFixed(1)},${(k*SS*2.35).toFixed(1)} c${(SS*0.15).toFixed(1)},${(k*-SS*1.0).toFixed(1)} ${(-SS*0.25).toFixed(1)},${(k*-SS*1.55).toFixed(1)} ${(-SS*0.95).toFixed(1)},${(k*-SS*1.75).toFixed(1)} z" fill="${col}"/>`; };
    notes.forEach((n,i)=>{ const si=sysOf[i], oy=si*sysH, x=xs[i], col=headCol(n); ys[i]=oy+yOf(top,dd[i]);
      if(n.rest){E.push(restEl(n,i,oy)); if(isDotted(n.dur)&&n.dur<1){} return;}
      const empty=(n.state==='empty'), d=dd[i], y=ys[i];
      if(empty){ // placeholder: dashed head on the middle line, but the rhythm (stem/flag/beam) is shown
        E.push(`<ellipse cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" rx="${rx}" ry="${ry}" transform="rotate(-18 ${x.toFixed(1)} ${y.toFixed(1)})" fill="none" stroke="#b9b3a6" stroke-width="1.2" stroke-dasharray="3 2"/>`);
        if(isDotted(n.dur))E.push(dotEl(x,y,d,'#b9b3a6'));
        if(n.dur>=4-1e-6)return;
        const gi=inGroup[i]; const up=(gi!==undefined)?groupDir[gi]==='up':false; const sx=up?x+rx*0.88:x-rx*0.88;
        if(gi===undefined){ const sy2=up?y-stemLen:y+stemLen;
          E.push(`<line x1="${sx.toFixed(2)}" y1="${y.toFixed(2)}" x2="${sx.toFixed(2)}" y2="${sy2.toFixed(2)}" stroke="#b9b3a6" stroke-width="1.6"/>`); track(up?sy2-SS*2.4:sy2+SS*2.4);
          if(n.dur<1-1e-6){ const nf=(n.dur<0.5-1e-6&&!n.trip)?2:1; for(let f=0;f<nf;f++)E.push(flagPath(sx,sy2+(up?1:-1)*f*SS*0.8,up,'#b9b3a6')); } }
        return; }
      ledgerYs(top,bot,d).forEach(ed=>{const ly=oy+yOf(top,ed);E.push(`<line x1="${(x-rx*1.75).toFixed(1)}" y1="${ly.toFixed(1)}" x2="${(x+rx*1.75).toFixed(1)}" y2="${ly.toFixed(1)}" stroke="var(--line)" stroke-width="1.25"/>`);track(ly);});
      const shown=res.shown[i]; if(shown)E.push(accEl(shown,x-rx-SS*0.14,y,col));
      const open=n.dur>=2-1e-6;
      if(n.dur>=4-1e-6){E.push(gEl('noteheadWhole',x-NW/2,y,col));}
      else E.push(`<ellipse cx="${x.toFixed(2)}" cy="${y.toFixed(2)}" rx="${rx}" ry="${ry}" transform="rotate(-20 ${x.toFixed(2)} ${y.toFixed(2)})" fill="${open?'none':col}" stroke="${col}" stroke-width="${open?SS*0.19:0.8}"/>`);
      if(isDotted(n.dur))E.push(dotEl(x,y,d,col));
      track(y-ry-2);track(y+ry+2);
      if(n.clearable){const cyc=oy+TOPK*SS+4*SS+SS*1.75;
        E.push(`<g class="sclr" data-i="${i}"><circle cx="${x.toFixed(1)}" cy="${cyc.toFixed(1)}" r="${(SS*0.55).toFixed(1)}" fill="var(--paper)" stroke="var(--rule)"/><text x="${x.toFixed(1)}" y="${(cyc+SS*0.22).toFixed(1)}" text-anchor="middle" font-size="${(SS*0.75).toFixed(1)}" fill="#8a8277">✕</text></g>`);track(cyc+SS*0.9);}
      if(n.dur>=4-1e-6)return;
      const gi=inGroup[i]; const up=(gi!==undefined)?groupDir[gi]==='up':(d<top-4);
      const sx=up?x+rx*0.88:x-rx*0.88;
      if(gi===undefined){ const sy2=up?y-stemLen:y+stemLen;
        E.push(`<line x1="${sx.toFixed(2)}" y1="${y.toFixed(2)}" x2="${sx.toFixed(2)}" y2="${sy2.toFixed(2)}" stroke="${col}" stroke-width="1.6"/>`); track(up?sy2-SS*2.4:sy2+SS*2.4);
        if(n.dur<1-1e-6){ const nf=(n.dur<0.5-1e-6&&!n.trip)?2:1; for(let f=0;f<nf;f++)E.push(flagPath(sx,sy2+(up?1:-1)*f*SS*0.8,up,col)); }
      }
    });
    // ---- beams ----
    beamed.forEach((gp,gi)=>{ const up=groupDir[gi]==='up'; const gy=gp.idx.map(k=>ys[k]);
      const beamY=up?Math.min(...gy)-stemLen:Math.max(...gy)+stemLen; const dir=up?1:-1;
      const sxOf=k=>up?xs[k]+rx*0.88:xs[k]-rx*0.88;
      gp.idx.forEach(k=>{const col=headCol(notes[k]);E.push(`<line x1="${sxOf(k).toFixed(2)}" y1="${ys[k].toFixed(2)}" x2="${sxOf(k).toFixed(2)}" y2="${beamY.toFixed(2)}" stroke="${col}" stroke-width="1.6"/>`);});
      const x0=sxOf(gp.idx[0]), x1=sxOf(gp.idx[gp.idx.length-1]);
      const bcol=gp.idx.every(k=>notes[k].state==='empty')?'#b9b3a6':'var(--ink)';
      E.push(`<rect x="${Math.min(x0,x1).toFixed(2)}" y="${(beamY-(up?0:beamT)).toFixed(2)}" width="${Math.abs(x1-x0).toFixed(2)}" height="${beamT.toFixed(2)}" fill="${bcol}"/>`);
      track(beamY-beamT*2);track(beamY+beamT*2);
      // secondary beams (semiquavers): full between adjacent semiquavers, else a stub
      const y2=beamY+dir*(beamT+SS*0.2) - (up?0:beamT);
      const isSemi=k=>notes[k].dur<0.5-1e-6&&!notes[k].trip;
      for(let j=0;j<gp.idx.length;j++){const k=gp.idx[j]; if(!isSemi(k))continue;
        const nxt=gp.idx[j+1], prv=gp.idx[j-1];
        if(nxt!==undefined&&isSemi(nxt)){E.push(`<rect x="${Math.min(sxOf(k),sxOf(nxt)).toFixed(2)}" y="${y2.toFixed(2)}" width="${Math.abs(sxOf(nxt)-sxOf(k)).toFixed(2)}" height="${beamT.toFixed(2)}" fill="${bcol}"/>`);}
        else if(!(prv!==undefined&&isSemi(prv))){ const stub=SS*0.95, right=(j===0); const sx=sxOf(k);
          E.push(`<rect x="${(right?sx:sx-stub).toFixed(2)}" y="${y2.toFixed(2)}" width="${stub.toFixed(2)}" height="${beamT.toFixed(2)}" fill="${bcol}"/>`);} }
      if(gp.idx.some(k=>notes[k].trip)){ const tx=(x0+x1)/2, ty=up?beamY-SS*0.5:beamY+SS*1.25;
        E.push(`<text x="${tx.toFixed(1)}" y="${ty.toFixed(1)}" text-anchor="middle" font-size="${(SS*0.95).toFixed(1)}" font-style="italic" font-weight="700" font-family="Georgia,serif" fill="var(--ink)">3</text>`); track(up?ty-SS:ty+SS*0.3); }
    });
    // ---- ties ----
    notes.forEach((n,i)=>{ if(!n.tie||n.rest)return; const j=i+1; if(j>=notes.length||notes[j].rest)return;
      const gi=inGroup[i]; const up=(gi!==undefined)?groupDir[gi]==='up':(dd[i]<top-4); const below=up;
      const col=headCol(n); const k=below?1:-1;
      if(sysOf[j]===sysOf[i]){ const x1=xs[i]+rx*0.9, x2=xs[j]-rx*0.9, y=ys[i]+k*ry*1.1;
        E.push(`<path d="M${x1.toFixed(1)},${y.toFixed(1)} Q${((x1+x2)/2).toFixed(1)},${(y+k*SS*0.95).toFixed(1)} ${x2.toFixed(1)},${y.toFixed(1)}" fill="none" stroke="${col}" stroke-width="1.7"/>`); }
      else { const x1=xs[i]+rx*0.9, x2=systems[sysOf[i]].endX, y=ys[i]+k*ry*1.1; // tie over the system break
        E.push(`<path d="M${x1.toFixed(1)},${y.toFixed(1)} Q${((x1+x2)/2).toFixed(1)},${(y+k*SS*0.9).toFixed(1)} ${x2.toFixed(1)},${y.toFixed(1)}" fill="none" stroke="${col}" stroke-width="1.7"/>`);
        const x3=systems[sysOf[j]].left, x4=xs[j]-rx*0.9, yy=ys[j]+k*ry*1.1;
        E.push(`<path d="M${x3.toFixed(1)},${yy.toFixed(1)} Q${((x3+x4)/2).toFixed(1)},${(yy+k*SS*0.9).toFixed(1)} ${x4.toFixed(1)},${yy.toFixed(1)}" fill="none" stroke="${col}" stroke-width="1.7"/>`); }
    });
    // ---- cursor ----
    let cursorSys=null;
    if(spec.cursorBeat!==undefined&&spec.cursorBeat<totalBeats-1e-6){ const si=sysOfBeat(spec.cursorBeat), sy=systems[si], oy=si*sysH; cursorSys=si;
      const cx=sy.mapX(xAt(spec.cursorBeat))+SS*0.95;
      E.push(`<line x1="${cx.toFixed(1)}" y1="${(oy+TOPK*SS-SS*0.9).toFixed(1)}" x2="${cx.toFixed(1)}" y2="${(oy+TOPK*SS+4*SS+SS*0.9).toFixed(1)}" stroke="var(--accent)" stroke-width="2" stroke-dasharray="3 3"/>`); }
    const pad=SS*0.5, y0=minY-pad, vh=(maxY-minY)+pad*2;
    const svg=`<svg class="score" id="score" viewBox="0 ${y0.toFixed(1)} ${W.toFixed(1)} ${vh.toFixed(1)}" width="${W.toFixed(0)}" preserveAspectRatio="xMidYMid meet" style="touch-action:none;max-width:${(W*1.5).toFixed(0)}px" xmlns="http://www.w3.org/2000/svg">${E.join('')}</svg>`;
    return {svg,xs,ys,sysOf,W,top,y0,vh,sysH,nSys:systems.length,midi:res.midi,shown:res.shown,cursorSys,order:notes};
  }
  // map a pointer event on the score svg to {sys, d, x}
  function hitTest(meta,svg,ev){const r=svg.getBoundingClientRect();const vy=meta.y0+(ev.clientY-r.top)/r.height*meta.vh, vx=(ev.clientX-r.left)/r.width*meta.W;
    let sys=Math.floor(vy/meta.sysH); sys=Math.max(0,Math.min(meta.nSys-1,sys)); const ly=vy-sys*meta.sysH;
    let d=Math.round(meta.top-(ly-TOPK*SS)/(SS/2)); d=Math.max(meta.top-8-7,Math.min(meta.top+9,d)); return {sys,d,x:vx};}

  // exports
  Object.assign(window,{SS,GS,TOPK,dia,clefData,yOf,gEl,ledgerYs,accW,NW,drawWholeNote,midiOf,letterOf,ACCOFF});
  // sol-fa: moveable do, la-based minor. Only the four scales sung in class get syllables.
  const SOLFA_SET={'major':['do','re','mi','fa','so','la','ti'],'major pentatonic':['do','re','mi','so','la'],'natural minor':['la','ti','do','re','mi','fa','so'],'minor pentatonic':['la','do','re','mi','so']};
  const CHROM_SOLFA={0:'do',1:'di',2:'re',3:'me',4:'mi',5:'fa',6:'fi',7:'so',8:'si',9:'la',10:'te',11:'ti'};
  function solfaFor(scaleType){return SOLFA_SET[scaleType]||null;}
  function solfaOf(midi,tonicMidi,scaleType){const sc=SCALES.find(s=>s.name===scaleType),syl=SOLFA_SET[scaleType];if(!sc||!syl)return '';const off=((midi-tonicMidi)%12+12)%12;const k=sc.deg.findIndex(d=>d[0]===off);if(k>=0)return syl[k];return CHROM_SOLFA[/minor/.test(scaleType)?(off+9)%12:off]||'';}
  window.ENGRAVE={buildDictation,solfaFor,solfaOf,fillBar:(diff,metreId,len)=>fillBar(diff,METRES[metreId]||METRES['4/4'],{syncopation:true,noWhole:true},len),drawScore,hitTest,spellNote,resolveLine,keyAccMap,SCALES,METRES,MAJ_KS,KEYNAME,T3,barOf,posInBar};
})();
