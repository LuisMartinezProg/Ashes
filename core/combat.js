// core/combat.js — Núcleo del sistema de combate
// Fase 2: combo puños, detección de rango, shake de cámara

import { FistsWeapon } from './weapons/fists.js';

const ATTACK_RANGE   = 2.5;
const COMBO_WINDOW   = 600;   // ms entre taps para combo
const SHAKE_DURATION = 180;   // ms
const SHAKE_STRENGTH = 0.18;

export class CombatSystem {
  constructor(playerGroup, camera) {
    this.player  = playerGroup;
    this.camera  = camera;
    this.enemies = [];

    this.weapon   = new FistsWeapon(playerGroup);
    this.comboMax = this.weapon.comboMax;

    this.comboCount     = 0;
    this.lastAttackTime = 0;
    this.attacking      = false;

    this._shakeTime    = 0;
    this._shakeActive  = false;
    this._shakeOffsetX = 0;
    this._shakeOffsetY = 0;
  }

  registerEnemy(enemy)   { this.enemies.push(enemy); }
  unregisterEnemy(enemy) { this.enemies = this.enemies.filter(e => e !== enemy); }

  triggerAttack() {
    if (this.attacking) return;

    const now = performance.now();
    if (now - this.lastAttackTime > COMBO_WINDOW) this.comboCount = 0;

    const hitIndex      = this.comboCount;
    this.comboCount     = (this.comboCount + 1) % this.comboMax;
    this.lastAttackTime = now;

    this._executeAttack(hitIndex);
  }

  update(delta) {
    this.weapon.update(delta);
    if (this._shakeActive) this._updateShake(delta);
  }

  // ── Internos ────────────────────────────────────────────────────────────────

  _executeAttack(hitIndex) {
    this.attacking = true;
    this.weapon.execute(hitIndex);

    const target = this._closestEnemyInRange();
    if (target) {
      target.takeDamage(this.weapon.getDamage(hitIndex));
      this._triggerShake();
    }

    setTimeout(() => { this.attacking = false; }, this.weapon.getAnimDuration(hitIndex));
  }

  _closestEnemyInRange() {
    let closest = null, minDist = Infinity;
    for (const e of this.enemies) {
      if (e.isDead()) continue;
      const d = this.player.position.distanceTo(e.mesh.position);
      if (d <= ATTACK_RANGE && d < minDist) { minDist = d; closest = e; }
    }
    return closest;
  }

  _triggerShake() {
    this._shakeTime   = SHAKE_DURATION;
    this._shakeActive = true;
  }

  _updateShake(delta) {
    this._shakeTime -= delta * 1000;

    this.camera.position.x -= this._shakeOffsetX;
    this.camera.position.y -= this._shakeOffsetY;

    if (this._shakeTime <= 0) {
      this._shakeActive  = false;
      this._shakeOffsetX = 0;
      this._shakeOffsetY = 0;
      return;
    }

    const decay        = this._shakeTime / SHAKE_DURATION;
    this._shakeOffsetX = (Math.random() - 0.5) * SHAKE_STRENGTH * decay;
    this._shakeOffsetY = (Math.random() - 0.5) * SHAKE_STRENGTH * decay;

    this.camera.position.x += this._shakeOffsetX;
    this.camera.position.y += this._shakeOffsetY;
  }
}
