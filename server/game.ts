import { randomUUID } from 'node:crypto';
import { islandNumbers,modeFor, type Progress } from '../shared/catalog.ts';
export type Question={id:string;a:number;b:number;options:number[];attempts:number;hint:boolean;done:boolean;firstCorrect:boolean};
export type Challenge={id:string;level:number;questions:Question[];index:number;settled:boolean;created:string;result?:{stars:number;coins:number;correct:number;firstClear:boolean;starBonus:boolean}};
export const factKey=(a:number,b:number)=>[a,b].sort((x,y)=>x-y).join('x');
export const starsFor=(correct:number)=>correct===8?3:correct>=6?2:1;
export const mastered=(f:Progress['facts'][string])=>f.correct>=3&&f.challenges.length>=2&&f.recent.length>=2&&f.recent.every(Boolean)&&!f.weak;
const pick=<T>(a:T[])=>a[Math.floor(Math.random()*a.length)]!;
const shuffle=<T>(a:T[])=>{for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a;};
export function makeChallenge(p:Progress,level:number):Challenge {
 const island=Math.floor((level-1)/2),factor=islandNumbers[island]!,learned=[1,...islandNumbers.slice(0,Math.min(island+1,8))];
 const pool: [number,number][]=[];for(const a of learned) for(let b=1;b<=9;b++) if(learned.includes(Math.min(a,b))||a===factor) pool.push([a,b]);
 const fresh= factor? Array.from({length:9},(_,i)=>[factor,i+1] as [number,number]):pool;
 const weak=pool.filter(([a,b])=>p.facts[factKey(a,b)]?.weak);
 const chosen:[number,number][]=[];
 // Prefer unseen facts to avoid permanently missing a table entry across short levels.
 const ordered=shuffle([...fresh]).sort((x,y)=>(p.facts[factKey(...x)]?.seen||0)-(p.facts[factKey(...y)]?.seen||0));
 chosen.push(...ordered.slice(0,5));for(let i=0;i<2;i++)chosen.push(pick(weak.length?weak:pool));chosen.push(pick(pool));
 const questions=shuffle(chosen).map(([a,b],index)=>{
  if(Math.random()<.35)[a,b]=[b,a];
  const answer=modeFor(level,index)===2?b:a*b;
  const options=new Set([answer]);const candidates=modeFor(level,index)===2?[b-1,b+1,b+2,b-2]:[a*(b-1),a*(b+1),(a+1)*b,(a-1)*b,answer+1,answer-1];
  for(const n of shuffle(candidates))if(n>0&&n!==answer&&options.size<3)options.add(n);
  while(options.size<3)options.add(1+Math.floor(Math.random()*(modeFor(level,index)===2?9:81)));
  return {id:randomUUID(),a,b,options:shuffle([...options]),attempts:0,hint:false,done:false,firstCorrect:false};
 });
 return {id:randomUUID(),level,questions,index:0,settled:false,created:new Date().toISOString()};
}
export function publicChallenge(c:Challenge|null){
 if(!c)return null;
 const q=c.questions[c.index];
 return {id:c.id,level:c.level,index:c.index,settled:c.settled,result:c.result,question:q?{id:q.id,a:q.a,...(modeFor(c.level,c.index)===2?{product:q.a*q.b}:{b:q.b}),options:q.options,attempts:q.attempts,hint:q.hint,...(q.hint?{answer:modeFor(c.level,c.index)===2?q.b:q.a*q.b,b:q.b}:{}),mode:modeFor(c.level,c.index)}:null};
}
export function recordAnswer(p:Progress,c:Challenge,value:number){
 const q=c.questions[c.index];if(!q)throw new Error('本关已完成');
 const correct=value===(modeFor(c.level,c.index)===2?q.b:q.a*q.b);
 if(!correct){q.attempts++;if(q.attempts>=2)q.hint=true;const k=factKey(q.a,q.b);const f=p.facts[k]??={correct:0,challenges:[],recent:[],weak:true,seen:0};f.weak=true;f.recent=[...f.recent,false].slice(-2);return {correct:false,first:false};}
 q.firstCorrect=q.attempts===0&&!q.hint;q.done=true;
 const key=factKey(q.a,q.b);const f=p.facts[key]??={correct:0,challenges:[],recent:[],weak:false,seen:0};
 f.seen++; f.recent=[...f.recent,q.firstCorrect].slice(-2);
 if(q.firstCorrect){f.correct++;if(!f.challenges.includes(c.id))f.challenges.push(c.id);f.challenges=f.challenges.slice(-20);if(f.recent.length===2&&f.recent.every(Boolean))f.weak=false;}else f.weak=true;
 c.index++;return {correct:true,first:q.firstCorrect};
}
export function settle(p:Progress,c:Challenge){
 if(c.settled)return c.result!;if(c.index!==8)throw new Error('请先完成题目');
 const correct=c.questions.filter(q=>q.firstCorrect).length,stars=starsFor(correct),old=p.stars[c.level]||0;
 const firstClear=!old,starBonus=stars===3&&old<3,coins=correct*2+10+(firstClear?10:0)+(starBonus?5:0);
 p.coins+=coins;p.stars[c.level]=Math.max(old,stars);p.history.unshift({level:c.level,correct,at:new Date().toISOString()});p.history=p.history.slice(0,100);
 c.settled=true;c.result={stars,coins,correct,firstClear,starBonus};return c.result;
}
