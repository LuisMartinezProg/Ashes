import * as THREE from 'three';
import { BaseEnemy } from './BaseEnemy.js';

export class WarriorGhost extends BaseEnemy {
  constructor(scene, position, player) {
    super(scene, position, player, {
      hp: 100,
      damage: 22,
      defense: 6,
      roamSpeed: 1.8,
      chaseSpeed: 4.0,
      detectRange: 16,
      attackRange: 2.0,
      attackCooldown: 1.5,
      respawnTime: 45,
      drops: { magicEnergy: 15, xp: 50 }
    });
    this._ghostMats = [];
  }

  _buildMesh(pos) {
    const group = new THREE.Group();
    this._ghostMats = [];

    const ghostMat = () => {
      const m = new THREE.MeshStandardMaterial({
        color: 0x88aaff,
        transparent: true,
        opacity: 0.6,
        emissive: 0x2244aa,
        emissiveIntensity: 0.5
      });
      this._ghostMats.push(m);
      this._materials.push(m);
      return m;
    };

    const body = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.45, 1.5, 7), ghostMat());
    body.position.y = 0.75;
    group.add(body);

    const head = new THREE.Mesh(new THREE.SphereGeometry(0.32, 7, 7), ghostMat());
    head.position.y = 1.7;
    group.add(head);

    const swordMat = new THREE.MeshStandardMaterial({
      color: 0xaaccff, transparent: true, opacity: 0.8,
      emissive: 0x4466ff, emissiveIntensity: 0.8
    });
    const sword = new THREE.Mesh(new THREE.BoxGeometry(0.08, 1.0, 0.06), swordMat);
    sword.position.set(0.55, 1.1, 0);
    sword.rotation.z = -0.3;
    group.add(sword);
    this._ghostMats.push(swordMat);

    const eyeMat = new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xffffff, emissiveIntensity: 1 });
    const eyeGeo = new THREE.SphereGeometry(0.06, 4, 4);
    [-0.1, 0.1].forEach(x => {
      const eye = new THREE.Mesh(eyeGeo, eyeMat);
      eye.position.set(x, 1.75, 0.26);
      group.add(eye);
    });

    group.position.set(pos.x, pos.y ?? 0, pos.z);
    this.mesh = group;
  }

  _restoreColors() {
    this._ghostMats.forEach(m => m.color.setHex(0x88aaff));
  }

  update(delta) {
    super.update(delta);
    if (!this.mesh || this.dead) return;
    const t = performance.now() * 0.0015;
    this.mesh.position.y = Math.sin(t) * 0.15;
    const flicker = 0.6 + Math.sin(t * 3) * 0.1;
    this._ghostMats.forEach(m => {
      m.opacity = Math.max(0.3, Math.min(1, flicker));
    });
  }
}
