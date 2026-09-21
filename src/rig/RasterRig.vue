<script setup lang="ts">
import {computed,useId} from 'vue';
import {accessories,type Equipment} from '../../shared/catalog';
import {hands,backBoxes,palmPoint,clothingFits,type Box} from './attachments';
import {JOINTS,type Emotion,type Pose} from './pose';
import Sprite from './RegisteredSprite.vue';
import {HEAD,hairBoxes,hatBoxes,isHood,faceBoxes} from './registration';
const props=defineProps<{equipment:Equipment;pose:Pose;emotion:Emotion;time:number;debug?:boolean}>();
const uid=useId();
const available=['nezha','rabbit','base','lubu','strawberry','bear','frog','guanyu','monkey','galaxy','ice','lion'];
const skin=(id:string)=>available.includes(id)?id:'base';
const src=(id:string,part:string)=>`/art/rig/${skin(id)}/${part}.webp`;
const accessory=(id:string)=>`/art/rig/accessories/${id}.webp`;
const topSkin=computed(()=>props.equipment.top==='rainbow-shirt'?'base':available.includes(props.equipment.top)?props.equipment.top:skin(props.equipment.body));
const palm=computed(()=>palmPoint(topSkin.value));
const clothing=computed(()=>clothingFits[topSkin.value]!);
const capeBox=computed<Box>(()=>{const [x,y,w,h]=clothing.value.cape;return [x*1.28,y,w*1.28,h*1.38];});
const softSleeves=computed(()=>['base','rabbit','strawberry','bear','frog'].includes(topSkin.value));
const hairColor=computed(()=>({base:'#573a2b',rabbit:'#352820',strawberry:'#644531',bear:'#79523a',frog:'#573a2b',nezha:'#352624',lubu:'#302636',guanyu:'#3c2b23',monkey:'#533726',galaxy:'#293444',ice:'#7b9bc2',lion:'#8c602e'}[skin(props.equipment.hair)]));
const separateHat=computed(()=>accessories.some(a=>a.id===props.equipment.hat&&a.slot==='hat'));
const hatBox=computed<Box>(()=>separateHat.value?({crown:[-51,-240,102,75],goggles:[-88,-119,176,92],'star-clip':[47,-169,43,30]} as Record<string,Box>)[props.equipment.hat]!:hatBoxes[skin(props.equipment.hat)]!);
const backBox=computed(()=>backBoxes[props.equipment.back]??[-87,-5,174,170]);
const held=computed(()=>hands[props.equipment.hand]);
const backSrc=computed(()=>available.includes(props.equipment.back)?src(props.equipment.back,'back'):accessory(props.equipment.back));
const handSrc=computed(()=>available.includes(props.equipment.hand)?src(props.equipment.hand,'hand'):accessory(props.equipment.hand));
const hasSkirt=computed(()=>props.equipment.skirt==='strawberry');
const strawberryDress=computed(()=>topSkin.value==='strawberry');
const facePart=computed(()=>props.pose.blink<.3?'blink':props.emotion);
const point=(p:readonly[number,number])=>`translate(${p[0]} ${p[1]})`;
// Bound mixed/long weapon movement instead of sending it through the head or torso.
const foreRight=computed(()=>Math.max(-16,Math.min(26,props.pose.foreR)));
const armRight=computed(()=>Math.max(-62,Math.min(-6,props.pose.armR)));
const foreBox=computed<Box>(()=>softSleeves.value?[-24,-17,48,76]:[-20,-8,40,64]);
</script>
<template>
<svg viewBox="-50 -140 460 700" class="raster-canvas" aria-hidden="true" data-renderer="registered-raster" data-rig-version="4">
 <defs>
  <clipPath :id="uid+'-wrist-cut'"><rect x="-40" y="-30" width="80" :height="Math.max(15,palm[1]+21)"/></clipPath>
  <clipPath :id="uid+'-face-outline'"><path d="M0 -181C-51 -181-80 -147-77 -89C-98 -103-103 -77-89 -54Q-83 -48-75 -51C-69 -27-39 -18-20 -17L-20 -8Q-24 -4-20 0Q0 8 20 0Q24 -4 20 -8L20 -17C39 -18 69 -27 75 -51Q83 -48 89 -54C103 -77 98 -103 77 -89C80 -147 51 -181 0 -181Z"/></clipPath>
  <clipPath :id="uid+'-cape-collar'"><rect x="-48" y="-32" width="96" height="64"/></clipPath>
  <clipPath :id="uid+'-bodice'"><rect x="-80" y="-20" width="160" height="88"/></clipPath>
  <clipPath :id="uid+'-hood-hair'"><ellipse cx="0" cy="-117" rx="87" ry="92"/></clipPath>
  <clipPath :id="uid+'-features'"><rect x="-78" y="-137" width="156" height="112" rx="24"/></clipPath>
 </defs>
 <ellipse cx="180" cy="462" rx="72" ry="10" fill="#795a36" opacity=".12"/>
 <Sprite v-if="pose.energy>.05&&equipment.shoes!=='nezha'" :src="src(equipment.shoes,'effect')" :box="[85,355,190,145]" :opacity="pose.energy*.75"/>
 <g data-bone="root" :transform="`translate(${JOINTS.root[0]} ${JOINTS.root[1]+pose.y})`">
  <g data-bone="torso" :transform="`rotate(${pose.torso*.6})`">
   <g v-if="equipment.back!=='base'" data-bone="cape" :transform="`rotate(${equipment.back==='star-pack'?0:pose.cloth1*.2})`">
    <path v-if="equipment.back==='balloon'" d="M124 22Q108 45 54 34" fill="none" stroke="#dca6b8" stroke-width="1.2"/>
    <Sprite :src="backSrc" :box="backBox" :debug="debug"/>
   </g>
   <g v-if="equipment.top==='cape'" data-layer="cape-rear" :transform="`rotate(${pose.cloth1*.15})`"><Sprite :src="accessory('cape')" :box="capeBox"/></g>
   <g v-for="side in [-1,1]" :key="side" :data-bone="side<0?'ankle-left':'ankle-right'" :transform="`${point(side<0?JOINTS.hipL:JOINTS.hipR)} rotate(${(side<0?pose.legL:pose.legR)*.35})`">
    <Sprite v-if="equipment.shoes==='nezha'" :src="src('nezha','effect')" :box="[-40,19,78,89]"/>
    <Sprite :src="src(equipment.shoes,side<0?'shoeL':'shoeR')" :box="[-30,-8,60,60]" :debug="debug"/>
   </g>
   <Sprite data-layer="pants" :src="equipment.pants==='strawberry'?'/art/rig-v4/lower/strawberry-pants.webp':src(equipment.pants,'pants')" :box="[-74,equipment.pants==='strawberry'?58:equipment.pants==='base'?68:74,148,equipment.pants==='base'?114:112]" :debug="debug"/>
   <Sprite v-if="hasSkirt" data-layer="skirt" src="/art/rig-v4/lower/strawberry-skirt.webp" :box="[-82,60,164,100]"/>
   <Sprite :clip-path="strawberryDress?`url(#${uid}-bodice)`:undefined" data-layer="top" :src="equipment.top==='rainbow-shirt'?accessory(equipment.top):src(topSkin,'top')" :box="[-69,-16,138,topSkin==='base'?108:120]" :debug="debug"/>
   <Sprite v-if="equipment.top==='cape'" :clip-path="`url(#${uid}-cape-collar)`" :src="accessory('cape')" :box="capeBox" data-layer="cape-collar"/>
   <g v-if="equipment.back==='star-pack'" data-layer="backpack-straps" fill="none" stroke-linecap="round"><path d="M-38 -6Q-49 25-37 57M38 -6Q49 26 37 57" stroke="#795330" stroke-width="6"/><path d="M-38 -6Q-49 25-37 57M38 -6Q49 26 37 57" stroke="#d5ae6b" stroke-width="3"/></g>
   <g v-for="side in [-1,1]" :key="'arm'+side" :data-bone="side<0?'shoulder-left':'shoulder-right'" :transform="`${point(side<0?JOINTS.shoulderL:JOINTS.shoulderR)} rotate(${side<0?Math.max(-18,Math.min(55,pose.armL)):armRight})`">
    <Sprite :src="src(topSkin,side<0?'armL':'armR')" :box="softSleeves?[-24,-8,48,58]:[-21,-8,42,64]" :debug="debug"/>
    <g :data-bone="side<0?'elbow-left':'elbow-right'" :transform="`${point(JOINTS.elbow)} rotate(${side<0?Math.max(-24,Math.min(12,pose.foreL)):foreRight})`">
     <g v-if="side===1&&held" data-bone="wrist-right" :transform="point(palm)"><g data-attachment="hand" :transform="`rotate(${held.angle})`"><Sprite :src="handSrc" :box="[-held.gripX*held.width,-held.gripY*held.height,held.width,held.height]" :debug="debug"/></g></g>
     <Sprite :clip-path="side===1&&held?`url(#${uid}-wrist-cut)`:undefined" data-layer="forearm-front" :src="src(topSkin,side<0?'foreL':'foreR')" :box="foreBox" :debug="debug"/>
     <g v-if="side===1&&held" :transform="point(palm)" data-layer="gripping-fingers"><Sprite src="/art/rig-v4/detail/grip-right.webp" :box="[-17.6,-21.3,32,38]"/></g>
     <circle v-if="debug" :cx="side===1?palm[0]:0" :cy="side===1?palm[1]:0" r="3" fill="#00cddd"/>
    </g>
    <circle v-if="debug" r="3" fill="#00cddd"/>
   </g>
   <Sprite v-if="equipment.top==='scarf'" :src="accessory('scarf')" :box="clothing.scarf" data-layer="scarf"/>
   <g data-bone="head" :transform="`${point(JOINTS.neck)} rotate(${pose.head*.55})`">
    <Sprite :clip-path="`url(#${uid}-face-outline)`" data-layer="face" src="/art/rig-v4/face/idle.webp" :box="HEAD.face"/>
    <g v-if="facePart!=='idle'" :clip-path="`url(#${uid}-features)`"><Sprite data-layer="expression" :src="`/art/rig-v4/face/${facePart}.webp`" :box="faceBoxes[facePart]!"/></g>
    <Sprite v-if="equipment.hair==='guanyu'" data-layer="beard-front" src="/art/rig-v4/detail/beard.webp" :box="[-46,-49,92,104]"/>
    <Sprite v-if="equipment.hair==='nezha'" data-layer="forehead-mark" src="/art/rig-v4/detail/mark.webp" :box="[-8,-144,16,24]"/>
    <g :clip-path="isHood(equipment.hat)?`url(#${uid}-hood-hair)`:undefined"><path data-layer="hair-underlay" d="M-80 -112C-88 -166-51 -199 0 -199C51 -199 88 -166 80 -112L69 -139Q0 -161-69 -139Z" :fill="hairColor"/><Sprite data-layer="hair" :src="`/art/rig-v4/hair/${skin(equipment.hair)}.webp`" :box="hairBoxes[skin(equipment.hair)]!" :debug="debug"/></g>
    <Sprite v-if="equipment.hat!=='base'" data-layer="hat" :src="separateHat?accessory(equipment.hat):`/art/rig-v4/headwear/${skin(equipment.hat)}.webp`" :box="hatBox" :debug="debug"/>
    <g v-if="debug" fill="#00cddd"><circle v-for="(p,k) in {neck:HEAD.neck,eyes:HEAD.eyes,crown:HEAD.crown}" :key="k" :cx="p[0]" :cy="p[1]" r="3"/><path d="M0 0V-190M-95 -87H95" fill="none" stroke="#00cddd" stroke-width=".8"/></g>
   </g>
  </g>
 </g>
 <g data-layer="particles" fill="#ffcf72" pointer-events="none"><circle v-for="n in 9" :key="n" :cx="70+(n*67)%240" :cy="100+((n*83+time*13)%320)-pose.energy*30" :r="n%3===0?2.4:1.2" :opacity=".25+pose.energy*.5"/></g>
</svg>
</template>
<style scoped>.raster-canvas{width:100%;height:100%;overflow:visible;display:block;filter:drop-shadow(0 7px 5px #79462414)}</style>
