// core/enemies/bear.js — Oso mini-jefe del bosque
import * as THREE from 'three';
import { BaseEnemy, STATE } from './BaseEnemy.js';

const BEAR_HP         = 300;
const MAGIC_HP_THRESH = 0.4;
const RESPAWN_TIME    = 300;

export class Bear extends BaseEnemy {
  constructor(scene, position, player, onWolvesEvent) {
    super(scene, position, player, {
      hp            : BEAR_HP,
      damage        : 18,
      attackRange   : 2.2,
      detectRange   : 8,
      chaseSpeed    : 2.8,
      roamSpeed     : 1.0,
      attackCooldown: 1.8,
      deathDuration : 1200,
      respawnTime   : RESPAWN_TIME,
    });
    this.onWolvesEvent = onWolvesEvent;
    this._magicPhase   = false;
    this._magicTimer   = 0;
    this._activated    = false;
    this._projectiles  = [];
  }

  _buildMesh(pos) {
    this.mesh = new THREE.Group();
    const bodyMat = new THREE.MeshStandardMaterial({ color: 0x3A2A1A, roughness: 0.95 });
    const headMat = new THREE.MeshStandardMaterial({ color: 0x4A3A2A, roughness: 0.95 });

    const body = new THREE.Mesh(new THREE.BoxGeometry(1.4, 1.2, 2.0), bodyMat);
    body.position.y = 1.0;
    this.mesh.add(body);

    const head = new THREE.Mesh(new THREE.SphereGeometry(0.55, 8, 8), headMat);
    head.position.set(0, 1.8, 0.8);
    this.mesh.add(head);

    [-0.4, 0.4].forEach(ex => {
      const ear = new THREE.Mesh(new THREE.SphereGeometry(0.18, 6, 6), bodyMat);
      ear.position.set(ex, 2.2, 0.6);
      this.mesh.add(ear);
    });

    const legGeo = new THREE.BoxGeometry(0.35, 0.9, 0.35);
    [-0.5, 0.5].forEach(lx => {
      [0.6, -0.6].forEach(lz => {
        const leg = new THREE.Mesh(legGeo, bodyMat);
        leg.position.set(lx, 0.45, lz);
        this.mesh.add(leg);
      });
    });

    this.mesh.position.set(pos.x, 0, pos.z);
    this._materials = [bodyMat, headMat];
  }

  _restoreColors() {
    this._materials[0]?.color.setHex(0x3A2A1A);
    this._materials[1]?.color.setHex(0x4A3A2A);
  }

  isDead() { return this.dead; }

  activate() {
    this._activated = true;
    this._state = STATE.CHASE;
    if (this.onWolvesEvent) this.onWolvesEvent();
  }

  takeDamage(amount) {
    if (!this._activated) this.activate();
    if (!this._magicPhase && this.hp / this.maxHp <= MAGIC_HP_THRESH) {
      this._magicPhase = true;
      this._state = 'magic';
    }
    super.takeDamage(amount);
  }

  update(delta) {
    if (!this.mesh && this.dead) {
      this._respawnTimer -= delta;
      if (this._respawnTimer <= 0) this._respawn();
      return;
    }
    if (!this.mesh || this.dead || !this._activated) return;
    if (this._dying) { this._updateDeathAnim(delta); return; }

    this._updateProjectiles(delta);

    if (this._state === 'magic') {
      this._updateMagic(delta);
    } else {
      super.update(delta);
    }
  }

  _updateMagic(delta) {
    if (!this.player) return;
    this._magicTimer -= delta;
    const dist = this._distTo(this.player.root.position);
    if (dist > 2.2) this._moveTo(this.player.root.position, 1.5, delta);
    if (this._magicTimer <= 0) {
      this._magicTimer = 2.5;
      this._shootMagic();
    }
    if (dist < 2.2) {
      this._attackTimer -= delta;
      if (this._attackTimer <= 0) {
        this._attackTimer = 2.0;
        this.player.takeDamage?.(14);
      }
    }
  }

  _shootMagic() {
    if (!this.player || !this.mesh) return;
    const origin = this.mesh.position.clone();
    origin.y = 1.5;
    const dir = this.player.root.position.clone().sub(origin).normalize();
    const proj = new THREE.Mesh(
      new THREE.SphereGeometry(0.2, 6, 6),
      new THREE.MeshBasicMaterial({ color: 0x8800ff })
    );
    proj.position.copy(origin);
    this.scene.add(proj);
    this._projectiles.push({ mesh: proj, dir, speed: 8, life: 3 });
  }

  _updateProjectiles(delta) {
    for (let i = this._projectiles.length - 1; i >= 0; i--) {
      const p = this._projectiles[i];
      p.life -= delta;
      p.mesh.position.addScaledVector(p.dir, p.speed * delta);
      if (this.player) {
        const d = p.mesh.position.distanceTo(this.player.root.position);
        if (d < 1.2) {
          this.player.takeDamage?.(12);
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

  _respawn() {
    this._magicPhase = false;
    this._activated  = false;
    const newPos = {
      x: this._spawnPos.x + (Math.random() - 0.5) * 20,
      z: this._spawnPos.z - 20,
    };
    this._spawnPos = newPos;
    super._respawn();
  }
}
