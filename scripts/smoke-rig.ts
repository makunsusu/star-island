import 'dotenv/config';
import {chromium,expect} from '@playwright/test';
import {randomUUID} from 'node:crypto';
import pg from 'pg';
import {initialProgress,outfits,accessories} from '../shared/catalog.ts';
const url=process.env.TEST_URL||'http://localhost:5184';
if(!process.env.RIG_TEST_DATABASE_URL)throw new Error('Set RIG_TEST_DATABASE_URL to an isolated test database');
const db=new pg.Pool({connectionString:process.env.RIG_TEST_DATABASE_URL});
const browser=await chromium.launch({channel:'chrome'}),context=await browser.newContext({viewport:{width:1366,height:768}}),page=await context.newPage();
const email=`rig-${Date.now()}@example.test`,password='Rig!'+randomUUID();const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
async function state(){return (await context.request.get(url+'/api/state')).json();}
async function act(kind:string,data:Record<string,unknown>){const r=await context.request.post(url+'/api/action',{data:{kind,requestId:randomUUID(),...data}});expect(r.status()).toBe(200);return r.json();}
try{
 await context.request.post(url+'/api/auth/register',{data:{email,password,nickname:'骨骼测试'}});
 const fixture={...initialProgress(),coins:365,owned:[...outfits,...accessories].map(o=>o.id),tutorial:true,stars:{1:3},equipment:{hat:'rabbit',body:'rabbit',back:'rabbit',hand:'rabbit'}};
 await db.query('UPDATE saves SET progress=$1 WHERE user_id=(SELECT id FROM accounts WHERE email=$2)',[fixture,email]);
 const migrated=await state();expect(migrated.progress.coins).toBe(365);expect(migrated.progress.equipment.top).toBe('rabbit');expect(Object.keys(migrated.progress.equipment)).toHaveLength(9);
 await page.goto(url);const actor=page.locator('.character-stage .bone-avatar');await expect(actor).toBeVisible();await expect(actor).toHaveAttribute('data-rig-version','4');
 await expect(actor.locator('[data-layer="face"]')).toHaveAttribute('clip-path',/face-outline/);
 for(const layer of ['face','top','pants'])await expect(actor.locator(`[data-layer="${layer}"]`).first()).toBeAttached();
 const h=actor.locator('[data-bone="head"]');const first=await h.getAttribute('transform');await page.waitForTimeout(180);expect(await h.getAttribute('transform')).not.toBe(first);
 await expect.poll(async()=>actor.evaluate(e=>e.querySelector('[data-layer="expression"]')?.getAttribute('href')||''),{timeout:7000,intervals:[30]}).toMatch(/blink.webp$/);
 await page.getByRole('button',{name:'♡ 害羞',exact:true}).click();await expect(actor).toHaveAttribute('data-emotion','blush');await expect(actor.locator('[data-layer="expression"]')).toHaveAttribute('href',/blush.webp$/);
 await page.getByRole('button',{name:'ϟ 小斗志',exact:true}).click();await expect(actor).toHaveAttribute('data-emotion','angry');await page.getByRole('button',{name:'✦ 开心',exact:true}).click();await expect(actor).toHaveAttribute('data-emotion','happy');
 const connectionError=await actor.evaluate(e=>{const shoulder=e.querySelector('[data-bone="shoulder-right"]') as SVGGraphicsElement;const elbow=e.querySelector('[data-bone="elbow-right"]') as SVGGraphicsElement;const a=new DOMPoint(0,35).matrixTransform(shoulder.getCTM()!);const b=new DOMPoint(0,0).matrixTransform(elbow.getCTM()!);return Math.hypot(a.x-b.x,a.y-b.y);});expect(connectionError).toBeLessThan(.001);
 await page.waitForTimeout(2300);await expect(actor).toHaveAttribute('data-emotion','idle');await page.screenshot({path:'work/rig-home.png',fullPage:true});console.log('PASS 独立绘制层、待机、眨眼、表情恢复、肩肘连接');
 await page.getByRole('button',{name:'我的衣柜',exact:true}).click();await page.locator('.equipment-slots').getByRole('button',{name:/上衣/}).click();await page.locator('.product-card').filter({hasText:'草莓甜心'}).click();
 expect((await state()).progress.equipment.top).toBe('rabbit');await page.getByRole('button',{name:'穿到上衣',exact:true}).click();await expect(page.locator('.transformation')).toBeVisible();await page.locator('.transformation').click();let s=await state();expect(s.progress.equipment.top).toBe('strawberry');expect(s.progress.equipment.hat).toBe('rabbit');expect(s.progress.equipment.shoes).toBe('rabbit');
 await page.locator('.equipment-slots').getByRole('button',{name:/头饰/}).click();await page.locator('.product-card').filter({hasText:'青蛙雨衣'}).click();await page.getByRole('button',{name:'穿到头饰',exact:true}).click();await expect(page.locator('.transformation')).toBeVisible();await page.locator('.transformation').click();s=await state();expect(s.progress.equipment.top).toBe('strawberry');expect(s.progress.equipment.hat).toBe('frog');await expect(page.locator('.fitting-stage [data-layer="top"]')).toHaveAttribute('href',/strawberry\/top.webp$/);await expect(page.locator('.fitting-stage [data-layer="hat"]')).toHaveAttribute('href',/headwear\/frog.webp$/);expect(s.progress.coins).toBe(365);
 await act('equip',{slot:'pants',id:'strawberry'});await act('equip',{slot:'skirt',id:'base'});await page.reload();await expect(actor.locator('[data-layer="pants"]')).toHaveAttribute('href',/lower\/strawberry-pants.webp$/);await expect(actor.locator('[data-layer="skirt"]')).toHaveCount(0);
 await act('equip',{slot:'skirt',id:'strawberry'});await page.reload();await expect(actor.locator('[data-layer="skirt"]')).toHaveAttribute('href',/lower\/strawberry-skirt.webp$/);await page.getByRole('button',{name:'我的衣柜',exact:true}).click();
 await page.locator('.skin-mode').getByRole('button',{name:'整套换装',exact:true}).click();await page.locator('.product-card').filter({hasText:'哪吒'}).click();await page.getByRole('button',{name:'立即穿戴',exact:true}).click();await expect(page.locator('.transformation')).toBeVisible();await page.locator('.transformation').click();s=await state();expect(new Set(Object.values(s.progress.equipment))).toEqual(new Set(['nezha']));
 await page.getByRole('button',{name:'回到冒险',exact:true}).click();await expect(actor.locator('[data-bone="cape"]')).toBeAttached();await page.screenshot({path:'work/rig-nezha.png',fullPage:true});
 const other=await browser.newContext();await other.request.post(url+'/api/auth/login',{data:{email,password}});const sync=await(await other.request.get(url+'/api/state')).json();expect(sync.progress.equipment).toEqual(s.progress.equipment);await other.close();console.log('PASS 旧四槽存档、九槽存档、上衣与头饰独立换装、试穿、整套切换和双会话同步');
 await act('start',{level:1});await page.reload();await page.getByRole('button',{name:'继续挑战',exact:true}).click();s=await state();const q=s.challenge.question;const wrong=q.options.find((n:number)=>n!==q.a*q.b);await page.getByRole('button',{name:'答案 '+wrong,exact:true}).click();await expect(page.locator('.playing-avatar .bone-avatar')).toHaveAttribute('data-emotion','sad');await page.getByRole('button',{name:'答案 '+q.a*q.b,exact:true}).click();await expect(page.locator('.playing-avatar .bone-avatar')).toHaveAttribute('data-emotion','happy');
 await act('settings',{reducedMotion:true});await page.reload();await expect(actor).toHaveClass(/bone-reduced/);await expect(h).toHaveAttribute('transform','translate(0 -8) rotate(0)');const still=await h.getAttribute('transform');await page.waitForTimeout(180);expect(await h.getAttribute('transform')).toBe(still);await expect(actor.locator('[data-layer="face"]')).toHaveAttribute('href',/idle.webp$/);
 await act('settings',{reducedMotion:false});await page.emulateMedia({reducedMotion:'reduce'});await page.reload();await expect(actor).toHaveClass(/bone-reduced/);const systemStill=await h.getAttribute('transform');await page.waitForTimeout(180);expect(await h.getAttribute('transform')).toBe(systemStill);
 expect(errors).toEqual([]);console.log('PASS 答错失落/答对开心、账号及系统减少动效，无浏览器异常');
}finally{await browser.close();await db.query('DELETE FROM accounts WHERE email=$1',[email]);await db.end();}
