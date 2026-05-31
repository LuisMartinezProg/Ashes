// core/progression.js — Ashes of the Reborn | Valiant Gaming

import { WEAPON_TREES, getTreeKey } from './skillData.js';
import { WEAPON_CRYSTAL_MAP       } from './skillData.js';

// ── XP necesario para cada nivel de personaje ─────────────────────────────
const LEVEL_XP = [
  0, 100, 250, 450, 700, 1000, 1400, 1900, 2500, 3200, 4000,
  5000, 6200, 7600, 9200, 11000, 13000, 15500, 18500, 22000, 26000,
];

// ── XP necesario para cada nivel de arma ─────────────────────────────────
const WEAPON_LEVEL_XP = [
  0, 80, 200, 380, 620, 920, 1300, 1780, 2360, 3050, 4000,
  5200, 6600, 8200, 10000, 12200, 14800, 17800, 21200, 25000, 30000,
];

// ── Cristales necesarios por nivel de arma ────────────────────────────────
const WEAPON_LEVEL_CRYSTALS = [
  0, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12,
  14, 16, 18, 20, 22, 24, 26, 28, 30, 35,
];

// ── Stats base por nivel de personaje ────────────────────────────────────
function _statsForLevel(level) {
  return {
    maxHp: 100 + level * 20,
    atk  : 10  + level * 3,
    def  : 5   + level * 2,
    speed: 5   + level * 0.5,
  };
}

// ── Daño base por nivel de arma ───────────────────────────────────────────
const WEAPON_BASE_DAMAGE = {
  katana: { base: 8,  perLevel: 4   },
  sword : { base: 12, perLevel: 3   },
  magic : { base: 6,  perLevel: 5   },
  bow   : { base: 7,  perLevel: 3.5 },
};

export function getWeaponDamageBonus(weapon, weaponLevel) {
  const cfg = WEAPON_BASE_DAMAGE[weapon] ?? { base: 8, perLevel: 3 };
  return Math.floor(cfg.base + cfg.perLevel * (weaponLevel - 1));
}

export class Progression {
  constructor() {
    // ── Nivel personaje ───────────────────────────────────────
    this._level   = 1;
    this._totalXP = 0;

    // ── Niveles por arma ──────────────────────────────────────
    this._weaponLevels = { katana: 1, sword: 1, magic: 1, bow: 1 };
    this._weaponXP     = { katana: 0, sword: 0, magic: 0, bow: 0 };

    // ── Árbol de habilidades ──────────────────────────────────
    // unlocked[treeKey][skillId] = true/false
    this._treeUnlocked = {};
    // loadout[treeKey] = { medio: skillId|null, arcano: skillId|null }
    this._loadout      = {};

    this._initTrees();

    // ── Sistemas anteriores (compatibilidad) ──────────────────
    this._activeSubtype  = { magic:'fire', katana:'speed', sword:'strength', bow:'precision' };
    this._activeFusion   = {};
    this.fusionUnlocked  = false;
    this._magicEnergy    = 0;
    this._skillSlots     = 1;
    this._flags          = {};
    this._reputation     = 0;
    this._trialsPassed   = {};

    // ── Callbacks ─────────────────────────────────────────────
    this.onLevelUp        = null;
    this.onWeaponLevelUp  = null;
    this.onXPGain         = null;
    this.onUnlock         = null;
    this.onNewSkillSlot   = null;
    this.onReputationGain = null;
    this.onEnergyUpdate   = null;
  }

  // ── Init árboles ──────────────────────────────────────────────────────────

  _initTrees() {
    for (const [key, tree] of Object.entries(WEAPON_TREES)) {
      this._treeUnlocked[key] = {};
      this._loadout[key]      = { medio: null, arcano: null };
      for (const [, skills] of Object.entries(tree.layers)) {
        for (const skill of skills) {
          this._treeUnlocked[key][skill.id] = skill.unlocked ?? false;
        }
      }
    }
  }

  // ── Nivel personaje ───────────────────────────────────────────────────────

  getLevel()   { return this._level;   }
  getTotalXP() { return this._totalXP; }
  getStats()   { return _statsForLevel(this._level); }

  getXPForNextLevel() {
    return LEVEL_XP[this._level] ?? null;
  }

  getXPProgress() {
    const cur  = LEVEL_XP[this._level - 1] ?? 0;
    const next = LEVEL_XP[this._level];
    if (!next) return 1;
    return (this._totalXP - cur) / (next - cur);
  }

  addXP(weapon, amount) {
    this._totalXP += amount;
    this._checkLevelUp();

    // También suma XP al arma
    if (weapon in this._weaponXP) {
      this._weaponXP[weapon] += amount;
      this._checkWeaponLevelUp(weapon);
    }

    if (this.onXPGain) this.onXPGain(weapon, amount);
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
      } else break;
    }
  }

  _applyLevelUpEffects() {
    const stats  = this.getStats();
    const player = window._partyManager?.getActiveCharacter() ?? window._player;
    if (player) {
      player.maxHp = stats.maxHp;
      player.hp    = Math.min(player.hp + 30, player.maxHp);
      player.onDamage?.(player.hp, player.maxHp);
    }
    const companion = window._companion;
    if (companion) {
      companion.maxHp = Math.floor(stats.maxHp * 0.85);
      companion.hp    = Math.min(companion.hp + 20, companion.maxHp);
    }
  }

  _showLevelUpNotification() {
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

  // ── Nivel por arma ────────────────────────────────────────────────────────

  getWeaponLevel(weapon)   { return this._weaponLevels[weapon] ?? 1; }
  getWeaponXP(weapon)      { return this._weaponXP[weapon]     ?? 0; }

  getWeaponXPForNext(weapon) {
    const lv = this._weaponLevels[weapon] ?? 1;
    return WEAPON_LEVEL_XP[lv] ?? null;
  }

  getWeaponXPProgress(weapon) {
    const lv   = this._weaponLevels[weapon] ?? 1;
    const cur  = WEAPON_LEVEL_XP[lv - 1] ?? 0;
    const next = WEAPON_LEVEL_XP[lv];
    if (!next) return 1;
    return (this._weaponXP[weapon] - cur) / (next - cur);
  }

  getWeaponCrystalCost(weapon) {
    const lv = this._weaponLevels[weapon] ?? 1;
    return WEAPON_LEVEL_CRYSTALS[lv] ?? 35;
  }

  canLevelUpWeapon(weapon) {
    const lv      = this._weaponLevels[weapon] ?? 1;
    if (lv >= 20) return false;
    const needed  = WEAPON_LEVEL_XP[lv];
    const xp      = this._weaponXP[weapon] ?? 0;
    const crystals= this.getWeaponCrystalCost(weapon);
    const crystalId = WEAPON_CRYSTAL_MAP[weapon];
    const inv     = window._inventory;
    const qty     = inv?._items?.materiales?.find?.(i => i.id === crystalId)?.qty ?? 0;
    return xp >= needed && qty >= crystals;
  }

  levelUpWeapon(weapon) {
    if (!this.canLevelUpWeapon(weapon)) return false;

    // Gastar cristales
    const crystalId = WEAPON_CRYSTAL_MAP[weapon];
    const crystals  = this.getWeaponCrystalCost(weapon);
    const inv       = window._inventory;
    const mat       = inv?._items?.materiales?.find?.(i => i.id === crystalId);
    if (mat) mat.qty -= crystals;

    this._weaponLevels[weapon]++;
    if (this.onWeaponLevelUp) this.onWeaponLevelUp(weapon, this._weaponLevels[weapon]);
    this._showWeaponLevelUpNotification(weapon);
    return true;
  }

  _checkWeaponLevelUp(weapon) {
    // Auto-sube si tiene XP suficiente pero NO cristales — solo notifica
    const lv     = this._weaponLevels[weapon] ?? 1;
    const maxLv  = 20;
    if (lv >= maxLv) return;
    const needed = WEAPON_LEVEL_XP[lv];
    if ((this._weaponXP[weapon] ?? 0) >= needed) {
      if (this.onXPGain) this.onXPGain(weapon, 0); // refresca UI
    }
  }

  _showWeaponLevelUpNotification(weapon) {
    const icons = { katana:'🗡️', sword:'⚔️', magic:'🔮', bow:'🏹' };
    const lv    = this._weaponLevels[weapon];
    const el    = document.createElement('div');
    Object.assign(el.style, {
      position     : 'fixed',
      top          : '28%',
      left         : '50%',
      transform    : 'translateX(-50%)',
      fontFamily   : "'Cinzel',serif",
      fontSize     : '12px',
      letterSpacing: '2px',
      color        : '#88aaff',
      background   : 'rgba(4,4,10,0.97)',
      border       : '1px solid rgba(136,170,255,0.5)',
      borderRadius : '10px',
      padding      : '12px 24px',
      zIndex       : '600',
      pointerEvents: 'none',
      textAlign    : 'center',
      opacity      : '1',
      transition   : 'opacity 1s',
    });
    el.innerHTML = `
      ${icons[weapon]} ARMA NIVEL ${lv}<br>
      <span style="font-size:9px;color:#aaa">
        Daño base +${WEAPON_BASE_DAMAGE[weapon]?.perLevel ?? 3}
      </span>
    `;
    document.body.appendChild(el);
    setTimeout(() => {
      el.style.opacity = '0';
      setTimeout(() => el.remove(), 1000);
    }, 2500);
  }

  // ── Árbol de habilidades ──────────────────────────────────────────────────

  isSkillUnlocked(charId, weapon, skillId) {
    const key = getTreeKey(charId, weapon);
    return this._treeUnlocked[key]?.[skillId] ?? false;
  }

  canUnlockSkill(charId, weapon, skillId) {
    const key  = getTreeKey(charId, weapon);
    const tree = WEAPON_TREES[key];
    if (!tree) return false;

    // Buscar el skill en el árbol
    const { skill, layerName } = this._findSkill(key, skillId);
    if (!skill) return false;
    if (this._treeUnlocked[key][skillId]) return false; // ya desbloqueado

    // Verificar XP y cristales
    const weaponXP = this._weaponXP[weapon] ?? 0;
    if (weaponXP < skill.cost.xp) return false;

    const crystalId = WEAPON_CRYSTAL_MAP[weapon];
    const inv       = window._inventory;
    const qty       = inv?._items?.materiales?.find?.(i => i.id === crystalId)?.qty ?? 0;
    if (qty < skill.cost.cristales) return false;

    // Verificar prerequisitos por capa
    return this._checkLayerPrereqs(key, layerName);
  }

  _checkLayerPrereqs(treeKey, layerName) {
    const tree = WEAPON_TREES[treeKey];
    if (!tree) return false;
    if (layerName === 'basico') return true;

    const order = ['basico', 'nv1', 'nv2', 'nv3', 'arcano'];
    const idx   = order.indexOf(layerName);
    if (idx <= 0) return true;

    const prevLayer     = order[idx - 1];
    const prevSkills    = tree.layers[prevLayer] ?? [];
    const unlockedCount = prevSkills.filter(s => this._treeUnlocked[treeKey][s.id]).length;

    // Para pasar a nv2 necesitas al menos 2 de nv1
    // Para pasar a nv3 necesitas todos de nv2
    // Para arcano necesitas todos de nv3
    if (layerName === 'nv2')   return unlockedCount >= 2;
    if (layerName === 'nv3')   return unlockedCount >= 3;
    if (layerName === 'arcano') return unlockedCount >= 3;
    return unlockedCount >= 1;
  }

  unlockSkill(charId, weapon, skillId) {
    if (!this.canUnlockSkill(charId, weapon, skillId)) return false;

    const key   = getTreeKey(charId, weapon);
    const { skill } = this._findSkill(key, skillId);
    if (!skill) return false;

    // Gastar cristales
    const crystalId = WEAPON_CRYSTAL_MAP[weapon];
    const inv       = window._inventory;
    const mat       = inv?._items?.materiales?.find?.(i => i.id === crystalId);
    if (mat && skill.cost.cristales > 0) mat.qty -= skill.cost.cristales;

    this._treeUnlocked[key][skillId] = true;
    if (this.onUnlock) this.onUnlock(charId, weapon, skillId);
    return true;
  }

  _findSkill(treeKey, skillId) {
    const tree = WEAPON_TREES[treeKey];
    if (!tree) return { skill: null, layerName: null };
    for (const [layerName, skills] of Object.entries(tree.layers)) {
      const skill = skills.find(s => s.id === skillId);
      if (skill) return { skill, layerName };
    }
    return { skill: null, layerName: null };
  }

  getUnlockedSkills(charId, weapon) {
    const key = getTreeKey(charId, weapon);
    return Object.entries(this._treeUnlocked[key] ?? {})
      .filter(([, v]) => v)
      .map(([id]) => id);
  }

  // ── Loadout ───────────────────────────────────────────────────────────────

  getLoadout(charId, weapon) {
    const key = getTreeKey(charId, weapon);
    return this._loadout[key] ?? { medio: null, arcano: null };
  }

  setLoadoutMedio(charId, weapon, skillId) {
    const key = getTreeKey(charId, weapon);
    if (!this._treeUnlocked[key]?.[skillId]) return false;
    // Verificar que no sea básico ni arcano
    const { layerName } = this._findSkill(key, skillId);
    if (layerName === 'basico' || layerName === 'arcano') return false;
    if (!this._loadout[key]) this._loadout[key] = { medio: null, arcano: null };
    this._loadout[key].medio = skillId;
    return true;
  }

  setLoadoutArcano(charId, weapon, skillId) {
    const key = getTreeKey(charId, weapon);
    if (!this._treeUnlocked[key]?.[skillId]) return false;
    const { layerName } = this._findSkill(key, skillId);
    if (layerName !== 'arcano') return false;
    if (!this._loadout[key]) this._loadout[key] = { medio: null, arcano: null };
    this._loadout[key].arcano = skillId;
    return true;
  }

  // Devuelve las 3 habilidades activas para el skillBar
  getActiveLoadoutSkills(charId, weapon) {
    const key     = getTreeKey(charId, weapon);
    const tree    = WEAPON_TREES[key];
    if (!tree) return [];

    const loadout = this._loadout[key] ?? { medio: null, arcano: null };
    const result  = [];

    // Siempre el básico
    const basico = tree.layers.basico?.[0];
    if (basico) result.push({ ...basico, layer: 'basico' });

    // Medio (nv1/nv2/nv3)
    if (loadout.medio) {
      const { skill } = this._findSkill(key, loadout.medio);
      if (skill) result.push({ ...skill, layer: 'medio' });
    }

    // Arcano
    if (loadout.arcano) {
      const { skill } = this._findSkill(key, loadout.arcano);
      if (skill) result.push({ ...skill, layer: 'arcano' });
    }

    return result;
  }

  // ── Compatibilidad con sistemas anteriores ────────────────────────────────

  getActiveSkills(weapon) {
    const charId = 'kael';
    return this.getActiveLoadoutSkills(charId, weapon);
  }

  getActiveSubtype(weapon) { return this._activeSubtype[weapon] ?? null; }
  setActiveSubtype(weapon, id) { this._activeSubtype[weapon] = id; }
  getActiveFusion(weapon)  { return this._activeFusion[weapon] ?? null; }
  setActiveFusion(weapon, school) { this._activeFusion[weapon] = school; }
  getActiveSchool(weapon)  { return this._activeFusion[weapon] ?? null; }
  setActiveSchool(weapon, school) { this._activeFusion[weapon] = school; }

  addMagicEnergy(amount) {
    this._magicEnergy += amount;
    const slotsNeeded = Math.floor(this._magicEnergy / 200);
    if (slotsNeeded > this._skillSlots) {
      this._skillSlots = slotsNeeded;
      if (this.onNewSkillSlot) this.onNewSkillSlot(this._skillSlots);
    }
    if (this.onEnergyUpdate) this.onEnergyUpdate(this._magicEnergy, this._skillSlots * 200);
  }

  getMagicEnergy()  { return this._magicEnergy; }
  getSkillSlots()   { return this._skillSlots;  }

  addReputation(amount) {
    this._reputation += amount;
    if (this.onReputationGain) this.onReputationGain(this._reputation);
  }

  getReputation() { return this._reputation; }

  setFlag(key, value) { this._flags[key] = value; }
  getFlag(key)        { return this._flags[key];  }

  passTrialForSkill(skillId) { this._trialsPassed[skillId] = true; }
  hasPassedTrial(skillId)    { return this._trialsPassed[skillId] ?? false; }

  isSubtypeUnlocked(weapon, subtypeId) { return true; }
  getUnlockedSubtypes(weapon) { return []; }
  unlockSubtype() {}
  unlockByStory()  {}

  // ── Serialización ─────────────────────────────────────────────────────────

  serialize() {
    return {
      level        : this._level,
      totalXP      : this._totalXP,
      weaponLevels : this._weaponLevels,
      weaponXP     : this._weaponXP,
      treeUnlocked : this._treeUnlocked,
      loadout      : this._loadout,
      activeSubtype: this._activeSubtype,
      activeFusion : this._activeFusion,
      fusionUnlocked: this.fusionUnlocked,
      magicEnergy  : this._magicEnergy,
      skillSlots   : this._skillSlots,
      flags        : this._flags,
      reputation   : this._reputation,
      trialsPassed : this._trialsPassed,
    };
  }

  load(data) {
    if (!data) return;
    if (data.level        !== undefined) this._level         = data.level;
    if (data.totalXP      !== undefined) this._totalXP       = data.totalXP;
    if (data.weaponLevels)               this._weaponLevels  = data.weaponLevels;
    if (data.weaponXP)                   this._weaponXP      = data.weaponXP;
    if (data.treeUnlocked)               this._treeUnlocked  = data.treeUnlocked;
    if (data.loadout)                    this._loadout       = data.loadout;
    if (data.activeSubtype)              this._activeSubtype = data.activeSubtype;
    if (data.activeFusion)               this._activeFusion  = data.activeFusion;
    if (data.fusionUnlocked !== undefined) this.fusionUnlocked = data.fusionUnlocked;
    if (data.magicEnergy    !== undefined) this._magicEnergy  = data.magicEnergy;
    if (data.skillSlots     !== undefined) this._skillSlots   = data.skillSlots;
    if (data.flags)                      this._flags         = data.flags;
    if (data.reputation     !== undefined) this._reputation   = data.reputation;
    if (data.trialsPassed)               this._trialsPassed  = data.trialsPassed;

    // Rellenar keys que no existían en saves viejos
    this._initMissingTrees();
  }

  _initMissingTrees() {
    for (const [key, tree] of Object.entries(WEAPON_TREES)) {
      if (!this._treeUnlocked[key]) this._treeUnlocked[key] = {};
      if (!this._loadout[key])      this._loadout[key] = { medio: null, arcano: null };
      for (const [, skills] of Object.entries(tree.layers)) {
        for (const skill of skills) {
          if (this._treeUnlocked[key][skill.id] === undefined) {
            this._treeUnlocked[key][skill.id] = skill.unlocked ?? false;
          }
        }
      }
    }
  }
}
