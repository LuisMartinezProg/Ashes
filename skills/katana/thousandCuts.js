// skills/katana/thousandCuts.js — Mil Cortes (Legendaria)
import * as THREE from 'three';

const DAMAGE_PER_HIT = 30;
const HITS           = 5;
const RANGE          = 3.0;
const DURATION       = 800;

export class ThousandCuts {
  constructor(scene, player) {
    this.scene    = scene;
    this.player   = player;
    this.cooldown = 18;
    this._timer   = 0;
    this._active  = [];
    this.onCooldownUpdate = null;
  }

  isReady() { return this._timer <= 0; }
  getCooldownProgress() { return Math.min(1, 1 - this._timer / this.cooldown); }

  cast(enemies) {
    if (!this.isReady()) return false;

    // 5 hits rápidos a todos en rango
    let hitCount = 0;
    for (let h = 0; h < HITS; h++) {
      setTimeout(() => {
        for (const e of enemies) {
          if (e.isDead() || !e.mesh) continue;
          const d = this.player.position.distanceTo(e.mesh.position);
          if (d <= RANGE) e.takeDamage(DAMAGE_PER_HIT);
        }
      }, h * 120);
      hitCount++;
    }

    this._spawnEffect();
    this._timer = this.cooldown;
    if (this.onCooldownUpdate) this.onCooldownUpdate(0);
    return true;
  }

  update(delta) {
    if (this._timer > 0) {
      this._timer -= delta;
      if (this._timer < 0) this._timer = 0;
      if (this.onCooldownUpdate) this.onCooldownUpdate(this.getCooldownProgress());
    }

    for (let i = this._active.length - 1; i >= 0; i--) {
      const fx = this._active[i];
      fx.timer -= delta * 1000;
      const t = Math.max(0, fx.timer / DURATION);
      fx.mesh.rotation.y += delta * 15;
      fx.mesh.rotation.z += delta * 10;
      fx.mesh.material.opacity = t * 0.9;
      if (fx.timer <= 0) {
        this.scene.remove(fx.mesh);
        fx.mesh.geometry.dispose();
        fx.mesh.material.dispose();
        this._active.splice(i, 1);
      }
    }
  }

  _spawnEffect() {
    const geo  = new THREE.IcosahedronGeometry(RANGE * 0.6, 1);
    const mat  = new THREE.MeshBasicMaterial({
      color: 0xffffff, transparent: true, opacity: 0.9, wireframe: true,
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.copy(this.player.position).add(new THREE.Vector3(0, 0.8, 0));
    this.scene.add(mesh);
    this._active.push({ mesh, timer: DURATION });
  }
        }
