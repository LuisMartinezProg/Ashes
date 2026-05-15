import * as THREE from 'three';
import { BaseEnemy } from './BaseEnemy.js';

export class WarriorGhost extends BaseEnemy {
  constructor(scene, position) {
    super(scene, position, {
      name: 'WarriorGhost',
      hp: 100,
      maxHp: 100,
      attack: 22,
      defense: 6,
      speed: 0.05,
      detectionRange: 16,
      attackRange: 2.0,
      attackCooldown: 1.5,
      xpReward: 50,
      drops: [
        { item: 'ghost_essence', chance: 0.55 },
        { item: 'rusted_blade', chance: 0.2 },
      ]
    });

    this._opacity = 0.6;
    this._buildMesh(scene);
  }

  _buildMesh(scene) {
    const group = new THREE.Group();

    const mat = new THREE.MeshStandardMaterial({
      color: 0x88aaff,
      transparent: true,
      opacity: this._opacity,
      emissive: 0x2244aa,
      emissiveIntensity: 0.5
    });

    // Cuerpo fantasmal
    const bodyGeo = new THREE.CylinderGeometry(0.25, 0.45, 1.5, 7);
    const body = new THREE.Mesh(bodyGeo, mat);
    body.position.y = 0.75;
    group.add(body);

    // Cabeza
    const headGeo = new THREE.SphereGeometry(0.32, 7, 7);
    const head = new THREE.Mesh(headGeo, mat);
    head.position.y = 1.7;
    group.add(head);

    // Espada fantasmal
    const swordGeo = new THREE.BoxGeometry(0.08, 1.0, 0.06);
    const swordMat = new THREE.MeshStandardMaterial({
      color: 0xaaccff,
      transparent: true,
      opacity: 0.8,
      emissive: 0x4466ff,
      emissiveIntensity: 0.8
    });
    const sword = new THREE.Mesh(swordGeo, swordMat);
    sword.position.set(0.55, 1.1, 0);
    sword.rotation.z = -0.3;
    group.add(sword);

    // Ojos
    const eyeMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      emissive: 0xffffff,
      emissiveIntensity: 1
    });
    const eyeGeo = new THREE.SphereGeometry(0.06, 4, 4);
    [-0.1, 0.1].forEach(x => {
      const eye = new THREE.Mesh(eyeGeo, eyeMat);
      eye.position.set(x, 1.75, 0.26);
      group.add(eye);
    });

    group.position.copy(position);
    scene.add(group);
    this.mesh = group;
  }

  update(delta, playerPosition) {
    if (this.isDead()) return;
    this._updateAI(delta, playerPosition);

    // Flotación y parpadeo de opacidad
    const t = performance.now() * 0.0015;
    this.mesh.position.y = Math.sin(t) * 0.15;

    const flicker = this._opacity + Math.sin(t * 3) * 0.1;
    this.mesh.children.forEach(c => {
      if (c.material && c.material.transparent) {
        c.material.opacity = Math.max(0.3, Math.min(1, flicker));
      }
    });
  }
}
