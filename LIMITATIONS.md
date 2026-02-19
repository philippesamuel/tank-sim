# Known Limitations & Roadmap

## Known Limitations

### Background Throttling
The simulation loop uses `setInterval` on the main browser thread. Browsers throttle timers in background tabs (to ~1 Hz), and mobile OSes may suspend the process entirely when the app is off-screen. The simulation effectively pauses when the tab is not active.

### Simplified Physics
Current pressure and level rules are heuristic (linear coefficients). They do not reflect real thermodynamic or fluid dynamic behaviour. Temperature is set manually.

### No Energy Balance
The steam jacket is visual only. Heat transfer from saturated steam (3 bar / 133.5 °C) to the liquid is modelled in a commented-out stub but not yet active.

---

## Roadmap

### Simulation Engine
- [ ] **Web Worker** — move the sim loop off the main thread; Workers are not throttled in the background
- [ ] **Catch-up on visibility restore** — on `visibilitychange`, calculate elapsed wall-clock time and integrate forward by the missed delta
- [ ] **Proper numerical integration** — replace the Euler step with a more accurate scheme:
  - Trapezoidal rule (implicit, 2nd order, good for stiff systems)
  - Implicit Euler (robust for stiff DAE systems)
  - Runge-Kutta RK4 (explicit, 4th order, good accuracy/cost trade-off for non-stiff)
- [ ] **Energy balance** — activate the jacket heat transfer stub; model `Q = U·A·ΔT`, condensate return, liquid Cp and ρ as f(T)
- [ ] **Real fluid properties** — density and heat capacity as functions of temperature

### UX
- [ ] **Progressive Web App (PWA)** — `manifest.json` + Service Worker for offline support and home screen install
- [ ] **State persistence** — `pinia-plugin-persistedstate` to survive page reloads
- [ ] **Alarms & interlocks** — high pressure auto-vent, low level cutoff, over-temperature warning
