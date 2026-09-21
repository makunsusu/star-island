import {chromium,webkit,expect} from '@playwright/test';
import {mkdir,writeFile} from 'node:fs/promises';
const base=process.env.TEST_URL||'http://localhost:5184';
const sizes=[[360,800],[390,844],[430,932],[844,390],[768,1024],[820,1180],[1024,768],[1366,768],[1920,1080]];
const engines=process.env.WEBKIT==='1'?[['webkit',webkit] as const]:[['chromium',chromium] as const];
await mkdir('work/v4/devices',{recursive:true});const report:unknown[]=[];
for(const [name,engine] of engines){const browser=await engine.launch(name==='chromium'?{channel:'chrome'}:{});
try{for(const [width,height] of sizes){const page=await browser.newPage({viewport:{width:width!,height:height!},hasTouch:width!<1024});const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
await page.goto(base);await expect(page.getByRole('button',{name:'星星商城',exact:true})).toBeVisible();
for(const screen of ['home','shop']){
 if(screen==='shop')await page.getByRole('button',{name:'星星商城',exact:true}).click();
 await page.waitForTimeout(200);await page.screenshot({path:`work/v4/devices/${name}-${width}x${height}-${screen}.png`,fullPage:true});
 const overflow=await page.evaluate(()=>({width:innerWidth,scroll:document.documentElement.scrollWidth}));expect(overflow.scroll,`${name} ${width} ${screen}`).toBeLessThanOrEqual(overflow.width);
 if(screen==='shop'){await page.getByRole('button',{name:/小小配饰/}).click();await page.locator('.product-card').filter({hasText:'飞行护目镜'}).click();await expect(page.locator('.purchase-controls')).toBeVisible();await page.locator('.purchase-controls button').scrollIntoViewIfNeeded();await page.screenshot({path:`work/v4/devices/${name}-${width}x${height}-tryon.png`,fullPage:true});}
 report.push({name,width,height,screen,overflow});}
 expect(errors).toEqual([]);await page.close();}}
finally{await browser.close();}}
await writeFile('work/v4/devices/report.json',JSON.stringify(report,null,2));console.log(`PASS ${report.length} responsive page checks`);
