/*blitz-stamp*/(window.BLITZ_FILES=window.BLITZ_FILES||{})["blitzui.js"]="20261030e";
// blitzui.js — the "Blitz" look shared by Aural Blitz and Theory Blitz (identical copy in both apps).
// 1) a clean, rounded, app-icon home screen (tap an icon to open the exercise) with a bottom tab bar;
// 2) a much richer avatar builder (face, hair, eyes, brows, mouth, extras, glasses, headwear, clothes, background, instrument).
// The app supplies data and actions through BlitzUI.init({...}); exam and test pages keep their printed-booklet look.
(function(){
  const UI={};
  const esc=s=>(''+s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  // ================= AVATAR =================
  const SKIN=['#ffe3c8','#f6d5b8','#f1c27d','#e8b894','#d6a77a','#c68642','#a86b3c','#8d5524','#6b4423','#4a2c17'];
  const HAIRC=['#1b1a18','#3b2416','#5a3a22','#8b5a2b','#a0522d','#c98b3c','#e5c07b','#f2e3b3','#9e9e9e','#e74c3c','#2e86c1','#8e44ad','#16a085','#ff6fb5'];
  const EYEC=['#1b1a18','#5b3a1e','#2e86c1','#27ae60','#7f8c8d','#8e44ad'];
  const TOPC=['#1cb0f6','#58cc02','#ff4b4b','#ffc800','#ce82ff','#ff9600','#2b2d42','#ffffff','#8c2b22','#b2862f','#16a085','#ff6fb5'];
  const BGC=['#c0392b','#d4a017','#2e86c1','#27ae60','#8e44ad','#16a085','#e67e22','#1b1a18','#1cb0f6','#58cc02','#ff6fb5','#ffc800','#e5e7eb','#2b2d42'];
  const OPT={
    face:[['oval','Oval'],['round','Round'],['square','Square'],['heart','Heart']],
    hair:[['short','Short'],['buzz','Buzz cut'],['side','Side part'],['quiff','Quiff'],['spiky','Spiky'],['curlyshort','Short curls'],['afro','Afro'],['curtains','Curtains'],
      ['long','Long'],['wavy','Long waves'],['bob','Bob'],['ponytail','Ponytail'],['bun','Top bun'],['spacebuns','Space buns'],['braids','Braids'],['mohawk','Mohawk'],['none','Bald']],
    brows:[['natural','Natural'],['thick','Thick'],['arched','Arched'],['raised','Raised'],['focused','Focused'],['none','None']],
    eyes:[['round','Round'],['happy','Happy'],['wide','Wide'],['wink','Wink'],['sleepy','Sleepy'],['lashes','Lashes'],['stars','Stars'],['hearts','Hearts']],
    mouth:[['smile','Smile'],['grin','Grin'],['laugh','Laugh'],['neutral','Neutral'],['smirk','Smirk'],['whistle','Whistle'],['tongue','Cheeky'],['wow','Wow']],
    cheeks:[['none','None'],['blush','Blush'],['freckles','Freckles'],['both','Blush + freckles']],
    fhair:[['none','None'],['stubble','Stubble'],['moustache','Moustache'],['goatee','Goatee'],['beard','Beard']],
    ears:[['none','None'],['studs','Studs'],['hoops','Hoops']],
    glasses:[['none','None'],['round','Round'],['square','Square'],['cateye','Cat-eye'],['sunglasses','Sunglasses'],['star','Star shades']],
    hat:[['none','None'],['cap','Cap'],['capback','Backwards cap'],['beret','Beret'],['headband','Headband'],['flower','Flower'],['beanie','Beanie'],['headphones','Headphones'],['bow','Bow'],['crown','Crown']],
    top:[['tee','T-shirt'],['hoodie','Hoodie'],['shirt','Collared shirt'],['vneck','Jumper'],['jacket','Jacket'],['band','Band tee'],['tux','Concert black']],
    bgp:[['plain','Plain'],['glow','Glow'],['notes','Notes'],['stripes','Stripes'],['stage','Stage lights']],
    badge:['','🎷','🎺','🎸','🎹','🎻','🥁','🎤','🎼','🎧']};
  const DEF={v:2,skin:1,face:'oval',hair:'short',hairc:0,brows:'natural',eyes:'round',eyec:0,mouth:'smile',cheeks:'none',fhair:'none',ears:'none',glasses:'none',hat:'none',top:'tee',topc:0,bg:2,bgp:'plain',badge:0};
  // legacy avatar {skin,hair,hairc,eyes,mouth,acc,bg,badge} (indices) → v2
  function norm(a){a=a||{};if(a.v===2)return Object.assign({},DEF,a);const o=Object.assign({},DEF);
    if(typeof a.skin==='number')o.skin=[1,3,5,7,8,0][a.skin]!==undefined?[1,3,5,7,8,0][a.skin]:1;
    const H=['short','long','curlyshort','bun','mohawk','none'];if(typeof a.hair==='number')o.hair=H[a.hair]||'short';
    const HC=[0,2,4,5,9,10,11,7];if(typeof a.hairc==='number')o.hairc=HC[a.hairc]!==undefined?HC[a.hairc]:0;
    const E=['round','happy','round','wink'];if(typeof a.eyes==='number'){o.eyes=E[a.eyes]||'round';if(a.eyes===2)o.glasses='sunglasses';}
    const M=['smile','grin','neutral','whistle'];if(typeof a.mouth==='number')o.mouth=M[a.mouth]||'smile';
    const A=['none','headphones','glasses','beanie','bow','crown'];const acc=A[a.acc]||'none';if(acc==='glasses')o.glasses='round';else if(acc!=='none')o.hat=acc;
    if(typeof a.bg==='number')o.bg=a.bg;if(typeof a.badge==='number')o.badge=a.badge;return o;}
  function legacy(o){ // best-effort old format so an older copy of the apps still draws something
    const H=['short','long','curlyshort','bun','mohawk','none'];const A=['none','headphones','glasses','beanie','bow','crown'];
    return {skin:Math.min(5,[5,0,1,1,2,2,3,3,4,4][o.skin]||0),hair:Math.max(0,H.indexOf(o.hair)),hairc:0,eyes:['round','happy','x','wink'].indexOf(o.eyes)<0?0:['round','happy','x','wink'].indexOf(o.eyes),
      mouth:Math.max(0,['smile','grin','neutral','whistle'].indexOf(o.mouth)),acc:o.hat!=='none'&&A.includes(o.hat)?A.indexOf(o.hat):o.glasses!=='none'?2:0,bg:o.bg<8?o.bg:2,badge:o.badge};}
  const K='blitzAvatar';
  const nk=n=>(n||'').trim().toLowerCase().replace(/\s+/g,' ');UI.nameKey=nk;
  const avMap=()=>{try{return JSON.parse(localStorage.getItem('blitzAvatars')||'{}')||{};}catch(e){return {};}};
  UI.loadAvatar=function(name){let a=null;const m=avMap();if(name&&m[nk(name)])return norm(m[nk(name)]);try{a=JSON.parse(localStorage.getItem(K+'2')||'null')||JSON.parse(localStorage.getItem(K)||'null');}catch(e){}return norm(a);};
  UI.saveAvatar=function(o,name){try{if(name){const m=avMap();m[nk(name)]=o;localStorage.setItem('blitzAvatars',JSON.stringify(m));}localStorage.setItem(K+'2',JSON.stringify(o));localStorage.setItem(K,JSON.stringify(Object.assign(legacy(o),{v2:1})));}catch(e){}};
  const dk=(hex,f)=>{const n=parseInt(hex.slice(1),16);let r=n>>16,g=(n>>8)&255,b=n&255;r=Math.round(r*f);g=Math.round(g*f);b=Math.round(b*f);return '#'+((1<<24)+(Math.min(255,r)<<16)+(Math.min(255,g)<<8)+Math.min(255,b)).toString(16).slice(1);};
  function svg(a,size,opt){a=norm(a);opt=opt||{};const sk=SKIN[a.skin]||SKIN[1],skd=dk(sk,0.86),hc=HAIRC[a.hairc]||HAIRC[0],hcd=dk(hc,0.8),ec=EYEC[a.eyec]||EYEC[0],tc=TOPC[a.topc]||TOPC[0],bg=BGC[a.bg]!==undefined?BGC[a.bg]:BGC[2];
    const id='a'+Math.random().toString(36).slice(2,8);let s=`<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg"${size?` width="${size}" height="${size}"`:''}>`;
    // background
    s+=`<defs><radialGradient id="${id}g" cx="50%" cy="38%" r="70%"><stop offset="0" stop-color="${dk(bg,1.35)}"/><stop offset="1" stop-color="${bg}"/></radialGradient><clipPath id="${id}c"><rect width="120" height="120" rx="${opt.square?0:26}"/></clipPath></defs><g clip-path="url(#${id}c)">`;
    s+=`<rect width="120" height="120" fill="${a.bgp==='glow'?`url(#${id}g)`:bg}"/>`;
    if(a.bgp==='stripes')for(let i=-120;i<240;i+=22)s+=`<path d="M${i} 0 L${i+60} 120 L${i+71} 120 L${i+11} 0Z" fill="#fff" opacity=".12"/>`;
    if(a.bgp==='notes')[['♪',14,26,18],['♫',92,22,20],['♩',100,74,16],['♬',12,82,18],['♪',58,12,12]].forEach(n=>s+=`<text x="${n[1]}" y="${n[2]}" font-size="${n[3]}" fill="#fff" opacity=".35" font-family="Georgia,serif">${n[0]}</text>`);
    if(a.bgp==='stage'){s+=`<path d="M10 0 L44 120 L0 120 L0 0Z" fill="#fff" opacity=".13"/><path d="M110 0 L76 120 L120 120 L120 0Z" fill="#fff" opacity=".13"/><ellipse cx="60" cy="118" rx="58" ry="12" fill="#000" opacity=".18"/>`;}
    // hair (back layer)
    const back={long:`<path d="M32 58 C30 30 44 22 60 22 C76 22 90 30 88 58 L92 104 L28 104 Z" fill="${hc}"/>`,
      wavy:`<path d="M32 58 C30 30 44 22 60 22 C76 22 90 30 88 58 C94 70 86 78 92 88 C96 96 88 104 84 106 L36 106 C32 104 24 96 28 88 C34 78 26 70 32 58Z" fill="${hc}"/>`,
      bob:`<path d="M32 60 C30 30 44 22 60 22 C76 22 90 30 88 60 L90 84 C80 88 40 88 30 84 Z" fill="${hc}"/>`,
      afro:`<circle cx="60" cy="50" r="34" fill="${hc}"/><circle cx="34" cy="62" r="14" fill="${hc}"/><circle cx="86" cy="62" r="14" fill="${hc}"/>`,
      ponytail:`<path d="M84 44 C100 46 104 66 96 86 C94 92 88 92 88 86 C92 72 92 58 82 52Z" fill="${hc}"/>`,
      braids:`<rect x="27" y="52" width="10" height="50" rx="5" fill="${hc}"/><rect x="83" y="52" width="10" height="50" rx="5" fill="${hc}"/>`+[60,70,80,90].map(y=>`<path d="M27 ${y} H37 M83 ${y} H93" stroke="${hcd}" stroke-width="1.6"/>`).join('')}[a.hair]||'';
    s+=back;
    // body and clothes
    const shoulders='M14 124 C14 100 34 90 60 90 C86 90 106 100 106 124 Z';
    s+=`<rect x="51" y="78" width="18" height="16" fill="${skd}"/>`;
    if(a.top==='hoodie')s+=`<path d="M34 96 C38 84 82 84 86 96 L80 100 C72 92 48 92 40 100Z" fill="${dk(tc,0.82)}"/>`;
    s+=`<path d="${shoulders}" fill="${a.top==='tux'?'#1b1a18':tc}"/>`;
    if(a.top==='tee'||a.top==='band')s+=`<path d="M48 90 C52 98 68 98 72 90" fill="${skd}" stroke="${dk(tc,0.8)}" stroke-width="2"/>`;
    if(a.top==='band')s+=`<text x="60" y="114" text-anchor="middle" font-size="12" font-weight="800" fill="#fff" font-family="Arial,sans-serif">♪♪♪</text>`;
    if(a.top==='hoodie')s+=`<path d="M50 90 C54 100 66 100 70 90" fill="${skd}"/><path d="M54 98 L53 112 M66 98 L67 112" stroke="#fff" stroke-width="2" stroke-linecap="round"/><path d="M44 112 Q60 118 76 112" stroke="${dk(tc,0.75)}" stroke-width="2" fill="none"/>`;
    if(a.top==='shirt')s+=`<path d="M50 89 L60 104 L70 89 L76 96 L66 108 L60 102 L54 108 L44 96Z" fill="#fff"/><path d="M60 104 V124" stroke="${dk(tc,0.7)}" stroke-width="1.6"/><circle cx="60" cy="112" r="1.4" fill="${dk(tc,0.6)}"/><circle cx="60" cy="119" r="1.4" fill="${dk(tc,0.6)}"/>`;
    if(a.top==='vneck')s+=`<path d="M48 90 L60 108 L72 90" fill="${skd}" stroke="${dk(tc,0.75)}" stroke-width="3" stroke-linejoin="round"/>`;
    if(a.top==='jacket')s+=`<path d="M50 90 L60 108 L70 90 Z" fill="#fff"/><path d="M46 92 L60 116 L52 124 L36 124 C38 108 40 98 46 92Z M74 92 L60 116 L68 124 L84 124 C82 108 80 98 74 92Z" fill="${dk(tc,0.7)}"/>`;
    if(a.top==='tux')s+=`<path d="M50 90 L60 110 L70 90 Z" fill="#fff"/><path d="M54 94 L60 98 L66 94 L66 100 L60 98 L54 100Z" fill="#1b1a18"/><path d="M48 92 L60 112 L56 124 L40 124 C42 108 44 98 48 92Z M72 92 L60 112 L64 124 L80 124 C78 108 76 98 72 92Z" fill="#2b2b2b"/>`;
    // head
    const face={oval:`<ellipse cx="60" cy="58" rx="24" ry="28" fill="${sk}"/>`,round:`<circle cx="60" cy="60" r="26" fill="${sk}"/>`,
      square:`<path d="M36 46 C36 34 46 30 60 30 C74 30 84 34 84 46 L84 68 C84 80 74 86 60 86 C46 86 36 80 36 68Z" fill="${sk}"/>`,
      heart:`<path d="M35 52 C35 36 46 30 60 30 C74 30 85 36 85 52 C85 70 72 86 60 87 C48 86 35 70 35 52Z" fill="${sk}"/>`}[a.face]||'';
    s+=`<circle cx="35" cy="61" r="5.5" fill="${sk}"/><circle cx="85" cy="61" r="5.5" fill="${sk}"/><circle cx="35" cy="61" r="2.6" fill="${skd}"/><circle cx="85" cy="61" r="2.6" fill="${skd}"/>`+face;
    if(a.ears==='studs')s+=`<circle cx="34" cy="67" r="2" fill="#ffd54f"/><circle cx="86" cy="67" r="2" fill="#ffd54f"/>`;
    if(a.ears==='hoops')s+=`<circle cx="34" cy="70" r="3.6" fill="none" stroke="#ffd54f" stroke-width="1.6"/><circle cx="86" cy="70" r="3.6" fill="none" stroke="#ffd54f" stroke-width="1.6"/>`;
    // cheeks
    if(a.cheeks==='blush'||a.cheeks==='both')s+=`<ellipse cx="44" cy="70" rx="5" ry="3" fill="#ff6f91" opacity=".35"/><ellipse cx="76" cy="70" rx="5" ry="3" fill="#ff6f91" opacity=".35"/>`;
    if(a.cheeks==='freckles'||a.cheeks==='both')[[42,67],[46,69],[44,72],[74,67],[78,69],[76,72]].forEach(p=>s+=`<circle cx="${p[0]}" cy="${p[1]}" r="0.9" fill="${dk(sk,0.62)}"/>`);
    // eyes
    const E=a.eyes,L=50,R=70,Y=60;
    if(E==='round')s+=`<circle cx="${L}" cy="${Y}" r="3.6" fill="${ec}"/><circle cx="${R}" cy="${Y}" r="3.6" fill="${ec}"/><circle cx="${L+1.2}" cy="${Y-1.2}" r="1.1" fill="#fff"/><circle cx="${R+1.2}" cy="${Y-1.2}" r="1.1" fill="#fff"/>`;
    if(E==='wide')s+=`<ellipse cx="${L}" cy="${Y}" rx="5" ry="5.6" fill="#fff" stroke="#1b1a18" stroke-width="1"/><ellipse cx="${R}" cy="${Y}" rx="5" ry="5.6" fill="#fff" stroke="#1b1a18" stroke-width="1"/><circle cx="${L}" cy="${Y+0.6}" r="3" fill="${ec}"/><circle cx="${R}" cy="${Y+0.6}" r="3" fill="${ec}"/><circle cx="${L+1}" cy="${Y-0.6}" r="1" fill="#fff"/><circle cx="${R+1}" cy="${Y-0.6}" r="1" fill="#fff"/>`;
    if(E==='happy')s+=`<path d="M${L-5} ${Y+1} Q${L} ${Y-5} ${L+5} ${Y+1}" stroke="#1b1a18" stroke-width="2.6" fill="none" stroke-linecap="round"/><path d="M${R-5} ${Y+1} Q${R} ${Y-5} ${R+5} ${Y+1}" stroke="#1b1a18" stroke-width="2.6" fill="none" stroke-linecap="round"/>`;
    if(E==='wink')s+=`<circle cx="${L}" cy="${Y}" r="3.6" fill="${ec}"/><circle cx="${L+1.2}" cy="${Y-1.2}" r="1.1" fill="#fff"/><path d="M${R-5} ${Y} Q${R} ${Y+3} ${R+5} ${Y}" stroke="#1b1a18" stroke-width="2.6" fill="none" stroke-linecap="round"/>`;
    if(E==='sleepy')s+=`<path d="M${L-5} ${Y} Q${L} ${Y+4} ${L+5} ${Y}" stroke="#1b1a18" stroke-width="2.6" fill="none" stroke-linecap="round"/><path d="M${R-5} ${Y} Q${R} ${Y+4} ${R+5} ${Y}" stroke="#1b1a18" stroke-width="2.6" fill="none" stroke-linecap="round"/>`;
    if(E==='lashes')s+=`<circle cx="${L}" cy="${Y}" r="3.6" fill="${ec}"/><circle cx="${R}" cy="${Y}" r="3.6" fill="${ec}"/><circle cx="${L+1.2}" cy="${Y-1.2}" r="1.1" fill="#fff"/><circle cx="${R+1.2}" cy="${Y-1.2}" r="1.1" fill="#fff"/><path d="M${L-5} ${Y-3} L${L-7} ${Y-5} M${L-3} ${Y-4.5} L${L-4} ${Y-7} M${R+5} ${Y-3} L${R+7} ${Y-5} M${R+3} ${Y-4.5} L${R+4} ${Y-7}" stroke="#1b1a18" stroke-width="1.4" stroke-linecap="round"/>`;
    const star=(cx,cy,r,f)=>{let p='';for(let i=0;i<10;i++){const rr=i%2?r*0.45:r,an=-Math.PI/2+i*Math.PI/5;p+=(i?'L':'M')+(cx+rr*Math.cos(an)).toFixed(1)+' '+(cy+rr*Math.sin(an)).toFixed(1);}return `<path d="${p}Z" fill="${f}"/>`;};
    if(E==='stars')s+=star(L,Y,5,'#ffc800')+star(R,Y,5,'#ffc800');
    const heart=(cx,cy,f)=>`<path d="M${cx} ${cy+4} C${cx-7} ${cy-1} ${cx-4} ${cy-6} ${cx} ${cy-2} C${cx+4} ${cy-6} ${cx+7} ${cy-1} ${cx} ${cy+4}Z" fill="${f}"/>`;
    if(E==='hearts')s+=heart(L,Y,'#ff4b4b')+heart(R,Y,'#ff4b4b');
    // brows
    const B=a.brows,bc=a.hair==='none'?dk(sk,0.55):hcd,by=Y-8;
    if(B==='natural')s+=`<path d="M${L-5} ${by} Q${L} ${by-2.5} ${L+5} ${by}" stroke="${bc}" stroke-width="2.2" fill="none" stroke-linecap="round"/><path d="M${R-5} ${by} Q${R} ${by-2.5} ${R+5} ${by}" stroke="${bc}" stroke-width="2.2" fill="none" stroke-linecap="round"/>`;
    if(B==='thick')s+=`<path d="M${L-6} ${by+0.5} Q${L} ${by-3} ${L+6} ${by}" stroke="${bc}" stroke-width="3.8" fill="none" stroke-linecap="round"/><path d="M${R-6} ${by} Q${R} ${by-3} ${R+6} ${by+0.5}" stroke="${bc}" stroke-width="3.8" fill="none" stroke-linecap="round"/>`;
    if(B==='arched')s+=`<path d="M${L-6} ${by+1} Q${L-1} ${by-5} ${L+5} ${by}" stroke="${bc}" stroke-width="2" fill="none" stroke-linecap="round"/><path d="M${R-5} ${by} Q${R+1} ${by-5} ${R+6} ${by+1}" stroke="${bc}" stroke-width="2" fill="none" stroke-linecap="round"/>`;
    if(B==='raised')s+=`<path d="M${L-5} ${by-1} Q${L} ${by-5} ${L+5} ${by-2}" stroke="${bc}" stroke-width="2.2" fill="none" stroke-linecap="round"/><path d="M${R-5} ${by+1} L${R+5} ${by+1}" stroke="${bc}" stroke-width="2.2" stroke-linecap="round"/>`;
    if(B==='focused')s+=`<path d="M${L-5} ${by-2} L${L+5} ${by+1}" stroke="${bc}" stroke-width="2.6" stroke-linecap="round"/><path d="M${R-5} ${by+1} L${R+5} ${by-2}" stroke="${bc}" stroke-width="2.6" stroke-linecap="round"/>`;
    // nose
    s+=`<path d="M60 63 Q58 68 61 69" stroke="${dk(sk,0.7)}" stroke-width="1.6" fill="none" stroke-linecap="round"/>`;
    // mouth
    const M=a.mouth,my=76,lip='#b03a3a';
    if(M==='smile')s+=`<path d="M52 ${my-1} Q60 ${my+6} 68 ${my-1}" stroke="${lip}" stroke-width="2.6" fill="none" stroke-linecap="round"/>`;
    if(M==='grin')s+=`<path d="M50 ${my-2} Q60 ${my+10} 70 ${my-2} Z" fill="${lip}"/><path d="M52.5 ${my-1} Q60 ${my+3} 67.5 ${my-1} Z" fill="#fff"/>`;
    if(M==='laugh')s+=`<path d="M50 ${my-3} Q60 ${my+13} 70 ${my-3} Z" fill="#7a1f1f"/><path d="M53 ${my+4} Q60 ${my+9} 67 ${my+4} Q60 ${my+2} 53 ${my+4}Z" fill="#ff7b7b"/><path d="M51.5 ${my-2.5} L68.5 ${my-2.5}" stroke="#fff" stroke-width="2"/>`;
    if(M==='neutral')s+=`<path d="M53 ${my+1} L67 ${my+1}" stroke="${lip}" stroke-width="2.6" stroke-linecap="round"/>`;
    if(M==='smirk')s+=`<path d="M52 ${my+1} Q62 ${my+3} 69 ${my-3}" stroke="${lip}" stroke-width="2.6" fill="none" stroke-linecap="round"/>`;
    if(M==='whistle')s+=`<circle cx="60" cy="${my+1}" r="3.2" fill="${lip}"/><text x="72" y="${my-3}" font-size="11" fill="#1b1a18" font-family="Georgia,serif">♪</text>`;
    if(M==='tongue')s+=`<path d="M52 ${my-1} Q60 ${my+6} 68 ${my-1}" stroke="${lip}" stroke-width="2.6" fill="none" stroke-linecap="round"/><path d="M57 ${my+2} Q57 ${my+9} 61 ${my+9} Q65 ${my+9} 64 ${my+2}Z" fill="#ff7b9c"/>`;
    if(M==='wow')s+=`<ellipse cx="60" cy="${my+1}" rx="4" ry="5" fill="#7a1f1f"/>`;
    // facial hair
    const F=a.fhair,fc=a.hair==='none'?HAIRC[a.hairc]||'#3b2416':hc;
    if(F==='stubble')for(let i=0;i<26;i++){const x=46+((i*37)%28),y=76+((i*13)%10);s+=`<circle cx="${x}" cy="${y}" r="0.6" fill="${fc}" opacity=".55"/>`;}
    if(F==='moustache')s+=`<path d="M50 ${my-3} C54 ${my-8} 58 ${my-6} 60 ${my-4} C62 ${my-6} 66 ${my-8} 70 ${my-3} C66 ${my-4} 62 ${my-3} 60 ${my-2} C58 ${my-3} 54 ${my-4} 50 ${my-3}Z" fill="${fc}"/>`;
    if(F==='goatee')s+=`<path d="M54 ${my+5} Q60 ${my+12} 66 ${my+5} Q60 ${my+8} 54 ${my+5}Z" fill="${fc}"/><path d="M52 ${my-3} Q60 ${my-7} 68 ${my-3}" stroke="${fc}" stroke-width="2.6" fill="none"/>`;
    if(F==='beard')s+=`<path d="M36 62 C36 80 46 90 60 90 C74 90 84 80 84 62 C80 72 74 74 70 72 C66 ${my+6} 54 ${my+6} 50 72 C46 74 40 72 36 62Z" fill="${fc}"/><path d="M50 ${my-3} C54 ${my-7} 66 ${my-7} 70 ${my-3}" stroke="${fc}" stroke-width="3" fill="none"/>`;
    // hair (front layer)
    const capTop=`M35 56 C33 34 44 26 60 26 C76 26 87 34 85 56 C80 44 72 38 60 38 C48 38 40 44 35 56Z`;
    const front={short:`<path d="${capTop}" fill="${hc}"/>`,buzz:`<path d="M37 50 C38 34 47 29 60 29 C73 29 82 34 83 50 C78 42 70 39 60 39 C50 39 42 42 37 50Z" fill="${hc}" opacity=".9"/>`,
      side:`<path d="M34 58 C31 33 44 25 61 25 C79 25 89 37 86 58 C83 46 78 41 70 37 C60 42 46 44 34 58Z" fill="${hc}"/><path d="M68 28 C66 32 66 35 69 38" stroke="${hcd}" stroke-width="1.4" fill="none"/>`,
      quiff:`<path d="${capTop}" fill="${hc}"/><path d="M42 34 C44 18 66 14 76 24 C70 22 62 24 58 32Z" fill="${hc}"/>`,
      spiky:`<path d="M35 54 L37 34 L43 40 L45 24 L52 34 L57 20 L62 32 L69 22 L71 36 L79 28 L78 42 L85 40 L85 54 C80 44 72 38 60 38 C48 38 40 44 35 54Z" fill="${hc}"/>`,
      curlyshort:[[38,40,8],[46,32,8],[56,28,8],[66,29,8],[75,34,8],[82,43,7],[60,36,7],[44,42,6],[76,42,6]].map(c=>`<circle cx="${c[0]}" cy="${c[1]}" r="${c[2]}" fill="${hc}"/>`).join(''),
      afro:[[40,36,9],[50,30,9],[60,28,9],[70,30,9],[80,36,9]].map(c=>`<circle cx="${c[0]}" cy="${c[1]}" r="${c[2]}" fill="${hc}"/>`).join(''),
      curtains:`<path d="M35 58 C32 32 44 25 60 25 C76 25 88 32 85 58 C82 44 72 36 62 36 C66 42 70 48 70 52 C64 44 60 40 59 36 C50 38 40 46 35 58Z" fill="${hc}"/>`,
      long:`<path d="M34 60 C32 32 44 25 60 25 C76 25 88 32 86 60 C82 44 72 36 60 36 C48 36 38 44 34 60Z" fill="${hc}"/>`,
      wavy:`<path d="M34 60 C32 32 44 25 60 25 C76 25 88 32 86 60 C80 50 76 40 64 37 C56 44 44 46 34 60Z" fill="${hc}"/>`,
      bob:`<path d="M34 58 C32 32 44 25 60 25 C76 25 88 32 86 58 L86 46 C80 42 72 41 60 41 C48 41 40 42 34 46Z" fill="${hc}"/>`,
      ponytail:`<path d="${capTop}" fill="${hc}"/><circle cx="84" cy="44" r="3.5" fill="${dk(tc,1)}"/>`,
      bun:`<path d="${capTop}" fill="${hc}"/><circle cx="60" cy="22" r="10" fill="${hc}"/><path d="M52 27 Q60 31 68 27" stroke="${hcd}" stroke-width="1.6" fill="none"/>`,
      spacebuns:`<path d="${capTop}" fill="${hc}"/><circle cx="40" cy="28" r="9" fill="${hc}"/><circle cx="80" cy="28" r="9" fill="${hc}"/>`,
      braids:`<path d="${capTop}" fill="${hc}"/><path d="M60 26 L60 38" stroke="${hcd}" stroke-width="1.4"/>`,
      mohawk:`<path d="M52 40 C50 26 54 14 60 8 C66 14 70 26 68 40 C64 37 56 37 52 40Z" fill="${hc}"/><path d="M38 50 C40 44 44 42 48 41 M82 50 C80 44 76 42 72 41" stroke="${hc}" stroke-width="2" opacity=".6"/>`,none:''}[a.hair]||'';
    if(!(a.hat==='beanie'||a.hat==='cap'||a.hat==='capback'||a.hat==='beret')||['long','wavy','bob','braids','ponytail','afro','curtains'].includes(a.hair))s+=front;
    // glasses
    const G=a.glasses,gy=Y;
    if(G==='round')s+=`<circle cx="${L}" cy="${gy}" r="7.2" stroke="#1b1a18" stroke-width="2" fill="rgba(255,255,255,.15)"/><circle cx="${R}" cy="${gy}" r="7.2" stroke="#1b1a18" stroke-width="2" fill="rgba(255,255,255,.15)"/><path d="M${L+7} ${gy} L${R-7} ${gy} M${L-7} ${gy} L36 ${gy-2} M${R+7} ${gy} L84 ${gy-2}" stroke="#1b1a18" stroke-width="2"/>`;
    if(G==='square')s+=`<rect x="${L-8}" y="${gy-6}" width="16" height="12" rx="2.5" stroke="#1b1a18" stroke-width="2.2" fill="rgba(255,255,255,.15)"/><rect x="${R-8}" y="${gy-6}" width="16" height="12" rx="2.5" stroke="#1b1a18" stroke-width="2.2" fill="rgba(255,255,255,.15)"/><path d="M${L+8} ${gy-1} L${R-8} ${gy-1} M${L-8} ${gy-1} L36 ${gy-3} M${R+8} ${gy-1} L84 ${gy-3}" stroke="#1b1a18" stroke-width="2"/>`;
    if(G==='cateye')s+=`<path d="M${L-9} ${gy-5} Q${L} ${gy-7} ${L+7} ${gy-4} Q${L+7} ${gy+6} ${L} ${gy+6} Q${L-7} ${gy+6} ${L-9} ${gy-5}Z M${R+9} ${gy-5} Q${R} ${gy-7} ${R-7} ${gy-4} Q${R-7} ${gy+6} ${R} ${gy+6} Q${R+7} ${gy+6} ${R+9} ${gy-5}Z" fill="rgba(255,255,255,.15)" stroke="#c2185b" stroke-width="2.2"/><path d="M${L+7} ${gy-2} L${R-7} ${gy-2}" stroke="#c2185b" stroke-width="2"/>`;
    if(G==='sunglasses')s+=`<path d="M${L-9} ${gy-5} H${L+8} V${gy+1} Q${L+8} ${gy+7} ${L} ${gy+7} Q${L-9} ${gy+7} ${L-9} ${gy}Z M${R+9} ${gy-5} H${R-8} V${gy+1} Q${R-8} ${gy+7} ${R} ${gy+7} Q${R+9} ${gy+7} ${R+9} ${gy}Z" fill="#1b1a18"/><path d="M${L+8} ${gy-3} L${R-8} ${gy-3} M${L-9} ${gy-4} L35 ${gy-6} M${R+9} ${gy-4} L85 ${gy-6}" stroke="#1b1a18" stroke-width="2.2"/><path d="M${L-6} ${gy-3} L${L-2} ${gy-3}" stroke="#fff" stroke-width="1.4" opacity=".6"/>`;
    if(G==='star')s+=star(L,gy,9,'#ff4b4b')+star(R,gy,9,'#ff4b4b')+`<path d="M${L+6} ${gy-2} L${R-6} ${gy-2}" stroke="#ff4b4b" stroke-width="2"/>`+star(L,gy,4,'#1b1a18')+star(R,gy,4,'#1b1a18');
    // headwear
    const T=a.hat,htc=tc;
    if(T==='cap')s+=`<path d="M34 50 C34 30 46 24 60 24 C74 24 86 30 86 50 Z" fill="${htc}"/><path d="M34 48 C50 44 74 44 100 52 C96 56 86 56 80 54 C66 50 50 50 34 52Z" fill="${dk(htc,0.75)}"/><circle cx="60" cy="25" r="2.4" fill="${dk(htc,0.6)}"/>`;
    if(T==='capback')s+=`<path d="M34 50 C34 30 46 24 60 24 C74 24 86 30 86 50 Z" fill="${htc}"/><path d="M34 48 C30 46 20 46 14 52 C22 54 30 54 36 52Z" fill="${dk(htc,0.75)}"/><rect x="54" y="42" width="12" height="6" rx="2" fill="${dk(htc,0.6)}"/>`;
    if(T==='beret')s+=`<path d="M30 42 C30 26 50 20 66 22 C84 24 92 34 88 42 C76 46 44 46 30 42Z" fill="#c0392b"/><circle cx="66" cy="20" r="2.4" fill="#8c2b22"/>`;
    if(T==='headband')s+=`<path d="M35 44 C42 36 78 36 85 44 L85 50 C78 42 42 42 35 50Z" fill="${htc}"/>`;
    if(T==='flower')s+=[0,1,2,3,4].map(i=>{const an=i*72*Math.PI/180;return `<circle cx="${(78+5*Math.cos(an)).toFixed(1)}" cy="${(34+5*Math.sin(an)).toFixed(1)}" r="4.2" fill="#ff6fb5"/>`;}).join('')+`<circle cx="78" cy="34" r="3" fill="#ffc800"/>`;
    if(T==='beanie')s+=`<path d="M33 50 C33 26 46 20 60 20 C74 20 87 26 87 50 Z" fill="#b2862f"/><rect x="32" y="45" width="56" height="9" rx="3" fill="#8c2b22"/><circle cx="60" cy="18" r="5" fill="#8c2b22"/>`;
    if(T==='headphones')s+=`<path d="M33 60 C33 32 45 22 60 22 C75 22 87 32 87 60" stroke="#1b1a18" stroke-width="5" fill="none"/><rect x="27" y="52" width="11" height="19" rx="4" fill="#1b1a18"/><rect x="82" y="52" width="11" height="19" rx="4" fill="#1b1a18"/><rect x="29" y="55" width="5" height="13" rx="2" fill="#1cb0f6"/><rect x="86" y="55" width="5" height="13" rx="2" fill="#1cb0f6"/>`;
    if(T==='bow')s+=`<path d="M74 30 L86 22 L86 38 Z M74 30 L62 22 L62 38 Z" fill="#ff4b8b"/><circle cx="74" cy="30" r="3" fill="#c2185b"/>`;
    if(T==='crown')s+=`<path d="M40 34 L40 18 L50 26 L60 12 L70 26 L80 18 L80 34 Z" fill="#ffc800" stroke="#e0a800" stroke-width="1.4"/><circle cx="60" cy="26" r="2.6" fill="#ff4b4b"/><circle cx="48" cy="30" r="1.8" fill="#1cb0f6"/><circle cx="72" cy="30" r="1.8" fill="#58cc02"/>`;
    // instrument badge
    const badge=OPT.badge[a.badge]||'';if(badge)s+=`<circle cx="98" cy="98" r="15" fill="#fff" stroke="rgba(0,0,0,.12)"/><text x="98" y="104" font-size="17" text-anchor="middle">${badge}</text>`;
    return s+'</g></svg>';}
  UI.avatarSVG=svg;UI.normAvatar=norm;
  // ---- the builder ----
  const CATS=[['face','Face','🙂'],['hair','Hair','💇'],['eyes','Eyes','👀'],['mouth','Mouth','👄'],['extras','Extras','✨'],['glasses','Glasses','👓'],['hat','Headwear','🧢'],['top','Clothes','👕'],['bg','Background','🎨'],['badge','Instrument','🎷']];
  let cur='face';
  UI.openAvatar=function(el,opts){opts=opts||{};const lock=opts.lock||(()=>'');let a=UI.loadAvatar(opts.name);
    const tile=(key,val,label,av)=>{const lk=lock(key,val);const on=a[key]===val;return `<button class="avt${on?' on':''}${lk?' locked':''}" data-k="${key}" data-v="${esc(val)}" title="${esc(lk?'Locked: '+lk:label)}">${svg(Object.assign({},a,av||{[key]:val}),62)}<span>${lk?'🔒 ':''}${esc(label)}</span></button>`;};
    const sw=(key,list,label)=>`<div class="avsw"><div class="avlab">${label}</div><div class="swrow">${list.map((c,i)=>`<button class="swc${a[key]===i?' on':''}" data-k="${key}" data-v="${i}" data-num="1" style="background:${c}" title="${c}"></button>`).join('')}</div></div>`;
    const tiles=(key,label)=>`<div class="avlab">${label}</div><div class="avtiles">${OPT[key].map(([v,l])=>tile(key,v,l)).join('')}</div>`;
    const body=()=>{let h='';
      if(cur==='face')h=sw('skin',SKIN,'Skin tone')+tiles('face','Face shape')+tiles('brows','Eyebrows');
      else if(cur==='hair')h=sw('hairc',HAIRC,'Hair colour')+tiles('hair','Hairstyle');
      else if(cur==='eyes')h=sw('eyec',EYEC,'Eye colour')+tiles('eyes','Eyes');
      else if(cur==='mouth')h=tiles('mouth','Mouth');
      else if(cur==='extras')h=tiles('cheeks','Cheeks')+tiles('fhair','Facial hair')+tiles('ears','Earrings');
      else if(cur==='glasses')h=tiles('glasses','Glasses');
      else if(cur==='hat')h=tiles('hat','Headwear')+'<p class="avnote">Caps, headbands and headphones take your clothes colour.</p>';
      else if(cur==='top')h=sw('topc',TOPC,'Colour')+tiles('top','Clothes');
      else if(cur==='bg')h=sw('bg',BGC,'Colour')+tiles('bgp','Pattern');
      else h=`<div class="avlab">Instrument badge</div><div class="avtiles">${OPT.badge.map((b,i)=>tile('badge',i,i?b:'None')).join('')}</div>`;
      return h;};
    const paint=()=>{el.innerHTML=`<div class="avb"><div class="avhead"><div class="avbig">${svg(a,150)}</div><div><p class="prompt" style="margin:0">Your avatar</p><p class="sub">${esc(opts.note||'Some headwear, glasses and instrument badges unlock as you earn achievements.')}</p>
        <div class="controls"><button class="btn-ghost" id="avrandom">🎲 Surprise me</button><button class="btn-check" id="avdone">Done</button></div></div></div>
        <div class="avcats">${CATS.map(c=>`<button class="avcat${cur===c[0]?' on':''}" data-c="${c[0]}"><span>${c[2]}</span>${c[1]}</button>`).join('')}</div><div class="avpanel">${body()}</div></div>`;
      el.querySelectorAll('.avcat').forEach(b=>b.onclick=()=>{cur=b.dataset.c;paint();});
      el.querySelectorAll('[data-k]').forEach(b=>b.onclick=()=>{const k=b.dataset.k;const v=b.dataset.num||k==='badge'?+b.dataset.v:b.dataset.v;const lk=lock(k,v);if(lk){if(opts.toast)opts.toast('🔒 '+lk);return;}a[k]=v;UI.saveAvatar(a,opts.name);if(opts.onChange)opts.onChange(a);const sc=el.querySelector('.avpanel').scrollTop;paint();el.querySelector('.avpanel').scrollTop=sc;});
      el.querySelector('#avrandom').onclick=()=>{const r=l=>l[(Math.random()*l.length)|0];a.skin=(Math.random()*SKIN.length)|0;a.hairc=(Math.random()*HAIRC.length)|0;a.eyec=(Math.random()*EYEC.length)|0;a.topc=(Math.random()*TOPC.length)|0;a.bg=(Math.random()*BGC.length)|0;
        ['face','hair','brows','eyes','mouth','cheeks','top','bgp'].forEach(k=>a[k]=r(OPT[k])[0]);a.fhair=Math.random()<0.25?r(OPT.fhair)[0]:'none';a.ears=Math.random()<0.3?r(OPT.ears)[0]:'none';
        ['glasses','hat'].forEach(k=>{const free=OPT[k].map(x=>x[0]).filter(v=>!lock(k,v));a[k]=Math.random()<0.5?'none':r(free);});UI.saveAvatar(a,opts.name);if(opts.onChange)opts.onChange(a);paint();};
      el.querySelector('#avdone').onclick=()=>{if(opts.done)opts.done();};};
    paint();};
  // ================= HOME SCREEN =================
  const ICON={
    sun:'<circle cx="50" cy="50" r="17" fill="#fff"/>'+[0,1,2,3,4,5,6,7].map(i=>{const an=i*Math.PI/4;return `<path d="M${(50+27*Math.cos(an)).toFixed(1)} ${(50+27*Math.sin(an)).toFixed(1)} L${(50+36*Math.cos(an)).toFixed(1)} ${(50+36*Math.sin(an)).toFixed(1)}" stroke="#fff" stroke-width="7" stroke-linecap="round"/>`;}).join(''),
    target:'<circle cx="50" cy="50" r="32" stroke="#fff" stroke-width="7" fill="none"/><circle cx="50" cy="50" r="18" stroke="#fff" stroke-width="7" fill="none"/><circle cx="50" cy="50" r="6" fill="#fff"/>',
    metro:'<path d="M36 82 L44 20 H56 L64 82 Z" stroke="#fff" stroke-width="6" fill="none" stroke-linejoin="round"/><path d="M50 66 L68 30" stroke="#fff" stroke-width="6" stroke-linecap="round"/><path d="M30 82 H70" stroke="#fff" stroke-width="7" stroke-linecap="round"/>',
    rhythm:'<ellipse cx="32" cy="72" rx="11" ry="8" fill="#fff" transform="rotate(-20 32 72)"/><ellipse cx="68" cy="66" rx="11" ry="8" fill="#fff" transform="rotate(-20 68 66)"/><path d="M41 70 V26 L77 20 V64" stroke="#fff" stroke-width="6" fill="none"/><path d="M41 26 L77 20 V30 L41 36Z" fill="#fff"/>',
    note:'<ellipse cx="40" cy="70" rx="14" ry="10" fill="#fff" transform="rotate(-20 40 70)"/><path d="M52 66 V18 C62 24 74 28 74 42" stroke="#fff" stroke-width="7" fill="none" stroke-linecap="round"/>',
    interval:'<path d="M14 30 H86 M14 44 H86 M14 58 H86 M14 72 H86" stroke="#fff" stroke-width="3" opacity=".55"/><ellipse cx="36" cy="65" rx="10" ry="7" fill="#fff"/><ellipse cx="64" cy="37" rx="10" ry="7" fill="#fff"/><path d="M36 50 L64 50" stroke="#fff" stroke-width="5" stroke-dasharray="4 4"/>',
    melody:'<path d="M12 34 H88 M12 48 H88 M12 62 H88" stroke="#fff" stroke-width="3" opacity=".55"/><ellipse cx="26" cy="62" rx="8" ry="6" fill="#fff"/><ellipse cx="48" cy="48" rx="8" ry="6" fill="#fff"/><ellipse cx="70" cy="34" rx="8" ry="6" fill="#fff"/><path d="M26 62 Q48 40 70 34" stroke="#fff" stroke-width="4" fill="none" opacity=".7"/>',
    magnify:'<circle cx="42" cy="42" r="22" stroke="#fff" stroke-width="8" fill="none"/><path d="M58 58 L80 80" stroke="#fff" stroke-width="10" stroke-linecap="round"/>',
    stairs:'<path d="M16 82 H34 V66 H50 V50 H66 V34 H84" stroke="#fff" stroke-width="8" fill="none" stroke-linejoin="round" stroke-linecap="round"/>',
    tonality:'<circle cx="50" cy="50" r="30" stroke="#fff" stroke-width="7" fill="none"/><path d="M50 20 A30 30 0 0 1 50 80 Z" fill="#fff"/>',
    chord:'<path d="M14 26 H86 M14 40 H86 M14 54 H86 M14 68 H86 M14 82 H86" stroke="#fff" stroke-width="3" opacity=".5"/><ellipse cx="50" cy="75" rx="11" ry="7" fill="#fff"/><ellipse cx="50" cy="61" rx="11" ry="7" fill="#fff"/><ellipse cx="50" cy="47" rx="11" ry="7" fill="#fff"/>',
    roman:'<text x="50" y="64" text-anchor="middle" font-size="36" font-weight="900" fill="#fff" font-family="Georgia,serif">I IV V</text>',
    cadence:'<path d="M20 22 V78 M66 22 V78" stroke="#fff" stroke-width="5"/><path d="M78 22 V78" stroke="#fff" stroke-width="11"/><ellipse cx="42" cy="58" rx="11" ry="8" fill="#fff"/>',
    layers:'<path d="M50 16 L86 34 L50 52 L14 34Z" fill="#fff"/><path d="M14 50 L50 68 L86 50" stroke="#fff" stroke-width="7" fill="none" stroke-linejoin="round"/><path d="M14 66 L50 84 L86 66" stroke="#fff" stroke-width="7" fill="none" stroke-linejoin="round" opacity=".7"/>',
    form:'<rect x="12" y="30" width="22" height="40" rx="6" fill="#fff"/><rect x="39" y="30" width="22" height="40" rx="6" fill="#fff" opacity=".6"/><rect x="66" y="30" width="22" height="40" rx="6" fill="#fff"/><text x="23" y="58" font-size="20" font-weight="900" text-anchor="middle" fill="#000" opacity=".35">A</text><text x="50" y="58" font-size="20" font-weight="900" text-anchor="middle" fill="#000" opacity=".35">B</text><text x="77" y="58" font-size="20" font-weight="900" text-anchor="middle" fill="#000" opacity=".35">A</text>',
    dynamics:'<path d="M84 26 L16 50 L84 74" stroke="#fff" stroke-width="8" fill="none" stroke-linecap="round" stroke-linejoin="round"/>',
    tempo:'<circle cx="50" cy="56" r="28" stroke="#fff" stroke-width="7" fill="none"/><path d="M50 56 L64 42" stroke="#fff" stroke-width="7" stroke-linecap="round"/><path d="M42 18 H58" stroke="#fff" stroke-width="7" stroke-linecap="round"/>',
    wave:'<path d="M10 50 C20 20 30 20 40 50 C50 80 60 80 70 50 C76 32 84 32 90 50" stroke="#fff" stroke-width="8" fill="none" stroke-linecap="round"/>',
    loop:'<path d="M74 40 A26 26 0 1 0 76 60" stroke="#fff" stroke-width="8" fill="none" stroke-linecap="round"/><path d="M66 22 L78 40 L58 46" stroke="#fff" stroke-width="8" fill="none" stroke-linecap="round" stroke-linejoin="round"/>',
    cap:'<path d="M50 22 L90 40 L50 58 L10 40Z" fill="#fff"/><path d="M28 48 V66 C36 74 64 74 72 66 V48" stroke="#fff" stroke-width="7" fill="none"/><path d="M86 42 V64" stroke="#fff" stroke-width="5" stroke-linecap="round"/>',
    clipboard:'<rect x="22" y="18" width="56" height="70" rx="9" stroke="#fff" stroke-width="7" fill="none"/><rect x="38" y="12" width="24" height="14" rx="5" fill="#fff"/><path d="M36 56 L46 66 L66 44" stroke="#fff" stroke-width="8" fill="none" stroke-linecap="round" stroke-linejoin="round"/>',
    sharp:'<path d="M38 18 V84 M60 14 V80" stroke="#fff" stroke-width="7" stroke-linecap="round"/><path d="M24 42 L76 32 M24 66 L76 56" stroke="#fff" stroke-width="10" stroke-linecap="round"/>',
    clef:'<path d="M54 86 C40 88 40 74 50 74 C58 74 56 84 50 84 M52 90 L48 14 C60 18 62 34 46 46 C30 58 30 74 50 74 C68 74 70 52 50 52 C36 52 38 66 48 66" stroke="#fff" stroke-width="6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>',
    accent:'<path d="M18 30 L82 48 L18 66" stroke="#fff" stroke-width="9" fill="none" stroke-linecap="round" stroke-linejoin="round"/><circle cx="50" cy="84" r="6" fill="#fff"/>',
    transpose:'<path d="M34 80 V22 M34 22 L20 38 M34 22 L48 38" stroke="#fff" stroke-width="8" fill="none" stroke-linecap="round" stroke-linejoin="round"/><path d="M66 20 V78 M66 78 L52 62 M66 78 L80 62" stroke="#fff" stroke-width="8" fill="none" stroke-linecap="round" stroke-linejoin="round"/>',
    pitch:'<path d="M10 30 H90 M10 44 H90 M10 58 H90 M10 72 H90" stroke="#fff" stroke-width="3" opacity=".55"/><ellipse cx="50" cy="51" rx="13" ry="9" fill="#fff" transform="rotate(-20 50 51)"/><path d="M62 47 V14" stroke="#fff" stroke-width="6" stroke-linecap="round"/>',
    task:'<path d="M18 40 L60 22 V78 L18 60Z" fill="#fff"/><rect x="10" y="40" width="14" height="20" rx="4" fill="#fff"/><path d="M70 36 C78 42 78 58 70 64 M78 28 C92 40 92 60 78 72" stroke="#fff" stroke-width="6" fill="none" stroke-linecap="round"/>',
    bolt:'<path d="M56 10 L24 56 H46 L40 90 L76 40 H54Z" fill="#fff"/>',
    mic:'<rect x="36" y="12" width="28" height="46" rx="14" fill="#fff"/><path d="M24 46 C24 62 36 70 50 70 C64 70 76 62 76 46" stroke="#fff" stroke-width="7" fill="none" stroke-linecap="round"/><path d="M50 70 V86 M36 88 H64" stroke="#fff" stroke-width="7" stroke-linecap="round"/>',
    hand:'<circle cx="50" cy="54" r="26" fill="#fff" opacity=".35"/><circle cx="50" cy="54" r="14" fill="#fff"/><path d="M20 22 L30 32 M80 22 L70 32 M50 10 V22" stroke="#fff" stroke-width="7" stroke-linecap="round"/>'};
  const GRAD=[['#58cc02','#3fa102'],['#1cb0f6','#1482d1'],['#ff9600','#f56c00'],['#ce82ff','#a560e8'],['#ff4b4b','#e52f4f'],['#00cd9c','#00a37c'],['#ffc800','#f5a300'],['#2b70c9','#1f4fa0'],['#ff86d0','#e5539d'],['#8e7cc3','#6650a4'],['#14b8a6','#0d8f82'],['#f97316','#d9480f']];
  UI.icon=function(name,i){const g=GRAD[(i||0)%GRAD.length];return `<span class="ic" style="--c1:${g[0]};--c2:${g[1]}"><svg viewBox="0 0 100 100">${ICON[name]||ICON.note}</svg></span>`;};
  let H=null;
  UI.init=function(o){H=o;document.body.classList.add('nui');
    if(!document.getElementById('home')){const m=document.querySelector('main');const s=document.createElement('section');s.id='home';s.className='home';m.insertBefore(s,document.getElementById('tabs'));
      const tb=document.createElement('nav');tb.className='tabbar';tb.id='tabbar';tb.innerHTML=[['learn','🏠','Learn'],['ref','📖','Reference'],['rec','📊','Progress'],['me','🧑‍🎤','Avatar']].map(t=>`<button data-t="${t[0]}"><span>${t[1]}</span>${t[2]}</button>`).join('');document.body.appendChild(tb);
      tb.querySelectorAll('button').forEach(b=>b.onclick=()=>H.tab(b.dataset.t));
      const back=document.createElement('div');back.className='unitbar';back.id='unitbar';m.insertBefore(back,document.getElementById('dots'));}
    const ios=/iPhone|iPad|iPod/.test(navigator.userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);
    if(ios)document.addEventListener('click',e=>{const t=e.target.closest&&e.target.closest('.playbtn,.pp,#hearit,#hearans,.hearbtn,#play');if(!t||UI._iosHint)return;UI._iosHint=1;setTimeout(()=>{if(H.toast)H.toast('No sound? Turn off silent mode (the switch on the side of your iPhone) and turn the volume up.');},700);},true);
    UI.paintTabbar();};
  UI.paintTabbar=function(){if(!H)return;const t=H.currentTab();document.querySelectorAll('#tabbar button').forEach(b=>b.classList.toggle('on',b.dataset.t===t));};
  UI.showHome=function(on){document.body.classList.toggle('home',!!on);if(on)UI.renderHome();UI.paintTabbar();};
  UI.inHome=()=>document.body.classList.contains('home');
  // ---- daily goal, day count (per student, per device) ----
  const today=()=>{const d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');};
  const LSg=(k,d)=>{try{const v=localStorage.getItem(k);return v==null?d:JSON.parse(v);}catch(e){return d;}},LSs=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v));}catch(e){}};
  UI.goal=n=>LSg('blitzGoal:'+nk(n),20);UI.setGoal=(n,g)=>LSs('blitzGoal:'+nk(n),g);
  UI.todayCount=n=>{const r=LSg('blitzDay:'+nk(n),null);return r&&r.d===today()?r.n:0;};
  UI.answered=function(n){const k='blitzDay:'+nk(n);const r=LSg(k,null);const c=(r&&r.d===today()?r.n:0)+1;LSs(k,{d:today(),n:c});const g=UI.goal(n);
    if(c===g&&H){if(H.toast)H.toast('🎉 Daily goal reached: '+g+' answers today!');if(H.burst)H.burst();}if(UI.inHome())UI.renderHome();};
  UI.daysStreak=function(days){if(!days||!days.length)return 0;const set=new Set(days);let d=new Date();const key=x=>x.getFullYear()+'-'+String(x.getMonth()+1).padStart(2,'0')+'-'+String(x.getDate()).padStart(2,'0');
    if(!set.has(key(d)))d.setDate(d.getDate()-1);let n=0;while(set.has(key(d))){n++;d.setDate(d.getDate()-1);}return n;};
  UI.level=m=>!m||!m.n?0:m.mastered?5:(m.n>=15&&m.acc>=0.85)?4:(m.n>=10&&m.acc>=0.75)?3:m.acc>=0.6?2:1;

  // ---- profiles: merge on save so two open copies (Aural + Theory, two tabs, the test's companion section) never wipe each other's progress ----
  UI.mergeDelta=function(st,base,mine){const J=JSON.stringify,out={};base=base||{};const keys=new Set(Object.keys(st||{}).concat(Object.keys(mine||{})));
    keys.forEach(k=>{const s=st?st[k]:undefined,b=base[k],m=mine[k];
      if(m===undefined){out[k]=s;return;}if(s===undefined){out[k]=m;return;}
      if(k==='name'){out[k]=m||s;return;}
      if(typeof m==='number'&&typeof s==='number'){out[k]=k==='bestStreak'?Math.max(s,m):s+(m-(typeof b==='number'?b:0));return;}
      if(k==='days'&&Array.isArray(m)&&Array.isArray(s)){out[k]=Array.from(new Set(s.concat(m))).sort();return;}
      if(k==='exams'&&Array.isArray(m)&&Array.isArray(s)){const seen=new Set(s.map(x=>x&&x.at));out[k]=s.concat(m.filter(x=>x&&!seen.has(x.at)));return;}
      if(m&&s&&typeof m==='object'&&typeof s==='object'&&!Array.isArray(m)&&!Array.isArray(s)){const o=Object.assign({},s);
        Object.keys(m).forEach(x=>{if(J(m[x])===J(b&&b[x]))return;o[x]=(k==='sprint'&&typeof m[x]==='number'&&typeof s[x]==='number')?Math.max(m[x],s[x]):m[x];});out[k]=o;return;}
      out[k]=J(m)!==J(b)?m:s;});return out;};
  // PROFS: the app's map, k: this student's key, PROF: this student's live object, baseJ: PROF as last read/written. Returns the new base.
  UI.profSync=function(PROFS,k,PROF,baseJ,write){let cur={};try{cur=JSON.parse(localStorage.getItem('blitzAuralProfiles')||'{}')||{};}catch(e){}
    Object.keys(cur).forEach(x=>{if(x!==k)PROFS[x]=cur[x];});const st=cur[k];
    if(PROF){if(st){const mg=UI.mergeDelta(st,baseJ?JSON.parse(baseJ):null,PROF);Object.keys(PROF).forEach(x=>delete PROF[x]);Object.assign(PROF,mg);}PROFS[k]=PROF;}
    if(write){try{localStorage.setItem('blitzAuralProfiles',JSON.stringify(PROFS));}catch(e){}return PROF?JSON.stringify(PROF):baseJ;}
    return st?JSON.stringify(st):baseJ;};
  // ---- tests: feedback is hidden, so say plainly that the answer was saved (or why it wasn't) ----
  UI.testAck=function(o){const card=document.getElementById('card');if(!card||!window.MutationObserver)return;let busy=false;
    const run=()=>{busy=false;const fb=document.getElementById('fb');let t=document.getElementById('tfb');
      let on=false;try{on=o.testing();}catch(e){}if(!on||!fb){if(t)t.remove();return;}
      if(!t){t=document.createElement('div');t.id='tfb';t.className='tfb';t.setAttribute('role','status');}
      if(fb.nextElementSibling!==t)fb.insertAdjacentElement('afterend',t);
      let sc=false;try{sc=o.scored();}catch(e){}const txt=(fb.textContent||'').trim();
      const msg=sc?'✓ Answer saved. Press Next ›':txt;if(t.textContent!==msg)t.textContent=msg;t.style.display=msg?'':'none';};
    new MutationObserver(()=>{if(!busy){busy=true;setTimeout(run,40);}}).observe(card,{childList:true,subtree:true,characterData:true});};
  // ---- overlay sheet ----
  function sheet(html,wide){let w=document.getElementById('bsheet');if(!w){w=document.createElement('div');w.id='bsheet';w.innerHTML='<div class="bsback"></div><div class="bsbox"><button class="gclose bsx">✕</button><div class="bsbody"></div></div>';document.body.appendChild(w);
      w.querySelector('.bsback').onclick=UI.closeSheet;w.querySelector('.bsx').onclick=UI.closeSheet;}
    w.querySelector('.bsbody').innerHTML=html;w.classList.add('open');w.querySelector('.bsbox').classList.toggle('wide',!!wide);return w.querySelector('.bsbody');}
  UI.closeSheet=()=>{const w=document.getElementById('bsheet');if(w)w.classList.remove('open');};
  // ---- who's practising ----
  const profs=()=>{try{return JSON.parse(localStorage.getItem('blitzAuralProfiles')||'{}')||{};}catch(e){return {};}};
  UI.pickProfile=function(first){const P=profs();const list=Object.keys(P).filter(k=>k!=='(no name)'&&P[k]&&P[k].name).map(k=>({k,name:P[k].name,xp:P[k].xp||0})).sort((a,b)=>b.xp-a.xp).slice(0,40);const cur=H&&H.stats().name;
    const b=sheet(`<p class="prompt" style="margin-top:0">Who's practising?</p><p class="sub">${first?'Choose your name so your XP, streak and avatar are saved to you.':'Tap your name, or add someone new.'}</p>
      ${list.length?`<div class="plist">${list.map(p=>`<button class="pitem${cur&&nk(cur)===p.k?' on':''}" data-n="${esc(p.name)}">${svg(UI.loadAvatar(p.name),46)}<span><b>${esc(p.name)}</b><small>${p.xp} XP</small></span></button>`).join('')}</div>`:''}
      <div class="avlab">Someone new</div><div class="pnew"><input id="pname" maxlength="28" placeholder="First and last name" autocomplete="off"><button class="btn-check" id="pgo">Start</button></div>`);
    b.querySelectorAll('.pitem').forEach(x=>x.onclick=()=>{H.setName(x.dataset.n);UI.closeSheet();UI.renderHome();});
    const go=()=>{const v=b.querySelector('#pname').value.trim().replace(/\s+/g,' ');if(v.split(' ').length<2||v.length<4){if(H.toast)H.toast('Type your first and last name');return;}
      const ex=list.find(p=>p.k===nk(v));H.setName(ex?ex.name:v);UI.closeSheet();UI.renderHome();};
    b.querySelector('#pgo').onclick=go;b.querySelector('#pname').onkeydown=e=>{if(e.key==='Enter')go();};};
  // ---- progress backup code ----
  const b64u={enc:u=>{let s='';u.forEach(x=>s+=String.fromCharCode(x));return btoa(s).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');},dec:t=>{t=t.replace(/-/g,'+').replace(/_/g,'/');const b=atob(t+'==='.slice((t.length+3)%4));return Uint8Array.from(b,c=>c.charCodeAt(0));}};
  async function pack(o){const raw=new TextEncoder().encode(JSON.stringify(o));if(window.CompressionStream){const ab=await new Response(new Blob([raw]).stream().pipeThrough(new CompressionStream('deflate-raw'))).arrayBuffer();return 'P1.'+b64u.enc(new Uint8Array(ab));}return 'P0.'+b64u.enc(raw);}
  async function unpack(code){code=code.trim().replace(/\s+/g,'');const m=code.match(/P([01])\.([A-Za-z0-9_-]+)/);if(!m)throw new Error('no code');const u=b64u.dec(m[2]);let raw=u;if(m[1]==='1'){raw=new Uint8Array(await new Response(new Blob([u]).stream().pipeThrough(new DecompressionStream('deflate-raw'))).arrayBuffer());}return JSON.parse(new TextDecoder().decode(raw));}
  function mergeProf(a,b){if(!a)return b;const o=Object.assign({},a);['xp','correct','total','bestStreak'].forEach(k=>o[k]=Math.max(a[k]||0,b[k]||0));o.days=[...new Set([].concat(a.days||[],b.days||[]))].sort();
    o.ach=Object.assign({},a.ach||{},b.ach||{});o.sprint=Object.assign({},a.sprint||{});Object.entries(b.sprint||{}).forEach(([k,v])=>o.sprint[k]=Math.max(o.sprint[k]||0,v));
    o.hist=Object.assign({},a.hist||{});Object.entries(b.hist||{}).forEach(([k,v])=>{if(!o.hist[k]||(v||[]).length>o.hist[k].length)o.hist[k]=v;});
    const ex=[].concat(a.exams||[],b.exams||[]);const seen=new Set();o.exams=ex.filter(e=>{const k=e.at+'|'+e.tot;if(seen.has(k))return false;seen.add(k);return true;});return o;}
  UI.backup=async function(){const st=H.stats();if(!st.name){UI.pickProfile(true);return;}const P=profs();const k=nk(st.name);
    const code=await pack({v:1,name:st.name,prof:P[k]||{},av:UI.loadAvatar(st.name),goal:UI.goal(st.name),at:Date.now()});
    const b=sheet(`<p class="prompt" style="margin-top:0">Back up your progress</p><p class="sub">Your XP, streak, mastery, achievements and avatar live only in this browser. Save this code somewhere safe (email it to yourself, or keep the file). On any device, use <b>Restore</b> to bring it back. It works for Aural Blitz and Theory Blitz.</p>
      <textarea class="tkin bcode" rows="4" readonly id="bcode">${code}</textarea>
      <div class="controls"><button class="btn-check" id="bcopy">Copy code</button><button class="btn-ghost" id="bfile">Download file</button><button class="btn-ghost" id="bmail">Email to myself</button></div>
      <div class="avlab" style="margin-top:16px">Restore on this device</div><textarea class="tkin bcode" rows="3" id="bin" placeholder="Paste your progress code (starts with P1.)"></textarea>
      <div class="controls"><button class="btn-ghost" id="brest">Restore</button><button class="btn-ghost" id="bpick">Open a saved file</button><input type="file" id="bf" accept=".txt,text/plain" style="display:none"></div>`);
    const copy=async()=>{try{await navigator.clipboard.writeText(code);H.toast&&H.toast('Code copied ✓');}catch(e){const t=b.querySelector('#bcode');t.select();try{document.execCommand('copy');H.toast&&H.toast('Code copied ✓');}catch(e2){}}};
    b.querySelector('#bcopy').onclick=copy;b.querySelector('#bcode').onfocus=e=>e.target.select();
    b.querySelector('#bfile').onclick=()=>{const a=document.createElement('a');a.href=URL.createObjectURL(new Blob(['Blitz progress for '+st.name+'\n\n'+code+'\n'],{type:'text/plain'}));a.download='Blitz-progress-'+st.name.replace(/[^\w]+/g,'-')+'.txt';document.body.appendChild(a);a.click();setTimeout(()=>a.remove(),300);};
    b.querySelector('#bmail').onclick=()=>{location.href='mailto:?subject='+encodeURIComponent('My Blitz progress code')+'&body='+encodeURIComponent('Blitz progress for '+st.name+'. To restore: Aural or Theory Blitz → Home → Back up → Restore.\n\n'+code+'\n');};
    const restore=async txt=>{let o;try{o=await unpack(txt);}catch(e){H.toast&&H.toast('That isn\'t a progress code');return;}if(!o||!o.name||!o.prof){H.toast&&H.toast('That isn\'t a progress code');return;}
      const P2=profs();const k2=nk(o.name);if(!confirm('Restore progress for '+o.name+' ('+(o.prof.xp||0)+' XP)? It is combined with anything already on this device.'))return;
      P2[k2]=mergeProf(P2[k2],Object.assign({},o.prof,{name:o.name}));LSs('blitzAuralProfiles',P2);if(o.av)UI.saveAvatar(norm(o.av),o.name);if(o.goal)UI.setGoal(o.name,o.goal);
      if(H.reloadProfiles)H.reloadProfiles();H.setName(o.name);UI.closeSheet();H.toast&&H.toast('Progress restored for '+o.name+' ✓');UI.renderHome();};
    b.querySelector('#brest').onclick=()=>restore(b.querySelector('#bin').value);const f=b.querySelector('#bf');b.querySelector('#bpick').onclick=()=>f.click();f.onchange=async()=>{if(f.files[0])restore(await f.files[0].text());};};
  UI.chooseGoal=function(){const st=H.stats();const g=UI.goal(st.name);const b=sheet(`<p class="prompt" style="margin-top:0">Daily goal</p><p class="sub">How many answers a day? Reach it to keep your 🔥 streak growing.</p>
      <div class="glist">${[[10,'Casual','about 5 minutes'],[20,'Regular','about 10 minutes'],[40,'Serious','about 20 minutes'],[60,'Intense','30 minutes or more']].map(o=>`<button class="gitem${g===o[0]?' on':''}" data-g="${o[0]}"><b>${o[1]}</b><span>${o[0]} answers · ${o[2]}</span></button>`).join('')}</div>`);
    b.querySelectorAll('.gitem').forEach(x=>x.onclick=()=>{UI.setGoal(st.name,+x.dataset.g);UI.closeSheet();UI.renderHome();});};
  UI.renderHome=function(){if(!H)return;const el=document.getElementById('home');const st=H.stats();const list=H.units();const path=H.path?H.path():[];const up=H.upNext?H.upNext():null;
    const ring=(m)=>{if(!m||!m.n)return '';const C=2*Math.PI*9;const col=m.mastered?'#ffc800':m.acc>=0.7?'#58cc02':m.acc>=0.5?'#ff9600':'#ff4b4b';
      return `<svg class="mring" viewBox="0 0 22 22" aria-hidden="true"><circle cx="11" cy="11" r="9" fill="#fff" stroke="#e5e5e5" stroke-width="3"/><circle cx="11" cy="11" r="9" fill="none" stroke="${col}" stroke-width="3" stroke-dasharray="${(C*m.acc).toFixed(1)} ${C.toFixed(1)}" transform="rotate(-90 11 11)" stroke-linecap="round"/>${m.mastered?'<text x="11" y="15" text-anchor="middle" font-size="11">👑</text>':''}</svg>`;};
    const crowns=l=>`<span class="lv" aria-label="level ${l} of 5">${[1,2,3,4,5].map(k=>`<i class="${k<=l?'on':''}"></i>`).join('')}</span>`;
    const groups=[['daily','Daily'],['skill','All '+(H.skillTitle||'skills').toLowerCase()],['test','Tests and tasks']];
    const goal=UI.goal(st.name),cnt=UI.todayCount(st.name),done=Math.min(goal,cnt),C=2*Math.PI*26;const ymode=H.years?H.years():[];
    const pcur=path.findIndex(p=>!p.m||!p.m.mastered);
    el.innerHTML=`<div class="hhero"><button class="hav" id="hav" aria-label="Edit your avatar">${svg(UI.loadAvatar(st.name),84)}</button>
        <div class="hwho"><div class="hhi">${st.name?'Hi, '+esc(st.name.split(' ')[0])+'!':'Hi there!'}</div><div class="hrank">${esc(st.rank||'')} · ${st.xp||0} XP <button class="hlink" id="hswitch">${st.name?'Not you?':'Choose your name'}</button></div><div class="hxp"><i style="width:${Math.round((st.xpPct||0)*100)}%"></i></div></div>
        <button class="hgoal" id="hgoal" aria-label="Today: ${cnt} of ${goal} answers. Change your daily goal"><svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="26" fill="none" stroke="#e5e5e5" stroke-width="7"/><circle cx="32" cy="32" r="26" fill="none" stroke="${cnt>=goal?'#58cc02':'#ff9600'}" stroke-width="7" stroke-linecap="round" stroke-dasharray="${(C*done/goal).toFixed(1)} ${C.toFixed(1)}" transform="rotate(-90 32 32)"/></svg><b>${cnt>=goal?'✓':cnt}</b><span>${cnt>=goal?'goal done':'/'+goal+' today'}</span></button></div>
      <div class="hbar">${ymode.length?`<div class="hyears" role="group" aria-label="Year">${ymode.map(y=>`<button class="${y===H.year()?'on':''}" data-y="${y}">Year ${y}</button>`).join('')}</div>`:''}
        <div class="htools"><button class="hchip" id="hbackup">💾 Back up</button>${H.customise?'<button class="hchip" id="hcust">⚙ Customise</button>':''}</div></div>
      <div class="hstats"><div><span>🔥</span><b>${st.days||0}</b><small>day streak</small></div><div><span>⚡</span><b>${st.streak||0}</b><small>in a row</small></div><div><span>🎯</span><b>${st.acc||'—'}</b><small>accuracy</small></div><div><span>👑</span><b>${st.mastered||0}</b><small>mastered</small></div></div>
      ${up?`<button class="upnext" id="upnext">${UI.icon(up.icon,up.hue||1)}<span class="uptxt"><small>${esc(up.why)}</small><b>${esc(up.name)}</b></span><span class="upgo">START</span></button>`:''}
      ${path.length?`<div class="hsec">Your Year ${H.year()} path</div><div class="path">${path.map((p,k)=>{const l=UI.level(p.m);return `<button class="pnode${k===pcur?' cur':''}${l>=5?' done':''}" data-i="${p.i}" style="--off:${[0,1,2,1,0,-1,-2,-1][k%8]*38}px" aria-label="${esc(p.name)}, level ${l} of 5">${k===pcur?'<span class="pstart">START</span>':''}${UI.icon(p.icon,p.hue||k)}<span class="nm">${esc(p.name)}</span>${crowns(l)}</button>`;}).join('')}</div>`:''}
      ${groups.map(([g,t])=>{const items=list.filter(u=>u.group===g);if(!items.length)return '';return `<div class="hsec">${t}</div><div class="igrid">${items.map((u,k)=>`<button class="itile" data-i="${u.i}" aria-label="${esc(u.name)}${u.m&&u.m.n?', '+Math.round(u.m.acc*100)+'% recently'+(u.m.mastered?', mastered':''):''}">${UI.icon(u.icon,u.hue!==undefined?u.hue:k+(g==='daily'?6:g==='test'?3:0))}${ring(u.m)}<span class="nm">${esc(u.name)}</span>${u.sub?`<span class="sb">${esc(u.sub)}</span>`:''}</button>`).join('')}</div>`;}).join('')}`;
    el.querySelectorAll('.itile,.pnode').forEach(b=>b.onclick=()=>H.open(+b.dataset.i));
    const on=(id,f)=>{const x=document.getElementById(id);if(x)x.onclick=f;};
    on('hav',()=>H.tab('me'));on('hswitch',()=>UI.pickProfile(false));on('hgoal',()=>UI.chooseGoal());on('hbackup',()=>UI.backup());on('hcust',()=>H.customise());if(up)on('upnext',()=>H.open(up.i));
    el.querySelectorAll('.hyears button').forEach(b=>b.onclick=()=>H.setYear(+b.dataset.y));};
  UI.unitBar=function(name,iconName,hue){const b=document.getElementById('unitbar');if(!b)return;b.innerHTML=`<button class="homebtn" id="homebtn">‹ Home</button>${UI.icon(iconName,hue||0)}<span class="unm">${esc(name)}</span>`;
    document.getElementById('homebtn').onclick=()=>H.home();};
  // ================= STYLES =================
  const css=`
  body.nui{--nbg:#f3f5f9;--ncard:#ffffff;--nink:#1f2328;--nmut:#7b8494;--nline:#e5e7eb;--ngreen:#58cc02;--ngreenD:#46a302;--nblue:#1cb0f6;--nblueD:#1899d6;--nred:#ff4b4b;--nredD:#ea2b2b;--nfont:'Nunito',-apple-system,BlinkMacSystemFont,'SF Pro Rounded','Segoe UI',Roboto,Arial,sans-serif}
  body.nui:not(.paper){background:var(--nbg);color:var(--nink);--bg:#f3f5f9;--paper:#ffffff;--paper2:#f6f7fa;--rule:#e5e7eb;--shade:#eef1f5;--muted:#7b8494;--ink:#1f2328;--cream:#ffffff;--accent:#1cb0f6;--serif:var(--nfont);--sans:var(--nfont)}
  body.nui:not(.paper) #musicfx{opacity:.25}
  body.nui:not(.paper) header{color:var(--nink);padding-bottom:0}
  body.nui:not(.paper) header .wrap{border:0;align-items:center;padding-bottom:4px}
  body.nui:not(.paper) header .eye{color:var(--nmut);letter-spacing:1.4px;font-size:9.5px}
  body.nui:not(.paper) header h1{font-family:var(--nfont);font-weight:900;font-size:26px;color:var(--nink);letter-spacing:-.3px}
  body.nui:not(.paper) header h1 .dot{background:var(--ngreen)}
  body.nui:not(.paper) .hud{gap:8px;color:var(--nink)}
  body.nui:not(.paper) .hud .stat{background:#fff;border-radius:14px;padding:5px 10px;min-width:0;box-shadow:0 1px 0 var(--nline),0 2px 8px rgba(20,30,60,.05)}
  body.nui:not(.paper) .hud .stat .lbl{color:var(--nmut);font-size:9px;letter-spacing:1px}
  body.nui:not(.paper) .hud .stat .val{font-family:var(--nfont);font-weight:900;font-size:17px;color:var(--nink)}
  body.nui:not(.paper) .hud .stat .val.brass{color:#ff9600}
  body.nui:not(.paper) .hud .rst,body.nui:not(.paper) .sfxbtn{border:2px solid var(--nline);color:var(--nmut);background:#fff;border-radius:12px}
  body.nui:not(.paper) .xp{background:#e5e7eb;border-radius:4px;height:5px}.nui .xp i{background:#ffc800}
  body.nui:not(.paper) .modebar:has(#mPr){display:none}
  body.nui:not(.paper) .modebar{border:0;background:#e9ecf2;border-radius:12px;padding:3px}
  body.nui:not(.paper) .modebar button{color:var(--nmut);font-family:var(--nfont);font-weight:800;border-radius:9px}
  body.nui:not(.paper) .modebar button.on{background:#fff;color:var(--nink);box-shadow:0 1px 3px rgba(0,0,0,.12)}
  body.nui:not(.paper) .yearbar .ylab{color:var(--nmut)}
  body.nui:not(.paper) .namebar{color:var(--nmut)}
  body.nui:not(.paper) .namebar input{border:2px solid var(--nline);background:#fff;color:var(--nink);border-radius:12px;font-family:var(--nfont);font-weight:700}
  body.nui:not(.paper) .namebar input::placeholder{color:#a3aab6}
  body.nui:not(.paper) .avbtn,body.nui:not(.paper) .taskbtn{border:2px solid var(--nline)!important;background:#fff!important;color:var(--nink)!important;border-radius:12px!important;font-family:var(--nfont);font-weight:800}
  body.nui:not(.paper) .tabs button{border:2px solid var(--nline);background:#fff;color:var(--nink);border-radius:12px;font-family:var(--nfont);font-weight:800}
  body.nui:not(.paper) .tabs button.on{background:var(--nblue);border-color:var(--nblue);color:#fff}
  body.nui.home .tabs,body.nui.home .dots,body.nui.home .card,body.nui.home #unitbar{display:none!important}
  body.nui:not(.home) #home{display:none}
  body.nui.prac .tabs{display:none!important}body.nui.embed #unitbar{display:none!important}
  body.nui:not(.prac) #unitbar{display:none!important}
  body.nui.paper .tabbar,body.nui.tasking .tabbar,body.nui.embed .tabbar,body.nui.tasking #unitbar{display:none!important}
  .unitbar{display:flex;align-items:center;gap:10px;margin:6px 0 6px;flex:none}
  .unitbar .ic{width:30px;height:30px;border-radius:9px}.unitbar .unm{font-weight:900;font-size:17px;font-family:var(--nfont)}body.paper .unitbar .unm{color:#fff}
  .homebtn{border:2px solid var(--nline);background:#fff;border-radius:12px;padding:7px 12px;font-weight:900;font-family:var(--nfont);font-size:14px;cursor:pointer;color:var(--nink);box-shadow:0 2px 0 var(--nline)}
  .homebtn:active{transform:translateY(2px);box-shadow:none}
  body.nui:not(.paper) .dots .d{border:0;background:#e5e7eb;border-radius:6px;width:auto;flex:1 1 14px;max-width:40px;height:10px}
  body.nui:not(.paper) .dots .d.ok{background:var(--ngreen)}body.nui:not(.paper) .dots .d.no{background:var(--nred)}
  body.nui:not(.paper) .dots .d.cur{box-shadow:0 0 0 2px #fff,0 0 0 4px var(--nblue)}
  body.nui:not(.paper) .card{background:#fff;border-radius:24px;border-top:0;box-shadow:0 2px 0 var(--nline),0 10px 30px rgba(20,30,60,.08);padding:18px 18px 16px}
  body.nui:not(.paper) .qnum{color:var(--nblue);letter-spacing:1.4px;font-weight:900}
  body.nui:not(.paper) .prompt{font-family:var(--nfont);font-weight:900;font-size:22px;letter-spacing:-.2px}
  body.nui:not(.paper) .sub{color:#596273}
  body.nui:not(.paper) .howbtn{border:2px solid var(--nline);border-radius:12px;font-family:var(--nfont);font-weight:800;background:#fff}
  body.nui:not(.paper) .opts{gap:10px}
  body.nui:not(.paper) .opts button{border:2px solid var(--nline);border-bottom-width:4px;border-radius:16px;padding:13px 14px;font-family:var(--nfont);font-weight:800;font-size:16px;background:#fff;transition:transform .06s}
  body.nui:not(.paper) .opts button:hover:not(:disabled){border-color:#cfd5de;background:#f9fafb}
  body.nui:not(.paper) .opts button:active:not(:disabled){transform:translateY(2px);border-bottom-width:2px}
  body.nui:not(.paper) .opts button .k{background:#f1f3f6;color:#8a93a3;border-radius:8px;border:2px solid var(--nline)}
  body.nui:not(.paper) .opts button.ok{background:#d7ffb8;border-color:var(--ngreen);color:#3a7d00}body.nui:not(.paper) .opts button.ok .k{background:var(--ngreen);border-color:var(--ngreen);color:#fff}
  body.nui:not(.paper) .opts button.no{background:#ffdfe0;border-color:var(--nred);color:#c4232b}body.nui:not(.paper) .opts button.no .k{background:var(--nred);border-color:var(--nred);color:#fff}
  body.nui:not(.paper) .controls button{border-radius:16px;font-family:var(--nfont);font-weight:900;letter-spacing:.5px;text-transform:uppercase;font-size:14px;border:2px solid var(--nline);border-bottom-width:4px;background:#fff;color:#4b5563;padding:12px}
  body.nui:not(.paper) .controls button:active{transform:translateY(2px);border-bottom-width:2px}
  body.nui:not(.paper) .controls .btn-check{background:var(--ngreen);border-color:var(--ngreenD);color:#fff}
  body.nui:not(.paper) .controls .btn-ans{color:var(--nblue)!important;border-color:var(--nline)!important}
  body.nui:not(.paper) .playbtn{background:var(--nblue);border-radius:16px;border-bottom:4px solid var(--nblueD);font-family:var(--nfont);font-weight:900;color:#fff}
  body.nui:not(.paper) .playbtn:hover:not(:disabled){background:#14a5e9}
  body.nui:not(.paper) .replaybtn,body.nui:not(.paper) .pp{border:2px solid var(--nline)!important;border-bottom-width:4px!important;border-radius:16px!important;background:#fff!important;color:var(--nink)!important;font-family:var(--nfont);font-weight:800}
  body.nui:not(.paper) .feedback{font-family:var(--nfont);font-weight:900;font-size:18px;border-radius:16px}
  body.nui:not(.paper) .feedback.ok{background:#d7ffb8;color:#3a7d00;padding:12px 14px}body.nui:not(.paper) .feedback.no{background:#ffdfe0;color:#c4232b;padding:12px 14px}
  body.nui:not(.paper) .feedback .why,body.nui:not(.paper) .feedback .sub{font-weight:600;font-size:14px}
  body.nui:not(.paper) .nav button{border:2px solid var(--nline);border-bottom-width:4px;border-radius:14px;font-family:var(--nfont);font-weight:900;background:#fff}
  body.nui:not(.paper) .chip{border:2px solid var(--nline);border-radius:12px;font-family:var(--nfont);font-weight:800}
  body.nui:not(.paper) .chip.on{background:var(--nblue);border-color:var(--nblue);color:#fff}
  body.nui .guide{border-radius:24px;border-top:0;box-shadow:0 20px 60px rgba(0,0,0,.25)}
  body.nui .guide .gclose{border-radius:12px}
  /* slim header, accessibility */
  body.nui:not(.paper) .topbar{display:none!important}
  body.nui:not(.paper) header .eye{display:none}
  body.nui:not(.paper) .hud .stat:has(#scv),body.nui:not(.paper) .hud .stat:has(#scp),body.nui:not(.paper) .hud .stat:has(#snum),body.nui:not(.paper) .hud .rst{display:none}
  body.nui:not(.paper) header{padding-top:calc(6px + env(safe-area-inset-top,0))}
  body.nui :focus-visible{outline:3px solid #1cb0f6;outline-offset:2px}
body.parked #card{padding-bottom:84px}
.backq{position:fixed;left:50%;transform:translateX(-50%);bottom:calc(78px + env(safe-area-inset-bottom,0px));z-index:60;border:0;border-radius:999px;padding:12px 20px;background:#58cc02;color:#fff;font:800 15px/1 Nunito,system-ui,sans-serif;box-shadow:0 4px 0 #3fa102,0 8px 20px rgba(0,0,0,.25);cursor:pointer;white-space:nowrap}.backq:active{transform:translateX(-50%) translateY(3px);box-shadow:0 1px 0 #3fa102}
.tfb{margin-top:10px;padding:11px 14px;border-radius:14px;background:#e8f4ff;color:#1453a0;font-weight:800;font-size:15px;text-align:center}
  body.nui:not(.paper):not(.testing) .opts button.ok::after{content:'✓';margin-left:auto;font-weight:900;color:#3a7d00;font-size:18px}
  body.nui:not(.paper):not(.testing) .opts button.no::after{content:'✗';margin-left:auto;font-weight:900;color:#c4232b;font-size:18px}
  body.nui:not(.paper) .dots .d.ok::after{content:''}
  /* sheet */
  #bsheet{position:fixed;inset:0;z-index:80;display:none}#bsheet.open{display:block}
  #bsheet .bsback{position:absolute;inset:0;background:rgba(15,20,30,.45)}
  #bsheet .bsbox{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);width:min(520px,94vw);max-height:88vh;overflow:auto;background:#fff;border-radius:24px;padding:20px;box-shadow:0 20px 60px rgba(0,0,0,.3);font-family:var(--nfont)}
  #bsheet .bsbox.wide{width:min(760px,96vw)}#bsheet .bsx{position:absolute;right:14px;top:14px}
  .plist{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:8px;margin:8px 0}
  .pitem{display:flex;align-items:center;gap:10px;border:2px solid var(--nline);border-bottom-width:4px;border-radius:16px;background:#fff;padding:8px;cursor:pointer;text-align:left;font-family:var(--nfont)}
  .pitem svg{border-radius:12px;flex:none}.pitem b{display:block;font-size:14px}.pitem small{color:var(--nmut);font-weight:700}.pitem.on{border-color:var(--ngreen);background:#eaffd9}
  .pnew{display:flex;gap:8px}.pnew input{flex:1;border:2px solid var(--nline);border-radius:14px;padding:10px 12px;font-family:var(--nfont);font-weight:700;font-size:15px}
  .pnew .btn-check{background:var(--ngreen);color:#fff;border:0;border-bottom:4px solid var(--ngreenD);border-radius:14px;font-family:var(--nfont);font-weight:900;padding:0 18px;cursor:pointer}
  .bcode{width:100%;font-family:ui-monospace,Menlo,Consolas,monospace;font-size:11.5px;word-break:break-all;border:2px solid var(--nline);border-radius:12px;padding:8px;resize:none}
  .glist{display:grid;gap:8px}.gitem{display:flex;justify-content:space-between;align-items:center;border:2px solid var(--nline);border-bottom-width:4px;border-radius:16px;background:#fff;padding:12px 14px;cursor:pointer;font-family:var(--nfont)}
  .gitem b{font-size:16px}.gitem span{color:var(--nmut);font-weight:700;font-size:13px}.gitem.on{border-color:var(--ngreen);background:#eaffd9}
  /* home */
  .home{flex:1;min-height:0;overflow:auto;padding:4px 2px 90px;-webkit-overflow-scrolling:touch}
  .hhero{display:flex;align-items:center;gap:14px;background:#fff;border-radius:24px;padding:14px;box-shadow:0 2px 0 var(--nline),0 8px 24px rgba(20,30,60,.06)}
  .hav{border:0;background:transparent;padding:0;cursor:pointer;border-radius:22px;flex:none}.hav svg{display:block;border-radius:22px}
  .hwho{flex:1;min-width:0}.hhi{font-weight:900;font-size:22px;font-family:var(--nfont)}.hrank{color:var(--nmut);font-weight:800;font-size:13px;margin-top:2px}
  .hxp{height:10px;background:#e5e7eb;border-radius:6px;margin-top:8px;overflow:hidden}.hxp i{display:block;height:100%;background:linear-gradient(90deg,#ffc800,#ff9600);border-radius:6px}
  .hname{font-size:12px;color:var(--nred);font-weight:800;margin-top:6px}
  .hgoal{position:relative;width:72px;height:72px;flex:none;text-align:center;border:0;background:transparent;padding:0;cursor:pointer;font-family:var(--nfont);color:var(--nink)}.hgoal svg{position:absolute;inset:0}.hgoal b{display:block;padding-top:18px;font-size:20px;font-weight:900;line-height:1}.hgoal span{font-size:9.5px;color:var(--nmut);font-weight:800}
  .hlink{border:0;background:transparent;color:var(--nblue);font-weight:800;font-family:var(--nfont);cursor:pointer;padding:0 0 0 6px;font-size:12.5px}
  .hbar{display:flex;flex-wrap:wrap;gap:8px;align-items:center;justify-content:space-between;margin:10px 0 0}
  .hyears{display:flex;gap:4px;background:#e9ecf2;border-radius:14px;padding:3px;overflow-x:auto;max-width:100%}.hyears button{border:0;background:transparent;border-radius:11px;padding:7px 10px;font-family:var(--nfont);font-weight:800;font-size:13px;color:var(--nmut);cursor:pointer;white-space:nowrap}
  .hyears button.on{background:#fff;color:var(--nink);box-shadow:0 1px 3px rgba(0,0,0,.12)}
  .htools{display:flex;gap:6px}.hchip{border:2px solid var(--nline);border-bottom-width:4px;background:#fff;border-radius:14px;padding:7px 12px;font-family:var(--nfont);font-weight:800;font-size:13px;cursor:pointer;color:var(--nink)}
  .upnext{display:flex;align-items:center;gap:14px;width:100%;margin:12px 0 2px;border:0;border-radius:24px;padding:14px;background:linear-gradient(135deg,#58cc02,#3fa102);color:#fff;cursor:pointer;box-shadow:0 4px 0 #2f7d01;font-family:var(--nfont);text-align:left}
  .upnext:active{transform:translateY(3px);box-shadow:0 1px 0 #2f7d01}.upnext .ic{width:56px;height:56px;border-radius:16px;box-shadow:inset 0 -3px 0 rgba(0,0,0,.15)}
  .uptxt{flex:1}.uptxt small{display:block;font-weight:800;opacity:.9;font-size:12px;text-transform:uppercase;letter-spacing:1px}.uptxt b{font-size:20px;font-weight:900}
  .upgo{background:#fff;color:#3fa102;font-weight:900;border-radius:14px;padding:8px 14px;font-size:14px;letter-spacing:.6px}
  .path{display:flex;flex-direction:column;align-items:center;gap:4px;padding:6px 0 8px}
  .pnode{position:relative;transform:translateX(var(--off));display:flex;flex-direction:column;align-items:center;gap:3px;border:0;background:transparent;cursor:pointer;font-family:var(--nfont);color:var(--nink);padding:6px}
  .pnode .ic{width:64px;height:64px;border-radius:50%;box-shadow:inset 0 -5px 0 rgba(0,0,0,.18),0 4px 0 rgba(0,0,0,.12)}
  .pnode.cur .ic{width:78px;height:78px;outline:5px solid rgba(88,204,2,.35)}.pnode.done .ic{filter:saturate(1.1)}
  .pnode .nm{font-weight:800;font-size:12.5px}.pnode .pstart{position:absolute;top:-16px;background:#fff;color:#3fa102;border:2px solid var(--nline);border-radius:10px;padding:2px 8px;font-size:11px;font-weight:900;letter-spacing:.6px;animation:bob 1.4s ease-in-out infinite}
  @keyframes bob{50%{transform:translateY(-3px)}}
  .lv{display:flex;gap:3px}.lv i{width:9px;height:9px;border-radius:50%;background:#e5e7eb}.lv i.on{background:#ffc800}
  .hstats{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin:10px 0 4px}
  .hstats div{background:#fff;border-radius:18px;padding:8px 6px;text-align:center;box-shadow:0 2px 0 var(--nline)}.hstats span{font-size:18px}.hstats b{display:block;font-size:18px;font-weight:900}.hstats small{display:block;font-size:10px;color:var(--nmut);font-weight:800}
  .hsec{font-weight:900;font-size:13px;letter-spacing:1.2px;text-transform:uppercase;color:var(--nmut);margin:16px 4px 8px}
  .igrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(88px,1fr));gap:14px 10px}
  .itile{position:relative;display:flex;flex-direction:column;align-items:center;gap:6px;border:0;background:transparent;cursor:pointer;padding:4px 2px;font-family:var(--nfont);color:var(--nink)}
  .itile .ic{width:66px;height:66px;border-radius:18px;transition:transform .12s}
  .itile:hover .ic{transform:translateY(-2px)}.itile:active .ic{transform:scale(.94)}
  .itile .nm{font-size:12.5px;font-weight:800;line-height:1.15;text-align:center;max-width:96px}
  .itile .sb{font-size:10.5px;color:var(--nmut);font-weight:700;margin-top:-4px}
  .itile .mring{position:absolute;top:0;right:calc(50% - 40px);width:22px;height:22px}
  .ic{display:inline-grid;place-items:center;background:linear-gradient(160deg,var(--c1),var(--c2));box-shadow:inset 0 -3px 0 rgba(0,0,0,.14),0 3px 8px rgba(20,30,60,.15);flex:none}
  .ic svg{width:62%;height:62%}
  .tabbar{position:fixed;left:0;right:0;bottom:0;z-index:40;display:flex;justify-content:center;gap:4px;background:rgba(255,255,255,.94);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);border-top:1px solid var(--nline);padding:6px 10px calc(6px + env(safe-area-inset-bottom,0))}
  .tabbar button{flex:1;max-width:140px;border:0;background:transparent;display:flex;flex-direction:column;align-items:center;gap:1px;font-family:var(--nfont);font-weight:800;font-size:11px;color:var(--nmut);cursor:pointer;border-radius:12px;padding:4px 0}
  .tabbar button span{font-size:21px;filter:grayscale(.7);opacity:.75}.tabbar button.on{color:var(--nblue);background:#eaf7fe}.tabbar button.on span{filter:none;opacity:1}
  body.nui:not(.paper) main{padding-bottom:70px}
  body.nui:not(.paper) footer{display:none}
  /* avatar builder */
  .avb .avhead{display:flex;gap:16px;align-items:center;flex-wrap:wrap}.avbig svg{display:block;border-radius:30px;box-shadow:0 6px 18px rgba(0,0,0,.15)}
  .avcats{display:flex;gap:6px;overflow-x:auto;padding:12px 0 8px;scrollbar-width:none}.avcats::-webkit-scrollbar{display:none}
  .avcat{flex:none;display:flex;flex-direction:column;align-items:center;gap:2px;border:2px solid var(--nline);border-bottom-width:4px;background:#fff;border-radius:14px;padding:6px 10px;font-family:var(--nfont);font-weight:800;font-size:11.5px;cursor:pointer;color:var(--nink)}
  .avcat span{font-size:20px}.avcat.on{border-color:var(--nblue);background:#eaf7fe;color:#1482d1}
  .avpanel{max-height:46vh;overflow:auto;padding:2px}
  .avlab{font-weight:900;font-size:12px;letter-spacing:1px;text-transform:uppercase;color:var(--nmut);margin:10px 2px 6px}
  .avtiles{display:grid;grid-template-columns:repeat(auto-fill,minmax(78px,1fr));gap:8px}
  .avt{border:2px solid var(--nline);border-bottom-width:4px;background:#fff;border-radius:16px;padding:6px 4px 5px;display:flex;flex-direction:column;align-items:center;gap:3px;cursor:pointer;font-family:var(--nfont);font-weight:800;font-size:11px;color:var(--nink)}
  .avt svg{border-radius:14px}.avt.on{border-color:var(--ngreen);background:#eaffd9}.avt.locked{opacity:.5}
  .swrow{display:flex;flex-wrap:wrap;gap:7px}.swc{width:34px;height:34px;border-radius:50%;border:3px solid #fff;box-shadow:0 0 0 2px var(--nline);cursor:pointer}.swc.on{box-shadow:0 0 0 3px var(--nblue)}
  .avnote{font-size:12px;color:var(--nmut);margin:8px 2px 0}
  @media (max-width:620px){body.nui:not(.paper) .hud .rst{display:none}body.nui:not(.paper) .avbtn>span:last-child{display:none}body.nui:not(.paper) header h1{font-size:22px}body.nui:not(.paper) .hud .stat:not(:has(#snum)):not(:has(#xptxt)){display:none}.hstats small{font-size:9px}.igrid{grid-template-columns:repeat(4,1fr)}.itile .ic{width:58px;height:58px;border-radius:16px}body.nui:not(.paper) header .eye{display:none}}
  `;
  const st=document.createElement('style');st.textContent=css;document.head.appendChild(st);
  window.BlitzUI=UI;
})();
