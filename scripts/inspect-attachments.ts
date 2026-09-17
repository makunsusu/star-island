import {chromium} from '@playwright/test';
import {outfits,accessories} from '../shared/catalog.ts';
const browser=await chromium.launch({channel:'chrome'});const page=await browser.newPage({viewport:{width:1600,height:1000}});
const items=[...outfits.filter(o=>!['base','iron'].includes(o.id)).map(o=>({name:o.id,url:`${o.id}/hand`})),...accessories.map(o=>({name:o.id,url:`accessories/${o.id}`}))];
await page.goto('http://localhost:5184');await page.setContent(`<style>body{display:grid;grid-template-columns:repeat(6,1fr);background:#d7dce0;font-family:sans-serif}article{text-align:center;height:270px}img{width:220px;height:225px;object-fit:contain}</style>${items.map(o=>`<article><img src="/art/rig/${o.url}.webp"><div>${o.name}</div></article>`).join('')}`);await page.locator('img').evaluateAll(xs=>Promise.all(xs.map(x=>(x as HTMLImageElement).decode())));await page.screenshot({path:'work/attachment-assets.png',fullPage:true});await browser.close();
