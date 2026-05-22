// skills/bow/voidDance.js — Danza del Vacío (Agilidad - Legendaria)
import * as THREE from 'three';

const DAMAGE         = 190;
const DASH_DISTANCE  = 7.0;
const DASH_COUNT     = 4;
const DASH_DURATION  = 160;
const SHOT_PER_DASH  = true;
const SPEED          = 22.0;
const MAX_RANGE      = 35;
const MAX_CAST_RANGE = 32;
const DURATION_VFX   = 500;

export class VoidDance {
  constructor(scene, player) {
    this.scene      = scene;
    this.player     = player;
    this.cooldown   = 24;
    this._timer     = 0;
    this._active    = [];
    this._dashQueue = [];
    this._dashing   = false;
    this._dashTimer = 0;
    this._dashDir   = new THREE.Vector3();
    this._enemies   = [];
    this._target    = null;
    this.onCooldownUpdate = null;
  }

  isReady() { return this._timer <= 0; }
  getCooldownProgress() { return Math.min(1, 1 - this._timer / this.cooldown); }

  cast(enemies) {
    if (!this.isReady()) return false;
    const target = this._findTarget(enemies);
    if (!target) return false;

    this._enemies = [...enemies];
    this._target  = target;

    const toEnemy = new THREE.Vector3(
      target.mesh.position.x - this.player.position.x, 0,
      target.mesh.position.z - this.player.position.z
    ).normalize();

    // 4 dashes en cruz alrededor del enemigo
    this._dashQueue = [
      new THREE.Vector3(-toEnemy.z, 0, toEnemy.x),
      toEnemy.clone(),
      new THREE.Vector3(toEnemy.z, 0, -toEnemy.x),
      toEnemy.clone().negate()
    ];

    this._startNextDash();
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

    if (this._dashing) {
      this._dashTimer -= delta * 1000;
      const speed = DASH_DISTANCE / (DASH_DURATION / 1000);
      this.player.position.addScaledVector(this._dashDir, speed * delta);
      this._spawnVoidTrail();
      if (this._dashTimer <= 0) {
        this._dashing = false;
        // Disparo al final de cada dash
        if (this._target && this._target.mesh) {
          this._spawnArrow(this._target, this._enemies);
        }
        if (this._dashQueue.length > 0) {
          setTimeout(() => this._startNextDash(), 60);
        }
      }
    }

    for (let i = this._active.length - 1; i >= 0; i--) {
      const p = this._active[i];

      if (p.type === 'vfx' || p.type === 'trail' || p.type === 'ring') {
        p.timer -= delta * 1000;
        const t = Math.max(0, p.timer / p.maxTimer);
        if (p.type === 'trail') {
          p.mesh.material.opacity = t * 0.4;
          p.mesh.scale.setScalar(1 + (1 - t) * 0.5);
        } else if (p.type === 'ring') {
          p.mesh.material.opacity = t * 0.6;
          p.mesh.scale.setScalar(1 + (1 - t) * 2.0);
        } else {
          p.mesh.material.opacity = t * 0.85;
        }
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
          this._spawnImpactRing(e.mesh.position);
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

  _startNextDash() {
    if (this._dashQueue.length === 0) return;
    this._dashDir.copy(this._dashQueue.shift());
    this._dashing   = true;
    this._dashTimer = DASH_DURATION;
    this._spawnDashVFX();
  }

  _spawnVoidTrail() {
    const geo  = new THREE.SphereGeometry(0.15, 4, 4);
    const mat  = new THREE.MeshBasicMaterial({ color: 0x8800ff, transparent: true, opacity: 0.4 });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.copy(this.player.position).add(new THREE.Vector3(0, 0.8, 0));
    this.scene.add(mesh);
    this._active.push({ type: 'trail', mesh, timer: 350, maxTimer: 350 });
  }

  _spawnDashVFX() {
    const geo  = new THREE.SphereGeometry(0.45, 10, 10);
    const mat  = new THREE.MeshBasicMaterial({ color: 0x8800ff, transparent: true, opacity: 0.85 });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.copy(this.player.position).add(new THREE.Vector3(0, 1.2, 0));
    this.scene.add(mesh);
    this._active.push({ type: 'vfx', mesh, timer: DURATION_VFX, maxTimer: DURATION_VFX });
  }

  _spawnImpactRing(pos) {
    const rGeo = new THREE.RingGeometry(0.15, 0.7, 10);
    const rMat = new THREE.MeshBasicMaterial({ color: 0xcc44ff, transparent: true, opacity: 0.6, side: THREE.DoubleSide });
    const ring = new THREE.Mesh(rGeo, rMat);
    ring.position.copy(pos).add(new THREE.Vector3(0, 0.05, 0));
    ring.rotation.x = -Math.PI / 2;
    this.scene.add(ring);
    this._active.push({ type: 'ring', mesh: ring, timer: 400, maxTimer: 400 });
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
    if (!target.mesh) return;
    const geo  = new THREE.CylinderGeometry(0.06, 0.06, 1.7, 5);
    const mat  = new THREE.MeshBasicMaterial({ color: 0xcc44ff });
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
                                                 }
