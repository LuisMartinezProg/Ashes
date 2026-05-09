/**
 * data/structures.js — Estructuras y materiales del sistema de construcción
 * Requiere: core/building.js
 */

// ─────────────────────────────────────────────
// MATERIALES
// ─────────────────────────────────────────────
export const MATERIALS = {
  madera  : { id: 'madera',   label: 'Madera',    color: '#8B6340', icon: '🪵' },
  piedra  : { id: 'piedra',   label: 'Piedra',    color: '#8a8a8a', icon: '🪨' },
  hierro  : { id: 'hierro',   label: 'Hierro',    color: '#a0b0c0', icon: '⚙️' },
  mineral : { id: 'mineral',  label: 'Mineral',   color: '#c8b0ff', icon: '💎' },
};

// ─────────────────────────────────────────────
// TIERS DE MATERIALES
// ─────────────────────────────────────────────
export const TIERS = [
  { id: 'madera',  label: 'Madera',  material: 'madera',  unlocked: true  },
  { id: 'piedra',  label: 'Piedra',  material: 'piedra',  unlocked: false },
  { id: 'hierro',  label: 'Hierro',  material: 'hierro',  unlocked: false },
  { id: 'mineral', label: 'Mineral', material: 'mineral', unlocked: false },
];

// ─────────────────────────────────────────────
// ESTRUCTURAS
// Costos por tier: [madera, piedra, hierro, mineral]
// hp: puntos de vida de la estructura
// size: tamaño en unidades Three.js [x, y, z]
// ─────────────────────────────────────────────
export const STRUCTURES = {

  fogata: {
    id       : 'fogata',
    label    : 'Fogata',
    icon     : '🔥',
    desc     : 'Fuente de luz y calor. Regenera HP al estar cerca.',
    unlocked : true,
    blueprint: false, // no necesita boceto
    tiers: {
      madera: { cost: { madera: 5 },  hp: 50,  size: [1, 0.5, 1] },
    },
    effect: { type: 'regen', amount: 2, radius: 5 },
  },

  refugio: {
    id       : 'refugio',
    label    : 'Refugio',
    icon     : '⛺',
    desc     : 'Protege del clima. Punto de descanso.',
    unlocked : true,
    blueprint: false,
    tiers: {
      madera: { cost: { madera: 20 }, hp: 100, size: [4, 3, 4] },
      piedra: { cost: { piedra: 15 }, hp: 300, size: [4, 3, 4] },
      hierro: { cost: { hierro: 10 }, hp: 600, size: [4, 3, 4] },
    },
    effect: { type: 'respawn' },
  },

  muro: {
    id       : 'muro',
    label    : 'Muro',
    icon     : '🧱',
    desc     : 'Protege el pueblo de monstruos. Escala en resistencia.',
    unlocked : true,
    blueprint: false,
    tiers: {
      madera: { cost: { madera: 8 },  hp: 80,  size: [4, 3, 1] },
      piedra: { cost: { piedra: 6 },  hp: 250, size: [4, 3, 1] },
      hierro: { cost: { hierro: 4 },  hp: 500, size: [4, 3, 1] },
    },
    variants: ['pequeno', 'mediano', 'grande'],
    effect: { type: 'barrier' },
  },

  puerta: {
    id       : 'puerta',
    label    : 'Puerta',
    icon     : '🚪',
    desc     : 'Entrada controlada al pueblo.',
    unlocked : true,
    blueprint: false,
    tiers: {
      madera: { cost: { madera: 10 }, hp: 60,  size: [3, 3, 1] },
      piedra: { cost: { piedra: 8 },  hp: 200, size: [3, 3, 1] },
      hierro: { cost: { hierro: 5 },  hp: 400, size: [3, 3, 1] },
    },
    variants: ['pequena', 'mediana', 'grande'],
    effect: { type: 'gate' },
  },

  // ── Requieren boceto ──

  casa_protagonista: {
    id       : 'casa_protagonista',
    label    : 'Tu casa',
    icon     : '🏠',
    desc     : 'La base del protagonista. Escala hasta castillo.',
    unlocked : false,
    blueprint: true,
    tiers: {
      madera: { cost: { madera: 40 },  hp: 150, size: [6, 4, 6] },
      piedra: { cost: { piedra: 30 },  hp: 400, size: [6, 4, 6] },
      hierro: { cost: { hierro: 20 },  hp: 800, size: [6, 4, 6] },
    },
    effect: { type: 'home' },
  },

  herreria: {
    id       : 'herreria',
    label    : 'Herrería',
    icon     : '⚒️',
    desc     : 'Fabrica herramientas y armaduras.',
    unlocked : false,
    blueprint: true,
    tiers: {
      madera: { cost: { madera: 30 },  hp: 120, size: [5, 4, 5] },
      piedra: { cost: { piedra: 25 },  hp: 350, size: [5, 4, 5] },
    },
    effect: { type: 'crafting', recipes: ['herramienta_piedra', 'armadura_hierro'] },
  },

  torre: {
    id       : 'torre',
    label    : 'Torre de guardia',
    icon     : '🗼',
    desc     : 'Base elevada para arqueros. Detecta enemigos a distancia.',
    unlocked : false,
    blueprint: true,
    tiers: {
      madera: { cost: { madera: 35 },  hp: 100, size: [3, 8, 3] },
      piedra: { cost: { piedra: 25 },  hp: 300, size: [3, 8, 3] },
      hierro: { cost: { hierro: 15 },  hp: 600, size: [3, 8, 3] },
    },
    effect: { type: 'detection', radius: 20 },
  },

  fuente: {
    id       : 'fuente',
    label    : 'Fuente de agua',
    icon     : '⛲',
    desc     : 'Regenera stamina y agua del pueblo.',
    unlocked : false,
    blueprint: true,
    tiers: {
      piedra: { cost: { piedra: 20 },  hp: 200, size: [3, 2, 3] },
    },
    effect: { type: 'stamina_regen', amount: 5, radius: 8 },
  },

  enfermeria: {
    id       : 'enfermeria',
    label    : 'Enfermería',
    icon     : '🏥',
    desc     : 'Cura aliados y al protagonista.',
    unlocked : false,
    blueprint: true,
    tiers: {
      madera: { cost: { madera: 25 },  hp: 100, size: [5, 3, 5] },
      piedra: { cost: { piedra: 20 },  hp: 280, size: [5, 3, 5] },
    },
    effect: { type: 'heal', amount: 10, radius: 6 },
  },

  casa_theron: {
    id: 'casa_theron', label: 'Casa de Theron', icon: '🏡',
    desc: 'Residencia de Theron. Desbloquea misiones diplomáticas.',
    unlocked: false, blueprint: true,
    tiers: {
      madera: { cost: { madera: 30 }, hp: 120, size: [5, 4, 5] },
      piedra: { cost: { piedra: 25 }, hp: 320, size: [5, 4, 5] },
    },
    effect: { type: 'relation', character: 'theron' },
  },

  casa_aelith: {
    id: 'casa_aelith', label: 'Casa de Aelith', icon: '🏡',
    desc: 'Residencia de Aelith. Desbloquea misiones de exploración.',
    unlocked: false, blueprint: true,
    tiers: {
      madera: { cost: { madera: 30 }, hp: 120, size: [5, 4, 5] },
      piedra: { cost: { piedra: 25 }, hp: 320, size: [5, 4, 5] },
    },
    effect: { type: 'relation', character: 'aelith' },
  },

  casa_korrath: {
    id: 'casa_korrath', label: 'Casa de Korrath', icon: '🏡',
    desc: 'Residencia de Korrath. Desbloquea entrenamiento de combate.',
    unlocked: false, blueprint: true,
    tiers: {
      piedra: { cost: { piedra: 35 }, hp: 400, size: [6, 5, 6] },
      hierro: { cost: { hierro: 20 }, hp: 700, size: [6, 5, 6] },
    },
    effect: { type: 'relation', character: 'korrath' },
  },

};

// ─────────────────────────────────────────────
// HERRAMIENTAS
// ─────────────────────────────────────────────
export const TOOLS = {
  punos: {
    id: 'punos', label: 'Puños', tier: 0,
    recolecta: ['madera'],
    multiplicador: 1,
  },
  hacha_madera: {
    id: 'hacha_madera', label: 'Hacha de madera', tier: 1,
    cost: { madera: 8 },
    recolecta: ['madera'],
    multiplicador: 2,
  },
  pico_madera: {
    id: 'pico_madera', label: 'Pico de madera', tier: 1,
    cost: { madera: 8 },
    recolecta: ['piedra'],
    multiplicador: 1,
  },
  hacha_piedra: {
    id: 'hacha_piedra', label: 'Hacha de piedra', tier: 2,
    cost: { madera: 4, piedra: 6 },
    recolecta: ['madera'],
    multiplicador: 3,
  },
  pico_piedra: {
    id: 'pico_piedra', label: 'Pico de piedra', tier: 2,
    cost: { madera: 4, piedra: 6 },
    recolecta: ['piedra', 'hierro'],
    multiplicador: 2,
  },
};
