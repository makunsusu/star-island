import 'dotenv/config';
import {chromium,expect} from '@playwright/test';
import {randomUUID} from 'node:crypto';
import {mkdir} from 'node:fs/promises';
import pg from 'pg';
const base=process.env.TEST_URL||'http://localhost:5173';
const browser=await chromium.launch({channel:'chrome',headless:true});
const context=await browser.newContext({viewport:{width:1366,height:768}}),page=await context.newPage();
const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
const email=`smoke-${Date.now()}@example.test`,password='StarTest!'+randomUUID();
const pool=new pg.Pool({connectionString:process.env.DATABASE_URL});
const pause=(ms:number)=>new Promise(r=>setTimeout(r,ms));
async function api(kind:string,data:Record<string,unknown>={},id=randomUUID()){
 const r=await context.request.post(base+'/api/action',{data:{kind,...data,requestId:id}});
 const b=await r.json();return {status:r.status(),...b};
}
async function state(){return await (await context.request.get(base+'/api/state')).json();}
async function solveLevel(level:number){let r=await api('start',{level});expect(r.status).toBe(200);while(r.challenge.index<8){const q=r.challenge.question;await pause(550);r=await api('answer',{challengeId:r.challenge.id,questionId:q.id,value:q.mode===2?q.product/q.a:q.a*q.b});expect(r.status).toBe(200);}const id=randomUUID();const [a,b]=await Promise.all([api('settle',{challengeId:r.challenge.id},id),api('settle',{challengeId:r.challenge.id},id)]);expect(a.status).toBe(200);expect(b.status).toBe(200);expect(a.progress.coins).toBe(b.progress.coins);return a;}
try{
 await mkdir('work',{recursive:true});await page.goto(base);await page.getByRole('button',{name:'开始冒险',exact:true}).click();
 await page.getByPlaceholder('小冒险家',{exact:true}).fill('星星测试');await page.getByPlaceholder('your@email.com').fill(email);await page.getByPlaceholder('8～72 个字符').fill(password);await page.getByRole('button',{name:'创建账号，开始冒险',exact:true}).click();
 await expect(page.getByText('每组 2 个萝卜，有 3 组')).toBeVisible();await page.locator('.tutorial-options').getByRole('button',{name:'6',exact:true}).click();await page.getByRole('button',{name:'领取我的第一套外观'}).click();await page.getByRole('button',{name:'就选萝卜兔兔！'}).click();await expect(page.locator('.transformation')).toBeVisible();await page.locator('.transformation').click();
 await expect(page.locator('.hero-name h2')).toHaveText('萝卜兔兔');await page.waitForTimeout(300);await page.screenshot({path:'work/home-1366.png',fullPage:true});
 const viewportOverflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth);expect(viewportOverflow).toBe(false);
 await page.getByRole('button',{name:'开始冒险',exact:true}).click();
 for(let i=0;i<8;i++){const s=await state(),q=s.challenge.question;await page.getByRole('button',{name:`答案 ${q.a*q.b}`,exact:true}).click();if(i<7)await page.waitForTimeout(1100);}
 await expect(page.getByText('通关啦，冒险家！')).toBeVisible({timeout:8000});expect((await state()).progress.coins).toBe(41);console.log('PASS 浏览器注册 → 教学 → 赠装 → 地鼠通关 → 41币');
 const locked=await api('start',{level:18});expect(locked.status).toBe(403);const insufficient=await api('buy',{id:'iron'});expect(insufficient.status).toBe(400);
 const buyId=randomUUID();const buys=await Promise.all([api('buy',{id:'star-wand'},buyId),api('buy',{id:'star-wand'},buyId)]);expect(buys.every(r=>r.status===200)).toBe(true);expect((await state()).progress.coins).toBe(21);expect((await api('equip',{id:'nezha'})).status).toBe(403);
 let start=await api('start',{level:2});const original=start.challenge;expect(original.question.mode).toBe(1);
 const q0=original.question;const concurrent=await Promise.all([api('answer',{challengeId:original.id,questionId:q0.id,value:q0.a*q0.b}),api('answer',{challengeId:original.id,questionId:q0.id,value:q0.a*q0.b})]);expect(concurrent.map(r=>r.status).sort()).toEqual([200,409]);expect((await state()).challenge.index).toBe(1);
 start=await state();while(start.challenge.index<8){await pause(550);const q=start.challenge.question;start=await api('answer',{challengeId:start.challenge.id,questionId:q.id,value:q.a*q.b});}await api('settle',{challengeId:start.challenge.id});
 for(let level=3;level<=18;level++){await solveLevel(level);if(level%3===0)console.log('PASS 服务端关卡 '+level+' / 18');}
 const complete=await state();expect(Object.keys(complete.progress.stars)).toHaveLength(18);expect(complete.progress.coins).toBe(18*41-20);console.log('PASS 18关四种玩法、逐关解锁、重复结算防护');
 await api('buy',{id:'nezha'});await api('equip',{id:'nezha'});await page.reload();await expect(page.locator('.hero-name h2')).toHaveText('哪吒');
 await page.getByRole('button',{name:'星星商城',exact:true}).click();await page.locator('.product-card').filter({hasText:'吕布'}).click();expect((await state()).progress.equipment.body).toBe('nezha');await page.getByRole('button',{name:'设为我的心愿',exact:true}).click();await page.getByRole('button',{name:'回到冒险',exact:true}).click();await expect(page.locator('.hero-name h2')).toHaveText('哪吒');await expect(page.locator('.wish-bar')).toContainText('吕布');
 const other=await browser.newContext();await other.request.post(base+'/api/auth/login',{data:{email,password}});const remote=await (await other.request.get(base+'/api/state')).json();expect(remote.progress.equipment.body).toBe('nezha');expect(remote.progress.stars['18']).toBe(3);await other.close();
 await api('buy',{id:'iron'});await api('equip',{id:'iron'});await page.reload();await expect(page.locator('.hero-name h2')).toHaveText('钢铁侠');await expect(page.locator('.character-stage .bone-avatar[data-skin="iron"]')).toBeVisible();
 await api('equip',{id:'star-wand'});const mixed=await state();expect(mixed.progress.equipment.hand).toBe('star-wand');await api('settings',{sound:false,reducedMotion:true});
 await page.reload();await expect(page.locator('html')).toHaveClass('reduced-motion');await page.getByRole('button',{name:'我的衣柜',exact:true}).click();await expect(page.locator('.product-card').filter({hasText:'哪吒'})).toBeVisible();
 await page.getByRole('button',{name:'星星商城',exact:true}).click();await page.waitForTimeout(300);await page.screenshot({path:'work/shop-1366.png',fullPage:true});
 await page.setViewportSize({width:1920,height:1080});await page.getByRole('button',{name:'冒险地图',exact:true}).click();await page.screenshot({path:'work/home-1920.png',fullPage:true});
 await page.setViewportSize({width:390,height:844});await page.screenshot({path:'work/home-mobile.png',fullPage:true});expect(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)).toBe(false);
 const ledger=await pool.query('SELECT SUM(delta)::integer total FROM coin_ledger l JOIN accounts a ON a.id=l.user_id WHERE a.email=$1',[email]);expect(ledger.rows[0].total).toBe((await state()).progress.coins);
 expect(errors).toEqual([]);console.log('PASS 兑换/试穿/换装/心愿/矢量机甲/跨设备同步/减少动效/3尺寸/金币流水');
}finally{await browser.close();await pool.query('DELETE FROM accounts WHERE email=$1',[email]);await pool.end();}
