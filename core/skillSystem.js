// core/skillSystem.js — Sistema base de habilidades
// Fase 3: gestiona habilidades activas, energía mágica, cooldowns
//
// USO en game.html:
//   import { SkillSystem } from './core/skillSystem.js';
//   const skills = new SkillSystem(scene, getPlayer().root);
//   skills.registerEnemies(enemyList);
//
// En el loop:
//   skills.update(delta);

import { Fireball } from '../skills/fireball.js';

const MAX_ENERGY    = 100;
const ENERGY_REGEN  = 8;    // energía por segundo (regeneración pasiva)
const FIREBALL_COST = 30;   // energía que consume la bola de fuego

export class SkillSystem {
  constructor(scene, playerGroup) {
    this.scene   = scene;
    this.player  = playerGroup;
    this.enemies = [];        // se actualiza desde game.html

    // Energía mágica
    this.energy    = MAX_ENERGY;
    this.maxEnergy = MAX_ENERGY;

    // Callback para actualizar la UI de energía
    this.onEnergyUpdate = null;

    // Habilidades registradas — Fase 3: solo fireball
    this.fireball = new Fireball(scene, playerGroup);

    // Cuando el cooldown cambia, notifica al HUD
    this.fireball.onCooldownUpdate = (progress) => {
      if (this.onSkillCooldown) this.onSkillCooldown('fireball', progress);
    };
  }

  // ── API pública ─────────────────────────────────────────────────────────────

  /** Actualiza la lista de enemigos activos */
  registerEnemies(list) {
    this.enemies = list;
    // Pasa la lista al fireball para colisiones
    this.fireball._enemyList = list;
  }

  /** Intenta lanzar la bola de fuego */
  castFireball() {
    if (!this.fireball.isReady()) return false;
    if (this.energy < FIREBALL_COST) return false;

    const success = this.fireball.cast(this.enemies);
    if (success) {
      this.energy -= FIREBALL_COST;
      if (this.onEnergyUpdate) this.onEnergyUpdate(this.energy, this.maxEnergy);
    }
    return success;
  }

  /** Llamado cada frame desde loop.js o game.html */
  update(delta) {
    // Regenera energía
    if (this.energy < this.maxEnergy) {
      this.energy = Math.min(this.maxEnergy, this.energy + ENERGY_REGEN * delta);
      if (this.onEnergyUpdate) this.onEnergyUpdate(this.energy, this.maxEnergy);
    }

    // Actualiza la bola de fuego (proyectiles, cooldown)
    this.fireball.update(delta);
  }
        }

