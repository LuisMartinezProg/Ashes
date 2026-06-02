// core/combat.js
// Ashes of the Reborn | Valiant Gaming

import { KatanaWeapon } from './weapons/katana.js';
import { SwordWeapon  } from './weapons/sword.js';
import { MagicWeapon  } from './weapons/magic.js';
import { BowWeapon    } from './weapons/bow.js';
import { BranchMissionSystem } from './branchMissions.js';

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
    this._missions    = null;

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
    this._missions    = new BranchMissionSystem(progression);
    window._branchMissions = this._missions;
    this._missions.onMissionComplete = (weapon, subtypeId, mission) => {
      console.log(`[Misión completada] ${mission.label}`);
      window._skillTree?.open(weapon);
    };
  }

  // ── Progression del personaje activo en el party ──────────────────────────
  _getActiveProgression() {
    const active = window._partyManager?.getActiveCharacter?.();
    if (active && active === window._companion) {
      return window._mikaProgression ?? this._progression;
    }
    return this._progression;
  }

  // ── Personaje activo (objeto con hp/maxHp/onDamage) ───────────────────────
  _getActiveCharacter() {
    return window._partyManager?.getActiveCharacter?.()
      ?? window._player
      ?? null;
  }

  // ── Stats efectivos del personaje activo ──────────────────────────────────
  _getEffectiveStats() {
    const active = window._partyManager?.getActiveCharacter?.();
    if (active && active === window._companion) {
      return window._effectiveStatsMika
        ?? window._mikaProgression?.getStats()
        ?? this._progression.getStats();
    }
    return window._effectiveStats
      ?? this._progression.getStats();
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

  registerBossKill(weapon, subtypeId) {
    this._missions?.registerBossKill(weapon, subtypeId);
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
      if (e.isDead() || !e.mesh) continue;
      const dx = this.player.position.x - e.mesh.position.x;
      const dz = this.player.position.z - e.mesh.position.z;
      const d  = Math.sqrt(dx*dx + dz*dz);
      if (d <= ATTACK_RANGE && d < minDist) { minDist = d; closest = e; }
    }
    return closest;
  }

  _executeAttack(hitIndex) {
    this.attacking = true;

    // ── Usar siempre la progression del personaje activo ──────────────────
    const prog      = this._getActiveProgression();
    const isRanged  = RANGED_WEAPONS.has(this._weaponType);
    const subtypeId = prog.getActiveSubtype(this._weaponType) ?? null;

    if (isRanged) {
      this.weapon.execute(hitIndex, this.enemies);
      this._triggerShake(0.5);

      if (subtypeId && this._missions) {
        const estimatedDmg = this.weapon.getDamage?.(hitIndex) ?? 0;
        this._missions.registerDamage(this._weaponType, subtypeId, estimatedDmg);
      }

    } else {
      this.weapon.execute(hitIndex);
      const target = this.closestEnemyInRange();

      if (target) {
        let dmg = this.weapon.getDamage(hitIndex);

        // ── Bonus de arma según personaje activo ──────────────────────────
        const weaponBonus = prog.getWeaponDamageBonus?.(this._weaponType);
        if (weaponBonus) dmg = Math.floor(dmg * weaponBonus);

        // ── DEF del enemigo vs ATK efectivo del personaje activo ──────────
        const eff    = this._getEffectiveStats();
        const atkMod = eff.atk ?? prog.getStats().atk;
        const base   = prog.getStats().atk;
        if (base > 0) dmg = Math.floor(dmg * (atkMod / base));

        target.takeDamage(dmg);
        this._triggerShake(1.0);

        if (subtypeId && this._missions) {
          this._missions.registerDamage(this._weaponType, subtypeId, dmg);
        }

        if (target.isDead?.() && subtypeId && this._missions) {
          this._missions.registerKill(this._weaponType, subtypeId);
        }

        // ── Efectos de fusión ─────────────────────────────────────────────
        const school = prog.getActiveSchool(this._weaponType)
                    ?? prog.getActiveFusion(this._weaponType);

        if (school === 'fire'  || school === 'fuego')  target.applyBurn?.(5, 3);
        if (school === 'ice'   || school === 'hielo')  target.applySlow?.(0.4, 2);
        if (school === 'viento') {
          const dx  = this.player.position.x - target.mesh.position.x;
          const dz  = this.player.position.z - target.mesh.position.z;
          const len = Math.sqrt(dx*dx + dz*dz);
          if (len > 0) {
            this.player.position.x += (dx/len) * 1.5;
            this.player.position.z += (dz/len) * 1.5;
          }
        }
        if (school === 'soporte') {
          // Curar al personaje activo, no siempre a Kael
          const heal   = Math.floor(dmg * 0.05);
          const active = this._getActiveCharacter();
          if (active && heal > 0) {
            active.hp = Math.min(active.maxHp, active.hp + heal);
            active.onDamage?.(active.hp, active.maxHp);
          }
        }
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
