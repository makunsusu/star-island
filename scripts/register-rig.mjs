import sharp from 'sharp';
import {mkdir,writeFile,readdir,readFile} from 'node:fs/promises';
import {cleanSprite} from './clean-sprite.mjs';
const ids=['base','rabbit','strawberry','bear','frog','nezha','lubu','guanyu','monkey','galaxy','ice','lion'];
const previous=JSON.parse(await readFile('src/rig/assets.json','utf8').catch(()=>'{"assets":{}}'));
const manifest={version:4,units:'source-pixels',assets:{}};
for(const family of ['headwear','hair','face','detail','lower']){
 const source=`public/art/rig-v4/source/${family}.png`;
 let m;try{m=await sharp(source).metadata();}catch{continue;}
 const names=family==='lower'?['strawberry-pants','strawberry-skirt']:family==='detail'?['grip-right','grip-left','beard','mark']:family==='face'?['idle','blink','happy','blush','angry','sad']:ids;
 const cols=['detail','lower'].includes(family)?2:family==='face'?3:4,rows=family==='lower'?1:['face','detail'].includes(family)?2:3;
 for(let i=0;i<names.length;i++){
  const x=Math.round(i%cols*m.width/cols),y=Math.round(Math.floor(i/cols)*m.height/rows),w=Math.round((i%cols+1)*m.width/cols)-x,h=Math.round((Math.floor(i/cols)+1)*m.height/rows)-y;
  const inset=family==='headwear'&&i>=8?24:0;
  const cell=await sharp(source).extract({left:x,top:y-inset,width:w,height:h+inset}).png().toBuffer();
  const cleaned=family==='face'?cell:await cleanSprite(cell);
  const {data,info}=await sharp(cleaned).trim({background:'#00000000',threshold:12}).webp({quality:96}).toBuffer({resolveWithObject:true});
  const path=`/art/rig-v4/${family}/${names[i]}.webp`;await mkdir(`public/art/rig-v4/${family}`,{recursive:true});await writeFile('public'+path,data);
  manifest.assets[path]={size:[info.width,info.height],canvas:[w,h+inset],trim:[-(info.trimOffsetLeft||0),-(info.trimOffsetTop||0)],source:source.replace('public',''),rect:[x,y-inset,w,h+inset],registration:'trim-preserved'};
 }
}
for(const id of [...ids,'accessories']){
 let original;try{original=JSON.parse(await readFile(`public/art/rig/${id}/source.json`,'utf8'));}catch{/* Older accessories did not record a source grid. */}
 for(const file of await readdir(`public/art/rig/${id}`)){
  if(!file.endsWith('.webp'))continue;
  const path=`/art/rig/${id}/${file}`,m=await sharp('public'+path).metadata();
  manifest.assets[path]=previous.assets[path]?.registration==='recovered-from-source'?previous.assets[path]:{size:[m.width,m.height],canvas:[m.width,m.height],trim:[0,0],registration:'legacy-trimmed-source; original trim unavailable'};
  const index=original?.parts?.indexOf(file.replace('.webp',''));
  const rect=Array.isArray(original?.rects)&&index>=0?original.rects[index]:null;
  if(rect){
   try{
    const [left,top,width,height]=rect;
    const cell=await sharp(original.source).extract({left,top,width,height}).png().toBuffer();
    const {info}=await sharp(await cleanSprite(cell)).trim({background:'#00000000',threshold:12}).png().toBuffer({resolveWithObject:true});
    if(info.width===m.width&&info.height===m.height)manifest.assets[path]={size:[m.width,m.height],canvas:[width,height],trim:[-(info.trimOffsetLeft||0),-(info.trimOffsetTop||0)],source:original.source,rect,registration:'recovered-from-source'};
   }catch{/* Keep known registrations when the optional legacy source atlas is absent. */}
  }
 }
}
await writeFile('src/rig/assets.json',JSON.stringify(manifest,null,2)+'\n');
// The shared registration data is compiled into the client; source files remain reproducible.
await writeFile('public/art/rig-v4/source/provenance.json',JSON.stringify({version:4,model:'codex-image-generation',sourcePurpose:'独立精绘头饰、头发和统一表情头像；所有裁切保留原始画布与偏移',sources:JSON.parse(await readFile('art-rig-v4-prompts.json','utf8'))},null,2)+'\n');
