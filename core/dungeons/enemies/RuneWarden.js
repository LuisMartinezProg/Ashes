// core/dungeons/enemies/RuneWarden.js — Ashes of the Reborn | Valiant Gaming
import * as THREE from 'three';
import { BaseEnemy, STATE } from '../../enemies/BaseEnemy.js';

const TELEPORT_COOLDOWN = 4.0;
const PROJECTILE_SPEED  = 7.0;
const PROJECTILE_DAMAGE = 10;

export class RuneWarden extends BaseEnemy {
  constructor(scene, position, player) {
    super(scene, position, player, {
      hp            : 85,
      damage        : 10,
      roamSpeed     : 2.0,
      chaseSpeed    : 3.2,
      detectRange   : 12,
      attackRange   : 8.0,
      attackCooldown: 2.5,
      respawnTime   : 0,
      deathDuration : 600,
      name          : 'Guardián de Runas',
      drops         : { magicEnergy: 15, xp: 45 },
    });
    this._teleportTimer  = TELEPORT_COOLDOWN;
    this._projectiles    = [];
    this._orbAngle       = 0;
  }

  _buildMesh(pos) {
    this.mesh = new THREE.Group();

    // Cuerpo flotante
    const bodyMat = new THREE.MeshStandardMaterial({
      color    : 0x882299,
      emissive : 0x551166,
      emissiveIntensity: 0.6,
      roughness: 0.2,
      metalness: 0.3,
      transparent: true,
      opacity  : 0.9,
    });
    const body = new THREE.Mesh(new THREE.SphereGeometry(0.32, 12, 12), bodyMat);
    body.position.y = 1.1;
    this.mesh.add(body);
    this._bodyMesh = body;

    // Orbes giratorios
    const orbMat = new THREE.MeshBasicMaterial({ color: 0xcc44ff });
    this._orbs = [];
    for (let i = 0; i < 3; i++) {
      const orb = new THREE.Mesh(new THREE.SphereGeometry(0.1, 8, 8), orbMat.clone());
      orb.position.y = 1.1;
      this.mesh.add(orb);
      this._orbs.push(orb);
    }

    // Luz
    const light = new THREE.PointLight(0xcc44ff, 1.5, 6);
    light.position.y = 1.2;
    this.mesh.add(light);
    this._light = light;

    this.mesh.position.set(pos.x, 0, pos.z);
    this._materials = [bodyMat];
  }

  update(delta) {
    super.update(delta);
    if (!this.mesh || this.dead) return;

    // Orbes giratorios
    this._orbAngle += delta * 2.5;
    for (let i = 0; i < this._orbs.length; i++) {
      const angle = this._orbAngle + (i / this._orbs.length) * Math.PI * 2;
      this._orbs[i].position.x = Math.cos(angle) * 0.65;
      this._orbs[i].position.z = Math.sin(angle) * 0.65;
      this._orbs[i].position.y = 1.1 + Math.sin(angle * 2) * 0.15;
    }

    // Flotar
    if (this._bodyMesh) {
      this._bodyMesh.position.y = 1.1 + Math.sin(Date.now() * 0.002) * 0.12;
    }

    // Teleporte
    this._teleportTimer -= delta;
    if (this._teleportTimer <= 0) {
      this._teleport();
      this._teleportTimer = TELEPORT_COOLDOWN;
    }

    // Actualizar proyectiles
    this._updateProjectiles(delta);
  }

  _teleport() {
    if (!this.mesh) return;
    const target = this._getActivePosition();
    const angle  = Math.random() * Math.PI * 2;
    const dist   = 4 + Math.random() * 3;
    const nx     = target.x + Math.cos(angle) * dist;
    const nz     = target.z + Math.sin(angle) * dist;

    // VFX desvanecimiento
    this._materials[0].opacity = 0;
    setTimeout(() => {
      if (!this.mesh) return;
      this.mesh.position.set(nx, 0, nz);
      this._materials[0].opacity = 0.9;
    }, 200);
  }

  _onAttackVFX() {
    this._launchProjectile();
  }

  _launchProjectile() {
    if (!this.mesh) return;
    const target = this._getActivePosition();
    const ox     = this.mesh.position.x;
    const oz     = this.mesh.position.z;
    const dx     = target.x - ox;
    const dz     = target.z - oz;
    const len    = Math.sqrt(dx*dx + dz*dz);
    if (len < 0.01) return;

    const geo = new THREE.SphereGeometry(0.18, 8, 8);
    const mat = new THREE.MeshBasicMaterial({
      color      : 0xcc44ff,
      transparent: true,
      opacity    : 0.9,
    });
    const m = new THREE.Mesh(geo, mat);
    m.position.set(ox, 1.1, oz);
    this.scene.add(m);

    // Luz del proyectil
    const light = new THREE.PointLight(0xcc44ff, 1, 3);
    m.add(light);

    this._projectiles.push({
      mesh: m,
      dx  : dx / len,
      dz  : dz / len,
      life: 3.0,
    });
  }

  _updateProjectiles(delta) {
    const player = window._partyManager?.getActiveCharacter()
                ?? window._player;

    for (let i = this._projectiles.length - 1; i >= 0; i--) {
      const p = this._projectiles[i];
      p.life -= delta;
      p.mesh.position.x += p.dx * PROJECTILE_SPEED * delta;
      p.mesh.position.z += p.dz * PROJECTILE_SPEED * delta;

      if (player) {
        const pos = player.root?.position ?? player.position;
        const dx  = pos.x - p.mesh.position.x;
        const dz  = pos.z - p.mesh.position.z;
        if (Math.sqrt(dx*dx + dz*dz) < 0.5) {
          player.takeDamage?.(PROJECTILE_DAMAGE);
          p.life = 0;
        }
      }

      if (p.life <= 0) {
        this.scene.remove(p.mesh);
        p.mesh.geometry.dispose();
        p.mesh.material.dispose();
        this._projectiles.splice(i, 1);
      }
    }
  }

  _restoreColors() {
    this._materials[0]?.color.setHex(0x882299);
    this._materials[0]?.emissive?.setHex(0x551166);
  }

  _startDeath() {
    for (const p of this._projectiles) this.scene.remove(p.mesh);
    this._projectiles = [];
    super._startDeath();
  }
}
