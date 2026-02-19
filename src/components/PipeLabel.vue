<script setup lang="ts">
const props = defineProps<{
    x: number
    y: number
    label: string
    value: string
    unit: string
}>()
</script>

<template>
    <g :transform="`translate(${x},${y})`">
        <text x="0" y="0" font-size="11" fill="#aabfcc" font-family="sans-serif">{{ label }}</text>
        <text x="0" y="15" font-size="10" fill="#7a9aaa" font-family="monospace">{{ value }} {{ unit }}</text>
    </g>
</template>

<style></style>