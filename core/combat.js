// core/combat.js — Núcleo del sistema de combate
// Fase 4: soporte para 4 armas con setWeapon(type)

import { KatanaWeapon } from './weapons/katana.js';
import { SwordWeapon  } from './weapons/sword.js';
import { MagicWeapon  } from './weapons/magic.js';
import { BowWeapon    } from './weapons/bow.js';

const ATTACK_RANGE   = 2.5;
const COMBO_WINDOW   = 600;   // ms entre taps para combo
const SHAKE_DURATION = 180;   // ms
const SHAKE_STRENGTH = 0.18;

// Las armas de proyectil no dependen de ATTACK_RANGE — viajan solas
const RANGED_WEAPONS = new Set(['magic', 'bow']);

export class CombatSystem {
  constructor(playerGroup, camera) {
    this.player  = playerGroup;
    this.camera  = camera;
    this.enemies = [];

    this._scene      = null; // se asigna via setScene()
    this._weaponType = 'fists';

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

  // ── API pública ─────────────────────────────────────────────────────────────

  /** Llamado desde game.html una vez que la escena existe */
  setScene(scene) {
    this._scene = scene;
    // Si el arma actual ya es ranged, conecta la escena ahora
    if (this.weapon.setScene) this.weapon.setScene(scene);
  }

  /**
   * Cambia el arma activa. Limpia el arma anterior del playerGroup.
   * @param {'fists'|'sword'|'magic'|'bow'} type
   */
  setWeapon(type) {
    // Destruye el arma anterior (elimina sus meshes del jugador)
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
      case 'fists':
      default:
        this.weapon = new FistsWeapon(this.player);
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
    // Pasa enemies a las armas que lo necesitan (bow usa lista en update)
    this.weapon.update(delta, this.enemies);
    if (this._shakeActive) this._updateShake(delta);
  }

  // ── Internos ────────────────────────────────────────────────────────────────

  _executeAttack(hitIndex) {
    this.attacking = true;

    const isRanged = RANGED_WEAPONS.has(this._weaponType);

    if (isRanged) {
      // Armas de proyectil: execute crea el proyectil, el daño lo aplica weapon.update()
      this.weapon.execute(hitIndex, this.enemies);
      // Shake leve al disparar (sin hit garantizado todavía)
      this._triggerShake(0.5);
    } else {
      // Armas cuerpo a cuerpo: detección inmediata por rango
      this.weapon.execute(hitIndex);
      const target = this._closestEnemyInRange();
      if (target) {
        target.takeDamage(this.weapon.getDamage(hitIndex));
        this._triggerShake(1.0);
      }
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

  /** @param {number} intensity — 0.0 a 1.0 escala el shake */
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
