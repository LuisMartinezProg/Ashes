// core/npc.js
// Ashes of the Reborn | Valiant Gaming

import * as THREE from 'three';
import { DIALOGUES } from '../data/dialogues.js';

const INTERACT_RANGE = 2.5;
const MIKA_CRY_RANGE = 15;

const NPC_DEFS = [
  // ── TODOS cerca del spawn (0,0,-20) — temporal para pruebas ──
  { id: 'aldeano',        x:  3,   z: -16,  color: 0x8899AA },
  { id: 'herrero',        x: -3,   z: -16,  color: 0x886644 },
  { id: 'guardia',        x:  6,   z: -18,  color: 0x445566 },
  { id: 'vendedor_armas', x: -6,   z: -18,  color: 0xCC9944 },
  { id: 'vendedor_items', x:  3,   z: -22,  color: 0x44AA88 },
  { id: 'mika',           x: -3,   z: -22,  color: 0xFFAABB, isMika: true },
  { id: 'yuna',           x:  6,   z: -24,  color: 0x4466AA },
  { id: 'voron',          x: -6,   z: -24,  color: 0x8866AA },
  { id: 'elfa_vendedora', x:  0,   z: -26,  color: 0x66AA88 },
];

export class NPC {
  constructor(scene, def) {
    this.id       = def.id;
    this.dialogue = DIALOGUES[def.id];
    this.shop     = def.shop ?? this.dialogue?.shop ?? null;
    this.isMika   = def.isMika ?? false;
    this._range   = INTERACT_RANGE;

    this._mikaRescued = false;
    this._cryShown    = false;
    this._cryEl       = null;

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

    if (this.dialogue?.shop) {
      const shopGeo = new THREE.SphereGeometry(0.1, 6, 6);
      const shopMat = new THREE.MeshBasicMaterial({ color: 0xFFDD00 });
      const shopDot = new THREE.Mesh(shopGeo, shopMat);
      shopDot.position.y = 2.1;
      this.mesh.add(shopDot);
    }

    if (this.isMika) {
      const exGeo = new THREE.SphereGeometry(0.12, 6, 6);
      const exMat = new THREE.MeshBasicMaterial({ color: 0xFF2222 });
      this._exclamation = new THREE.Mesh(exGeo, exMat);
      this._exclamation.position.y = 2.2;
      this.mesh.add(this._exclamation);
    }

    this.mesh.add(body, head, this._dot);
    this.mesh.position.set(def.x, 0, def.z);
    scene.add(this.mesh);

    if (this.isMika) this._buildCryLabel();
  }

  _buildCryLabel() {
    this._cryEl = document.createElement('div');
    Object.assign(this._cryEl.style, {
      position     : 'fixed',
      top          : '38%',
      left         : '50%',
      transform    : 'translateX(-50%)',
      background   : 'rgba(180,20,20,0.88)',
      color        : '#fff',
      fontFamily   : "'Cinzel', serif",
      fontSize     : '13px',
      letterSpacing: '2px',
      padding      : '8px 20px',
      borderRadius : '20px',
      border       : '1px solid rgba(255,80,80,0.5)',
      pointerEvents: 'none',
      zIndex       : '200',
      display      : 'none',
      textAlign    : 'center',
      boxShadow    : '0 2px 12px rgba(200,0,0,0.4)',
      transition   : 'opacity 0.4s ease',
    });
    this._cryEl.textContent = '¡Ayuda! ¡Por favor!';
    document.body.appendChild(this._cryEl);
  }

  _showCry() {
    if (!this._cryEl || this._mikaRescued) return;
    this._cryEl.style.display = 'block';
    this._cryEl.style.opacity = '1';
    if (this._cryTimer) clearTimeout(this._cryTimer);
    this._cryTimer = setTimeout(() => {
      if (this._cryEl) this._cryEl.style.opacity = '0';
      setTimeout(() => {
        if (this._cryEl) this._cryEl.style.display = 'none';
      }, 400);
    }, 2500);
  }

  rescue() {
    this._mikaRescued = true;
    if (this._cryEl) this._cryEl.style.display = 'none';
    if (this._exclamation) this._exclamation.visible = false;
    this._dot.material.color.setHex(0x44FF88);
  }

  isPlayerInRange(playerPos) {
    const dx = playerPos.x - this.mesh.position.x;
    const dz = playerPos.z - this.mesh.position.z;
    return Math.sqrt(dx*dx + dz*dz) <= this._range;
  }

  isInCryRange(playerPos) {
    if (!this.isMika || this._mikaRescued) return false;
    const dx = playerPos.x - this.mesh.position.x;
    const dz = playerPos.z - this.mesh.position.z;
    return Math.sqrt(dx*dx + dz*dz) <= MIKA_CRY_RANGE;
  }

  isShop() { return !!this.dialogue?.shop; }

  getLines() {
    if (this.isMika && this._mikaRescued) {
      return this.dialogue?.linesAfterRescue ?? this.dialogue?.lines ?? [];
    }
    return this.dialogue?.lines ?? [];
  }

  update(t, playerPos) {
    this._dot.position.y = 1.9 + Math.sin(t * 2.5) * 0.08;

    // Grito de ayuda de Mika desactivado temporalmente para pruebas de tienda
    /*
    if (this.isMika && playerPos && this.isInCryRange(playerPos)) {
      if (!this._cryShown) {
        this._cryShown = true;
        this._showCry();
        this._cryInterval = setInterval(() => {
          if (!this._mikaRescued && this.isInCryRange(playerPos)) {
            this._showCry();
          } else {
            clearInterval(this._cryInterval);
            this._cryShown = false;
          }
        }, 4000);
      }
    } else if (this._cryShown && (!playerPos || !this.isInCryRange(playerPos))) {
      this._cryShown = false;
      clearInterval(this._cryInterval);
    }
    */
  }
}

export function spawnNPCs(scene) {
  return NPC_DEFS.map(def => new NPC(scene, def));
}
