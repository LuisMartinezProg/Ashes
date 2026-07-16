// core/skillData.js — Ashes of the Reborn | Valiant Gaming
//
// Estructura: cada arma tiene 4 ramas. Cada rama tiene 9 skills en 3 tiers.
//   Tier 1 (skills 1-3) y Tier 2 (skills 4-6): desbloqueo temprano por XP de arma.
//   Tier 3 (skills 7-9): desbloqueo escalonado —
//     skill 7: requiere nivel de arma máximo (20)
//     skill 8: requiere nivel máximo + completar una mazmorra específica (pendiente definir cuál)
//     skill 9: requiere nivel máximo + completar esa mazmorra N veces (pendiente definir cuántas)
//
// unlockType: 'xp' (tiers 1-2) | 'level_cap' | 'level_cap+dungeon' | 'level_cap+dungeon_repeat'
// Los campos dungeonId/timesRequired quedan null hasta definir el contenido de mazmorras.

const MAX_WEAPON_LEVEL = 20; // mismo tope que WEAPON_LEVEL_XP en progression.js

// ── Plantilla de una rama vacía (esqueleto) ────────────────────────────────
function _emptyBranch(label, icon, color) {
  return {
    label, icon, color,
    skills: [
      // Tier 1 — desbloqueo temprano por XP
      { id: null, tier: 1, name: null, icon: null, desc: null, limitante: null,
        effect: null, unlockType: 'xp', cost: { xp: 50,  cristales: 1 } },
      { id: null, tier: 1, name: null, icon: null, desc: null, limitante: null,
        effect: null, unlockType: 'xp', cost: { xp: 100, cristales: 2 } },
      { id: null, tier: 1, name: null, icon: null, desc: null, limitante: null,
        effect: null, unlockType: 'xp', cost: { xp: 150, cristales: 2 } },

      // Tier 2 — desbloqueo temprano por XP (más caro)
      { id: null, tier: 2, name: null, icon: null, desc: null, limitante: null,
        effect: null, unlockType: 'xp', cost: { xp: 250, cristales: 3 } },
      { id: null, tier: 2, name: null, icon: null, desc: null, limitante: null,
        effect: null, unlockType: 'xp', cost: { xp: 350, cristales: 4 } },
      { id: null, tier: 2, name: null, icon: null, desc: null, limitante: null,
        effect: null, unlockType: 'xp', cost: { xp: 450, cristales: 4 } },

      // Tier 3 — las 3 más fuertes, desbloqueo escalonado
      { id: null, tier: 3, name: null, icon: null, desc: null, limitante: null,
        effect: null, unlockType: 'level_cap',
        cost: { levelRequired: MAX_WEAPON_LEVEL } },
      { id: null, tier: 3, name: null, icon: null, desc: null, limitante: null,
        effect: null, unlockType: 'level_cap+dungeon',
        cost: { levelRequired: MAX_WEAPON_LEVEL, dungeonId: null, timesRequired: 1 } },
      { id: null, tier: 3, name: null, icon: null, desc: null, limitante: null,
        effect: null, unlockType: 'level_cap+dungeon_repeat',
        cost: { levelRequired: MAX_WEAPON_LEVEL, dungeonId: null, timesRequired: null } },
    ],
  };
}

// ── Árbol por arma: 4 ramas cada una ───────────────────────────────────────
export const WEAPON_SKILL_TREES = {

  katana: {
    label: 'Katana',
    icon : '🗡️',
    branches: {
      velocidad: _emptyBranch('Velocidad', '💨', '#6dcc8a'),
      sombra   : _emptyBranch('Sombra',    '🌑', '#8844cc'),
      tormenta : _emptyBranch('Tormenta',  '⚡', '#4488ff'),
      honor    : _emptyBranch('Honor',     '⚜️', '#e8c9a0'),
    },
  },

  sword: {
    label: 'Espada',
    icon : '⚔️',
    branches: {
      fuerza    : _emptyBranch('Fuerza',    '💪', '#cc4444'),
      defensa   : _emptyBranch('Defensa',   '🛡️', '#4488cc'),
      batalla   : _emptyBranch('Batalla',   '⚔️', '#ffcc44'),
      ejecucion : _emptyBranch('Ejecución', '💀', '#8a1a1a'),
    },
  },

  bow: {
    label: 'Arco',
    icon : '🏹',
    branches: {
      precision: _emptyBranch('Precisión', '🎯', '#6dcc8a'),
      veneno   : _emptyBranch('Veneno',    '☠️', '#66aa44'),
      lluvia   : _emptyBranch('Lluvia',    '🌧️', '#5599cc'),
      agilidad : _emptyBranch('Agilidad',  '💨', '#ccaa44'),
    },
  },

  magic: {
    label: 'Magia',
    icon : '🔮',
    branches: {
      fuego      : _emptyBranch('Fuego',      '🔥', '#ff6633'),
      hielo      : _emptyBranch('Hielo',      '❄️', '#66ccff'),
      viento     : _emptyBranch('Viento',     '🌬️', '#88ddaa'),
      naturaleza : _emptyBranch('Naturaleza', '🌿', '#66aa44'),
    },
  },
};

// ── Helpers de consulta ─────────────────────────────────────────────────────

export function getWeaponTree(weapon) {
  return WEAPON_SKILL_TREES[weapon] ?? null;
}

export function getBranch(weapon, branchId) {
  return WEAPON_SKILL_TREES[weapon]?.branches?.[branchId] ?? null;
}

export function getAllBranchIds(weapon) {
  const tree = WEAPON_SKILL_TREES[weapon];
  return tree ? Object.keys(tree.branches) : [];
}

export function getSkillById(weapon, branchId, skillId) {
  const branch = getBranch(weapon, branchId);
  return branch?.skills.find(s => s.id === skillId) ?? null;
}

// Devuelve si una skill puede desbloquearse dado el estado actual del arma.
// weaponState: { level, xp, dungeonCompletions: { [dungeonId]: count } }
export function canUnlockSkill(skill, weaponState) {
  if (skill.unlockType === 'xp') {
    return weaponState.xp >= skill.cost.xp;
  }
  if (skill.unlockType === 'level_cap') {
    return weaponState.level >= skill.cost.levelRequired;
  }
  if (skill.unlockType === 'level_cap+dungeon') {
    if (weaponState.level < skill.cost.levelRequired) return false;
    const count = weaponState.dungeonCompletions?.[skill.cost.dungeonId] ?? 0;
    return count >= (skill.cost.timesRequired ?? 1);
  }
  if (skill.unlockType === 'level_cap+dungeon_repeat') {
    if (weaponState.level < skill.cost.levelRequired) return false;
    const count = weaponState.dungeonCompletions?.[skill.cost.dungeonId] ?? 0;
    return count >= (skill.cost.timesRequired ?? 999);
  }
  return false;
}

// ── Compatibilidad con código legacy (mismos exports que el archivo viejo) ──
export const WEAPON_CRYSTAL_MAP = {
  katana: 'cristalKatana',
  sword : 'cristalEspada',
  magic : 'cristalMagia',
  bow   : 'cristalArco',
};

export const RARITY_COLORS = {
  common   : '#aaaaaa',
  rare     : '#4488ff',
  epic     : '#aa44ff',
  legendary: '#ffaa00',
};
