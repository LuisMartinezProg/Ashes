// skills/bow/arrowStorm.js — Tormenta de Flechas (Lluvia - Épica)
import * as THREE from 'three';

const DAMAGE         = 55;
const ARROW_COUNT    = 8;
const WAVES          = 3;
const WAVE_DELAY     = 250;
const SPREAD_ANGLE   = 0.28;
const SPEED          = 18.0;
const MAX_RANGE      = 32;
const MAX_CAST_RANGE = 30;
const DURATION_VFX   = 500;

export class ArrowStorm {
  constructor(scene, player) {
    this.scene    = scene;
    this.player   = player;
    this.cooldown = 18;
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
    for (let w = 0; w < WAVES; w++) {
      setTimeout(() => this._spawnVolley(target, enemies), w * WAVE_DELAY);
    }
    this._spawnChargeVFX();
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
      const p = this._active[i];

      if (p.type === 'vfx' || p.type === 'ring') {
        p.timer -= delta * 1000;
        const t = Math.max(0, p.timer / p.maxTimer);
        p.mesh.material.opacity = t * 0.7;
        if (p.type === 'ring') p.mesh.scale.setScalar(1 + (1 - t) * 1.5);
        if (p.timer <= 0) {
          this.scene.remove(p.mesh);
          p.mesh.geometry.dispose();
          p.mesh.material.dispose();
          this._active.splice(i, 1);
        }
        continue;
      }

      p.mesh.position.addScaledVector(p.direction, SPEED * delta);
      p.traveled += SPEED * delta;

      for (const e of p.enemies) {
        if (e.isDead() || !e.mesh || p.hit.has(e)) continue;
        const dx = p.mesh.position.x - e.mesh.position.x;
        const dz = p.mesh.position.z - e.mesh.position.z;
        if (Math.sqrt(dx * dx + dz * dz) < 1.0) {
          e.takeDamage(DAMAGE);
          p.hit.add(e);
        }
      }

      if (p.traveled > MAX_RANGE) {
        this.scene.remove(p.mesh);
        p.mesh.geometry.dispose();
        p.mesh.material.dispose();
        this._active.splice(i, 1);
      }
    }
  }

  _findTarget(enemies) {
    let closest = null, minDist = Infinity;
    for (const e of enemies) {
      if (e.isDead() || !e.mesh) continue;
      const dx = this.player.position.x - e.mesh.position.x;
      const dz = this.player.position.z - e.mesh.position.z;
      const d  = Math.sqrt(dx * dx + dz * dz);
      if (d < minDist && d < MAX_CAST_RANGE) { minDist = d; closest = e; }
    }
    return closest;
  }

  _spawnVolley(target, enemies) {
    const origin = this.player.position.clone().add(new THREE.Vector3(0, 1.2, 0));
    const baseDir = new THREE.Vector3(
      target.mesh.position.x - origin.x, 0,
      target.mesh.position.z - origin.z
    ).normalize();

    for (let i = 0; i < ARROW_COUNT; i++) {
      const angle = (i - Math.floor(ARROW_COUNT / 2)) * SPREAD_ANGLE;
      const dir = baseDir.clone().applyAxisAngle(new THREE.Vector3(0, 1, 0), angle);
      const geo  = new THREE.CylinderGeometry(0.035, 0.035, 1.3, 4);
      const mat  = new THREE.MeshBasicMaterial({ color: 0x5599ff });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.copy(origin);
      mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);
      this.scene.add(mesh);
      this._active.push({ type: 'arrow', mesh, direction: dir, traveled: 0, enemies: [...enemies], hit: new Set() });
    }

    // Anillo por oleada
    const rGeo = new THREE.RingGeometry(0.2, 0.7, 10);
    const rMat = new THREE.MeshBasicMaterial({ color: 0x5599ff, transparent: true, opacity: 0.6, side: THREE.DoubleSide });
    const ring = new THREE.Mesh(rGeo, rMat);
    ring.position.copy(this.player.position).add(new THREE.Vector3(0, 0.05, 0));
    ring.rotation.x = -Math.PI / 2;
    this.scene.add(ring);
    this._active.push({ type: 'ring', mesh: ring, timer: 400, maxTimer: 400 });
  }

  _spawnChargeVFX() {
    const geo  = new THREE.SphereGeometry(0.42, 10, 10);
    const mat  = new THREE.MeshBasicMaterial({ color: 0x5599ff, transparent: true, opacity: 0.8 });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.copy(this.player.position).add(new THREE.Vector3(0, 1.2, 0));
    this.scene.add(mesh);
    this._active.push({ type: 'vfx', mesh, timer: DURATION_VFX, maxTimer: DURATION_VFX });
  }
}
