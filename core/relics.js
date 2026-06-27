// core/relics.js — Ashes of the Reborn | Valiant Gaming

export function getEquippedBy(relicId) {
  const kael = window._prog?.getEquippedRelic?.();
  if (kael?.id === relicId) return 'kael';

  const mika = window._mikaProgression?.getEquippedRelic?.();
  if (mika?.id === relicId) return 'mika';

  return null;
}

export function computeEffectiveStats(baseStats, relic) {
  const result = { ...baseStats };
  if (!relic) return result;

  if (relic.stats) {
    for (const [key, value] of Object.entries(relic.stats)) {
      result[key] = (result[key] ?? 0) + value;
    }
  }

  // Efectos pasivos (effectId) se aplican en combat.js
  // una vez exista el catálogo de 18 efectos.

  return result;
}

export function refreshEffectiveStats(charId) {
  if (charId === 'mika') {
    const prog = window._mikaProgression;
    if (!prog) return;
    window._effectiveStatsMika = computeEffectiveStats(prog.getStats(), prog.getEquippedRelic());
  } else {
    const prog = window._prog;
    if (!prog) return;
    window._effectiveStats = computeEffectiveStats(prog.getStats(), prog.getEquippedRelic());
  }
}

export function refreshAllEffectiveStats() {
  refreshEffectiveStats('kael');
  refreshEffectiveStats('mika');
}
