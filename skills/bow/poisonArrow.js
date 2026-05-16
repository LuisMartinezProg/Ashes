// skills/bow/poisonArrow.js — Flecha Envenenada (Arco)
import * as THREE from 'three';

const DAMAGE         = 20;
const POISON_DPS     = 8;
const POISON_DUR     = 5;
const SPEED          = 8.0;
const MAX_RANGE      = 25;
const MAX_CAST_RANGE = 20;
const EXPLOSION_DUR  = 300;

export class PoisonArrow {
  constructor(scene, player) {
    this.scene    = scene;
    this.player   = player;
    this.cooldown = 6;
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
      if (p.exploding) {
        p.explodeTimer -= delta * 1000;
        const t = Math.max(0, p.explodeTimer / EXPLOSION_DUR);
        p.mesh.scale.setScalar(1 + (1 - t) * 2);
        p.mesh.material.opacity = t * 0.6;
        if (p.explodeTimer <= 0) {
          this.scene.remove(p.mesh);
          p.mesh.geometry.dispose();
          p.mesh.material.dispose();
          this._active.splice(i, 1);
        }
        continue;
      }

      p.mesh.position.addScaledVector(p.direction, SPEED * delta);
      p.traveled += SPEED * delta;

      let hit = false;
      for (const e of p.enemies) {
        if (e.isDead() || !e.mesh) continue;
        const dx = p.mesh.position.x - e.mesh.position.x;
        const dz = p.mesh.position.z - e.mesh.position.z;
        if (Math.sqrt(dx*dx + dz*dz) < 1.2) {
          e.takeDamage(DAMAGE);
          e.applyBurn?.(POISON_DPS, POISON_DUR);
          hit = true;
          break;
        }
      }

      if (hit || p.traveled > MAX_RANGE) {
        p.exploding = true; p.explodeTimer = EXPLOSION_DUR;
        p.mesh.scale.setScalar(2);
        p.mesh.material.color.setHex(0x00ff44);
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
    const geo  = new THREE.CylinderGeometry(0.04, 0.04, 0.8, 5);
    const mat  = new THREE.MeshBasicMaterial({ color: 0x44ff44 });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.copy(this.player.position).add(new THREE.Vector3(0, 1.2, 0));
    const dir = new THREE.Vector3(
      target.mesh.position.x - mesh.position.x, 0,
      target.mesh.position.z - mesh.position.z
    ).normalize();
    mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);
    this.scene.add(mesh);
    this._active.push({ mesh, direction: dir, traveled: 0, enemies: [...enemies], exploding: false, explodeTimer: 0 });
  }
}
