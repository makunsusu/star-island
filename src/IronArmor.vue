<script setup lang="ts">
withDefaults(defineProps<{part?:string;animated?:boolean}>(),{part:'all',animated:false});
</script>
<template>
<svg class="iron-armor" :class="{'iron-active':animated}" viewBox="0 0 320 440" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Q版钢铁侠机甲">
<defs><linearGradient id="ironRed" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#f17b68"/><stop offset=".35" stop-color="#c43f38"/><stop offset="1" stop-color="#862b31"/></linearGradient><linearGradient id="ironGold" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#fff1b8"/><stop offset=".42" stop-color="#edc36d"/><stop offset="1" stop-color="#bd803b"/></linearGradient><linearGradient id="ironMetal" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#63757c"/><stop offset="1" stop-color="#263f4b"/></linearGradient><radialGradient id="ironLight"><stop stop-color="#fff"/><stop offset=".5" stop-color="#c2f4ff"/><stop offset="1" stop-color="#62b6d7"/></radialGradient></defs>
<g v-if="part==='all'||part==='body'" class="iron-body">
 <path d="M109 314 106 365 90 388Q91 410 127 410L146 403 151 332Z" fill="url(#ironRed)" stroke="#92393a" stroke-width="2"/><path d="m112 326-3 38 24 8 7-43" fill="url(#ironGold)"/><path d="M94 385q20-8 44 8l-3 11q-34 10-45-6z" fill="url(#ironRed)"/>
 <path d="m171 332 5 68q30 18 60 4l-2-19-17-23-4-45z" fill="url(#ironRed)" stroke="#92393a" stroke-width="2"/><path d="m183 330 5 39 25-6-5-41" fill="url(#ironGold)"/><path d="m180 391 36-9 20 11-3 11q-30 8-53-3z" fill="url(#ironRed)"/>
 <path d="M98 222q59-29 121 0l-7 84-23 32h-61l-24-31z" fill="url(#ironRed)" stroke="#8c3432" stroke-width="2"/><path d="m104 232 45 21-8 35-31-9zM210 233l-44 19 9 36 32-11z" fill="url(#ironGold)"/><path d="m126 292 28 10 34-10-5 24-28 9-22-11" fill="url(#ironMetal)"/><path d="m130 322 26 10 27-10 8 16-35 11-34-12z" fill="url(#ironGold)"/><circle cx="158" cy="263" r="25" fill="#833f37"/><circle cx="158" cy="261" r="18" fill="url(#ironLight)" stroke="#e5f8fc" stroke-width="3" class="reactor"/><path d="M113 225q46-19 91 0" fill="none" stroke="#f8a188" stroke-width="5" stroke-linecap="round"/>
</g>
<g v-if="part==='all'||part==='back'" class="iron-left-arm">
 <path d="M101 225q-19-9-29 11l-8 42 25 6 23-33z" fill="url(#ironRed)" stroke="#943b38" stroke-width="2"/><path d="m67 267-11 45 23 9 14-46" fill="url(#ironGold)"/><path d="M59 302q15-6 28 9l-5 27q-4 18-27 9l-5-16z" fill="url(#ironRed)"/><path d="m56 330 21 5" stroke="#f5947b" stroke-width="3"/>
</g>
<g v-if="part==='all'||part==='hand'" class="iron-right-arm">
 <path d="M214 224q23-6 31 18l9 26-26 13-19-25z" fill="url(#ironRed)" stroke="#943b38" stroke-width="2"/><path d="m230 271 25-10 13 35-24 12z" fill="url(#ironGold)"/><path d="M246 290q22-8 34 10l1 28q-8 20-28 6l-11-19z" fill="url(#ironRed)"/><ellipse cx="266" cy="313" rx="10" ry="13" fill="url(#ironLight)" stroke="#ffe9bb" stroke-width="3" class="palm-light"/><path d="m253 298-3 11m10-17-1 10m9-9 1 10" stroke="#f0b08c" stroke-width="2"/>
</g>
<g v-if="part==='all'||part==='hat'" class="iron-head">
 <path d="M77 99q2-63 82-65 80 2 84 66l-5 67q-11 61-80 67-68-5-79-68z" fill="url(#ironRed)" stroke="#8c3334" stroke-width="3"/>
 <path d="M85 95q3-47 52-53" fill="none" stroke="#ffb1a0" stroke-width="6" stroke-linecap="round"/>
 <path d="m76 123-13 7 4 43 15 9m160-59 11 7-3 43-13 9" fill="url(#ironGold)" stroke="#a9713d" stroke-width="2"/>
 <g class="iron-faceplate"><path d="m103 87 28 3 6-28h43l7 28 28-3 8 56-14 21-7 34-42 23-43-23-7-34-14-21z" fill="url(#ironGold)" stroke="#a56d3b" stroke-width="2"/>
 <path d="m107 131 35 9 4 12-33-6zM177 140l35-9-5 15-34 6z" fill="#2e5966"/><path d="m111 134 29 8 1 6-26-5zM180 142l28-8-4 9-27 5z" fill="#e2fcff"/>
 <path d="m139 179 20-5 21 5-4 8h-34z" fill="#9c673b"/><path d="m129 198 30 10 31-11" fill="none" stroke="#fff0bd" stroke-width="3"/>
 </g>
</g>
<g v-if="animated" class="iron-thrusters"><path d="m109 409 10 27 11-27" fill="#a4e8ff"/><path d="m193 409 10 27 11-27" fill="#a4e8ff"/></g>
</svg>
</template>
<style scoped>
.iron-armor{width:100%;height:100%;overflow:visible}.iron-right-arm{transform-origin:216px 235px}.iron-head{transform-origin:159px 220px}.iron-faceplate{transform-origin:160px 80px}.iron-active .iron-faceplate{animation:close-mask 1.5s ease-in-out}.iron-active .iron-right-arm{animation:charge-palm 1.9s ease-in-out}.iron-active .palm-light,.iron-active .reactor{animation:charge-light 1.8s ease-in-out}.iron-active .iron-thrusters{animation:thruster 1.9s ease-in-out}@keyframes close-mask{0%{transform:translateY(-40px) scaleY(.3);opacity:0}30%,100%{transform:none;opacity:1}}@keyframes charge-palm{35%,75%{transform:rotate(-30deg) translateY(-12px)}}@keyframes charge-light{40%,75%{filter:drop-shadow(0 0 9px #7de6ff)}}@keyframes thruster{0%,100%{opacity:0}30%,70%{opacity:1}}
</style>
