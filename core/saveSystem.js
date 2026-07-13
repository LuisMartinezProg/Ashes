// core/saveSystem.js — Ashes of the Reborn | Valiant Gaming
//
// Sistema de guardado central, slot único. Recolecta el estado de todos los
// sistemas relevantes (progresión de Kael/Mika, inventario, currency, flags
// narrativos, posición del jugador) y lo persiste en localStorage.
//
// Gacha (core/gacha.js) y waypoints (core/waypoints.js) ya se guardan solos
// en localStorage con sus propias keys — no se tocan ni se duplican aquí.

const SAVE_KEY = 'ashes_savegame';
const SAVE_VERSION = 1;

// ── Guardar ────────────────────────────────────────────────────────────────

export function saveGame() {
  const data = {
    version   : SAVE_VERSION,
    timestamp : Date.now(),

    kael : window._prog?.serialize?.() ?? null,
    mika : window._mikaProgression?.serialize?.() ?? null,

    inventory : window._inventory?._items ?? null,
    currency  : window._currency?.serialize?.() ?? null,
    flags     : window._narrative?._flags ?? {},

    playerPos : _getPlayerPosSnapshot(),
  };

  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(data));
    _notifySaved();
    return true;
  } catch (e) {
    console.error('[SaveSystem] Error al guardar:', e);
    return false;
  }
}

function _getPlayerPosSnapshot() {
  const p = window._player?.root?.position;
  if (!p) return null;
  return { x: p.x, y: p.y, z: p.z };
}

function _notifySaved() {
  const el = document.createElement('div');
  Object.assign(el.style, {
    position     : 'fixed',
    bottom       : '24px',
    right        : '18px',
    background    : 'rgba(4,4,10,0.9)',
    border       : '1px solid rgba(237,212,122,0.5)',
    borderRadius : '10px',
    padding      : '8px 16px',
    fontFamily   : 'monospace',
    fontSize     : '10px',
    color        : '#EDD47A',
    zIndex       : '700',
    pointerEvents: 'none',
    opacity      : '1',
    transition   : 'opacity 0.8s',
  });
  el.textContent = '💾 Partida guardada';
  document.body.appendChild(el);
  setTimeout(() => {
    el.style.opacity = '0';
    setTimeout(() => el.remove(), 800);
  }, 1400);
}

// ── Cargar ─────────────────────────────────────────────────────────────────

export function hasSaveGame() {
  return localStorage.getItem(SAVE_KEY) !== null;
}

export function getSaveInfo() {
  const raw = localStorage.getItem(SAVE_KEY);
  if (!raw) return null;
  try {
    const data = JSON.parse(raw);
    return {
      level     : data.kael?.level ?? 1,
      timestamp : data.timestamp,
    };
  } catch (e) {
    return null;
  }
}

export function loadGame() {
  const raw = localStorage.getItem(SAVE_KEY);
  if (!raw) return false;

  let data;
  try {
    data = JSON.parse(raw);
  } catch (e) {
    console.error('[SaveSystem] Guardado corrupto:', e);
    return false;
  }

  if (data.kael && window._prog)              window._prog.load(data.kael);
  if (data.mika && window._mikaProgression)    window._mikaProgression.load(data.mika);

  if (data.inventory && window._inventory) {
    window._inventory._items = data.inventory;
  }

  if (data.currency && window._currency?.load) {
    window._currency.load(data.currency);
  }

  if (data.flags && window._narrative) {
    window._narrative._flags = data.flags;
  }

  if (data.playerPos && window._player?.root) {
    window._player.root.position.set(data.playerPos.x, data.playerPos.y, data.playerPos.z);
    window._thirdCam?._snapToPlayer?.();
  }

  return true;
}

export function deleteSaveGame() {
  localStorage.removeItem(SAVE_KEY);
}

// ── Autoguardado ─────────────────────────────────────────────────────────
// Llamar autoSave() en puntos clave: activar waypoint, completar dungeon,
// level up, etc. No corre en un intervalo de tiempo fijo — se dispara por
// evento, para no guardar en mitad de un combate o transición.

export function autoSave() {
  saveGame();
}
