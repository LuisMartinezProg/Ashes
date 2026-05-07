// core/skillSystem.js — Ashes of the Reborn | Valiant Gaming
// Fase 6: gestiona todas las habilidades, energía mágica, cooldowns
import { Fireball      } from '../skills/fireball.js';
import { IceShard      } from '../skills/iceShard.js';
import { WindGust      } from '../skills/windGust.js';
import { ThornShot     } from '../skills/thornShot.js';
import { QuickSlash    } from '../skills/katana/quickSlash.js';
import { FlashStep     } from '../skills/katana/flashStep.js';
import { BladeDance    } from '../skills/katana/bladeDance.js';
import { ThousandCuts  } from '../skills/katana/thousandCuts.js';
 { ThornShot  } from '../skills/thornShot.js';

const MAX_ENERGY   = 100;
const ENERGY_REGEN = 3;

// Costo de energía por habilidad
const SKILL_COST = {
  fireball  : 30,
  ice_shard : 30,
  gust      : 25,
  thorn     : 30,
  // Las demás usan 30 por defecto
};

export class SkillSystem {
  constructor(scene, playerGroup) {
    this.scene   = scene;
    this.player  = playerGroup;
    this.enemies = [];

    this.energy    = MAX_ENERGY;
    this.maxEnergy = MAX_ENERGY;

    this.onEnergyUpdate  = null;
    this.onSkillCooldown = null;

    // Instancias de habilidades
this._skills = {
      fireball      : new Fireball     (scene, playerGroup),
      ice_shard     : new IceShard     (scene, playerGroup),
      gust          : new WindGust     (scene, playerGroup),
      thorn         : new ThornShot    (scene, playerGroup),
      quick_slash   : new QuickSlash   (scene, playerGroup),
      flash_step    : new FlashStep    (scene, playerGroup),
      blade_dance   : new BladeDance   (scene, playerGroup),
      thousand_cuts : new ThousandCuts (scene, playerGroup),
    };

    // Conectar callbacks de cooldown
    for (const [id, skill] of Object.entries(this._skills)) {
      skill.onCooldownUpdate = (progress) => {
        if (this.onSkillCooldown) this.onSkillCooldown(id, progress);
      };
    }
  }
  applyFusion(weapon, school) {
  this._activeFusion = { weapon, school };
  console.log(`[SkillSystem] Fusión activa: ${weapon} + ${school}`);
  }

  // ── API pública ───────────────────────────────────────────────────────────

  registerEnemies(list) {
    this.enemies = list;
  }

  /** Lanza una habilidad por su ID */
  castSkill(skillId) {
    const skill = this._skills[skillId];
    if (!skill) {
      console.warn(`[SkillSystem] No implementada: ${skillId}`);
      return false;
    }
    const cost = SKILL_COST[skillId] ?? 30;
    const alive = this.enemies.filter(e => !e.isDead()).length;
    console.log(`[SkillSystem] ${skillId} | ready:${skill.isReady()} | energy:${Math.floor(this.energy)}/${cost} | enemies vivos:${alive}`);
    if (!skill.isReady())   return false;
    if (this.energy < cost) return false;
    const success = skill.cast(this.enemies);
    console.log(`[SkillSystem] resultado: ${success}`);
    if (success) {
      this.energy -= cost;
      if (this.onEnergyUpdate) this.onEnergyUpdate(this.energy, this.maxEnergy);
    }
    return success;
  }
  

  /** Mantener compatibilidad con código anterior */
  castFireball() {
    return this.castSkill('fireball');
  }

  update(delta) {
    // Regenera energía
    if (this.energy < this.maxEnergy) {
      this.energy = Math.min(this.maxEnergy, this.energy + ENERGY_REGEN * delta);
      if (this.onEnergyUpdate) this.onEnergyUpdate(this.energy, this.maxEnergy);
    }

    // Actualiza todas las habilidades
    for (const skill of Object.values(this._skills)) {
      skill.update(delta);
    }
  }
}
