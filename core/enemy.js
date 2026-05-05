// core/enemy.js — Enemigo placeholder
import * as THREE from 'three';

const ENEMY_MAX_HP   = 80;
const DEATH_DURATION = 800;

export class Enemy {
  constructor(scene, position = { x: 0, z: 0 }, onDeath = null) {
    this.scene   = scene;
    this.hp      = ENEMY_MAX_HP;
    this.maxHp   = ENEMY_MAX_HP;
    this.dead    = false;
    this.onDeath = onDeath;
    this.hudBar  = null;

    this.mesh = new THREE.Group();

    const bodyGeo = new THREE.CylinderGeometry(0.3, 0.3, 1.0, 10);
    const bodyMat = new THREE.MeshBasicMaterial({ color: 0xcc2222 });
    const body    = new THREE.Mesh(bodyGeo, bodyMat);
    body.position.y = 0.5;

    const headGeo = new THREE.SphereGeometry(0.3, 10, 10);
    const headMat = new THREE.MeshBasicMaterial({ color: 0xdd3333 });
    const head    = new THREE.Mesh(headGeo, headMat);
    head.position.y = 1.3;

    this.mesh.add(body, head);
    this.mesh.position.set(position.x, 0, position.z);

    this._materials    = [bodyMat, headMat];
    this._flashTimeout = null;
    this._dying        = false;
    this._dyingTimer   = 0;

    scene.add(this.mesh);
  }

  // ── API pública ─────────────────────────────────────────────────────────────

  isDead() { return this.dead; }

  takeDamage(amount) {
    if (this.dead) return;
    this.hp = Math.max(0, this.hp - amount);
    if (this.hudBar) this.hudBar.update(this.hp, this.maxHp);
    this._flashDamage();
    if (this.hp <= 0) this._startDeath();
  }

  update(delta) {
    if (this._dying) this._updateDeathAnim(delta);
  }

  // ── Internos ────────────────────────────────────────────────────────────────

  _flashDamage() {
    clearTimeout(this._flashTimeout);
    for (const mat of this._materials) mat.color.setHex(0xffffff);
    this._flashTimeout = setTimeout(() => {
      if (!this.dead) {
        this._materials[0].color.setHex(0xcc2222);
        this._materials[1].color.setHex(0xdd3333);
      }
    }, 120);
  }

  _startDeath() {
    this.dead        = true;
    this._dying      = true;
    this._dyingTimer = DEATH_DURATION;
    for (const mat of this._materials) mat.color.setHex(0x440000);
  }

  _updateDeathAnim(delta) {
    this._dyingTimer -= delta * 1000;
    this.mesh.position.y -= delta * 1.2;
    const t = Math.max(0, this._dyingTimer / DEATH_DURATION);
    this.mesh.scale.setScalar(t);
    if (this._dyingTimer <= 0) {
      this._dying = false;
      this.scene.remove(this.mesh);
      if (this.onDeath) this.onDeath(this);
    }
  }
}
