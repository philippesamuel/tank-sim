<script setup lang="ts">
const { rotate = 0 } = defineProps<{
    x: number
    y: number
    valveOpen: boolean
    rotate?: number
}>()
</script>

<template>
    <g :transform="`rotate(${rotate}, 0, 8) translate(${x},${y})`">
        <polygon points="-10,-8 10,-8 0,0" :fill="valveOpen ? '#ff5555' : '#44bb66'" stroke="#ddd"
            stroke-width="1" />
        <polygon points="-10,8 10,8 0,0" :fill="valveOpen ? '#ff5555' : '#44bb66'" stroke="#ddd"
            stroke-width="1" />
        <line x1="0" y1="-8" x2="0" y2="8" stroke="#ddd" stroke-width="1.5" />
    </g>
</template>