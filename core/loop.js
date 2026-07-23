// core/loop.js
import * as THREE          from 'three';
import { Player }          from './player.js';
import { VirtualJoystick } from './joystick.js';
import { ThirdPersonCamera } from './camera.js';
import { FOREST_RESOURCES } from './scene.js';
import { update as updateRelics, updateInfusionParticles } from './relics.js';
const FRAME_CAP       = 1 / 20;
const COLLECT_RANGE   = 3.5;
const COLLECT_CHECK   = 0.3;

let _triggers = null;
let _scene, _camera, _renderer;
let _player, _joystick, _thirdCam, _skillSystem, _combatSystem, _enemies = [];
let _lastTime = 0;
let _running  = false;
let _npcs = [], _dialogueUI = null;
let _fpsFrames = 0;
let _fpsAccum  = 0;
let _collectAccum = 0;
let _nearResource = null;
let _onResourceNear = null;
const _fpsEl = document.getElementById('fps');

export function startLoop(scene, camera, renderer) {
  _scene    = scene;
  _camera   = camera;
  _renderer = renderer;

  const placeholder = scene.getObjectByName('player_placeholder');
  if (placeholder) scene.remove(placeholder);

  _player   = new Player(scene);
  _joystick = new VirtualJoystick();
  _thirdCam = new ThirdPersonCamera(camera, _player);
  window._thirdCam = _thirdCam;

  _running  = true;
  _lastTime = performance.now();
  requestAnimationFrame(_tick);
}

function _getActivePosition() {
  const active = window._partyManager?.getActiveCharacter();
  return active?.root?.position ?? active?.position ?? _player.root.position;
}

// ── Skill-cast por teclado: mismo patrón que combat.js usa para distinguir
// personaje activo (window._partyManager?.getActiveCharacter()). Devuelve
// { sys, prog, weapon } — el sistema de skills, la progresión, y el arma
// correctos para quien esté activo en este momento (Kael o Mika). Si algo
// no está listo todavía (ej. arranque muy temprano del juego), devuelve
// null y el caller simplemente no hace nada ese frame — no rompe nada.
function _getActiveSkillContext() {
  const active = window._partyManager?.getActiveCharacter?.();
  const isMika = active && active === window._companion;

  if (isMika) {
    const sys  = window._companion?.skillSystem ?? null;
    const prog = window._mikaProgression ?? null;
    if (!sys || !prog) return null;
    return { sys, prog, weapon: 'bow' };
  }

  const sys  = window._skillSystem ?? null;
  const prog = window._prog ?? null;
  if (!sys || !prog) return null;
  return { sys, prog, weapon: window._combat?._weaponType ?? null };
}

// Lee el slotId + branchId de un botón de la barra de skills y, si ambos
// existen, lanza la skill vía castTreeSkill() usando el contexto activo
// (Kael o Mika). Mismo patrón que ya usa el botón táctil en skillBar.js —
// antes esto llamaba directo a castSkill(id) sin branchId ni distinguir
// personaje, lo cual quedó desincronizado cuando skillBar.js migró al
// árbol de ramas.
function _castSkillButtonByKeyboard(buttonIndex) {
  const btn = window._skillBar?._buttons?.[buttonIndex];
  const skillId  = btn?.dataset?.skillId;
  const branchId = btn?.dataset?.branchId;
  if (!skillId || !branchId) return;

  const ctx = _getActiveSkillContext();
  if (!ctx) return;

  ctx.sys.castTreeSkill?.(ctx.weapon, branchId, skillId, ctx.prog);
}

function _tick(timestamp) {
  if (!_running) return;
  requestAnimationFrame(_tick);

  if (window._building && window._building.isPlacing()) {
    window._building.updateGhostPosition();
  }

  const delta = Math.min((timestamp - _lastTime) * 0.001, FRAME_CAP);
  _lastTime = timestamp;

  _updateFPS(delta);
  _animateScene(timestamp);

  const buildCamActive = window._buildCamera?._active;

  if (!buildCamActive) {
    const joyInput = _joystick.getInput();
    const kbInput  = window._keyboard?.getInput?.() ?? { dx: 0, dy: 0 };

    const input = {
      dx: Math.abs(kbInput.dx) > 0.01 ? kbInput.dx : joyInput.dx,
      dy: Math.abs(kbInput.dy) > 0.01 ? kbInput.dy : joyInput.dy,
    };
    if (Math.abs(input.dx) > 0.01 || Math.abs(input.dy) > 0.01) {
  window._tutorial?.notifyMoved?.();
    }
    if (window._partyManager) {
      window._partyManager.update(delta, input, _camera);
    } else {
      _player.update(delta, input, _camera);
    }

    window._setJoystick?.(input.dx, input.dy);

    // Rotar cámara con mouse derecho en PC
    const camRot = window._keyboard?.getCameraRotation?.() ?? 0;
    if (Math.abs(camRot) > 0.001) _thirdCam.addYaw?.(camRot);

    // Ataques y habilidades por teclado
    if (window._keyboard) {
  const kb    = window._keyboard;
  const binds = kb.getBinds();

  if (kb._keys[binds.attack] && !kb._attackHeld) {
    kb._attackHeld = true;
    window._combat?.triggerAttack?.();
  }
  if (!kb._keys[binds.attack]) kb._attackHeld = false;

  // CAMBIO: las 3 teclas de skill ahora usan _castSkillButtonByKeyboard(),
  // que lee slotId+branchId del botón y llama a castTreeSkill() con el
  // sistema/progresión del personaje activo (Kael o Mika) — reemplaza la
  // llamada directa vieja a window._skillSystem.castSkill(id), que no
  // conocía branchId ni distinguía personaje activo.
  if (kb._keys[binds.skill1] && !kb._sk1Held) {
    kb._sk1Held = true;
    _castSkillButtonByKeyboard(0);
  }
  if (!kb._keys[binds.skill1]) kb._sk1Held = false;

  if (kb._keys[binds.skill2] && !kb._sk2Held) {
    kb._sk2Held = true;
    _castSkillButtonByKeyboard(1);
  }
  if (!kb._keys[binds.skill2]) kb._sk2Held = false;

  if (kb._keys[binds.skill3] && !kb._sk3Held) {
    kb._sk3Held = true;
    _castSkillButtonByKeyboard(2);
  }
  if (!kb._keys[binds.skill3]) kb._sk3Held = false;

  if (kb._keys[binds.switch] && !kb._switchHeld) {
    kb._switchHeld = true;
    window._partyManager?.switchNext?.();
  }
  if (!kb._keys[binds.switch]) kb._switchHeld = false;
    }
    if (_triggers) _triggers.update(_player.root.position);
    window._waypoints?.update(_player.root.position);
    _thirdCam.update(delta);
  }

  if (_skillSystem) _skillSystem.update(delta);
if (!window._dungeonManager?._active) {
  for (const e of _enemies) {
    if (e && typeof e.isDead === 'function') e.update(delta);
  }
}
  

  
  if (_combatSystem) _combatSystem.update(delta);
  updateRelics(delta);
  updateInfusionParticles(delta);
  for (const n of _npcs) n.update(timestamp * 0.001);

  _collectAccum += delta;
  if (_collectAccum >= COLLECT_CHECK) {
    _collectAccum = 0;
    _checkResourceProximity();
  }
_renderer.render(window._activeScene ?? _scene, _camera);
  
}

function _checkResourceProximity() {
  const pos = _getActivePosition();
  let found = null;
  let minDist = Infinity;

  for (const res of FOREST_RESOURCES) {
    if (res.depleted) continue;
    const d = pos.distanceTo(res.position);
    if (d < COLLECT_RANGE && d < minDist) {
      minDist = d;
      found   = res;
    }
  }

  if (found !== _nearResource) {
    _nearResource = found;
    if (_onResourceNear) _onResourceNear(found);
  }
}

function _animateScene(timestamp) {
  const t = timestamp * 0.001;



  if (!window._dungeonManager?._active) {
    const particles = _scene.getObjectByName('ambient_particles');
    if (particles) {
      const pos = particles.geometry.attributes.position;
      for (let i = 0; i < pos.count; i++) {
        pos.setY(i, pos.getY(i) + 0.004);
        if (pos.getY(i) > 10) pos.setY(i, 0);
      }
      pos.needsUpdate = true;
    }
  }
}

function _updateFPS(delta) {
  _fpsFrames++;
  _fpsAccum += delta;
  if (_fpsAccum >= 0.5 && _fpsEl) {
    _fpsEl.textContent = Math.round(_fpsFrames / _fpsAccum) + ' FPS';
    _fpsFrames = 0;
    _fpsAccum  = 0;
  }
}

export function stopLoop()             { _running = false; }
export function getPlayer()            { return _player; }
export function setSkillSystem(s)      { _skillSystem = s; }
export function setCombatSystem(c)     { _combatSystem = c; }
export function setEnemies(list)       { _enemies = list; }
export function setNPCs(list)          { _npcs = list; }
export function setDialogueUI(ui)      { _dialogueUI = ui; }
export function setTriggers(t)         { _triggers = t; }
export function setResourceCallback(fn){ _onResourceNear = fn; }
