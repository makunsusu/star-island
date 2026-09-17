import {ref} from 'vue';
import {initialProgress,normalizeEquipment,type Progress} from '../shared/catalog';
export type PublicQuestion={id:string;a:number;b?:number;product?:number;options:number[];attempts:number;hint:boolean;answer?:number;mode:number};
export type PublicChallenge={id:string;level:number;index:number;settled:boolean;question:PublicQuestion|null;result?:{stars:number;coins:number;correct:number;firstClear:boolean;starBonus:boolean}};
export const progress=ref<Progress>(initialProgress());
export const currentUser=ref<{id:string;nickname:string;email:string}|null>(null);
export const challenge=ref<PublicChallenge|null>(null);
export const revision=ref(-1);
export class NetworkError extends Error {constructor(message:string,public status=0){super(message);}}
export async function request(path:string,body?:unknown){
 let r:Response;try{r=await fetch('/api'+path,{method:body?'POST':'GET',headers:body?{'Content-Type':'application/json'}:{},body:body?JSON.stringify(body):undefined,credentials:'same-origin'});}catch{throw new NetworkError('连接暂时中断，进度仍然保留，请重试');}
 const json=await r.json().catch(()=>({error:'服务暂时没有响应'}));if(!r.ok)throw new NetworkError(json.error||'操作没有完成',r.status);return json;
}
export function apply(data:any){if(typeof data.revision==='number'&&data.revision<revision.value)return;if(data.progress)progress.value={...data.progress,equipment:normalizeEquipment(data.progress.equipment)};if('challenge'in data)challenge.value=data.challenge;if(data.user)currentUser.value=data.user;if(typeof data.revision==='number')revision.value=data.revision;}
export async function refresh(){const d=await request('/state');apply(d);return d;}
export async function action(kind:string,data:Record<string,unknown>={},requestId=crypto.randomUUID()){const result=await request('/action',{kind,...data,requestId});apply(result);return result;}
