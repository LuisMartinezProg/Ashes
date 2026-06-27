// data/relics.js — Ashes of the Reborn | Valiant Gaming

export const WEAPONS  = ['sword', 'katana', 'bow'];
export const ELEMENTS = ['fuego', 'hielo', 'viento', 'rayo', 'naturaleza', 'agua'];

const ELEMENT_ICON = {
  fuego: '🔥', hielo: '❄️', viento: '🌪️',
  rayo: '⚡', naturaleza: '🌿', agua: '💧',
};

const WEAPON_LABEL = {
  sword: 'Espada', katana: 'Katana', bow: 'Arco',
};

// Catálogo de 18 combinaciones (3 armas × 6 elementos).
// rarity, stats y effectId quedan en placeholder hasta el balance/prototipo.
export const RELICS = {};

for (const weapon of WEAPONS) {
  for (const element of ELEMENTS) {
    const id = `relic_${weapon}_${element}`;
    RELICS[id] = {
      id,
      section : 'reliquias',
      weapon,
      element,
      rarity  : 'rara',      // pendiente de balance
      stats   : { atk: 0 },  // pendiente de balance
      effectId: null,        // pendiente del catálogo de 18 efectos
      icon    : ELEMENT_ICON[element],
      name    : `Reliquia de ${WEAPON_LABEL[weapon]} — ${ELEMENT_ICON[element]}`,
    };
  }
}

export function getRelicId(weapon, element) {
  return `relic_${weapon}_${element}`;
}

export function getRelicData(weapon, element) {
  return RELICS[getRelicId(weapon, element)] ?? null;
}
