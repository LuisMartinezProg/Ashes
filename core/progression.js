// core/progression.js — Ashes of the Reborn | Valiant Gaming
// Gestiona desbloqueos, XP especial y pruebas de habilidades

import { SKILL_DATA, DEFAULT_UNLOCKED } from './skillData.js';

// XP especial requerida por rareza para desbloquear habilidad
const XP_REQUIRED = {
  common   : 0,    // disponible al desbloquear el subtipo
  rare     : 100,
  epic     : 300,
  legendary: 700,
};

// Nivel de enemigos requerido para la prueba por rareza
const TRIAL_LEVEL = {
  common   : 0,    // sin prueba
  rare     : 2,
  epic     : 5,
  legendary: 10,
};

export class Progression {
  constructor() {
    // Subtipos desbloqueados por arma
    this._unlockedSubtypes = structuredClone(DEFAULT_UNLOCKED);

    // XP especial por arma (la dropean enemigos)
    this._xp = {
      magic : 0,
      katana: 0,
      sword : 0,
      bow   : 0,
    };

    // Habilidades que pasaron la prueba
    // { [skillId]: true }
    this._trialsPassed = {};

    // Subtipo activo por arma
    this._activeSubtype = {
      magic : 'fire',
      katana: 'speed',
      sword : 'strength',
      bow   : 'precision',
    };

    // Callbacks
    this.onXPGain       = null; // (weapon, xp, total)
    this.onUnlock       = null; // (weapon, subtypeId)
    this.onTrialPassed  = null; // (skillId)
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

  // Desbloqueo por historia (el protagonista)
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

  // Verifica si una habilidad está disponible para usar
  isSkillAvailable(weapon, subtypeId, skillId) {
    if (!this.isSubtypeUnlocked(weapon, subtypeId)) return false;

    const subtype = SKILL_DATA[weapon]?.subtypes[subtypeId];
    if (!subtype) return false;

    const skill = subtype.skills.find(s => s.id === skillId);
    if (!skill) return false;

    // Common siempre disponible si el subtipo está desbloqueado
    if (skill.rarity === 'common') return true;

    // El resto requiere XP suficiente Y prueba superada
    const hasXP   = this._xp[weapon] >= XP_REQUIRED[skill.rarity];
    const hasTrial = skill.rarity === 'common' || this._trialsPassed[skillId];
    return hasXP && hasTrial;
  }

  // Registra que el jugador pasó la prueba de una habilidad
  passTrialForSkill(skillId) {
    this._trialsPassed[skillId] = true;
    if (this.onTrialPassed) this.onTrialPassed(skillId);
    console.log(`[Progression] Prueba superada: ${skillId}`);
  }

  hasPassedTrial(skillId) {
    return this._trialsPassed[skillId] ?? false;
  }

  // Devuelve las 4 habilidades del subtipo activo con su estado
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

  // ── Serialización (para guardar progreso después) ─────────────────────────

  serialize() {
    return {
      unlockedSubtypes: this._unlockedSubtypes,
      xp              : this._xp,
      trialsPassed    : this._trialsPassed,
      activeSubtype   : this._activeSubtype,
    };
  }

  load(data) {
    if (!data) return;
    if (data.unlockedSubtypes) this._unlockedSubtypes = data.unlockedSubtypes;
    if (data.xp)               this._xp               = data.xp;
    if (data.trialsPassed)     this._trialsPassed      = data.trialsPassed;
    if (data.activeSubtype)    this._activeSubtype     = data.activeSubtype;
  }
      }
