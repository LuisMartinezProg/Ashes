import * as THREE          from 'three';
import { Player }          from './player.js';
import { VirtualJoystick } from './joystick.js';
import { ThirdPersonCamera } from './camera.js';

const FRAME_CAP = 1 / 20;

let _scene, _camera, _renderer;
let _player, _joystick, _thirdCam, _skillSystem, _combatSystem, _enemies = [];
let _lastTime = 0;
let _running  = false;
let _npcs = [], _dialogueUI = null;
let _fpsFrames = 0;
let _fpsAccum  = 0;
const _fpsEl   = document.getElementById('fps');

export function startLoop(scene, camera, renderer) {
  _scene    = scene;
  _camera   = camera;
  _renderer = renderer;

  const placeholder = scene.getObjectByName('player_placeholder');
  if (placeholder) scene.remove(placeholder);

  _player   = new Player(scene);
  _joystick = new VirtualJoystick();
  _thirdCam = new ThirdPersonCamera(camera, _player);

  _running  = true;
  _lastTime = performance.now();
  requestAnimationFrame(_tick);
}

function _tick(timestamp) {
  if (!_running) return;
  requestAnimationFrame(_tick);

  const delta = Math.min((timestamp - _lastTime) * 0.001, FRAME_CAP);
  _lastTime = timestamp;

  _updateFPS(delta);
  _animateScene(timestamp);

  const input = _joystick.getInput();
  _player.update(delta, input, _camera);
  _thirdCam.update(delta);
  if (_skillSystem) _skillSystem.update(delta);
  for (const e of _enemies) {
    if (e && typeof e.isDead === 'function') e.update(delta);
  }
  if (_combatSystem) _combatSystem.update(delta);
  for (const n of _npcs) n.update(timestamp * 0.001);

  _renderer.render(_scene, _camera);
}

function _animateScene(timestamp) {
  const t = timestamp * 0.001;

  const fireLight = _scene.userData.fireLight;
  const fireMesh  = _scene.userData.fireMesh;
  if (fireLight) {
    fireLight.intensity = 1.8 + Math.sin(t * 7.3) * 0.4 + Math.sin(t * 13.1) * 0.2;
  }
  if (fireMesh) {
    fireMesh.position.y = 0.5 + Math.sin(t * 9) * 0.04;
    fireMesh.scale.setScalar(1 + Math.sin(t * 11) * 0.08);
  }

  const particles = _scene.getObjectByName('ambient_particles');
  if (particles) {
    particles.rotation.y = t * 0.015;
    const pos = particles.geometry.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      pos.setY(i, pos.getY(i) + 0.003);
      if (pos.getY(i) > 8) pos.setY(i, 0);
    }
    pos.needsUpdate = true;
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

export function stopLoop()  { _running = false; }
export function getPlayer() { return _player; }
export function setSkillSystem(s)  { _skillSystem = s; }
export function setCombatSystem(c) { _combatSystem = c; }
export function setEnemies(list)   { _enemies = list; }
export function setNPCs(list)        { _npcs = list; }
export function setDialogueUI(ui)    { _dialogueUI = ui; }
