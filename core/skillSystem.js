// core/skillSystem.js — Ashes of the Reborn | Valiant Gaming
import { Fireball }       from '../skills/fireball.js';
import { IceShard }       from '../skills/iceShard.js';
import { WindGust }       from '../skills/windGust.js';
import { ThornShot }      from '../skills/thornShot.js';
import { QuickSlash }     from '../skills/katana/quickSlash.js';
import { FlashStep }      from '../skills/katana/flashStep.js';
import { BladeDance }     from '../skills/katana/bladeDance.js';
import { ThousandCuts }   from '../skills/katana/thousandCuts.js';
import { ShadowSlash }    from '../skills/katana/shadowSlash.js';
import { Nightfall }      from '../skills/katana/nightfall.js';
import { VoidStep }       from '../skills/katana/voidStep.js';
import { ShadowRealm }    from '../skills/katana/shadowRealm.js';
import { ThunderSlash }   from '../skills/katana/thunderSlash.js';
import { StaticField }    from '../skills/katana/staticField.js';
import { ThunderStorm }   from '../skills/katana/thunderStorm.js';
import { GodOfThunder }   from '../skills/katana/godOfThunder.js';
import { LastStand }      from '../skills/katana/lastStand.js';
import { Martyr }         from '../skills/katana/martyr.js';
import { SacredBlade }    from '../skills/katana/sacredBlade.js';
import { LegendaryStand } from '../skills/katana/legendaryStand.js';
import { Cleave }         from '../skills/sword/cleave.js';
import { ShieldBash }     from '../skills/sword/shieldBash.js';
import { WarCry }         from '../skills/sword/warCry.js';
import { Execute }        from '../skills/sword/execute.js';
import { PiercingShot }   from '../skills/bow/piercingShot.js';
import { RainOfArrows }   from '../skills/bow/rainOfArrows.js';
import { PoisonArrow }    from '../skills/bow/poisonArrow.js';
import { BackStep }       from '../skills/bow/backStep.js';
import { Snipe }        from '../skills/bow/snipe.js';
import { Bullseye }     from '../skills/bow/bullseye.js';
import { DivineArrow }  from '../skills/bow/divineArrow.js';
import { PlagueShot }   from '../skills/bow/plagueShot.js';
import { ToxicCloud }   from '../skills/bow/toxicCloud.js';
import { DeathPlague }  from '../skills/bow/deathPlague.js';
import { StormVolley }  from '../skills/bow/stormVolley.js';
import { ArrowStorm }   from '../skills/bow/arrowStorm.js';
import { SkyCollapse }  from '../skills/bow/skyCollapse.js';
import { RollShot }     from '../skills/bow/rollShot.js';
import { PhantomStep }  from '../skills/bow/phantomStep.js';
import { VoidDance }    from '../skills/bow/voidDance.js';
import { AstralArrow      } from '../skills/mika/astralArrow.js';
import { AstralRain       } from '../skills/mika/astralRain.js';
import { StellarCollapse  } from '../skills/mika/stellarCollapse.js';

const MAX_ENERGY   = 100;
const ENERGY_REGEN = 3;

const SKILL_COST = {
  fireball       : 30,
  ice_shard      : 30,
  gust           : 25,
  thorn          : 30,
  quick_slash    : 20,
  flash_step     : 25,
  blade_dance    : 35,
  thousand_cuts  : 40,
  shadow_slash   : 25,
  nightfall      : 35,
  void_step      : 45,
  shadow_realm   : 60,
  thunder_slash  : 25,
  static_field   : 35,
  thunder_storm  : 50,
  god_of_thunder : 70,
  last_stand     : 30,
  martyr         : 35,
  sacred_blade   : 50,
  legendary_stand: 70,
  cleave         : 25,
  shield_bash    : 30,
  war_cry        : 40,
  execute        : 35,
  piercing_shot  : 25,
  rain_of_arrows : 40,
  poison_arrow   : 30,
  back_step      : 25,
  snipe          : 40,
  bullseye       : 55,
  divine_arrow   : 75,
  plague_shot    : 40,
  toxic_cloud    : 55,
  death_plague   : 75,
  storm_volley   : 55,
  arrow_storm    : 70,
  sky_collapse   : 90,
  roll_shot      : 40,
  phantom_step   : 55,
  void_dance     : 75,
  astral_arrow     : 20,
astral_rain      : 40,
stellar_collapse : 80,
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
      fireball       : new Fireball(scene, playerGroup),
      ice_shard      : new IceShard(scene, playerGroup),
      gust           : new WindGust(scene, playerGroup),
      thorn          : new ThornShot(scene, playerGroup),
      // Katana — Velocidad
      quick_slash    : new QuickSlash(scene, playerGroup),
      flash_step     : new FlashStep(scene, playerGroup),
      blade_dance    : new BladeDance(scene, playerGroup),
      thousand_cuts  : new ThousandCuts(scene, playerGroup),
      // Katana — Sombra
      shadow_slash   : new ShadowSlash(scene, playerGroup),
      nightfall      : new Nightfall(scene, playerGroup),
      void_step      : new VoidStep(scene, playerGroup),
      shadow_realm   : new ShadowRealm(scene, playerGroup),
      // Katana — Tormenta
      thunder_slash  : new ThunderSlash(scene, playerGroup),
      static_field   : new StaticField(scene, playerGroup),
      thunder_storm  : new ThunderStorm(scene, playerGroup),
      god_of_thunder : new GodOfThunder(scene, playerGroup),
      // Katana — Honor
      last_stand     : new LastStand(scene, playerGroup),
      martyr         : new Martyr(scene, playerGroup),
      sacred_blade   : new SacredBlade(scene, playerGroup),
      legendary_stand: new LegendaryStand(scene, playerGroup),
      // Espada
      cleave         : new Cleave(scene, playerGroup),
      shield_bash    : new ShieldBash(scene, playerGroup),
      war_cry        : new WarCry(scene, playerGroup),
      execute        : new Execute(scene, playerGroup),
      // Arco
      piercing_shot  : new PiercingShot(scene, playerGroup),
      rain_of_arrows : new RainOfArrows(scene, playerGroup),
      poison_arrow   : new PoisonArrow(scene, playerGroup),
      back_step      : new BackStep(scene, playerGroup),
      snipe          : new Snipe(scene, playerGroup),
      bullseye       : new Bullseye(scene, playerGroup),
      divine_arrow   : new DivineArrow(scene, playerGroup),
      plague_shot    : new PlagueShot(scene, playerGroup), 
      toxic_cloud    : new ToxicCloud(scene, playerGroup),
      death_plague   : new DeathPlague(scene, playerGroup),
      storm_volley   : new StormVolley(scene, playerGroup),
      arrow_storm    : new ArrowStorm(scene, playerGroup),
      sky_collapse   : new SkyCollapse(scene, playerGroup),
      roll_shot      : new RollShot(scene, playerGroup),
      phantom_step   : new PhantomStep(scene, playerGroup),
     void_dance     : new VoidDance(scene, playerGroup),
      astral_arrow      : new AstralArrow(scene, playerGroup),
     astral_rain       : new AstralRain(scene, playerGroup),
     stellar_collapse  : new StellarCollapse(scene, playerGroup),
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
      window._tutorial?.notifyUsedSkill?.();
      this.energy -= cost; // FIX: se restaba dos veces (bug de copy-paste)
      if (this.onEnergyUpdate) this.onEnergyUpdate(this.energy, this.maxEnergy);
      // ── Notificar al puzzle activo ────────────────────────────────────
      window._dungeonManager?._activePuzzle?.tryActivatePedestal(skillId);
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
