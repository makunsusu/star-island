import {chromium,expect} from '@playwright/test';
import {mkdir,writeFile} from 'node:fs/promises';
import {outfits,accessories} from '../shared/catalog';
const browser=await chromium.launch({channel:'chrome'}),page=await browser.newPage({viewport:{width:1440,height:1800}});const base=(process.env.TEST_URL||'http://localhost:5184')+'/scripts/fixtures/rig-lab.html';
await mkdir('work/v4/matrix',{recursive:true});const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
try{
 for(const item of ['all',...accessories.map(a=>a.id)]){await page.goto(base+'?matrix='+item);await expect(page.locator('.raster-canvas')).toHaveCount(12);await page.locator('image').evaluateAll(xs=>Promise.all(xs.map(x=>new Promise<void>((resolve,reject)=>{const im=new Image();im.onload=()=>resolve();im.onerror=()=>reject(x.getAttribute('href'));im.src=x.getAttribute('href')!;}))));await page.screenshot({path:`work/v4/matrix/${item}.png`,fullPage:true});}
 const enabled=outfits.filter(x=>x.id!=='iron').map(x=>x.id);let combinations=0;
 // Each slot pair is swept without creating screenshots for identical metadata-only cases.
 for(const [a,b] of [['hair','body'],['top','pants'],['pants','shoes'],['top','hand'],['body','back']])for(const first of enabled)for(const second of enabled){await page.goto(`${base}?skin=${first}&${a}=${first}&${b}=${second}${b==='body'?'&top='+second:''}&time=1&emotion=happy&age=.9`);await expect(page.locator('.raster-canvas')).toHaveCount(1);expect(await page.locator('image').evaluateAll(xs=>xs.every(x=>['x','y','width','height'].every(k=>Number.isFinite(Number(x.getAttribute(k))))))).toBe(true);combinations++;}
 for(const skin of enabled)for(const emotion of ['idle','happy','blush','angry','sad'])for(const age of [0,.85,2.2]){await page.goto(`${base}?skin=${skin}&emotion=${emotion}&age=${age}&time=${emotion==='idle'?4.37:1}`);await page.locator('.single').screenshot({path:`work/v4/matrix/${skin}-${emotion}-${age}.png`});}
 expect(errors).toEqual([]);await writeFile('work/v4/matrix/report.json',JSON.stringify({accessoryCombinations:144,pairCombinations:combinations,poseScreenshots:enabled.length*15,errors},null,2));console.log(`PASS 144 accessory combinations, ${combinations} slot pairs, 180 fixed pose screenshots (visual review separate)`);
}finally{await browser.close();}
