// core/weapons/bow.js — Arma: Arco
// Flecha en línea recta hacia el objetivo. Golpe 1 normal, golpe 2 de carga.

import * as THREE from 'three';

const DAMAGE       = [9, 20];
const ANIM_DUR     = [350, 550];
const ARROW_SPEED  = [10, 16];
const ARROW_COLORS = [0xddbb55, 0xff8800];

export class BowWeapon {
  constructor(playerGroup) {
    this.player   = playerGroup;
    this.comboMax = 2;

    this._arrows  = [];
    this._scene   = null;

    this._bowMesh = this._buildBowMesh();
    this.player.add(this._bowMesh);
  }

  setScene(scene) { this._scene = scene; }

  execute(hitIndex, enemies = []) {
    const target = this._findTarget(enemies);
    this._playDrawAnim(hitIndex);
    if (target && this._scene) {
      this._spawnArrow(hitIndex, target);
    }
    return !!target;
  }

  getDamage(hitIndex)      { return DAMAGE[hitIndex]   ?? DAMAGE[0]; }
  getAnimDuration(hitIndex){ return ANIM_DUR[hitIndex] ?? ANIM_DUR[0]; }

  /** @param {number} delta @param {Array} enemies — lista viva de enemies */
  update(delta, enemies = []) {
    console.log('bow update, arrows:', this._arrows.length, 'enemies:', enemies.length);
    for (let i = this._arrows.length - 1; i >= 0; i--) {
      const a = this._arrows[i];

      a.mesh.position.addScaledVector(a.direction, a.speed * delta);
      a.traveled += a.speed * delta;

      let hit = false;
      for (const e of enemies) {
        if (e.isDead()) continue;
        const ap = a.mesh.position, ep = e.mesh.position;
if (Math.sqrt((ap.x-ep.x)**2 + (ap.z-ep.z)**2) < 0.8) {
          e.takeDamage(a.damage);
          hit = true;
          break;
        }
      }

      if (hit || a.traveled > 20) this._destroyArrow(i);
    }
  }

  /** Elimina meshes del jugador al cambiar de arma */
  destroy() {
    this.player.remove(this._bowMesh);
    // Limpia flechas en vuelo
    for (const a of this._arrows) {
      if (this._scene) this._scene.remove(a.mesh);
      a.mesh.geometry.dispose();
      a.mesh.material.dispose();
    }
    this._arrows = [];
  }

  // ── Internos ────────────────────────────────────────────────────────────────

  _findTarget(enemies) {
    let closest = null, minDist = Infinity;
    for (const e of enemies) {
      if (e.dead()) continue;
      const dist = this.player.position.distanceTo(e.mesh.position);
      if (dist < minDist) { minDist = dist; closest = e; }
    }
    return closest;
  }

  _spawnArrow(hitIndex, target ) {
    const dir = target.mesh.position.clone()
      .sub(this.player.position)
      .setY(0)
      .normalize();

    const geo  = new THREE.CylinderGeometry(0.03, 0.03, 0.6, 5);
    const mat  = new THREE.MeshBasicMaterial({ color: ARROW_COLORS[hitIndex] });
    const mesh = new THREE.Mesh(geo, mat);

    mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);
    mesh.position.copy(this.player.position).add(new THREE.Vector3(0, 0.8, 0));
    this._scene.add(mesh);

    this._arrows.push({
      mesh,
      direction : dir,
      speed     : ARROW_SPEED[hitIndex],
      damage    : DAMAGE[hitIndex],
      traveled  : 0,
    });
  }

  _destroyArrow(index) {
    const a = this._arrows[index];
    if (a && this._scene) {
      this._scene.remove(a.mesh);
      a.mesh.geometry.dispose();
      a.mesh.material.dispose();
    }
    this._arrows.splice(index, 1);
  }

  _buildBowMesh() {
    const geo  = new THREE.TorusGeometry(0.22, 0.025, 6, 12, Math.PI);
    const mat  = new THREE.MeshBasicMaterial({ color: 0x886633 });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(-0.3, 0.2, 0);
    mesh.rotation.y = Math.PI * 0.5;
    return mesh;
  }

  _playDrawAnim(hitIndex) {
    this._bowMesh.material.color.setHex(ARROW_COLORS[hitIndex]);
    setTimeout(() => {
      this._bowMesh.material.color.setHex(0x886633);
    }, ANIM_DUR[hitIndex] * 0.4);
  }
      }
