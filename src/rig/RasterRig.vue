<script setup lang="ts">
import {computed,watch,useId} from 'vue';
import {accessories,type Equipment} from '../../shared/catalog';
import {hands,backBoxes,headAccessories,portraitAccessories,palmPoint,clothingFits,cleanHeadAccessories,cleanPortraitAccessories} from './attachments';
import type {Emotion,Pose} from './pose';
const props=defineProps<{equipment:Equipment;pose:Pose;emotion:Emotion;time:number}>();
const uid=useId();
const available=['nezha','rabbit','base','lubu','strawberry','bear','frog','guanyu','monkey','galaxy','ice','lion'];
const skin=(id:string)=>available.includes(id)?id:'base';
const src=(id:string,part:string)=>`/art/rig/${skin(id)}/${part}.webp`;
const accessory=(id:string)=>`/art/rig/accessories/${id}.webp`;
const topSkin=computed(()=>props.equipment.top==='rainbow-shirt'?'base':available.includes(props.equipment.top)?props.equipment.top:skin(props.equipment.body));
const palm=computed(()=>palmPoint(topSkin.value));
const clothing=computed(()=>clothingFits[skin(props.equipment.body)]!);
const softSleeves=computed(()=>['base','rabbit','strawberry','bear','frog'].includes(topSkin.value));
const separateHat=computed(()=>accessories.some(a=>a.id===props.equipment.hat&&a.slot==='hat'));
// Theme headwear is a complete registered portrait, never an arbitrary image on a base head.
const headSkin=computed(()=>available.includes(props.equipment.hat)&&props.equipment.hat!=='base'?props.equipment.hat:skin(props.equipment.hair));
const cleanPortrait=computed(()=>['lubu','monkey','ice','lion','galaxy','rabbit','strawberry','bear','frog','guanyu'].includes(headSkin.value)&&(separateHat.value||props.equipment.hat==='base'));
const headBox=computed(()=>cleanPortrait.value?(headSkin.value==='guanyu'?[-95,-199,190,255]:headSkin.value==='strawberry'?[-113,-167,226,200]:[-99,-193,198,200]):headSkin.value==='lubu'?[-124,-245,248,260]:headSkin.value==='guanyu'?[-112,-180,224,222]:headSkin.value==='strawberry'?[-112,-195,224,222]:[-112,-207,224,222]);
const headPart=computed(()=>{
 const id=headSkin.value,e=props.emotion;
 if(cleanPortrait.value)return e==='blush'?'blush':e==='angry'?'angry':e==='happy'||props.pose.blink<.15?'happy':'head';
 if(id==='guanyu')return e==='happy'?'angry':e==='angry'?'blush':props.pose.blink<.15?'happy':'head';
 if(id==='monkey')return e==='happy'||props.pose.blink<.15?'happy':e==='angry'?'blush':'head';
 if(id==='strawberry'&&e==='angry')return 'head';
 return e==='blush'?'blush':e==='angry'?'angry':e==='happy'||props.pose.blink<.15?'happy':'head';
});
const hatBox=computed(()=>cleanPortrait.value?(cleanPortraitAccessories[headSkin.value]?.[props.equipment.hat]??cleanHeadAccessories[props.equipment.hat]!):portraitAccessories[headSkin.value]?.[props.equipment.hat]??headAccessories[props.equipment.hat]??(['rabbit','bear','frog'].includes(props.equipment.hat)?[-116,-230,232,231]:props.equipment.hat==='galaxy'?[-113,-100,226,94]:[-106,-252,212,151]));
const backBox=computed(()=>backBoxes[props.equipment.back]??[-87,-5,174,170]);
const held=computed(()=>hands[props.equipment.hand]);
const backSrc=computed(()=>available.includes(props.equipment.back)?src(props.equipment.back,'back'):accessory(props.equipment.back));
const handSrc=computed(()=>available.includes(props.equipment.hand)?src(props.equipment.hand,'hand'):accessory(props.equipment.hand));
const strawberryDress=computed(()=>topSkin.value==='strawberry'&&props.equipment.pants==='strawberry');
const lowerSkin=computed(()=>props.equipment.pants);
const portraitSrc=computed(()=>src(headSkin.value,headPart.value+(cleanPortrait.value?'-clean':'')));
watch([headSkin,cleanPortrait],([id,clean])=>{for(const part of ['head','happy','blush','angry']){const img=new Image();img.src=src(id,part+(clean?'-clean':''));}},{immediate:true});
</script>
<template>
<svg viewBox="-16 -24 392 550" class="raster-canvas" aria-hidden="true" data-renderer="raster-bones">
 <defs><clipPath :id="uid+'-bodice'"><rect x="-80" y="-20" width="160" height="80"/></clipPath><linearGradient :id="uid+'-blend'" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="white" stop-opacity="0"/><stop offset=".2" stop-color="white"/><stop offset="1" stop-color="white"/></linearGradient><mask :id="uid+'-arm'" maskUnits="userSpaceOnUse" x="-30" y="-8" width="60" height="64"><rect x="-30" y="-8" width="60" height="64" :fill="`url(#${uid}-blend)`"/></mask></defs>
 <ellipse cx="180" cy="490" rx="72" ry="10" fill="#795a36" opacity=".12"/>
 <image v-if="pose.energy>.05&&equipment.shoes!=='nezha'" :href="src(equipment.shoes,'effect')" x="85" y="355" width="190" height="145" :opacity="pose.energy*.75"/>
 <g data-bone="root" :transform="`translate(180 ${241+pose.y})`">
  <g data-bone="torso" :transform="`rotate(${pose.torso*.6})`">
   <g v-if="equipment.back!=='base'" data-bone="cape" :transform="`rotate(${equipment.back==='star-pack'?0:pose.cloth1*.35})`"><path v-if="equipment.back==='balloon'" d="M124 22Q108 45 54 34" fill="none" stroke="#dca6b8" stroke-width="1.2"/><image :href="backSrc" :x="backBox[0]" :y="backBox[1]" :width="backBox[2]" :height="backBox[3]" preserveAspectRatio="xMidYMid meet"/></g>
   <g v-if="equipment.back==='nezha'" data-bone="ribbon-right" :transform="`translate(36 10) rotate(${-pose.cloth2*.4})`"><image :href="src('nezha','hat')" x="-2" y="-100" width="124" height="235"/></g>
   <g v-for="side in [-1,1]" :key="side" :data-bone="side<0?'hip-left':'hip-right'" :transform="`translate(${side*35} 163) rotate(${side<0?pose.legL:pose.legR})`">
    <image v-if="equipment.shoes==='nezha'" :href="src('nezha','effect')" x="-40" y="19" width="78" height="89" :transform="`rotate(${side*8})`"/>
    <image :href="src(equipment.shoes,side<0?'shoeL':'shoeR')" x="-30" y="-5" width="60" height="54"/>
   </g>
   <image data-layer="pants" :href="src(lowerSkin,'pants')" x="-74" :y="strawberryDress?44:lowerSkin==='base'?68:78" width="148" :height="strawberryDress?138:lowerSkin==='base'?114:104"/>
   <image :clip-path="strawberryDress?`url(#${uid}-bodice)`:undefined" data-layer="top" :href="equipment.top==='rainbow-shirt'?accessory(equipment.top):src(topSkin,'top')" x="-69" y="-16" width="138" :height="topSkin==='base'?108:120"/>
   <image v-if="equipment.top==='cape'" :href="accessory('cape')" :x="clothing.cape[0]" :y="clothing.cape[1]" :width="clothing.cape[2]" :height="clothing.cape[3]" data-layer="cape-front"/>
   <g v-if="equipment.back==='star-pack'" data-layer="backpack-straps" fill="none" stroke-linecap="round"><path d="M-40 -8Q-55 25-39 62M40 -8Q53 26 39 62" stroke="#795330" stroke-width="7"/><path d="M-40 -8Q-55 25-39 62M40 -8Q53 26 39 62" stroke="#d5ae6b" stroke-width="3"/></g>
   <g v-for="side in [-1,1]" :key="'arm'+side" :data-bone="side<0?'shoulder-left':'shoulder-right'" :transform="`translate(${(topSkin==='nezha'?(side<0?-40:50):side*57)} 8) rotate(${side<0?pose.armL:pose.armR})`">
    <image v-if="!softSleeves" :href="src(topSkin,side<0?'armL':'armR')" x="-19" y="-5" width="38" height="59"/>
    <g :data-bone="side<0?'elbow-left':'elbow-right'" :transform="`translate(0 35) rotate(${side<0?pose.foreL:pose.foreR})`">
     <g v-if="side===1&&held" data-bone="wrist-right" :transform="`translate(${palm[0]} ${palm[1]})`"><g data-attachment="hand" :transform="`rotate(${held.angle})`"><image :href="handSrc" :x="-held.gripX*held.width" :y="-held.gripY*held.height" :width="held.width" :height="held.height"/></g></g>
     <image :mask="topSkin==='nezha'?`url(#${uid}-arm)`:undefined" :href="src(topSkin,side<0?'foreL':'foreR')" :x="softSleeves?-24:-20" :y="softSleeves?-17:-8" :width="softSleeves?48:40" :height="softSleeves?76:64"/>
    </g>
   </g>
   <image v-if="equipment.top==='scarf'" :href="accessory('scarf')" :x="clothing.scarf[0]" :y="clothing.scarf[1]" :width="clothing.scarf[2]" :height="clothing.scarf[3]" data-layer="scarf"/>

   <g data-bone="head" :transform="`translate(0 -8) rotate(${pose.head*.55})`"><image data-layer="head" :preserveAspectRatio="cleanPortrait?'xMidYMax meet':'xMidYMid meet'" :href="portraitSrc" :x="headBox[0]" :y="headBox[1]" :width="headBox[2]" :height="headBox[3]"/>
    <image v-if="separateHat&&equipment.hat!=='base'&&equipment.hat!=='nezha'" data-layer="hat" :href="available.includes(equipment.hat)?src(equipment.hat,'hat'):accessory(equipment.hat)" :x="hatBox[0]" :y="hatBox[1]" :width="hatBox[2]" :height="hatBox[3]"/>
   </g>
  </g>
 </g>
 <g data-layer="particles" fill="#ffcf72" pointer-events="none"><circle v-for="n in 9" :key="n" :cx="70+(n*67)%240" :cy="100+((n*83+time*13)%320)-pose.energy*30" :r="n%3===0?2.4:1.2" :opacity=".25+pose.energy*.5"/></g>
</svg>
</template>
<style scoped>.raster-canvas{width:100%;height:100%;overflow:visible;display:block;filter:drop-shadow(0 7px 5px #79462414)}</style>
