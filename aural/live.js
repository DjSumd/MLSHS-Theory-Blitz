/*blitz-stamp*/(window.BLITZ_FILES=window.BLITZ_FILES||{})["live.js"]="20261030h";
// live.js — "Sing it" (microphone pitch check for sol-fa singing) and "Tap it" (tap a rhythm in time) for Aural Blitz.
(function(){
  const LV={};
  // ---------- pitch detection (autocorrelation over the singing range) ----------
  function detect(buf,sr){const n=buf.length;let rms=0;for(let i=0;i<n;i++)rms+=buf[i]*buf[i];rms=Math.sqrt(rms/n);if(rms<0.01)return null;
    const minL=Math.floor(sr/1100),maxL=Math.min(n-2,Math.floor(sr/75));let best=-1,bl=-1;const c=new Float32Array(maxL+2);
    for(let L=minL;L<=maxL+1;L++){let s=0,e1=0,e2=0;for(let j=0;j<n-L;j++){const a=buf[j],b=buf[j+L];s+=a*b;e1+=a*a;e2+=b*b;}c[L]=s/Math.sqrt(e1*e2+1e-12);}
    for(let L=minL+1;L<=maxL;L++){if(c[L]>c[L-1]&&c[L]>=c[L+1]&&c[L]>best){best=c[L];bl=L;}}
    // prefer the first strong peak (avoids octave errors)
    for(let L=minL+1;L<=maxL;L++){if(c[L]>c[L-1]&&c[L]>=c[L+1]&&c[L]>0.9*best){bl=L;best=c[L];break;}}
    if(bl<0||best<0.55)return null;const a=c[bl-1],b=c[bl],d=c[bl+1];const den=a+d-2*b;const shift=den?(a-d)/(2*den):0;const f=sr/(bl+shift);
    return {f,midi:69+12*Math.log2(f/440),clarity:best,rms};}
  const PC=['C','C♯','D','E♭','E','F','F♯','G','A♭','A','B♭','B'];
  LV.noteName=m=>PC[((Math.round(m)%12)+12)%12];
  let mic=null;
  async function openMic(){if(mic)return mic;const stream=await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:false,noiseSuppression:false,autoGainControl:false}});
    const ctx=new (window.AudioContext||window.webkitAudioContext)();const src=ctx.createMediaStreamSource(stream);const an=ctx.createAnalyser();an.fftSize=2048;src.connect(an);mic={ctx,an,stream,buf:new Float32Array(an.fftSize)};return mic;}
  LV.closeMic=function(){if(!mic)return;try{mic.stream.getTracks().forEach(t=>t.stop());mic.ctx.close();}catch(e){}mic=null;};
  // run a sing check: targets [{syl,pc}] (pc = semitones above the tonic, mod 12); ui callbacks
  LV.sing=async function(o){let m;try{m=await openMic();}catch(e){o.onError&&o.onError(e);return;}if(m.ctx.state==='suspended')await m.ctx.resume();
    const res=[];let k=0,hold=0,wrongHold=0,start=performance.now(),lastMidi=null,stopped=false;const NEED=320,LIMIT=o.limit||5000;
    const tick=()=>{if(stopped)return;m.an.getFloatTimeDomainData(m.buf);const p=detect(m.buf,m.ctx.sampleRate);const now=performance.now();
      if(p){const rel=((p.midi-o.tonicMidi)%12+12)%12;let off=rel-o.targets[k].pc;off=((off+6)%12+12)%12-6;lastMidi=p.midi;o.onPitch&&o.onPitch({midi:p.midi,off,ok:Math.abs(off)<=0.5,rel});
        if(Math.abs(off)<=0.5){hold+=60;wrongHold=0;}else{hold=Math.max(0,hold-30);wrongHold+=60;}}else{hold=Math.max(0,hold-30);o.onPitch&&o.onPitch(null);}
      const done=ok=>{res.push({ok,sung:lastMidi});o.onNote&&o.onNote(k,ok,lastMidi);k++;hold=0;wrongHold=0;start=now;if(k>=o.targets.length){stopped=true;clearInterval(iv);o.onDone&&o.onDone(res);}};
      if(hold>=NEED)done(true);else if(now-start>LIMIT)done(false);};
    const iv=setInterval(tick,60);o.cancel=()=>{stopped=true;clearInterval(iv);};return o;};
  // ---------- rhythm tapping ----------
  let actx=null;const AC=()=>actx||(actx=new (window.AudioContext||window.webkitAudioContext)());
  function click(t,acc,freq){const c=AC();const o=c.createOscillator(),g=c.createGain();o.frequency.value=freq||(acc?1600:1000);g.gain.setValueAtTime(0.0001,t);g.gain.exponentialRampToValueAtTime(acc?0.6:0.35,t+0.003);g.gain.exponentialRampToValueAtTime(0.0001,t+0.06);o.connect(g).connect(c.destination);o.start(t);o.stop(t+0.08);}
  function beep(t,d){const c=AC();const o=c.createOscillator(),g=c.createGain();o.type='triangle';o.frequency.value=523.25;g.gain.setValueAtTime(0.0001,t);g.gain.exponentialRampToValueAtTime(0.4,t+0.01);g.gain.exponentialRampToValueAtTime(0.0001,t+Math.max(0.08,d*0.9));o.connect(g).connect(c.destination);o.start(t);o.stop(t+d);}
  function tapSound(){const c=AC();const t=c.currentTime;const o=c.createOscillator(),g=c.createGain();o.type='sine';o.frequency.setValueAtTime(880,t);o.frequency.exponentialRampToValueAtTime(420,t+0.05);g.gain.setValueAtTime(0.0001,t);g.gain.exponentialRampToValueAtTime(0.7,t+0.002);g.gain.exponentialRampToValueAtTime(0.0001,t+0.09);o.connect(g).connect(c.destination);o.start(t);o.stop(t+0.1);}
  LV.tapSound=tapSound;
  // play the rhythm (onsets/durs in beats) on one pitch after a count-in
  LV.playRhythm=function(onsets,durs,spb,bpb){const c=AC();if(c.state==='suspended')c.resume();const t0=c.currentTime+0.15;for(let b=0;b<bpb;b++)click(t0+b*spb,b===0);const s=t0+bpb*spb;onsets.forEach((on,i)=>beep(s+on*spb,durs[i]*spb));return (bpb*spb+(onsets.length?onsets[onsets.length-1]+durs[durs.length-1]:0)*spb+0.3);};
  // record taps: count-in, then the student taps; returns {expected:[s], taps:[s]} relative to the first beat after the count-in
  LV.tapRun=function(o){const c=AC();if(c.state==='suspended')c.resume();const spb=o.spb,bpb=o.bpb;const t0=c.currentTime+0.2;for(let b=0;b<bpb;b++)click(t0+b*spb,b===0);
    const first=t0+bpb*spb;if(o.guide)for(let b=0;b<Math.ceil(o.total);b++)click(first+b*spb,b%bpb===0,b%bpb===0?900:700);
    const taps=[];const lat=(c.outputLatency||c.baseLatency||0);const tap=()=>{tapSound();const t=c.currentTime-lat-first;if(t>-spb*0.6)taps.push(t);o.onTap&&o.onTap(t);};
    const end=first+(o.total+1)*spb;let timer=setInterval(()=>{if(c.currentTime>=end){clearInterval(timer);timer=null;o.onDone&&o.onDone(grade(o.onsets.map(x=>x*spb),taps,spb));}},40);
    o.onStart&&o.onStart((first-c.currentTime)*1000);return {tap,stop:()=>{if(timer)clearInterval(timer);timer=null;}};};
  function grade(exp,taps,spb){const tol=Math.max(0.09,Math.min(0.16,spb*0.25));const used=new Set();const hits=exp.map(e=>{let bi=-1,bd=1e9;taps.forEach((t,j)=>{if(used.has(j))return;const d=Math.abs(t-e);if(d<bd){bd=d;bi=j;}});if(bi>=0&&bd<=tol){used.add(bi);return {ok:true,d:taps[bi]-e};}return {ok:false};});
    const extra=taps.length-used.size;const n=exp.length;const good=hits.filter(h=>h.ok).length;return {hits,extra,frac:n?Math.max(0,(good-extra*0.5)/n):0,good,n,exp,taps};}
  LV.grade=grade;
  window.LiveKit=LV;
})();
