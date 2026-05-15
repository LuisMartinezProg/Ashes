import * as THREE from 'three';
import { BaseEnemy } from './BaseEnemy.js';

export class ShadowSoldier extends BaseEnemy {
  constructor(scene, position, player) {
    super(scene, position, player, {
      name: 'Shadow Soldier',
      hp: 90,
      damage: 15,
      defense: 8,
      roamSpeed: 1.4,
      chaseSpeed: 3.5,
      detectRange: 14,
      attackRange: 1.8,
      attackCooldown: 1.4,
      respawnTime: 35,
      drops: { magicEnergy: 8, xp: 35 }
    });
    this._materials = [];
  }

  _buildMesh(pos) {
    const group = new THREE.Group();

    const armorMat = new THREE.MeshStandardMaterial({ color: 0x0a0a1a });
    const accentMat = new THREE.MeshStandardMaterial({ color: 0x1a0a3a });
    const glowMat = new THREE.MeshStandardMaterial({ color: 0x440088, emissive: 0x440088, emissiveIntensity: 0.8 });

    // Cuerpo
    const body = new THREE.Mesh(new THREE.BoxGeometry(0.55, 1.1, 0.4), armorMat);
    body.position.y = 0.85;
    group.add(body);
    this._materials.push(armorMat);

    // Hombreras
    [-0.38, 0.38].forEach(x => {
      const s = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.18, 0.35), accentMat);
      s.position.set(x, 1.3, 0);
      group.add(s);
    });
    this._materials.push(accentMat);

    // Cabeza
    const head = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.38, 0.38), armorMat);
    head.position.y = 1.65;
    group.add(head);

    // Ojos
    const eyeGeo = new THREE.SphereGeometry(0.06, 4, 4);
    [-0.09, 0.09].forEach(x => {
      const eye = new THREE.Mesh(eyeGeo, glowMat.clone());
      eye.position.set(x, 1.68, 0.2);
      group.add(eye);
    });
    this._materials.push(glowMat);

    // Espada corta
    const blade = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.9, 0.06),
      new THREE.MeshStandardMaterial({ color: 0x334466 }));
    blade.position.set(0.5, 0.9, 0);
    blade.rotation.z = -0.15;
    group.add(blade);

    group.position.set(pos.x, pos.y ?? 0, pos.z);
    this.mesh = group;
  }

  _restoreColors() {
    this._materials[0].color.setHex(0x0a0a1a);
    this._materials[1].color.setHex(0x1a0a3a);
  }

  update(delta) {
    super.update(delta);
  }
}
