import * as THREE from 'three';
import { BaseEnemy } from './BaseEnemy.js';

export class Berserker extends BaseEnemy {
  constructor(scene, position, player) {
    super(scene, position, player, {
      name: 'Berserker',
      hp: 180,
      damage: 32,
      defense: 6,
      roamSpeed: 2.0,
      chaseSpeed: 5.0,
      detectRange: 16,
      attackRange: 2.2,
      attackCooldown: 1.0,
      respawnTime: 50,
      drops: { hierro: 2, magicEnergy: 12, xp: 60 }
    });
    this._materials = [];
    this._phase = 'normal';
  }

  _buildMesh(pos) {
    const group = new THREE.Group();

    const skinMat  = new THREE.MeshStandardMaterial({ color: 0x3a1a1a });
    const rageMat  = new THREE.MeshStandardMaterial({ color: 0x8b0000, emissive: 0x440000, emissiveIntensity: 0.5 });
    const axeMat   = new THREE.MeshStandardMaterial({ color: 0x555555 });

    // Cuerpo grande
    const body = new THREE.Mesh(new THREE.BoxGeometry(0.8, 1.3, 0.55), skinMat);
    body.position.y = 0.95;
    group.add(body);
    this._materials.push(skinMat);

    // Cabeza
    const head = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.5, 0.45), skinMat);
    head.position.y = 1.85;
    group.add(head);

    // Marcas de rabia en el pecho
    const mark = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.55, 0.1), rageMat);
    mark.position.set(0, 1.0, 0.3);
    group.add(mark);
    this._materials.push(rageMat);

    // Ojos rojos
    const eyeGeo = new THREE.SphereGeometry(0.07, 4, 4);
    const eyeMat = new THREE.MeshStandardMaterial({ color: 0xff0000, emissive: 0xff0000, emissiveIntensity: 1 });
    [-0.12, 0.12].forEach(x => {
      const eye = new THREE.Mesh(eyeGeo, eyeMat.clone());
      eye.position.set(x, 1.9, 0.24);
      group.add(eye);
    });
    this._eyeMat = eyeMat;

    // Hacha doble
    const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 1.2, 5), axeMat);
    handle.position.set(0.65, 1.1, 0);
    handle.rotation.z = -0.3;
    group.add(handle);

    const blade1 = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.28, 0.06), axeMat);
    blade1.position.set(0.85, 1.55, 0);
    group.add(blade1);

    const blade2 = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.28, 0.06), axeMat);
    blade2.position.set(0.85, 0.65, 0);
    group.add(blade2);

    group.position.set(pos.x, pos.y ?? 0, pos.z);
    this.mesh = group;
  }

  _restoreColors() {
    this._materials[0].color.setHex(0x3a1a1a);
  }

  _checkEnrage() {
    if (this._phase === 'normal' && this.hp <= this.maxHp * 0.5) {
      this._phase = 'enraged';
      this._config.chaseSpeed  *= 1.4;
      this._config.damage       = Math.floor(this._config.damage * 1.5);
      this._config.attackCooldown *= 0.6;
      this._materials[1].emissiveIntensity = 1.5;
      if (this._eyeMat) this._eyeMat.emissiveIntensity = 2;
    }
  }

  update(delta) {
    super.update(delta);
    if (!this.mesh || this.dead) return;
    this._checkEnrage();
    if (this._phase === 'enraged') {
      const t = performance.now() * 0.005;
      this._materials[1].emissiveIntensity = 1.2 + Math.sin(t) * 0.5;
    }
  }
}
