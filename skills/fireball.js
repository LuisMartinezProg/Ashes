// skills/fireball.js — Habilidad: Bola de Fuego
import * as THREE from 'three';

const DAMAGE        = 55;
const SPEED         = 4.5;
const MAX_RANGE     = 20;
const EXPLOSION_DUR = 400;

export class Fireball {
  constructor(scene, player) {
    this.scene    = scene;
    this.player   = player;
    this.cooldown = 5;
    this._timer   = 0;
    this._active  = [];
    this._enemies = []; // se asigna desde skillSystem
    this.onCooldownUpdate = null;
  }

  isReady() { return this._timer <= 0; }

  getCooldownProgress() {
    return Math.min(1, 1 - this._timer / this.cooldown);
  }

  cast(enemies) {
    if (!this.isReady()) return false;
    this._enemies = enemies;
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

      if (p.exploding) {
        this._updateExplosion(p, delta, i);
        continue;
      }

      p.mesh.position.addScaledVector(p.direction, SPEED * delta);
      p.traveled += SPEED * delta;
      p.mesh.rotation.x += delta * 3;
      p.mesh.rotation.y += delta * 2;

      let hit = false;
      for (const e of p.enemies) {
        if (e.isDead()) continue;
        if (p.mesh.position.distanceTo(e.mesh.position) < 0.8) {
          e.takeDamage(DAMAGE);
          hit = true;
          break;
        }
      }

      if (hit || p.traveled > MAX_RANGE) {
        this._explode(p, i);
      }
    }
  }

  _findTarget(enemies) {
    let closest = null, minDist = Infinity;
    for (const e of enemies) {
      if (e.isDead()) continue;
      const d = this.player.position.distanceTo(e.mesh.position);
      if (d < minDist) { minDist = d; closest = e; }
    }
    return closest;
  }

  _spawnProjectile(target, enemies) {
    const geo = new THREE.SphereGeometry(0.22, 10, 10);
    const mat = new THREE.MeshBasicMaterial({ color: 0xFF4400 });
    const mesh = new THREE.Mesh(geo, mat);

    const haloGeo = new THREE.SphereGeometry(0.35, 8, 8);
    const haloMat = new THREE.MeshBasicMaterial({
      color: 0xFF8800, transparent: true, opacity: 0.4,
    });
    mesh.add(new THREE.Mesh(haloGeo, haloMat));

    mesh.position.copy(this.player.position).add(new THREE.Vector3(0, 1.0, 0));

    const dir = target.mesh.position.clone()
      .sub(mesh.position)
      .setY(0)
      .normalize();

    this.scene.add(mesh);

    this._active.push({
      mesh,
      direction   : dir,
      traveled    : 0,
      enemies     : [...enemies],
      exploding   : false,
      explodeTimer: 0,
    });
  }

  _explode(projectile, index) {
    projectile.exploding    = true;
    projectile.explodeTimer = EXPLOSION_DUR;
    projectile.mesh.scale.setScalar(3);
    projectile.mesh.material.color.setHex(0xFFAA00);
  }

  _updateExplosion(projectile, delta, index) {
    projectile.explodeTimer -= delta * 1000;
    const t = Math.max(0, projectile.explodeTimer / EXPLOSION_DUR);
    projectile.mesh.scale.setScalar(3 + (1 - t) * 2);
    if (projectile.explodeTimer <= 0) {
      this.scene.remove(projectile.mesh);
      projectile.mesh.geometry.dispose();
      projectile.mesh.material.dispose();
      this._active.splice(index, 1);
    }
  }
}
