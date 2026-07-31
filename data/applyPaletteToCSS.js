// data/applyPaletteToCSS.js — Ashes of the Reborn | Valiant Gaming
//
// Sincroniza mochigo.css con palette.js en tiempo de carga.
// palette.js pasa a ser la ÚNICA fuente de verdad: este módulo lee
// MOCHIGO/THEME/RARITY_COLOR y escribe las mismas variables CSS que
// ya declara :root en mochigo.css, sobreescribiéndolas en runtime.
//
// mochigo.css NO se borra ni se toca — sigue funcionando igual si este
// script no corriera (queda como fallback con sus valores actuales).
// Simplemente, si este script corre, sus valores ganan.
//
// USO — una sola línea, junto al import de palette.js en index.html/game.html:
//   import { applyPaletteToCSS } from './data/applyPaletteToCSS.js';
//   applyPaletteToCSS();

import { MOCHIGO, THEME, RARITY_COLOR } from './palette.js';

export function applyPaletteToCSS() {
  const root = document.documentElement.style;

  // ── Personajes ──
  root.setProperty('--furina-dark',    MOCHIGO.furina.dark);
  root.setProperty('--furina-light',   MOCHIGO.furina.light);
  root.setProperty('--clorinde-dark',  MOCHIGO.clorinde.dark);
  root.setProperty('--clorinde-light', MOCHIGO.clorinde.light);
  root.setProperty('--skirk-light',    MOCHIGO.skirk.light);
  root.setProperty('--skirk-dark',     MOCHIGO.skirk.dark);
  root.setProperty('--skirk-teal',     MOCHIGO.skirk.teal);
  root.setProperty('--skirk-black',    MOCHIGO.skirk.black);
  root.setProperty('--navia-dark',     MOCHIGO.navia.dark);
  root.setProperty('--navia-light',    MOCHIGO.navia.light);
  root.setProperty('--jahoda-gold',    MOCHIGO.jahoda.gold);
  root.setProperty('--jahoda-purple',  MOCHIGO.jahoda.purple);
  root.setProperty('--jahoda-green',   MOCHIGO.jahoda.green);
  root.setProperty('--accent',         MOCHIGO.accent);

  // ── Roles semánticos ──
  root.setProperty('--gold',       THEME.gold);
  root.setProperty('--gold-light', THEME.goldLight);
  root.setProperty('--gold-dim',   THEME.goldDim);
  root.setProperty('--ash-deep',   THEME.ashDeep);
  root.setProperty('--ash-mid',    THEME.ashMid);
  root.setProperty('--ash',        THEME.ash);
  root.setProperty('--smoke',      THEME.smoke);
  root.setProperty('--text',       THEME.text);
  root.setProperty('--text-dim',   THEME.textDim);
  root.setProperty('--ember',      THEME.ember);

  // ── Rareza ──
  root.setProperty('--rarity-comun',      RARITY_COLOR.comun);
  root.setProperty('--rarity-raro',       RARITY_COLOR.raro);
  root.setProperty('--rarity-epico',      RARITY_COLOR.epico);
  root.setProperty('--rarity-legendario', RARITY_COLOR.legendario);

  console.log('[Palette] Variables CSS sincronizadas con palette.js');
}
