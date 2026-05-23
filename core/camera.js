/**
 * camera.js — Cámara tercera persona
 * Ashes of the Reborn | Valiant Gaming
 */

import * as THREE from 'three';

const DEFAULT_DISTANCE  = 7.0;
const DEFAULT_ELEVATION = 0.38;
const MIN_ELEVATION     = 0.08;
const MAX_ELEVATION     = 1.1;
const LERP_POSITION     = 6.0;
const LERP_LOOKAT       = 8.0;
const ROTATION_SENS     = 0.008;

export class ThirdPersonCamera {
  constructor(camera, player) {
    this.camera  = camera;
    this._target = player;

    this.azimuth   = Math.PI;
    this.elevation = DEFAULT_ELEVATION;
    this.distance  = DEFAULT_DISTANCE;

    this._lookTarget = new THREE.Vector3();
    this._idealPos   = new THREE.Vector3();

    this._dragActive  = false;
    this._dragLastX   = 0;
    this._dragLastY   = 0;

    this._bindEvents();
    this._snapToPlayer();
  }

  setTarget(character) {
    this._target = character;
    this._snapToPlayer();
  }

  _bindEvents() {
    window.addEventListener('touchstart',  this._onTouchStart.bind(this),  { passive: false });
    window.addEventListener('touchmove',   this._onTouchMove.bind(this),   { passive: false });
    window.addEventListener('touchend',    this._onTouchEnd.bind(this),    { passive: false });
    window.addEventListener('touchcancel', this._onTouchEnd.bind(this),    { passive: false });
    window.addEventListener('mousedown',   this._onMouseDown.bind(this));
    window.addEventListener('mousemove',   this._onMouseMove.bind(this));
    window.addEventListener('mouseup',     this._onMouseUp.bind(this));
  }

  _isRightSide(clientX) {
    return clientX > window.innerWidth * 0.5;
  }

  _onTouchStart(e) {
    if (this._dragActive) return;
    for (const t of e.changedTouches) {
      if (this._isRightSide(t.clientX)) {
        e.preventDefault();
        this._dragActive  = true;
        this._dragTouchId = t.identifier;
        this._dragLastX   = t.clientX;
        this._dragLastY   = t.clientY;
        break;
      }
    }
  }

  _onTouchMove(e) {
    if (!this._dragActive) return;
    for (const t of e.changedTouches) {
      if (t.identifier === this._dragTouchId) {
        e.preventDefault();
        const dx = t.clientX - this._dragLastX;
        const dy = t.clientY - this._dragLastY;
        this._dragLastX = t.clientX;
        this._dragLastY = t.clientY;
        this._applyDelta(dx, dy);
        break;
      }
    }
  }

  _onTouchEnd(e) {
    for (const t of e.changedTouches) {
      if (t.identifier === this._dragTouchId) {
        this._dragActive  = false;
        this._dragTouchId = null;
        break;
      }
    }
  }

  _onMouseDown(e) {
    if (!this._isRightSide(e.clientX)) return;
    this._dragActive = true;
    this._dragLastX  = e.clientX;
    this._dragLastY  = e.clientY;
  }

  _onMouseMove(e) {
    if (!this._dragActive) return;
    this._applyDelta(e.clientX - this._dragLastX, e.clientY - this._dragLastY);
    this._dragLastX = e.clientX;
    this._dragLastY = e.clientY;
  }

  _onMouseUp() { this._dragActive = false; }

  _applyDelta(dx, dy) {
    this.azimuth   -= dx * ROTATION_SENS;
    this.elevation += dy * ROTATION_SENS;
    this.elevation  = Math.max(MIN_ELEVATION, Math.min(MAX_ELEVATION, this.elevation));
  }

  _calcIdealPosition() {
    const target = this._target.chestPosition;
    const sinEl  = Math.sin(this.elevation);
    const cosEl  = Math.cos(this.elevation);
    this._idealPos.set(
      target.x + this.distance * cosEl * Math.sin(this.azimuth),
      target.y + this.distance * sinEl,
      target.z + this.distance * cosEl * Math.cos(this.azimuth)
    );
  }

  _snapToPlayer() {
    this._calcIdealPosition();
    this.camera.position.copy(this._idealPos);
    this._lookTarget.copy(this._target.chestPosition);
    this.camera.lookAt(this._lookTarget);
  }

  update(delta) {
    this._calcIdealPosition();
    this.camera.position.lerp(this._idealPos, Math.min(LERP_POSITION * delta, 1));
    this._lookTarget.lerp(this._target.chestPosition, Math.min(LERP_LOOKAT * delta, 1));
    this.camera.lookAt(this._lookTarget);
  }

  get azimuthAngle() { return this.azimuth; }

  destroy() {
    window.removeEventListener('touchstart',  this._onTouchStart);
    window.removeEventListener('touchmove',   this._onTouchMove);
    window.removeEventListener('touchend',    this._onTouchEnd);
    window.removeEventListener('touchcancel', this._onTouchEnd);
  }
}
