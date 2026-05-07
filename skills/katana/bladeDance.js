// skills/katana/bladeDance.js — Danza de Hojas
import * as THREE from 'three';

const DAMAGE = 80;
const RANGE = 3.5;
const DURATION = 600;

export class BladeDance {
  constructor(scene, player) {
    this.scene = scene;
    this.player = player;
    this.cooldown = 10;
    this._timer = 0;
    this._active = [];
    this.onCooldownUpdate = null;
  }

  isReady() {
    return this._timer <= 0;
  }

  getCooldownProgress() {
    return Math.min(1, 1 - this._timer / this.cooldown);
  }

  cast(enemies) {
    if (!this.isReady()) return false;

    for (const e of enemies) {
      if (e.isDead?.() || !e.mesh) continue;
      const d = this.player.position.distanceTo(e.mesh.position);
      if (d <= RANGE) e.takeDamage(DAMAGE);
    }

    this._spawnEffect();
    this._timer = this.cooldown;
    if (this.onCooldownUpdate) this.onCooldownUpdate(0);
    return true;
  }

  update(delta) {
    if (this._timer > 0) {
      this._timer -= delta;
      if (this._timer < 0) this._timer = 0;
      if (this.onCooldownUpdate) this.onCooldownUpdate(this.getCooldownProgress());
    }

    for (let i = this._active.length - 1; i >= 0; i--) {
      const fx = this._active[i];
      fx.timer -= delta * 1000;
      const t = Math.max(0, fx.timer / DURATION);
      fx.mesh.rotation.y += delta * 8;
      if (fx.mesh.material) fx.mesh.material.opacity = t * 0.6;
      fx.mesh.scale.setScalar(1 + (1 - t) * 0.5);
      if (fx.timer <= 0) {
        this.scene.remove(fx.mesh);
        if (fx.mesh.geometry) fx.mesh.geometry.dispose();
        if (fx.mesh.material) fx.mesh.material.dispose();
        this._active.splice(i, 1);
      }
    }
  }

  _spawnEffect() {
    const geo = new THREE.TorusGeometry(RANGE * 0.5, 0.08, 6, 20);
    const mat = new THREE.MeshBasicMaterial({
      color: 0xaaddff,
      transparent: true,
      opacity: 0.6,
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.copy(this.player.position).add(new THREE.Vector3(0, 0.8, 0));
    this.scene.add(mesh);
    this._active.push({ mesh, timer: DURATION });
  }
}
