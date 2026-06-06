// skills/mika/astralArrow.js — Flecha Astral (básica de Mika)
import * as THREE from 'three';

const DAMAGE         = 55;
const SPEED          = 12.0;
const MAX_RANGE      = 28;
const MAX_CAST_RANGE = 25;

export class AstralArrow {
  constructor(scene, player) {
    this.scene    = scene;
    this.player   = player;
    this.cooldown = 3;
    this._timer   = 0;
    this._active  = [];
    this.onCooldownUpdate = null;
  }

  isReady() { return this._timer <= 0; }
  getCooldownProgress() { return Math.min(1, 1 - this._timer / this.cooldown); }

  cast(enemies) {
    if (!this.isReady()) return false;
    const target = this._findTarget(enemies);
    if (!target) return false;
    this._spawnArrow(target, enemies);
    this._timer = this.cooldown;
    if (this.onCooldownUpdate) this.onCooldownUpdate(0);
    // Aplicar aura Astral al enemigo para reacciones
    window._partyManager?.reactions?.applyElement(target, 'astral');
    return true;
  }

  update(delta) {
    if (this._timer > 0) {
      this._timer -= delta;
      if (this._timer < 0) this._timer = 0;
      if (this.onCooldownUpdate) this.onCooldownUpdate(this.getCooldownProgress());
    }
    for (let i = this._active.length - 1; i >= 0; i--) {
      const p = this._active[i];
      p.mesh.position.addScaledVector(p.direction, SPEED * delta);
      p.traveled += SPEED * delta;

      // Efecto de brillo astral en trayectoria
      p.mesh.material.opacity = 0.7 + Math.sin(p.traveled * 3) * 0.3;

      for (const e of p.enemies) {
        if (e.isDead() || !e.mesh || p.hit.has(e)) continue;
        const dx = p.mesh.position.x - e.mesh.position.x;
        const dz = p.mesh.position.z - e.mesh.position.z;
        if (Math.sqrt(dx*dx + dz*dz) < 1.2) {
          e.takeDamage(DAMAGE);
          p.hit.add(e);
          this._spawnImpactVFX(p.mesh.position);
        }
      }

      if (p.traveled > MAX_RANGE) {
        this.scene.remove(p.mesh);
        p.mesh.geometry.dispose();
        p.mesh.material.dispose();
        this._active.splice(i, 1);
      }
    }
  }

  _findTarget(enemies) {
    let closest = null, minDist = Infinity;
    for (const e of enemies) {
      if (e.isDead() || !e.mesh) continue;
      const dx = this.player.position.x - e.mesh.position.x;
      const dz = this.player.position.z - e.mesh.position.z;
      const d  = Math.sqrt(dx*dx + dz*dz);
      if (d < minDist && d < MAX_CAST_RANGE) { minDist = d; closest = e; }
    }
    return closest;
  }

  _spawnArrow(target, enemies) {
    const geo  = new THREE.CylinderGeometry(0.05, 0.05, 1.0, 6);
    const mat  = new THREE.MeshBasicMaterial({
      color      : 0xaaddff,
      transparent: true,
      opacity    : 0.9,
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.copy(this.player.position).add(new THREE.Vector3(0, 1.2, 0));

    const dir = new THREE.Vector3(
      target.mesh.position.x - mesh.position.x, 0,
      target.mesh.position.z - mesh.position.z
    ).normalize();
    mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);

    // Halo astral alrededor de la flecha
    const haloGeo = new THREE.SphereGeometry(0.15, 6, 6);
    const haloMat = new THREE.MeshBasicMaterial({
      color: 0x88aaff, transparent: true, opacity: 0.4,
    });
    const halo = new THREE.Mesh(haloGeo, haloMat);
    mesh.add(halo);

    this.scene.add(mesh);
    this._active.push({
      mesh, direction: dir, traveled: 0,
      enemies: [...enemies], hit: new Set(),
    });
  }

  _spawnImpactVFX(pos) {
    const geo  = new THREE.SphereGeometry(0.5, 8, 8);
    const mat  = new THREE.MeshBasicMaterial({
      color: 0xaaddff, transparent: true, opacity: 0.8,
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.copy(pos);
    this.scene.add(mesh);

    const start = performance.now();
    const animate = () => {
      const t = Math.max(0, 1 - (performance.now() - start) / 300);
      mesh.scale.setScalar(1 + (1 - t) * 2);
      mesh.material.opacity = t * 0.8;
      if (t > 0) requestAnimationFrame(animate);
      else { this.scene.remove(mesh); geo.dispose(); mat.dispose(); }
    };
    requestAnimationFrame(animate);
  }
}
