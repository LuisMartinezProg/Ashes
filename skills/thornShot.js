// skills/thornShot.js — Habilidad: Espina (Planta)
import * as THREE from 'three';

const DAMAGE        = 50;
const SPEED         = 4.0;  // más lento pero más daño
const MAX_RANGE     = 15;
const EXPLOSION_DUR = 500;  // más duración al impactar

export class ThornShot {
  constructor(scene, player) {
    this.scene    = scene;
    this.player   = player;
    this.cooldown = 6;
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
      // Sin rotación — va recto como una espina

      let hit = false;
      for (const e of p.enemies) {
        if (e.isDead()) continue;
        const enemyCenter = e.mesh.position.clone().add(new THREE.Vector3(0, 0.8, 0));
        if (p.mesh.position.distanceTo(enemyCenter) < 1.2) {
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
    // Forma alargada como espina
    const geo  = new THREE.CylinderGeometry(0.08, 0.22, 0.7, 6);
    const mat  = new THREE.MeshBasicMaterial({ color: 0x44aa22 });
    const mesh = new THREE.Mesh(geo, mat);

    // Halo verde
    const haloGeo = new THREE.SphereGeometry(0.3, 8, 8);
    const haloMat = new THREE.MeshBasicMaterial({
      color: 0x88ff44, transparent: true, opacity: 0.3,
    });
    mesh.add(new THREE.Mesh(haloGeo, haloMat));

    mesh.position.copy(this.player.position).add(new THREE.Vector3(0, 1.0, 0));

    const dir = target.mesh.position.clone()
      .sub(mesh.position)
      .setY(0)
      .normalize();

    // Orientar la espina en dirección de movimiento
    mesh.quaternion.setFromUnitVectors(
      new THREE.Vector3(0, 1, 0),
      new THREE.Vector3(dir.x, 0, dir.z).normalize()
    );

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
    projectile.mesh.material.color.setHex(0x228800);
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
