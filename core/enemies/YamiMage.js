// core/enemies/YamiMage.js — Mago de Yami
import * as THREE from 'three';
import { BaseEnemy } from './BaseEnemy.js';

export class YamiMage extends BaseEnemy {
  constructor(scene, position, player) {
    super(scene, position, player, {
      name: 'YamiMage',
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
  }

  _buildMesh(pos) {
    this._orbs     = [];
    this._orbMats  = [];
    this._materials = [];
    const group = new THREE.Group();

    const robeMat   = new THREE.MeshStandardMaterial({ color: 0x0a0020 });
    const accentMat = new THREE.MeshStandardMaterial({ color: 0x220044 });
    this._materials.push(robeMat, accentMat);

    const robe = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.5, 1.5, 7), robeMat);
    robe.position.y = 0.75;
    group.add(robe);

    const torso = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.6, 0.35), accentMat);
    torso.position.y = 1.2;
    group.add(torso);

    const head = new THREE.Mesh(new THREE.SphereGeometry(0.3, 7, 7), robeMat);
    head.position.y = 1.75;
    group.add(head);

    const hat = new THREE.Mesh(new THREE.ConeGeometry(0.28, 0.55, 7), accentMat);
    hat.position.y = 2.15;
    group.add(hat);

    const eyeMat = new THREE.MeshStandardMaterial({ color: 0xdd00ff, emissive: 0xdd00ff, emissiveIntensity: 1 });
    const eyeGeo = new THREE.SphereGeometry(0.055, 4, 4);
    [-0.09, 0.09].forEach(x => {
      const eye = new THREE.Mesh(eyeGeo, eyeMat.clone());
      eye.position.set(x, 1.78, 0.24);
      group.add(eye);
    });

    const orbGeo = new THREE.SphereGeometry(0.1, 6, 6);
    [-0.6, 0.6].forEach(x => {
      const orbMat = new THREE.MeshStandardMaterial({ color: 0xaa00ff, emissive: 0xaa00ff, emissiveIntensity: 1.2 });
      const orb = new THREE.Mesh(orbGeo, orbMat);
      orb.position.set(x, 1.3, 0);
      group.add(orb);
      this._orbs.push(orb);
      this._orbMats.push(orbMat);
    });

    group.position.set(pos.x, pos.y ?? 0, pos.z);
    this.mesh = group;
  }

  _restoreColors() {
    if (this._materials[0]) this._materials[0].color.setHex(0x0a0020);
    if (this._materials[1]) this._materials[1].color.setHex(0x220044);
  }

  update(delta) {
    super.update(delta);
    if (!this.mesh || this.dead) return;
    const t = performance.now() * 0.002;
    this._orbs?.forEach((orb, i) => {
      const angle = t + i * Math.PI;
      orb.position.set(Math.cos(angle) * 0.6, 1.3 + Math.sin(t * 2) * 0.1, Math.sin(angle) * 0.6);
    });
    this._orbMats?.forEach(m => {
      m.emissiveIntensity = 1.0 + Math.sin(t * 3) * 0.5;
    });
  }
}
