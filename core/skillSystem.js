// core/skillSystem.js — Ashes of the Reborn | Valiant Gaming
import { Fireball }      from '../skills/fireball.js';
import { IceShard }      from '../skills/iceShard.js';
import { WindGust }      from '../skills/windGust.js';
import { ThornShot }     from '../skills/thornShot.js';
import { QuickSlash }    from '../skills/katana/quickSlash.js';
import { FlashStep }     from '../skills/katana/flashStep.js';
import { BladeDance }    from '../skills/katana/bladeDance.js';
import { ThousandCuts }  from '../skills/katana/thousandCuts.js';
//import { Cleave }        from '../skills/sword/cleave.js';
//import { ShieldBash }    from '../skills/sword/shieldBash.js';
//import { WarCry }        from '../skills/sword/warCry.js';
//import { Execute }       from '../skills/sword/execute.js';
//import { PiercingShot }  from '../skills/bow/piercingShot.js';
//import { RainOfArrows }  from '../skills/bow/rainOfArrows.js';
//import { PoisonArrow }   from '../skills/bow/poisonArrow.js';
//import { BackStep }      from '../skills/bow/backStep.js';

const MAX_ENERGY  = 100;
const ENERGY_REGEN = 3;

const SKILL_COST = {
  fireball      : 30,
  ice_shard     : 30,
  gust          : 25,
  thorn         : 30,
  quick_slash   : 20,
  flash_step    : 25,
  blade_dance   : 35,
  thousand_cuts : 40,
  cleave        : 25,
  shield_bash   : 30,
  war_cry       : 40,
  execute       : 35,
  piercing_shot : 25,
  rain_of_arrows: 40,
  poison_arrow  : 30,
  back_step     : 25,
};

export class SkillSystem {
  constructor(scene, playerGroup) {
    this.scene      = scene;
    this.player     = playerGroup;
    this.enemies    = [];
    this.energy     = MAX_ENERGY;
    this.maxEnergy  = MAX_ENERGY;
    this.onEnergyUpdate  = null;
    this.onSkillCooldown = null;

    this._skills = {
      // Magia
      fireball      : new Fireball(scene, playerGroup),
      ice_shard     : new IceShard(scene, playerGroup),
      gust          : new WindGust(scene, playerGroup),
      thorn         : new ThornShot(scene, playerGroup),
      // Katana
      quick_slash   : new QuickSlash(scene, playerGroup),
      flash_step    : new FlashStep(scene, playerGroup),
      blade_dance   : new BladeDance(scene, playerGroup),
      thousand_cuts : new ThousandCuts(scene, playerGroup),
      // Espada
      cleave        : new Cleave(scene, playerGroup),
      shield_bash   : new ShieldBash(scene, playerGroup),
      war_cry       : new WarCry(scene, playerGroup),
      execute       : new Execute(scene, playerGroup),
      // Arco
      piercing_shot : new PiercingShot(scene, playerGroup),
      rain_of_arrows: new RainOfArrows(scene, playerGroup),
      poison_arrow  : new PoisonArrow(scene, playerGroup),
      back_step     : new BackStep(scene, playerGroup),
    };
  }

  registerEnemies(list) { this.enemies = list; }

  getSkill(skillId) { return this._skills[skillId] ?? null; }

  castSkill(skillId) {
    const skill = this._skills[skillId];
    if (!skill) return false;
    const cost = SKILL_COST[skillId] ?? 30;
    if (!skill.isReady()) return false;
    if (this.energy < cost) return false;
    const success = skill.cast(this.enemies);
    if (success) {
      this.energy -= cost;
      if (this.onEnergyUpdate) this.onEnergyUpdate(this.energy, this.maxEnergy);
    }
    return success;
  }

  update(delta) {
    if (this.energy < this.maxEnergy) {
      this.energy = Math.min(this.maxEnergy, this.energy + ENERGY_REGEN * delta);
      if (this.onEnergyUpdate) this.onEnergyUpdate(this.energy, this.maxEnergy);
    }
    for (const skill of Object.values(this._skills)) {
      if (skill.update) skill.update(delta);
    }
  }
}
