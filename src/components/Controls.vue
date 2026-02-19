<template>
  <div class="controls">

    <!-- ── Header ──────────────────────────────────────── -->
    <div class="panel-title">CONTROL PANEL</div>

    <!-- ── Sim controls ───────────────────────────────── -->
    <div class="sim-controls">
      <button @click="store.running ? store.stop() : store.start()"
        :class="['btn', store.running ? 'btn-stop' : 'btn-start']">
        {{ store.running ? '⏸ PAUSE' : '▶ RUN' }}
      </button>
      <button @click="store.reset()" class="btn btn-reset">↺ RESET</button>
    </div>

    <div class="divider"/>

    <!-- ── INLET FLOW ──────────────────────────────────── -->
    <div class="control-group">
      <div class="ctrl-label">
        <span>🔵 Inlet flow</span>
        <span class="ctrl-value">{{ store.inletFlow.toFixed(2) }} m³/h</span>
      </div>
      <input type="range" min="0" max="10" step="0.1"
        :value="store.inletFlow"
        @input="store.inletFlow = +$event.target.value"
        class="slider slider-blue"
      />
      <div class="range-labels"><span>0</span><span>5</span><span>10 m³/h</span></div>
    </div>

    <!-- ── OUTLET FLOW ─────────────────────────────────── -->
    <div class="control-group">
      <div class="ctrl-label">
        <span>🟡 Outlet flow</span>
        <span class="ctrl-value">{{ store.outletFlow.toFixed(2) }} m³/h</span>
      </div>
      <input type="range" min="0" max="10" step="0.1"
        :value="store.outletFlow"
        @input="store.outletFlow = +$event.target.value"
        class="slider slider-amber"
      />
      <div class="range-labels"><span>0</span><span>5</span><span>10 m³/h</span></div>
    </div>

    <div class="divider"/>

    <!-- ── VALVE TOGGLES ───────────────────────────────── -->
    <div class="control-group">
      <div class="ctrl-label"><span>⚙️ Valves</span></div>
      <div class="valve-row">
        <button
          @click="store.drainOpen = !store.drainOpen"
          :class="['valve-btn', store.drainOpen ? 'valve-open' : 'valve-closed']"
        >
          <span class="vbtn-icon">{{ store.drainOpen ? '🔴' : '🟢' }}</span>
          Drain<br/><small>{{ store.drainOpen ? 'OPEN 8 m³/h' : 'CLOSED' }}</small>
        </button>
        <button
          @click="store.gasValveOpen = !store.gasValveOpen"
          :class="['valve-btn', store.gasValveOpen ? 'valve-open' : 'valve-closed']"
        >
          <span class="vbtn-icon">{{ store.gasValveOpen ? '🔴' : '🟢' }}</span>
          Gas vent<br/><small>{{ store.gasValveOpen ? 'OPEN –6 bar/min' : 'CLOSED' }}</small>
        </button>
      </div>
    </div>

    <div class="divider"/>

    <!-- ── TEMPERATURE (manual, stub for energy balance) ─ -->
    <div class="control-group">
      <div class="ctrl-label">
        <span>🌡 Temperature <small style="opacity:0.5">(manual)</small></span>
        <span class="ctrl-value" :style="{ color: tempColor }">{{ store.temperature.toFixed(1) }} °C</span>
      </div>
      <input type="range" min="0" max="150" step="0.5"
        :value="store.temperature"
        @input="store.temperature = +$event.target.value"
        class="slider slider-temp"
        :style="tempSliderStyle"
      />
      <div class="range-labels"><span>0°C</span><span>75°C</span><span>150°C</span></div>
      <div class="stub-notice">⚠ Energy balance not yet active — set manually.</div>
    </div>

    <div class="divider"/>

    <!-- ── PROCESS SUMMARY ─────────────────────────────── -->
    <div class="summary">
      <div class="summary-title">PROCESS VALUES</div>
      <div class="kpi-grid">
        <div class="kpi">
          <div class="kpi-label">LEVEL</div>
          <div class="kpi-val kpi-level">{{ store.level.toFixed(1) }}<span class="kpi-unit">%</span></div>
        </div>
        <div class="kpi">
          <div class="kpi-label">PRESSURE</div>
          <div class="kpi-val kpi-pressure">{{ store.pressure.toFixed(2) }}<span class="kpi-unit">bar</span></div>
        </div>
        <div class="kpi">
          <div class="kpi-label">TEMPERATURE</div>
          <div class="kpi-val" :style="{ color: tempColor }">{{ store.temperature.toFixed(1) }}<span class="kpi-unit">°C</span></div>
        </div>
        <div class="kpi">
          <div class="kpi-label">LIQUID VOL.</div>
          <div class="kpi-val kpi-vol">{{ store.liquidVolume.toFixed(2) }}<span class="kpi-unit">m³</span></div>
        </div>
        <div class="kpi">
          <div class="kpi-label">NET FLOW</div>
          <div class="kpi-val" :style="{ color: store.netFlow >= 0 ? '#44ddaa' : '#ff6655' }">
            {{ store.netFlow >= 0 ? '+' : '' }}{{ store.netFlow.toFixed(2) }}<span class="kpi-unit">m³/h</span>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useTankStore } from '../stores/tankStore'

const store = useTankStore()

const TEMP_STOPS = [
  [0,   '#1a50d0'],
  [25,  '#00cccc'],
  [50,  '#10aa55'],
  [75,  '#ddaa00'],
  [100, '#dd3322'],
  [150, '#aa0000'],
]

function lerpColor(t) {
  let i = 0
  while (i < TEMP_STOPS.length - 1 && TEMP_STOPS[i + 1][0] <= t) i++
  if (i >= TEMP_STOPS.length - 1) return TEMP_STOPS[TEMP_STOPS.length - 1][1]
  const [t0, c0] = TEMP_STOPS[i]
  const [t1, c1] = TEMP_STOPS[i + 1]
  const f = (t - t0) / (t1 - t0)
  // Simple hex lerp
  const p  = (h) => parseInt(h, 16)
  const lp = (a, b) => Math.round(p(a) + f * (p(b) - p(a)))
  const hex = (v) => v.toString(16).padStart(2, '0')
  const r0 = c0.slice(1, 3), g0 = c0.slice(3, 5), b0 = c0.slice(5, 7)
  const r1 = c1.slice(1, 3), g1 = c1.slice(3, 5), b1 = c1.slice(5, 7)
  return `#${hex(lp(r0, r1))}${hex(lp(g0, g1))}${hex(lp(b0, b1))}`
}

const tempColor = computed(() => lerpColor(store.temperature))

const tempSliderStyle = computed(() => {
  const c = lerpColor(store.temperature)
  return { '--thumb-color': c }
})
</script>

<style scoped>
.controls {
  display: flex;
  flex-direction: column;
  gap: 0;
  padding: 16px;
  background: #0e1420;
  border-radius: 12px;
  border: 1px solid #2a3550;
  min-width: 280px;
}

.panel-title {
  text-align: center;
  font-size: 13px;
  letter-spacing: 3px;
  color: #4a6a8a;
  margin-bottom: 12px;
}

.sim-controls {
  display: flex;
  gap: 8px;
}

.btn {
  flex: 1;
  padding: 8px;
  border: none;
  border-radius: 6px;
  font-family: monospace;
  font-size: 13px;
  font-weight: bold;
  cursor: pointer;
  letter-spacing: 1px;
}

.btn-start  { background: #1a6a2a; color: #88ffaa; }
.btn-start:hover { background: #22882a; }
.btn-stop   { background: #6a1a1a; color: #ffaaaa; }
.btn-stop:hover  { background: #882222; }
.btn-reset  { background: #2a3550; color: #8aaac0; }
.btn-reset:hover { background: #3a4560; }

.divider {
  height: 1px;
  background: #1e2a3a;
  margin: 10px 0;
}

.control-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-bottom: 2px;
}

.ctrl-label {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #8aaac0;
}

.ctrl-value {
  font-family: monospace;
  color: #c0d8f0;
  font-weight: bold;
}

.slider {
  -webkit-appearance: none;
  width: 100%;
  height: 6px;
  border-radius: 3px;
  outline: none;
  cursor: pointer;
}

.slider-blue  { background: linear-gradient(to right, #1a3a80, #44aaff); }
.slider-amber { background: linear-gradient(to right, #3a2000, #ffaa00); }
.slider-temp  { background: linear-gradient(to right, #1a50d0, #00cccc, #10aa55, #ddaa00, #dd3322); }

.slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: var(--thumb-color, #88aacc);
  border: 2px solid #fff;
  cursor: pointer;
}

.range-labels {
  display: flex;
  justify-content: space-between;
  font-size: 9px;
  color: #4a5a70;
  font-family: monospace;
}

.valve-row {
  display: flex;
  gap: 8px;
}

.valve-btn {
  flex: 1;
  padding: 10px 6px;
  border-radius: 8px;
  border: 1px solid transparent;
  font-family: monospace;
  font-size: 11px;
  cursor: pointer;
  text-align: center;
  line-height: 1.5;
  transition: all 0.15s;
}

.valve-closed {
  background: #0e2018;
  border-color: #1a5028;
  color: #5ada80;
}

.valve-open {
  background: #220a0a;
  border-color: #aa2222;
  color: #ff8888;
}

.vbtn-icon {
  display: block;
  font-size: 18px;
  margin-bottom: 2px;
}

.stub-notice {
  font-size: 10px;
  color: #5a6a7a;
  font-style: italic;
  margin-top: 2px;
}

/* ── Summary KPI ────────────────────────────── */
.summary-title {
  font-size: 10px;
  letter-spacing: 2px;
  color: #3a5070;
  margin-bottom: 8px;
}

.kpi-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 6px;
}

.kpi {
  background: #0a1020;
  border: 1px solid #1e2e42;
  border-radius: 6px;
  padding: 6px 8px;
}

.kpi-label {
  font-size: 9px;
  color: #3a5070;
  letter-spacing: 1px;
  margin-bottom: 2px;
}

.kpi-val {
  font-size: 16px;
  font-weight: bold;
  font-family: monospace;
  color: #c0d8f0;
}

.kpi-level    { color: #44ddaa; }
.kpi-pressure { color: #ff8844; }
.kpi-vol      { color: #8899cc; }

.kpi-unit {
  font-size: 10px;
  color: #4a6070;
  margin-left: 2px;
}
</style>
