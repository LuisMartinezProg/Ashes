/**
 * loop.js — Game loop principal (Fase 1)
 * Ashes of the Reborn | Valiant Gaming
 *
 * Integra: escena | player | joystick | cámara
 * Reemplaza la rotación demo de Fase 0.
 */

import { initScene }         from './scene.js';
import { Player }            from './player.js';
import { VirtualJoystick }   from './joystick.js';
import { ThirdPersonCamera } from './camera.js';

// ─── Config ──────────────────────────────────────────────────────────────────

const MAX_PIXEL_RATIO  = 2;
const SHADOW_MAP_SIZE  = 1024;
const TARGET_FPS       = 60;
const FRAME_CAP        = 1 / 20;   // delta máximo para evitar saltos grandes

// ─── Estado global del loop ──────────────────────────────────────────────────

let renderer, scene, camera;
let player, joystick, thirdPersonCamera;
let lastTime = 0;
let running  = false;

// FPS counter
let fpsFrames = 0;
let fpsAccum  = 0;
let fpsEl     = null;

// ─── Init ────────────────────────────────────────────────────────────────────

export function initLoop() {
  // Escena (devuelve { renderer, scene, camera })
  const result = initScene();
  renderer = result.renderer;
  scene    = result.scene;
  camera   = result.camera;

  // Renderer config de rendimiento
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, MAX_PIXEL_RATIO));
  renderer.shadowMap.enabled  = true;
  renderer.shadowMap.mapSize  = { width: SHADOW_MAP_SIZE, height: SHADOW_MAP_SIZE };

  // Sistemas Fase 1
  player            = new Player(scene);
  joystick          = new VirtualJoystick();
  thirdPersonCamera = new ThirdPersonCamera(camera, player);

  // FPS display
  _initFPSCounter();

  running = true;
  requestAnimationFrame(_tick);
}

// ─── Game loop ───────────────────────────────────────────────────────────────

function _tick(timestamp) {
  if (!running) return;
  requestAnimationFrame(_tick);

  // Delta time
  const delta = Math.min((timestamp - lastTime) * 0.001, FRAME_CAP);
  lastTime = timestamp;

  // FPS
  _updateFPS(delta);

  // ── Sistemas ──────────────────────────────────────────────────────────────
  const input = joystick.getInput();
  player.update(delta, input, camera);
  thirdPersonCamera.update(delta);

  // Render
  renderer.render(scene, camera);
}

// ─── FPS counter ─────────────────────────────────────────────────────────────

function _initFPSCounter() {
  fpsEl = document.createElement('div');
  Object.assign(fpsEl.style, {
    position:   'fixed',
    top:        '8px',
    right:      '8px',
    color:      'rgba(255,220,100,0.7)',
    fontFamily: 'monospace',
    fontSize:   '11px',
    zIndex:     '200',
    pointerEvents: 'none',
  });
  document.body.appendChild(fpsEl);
}

function _updateFPS(delta) {
  fpsFrames++;
  fpsAccum += delta;
  if (fpsAccum >= 0.5) {
    const fps = Math.round(fpsFrames / fpsAccum);
    fpsEl.textContent = `${fps} FPS`;
    fpsFrames = 0;
    fpsAccum  = 0;
  }
}

// ─── Control externo ─────────────────────────────────────────────────────────

export function stopLoop() {
  running = false;
}

export function getPlayer()  { return player; }
export function getCamera()  { return thirdPersonCamera; }
export function getScene()   { return scene; }
