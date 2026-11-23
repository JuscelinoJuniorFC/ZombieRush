const fs=require('fs');
const rd=f=>fs.readFileSync(f,'utf8');
const css=`html,body{margin:0;height:100%;background:#040506;overflow:hidden}#game{position:fixed;inset:0}canvas{display:block}`;
function page(phaser,inline){
  const js=['src/sounds.js','src/assets.js','src/assets2.js','src/realism.js','src/audio.js','src/game.js'].map(f=>`<script>${rd(f)}</script>`).join('\n');
  return `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,user-scalable=no"><title>Zombie Rush</title><style>${css}</style></head><body><div id="game"></div><script src="${phaser}"></script>\n${js}</body></html>`;
}
fs.mkdirSync('dist',{recursive:true});
fs.writeFileSync('dist/dev.html',page('../node_modules/phaser/dist/phaser.min.js'));
fs.writeFileSync('dist/zombie-rush.html',page('https://cdnjs.cloudflare.com/ajax/libs/phaser/3.80.1/phaser.min.js'));
fs.writeFileSync('dist/index.html',page('phaser.min.js'));
fs.copyFileSync('node_modules/phaser/dist/phaser.min.js','dist/phaser.min.js');
console.log('ok',fs.statSync('dist/dev.html').size);
