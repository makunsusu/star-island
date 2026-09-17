import {test} from 'node:test';
import assert from 'node:assert/strict';
import {normalizeEquipment,suit,slots,completeOutfit,initialProgress} from '../shared/catalog.ts';
import {evaluatePose,JOINTS,type Emotion} from '../src/rig/pose.ts';
test('旧四槽存档自动展开，既有头饰和配饰保持原归属',()=>{
 const old={hat:'crown',body:'rabbit',back:'nezha',hand:'star-wand'};
 const e=normalizeEquipment(old);assert.equal(e.hat,'crown');assert.equal(e.top,'rabbit');assert.equal(e.shoes,'rabbit');assert.equal(e.hand,'star-wand');assert.equal(e.back,'nezha');assert.equal(Object.keys(e).length,9);
 assert.equal(normalizeEquipment({body:'scarf'}).top,'scarf');assert.equal(normalizeEquipment({body:'scarf'}).body,'base');
});
test('完整套装、自由混搭与重复归一化',()=>{
 for(const id of ['base','rabbit','nezha','iron']){const full=suit(id);assert.equal(completeOutfit(normalizeEquipment(full)),id);const mixed={...full,top:'strawberry',shoes:'frog'};assert.equal(completeOutfit(mixed),'mixed');assert.deepEqual(normalizeEquipment(mixed),mixed);assert.deepEqual(normalizeEquipment(normalizeEquipment(mixed)),mixed);}
 assert.deepEqual(slots.filter(s=>!initialProgress().equipment[s]),[]);
});
test('待机眨眼、脸红与开心姿态各自独立',()=>{
 assert(evaluatePose(4.37).blink<.1);assert.equal(evaluatePose(1).blink,1);assert(evaluatePose(1,'blush',.8).cheeks>evaluatePose(1).cheeks);assert.notEqual(evaluatePose(1,'happy',.8).armR,evaluatePose(1).armR);assert.notEqual(evaluatePose(1,'happy',.8,'lion').armR,evaluatePose(1,'happy',.8,'rabbit').armR);
});
test('骨骼坐标固定、所有时间和情绪姿态有效、减少动效静止',()=>{
 for(const e of ['idle','happy','sad','blush','angry'] as Emotion[])for(let t=0;t<10;t+=.05){const p=evaluatePose(t,e,t%2.2,'nezha');assert(Object.values(p).every(Number.isFinite));assert(p.blink>=.06&&p.blink<=1);}
 assert.equal(JOINTS.elbow[1],35);assert.equal(JOINTS.wrist[1],30);
 for(const e of ['idle','happy','sad','blush','angry'] as Emotion[]){const p=evaluatePose(1,e,.6,'nezha',true);const q=evaluatePose(3,e,.6,'nezha',true);assert.deepEqual(p,q);assert.equal(p.head,0);assert.equal(p.blink,1);}
});
