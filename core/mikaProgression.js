// core/mikaProgression.js — Ashes of the Reborn | Valiant Gaming

import { ProgressionMika } from './progression.js';

export function createMikaProgression() {
  const prog = new ProgressionMika();

  // XP inicial de arco para Mika
  prog._weaponXP.bow = 700;

  // Habilidades de arco desbloqueadas (para compatibilidad con sistema existente)
  [
    'piercing_shot', 'snipe',        'bullseye',     'divine_arrow',
    'rain_of_arrows','storm_volley', 'arrow_storm',  'sky_collapse',
    'poison_arrow',  'plague_shot',  'toxic_cloud',  'death_plague',
    'back_step',     'roll_shot',    'phantom_step', 'void_dance',
  ].forEach(id => prog.passTrialForSkill(id));

  return prog;
}

// ── Loadout fijo de Mika — 3 habilidades únicas siempre activas ────────────
export const MIKA_SKILLS = [
  {
    id         : 'astral_arrow',
    name       : 'Flecha Astral',
    icon       : '✨',
    layer      : 'basico',
    desc       : 'Flecha de luz que aplica aura Astral al enemigo.',
    rarity     : 'unico',
    element    : 'astral',
  },
  {
    id         : 'astral_rain',
    name       : 'Lluvia Astral',
    icon       : '🌟',
    layer      : 'medio',
    desc       : 'Lluvia de flechas astrales en área.',
    rarity     : 'unico',
    element    : 'astral',
  },
  {
    id         : 'stellar_collapse',
    name       : 'Colapso Estelar',
    icon       : '💫',
    layer      : 'arcano',
    desc       : 'Explosión astral masiva en área.',
    rarity     : 'unico',
    element    : 'astral',
  },
];
window._MIKA_SKILLS = MIKA_SKILLS;
