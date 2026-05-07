// core/skillSystem.js — Ashes of the Reborn | Valiant Gaming
import { Fireball } from '../skills/fireball.js';
import { IceShard } from '../skills/iceShard.js';
import { WindGust } from '../skills/windGust.js';
import { ThornShot } from '../skills/thornShot.js';
import { QuickSlash } from '../skills/katana/quickSlash.js';
import { FlashStep } from '../skills/katana/flashStep.js';
import { BladeDance } from '../skills/katana/bladeDance.js';
import { ThousandCuts } from '../skills/katana/thousandCuts.js';

const MAX_ENERGY = 100;
const ENERGY_REGEN = 3;

const SKILL_COST = {
  fireball: 30,
  ice_shard: 30,
  gust: 25,
  thorn: 30,
};

export class SkillSystem {
  constructor(scene, playerGroup) {
    this.scene = scene;
    this.player = playerGroup;
    this.enemies = [];
    this.energy = MAX_ENERGY;
    this.maxEnergy = MAX_ENERGY;
    this.onEnergyUpdate = null;
    this.onSkillCooldown = null;

    this._skills = {
      fireball: new Fireball(scene, playerGroup),
      ice_shard: new IceShard(scene, playerGroup),
      gust: new WindGust(scene, playerGroup),
      thorn: new ThornShot(scene, playerGroup),
      quick_slash: new QuickSlash(scene, playerGroup),
      flash_step: new FlashStep(scene, playerGroup),
      blade_dance: new BladeDance(scene, playerGroup),
      thousand_cuts: new ThousandCuts(scene, playerGroup),
    };
  }

  registerEnemies(list) {
    this.enemies = list;
  }

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
