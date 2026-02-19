<script setup lang="ts">
const props = defineProps<{
    x: number
    y: number
    valveOpen: boolean
}>()
</script>

<template>
    <g :transform="`translate(${x},${y})`">
      <rect x="0" y="0" width="52" height="16" rx="3"
        :fill="valveOpen ? 'rgba(255,60,60,0.8)' : 'rgba(40,140,60,0.8)'"/>
      <text x="26" y="12" text-anchor="middle" font-size="9" fill="white" font-family="monospace">
        {{ valveOpen ? 'OPEN' : 'CLOSED' }}
      </text>
    </g> 
</template>

<style></style>