// core/mikaProgression.js — Ashes of the Reborn | Valiant Gaming

import { ProgressionMika } from './progression.js';

export function createMikaProgression() {
  const prog = new ProgressionMika();

  // XP inicial de arco para Mika
  prog._weaponXP.bow = 700;

  // Habilidades desbloqueadas desde el inicio
  [
    'piercing_shot', 'snipe',        'bullseye',     'divine_arrow',
    'rain_of_arrows','storm_volley', 'arrow_storm',  'sky_collapse',
    'poison_arrow',  'plague_shot',  'toxic_cloud',  'death_plague',
    'back_step',     'roll_shot',    'phantom_step', 'void_dance',
  ].forEach(id => prog.passTrialForSkill(id));

  return prog;
}
