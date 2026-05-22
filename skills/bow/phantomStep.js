// skills/bow/phantomStep.js — Paso Fantasma (Agilidad - Épica)
import * as THREE from 'three';

const DAMAGE         = 130;
const DASH_DISTANCE  = 6.0;
const DASH_COUNT     = 2;
const DASH_DURATION  = 180;
const SPEED          = 20.0;
const MAX_RANGE      = 32;
const MAX_CAST_RANGE = 30;
const DURATION_VFX   = 450;

export class PhantomStep {
  constructor(scene, player) {
    this.scene      = scene;
    this.player     = player;
    this.cooldown   = 14;
    this._timer     = 0;
    this._active    = [];
    this._dashQueue = [];
    this._dashing   = false;
    this._dashTimer = 0;
    this._dashDir   = new THREE.Vector3();
    this.onCooldownUpdate = null;
  }

  isReady() { return this._timer <= 0; }
  getCooldownProgress() { return Math.min(1, 1 - this._timer / this.cooldown); }

  cast(enemies) {
    if (!this.isReady()) return false;
    const target = this._findTarget(enemies);
    if (!target) return false;

    const toEnemy = new THREE.Vector3(
      target.mesh.position.x - this.player.position.x, 0,
      target.mesh.position.z - this.player.position.z
    ).normalize();

    // Dos dashes: izquierda → derecha
    this._dashQueue = [
      new THREE.Vector3(-toEnemy.z, 0, toEnemy.x),
      new THREE.Vector3(toEnemy.z, 0, -toEnemy.x)
    ];
    this._startNextDash();

    // Disparo al final de ambos dashes
    setTimeout(() => {
      this._spawnArrow(target, enemies);
      this._spawnChargeVFX();
    }, DASH_DURATION * DASH_COUNT + 100);

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
      this._spawnAfterimage();
      if (this._dashTimer <= 0) {
        this._dashing = false;
        if (this._dashQueue.length > 0) {
          setTimeout(() => this._startNextDash(), 80);
        }
      }
    }

    for (let i = this._active.length - 1; i >= 0; i--) {
      const p = this._active[i];

      if (p.type === 'vfx' || p.type === 'after') {
        p.timer -= delta * 1000;
        const t = Math.max(0, p.timer / p.maxTimer);
        p.mesh.material.opacity = t * (p.type === 'after' ? 0.35 : 0.75);
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
  }

  _spawnAfterimage() {
    const geo  = new THREE.SphereGeometry(0.25, 6, 6);
    const mat  = new THREE.MeshBasicMaterial({ color: 0xaaaaff, transparent: true, opacity: 0.35 });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.copy(this.player.position).add(new THREE.Vector3(0, 0.8, 0));
    this.scene.add(mesh);
    this._active.push({ type: 'after', mesh, timer: 300, maxTimer: 300 });
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
    const geo  = new THREE.CylinderGeometry(0.05, 0.05, 1.5, 5);
    const mat  = new THREE.MeshBasicMaterial({ color: 0xddaaff });
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
    const geo  = new THREE.SphereGeometry(0.38, 10, 10);
    const mat  = new THREE.MeshBasicMaterial({ color: 0xddaaff, transparent: true, opacity: 0.8 });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.copy(this.player.position).add(new THREE.Vector3(0, 1.2, 0));
    this.scene.add(mesh);
    this._active.push({ type: 'vfx', mesh, timer: DURATION_VFX, maxTimer: DURATION_VFX });
  }
      }
