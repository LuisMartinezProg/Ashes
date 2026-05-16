// skills/katana/thunderSlash.js — Tajo Trueno (Tormenta)
import * as THREE from 'three';

const DAMAGE   = 50;
const RANGE    = 3.5;
const DURATION = 300;

export class ThunderSlash {
  constructor(scene, player) {
    this.scene    = scene;
    this.player   = player;
    this.cooldown = 4;
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
      fx.mesh.scale.setScalar(1 + (1 - t) * 1.5);
      if (fx.timer <= 0) {
        this.scene.remove(fx.mesh);
        fx.mesh.geometry.dispose();
        fx.mesh.material.dispose();
        this._active.splice(i, 1);
      }
    }
  }

  _spawnEffect() {
    const geo = new THREE.RingGeometry(0.2, RANGE, 6);
    const mat = new THREE.MeshBasicMaterial({
      color: 0xffff00, transparent: true, opacity: 0.8, side: THREE.DoubleSide,
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.copy(this.player.position).add(new THREE.Vector3(0, 0.5, 0));
    mesh.rotation.x = -Math.PI / 2;
    this.scene.add(mesh);
    this._active.push({ mesh, timer: DURATION });

    // Rayo vertical
    const boltGeo = new THREE.CylinderGeometry(0.05, 0.05, 2.5, 4);
    const boltMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.9 });
    const bolt = new THREE.Mesh(boltGeo, boltMat);
    bolt.position.copy(this.player.position).add(new THREE.Vector3(0, 1.5, 0));
    this.scene.add(bolt);
    this._active.push({ mesh: bolt, timer: DURATION * 0.4 });
  }
}
