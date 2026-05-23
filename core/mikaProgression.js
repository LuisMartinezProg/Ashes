// core/mikaProgression.js — Progresión de Mika | Ashes of the Reborn
import { Progression } from './progression.js';

export function createMikaProgression() {
  const prog = new Progression();

  prog._activeSubtype.bow = 'precision';
  prog._xp.bow = 700;

  [
    'piercing_shot', 'snipe', 'bullseye', 'divine_arrow',
    'rain_of_arrows', 'storm_volley', 'arrow_storm', 'sky_collapse',
    'poison_arrow', 'plague_shot', 'toxic_cloud', 'death_plague',
    'back_step', 'roll_shot', 'phantom_step', 'void_dance',
  ].forEach(id => prog.passTrialForSkill(id));

  return prog;
}
