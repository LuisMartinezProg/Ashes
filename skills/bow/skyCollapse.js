// skills/bow/skyCollapse.js — Colapso del Cielo (Lluvia - Legendaria)
import * as THREE from 'three';

const DAMAGE         = 70;
const ARROW_COUNT    = 12;
const WAVES          = 5;
const WAVE_DELAY     = 200;
const RAIN_RADIUS    = 8.0;
const SPEED          = 20.0;
const MAX_RANGE      = 35;
const MAX_CAST_RANGE = 32;
const DURATION_VFX   = 700;

export class SkyCollapse {
  constructor(scene, player) {
    this.scene    = scene;
    this.player   = player;
    this.cooldown = 30;
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
    const targetPos = target.mesh.position.clone();
    for (let w = 0; w < WAVES; w++) {
      setTimeout(() => this._spawnRainWave(targetPos, enemies), w * WAVE_DELAY);
    }
    this._spawnChargeVFX(targetPos);
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

      if (p.type === 'vfx' || p.type === 'ring' || p.type === 'zone') {
        p.timer -= delta * 1000;
        const t = Math.max(0, p.timer / p.maxTimer);
        if (p.type === 'zone') {
          p.mesh.material.opacity = t * 0.25;
          p.mesh.rotation.y += delta * 1.2;
        } else {
          p.mesh.material.opacity = t * 0.7;
          if (p.type === 'ring') p.mesh.scale.setScalar(1 + (1 - t) * 2.5);
        }
        if (p.timer <= 0) {
          this.scene.remove(p.mesh);
          p.mesh.geometry.dispose();
          p.mesh.material.dispose();
          this._active.splice(i, 1);
        }
        continue;
      }

      // Flechas caen desde arriba (dirección diagonal)
      p.mesh.position.addScaledVector(p.direction, SPEED * delta);
      p.traveled += SPEED * delta;

      for (const e of p.enemies) {
        if (e.isDead() || !e.mesh || p.hit.has(e)) continue;
        const dx = p.mesh.position.x - e.mesh.position.x;
        const dz = p.mesh.position.z - e.mesh.position.z;
        if (Math.sqrt(dx * dx + dz * dz) < 1.2) {
          e.takeDamage(DAMAGE);
          p.hit.add(e);
        }
      }

      if (p.traveled > MAX_RANGE || p.mesh.position.y < 0) {
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

  _spawnRainWave(targetPos, enemies) {
    for (let i = 0; i < ARROW_COUNT; i++) {
      const angle  = (Math.PI * 2 / ARROW_COUNT) * i;
      const r      = Math.random() * RAIN_RADIUS;
      const startX = targetPos.x + Math.cos(angle) * r;
      const startZ = targetPos.z + Math.sin(angle) * r;

      const geo  = new THREE.CylinderGeometry(0.04, 0.04, 1.2, 4);
      const mat  = new THREE.MeshBasicMaterial({ color: 0x2255ff });
      const mesh = new THREE.Mesh(geo, mat);
      // Caen desde arriba
      mesh.position.set(startX, 14, startZ);
      const dir = new THREE.Vector3(0, -1, 0);
      mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);
      this.scene.add(mesh);
      this._active.push({ type: 'arrow', mesh, direction: dir, traveled: 0, enemies: [...enemies], hit: new Set() });
    }
  }

  _spawnChargeVFX(targetPos) {
    // Zona marcada en suelo
    const zGeo  = new THREE.CircleGeometry(RAIN_RADIUS, 20);
    const zMat  = new THREE.MeshBasicMaterial({ color: 0x2255ff, transparent: true, opacity: 0.25, side: THREE.DoubleSide });
    const zone  = new THREE.Mesh(zGeo, zMat);
    zone.position.set(targetPos.x, 0.08, targetPos.z);
    zone.rotation.x = -Math.PI / 2;
    this.scene.add(zone);
    this._active.push({ type: 'zone', mesh: zone, timer: WAVES * WAVE_DELAY + 800, maxTimer: WAVES * WAVE_DELAY + 800 });

    // Anillo exterior
    const rGeo = new THREE.RingGeometry(RAIN_RADIUS - 0.1, RAIN_RADIUS, 20);
    const rMat = new THREE.MeshBasicMaterial({ color: 0x88aaff, transparent: true, opacity: 0.7, side: THREE.DoubleSide });
    const ring = new THREE.Mesh(rGeo, rMat);
    ring.position.set(targetPos.x, 0.1, targetPos.z);
    ring.rotation.x = -Math.PI / 2;
    this.scene.add(ring);
    this._active.push({ type: 'ring', mesh: ring, timer: DURATION_VFX, maxTimer: DURATION_VFX });

    // Esfera en jugador
    const geo  = new THREE.SphereGeometry(0.5, 10, 10);
    const mat  = new THREE.MeshBasicMaterial({ color: 0x2255ff, transparent: true, opacity: 0.85 });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.copy(this.player.position).add(new THREE.Vector3(0, 1.2, 0));
    this.scene.add(mesh);
    this._active.push({ type: 'vfx', mesh, timer: DURATION_VFX, maxTimer: DURATION_VFX });
  }
        }
