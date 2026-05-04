// core/weapons/sword.js — Arma: Espada
// Fase 2: 2 golpes en combo. Golpe 1 liviano, golpe 2 fuerte.
//
// La "animación" en Fase 2 es un flash visual en el mesh del jugador
// (cambio de color breve). En Fase 3+ se reemplaza por animación real.

import * as THREE from 'three';

// Daño por golpe del combo
const DAMAGE    = [12, 28];       // golpe 1, golpe 2
const ANIM_DUR  = [280, 420];     // ms que dura cada animación

// Color del flash por golpe (simula el swing)
const FLASH_COLOR = [0xffffff, 0xffdd44]; // blanco / dorado en el remate

export class SwordWeapon {
  constructor(playerGroup) {
    this.player   = playerGroup;
    this.comboMax = 2;

    // Referencia al mesh de la cápsula del jugador para el flash
    this._originalColors = new Map();
    this._flashTimeout   = null;

    // Mesh de espada placeholder (rectángulo delgado)
    this._swordMesh = this._buildSwordMesh();
    this.player.add(this._swordMesh);
  }

  // ── API requerida por CombatSystem ─────────────────────────────────────────

  /**
   * Ejecuta el golpe.
   * Retorna true si hay posibilidad de impacto (la detección real la hace combat.js).
   */
  execute(hitIndex, enemies, range) {
    this._playSwingAnim(hitIndex);
    return true; // siempre intenta — combat.js filtra por rango
  }

  getDamage(hitIndex) {
    return DAMAGE[hitIndex] ?? DAMAGE[0];
  }

  getAnimDuration(hitIndex) {
    return ANIM_DUR[hitIndex] ?? ANIM_DUR[0];
  }

  /** Llamado cada frame desde CombatSystem.update() */
  update(delta) {
    // Reservado para animaciones futuras (swing arc, trail, etc.)
  }

  // ── Visual placeholder ──────────────────────────────────────────────────────

  _buildSwordMesh() {
    // Espada placeholder: rectángulo delgado a la derecha del jugador
    const geo  = new THREE.BoxGeometry(0.08, 0.9, 0.04);
    const mat  = new THREE.MeshBasicMaterial({ color: 0xaaccff });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(0.35, 0.2, 0); // costado derecho, altura media
    return mesh;
  }

  _playSwingAnim(hitIndex) {
    clearTimeout(this._flashTimeout);

    const flashColor = FLASH_COLOR[hitIndex];
    const duration   = ANIM_DUR[hitIndex];

    // Flash en la espada
    this._swordMesh.material.color.setHex(flashColor);

    // Inclina la espada hacia adelante (swing visual simple)
    this._swordMesh.rotation.x = -Math.PI * 0.4;

    this._flashTimeout = setTimeout(() => {
      this._swordMesh.material.color.setHex(0xaaccff);
      this._swordMesh.rotation.x = 0;
    }, duration * 0.6);
  }
}

