// skills/katana/voidStep.js — Paso del Vacío (Sombra - Épica)
import * as THREE from 'three';

const DAMAGE   = 120;
const RANGE    = 5.0;
const DURATION = 700;

export class VoidStep {
  constructor(scene, player) {
    this.scene    = scene;
    this.player   = player;
    this.cooldown = 12;
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

    // Teletransporte detrás del enemigo más cercano + daño
    let nearest = null, minDist = Infinity;
    for (const e of inRange) {
      const dx = this.player.position.x - e.mesh.position.x;
      const dz = this.player.position.z - e.mesh.position.z;
      const d  = Math.sqrt(dx*dx + dz*dz);
      if (d < minDist) { minDist = d; nearest = e; }
    }

    if (nearest) {
      // Guardar pos original para efecto
      const origin = this.player.position.clone();

      // Mover jugador detrás del enemigo
      const dir = new THREE.Vector3(
        nearest.mesh.position.x - this.player.position.x,
        0,
        nearest.mesh.position.z - this.player.position.z
      ).normalize();
      this.player.position.set(
        nearest.mesh.position.x + dir.x * 1.2,
        this.player.position.y,
        nearest.mesh.position.z + dir.z * 1.2
      );

      this._spawnTrail(origin, this.player.position.clone());
    }

    // Daño a todos en rango
    inRange.forEach(e => {
      e.takeDamage(DAMAGE);
      e.applySlow?.(0.5, 2);
    });

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
      fx.mesh.material.opacity = t * 0.6;
      fx.mesh.scale.setScalar(1 + (1 - t) * 1.2);
      if (fx.timer <= 0) {
        this.scene.remove(fx.mesh);
        fx.mesh.geometry.dispose();
        fx.mesh.material.dispose();
        this._active.splice(i, 1);
      }
    }
  }

  _spawnTrail(from, to) {
    // Efecto en origen
    const geoA = new THREE.SphereGeometry(0.4, 8, 8);
    const matA = new THREE.MeshBasicMaterial({ color: 0x6600aa, transparent: true, opacity: 0.8 });
    const meshA = new THREE.Mesh(geoA, matA);
    meshA.position.copy(from).add(new THREE.Vector3(0, 0.8, 0));
    this.scene.add(meshA);
    this._active.push({ mesh: meshA, timer: DURATION });

    // Efecto en destino
    const geoB = new THREE.SphereGeometry(0.5, 8, 8);
    const matB = new THREE.MeshBasicMaterial({ color: 0xaa00ff, transparent: true, opacity: 0.9 });
    const meshB = new THREE.Mesh(geoB, matB);
    meshB.position.copy(to).add(new THREE.Vector3(0, 0.8, 0));
    this.scene.add(meshB);
    this._active.push({ mesh: meshB, timer: DURATION * 0.7 });

    // Anillo en destino
    const geoC = new THREE.RingGeometry(0.3, 1.2, 12);
    const matC = new THREE.MeshBasicMaterial({ color: 0xaa00ff, transparent: true, opacity: 0.6, side: THREE.DoubleSide });
    const meshC = new THREE.Mesh(geoC, matC);
    meshC.position.copy(to).add(new THREE.Vector3(0, 0.1, 0));
    meshC.rotation.x = -Math.PI / 2;
    this.scene.add(meshC);
    this._active.push({ mesh: meshC, timer: DURATION * 0.5 });
  }
}
