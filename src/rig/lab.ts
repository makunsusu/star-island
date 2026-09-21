import {createApp,h,reactive} from 'vue';
import Avatar from '../Avatar.vue';
import {outfits,accessories,slots,slotNames,suit,type Slot} from '../../shared/catalog';
import type {Emotion} from './pose';
import './lab.css';
const query=new URLSearchParams(location.search);
const enabled=outfits.filter(x=>x.id!=='iron');
const initial=enabled.some(x=>x.id===query.get('skin'))?query.get('skin')!:'nezha';
const state=reactive({equipment:suit(initial),emotion:(query.get('emotion')||'idle') as Emotion,time:Number(query.get('time')||0),age:Number(query.get('age')||.85),debug:query.has('debug'),matrix:query.get('matrix')||''});
for(const slot of slots){const v=query.get(slot);if(v&&(enabled.some(x=>x.id===v)||accessories.some(x=>x.id===v&&x.slot===slot)))state.equipment[slot]=v;}
const option=(id:string,name:string)=>h('option',{value:id},name);
createApp({render(){return h('main',[
 h('header',[h('h1','角色对齐检查台'),h('p','固定时间渲染 · 商品 ID 与存档不变 · 青色标记为骨骼连接点')]),
 h('aside',[
 h('label',['整套',h('select',{value:initial,onChange:(e:Event)=>Object.assign(state.equipment,suit((e.target as HTMLSelectElement).value))},enabled.map(x=>option(x.id,x.name)))]),
 ...slots.map((slot:Slot)=>h('label',[slotNames[slot],h('select',{value:state.equipment[slot],onChange:(e:Event)=>state.equipment[slot]=(e.target as HTMLSelectElement).value},[...enabled.map(x=>option(x.id,x.name)),...accessories.filter(x=>x.slot===slot).map(x=>option(x.id,x.name))])])),
 h('label',['表情',h('select',{value:state.emotion,onChange:(e:Event)=>state.emotion=(e.target as HTMLSelectElement).value as Emotion},['idle','happy','blush','angry','sad'].map(x=>option(x,x)))]),
 ...(['time','age'] as const).map(key=>h('label',[key,h('input',{type:'number',min:0,max:20,step:.05,value:state[key],onInput:(e:Event)=>state[key]=Number((e.target as HTMLInputElement).value)})])),
 h('label',[h('input',{type:'checkbox',checked:state.debug,onChange:(e:Event)=>state.debug=(e.target as HTMLInputElement).checked}),'显示锚点/边界']),
 h('button',{onClick:()=>{const p=new URLSearchParams({...state.equipment,emotion:state.emotion,time:String(state.time),age:String(state.age)});if(state.debug)p.set('debug','1');history.replaceState(null,'','?'+p);}},'保存当前检查链接')]),
 h('section',{class:state.matrix?'matrix':'single'},state.matrix?enabled.map(o=>h('article',[h(Avatar,{equipment:{...suit(o.id),...(accessories.find(a=>a.id===state.matrix)?{[accessories.find(a=>a.id===state.matrix)!.slot]:state.matrix}:{})},emotion:state.emotion,sampleTime:state.time,sampleAge:state.age,debug:state.debug}),h('h2',o.name)])):[h(Avatar,{equipment:state.equipment,emotion:state.emotion,sampleTime:state.time,sampleAge:state.age,debug:state.debug})])
]);}}).mount('#app');
