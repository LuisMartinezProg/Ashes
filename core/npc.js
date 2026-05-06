// core/npc.js
// Ashes of the Reborn | Valiant Gaming

import * as THREE    from 'three';
import { DIALOGUES } from '../data/dialogues.js';

const INTERACT_RANGE = 2.5;

const NPC_DEFS = [
  { id: 'aldeano',        x:  2,   z:  2,   color: 0x8899AA },
  { id: 'herrero',        x: -10,  z: -13,  color: 0x886644 },
  { id: 'guardia',        x:  17,  z:  0,   color: 0x445566 },
  { id: 'vendedor_armas', x:  6,   z:  6,   color: 0xCC9944 },
  { id: 'vendedor_items', x:  8,   z:  6,   color: 0x44AA88 },
];

export class NPC {
  constructor(scene, def) {
    this.id       = def.id;
    this.dialogue = DIALOGUES[def.id];
    this.shop     = def.shop ?? this.dialogue?.shop ?? null;
    this._range   = INTERACT_RANGE;

    this.mesh = new THREE.Group();

    const bodyGeo = new THREE.CylinderGeometry(0.3, 0.3, 1.0, 10);
    const bodyMat = new THREE.MeshStandardMaterial({ color: def.color, roughness: 0.8 });
    const body    = new THREE.Mesh(bodyGeo, bodyMat);
    body.position.y = 0.5;

    const headGeo = new THREE.SphereGeometry(0.28, 10, 10);
    const headMat = new THREE.MeshStandardMaterial({ color: def.color, roughness: 0.8 });
    const head    = new THREE.Mesh(headGeo, headMat);
    head.position.y = 1.28;

    const dotGeo = new THREE.SphereGeometry(0.08, 6, 6);
    const dotMat = new THREE.MeshBasicMaterial({ color: 0xC9A84C });
    this._dot    = new THREE.Mesh(dotGeo, dotMat);
    this._dot.position.y = 1.9;

    // Ícono de tienda encima del punto dorado
    if (this.dialogue?.shop) {
      const shopGeo = new THREE.SphereGeometry(0.1, 6, 6);
      const shopMat = new THREE.MeshBasicMaterial({ color: 0xFFDD00 });
      const shopDot = new THREE.Mesh(shopGeo, shopMat);
      shopDot.position.y = 2.1;
      this.mesh.add(shopDot);
    }

    this.mesh.add(body, head, this._dot);
    this.mesh.position.set(def.x, 0, def.z);

    scene.add(this.mesh);
  }

  isPlayerInRange(playerPos) {
    const dx = playerPos.x - this.mesh.position.x;
    const dz = playerPos.z - this.mesh.position.z;
    return Math.sqrt(dx*dx + dz*dz) <= this._range;
  }

  isShop() { return !!this.dialogue?.shop; }

  update(t) {
    this._dot.position.y = 1.9 + Math.sin(t * 2.5) * 0.08;
  }
}

export function spawnNPCs(scene) {
  return NPC_DEFS.map(def => new NPC(scene, def));
      }
