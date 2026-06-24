// core/weather.js — Ashes of the Reborn | Valiant Gaming
// Sistema de clima: despejado / lluvia / niebla.
// Lee el color que dayNight.js ya puso en la escena y aplica un filtro encima.
// No conoce ni depende de dayNight.js — son independientes.

import * as THREE from 'three';

const UPDATE_INTERVAL_MS = 1000; // igual que dayNight, no hace falta más frecuencia

// Cuánto oscurece/desatura cada clima el color base de la escena (0 = sin cambio, 1 = full gris oscuro)
const WEATHER_CONFIG = {
  despejado: { darken: 0, grayMix: 0, fogMultiplier: 1.0, rain: false },
  lluvia:    { darken: 0.35, grayMix: 0.5, fogMultiplier: 1.8, rain: true },
  niebla:    { darken: 0.15, grayMix: 0.3, fogMultiplier: 3.2, rain: false },
};

const GRAY = new THREE.Color(0x888888);

export class WeatherSystem {
  constructor(scene) {
    this.scene = scene;
    this._current = 'despejado';
    this._intervalId = null;

    // Color "base" guardado ANTES de aplicar el filtro de clima, para no
    // ir oscureciendo progresivamente sobre sí mismo cada tick.
    this._baseSky = new THREE.Color();
    this._baseFog = new THREE.Color();
    this._baseFogDensity = null;

    this._rainGroup = null;
    this._rainCount = 600;

    this.onWeatherChange = null; // callback opcional: (name) => {}

    this._buildRain();
  }

  start() {
    this._tick();
    this._intervalId = setInterval(() => this._tick(), UPDATE_INTERVAL_MS);
  }

  stop() {
    if (this._intervalId) clearInterval(this._intervalId);
    this._intervalId = null;
  }

  setWeather(name) {
    if (!WEATHER_CONFIG[name]) {
      console.warn('[Weather] Clima desconocido:', name);
      return;
    }
    this._current = name;
    if (this._rainGroup) {
      this._rainGroup.visible = WEATHER_CONFIG[name].rain;
    }
    this.onWeatherChange?.(name);
    this._tick(); // aplica de inmediato, sin esperar el próximo intervalo
  }

  getWeather() { return this._current; }

  _tick() {
    const cfg = WEATHER_CONFIG[this._current];
    if (!cfg) return;

    if (this.scene.background?.isColor) {
      this._baseSky.copy(this.scene.background);
    }
    if (this.scene.fog) {
      this._baseFog.copy(this.scene.fog.color);
      if (this._baseFogDensity === null) {
        this._baseFogDensity = this.scene.fog.density;
      }
    }

    if (cfg.darken > 0 || cfg.grayMix > 0) {
      const sky = this._baseSky.clone();
      sky.lerp(GRAY, cfg.grayMix);
      sky.multiplyScalar(1 - cfg.darken);
      if (this.scene.background?.isColor) {
        this.scene.background.copy(sky);
      }

      const fog = this._baseFog.clone();
      fog.lerp(GRAY, cfg.grayMix);
      fog.multiplyScalar(1 - cfg.darken);
      if (this.scene.fog) {
        this.scene.fog.color.copy(fog);
      }
    }

    if (this.scene.fog && this._baseFogDensity !== null) {
      this.scene.fog.density = this._baseFogDensity * cfg.fogMultiplier;
    }
  }

  // Movimiento de caída de lluvia — llamar desde el render loop principal
  // (requestAnimationFrame), no desde el setInterval de _tick, para que
  // se vea fluida en vez de a saltos.
  // delta = segundos transcurridos desde el último frame.
  updateRain(delta) {
    if (!this._rainGroup?.visible) return;
    const speed = 14; // unidades por segundo de caída
    const pos = this._rainGroup.geometry.attributes.position;
    for (let i = 0; i < this._rainCount; i++) {
      let y = pos.getY(i) - speed * delta;
      if (y < 0) y = 30;
      pos.setY(i, y);
    }
    pos.needsUpdate = true;
  }

  // ── Partículas de lluvia ───────────────────────────────────────────────
  _buildRain() {
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(this._rainCount * 3);
    for (let i = 0; i < this._rainCount; i++) {
      positions[i * 3]     = (Math.random() - 0.5) * 80;
      positions[i * 3 + 1] = Math.random() * 30;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 80;
    }
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const mat = new THREE.PointsMaterial({
      color: 0xAACCEE,
      size: 0.08,
      transparent: true,
      opacity: 0.55,
      sizeAttenuation: true,
    });

    this._rainGroup = new THREE.Points(geo, mat);
    this._rainGroup.name = 'weather_rain';
    this._rainGroup.visible = false;
    this.scene.add(this._rainGroup);
  }
}
