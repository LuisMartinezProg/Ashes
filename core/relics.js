// core/relics.js — Ashes of the Reborn | Valiant Gaming
//
// Sistema de activación de reliquias (reemplaza el modelo viejo de stats pasivos).
// Las reliquias NO suman stats. Cada reliquia tiene UN efecto activo único,
// atado al par (arma, elemento), con duración y cooldown de 7s cada uno.
//
// Los 18 efectos reales ya están registrados abajo (ver REGISTRO DE EFECTOS).
// Activar una reliquia ahora sí produce un efecto de combate real, además del
// tinte/partículas visuales que maneja este mismo archivo.

import { getRelicData, getElementColor } from '../data/relics.js';

const EFFECT_DURATION = 7; // segundos
const EFFECT_COOLDOWN = 7; // segundos
const ENERGY_PER_HIT  = 15; // energía otorgada por golpe conectado mientras está activa (ver nota de balance abajo)
const CHAIN_LIGHTNING_IMMUNITY = 3; // segundos que un enemigo queda "a salvo" de volver a ser blanco del rayo encadenado

// ── Estado de activación por personaje ─────────────────────────────────────
function _makeState() {
  return {
    active            : false,
    timeRemaining     : 0,   // segundos restantes de efecto activo
    cooldownRemaining : 0,   // segundos restantes de cooldown
    hitsInWindow      : 0,   // golpes conectados desde que se activó (para efectos "3er golpe")
  };
}

const _state = {
  kael: _makeState(),
  mika: _makeState(),
};

// ── Registro de efectos por combinación (arma, elemento) ───────────────────
// Firma esperada: (charId) => void — se ejecuta UNA VEZ al activarse la
// reliquia (efectos de área/instantáneos). Los efectos "por golpe" (quemar
// al impactar, curar por flecha, etc.) se manejan en onRelicHitConnected(),
// más abajo, porque necesitan saber CUÁNDO conecta un golpe, no solo cuándo
// se activó la reliquia.
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
  state.hitsInWindow      = 0;

  _spawnWeaponInfusion(charId, relic);

  const effectFn = _getEffectFn(relic.weapon, relic.element);
  if (effectFn) effectFn(charId);

  return true;
}

// ── Golpe conectado mientras la reliquia está activa ────────────────────────
// Llamado desde combat.js cada vez que un ataque básico impacta a un
// enemigo (o se dispara, en el caso de armas a distancia). Maneja:
//  1) el bono de energía (siempre, mismo valor para las 18 reliquias)
//  2) los efectos "por golpe" que dependen del elemento/arma específicos
//     (quemar al impactar, curar por flecha, el estallido del 3er golpe, etc.)
// target puede ser null para efectos que no requieren un enemigo (curación,
// escudo, buffs de movimiento). allEnemies es la lista completa de enemigos
// activos en este momento — la necesita 'bow_rayo' (Flecha Fulgurante) para
// encontrar a quién encadenar el rayo; el resto de efectos la ignoran.
export function onRelicHitConnected(charId, target, allEnemies = []) {
  const state = _state[charId];
  if (!state?.active) return;

  state.hitsInWindow++;

  const prog = _getProgression(charId);
  prog?.addMagicEnergy?.(ENERGY_PER_HIT);

  const relic = getEquippedRelic(charId);
  if (!relic) return;

  _applyPerHitEffect(charId, relic, target, state.hitsInWindow, allEnemies);
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
        _clearWeaponInfusion(charId);
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

// ══════════════════════════════════════════════════════════════════════
// Infusión visual: tinte del arma + partículas del elemento.
// Busca el mesh del arma equipada en window._player (kael) o
// window._companion (mika) — ambos exponen su weapon actual vía
// window._combat.weapon / window._companion (ver combat.js/companion.js).
// Si no encuentra el mesh, no rompe nada — simplemente no hay efecto visual.
// ══════════════════════════════════════════════════════════════════════

const _activeInfusions = {}; // charId → { originalEmissive, particles[] }

function _getWeaponMesh(charId) {
  if (charId === 'mika') {
    return window._companion?.weapon?.mesh ?? null;
  }
  return window._combat?.weapon?.mesh ?? null;
}

function _getScene(charId) {
  return window._worldScene ?? window._combat?._scene ?? null;
}

function _spawnWeaponInfusion(charId, relic) {
  _clearWeaponInfusion(charId); // por si quedó algo de una activación anterior

  const mesh  = _getWeaponMesh(charId);
  const color = getElementColor(relic.element);
  const scene = _getScene(charId);

  const infusion = { mesh, originalEmissive: null, particles: [], color };

  // Tinte: guarda el emissive original del material para poder restaurarlo,
  // y lo reemplaza por el color del elemento mientras dura el efecto.
  if (mesh?.material?.emissive) {
    infusion.originalEmissive = mesh.material.emissive.clone();
    mesh.material.emissive.set(color);
    if ('emissiveIntensity' in mesh.material) {
      infusion._originalEmissiveIntensity = mesh.material.emissiveIntensity;
      mesh.material.emissiveIntensity = 0.9;
    }
  }

  // Partículas: un pequeño sistema simple, 12 partículas orbitando el arma
  // (o el jugador si no hay mesh de arma disponible), recicladas cada frame
  // vía update() → _updateInfusionParticles().
  if (scene && window.THREE) {
    const THREE = window.THREE;
    const anchor = mesh ?? window._player ?? null;
    if (anchor) {
      for (let i = 0; i < 12; i++) {
        const geo  = new THREE.SphereGeometry(0.05, 5, 5);
        const mat  = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.8 });
        const p    = new THREE.Mesh(geo, mat);
        p.userData._angle  = (i / 12) * Math.PI * 2;
        p.userData._radius = 0.4 + Math.random() * 0.2;
        p.userData._speed  = 1.5 + Math.random() * 1.0;
        p.userData._yOff   = Math.random() * 0.6;
        scene.add(p);
        infusion.particles.push(p);
      }
    }
  }

  _activeInfusions[charId] = infusion;
}

function _clearWeaponInfusion(charId) {
  const infusion = _activeInfusions[charId];
  if (!infusion) return;

  if (infusion.mesh?.material?.emissive && infusion.originalEmissive) {
    infusion.mesh.material.emissive.copy(infusion.originalEmissive);
    if (infusion._originalEmissiveIntensity !== undefined) {
      infusion.mesh.material.emissiveIntensity = infusion._originalEmissiveIntensity;
    }
  }

  const scene = _getScene(charId);
  for (const p of infusion.particles) {
    scene?.remove(p);
    p.geometry.dispose();
    p.material.dispose();
  }

  delete _activeInfusions[charId];
}

// Llamar cada frame (junto con update() de arriba) para animar las
// partículas orbitando el arma/personaje mientras la reliquia está activa.
export function updateInfusionParticles(delta) {
  for (const charId of Object.keys(_activeInfusions)) {
    const infusion = _activeInfusions[charId];
    const anchor   = infusion.mesh ?? window._player ?? null;
    if (!anchor) continue;

    for (const p of infusion.particles) {
      p.userData._angle += p.userData._speed * delta;
      const r = p.userData._radius;
      p.position.set(
        anchor.position.x + Math.cos(p.userData._angle) * r,
        anchor.position.y + p.userData._yOff + Math.sin(p.userData._angle * 2) * 0.1,
        anchor.position.z + Math.sin(p.userData._angle) * r,
      );
    }
  }
}

// ══════════════════════════════════════════════════════════════════════
// REGISTRO DE EFECTOS — las 18 combinaciones, ya conectadas.
// applyBurn(dps, seconds) y applySlow(pct, seconds) ya existen en los
// enemigos (confirmado por su uso en combat.js) — se reusan aquí.
// Para efectos de jugador (curar, escudo, velocidad, esquiva) se usa el
// personaje activo vía window._partyManager?.getActiveCharacter() ??
// window._player, siguiendo el mismo patrón que combat.js ya usa.
// ══════════════════════════════════════════════════════════════════════

function _getActiveChar() {
  return window._partyManager?.getActiveCharacter?.() ?? window._player ?? null;
}

function _healActiveChar(amount) {
  const char = _getActiveChar();
  if (!char) return;
  char.hp = Math.min(char.maxHp, (char.hp ?? 0) + amount);
  char.onDamage?.(char.hp, char.maxHp);
}

// Escudo simple: un campo _shieldAmount en el personaje activo que combat.js
// / el sistema de daño puede consultar para absorber golpes antes que la
// vida. Si el proyecto no tiene todavía ese consumo implementado del lado
// de "recibir daño", el escudo se otorga igual (queda listo para cuando
// exista ese enganche) — no rompe nada mientras tanto.
function _grantShield(amount, seconds) {
  const char = _getActiveChar();
  if (!char) return;
  char._shieldAmount   = (char._shieldAmount ?? 0) + amount;
  char._shieldExpireAt = performance.now() + seconds * 1000;
}

function _grantSpeedBuff(pct, seconds) {
  const char = _getActiveChar();
  if (!char) return;
  char._speedBuffPct    = pct;
  char._speedBuffExpireAt = performance.now() + seconds * 1000;
}

function _grantDodgeChance(pct, seconds) {
  const char = _getActiveChar();
  if (!char) return;
  char._dodgeChancePct    = pct;
  char._dodgeChanceExpireAt = performance.now() + seconds * 1000;
}

function _pushCharAwayFrom(target, strength) {
  const char = _getActiveChar();
  if (!char?.position || !target?.mesh?.position) return;
  const dx  = char.position.x - target.mesh.position.x;
  const dz  = char.position.z - target.mesh.position.z;
  const len = Math.sqrt(dx*dx + dz*dz) || 1;
  char.position.x += (dx / len) * strength;
  char.position.z += (dz / len) * strength;
}

function _pushCharForward(strength) {
  const char = _getActiveChar();
  if (!char?.position || !char?.rotation) return;
  char.position.x += Math.sin(char.rotation.y) * strength;
  char.position.z += Math.cos(char.rotation.y) * strength;
}

// Busca, dentro de allEnemies, al enemigo vivo más cercano a 'from' que NO
// tenga la marca de inmunidad al encadenado activa todavía. Usado por
// 'bow_rayo' (Flecha Fulgurante) para no rebotar siempre entre los mismos 2.
function _findChainTarget(from, allEnemies) {
  if (!from?.mesh?.position) return null;
  const now = performance.now();
  let closest = null, minDist = Infinity;

  for (const e of allEnemies) {
    if (!e || e === from) continue;
    if (typeof e.isDead === 'function' && e.isDead()) continue;
    if (!e.mesh) continue;
    if (e._chainLightningImmuneUntil && e._chainLightningImmuneUntil > now) continue;

    const d = e.mesh.position.distanceTo(from.mesh.position);
    if (d < minDist) { minDist = d; closest = e; }
  }

  return closest;
}

// Efectos "por golpe" — se llaman desde onRelicHitConnected(). hitsInWindow
// es el conteo de golpes desde la activación (usado por los efectos que
// solo actúan en el 3er golpe, patrón Katana). allEnemies solo lo usa
// 'bow_rayo' para el encadenado — el resto de casos lo ignora.
function _applyPerHitEffect(charId, relic, target, hitsInWindow, allEnemies) {
  const key = `${relic.weapon}_${relic.element}`;
  const isThirdHit = (hitsInWindow % 3 === 0); // patrón Katana: cada 3er golpe

  switch (key) {
    // 🔥 Fuego
    case 'sword_fuego':      target?.applyBurn?.(4, 3); break;
    case 'katana_fuego':     if (isThirdHit) target?.applyBurn?.(8, 3); break;
    case 'bow_fuego':        target?.applyBurn?.(3, 4); break;

    // ❄️ Hielo
    case 'sword_hielo':      target?.applySlow?.(0.35, 2.5); break;
    case 'katana_hielo':     if (isThirdHit) target?.applySlow?.(0.6, 2.5); break;
    case 'bow_hielo':        target?.applySlow?.(0.3, 2); break;

    // ⚡ Rayo
    case 'sword_rayo':       if (Math.random() < 0.35) target?.applyStun?.(1.2); break;
    case 'katana_rayo':      if (isThirdHit) target?.takeDamage?.(18); break;
    case 'bow_rayo': {
      // Flecha Fulgurante: encadena el rayo al enemigo vivo más cercano al
      // golpeado que no esté ya "inmune" al encadenado (evita rebotar
      // siempre entre los mismos 2). Si no hay ninguno disponible, el
      // golpe simplemente no encadena esta vez — no rompe nada.
      const chainTarget = _findChainTarget(target, allEnemies);
      if (chainTarget) {
        chainTarget.takeDamage?.(10);
        chainTarget._chainLightningImmuneUntil = performance.now() + CHAIN_LIGHTNING_IMMUNITY * 1000;
      }
      break;
    }

    // 🌪️ Viento (beneficio jugador)
    case 'sword_viento':     _pushCharForward(1.2); break;
    case 'katana_viento':    if (isThirdHit) _grantSpeedBuff(0.3, 2); break;
    case 'bow_viento':       if (target) _pushCharAwayFrom(target, 1.0); break;

    // 🌿 Naturaleza (beneficio jugador)
    case 'sword_naturaleza': _healActiveChar(6); break;
    case 'katana_naturaleza':if (isThirdHit) _healActiveChar(14); break;
    case 'bow_naturaleza':   _healActiveChar(3); break;

    // 💧 Agua (beneficio jugador)
    case 'sword_agua':       _grantShield(15, 3); break;
    case 'katana_agua':      if (isThirdHit) _grantShield(25, 3); break;
    case 'bow_agua':         _grantDodgeChance(0.25, 3); break;
  }
}

// ── Efectos "al activarse" (área/instantáneos, no dependen de golpes) ──────
// Las 18 reliquias ya están cubiertas por efectos "por golpe" arriba —
// ninguna necesitaba además un efecto instantáneo separado al activarse,
// así que este registro queda disponible para el futuro pero vacío por ahora.
// (Se deja registerRelicEffect/_getEffectFn funcionando por si alguna
// reliquia futura sí lo necesita.)

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
