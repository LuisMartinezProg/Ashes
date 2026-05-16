// skills/katana/lastStand.js — Último Bastión (Honor)
import * as THREE from 'three';

const DAMAGE_BASE    = 60;
const DAMAGE_LOW_HP  = 180;
const LOW_HP_THRESH  = 0.3;
const RANGE          = 4.0;
const DURATION       = 500;

export class LastStand {
  constructor(scene, player) {
    this.scene    = scene;
    this.player   = player;
    this.cooldown = 10;
    this._timer   = 0;
    this._active  = [];
    this.onCooldownUpdate = null;
  }

  isReady() { return this._timer <= 0; }
  getCooldownProgress() { return Math.min(1, 1 - this._timer / this.cooldown); }

  cast(enemies) {
    if (!this.isReady()) return false;
    const inRange = enemies.filter(e => {
      if (e.isDead() || !e.mesh) return false;
      const dx = this.player.position.x - e.mesh.position.x;
      const dz = this.player.position.z - e.mesh.position.z;
      return Math.sqrt(dx*dx + dz*dz) <= RANGE;
    });
    if (inRange.length === 0) return false;

    // Más daño si el jugador tiene poca vida
    const playerHp = window._player?.hp ?? 100;
    const playerMaxHp = window._player?.maxHp ?? 100;
    const isLowHp = playerHp / playerMaxHp <= LOW_HP_THRESH;
    const dmg = isLowHp ? DAMAGE_LOW_HP : DAMAGE_BASE;

    inRange.forEach(e => e.takeDamage(dmg));
    this._spawnEffect(isLowHp);
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
      fx.mesh.material.opacity = t * 0.7;
      if (fx.timer <= 0) {
        this.scene.remove(fx.mesh);
        fx.mesh.geometry.dispose();
        fx.mesh.material.dispose();
        this._active.splice(i, 1);
      }
    }
  }

  _spawnEffect(isLowHp) {
    const geo = new THREE.SphereGeometry(0.8, 10, 10);
    const mat = new THREE.MeshBasicMaterial({
      color: isLowHp ? 0xff0000 : 0xffdd44,
      transparent: true, opacity: 0.7,
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.copy(this.player.position).add(new THREE.Vector3(0, 1, 0));
    this.scene.add(mesh);
    this._active.push({ mesh, timer: DURATION });
  }
}
