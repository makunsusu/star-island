import sharp from 'sharp';import{mkdir}from'node:fs/promises';import{cleanSprite}from'./clean-sprite.mjs';
const groups=[{file:'work/art-source/clean-heads-heroes.png',ids:['lubu','monkey','ice','lion','galaxy'],xs:[0,284,553,821,1122],ys:[0,272,527,784,1066,1402]},{file:'work/art-source/clean-heads-cute.png',ids:['rabbit','strawberry','bear','frog','guanyu'],xs:[0,281,556,831,1122],ys:[0,248,488,732,990,1402]}];
for(const group of groups)for(let row=0;row<group.ids.length;row++)for(let col=0;col<4;col++){
 const id=group.ids[row],part=['head','happy','blush','angry'][col];await mkdir(`public/art/rig/${id}`,{recursive:true});
 const buf=await sharp(group.file).extract({left:group.xs[col],top:group.ys[row],width:group.xs[col+1]-group.xs[col],height:group.ys[row+1]-group.ys[row]}).png().toBuffer();
 await sharp(await cleanSprite(buf)).trim({background:'#00000000',threshold:12}).webp({quality:95}).toFile(`public/art/rig/${id}/${part}-clean.webp`);
}
