// core/enemies/EarthGolem.js — Golem de tierra de la planicie
import * as THREE from 'three';
import { BaseEnemy } from './BaseEnemy.js';

export class EarthGolem extends BaseEnemy {
  constructor(scene, position, player) {
    super(scene, position, player, {
      hp           : 200,
      damage       : 22,
      roamSpeed    : 0.8,
      chaseSpeed   : 2.0,
      detectRange  : 7,
      attackRange  : 2.2,
      attackCooldown: 2.5,
      respawnTime  : 120,
      drops        : { piedra: 8, hierro: 2, magicEnergy: 10, xp: 60 },
    });
  }

  _buildMesh(pos) {
    this.mesh = new THREE.Group();

    const stoneMat = new THREE.MeshStandardMaterial({ color: 0x7A6A58, roughness: 0.98 });
    const darkMat  = new THREE.MeshStandardMaterial({ color: 0x5A4A38, roughness: 0.98 });

    // Torso grande
    const torso = new THREE.Mesh(new THREE.BoxGeometry(1.4, 1.6, 1.0), stoneMat);
    torso.position.y = 1.4;
    this.mesh.add(torso);

    // Cabeza de piedra
    const head = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.9, 0.9), darkMat);
    head.position.y = 2.65;
    this.mesh.add(head);

    // Brazos rocosos
    const armGeo = new THREE.BoxGeometry(0.5, 1.4, 0.5);
    [-1.0, 1.0].forEach(ax => {
      const arm = new THREE.Mesh(armGeo, stoneMat);
      arm.position.set(ax, 1.3, 0);
      this.mesh.add(arm);
    });

    // Puños
    const fistGeo = new THREE.BoxGeometry(0.6, 0.6, 0.6);
    [-1.0, 1.0].forEach(ax => {
      const fist = new THREE.Mesh(fistGeo, darkMat);
      fist.position.set(ax, 0.5, 0);
      this.mesh.add(fist);
    });

    // Piernas
    const legGeo = new THREE.BoxGeometry(0.5, 1.0, 0.5);
    [-0.38, 0.38].forEach(lx => {
      const leg = new THREE.Mesh(legGeo, stoneMat);
      leg.position.set(lx, 0.5, 0);
      this.mesh.add(leg);
    });

    // Ojos que brillan
    const eyeMat = new THREE.MeshBasicMaterial({ color: 0xFF4400 });
    [-0.22, 0.22].forEach(ex => {
      const eye = new THREE.Mesh(new THREE.SphereGeometry(0.1, 5, 5), eyeMat);
      eye.position.set(ex, 2.72, 0.42);
      this.mesh.add(eye);
    });

    this.mesh.position.set(pos.x, 0, pos.z);
    this._materials = [stoneMat, darkMat];
  }

  _restoreColors() {
    this._materials[0]?.color.setHex(0x7A6A58);
    this._materials[1]?.color.setHex(0x5A4A38);
  }
}
