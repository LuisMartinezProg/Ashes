// data/palette.js — Ashes of the Reborn | Valiant Gaming
// Paleta MochiGo — fuente única de verdad para módulos JS de UI.
// Mismo contenido que css/mochigo.css, en formato importable.
// Cambiar la paleta completa = editar solo este archivo.

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

// Personajes activos del HUD principal — editable sin tocar hud.js.
// Hoy ambos apuntan a Clorinde; para reasignar (ej. Mika = Furina) solo
// cambiar los valores acá.
export const HUD_CHARACTERS = {
  kael: {
    active        : MOCHIGO.clorinde.light,
    borderActive  : `${MOCHIGO.clorinde.light}88`,
    glow          : 'rgba(123,79,191,0.55)',
    hpGradient    : `linear-gradient(90deg,${MOCHIGO.skirk.dark},${MOCHIGO.clorinde.light})`,
  },
  mika: {
    inactive      : 'rgba(123,79,191,0.55)',
    hpGradient    : `linear-gradient(90deg,rgba(61,31,110,0.5),rgba(123,79,191,0.55))`,
  },
};

export const HUD_BOSS_BAR = {
  name       : MOCHIGO.clorinde.light,
  border     : 'rgba(123,79,191,0.4)',
  fillHigh   : `linear-gradient(90deg,${MOCHIGO.skirk.dark},${MOCHIGO.clorinde.light})`,   // >50%
  fillMid    : `linear-gradient(90deg,${MOCHIGO.clorinde.light},${MOCHIGO.jahoda.purple})`, // >25%
  fillLow    : 'linear-gradient(90deg,#882200,#cc2200)',                                    // crítico (HUD_DANGER)
};

export const HUD_REACTIONS = {
  vapor         : { text: '💨 VAPOR',           color: MOCHIGO.clorinde.light },
  discharge     : { text: '⚡ DESCARGA',         color: MOCHIGO.accent },
  blizzard      : { text: '❄️ VENTISCA',         color: MOCHIGO.clorinde.light },
  cyclone       : { text: '🌪️ CICLÓN',           color: MOCHIGO.clorinde.light },
  dark_sentence : { text: '☠️ SENTENCIA OSCURA', color: MOCHIGO.skirk.dark },
};

export const HUD_STAMINA = {
  high     : MOCHIGO.accent,       // >50%
  mid      : MOCHIGO.jahoda.gold,  // >25%
  low      : '#e74c3c',            // crítico (HUD_DANGER)
};

// Materiales recolectables — estructura abierta para agregar tipos de
// árbol/mineral nuevos sin tocar hud.js, solo este bloque.
export const HUD_MATERIALS = {
  madera : { color: '#8B6340', icon: '🪵', label: 'Madera' },
  piedra : { color: '#888078', icon: '🪨', label: 'Piedra' },
  hierro : { color: '#8090a0', icon: '⚙️', label: 'Hierro' },
  mineral: { color: '#b090ff', icon: '💎', label: 'Mineral' },
};

// Rojos funcionales de peligro/vida enemiga — fuera de MochiGo a propósito,
// código de información (no decoración de personaje).
export const HUD_DANGER = {
  fillHigh : 'linear-gradient(90deg,#cc2222,#ff4444)', // >50% vida enemiga
  fillMid  : 'linear-gradient(90deg,#cc6600,#ff9900)', // >25%
  fillLow  : 'linear-gradient(90deg,#882200,#cc2200)', // crítico
};

// ══════════════════════════════════════════════════════════════════════════
// DIALOGUE (ui/dialogue.js) — 100% MochiGo (dorado Jahoda)
// ══════════════════════════════════════════════════════════════════════════

export const DIALOGUE_UI = {
  border       : `1px solid rgba(201,168,76,0.35)`,
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
// BESTIARY POPUP (ui/bestiaryPopup.js) — 100% MochiGo (dorado Jahoda)
// ══════════════════════════════════════════════════════════════════════════

export const BESTIARY_POPUP = {
  bg          : 'linear-gradient(135deg, rgba(10,8,20,0.97) 0%, rgba(20,14,35,0.97) 100%)',
  border      : 'rgba(201,168,76,0.35)',
  title       : 'rgba(201,168,76,0.55)',
  name        : '#E8C97A',
  zone        : 'rgba(201,168,76,0.45)',
  type        : 'rgba(160,130,200,0.7)',
  desc        : 'rgba(201,168,76,0.38)',
  barGradient : `linear-gradient(90deg, #7A6030, ${MOCHIGO.jahoda.gold})`,
};
