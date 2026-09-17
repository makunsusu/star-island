import 'dotenv/config';
import {chromium,expect} from '@playwright/test';
import {randomUUID} from 'node:crypto';
import pg from 'pg';
const root=process.env.TEST_URL||'http://localhost:5173',email=`modes-${Date.now()}@example.test`,password='Modes!'+randomUUID();
const browser=await chromium.launch({channel:'chrome'});const context=await browser.newContext({viewport:{width:1366,height:768}}),page=await context.newPage();const db=new pg.Pool({connectionString:process.env.DATABASE_URL});
async function act(kind:string,data:Record<string,unknown>={}){const r=await context.request.post(root+'/api/action',{data:{kind,...data,requestId:randomUUID()}});expect(r.status()).toBe(200);return r.json();}
async function state(){return(await context.request.get(root+'/api/state')).json();}
try{
 await context.request.post(root+'/api/auth/register',{data:{email,password}});await act('tutorial',{id:'rabbit'});
 // A test-only database fixture unlocks the three entrypoints; no game endpoint can grant stars.
 await db.query("UPDATE saves SET progress=jsonb_set(progress,'{stars}',$1::jsonb) WHERE user_id=(SELECT id FROM accounts WHERE email=$2)",[JSON.stringify({1:1,2:1,3:1}),email]);
 for(const level of [2,3,4]){
 await act('start',{level});await page.goto(root);await page.getByRole('button',{name:'继续挑战',exact:true}).click();let s=await state();let q=s.challenge.question;const answer=q.mode===2?q.product/q.a:q.a*q.b;
 if(level===2){await page.getByRole('textbox',{name:'我的答案',exact:true}).fill(String(answer));await page.getByRole('textbox',{name:'我的答案',exact:true}).press('Enter');await page.waitForTimeout(1150);expect((await state()).challenge.index).toBe(1);}
 if(level===3){const wrong=q.options.find((n:number)=>n!==answer);await page.locator('.bridge-options').getByRole('button',{name:String(wrong),exact:true}).click();await expect(page.locator('.game-feedback')).toContainText('再想一想');await page.locator('.bridge-options').getByRole('button',{name:String(wrong),exact:true}).click();await expect(page.locator('.hint-box')).toBeVisible();await page.locator('.bridge-options').getByRole('button',{name:String(answer),exact:true}).click();await page.waitForTimeout(1100);expect((await state()).challenge.index).toBe(1);}
 if(level===4){await context.setOffline(true);await page.getByRole('textbox',{name:'我的答案',exact:true}).fill(String(answer));await page.getByRole('button',{name:'完成订单',exact:true}).click();await expect(page.locator('.error-banner')).toContainText('连接暂时中断');await context.setOffline(false);await page.locator('.error-banner').getByRole('button',{name:'重试',exact:true}).click();await page.waitForTimeout(1150);expect((await state()).challenge.index).toBe(1);}
 await page.screenshot({path:`work/mode-${level-1}.png`,fullPage:true});await page.getByRole('button',{name:'暂存并返回'}).click();await page.reload();await page.getByRole('button',{name:'继续挑战',exact:true}).click();expect((await state()).challenge.index).toBe(1);
 s=await state();while(s.challenge.index<8){q=s.challenge.question;s=await act('answer',{challengeId:s.challenge.id,questionId:q.id,value:q.mode===2?q.product/q.a:q.a*q.b});}await act('settle',{challengeId:s.challenge.id});console.log(`PASS 玩法 ${level-1}：浏览器操作、暂停刷新恢复`);
 }
 console.log('PASS 数字键盘、缺失因数、两错自动提示、订单断网重试');
}finally{await browser.close();await db.query('DELETE FROM accounts WHERE email=$1',[email]);await db.end();}
