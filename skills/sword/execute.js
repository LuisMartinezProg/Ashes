// skills/sword/execute.js — Ejecución (Espada)
import * as THREE from 'three';

const DAMAGE_BASE    = 80;
const DAMAGE_LOW_HP  = 220;
const LOW_HP_THRESH  = 0.3;
const MAX_CAST_RANGE = 3.0;
const DURATION       = 500;

export class Execute {
  constructor(scene, player) {
    this.scene    = scene;
    this.player   = player;
    this.cooldown = 8;
    this._timer   = 0;
    this._active  = [];
    this.onCooldownUpdate = null;
  }

  isReady() { return this._timer <= 0; }
  getCooldownProgress() { return Math.min(1, 1 - this._timer / this.cooldown); }

  cast(enemies) {
    if (!this.isReady()) return false;
    let hit = false;
    for (const e of enemies) {
      if (e.isDead() || !e.mesh) continue;
      const dist = this.player.position.distanceTo(e.mesh.position);
      if (dist > MAX_CAST_RANGE) continue;
      const isLowHp = e.hp / e.maxHp <= LOW_HP_THRESH;
      const dmg = isLowHp ? DAMAGE_LOW_HP : DAMAGE_BASE;
      e.takeDamage(dmg);
      this._spawnEffect(e.mesh.position, isLowHp);
      hit = true;
    }
    if (!hit) return false;
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
      fx.mesh.scale.setScalar(1 + (1 - t) * 2);
      fx.mesh.material.opacity = t;
      if (fx.timer <= 0) {
        this.scene.remove(fx.mesh);
        fx.mesh.geometry.dispose();
        fx.mesh.material.dispose();
        this._active.splice(i, 1);
      }
    }
  }

  _spawnEffect(pos, isLowHp) {
    const geo = new THREE.SphereGeometry(0.5, 8, 8);
    const mat = new THREE.MeshBasicMaterial({
      color: isLowHp ? 0xff0000 : 0xff6600,
      transparent: true, opacity: 0.8,
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.copy(pos).add(new THREE.Vector3(0, 1, 0));
    this.scene.add(mesh);
    this._active.push({ mesh, timer: DURATION });
  }
}
