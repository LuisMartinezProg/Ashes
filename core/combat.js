// core/combat.js
// Ashes of the Reborn | Valiant Gaming

import { KatanaWeapon } from './weapons/katana.js';
import { SwordWeapon  } from './weapons/sword.js';
import { MagicWeapon  } from './weapons/magic.js';
import { BowWeapon    } from './weapons/bow.js';

const ATTACK_RANGE   = 2.5;
const COMBO_WINDOW   = 600;
const SHAKE_DURATION = 180;
const SHAKE_STRENGTH = 0.18;

const RANGED_WEAPONS = new Set(['magic', 'bow']);

export class CombatSystem {
  constructor(playerGroup, camera) {
    this.player  = playerGroup;
    this.camera  = camera;
    this.enemies = [];

    this._scene       = null;
    this._weaponType  = 'katana';
    this._progression = null;

    this.weapon   = new KatanaWeapon(playerGroup);
    this.comboMax = this.weapon.comboMax;

    this.comboCount     = 0;
    this.lastAttackTime = 0;
    this.attacking      = false;

    this._shakeTime    = 0;
    this._shakeActive  = false;
    this._shakeOffsetX = 0;
    this._shakeOffsetY = 0;
  }

  setScene(scene) {
    this._scene = scene;
    if (this.weapon.setScene) this.weapon.setScene(scene);
  }

  setProgression(progression) {
    this._progression = progression;
  }

  setWeapon(type) {
    if (this.weapon && this.weapon.destroy) this.weapon.destroy();

    this._weaponType = type;

    switch (type) {
      case 'sword':
        this.weapon = new SwordWeapon(this.player);
        break;
      case 'magic':
        this.weapon = new MagicWeapon(this.player);
        if (this._scene) this.weapon.setScene(this._scene);
        break;
      case 'bow':
        this.weapon = new BowWeapon(this.player);
        if (this._scene) this.weapon.setScene(this._scene);
        break;
      case 'katana':
      default:
        this.weapon = new KatanaWeapon(this.player);
        break;
    }

    this.comboMax   = this.weapon.comboMax;
    this.comboCount = 0;
    this.attacking  = false;

    console.log(`[Combat] Arma equipada: ${type}`);
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
    this.weapon.update(delta, this.enemies);
    if (this._shakeActive) this._updateShake(delta);
  }

  closestEnemyInRange() {
    let closest = null, minDist = Infinity;
    for (const e of this.enemies) {
      if (e.isDead()) continue;
      const d = this.player.position.distanceTo(e.mesh.position);
      if (d <= ATTACK_RANGE && d < minDist) { minDist = d; closest = e; }
    }
    return closest;
  }

  _executeAttack(hitIndex) {
    this.attacking = true;

    const isRanged = RANGED_WEAPONS.has(this._weaponType);

    if (isRanged) {
      this.weapon.execute(hitIndex, this.enemies);
      this._triggerShake(0.5);
    } else {
      this.weapon.execute(hitIndex);
      const target = this.closestEnemyInRange();
      if (target) {
        let dmg = this.weapon.getDamage(hitIndex);
        if (this._progression) {
          const fusion = this._progression.getActiveFusion(this._weaponType);
          if (fusion) dmg = Math.floor(dmg * 1.25);
        }
       target.takeDamage(dmg);
        this._triggerShake(1.0);
// Efectos de fusión
        if (this._progression) {
          const school = this._progression.getActiveSchool(this._weaponType)
                      ?? this._progression.getActiveFusion(this._weaponType);
          console.log(`[Combat] Fusión: ${school} | arma: ${this._weaponType}`);
          if (school === 'fire'  || school === 'fuego') target.applyBurn?.(5, 3);
if (school === 'ice'   || school === 'hielo') target.applySlow?.(0.4, 2);
if (school === 'viento') {
  const dx = this.player.position.x - target.mesh.position.x;
  const dz = this.player.position.z - target.mesh.position.z;
  const len = Math.sqrt(dx*dx + dz*dz);
  if (len > 0) {
    this.player.position.x += (dx/len) * 1.5;
    this.player.position.z += (dz/len) * 1.5;
  }
}
if (school === 'soporte') {
  const heal = Math.floor(dmg * 0.05);
  if (window._player && heal > 0) {
    window._player.hp = Math.min(window._player.maxHp, window._player.hp + heal);
    window._player.onDamage?.(window._player.hp, window._player.maxHp);
  }
}

    setTimeout(() => { this.attacking = false; }, this.weapon.getAnimDuration(hitIndex));
  }

  _triggerShake(intensity = 1.0) {
    this._shakeTime   = SHAKE_DURATION * intensity;
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
