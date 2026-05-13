// core/enemies/Mossling.js — Criatura de musgo y raíces
import * as THREE from 'three';
import { BaseEnemy } from './BaseEnemy.js';

export class Mossling extends BaseEnemy {
  constructor(scene, position, player) {
    super(scene, position, player, {
      hp           : 45,
      damage       : 6,
      roamSpeed    : 1.2,
      chaseSpeed   : 2.2,
      detectRange  : 5,
      attackRange  : 1.4,
      attackCooldown: 1.8,
      respawnTime  : 40,
      drops        : { madera: 3, magicEnergy: 3, xp: 15 },
    });
  }

  _buildMesh(pos) {
    this.mesh = new THREE.Group();

    // Cuerpo de musgo — irregular
    const bodyMat = new THREE.MeshStandardMaterial({ color: 0x2A5A1A, roughness: 0.95 });
    const body    = new THREE.Mesh(new THREE.SphereGeometry(0.45, 7, 6), bodyMat);
    body.scale.y  = 1.3;
    body.position.y = 0.6;
    this.mesh.add(body);

    // Raíces
    const rootMat = new THREE.MeshStandardMaterial({ color: 0x3A2A08, roughness: 0.98 });
    [[-0.3, 0, 0.2], [0.3, 0, -0.1], [0, 0, -0.3]].forEach(([rx, ry, rz]) => {
      const root = new THREE.Mesh(
        new THREE.CylinderGeometry(0.05, 0.1, 0.4, 4),
        rootMat
      );
      root.position.set(rx, 0.15, rz);
      root.rotation.z = (Math.random() - 0.5) * 0.8;
      this.mesh.add(root);
    });

    // Ojos brillantes
    const eyeMat = new THREE.MeshBasicMaterial({ color: 0x88FF44 });
    [-0.14, 0.14].forEach(ex => {
      const eye = new THREE.Mesh(new THREE.SphereGeometry(0.06, 5, 5), eyeMat);
      eye.position.set(ex, 0.75, 0.38);
      this.mesh.add(eye);
    });

    this.mesh.position.set(pos.x, 0, pos.z);
    this._materials = [bodyMat, rootMat];
  }

  _restoreColors() {
    this._materials[0]?.color.setHex(0x2A5A1A);
    this._materials[1]?.color.setHex(0x3A2A08);
  }
}
