import {chromium,webkit,expect} from '@playwright/test';
import {mkdir} from 'node:fs/promises';
import {initialProgress,suit,outfits,accessories} from '../shared/catalog';
import {makeChallenge,publicChallenge,recordAnswer,settle,type Challenge} from '../server/game';
const base=process.env.TEST_URL||'http://localhost:5184';
const engine=process.env.WEBKIT==='1'?webkit:chromium,name=process.env.WEBKIT==='1'?'webkit':'chromium';
const browser=await engine.launch(name==='chromium'?{channel:'chrome'}:{});
await mkdir('work/v4/flows',{recursive:true});
try{for(const [width,height] of [[360,800],[390,844],[430,932],[844,390],[768,1024],[820,1180],[1024,768],[1366,768],[1920,1080]]){
 const context=await browser.newContext({viewport:{width:width!,height:height!},hasTouch:width!<1024});const page=await context.newPage();
 const progress={...initialProgress(),tutorial:true,coins:900,equipment:suit('nezha'),owned:[...outfits,...accessories].map(x=>x.id),stars:{1:3,2:3,3:3,4:3}};let challenge:Challenge|null=null,revision=1;
 // Isolated transport fixture exercises real UI and game rules without seeding production accounts.
 await page.route('**/api/**',async route=>{
 const path=new URL(route.request().url()).pathname;const data=route.request().postDataJSON()||{};
 if(path.endsWith('/action')){
  if(data.kind==='start'&&(!challenge||challenge.settled))challenge=makeChallenge(progress,data.level);
  if(data.kind==='answer'&&challenge)recordAnswer(progress,challenge,data.value);
  if(data.kind==='settle'&&challenge)settle(progress,challenge);
  if(data.kind==='equip')progress.equipment=data.slot?{...progress.equipment,[data.slot]:data.id}:suit(data.id);
  if(data.kind==='settings')Object.assign(progress.settings,data);
  revision++;
 }
 await route.fulfill({json:{user:{id:'device-fixture',nickname:'触屏测试',email:'device@example.test'},progress,challenge:publicChallenge(challenge),revision,feedback:{correct:true,first:true},ok:true,resetAvailable:false}});
 });
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(base);await expect(page.locator('.character-stage')).toBeVisible();
 async function check(screen:string){await page.screenshot({path:`work/v4/flows/${name}-${width}x${height}-${screen}.png`,fullPage:true});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),screen).toBe(true);}
 await page.getByRole('button',{name:'我的衣柜',exact:true}).click();await page.locator('.equipment-slots button').filter({hasText:'头饰'}).click();await page.locator('.product-card').filter({hasText:'萝卜兔兔'}).click();await page.getByRole('button',{name:'穿到头饰',exact:true}).click();await expect(page.locator('.transformation')).toBeVisible();await check('transform');await page.locator('.transformation').click();expect(progress.equipment.hair).toBe('nezha');expect(progress.equipment.hat).toBe('rabbit');await check('wardrobe');
 for(let mode=0;mode<4;mode++){
 challenge=makeChallenge(progress,mode+1);await page.reload();await page.getByRole('button',{name:'继续挑战',exact:true}).click();await expect(page.locator('.game-board')).toBeVisible();await check('mode-'+mode);
 if(mode===1||mode===3){const keys=await page.locator('.number-pad button').evaluateAll(els=>els.map(x=>({w:x.getBoundingClientRect().width,h:x.getBoundingClientRect().height})));expect(keys.every(k=>k.w>=44&&k.h>=44)).toBe(true);await page.locator('.number-pad button').filter({hasText:/^2$/}).click();await expect(page.getByRole('textbox',{name:'我的答案'})).toHaveValue('2');}
 else {const q=challenge.questions[0]!;await page.getByRole('button',{name:mode===0?'答案 '+q.a*q.b:String(q.b),exact:true}).click();await expect(page.locator('.playing-avatar .bone-avatar')).toHaveAttribute('data-emotion','happy');}
 }
 challenge={...makeChallenge(progress,1),index:8};await page.reload();await page.getByRole('button',{name:'继续挑战',exact:true}).click();await page.getByRole('button',{name:'领取通关奖励',exact:true}).click();await expect(page.getByText('通关啦，冒险家！')).toBeVisible();await check('result');
 await page.getByRole('button',{name:'回到冒险地图',exact:true}).click();await page.getByRole('button',{name:'家长中心'}).click();await check('parent');
 expect(errors).toEqual([]);await context.close();console.log(`PASS ${name} ${width}x${height}: wardrobe, transform, four modes, result, parent`);
 }}finally{await browser.close();}
