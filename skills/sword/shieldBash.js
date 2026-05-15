// skills/sword/shieldBash.js — Golpe de Escudo (Espada)
import * as THREE from 'three';

const DAMAGE     = 30;
const RANGE      = 2.5;
const PUSH_FORCE = 4.0;
const DURATION   = 300;

export class ShieldBash {
  constructor(scene, player) {
    this.scene    = scene;
    this.player   = player;
    this.cooldown = 5;
    this._timer   = 0;
    this._active  = [];
    this.onCooldownUpdate = null;
  }

  isReady() { return this._timer <= 0; }
  getCooldownProgress() { return Math.min(1, 1 - this._timer / this.cooldown); }

  cast(enemies) {
    if (!this.isReady()) return false;
    for (const e of enemies) {
      if (e.isDead() || !e.mesh) continue;
      const toEnemy = e.mesh.position.clone().sub(this.player.position);
      const dist = toEnemy.length();
      if (dist > RANGE) continue;
      e.takeDamage(DAMAGE);
      // Empujar enemigo
      const pushDir = toEnemy.setY(0).normalize();
      e.mesh.position.addScaledVector(pushDir, PUSH_FORCE);
      // Aturdir — forzar roam temporalmente
      if (e._state !== undefined) {
        const prevState = e._state;
        e._state = 'roam';
        setTimeout(() => { if (!e.isDead()) e._state = prevState; }, 1500);
      }
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
      fx.mesh.material.opacity = t * 0.8;
      fx.mesh.scale.setScalar(1 + (1 - t));
      if (fx.timer <= 0) {
        this.scene.remove(fx.mesh);
        fx.mesh.geometry.dispose();
        fx.mesh.material.dispose();
        this._active.splice(i, 1);
      }
    }
  }

  _spawnEffect() {
    const geo = new THREE.SphereGeometry(RANGE, 10, 10);
    const mat = new THREE.MeshBasicMaterial({
      color: 0x4488ff, transparent: true, opacity: 0.5, wireframe: true,
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.copy(this.player.position).add(new THREE.Vector3(0, 0.8, 0));
    this.scene.add(mesh);
    this._active.push({ mesh, timer: DURATION });
  }
}
