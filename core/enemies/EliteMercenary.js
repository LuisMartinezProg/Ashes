import * as THREE from 'three';
import { BaseEnemy } from './BaseEnemy.js';

export class EliteMercenary extends BaseEnemy {
  constructor(scene, position) {
    super(scene, position, {
      name: 'EliteMercenary',
      hp: 200,
      maxHp: 200,
      attack: 28,
      defense: 15,
      speed: 0.035,
      detectionRange: 18,
      attackRange: 2.0,
      attackCooldown: 1.2,
      xpReward: 80,
      drops: [
        { item: 'mercenary_badge', chance: 0.7 },
        { item: 'iron_coin', chance: 0.6 },
        { item: 'steel_fragment', chance: 0.35 },
      ]
    });

    this._phase = 'normal'; // 'normal' | 'enraged'
    this._buildMesh(scene);
  }

  _buildMesh(scene) {
    const group = new THREE.Group();

    // Armadura — cuerpo
    const bodyGeo = new THREE.BoxGeometry(0.7, 1.2, 0.5);
    const armorMat = new THREE.MeshStandardMaterial({ color: 0x2c2c3e });
    const body = new THREE.Mesh(bodyGeo, armorMat);
    body.position.y = 0.9;
    group.add(body);

    // Hombreras
    const shoulderGeo = new THREE.BoxGeometry(0.3, 0.2, 0.4);
    const shoulderMat = new THREE.MeshStandardMaterial({ color: 0x8b0000 });
    [-0.5, 0.5].forEach(x => {
      const shoulder = new THREE.Mesh(shoulderGeo, shoulderMat);
      shoulder.position.set(x, 1.35, 0);
      group.add(shoulder);
    });

    // Cabeza con casco
    const headGeo = new THREE.BoxGeometry(0.45, 0.45, 0.45);
    const helmetMat = new THREE.MeshStandardMaterial({ color: 0x1a1a2e });
    const head = new THREE.Mesh(headGeo, helmetMat);
    head.position.y = 1.75;
    group.add(head);

    // Visera roja
    const visorGeo = new THREE.BoxGeometry(0.35, 0.1, 0.1);
    const visorMat = new THREE.MeshStandardMaterial({
      color: 0xff2200,
      emissive: 0xff2200,
      emissiveIntensity: 0.8
    });
    const visor = new THREE.Mesh(visorGeo, visorMat);
    visor.position.set(0, 1.78, 0.25);
    group.add(visor);

    // Espada grande
    const bladeGeo = new THREE.BoxGeometry(0.1, 1.4, 0.07);
    const bladeMat = new THREE.MeshStandardMaterial({ color: 0xaaaaaa });
    const blade = new THREE.Mesh(bladeGeo, bladeMat);
    blade.position.set(0.6, 1.0, 0);
    blade.rotation.z = -0.2;
    group.add(blade);

    // Escudo
    const shieldGeo = new THREE.BoxGeometry(0.08, 0.7, 0.5);
    const shieldMat = new THREE.MeshStandardMaterial({ color: 0x8b0000 });
    const shield = new THREE.Mesh(shieldGeo, shieldMat);
    shield.position.set(-0.55, 1.0, 0);
    group.add(shield);

    group.position.copy(position);
    scene.add(group);
    this.mesh = group;
    this._visor = visor;
  }

  _checkEnrage() {
    if (this._phase === 'normal' && this.hp <= this.maxHp * 0.4) {
      this._phase = 'enraged';
      this.speed *= 1.5;
      this.attack *= 1.3;
      this.attackCooldown *= 0.7;
      // Visera cambia a naranja
      if (this._visor) {
        this._visor.material.color.set(0xff8800);
        this._visor.material.emissive.set(0xff8800);
      }
    }
  }

  update(delta, playerPosition) {
    if (this.isDead()) return;
    this._checkEnrage();
    this._updateAI(delta, playerPosition);

    // Pulso de visera
    const t = performance.now() * 0.002;
    if (this._visor) {
      const intensity = this._phase === 'enraged'
        ? 0.8 + Math.sin(t * 4) * 0.5
        : 0.6 + Math.sin(t) * 0.2;
      this._visor.material.emissiveIntensity = intensity;
    }
  }
}
