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
  furina:   { dark: '#172B4D', light: '#75C7E8' },
  clorinde: { dark: '#33294F', light: '#8A7DDB' },
  skirk:    { light: '#D7E9FF', dark: '#141828', teal: '#57C6D9', black: '#080B14' },
  navia:    { dark: '#285943', light: '#A8D98A' },
  jahoda:   { gold: '#D7B35A', purple: '#8A7DDB', green: '#5FA86E' },
  accent:   '#F3D98B',
};

// ── Roles semánticos (mismo mapeo que :root en mochigo.css) ──
export const THEME = {
  gold      : '#F3D98B',
  goldLight : '#75C7E8',
  goldDim   : '#285943',
  ashDeep   : '#172B4D',
  ashMid    : '#203957',
  ash       : '#263F5E',
  smoke     : '#40566E',
  text      : '#F8F5ED',
  textDim   : '#A8B6C8',
  ember     : '#C84B4B',
};

// ── Rareza (usado en inventario, gacha, equipo) ──
export const RARITY_COLOR = {
  comun      : '#9AA7B8',
  raro       : '#5FA86E',
  epico      : '#8A7DDB',
  legendario : '#D7B35A',
};

// ══════════════════════════════════════════════════════════════════════════
// HUD (ui/hud.js)
// ══════════════════════════════════════════════════════════════════════════

export const HUD_CHARACTERS = {
  kael: {
    active      : '#8A7DDB',
    borderActive: '#8A7DDB88',
    glow        : 'rgba(138,125,219,0.55)',
    hpGradient  : `linear-gradient(90deg,${MOCHIGO.skirk.dark},${MOCHIGO.clorinde.light})`,
  },
  mika: {
    inactive  : 'rgba(87,198,217,0.55)',
    hpGradient: 'linear-gradient(90deg,rgba(20,24,40,0.5),rgba(87,198,217,0.55))',
  },
};

export const HUD_BOSS_BAR = {
  name    : '#8A7DDB',
  border  : 'rgba(138,125,219,0.4)',
  fillHigh: `linear-gradient(90deg,${MOCHIGO.skirk.dark},${MOCHIGO.clorinde.light})`,
  fillMid : `linear-gradient(90deg,#8A7DDB,#D7B35A)`,
  fillLow : 'linear-gradient(90deg,#8A3028,#C84B4B)',
};

export const HUD_REACTIONS = {
  vapor        : { text: '💨 VAPOR',           color: '#8A7DDB' },
  discharge    : { text: '⚡ DESCARGA',         color: '#F3D98B' },
  blizzard     : { text: '❄️ VENTISCA',         color: '#75C7E8' },
  cyclone      : { text: '🌪️ CICLÓN',           color: '#A8D98A' },
  dark_sentence: { text: '☠️ SENTENCIA OSCURA', color: '#141828' },
};

export const HUD_STAMINA = {
  high: '#F3D98B',
  mid : '#D7B35A',
  low : '#C84B4B',
};

export const HUD_MATERIALS = {
  madera : { color: '#9A6A42', icon: '🪵', label: 'Madera' },
  piedra : { color: '#6B6F73', icon: '🪨', label: 'Piedra' },
  hierro : { color: '#8090A0', icon: '⚙️', label: 'Hierro' },
  mineral: { color: '#57C6D9', icon: '💎', label: 'Mineral' },
};

export const HUD_DANGER = {
  fillHigh: 'linear-gradient(90deg,#8A3028,#C84B4B)',
  fillMid : 'linear-gradient(90deg,#8A3028,#E07A3F)',
  fillLow : 'linear-gradient(90deg,#8A3028,#C84B4B)',
};

// ══════════════════════════════════════════════════════════════════════════
// DIALOGUE (ui/dialogue.js) — 100% MochiGo
// ══════════════════════════════════════════════════════════════════════════

export const DIALOGUE_UI = {
  border       : 'rgba(215,179,90,0.35)',
  name         : '#D7B35A',
  text         : '#FFF5DC',
  shopBtnBg    : 'rgba(215,179,90,0.2)',
  shopBtnBorder: 'rgba(215,179,90,0.5)',
  nextBtnBg    : 'rgba(215,179,90,0.15)',
  nextBtnBorder: 'rgba(215,179,90,0.4)',
  talkBtnBg    : 'rgba(20,24,40,0.85)',
  talkBtnBorder: 'rgba(215,179,90,0.5)',
  glow         : 'rgba(215,179,90,0.2)',
};

// ══════════════════════════════════════════════════════════════════════════
// BESTIARY POPUP (ui/bestiaryPopup.js) — 100% MochiGo
// ══════════════════════════════════════════════════════════════════════════

export const BESTIARY_POPUP = {
  bg         : 'linear-gradient(135deg, rgba(23,43,77,0.97) 0%, rgba(51,41,79,0.97) 100%)',
  border     : 'rgba(215,179,90,0.35)',
  title      : 'rgba(215,179,90,0.55)',
  name       : '#D7B35A',
  zone       : 'rgba(215,179,90,0.45)',
  type       : 'rgba(138,125,219,0.7)',
  desc       : 'rgba(215,179,90,0.38)',
  barGradient: `linear-gradient(90deg, #8D7655, #D7B35A)`,
};

// ══════════════════════════════════════════════════════════════════════════
// BESTIARY SCREEN (ui/bestiaryScreen.js) — fuera de MochiGo (8 zonas + 11 tipos)
// ══════════════════════════════════════════════════════════════════════════

export const BESTIARY_ZONES = {
  'Bosque'                : '#285943',
  'Bosque Profundo'       : '#173D2B',
  'Llanuras'               : '#7F8F4A',
  'Camino'                 : '#8D7655',
  'Territorio Yami'        : '#33294F',
  'Mazmorras'               : '#141828',
  'Mazmorra — Jefe'        : '#6B3030',
  'Mazmorra — Jefe Final'  : '#8A2020',
};

export const BESTIARY_TYPES = {
  'Animal'     : '#5FA86E',
  'Criatura'   : '#3F8055',
  'Elemental'  : '#57C6D9',
  'Bestia'     : '#A45F45',
  'No-Muerto'  : '#665B80',
  'Humano'     : '#8D7655',
  'Sombra'     : '#33294F',
  'Yami'       : '#5E4BA8',
  'Constructo' : '#607080',
  'Jefe'       : '#C84B4B',
  'Jefe Final' : '#8A2020',
};

// ══════════════════════════════════════════════════════════════════════════
// BUILD MENU (ui/buildMenu.js) — reutiliza HUD_MATERIALS + tiers propios
// ══════════════════════════════════════════════════════════════════════════

export const BUILD_TIERS = {
  madera : '#9A6A42',
  piedra : '#888888',
  hierro : '#8090A0',
  mineral: '#8A7DDB',
};

// ══════════════════════════════════════════════════════════════════════════
// CHARACTER MENU (ui/characterMenu.js) — 100% MochiGo (dorado Jahoda)
// ══════════════════════════════════════════════════════════════════════════

export const CHARACTER_MENU = {
  gold      : '#D7B35A',
  goldDim   : 'rgba(215,179,90,0.6)',
  goldFaint : 'rgba(215,179,90,0.15)',
  border    : 'rgba(215,179,90,0.35)',
  danger    : '#C84B4B',
  success   : '#5FA86E',
  xpGradient: `linear-gradient(90deg,#8D7655,#D7B35A)`,
  xpMaxGrad : `linear-gradient(90deg,#D7B35A,#F3D98B)`,
};

// ══════════════════════════════════════════════════════════════════════════
// FUSION MENU (ui/fusionMenu.js) — fuera de MochiGo (4 escuelas elementales)
// ══════════════════════════════════════════════════════════════════════════

export const FUSION_SCHOOLS = {
  fuego  : { emoji: '🔥', name: 'Fuego',   desc: 'QUEMADURA',  effect: 'Daño por segundo al atacar',  color: '#E76F51' },
  hielo  : { emoji: '❄️', name: 'Hielo',   desc: 'RALENTIZAR', effect: 'Reduce velocidad enemiga',    color: '#75C7E8' },
  viento : { emoji: '💨', name: 'Viento',  desc: 'IMPULSO',    effect: 'Te lanza lejos al golpear',   color: '#A8D8C0' },
  soporte: { emoji: '💚', name: 'Soporte', desc: 'VITALIDAD',  effect: 'Recuperas 5% del daño hecho', color: '#5FA86E' },
};

// ══════════════════════════════════════════════════════════════════════════
// GACHA (ui/gachaMenu.js + ui/gachaBoardView.js) — fuera de MochiGo
// (3 rarezas + 5 tipos de casilla; sistema de código funcional propio)
// ══════════════════════════════════════════════════════════════════════════

export const GACHA_RARITY = {
  comun: '#B8C1D1',
  raro : '#8A7DDB',
  epico: '#D7B35A',
};

export const GACHA_TILES = {
  plain: '#6B6F73',
  gems : '#57C6D9',
  coin : '#D7B35A',
  echo : '#8A7DDB',
  veil : '#F3D98B',
};

// ══════════════════════════════════════════════════════════════════════════
// INVENTORY (ui/inventory.js) — reutiliza RARITY_COLOR global (arriba)
// ══════════════════════════════════════════════════════════════════════════

// ══════════════════════════════════════════════════════════════════════════
// MAP UI (ui/mapUI.js) — fuera de MochiGo (5 zonas geográficas + 8 tipos de pin)
// ══════════════════════════════════════════════════════════════════════════

export const MAP_ZONES = [
  { label: 'Greymantle',   color: '#173D2B', minZ: -80, maxZ: -40 },
  { label: 'Bosque claro', color: '#285943', minZ: -40, maxZ: -10 },
  { label: 'Planicie',     color: '#5F8F45', minZ: -10, maxZ:  30 },
  { label: 'Camino',       color: '#8D7655', minZ:  30, maxZ:  60 },
  { label: 'Ironfell',     color: '#59635C', minZ:  60, maxZ: 100 },
];

export const MAP_DUNGEONS = {
  1: { color: '#D7B35A', label: 'Mazmorra I'   },
  2: { color: '#57C6D9', label: 'Mazmorra II'  },
  3: { color: '#8A7DDB', label: 'Mazmorra III' },
};

export const MAP_PINS = [
  { icon: '🏠', label: 'Refugio',      color: '#5FA86E' },
  { icon: '⚔️', label: 'Combate',      color: '#C84B4B' },
  { icon: '🏪', label: 'Comercio',     color: '#D7B35A' },
  { icon: '⛏️', label: 'Recursos',     color: '#75C7E8' },
  { icon: '🏛️', label: 'Monumento',    color: '#F3D98B' },
  { icon: '🚩', label: 'Base',         color: '#D7B35A' },
  { icon: '⚠️', label: 'Peligro',      color: '#E76F51' },
  { icon: '🔮', label: 'Lugar mágico', color: '#8A7DDB' },
];

// ══════════════════════════════════════════════════════════════════════════
// PARTY MENU (ui/partyMenu.js) — fuera de MochiGo (6 elementos + reacciones + 8 personajes)
// ══════════════════════════════════════════════════════════════════════════

export const PARTY_ELEMENTS = [
  { id: 'umbral',    label: 'Umbral',     icon: '🌑', color: '#5E4BA8' },
  { id: 'astral',    label: 'Astral',     icon: '✨', color: '#57C6D9' },
  { id: 'elemental', label: 'Elemental',  icon: '🔥', color: '#E76F51' },
  { id: 'arcanum',   label: 'Arcanum',    icon: '💠', color: '#3A6EA5' },
  { id: 'vital',     label: 'Vital',      icon: '❤️', color: '#5FA86E' },
  { id: 'spiritual', label: 'Espiritual', icon: '👁️', color: '#F3D98B' },
];

export const PARTY_REACTIONS = {
  'umbral+astral'    : { name: 'Eclipse',        icon: '⭐', color: '#F8F5ED', desc: 'Daño masivo + ceguera 3s.' },
  'umbral+elemental' : { name: 'Condena Oscura', icon: '🔥', color: '#E76F51', desc: 'Quema continua + reducción DEF.' },
  'umbral+arcanum'   : { name: 'Fractura',       icon: '💠', color: '#3A6EA5', desc: 'Rompe defensa permanentemente.' },
  'astral+elemental' : { name: 'Nova Solar',     icon: '⚡', color: '#F3D98B', desc: 'Explosión en área masiva.' },
  'astral+vital'     : { name: 'Resurgir',       icon: '💚', color: '#5FA86E', desc: 'Cura masiva al personaje activo.' },
  'elemental+arcanum': { name: 'Sobrecarga',     icon: '💥', color: '#8A7DDB', desc: 'Explosión mágica + stun.' },
};

export const PARTY_CHARACTERS = [
  { id:'kael', name:'Kael', element:'umbral',    icon:'🗡️', color:'#5E4BA8', unlocked:true,  avatar:'K' },
  { id:'mika', name:'Mika', element:'astral',    icon:'🏹', color:'#57C6D9', unlocked:true,  avatar:'M' },
  { id:'zara', name:'Zara', element:'elemental', icon:'🔮', color:'#E76F51', unlocked:false, avatar:'Z' },
  { id:'rhen', name:'Rhen', element:'arcanum',   icon:'⚔️', color:'#3A6EA5', unlocked:false, avatar:'R' },
  { id:'lyra', name:'Lyra', element:'vital',     icon:'🌿', color:'#5FA86E', unlocked:false, avatar:'L' },
  { id:'oryn', name:'Oryn', element:'spiritual', icon:'🌀', color:'#F3D98B', unlocked:false, avatar:'O' },
  { id:'dusk', name:'Dusk', element:'umbral',    icon:'🌙', color:'#33294F', unlocked:false, avatar:'D' },
  { id:'vael', name:'Vael', element:'astral',    icon:'🌟', color:'#75C7E8', unlocked:false, avatar:'V' },
];

// ══════════════════════════════════════════════════════════════════════════
// SKILL BAR (ui/skillBar.js) — capas de habilidad, fuera de MochiGo
// ══════════════════════════════════════════════════════════════════════════

export const SKILL_LAYERS = {
  basico: 'rgba(176,184,192,0.6)',
  medio : 'rgba(117,199,232,0.8)',
  arcano: 'rgba(138,125,219,0.9)',
};

// ══════════════════════════════════════════════════════════════════════════
// SKILL TREE (ui/skillTree.js) — fuera de MochiGo (6 rarezas + 5 categorías)
// ══════════════════════════════════════════════════════════════════════════

export const SKILLTREE_RARITY = {
  comun:      { label: 'Común',      color: '#AAAAAA', glow: '#888888', size: 24, cost: 1 },
  rara:       { label: 'Rara',       color: '#3A6EA5', glow: '#2A5480', size: 28, cost: 2 },
  epica:      { label: 'Épica',      color: '#8A7DDB', glow: '#6E5FC0', size: 32, cost: 3 },
  legendaria: { label: 'Legendaria', color: '#D7B35A', glow: '#B08D3A', size: 36, cost: 4 },
  mitica:     { label: 'Mítica',     color: '#C84B4B', glow: '#A02F2F', size: 40, cost: 5 },
  divina:     { label: 'Divina',     color: '#F8F5ED', glow: '#D7E9FF', size: 46, cost: 8 },
};

export const SKILLTREE_CATEGORIES = {
  ofensiva:    { label: 'Ofensiva',    icon: '⚔️', color: '#E76F51' },
  defensiva:   { label: 'Defensiva',   icon: '🛡️', color: '#3A6EA5' },
  movilidad:   { label: 'Movilidad',   icon: '💨', color: '#5FA86E' },
  soporte:     { label: 'Soporte',     icon: '💚', color: '#D7B35A' },
  estrategica: { label: 'Estratégica', icon: '⭐', color: '#8A7DDB' },
};

// ══════════════════════════════════════════════════════════════════════════
// WEAPON SELECT (ui/weaponSelect.js) — fuera de MochiGo (4 acentos de arma)
// ══════════════════════════════════════════════════════════════════════════

export const WEAPON_ACCENTS = {
  katana: { accent: '#E8C9A0', glow: 'rgba(232,201,160,0.35)' },
  sword : { accent: '#A8D8FF', glow: 'rgba(168,216,255,0.3)'  },
  magic : { accent: '#C47AFF', glow: 'rgba(196,122,255,0.35)' },
  bow   : { accent: '#6DCC8A', glow: 'rgba(109,204,138,0.3)'  },
};
