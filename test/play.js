const {chromium}=require('playwright');
(async()=>{
 const b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist','--use-gl=angle','--autoplay-policy=no-user-gesture-required']});
 const p=await b.newPage({viewport:{width:1280,height:720}});
 p.on('console',m=>{const t=m.text();if(!/GL Driver|Phaser v/.test(t))console.log('C:',t)});p.on('pageerror',e=>console.log('E:',e.message));
 await p.goto('file://'+require('path').resolve(__dirname,'../dist/dev.html'));await p.waitForFunction(()=>window.ready,null,{timeout:30000});await p.waitForTimeout(800);
 const steps=JSON.parse(process.argv[2]);
 for(const [js,wait,out] of steps){ if(js)console.log('R:',JSON.stringify(await p.evaluate(js)));await p.waitForTimeout(wait||500);if(out)await p.screenshot({path:out});}
 await b.close();})();
