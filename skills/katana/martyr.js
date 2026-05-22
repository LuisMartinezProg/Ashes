// skills/katana/martyr.js — Mártir (Honor - Rara) | Ashes of the Reborn
import * as THREE from 'three';

const DAMAGE       = 120;
const SELF_DAMAGE  = 20;
const RADIUS       = 5.0;
const DURATION_VFX = 600;
const MAX_CAST_RANGE = 8;

export class Martyr {
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
    const targets = this._findTargets(enemies);
    if (targets.length === 0) return false;

    targets.forEach(e => e.takeDamage(DAMAGE));
    if (this.player.takeDamage) this.player.takeDamage(SELF_DAMAGE);

    this._spawnBurstVFX();
    this._spawnRingVFX();

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
      p.timer -= delta * 1000;
      const t = Math.max(0, p.timer / p.maxTimer);

      if (p.type === 'ring') {
        p.mesh.scale.setScalar(1 + (1 - t) * 2.5);
        p.mesh.material.opacity = t * 0.6;
      } else if (p.type === 'burst') {
        p.mesh.material.opacity = t * 0.85;
        p.mesh.scale.setScalar(1 + (1 - t) * 1.2);
      }

      if (p.timer <= 0) {
        this.scene.remove(p.mesh);
        p.mesh.geometry.dispose();
        p.mesh.material.dispose();
        this._active.splice(i, 1);
      }
    }
  }

  _findTargets(enemies) {
    return enemies.filter(e => {
      if (e.isDead() || !e.mesh) return false;
      const dx = this.player.position.x - e.mesh.position.x;
      const dz = this.player.position.z - e.mesh.position.z;
      return Math.sqrt(dx * dx + dz * dz) <= MAX_CAST_RANGE;
    });
  }

  _spawnBurstVFX() {
    const geo  = new THREE.SphereGeometry(RADIUS * 0.6, 10, 10);
    const mat  = new THREE.MeshBasicMaterial({ color: 0xffdd44, transparent: true, opacity: 0.85 });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.copy(this.player.position).add(new THREE.Vector3(0, 1.0, 0));
    this.scene.add(mesh);
    this._active.push({ type: 'burst', mesh, timer: DURATION_VFX, maxTimer: DURATION_VFX });
  }

  _spawnRingVFX() {
    const geo  = new THREE.RingGeometry(0.1, RADIUS, 16);
    const mat  = new THREE.MeshBasicMaterial({ color: 0xffaa00, transparent: true, opacity: 0.6, side: THREE.DoubleSide });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.copy(this.player.position).add(new THREE.Vector3(0, 0.05, 0));
    mesh.rotation.x = -Math.PI / 2;
    this.scene.add(mesh);
    this._active.push({ type: 'ring', mesh, timer: DURATION_VFX, maxTimer: DURATION_VFX });
  }
          }
