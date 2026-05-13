// core/enemies/CrystalSpider.js — Araña de cristal
import * as THREE from 'three';
import { BaseEnemy } from './BaseEnemy.js';

export class CrystalSpider extends BaseEnemy {
  constructor(scene, position, player) {
    super(scene, position, player, {
      hp           : 35,
      damage       : 9,
      roamSpeed    : 2.0,
      chaseSpeed   : 4.0,
      detectRange  : 5,
      attackRange  : 1.3,
      attackCooldown: 1.2,
      respawnTime  : 35,
      drops        : { magicEnergy: 5, xp: 18, piedra: 1 },
    });
  }

  _buildMesh(pos) {
    this.mesh = new THREE.Group();

    const bodyMat = new THREE.MeshStandardMaterial({
      color: 0x88CCFF, roughness: 0.1, metalness: 0.6,
      transparent: true, opacity: 0.85,
    });

    // Cuerpo
    const body = new THREE.Mesh(new THREE.SphereGeometry(0.28, 7, 7), bodyMat);
    body.position.y = 0.35;
    this.mesh.add(body);

    // Cabeza
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.18, 6, 6), bodyMat);
    head.position.set(0, 0.35, 0.3);
    this.mesh.add(head);

    // Patas (8)
    const legMat = new THREE.MeshStandardMaterial({ color: 0x6699CC, roughness: 0.2 });
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const leg   = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.02, 0.5, 4), legMat);
      leg.position.set(Math.cos(angle) * 0.35, 0.2, Math.sin(angle) * 0.35);
      leg.rotation.z = Math.PI * 0.35;
      leg.rotation.y = angle;
      this.mesh.add(leg);
    }

    // Ojos rojos
    const eyeMat = new THREE.MeshBasicMaterial({ color: 0xFF2222 });
    [-0.08, 0.08].forEach(ex => {
      const eye = new THREE.Mesh(new THREE.SphereGeometry(0.04, 4, 4), eyeMat);
      eye.position.set(ex, 0.42, 0.44);
      this.mesh.add(eye);
    });

    this.mesh.position.set(pos.x, 0, pos.z);
    this._materials = [bodyMat, legMat];
  }

  _restoreColors() {
    this._materials[0]?.color.setHex(0x88CCFF);
    this._materials[1]?.color.setHex(0x6699CC);
  }
}
