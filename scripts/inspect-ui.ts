import {chromium} from '@playwright/test';
const browser=await chromium.launch({channel:'chrome',headless:true});
const page=await browser.newPage({viewport:{width:1366,height:900}});
page.on('pageerror',e=>console.error('PAGE ERROR:',e.message));
await page.goto(process.env.TEST_URL||'http://localhost:5184');await page.waitForSelector('.character-stage .raster-canvas');await page.waitForTimeout(1700);await page.screenshot({path:'work/home.png',fullPage:true});
await page.getByRole('button',{name:'星星商城',exact:true}).click();await page.waitForTimeout(600);await page.screenshot({path:'work/shop.png',fullPage:true});
await browser.close();
