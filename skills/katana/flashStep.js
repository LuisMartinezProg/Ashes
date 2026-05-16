// skills/katana/flashStep.js — Paso Relámpago (Rara)
import * as THREE from 'three';

const DAMAGE   = 55;
const RANGE    = 4.0;
const DURATION = 400;

export class FlashStep {
  constructor(scene, player) {
    this.scene    = scene;
    this.player   = player;
    this.cooldown = 6;
    this._timer   = 0;
    this._active  = [];
    this.onCooldownUpdate = null;
  }

  isReady() { return this._timer <= 0; }
  getCooldownProgress() { return Math.min(1, 1 - this._timer / this.cooldown); }

  cast(enemies) {
    if (!this.isReady()) return false;

    let target = null, minDist = Infinity;
    for (const e of enemies) {
      if (e.isDead() || !e.mesh) continue;
      const dx = this.player.position.x - e.mesh.position.x;
      const dz = this.player.position.z - e.mesh.position.z;
      const d  = Math.sqrt(dx*dx + dz*dz);
      if (d <= RANGE && d < minDist) { minDist = d; target = e; }
    }

    if (!target) return false;

    target.takeDamage(DAMAGE);
    this._spawnEffect(target.mesh.position);
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
      fx.mesh.scale.setScalar(2 - t);
      fx.mesh.material.opacity = t * 0.8;
      if (fx.timer <= 0) {
        this.scene.remove(fx.mesh);
        fx.mesh.geometry.dispose();
        fx.mesh.material.dispose();
        this._active.splice(i, 1);
      }
    }
  }

  _spawnEffect(pos) {
    const geo  = new THREE.PlaneGeometry(0.2, 2.0);
    const mat  = new THREE.MeshBasicMaterial({
      color: 0xffffff, transparent: true, opacity: 0.8, side: THREE.DoubleSide,
    });
    const mesh1 = new THREE.Mesh(geo, mat.clone());
    const mesh2 = new THREE.Mesh(geo, mat.clone());
    mesh1.position.copy(pos).add(new THREE.Vector3(0, 1, 0));
    mesh2.position.copy(pos).add(new THREE.Vector3(0, 1, 0));
    mesh2.rotation.y = Math.PI / 2;
    this.scene.add(mesh1);
    this.scene.add(mesh2);
    this._active.push({ mesh: mesh1, timer: DURATION });
    this._active.push({ mesh: mesh2, timer: DURATION });
  }
}
