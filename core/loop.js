// core/loop.js
import * as THREE          from 'three';
import { Player }          from './player.js';
import { VirtualJoystick } from './joystick.js';
import { ThirdPersonCamera } from './camera.js';
import { FOREST_RESOURCES, SCENE_ANIMATABLES } from './scene.js';

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
    const input = _joystick.getInput();

    if (window._partyManager) {
      window._partyManager.update(delta, input, _camera);
    } else {
      _player.update(delta, input, _camera);
    }

    window._setJoystick?.(input.dx, input.dy);

    if (_triggers) _triggers.update(_player.root.position);
    _thirdCam.update(delta);
  }

  if (_skillSystem) _skillSystem.update(delta);

  for (const e of _enemies) {
    if (e && typeof e.isDead === 'function') e.update(delta);
  }

  if (_combatSystem) _combatSystem.update(delta);

  for (const n of _npcs) n.update(timestamp * 0.001);

  _collectAccum += delta;
  if (_collectAccum >= COLLECT_CHECK) {
    _collectAccum = 0;
    _checkResourceProximity();
  }

  _renderer.render(_scene, _camera);
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

  for (const fn of SCENE_ANIMATABLES) fn(t);

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
