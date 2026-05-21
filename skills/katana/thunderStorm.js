// skills/katana/thunderStorm.js — Tormenta Eléctrica (Tormenta - Épica)
import * as THREE from 'three';

const DAMAGE     = 140;
const RANGE      = 5.0;
const DURATION   = 900;
const STRIKE_DMG = 50;
const STRIKES    = 4;

export class ThunderStorm {
  constructor(scene, player) {
    this.scene    = scene;
    this.player   = player;
    this.cooldown = 15;
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

    inRange.forEach(e => e.takeDamage(DAMAGE));

    for (let s = 1; s <= STRIKES; s++) {
      setTimeout(() => {
        inRange.forEach(e => { if (!e.isDead()) e.takeDamage(STRIKE_DMG); });
        this._spawnStrike();
      }, s * 300);
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
      fx.mesh.material.opacity = t * 0.8;
      if (fx.type === 'cloud') fx.mesh.scale.setScalar(1 + (1 - t) * 0.5);
      if (fx.type === 'ring')  fx.mesh.scale.setScalar(1 + (1 - t) * 2.0);
      if (fx.timer <= 0) {
        this.scene.remove(fx.mesh);
        fx.mesh.geometry.dispose();
        fx.mesh.material.dispose();
        this._active.splice(i, 1);
      }
    }
  }

  _spawnEffect() {
    const origin = this.player.position.clone();

    const cGeo  = new THREE.SphereGeometry(2.5, 8, 6);
    const cMat  = new THREE.MeshBasicMaterial({ color: 0x223344, transparent: true, opacity: 0.4 });
    const cloud = new THREE.Mesh(cGeo, cMat);
    cloud.scale.y = 0.3;
    cloud.position.copy(origin).add(new THREE.Vector3(0, 5, 0));
    this.scene.add(cloud);
    this._active.push({ mesh: cloud, timer: DURATION, type: 'cloud' });

    const rGeo = new THREE.RingGeometry(0.1, RANGE, 12);
    const rMat = new THREE.MeshBasicMaterial({ color: 0xffff44, transparent: true, opacity: 0.6, side: THREE.DoubleSide });
    const ring = new THREE.Mesh(rGeo, rMat);
    ring.position.copy(origin).add(new THREE.Vector3(0, 0.05, 0));
    ring.rotation.x = -Math.PI / 2;
    this.scene.add(ring);
    this._active.push({ mesh: ring, timer: DURATION, type: 'ring' });
  }

  _spawnStrike() {
    const origin = this.player.position.clone();
    const angle  = Math.random() * Math.PI * 2;
    const dist   = Math.random() * RANGE * 0.8;

    const bGeo = new THREE.CylinderGeometry(0.04, 0.04, 4.0, 4);
    const bMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 1.0 });
    const bolt = new THREE.Mesh(bGeo, bMat);
    bolt.position.copy(origin).add(new THREE.Vector3(
      Math.cos(angle) * dist, 2.0, Math.sin(angle) * dist
    ));
    this.scene.add(bolt);
    this._active.push({ mesh: bolt, timer: 150, type: 'bolt' });

    const fGeo = new THREE.SphereGeometry(0.3, 6, 6);
    const fMat = new THREE.MeshBasicMaterial({ color: 0xffff88, transparent: true, opacity: 0.9 });
    const flash = new THREE.Mesh(fGeo, fMat);
    flash.position.copy(origin).add(new THREE.Vector3(
      Math.cos(angle) * dist, 0.3, Math.sin(angle) * dist
    ));
    this.scene.add(flash);
    this._active.push({ mesh: flash, timer: 150, type: 'flash' });
  }
}
