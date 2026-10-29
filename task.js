// task.js — Class tasks for Aural Blitz and Theory Blitz (shared, identical in both apps).
// A teacher builds a task (sections, counts, settings) and shares it as a link / QR / code.
// Students complete it in a locked mode. The result is a sealed receipt: compressed JSON encrypted
// (ECDH P-256 + AES-GCM) to the teacher's public key, so only a device holding the teacher key can
// read it. The student-visible score is never what the teacher records: the teacher's device opens
// the receipt and reads the marks from it.
(function(){
  const TK={V:1,run:null};
  const LS={get(k,d){try{const v=localStorage.getItem(k);return v===null?d:JSON.parse(v);}catch(e){return d;}},set(k,v){try{localStorage.setItem(k,JSON.stringify(v));}catch(e){}},del(k){try{localStorage.removeItem(k);}catch(e){}}};
  const K_EMAIL='blitzTeacherEmail',K_TEACH='blitzTeacherKey',K_TASKS='blitzTeacherTasks',K_RES='blitzTeacherResults',K_ADDR='blitzTeacherAddr';
  const esc=s=>(''+s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  let A=null; // adapter from the host app

  // ---------- encoding ----------
  const b64u={enc(u8){let s='';for(let i=0;i<u8.length;i++)s+=String.fromCharCode(u8[i]);return btoa(s).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');},
    dec(str){str=str.replace(/-/g,'+').replace(/_/g,'/');while(str.length%4)str+='=';const b=atob(str);const u=new Uint8Array(b.length);for(let i=0;i<b.length;i++)u[i]=b.charCodeAt(i);return u;}};
  const enc=new TextEncoder(),dec=new TextDecoder();
  async function packBytes(obj){const raw=enc.encode(JSON.stringify(obj));
    if(window.CompressionStream){try{const ab=await new Response(new Blob([raw]).stream().pipeThrough(new CompressionStream('deflate-raw'))).arrayBuffer();const u=new Uint8Array(ab);const out=new Uint8Array(u.length+1);out[0]=1;out.set(u,1);return out;}catch(e){}}
    const out=new Uint8Array(raw.length+1);out[0]=0;out.set(raw,1);return out;}
  async function unpackBytes(u8){const flag=u8[0],body=u8.slice(1);let txt;
    if(flag===1){const ab=await new Response(new Blob([body]).stream().pipeThrough(new DecompressionStream('deflate-raw'))).arrayBuffer();txt=dec.decode(ab);}else txt=dec.decode(body);
    return JSON.parse(txt);}
  const cat=(...a)=>{const n=a.reduce((s,x)=>s+x.length,0);const o=new Uint8Array(n);let p=0;a.forEach(x=>{o.set(x,p);p+=x.length;});return o;};
  async function sha(str){const h=new Uint8Array(await crypto.subtle.digest('SHA-256',enc.encode(str)));return [...h].map(b=>b.toString(16).padStart(2,'0')).join('');}
  const rid=n=>{const a=crypto.getRandomValues(new Uint8Array(n));return [...a].map(b=>'abcdefghjkmnpqrstuvwxyz23456789'[b%31]).join('');};
  function hashStr(s){let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619);}return h>>>0;}
  const nameKey=n=>(n||'').trim().toLowerCase().replace(/\s+/g,' ');

  // ---------- crypto ----------
  const EC={name:'ECDH',namedCurve:'P-256'};
  async function seal(pubB64,bytes){const tp=await crypto.subtle.importKey('raw',b64u.dec(pubB64),EC,false,[]);
    const eph=await crypto.subtle.generateKey(EC,true,['deriveKey']);
    const key=await crypto.subtle.deriveKey({name:'ECDH',public:tp},eph.privateKey,{name:'AES-GCM',length:256},false,['encrypt']);
    const iv=crypto.getRandomValues(new Uint8Array(12));const ct=new Uint8Array(await crypto.subtle.encrypt({name:'AES-GCM',iv},key,bytes));
    const ep=new Uint8Array(await crypto.subtle.exportKey('raw',eph.publicKey));return cat(new Uint8Array([1]),ep,iv,ct);}
  async function unseal(bytes){if(!KEY.priv)throw new Error('locked');
    const ep=bytes.slice(1,66),iv=bytes.slice(66,78),ct=bytes.slice(78);
    const priv=KEY.priv;const epk=await crypto.subtle.importKey('raw',ep,EC,false,[]);
    const key=await crypto.subtle.deriveKey({name:'ECDH',public:epk},priv,{name:'AES-GCM',length:256},false,['decrypt']);
    const pt=new Uint8Array(await crypto.subtle.decrypt({name:'AES-GCM',iv},key,ct));return {payload:await unpackBytes(pt),fp:b64u.enc(ep).slice(0,22)};}
  const cryptoOK=()=>!!(window.crypto&&crypto.subtle&&window.isSecureContext!==false);

  // ---------- addresses ----------
  function appAddr(){if(/^https?:/.test(location.protocol))return location.origin+location.pathname;return LS.get(K_ADDR+':'+A.app,'');}
  const taskLink=code=>{const a=appAddr();return a?a+'#task='+code:'';};
  const verifyLink=code=>{const a=appAddr();return a?a+'#verify='+code:'';};

  // ---------- QR ----------
  function qrSVG(text,px){try{const q=qrcode(0,'L');q.addData(text,'Byte');q.make();return q.createSvgTag({cellSize:4,margin:2,scalable:true}).replace('<svg ','<svg style="width:'+(px||240)+'px;height:'+(px||240)+'px;background:#fff" ');}catch(e){return '<p class="sub">This is too long for a QR code — use the link or code.</p>';}}

  // ---------- modal ----------
  function modal(html,wide){let m=document.getElementById('tkmodal'),b=document.getElementById('tkback');
    if(!m){b=document.createElement('div');b.className='gback';b.id='tkback';document.body.appendChild(b);m=document.createElement('div');m.className='guide';m.id='tkmodal';document.body.appendChild(m);b.onclick=closeModal;}
    m.style.width=wide?'min(860px,95vw)':'';m.dataset.teacher=wide?'1':'';m.innerHTML='<button class="gclose" id="tkclose">✕</button>'+html;document.getElementById('tkclose').onclick=closeModal;m.classList.add('open');b.classList.add('open');m.scrollTop=0;return m;}
  function closeModal(){const m=document.getElementById('tkmodal'),b=document.getElementById('tkback');if(m)m.classList.remove('open');if(b)b.classList.remove('open');}
  function toast(t){if(A&&A.toast)A.toast(t);}
  async function copy(text,label){try{await navigator.clipboard.writeText(text);toast((label||'Copied')+' ✓');}catch(e){const ta=document.createElement('textarea');ta.value=text;document.body.appendChild(ta);ta.select();try{document.execCommand('copy');toast((label||'Copied')+' ✓');}catch(e2){}ta.remove();}}

  // ---------- task codes ----------
  async function encodeTask(t){return b64u.enc(await packBytes(t));}
  async function decodeTask(code){return unpackBytes(b64u.dec(code.trim()));}

  // ---------- student run ----------
  const runKey=(id,name)=>'blitzTaskRun:'+id+':'+nameKey(name);
  function expandItems(task,name){const out=[];let pos=0;const base=task.id+'|'+(task.ps?nameKey(name):'');
    task.s.forEach((sec,si)=>{for(let k=0;k<sec.n;k++){out.push({u:sec.u,si,cfg:sec.cfg||null,m:sec.m||'',d:sec.d||'',seed:hashStr(base+'|'+pos),secSeed:hashStr(base+'|s'+si)});pos++;}});return out;}
  async function begin(task,code,name){
    const run=LS.get(runKey(task.id,name),null)||{st:Date.now(),rec:{},reloads:-1,done:false};run.reloads=(run.reloads||0)+1;
    const seen=LS.get('blitzTaskSeen:'+task.id,[]);const nk=nameKey(name);if(!seen.includes(nk)){seen.push(nk);LS.set('blitzTaskSeen:'+task.id,seen);}
    run.th=(await sha(code)).slice(0,16);
    TK.run={task,code,name,items:task.tt?[]:expandItems(task,name),total:task.tt?0:task.s.reduce((a,s)=>a+s.n,0),state:run};saveRun();
    closeModal();document.body.classList.add('tasking');document.body.classList.toggle('nohints',!task.h);A.start(TK.run);}
  function saveRun(){if(TK.run)LS.set(runKey(TK.run.task.id,TK.run.name),TK.run.state);}
  TK.record=function(pos,ok,frac,secs,plays){const R=TK.run;if(!R||R.state.rec[pos])return;
    const f=Math.max(0,Math.min(1,frac===undefined||frac===null||isNaN(frac)?(ok?1:0):frac));R.state.rec[pos]=[Math.round(f*100),Math.min(65535,Math.round(secs||0)),Math.min(255,Math.round((plays||0)*2)),ok?1:0];saveRun();};
  // tests (Years 7–10): the shell sets the plan once it has built the test. mk = marks for each position, groups = [[label,count],…]
  TK.setPlan=function(mk,groups){const R=TK.run;if(!R)return;R.total=mk.length;R.mk=mk;R.groups=groups;};
  TK.testSeed=function(){const R=TK.run;return R?hashStr(R.task.id+'|test|'+(R.task.ps?nameKey(R.name):''))%33554432:0;};
  TK.answered=()=>TK.run?Object.keys(TK.run.state.rec).length:0;
  TK.isDone=()=>TK.run&&TK.answered()>=TK.run.total;
  TK.firstOpen=()=>{if(!TK.run)return 0;for(let i=0;i<TK.run.total;i++)if(!TK.run.state.rec[i])return i;return -1;};
  TK.score=()=>{const R=TK.run;if(!R)return {got:0,max:0};const w=i=>R.mk?R.mk[i]:1;let g=0;Object.entries(R.state.rec).forEach(([i,r])=>g+=r[0]/100*w(+i));return {got:Math.round(g*2)/2,max:R.mk?R.mk.reduce((a,b)=>a+b,0):R.total};};
  TK.banner=function(){const R=TK.run;if(!R)return '';const n=TK.answered();return `<div class="tkbar"><span><b>Class task</b> · ${esc(R.task.ti||'')}${R.task.cl?' · '+esc(R.task.cl):''}</span><span>${esc(R.name)} · ${n} / ${R.total} answered <button class="tkleave" id="tkleave">Leave task</button></span></div>`;};
  TK.wireBanner=function(){const b=document.getElementById('tkleave');if(b)b.onclick=()=>{if(TK.isDone()||confirm('Leave the task? Your answers so far are saved on this device; open the task link again to carry on.'))TK.leave();};};
  TK.leave=function(){TK.run=null;document.body.classList.remove('tasking','nohints');try{if(/#task=/.test(location.hash))history.replaceState(null,'',location.pathname+location.search);}catch(e){}A.exit();};
  async function receipt(){const R=TK.run,S=R.state;if(S.receipt)return S.receipt;if(!S.fn){S.fn=Date.now();}
    const payload={v:1,a:A.app,k:R.task.id,ti:R.task.ti||'',cl:R.task.cl||'',nm:R.name,y:R.task.y,n:R.total,st:Math.round(S.st/1000),fn:Math.round(S.fn/1000),th:S.th,
      s:R.task.tt?(R.groups||[]):R.task.s.map(x=>[x.u,x.n]),mk:R.task.tt?R.mk:undefined,tt:R.task.tt?1:undefined,q:Array.from({length:R.total},(_,i)=>S.rec[i]||[0,0,0,0]),u:Array.from({length:R.total},(_,i)=>i).filter(i=>!S.rec[i]),rl:S.reloads||0,
      ot:(LS.get('blitzTaskSeen:'+R.task.id,[])).filter(n=>n!==nameKey(R.name)).slice(0,6)};
    const sealed=await seal(R.task.pk,await packBytes(payload));S.receipt='B1.'+b64u.enc(sealed);S.done=true;saveRun();return S.receipt;}
  TK.finishHtml=async function(){const R=TK.run;const code=await receipt();const sc=TK.score();const S=R.state;const mins=Math.max(1,Math.round((S.fn-S.st)/60000));
    return `<div class="tkdone"><div class="qnum">Class task complete</div><p class="prompt">${esc(R.task.ti||'Task')} — done</p>
      <p class="sub"><b>${esc(R.name)}</b>${R.task.cl?' · '+esc(R.task.cl):''} · ${sc.got} / ${sc.max} · ${mins} min</p>
      <div class="setgrp" style="text-align:left"><div class="setlabel">Your result code</div><textarea id="tkcode" class="tkin tkcodebox" rows="4" readonly>${code}</textarea></div>
      ${R.task.em?`<p class="sub"><b>Press Email it to my teacher, then press Send in Outlook.</b> If Outlook doesn't open, use the other email button, or copy the code and paste it where your teacher asks.</p>
      <div class="controls"><button class="btn-check" id="tkmail">✉ Email it to my teacher</button><button class="btn-ghost" id="tkmail2">Use my email app</button></div>
      <div class="controls"><button class="btn-ghost" id="tkcopy">Copy result code</button><button class="btn-ghost" id="tkback2">Back to practice</button></div>`
      :`<p class="sub"><b>Copy your result code and paste it where your teacher asks</b> (for example your Connect submission).</p>
      <div class="controls"><button class="btn-check" id="tkcopy">Copy result code</button><button class="btn-ghost" id="tkback2">Back to practice</button></div>`}
      <p class="sub">The code is sealed: only your teacher's device can open it, so it can't be changed.</p></div>`;};
  function mailParts(){const R=TK.run;const subj='Blitz result · '+(R.task.ti||'Class task')+(R.task.cl?' · '+R.task.cl:'')+' · '+R.name;
    const body='Result for '+R.name+(R.task.cl?' ('+R.task.cl+')':'')+' — '+(R.task.ti||'Class task')+'.\n\nSealed result code (please don\'t change it):\n[['+R.state.receipt+']]\n';return {to:R.task.em,subj,body};}
  TK.wireFinish=function(){const R=TK.run;
    const m1=document.getElementById('tkmail');if(m1)m1.onclick=()=>{const m=mailParts();const u='https://outlook.office.com/mail/deeplink/compose?to='+encodeURIComponent(m.to)+'&subject='+encodeURIComponent(m.subj)+'&body='+encodeURIComponent(m.body);window.open(u,'_blank','noopener');R.state.mailed=Date.now();saveRun();};
    const m2=document.getElementById('tkmail2');if(m2)m2.onclick=()=>{const m=mailParts();location.href='mailto:'+encodeURIComponent(m.to)+'?subject='+encodeURIComponent(m.subj)+'&body='+encodeURIComponent(m.body);R.state.mailed=Date.now();saveRun();};const c=document.getElementById('tkcopy');if(c)c.onclick=()=>copy(R.state.receipt,'Result code copied');const box=document.getElementById('tkcode');if(box)box.onfocus=()=>box.select();const b=document.getElementById('tkback2');if(b)b.onclick=()=>TK.leave();};

  // ---------- student entry ----------
  async function openTaskCode(code,fromLink){let task;try{task=await decodeTask(code);}catch(e){modal('<p class="prompt">That task code didn\'t open</p><p class="sub">Check you copied the whole link or code.</p>');return;}
    if(!task||!task.s||!task.pk){modal('<p class="prompt">That isn\'t a task code</p>');return;}
    if(task.a!==A.app){modal(`<p class="prompt">This task is for ${task.a==='theory'?'Theory Blitz':'Aural Blitz'}</p><p class="sub">Open it in ${task.a==='theory'?'Theory Blitz':'Aural Blitz'} instead.</p>${A.companion?`<div class="controls"><button class="btn-check" id="tkgo">Open it there</button></div>`:''}`);const g=document.getElementById('tkgo');if(g)g.onclick=()=>{location.href=A.companion+'#task='+code;};return;}
    const nm=A.getName();const existing=nm&&LS.get(runKey(task.id,nm),null);
    if(existing&&fromLink){begin(task,code,nm);return;}
    const tot=task.s.reduce((a,s)=>a+s.n,0);
    modal(`<p class="prompt">${esc(task.ti||'Class task')}</p><p class="sub">${task.cl?esc(task.cl)+' · ':''}${task.tt?'Year '+task.y+' test (aural and theory) · use headphones':tot+' questions · Year '+task.y}. Type your full name as your teacher knows it. Once you start, the first answer you give to each question is the one that counts${task.ps?', and your questions are different from the person next to you':''}.</p>
      <div class="setgrp"><div class="setlabel">Your name</div><input id="tkname" maxlength="28" value="${esc(nm||'')}" placeholder="First and last name" style="padding:10px 12px;border:1px solid var(--rule);border-radius:6px;font-family:var(--sans);font-size:15px;width:100%"></div>
      <div class="controls"><button class="btn-check" id="tkstart">${existing?'Carry on':'Start the task'}</button><button class="btn-ghost" id="tkcancel">Not now</button></div>`);
    document.getElementById('tkcancel').onclick=closeModal;
    document.getElementById('tkstart').onclick=()=>{const v=document.getElementById('tkname').value.trim();if(v.split(/\s+/).length<2||v.length<4){toast('Type your first and last name');return;}A.setName(v);begin(task,code,v);};}
  TK.openStudentEntry=function(){if(TK.run){closeModal();return;}
    modal(`<p class="prompt">Class task</p><p class="sub">Open the link your teacher posted (for example in Connect), or paste the task link or code here.</p>
      <textarea id="tkpaste" rows="3" style="width:100%;padding:10px;border:1px solid var(--rule);border-radius:6px;font-family:var(--sans);font-size:13px" placeholder="Paste the task link or code"></textarea>
      <div class="controls"><button class="btn-check" id="tkopen">Open task</button></div>
      <p class="sub" style="margin-top:14px">Teacher? <a href="#" id="tkteach">Open teacher tools</a></p>`);
    document.getElementById('tkopen').onclick=()=>{let v=document.getElementById('tkpaste').value.trim();const m=v.match(/#task=([A-Za-z0-9_-]+)/);if(m)v=m[1];if(!v)return;openTaskCode(v,false);};
    document.getElementById('tkteach').onclick=e=>{e.preventDefault();TK.openTeacher();};};

  // ---------- teacher ----------
  const teacher=()=>LS.get(K_TEACH,null);
  // The private key is stored only encrypted with the teacher's PIN (PBKDF2 → AES-GCM). It is decrypted into memory
  // when the PIN is entered and dropped on lock, after 10 minutes without use, or when the app closes.
  const KEY={priv:null,jwk:null},PBKDF2_IT=400000,IDLE_MS=10*60*1000;let idleT=null,fails=0,waitUntil=0;
  async function pinKey(pin,salt,it){const base=await crypto.subtle.importKey('raw',enc.encode(pin),'PBKDF2',false,['deriveKey']);
    return crypto.subtle.deriveKey({name:'PBKDF2',salt:b64u.dec(salt),iterations:it||PBKDF2_IT,hash:'SHA-256'},base,{name:'AES-GCM',length:256},false,['encrypt','decrypt']);}
  async function wrapKey(jwk,pin){const salt=b64u.enc(crypto.getRandomValues(new Uint8Array(16)));const iv=crypto.getRandomValues(new Uint8Array(12));
    const ct=new Uint8Array(await crypto.subtle.encrypt({name:'AES-GCM',iv},await pinKey(pin,salt),enc.encode(JSON.stringify(jwk))));return {salt,iv:b64u.enc(iv),ct:b64u.enc(ct),it:PBKDF2_IT};}
  async function loadKey(jwk){KEY.jwk=jwk;KEY.priv=await crypto.subtle.importKey('jwk',jwk,EC,false,['deriveKey']);touch();}
  function lockNow(quiet){const was=!!KEY.priv;KEY.priv=null;KEY.jwk=null;clearTimeout(idleT);const m=document.getElementById('tkmodal');if(was&&m&&m.classList.contains('open')&&m.dataset.teacher==='1')closeModal();if(was&&!quiet)toast('Teacher tools locked');}
  function touch(){if(!KEY.priv)return;clearTimeout(idleT);idleT=setTimeout(()=>lockNow(),IDLE_MS);}
  ['pointerdown','keydown'].forEach(ev=>addEventListener(ev,touch,true));addEventListener('pagehide',()=>lockNow(true));
  // returns 'ok' | 'bad' | 'weak' (old short PIN that must be replaced)
  async function unlockWith(pin){const T=teacher();if(!T)return 'bad';
    if(T.enc){try{const pt=await crypto.subtle.decrypt({name:'AES-GCM',iv:b64u.dec(T.enc.iv)},await pinKey(pin,T.enc.salt,T.enc.it),b64u.dec(T.enc.ct));await loadKey(JSON.parse(dec.decode(pt)));return 'ok';}catch(e){return 'bad';}}
    if(T.priv&&T.pin){if((await sha(T.salt+'|'+pin))!==T.pin)return 'bad';await loadKey(T.priv);if(pin.length<6)return 'weak';await saveWrapped(pin);return 'ok';}
    return 'bad';}
  async function saveWrapped(pin){const T=teacher();LS.set(K_TEACH,{v:2,pub:T.pub,enc:await wrapKey(KEY.jwk,pin),at:T.at||Date.now()});}
  const pinFields=(a,b)=>`<div class="setgrp"><div class="setlabel">${a}</div><input id="tkpin1" type="password" autocomplete="new-password" maxlength="64" class="tkin"></div>
      <div class="setgrp"><div class="setlabel">${b}</div><input id="tkpin2" type="password" autocomplete="new-password" maxlength="64" class="tkin"></div>`;
  function readNewPin(){const a=document.getElementById('tkpin1').value,b=document.getElementById('tkpin2').value;if(a.length<6){toast('Use at least 6 characters');return null;}if(a!==b){toast('They don\'t match');return null;}if(/^(\d)\1+$/.test(a)||/^(012345|123456|234567|345678|456789|987654|654321)/.test(a)){toast('Too easy to guess — choose another');return null;}return a;}
  function needNewPin(then){modal(`<p class="prompt">Choose a longer PIN</p><p class="sub">Teacher tools now encrypt your teacher key with your PIN, so it needs at least 6 characters. Letters and numbers both work; a short passphrase is strongest.</p>${pinFields('New PIN or passphrase (6+ characters)','Again')}<div class="controls"><button class="btn-check" id="tkset">Save</button></div>`);document.getElementById('tkmodal').dataset.teacher='1';
    document.getElementById('tkset').onclick=async()=>{const v=readNewPin();if(!v)return;await saveWrapped(v);toast('PIN saved');teacherHome(then);};}
  function needCrypto(){modal('<p class="prompt">Teacher tools need a secure page</p><p class="sub">Open the app from its https web address (GitHub Pages) or a recent browser. This browser can\'t do the encryption the results use.</p>');}
  TK.openTeacher=async function(then){if(!cryptoOK()){needCrypto();return;}
    const T=teacher();
    if(!T){modal(`<p class="prompt">Set up teacher tools</p><p class="sub">This creates a teacher key on this device. Class task results are sealed to this key, so only devices holding it can open them. The key is stored encrypted with your PIN: without the PIN it can't be used, even by someone who gets onto this device.</p>
      ${pinFields('PIN or passphrase (6+ characters)','Again')}
      <div class="controls"><button class="btn-check" id="tkmake">Create teacher key</button></div>
      <p class="sub">Already set up on another device? Open that device's Teacher tools → Settings → <b>Add another device</b> and copy its code to this one.</p>`);
      document.getElementById('tkmake').onclick=async()=>{const a=readNewPin();if(!a)return;
        const kp=await crypto.subtle.generateKey(EC,true,['deriveKey']);const pub=b64u.enc(new Uint8Array(await crypto.subtle.exportKey('raw',kp.publicKey)));const jwk=await crypto.subtle.exportKey('jwk',kp.privateKey);
        LS.set(K_TEACH,{v:2,pub,enc:await wrapKey(jwk,a),at:Date.now()});await loadKey(jwk);toast('Teacher key created');teacherHome(then);};return;}
    if(!KEY.priv){modal(`<p class="prompt">Teacher tools</p><div class="setgrp"><div class="setlabel">PIN</div><input id="tkpin" type="password" autocomplete="current-password" maxlength="64" class="tkin"></div><div class="controls"><button class="btn-check" id="tkunlock">Open</button></div><p class="sub">This is the PIN you chose when you first set up teacher tools. It's shared by every Blitz app on this web address (Aural and Theory, 7–12 and ATAR), so a PIN set in one app opens the others. Teacher tools lock after 10 minutes without use and whenever the app closes.</p><p class="sub"><a href="#" id="tkforgot">Forgot your PIN?</a></p>`);
      document.getElementById('tkforgot').onclick=e=>{e.preventDefault();forgotPin(then);};
      const go=async()=>{const now=Date.now();if(now<waitUntil){toast('Too many tries — wait '+Math.ceil((waitUntil-now)/1000)+' s');return;}
        const btn=document.getElementById('tkunlock');btn.disabled=true;btn.textContent='Checking…';const r=await unlockWith(document.getElementById('tkpin').value);
        if(r==='bad'){fails++;if(fails>=5)waitUntil=Date.now()+30000*Math.pow(2,Math.min(4,fails-5));btn.disabled=false;btn.textContent='Open';toast(fails>=3?'Wrong PIN — use "Forgot your PIN?" if you can\'t remember it':'Wrong PIN');return;}
        fails=0;if(r==='weak'){needNewPin(then);return;}teacherHome(then);};
      document.getElementById('tkunlock').onclick=go;document.getElementById('tkpin').onkeydown=e=>{if(e.key==='Enter')go();};setTimeout(()=>{const p=document.getElementById('tkpin');if(p)p.focus();},50);return;}
    touch();teacherHome(then);};
  function forgotPin(then){const nT=LS.get(K_TASKS,[]).length,nR=LS.get(K_RES,[]).length;
    modal(`<p class="prompt">Start again with a new teacher key?</p><p class="sub">Your PIN can't be recovered: it isn't stored anywhere. Starting again creates a new teacher key and PIN for every Blitz app on this web address, on this device.</p>
      <p class="sub"><b>This also removes, from this device:</b> ${nT} saved task${nT===1?'':'s'} and ${nR} recorded result${nR===1?'':'s'}. Result codes from tasks you set with the old key can't be opened any more, so set those tasks again. Another device that still has the old key and knows its PIN is unaffected.</p>
      <div class="setgrp"><div class="setlabel">Type RESET to confirm</div><input id="tkreset" class="tkin" maxlength="8" autocomplete="off"></div>
      <div class="controls"><button class="btn-ans" id="tkdoreset">Start again</button><button class="btn-ghost" id="tkkeep">Cancel</button></div>`);
    document.getElementById('tkkeep').onclick=()=>TK.openTeacher(then);
    document.getElementById('tkdoreset').onclick=()=>{if(document.getElementById('tkreset').value.trim().toUpperCase()!=='RESET'){toast('Type RESET to confirm');return;}
      lockNow(true);LS.del(K_TEACH);LS.del(K_TASKS);LS.del(K_RES);fails=0;waitUntil=0;toast('Teacher tools reset');TK.openTeacher(then);};}
  // run cb once the teacher key is unlocked (asks for the PIN, or sets up teacher tools first)
  TK.requireTeacher=function(cb){TK.openTeacher(()=>{closeModal();cb();});};
  const tabsHtml=cur=>`<div class="tktabs">${[['new','Set a task'],['res','Results'],['tasks','My tasks'],['set','Settings']].map(([k,l])=>`<button data-tt="${k}" class="${cur===k?'on':''}">${l}</button>`).join('')}</div>`;
  function markT(){const m=document.getElementById('tkmodal');if(m)m.dataset.teacher='1';}
  function wireTabs(){document.querySelectorAll('.tktabs button').forEach(b=>b.onclick=()=>teacherHome(b.dataset.tt));}
  function teacherHome(tab){if(!KEY.priv){TK.openTeacher(tab);return;}if(typeof tab==='function'){Promise.resolve(tab()).then(markT);return;}setTimeout(markT,0);tab=tab||'new';if(tab==='new')builder();else if(tab==='res')results();else if(tab==='tasks')myTasks();else settings();}

  function builder(){const secs=A.sections();const yrs=A.years;const y=A.year();
    modal(`<p class="prompt">Set a class task — ${esc(A.label)}</p>${tabsHtml('new')}
      ${A.test?`<div class="setgrp"><div class="setlabel">Task type</div><div class="setchips"><button class="chip on" data-ty="sec">Practice sections</button><button class="chip" data-ty="test">Test (Years 7–10, aural and theory)</button></div></div>`:''}
      <p class="sub" id="tksecnote">Each section uses the settings in its own ⚙ Customise on this device (set those first). Students can't change anything once they start.</p>
      <p class="sub" id="tktestnote" style="display:none">Students sit the Year test on their own device with headphones: the aural section plays on their device and the theory section follows on the same page. The test is marked like the printed test (marks per question), and the sealed result comes back to you as usual.</p>
      <div class="tkgrid"><div class="setgrp"><div class="setlabel">Title</div><input id="tkti" class="tkin" maxlength="60" placeholder="e.g. Intervals and melodic dictation"></div>
        <div class="setgrp"><div class="setlabel">Class</div><input id="tkcl" class="tkin" maxlength="24" placeholder="e.g. 8B"></div>
        <div class="setgrp"><div class="setlabel">Year content</div><select id="tky" class="setsel">${yrs.map(v=>`<option value="${v}"${v===y?' selected':''}>Year ${v}</option>`).join('')}</select></div>
        <div class="setgrp" id="tksemg" style="display:none"><div class="setlabel">Semester (heading)</div><select id="tksem" class="setsel"><option value="One"${new Date().getMonth()<6?' selected':''}>Semester One</option><option value="Two"${new Date().getMonth()>=6?' selected':''}>Semester Two</option></select></div></div>
      <div class="setgrp"><div class="setlabel">Your email for results</div><input id="tkem" class="tkin" type="email" maxlength="80" value="${esc(LS.get(K_EMAIL,''))}" placeholder="e.g. firstname.lastname@education.wa.edu.au"><p class="sub" style="margin:4px 0 0">Students get an <b>Email it to my teacher</b> button that sends their sealed result here. Leave it empty if you'd rather they copy the code into Connect.</p></div>
      <div class="setlabel tksecbits" style="margin-top:6px">Sections and number of questions</div>
      <div class="tksecs tksecbits">${secs.map(s=>`<div class="tksec" data-u="${s.key}"><span class="nm">${esc(s.name)}</span>
        ${s.notate?`<select class="tkm"><option value="choice">Listen &amp; pick</option><option value="notate">Listen &amp; write</option></select>`:''}
        ${s.diff?`<select class="tkd"><option value="easy">Easy</option><option value="med">Medium</option><option value="hard">Hard</option></select>`:''}
        <span class="tkn"><button data-d="-1">−</button><b>0</b><button data-d="1">+</button></span></div>`).join('')}</div>
      <div class="setgrp"><div class="setchips"><button class="chip on" id="tkps">Different questions for each student</button><button class="chip on tksecbits" id="tkh">Allow "How do I work this out?"</button></div></div>
      <div class="controls"><button class="btn-check" id="tkmake2">Create task</button><span class="sub" id="tktot" style="align-self:center;margin:0">0 questions</span></div>`,true);wireTabs();
    const tot=()=>{let n=0;document.querySelectorAll('.tksec b').forEach(b=>n+=+b.textContent);document.getElementById('tktot').textContent=n+' question'+(n===1?'':'s');return n;};
    document.querySelectorAll('.tksec .tkn button').forEach(b=>b.onclick=()=>{const v=b.parentNode.querySelector('b');v.textContent=Math.max(0,Math.min(20,+v.textContent+(+b.dataset.d)));b.closest('.tksec').classList.toggle('on',+v.textContent>0);tot();});
    ['tkps','tkh'].forEach(id=>document.getElementById(id).onclick=e=>e.target.classList.toggle('on'));
    let isTest=false;const setTy=t=>{isTest=t==='test';document.querySelectorAll('[data-ty]').forEach(b=>b.classList.toggle('on',b.dataset.ty===t));document.querySelectorAll('.tksecbits').forEach(e=>e.style.display=isTest?'none':'');
      document.getElementById('tksecnote').style.display=isTest?'none':'';document.getElementById('tktestnote').style.display=isTest?'':'none';document.getElementById('tksemg').style.display=isTest?'':'none';
      const sel=document.getElementById('tky');[...sel.options].forEach(o=>{o.disabled=isTest&&+o.value>10;});if(isTest&&+sel.value>10)sel.value='10';document.getElementById('tktot').textContent=isTest?'Year test':tot()+' questions';};
    document.querySelectorAll('[data-ty]').forEach(b=>b.onclick=()=>setTy(b.dataset.ty));
    document.getElementById('tkmake2').onclick=async()=>{if(isTest){const yv=+document.getElementById('tky').value;const em=document.getElementById('tkem').value.trim();if(em&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em)){toast('Check the email address');return;}LS.set(K_EMAIL,em);
        const ti=document.getElementById('tkti').value.trim()||('Year '+yv+' test');const task={v:1,a:A.app,id:rid(8),em:em||undefined,ti,cl:document.getElementById('tkcl').value.trim(),y:yv,tt:1,sem:document.getElementById('tksem').value,ps:document.getElementById('tkps').classList.contains('on')?1:0,h:0,pk:teacher().pub,s:[],at:Date.now()};
        const code=await encodeTask(task);const th=(await sha(code)).slice(0,16);const list=LS.get(K_TASKS,[]);list.unshift({id:task.id,ti:task.ti,cl:task.cl,y:task.y,a:task.a,n:'test',at:task.at,code,th});LS.set(K_TASKS,list.slice(0,80));showTask(list[0]);return;}
      const n=tot();if(!n){toast('Add some questions first');return;}if(n>60){toast('Keep a task to 60 questions or fewer');return;}
      const chosen=[...document.querySelectorAll('.tksec')].filter(r=>+r.querySelector('b').textContent>0).map(r=>({u:r.dataset.u,n:+r.querySelector('b').textContent,m:r.querySelector('.tkm')?r.querySelector('.tkm').value:'',d:r.querySelector('.tkd')?r.querySelector('.tkd').value:''}));
      const yv=+document.getElementById('tky').value;const snap=A.snapshot(chosen.map(c=>c.u),yv);
      const em=document.getElementById('tkem').value.trim();if(em&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em)){toast('Check the email address');return;}LS.set(K_EMAIL,em);
      const task={v:1,a:A.app,id:rid(8),em:em||undefined,ti:document.getElementById('tkti').value.trim()||'Class task',cl:document.getElementById('tkcl').value.trim(),y:yv,ps:document.getElementById('tkps').classList.contains('on')?1:0,h:document.getElementById('tkh').classList.contains('on')?1:0,pk:teacher().pub,
        s:chosen.map(c=>Object.assign({u:c.u,n:c.n},c.m?{m:c.m}:{},c.d?{d:c.d}:{},snap.per&&snap.per[c.u]?{cfg:snap.per[c.u]}:{})),g:snap.global||null,at:Date.now()};
      const code=await encodeTask(task);const th=(await sha(code)).slice(0,16);const list=LS.get(K_TASKS,[]);list.unshift({id:task.id,ti:task.ti,cl:task.cl,y:task.y,a:task.a,n,at:task.at,code,th});LS.set(K_TASKS,list.slice(0,80));
      showTask(list[0]);};}
  function showTask(t){const link=taskLink(t.code);
    modal(`<p class="prompt">${esc(t.ti)}${t.cl?' · '+esc(t.cl):''}</p>${tabsHtml('tasks')}
      <p class="sub">${t.n==='test'?'Test':t.n+' questions'} · Year ${t.y} · ${t.a==='theory'?'Theory Blitz':'Aural Blitz'}. Post the link in Connect (or Teams or email). Students click it, type their name and start. When they finish, they copy their result code into their Connect submission, and you paste the codes into <b>Results</b>.</p>
      ${link?`<div class="setgrp"><div class="setlabel">Task link</div><textarea class="tkin tkcodebox" rows="3" readonly id="tklinkbox">${link}</textarea></div>`:`<p class="sub"><b>No web address set</b> — this copy of the app is opened from a file, so it can't make a link. Students paste the task code into <b>📋 Class task</b>, or set the app's web address in Settings.</p>`}
      <div class="setgrp"><div class="setlabel">Task code (for single-file copies: students paste it into 📋 Class task)</div><textarea class="tkin tkcodebox" rows="2" readonly id="tkcodebox2">${t.code}</textarea></div>
      <div class="controls">${link?'<button class="btn-check" id="tkcl1">Copy link</button>':''}<button class="btn-ghost" id="tkcl2">Copy task code</button><button class="btn-ghost" id="tkres1">Results for this task</button></div>`,true);wireTabs();
    if(link)document.getElementById('tkcl1').onclick=()=>copy(link,'Link copied');
    ['tklinkbox','tkcodebox2'].forEach(id=>{const b=document.getElementById(id);if(b)b.onfocus=()=>b.select();});
    document.getElementById('tkcl2').onclick=()=>copy(t.code,'Task code copied');document.getElementById('tkres1').onclick=()=>results(t.id);}
  function myTasks(){const list=LS.get(K_TASKS,[]);const res=LS.get(K_RES,[]);
    modal(`<p class="prompt">My tasks</p>${tabsHtml('tasks')}${list.length?`<div class="reftable"><table><tr><th>Task</th><th>Class</th><th>App</th><th>Qs</th><th>Results</th><th>Set</th><th></th></tr>${list.map(t=>`<tr><td><a href="#" data-open="${t.id}">${esc(t.ti)}</a></td><td>${esc(t.cl||'')}</td><td>${t.a==='theory'?'Theory':'Aural'}</td><td>${t.n}</td><td>${res.filter(r=>r.k===t.id).length}</td><td>${new Date(t.at).toLocaleDateString('en-AU',{day:'2-digit',month:'short'})}</td><td><button class="tkx" data-del="${t.id}" title="Remove from this list">✕</button></td></tr>`).join('')}</table></div>`:'<p class="sub">No tasks yet. Use <b>Set a task</b>.</p>'}`,true);wireTabs();
    document.querySelectorAll('[data-open]').forEach(a=>a.onclick=e=>{e.preventDefault();showTask(list.find(t=>t.id===a.dataset.open));});
    document.querySelectorAll('[data-del]').forEach(b=>b.onclick=()=>{if(!confirm('Remove this task from the list? Results already recorded stay.'))return;LS.set(K_TASKS,list.filter(t=>t.id!==b.dataset.del));myTasks();});}

  // ---------- results ----------
  function flagsFor(p,fp){const out=[];const known=LS.get(K_TASKS,[]).find(t=>t.id===p.k);
    if(!known)out.push(['info','task not set from this device']);else if(known.th!==p.th)out.push(['warn','task link was changed']);
    const secs=Math.max(1,p.fn-p.st);const per=secs/Math.max(1,p.n);const fast=p.a==='aural'?5:3;if(per<fast)out.push(['warn','very fast ('+Math.round(per)+' s a question)']);
    const qs=p.q.filter(x=>x[1]>0);const quick=qs.filter(x=>x[1]<(p.a==='aural'?2:1.5)&&x[0]===100).length;if(quick>=Math.max(3,p.n*0.4))out.push(['warn',quick+' answers in under 2 s']);
    if(p.ot&&p.ot.length)out.push(['warn','same device also opened this task as: '+p.ot.join(', ')]);
    if(p.u&&p.u.length)out.push(['warn','unfinished: '+p.u.length+' unanswered']);if(p.rl>3)out.push(['info','resumed '+p.rl+' times']);return out;}
  function findCodes(text){text=String(text||'').replace(/=\r?\n/g,'').replace(/=3D/g,'=');const out=[];
    (text.match(/\[\[\s*B1\.[\sA-Za-z0-9_-]{40,}?\]\]/g)||[]).forEach(m=>out.push(m.replace(/[\[\]\s]/g,'')));
    (text.match(/B1\.[A-Za-z0-9_-]{40,}/g)||[]).forEach(c=>{if(!out.some(o=>o.startsWith(c)||c.startsWith(o)))out.push(c);});return [...new Set(out)];}
  async function readFiles(files){let all='';for(const f of files){const buf=new Uint8Array(await f.arrayBuffer());all+='\n'+new TextDecoder('utf-8').decode(buf);
      // Outlook .msg files keep the body as UTF-16
      if(/\.msg$/i.test(f.name)||buf.length>1&&buf[1]===0){try{all+='\n'+new TextDecoder('utf-16le').decode(buf);}catch(e){}}}return all;}
  async function addCodes(text){const codes=findCodes(text);let added=0,dup=0,bad=0;const res=LS.get(K_RES,[]);const last=[];
    for(const c of codes){try{const {payload:p,fp}=await unseal(b64u.dec(c.slice(3)));if(res.some(r=>r.fp===fp)){dup++;last.push(res.find(r=>r.fp===fp));continue;}
        const w=i=>p.mk?(p.mk[i]||0):1;const got=p.q.reduce((a,x,i)=>a+x[0]/100*w(i),0);const r={fp,k:p.k,a:p.a,ti:p.ti,cl:p.cl,nm:p.nm,y:p.y,n:p.mk?p.mk.reduce((a,b)=>a+b,0):p.n,nq:p.n,mk:p.mk,tt:p.tt,got:Math.round(got*2)/2,st:p.st,fn:p.fn,q:p.q,u:p.u||[],s:p.s,flags:flagsFor(p,fp),at:Date.now()};res.push(r);last.push(r);added++;}
      catch(e){bad++;}}
    LS.set(K_RES,res);return {added,dup,bad,last,total:codes.length};}
  const fmtMin=s=>{s=Math.max(0,Math.round(s));return Math.floor(s/60)+':'+String(s%60).padStart(2,'0');};
  function results(taskId,note){const res=LS.get(K_RES,[]);const tasks=LS.get(K_TASKS,[]);
    const ids=[...new Set(res.map(r=>r.k))];const cur=taskId||ids[ids.length-1]||'';const rows=res.filter(r=>r.k===cur).sort((a,b)=>a.nm.localeCompare(b.nm));
    const tmeta=tasks.find(t=>t.id===cur)||rows[0]||{};
    modal(`<p class="prompt">Results</p>${tabsHtml('res')}${note?`<p class="sub"><b>${note}</b></p>`:''}
      <div class="setgrp"><div class="setlabel">Add results</div><textarea id="tkcodes" rows="3" class="tkin" placeholder="Paste result codes, or whole emails: one or many at once. Anything that isn't a result code is ignored."></textarea>
        <div class="tkdrop" id="tkdrop">Or drop result emails or files here <span>(.eml, .msg, .txt)</span> · <a href="#" id="tkpickf">choose files</a><input type="file" id="tkfiles" multiple accept=".eml,.msg,.txt,.htm,.html,.csv,text/*" style="display:none"></div>
        <div class="controls" style="margin-top:6px"><button class="btn-check" id="tkadd">Add results</button><button class="btn-ghost" id="tkhow">How to collect them from Outlook</button></div></div>
      ${ids.length?`<div class="setgrp"><div class="setlabel">Task</div><select id="tkpick" class="setsel">${ids.map(id=>{const t=tasks.find(x=>x.id===id)||res.find(r=>r.k===id);return `<option value="${id}"${id===cur?' selected':''}>${esc((t.ti||'Task')+(t.cl?' · '+t.cl:''))}</option>`;}).join('')}</select></div>`:''}
      ${rows.length?`<div class="reftable"><table><tr><th>Student</th><th>Mark</th><th>%</th><th>Time</th><th>Finished</th><th>Flags</th></tr>${rows.map(r=>`<tr><td><a href="#" data-det="${r.fp}">${esc(r.nm)}</a></td><td><b>${r.got} / ${r.n}</b></td><td>${Math.round(r.got/r.n*100)}%</td><td>${fmtMin(r.fn-r.st)}</td><td>${new Date(r.fn*1000).toLocaleString('en-AU',{day:'2-digit',month:'short',hour:'2-digit',minute:'2-digit'})}</td><td>${r.flags.filter(f=>f[0]==='warn').map(f=>`<span class="tkflag">${esc(f[1])}</span>`).join(' ')}</td></tr>`).join('')}</table></div>
        <p class="sub">${rows.length} student${rows.length===1?'':'s'} · class average ${Math.round(rows.reduce((a,r)=>a+r.got/r.n,0)/rows.length*100)}%</p>
        <div class="controls"><button class="btn-ghost" id="tkcsv">Export CSV</button><button class="btn-ghost" id="tkprint">Print</button><button class="btn-ans" id="tkclr">Delete these results</button></div>`:'<p class="sub">No results for this task yet.</p>'}`,true);wireTabs();
    const report=r=>results(r.last.length?r.last[r.last.length-1].k:cur,`${r.added} added${r.dup?' · '+r.dup+' already recorded':''}${r.bad?' · '+r.bad+' couldn\'t be opened (not sealed to this teacher key, or incomplete)':''}${!r.total?'no result codes found':''}`);
    document.getElementById('tkadd').onclick=async()=>report(await addCodes(document.getElementById('tkcodes').value));
    const fi=document.getElementById('tkfiles'),dz=document.getElementById('tkdrop');
    document.getElementById('tkpickf').onclick=e=>{e.preventDefault();fi.click();};fi.onchange=async()=>{if(fi.files.length)report(await addCodes(await readFiles(fi.files)));};
    dz.ondragover=e=>{e.preventDefault();dz.classList.add('on');};dz.ondragleave=()=>dz.classList.remove('on');
    dz.ondrop=async e=>{e.preventDefault();dz.classList.remove('on');const txt=e.dataTransfer.getData('text');if(e.dataTransfer.files.length)report(await addCodes(await readFiles(e.dataTransfer.files)+'\n'+txt));else if(txt)report(await addCodes(txt));};
    document.getElementById('tkhow').onclick=()=>{modal(`<p class="prompt">Collecting emailed results</p><p class="sub">Every result email has a subject starting <b>Blitz result</b>.</p>
      <ol class="sub" style="padding-left:20px"><li><b>Outlook on the web (one or a few):</b> open an email, press Ctrl+A then Ctrl+C in the message, and paste into Add results. You can paste several emails one after another before pressing Add results.</li>
      <li><b>Outlook desktop (a whole class):</b> search for <i>Blitz result</i>, select all the emails (Ctrl+A), then File → Save As → save as <b>Text Only</b>. Drop that one .txt file onto Add results.</li>
      <li><b>Or</b> select the emails in Outlook desktop and drag them straight onto the drop box.</li></ol>
      <p class="sub">Duplicates are counted once, so it doesn't matter if you add the same email twice.</p><div class="controls"><button class="btn-ghost" id="tkhowback">Back to results</button></div>`,true);document.getElementById('tkhowback').onclick=()=>results(cur);};
    const pk=document.getElementById('tkpick');if(pk)pk.onchange=()=>results(pk.value);
    document.querySelectorAll('[data-det]').forEach(a=>a.onclick=e=>{e.preventDefault();detail(res.find(r=>r.fp===a.dataset.det));});
    const cs=document.getElementById('tkcsv');if(cs)cs.onclick=()=>{const secNames=A.sectionNames();const head=['Student','Class','Task','Mark','Out of','Percent','Time (min)','Finished'].concat((rows[0].s||[]).map((s,si)=>{let o=s[1];if(rows[0].mk){let p=0;for(let k=0;k<si;k++)p+=rows[0].s[k][1];o=rows[0].mk.slice(p,p+s[1]).reduce((a,b)=>a+b,0);}return (secNames[s[0]]||s[0])+' (/'+o+')';}),['Flags']);
      const lines=rows.map(r=>{let p=0;const per=(r.s||[]).map(s=>{let g=0;for(let i=0;i<s[1];i++){g+=(r.q[p]||[0])[0]/100*(r.mk?(r.mk[p]||0):1);p++;}return Math.round(g*2)/2;});return [r.nm,r.cl,r.ti,r.got,r.n,Math.round(r.got/r.n*100),Math.round((r.fn-r.st)/60),new Date(r.fn*1000).toLocaleString('en-AU')].concat(per,[r.flags.map(f=>f[1]).join('; ')]);});
      const csv=[head].concat(lines).map(l=>l.map(v=>'"'+String(v).replace(/"/g,'""')+'"').join(',')).join('\r\n');const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([csv],{type:'text/csv'}));a.download=(tmeta.ti||'task').replace(/[^\w]+/g,'-')+(tmeta.cl?'-'+tmeta.cl:'')+'-results.csv';document.body.appendChild(a);a.click();setTimeout(()=>a.remove(),300);};
    const pr=document.getElementById('tkprint');if(pr)pr.onclick=()=>window.print();
    const cl=document.getElementById('tkclr');if(cl)cl.onclick=()=>{if(!confirm('Delete every recorded result for this task on this device?'))return;LS.set(K_RES,res.filter(r=>r.k!==cur));results();};}
  function detail(r){const secNames=A.sectionNames();let p=0;const secs=(r.s||[]).map(s=>{const qs=r.q.slice(p,p+s[1]);const mk=r.mk?r.mk.slice(p,p+s[1]):qs.map(()=>1);const un=qs.map((_,i)=>(r.u||[]).includes(p+i));p+=s[1];return {name:secNames[s[0]]||s[0],qs,mk,un};});
    modal(`<p class="prompt">${esc(r.nm)} — ${r.got} / ${r.n}</p><p class="sub">${esc(r.ti)}${r.cl?' · '+esc(r.cl):''} · Year ${r.y} · started ${new Date(r.st*1000).toLocaleString('en-AU',{day:'2-digit',month:'short',hour:'2-digit',minute:'2-digit'})} · ${fmtMin(r.fn-r.st)} taken</p>
      ${r.flags.length?`<p class="sub">${r.flags.map(f=>`<span class="tkflag ${f[0]}">${esc(f[1])}</span>`).join(' ')}</p>`:''}
      <div class="reftable"><table><tr><th>Section</th><th>Question marks</th><th>Total</th></tr>${secs.map(s=>`<tr><td>${esc(s.name)}</td><td>${s.qs.map((x,xi)=>s.un[xi]?`<span class="tkq skip" title="not answered">–${r.mk&&s.mk[xi]>1?'<sub>/'+s.mk[xi]+'</sub>':''}</span>`:`<span class="tkq ${x[0]===100?'ok':x[0]>0?'part':'no'}" title="${x[1]} s${r.a==='aural'?' · '+(x[2]/2)+' plays':''}">${x[0]===100?'✓':x[0]>0?(x[0]/100).toFixed(1).replace(/\.0$/,''):'✗'}${r.mk&&s.mk[xi]>1?'<sub>/'+s.mk[xi]+'</sub>':''}</span>`).join('')}</td><td>${Math.round(s.qs.reduce((a,x,i)=>a+x[0]/100*s.mk[i],0)*2)/2} / ${s.mk.reduce((a,b)=>a+b,0)}</td></tr>`).join('')}</table></div>
      <div class="controls"><button class="btn-ghost" id="tkbackres">Back to results</button></div>`,true);document.getElementById('tkbackres').onclick=()=>results(r.k);}
  async function verifyFromLink(code){if(!cryptoOK()){needCrypto();return;}
    if(!teacher()){modal('<p class="prompt">This is a student\'s result code</p><p class="sub">Only a device with the teacher key can open it. On your teacher device, open Teacher tools → Settings → <b>Add another device</b> and scan it with this one, then scan the student\'s code again.</p>');return;}
    TK.openTeacher(async()=>{const r=await addCodes(code);const it=r.last[r.last.length-1];if(!it){results(null,'That code couldn\'t be opened: it isn\'t sealed to this teacher key, or it was cut short.');return;}
      modal(`<div class="tkverified ${it.flags.some(f=>f[0]==='warn')?'warn':''}"><div class="qnum">${r.dup?'Already recorded':'Result recorded'}</div><p class="prompt">${esc(it.nm)}</p><p class="tkbig">${it.got} / ${it.n} <span>(${Math.round(it.got/it.n*100)}%)</span></p><p class="sub">${esc(it.ti)}${it.cl?' · '+esc(it.cl):''} · ${fmtMin(it.fn-it.st)} taken</p>${it.flags.filter(f=>f[0]==='warn').map(f=>`<span class="tkflag">${esc(f[1])}</span>`).join(' ')}</div>
        <div class="controls"><button class="btn-check" id="tkok">Done</button><button class="btn-ghost" id="tkall">All results for this task</button></div>`);
      document.getElementById('tkok').onclick=closeModal;document.getElementById('tkall').onclick=()=>results(it.k);});}

  // ---------- settings / devices ----------
  function settings(){const T=teacher();const addr=appAddr();
    modal(`<p class="prompt">Settings</p>${tabsHtml('set')}
      <div class="setgrp"><div class="setlabel">Add another device</div><p class="sub">Use this to set tasks and read results on another of your own devices. Scan this code with the other device, or copy the device code to it. The code carries your key encrypted with your PIN, so the other device also needs your PIN. Still keep it to yourself.</p><button class="btn-ghost" id="tkdev">Show the device code</button><div id="tkdevbox"></div></div>
      ${/^https?:/.test(location.protocol)?'':`<div class="setgrp"><div class="setlabel">This app's web address</div><p class="sub">This copy is opened from a file. To make links and QR codes, enter the GitHub Pages address of this app.</p><input id="tkaddr" class="tkin" value="${esc(addr)}" placeholder="https://…/index.html"><div class="controls" style="margin-top:6px"><button class="btn-ghost" id="tksaveaddr">Save</button></div></div>`}
      <div class="setgrp"><div class="setlabel">Change PIN</div>${pinFields('New PIN or passphrase (6+ characters)','Again')}<div class="controls" style="margin-top:6px"><button class="btn-ghost" id="tkchg">Change PIN</button><button class="btn-check" id="tklock">Lock teacher tools now</button></div></div>
      <p class="sub">Teacher key created ${new Date(T.at).toLocaleDateString('en-AU')}, stored encrypted with your PIN. Teacher tools lock after 10 minutes without use and when the app closes. Results and tasks are saved on this device only.</p>`,true);wireTabs();
    document.getElementById('tkdev').onclick=async()=>{const blob=b64u.enc(await packBytes(LS.get(K_TEACH,null)));const a=appAddr();const link=a?a+'#tkey='+blob:'';document.getElementById('tkdevbox').innerHTML=`<div class="tkqr">${qrSVG(link||blob,240)}</div>${link?'':'<p class="sub">No web address: copy the code below to the other device instead.</p>'}<div class="controls"><button class="btn-ghost" id="tkdevcopy">Copy device code</button></div>`;document.getElementById('tkdevcopy').onclick=()=>copy(link||blob,'Device code copied');};
    const sa=document.getElementById('tksaveaddr');if(sa)sa.onclick=()=>{LS.set(K_ADDR+':'+A.app,document.getElementById('tkaddr').value.trim());toast('Saved');};
    document.getElementById('tkchg').onclick=async()=>{const v=readNewPin();if(!v)return;await saveWrapped(v);toast('PIN changed');settings();};
    document.getElementById('tklock').onclick=()=>lockNow();}
  async function importKey(blob){let T;try{T=await unpackBytes(b64u.dec(blob));}catch(e){modal('<p class="prompt">That device code didn\'t open</p>');return;}
    if(!T||!T.pub||!(T.enc||T.priv)){modal('<p class="prompt">That isn\'t a device code</p>');return;}
    const cur=teacher();if(cur&&cur.pub===T.pub){modal('<p class="prompt">This device already has this teacher key</p>');return;}
    modal(`<p class="prompt">Add the teacher key to this device?</p><p class="sub">${cur?'<b>This device already has a different teacher key — it will be replaced.</b> ':''}After this, this device can open class-task results. You'll need the same PIN as your other device to open it.</p><div class="controls"><button class="btn-check" id="tkimp">Add teacher key</button><button class="btn-ghost" id="tkno">Cancel</button></div>`);
    document.getElementById('tkno').onclick=closeModal;document.getElementById('tkimp').onclick=()=>{LS.set(K_TEACH,T);lockNow(true);toast('Teacher key added');TK.openTeacher('res');};}

  // ---------- routing ----------
  TK.handleHash=function(){const h=location.hash||'';let m;
    if((m=h.match(/^#task=([A-Za-z0-9_-]+)/))){openTaskCode(m[1],true);return true;}
    if((m=h.match(/^#verify=(B1\.[A-Za-z0-9_-]+)/))){try{history.replaceState(null,'',location.pathname+location.search);}catch(e){}verifyFromLink(m[1]);return true;}
    if((m=h.match(/^#tkey=([A-Za-z0-9_-]+)/))){try{history.replaceState(null,'',location.pathname+location.search);}catch(e){}importKey(m[1]);return true;}
    if(h==='#teacher'){TK.openTeacher();return true;}return false;};
  addEventListener('hashchange',()=>{if(!TK.run||!/^#task=/.test(location.hash))TK.handleHash();});

  // ---------- styles ----------
  const css=`.tkbar{display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap;background:#2f6f6a;color:#fff;border-radius:6px;padding:8px 14px;margin:0 0 10px;font-size:13px}
  .tkbar b{font-family:var(--serif);font-size:18px}.tkleave{margin-left:8px;border:1px solid rgba(255,255,255,.6);background:transparent;color:#fff;border-radius:999px;padding:4px 10px;font-size:11.5px;font-weight:600;cursor:pointer}
  .tkqr{display:flex;justify-content:center;margin:10px 0}.tkqr svg{border:8px solid #fff;border-radius:6px;box-shadow:0 2px 10px rgba(0,0,0,.15)}
  .tkin{width:100%;padding:9px 12px;border:1px solid var(--rule);border-radius:6px;font-family:var(--sans);font-size:14px;background:#fff}
  .tkgrid{display:grid;grid-template-columns:2fr 1fr 1fr;gap:10px}@media(max-width:640px){.tkgrid{grid-template-columns:1fr}}
  .tktabs{display:flex;gap:4px;flex-wrap:wrap;margin:4px 0 10px}.tktabs button{border:1px solid var(--rule);background:#fff;border-radius:999px;padding:6px 13px;font-size:12.5px;font-weight:600;cursor:pointer;font-family:var(--sans)}.tktabs button.on{background:var(--ink);color:var(--cream);border-color:var(--ink)}
  .tksecs{display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:6px;margin:6px 0 10px}
  .tksec{display:flex;align-items:center;gap:6px;border:1px solid var(--rule);border-radius:6px;padding:6px 8px;background:#fff;font-size:13px}.tksec.on{border-color:var(--ink);box-shadow:inset 3px 0 0 var(--brass)}
  .tksec .nm{flex:1}.tksec select{font-size:11.5px;padding:3px;border:1px solid var(--rule);border-radius:4px;background:#fff}
  .tkn{display:inline-flex;align-items:center;gap:6px}.tkn button{width:26px;height:26px;border:1px solid var(--rule);background:var(--paper2);border-radius:50%;cursor:pointer;font-size:15px;line-height:1}.tkn b{min-width:18px;text-align:center;font-family:var(--serif);font-size:18px}
  .tkflag{display:inline-block;background:#f6e1df;color:#7d2a23;border:1px solid #e3b7b2;border-radius:999px;padding:1px 8px;font-size:11.5px;font-weight:600;margin:2px 2px 0 0}.tkflag.info{background:var(--shade);color:#4d463c;border-color:var(--rule)}
  .tkq{display:inline-block;min-width:22px;text-align:center;border-radius:4px;margin:1px;padding:1px 3px;font-size:12px;font-weight:700}.tkq.ok{background:#e4efe5;color:#2f5a35}.tkq.no{background:#f6e1df;color:#7d2a23}.tkq.part{background:#f4ead2;color:#7a5a17}.tkq.skip{background:#eee;color:#777}
  .tkx{border:0;background:transparent;cursor:pointer;color:var(--muted)}
  .tkfull{position:fixed;inset:0;background:#fff;z-index:200;display:flex;align-items:center;justify-content:center;text-align:center;cursor:pointer}.tkfull p{font-family:var(--sans);font-size:22px;font-weight:600;color:#111}
  .tkverified{text-align:center;border:3px solid #5d8a63;border-radius:8px;padding:14px}.tkverified.warn{border-color:#b4433a}.tkbig{font-family:var(--serif);font-size:44px;font-weight:600;margin:4px 0}.tkbig span{font-size:20px;color:var(--muted)}
  .tkdone{text-align:center}.tkdrop{margin-top:6px;border:1.5px dashed var(--rule);border-radius:6px;padding:12px;text-align:center;font-size:13px;color:#4d463c;background:#fff}.tkdrop span{color:var(--muted)}.tkdrop.on{border-color:var(--ink);background:var(--paper2)}.tkcodebox{font-family:ui-monospace,Menlo,Consolas,monospace;font-size:11.5px;word-break:break-all;resize:none;background:#fbf8f2}.tkdone .controls{justify-content:center}
  .taskbtn{background:transparent;border:1px solid rgba(239,233,220,.3);color:#cfc8ba;border-radius:999px;font-size:12px;font-weight:600;padding:6px 12px;cursor:pointer;font-family:var(--sans)}.taskbtn:hover{border-color:var(--cream);color:var(--cream)}
  body.tasking #examnew,body.tasking .tstteach,body.tasking .tstcover .codebox,body.tasking #examagain,body.tasking .topbar .modebar,body.tasking #yearbar,body.tasking #gear,body.tasking .tabs,body.tasking .btn-ans,body.tasking #gearbtn,body.tasking .sprintbtn,body.tasking .h2hbtn,body.tasking .newset,body.tasking .difftog,body.tasking .modetoggle,body.tasking #reset,body.tasking .taskbtn,body.tasking #avbtn{display:none!important}
  body.tasking #nameinput{pointer-events:none;opacity:.8}
  body.tasking.nohints #howbtn{display:none!important}
  @media print{.tkbar,.tktabs,#tkcodes,.controls{display:none!important}.guide#tkmodal{position:static;transform:none;box-shadow:none;width:auto;max-height:none}}`;
  const st=document.createElement('style');st.textContent=css;document.head.appendChild(st);

  TK.init=function(adapter){A=adapter;};
  window.TaskKit=TK;
})();
