// engrave.js — SVG music engraving for ATAR Music Theory Blitz (Bravura glyphs, SMuFL metrics).
// Durations are in units of 1/48 of a semibreve: w=48 h=24 q=12 e=6 s=3 (dotted ×1.5, triplet ×2/3).
const E=(()=>{
const SS=16, GS=SS/250, TOPK=4;      // staff space px, glyph scale, blank spaces above the stave
const TOP=TOPK*SS, MID=TOP+2*SS, H_DEFAULT=(TOPK+4+TOPK)*SS;
const DUR={w:48,h:24,q:12,e:6,s:3};
const durVal=(dur,dots,tup)=>{let v=DUR[dur];if(dots)v=v*1.5;if(tup)v=v*tup.in/tup.n;return v;};
const CLEF={
  treble:{glyph:'gClef',topDia:T.dia(T.P('F',0,5)),anchorDia:T.dia(T.P('G',0,4)),w:2.9},
  bass:{glyph:'fClef',topDia:T.dia(T.P('A',0,3)),anchorDia:T.dia(T.P('F',0,3)),w:2.9},
  alto:{glyph:'cClef',topDia:T.dia(T.P('G',0,4)),anchorDia:T.dia(T.P('C',0,4)),w:3.0},
  tenor:{glyph:'cClef',topDia:T.dia(T.P('E',0,4)),anchorDia:T.dia(T.P('C',0,4)),w:3.0},
  perc:{glyph:'percClef',topDia:T.dia(T.P('F',0,5)),anchorDia:T.dia(T.P('B',0,4)),w:2.0},
};
CLEF.none={glyph:null,topDia:CLEF.treble.topDia,anchorDia:CLEF.treble.anchorDia,w:0};
// key-signature accidental positions (SPN) per clef
const KS={
  treble:{s:['F5','C5','G5','D5','A4','E5','B4'],f:['B4','E5','A4','D5','G4','C5','F4']},
  bass:{s:['F3','C3','G3','D3','A2','E3','B2'],f:['B2','E3','A2','D3','G2','C3','F2']},
  alto:{s:['F4','C4','G4','D4','A3','E4','B3'],f:['B3','E4','A3','D4','G3','C4','F3']},
  tenor:{s:['F3','C4','G3','D4','A3','E4','B3'],f:['B3','E4','A3','D4','G3','C4','F3']},
};
const ACCG={'-2':'dflat','-1':'flat','0':'natural','1':'sharp','2':'dsharp'};
const g=n=>GLYPHS[n];
const gw=n=>g(n).w*GS;
function glyph(n,x,y,fill,extra){return `<path d="${g(n).d}" transform="translate(${x.toFixed(2)},${y.toFixed(2)}) scale(${GS},${-GS})" fill="${fill||'var(--ink)'}"${extra||''}/>`;}
const yOf=(clef,d)=>TOP+(CLEF[clef].topDia-d)*(SS/2);
const diaAt=(clef,y)=>Math.round(CLEF[clef].topDia-(y-TOP)/(SS/2));
function ledgers(clef,d){const t=CLEF[clef].topDia,b=t-8,o=[];if(d>t)for(let e=t+2;e<=d;e+=2)o.push(e);if(d<b)for(let e=b-2;e>=d;e-=2)o.push(e);return o;}
const headName=dur=>dur==='w'?'noteheadWhole':dur==='h'?'noteheadHalf':'noteheadBlack';
const line=(x1,y1,x2,y2,w,col)=>`<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" stroke="${col||'var(--line)'}" stroke-width="${w||1.3}" stroke-linecap="butt"/>`;
// accidental shown for a pitch given key signature + accidentals already in the bar
function dispAcc(p,sigMap,bar){const k=p.l+p.o;const cur=(bar&&k in bar)?bar[k]:(sigMap[p.l]||0);
  if(cur===p.a)return null;if(bar)bar[k]=p.a;return p.a;}
// ---------- layout ----------
function prepare(spec){
  const clef=spec.clef||'treble',sigN=spec.sig||0,sigMap=T.sigAccidentals(sigN);
  const cols=[];let x=SS*0.6;
  if(clef!=='none'){cols.push({k:'clef',x});x+=CLEF[clef].w*SS+SS*0.5;}
  if(sigN&&clef!=='perc'&&clef!=='none'){const n=Math.abs(sigN),w=(sigN>0?gw('sharp'):gw('flat'))+SS*0.12;cols.push({k:'sig',x,n:sigN,w});x+=n*w+SS*0.6;}
  if(spec.time){cols.push({k:'time',x,t:spec.time});x+=(spec.time==='C'?gw('tsCommon'):Math.max(gw('ts4')*String(spec.time[0]).length,gw('ts4')*String(spec.time[1]).length))+SS*0.9;}
  else x+=SS*0.3;
  let bar={},pend=[];
  const items=spec.items||[];
  items.forEach((it,idx)=>{
    const c=Object.assign({idx},it);
    if(it.k==='n'||it.k==='slot'){
      const ps=(it.p||[]).slice().sort((a,b)=>T.dia(a)-T.dia(b));c.p=ps;
      // accidentals to display
      c.accs=ps.map(p=>it.explicit?(p.a===0&&!p.showNat?null:p.a):dispAcc(p,sigMap,spec.noBar?null:bar));
      if(it.showAcc)c.accs=ps.map(p=>p.a);
      const dur=it.dur||'w';c.dur=dur;
      const hw=gw(headName(dur));c.hw=hw;
      // second-offsets: adjacent notes shift to the right (stem up) or left (stem down)
      c.stemUp=stemDir(clef,ps,it);c.forced=!!it.stem;
      c.shift=ps.map(()=>0);for(let i=1;i<ps.length;i++){if(T.dia(ps[i])-T.dia(ps[i-1])===1&&c.shift[i-1]===0)c.shift[i]=c.stemUp?1:-1;}
      // accidental columns (right to left)
      let accW=0;const accCols=[];const placed=[];
      for(let i=ps.length-1;i>=0;i--){const a=c.accs[i];if(a===null||a===undefined){accCols[i]=-1;continue;}
        let col=0;while(placed.some(q=>q.col===col&&Math.abs(q.d-T.dia(ps[i]))<6))col++;placed.push({col,d:T.dia(ps[i])});accCols[i]=col;}
      c.accCols=accCols;const ncol=placed.length?Math.max(...placed.map(q=>q.col))+1:0;
      c.accW=ncol?ncol*(gw('sharp')+SS*0.15)+SS*0.2:0;
      if(it.k==='slot')c.accW=Math.max(c.accW,(it.chord?2:1)*(gw('sharp')+SS*0.15)+SS*0.2); // reserve space so the layout never jumps while a student works
      if(c.shift.some(s=>s<0))c.accW+=hw;
      const base=it.k==='slot'?(it.chord?SS*3.4:SS*2.4):({w:3.6,h:3.0,q:2.3,e:1.9,s:1.6}[dur]*SS);
      c.w=base+c.accW+(it.dots?SS*0.5:0);
      c.x=x+c.accW+(c.shift.some(s=>s<0)?hw:0);x+=c.w;
    } else if(it.k==='r'){c.w=({w:3.2,h:2.8,q:2.2,e:1.8,s:1.5}[it.dur||'q'])*SS+(it.dots?SS*0.5:0);c.x=x+SS*0.4;x+=c.w;}
    else if(it.k==='bar'){bar={};c.x=x+SS*0.3;c.w=SS*1.1;x+=c.w;}
    else if(it.k==='rep'){bar={};c.x=x+SS*0.3;c.w=(it.dir==='both'?SS*2.9:SS*1.9);x+=c.w;}
    else if(it.k==='gap'){c.w=(it.w||1)*SS;c.x=x;x+=c.w;if(it.q)c.q=true;}
    else if(it.k==='txt'||it.k==='sym'){c.w=0;c.x=x;}
    cols.push(c);});
  const W=x+SS*0.9;
  return {clef,sigN,sigMap,cols,W,H:spec.H||H_DEFAULT};}
function stemDir(clef,ps,it){if(it.stem==='up')return true;if(it.stem==='down')return false;if(!ps.length)return true;
  const mid=CLEF[clef].topDia-4;const lo=T.dia(ps[0]),hi=T.dia(ps[ps.length-1]);
  const far=(hi-mid)>=(mid-lo)?hi:lo;return far<mid;}
// ---------- drawing ----------
function render(spec,opts){opts=opts||{};const L=prepare(spec);const {clef,sigN,cols,W,H}=L;const S=[];
  const ink=opts.ink||'var(--ink)';
  const right=W-SS*0.3;
  for(let k=0;k<5;k++)S.push(line(SS*0.3,TOP+k*SS,right,TOP+k*SS,1.3));
  const beams=[];let tupStart=null,voltas=[];
  cols.forEach(c=>{
    if(c.k==='clef'){if(clef==='perc')S.push(line(c.x+SS*0.5,MID-SS,c.x+SS*0.5,MID+SS,3.2),line(c.x+SS*1.1,MID-SS,c.x+SS*1.1,MID+SS,3.2));
      else S.push(glyph(CLEF[clef].glyph,c.x,yOf(clef,CLEF[clef].anchorDia),ink));return;}
    if(c.k==='sig'){const n=Math.abs(c.n),list=KS[clef][c.n>0?'s':'f'];for(let i=0;i<n;i++){const p=T.parse(list[i]);S.push(glyph(c.n>0?'sharp':'flat',c.x+i*c.w,yOf(clef,T.dia(p)),ink));}return;}
    if(c.k==='time'){if(c.t==='C'){S.push(glyph('tsCommon',c.x,MID,ink));return;}
      const dig=(s,y)=>{const str=String(s);let xx=c.x;str.split('').forEach(ch=>{S.push(glyph('ts'+ch,xx,y,ink));xx+=gw('ts'+ch);});};
      dig(c.t[0],TOP+SS);dig(c.t[1],TOP+3*SS);return;}
    if(c.k==='bar'){S.push(line(c.x,TOP,c.x,TOP+4*SS,c.final?1.3:1.3));if(c.final){S.push(line(c.x+SS*0.45,TOP,c.x+SS*0.45,TOP+4*SS,4));}
      if(c.double){S.push(line(c.x+SS*0.3,TOP,c.x+SS*0.3,TOP+4*SS,1.3));}return;}
    if(c.k==='rep'){ // c.dir 'start'|'end'|'both'
      const dots=x=>S.push(`<circle cx="${x.toFixed(1)}" cy="${(MID-SS*0.5).toFixed(1)}" r="${(SS*0.2).toFixed(1)}" fill="${ink}"/><circle cx="${x.toFixed(1)}" cy="${(MID+SS*0.5).toFixed(1)}" r="${(SS*0.2).toFixed(1)}" fill="${ink}"/>`);
      let x0=c.x;
      if(c.dir==='end'||c.dir==='both'){dots(x0);S.push(line(x0+SS*0.5,TOP,x0+SS*0.5,TOP+4*SS,1.3));S.push(line(x0+SS*0.85,TOP,x0+SS*0.85,TOP+4*SS,4));x0+=SS*1.1;}
      if(c.dir==='start'||c.dir==='both'){S.push(line(x0+SS*0.1,TOP,x0+SS*0.1,TOP+4*SS,4));S.push(line(x0+SS*0.45,TOP,x0+SS*0.45,TOP+4*SS,1.3));dots(x0+SS*0.95);}
      return;}
    if(c.k==='gap'&&c.q){S.push(`<rect x="${(c.x+SS*0.2).toFixed(1)}" y="${(TOP-SS*0.4).toFixed(1)}" width="${(c.w-SS*0.4).toFixed(1)}" height="${(4.8*SS).toFixed(1)}" rx="4" fill="#fff7f6" stroke="var(--red)" stroke-width="1.2" stroke-dasharray="4 3"/><text x="${(c.x+c.w/2).toFixed(1)}" y="${(MID+SS*0.45).toFixed(1)}" text-anchor="middle" font-size="${(SS*1.3).toFixed(1)}" font-weight="800" fill="var(--red)">?</text>`);return;}
    if(c.k==='txt'){const y=c.below?TOP+4*SS+SS*1.6:TOP-SS*1.0;S.push(`<text x="${c.x.toFixed(1)}" y="${y.toFixed(1)}" font-size="${(SS*0.85).toFixed(1)}" font-weight="${c.bold?700:500}" font-style="${c.italic?'italic':'normal'}" fill="${ink}" text-anchor="${c.anchor||'start'}">${c.s}</text>`);return;}
    if(c.k==='sym'){const yy=c.below?TOP+4*SS+SS*1.2:TOP-SS*1.4;S.push(glyph(c.g,c.x,yy,ink));return;}
    if(c.k==='r'){const dur=c.dur||'q';const rn={w:'restWhole',h:'restHalf',q:'restQuarter',e:'rest8th',s:'rest16th'}[dur];
      const y=dur==='w'?TOP+SS:MID;S.push(glyph(rn,c.x,y,c.col||ink));
      if(c.dots)S.push(glyph('dot',c.x+gw(rn)+SS*0.25,MID-SS*0.5,c.col||ink));
      if(c.fermata)S.push(glyph('fermata',c.x+gw(rn)/2-gw('fermata')/2,TOP-SS*1.0,ink));
      c.hw=gw(rn);c.stemUp=true;return;}
    if(c.k==='n'||c.k==='slot'){drawNoteCol(S,L,c,ink,opts,beams);return;}
  });
  drawBeams(S,L,beams,ink);
  cols.forEach(c=>{if(c.tup&&c.tup.pos==='start')tuplet(S,cols,c,ink);});
  // ties
  cols.forEach((c,i)=>{if((c.k!=='n'&&c.k!=='slot')||!c.tie)return;let j=i+1;while(j<cols.length&&cols[j].k!=='n'&&cols[j].k!=='slot')j++;const n=cols[j];if(!n)return;
    c.p.forEach((p,pi)=>{const q=n.p.findIndex(z=>T.dia(z)===T.dia(p));if(q<0)return;const y=yOf(clef,T.dia(p));
      const up=!c.stemUp;const x1=c.x+c.hw+SS*0.15,x2=n.x-SS*0.15,dy=(up?-1:1)*SS*0.9,mx=(x1+x2)/2;
      S.push(`<path d="M${x1.toFixed(1)} ${(y+(up?-1:1)*SS*0.25).toFixed(1)} Q${mx.toFixed(1)} ${(y+dy).toFixed(1)} ${x2.toFixed(1)} ${(y+(up?-1:1)*SS*0.25).toFixed(1)} Q${mx.toFixed(1)} ${(y+dy*0.72).toFixed(1)} ${x1.toFixed(1)} ${(y+(up?-1:1)*SS*0.25).toFixed(1)} Z" fill="${c.col||ink}"/>`);});});
  // voltas (1st/2nd time brackets)
  cols.forEach((c,i)=>{if(!c.volta)return;let j=i+1;while(j<cols.length&&cols[j].k!=='bar'&&cols[j].k!=='rep')j++;const end=cols[j]?cols[j].x:W-SS;
    const x0=c.x-SS*0.9,y=TOP-SS*1.3;S.push(line(x0,y,end,y,1.4),line(x0,y,x0,y+SS*0.9,1.4));if(c.volta===1)S.push(line(end,y,end,y+SS*0.9,1.4));
    S.push(`<text x="${(x0+SS*0.3).toFixed(1)}" y="${(y+SS*0.75).toFixed(1)}" font-size="${(SS*0.75).toFixed(1)}" font-weight="700" fill="${ink}">${c.volta}.</text>`);});
  const vb=opts.tight?`0 ${(TOP-2.3*SS).toFixed(1)} ${W.toFixed(1)} ${(8.6*SS).toFixed(1)}`:`0 0 ${W.toFixed(1)} ${H}`;
  const attrs=opts.attrs||'';const cls=opts.cls||'';
  return {svg:`<svg class="${cls}" viewBox="${vb}" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg"${attrs}>${S.join('')}</svg>`,W,H,cols:L.cols,clef};}
function drawNoteCol(S,L,c,ink,opts,beams){const {clef}=L;const col=c.col||ink;const dur=c.dur;
  if(c.k==='slot'&&(!c.p.length)){ // placeholder (+ ghost of the rhythm value when the slot carries one)
    const g0=TOP-SS*0.6,g1=TOP+4*SS+SS*0.6;
    S.push(line(c.x+c.hw/2,g0,c.x+c.hw/2,g1,1,'#cfd4da'));
    S.push(`<text x="${(c.x+c.hw/2).toFixed(1)}" y="${(L.H-SS*0.35).toFixed(1)}" text-anchor="middle" font-size="${(SS*0.7).toFixed(1)}" font-weight="700" fill="#aab0b8">${c.slotNo!==undefined?c.slotNo:c.slot+1}</text>`);
    if(c.dur&&c.dur!=='w'){const gc='#c3c8cf';const hn2=headName(c.dur);S.push(glyph(hn2,c.x,MID,gc));const sx=c.x+c.hw-0.6;S.push(line(sx,MID,sx,MID-SS*3.2,1.2,gc));
      if(c.dur==='e'||c.dur==='s')S.push(glyph((c.dur==='e'?'flag8th':'flag16th')+'Up',sx-0.6,MID-SS*3.2,gc));if(c.dots)S.push(glyph('dot',c.x+c.hw+SS*0.3,MID-SS*0.5,gc));}
    else if(c.dur==='w'&&c.ghostW){S.push(glyph('noteheadWhole',c.x,MID,'#d5d9de'));}}
  if(c.k==='slot')S.push(`<rect class="hit" data-i="${c.slot}" x="${(c.x-c.accW-SS*0.3).toFixed(1)}" y="0" width="${(c.w+SS*0.2).toFixed(1)}" height="${L.H}" fill="transparent"/>`);
  if(!c.p.length)return;
  const hn=headName(dur),hw=c.hw;
  // ledger lines (union over notes)
  const seen={};c.p.forEach((p,i)=>ledgers(clef,T.dia(p)).forEach(d=>{const key=d+'_'+c.shift[i];if(seen[key])return;seen[key]=1;const x0=c.x+c.shift[i]*hw;S.push(line(x0-SS*0.35,yOf(clef,d),x0+hw+SS*0.35,yOf(clef,d),1.5,col));}));
  // accidentals
  c.p.forEach((p,i)=>{const a=c.accs[i];if(a===null||a===undefined)return;const gn=ACCG[a];const colx=c.x-(c.accCols[i]+1)*(gw('sharp')+SS*0.15)-SS*0.05+(c.shift.some(s=>s<0)?-hw:0);
    S.push(glyph(gn,colx,yOf(clef,T.dia(p)),col));});
  // heads
  c.p.forEach((p,i)=>{const y=yOf(clef,T.dia(p));const gname=p.x?'noteheadX':hn;S.push(glyph(gname,c.x+c.shift[i]*hw,y,col,c.k==='slot'?` class="nh" data-i="${c.slot}" data-n="${i}" data-d="${T.dia(p)}"`:''));
    if(c.dots){const dy=(T.dia(p)-CLEF[clef].topDia)%2===0?-SS*0.5:0;S.push(glyph('dot',c.x+hw+SS*0.3+(c.shift[i]>0?hw:0),y+dy,col));}});
  // stem
  if(dur!=='w'){const lo=yOf(clef,T.dia(c.p[0])),hi=yOf(clef,T.dia(c.p[c.p.length-1]));const sx=c.stemUp?c.x+hw-0.6:c.x+0.6;
    let len=SS*3.5;const beamed=!!c.beam;
    c.loY=lo;c.hiY=hi;c.loD=T.dia(c.p[0]);c.hiD=T.dia(c.p[c.p.length-1]);c.midD=CLEF[clef].topDia-4;
    setStem(c);
    if(beamed){beams.push(c);} else {S.push(line(c.stemX,c.stemBase,c.stemX,c.stemEnd,1.3,col));const sx=c.stemX,y2=c.stemEnd;
      if(dur==='e'||dur==='s'){const fn=(dur==='e'?'flag8th':'flag16th')+(c.stemUp?'Up':'Down');S.push(glyph(fn,sx-(c.stemUp?0.6:-0.6),y2,col));}}
  }
  // articulations
  (c.art||[]).forEach(a=>{
    if(a==='mordent'||a==='turn'||a==='grace'){ // ornaments without a glyph: drawn as paths
      const topY=Math.min(TOP-SS*1.3,yOf(clef,T.dia(c.p[c.p.length-1]))-SS*1.6),cx=c.x+hw/2;
      if(a==='mordent'){const w=SS*0.55,h=SS*0.45;S.push(`<path d="M${(cx-w*1.5).toFixed(1)} ${topY.toFixed(1)} l${(w*0.5).toFixed(1)} ${(-h).toFixed(1)} l${w.toFixed(1)} ${(h*2).toFixed(1)} l${w.toFixed(1)} ${(-h*2).toFixed(1)} l${w.toFixed(1)} ${(h*2).toFixed(1)} l${(w*0.5).toFixed(1)} ${(-h).toFixed(1)}" stroke="${col}" stroke-width="${(SS*0.16).toFixed(1)}" fill="none" stroke-linejoin="round"/>`+line(cx,topY-SS*0.6,cx,topY+SS*0.6,1.3,col));}
      else if(a==='turn'){const w=SS*0.75,h=SS*0.42;S.push(`<path d="M${(cx-w).toFixed(1)} ${(topY+h*0.6).toFixed(1)} C${(cx-w).toFixed(1)} ${(topY-h).toFixed(1)} ${(cx-w*0.2).toFixed(1)} ${(topY-h).toFixed(1)} ${cx.toFixed(1)} ${topY.toFixed(1)} C${(cx+w*0.2).toFixed(1)} ${(topY+h).toFixed(1)} ${(cx+w).toFixed(1)} ${(topY+h).toFixed(1)} ${(cx+w).toFixed(1)} ${(topY-h*0.6).toFixed(1)}" stroke="${col}" stroke-width="${(SS*0.16).toFixed(1)}" fill="none" stroke-linecap="round"/>`);}
      else{ // acciaccatura: small slashed quaver a 3rd below, slurred to the note
        const gy=yOf(clef,T.dia(c.p[0])-2),gx0=c.x-c.accW-SS*1.5;const sc=0.62;
        S.push(`<g transform="translate(${gx0.toFixed(1)},${gy.toFixed(1)}) scale(${sc})">${glyph('noteheadBlack',0,0,col)}${line(gw('noteheadBlack')-0.6,0,gw('noteheadBlack')-0.6,-SS*3.2,1.3,col)}${glyph('flag8thUp',gw('noteheadBlack')-1.2,-SS*3.2,col)}${line(gw('noteheadBlack')-SS*0.6,-SS*2.0,gw('noteheadBlack')+SS*0.6,-SS*2.9,1.4,col)}</g>`);
        S.push(`<path d="M${(gx0+SS*0.3).toFixed(1)} ${(gy+SS*0.4).toFixed(1)} Q${((gx0+c.x)/2).toFixed(1)} ${(gy+SS*1.1).toFixed(1)} ${(c.x+SS*0.1).toFixed(1)} ${(yOf(clef,T.dia(c.p[0]))+SS*0.45).toFixed(1)}" stroke="${col}" stroke-width="1.2" fill="none"/>`);}
      return;}
    const gn={stac:'staccato',acc:'accent',ten:'tenuto',marc:'marcato',fermata:'fermata',trill:'trill'}[a];const gx=c.x+hw/2-gw(gn)/2;
    if(a==='fermata'){S.push(glyph(gn,gx,Math.min(TOP-SS*1.1,yOf(clef,T.dia(c.p[c.p.length-1]))-SS*1.4),col));return;}
    if(a==='trill'){S.push(glyph(gn,gx,Math.min(TOP-SS*1.2,yOf(clef,T.dia(c.p[c.p.length-1]))-SS*1.5),col));return;}
    const above=!c.stemUp;const topY=yOf(clef,T.dia(c.p[c.p.length-1])),botY=yOf(clef,T.dia(c.p[0]));
    if(a==='stac'||a==='ten'){ // next to the head, in a space
      let yy=above?topY-SS*0.75:botY+SS*0.75;const d=above?T.dia(c.p[c.p.length-1])+1:T.dia(c.p[0])-1; // ensure it sits in a space
      if((d-CLEF[clef].topDia)%2===0)yy+= (above?-SS*0.5:SS*0.5);
      S.push(glyph(gn,gx,a==='ten'?yy+SS*0.1:yy+(above?0.5:-0.5)*0.084*SS,col));}
    else{ // accent / marcato: outside the stave
      const yy=above?Math.min(topY-SS*1.0,TOP-SS*0.7):Math.max(botY+SS*1.0,TOP+4*SS+SS*0.7)+SS*0.9;S.push(glyph(gn,gx,yy,col));}});
  if(c.slur==='start'){c._slur=true;}
  if(c.k==='slot'&&c.p.length&&!c.given&&!c.reveal&&opts.erase!==false){ /* per-note handles drawn by app */ }
}
function setStem(c){const len=SS*3.5;const sx=c.stemUp?c.x+c.hw-0.6:c.x+0.6;let y1,y2;
  if(c.stemUp){y1=c.loY;y2=c.hiY-len;if(y2>MID&&c.hiD<c.midD-4)y2=MID;}
  else{y1=c.hiY;y2=c.loY+len;if(y2<MID&&c.loD>c.midD+4)y2=MID;}
  c.stemX=sx;c.stemEnd=y2;c.stemBase=y1;}
function tuplet(S,cols,c,ink){ // c.tup={n,in,pos:'start'|'end'} — number (+ bracket when not fully beamed)
  const start=c;let end=c;const members=[];
  for(let k=cols.findIndex(z=>z===c);k<cols.length;k++){const z=cols[k];if(z.tup){members.push(z);end=z;if(z.tup.pos==='end')break;}}
  const beamedAll=members.every(z=>z.beam)&&members[0].beam==='start'&&end.beam==='end';
  const up=start.stemUp;
  const ends=members.map(z=>z.stemEnd!==undefined?z.stemEnd:(up?TOP:TOP+4*SS));
  const y=up?Math.min(...ends,TOP-SS*0.2)-SS*0.55:Math.max(...ends,TOP+4*SS+SS*0.2)+SS*0.55;
  const x1=start.x-SS*0.1,x2=end.x+(end.hw||SS)+SS*0.1,mx=(x1+x2)/2;
  if(!beamedAll){S.push(line(x1,y,mx-SS*0.55,y,1.1),line(mx+SS*0.55,y,x2,y,1.1),line(x1,y,x1,y+(up?SS*0.5:-SS*0.5),1.1),line(x2,y,x2,y+(up?SS*0.5:-SS*0.5),1.1));}
  S.push(`<text x="${mx.toFixed(1)}" y="${(y+(up?SS*0.3:SS*0.45)).toFixed(1)}" text-anchor="middle" font-size="${(SS*0.8).toFixed(1)}" font-style="italic" font-weight="700" fill="${ink}">${c.tup.n}</text>`);}
function drawBeams(S,L,list,ink){ // group consecutive beam members: beam 'start'..'end'
  let grp=[];list.forEach(c=>{grp.push(c);if(c.beam==='end'||c.beam==='single'){flush(grp);grp=[];}});if(grp.length)flush(grp);
  function flush(gr){if(!gr.length)return;const col=gr[0].col||ink;
    // one direction for the group: the note farthest from the middle line decides (ties → down)
    let far=0,up=true;gr.forEach(c=>{if(c.forced)return;const a=c.hiD-c.midD,b=c.midD-c.loD;if(a>=far&&a>=b){far=a;up=false;}if(b>far){far=b;up=true;}});
    if(gr.some(c=>c.forced))up=gr.find(c=>c.forced).stemUp;
    gr.forEach(c=>{c.stemUp=up;setStem(c);});
    // level beam at the farthest stem end
    const ends=gr.map(c=>c.stemEnd);let y=up?Math.min(...ends):Math.max(...ends);
    gr.forEach(c=>{c.stemEnd=y;S.push(line(c.stemX,c.stemBase,c.stemX,y,1.3,col));});
    const bt=SS*0.5,dir=up?1:-1;const x1=gr[0].stemX,x2=gr[gr.length-1].stemX;
    const beam=(xa,xb,level)=>{const yy=y+dir*level*(bt+SS*0.25);S.push(`<rect x="${(xa-0.65).toFixed(1)}" y="${Math.min(yy,yy+dir*bt).toFixed(1)}" width="${(xb-xa+1.3).toFixed(1)}" height="${bt}" fill="${col}"/>`);};
    beam(x1,x2,0);
    // secondary beams for semiquavers
    for(let i=0;i<gr.length;i++){if(gr[i].dur!=='s')continue;const prev=gr[i-1],next=gr[i+1];
      if(next&&next.dur==='s'){beam(gr[i].stemX,next.stemX,1);}
      else if(!(prev&&prev.dur==='s')){ // isolated: stub
        if(prev)beam(gr[i].stemX-SS*0.9,gr[i].stemX,1);else beam(gr[i].stemX,gr[i].stemX+SS*0.9,1);}}}}
// ---------- rhythm helpers ----------
// auto-beam a list of items by beats. time [n,d]; groups quavers within crotchet beats (simple) or dotted-crotchet beats (compound); irregular via opts.groups (in quavers)
function autoBeam(items,time,groups){if(time==='C')time=[4,4];const [n,d]=time;const unit=48/d;let beatLen;
  let bounds=[];if(groups){let acc=0;groups.forEach(gq=>{acc+=gq*6;bounds.push(acc);});}
  else{const compound=d===8&&n%3===0;beatLen=compound?18:unit;for(let b=beatLen;b<=n*unit;b+=beatLen)bounds.push(b);}
  let pos=0,grp=[];const flush=()=>{if(grp.length>1){grp.forEach((c,i)=>c.beam=i===0?'start':i===grp.length-1?'end':'cont');}else if(grp.length===1)grp[0].beam=null;grp=[];};
  items.forEach(it=>{if(it.k==='bar'||it.k==='rep'){flush();pos=0;return;}if(it.k!=='n'&&it.k!=='r'){return;}
    const v=durVal(it.dur,it.dots,it.tup);const beatEnd=bounds.find(b=>b>pos);
    const short=(it.dur==='e'||it.dur==='s');
    if(it.k==='r'||!short){flush();pos+=v;return;}
    grp.push(it);pos+=v;if(pos>=beatEnd-1e-9)flush();});
  flush();return items;}
const barLength=time=>time==='C'?48:time[0]*48/time[1];
// ---------- guitar TAB & chord diagrams ----------
// notes: [{str:1..6 (1 = high E), fret:n, dur}] — rendered on a 6-line TAB stave
function tab(notes,opts){const n=notes.length,gap=SS*2.4,x0=SS*3.2,W=x0+n*gap+SS*0.5,top=SS*1.2,H=top+5*SS+SS*1.4;const S=[];
  for(let k=0;k<6;k++)S.push(line(SS*0.3,top+k*SS,W-SS*0.3,top+k*SS,1.1));
  S.push(`<text x="${(SS*0.7).toFixed(1)}" y="${(top+2.1*SS).toFixed(1)}" font-size="${(SS*1.7).toFixed(1)}" font-weight="800" fill="var(--ink)" font-family="Inter,Arial" letter-spacing="-1">T</text><text x="${(SS*0.7).toFixed(1)}" y="${(top+3.6*SS).toFixed(1)}" font-size="${(SS*1.7).toFixed(1)}" font-weight="800" fill="var(--ink)" font-family="Inter,Arial" letter-spacing="-1">A</text><text x="${(SS*0.7).toFixed(1)}" y="${(top+5.1*SS).toFixed(1)}" font-size="${(SS*1.7).toFixed(1)}" font-weight="800" fill="var(--ink)" font-family="Inter,Arial" letter-spacing="-1">B</text>`);
  notes.forEach((nt,i)=>{const x=x0+i*gap;(Array.isArray(nt)?nt:[nt]).forEach(q=>{const y=top+(q.str-1)*SS;
    S.push(`<rect x="${(x-SS*0.55).toFixed(1)}" y="${(y-SS*0.5).toFixed(1)}" width="${(SS*1.1).toFixed(1)}" height="${SS}" fill="#fff"/><text x="${x.toFixed(1)}" y="${(y+SS*0.33).toFixed(1)}" text-anchor="middle" font-size="${(SS*0.95).toFixed(1)}" font-weight="700" fill="var(--ink)" font-family="Inter,Arial">${q.fret}</text>`);});});
  return {svg:`<svg viewBox="0 0 ${W.toFixed(1)} ${H.toFixed(1)}" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg">${S.join('')}</svg>`,W,H};}
// frets: array of 6 (low E → high e): number, 0 (open) or 'x' (muted). label optional.
function chordDiagram(frets,label){const cw=SS*1.1,top=SS*2.2,left=SS*1.4,W=left+5*cw+SS*1.2,H=top+4*cw+SS*1.0;const S=[];
  const minF=Math.min(...frets.filter(f=>typeof f==='number'&&f>0));const base=minF>3?minF:1;
  if(label)S.push(`<text x="${(left+2.5*cw).toFixed(1)}" y="${(SS*0.9).toFixed(1)}" text-anchor="middle" font-size="${(SS*0.95).toFixed(1)}" font-weight="800" fill="var(--ink)" font-family="Inter,Arial">${label}</text>`);
  S.push(`<rect x="${left}" y="${(top-SS*0.18).toFixed(1)}" width="${5*cw}" height="${(base===1?SS*0.28:SS*0.08).toFixed(1)}" fill="var(--ink)"/>`);
  for(let k=0;k<=4;k++)S.push(line(left,top+k*cw,left+5*cw,top+k*cw,1.1));
  for(let k=0;k<=5;k++)S.push(line(left+k*cw,top,left+k*cw,top+4*cw,1.1));
  if(base>1)S.push(`<text x="${(left-SS*0.3).toFixed(1)}" y="${(top+cw*0.7).toFixed(1)}" text-anchor="end" font-size="${(SS*0.75).toFixed(1)}" fill="var(--ink)" font-family="Inter,Arial">${base}fr</text>`);
  frets.forEach((f,i)=>{const x=left+i*cw;if(f==='x')S.push(`<text x="${x.toFixed(1)}" y="${(top-SS*0.45).toFixed(1)}" text-anchor="middle" font-size="${(SS*0.8).toFixed(1)}" font-weight="700" fill="var(--ink)" font-family="Inter,Arial">×</text>`);
    else if(f===0)S.push(`<circle cx="${x.toFixed(1)}" cy="${(top-SS*0.7).toFixed(1)}" r="${(SS*0.28).toFixed(1)}" fill="none" stroke="var(--ink)" stroke-width="1.3"/>`);
    else S.push(`<circle cx="${x.toFixed(1)}" cy="${(top+(f-base+0.5)*cw).toFixed(1)}" r="${(SS*0.36).toFixed(1)}" fill="var(--ink)"/>`);});
  return {svg:`<svg viewBox="0 0 ${W.toFixed(1)} ${H.toFixed(1)}" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg">${S.join('')}</svg>`,W,H};}
return {SS,GS,TOP,MID,TOPK,DUR,durVal,CLEF,KS,render,prepare,yOf,diaAt,glyph,gw,autoBeam,barLength,headName,ledgers,tab,chordDiagram};
})();
