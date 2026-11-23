'use strict';
/* Arte adicional: A Chorona (chefe da onda 16), retratos do HUD, primeiro plano e efeitos */
const WW=200,WH=230;

function witch(c,ox,pose,ph,fi){
  const R=mk(900+fi*13);c.save();c.translate(ox+100,222);
  const skin='#a8b1a6',dress='#7b7d86',hairC='#0c0a09',eye='#ff2a1a';
  c.shadowColor='rgba(0,0,0,.45)';c.shadowBlur=7;
  const hairBack=(hx,hy,dx,dy,n,w)=>{for(let i=0;i<n;i++){const o=(i-n/2)*w;c.strokeStyle=sh(hairC,.6+R()*1.4);c.lineWidth=1.6+R()*2.6;c.lineCap='round';c.beginPath();c.moveTo(hx+o*.3,hy+o*.2);c.quadraticCurveTo(hx+dx*.55+o,hy+dy*.4+R()*8,hx+dx+o*1.3+(R()-.5)*12,hy+dy+(R()-.5)*10);c.stroke()}};
  const claws=(x,y,a,len)=>{c.strokeStyle='#d8d0b6';c.lineWidth=1.8;c.lineCap='round';for(let f=-1;f<=2;f++){c.beginPath();c.moveTo(x,y);c.quadraticCurveTo(x+Math.cos(a+f*.3)*len*.6,y+Math.sin(a+f*.3)*len*.6,x+Math.cos(a+f*.34)*len,y+Math.sin(a+f*.34)*len+2);c.stroke()}};
  const stains=(x,y,n,s)=>{for(let i=0;i<n;i++)blob(c,x+(R()-.5)*s,y+(R()-.5)*s,3+R()*6,3+R()*5,'#5a0808',.62)};
  const head=(x,y,rot,open)=>{c.save();c.translate(x,y);c.rotate(rot);
    const g=c.createRadialGradient(2,-4,2,0,0,15);g.addColorStop(0,sh(skin,1.25));g.addColorStop(.7,skin);g.addColorStop(1,sh(skin,.4));
    c.fillStyle=g;c.beginPath();c.ellipse(0,0,10.5,13,0,0,TAU);c.fill();
    blob(c,3.5,-3,5.5,4.4,'#10151a',.9);blob(c,-3.5,-2.5,4.4,3.6,'#10151a',.85);
    c.globalCompositeOperation='lighter';glowAt(c,3.5,-3,12,eye,.75);glowAt(c,-3.5,-2.5,9,eye,.55);c.globalCompositeOperation='source-over';
    c.fillStyle='#ffd6c8';c.fillRect(2.6,-3.6,2.3,1.8);c.fillRect(-4.2,-3,1.8,1.5);
    c.strokeStyle='rgba(55,8,8,.75)';c.lineWidth=1.3;c.beginPath();c.moveTo(4,0);c.quadraticCurveTo(5.5,6,4,11.5);c.stroke();c.beginPath();c.moveTo(-3,0);c.quadraticCurveTo(-4.5,5,-3,10);c.stroke();
    c.fillStyle='#240404';c.beginPath();c.ellipse(1,6+open*.5,3.4+open*.5,1.6+open,0,0,TAU);c.fill();
    if(open>3){c.fillStyle='#d8d2bc';for(let i=0;i<4;i++)c.fillRect(-3+i*2.2,4.6+open*.5-open,1.4,2.6);c.fillStyle='rgba(125,8,8,.85)';c.beginPath();c.ellipse(1,7.5+open*.6,2.8,open*.55,0,0,TAU);c.fill()}
    c.fillStyle=hairC;c.beginPath();c.ellipse(-3,-9.5,10.5,5.6,-.2,0,TAU);c.fill();
    for(let i=0;i<10;i++){c.strokeStyle=sh(hairC,.8+R());c.lineWidth=1.6;c.beginPath();c.moveTo(-10+i*2.2,-9);c.quadraticCurveTo(-11+i*2.2+(R()-.5)*3,0,-10+i*2.2+(R()-.5)*5,8+R()*7);c.stroke()}
    c.restore()};
  const legp=(hx,hy,a,k,L1,L2,col,dark)=>{
    const kx=hx+Math.sin(a)*L1,ky=hy+Math.cos(a)*L1,fx=kx+Math.sin(a-k)*L2,fy=ky+Math.cos(a-k)*L2;const cc=dark?sh(col,.7):col;
    limb(c,hx,hy,kx,ky,8,6,cc,undefined,sh(cc,.3));limb(c,kx,ky,fx,fy,5.8,4,cc,undefined,sh(cc,.3));
    c.fillStyle=sh(cc,.75);c.beginPath();c.ellipse(fx+4,fy+1,8,3.2,0,0,TAU);c.fill();return[kx,ky,fx,fy]};
  const arm=(sx,sy,a1,a2,U,Lw,dark)=>{const ex=sx+Math.sin(a1)*U,ey=sy+Math.cos(a1)*U,wx=ex+Math.sin(a2)*Lw,wy=ey+Math.cos(a2)*Lw;const cc=dark?sh(skin,.68):skin,sl=dark?sh(dress,.68):dress;
    limb(c,sx,sy,ex,ey,5.8,4.6,sl,undefined,sh(sl,.3));limb(c,ex,ey,wx,wy,4.6,3.2,cc,undefined,sh(cc,.3));claws(wx,wy,Math.atan2(Math.cos(a2),Math.sin(a2)),14);return[wx,wy]};

  if(pose==='cry'){
    const sy=fi?-1.4:0,rot=fi?.03:-.02;c.rotate(rot);
    hairBack(8,-70+sy,-34,70,16,2);
    legp(-4,-18,1.15,1.7,30,30,skin,true);
    c.fillStyle=dress;poly(c,[[-24,-4],[-14,-32],[18,-36],[30,-18],[16,-2],[-22,0]],dress);poly(c,[[-24,-4],[-20,6],[-12,-2],[-6,6],[2,-2],[12,5],[18,-2]],sh(dress,.8));
    limb(c,-7,-24,9,-66+sy,13,11,dress,undefined,sh(dress,.28));stains(2,-44,4,16);
    legp(2,-20,1.2,1.8,30,30,skin,false);
    arm(8,-64+sy,1.45,2.95,20,22,true);
    head(24,-70+sy,1.05,0);
    hairBack(22,-76+sy,-30,60,12,1.8);
    arm(8,-62+sy,1.7,3.2,20,23,false);
    c.globalCompositeOperation='lighter';glowAt(c,31,-68+sy,9,eye,.5);c.globalCompositeOperation='source-over';
    // lágrimas pingando
    c.fillStyle='rgba(190,215,235,.75)';c.beginPath();c.ellipse(36,-48+sy*2,1.3,2.2,0,0,TAU);c.fill();c.beginPath();c.ellipse(33,-36,1.1,1.9,0,0,TAU);c.fill();
  }else if(pose==='scream'){
    const v=fi===8?1:0,lean=v?-.02:-.16,hy=-94,sxx=Math.sin(lean)*50,syy=hy-Math.cos(lean)*50;
    hairBack(sxx-4,syy-24,-46,100,20,2.2);
    legp(-3,hy,-.1,.15,48,46,skin,true);
    poly(c,[[-14,hy-8],[12,hy-8],[22,hy+54],[10,hy+62],[0,hy+50],[-10,hy+64],[-26,hy+56]],sh(dress,.85));
    legp(4,hy,.14,.12,48,46,skin,false);
    arm(sxx-2,syy+4,-.95+(v?-.25:0),-.5,23,24,true);
    limb(c,0,hy-2,sxx,syy,12,11,dress,undefined,sh(dress,.28));stains(sxx,syy+16,6,22);
    poly(c,[[-13,hy-8],[13,hy-6],[24,hy+44],[8,hy+54],[-4,hy+44],[-12,hy+56],[-28,hy+48]],dress);
    for(let i=0;i<5;i++){c.strokeStyle='rgba(30,30,34,.5)';c.lineWidth=1.3;c.beginPath();c.moveTo(-14+i*8,hy+10);c.lineTo(-17+i*8,hy+48+R()*8);c.stroke()}
    head(sxx+2,syy-24+(v?4:0),v?.12:-.55,v?9:12);
    arm(sxx+2,syy+4,1.85+(v?.2:0),2.15,23,25,false);
  }else if(pose==='run'){
    const lean=.8,L1=34,L2=34,lp=p=>[.9*Math.sin(p),.3+.95*Math.pow(Math.max(0,Math.cos(p)),1.3)];
    const A=lp(ph),B=lp(ph+Math.PI),ext=a=>L1*Math.cos(a[0])+L2*Math.cos(a[0]-a[1]);
    const hy=-4-Math.max(ext(A),ext(B)),sx=Math.sin(lean)*46,sy=hy-Math.cos(lean)*46;
    hairBack(sx+4,sy-8,-86,26,22,1.8);
    legp(-3,hy,B[0],B[1],L1,L2,skin,true);
    arm(sx,sy+4,1.35-Math.sin(ph)*.6,1.9-Math.sin(ph)*.5,22,25,true);
    poly(c,[[-8,hy-6],[10,hy-4],[8,hy+34],[-4,hy+46],[-20,hy+34],[-34,hy+22],[-14,hy+8]],sh(dress,.8));
    limb(c,0,hy-2,sx,sy,11,10,dress,undefined,sh(dress,.28));stains(sx*.5,hy-18,5,18);
    poly(c,[[-8,hy-6],[10,hy-4],[8,hy+30],[-6,hy+44],[-22,hy+28],[-38,hy+16],[-16,hy+6]],dress);
    legp(3,hy,A[0],A[1],L1,L2,skin,false);
    head(sx+9,sy-7,.55,6);
    arm(sx,sy+4,1.35+Math.sin(ph)*.6,1.9+Math.sin(ph)*.5,22,25,false);
  }else{ // atordoada (7): ajoelhada
    hairBack(24,-58,-26,56,16,2);
    legp(-10,-30,1.35,2.4,22,24,skin,true);
    poly(c,[[-24,-4],[-18,-34],[10,-36],[24,-12],[10,0]],sh(dress,.9));
    limb(c,-8,-30,24,-60,12,10,dress,undefined,sh(dress,.28));stains(8,-46,5,18);
    legp(-3,-28,1.45,2.5,22,24,skin,false);
    arm(22,-58,1.1,.35,22,26,true);
    head(36,-62,.7,5);
    arm(22,-56,1.4,.6,22,26,false);
  }
  c.restore();
}
function drawWitchAtlas(sc){
  const c=cv(WW*9,WH),x=c.getContext('2d');
  witch(x,0,'cry',0,0);witch(x,WW,'cry',0,1);witch(x,WW*2,'scream',0,2);
  for(let i=0;i<4;i++)witch(x,WW*(3+i),'run',i*TAU/4+.4,3+i);
  witch(x,WW*7,'stun',0,7);witch(x,WW*8,'scream',0,8);
  addAtlas(sc,'witch',c,WW,WH,9);
}

/* retratos do jogador para o medidor de vida (estilo survival horror clássico) */
function drawFace(state){
  const S=88,c=cv(S,S),x=c.getContext('2d'),R=mk(70+state);
  const bgc=['#1c2b20','#2f2b14','#34120f'][state];
  let g=x.createLinearGradient(0,0,0,S);g.addColorStop(0,sh(bgc,1.7));g.addColorStop(1,sh(bgc,.45));x.fillStyle=g;x.fillRect(0,0,S,S);
  g=x.createRadialGradient(70,20,2,70,20,60);g.addColorStop(0,rgba(['#8fe0a0','#e8d27a','#ff6a50'][state],.22));g.addColorStop(1,'rgba(0,0,0,0)');x.fillStyle=g;x.fillRect(0,0,S,S);
  // ombros e mochila
  const jac=['#46503f','#434a3b','#3d4036'][state];
  g=x.createLinearGradient(0,60,0,S);g.addColorStop(0,sh(jac,1.3));g.addColorStop(1,sh(jac,.5));x.fillStyle=g;
  x.beginPath();x.moveTo(4,S);x.quadraticCurveTo(8,64,30,60);x.lineTo(58,60);x.quadraticCurveTo(80,64,84,S);x.closePath();x.fill();
  x.fillStyle='rgba(0,0,0,.35)';x.fillRect(66,64,12,24);
  // pescoço e lenço vermelho
  const skin=state===2?'#c4a095':state===1?'#d0a487':'#d6ac8d';
  x.fillStyle=sh(skin,.7);x.fillRect(36,54,16,12);
  g=x.createLinearGradient(0,60,0,78);g.addColorStop(0,'#c02a24');g.addColorStop(1,'#5e0e0c');x.fillStyle=g;
  x.beginPath();x.moveTo(26,62);x.quadraticCurveTo(44,72,62,62);x.lineTo(58,74);x.quadraticCurveTo(44,86,30,74);x.closePath();x.fill();
  x.strokeStyle='rgba(0,0,0,.25)';x.lineWidth=1;for(let i=0;i<4;i++){x.beginPath();x.moveTo(30+i*8,64);x.lineTo(32+i*8,78);x.stroke()}
  // rosto
  g=x.createRadialGradient(40,38,3,44,44,26);g.addColorStop(0,sh(skin,1.18));g.addColorStop(.65,skin);g.addColorStop(1,sh(skin,.55));
  x.fillStyle=g;x.beginPath();x.ellipse(44,42,17.5,21,0,0,TAU);x.fill();
  blob(x,30,46,6,8,'#000000',.18);
  // gorro
  g=x.createLinearGradient(0,10,0,36);g.addColorStop(0,'#3d5072');g.addColorStop(1,'#1b2638');x.fillStyle=g;
  x.beginPath();x.moveTo(25,34);x.quadraticCurveTo(24,8,44,8);x.quadraticCurveTo(64,8,63,34);x.closePath();x.fill();
  x.fillStyle='#202c40';x.fillRect(24,30,40,10);x.strokeStyle='rgba(0,0,0,.35)';x.lineWidth=1;for(let i=0;i<13;i++){x.beginPath();x.moveTo(26+i*3,30);x.lineTo(26+i*3,40);x.stroke()}
  x.fillStyle='rgba(255,255,255,.07)';x.fillRect(24,30,40,2);
  // olhos
  const eyeY=state===2?42:41;
  [[36,0],[52,1]].forEach(([ex,k])=>{
    x.fillStyle='#e9e4d8';x.beginPath();x.ellipse(ex,eyeY,4.6,state===2&&k?1.8:3.2,0,0,TAU);x.fill();
    x.fillStyle='#2a1c12';x.beginPath();x.arc(ex+(state?-.6:.5),eyeY+.4,state===2&&k?1.3:2.1,0,TAU);x.fill();
    x.fillStyle='rgba(255,255,255,.8)';x.fillRect(ex+.5,eyeY-1.2,1.2,1.2);
  });
  x.strokeStyle='#2a1a10';x.lineWidth=2;x.lineCap='round';
  const bw=[[0,0],[-1.5,1.5],[-2.5,3]][state];
  x.beginPath();x.moveTo(30,36-bw[0]);x.lineTo(41,34.5+bw[1]);x.stroke();x.beginPath();x.moveTo(58,36-bw[0]);x.lineTo(47,34.5+bw[1]);x.stroke();
  // nariz
  x.strokeStyle='rgba(90,50,30,.6)';x.lineWidth=1.4;x.beginPath();x.moveTo(44,42);x.lineTo(42,50);x.lineTo(46,51);x.stroke();
  // boca
  if(state===0){x.strokeStyle='#6b3326';x.lineWidth=1.8;x.beginPath();x.moveTo(38,57);x.quadraticCurveTo(44,58.5,50,57);x.stroke()}
  else if(state===1){x.strokeStyle='#6b3326';x.lineWidth=2;x.beginPath();x.moveTo(37,58);x.lineTo(51,57);x.stroke();
    x.fillStyle='rgba(170,215,240,.8)';[[28,34],[60,40],[32,22]].forEach(p=>{x.beginPath();x.ellipse(p[0],p[1]+Math.min(0,0),1.3,2.2,0,0,TAU);x.fill()});
    x.strokeStyle='rgba(120,30,20,.8)';x.lineWidth=1.3;x.beginPath();x.moveTo(52,46);x.lineTo(57,54);x.stroke()}
  else{x.fillStyle='#240606';x.beginPath();x.ellipse(44,58,6,3.4,0,0,TAU);x.fill();x.fillStyle='#d8d0bc';x.fillRect(40,55.6,8,1.8);
    x.fillStyle='rgba(150,10,10,.9)';x.beginPath();x.moveTo(40,60);x.quadraticCurveTo(39,70,41,77);x.lineTo(43,77);x.quadraticCurveTo(43,68,43,60);x.fill();
    x.fillStyle='rgba(140,8,8,.85)';x.beginPath();x.moveTo(50,34);x.quadraticCurveTo(54,46,51,56);x.lineTo(53,56);x.quadraticCurveTo(57,44,53,33);x.fill();
    blob(x,34,44,5,3,'#4a1a1a',.45);blob(x,54,44,5,3,'#4a1a1a',.45);blob(x,44,26,10,5,'#7a0a0a',.55)}
  // ruído e linhas de monitor
  x.fillStyle='rgba(0,0,0,.08)';for(let y=0;y<S;y+=3)x.fillRect(0,y,S,1);
  g=x.createRadialGradient(S/2,S/2,S*.3,S/2,S/2,S*.75);g.addColorStop(0,'rgba(0,0,0,0)');g.addColorStop(1,'rgba(0,0,0,.55)');x.fillStyle=g;x.fillRect(0,0,S,S);
  return c;
}

/* silhuetas em primeiro plano (paralaxe) */
function drawFore(){
  const w=1500,h=190,c=cv(w,h),x=c.getContext('2d'),R=mk(1234);
  const dk='#040608',rim='rgba(70,90,110,.35)';
  const piece=(pts)=>{x.fillStyle=dk;x.beginPath();x.moveTo(pts[0][0],pts[0][1]);pts.slice(1).forEach(p=>x.lineTo(p[0],p[1]));x.closePath();x.fill();x.strokeStyle=rim;x.lineWidth=1.6;x.beginPath();x.moveTo(pts[0][0],pts[0][1]);for(let i=1;i<Math.min(4,pts.length);i++)x.lineTo(pts[i][0],pts[i][1]);x.stroke()};
  // entulho irregular
  for(let i=0;i<26;i++){const bx=R()*w,bh=14+R()*46,bw=24+R()*70;piece([[bx,h],[bx+4,h-bh*.6],[bx+bw*.3,h-bh],[bx+bw*.7,h-bh*.7],[bx+bw,h-bh*.3],[bx+bw+8,h]])}
  // cerca quebrada
  for(let i=0;i<9;i++){const bx=40+i*34+R()*10+(i>4?560:0),bh=70+R()*60;piece([[bx,h],[bx,h-bh],[bx+5,h-bh-8],[bx+12,h-bh],[bx+12,h]]);if(i%3===1){x.strokeStyle=dk;x.lineWidth=5;x.beginPath();x.moveTo(bx-10,h-bh*.6);x.lineTo(bx+46,h-bh*.4);x.stroke()}}
  // pneus
  [[300,h-26],[336,h-20],[1100,h-24]].forEach(p=>{x.fillStyle=dk;x.beginPath();x.ellipse(p[0],p[1],30,24,0,0,TAU);x.fill();x.strokeStyle=rim;x.lineWidth=1.5;x.beginPath();x.arc(p[0],p[1],29,3.6,5.4);x.stroke()});
  // poste torto
  piece([[900,h],[898,h-170],[904,h-176],[908,h-170],[910,h]]);x.strokeStyle=dk;x.lineWidth=6;x.beginPath();x.moveTo(904,h-170);x.quadraticCurveTo(944,h-176,962,h-150);x.stroke();
  // sacos de lixo
  for(let i=0;i<8;i++){const bx=700+R()*500,r=16+R()*14;x.fillStyle=dk;x.beginPath();x.ellipse(bx,h-r*.6,r*1.2,r,0,0,TAU);x.fill();x.fillStyle=rim;x.beginPath();x.ellipse(bx-r*.3,h-r*1.1,r*.35,r*.15,-.4,0,TAU);x.fill()}
  // névoa na base
  const g=x.createLinearGradient(0,h-40,0,h);g.addColorStop(0,'rgba(0,0,0,0)');g.addColorStop(1,'rgba(0,0,0,.9)');x.fillStyle=g;x.fillRect(0,h-40,w,40);
  return c;
}

function drawClinger(){
  const c=cv(80,70),x=c.getContext('2d'),R=mk(77);x.translate(40,66);
  x.shadowColor='rgba(0,0,0,.4)';x.shadowBlur=4;
  limb(x,-14,-6,-26,-26,5,4,'#3c5a40');limb(x,14,-6,26,-26,5,4,'#3c5a40');
  limb(x,-24,-26,-12,-44,4,3.4,'#86b070');limb(x,24,-26,12,-44,4,3.4,'#86b070');
  rr(x,-17,-24,34,24,8,'#3c5a40');
  const hg=x.createRadialGradient(-3,-40,2,0,-36,20);hg.addColorStop(0,'#a8d490');hg.addColorStop(.7,'#86b070');hg.addColorStop(1,'#3a5a2e');x.fillStyle=hg;x.beginPath();x.ellipse(0,-34,17,16,0,0,TAU);x.fill();
  x.fillStyle='#1a2a18';for(let i=0;i<6;i++){x.beginPath();x.ellipse(-12+R()*24,-47+R()*3,3.4,2,R(),0,TAU);x.fill()}
  x.fillStyle='#050805';x.beginPath();x.ellipse(-6,-38,4.4,3.4,-.2,0,TAU);x.fill();x.beginPath();x.ellipse(7,-38,4.4,3.4,.2,0,TAU);x.fill();
  x.globalCompositeOperation='lighter';glowAt(x,-6,-38,12,'#9dff4a',.7);glowAt(x,7,-38,12,'#9dff4a',.7);x.globalCompositeOperation='source-over';
  x.fillStyle='#d8ff80';x.fillRect(-7,-39,3,2);x.fillRect(6,-39,3,2);
  x.fillStyle='#220606';x.beginPath();x.moveTo(-11,-29);x.quadraticCurveTo(0,-16,11,-29);x.quadraticCurveTo(0,-26,-11,-29);x.fill();
  x.fillStyle='#e0dcc0';for(let i=0;i<6;i++)x.fillRect(-9+i*3.4,-29+Math.abs(i-2.5)*.4,2,3);
  return c}
function drawAcidPool(){
  const c=cv(260,60),x=c.getContext('2d'),R=mk(91);
  blob(x,130,30,128,26,'#3aa818',.5);
  for(let i=0;i<12;i++)blob(x,130+(R()-.5)*190,30+(R()-.5)*14,22+R()*40,6+R()*9,i%2?'#7dff3a':'#2f8a14',.55);
  x.globalCompositeOperation='lighter';blob(x,130,30,90,14,'#9dff4a',.5);x.globalCompositeOperation='source-over';
  x.strokeStyle='rgba(190,255,120,.55)';x.lineWidth=1.5;for(let i=0;i<9;i++){x.beginPath();x.arc(40+R()*180,18+R()*26,2+R()*4,0,TAU);x.stroke()}
  return c}
function buildAssets2(sc){
  addTex(sc,'clinger',drawClinger());addTex(sc,'acidpool',drawAcidPool());
  drawWitchAtlas(sc);
  [0,1,2].forEach(i=>addTex(sc,'face'+i,drawFace(i)));
  addTex(sc,'fore',drawFore());
  addTex(sc,'ring',(()=>{const c=cv(256,256),x=c.getContext('2d');const g=x.createRadialGradient(128,128,70,128,128,126);g.addColorStop(0,'rgba(255,80,60,0)');g.addColorStop(.82,'rgba(255,90,70,.55)');g.addColorStop(.92,'rgba(255,200,180,.9)');g.addColorStop(1,'rgba(255,80,60,0)');x.fillStyle=g;x.fillRect(0,0,256,256);return c})());
  addTex(sc,'ripple',(()=>{const c=cv(48,14),x=c.getContext('2d');x.strokeStyle='rgba(200,220,240,.8)';x.lineWidth=1.4;x.beginPath();x.ellipse(24,7,21,5,0,0,TAU);x.stroke();return c})());
  addTex(sc,'pool',radial(256,[[0,'rgba(255,214,130,.55)'],[.5,'rgba(255,170,70,.18)'],[1,'rgba(255,140,40,0)']]));
}
