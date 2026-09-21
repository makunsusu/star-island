<script setup lang="ts">
import {computed,ref,watch,onMounted,onUnmounted} from 'vue';
import {getOutfit,completeOutfit,normalizeEquipment,type Equipment} from '../shared/catalog';
import RasterRig from './rig/RasterRig.vue';
import {evaluatePose,type Emotion} from './rig/pose';
const props=withDefaults(defineProps<{equipment:Equipment;perform?:number;reduced?:boolean;mini?:boolean;emotion?:Emotion;reaction?:number;sampleTime?:number;sampleAge?:number;debug?:boolean}>(),{perform:0,reduced:false,mini:false,emotion:'idle',reaction:0});
const host=ref<HTMLElement|null>(null),clock=ref(0),active=ref<Emotion>('idle'),started=ref(0),systemReduced=ref(false);
const equipment=computed(()=>normalizeEquipment(props.equipment));
const complete=computed(()=>completeOutfit(equipment.value));
const theme=computed(()=>getOutfit(equipment.value.top));
const minimal=computed(()=>props.reduced||systemReduced.value);
const shownEmotion=computed(()=>props.sampleTime===undefined?active.value:props.emotion);
const age=computed(()=>Math.max(0,clock.value-started.value));
const pose=computed(()=>evaluatePose(props.sampleTime??clock.value,shownEmotion.value,props.sampleAge??age.value,complete.value,minimal.value));
const expressionNames:Record<Emotion,string>={idle:'待机',happy:'开心',blush:'害羞',angry:'斗志满满',sad:'再试一次'};
let raf=0,timer:ReturnType<typeof setTimeout>|undefined,observer:IntersectionObserver|undefined,media:MediaQueryList|undefined,inView=true;
const now=()=>performance.now()/1000;
function trigger(emotion:Emotion){clearTimeout(timer);clock.value=now();started.value=clock.value;active.value=emotion;if(emotion!=='idle')timer=setTimeout(()=>{active.value='idle';},2200);}
function frame(){clock.value=now();raf=requestAnimationFrame(frame);}
function updateLoop(){cancelAnimationFrame(raf);raf=0;if(props.sampleTime===undefined&&!minimal.value&&inView&&document.visibilityState==='visible')raf=requestAnimationFrame(frame);}
const mediaChanged=()=>{systemReduced.value=!!media?.matches;updateLoop();};
watch(()=>props.perform,v=>{if(v)trigger('happy');});
watch(()=>props.reaction,()=>trigger(props.emotion));
watch(()=>props.emotion,v=>{if(v==='idle')return;trigger(v);});
watch(minimal,()=>{if(typeof document!=='undefined')updateLoop();});
onMounted(()=>{clock.value=now();media=matchMedia('(prefers-reduced-motion: reduce)');mediaChanged();media.addEventListener('change',mediaChanged);observer=new IntersectionObserver(entries=>{inView=entries[0]?.isIntersecting??false;updateLoop();});if(host.value)observer.observe(host.value);document.addEventListener('visibilitychange',updateLoop);if(props.perform)trigger('happy');else if(props.emotion!=='idle')trigger(props.emotion);});
onUnmounted(()=>{cancelAnimationFrame(raf);clearTimeout(timer);observer?.disconnect();media?.removeEventListener('change',mediaChanged);document.removeEventListener('visibilitychange',updateLoop);});
</script>
<template>
<div ref="host" class="avatar bone-avatar" :class="{mini, 'bone-reduced':minimal}" :data-emotion="shownEmotion" :data-rig-version="complete==='iron'?'pending':'4'" :data-skin="complete" role="img" :aria-label="`${complete==='mixed'?'我的混搭冒险家':theme.name}，${expressionNames[shownEmotion]}`">
 <RasterRig v-if="complete!=='iron'" :equipment="equipment" :pose="pose" :emotion="shownEmotion" :time="sampleTime??(minimal?0:clock)" :debug="debug"/>
 <div v-else class="art-pending" role="status"><span>✦</span><strong>精绘升级中</strong><small>钢铁侠造型尚未就绪</small></div>
</div>
</template>
<style scoped>
.bone-avatar{isolation:isolate}.skeleton-canvas{filter:drop-shadow(0 5px 2px #70533516);width:100%;height:100%;overflow:visible;display:block}.eyes-happy{filter:drop-shadow(0 0 3px #f5d895)}.bone-avatar.mini{width:170px;height:220px}
.art-pending{height:100%;display:flex;align-items:center;justify-content:center;flex-direction:column;gap:12px;color:#92664c;text-align:center}.art-pending>span{font-size:58px;color:#c49356}.art-pending strong{font-size:20px}.art-pending small{font-size:12px}
</style>
