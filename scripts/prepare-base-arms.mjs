import sharp from 'sharp';
import {mkdir,readFile,writeFile} from 'node:fs/promises';
const source='public/art/rig-v4/source/basearms.png';
const rects={torso:[40,50,520,475],upperL:[680,70,260,430],upperR:[1120,70,250,430],foreL:[180,530,245,430],foreR:[660,530,245,430]};
const manifest=JSON.parse(await readFile('src/rig/assets.json','utf8'));
await mkdir('public/art/rig-v4/basearms',{recursive:true});
for(const [name,rect]of Object.entries(rects)){
 const [left,top,width,height]=rect,path=`/art/rig-v4/basearms/${name}.webp`;
 await sharp(source).extract({left,top,width,height}).webp({quality:96}).toFile('public'+path);
 manifest.assets[path]={size:[width,height],canvas:[width,height],trim:[0,0],source:source.replace('public',''),rect,registration:'source-silhouette-mask'};
}
await writeFile('src/rig/assets.json',JSON.stringify(manifest,null,2)+'\n');
