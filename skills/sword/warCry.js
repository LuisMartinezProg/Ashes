// skills/sword/warCry.js — Grito de Guerra (Espada)
import * as THREE from 'three';

const BUFF_DURATION  = 8;
const DAMAGE_MULT    = 1.5;
const DURATION_VFX   = 600;

export class WarCry {
  constructor(scene, player) {
    this.scene       = scene;
    this.player      = player;
    this.cooldown    = 12;
    this._timer      = 0;
    this._buffTimer  = 0;
    this._active     = [];
    this._buffActive = false;
    this.onCooldownUpdate = null;
    this.onBuffChange     = null; // callback externo opcional
  }

  isReady() { return this._timer <= 0; }
  getCooldownProgress() { return Math.min(1, 1 - this._timer / this.cooldown); }
  isBuffed() { return this._buffActive; }
  getDamageMult() { return this._buffActive ? DAMAGE_MULT : 1; }

  cast(enemies) {
    if (!this.isReady()) return false;
    this._buffActive = true;
    this._buffTimer  = BUFF_DURATION;
    this._timer      = this.cooldown;
    this._spawnEffect();
    if (this.onCooldownUpdate) this.onCooldownUpdate(0);
    if (this.onBuffChange) this.onBuffChange(true);
    return true;
  }

  update(delta) {
    if (this._timer > 0) {
      this._timer -= delta;
      if (this._timer < 0) this._timer = 0;
      if (this.onCooldownUpdate) this.onCooldownUpdate(this.getCooldownProgress());
    }
    if (this._buffActive) {
      this._buffTimer -= delta;
      if (this._buffTimer <= 0) {
        this._buffActive = false;
        if (this.onBuffChange) this.onBuffChange(false);
      }
    }
    for (let i = this._active.length - 1; i >= 0; i--) {
      const fx = this._active[i];
      fx.timer -= delta * 1000;
      const t = Math.max(0, fx.timer / DURATION_VFX);
      fx.mesh.scale.setScalar(1 + (1 - t) * 3);
      fx.mesh.material.opacity = t * 0.5;
      if (fx.timer <= 0) {
        this.scene.remove(fx.mesh);
        fx.mesh.geometry.dispose();
        fx.mesh.material.dispose();
        this._active.splice(i, 1);
      }
    }
  }

  _spawnEffect() {
    const geo = new THREE.SphereGeometry(1, 10, 10);
    const mat = new THREE.MeshBasicMaterial({
      color: 0xff6600, transparent: true, opacity: 0.5,
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.copy(this.player.position).add(new THREE.Vector3(0, 1, 0));
    this.scene.add(mesh);
    this._active.push({ mesh, timer: DURATION_VFX });
  }
}
