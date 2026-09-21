import {test} from 'node:test';
import assert from 'node:assert/strict';
import {existsSync} from 'node:fs';
import {assets,registeredRect,sourcePoint,hatBoxes,hairBoxes} from '../src/rig/registration.ts';
import {outfits,accessories,suit,normalizeEquipment} from '../shared/catalog.ts';
test('所有注册资源存在，尺寸与原画裁切记录有效',()=>{
 for(const [path,a]of Object.entries(assets)){assert(existsSync('public'+path),path);assert(a.size.every(n=>Number.isFinite(n)&&n>0),path);assert(a.trim.every(n=>Number.isFinite(n)&&n>=0),path);assert(a.canvas[0]!>=a.size[0]!&&a.canvas[1]!>=a.size[1]!,path);}
});
test('全部已开放角色均有独立发型、头饰和注册边界',()=>{
 for(const o of outfits.filter(o=>o.id!=='iron'))for(const [family,boxes]of [['hair',hairBoxes],['headwear',hatBoxes]]as const){assert(assets[`/art/rig-v4/${family}/${o.id}.webp`]);assert(boxes[o.id]);}
 for(const a of accessories)assert(assets[`/art/rig/accessories/${a.id}.webp`]);
});
test('显式注册保持长宽比，连接点与矩形变换一致',()=>{
 for(const path of Object.keys(assets)){const r=registeredRect(path,[-10,-20,80,110]);const a=assets[path]!;assert(Math.abs(r[2]/r[3]-a.size[0]!/a.size[1]!)<1e-8);assert.deepEqual(sourcePoint(path,[-10,-20,80,110],[.5,.5]),[r[0]+r[2]/2,r[1]+r[3]/2]);}
});
test('改变头饰保留发型身体及完整旧存档',()=>{
 for(const o of outfits){const e={...suit(o.id),hat:'crown'};const normalized=normalizeEquipment(e);assert.equal(normalized.hair,o.id);assert.equal(normalized.body,o.id);assert.deepEqual(normalized,e);}
});

test('基础装上臂、前臂的源关节与掌心连接点一致',async()=>{
 const {baseArmParts,boneTransform}=await import('../src/rig/limbRegistration.ts');
 const {palmPoint}=await import('../src/rig/attachments.ts');
 for(const part of Object.values(baseArmParts)){
  const [a,b,c,d,e,f]=boneTransform(part.start,part.end,part.length);
  for(const [point,expected] of [[part.start,0],[part.end,part.length]] as const){
   assert(Math.abs(a!*point[0]+c!*point[1]+e!)<1e-8);
   assert(Math.abs(b!*point[0]+d!*point[1]+f!-expected)<1e-8);
  }
  assert(assets[`/art/rig-v4/basearms/${part.src}.webp`]);
 }
 assert.deepEqual(palmPoint('base'),[0,baseArmParts.foreR.length]);
});
