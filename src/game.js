'use strict';
/* ZOMBIE RUSH — cenas Phaser 3 (WebGL). Arte procedural em assets.js, áudio em audio.js */
const WEAPONS=[
  {name:'PISTOLA',rate:.30,dmg:1,pellets:1,spread:.025,spd:1700,life:.7,kb:40,auto:true},
  {name:'ESPINGARDA',rate:.78,dmg:1.05,pellets:7,spread:.2,spd:1450,life:.32,kb:55,auto:false},
  {name:'METRALHADORA',rate:.085,dmg:.62,pellets:1,spread:.07,spd:1900,life:.75,kb:14,auto:true}];
const ZT=[ // 0 andarilho, 1 corredor, 2 brutamontes
  {hp:3,spd:[52,72],sc:.95,dmg:1,pts:10,drop:.07},{hp:2,spd:[120,160],sc:.9,dmg:1,pts:15,drop:.07},{hp:11,spd:[40,50],sc:1.18,dmg:2,pts:40,drop:.3},
  {hp:1.4,spd:[135,165],sc:.95,dmg:0,pts:30,drop:.15},{hp:5,spd:[36,48],sc:1.0,dmg:1,pts:35,drop:.15}];
const UPG=[
  {id:'dmg',max:5,t:'CALIBRE PESADO',d:'+20% de dano em todas as armas.'},
  {id:'rate',max:4,t:'GATILHO LEVE',d:'+12% de cadência de tiro.'},
  {id:'mag',max:5,t:'PENTE ESTENDIDO',d:'+2 munições em todos os pentes.'},
  {id:'rel',max:3,t:'RECARGA RÁPIDA',d:'Recarrega 22% mais rápido.'},
  {id:'pierce',max:3,t:'BALAS PERFURANTES',d:'Os tiros atravessam +1 zumbi (cada um leva 70% do dano anterior).'},
  {id:'hp',max:3,t:'COLETE REFORÇADO',d:'+1 coração máximo e cura total.'},
  {id:'spd',max:4,t:'BOTAS DE CORRIDA',d:'+8% de velocidade de movimento.'},
  {id:'inv',max:3,t:'ADRENALINA',d:'+0,4s de invulnerabilidade ao ser ferido.'},
  {id:'vamp',max:2,t:'SEDE DE SANGUE',d:'A cada 12 abates recupera 1 coração (nível 2: a cada 8).'},
  {id:'heal',max:99,t:'KIT DE EMERGÊNCIA',d:'Recupera todos os corações.'}];
const AMMO=[12,6,25],RELT=[1.15,1.9,1.6];
const DIFF=[
  {n:'FÁCIL',hp:1.0,spd:1.0,cnt:1.0,iv:1.0,boss:1.1,start:6,heal:1,drop:1.0,atk:.95},
  {n:'NORMAL',hp:1.3,spd:1.1,cnt:1.3,iv:.85,boss:1.6,start:5,heal:1,drop:.8,atk:.8},
  {n:'PESADELO',hp:1.75,spd:1.22,cnt:1.7,iv:.7,boss:2.3,start:4,heal:0,drop:.55,atk:.65}];
const PX0=150,PX1=1225;

class Boot extends Phaser.Scene{
  constructor(){super('Boot')}
  create(){
    this.cameras.main.setBackgroundColor('#07090d');
    this.add.text(W/2,H/2,'carregando a cidade…',{fontFamily:FONT_SERIF,fontSize:'30px',color:'#9a2020'}).setOrigin(.5);
    this.time.delayedCall(60,()=>{buildAssets(this);buildAssets2(this);buildRealism(this);this.textures.addCanvas('shaft',drawShaft());this.scene.start('Main')});
  }
}

class Main extends Phaser.Scene{
  constructor(){super('Main')}
  create(){
    const S=this;S.st='title';S.slow=1;S.t=0;S.paused=false;
    S.touch=('ontouchstart' in window)||navigator.maxTouchPoints>0;
    S.keys=S.input.keyboard.addKeys('A,D,W,SPACE,LEFT,RIGHT,UP,J,Z,X,K,ONE,TWO,THREE,P,M,ENTER,E,C,R,F');
    S.input.addPointer(3);
    {const c=document.createElement('canvas');c.width=c.height=64;const x=c.getContext('2d'),Rn=mk(77);x.translate(32,32);x.beginPath();
      for(let i=0;i<11;i++){const a=i/11*TAU,r=23+Rn()*9;i?x.lineTo(Math.cos(a)*r,Math.sin(a)*r):x.moveTo(Math.cos(a)*r,Math.sin(a)*r)}x.closePath();
      const g=x.createRadialGradient(-9,-11,3,0,0,34);g.addColorStop(0,'#9a958a');g.addColorStop(.55,'#5a574f');g.addColorStop(1,'#1f1d19');x.fillStyle=g;x.fill();x.strokeStyle='#12100d';x.lineWidth=2.5;x.stroke();
      x.strokeStyle='rgba(15,12,10,.7)';x.lineWidth=1.6;for(let i=0;i<4;i++){x.beginPath();x.moveTo((Rn()-.5)*30,(Rn()-.5)*30);x.lineTo((Rn()-.5)*40,(Rn()-.5)*40);x.stroke()}
      x.fillStyle='rgba(120,8,8,.55)';for(let i=0;i<5;i++){x.beginPath();x.arc((Rn()-.5)*30,(Rn()-.5)*30,1.5+Rn()*3,0,TAU);x.fill()}
      S.textures.addCanvas('rock',c)}
    /* cenário */
    S.bg=[['sky',0,0],['far',1,.025],['mid',2,.05],['street',3,.09]].map(a=>({im:S.add.image(W/2,H/2,a[0]).setDepth(a[1]),k:a[2]}));
    S.props=[
      S.add.image(780,606,'car1').setOrigin(.5,1).setDepth(4),S.add.image(1130,606,'car2').setOrigin(.5,1).setDepth(4),
      S.add.image(340,606,'lamp').setOrigin(.5,1).setDepth(5),S.add.image(1010,606,'lampDead').setOrigin(.5,1).setDepth(5),
      S.add.image(70,664,'barricade').setOrigin(.5,1).setDepth(6)];
    S.redGlow=S.add.image(W/2,H/2,'glowR').setDepth(3.2).setScale(6,3.2).setBlendMode(Phaser.BlendModes.ADD).setAlpha(0);
    S.lampG=[[372,198],[1050,198]].map(a=>S.add.image(a[0],a[1],'glowW').setDepth(302).setScale(.9).setBlendMode(Phaser.BlendModes.ADD).setAlpha(0));
    S.lampS=[{v:1,next:0},{v:0,next:0}];
    S.carG=[[640,556],[920,556],[1000,546],[1260,546]].map(a=>S.add.image(a[0],a[1],'glowW').setDepth(302).setScale(.5).setTint(0xff7a10).setBlendMode(Phaser.BlendModes.ADD).setAlpha(0));
    S.carR=[[780,520],[1130,510]].map(a=>S.add.image(a[0],a[1],'glowR').setDepth(302).setScale(2.4,1.4).setBlendMode(Phaser.BlendModes.ADD).setAlpha(0));
    S.sceneK=0;S.sl=[];S.alarmOn=false;S.rocks=[];S.tankN=0;S.flkNext=3;S.flkEnd=0;S.flkV=1;S.flkTick=0;
    S.fore=S.add.image(W/2,H+10,'fore').setOrigin(.5,1).setDepth(218);
    S.beam=S.add.image(0,0,'cone').setOrigin(0,.5).setDepth(209).setBlendMode(Phaser.BlendModes.ADD).setTint(0xffe2a8).setAlpha(0).setVisible(false);
    S.pools=[[352,GY+14],[1042,GY+14]].map(a=>S.add.image(a[0],a[1],'pool').setDepth(302).setScale(1.7,.3).setBlendMode(Phaser.BlendModes.ADD).setAlpha(0));
    S.wGlow=S.add.image(0,0,'glowR').setDepth(163).setScale(.8).setBlendMode(Phaser.BlendModes.ADD).setAlpha(0);S.witch=null;
    S.laser=S.add.graphics().setDepth(305).setBlendMode(Phaser.BlendModes.ADD);
    S.laserDot=S.add.image(0,0,'glowR').setDepth(306).setScale(.2).setBlendMode(Phaser.BlendModes.ADD).setVisible(false);
    S.fog=S.add.tileSprite(0,420,W,256,'fog').setOrigin(0).setDepth(220).setAlpha(.5);
    S.dark=S.add.renderTexture(0,0,W,H).setOrigin(0).setDepth(300);
    S.lp=[];for(let i=0;i<24;i++)S.lp.push(S.make.image({x:0,y:0,key:'light',add:false}));
    S.vig=S.add.image(W/2,H/2,'vign').setDepth(310).setAlpha(0);
    S.flashR=S.add.rectangle(W/2,H/2,W,H,0xffffff).setDepth(320).setAlpha(0);
    S.grain=S.add.tileSprite(0,0,W,H,'grain').setOrigin(0).setDepth(330).setAlpha(.05).setBlendMode(Phaser.BlendModes.OVERLAY);
    /* chuva e cinzas */
    S.rain=[];for(let i=0;i<150;i++){const d=S.add.image(Math.random()*W,Math.random()*H,'drop').setDepth(225).setAlpha(.28+Math.random()*.3).setAngle(10);d.sp=800+Math.random()*500;S.rain.push(d)}
    S.ash=[];for(let i=0;i<46;i++){const d=S.add.image(Math.random()*W,Math.random()*H,'dot').setDepth(226).setScale(.12+Math.random()*.2).setTint(0xff8a3a).setAlpha(0).setBlendMode(Phaser.BlendModes.ADD);d.sp=20+Math.random()*40;d.ph=Math.random()*9;S.ash.push(d)}
    /* jogador */
    S.pl={x:420,y:GY,vx:0,vy:0,hp:5,max:5,inv:0,dir:1,w:0,own:[true,false,false],ammo:[12,6,25],mag:0,rel:0,relTot:1,relMul:1,pierce:0,vamp:0,fire:0,kick:0,rt:0,dmg:1,rate:1,spd:1,invT:1,aim:0,dead:false,mouseT:-9,hide:false};
    S.plSh=S.add.image(S.pl.x,GY,'shadow').setDepth(7).setScale(.9,.3);
    S.plS=S.add.sprite(0,0,'ply',0).setOrigin(70/PW,158/PH).setDepth(160);
    S.arm=S.add.sprite(0,0,'arm0').setOrigin(24/AW,44/AH).setDepth(161);
    /* iluminação dinâmica com normal maps */
    patchLightFlip();S.lights.enable().setAmbientColor(0x8d929e);
    S.bg.slice(1).forEach(b=>S.lit(b.im));S.props.forEach(o=>S.lit(o));S.lit(S.plS);S.lit(S.arm);
    const AL=(c,r,i)=>S.lights.addLight(-999,-999,r,c,i);
    S.LT={lamp0:AL(0xffc27a,620,1.7),lamp1:AL(0xffc27a,560,1.5),fl1:AL(0xfff0d0,330,1.6),fl2:AL(0xffe6c0,520,1.1),muz:AL(0xffb050,420,0),
      al0:AL(0xff8a20,340,0),al1:AL(0xff8a20,340,0),boss:AL(0xff4030,520,0),witch:AL(0xb8d4ff,300,0),sky:AL(0xcfe0ff,1800,0),heli:AL(0xfff4d8,700,0),body:AL(0xffe0b0,160,.5)};
    /* reflexos na rua molhada */
    S.reflC=S.add.container(0,0).setDepth(3.6).setAlpha(.55);S.refl=[];
    if(!S.textures.exists('reflMask')){const c=document.createElement('canvas');c.width=W;c.height=140;const x=c.getContext('2d'),g=x.createLinearGradient(0,0,0,140);g.addColorStop(0,'rgba(0,0,0,1)');g.addColorStop(.45,'rgba(0,0,0,.45)');g.addColorStop(1,'rgba(0,0,0,0)');x.fillStyle=g;x.fillRect(0,0,W,140);S.textures.addCanvas('reflMask',c)}
    S.reflM=S.make.image({x:W/2,y:GY-12,key:'reflMask',add:false}).setOrigin(.5,0);S.reflC.setMask(S.reflM.createBitmapMask());
    S.addRefl(S.plS,()=>GY);S.addRefl(S.arm,()=>GY);
    /* fachos volumétricos dos postes */
    S.shafts=[[372,204],[1050,204]].map(a=>S.add.image(a[0],a[1],'shaft').setOrigin(.5,0).setDepth(216).setBlendMode(Phaser.BlendModes.ADD).setAlpha(0));
    S.rainF=[];for(let i=0;i<34;i++){const d=S.add.image(Math.random()*W,Math.random()*H,'drop').setDepth(228).setScale(2.2,3).setAlpha(.1+Math.random()*.08).setAngle(10);d.sp=1700+Math.random()*600;S.rainF.push(d)}
    S.flash=S.add.image(0,0,'flash').setDepth(230).setBlendMode(Phaser.BlendModes.ADD).setAlpha(0);
    /* listas */
    S.zs=[];S.globs=[];S.acids=[];S.bl=[];S.pk=[];S.ps=[];S.sp=[];S.shock=[];S.biles=[];S.boss=null;S.ui=[];S.cnt={kills:0,score:0};S.decals=[];
    S.diff=DIFF[1];S.lv={};S.vk=0;S.relA=0;S.wave=0;S.spawnLeft=0;S.spawnT=0;S.waveActive=false;S.darkPhase=false;S.darkA=.5;S.darkTarget=.5;S.gameT=0;S.lightning=8;S.heli=null;S.hurtShake=0;
    /* HUD */
    const hd=410;S.hud=[];
    S.facePic=S.add.image(68,64,'face0').setDepth(hd+1);S.hud.push(S.facePic);
    S.hpG=S.add.graphics().setDepth(hd);S.hud.push(S.hpG);
    S.hpLbl=S.T(126,32,'',19,'#5ef08a',{o:[0,.5],d:hd+1,st:3});S.hud.push(S.hpLbl);
    S.ecg=new Array(118).fill(0);S.ecgPh=0;S.ecgAcc=0;S.hpSh=1;S.hpLag=1;S.hpFlash=0;S.lastHp=-1;
    S.wIcon=S.add.image(86,H-56,'icon0').setDepth(hd).setScale(.8);S.hud.push(S.wIcon);
    S.wTxt=S.T(150,H-72,'',22,'#e8e2d4',{o:[0,.5],d:hd});S.wSlots=S.T(150,H-44,'',17,'#8c8678',{o:[0,.5],d:hd});
    S.ammoTxt=S.T(430,H-58,'',34,'#f1e6c8',{o:[0,.5],d:hd});S.relBar=S.add.graphics().setDepth(406);
    S.waveTxt=S.T(W-30,32,'',26,'#e8e2d4',{o:[1,.5],d:hd});S.scoreTxt=S.T(W-30,62,'',18,'#a9a290',{o:[1,.5],d:hd});
    S.bossBar=S.add.graphics().setDepth(hd);S.bossTxt=S.T(W/2+40,22,'',20,'#e6c9c0',{d:hd});
    S.muteTxt=S.T(W-30,H-24,'M: som   P: pausa',14,'#6e6a5e',{o:[1,.5],d:hd});
    S.banner=S.T(W/2,210,'',64,'#d9d2c0',{d:440,font:FONT_SERIF,st:8});S.bannerSub=S.T(W/2,268,'',24,'#b9b2a0',{d:440});
    S.hud.push(S.ammoTxt,S.wTxt,S.wSlots,S.waveTxt,S.scoreTxt,S.bossBar,S.bossTxt,S.muteTxt);S.showHud(false);
    if(S.touch)S.mkTouch();
    S.input.on('pointermove',p=>{if(!S.touch)S.pl.mouseT=S.t});
    S.input.on('pointerdown',p=>{Aud.unlock();if(S.st==='title'&&!S.cards)S.chooseDiff()});
    try{const fx=S.cameras.main.postFX;if(fx&&S.renderer.type===Phaser.WEBGL){
      S.fxBloom=fx.addBloom(0xffffff,1,1,.7,.35,4)}
      S.cameras.main.setPostPipeline(GradeFX);S.grade=S.cameras.main.getPostPipeline(GradeFX);if(Array.isArray(S.grade))S.grade=S.grade[0];}catch(e){console.log('postFX',e.message)}
    S.grain.setAlpha(0);
    S.title();
    window.ZR=S;window.ready=true;
  }
  T(x,y,s,sz,col,o){o=o||{};const t=this.add.text(x,y,s,{fontFamily:o.font||FONT_UI,fontSize:sz+'px',color:col,align:o.al||'center',stroke:o.sc||'#050505',strokeThickness:o.st===undefined?4:o.st,lineSpacing:o.ls||4,wordWrap:o.w?{width:o.w}:undefined});t.setOrigin(...(o.o||[.5,.5])).setDepth(o.d||400);t.setResolution(2);return t}
  showHud(v){this.hud.forEach(h=>h.setVisible(v));if(!v){this.banner.setText('');this.bannerSub.setText('')}}
  mkTouch(){
    const S=this;S.tc={l:0,r:0,j:0,f:0,rl:0};
    const b=(x,y,r,lab,k)=>{const c=S.add.circle(x,y,r,0xffffff,.1).setStrokeStyle(3,0xffffff,.35).setDepth(420).setInteractive();S.T(x,y,lab,30,'#ffffff',{d:421,st:0}).setAlpha(.6);
      c.on('pointerdown',()=>{S.tc[k]=1;Aud.unlock()});c.on('pointerup',()=>S.tc[k]=0);c.on('pointerout',()=>S.tc[k]=0)};
    b(90,H-130,52,'◀','l');b(230,H-130,52,'▶','r');b(W-250,H-130,52,'⤒','j');b(W-110,H-130,62,'●','f');b(W-370,H-110,38,'R','rl');
  }
  /* ---------- partículas simples ---------- */
  lit(o){if(o&&o.setPipeline)o.setPipeline('Light2D');return o}
  addRefl(src,base){const S=this;const im=S.add.sprite(0,0,src.texture.key,src.frame.name).setTint(0xaab8cc);S.reflC.add(im);S.refl.push({src,im,base})}
  updRefl(){
    const S=this;
    for(let i=S.refl.length-1;i>=0;i--){const r=S.refl[i],s=r.src;
      if(!s.active||!s.scene){r.im.destroy();S.refl.splice(i,1);continue}
      const b=r.base();
      if(r.im.texture.key!==s.texture.key||r.im.frame.name!==s.frame.name)r.im.setTexture(s.texture.key,s.frame.name);
      r.im.setOrigin(s.originX,s.originY).setPosition(s.x,2*b-s.y).setScale(s.scaleX,-s.scaleY).setRotation(-s.rotation).setAlpha(s.visible?s.alpha:0)}
  }
  fx(tex,x,y,o){
    const n=o.n||1;for(let i=0;i<n&&this.ps.length<520;i++){
      const a=(o.ang?o.ang[0]+Math.random()*(o.ang[1]-o.ang[0]):Math.random()*TAU),s=o.spd?o.spd[0]+Math.random()*(o.spd[1]-o.spd[0]):0;
      const im=this.add.image(x,y,tex).setDepth(o.d||200);if(o.add)im.setBlendMode(Phaser.BlendModes.ADD);if(o.tint)im.setTint(o.tint);
      const sc=o.sc?o.sc[0]+Math.random()*(o.sc[1]-o.sc[0]):1;im.setScale(sc);
      this.ps.push({im,vx:Math.cos(a)*s,vy:Math.sin(a)*s,g:o.g||0,l:o.life||.6,L:o.life||.6,a:o.a===undefined?1:o.a,rot:o.rot?(Math.random()-.5)*o.rot:0,grow:o.grow||0,sc});
    }
  }
  updFx(dt){
    for(let i=this.ps.length-1;i>=0;i--){const p=this.ps[i];p.l-=dt;if(p.l<=0){p.im.destroy();this.ps.splice(i,1);continue}
      p.vy+=p.g*dt;p.im.x+=p.vx*dt;p.im.y+=p.vy*dt;p.im.rotation+=p.rot*dt;p.im.setAlpha(p.a*Math.min(1,p.l/p.L*1.6));if(p.grow)p.im.setScale(p.sc+p.grow*(1-p.l/p.L));
      if(p.g>300&&p.im.y>GY+12){p.im.y=GY+12;p.vy*=-.2;p.vx*=.6}}
  }
  blood(x,y,n,dirx){
    this.fx('chunk',x,y,{n,spd:[80,420],ang:dirx>0?[-2.6,-.4]:[-2.74,-.54],g:1100,life:.9,sc:[.6,1.3],rot:14,d:190});
    this.fx('dot',x,y,{n:Math.ceil(n/2),spd:[20,160],tint:0x7a0c0c,sc:[.4,1],life:.4,g:300,d:190});
  }
  decal(x,y,sc){
    const d=this.add.image(x,y,'splat'+((Math.random()*3)|0)).setDepth(7.5).setAlpha(.8).setScale(sc||1,.55).setFlipX(Math.random()<.5);this.decals.push(d);
    if(this.decals.length>45){const o=this.decals.shift();this.tweens.add({targets:o,alpha:0,duration:400,onComplete:()=>o.destroy()})}
  }
  shake(i,d){this.cameras.main.shake(d||160,i||.004)}
  /* ---------- título ---------- */
  title(){
    const S=this;S.st='title';S.clearUi();
    S.tImg=S.add.image(W/2,200,'blood_title').setDepth(450).setScale(.85);S.ui.push(S.tImg);
    S.ui.push(S.T(W/2,370,'sobreviva às ondas. derrote o chefe. decida seu destino.',24,'#b6ae9a',{d:450}));
    S.tStart=S.T(W/2,470,S.touch?'TOQUE PARA COMEÇAR':'CLIQUE OU APERTE ENTER PARA COMEÇAR',30,'#e8d8c0',{d:450,font:FONT_SERIF});S.ui.push(S.tStart);
    S.tweens.add({targets:S.tStart,alpha:.25,duration:900,yoyo:true,repeat:-1});
    S.ui.push(S.T(W/2,585,'A/D ou ←/→ mover   ·   W / ↑ / ESPAÇO pular   ·   J ou clique atirar (mouse mira)   ·   R recarregar   ·   1 2 3 trocar arma',17,'#8c8678',{d:450}));
    S.ui.push(S.T(W/2,615,'P pausa   ·   M som',17,'#8c8678',{d:450}));
    S.darkTarget=.55;
  }
  clearUi(){this.ui.forEach(u=>{try{u.destroy()}catch(e){}});this.ui=[];this.cards=null}
  chooseDiff(){
    const S=this;S.st='title';S.clearUi();Aud.unlock();S.darkTarget=.6;
    S.showCards('ESCOLHA A DIFICULDADE','Muda a vida inicial, a quantidade e a força dos zumbis e a vida do chefe.',[
      {t:'FÁCIL',d:'6 corações. Zumbis mais fracos e em menor número. Cura entre ondas.',k:1,accent:0x6fa070,fn:()=>S.startGame(0)},
      {t:'NORMAL',d:'5 corações. Zumbis resistentes e numerosos. Desafio justo.',k:2,accent:0xc89a3a,fn:()=>S.startGame(1)},
      {t:'PESADELO',d:'4 corações. Hordas enormes, zumbis rápidos e duros. Pouca cura.',k:3,accent:0xa02020,fn:()=>S.startGame(2)}]);
  }
  startGame(d){
    const S=this;S.diff=DIFF[d===undefined?1:d];S.lv={};S.vk=0;if(S.st!=='title'&&S.st!=='over'&&S.st!=='win')return;Aud.unlock();
    // reinicia o estado
    S.clearUi();S.zs.forEach(z=>S.killZ(z,true));S.zs=[];S.bl.forEach(b=>b.im.destroy());S.bl=[];S.pk.forEach(p=>p.im.destroy());S.pk=[];S.shock.forEach(s=>s.im.destroy());S.shock=[];S.biles.forEach(s=>s.im.destroy());S.biles=[];S.globs.forEach(g=>g.im.destroy());S.globs=[];S.acids.forEach(a=>a.im.destroy());S.acids=[];S.clearClg();
    if(S.boss){S.boss.im.destroy();S.boss.sh.destroy();S.boss=null}
    if(S.heli){S.heli.forEach(o=>o.destroy());S.heli=null}S.hv=null;if(S.witch){S.witch.im.destroy();S.witch.sh.destroy();S.witch=null}S.wGlow.setAlpha(0);Aud.heliStop();Aud.alarm(false);S.alarmOn=false;S.rocks.forEach(r=>r.im.destroy());S.rocks=[];S.tankN=0;S.flkNext=3;S.flkEnd=0;S.zs.forEach(z=>{if(z.rockIm)z.rockIm.destroy()});
    Object.assign(S.pl,{x:420,y:GY,vx:0,vy:0,hp:S.diff.start,max:S.diff.start,inv:0,dir:1,w:0,own:[true,false,false],ammo:[12,6,25],mag:0,rel:0,relMul:1,pierce:0,vamp:0,fire:0,kick:0,dmg:1,rate:1,spd:1,invT:1,dead:false,hide:false});
    S.plS.setAlpha(1).setAngle(0).setVisible(true);S.arm.setVisible(true);S.plSh.setVisible(true);S.slow=1;S.tweens.timeScale=1;S.time.timeScale=1;
    S.cnt={kills:0,score:0};S.wave=0;S.darkPhase=false;S.gameT=0;S.darkTarget=.5;S.showHud(true);S.fog.setAlpha(.5);
    Aud.stopMusic(.6);Aud.ambient();
    S.nextWave();
  }
  /* ---------- ondas ---------- */
  nextWave(){
    const S=this;S.wave++;S.st='play';
    if(S.wave===10){S.startBoss();return}
    if(S.wave===16){S.startWitch();return}
    const D=S.diff,n=S.wave,dk=n>10,k=dk?n-10:0;
    S.spawnLeft=Math.round((dk?14+k*4:5+n*3)*D.cnt);S.spawnT=1.4;S.waveActive=true;S.interval=Math.max(.32,((dk?1.1:1.7)-n*.06)*D.iv);S.hpMul=D.hp*(1+(n-1)*.06)*(dk?1+k*.14:1);S.total=S.spawnLeft;
    S.say(dk?'ONDA '+n:'ONDA '+n,dk?'a escuridão não vai acabar':(n===9?'a última antes do chefe…':'prepare-se'));
    S.setMood();
  }
  setMood(){
    const S=this;
    S.darkTarget=S.darkPhase?.86:(S.wave>=10?.7:.56+Math.min(.12,S.wave*.012));
    S.fog.setAlpha(S.darkPhase?.8:.5);
  }
  say(a,b){const S=this;S.banner.setText(a).setAlpha(0);S.bannerSub.setText(b||'').setAlpha(0);S.tweens.add({targets:[S.banner,S.bannerSub],alpha:1,duration:300,yoyo:true,hold:1400})}
  spawnZ(type,x,hpMul){
    const S=this,c=ZT[type],lane=((Math.random()*5)|0)*4-8,sc=c.sc*(.97+Math.random()*.06);
    const im=S.add.sprite(x||W+110,GY+lane,'zomb'+type,0).setOrigin(95/ZW,188/ZH).setScale(-sc,sc).setDepth(100+(GY+lane)/10);
    const sh=S.add.image(im.x,GY+lane,'shadow').setDepth(7).setScale(.9*sc,.28*sc);
    const hm=type===3?1:(hpMul||S.hpMul||1);
    S.lit(im);S.addRefl(im,()=>GY+lane);
    S.zs.push({type,im,sh,x:im.x,y:GY+lane,hp:c.hp*hm,max:c.hp*hm,spd:(c.spd[0]+Math.random()*(c.spd[1]-c.spd[0]))*S.diff.spd*(1+S.wave*.012),sc,t:Math.random()*9,atk:0,cd:0,kb:0,flash:0,dead:false,sw:(Math.random()*40),thrower:false,rockCd:1.5,throwT:0,rockIm:null,lc:.8,ls:'run',jh:0,jvx:0,jvy:0,base:GY+lane,spc:1.5+Math.random()*2,cs:0,cp:0,gas:null});
    if(type===3){const z=S.zs[S.zs.length-1];z.gas=S.add.image(z.x,z.y-80,'glowG').setDepth(z.im.depth+.2).setScale(1.5).setAlpha(.55).setBlendMode(Phaser.BlendModes.ADD)}
    if(type===2&&S.darkPhase){S.tankN++;if(S.tankN%5===0){const z=S.zs[S.zs.length-1];z.thrower=true;z.rockIm=S.add.image(z.x,z.y-210*z.sc,'rock').setDepth(170).setScale(.95)}}
  }
  pickType(){
    const S=this,n=S.wave,r=Math.random();
    if(n>=3&&r<.08&&!S.pl.clg&&!S.zs.some(z=>z.type===3))return 3;
    if(n>=5&&Math.random()<.06+(n>10?.05:0)&&S.zs.filter(z=>z.type===4).length<2)return 4;
    if(n>=11){return r<.35?0:r<.7?1:2}
    if(n>=4&&r<.14+n*.012)return 2;if(n>=2&&r<.32+n*.02)return 1;return 0;
  }
  killZ(z,silent){
    const S=this;if(z.dead)return;z.dead=true;if(z.gas){z.gas.destroy();z.gas=null}const i=S.zs.indexOf(z);if(i>=0)S.zs.splice(i,1);
    if(silent){z.im.destroy();z.sh.destroy();return}
    S.cnt.kills++;S.cnt.score+=ZT[z.type].pts;Aud.S.zdie();S.blood(z.x,z.y-90,16,1);S.decal(z.x,z.y,1+z.sc*.3);
    if(Math.random()<ZT[z.type].drop*S.diff.drop)S.mkMed(z.x,z.y);
    if(S.pl.vamp&&++S.vk>=(S.pl.vamp>1?8:12)){S.vk=0;if(S.pl.hp<S.pl.max){S.pl.hp++;Aud.S.medkit();S.fx('glowG',S.pl.x,S.pl.y-90,{n:4,spd:[20,90],ang:[-3.1,0],life:.6,add:true,sc:[.4,.8]})}}
    z.im.setFrame(8).clearTint().setAngle(0);z.sh.destroy();if(z.rockIm){z.rockIm.destroy();z.rockIm=null}const d=Math.random()<.5?1:-1;
    S.tweens.add({targets:z.im,angle:-d*84,y:z.y+6,duration:420,ease:'Quad.easeIn'});
    S.tweens.add({targets:z.im,alpha:0,delay:900,duration:700,onComplete:()=>z.im.destroy()});
  }
  mkMed(x,y){const im=this.add.image(x,y-14,'medkit').setDepth(150);const g=this.add.image(x,y-14,'glowG').setDepth(149).setScale(.5).setAlpha(.6).setBlendMode(Phaser.BlendModes.ADD);this.pk.push({im,g,x,y:y-14,t:0,life:12})}
  /* ---------- chefe ---------- */
  startBoss(){
    const S=this;S.st='play';S.waveActive=false;S.spawnLeft=0;S.darkTarget=.66;
    const im=S.add.sprite(W+260,GY+6,'boss',0).setOrigin(230/BW,440/BH).setScale(-1,1).setDepth(118);S.lit(im);S.addRefl(im,()=>GY+6);
    const sh=S.add.image(im.x,GY+6,'shadow').setDepth(7).setScale(3.4,.7);
    S.boss={im,sh,x:im.x,y:GY+6,hp:Math.round(170*S.diff.boss),max:Math.round(170*S.diff.boss),st:'enter',t:0,anim:0,roarT:6,spitT:5,flash:0,hitSh:0,sw:false};
    S.say('CHEFE','algo enorme se aproxima…');Aud.bossTheme();Aud.S.roar();S.shake(.012,900);
  }
  hitBoss(dmg,x,y){
    const S=this,b=S.boss;if(!b||b.st==='dying')return;b.hp-=dmg;b.flash=.07;S.blood(x,y,3,1);S.cnt.score+=1;
    if(b.hp<=0)S.bossDown();
  }
  bossDown(){
    const S=this,b=S.boss;b.st='dying';S.st='bossdeath';S.cnt.score+=1500;
    S.zs.slice().forEach(z=>{S.blood(z.x,z.y-90,10,1);S.killZ(z)});S.shock.forEach(s=>s.im.destroy());S.shock=[];S.biles.forEach(s=>s.im.destroy());S.biles=[];
    Aud.stopMusic(.5);Aud.S.boom();S.shake(.02,1200);S.slow=.28;S.tweens.timeScale=.28;
    b.im.setFrame(6);
    for(let i=0;i<8;i++)S.time.delayedCall(i*140,()=>{S.blood(b.x-30+Math.random()*80,b.y-60-Math.random()*280,22,-1);Aud.S.splat()});
    S.flashR.setFillStyle(0xffffff).setAlpha(.7);S.tweens.add({targets:S.flashR,alpha:0,duration:500});
    S.tweens.add({targets:b.im,angle:-10,duration:2400,ease:'Quad.easeIn'});
    S.tweens.add({targets:[b.im],alpha:0,delay:2400,duration:1600});
    S.time.delayedCall(1700,()=>{S.slow=1;S.tweens.timeScale=1});
    S.time.delayedCall(4200,()=>{S.decision()});
  }
  /* ---------- decisão ---------- */
  decision(){
    const S=this;S.st='decision';S.pl.vx=0;S.darkTarget=.74;Aud.stopMusic(1.2);
    S.time.delayedCall(1200,()=>{Aud.dread(.25);Aud.S.sting()});
    S.showCards('O CHEFE CAIU.','Ao longe, o som de um helicóptero de resgate… ou seria só o vento?\nVocê pode ir embora agora — ou ficar e enfrentar o que ainda vem.',[
      {t:'ESCAPAR',d:'Subir no helicóptero e sair vivo desta cidade.\nO fim da história.',k:'E',accent:0x6fa070,fn:()=>S.escape()},
      {t:'CONTINUAR',d:'Ficar. Mais ondas, mais escuridão,\nsem volta e sem garantia.',k:'C',accent:0xa02020,fn:()=>S.continueRun()}],{serif:true,delay:1700,tcol:'#c23a30'});
  }
  /* ---------- final: escapar ---------- */
  escape(){
    const S=this;S.clearUi();S.st='escape';S.pl.vx=0;S.waveActive=false;Aud.stopMusic(3);
    S.say('','');S.showHud(false);S.darkTarget=.6;
    const hx=700;S.hx=hx;
    const heli=S.add.image(W+420,150,'heli').setDepth(240);
    const rotor=S.add.image(heli.x-10,heli.y-72,'rotor').setDepth(241);
    const beam=S.add.image(heli.x-40,heli.y+30,'beam').setOrigin(.5,0).setDepth(239).setBlendMode(Phaser.BlendModes.ADD).setAlpha(0);
    const lad=S.add.image(hx,heli.y+55,'ladder').setOrigin(.5,0).setDepth(238).setScale(1,0);
    S.heli=[heli,rotor,beam,lad];S.hv={heli,rotor,beam,lad,ph:0,state:'in',lifted:0};
    Aud.heliStart();
    S.tweens.add({targets:heli,x:hx,duration:5200,ease:'Sine.easeOut',onComplete:()=>{
      S.hv.state='hover';S.tweens.add({targets:beam,alpha:1,duration:600});
      S.tweens.add({targets:lad,scaleY:1.1,duration:1300,delay:400,onComplete:()=>S.escapeRun()});}});
    S.tweens.add({targets:heli,y:{from:130,to:165},duration:1600,yoyo:true,repeat:-1,ease:'Sine.easeInOut'});
  }
  escapeRun(){
    const S=this,p=S.pl;S.hv.state='run';p.auto=S.hx;
  }
  escapeClimb(){
    const S=this,p=S.pl,hv=S.hv;hv.state='climb';S.arm.setVisible(false);p.hide=false;
    const climb={y:p.y};
    S.tweens.add({targets:climb,y:hv.heli.y+70,duration:2300,ease:'Sine.easeIn',onUpdate:()=>{p.y=climb.y;S.plS.setFrame(10)},onComplete:()=>{
      S.plS.setVisible(false);S.plSh.setVisible(false);S.escapeLift()}});
  }
  escapeLift(){
    const S=this,hv=S.hv;hv.state='lift';
    S.tweens.add({targets:[hv.heli],x:-500,y:-90,duration:6000,ease:'Quad.easeIn'});
    S.tweens.add({targets:hv.lad,alpha:0,duration:1400});S.tweens.add({targets:hv.beam,alpha:0,duration:1000});
    S.time.delayedCall(2600,()=>{Aud.S.ending();S.flashR.setFillStyle(0x000000).setAlpha(0);S.tweens.add({targets:S.flashR,alpha:.7,duration:4000})});
    S.time.delayedCall(4800,()=>S.winScreen());
  }
  winScreen(){
    const S=this;S.st='win';S.clearUi();Aud.heliStop();
    const mm=Math.floor(S.gameT/60),ss=String(Math.floor(S.gameT%60)).padStart(2,'0');
    const a=S.T(W/2,230,'PARABÉNS!',104,'#f1e6c8',{d:460,font:FONT_SERIF,st:10}).setAlpha(0);
    const b=S.T(W/2,330,'VOCÊ SAIU VIVO.',50,'#d9c9a0',{d:460,font:FONT_SERIF}).setAlpha(0);
    const c=S.T(W/2,420,'Enquanto a cidade queima lá embaixo, você respira de novo.',24,'#b5ad98',{d:460}).setAlpha(0);
    const d=S.T(W/2,500,`Ondas vencidas: 10    ·    Zumbis abatidos: ${S.cnt.kills}    ·    Pontos: ${S.cnt.score}    ·    Tempo: ${mm}:${ss}`,22,'#d8d0bc',{d:460}).setAlpha(0);
    const e=S.T(W/2,600,S.touch?'TOQUE PARA JOGAR DE NOVO':'ENTER para jogar de novo',26,'#e8d8c0',{d:460}).setAlpha(0);
    S.ui.push(a,b,c,d,e);S.tweens.add({targets:[a],alpha:1,duration:1400});S.tweens.add({targets:[b],alpha:1,duration:1400,delay:900});S.tweens.add({targets:[c,d],alpha:1,duration:1200,delay:2000});
    S.tweens.add({targets:e,alpha:1,duration:900,delay:3200,onComplete:()=>S.tweens.add({targets:e,alpha:.3,duration:900,yoyo:true,repeat:-1})});
    S.input.once('pointerdown',()=>{if(S.st==='win'&&S.t>0)S.chooseDiff()});
  }
  /* ---------- continuar: mensagem de sangue ---------- */
  continueRun(){
    const S=this;S.clearUi();S.st='msg';S.darkPhase=true;S.setMood();S.showHud(false);
    S.cleanBoss();
    Aud.S.thunder();S.flashR.setFillStyle(0xffffff).setAlpha(.9);S.tweens.add({targets:S.flashR,alpha:0,duration:700});S.shake(.014,700);
    Aud.stopMusic(.8);S.time.delayedCall(700,()=>Aud.dread(.45));
    const blk=S.add.rectangle(W/2,H/2,W,H,0x000000,0).setDepth(450);S.ui.push(blk);S.tweens.add({targets:blk,alpha:.78,duration:900});
    const im=S.add.image(W/2,H/2-10,'blood_dead').setDepth(460).setAlpha(0).setScale(1.06);S.ui.push(im);
    S.tweens.add({targets:im,alpha:1,scale:.96,duration:1800,delay:500,ease:'Cubic.easeOut'});
    S.tweens.add({targets:im,y:H/2-2,duration:2600,delay:800,yoyo:true,repeat:1,ease:'Sine.easeInOut'});
    const sub=S.T(W/2,H-110,'A escuridão chegou. Não haverá segunda chance.',24,'#a89a88',{d:461}).setAlpha(0);S.ui.push(sub);
    S.tweens.add({targets:sub,alpha:1,duration:1200,delay:2400});
    S.time.delayedCall(2200,()=>{Aud.S.splat();S.vig.setAlpha(.5)});
    S.time.delayedCall(6200,()=>{S.tweens.add({targets:S.ui.slice(),alpha:0,duration:900,onComplete:()=>{S.clearUi();S.vig.setAlpha(0);S.showHud(true);S.alarmOn=true;Aud.alarm(true);S.nextWave()}})});
  }
  cleanBoss(){const S=this;if(S.boss){S.boss.im.destroy();S.boss.sh.destroy();S.boss=null}S.say('','')}
  /* ---------- cartas (escolhas) ---------- */
  showCards(title,sub,cards,o){
    const S=this;o=o||{};S.clearUi();const d=470,n=cards.length;
    const dim=S.add.rectangle(W/2,H/2,W,H,0x000000,.72).setDepth(d-1).setAlpha(0);S.ui.push(dim);S.tweens.add({targets:dim,alpha:1,duration:500,delay:o.delay?o.delay-700:0});
    const tt=S.T(W/2,120,title,o.serif?74:48,o.tcol||'#e8e2d4',{d,font:o.serif?FONT_SERIF:FONT_UI,st:8}).setAlpha(0);
    const ss=S.T(W/2,196,sub,22,'#b7b09c',{d,w:880,ls:6}).setAlpha(0);S.ui.push(tt,ss);
    const cw=n===2?380:330,gap=36,x0=W/2-(n*cw+(n-1)*gap)/2,list=[tt,ss];
    cards.forEach((c,i)=>{
      const x=x0+i*(cw+gap)+cw/2,y=470,g=S.add.graphics().setDepth(d);
      const draw=hov=>{g.clear();g.fillStyle(0x0d0f12,.95).fillRoundedRect(x-cw/2,y-150,cw,300,12);g.lineStyle(hov?4:2,c.accent||0x9a2020,hov?1:.7).strokeRoundedRect(x-cw/2,y-150,cw,300,12)};draw(false);
      const k=S.T(x-cw/2+22,y-128,'['+(c.k||(i+1))+']',20,'#7e7a6c',{d:d+1,o:[0,.5]});
      let yy=y-86;const parts=[g,k];
      if(c.icon){parts.push(S.add.image(x,y-72,c.icon).setDepth(d+1).setScale(1.1));yy=y-18}
      const t=S.T(x,yy,c.t,c.small?24:34,'#efe6d2',{d:d+1,font:FONT_SERIF,w:cw-30});const ds=S.T(x,yy+(c.icon?70:96),c.d,19,'#a9a28e',{d:d+1,w:cw-34,ls:5});
      parts.push(t,ds);
      const hit=S.add.rectangle(x,y,cw,300,0xffffff,0).setDepth(d+2).setInteractive({useHandCursor:true});parts.push(hit);
      hit.on('pointerover',()=>draw(true));hit.on('pointerout',()=>draw(false));hit.on('pointerdown',()=>S.pickCard(i));
      parts.forEach(p=>{p.setAlpha(0);S.ui.push(p);list.push(p)});
    });
    S.cards={cards,ready:false};
    S.tweens.add({targets:list,alpha:1,duration:700,delay:o.delay||0,onComplete:()=>{if(S.cards)S.cards.ready=true}});
    if(o.delay===undefined)S.cards.ready=true;
  }
  pickCard(i){
    const S=this;if(!S.cards||!S.cards.ready)return;const c=S.cards.cards[i];if(!c)return;
    S.cards=null;Aud.S.pick();S.clearUi();S.fireLock=true;S.pl.held=true;c.fn();
  }
  /* ---------- intermissão ---------- */
  afterWave(){
    const S=this;S.waveActive=false;S.st='inter';const w=S.wave;
    S.pl.hp=Math.min(S.pl.max,S.pl.hp+S.diff.heal);
    S.say('ONDA '+w+' CONCLUÍDA','');
    const steps=[];
    if(w===3||w===6)steps.push(()=>S.offerWeapon(w===3?1:2));
    steps.push(()=>S.offerUpgrade());
    steps.push(()=>{S.st='play';S.nextWave()});
    S.steps=steps;S.time.delayedCall(1500,()=>S.runStep());
  }
  runStep(){const s=this.steps.shift();if(s)s()}
  offerWeapon(i){
    const S=this,W_=WEAPONS[i];S.st='pick';
    const info=['Dispara 7 projéteis de uma vez.\nDevastadora de perto, lenta para recarregar.','Rajada contínua e veloz.\nDano baixo por bala, mas imparável.'][i-1];
    S.showCards('ARMA DESBLOQUEADA','Você encontrou uma '+W_.name.toLowerCase()+'. Quer trocar de arma?',[
      {t:W_.name,d:info,icon:'icon'+i,accent:0xc89a3a,k:1,fn:()=>{S.pl.own[i]=true;S.pl.w=i;S.runStep()}},
      {t:'MANTER A ATUAL',d:'Continuar com '+WEAPONS[S.pl.w].name.toLowerCase()+'\ne deixar esta para trás.',icon:'icon'+S.pl.w,accent:0x6e6e66,k:2,fn:()=>S.runStep()}]);
  }
  offerUpgrade(){
    const S=this,p=S.pl;S.st='pick';
    let pool=UPG.filter(u=>(S.lv[u.id]||0)<u.max&&!(u.id==='hp'&&p.max>=8)).sort(()=>Math.random()-.5);
    if(S.wave===1){const m=pool.find(u=>u.id==='mag');pool=[m].concat(pool.filter(u=>u!==m))}
    pool=pool.slice(0,3);
    S.showCards('ESCOLHA UMA MELHORIA','Onda '+S.wave+' sobrevivida.',pool.map((u,i)=>({t:u.t+((S.lv[u.id]||0)&&u.max<99?'  Nv'+((S.lv[u.id]||0)+1):''),d:u.d,small:true,k:i+1,accent:0x8a2a2a,fn:()=>{S.applyUpg(u.id);S.runStep()}})));
  }
  applyUpg(id){const p=this.pl;this.lv[id]=(this.lv[id]||0)+1;
    if(id==='dmg')p.dmg*=1.2;if(id==='rate')p.rate*=.88;if(id==='mag'){p.mag+=2;for(let i=0;i<3;i++)p.ammo[i]+=2}
    if(id==='rel')p.relMul*=.78;if(id==='pierce')p.pierce++;if(id==='hp'){p.max=Math.min(8,p.max+1);p.hp=p.max}
    if(id==='spd')p.spd*=1.08;if(id==='heal')p.hp=p.max;if(id==='inv')p.invT+=.4;if(id==='vamp')p.vamp=this.lv.vamp}
  cap(w){return AMMO[w]+this.pl.mag}
  startReload(){const p=this.pl;if(p.rel>0||p.ammo[p.w]>=this.cap(p.w))return;p.rel=p.relTot=RELT[p.w]*p.relMul;Aud.S.reload(p.rel)}
  /* ---------- jogador ---------- */
  hurt(dmg,fromX){
    const S=this,p=S.pl;if(p.inv>0||p.dead||S.st==='escape'||S.st==='bossdeath')return;
    p.hp-=dmg;p.inv=p.invT;S.hpFlash=.6;Aud.S.hurt();S.shake(.009,220);S.vig.setAlpha(1);S.tweens.add({targets:S.vig,alpha:0,duration:700});
    p.vx+=(p.x<fromX?-1:1)*260;S.blood(p.x,p.y-100,8,p.x<fromX?-1:1);
    if(p.hp<=0)S.die();
  }
  die(){
    const S=this,p=S.pl;p.dead=true;S.st='dying';S.clearClg();Aud.stopMusic(1.2);Aud.alarm(false);S.alarmOn=false;S.arm.setVisible(false);S.slow=.5;S.tweens.timeScale=.5;
    S.tweens.add({targets:S.plS,angle:-90*p.dir,y:6,duration:600,ease:'Quad.easeIn'});S.blood(p.x,p.y-90,30,1);S.decal(p.x,p.y,1.6);
    S.time.delayedCall(1300,()=>{S.slow=1;S.tweens.timeScale=1;S.over()});
  }
  over(){
    const S=this;S.st='over';S.clearUi();S.showHud(false);
    const dk=S.darkPhase?(S.wave-10):0;
    const blk=S.add.rectangle(W/2,H/2,W,H,0x000000,.8).setDepth(450).setAlpha(0);S.tweens.add({targets:blk,alpha:1,duration:900});
    const a=S.T(W/2,240,'VOCÊ MORREU',100,'#a41c1c',{d:460,font:FONT_SERIF,st:10}).setAlpha(0);
    const b=S.T(W/2,350,'Chegou até a onda '+S.wave+(dk>0?'  —  '+dk+' onda'+(dk>1?'s':'')+' além do chefe':''),28,'#cfc6b2',{d:460}).setAlpha(0);
    const c=S.T(W/2,410,'Zumbis abatidos: '+S.cnt.kills+'    ·    Pontos: '+S.cnt.score,24,'#a49d8a',{d:460}).setAlpha(0);
    const e=S.T(W/2,540,S.touch?'TOQUE PARA TENTAR DE NOVO':'ENTER para tentar de novo',28,'#e8d8c0',{d:460}).setAlpha(0);
    S.ui.push(blk,a,b,c,e);S.tweens.add({targets:[a,b,c,e],alpha:1,duration:1200,delay:700});
    S.input.once('pointerdown',()=>{if(S.st==='over')S.chooseDiff()});
  }
  shoot(){
    const S=this,p=S.pl,w=WEAPONS[p.w];
    p.fire=w.rate*p.rate;p.kick=1;p.ammo[p.w]--;
    const f=S.plS.frame.name,sh=S.shoulder(),m=MUZ[p.w],r=S.arm.rotation,cs=Math.cos(r),sn=Math.sin(r),lx=p.dir*m[0],ly=m[1];
    const mx=sh.x+lx*cs-ly*sn,my=sh.y+lx*sn+ly*cs;
    for(let i=0;i<w.pellets;i++){
      const a=p.aim+(Math.random()-.5)*2*w.spread;
      const im=S.add.image(mx,my,'tracer').setOrigin(1,.5).setDepth(205).setRotation(a).setBlendMode(Phaser.BlendModes.ADD).setScale(w.pellets>1?.45:1,w.pellets>1?.7:1);
      S.bl.push({im,x:mx,y:my,vx:Math.cos(a)*w.spd*(.92+Math.random()*.16),vy:Math.sin(a)*w.spd*(.92+Math.random()*.16),dmg:w.dmg*p.dmg,life:w.life,kb:w.kb,pierce:p.pierce,hit:new Set()});
    }
    S.flash.setPosition(mx,my).setRotation(p.aim).setScale(p.w===1?1.1:.7).setAlpha(1);S.flashT=.06;S.flashLight=.1;S.flashP={x:mx,y:my};
    S.fx('casing',sh.x,sh.y-10,{n:1,spd:[80,200],ang:p.dir>0?[-2.8,-1.9]:[-1.25,-.35],g:1300,life:.7,rot:20,d:150});
    S.fx('smoke',mx,my,{n:p.w===1?4:2,spd:[10,60],ang:[-2.4,-.8],life:.9,sc:[.6,1],a:.5,grow:1.2,d:210});
    Aud.S.shot(p.w);if(p.w===1)S.shake(.006,120);
    if(p.ammo[p.w]<=0)S.startReload();
  }
  shoulder(){const p=this.pl,f=+this.plS.frame.name,s=PSH[f]||PSH[0];return{x:p.x+p.dir*(s[0]-f*PW-70),y:p.y+s[1]-158}}
  /* ---------- atualização ---------- */
  update(time,delta){
    const S=this;let dt=Math.min(.05*(window.DTMAX||1),delta/1000);S.t+=dt;
    const K=S.keys,jd=k=>Phaser.Input.Keyboard.JustDown(k);
    if(jd(K.M)){const m=Aud.mute();S.muteTxt.setText(m?'M: som (MUDO)   P: pausa':'M: som   P: pausa')}
    if(S.st==='title'&&!S.cards&&(jd(K.ENTER)||jd(K.SPACE))){S.chooseDiff()}
    if((S.st==='over'||S.st==='win')&&jd(K.ENTER)){S.chooseDiff()}
    if(S.cards){
      if(S.cards.ready){S.cards.cards.forEach((c,i)=>{const k=String(c.k||(i+1)),code=({1:K.ONE,2:K.TWO,3:K.THREE,E:K.E,C:K.C})[k];if(code&&jd(code))S.pickCard(i)})}
    }
    if(['play','bossdeath','inter','pick','decision','msg','escape','dying'].includes(S.st)&&jd(K.P)){S.paused=!S.paused;if(S.paused){S.say('PAUSADO','')}else S.say('','');S.tweens[S.paused?'pauseAll':'resumeAll']()}
    if(S.paused)return;
    dt*=S.slow;S.gameT+=(S.st==='play'||S.st==='inter'||S.st==='pick')?dt:0;
    S.updPlayer(dt);S.updZ(dt);S.updBoss(dt);S.updWitch(dt);S.updBullets(dt);S.updRocks(dt);S.updAcid(dt);S.updClg(dt);S.updPickups(dt);S.updFx(dt);S.updWorld(dt);S.updHud(dt);S.updHeli(dt);
    if(S.st==='play'&&S.waveActive){
      if(S.spawnLeft>0){S.spawnT-=dt;if(S.spawnT<=0){S.spawnZ(S.pickType());S.spawnLeft--;S.spawnT=S.interval*(.6+Math.random()*.8)}}
      else if(S.zs.length===0&&!S.pl.clg&&!S.globs.length){S.afterWave()}
    }
    S.updScenery(dt);S.updLight(dt);S.updLaser();S.updRefl();
  }
  updPlayer(dt){
    const S=this,p=S.pl,K=S.keys,tc=S.tc||{};
    const canAct=S.st==='play'||S.st==='bossdeath'||S.st==='inter'||S.st==='pick'||S.st==='decision';
    let ax=0,wantJump=false,wantFire=false;
    if(p.dead||S.st==='msg'){}
    else if(S.st==='escape'){
      if(p.auto!==undefined){const dx=p.auto-p.x;if(Math.abs(dx)>6){ax=Math.sign(dx)*.9}else{p.auto=undefined;p.vx=0;S.escapeClimb()}}
    }else if(canAct){
      ax=((K.D.isDown||K.RIGHT.isDown||tc.r)?1:0)-((K.A.isDown||K.LEFT.isDown||tc.l)?1:0);
      wantJump=K.W.isDown||K.UP.isDown||K.SPACE.isDown||tc.j;
      if(p.clg){ax=-ax;wantJump=false;const tj=!!tc.j,pr=Phaser.Input.Keyboard.JustDown(K.SPACE)||(tj&&!p.tjPrev);p.tjPrev=tj;if(pr){p.clg.mash--;Aud.S.hit();if(p.clg.mash<=0)S.mashOff()}}
      wantFire=!S.fireLock&&(S.st==='play'||S.st==='bossdeath')&&(K.J.isDown||K.Z.isDown||K.X.isDown||K.K.isDown||tc.f||S.input.activePointer.isDown&&!S.touch);
      [K.ONE,K.TWO,K.THREE].forEach((k,i)=>{if(jd2(k)&&p.own[i]&&p.w!==i){p.w=i;p.fire=.12;p.rel=0;Aud.S.ui()}});
    }
    if(S.fireLock&&!S.input.activePointer.isDown&&!K.J.isDown&&!K.Z.isDown&&!K.X.isDown&&!K.K.isDown&&!tc.f)S.fireLock=false;
    function jd2(k){return Phaser.Input.Keyboard.JustDown(k)}
    const sp=270*p.spd;p.vx+=(ax*sp-p.vx)*Math.min(1,dt*(ax?11:9));
    p.x=Math.max(PX0,Math.min(PX1,p.x+p.vx*dt));
    const onG=p.y>=GY-.5;
    const climbing=S.st==='escape'&&S.hv&&(S.hv.state==='climb'||S.hv.state==='lift');
    if(!climbing){if(wantJump&&onG&&!p.dead){p.vy=-830;Aud.S.jump()}
    p.vy+=2300*dt;p.y+=p.vy*dt;if(p.y>GY){p.y=GY;p.vy=0}}
    if(p.inv>0)p.inv-=dt;p.fire-=dt;
    /* mira */
    const sh=S.shoulder();
    if(!S.touch&&S.t-p.mouseT<2.5&&canAct){
      const pt=S.input.activePointer;let a=Math.atan2(pt.y-sh.y,pt.x-sh.x);
      const dirm=Math.cos(a)>=0?1:-1;p.dir=dirm;if(dirm>0)a=Math.max(-1,Math.min(1,a));else a=a>0?Math.max(Math.PI-1,Math.min(Math.PI,a)):Math.min(-Math.PI+1,Math.max(-Math.PI,a));p.aim=a;
    }else{if(ax!==0)p.dir=ax;p.aim=p.dir>0?0:Math.PI}
    if(p.rel>0){p.rel-=dt;if(p.rel<=0){p.rel=0;p.ammo[p.w]=S.cap(p.w);Aud.S.reloadEnd()}}
    if(canAct&&!p.dead&&(jd2(K.R)||tc.rl)){tc.rl=0;S.startReload()}
    if(wantFire&&p.fire<=0&&!p.dead&&p.rel<=0){if(p.ammo[p.w]<=0)S.startReload();else if(WEAPONS[p.w].auto||!p.held)S.shoot()}
    p.held=wantFire;
    /* sprite */
    let f;if(!onG)f=10;else if(Math.abs(p.vx)>25){p.rt+=Math.abs(p.vx)*dt/34;f=2+(Math.floor(p.rt)%8)}else f=(Math.floor(S.t*1.6)%2);
    S.plS.setFrame(f).setPosition(p.x,p.y).setScale(p.dir,1).setDepth(100+p.y/10+.5);
    if(!p.dead){S.plS.setAlpha(p.inv>0&&Math.floor(S.t*18)%2?.45:1)}
    S.plSh.setPosition(p.x,GY+4).setScale(.9*(1-(GY-p.y)/500),.3).setAlpha(.9-(GY-p.y)/260);
    S.relA+=((p.rel>0?.75:0)-S.relA)*Math.min(1,dt*12);const s2=S.shoulder();p.kick=Math.max(0,p.kick-dt*9);
    S.arm.setTexture('arm'+p.w).setPosition(s2.x-p.dir*p.kick*5,s2.y).setScale(p.dir,1).setRotation((p.dir>0?p.aim:p.aim-Math.PI)+p.dir*S.relA).setDepth(100+p.y/10+.6).setAlpha(S.plS.alpha).setVisible(S.plS.visible&&!(p.dead||p.hide||S.st==='escape'&&S.hv&&(S.hv.state==='climb'||S.hv.state==='lift')));
    if(S.flashT>0){S.flashT-=dt;if(S.flashT<=0)S.flash.setAlpha(0)}
    if(S.flashLight>0)S.flashLight-=dt;
  }
  updZ(dt){
    const S=this,p=S.pl;
    for(let i=S.zs.length-1;i>=0;i--){
      const z=S.zs[i];z.t+=dt;if(z.flash>0){z.flash-=dt;if(z.flash<=0)z.im.clearTint()}
      const dx=p.x-z.x,near=Math.abs(dx)<62*z.sc&&p.y>GY-70&&!p.dead;
      if(z.type===3){S.updLeaper(z,dt,dx);continue}
      if(z.atk>0){z.atk-=dt;z.im.setFrame(8);if(z.atk<=.25&&!z.hit){z.hit=true;if(Math.abs(p.x-z.x)<78*z.sc&&p.y>GY-70)S.hurt(ZT[z.type].dmg,z.x)}if(z.atk<=0)z.cd=S.diff.atk}
      else{
        z.cd-=dt;
        if(z.thrower){z.rockCd-=dt;if(z.rockCd<=0&&z.throwT<=0&&z.x<W-70&&Math.abs(dx)>320&&!near){z.throwT=.65;z.rockCd=3.6;Aud.S.growl();if(z.rockIm)z.rockIm.setTint(0xff6a50)}}
        if(z.type===4){z.spc-=dt;if(z.cs<=0&&z.spc<=0&&Math.abs(dx)<640&&Math.abs(dx)>190&&!near&&!p.dead){z.cs=1.5;z.cp=0;Aud.S.cough()}}
        if(z.cs>0){z.cs-=dt;z.cp-=dt;const dr=dx>0?1:-1;z.im.setFrame(8).setScale(dr*z.sc,z.sc).setAngle(Math.sin(z.t*45)*5*dr);
          if(z.cp<=0){z.cp=.13;S.fx('smoke',z.x+dr*26*z.sc,z.y-170*z.sc,{n:2,spd:[30,110],ang:dr>0?[-1,.2]:[2.9,4.1],life:.6,sc:[.3,.55],a:.6,grow:.8,tint:0x9acd32,d:215})}
          if(z.cs<=0){z.im.setAngle(0);z.spc=4+Math.random()*2.5;S.spitAcid(z,p.x)}}
        else if(z.throwT>0){z.throwT-=dt;z.im.setFrame(8).setScale((dx>0?1:-1)*z.sc,z.sc);if(z.throwT<=0)S.throwRock(z,dx)}
        else if(near&&z.cd<=0){z.atk=.55;z.hit=false;if(Math.random()<.5)Aud.S.growl()}
        else{
          const dir=dx>0?1:-1;const sp=near?0:z.spd*(S.darkPhase?1.12:1);z.x+=dir*sp*dt-z.kb*dt;z.kb*=Math.pow(.02,dt);
          // balanço do passo
          z.im.setFrame(Math.floor(z.t*(z.spd/10))%8).setScale(dir*z.sc,z.sc);
          if(z.x>W+400)z.x=W+400;
        }
      }
      z.im.x=z.x;z.sh.x=z.x;if(z.rockIm)z.rockIm.setPosition(z.x,z.y-(z.throwT>0?232:210)*z.sc+Math.sin(z.t*5)*3).setRotation(Math.sin(z.t*2)*.2);
    }
    // separa zumbis sobrepostos
    for(let i=0;i<S.zs.length;i++)for(let j=i+1;j<S.zs.length;j++){const a=S.zs[i],b=S.zs[j],d=a.x-b.x;if(Math.abs(d)<34&&a.y===b.y){const push=(34-Math.abs(d))*.3*(d>=0?1:-1);a.x+=push;b.x-=push}}
  }
  startWitch(){
    const S=this;S.st='play';S.waveActive=false;S.spawnLeft=0;S.darkTarget=.9;
    const im=S.add.sprite(1010,GY,'witch',0).setOrigin(100/WW,222/WH).setScale(-1,1).setDepth(119).setAlpha(0);S.lit(im);S.addRefl(im,()=>GY);
    const sh=S.add.image(1010,GY+4,'shadow').setDepth(7).setScale(1.5,.4).setAlpha(0);
    const hp=Math.round(140*S.diff.boss);
    S.witch={im,sh,x:1010,hp,max:hp,st:'cry',t:0,anim:0,dir:-1,hit:false,sob:1,flash:0,stun:0,charges:0,provoked:false,screamed:false,sp2:false};
    S.tweens.add({targets:[im,sh],alpha:1,duration:2000});
    S.say('ONDA 16','você ouve alguém chorando…');Aud.S.sting();Aud.S.cry();
  }
  hitWitch(dmg,x,y){
    const S=this,w=S.witch;if(!w||w.st==='dying')return;
    w.hp-=dmg;w.flash=.06;w.provoked=true;S.blood(x,y,3,1);S.cnt.score+=1;
    if(w.hp<=0)S.witchDown();
  }
  witchDown(){
    const S=this,w=S.witch;w.st='dying';S.st='bossdeath';S.cnt.score+=2000;w.im.setFrame(7).clearTint();
    S.zs.slice().forEach(z=>S.killZ(z));Aud.S.boom();S.shake(.016,1000);S.slow=.3;S.tweens.timeScale=.3;
    for(let i=0;i<6;i++)S.time.delayedCall(i*160,()=>{S.blood(w.x-20+Math.random()*50,GY-30-Math.random()*130,18,-1);Aud.S.splat()});
    S.tweens.add({targets:[w.im,w.sh],alpha:0,delay:1200,duration:1400});S.tweens.add({targets:S.wGlow,alpha:0,duration:600});
    S.time.delayedCall(1500,()=>{S.slow=1;S.tweens.timeScale=1});
    S.time.delayedCall(3000,()=>{S.mkMed(w.x,GY);w.im.destroy();w.sh.destroy();S.witch=null;S.afterWave()});
  }
  updWitch(dt){
    const S=this,w=S.witch,p=S.pl;if(!w)return;
    w.t+=dt;if(w.flash>0){w.flash-=dt;if(w.flash<=0)w.im.clearTint();else w.im.setTintFill(0xffffff)}
    const dx=p.x-w.x,face=dx>=0?1:-1;w.sp2=w.hp<w.max*.5;
    const hy=w.st==='cry'||w.st==='stun'?(w.st==='cry'?64:50):(w.st==='charge'?110:162);
    S.wGlow.setPosition(w.x+face*8,GY-hy).setAlpha(w.st==='dying'?0:.35+.2*Math.sin(S.t*7));
    if(w.st==='dying'){w.sh.x=w.x;return}
    if(w.st==='cry'){
      w.im.setFrame(Math.floor(w.t*3.4)%2).setScale(face,1);
      w.sob-=dt;if(w.sob<=0){Aud.S.cry();w.sob=2.8}
      if(Math.abs(dx)<470||w.provoked||w.t>(w.charges?1.3:7)){w.st='rise';w.t=0;w.provoked=false}
    }else if(w.st==='rise'){
      w.im.setFrame(2).setScale(face,1);if(w.t>.5){w.st='scream';w.t=0;w.screamed=false;Aud.S.witchScream();S.shake(.012,1300)}
    }else if(w.st==='scream'){
      w.im.setFrame(Math.floor(w.t*14)%2?8:2).setScale(face,1);
      S.vig.setAlpha(.25+.2*Math.sin(S.t*30));
      if(w.t>.4&&!w.screamed){w.screamed=true;
        for(let i=0;i<2;i++)S.time.delayedCall(i*220,()=>{const r=S.add.image(w.x,GY-150,'ring').setDepth(212).setScale(.2).setAlpha(.9).setBlendMode(Phaser.BlendModes.ADD);S.tweens.add({targets:r,scale:5.5,alpha:0,duration:900,onComplete:()=>r.destroy()})});
        if(Math.abs(p.x-w.x)<650&&!p.dead){S.hurt(1,w.x);p.vx+=(p.x<w.x?-1:1)*520}
        if(w.sp2)for(let i=0;i<2;i++)S.time.delayedCall(i*300,()=>S.spawnZ(1,W+90+i*70,S.diff.hp*1.1))}
      if(w.t>(w.sp2?1.5:1.25)){w.st='wind';w.t=0;S.vig.setAlpha(0)}
    }else if(w.st==='wind'){
      w.im.setFrame(2).setScale(face,1);
      if(w.t>.45){w.st='charge';w.t=0;w.dir=dx>=0?1:-1;w.hit=false;w.anim=0;Aud.S.witchRush();S.shake(.008,300)}
    }else if(w.st==='charge'){
      const sp=w.sp2?720:600;w.x+=w.dir*sp*dt;w.anim+=dt*17;w.im.setFrame(3+Math.floor(w.anim)%4).setScale(w.dir,1);
      if(Math.random()<dt*40)S.fx('smoke',w.x-w.dir*30,GY+4,{n:1,spd:[20,120],ang:[-3,0],life:.5,sc:[.5,.9],a:.5,grow:1,d:215});
      if(!w.hit&&!p.dead&&Math.abs(p.x-w.x)<44&&p.y>GY-92){w.hit=true;S.hurt(2,w.x)}
      if((w.dir<0&&w.x<=PX0-20)||(w.dir>0&&w.x>=W-70)){w.x=Math.max(PX0-20,Math.min(W-70,w.x));w.st='stun';w.t=0;Aud.S.slam();S.shake(.016,400);S.fx('chunk',w.x,GY-60,{n:12,spd:[80,320],ang:[-3,0],g:1000,life:.8,sc:[.8,1.6],tint:0x777066,d:210})}
    }else if(w.st==='stun'){
      w.im.setFrame(7).setScale(w.dir,1);
      if(w.t>(w.sp2?1.5:2.1)){w.st='cry';w.t=0;w.charges++;w.sob=.2;w.screamed=false}
    }
    w.im.x=w.x;w.sh.x=w.x;
  }
  updHp(dt){
    const S=this,p=S.pl,g=S.hpG;g.clear();
    const ratio=Math.max(0,p.hp/p.max),st=(p.dead||ratio<=.3)?2:ratio<=.6?1:0;
    if(S.lastHp>p.hp&&S.lastHp>=0)S.hpFlash=.6;S.lastHp=p.hp;
    S.hpSh+=(ratio-S.hpSh)*Math.min(1,dt*10);if(ratio>S.hpLag)S.hpLag=ratio;else S.hpLag+=(ratio-S.hpLag)*Math.min(1,dt*.9);
    if(S.hpFlash>0)S.hpFlash-=dt;
    const col=[0x4be07a,0xe8c23a,0xe0382a][st],cs=['#5ef08a','#f0cc44','#ff4a38'][st],lab=['ESTÁVEL','ATENÇÃO','PERIGO'][st];
    S.hpLbl.setText(lab).setColor(cs).setAlpha(st===2?.55+.45*Math.abs(Math.sin(S.t*5)):1);
    // ECG
    const per=[72,52,34][st],spd=[55,80,118][st];S.ecgAcc+=dt*spd;
    while(S.ecgAcc>=1){S.ecgAcc-=1;S.ecgPh=(S.ecgPh+1)%per;const u=S.ecgPh/per,A=[1,.9,1.1][st]*(st===2?.75+Math.random()*.4:1);let y=0;
      if(u<.08)y=.12*Math.sin(u/.08*Math.PI);else if(u<.15)y=0;else if(u<.18)y=-.18*((u-.15)/.03);else if(u<.22)y=-.18+1.15*(u-.18)/.04;else if(u<.27)y=.97-1.4*(u-.22)/.05;else if(u<.31)y=-.43+.43*(u-.27)/.04;else if(u>=.5&&u<.62)y=.22*Math.sin((u-.5)/.12*Math.PI);
      S.ecg.shift();S.ecg.push(p.dead?0:y*A)}
    const px=22,py=18,ex=px+104,ey=py+30,ew=236,eh=62;
    g.fillStyle(0x040605,.8).fillRoundedRect(px-6,py-6,372,112,6);g.lineStyle(2,0x26352b,1).strokeRoundedRect(px-6,py-6,372,112,6);
    // retrato
    const sh=S.hpFlash>0?(Math.random()-.5)*5:0;S.facePic.setTexture('face'+st).setPosition(px+46+sh,py+46);
    g.lineStyle(3,col,1).strokeRect(px,py,92,92);if(st===2)g.fillStyle(0xff0000,.1+.1*Math.sin(S.t*6)).fillRect(px,py,92,92);if(S.hpFlash>0)g.fillStyle(0xff2010,Math.min(.5,S.hpFlash)).fillRect(px,py,92,92);
    // janela do ECG
    g.fillStyle(0x020a05,1).fillRect(ex,ey,ew,eh);g.lineStyle(1,col,.12);for(let i=1;i<8;i++){g.beginPath();g.moveTo(ex+i*ew/8,ey);g.lineTo(ex+i*ew/8,ey+eh);g.strokePath()}for(let i=1;i<3;i++){g.beginPath();g.moveTo(ex,ey+i*eh/3);g.lineTo(ex+ew,ey+i*eh/3);g.strokePath()}
    const mid=ey+eh*.7,amp=eh*.66;
    [[5,.18],[2,1]].forEach(([lw,al])=>{g.lineStyle(lw,col,al);g.beginPath();S.ecg.forEach((v,i)=>{const X=ex+2+i*(ew-4)/(S.ecg.length-1),Y=mid-v*amp;i?g.lineTo(X,Y):g.moveTo(X,Y)});g.strokePath()});
    g.fillStyle(0xffffff,.9).fillCircle(ex+ew-2,mid-S.ecg[S.ecg.length-1]*amp,2.4);
    g.lineStyle(1.5,0x34503c,1).strokeRect(ex,ey,ew,eh);
  }
  updLeaper(z,dt,dx){
    const S=this,p=S.pl,dr=dx>0?1:-1;z.t+=dt;
    if(z.flash>0){z.flash-=dt;if(z.flash<=0)z.im.clearTint()}
    if(z.ls==='run'){
      z.lc-=dt;z.x+=dr*z.spd*(S.darkPhase?1.1:1)*dt-z.kb*dt;z.kb*=Math.pow(.02,dt);
      z.im.setFrame(Math.floor(z.t*(z.spd/10))%8).setScale(dr*z.sc,z.sc).setAngle(0);
      if(z.lc<=0&&!p.clg&&!p.dead&&Math.abs(dx)<360&&Math.abs(dx)>110){z.ls='crouch';z.lt=.3;Aud.S.laugh(.6)}
    }else if(z.ls==='crouch'){
      z.lt-=dt;z.im.setFrame(8).setScale(dr*z.sc,z.sc*.9);
      if(z.lt<=0){z.ls='leap';z.jh=1;z.jvy=790;const tx=p.x+p.vx*.25;z.jvx=Math.max(-900,Math.min(900,(tx-z.x)/.44));z.im.setScale(dr*z.sc,z.sc)}
    }else if(z.ls==='leap'){
      z.x+=z.jvx*dt;z.jvy-=1800*dt;z.jh+=z.jvy*dt;z.im.setFrame(8).setAngle(-dr*(8+z.jvy*.02));
      const head=(GY-p.y)+138;
      if(!p.clg&&!p.dead&&Math.abs(p.x-z.x)<42&&Math.abs(z.jh-head)<62&&(S.st==='play')){S.latch(z);return}
      if(z.jh<=0){z.jh=0;z.ls='run';z.lc=1.6+Math.random()*1.4;z.im.setAngle(0)}
    }
    z.x=Math.max(-60,Math.min(W+400,z.x));z.y=z.base-z.jh;
    z.im.setPosition(z.x,z.y);z.sh.x=z.x;z.sh.setScale(.9*z.sc*(1-Math.min(.5,z.jh/320)),.28*z.sc);
    if(z.gas){z.gas.setPosition(z.x,z.y-90*z.sc).setAlpha(.45+.2*Math.sin(z.t*9));if(Math.random()<dt*14)S.fx('glowG',z.x+(Math.random()-.5)*30,z.y-60*z.sc-Math.random()*60,{n:1,spd:[10,40],ang:[-2.6,-.5],life:.7,sc:[.3,.5],a:.7,add:true,d:z.im.depth+1})}
  }
  latch(z){
    const S=this,p=S.pl;
    p.clg={mash:10,max:10,t:0,lau:.2};
    const sp=S.add.image(p.x,p.y-112,'clinger').setOrigin(.5,1).setDepth(100+p.y/10+2);
    const gas=S.add.image(p.x,p.y-170,'glowG').setScale(1.6).setAlpha(.6).setDepth(100+p.y/10+1.9).setBlendMode(Phaser.BlendModes.ADD);
    const tx=S.T(p.x,p.y-250,'APERTE [ESPAÇO]!',22,'#b8ff5a',{d:410});
    p.clg.sp=sp;p.clg.gas=gas;p.clg.tx=tx;
    S.killZ(z,true);S.shake(.01,250);Aud.S.laugh(1);S.blood(p.x,p.y-150,4,1);
  }
  mashOff(){
    const S=this,p=S.pl,c=p.clg;if(!c)return;p.clg=null;
    const sp=c.sp,d=p.dir;c.gas.destroy();c.tx.destroy();
    S.tweens.add({targets:sp,x:sp.x-d*180,y:GY-40,angle:-d*200,duration:380,ease:'Quad.easeIn',onComplete:()=>{S.blood(sp.x,sp.y-20,16,-d);S.decal(sp.x,GY,1.2);S.fx('glowG',sp.x,sp.y-20,{n:5,spd:[30,140],ang:[-3,0],life:.6,sc:[.5,.9],a:.8,add:true});sp.destroy()}});
    S.cnt.kills++;S.cnt.score+=30;Aud.S.zdie();Aud.S.hit();S.shake(.006,150);
  }
  clearClg(){const p=this.pl;if(p.clg){p.clg.sp.destroy();p.clg.gas.destroy();p.clg.tx.destroy();p.clg=null}}
  updClg(dt){
    const S=this,p=S.pl,c=p.clg;if(!c)return;
    c.t+=dt;c.lau-=dt;c.mash=Math.min(c.max,c.mash+dt*.55);
    const wob=Math.sin(c.t*22)*(c.mash<c.max?2.5:1);
    c.sp.setPosition(p.x+wob,p.y-112).setDepth(100+p.y/10+2).setScale(p.dir*1,1).setAngle(wob*1.6);
    c.gas.setPosition(p.x,p.y-150).setScale(1.1).setAlpha(.25+.1*Math.sin(c.t*8));c.tx.setPosition(p.x,p.y-205-Math.sin(c.t*8)*3).setText('APERTE [ESPAÇO]!  '+'■'.repeat(Math.max(0,Math.ceil(c.mash)))+'□'.repeat(Math.max(0,c.max-Math.ceil(c.mash))));
    if(c.lau<=0){c.lau=1.5+Math.random()*.5;Aud.S.laugh(1)}
    if(Math.random()<dt*16)S.fx('glowG',p.x+(Math.random()-.5)*34,p.y-170-Math.random()*20,{n:1,spd:[10,40],ang:[-2.6,-.5],life:.7,sc:[.3,.5],a:.7,add:true,d:300});
    if(p.dead||S.st==='escape')S.clearClg();
  }
  spitAcid(z,tx){
    const S=this,dr=tx>z.x?1:-1,sx=z.x+dr*30*z.sc,sy=z.y-176*z.sc,T=.75;
    const im=S.add.image(sx,sy,'bile').setDepth(205).setScale(1.3).setTint(0xb8ff40);
    S.globs.push({im,x:sx,y:sy,tx,vx:(tx-sx)/T,vy:(GY-sy)/T-.5*900*T,t:0});Aud.S.spit();
  }
  updAcid(dt){
    const S=this,p=S.pl;
    for(let i=S.globs.length-1;i>=0;i--){const g=S.globs[i];g.t+=dt;g.vy+=900*dt;g.x+=g.vx*dt;g.y+=g.vy*dt;g.im.setPosition(g.x,g.y).rotation+=dt*8;
      if(Math.random()<dt*30)S.fx('glowG',g.x,g.y,{n:1,life:.35,sc:[.2,.35],a:.7,add:true,d:204});
      if(g.y>=GY+4){
        const im=S.add.image(g.tx,GY+8,'acidpool').setDepth(9).setScale(.85,.9).setAlpha(0);S.tweens.add({targets:im,alpha:.95,duration:300});
        S.acids.push({im,x:g.tx,life:15,t:0,w:105,bt:0});Aud.S.splat();
        S.fx('glowG',g.tx,GY,{n:8,spd:[60,260],ang:[-3,0],g:900,life:.5,sc:[.3,.6],add:true,d:206});
        g.im.destroy();S.globs.splice(i,1)}}
    for(let i=S.acids.length-1;i>=0;i--){const a=S.acids[i];a.life-=dt;a.t+=dt;a.bt-=dt;
      if(a.life<2.5)a.im.setAlpha(Math.max(0,.95*a.life/2.5));else a.im.setAlpha(.8+.15*Math.sin(a.t*3));
      if(a.bt<=0){a.bt=.22;S.fx('glowG',a.x+(Math.random()-.5)*150,GY+10+Math.random()*10,{n:1,spd:[10,40],ang:[-2.4,-.7],life:.8,sc:[.2,.4],a:.6,add:true,d:210})}
      if(S.st==='play'&&!p.dead&&p.y>GY-26&&Math.abs(p.x-a.x)<a.w){S.hurt(.5,a.x);p.vx*=.3}
      if(a.life<=0){a.im.destroy();S.acids.splice(i,1)}}
  }
  throwRock(z,dx){
    const S=this;if(z.rockIm){z.rockIm.destroy();z.rockIm=null}
    const dir=dx>0?1:-1,im=S.add.image(z.x,z.y-215*z.sc,'rock').setDepth(210).setScale(1.05);
    S.rocks.push({im,x:z.x,y:z.y-215*z.sc,vx:dir*470,vy:-120,r:26,bn:0});Aud.S.spit();S.shake(.004,100);
  }
  updRocks(dt){
    const S=this,p=S.pl;
    for(let i=S.rocks.length-1;i>=0;i--){const r=S.rocks[i];
      r.vy+=1900*dt;r.x+=r.vx*dt;r.y+=r.vy*dt;
      if(r.y>GY-r.r+2){r.y=GY-r.r+2;if(r.vy>260){r.vy*=-.32;r.bn++;S.fx('smoke',r.x,GY+4,{n:3,spd:[20,120],ang:[-3,0],life:.6,sc:[.6,1],a:.5,grow:1,d:215});Aud.S.splat()}else r.vy=0}
      r.im.setPosition(r.x,r.y).rotation+=r.vx*dt/30;
      if(!p.dead&&p.inv<=0&&Math.abs(p.x-r.x)<24+r.r-4&&r.y+r.r-6>p.y-150&&r.y-r.r+8<p.y){S.hurt(2,r.x);S.blood(r.x,r.y,6,1);S.fx('chunk',r.x,r.y,{n:8,spd:[100,360],ang:[-3,0],g:1100,life:.7,sc:[1,2],tint:0x77736a,d:210});r.im.destroy();S.rocks.splice(i,1);continue}
      if(r.x<-80||r.x>W+120){r.im.destroy();S.rocks.splice(i,1)}}
  }
  updBoss(dt){
    const S=this,b=S.boss,p=S.pl;if(!b)return;
    b.t+=dt;if(b.flash>0){b.flash-=dt;if(b.flash<=0)b.im.clearTint();else b.im.setTintFill(0xffffff)}
    if(b.st==='dying'){b.sh.setAlpha(Math.max(0,b.im.alpha));return}
    const ph2=b.hp<b.max*.5,spd=ph2?74:46;
    if(b.st==='enter'){b.x-=120*dt;b.anim+=dt*5;b.im.setFrame(Math.floor(b.anim)%4);if(b.x<1060){b.st='walk';b.t=0;b.mode=0}}
    else if(b.st==='walk'){
      b.anim+=dt*(ph2?6:4.2);b.im.setFrame(Math.floor(b.anim)%4);
      const dx=p.x-b.x;b.x+=Math.sign(dx)*spd*dt;b.im.setScale(dx>0?1:-1,1);
      b.roarT-=dt;b.spitT-=dt;
      if(Math.abs(dx)<430||b.t>(ph2?2.2:3.4)){b.st='wind';b.t=0;b.dirx=dx>0?1:-1}
      else if(b.roarT<=0){b.st='roar';b.t=0;b.roarT=ph2?8:11;Aud.S.roar();S.shake(.011,900)}
      else if(ph2&&b.spitT<=0){b.st='spit';b.t=0;b.spitT=4.2}
    }
    else if(b.st==='wind'){b.t+=0;b.im.setFrame(b.t<.45?4:5);if(b.t>(ph2?.75:1.05)){b.st='slam';b.t=0;b.im.setFrame(6);Aud.S.slam();S.shake(.016,380);
        const dx=b.dirx>0?1:-1,wx=b.x+dx*170;S.slamAt(wx,dx);
        S.fx('smoke',wx,GY+4,{n:14,spd:[40,240],ang:[-3.1,0],life:1.1,sc:[1,2],a:.6,grow:1.5,d:215})}}
    else if(b.st==='slam'){if(b.t>.7){b.st='walk';b.t=0}}
    else if(b.st==='roar'){b.im.setFrame(b.t%.3<.15?4:5);
      if(b.t>1.3){b.st='walk';b.t=0;const n=ph2?5:3;for(let i=0;i<n;i++)S.time.delayedCall(i*350,()=>S.spawnZ(i%2?1:0,W+80+i*60,S.diff.hp*1.1))}}
    else if(b.st==='spit'){b.im.setFrame(5);if(b.t>.7){b.st='walk';b.t=0;Aud.S.spit();
        for(let i=0;i<3;i++){const tx=p.x+(i-1)*140,sx=b.x-(b.im.scaleX<0?1:-1)*0-60,sy=GY-330;const t=1.1;
          const im=S.add.image(sx,sy,'bile').setDepth(205).setScale(1.2);S.biles.push({im,x:sx,y:sy,vx:(tx-sx)/t,vy:-340,t:0})}}}
    b.x=Math.max(260,Math.min(W+300,b.x));
    b.im.x=b.x;b.sh.x=b.x;
    // dano por contato
    if(b.st==='walk'&&Math.abs(p.x-b.x)<110&&p.y>GY-120)S.hurt(2,b.x);
    // ondas de choque
    for(let i=S.shock.length-1;i>=0;i--){const s=S.shock[i];s.x+=s.vx*dt;s.im.x=s.x;s.life-=dt;s.im.setAlpha(Math.min(1,s.life*1.5));
      if(!s.hit&&Math.abs(p.x-s.x)<46&&p.y>GY-52){s.hit=true;S.hurt(1,s.x)}
      if(s.life<=0||s.x<-120||s.x>W+120){s.im.destroy();S.shock.splice(i,1)}}
    for(let i=S.biles.length-1;i>=0;i--){const s=S.biles[i];s.t+=dt;s.vy+=900*dt;s.x+=s.vx*dt;s.y+=s.vy*dt;s.im.setPosition(s.x,s.y);
      if(Math.abs(p.x-s.x)<34&&Math.abs(p.y-90-s.y)<70){S.hurt(1,s.x);s.y=GY+99}
      if(s.y>=GY){S.decal(s.x,GY+4,.8);Aud.S.splat();S.fx('bile',s.x,GY,{n:5,spd:[40,220],ang:[-3,0],g:900,life:.5,sc:[.3,.6],d:200});s.im.destroy();S.biles.splice(i,1)}}
  }
  slamAt(x,dx){
    const S=this,im=S.add.image(x,GY+10,'wave').setOrigin(.5,1).setDepth(120).setScale(-dx*1.2,1.1);
    S.shock.push({im,x,vx:dx*480,life:1.7,hit:false});
    // dano direto se o jogador está perto do impacto
    const p=S.pl;if(Math.abs(p.x-x)<110&&p.y>GY-60)S.hurt(2,x);
  }
  updBullets(dt){
    const S=this;
    for(let i=S.bl.length-1;i>=0;i--){
      const b=S.bl[i];let dead=false;b.life-=dt;
      const steps=Math.max(1,Math.ceil(Math.hypot(b.vx,b.vy)*dt/16));
      for(let s=0;s<steps&&!dead;s++){
        b.x+=b.vx*dt/steps;b.y+=b.vy*dt/steps;
        for(const z of S.zs){if(z.dead||b.hit.has(z))continue;const hw=30*z.sc;
          if(b.x>z.x-hw&&b.x<z.x+hw&&b.y>z.y-(z.type===4?196:158)*z.sc&&b.y<z.y){
            const head=b.y<z.y-(z.type===4?160:122)*z.sc;z.hp-=b.dmg*(head?1.7:1);z.flash=.06;z.im.setTintFill(0xffffff);z.kb+=Math.sign(b.vx)*b.kb*7*(z.type===2?.4:1);
            S.blood(b.x,b.y,3,b.vx);Aud.S.hit();const kz=z.hp<=0;if(b.pierce>0){b.pierce--;b.dmg*=.7;b.hit.add(z)}else dead=true;if(kz)S.killZ(z);if(dead)break}}
        if(!dead&&S.witch&&S.witch.st!=='dying'){const w=S.witch,bx=w.st==='charge'?52:38,top=w.st==='cry'?94:182;
          if(b.x>w.x-bx&&b.x<w.x+bx&&b.y>GY-top&&b.y<GY){S.hitWitch(b.dmg*(w.st==='stun'?1.5:1)*(b.y<GY-top+36&&w.st!=='cry'?1.4:1),b.x,b.y);Aud.S.hit();dead=true}}
        if(!dead&&S.boss&&S.boss.st!=='dying'&&S.boss.st!=='enter'){const B=S.boss;
          if(b.x>B.x-120&&b.x<B.x+120&&b.y>B.y-390&&b.y<B.y-6){S.hitBoss(b.dmg*(b.y<B.y-300?1.5:1),b.x,b.y);Aud.S.hit();dead=true}}
        if(!dead&&(b.x<-40||b.x>W+40||b.y>GY+14||b.y<-60))dead=true;
      }
      if(b.life<=0)dead=true;
      b.im.setPosition(b.x,b.y);
      if(dead){b.im.destroy();S.bl.splice(i,1)}
    }
  }
  updPickups(dt){
    const S=this,p=S.pl;
    for(let i=S.pk.length-1;i>=0;i--){const k=S.pk[i];k.t+=dt;k.life-=dt;k.im.y=k.y+Math.sin(k.t*3)*4;k.g.y=k.im.y;k.g.setAlpha(.45+Math.sin(k.t*5)*.2);
      if(k.life<3)k.im.setAlpha(Math.floor(S.t*8)%2?.3:1);
      if(Math.abs(p.x-k.x)<44&&p.y>GY-120&&p.hp<p.max&&!p.dead){p.hp++;Aud.S.medkit();S.fx('glowG',k.x,k.y,{n:3,spd:[0,60],ang:[-3.1,0],life:.5,add:true,sc:[.4,.7]});k.im.destroy();k.g.destroy();S.pk.splice(i,1);continue}
      if(k.life<=0){k.im.destroy();k.g.destroy();S.pk.splice(i,1)}}
  }
  updWorld(dt){
    const S=this,p=S.pl;
    S.bg.forEach(b=>{b.im.x=W/2-(p.x-W/2)*b.k});S.fore.x=W/2+(p.x-W/2)*.14;
    if(S.st!=='title'&&Math.random()<dt*40)S.fx('ripple',Math.random()*W,GY+10+Math.random()*68,{n:1,life:.5,d:8,sc:[.25,.4],a:.55,grow:1});
    S.fog.tilePositionX+=dt*(S.st==='escape'?90:14);S.grain.tilePositionX=Math.random()*256;S.grain.tilePositionY=Math.random()*256;
    const wind=S.st==='escape';
    S.rainF.forEach(d=>{d.y+=d.sp*dt;d.x-=(wind?420:180)*dt;if(d.y>H+60||d.x<-40){d.y=-80;d.x=Math.random()*(W+300)}});
    S.rain.forEach(d=>{d.y+=d.sp*dt;d.x-=(wind?260:110)*dt;if(d.y>H+20||d.x<-20){d.y=-30;d.x=Math.random()*(W+200)}});
    const ashA=S.darkPhase?.7:0;S.ash.forEach(d=>{d.y-=d.sp*dt;d.x+=Math.sin(S.t+d.ph)*20*dt;if(d.y<-10){d.y=H+10;d.x=Math.random()*W}d.setAlpha(ashA*(.4+.6*Math.abs(Math.sin(S.t*2+d.ph))))});
    // iluminação do ambiente + relâmpagos
    S.darkA+=(S.darkTarget-S.darkA)*Math.min(1,dt*1.2);
    S.lightning-=dt;if(S.lightning<=0&&S.st!=='title'&&S.st!=='escape'){S.lightning=9+Math.random()*16;Aud.S.thunder();
      S.flashR.setFillStyle(0xcfe0ff).setAlpha(.5);S.tweens.add({targets:S.flashR,alpha:0,duration:260});S.time.delayedCall(180,()=>{S.flashR.setFillStyle(0xcfe0ff).setAlpha(.35);S.tweens.add({targets:S.flashR,alpha:0,duration:420})})}
    // dread: intensidade conforme vida e onda
    if(S.darkPhase&&S.st==='play'){Aud.setIntensity(Math.min(1,.35+(S.wave-10)*.09+(1-S.pl.hp/S.pl.max)*.4))}
    if(S.st==='play'&&p.hp===1&&!S.darkPhase){S.vig.setAlpha(.25+.2*Math.sin(S.t*6))}
    else if(S.st==='play'&&S.vig.alpha>0&&!S.tweens.isTweening(S.vig)&&!p.dead)S.vig.setAlpha(Math.max(0,S.vig.alpha-dt*2));
  }
  muzzle(){const S=this,p=S.pl,m=MUZ[p.w],sh=S.shoulder(),r=S.arm.rotation,cs=Math.cos(r),sn=Math.sin(r),lx=p.dir*m[0],ly=m[1];return{x:sh.x+lx*cs-ly*sn,y:sh.y+lx*sn+ly*cs}}
  updLaser(){
    const S=this,p=S.pl,g=S.laser;g.clear();
    if(p.w!==2||p.dead||!(S.st==='play'||S.st==='bossdeath')){S.laserDot.setVisible(false);return}
    const mz=S.muzzle(),dx=Math.cos(p.aim),dy=Math.sin(p.aim);let x=mz.x,y=mz.y;
    for(let i=0;i<190;i++){x+=dx*8;y+=dy*8;if(x<0||x>W||y>GY+6||y<0)break;let h=false;
      for(const z of S.zs){if(!z.dead&&x>z.x-30*z.sc&&x<z.x+30*z.sc&&y>z.y-(z.type===4?196:158)*z.sc&&y<z.y){h=true;break}}
      const Wt=S.witch;if(!h&&Wt&&Wt.st!=='dying'&&x>Wt.x-38&&x<Wt.x+38&&y>GY-(Wt.st==='cry'?94:182)&&y<GY)h=true;
      const B=S.boss;if(!h&&B&&B.st!=='dying'&&B.st!=='enter'&&x>B.x-120&&x<B.x+120&&y>B.y-390&&y<B.y-6)h=true;
      if(h)break}
    const fl=.85+Math.random()*.15;
    g.lineStyle(7,0xff0000,.12*fl);g.beginPath();g.moveTo(mz.x,mz.y);g.lineTo(x,y);g.strokePath();
    g.lineStyle(1.6,0xff3030,.9*fl);g.beginPath();g.moveTo(mz.x,mz.y);g.lineTo(x,y);g.strokePath();
    S.laserDot.setPosition(x,y).setVisible(true).setAlpha(fl).setScale(.16+Math.random()*.03);
  }
  updScenery(dt){
    const S=this,t=S.t,k0=S.sceneK,tgt=S.darkPhase?1:0;S.sceneK+=(tgt-k0)*Math.min(1,dt*.7);const k=S.sceneK;
    if(Math.abs(k-k0)>.001||k<.002){
      const g=255-105*k|0,b=255-125*k|0,tn=(255<<16)|(g<<8)|b;
      S.bg.forEach((o,i)=>o.im.setTint(i===0?(255<<16)|((255-150*k|0)<<8)|(255-170*k|0):tn));S.props.forEach(o=>o.setTint(tn));S.fog.setTint((255<<16)|((255-90*k|0)<<8)|(255-110*k|0));
    }
    S.redGlow.setAlpha(k*(.2+.05*Math.sin(t*3)+(Math.random()<.04?.08:0)));
    S.sl=[];
    // postes
    const fl=(o,onP,offP)=>{if(t>o.next){o.next=t+.04+Math.random()*.22;o.v=Math.random()<(o.v>0.5?offP:onP)?(o.v>.5?Math.random()*.25:1):o.v}return o.v};
    const L0=S.lampS[0],L1=S.lampS[1];
    let a0=.85+Math.sin(t*23)*.04,a1=0;
    if(S.darkPhase){a0=fl(L0,.5,.45)*.9;a1=fl(L1,.5,.3)*.8}
    S.lampG[0].setAlpha(a0*.65*(S.st==='title'?.6:1)).setScale(.9+a0*.15);S.lampG[1].setAlpha(a1*.65);S.pools[0].setAlpha(a0*.55);S.pools[1].setAlpha(a1*.55);S.shafts[0].setAlpha(a0*.2);S.shafts[1].setAlpha(a1*.2);S.LT.lamp0.setPosition(372,215).setIntensity(a0*1.7);S.LT.lamp1.setPosition(1050,215).setIntensity(a1*1.5);
    S.sl.push([372,290,1.7,a0]);if(a1>.05)S.sl.push([1050,290,1.5,a1]);
    // carros alarmando
    let ph=-1;if(S.alarmOn){ph=Aud.alarmPh();if(ph<0)ph=t%1.1}
    const b1=ph>=0&&ph<.25,b2=ph>=.28&&ph<.52;
    const on=[b1,b2,b1,b2];S.carG.forEach((g,i)=>g.setAlpha(on[i]?.95:0));
    const any=b1||b2;S.carR.forEach(g=>g.setAlpha(any?.55:0));
    S.carG.forEach((g,i)=>{if(on[i])S.sl.push([g.x,g.y,.9,.7])});
    if(any){S.sl.push([780,540,2.2,.45]);S.sl.push([1130,530,2.2,.45])}
    S.LT.al0.setPosition(780,520).setIntensity(b1?1.6:0);S.LT.al1.setPosition(1130,510).setIntensity(b2?1.6:0);
    S.lights.setAmbientColor(Phaser.Display.Color.GetColor(141-20*k|0,146-62*k|0,158-70*k|0));
  }
  updLight(dt){
    const S=this,p=S.pl;let n=0;
    const L=(x,y,sc,a,rot,tex,ox)=>{if(n>=S.lp.length)return;const l=S.lp[n++];l.setTexture(tex||'light');l.setOrigin(ox===undefined?.5:ox,.5).setPosition(x,y).setScale(sc).setAlpha(a).setRotation(rot||0);return l};
    S.beam.setVisible(false);
    const rt=S.dark;rt.clear();rt.fill(0x03050b,S.st==='title'?.45:S.darkA);
    const used=[];
    const push=l=>{if(l)used.push(l)};
    if(!p.dead){
      push(L(p.x,p.y-90,.85,.55));
      const mz=S.muzzle();let ca=1;
      if(S.darkPhase&&S.st==='play'){
        if(S.t>S.flkNext){S.flkEnd=S.t+.35+Math.random()*1.0;S.flkNext=S.flkEnd+1.8+Math.random()*4.5}
        if(S.t<S.flkEnd){if(S.t>S.flkTick){S.flkTick=S.t+.04+Math.random()*.1;S.flkV=Math.random()<.45?.03:(Math.random()<.5?.4:1)}ca=S.flkV}
      }
      push(L(mz.x,mz.y,1.35,ca,p.aim,'cone',0));
      S.beam.setPosition(mz.x,mz.y).setRotation(p.aim).setScale(1.35).setAlpha(.11*ca*(S.st==='title'?0:1)).setVisible(true);
      const cx=Math.cos(p.aim),sy=Math.sin(p.aim);S.LT.fl1.setPosition(mz.x+cx*120,mz.y+sy*120).setIntensity(1.7*ca);S.LT.fl2.setPosition(mz.x+cx*330,mz.y+sy*330).setIntensity(1.1*ca);S.LT.body.setPosition(p.x+p.dir*30,p.y-110).setIntensity(.45*ca);
    }
    // poste aceso
    S.sl.forEach(a=>push(L(a[0],a[1],a[2],a[3])));
    // clarão do tiro
    if(S.flashLight>0&&S.flashP)push(L(S.flashP.x,S.flashP.y,1.8,1));
    S.LT.muz.setIntensity(S.flashLight>0&&S.flashP?3:0);if(S.flashP)S.LT.muz.setPosition(S.flashP.x,S.flashP.y);
    if(p.dead){S.LT.fl1.setIntensity(0);S.LT.fl2.setIntensity(0);S.LT.body.setIntensity(0)}
    const bs=S.boss&&S.boss.st!=='dying';S.LT.boss.setIntensity(bs?.9:0);if(bs)S.LT.boss.setPosition(S.boss.x,S.boss.y-330);
    const ws=S.witch&&S.witch.st!=='dying';S.LT.witch.setIntensity(ws?1.1:0);if(ws)S.LT.witch.setPosition(S.witch.x,GY-150);
    const lf=S.flashR.fillColor!==0?S.flashR.alpha:0;S.LT.sky.setPosition(W/2,-250).setIntensity(lf*5);
    S.LT.heli.setIntensity(S.hv&&S.hv.beam?1.8*S.hv.beam.alpha:0);if(S.hv)S.LT.heli.setPosition(S.hx,GY-160);
    if(S.grade){S.grade.red=S.sceneK;S.grade.hit=Math.max(0,S.hpFlash||0)}
    // chefe e zumbis (olhos brilhantes ao fundo)
    if(S.boss&&S.boss.st!=='dying')push(L(S.boss.x,S.boss.y-300,1.6,.35));
    if(S.witch&&S.witch.st!=='dying')push(L(S.witch.x,GY-(S.witch.st==='cry'?70:130),1.05,.55));
    if(S.hv&&S.hv.heli){const h=S.hv.heli;push(L(h.x-40,h.y+40,2.2,.8));push(L(S.hx,GY-10,2.6,.9*(S.hv.beam.alpha)))}
    S.zs.forEach((z,i)=>{if(i<6&&Math.abs(z.x-p.x)<340)push(L(z.x,z.y-80,.5,.28))});
    if(used.length)rt.erase(used);
  }
  updHud(dt){
    const S=this,p=S.pl;
    S.updHp(dt);
    S.wIcon.setTexture('icon'+p.w);S.wTxt.setText(WEAPONS[p.w].name);
    S.wSlots.setText(p.own.map((o,i)=>o?(i===p.w?'['+(i+1)+']':' '+(i+1)+' '):' · ').join('  '));
    S.waveTxt.setText(S.darkPhase?'ONDA '+S.wave+'  ·  ESCURIDÃO':(S.wave>=10?'CHEFE':'ONDA '+S.wave));S.scoreTxt.setText('abates '+S.cnt.kills+'   pontos '+S.cnt.score);
    const cp=S.cap(p.w),rl=p.rel>0;S.ammoTxt.setText(rl?'RECARREGANDO…':p.ammo[p.w]+' / '+cp).setFontSize(rl?22:34).setColor(rl?'#d9a441':(p.ammo[p.w]<=Math.ceil(cp*.25)?'#e0463c':'#f1e6c8'));
    const rb=S.relBar;rb.clear();if(rl&&!p.dead&&S.hud[0].visible){const f=1-p.rel/p.relTot;rb.fillStyle(0x000000,.65).fillRect(p.x-31,p.y-196,62,8);rb.fillStyle(0xd9a441,1).fillRect(p.x-29,p.y-194,58*f,4)}
    const g=S.bossBar;g.clear();
    const bb=S.boss&&S.boss.st!=='dying'?S.boss:(S.witch&&S.witch.st!=='dying'?S.witch:null);
    if(bb&&S.hud[0].visible){const b=bb,w=480,x=W/2+40-w/2,wc=bb===S.witch;g.fillStyle(0x000000,.65).fillRect(x-4,38,w+8,22);g.fillStyle(wc?0x1d2a30:0x3a0808,1).fillRect(x,42,w,14);g.fillStyle(wc?0x9fb8c4:0xb02020,1).fillRect(x,42,w*Math.max(0,b.hp/b.max),14);g.lineStyle(2,wc?0x58727e:0x7a1a1a,1).strokeRect(x,42,w,14);S.bossTxt.setText(wc?'A CHORONA':'O DEVORADOR')}
    else S.bossTxt.setText('');
  }
  updHeli(dt){
    const S=this,hv=S.hv;if(!hv||!S.heli||S.st!=='escape')return;
    const h=hv.heli;hv.ph+=dt;
    hv.rotor.setPosition(h.x-8,h.y-70).setScale(.82+Math.sin(hv.ph*38)*.18,1).setAlpha(.7+Math.random()*.3);
    hv.beam.setPosition(h.x-60,h.y+34);
    if(hv.state!=='lift')hv.lad.setPosition(S.hx,h.y+55);else hv.lad.setPosition(h.x-5,h.y+55);
    const dist=Math.abs(h.x-640)/700;
    Aud.heliUpdate(Math.max(.25,1.1-dist*.8)*(hv.state==='lift'?Math.max(0,1-(h.y<-20?1:(150-h.y)/220)):1),(h.x-640)/640);
    if(hv.state!=='in'&&Math.random()<.5)S.fx('smoke',S.hx+(Math.random()-.5)*220,GY+4,{n:1,spd:[100,380],ang:[Math.PI-.15,Math.PI+.15],life:.8,sc:[.5,1],a:.5,grow:1.4,d:215});
    if(hv.state==='climb'||hv.state==='lift'){const p=S.pl;p.x+= (h.x-p.x)*Math.min(1,dt*(hv.state==='lift'?6:0));if(hv.state==='lift'){p.y=h.y+70;S.plS.setPosition(p.x,p.y)}}
  }
}

const config={type:Phaser.WEBGL,width:W,height:H,parent:'game',backgroundColor:'#05070a',
  scale:{mode:Phaser.Scale.FIT,autoCenter:Phaser.Scale.CENTER_BOTH},
  render:{antialias:true,powerPreference:'high-performance',maxLights:16},pipeline:{GradeFX},audio:{noAudio:true},scene:[Boot,Main]};
window.addEventListener('load',()=>{window.GAME=new Phaser.Game(config)});
['keydown','pointerdown','touchstart'].forEach(e=>window.addEventListener(e,()=>Aud.unlock(),{passive:true}));
