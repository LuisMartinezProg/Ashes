// skills/sword/cleave.js — Barrido Frontal (Espada)
import * as THREE from 'three';

const DAMAGE   = 55;
const RANGE    = 3.5;
const ARC      = Math.PI * 0.6;
const DURATION = 400;

export class Cleave {
  constructor(scene, player) {
    this.scene    = scene;
    this.player   = player;
    this.cooldown = 4;
    this._timer   = 0;
    this._active  = [];
    this.onCooldownUpdate = null;
  }

  isReady() { return this._timer <= 0; }
  getCooldownProgress() { return Math.min(1, 1 - this._timer / this.cooldown); }

  cast(enemies) {
    if (!this.isReady()) return false;
    const forward = new THREE.Vector3(
      Math.sin(this.player.rotation.y), 0,
      Math.cos(this.player.rotation.y)
    );
    for (const e of enemies) {
      if (e.isDead() || !e.mesh) continue;
      const dx = e.mesh.position.x - this.player.position.x;
      const dz = e.mesh.position.z - this.player.position.z;
      const dist = Math.sqrt(dx*dx + dz*dz);
      if (dist > RANGE) continue;
      const toEnemy = new THREE.Vector3(dx, 0, dz).normalize();
      if (forward.angleTo(toEnemy) <= ARC / 2) e.takeDamage(DAMAGE);
    }
    this._spawnEffect(forward);
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
      fx.mesh.scale.setScalar(1 + (1 - t) * 1.2);
      fx.mesh.material.opacity = t * 0.6;
      if (fx.timer <= 0) {
        this.scene.remove(fx.mesh);
        fx.mesh.geometry.dispose();
        fx.mesh.material.dispose();
        this._active.splice(i, 1);
      }
    }
  }

  _spawnEffect(forward) {
    const geo  = new THREE.RingGeometry(0.2, RANGE, 16, 1, -ARC / 2, ARC);
    const mat  = new THREE.MeshBasicMaterial({ color: 0xffcc44, transparent: true, opacity: 0.6, side: THREE.DoubleSide });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.copy(this.player.position).add(new THREE.Vector3(0, 0.4, 0));
    mesh.rotation.x = -Math.PI / 2;
    mesh.rotation.z = -Math.atan2(forward.x, forward.z);
    this.scene.add(mesh);
    this._active.push({ mesh, timer: DURATION });
  }
}
