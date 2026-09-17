export const slots = ['hat','hair','body','top','skirt','pants','shoes','back','hand'] as const;
export type Slot = typeof slots[number];
export type Equipment = Record<Slot,string>;
export type Outfit = {id:string;name:string;series:string;price:number;color:string;accent:string;icon:string;description:string;action:string;effect:string};
export const outfits:Outfit[] = [
{id:'base',name:'星星冒险家',series:'初心',price:0,color:'#dfc8a2',accent:'#79905c',icon:'🌟',description:'每一场大冒险，都从小小的勇气开始。',action:'向新朋友挥挥手',effect:'star'},
{id:'rabbit',name:'萝卜兔兔',series:'可爱',price:80,color:'#e4e9cf',accent:'#df965f',icon:'🥕',description:'装满勇气的萝卜背包，和一对会跳舞的兔耳朵。',action:'兔耳弹弹 · 萝卜拥抱',effect:'carrot'},
{id:'strawberry',name:'草莓甜心',series:'可爱',price:80,color:'#f3d6da',accent:'#d8758a',icon:'🍓',description:'把每一次小进步，变成一颗甜甜的草莓。',action:'草莓转转 · 甜蜜星雨',effect:'berry'},
{id:'bear',name:'小熊睡衣',series:'可爱',price:80,color:'#ead9c4',accent:'#bb8c63',icon:'🧸',description:'软乎乎的小熊，也有大大的冒险梦想。',action:'伸个懒腰 · 枕头星星',effect:'moon'},
{id:'frog',name:'青蛙雨衣',series:'可爱',price:80,color:'#dce9c8',accent:'#7eac65',icon:'🐸',description:'穿上小雨靴，去收集雨后第一道彩虹。',action:'水花轻跳 · 小伞摇摇',effect:'water'},
{id:'nezha',name:'哪吒',series:'神话',price:160,color:'#f3d4be',accent:'#dd6b48',icon:'🔥',description:'脚踏风火轮，难题也挡不住你的勇敢！',action:'风火轮起 · 红绫绕身',effect:'fire'},
{id:'lubu',name:'吕布',series:'三国',price:160,color:'#e4d8ed',accent:'#9971b0',icon:'⚔️',description:'双翎迎风，画戟闪耀。今天你就是小小战神。',action:'画戟落地 · 金浪展开',effect:'gold'},
{id:'guanyu',name:'关羽',series:'三国',price:160,color:'#d0e6d9',accent:'#519778',icon:'🐉',description:'青龙相伴，把每一道题都认真做到最好。',action:'横刀亮相 · 青龙游空',effect:'dragon'},
{id:'monkey',name:'齐天大圣',series:'神话',price:160,color:'#f4e1b8',accent:'#d4a14a',icon:'☁️',description:'驾着祥云，把九九口诀练得神通广大。',action:'金箍棒转 · 祥云升起',effect:'cloud'},
{id:'iron',name:'钢铁侠',series:'科技',price:200,color:'#efd1c8',accent:'#bd6252',icon:'🤖',description:'掌心点亮能量，你的大脑就是超级反应堆。',action:'面甲合上 · 掌心充能',effect:'beam'},
{id:'galaxy',name:'银河机甲',series:'科技',price:120,color:'#d8e4f3',accent:'#6e93c2',icon:'🚀',description:'星核引擎启动，向乘法宇宙出发！',action:'装甲启动 · 星图展开',effect:'orbit'},
{id:'ice',name:'冰霜龙骑士',series:'幻想',price:200,color:'#d9eaf0',accent:'#72acbf',icon:'❄️',description:'小龙展开冰晶翅膀，为你的坚持喝彩。',action:'冰翼展开 · 雪花纹章',effect:'ice'},
{id:'lion',name:'雷霆狮王',series:'幻想',price:200,color:'#efdfbe',accent:'#c69a49',icon:'⚡',description:'金色鬃甲，雷霆之锤。自信就是你的力量。',action:'雷锤高举 · 狮王徽记',effect:'thunder'}
];
export const accessories = [
{id:'star-clip',name:'星星发夹',slot:'hat',price:20,icon:'⭐'}, {id:'crown',name:'小皇冠',slot:'hat',price:40,icon:'👑'}, {id:'goggles',name:'飞行护目镜',slot:'hat',price:40,icon:'🥽'},
{id:'scarf',name:'暖暖围巾',slot:'top',price:20,icon:'🧣'}, {id:'cape',name:'勇气披风',slot:'top',price:50,icon:'🦸'}, {id:'rainbow-shirt',name:'彩虹上衣',slot:'top',price:40,icon:'🌈'},
{id:'wings',name:'云朵小翅膀',slot:'back',price:60,icon:'🪽'}, {id:'star-pack',name:'星星背包',slot:'back',price:40,icon:'🎒'}, {id:'balloon',name:'心愿气球',slot:'back',price:30,icon:'🎈'},
{id:'star-wand',name:'小星星杖',slot:'hand',price:20,icon:'🪄'}, {id:'lollipop',name:'彩虹棒棒糖',slot:'hand',price:30,icon:'🍭'}, {id:'flower',name:'太阳花',slot:'hand',price:20,icon:'🌻'}
] as const;
export const slotNames:Record<Slot,string>={hat:'头饰',hair:'头发',body:'身体',top:'上衣',skirt:'裙子',pants:'裤子',shoes:'鞋子',back:'背饰',hand:'手持'};
export const suit=(id:string):Equipment=>({hat:id,hair:id,body:id,top:id,skirt:id,pants:id,shoes:id,back:id,hand:id});
export const getOutfit=(id:string)=>outfits.find(o=>o.id===id) || outfits[0]!;
export const completeOutfit=(e:Equipment)=>slots.every(s=>e[s]===e.body)&&outfits.some(o=>o.id===e.body)?e.body:'mixed';
export const islandNumbers=[2,5,3,4,6,7,8,9,0];
export const islandNames=['萌芽草原','糖果小径','蘑菇森林','云端花园','星光湖畔','勇气山谷','彩虹天空','月亮港湾','星星庆典'];
export const modeNames=['萝卜地鼠田','魔法训练场','云朵搭桥','森林甜品屋'];
export const modeIcons=['🥕','🪄','☁️','🧁'];
export const levels=Array.from({length:18},(_,i)=>({id:i+1,island:Math.floor(i/2),name:islandNames[Math.floor(i/2)]!,factor:islandNumbers[Math.floor(i/2)]!,mode:i>=16?4:i%4,review:i%2===1}));
export const modeFor=(level:number,index:number)=>level>=17?Math.floor(index/2):(level-1)%4;
export type Fact={correct:number;challenges:string[];recent:boolean[];weak:boolean;seen:number};
export type Progress={coins:number;owned:string[];equipment:Equipment;wish:string|null;tutorial:boolean;stars:Record<string,number>;facts:Record<string,Fact>;settings:{sound:boolean;reducedMotion:boolean};history:{level:number;correct:number;at:string}[]};
export const initialProgress=():Progress=>({coins:0,owned:['base'],equipment:suit('base'),wish:null,tutorial:false,stars:{},facts:{},settings:{sound:true,reducedMotion:false},history:[]});

/** Upgrade the four-slot save without changing ownership, coins, or achievements. */
export function normalizeEquipment(raw:Partial<Equipment>):Equipment {
 const outfit=(id:unknown)=>typeof id==='string'&&outfits.some(o=>o.id===id);
 const anchor=outfit(raw.body)?raw.body!:'base';
 const result=suit(anchor);
 for(const slot of slots){const id=raw[slot];if(outfit(id)||accessories.some(a=>a.id===id&&a.slot===slot))result[slot]=id!;}
 if(!raw.top&&accessories.some(a=>a.id===raw.body&&a.slot==='top'))result.top=raw.body!;
 if(!raw.hair&&outfit(raw.hat))result.hair=raw.hat!;
 return result;
}
