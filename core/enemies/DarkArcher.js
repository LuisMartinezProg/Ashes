import * as THREE from 'three';
import { BaseEnemy } from './BaseEnemy.js';

export class DarkArcher extends BaseEnemy {
  constructor(scene, position, player) {
    super(scene, position, player, {
      name: 'Dark Archer',
      hp: 70,
      damage: 20,
      defense: 4,
      roamSpeed: 1.2,
      chaseSpeed: 3.0,
      detectRange: 20,
      attackRange: 10,
      attackCooldown: 2.0,
      respawnTime: 35,
      drops: { magicEnergy: 10, xp: 40 }
    });
    this._materials = [];
  }

  _buildMesh(pos) {
    const group = new THREE.Group();

    const darkMat  = new THREE.MeshStandardMaterial({ color: 0x0d0d1a });
    const cloakMat = new THREE.MeshStandardMaterial({ color: 0x1a0022 });
    const glowMat  = new THREE.MeshStandardMaterial({ color: 0x00ccff, emissive: 0x00ccff, emissiveIntensity: 0.9 });

    // Capa
    const cloak = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.55, 1.3, 6), cloakMat);
    cloak.position.y = 0.75;
    group.add(cloak);
    this._materials.push(cloakMat);

    // Cuerpo
    const body = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.9, 0.3), darkMat);
    body.position.y = 0.85;
    group.add(body);
    this._materials.push(darkMat);

    // Cabeza con capucha
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.28, 6, 6), cloakMat);
    head.position.y = 1.6;
    group.add(head);

    // Ojos
    const eyeGeo = new THREE.SphereGeometry(0.05, 4, 4);
    [-0.08, 0.08].forEach(x => {
      const eye = new THREE.Mesh(eyeGeo, glowMat.clone());
      eye.position.set(x, 1.63, 0.22);
      group.add(eye);
    });
    this._materials.push(glowMat);

    // Arco
    const bowMat = new THREE.MeshStandardMaterial({ color: 0x2a1a00 });
    const bow = new THREE.Mesh(new THREE.TorusGeometry(0.35, 0.04, 6, 12, Math.PI), bowMat);
    bow.position.set(-0.5, 1.0, 0);
    bow.rotation.y = Math.PI / 2;
    group.add(bow);

    // Flecha
    const arrow = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.7, 4),
      new THREE.MeshStandardMaterial({ color: 0x553300 }));
    arrow.position.set(-0.5, 1.0, 0);
    arrow.rotation.z = Math.PI / 2;
    group.add(arrow);

    group.position.set(pos.x, pos.y ?? 0, pos.z);
    this.mesh = group;
  }

  _restoreColors() {
    this._materials[0].color.setHex(0x1a0022);
    this._materials[1].color.setHex(0x0d0d1a);
  }

  update(delta) {
    super.update(delta);
  }
}
