import { defineStore } from 'pinia'

// ============================================================
// PHYSICS RULES — Edit simulation behaviour here
// ============================================================
const TANK_VOLUME_M3      = 20      // m³  — total tank volume
const DRAIN_FLOW_M3H      = 8       // m³/h — drain flow rate when valve is open
const GAS_RELEASE_BAR_MIN = 6       // bar/min — pressure drop rate when gas valve open
const PRESSURE_BUILD_COEFF = 0.3    // bar/min per m³/h of net inflow (only when level > 75%)
const PRESSURE_DECAY_COEFF = 0.05   // bar/min decay when liquid drains and level < 25%
const MIN_PRESSURE        = 0.5     // bar — minimum (atmospheric-ish, absolute)
const MAX_PRESSURE        = 50      // bar — safety ceiling
const DT_S                = 0.1     // seconds — simulation timestep

// ============================================================
// ENERGY BALANCE STUB
// Future: jacketed vessel heated by saturated steam at 3 bar
// ============================================================
/*
function energyBalance(state, dt) {
  const T_STEAM_C   = 133.5   // °C  — sat. steam at 3 bar
  const U           = 500     // W/(m²·K) — overall HTC wall + condensate
  const A_JACKET    = 25      // m²  — jacket heat transfer area
  const RHO_L       = 1000    // kg/m³
  const CP_L        = 4182    // J/(kg·K)

  const m_liquid = (state.level / 100) * TANK_VOLUME_M3 * RHO_L
  if (m_liquid < 1) return

  const Q_jacket = U * A_JACKET * (T_STEAM_C - state.temperature)  // W
  const dT = (Q_jacket * dt) / (m_liquid * CP_L)                    // °C
  state.temperature = Math.min(T_STEAM_C, state.temperature + dT)
}
*/

export const useTankStore = defineStore('tank', {
  state: () => ({
    // ── Process variables ──────────────────────────────────
    level:       50,    // % (0–100)
    temperature: 20,    // °C (0–150, manual for now)
    pressure:    1.0,   // bar (0–50)

    // ── Actuators ──────────────────────────────────────────
    inletFlow:    0,    // m³/h (0–10), continuous slider
    outletFlow:   0,    // m³/h (0–10), continuous slider
    drainOpen:    false,
    gasValveOpen: false,

    // ── Sim internal ──────────────────────────────────────
    running:      false,
    _timer:       null,
  }),

  getters: {
    liquidVolume: (s) => (s.level / 100) * TANK_VOLUME_M3,
    netFlow:      (s) => s.inletFlow - s.outletFlow - (s.drainOpen ? DRAIN_FLOW_M3H : 0),
  },

  actions: {
    start() {
      if (this._timer) return
      this.running = true
      this._timer = setInterval(() => this._tick(), DT_S * 1000)
    },

    stop() {
      clearInterval(this._timer)
      this._timer = null
      this.running = false
    },

    reset() {
      this.stop()
      this.level       = 50
      this.temperature = 20
      this.pressure    = 1.0
      this.inletFlow   = 0
      this.outletFlow  = 0
      this.drainOpen   = false
      this.gasValveOpen = false
    },

    // ── Main simulation tick ─────────────────────────────
    _tick() {
      const dt = DT_S

      // --- LEVEL -------------------------------------------
      const drainQ  = this.drainOpen ? DRAIN_FLOW_M3H : 0
      const netQ    = this.inletFlow - this.outletFlow - drainQ   // m³/h
      const dVol    = netQ * (dt / 3600)                          // m³
      const dLevel  = (dVol / TANK_VOLUME_M3) * 100              // %
      this.level    = Math.max(0, Math.min(100, this.level + dLevel))

      // --- PRESSURE ----------------------------------------
      // Gas valve releases pressure
      if (this.gasValveOpen) {
        const dP   = -GAS_RELEASE_BAR_MIN * (dt / 60)
        this.pressure = Math.max(MIN_PRESSURE, this.pressure + dP)
      }

      // Net inflow into a high-fill tank builds pressure
      if (!this.gasValveOpen && netQ > 0 && this.level > 75) {
        const dP   = PRESSURE_BUILD_COEFF * netQ * (dt / 60)
        this.pressure = Math.min(MAX_PRESSURE, this.pressure + dP)
      }

      // Draining a near-empty tank slowly drops headspace pressure
      if (!this.gasValveOpen && netQ < 0 && this.level < 25) {
        const dP   = PRESSURE_DECAY_COEFF * Math.abs(netQ) * (dt / 60)
        this.pressure = Math.max(MIN_PRESSURE, this.pressure - dP)
      }

      // --- TEMPERATURE (stub — replace with energyBalance) --
      // energyBalance(this, dt)
    },
  },
})
