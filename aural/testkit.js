/*blitz-stamp*/(window.BLITZ_FILES=window.BLITZ_FILES||{})["testkit.js"]="20261102e";
// testkit.js — Years 7–10 Aural and Theory Tests (shared, identical in Aural Blitz and Theory Blitz).
// The look of every test is standardised: MLSHS crest header, "AURAL SECTION /n" and "THEORY SECTION /n",
// "(a) Title: instruction (x marks)" groups, and a TOTAL MARK line. Each app builds its own section;
// the other app's section is embedded (on screen) or requested as HTML (for printing).
(function(){
  const TK={};
  const CREST='data:image/png;base64,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';
  TK.CREST=CREST;
  const esc=s=>(''+s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  TK.esc=esc;
  // marks per section for each year (both apps build their section to these totals)
  TK.MARKS={7:{a:20,t:24},8:{a:26,t:26},9:{a:26,t:26},10:{a:29,t:24}};
  TK.semester=()=>new Date().getMonth()<6?'One':'Two';
  TK.title=(y,sem)=>'Year '+y+' Aural and Theory Assessment';
  TK.subtitle=(y,sem)=>'Year '+y+' Aural and Theory Assessment – Semester '+(sem||TK.semester())+' '+new Date().getFullYear();
  // ---- test codes: year + seed, short and typeable (no confusable characters) ----
  const AL='23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  TK.newSeed=()=>{const a=crypto.getRandomValues(new Uint32Array(1))[0];return a%(32*32*32*32*32);};
  TK.code=(y,seed,sem)=>{let s='',v=seed;for(let i=0;i<5;i++){s=AL[v%32]+s;v=Math.floor(v/32);}return 'Y'+y+(sem==='One'?'S1':'S2')+'-'+s;};
  TK.parse=code=>{const m=String(code||'').trim().toUpperCase().replace(/\s+/g,'').match(/^Y(7|8|9|10)(S[12])?-?([2-9A-HJ-NP-Z]{5})$/);if(!m)return null;let v=0;for(const ch of m[3])v=v*32+AL.indexOf(ch);return {y:+m[1],seed:v,sem:m[2]==='S1'?'One':'Two'};};
  TK.roman=i=>['i','ii','iii','iv','v','vi','vii','viii'][i]||String(i+1);
  TK.letter=i=>String.fromCharCode(97+i);
  // ---- header block (screen and print) ----
  TK.header=(y,sem)=>`<div class="tsthead"><img src="${CREST}" alt="Mount Lawley Senior High School crest"><div><div class="l1">Mount Lawley Senior High School</div><div class="l2">${esc(TK.subtitle(y,sem))}</div></div></div>`;
  TK.groupHead=(g,i,showText)=>`<div class="tstq"><span>(${TK.letter(i)}) <b>${esc(g.title)}:</b> ${showText===false?'':g.text}</span><span class="mk">(${g.marks} mark${g.marks===1?'':'s'})</span></div>`;
  TK.sectionHead=(name,marks)=>`<div class="tstsec"><span>${name} SECTION</span><span>/${marks}</span></div>`;
  // o = {a: aural marks, ag: aural got|null, t: theory marks, tg: theory got|null}
  TK.totalLine=o=>{const f=v=>v===null||v===undefined?'':v;const tot=(o.ag==null||o.tg==null)?(o.ag!=null&&!o.t?o.ag:(o.tg!=null&&!o.a?o.tg:null)):Math.round((o.ag+o.tg)*2)/2;
    return `<div class="tsttot"><span>TOTAL MARK</span>${o.a?`<span>AURAL</span><span>${f(o.ag)}/${o.a}</span>`:''}${o.t?`<span>THEORY</span><span>${f(o.tg)}/${o.t}</span>`:''}<span>${f(tot)}/${(o.a||0)+(o.t||0)}</span></div>`;};
  // ---- the companion app's section as HTML (hidden iframe) ----
  TK.request=function(src,srcdoc,want,timeoutMs){return new Promise((res,rej)=>{const f=document.createElement('iframe');f.style.cssText='position:fixed;left:-3000px;top:0;width:1000px;height:1200px;opacity:0;pointer-events:none';
    let done=false;const fin=v=>{if(done)return;done=true;removeEventListener('message',h);setTimeout(()=>f.remove(),50);v instanceof Error?rej(v):res(v);};
    const h=e=>{const m=e.data;if(m&&m.type===want)fin(m);};addEventListener('message',h);
    if(src)f.src=src;else f.srcdoc=srcdoc;document.body.appendChild(f);setTimeout(()=>fin(new Error('timeout')),timeoutMs||20000);});};
  // ---- print document ----
  TK.printCSS=`:root{--ink:#000;--line:#000;--paper:#fff;--paper2:#f4f4f4;--rule:#999;--muted:#555;--shade:#eee;--accent:#000;--ox:#b3261e;--red:#b3261e;--green:#1d6b2d;--brass:#000;--cream:#fff}
    *{box-sizing:border-box}body{margin:0;font-family:Arial,Helvetica,sans-serif;font-size:11pt;color:#000;background:#fff}
    @page{size:A4;margin:12mm 14mm 14mm}
    table.pg{width:100%;border-collapse:collapse}table.pg>thead>tr>td{padding:0 0 4mm}table.pg>tbody>tr>td{padding:0}
    .tsthead{display:flex;align-items:center;gap:12px;border-top:1.5px dashed #8eaadb;border-bottom:1.5px dashed #8eaadb;padding:5px 0}
    .tsthead img{height:52px;width:auto}.tsthead .l1,.tsthead .l2{font-family:'Century Schoolbook','Century Schoolbook L',Georgia,serif;font-style:italic;font-weight:700;color:#2f5496;font-size:13pt;line-height:1.35}
    .tstname{margin:6mm 0 4mm;font-size:11pt}.tstname span{display:inline-block;border-bottom:1px solid #000;width:75%;margin-left:4px}
    .tstsec{display:flex;gap:28mm;font-weight:700;text-decoration:underline;margin:7mm 0 3mm;font-size:11.5pt}.tstsec span:last-child{text-decoration:none}
    .tstq{display:flex;justify-content:space-between;gap:10px;margin:0 0 2mm;line-height:1.35}.tstq .mk{font-weight:700;white-space:nowrap}
    .pq{break-inside:avoid;page-break-inside:avoid;margin:0 0 6mm;padding-left:6mm}.pq .tstq{margin-left:-6mm}
    .row{display:flex;flex-wrap:wrap;gap:4mm 5mm;align-items:stretch}.sec.brk{break-before:page;page-break-before:always}.cell{flex:1 1 36mm;min-width:34mm;break-inside:avoid;position:relative}.cell:not(.wide)>.ans{position:absolute;left:0;bottom:0;margin:0}.cell:not(.wide):has(>.ans){padding-bottom:9mm}.cell.wide{flex-basis:100%}.cell.wide>.ans{margin-top:2mm}.cell .lbl{font-size:10pt;margin-bottom:1mm;min-height:2.7em}.cell.wide .lbl{min-height:0}.cell svg{max-width:100%;height:auto}.cell:not(.wide) svg{max-width:min(100%,62mm);max-height:30mm;width:auto}.cell.wide svg{max-width:min(100%,150mm);max-height:38mm;width:auto}
    .ans{display:inline-block;min-width:30mm;border-bottom:1px solid #000;height:7mm;vertical-align:bottom;margin-left:2mm}.ans.k{border-bottom:0;color:#b3261e;font-weight:700;height:auto}
    .opts{display:flex;flex-wrap:wrap;gap:2mm 9mm;font-style:italic;margin:1mm 0 0 4mm}.opts .o.k{color:#b3261e;font-weight:700;font-style:normal;outline:1.5px solid #b3261e;border-radius:3mm;padding:0 2mm}
    .opts.cols{display:grid;grid-template-columns:repeat(2,minmax(40mm,max-content));gap:1.5mm 16mm}
    .qtext{margin:1mm 0 1.5mm;font-size:10.5pt}.note{font-size:9.5pt;color:#444;font-style:italic}
    .boxes{display:flex;gap:3mm;flex-wrap:wrap}.boxes .b{border:1px solid #000;min-width:16mm;height:10mm;display:flex;align-items:center;justify-content:center;font-weight:700}.boxes .b.k{color:#b3261e}.boxes .b.g{color:#555;background:#eee}.pr{font-size:9.5pt;margin-top:2mm}.pr .ans{min-width:20mm}.barset{display:flex;flex-wrap:wrap;gap:3mm}.barset .bcell{flex:1 1 40mm;max-width:calc(50% - 2mm);border:1px solid #000;padding:1mm 2mm}.barset svg{max-width:100%;height:auto}.boxes.sf{gap:2mm}.boxes.sf .b{min-width:12mm;height:8mm;font-weight:400;font-style:italic}.boxes.sf .b.k{font-weight:700}
    .tsttot{display:flex;gap:10mm;font-weight:700;margin:10mm 0 0;font-size:11.5pt}
    .keyban{border:2px solid #b3261e;color:#b3261e;font-weight:700;padding:2mm 4mm;margin:0 0 4mm;display:inline-block}
    .tracks{font-size:10pt;margin:2mm 0 0;color:#333}
    @media screen{body{background:#666}.sheet{background:#fff;max-width:200mm;margin:8mm auto;padding:12mm 14mm;box-shadow:0 3px 18px rgba(0,0,0,.5)}.bar{position:sticky;top:0;background:#222;color:#fff;padding:8px 14px;font-family:Arial;display:flex;gap:10px;align-items:center;z-index:5}.bar button{font-size:14px;padding:6px 14px;cursor:pointer}}
    @media print{.bar{display:none}.sheet{padding:0;margin:0;box-shadow:none}}`;

  // ---- answer sheet: the student's answers beside the correct answers, shown in the app (and printable) ----
  TK.ANS_CSS=`.lead{font-size:10pt;color:#333;margin:0 0 5mm}.arow{margin:0 0 4mm;break-inside:avoid;page-break-inside:avoid}
    .aq{display:flex;justify-content:space-between;gap:8px;font-size:10.5pt;margin:0 0 1.5mm}.aq .mk{font-weight:700;white-space:nowrap}
    .acols{display:grid;grid-template-columns:1fr 1fr;gap:3mm;align-items:start}.acol{border:1.5px solid #ccc;border-radius:2.5mm;padding:2mm 3mm;min-width:0}
    .acol .ah{font-size:8.5pt;font-weight:700;text-transform:uppercase;letter-spacing:.6px;color:#555;margin-bottom:1mm}
    .acol.you.ok{border-color:#1d6b2d;background:#f2f9f3}.acol.you.part{border-color:#b7791f;background:#fff8ea}.acol.you.no{border-color:#b3261e;background:#fdf2f1}
    .acol.key{border-color:#1d6b2d}.acol.key .k,.acol.key .ans.k{color:#1d6b2d!important}.acol.key .opts .o.k{outline-color:#1d6b2d!important;color:#1d6b2d!important}
    .acol .cell{min-width:0}.acol .cell .lbl{min-height:0}.acol .cell:not(.wide):has(>.ans){padding-bottom:0}.acol .cell:not(.wide)>.ans{position:static}
    .boxes .b.ok{color:#1d6b2d;border-color:#1d6b2d}.boxes .b.no{color:#b3261e;border-color:#b3261e}
    .na{color:#b3261e;font-style:italic}.yv{font-weight:700}.yv.ok{color:#1d6b2d}.yv.no{color:#b3261e}.yv.ok:after{content:' ✓'}.yv.no:after{content:' ✗'}
    .sumt{border-collapse:collapse;margin:0 0 5mm;font-size:10.5pt}.sumt td{padding:1mm 4mm 1mm 0}.sumt td.r{text-align:right;font-weight:700}
    @media screen and (max-width:720px){body{background:#fff}.sheet{margin:0;padding:4mm 3.5mm;box-shadow:none}.acols{grid-template-columns:1fr}}`;
  TK.answerSheet=function(o){let w=document.getElementById('anssheet');if(w)w.remove();w=document.createElement('div');w.id='anssheet';
    w.style.cssText='position:fixed;inset:0;z-index:9999;background:#555;display:flex;flex-direction:column';
    w.innerHTML='<div style="display:flex;gap:8px;align-items:center;padding:calc(8px + env(safe-area-inset-top,0px)) 12px 8px;background:#1b1a18;color:#fff;font:700 15px/1.2 system-ui,sans-serif"><span style="flex:1">'+esc(o.title)+'</span><button id="asprint" style="font:700 14px system-ui;padding:8px 14px;border-radius:10px;border:0;cursor:pointer">Print</button><button id="asclose" style="font:700 14px system-ui;padding:8px 14px;border-radius:10px;border:0;background:#58cc02;color:#fff;cursor:pointer">Close</button></div><iframe title="Answer sheet" style="flex:1;border:0;width:100%;background:#fff"></iframe>';
    document.body.appendChild(w);const f=w.querySelector('iframe');
    f.srcdoc='<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>'+esc(o.title)+'</title><style>'+TK.printCSS+TK.ANS_CSS+'</style></head><body><div class="sheet">'+(o.y?TK.header(o.y,o.sem):'')+
      '<div class="tstname">Name:<span>'+esc(o.name||'')+'</span></div>'+(o.summary||'')+'<p class="lead"><b>Your answer</b> is on the left and the <b>correct answer</b> on the right. Green is right, red is wrong.</p>'+o.body+'</div></body></html>';
    w.querySelector('#asclose').onclick=()=>w.remove();w.querySelector('#asprint').onclick=()=>{try{f.contentWindow.focus();f.contentWindow.print();}catch(e){}};return w;};
  TK.GOOD='#1d6b2d';TK.BAD='#b3261e';
  TK.ansRow=function(label,got,max,you,key){const cls=got>=max?'ok':got>0?'part':'no';
    return '<div class="arow"><div class="aq"><span>'+label+'</span><span class="mk">'+got+' / '+max+'</span></div><div class="acols"><div class="acol you '+cls+'"><div class="ah">Your answer</div>'+you+'</div><div class="acol key"><div class="ah">Correct answer</div>'+String(key).replace(/#b3261e/gi,'#1d6b2d')+'</div></div></div>';};
  TK.openPrint=function(title){const w=window.open('','_blank');if(!w)return null;w.document.write('<!doctype html><meta charset="utf-8"><title>'+esc(title)+'</title><body style="font-family:Arial;padding:30px">Preparing the test…</body>');return w;};
  TK.fillPrint=function(w,o){const doc=`<!doctype html><html><head><meta charset="utf-8"><title>${esc(o.title)}</title><style>${TK.printCSS}${TK.drumCSS||''}</style></head><body>
    <div class="bar"><b>${esc(o.title)}</b><span style="flex:1"></span><button onclick="print()">Print</button></div>
    <div class="sheet"><table class="pg"><thead><tr><td>${TK.header(o.y,o.sem)}</td></tr></thead><tbody><tr><td>
    ${o.key?'<div class="keyban">ANSWER KEY · '+(TK.ctTitle?'custom test · ':'test code ')+esc(o.code)+'</div>':''}
    <div class="tstname">Name:<span>${o.key?'':''}</span></div>
    ${o.sections.map((s,i)=>'<div class="sec'+(i?' brk':'')+'">'+s.html+'</div>').join('')}
    ${TK.totalLine({a:o.aMarks,t:o.tMarks})}
    ${o.key?(TK.ctTitle?'<p class="note" style="margin-top:6mm">Custom test · '+esc(o.code)+' · play the aural tracks from Teacher tools → Set a task → Custom test → open this test → Play the tracks.</p>':'<p class="note" style="margin-top:6mm">Test code '+esc(o.code)+' · play the aural tracks from Aural Blitz → Test → Teacher: print or play this test → Play the tracks, using this code.</p>'):''}
    </td></tr></tbody></table></div></body></html>`;
    w.document.open();w.document.write(doc);w.document.close();};
  // ---- on-screen styles ----
  const css=`body.paper.testmode .rhead{display:none}
  .tsthead{display:flex;align-items:center;gap:12px;border-top:1.5px dashed #8eaadb;border-bottom:1.5px dashed #8eaadb;padding:5px 0;margin:0 0 12px}
  .tsthead img{height:50px;width:auto}.tsthead .l1,.tsthead .l2{font-family:'Century Schoolbook','Century Schoolbook L',Georgia,serif;font-style:italic;font-weight:700;color:#2f5496;font-size:16px;line-height:1.35}
  .tstsec{display:flex;gap:90px;font-weight:700;text-decoration:underline;margin:8px 0 10px;font-size:15px}.tstsec span:last-child{text-decoration:none}
  .tstq{display:flex;justify-content:space-between;gap:12px;margin:4px 0 8px;font-size:14px;line-height:1.45}.tstq .mk{font-weight:700;white-space:nowrap}
  .tstsub{font-weight:700;font-size:14px;margin:2px 0 6px}
  .tstpos{display:flex;justify-content:flex-end;font-size:12px;color:#555;margin:-6px 0 6px}
  .tsttot{display:flex;gap:28px;flex-wrap:wrap;font-weight:700;margin:16px 0 6px;font-size:15px}
  .tstname{margin:10px 0 14px;font-size:14px}.tstname span{display:inline-block;border-bottom:1px solid #000;min-width:60%;margin-left:6px;font-weight:700}
  .tstcover .controls{margin-top:14px}.tstcover table{border-collapse:collapse;margin:8px 0 12px;font-size:13.5px}.tstcover td,.tstcover th{border:1px solid #000;padding:6px 14px;text-align:left}
  .tstcover .codebox{display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin:6px 0}.tstcover .codebox input{padding:7px 10px;border:1px solid #000;font-family:ui-monospace,Consolas,monospace;font-size:14px;width:160px;text-transform:uppercase}
  .tsttracks .trk{display:flex;align-items:center;gap:10px;flex-wrap:wrap;border-bottom:1px solid #ccc;padding:8px 0}.tsttracks .trk b{min-width:80px}.tsttracks .trk span{flex:1;min-width:180px}
  .tsttracks button{border:1px solid #000;background:#fff;padding:6px 12px;cursor:pointer;font-family:Arial,sans-serif;font-size:13px}.tsttracks button.on{background:#000;color:#fff}`;
  const st=document.createElement('style');st.textContent=css;document.head.appendChild(st);
  // =====================================================================================
  // CUSTOM TESTS — a teacher builds a test from question blocks; the spec travels in the
  // class-task code and in the embed URL, and each app builds its own section from it.
  // spec = {v:1, ti, y, A:[block], T:[block]}   block = {k, n, m, o:{...}, t?:heading, x?:instruction}
  // =====================================================================================
  TK.ctTitle=null;   // set by the app while a custom test is open: replaces the standard heading
  const _title=TK.title,_sub=TK.subtitle;
  TK.title=(y,sem)=>TK.ctTitle||_title(y,sem);
  TK.subtitle=(y,sem)=>TK.ctTitle||_sub(y,sem);
  const b64e=s=>btoa(unescape(encodeURIComponent(s))).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
  const b64d=s=>decodeURIComponent(escape(atob(String(s).replace(/-/g,'+').replace(/_/g,'/'))));
  TK.ctEncode=ct=>b64e(JSON.stringify(ct));
  TK.ctDecode=s=>{if(!s)return null;try{return TK.ctClean(typeof s==='string'?JSON.parse(b64d(s)):s);}catch(e){return null;}};
  const IVS=[['m2','min 2nd'],['M2','Maj 2nd'],['m3','min 3rd'],['M3','Maj 3rd'],['P4','Perf 4th'],['TT','Tritone'],['P5','Perf 5th'],['m6','min 6th'],['M6','Maj 6th'],['m7','min 7th'],['M7','Maj 7th'],['P8','Perf 8ve'],['m9','min 9th'],['M9','Maj 9th']];
  TK.IVS=IVS;
  const MAJ15=['C','G','D','A','E','B','F#','C#','F','Bb','Eb','Ab','Db','Gb','Cb'];
  const pretty=s=>String(s).replace(/#/g,'♯').replace(/b$/,'♭').replace(/^([A-G])b/,'$1♭');
  TK.prettyKey=pretty;
  const DRUM_ROWS=[['hh','Hi-hat'],['sn','Snare drum'],['bd','Bass drum']];TK.DRUM_ROWS=DRUM_ROWS;
  // option builders: multi (chips), one (single choice), text, drum (pattern editor)
  const M=(key,label,ch,def)=>({key,label,type:'multi',ch,def}),O1=(key,label,ch,def)=>({key,label,type:'one',ch,def}),TX=(key,label,def,ph)=>({key,label,type:'text',def,ph}),DR=(key,label)=>({key,label,type:'drum'});
  const BARS=[['1','1 bar'],['2','2 bars'],['4','4 bars']],METS=[['2/4','2/4'],['3/4','3/4'],['4/4','4/4'],['6/8','6/8'],['9/8','9/8'],['12/8','12/8']];
  const AS=[['major pentatonic','Major pentatonic'],['major','Major'],['minor pentatonic','Minor pentatonic'],['natural minor','Natural minor'],['harmonic minor','Harmonic minor']];
  // n: questions in the block (null = one item whose marks are m); m: marks per question
  TK.BLOCKS={
   A:[
    {k:'drumT',label:'Drum dictation: you play a song',title:'Drum Dictation',desc:'You play a recording in class; students fill in the hi-hat, snare and bass drum grid. Enter the correct pattern below so it marks itself (1 mark per beat, ½ off for one wrong part).',n:null,m:8,
      opts:[TX('song','Song and artist','Island in the Sun by Weezer'),TX('section','Section to play','chorus'),O1('bars','Length',[['1','1 bar'],['2','2 bars']],'2'),M('rows','Parts',DRUM_ROWS,['hh','sn','bd']),DR('pat','Correct pattern (tap the quavers that are played)')]},
    {k:'drum',label:'Drum dictation: the app plays a groove',title:'Drum Dictation',desc:'A synthesised 4/4 drum groove; students fill in the grid. Marked 1 mark per beat, ½ off for one wrong part.',n:null,m:8,
      opts:[O1('bars','Length',[['1','1 bar'],['2','2 bars']],'2'),M('rows','Parts',DRUM_ROWS,['hh','sn','bd']),O1('level','Groove',[['simple','Straight rock (kick on 1 and 3)'],['sync','Syncopated kick (and-beats)'],['fill','With a snare fill in the last beat']],'sync')]},
    {k:'ivl',label:'Interval recognition',title:'Interval Recognition',desc:'Students name each interval they hear, from the list you choose.',n:5,m:0.5,
      opts:[M('ivls','Intervals to choose from',IVS,['m2','M2','P4','P5','P8']),O1('dir','Played',[['up','Ascending'],['down','Descending'],['both','Ascending and descending'],['harm','Together (harmonic)']],'up')]},
    {k:'ton',label:'Tonality recognition',title:'Tonality Recognition',desc:'A short work; students choose the tonality.',n:3,m:1,
      opts:[M('tons','Tonalities to choose from',[['Major','Major'],['Natural minor','Natural minor'],['Harmonic minor','Harmonic minor'],['Minor','Minor (either)'],['Pentatonic','Pentatonic']],['Major','Natural minor','Harmonic minor']),O1('play','Played as',[['harm','Melody with chords'],['melody','Melody only']],'harm')]},
    {k:'pd',label:'Melodic dictation: rhythm given',title:'Melodic Dictation',desc:'The rhythm is printed; students write the sol-fa and the notes on the stave.',n:null,m:7,
      opts:[M('scales','Scale',AS,['harmonic minor']),M('metres','Time signature',METS,['6/8']),O1('bars','Length',BARS,'4'),O1('given','Given',[['note','The first note'],['bar','The first bar']],'bar'),O1('sf','Sol-fa boxes',[['yes','Yes'],['no','No']],'yes'),O1('clef','Clef',[['treble','Treble'],['bass','Bass']],'treble')]},
    {k:'md',label:'Melodic dictation: rhythm and pitch',title:'Melodic Dictation',desc:'Nothing printed but the first note; students write rhythm and pitch.',n:null,m:9,
      opts:[M('scales','Scale',AS,['major','natural minor']),M('metres','Time signature',METS,['2/4','3/4','4/4']),O1('bars','Length',BARS,'2'),O1('clef','Clef',[['treble','Treble'],['bass','Bass']],'treble')]},
    {k:'sfd',label:'Sol-fa dictation',title:'Melodic Dictation – Sol-fa',desc:'The rhythm is printed; students write only the sol-fa, one box per note.',n:null,m:6,
      opts:[M('scales','Scale',AS,['major pentatonic']),M('metres','Time signature',METS,['2/4','3/4','4/4']),O1('bars','Length',BARS,'2')]},
    {k:'two',label:'Two-part dictation (sol-fa)',title:'Two-Part Dictation',desc:'Two parts play together; both rhythms are printed and students write the sol-fa of each part. The first bar of the upper part and the first note of the lower part are given.',n:null,m:5,
      opts:[O1('scale','Scale',[['major','Major'],['natural minor','Natural minor'],['harmonic minor','Harmonic minor']],'natural minor'),O1('metre','Time signature',[['2/4','2/4'],['3/4','3/4'],['4/4','4/4'],['6/8','6/8']],'6/8'),O1('bars','Length',[['2','2 bars'],['4','4 bars']],'4')]},
    {k:'rd',label:'Rhythmic dictation',title:'Rhythmic Dictation',desc:'Students write the rhythm they hear on a single-line stave.',n:null,m:8,
      opts:[M('metres','Time signature',METS,['2/4','3/4','4/4','6/8']),O1('bars','Length',BARS,'4'),O1('source','Played as',[['pitch','One pitch'],['melody','The rhythm of a melody']],'melody')]},
    {k:'prog',label:'Chord progression',title:'Chord Progression',desc:'Students write the Roman numeral of each chord after the first.',n:null,m:3,
      opts:[M('chords','Chords',[['I','I'],['ii','ii'],['IV','IV'],['V','V'],['vi','vi']],['I','IV','V','vi']),O1('length','Chords',[['3','3 chords'],['4','4 chords']],'4')]},
    {k:'cad',label:'Cadences',title:'Cadences',desc:'Students name each cadence.',n:3,m:1,
      opts:[M('cads','Cadences',[['Perfect','Perfect'],['Plagal','Plagal'],['Imperfect','Imperfect'],['Interrupted','Interrupted']],['Perfect','Plagal','Imperfect'])]},
    {k:'met',label:'Metre',title:'Metre',desc:'Students choose the time signature of a groove.',n:3,m:1,
      opts:[M('metres','Time signatures',[['2/4','2/4'],['3/4','3/4'],['4/4','4/4'],['6/8','6/8'],['9/8','9/8'],['12/8','12/8']],['2/4','3/4','4/4','6/8'])]},
    {k:'tim',label:'Instruments',title:'Instruments',desc:'Students name the instrument they hear.',n:2,m:1,opts:[]},
    {k:'anal',label:'Aural analysis (one excerpt)',title:'Aural Analysis',desc:'One excerpt; students give its tonality, texture and time signature.',n:3,m:1,nMax:3,opts:[]},
   ],
   T:[
    {k:'ksgrid',label:'Key signature grid',title:'Key Signatures',desc:'The sharp-keys and flat-keys tables: students fill in the accidental each key adds and its relative minor. ½ mark per box by default.',n:null,m:0.5,perCell:true,
      opts:[M('sides','Tables',[['sharp','Sharp keys'],['flat','Flat keys']],['sharp','flat']),O1('given','Filled in already',[['last4','The last four keys'],['first4','The first four keys'],['none','Nothing']],'last4')]},
    {k:'kswrite',label:'Write key signatures',title:'Key Signatures',desc:'Students write each key signature. On the grand stave, each clef is half the marks.',n:4,m:1,
      opts:[O1('clef','Stave',[['both','Treble and bass'],['treble','Treble'],['bass','Bass']],'both'),M('keys','Keys (leave empty for random)',MAJ15.map(k=>[k,pretty(k)+' major']),[]),O1('names','Name each key as',[['both','Major / relative minor'],['major','Major only']],'both')]},
    {k:'ksid',label:'Name key signatures',title:'Key Signatures',desc:'Students name the key of each key signature.',n:4,m:1,opts:[]},
    {k:'transp',label:'Transposition to a new key',title:'Transposition',desc:'Students write the new key signature and every note. Marked in proportion (key signature plus each note).',n:null,m:10,
      opts:[O1('from','From',[['','Any major key']].concat(MAJ15.slice(0,12).map(k=>[k,pretty(k)+' major'])),'G'),O1('iv','Into',[['','Any'],['up M2','Up a major 2nd'],['up m3','Up a minor 3rd'],['up P4','Up a perfect 4th'],['up P5','Up a perfect 5th'],['down M2','Down a major 2nd'],['down m3','Down a minor 3rd'],['down P4','Down a perfect 4th'],['down P5','Down a perfect 5th']],'down P4'),
        O1('metre','Time signature',[['2/4','2/4'],['3/4','3/4'],['4/4','4/4'],['6/8','6/8']],'6/8'),O1('bars','Length',[['2','2 bars'],['4','4 bars']],'4'),O1('clef','Clef',[['treble','Treble'],['bass','Bass'],['mix','Either']],'treble')]},
    {k:'keymel',label:'Key of a melody',title:'Visual Recognition of Key',desc:'A melody with its key signature; students choose its key from three: the right one, its relative and a near miss.',n:2,m:1,
      opts:[M('types','Keys used',[['major','Major'],['natural minor','Natural minor'],['harmonic minor','Harmonic minor']],['major','harmonic minor']),O1('clef','Clef',[['mix','Treble and bass'],['treble','Treble'],['bass','Bass']],'mix')]},
    {k:'ivkey',label:'Intervals above a tonic',title:'Intervals',desc:'One stave of intervals above the same tonic, in its major key signature, with the first one named as an example.',n:6,m:1,
      opts:[O1('tonic','Tonic',['C','G','D','A','F','Bb','Eb'].map(k=>[k,pretty(k)+' (in '+pretty(k)+' major)']),'G'),M('q','Qualities',[['M','Major'],['m','Minor'],['P','Perfect']],['M','m','P'])]},
    {k:'ivmel',label:'Intervals in a melody',title:'Intervals',desc:'A melody with bracketed pairs of notes; students name each bracketed interval.',n:2,m:1,
      opts:[O1('clef','Clef',[['bass','Bass'],['treble','Treble']],'bass')]},
    {k:'ivname',label:'Name intervals',title:'Intervals',desc:'Students name each interval.',n:4,m:1,opts:[]},
    {k:'ivwrite',label:'Write intervals',title:'Intervals',desc:'Students notate the upper note.',n:4,m:1,opts:[]},
    {k:'notes',label:'Note names',title:'Note Names',desc:'Students name each note.',n:4,m:1,opts:[O1('mode','Students',[['name','Name the note'],['write','Write the note']],'name')]},
    {k:'scale',label:'Write a scale',title:'Scales',desc:'Students write one octave, with sol-fa under each note.',n:1,m:4,
      opts:[M('scales','Scales',[['major','Major'],['natminor','Natural minor'],['harmminor','Harmonic minor'],['majpent','Major pentatonic'],['minpent','Minor pentatonic']],['major','harmminor']),O1('sf','Sol-fa',[['yes','Yes'],['no','No']],'yes')]},
    {k:'scaleid',label:'Name the scale',title:'Identify the Scale',desc:'Students name the scale.',n:1,m:2,opts:[]},
    {k:'chordid',label:'Name chords',title:'Chords',desc:'Students name each chord.',n:2,m:1,opts:[]},
    {k:'chordw',label:'Notate chords',title:'Notating Chords',desc:'Students write each chord.',n:2,m:1,opts:[]},
    {k:'chordrn',label:'Chords and Roman numerals',title:'Chords',desc:'Students name the chord and give its Roman numeral.',n:1,m:2,opts:[]},
    {k:'rhythm',label:'Time signatures and bars',title:'Rhythm',desc:'Name the time signature, then complete each bar.',n:4,m:1,opts:[]},
    {k:'values',label:'Note and rest values',title:'Note and Rest Values',desc:'Questions on note and rest values.',n:4,m:1,opts:[]},
    {k:'terms',label:'Terms and signs',title:'Terms and Signs',desc:'Musical terms and signs.',n:4,m:1,opts:[]},
    {k:'harm',label:'Harmony',title:'Harmony',desc:'Roman numerals and cadences.',n:2,m:1,opts:[]},
   ]};
  TK.blockDef=(sec,k)=>(TK.BLOCKS[sec]||[]).find(b=>b.k===k);
  TK.opt=(b,key)=>{const d=TK.blockDef(b.sec||b._s,b.k)||TK.blockDef('A',b.k)||TK.blockDef('T',b.k);const od=d&&d.opts.find(o=>o.key===key);const v=b.o&&b.o[key];
    if(od&&od.type==='multi')return (v&&v.length)?v:(od.def||[]);if(v!==undefined&&v!==null&&v!=='')return v;return od?od.def:undefined;};
  TK.cellsOf=b=>{const sides=TK.opt(Object.assign({sec:'T'},b),'sides');const g=TK.opt(Object.assign({sec:'T'},b),'given');return sides.length*(g==='none'?16:8);};
  TK.blockMarks=(sec,b)=>{const d=TK.blockDef(sec,b.k);if(!d)return 0;if(d.perCell)return Math.round(TK.cellsOf(b)*b.m*2)/2;const n=d.n===null?1:(b.n||d.n);return Math.round(n*b.m*4)/4;};
  TK.ctMarks=(ct,sec)=>ct?Math.round((ct[sec]||[]).reduce((a,b)=>a+TK.blockMarks(sec,b),0)*2)/2:0;
  TK.ctClean=function(o){if(!o||typeof o!=='object')return null;const y=Math.max(7,Math.min(12,parseInt(o.y,10)||9));const out={v:1,ti:String(o.ti||('Year '+y+' Test')).slice(0,80),y,A:[],T:[]};
    ['A','T'].forEach(sec=>(Array.isArray(o[sec])?o[sec]:[]).slice(0,20).forEach(b=>{const d=TK.blockDef(sec,b&&b.k);if(!d)return;
      const nb={k:d.k,m:Math.max(0.25,Math.min(30,Math.round((+b.m||d.m)*4)/4)),o:{}};if(d.n!==null)nb.n=Math.max(1,Math.min(d.nMax||12,parseInt(b.n,10)||d.n));
      if(b.t)nb.t=String(b.t).slice(0,60);if(b.x)nb.x=String(b.x).slice(0,400);if(b.nt)nb.nt=String(b.nt).slice(0,300);
      d.opts.forEach(od=>{const v=b.o&&b.o[od.key];if(v===undefined)return;if(od.type==='multi'&&Array.isArray(v))nb.o[od.key]=v.filter(x=>od.ch.some(c=>c[0]===x));else if(od.type==='one'&&od.ch.some(c=>c[0]===v))nb.o[od.key]=v;else if(od.type==='text')nb.o[od.key]=String(v).slice(0,80);
        else if(od.type==='drum'&&v&&typeof v==='object'){const p={};DRUM_ROWS.forEach(([r])=>{p[r]=String(v[r]||'').replace(/[^01]/g,'').slice(0,16);});nb.o[od.key]=p;}});
      out[sec].push(nb);}));return out;};
  // ---- presets ----
  TK.PRESETS=[{id:'y9mus',label:'Year 9 Musicianship Test',ct:{v:1,ti:'Year 9 Musicianship Test',y:9,
    A:[{k:'drumT',m:8,t:'Drum Dictation',o:{song:'Island in the Sun by Weezer',section:'chorus',bars:'2',rows:['hh','sn','bd'],pat:{hh:'1111111111111111',sn:'0010001000100010',bd:'1000100010001101'}}},
       {k:'drumT',m:4,t:'Drum Dictation',x:'Listen to what the kick and snare drum are doing in the pre-chorus of Thinking Out Loud by Ed Sheeran. Write what you hear.',o:{song:'Thinking Out Loud by Ed Sheeran',section:'pre-chorus',bars:'1',rows:['sn','bd'],pat:{hh:'',sn:'00100010',bd:'10010100'}}},
       {k:'ivl',n:5,m:0.5,t:'Interval Recognition',o:{ivls:['m2','M2','P4','P5','P8'],dir:'up'}},
       {k:'ivl',n:5,m:0.5,t:'Interval Recognition',o:{ivls:['m3','M3','m6','M6'],dir:'up'}},
       {k:'ton',n:3,m:1,t:'Tonality Recognition',o:{tons:['Major','Natural minor','Harmonic minor'],play:'harm'}},
       {k:'pd',m:7,t:'Melodic Dictation – Harmonic Minor',o:{scales:['harmonic minor'],metres:['6/8'],bars:'4',given:'bar',sf:'yes',clef:'treble'}},
       {k:'two',m:5,t:'Two-Part Dictation – Natural Minor',o:{scale:'natural minor',metre:'6/8',bars:'4'}}],
    T:[{k:'ksgrid',m:0.5,t:'Key Signatures',o:{sides:['sharp','flat'],given:'last4'}},
       {k:'kswrite',n:4,m:1,t:'Key Signatures',o:{clef:'both',keys:['Eb','Bb','A','D'],names:'both'}},
       {k:'transp',m:10,t:'Transposition',o:{from:'G',iv:'down P4',metre:'6/8',bars:'4'}},
       {k:'keymel',n:2,m:1,t:'Visual Recognition of Key',o:{types:['major','harmonic minor'],clef:'mix'}},
       {k:'ivkey',n:6,m:1,t:'Intervals',o:{tonic:'G',q:['M','m','P']}},
       {k:'ivmel',n:2,m:1,t:'Intervals',o:{clef:'bass'}}]}}];

  // ---- drum grid (4/4, quaver steps): screen entry, results, paper and key ----
  TK.drumSteps=bars=>8*(+bars||1);
  TK.drumScore=function(pat,got,rows,bars){const steps=TK.drumSteps(bars);const beats=steps/2;const sc=[];
    for(let b=0;b<beats;b++){let wrong=0;rows.forEach(r=>{const want=(pat[r]||'').padEnd(steps,'0'),have=(got&&got[r]||'').padEnd(steps,'0');if(want[2*b]!==have[2*b]||want[2*b+1]!==have[2*b+1])wrong++;});sc.push(wrong===0?1:wrong===1&&rows.length>1?0.5:0);}
    return {frac:beats?sc.reduce((a,x)=>a+x,0)/beats:0,beats:sc};};
  // stick-notation glyph for one beat: (1,0) crotchet |, (1,1) quaver pair, (0,1) rest + quaver
  TK.stick=function(a,b,col){const c=col||'currentColor';if(a==='1'&&b==='1')return `<svg viewBox="0 0 18 16" width="18" height="16" aria-label="two quavers"><path d="M3 15V2H15V15" fill="none" stroke="${c}" stroke-width="1.8"/></svg>`;
    if(a==='1')return `<svg viewBox="0 0 18 16" width="18" height="16" aria-label="crotchet"><path d="M5 2V15" stroke="${c}" stroke-width="1.8"/></svg>`;
    if(b==='1')return `<svg viewBox="0 0 22 16" width="22" height="16" aria-label="quaver rest then quaver"><circle cx="4" cy="6" r="1.7" fill="${c}"/><path d="M4.5 6.5Q7 6.5 8 4.5L4.5 14" fill="none" stroke="${c}" stroke-width="1.4"/><path d="M15 15V2Q16 6 20 8" fill="none" stroke="${c}" stroke-width="1.6"/></svg>`;return '';};
  // mode: 'edit' (tap cells), 'show' (read-only), 'result' (with per-beat marks against pat)
  TK.drumGridHtml=function(o){const bars=+o.bars||1,rows=o.rows||['hh','sn','bd'],st=o.state||{},steps=TK.drumSteps(bars);const sc=o.mode==='result'?TK.drumScore(o.pat||{},st,rows,bars).beats:null;
    let h='<div class="dgw">';for(let bar=0;bar<bars;bar++){h+=`<table class="dg"><tr><th></th><th colspan="8" class="dgbar">Bar ${bar+1}</th></tr><tr><th></th>${['1','&','2','&','3','&','4','&'].map(x=>`<th class="dgb">${x}</th>`).join('')}</tr>`;
      rows.forEach(r=>{const lab=(DRUM_ROWS.find(x=>x[0]===r)||[r,r])[1];const s=(st[r]||'').padEnd(steps,'0');h+=`<tr><th class="dgl">${lab}</th>`;
        for(let i=0;i<8;i++){const idx=bar*8+i,on=s[idx]==='1',beat=idx>>1;const cls='dgc'+(on?' on':'')+(i%2?' off':' dn')+(sc?(sc[beat]===1?' ok':sc[beat]>0?' part':' no'):'');
          h+=o.mode==='edit'?`<td class="${cls}"><button data-r="${r}" data-i="${idx}" aria-label="${lab} ${bar+1}.${['1','1&','2','2&','3','3&','4','4&'][i]}" aria-pressed="${on}">${on?'●':''}</button></td>`:`<td class="${cls}">${on?'●':''}</td>`;}
        h+='</tr>';});h+='</table>';}
    return h+'</div>';};
  TK.wireDrumGrid=function(el,o,onChange){el.querySelectorAll('.dgc button').forEach(btn=>btn.onclick=()=>{const r=btn.dataset.r,i=+btn.dataset.i;const steps=TK.drumSteps(o.bars);const s=(o.state[r]||'').padEnd(steps,'0').split('');s[i]=s[i]==='1'?'0':'1';o.state[r]=s.join('');
      const on=s[i]==='1';btn.textContent=on?'●':'';btn.setAttribute('aria-pressed',on);btn.parentNode.classList.toggle('on',on);if(onChange)onChange(o.state);});};
  // paper: one box per beat, as on the printed test; key fills the boxes with stick notation
  TK.drumPaper=function(o,key){const bars=+o.bars||1,rows=o.rows||['hh','sn','bd'],pat=o.pat||{},steps=TK.drumSteps(bars);
    let h=`<table class="dgp"><tr><th></th>${Array.from({length:bars},(_,b)=>`<th colspan="4">Bar ${b+1}</th>`).join('')}</tr>`;
    rows.forEach(r=>{const lab=(DRUM_ROWS.find(x=>x[0]===r)||[r,r])[1];const s=(pat[r]||'').padEnd(steps,'0');h+=`<tr><th>${lab}</th>`;for(let b=0;b<steps/2;b++)h+=`<td${b&&b%4===0?' style="border-left:2.5px solid #000"':''}>${key?TK.stick(s[2*b],s[2*b+1],'#b3261e'):''}</td>`;h+='</tr>';});
    return h+'</table>';};
  TK.drumCSS=`.dgw{display:flex;flex-wrap:wrap;gap:10px 18px;margin:6px 0 10px}.dg{border-collapse:collapse;font-size:12px}.dg th{font-weight:700;padding:2px 4px;text-align:left}.dg .dgbar{text-align:center;border-bottom:1px solid #000}.dg .dgb{text-align:center;color:#555;font-weight:600;width:30px}
    .dg td{border:1px solid #999;width:30px;height:30px;padding:0;text-align:center}.dg td.dn{border-left:2px solid #000}.dg td.on{background:#1b1a18;color:#fff}.dg td button{width:100%;height:30px;border:0;background:transparent;font-size:14px;cursor:pointer;color:inherit;padding:0}
    .dg td.ok{box-shadow:inset 0 -4px 0 #1d6b2d}.dg td.part{box-shadow:inset 0 -4px 0 #c98a00}.dg td.no{box-shadow:inset 0 -4px 0 #b3261e}.dg .dgl{white-space:nowrap;padding-right:8px}
    .dgp{border-collapse:collapse;margin:2mm 0 1mm;font-size:10pt}.dgp th{text-align:left;padding:1mm 3mm;font-weight:700;white-space:nowrap}.dgp tr:first-child th{text-align:center}.dgp td{border:1px solid #000;width:19mm;height:8mm;text-align:left;padding-left:2mm;vertical-align:middle}.dgp tr:first-child th:first-child{border:0}
    .dgp td svg{vertical-align:middle}.kgrid{border-collapse:collapse;font-family:'Times New Roman',Times,serif;font-size:12pt;margin:2mm 0}.kgrid th,.kgrid td{border:1px solid #000;padding:1mm 2.5mm;min-width:11mm;height:7mm;text-align:left}.kgrid th.rh{font-family:Arial,Helvetica,sans-serif;font-weight:700;font-size:10.5pt;min-width:44mm}.kgrid td.g{background:#d9d9d9;font-weight:700}.kgrid td.k{color:#b3261e}`;

  // =====================================================================================
  // TEST BUILDER (teacher tools). H = {app, modal(html,wide), close(), toast(t), preview(ct,seed), print(ct,seed,key), tracks(ct,seed), push(ct,seed)}
  // =====================================================================================
  const LSK='blitzCustomTests';
  const lsGet=(k,d)=>{try{const v=localStorage.getItem(k);return v?JSON.parse(v):d;}catch(e){return d;}};const lsSet=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v));}catch(e){}};
  TK.savedTests=()=>lsGet(LSK,[]);
  const saveTest=t=>{const L=TK.savedTests().filter(x=>x.id!==t.id);t.at=Date.now();L.unshift(t);lsSet(LSK,L.slice(0,40));};
  const rid=()=>Math.random().toString(36).slice(2,10);
  let BH=null,CUR=null;
  const half=v=>{const r=Math.round(v*4)/4;return (r%1===0?String(r):r%1===0.5?(Math.floor(r)?Math.floor(r)+'½':'½'):String(r));};
  TK.half=half;
  TK.openBuilder=function(H){BH=H;const last=lsGet('blitzCustomTestOpen','');const t=last&&TK.savedTests().find(x=>x.id===last);if(t){CUR=JSON.parse(JSON.stringify(t));edit();}else home();};
  function home(){const L=TK.savedTests();lsSet('blitzCustomTestOpen','');
    BH.modal(`<p class="prompt">Custom tests</p><p class="sub">Build a test from question blocks, print it with its answer key, play its tracks to the class, or push it out as a class-task link. Tests are saved on this device.</p>
      <div class="setgrp"><div class="setlabel">Copy the shape of a test you already have</div>${importZone()}</div>
      <div class="setgrp"><div class="setlabel">Or start a new test</div><div class="ctnew">${TK.PRESETS.map(p=>`<button class="btn-ghost" data-pre="${p.id}">From <b>${esc(p.label)}</b></button>`).join('')}<button class="btn-ghost" data-pre="">Blank test</button></div></div>
      <div class="setgrp"><div class="setlabel">Your tests</div>${L.length?`<div class="ctlist">${L.map(t=>`<div class="ctrow"><div><b>${esc(t.ct.ti)}</b><span class="sub" style="margin:0"> · Year ${t.ct.y} · ${TK.ctMarks(t.ct,'A')+TK.ctMarks(t.ct,'T')} marks · ${new Date(t.at).toLocaleDateString('en-AU')}</span></div><div class="ctbtns"><button class="btn-check" data-open="${t.id}">Open</button><button class="btn-ghost" data-dup="${t.id}">Copy</button><button class="btn-ghost" data-del="${t.id}">Delete</button></div></div>`).join('')}</div>`:'<p class="sub">None yet.</p>'}</div>`,true);
    const m=document.getElementById('tkmodal')||document;wireImport(m);
    m.querySelectorAll('[data-pre]').forEach(b=>b.onclick=()=>{const p=TK.PRESETS.find(x=>x.id===b.dataset.pre);CUR={id:rid(),seed:TK.newSeed(),ct:TK.ctClean(p?p.ct:{ti:'New test',y:9,A:[],T:[]})};saveTest(CUR);edit();});
    m.querySelectorAll('[data-open]').forEach(b=>b.onclick=()=>{CUR=JSON.parse(JSON.stringify(TK.savedTests().find(x=>x.id===b.dataset.open)));edit();});
    m.querySelectorAll('[data-dup]').forEach(b=>b.onclick=()=>{const t=JSON.parse(JSON.stringify(TK.savedTests().find(x=>x.id===b.dataset.dup)));t.id=rid();t.seed=TK.newSeed();t.ct.ti=t.ct.ti+' (copy)';saveTest(t);home();});
    m.querySelectorAll('[data-del]').forEach(b=>b.onclick=()=>{const t=TK.savedTests().find(x=>x.id===b.dataset.del);if(!t||!confirm('Delete "'+t.ct.ti+'"? This can\'t be undone.'))return;lsSet(LSK,TK.savedTests().filter(x=>x.id!==t.id));home();});}
  function optHtml(sec,bi,b,od){const id=`o_${sec}_${bi}_${od.key}`;const v=TK.opt(Object.assign({sec},b),od.key);
    if(od.type==='multi')return `<div class="ctopt"><div class="setlabel">${esc(od.label)}</div><div class="setchips">${od.ch.map(c=>`<button class="chip${v.includes(c[0])?' on':''}" data-ms="${sec}|${bi}|${od.key}|${esc(c[0])}">${esc(c[1])}</button>`).join('')}</div></div>`;
    if(od.type==='one')return `<div class="ctopt"><div class="setlabel">${esc(od.label)}</div><select class="setsel" data-os="${sec}|${bi}|${od.key}">${od.ch.map(c=>`<option value="${esc(c[0])}"${v===c[0]?' selected':''}>${esc(c[1])}</option>`).join('')}</select></div>`;
    if(od.type==='text')return `<div class="ctopt"><div class="setlabel">${esc(od.label)}</div><input class="tkin" maxlength="80" data-ot="${sec}|${bi}|${od.key}" value="${esc(v||'')}" placeholder="${esc(od.ph||'')}"></div>`;
    if(od.type==='drum'){const rows=TK.opt(Object.assign({sec},b),'rows'),bars=TK.opt(Object.assign({sec},b),'bars');return `<div class="ctopt"><div class="setlabel">${esc(od.label)}</div><div data-dg="${sec}|${bi}">${TK.drumGridHtml({bars,rows,state:Object.assign({},(b.o&&b.o.pat)||{}),mode:'edit'})}</div></div>`;}
    return '';}
  function blockHtml(sec,b,bi){const d=TK.blockDef(sec,b.k);const mk=TK.blockMarks(sec,b);const letter=TK.letter(bi);
    return `<div class="ctblk"><div class="ctbh"><span class="ctl">(${letter})</span><input class="tkin ctti" data-tt="${sec}|${bi}" value="${esc(b.t||d.title)}" maxlength="60" aria-label="Heading"><span class="ctmk">${half(mk)} mark${mk===1?'':'s'}</span>
        <button class="ctib" data-mv="${sec}|${bi}|-1" title="Move up" aria-label="Move up">↑</button><button class="ctib" data-mv="${sec}|${bi}|1" title="Move down" aria-label="Move down">↓</button><button class="ctib" data-rm="${sec}|${bi}" title="Remove" aria-label="Remove">✕</button></div>
      <div class="ctkind">${esc(d.label)}</div>${b.nt?`<div class="ctflag">⚠ ${esc(b.nt)}<button data-ntd="${sec}|${bi}">Done</button></div>`:''}
      <div class="ctnums">${d.n!==null?`<span class="ctnum"><span>Questions</span><button data-nn="${sec}|${bi}|-1">−</button><b>${b.n}</b><button data-nn="${sec}|${bi}|1">+</button></span>`:''}
        <span class="ctnum"><span>${d.perCell?'Marks per box':d.n===null?'Marks':'Marks each'}</span><button data-mm="${sec}|${bi}|-1">−</button><b>${half(b.m)}</b><button data-mm="${sec}|${bi}|1">+</button></span></div>
      ${d.opts.map(od=>optHtml(sec,bi,b,od)).join('')}
      <details class="ctx"${b.x?' open':''}><summary>Wording for students</summary><textarea class="tkin" rows="2" maxlength="400" data-tx="${sec}|${bi}" placeholder="Leave empty to use the standard instruction">${esc(b.x||'')}</textarea></details></div>`;}
  function edit(){const t=CUR,ct=t.ct;lsSet('blitzCustomTestOpen',t.id);const a=TK.ctMarks(ct,'A'),th=TK.ctMarks(ct,'T');
    const sec=(s,name)=>`<div class="ctsec"><div class="ctsh"><span>${name} SECTION</span><span>/${half(TK.ctMarks(ct,s))}</span></div>${ct[s].map((b,i)=>blockHtml(s,b,i)).join('')||'<p class="sub">No questions yet.</p>'}
      <details class="ctadd"><summary>+ Add a${s==='A'?'n aural':' theory'} question</summary><div class="ctpick">${TK.BLOCKS[s].map(d=>`<button data-add="${s}|${d.k}"><b>${esc(d.label)}</b><span>${esc(d.desc)}</span></button>`).join('')}</div></details></div>`;
    BH.modal(`<p class="prompt">${esc(ct.ti)}</p><p class="sub"><button class="linkbtn" id="ctback">‹ All custom tests</button></p>
      <div class="tkgrid ctg"><div class="setgrp"><div class="setlabel">Title (printed under the school name)</div><input id="ctti" class="tkin" maxlength="80" value="${esc(ct.ti)}"></div>
        <div class="setgrp"><div class="setlabel">Year (sets the level of content)</div><select id="cty" class="setsel">${[7,8,9,10,11,12].map(y=>`<option value="${y}"${y===ct.y?' selected':''}>Year ${y}</option>`).join('')}</select></div></div>
      ${sec('A','AURAL')}${sec('T','THEORY')}
      <div class="cttot"><b>TOTAL MARK ${half(a+th)}</b><span>Aural ${half(a)} · Theory ${half(th)}</span><span class="sub" style="margin:0">Version ${TK.code(ct.y<=10?ct.y:10,t.seed,'Two').slice(-5)} <button class="linkbtn" id="ctnewv">New version</button></span></div>
      <div class="controls ctact"><button class="btn-check" id="ctpush">Push to class…</button><button class="btn-ghost" id="ctprev">Try it as a student</button><button class="btn-ghost" id="ctprint">Print the test</button><button class="btn-ghost" id="ctkey">Print the answer key</button><button class="btn-ghost" id="cttracks">Play the tracks</button></div>
      <p class="sub">"Print", "Play the tracks" and "Try it" all use this version, so the printed key matches. A push with <i>different questions for each student</i> gives every student their own version of the same blueprint.</p>`,true);
    wire();}
  function save(){CUR.ct=TK.ctClean(CUR.ct);saveTest(CUR);}
  function rerender(){const m=document.getElementById('tkmodal');const st=m?m.scrollTop:0;save();edit();const m2=document.getElementById('tkmodal');if(m2)m2.scrollTop=st;}
  function wire(){const m=document.getElementById('tkmodal')||document,ct=CUR.ct;const P=s=>{const [sec,bi,k,v]=s.split('|');return {sec,bi:+bi,k,v,b:ct[sec][+bi]};};
    m.querySelector('#ctback').onclick=()=>{save();home();};
    m.querySelector('#ctti').onchange=e=>{ct.ti=e.target.value.trim()||'Untitled test';rerender();};
    m.querySelector('#cty').onchange=e=>{ct.y=+e.target.value;rerender();};
    m.querySelectorAll('[data-tt]').forEach(x=>x.onchange=()=>{const p=P(x.dataset.tt);const d=TK.blockDef(p.sec,p.b.k);p.b.t=x.value.trim()&&x.value.trim()!==d.title?x.value.trim():undefined;save();});
    m.querySelectorAll('[data-tx]').forEach(x=>x.onchange=()=>{const p=P(x.dataset.tx);p.b.x=x.value.trim()||undefined;save();});
    m.querySelectorAll('[data-mv]').forEach(x=>x.onclick=()=>{const p=P(x.dataset.mv);const L=ct[p.sec],j=p.bi+(+p.k);if(j<0||j>=L.length)return;[L[p.bi],L[j]]=[L[j],L[p.bi]];rerender();});
    m.querySelectorAll('[data-ntd]').forEach(x=>x.onclick=()=>{const p=P(x.dataset.ntd);delete p.b.nt;rerender();});
    m.querySelectorAll('[data-rm]').forEach(x=>x.onclick=()=>{const p=P(x.dataset.rm);ct[p.sec].splice(p.bi,1);rerender();});
    m.querySelectorAll('[data-nn]').forEach(x=>x.onclick=()=>{const p=P(x.dataset.nn);const d=TK.blockDef(p.sec,p.b.k);p.b.n=Math.max(1,Math.min(d.nMax||12,(p.b.n||d.n)+(+p.k)));rerender();});
    m.querySelectorAll('[data-mm]').forEach(x=>x.onclick=()=>{const p=P(x.dataset.mm);const step=p.b.m<1||(p.b.m===1&&+p.k<0)?0.25:0.5;p.b.m=Math.max(0.25,Math.min(30,Math.round((p.b.m+step*(+p.k))*4)/4));rerender();});
    m.querySelectorAll('[data-ms]').forEach(x=>x.onclick=()=>{const [sec,bi,k,v]=x.dataset.ms.split('|');const b=ct[sec][+bi];b.o=b.o||{};const cur=TK.opt(Object.assign({sec},b),k).slice();const i=cur.indexOf(v);if(i>=0)cur.splice(i,1);else cur.push(v);
      const od=TK.blockDef(sec,b.k).opts.find(o=>o.key===k);b.o[k]=od.ch.map(c=>c[0]).filter(c=>cur.includes(c));rerender();});
    m.querySelectorAll('[data-os]').forEach(x=>x.onchange=()=>{const p=P(x.dataset.os);p.b.o=p.b.o||{};p.b.o[p.k]=x.value;rerender();});
    m.querySelectorAll('[data-ot]').forEach(x=>x.onchange=()=>{const p=P(x.dataset.ot);p.b.o=p.b.o||{};p.b.o[p.k]=x.value.trim();save();});
    m.querySelectorAll('[data-dg]').forEach(el=>{const p=P(el.dataset.dg+'|x');p.b.o=p.b.o||{};p.b.o.pat=p.b.o.pat||{};const o={bars:TK.opt(Object.assign({sec:p.sec},p.b),'bars'),state:p.b.o.pat};TK.wireDrumGrid(el,o,()=>save());});
    m.querySelectorAll('[data-add]').forEach(x=>x.onclick=()=>{const [sec,k]=x.dataset.add.split('|');const d=TK.blockDef(sec,k);const b={k,m:d.m,o:{}};if(d.n!==null)b.n=d.n;ct[sec].push(b);rerender();const mm=document.getElementById('tkmodal');if(mm){const blks=mm.querySelectorAll('.ctsec')[sec==='A'?0:1].querySelectorAll('.ctblk');const last=blks[blks.length-1];if(last)last.scrollIntoView({block:'center'});}});
    m.querySelector('#ctnewv').onclick=()=>{CUR.seed=TK.newSeed();rerender();BH.toast('New version: the same blueprint with new questions');};
    const ready=()=>{save();const c=CUR.ct;if(!c.A.length&&!c.T.length){BH.toast('Add some questions first');return false;}
      const bad=c.A.filter(b=>b.k==='drumT').find(b=>!((b.o.pat&&TK.opt(Object.assign({sec:'A'},b),'rows').some(r=>(b.o.pat[r]||'').includes('1')))));if(bad){BH.toast('Enter the correct drum pattern for "'+(bad.t||'Drum Dictation')+'" first');return false;}return true;};
    const flagged=()=>{const n=[...CUR.ct.A,...CUR.ct.T].filter(b=>b.nt).length;return n&&!confirm(n+' item'+(n===1?' is':'s are')+' still marked ⚠ to check. Carry on anyway?');};
    m.querySelector('#ctpush').onclick=()=>{if(ready()&&!flagged())BH.push(CUR.ct,CUR.seed);};
    m.querySelector('#ctprev').onclick=()=>{if(ready()){BH.close();BH.preview(CUR.ct,CUR.seed);}};
    m.querySelector('#ctprint').onclick=()=>{if(ready()&&!flagged())BH.print(CUR.ct,CUR.seed,false);};
    m.querySelector('#ctkey').onclick=()=>{if(ready()&&!flagged())BH.print(CUR.ct,CUR.seed,true);};
    m.querySelector('#cttracks').onclick=()=>{if(ready()){BH.close();BH.tracks(CUR.ct,CUR.seed);}};}
  TK.builderCSS=`.ctnew{display:flex;flex-wrap:wrap;gap:8px}.ctlist .ctrow{display:flex;justify-content:space-between;gap:10px;align-items:center;flex-wrap:wrap;border-bottom:1px solid var(--rule,#ddd);padding:8px 0}.ctbtns{display:flex;gap:6px}.ctbtns button{padding:6px 12px}
    .ctsec{margin:14px 0 6px}.ctsh{display:flex;gap:24px;font-weight:700;text-decoration:underline;font-size:15px;margin:0 0 8px}.ctsh span:last-child{text-decoration:none}
    .ctblk{border:1px solid var(--rule,#ddd);border-radius:10px;padding:10px 12px;margin:0 0 10px;background:#fff}.ctbh{display:flex;gap:6px;align-items:center}.ctl{font-weight:700}.ctti{flex:1;min-width:0;font-weight:700}.ctmk{font-size:12.5px;font-weight:700;white-space:nowrap;color:#555}
    .ctib{border:1px solid var(--rule,#ccc);background:#fff;border-radius:6px;width:30px;height:30px;cursor:pointer;font-size:14px;flex:none}.ctkind{font-size:12px;color:#777;margin:4px 0 6px}
    .ctnums{display:flex;flex-wrap:wrap;gap:14px;margin:2px 0 6px}.ctnum{display:inline-flex;align-items:center;gap:6px;font-size:13px}.ctnum button{width:28px;height:28px;border:1px solid var(--rule,#ccc);background:#fff;border-radius:6px;cursor:pointer;font-size:15px}.ctnum b{min-width:22px;text-align:center}
    .ctopt{margin:6px 0}.ctopt .setlabel{margin-bottom:4px}.ctopt .setchips{gap:5px}.ctopt .chip{padding:5px 10px;font-size:12.5px}.ctx summary,.ctadd summary{cursor:pointer;font-size:13px;color:#555;margin-top:4px}.ctadd summary{font-weight:700;color:var(--ink,#1b1a18);border:1px dashed #999;border-radius:8px;padding:9px 12px;list-style:none}
    .ctpick{display:grid;grid-template-columns:repeat(auto-fill,minmax(230px,1fr));gap:8px;margin-top:8px}.ctpick button{text-align:left;border:1px solid var(--rule,#ccc);border-radius:8px;background:#fff;padding:8px 10px;cursor:pointer;font-family:inherit}.ctpick button b{display:block;font-size:13.5px}.ctpick button span{display:block;font-size:11.5px;color:#666;margin-top:2px}
    .cttot{display:flex;flex-wrap:wrap;gap:6px 20px;align-items:baseline;border-top:2px solid #000;padding-top:8px;margin-top:6px;font-size:15px}.linkbtn{border:0;background:none;color:#1c6fb0;cursor:pointer;padding:0;font:inherit;text-decoration:underline}
    .ctact{position:sticky;bottom:-1px;background:var(--paper,#fff);padding:8px 0 4px;flex-wrap:wrap;gap:6px;box-shadow:0 -6px 10px -8px rgba(0,0,0,.3)}.ctact button{padding:8px 12px!important;font-size:12.5px!important;flex:0 1 auto!important;min-width:0!important;letter-spacing:.3px}.ctg{grid-template-columns:2fr 1fr}@media(max-width:620px){.ctg{grid-template-columns:1fr}}`;
  {const s2=document.createElement('style');s2.textContent=TK.drumCSS+TK.builderCSS;document.head.appendChild(s2);}
  // =====================================================================================
  // IMPORT — read an existing test (PDF, Word .docx or text) and build a custom test with the same
  // shape: sections, headings, marks, question types and their option lists. Printed music (staves,
  // drum symbols) is not text, so anything only shown in the music is flagged for the teacher.
  // =====================================================================================
  TK.libBase=()=>{const s=[...document.scripts].find(x=>/testkit\.js/.test(x.src||''));return s?s.src.replace(/testkit\.js.*$/,''):'';};
  const loadScript=src=>new Promise((res,rej)=>{const s=document.createElement('script');s.src=src;s.onload=res;s.onerror=()=>rej(new Error('Could not load '+src));document.head.appendChild(s);});
  async function pdfLines(buf){if(!window.pdfjsLib)await loadScript(TK.libBase()+'lib/pdf.min.js');pdfjsLib.GlobalWorkerOptions.workerSrc=TK.libBase()+'lib/pdf.worker.min.js';
    const doc=await pdfjsLib.getDocument({data:new Uint8Array(buf)}).promise;const out=[];const MK=/^(\/\s*\d+(\.\d+)?|\(\s*\d+(\.\d+)?\s*marks?\s*\))$/i;
    for(let p=1;p<=doc.numPages;p++){const pg=await doc.getPage(p);const tc=await pg.getTextContent();const rows=[];
      tc.items.forEach(it=>{if(!it.str||!it.str.trim())return;const y=it.transform[5],x=it.transform[4];let r=rows.find(r=>Math.abs(r.y-y)<=4.5);if(!r){r={y,items:[]};rows.push(r);}r.items.push({x,w:it.width||0,s:it.str});});
      rows.sort((a,b)=>b.y-a.y).forEach(r=>{const its=r.items.sort((a,b)=>a.x-b.x);let chunks=[],cur=null,end=-1e9;
        its.forEach(i=>{if(cur&&i.x-end>120){chunks.push(cur);cur=null;}if(!cur)cur={s:'',x:i.x};cur.s+=(cur.s&&!/\s$/.test(cur.s)&&!/^\s/.test(i.s)&&i.x-end>1.5?' ':'')+i.s;end=i.x+i.w;});if(cur)chunks.push(cur);
        // marks printed at the right margin belong to the heading on the same line
        const merged=[];chunks.forEach(c=>{const t=c.s.replace(/\s+/g,' ').trim();if(!t)return;if(MK.test(t)&&merged.length)merged[merged.length-1]+=' '+t;else merged.push(t);});
        // other right-hand chunks (marking notes, answer boxes) become their own lines
        merged.forEach(t=>out.push(t));});}
    return out;}
  async function unzipEntry(buf,name){const dv=new DataView(buf);let e=buf.byteLength-22;while(e>=0&&dv.getUint32(e,true)!==0x06054b50)e--;if(e<0)throw new Error('That Word file could not be opened.');
    const n=dv.getUint16(e+10,true);let p=dv.getUint32(e+16,true);
    for(let i=0;i<n;i++){const method=dv.getUint16(p+10,true),csize=dv.getUint32(p+20,true),nl=dv.getUint16(p+28,true),xl=dv.getUint16(p+30,true),cl=dv.getUint16(p+32,true),off=dv.getUint32(p+42,true);
      const fname=new TextDecoder().decode(new Uint8Array(buf,p+46,nl));
      if(fname===name){const lnl=dv.getUint16(off+26,true),lxl=dv.getUint16(off+28,true);const data=new Uint8Array(buf,off+30+lnl+lxl,csize);
        if(method===0)return new TextDecoder().decode(data);const ds=new DecompressionStream('deflate-raw');return new TextDecoder().decode(await new Response(new Blob([data]).stream().pipeThrough(ds)).arrayBuffer());}
      p+=46+nl+xl+cl;}
    throw new Error('That Word file has no document text.');}
  async function docxLines(buf){const xml=await unzipEntry(buf,'word/document.xml');const d=new DOMParser().parseFromString(xml,'application/xml');const out=[];
    const txt=el=>{let s='';const w=document.createTreeWalker(el,NodeFilter.SHOW_ELEMENT);let nd=w.currentNode;while(nd){const ln=nd.localName;if(ln==='t')s+=nd.textContent;else if(ln==='tab')s+=' ';else if(ln==='br'||ln==='cr')s+='\n';nd=w.nextNode();}return s;};
    const body=[...d.getElementsByTagName('*')].find(x=>x.localName==='body');if(!body)return out;
    [...body.children].forEach(ch=>{if(ch.localName==='p')txt(ch).split('\n').forEach(l=>out.push(l));
      else if(ch.localName==='tbl'){[...ch.getElementsByTagName('*')].filter(x=>x.localName==='tr').forEach(tr=>{const cells=[...tr.children].filter(c=>c.localName==='tc').map(c=>[...c.children].filter(p=>p.localName==='p').map(txt).join(' ').trim());out.push(cells.join(' '));});}});
    return out;}
  TK.readFileLines=async function(file){const buf=await file.arrayBuffer();const nm=(file.name||'').toLowerCase();const u8=new Uint8Array(buf.slice(0,8));
    const isPdf=u8[0]===0x25&&u8[1]===0x50&&u8[2]===0x44&&u8[3]===0x46,isZip=u8[0]===0x50&&u8[1]===0x4b;
    if(isPdf||/\.pdf$/.test(nm))return pdfLines(buf);if(isZip||/\.docx$/.test(nm))return docxLines(buf);
    if(/\.doc$/.test(nm))throw new Error('Old .doc files can\'t be read. Save it as .docx or PDF from Word, then drop that in.');
    return new TextDecoder().decode(buf).split(/\r?\n/);};

  // ---- reading the text ----
  const NORM=s=>String(s||'').replace(/ﬀ/g,'ff').replace(/ﬁ/g,'fi').replace(/ﬂ/g,'fl').replace(/\bsta[OR]\b/g,'staff').replace(/[’‘`]/g,"'").replace(/[“”]/g,'"').replace(/ /g,' ').replace(/\s+,/g,',').replace(/\(\s+/g,'(').replace(/\s+\)/g,')').replace(/\s+/g,' ').trim();
  const IVW=(q,n)=>new RegExp('\\b'+q+'\\.?\\s*'+n+'\\b','i');
  const IVMAP2=[['m2',IVW('(?:min(?:or)?|mi)','2(?:nd)?'),/\bm2\b|semitone/i],['M2',IVW('maj(?:or)?','2(?:nd)?'),/\bM2\b|\btone\b/],['m3',IVW('(?:min(?:or)?|mi)','3(?:rd)?'),/\bm3\b/],['M3',IVW('maj(?:or)?','3(?:rd)?'),/\bM3\b/],
    ['P4',IVW('perf(?:ect)?','4(?:th)?'),/\bP4\b/],['TT',/tritone|\baug(?:mented)?\.?\s*4(?:th)?\b|\bdim(?:inished)?\.?\s*5(?:th)?\b/i,/\bTT\b/],['P5',IVW('perf(?:ect)?','5(?:th)?'),/\bP5\b/],['m6',IVW('(?:min(?:or)?|mi)','6(?:th)?'),/\bm6\b/],['M6',IVW('maj(?:or)?','6(?:th)?'),/\bM6\b/],
    ['m7',IVW('(?:min(?:or)?|mi)','7(?:th)?'),/\bm7\b/],['M7',IVW('maj(?:or)?','7(?:th)?'),/\bM7\b/],['P8',/\b(?:perf(?:ect)?)\.?\s*(?:8(?:ve|th)?|octave)\b|\boctave\b|\b8ve\b/i,/\bP8\b/],['m9',IVW('(?:min(?:or)?|mi)','9(?:th)?'),/\bm9\b/],['M9',IVW('maj(?:or)?','9(?:th)?'),/\bM9\b/]];
  const IVMAP=[[/\b(min(?:or)?|mi)\.?\s*2(?:nd)?\b|\bm2\b|semitone/i,'m2'],[/\b(maj(?:or)?)\.?\s*2(?:nd)?\b|\bM2\b|\btone\b/,'M2'],[/\b(min(?:or)?|mi)\.?\s*3(?:rd)?\b|\bm3\b/i,'m3'],[/\b(maj(?:or)?)\.?\s*3(?:rd)?\b|\bM3\b/,'M3'],
    [/\b(perf(?:ect)?)\.?\s*4(?:th)?\b|\bP4\b/i,'P4'],[/tritone|\baug(?:mented)?\.?\s*4(?:th)?\b|\bdim(?:inished)?\.?\s*5(?:th)?\b/i,'TT'],[/\b(perf(?:ect)?)\.?\s*5(?:th)?\b|\bP5\b/i,'P5'],[/\b(min(?:or)?|mi)\.?\s*6(?:th)?\b|\bm6\b/i,'m6'],[/\b(maj(?:or)?)\.?\s*6(?:th)?\b|\bM6\b/,'M6'],
    [/\b(min(?:or)?|mi)\.?\s*7(?:th)?\b|\bm7\b/i,'m7'],[/\b(maj(?:or)?)\.?\s*7(?:th)?\b|\bM7\b/,'M7'],[/\b(perf(?:ect)?)\.?\s*(8(?:ve|th)?|octave)\b|\boctave\b|\bP8\b/i,'P8'],[/\b(min(?:or)?|mi)\.?\s*9(?:th)?\b/i,'m9'],[/\b(maj(?:or)?)\.?\s*9(?:th)?\b/i,'M9']];
  const ivsIn=s=>{const out=[];s.split(/[,;\/]|\band\b|\bor\b/).forEach(part=>{for(const [id,a,b] of IVMAP2){if(a.test(part)||b.test(part)){if(!out.includes(id))out.push(id);break;}}});return IVS.map(x=>x[0]).filter(id=>out.includes(id));};
  const scalesIn=s=>{const o=[];if(/harmonic\s+minor|\bsi\b/i.test(s))o.push('harmonic minor');if(/natural\s+minor|aeolian/i.test(s))o.push('natural minor');if(/minor\s+pentatonic/i.test(s))o.push('minor pentatonic');if(/major\s+pentatonic/i.test(s))o.push('major pentatonic');
    if(/\bmajor\b(?!\s+pentatonic)/i.test(s.replace(/[A-G][#b♯♭]?\s+major/gi,''))||/\bmajor scale\b/i.test(s))o.push('major');return o;};
  const keyTok=s=>{const m=String(s).match(/^([A-G])\s*(#|♯|b|♭)?$/);return m?m[1]+(m[2]==='#'||m[2]==='♯'?'#':m[2]?'b':''):null;};
  const keysIn=s=>{const o=[];(s.match(/\b([A-G])\s*(#|♯|b|♭)?\s*major\b/gi)||[]).forEach(t=>{const k=keyTok(t.replace(/\s*major/i,'').trim());if(k&&!o.includes(k))o.push(k);});return o;};
  const metreIn=s=>{const m=s.match(/\b(2\/4|3\/4|4\/4|6\/8|9\/8|12\/8)\b/);return m?m[1]:null;};
  const letters=lines=>{let mx=0;lines.forEach(l=>{(l.match(/(?:^|\s)\(?([a-h])\)/g)||[]).forEach(t=>{const c=t.trim().replace(/[()]/g,'');mx=Math.max(mx,c.charCodeAt(0)-96);});});return mx;};
  const blanks=lines=>lines.reduce((a,l)=>a+(l.match(/_{3,}/g)||[]).length,0);
  const MARKNOTE=/\s*(?:[–-]\s*minus\b.*|\(?minus\b.*|\b(?:\d+\s*\/\s*\d+|½|¼|\d+)\s*marks?\s+(?:per|for)\b.*|\bgive follow.*|\bthrough marks\b.*|\band relative minor\s*=.*|=\s*\d+\s*$)/i;
  const instr=(q)=>{const keep=[];for(const l0 of q.lines){const l=l0.replace(MARKNOTE,'').trim();if(!l){if(keep.length)break;continue;}if(keep.length&&/[.:?]$/.test(keep[keep.length-1])&&!/^(write|then|circle|name|label|listen|choose|complete|use|give|the|if|each|you)\b/i.test(l))break;if(keep.length&&(/^(\(?[a-h]\)|example\s*\d|bar\s*\d|major keys|hi-?hat|snare|bass drum|relative minor|[#b♯♭]'s needed|_{3,}|[A-G][#b♯♭]?\s+major\s*\/|[A-G][#b♯♭]?\s+(major|minor|harmonic|natural)\b|perfect 8ve)/i.test(l)||/^((d|r|m|f|s|l|t|si|ti|la|so|do|re|mi|fa)[,']?\s*)+$/i.test(l)))break;if(/^(\d+\s*\/\s*\d+|½|1\/[24])?\s*marks?\s+per\b|^give follow|^minus|^\(minus/i.test(l))break;keep.push(l);if(keep.length>=4)break;}
    return NORM(keep.join(' ').replace(/^\d+[.)]\s*/,'')).replace(/:\s*$/,'.').replace(/\bWrite what you hear:\s*/i,'Write what you hear. ').trim().replace(/([^.?!:])$/,'$1.');};
  const isHeading=l=>{const m=l.match(/^(?:\([a-z]\)\s*)?(.*?[A-Za-z].*?)\s*(?:\/\s*(\d+(?:\.\d+)?)|\(\s*(\d+(?:\.\d+)?)\s*marks?\s*\))\s*$/i);if(!m)return null;const t=m[1].replace(/[:–\-\s]+$/,'').trim();
    if(/total|^name\b/i.test(t)||/^\d+[.)]/.test(t)||t.length>90)return null;return {title:t,marks:+(m[2]||m[3])};};
  const AURAL_K=['drumT','drum','two','pd','md','sfd','rd','ivl','ton','cad','prog','met','tim','anal'];
  // rules: first match wins; each returns {k, n?, o, nt?}
  function classify(q,g,sec){const head=g.title,body=q.lines.join(' '),ctx=NORM(head+' | '+body),low=ctx.toLowerCase(),first=NORM(q.lines.slice(0,3).join(' '));
    const scl=scalesIn(head)||[];const S=(a,b)=>a.length?a:b;
    if(/\b(drum|hi-?hat|snare|kick)\b/i.test(ctx)){const sm=first.match(/\b(pre-chorus|chorus|verse|bridge|intro|outro|riff|groove|middle 8)\s+of\s+(.+?)(?:\.\s|\.$|:|\s+write\b|$)/i);
      const rows=[];if(/hi-?hat/i.test(body)||/hi-?hat/i.test(head))rows.push('hh');if(/snare/i.test(ctx))rows.push('sn');if(/bass drum|kick/i.test(ctx))rows.push('bd');
      const onlyKS=/kick and (the )?snare|snare and (the )?kick/i.test(first);const R=onlyKS?['sn','bd']:(rows.length?rows:['hh','sn','bd']);
      const bars=Math.max(1,...((body.match(/\bbar\s*(\d)/gi)||[]).map(t=>+t.replace(/\D/g,''))),1);
      if(sm)return {k:'drumT',o:{song:NORM(sm[2]).replace(/\.$/,''),section:sm[1].toLowerCase(),bars:String(Math.min(2,bars)),rows:R},nt:'Tap in the correct drum pattern: it is printed as music, so it can\'t be read from the paper.'};
      return {k:'drum',o:{bars:String(Math.min(2,bars)),rows:R,level:'sync'}};}
    if(/two[- ]part|2[- ]part/i.test(ctx)){const sc=/harmonic/i.test(ctx)?'harmonic minor':/minor/i.test(ctx)?'natural minor':'major';const mt=metreIn(ctx);return {k:'two',o:{scale:sc,metre:mt||'6/8',bars:'4'},nt:mt?'':'Check the time signature and length: they are in the printed music.'};}
    if(sec!=='T'&&/(melodic|pitch)\s+dictation|sol-?fa|solfa|write (the )?melody/i.test(ctx)){const scs=S(scalesIn(ctx),['major']);const mt=metreIn(ctx);const nt=(mt?'':'Check the time signature and length: they are in the printed music. ')+'Check how much is given (first note or first bar).';
      if(/rhythm (is )?(given|printed)|given rhythm|below the (given )?rhythm/i.test(ctx))return /(stave|staff)/i.test(ctx)?{k:'pd',o:{scales:scs,metres:[mt||'6/8'],bars:'4',given:'bar',sf:'yes'},nt}:{k:'sfd',o:{scales:scs,metres:[mt||'4/4'],bars:'2'},nt};
      if(/rhythm and pitch|write (the )?melody/i.test(ctx))return {k:'md',o:{scales:scs,metres:[mt||'4/4'],bars:'2'},nt};
      return {k:'pd',o:{scales:scs,metres:[mt||'4/4'],bars:'4',given:'bar',sf:/sol-?fa|solfa/i.test(ctx)?'yes':'no'},nt};}
    if(/rhythm(ic)?\s+dictation|write (the|its) rhythm|rhythm you hear/i.test(ctx)){const mt=metreIn(ctx);return {k:'rd',o:{metres:mt?[mt]:undefined,bars:'4'},nt:mt?'':'Check the time signature and length.'};}
    if(/interval/i.test(ctx)&&(sec==='A'||/\b(hear|listen)/i.test(ctx))&&!/root note|melody below|key signature/i.test(ctx)){const pm=first.match(/\(([^)]*)\)/);const iv=ivsIn(pm?pm[1]:first);const n=letters(q.lines)||5;
      const dir=/descend/i.test(ctx)?(/ascend/i.test(ctx)?'both':'down'):/together|harmonic/i.test(ctx)?'harm':'up';return {k:'ivl',n,o:{ivls:iv.length>=2?iv:undefined,dir},nt:iv.length>=2?'':'Choose which intervals students pick from.'};}
    if(/tonalit|major or minor/i.test(ctx)){const t=[];if(/\bmajor\b/i.test(body))t.push('Major');if(/natural\s+minor/i.test(body))t.push('Natural minor');if(/harmonic\s+minor/i.test(body))t.push('Harmonic minor');if(/pentatonic/i.test(body))t.push('Pentatonic');if(!/natural|harmonic/i.test(body)&&/\bminor\b/i.test(body))t.push('Minor');
      const ex=new Set((body.match(/example\s*(\d+)/gi)||[]).map(x=>x.replace(/\D/g,'')));return {k:'ton',n:ex.size||letters(q.lines)||3,o:{tons:t.length>=2?t:undefined,play:'harm'}};}
    if(sec!=='T'&&/cadence/i.test(ctx)){const c=['Perfect','Plagal','Imperfect','Interrupted'].filter(x=>new RegExp(x,'i').test(body));return {k:'cad',n:letters(q.lines)||3,o:{cads:c.length>=2?c:undefined}};}
    if(sec!=='T'&&/progression|roman numeral|chords you hear/i.test(ctx))return {k:'prog',o:{}};
    if(sec!=='T'&&/time signature|\bmetre\b|\bmeter\b/i.test(ctx))return {k:'met',n:letters(q.lines)||3,o:{}};
    if(sec!=='T'&&/instrument|timbre/i.test(ctx))return {k:'tim',n:letters(q.lines)||2,o:{}};
    if(sec!=='T'&&/texture|aural analysis|excerpt/i.test(ctx))return {k:'anal',n:3,o:{}};
    // theory
    if(/interval/i.test(ctx)&&/root note|above (the|a) tonic|same (root|note)/i.test(ctx)){const tm=ctx.match(/root note of (?:these|the) intervals? is\s+([A-G](?:#|♯|b|♭)?)/i);const n=blanks(q.lines)||6;
      return {k:'ivkey',n:Math.min(8,n),o:{tonic:tm?keyTok(tm[1]):'G'},x2:' Bar 1 is an example: a perfect octave.'};}
    if(/key signature/i.test(ctx)&&(/grid|table|sharp keys|flat keys/i.test(ctx))){const sides=[];if(/sharp keys|#'s needed|♯'s needed/i.test(body))sides.push('sharp');if(/flat keys|b's needed|♭'s needed/i.test(body))sides.push('flat');
      const ri=q.lines.findIndex(l=>/[#♯b♭]'s needed/i.test(l));let row=ri>=0?q.lines[ri].replace(/.*needed\s*(\(cumulative\))?/i,''):'';if(ri>=0&&q.lines[ri+1]&&/^([A-G][#♯b♭]\s*)+$/.test(q.lines[ri+1]))row+=' '+q.lines[ri+1];
      const tk=row.match(/\b[A-G][#♯b♭]/g)||[];const toks=tk.length;const late=tk.some(t=>/^(E|B)[#♯]$|^(C|F)[b♭]$/.test(t));
      const given=toks===0?'none':toks>=7?'last4':late?'last4':'first4';return {k:'ksgrid',o:{sides:sides.length?sides:['sharp','flat'],given},nt:toks>=7?'This looks like an answer key: check which columns students are given.':''};}
    if(/key signature/i.test(ctx)&&keysIn(body).length&&/(write|complete|add|draw)/i.test(ctx)){const ks=keysIn(body);const clef=/treble/i.test(body)&&!/bass/i.test(body)?'treble':/bass clef/i.test(body)&&!/treble/i.test(body)?'bass':'both';
      return {k:'kswrite',n:ks.length,o:{keys:ks,clef,names:/minor/i.test(body)?'both':'major'},nt:clef==='both'?'Check the staves: treble and bass, as read, or one clef.':''};}
    if(/key signature/i.test(ctx)&&/(name|identify|which key|what key)/i.test(ctx))return {k:'ksid',n:letters(q.lines)||blanks(q.lines)||4,o:{}};
    if(/transpos/i.test(ctx)){const tm=first.match(/into\s+([A-G]\s*(?:#|♯|b|♭)?)\s*major/i);const dm=first.match(/\b(up|down)\b/i);const mt=metreIn(ctx);
      return {k:'transp',o:{from:'',iv:'',metre:mt||'4/4',bars:'4'},nt:'The paper asks for '+(dm?dm[1].toLowerCase()+' ':'')+(tm?'into '+pretty(keyTok(tm[1].replace(/\s/g,''))||tm[1])+' major':'a transposition')+'. Set the starting key and interval, time signature and length to match: they are in the printed music.'};}
    if(/(correct|choice of|which|what) key|recognition of key|key of (this|the) melody/i.test(ctx)){const t=[];if(/\bmajor\b/i.test(body))t.push('major');if(/natural\s+minor/i.test(body))t.push('natural minor');if(/harmonic\s+minor/i.test(body))t.push('harmonic minor');return {k:'keymel',n:1,o:{types:t.length?t:undefined,clef:'mix'},merge:true};}
    if(/interval/i.test(ctx)&&/melody/i.test(ctx))return {k:'ivmel',n:Math.max(1,Math.min(6,blanks(q.lines)||2)),o:{clef:/treble/i.test(ctx)?'treble':'bass'},nt:'Check the clef of the melody.'};
    if(/interval/i.test(ctx)&&/(write|notate|draw|add)/i.test(ctx))return {k:'ivwrite',n:letters(q.lines)||blanks(q.lines)||4,o:{}};
    if(/interval/i.test(ctx))return {k:'ivname',n:letters(q.lines)||blanks(q.lines)||4,o:{}};
    if(/scale/i.test(ctx)&&/(write|notate)/i.test(ctx)){const m={'major':'major','natural minor':'natminor','harmonic minor':'harmminor','major pentatonic':'majpent','minor pentatonic':'minpent'};const sc=S(scalesIn(first),scalesIn(ctx)).map(x=>m[x]).filter(Boolean);return {k:'scale',n:letters(q.lines)||1,o:{scales:sc.length?sc:undefined,sf:/sol-?fa|solfa/i.test(ctx)?'yes':'no'}};}
    if(/scale/i.test(ctx))return {k:'scaleid',n:letters(q.lines)||1,o:{}};
    if(/chord/i.test(ctx)&&/roman/i.test(ctx))return {k:'chordrn',n:letters(q.lines)||1,o:{}};
    if(/chord/i.test(ctx)&&/(write|notate)/i.test(ctx))return {k:'chordw',n:letters(q.lines)||2,o:{}};
    if(/chord|triad/i.test(ctx))return {k:'chordid',n:letters(q.lines)||2,o:{}};
    if(/note names?|name (each|the|these) notes?/i.test(ctx))return {k:'notes',n:letters(q.lines)||blanks(q.lines)||4,o:{mode:'name'}};
    if(/(write|notate) (each|the|these) notes?/i.test(ctx))return {k:'notes',n:letters(q.lines)||4,o:{mode:'write'}};
    if(/time signature|complete (the|each) bar/i.test(ctx))return {k:'rhythm',n:letters(q.lines)||4,o:{}};
    if(/note values?|rest values?|\brests?\b/i.test(ctx))return {k:'values',n:letters(q.lines)||4,o:{}};
    if(/cadence|roman/i.test(ctx))return {k:'harm',n:letters(q.lines)||2,o:{}};
    if(/terms|signs|tempo|dynamic|articulation/i.test(ctx))return {k:'terms',n:letters(q.lines)||4,o:{}};
    return null;}
  TK.parseTest=function(rawLines){const lines=rawLines.map(NORM).filter(l=>l&&!/^[_\-–—=.\s]{4,}$/.test(l));
    const top=lines.slice(0,12);let ti=(top.find(l=>/(test|assessment|exam|examination|quiz)\b/i.test(l)&&!/total mark|^name/i.test(l)&&!/^mount lawley/i.test(l))||'').replace(/\b(answers?|answer key|marking key|marking guide|solutions?)\b/gi,'').replace(/\s+/g,' ').trim();
    const ym=(ti+' '+top.join(' ')).match(/\byear\s*(\d{1,2})\b/i);const y=ym?Math.max(7,Math.min(12,+ym[1])):9;const isKey=top.some(l=>/\banswers?\b|answer key|marking key/i.test(l));
    const tm=lines.join(' ').match(/total\s*mark\S*\s*\/\s*(\d+)/i);const docTotal=tm?+tm[1]:null;
    // groups: a heading with marks, then its lines; numbered lines start questions
    const groups=[];let sec=null,cur=null;const secTot={};
    lines.forEach(l=>{if(/^name\b/i.test(l)||/^mount lawley/i.test(l)||l===ti||/^(\d+\s*\/\s*\d+|½|1\/[24]|1)\s*marks?\s+(per|for)\b/i.test(l))return;
      const sh=l.match(/^(aural|theory)(\s+section)?\s*(\/\s*\d+)?$/i);if(sh){sec=sh[1][0].toUpperCase()==='A'?'A':'T';cur=null;return;}
      if(/^(aural|theory)\s+total\b/i.test(l)){cur=null;return;}
      const h=isHeading(l);if(h){cur={title:h.title,marks:h.marks,sec,qs:[{lines:[]}]};groups.push(cur);return;}
      if(!cur)return;if(/^\d+[.)]\s+\S/.test(l)){const last=cur.qs[cur.qs.length-1];if(!last.lines.length)last.lines.push(l);else cur.qs.push({lines:[l]});}else cur.qs[cur.qs.length-1].lines.push(l);});
    const ct={v:1,ti:ti||'Imported test',y,A:[],T:[]};const report=[];const unknown=[];
    groups.forEach(g=>{const qs=g.qs.filter(q=>q.lines.length);if(!qs.length)qs.push({lines:[g.title]});
      // preamble lines (no number) followed by numbered questions: fold the preamble into the first question
      const made=[];qs.forEach(q=>{let s=g.sec;let c=classify(q,g,s);if(!c&&!s){c=classify(q,g,'A')||classify(q,g,'T');}
        if(!c){unknown.push({title:g.title,text:instr(q)||NORM(q.lines[0]||'')});return;}
        const secOf=g.sec||(AURAL_K.includes(c.k)?'A':'T');const d=TK.blockDef(secOf,c.k)||TK.blockDef(secOf==='A'?'T':'A',c.k);if(!d)return;const realSec=TK.blockDef('A',c.k)?'A':'T';
        const prev=made[made.length-1];if(c.merge&&prev&&prev.b.k===c.k){prev.b.n=(prev.b.n||1)+(c.n||1);return;}
        const o={};Object.keys(c.o||{}).forEach(k=>{if(c.o[k]!==undefined)o[k]=c.o[k];});
        const b={k:c.k,m:d.m,o,t:g.title.replace(/\s*\((?:[a-z],?\s*)+[a-z]\)\s*$/i,'').replace(/\s*\([^)]*\b(?:d|r|m|f|s|l|t|si)\b[^)]*\)\s*$/i,'').trim()};if(d.n!==null)b.n=Math.max(1,Math.min(d.nMax||12,c.n||d.n));
        const x=instr(q);if(x&&x.length>8)b.x=(x+(c.x2&&!/example/i.test(x)?c.x2:'')).slice(0,400);if(c.nt)b.nt=c.nt;made.push({b,sec:realSec,g});});
      // share the heading's marks across its blocks, in proportion to each block's natural weight
      const nat=x=>{const d=TK.blockDef(x.sec,x.b.k);if(x.b.k==='drumT'||x.b.k==='drum')return 4*(+x.b.o.bars||1);if(d.perCell)return TK.cellsOf(x.b)*d.m;return d.n===null?d.m:(x.b.n||d.n)*d.m;};
      const N=made.reduce((a,x)=>a+nat(x),0);
      if(g.marks&&N){let left=g.marks;made.forEach((x,i)=>{const d=TK.blockDef(x.sec,x.b.k);const target=i===made.length-1?left:Math.round(g.marks*nat(x)/N*4)/4;
          if(d.perCell)x.b.m=Math.max(0.25,Math.round(target/TK.cellsOf(x.b)*4)/4);else if(d.n===null)x.b.m=Math.max(0.25,Math.round(target*4)/4);else x.b.m=Math.max(0.25,Math.round(target/(x.b.n||d.n)*4)/4);
          left-=TK.blockMarks(x.sec,x.b);});
        const got=made.reduce((a,x)=>a+TK.blockMarks(x.sec,x.b),0);if(Math.abs(got-g.marks)>0.01&&made.length){const L=made[made.length-1];L.b.nt=((L.b.nt||'')+' The paper gives "'+g.title+'" '+g.marks+' marks; this block makes it '+got+'. Adjust the marks.').trim();}}
      made.forEach(x=>{ct[x.sec].push(x.b);report.push({sec:x.sec,b:x.b,from:g.title,gm:g.marks});});});
    return {ct:TK.ctClean(ct),report,unknown,docTotal,secTot,isKey,title:ti};};

  // ---- import screen (inside the builder) ----
  function importZone(){return `<div class="ctdrop" id="ctdrop"><div><b>Drag a test here</b> (PDF or Word) to build a custom test with the same sections, question types and marks.</div><div class="sub" style="margin:4px 0 0">It reads the wording; anything shown only in the printed music (drum patterns, time signatures, starting keys) is flagged for you to set.</div>
      <div class="controls" style="margin-top:8px"><button class="btn-ghost" id="ctpickf">Choose a file…</button><input type="file" id="ctfile" accept=".pdf,.docx,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain" hidden></div></div>`;}
  function wireImport(root){const z=root.querySelector('#ctdrop');if(!z)return;const inp=root.querySelector('#ctfile');root.querySelector('#ctpickf').onclick=()=>inp.click();inp.onchange=()=>{if(inp.files[0])doImport(inp.files[0]);};
    const over=e=>{e.preventDefault();z.classList.add('on');};const leave=()=>z.classList.remove('on');
    [root,z].forEach(t=>{t.addEventListener('dragover',over);t.addEventListener('dragleave',leave);t.addEventListener('drop',e=>{e.preventDefault();leave();const f=e.dataTransfer&&e.dataTransfer.files&&e.dataTransfer.files[0];if(f)doImport(f);});});}
  TK.importFile=async function(file){const lines=await TK.readFileLines(file);if(!lines.some(l=>/[a-z]{3}/i.test(l)))throw new Error('No text was found in that file. It may be a scanned image: drop in the Word file, or a PDF saved from Word.');return TK.parseTest(lines);};
  async function doImport(file){BH.modal(`<p class="prompt">Reading ${esc(file.name)}…</p><p class="sub">This takes a few seconds.</p>`,true);let r;
    try{r=await TK.importFile(file);}catch(e){BH.modal(`<p class="prompt">That file couldn't be read</p><p class="sub">${esc(e.message||String(e))}</p><div class="controls"><button class="btn-ghost" id="ctbk">Back</button></div>`,true);document.getElementById('ctbk').onclick=home;return;}
    if(!r.ct.A.length&&!r.ct.T.length){BH.modal(`<p class="prompt">No questions recognised in ${esc(file.name)}</p><p class="sub">The import looks for headings with their marks (for example "Interval Recognition /5") and numbered questions under them.</p><div class="controls"><button class="btn-ghost" id="ctbk">Back</button></div>`,true);document.getElementById('ctbk').onclick=home;return;}
    review(r,file.name);}
  function review(r,fname){const ct=r.ct;const tot=TK.ctMarks(ct,'A')+TK.ctMarks(ct,'T');const flags=[...ct.A,...ct.T].filter(b=>b.nt).length;
    const row=(sec,b,i)=>{const d=TK.blockDef(sec,b.k);const mk=TK.blockMarks(sec,b);return `<tr><td>(${TK.letter(i)})</td><td><b>${esc(b.t||d.title)}</b><div class="sub" style="margin:0">${esc(d.label)}${b.n&&d.n!==null?' · '+b.n+' question'+(b.n===1?'':'s'):''}${optSummary(sec,b)}</div>${b.nt?`<div class="ctflag">⚠ ${esc(b.nt)}</div>`:''}</td><td class="r">${half(mk)}</td></tr>`;};
    BH.modal(`<p class="prompt">Read from ${esc(fname)}</p>
      <p class="sub">${r.isKey?'This is an answer key; the questions were read from it. ':''}Title: <b>${esc(ct.ti)}</b> · Year ${ct.y}. Totals: Aural ${half(TK.ctMarks(ct,'A'))} · Theory ${half(TK.ctMarks(ct,'T'))} · <b>${half(tot)}</b>${r.docTotal?(Math.abs(r.docTotal-tot)<0.01?` (the paper says /${r.docTotal} ✓)`:` <span class="ctbad">(the paper says /${r.docTotal})</span>`):''}.</p>
      ${['A','T'].map(s=>ct[s].length?`<div class="ctsh"><span>${s==='A'?'AURAL':'THEORY'} SECTION</span><span>/${half(TK.ctMarks(ct,s))}</span></div><table class="ctrev">${ct[s].map((b,i)=>row(s,b,i)).join('')}</table>`:'').join('')}
      ${r.unknown.length?`<div class="setgrp"><div class="setlabel">Not recognised: add these yourself if you need them</div><ul class="sub">${r.unknown.map(u=>`<li><b>${esc(u.title)}</b>: ${esc(u.text.slice(0,140))}</li>`).join('')}</ul></div>`:''}
      <p class="sub">${flags?`${flags} item${flags===1?'':'s'} marked ⚠ need${flags===1?'s':''} you, because ${flags===1?'it is':'they are'} only in the printed music. `:''}Every block opens in the builder, where you can change anything before you print or push it.</p>
      <div class="controls"><button class="btn-check" id="ctbuild">Build this test</button><button class="btn-ghost" id="ctbk">Cancel</button></div>`,true);
    document.getElementById('ctbk').onclick=home;document.getElementById('ctbuild').onclick=()=>{CUR={id:rid(),seed:TK.newSeed(),ct:TK.ctClean(ct),src:fname};saveTest(CUR);edit();BH.toast('Built from '+fname+(flags?' · check the ⚠ items':''));};}
  function optSummary(sec,b){const d=TK.blockDef(sec,b.k);const bits=[];d.opts.forEach(od=>{if(!b.o||b.o[od.key]===undefined||od.type==='drum')return;const v=b.o[od.key];
      if(od.type==='multi')bits.push(v.map(x=>(od.ch.find(c=>c[0]===x)||[x,x])[1]).join(', '));else if(od.type==='one'){const c=od.ch.find(c=>c[0]===v);if(c&&v!=='')bits.push(c[1]);}else if(od.type==='text'&&v)bits.push(v);});
    return bits.length?' · '+esc(bits.join(' · ')):'';}
  TK.importCSS=`.ctdrop{border:2px dashed #8a8a8a;border-radius:12px;padding:14px 16px;margin:4px 0 6px;background:#fafafa;transition:background .15s,border-color .15s}.ctdrop.on{background:#eef7ee;border-color:#1d6b2d}
    .ctrev{width:100%;border-collapse:collapse;margin:0 0 10px;font-size:13.5px}.ctrev td{border-bottom:1px solid #e3e3e3;padding:6px 6px;vertical-align:top}.ctrev td.r{text-align:right;font-weight:700;white-space:nowrap}
    .ctflag{background:#fff6d6;border:1px solid #e8c547;border-radius:6px;padding:5px 8px;margin:5px 0 0;font-size:12.5px;color:#5a4500}.ctflag button{margin-left:8px;border:1px solid #c9a227;background:#fff;border-radius:5px;padding:2px 8px;cursor:pointer;font-size:12px}.ctbad{color:#b3261e;font-weight:700}`;
  {const s3=document.createElement('style');s3.textContent=TK.importCSS;document.head.appendChild(s3);}


  window.TestKit=TK;
})();
