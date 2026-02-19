<template>
  <svg viewBox="0 0 240 155" xmlns="http://www.w3.org/2000/svg" style="width:100%">

    <!-- Gauge bezel -->
    <circle cx="120" cy="105" r="100" fill="#1e2535" stroke="#3a4a60" stroke-width="3"/>
    <circle cx="120" cy="105" r="95"  fill="#161c2a" stroke="none"/>

    <!-- Coloured arc background (green → yellow → red) -->
    <path :d="arcSegment(  0, 15)"  fill="none" stroke="#2a8a3a" stroke-width="12" opacity="0.7"/>
    <path :d="arcSegment( 15, 35)"  fill="none" stroke="#88aa22" stroke-width="12" opacity="0.7"/>
    <path :d="arcSegment( 35, 45)"  fill="none" stroke="#cc8800" stroke-width="12" opacity="0.7"/>
    <path :d="arcSegment( 45, 50)"  fill="none" stroke="#cc2222" stroke-width="12" opacity="0.7"/>

    <!-- Tick marks -->
    <g v-for="p in majorTicks" :key="'m'+p">
      <line
        :x1="tickX(p, 76)" :y1="tickY(p, 76)"
        :x2="tickX(p, 88)" :y2="tickY(p, 88)"
        stroke="#c0d0e0" stroke-width="2"
      />
      <text
        :x="tickX(p, 62)" :y="tickY(p, 62) + 4"
        text-anchor="middle" font-size="11" fill="#8a9ab0" font-family="monospace"
      >{{ p }}</text>
    </g>
    <g v-for="p in minorTicks" :key="'mi'+p">
      <line
        :x1="tickX(p, 80)" :y1="tickY(p, 80)"
        :x2="tickX(p, 88)" :y2="tickY(p, 88)"
        stroke="#506070" stroke-width="1.2"
      />
    </g>

    <!-- Needle shadow -->
    <line
      :x1="cx" :y1="cy"
      :x2="needleX + 2" :y2="needleY + 2"
      stroke="rgba(0,0,0,0.4)" stroke-width="4" stroke-linecap="round"
    />
    <!-- Needle -->
    <line
      :x1="cx" :y1="cy"
      :x2="needleX" :y2="needleY"
      stroke="#ff4444" stroke-width="3.5" stroke-linecap="round"
    />
    <!-- Needle pivot -->
    <circle :cx="cx" :cy="cy" r="8" fill="#2a3545" stroke="#6080a0" stroke-width="2"/>
    <circle :cx="cx" :cy="cy" r="3" fill="#ff4444"/>

    <!-- Digital readout -->
    <rect x="90" y="120" width="60" height="26" rx="4" fill="#0a0f1a" stroke="#2a3a50" stroke-width="1"/>
    <text x="120" y="138" text-anchor="middle" font-size="16" font-weight="bold"
      fill="#ff8844" font-family="monospace">{{ store.pressure.toFixed(1) }}</text>

    <!-- Labels -->
    <text x="120" y="152" text-anchor="middle" font-size="10" fill="#6080a0" font-family="sans-serif">bar</text>
    <text x="120" y="20"  text-anchor="middle" font-size="12" fill="#8090a8" font-family="sans-serif" letter-spacing="2">PRESSURE</text>
    <text x="34"  cy="105" text-anchor="middle" font-size="9" fill="#506070" font-family="monospace">0</text>
    <text x="206" cy="105" text-anchor="middle" font-size="9" fill="#506070" font-family="monospace">50</text>
  </svg>
</template>

<script setup>
import { computed } from 'vue'
import { useTankStore } from '../stores/tankStore'

const store = useTankStore()

// Gauge geometry
const cx = 120
const cy = 105
const R  = 88   // arc radius
const NEEDLE_R = 72

// Gauge spans 240° (from 210° CW to 330° CW from East, i.e. lower-left to lower-right via top)
// 0 bar → 210°,  50 bar → 210° + 240° = 450° = 90° ... wait let me redo this.
// Standard: 0 bar = lower-left, 50 bar = lower-right, sweep upward = 240°
// Using SVG CW convention (y-down):
//   lower-left  = 135° CW from East
//   lower-right = 45°  CW from East
//   Sweeping CW: 135° → 180° → 270°(up) → 360° → 45°  = 270° total
// angle(P) = 135 + (P/50)*270  (degrees, SVG CW from East)

function svgAngle(bar) {
  return 135 + (bar / 50) * 270  // degrees
}

function toRad(deg) { return deg * Math.PI / 180 }

function ptOnArc(bar, r) {
  const a = svgAngle(bar)
  // SVG CW: x = cx + r*cos(a), y = cy + r*sin(a)
  return {
    x: cx + r * Math.cos(toRad(a)),
    y: cy + r * Math.sin(toRad(a)),
  }
}

function tickX(bar, r) { return ptOnArc(bar, r).x }
function tickY(bar, r) { return ptOnArc(bar, r).y }

// Arc segment path for colour bands (r=82, small offset from R)
function arcSegment(p0, p1) {
  const r = 82
  const a0 = svgAngle(p0)
  const a1 = svgAngle(p1)
  const s  = { x: cx + r * Math.cos(toRad(a0)), y: cy + r * Math.sin(toRad(a0)) }
  const e  = { x: cx + r * Math.cos(toRad(a1)), y: cy + r * Math.sin(toRad(a1)) }
  // CW arc (sweep=1), large-arc if > 180°
  const large = (a1 - a0 > 180) ? 1 : 0
  return `M ${s.x},${s.y} A ${r},${r} 0 ${large},1 ${e.x},${e.y}`
}

const majorTicks = [0, 10, 20, 30, 40, 50]
const minorTicks = [5, 15, 25, 35, 45]

const needleX = computed(() => ptOnArc(store.pressure, NEEDLE_R).x)
const needleY = computed(() => ptOnArc(store.pressure, NEEDLE_R).y)
</script>
