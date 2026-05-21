// skills/katana/staticField.js — Campo Estático (Tormenta - Rara)
import * as THREE from 'three';

const DAMAGE   = 70;
const RANGE    = 4.0;
const DURATION = 500;

export class StaticField {
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

    inRange.forEach(e => e.takeDamage(DAMAGE));
    if (inRange.length > 1) {
      setTimeout(() => {
        inRange.forEach(e => { if (!e.isDead()) e.takeDamage(DAMAGE * 0.4); });
      }, 200);
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
      fx.mesh.scale.setScalar(1 + (1 - t) * 1.2);
      if (fx.type === 'bolt') fx.mesh.rotation.y += delta * 20;
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

    const rGeo = new THREE.RingGeometry(0.2, RANGE, 8);
    const rMat = new THREE.MeshBasicMaterial({ color: 0xffff00, transparent: true, opacity: 0.7, side: THREE.DoubleSide });
    const ring = new THREE.Mesh(rGeo, rMat);
    ring.position.copy(origin).add(new THREE.Vector3(0, 0.3, 0));
    ring.rotation.x = -Math.PI / 2;
    this.scene.add(ring);
    this._active.push({ mesh: ring, timer: DURATION, type: 'ring' });

    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2;
      const bGeo  = new THREE.CylinderGeometry(0.03, 0.03, 2.0, 4);
      const bMat  = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.9 });
      const bolt  = new THREE.Mesh(bGeo, bMat);
      bolt.position.copy(origin).add(new THREE.Vector3(
        Math.cos(angle) * RANGE * 0.6, 1.0, Math.sin(angle) * RANGE * 0.6
      ));
      this.scene.add(bolt);
      this._active.push({ mesh: bolt, timer: DURATION * 0.3, type: 'bolt' });
    }
  }
        }
