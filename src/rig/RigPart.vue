<script setup lang="ts">
import {computed,useId} from 'vue';
import {skinFor} from './skins';
const props=defineProps<{part:string;id:string;side?:number}>();
const uid=useId();
const s=computed(()=>skinFor(props.id));
const armor=computed(()=>s.value.type==='armor');
</script>
<template>
<g :data-layer="part" :data-skin="id" :stroke="s.ink" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round">
 <defs><linearGradient :id="uid+'-main'" x1=".15" y1="0" x2=".85" y2="1"><stop :stop-color="s.light"/><stop offset=".24" :stop-color="s.main"/><stop offset=".8" :stop-color="s.main"/><stop offset="1" :stop-color="s.trim"/></linearGradient><linearGradient :id="uid+'-gold'" x2=".8" y2="1"><stop stop-color="#fff0b5"/><stop offset=".45" :stop-color="s.trim"/><stop offset="1" stop-color="#bc8751"/></linearGradient><linearGradient :id="uid+'-hair'" x2=".35" y2="1"><stop :stop-color="s.hair"/><stop offset="1" stop-color="#503c40"/></linearGradient></defs>
 <template v-if="part==='body'"><path d="M-32-5Q0-18 32-5L36 64Q0 86-36 64Z" fill="#f5d1b5"/><path d="M-13-28V-5Q0 6 13-5V-28" fill="#f5d1b5"/></template>
 <template v-if="part==='top'">
  <path d="M-28-9Q-42-8-50 5L-44 30-35 25-38 61Q0 84 38 61L35 25 44 30 50 5Q42-8 28-9Q0 0-28-9Z" :fill="`url(#${uid}-main)`"/>
  <path d="M-15-8Q0 13 15-8L11 10 0 17-11 10Z" :fill="s.light"/>
  <template v-if="armor"><path d="M-31 9-7 18-12 36-31 30ZM31 9 7 18 12 36 31 30Z" :fill="`url(#${uid}-gold)`"/><path d="M-23 48 0 54 23 48V63L0 70-23 63Z" :fill="`url(#${uid}-gold)`"/><circle cy="28" r="13" :fill="id==='iron'||id==='galaxy'?'#d6f6ff':s.light"/><circle v-if="id==='iron'||id==='galaxy'" cy="28" r="7" fill="#fff" stroke="none"/></template>
  <template v-else-if="id==='base'||id==='rabbit'"><path d="M-21 0V33H21V0M-24 32V63Q0 75 24 63V32Z" :fill="id==='rabbit'?'#b7d3b0':s.main"/><circle cx="-18" cy="35" r="4" :fill="`url(#${uid}-gold)`"/><circle cx="18" cy="35" r="4" :fill="`url(#${uid}-gold)`"/><path d="M-10 45H10V54Q0 61-10 54Z" :fill="s.light" stroke-width="2"/></template>
  <template v-else-if="s.type==='robe'"><path d="M-17-4 18 49M17-4-18 49" fill="none" :stroke="s.light" stroke-width="9"/><path d="M-34 52H34V64H-34Z" :fill="`url(#${uid}-gold)`"/><circle cy="58" r="7" :fill="s.light"/></template>
  <template v-else><path d="M0 18V65" fill="none" stroke-width="2"/><circle v-for="n in 3" :key="n" :cy="17+n*12" r="2" :fill="`url(#${uid}-gold)`" stroke="none"/><path d="M-26 36H-11V47H-26M11 36H26V47H11" fill="none" stroke-width="2"/></template>
  <g v-if="id==='rabbit'" data-detail="bunny-bib"><path d="M-27 9Q0 23 27 9L24 56Q0 68-24 56Z" fill="#fff5e8"/><path d="M-9 31Q-5 20 6 26Q13 31 0 50Q-6 49-9 31Z" fill="#f0a272" stroke-width="2"/><path d="M-3 26-9 17M0 25 6 16" stroke="#8faa74" stroke-width="5"/><circle cx="-25" cy="10" r="6" fill="#f4cb8a"/><circle cx="25" cy="10" r="6" fill="#f4cb8a"/></g>
  <g v-if="id==='strawberry'" data-detail="cream-collar"><path d="M-29-7Q-22 17-4 8L0 0 4 8Q22 17 29-7L24 17Q12 29 0 17-12 29-24 17Z" fill="#fff6e7"/><path d="M0 19Q-25 7-20 28Q-10 38 0 25Q10 38 20 28Q25 7 0 19Z" fill="#c96a84"/><circle cy="23" r="5" fill="#f7cd91"/><path d="M-31 52Q0 63 31 52" fill="none" stroke="#fff6e7" stroke-width="4"/></g>
  <g v-if="id==='bear'" data-detail="moon-pajamas"><path d="M-20-7-5 8-14 19-29 1M20-7 5 8 14 19 29 1" fill="#f3ddbb"/><path d="M12 25Q-5 23 0 40Q-16 34-8 23Q0 15 12 25Z" fill="#ffe4a0" stroke-width="2"/><path d="m20 42 2 5 5 1-4 3 1 5-4-3-4 3 1-5-4-3 5-1" fill="#fff1c3" stroke="none"/><path d="M-24 44H-8V56H-24" fill="#caa276" stroke-width="2"/></g>
  <g v-if="id==='frog'" data-detail="raincoat"><path d="M-28-7Q0 12 28-7L19 17 0 10-19 17Z" fill="#d9eb9c"/><path d="M0 12V66" stroke="#718744" stroke-width="3"/><path d="M-29 39Q-19 33-9 39V55H-29ZM9 39Q19 33 29 39V55H9Z" fill="#d9eb9c"/><circle cx="-25" cy="36" r="4" fill="#fff6df"/><circle cx="-13" cy="36" r="4" fill="#fff6df"/><circle cx="-25" cy="36" r="1.5" fill="#546b42" stroke="none"/><circle cx="-13" cy="36" r="1.5" fill="#546b42" stroke="none"/><path d="M-27 58H-11M11 58H27" stroke="#fff9c7" stroke-width="3"/></g>
  <g v-if="id==='nezha'" data-detail="lotus-bib"><path d="M-21-5Q0 9 21-5L28 34Q0 59-28 34Z" fill="#df6b78"/><path d="M0 19Q-20 13-15 31Q-4 42 0 35Q4 42 15 31Q20 13 0 19Z" fill="#ffd7ac" stroke-width="2"/><path d="M0 10Q-11 23 0 34Q11 23 0 10Z" fill="#fff0c8" stroke-width="2"/><path d="M-33 52Q0 60 33 52" fill="none" stroke="#f2ce85" stroke-width="9"/></g>
  <g v-if="id==='lubu'" data-detail="warrior-plates"><path d="M-32 9-12 17-18 38-34 28ZM32 9 12 17 18 38 34 28Z" fill="#e9c274"/><path d="M-11 14 0 4 11 14 0 37Z" fill="#8e65a9"/><path d="M-29 51Q0 65 29 51M-29 43Q0 57 29 43" fill="none" stroke="#f9dc91" stroke-width="4"/><circle cy="56" r="8" fill="#ad779e"/></g>
  <g v-if="id==='guanyu'" data-detail="jade-robe"><path d="M-27-3 23 43 32 30-12-7" fill="#f2d391"/><path d="M-24 33Q-8 13 4 33T27 33Q12 56-4 37T-24 42" fill="none" stroke="#e8dba4" stroke-width="3"/><path d="M-33 53H33V65H-33Z" fill="#cda258"/><rect x="-10" y="51" width="20" height="17" rx="5" fill="#deeee0"/></g>
  <g v-if="id==='monkey'" data-detail="tiger-armor"><path d="M-28 8 0 17 28 8 21 39 0 49-21 39Z" fill="#f3cf76"/><path d="m-19 18 10 8-11-2M19 18-10 8 11-2M-12 35l12 6 12-6" fill="none" stroke="#ad744b" stroke-width="4"/><path d="M-33 54H33V65H-33Z" fill="#dc815f"/></g>
  <g v-if="id==='galaxy'" data-detail="space-suit"><path d="M-23 9H23V40Q0 51-23 40Z" fill="#f4f6ed"/><rect x="-15" y="16" width="30" height="17" rx="6" fill="#789ab6"/><path d="m0 17 3 5 6 1-5 4 1 5-5-3-5 3 1-5-5-4 6-1Z" fill="#d9f4ee" stroke="none"/><circle cx="-12" cy="39" r="2" fill="#edaa8d"/><circle cx="-5" cy="39" r="2" fill="#9bbc87"/></g>
  <g v-if="id==='ice'" data-detail="ice-crystal"><path d="M0 8 15 27 0 48-15 27Z" fill="#e7ffff"/><path d="M0 8V48M-15 27H15" stroke="#9bc9d9" stroke-width="2"/><path d="M-31 48-16 55M31 48 16 55" stroke="#e8faff" stroke-width="5"/></g>
  <g v-if="id==='lion'" data-detail="lion-badge"><path d="m0 9 9 4 9 0 4 10 5 7-7 8-4 8-10-2-10 2-4-8-7-8 5-7 4-10 9 0Z" fill="#edbc67"/><ellipse cy="27" rx="14" ry="15" fill="#ffe4a1"/><path d="M-7 23H-4M4 23H7M-3 31 0 34 3 31M0 34V39" fill="none" stroke="#8a6849" stroke-width="2.5"/></g>
  <path v-if="id==='scarf'" d="M-25-9Q0 7 25-9L28 5 4 16 5 49-10 42-8 15-27 4Z" fill="#e7a6a4"/>
  <path v-if="id==='rainbow-shirt'" d="M-18 40A18 18 0 0 1 18 40" fill="none" stroke="#df9da7" stroke-width="7"/>
 </template>
 <template v-if="part==='sleeve'"><path d="M-14-4Q0-16 14-4L15 23Q0 30-15 23Z" :fill="`url(#${uid}-main)`"/><path d="M-12 22H13V29H-12Z" :fill="s.light"/><path v-if="armor" d="M-19-3Q0-23 19-3L16 13Q0 18-16 13Z" :fill="`url(#${uid}-gold)`"/></template>
 <template v-if="part==='forearm'"><path d="M-11-5Q0-10 11-5L12 24Q0 39-12 24Z" :fill="armor?s.trim:'#f5d1b5'"/><path v-if="armor" d="M-11 12H11V26Q0 33-11 26Z" :fill="`url(#${uid}-main)`"/><ellipse cy="29" rx="13" ry="11" fill="#f5d1b5"/></template>
 <template v-if="part==='pants'"><path d="M-17-5H17L17 22Q0 32-17 22Z" :fill="`url(#${uid}-main)`"/><path d="M-17 19H17V28H-17Z" :fill="armor?s.trim:s.light"/></template>
 <template v-if="part==='shoes'"><path d="M-14-9H14V7Q31 8 29 22Q28 30 10 30H-15Q-24 29-21 15L-15 8Z" :fill="s.boot"/><path d="M-16 23Q0 28 20 21" fill="none" :stroke="s.light" stroke-width="5"/><path d="M-6 3H7M-6 10H8" fill="none" :stroke="s.light" stroke-width="2.5"/><template v-if="id==='rabbit'"><ellipse cx="0" cy="-8" rx="4" ry="10" :fill="s.light"/><ellipse cx="9" cy="-7" rx="4" ry="10" :fill="s.light"/><circle cy="13" r="3" fill="#e9a6aa" stroke="none"/></template></template>
 <template v-if="part==='skirt'&&s.skirt"><path d="M-34 0H34Q41 12 50 34Q42 44 33 39Q20 49 10 44Q0 50-10 44Q-20 49-33 39Q-42 44-50 34Z" :fill="`url(#${uid}-main)`"/><path d="M-32 11-38 42M-12 12-15 47M12 12 15 47M32 11 38 42" fill="none" :stroke="s.trim" stroke-width="3"/><path d="M-45 41Q0 52 45 41" fill="none" :stroke="s.light" stroke-width="7"/></template>
 <template v-if="part==='hair'"><path d="M-76-99Q-89-152-48-170Q-22-195 10-174Q66-184 78-137L77-99Q64-100 57-120L48-138Q31-109 8-113L16-138Q-5-108-34-113L-43-132Q-47-106-64-101Z" :fill="`url(#${uid}-hair)`"/><path d="M-51-150Q-20-173 7-153M20-157Q45-166 59-145" stroke="#fff1d5" stroke-opacity=".25" fill="none" stroke-width="5"/>
  <template v-if="id==='nezha'"><circle cx="-66" cy="-150" r="22" :fill="`url(#${uid}-hair)`"/><circle cx="66" cy="-150" r="22" :fill="`url(#${uid}-hair)`"/><path d="M-86-151-47-146M48-147 85-152" :stroke="s.main" stroke-width="8"/></template>
  <template v-if="id==='strawberry'"><path d="M-66-104Q-100-88-80-53L-65-68M66-104Q100-88 80-53L65-68" :fill="`url(#${uid}-hair)`"/></template>
 </template>
 <template v-if="part==='hat'">
  <template v-if="['rabbit','bear','frog'].includes(id)"><path d="M-79-101Q-88-180 0-179 88-180 79-101L65-114Q62-151 0-151-62-151-65-114Z" :fill="id==='rabbit'?'#fff4e4':s.main"/><template v-if="id==='bear'"><circle cx="-62" cy="-173" r="23" :fill="`url(#${uid}-main)`"/><circle cx="62" cy="-173" r="23" :fill="`url(#${uid}-main)`"/><circle cx="-62" cy="-173" r="11" fill="#eed8bd" stroke="none"/><circle cx="62" cy="-173" r="11" fill="#eed8bd" stroke="none"/></template><template v-if="id==='frog'"><circle cx="-40" cy="-177" r="21" :fill="`url(#${uid}-main)`"/><circle cx="40" cy="-177" r="21" :fill="`url(#${uid}-main)`"/><circle cx="-40" cy="-178" r="9" fill="#fff9e9"/><circle cx="40" cy="-178" r="9" fill="#fff9e9"/><circle cx="-40" cy="-178" r="3" fill="#655454" stroke="none"/><circle cx="40" cy="-178" r="3" fill="#655454" stroke="none"/></template></template>
  <template v-else-if="id==='strawberry'"><path d="M-68-146Q-64-200 8-189 79-180 72-147L42-140-50-138Z" :fill="`url(#${uid}-main)`"/><path d="m-7-185 4-14 10 8 14-7-2 16" fill="#acc28c"/><circle v-for="n in 5" :key="n" :cx="-48+n*19" :cy="n%2?-161:-176" r="2.5" fill="#fff5cf" stroke="none"/></template>
  <template v-else-if="['lubu','monkey','lion','crown'].includes(id)"><path d="M-51-143-59-180-27-164 0-189 27-164 59-180 51-143Z" :fill="id==='crown'?'#e8c875':s.trim"/><path d="M-51-145Q0-134 51-145" fill="none" stroke-width="7" :stroke="s.main"/><path d="m0-168 8 9-8 9-8-9z" :fill="`url(#${uid}-main)`"/></template>
  <template v-else-if="id==='guanyu'"><path d="M-68-141Q-55-183 0-185 55-183 68-141Z" :fill="`url(#${uid}-main)`"/><path d="M-65-143Q0-153 65-143" fill="none" :stroke="s.trim" stroke-width="10"/><circle cy="-153" r="8" :fill="s.light"/></template>
  <template v-else-if="id==='iron'"><path d="M-73-100Q-86-177 0-177 86-177 73-100L65-120 45-146H-45L-65-120Z" :fill="`url(#${uid}-main)`"/><path d="M-48-127-39-151H-18L-14-166H14L18-151H39L48-127 36-110 0-120-36-110Z" :fill="`url(#${uid}-gold)`"/></template>
  <template v-else-if="id==='galaxy'||id==='goggles'"><path d="M-77-83H77" stroke="#765a52" stroke-width="9"/><path d="M-10-82Q0-88 10-82" fill="none" stroke="#dba963" stroke-width="6"/><rect x="-62" y="-96" width="50" height="40" rx="16" fill="#c0ebed" fill-opacity=".48" stroke="#be8e58" stroke-width="5"/><rect x="12" y="-96" width="50" height="40" rx="16" fill="#c0ebed" fill-opacity=".48" stroke="#be8e58" stroke-width="5"/><path d="M-51-87-35-89M24-87 40-89" stroke="#fff" stroke-width="4"/></template>
  <template v-else-if="id==='ice'"><path d="M-61-146-72-193-40-164M61-146 72-193 40-164" :fill="`url(#${uid}-gold)`"/><path d="M-68-139Q0-170 68-139L50-122 0-143-50-122Z" :fill="`url(#${uid}-main)`"/><path d="m0-170 10 16-10 15-10-15z" fill="#e5fbff"/></template>
  <path v-else-if="id==='star-clip'" d="m44-146 5-12 6 12 14 2-10 9 3 14-13-7-12 7 2-14-10-9z" fill="#e9c777"/>
 </template>
 <template v-if="part==='back'">
  <template v-if="['ice','wings'].includes(id)"><path d="M-24 15Q-93-58-113-20L-92 36-56 56-35 40Z" :fill="id==='wings'?'#fffae9':s.main"/><path d="M24 15Q93-58 113-20L92 36 56 56 35 40Z" :fill="id==='wings'?'#fffae9':s.main"/><path d="M-30 19-103-17-76 32M30 19 103-17 76 32" :stroke="s.trim" fill="none"/></template>
  <template v-else-if="['lubu','guanyu','lion','cape','monkey'].includes(id)"><path d="M-31-11Q-70 16-77 109L-37 98 0 116 37 98 77 109Q70 16 31-11Z" :fill="`url(#${uid}-main)`"/><path d="M-49 25-57 87M49 25 57 87" :stroke="s.light" stroke-opacity=".45" fill="none" stroke-width="6"/></template>
  <template v-else-if="id==='balloon'"><path d="M-46 38Q-84 27-78-44" fill="none"/><path d="M-78-50Q-116-64-106-94-84-118-78-92-55-118-42-94-30-65-78-50Z" fill="#edafb4"/></template>
  <template v-else-if="id!=='base'&&id!=='nezha'"><rect x="-61" y="3" width="40" height="65" rx="17" :fill="`url(#${uid}-gold)`"/><path d="M-59 39H-24M-49 16H-33" fill="none" :stroke="s.light" stroke-width="5"/></template>
 </template>
 <template v-if="part==='hand'&&id!=='base'">
  <template v-if="id==='rabbit'"><path d="M0-5Q-24-59-6-63 15-66 0-5Z" fill="#edaa72"/><path d="M-6-63Q-26-87-8-83L-3-67Q5-91 15-77L1-63" fill="#adc68c"/><path d="M-10-43-1-47M-6-27 1-30" fill="none" stroke="#d18c59" stroke-width="2"/></template>
  <template v-else-if="id==='iron'"><circle r="12" fill="#edd196"/><circle r="7" fill="#dbf6ff" stroke="#9cc8d9" stroke-width="2"/></template>
  <template v-else-if="id==='bear'"><rect x="-18" y="-47" width="43" height="40" rx="12" :fill="s.light"/><path d="m3-39 3 8 9 1-7 6 2 8-7-4-8 4 2-8-6-6 9-1z" :fill="`url(#${uid}-gold)`" stroke-width="2"/></template>
  <template v-else-if="id==='ice'"><path d="M0-61 30-49 27-17 0 5-27-17-30-49Z" :fill="`url(#${uid}-main)`"/><path d="m0-49 12 18L0-10-12-31Z" fill="#e7f9ff"/><path d="M0-43V-17M-10-32H10" :stroke="s.trim" stroke-width="2"/></template>
  <template v-else-if="id==='frog'"><path d="M0 0V-88M-43-53Q-35-88 0-90Q35-88 43-53Q32-64 22-53Q11-64 0-53Q-11-64-22-53Q-32-64-43-53Z" fill="#d6e9ce" fill-opacity=".7"/><path d="M0-90V-53M0-90Q-17-79-22-53M0-90Q17-79 22-53" fill="none"/></template>
  <template v-else>
   <path d="M0 14V-67" :stroke="s.trim" stroke-width="8"/>
   <path d="M0 14V-67" stroke="#715956" stroke-width="2"/>
   <path v-if="id==='lubu'" d="M0-99-11-78 0-65 11-78ZM4-80Q35-101 20-56L4-65Z" :fill="`url(#${uid}-gold)`"/>
   <path v-else-if="id==='guanyu'" d="M-5-63Q-36-86 0-112 24-90 15-62Z" fill="#bad5c3"/>
   <g v-else-if="id==='lion'"><rect x="-29" y="-85" width="58" height="33" rx="8" :fill="`url(#${uid}-gold)`"/><path d="m1-79-9 15h10l-4 10 14-18H1z" :fill="s.light" stroke-width="2"/></g>
   <template v-else-if="id==='monkey'"><path d="M0-85V-60M0 6V20" stroke="#e8c978" stroke-width="11"/></template>
   <template v-else-if="id==='nezha'"><circle cy="-65" r="24" fill="none" stroke="#ddbc79" stroke-width="9"/><circle cy="-65" r="24" fill="none" stroke="#6d5554" stroke-width="2"/></template>
   <template v-else-if="id==='strawberry'"><path d="M-18-74Q0-96 18-74 18-54 0-45-18-54-18-74Z" fill="#eaa1b1"/><path d="m-10-79 10 8 10-8" stroke="#97b584" stroke-width="7"/><circle cx="-5" cy="-61" r="2" fill="#fff" stroke="none"/><circle cx="7" cy="-66" r="2" fill="#fff" stroke="none"/></template>
   <template v-else-if="id==='lollipop'"><circle cy="-66" r="19" fill="#eab3ca"/><path d="M-9-66Q-5-83 9-72 21-60 3-54-17-52-18-68" fill="none" stroke="#fff0ca" stroke-width="6"/></template>
   <template v-else-if="id==='flower'"><circle v-for="n in 6" :key="n" :cx="Math.cos(n*Math.PI/3)*13" :cy="-66+Math.sin(n*Math.PI/3)*13" r="9" fill="#efd18d" stroke-width="2"/><circle cy="-66" r="9" fill="#bc986d"/></template>
   <path v-else d="m0-91 8 16 18 3-13 13 3 18-16-9-16 9 3-18-13-13 18-3z" :fill="id==='galaxy'?'#c7e7f5':'#efd292'"/>
  </template>
 </template>
</g>
</template>
