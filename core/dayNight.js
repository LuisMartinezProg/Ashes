// core/dayNight.js — Ashes of the Reborn | Valiant Gaming
// Ciclo día/noche visual: cielo, fog y luces interpolan entre 4 fases.
// v1: solo visual/ambiental. Gameplay (dificultad nocturna, stock tiendas) viene después.
import * as THREE from 'three';

const CYCLE_DURATION_S = 1800; // 30 min reales = 1 día completo
const UPDATE_INTERVAL_MS = 1000; // recalcular 1 vez por segundo (no por frame)

const PHASES = [
  { t: 0.00, name: 'amanecer', sky: 0xFFB870, fog: 0xE8956A, ambient: 0xFFD8A0, sunColor: 0xFFA860, sunIntensity: 1.6, hemiSky: 0xFFB870, hemiGround: 0x6A4A30 },
  { t: 0.10, name: 'dia',      sky: 0x5A7A8A, fog: 0x3A5A40, ambient: 0xB0C8D0, sunColor: 0xFFE8A0, sunIntensity: 2.0, hemiSky: 0x88AA66, hemiGround: 0x2A3A1A },
  { t: 0.45, name: 'atardecer',sky: 0xC9683A, fog: 0xA84A30, ambient: 0xE0A070, sunColor: 0xFF6A30, sunIntensity: 1.4, hemiSky: 0xC9683A, hemiGround: 0x4A2A1A },
  { t: 0.55, name: 'noche',    sky: 0x0A1428, fog: 0x081020, ambient: 0x3A4A70, sunColor: 0x4A5A90, sunIntensity: 0.35, hemiSky: 0x1A2A4A, hemiGround: 0x0A0A14 },
  { t: 0.95, name: 'amanecer', sky: 0xFFB870, fog: 0xE8956A, ambient: 0xFFD8A0, sunColor: 0xFFA860, sunIntensity: 1.6, hemiSky: 0xFFB870, hemiGround: 0x6A4A30 },
];

export class DayNightCycle {
  constructor(scene, lights) {
    this.scene   = scene;
    this.sun     = lights.sun;
    this.ambient = lights.ambient;
    this.hemi    = lights.hemisphere;

    this._elapsed     = 0;
    this._intervalId  = null;

    // Objetos temporales "from" (sobre los que se llama .lerp())
    this._tmpSky     = new THREE.Color();
    this._tmpFog     = new THREE.Color();
    this._tmpAmbient = new THREE.Color();
    this._tmpSun     = new THREE.Color();
    this._tmpHemiSky = new THREE.Color();
    this._tmpHemiGr  = new THREE.Color();

    // Objetos temporales "to" — separados, porque .lerp(target, t) necesita
    // que target sea un objeto distinto al que estamos mutando.
    this._tmpSkyTo     = new THREE.Color();
    this._tmpFogTo     = new THREE.Color();
    this._tmpAmbientTo = new THREE.Color();
    this._tmpSunTo     = new THREE.Color();
    this._tmpHemiSkyTo = new THREE.Color();
    this._tmpHemiGrTo  = new THREE.Color();

    this.onPhaseChange   = null;
    this._lastPhaseName  = null;
  }

  start(startProgress = 0) {
    this._elapsed = startProgress * CYCLE_DURATION_S;
    this._applyProgress(this.getProgress()); // aplica estado inicial SIN avanzar tiempo
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
    this._applyProgress(this.getProgress()); // aplica de inmediato, SIN sumar tiempo extra
  }

  getProgress() {
    return (this._elapsed % CYCLE_DURATION_S) / CYCLE_DURATION_S;
  }

  // Avanza el tiempo 1 tick Y aplica (usado solo por el setInterval automático)
  _tick() {
    this._elapsed += UPDATE_INTERVAL_MS / 1000;
    this._applyProgress(this.getProgress());
  }

  _applyProgress(progress) {
    const { from, to, localT, phaseName } = this._findPhaseSegment(progress);

    this._tmpSky.setHex(from.sky);
    this._tmpSkyTo.setHex(to.sky);
    this._tmpSky.lerp(this._tmpSkyTo, localT);

    this._tmpFog.setHex(from.fog);
    this._tmpFogTo.setHex(to.fog);
    this._tmpFog.lerp(this._tmpFogTo, localT);

    this._tmpAmbient.setHex(from.ambient);
    this._tmpAmbientTo.setHex(to.ambient);
    this._tmpAmbient.lerp(this._tmpAmbientTo, localT);

    this._tmpSun.setHex(from.sunColor);
    this._tmpSunTo.setHex(to.sunColor);
    this._tmpSun.lerp(this._tmpSunTo, localT);

    this._tmpHemiSky.setHex(from.hemiSky);
    this._tmpHemiSkyTo.setHex(to.hemiSky);
    this._tmpHemiSky.lerp(this._tmpHemiSkyTo, localT);

    this._tmpHemiGr.setHex(from.hemiGround);
    this._tmpHemiGrTo.setHex(to.hemiGround);
    this._tmpHemiGr.lerp(this._tmpHemiGrTo, localT);

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
      if (progress >= from.t && progress < to.t) {
        const span   = to.t - from.t;
        const localT = span > 0 ? (progress - from.t) / span : 0;
        return { from, to, localT, phaseName: from.name };
      }
    }
    const last = PHASES[PHASES.length - 1];
    return { from: last, to: last, localT: 0, phaseName: last.name };
  }
}
