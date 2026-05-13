// core/enemies/WanderingSpirit.js — Espíritu errante de la planicie
import * as THREE from 'three';
import { BaseEnemy, STATE } from './BaseEnemy.js';

export class WanderingSpirit extends BaseEnemy {
  constructor(scene, position, player) {
    super(scene, position, player, {
      hp           : 55,
      damage       : 12,
      roamSpeed    : 2.0,
      chaseSpeed   : 3.8,
      detectRange  : 9,
      attackRange  : 2.5,
      attackCooldown: 1.8,
      respawnTime  : 60,
      drops        : { magicEnergy: 15, xp: 35 },
    });
    this._floatOffset = Math.random() * Math.PI * 2;
    this._projectiles = [];
  }

  _buildMesh(pos) {
    this.mesh = new THREE.Group();

    const ghostMat = new THREE.MeshStandardMaterial({
      color: 0xAABBFF, transparent: true, opacity: 0.7,
      emissive: 0x4455AA, emissiveIntensity: 0.5,
    });

    // Cuerpo espectral
    const body = new THREE.Mesh(new THREE.SphereGeometry(0.35, 8, 8), ghostMat);
    body.scale.y = 1.5;
    body.position.y = 1.2;
    this.mesh.add(body);

    // Cola fantasma
    const tail = new THREE.Mesh(new THREE.ConeGeometry(0.25, 0.6, 6), ghostMat);
    tail.position.y = 0.6;
    tail.rotation.x = Math.PI;
    this.mesh.add(tail);

    this.mesh.position.set(pos.x, 0, pos.z);
    this._materials = [ghostMat];
  }

  update(delta) {
    super.update(delta);
    if (this.mesh) {
      this._floatOffset += delta * 1.8;
      this.mesh.position.y = 0.3 + Math.sin(this._floatOffset) * 0.25;
    }
    this._updateProjectiles(delta);
  }

  _updateAttack(delta) {
    if (!this.player) return;
    if (this._distToPlayer() > this._config.attackRange * 1.4) {
      this._state = STATE.CHASE;
      return;
    }
    this._attackTimer -= delta;
    if (this._attackTimer <= 0) {
      this._attackTimer = this._config.attackCooldown;
      this._shootMagic();
    }
  }

  _shootMagic() {
    if (!this.player || !this.mesh) return;
    const origin = this.mesh.position.clone();
    origin.y += 1.0;
    const dir = this.player.root.position.clone().sub(origin).normalize();
    const proj = new THREE.Mesh(
      new THREE.SphereGeometry(0.12, 5, 5),
      new THREE.MeshBasicMaterial({ color: 0x8888FF })
    );
    proj.position.copy(origin);
    this.scene.add(proj);
    this._projectiles.push({ mesh: proj, dir, speed: 6, life: 3 });
  }

  _updateProjectiles(delta) {
    for (let i = this._projectiles.length - 1; i >= 0; i--) {
      const p = this._projectiles[i];
      p.life -= delta;
      p.mesh.position.addScaledVector(p.dir, p.speed * delta);
      if (this.player) {
        const d = p.mesh.position.distanceTo(this.player.root.position);
        if (d < 1.0) {
          this.player.takeDamage?.(this._config.damage);
          this.scene.remove(p.mesh);
          this._projectiles.splice(i, 1);
          continue;
        }
      }
      if (p.life <= 0) {
        this.scene.remove(p.mesh);
        this._projectiles.splice(i, 1);
      }
    }
  }

  _startDeath() {
    for (const p of this._projectiles) this.scene.remove(p.mesh);
    this._projectiles = [];
    super._startDeath();
  }

  _restoreColors() {
    this._materials[0]?.color.setHex(0xAABBFF);
  }
}
