import 'dotenv/config';
import {chromium,expect} from '@playwright/test';
import pg from 'pg';
import {randomUUID} from 'node:crypto';
import {mkdir} from 'node:fs/promises';
import {initialProgress,outfits,accessories} from '../shared/catalog.ts';
if(!process.env.RIG_TEST_DATABASE_URL)throw new Error('Use an isolated RIG_TEST_DATABASE_URL');
const db=new pg.Pool({connectionString:process.env.RIG_TEST_DATABASE_URL});
const browser=await chromium.launch({channel:'chrome'}),ctx=await browser.newContext({viewport:{width:1366,height:900},reducedMotion:'reduce'}),page=await ctx.newPage();
const url=process.env.TEST_URL||'http://localhost:5184',email=`attachments-${Date.now()}@example.test`,errors:string[]=[];
page.on('pageerror',e=>errors.push(e.message));
const act=async(id:string)=>{const data={kind:'equip',id,requestId:randomUUID()};let r=await ctx.request.post(url+'/api/action',{data});if(r.status()===429){await page.waitForTimeout(Math.min(60,Number(r.headers()['retry-after'])||60)*1000);r=await ctx.request.post(url+'/api/action',{data});}expect(r.status()).toBe(200);};
await mkdir('work/attachment-audit',{recursive:true});
try{
 expect((await ctx.request.post(url+'/api/auth/register',{data:{email,password:randomUUID(),nickname:'配饰校准'}})).status()).toBe(200);
 await db.query('UPDATE saves SET progress=$1 WHERE user_id=(SELECT id FROM accounts WHERE email=$2)',[{...initialProgress(),coins:456,tutorial:true,owned:[...outfits,...accessories].filter(x=>x.id!=='iron').map(x=>x.id)},email]);
 const rejected=await ctx.request.post(url+'/api/action',{data:{kind:'buy',id:'iron',requestId:randomUUID()}});expect(rejected.status()).toBe(409);
 for(const base of (process.env.AUDIT_BASES?process.env.AUDIT_BASES.split(','):process.env.AUDIT_HEADS?outfits.filter(o=>o.id!=='iron').map(o=>o.id):['base','nezha'])){
  const cards:string[]=[];
  for(const a of accessories.filter(a=>!process.env.AUDIT_HEADS||a.slot==='hat')){await act(base);await act(a.id);await page.goto(url);const avatar=page.locator('.character-stage .bone-avatar');await expect(avatar.locator('.raster-canvas')).toBeVisible();
   await avatar.locator('image').evaluateAll(xs=>Promise.all(xs.map(x=>new Promise<void>((res,rej)=>{const im=new Image();im.onload=()=>res();im.onerror=()=>rej(x.getAttribute('href'));im.src=x.getAttribute('href')!;}))));
   const shot=await avatar.screenshot({path:`work/attachment-audit/${base}-${a.id}.png`});cards.push(`<article><img src="data:image/png;base64,${shot.toString('base64')}"><h3>${a.name}</h3></article>`);
  }
  await page.setContent(`<style>html,body{height:auto!important}body{align-items:start;display:grid;grid-template-columns:repeat(4,1fr);margin:0;background:#f6f3ec;font-family:sans-serif;gap:12px;padding:12px}article{background:white;border-radius:16px;text-align:center}img{width:100%;height:310px;object-fit:contain}h3{font-size:16px}</style>${cards.join('')}`);await page.locator('img').evaluateAll(xs=>Promise.all(xs.map(x=>(x as HTMLImageElement).decode())));await page.screenshot({path:`work/${process.env.AUDIT_HEADS?'headwear':'accessories'}-${base}.png`,fullPage:true});
 }
 const state=await(await ctx.request.get(url+'/api/state')).json();expect(state.progress.coins).toBe(456);expect(state.progress.owned).not.toContain('iron');expect(errors).toEqual([]);console.log('PASS accessory combinations, no image errors, unavailable outfit cannot charge coins');
}finally{await browser.close();await db.query('DELETE FROM accounts WHERE email=$1',[email]);await db.end();}
