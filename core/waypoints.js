// core/waypoints.js — Ashes of the Reborn | Valiant Gaming
//
// Sistema de puntos de teletransporte (fogatas). Se activan automáticamente
// al acercarse. Empiezan apagadas (grises) y se encienden al activarse.
// El último waypoint activado es el punto de respawn en mundo abierto.

import * as THREE from 'three';

const ACTIVATION_RADIUS = 4;
const WAYPOINT_STORAGE_KEY = 'ashes_last_waypoint';

// Posiciones — mismas zonas que las 3 entradas de dungeon en scene.js,
// corridas un poco hacia adelante (z + 8) para no chocar visualmente con
// la boca de la cueva.
export const WAYPOINTS = [
  { id: 'waypoint_malachar', x: 0,   z: -112 },
  { id: 'waypoint_veyris',   x: -30, z: -152 },
  { id: 'waypoint_khazeron', x: 30,  z: -192 },
];

export class WaypointSystem {
  constructor() {
    this._activated  = this._loadActivated();
    this._lastActive = this._loadLastActive();
    this._meshes     = {}; // id -> { group, flame, glow }
  }

  // ── Persistencia ──────────────────────────────────────────────────────
  _loadActivated() {
    try {
      const saved = localStorage.getItem(WAYPOINT_STORAGE_KEY + '_set');
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch (e) {
      return new Set();
    }
  }

  _saveActivated() {
    localStorage.setItem(WAYPOINT_STORAGE_KEY + '_set', JSON.stringify([...this._activated]));
  }

  _loadLastActive() {
    return localStorage.getItem(WAYPOINT_STORAGE_KEY) ?? null;
  }

  _saveLastActive() {
    if (this._lastActive) {
      localStorage.setItem(WAYPOINT_STORAGE_KEY, this._lastActive);
    }
  }

  // ── Construcción visual ───────────────────────────────────────────────
  buildAll(parent) {
    for (const wp of WAYPOINTS) {
      this._buildOne(parent, wp);
    }
  }

  _buildOne(parent, wp) {
    const g = new THREE.Group();
    g.position.set(wp.x, 0, wp.z);

    // Base de piedras
    const stoneMat = new THREE.MeshStandardMaterial({ color: 0x4a4a4a, roughness: 0.95 });
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const stone = new THREE.Mesh(new THREE.SphereGeometry(0.28, 6, 5), stoneMat);
      stone.position.set(Math.cos(angle) * 0.7, 0.15, Math.sin(angle) * 0.7);
      stone.scale.y = 0.6;
      g.add(stone);
    }

    // Leña (siempre visible, apagada o no)
    const woodMat = new THREE.MeshStandardMaterial({ color: 0x3a2410, roughness: 0.9 });
    for (let i = 0; i < 5; i++) {
      const angle = (i / 5) * Math.PI * 2;
      const log = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.07, 0.9, 6), woodMat);
      log.position.set(Math.cos(angle) * 0.15, 0.2, Math.sin(angle) * 0.15);
      log.rotation.z = Math.PI / 2.3;
      log.rotation.y = angle;
      g.add(log);
    }

    const isActive = this._activated.has(wp.id);

    // Llama — visible y animada solo si ya está activado
    const flameMat = new THREE.MeshStandardMaterial({
      color: 0xff6600, emissive: 0xff6600, emissiveIntensity: isActive ? 2.0 : 0,
      transparent: true, opacity: isActive ? 1 : 0,
    });
    const flame = new THREE.Mesh(new THREE.SphereGeometry(0.22, 8, 8), flameMat);
    flame.position.set(0, 0.45, 0);
    g.add(flame);

    // Glow de luz cálida (solo si activo)
    const glowMat = new THREE.MeshBasicMaterial({
      color: 0xffaa44, transparent: true, opacity: isActive ? 0.2 : 0, side: THREE.DoubleSide,
    });
    const glow = new THREE.Mesh(new THREE.CircleGeometry(1.6, 16), glowMat);
    glow.rotation.x = -Math.PI / 2;
    glow.position.set(0, 0.05, 0);
    g.add(glow);

    parent.add(g);
    this._meshes[wp.id] = { group: g, flame, glow };

    if (isActive) this._startFlameAnim(wp.id);
  }

  _startFlameAnim(id) {
    const m = this._meshes[id];
    if (!m || m._animating) return;
    m._animating = true;
    const startPhase = Math.random() * Math.PI * 2;
    const tick = () => {
      if (!m.flame.parent) return; // fue removido
      const t = Date.now() * 0.001 + startPhase;
      m.flame.material.emissiveIntensity = 1.6 + Math.sin(t * 4) * 0.5;
      m.glow.material.opacity = 0.16 + Math.sin(t * 2.2) * 0.06;
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

  // ── Activación por cercanía ───────────────────────────────────────────
  update(playerPos) {
    for (const wp of WAYPOINTS) {
      if (this._activated.has(wp.id)) {
        // Ya activado: solo actualiza cuál es el "último" si estás cerca
        if (this._near(playerPos, wp) && this._lastActive !== wp.id) {
          this._lastActive = wp.id;
          this._saveLastActive();
        }
        continue;
      }
      if (this._near(playerPos, wp)) {
        this._activate(wp);
      }
    }
  }

  _near(pos, wp) {
    const dx = pos.x - wp.x;
    const dz = pos.z - wp.z;
    return Math.sqrt(dx * dx + dz * dz) < ACTIVATION_RADIUS;
  }

  _activate(wp) {
    this._activated.add(wp.id);
    this._lastActive = wp.id;
    this._saveActivated();
    this._saveLastActive();

    const m = this._meshes[wp.id];
    if (m) {
      m.flame.material.opacity = 1;
      m.glow.material.opacity  = 0.2;
      this._startFlameAnim(wp.id);
    }

    this._showActivationNotification(wp.id);
  }

  _showActivationNotification(id) {
    const el = document.createElement('div');
    Object.assign(el.style, {
      position     : 'fixed',
      top          : '18%',
      left         : '50%',
      transform    : 'translateX(-50%)',
      fontFamily   : "'Cinzel',serif",
      fontSize     : '13px',
      letterSpacing: '3px',
      color        : '#EDD47A',
      background   : 'rgba(4,4,10,0.9)',
      border       : '1px solid rgba(237,212,122,0.5)',
      borderRadius : '10px',
      padding      : '10px 20px',
      zIndex       : '600',
      pointerEvents: 'none',
      textAlign    : 'center',
      opacity      : '1',
      transition   : 'opacity 1s',
    });
    el.textContent = '🔥 PUNTO DE VIAJE ACTIVADO';
    document.body.appendChild(el);
    setTimeout(() => {
      el.style.opacity = '0';
      setTimeout(() => el.remove(), 1000);
    }, 2200);
  }

  // ── API pública ────────────────────────────────────────────────────────

  getLastActivePosition() {
    if (!this._lastActive) return null;
    const wp = WAYPOINTS.find(w => w.id === this._lastActive);
    return wp ? { x: wp.x, z: wp.z } : null;
  }

  getLastActiveId() { return this._lastActive; }

  isActivated(id) { return this._activated.has(id); }
}
