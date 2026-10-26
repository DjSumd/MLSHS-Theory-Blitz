// theory.js — music-theory core for ATAR Music Theory Blitz. Pure logic, no DOM.
// Pitch = {l:'C'..'B', a:-2..2 (accidental), o:octave (SPN, middle C = C4)}
const T=(()=>{
const LETTERS=['C','D','E','F','G','A','B'];
const LI={C:0,D:1,E:2,F:3,G:4,A:5,B:6};
const PC={C:0,D:2,E:4,F:5,G:7,A:9,B:11};
const ACC={ '-2':'𝄫','-1':'♭','0':'','1':'♯','2':'𝄪'};
const ACCW={ '-2':'double flat','-1':'flat','0':'natural','1':'sharp','2':'double sharp'};
const P=(l,a,o)=>({l,a:a|0,o:o|0});
const dia=p=>p.o*7+LI[p.l];
const midi=p=>(p.o+1)*12+PC[p.l]+p.a;
const fromDia=(d,a)=>P(LETTERS[((d%7)+7)%7],a||0,Math.floor(d/7));
const eq=(p,q)=>p.l===q.l&&p.a===q.a&&p.o===q.o;
const eqName=(p,q)=>p.l===q.l&&p.a===q.a;
const enh=(p,q)=>midi(p)===midi(q);
const name=p=>p.l+ACC[p.a];           // e.g. F♯
const spn=p=>name(p)+p.o;             // F♯4
const parse=s=>{ // "F#4", "Bb3", "Cx4", "Dbb4", "E"
  const m=/^([A-Ga-g])(x|##|#|bb|b|♯|♭|𝄪|𝄫|n|♮)?(-?\d+)?$/.exec(s.trim());
  if(!m)throw new Error('bad pitch '+s);
  const a={undefined:0,'#':1,'♯':1,'x':2,'##':2,'𝄪':2,'b':-1,'♭':-1,'bb':-2,'𝄫':-2,'n':0,'♮':0}[m[2]];
  return P(m[1].toUpperCase(),a,m[3]===undefined?4:+m[3]);};
const withOct=(p,o)=>P(p.l,p.a,o);
const up8=(p,n=1)=>P(p.l,p.a,p.o+n);
// ---------- intervals ----------
const NAT=[0,2,4,5,7,9,11]; // natural semitones for simple interval numbers 1..7
const isPerfClass=n=>[0,3,4].includes((n-1)%7);
const natSemis=n=>NAT[(n-1)%7]+12*Math.floor((n-1)/7);
const QDELTA={P:0,M:0,m:-1,A:1,d:-1,AA:2,dd:-2};
function qualityOf(n,semis){const diff=semis-natSemis(n);
  if(isPerfClass(n)){return {0:'P',1:'A','-1':'d',2:'AA','-2':'dd'}[diff];}
  return {0:'M','-1':'m',1:'A','-2':'d',2:'AA','-3':'dd'}[diff];}
function interval(lo,hi){ // hi above lo
  const n=dia(hi)-dia(lo)+1,s=midi(hi)-midi(lo);
  const q=qualityOf(n,s);return {n,s,q,name:q===undefined?'?':q+n};}
function delta(q,n){ // semitone offset from natural for quality q of number n
  if(isPerfClass(n))return {P:0,A:1,d:-1,AA:2,dd:-2}[q];
  return {M:0,m:-1,A:1,d:-2,AA:2,dd:-3}[q];}
function parseIv(s){const m=/^(P|M|m|A|d|AA|dd)(\d+)$/.exec(s);return {q:m[1],n:+m[2]};}
function transposeUp(p,iv){if(typeof iv==='string')iv=parseIv(iv);
  const d=dia(p)+iv.n-1,target=midi(p)+natSemis(iv.n)+delta(iv.q,iv.n);
  const q=fromDia(d,0);return P(q.l,target-midi(q),q.o);}
function transposeDown(p,iv){if(typeof iv==='string')iv=parseIv(iv);
  const d=dia(p)-(iv.n-1),target=midi(p)-natSemis(iv.n)-delta(iv.q,iv.n);
  const q=fromDia(d,0);return P(q.l,target-midi(q),q.o);}
function invertIv(iv){if(typeof iv==='string')iv=parseIv(iv);
  const n=iv.n>8?iv.n-7:iv.n;const nn=9-n;const qm={P:'P',M:'m',m:'M',A:'d',d:'A',AA:'dd',dd:'AA'};return {q:qm[iv.q],n:nn};}
const ivWord=iv=>{if(typeof iv==='string')iv=parseIv(iv);
  const qn={P:'perfect',M:'major',m:'minor',A:'augmented',d:'diminished',AA:'doubly augmented',dd:'doubly diminished'};
  const nn={1:'unison',2:'2nd',3:'3rd',4:'4th',5:'5th',6:'6th',7:'7th',8:'octave',9:'9th',10:'10th',11:'11th',12:'12th',13:'13th'};
  return qn[iv.q]+' '+nn[iv.n];};
const ivShort=iv=>{if(typeof iv==='string')iv=parseIv(iv);return iv.q+iv.n;};
// ---------- keys ----------
// signed count of sharps (+) / flats (−) for a major tonic
const MAJ_SIG={'C':0,'G':1,'D':2,'A':3,'E':4,'B':5,'F♯':6,'C♯':7,'F':-1,'B♭':-2,'E♭':-3,'A♭':-4,'D♭':-5,'G♭':-6,'C♭':-7};
const SHARP_ORDER=['F','C','G','D','A','E','B'],FLAT_ORDER=['B','E','A','D','G','C','F'];
function majorKeys(max){return Object.keys(MAJ_SIG).filter(k=>Math.abs(MAJ_SIG[k])<=max).map(k=>parse(k.replace('♯','#').replace('♭','b')+'4'));}
function sigOf(tonic,mode){ // tonic Pitch, mode 'major'|'minor'|modes → signed count or null
  let maj=tonic;
  if(mode==='minor'||mode==='aeolian')maj=transposeUp(tonic,'m3');
  else if(mode==='dorian')maj=transposeDown(tonic,'M2');
  else if(mode==='phrygian')maj=transposeDown(tonic,'M3');
  else if(mode==='lydian')maj=transposeDown(tonic,'P4');
  else if(mode==='mixolydian')maj=transposeDown(tonic,'P5');
  else if(mode==='locrian')maj=transposeDown(tonic,'M7');
  const n=MAJ_SIG[name(maj)];return n===undefined?null:n;}
function sigAccidentals(n){ // {letter: acc}
  const m={};if(n>0)SHARP_ORDER.slice(0,n).forEach(l=>m[l]=1);if(n<0)FLAT_ORDER.slice(0,-n).forEach(l=>m[l]=-1);return m;}
function sigWord(n){if(n===0)return 'no sharps or flats';const k=Math.abs(n);return k+' '+(n>0?'sharp':'flat')+(k>1?'s':'');}
function sigList(n){if(n===0)return '';return (n>0?SHARP_ORDER.slice(0,n).map(l=>l+'♯'):FLAT_ORDER.slice(0,-n).map(l=>l+'♭')).join(' ');}
function majorFromSig(n){for(const k in MAJ_SIG)if(MAJ_SIG[k]===n)return parse(k.replace('♯','#').replace('♭','b')+'4');return null;}
const relMinor=t=>transposeDown(t,'m3'), relMajor=t=>transposeUp(t,'m3');
const DEG_NAMES=['tonic','supertonic','mediant','subdominant','dominant','submediant','leading note'];
// ---------- scales ----------
// semitone step patterns
const SCALES={
  major:{name:'major',steps:[2,2,1,2,2,2,1]}, ionian:{name:'Ionian',steps:[2,2,1,2,2,2,1]},
  natminor:{name:'natural minor',steps:[2,1,2,2,1,2,2]}, aeolian:{name:'Aeolian',steps:[2,1,2,2,1,2,2]},
  harmminor:{name:'harmonic minor',steps:[2,1,2,2,1,3,1]},
  melminor:{name:'melodic minor',steps:[2,1,2,2,2,2,1],descSteps:[2,1,2,2,1,2,2]},
  dorian:{name:'Dorian',steps:[2,1,2,2,2,1,2]}, phrygian:{name:'Phrygian',steps:[1,2,2,2,1,2,2]},
  lydian:{name:'Lydian',steps:[2,2,2,1,2,2,1]}, mixolydian:{name:'Mixolydian',steps:[2,2,1,2,2,1,2]},
  locrian:{name:'Locrian',steps:[1,2,2,1,2,2,2]},
  majpent:{name:'major pentatonic',degrees:[0,1,2,4,5],parent:'major'},
  minpent:{name:'minor pentatonic',degrees:[0,2,3,4,6],parent:'natminor'},
  blues:{name:'blues',special:'blues'}, chromatic:{name:'chromatic',special:'chromatic'},
};
function scale7(tonic,steps){const out=[tonic];let cur=tonic;
  for(let i=0;i<steps.length;i++){const d=dia(cur)+1,q=fromDia(d,0);const target=midi(cur)+steps[i];cur=P(q.l,target-midi(q),q.o);out.push(cur);}
  return out;}
function scale(tonic,type,desc){const S=SCALES[type];
  if(S.steps){let s;if(desc&&S.descSteps){s=scale7(tonic,S.descSteps);return s.slice().reverse();}
    s=scale7(tonic,S.steps);return desc?s.slice().reverse():s;}
  if(S.degrees){const par=scale7(tonic,SCALES[S.parent].steps);const s=S.degrees.map(i=>par[i]).concat([up8(tonic)]);return desc?s.slice().reverse():s;}
  if(S.special==='blues'){const par=scale7(tonic,SCALES.natminor.steps);
    const s=[par[0],par[2],par[3],transposeUp(par[3],'A1'),par[4],par[6],up8(tonic)];return desc?s.slice().reverse():s;}
  if(S.special==='chromatic'){return chromatic(tonic,desc);}
  throw new Error('scale '+type);}
// Chromatic scale spelled from the tonic's major scale: the diatonic notes keep their spelling;
// ascending, each tone-gap is filled by raising the lower note (sharps); descending, by lowering the upper note (flats).
// Where both spellings need an accidental the direction decides; where one spelling is a natural (B♯ vs C, E♯ vs F) the natural is used.
function chromatic(tonic,desc){const maj=scale7(tonic,SCALES.major.steps); // 8 notes, tonic..tonic
  const out=[];const fill=(lo,hi)=>{const up=P(lo.l,lo.a+1,lo.o),dn=P(hi.l,hi.a-1,hi.o);if(Math.abs(dn.a)<Math.abs(up.a))return dn;if(Math.abs(up.a)<Math.abs(dn.a))return up;return desc?dn:up;};
  if(!desc){for(let i=0;i<7;i++){const a=maj[i],b=maj[i+1];out.push(a);if(midi(b)-midi(a)===2)out.push(fill(a,b));}out.push(maj[7]);}
  else{for(let i=7;i>0;i--){const a=maj[i],b=maj[i-1];out.push(a);if(midi(a)-midi(b)===2)out.push(fill(b,a));}out.push(maj[0]);}
  return out;}
const scaleName=(tonic,type)=>name(tonic)+' '+SCALES[type].name;
// alternative acceptable spelling of the blue note (♭5)
function bluesAlt(tonic){const par=scale7(tonic,SCALES.natminor.steps);return transposeDown(par[4],'A1');}
// ---------- chords ----------
const CHORDS={
  maj:{name:'major',sym:'',alt:['maj'],iv:[0,4,7],syl:'major triad'},
  min:{name:'minor',sym:'m',alt:['−','min'],iv:[0,3,7],syl:'minor triad'},
  dim:{name:'diminished',sym:'dim',alt:['°'],iv:[0,3,6],syl:'diminished triad'},
  aug:{name:'augmented',sym:'aug',alt:['+'],iv:[0,4,8],syl:'augmented triad'},
  maj7:{name:'major 7th',sym:'maj7',alt:['∆7','M7'],iv:[0,4,7,11]},
  dom7:{name:'dominant 7th',sym:'7',alt:[],iv:[0,4,7,10]},
  min7:{name:'minor 7th',sym:'m7',alt:['−7','min7'],iv:[0,3,7,10]},
  m7b5:{name:'minor 7 flat 5 (half-diminished)',sym:'m7♭5',alt:['ø7','ø'],iv:[0,3,6,10]},
  dim7:{name:'diminished 7th',sym:'dim7',alt:['°7'],iv:[0,3,6,9]},
  dom9:{name:'dominant 9th',sym:'9',alt:[],iv:[0,4,7,10,14]},
  maj9:{name:'major 9th',sym:'maj9',alt:['∆9'],iv:[0,4,7,11,14]},
  min9:{name:'minor 9th',sym:'m9',alt:['−9'],iv:[0,3,7,10,14]},
  sus4:{name:'suspended 4th',sym:'sus4',alt:['sus'],iv:[0,5,7],deg:[0,3,4]},
  sus2:{name:'suspended 2nd',sym:'sus2',alt:[],iv:[0,2,7],deg:[0,1,4]},
  maj6:{name:'major 6th',sym:'6',alt:[],iv:[0,4,7,9],deg:[0,2,4,5]},
  min6:{name:'minor 6th',sym:'m6',alt:['−6'],iv:[0,3,7,9],deg:[0,2,4,5]},
  dom7s4:{name:'7th suspended 4th',sym:'7sus4',alt:[],iv:[0,5,7,10],deg:[0,3,4,6]},
};
function chord(root,type,inv){const C=CHORDS[type];const notes=C.iv.map((s,i)=>{const d=dia(root)+(C.deg?C.deg[i]:2*i),q=fromDia(d,0);return P(q.l,midi(root)+s-midi(q),q.o);});
  if(inv)for(let i=0;i<inv;i++)notes.push(up8(notes.shift()));return notes;}
const chordSym=(root,type)=>name(root)+CHORDS[type].sym;
const chordSymAlt=(root,type)=>CHORDS[type].alt.map(a=>name(root)+a);
const chordName=(root,type)=>name(root)+' '+CHORDS[type].name;
function slashSym(root,type,inv){const n=chord(root,type,inv);return chordSym(root,type)+(inv?'/'+name(n[0]):'');}
const INV_NAMES=['root position','first inversion','second inversion','third inversion'];
// scale-tone chords: major & minor (harmonic-minor V and vii°)
const MAJ_RN=['I','ii','iii','IV','V','vi','vii°'],MAJ_Q=['maj','min','min','maj','maj','min','dim'];
const MIN_RN=['i','ii°','III','iv','V','VI','vii°'],MIN_Q=['min','dim','maj','min','maj','maj','dim'];
const MAJ_RN7=['Imaj7','ii7','iii7','IVmaj7','V7','vi7','viiø7'],MAJ_Q7=['maj7','min7','min7','maj7','dom7','min7','m7b5'];
// minor-key 7ths: III, VI from the natural minor; V7 and vii°7 use the raised leading note
const MIN_RN7=['i7','iiø7','IIImaj7','iv7','V7','VImaj7','vii°7'],MIN_Q7=['min7','m7b5','maj7','min7','dom7','maj7','dim7'];
function diatonicChord(key,mode,deg,seventh){ // deg 0..6. Minor = i ii° III iv V VI vii° (III and VI from the natural minor; V and vii° from the harmonic minor)
  const sc=mode==='major'?scale(key,'major'):scale(key,'harmminor');
  const root=sc[deg];let q,rn;
  if(mode==='major'){q=seventh?MAJ_Q7[deg]:MAJ_Q[deg];rn=seventh?MAJ_RN7[deg]:MAJ_RN[deg];}
  else{q=seventh?MIN_Q7[deg]:MIN_Q[deg];rn=seventh?MIN_RN7[deg]:MIN_RN[deg];}
  return {root,type:q,rn,deg};}
const INV_LETTER=['a','b','c','d']; // Ib = first inversion
// cadences: pairs of scale degrees (0-based) + name
const CADENCES=[
  {id:'perfect',name:'perfect',degs:[4,0],alt:'V–I'},
  {id:'plagal',name:'plagal',degs:[3,0],alt:'IV–I'},
  {id:'imperfect',name:'imperfect',degs:[0,4],alt:'I–V'},
  {id:'imperfect2',name:'imperfect',degs:[3,4],alt:'IV–V'},
  {id:'imperfect3',name:'imperfect',degs:[1,4],alt:'ii–V'},
  {id:'interrupted',name:'interrupted',degs:[4,5],alt:'V–vi'},
];
// ---------- transposing instruments ----------
const INSTR=[
  {id:'bbtpt',name:'B♭ trumpet',key:'B♭',iv:'M2',dir:'down'},
  {id:'bbcl',name:'B♭ clarinet',key:'B♭',iv:'M2',dir:'down'},
  {id:'ssax',name:'soprano saxophone (B♭)',key:'B♭',iv:'M2',dir:'down'},
  {id:'tsax',name:'tenor saxophone (B♭)',key:'B♭',iv:'M9',dir:'down'},
  {id:'asax',name:'alto saxophone (E♭)',key:'E♭',iv:'M6',dir:'down'},
  {id:'bsax',name:'baritone saxophone (E♭)',key:'E♭',iv:'M13',dir:'down'},
  {id:'fhn',name:'French horn (F)',key:'F',iv:'P5',dir:'down'},
  {id:'acl',name:'clarinet in A',key:'A',iv:'m3',dir:'down'},
];
// written = concert transposed UP by iv (instrument sounds iv below written)
const toWritten=(p,ins)=>transposeUp(p,ins.iv), toConcert=(p,ins)=>transposeDown(p,ins.iv);
// ---------- helpers ----------
const rand=n=>Math.floor(Math.random()*n), pick=a=>a[rand(a.length)];
const shuffle=a=>{a=a.slice();for(let i=a.length-1;i>0;i--){const j=rand(i+1);[a[i],a[j]]=[a[j],a[i]];}return a;};
return {LETTERS,LI,PC,ACC,ACCW,P,dia,midi,fromDia,eq,eqName,enh,name,spn,parse,withOct,up8,
  interval,transposeUp,transposeDown,invertIv,ivWord,ivShort,parseIv,qualityOf,isPerfClass,
  MAJ_SIG,SHARP_ORDER,FLAT_ORDER,majorKeys,sigOf,sigAccidentals,sigWord,sigList,majorFromSig,relMinor,relMajor,DEG_NAMES,
  SCALES,scale,scaleName,bluesAlt,CHORDS,chord,chordSym,chordSymAlt,chordName,slashSym,INV_NAMES,
  MAJ_RN,MIN_RN,MAJ_RN7,MIN_RN7,diatonicChord,INV_LETTER,CADENCES,INSTR,toWritten,toConcert,rand,pick,shuffle};
})();
if(typeof module!=='undefined')module.exports=T;
