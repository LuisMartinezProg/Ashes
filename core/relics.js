// core/relics.js — Ashes of the Reborn | Valiant Gaming
//
// Sistema de activación de reliquias (rework v2).
// Las reliquias NO suman stats. Cada reliquia tiene UN efecto activo único,
// atado al par (arma, elemento) — pero AHORA la forma de activarla depende
// del arma equipada, no es un solo botón universal:
//
//   Espada : se cargan 4 golpes básicos -> aparece un botón por 4s ->
//            si se presiona, se activa un ESCUDO de 7s. Mientras el
//            escudo está arriba, el efecto de la reliquia le pega al
//            enemigo que golpee el escudo (como un contraataque).
//   Katana : se cargan golpes básicos -> al 3er golpe, la reliquia se
//            auto-activa sola (sin botón) por 7s, con el efecto normal
//            por golpe conectado.
//   Arco   : mientras el personaje está apuntando, aparece un botón de
//            reliquia. Al presionarlo (o al disparar con él activo),
//            se activa por 7s con el efecto normal por golpe conectado.
//
// La duración de 7s y el cooldown de 7s se mantienen para los 3 casos.
// Los 18 efectos por combinación siguen siendo los mismos de antes.

import { getRelicData, getElementColor } from '../data/relics.js';

const EFFECT_DURATION = 7; // segundos que dura activa (katana/arco) o el escudo (espada)
const EFFECT_COOLDOWN = 7; // segundos de cooldown tras terminar

const ENERGY_PER_HIT  = 15; // energía otorgada por golpe conectado mientras está activa
const CHAIN_LIGHTNING_IMMUNITY = 3; // segundos de "a salvo" tras ser blanco del rayo encadenado

// Números de la carga de espada, confirmados por Luis:
const SWORD_HITS_TO_CHARGE   = 4; // golpes básicos necesarios para que aparezca el botón
const SWORD_BUTTON_WINDOW    = 4; // segundos que el botón permanece disponible antes de expirar
const SWORD_SHIELD_DURATION  = 7; // segundos que dura el escudo una vez activado

// Golpes necesarios para el auto-disparo de katana (patrón ya existente: 2 se acumulan, el 3ro libera)
const KATANA_HITS_TO_TRIGGER = 3;

// ── Estado de activación por personaje ─────────────────────────────────────
function _makeState() {
  return {
    active            : false, // reliquia activa (katana/arco) O escudo activo (espada)
    timeRemaining     : 0,     // segundos restantes de efecto activo / escudo
    cooldownRemaining : 0,     // segundos restantes de cooldown

    // Conteo de golpes básicos (espada y katana lo usan; arco no)
    chargeHits        : 0,

    // Espada: ventana en la que el botón está disponible tras cargar los golpes
    buttonAvailable      : false,
    buttonWindowRemaining: 0,

    // Arco: si el personaje está actualmente en modo apuntado
    isAiming: false,
  };
}

const _state = {
  kael: _makeState(),
  mika: _makeState(),
};

// ── Registro de efectos por combinación (arma, elemento) ───────────────────
// (Sin cambios respecto a antes — se mantiene disponible para efectos
// instantáneos futuros; hoy los 18 casos se resuelven en _applyPerHitEffect.)
const _effects = {};

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

// ══════════════════════════════════════════════════════════════════════
// CARGA POR GOLPES — espada y katana comparten este conteo, pero cada
// una reacciona distinto al llegar al umbral. Llamar desde combat.js en
// CADA golpe básico conectado (no solo mientras la reliquia está activa).
// ══════════════════════════════════════════════════════════════════════

export function onBasicHitLanded(charId) {
  const relic = getEquippedRelic(charId);
  if (!relic) return;

  const state = _state[charId];
  if (!state) return;

  // Si ya hay un escudo/reliquia activa, o está en cooldown, no se acumula
  // (evita que el conteo siga corriendo mientras el efecto ya está en curso).
  if (state.active || state.cooldownRemaining > 0) return;

  if (relic.weapon === 'sword') {
    state.chargeHits++;
    if (state.chargeHits >= SWORD_HITS_TO_CHARGE) {
      state.chargeHits = 0;
      state.buttonAvailable       = true;
      state.buttonWindowRemaining = SWORD_BUTTON_WINDOW;
    }
  } else if (relic.weapon === 'katana') {
    state.chargeHits++;
    if (state.chargeHits >= KATANA_HITS_TO_TRIGGER) {
      state.chargeHits = 0;
      _activateKatanaOrBow(charId, relic); // auto-activación, sin botón
    }
  }
  // Arco no acumula golpes — su condición es isAiming, ver más abajo.
}

// Espada: ¿el botón de escudo está visible ahora mismo? (para que el HUD
// sepa cuándo mostrarlo)
export function isSwordButtonAvailable(charId) {
  return !!_state[charId]?.buttonAvailable;
}

// Arco: la UI de apuntado llama esto al entrar/salir de ese modo.
export function setAiming(charId, isAiming) {
  const state = _state[charId];
  if (!state) return;
  state.isAiming = isAiming;
}

export function isAiming(charId) {
  return !!_state[charId]?.isAiming;
}

// ── ¿Se puede activar la reliquia ahora mismo? (para el botón, el que sea) ──
// La condición cambia según el arma equipada:
//   espada  -> el botón de escudo debe estar disponible (ventana de 4s abierta)
//   katana  -> nunca se activa por botón, es automática (ver onBasicHitLanded)
//   arco    -> debe estar en modo apuntado
export function canActivateRelic(charId) {
  const state = _state[charId];
  const relic = getEquippedRelic(charId);
  if (!state || !relic) return false;
  if (state.active) return false;
  if (state.cooldownRemaining > 0) return false;

  if (relic.weapon === 'sword') return state.buttonAvailable;
  if (relic.weapon === 'bow')   return state.isAiming;
  return false; // katana no se activa manualmente
}

// Punto de entrada manual (botón de espada presionado, o botón de arco
// presionado/disparo con el arco apuntando). Katana NUNCA pasa por aquí.
export function activateRelic(charId) {
  if (!canActivateRelic(charId)) return false;

  const relic = getEquippedRelic(charId);
  const state = _state[charId];

  if (relic.weapon === 'sword') {
    state.buttonAvailable       = false;
    state.buttonWindowRemaining = 0;
    _activateSwordShield(charId, relic);
    return true;
  }

  if (relic.weapon === 'bow') {
    _activateKatanaOrBow(charId, relic);
    return true;
  }

  return false;
}

// ── Activación real: katana (auto) y arco (botón/disparo) ──────────────────
// Comparten el mismo comportamiento: 7s activa, efecto normal por golpe.
function _activateKatanaOrBow(charId, relic) {
  const state = _state[charId];
  state.active            = true;
  state.timeRemaining     = EFFECT_DURATION;
  state.cooldownRemaining = EFFECT_COOLDOWN;

  _spawnWeaponInfusion(charId, relic);

  const effectFn = _getEffectFn(relic.weapon, relic.element);
  if (effectFn) effectFn(charId);
}

// ── Activación real: espada (escudo) ────────────────────────────────────────
// No aplica el efecto al activarse — el efecto se dispara cuando un
// enemigo golpea el escudo (ver onShieldHitByEnemy más abajo).
function _activateSwordShield(charId, relic) {
  const state = _state[charId];
  state.active            = true; // "active" ahora significa "escudo arriba"
  state.timeRemaining     = SWORD_SHIELD_DURATION;
  state.cooldownRemaining = EFFECT_COOLDOWN;

  _spawnWeaponInfusion(charId, relic);
  // El escudo en sí (absorción de daño mientras dure) debe consultarse desde
  // combat.js/el sistema de daño con isShieldActive(charId) antes de restar
  // vida al personaje, igual que ya se hacía con el _shieldAmount anterior.
}

export function isShieldActive(charId) {
  const relic = getEquippedRelic(charId);
  return relic?.weapon === 'sword' && !!_state[charId]?.active;
}

// Llamar desde el sistema de daño cuando un enemigo golpea al personaje Y
// isShieldActive(charId) es true — en vez de restar vida, dispara el
// efecto de la reliquia contra ESE enemigo (como un contraataque).
// Asunción de diseño, pendiente de confirmar con Luis si no es lo esperado.
export function onShieldHitByEnemy(charId, attacker) {
  if (!isShieldActive(charId)) return;

  const relic = getEquippedRelic(charId);
  if (!relic) return;

  _applyPerHitEffect(charId, relic, attacker, 3, []); // 3 = fuerza el "3er golpe" en efectos tipo katana, no aplica a espada pero no rompe nada

  const prog = _getProgression(charId);
  prog?.addMagicEnergy?.(ENERGY_PER_HIT);
}

// ── Golpe conectado por el JUGADOR mientras katana/arco están activas ──────
// (Espada NO pasa por aquí — su efecto se dispara en onShieldHitByEnemy.)
export function onRelicHitConnected(charId, target, allEnemies = []) {
  const state = _state[charId];
  if (!state?.active) return;

  const relic = getEquippedRelic(charId);
  if (!relic || relic.weapon === 'sword') return; // espada usa el flujo del escudo, no este

  state.chargeHits++; // reutilizado aquí como conteo de golpes DENTRO de la ventana activa (para el patrón "3er golpe" de katana, si aplica dentro de la ventana también)

  const prog = _getProgression(charId);
  prog?.addMagicEnergy?.(ENERGY_PER_HIT);

  _applyPerHitEffect(charId, relic, target, state.chargeHits, allEnemies);
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
        state.chargeHits     = 0;
        _clearWeaponInfusion(charId);
      }
    } else if (state.cooldownRemaining > 0) {
      state.cooldownRemaining -= delta;
      if (state.cooldownRemaining < 0) state.cooldownRemaining = 0;
    }

    // Ventana del botón de espada: si expira sin presionarse, se cierra
    // y hay que volver a cargar los 4 golpes desde cero.
    if (state.buttonAvailable) {
      state.buttonWindowRemaining -= delta;
      if (state.buttonWindowRemaining <= 0) {
        state.buttonAvailable       = false;
        state.buttonWindowRemaining = 0;
      }
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
  if (state.active) return 1;
  return 1 - (state.cooldownRemaining / EFFECT_COOLDOWN);
}

export function getRelicTimeRemaining(charId) {
  return _state[charId]?.timeRemaining ?? 0;
}

// ══════════════════════════════════════════════════════════════════════
// Infusión visual: tinte del arma + partículas del elemento.
// (Sin cambios respecto a la versión anterior.)
// ══════════════════════════════════════════════════════════════════════

const _activeInfusions = {};

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
  _clearWeaponInfusion(charId);

  const mesh  = _getWeaponMesh(charId);
  const color = getElementColor(relic.element);
  const scene = _getScene(charId);

  const infusion = { mesh, originalEmissive: null, particles: [], color };

  if (mesh?.material?.emissive) {
    infusion.originalEmissive = mesh.material.emissive.clone();
    mesh.material.emissive.set(color);
    if ('emissiveIntensity' in mesh.material) {
      infusion._originalEmissiveIntensity = mesh.material.emissiveIntensity;
      mesh.material.emissiveIntensity = 0.9;
    }
  }

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
// REGISTRO DE EFECTOS — las 18 combinaciones. Sin cambios en el contenido
// de cada efecto respecto a la versión anterior; solo cambió QUIÉN y
// CUÁNDO los llama (ver onRelicHitConnected y onShieldHitByEnemy arriba).
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

function _grantShield(amount, seconds) {
  const char = _getActiveChar();
  if (!char) return;
  char._shieldAmount   = (char._shieldAmount ?? 0) + amount;
  char._shieldExpireAt = performance.now() + seconds * 1000;
}

function _grantSpeedBuff(pct, seconds) {
  const char = _getActiveChar();
  if (!char) return;
  char._speedBuffPct      = pct;
  char._speedBuffExpireAt = performance.now() + seconds * 1000;
}

function _grantDodgeChance(pct, seconds) {
  const char = _getActiveChar();
  if (!char) return;
  char._dodgeChancePct      = pct;
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

function _applyPerHitEffect(charId, relic, target, hitsInWindow, allEnemies) {
  const key = `${relic.weapon}_${relic.element}`;
  const isThirdHit = (hitsInWindow % 3 === 0);

  switch (key) {
    case 'sword_fuego':      target?.applyBurn?.(4, 3); break;
    case 'katana_fuego':     if (isThirdHit) target?.applyBurn?.(8, 3); break;
    case 'bow_fuego':        target?.applyBurn?.(3, 4); break;

    case 'sword_hielo':      target?.applySlow?.(0.35, 2.5); break;
    case 'katana_hielo':     if (isThirdHit) target?.applySlow?.(0.6, 2.5); break;
    case 'bow_hielo':        target?.applySlow?.(0.3, 2); break;

    case 'sword_rayo':       if (Math.random() < 0.35) target?.applyStun?.(1.2); break;
    case 'katana_rayo':      if (isThirdHit) target?.takeDamage?.(18); break;
    case 'bow_rayo': {
      const chainTarget = _findChainTarget(target, allEnemies);
      if (chainTarget) {
        chainTarget.takeDamage?.(10);
        chainTarget._chainLightningImmuneUntil = performance.now() + CHAIN_LIGHTNING_IMMUNITY * 1000;
      }
      break;
    }

    case 'sword_viento':     _pushCharForward(1.2); break;
    case 'katana_viento':    if (isThirdHit) _grantSpeedBuff(0.3, 2); break;
    case 'bow_viento':       if (target) _pushCharAwayFrom(target, 1.0); break;

    case 'sword_naturaleza': _healActiveChar(6); break;
    case 'katana_naturaleza':if (isThirdHit) _healActiveChar(14); break;
    case 'bow_naturaleza':   _healActiveChar(3); break;

    case 'sword_agua':       _grantShield(15, 3); break;
    case 'katana_agua':      if (isThirdHit) _grantShield(25, 3); break;
    case 'bow_agua':         _grantDodgeChance(0.25, 3); break;
  }
}

// ── Compatibilidad con el sistema viejo (stats) ─────────────────────────────
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
