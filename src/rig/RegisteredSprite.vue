<script setup lang="ts">
import {computed} from 'vue';
import {registeredRect} from './registration';
import type {Box} from './attachments';
defineOptions({inheritAttrs:false});
const props=defineProps<{src:string;box:Box;align?:'center'|'bottom';debug?:boolean}>();
const rect=computed(()=>registeredRect(props.src,props.box,props.align));
</script>
<template><image v-bind="$attrs" :href="src" :x="rect[0]" :y="rect[1]" :width="rect[2]" :height="rect[3]" preserveAspectRatio="none"/><rect v-if="debug" :x="rect[0]" :y="rect[1]" :width="rect[2]" :height="rect[3]" fill="none" stroke="#16a6bb" stroke-width=".6" stroke-dasharray="3 2" pointer-events="none"/></template>
