import sharp from 'sharp';
import {cleanSprite} from './clean-sprite.mjs';
import {mkdir,writeFile} from 'node:fs/promises';
const id=process.argv[2]||'nezha';
const file=`work/art-source/${id}-atlas.png`;
const meta=await sharp(file).metadata();
const names=['head','happy','blush','angry','top','pants','armL','armR','foreL','foreR','shoeL','shoeR','back','hand','effect','hat'];
const custom={nezha:[[0,0,319,335],[330,0,308,335],[638,0,307,335],[945,0,309,335],[0,334,329,281],[330,337,362,281],[707,342,175,159],[963,342,235,159],[53,622,204,279],[391,622,215,279],[641,648,239,247],[973,648,257,247],[0,902,334,352],[337,902,284,325],[622,890,323,364],[954,902,300,352]]};
const bands={rabbit:[0,365,669,930,1254],base:[0,336,638,891,1254],lubu:[0,348,628,893,1254],strawberry:[0,317,618,897,1254],bear:[0,340,619,901,1254],frog:[0,347,624,914,1254],guanyu:[0,337,624,894,1254],monkey:[0,312,614,901,1254],galaxy:[0,330,633,898,1254],ice:[0,320,616,902,1254],lion:[0,306,621,899,1254]};
if(bands[id])custom[id]=Array.from({length:16},(_,i)=>[Math.floor(i%4*meta.width/4),bands[id][Math.floor(i/4)],Math.floor(meta.width/4),bands[id][Math.floor(i/4)+1]-bands[id][Math.floor(i/4)]]);
if(id==='base')custom[id][4]=[0,336,313,201];
await mkdir(`public/art/rig/${id}`,{recursive:true});
for(let i=0;i<16;i++){
 const rect=custom[id]?.[i]||[Math.floor(i%4*meta.width/4),Math.floor(Math.floor(i/4)*meta.height/4),Math.floor(meta.width/4),Math.floor(meta.height/4)];
 const [left,top,width,height]=rect;
 const cell=await sharp(file).extract({left,top,width,height}).png().toBuffer();
 await sharp(await cleanSprite(cell)).trim({background:'#00000000',threshold:12}).webp({quality:94}).toFile(`public/art/rig/${id}/${names[i]}.webp`);
}
await writeFile(`public/art/rig/${id}/source.json`,JSON.stringify({source:file,parts:names,rects:custom[id]||'uniform-grid',model:'codex-image-generation'},null,2));
