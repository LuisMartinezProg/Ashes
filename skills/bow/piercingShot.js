// skills/bow/piercingShot.js — Flecha Perforante (Arco)
import * as THREE from 'three';

const DAMAGE         = 60;
const SPEED          = 10.0;
const MAX_RANGE      = 30;
const MAX_CAST_RANGE = 25;

export class PiercingShot {
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
    const target = this._findTarget(enemies);
    if (!target) return false;
    this._spawnArrow(target, enemies);
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
      p.mesh.position.addScaledVector(p.direction, SPEED * delta);
      p.traveled += SPEED * delta;

      for (const e of p.enemies) {
        if (e.isDead() || !e.mesh || p.hit.has(e)) continue;
        const dx = p.mesh.position.x - e.mesh.position.x;
        const dz = p.mesh.position.z - e.mesh.position.z;
        if (Math.sqrt(dx*dx + dz*dz) < 1.2) {
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
      const d  = Math.sqrt(dx*dx + dz*dz);
      if (d < minDist && d < MAX_CAST_RANGE) { minDist = d; closest = e; }
    }
    return closest;
  }

  _spawnArrow(target, enemies) {
    const geo  = new THREE.CylinderGeometry(0.04, 0.04, 0.9, 5);
    const mat  = new THREE.MeshBasicMaterial({ color: 0xddaa44 });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.copy(this.player.position).add(new THREE.Vector3(0, 1.2, 0));
    const dir = new THREE.Vector3(
      target.mesh.position.x - mesh.position.x, 0,
      target.mesh.position.z - mesh.position.z
    ).normalize();
    mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);
    this.scene.add(mesh);
    this._active.push({ mesh, direction: dir, traveled: 0, enemies: [...enemies], hit: new Set() });
  }
}
