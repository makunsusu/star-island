import 'dotenv/config';
import {chromium,expect} from '@playwright/test';
import pg from 'pg';
import {randomUUID} from 'node:crypto';
import {initialProgress,outfits,accessories,suit,type Slot} from '../shared/catalog.ts';
if(!process.env.RIG_TEST_DATABASE_URL)throw new Error('RIG_TEST_DATABASE_URL must name an isolated test database');
const db=new pg.Pool({connectionString:process.env.RIG_TEST_DATABASE_URL}),url=process.env.TEST_URL||'http://localhost:5184';
const browser=await chromium.launch({channel:'chrome'}),context=await browser.newContext({viewport:{width:1366,height:900},reducedMotion:'reduce'}),page=await context.newPage();
const email=`mix-${Date.now()}@example.test`,password='Mix!'+randomUUID(),errors:string[]=[];
page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400&&r.url().includes('/art/'))errors.push(r.url());});
const act=async(data:Record<string,unknown>)=>{const r=await context.request.post(url+'/api/action',{data:{kind:'equip',requestId:randomUUID(),...data}});expect(r.status()).toBe(200);};
const cases:[string,string,Partial<Record<Slot,string>>][]=[
 ['adventure','base',{hat:'goggles',top:'rainbow-shirt',pants:'frog',shoes:'frog',back:'wings',hand:'star-wand'}],
 ['hero','nezha',{hat:'crown',top:'scarf',pants:'lubu',shoes:'base',back:'star-pack',hand:'lollipop'}],
 ['sweet','strawberry',{hat:'star-clip',top:'strawberry',pants:'strawberry',shoes:'rabbit',back:'balloon',hand:'flower'}]
];
try{
 const reg=await context.request.post(url+'/api/auth/register',{data:{email,password,nickname:'混搭检查'}});expect(reg.status()).toBe(200);
 await db.query('UPDATE saves SET progress=$1 WHERE user_id=(SELECT id FROM accounts WHERE email=$2)',[{...initialProgress(),coins:456,tutorial:true,owned:[...outfits,...accessories].map(o=>o.id)},email]);
 for(const [name,base,mix]of cases){await act({id:base});for(const [slot,id]of Object.entries(mix))await act({id,slot});
  await page.goto(url);await expect(page.locator('.character-stage [data-renderer="raster-bones"]')).toBeVisible();
  const state=await(await context.request.get(url+'/api/state')).json();expect(state.progress.coins).toBe(456);expect(state.progress.equipment).toEqual({...suit(base),...mix});
  const actor=page.locator('.character-stage .bone-avatar');
  await expect(actor.locator('[data-layer="hat"]')).toHaveAttribute('href',`/art/rig/accessories/${mix.hat}.webp`);
  await expect(actor.locator('[data-layer="pants"]')).toHaveAttribute('href',`/art/rig/${mix.pants}/pants.webp`);
  await expect(actor.locator('[data-layer="head"]')).toHaveAttribute('href',`/art/rig/${base}/head${base==='strawberry'?'-clean':''}.webp`);
  const sprites=await actor.locator('image').evaluateAll(images=>images.map(i=>i.getAttribute('href')!));
  for(const path of new Set(sprites)){const image=await context.request.get(url+path);expect(image.status(),path).toBe(200);expect(image.headers()['content-type']).toContain('image/');}
  await page.waitForTimeout(250);await actor.screenshot({path:`work/mix-${name}.png`});
 }
 expect(errors).toEqual([]);console.log('PASS 六类混搭、角色肖像保留、所有引用部件可加载、装备保存且金币不变');
}finally{await browser.close();await db.query('DELETE FROM accounts WHERE email=$1',[email]);await db.end();}
