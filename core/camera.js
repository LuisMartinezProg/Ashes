/**
 * camera.js — Cámara en tercera persona que sigue al jugador
 * Ashes of the Reborn | Valiant Gaming
 *
 * - Offset configurable (detrás y arriba del jugador)
 * - Lerp suave para evitar cortes bruscos
 * - Zona táctil derecha para rotar la cámara (drag horizontal)
 * - Sin gimbal lock: usa ángulos esféricos
 */

import * as THREE from 'three';

// ─── Constantes ──────────────────────────────────────────────────────────────

const DEFAULT_DISTANCE  = 7.0;    // distancia al jugador
const DEFAULT_ELEVATION = 0.38;   // ángulo vertical (rad) — vista ligeramente picada
const MIN_ELEVATION     = 0.08;   // mínimo ángulo (casi horizontal)
const MAX_ELEVATION     = 1.1;    // máximo ángulo (casi cenital)
const LERP_POSITION     = 6.0;    // suavidad del seguimiento
const LERP_LOOKAT       = 8.0;    // suavidad del look-at
const ROTATION_SENS     = 0.005;  // sensibilidad del giro táctil

// ─── ThirdPersonCamera ───────────────────────────────────────────────────────

export class ThirdPersonCamera {
  /**
   * @param {THREE.PerspectiveCamera} camera  — cámara existente de la escena
   * @param {Player}                  player  — instancia de Player
   */
  constructor(camera, player) {
    this.camera = camera;
    this.player = player;

    // Ángulos esféricos
    this.azimuth   = Math.PI;       // horizontal (detrás del jugador al inicio)
    this.elevation = DEFAULT_ELEVATION;
    this.distance  = DEFAULT_DISTANCE;

    // Target suave del look-at
    this._lookTarget = new THREE.Vector3();

    // Posición ideal calculada
    this._idealPos   = new THREE.Vector3();

    // Estado del giro táctil
    this._dragActive  = false;
    this._dragTouchId = null;
    this._dragLastX   = 0;
    this._dragLastY   = 0;

    this._createTouchZone();
    this._bindEvents();

    // Snap inmediato al inicio (sin lerp)
    this._snapToPlayer();
  }

  // ─── Zona táctil derecha ─────────────────────────────────────────────────

  _createTouchZone() {
    this._zone = document.createElement('div');
    Object.assign(this._zone.style, {
      position:      'fixed',
      top:           '0',
      right:         '0',
      width:         '50%',
      height:        '100%',
      zIndex:        '100',
      touchAction:   'none',
      pointerEvents: 'auto',
    });
    document.body.appendChild(this._zone);
  }

  _bindEvents() {
    this._zone.addEventListener('touchstart',  this._onTouchStart.bind(this),  { passive: false });
    this._zone.addEventListener('touchmove',   this._onTouchMove.bind(this),   { passive: false });
    this._zone.addEventListener('touchend',    this._onTouchEnd.bind(this),    { passive: false });
    this._zone.addEventListener('touchcancel', this._onTouchEnd.bind(this),    { passive: false });

    // Soporte mouse en desktop (debug)
    this._zone.addEventListener('mousedown',   this._onMouseDown.bind(this));
    window.addEventListener('mousemove',       this._onMouseMove.bind(this));
    window.addEventListener('mouseup',         this._onMouseUp.bind(this));
  }

  // ─── Touch handlers ──────────────────────────────────────────────────────

  _onTouchStart(e) {
    e.preventDefault();
    if (this._dragActive) return;
    const t = e.changedTouches[0];
    this._dragActive  = true;
    this._dragTouchId = t.identifier;
    this._dragLastX   = t.clientX;
    this._dragLastY   = t.clientY;
  }

  _onTouchMove(e) {
    e.preventDefault();
    if (!this._dragActive) return;
    let t = null;
    for (const touch of e.changedTouches) {
      if (touch.identifier === this._dragTouchId) { t = touch; break; }
    }
    if (!t) return;

    const dx = t.clientX - this._dragLastX;
    const dy = t.clientY - this._dragLastY;
    this._dragLastX = t.clientX;
    this._dragLastY = t.clientY;

    this._applyDelta(dx, dy);
  }

  _onTouchEnd(e) {
    e.preventDefault();
    for (const t of e.changedTouches) {
      if (t.identifier === this._dragTouchId) {
        this._dragActive  = false;
        this._dragTouchId = null;
        break;
      }
    }
  }

  // ─── Mouse handlers (debug desktop) ─────────────────────────────────────

  _onMouseDown(e) {
    this._dragActive = true;
    this._dragLastX  = e.clientX;
    this._dragLastY  = e.clientY;
  }

  _onMouseMove(e) {
    if (!this._dragActive) return;
    const dx = e.clientX - this._dragLastX;
    const dy = e.clientY - this._dragLastY;
    this._dragLastX = e.clientX;
    this._dragLastY = e.clientY;
    this._applyDelta(dx, dy);
  }

  _onMouseUp() {
    this._dragActive = false;
  }

  // ─── Lógica de rotación ──────────────────────────────────────────────────

  _applyDelta(dx, dy) {
    this.azimuth   -= dx * ROTATION_SENS;
    this.elevation += dy * ROTATION_SENS;
    // Clampar elevación
    this.elevation = Math.max(MIN_ELEVATION, Math.min(MAX_ELEVATION, this.elevation));
  }

  // ─── Posición ideal en esfera ────────────────────────────────────────────

  _calcIdealPosition() {
    const target = this.player.chestPosition;
    // Coordenadas esféricas → cartesianas
    const sinEl = Math.sin(this.elevation);
    const cosEl = Math.cos(this.elevation);
    const x = target.x + this.distance * cosEl * Math.sin(this.azimuth);
    const y = target.y + this.distance * sinEl;
    const z = target.z + this.distance * cosEl * Math.cos(this.azimuth);
    this._idealPos.set(x, y, z);
  }

  _snapToPlayer() {
    this._calcIdealPosition();
    this.camera.position.copy(this._idealPos);
    this._lookTarget.copy(this.player.chestPosition);
    this.camera.lookAt(this._lookTarget);
  }

  // ─── Update (llamado cada frame) ─────────────────────────────────────────

  /**
   * @param {number} delta — segundos desde el último frame
   */
  update(delta) {
    this._calcIdealPosition();

    // Lerp posición
    this.camera.position.lerp(this._idealPos, Math.min(LERP_POSITION * delta, 1));

    // Lerp look-at target hacia el pecho del jugador
    this._lookTarget.lerp(this.player.chestPosition, Math.min(LERP_LOOKAT * delta, 1));
    this.camera.lookAt(this._lookTarget);
  }

  // ─── Accessors ───────────────────────────────────────────────────────────

  /** Ángulo azimutal actual — útil para orientar el movimiento relativo a cámara */
  get azimuthAngle() {
    return this.azimuth;
  }

  destroy() {
    this._zone.remove();
  }
}
