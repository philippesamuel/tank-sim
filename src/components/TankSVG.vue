<template>
  <svg
    viewBox="0 0 340 590"
    xmlns="http://www.w3.org/2000/svg"
    style="width: 100%; height: 100%; overflow: visible;"
  >
    <defs>
      <!-- Tank interior clip mask -->
      <clipPath id="tankInteriorClip">
        <path :d="tankPath" />
      </clipPath>

      <!-- Jacket steam texture -->
      <linearGradient id="jacketGrad" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%"   stop-color="#5588aa" stop-opacity="0.55"/>
        <stop offset="40%"  stop-color="#99ccdd" stop-opacity="0.3"/>
        <stop offset="60%"  stop-color="#99ccdd" stop-opacity="0.3"/>
        <stop offset="100%" stop-color="#5588aa" stop-opacity="0.55"/>
      </linearGradient>

      <!-- Liquid glow filter -->
      <filter id="liquidGlow">
        <feGaussianBlur stdDeviation="3" result="blur"/>
        <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
      </filter>
    </defs>

    <!-- ═══════════════════════════════════════════════════ -->
    <!--  JACKET (outer shell — steam-heated)               -->
    <!-- ═══════════════════════════════════════════════════ -->
    <path :d="jacketPath" fill="url(#jacketGrad)" stroke="#6699bb" stroke-width="2"/>
    <!-- Jacket label -->
    <text x="58" y="300" font-size="9" fill="#7aadcc" font-family="sans-serif"
          writing-mode="tb" text-anchor="middle" opacity="0.8">STEAM JACKET</text>

    <!-- ═══════════════════════════════════════════════════ -->
    <!--  LIQUID FILL (clipped to tank interior)            -->
    <!-- ═══════════════════════════════════════════════════ -->
    <rect
      x="0" :y="liquidTopY" width="340" height="500"
      :fill="liquidColor"
      clip-path="url(#tankInteriorClip)"
      opacity="0.88"
    />

    <!-- Liquid surface shimmer line -->
    <line
      v-if="store.level > 1 && store.level < 99"
      :x1="surfaceX1" :y1="liquidTopY"
      :x2="surfaceX2" :y2="liquidTopY"
      stroke="rgba(255,255,255,0.5)" stroke-width="1.5"
    />

    <!-- ═══════════════════════════════════════════════════ -->
    <!--  TANK WALLS                                        -->
    <!-- ═══════════════════════════════════════════════════ -->
    <path :d="tankPath" fill="none" stroke="#b0c8e0" stroke-width="3"/>

    <!-- Centre-line (dashed, decorative) -->
    <line x1="170" y1="112" x2="170" y2="462"
      stroke="rgba(255,255,255,0.12)" stroke-width="1" stroke-dasharray="6,5"/>

    <!-- ═══════════════════════════════════════════════════ -->
    <!--  NOZZLES & PIPES                                   -->
    <!-- ═══════════════════════════════════════════════════ -->

    <!-- INLET — top-left, L-shaped -->
    <line x1="38" y1="102" x2="83" y2="102" stroke="#9ab" stroke-width="10" stroke-linecap="round"></line>
    <line x1="83" y1="102" x2="83" y2="123" stroke="#9ab" stroke-width="10" stroke-linecap="butt"></line>
    <polygon points="76,122 83,144 90,122" fill="#9ab"></polygon>

    <!-- OUTLET — right side, bottom -->
     <g :transform="`translate(170,510)`">
      <line x1="0" y1="0" x2="146" y2="0" stroke="#9ab" stroke-width="10" stroke-linecap="round"/>
      <polygon points="146,-7 146,7 165,0" fill="#9ab"/>
     </g>
    <!-- DRAIN — bottom centre -->
    <g :transform="`translate(170,479)`">
      <line x1="0" y1="0" x2="0" y2="82" stroke="#9ab" stroke-width="10" stroke-linecap="butt"/>
      <polygon points="-7,81 7,81 0,98" fill="#9ab"/>
     </g>
    <!-- GAS RELEASE — top right -->
    <line x1="230" y1="120" x2="230" y2="34" stroke="#ccaa66" stroke-width="8" stroke-linecap="butt"/>
    <polygon points="223,34 237,34 230,16" fill="#ccaa66"/>

    <!-- ═══════════════════════════════════════════════════ -->
    <!--  PIPE LABELS                                        -->
    <!-- ═══════════════════════════════════════════════════ -->
    <PipeLabel 
      :x="14" :y="70" :label="'INLET'" :unit="'m³/h'" 
      :value="store.inletFlow.toFixed(1)" 
    />
    <PipeLabel 
      :x="290" :y="480" :label="'OUTLET'" :unit="'m³/h'" 
      :value="store.outletFlow.toFixed(1)" 
    />

    <text x="190" y="570" font-size="11" fill="#aabfcc" font-family="sans-serif">DRAIN</text>

    <text x="250" y="30" font-size="11" fill="#ccbb77" font-family="sans-serif">GAS VENT</text>
    
    <!-- Gas valve symbol (bow-tie) and state badge -->
    <g transform="translate(230,62)">
      <ValveSymbol :x="0" :y="8" :valve-open="store.gasValveOpen" />
      <ValveStateBadge :x="15" :y="0" :valve-open="store.gasValveOpen" />
    </g>

    <!-- Drain valve symbol (bow-tie) and state badge -->
    <g transform="translate(170,526)">
      <ValveSymbol :x="0" :y="8" :valve-open="store.drainOpen" />
      <ValveStateBadge :x="-70" :y="0" :valve-open="store.drainOpen" />
    </g>

    <!-- Outlet valve symbol (bow-tie) and state badge -->
    <g transform="translate(200,502)">
      
      <ValveSymbol :x="0" :y="8" :valve-open="store.drainOpen" :rotate="90"/>
      <ValveStateBadge :x="15" :y="0" :valve-open="store.drainOpen" />
    </g>

    <!-- ═══════════════════════════════════════════════════ -->
    <!--  NUMERICAL READOUTS (overlaid on tank)             -->
    <!-- ═══════════════════════════════════════════════════ -->

    <!-- Level % — centred in body -->
    <text
      x="170" y="295"
      text-anchor="middle"
      font-size="22"
      font-weight="bold"
      font-family="monospace"
      :fill="store.level > 2 ? 'rgba(255,255,255,0.9)' : 'rgba(180,200,220,0.5)'"
      filter="url(#liquidGlow)"
    >{{ store.level.toFixed(1) }}%</text>
    <text x="170" y="313" text-anchor="middle" font-size="10" fill="rgba(200,220,240,0.6)" font-family="sans-serif">LEVEL</text>

    <!-- Temp — small, inside liquid near bottom -->
    <text
      v-if="store.level > 15"
      x="170"
      :y="Math.max(liquidTopY + 28, 430)"
      text-anchor="middle"
      font-size="14"
      font-family="monospace"
      :fill="liquidColor"
      filter="url(#liquidGlow)"
      style="paint-order: stroke; stroke: rgba(0,0,0,0.6); stroke-width: 3px;"
    >{{ store.temperature.toFixed(1) }}°C</text>

    <!-- Level tick marks on right wall -->
    <g v-for="pct in [10,25,50,75,90]" :key="pct">
      <line
        :x1="257" :y1="TANK_BOTTOM - pct * TANK_HEIGHT / 100"
        :x2="265" :y2="TANK_BOTTOM - pct * TANK_HEIGHT / 100"
        stroke="#7090a0" stroke-width="1.5"
      />
      <text
        :x="277" :y="TANK_BOTTOM - pct * TANK_HEIGHT / 100 + 4"
        font-size="9" fill="#7090a0" font-family="monospace"
      >{{ pct }}%</text>
    </g>
  </svg>
</template>

<script setup>
import { computed } from 'vue'
import { useTankStore } from '../stores/tankStore'
import ValveStateBadge from './ValveStateBadge.vue'
import ValveSymbol from './ValveSymbol.vue'
import PipeLabel from './PipeLabel.vue'

const store = useTankStore()

// ── Tank geometry (SVG units) ────────────────────────────────
const BODY_LEFT   = 80
const BODY_RIGHT  = 260
const BODY_TOP    = 148
const BODY_BOTTOM = 435
const HEAD_RX     = -90
const HEAD_RY     = 46

const TANK_TOP    = BODY_TOP    - HEAD_RY   // 102
const TANK_BOTTOM = BODY_BOTTOM + HEAD_RY   // 481

// Exported as non-reactive constants for template use
const TANK_HEIGHT = TANK_BOTTOM - TANK_TOP   // 379

// Jacket (10 px larger each side)
const JACK_LEFT   = BODY_LEFT  - 14   // 66
const JACK_RIGHT  = BODY_RIGHT + 14   // 274
const JACK_RX     = HEAD_RX   
const JACK_RY     = HEAD_RY    + 8    // 54

// ── Paths ────────────────────────────────────────────────────
// Torispherical head approximated as ellipse.
// sweep-flag=0 (CCW in SVG) gives dome-outward shape for both heads.
const tankPath = computed(() =>
  `M ${BODY_LEFT},${BODY_TOP}` +
  ` A ${HEAD_RX},${HEAD_RY} 0 0,0 ${BODY_RIGHT},${BODY_TOP}` +
  ` L ${BODY_RIGHT},${BODY_BOTTOM}` +
  ` A ${HEAD_RX},${HEAD_RY} 0 0,0 ${BODY_LEFT},${BODY_BOTTOM}` +
  ` Z`
)

const jacketPath = computed(() =>
  `M ${JACK_LEFT},${BODY_TOP}` +
  ` L ${JACK_RIGHT},${BODY_TOP}` +
  ` L ${JACK_RIGHT},${BODY_BOTTOM}` +
  ` A ${JACK_RX},${JACK_RY} 0 0,0 ${JACK_LEFT},${BODY_BOTTOM}` +
  ` Z`
)

// ── Liquid level ─────────────────────────────────────────────
const liquidTopY = computed(() =>
  TANK_BOTTOM - (store.level / 100) * TANK_HEIGHT
)

// Surface line x-bounds (narrows near heads)
const surfaceX1 = computed(() => {
  const y = liquidTopY.value
  return xAtY(y, 'left')
})
const surfaceX2 = computed(() => {
  const y = liquidTopY.value
  return xAtY(y, 'right')
})

function xAtY(y, side) {
  const cx = (BODY_LEFT + BODY_RIGHT) / 2  // 170
  // In top head region
  if (y < BODY_TOP) {
    const dy = BODY_TOP - y
    const dx = HEAD_RX * Math.sqrt(1 - Math.pow(dy / HEAD_RY, 2))
    return side === 'left' ? cx - dx : cx + dx
  }
  // In bottom head region
  if (y > BODY_BOTTOM) {
    const dy = y - BODY_BOTTOM
    const dx = HEAD_RX * Math.sqrt(1 - Math.pow(dy / HEAD_RY, 2))
    return side === 'left' ? cx - dx : cx + dx
  }
  // Cylindrical body
  return side === 'left' ? BODY_LEFT : BODY_RIGHT
}

// ── Temperature → colour map ─────────────────────────────────
// Stops: 0°C blue → 25°C cyan → 50°C teal-green → 75°C amber → 100°C red
const COLOUR_STOPS = [
  [0,   [25,  80, 200]],
  [25,  [0,  200, 220]],
  [50,  [10, 170,  90]],
  [75,  [220, 170,  0]],
  [100, [210,  45,  30]],
]

function tempToColor(t) {
  let i = 0
  while (i < COLOUR_STOPS.length - 1 && COLOUR_STOPS[i + 1][0] <= t) i++
  if (i >= COLOUR_STOPS.length - 1) {
    const [r, g, b] = COLOUR_STOPS[COLOUR_STOPS.length - 1][1]
    return `rgb(${r},${g},${b})`
  }
  const [t0, [r0, g0, b0]] = COLOUR_STOPS[i]
  const [t1, [r1, g1, b1]] = COLOUR_STOPS[i + 1]
  const f = (t - t0) / (t1 - t0)
  return `rgb(${Math.round(r0 + f*(r1-r0))},${Math.round(g0 + f*(g1-g0))},${Math.round(b0 + f*(b1-b0))})`
}

const liquidColor = computed(() => tempToColor(store.temperature))
</script>
