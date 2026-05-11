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

    this.fusionUnlocked  = false;
    this._magicEnergy    = 0;
    this._skillSlots     = 1; // slots de habilidades disponibles
    this._flags          = {};

    this.onXPGain        = null;
    this.onUnlock        = null;
    this.onTrialPassed   = null;
    this.onNewSkillSlot  = null; // callback cuando se desbloquea slot
  }

  // ── Energía mágica ────────────────────────────────────────────────────────

  addMagicEnergy(amount) {
    this._magicEnergy += amount;
    console.log(`[Progression] Energía mágica: ${this._magicEnergy}`);

    // Revisar si se desbloquea nuevo slot
    const slotsNeeded = Math.floor(this._magicEnergy / MAGIC_ENERGY_PER_SKILL);
    if (slotsNeeded > this._skillSlots) {
      this._skillSlots = slotsNeeded;
      if (this.onNewSkillSlot) this.onNewSkillSlot(this._skillSlots);
      this._showSkillNotification();
    }
  }

  getMagicEnergy()  { return this._magicEnergy; }
  getSkillSlots()   { return this._skillSlots; }

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
      el.style.opacity = '0';
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
    if (this.onXPGain) this.onXPGain(weapon, amount, this._xp[weapon]);
  }

  getXP(weapon) { return this._xp[weapon] ?? 0; }

  // ── Subtipos ─────────────────────────────────────────────────────────────

  unlockSubtype(weapon, subtypeId) {
    if (!this._unlockedSubtypes[weapon]) this._unlockedSubtypes[weapon] = [];
    if (this._unlockedSubtypes[weapon].includes(subtypeId)) return;
    this._unlockedSubtypes[weapon].push(subtypeId);
    if (this.onUnlock) this.onUnlock(weapon, subtypeId);
  }

  unlockByStory(weapon, subtypeId)       { this.unlockSubtype(weapon, subtypeId); }
  isSubtypeUnlocked(weapon, subtypeId)   { return this._unlockedSubtypes[weapon]?.includes(subtypeId) ?? false; }
  getUnlockedSubtypes(weapon)            { return this._unlockedSubtypes[weapon] ?? []; }

  // ── Subtipo activo ────────────────────────────────────────────────────────

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
      trialsPassed    : this._trialsPassed,
      activeSubtype   : this._activeSubtype,
      activeFusion    : this._activeFusion,
      fusionUnlocked  : this.fusionUnlocked,
      magicEnergy     : this._magicEnergy,
      skillSlots      : this._skillSlots,
      flags           : this._flags,
    };
  }

  load(data) {
    if (!data) return;
    if (data.unlockedSubtypes) this._unlockedSubtypes = data.unlockedSubtypes;
    if (data.xp)               this._xp               = data.xp;
    if (data.trialsPassed)     this._trialsPassed      = data.trialsPassed;
    if (data.activeSubtype)    this._activeSubtype     = data.activeSubtype;
    if (data.activeFusion)     this._activeFusion      = data.activeFusion;
    if (data.fusionUnlocked !== undefined) this.fusionUnlocked = data.fusionUnlocked;
    if (data.magicEnergy !== undefined)    this._magicEnergy   = data.magicEnergy;
    if (data.skillSlots  !== undefined)    this._skillSlots    = data.skillSlots;
    if (data.flags)            this._flags            = data.flags;
  }
}
