// core/progression.js — Ashes of the Reborn | Valiant Gaming

import { SKILL_DATA, DEFAULT_UNLOCKED } from './skillData.js';

const XP_REQUIRED = {
  common   : 0,
  rare     : 100,
  epic     : 300,
  legendary: 700,
};

const TRIAL_LEVEL = {
  common   : 0,
  rare     : 2,
  epic     : 5,
  legendary: 10,
};

const MAGIC_ENERGY_PER_SKILL = 200;

// XP necesario para cada nivel (acumulativo)
const LEVEL_XP = [
  0, 100, 250, 450, 700, 1000, 1400, 1900, 2500, 3200, 4000,
  5000, 6200, 7600, 9200, 11000, 13000, 15500, 18500, 22000, 26000,
];

// Stats base por nivel
function _statsForLevel(level) {
  return {
    maxHp  : 100 + level * 20,
    atk    : 10  + level * 3,
    def    : 5   + level * 2,
    speed  : 5   + level * 0.5,
  };
}

export class Progression {
  constructor() {
    this._unlockedSubtypes = JSON.parse(JSON.stringify(DEFAULT_UNLOCKED));

    this._xp = {
      magic : 0,
      katana: 0,
      sword : 0,
      bow   : 0,
    };

    this._level          = 1;
    this._totalXP        = 0;

    this._trialsPassed   = {};
    this._activeFusion   = {};
    this._activeSubtype  = {
      magic : 'fire',
      katana: 'speed',
      sword : 'strength',
      bow   : 'precision',
    };

    this.fusionUnlocked   = false;
    this._magicEnergy     = 0;
    this._skillSlots      = 1;
    this._flags           = {};
    this._reputation      = 0;

    this.onXPGain         = null;
    this.onUnlock         = null;
    this.onTrialPassed    = null;
    this.onNewSkillSlot   = null;
    this.onReputationGain = null;
    this.onLevelUp        = null;
  }

  // ── Niveles ───────────────────────────────────────────────────────────────

  getLevel()  { return this._level; }
  getStats()  { return _statsForLevel(this._level); }
  getTotalXP(){ return this._totalXP; }

  getXPForNextLevel() {
    const next = LEVEL_XP[this._level];
    return next ?? null; // null = nivel máximo
  }

  getXPProgress() {
    const cur  = LEVEL_XP[this._level - 1] ?? 0;
    const next = LEVEL_XP[this._level];
    if (!next) return 1;
    return (this._totalXP - cur) / (next - cur);
  }

  _checkLevelUp() {
    const maxLevel = LEVEL_XP.length - 1;
    while (this._level < maxLevel) {
      const needed = LEVEL_XP[this._level];
      if (this._totalXP >= needed) {
        this._level++;
        this._applyLevelUpEffects();
        if (this.onLevelUp) this.onLevelUp(this._level, this.getStats());
        this._showLevelUpNotification();
      } else {
        break;
      }
    }
  }

  _applyLevelUpEffects() {
    const stats = this.getStats();
    // Aplicar al jugador activo
    const player = window._partyManager?.getActiveCharacter() ?? window._player;
    if (player) {
      if (player.maxHp !== undefined) {
        player.maxHp = stats.maxHp;
        player.hp    = Math.min(player.hp + 30, player.maxHp);
        player.onDamage?.(player.hp, player.maxHp);
      }
    }
    // Aplicar al compañero
    const companion = window._companion;
    if (companion) {
      if (companion.maxHp !== undefined) {
        companion.maxHp = Math.floor(stats.maxHp * 0.85);
        companion.hp    = Math.min(companion.hp + 20, companion.maxHp);
      }
    }
  }

  _showLevelUpNotification() {
    const stats = this.getStats();
    const el = document.createElement('div');
    Object.assign(el.style, {
      position     : 'fixed',
      top          : '22%',
      left         : '50%',
      transform    : 'translateX(-50%)',
      fontFamily   : "'Cinzel',serif",
      fontSize     : '13px',
      letterSpacing: '3px',
      color        : '#C9A84C',
      background   : 'rgba(4,4,10,0.97)',
      border       : '1px solid rgba(201,168,76,0.6)',
      borderRadius : '12px',
      padding      : '16px 28px',
      zIndex       : '600',
      pointerEvents: 'none',
      textAlign    : 'center',
      boxShadow    : '0 0 24px rgba(201,168,76,0.4)',
      opacity      : '1',
      transition   : 'opacity 1s',
    });
    el.innerHTML = `
      ⬆ NIVEL ${this._level}<br>
      <span style="font-size:10px;color:#aaa;letter-spacing:1px">
        HP +20 &nbsp;|&nbsp; ATK +3 &nbsp;|&nbsp; DEF +2
      </span>
    `;
    document.body.appendChild(el);
    setTimeout(() => {
      el.style.opacity = '0';
      setTimeout(() => el.remove(), 1000);
    }, 3000);
  }

  // ── Reputación ────────────────────────────────────────────────────────────

  addReputation(amount) {
    this._reputation += amount;
    if (this.onReputationGain) this.onReputationGain(this._reputation);
  }

  getReputation() { return this._reputation; }

  // ── Energía mágica ────────────────────────────────────────────────────────

  addMagicEnergy(amount) {
    this._magicEnergy += amount;
    const slotsNeeded = Math.floor(this._magicEnergy / MAGIC_ENERGY_PER_SKILL);
    if (slotsNeeded > this._skillSlots) {
      this._skillSlots = slotsNeeded;
      if (this.onNewSkillSlot) this.onNewSkillSlot(this._skillSlots);
      this._showSkillNotification();
    }
  }

  getMagicEnergy() { return this._magicEnergy; }
  getSkillSlots()  { return this._skillSlots; }

  _showSkillNotification() {
    const el = document.createElement('div');
    Object.assign(el.style, {
      position     : 'fixed',
      top          : '20%',
      left         : '50%',
      transform    : 'translateX(-50%)',
      fontFamily   : "'Cinzel',serif",
      fontSize     : '12px',
      letterSpacing: '3px',
      color        : '#c9a84c',
      background   : 'rgba(4,4,10,0.95)',
      border       : '1px solid rgba(201,168,76,0.5)',
      borderRadius : '8px',
      padding      : '14px 28px',
      zIndex       : '600',
      pointerEvents: 'none',
      textAlign    : 'center',
      boxShadow    : '0 0 20px rgba(201,168,76,0.3)',
    });
    el.innerHTML = '✨ NUEVA HABILIDAD DISPONIBLE<br><span style="font-size:10px;color:#8a6f2e;">Abre el árbol de habilidades</span>';
    document.body.appendChild(el);
    setTimeout(() => {
      el.style.transition = 'opacity 0.8s';
      el.style.opacity    = '0';
      setTimeout(() => el.remove(), 800);
    }, 3000);
  }

  // ── Flags ─────────────────────────────────────────────────────────────────

  setFlag(key, value) { this._flags[key] = value; }
  getFlag(key)        { return this._flags[key]; }

  // ── Fusión ────────────────────────────────────────────────────────────────

  setActiveFusion(weapon, school)  { this._activeFusion[weapon] = school; }
  getActiveFusion(weapon)          { return this._activeFusion[weapon] ?? null; }
  setActiveSchool(weapon, school)  { this._activeFusion[weapon] = school; }
  getActiveSchool(weapon)          { return this._activeFusion[weapon] ?? null; }

  // ── XP ───────────────────────────────────────────────────────────────────

  addXP(weapon, amount) {
    if (!(weapon in this._xp)) return;
    this._xp[weapon] += amount;
    this._totalXP    += amount;
    this._checkLevelUp();
    if (this.onXPGain) this.onXPGain(weapon, amount, this._xp[weapon]);
  }

  getXP(weapon) { return this._xp[weapon] ?? 0; }

  // ── Subtipos ──────────────────────────────────────────────────────────────

  unlockSubtype(weapon, subtypeId) {
    if (!this._unlockedSubtypes[weapon]) this._unlockedSubtypes[weapon] = [];
    if (this._unlockedSubtypes[weapon].includes(subtypeId)) return;
    this._unlockedSubtypes[weapon].push(subtypeId);
    if (this.onUnlock) this.onUnlock(weapon, subtypeId);
  }

  unlockByStory(weapon, subtypeId)      { this.unlockSubtype(weapon, subtypeId); }
  isSubtypeUnlocked(weapon, subtypeId)  { return this._unlockedSubtypes[weapon]?.includes(subtypeId) ?? false; }
  getUnlockedSubtypes(weapon)           { return this._unlockedSubtypes[weapon] ?? []; }

  setActiveSubtype(weapon, subtypeId) {
    if (!this.isSubtypeUnlocked(weapon, subtypeId)) return false;
    this._activeSubtype[weapon] = subtypeId;
    return true;
  }

  getActiveSubtype(weapon) { return this._activeSubtype[weapon] ?? null; }

  // ── Habilidades ───────────────────────────────────────────────────────────

  isSkillAvailable(weapon, subtypeId, skillId) {
    if (!this.isSubtypeUnlocked(weapon, subtypeId)) return false;
    const subtype = SKILL_DATA[weapon]?.subtypes[subtypeId];
    if (!subtype) return false;
    const skill = subtype.skills.find(s => s.id === skillId);
    if (!skill) return false;
    if (skill.rarity === 'common') return true;
    const hasXP    = this._xp[weapon] >= XP_REQUIRED[skill.rarity];
    const hasTrial = this._trialsPassed[skillId] ?? false;
    return hasXP && hasTrial;
  }

  passTrialForSkill(skillId) {
    this._trialsPassed[skillId] = true;
    if (this.onTrialPassed) this.onTrialPassed(skillId);
  }

  hasPassedTrial(skillId) { return this._trialsPassed[skillId] ?? false; }

  getActiveSkills(weapon) {
    const subtypeId = this.getActiveSubtype(weapon);
    if (!subtypeId) return [];
    const subtype = SKILL_DATA[weapon]?.subtypes[subtypeId];
    if (!subtype) return [];
    return subtype.skills.map(skill => ({
      ...skill,
      available  : this.isSkillAvailable(weapon, subtypeId, skill.id),
      xpRequired : XP_REQUIRED[skill.rarity],
      trialLevel : TRIAL_LEVEL[skill.rarity],
      trialPassed: this.hasPassedTrial(skill.id),
      currentXP  : this._xp[weapon],
    }));
  }

  // ── Serialización ─────────────────────────────────────────────────────────

  serialize() {
    return {
      unlockedSubtypes: this._unlockedSubtypes,
      xp              : this._xp,
      totalXP         : this._totalXP,
      level           : this._level,
      trialsPassed    : this._trialsPassed,
      activeSubtype   : this._activeSubtype,
      activeFusion    : this._activeFusion,
      fusionUnlocked  : this.fusionUnlocked,
      magicEnergy     : this._magicEnergy,
      skillSlots      : this._skillSlots,
      flags           : this._flags,
      reputation      : this._reputation,
    };
  }

  load(data) {
    if (!data) return;
    if (data.unlockedSubtypes) this._unlockedSubtypes = data.unlockedSubtypes;
    if (data.xp)               this._xp               = data.xp;
    if (data.totalXP    !== undefined) this._totalXP    = data.totalXP;
    if (data.level      !== undefined) this._level      = data.level;
    if (data.trialsPassed)     this._trialsPassed      = data.trialsPassed;
    if (data.activeSubtype)    this._activeSubtype     = data.activeSubtype;
    if (data.activeFusion)     this._activeFusion      = data.activeFusion;
    if (data.fusionUnlocked !== undefined) this.fusionUnlocked = data.fusionUnlocked;
    if (data.magicEnergy    !== undefined) this._magicEnergy   = data.magicEnergy;
    if (data.skillSlots     !== undefined) this._skillSlots    = data.skillSlots;
    if (data.flags)            this._flags            = data.flags;
    if (data.reputation     !== undefined) this._reputation    = data.reputation;
  }
}
