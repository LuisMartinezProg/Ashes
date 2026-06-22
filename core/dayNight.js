// core/dayNight.js — Ashes of the Reborn | Valiant Gaming
// Ciclo día/noche visual: cielo, fog y luces interpolan entre 4 fases.
// v1: solo visual/ambiental. Gameplay (dificultad nocturna, stock tiendas) viene después.
import * as THREE from 'three';
const CYCLE_DURATION_S = 1800; // 30 min reales = 1 día completo
const UPDATE_INTERVAL_MS = 1000; // recalcular 1 vez por segundo (no por frame)

// Cada fase: [horaInicio (0-1 del ciclo), color de cielo, color de fog, color luz ambiental, color luz sol, intensidad sol, color hemisferio cielo, color hemisferio suelo]
const PHASES = [
  { t: 0.00, name: 'amanecer', sky: 0xFFB870, fog: 0xE8956A, ambient: 0xFFD8A0, sunColor: 0xFFA860, sunIntensity: 1.6, hemiSky: 0xFFB870, hemiGround: 0x6A4A30 },
  { t: 0.10, name: 'dia',      sky: 0x5A7A8A, fog: 0x3A5A40, ambient: 0xB0C8D0, sunColor: 0xFFE8A0, sunIntensity: 2.0, hemiSky: 0x88AA66, hemiGround: 0x2A3A1A },
  { t: 0.45, name: 'atardecer',sky: 0xC9683A, fog: 0xA84A30, ambient: 0xE0A070, sunColor: 0xFF6A30, sunIntensity: 1.4, hemiSky: 0xC9683A, hemiGround: 0x4A2A1A },
  { t: 0.55, name: 'noche',    sky: 0x0A1428, fog: 0x081020, ambient: 0x3A4A70, sunColor: 0x4A5A90, sunIntensity: 0.35, hemiSky: 0x1A2A4A, hemiGround: 0x0A0A14 },
  { t: 0.95, name: 'amanecer', sky: 0xFFB870, fog: 0xE8956A, ambient: 0xFFD8A0, sunColor: 0xFFA860, sunIntensity: 1.6, hemiSky: 0xFFB870, hemiGround: 0x6A4A30 },
];

export class DayNightCycle {
  constructor(scene, lights) {
    this.scene  = scene;
    this.sun    = lights.sun;
    this.ambient = lights.ambient;
    this.hemi   = lights.hemisphere;

    this._elapsed = 0; // segundos transcurridos en el ciclo actual
    this._intervalId = null;

    // Reutilizamos objetos Color para no crear basura cada tick
    this._tmpSky    = new THREE.Color();
    this._tmpFog    = new THREE.Color();
    this._tmpAmbient= new THREE.Color();
    this._tmpSun    = new THREE.Color();
    this._tmpHemiSky= new THREE.Color();
    this._tmpHemiGr = new THREE.Color();

    this.onPhaseChange = null; // callback opcional: (phaseName) => {}
    this._lastPhaseName = null;
  }

  start(startProgress = 0) {
    this._elapsed = startProgress * CYCLE_DURATION_S;
    this._tick(); // aplica estado inicial inmediatamente, sin esperar 1s
    this._intervalId = setInterval(() => this._tick(), UPDATE_INTERVAL_MS);
  }

  stop() {
    if (this._intervalId) clearInterval(this._intervalId);
    this._intervalId = null;
  }
  // Salta instantáneamente al inicio de una fase (amanecer/dia/atardecer/noche)
  jumpToPhase(phaseName) {
    const phase = PHASES.find(p => p.name === phaseName);
    if (!phase) {
      console.warn('[DayNight] Fase desconocida:', phaseName);
      return;
    }
    this._elapsed = phase.t * CYCLE_DURATION_S;
    this._tick(); // aplica el cambio visual de inmediato
  }
  // Progreso del ciclo (0 a 1)
  getProgress() {
    return (this._elapsed % CYCLE_DURATION_S) / CYCLE_DURATION_S;
  }

  _tick() {
    this._elapsed += UPDATE_INTERVAL_MS / 1000;
    const progress = this.getProgress();
    this._applyProgress(progress);
  }

  _applyProgress(progress) {
    const { from, to, localT, phaseName } = this._findPhaseSegment(progress);

    this._tmpSky.setHex(from.sky).lerp(this._tmpSky.set(to.sky), localT);
    this._tmpFog.setHex(from.fog).lerp(this._tmpFog.set(to.fog), localT);
    this._tmpAmbient.setHex(from.ambient).lerp(this._tmpAmbient.set(to.ambient), localT);
    this._tmpSun.setHex(from.sunColor).lerp(this._tmpSun.set(to.sunColor), localT);
    this._tmpHemiSky.setHex(from.hemiSky).lerp(this._tmpHemiSky.set(to.hemiSky), localT);
    this._tmpHemiGr.setHex(from.hemiGround).lerp(this._tmpHemiGr.set(to.hemiGround), localT);
    const sunIntensity = from.sunIntensity + (to.sunIntensity - from.sunIntensity) * localT;

    if (this.scene.background?.isColor) {
      this.scene.background.copy(this._tmpSky);
    }
    if (this.scene.fog) {
      this.scene.fog.color.copy(this._tmpFog);
    }
    if (this.ambient) {
      this.ambient.color.copy(this._tmpAmbient);
    }
    if (this.sun) {
      this.sun.color.copy(this._tmpSun);
      this.sun.intensity = sunIntensity;
    }
    if (this.hemi) {
      this.hemi.color.copy(this._tmpHemiSky);
      this.hemi.groundColor.copy(this._tmpHemiGr);
    }

    if (phaseName !== this._lastPhaseName) {
      this._lastPhaseName = phaseName;
      this.onPhaseChange?.(phaseName);
    }
  }

  // Encuentra entre qué dos fases estamos y el avance local (0-1) entre ellas
  _findPhaseSegment(progress) {
    for (let i = 0; i < PHASES.length - 1; i++) {
      const from = PHASES[i];
      const to   = PHASES[i + 1];
      // Usamos < en vez de <= para el límite superior, evitando que un
      // progress exactamente igual a un límite caiga en el segmento equivocado.
      if (progress >= from.t && progress < to.t) {
        const span   = to.t - from.t;
        const localT = span > 0 ? (progress - from.t) / span : 0;
        const phaseName = from.name;
        return { from, to, localT, phaseName };
      }
    }
    // progress === último t (ej. 0.95 al cierre del ciclo): usar la última fase
    const last = PHASES[PHASES.length - 1];
    return { from: last, to: last, localT: 0, phaseName: last.name };
  }
    // Fallback (no debería pasar con t:0.95→1.0 cerrando el ciclo)
    return { from: PHASES[0], to: PHASES[0], localT: 0, phaseName: PHASES[0].name };
  }
}
