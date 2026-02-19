<template>
  <div class="app">

    <header class="app-header">
      <h1>Pressurised Tank Simulator</h1>
      <span class="subtitle">20 m³ · Torispherical heads · Steam-jacketed (3 bar) — MVP</span>
    </header>

    <div class="sim-toolbar">
      <div class="sim-toolbar-inner">
        <span class="im-toolbar-label">SIMULATION SPEED</span>
        <input type="range" min="1" max="100" step="1"
          :value="store.simSpeed" 
          @input="store.simSpeed = +$event.target.value"
          class="sim-speed-slider" 
        />
        <span class="sim-speed-value">{{ store.simSpeed }}</span>
        <span class="sim-toolbar-hint">- meta control, not part of the process</span>
      </div>
    </div>

    <main class="app-body">

      <!-- Left: Tank drawing -->
      <section class="tank-section">
        <TankSVG />
      </section>

      <!-- Right: Gauge + Controls -->
      <aside class="right-panel">
        <div class="gauge-wrap">
          <PressureGauge />
        </div>
        <Controls />
      </aside>

    </main>

  </div>
</template>

<script setup>
import { onMounted, onUnmounted } from 'vue'
import { useTankStore } from './stores/tankStore'
import TankSVG from './components/TankSVG.vue'
import PressureGauge from './components/PressureGauge.vue'
import Controls from './components/Controls.vue'

const store = useTankStore()
onMounted(() => store.start())
onUnmounted(() => store.stop())
</script>

<style>
/* ── Global ────────────────────────────────────────────── */
html, body, #app {
  height: 100%;
  margin: 0;
}

.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: #111622;
  color: #c8d8ec;
  font-family: 'Courier New', monospace;
}

.app-header {
  padding: 16px 24px 10px;
  border-bottom: 1px solid #1e2a3a;
  display: flex;
  align-items: baseline;
  gap: 18px;
}

.app-header h1 {
  font-size: 20px;
  font-weight: 700;
  letter-spacing: 2px;
  color: #d0e4f8;
}

.subtitle {
  font-size: 11px;
  color: #4a6a8a;
  letter-spacing: 1px;
}

.app-body {
  flex: 1;
  display: flex;
  gap: 16px;
  padding: 16px 20px;
  align-items: flex-start;
  overflow: auto;
}

/* ── Simulator toolbar ───────────────────────────────── */
.sim-toolbar {
  padding: 6px 24px;
  background: #0a0f1c;
  border-bottom: 1px solid #1e2a3a;
  display: flex;
  align-items: center;
}

.sim-toolbar-inner {
  display: flex;
  align-items: center;
  gap: 12px;
}

.sim-toolbar-label {
  font-size: 10px;
  letter-spacing: 2px;
  color: #3a6a8a;
  white-space: nowrap;
}

.sim-speed-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: #4af;
  border: 2px solid #fff;
  cursor: pointer;
}

.sim-speed-value {
  font-size: 10px;
  color: #2a3a4a;
  font-style: italic;
}

/* ── Tank section ────────────────────────────────────── */
.tank-section {
  flex: 0 0 350px;
  max-width: 350px;
}

/* ── Right panel ─────────────────────────────────────── */
.right-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-width: 280px;
  max-width: 380px;
}

.gauge-wrap {
  background: #0d1422;
  border-radius: 12px;
  border: 1px solid #2a3550;
  padding: 6px 12px 4px;
}

/* ── Responsive ──────────────────────────────────────── */
@media (max-width: 700px) {
  .app-body {
    flex-direction: column;
    align-items: center;
  }

  .tank-section {
    flex: none;
    width: 100%;
    max-width: 360px;
  }

  .right-panel {
    width: 100%;
    max-width: 360px;
  }
}
</style>
