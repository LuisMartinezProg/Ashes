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
