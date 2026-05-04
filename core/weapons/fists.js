// core/weapons/fists.js — Arma: Puños
// Combo de 2 golpes. Jab + cross fuerte.

import * as THREE from 'three';

const DAMAGE      = [8, 22];
const ANIM_DUR    = [220, 380];
const FLASH_COLOR = [0xffffff, 0xff6622];

export class FistsWeapon {
  constructor(playerGroup) {
    this.player   = playerGroup;
    this.comboMax = 2;

    this._leftFist  = this._buildFist(-0.28);
    this._rightFist = this._buildFist( 0.28);
    this.player.add(this._leftFist);
    this.player.add(this._rightFist);

    this._flashTimeout = null;
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
    this.player.remove(this._leftFist);
    this.player.remove(this._rightFist);
  }

  // ── Visual ──────────────────────────────────────────────────────────────────

  _buildFist(xOffset) {
    const geo  = new THREE.SphereGeometry(0.1, 6, 6);
    const mat  = new THREE.MeshBasicMaterial({ color: 0xffccaa });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(xOffset, 0.05, 0.15);
    return mesh;
  }

  _playSwingAnim(hitIndex) {
    clearTimeout(this._flashTimeout);

    const activeFist = hitIndex === 0 ? this._rightFist : this._leftFist;
    const color      = FLASH_COLOR[hitIndex];
    const duration   = ANIM_DUR[hitIndex];

    activeFist.material.color.setHex(color);
    activeFist.position.z = 0.45;

    this._flashTimeout = setTimeout(() => {
      activeFist.material.color.setHex(0xffccaa);
      activeFist.position.z = 0.15;
    }, duration * 0.5);
  }
}

