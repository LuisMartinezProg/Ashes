// core/progression.js — Ashes of the Reborn | Valiant Gaming
// Gestiona desbloqueos, XP especial y pruebas de habilidades

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

export class Progression {
  constructor() {
    this._unlockedSubtypes = JSON.parse(JSON.stringify(DEFAULT_UNLOCKED));

    this._xp = {
      magic : 0,
      katana: 0,
      sword : 0,
      bow   : 0,
    };

    this._trialsPassed  = {};
    this._activeFusion  = {};

    this._activeSubtype = {
      magic : 'fire',
      katana: 'speed',
      sword : 'strength',
      bow   : 'precision',
    };

    this.fusionUnlocked = false;

    this.onXPGain      = null;
    this.onUnlock      = null;
    this.onTrialPassed = null;
  }

  // ── Fusión ────────────────────────────────────────────────────────────────

  setActiveFusion(weapon, school) {
    this._activeFusion[weapon] = school;
  }

  getActiveFusion(weapon) {
    return this._activeFusion[weapon] ?? null;
  }

  // ── XP ───────────────────────────────────────────────────────────────────

  addXP(weapon, amount) {
    if (!(weapon in this._xp)) return;
    this._xp[weapon] += amount;
    if (this.onXPGain) this.onXPGain(weapon, amount, this._xp[weapon]);
  }

  getXP(weapon) {
    return this._xp[weapon] ?? 0;
  }

  // ── Subtipos ─────────────────────────────────────────────────────────────

  unlockSubtype(weapon, subtypeId) {
    if (!this._unlockedSubtypes[weapon]) this._unlockedSubtypes[weapon] = [];
    if (this._unlockedSubtypes[weapon].includes(subtypeId)) return;
    this._unlockedSubtypes[weapon].push(subtypeId);
    if (this.onUnlock) this.onUnlock(weapon, subtypeId);
    console.log(`[Progression] Desbloqueado: ${weapon} → ${subtypeId}`);
  }

  unlockByStory(weapon, subtypeId) {
    this.unlockSubtype(weapon, subtypeId);
  }

  isSubtypeUnlocked(weapon, subtypeId) {
    return this._unlockedSubtypes[weapon]?.includes(subtypeId) ?? false;
  }

  getUnlockedSubtypes(weapon) {
    return this._unlockedSubtypes[weapon] ?? [];
  }

  // ── Subtipo activo ────────────────────────────────────────────────────────

  setActiveSubtype(weapon, subtypeId) {
    if (!this.isSubtypeUnlocked(weapon, subtypeId)) {
      console.warn(`[Progression] Subtipo bloqueado: ${subtypeId}`);
      return false;
    }
    this._activeSubtype[weapon] = subtypeId;
    return true;
  }

  getActiveSubtype(weapon) {
    return this._activeSubtype[weapon] ?? null;
  }

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
    console.log(`[Progression] Prueba superada: ${skillId}`);
  }

  hasPassedTrial(skillId) {
    return this._trialsPassed[skillId] ?? false;
  }

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
      trialsPassed    : this._trialsPassed,
      activeSubtype   : this._activeSubtype,
      activeFusion    : this._activeFusion,
    };
  }

  load(data) {
    if (!data) return;
    if (data.unlockedSubtypes) this._unlockedSubtypes = data.unlockedSubtypes;
    if (data.xp)               this._xp               = data.xp;
    if (data.trialsPassed)     this._trialsPassed      = data.trialsPassed;
    if (data.activeSubtype)    this._activeSubtype     = data.activeSubtype;
    if (data.activeFusion)     this._activeFusion      = data.activeFusion;
  }
}
