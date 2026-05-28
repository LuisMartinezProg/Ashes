// core/dungeons/enemies/AncientSentinel.js — Ashes of the Reborn | Valiant Gaming
import * as THREE from 'three';
import { BaseEnemy, STATE } from '../../enemies/BaseEnemy.js';

const SLOW_RADIUS   = 4.0;
const SLOW_FACTOR   = 0.45;
const SLAM_RANGE    = 3.0;
const SLAM_DAMAGE   = 22;
const SLAM_COOLDOWN = 3.5;

export class AncientSentinel extends BaseEnemy {
  constructor(scene, position, player) {
    super(scene, position, player, {
      hp            : 220,
      damage        : 18,
      roamSpeed     : 1.0,
      chaseSpeed    : 2.2,
      detectRange   : 10,
      attackRange   : 2.2,
      attackCooldown: 2.8,
      respawnTime   : 0,
      deathDuration : 900,
      name          : 'Centinela Antiguo',
      drops         : { magicEnergy: 25, xp: 80, hierro: 3 },
    });
    this._slamTimer   = SLAM_COOLDOWN;
    this._auraAngle   = 0;
    this._auraRings   = [];
  }

  _buildMesh(pos) {
    this.mesh = new THREE.Group();

    // Cuerpo grande
    const bodyMat = new THREE.MeshStandardMaterial({
      color    : 0x334433,
      emissive : 0x112211,
      emissiveIntensity: 0.4,
      roughness: 0.6,
      metalness: 0.5,
    });
    const body = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.55, 1.6, 10), bodyMat);
    body.position.y = 0.8;
    this.mesh.add(body);

    // Cabeza masiva
    const headMat = new THREE.MeshStandardMaterial({
      color    : 0x223322,
      emissive : 0x111811,
      emissiveIntensity: 0.3,
      roughness: 0.5,
      metalness: 0.6,
    });
    const head = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.55, 0.65), headMat);
    head.position.y = 1.88;
    this.mesh.add(head);

    // Brazos
    const armMat = bodyMat.clone();
    for (const side of [-1, 1]) {
      const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.2, 1.0, 8), armMat);
      arm.position.set(side * 0.72, 1.0, 0);
      arm.rotation.z = side * 0.3;
      this.mesh.add(arm);
    }

    // Aura de ralentización
    const auraMat = new THREE.MeshBasicMaterial({
      color      : 0x44aa44,
      transparent: true,
      opacity    : 0.15,
      side       : THREE.DoubleSide,
    });
    const aura = new THREE.Mesh(new THREE.CylinderGeometry(SLOW_RADIUS, SLOW_RADIUS, 0.1, 24), auraMat);
    aura.position.y = 0.05;
    this.mesh.add(aura);
    this._auraMesh = aura;

    // Anillos de aura
    for (let i = 0; i < 2; i++) {
      const ringGeo = new THREE.RingGeometry(SLOW_RADIUS - 0.3 - i * 0.6, SLOW_RADIUS - i * 0.6, 24);
      const ringMat = new THREE.MeshBasicMaterial({
        color      : 0x44cc44,
        transparent: true,
        opacity    : 0.25,
        side       : THREE.DoubleSide,
      });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.rotation.x = -Math.PI / 2;
      ring.position.y = 0.06 + i * 0.02;
      this.mesh.add(ring);
      this._auraRings.push(ring);
    }

    // Luz verde
    const light = new THREE.PointLight(0x44aa44, 1.5, 8);
    light.position.y = 1.5;
    this.mesh.add(light);
    this._light = light;

    this.mesh.position.set(pos.x, 0, pos.z);
    this._materials = [bodyMat, headMat, armMat];
  }

  update(delta) {
    super.update(delta);
    if (!this.mesh || this.dead) return;

    // Pulsar aura
    this._auraAngle += delta * 1.2;
    const pulse = Math.sin(this._auraAngle) * 0.5 + 0.5;
    if (this._auraMesh) {
      this._auraMesh.material.opacity = 0.1 + pulse * 0.1;
    }
    for (const ring of this._auraRings) {
      ring.rotation.z += delta * (0.5 + pulse * 0.3);
      ring.material.opacity = 0.15 + pulse * 0.15;
    }
    if (this._light) {
      this._light.intensity = 1.2 + pulse * 0.8;
    }

    // Aplicar slow al jugador si está en rango
    this._applySlowAura();

    // Golpe de área
    this._slamTimer -= delta;
    if (this._slamTimer <= 0) {
      this._slamTimer = SLAM_COOLDOWN;
      this._groundSlam();
    }
  }

  _applySlowAura() {
    if (!this.mesh) return;
    const player = window._partyManager?.getActiveCharacter()
                ?? window._player;
    if (!player) return;

    const pos = player.root?.position ?? player.position;
    const dx  = pos.x - this.mesh.position.x;
    const dz  = pos.z - this.mesh.position.z;
    const dist = Math.sqrt(dx*dx + dz*dz);

    if (dist < SLOW_RADIUS) {
      player.applySlow?.(SLOW_FACTOR, 0.5);
    }
  }

  _groundSlam() {
    if (!this.mesh) return;
    const target = this._getActivePosition();
    const dx     = target.x - this.mesh.position.x;
    const dz     = target.z - this.mesh.position.z;
    if (Math.sqrt(dx*dx + dz*dz) > SLAM_RANGE) return;

    // VFX onda en el suelo
    const geo = new THREE.RingGeometry(0.1, 0.2, 16);
    const mat = new THREE.MeshBasicMaterial({
      color      : 0x44ff44,
      transparent: true,
      opacity    : 0.8,
      side       : THREE.DoubleSide,
    });
    const ring = new THREE.Mesh(geo, mat);
    ring.rotation.x = -Math.PI / 2;
    ring.position.set(this.mesh.position.x, 0.08, this.mesh.position.z);
    this.scene.add(ring);

    const start = performance.now();
    const expand = () => {
      const t = (performance.now() - start) / 600;
      ring.scale.setScalar(1 + t * 12);
      ring.material.opacity = Math.max(0, 0.8 - t);
      if (t < 1) requestAnimationFrame(expand);
      else { this.scene.remove(ring); geo.dispose(); mat.dispose(); }
    };
    requestAnimationFrame(expand);

    // Daño
    const player = window._partyManager?.getActiveCharacter()
                ?? window._player;
    if (player) {
      const pos  = player.root?.position ?? player.position;
      const ddx  = pos.x - this.mesh.position.x;
      const ddz  = pos.z - this.mesh.position.z;
      if (Math.sqrt(ddx*ddx + ddz*ddz) < SLAM_RANGE) {
        player.takeDamage?.(SLAM_DAMAGE);
      }
    }
  }

  _restoreColors() {
    this._materials[0]?.color.setHex(0x334433);
    this._materials[1]?.color.setHex(0x223322);
  }
}
