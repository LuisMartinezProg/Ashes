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
      velocidad: {
        label: 'Velocidad', icon: '💨', color: '#6dcc8a',
        skills: [
          { id: 'katana_vel_1', tier: 1, name: 'Corte Rápido I',      icon: '💨', desc: 'Tajo veloz básico, ideal para combos iniciales.', limitante: 'Daño bajo', effect: 'quick_slash', unlockType: 'xp', cost: { xp: 50,  cristales: 1 } },
          { id: 'katana_vel_2', tier: 1, name: 'Corte Rápido II',     icon: '💨', desc: 'Versión afinada del corte rápido, más daño.',      limitante: 'Daño moderado', effect: 'quick_slash', unlockType: 'xp', cost: { xp: 100, cristales: 2 } },
          { id: 'katana_vel_3', tier: 1, name: 'Paso Fantasma I',     icon: '⚡', desc: 'Dash con corte que atraviesa al enemigo.',        limitante: 'Recarga corta', effect: 'flash_step', unlockType: 'xp', cost: { xp: 150, cristales: 2 } },
          { id: 'katana_vel_4', tier: 2, name: 'Paso Fantasma II',    icon: '⚡', desc: 'Dash mejorado, mayor alcance.',                   limitante: 'Recarga corta', effect: 'flash_step', unlockType: 'xp', cost: { xp: 250, cristales: 3 } },
          { id: 'katana_vel_5', tier: 2, name: 'Danza de Cuchillas I',icon: '🌀', desc: 'Serie de cortes giratorios en área.',             limitante: 'Vulnerable al girar', effect: 'blade_dance', unlockType: 'xp', cost: { xp: 350, cristales: 4 } },
          { id: 'katana_vel_6', tier: 2, name: 'Danza de Cuchillas II',icon: '🌀', desc: 'Danza mejorada, más golpes por giro.',           limitante: 'Vulnerable al girar', effect: 'blade_dance', unlockType: 'xp', cost: { xp: 450, cristales: 4 } },
          { id: 'katana_vel_7', tier: 3, name: 'Mil Cortes',          icon: '🌪️', desc: 'Ráfaga masiva de cortes casi instantáneos.',       limitante: 'Alto consumo de energía', effect: 'thousand_cuts', unlockType: 'level_cap', cost: { levelRequired: MAX_WEAPON_LEVEL } },
          { id: 'katana_vel_8', tier: 3, name: 'Mil Cortes: Furia',   icon: '🌪️', desc: 'Versión desatada, más cortes por uso.',           limitante: 'Requiere maestría probada', effect: 'thousand_cuts', unlockType: 'level_cap+dungeon', cost: { levelRequired: MAX_WEAPON_LEVEL, dungeonId: null, timesRequired: 1 } },
          { id: 'katana_vel_9', tier: 3, name: 'Mil Cortes: Trascendencia', icon: '🌪️', desc: 'La forma definitiva de la velocidad.',      limitante: 'Solo para maestros', effect: 'thousand_cuts', unlockType: 'level_cap+dungeon_repeat', cost: { levelRequired: MAX_WEAPON_LEVEL, dungeonId: null, timesRequired: null } },
        ],
      },
      sombra: {
        label: 'Sombra', icon: '🌑', color: '#8844cc',
        skills: [
          { id: 'katana_som_1', tier: 1, name: 'Tajo Sombrío I',      icon: '🌑', desc: 'Corte imbuido en sombra, daño oculto.',           limitante: 'Daño bajo', effect: 'shadow_slash', unlockType: 'xp', cost: { xp: 50,  cristales: 1 } },
          { id: 'katana_som_2', tier: 1, name: 'Tajo Sombrío II',     icon: '🌑', desc: 'Versión afinada, mayor penetración.',             limitante: 'Daño moderado', effect: 'shadow_slash', unlockType: 'xp', cost: { xp: 100, cristales: 2 } },
          { id: 'katana_som_3', tier: 1, name: 'Caída Nocturna I',    icon: '🌌', desc: 'Invoca oscuridad que debilita al enemigo.',        limitante: 'Área pequeña', effect: 'nightfall', unlockType: 'xp', cost: { xp: 150, cristales: 2 } },
          { id: 'katana_som_4', tier: 2, name: 'Caída Nocturna II',   icon: '🌌', desc: 'Oscuridad más amplia y duradera.',                limitante: 'Área pequeña', effect: 'nightfall', unlockType: 'xp', cost: { xp: 250, cristales: 3 } },
          { id: 'katana_som_5', tier: 2, name: 'Paso del Vacío I',    icon: '🕳️', desc: 'Se funde con las sombras brevemente.',            limitante: 'Ventana corta', effect: 'void_step', unlockType: 'xp', cost: { xp: 350, cristales: 4 } },
          { id: 'katana_som_6', tier: 2, name: 'Paso del Vacío II',   icon: '🕳️', desc: 'Mayor duración en el vacío.',                     limitante: 'Ventana corta', effect: 'void_step', unlockType: 'xp', cost: { xp: 450, cristales: 4 } },
          { id: 'katana_som_7', tier: 3, name: 'Reino de Sombras',    icon: '🌑', desc: 'Arrastra al enemigo a un reino de oscuridad total.', limitante: 'Un uso por combate', effect: 'shadow_realm', unlockType: 'level_cap', cost: { levelRequired: MAX_WEAPON_LEVEL } },
          { id: 'katana_som_8', tier: 3, name: 'Reino de Sombras: Abismo', icon: '🌑', desc: 'El reino se vuelve inescapable.',            limitante: 'Requiere maestría probada', effect: 'shadow_realm', unlockType: 'level_cap+dungeon', cost: { levelRequired: MAX_WEAPON_LEVEL, dungeonId: null, timesRequired: 1 } },
          { id: 'katana_som_9', tier: 3, name: 'Reino de Sombras: Eterno', icon: '🌑', desc: 'La sombra definitiva, sin escape posible.',   limitante: 'Solo para maestros', effect: 'shadow_realm', unlockType: 'level_cap+dungeon_repeat', cost: { levelRequired: MAX_WEAPON_LEVEL, dungeonId: null, timesRequired: null } },
        ],
      },
      tormenta: {
        label: 'Tormenta', icon: '⚡', color: '#4488ff',
        skills: [
          { id: 'katana_tor_1', tier: 1, name: 'Tajo de Trueno I',    icon: '⚡', desc: 'Corte cargado de electricidad.',                  limitante: 'Daño bajo', effect: 'thunder_slash', unlockType: 'xp', cost: { xp: 50,  cristales: 1 } },
          { id: 'katana_tor_2', tier: 1, name: 'Tajo de Trueno II',   icon: '⚡', desc: 'Descarga más potente al impactar.',               limitante: 'Daño moderado', effect: 'thunder_slash', unlockType: 'xp', cost: { xp: 100, cristales: 2 } },
          { id: 'katana_tor_3', tier: 1, name: 'Campo Estático I',    icon: '🔌', desc: 'Genera un campo que ralentiza enemigos.',         limitante: 'Radio pequeño', effect: 'static_field', unlockType: 'xp', cost: { xp: 150, cristales: 2 } },
          { id: 'katana_tor_4', tier: 2, name: 'Campo Estático II',   icon: '🔌', desc: 'Campo más amplio y duradero.',                    limitante: 'Radio pequeño', effect: 'static_field', unlockType: 'xp', cost: { xp: 250, cristales: 3 } },
          { id: 'katana_tor_5', tier: 2, name: 'Tormenta de Truenos I', icon: '⛈️', desc: 'Invoca rayos sobre el área de combate.',         limitante: 'Recarga larga', effect: 'thunder_storm', unlockType: 'xp', cost: { xp: 350, cristales: 4 } },
          { id: 'katana_tor_6', tier: 2, name: 'Tormenta de Truenos II', icon: '⛈️', desc: 'Más rayos, mayor cobertura.',                  limitante: 'Recarga larga', effect: 'thunder_storm', unlockType: 'xp', cost: { xp: 450, cristales: 4 } },
          { id: 'katana_tor_7', tier: 3, name: 'Dios del Trueno',     icon: '🌩️', desc: 'Se convierte en un canal de tormenta pura.',       limitante: 'Alto consumo de energía', effect: 'god_of_thunder', unlockType: 'level_cap', cost: { levelRequired: MAX_WEAPON_LEVEL } },
          { id: 'katana_tor_8', tier: 3, name: 'Dios del Trueno: Furia', icon: '🌩️', desc: 'La tormenta se intensifica sin control.',       limitante: 'Requiere maestría probada', effect: 'god_of_thunder', unlockType: 'level_cap+dungeon', cost: { levelRequired: MAX_WEAPON_LEVEL, dungeonId: null, timesRequired: 1 } },
          { id: 'katana_tor_9', tier: 3, name: 'Dios del Trueno: Absoluto', icon: '🌩️', desc: 'La forma definitiva de la tormenta.',        limitante: 'Solo para maestros', effect: 'god_of_thunder', unlockType: 'level_cap+dungeon_repeat', cost: { levelRequired: MAX_WEAPON_LEVEL, dungeonId: null, timesRequired: null } },
        ],
      },
      honor: {
        label: 'Honor', icon: '⚜️', color: '#e8c9a0',
        skills: [
          { id: 'katana_hon_1', tier: 1, name: 'Última Resistencia I', icon: '🛡️', desc: 'Resiste con honor un golpe crítico.',            limitante: 'Un uso por combate', effect: 'last_stand', unlockType: 'xp', cost: { xp: 50,  cristales: 1 } },
          { id: 'katana_hon_2', tier: 1, name: 'Última Resistencia II', icon: '🛡️', desc: 'Resistencia más efectiva.',                     limitante: 'Un uso por combate', effect: 'last_stand', unlockType: 'xp', cost: { xp: 100, cristales: 2 } },
          { id: 'katana_hon_3', tier: 1, name: 'Mártir I',              icon: '❤️', desc: 'Sacrifica vida propia por daño devastador.',      limitante: 'Consume HP', effect: 'martyr', unlockType: 'xp', cost: { xp: 150, cristales: 2 } },
          { id: 'katana_hon_4', tier: 2, name: 'Mártir II',             icon: '❤️', desc: 'Sacrificio más eficiente.',                       limitante: 'Consume HP', effect: 'martyr', unlockType: 'xp', cost: { xp: 250, cristales: 3 } },
          { id: 'katana_hon_5', tier: 2, name: 'Hoja Sagrada I',        icon: '⚜️', desc: 'Imbuye la katana con energía sagrada.',           limitante: 'Recarga media', effect: 'sacred_blade', unlockType: 'xp', cost: { xp: 350, cristales: 4 } },
          { id: 'katana_hon_6', tier: 2, name: 'Hoja Sagrada II',       icon: '⚜️', desc: 'Energía sagrada más intensa.',                    limitante: 'Recarga media', effect: 'sacred_blade', unlockType: 'xp', cost: { xp: 450, cristales: 4 } },
          { id: 'katana_hon_7', tier: 3, name: 'Resistencia Legendaria', icon: '👑', desc: 'El honor se vuelve leyenda viva.',               limitante: 'Un uso por batalla', effect: 'legendary_stand', unlockType: 'level_cap', cost: { levelRequired: MAX_WEAPON_LEVEL } },
          { id: 'katana_hon_8', tier: 3, name: 'Resistencia Legendaria: Gloria', icon: '👑', desc: 'La leyenda se hace gloria eterna.',      limitante: 'Requiere maestría probada', effect: 'legendary_stand', unlockType: 'level_cap+dungeon', cost: { levelRequired: MAX_WEAPON_LEVEL, dungeonId: null, timesRequired: 1 } },
          { id: 'katana_hon_9', tier: 3, name: 'Resistencia Legendaria: Inmortal', icon: '👑', desc: 'El honor definitivo, inquebrantable.',  limitante: 'Solo para maestros', effect: 'legendary_stand', unlockType: 'level_cap+dungeon_repeat', cost: { levelRequired: MAX_WEAPON_LEVEL, dungeonId: null, timesRequired: null } },
        ],
      },
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
