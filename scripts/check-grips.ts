import {chromium,expect} from '@playwright/test';
import {outfits} from '../shared/catalog.ts';
import {hands,palmSources} from '../src/rig/attachments.ts';
const browser=await chromium.launch({channel:'chrome'}),page=await browser.newPage({viewport:{width:1366,height:900}});
try{
 await page.goto(process.env.TEST_URL||'http://localhost:5184');await page.getByRole('button',{name:'星星商城',exact:true}).click();
 for(const outfit of outfits.filter(o=>hands[o.id])){
  await page.locator('.product-card').filter({hasText:outfit.name}).click();
  const stage=page.locator('.fitting-stage');
  for(const emotion of ['开心','害羞','小斗志']){
   await page.locator('.emotion-buttons button').filter({hasText:emotion}).click();await page.waitForTimeout(420);
   const result=await stage.locator('[data-attachment="hand"] image').evaluate((node,grip)=>{
    const image=node as SVGImageElement,wrist=image.closest('[data-bone="wrist-right"]') as SVGGraphicsElement;
    const attachment=new DOMPoint(image.x.baseVal.value+grip.hand.gripX*image.width.baseVal.value,image.y.baseVal.value+grip.hand.gripY*image.height.baseVal.value).matrixTransform(image.getScreenCTM()!);
    const forearm=wrist.parentElement!.querySelector(':scope > image') as SVGImageElement;
    const [sw,sh,u,v]=grip.source;const w=forearm.width.baseVal.value,h=forearm.height.baseVal.value,scale=Math.min(w/sw,h/sh);
    const palm=new DOMPoint(forearm.x.baseVal.value+(w-sw*scale)/2+sw*scale*u,forearm.y.baseVal.value+(h-sh*scale)/2+sh*scale*v).matrixTransform(forearm.getScreenCTM()!);
    return Math.hypot(attachment.x-palm.x,attachment.y-palm.y);
   },{hand:hands[outfit.id]!,source:palmSources[outfit.id]!});
   expect(result,`${outfit.id} ${emotion}: grip must stay on palm`).toBeLessThan(.01);
  }
 }
 console.log('PASS 11 suits × 3 expressions: grip stays fixed to animated palm');
}finally{await browser.close();}
