/*blitz-stamp*/(window.BLITZ_FILES=window.BLITZ_FILES||{})["refs.js"]="20261031a";
// refs.js — reference tabs for Aural Blitz Years 7–12.
const _tbl=(heads,rows)=>`<div class="reftable"><table><tr>${heads.map(h=>`<th>${h}</th>`).join('')}</tr>${rows.map(r=>`<tr>${r.map(c=>`<td>${c}</td>`).join('')}</tr>`).join('')}</table></div>`;
const _y=y=>`<span class="ytag">Y${y}</span>`;
function refStrategy(){
  return `<p class="prompt">How to listen</p>
   <div class="refcard">Every excerpt can be played again. Use the first hearing for the <b>big picture</b> (fast or slow? bright or dark? how many beats?) and the second for the <b>detail</b>.</div>
   <div class="refhd">A routine for every question</div>
   ${_tbl(['Step','Do this'],[
     ['1 · Tap','Tap the beat with your finger. Count: where is the strong beat?'],
     ['2 · Hum','Hum the first note, then the last. Is the music going up or down? Does it come home?'],
     ['3 · Compare','Match what you hear to a tune you know (steps, leaps, intervals) or to a word (bright = major, dark = minor).'],
     ['4 · Decide','Pick your answer, check it, and read the "why". Wrong answers are where your ears learn fastest.']])}
   <div class="refhd">Writing rhythms and notes</div>
   <ul><li>Count the beats first. Each bar must add up: 4 crotchets in 4/4, 3 in 3/4, 2 in 2/4, 6 quavers in 6/8.</li>
   <li>Write the beats as stems first, then fill in how each beat splits.</li>
   <li>For pitch, think in <b>steps from the first note</b>: up one, down one, a leap to the 5th. The key signature tells you which notes are sharp or flat.</li></ul>
   <div class="refcard">The Reference and "How do I work this out?" never cost you anything. Use them, then try without.</div>`;
}
function refRhythm(){
  return `<p class="prompt">Rhythm, metre &amp; tempo</p>
   <div class="refhd">Time signatures</div>
   ${_tbl(['Metre','Beats a bar','Feel','Year'],[['2/4','2 crotchets','march — 1 2',_y(7)],['3/4','3 crotchets','waltz — 1 2 3',_y(7)],['4/4','4 crotchets','most songs; lighter accent on 3',_y(7)],['6/8','2 dotted crotchets (6 quavers in 3+3)','lilt, jig, rocking',_y(7)],['12/8','4 dotted crotchets','slow blues / shuffle',_y(9)],['9/8','3 dotted crotchets','compound triple',_y(10)],['5/4 · 7/8','irregular (3+2, 2+2+3)','uneven groups',_y(10)]])}
   <div class="refcard"><b>Simple or compound?</b> Clap the beat, then clap how it splits. In two = simple (2/4, 3/4, 4/4). In three = compound (6/8, 9/8, 12/8).</div>
   <div class="refhd">Note values</div>
   ${_tbl(['Note','Beats (crotchet = 1)','Rest','Year'],[['Semibreve','4','hangs from a line',_y(7)],['Minim','2','sits on a line',_y(7)],['Crotchet','1','squiggle',_y(7)],['Quaver pair','½ + ½ (beamed)','one flag',_y(7)],['Four semiquavers','¼ × 4 (double beam)','two flags',_y(7)],['Dotted minim','3 (a whole bar of 3/4; a whole bar of 6/8)','',_y(7)],['Dotted crotchet','1½ (one beat of 6/8)','',_y(7)],['Quaver + two semiquavers / two semiquavers + quaver','1','',_y(8)],['Dotted quaver + semiquaver','1','',_y(8)],['Quaver–crotchet–quaver (syncopated)','2','',_y(9)],['Crotchet triplet','3 in the time of 2','',_y(9)]])}
   <div class="refhd">Rhythm features</div>
   <ul><li><b>Pause</b> (fermata): hold the note longer. <b>Ostinato / riff</b>: a pattern repeated over and over. ${_y(7)}</li>
   <li><b>Anacrusis</b>: an upbeat before bar 1. <b>Tie</b>: joins two notes of the same pitch into one longer sound. <b>Syncopation</b>: accents off the beat. ${_y(8)}</li>
   <li><b>Swing</b>: quavers played long–short. ${_y(9)} <b>Augmentation / diminution</b>: a rhythm stretched / squashed. ${_y(10)}</li></ul>
   <div class="refhd">Tempo terms</div>
   ${_tbl(['Term','Means','About (bpm)','Year'],[['Largo','very slow, broad','40–60',_y(7)],['Adagio','slow','60–72',_y(7)],['Moderato','moderate','100–112',_y(7)],['Allegro','fast, lively','120–160',_y(7)],['Presto','very fast','170+',_y(7)],['Rallentando / ritardando','getting slower','',_y(8)],['Accelerando','getting faster','',_y(8)],['Andante','walking pace','76–96',_y(9)],['Allegretto','fairly fast','112–120',_y(9)],['Rubato / a tempo','flexible time / back to the speed','',_y(10)]])}`;
}
function refPitch(){
  const rows=Object.keys(IVL).map(k=>{const v=IVL[k];return [v.n,v.s,v.up||'',v.dn||'',_y(k==='P5'||k==='P8'?7:['m6','M6','m7','M7'].includes(k)?9:8)];});
  return `<p class="prompt">Pitch: steps, intervals, scales &amp; keys</p>
   <div class="refcard">A <b>step</b> moves to the next note; a <b>leap</b> jumps further. <b>Semitone</b> = the smallest step (two keys next to each other). <b>Tone</b> = two semitones. ${_y(7)}</div>
   <div class="refhd">Intervals</div>
   ${_tbl(['Interval','Semitones','Going up — sounds like','Going down','Year'],rows)}
   <div class="refhd">Scales</div>
   ${_tbl(['Scale','Notes','Sound','Year'],[['Major pentatonic','1 2 3 5 6','five notes, no semitones — folk, "black notes"',_y(7)],['Major (Ionian)','T T S T T T S','bright, complete, comes home',_y(7)],['Minor pentatonic','1 ♭3 4 5 ♭7','five notes, minor colour — rock riffs',_y(7)],['Natural minor (Aeolian)','T S T T S T T','darker; no leading note',_y(8)],['Harmonic minor','natural minor with a raised 7th','the big "exotic" step near the top',_y(9)],['Blues','1 ♭3 4 ♭5 5 ♭7','minor pentatonic plus the bent ♭5',_y(9)],['Melodic minor','raised 6 and 7 going up','almost major at the top',_y(10)],['Chromatic','every semitone','all twelve notes in a row',_y(10)]])}
   <div class="refhd">Keys</div>
   ${_tbl(['Year','Key signatures','Keys','Clefs'],[[_y(7),'up to 1 sharp / 1 flat','C, G, F major (A, E, D minor)','treble'],[_y(8),'up to 2 / 2','adds D and B♭ major (B, G minor)','treble and bass'],[_y(9),'up to 3 / 3','adds A and E♭ major (F♯, C minor)','treble and bass'],[_y(10),'4 or more','',' treble and bass']])}
   ${_tbl(['Order of sharps','F','C','G','D','A','E','B'],[['Order of flats','B','E','A','D','G','C','F']])}
   <div class="refcard">The <b>relative minor</b> shares the major key's signature and starts three semitones lower (C major ↔ A minor, G ↔ E, F ↔ D). ${_y(8)}</div>
   <div class="refhd">Tonality</div>
   <ul><li><b>Major</b> bright · <b>minor</b> dark · <b>pentatonic</b> open and folky. ${_y(7)}</li><li><b>Modulation</b>: the music changes key — to the relative major/minor. ${_y(9)}</li><li><b>Consonant</b> (agreeing: 3rds, 6ths, 5ths, octaves) vs <b>dissonant</b> (clashing: 2nds, 7ths, tritone). ${_y(10)}</li></ul>`;
}
function refChords(){
  return `<p class="prompt">Chords &amp; progressions</p>
   ${_tbl(['Chord','Built from','Sounds','Year'],[['Major triad','root + major 3rd + perfect 5th','bright, settled',_y(7)],['Minor triad','root + minor 3rd + perfect 5th','darker — the middle note is lower',_y(7)],['Dominant 7th (V7)','major triad + minor 7th','wants to resolve to I',_y(9)],['Inversions','the 3rd or 5th in the bass','same chord, different bottom note',_y(10)]])}
   <div class="refhd">Primary chords and Roman numerals</div>
   ${_tbl(['Numeral','In C major','In G major','In F major','Role','Year'],[['I','C','G','F','home (tonic)',_y(8)],['IV','F','C','B♭','away — "Amen" chord (subdominant)',_y(8)],['V','G','D','C','pulls back home (dominant)',_y(8)],['vi','Am','Em','Dm','minor cousin of I',_y(9)],['V7','G7','D7','C7','V with an extra pull',_y(9)],['ii','Dm','Am','Gm','leads to V',_y(10)]])}
   <div class="refcard">Upper case = major (I, IV, V), lower case = minor (ii, vi). Minor keys ${_y(9)}: i, iv, V (the V is still major so it pulls home).</div>
   <div class="refhd">Hearing a progression</div>
   <ul><li>Hum the <b>bass</b>. 1 is home; a jump up a 4th is IV; up a 5th (or down a 4th) is V.</li><li>Most songs cycle home → away → pull → home: I – IV – V – I, I – vi – IV – V.</li></ul>`;
}
function refTextureForm(){
  return `<p class="prompt">Texture, form &amp; devices</p>
   ${_tbl(['Texture','What you hear','Year'],[['Unison / monophonic','everyone plays the one tune (even in octaves)',_y(7)],['Homophonic','a tune with accompaniment (chords, bass) underneath',_y(7)],['Counter-melody / descant','a second tune running with the first',_y(8)],['Polyphonic','several independent tunes at once',_y(9)]])}
   <div class="refhd">Form</div>
   ${_tbl(['Form','Plan','Year'],[['Repetition and contrast','the same idea again (repetition) or something new (contrast)',_y(7)],['Call and response','a short phrase answered by another',_y(7)],['Binary','A B',_y(7)],['Ternary','A B A',_y(7)],['Verse–chorus','V C V C — the chorus is the hook',_y(7)],['Rondo','A B A C A',_y(7)],['Intro / outro, bridge, hook','the extras around the verses and choruses',_y(8)],['12-bar blues','I I I I · IV IV I I · V IV I I',_y(8)],['Theme and variations','A A¹ A² — the tune keeps its shape but changes dress',_y(8)],['Through-composed','A B C D — nothing returns',_y(10)],['Strophic','A A A — the same music for every verse',_y(10)]])}
   <div class="refhd">Devices</div>
   <ul><li><b>Drone / pedal</b>: a held or repeated bass note. <b>Ostinato / riff</b>: a short repeated pattern. ${_y(7)}</li><li><b>Sequence</b>: an idea repeated starting on a different note. ${_y(8)}</li><li><b>Augmentation</b> (longer), <b>diminution</b> (shorter), <b>inversion</b> (upside down), <b>rhythmic motif</b>. ${_y(10)}</li></ul>`;
}
function refExpression(){
  return `<p class="prompt">Dynamics &amp; articulation</p>
   ${_tbl(['Sign','Name','Means'],[['pp','pianissimo','very soft'],['p','piano','soft'],['mp','mezzo piano','moderately soft'],['mf','mezzo forte','moderately loud'],['f','forte','loud'],['ff','fortissimo','very loud']])}
   <div class="refcard">${_y(8)} <b>Crescendo</b> (cresc., &lt;) getting louder · <b>decrescendo / diminuendo</b> (dim., &gt;) getting softer.</div>
   <div class="refhd">Articulation</div>
   ${_tbl(['Term','Sign','Means','Year'],[['Legato','slur','smooth and joined',_y(7)],['Staccato','dot','short and detached',_y(7)],['Accent','>','that note is hit harder',_y(8)],['Sforzando','sfz','a sudden strong accent',_y(8)],['Trill, glissando, scoop, bend','','ornaments that decorate a note',_y(10)]])}`;
}
function refTimbre(){
  const byFam={};Object.keys(INSTR).forEach(k=>{const f=INSTR[k].fam;(byFam[f]=byFam[f]||[]).push(INSTR[k].name);});
  const tells={'Woodwind':'blown; breathy or reedy','Brass':'blown through a mouthpiece; bright and buzzy','Strings':'bowed; sustained and singing','Guitars':'plucked; quick decay','Keyboard':'struck strings; clear attack','Percussion':'struck; short'};
  const rows=Object.keys(byFam).map(f=>[`<b>${f}</b>`,tells[f]||'',byFam[f].join(', ')]);
  return `<p class="prompt">Instruments &amp; timbre</p>
   <div class="refcard"><b>Timbre</b> is tone colour. Ask how the sound is made — blown, bowed, plucked, struck, sung or electronic — then which family, then which instrument. ${_y(7)}</div>
   ${_tbl(['Family','Tell-tale sound','In this app'],rows)}
   <div class="refhd">Also in the curriculum</div>
   <ul><li>${_y(7)} Voice types (soprano, alto, tenor, bass) and ensembles (band, orchestra, choir, rock band).</li><li>${_y(8)} <b>Acoustic</b> (a real instrument) vs <b>electronic</b> (synthesiser, samples).</li><li>${_y(9)} How the sound is made; mutes, pedals, distortion.</li><li>${_y(10)} Idiomatic techniques: bowing, harmonics, vibrato, glissando, sticks and mallets, slap bass, filters and pedals.</li></ul>
   <div class="refnote">Samples: tonejs-instruments (CC-BY 3.0) — VSCO2, Freesound, Karoryfer, University of Iowa.</div>`;
}
function refChordsATAR(){
  const rows=Object.keys(CHORDQ).map(q=>{const c=CHORDQ[q];const names=['R','3','5','7','9'];const b=c.iv.map((iv,i)=>i===0?'R':(iv===3?'♭3':iv===4?'3':iv===6?'♭5':iv===7?'5':iv===8?'♯5':iv===9?'6':iv===10?'♭7':iv===11?'7':iv===14?'9':iv)).join(' – ');return [q,b,c.sym,c.cue];});
  return `<p class="prompt">Chords (ATAR)</p>
   ${_tbl(['Quality','Build','Symbols (on C)','Sound'],rows)}
   <div class="refhd">Inversions</div>
   ${_tbl(['Position','Bass note','Figured / letter','Sound'],[['Root position','root','5/3 · a','grounded, stable'],['1st inversion','3rd','6/3 · b','lighter, mobile'],['2nd inversion','5th','6/4 · c','least stable — cadential 6/4 leads to V']])}
   <div class="refhd">Roman numerals</div>
   <div class="refcard">Upper case = major (I, IV, V), lower case = minor (ii, iii, vi), ° = diminished (vii°), + = augmented (III+ in harmonic minor), ø = half-diminished (iiø7 in minor). Primary triads: I, IV, V. Secondary: ii, iii, vi, vii°.</div>
   ${_tbl(['Degree','Major key','Minor key (harmonic)'],[['1','I','i'],['2','ii','ii°'],['3','iii','III (III+)'],['4','IV','iv'],['5','V / V7','V / V7'],['6','vi','VI'],['7','vii°','vii°']])}`;
}
function refProgressions(){
  return `<p class="prompt">Progressions, cadences &amp; modulation (ATAR)</p>
   <div class="refcard"><b>Function:</b> Tonic (I, vi, iii) → Pre-dominant (IV, ii) → Dominant (V, V7, vii°) → Tonic. Most progressions you'll dictate follow this cycle: I – IV – V – I, I – vi – IV – V, I – ii – V7 – I.</div>
   ${_tbl(['Chord','Usually goes to','Listen for'],[
     ['I','anywhere','home; the bass sits on the tonic'],['ii','V, V7','minor chord a step above the tonic — "pre-dominant"'],['iii','vi, IV','rare; minor, and the bass is a 3rd above the tonic'],
     ['IV','V, I, ii','bass a 4th up (or 5th down); the "Amen" chord'],['V / V7','I, vi','bass a 5th up; the 7th adds pull'],['vi','ii, IV, V','minor; the deceptive landing after V']])}
   <div class="refhd">Cadences</div>
   ${_tbl(['Cadence','Chords','Effect','Bass moves'],[['Perfect (authentic)','V – I (V – i)','full stop','5 → 1'],['Plagal','IV – I (iv – i)','"Amen", gentle close','4 → 1'],['Imperfect (half)','? – V','comma, unfinished','→ 5'],['Interrupted (deceptive)','V – vi (V – VI)','surprise, avoids the ending','5 → 6']])}
   <div class="refhd">Modulation</div>
   ${_tbl(['Destination','From C major','Signpost'],[['Dominant','G major','F♯ appears (raised 4th) — the new leading note'],['Subdominant','F major','B♭ appears (flattened 7th)'],['Relative minor','A minor','G♯ appears (raised 5th) and the colour darkens'],['Relative major','(from A minor) C major','the G♯ disappears; it brightens']])}
   <div class="refcard">A modulation is confirmed by a <b>cadence in the new key</b> — one chromatic note alone could be a passing chromaticism. Pivot chords belong to both keys (in C → G, the chord C is I in C and IV in G).</div>`;
}
const REFS=[
  {id:'how',  name:'How to listen', render:refStrategy},
  {id:'rhy',  name:'Rhythm & tempo', render:refRhythm},
  {id:'pit',  name:'Pitch & scales', render:refPitch},
  {id:'kbd',  name:'Keyboard', render:()=>window.BlitzUI?BlitzUI.keyboardHtml():'', wire:r=>{if(window.BlitzUI)BlitzUI.wireKeyboard(r);}},
  {id:'chd',  name:'Chords',        render:refChords},
  {id:'chda', name:'Chords (ATAR)', render:refChordsATAR},
  {id:'prga', name:'Progressions & cadences', render:refProgressions},
  {id:'tex',  name:'Texture & form',render:refTextureForm},
  {id:'exp',  name:'Dynamics',      render:refExpression},
  {id:'tim',  name:'Instruments',   render:refTimbre},
];
