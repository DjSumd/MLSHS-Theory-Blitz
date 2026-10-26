// gen.js — question generators for ATAR Music Theory Blitz (SCSA ATAR Music Year 11 + Year 12 content).
// Every generator returns a question object:
//   choice: {t:'choice', prompt, sub, show:{spec}|{svg}, opts:[{v, svg?}], answer:v, why}
//   notate: {t:'notate', prompt, sub, clef, sig, time, items:[engrave items; slots carry target/alt/anyOctave/chord], keysigEdit, sigTarget, why}
//   match:  {t:'match', prompt, pairs:[[a,b]...], why}
const GEN=(()=>{
const {P,parse,name,spn,dia,midi,rand,pick,shuffle}=T;
const up8=T.up8;
// ---------------- settings ----------------
// Years 7–10 follow the WA Music curriculum map; Year 11 = SCSA ATAR Units 1–2; Year 12 = Units 3–4 (everything).
// Every option carries the year it first appears (third element); Settings shows a badge when it is later than the chosen year.
// 'upTo' gates whole question types and the sub-items inside fact questions; the chips gate the material they draw on.
const DEFAULTS={
  '7': {upTo:7, clefs:['treble'],keysMax:1,dbl:false,scales:['major','majpent'],ivNums:[2,5,8],ivQ:['M','m','P'],ivMax:8,ivBelow:false,
        chords:['maj'],invs:[0],figures:false,progs:['I','IV','V'],instruments:[],metres:['2/4','3/4','4/4','6/8'],rhythm:['basic'],minorKeys:false,cadences:[],ext:false,slotBars:2},
  '8': {upTo:8, clefs:['treble','bass'],keysMax:2,dbl:false,scales:['major','majpent','natminor','minpent'],ivNums:[2,3,4,5,8],ivQ:['M','m','P'],ivMax:8,ivBelow:false,
        chords:['maj','min'],invs:[0],figures:false,progs:['I','IV','V'],instruments:[],metres:['2/4','3/4','4/4','6/8'],rhythm:['basic','semis','dotted','ties'],minorKeys:false,cadences:[],ext:false,slotBars:2},
  '9': {upTo:9, clefs:['treble','bass'],keysMax:3,dbl:false,scales:['major','majpent','natminor','minpent','harmminor','blues'],ivNums:[2,3,4,5,6,7,8],ivQ:['M','m','P'],ivMax:8,ivBelow:true,
        chords:['maj','min','dom7'],invs:[0],figures:false,progs:['I','IV','V','vi','V7'],instruments:[],metres:['2/4','3/4','4/4','6/8','12/8'],rhythm:['basic','semis','dotted','ties','syncop','triplet','qrest'],minorKeys:true,cadences:['perfect','plagal'],ext:false,slotBars:2},
  '10':{upTo:10,clefs:['treble','bass'],keysMax:4,dbl:false,scales:['major','majpent','natminor','minpent','harmminor','blues','melminor','chromatic'],ivNums:[2,3,4,5,6,7,8],ivQ:['M','m','P'],ivMax:8,ivBelow:true,
        chords:['maj','min','dom7'],invs:[0,1,2],figures:true,progs:['I','ii','IV','V','vi','V7'],instruments:[],metres:['2/4','3/4','4/4','6/8','9/8','12/8','5/4','7/8'],rhythm:['basic','semis','dotted','ties','syncop','triplet','qrest','duplet'],minorKeys:true,cadences:['perfect','plagal','imperfect'],ext:false,slotBars:2},
  '11':{upTo:11,clefs:['treble','bass'],keysMax:5,dbl:false,scales:['major','natminor','harmminor','majpent','minpent','blues','mixolydian'],ivNums:[2,3,4,5,6,7,8],
        ivQ:['M','m','P'],ivMax:8,ivBelow:true,chords:['maj','min','dom7','min7','maj7','sus4'],invs:[0,1,2],figures:false,progs:['I','ii','iii','IV','V','vi','V7'],
        instruments:['bbtpt','bbcl','tsax'],metres:['2/4','3/4','4/4','6/8','9/8','12/8'],rhythm:['basic','semis','dotted','ties','syncop','triplet','qrest','duplet'],minorKeys:true,cadences:['perfect','plagal','imperfect'],ext:false,slotBars:2},
  '12':{upTo:12,clefs:['treble','bass','alto','tenor'],keysMax:7,dbl:true,scales:['major','natminor','harmminor','melminor','majpent','minpent','blues','chromatic','dorian','mixolydian'],ivNums:[2,3,4,5,6,7,8],
        ivQ:['M','m','P','A','d'],ivMax:13,ivBelow:true,chords:['maj','min','dim','aug','dom7','min7','maj7','m7b5','dim7','dom9','maj9','min9','sus4','sus2','maj6','min6'],invs:[0,1,2,3],figures:true,progs:['I','ii','iii','IV','V','vi','V7'],
        instruments:['bbtpt','bbcl','ssax','tsax','asax','bsax','fhn','acl'],metres:['2/4','3/4','4/4','6/8','9/8','12/8','5/4','7/8'],rhythm:['basic','semis','dotted','ties','syncop','triplet','qrest','duplet'],minorKeys:true,cadences:['perfect','plagal','imperfect','interrupted'],ext:false,slotBars:2},
};
const SCHEMA=[
  {key:'upTo',label:'Question types up to',type:'select',opts:[[7,'Year 7'],[8,'Year 8'],[9,'Year 9'],[10,'Year 10'],[11,'Year 11 (ATAR)'],[12,'Year 12 (ATAR)']]},
  {key:'clefs',label:'Clefs',type:'multi',opts:[['treble','Treble',7],['bass','Bass',8],['alto','Alto',12],['tenor','Tenor',12]]},
  {key:'keysMax',label:'Key signatures up to',type:'select',opts:[[1,'1♯ / 1♭ (Year 7)'],[2,'2♯ / 2♭ (Year 8)'],[3,'3♯ / 3♭ (Year 9)'],[4,'4♯ / 4♭ (Year 10)'],[5,'5♯ / 5♭ (Year 11)'],[6,'6♯ / 6♭'],[7,'7♯ / 7♭ (Year 12)']]},
  {key:'dbl',label:'Double sharps & flats',type:'toggle',yr:12},
  {key:'scales',label:'Scales & modes',type:'multi',opts:[['major','Major (Ionian)',7],['majpent','Major pentatonic',7],['natminor','Natural minor (Aeolian)',8],['minpent','Minor pentatonic',8],['harmminor','Harmonic minor',9],['blues','Blues',9],['melminor','Melodic minor',10],['chromatic','Chromatic',10],['mixolydian','Mixolydian',11],['dorian','Dorian',12],['phrygian','Phrygian','ext'],['lydian','Lydian','ext'],['locrian','Locrian','ext']]},
  {key:'ivNums',label:'Interval sizes',type:'multi',opts:[[2,'2nds (tone / semitone)',7],[3,'3rds',8],[4,'4ths',8],[5,'5ths',7],[6,'6ths',9],[7,'7ths',9],[8,'Octaves',7]]},
  {key:'ivQ',label:'Interval qualities',type:'multi',opts:[['M','Major',7],['m','Minor',7],['P','Perfect',7],['A','Augmented',12],['d','Diminished',12]]},
  {key:'ivBelow',label:'Intervals below a note (descending)',type:'toggle',yr:9},
  {key:'ivMax',label:'Compound intervals',type:'select',opts:[[8,'None (up to an octave)'],[9,'Up to a 9th'],[10,'Up to a 10th'],[13,'Up to a 13th (Year 12)']]},
  {key:'chords',label:'Chord types',type:'multi',opts:[['maj','Major',7],['min','Minor',8],['dom7','Dominant 7th',9],['min7','Minor 7th',11],['maj7','Major 7th',11],['sus4','sus4',11],['dim','Diminished',12],['aug','Augmented',12],['m7b5','m7♭5 / ø7',12],['dim7','Diminished 7th',12],['dom9','Dominant 9th',12],['maj9','Major 9th',12],['min9','Minor 9th',12],['sus2','sus2',12],['maj6','6th',12],['min6','Minor 6th',12]]},
  {key:'invs',label:'Inversions',type:'multi',opts:[[0,'Root position',7],[1,'1st inversion',10],[2,'2nd inversion',10],[3,'3rd inversion (7ths)',12]]},
  {key:'figures',label:'Inversion letters (Ib, Vc) in harmony questions',type:'toggle',yr:10},
  {key:'progs',label:'Chords in progressions',type:'multi',opts:[['I','I (i)',8],['IV','IV (iv)',8],['V','V',8],['vi','vi (VI)',9],['V7','V7',9],['ii','ii (ii°)',10],['iii','iii (III)',11]]},
  {key:'minorKeys',label:'Include minor keys',type:'toggle',yr:9},
  {key:'cadences',label:'Cadences',type:'multi',opts:[['perfect','Perfect (V–I)',9],['plagal','Plagal (IV–I)',9],['imperfect','Imperfect (…–V)',10],['interrupted','Interrupted (V–vi)',12]]},
  {key:'instruments',label:'Transposing instruments',type:'multi',opts:T.INSTR.map(i=>[i.id,i.name,['bbtpt','bbcl','tsax'].includes(i.id)?11:12])},
  {key:'metres',label:'Time signatures',type:'multi',opts:[['2/4','2/4',7],['3/4','3/4',7],['4/4','4/4',7],['6/8','6/8',7],['12/8','12/8',9],['9/8','9/8',10],['5/4','5/4 (irregular)',10],['7/8','7/8 (irregular)',10]]},
  {key:'rhythm',label:'Rhythm vocabulary',type:'multi',opts:[['basic','Whole-beat values, quaver pairs, four semiquavers',7],['semis','Quaver + semiquaver mixes',8],['dotted','Dotted crotchet / dotted quaver',8],['ties','Ties & anacrusis',8],['syncop','Syncopation',8],['qrest','Quaver rests',9],['triplet','Triplets',9],['duplet','Duplets & irregular groupings',10]]},
  {key:'ext',label:'Extension: Phrygian, Lydian, Locrian, extra ornaments',type:'toggle',yr:'ext'},
];
let SET=JSON.parse(JSON.stringify(DEFAULTS['7']));SET.level='7';
const setLevel=l=>{SET=JSON.parse(JSON.stringify(DEFAULTS[l]));SET.level=l;return SET;};
const getSet=()=>SET, applySet=o=>{Object.assign(SET,o);return SET;};
const S=k=>SET[k];
const UPTO=()=>+(S('upTo')||S('level'));
const clefPick=()=>pick(S('clefs').length?S('clefs'):['treble']);
const Y12=()=>S('level')==='12';
// year-tag a sub-question inside a fact list: Y(9, ()=>choice(...)) — pickY draws only from those at or below the chosen year
const Y=(yr,fn)=>{fn.yr=yr;return fn;};
function pickY(qs){const ok=qs.filter(f=>(f.yr||7)<=UPTO());let q=null,g=0;while(!q&&g++<30)q=pick(ok.length?ok:qs)();return q;}
// ---------------- helpers ----------------
const an=s=>(/^[aeiouAEIOU]/.test(s)?'an ':'a ')+s;
const uniq=a=>{const s=new Set(),o=[];a.forEach(x=>{const k=typeof x==='object'?x.v:x;if(!s.has(k)){s.add(k);o.push(x);}});return o;};
const choice=(prompt,opts,answer,extra)=>Object.assign({t:'choice',prompt,opts:uniq(opts).map(o=>typeof o==='object'?o:{v:o}),answer},extra||{});
function optsFrom(answer,pool,n){ // answer + distinct distractors from pool
  const d=shuffle(pool.filter(x=>x!==answer));return shuffle([answer].concat(d.slice(0,n-1)));}
const n=(ps,dur,extra)=>Object.assign({k:'n',p:ps,dur:dur||'w'},extra||{});
const r=(dur,extra)=>Object.assign({k:'r',dur},extra||{});
const bar=()=>({k:'bar'}),fin=()=>({k:'bar',final:true});
// comfortable octave for a clef: place a pitch so it sits mostly within the stave
const RANGE={treble:[dia(P('A',0,3)),dia(P('C',0,6))],bass:[dia(P('C',0,2)),dia(P('E',0,4))],alto:[dia(P('B',0,2)),dia(P('D',0,5))],tenor:[dia(P('G',0,2)),dia(P('B',0,4))]};
const MIDD={treble:dia(P('B',0,4)),bass:dia(P('D',0,3)),alto:dia(P('C',0,4)),tenor:dia(P('A',0,3))};
function inClef(p,clef,lowBias){ // move pitch by octaves into the clef's comfortable range
  const [lo,hi]=RANGE[clef];let q=P(p.l,p.a,p.o);const mid=MIDD[clef]+(lowBias||0);
  while(dia(q)>hi||dia(q)-mid>6)q=up8(q,-1);while(dia(q)<lo||mid-dia(q)>6)q=up8(q);return q;}
function fitScale(notes,clef,desc){ // shift a whole scale/chord so it sits in the clef range
  let best=null,bestScore=1e9;for(let o=-3;o<=3;o++){const sh=notes.map(p=>up8(p,o));const ds=sh.map(dia);const lo=Math.min(...ds),hi=Math.max(...ds);const [rl,rh]=RANGE[clef];
    const over=Math.max(0,rl-lo)+Math.max(0,hi-rh);const centre=Math.abs((lo+hi)/2-MIDD[clef]);const sc=over*10+centre;if(sc<bestScore){bestScore=sc;best=sh;}}return best;}
const keyTonics=max=>T.majorKeys(max);
function randKey(){const t=pick(keyTonics(S('keysMax')));const minor=S('minorKeys')&&Math.random()<0.4;
  return minor?{tonic:T.relMinor(t),mode:'minor',sig:T.sigOf(t,'major')}:{tonic:t,mode:'major',sig:T.sigOf(t,'major')};}
const keyName=k=>name(k.tonic)+' '+k.mode;
const METRE=s=>{const [a,b]=s.split('/').map(Number);return [a,b];};
const metreWord=s=>({'2/4':'simple duple','3/4':'simple triple','4/4':'simple quadruple','6/8':'compound duple','9/8':'compound triple','12/8':'compound quadruple','5/4':'irregular (5 beats)','7/8':'irregular (7 quavers)','2/2':'simple duple','3/8':'simple triple'}[s]);
// rhythm patterns: each is a list of [dur,dots,isRest]. Written per time signature, each exactly one bar.
const RP={
 '2/4':[[['q'],['q']],[['s'],['s'],['s'],['s'],['q']],[['e'],['e'],['q']],[['q'],['e'],['e']],[['h']],[['q','d'],['e']],[['e'],['e'],['e'],['e']],[['s'],['s'],['e'],['q']],[['q'],['r_q']],[['e'],['r_e'],['q']]],
 '3/4':[[['q'],['q'],['q']],[['h'],['q']],[['q'],['h']],[['q','d'],['e'],['q']],[['e'],['e'],['q'],['q']],[['h','d']],[['q'],['e'],['e'],['e'],['e']],[['q'],['r_q'],['q']],[['e'],['e'],['e'],['e'],['e'],['e']]],
 '4/4':[[['q'],['q'],['q'],['q']],[['q'],['s'],['s'],['s'],['s'],['h']],[['h'],['q'],['q']],[['q'],['q'],['h']],[['q','d'],['e'],['q'],['q']],[['h','d'],['q']],[['e'],['e'],['q'],['h']],[['q'],['e'],['e'],['q'],['q']],[['w']],[['h'],['h']],[['q'],['r_q'],['q'],['q']],[['e'],['e'],['e'],['e'],['q'],['q']],[['s'],['s'],['e'],['q'],['h']],[['q'],['q'],['r_h']]],
 '6/8':[[['q','d'],['q','d']],[['e'],['e'],['e'],['q','d']],[['q'],['e'],['q'],['e']],[['e'],['e'],['e'],['e'],['e'],['e']],[['q','d'],['e'],['e'],['e']],[['h','d']],[['q','d'],['r_q','d']],[['q'],['e'],['e'],['e'],['e']],[['e'],['q'],['q','d']]],
 '9/8':[[['q','d'],['q','d'],['q','d']],[['e'],['e'],['e'],['q','d'],['q','d']],[['q','d'],['e'],['e'],['e'],['q'],['e']],[['e'],['e'],['e'],['e'],['e'],['e'],['q','d']]],
 '12/8':[[['q','d'],['q','d'],['q','d'],['q','d']],[['e'],['e'],['e'],['q','d'],['q','d'],['q','d']],[['q','d'],['q'],['e'],['q','d'],['q','d']],[['h','d'],['q','d'],['q','d']]],
 '5/4':[[['q'],['q'],['q'],['q'],['q']],[['h'],['h'],['q']],[['q'],['q'],['h'],['q']],[['h'],['q'],['q'],['q']]],
 '7/8':[[['e'],['e'],['e'],['e'],['q','d']],[['q'],['q'],['q','d']],[['q','d'],['q'],['q']],[['e'],['e'],['q'],['q','d']]],
};
// which vocabulary chip a one-bar pattern needs (the Year 7 set is 'basic')
function patVocab(pat,ts){const [a,b]=METRE(ts);const compound=b===8&&a%3===0;const need=new Set();
  const durs=pat.map(x=>x[0].replace('r_',''));let run=0,maxRun=0;durs.forEach(d=>{if(d==='s'){run++;maxRun=Math.max(maxRun,run);}else run=0;});
  const nS=durs.filter(d=>d==='s').length;if(nS&&!(nS===4&&maxRun===4))need.add('semis');
  pat.forEach(x=>{if(x[1]==='d'&&(x[0]==='q'||x[0]==='e')&&!compound)need.add('dotted');if(x[0]==='r_e')need.add('qrest');});
  for(let i=0;i+2<durs.length;i++)if(!compound&&durs[i]==='e'&&durs[i+1]==='q'&&durs[i+2]==='e'&&!pat[i+1][1])need.add('syncop');
  if(compound)for(let i=0;i+1<durs.length;i++)if(durs[i]==='e'&&durs[i+1]==='q'&&!pat[i+1][1]&&!pat[i][0].startsWith('r_'))need.add('syncop');
  return [...need];}
function patsFor(ts){const on=S('rhythm')||['basic'];const all=RP[ts]||RP['4/4'];const ok=all.filter(p=>patVocab(p,ts).every(v=>on.includes(v)));return ok.length?ok:all;}
function rhythmItems(ts,nBars,pool){const [a,b]=METRE(ts);const out=[];const pats=pool||patsFor(ts);
  for(let i=0;i<nBars;i++){const pat=pick(pats);pat.forEach(x=>{if(x[0].startsWith('r_'))out.push(r(x[0].slice(2),{dots:x[1]==='d'?1:0}));else out.push(n([],x[0],{dots:x[1]==='d'?1:0}));});out.push(i===nBars-1?fin():bar());}
  return out;}
function pitchItems(items,key,clef,opts){ // fill pitch for note items from the key's scale, stepwise-ish, ending on tonic
  opts=opts||{};const sc=T.scale(key.tonic,key.mode==='minor'?'natminor':'major').slice(0,7);
  const pool=[];for(let o=-3;o<=3;o++)sc.forEach(p=>pool.push(up8(p,o)));
  const [lo0,hi0]=RANGE[clef];const lo=opts.lo!==undefined?opts.lo:lo0,hi=opts.hi!==undefined?opts.hi:hi0;const mid=MIDD[clef];let ok=pool.filter(p=>dia(p)>=mid-4&&dia(p)<=mid+5&&dia(p)>=lo&&dia(p)<=hi);if(ok.length<4)ok=pool.filter(p=>dia(p)>=lo&&dia(p)<=hi);if(ok.length<2)ok=pool.filter(p=>dia(p)>=lo0&&dia(p)<=hi0);
  const tonics=ok.filter(p=>p.l===key.tonic.l);let cur=pick(tonics.length?tonics:ok);
  const notes=items.filter(it=>it.k==='n');
  notes.forEach((it,i)=>{if(i===notes.length-1&&tonics.length){const near=tonics.slice().sort((x,y)=>Math.abs(dia(x)-dia(cur))-Math.abs(dia(y)-dia(cur)))[0];cur=near;}
    else if(i>0){const idx=ok.findIndex(p=>dia(p)===dia(cur));const step=pick([-2,-1,-1,1,1,2,-3,3]);let j=idx+step;if(j<0)j=idx+Math.abs(step);if(j>=ok.length)j=idx-Math.abs(step);j=Math.max(0,Math.min(ok.length-1,j));cur=ok[j];}
    it.p=[P(cur.l,cur.a,cur.o)];});
  if(opts.raise7&&key.mode==='minor'){ /* harmonic-minor leading note on some 7ths */
    const lt=T.transposeUp(key.tonic,'M7');notes.forEach(it=>{if(it.p[0].l===lt.l&&Math.random()<0.7)it.p[0]=P(lt.l,lt.a,it.p[0].o);});}
  return items;}
function melody(key,clef,ts,nBars,opts){const items=rhythmItems(ts,nBars);pitchItems(items,key,clef,opts||{});E.autoBeam(items,METRE(ts));return items;}
const stave=(clef,sig,time,items,extra)=>Object.assign({clef,sig:sig||0,time:time||null,items},extra||{});
const show=(spec)=>({spec});
const clefWord=c=>c+' clef';
// slot helper
function slot(i,target,dur,extra){return Object.assign({k:'slot',slot:i,dur:dur||'w',p:[],target:target,explicit:true},extra||{});}
// ======================================================================
// UNIT 1 — PITCH & NOTATION
// ======================================================================
function noteNameQ(){const clef=clefPick();const letter=pick(T.LETTERS);const acc=S('dbl')?pick([0,0,1,-1,1,-1,2,-2]):pick([0,0,1,-1]);
  let p=inClef(P(letter,acc,4),clef);const ds=dia(p);const [lo,hi]=RANGE[clef];
  // sometimes push to ledger lines
  if(Math.random()<0.3)p=up8(p,Math.random()<0.5?1:-1);if(dia(p)<lo||dia(p)>hi)p=inClef(p,clef);
  const ans=name(p);const pool=[];T.LETTERS.forEach(l=>[-1,0,1].forEach(a=>pool.push(name(P(l,a,4)))));
  if(S('dbl'))T.LETTERS.forEach(l=>pool.push(name(P(l,2,4)),name(P(l,-2,4))));
  const enhs=pool.filter(x=>{try{return midi(parse(x.replace('♯','#').replace('♭','b').replace('𝄪','x').replace('𝄫','bb')+'4'))%12===midi(p)%12&&x!==ans;}catch(e){return false;}});
  const opts=uniq([ans].concat(shuffle(enhs).slice(0,1),shuffle(pool.filter(x=>x!==ans&&x[0]!==ans[0])).slice(0,3))).slice(0,4);
  return choice('Name this note.',shuffle(opts),ans,{sub:clefWord(clef)+'.',show:show(stave(clef,0,null,[n([p],'w',{showAcc:true})])),
    why:'In the '+clef+' clef this line/space is '+p.l+(p.a?', and the accidental makes it '+ans:'')+'.'});}
function spnQ(){const clef=pick(['treble','bass']);const letter=pick(T.LETTERS);let p=inClef(P(letter,0,4),clef);if(Math.random()<0.4)p=up8(p,Math.random()<0.5?1:-1);
  const [lo,hi]=RANGE[clef];if(dia(p)<lo||dia(p)>hi)p=inClef(p,clef);
  const ans=spn(p);const opts=shuffle([ans,spn(up8(p)),spn(up8(p,-1)),spn(up8(P(p.l,0,p.o),Math.random()<0.5?2:-2))]);
  return choice('Which is this note in scientific pitch notation?',opts,ans,{sub:'Middle C = C4. Each octave is numbered from C upward.',show:show(stave(clef,0,null,[n([p],'w')])),why:'Middle C is C4; count octaves from there.'});}
function notateNoteQ(){const clef=clefPick();const letter=pick(T.LETTERS);const acc=S('dbl')?pick([0,1,-1,2,-2]):pick([0,0,1,-1]);
  const p=inClef(P(letter,acc,4),clef);const exact=Math.random()<0.6;
  const tgt=p;
  return {t:'notate',prompt:'Notate '+(exact?spn(tgt):name(tgt))+'.',sub:clefWord(clef)+(exact?'. Exact octave (SPN).':'. Any octave counts.'),clef,sig:0,items:[slot(0,[tgt],'w',{anyOctave:!exact})],why:exact?'Count octaves from middle C (C4).':''};}
function notateSeqQ(){const clef=clefPick();const ps=[];for(let i=0;i<4;i++){const l=pick(T.LETTERS);const a=pick([0,0,0,1,-1]);ps.push(inClef(P(l,a,4),clef));}
  return {t:'notate',prompt:'Notate: '+ps.map(name).join(', '),sub:clefWord(clef)+'. Any octave of each counts.',clef,sig:0,items:ps.map((p,i)=>slot(i,[p],'w',{anyOctave:true}))};}
function enharmonicQ(){const pairs=[['C♯','D♭'],['D♯','E♭'],['F♯','G♭'],['G♯','A♭'],['A♯','B♭'],['E♯','F'],['B♯','C'],['F♭','E'],['C♭','B']];
  const dbl=[['F𝄪','G'],['C𝄪','D'],['G𝄪','A'],['B𝄫','A'],['E𝄫','D'],['A𝄫','G'],['D𝄫','C']];
  const pr=pick(S('dbl')?pairs.concat(dbl):pairs);const [a,b]=Math.random()<0.5?pr:[pr[1],pr[0]];
  const pool=['C','C♯','D♭','D','D♯','E♭','E','F','F♯','G♭','G','G♯','A♭','A','A♯','B♭','B','E♯','B♯','C♭','F♭'];
  return choice('The enharmonic equivalent of '+a+' is…',optsFrom(b,pool,4),b,{why:'Enharmonic notes sound the same but are spelled differently: '+a+' = '+b+'.'});}
function accidentalQ(){const qs=[
  Y(12,()=>choice('A double sharp (𝄪) raises a pitch by…',['one semitone','two semitones','a tone and a half','an octave'],'two semitones')),
  Y(12,()=>choice('A double flat (𝄫) lowers a pitch by…',['one semitone','two semitones','three semitones','an octave'],'two semitones')),
  Y(9,()=>choice('An accidental in a bar applies…',['to the next note only','until the end of the bar (same note, same octave)','until the end of the line','until the next key signature'],'until the end of the bar (same note, same octave)')),
  ()=>choice('A natural (♮) sign…',['raises the note a semitone','cancels a sharp or flat','lowers the note a tone','marks a rest'],'cancels a sharp or flat'),
  ()=>{const a=pick([['C','D♭'],['E','F'],['B','C'],['F','G♭'],['A','B♭'],['G♯','A']]);return choice('Is '+a[0]+' up to '+a[1]+' a tone or a semitone?',['tone','semitone'],'semitone');},
  ()=>{const a=pick([['C','D'],['F','G'],['B♭','C'],['E','F♯'],['D♭','E♭'],['A','B']]);return choice('Is '+a[0]+' up to '+a[1]+' a tone or a semitone?',['tone','semitone'],'tone');},
  ()=>choice('How many semitones are there in an octave?',['7','10','12','13'],'12'),
  Y(8,()=>choice('Middle C in scientific pitch notation is…',['C3','C4','C5','C6'],'C4')),
  ()=>choice('The note one ledger line below the treble stave is…',['A3','B3','C4','D4'],'C4',{why:'Middle C sits on one ledger line below the treble stave and one above the bass stave.'}),
  Y(8,()=>choice('The note one ledger line above the bass stave is…',['A3','B3','C4','D4'],'C4')),
  Y(12,()=>choice('The alto clef places middle C on the…',['top line','middle (3rd) line','4th line','bottom space'],'middle (3rd) line')),
  Y(12,()=>choice('The tenor clef places middle C on the…',['2nd line','3rd line','4th line','top space'],'4th line')),
  Y(8,()=>choice('A tie joins two notes of…',['different pitch, played smoothly','the same pitch, adding their values together','the same pitch, each struck again','different pitch, played staccato'],'the same pitch, adding their values together')),
  Y(8,()=>choice('A slur over notes of different pitch means…',['play them legato (smoothly joined)','hold the first note only','play them staccato','add their values'],'play them legato (smoothly joined)')),
 ];return pickY(qs);}
// guitar TAB: strings 6..1 = E2 A2 D3 G3 B3 E4
const OPEN=['E4','B3','G3','D3','A2','E2']; // index 0 = string 1 (high e)
function tabPitch(str,fret){const o=parse(OPEN[str-1]);const m=midi(o)+fret;const oct=Math.floor(m/12)-1,pc=((m%12)+12)%12;
  const sh=[['C',0],['C',1],['D',0],['D',1],['E',0],['F',0],['F',1],['G',0],['G',1],['A',0],['A',1],['B',0]][pc];return P(sh[0],sh[1],oct);}
function tabQ(){if(Math.random()<0.5){const str=rand(6)+1,fret=rand(6);const p=tabPitch(str,fret);const ans=name(p);
    const alt=p.a===1?name(P(T.LETTERS[(T.LI[p.l]+1)%7],-1,p.o)):null;
    const pool=['C','D','E','F','G','A','B','C♯','D♭','F♯','G♭','G♯','A♭','B♭','E♭'];
    return choice('Which note does this TAB show?',optsFrom(ans,pool.concat(alt?[alt]:[]),4),ans,{sub:'Standard tuning E A D G B E (low to high); the top TAB line is the high E string. The number is the fret.',show:{svg:E.tab([{str,fret}]).svg},why:'String '+str+' open is '+OPEN[str-1].replace(/\d/,'')+'; fret '+fret+' is '+fret+' semitone'+(fret===1?'':'s')+' higher = '+ans+'.'});}
  const chords=[{nm:'C',fr:['x',3,2,0,1,0]},{nm:'G',fr:[3,2,0,0,0,3]},{nm:'D',fr:['x','x',0,2,3,2]},{nm:'A',fr:['x',0,2,2,2,0]},{nm:'E',fr:[0,2,2,1,0,0]},{nm:'Am',fr:['x',0,2,2,1,0]},{nm:'Em',fr:[0,2,2,0,0,0]},{nm:'Dm',fr:['x','x',0,2,3,1]},{nm:'F',fr:[1,3,3,2,1,1]},{nm:'E7',fr:[0,2,0,1,0,0]},{nm:'A7',fr:['x',0,2,0,2,0]},{nm:'D7',fr:['x','x',0,2,1,2]}];
  const c=pick(chords);const notes=c.fr.map((f,i)=>f==='x'?null:{str:6-i,fret:f}).filter(Boolean);
  return choice('This TAB shows which guitar chord?',optsFrom(c.nm,chords.map(x=>x.nm),4),c.nm,{sub:'All strings sounded together (strummed).',show:{svg:E.tab([notes]).svg},why:'Work out each string\'s note from its open pitch plus the fret number, then name the chord.'});}
function drumQ(){const hh=()=>Object.assign(P('G',0,5),{x:1}),sn=()=>P('C',0,5),kk=()=>P('F',0,4);
  const pat=[n([hh(),kk()],'e'),n([hh()],'e'),n([hh(),sn()],'e'),n([hh()],'e'),n([hh(),kk()],'e'),n([hh(),kk()],'e'),n([hh(),sn()],'e'),n([hh()],'e'),fin()];
  pat.forEach(it=>{if(it.k==='n')it.stem='up';});E.autoBeam(pat,[4,4]);
  const qs=[()=>choice('In this drum-kit notation, the × noteheads on the top space are the…',['hi-hat (or ride cymbal)','snare drum','bass (kick) drum','tom-tom'],'hi-hat (or ride cymbal)',{why:'Cymbals use × noteheads. Snare is on the 3rd space, kick on the 1st space.'}),
   ()=>choice('In this drum-kit notation, the notes in the 1st (lowest) space are the…',['hi-hat','snare drum','bass (kick) drum','crash cymbal'],'bass (kick) drum'),
   ()=>choice('On which beats does the snare drum play in this bar?',['1 and 3','2 and 4','every beat','1 and 2'],'2 and 4',{why:'The snare (3rd space) falls on beats 2 and 4: the backbeat.'}),
   ()=>choice('The clef used for drum-kit notation is the…',['treble clef','bass clef','percussion (neutral) clef','alto clef'],'percussion (neutral) clef')];
  return Object.assign(pick(qs)(),{show:show(stave('perc',0,[4,4],pat)),legend:drumLegend()});}
function chordSymBasicQ(){const qs=[
  ()=>choice('A chord symbol written as just a capital letter (e.g. F) means a…',['major triad','minor triad','dominant 7th','single note'],'major triad'),
  ()=>choice('C/E means…',['a C major chord with E in the bass','C then E played in turn','a C chord sharpened to E','an E minor chord'],'a C major chord with E in the bass'),
  ()=>choice('Gm7 means…',['G major 7th','G minor 7th','G dominant 7th','G minor with a 7th in the bass'],'G minor 7th'),
  ()=>choice('In a lead sheet, D7 is a…',['D major 7th','D dominant 7th (D F♯ A C)','D minor 7th','D diminished 7th'],'D dominant 7th (D F♯ A C)')];return pickY(qs);}
// ======================================================================
// UNIT 2 — RHYTHM & METRE
// ======================================================================
const DURW={w:'semibreve',h:'minim',q:'crotchet',e:'quaver',s:'semiquaver'};
const metresOn=()=>S('metres').length?S('metres'):['4/4'];
function timeSigQ(){const ts=pick(metresOn());const items=rhythmItems(ts,2);const key={tonic:parse('C4'),mode:'major'};pitchItems(items,key,'treble');E.autoBeam(items,METRE(ts),ts==='7/8'?[2,2,3]:null);
  const pool=['2/4','3/4','4/4','6/8','9/8','12/8','5/4','7/8','3/8','2/2'];const opts=optsFrom(ts,pool,4);
  return choice('Which time signature fits these bars?',opts,ts,{sub:'Add up the values in each bar; check how the quavers are grouped.',show:show(stave('treble',0,null,items)),why:ts+': '+metreWord(ts)+'. Each bar holds '+ts.split('/')[0]+' '+(METRE(ts)[1]===8?'quavers':'crotchets')+(METRE(ts)[1]===8&&METRE(ts)[0]%3===0?', grouped in threes (compound)':'')+'.'});}
function completeBarQ(){const ts=pick(metresOn());const [a,b]=METRE(ts);const total=E.barLength([a,b]);
  const cand=[['q',0],['h',0],['e',0],['q',1],['h',1],['s',0],['e',1],['w',0]].filter(([d,dt])=>E.durVal(d,dt)<total);
  const asRest=Math.random()<0.35;const cand2=asRest&&b!==8?cand.filter(c=>!c[1]):cand;
  const miss=pick(cand2);const missV=E.durVal(miss[0],miss[1]);
  // build the rest of the bar from a pattern that leaves exactly missV at the end
  let items=null;for(let tries=0;tries<60&&!items;tries++){const pat=pick(patsFor(ts));let acc=0;const its=[];for(const x of pat){const isR=x[0].startsWith('r_'),d=isR?x[0].slice(2):x[0],dt=x[1]==='d'?1:0;const v=E.durVal(d,dt);
      if(acc+v>total-missV+1e-9)break;its.push(isR?r(d,{dots:dt}):n([],d,{dots:dt}));acc+=v;}
    if(Math.abs(acc-(total-missV))<1e-9&&its.length)items=its;}
  if(!items){items=[];let acc=0;while(acc<total-missV-1e-9){const v=total-missV-acc;const d=v>=12?'q':v>=6?'e':'s';items.push(n([],d));acc+=E.durVal(d,0);}}
  pitchItems(items,{tonic:parse('G4'),mode:'major'},'treble');
  const gapItem={k:'gap',w:2.8,q:true};items.push(gapItem,fin());E.autoBeam(items,[a,b]);
  const mk=(d,dt)=>{const sp=asRest?stave('none',0,null,[r(d,{dots:dt})]):stave('none',0,null,[n([parse('B4')],d,{dots:dt})]);const rr=E.render(sp,{tight:true});return {v:(dt?'dotted ':'')+DURW[d]+(asRest?' rest':''),svg:rr.svg};};
  const ans=(miss[1]?'dotted ':'')+DURW[miss[0]]+(asRest?' rest':'');
  const dis=shuffle(cand2.filter(c=>!(c[0]===miss[0]&&c[1]===miss[1]))).slice(0,3).map(c=>mk(c[0],c[1]));
  const opts=shuffle([mk(miss[0],miss[1])].concat(dis));
  const spec=stave('treble',0,[a,b],items);spec.marker=true;
  return choice('Which single '+(asRest?'rest':'note')+' completes the bar?',opts,ans,{sub:'The bar is in '+ts+'. Choose the one value that fills the gap at the end.',show:show(spec),why:'The bar needs '+ts.split('/')[0]+' '+(b===8?'quavers':'crotchets')+' in total; the gap is worth a '+ans+'.'});}
function groupingQ(){const ts=pick(metresOn().filter(m=>['2/4','3/4','4/4','6/8','9/8','5/4','7/8'].includes(m))||['4/4']);const [a,b]=METRE(ts);
  const mk=(groups)=>{const items=[];groups.forEach((gq,gi)=>{for(let i=0;i<gq;i++)items.push(n([parse('B4')],'e',{beam:gq===1?null:(i===0?'start':i===gq-1?'end':'cont')}));});items.push(fin());return items;};
  const total=a*48/b/6;let correct,wrongs;
  if(b===8&&a%3===0){correct=Array(a/3).fill(3);wrongs=[(()=>{const w=[];let t=total;while(t>0){w.push(Math.min(2,t));t-=2;}return w;})(),[total],Array(total).fill(1)];}
  else if(ts==='7/8'){correct=pick([[2,2,3],[3,2,2]]);wrongs=[[7],[2,2,2,1],[4,3],[1,2,2,2]];}
  else if(ts==='5/4'){correct=[2,2,2,2,2];wrongs=[[10],[5,5],[3,3,4],[1,2,2,2,2,1]];}
  else{correct=Array(a).fill(2);wrongs=[[total],[1].concat(Array((total-2)/2).fill(2)).concat([1]),[4].concat(Array((total-4)/2).fill(2))].filter(w=>w.reduce((x,y)=>x+y,0)===total);}
  const render=g=>({v:g.join('+'),svg:E.render(stave('treble',0,[a,b],mk(g)),{tight:true}).svg});
  const opts=shuffle([render(correct)].concat(shuffle(wrongs).slice(0,2).map(render)));
  const sub=ts==='7/8'?'7/8 is grouped in quavers as 2 + 2 + 3 or 3 + 2 + 2: the beams show the groups.':ts==='5/4'?'5/4 is simple time with five crotchet beats: beam quavers in pairs so each beat stays visible.':b===8?'Compound time: beam quavers in threes (one dotted-crotchet beat each).':'Simple time: beam quavers in pairs, one crotchet beat each, so the beats stay visible.';
  return choice('Which bar is correctly grouped (beamed) for '+ts+'?',opts,correct.join('+'),{sub,why:sub});}
function valueQ(){const ts=pick(['4/4','3/4','2/4']);const items=[];let total=0;const picks=[];const k=rand(2)+1;
  const cand=[['h',1,3],['q',1,1.5],['h',0,2],['q',0,1],['e',0,0.5],['w',0,4],['e',1,0.75]];
  for(let i=0;i<=k;i++){const c=pick(cand);picks.push(c);total+=c[2];}
  picks.forEach((c,i)=>items.push(n([parse('G4')],c[0],{dots:c[1],tie:i<picks.length-1})));
  const ans=String(total).replace('.5','½').replace('.75','¾').replace('.25','¼');const pool=[1,1.5,2,2.5,3,3.5,4,4.5,5,6,7,8].map(x=>String(x).replace('.5','½'));
  return choice('These tied notes last how many crotchet beats in total?',optsFrom(ans,pool,4),ans,{sub:'A dot adds half the value again. A tie adds the values together.',show:show(stave('treble',0,null,items)),why:picks.map(c=>(c[1]?'dotted ':'')+DURW[c[0]]+' = '+String(c[2]).replace('.5','½').replace('.75','¾').replace('.25','¼')).join(' + ')+' = '+ans+'.'});}
function restQ(){const d=pick(['h','q'].concat(UPTO()>=8?['w']:[],UPTO()>=9?['e']:[],UPTO()>=11?['s']:[]));const items=[r(d)];const ans=DURW[d]+' rest';
  return choice('Name this rest.',optsFrom(ans,Object.values(DURW).map(x=>x+' rest'),4),ans,{show:show(stave('treble',0,[4,4],[n([parse('B4')],'q'),r(d),{k:'gap',w:3}])),why:d==='w'?'The semibreve rest hangs below the 4th line (it also stands for a whole bar in any metre).':d==='h'?'The minim rest sits on top of the middle line.':''});}
function metreTheoryQ(){const qs=[
  ()=>{const ts=pick(['2/4','3/4','4/4','6/8','9/8','12/8']);return choice(ts+' is best described as…',optsFrom(metreWord(ts),['simple duple','simple triple','simple quadruple','compound duple','compound triple','compound quadruple'],4),metreWord(ts),{why:(METRE(ts)[1]===8?'Compound: the top number divides by 3, each beat is a dotted crotchet.':'Simple: each beat divides into two.')});},
  ()=>choice('In simple time the beat divides into…',['two equal parts','three equal parts','four equal parts'],'two equal parts'),
  ()=>choice('In compound time the beat divides into…',['two equal parts','three equal parts','five equal parts'],'three equal parts'),
  Y(8,()=>choice('The beat in 6/8, 9/8 and 12/8 is a…',['crotchet','dotted crotchet','quaver','dotted minim'],'dotted crotchet')),
  Y(8,()=>{const ts=pick(['6/8','9/8','12/8']);const a=METRE(ts)[0];return choice('How many beats are in a bar of '+ts+'?',optsFrom(String(a/3),['2','3','4','6','9','12'],4),String(a/3),{why:'Compound time: divide the top number by 3.'});}),
  Y(9,()=>choice('A triplet plays…',['2 notes in the time of 3','3 notes in the time of 2','3 notes in the time of 4','4 notes in the time of 3'],'3 notes in the time of 2')),
  Y(10,()=>choice('A duplet (in compound time) plays…',['2 notes in the time of 3','3 notes in the time of 2','2 notes in the time of 4'],'2 notes in the time of 3')),
  Y(8,()=>choice('Placing an accent on a weak beat or off the beat is called…',['syncopation','augmentation','anacrusis','hemiola'],'syncopation')),
  Y(8,()=>choice('An anacrusis (pick-up) is…',['one or more notes before the first full bar','a held final note','a triplet figure','a bar of rest'],'one or more notes before the first full bar')),
  Y(9,()=>choice('Swing quavers are played…',['perfectly evenly','long–short, like a triplet feel','short–long','as semiquavers'],'long–short, like a triplet feel')),
  ()=>choice('An ostinato (riff) is…',['a repeated rhythmic or melodic pattern','a sudden accent','a change of key','a gradual slowing down'],'a repeated rhythmic or melodic pattern'),
  ()=>choice('A dotted note is worth…',['its value plus half again','twice its value','half its value','its value plus a quarter'],'its value plus half again'),
  ()=>{const q=pick([['semibreve','4'],['minim','2'],['dotted minim','3'],['dotted crotchet','1½'],['quaver','½'],['semiquaver','¼'],['dotted quaver','¾']]);return choice('In 4/4, a '+q[0]+' is worth how many beats?',optsFrom(q[1],['4','2','3','1','1½','½','¼','¾','6'],4),q[1]);},
  ()=>{const q=pick([['quavers','minim','4'],['semiquavers','crotchet','4'],['quavers','semibreve','8'],['crotchets','semibreve','4'],['semiquavers','quaver','2'],['quavers','dotted crotchet','3']]);return choice('How many '+q[0]+' equal a '+q[1]+'?',optsFrom(q[2],['2','3','4','6','8'],4),q[2]);},
  Y(10,()=>choice('5/4 and 7/8 are examples of…',['simple time','compound time','irregular (asymmetric) time','cut common time'],'irregular (asymmetric) time')),
  Y(10,()=>choice('7/8 is usually grouped as…',['2 + 2 + 3 (or 3 + 2 + 2)','4 + 3','7 equal beats','2 + 2 + 2 + 1'],'2 + 2 + 3 (or 3 + 2 + 2)')),
 ];return pickY(qs);}
function deviceRhythmQ(){const key={tonic:parse('G4'),mode:'major'};
  const rv=S('rhythm')||[];const kinds=[].concat(rv.includes('ties')?['anacrusis','tie']:[],rv.includes('syncop')?['syncopation']:[],rv.includes('triplet')?['triplet']:[],rv.includes('duplet')?['duplet']:[]);if(!kinds.length)return null;const kind=pick(kinds);let items,ans,why;
  if(kind==='anacrusis'){items=[n([parse('D4')],'q'),bar(),n([parse('G4')],'q'),n([parse('A4')],'q'),n([parse('B4')],'h'),bar(),n([parse('A4')],'h'),n([parse('G4')],'q'),fin()];ans='anacrusis (pick-up)';why='The piece starts with an incomplete bar: an upbeat before the first full bar.';}
  else if(kind==='syncopation'){items=[n([parse('G4')],'e'),n([parse('A4')],'q'),n([parse('B4')],'q'),n([parse('A4')],'e'),n([parse('G4')],'q'),bar(),n([parse('A4')],'q'),n([parse('B4')],'e'),n([parse('C5')],'q'),n([parse('B4')],'e'),fin()];ans='syncopation';why='Longer notes fall between the beats, pushing the accent off the beat.';}
  else if(kind==='tie'){items=[n([parse('G4')],'h'),n([parse('A4')],'q'),n([parse('B4')],'q',{tie:true}),bar(),n([parse('B4')],'q'),n([parse('A4')],'q'),n([parse('G4')],'h'),fin()];ans='a tie';why='The curved line joins two notes of the same pitch across the bar line; they are held as one.';}
  else if(kind==='triplet'){items=[n([parse('G4')],'q'),n([parse('A4')],'e',{tup:{n:3,in:2,pos:'start'}}),n([parse('B4')],'e',{tup:{n:3,in:2}}),n([parse('C5')],'e',{tup:{n:3,in:2,pos:'end'}}),n([parse('D5')],'h'),fin()];ans='a triplet';why='Three quavers in the time of two: marked with a 3.';}
  else {items=[n([parse('G4')],'q',{dots:1}),n([parse('A4')],'q',{tup:{n:2,in:3,pos:'start'}}),n([parse('B4')],'q',{tup:{n:2,in:3,pos:'end'}}),bar(),n([parse('C5')],'h',{dots:1}),fin()];ans='a duplet';why='Two notes in the time of three quavers in compound time: marked with a 2.';}
  const ts=kind==='duplet'?[6,8]:[4,4];E.autoBeam(items,ts);
  return choice('Which rhythmic device is shown here?',optsFrom(ans,['anacrusis (pick-up)','syncopation','a tie','a triplet','a duplet','an ostinato','swing'],4),ans,{show:show(stave('treble',1,ts,items)),why});}
// ======================================================================
// UNIT 3 — TEMPO & EXPRESSION
// ======================================================================
const TEMPO=[['largo','very slow and broad',7],['adagio','slow and stately',7],['andante','at a walking pace',9],['moderato','at a moderate speed',7],['allegretto','fairly fast (a little slower than allegro)',9],['allegro','fast and lively',7],['presto','very fast',7]];
const TMOD=[['accelerando (accel.)','gradually getting faster',8],['rallentando (rall.)','gradually getting slower',8],['ritardando (rit.)','gradually getting slower',8],['a tempo','return to the original speed',10],['rubato','with flexible, expressive timing',10],['double time','the tempo feels twice as fast',11],['half time','the tempo feels half as fast',11]];
const DYN=[['pp (pianissimo)','very soft',7],['p (piano)','soft',7],['mp (mezzo piano)','moderately soft',7],['mf (mezzo forte)','moderately loud',7],['f (forte)','loud',7],['ff (fortissimo)','very loud',7],['crescendo (cresc. / <)','gradually getting louder',8],['diminuendo / decrescendo (dim. / >)','gradually getting softer',8]];
const ART=[['staccato','short and detached',7],['legato','smooth and connected',7],['accent (>)','emphasised',8],['sforzando (sfz)','a sudden strong accent on one note',8],['slur','play the notes it covers legato',8],['forte-piano (fp)','loud, then immediately soft',10],['tenuto','held for its full value, slightly stressed',11]];
const ORN=[['trill (tr)','rapid alternation with the note above',10],['glissando / slide','sliding continuously between two pitches',10],['scoop','sliding up into a note from below',11],['bend','pushing the pitch up (e.g. on guitar) and often back',11],['mordent','a quick turn to the neighbouring note and back (ext.)',11],['acciaccatura','a crushed grace note before the main note (ext.)',11]];
const byYear=list=>{const ok=list.filter(x=>(x[2]||7)<=UPTO());return ok.length>=2?ok:list;};
function matchFrom(title,list,k){list=byYear(list);k=Math.min(k||4,list.length);if(k<2)return null;const pairs=shuffle(list).slice(0,k);return {t:'match',prompt:title,pairs};}
function termQ(){const qs=[
  ()=>matchFrom('Match each tempo term to its meaning.',TEMPO,4),
  Y(8,()=>matchFrom('Match each tempo modification to its meaning.',TMOD.filter(x=>!x[0].startsWith('ritardando')),4)),
  ()=>matchFrom('Match each dynamic to its meaning.',DYN,4),
  Y(8,()=>matchFrom('Match each articulation to its meaning.',ART,4)),
  Y(11,()=>matchFrom('Match each ornament to its meaning.',ORN.filter(x=>S('ext')||!x[1].includes('ext.')),4)),
  ()=>choice('Order these from slowest to fastest:',['Largo, Allegro, Moderato, Presto','Largo, Moderato, Allegro, Presto','Moderato, Largo, Allegro, Presto','Presto, Allegro, Moderato, Largo'],'Largo, Moderato, Allegro, Presto'),
  Y(8,()=>choice('Order these from softest to loudest:',['pp, p, mp, mf, f, ff','p, pp, mp, mf, ff, f','pp, mp, p, mf, f, ff','ff, f, mf, mp, p, pp'],'pp, p, mp, mf, f, ff')),
  ()=>{const t=pick(byYear(TEMPO));return choice('"'+t[0]+'" means…',optsFrom(t[1],TEMPO.map(x=>x[1]),4),t[1]);},
  Y(8,()=>{const t=pick(byYear(TMOD));return choice('"'+t[0]+'" means…',optsFrom(t[1],TMOD.map(x=>x[1]),4),t[1]);}),
  Y(8,()=>{const t=pick(byYear(ART));return choice('"'+t[0]+'" means…',optsFrom(t[1],ART.map(x=>x[1]),4),t[1]);}),
  Y(11,()=>{const t=pick(ORN.slice(0,4));return choice('A "'+t[0].split(' (')[0]+'" is…',optsFrom(t[1],ORN.map(x=>x[1]),4),t[1]);}),
  Y(11,()=>{const bpm=pick([60,72,96,120,132,144]);return choice('♩ = '+bpm+' means…',[bpm+' crotchet beats per minute','one crotchet lasts '+bpm+' seconds',bpm+' bars per minute','a metronome mark of '+bpm+' quavers per minute'],bpm+' crotchet beats per minute',{why:'A metronome mark (M.M.) gives beats per minute for the note value shown.'});}),
  Y(11,()=>choice('"M.M. ♩ = 120" refers to…',['Maelzel\'s metronome: 120 crotchets per minute','a tempo of 120 minims per minute','mezzo-moderato','the number of bars'],'Maelzel\'s metronome: 120 crotchets per minute')),
  Y(11,()=>choice('At ♩ = 60, how long does one crotchet last?',['half a second','one second','two seconds','a minute'],'one second')),
  Y(11,()=>choice('At ♩ = 120, how long does a bar of 4/4 last?',['one second','two seconds','four seconds','half a second'],'two seconds',{why:'120 beats per minute = 2 beats per second, so 4 beats take 2 seconds.'})),
  Y(11,()=>choice('Which tempo term is closest to ♩ = 120?',['adagio','andante','allegro','presto'],'allegro',{why:'Typical ranges: adagio ≈ 66–76, andante ≈ 76–108, allegro ≈ 120–168, presto ≈ 168+.'})),
  Y(11,()=>choice('A piece marked "double time" feel…',['doubles the written tempo','feels twice as fast (the drums/pulse subdivide) while the harmony moves at the same rate','halves the dynamics','is played in 2/2'],'feels twice as fast (the drums/pulse subdivide) while the harmony moves at the same rate')),
  Y(10,()=>choice('"fp" means…',['loud, then immediately soft','soft, then loud','very fast','fade out'],'loud, then immediately soft')),
  Y(8,()=>choice('"sfz" means…',['a sudden strong accent','gradually softer','smoothly','a slide'],'a sudden strong accent')),
  Y(8,()=>choice('A hairpin opening outward ( < ) means…',['crescendo: gradually louder','diminuendo: gradually softer','accent','slur'],'crescendo: gradually louder')),
 ];return pickY(qs);}
function artSymbolQ(){const kind=pick(['stac','fermata'].concat(UPTO()>=8?['acc']:[],UPTO()>=11?['ten','trill']:[]));const items=[n([parse('A4')],'q'),n([parse('B4')],'q',{art:[kind]}),n([parse('C5')],'q',{art:[kind]}),n([parse('B4')],'q'),fin()];
  const ans={stac:'staccato: short and detached',acc:'accent: emphasised',ten:'tenuto: held for its full value',fermata:'pause (fermata): hold the note longer',trill:'trill: rapid alternation with the note above'}[kind];
  return choice('What does the marking on the 2nd and 3rd notes mean?',optsFrom(ans,['staccato: short and detached','accent: emphasised','tenuto: held for its full value','pause (fermata): hold the note longer','trill: rapid alternation with the note above','marcato: strongly accented'],4),ans,{show:show(stave('treble',0,[4,4],items))});}
// ======================================================================
// UNIT 4 — KEYS & KEY SIGNATURES
// ======================================================================
function keySigIdQ(){const k=randKey();const clef=clefPick();const major=T.majorFromSig(k.sig);const minor=T.relMinor(major);
  const askMinor=Math.random()<0.4&&S('minorKeys');const ans=askMinor?name(minor)+' minor':name(major)+' major';
  const pool=keyTonics(7).map(t=>askMinor?name(T.relMinor(t))+' minor':name(t)+' major');
  return choice('Name the '+(askMinor?'minor':'major')+' key of this key signature.',optsFrom(ans,pool,4),ans,{sub:clefWord(clef)+'.',show:show(stave(clef,k.sig,null,[{k:'gap',w:4}])),
    why:k.sig>0?'Last sharp is '+T.SHARP_ORDER[k.sig-1]+'♯; a semitone up gives '+name(major)+' major'+(askMinor?'; its relative minor is a minor 3rd lower: '+name(minor)+' minor.':'.'):k.sig<0?(k.sig===-1?'One flat (B♭) is F major.':'The second-last flat names the key: '+name(major)+' major')+(askMinor?'; relative minor '+name(minor)+' minor.':'.'):'No sharps or flats: C major / A minor.'});}
function keySigWriteQ(){const k=randKey();const clef=clefPick();
  return {t:'notate',prompt:'Write the key signature of '+keyName(k)+'.',sub:clefWord(clef)+'. Use the ♯ / ♭ buttons to build it, then Check.',clef,sig:0,keysigEdit:true,sigTarget:k.sig,items:[{k:'gap',w:6}],
    why:keyName(k)+' has '+T.sigWord(k.sig)+(k.sig?' ('+T.sigList(k.sig)+')':'')+'.'};}
function keyFactQ(){const qs=[
  ()=>choice('The order of sharps in a key signature is…',['F C G D A E B','B E A D G C F','C G D A E B F','F G C D A E B'],'F C G D A E B'),
  ()=>choice('The order of flats in a key signature is…',['F C G D A E B','B E A D G C F','C F B E A D G','B A E D G C F'],'B E A D G C F'),
  ()=>{const k=randKey();const ans=T.sigWord(k.sig);return choice('How many sharps or flats does '+keyName(k)+' have?',optsFrom(ans,['no sharps or flats','1 sharp','2 sharps','3 sharps','4 sharps','5 sharps','6 sharps','7 sharps','1 flat','2 flats','3 flats','4 flats','5 flats','6 flats','7 flats'],4),ans,{why:k.sig?ans+': '+T.sigList(k.sig):''});},
  ()=>{const k=randKey();if(!k.sig)return null;const ans=T.sigList(k.sig);const pool=[];for(let i=-7;i<=7;i++)if(i)pool.push(T.sigList(i));return choice('Which sharps or flats are in the key signature of '+keyName(k)+'?',optsFrom(ans,pool,4),ans);},
  Y(8,()=>{const t=pick(keyTonics(S('keysMax')));const ans=name(T.relMinor(t))+' minor';return choice('The relative minor of '+name(t)+' major is…',optsFrom(ans,keyTonics(7).map(x=>name(T.relMinor(x))+' minor'),4),ans,{why:'The relative minor is a minor 3rd below the major tonic; it shares the key signature.'});}),
  Y(8,()=>{const t=pick(keyTonics(S('keysMax')));const m=T.relMinor(t);const ans=name(t)+' major';return choice('The relative major of '+name(m)+' minor is…',optsFrom(ans,keyTonics(7).map(x=>name(x)+' major'),4),ans,{why:'The relative major is a minor 3rd above the minor tonic.'});}),
  Y(10,()=>{const t=pick(keyTonics(3));return choice(name(t)+' major and '+name(t)+' minor are…',['relative keys','parallel (tonic) keys','the same key','enharmonic keys'],'parallel (tonic) keys',{why:'Same tonic, different key signature: parallel (tonic) major and minor.'});}),
  ()=>{const t=pick(keyTonics(5));const sig=T.sigOf(t,'major');if(!sig)return null;const last=sig>0?T.SHARP_ORDER[sig-1]+'♯':T.FLAT_ORDER[-sig-1]+'♭';
     return choice('A key signature whose last '+(sig>0?'sharp':'flat')+' is '+last+' is…',optsFrom(name(t)+' major',keyTonics(7).map(x=>name(x)+' major'),4),name(t)+' major',{why:sig>0?'The last sharp is the leading note: a semitone up is the key.':'The second-last flat names the key (F major has one flat).'});},
  ()=>{const t=pick(keyTonics(S('keysMax')));const m=pick(['major','minor']);const tonic=m==='minor'?T.relMinor(t):t;const d=rand(7);const sc=m==='minor'?T.scale(tonic,'harmminor'):T.scale(tonic,'major');
     const ans=name(sc[d]);const pool=T.LETTERS.flatMap(l=>[name(P(l,0,4)),name(P(l,1,4)),name(P(l,-1,4))]);
     return choice('In '+name(tonic)+' '+m+', the '+T.DEG_NAMES[d]+' is…',optsFrom(ans,pool,4),ans,{why:'Scale degrees: tonic, supertonic, mediant, subdominant, dominant, submediant, leading note.'+(m==='minor'&&d===6?' In minor the leading note is raised (harmonic minor).':'')});},
  ()=>{const t=pick(keyTonics(S('keysMax')));const d=rand(7);const sc=T.scale(t,'major');const ans=T.DEG_NAMES[d];
     return choice(name(sc[d])+' is which degree of '+name(t)+' major?',optsFrom(ans,T.DEG_NAMES,4),ans,{why:name(sc[d])+' is degree '+(d+1)+' of '+name(t)+' major: the '+ans+'.'});},
  Y(11,()=>matchFrom('Match each scale degree to its technical name.',[['1st','tonic'],['2nd','supertonic'],['3rd','mediant'],['4th','subdominant'],['5th','dominant'],['6th','submediant'],['7th','leading note']],4)),
  ()=>{const t=pick(keyTonics(S('keysMax')));const target=pick([['dominant','P5',true],['subdominant','P4',true],['relative minor',null,false]]);let ans;
     if(target[0]==='relative minor')ans=name(T.relMinor(t))+' minor';else ans=name(T.transposeUp(t,target[1]))+' major';
     const pool=keyTonics(7).map(x=>name(x)+' major').concat(keyTonics(7).map(x=>name(T.relMinor(x))+' minor'));
     return choice('A piece in '+name(t)+' major modulates to the '+target[0]+'. The new key is…',optsFrom(ans,pool,4),ans,{why:target[0]==='dominant'?'The dominant is a 5th above the tonic (one sharp more / one flat fewer).':target[0]==='subdominant'?'The subdominant is a 4th above (one flat more / one sharp fewer).':'Relative minor: same key signature, tonic a minor 3rd below.'});},
  Y(9,()=>choice('Moving one step clockwise around the circle of fifths…',['adds one sharp (or removes one flat)','adds one flat','changes the tonic by a tone','moves to the relative minor'],'adds one sharp (or removes one flat)')),
  Y(8,()=>choice('Two keys that share a key signature but have different tonics are…',['relative keys','parallel keys','enharmonic keys','chromatic keys'],'relative keys')),
  Y(11,()=>{const k=pick([['B','C♭'],['F♯','G♭'],['C♯','D♭']]);return choice(k[0]+' major and '+k[1]+' major are…',['relative keys','parallel keys','enharmonic equivalents (same pitches, different spelling)','unrelated keys'],'enharmonic equivalents (same pitches, different spelling)');}),
 ];return pickY(qs);}
function tonalityQ(){ // melody rendered; identify tonality (major / minor / modal)
  const t=pick(keyTonics(Math.min(S('keysMax'),4)));const kind=pick(['major','minor','minor','mixolydian','dorian'].filter(k=>k==='major'||(k==='minor'&&S('scales').includes('natminor'))||(k!=='minor'&&S('scales').includes(k))));
  let key,sig,items,ans,why;const clef=pick(['treble','bass']);
  if(kind==='major'){key={tonic:t,mode:'major'};sig=T.sigOf(t,'major');items=melody(key,clef,'4/4',2);ans='major';why='The notes fit the major scale of the key signature and the melody centres on its tonic.';}
  else if(kind==='minor'){const m=T.relMinor(t);key={tonic:m,mode:'minor'};sig=T.sigOf(t,'major');items=melody(key,clef,'4/4',2,{raise7:true});ans='minor';why='The melody centres on '+name(m)+' and the raised 7th ('+name(T.transposeUp(m,'M7'))+') is the harmonic-minor leading note.';}
  else{const sc=T.scale(t,kind);key={tonic:t,mode:'major'};sig=T.sigOf(t,kind);
    const items0=rhythmItems('4/4',2);const pool=[];for(let o=-1;o<=1;o++)sc.slice(0,7).forEach(p=>pool.push(up8(p,o)));const [lo,hi]=RANGE[clef];let ok=pool.filter(p=>dia(p)>=MIDD[clef]-4&&dia(p)<=MIDD[clef]+5);if(ok.length<4)ok=pool.filter(p=>dia(p)>=lo&&dia(p)<=hi);
    let cur=ok.find(p=>p.l===t.l)||ok[0];const notes=items0.filter(i=>i.k==='n');notes.forEach((it,i)=>{if(i===notes.length-1)cur=ok.find(p=>p.l===t.l)||cur;else if(i>0){const idx=ok.findIndex(p=>dia(p)===dia(cur));let j=idx+pick([-1,1,2,-2]);j=Math.max(0,Math.min(ok.length-1,j));cur=ok[j];}it.p=[P(cur.l,cur.a,cur.o)];});
    E.autoBeam(items0,[4,4]);items=items0;ans=kind==='mixolydian'?'modal (Mixolydian)':'modal (Dorian)';
    why=kind==='mixolydian'?'A major-sounding scale on '+name(t)+' but with a flattened 7th: Mixolydian.':'A minor-sounding scale on '+name(t)+' with a raised 6th: Dorian.';}
  return choice('What is the tonality of this melody?',optsFrom(ans,UPTO()>=11?['major','minor','modal (Mixolydian)','modal (Dorian)']:['major','minor'],UPTO()>=11?4:2),ans,{sub:'Look at the key signature, the accidentals and the note the melody centres on.',show:show(stave(clef,sig,[4,4],items)),why});}
// ======================================================================
// UNIT 5 — SCALES & MODES
// ======================================================================
const scalesOn=()=>S('scales').length?S('scales'):['major'];
function scaleTonic(type){ // tonics with sensible signatures
  const max=S('keysMax');let cands=keyTonics(max);
  if(['natminor','harmminor','melminor','minpent','blues'].includes(type))cands=cands.map(T.relMinor);
  else if(type==='dorian')cands=cands.map(t=>T.transposeUp(t,'M2'));else if(type==='mixolydian')cands=cands.map(t=>T.transposeUp(t,'P5'));
  else if(type==='phrygian')cands=cands.map(t=>T.transposeUp(t,'M3'));else if(type==='lydian')cands=cands.map(t=>T.transposeUp(t,'P4'));else if(type==='locrian')cands=cands.map(t=>T.transposeUp(t,'M7'));
  else if(type==='chromatic')cands=keyTonics(3);
  return pick(cands);}
function sigForScale(t,type){if(['major','majpent'].includes(type))return T.sigOf(t,'major');if(['natminor','harmminor','melminor','minpent','blues'].includes(type))return T.sigOf(t,'minor');
  if(['dorian','mixolydian','phrygian','lydian','locrian','aeolian','ionian'].includes(type))return T.sigOf(t,type);return 0;}
// ---- sol-fa (moveable do; la-based minor) ----
const SOLFA_MAJ=['do','re','mi','fa','so','la','ti'],SOLFA_MIN=['la','ti','do','re','mi','fa','so'];
const SOLFA_TYPES={major:SOLFA_MAJ,majpent:[0,1,2,4,5].map(i=>SOLFA_MAJ[i]),natminor:SOLFA_MIN,minpent:[0,2,3,4,6].map(i=>SOLFA_MIN[i])};
const solfaScale=(type,desc)=>{const s=SOLFA_TYPES[type];if(!s)return null;const a=s.concat([s[0]]);return desc?a.slice().reverse():a;};
const solfaLine=(type,desc)=>{const s=solfaScale(type,desc);return s?'Sol-fa: '+s.join(' ')+(/min/.test(type)?' (la-based minor: la is the tonic).':'.'):'';};
const YY=(typeof Y==='function')?Y:((yr,fn)=>fn);
function solfaTypesOn(){const on=scalesOn().filter(t=>SOLFA_TYPES[t]);return on.length?on:['major'];}
function solfaQ(){const type=pick(solfaTypesOn());const t=scaleTonic(type);const notes=T.scale(t,type).slice(0,-1);const syl=SOLFA_TYPES[type];const i=rand(notes.length);
  const nm=T.scaleName(t,type);const minorNote=/min/.test(type)?' (la-based minor: la = '+name(t)+')':'';const why=nm+' in sol-fa: '+notes.map((p,k)=>name(p)+' = '+syl[k]).join(', ')+'.';
  if(Math.random()<0.5)return choice('In '+nm+', which note is sung as "'+syl[i]+'"?',optsFrom(name(notes[i]),notes.map(name),4),name(notes[i]),{sub:'Moveable do'+minorNote+'.',why});
  return choice('In '+nm+', the note '+name(notes[i])+' is sung as…',optsFrom(syl[i],syl,4),syl[i],{sub:'Moveable do'+minorNote+'.',why});}
function solfaNotateQ(){const type=pick(solfaTypesOn());const t=scaleTonic(type);const clef=clefPick();const notes=T.scale(t,type).slice(0,-1);const syl=SOLFA_TYPES[type];const i=rand(notes.length);const p=inClef(notes[i],clef);
  const useSig=Math.random()<0.5;const sig=useSig?sigForScale(t,type):0;
  return {t:'notate',prompt:'Write "'+syl[i]+'" in '+T.scaleName(t,type)+'.',sub:clefWord(clef)+'. Moveable do'+(/min/.test(type)?' (la-based minor: la = '+name(t)+')':'')+'. '+(useSig?'Key signature given.':'No key signature: add any accidental the note needs.')+' Any octave.',clef,sig,items:[slot(0,[p],'w',{anyOctave:true})],useSig,
    why:'"'+syl[i]+'" in '+T.scaleName(t,type)+' is '+name(notes[i])+'. '+solfaLine(type)};}
function notateScaleQ(){const type=pick(scalesOn());const t=scaleTonic(type);const clef=clefPick();const desc=Math.random()<0.3&&type!=='chromatic';
  const useSig=type!=='chromatic'&&Math.random()<0.5;const sig=useSig?sigForScale(t,type):0;
  let notes=T.scale(t,type,desc);notes=fitScale(notes,clef,desc);
  const items=notes.map((p,i)=>{const sl=slot(i,[p],'w');if(i===0){sl.p=[p];sl.given=true;}return sl;});
  if(type==='blues'){const bi=3;const altP=T.bluesAlt(t);const tgt=notes[bi];let best=null;for(let o=tgt.o-1;o<=tgt.o+1;o++){const c=P(altP.l,altP.a,o);if(best===null||Math.abs(dia(c)-dia(tgt))<Math.abs(dia(best)-dia(tgt)))best=c;}items[bi].alt=[[best]];}
  const desc2=desc?'descending':'ascending';
  const sub=clefWord(clef)+'. '+(useSig?'Key signature given: add accidentals only where the scale needs them.':'No key signature: write every accidental the scale needs.')+' Tonic given.'+(type==='melminor'&&desc?' Descending melodic minor = natural minor.':'')+(type==='blues'?' Blue note: ♯4 or ♭5 both accepted.':'');
  return {t:'notate',prompt:'Write '+T.scaleName(t,type)+', '+desc2+'.',sub,clef,sig,items,useSig,solfa:solfaScale(type,desc),why:scaleWhy(type)+' '+solfaLine(type,desc)};}
function scaleWhy(type){return {major:'Major: T T S T T T S.',natminor:'Natural minor: T S T T S T T (the relative major\'s key signature).',harmminor:'Harmonic minor: natural minor with the 7th raised a semitone.',melminor:'Melodic minor: raise the 6th and 7th ascending; descend as natural minor.',majpent:'Major pentatonic: degrees 1 2 3 5 6 of the major scale.',minpent:'Minor pentatonic: 1 ♭3 4 5 ♭7.',blues:'Blues: minor pentatonic plus the ♯4/♭5 blue note.',chromatic:'Chromatic: every semitone; sharps ascending, flats descending.',dorian:'Dorian: natural minor with a raised 6th (major scale from its 2nd degree).',mixolydian:'Mixolydian: major with a flattened 7th (major scale from its 5th degree).',phrygian:'Phrygian: natural minor with a flattened 2nd.',lydian:'Lydian: major with a raised 4th.',locrian:'Locrian: ♭2 and ♭5.'}[type]||'';}
function nameScaleQ(){const type=pick(scalesOn());const t=scaleTonic(type);const clef=pick(['treble','bass']);let notes=fitScale(T.scale(t,type),clef);
  const items=notes.map(p=>n([p],'w'));const ans=T.scaleName(t,type);
  const dis=[];const same=scalesOn().filter(x=>x!==type);same.forEach(x=>dis.push(T.scaleName(t,x)));
  if(['major','majpent'].includes(type))dis.push(T.scaleName(T.relMinor(t),'natminor'));if(['natminor','harmminor','minpent'].includes(type))dis.push(T.scaleName(T.relMajor(t),'major'));
  const opts=optsFrom(ans,uniq(dis),4);
  return choice('Name this scale.',opts,ans,{sub:'No key signature; read every accidental.',show:show(stave(clef,0,null,items,{noBar:true})),why:scaleWhy(type)+' '+solfaLine(type)});}
function scaleFactQ(){const qs=[
  ()=>choice('In sol-fa, the major scale is sung…',['do re mi fa so la ti do','la ti do re mi fa so la','do re mi so la do','do re me fa so le te do'],'do re mi fa so la ti do'),
  ()=>choice('In sol-fa, the major pentatonic is sung…',['do re mi so la do','do re mi fa so do','la do re mi so la','do mi fa so ti do'],'do re mi so la do'),
  YY(8,()=>choice('In la-based sol-fa, the natural minor scale is sung…',['la ti do re mi fa so la','do re mi fa so la ti do','la do re mi so la','do re me fa so le te do'],'la ti do re mi fa so la',{why:'La-based minor: the tonic of the minor key is la, so the scale uses the same syllables as its relative major.'})),
  YY(8,()=>choice('In la-based sol-fa, the minor pentatonic is sung…',['la do re mi so la','do re mi so la do','la ti do mi so la','la do mi fa so la'],'la do re mi so la')),
  YY(8,()=>choice('In la-based sol-fa, the tonic of a minor key is sung as…',['la','do','mi','so'],'la')),
  ()=>choice('The pattern of a major scale is…',['T T S T T T S','T S T T S T T','T T T S T T S','T S T T T S T'],'T T S T T T S'),
  Y(8,()=>choice('The pattern of a natural minor scale is…',['T T S T T T S','T S T T S T T','T S T T T S T','S T T S T T T'],'T S T T S T T')),
  Y(9,()=>choice('The harmonic minor raises which degree of the natural minor?',['the 6th','the 7th','the 3rd','the 5th'],'the 7th',{why:'Raising the 7th creates a leading note a semitone below the tonic.'})),
  Y(10,()=>choice('The melodic minor, ascending, raises degrees…',['6 and 7','2 and 6','3 and 7','4 and 7'],'6 and 7',{why:'Descending, the melodic minor returns to the natural minor.'})),
  Y(8,()=>choice('The minor pentatonic is spelled…',['1 2 3 5 6','1 ♭3 4 5 ♭7','1 2 ♭3 4 5','1 ♭3 4 ♯4 5 ♭7'],'1 ♭3 4 5 ♭7')),
  ()=>choice('The major pentatonic is spelled…',['1 2 3 5 6','1 ♭3 4 5 ♭7','1 2 4 5 6','1 3 4 5 7'],'1 2 3 5 6'),
  Y(9,()=>choice('The blues scale adds which note to the minor pentatonic?',['♭2','♯4 / ♭5 (the "blue note")','♭6','♯7'],'♯4 / ♭5 (the "blue note")')),
  Y(11,()=>choice('The Mixolydian mode is a major scale with a…',['flattened 7th','raised 4th','flattened 3rd','flattened 2nd'],'flattened 7th')),
  Y(12,()=>choice('The Dorian mode is a natural minor scale with a…',['raised 6th','raised 7th','flattened 2nd','raised 4th'],'raised 6th')),
  Y(10,()=>choice('A chromatic scale is built entirely of…',['tones','semitones','minor 3rds','tones and semitones alternating'],'semitones')),
  Y(10,()=>choice('How many different notes are in a chromatic scale?',['7','8','10','12'],'12')),
  Y(11,()=>choice('The modes are formed by…',['starting a major scale on each of its degrees','adding sharps to a minor scale','repeating the tonic','playing only black notes'],'starting a major scale on each of its degrees')),
  Y(11,()=>{const t=pick(keyTonics(4));return choice('Which mode uses the same notes as '+name(t)+' major but starts on '+name(T.transposeUp(t,'P5'))+'?',['Dorian','Mixolydian','Aeolian','Lydian'],'Mixolydian',{why:'The 5th degree of a major scale begins the Mixolydian mode.'});}),
  Y(12,()=>{const t=pick(keyTonics(4));return choice('Which mode uses the same notes as '+name(t)+' major but starts on '+name(T.transposeUp(t,'M2'))+'?',['Dorian','Mixolydian','Aeolian','Phrygian'],'Dorian');}),
  Y(8,()=>{const t=pick(keyTonics(4));return choice(name(T.relMinor(t))+' natural minor (Aeolian) uses the same notes as…',optsFrom(name(t)+' major',keyTonics(7).map(x=>name(x)+' major'),4),name(t)+' major');}),
  Y(11,()=>choice('In which scale is the 7th degree a tone below the tonic?',['natural minor and Mixolydian','major','harmonic minor','melodic minor ascending'],'natural minor and Mixolydian')),
  Y(11,()=>choice('A scale degree is written as a number; its technical name for degree 5 is the…',['mediant','subdominant','dominant','submediant'],'dominant')),
 ];return pickY(qs);}
// ======================================================================
// UNIT 6 — INTERVALS
// ======================================================================
function ivPool(){const qs=S('ivQ').length?S('ivQ'):['M','m','P'];const max=S('ivMax');const nums=(S('ivNums')||[]).length?S('ivNums'):[2,3,4,5,6,7,8];const out=[];
  for(let n=2;n<=max;n++){if(n<=8&&!nums.includes(n))continue;const perf=T.isPerfClass(n);qs.forEach(q=>{if(perf&&(q==='P'||q==='A'||q==='d'))out.push({q,n});if(!perf&&(q==='M'||q==='m'||q==='A'||q==='d'))out.push({q,n});});}
  if(qs.includes('P')&&UPTO()>=11)out.push({q:'P',n:1});return out.filter(iv=>!((iv.n===1||iv.n===8)&&(iv.q==='d'||iv.q==='A'))).filter(iv=>iv.n>8?['M','m','P'].includes(iv.q):(!(iv.q==='A'&&![2,4,5,6].includes(iv.n))&&!(iv.q==='d'&&![3,4,5,7].includes(iv.n))));}
function ivLower(clef,bias){const t=pick(keyTonics(Math.min(S('keysMax'),5)));const sc=T.scale(t,'major');let p=pick(sc.slice(0,7));if(Math.random()<0.25)p=P(p.l,p.a+pick([1,-1]),p.o);if(Math.abs(p.a)>1)p=P(p.l,0,p.o);return inClef(p,clef,bias===undefined?-3:bias);}
// an interval question with an optional key signature: the lower note is drawn from the key so the signature does real work
function notateIntervalQ(){const clef=clefPick();const iv=pick(ivPool());const above=!S('ivBelow')||Math.random()<0.65;const big=iv.n>8;
  const useSig=Math.random()<0.4;const k=useSig?randKey():null;
  let lower,upper;
  if(above){lower=ivLower(clef,big?-6:-3);if(k){const sc=T.scale(k.tonic,k.mode==='minor'?'harmminor':'major').slice(0,7);lower=inClef(pick(sc),clef,big?-6:-3);}upper=T.transposeUp(lower,iv);}
  else{upper=ivLower(clef,big?5:2);if(k){const sc=T.scale(k.tonic,k.mode==='minor'?'harmminor':'major').slice(0,7);upper=inClef(pick(sc),clef,big?5:2);}lower=T.transposeDown(upper,iv);}
  if(Math.abs(lower.a)>2||Math.abs(upper.a)>2)return notateIntervalQ();
  const [lo,hi]=RANGE[clef];if(dia(lower)<lo-2||dia(upper)>hi+2)return notateIntervalQ();
  const given=above?lower:upper,target=above?upper:lower;
  const items=[Object.assign(slot(0,null,'w'),{p:[given],given:true,slotNo:''}),slot(1,[target],'w')];
  return {t:'notate',prompt:'Write '+(/^[aeiou]/.test(T.ivWord(iv))?'an ':'a ')+T.ivWord(iv)+' '+(above?'above':'below')+' the given note.',sub:clefWord(clef)+'. '+(k?'Key signature of '+keyName(k)+' applies: add an accidental only if the key signature does not already give the note you need.':'No key signature: write any accidental the note needs.')+' Place the '+(above?'upper':'lower')+' note; the spelling (letter + accidental) must be correct.',clef,sig:k?k.sig:0,items,
    why:'Count letter names for the number ('+iv.n+(big?', a compound interval: '+(iv.n-7)+'th plus an octave':'')+'), then semitones for the quality: '+an(T.ivWord(iv))+' is '+ivSemis(iv)+' semitones. '+name(given)+' → '+name(target)+'.'};}
const ivSemis=iv=>{const c=P('C',0,4);return midi(T.transposeUp(c,iv))-midi(c);};
function nameIntervalQ(){const clef=clefPick();const iv=pick(ivPool());const lower=ivLower(clef,iv.n>8?-6:-3);const upper=T.transposeUp(lower,iv);if(Math.abs(upper.a)>2||dia(upper)>RANGE[clef][1]+2)return nameIntervalQ();
  const harmonic=Math.random()<0.5&&iv.n>1;const items=harmonic?[n([lower,upper],'w')]:[n([lower],'w'),n([upper],'w')];
  const ans=T.ivWord(iv);const pool=ivPool().map(T.ivWord);const dis=[];
  // smart distractors: same number other quality, same quality adjacent number
  ['M','m','P','A','d'].forEach(q=>{if(q!==iv.q&&!(T.isPerfClass(iv.n)&&(q==='M'||q==='m'))&&!(!T.isPerfClass(iv.n)&&q==='P'))dis.push(T.ivWord({q,n:iv.n}));});
  [iv.n-1,iv.n+1].forEach(nn=>{if(nn>=1&&nn<=13){const q=T.isPerfClass(nn)?(iv.q==='M'||iv.q==='m'?'P':iv.q):(iv.q==='P'?'M':iv.q);dis.push(T.ivWord({q,n:nn}));}});
  const opts=optsFrom(ans,uniq(dis.concat(pool)),4);
  return choice('Name this '+(harmonic?'harmonic':'melodic')+' interval.',opts,ans,{sub:clefWord(clef)+'. Number from the letter names (count both), quality from the semitones.',show:show(stave(clef,0,null,items,{noBar:true})),why:name(lower)+' to '+name(upper)+': '+iv.n+' letter names, '+ivSemis(iv)+' semitones = '+ans+'.'});}
function ivFactQ(){const qs=[
  ()=>{const iv=pick(ivPool());const ans=String(ivSemis(iv));return choice('How many semitones are in a '+T.ivWord(iv)+'?',optsFrom(ans,['0','1','2','3','4','5','6','7','8','9','10','11','12','13','14'],4),ans);},
  Y(8,()=>choice('Which interval numbers can be "perfect"?',['2nd, 3rd, 6th, 7th','unison, 4th, 5th, octave','all of them','3rd and 5th only'],'unison, 4th, 5th, octave')),
  Y(8,()=>choice('A major interval made one semitone smaller becomes…',['minor','diminished','augmented','perfect'],'minor')),
  Y(12,()=>choice('A perfect interval made one semitone larger becomes…',['major','augmented','minor','diminished'],'augmented')),
  Y(12,()=>choice('A minor interval made one semitone smaller becomes…',['major','diminished','augmented','perfect'],'diminished')),
  Y(12,()=>choice('The tritone is…',['6 semitones: an augmented 4th or diminished 5th','7 semitones: a perfect 5th','3 tones: a major 6th','a perfect 4th'],'6 semitones: an augmented 4th or diminished 5th')),
  Y(11,()=>{const iv=pick(ivPool().filter(i=>i.n<=8));const inv=T.invertIv(iv);const ans=T.ivWord(inv);return choice((/^[aeiou]/.test(T.ivWord(iv))?'An ':'A ')+T.ivWord(iv)+' inverts to a…',optsFrom(ans,ivPool().map(T.ivWord),4),ans,{why:'Inverted intervals add to 9; major ↔ minor, augmented ↔ diminished, perfect stays perfect.'});}),
  Y(12,()=>{const nn=pick([9,10,11,12,13]);const ans='compound '+({9:'2nd',10:'3rd',11:'4th',12:'5th',13:'6th'}[nn]);return choice('A '+nn+'th is a…',optsFrom(ans,['compound 2nd','compound 3rd','compound 4th','compound 5th','compound 6th','compound 7th'],4),ans,{why:'Subtract 7 from a compound interval to find its simple form.'});}),
  ()=>choice('A harmonic interval is…',['two notes sounded together','two notes one after the other','an interval larger than an octave','a perfect 5th'],'two notes sounded together'),
  ()=>choice('A melodic interval is…',['two notes sounded together','two notes one after the other','always a 2nd','an interval within a chord'],'two notes one after the other'),
  ()=>{const a=pick([['C','E','major 3rd'],['E','C','minor 6th'],['F','B','augmented 4th'],['B','F','diminished 5th'],['D','A','perfect 5th'],['G','F','minor 7th'],['A','G♯','major 7th'],['E♭','G','major 3rd'],['C','A♭','minor 6th'],['F♯','C♯','perfect 5th']]);return choice('The interval from '+a[0]+' up to '+a[1]+' is a…',optsFrom(a[2],['major 3rd','minor 3rd','perfect 4th','augmented 4th','diminished 5th','perfect 5th','minor 6th','major 6th','minor 7th','major 7th'],4),a[2]);},
 ];return pickY(qs);}
// ======================================================================
// UNIT 7 — CHORDS
// ======================================================================
const chordsOn=()=>S('chords').length?S('chords'):['maj','min'];
const invsOn=()=>S('invs').length?S('invs'):[0];
function chordRoot(clef){const maj=keyTonics(Math.min(S('keysMax'),6));const roots=maj.concat(keyTonics(Math.min(S('keysMax'),5)).map(T.relMinor));return inClef(pick(roots),clef,-2);}
// juniors (below Year 11) only meet chords whose notes all belong to a key within their key-signature range
function chordFits(notes){if(UPTO()>=11)return true;const m=S('keysMax');for(let sig=-m;sig<=m;sig++){const sm=T.sigAccidentals(sig);if(notes.every(p=>(sm[p.l]||0)===p.a))return true;}return false;}
function notateChordQ(){const clef=clefPick();const type=pick(chordsOn());const nn=T.CHORDS[type].iv.length;const inv=nn>4?0:pick(invsOn().filter(i=>i<nn));
  let root=chordRoot(clef);let notes=T.chord(root,type,inv);if(notes.some(p=>Math.abs(p.a)>2)||!chordFits(notes))return notateChordQ();notes=fitScale(notes,clef);
  const withSym=UPTO()>=11&&Math.random()<0.5;const label=withSym?T.slashSym(root,type,inv)+(inv?'':'')+'':T.chordName(root,type)+', '+T.INV_NAMES[inv];
  return {t:'notate',prompt:'Write '+(withSym?'the chord '+label:label)+'.',sub:clefWord(clef)+'. Build it as a block chord in one column: tap to add each note.'+(withSym&&inv?' The letter after the slash is the bass note.':''),clef,sig:0,items:[Object.assign(slot(0,notes,'w'),{chord:true,max:nn})],
    why:T.chordName(root,type)+' = '+T.chord(root,type,0).map(name).join(' ')+(inv?'; '+T.INV_NAMES[inv]+' puts '+name(notes[0])+' in the bass.':'.')};}
function nameChordQ(){const clef=clefPick();const type=pick(chordsOn());const nn=T.CHORDS[type].iv.length;const inv=nn>4?0:pick(invsOn().filter(i=>i<nn));
  const root=chordRoot(clef);let notes=T.chord(root,type,inv);if(notes.some(p=>Math.abs(p.a)>2)||!chordFits(notes))return nameChordQ();notes=fitScale(notes,clef);
  const askInv=inv>0||(invsOn().length>1&&Math.random()<0.5);const sym=UPTO()>=11&&Math.random()<0.5;
  let ans,pool;
  if(askInv){ans=T.INV_NAMES[inv];pool=T.INV_NAMES.slice(0,nn);return choice('This chord is in…',optsFrom(ans,pool,Math.min(4,pool.length)),ans,{sub:'Which note is in the bass (lowest)?',show:show(stave(clef,0,null,[n(notes,'w')])),why:'The chord is '+T.chordSym(root,type)+' ('+T.chord(root,type,0).map(name).join(' ')+'); the bass note is '+name(notes[0])+' = '+ans+'.'});}
  ans=sym?T.chordSym(root,type):T.chordName(root,type);
  pool=chordsOn().map(ty=>sym?T.chordSym(root,ty):T.chordName(root,ty)).concat([T.chordSym(root,type)].map(x=>sym?x:x));
  // enharmonic / other-root distractors
  const alt=T.chordSymAlt(root,type);if(sym&&alt.length&&Math.random()<0.5)ans=alt[0];
  const others=[T.transposeUp(root,'m3'),T.transposeUp(root,'M3')].map(r=>sym?T.chordSym(r,type):T.chordName(r,type));
  return choice('Name this chord'+(sym?' (chord symbol).':'.'),optsFrom(ans,uniq(pool.concat(others).filter(x=>x!==T.chordSym(root,type)||!alt.includes(ans))),4),ans,{sub:clefWord(clef)+'. Stack the notes in 3rds from the root.',show:show(stave(clef,0,null,[n(notes,'w')])),why:T.chord(root,type,0).map(name).join(' ')+' = '+T.chordName(root,type)+'.'});}
function chordSymbolQ(){const rows=[['∆7 (or M7)','maj7'],['−7','min7'],['ø7 (or m7♭5)','m7b5'],['°','dim'],['+','aug'],['−','min'],['°7','dim7']];const r0=pick(rows.filter(x=>chordsOn().includes(x[1])||x[1]==='min'||x[1]==='dim'||x[1]==='aug'));
  const root=pick(['C','D','E♭','F','G','A','B♭']);const ans=root+' '+T.CHORDS[r0[1]].name;
  return choice('The chord symbol '+root+r0[0]+' means…',optsFrom(ans,Object.keys(T.CHORDS).map(k=>root+' '+T.CHORDS[k].name),4),ans,{why:'Alternate symbols: ∆ = major 7th, − = minor, ° = diminished, ø = half-diminished (m7♭5), + = augmented.'});}
function chordFactQ(){const qs=[
  ()=>choice('A triad is built from…',['two 3rds stacked on a root','two 4ths','a root and its octave','three adjacent notes'],'two 3rds stacked on a root'),
  Y(8,()=>{const q=pick([['major','1 3 5'],['minor','1 ♭3 5'],['diminished','1 ♭3 ♭5'],['augmented','1 3 ♯5'],['dominant 7th','1 3 5 ♭7'],['major 7th','1 3 5 7'],['minor 7th','1 ♭3 5 ♭7'],['m7♭5 (half-diminished)','1 ♭3 ♭5 ♭7'],['dominant 9th','1 3 5 ♭7 9']]);return choice('The formula of a '+q[0]+' chord is…',optsFrom(q[1],['1 3 5','1 ♭3 5','1 ♭3 ♭5','1 3 ♯5','1 3 5 ♭7','1 3 5 7','1 ♭3 5 ♭7','1 ♭3 ♭5 ♭7','1 3 5 ♭7 9','1 ♭3 5 ♭7 9'],4),q[1]);}),
  Y(10,()=>{const t=pick(keyTonics(4));return choice(name(t)+'/'+name(T.transposeUp(t,'M3'))+' is a '+name(t)+' major chord in…',['root position','1st inversion','2nd inversion','3rd inversion'],'1st inversion',{why:'The 3rd in the bass = 1st inversion.'});}),
  Y(10,()=>{const t=pick(keyTonics(4));return choice(name(t)+'/'+name(T.transposeUp(t,'P5'))+' is a '+name(t)+' major chord in…',['root position','1st inversion','2nd inversion','3rd inversion'],'2nd inversion',{why:'The 5th in the bass = 2nd inversion.'});}),
  Y(10,()=>choice('In a 1st-inversion triad the bass note is the…',['root','3rd','5th','7th'],'3rd')),
  Y(10,()=>choice('In a 2nd-inversion triad the bass note is the…',['root','3rd','5th','7th'],'5th')),
  Y(12,()=>choice('A 7th chord in 3rd inversion has which note in the bass?',['root','3rd','5th','7th'],'7th')),
  Y(9,()=>{const t=pick(keyTonics(4));const sp=T.chord(t,'dom7').map(name).join(' ');return choice('Spell '+T.chordSym(t,'dom7')+' (dominant 7th).',optsFrom(sp,[T.chord(t,'maj7'),T.chord(t,'min7'),T.chord(t,'m7b5'),T.chord(t,'dom7')].map(c=>c.map(name).join(' ')),4),sp);}),
  Y(12,()=>{const t=pick(keyTonics(4));const sp=T.chord(t,'m7b5').map(name).join(' ');return choice('Spell '+name(t)+'ø7 (half-diminished).',optsFrom(sp,[T.chord(t,'maj7'),T.chord(t,'min7'),T.chord(t,'m7b5'),T.chord(t,'dim7'),T.chord(t,'dom7')].map(c=>c.map(name).join(' ')),4),sp);}),
  Y(8,()=>choice('The primary triads of a key are…',['I, IV and V','I, ii and iii','ii, iii and vi','I, V and vii°'],'I, IV and V')),
  Y(10,()=>choice('The secondary triads of a major key are…',['I, IV, V','ii, iii, vi (and vii°)','V7 and vii°','IV and V only'],'ii, iii, vi (and vii°)')),
  Y(12,()=>choice('A dominant 9th chord adds which interval above the root of a dominant 7th?',['a major 9th','a minor 9th','an octave','a major 6th'],'a major 9th')),
 ];return pickY(qs);}
function guitarChordQ(){const chords=[{nm:'C',fr:['x',3,2,0,1,0]},{nm:'G',fr:[3,2,0,0,0,3]},{nm:'D',fr:['x','x',0,2,3,2]},{nm:'A',fr:['x',0,2,2,2,0]},{nm:'E',fr:[0,2,2,1,0,0]},{nm:'Am',fr:['x',0,2,2,1,0]},{nm:'Em',fr:[0,2,2,0,0,0]},{nm:'Dm',fr:['x','x',0,2,3,1]},{nm:'F',fr:[1,3,3,2,1,1]},{nm:'E7',fr:[0,2,0,1,0,0]},{nm:'A7',fr:['x',0,2,0,2,0]},{nm:'D7',fr:['x','x',0,2,1,2]},{nm:'G7',fr:[3,2,0,0,0,1]},{nm:'B7',fr:['x',2,1,2,0,2]}];
  const c=pick(chords);const notes=c.fr.map((f,i)=>f==='x'?null:tabPitch(6-i,f)).filter(Boolean);const pcs=uniq(notes.map(p=>name(P(p.l,p.a,4))));
  return choice('Name the chord in this guitar chord diagram.',optsFrom(c.nm,chords.map(x=>x.nm),4),c.nm,{sub:'Strings low E to high E, left to right. ○ = open string, × = not played.',show:{svg:E.chordDiagram(c.fr).svg},why:'The sounding notes are '+pcs.join(' ')+', which spell '+c.nm+'.'});}
// ======================================================================
// UNIT 8 — HARMONY & PROGRESSIONS
// ======================================================================
function progChords(key,degs,seventh){return degs.map(d=>T.diatonicChord(key.tonic,key.mode,d,seventh));}
const PROGS=[[0,3,4,0],[0,4,5,3],[5,3,0,4],[0,5,1,4],[1,4,0,0],[0,2,3,4],[3,4,0,5],[0,5,3,4],[0,1,4,0],[0,3,0,4],[0,3,4],[0,4,0],[3,0,4,0],[0,0,3,4]];
const DEGOF={I:0,ii:1,iii:2,IV:3,V:4,vi:5};
const degsOn=()=>{const on=(S('progs')||[]).map(p=>DEGOF[p]).filter(d=>d!==undefined);return on.length?on:[0,3,4];};
const progsOn=()=>{const on=degsOn();const ok=PROGS.filter(p=>p.every(d=>on.includes(d)));return ok.length?ok:[[0,3,4,0]];};
function romanQ(){const k=randKey();const clef=clefPick();const degs=pick(progsOn());const ch=progChords(k,degs,false);
  const items=ch.map(c=>n(fitScale(T.chord(c.root,c.type,0),clef),'w'));
  const ans=ch.map(c=>c.rn).join(' – ');const dis=[];for(let i=0;i<10;i++){const d=pick(PROGS);dis.push(progChords(k,d,false).map(c=>c.rn).join(' – '));}
  return choice('Give the Roman numeral analysis of these chords in '+keyName(k)+'.',optsFrom(ans,uniq(dis),4),ans,{sub:'Root position. Upper case = major, lower case = minor, ° = diminished.',show:show(stave(clef,k.sig,null,items,{noBar:true})),why:ch.map(c=>c.rn+' = '+T.chordSym(c.root,c.type)).join(', ')+'.'});}
function chordNamesQ(){const k=randKey();const clef=clefPick();const degs=pick(progsOn());const ch=progChords(k,degs,false);
  const items=ch.map(c=>n(fitScale(T.chord(c.root,c.type,0),clef),'w'));
  const ans=ch.map(c=>T.chordSym(c.root,c.type)).join(' – ');const dis=[];for(let i=0;i<8;i++){const d=pick(PROGS);dis.push(progChords(k,d,false).map(c=>T.chordSym(c.root,c.type)).join(' – '));}
  return choice('Name these chords with chord symbols ('+keyName(k)+').',optsFrom(ans,uniq(dis),4),ans,{show:show(stave(clef,k.sig,null,items,{noBar:true})),why:ch.map(c=>T.chordSym(c.root,c.type)+' = '+T.chord(c.root,c.type,0).map(name).join(' ')+' ('+c.rn+')').join('; ')+'.'});}
function rnToChordQ(){const k=randKey();const d=pick(degsOn());const c=T.diatonicChord(k.tonic,k.mode,d,false);const ans=T.chordSym(c.root,c.type);
  const pool=[];for(let i=0;i<7;i++){const x=T.diatonicChord(k.tonic,k.mode,i,false);pool.push(T.chordSym(x.root,x.type));pool.push(T.chordSym(x.root,x.type==='maj'?'min':'maj'));}
  return choice('In '+keyName(k)+', chord '+c.rn+' is…',optsFrom(ans,uniq(pool),4),ans,{why:'Degree '+(d+1)+' of '+keyName(k)+' is '+name(c.root)+'; the scale-tone triad on it is '+T.CHORDS[c.type].name+'.'});}
function seventhRnQ(){const k=randKey();if(k.mode==='minor')return rnToChordQ();const d=rand(7);const c=T.diatonicChord(k.tonic,'major',d,true);const ans=T.chordSym(c.root,c.type);
  const pool=[];for(let i=0;i<7;i++){const x=T.diatonicChord(k.tonic,'major',i,true);pool.push(T.chordSym(x.root,x.type));}
  return choice('In '+keyName(k)+', the scale-tone 7th chord on degree '+(d+1)+' ('+c.rn+') is…',optsFrom(ans,uniq(pool.concat([T.chordSym(c.root,'dom7'),T.chordSym(c.root,'maj7'),T.chordSym(c.root,'min7')])),4),ans,{why:'Scale-tone 7ths in a major key: Imaj7 ii7 iii7 IVmaj7 V7 vi7 viiø7.'});}
function writeProgQ(){const k=randKey();const clef=clefPick();const degs=pick(progsOn().filter(p=>p.length<=4));const ch=progChords(k,degs,false);
  const items=ch.map((c,i)=>Object.assign(slot(i,fitScale(T.chord(c.root,c.type,0),clef),'w'),{chord:true,max:3}));
  return {t:'notate',prompt:'Write '+ch.map(c=>c.rn).join(' – ')+' in '+keyName(k)+'.',sub:clefWord(clef)+'. Root position block chords; use the key signature. Tap a column to add each note.',clef,sig:k.sig,items,anyOctaveChord:true,
    why:ch.map(c=>c.rn+' = '+T.chordSym(c.root,c.type)+' ('+T.chord(c.root,c.type,0).map(name).join(' ')+')').join('; ')+'.'};}
// pitch a list of note items from a 7-note scale, stepwise-ish, with the last notes forced (scale degrees, 0-based) so the phrase cadences properly
function pitchFromScale(notes,sc7,clef,opts){opts=opts||{};const pool=[];for(let o=-3;o<=3;o++)sc7.forEach((p,d)=>pool.push(Object.assign(up8(p,o),{deg:d})));
  const mid=MIDD[clef];let ok=pool.filter(p=>dia(p)>=mid-5&&dia(p)<=mid+5);ok.sort((a,b)=>dia(a)-dia(b));
  const endDegs=opts.end||[];const free=notes.length-endDegs.length;
  let cur=opts.start!==undefined?ok.find(p=>p.deg===opts.start)||ok[Math.floor(ok.length/2)]:ok[Math.floor(ok.length/2)];
  for(let i=0;i<free;i++){if(i>0){const idx=ok.findIndex(p=>dia(p)===dia(cur));let j=idx+pick([-2,-1,-1,1,1,2,3,-3]);if(j<0)j=idx+1;if(j>=ok.length)j=idx-1;cur=ok[Math.max(0,Math.min(ok.length-1,j))];}notes[i].p=[P(cur.l,cur.a,cur.o)];}
  // forced ending: each forced degree is placed nearest the previous note
  endDegs.forEach((d,k)=>{const cands=ok.filter(p=>p.deg===d);const near=cands.slice().sort((x,y)=>Math.abs(dia(x)-dia(cur))-Math.abs(dia(y)-dia(cur)))[0]||cands[0];cur=near;notes[free+k].p=[P(cur.l,cur.a,cur.o)];});
  return notes;}
function modulationQ(){const t=pick(keyTonics(Math.min(S('keysMax'),4)));const clef=pick(['treble','bass']);const target=pick(UPTO()>=12?['dominant','subdominant','relative minor']:UPTO()>=11?['dominant','relative minor','relative minor']:['relative minor']);
  const sig=T.sigOf(t,'major');
  let newTonic,newScale,ansKey,why,acc;
  if(target==='dominant'){newTonic=T.transposeUp(t,'P5');newScale=T.scale(newTonic,'major').slice(0,7);acc=newScale[6];ansKey=name(newTonic)+' major';why='The raised 4th of the home key ('+name(acc)+') is the leading note of the dominant, and the last bar cadences V–I in '+ansKey+'.';}
  else if(target==='subdominant'){newTonic=T.transposeUp(t,'P4');newScale=T.scale(newTonic,'major').slice(0,7);acc=newScale[3];ansKey=name(newTonic)+' major';why='The flattened 7th of the home key ('+name(acc)+') is the 4th degree of the subdominant, and the last bar cadences V–I in '+ansKey+'.';}
  else{newTonic=T.relMinor(t);newScale=T.scale(newTonic,'harmminor').slice(0,7);acc=newScale[6];ansKey=name(newTonic)+' minor';why='The raised leading note of the relative minor ('+name(acc)+') appears, and the last bar cadences V–i in '+ansKey+'.';}
  // 4 bars: bars 1–2 in the home key, bars 3–4 in the new key ending 5 – 7 – 1 (dominant, leading note, tonic)
  const items=rhythmItems('4/4',4,patsFor('4/4').filter(p=>p.length>=2&&!p.some(x=>x[0].startsWith('r_'))));
  const bars=[];let cur=[];items.forEach(it=>{if(it.k==='bar'){bars.push(cur);cur=[];}else if(it.k==='n')cur.push(it);});
  const first=bars[0].concat(bars[1]),second=bars[2].concat(bars[3]);
  pitchFromScale(first,T.scale(t,'major').slice(0,7),clef,{start:0});
  if(second.length<4)return modulationQ();
  pitchFromScale(second,newScale,clef,{end:[4,6,0]});
  // make sure the characteristic note is heard before the cadence too
  const accDeg=newScale.indexOf(acc);const early=second.slice(0,second.length-3);if(!early.some(n=>n.p[0].l===acc.l&&n.p[0].a===acc.a)&&early.length){const target2=early[Math.floor(early.length/2)];const nearest=[-1,0,1].map(o=>P(acc.l,acc.a,target2.p[0].o+o)).sort((x,y)=>Math.abs(dia(x)-dia(target2.p[0]))-Math.abs(dia(y)-dia(target2.p[0])))[0];target2.p=[nearest];}
  E.autoBeam(items,[4,4]);
  const pool=[name(T.transposeUp(t,'P5'))+' major',name(T.transposeUp(t,'P4'))+' major',name(T.relMinor(t))+' minor',name(t)+' minor'];
  return choice('This melody begins in '+name(t)+' major. By the final cadence it has modulated to…',optsFrom(ansKey,pool,4),ansKey,{sub:'Look for the new accidental in bars 3–4 and the key the last bar cadences in.',show:show(stave(clef,sig,[4,4],items)),why});}
function harmonyFactQ(){const qs=[
  Y(8,()=>choice('In Roman numeral analysis, a lower-case numeral means…',['a major chord','a minor chord','a diminished chord','a 7th chord'],'a minor chord')),
  Y(10,()=>choice('The ° sign after a Roman numeral (vii°) means…',['dominant','diminished','dotted','augmented'],'diminished')),
  Y(10,()=>choice('In a major key the scale-tone triads are…',['I ii iii IV V vi vii°','i ii° III iv V VI vii°','I II III IV V VI VII','I ii iii IV V vi vii'],'I ii iii IV V vi vii°')),
  Y(9,()=>choice('In a minor key, chord V is made major by…',['raising the leading note (the 7th degree)','lowering the 3rd','adding a 7th','raising the tonic'],'raising the leading note (the 7th degree)')),
  Y(9,()=>choice('"Modulation" means…',['changing key within a piece','changing tempo','changing dynamics','changing time signature'],'changing key within a piece')),
  Y(11,()=>choice('The most common modulation from a major key is to the…',['dominant','tritone','minor 2nd','parallel minor'],'dominant')),
  Y(7,()=>choice('A pedal note is…',['a sustained or repeated bass note held under changing harmony','a note played with the foot','the top note of a chord','a trill in the bass'],'a sustained or repeated bass note held under changing harmony')),
  Y(8,()=>choice('A 12-bar blues in C uses chords…',['C, F and G (I, IV and V)','C, Dm and Em','C, Am and F','C and G only'],'C, F and G (I, IV and V)',{why:'12-bar blues: I I I I | IV IV I I | V IV I I (or V7 in the last bar as a turnaround).'})),
  Y(8,()=>choice('In a 12-bar blues the chord in bars 5–6 is…',['I','IV','V','vi'],'IV')),
  Y(8,()=>{const t=pick(keyTonics(4));const c=T.diatonicChord(t,'major',3,false);return choice('The primary triads of '+name(t)+' major are…',optsFrom([0,3,4].map(d=>T.chordSym(T.diatonicChord(t,'major',d,false).root,'maj')).join(', '),[[0,1,2],[1,2,5],[0,3,4],[0,4,5]].map(ds=>ds.map(d=>{const x=T.diatonicChord(t,'major',d,false);return T.chordSym(x.root,x.type);}).join(', ')),4),[0,3,4].map(d=>T.chordSym(T.diatonicChord(t,'major',d,false).root,'maj')).join(', '));}),
  Y(9,()=>matchFrom('Match each cadence to its chords.',[['perfect','V – I'],['plagal','IV – I'],['imperfect','(any) – V'],['interrupted','V – vi']],4)),
  Y(12,()=>choice('In a harmonic-minor key, the triad on the 3rd degree (III+) is…',['major','minor','augmented','diminished'],'augmented',{why:'The raised 7th sits a major 3rd above the 5th degree: III becomes III+ (augmented). Most analysis uses the natural-minor III (major) instead.'})),
  Y(11,()=>{return choice('A ii – V – I progression in F major is…',['Gm7 – C7 – Fmaj7','G7 – C7 – F7','Gm7 – Cm7 – Fmaj7','Dm7 – G7 – Cmaj7'],'Gm7 – C7 – Fmaj7');}),
 ];return pickY(qs);}
// ======================================================================
// UNIT 9 — TRANSPOSITION
// ======================================================================
const instrOn=()=>{const ids=S('instruments');const l=T.INSTR.filter(i=>ids.includes(i.id));return l.length?l:[T.INSTR[0]];};
function instrFactQ(){const ins=pick(instrOn());const qs=[
  ()=>choice('A '+ins.name+' sounds how far from the written note?',optsFrom('a '+T.ivWord(ins.iv)+' lower',['a major 2nd lower','a major 2nd higher','a perfect 5th lower','a major 6th lower','a minor 3rd lower','a major 9th lower','a major 13th lower','a perfect 4th lower'],4),'a '+T.ivWord(ins.iv)+' lower',{why:ins.name+' is in '+ins.key+': written C sounds '+ins.key+(ins.iv.endsWith('9')||ins.iv.endsWith('13')?' (an octave lower again)':'')+'.'}),
  ()=>{const w=pick(['C','D','E','F','G','A','B♭']);const wp=parse(w.replace('♭','b')+'4');const c=T.toConcert(wp,ins);const ans=name(c);
     const pool=['C','D','E','F','G','A','B','B♭','E♭','A♭','D♭','F♯','C♯','G♯'];return choice(an(ins.name).replace(/^a/,'A')+' plays a written '+w+'. The concert pitch is…',optsFrom(ans,pool,4),ans,{why:'The instrument sounds a '+T.ivWord(ins.iv)+' below what is written: '+w+' → '+ans+'.'});},
  ()=>{const c=pick(['C','D','E','F','G','A','B♭','E♭']);const cp=parse(c.replace('♭','b')+'4');const w=T.toWritten(cp,ins);const ans=name(w);
     const pool=['C','D','E','F','G','A','B','B♭','E♭','A♭','D♭','F♯','C♯','G♯','D♯','A♯'];return choice('To make '+an(ins.name)+' sound concert '+c+', you write…',optsFrom(ans,pool,4),ans,{why:'Write a '+T.ivWord(ins.iv)+' ABOVE the concert pitch: '+c+' → '+ans+'.'});},
  ()=>{const t=pick(keyTonics(4));const w=T.toWritten(t,ins);const sig=T.sigOf(w,'major');if(sig===null||Math.abs(sig)>7)return null;const ans=name(w)+' major ('+T.sigWord(sig)+')';
     const pool=keyTonics(7).map(x=>name(x)+' major ('+T.sigWord(T.sigOf(x,'major'))+')');return choice('Concert key '+name(t)+' major. The written key for '+ins.name+' is…',optsFrom(ans,pool,4),ans,{why:'Transpose the key up a '+T.ivWord(ins.iv)+(ins.iv.endsWith('9')||ins.iv.endsWith('13')?' (the key only moves by the simple interval)':'')+': '+name(t)+' → '+name(w)+'.'});},
  ()=>choice('To write a part for a transposing instrument from concert pitch, you transpose…',['UP by the interval the instrument sounds down','DOWN by the interval the instrument sounds down','up an octave','to the relative minor'],'UP by the interval the instrument sounds down'),
  ()=>choice('When transposing a melody to a new key you must change…',['the key signature AND every accidental, keeping the interval exact','only the key signature','only the first note','the time signature'],'the key signature AND every accidental, keeping the interval exact'),
  ()=>choice('Moving a melody up an octave changes…',['the register only: letter names and key signature stay the same','the key signature','the letter names','the rhythm'],'the register only: letter names and key signature stay the same'),
  ()=>choice('Which instruments are written in B♭?',['trumpet, clarinet, tenor and soprano saxophone','alto and baritone saxophone','French horn','flute and oboe'],'trumpet, clarinet, tenor and soprano saxophone'),
  ()=>choice('Which instruments are written in E♭?',['trumpet and clarinet','alto and baritone saxophone','French horn','violin and piano'],'alto and baritone saxophone'),
 ];return pickY(qs);}
function transposeMelodyQ(){const ins=pick(instrOn());const t=pick(keyTonics(3));const key={tonic:t,mode:'major'};const sig=T.sigOf(t,'major');
  const wTonic=T.toWritten(t,ins);const wSig=T.sigOf(P(wTonic.l,wTonic.a,4),'major');if(wSig===null||Math.abs(wSig)>7)return transposeMelodyQ();
  const simple={M9:'M2',M13:'M6'}[ins.iv]||ins.iv;
  // choose the concert register so the WRITTEN part still sits on the stave: cap the concert melody by the interval it will move up
  const stepsUp=T.parseIv(simple).n-1;const mid=MIDD.treble;
  const given=melody(key,'treble','4/4',S('slotBars')||2,{lo:mid-6,hi:mid+6-stepsUp});
  const items=[];let si=0;given.forEach(it=>{if(it.k==='n'){const tp=T.transposeUp(it.p[0],simple);items.push(Object.assign(slot(si++,[tp],it.dur,{dots:it.dots,beam:it.beam,tie:it.tie}),{}));}else items.push(Object.assign({},it));});
  return {t:'notate',prompt:'Transpose this melody for '+ins.name+'.',sub:'Concert pitch is shown above. Write the key signature of the new key with the ♯/♭ buttons, then place each note. Rhythm is given.'+(simple!==ins.iv?' (Write the simple interval up; register matches the concert part.)':''),clef:'treble',sig:0,time:[4,4],keysigEdit:true,sigTarget:wSig,items,show:show(stave('treble',sig,[4,4],given)),
    why:'The '+ins.name+' sounds a '+T.ivWord(ins.iv)+' lower, so write every note a '+T.ivWord(simple)+' higher: '+name(t)+' major becomes '+name(wTonic)+' major ('+T.sigWord(wSig)+').'};}
function clefTransposeQ(){const from=pick(['treble','bass']);const toC=pick(S('clefs').filter(c=>c!==from));if(!toC)return octaveQ();const t=pick(keyTonics(3));const key={tonic:t,mode:'major'};const sig=T.sigOf(t,'major');
  const given=melody(key,from,'3/4',2);
  const items=[];let si=0;given.forEach(it=>{if(it.k==='n'){let p=it.p[0];const [lo,hi]=RANGE[toC];let q=p;while(dia(q)>hi)q=up8(q,-1);while(dia(q)<lo)q=up8(q);items.push(Object.assign(slot(si++,[q],it.dur,{dots:it.dots,beam:it.beam,tie:it.tie}),{anyOctave:true}));}else items.push(Object.assign({},it));});
  return {t:'notate',prompt:'Rewrite this melody in the '+toC+' clef (same pitches).',sub:'The key signature is already written. Keep every letter name; any octave is accepted.',clef:toC,sig:sig,time:[3,4],items,show:show(stave(from,sig,[3,4],given)),why:'Find each note\'s letter name in the new clef; pitches do not change, only where they sit on the stave.'};}
function octaveQ(){const clef=pick(['treble','bass']);const t=pick(keyTonics(3));const key={tonic:t,mode:'major'};const sig=T.sigOf(t,'major');const up=Math.random()<0.5;const mid=MIDD[clef];
  // keep the answer within the writable range: originals sit on the far side of the stave from the answer
  const given=melody(key,clef,'2/4',2,up?{lo:mid-8,hi:mid-1}:{lo:mid+1,hi:mid+8});
  const items=[];let si=0;given.forEach(it=>{if(it.k==='n')items.push(slot(si++,[up8(it.p[0],up?1:-1)],it.dur,{dots:it.dots,beam:it.beam,tie:it.tie}));else items.push(Object.assign({},it));});
  return {t:'notate',prompt:'Transpose this melody '+(up?'up':'down')+' one octave.',sub:'Same clef and key signature. Rhythm is given: place each pitch exactly one octave '+(up?'higher':'lower')+'. Ledger lines are expected.',clef,sig,time:[2,4],items,show:show(stave(clef,sig,[2,4],given)),why:'Octave transposition keeps every letter name; only the register changes.'};}
function concertNoteQ(){const ins=pick(instrOn());let w,c,tries=0;do{w=inClef(pick(T.scale(pick(keyTonics(3)),'major').slice(0,7)),'treble',pick([0,2,4]));c=T.toConcert(w,ins);}while((dia(c)<RANGE.treble[0]||dia(w)>RANGE.treble[1])&&tries++<40);if(dia(c)<RANGE.treble[0])return instrFactQ();
  return {t:'notate',prompt:an(ins.name).replace(/^a/,'A')+' plays this written note. Write the concert pitch.',sub:'Treble clef. Exact octave: the instrument sounds a '+T.ivWord(ins.iv)+' lower.',clef:'treble',sig:0,items:[slot(0,[c],'w')],show:show(stave('treble',0,null,[n([w],'w',{showAcc:true})])),why:name(w)+' down a '+T.ivWord(ins.iv)+' = '+spn(c)+'.'};}
// ======================================================================
// UNIT 10 — FORM, SIGNS & DEVICES
// ======================================================================
const FORMS=[['binary','AB: two contrasting sections',7],['ternary','ABA: a return to the opening after a contrast',7],['rondo','ABACA: a recurring main theme between episodes',7],['verse–chorus','alternating verses with a repeated chorus',7],['call and response','a phrase answered by a different phrase or part',7],['12-bar blues','a 12-bar chord pattern on I, IV and V',8],['theme and variations','a theme, then altered versions of it',8],['bridge (middle 8)','a contrasting section that links back to the chorus or main theme',8],['AABA (32-bar song form)','two statements, a bridge, then the theme returns',11],['strophic','the same music for every verse',10],['through-composed','continuously new music, no repeated sections',10],['sonata form','exposition – development – recapitulation',11]];
const SIGNS=[['D.C. (da capo)','go back to the beginning'],['D.S. (dal segno)','go back to the sign 𝄋'],['D.C. al Fine','go back to the beginning and play to "Fine"'],['D.S. al Coda','go back to the sign, play to the "To Coda" mark, then jump to the Coda'],['Fine','the end'],['Coda 𝄌','a tail section that ends the piece'],['fermata (pause)','hold the note or rest longer than written'],['repeat signs','play the section between the dotted bar lines again'],['1st and 2nd time bars','play the 1st ending on the first time, skip to the 2nd ending on the repeat'],['segue / attacca','go straight on to the next section without a break']];
const DEV=[['ostinato / riff','a short pattern repeated over and over',7],['pedal / drone','a sustained or repeated note (usually bass) under changing harmony',7],['sequence','a motif repeated at a higher or lower pitch',8],['call and response','a phrase answered by a different phrase or part',7],['imitation','a motif copied by another voice or part shortly after',11],['inversion','the melody turned upside-down (intervals reversed)',10],['augmentation','the note values lengthened (often doubled)',10],['diminution','the note values shortened (often halved)',10],['rhythmic motif','a short rhythmic idea that is developed through a piece',10]];
const TEX=[['monophonic','a single melody line (it may be doubled or harmonised in block parallel)',7],['homophonic','a melody with accompaniment, or chords moving together',7],['polyphonic','two or more independent melodies at once',9],['descant / counter-melody','a second melody sounding above or against the main tune',8]];
function formQ(){const qs=[
  Y(7,()=>matchFrom('Match each form to its description.',FORMS,4)),
  Y(11,()=>matchFrom('Match each sign or term to its meaning.',SIGNS,4)),
  Y(8,()=>matchFrom('Match each compositional device to its meaning.',DEV,4)),
  Y(7,()=>matchFrom('Match each texture to its description.',TEX,4)),
  Y(7,()=>{const f=pick(byYear(FORMS));return choice('"'+f[0]+'" is…',optsFrom(f[1],FORMS.map(x=>x[1]),4),f[1]);}),
  Y(11,()=>{const f=pick(SIGNS);return choice('"'+f[0]+'" means…',optsFrom(f[1],SIGNS.map(x=>x[1]),4),f[1]);}),
  Y(8,()=>{const f=pick(byYear(DEV));return choice('Which device is this: "'+f[1]+'"?',optsFrom(f[0],DEV.map(x=>x[0]),4),f[0]);}),
  ()=>{const f=pick(byYear(TEX).filter(x=>x[0]!=='descant / counter-melody'));return choice('A piece with '+f[1]+' has which texture?',byYear(TEX).map(x=>x[0]),f[0]);},
  Y(7,()=>choice('A singer accompanied by strummed guitar chords is…',['monophonic','homophonic','polyphonic'],'homophonic')),
  Y(9,()=>choice('A fugue, with several independent melodic lines, is…',['monophonic','homophonic','polyphonic'],'polyphonic')),
  Y(7,()=>choice('An unaccompanied solo flute line is…',['monophonic','homophonic','polyphonic'],'monophonic')),
  Y(7,()=>choice('A choir singing a hymn in block chords, all parts moving together, is…',['monophonic','homophonic','polyphonic'],'homophonic')),
  Y(9,()=>choice('A round (canon), where each voice enters with the same tune in turn, is…',['monophonic','homophonic','polyphonic'],'polyphonic')),
  Y(7,()=>choice('Most pop and rock songs are in…',['verse–chorus form','sonata form','rondo form','binary form'],'verse–chorus form')),
  Y(11,()=>choice('The three main sections of sonata form are…',['exposition, development, recapitulation','verse, chorus, bridge','A, B, A','theme, variation, coda'],'exposition, development, recapitulation')),
  Y(7,()=>choice('A piece in rondo form could be…',['ABACA','AB','AABA','ABAB'],'ABACA')),
  Y(8,()=>choice('The "B" section of AABA form is often called the…',['bridge (or middle 8)','coda','exposition','verse'],'bridge (or middle 8)')),
 ];return pickY(qs);}
function signRenderQ(){const kind=pick(UPTO()>=11?['repeat','volta','fermata','dcfine','dscoda']:['repeat','volta','fermata']);let items,ans,txt;
  const q=p=>n([parse(p)],'q');
  if(kind==='repeat'){items=[{k:'rep',dir:'start'},q('G4'),q('A4'),q('B4'),q('C5'),bar(),q('D5'),q('C5'),n([parse('B4')],'h'),{k:'rep',dir:'end'}];ans='play the section between the repeat signs twice';}
  else if(kind==='volta'){items=[q('G4'),q('A4'),q('B4'),q('C5'),bar(),Object.assign(q('D5'),{volta:1}),n([parse('B4')],'h',{}),q('A4'),{k:'rep',dir:'end'},Object.assign(q('D5'),{volta:2}),n([parse('G4')],'h',{dots:1}),fin()];ans='play the 1st-time bar first, then on the repeat skip it and play the 2nd-time bar';}
  else if(kind==='fermata'){items=[q('G4'),q('A4'),n([parse('B4')],'h',{art:['fermata']}),fin()];ans='hold the last note longer than its written value';}
  else if(kind==='dcfine'){items=[q('G4'),q('A4'),n([parse('B4')],'h'),bar(),{k:'txt',s:'Fine',italic:true},q('A4'),q('G4'),n([parse('G4')],'h'),bar(),q('D5'),q('C5'),n([parse('B4')],'h'),{k:'txt',s:'D.C. al Fine',italic:true,anchor:'end'},fin()];ans='go back to the beginning and play until "Fine"';}
  else{items=[{k:'sym',g:'segno'},q('G4'),q('A4'),n([parse('B4')],'h'),bar(),q('A4'),q('G4'),n([parse('G4')],'h'),{k:'sym',g:'coda'},bar(),q('D5'),q('C5'),n([parse('B4')],'h'),{k:'txt',s:'D.S. al Coda',italic:true,anchor:'end'},fin()];ans='go back to the sign, play to the coda mark, then jump to the Coda';}
  E.autoBeam(items,[4,4]);
  return choice('What do the signs in this passage tell the performer to do?',optsFrom(ans,['play the section between the repeat signs twice','play the 1st-time bar first, then on the repeat skip it and play the 2nd-time bar','hold the last note longer than its written value','go back to the beginning and play until "Fine"','go back to the sign, play to the coda mark, then jump to the Coda','go straight on without a break'],4),ans,{show:show(stave('treble',0,[4,4],items))});}
function deviceRenderQ(){const kind=pick(['ostinato','pedal'].concat(UPTO()>=8?['sequence']:[],UPTO()>=10?['augmentation','diminution','inversion']:[]));const q=(p,d,x)=>n([parse(p)],d||'q',x);let items,ans,why;
  if(kind==='sequence'){items=[q('C5','e'),q('D5','e'),q('E5','e'),q('C5','e'),q('D5','e'),q('E5','e'),q('F5','e'),q('D5','e'),bar(),q('E5','e'),q('F5','e'),q('G5','e'),q('E5','e'),q('F5','h'),fin()];ans='sequence';why='The same motif is repeated, each time a step higher.';}
  else if(kind==='ostinato'){items=[q('G4','e'),q('A4','e'),q('G4','q'),q('G4','e'),q('A4','e'),q('G4','q'),bar(),q('G4','e'),q('A4','e'),q('G4','q'),q('G4','e'),q('A4','e'),q('G4','q'),fin()];ans='ostinato (riff)';why='The same short pattern repeats continuously.';}
  else if(kind==='augmentation'){items=[q('G4','e'),q('A4','e'),q('B4','e'),q('C5','e'),q('D5','h'),bar(),q('G4','q'),q('A4','q'),q('B4','q'),q('C5','q'),bar(),q('D5','w'),fin()];ans='augmentation';why='The motif returns with its note values doubled.';}
  else if(kind==='diminution'){items=[q('G4','q'),q('A4','q'),q('B4','q'),q('C5','q'),bar(),q('D5','h'),q('G4','e'),q('A4','e'),q('B4','e'),q('C5','e'),bar(),q('D5','w'),fin()];ans='diminution';why='The motif returns with its note values halved.';}
  else if(kind==='inversion'){items=[q('G4','q'),q('A4','q'),q('B4','q'),q('D5','q'),bar(),q('G4','q'),q('F4','q'),q('E4','q'),q('C4','q'),fin()];ans='inversion';why='Bar 2 turns bar 1 upside-down: each interval goes the opposite direction.';}
  else{items=[n([parse('C4'),parse('E4'),parse('G4')],'h'),n([parse('C4'),parse('F4'),parse('A4')],'h'),bar(),n([parse('C4'),parse('D4'),parse('G4')],'h'),n([parse('C4'),parse('E4'),parse('G4')],'h'),fin()];ans='pedal';why='The bass note C is held while the chords above it change.';}
  E.autoBeam(items,[4,4]);
  return choice('Which compositional device is shown here?',optsFrom(ans,['sequence','ostinato (riff)','augmentation','diminution','inversion','pedal','imitation'],4),ans,{show:show(stave('treble',0,[4,4],items)),why});}
// ======================================================================
// ADDITIONAL NOTATION QUESTIONS (write-on-the-stave) — cadences, figures, degrees, key transposition, ornaments
// ======================================================================
const cadencesOn=()=>{const on=S('cadences')||[];const list=T.CADENCES.filter(c=>on.includes(c.name));return list.length?list:T.CADENCES.slice(0,2);};
const figL=inv=>inv?T.INV_LETTER[inv]:'';
function writeCadenceQ(){const k=randKey();const clef=clefPick();const cad=pick(cadencesOn());
  const ch=cad.degs.map(d=>T.diatonicChord(k.tonic,k.mode,d,false));
  const items=[];ch.forEach((c,i)=>{items.push(Object.assign(slot(i,fitScale(T.chord(c.root,c.type,0),clef),'h'),{chord:true,max:3}));});items.push(fin());
  const label=ch.map(c=>c.rn).join(' – ');
  return {t:'notate',prompt:'Write '+an(cad.name)+' cadence ('+label+') in '+keyName(k)+'.',sub:clefWord(clef)+'. Two root-position block chords, minims; use the key signature'+(k.mode==='minor'&&ch.some(c=>c.deg===4||c.deg===6)?' and remember the raised leading note in chord V':'')+'. Any voicing of the right notes is accepted.',clef,sig:k.sig,time:[4,4],items,anyOctaveChord:true,
    why:cad.name[0].toUpperCase()+cad.name.slice(1)+' cadence = '+label+': '+ch.map(c=>c.rn+' = '+T.chordSym(c.root,c.type)+' ('+T.chord(c.root,c.type,0).map(name).join(' ')+')').join('; ')+'.'};}
function cadenceIdQ(){const k=randKey();const clef=pick(['treble','bass']);const cad=pick(cadencesOn());
  const ch=cad.degs.map(d=>T.diatonicChord(k.tonic,k.mode,d,false));
  const items=ch.map(c=>n(fitScale(T.chord(c.root,c.type,0),clef),'h'));items.push(fin());
  const names=['perfect','plagal','imperfect','interrupted'];
  return choice('Name the cadence formed by these two chords in '+keyName(k)+'.',optsFrom(cad.name,names,4),cad.name,{sub:'Work out the Roman numeral of each chord first.',show:show(stave(clef,k.sig,[4,4],items)),why:ch.map(c=>c.rn).join(' – ')+' is '+an(cad.name)+' cadence.'});}
function figureQ(){ // name a chord in a key with inversion letter, or write one
  const k=randKey();const clef=clefPick();const d=pick(degsOn());const inv=pick(invsOn().filter(i=>i<3));const c=T.diatonicChord(k.tonic,k.mode,d,false);
  let notes=fitScale(T.chord(c.root,c.type,inv),clef);
  const fig=c.rn+figL(inv);
  if(Math.random()<0.55){ // write it
    return {t:'notate',prompt:'Write chord '+fig+' in '+keyName(k)+'.',sub:clefWord(clef)+'. Use the key signature. '+(inv?T.INV_LETTER[inv]+' = ':'No letter = ')+T.INV_NAMES[inv]+': the bass note must be the '+(['root','3rd','5th'][inv])+'; the other notes may sit in any octave above it.',clef,sig:k.sig,items:[Object.assign(slot(0,notes,'w'),{chord:true,max:3,bassCheck:true})],
      why:fig+' = '+T.chordSym(c.root,c.type)+' ('+T.chord(c.root,c.type,0).map(name).join(' ')+') with '+name(notes[0])+' in the bass.'};}
  const pool=[];[0,1,2,3,4,5].forEach(dd=>[0,1,2].forEach(ii=>pool.push(T.diatonicChord(k.tonic,k.mode,dd,false).rn+figL(ii))));
  return choice('Identify this chord in '+keyName(k)+' (Roman numeral + inversion letter).',optsFrom(fig,pool,4),fig,{sub:'No letter = root position, b = 1st inversion, c = 2nd inversion. Stack the notes in 3rds to find the root, then look at the bass note.',show:show(stave(clef,k.sig,null,[n(notes,'w')])),why:'The notes are '+T.chord(c.root,c.type,0).map(name).join(' ')+' = '+T.chordSym(c.root,c.type)+' = '+c.rn+'; bass note '+name(notes[0])+' → '+(inv?T.INV_LETTER[inv]:'root position')+'.'});}
function degreeNotateQ(){const k=randKey();const clef=clefPick();const d=rand(7);const sc=k.mode==='minor'?T.scale(k.tonic,'harmminor'):T.scale(k.tonic,'major');const p=inClef(sc[d],clef);
  const useSig=Math.random()<0.5;
  return {t:'notate',prompt:'Write the '+T.DEG_NAMES[d]+' of '+keyName(k)+'.',sub:clefWord(clef)+'. '+(useSig?'Key signature given.':'No key signature: add any accidental the note needs.')+' Any octave.'+(k.mode==='minor'&&d===6?' (Minor keys: the leading note is raised.)':''),clef,sig:useSig?k.sig:0,items:[slot(0,[p],'w',{anyOctave:true})],
    why:'Degree '+(d+1)+' of '+keyName(k)+' is '+name(sc[d])+'.'+(k.mode==='minor'&&d===6?' In a minor key the leading note is the raised 7th (harmonic minor).':'')+' Sol-fa: '+(k.mode==='minor'?(d===6?'si (the raised so)':SOLFA_MIN[d]+' (la-based minor)'):SOLFA_MAJ[d])+'.'};}
function transposeKeyQ(){const t=pick(keyTonics(Math.min(S('keysMax'),4)));const clef=clefPick();const iv=pick([['M2','up'],['m3','up'],['P4','up'],['P5','up'],['M2','down'],['m3','down'],['P4','down'],['M3','up'],['m3','down']]);
  const t2=iv[1]==='up'?T.transposeUp(t,iv[0]):T.transposeDown(t,iv[0]);const sig2=T.sigOf(P(t2.l,t2.a,4),'major');if(sig2===null||Math.abs(sig2)>S('keysMax'))return transposeKeyQ();
  const key={tonic:t,mode:'major'};const sig=T.sigOf(t,'major');const mid=MIDD[clef];const steps=T.parseIv(iv[0]).n-1;
  const given=melody(key,clef,'3/4',2,iv[1]==='up'?{lo:mid-6,hi:mid+6-steps}:{lo:mid-6+steps,hi:mid+6});
  const items=[];let si=0;given.forEach(it=>{if(it.k==='n'){const tp=iv[1]==='up'?T.transposeUp(it.p[0],iv[0]):T.transposeDown(it.p[0],iv[0]);items.push(slot(si++,[tp],it.dur,{dots:it.dots,beam:it.beam,tie:it.tie}));}else items.push(Object.assign({},it));});
  return {t:'notate',prompt:'Transpose this melody '+iv[1]+' '+an(T.ivWord(iv[0]))+' into '+name(t2)+' major.',sub:clefWord(clef)+'. Build the new key signature with the ♯/♭ buttons, then place each note the same interval '+iv[1]+'. Rhythm is given.',clef,sig:0,time:[3,4],keysigEdit:true,sigTarget:sig2,items,show:show(stave(clef,sig,[3,4],given)),
    why:name(t)+' major '+iv[1]+' '+an(T.ivWord(iv[0]))+' = '+name(t2)+' major ('+T.sigWord(sig2)+'). Every note moves the same interval, so the letter names all shift by '+steps+'.'};}
function ornamentQ(){const kinds=[['trill','trill: rapid alternation with the note above'],['mordent','mordent: a quick turn to the note below (or above) and back'],['turn','turn: the note above, the note, the note below, the note'],['grace','acciaccatura: a crushed grace note before the main note']];
  const kind=pick(S('ext')?kinds:kinds.slice(0,3));const items=[n([parse('G4')],'q'),{k:'gap',w:kind[0]==='grace'?1.4:0.3},n([parse('A4')],'q',{art:[kind[0]]}),n([parse('B4')],'h'),fin()];
  return choice('Name the ornament on the 2nd note.',optsFrom(kind[1],kinds.map(x=>x[1]).concat(['tremolo: rapid repetition of the note']),4),kind[1],{show:show(stave('treble',0,[4,4],items))});}
function drumLegend(){const hh=Object.assign(P('G',0,5),{x:1}),sn=P('C',0,5),kk=P('F',0,4);
  const one=(p,lab)=>`<div class="lgitem">${E.render(stave('perc',0,null,[n([p],'q',{stem:'up'}),{k:'gap',w:0.4}]),{tight:true}).svg}<span>${lab}</span></div>`;
  return `<div class="legend"><span class="lab">Legend</span>${one(hh,'hi-hat')}${one(sn,'snare')}${one(kk,'bass (kick) drum')}</div>`;}
function drumReadQ(){const hh=()=>Object.assign(P('G',0,5),{x:1}),sn=()=>P('C',0,5),kk=()=>P('F',0,4);
  const styles=[{nm:'rock',pat:[[1,0,1],[1,0,0],[1,1,0],[1,0,0],[1,0,1],[1,0,1],[1,1,0],[1,0,0]],kicks:'1 and 3',snares:'2 and 4'},
    {nm:'four on the floor',pat:[[1,0,1],[1,0,0],[1,1,1],[1,0,0],[1,0,1],[1,0,0],[1,1,1],[1,0,0]],kicks:'every beat (1, 2, 3, 4)',snares:'2 and 4'},
    {nm:'half-time',pat:[[1,0,1],[1,0,0],[1,0,0],[1,0,0],[1,1,0],[1,0,0],[1,0,0],[1,0,0]],kicks:'1 only',snares:'3 only'}];
  const st=pick(styles);const pat=st.pat.map(([h,s,k])=>{const ps=[];if(k)ps.push(kk());if(s)ps.push(sn());if(h)ps.push(hh());return n(ps,'e',{stem:'up'});});pat.push(fin());E.autoBeam(pat,[4,4]);
  const askK=Math.random()<0.5;const ans=askK?st.kicks:st.snares;
  const pool=askK?['1 and 3','every beat (1, 2, 3, 4)','1 only','2 and 4','1 and 4']:['2 and 4','3 only','1 and 3','every beat (1, 2, 3, 4)','2 only'];
  return choice('On which beats does the '+(askK?'bass (kick) drum':'snare drum')+' play?',optsFrom(ans,pool,4),ans,{sub:'4/4, quavers. Read the legend, then count the quavers in pairs.',show:show(stave('perc',0,[4,4],pat)),legend:drumLegend(),why:'This is a '+st.nm+' groove: kick on '+st.kicks+', snare on '+st.snares+'.'});}
function chordSymbolExtQ(){const rows=[['sus4','sus4'],['sus2','sus2'],['6','maj6'],['m6','min6'],['7sus4','dom7s4'],['°7','dim7'],['ø7','m7b5'],['∆7','maj7'],['−7','min7'],['+','aug']].filter(x=>chordsOn().includes(x[1])||['sus4','dom7s4'].includes(x[1]));
  if(!rows.length)return chordSymbolQ();const r0=pick(rows);const root=pick(['C','D','E♭','F','G','A','B♭']);const rp=parse(root.replace('♭','b')+'4');
  const sp=T.chord(rp,r0[1]).map(name).join(' ');const pool=Object.keys(T.CHORDS).map(k=>T.chord(rp,k).map(name).join(' '));
  return choice('Spell the chord '+root+r0[0]+'.',optsFrom(sp,pool,4),sp,{why:root+r0[0]+' = '+root+' '+T.CHORDS[r0[1]].name+': '+sp+'.'+(r0[1].startsWith('sus')?' A suspended chord replaces the 3rd with the 4th (or 2nd).':r0[1].endsWith('6')?' A 6th chord adds the 6th above the root to the triad.':'')});}
function seventhRnMinorQ(){const k=randKey();const d=rand(7);const c=T.diatonicChord(k.tonic,k.mode,d,true);const ans=T.chordSym(c.root,c.type);
  const pool=[];for(let i=0;i<7;i++){const x=T.diatonicChord(k.tonic,k.mode,i,true);pool.push(T.chordSym(x.root,x.type));}
  pool.push(T.chordSym(c.root,'dom7'),T.chordSym(c.root,'maj7'),T.chordSym(c.root,'min7'),T.chordSym(c.root,'m7b5'));
  return choice('In '+keyName(k)+', the scale-tone 7th chord '+c.rn+' is…',optsFrom(ans,uniq(pool),4),ans,{why:k.mode==='major'?'Scale-tone 7ths in a major key: Imaj7 ii7 iii7 IVmaj7 V7 vi7 viiø7.':'Scale-tone 7ths in a minor key: i7 iiø7 IIImaj7 iv7 V7 VImaj7 vii°7 (V7 and vii°7 use the raised leading note).'});}
function writeSeventhProgQ(){const k=randKey();const clef=clefPick();const degs=pick([[1,4,0],[0,5,1,4],[3,4,0]]);const ch=degs.map(d=>T.diatonicChord(k.tonic,k.mode,d,true));
  const items=ch.map((c,i)=>Object.assign(slot(i,fitScale(T.chord(c.root,c.type,0),clef),'w'),{chord:true,max:4}));
  return {t:'notate',prompt:'Write '+ch.map(c=>c.rn).join(' – ')+' in '+keyName(k)+'.',sub:clefWord(clef)+'. Scale-tone 7th chords, root position, four notes each; use the key signature'+(k.mode==='minor'?' and raise the leading note in V7 / vii°7':'')+'.',clef,sig:k.sig,items,anyOctaveChord:true,
    why:ch.map(c=>c.rn+' = '+T.chordSym(c.root,c.type)+' ('+T.chord(c.root,c.type,0).map(name).join(' ')+')').join('; ')+'.'};}
function writeProgFigQ(){ // progression with inversions when figures are on
  if(!S('figures'))return writeProgQ();const k=randKey();const clef=clefPick();const degs=pick(progsOn().filter(p=>p.length<=4));const invs=degs.map((d,i)=>i===degs.length-1?0:pick([0,1,1,2]));
  const ch=degs.map(d=>T.diatonicChord(k.tonic,k.mode,d,false));
  const items=ch.map((c,i)=>Object.assign(slot(i,fitScale(T.chord(c.root,c.type,invs[i]),clef),'w'),{chord:true,max:3,bassCheck:true}));
  const label=ch.map((c,i)=>c.rn+figL(invs[i])).join(' – ');
  return {t:'notate',prompt:'Write '+label+' in '+keyName(k)+'.',sub:clefWord(clef)+'. b = 1st inversion (3rd in the bass), c = 2nd inversion (5th in the bass). The bass note is checked; the other notes may sit in any octave above it.',clef,sig:k.sig,items,
    why:ch.map((c,i)=>c.rn+figL(invs[i])+' = '+T.chordSym(c.root,c.type)+(invs[i]?'/'+name(T.chord(c.root,c.type,invs[i])[0]):'')).join('; ')+'.'};}
function notateChordSigQ(){ // a chord written with a key signature present (diatonic to the key)
  const k=randKey();const clef=clefPick();const d=pick([0,1,2,3,4,5]);const c=T.diatonicChord(k.tonic,k.mode,d,Math.random()<0.3&&chordsOn().some(x=>x.endsWith('7')));
  let notes=fitScale(T.chord(c.root,c.type,0),clef);const sym=T.chordSym(c.root,c.type);
  return {t:'notate',prompt:'Write the chord '+sym+' using the key signature of '+keyName(k)+'.',sub:clefWord(clef)+'. Root position. Add an accidental only where the key signature does not already give the note.',clef,sig:k.sig,items:[Object.assign(slot(0,notes,'w'),{chord:true,max:notes.length})],anyOctaveChord:true,
    why:sym+' = '+T.chord(c.root,c.type,0).map(name).join(' ')+' ('+c.rn+' in '+keyName(k)+').'};}
// ======================================================================
const UNITS=[
 {id:'pitch',name:'Pitch & Notation',short:'Pitch',yr:7,gens:[[noteNameQ,3],[spnQ,1,8],[notateNoteQ,5],[notateSeqQ,3],[enharmonicQ,1,9],[accidentalQ,2],[tabQ,1,11],[drumQ,1,11],[drumReadQ,1,11],[chordSymBasicQ,1,11]],
  guide:`<b>Reading &amp; writing pitch</b><ol><li><b>Clefs:</b> treble lines E G B D F, spaces F A C E; bass lines G B D F A, spaces A C E G. Alto clef: middle C on the middle line. Tenor clef: middle C on the 4th line.</li><li><b>SPN:</b> middle C = C4; each octave numbers from C upward.</li><li><b>Accidentals:</b> ♯ up a semitone, ♭ down, ♮ cancels, 𝄪/𝄫 two semitones. An accidental lasts to the end of the bar.</li><li><b>Enharmonics:</b> same sound, different name (C♯ = D♭, E♯ = F, C♭ = B).</li><li><b>TAB:</b> six lines = six strings (top line = high E); numbers = frets. Standard tuning E A D G B E.</li><li><b>Drum kit:</b> percussion clef; kick in the 1st space, snare in the 3rd space, hi-hat/cymbals as × in the top space. Papers give a legend: read it first.</li></ol>`},
 {id:'rhythm',name:'Rhythm & Metre',short:'Rhythm',yr:7,gens:[[timeSigQ,3],[completeBarQ,4],[groupingQ,3],[valueQ,2,8],[restQ,1],[metreTheoryQ,2],[deviceRhythmQ,2,8]],
  guide:`<b>Values &amp; metre</b><ul><li>Semibreve 4 · minim 2 · crotchet 1 · quaver ½ · semiquaver ¼ (crotchet beats). A dot adds half again. Rests have the same values.</li><li><b>Simple</b> time: beat divides in 2 (2/4, 3/4, 4/4). <b>Compound</b>: beat divides in 3 (6/8, 9/8, 12/8; beat = dotted crotchet; top number ÷ 3 = beats). <b>Irregular</b>: 5/4, 7/8 (grouped e.g. 2+2+3).</li><li><b>Grouping:</b> beam quavers to show the beat: pairs in simple time, threes in compound.</li><li>Triplet = 3 in the time of 2; duplet = 2 in the time of 3. Syncopation = accent off the beat. Anacrusis = upbeat. Swing = long–short quavers.</li></ul>`},
 {id:'expr',name:'Tempo & Expression',short:'Expression',yr:7,gens:[[termQ,5],[artSymbolQ,3],[ornamentQ,2,11]],
  guide:`<b>Tempo, dynamics, articulation, ornaments</b><ul><li><b>Tempo:</b> adagio &lt; andante &lt; moderato &lt; allegro &lt; presto. accel. / rall. (rit.) / a tempo / rubato; double time, half time. M.M. ♩ = 120 means 120 crotchet beats per minute.</li><li><b>Dynamics:</b> pp p mp mf f ff; cresc. &lt; ; dim. / decresc. &gt;.</li><li><b>Articulation:</b> staccato (dot) short; legato / slur smooth; accent &gt;; tenuto – held; sfz sudden accent; fp loud then soft.</li><li><b>Ornaments:</b> trill (tr), mordent, turn, acciaccatura (crushed grace note), glissando/slide, scoop, bend.</li></ul>`},
 {id:'keys',name:'Keys & Key Signatures',short:'Keys',yr:7,gens:[[keySigIdQ,2],[keySigWriteQ,5],[degreeNotateQ,4,11],[keyFactQ,2],[tonalityQ,2,8]],
  guide:`<b>Key signatures &amp; tonality</b><ul><li>Sharps: F C G D A E B. Flats: B E A D G C F. Last sharp = leading note (up a semitone = key). Second-last flat = key (F major has one flat).</li><li><b>Relative</b> major/minor share a signature (minor is a minor 3rd below). <b>Parallel (tonic)</b> keys share a tonic (C major / C minor).</li><li><b>Degrees:</b> tonic, supertonic, mediant, subdominant, dominant, submediant, leading note.</li><li><b>Modulation:</b> to the dominant (raised 4th appears), subdominant (flattened 7th), relative minor (its raised 7th appears).</li><li><b>Tonality:</b> major, minor (look for the raised 7th), modal (Mixolydian ♭7, Dorian ♮6).</li></ul>`},
 {id:'scales',name:'Scales & Modes',short:'Scales',yr:7,gens:[[notateScaleQ,7],[nameScaleQ,3],[scaleFactQ,2],[solfaQ,3],[solfaNotateQ,3]],
  guide:`<b>Scales &amp; modes</b><ol><li>Write the letters first (one of each), then fix the pattern with accidentals or the key signature.</li><li>Major T T S T T T S · natural minor T S T T S T T · harmonic minor raises the 7th · melodic minor raises 6 and 7 going up, natural minor coming down.</li><li>Major pentatonic 1 2 3 5 6 · minor pentatonic 1 ♭3 4 5 ♭7 · blues adds ♯4/♭5 · chromatic: sharps up, flats down.</li><li><b>Sol-fa</b> (moveable do): major do re mi fa so la ti do · major pentatonic do re mi so la do · natural minor (la-based, la = tonic) la ti do re mi fa so la · minor pentatonic la do re mi so la.</li><li>Modes = major scale from each degree. Mixolydian (5th): ♭7. Dorian (2nd): ♮6. Aeolian (6th) = natural minor.</li></ol>`},
 {id:'intervals',name:'Intervals',short:'Intervals',yr:7,gens:[[notateIntervalQ,7],[nameIntervalQ,4],[ivFactQ,2]],
  guide:`<b>Number, quality, inversion</b><ol><li><b>Number:</b> count letter names from the lower note, counting both (C→E = 3rd).</li><li><b>Quality:</b> count semitones. Perfect: unison 4th 5th 8ve. Major/minor: 2nd 3rd 6th 7th. One wider = augmented, one narrower (than perfect/minor) = diminished. Tritone = 6 semitones (A4 / d5).</li><li><b>Below a note:</b> count down the letters, then check the semitones.</li><li><b>Inversion:</b> numbers add to 9; M↔m, A↔d, P stays P. <b>Compound:</b> 9th = 2nd + octave.</li></ol>`},
 {id:'chords',name:'Chords',short:'Chords',yr:7,gens:[[notateChordQ,6],[notateChordSigQ,3,8],[nameChordQ,3],[chordSymbolQ,1,11],[chordSymbolExtQ,1,11],[chordFactQ,1],[guitarChordQ,1,11]],
  guide:`<b>Triads, 7ths, 9ths, inversions, symbols</b><ul><li>Major 1 3 5 · minor 1 ♭3 5 · diminished 1 ♭3 ♭5 · augmented 1 3 ♯5.</li><li>maj7 (∆7) 1 3 5 7 · dominant 7 1 3 5 ♭7 · m7 (−7) 1 ♭3 5 ♭7 · m7♭5 (ø7) 1 ♭3 ♭5 ♭7 · 9ths add the 9th on top.</li><li><b>Inversions:</b> root position (root in bass), 1st (3rd in bass, C/E), 2nd (5th in bass, C/G), 3rd for 7ths (7th in bass).</li><li><b>Symbols:</b> C = major, Cm / C− = minor, C° = diminished, C+ = augmented, C∆7 = major 7th, Cø7 = half-diminished, C°7 = diminished 7th, Csus4 / Csus2 = 3rd replaced by the 4th / 2nd, C6 = triad + 6th, C/E = E in the bass.</li><li>Primary triads I IV V; secondary ii iii vi (vii°).</li></ul>`},
 {id:'harmony',name:'Harmony & Progressions',short:'Harmony',yr:8,gens:[[romanQ,2],[chordNamesQ,1,11],[rnToChordQ,1],[seventhRnMinorQ,1,11],[writeProgQ,3],[writeProgFigQ,2,10],[writeSeventhProgQ,2,11],[writeCadenceQ,4,9],[cadenceIdQ,2,9],[figureQ,3,10],[modulationQ,2,9],[harmonyFactQ,1]],
  guide:`<b>Roman numerals, progressions, modulation</b><ul><li>Major key: I ii iii IV V vi vii°. Minor key: i ii° III iv V VI vii° (III and VI from the natural minor; V and vii° use the raised leading note).</li><li><b>Cadences:</b> perfect V–I, plagal IV–I, imperfect …–V (I–V, ii–V, IV–V), interrupted V–vi.</li><li><b>Inversion letters:</b> a = root position, b = 1st inversion (3rd in the bass), c = 2nd inversion (5th in the bass), d = 3rd inversion (7th in the bass).</li><li>Scale-tone 7ths: major Imaj7 ii7 iii7 IVmaj7 V7 vi7 viiø7 · minor i7 iiø7 IIImaj7 iv7 V7 VImaj7 vii°7.</li><li>Read a chord: stack it in 3rds, find the root, check its quality in the key.</li><li>12-bar blues: I I I I | IV IV I I | V IV I I.</li><li>Modulation: a persistent new accidental → raised 4th = dominant; ♭7 = subdominant; raised 7th of the relative minor = relative minor.</li></ul>`},
 {id:'transp',name:'Transposition & Clefs',short:'Transposition',yr:8,gens:[[instrFactQ,2,11],[transposeMelodyQ,4,11],[transposeKeyQ,3,10],[clefTransposeQ,3,8],[octaveQ,2,8],[concertNoteQ,3,11]],
  guide:`<b>Transposition</b><ol><li>A transposing instrument sounds a fixed interval BELOW what is written. To write its part from concert pitch, transpose UP by that interval and change the key signature to match.</li><li>B♭ instruments (trumpet, clarinet, soprano sax) sound a major 2nd lower → write up a major 2nd (tenor sax: a major 9th lower). E♭ alto sax sounds a major 6th lower (bari sax a major 13th). Horn in F sounds a perfect 5th lower. Clarinet in A sounds a minor 3rd lower.</li><li>New key = old key up the same interval (B♭ major concert → C major for a B♭ instrument). Transpose accidentals too.</li><li><b>Transposing to a new key</b> (e.g. up a perfect 4th): new key signature first, then move every note the same interval, checking each accidental against the new key.</li><li>Clef transposition keeps the pitch and changes where it sits; octave transposition keeps the letter names.</li></ol>`},
 {id:'form',name:'Form, Signs & Devices',short:'Form',yr:7,gens:[[formQ,4],[signRenderQ,3,8],[deviceRenderQ,4]],
  guide:`<b>Form, signs, devices, texture</b><ul><li><b>Forms:</b> binary AB, ternary ABA, rondo ABACA, verse–chorus, AABA, strophic, through-composed, 12-bar blues, sonata (exposition–development–recapitulation), theme and variations.</li><li><b>Signs:</b> repeat signs, 1st/2nd time bars, fermata, Fine, Coda, D.C., D.S., D.C. al Fine, D.S. al Coda, segue/attacca.</li><li><b>Devices:</b> ostinato/riff, pedal, sequence, imitation, inversion, augmentation, diminution, call and response.</li><li><b>Texture:</b> monophonic = a single melody (may be block-harmonised); homophonic = melody with accompaniment; polyphonic = independent melodies together.</li></ul>`},
];
function hasDbl(q){const re=/[𝄪𝄫]/;const chk=p=>p&&Math.abs(p.a)===2;
  if(re.test(q.prompt||'')||re.test(q.answer||''))return true;
  if(q.opts&&q.opts.some(o=>re.test(String(o.v))))return true;
  if(q.items&&q.items.some(i=>(i.target&&i.target.some(chk))||(i.p&&i.p.some(chk))))return true;
  if(q.show&&q.show.spec&&q.show.spec.items.some(i=>i.p&&i.p.some(chk)))return true;return false;}
let GENSEL={};function setGensel(o){GENSEL=o||{};}
const gensOn=u=>u.gens.filter(g=>GENSEL[g[0].name]===true||(GENSEL[g[0].name]!==false&&(g[2]||7)<=UPTO()));
const unitsOn=()=>UNITS.filter(u=>(u.yr||7)<=UPTO());
function makeSet(unitId,count){const u=UNITS.find(x=>x.id===unitId);const bag=[];gensOn(u).forEach(([fn,w])=>{for(let i=0;i<w;i++)bag.push(fn);});if(!bag.length)u.gens.forEach(([fn,w])=>bag.push(fn));
  const out=[];const seen=new Set();let guard=0;
  while(out.length<count&&guard++<count*20){const fn=pick(bag);let q=null;try{q=fn();}catch(e){console.warn('gen error',fn.name,e);continue;}if(!q)continue;if(!S('dbl')&&hasDbl(q)&&fn.name!=='enharmonicQ'&&fn.name!=='accidentalQ')continue;
    const key=q.prompt+'|'+(q.answer||'')+'|'+JSON.stringify(q.items?q.items.map(i=>i.target&&i.target.map(spn)):'')+(q.pairs?JSON.stringify(q.pairs):'');if(seen.has(key))continue;seen.add(key);
    q.unit=unitId;q.gen=fn.name;defaultWhy(q);out.push(q);}
  return out;}
const BYNAME={};UNITS.forEach(u=>u.gens.forEach(([fn])=>BYNAME[fn.name]=fn));
function defaultWhy(q){if(q.why)return;if(q.t==='match'&&q.pairs)q.why=q.pairs.map(p=>'<b>'+p[0]+'</b> — '+p[1]).join(' · ');}
function one(name){let q=null;for(let i=0;i<20&&!q;i++)q=BYNAME[name]();const u=UNITS.find(u=>u.gens.some(g=>g[0].name===name));q.unit=u.id;q.gen=name;defaultWhy(q);return q;}
return {UNITS,SCHEMA,DEFAULTS,getSet,setLevel,applySet,makeSet,unitsOn,gensOn,setGensel,RANGE,MIDD,inClef,fitScale,stave,one};
})();
