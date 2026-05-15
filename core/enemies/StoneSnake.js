// core/enemies/StoneSnake.js — Serpiente de Piedra
import * as THREE from 'three';
import { BaseEnemy } from './BaseEnemy.js';

export class StoneSnake extends BaseEnemy {
  constructor(scene, position, player) {
    super(scene, position, player, {
      name: 'StoneSnake',
      hp: 120,
      damage: 18,
      defense: 10,
      roamSpeed: 1.2,
      chaseSpeed: 2.8,
      detectRange: 10,
      attackRange: 2.2,
      attackCooldown: 2.2,
      respawnTime: 50,
      drops: { piedra: 2, xp: 45 }
    });
  }

  _buildMesh(pos) {
    this._segments = [];
    this._materials = [];
    const group = new THREE.Group();

    const mat = new THREE.MeshStandardMaterial({ color: 0x6b6b6b });
    const darkMat = new THREE.MeshStandardMaterial({ color: 0x3a3a3a });
    this._materials.push(mat, darkMat);

    for (let i = 0; i < 4; i++) {
      const geo = new THREE.SphereGeometry(0.35 - i * 0.05, 6, 6);
      const seg = new THREE.Mesh(geo, i % 2 === 0 ? mat : darkMat);
      seg.position.set(0, 0.35, -i * 0.5);
      group.add(seg);
      this._segments.push(seg);
    }

    const headMat = new THREE.MeshStandardMaterial({ color: 0x4a4a4a });
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.42, 6, 6), headMat);
    head.position.set(0, 0.42, 0.5);
    group.add(head);
    this._materials.push(headMat);

    const eyeMat = new THREE.MeshStandardMaterial({ color: 0xff4400, emissive: 0xff4400, emissiveIntensity: 1 });
    const eyeGeo = new THREE.SphereGeometry(0.07, 4, 4);
    [-0.15, 0.15].forEach(x => {
      const eye = new THREE.Mesh(eyeGeo, eyeMat);
      eye.position.set(x, 0.52, 0.85);
      group.add(eye);
    });
    this._materials.push(eyeMat);

    group.position.set(pos.x, pos.y ?? 0, pos.z);
    this.mesh = group;
  }

  _restoreColors() {
    if (this._materials[0]) this._materials[0].color.setHex(0x6b6b6b);
    if (this._materials[1]) this._materials[1].color.setHex(0x3a3a3a);
    if (this._materials[2]) this._materials[2].color.setHex(0x4a4a4a);
  }

  update(delta) {
    super.update(delta);
    if (!this.mesh || this.dead) return;
    const t = performance.now() * 0.002;
    this._segments?.forEach((s, i) => {
      s.position.y = 0.35 + Math.sin(t + i * 0.8) * 0.08;
    });
  }
}
