// data/relics.js — Ashes of the Reborn | Valiant Gaming
//
// Catálogo de las 18 reliquias (3 armas × 6 elementos). Cada entrada es la
// "ficha" de la reliquia: nombre, color, ícono, y el effectId que la conecta
// con su comportamiento real en core/relics.js (registerRelicEffect).

export const WEAPONS  = ['sword', 'katana', 'bow'];
export const ELEMENTS = ['fuego', 'hielo', 'viento', 'rayo', 'naturaleza', 'agua'];

// Elementos que cada personaje puede elegir para su reliquia (subconjunto
// de 3, no las 6 completas). Kael=Umbral, Mika=Astral — asignación temática,
// no confirmada por Luis en detalle, marcada así en memoria del proyecto.
export const CHARACTER_ELEMENTS = {
  kael: ['fuego', 'rayo', 'naturaleza'],
  mika: ['hielo', 'viento', 'agua'],
};

const ELEMENT_ICON = {
  fuego: '🔥', hielo: '❄️', viento: '🌪️',
  rayo: '⚡', naturaleza: '🌿', agua: '💧',
};

// Color hex para el tinte/glow del arma y el color base de las partículas.
const ELEMENT_COLOR = {
  fuego     : '#ff5522',
  hielo     : '#66d9ff',
  viento    : '#a8e6c2',
  rayo      : '#ffe066',
  naturaleza: '#5cb85c',
  agua      : '#4aa8d8',
};

const WEAPON_LABEL = {
  sword: 'Espada', katana: 'Katana', bow: 'Arco',
};

// Nombre temático + descripción corta por combinación (weapon_element).
// effectId es la clave que core/relics.js usa junto con registerRelicEffect()
// para saber qué función de efecto ejecutar al activarse.
const RELIC_INFO = {
  sword_fuego:      { name: 'Ascua del Verdugo',    desc: 'El golpe de área deja quemando a los enemigos cercanos.' },
  katana_fuego:     { name: 'Filo de Cenizas',       desc: 'Acumula calor en 2 golpes; el tercero estalla en fuego.' },
  bow_fuego:        { name: 'Lluvia de Brasas',      desc: 'La flecha deja una zona de fuego donde impacta.' },

  sword_hielo:      { name: 'Escarcha del Guardián', desc: 'El golpe de área congela y ralentiza a los enemigos cercanos.' },
  katana_hielo:     { name: 'Filo Glacial',          desc: 'Acumula frío en 2 golpes; el tercero casi congela al enemigo.' },
  bow_hielo:        { name: 'Punta de Escarcha',      desc: 'La flecha ralentiza al enemigo que impacta.' },

  sword_rayo:       { name: 'Yunque Tormentoso',     desc: 'El golpe de área tiene chance de aturdir a los enemigos cercanos.' },
  katana_rayo:      { name: 'Filo del Trueno',       desc: 'Acumula carga en 2 golpes; el tercero descarga un rayo fuerte.' },
  bow_rayo:         { name: 'Flecha Fulgurante',      desc: 'La flecha encadena un rayo hacia otro enemigo cercano.' },

  sword_viento:     { name: 'Torbellino del Viajero', desc: 'El golpe de área impulsa al jugador hacia adelante.' },
  katana_viento:    { name: 'Paso del Vendaval',      desc: 'Los golpes acumulados dan un impulso temporal de velocidad.' },
  bow_viento:       { name: 'Ala de Tormenta',        desc: 'Disparar da un empujón hacia atrás, útil para mantener distancia.' },

  sword_naturaleza: { name: 'Corteza Viviente',       desc: 'El golpe de área cura una porción de vida al jugador.' },
  katana_naturaleza:{ name: 'Filo de Savia',          desc: 'El tercer golpe acumulado cura una porción de vida.' },
  bow_naturaleza:   { name: 'Semilla Certera',        desc: 'Cada flecha que impacta cura una pequeña cantidad de vida.' },

  sword_agua:       { name: 'Marea Protectora',       desc: 'El golpe de área otorga un escudo temporal que absorbe daño.' },
  katana_agua:      { name: 'Filo de Rocío',          desc: 'El tercer golpe acumulado otorga el mismo escudo temporal.' },
  bow_agua:         { name: 'Corriente Evasiva',      desc: 'Disparar da una pequeña chance de esquivar el próximo golpe recibido.' },
};

// Catálogo final: 18 combinaciones ya llenas con nombre/color/effectId real.
export const RELICS = {};

for (const weapon of WEAPONS) {
  for (const element of ELEMENTS) {
    const id   = `relic_${weapon}_${element}`;
    const key  = `${weapon}_${element}`;
    const info = RELIC_INFO[key];

    RELICS[id] = {
      id,
      section : 'reliquias',
      weapon,
      element,
      rarity  : 'rara', // pendiente de balance de rareza — sin cambios respecto a antes
      icon    : ELEMENT_ICON[element],
      color   : ELEMENT_COLOR[element],
      name    : info?.name ?? `Reliquia de ${WEAPON_LABEL[weapon]} — ${ELEMENT_ICON[element]}`,
      desc    : info?.desc ?? '',
      effectId: key, // usado por core/relics.js para buscar su función de efecto
    };
  }
}

export function getRelicId(weapon, element) {
  return `relic_${weapon}_${element}`;
}

export function getRelicData(weapon, element) {
  return RELICS[getRelicId(weapon, element)] ?? null;
}

export function getElementColor(element) {
  return ELEMENT_COLOR[element] ?? '#ffffff';
}

export function getElementsForCharacter(charId) {
  return CHARACTER_ELEMENTS[charId] ?? ELEMENTS;
}
