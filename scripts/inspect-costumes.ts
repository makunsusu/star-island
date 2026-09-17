import {chromium,expect} from '@playwright/test';
import {outfits} from '../shared/catalog.ts';
const browser=await chromium.launch({channel:'chrome'});
const page=await browser.newPage({viewport:{width:1366,height:900},reducedMotion:'reduce'});
await page.goto(process.env.TEST_URL||'http://localhost:5184');
await page.getByRole('button',{name:'星星商城',exact:true}).click();
const cards:string[]=[];const failures:string[]=[];page.on('response',r=>{if(r.status()>=400&&r.url().includes('/art/'))failures.push(r.url());});
for(const o of outfits.filter(o=>o.id!=='base')){
 await page.locator('.product-card').filter({hasText:o.name}).click();
 await expect(page.locator('.fitting-stage .bone-avatar')).toHaveAttribute('data-skin',o.id);
 const shot=await page.locator('.fitting-stage').screenshot();
 cards.push(`<article><img src="data:image/png;base64,${shot.toString('base64')}"><h2>${o.name}</h2></article>`);
}
await page.getByRole('button',{name:/小小配饰/}).click();
await page.locator('.product-card').filter({hasText:'飞行护目镜'}).click();
await page.locator('.fitting-card').screenshot({path:'work/goggles-v3.png'});
await page.setContent(`<style>html,body{height:auto!important;overflow:visible!important}body{background:#f8f5ed;margin:0;padding:24px;font-family:sans-serif;display:grid;grid-template-columns:repeat(4,1fr);gap:16px}article{min-height:320px;background:#fffdf6;border-radius:24px;text-align:center;overflow:hidden}img{width:100%;height:270px;object-fit:contain}h2{font-size:16px;color:#655449;margin:0 0 18px}</style>${cards.join('')}`);
await page.locator('img').evaluateAll(imgs=>Promise.all(imgs.map(img=>(img as HTMLImageElement).decode())));
await page.screenshot({path:'work/costumes-v3.png',fullPage:true});
if(failures.length)throw new Error('Asset errors: '+failures.join(','));
await browser.close();
