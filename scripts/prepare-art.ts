import sharp from 'sharp';
import {readdir} from 'node:fs/promises';
// Trim transparent padding, then register every full-body sprite on a common canvas.
// The source PNGs remain untouched; both variants retain alpha.
for(const file of await readdir('public/art')){
 if(!file.endsWith('.png'))continue;
 const source=sharp('public/art/'+file);
 if(file==='map.png') await source.resize({width:1400,withoutEnlargement:true}).webp({quality:88}).toFile('public/art/map.webp');
 else {
  const normalized=await source.trim().resize({width:640,height:880,fit:'contain',background:{r:0,g:0,b:0,alpha:0}}).png().toBuffer();
  await sharp(normalized).webp({quality:88}).toFile('public/art/'+file.replace('.png','.webp'));
  await sharp(normalized).resize({height:320}).webp({quality:85}).toFile('public/art/'+file.replace('.png','-thumb.webp'));
 }
}
