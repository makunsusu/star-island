import sharp from 'sharp';
import {cleanSprite} from './clean-sprite.mjs';
import {mkdir} from 'node:fs/promises';
const file='work/art-source/accessories-atlas.png';
// The generated atlas is not an even grid: the third row starts above 2/3 height.
const bounds=[[0,0,362,344],[365,0,353,344],[718,0,390,344],[1108,0,340,344],[0,344,376,325],[365,350,353,310],[718,350,390,310],[1108,344,340,336],[0,674,350,412],[430,660,224,426],[770,675,265,411],[1108,674,340,412]];
const ids=['star-clip','crown','goggles','scarf','cape','rainbow-shirt','wings','star-pack','balloon','star-wand','lollipop','flower'];
await mkdir('public/art/rig/accessories',{recursive:true});
for(let i=0;i<12;i++){
 const [x,y,width,height]=bounds[i];
 const b=await sharp(file).extract({left:x,top:y,width,height}).png().toBuffer();
 await sharp(await cleanSprite(b)).trim({background:'#00000000',threshold:12}).webp({quality:94}).toFile(`public/art/rig/accessories/${ids[i]}.webp`);
}
