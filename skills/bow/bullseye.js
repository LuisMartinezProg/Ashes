// skills/bow/bullseye.js — Ojo de Toro (Precisión - Épica)
import * as THREE from 'three';

const DAMAGE         = 220;
const SPEED          = 22.0;
const MAX_RANGE      = 50;
const MAX_CAST_RANGE = 45;
const STUN_DURATION  = 2000;
const DURATION_VFX   = 600;
const CRIT_MULT      = 2.5;

export class Bullseye {
  constructor(scene, player) {
    this.scene    = scene;
    this.player   = player;
    this.cooldown = 14;
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
    this._spawnChargeVFX();
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

      if (p.type === 'vfx') {
        p.timer -= delta * 1000;
        const t = Math.max(0, p.timer / DURATION_VFX);
        p.mesh.material.opacity = t * 0.85;
        p.mesh.scale.setScalar(1 + (1 - t) * 0.8);
        if (p.timer <= 0) {
          this.scene.remove(p.mesh);
          p.mesh.geometry.dispose();
          p.mesh.material.dispose();
          this._active.splice(i, 1);
        }
        continue;
      }

      if (p.type === 'ring') {
        p.timer -= delta * 1000;
        const t = Math.max(0, p.timer / DURATION_VFX);
        p.mesh.scale.setScalar(1 + (1 - t) * 2.0);
        p.mesh.material.opacity = t * 0.6;
        if (p.timer <= 0) {
          this.scene.remove(p.mesh);
          p.mesh.geometry.dispose();
          p.mesh.material.dispose();
          this._active.splice(i, 1);
        }
        continue;
      }

      // Flecha
      p.mesh.position.addScaledVector(p.direction, SPEED * delta);
      p.traveled += SPEED * delta;

      for (const e of p.enemies) {
        if (e.isDead() || !e.mesh || p.hit.has(e)) continue;
        const dx = p.mesh.position.x - e.mesh.position.x;
        const dz = p.mesh.position.z - e.mesh.position.z;
        if (Math.sqrt(dx * dx + dz * dz) < 1.0) {
          // Primer impacto: daño crítico + stun
          const isFirst = p.hit.size === 0;
          const dmg = isFirst ? DAMAGE * CRIT_MULT : DAMAGE;
          e.takeDamage(dmg);
          if (isFirst) {
            e.applySlow?.(0, STUN_DURATION / 1000);
            this._spawnImpactVFX(e.mesh.position);
          }
          p.hit.add(e);
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
      const d  = Math.sqrt(dx * dx + dz * dz);
      if (d < minDist && d < MAX_CAST_RANGE) { minDist = d; closest = e; }
    }
    return closest;
  }

  _spawnArrow(target, enemies) {
    // Flecha dorada más gruesa que snipe
    const geo  = new THREE.CylinderGeometry(0.05, 0.05, 1.8, 5);
    const mat  = new THREE.MeshBasicMaterial({ color: 0xffdd00 });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.copy(this.player.position).add(new THREE.Vector3(0, 1.2, 0));
    const dir = new THREE.Vector3(
      target.mesh.position.x - mesh.position.x, 0,
      target.mesh.position.z - mesh.position.z
    ).normalize();
    mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);
    this.scene.add(mesh);
    this._active.push({ type: 'arrow', mesh, direction: dir, traveled: 0, enemies: [...enemies], hit: new Set() });
  }

  _spawnChargeVFX() {
    const origin = this.player.position.clone().add(new THREE.Vector3(0, 1.2, 0));

    // Esfera de carga dorada
    const geo  = new THREE.SphereGeometry(0.4, 10, 10);
    const mat  = new THREE.MeshBasicMaterial({ color: 0xffdd00, transparent: true, opacity: 0.85 });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.copy(origin);
    this.scene.add(mesh);
    this._active.push({ type: 'vfx', mesh, timer: DURATION_VFX });

    // Anillo en el suelo bajo el jugador
    const rGeo = new THREE.RingGeometry(0.2, 0.8, 12);
    const rMat = new THREE.MeshBasicMaterial({ color: 0xffaa00, transparent: true, opacity: 0.6, side: THREE.DoubleSide });
    const ring = new THREE.Mesh(rGeo, rMat);
    ring.position.copy(this.player.position).add(new THREE.Vector3(0, 0.05, 0));
    ring.rotation.x = -Math.PI / 2;
    this.scene.add(ring);
    this._active.push({ type: 'ring', mesh: ring, timer: DURATION_VFX });
  }

  _spawnImpactVFX(pos) {
    // Explosión de anillos dorados en el punto de impacto
    [0.4, 0.8, 1.4].forEach((r, i) => {
      const rGeo = new THREE.RingGeometry(r - 0.08, r, 12);
      const rMat = new THREE.MeshBasicMaterial({ color: 0xffdd00, transparent: true, opacity: 0.7, side: THREE.DoubleSide });
      const ring = new THREE.Mesh(rGeo, rMat);
      ring.position.copy(pos).add(new THREE.Vector3(0, 0.05, 0));
      ring.rotation.x = -Math.PI / 2;
      this.scene.add(ring);
      this._active.push({ type: 'ring', mesh: ring, timer: DURATION_VFX - i * 80 });
    });
  }
          }
