// data/palette.js — Ashes of the Reborn | Valiant Gaming
// Paleta MochiGo — fuente única de verdad para módulos JS de UI.
// Mismo contenido que css/mochigo.css, en formato importable.
// Cambiar la paleta completa = editar solo este archivo.
//
// Convención: los bloques marcados "fuera de MochiGo" son sistemas de
// código funcional (rareza, elementos, zonas, tipos) que necesitan más
// de 5 colores distinguibles a simple vista. Se centralizan aquí igual,
// con nombre, para no tener hex sueltos en ningún archivo de ui/.

export const MOCHIGO = {
  furina:   { dark: '#0D2B4E', light: '#4AB3E8' },
  clorinde: { dark: '#2D1B4E', light: '#7B4FBF' },
  skirk:    { light: '#E8E0F5', dark: '#3D1F6E', teal: '#4DD9D9', black: '#080810' },
  navia:    { dark: '#2E5478', light: '#7EB8D4' },
  jahoda:   { gold: '#C9A84C', purple: '#B07FEF', green: '#4CAF88' },
  accent:   '#EDD47A',
};

// ── Roles semánticos (mismo mapeo que :root en mochigo.css) ──
export const THEME = {
  gold      : MOCHIGO.accent,
  goldLight : MOCHIGO.furina.light,
  goldDim   : MOCHIGO.navia.dark,
  ashDeep   : MOCHIGO.furina.dark,
  ashMid    : '#142E4A',
  ash       : '#1E3A5C',
  smoke     : '#24405E',
  text      : '#D4C9A8',
  textDim   : '#6A7F94',
  ember     : '#8B2A0A',
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
    glow        : 'rgba(123,79,191,0.55)',
    hpGradient  : `linear-gradient(90deg,${MOCHIGO.skirk.dark},${MOCHIGO.clorinde.light})`,
  },
  mika: {
    inactive  : 'rgba(123,79,191,0.55)',
    hpGradient: 'linear-gradient(90deg,rgba(61,31,110,0.5),rgba(123,79,191,0.55))',
  },
};

export const HUD_BOSS_BAR = {
  name    : MOCHIGO.clorinde.light,
  border  : 'rgba(123,79,191,0.4)',
  fillHigh: `linear-gradient(90deg,${MOCHIGO.skirk.dark},${MOCHIGO.clorinde.light})`,
  fillMid : `linear-gradient(90deg,${MOCHIGO.clorinde.light},${MOCHIGO.jahoda.purple})`,
  fillLow : 'linear-gradient(90deg,#882200,#cc2200)',
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
  low : '#e74c3c',
};

export const HUD_MATERIALS = {
  madera : { color: '#8B6340', icon: '🪵', label: 'Madera' },
  piedra : { color: '#888078', icon: '🪨', label: 'Piedra' },
  hierro : { color: '#8090a0', icon: '⚙️', label: 'Hierro' },
  mineral: { color: '#b090ff', icon: '💎', label: 'Mineral' },
};

export const HUD_DANGER = {
  fillHigh: 'linear-gradient(90deg,#cc2222,#ff4444)',
  fillMid : 'linear-gradient(90deg,#cc6600,#ff9900)',
  fillLow : 'linear-gradient(90deg,#882200,#cc2200)',
};

// ══════════════════════════════════════════════════════════════════════════
// DIALOGUE (ui/dialogue.js) — 100% MochiGo
// ══════════════════════════════════════════════════════════════════════════

export const DIALOGUE_UI = {
  border       : 'rgba(201,168,76,0.35)',
  name         : MOCHIGO.jahoda.gold,
  text         : 'rgba(255,245,220,0.88)',
  shopBtnBg    : 'rgba(201,168,76,0.2)',
  shopBtnBorder: 'rgba(201,168,76,0.5)',
  nextBtnBg    : 'rgba(201,168,76,0.15)',
  nextBtnBorder: 'rgba(201,168,76,0.4)',
  talkBtnBg    : 'rgba(4,4,14,0.85)',
  talkBtnBorder: 'rgba(201,168,76,0.5)',
  glow         : 'rgba(201,168,76,0.2)',
};

// ══════════════════════════════════════════════════════════════════════════
// BESTIARY POPUP (ui/bestiaryPopup.js) — 100% MochiGo
// ══════════════════════════════════════════════════════════════════════════

export const BESTIARY_POPUP = {
  bg         : 'linear-gradient(135deg, rgba(10,8,20,0.97) 0%, rgba(20,14,35,0.97) 100%)',
  border     : 'rgba(201,168,76,0.35)',
  title      : 'rgba(201,168,76,0.55)',
  name       : '#E8C97A',
  zone       : 'rgba(201,168,76,0.45)',
  type       : 'rgba(160,130,200,0.7)',
  desc       : 'rgba(201,168,76,0.38)',
  barGradient: `linear-gradient(90deg, #7A6030, ${MOCHIGO.jahoda.gold})`,
};

// ══════════════════════════════════════════════════════════════════════════
// BESTIARY SCREEN (ui/bestiaryScreen.js) — fuera de MochiGo (8 zonas + 11 tipos)
// ══════════════════════════════════════════════════════════════════════════

export const BESTIARY_ZONES = {
  'Bosque'                : '#2d5a1b',
  'Bosque Profundo'       : '#1a4020',
  'Llanuras'               : '#5a4a1b',
  'Camino'                 : '#3a3020',
  'Territorio Yami'        : '#2a1040',
  'Mazmorras'               : '#1a1a2a',
  'Mazmorra — Jefe'        : '#3a0a0a',
  'Mazmorra — Jefe Final'  : '#4a0000',
};

export const BESTIARY_TYPES = {
  'Animal'     : '#4a7a30',
  'Criatura'   : '#306a40',
  'Elemental'  : '#304a7a',
  'Bestia'     : '#6a3020',
  'No-Muerto'  : '#504060',
  'Humano'     : '#504030',
  'Sombra'     : '#302040',
  'Yami'       : '#401040',
  'Constructo' : '#304050',
  'Jefe'       : '#6a1010',
  'Jefe Final' : '#8a0808',
};

// ══════════════════════════════════════════════════════════════════════════
// BUILD MENU (ui/buildMenu.js) — reutiliza HUD_MATERIALS + tiers propios
// ══════════════════════════════════════════════════════════════════════════

export const BUILD_TIERS = {
  madera : '#8B6340',
  piedra : '#888888',
  hierro : '#8090a0',
  mineral: '#b090ff',
};

// ══════════════════════════════════════════════════════════════════════════
// CHARACTER MENU (ui/characterMenu.js) — 100% MochiGo (dorado Jahoda)
// ══════════════════════════════════════════════════════════════════════════

export const CHARACTER_MENU = {
  gold      : MOCHIGO.jahoda.gold,
  goldDim   : 'rgba(201,168,76,0.6)',
  goldFaint : 'rgba(201,168,76,0.15)',
  border    : 'rgba(201,168,76,0.35)',
  danger    : '#ff6666',
  success   : '#44ff88',
  xpGradient: `linear-gradient(90deg,#7A6030,${MOCHIGO.jahoda.gold})`,
  xpMaxGrad : `linear-gradient(90deg,${MOCHIGO.jahoda.gold},#ffe8a0)`,
};

// ══════════════════════════════════════════════════════════════════════════
// FUSION MENU (ui/fusionMenu.js) — fuera de MochiGo (4 escuelas elementales)
// ══════════════════════════════════════════════════════════════════════════

export const FUSION_SCHOOLS = {
  fuego  : { emoji: '🔥', name: 'Fuego',   desc: 'QUEMADURA',  effect: 'Daño por segundo al atacar',  color: '#ff6633' },
  hielo  : { emoji: '❄️', name: 'Hielo',   desc: 'RALENTIZAR', effect: 'Reduce velocidad enemiga',    color: '#66ccff' },
  viento : { emoji: '💨', name: 'Viento',  desc: 'IMPULSO',    effect: 'Te lanza lejos al golpear',   color: '#aaeeff' },
  soporte: { emoji: '💚', name: 'Soporte', desc: 'VITALIDAD',  effect: 'Recuperas 5% del daño hecho', color: '#66ff88' },
};

// ══════════════════════════════════════════════════════════════════════════
// GACHA (ui/gachaMenu.js + ui/gachaBoardView.js) — fuera de MochiGo
// (3 rarezas + 5 tipos de casilla; sistema de código funcional propio)
// ══════════════════════════════════════════════════════════════════════════

export const GACHA_RARITY = {
  comun: '#B8AFD0',
  raro : '#9D7FE8',
  epico: '#E8C97A',
};

export const GACHA_TILES = {
  plain: '#6E6280',
  gems : '#7FC8E8',
  coin : '#E8B87F',
  echo : '#9D7FE8',
  veil : '#E8C97A',
};

// ══════════════════════════════════════════════════════════════════════════
// INVENTORY (ui/inventory.js) — reutiliza RARITY_COLOR global (arriba)
// ══════════════════════════════════════════════════════════════════════════

// ══════════════════════════════════════════════════════════════════════════
// MAP UI (ui/mapUI.js) — fuera de MochiGo (5 zonas geográficas + 8 tipos de pin)
// ══════════════════════════════════════════════════════════════════════════

export const MAP_ZONES = [
  { label: 'Greymantle',   color: '#1A3A10', minZ: -80, maxZ: -40 },
  { label: 'Bosque claro', color: '#2A5A1A', minZ: -40, maxZ: -10 },
  { label: 'Planicie',     color: '#3A7A28', minZ: -10, maxZ:  30 },
  { label: 'Camino',       color: '#4A8A38', minZ:  30, maxZ:  60 },
  { label: 'Ironfell',     color: '#5A6A4A', minZ:  60, maxZ: 100 },
];

export const MAP_DUNGEONS = {
  1: { color: MOCHIGO.jahoda.gold, label: 'Mazmorra I'   },
  2: { color: '#44aaff',           label: 'Mazmorra II'  },
  3: { color: '#9933ff',           label: 'Mazmorra III' },
};

export const MAP_PINS = [
  { icon: '🏠', label: 'Refugio',      color: '#44aa88' },
  { icon: '⚔️', label: 'Combate',      color: '#ff4444' },
  { icon: '🏪', label: 'Comercio',     color: '#ffaa44' },
  { icon: '⛏️', label: 'Recursos',     color: '#aaaaff' },
  { icon: '🏛️', label: 'Monumento',    color: '#ffcc44' },
  { icon: '🚩', label: 'Base',         color: MOCHIGO.jahoda.gold },
  { icon: '⚠️', label: 'Peligro',      color: '#ff6622' },
  { icon: '🔮', label: 'Lugar mágico', color: '#cc44ff' },
];

// ══════════════════════════════════════════════════════════════════════════
// PARTY MENU (ui/partyMenu.js) — fuera de MochiGo (6 elementos + reacciones + 8 personajes)
// ══════════════════════════════════════════════════════════════════════════

export const PARTY_ELEMENTS = [
  { id: 'umbral',    label: 'Umbral',     icon: '🌑', color: '#8855ff' },
  { id: 'astral',    label: 'Astral',     icon: '✨', color: '#44aaff' },
  { id: 'elemental', label: 'Elemental',  icon: '🔥', color: '#ff6622' },
  { id: 'arcanum',   label: 'Arcanum',    icon: '💠', color: '#4488ff' },
  { id: 'vital',     label: 'Vital',      icon: '❤️', color: '#44ff88' },
  { id: 'spiritual', label: 'Espiritual', icon: '👁️', color: '#ffcc44' },
];

export const PARTY_REACTIONS = {
  'umbral+astral'    : { name: 'Eclipse',        icon: '⭐', color: '#ffeebb', desc: 'Daño masivo + ceguera 3s.' },
  'umbral+elemental' : { name: 'Condena Oscura', icon: '🔥', color: '#ff6622', desc: 'Quema continua + reducción DEF.' },
  'umbral+arcanum'   : { name: 'Fractura',       icon: '💠', color: '#88aaff', desc: 'Rompe defensa permanentemente.' },
  'astral+elemental' : { name: 'Nova Solar',     icon: '⚡', color: '#ffee44', desc: 'Explosión en área masiva.' },
  'astral+vital'     : { name: 'Resurgir',       icon: '💚', color: '#44ff88', desc: 'Cura masiva al personaje activo.' },
  'elemental+arcanum': { name: 'Sobrecarga',     icon: '💥', color: '#ff88ff', desc: 'Explosión mágica + stun.' },
};

export const PARTY_CHARACTERS = [
  { id:'kael', name:'Kael', element:'umbral',    icon:'🗡️', color:'#8855ff', unlocked:true,  avatar:'K' },
  { id:'mika', name:'Mika', element:'astral',    icon:'🏹', color:'#44aaff', unlocked:true,  avatar:'M' },
  { id:'zara', name:'Zara', element:'elemental', icon:'🔮', color:'#ff6622', unlocked:false, avatar:'Z' },
  { id:'rhen', name:'Rhen', element:'arcanum',   icon:'⚔️', color:'#4488ff', unlocked:false, avatar:'R' },
  { id:'lyra', name:'Lyra', element:'vital',     icon:'🌿', color:'#44ff88', unlocked:false, avatar:'L' },
  { id:'oryn', name:'Oryn', element:'spiritual', icon:'🌀', color:'#ffcc44', unlocked:false, avatar:'O' },
  { id:'dusk', name:'Dusk', element:'umbral',    icon:'🌙', color:'#553388', unlocked:false, avatar:'D' },
  { id:'vael', name:'Vael', element:'astral',    icon:'🌟', color:'#88ddff', unlocked:false, avatar:'V' },
];

// ══════════════════════════════════════════════════════════════════════════
// SKILL BAR (ui/skillBar.js) — capas de habilidad, fuera de MochiGo
// ══════════════════════════════════════════════════════════════════════════

export const SKILL_LAYERS = {
  basico: 'rgba(200,200,200,0.6)',
  medio : 'rgba(100,180,255,0.8)',
  arcano: 'rgba(180,80,255,0.9)',
};

// ══════════════════════════════════════════════════════════════════════════
// SKILL TREE (ui/skillTree.js) — fuera de MochiGo (6 rarezas + 5 categorías)
// ══════════════════════════════════════════════════════════════════════════

export const SKILLTREE_RARITY = {
  comun:      { label: 'Común',      color: '#aaaaaa', glow: '#888888', size: 24, cost: 1 },
  rara:       { label: 'Rara',       color: '#4488ff', glow: '#2266dd', size: 28, cost: 2 },
  epica:      { label: 'Épica',      color: '#aa44ff', glow: '#8822dd', size: 32, cost: 3 },
  legendaria: { label: 'Legendaria', color: '#ffaa00', glow: '#cc7700', size: 36, cost: 4 },
  mitica:     { label: 'Mítica',     color: '#ff4444', glow: '#cc1111', size: 40, cost: 5 },
  divina:     { label: 'Divina',     color: '#ffffff', glow: '#aaddff', size: 46, cost: 8 },
};

export const SKILLTREE_CATEGORIES = {
  ofensiva:    { label: 'Ofensiva',    icon: '⚔️', color: '#ff4400' },
  defensiva:   { label: 'Defensiva',   icon: '🛡️', color: '#4488ff' },
  movilidad:   { label: 'Movilidad',   icon: '💨', color: '#44cc44' },
  soporte:     { label: 'Soporte',     icon: '💚', color: '#ffaa00' },
  estrategica: { label: 'Estratégica', icon: '⭐', color: '#aa44ff' },
};

// ══════════════════════════════════════════════════════════════════════════
// WEAPON SELECT (ui/weaponSelect.js) — fuera de MochiGo (4 acentos de arma)
// ══════════════════════════════════════════════════════════════════════════

export const WEAPON_ACCENTS = {
  katana: { accent: '#e8c9a0', glow: 'rgba(232,201,160,0.35)' },
  sword : { accent: '#a8c8ff', glow: 'rgba(168,200,255,0.3)'  },
  magic : { accent: '#c47aff', glow: 'rgba(196,122,255,0.35)' },
  bow   : { accent: '#6dcc8a', glow: 'rgba(109,204,138,0.3)'  },
};
