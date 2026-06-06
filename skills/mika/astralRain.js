// skills/mika/astralRain.js — Lluvia Astral (media de Mika)
import * as THREE from 'three';

const DAMAGE         = 45;
const ARROW_COUNT    = 6;
const MAX_CAST_RANGE = 20;
const FALL_SPEED     = 18;

export class AstralRain {
  constructor(scene, player) {
    this.scene    = scene;
    this.player   = player;
    this.cooldown = 8;
    this._timer   = 0;
    this._active  = [];
    this.onCooldownUpdate = null;
  }

  isReady() { return this._timer <= 0; }
  getCooldownProgress() { return Math.min(1, 1 - this._timer / this.cooldown); }

  cast(enemies) {
    if (!this.isReady()) return false;
    const target = this._findAreaTarget(enemies);
    if (!target) return false;

    const center = target.mesh.position.clone();

    // Disparar múltiples flechas en abanico hacia el área
    for (let i = 0; i < ARROW_COUNT; i++) {
      const angle  = (Math.PI * 2 / ARROW_COUNT) * i;
      const offset = new THREE.Vector3(
        Math.cos(angle) * (1.5 + Math.random() * 2),
        0,
        Math.sin(angle) * (1.5 + Math.random() * 2)
      );
      const landPos = center.clone().add(offset);

      setTimeout(() => {
        this._spawnFallingArrow(landPos, enemies);
      }, i * 80);
    }

    // Aplicar aura astral al objetivo central
    window._partyManager?.reactions?.applyElement(target, 'astral');

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
      const p = this._active[i];
      p.mesh.position.y -= FALL_SPEED * delta;

      if (p.mesh.position.y <= 0.5) {
        // Impacto — daño en área pequeña
        for (const e of p.enemies) {
          if (e.isDead() || !e.mesh) continue;
          const dx = p.landPos.x - e.mesh.position.x;
          const dz = p.landPos.z - e.mesh.position.z;
          if (Math.sqrt(dx*dx + dz*dz) < 1.5) {
            e.takeDamage(DAMAGE);
          }
        }
        this._spawnImpact(p.landPos);
        this.scene.remove(p.mesh);
        p.mesh.geometry.dispose();
        p.mesh.material.dispose();
        this._active.splice(i, 1);
      }
    }
  }

  _findAreaTarget(enemies) {
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

  _spawnFallingArrow(landPos, enemies) {
    const geo = new THREE.CylinderGeometry(0.04, 0.04, 0.8, 5);
    const mat = new THREE.MeshBasicMaterial({
      color: 0x88ccff, transparent: true, opacity: 0.85,
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(landPos.x, 10 + Math.random() * 3, landPos.z);
    mesh.rotation.x = Math.PI / 2;
    this.scene.add(mesh);
    this._active.push({ mesh, landPos, enemies: [...enemies] });
  }

  _spawnImpact(pos) {
    const geo  = new THREE.RingGeometry(0.1, 0.6, 8);
    const mat  = new THREE.MeshBasicMaterial({
      color: 0x88aaff, transparent: true, opacity: 0.7, side: THREE.DoubleSide,
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.copy(pos).add(new THREE.Vector3(0, 0.1, 0));
    mesh.rotation.x = -Math.PI / 2;
    this.scene.add(mesh);

    const start = performance.now();
    const animate = () => {
      const t = Math.max(0, 1 - (performance.now() - start) / 400);
      mesh.scale.setScalar(1 + (1 - t) * 2.5);
      mesh.material.opacity = t * 0.7;
      if (t > 0) requestAnimationFrame(animate);
      else { this.scene.remove(mesh); geo.dispose(); mat.dispose(); }
    };
    requestAnimationFrame(animate);
  }
}
