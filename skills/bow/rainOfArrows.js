// skills/bow/rainOfArrows.js — Lluvia de Flechas (Arco)
import * as THREE from 'three';

const DAMAGE        = 35;
const RADIUS        = 5.0;
const MAX_CAST_RANGE = 20;
const DURATION      = 800;
const ARROW_COUNT   = 8;

export class RainOfArrows {
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
    const target = this._findTarget(enemies);
    if (!target) return false;
    const center = target.mesh.position.clone();

    // Daño a todos en radio
    for (const e of enemies) {
      if (e.isDead() || !e.mesh) continue;
      if (e.mesh.position.distanceTo(center) <= RADIUS) e.takeDamage(DAMAGE);
    }

    this._spawnEffect(center);
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
      fx.ring.material.opacity = t * 0.5;
      fx.arrows.forEach(a => {
        a.position.y -= delta * 6;
        a.material.opacity = t;
      });
      if (fx.timer <= 0) {
        this.scene.remove(fx.ring);
        fx.arrows.forEach(a => this.scene.remove(a));
        this._active.splice(i, 1);
      }
    }
  }

  _findTarget(enemies) {
    let closest = null, minDist = Infinity;
    for (const e of enemies) {
      if (e.isDead()) continue;
      const d = this.player.position.distanceTo(e.mesh.position);
      if (d < minDist && d < MAX_CAST_RANGE) { minDist = d; closest = e; }
    }
    return closest;
  }

  _spawnEffect(center) {
    const ringGeo = new THREE.RingGeometry(RADIUS - 0.1, RADIUS, 32);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0xddaa44, transparent: true, opacity: 0.5, side: THREE.DoubleSide,
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.position.copy(center).add(new THREE.Vector3(0, 0.1, 0));
    ring.rotation.x = -Math.PI / 2;
    this.scene.add(ring);

    const arrows = [];
    for (let i = 0; i < ARROW_COUNT; i++) {
      const angle = (i / ARROW_COUNT) * Math.PI * 2;
      const geo = new THREE.CylinderGeometry(0.03, 0.03, 0.7, 4);
      const mat = new THREE.MeshBasicMaterial({ color: 0xddaa44, transparent: true, opacity: 0.9 });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(
        center.x + Math.cos(angle) * (RADIUS * Math.random()),
        center.y + 4,
        center.z + Math.sin(angle) * (RADIUS * Math.random())
      );
      this.scene.add(mesh);
      arrows.push(mesh);
    }

    this._active.push({ ring, arrows, timer: DURATION });
  }
}
