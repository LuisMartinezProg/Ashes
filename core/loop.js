/**
 * loop.js — Game loop principal (Fase 1)
 * Ashes of the Reborn | Valiant Gaming
 *
 * Recibe scene, camera, renderer desde game.html (igual que Fase 0).
 * Integra: Player | VirtualJoystick | ThirdPersonCamera
 */

import * as THREE          from 'three';
import { Player }          from './player.js';
import { VirtualJoystick } from './joystick.js';
import { ThirdPersonCamera } from './camera.js';

// ─── Config ──────────────────────────────────────────────────────────────────

const FRAME_CAP = 1 / 20; // delta máximo (evita saltos si la pestaña pierde foco)

// ─── Estado ──────────────────────────────────────────────────────────────────

let _scene, _camera, _renderer;
let _player, _joystick, _thirdCam, _skillSystem;
let _lastTime = 0;
let _running  = false;

// FPS
let _fpsFrames = 0;
let _fpsAccum  = 0;
const _fpsEl   = document.getElementById('fps');

// ─── startLoop ───────────────────────────────────────────────────────────────

/**
 * Llamado desde game.html después de que initScene() termina.
 * @param {THREE.Scene}              scene
 * @param {THREE.PerspectiveCamera}  camera
 * @param {THREE.WebGLRenderer}      renderer
 */
export function startLoop(scene, camera, renderer) {
  _scene    = scene;
  _camera   = camera;
  _renderer = renderer;

  // Quitar el placeholder de jugador que puso scene.js (Fase 0)
  const placeholder = scene.getObjectByName('player_placeholder');
  if (placeholder) scene.remove(placeholder);

  // Sistemas Fase 1
  _player   = new Player(scene);
  _joystick = new VirtualJoystick();
  _thirdCam = new ThirdPersonCamera(camera, _player);

  _running  = true;
  _lastTime = performance.now();
  requestAnimationFrame(_tick);
}

// ─── Loop ────────────────────────────────────────────────────────────────────

function _tick(timestamp) {
  if (!_running) return;
  requestAnimationFrame(_tick);

  const delta = Math.min((timestamp - _lastTime) * 0.001, FRAME_CAP);
  _lastTime = timestamp;

  _updateFPS(delta);
  _animateScene(timestamp);

  // ── Sistemas de Fase 1 ────────────────────────────────────────────────────
  const input = _joystick.getInput();
  _player.update(delta, input, _camera);
  _thirdCam.update(delta);
  if (_skillSystem) _skillSystem.update(delta);

  _renderer.render(_scene, _camera);
}

// ─── Animaciones de escena (fogata, partículas) ───────────────────────────────

function _animateScene(timestamp) {
  const t = timestamp * 0.001;

  // Fogata
  const fireLight = _scene.userData.fireLight;
  const fireMesh  = _scene.userData.fireMesh;
  if (fireLight) {
    fireLight.intensity = 1.8 + Math.sin(t * 7.3) * 0.4 + Math.sin(t * 13.1) * 0.2;
  }
  if (fireMesh) {
    fireMesh.position.y = 0.5 + Math.sin(t * 9) * 0.04;
    fireMesh.scale.setScalar(1 + Math.sin(t * 11) * 0.08);
  }

  // Partículas flotantes
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

// ─── FPS ─────────────────────────────────────────────────────────────────────

function _updateFPS(delta) {
  _fpsFrames++;
  _fpsAccum += delta;
  if (_fpsAccum >= 0.5 && _fpsEl) {
    _fpsEl.textContent = Math.round(_fpsFrames / _fpsAccum) + ' FPS';
    _fpsFrames = 0;
    _fpsAccum  = 0;
  }
}

// ─── API ─────────────────────────────────────────────────────────────────────

export function stopLoop()  { _running = false; }
export function getPlayer() { return _player; }
export function setSkillSystem(s) { _skillSystem = s; }
