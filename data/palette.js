// data/palette.js — Ashes of the Reborn | Valiant Gaming
// Paleta MochiGo — fuente única de verdad para módulos JS de UI.
// Mismo contenido que css/mochigo.css, en formato importable.
// Cambiar la paleta completa = editar solo este archivo.
//
// Concepto: arco "ceniza → renacer". Un extremo gris-frío casi sin
// saturar (ash) y una familia principal que va de oscuro/apagado a
// vibrante/luminoso dentro del mismo matiz — la misma idea, encendida.
// El dorado (jahoda.gold / accent) es el "ascua": el puente entre
// ambos extremos. El rojo (danger) queda aislado solo para amenaza.
//
// Convención: los bloques marcados "fuera de MochiGo" son sistemas de
// código funcional (rareza, elementos, zonas, tipos) que necesitan más
// de 5 colores distinguibles a simple vista. Se centralizan aquí igual,
// con nombre, para no tener hex sueltos en ningún archivo de ui/.

export const MOCHIGO = {
  // Extremo "ceniza" — gris frío casi monocromo, base de los paneles de UI
  ash:      { deep: '#14161C', mid: '#2A2E38', light: '#5C6270' },

  // Familia principal — análogos fríos (azul → violeta → cian)
  furina:   { dark: '#182640', light: '#7FBFE0' },
  clorinde: { dark: '#2B2247', light: '#A08CE8' },
  skirk:    { light: '#D2E8F7', dark: '#10121E', teal: '#57C9DE', black: '#08090F' },
  navia:    { dark: '#1D4436', light: '#8FD6A8' },

  // El "ascua" — dorado, único, sin variantes que compitan entre sí
  jahoda:   { gold: '#E0BE72', purple: '#A08CE8', green: '#5FA870' },
  accent:   '#F5DFA0',

  // Rojo aislado — únicamente amenaza/daño, nunca decorativo
  danger:   '#D14545',
};

// ── Roles semánticos (mismo mapeo que :root en mochigo.css) ──
export const THEME = {
  gold      : MOCHIGO.accent,
  goldLight : MOCHIGO.furina.light,
  goldDim   : MOCHIGO.navia.dark,
  ashDeep   : MOCHIGO.ash.deep,
  ashMid    : MOCHIGO.ash.mid,
  ash       : '#333A48',
  smoke     : '#3F4759',
  text      : '#F2E8D0',
  textDim   : MOCHIGO.ash.light,
  ember     : '#8A3820',
};

// ── Rareza (usado en inventario, gacha, equipo) ──
export const RARITY_COLOR = {
  comun      : MOCHIGO.navia.light,
  raro       : MOCHIGO.jahoda.green,
  epico      : MOCHIGO.clorinde.light,
  legendario : MOCHIGO.accent,
};

// ══════════════════════════════════════════════════════════════════════════
// HUD (ui/hud.js)
// ══════════════════════════════════════════════════════════════════════════

export const HUD_CHARACTERS = {
  kael: {
    active      : MOCHIGO.clorinde.light,
    borderActive: `${MOCHIGO.clorinde.light}88`,
    glow        : 'rgba(160,140,232,0.55)',
    hpGradient  : `linear-gradient(90deg,${MOCHIGO.skirk.dark},${MOCHIGO.clorinde.light})`,
  },
  mika: {
    inactive  : 'rgba(87,201,222,0.55)',
    hpGradient: 'linear-gradient(90deg,rgba(16,18,30,0.5),rgba(87,201,222,0.55))',
  },
};

export const HUD_BOSS_BAR = {
  name    : MOCHIGO.clorinde.light,
  border  : 'rgba(160,140,232,0.4)',
  fillHigh: `linear-gradient(90deg,${MOCHIGO.skirk.dark},${MOCHIGO.clorinde.light})`,
  fillMid : `linear-gradient(90deg,${MOCHIGO.clorinde.light},${MOCHIGO.jahoda.purple})`,
  fillLow : `linear-gradient(90deg,#5C2020,${MOCHIGO.danger})`,
};

export const HUD_REACTIONS = {
  vapor        : { text: '💨 VAPOR',           color: MOCHIGO.clorinde.light },
  discharge    : { text: '⚡ DESCARGA',         color: MOCHIGO.accent },
  blizzard     : { text: '❄️ VENTISCA',         color: MOCHIGO.clorinde.light },
  cyclone      : { text: '🌪️ CICLÓN',           color: MOCHIGO.clorinde.light },
  dark_sentence: { text: '☠️ SENTENCIA OSCURA', color: MOCHIGO.skirk.dark },
};

export const HUD_STAMINA = {
  high: MOCHIGO.accent,
  mid : MOCHIGO.jahoda.gold,
  low : MOCHIGO.danger,
};

export const HUD_MATERIALS = {
  madera : { color: '#8C6A46', icon: '🪵', label: 'Madera' },
  piedra : { color: '#767C88', icon: '🪨', label: 'Piedra' },
  hierro : { color: '#8A96A8', icon: '⚙️', label: 'Hierro' },
  mineral: { color: MOCHIGO.jahoda.purple, icon: '💎', label: 'Mineral' },
};

export const HUD_DANGER = {
  fillHigh: `linear-gradient(90deg,#B23838,${MOCHIGO.danger})`,
  fillMid : 'linear-gradient(90deg,#B8722E,#E0A050)',
  fillLow : 'linear-gradient(90deg,#5C2020,#8A3838)',
};

// ══════════════════════════════════════════════════════════════════════════
// DIALOGUE (ui/dialogue.js) — 100% MochiGo
// ══════════════════════════════════════════════════════════════════════════

export const DIALOGUE_UI = {
  border       : 'rgba(224,190,114,0.35)',
  name         : MOCHIGO.jahoda.gold,
  text         : 'rgba(255,248,230,0.88)',
  shopBtnBg    : 'rgba(224,190,114,0.2)',
  shopBtnBorder: 'rgba(224,190,114,0.5)',
  nextBtnBg    : 'rgba(224,190,114,0.15)',
  nextBtnBorder: 'rgba(224,190,114,0.4)',
  talkBtnBg    : 'rgba(8,9,15,0.85)',
  talkBtnBorder: 'rgba(224,190,114,0.5)',
  glow         : 'rgba(224,190,114,0.2)',
};

// ══════════════════════════════════════════════════════════════════════════
// BESTIARY POPUP (ui/bestiaryPopup.js) — 100% MochiGo
// ══════════════════════════════════════════════════════════════════════════

export const BESTIARY_POPUP = {
  bg         : 'linear-gradient(135deg, rgba(8,9,15,0.97) 0%, rgba(43,34,71,0.97) 100%)',
  border     : 'rgba(224,190,114,0.35)',
  title      : 'rgba(224,190,114,0.55)',
  name       : MOCHIGO.jahoda.gold,
  zone       : 'rgba(224,190,114,0.45)',
  type       : 'rgba(160,140,232,0.7)',
  desc       : 'rgba(224,190,114,0.38)',
  barGradient: `linear-gradient(90deg, #7A6030, ${MOCHIGO.jahoda.gold})`,
};

// ══════════════════════════════════════════════════════════════════════════
// BESTIARY SCREEN (ui/bestiaryScreen.js) — fuera de MochiGo (8 zonas + 11 tipos)
// ══════════════════════════════════════════════════════════════════════════

export const BESTIARY_ZONES = {
  'Bosque'                : '#2A4A2E',
  'Bosque Profundo'       : '#183A22',
  'Llanuras'               : '#5C6A3A',
  'Camino'                 : '#4A4232',
  'Territorio Yami'        : MOCHIGO.clorinde.dark,
  'Mazmorras'               : MOCHIGO.skirk.dark,
  'Mazmorra — Jefe'        : '#5C2222',
  'Mazmorra — Jefe Final'  : '#7A1414',
};

export const BESTIARY_TYPES = {
  'Animal'     : '#4A7A3E',
  'Criatura'   : '#357A52',
  'Elemental'  : MOCHIGO.skirk.teal,
  'Bestia'     : '#7A4A32',
  'No-Muerto'  : '#5C5470',
  'Humano'     : '#6A5C42',
  'Sombra'     : '#3A2C50',
  'Yami'       : MOCHIGO.jahoda.purple,
  'Constructo' : '#4A5468',
  'Jefe'       : MOCHIGO.danger,
  'Jefe Final' : '#7A1414',
};

// ══════════════════════════════════════════════════════════════════════════
// BUILD MENU (ui/buildMenu.js) — reutiliza HUD_MATERIALS + tiers propios
// ══════════════════════════════════════════════════════════════════════════

export const BUILD_TIERS = {
  madera : '#8C6A46',
  piedra : '#888888',
  hierro : '#8A96A8',
  mineral: MOCHIGO.jahoda.purple,
};

// ══════════════════════════════════════════════════════════════════════════
// CHARACTER MENU (ui/characterMenu.js) — 100% MochiGo (dorado Jahoda)
// ══════════════════════════════════════════════════════════════════════════

export const CHARACTER_MENU = {
  gold      : MOCHIGO.jahoda.gold,
  goldDim   : 'rgba(224,190,114,0.6)',
  goldFaint : 'rgba(224,190,114,0.15)',
  border    : 'rgba(224,190,114,0.35)',
  danger    : MOCHIGO.danger,
  success   : MOCHIGO.jahoda.green,
  xpGradient: `linear-gradient(90deg,#7A6030,${MOCHIGO.jahoda.gold})`,
  xpMaxGrad : `linear-gradient(90deg,${MOCHIGO.jahoda.gold},${MOCHIGO.accent})`,
};

// ══════════════════════════════════════════════════════════════════════════
// FUSION MENU (ui/fusionMenu.js) — fuera de MochiGo (4 escuelas elementales)
// ══════════════════════════════════════════════════════════════════════════

export const FUSION_SCHOOLS = {
  fuego  : { emoji: '🔥', name: 'Fuego',   desc: 'QUEMADURA',  effect: 'Daño por segundo al atacar',  color: '#E0793F' },
  hielo  : { emoji: '❄️', name: 'Hielo',   desc: 'RALENTIZAR', effect: 'Reduce velocidad enemiga',    color: MOCHIGO.skirk.teal },
  viento : { emoji: '💨', name: 'Viento',  desc: 'IMPULSO',    effect: 'Te lanza lejos al golpear',   color: MOCHIGO.skirk.light },
  soporte: { emoji: '💚', name: 'Soporte', desc: 'VITALIDAD',  effect: 'Recuperas 5% del daño hecho', color: MOCHIGO.navia.light },
};

// ══════════════════════════════════════════════════════════════════════════
// GACHA (ui/gachaMenu.js + ui/gachaBoardView.js) — fuera de MochiGo
// (3 rarezas + 5 tipos de casilla; sistema de código funcional propio)
// ══════════════════════════════════════════════════════════════════════════

export const GACHA_RARITY = {
  comun: '#B0A8D0',
  raro : MOCHIGO.jahoda.purple,
  epico: MOCHIGO.jahoda.gold,
};

export const GACHA_TILES = {
  plain: '#655C78',
  gems : MOCHIGO.skirk.teal,
  coin : '#E0AE7A',
  echo : MOCHIGO.jahoda.purple,
  veil : MOCHIGO.jahoda.gold,
};

// ══════════════════════════════════════════════════════════════════════════
// INVENTORY (ui/inventory.js) — reutiliza RARITY_COLOR global (arriba)
// ══════════════════════════════════════════════════════════════════════════

// ══════════════════════════════════════════════════════════════════════════
// MAP UI (ui/mapUI.js) — fuera de MochiGo (5 zonas geográficas + 8 tipos de pin)
// ══════════════════════════════════════════════════════════════════════════

export const MAP_ZONES = [
  { label: 'Greymantle',   color: '#1A3222', minZ: -80, maxZ: -40 },
  { label: 'Bosque claro', color: '#2A4A2E', minZ: -40, maxZ: -10 },
  { label: 'Planicie',     color: '#3E5C34', minZ: -10, maxZ:  30 },
  { label: 'Camino',       color: '#4E6A3E', minZ:  30, maxZ:  60 },
  { label: 'Ironfell',     color: '#565E52', minZ:  60, maxZ: 100 },
];

export const MAP_DUNGEONS = {
  1: { color: MOCHIGO.jahoda.gold,   label: 'Mazmorra I'   },
  2: { color: MOCHIGO.skirk.teal,    label: 'Mazmorra II'  },
  3: { color: MOCHIGO.jahoda.purple, label: 'Mazmorra III' },
};

export const MAP_PINS = [
  { icon: '🏠', label: 'Refugio',      color: MOCHIGO.navia.light },
  { icon: '⚔️', label: 'Combate',      color: MOCHIGO.danger },
  { icon: '🏪', label: 'Comercio',     color: '#D9A55E' },
  { icon: '⛏️', label: 'Recursos',     color: MOCHIGO.skirk.light },
  { icon: '🏛️', label: 'Monumento',    color: MOCHIGO.accent },
  { icon: '🚩', label: 'Base',         color: MOCHIGO.jahoda.gold },
  { icon: '⚠️', label: 'Peligro',      color: '#E0793F' },
  { icon: '🔮', label: 'Lugar mágico', color: MOCHIGO.jahoda.purple },
];

// ══════════════════════════════════════════════════════════════════════════
// PARTY MENU (ui/partyMenu.js) — fuera de MochiGo (6 elementos + reacciones + 8 personajes)
// ══════════════════════════════════════════════════════════════════════════

export const PARTY_ELEMENTS = [
  { id: 'umbral',    label: 'Umbral',     icon: '🌑', color: MOCHIGO.clorinde.dark },
  { id: 'astral',    label: 'Astral',     icon: '✨', color: MOCHIGO.skirk.teal },
  { id: 'elemental', label: 'Elemental',  icon: '🔥', color: '#E0793F' },
  { id: 'arcanum',   label: 'Arcanum',    icon: '💠', color: MOCHIGO.furina.light },
  { id: 'vital',     label: 'Vital',      icon: '❤️', color: MOCHIGO.navia.light },
  { id: 'spiritual', label: 'Espiritual', icon: '👁️', color: MOCHIGO.accent },
];

export const PARTY_REACTIONS = {
  'umbral+astral'    : { name: 'Eclipse',        icon: '⭐', color: '#F8F4E8', desc: 'Daño masivo + ceguera 3s.' },
  'umbral+elemental' : { name: 'Condena Oscura', icon: '🔥', color: '#E0793F', desc: 'Quema continua + reducción DEF.' },
  'umbral+arcanum'   : { name: 'Fractura',       icon: '💠', color: MOCHIGO.furina.light, desc: 'Rompe defensa permanentemente.' },
  'astral+elemental' : { name: 'Nova Solar',     icon: '⚡', color: MOCHIGO.accent, desc: 'Explosión en área masiva.' },
  'astral+vital'     : { name: 'Resurgir',       icon: '💚', color: MOCHIGO.navia.light, desc: 'Cura masiva al personaje activo.' },
  'elemental+arcanum': { name: 'Sobrecarga',     icon: '💥', color: MOCHIGO.jahoda.purple, desc: 'Explosión mágica + stun.' },
};

export const PARTY_CHARACTERS = [
  { id:'kael', name:'Kael', element:'umbral',    icon:'🗡️', color: MOCHIGO.clorinde.dark, unlocked:true,  avatar:'K' },
  { id:'mika', name:'Mika', element:'astral',    icon:'🏹', color: MOCHIGO.skirk.teal,     unlocked:true,  avatar:'M' },
  { id:'zara', name:'Zara', element:'elemental', icon:'🔮', color: '#E0793F',               unlocked:false, avatar:'Z' },
  { id:'rhen', name:'Rhen', element:'arcanum',   icon:'⚔️', color: MOCHIGO.furina.light,   unlocked:false, avatar:'R' },
  { id:'lyra', name:'Lyra', element:'vital',     icon:'🌿', color: MOCHIGO.navia.light,     unlocked:false, avatar:'L' },
  { id:'oryn', name:'Oryn', element:'spiritual', icon:'🌀', color: MOCHIGO.accent,          unlocked:false, avatar:'O' },
  { id:'dusk', name:'Dusk', element:'umbral',    icon:'🌙', color: '#4A3E68',               unlocked:false, avatar:'D' },
  { id:'vael', name:'Vael', element:'astral',    icon:'🌟', color: MOCHIGO.skirk.light,     unlocked:false, avatar:'V' },
];

// ══════════════════════════════════════════════════════════════════════════
// SKILL BAR (ui/skillBar.js) — capas de habilidad, fuera de MochiGo
// ══════════════════════════════════════════════════════════════════════════

export const SKILL_LAYERS = {
  basico: 'rgba(122,132,150,0.6)',
  medio : 'rgba(127,191,224,0.8)',
  arcano: 'rgba(160,140,232,0.9)',
};

// ══════════════════════════════════════════════════════════════════════════
// SKILL TREE (ui/skillTree.js) — fuera de MochiGo (6 rarezas + 5 categorías)
// ══════════════════════════════════════════════════════════════════════════

export const SKILLTREE_RARITY = {
  comun:      { label: 'Común',      color: '#9AA0AC', glow: '#767C88', size: 24, cost: 1 },
  rara:       { label: 'Rara',       color: MOCHIGO.furina.light, glow: '#4A90B0', size: 28, cost: 2 },
  epica:      { label: 'Épica',      color: MOCHIGO.jahoda.purple, glow: '#6E5FC0', size: 32, cost: 3 },
  legendaria: { label: 'Legendaria', color: MOCHIGO.jahoda.gold,   glow: '#B08D3A', size: 36, cost: 4 },
  mitica:     { label: 'Mítica',     color: MOCHIGO.danger,        glow: '#9A2F2F', size: 40, cost: 5 },
  divina:     { label: 'Divina',     color: '#F8F4E8',             glow: MOCHIGO.skirk.light, size: 46, cost: 8 },
};

export const SKILLTREE_CATEGORIES = {
  ofensiva:    { label: 'Ofensiva',    icon: '⚔️', color: '#E0793F' },
  defensiva:   { label: 'Defensiva',   icon: '🛡️', color: MOCHIGO.furina.light },
  movilidad:   { label: 'Movilidad',   icon: '💨', color: MOCHIGO.navia.light },
  soporte:     { label: 'Soporte',     icon: '💚', color: MOCHIGO.jahoda.gold },
  estrategica: { label: 'Estratégica', icon: '⭐', color: MOCHIGO.jahoda.purple },
};

// ══════════════════════════════════════════════════════════════════════════
// WEAPON SELECT (ui/weaponSelect.js) — fuera de MochiGo (4 acentos de arma)
// ══════════════════════════════════════════════════════════════════════════

export const WEAPON_ACCENTS = {
  katana: { accent: '#E8CBA0', glow: 'rgba(232,203,160,0.35)' },
  sword : { accent: MOCHIGO.furina.light, glow: 'rgba(127,191,224,0.3)' },
  magic : { accent: '#C47AE8', glow: 'rgba(196,122,232,0.35)' },
  bow   : { accent: MOCHIGO.navia.light, glow: 'rgba(143,214,168,0.3)' },
};
