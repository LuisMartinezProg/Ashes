// core/relics.js — Ashes of the Reborn | Valiant Gaming
//
// Sistema de activación de reliquias (reemplaza el modelo viejo de stats pasivos).
// Las reliquias NO suman stats. Cada reliquia tiene UN efecto activo único,
// atado al par (arma, elemento), con duración y cooldown de 7s cada uno.
//
// El efecto concreto de cada una de las 18 combinaciones (daño, curación, etc.)
// se registra aparte mediante registerRelicEffect() — este archivo solo maneja
// la mecánica de activación (estado, tiempos, slot por personaje).
// Mientras no exista el efecto de una reliquia, activarla no hace nada visible
// todavía, pero el sistema de duración/cooldown funciona igual.

const EFFECT_DURATION = 7; // segundos
const EFFECT_COOLDOWN = 7; // segundos

// ── Estado de activación por personaje ─────────────────────────────────────
function _makeState() {
  return {
    active            : false,
    timeRemaining     : 0,   // segundos restantes de efecto activo
    cooldownRemaining : 0,   // segundos restantes de cooldown
  };
}

const _state = {
  kael: _makeState(),
  mika: _makeState(),
};

// ── Registro de efectos por combinación (arma, elemento) ───────────────────
// Se llena desde afuera (un archivo aparte) cuando el balance esté listo.
// Firma esperada: (charId) => void
const _effects = {}; // key: `${weapon}_${element}` → función de efecto

export function registerRelicEffect(weapon, element, effectFn) {
  _effects[`${weapon}_${element}`] = effectFn;
}

function _getEffectFn(weapon, element) {
  return _effects[`${weapon}_${element}`] ?? null;
}

// ── Reliquia equipada por personaje ─────────────────────────────────────────
function _getProgression(charId) {
  return charId === 'mika' ? window._mikaProgression : window._prog;
}

export function getEquippedRelic(charId) {
  const prog = _getProgression(charId);
  return prog?.getEquippedRelic?.() ?? null;
}

export function getEquippedBy(relicId) {
  const kael = window._prog?.getEquippedRelic?.();
  if (kael?.id === relicId) return 'kael';

  const mika = window._mikaProgression?.getEquippedRelic?.();
  if (mika?.id === relicId) return 'mika';

  return null;
}

// ── Activación ───────────────────────────────────────────────────────────────

export function canActivateRelic(charId) {
  const state = _state[charId];
  if (!state) return false;
  if (state.active) return false;
  if (state.cooldownRemaining > 0) return false;
  return !!getEquippedRelic(charId);
}

export function activateRelic(charId) {
  if (!canActivateRelic(charId)) return false;

  const relic = getEquippedRelic(charId);
  if (!relic) return false;

  const state = _state[charId];
  state.active            = true;
  state.timeRemaining     = EFFECT_DURATION;
  state.cooldownRemaining = EFFECT_COOLDOWN;

  const effectFn = _getEffectFn(relic.weapon, relic.element);
  if (effectFn) effectFn(charId);

  return true;
}

// ── Tick (llamar cada frame desde el loop principal) ────────────────────────

export function update(delta) {
  for (const charId of Object.keys(_state)) {
    const state = _state[charId];

    if (state.active) {
      state.timeRemaining -= delta;
      if (state.timeRemaining <= 0) {
        state.timeRemaining = 0;
        state.active        = false;
      }
    } else if (state.cooldownRemaining > 0) {
      state.cooldownRemaining -= delta;
      if (state.cooldownRemaining < 0) state.cooldownRemaining = 0;
    }
  }
}

// ── Getters para HUD/combate ────────────────────────────────────────────────

export function isRelicActive(charId) {
  return !!_state[charId]?.active;
}

export function getRelicCooldownPct(charId) {
  const state = _state[charId];
  if (!state) return 1;
  if (state.active) return 1; // durante el efecto se considera "disponible visualmente lleno"
  return 1 - (state.cooldownRemaining / EFFECT_COOLDOWN);
}

export function getRelicTimeRemaining(charId) {
  return _state[charId]?.timeRemaining ?? 0;
}

// ── Compatibilidad con el sistema viejo (stats) ─────────────────────────────
// Las reliquias ya no suman stats. Estas funciones se mantienen porque
// combat.js y otros archivos dependen de window._effectiveStats /
// window._effectiveStatsMika para calcular daño (eff.atk). Ahora simplemente
// devuelven los stats base sin modificar, para no romper nada existente.

export function computeEffectiveStats(baseStats) {
  return { ...baseStats };
}

export function refreshEffectiveStats(charId) {
  if (charId === 'mika') {
    const prog = window._mikaProgression;
    if (!prog) return;
    window._effectiveStatsMika = computeEffectiveStats(prog.getStats());
  } else {
    const prog = window._prog;
    if (!prog) return;
    window._effectiveStats = computeEffectiveStats(prog.getStats());
  }
}

export function refreshAllEffectiveStats() {
  refreshEffectiveStats('kael');
  refreshEffectiveStats('mika');
}
