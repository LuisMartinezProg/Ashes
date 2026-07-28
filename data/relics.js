// data/relics.js — Ashes of the Reborn | Valiant Gaming
//
// Catálogo de las 18 reliquias (3 armas × 6 elementos). Cada entrada es la
// "ficha" de la reliquia: nombre, color, ícono, y el effectId que la conecta
// con su comportamiento real en core/relics.js (registerRelicEffect).
//
// NOTA DE REWORK (v2): las reliquias ya no se eligen en el menú pre-partida.
// Ahora dropean en cofres de mazmorra como INSTANCIAS con rareza propia
// ({relicId, rarity}), y se equipan/cambian desde un menú del inventario.
// Este archivo sigue siendo el catálogo de las 18 IDENTIDADES (efecto base);
// la rareza de una instancia dropeada escala ese efecto vía RARITY_MULTIPLIER,
// no vía copias separadas del catálogo.

export const WEAPONS  = ['sword', 'katana', 'bow'];
export const ELEMENTS = ['fuego', 'hielo', 'viento', 'rayo', 'naturaleza', 'agua'];

// Elementos que cada personaje puede elegir para su reliquia (subconjunto
// de 3, no las 6 completas). Kael=Umbral, Mika=Astral — asignación temática,
// no confirmada por Luis en detalle, marcada así en memoria del proyecto.
export const CHARACTER_ELEMENTS = {
  kael: ['fuego', 'rayo', 'naturaleza'],
  mika: ['hielo', 'viento', 'agua'],
};

// Rarezas de reliquia, en orden ascendente. Mismo esquema de 5 niveles
// que el sistema de fusión de equipo, para mantener un solo lenguaje de
// rareza en todo el juego.
export const RELIC_RARITIES = ['comun', 'raro', 'epico', 'legendario', 'mitico'];

// Multiplicador aplicado al valor base del efecto según la rareza de la
// instancia dropeada. Reutiliza los mismos porcentajes que la fusión de
// equipo (+8/+18/+30/+45/+65) para no inventar una escala nueva — pendiente
// de que Luis confirme si quiere números distintos para reliquias.
export const RARITY_MULTIPLIER = {
  comun     : 1.00,
  raro      : 1.08,
  epico     : 1.18,
  legendario: 1.30,
  mitico    : 1.45,
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

// Modelo de activación por arma (rework v2). Puramente informativo desde
// este archivo — la lógica real vive en core/relics.js, pero se expone aquí
// para que cualquier UI (inventario, tooltip) pueda mostrar cómo se activa
// esta reliquia sin tener que conocer la lógica de combate.
export const ACTIVATION_MODEL = {
  sword : 'charge_shield',  // 4 golpes básicos -> botón 4s -> escudo 7s
  katana: 'auto_combo',     // auto-activa en el 3er golpe del combo
  bow   : 'aim_button',     // botón visible solo mientras se apunta
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
// Esto sigue siendo el catálogo de IDENTIDADES — no incluye rareza como
// parte fija, porque la rareza ahora vive en la INSTANCIA dropeada, no en
// la identidad de la reliquia (ver createRelicInstance()/RARITY_MULTIPLIER).
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
      icon    : ELEMENT_ICON[element],
      color   : ELEMENT_COLOR[element],
      name    : info?.name ?? `Reliquia de ${WEAPON_LABEL[weapon]} — ${ELEMENT_ICON[element]}`,
      desc    : info?.desc ?? '',
      effectId: key, // usado por core/relics.js para buscar su función de efecto
      activation: ACTIVATION_MODEL[weapon],
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

// ---------------------------------------------------------------------
// Instancias de reliquia (rework v2 — loot de mazmorra)
// ---------------------------------------------------------------------
// Una instancia es lo que realmente vive en el inventario/loot del jugador:
// la identidad (weapon+element) más una rareza propia. Dos reliquias con
// el mismo relicId pueden tener distinta rareza si dropearon en mazmorras
// distintas.

let _instanceCounter = 0;

// Crea una instancia de reliquia lista para meter al inventario/loot.
// weapon/element: identidad (cuál de las 18). rarity: una de RELIC_RARITIES.
export function createRelicInstance(weapon, element, rarity = 'comun') {
  const base = getRelicData(weapon, element);
  if (!base) return null;
  if (!RELIC_RARITIES.includes(rarity)) rarity = 'comun';

  _instanceCounter++;
  return {
    instanceId: `relicinst_${base.id}_${Date.now()}_${_instanceCounter}`,
    relicId   : base.id,
    weapon    : base.weapon,
    element   : base.element,
    rarity,
    multiplier: RARITY_MULTIPLIER[rarity],
  };
}

// Devuelve el valor de efecto ya escalado por la rareza de la instancia.
// baseValue es el número base (ej. 0.08 para quemadura 8%) definido en el
// balance oficial del proyecto; esta función solo aplica el multiplicador.
export function getScaledEffectValue(baseValue, rarity) {
  const mult = RARITY_MULTIPLIER[rarity] ?? 1;
  return baseValue * mult;
}

// Filtra una lista de instancias de reliquia, dejando solo las que el
// personaje dado puede equipar (arma fija del personaje + sus 3 elementos
// permitidos). weaponOfCharacter es el arma ya elegida por ese personaje
// (Kael: la elegida en pre-game; Mika: siempre 'bow').
export function filterCompatibleInstances(instances, charId, weaponOfCharacter) {
  const allowedElements = getElementsForCharacter(charId);
  return instances.filter(inst =>
    inst.weapon === weaponOfCharacter && allowedElements.includes(inst.element)
  );
}
