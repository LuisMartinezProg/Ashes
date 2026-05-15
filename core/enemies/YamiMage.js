import * as THREE from 'three';
import { BaseEnemy } from './BaseEnemy.js';

export class YamiMage extends BaseEnemy {
  constructor(scene, position, player) {
    super(scene, position, player, {
      name: 'Yami Mage',
      hp: 110,
      damage: 28,
      defense: 5,
      roamSpeed: 1.0,
      chaseSpeed: 2.5,
      detectRange: 18,
      attackRange: 9,
      attackCooldown: 2.5,
      respawnTime: 45,
      drops: { magicEnergy: 25, xp: 65 }
    });
    this._materials = [];
    this._orbMats  = [];
  }

  _buildMesh(pos) {
    const group = new THREE.Group();

    const robeMat = new THREE.MeshStandardMaterial({ color: 0x0a0020 });
    const accentMat = new THREE.MeshStandardMaterial({ color: 0x220044 });
    const orbMat = new THREE.MeshStandardMaterial({ color: 0xaa00ff, emissive: 0xaa00ff, emissiveIntensity: 1.2 });

    // Túnica
    const robe = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.5, 1.5, 7), robeMat);
    robe.position.y = 0.75;
    group.add(robe);
    this._materials.push(robeMat);

    // Cuerpo superior
    const torso = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.6, 0.35), accentMat);
    torso.position.y = 1.2;
    group.add(torso);
    this._materials.push(accentMat);

    // Cabeza
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.3, 7, 7), robeMat);
    head.position.y = 1.75;
    group.add(head);

    // Sombrero cónico
    const hat = new THREE.Mesh(new THREE.ConeGeometry(0.28, 0.55, 7), accentMat);
    hat.position.y = 2.15;
    group.add(hat);

    // Ojos
    const eyeGeo = new THREE.SphereGeometry(0.055, 4, 4);
    const eyeMat = new THREE.MeshStandardMaterial({ color: 0xdd00ff, emissive: 0xdd00ff, emissiveIntensity: 1 });
    [-0.09, 0.09].forEach(x => {
      const eye = new THREE.Mesh(eyeGeo, eyeMat.clone());
      eye.position.set(x, 1.78, 0.24);
      group.add(eye);
    });

    // Orbes flotantes
    const orbGeo = new THREE.SphereGeometry(0.1, 6, 6);
    this._orbs = [];
    [-0.6, 0.6].forEach(x => {
      const orb = new THREE.Mesh(orbGeo, orbMat.clone());
      orb.position.set(x, 1.3, 0);
      group.add(orb);
      this._orbs.push(orb);
      this._orbMats.push(orb.material);
    });

    group.position.set(pos.x, pos.y ?? 0, pos.z);
    this.mesh = group;
  }

  _restoreColors() {
    this._materials[0].color.setHex(0x0a0020);
    this._materials[1].color.setHex(0x220044);
  }

  update(delta) {
    super.update(delta);
    if (!this.mesh || this.dead) return;
    const t = performance.now() * 0.002;
    // Orbes orbitan
    this._orbs.forEach((orb, i) => {
      const angle = t + i * Math.PI;
      orb.position.set(Math.cos(angle) * 0.6, 1.3 + Math.sin(t * 2) * 0.1, Math.sin(angle) * 0.6);
    });
    // Pulso
    this._orbMats.forEach(m => {
      m.emissiveIntensity = 1.0 + Math.sin(t * 3) * 0.5;
    });
  }
}
