<script setup lang="ts">
import {computed,useId} from 'vue';
import {baseArmParts,boneTransform} from './limbRegistration';
defineOptions({inheritAttrs:false});
const props=defineProps<{part:keyof typeof baseArmParts;debug?:boolean}>();
const id=useId(),asset=computed(()=>baseArmParts[props.part]);
const matrix=computed(()=>boneTransform(asset.value.start,asset.value.end,asset.value.length));
</script>
<template><g v-bind="$attrs"><g :transform="`matrix(${matrix.join(' ')})`"><defs><clipPath :id="id+'-silhouette'"><path :d="asset.outline"/></clipPath></defs><image :href="`/art/rig-v4/basearms/${asset.src}.webp`" x="0" y="0" :width="asset.size[0]" :height="asset.size[1]" :clip-path="`url(#${id}-silhouette)`"/></g><g v-if="debug" fill="#00cddd"><circle r="2"/><circle :cy="asset.length" r="2"/></g></g></template>
