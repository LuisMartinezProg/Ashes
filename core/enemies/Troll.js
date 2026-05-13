// core/enemies/Troll.js — Troll del bosque
import * as THREE from 'three';
import { BaseEnemy } from './BaseEnemy.js';

export class Troll extends BaseEnemy {
  constructor(scene, position, player) {
    super(scene, position, player, {
      hp           : 120,
      damage       : 18,
      roamSpeed    : 1.0,
      chaseSpeed   : 2.8,
      detectRange  : 6,
      attackRange  : 2.0,
      attackCooldown: 2.2,
      respawnTime  : 90,
      drops        : { madera: 5, piedra: 3, magicEnergy: 6, xp: 40 },
    });
  }

  _buildMesh(pos) {
    this.mesh = new THREE.Group();

    const bodyMat = new THREE.MeshStandardMaterial({ color: 0x4A7A3A, roughness: 0.95 });
    const skinMat = new THREE.MeshStandardMaterial({ color: 0x3A6A2A, roughness: 0.9 });

    // Cuerpo grande
    const body = new THREE.Mesh(new THREE.BoxGeometry(1.0, 1.4, 0.8), bodyMat);
    body.position.y = 1.1;
    this.mesh.add(body);

    // Cabeza grande
    const head = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.7, 0.7), skinMat);
    head.position.y = 2.15;
    this.mesh.add(head);

    // Brazos largos
    const armGeo = new THREE.BoxGeometry(0.3, 1.1, 0.3);
    [-0.65, 0.65].forEach(ax => {
      const arm = new THREE.Mesh(armGeo, bodyMat);
      arm.position.set(ax, 1.1, 0);
      arm.rotation.z = ax > 0 ? -0.3 : 0.3;
      this.mesh.add(arm);
    });

    // Piernas
    const legGeo = new THREE.BoxGeometry(0.35, 0.9, 0.35);
    [-0.28, 0.28].forEach(lx => {
      const leg = new THREE.Mesh(legGeo, bodyMat);
      leg.position.set(lx, 0.45, 0);
      this.mesh.add(leg);
    });

    // Ojos pequeños y hundidos
    const eyeMat = new THREE.MeshBasicMaterial({ color: 0xFF6600 });
    [-0.18, 0.18].forEach(ex => {
      const eye = new THREE.Mesh(new THREE.SphereGeometry(0.07, 5, 5), eyeMat);
      eye.position.set(ex, 2.22, 0.32);
      this.mesh.add(eye);
    });

    this.mesh.position.set(pos.x, 0, pos.z);
    this._materials = [bodyMat, skinMat];
  }

  _restoreColors() {
    this._materials[0]?.color.setHex(0x4A7A3A);
    this._materials[1]?.color.setHex(0x3A6A2A);
  }
}
