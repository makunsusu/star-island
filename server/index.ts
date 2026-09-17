import 'dotenv/config';
import express, {type Request,type Response} from 'express';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import {rateLimit} from 'express-rate-limit';
import bcrypt from 'bcryptjs';
import pg from 'pg';
import {createHash,randomBytes,randomUUID} from 'node:crypto';
import {readFile} from 'node:fs/promises';
import path from 'node:path';
import nodemailer from 'nodemailer';
import {accessories,outfits,slots,suit,normalizeEquipment,initialProgress,type Progress,type Slot} from '../shared/catalog.ts';
import {makeChallenge,publicChallenge,recordAnswer,settle,type Challenge} from './game.ts';
const pool=new pg.Pool({connectionString:process.env.DATABASE_URL});
await pool.query(await readFile(new URL('./schema.sql',import.meta.url),'utf8'));
const app=express();if(process.env.TRUST_PROXY==='1')app.set('trust proxy',1);const prod=process.env.NODE_ENV==='production';
if(process.env.SESSION_COOKIE_SECURE&&!['true','false'].includes(process.env.SESSION_COOKIE_SECURE))throw new Error('SESSION_COOKIE_SECURE must be true or false');
const secureCookie=process.env.SESSION_COOKIE_SECURE?process.env.SESSION_COOKIE_SECURE==='true':prod;
app.use(helmet({strictTransportSecurity:secureCookie?undefined:false,contentSecurityPolicy:{directives:{'upgrade-insecure-requests':secureCookie?[]:null,'img-src':["'self'","data:"],'style-src':["'self'","'unsafe-inline'"],'script-src':["'self'"],'connect-src':["'self'"]}}}));
app.use(express.json({limit:'24kb'}),cookieParser());
app.use('/api',rateLimit({windowMs:60000,limit:180,standardHeaders:true,legacyHeaders:false}));
app.use('/api',(req,res,next)=>{if(req.method!=='GET'){const origin=req.headers.origin;if(origin&&origin!==process.env.APP_ORIGIN)return res.status(403).json({error:'请求来源不匹配'});}next();});
const sessionCookie=process.env.SESSION_COOKIE_NAME||(!prod&&process.env.STAR_WEB_PORT?'star_preview_'+process.env.STAR_WEB_PORT:'star_session');
const hash=(s:string)=>createHash('sha256').update(s).digest('hex');
const authLimit=rateLimit({windowMs:15*60000,limit:30,standardHeaders:true,legacyHeaders:false,message:{error:'尝试次数较多，请稍后再试'}});
class ApiError extends Error {constructor(public status:number,message:string){super(message);}}
const fail=(status:number,message:string):never=>{throw new ApiError(status,message);};
async function session(res:Response,id:string){const token=randomBytes(32).toString('hex');await pool.query("INSERT INTO sessions VALUES($1,$2,now()+interval '30 days')",[hash(token),id]);res.cookie(sessionCookie,token,{httpOnly:true,sameSite:'lax',secure:secureCookie,maxAge:30*86400000,path:'/'});}
async function user(req:Request){const token=req.cookies[sessionCookie];if(typeof token!=='string')return fail(401,'请先登录');const r=await pool.query('SELECT a.id,a.nickname,a.email FROM sessions s JOIN accounts a ON a.id=s.user_id WHERE token_hash=$1 AND expires_at>now()',[hash(token)]);if(!r.rows[0])return fail(401,'请重新登录');return r.rows[0] as {id:string;nickname:string;email:string};}
app.get('/api/health',async(_req,res)=>{await pool.query('SELECT 1');res.json({ok:true,resetAvailable:!!process.env.SMTP_HOST});});
app.post('/api/auth/register',authLimit,async(req,res)=>{
 const email=String(req.body.email||'').trim().toLowerCase(),password=req.body.password,nickname=String(req.body.nickname||'小冒险家').trim().slice(0,16)||'小冒险家';
 if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)||email.length>254)fail(400,'请填写有效邮箱');if(typeof password!=='string'||password.length<8||password.length>72)fail(400,'密码需要 8～72 个字符');
 const id=randomUUID(),passwordHash=await bcrypt.hash(password,12),client=await pool.connect();
 try{await client.query('BEGIN');await client.query('INSERT INTO accounts(id,email,password_hash,nickname) VALUES($1,$2,$3,$4)',[id,email,passwordHash,nickname]);await client.query('INSERT INTO saves(user_id,progress) VALUES($1,$2)',[id,initialProgress()]);await client.query('COMMIT');}catch(e:any){await client.query('ROLLBACK');if(e.code==='23505')fail(409,'这个邮箱已注册，请登录');throw e;}finally{client.release();}
 await session(res,id);res.json({ok:true});
});
app.post('/api/auth/login',authLimit,async(req,res)=>{const r=await pool.query('SELECT * FROM accounts WHERE email=$1',[String(req.body.email||'').trim().toLowerCase()]);const a=r.rows[0];const valid=await bcrypt.compare(String(req.body.password||''),a?.password_hash||'$2b$12$C6UzMDM.H6dfI/f/IKcEe.9fhAOi76HpCYu0sgUdKSjV4z0O3qq8e');if(!a||!valid)fail(401,'邮箱或密码不正确');await session(res,a.id);res.json({ok:true});});
app.post('/api/auth/logout',async(req,res)=>{if(typeof req.cookies[sessionCookie]==='string')await pool.query('DELETE FROM sessions WHERE token_hash=$1',[hash(req.cookies[sessionCookie])]);res.clearCookie(sessionCookie,{path:'/'});res.json({ok:true});});
app.post('/api/auth/forgot',authLimit,async(req,res)=>{
 if(!process.env.SMTP_HOST)fail(503,'邮件服务尚未配置，请联系家长管理员');
 const r=await pool.query('SELECT id,email FROM accounts WHERE email=$1',[String(req.body.email||'').trim().toLowerCase()]);
 if(r.rows[0]){const token=randomBytes(32).toString('hex');await pool.query("INSERT INTO resets VALUES($1,$2,now()+interval '30 minutes')",[hash(token),r.rows[0].id]);const transport=nodemailer.createTransport({host:process.env.SMTP_HOST,port:Number(process.env.SMTP_PORT||587),secure:process.env.SMTP_PORT==='465',auth:process.env.SMTP_USER?{user:process.env.SMTP_USER,pass:process.env.SMTP_PASS}:undefined});await transport.sendMail({from:process.env.SMTP_FROM,to:r.rows[0].email,subject:'星星乘法岛 · 重置密码',text:`请在30分钟内打开此链接重置密码：${process.env.APP_ORIGIN}/?reset=${token}`});}res.json({message:'如果邮箱已注册，重置邮件将发送到邮箱。'});
});
app.post('/api/auth/reset',authLimit,async(req,res)=>{const password=req.body.password;if(typeof password!=='string'||password.length<8||password.length>72)fail(400,'密码需要 8～72 个字符');const client=await pool.connect();try{await client.query('BEGIN');const r=await client.query('DELETE FROM resets WHERE token_hash=$1 AND expires_at>now() RETURNING user_id',[hash(String(req.body.token||''))]);if(!r.rows[0])fail(400,'链接无效或已过期');await client.query('UPDATE accounts SET password_hash=$1 WHERE id=$2',[await bcrypt.hash(password,12),r.rows[0].user_id]);await client.query('DELETE FROM sessions WHERE user_id=$1',[r.rows[0].user_id]);await client.query('DELETE FROM resets WHERE user_id=$1',[r.rows[0].user_id]);await client.query('COMMIT');res.json({ok:true});}catch(e){await client.query('ROLLBACK');throw e;}finally{client.release();}});
app.get('/api/state',async(req,res)=>{const a=await user(req);const r=await pool.query('SELECT * FROM saves WHERE user_id=$1',[a.id]);const row=r.rows[0];res.json({user:a,progress:{...row.progress,equipment:normalizeEquipment(row.progress.equipment)},challenge:publicChallenge(row.challenge),revision:row.revision});});
// Every mutation takes the save row lock; reward, purchase, equipment and deduplication commit together.
app.post('/api/action',async(req,res)=>{
 const a=await user(req);const {requestId,kind,...data}=req.body;if(!/^[a-f0-9-]{36}$/.test(String(requestId)))fail(400,'请求标识无效');
 const client=await pool.connect();try{
 await client.query('BEGIN');const r=await client.query('SELECT * FROM saves WHERE user_id=$1 FOR UPDATE',[a.id]);const row=r.rows[0];let c:Challenge|null=row.challenge;const p:Progress={...row.progress,equipment:normalizeEquipment(row.progress.equipment)};
 const old=await client.query('SELECT result,kind FROM operations WHERE user_id=$1 AND request_id=$2',[a.id,requestId]);
 if(old.rows[0]){if(old.rows[0].kind!==kind)fail(409,'请求标识已用于其他操作');await client.query('COMMIT');res.json({...old.rows[0].result,progress:p,challenge:publicChallenge(c),revision:row.revision});return;}
 let feedback:unknown=null;const before=p.coins;
 if(kind==='tutorial'){
 if(!p.tutorial){if(!['rabbit','strawberry','bear','frog'].includes(data.id))fail(400,'请选择一套可爱外观');p.tutorial=true;p.owned.push(data.id);p.equipment=suit(data.id);}
 }else if(kind==='start'){
 const level=Number(data.level);if(!Number.isInteger(level)||level<1||level>18)fail(400,'关卡不存在');if(!p.tutorial)fail(400,'请先完成冒险教学');if(level>1&&!p.stars[level-1])fail(403,'请先完成前一关');
 if(c&&!c.settled){feedback={resume:true};}else{c=makeChallenge(p,level);}
 }else if(kind==='answer'||kind==='hint'||kind==='settle'){
 if(!c||c.id!==data.challengeId)fail(409,'挑战进度已更新，请刷新');
 const active=c!;
 if(kind==='settle'){feedback=settle(p,active);}else{
 const q=active.questions[active.index];if(!q||q.id!==data.questionId||active.settled)fail(409,'这道题已经更新，请同步最新进度');
 if(kind==='hint')q.hint=true;else{if(!Number.isInteger(data.value)||data.value<0||data.value>99)fail(400,'请输入 0～99 的整数');feedback=recordAnswer(p,active,data.value);}
 }
 }else if(kind==='buy'){
 if(data.id==='iron'&&!p.owned.includes('iron'))fail(409,'钢铁侠精绘升级中，暂时不能兑换');
 const product=outfits.find(x=>x.id===data.id)||accessories.find(x=>x.id===data.id);if(!product||product.id==='base')fail(400,'商品不存在');
 if(!p.owned.includes(product!.id)){if(p.coins<product!.price)fail(400,'星星币还不够，再闯几关就可以啦');p.coins-=product!.price;p.owned.push(product!.id);}
 }else if(kind==='equip'){
 if(!p.owned.includes(data.id))fail(403,'请先兑换这件外观');
 if(outfits.some(x=>x.id===data.id)){if(data.slot){if(!slots.includes(data.slot))fail(400,'装备位置无效');p.equipment[data.slot as Slot]=data.id;}else p.equipment=suit(data.id);}
 else{const item=accessories.find(x=>x.id===data.id);if(!item)fail(400,'外观不存在');p.equipment[item!.slot]=item!.id;}
 }else if(kind==='unequip'){if(!slots.includes(data.slot))fail(400,'装备位置无效');p.equipment[data.slot as Slot]='base';
 }else if(kind==='wish'){if(data.id!==null&&!outfits.some(x=>x.id===data.id&&x.id!=='base'))fail(400,'套装不存在');p.wish=data.id;
 }else if(kind==='settings'){if(typeof data.sound==='boolean')p.settings.sound=data.sound;if(typeof data.reducedMotion==='boolean')p.settings.reducedMotion=data.reducedMotion;
 }else fail(400,'未知操作');
 const revision=row.revision+1;await client.query('UPDATE saves SET progress=$1,challenge=$2,revision=$3 WHERE user_id=$4',[p,c,revision,a.id]);
 if(p.coins!==before)await client.query('INSERT INTO coin_ledger(user_id,delta,reason,reference) VALUES($1,$2,$3,$4)',[a.id,p.coins-before,kind,kind==='settle'?c!.id:data.id]);
 const result={feedback};await client.query('INSERT INTO operations(user_id,request_id,kind,result) VALUES($1,$2,$3,$4)',[a.id,requestId,kind,result]);await client.query('COMMIT');res.json({...result,progress:p,challenge:publicChallenge(c),revision});
 }catch(e){await client.query('ROLLBACK');throw e;}finally{client.release();}
});
app.use(express.static(path.resolve('dist')));app.get('/{*path}',(_req,res)=>res.sendFile(path.resolve('dist/index.html')));
app.use((err:any,_req:Request,res:Response,_next:unknown)=>{void _next;if(!(err instanceof ApiError))console.error(err);res.status(err.status||500).json({error:err instanceof ApiError?err.message:'暂时连接不上，请稍后重试'});});
const server=app.listen(Number(process.env.PORT||3100),'0.0.0.0',()=>console.log('Star Island API ready on '+(process.env.PORT||3100)));
process.on('SIGTERM',()=>{server.close();void pool.end();});
