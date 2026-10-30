/*blitz-stamp*/(window.BLITZ_FILES=window.BLITZ_FILES||{})["audio.js"]="20261030e";
// audio.js — Web Audio playback engine for ATAR Music Aural Blitz.
// All pitched/rhythmic exercises are synthesised (no files, works offline).
// Instrument timbre uses bundled CC0 samples loaded lazily from ./samples/.
(function(){
  let AC=null, bus=null; const timers=[];
  function ac(){ if(!AC){ AC=new (window.AudioContext||window.webkitAudioContext)(); }
    if(AC.state==='suspended') AC.resume(); return AC; }
  function getBus(){ const a=ac(); if(!bus){ bus=a.createGain(); bus.gain.value=1; bus.connect(a.destination); } return bus; }
  function arm(){ const a=ac(), b=getBus(); b.gain.cancelScheduledValues(a.currentTime); b.gain.setValueAtTime(1,a.currentTime); return a; }
  const mtof = m => 440*Math.pow(2,(m-69)/12);

  // ---- synth voice: warm triangle stack with ADSR ----
  function synthNote(midi,t0,dur,amp){
    if(pianoReady && SBUF.piano){ return pianoVoice(midi,t0,dur,amp); }
    const a=ac(), f=mtof(midi), out=a.createGain(); out.connect(getBus());
    const peak=0.20*(amp||1);
    out.gain.setValueAtTime(0.0001,t0);
    out.gain.linearRampToValueAtTime(peak,t0+0.010);
    out.gain.exponentialRampToValueAtTime(peak*0.55,t0+0.16);
    out.gain.exponentialRampToValueAtTime(0.0001,t0+dur);
    [[1,1],[2,0.30],[3,0.13],[4,0.06]].forEach(p=>{
      const o=a.createOscillator(), g=a.createGain();
      o.type='triangle'; o.frequency.value=f*p[0]; g.gain.value=p[1];
      o.connect(g); g.connect(out); o.start(t0); o.stop(t0+dur+0.05);
    });
  }
  // sustained, legato voice for chords/progressions (gentle attack, near-held sustain, soft release)
  function padNote(midi,t0,dur,amp){
    if(pianoReady && SBUF.piano){ return pianoVoice(midi,t0,dur,amp); }
    const a=ac(), f=mtof(midi), out=a.createGain(); out.connect(getBus());
    const peak=0.15*(amp||1);
    out.gain.setValueAtTime(0.0001,t0);
    out.gain.linearRampToValueAtTime(peak,t0+0.045);
    out.gain.linearRampToValueAtTime(peak*0.90,t0+dur*0.78);
    out.gain.exponentialRampToValueAtTime(0.0001,t0+dur);
    [[1,1],[2,0.26],[3,0.10],[4,0.05]].forEach(p=>{
      const o=a.createOscillator(), g=a.createGain();
      o.type='triangle'; o.frequency.value=f*p[0]; g.gain.value=p[1];
      o.connect(g); g.connect(out); o.start(t0); o.stop(t0+dur+0.1);
    });
  }
  // ---- percussive click for metre / rhythm count-in ----
  function click(t0,accent,volMul){
    const a=ac(), o=a.createOscillator(), g=a.createGain(); const vm=(volMul==null?1:volMul);
    o.type='square'; o.frequency.value=accent?1760:1040;
    g.gain.setValueAtTime(0.0001,t0);
    g.gain.linearRampToValueAtTime((accent?0.26:0.14)*vm,t0+0.004);
    g.gain.exponentialRampToValueAtTime(0.0001,t0+0.07);
    o.connect(g); g.connect(getBus()); o.start(t0); o.stop(t0+0.09);
  }

  // ---- sampled instruments (timbre) ----
  const SBUF={};           // instr -> [{midi,buffer}]
  let samplesOK=null;      // null=unknown, true/false after probe
  // ---- sampled piano voice: used for ALL pitched exercises once loaded ----
  let pianoReady=false;
  async function loadPiano(){ try{ await loadInstrument('piano'); pianoReady=!!(SBUF.piano&&SBUF.piano.length); }catch(e){ pianoReady=false; } return pianoReady; }
  function pianoVoice(midi,t0,dur,amp){
    const arr=SBUF.piano; let best=arr[0]; for(const e of arr) if(Math.abs(e.midi-midi)<Math.abs(best.midi-midi)) best=e;
    const a=ac(), src=a.createBufferSource(), g=a.createGain();
    src.buffer=best.buffer; src.playbackRate.value=Math.pow(2,(midi-best.midi)/12);
    const peak=Math.min(1.0,(amp==null?1:amp)*0.85), rel=Math.max(0.14,dur);
    g.gain.setValueAtTime(0.0001,t0);
    g.gain.linearRampToValueAtTime(peak,t0+0.006);
    g.gain.setValueAtTime(peak, t0+Math.max(0.04,rel*0.85));
    g.gain.exponentialRampToValueAtTime(0.0001, t0+rel+0.07);
    src.connect(g); g.connect(getBus()); src.start(t0); try{src.stop(t0+rel+0.2);}catch(e){}
  }
  async function loadInstrument(instr){
    if(SBUF[instr]) return SBUF[instr];
    const spec=(window.SAMPLES||{})[instr]; if(!spec) throw new Error('no spec '+instr);
    const a=ac(), arr=[];
    for(const e of spec){
      const url=(e.file.indexOf('data:')===0)?e.file:(window.SAMPLE_BASE||'samples/')+e.file;
      const resp=await fetch(url);
      if(!resp.ok) throw new Error('fetch '+e.file);
      const ab=await resp.arrayBuffer();
      const buf=await a.decodeAudioData(ab);
      arr.push({midi:e.midi,buffer:buf});
    }
    arr.sort((x,y)=>x.midi-y.midi); SBUF[instr]=arr; return arr;
  }
  async function probeSamples(){
    if(samplesOK!==null) return samplesOK;
    try{ const names=Object.keys(window.SAMPLES||{}); if(!names.length){samplesOK=false;return false;}
      await loadInstrument(names[0]); samplesOK=true; }catch(e){ samplesOK=false; }
    return samplesOK;
  }
  const SPB=0.52; // seconds per beat for melody/rhythm
  // swing: push an off-beat eighth (the "and") to 2/3 of the beat
  function swungBeat(b,swing){ if(!swing) return b; const whole=Math.floor(b+1e-6), frac=b-whole; return Math.abs(frac-0.5)<1e-6 ? whole+2/3 : b; }
  window.AUDIO={
    ready(){ return !!(window.AudioContext||window.webkitAudioContext); },
    // stop everything: fade the current bus out and abandon it, so notes already scheduled on it never resurface
    stop(){ timers.forEach(t=>clearTimeout(t)); timers.length=0;
      if(bus){ const a=ac(), old=bus; bus=null; try{old.gain.cancelScheduledValues(a.currentTime); old.gain.setTargetAtTime(0,a.currentTime,0.012); setTimeout(()=>{try{old.disconnect();}catch(e){}},400);}catch(e){} } },
    // a delayed play that stop() cancels (for two-phrase questions)
    later(fn,ms){ const t=setTimeout(()=>{timers.splice(timers.indexOf(t),1);fn();},ms); timers.push(t); return t; },
    probeSamples,
    preloadPiano(){ return loadPiano(); },
    pianoLoaded(){ return pianoReady; },
    // interval: mode 'up' | 'down' | 'harm'
    interval(rootMidi,semis,mode){ const a=arm(),t=a.currentTime+0.06,s=Math.abs(semis);
      if(mode==='harm'){ synthNote(rootMidi,t,1.6); synthNote(rootMidi+s,t,1.6); return 1.8; }
      const lo=rootMidi, hi=rootMidi+s, first=mode==='down'?hi:lo, second=mode==='down'?lo:hi;
      synthNote(first,t,0.66); synthNote(second,t+0.62,0.95); return 1.75; },
    // style: 'block' | 'roll' (quick strum) | 'arp' (played one note at a time, each held)
    chord(rootMidi,ivls,style){ const a=arm(); const t=a.currentTime+0.06;
      if(style==='arp'){ const step=0.36; ivls.forEach((iv,i)=>padNote(rootMidi+iv,t+i*step,2.0+(ivls.length-i)*0.1,0.95)); return ivls.length*step+2.2; }
      ivls.forEach((iv,i)=>padNote(rootMidi+iv,t+(style==='roll'?i*0.10:0),2.1,0.95)); return 2.3; },
    scale(rootMidi,steps){ const a=arm(); let t=a.currentTime+0.06;
      steps.forEach(s=>{ synthNote(rootMidi+s,t,0.40); t+=0.36; }); return t-a.currentTime+0.1; },
    cadence(chords){ const a=arm(); let t=a.currentTime+0.06; const bp=1.4;
      chords.forEach(ch=>{ ch.forEach(m=>padNote(m,t,bp*1.08,0.85)); t+=bp; }); return t-a.currentTime+0.2; },
    // voice-led progression: each chord = [bass, upper...]; sustained & legato (overlapping into the next)
    progression(chordsMidis,spb,gaps){ const a=arm(); const bp=spb||0.95, t0=a.currentTime+0.06; let t=t0;
      chordsMidis.forEach((ch,ci)=>{ ch.forEach((m,i)=>padNote(m,t,bp*1.10, i===0?1.25:0.82)); t+=bp; if(gaps&&gaps[ci])t+=gaps[ci]; });
      return (t-t0)+bp*0.2+0.3; },
    // metre groove at the eighth-pulse: 'S'=strong downbeat (low boom), 'M'=secondary beat (mid tone),
    // 'b'=beat tick, 's'=off-beat subdivision (soft). Plays 2 bars.
    groove(pulses,spb){ const a=arm(); let t=a.currentTime+0.06; const sp=spb||0.30;
      for(let bar=0;bar<2;bar++){ pulses.forEach(p=>{
        if(p==='S'){ synthNote(40,t,0.28,1.25); click(t,true); }
        else if(p==='M'){ synthNote(52,t,0.22,0.8); click(t,false,0.9); }
        else if(p==='b'){ click(t,false,1); }
        else { click(t,false,0.45); }
        t+=sp; }); }
      return t-a.currentTime+0.12; },
    rhythm(durs,countIn){ const a=arm(); let t=a.currentTime+0.06;
      if(countIn){ for(let i=0;i<countIn;i++){ click(t,i===0); t+=SPB; } }
      durs.forEach(d=>{ synthNote(74,t,Math.min(d*SPB*0.92,0.55)); t+=d*SPB; }); return t-a.currentTime+0.05; },
    // melody with rests (midi null), optional count-in clicks and key cue (tonic chord, then starting note).
    // opts: {countIn:{n,beat}, cue:{chord:[midis], first:midi}, accents:[...]}
    melody(midis,durs,spb,swing,amps,opts){ const a=arm(); const bp=spb||SPB; opts=opts||{}; let t=a.currentTime+0.06;
      if(opts.cue){ const c=opts.cue; if(c.chord&&c.chord.length){ c.chord.forEach(m=>padNote(m,t,1.25,0.9)); t+=1.45; }
        if(c.first!=null){ synthNote(c.first,t,0.75,1.0); t+=1.05; } }
      if(opts.countIn&&opts.countIn.n){ const ci=opts.countIn, acc=ci.accents||[0]; for(let i=0;i<ci.n;i++){ click(t,acc.indexOf(i)>=0,0.8); t+=(ci.beat||1)*bp; } }
      const t0=t; let beat=0;
      for(let i=0;i<midis.length;i++){ const d=durs?durs[i]:1, len=(opts.lens&&opts.lens[i]!=null)?opts.lens[i]:0.95;
        if(midis[i]!=null) synthNote(midis[i],t0+swungBeat(beat,swing)*bp,d*bp*len,amps?amps[i]:undefined);
        beat+=d; }
      return (t0-a.currentTime)+beat*bp+0.25; },
    // an unmistakably electronic voice (raw oscillator + filter sweep) for acoustic-vs-electronic questions
    synthMelody(mids,durs,spb,wave){ const a=arm(); const bp=spb||0.45, t0=a.currentTime+0.06; let beat=0;
      for(let i=0;i<mids.length;i++){ const d=durs[i], t=t0+beat*bp, len=d*bp*0.9; beat+=d; if(mids[i]==null)continue;
        const o=a.createOscillator(), f=a.createBiquadFilter(), g=a.createGain(); o.type=wave||'sawtooth'; o.frequency.value=mtof(mids[i]);
        f.type='lowpass'; f.frequency.setValueAtTime(3200,t); f.frequency.exponentialRampToValueAtTime(500,t+len); f.Q.value=6;
        g.gain.setValueAtTime(0.0001,t); g.gain.linearRampToValueAtTime(0.22,t+0.01); g.gain.setValueAtTime(0.22,t+len*0.7); g.gain.exponentialRampToValueAtTime(0.0001,t+len);
        o.connect(f); f.connect(g); g.connect(getBus()); o.start(t); o.stop(t+len+0.05); }
      return beat*bp+0.3; },
    // several independent lines at once: parts = [{mids,durs,offset(beats),amp}]
    lines(parts,spb){ const a=arm(); const bp=spb||SPB, t0=a.currentTime+0.06; let end=0;
      parts.forEach(p=>{ let beat=p.offset||0; for(let i=0;i<p.mids.length;i++){ const d=p.durs[i];
        if(p.mids[i]!=null) synthNote(p.mids[i],t0+beat*bp,d*bp*0.93,p.amp==null?1:p.amp); beat+=d; } if(beat>end)end=beat; });
      return end*bp+0.3; },
    // generic phrase with optional count-in clicks (used by rhythmic dictation). pitched line.
    phrase(midis,durs,spb,swing,countIn){ const a=arm(); const bp=spb||SPB; let t=a.currentTime+0.06;
      if(countIn){ for(let i=0;i<countIn;i++){ click(t,i===0); t+=bp; } }
      const t0=t; let beat=0;
      for(let i=0;i<midis.length;i++){ synthNote(midis[i],t0+swungBeat(beat,swing)*bp,Math.min(durs[i]*bp*0.92,2.0)); beat+=durs[i]; }
      return (t0-a.currentTime)+beat*bp+0.2; },
    // a melody played in a given timbre (sampled instrument) — a substantial excerpt
    async sampleMelody(instr,midis,durs,spb,swing){ const arr=await loadInstrument(instr); arm(); const a=ac();
      const bp=spb||0.5, t0=a.currentTime+0.06; let beat=0;
      for(let i=0;i<midis.length;i++){ const midi=midis[i]; let best=arr[0]; for(const e of arr) if(Math.abs(e.midi-midi)<Math.abs(best.midi-midi)) best=e;
        const src=a.createBufferSource(), g=a.createGain(); src.buffer=best.buffer; src.playbackRate.value=Math.pow(2,(midi-best.midi)/12);
        g.gain.value=0.85; src.connect(g); g.connect(getBus());
        const st=t0+swungBeat(beat,swing)*bp, dur=Math.min(durs[i]*bp,best.buffer.duration/src.playbackRate.value);
        src.start(st); try{src.stop(st+dur+0.05);}catch(e){} beat+=durs[i]; }
      return beat*bp+0.3; },
    // a metre as a repeating accompaniment GROOVE (not a tune): the same eighth-pulse accent
    // pattern used by groove(), but rendered as pitched bass + light chord comp, repeated several
    // bars so the pulse and grouping are unmistakable. 'S'=downbeat (root bass, accent),
    // 'M'=secondary strong beat (fifth bass), 'b'=beat (chord), 's'=subdivision (soft comp).
    metreGroove(pulses,spb){ const a=arm(); let t=a.currentTime+0.08; const sp=spb||0.26;
      const bars = pulses.length>=9 ? 2 : 3;
      const ROOT=48, FIFTH=43, CH=[60,64,67], HI=67;  // static I chord — harmony never moves, so it reads as pulse
      for(let bar=0;bar<bars;bar++){ pulses.forEach(p=>{
        if(p==='S'){ padNote(ROOT,t,sp*1.9,1.3); CH.forEach(c=>synthNote(c,t,sp*0.85,0.5)); click(t,true); }
        else if(p==='M'){ padNote(FIFTH,t,sp*1.6,1.0); CH.forEach(c=>synthNote(c,t,sp*0.75,0.38)); }
        else if(p==='b'){ CH.forEach(c=>synthNote(c,t,sp*0.6,0.4)); }
        else { synthNote(HI,t,sp*0.42,0.2); }  // subdivision — soft, so simple vs compound is audible
        t+=sp; }); }
      return t-a.currentTime+0.25; },
    // chords (each lasting chordBeats) with an independent melody over the top — a phrase "in context"
    progMelody(chords,melMids,melDurs,spb,chordBeats,style){ const a=arm(); const bp=spb||0.5, t0=a.currentTime+0.06, cb=chordBeats||2;
      let ct=t0; chords.forEach(ch=>{
        if(style==='broken'){ const up=ch.slice(1); let k=0; for(let b=0;b<cb*2;b++){ const m=(b%2===0&&b%4===0)?ch[0]:up[k++%up.length]; synthNote(m,ct+b*bp*0.5,bp*0.5*0.9,0.5); } }
        else ch.forEach(m=>padNote(m,ct,cb*bp*1.04,0.58));
        ct+=cb*bp; });
      let beat=0; for(let i=0;i<melMids.length;i++){ if(melMids[i]!=null) synthNote(melMids[i],t0+beat*bp,melDurs[i]*bp*0.95,1.05); beat+=melDurs[i]; }
      return Math.max(ct,t0+beat*bp)-a.currentTime+0.2; },
    // establish a tonality: tonic triad, then the scale ascending
    tonalityCue(root,steps,chord){ const a=arm(); let t=a.currentTime+0.06;
      chord.forEach(c=>synthNote(root+c,t,0.95)); t+=1.05;
      steps.forEach(s=>{ synthNote(root+s,t,0.34); t+=0.3; }); return t-a.currentTime+0.1; },
  };
})();
