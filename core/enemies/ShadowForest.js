import * as THREE from 'three';
import { BaseEnemy } from './BaseEnemy.js';

export class ShadowForest extends BaseEnemy {
  constructor(scene, position, player) {
    super(scene, position, player, {
      hp: 80,
      damage: 12,
      defense: 4,
      roamSpeed: 1.5,
      chaseSpeed: 3.2,
      detectRange: 14,
      attackRange: 1.8,
      attackCooldown: 1.8,
      respawnTime: 40,
      drops: { magicEnergy: 10, xp: 30 }
    });
    this._eyeMaterials = [];
  }

  _buildMesh(pos) {
    const group = new THREE.Group();

    const bodyMat = new THREE.MeshStandardMaterial({ color: 0x1a0a2e });
    const bodyGeo = new THREE.CylinderGeometry(0.3, 0.4, 1.4, 6);
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.position.y = 0.7;
    group.add(body);
    this._materials.push(bodyMat);

    const headMat = new THREE.MeshStandardMaterial({ color: 0x2d0a4e });
    const headGeo = new THREE.SphereGeometry(0.35, 6, 6);
    const head = new THREE.Mesh(headGeo, headMat);
    head.position.y = 1.6;
    group.add(head);
    this._materials.push(headMat);

    const eyeMat = new THREE.MeshStandardMaterial({ color: 0x9900ff, emissive: 0x9900ff, emissiveIntensity: 1 });
    const eyeGeo = new THREE.SphereGeometry(0.07, 4, 4);
    [-0.12, 0.12].forEach(x => {
      const eye = new THREE.Mesh(eyeGeo, eyeMat.clone());
      eye.position.set(x, 1.65, 0.28);
      group.add(eye);
      this._eyeMaterials.push(eye.material);
    });

    group.position.set(pos.x, pos.y ?? 0, pos.z);
    this.mesh = group;
  }

  _restoreColors() {
    this._materials[0].color.setHex(0x1a0a2e);
    this._materials[1].color.setHex(0x2d0a4e);
  }

  update(delta) {
    super.update(delta);
    if (!this.mesh || this.dead) return;
    const t = performance.now() * 0.003;
    this._eyeMaterials.forEach(m => {
      m.emissiveIntensity = 0.6 + Math.sin(t) * 0.4;
    });
  }
}
