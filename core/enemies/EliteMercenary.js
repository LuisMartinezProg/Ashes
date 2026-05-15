// core/enemies/EliteMercenary.js — Mercenario de Élite
import * as THREE from 'three';
import { BaseEnemy } from './BaseEnemy.js';

export class EliteMercenary extends BaseEnemy {
  constructor(scene, position, player) {
    super(scene, position, player, {
      name: 'EliteMercenary',
      hp: 200,
      damage: 28,
      defense: 15,
      roamSpeed: 1.2,
      chaseSpeed: 3.0,
      detectRange: 18,
      attackRange: 2.0,
      attackCooldown: 1.2,
      respawnTime: 60,
      drops: { hierro: 3, magicEnergy: 20, xp: 80 }
    });
  }

  _buildMesh(pos) {
    this._phase = 'normal';
    this._visorMat = null;
    this._materials = [];
    const group = new THREE.Group();

    const armorMat = new THREE.MeshStandardMaterial({ color: 0x2c2c3e });
    const body = new THREE.Mesh(new THREE.BoxGeometry(0.7, 1.2, 0.5), armorMat);
    body.position.y = 0.9;
    group.add(body);
    this._materials.push(armorMat);

    const shoulderMat = new THREE.MeshStandardMaterial({ color: 0x8b0000 });
    [-0.5, 0.5].forEach(x => {
      const s = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.2, 0.4), shoulderMat);
      s.position.set(x, 1.35, 0);
      group.add(s);
    });
    this._materials.push(shoulderMat);

    const helmetMat = new THREE.MeshStandardMaterial({ color: 0x1a1a2e });
    const head = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.45, 0.45), helmetMat);
    head.position.y = 1.75;
    group.add(head);
    this._materials.push(helmetMat);

    this._visorMat = new THREE.MeshStandardMaterial({ color: 0xff2200, emissive: 0xff2200, emissiveIntensity: 0.8 });
    const visor = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.1, 0.1), this._visorMat);
    visor.position.set(0, 1.78, 0.25);
    group.add(visor);

    const blade = new THREE.Mesh(new THREE.BoxGeometry(0.1, 1.4, 0.07),
      new THREE.MeshStandardMaterial({ color: 0xaaaaaa }));
    blade.position.set(0.6, 1.0, 0);
    blade.rotation.z = -0.2;
    group.add(blade);

    const shield = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.7, 0.5),
      new THREE.MeshStandardMaterial({ color: 0x8b0000 }));
    shield.position.set(-0.55, 1.0, 0);
    group.add(shield);

    group.position.set(pos.x, pos.y ?? 0, pos.z);
    this.mesh = group;
  }

  _restoreColors() {
    if (this._materials[0]) this._materials[0].color.setHex(0x2c2c3e);
    if (this._materials[1]) this._materials[1].color.setHex(0x8b0000);
    if (this._materials[2]) this._materials[2].color.setHex(0x1a1a2e);
  }

  _checkEnrage() {
    if (this._phase === 'normal' && this.hp <= this.maxHp * 0.4) {
      this._phase = 'enraged';
      this._config.chaseSpeed *= 1.5;
      this._config.damage = Math.floor(this._config.damage * 1.3);
      this._config.attackCooldown *= 0.7;
      if (this._visorMat) {
        this._visorMat.color.setHex(0xff8800);
        this._visorMat.emissive.setHex(0xff8800);
      }
    }
  }

  update(delta) {
    super.update(delta);
    if (!this.mesh || this.dead) return;
    this._checkEnrage();
    const t = performance.now() * 0.002;
    if (this._visorMat) {
      this._visorMat.emissiveIntensity = this._phase === 'enraged'
        ? 0.8 + Math.sin(t * 4) * 0.5
        : 0.6 + Math.sin(t) * 0.2;
    }
  }
}
