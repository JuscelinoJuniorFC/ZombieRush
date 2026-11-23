'use strict';
/* Áudio: usa os sons do usuário (sounds/*.mp3 embutidos) + síntese Web Audio */
const Aud=(()=>{
  let ctx=null,master,sfx,mus,revIn,noiseBuf,muted=false,buffers={},modes=[],tick=null,heli=null,loaded=false,alarmT=null,alarmStart=0;
  const R=Math.random;
  function unlock(){
    if(!ctx){
      try{ctx=new(window.AudioContext||window.webkitAudioContext)()}catch(e){return}
      master=ctx.createGain();master.gain.value=muted?0:.9;
      const comp=ctx.createDynamicsCompressor();comp.threshold.value=-14;comp.ratio.value=5;
      master.connect(comp);comp.connect(ctx.destination);
      sfx=ctx.createGain();sfx.gain.value=.9;sfx.connect(master);
      mus=ctx.createGain();mus.gain.value=.8;mus.connect(master);
      noiseBuf=ctx.createBuffer(1,ctx.sampleRate*2,ctx.sampleRate);const d=noiseBuf.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=R()*2-1;
      const conv=ctx.createConvolver(),len=ctx.sampleRate*2.6,ir=ctx.createBuffer(2,len,ctx.sampleRate);
      for(let ch=0;ch<2;ch++){const o=ir.getChannelData(ch);for(let i=0;i<len;i++)o[i]=(R()*2-1)*Math.pow(1-i/len,2.7)}
      conv.buffer=ir;revIn=ctx.createGain();revIn.gain.value=.5;revIn.connect(conv);const wet=ctx.createGain();wet.gain.value=.55;conv.connect(wet);wet.connect(master);
      tick=setInterval(()=>modes.forEach(m=>{if(m.alive)m.tick(m,ctx.currentTime)}),90);
      loadAll();
    }
    if(ctx.state==='suspended')ctx.resume();
  }
  async function loadAll(){
    if(loaded||typeof SND==='undefined')return;loaded=true;
    for(const k in SND){try{const b=atob(SND[k].split(',')[1]),u=new Uint8Array(b.length);for(let i=0;i<b.length;i++)u[i]=b.charCodeAt(i);buffers[k]=await ctx.decodeAudioData(u.buffer)}catch(e){}}
  }
  function now(){return ctx.currentTime}
  function sample(k,{v=.6,rate=1,pan=0,t=0,rev=.2,loop=false,dest}={}){
    if(!ctx||!buffers[k])return null;const s=ctx.createBufferSource();s.buffer=buffers[k];s.playbackRate.value=rate*(1+(R()-.5)*.06);s.loop=loop;
    const g=ctx.createGain();g.gain.value=v;let n=g;if(ctx.createStereoPanner){const p=ctx.createStereoPanner();p.pan.value=pan;g.connect(p);n=p}
    s.connect(g);n.connect(dest||sfx);if(rev){const r=ctx.createGain();r.gain.value=rev;n.connect(r);r.connect(revIn)}
    s.start(now()+t);return{s,g};
  }
  function nz(t0,dur,o){
    if(!ctx)return;o=o||{};const s=ctx.createBufferSource();s.buffer=noiseBuf;s.loop=true;
    const f=ctx.createBiquadFilter();f.type=o.type||'lowpass';f.frequency.setValueAtTime(o.f||1000,t0);if(o.f2)f.frequency.exponentialRampToValueAtTime(o.f2,t0+dur);f.Q.value=o.q||1;
    const g=ctx.createGain();g.gain.setValueAtTime(o.a?0.0001:(o.v||.3),t0);if(o.a)g.gain.linearRampToValueAtTime(o.v||.3,t0+o.a);g.gain.exponentialRampToValueAtTime(.0001,t0+dur);
    s.connect(f);f.connect(g);g.connect(o.dest||sfx);if(o.rev){const r=ctx.createGain();r.gain.value=o.rev;g.connect(r);r.connect(revIn)}
    s.start(t0,R()*1.5);s.stop(t0+dur+.05);
  }
  function tone(t0,dur,o){
    if(!ctx)return;o=o||{};const os=ctx.createOscillator();os.type=o.type||'sine';os.frequency.setValueAtTime(o.f||100,t0);if(o.f2)os.frequency.exponentialRampToValueAtTime(Math.max(20,o.f2),t0+dur);
    const g=ctx.createGain(),a=o.a||.005;g.gain.setValueAtTime(.0001,t0);g.gain.linearRampToValueAtTime(o.v||.2,t0+a);g.gain.exponentialRampToValueAtTime(.0001,t0+dur);
    let n=os;if(o.lp){const f=ctx.createBiquadFilter();f.type='lowpass';f.frequency.value=o.lp;os.connect(f);n=f}
    n.connect(g);g.connect(o.dest||sfx);if(o.rev){const r=ctx.createGain();r.gain.value=o.rev;g.connect(r);r.connect(revIn)}
    os.start(t0);os.stop(t0+dur+.05);return os;
  }
  /* ---------- música: modos ---------- */
  function startMode(name,init,tk,fade){
    if(!ctx)return null;stopMusic(1.6);
    const m={name,alive:true,bus:ctx.createGain(),nodes:[],next:now()+.2,beat:0,tick:tk,ints:0};
    m.bus.gain.value=0;m.bus.gain.linearRampToValueAtTime(1,now()+(fade||2.5));m.bus.connect(mus);init(m);modes.push(m);return m;
  }
  function stopMusic(fade){
    const f=fade||1.5;modes.forEach(m=>{if(!m.alive)return;m.alive=false;try{m.bus.gain.cancelScheduledValues(now());m.bus.gain.setValueAtTime(m.bus.gain.value,now());m.bus.gain.linearRampToValueAtTime(0,now()+f)}catch(e){}
      m.nodes.forEach(n=>{try{n.stop(now()+f+.1)}catch(e){}});setTimeout(()=>{try{m.bus.disconnect()}catch(e){}},f*1000+300)});
    modes=modes.filter(m=>m.alive);
  }
  function drone(m,f,type,v,lp,lfo){
    const o=ctx.createOscillator();o.type=type;o.frequency.value=f;const g=ctx.createGain();g.gain.value=v;let n=o;
    if(lp){const fl=ctx.createBiquadFilter();fl.type='lowpass';fl.frequency.value=lp;o.connect(fl);n=fl;if(lfo){const l=ctx.createOscillator();l.frequency.value=lfo;const lg=ctx.createGain();lg.gain.value=lp*.5;l.connect(lg);lg.connect(fl.frequency);l.start();m.nodes.push(l)}}
    n.connect(g);g.connect(m.bus);o.start();m.nodes.push(o);return o;
  }
  function windNoise(m,v){
    const s=ctx.createBufferSource();s.buffer=noiseBuf;s.loop=true;const f=ctx.createBiquadFilter();f.type='bandpass';f.frequency.value=420;f.Q.value=.7;
    const l=ctx.createOscillator();l.frequency.value=.11;const lg=ctx.createGain();lg.gain.value=260;l.connect(lg);lg.connect(f.frequency);
    const g=ctx.createGain();g.gain.value=v;s.connect(f);f.connect(g);g.connect(m.bus);s.start();l.start();m.nodes.push(s,l);
  }
  function ambient(){ // ondas 1-9: tenso, com pouca melodia + gemidos
    startMode('ambient',m=>{drone(m,55,'sine',.09,0,0);drone(m,82.4,'sine',.04,0,0);drone(m,110,'sawtooth',.012,260,.07);windNoise(m,.05);
      const s=sample('moans',{v:.1,loop:true,rev:.4,dest:m.bus});if(s)m.nodes.push(s.s);m.nextNote=now()+3},
    (m,t)=>{if(t>m.nextNote){const n=[220,261.6,329.6,293.7,246.9,196][(R()*6)|0];tone(t,5,{f:n,type:'triangle',v:.05,a:.03,rev:.8,lp:1400});m.nextNote=t+3.5+R()*5}
      if(t>(m.nextGroan||0)){m.nextGroan=t+9+R()*10;sample(['growl','moans'][(R()*2)|0],{v:.16,rate:.8+R()*.3,pan:R()*2-1,rev:.5,dest:m.bus})}});
  }
  function bossTheme(){
    startMode('boss',m=>{drone(m,55,'sawtooth',.05,180,.2);drone(m,41.2,'sine',.1,0,0);windNoise(m,.04);m.bpm=118;m.step=0},
    (m,t)=>{const spb=60/m.bpm/2;while(m.next<t+.25){const at=m.next,s=m.step%16;
        if(s%4===0){tone(at,.4,{f:130,f2:42,type:'sine',v:.5,dest:m.bus});nz(at,.06,{f:200,type:'lowpass',v:.12,dest:m.bus})}
        const notes=[55,55,65.4,55,58.3,55,73.4,65.4];if(s%2===0)tone(at,spb*1.7,{f:notes[(s/2)%8|0],type:'sawtooth',v:.16,lp:340,dest:m.bus,a:.01});
        if(s%8===4)nz(at,.2,{f:7000,type:'highpass',v:.07,dest:m.bus});
        if(s===14)tone(at,.7,{f:220,f2:880,type:'sawtooth',v:.03,lp:2400,a:.5,dest:m.bus,rev:.5});
        if(s===0&&m.step%32===0)sample('horde',{v:.18,rate:.9,rev:.5,dest:m.bus});
        m.next+=spb;m.step++}});
  }
  /* música sombria: decisão e fase final */
  function dread(level){
    const m=startMode('dread',m=>{
      drone(m,55,'sine',.13,0,0);drone(m,58.3,'sine',.1,0,0);drone(m,110,'sawtooth',.03,300,.06);drone(m,155.6,'sawtooth',.02,420,.09);
      m.pad=drone(m,233,'sawtooth',.012,500,.05);windNoise(m,.035);
      const s=sample('sad',{v:.5,loop:true,rate:.75,rev:.6,dest:m.bus});if(s){m.nodes.push(s.s);m.sad=s}
      m.level=level||.3;m.hb=now()+1;m.nextBell=now()+4;m.nextScrape=now()+7},
    (m,t)=>{
      const bpm=52+m.level*46,sp=60/bpm;
      if(t>m.hb){tone(m.hb,.22,{f:78,f2:40,type:'sine',v:.55,dest:m.bus});tone(m.hb+.18,.2,{f:66,f2:36,type:'sine',v:.4,dest:m.bus});m.hb+=sp}
      if(t>m.nextBell){const f=[329.6,311.1,246.9,207.7][(R()*4)|0];[1,2.76,5.4].forEach((r,i)=>tone(t,5,{f:f*r,type:'sine',v:.05/(i+1),a:.01,rev:.9,dest:m.bus}));m.nextBell=t+5+R()*5}
      if(t>m.nextScrape){nz(t,3.5,{f:300,f2:1400,type:'bandpass',q:9,v:.05,a:1.5,dest:m.bus,rev:.7});m.nextScrape=t+8+R()*8}
      if(m.level>.5&&t>(m.nextHit||0)){m.nextHit=t+sp*4;nz(t,.12,{f:9000,type:'highpass',v:.05*m.level,dest:m.bus});tone(t,.9,{f:110,f2:55,type:'sawtooth',v:.1*m.level,lp:240,dest:m.bus})}
    },3);
    return m;
  }
  function setIntensity(v){modes.forEach(m=>{if(m.name==='dread')m.level=v})}
  /* ---------- efeitos ---------- */
  const S={
    shot(w){if(!ctx)return;const t=now();
      if(w===0){nz(t,.09,{f:2400,type:'bandpass',q:.8,v:.4,rev:.15});tone(t,.1,{f:230,f2:70,type:'triangle',v:.35})}
      else if(w===1){nz(t,.34,{f:3000,f2:300,type:'lowpass',v:.7,rev:.35});tone(t,.28,{f:130,f2:38,type:'sawtooth',v:.5,lp:300});nz(t+.22,.07,{f:1200,type:'bandpass',v:.18})}
      else{nz(t,.07,{f:3200,type:'bandpass',q:.9,v:.3,rev:.12});tone(t,.08,{f:200,f2:80,type:'square',v:.2,lp:900})}},
    hit(){if(!ctx)return;nz(now(),.09,{f:500,type:'lowpass',v:.22});tone(now(),.08,{f:110,f2:60,v:.2})},
    zdie(){sample('death',{v:.7,rate:.85+R()*.4,pan:R()*.6-.3,rev:.25})},
    hurt(){sample('bite',{v:.9,rate:1,rev:.1});if(!ctx)return;const t=now();nz(t,.3,{f:900,f2:200,type:'lowpass',v:.35});tone(t,.5,{f:2200,type:'sine',v:.025,a:.05})},
    medkit(){if(!ctx)return;const t=now();[523,659,784].forEach((f,i)=>tone(t+i*.08,.3,{f,type:'triangle',v:.14,rev:.3}))},
    pick(){if(!ctx)return;const t=now();[392,494,587,784].forEach((f,i)=>tone(t+i*.06,.5,{f,type:'triangle',v:.12,rev:.5}))},
    ui(){if(!ctx)return;tone(now(),.12,{f:520,f2:380,type:'square',v:.06,lp:1500})},
    jump(){if(!ctx)return;nz(now(),.1,{f:1200,f2:400,type:'bandpass',v:.05})},
    roar(){sample('scream',{v:.95,rate:.55,rev:.5});if(!ctx)return;const t=now();tone(t,1.4,{f:70,f2:34,type:'sawtooth',v:.4,lp:260,rev:.4});nz(t,1.2,{f:900,f2:100,type:'lowpass',v:.4})},
    growl(){sample('growl',{v:.55,rate:.6+R()*.1,rev:.5})},
    slam(){if(!ctx)return;const t=now();tone(t,.7,{f:80,f2:26,type:'sine',v:.9});nz(t,.6,{f:700,f2:60,type:'lowpass',v:.6,rev:.3})},
    spit(){if(!ctx)return;const t=now();nz(t,.35,{f:1800,f2:500,type:'bandpass',q:2,v:.3});tone(t,.3,{f:300,f2:100,type:'sawtooth',v:.08,lp:600})},
    reload(d){if(!ctx)return;const t=now();nz(t,.05,{f:1800,type:'bandpass',q:3,v:.25});tone(t,.09,{f:180,f2:80,type:'square',v:.1,lp:700});nz(t+d*.55,.05,{f:2400,type:'bandpass',q:3,v:.25});tone(t+d*.55,.07,{f:260,f2:120,type:'square',v:.12,lp:900})},
    reloadEnd(){if(!ctx)return;const t=now();nz(t,.04,{f:1400,type:'bandpass',q:2,v:.35});tone(t,.07,{f:320,f2:130,type:'square',v:.16,lp:1200});nz(t+.1,.05,{f:2800,type:'highpass',v:.18})},
    cry(){sample('sad',{v:.5,rate:1.25+R()*.12,rev:.8,pan:.3});if(!ctx)return;const t=now();for(let i=0;i<4;i++){tone(t+i*.42,.34,{f:640+R()*60,f2:430,type:'triangle',v:.045,lp:1700,rev:.85,a:.04});nz(t+i*.42,.3,{f:1500,type:'bandpass',q:2,v:.03,a:.05,rev:.7})}},
    witchScream(){sample('scream',{v:1,rate:1.55,rev:.45});if(!ctx)return;const t=now();tone(t,1.3,{f:700,f2:1700,type:'sawtooth',v:.09,lp:3500,a:.15,rev:.5});tone(t+.1,1.1,{f:1050,f2:2300,type:'square',v:.04,lp:4200,a:.2,rev:.5});nz(t,1.3,{f:3000,f2:6000,type:'highpass',v:.22,a:.1,rev:.4});tone(t,1,{f:90,f2:50,type:'sine',v:.6})},
    witchRush(){if(!ctx)return;const t=now();nz(t,.9,{f:400,f2:2800,type:'bandpass',q:1.5,v:.3,a:.3,rev:.3});sample('scream',{v:.5,rate:1.9,rev:.3})},
    laugh(v){v=v||1;if(!ctx)return;const t=now();for(let i=0;i<5;i++){const f=520-i*28+R()*20;tone(t+i*.14,.12,{f:f,f2:f*.78,type:'sawtooth',v:.07*v,lp:1500,rev:.5,a:.01});tone(t+i*.14,.12,{f:f*1.5,f2:f*1.1,type:'square',v:.025*v,lp:2200,rev:.5,a:.01})}tone(t+.75,.5,{f:300,f2:190,type:'sawtooth',v:.06*v,lp:900,rev:.6,a:.05})},
    cough(){if(!ctx)return;const t=now();for(let i=0;i<4;i++){nz(t+i*.3,.18,{f:700,f2:300,type:'bandpass',q:1.2,v:.22,a:.02,rev:.3});tone(t+i*.3,.16,{f:150,f2:70,type:'sawtooth',v:.08,lp:600,rev:.3})}nz(t+1.25,.35,{f:300,f2:1200,type:'bandpass',q:1,v:.18,a:.2,rev:.3})},
    splat(){if(!ctx)return;nz(now(),.2,{f:700,f2:150,type:'lowpass',v:.4,rev:.2})},
    boom(){if(!ctx)return;const t=now();tone(t,1.8,{f:60,f2:24,type:'sine',v:1,rev:.4});nz(t,1.6,{f:1400,f2:80,type:'lowpass',v:.7,rev:.5});sample('scream',{v:.4,rate:.4,rev:.7})},
    thunder(){if(!ctx)return;const t=now();nz(t,.15,{f:6000,type:'highpass',v:.5});nz(t+.1,3.5,{f:500,f2:60,type:'lowpass',v:.8,a:.2,rev:.8});tone(t+.1,3,{f:48,f2:30,type:'sine',v:.5})},
    horde(){sample('horde',{v:.5,rev:.4})},
    sting(){if(!ctx)return;const t=now();[55,58.3,82.4].forEach(f=>tone(t,3,{f,type:'sawtooth',v:.12,lp:300,a:.02,rev:.7}));tone(t,2.4,{f:880,f2:300,type:'sine',v:.05,rev:.7})},
    ending(){if(!ctx)return;const t=now();[220,277.2,329.6,440,554.4].forEach((f,i)=>tone(t+i*.35,7,{f,type:'sine',v:.07,a:2.2,rev:.9}))}
  };
  /* ---------- helicóptero ---------- */
  function heliStart(){
    if(!ctx||heli)return;
    const bus=ctx.createGain();bus.gain.value=0;const pan=ctx.createStereoPanner?ctx.createStereoPanner():null;if(pan){bus.connect(pan);pan.connect(master)}else bus.connect(master);
    const rv=ctx.createGain();rv.gain.value=.3;bus.connect(rv);rv.connect(revIn);
    // pás: ruído filtrado modulado a ~11 Hz
    const n=ctx.createBufferSource();n.buffer=noiseBuf;n.loop=true;const bp=ctx.createBiquadFilter();bp.type='bandpass';bp.frequency.value=380;bp.Q.value=.9;
    const chop=ctx.createGain();chop.gain.value=.12;const lfo=ctx.createOscillator();lfo.type='sawtooth';lfo.frequency.value=11;const ld=ctx.createGain();ld.gain.value=.5;
    const sh=ctx.createWaveShaper();const cu=new Float32Array(256);for(let i=0;i<256;i++){const x=i/128-1;cu[i]=Math.max(0,x)}sh.curve=cu;lfo.connect(sh);sh.connect(ld);ld.connect(chop.gain);
    n.connect(bp);bp.connect(chop);const ng=ctx.createGain();ng.gain.value=1.3;chop.connect(ng);ng.connect(bus);
    // batida grave
    const th=ctx.createOscillator();th.type='sine';th.frequency.value=48;const tg=ctx.createGain();tg.gain.value=.0;const tl=ctx.createGain();tl.gain.value=.4;sh.connect(tl);tl.connect(tg.gain);th.connect(tg);tg.connect(bus);
    // turbina
    const e1=ctx.createOscillator();e1.type='sawtooth';e1.frequency.value=96;const ef=ctx.createBiquadFilter();ef.type='lowpass';ef.frequency.value=700;const eg=ctx.createGain();eg.gain.value=.06;e1.connect(ef);ef.connect(eg);eg.connect(bus);
    const e2=ctx.createOscillator();e2.type='sine';e2.frequency.value=1650;const e2g=ctx.createGain();e2g.gain.value=.008;e2.connect(e2g);e2g.connect(bus);
    [n,lfo,th,e1,e2].forEach(o=>o.start());
    heli={bus,pan,lfo,e1,e2,nodes:[n,lfo,th,e1,e2]};
  }
  function heliUpdate(level,p){if(!heli)return;const t=now();heli.bus.gain.setTargetAtTime(Math.max(0,level)*.95,t,.25);if(heli.pan)heli.pan.pan.setTargetAtTime(Math.max(-1,Math.min(1,p)),t,.2);heli.lfo.frequency.setTargetAtTime(10.5+level*2.2,t,.5);heli.e1.frequency.setTargetAtTime(90+level*20,t,.5)}
  function heliStop(){if(!heli)return;const h=heli;heli=null;h.bus.gain.setTargetAtTime(0,now(),.6);setTimeout(()=>h.nodes.forEach(n=>{try{n.stop()}catch(e){}}),2500)}
  function alarm(on){
    if(alarmT){clearInterval(alarmT);alarmT=null}
    if(!on||!ctx)return;
    const beep=()=>{const t=now();alarmStart=t;
      tone(t,.24,{f:1120,f2:860,type:'square',v:.03,lp:3200,rev:.45});tone(t+.28,.24,{f:860,f2:1120,type:'square',v:.03,lp:3200,rev:.45});
      tone(t+.56,.2,{f:790,f2:640,type:'square',v:.022,lp:2400,rev:.6});tone(t+.8,.2,{f:640,f2:790,type:'square',v:.022,lp:2400,rev:.6})};
    beep();alarmT=setInterval(beep,1100);
  }
  function alarmPh(){return alarmT&&ctx?((ctx.currentTime-alarmStart)%1.1+1.1)%1.1:-1}
  function mute(){muted=!muted;if(master)master.gain.value=muted?0:.9;return muted}
  return{unlock,ambient,bossTheme,dread,setIntensity,stopMusic,S,heliStart,heliUpdate,heliStop,mute,alarm,alarmPh,get ready(){return !!ctx}};
})();
