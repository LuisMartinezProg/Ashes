// core/enemy.js — Enemigo placeholder
// Fase 2: estático, recibe daño, muere con animación simple.
//
// USO:
//   import { Enemy } from './core/enemy.js';
//   const enemy = new Enemy(scene, { x: 3, z: -2 });
//   combat.registerEnemy(enemy);
//
// En el loop:
//   enemy.update(delta);

import * as THREE from 'three';

const ENEMY_MAX_HP   = 80;
const DEATH_DURATION = 800; // ms de animación de muerte (se hunde)

export class Enemy {
  constructor(scene, position = { x: 0, z: 0 }, onDeath = null) {
    this.scene    = scene;
    this.hp       = ENEMY_MAX_HP;
    this.maxHp    = ENEMY_MAX_HP;
    this.dead     = false;
    this.onDeath  = onDeath; // callback opcional al morir

    // Referencia al HUD (se asigna desde hud.js)
    this.hudBar = null;

    // ── Mesh: cápsula roja (cilindro + esferas) ─────────────────────────────
    this.mesh = new THREE.Group();

    const bodyGeo  = new THREE.CylinderGeometry(0.3, 0.3, 1.0, 10);
    const bodyMat  = new THREE.MeshBasicMaterial({ color: 0xcc2222 });
    const body     = new THREE.Mesh(bodyGeo, bodyMat);
    body.position.y = 0.5;

    const headGeo  = new THREE.SphereGeometry(0.3, 10, 10);
    const headMat  = new THREE.MeshBasicMaterial({ color: 0xdd3333 });
    const head     = new THREE.Mesh(headGeo, headMat);
    head.position.y = 1.3;

    this.mesh.add(body, head);
    this.mesh.position.set(position.x, 0, position.z);

    // Referencia a los materiales para flash de daño
    this._materials = [bodyMat, headMat];
    this._flashTimeout = null;

    // Estado de animación de muerte
    this._dying      = false;
    this._dyingTimer = 0;

    scene.add(this.mesh);
  }

  // ── API pública ─────────────────────────────────────────────────────────────
/** Retorna true si el enemigo está muerto. */
isDead() { return this.dead; }
// ── API pública ─────────────────────────────────────────────────────────────

/** Recibe daño. Llamado por CombatSystem. */
takeDamage(amount) {

  /** Recibe daño. Llamado por CombatSystem. */
  takeDamage(amount) {
    if (this.dead) return;

    this.hp = Math.max(0, this.hp - amount);

    // Actualiza barra de vida del HUD
    if (this.hudBar) this.hudBar.update(this.hp, this.maxHp);

    // Flash blanco de daño
    this._flashDamage();

    if (this.hp <= 0) this._startDeath();
  }

  /** Llamado cada frame desde el loop. */
  update(delta) {
    if (this._dying) {
      this._updateDeathAnim(delta);
    }
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

    // Oscurece el color para indicar muerte
    for (const mat of this._materials) mat.color.setHex(0x440000);
  }

  _updateDeathAnim(delta) {
    const ms = delta * 1000;
    this._dyingTimer -= ms;

    // Se hunde en el suelo
    this.mesh.position.y -= delta * 1.2;

    // Escala hacia cero
    const t = Math.max(0, this._dyingTimer / DEATH_DURATION);
    this.mesh.scale.setScalar(t);

    if (this._dyingTimer <= 0) {
      this._dying = false;
      this.scene.remove(this.mesh);
      if (this.onDeath) this.onDeath(this);
    }
  }
      }
