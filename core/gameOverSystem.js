// core/gameOverSystem.js — Ashes of the Reborn | Valiant Gaming
//
// Sistema de muerte/Game Over.
// Cuando el personaje activo llega a 0 HP, espera 1.5s (mismo tiempo que el
// cooldown normal de swap) para dar chance de reaccionar visualmente. Si el
// otro personaje tiene HP, hace swap forzado. Si ambos están en 0, dispara
// Game Over: pantalla negra breve, luego respawn (mundo abierto o mazmorra
// según corresponda).
//
// No toca pociones/buffs temporales — esos, cuando existan, simplemente no
// son tocados por este sistema y seguirán activos igual al volver.

const SWAP_DELAY_MS    = 1500; // mismo tiempo que SWITCH_COOLDOWN de partyManager
const GAMEOVER_TEXT_MS = 2200; // duración de la pantalla "Has caído"

let _pendingSwapTimer = null;
let _gameOverActive   = false;
let _overlayEl        = null;

function _buildOverlay() {
  if (_overlayEl) return;
  _overlayEl = document.createElement('div');
  Object.assign(_overlayEl.style, {
    position       : 'fixed',
    inset          : '0',
    background     : '#000',
    display        : 'none',
    alignItems     : 'center',
    justifyContent : 'center',
    zIndex         : '500',
    opacity        : '0',
    transition     : 'opacity 0.6s ease',
  });

  const text = document.createElement('div');
  Object.assign(text.style, {
    fontFamily   : "'Cinzel', serif",
    fontSize     : '22px',
    letterSpacing: '4px',
    color        : '#C9A84C',
    textTransform: 'uppercase',
  });
  text.textContent = 'Has caído';

  _overlayEl.appendChild(text);
  document.body.appendChild(_overlayEl);
}

function _isCharAlive(charId) {
  if (charId === 'mika') return (window._companion?.hp ?? 0) > 0;
  return (window._player?.hp ?? 0) > 0;
}

function _fullyHeal() {
  const p = window._player;
  if (p) { p.hp = p.maxHp; p.onDamage?.(p.hp, p.maxHp); }

  const m = window._companion;
  if (m) { m.hp = m.maxHp; m.onDamage?.(m.hp, m.maxHp); }
}

// ── Punto de entrada: llamar cada vez que un personaje recibe daño ─────────
// charId: 'kael' | 'mika' — quién acaba de bajar a 0
export function notifyCharacterDown(charId) {
  if (_gameOverActive) return;

  const activeIdx   = window._partyManager?.getActiveIdx?.() ?? 0;
  const activeIsThis = (charId === 'kael' && activeIdx === 0)
                     || (charId === 'mika' && activeIdx === 1);

  // Si el que cayó no es el personaje que estás controlando, no hace falta
  // swap (el jugador sigue con el que ya tiene). Pero igual revisamos si
  // ambos están caídos por si esto fue el último golpe.
  if (!activeIsThis) {
    _checkBothDown();
    return;
  }

  if (_pendingSwapTimer) return; // ya hay un swap en camino
  _pendingSwapTimer = setTimeout(() => {
    _pendingSwapTimer = null;
    _resolveDown(charId);
  }, SWAP_DELAY_MS);
}

function _resolveDown(downCharId) {
  const otherCharId = downCharId === 'kael' ? 'mika' : 'kael';

  if (_isCharAlive(otherCharId)) {
    _forceSwapTo(otherCharId);
  } else {
    _triggerGameOver();
  }
}

function _checkBothDown() {
  if (_gameOverActive) return;
  if (!_isCharAlive('kael') && !_isCharAlive('mika')) {
    _triggerGameOver();
  }
}

function _forceSwapTo(charId) {
  const pm = window._partyManager;
  if (!pm) return;
  const targetIdx = charId === 'mika' ? 1 : 0;
  if (pm.getActiveIdx() === targetIdx) return;

  // Swap forzado: ignora el cooldown normal, igual que el manual pero sin
  // chequear canSwitch().
  pm._activeIdx   = targetIdx;
  pm._switchTimer = 0;

  if (targetIdx === 0) {
    pm.companion.deactivate();
    pm.companion.root.visible = false;
    pm.player.root.position.copy(pm.companion.root.position);
    pm.player.root.visible = true;
  } else {
    pm.companion.root.position.copy(pm.player.root.position);
    pm.companion.activate();
    pm.companion.root.visible = true;
    pm.player.root.visible    = false;
  }

  window._thirdCam?.setTarget(pm.getActiveCharacter());
  pm.onSwitch?.(targetIdx);
}

function _triggerGameOver() {
  if (_gameOverActive) return;
  _gameOverActive = true;

  _buildOverlay();
  _overlayEl.style.display = 'flex';
  requestAnimationFrame(() => { _overlayEl.style.opacity = '1'; });

  setTimeout(() => {
    _respawn();
    _overlayEl.style.opacity = '0';
    setTimeout(() => {
      _overlayEl.style.display = 'none';
      _gameOverActive = false;
    }, 600);
  }, GAMEOVER_TEXT_MS);
}

function _respawn() {
  _fullyHeal();

  const dungeonManager = window._dungeonManager;
  if (dungeonManager?._active) {
    dungeonManager.respawnInCurrentRoom?.();
  } else {
    _respawnWorldSpawn();
  }
}

function _respawnWorldSpawn() {
  const spawn = window._worldSpawnPoint ?? { x: 0, z: -20 };
  const p = window._player;
  if (p?.root) p.root.position.set(spawn.x, 0, spawn.z);
  const m = window._companion;
  if (m?.root) m.root.position.set(spawn.x + 1, 0, spawn.z);
  window._thirdCam?._snapToPlayer?.();
}
