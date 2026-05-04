// core/weapons/sword.js — Arma: Espada
// Golpe de arco amplio. Golpe 1 liviano, golpe 2 fuerte.

import * as THREE from 'three';

const DAMAGE      = [12, 28];
const ANIM_DUR    = [280, 420];
const FLASH_COLOR = [0xffffff, 0xffdd44];

export class SwordWeapon {
  constructor(playerGroup) {
    this.player   = playerGroup;
    this.comboMax = 2;

    this._flashTimeout = null;
    this._swordMesh    = this._buildSwordMesh();
    this.player.add(this._swordMesh);
  }

  execute(hitIndex) {
    this._playSwingAnim(hitIndex);
    return true;
  }

  getDamage(hitIndex)      { return DAMAGE[hitIndex]   ?? DAMAGE[0]; }
  getAnimDuration(hitIndex){ return ANIM_DUR[hitIndex] ?? ANIM_DUR[0]; }

  update(delta, enemies) {}

  destroy() {
    clearTimeout(this._flashTimeout);
    this.player.remove(this._swordMesh);
  }

  // ── Visual ──────────────────────────────────────────────────────────────────

  _buildSwordMesh() {
    const geo  = new THREE.BoxGeometry(0.08, 0.9, 0.04);
    const mat  = new THREE.MeshBasicMaterial({ color: 0xaaccff });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(0.35, 0.2, 0);
    return mesh;
  }

  _playSwingAnim(hitIndex) {
    clearTimeout(this._flashTimeout);

    this._swordMesh.material.color.setHex(FLASH_COLOR[hitIndex]);
    this._swordMesh.rotation.x = -Math.PI * 0.4;

    this._flashTimeout = setTimeout(() => {
      this._swordMesh.material.color.setHex(0xaaccff);
      this._swordMesh.rotation.x = 0;
    }, ANIM_DUR[hitIndex] * 0.6);
  }
}
