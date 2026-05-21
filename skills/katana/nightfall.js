// skills/katana/nightfall.js — Caída Nocturna (Sombra - Rara)
import * as THREE from 'three';

const DAMAGE   = 75;
const RANGE    = 4.0;
const DURATION = 500;

export class Nightfall {
  constructor(scene, player) {
    this.scene    = scene;
    this.player   = player;
    this.cooldown = 7;
    this._timer   = 0;
    this._active  = [];
    this.onCooldownUpdate = null;
  }

  isReady() { return this._timer <= 0; }
  getCooldownProgress() { return Math.min(1, 1 - this._timer / this.cooldown); }

  cast(enemies) {
    if (!this.isReady()) return false;
    const inRange = enemies.filter(e => {
      if (e.isDead() || !e.mesh) return false;
      const dx = this.player.position.x - e.mesh.position.x;
      const dz = this.player.position.z - e.mesh.position.z;
      return Math.sqrt(dx*dx + dz*dz) <= RANGE;
    });
    if (inRange.length === 0) return false;

    // Daño + ralentiza
    inRange.forEach(e => {
      e.takeDamage(DAMAGE);
      e.applySlow?.(0.4, 3);
    });

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
      fx.mesh.rotation.y += delta * 6;
      fx.mesh.material.opacity = t * 0.7;
      fx.mesh.scale.setScalar(1 + (1 - t) * 0.8);
      if (fx.timer <= 0) {
        this.scene.remove(fx.mesh);
        fx.mesh.geometry.dispose();
        fx.mesh.material.dispose();
        this._active.splice(i, 1);
      }
    }
  }

  _spawnEffect() {
    const geo = new THREE.TorusGeometry(RANGE * 0.5, 0.06, 6, 20);
    const mat = new THREE.MeshBasicMaterial({
      color: 0x440066, transparent: true, opacity: 0.7,
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.copy(this.player.position).add(new THREE.Vector3(0, 0.8, 0));
    this.scene.add(mesh);
    this._active.push({ mesh, timer: DURATION });

    // Partículas oscuras
    for (let i = 0; i < 5; i++) {
      const pGeo = new THREE.SphereGeometry(0.08, 4, 4);
      const pMat = new THREE.MeshBasicMaterial({ color: 0x220044, transparent: true, opacity: 0.8 });
      const p    = new THREE.Mesh(pGeo, pMat);
      const angle = (i / 5) * Math.PI * 2;
      p.position.copy(this.player.position).add(new THREE.Vector3(
        Math.cos(angle) * RANGE * 0.4, 0.5, Math.sin(angle) * RANGE * 0.4
      ));
      this.scene.add(p);
      this._active.push({ mesh: p, timer: DURATION * 0.6 });
    }
  }
}
