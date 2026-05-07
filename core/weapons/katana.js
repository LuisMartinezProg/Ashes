// core/weapons/katana.js — Arma: Katana
// Combo de 2 golpes. Corte rápido + tajo descendente.

import * as THREE from 'three';

const DAMAGE      = [12, 28];
const ANIM_DUR    = [200, 350];
const FLASH_COLOR = [0xffffff, 0xff4422];

export class KatanaWeapon {
  constructor(playerGroup) {
    this.player   = playerGroup;
    this.comboMax = 2;

    this._flashTimeout = null;
    this._katanaMesh   = this._buildKatanaMesh();
    this.player.add(this._katanaMesh);
  }

  execute(hitIndex) {
    this._playSwingAnim(hitIndex);
    return true;
  }

  getDamage(hitIndex)       { return DAMAGE[hitIndex]   ?? DAMAGE[0]; }
  getAnimDuration(hitIndex) { return ANIM_DUR[hitIndex] ?? ANIM_DUR[0]; }

  update(delta, enemies) {}

  destroy() {
    clearTimeout(this._flashTimeout);
    this.player.remove(this._katanaMesh);
  }

  // ── Visual ──────────────────────────────────────────────────────────────

  _buildKatanaMesh() {
    const g = new THREE.Group();

    // Hoja larga y delgada
    const bladeGeo = new THREE.BoxGeometry(0.04, 1.1, 0.015);
    const bladeMat = new THREE.MeshBasicMaterial({ color: 0xDDEEFF });
    const blade    = new THREE.Mesh(bladeGeo, bladeMat);
    blade.position.set(0, 0.55, 0);
    g.add(blade);

    // Guardia
    const guardGeo = new THREE.BoxGeometry(0.18, 0.04, 0.04);
    const guardMat = new THREE.MeshBasicMaterial({ color: 0x886633 });
    const guard    = new THREE.Mesh(guardGeo, guardMat);
    guard.position.set(0, 0.02, 0);
    g.add(guard);

    // Mango
    const handleGeo = new THREE.BoxGeometry(0.04, 0.28, 0.04);
    const handleMat = new THREE.MeshBasicMaterial({ color: 0x553311 });
    const handle    = new THREE.Mesh(handleGeo, handleMat);
    handle.position.set(0, -0.16, 0);
    g.add(handle);

    g.position.set(0.3, 0.15, 0.1);
    return g;
  }

  _playSwingAnim(hitIndex) {
    clearTimeout(this._flashTimeout);

    const blade = this._katanaMesh.children[0];
    blade.material.color.setHex(FLASH_COLOR[hitIndex]);

    if (hitIndex === 0) {
      // Corte horizontal rápido
      this._katanaMesh.rotation.z = -Math.PI * 0.5;
    } else {
      // Tajo descendente
      this._katanaMesh.rotation.x = -Math.PI * 0.6;
    }

    this._flashTimeout = setTimeout(() => {
      blade.material.color.setHex(0xDDEEFF);
      this._katanaMesh.rotation.set(0, 0, 0);
    }, ANIM_DUR[hitIndex] * 0.6);
  }
}
