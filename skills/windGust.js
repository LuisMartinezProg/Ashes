// skills/windGust.js — Habilidad: Ráfaga de Viento
import * as THREE from 'three';

const DAMAGE        = 35;
const SPEED         = 7.0;  // más rápido que fuego
const MAX_RANGE     = 22;   // más alcance
const EXPLOSION_DUR = 250;

export class WindGust {
  constructor(scene, player) {
    this.scene    = scene;
    this.player   = player;
    this.cooldown = 4;
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
    const target = this._findTarget(enemies);
    if (!target) return false;
    // Viento lanza 3 proyectiles en abanico
    this._spawnFan(target, enemies);
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
      p.mesh.rotation.y += delta * 10;

      let hit = false;
      for (const e of p.enemies) {
        if (e.isDead()) continue;
        const enemyCenter = e.mesh.position.clone().add(new THREE.Vector3(0, 0.8, 0));
        if (p.mesh.position.distanceTo(enemyCenter) < 1.0) {
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

  _spawnFan(target, enemies) {
    const baseDir = target.mesh.position.clone()
      .sub(this.player.position)
      .setY(0)
      .normalize();

    // 3 proyectiles: centro, -15°, +15°
    [-0.26, 0, 0.26].forEach(angle => {
      const dir = baseDir.clone().applyAxisAngle(
        new THREE.Vector3(0, 1, 0), angle
      );
      this._spawnOne(dir, enemies);
    });
  }

  _spawnOne(dir, enemies) {
    const geo  = new THREE.TorusGeometry(0.18, 0.06, 6, 8);
    const mat  = new THREE.MeshBasicMaterial({ color: 0xaaffee });
    const mesh = new THREE.Mesh(geo, mat);

    mesh.position.copy(this.player.position).add(new THREE.Vector3(0, 1.0, 0));
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
    projectile.mesh.scale.setScalar(2);
    projectile.mesh.material.color.setHex(0xeeffee);
  }

  _updateExplosion(projectile, delta, index) {
    projectile.explodeTimer -= delta * 1000;
    const t = Math.max(0, projectile.explodeTimer / EXPLOSION_DUR);
    projectile.mesh.scale.setScalar(2 + (1 - t));
    if (projectile.explodeTimer <= 0) {
      this.scene.remove(projectile.mesh);
      projectile.mesh.geometry.dispose();
      projectile.mesh.material.dispose();
      this._active.splice(index, 1);
    }
  }
}
