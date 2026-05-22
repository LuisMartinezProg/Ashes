// skills/bow/toxicCloud.js — Nube Tóxica (Veneno - Épica)
import * as THREE from 'three';

const DAMAGE         = 100;
const CLOUD_RADIUS   = 4.0;
const CLOUD_DURATION = 5000;
const DOT_DAMAGE     = 20;
const DOT_INTERVAL   = 800;
const SPEED          = 16.0;
const MAX_RANGE      = 35;
const MAX_CAST_RANGE = 30;
const DURATION_VFX   = 500;

export class ToxicCloud {
  constructor(scene, player) {
    this.scene    = scene;
    this.player   = player;
    this.cooldown = 16;
    this._timer   = 0;
    this._active  = [];
    this._clouds  = [];
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

    // Nubes activas — daño por zona
    for (let i = this._clouds.length - 1; i >= 0; i--) {
      const c = this._clouds[i];
      c.timer -= delta * 1000;
      c.tickTimer -= delta * 1000;
      const t = Math.max(0, c.timer / CLOUD_DURATION);
      c.mesh.material.opacity = t * 0.45;
      c.mesh.rotation.y += delta * 0.6;

      if (c.tickTimer <= 0) {
        c.tickTimer = DOT_INTERVAL;
        for (const e of c.enemies) {
          if (e.isDead() || !e.mesh) continue;
          const dx = c.pos.x - e.mesh.position.x;
          const dz = c.pos.z - e.mesh.position.z;
          if (Math.sqrt(dx * dx + dz * dz) <= CLOUD_RADIUS) {
            e.takeDamage(DOT_DAMAGE);
          }
        }
      }

      if (c.timer <= 0) {
        this.scene.remove(c.mesh);
        c.mesh.geometry.dispose();
        c.mesh.material.dispose();
        this._clouds.splice(i, 1);
      }
    }

    // VFX normales
    for (let i = this._active.length - 1; i >= 0; i--) {
      const p = this._active[i];

      if (p.type === 'vfx' || p.type === 'ring') {
        p.timer -= delta * 1000;
        const t = Math.max(0, p.timer / p.maxTimer);
        p.mesh.material.opacity = t * 0.7;
        if (p.type === 'ring') p.mesh.scale.setScalar(1 + (1 - t) * 1.8);
        if (p.timer <= 0) {
          this.scene.remove(p.mesh);
          p.mesh.geometry.dispose();
          p.mesh.material.dispose();
          this._active.splice(i, 1);
        }
        continue;
      }

      p.mesh.position.addScaledVector(p.direction, SPEED * delta);
      p.traveled += SPEED * delta;

      for (const e of p.enemies) {
        if (e.isDead() || !e.mesh || p.hit.has(e)) continue;
        const dx = p.mesh.position.x - e.mesh.position.x;
        const dz = p.mesh.position.z - e.mesh.position.z;
        if (Math.sqrt(dx * dx + dz * dz) < 1.0) {
          e.takeDamage(DAMAGE);
          p.hit.add(e);
          if (!p.cloudSpawned) {
            p.cloudSpawned = true;
            this._spawnCloud(p.mesh.position.clone(), p.enemies);
          }
        }
      }

      if (p.traveled > MAX_RANGE) {
        if (!p.cloudSpawned) {
          p.cloudSpawned = true;
          this._spawnCloud(p.mesh.position.clone(), p.enemies);
        }
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
    const geo  = new THREE.CylinderGeometry(0.05, 0.05, 1.4, 5);
    const mat  = new THREE.MeshBasicMaterial({ color: 0x00cc44 });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.copy(this.player.position).add(new THREE.Vector3(0, 1.2, 0));
    const dir = new THREE.Vector3(
      target.mesh.position.x - mesh.position.x, 0,
      target.mesh.position.z - mesh.position.z
    ).normalize();
    mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);
    this.scene.add(mesh);
    this._active.push({ type: 'arrow', mesh, direction: dir, traveled: 0, enemies: [...enemies], hit: new Set(), cloudSpawned: false });
  }

  _spawnChargeVFX() {
    const geo  = new THREE.SphereGeometry(0.38, 10, 10);
    const mat  = new THREE.MeshBasicMaterial({ color: 0x00cc44, transparent: true, opacity: 0.8 });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.copy(this.player.position).add(new THREE.Vector3(0, 1.2, 0));
    this.scene.add(mesh);
    this._active.push({ type: 'vfx', mesh, timer: DURATION_VFX, maxTimer: DURATION_VFX });
  }

  _spawnCloud(pos, enemies) {
    const geo  = new THREE.SphereGeometry(CLOUD_RADIUS * 0.8, 10, 6);
    const mat  = new THREE.MeshBasicMaterial({ color: 0x228833, transparent: true, opacity: 0.45 });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.scale.y = 0.3;
    mesh.position.copy(pos).add(new THREE.Vector3(0, 1.0, 0));
    this.scene.add(mesh);
    this._clouds.push({ mesh, pos, enemies: [...enemies], timer: CLOUD_DURATION, tickTimer: 0 });

    // Anillo suelo
    const rGeo = new THREE.RingGeometry(CLOUD_RADIUS - 0.1, CLOUD_RADIUS, 14);
    const rMat = new THREE.MeshBasicMaterial({ color: 0x44ff44, transparent: true, opacity: 0.5, side: THREE.DoubleSide });
    const ring = new THREE.Mesh(rGeo, rMat);
    ring.position.copy(pos).add(new THREE.Vector3(0, 0.05, 0));
    ring.rotation.x = -Math.PI / 2;
    this.scene.add(ring);
    this._active.push({ type: 'ring', mesh: ring, timer: 600, maxTimer: 600 });
  }
                           }
