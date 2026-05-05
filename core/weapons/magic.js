// core/weapons/magic.js — Arma: Magia básica
import * as THREE from 'three';

const DAMAGE            = [10, 24];
const ANIM_DUR          = [300, 500];
const PROJECTILE_SPEED  = 8;
const PROJECTILE_COLORS = [0x44aaff, 0xaa44ff];

export class MagicWeapon {
  constructor(playerGroup) {
    this.player   = playerGroup;
    this.comboMax = 2;
    this._projectiles = [];
    this._scene       = null;
  }

  setScene(scene) { this._scene = scene; }

  execute(hitIndex, enemies = []) {
    const target = this._findTarget(enemies);
    if (target && this._scene) this._spawnProjectile(hitIndex, target);
    return !!target;
  }

  getDamage(hitIndex)       { return DAMAGE[hitIndex]   ?? DAMAGE[0]; }
  getAnimDuration(hitIndex) { return ANIM_DUR[hitIndex] ?? ANIM_DUR[0]; }

  update(delta, enemies = []) {
    for (let i = this._projectiles.length - 1; i >= 0; i--) {
      const p = this._projectiles[i];
      if (!p.target || p.target.dead) { this._destroyProjectile(i); continue; }
      const dir = p.target.mesh.position.clone().sub(p.mesh.position).normalize();
      p.mesh.position.addScaledVector(dir, PROJECTILE_SPEED * delta);
      if (p.mesh.position.distanceTo(p.target.mesh.position) < 0.4) {
        p.target.takeDamage(p.damage);
        this._destroyProjectile(i);
      }
    }
  }

  destroy() {
    for (const p of this._projectiles) {
      if (this._scene) this._scene.remove(p.mesh);
      p.mesh.geometry.dispose();
      p.mesh.material.dispose();
    }
    this._projectiles = [];
  }

  _findTarget(enemies) {
    let closest = null, minDist = Infinity;
    for (const e of enemies) {
      if (e.dead) continue;
      const dist = this.player.position.distanceTo(e.mesh.position);
      if (dist < minDist) { minDist = dist; closest = e; }
    }
    return closest;
  }

  _spawnProjectile(hitIndex, target) {
    const geo  = new THREE.SphereGeometry(0.12, 6, 6);
    const mat  = new THREE.MeshBasicMaterial({ color: PROJECTILE_COLORS[hitIndex], transparent: true, opacity: 0.9 });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.copy(this.player.position).add(new THREE.Vector3(0, 0.8, 0));
    this._scene.add(mesh);
    this._projectiles.push({ mesh, target, damage: DAMAGE[hitIndex] });
  }

  _destroyProjectile(index) {
    const p = this._projectiles[index];
    if (p && this._scene) { this._scene.remove(p.mesh); p.mesh.geometry.dispose(); p.mesh.material.dispose(); }
    this._projectiles.splice(index, 1);
  }
}
