'use strict';
const W=1280,H=720,GY=640,TAU=Math.PI*2;
const FONT_UI='"Trebuchet MS","Segoe UI",Arial,sans-serif';
const FONT_SERIF='Georgia,"Times New Roman",serif';
const PW=150,PH=170,AW=150,AH=90,ZW=190,ZH=200,BW=460,BH=450;
const PSH=[];                       // posição do ombro por frame do jogador
const MUZ=[[66,-10],[104,-6],[108,-7]]; // boca da arma relativa ao ombro
const LAMP_HEAD=[60,20];

function mk(seed){let s=seed>>>0;return()=>{s=(s+0x6D2B79F5)>>>0;let t=s;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296}}
function cv(w,h){const c=document.createElement('canvas');c.width=w;c.height=h;return c}
function sh(h,f){const n=parseInt(h.slice(1),16);const c=v=>Math.max(0,Math.min(255,v|0));return '#'+((1<<24)|(c((n>>16)*f)<<16)|(c((n>>8&255)*f)<<8)|c((n&255)*f)).toString(16).slice(1)}
function rgba(h,a){const n=parseInt(h.slice(1),16);return `rgba(${n>>16},${n>>8&255},${n&255},${a})`}
function glowAt(c,x,y,r,col,a){const g=c.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,rgba(col,a));g.addColorStop(.4,rgba(col,a*.4));g.addColorStop(1,rgba(col,0));c.fillStyle=g;c.fillRect(x-r,y-r,r*2,r*2)}
function blob(c,x,y,rx,ry,col,a){c.save();c.translate(x,y);c.scale(rx,ry);const g=c.createRadialGradient(0,0,0,0,0,1);g.addColorStop(0,rgba(col,a));g.addColorStop(.6,rgba(col,a*.5));g.addColorStop(1,rgba(col,0));c.fillStyle=g;c.beginPath();c.arc(0,0,1,0,TAU);c.fill();c.restore()}
function poly(c,pts,fill){c.fillStyle=fill;c.beginPath();c.moveTo(pts[0][0],pts[0][1]);for(let i=1;i<pts.length;i++)c.lineTo(pts[i][0],pts[i][1]);c.closePath();c.fill()}
function rr(c,x,y,w,h,r,col,hi){const g=c.createLinearGradient(0,y,0,y+h);g.addColorStop(0,hi||sh(col,1.55));g.addColorStop(.35,col);g.addColorStop(1,sh(col,.45));c.fillStyle=g;c.beginPath();if(c.roundRect)c.roundRect(x,y,w,h,r);else c.rect(x,y,w,h);c.fill()}
function limb(c,ax,ay,bx,by,ra,rb,col,hi,lo){
  const dx=bx-ax,dy=by-ay,L=Math.hypot(dx,dy)||1,nx=-dy/L,ny=dx/L,r=Math.max(ra,rb);
  const g=c.createLinearGradient(ax-nx*r,ay-ny*r,ax+nx*r,ay+ny*r);
  g.addColorStop(0,hi||sh(col,1.45));g.addColorStop(.42,col);g.addColorStop(1,lo||sh(col,.38));
  c.fillStyle=g;c.beginPath();c.moveTo(ax+nx*ra,ay+ny*ra);c.lineTo(bx+nx*rb,by+ny*rb);c.lineTo(bx-nx*rb,by-ny*rb);c.lineTo(ax-nx*ra,ay-ny*ra);c.closePath();c.fill();
  c.beginPath();c.arc(ax,ay,ra,0,TAU);c.fill();c.beginPath();c.arc(bx,by,rb,0,TAU);c.fill();
}
function speck(c,x,y,w,h,n,R,cols){for(let i=0;i<n;i++){c.fillStyle=cols[(R()*cols.length)|0];c.fillRect(x+R()*w,y+R()*h,1+R()*2,1+R()*2)}}
function addTex(sc,key,canvas){sc.textures.addCanvas(key,canvas)}
function addAtlas(sc,key,canvas,fw,fh,n){const t=sc.textures.addCanvas(key,canvas);for(let i=0;i<n;i++)t.add(i,0,i*fw,0,fw,fh);return t}

/* ===================== CENÁRIO ===================== */
function bgSky(){
  const c=cv(1360,720),x=c.getContext('2d'),R=mk(11);
  const g=x.createLinearGradient(0,0,0,720);
  g.addColorStop(0,'#03050a');g.addColorStop(.33,'#0a111b');g.addColorStop(.6,'#1b232f');g.addColorStop(.78,'#3a3432');g.addColorStop(1,'#54423a');
  x.fillStyle=g;x.fillRect(0,0,1360,720);
  for(let i=0;i<240;i++){x.fillStyle=`rgba(220,230,255,${.15+R()*.7})`;const s=R()<.07?2:1;x.fillRect(R()*1360,R()*330,s,s)}
  glowAt(x,1030,130,300,'#8fa9cc',.2);glowAt(x,1030,130,130,'#cfe0f5',.3);
  const mg=x.createRadialGradient(1018,118,6,1030,130,46);mg.addColorStop(0,'#f6f8ef');mg.addColorStop(1,'#b3bdb9');
  x.fillStyle=mg;x.beginPath();x.arc(1030,130,46,0,TAU);x.fill();
  x.fillStyle='rgba(100,112,118,.38)';[[1014,118,10],[1044,144,8],[1032,106,5],[1008,146,6],[1050,120,4],[1022,134,3]].forEach(a=>{x.beginPath();x.arc(a[0],a[1],a[2],0,TAU);x.fill()});
  for(let i=0;i<48;i++)blob(x,R()*1360,40+R()*330,120+R()*250,18+R()*40,'#121923',.58);
  for(let i=0;i<20;i++)blob(x,720+R()*620,60+R()*220,100+R()*190,12+R()*20,'#7087a0',.14);
  blob(x,260,610,440,170,'#ff7a2a',.3);blob(x,1190,615,380,130,'#ff6a20',.22);blob(x,700,625,620,100,'#c0501c',.16);
  return c;
}
function bgFar(){
  const c=cv(1360,720),x=c.getContext('2d'),R=mk(23);let px=-20;
  while(px<1380){
    const w=40+R()*90,h=130+R()*200,g=x.createLinearGradient(0,600-h,0,600);g.addColorStop(0,'#101823');g.addColorStop(1,'#1f2935');x.fillStyle=g;
    x.beginPath();x.moveTo(px,604);x.lineTo(px,600-h);
    if(R()<.45){x.lineTo(px+w*.3,600-h);x.lineTo(px+w*.42,600-h-10-R()*16);x.lineTo(px+w*.62,600-h+8);x.lineTo(px+w,600-h+R()*12)}else x.lineTo(px+w,600-h);
    x.lineTo(px+w,604);x.closePath();x.fill();
    if(R()<.3){x.fillStyle='#0d141c';x.fillRect(px+w*.5,600-h-34,2,34)}
    for(let wy=600-h+14;wy<588;wy+=16)for(let wx=px+6;wx<px+w-8;wx+=12)if(R()<.07){x.fillStyle=`rgba(245,190,100,${.22+R()*.4})`;x.fillRect(wx,wy,5,7)}
    px+=w+R()*8-2;
  }
  [[230,0],[860,0],[1180,0]].forEach(([bx])=>{blob(x,bx,590,70,40,'#ff8030',.35);for(let i=0;i<26;i++)blob(x,bx+Math.sin(i*.45)*14+i*2.2,574-i*15,22+i*3.2,28+i*2,'#171c24',.34)});
  const hg=x.createLinearGradient(0,470,0,612);hg.addColorStop(0,'rgba(60,72,88,0)');hg.addColorStop(1,'rgba(74,84,100,.6)');x.fillStyle=hg;x.fillRect(0,470,1360,142);
  return c;
}
function bgMid(){
  const c=cv(1360,720),x=c.getContext('2d'),R=mk(37);let px=-30,idx=0;
  const pal=['#2b2623','#2f2a28','#262c31','#312a2b','#232b2c','#2c2a24'];
  const signs=[['MERCADO','#d14a3a'],['FARMÁCIA','#3fbf6f'],['BAR','#4a8fe0'],['HOTEL','#e0b04a']];
  while(px<1380){
    const w=150+R()*90,h=300+R()*170,top=612-h,col=pal[idx%pal.length];
    const g=x.createLinearGradient(0,top,0,612);g.addColorStop(0,sh(col,1.25));g.addColorStop(1,sh(col,.7));x.fillStyle=g;
    x.beginPath();x.moveTo(px,612);x.lineTo(px,top);
    if(R()<.4){x.lineTo(px+w*.25,top);x.lineTo(px+w*.35,top-8);x.lineTo(px+w*.55,top+14);x.lineTo(px+w*.7,top+4);x.lineTo(px+w,top+R()*10)}else x.lineTo(px+w,top);
    x.lineTo(px+w,612);x.closePath();x.fill();
    speck(x,px,top,w,h,Math.floor(w*h/40),R,['rgba(0,0,0,.18)','rgba(255,255,255,.04)','rgba(80,40,30,.15)']);
    x.fillStyle='rgba(0,0,0,.35)';x.fillRect(px,top+2,w,5);x.fillStyle='rgba(255,255,255,.07)';x.fillRect(px,top,w,2);
    // janelas
    for(let wy=top+26;wy<612-110;wy+=46)for(let wx=px+14;wx<px+w-30;wx+=34){
      const s=R();
      if(s<.12){const g2=x.createLinearGradient(wx,wy,wx,wy+30);g2.addColorStop(0,'#f2c46a');g2.addColorStop(1,'#a8631f');x.fillStyle='#120e0b';x.fillRect(wx-2,wy-2,24,34);x.fillStyle=g2;x.fillRect(wx,wy,20,30);glowAt(x,wx+10,wy+15,48,'#f2a640',.25);x.fillStyle='rgba(0,0,0,.55)';x.fillRect(wx+9,wy,2,30);x.fillRect(wx,wy+14,20,2)}
      else if(s<.55){const g2=x.createLinearGradient(wx,wy,wx+20,wy+30);g2.addColorStop(0,'#1a2430');g2.addColorStop(.5,'#2b3948');g2.addColorStop(1,'#0e141b');x.fillStyle='#0b0b0c';x.fillRect(wx-2,wy-2,24,34);x.fillStyle=g2;x.fillRect(wx,wy,20,30);x.strokeStyle='rgba(0,0,0,.6)';x.lineWidth=1;x.strokeRect(wx+.5,wy+.5,19,29);x.beginPath();x.moveTo(wx+10,wy);x.lineTo(wx+10,wy+30);x.stroke()}
      else if(s<.8){x.fillStyle='#08090a';x.fillRect(wx-2,wy-2,24,34);x.fillStyle='#030304';x.fillRect(wx,wy,20,30);x.strokeStyle='rgba(180,190,200,.35)';x.lineWidth=1;x.beginPath();x.moveTo(wx+2,wy+2);x.lineTo(wx+12,wy+14);x.lineTo(wx+7,wy+28);x.moveTo(wx+12,wy+14);x.lineTo(wx+19,wy+8);x.stroke()}
      else{x.fillStyle='#0a0a0a';x.fillRect(wx-2,wy-2,24,34);for(let k=0;k<4;k++){x.fillStyle=sh('#5b4632',.7+R()*.5);x.fillRect(wx-3,wy+k*8,26,6)}x.fillStyle='rgba(0,0,0,.4)';x.fillRect(wx-3,wy+30,26,2)}
    }
    if(idx%3==1){x.strokeStyle='rgba(8,10,12,.9)';x.lineWidth=2;for(let fy=top+40;fy<612-120;fy+=92){x.strokeRect(px+w-26,fy,22,3);x.beginPath();x.moveTo(px+w-26,fy);x.lineTo(px+w-4,fy+46);x.moveTo(px+w-4,fy);x.lineTo(px+w-26,fy+46);x.stroke()}}
    if(R()<.4){x.fillStyle='#14181c';x.fillRect(px+w*.3,top-26,34,26);x.fillRect(px+w*.3+4,top-34,3,10)}
    // loja térrea
    const sg=signs[idx%signs.length],sy=612-96;
    x.fillStyle='#0b0e11';x.fillRect(px+10,sy,w-20,96);
    const sgc=x.createLinearGradient(0,sy,0,sy+22);sgc.addColorStop(0,'#1c1f23');sgc.addColorStop(1,'#0e1013');x.fillStyle=sgc;x.fillRect(px+10,sy,w-20,24);
    x.font='bold 17px Arial,sans-serif';x.textAlign='center';x.textBaseline='middle';
    glowAt(x,px+w/2,sy+12,70,sg[1],.3);x.fillStyle=sg[1];const t=sg[0];x.fillText(t,px+w/2,sy+13);
    x.fillStyle='rgba(0,0,0,.5)';x.fillRect(px+w/2-18+R()*30,sy+3,6,20);
    for(let k=0;k<7;k++){x.fillStyle=`rgba(${70+R()*20|0},${78+R()*20|0},${86+R()*20|0},.55)`;x.fillRect(px+14,sy+30+k*9,w-28,6)}
    x.fillStyle='rgba(120,20,15,.35)';for(let k=0;k<3;k++){x.beginPath();x.arc(px+30+R()*(w-60),sy+40+R()*50,5+R()*14,0,TAU);x.fill()}
    px+=w+R()*6;idx++;
  }
  const hg=x.createLinearGradient(0,540,0,612);hg.addColorStop(0,'rgba(50,60,74,0)');hg.addColorStop(1,'rgba(55,66,82,.35)');x.fillStyle=hg;x.fillRect(0,540,1360,72);
  return c;
}
function bgStreet(){
  const c=cv(1360,720),x=c.getContext('2d'),R=mk(51);
  // calçada
  let g=x.createLinearGradient(0,592,0,618);g.addColorStop(0,'#363e46');g.addColorStop(1,'#4a535b');x.fillStyle=g;x.fillRect(0,592,1360,26);
  for(let i=0;i<60;i++){x.fillStyle='rgba(0,0,0,.35)';x.fillRect(i*24+R()*6,592,1,26)}
  x.fillStyle='rgba(255,255,255,.14)';x.fillRect(0,617,1360,2);x.fillStyle='rgba(0,0,0,.55)';x.fillRect(0,619,1360,4);
  // asfalto
  g=x.createLinearGradient(0,622,0,720);g.addColorStop(0,'#1a1f24');g.addColorStop(.5,'#22282e');g.addColorStop(1,'#2b3138');x.fillStyle=g;x.fillRect(0,622,1360,98);
  speck(x,0,622,1360,98,9000,R,['rgba(255,255,255,.05)','rgba(0,0,0,.22)','rgba(120,130,140,.08)']);
  for(let i=0;i<14;i++){x.strokeStyle='rgba(0,0,0,.55)';x.lineWidth=1+R()*1.4;x.beginPath();let cx=R()*1360,cy=625+R()*90;x.moveTo(cx,cy);for(let k=0;k<6;k++){cx+=(R()-.3)*34;cy+=(R()-.5)*14;x.lineTo(cx,cy)}x.stroke()}
  // faixa tracejada
  for(let i=-1;i<12;i++){x.fillStyle='rgba(215,205,150,.34)';x.beginPath();x.moveTo(i*130+20,676);x.lineTo(i*130+98,676);x.lineTo(i*130+104,683);x.lineTo(i*130+26,683);x.fill()}
  // manchas de sangue e óleo
  for(let i=0;i<9;i++){blob(x,R()*1360,640+R()*70,26+R()*60,5+R()*12,i%3?'#050505':'#4a0a0a',.5)}
  // poças com reflexo
  [[470,664,70,10],[930,690,90,11],[1190,655,56,8],[150,700,70,9]].forEach(([px,py,rx,ry])=>{
    x.save();x.translate(px,py);x.scale(rx,ry);const pg=x.createRadialGradient(0,0,0,0,0,1);pg.addColorStop(0,'rgba(110,135,165,.55)');pg.addColorStop(.7,'rgba(60,80,100,.4)');pg.addColorStop(1,'rgba(20,30,40,0)');x.fillStyle=pg;x.beginPath();x.arc(0,0,1,0,TAU);x.fill();x.restore()});
  // poste refletido (poça)
  x.fillStyle='rgba(255,210,120,.12)';x.fillRect(396,640,10,70);
  // bueiro e lixo
  x.fillStyle='#0c0e10';x.beginPath();x.ellipse(620,700,34,8,0,0,TAU);x.fill();x.strokeStyle='rgba(120,130,140,.25)';for(let k=-3;k<=3;k++){x.beginPath();x.moveTo(620+k*8,694);x.lineTo(620+k*8,706);x.stroke()}
  for(let i=0;i<46;i++){const px=R()*1360,py=632+R()*84;x.save();x.translate(px,py);x.rotate(R()*TAU);x.fillStyle=`rgba(${190+R()*50|0},${190+R()*40|0},${180+R()*40|0},${.25+R()*.4})`;x.fillRect(0,0,3+R()*7,2+R()*5);x.restore()}
  for(let i=0;i<20;i++){x.fillStyle=`rgba(190,220,240,${.15+R()*.35})`;x.fillRect(R()*1360,630+R()*80,1+R()*2,1+R()*2)}
  // cone de trânsito e latão
  const cone=(px,py,s)=>{x.save();x.translate(px,py);x.scale(s,s);poly(x,[[-9,0],[9,0],[3,-28],[-3,-28]],'#c4571f');poly(x,[[-5,-14],[5,-14],[3.5,-21],[-3.5,-21]],'#d8d8d0');x.fillStyle='#1c1c1c';x.fillRect(-12,0,24,4);x.restore()};
  cone(560,628,1);cone(1075,634,1.05);
  x.save();x.translate(1018,636);x.rotate(-.15);x.fillStyle='#16191b';x.fillRect(-9,-34,36,34);x.fillStyle='#1f2326';x.fillRect(-9,-34,36,4);x.restore();
  return c;
}
function drawCar(w,h,seed,col,van){
  const c=cv(w,h),x=c.getContext('2d'),R=mk(seed),by=h-14;
  x.fillStyle='rgba(0,0,0,.5)';x.beginPath();x.ellipse(w/2,by+6,w*.48,9,0,0,TAU);x.fill();
  const body=x.createLinearGradient(0,by-80,0,by-8);body.addColorStop(0,sh(col,1.5));body.addColorStop(.4,col);body.addColorStop(1,sh(col,.35));
  x.fillStyle=body;
  if(van){x.beginPath();x.moveTo(10,by-10);x.lineTo(10,by-72);x.quadraticCurveTo(12,by-88,34,by-90);x.lineTo(w-60,by-90);x.lineTo(w-16,by-52);x.lineTo(w-8,by-48);x.lineTo(w-8,by-10);x.closePath();x.fill()}
  else{x.beginPath();x.moveTo(8,by-12);x.lineTo(8,by-40);x.quadraticCurveTo(10,by-52,40,by-54);x.lineTo(78,by-58);x.lineTo(112,by-92);x.lineTo(w-90,by-92);x.lineTo(w-52,by-58);x.lineTo(w-18,by-52);x.quadraticCurveTo(w-6,by-48,w-6,by-34);x.lineTo(w-6,by-12);x.closePath();x.fill()}
  // vidros
  x.fillStyle='#07090c';
  if(van){x.beginPath();x.moveTo(w-62,by-84);x.lineTo(w-26,by-52);x.lineTo(w-62,by-52);x.fill();x.fillRect(30,by-82,90,26)}
  else{x.beginPath();x.moveTo(86,by-58);x.lineTo(116,by-88);x.lineTo(w/2+10,by-88);x.lineTo(w/2+10,by-58);x.fill();x.beginPath();x.moveTo(w/2+22,by-58);x.lineTo(w/2+22,by-88);x.lineTo(w-96,by-88);x.lineTo(w-60,by-58);x.fill()}
  x.strokeStyle='rgba(200,210,220,.5)';x.lineWidth=1;for(let i=0;i<7;i++){const px=60+R()*(w-120),py=by-86+R()*26;x.beginPath();x.moveTo(px,py);x.lineTo(px+(R()-.5)*34,py+(R()-.5)*24);x.lineTo(px+(R()-.5)*34,py+(R()-.5)*24);x.stroke()}
  // ferrugem e amassados
  for(let i=0;i<40;i++){blob(x,10+R()*(w-20),by-56+R()*44,5+R()*16,3+R()*8,R()<.5?'#5a2f17':'#000',.28)}
  x.fillStyle='rgba(0,0,0,.4)';x.fillRect(w/2-2,by-54,2,44);x.fillStyle='rgba(255,255,255,.12)';x.fillRect(12,by-44,w-26,2);
  // faróis
  x.fillStyle='#2a2e32';x.fillRect(w-14,by-40,10,10);x.fillStyle='#14181b';x.fillRect(8,by-38,8,9);
  // rodas
  [[w*.22,0],[w*.78,5]].forEach(([wx,fl],i)=>{const r=i?15:19;x.fillStyle='#050506';x.beginPath();x.arc(wx,by-r+(i?2:0)+4,r+4,0,TAU);x.fill();const wg=x.createRadialGradient(wx,by-r+6,2,wx,by-r+6,r);wg.addColorStop(0,'#8b929a');wg.addColorStop(.45,'#3a3f45');wg.addColorStop(1,'#0c0d0f');x.fillStyle=wg;x.beginPath();x.arc(wx,by-r+6,r-2,0,TAU);x.fill()});
  x.fillStyle='rgba(0,0,0,.45)';x.fillRect(0,by-20,w,20);
  return c;
}
function drawBarricade(){
  const c=cv(230,260),x=c.getContext('2d'),R=mk(77);
  x.fillStyle='rgba(0,0,0,.5)';x.beginPath();x.ellipse(115,250,110,10,0,0,TAU);x.fill();
  // paletes
  for(let i=0;i<3;i++){x.save();x.translate(30+i*58,248);x.rotate(-.06+i*.05);for(let k=0;k<5;k++)rr(x,0,-150+k*30,52,22,2,sh('#7a5a3a',.75+R()*.35));x.fillStyle='#2c2018';x.fillRect(4,-150,6,150);x.fillRect(42,-150,6,150);x.restore()}
  // tábuas cruzadas
  [[-.5,20,120],[.45,70,98],[-.2,110,140]].forEach(([a,px,py])=>{x.save();x.translate(px,py+40);x.rotate(a);rr(x,-70,-9,170,18,2,'#8a6a45');x.fillStyle='#202020';for(let k=0;k<4;k++){x.beginPath();x.arc(-58+k*40,0,2.2,0,TAU);x.fill()}x.restore()});
  // sacos de areia
  for(let r=0;r<4;r++)for(let k=0;k<(r%2?5:4);k++){const px=8+k*44+(r%2?-20:0)+(k==0&&r%2?22:0),py=248-r*26;rr(x,Math.max(0,px),py-26,46,26,11,sh('#8c7c5a',.8+R()*.4));x.fillStyle='rgba(0,0,0,.25)';x.fillRect(Math.max(0,px)+8,py-14,28,2)}
  // placa
  x.save();x.translate(150,96);x.rotate(.08);rr(x,-48,-18,96,34,3,'#b0a38a');x.font='bold 19px Arial';x.textAlign='center';x.textBaseline='middle';x.fillStyle='#8a0f0f';x.fillText('PERIGO',0,0);x.restore();
  // arame farpado
  x.strokeStyle='#8e949a';x.lineWidth=1.6;x.beginPath();for(let i=0;i<=230;i+=3){const y=56+Math.sin(i*.28)*7;if(i==0)x.moveTo(i,y);else x.lineTo(i,y)}x.stroke();
  for(let i=8;i<230;i+=20){x.beginPath();x.moveTo(i-4,50);x.lineTo(i+4,62);x.moveTo(i+4,50);x.lineTo(i-4,62);x.stroke()}
  x.fillStyle='rgba(120,10,10,.5)';for(let i=0;i<8;i++){x.beginPath();x.arc(R()*230,120+R()*120,3+R()*9,0,TAU);x.fill()}
  return c;
}
function drawLamp(dead){
  const c=cv(90,440),x=c.getContext('2d');
  const pg=x.createLinearGradient(32,0,50,0);pg.addColorStop(0,'#5a6168');pg.addColorStop(.5,'#2b3036');pg.addColorStop(1,'#0e1013');
  x.fillStyle=pg;x.fillRect(34,34,12,404);x.fillStyle='#14171a';x.fillRect(28,418,24,22);x.fillStyle='rgba(255,255,255,.12)';x.fillRect(34,34,2,404);
  x.save();x.translate(40,36);if(dead)x.rotate(.1);x.fillStyle='#2b3036';x.fillRect(-4,-14,50,8);
  x.fillStyle='#1c2024';x.beginPath();x.moveTo(34,-22);x.lineTo(70,-18);x.lineTo(66,-4);x.lineTo(32,-6);x.closePath();x.fill();
  x.fillStyle=dead?'#1a1d20':'#ffe9b0';x.fillRect(40,-8,24,6);x.restore();
  if(dead){x.strokeStyle='#111';x.lineWidth=1.5;x.beginPath();x.moveTo(60,30);x.quadraticCurveTo(70,70,56,92);x.stroke()}
  return c;
}

/* ===================== PERSONAGEM ===================== */
const PAL={jk:'#56604a',pants:'#2c3442',boot:'#1d1b19',skin:'#d3a58a',cap:'#2b2f36',scarf:'#a33232',pack:'#3b4036'};
function drawBoot(c,ax,ay,ang,col){
  c.save();c.translate(ax,ay);c.rotate(ang);
  const g=c.createLinearGradient(0,-8,0,5);g.addColorStop(0,sh(col,1.9));g.addColorStop(.4,col);g.addColorStop(1,sh(col,.4));
  c.fillStyle=g;c.beginPath();c.moveTo(-5.5,-9);c.lineTo(5.5,-9);c.lineTo(6.5,-3);c.lineTo(15,1);c.lineTo(15.5,5);c.lineTo(-6.5,5);c.lineTo(-7.5,-2);c.closePath();c.fill();
  c.fillStyle='rgba(0,0,0,.65)';c.fillRect(-6.5,3,22,2);c.restore();
}
function leg(c,hx,hy,t,k,L1,L2,r1,r2,col,boot,dark){
  const kx=hx+Math.sin(t)*L1,ky=hy+Math.cos(t)*L1,s=t-k,ax=kx+Math.sin(s)*L2,ay=ky+Math.cos(s)*L2;
  const hi=dark?sh(col,.9):undefined,lo=dark?sh(col,.25):undefined;
  limb(c,hx,hy,kx,ky,r1,r2,col,hi,lo);limb(c,kx,ky,ax,ay,r2,r2*.82,col,hi,lo);
  drawBoot(c,ax,ay,s*.45,boot);
}
function legPose(ph){return[.5*Math.sin(ph),.12+.95*Math.pow(Math.max(0,Math.cos(ph)),1.4)]}
function survivor(c,ox,ph,mode,fi){
  const cx=ox+70,base=158,L1=31,L2=31,P=PAL;
  let pose;
  if(mode==='jump')pose=[[.62,1.0],[-.3,1.25]];else if(mode==='idle')pose=[[.08,.05],[-.08,.03]];else pose=[legPose(ph),legPose(ph+Math.PI)];
  const offs=pose.map(p=>L1*Math.cos(p[0])+L2*Math.cos(p[0]-p[1]));
  let hy=base-4-Math.max(offs[0],offs[1]);if(mode==='jump')hy-=16;if(mode==='idle')hy+=Math.sin(ph)*1.1;
  const lean=mode==='run'?.13:mode==='jump'?.05:.03,hx=cx-1;
  c.save();c.shadowColor='rgba(0,0,0,.35)';c.shadowBlur=6;
  leg(c,hx-3,hy,pose[1][0],pose[1][1],L1,L2,8.5,6,P.pants,P.boot,true);
  // mochila
  const sx=hx+Math.sin(lean)*40,sy=hy-Math.cos(lean)*40;
  c.save();c.translate(hx-8,hy-22);c.rotate(lean);rr(c,-14,-26,16,36,5,P.pack);rr(c,-12,-34,13,10,4,'#4a4f3d');c.fillStyle='#1b1d19';c.fillRect(-14,-6,16,3);c.fillStyle='rgba(255,255,255,.1)';c.fillRect(-13,-24,2,30);c.restore();
  // torso
  limb(c,hx,hy-2,sx,sy,10.5,12.5,P.jk);
  c.fillStyle='rgba(0,0,0,.28)';c.fillRect(hx-10,hy-6,20,5);
  c.save();c.translate(hx,hy-4);c.rotate(lean);c.fillStyle='#16130f';c.fillRect(-11,-3,22,5);c.fillStyle='#8c8f90';c.fillRect(-2,-3,5,5);c.restore();
  c.strokeStyle='#17140f';c.lineWidth=3;c.beginPath();c.moveTo(sx-6,sy+2);c.lineTo(hx+8,hy-8);c.stroke();
  c.fillStyle='#2a2d22';for(let i=0;i<3;i++){c.fillRect(sx-3+i*3,sy+12+i*5,5,6)}
  c.strokeStyle='rgba(255,255,255,.14)';c.lineWidth=1;c.beginPath();c.moveTo(sx+5,sy-4);c.lineTo(hx+7,hy-4);c.stroke();
  leg(c,hx+3,hy,pose[0][0],pose[0][1],L1,L2,9,6.3,P.pants,P.boot,false);
  PSH[fi]=[sx+3,sy+3];
  // pescoço e cachecol
  const hdx=sx+4+Math.sin(lean)*8,hdy=sy-15;
  limb(c,sx,sy-2,hdx,hdy+8,4.5,4.5,P.skin);
  limb(c,sx-1,sy-3,sx+3,sy-6,6.5,6,P.scarf);
  const sw=Math.sin(ph*(mode==='run'?1:.5))*3;
  poly(c,[[sx-3,sy-3],[sx-17,sy+4+sw],[sx-21,sy+12+sw],[sx-13,sy+10+sw],[sx-4,sy+2]],sh(P.scarf,.8));
  // cabeça
  const hg=c.createRadialGradient(hdx+3,hdy-4,2,hdx,hdy,13);hg.addColorStop(0,sh(P.skin,1.25));hg.addColorStop(.7,P.skin);hg.addColorStop(1,sh(P.skin,.5));
  c.fillStyle=hg;c.beginPath();c.ellipse(hdx,hdy,10.5,11.5,0,0,TAU);c.fill();
  poly(c,[[hdx+8,hdy-1],[hdx+14,hdy+3],[hdx+8,hdy+4]],sh(P.skin,.95));
  c.fillStyle='rgba(30,20,15,.28)';c.beginPath();c.ellipse(hdx+2,hdy+7,8,4,0,0,TAU);c.fill();
  c.fillStyle='#0d0d0e';c.fillRect(hdx+4,hdy-3,3.2,2.6);c.fillStyle='rgba(255,255,255,.75)';c.fillRect(hdx+5.6,hdy-3,1.2,1);
  c.strokeStyle='#241912';c.lineWidth=1.4;c.beginPath();c.moveTo(hdx+2.5,hdy-6);c.lineTo(hdx+8,hdy-5);c.stroke();
  c.strokeStyle='rgba(60,25,20,.7)';c.lineWidth=1;c.beginPath();c.moveTo(hdx+5,hdy+6);c.lineTo(hdx+10,hdy+5.6);c.stroke();
  // gorro
  const cg=c.createLinearGradient(hdx-12,hdy-14,hdx+12,hdy-2);cg.addColorStop(0,sh(P.cap,1.5));cg.addColorStop(1,sh(P.cap,.5));
  c.fillStyle=cg;c.beginPath();c.moveTo(hdx-11,hdy-2);c.quadraticCurveTo(hdx-13,hdy-17,hdx,hdy-17);c.quadraticCurveTo(hdx+12,hdy-16,hdx+11,hdy-4);c.closePath();c.fill();
  rr(c,hdx-12,hdy-6,24,6,3,'#3a3f48');c.strokeStyle='rgba(0,0,0,.35)';c.lineWidth=1;for(let i=-10;i<12;i+=3){c.beginPath();c.moveTo(hdx+i,hdy-5.5);c.lineTo(hdx+i,hdy-.5);c.stroke()}
  c.restore();
  // luz de contorno da lua
  c.save();c.globalCompositeOperation='source-atop';const rg=c.createLinearGradient(cx-14,0,cx+18,0);rg.addColorStop(0,'rgba(150,180,220,0)');rg.addColorStop(.6,'rgba(150,180,220,0)');rg.addColorStop(1,'rgba(160,190,230,.34)');c.fillStyle=rg;c.fillRect(ox,0,PW,PH);c.restore();
}
function drawGun(c,t,ox,oy){
  c.save();c.translate(ox,oy);
  if(t===0){
    rr(c,52,30,40,10,2,'#33383d');rr(c,88,31,7,8,2,'#1f2326');c.fillStyle='#8a929a';c.fillRect(56,31,32,1.5);c.fillStyle='#0e1012';c.fillRect(90,27,3,4);
    poly(c,[[54,40],[70,40],[66,57],[55,54]],'#1c1e21');c.strokeStyle='#0c0d0f';c.lineWidth=1.5;c.beginPath();c.arc(70,46,6,-.4,2.4);c.stroke();
    c.fillStyle='rgba(255,255,255,.08)';for(let i=0;i<4;i++)c.fillRect(57,44+i*3,6,1);
  }else if(t===1){
    rr(c,40,35,92,6,3,'#363c42');rr(c,44,42,70,5,2,'#2b3035');rr(c,50,31,28,16,3,'#3d444b');c.fillStyle='#0d0f10';c.fillRect(58,35,10,3);
    rr(c,80,41,24,9,3,'#7a5535');c.fillStyle='rgba(0,0,0,.35)';for(let i=0;i<5;i++)c.fillRect(84+i*4,42,1,7);
    poly(c,[[22,38],[52,34],[52,49],[32,58],[17,53]],'#7e5a38');c.fillStyle='rgba(255,255,255,.12)';c.fillRect(24,39,26,2);
    c.fillStyle='#c9ccd0';c.fillRect(129,32,2.5,3.5);
  }else{
    rr(c,44,31,56,14,3,'#30363b');rr(c,100,34,28,5,2,'#23282c');rr(c,124,31,9,10,1,'#171a1d');rr(c,84,33,22,11,2,'#25292d');
    c.fillStyle='#8a929a';c.fillRect(48,32,50,1.4);
    poly(c,[[66,45],[78,45],[83,66],[70,67]],'#1c1f22');poly(c,[[50,45],[58,45],[56,59],[48,59]],'#1a1c1f');
    poly(c,[[20,36],[46,35],[46,47],[25,51]],'#2a2f33');rr(c,56,26,16,5,1,'#14171a');c.fillStyle='#d8d8d0';c.fillRect(126,28,2,3);
    c.fillStyle='rgba(255,255,255,.08)';for(let i=0;i<6;i++)c.fillRect(86+i*3,34,1,9);
  }
  c.restore();
}
function drawArms(t){
  const c=cv(AW,AH),x=c.getContext('2d'),P=PAL,S=[24,44];
  const H1=[[[62,40],[58,45]],[[64,42],[86,44]],[[60,42],[88,43]]][t]; // [mão do gatilho, mão de apoio]
  const arm=(hand,col,dark)=>{
    const mx=(S[0]+hand[0])/2,my=(S[1]+hand[1])/2+12,hi=dark?sh(col,.8):undefined,lo=dark?sh(col,.25):undefined;
    limb(x,S[0],S[1],mx,my,6,5.3,col,hi,lo);limb(x,mx,my,hand[0],hand[1],5.3,4.4,col,hi,lo);
    x.fillStyle=dark?'#101010':'#1b1b1c';x.beginPath();x.arc(hand[0]+1,hand[1],4.6,0,TAU);x.fill();
  };
  x.shadowColor='rgba(0,0,0,.35)';x.shadowBlur=4;
  arm(H1[1],sh(P.jk,.8),true);
  drawGun(x,t,0,0);
  arm(H1[0],P.jk,false);
  x.shadowBlur=0;x.save();x.globalCompositeOperation='source-atop';x.fillStyle='rgba(150,180,220,.16)';x.fillRect(0,0,AW,28);x.restore();
  return c;
}
function drawPlayerAtlas(sc){
  const c=cv(PW*11,PH),x=c.getContext('2d');
  survivor(x,0,Math.PI/2,'idle',0);survivor(x,PW,3*Math.PI/2,'idle',1);
  for(let i=0;i<8;i++)survivor(x,PW*(2+i),i*TAU/8,'run',2+i);
  survivor(x,PW*10,0,'jump',10);
  addAtlas(sc,'ply',c,PW,PH,11);
}

/* ===================== ZUMBIS ===================== */
const ZD=[
  {sc:1.0,skin:'#9aa886',shirt:'#4b5862',pants:'#2e2b2a',lean:.30,arms:1.05,stride:.40,hair:'#2a2420',eye:'#f2d44a',belly:0},
  {sc:.97,skin:'#b9b79c',shirt:'#6f302d',pants:'#232a33',lean:.55,arms:.62,stride:.62,hair:'#1a1412',eye:'#ff3a2a',belly:0},
  {sc:1.32,skin:'#8a9873',shirt:'#33363a',pants:'#3a3330',lean:.22,arms:1.08,stride:.32,hair:'#111',eye:'#ffb020',belly:1},
  {sc:.95,skin:'#86b070',shirt:'#3c5a40',pants:'#2a3030',lean:.6,arms:1.3,stride:.6,hair:'#1a2a18',eye:'#9dff4a',belly:0},
  {sc:1.0,skin:'#b4b87a',shirt:'#5a5a3a',pants:'#2e2c26',lean:.16,arms:.9,stride:.3,hair:'#2a2a18',eye:'#c8ff40',belly:0,neck:38}
];
function zombie(c,ox,t,ph,atk,fi){
  const D=ZD[t],R=mk(100+t*7);c.save();c.translate(ox+95,188);c.scale(D.sc,D.sc);
  const L1=31,L2=31,lp=p=>[D.stride*Math.sin(p),.18+(.9-t*.1)*Math.pow(Math.max(0,Math.cos(p)),1.4)];
  const pose=[lp(ph),lp(ph+Math.PI)],offs=pose.map(p=>L1*Math.cos(p[0])+L2*Math.cos(p[0]-p[1]));
  const hy=-4-Math.max(offs[0],offs[1]),lean=D.lean+(atk?.15:0),hx=0;
  c.shadowColor='rgba(0,0,0,.4)';c.shadowBlur=6;
  const arm=(dark)=>{
    const sxx=Math.sin(lean)*38,syy=hy-Math.cos(lean)*38,a1=D.arms+(atk?.75:0)+Math.sin(ph+(dark?1:0))*.1,a2=a1+.32+Math.sin(ph*2+1)*.08,U=21,Lw=23;
    const ex=sxx+Math.sin(a1)*U,ey=syy+Math.cos(a1)*U,wx=ex+Math.sin(a2)*Lw,wy=ey+Math.cos(a2)*Lw;
    const sk=dark?sh(D.skin,.7):D.skin,sl=dark?sh(D.shirt,.7):D.shirt;
    limb(c,sxx,syy+2,ex,ey,6,5,sl,undefined,sh(sl,.25));limb(c,ex,ey,wx,wy,5,3.8,sk,undefined,sh(sk,.3));
    c.strokeStyle=sh(sk,.55);c.lineWidth=1.8;c.lineCap='round';for(let f=-1;f<=2;f++){c.beginPath();c.moveTo(wx,wy);c.lineTo(wx+Math.sin(a2+f*.28)*9+2,wy+Math.cos(a2+f*.28)*9);c.stroke()}
    c.fillStyle='rgba(80,5,5,.7)';c.beginPath();c.arc(ex+3,ey+2,3,0,TAU);c.fill();
  };
  leg(c,hx-3,hy,pose[1][0],pose[1][1],L1,L2,8.5,6,sh(D.pants,.8),'#17140f',true);
  arm(true);
  const sx=Math.sin(lean)*38,sy=hy-Math.cos(lean)*38;
  limb(c,hx,hy-2,sx,sy,10.5+D.belly*5,12+D.belly*4,D.shirt);
  // barriga exposta e rasgos
  c.fillStyle=sh(D.skin,.8);c.beginPath();c.moveTo(hx-9,hy-12);c.lineTo(hx+8,hy-10);c.lineTo(hx+5,hy-4);c.lineTo(hx-6,hy-6);c.closePath();c.fill();
  blob(c,hx-1,hy-9,7,4,'#4a0707',.9);
  c.fillStyle=sh(D.shirt,.55);for(let i=0;i<6;i++){c.beginPath();c.moveTo(hx-11+i*4,hy-14);c.lineTo(hx-9+i*4,hy-7-R()*6);c.lineTo(hx-7+i*4,hy-14);c.fill()}
  for(let i=0;i<5;i++)blob(c,sx-8+R()*16,sy+4+R()*26,3+R()*7,3+R()*6,'#450606',.65);
  if(D.belly){c.fillStyle='rgba(230,225,200,.85)';poly(c,[[sx+6,sy-2],[sx+17,sy-12],[sx+11,sy+2]],'#d9d3bd');c.strokeStyle='rgba(255,150,40,.7)';c.lineWidth=1.4;for(let i=0;i<4;i++){c.beginPath();c.moveTo(sx-6+i*3,sy+8);c.quadraticCurveTo(sx+2,sy+14+i*3,sx+10,sy+10+i*4);c.stroke()}}
  leg(c,hx+3,hy,pose[0][0],pose[0][1],L1,L2,9,6.3,D.pants,'#17140f',false);
  // joelho rasgado
  const kx=hx+3+Math.sin(pose[0][0])*L1,ky=hy+Math.cos(pose[0][0])*L1;poly(c,[[kx-2,ky-3],[kx+6,ky-4],[kx+8,ky+2],[kx+2,ky+5],[kx-3,ky+2]],sh(D.skin,.85));poly(c,[[kx,ky-1],[kx+5,ky-2],[kx+4,ky+3]],'#4a0808');
  arm(false);
  // cabeça
  const nk=D.neck||0,hdx=sx+9+nk*.3+(atk&&nk?8:0),hdy=sy-12-nk+(atk?(nk?-8:-3):0);
  limb(c,sx,sy-3,hdx-2,hdy+6,nk?4.8:4.4,nk?4.2:4.4,D.skin);
  if(nk){const gx=(sx+hdx)/2,gy=(sy+hdy)/2;blob(c,gx,gy+6,8.5,13,'#7dff3a',.5);c.fillStyle=sh(D.skin,.8);c.beginPath();c.ellipse(gx,gy+6,6,10,.2,0,TAU);c.fill();c.strokeStyle='rgba(90,220,40,.8)';c.lineWidth=1.5;for(let i=0;i<4;i++){c.beginPath();c.moveTo(gx-3,gy-2+i*4.5);c.quadraticCurveTo(gx+3,gy+i*4.5,gx+5,gy+2+i*4.5);c.stroke()}}
  const hg=c.createRadialGradient(hdx+2,hdy-4,2,hdx,hdy,14);hg.addColorStop(0,sh(D.skin,1.2));hg.addColorStop(.7,D.skin);hg.addColorStop(1,sh(D.skin,.45));
  c.save();c.translate(hdx,hdy);c.rotate(.25+(atk?.2:0));c.fillStyle=hg;c.beginPath();c.ellipse(0,0,10.5,12,0,0,TAU);c.fill();
  // cabelo ralo
  c.fillStyle=D.hair;for(let i=0;i<7;i++){c.beginPath();c.ellipse(-8+R()*10,-9+R()*3,3.2,2,R(),0,TAU);c.fill()}
  // olhos
  c.fillStyle='#050505';c.beginPath();c.ellipse(3.5,-2.5,3.6,3.2,0,0,TAU);c.fill();c.beginPath();c.ellipse(-3.5,-2,2.6,2.6,0,0,TAU);c.fill();
  c.globalCompositeOperation='lighter';glowAt(c,3.5,-2.5,10,D.eye,.55);c.globalCompositeOperation='source-over';c.fillStyle=D.eye;c.fillRect(3,-3,2.4,2);c.fillRect(-3.8,-2.4,1.8,1.6);
  // boca
  const jaw=atk?8:4;c.fillStyle='#2a0505';c.beginPath();c.ellipse(5.5,6+jaw/2,5.5,2.5+jaw/2,0,0,TAU);c.fill();
  c.fillStyle='#d8d2bc';for(let i=0;i<4;i++)c.fillRect(2+i*2.6,5,1.5,2.2);
  c.fillStyle='rgba(110,6,6,.85)';c.beginPath();c.ellipse(6,11+jaw,3,4,0,0,TAU);c.fill();
  c.restore();
  c.restore();
}
function drawZombieAtlas(sc,t){
  const c=cv(ZW*9,ZH),x=c.getContext('2d');
  for(let i=0;i<8;i++)zombie(x,ZW*i,t,i*TAU/8,false,i);
  zombie(x,ZW*8,t,0,true,8);
  addAtlas(sc,'zomb'+t,c,ZW,ZH,9);
}

/* ===================== CHEFE: O HOSPEDEIRO ===================== */
function boss(c,ox,ph,pose){ // pose: 0 andar,1 preparar,2 ataque
  const R=mk(900),cx=ox+230,base=440;c.save();c.translate(cx,base);
  const SK='#6c7761',SKd='#3d4637',FL='#7a2a28',BN='#d9d2bb';
  c.shadowColor='rgba(0,0,0,.45)';c.shadowBlur=10;
  const L1=70,L2=70;
  const lp=p=>[.32*Math.sin(p),.14+.7*Math.pow(Math.max(0,Math.cos(p)),1.4)];
  const pp=[lp(ph),lp(ph+Math.PI)],offs=pp.map(p=>L1*Math.cos(p[0])+L2*Math.cos(p[0]-p[1]));
  const hy=-6-Math.max(offs[0],offs[1]);
  const bossLeg=(p,dark)=>{const t=p[0],k=p[1],kx=Math.sin(t)*L1-8,ky=hy+Math.cos(t)*L1,s=t-k,ax=kx+Math.sin(s)*L2,ay=ky+Math.cos(s)*L2,col=dark?sh(SK,.7):SK;
    limb(c,-8,hy,kx,ky,25,18,col,undefined,sh(col,.3));limb(c,kx,ky,ax,ay,18,12,col,undefined,sh(col,.3));
    c.fillStyle=dark?'#161512':'#201e1a';c.beginPath();c.moveTo(ax-10,ay-8);c.lineTo(ax+18,ay-2);c.lineTo(ax+34,ay+6);c.lineTo(ax-14,ay+6);c.fill();
    c.fillStyle=BN;for(let i=0;i<3;i++)poly(c,[[ax+28+i*3,ay+2],[ax+40+i*3,ay+5],[ax+28+i*3,ay+7]],BN);
    blob(c,kx,ky,10,9,FL,.55)};
  bossLeg(pp[1],true);
  // espinhos nas costas
  const lean=[.55,.3,.18,.85][pose],sx=Math.sin(lean)*125-4,sy=hy-Math.cos(lean)*125;
  for(let i=0;i<7;i++){const t=i/6,bx=-30+(sx-5)*t-18,by=hy-14-(hy-sy-14)*t;poly(c,[[bx,by],[bx-30-i*2,by-16-R()*12],[bx+3,by-12]],BN)}
  // tumores
  [[-34,-50,24],[-48,-120,18],[-10,-140,15],[-44,-88,13]].forEach(([tx,ty,r])=>{const g=c.createRadialGradient(tx-4,hy+ty-4,2,tx,hy+ty,r);g.addColorStop(0,'#9aa56a');g.addColorStop(.55,'#5d6a45');g.addColorStop(1,'#26301f');c.fillStyle=g;c.beginPath();c.arc(tx,hy+ty,r,0,TAU);c.fill();c.globalCompositeOperation='lighter';glowAt(c,tx,hy+ty,r*1.6,'#c9e040',.22);c.globalCompositeOperation='source-over'});
  // braço de trás
  const farA=[.7+Math.sin(ph)*.06,1.0,1.1,.9][pose];
  const armBoss=(a1,a2,big,col,dark,k)=>{k=k||1;const ssx=sx+(dark?-4:8),ssy=sy+14,U=(big?100:76)*k,Lw=(big?118:88)*k,ex=ssx+Math.sin(a1)*U,ey=ssy+Math.cos(a1)*U,wx=ex+Math.sin(a2)*Lw,wy=ey+Math.cos(a2)*Lw;
    limb(c,ssx,ssy,ex,ey,big?30:20,big?25:15,col,undefined,sh(col,.3));limb(c,ex,ey,wx,wy,big?25:15,big?38:13,col,undefined,sh(col,.3));
    if(big){c.fillStyle=BN;for(let i=0;i<4;i++){const q=(i-1.5)*14;poly(c,[[wx-14+q,wy-18],[wx+q,wy-52-R()*16],[wx+14+q,wy-18]],BN)}blob(c,wx,wy,26,22,FL,.5)}
    return[wx,wy]};
  armBoss(farA,farA+.1,false,sh(SK,.65),true);
  // coxas e tronco
  bossLeg(pp[0],false);
  limb(c,-10,hy+4,sx,sy,44,56,SK,undefined,sh(SK,.28));
  blob(c,-10,hy-36,42,30,'#394230',.5);
  // cavidade do peito exposta
  c.save();c.beginPath();c.ellipse(sx-14,sy+54,28,50,.18,0,TAU);c.clip();
  const cg=c.createRadialGradient(sx-14,sy+54,4,sx-14,sy+54,54);cg.addColorStop(0,'#c88a1a');cg.addColorStop(.35,'#6a1a12');cg.addColorStop(1,'#1c0505');c.fillStyle=cg;c.fillRect(sx-50,sy,70,120);
  c.strokeStyle=BN;c.lineWidth=5;c.lineCap='round';for(let i=0;i<6;i++){c.beginPath();c.moveTo(sx-48,sy+12+i*15);c.quadraticCurveTo(sx-14,sy+2+i*15,sx+16,sy+14+i*15);c.stroke()}
  c.restore();
  c.globalCompositeOperation='lighter';glowAt(c,sx-14,sy+54,70,'#f0b030',.38);c.globalCompositeOperation='source-over';
  c.strokeStyle='rgba(20,0,0,.6)';c.lineWidth=2;c.beginPath();c.ellipse(sx-14,sy+54,28,50,.18,0,TAU);c.stroke();
  // pelos de carne / veias
  c.strokeStyle='rgba(200,230,80,.45)';c.lineWidth=2;for(let i=0;i<10;i++){c.beginPath();let vx=sx-40+R()*80,vy=sy+R()*130;c.moveTo(vx,vy);for(let k=0;k<4;k++){vx+=(R()-.4)*20;vy+=(R()-.3)*22;c.lineTo(vx,vy)}c.stroke()}
  for(let i=0;i<16;i++)blob(c,sx-40+R()*90,sy+R()*140,5+R()*14,4+R()*11,i%3?'#3b0808':FL,.55);
  const drawNear=()=>{const nearA=[.5+Math.sin(ph+1)*.07,2.0,2.25,.45][pose];armBoss(nearA,nearA+[.2,.45,.5,-.15][pose],true,SK,false,pose==1||pose==2?.85:1)};
  if(pose==1||pose==2)drawNear();
  // cabeça
  const hdx=sx+30,hdy=sy-18+(pose==1||pose==2?-10:0);
  limb(c,sx-6,sy+2,hdx-8,hdy+14,16,14,SKd);
  // crescimento fúngico
  c.strokeStyle='#d8caa0';c.lineWidth=3;c.lineCap='round';[[-14,-14,-30,-52],[0,-16,6,-58],[12,-12,34,-44],[-8,-10,-36,-34]].forEach(([a,b,d,e],i)=>{c.beginPath();c.moveTo(hdx+a,hdy+b);c.quadraticCurveTo(hdx+(a+d)/2+8,hdy+(b+e)/2,hdx+d,hdy+e);c.stroke();c.lineWidth=1.8;c.beginPath();c.moveTo(hdx+d,hdy+e);c.lineTo(hdx+d+9,hdy+e-12);c.moveTo(hdx+d,hdy+e);c.lineTo(hdx+d-8,hdy+e-10);c.stroke();c.lineWidth=3;c.globalCompositeOperation='lighter';glowAt(c,hdx+d,hdy+e,12,'#e8e070',.5);c.globalCompositeOperation='source-over'});
  const hg=c.createRadialGradient(hdx+6,hdy-6,3,hdx,hdy,26);hg.addColorStop(0,'#9ea88a');hg.addColorStop(.7,SK);hg.addColorStop(1,sh(SK,.35));
  c.fillStyle=hg;c.beginPath();c.ellipse(hdx,hdy,24,26,.2,0,TAU);c.fill();
  c.fillStyle='#050404';c.beginPath();c.ellipse(hdx+10,hdy-4,8,7,0,0,TAU);c.fill();c.beginPath();c.ellipse(hdx-6,hdy-3,6,5.5,0,0,TAU);c.fill();
  c.globalCompositeOperation='lighter';glowAt(c,hdx+10,hdy-4,22,'#ffd040',.7);glowAt(c,hdx-6,hdy-3,16,'#ffd040',.5);c.globalCompositeOperation='source-over';
  c.fillStyle='#fff3a0';c.fillRect(hdx+8,hdy-6,5,4);c.fillRect(hdx-8,hdy-5,4,3);
  // mandíbula
  const jo=[8,14,18,22][pose];
  c.fillStyle='#1b0404';c.beginPath();c.moveTo(hdx-8,hdy+10);c.lineTo(hdx+22,hdy+8);c.lineTo(hdx+18,hdy+16+jo);c.lineTo(hdx-2,hdy+22+jo);c.closePath();c.fill();
  c.fillStyle=BN;for(let i=0;i<6;i++){poly(c,[[hdx-4+i*4.6,hdy+10],[hdx-2+i*4.6,hdy+10],[hdx-3+i*4.6,hdy+18]],BN);poly(c,[[hdx-3+i*4,hdy+16+jo+(i%2)*3],[hdx-1+i*4,hdy+16+jo+(i%2)*3],[hdx-2+i*4,hdy+8+jo+(i%2)*3]],BN)}
  c.fillStyle='rgba(120,6,6,.85)';c.beginPath();c.ellipse(hdx+10,hdy+26+jo,5,9,0,0,TAU);c.fill();
  // braço grande
  if(!(pose==1||pose==2))drawNear();
  c.restore();
}
function drawBossAtlas(sc){
  const c=cv(BW*7,BH),x=c.getContext('2d');
  for(let i=0;i<4;i++)boss(x,BW*i,i*TAU/4,0);
  boss(x,BW*4,0,1);boss(x,BW*5,.4,2);boss(x,BW*6,0,3);
  addAtlas(sc,'boss',c,BW,BH,7);
}

/* ===================== HELICÓPTERO / EFEITOS ===================== */
function drawHeli(){
  const c=cv(380,140),x=c.getContext('2d');
  x.shadowColor='rgba(0,0,0,.5)';x.shadowBlur=8;
  // cauda
  const tg=x.createLinearGradient(0,50,0,70);tg.addColorStop(0,'#46544d');tg.addColorStop(1,'#1a221e');x.fillStyle=tg;
  poly(x,[[190,52],[360,56],[364,64],[190,76]],tg);poly(x,[[340,56],[372,22],[380,26],[364,66]],'#2a3631');
  x.fillStyle='rgba(255,255,255,.75)';x.font='bold 9px Arial';x.fillText('RESGATE',250,66);
  // corpo
  const bg=x.createLinearGradient(0,34,0,104);bg.addColorStop(0,'#5a6b62');bg.addColorStop(.4,'#34433b');bg.addColorStop(1,'#141b17');
  x.fillStyle=bg;x.beginPath();x.moveTo(34,70);x.quadraticCurveTo(30,40,78,36);x.lineTo(170,34);x.quadraticCurveTo(212,36,216,64);x.quadraticCurveTo(214,100,170,104);x.lineTo(74,102);x.quadraticCurveTo(34,102,34,70);x.fill();
  // cabine
  const gg=x.createLinearGradient(40,40,120,96);gg.addColorStop(0,'#9ec6e0');gg.addColorStop(.5,'#3c5a72');gg.addColorStop(1,'#0e1822');
  x.fillStyle=gg;x.beginPath();x.moveTo(38,70);x.quadraticCurveTo(38,46,82,42);x.lineTo(120,42);x.lineTo(124,92);x.lineTo(80,94);x.quadraticCurveTo(40,94,38,70);x.fill();
  x.strokeStyle='rgba(255,255,255,.22)';x.lineWidth=2;x.beginPath();x.moveTo(52,52);x.lineTo(96,48);x.stroke();
  x.fillStyle='#0b0f0d';x.fillRect(122,40,3,56);
  // porta aberta com silhueta
  x.fillStyle='#0a0d0c';x.fillRect(132,50,56,40);x.fillStyle='#1b2420';x.beginPath();x.arc(158,62,8,0,TAU);x.fill();x.fillRect(150,70,16,20);
  // mastro e esquis
  x.fillStyle='#1a211d';x.fillRect(120,22,18,16);x.fillRect(66,108,138,5);x.fillRect(90,100,5,10);x.fillRect(160,100,5,10);
  x.fillStyle='#e6c25a';x.fillRect(36,76,6,4);x.shadowBlur=0;
  return c;
}
function drawRotor(){const c=cv(520,40),x=c.getContext('2d');const g=x.createLinearGradient(0,0,520,0);g.addColorStop(0,'rgba(210,225,235,0)');g.addColorStop(.12,'rgba(210,225,235,.35)');g.addColorStop(.5,'rgba(230,240,250,.55)');g.addColorStop(.88,'rgba(210,225,235,.35)');g.addColorStop(1,'rgba(210,225,235,0)');x.fillStyle=g;x.beginPath();x.ellipse(260,20,260,9,0,0,TAU);x.fill();x.fillStyle='rgba(20,24,22,.8)';x.fillRect(236,17,48,6);return c}
function drawBeam(){const c=cv(360,520),x=c.getContext('2d');const g=x.createLinearGradient(0,0,0,520);g.addColorStop(0,'rgba(255,245,210,.65)');g.addColorStop(1,'rgba(255,245,210,.0)');x.fillStyle=g;x.beginPath();x.moveTo(170,0);x.lineTo(190,0);x.lineTo(360,520);x.lineTo(0,520);x.closePath();x.fill();return c}
function drawLadder(){const c=cv(26,460),x=c.getContext('2d');x.strokeStyle='#cfc7a8';x.lineWidth=3;x.beginPath();x.moveTo(3,0);x.lineTo(3,460);x.moveTo(23,0);x.lineTo(23,460);x.stroke();x.lineWidth=3.5;x.strokeStyle='#8c7a4a';for(let y=10;y<460;y+=22){x.beginPath();x.moveTo(3,y);x.lineTo(23,y);x.stroke()}return c}
function radial(size,stops){const c=cv(size,size),x=c.getContext('2d'),g=x.createRadialGradient(size/2,size/2,0,size/2,size/2,size/2);stops.forEach(s=>g.addColorStop(s[0],s[1]));x.fillStyle=g;x.fillRect(0,0,size,size);return c}
function bloodText(text,sz,w,h,font,seed){
  const c=cv(w,h),x=c.getContext('2d'),R=mk(seed||7),m=cv(w,h),mx=m.getContext('2d');
  const tm=cv(10,10).getContext('2d');tm.font=`italic 900 ${sz}px ${font||FONT_SERIF}`;const mw=Math.max(...text.split('\n').map(l=>tm.measureText(l).width));if(mw>w-120)sz=sz*(w-120)/mw;
  const f=`italic 900 ${sz}px ${font||FONT_SERIF}`,lines=text.split('\n'),lh=sz*1.1,y0=h/2-(lines.length-1)*lh/2-sz*.04;
  mx.font=f;mx.textAlign='center';mx.textBaseline='middle';lines.forEach((l,i)=>mx.fillText(l,w/2,y0+i*lh));
  const d=mx.getImageData(0,0,w,h).data;
  for(let i=0;i<90;i++){const px=w*.06+R()*w*.88,py=h*.15+R()*h*.7,r=1+R()*(R()<.12?10:3.5);x.fillStyle=`rgba(${95+R()*55|0},0,0,${.3+R()*.5})`;x.beginPath();x.arc(px,py,r,0,TAU);x.fill()}
  x.font=f;x.textAlign='center';x.textBaseline='middle';x.shadowColor='rgba(70,0,0,.95)';x.shadowBlur=16;
  const g=x.createLinearGradient(0,h*.2,0,h*.8);g.addColorStop(0,'#d92020');g.addColorStop(.5,'#a50f0f');g.addColorStop(1,'#5a0505');x.fillStyle=g;lines.forEach((l,i)=>x.fillText(l,w/2,y0+i*lh));
  x.shadowBlur=0;x.strokeStyle='rgba(25,0,0,.7)';x.lineWidth=2;lines.forEach((l,i)=>x.strokeText(l,w/2,y0+i*lh));
  x.strokeStyle='rgba(255,140,120,.25)';x.lineWidth=1;lines.forEach((l,i)=>x.strokeText(l,w/2-1,y0+i*lh-1));
  for(let px=3;px<w-3;px+=2){for(let py=6;py<h-120;py++){const a=d[(py*w+px)*4+3],b=d[((py+1)*w+px)*4+3];
    if(a>150&&b<40&&R()<.075){const len=16+R()*(R()<.22?120:46),wd=1.8+R()*3.4;x.fillStyle='#8c0c0c';x.fillRect(px-wd/2,py-2,wd,len);x.beginPath();x.arc(px,py+len,wd*.95,0,TAU);x.fill();x.fillStyle='rgba(255,170,150,.35)';x.fillRect(px-wd/2+.5,py,.8,len*.8)}}}
  return c;
}

function buildAssets(sc){
  addTex(sc,'sky',bgSky());addTex(sc,'far',bgFar());addTex(sc,'mid',bgMid());addTex(sc,'street',bgStreet());
  addTex(sc,'car1',drawCar(330,130,5,'#2f4a6d',false));addTex(sc,'car2',drawCar(300,150,9,'#8a8c86',true));
  addTex(sc,'barricade',drawBarricade());addTex(sc,'lamp',drawLamp(false));addTex(sc,'lampDead',drawLamp(true));
  drawPlayerAtlas(sc);[0,1,2].forEach(t=>addTex(sc,'arm'+t,drawArms(t)));
  [0,1,2].forEach(t=>{const c=cv(120,50),x=c.getContext('2d');drawGun(x,t,-14,-10);addTex(sc,'icon'+t,c)});
  [0,1,2,3,4].forEach(t=>drawZombieAtlas(sc,t));drawBossAtlas(sc);
  addTex(sc,'heli',drawHeli());addTex(sc,'rotor',drawRotor());addTex(sc,'beam',drawBeam());addTex(sc,'ladder',drawLadder());
  addTex(sc,'light',radial(256,[[0,'rgba(255,255,255,1)'],[.25,'rgba(255,255,255,.75)'],[.55,'rgba(255,255,255,.28)'],[1,'rgba(255,255,255,0)']]));
  addTex(sc,'dot',radial(16,[[0,'rgba(255,255,255,1)'],[.5,'rgba(255,255,255,.7)'],[1,'rgba(255,255,255,0)']]));
  addTex(sc,'glowW',radial(256,[[0,'rgba(255,214,130,.9)'],[.3,'rgba(255,170,70,.35)'],[1,'rgba(255,140,40,0)']]));
  addTex(sc,'glowR',radial(256,[[0,'rgba(255,60,40,.7)'],[.4,'rgba(200,20,10,.25)'],[1,'rgba(160,0,0,0)']]));
  addTex(sc,'glowG',radial(128,[[0,'rgba(190,255,90,.8)'],[1,'rgba(120,200,30,0)']]));
  addTex(sc,'smoke',radial(64,[[0,'rgba(190,190,190,.55)'],[1,'rgba(150,150,150,0)']]));
  addTex(sc,'vign',(()=>{const c=cv(W,H),x=c.getContext('2d'),g=x.createRadialGradient(W/2,H/2,H*.3,W/2,H/2,H*.95);g.addColorStop(0,'rgba(150,0,0,0)');g.addColorStop(1,'rgba(160,0,0,.9)');x.fillStyle=g;x.fillRect(0,0,W,H);return c})());
  addTex(sc,'cone',(()=>{const c=cv(520,260),x=c.getContext('2d'),g=x.createRadialGradient(0,130,0,0,130,520);g.addColorStop(0,'rgba(255,255,255,1)');g.addColorStop(.4,'rgba(255,255,255,.55)');g.addColorStop(1,'rgba(255,255,255,0)');x.fillStyle=g;x.beginPath();x.moveTo(0,118);x.lineTo(520,0);x.lineTo(520,260);x.lineTo(0,142);x.closePath();x.fill();return c})());
  addTex(sc,'shadow',radial(128,[[0,'rgba(0,0,0,.75)'],[.6,'rgba(0,0,0,.35)'],[1,'rgba(0,0,0,0)']]));
  addTex(sc,'drop',(()=>{const c=cv(3,22),x=c.getContext('2d'),g=x.createLinearGradient(0,0,0,22);g.addColorStop(0,'rgba(190,210,235,0)');g.addColorStop(1,'rgba(190,210,235,.9)');x.fillStyle=g;x.fillRect(0,0,2,22);return c})());
  addTex(sc,'casing',(()=>{const c=cv(8,4),x=c.getContext('2d');x.fillStyle='#d6a73a';x.fillRect(0,0,8,4);x.fillStyle='#fff3b0';x.fillRect(0,0,8,1);return c})());
  addTex(sc,'chunk',(()=>{const c=cv(10,8),x=c.getContext('2d');x.fillStyle='#5a0a0a';poly(x,[[1,2],[7,0],[10,5],[4,8],[0,6]],'#6a0c0c');return c})());
  addTex(sc,'tracer',(()=>{const c=cv(64,6),x=c.getContext('2d'),g=x.createLinearGradient(0,0,64,0);g.addColorStop(0,'rgba(255,200,90,0)');g.addColorStop(.8,'rgba(255,230,150,.9)');g.addColorStop(1,'rgba(255,255,230,1)');x.fillStyle=g;x.fillRect(0,1,64,4);return c})());
  addTex(sc,'flash',(()=>{const c=cv(96,96),x=c.getContext('2d');glowAt(x,48,48,46,'#ffb040',.9);x.save();x.translate(48,48);x.fillStyle='rgba(255,240,190,.95)';for(let i=0;i<6;i++){x.rotate(TAU/6);poly(x,[[0,-3],[40+((i*7)%14),0],[0,3]],'rgba(255,235,170,.95)')}x.restore();glowAt(x,48,48,14,'#ffffff',1);return c})());
  [0,1,2].forEach(i=>addTex(sc,'splat'+i,(()=>{const c=cv(120,34),x=c.getContext('2d'),R=mk(300+i);for(let k=0;k<14;k++)blob(x,60+(R()-.5)*90,17+(R()-.5)*10,8+R()*24,3+R()*7,k%3?'#5c0909':'#2e0404',.85);return c})()));
  addTex(sc,'medkit',(()=>{const c=cv(34,28),x=c.getContext('2d');rr(x,2,4,30,22,4,'#e8e8e2');x.fillStyle='#2a2a2a';x.fillRect(11,1,12,5);x.fillStyle='#c01818';x.fillRect(14,9,6,14);x.fillRect(10,13,14,6);return c})());
  addTex(sc,'heart1',(()=>{const c=cv(38,34),x=c.getContext('2d'),g=x.createLinearGradient(0,0,0,34);g.addColorStop(0,'#ff5a5a');g.addColorStop(.5,'#d11c1c');g.addColorStop(1,'#7a0808');x.fillStyle=g;x.beginPath();x.moveTo(19,31);x.bezierCurveTo(-8,14,6,-4,19,8);x.bezierCurveTo(32,-4,46,14,19,31);x.fill();x.strokeStyle='#2a0505';x.lineWidth=1.5;x.stroke();x.fillStyle='rgba(255,255,255,.4)';x.beginPath();x.ellipse(11,9,4,2.4,-.6,0,TAU);x.fill();return c})());
  addTex(sc,'heart0',(()=>{const c=cv(38,34),x=c.getContext('2d');x.fillStyle='rgba(40,12,12,.7)';x.beginPath();x.moveTo(19,31);x.bezierCurveTo(-8,14,6,-4,19,8);x.bezierCurveTo(32,-4,46,14,19,31);x.fill();x.strokeStyle='rgba(120,40,40,.8)';x.lineWidth=1.5;x.stroke();return c})());
  addTex(sc,'wave',(()=>{const c=cv(180,56),x=c.getContext('2d'),R=mk(5);for(let i=0;i<22;i++)blob(x,20+i*7.4,46-Math.sin(i/21*Math.PI)*28+R()*6,14+R()*10,10+R()*8,'#6b5a48',.7);glowAt(x,90,50,80,'#b08a60',.25);return c})());
  addTex(sc,'bile',radial(40,[[0,'rgba(220,255,120,1)'],[.5,'rgba(120,200,40,.9)'],[1,'rgba(60,120,10,0)']]));
  addTex(sc,'fog',(()=>{const c=cv(512,256),x=c.getContext('2d'),R=mk(88);for(let i=0;i<22;i++){const px=R()*512,py=60+R()*140,rx=70+R()*110,ry=18+R()*34;[-512,0,512].forEach(o=>blob(x,px+o,py,rx,ry,'#b9c6d2',.22))}return c})());
  addTex(sc,'grain',(()=>{const c=cv(256,256),x=c.getContext('2d'),id=x.createImageData(256,256),R=mk(3);for(let i=0;i<id.data.length;i+=4){const v=R()*255;id.data[i]=id.data[i+1]=id.data[i+2]=v;id.data[i+3]=R()<.5?255:0}x.putImageData(id,0,0);return c})());
  addTex(sc,'blood_dead',bloodText('FOI ASSIM\nQUE VOCÊ MORREU.',118,1180,420,FONT_SERIF,21));
  addTex(sc,'blood_title',bloodText('ZOMBIE RUSH',170,1180,300,'Impact,"Arial Black",sans-serif',33));
}
