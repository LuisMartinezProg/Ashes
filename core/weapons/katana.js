// skills/katana/quickSlash.js — Tajo Rápido (Común)
import * as THREE from 'three';

const DAMAGE   = 35;
const RANGE    = 2.8;
const DURATION = 300;

export class QuickSlash {
  constructor(scene, player) {
    this.scene    = scene;
    this.player   = player;
    this.cooldown = 3;
    this._timer   = 0;
    this._active  = [];
    this.onCooldownUpdate = null;
  }

  isReady() { return this._timer <= 0; }

  getCooldownProgress() {
    return Math.min(1, 1 - this._timer / this.cooldown);
  }

  cast(enemies) {
    if (!this.isReady()) return false;

    // Daño inmediato en área
    let hit = false;
    for (const e of enemies) {
      if (e.isDead() || !e.mesh) continue;
      const d = this.player.position.distanceTo(e.mesh.position);
      if (d <= RANGE) { e.takeDamage(DAMAGE); hit = true; }
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
      fx.mesh.scale.setScalar(1 + (1 - t) * 1.5);
      fx.mesh.material.opacity = t * 0.7;
      if (fx.timer <= 0) {
        this.scene.remove(fx.mesh);
        fx.mesh.geometry.dispose();
        fx.mesh.material.dispose();
        this._active.splice(i, 1);
      }
    }
  }

  _spawnEffect() {
    const geo  = new THREE.RingGeometry(0.3, RANGE, 16);
    const mat  = new THREE.MeshBasicMaterial({
      color: 0xffffff, transparent: true, opacity: 0.7, side: THREE.DoubleSide,
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.copy(this.player.position).add(new THREE.Vector3(0, 0.5, 0));
    mesh.rotation.x = -Math.PI / 2;
    this.scene.add(mesh);
    this._active.push({ mesh, timer: DURATION });
  }
        }
