// core/enemies/Thug.js — Ashes of the Reborn | Valiant Gaming
// Variante de Bandit con respawn, para zona inicial cerca del spawn del jugador.
import * as THREE from 'three';
import { BaseEnemy } from './BaseEnemy.js';

const CONFIG = {
  hp            : 60,
  damage        : 10,
  attackRange   : 1.4,
  detectRange   : 5,
  chaseSpeed    : 3.8,
  roamSpeed     : 1.2,
  attackCooldown: 1.2,
  deathDuration : 700,
  respawnTime   : 35, // sí respawnea, a diferencia de Bandit (Mika)
  drops         : { xp: 30 },
  name          : 'Maleante',
};

export class Thug extends BaseEnemy {
  constructor(scene, position, player) {
    super(scene, position, player, CONFIG);
  }

  _buildMesh(pos) {
    this.mesh = new THREE.Group();

    const bodyGeo = new THREE.CylinderGeometry(0.3, 0.3, 1.0, 10);
    const bodyMat = new THREE.MeshBasicMaterial({ color: 0x4a3828 });
    const body    = new THREE.Mesh(bodyGeo, bodyMat);
    body.position.y = 0.5;

    const headGeo = new THREE.SphereGeometry(0.28, 10, 10);
    const headMat = new THREE.MeshBasicMaterial({ color: 0x8B6340 });
    const head    = new THREE.Mesh(headGeo, headMat);
    head.position.y = 1.28;

    const hoodGeo = new THREE.ConeGeometry(0.22, 0.3, 8);
    const hoodMat = new THREE.MeshBasicMaterial({ color: 0x2a1f14 });
    const hood    = new THREE.Mesh(hoodGeo, hoodMat);
    hood.position.y = 1.62;

    const weaponGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.8, 6);
    const weaponMat = new THREE.MeshBasicMaterial({ color: 0x888888 });
    const weapon    = new THREE.Mesh(weaponGeo, weaponMat);
    weapon.position.set(0.4, 0.9, 0);
    weapon.rotation.z = Math.PI / 4;

    this.mesh.add(body, head, hood, weapon);
    this.mesh.position.set(pos.x, 0, pos.z);
    this._materials = [bodyMat, headMat, hoodMat];
  }

  _restoreColors() {
    this._materials[0]?.color.setHex(0x4a3828);
    this._materials[1]?.color.setHex(0x8B6340);
    this._materials[2]?.color.setHex(0x2a1f14);
  }
}
