// core/progression.js — Ashes of the Reborn | Valiant Gaming

import { WEAPON_CRYSTAL_MAP, getBranch, canUnlockSkill } from './skillData.js';
import { refreshEffectiveStats    } from './relics.js';

const LEVEL_XP = [
  0, 100, 250, 450, 700, 1000, 1400, 1900, 2500, 3200, 4000,
  5000, 6200, 7600, 9200, 11000, 13000, 15500, 18500, 22000, 26000,
];

const WEAPON_LEVEL_XP = [
  0, 80, 200, 380, 620, 920, 1300, 1780, 2360, 3050, 4000,
  5200, 6600, 8200, 10000, 12200, 14800, 17800, 21200, 25000, 30000,
];

const WEAPON_LEVEL_CRYSTALS = [
  0, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12,
  14, 16, 18, 20, 22, 24, 26, 28, 30, 35,
];

function _statsForLevelKael(level) {
  return {
    maxHp: 100 + level * 20,
    atk  : 10  + level * 3,
    def  : 5   + level * 2,
    speed: 5   + level * 0.5,
  };
}

function _statsForLevelMika(level) {
  return {
    maxHp: 80  + level * 15,
    atk  : 7   + level * 2,
    def  : 3   + level * 1,
    speed: 6   + level * 0.7,
    range: 8   + level * 0.5,
  };
}

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

// ── Clase base compartida ─────────────────────────────────────────────────
class ProgressionBase {
  constructor(charId, statsFn, startWeapons) {
    this._charId  = charId;
    this._statsFn = statsFn;

    this._level   = 1;
    this._totalXP = 0;

    this._weaponLevels = Object.fromEntries(startWeapons.map(w => [w, 1]));
    this._weaponXP     = Object.fromEntries(startWeapons.map(w => [w, 0]));

    this._activeSubtype  = Object.fromEntries(startWeapons.map(w => [w, 'default']));
    this._activeFusion   = {};
    this.fusionUnlocked  = false;
    this._magicEnergy    = 0;
    this._skillSlots     = 1;
    this._flags          = {};
    this._reputation     = 0;
    this._trialsPassed   = {};
    this._equippedRelic  = null;

    // ── Slots de equipo (arma / armadura / accesorio) ────────────────────
    this._equippedWeapon     = null; // { id, weaponType, stats, ... } — item completo de items.js
    this._equippedArmor      = null;
    this._equippedAccessory  = null;

    this.onLevelUp        = null;
    this.onWeaponLevelUp  = null;
    this.onXPGain         = null;
    this.onUnlock         = null;
    this.onNewSkillSlot   = null;
    this.onReputationGain = null;
    this.onEnergyUpdate   = null;
    this.onEquipChange    = null; // (slotType, item|null) => void
    this.onTreeSkillUnlock = null; // (weapon, branchId, slotId, skill) => void — nuevo, ver unlockTreeSkill()
  }

  getLevel()   { return this._level;   }
  getTotalXP() { return this._totalXP; }
  getCharId()  { return this._charId;  }

  // ── Stats finales (base por nivel + equipo) ──────────────────────────────
  // El arma equipada REEMPLAZA el bonus de daño por nivel (getWeaponDamageBonus)
  // solo para el weaponType actualmente activo. Armadura y accesorio SUMAN
  // siempre sus stats propios, sin reemplazar nada.
  getStats() {
    const base = this._statsFn(this._level);
    const out  = { ...base };

    // Armadura: suma directa de todos sus stats
    if (this._equippedArmor?.stats) {
      for (const [k, v] of Object.entries(this._equippedArmor.stats)) {
        out[k] = (out[k] ?? 0) + v;
      }
    }

    // Accesorio: suma directa de todos sus stats
    if (this._equippedAccessory?.stats) {
      for (const [k, v] of Object.entries(this._equippedAccessory.stats)) {
        out[k] = (out[k] ?? 0) + v;
      }
    }

    return out;
  }

  getXPForNextLevel() { return LEVEL_XP[this._level] ?? null; }

  getXPProgress() {
    const cur  = LEVEL_XP[this._level - 1] ?? 0;
    const next = LEVEL_XP[this._level];
    if (!next) return 1;
    return (this._totalXP - cur) / (next - cur);
  }

  addXP(weapon, amount) {
    this._totalXP += amount;
    this._checkLevelUp();
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
        // Avisar al árbol de habilidades: puede destrabar una rareza entera.
        window._skillTree?.setCharacterLevel(this._level);
        this._showLevelUpNotification();
      } else break;
    }
  }

  _applyLevelUpEffects() {
    const stats = this.getStats();
    if (this._charId === 'kael') {
      const player = window._partyManager?.getActiveCharacter() ?? window._player;
      if (player) {
        player.maxHp = stats.maxHp;
        player.hp    = Math.min(player.hp + 30, player.maxHp);
        player.onDamage?.(player.hp, player.maxHp);
      }
    } else if (this._charId === 'mika') {
  const companion = window._companion;
  if (companion) {
    companion.syncStatsFromProgression();
  }
    }
    refreshEffectiveStats(this._charId);
  }

  _showLevelUpNotification() {
    const names = { kael: 'KAEL', mika: 'MIKA' };
    const el = document.createElement('div');
    const offset = this._charId === 'mika' ? '32%' : '22%';
    Object.assign(el.style, {
      position     : 'fixed',
      top          : offset,
      left         : '50%',
      transform    : 'translateX(-50%)',
      fontFamily   : "'Cinzel',serif",
      fontSize     : '13px',
      letterSpacing: '3px',
      color        : this._charId === 'mika' ? '#88ddff' : '#C9A84C',
      background   : 'rgba(4,4,10,0.97)',
      border       : `1px solid ${this._charId === 'mika' ? 'rgba(136,221,255,0.6)' : 'rgba(201,168,76,0.6)'}`,
      borderRadius : '12px',
      padding      : '16px 28px',
      zIndex       : '600',
      pointerEvents: 'none',
      textAlign    : 'center',
      boxShadow    : `0 0 24px ${this._charId === 'mika' ? 'rgba(136,221,255,0.3)' : 'rgba(201,168,76,0.4)'}`,
      opacity      : '1',
      transition   : 'opacity 1s',
    });
    const stats = this.getStats();
    el.innerHTML = `
      ⬆ ${names[this._charId] ?? this._charId.toUpperCase()} — NIVEL ${this._level}<br>
      <span style="font-size:10px;color:#aaa;letter-spacing:1px">
        HP +${this._charId === 'mika' ? 15 : 20}
        &nbsp;|&nbsp; ATK +${this._charId === 'mika' ? 2 : 3}
        &nbsp;|&nbsp; DEF +${this._charId === 'mika' ? 1 : 2}
      </span>
    `;
    document.body.appendChild(el);
    setTimeout(() => {
      el.style.opacity = '0';
      setTimeout(() => el.remove(), 1000);
    }, 3000);
  }

  // ── Armas (nivel/XP del weaponType — sigue existiendo para armas SIN equipar) ──

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
    const lv = this._weaponLevels[weapon] ?? 1;
    if (lv >= 20) return false;
    const needed    = WEAPON_LEVEL_XP[lv];
    const xp        = this._weaponXP[weapon] ?? 0;
    const crystals  = this.getWeaponCrystalCost(weapon);
    const crystalId = WEAPON_CRYSTAL_MAP[weapon];
    return xp >= needed && this._getMaterialQty(crystalId) >= crystals;
  }

  levelUpWeapon(weapon) {
    if (!this.canLevelUpWeapon(weapon)) return false;
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
    const lv = this._weaponLevels[weapon] ?? 1;
    if (lv >= 20) return;
    const needed = WEAPON_LEVEL_XP[lv];
    if ((this._weaponXP[weapon] ?? 0) >= needed) {
      if (this.onXPGain) this.onXPGain(weapon, 0);
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

  // ── Daño de arma efectivo (equipada reemplaza la fórmula; si no hay, usa la fórmula) ──

  getEffectiveWeaponDamage(weapon) {
    if (this._equippedWeapon?.weaponType === weapon && this._equippedWeapon.stats?.ATK != null) {
      return this._equippedWeapon.stats.ATK;
    }
    return getWeaponDamageBonus(weapon, this.getWeaponLevel(weapon));
  }

  // ── Sistemas comunes ──────────────────────────────────────────────────────

  getActiveSubtype(weapon)         { return this._activeSubtype[weapon] ?? null; }
  setActiveSubtype(weapon, id)     { this._activeSubtype[weapon] = id; }
  getActiveFusion(weapon)          { return this._activeFusion[weapon] ?? null; }
  setActiveFusion(weapon, school)  { this._activeFusion[weapon] = school; }
  getActiveSchool(weapon)          { return this._activeFusion[weapon] ?? null; }
  setActiveSchool(weapon, school)  { this._activeFusion[weapon] = school; }

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

  isSubtypeUnlocked()   { return true; }
  getUnlockedSubtypes() { return [];   }
  unlockSubtype()       {}
  unlockByStory()       {}

  // ── Reliquias ────────────────────────────────────────────────────────────

  getEquippedRelic() { return this._equippedRelic; }

  equipRelic(relic) {
    if (!relic) return false;
    this._equippedRelic = relic;
    refreshEffectiveStats(this._charId);
    return true;
  }

  unequipRelic() {
    this._equippedRelic = null;
    refreshEffectiveStats(this._charId);
  }

  // ── Equipo: Arma / Armadura / Accesorio ──────────────────────────────────
  // Regla: 1 solo ítem por slot. Al equipar, el ítem sale de la mochila
  // (se maneja como "único", igual que las reliquias). Al desequipar, vuelve
  // a la mochila (window._inventory.addItem).

  getEquippedWeapon()     { return this._equippedWeapon;    }
  getEquippedArmor()      { return this._equippedArmor;     }
  getEquippedAccessory()  { return this._equippedAccessory; }

  equipWeapon(item) {
    if (!item || item.slot !== 'arma') return false;
    const prev = this._equippedWeapon;
    this._equippedWeapon = item;
    if (prev) window._inventory?.addItem?.(prev);
    window._inventory?.removeUniqueItem?.(item.id, 'armas');
    if (this.onEquipChange) this.onEquipChange('arma', item);
    refreshEffectiveStats(this._charId);
    return true;
  }

  unequipWeapon() {
    const prev = this._equippedWeapon;
    if (!prev) return false;
    this._equippedWeapon = null;
    window._inventory?.addItem?.(prev);
    if (this.onEquipChange) this.onEquipChange('arma', null);
    refreshEffectiveStats(this._charId);
    return true;
  }

  equipArmor(item) {
    if (!item || item.slot !== 'armadura') return false;
    const prev = this._equippedArmor;
    this._equippedArmor = item;
    if (prev) window._inventory?.addItem?.(prev);
    window._inventory?.removeUniqueItem?.(item.id, 'armaduras');
    if (this.onEquipChange) this.onEquipChange('armadura', item);
    refreshEffectiveStats(this._charId);
    return true;
  }

  unequipArmor() {
    const prev = this._equippedArmor;
    if (!prev) return false;
    this._equippedArmor = null;
    window._inventory?.addItem?.(prev);
    if (this.onEquipChange) this.onEquipChange('armadura', null);
    refreshEffectiveStats(this._charId);
    return true;
  }

  equipAccessory(item) {
    if (!item || item.slot !== 'accesorio') return false;
    const prev = this._equippedAccessory;
    this._equippedAccessory = item;
    if (prev) window._inventory?.addItem?.(prev);
    window._inventory?.removeUniqueItem?.(item.id, 'accesorios');
    if (this.onEquipChange) this.onEquipChange('accesorio', item);
    refreshEffectiveStats(this._charId);
    return true;
  }

  unequipAccessory() {
    const prev = this._equippedAccessory;
    if (!prev) return false;
    this._equippedAccessory = null;
    window._inventory?.addItem?.(prev);
    if (this.onEquipChange) this.onEquipChange('accesorio', null);
    refreshEffectiveStats(this._charId);
    return true;
  }

  // ── Árbol de skills por rama (skillData.js): estado y desbloqueo ────────
  // Lee el material del inventario en un solo lugar (compartido con
  // canLevelUpWeapon/levelUpWeapon de arriba, que hacían la misma búsqueda
  // duplicada inline).
  _getMaterialQty(crystalId) {
    const inv = window._inventory;
    return inv?._items?.materiales?.find?.(i => i.id === crystalId)?.qty ?? 0;
  }

  // Arma el estado {xp, reputacion, cristales} que canUnlockSkill() de
  // skillData.js espera para validar tier 1/2 (unlockType 'xp_rep').
  // NOTA DE DISEÑO (asumido por Claude, Luis dejó la decisión abierta):
  //   - xp: usa _weaponXP[weapon], el TOTAL compartido del arma — no hay
  //     tracking por rama todavía, así que las 4 ramas de un arma comparten
  //     el mismo progreso de xp. Comprar el arma XP cuenta para las 4 ramas.
  //   - reputacion: usa _reputation, el único valor compartido que existe
  //     hoy (no hay reputación separada por arma o por personaje).
  //   - cristales: cantidad actual en inventario para el cristal de ESE arma
  //     (WEAPON_CRYSTAL_MAP), el mismo recurso que ya usa levelUpWeapon().
  // Para tier 3 (level_cap / level_cap+dungeon / level_cap+dungeon_repeat)
  // este estado no aplica — esa lógica sigue PENDIENTE de diseño narrativo,
  // ver notas de balance. Devuelve null si no hay estado tier-3 disponible
  // en vez de inventar level/dungeonCompletions.
  getSkillUnlockState(weapon) {
    const crystalId = WEAPON_CRYSTAL_MAP[weapon];
    return {
      xp        : this._weaponXP[weapon] ?? 0,
      reputacion: this._reputation,
      cristales : this._getMaterialQty(crystalId),
    };
  }

  // Verifica si un slot específico de una rama puede desbloquearse ya.
  // Solo soporta tier 1/2 (unlockType 'xp_rep') por ahora — tier 3 siempre
  // devuelve false porque su lógica (level_cap+dungeon) está pendiente de
  // diseño narrativo y no debe fallar silenciosamente como "desbloqueable".
  canUnlockTreeSkill(weapon, branchId, slotId) {
    const branch = getBranch(weapon, branchId);
    const skill  = branch?.skills.find(s => s.id === slotId);
    if (!skill) return false;
    if (skill.unlockType !== 'xp_rep') return false; // tier 3: pendiente, nunca "listo"
    if (this.hasPassedTrial(slotId)) return false;   // ya desbloqueada, nada que hacer
    return canUnlockSkill(skill, this.getSkillUnlockState(weapon));
  }

  // Ejecuta el desbloqueo: valida de nuevo (nunca confiar en un check previo
  // del caller), cobra los cristales del inventario, y registra el
  // desbloqueo reusando _trialsPassed (mismo campo que branchMissions.js).
  // Devuelve { ok:true, skill } o { ok:false, reason } — nunca lanza.
  unlockTreeSkill(weapon, branchId, slotId) {
    const branch = getBranch(weapon, branchId);
    const skill  = branch?.skills.find(s => s.id === slotId);
    if (!skill) return { ok: false, reason: 'skill_not_found' };
    if (skill.unlockType !== 'xp_rep') return { ok: false, reason: 'tier3_pending_design' };
    if (this.hasPassedTrial(slotId)) return { ok: false, reason: 'already_unlocked' };
    if (!canUnlockSkill(skill, this.getSkillUnlockState(weapon))) {
      return { ok: false, reason: 'requirements_not_met' };
    }

    // Cobrar cristales (xp y reputación son acumulados de lectura, no se
    // "gastan" — solo el recurso de inventario se descuenta, igual que
    // levelUpWeapon() hace con WEAPON_CRYSTAL_MAP).
    const crystalId = WEAPON_CRYSTAL_MAP[weapon];
    const inv       = window._inventory;
    const mat       = inv?._items?.materiales?.find?.(i => i.id === crystalId);
    if (mat) mat.qty -= skill.cost.cristales;

    this.passTrialForSkill(slotId);
    if (this.onTreeSkillUnlock) this.onTreeSkillUnlock(weapon, branchId, slotId, skill);
    this._showTreeSkillUnlockNotification(skill);
    return { ok: true, skill };
  }

  _showTreeSkillUnlockNotification(skill) {
    const el = document.createElement('div');
    Object.assign(el.style, {
      position     : 'fixed',
      top          : '25%',
      left         : '50%',
      transform    : 'translateX(-50%)',
      fontFamily   : "'Cinzel',serif",
      fontSize     : '12px',
      letterSpacing: '2px',
      color        : '#8affc1',
      background   : 'rgba(4,4,10,0.97)',
      border       : '1px solid rgba(138,255,193,0.55)',
      borderRadius : '10px',
      padding      : '14px 26px',
      zIndex       : '600',
      pointerEvents: 'none',
      textAlign    : 'center',
      boxShadow    : '0 0 20px rgba(138,255,193,0.35)',
      opacity      : '1',
      transition   : 'opacity 1s',
    });
    el.innerHTML = `
      ${skill.icon ?? '✨'} HABILIDAD DESBLOQUEADA<br>
      <span style="font-size:11px;color:#eee">${skill.name}</span>
    `;
    document.body.appendChild(el);
    setTimeout(() => {
      el.style.opacity = '0';
      setTimeout(() => el.remove(), 1000);
    }, 2800);
  }

  // ── Serialización ─────────────────────────────────────────────────────────

  serialize() {
    return {
      charId       : this._charId,
      level        : this._level,
      totalXP      : this._totalXP,
      weaponLevels : this._weaponLevels,
      weaponXP     : this._weaponXP,
      activeSubtype: this._activeSubtype,
      activeFusion : this._activeFusion,
      fusionUnlocked: this.fusionUnlocked,
      magicEnergy  : this._magicEnergy,
      skillSlots   : this._skillSlots,
      flags        : this._flags,
      reputation   : this._reputation,
      trialsPassed : this._trialsPassed,
      equippedRelic: this._equippedRelic,
      equippedWeapon    : this._equippedWeapon,
      equippedArmor     : this._equippedArmor,
      equippedAccessory : this._equippedAccessory,
    };
  }

  load(data) {
    if (!data) return;
    if (data.level         !== undefined) this._level         = data.level;
    if (data.totalXP       !== undefined) this._totalXP       = data.totalXP;
    if (data.weaponLevels)                this._weaponLevels  = data.weaponLevels;
    if (data.weaponXP)                    this._weaponXP      = data.weaponXP;
    if (data.activeSubtype)               this._activeSubtype = data.activeSubtype;
    if (data.activeFusion)                this._activeFusion  = data.activeFusion;
    if (data.fusionUnlocked !== undefined) this.fusionUnlocked = data.fusionUnlocked;
    if (data.magicEnergy    !== undefined) this._magicEnergy   = data.magicEnergy;
    if (data.skillSlots     !== undefined) this._skillSlots    = data.skillSlots;
    if (data.flags)                        this._flags         = data.flags;
    if (data.reputation     !== undefined) this._reputation    = data.reputation;
    if (data.trialsPassed)                 this._trialsPassed  = data.trialsPassed;
    if (data.equippedRelic  !== undefined) this._equippedRelic = data.equippedRelic;
    if (data.equippedWeapon     !== undefined) this._equippedWeapon     = data.equippedWeapon;
    if (data.equippedArmor      !== undefined) this._equippedArmor      = data.equippedArmor;
    if (data.equippedAccessory  !== undefined) this._equippedAccessory  = data.equippedAccessory;
    // Avisar al árbol de habilidades el nivel cargado, por si desbloquea
    // rarezas que el save previo aún no tenía registradas.
    window._skillTree?.setCharacterLevel(this._level);
    refreshEffectiveStats(this._charId);
  }
}

// ── Progression de Kael ───────────────────────────────────────────────────
export class Progression extends ProgressionBase {
  constructor() {
    super('kael', _statsForLevelKael, ['katana', 'sword', 'magic', 'bow']);
    // Subtype por defecto de Kael
    this._activeSubtype = { magic:'fire', katana:'speed', sword:'strength', bow:'precision' };
  }
}

// ── Progression de Mika ───────────────────────────────────────────────────
export class ProgressionMika extends ProgressionBase {
  constructor() {
    super('mika', _statsForLevelMika, ['bow']);
    this._activeSubtype = { bow: 'precision' };
  }
}
