// skills/iceShard.js — Habilidad: Fragmento de Hielo
import * as THREE from 'three';

const DAMAGE         = 45;
const SPEED          = 5.5;
const MAX_RANGE      = 18;
const MAX_CAST_RANGE = 14;
const EXPLOSION_DUR  = 300;

export class IceShard {
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
    const target = this._findTarget(enemies);
    if (!target) return false;
    this._spawnProjectile(target, enemies);
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
      if (p.exploding) { this._updateExplosion(p, delta, i); continue; }

      p.mesh.position.addScaledVector(p.direction, SPEED * delta);
      p.traveled += SPEED * delta;
      p.mesh.rotation.z += delta * 8;

      let hit = false;
      for (const e of p.enemies) {
        if (e.isDead() || !e.mesh) continue;
        const dx = p.mesh.position.x - e.mesh.position.x;
        const dz = p.mesh.position.z - e.mesh.position.z;
        if (Math.sqrt(dx*dx + dz*dz) < 1.2) {
          e.takeDamage(DAMAGE);
          e.applySlow?.(0.4, 3);
          hit = true;
          break;
        }
      }
      if (hit || p.traveled > MAX_RANGE) this._explode(p, i);
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

  _spawnProjectile(target, enemies) {
    const geo  = new THREE.ConeGeometry(0.15, 0.6, 6);
    const mat  = new THREE.MeshBasicMaterial({ color: 0x88ddff });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.add(new THREE.Mesh(
      new THREE.SphereGeometry(0.28, 8, 8),
      new THREE.MeshBasicMaterial({ color: 0xaaeeff, transparent: true, opacity: 0.35 })
    ));
    mesh.position.copy(this.player.position).add(new THREE.Vector3(0, 1.0, 0));
    const dir = new THREE.Vector3(
      target.mesh.position.x - mesh.position.x, 0,
      target.mesh.position.z - mesh.position.z
    ).normalize();
    this.scene.add(mesh);
    this._active.push({ mesh, direction: dir, traveled: 0, enemies: [...enemies], exploding: false, explodeTimer: 0 });
  }

  _explode(p, i) {
    p.exploding = true; p.explodeTimer = EXPLOSION_DUR;
    p.mesh.scale.setScalar(2.5);
    p.mesh.material.color.setHex(0xcceeff);
  }

  _updateExplosion(p, delta, i) {
    p.explodeTimer -= delta * 1000;
    p.mesh.scale.setScalar(2.5 + (1 - Math.max(0, p.explodeTimer / EXPLOSION_DUR)) * 1.5);
    if (p.explodeTimer <= 0) {
      this.scene.remove(p.mesh);
      p.mesh.geometry.dispose();
      p.mesh.material.dispose();
      this._active.splice(i, 1);
    }
  }
}
