/* ===================== REALISMO: textura, normal maps, pós-processamento ===================== */
// textura de "sujeira" aplicada só onde há pixels (deixa as superfícies menos lisas)
function grit(cnv,amt,seed,scale){
  const w=cnv.width,h=cnv.height,x=cnv.getContext('2d'),R=mk(seed||1);
  // ruído suave (manchas de sujeira/desgaste) + ruído fino bem leve
  const sm=cv(64,64),sx=sm.getContext('2d'),sd=sx.createImageData(64,64);
  for(let i=0;i<sd.data.length;i+=4){const v=R()*255;sd.data[i]=sd.data[i+1]=sd.data[i+2]=v;sd.data[i+3]=255}
  sx.putImageData(sd,0,0);
  const n=cv(256,256),nx=n.getContext('2d');nx.imageSmoothingEnabled=true;nx.drawImage(sm,0,0,256,256);
  const fine=cv(256,256),fx=fine.getContext('2d'),fd=fx.createImageData(256,256);
  for(let i=0;i<fd.data.length;i+=4){const v=R()*255;fd.data[i]=fd.data[i+1]=fd.data[i+2]=v;fd.data[i+3]=255}
  fx.putImageData(fd,0,0);nx.globalAlpha=.25;nx.drawImage(fine,0,0);
  const t=cv(w,h),tx=t.getContext('2d');tx.drawImage(cnv,0,0);
  tx.globalCompositeOperation='overlay';tx.globalAlpha=amt;const s=scale||1;tx.scale(s,s);tx.fillStyle=tx.createPattern(n,'repeat');tx.fillRect(0,0,w/s,h/s);
  tx.setTransform(1,0,0,1,0,0);tx.globalAlpha=1;tx.globalCompositeOperation='destination-in';tx.drawImage(cnv,0,0);
  x.clearRect(0,0,w,h);x.drawImage(t,0,0);
}
// gera normal map a partir do alfa (volume arredondado) + luminância (relevo fino)
function normalFrom(cnv,o){
  o=o||{};const w=cnv.width,h=cnv.height,src=cnv.getContext('2d').getImageData(0,0,w,h).data,N=w*h;
  const r=o.r||5,bev=o.bevel===undefined?1:o.bevel,det=o.detail===undefined?.35:o.detail,str=o.str||2.2;
  let A=new Float32Array(N),L=new Float32Array(N);
  for(let i=0;i<N;i++){const a=src[i*4+3]/255;A[i]=a;L[i]=(src[i*4]*.3+src[i*4+1]*.59+src[i*4+2]*.11)/255*a}
  const blur=(F,rad)=>{const T=new Float32Array(N),O=new Float32Array(N),d=rad*2+1;
    for(let y=0;y<h;y++){let s=0;const row=y*w;for(let x=-rad;x<=rad;x++)s+=F[row+Math.min(w-1,Math.max(0,x))];
      for(let x=0;x<w;x++){T[row+x]=s/d;s+=F[row+Math.min(w-1,x+rad+1)]-F[row+Math.max(0,x-rad)]}}
    for(let x=0;x<w;x++){let s=0;for(let y=-rad;y<=rad;y++)s+=T[Math.min(h-1,Math.max(0,y))*w+x];
      for(let y=0;y<h;y++){O[y*w+x]=s/d;s+=T[Math.min(h-1,y+rad+1)*w+x]-T[Math.max(0,y-rad)*w+x]}}
    return O};
  let Hm=new Float32Array(N);
  if(bev>0){let B=blur(blur(A,r),r);for(let i=0;i<N;i++)Hm[i]=Math.sqrt(B[i])*bev}
  if(det>0){const Lb=blur(L,1);for(let i=0;i<N;i++)Hm[i]+=Lb[i]*det}
  const out=cv(w,h),ox=out.getContext('2d'),id=ox.createImageData(w,h),D=id.data;
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){
    const i=y*w+x,xl=x>0?i-1:i,xr=x<w-1?i+1:i,yu=y>0?i-w:i,yd=y<h-1?i+w:i;
    let nx=-(Hm[xr]-Hm[xl])*str*10,ny=(Hm[yd]-Hm[yu])*str*10,nz=1;const l=Math.hypot(nx,ny,nz);nx/=l;ny/=l;nz/=l;
    D[i*4]=(nx*.5+.5)*255;D[i*4+1]=(ny*.5+.5)*255;D[i*4+2]=(nz*.5+.5)*255;D[i*4+3]=255}
  ox.putImageData(id,0,0);return out;
}
function buildRealism(sc){
  const list=[
    ['ply',{g:.5,r:6,bevel:1,detail:.4}],['arm0',{g:.4,r:4}],['arm1',{g:.4,r:4}],['arm2',{g:.4,r:4}],
    ['zomb0',{g:.7,r:6}],['zomb1',{g:.7,r:6}],['zomb2',{g:.7,r:8}],['zomb3',{g:.7,r:6}],['zomb4',{g:.7,r:6}],
    ['boss',{g:.6,r:12,str:1.6}],['witch',{g:.5,r:6}],
    ['car1',{g:.35,r:10,str:1.4,detail:.5}],['car2',{g:.35,r:10,str:1.4,detail:.5}],
    ['lamp',{g:.3,r:3}],['lampDead',{g:.3,r:3}],['barricade',{g:.6,r:6,detail:.6}],
    ['mid',{g:.35,r:2,bevel:.3,detail:.45,str:1.2}],['street',{g:.4,r:2,bevel:.15,detail:.5,str:1.2}],['far',{g:.2,r:2,bevel:.15,detail:.3,str:.8}]];
  list.forEach(([k,o],i)=>{
    const t=sc.textures.get(k);if(!t||t.key==='__MISSING')return;
    const c=t.getSourceImage();if(o.g)grit(c,o.g*.9,40+i,k==='mid'||k==='street'||k==='far'?2:.6);
    if(t.refresh)t.refresh();
    t.setDataSource(normalFrom(c,o));
  });
}
// corrige a iluminação de sprites espelhados (o Phaser só considera rotação no normal map)
function patchLightFlip(){
  const LP=Phaser.Renderer.WebGL.Pipelines.LightPipeline.prototype;if(LP.__zrFlip)return;LP.__zrFlip=true;
  const oST=LP.setTexture2D,oSG=LP.setGameObject;
  LP.setTexture2D=function(t,go){this._fx=!!(go&&go.scaleX<0);return oST.call(this,t,go)};
  LP.setGameObject=function(go,f){this._fx=!!(go&&go.scaleX<0);return oSG.call(this,go,f)};
  LP.setNormalMapRotation=function(r){
    r=r||0;const key=r+(this._fx?100:0);
    if(key!==this.currentNormalMapRotation||this.vertexCount===0){
      if(this.vertexCount>0)this.flush();
      const e=this.inverseRotationMatrix,a=-r,c=Math.cos(a),s=Math.sin(a);
      e[0]=c;e[1]=s;e[3]=-s;e[4]=c;if(this._fx){e[0]=-e[0];e[1]=-e[1]}
      this.setMatrix3fv('uInverseRotationMatrix',false,e);this.currentNormalMapRotation=key}
  };
}
// pós-processamento cinematográfico: tonemapping filmico, gradação de cor, aberração cromática, grão e lente
const GRADE_FRAG=`
#define SHADER_NAME ZR_GRADE
precision mediump float;
uniform sampler2D uMainSampler;
uniform float uTime;
uniform float uRed;
uniform float uHit;
varying vec2 outTexCoord;
float hash(vec2 p){return fract(sin(dot(p,vec2(12.9898,78.233)))*43758.5453);}
vec3 aces(vec3 x){return clamp((x*(2.51*x+0.03))/(x*(2.43*x+0.59)+0.14),0.0,1.0);}
void main(){
  vec2 uv=outTexCoord;vec2 d=uv-0.5;float r2=dot(d,d);
  float ca=(0.001+uHit*0.006)*(r2*5.0);
  vec3 c;
  c.r=texture2D(uMainSampler,uv+d*ca).r;
  c.g=texture2D(uMainSampler,uv).g;
  c.b=texture2D(uMainSampler,uv-d*ca).b;
  // brilho suave (halation) das luzes fortes
  vec3 h=vec3(0.0);
  for(int i=0;i<6;i++){float a=float(i)*1.0472;vec2 o=vec2(cos(a),sin(a))*0.0042;h+=max(texture2D(uMainSampler,uv+o).rgb-0.62,0.0);}
  c+=h*vec3(0.55,0.42,0.30)*0.55;
  // exposição + tonemapping filmico
  c=aces(c*1.28);
  // gradação: sombras frias, luzes quentes
  float l=dot(c,vec3(0.2126,0.7152,0.0722));
  c=mix(c,c*vec3(0.86,0.98,1.12),(1.0-l)*0.55);
  c=mix(c,c*vec3(1.08,1.0,0.88),smoothstep(0.35,1.0,l)*0.6);
  c=mix(vec3(l),c,0.88);
  c=mix(c,c*vec3(1.18,0.78,0.74),uRed*0.45);
  // lente: vinheta e grão de filme
  c*=1.0-r2*0.9;
  float g=hash(uv*vec2(1280.0,720.0)+fract(uTime*7.13)*100.0)-0.5;
  c+=g*(0.03-l*0.015);
  gl_FragColor=vec4(c,1.0);
}`;
class GradeFX extends Phaser.Renderer.WebGL.Pipelines.PostFXPipeline{
  constructor(game){super({game,name:'GradeFX',fragShader:GRADE_FRAG});this.t=0;this.red=0;this.hit=0}
  onPreRender(){this.t+=.016;this.set1f('uTime',this.t);this.set1f('uRed',this.red);this.set1f('uHit',this.hit)}
}
// textura do facho de luz volumétrico do poste
function drawShaft(){
  const w=420,h=470,c=cv(w,h),x=c.getContext('2d');
  const g=x.createLinearGradient(0,0,0,h);g.addColorStop(0,'rgba(255,220,160,.55)');g.addColorStop(.5,'rgba(255,210,150,.18)');g.addColorStop(1,'rgba(255,200,140,0)');
  x.fillStyle=g;x.beginPath();x.moveTo(w/2-14,0);x.lineTo(w/2+14,0);x.lineTo(w,h);x.lineTo(0,h);x.closePath();x.fill();
  // suaviza as bordas
  const m=cv(w,h),mx=m.getContext('2d'),gg=mx.createLinearGradient(0,0,w,0);gg.addColorStop(0,'rgba(0,0,0,0)');gg.addColorStop(.3,'rgba(0,0,0,1)');gg.addColorStop(.7,'rgba(0,0,0,1)');gg.addColorStop(1,'rgba(0,0,0,0)');mx.fillStyle=gg;mx.fillRect(0,0,w,h);
  x.globalCompositeOperation='destination-in';x.drawImage(m,0,0);return c;
}
