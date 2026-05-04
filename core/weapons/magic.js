// core/weapons/magic.js — Arma: Magia básica
// Fase 2: proyectil que viaja hacia el enemigo más cercano.
// El jugador "cree" que es magia normal — el élite se revela después.

import * as THREE from 'three';

const DAMAGE      = [10, 24];
const ANIM_DUR    = [300, 500];
const PROJECTILE_SPEED = 8;   // unidades/segundo
const PROJECTILE_COLORS = [0x44aaff, 0xaa44ff]; // azul → violeta en golpe 2

export class MagicWeapon {
  constructor(playerGroup) {
    this.player    = playerGroup;
    this.comboMax  = 2;

    this._projectiles = []; // proyectiles activos en escena
    this._scene       = null; // se asigna en el primer execute si no está
  }

  // Necesita referencia a la escena para agregar proyectiles
  setScene(scene) {
    this._scene = scene;
  }

  execute(hitIndex, enemies, range) {
    // Encuentra el objetivo más cercano (cualquier distancia — es proyectil)
    const target = this._findTarget(enemies);
    if (target && this._scene) {
      this._spawnProjectile(hitIndex, target);
    }
    return !!target;
  }

  getDamage(hitIndex) {
    return DAMAGE[hitIndex] ?? DAMAGE[0];
  }

  getAnimDuration(hitIndex) {
    return ANIM_DUR[hitIndex] ?? ANIM_DUR[0];
  }

  /** Mueve los proyectiles activos hacia su objetivo */
  update(delta) {
    for (let i = this._projectiles.length - 1; i >= 0; i--) {
      const p = this._projectiles[i];

      if (!p.target || p.target.isDead()) {
        this._destroyProjectile(i);
        continue;
      }

      // Mueve hacia el objetivo
      const dir = p.target.mesh.position.clone().sub(p.mesh.position).normalize();
      p.mesh.position.addScaledVector(dir, PROJECTILE_SPEED * delta);

      // ¿Llegó?
      const dist = p.mesh.position.distanceTo(p.target.mesh.position);
      if (dist < 0.4) {
        p.target.takeDamage(p.damage);
        this._destroyProjectile(i);
      }
    }
  }

  // ── Internos ────────────────────────────────────────────────────────────────

  _findTarget(enemies) {
    let closest = null;
    let minDist = Infinity;
    for (const e of enemies) {
      if (e.isDead()) continue;
      const dist = this.player.position.distanceTo(e.mesh.position);
      if (dist < minDist) { minDist = dist; closest = e; }
    }
    return closest;
  }

  _spawnProjectile(hitIndex, target) {
    const geo  = new THREE.SphereGeometry(0.12, 6, 6);
    const mat  = new THREE.MeshBasicMaterial({
      color       : PROJECTILE_COLORS[hitIndex],
      transparent : true,
      opacity     : 0.9,
    });
    const mesh = new THREE.Mesh(geo, mat);
    // Sale desde la posición del jugador, un poco elevado
    mesh.position.copy(this.player.position).add(new THREE.Vector3(0, 0.8, 0));
    this._scene.add(mesh);

    this._projectiles.push({
      mesh,
      target,
      damage : DAMAGE[hitIndex],
    });
  }

  _destroyProjectile(index) {
    const p = this._projectiles[index];
    if (p && this._scene) {
      this._scene.remove(p.mesh);
      p.mesh.geometry.dispose();
      p.mesh.material.dispose();
    }
    this._projectiles.splice(index, 1);
  }
}

