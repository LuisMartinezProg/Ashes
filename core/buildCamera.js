// core/buildCamera.js — Cámara aérea para construcción
// Ashes of the Reborn | Valiant Gaming

import * as THREE from 'three';

const MIN_HEIGHT = 8;
const MAX_HEIGHT = 40;
const PAN_SPEED  = 0.05;
const ZOOM_SPEED = 2.0;

export class BuildCamera {
  constructor(camera, renderer) {
    this._camera   = camera;
    this._renderer = renderer;
    this._active   = false;

    this._target   = new THREE.Vector3(0, 0, 0);
    this._height   = 20;
    this._rotation = 0; // rotación horizontal de la vista

    this._touches      = {};
    this._lastPinchDist = null;
    this._lastPanX     = null;
    this._lastPanZ     = null;

    this._savedCamPos  = new THREE.Vector3();
    this._savedCamRot  = new THREE.Euler();

    this._btn = null;
    this._buildBtn();
    this._bindEvents();
  }

  // ── Botón 3D/2D ─────────────────────────────────────────────────────────

  _buildBtn() {
    this._btn = document.createElement('button');
    this._btn.textContent = '🗺 2D';
    Object.assign(this._btn.style, {
      position  : 'fixed',
      top       : '8px',
      right     : '54px',
      height    : '36px',
      padding   : '0 12px',
      borderRadius: '8px',
      border    : '1px solid rgba(201,168,76,0.4)',
      background: 'rgba(10,8,20,0.8)',
      color     : '#C9A84C',
      fontSize  : '12px',
      fontFamily: 'monospace',
      cursor    : 'pointer',
      pointerEvents: 'all',
      zIndex    : '150',
      display   : 'none',
      alignItems: 'center',
      justifyContent: 'center',
      letterSpacing: '1px',
      WebkitTapHighlightColor: 'transparent',
    });

    const toggle = (e) => {
      e.preventDefault();
      this._active ? this.deactivate() : this.activate();
    };
    this._btn.addEventListener('click', toggle);
    this._btn.addEventListener('touchstart', toggle, { passive: false });
    document.body.appendChild(this._btn);
  }

  showBtn() {
    this._btn.style.display = 'flex';
  }

  hideBtn() {
    this._btn.style.display = 'none';
    if (this._active) this.deactivate();
  }

  // ── Activar / Desactivar ─────────────────────────────────────────────────

  activate(centerPos) {
    if (this._active) return;
    this._active = true;

    // Guardar cámara actual
    this._savedCamPos.copy(this._camera.position);
    this._savedCamRot.copy(this._camera.rotation);

    // Centrar en posición dada o en target actual
    if (centerPos) this._target.set(centerPos.x, 0, centerPos.z);

    this._updateCameraPos();
    this._btn.textContent = '🎮 3D';
    this._btn.style.borderColor = 'rgba(100,200,255,0.6)';
    this._btn.style.color = '#88ccff';
  }

  deactivate() {
    if (!this._active) return;
    this._active = false;

    // Restaurar cámara
    this._camera.position.copy(this._savedCamPos);
    this._camera.rotation.copy(this._savedCamRot);

    this._btn.textContent = '🗺 2D';
    this._btn.style.borderColor = 'rgba(201,168,76,0.4)';
    this._btn.style.color = '#C9A84C';
  }

  isActive() { return this._active; }

  // ── Posición cámara ──────────────────────────────────────────────────────

  _updateCameraPos() {
    if (!this._active) return;
    this._camera.position.set(
      this._target.x,
      this._height,
      this._target.z
    );
    this._camera.lookAt(this._target);
  }

  // ── Zoom ─────────────────────────────────────────────────────────────────

  _zoom(delta) {
    this._height = Math.max(MIN_HEIGHT, Math.min(MAX_HEIGHT, this._height + delta));
    this._updateCameraPos();
  }

  // ── Pan ──────────────────────────────────────────────────────────────────

  _pan(dx, dz) {
    this._target.x += dx * PAN_SPEED * (this._height / 20);
    this._target.z += dz * PAN_SPEED * (this._height / 20);
    this._updateCameraPos();
  }

  // ── Eventos touch ────────────────────────────────────────────────────────

  _bindEvents() {
    const canvas = this._renderer.domElement;

    canvas.addEventListener('touchstart', (e) => {
      if (!this._active) return;
      for (const t of e.changedTouches) {
        this._touches[t.identifier] = { x: t.clientX, y: t.clientY };
      }
      this._lastPinchDist = null;
    }, { passive: true });

    canvas.addEventListener('touchmove', (e) => {
      if (!this._active) return;
      e.preventDefault();

      const ids = Object.keys(this._touches);

      if (e.touches.length === 2) {
        // Pellizco — zoom
        const t0 = e.touches[0];
        const t1 = e.touches[1];
        const dist = Math.hypot(t0.clientX - t1.clientX, t0.clientY - t1.clientY);

        if (this._lastPinchDist !== null) {
          const delta = (this._lastPinchDist - dist) * 0.1;
          this._zoom(delta);
        }
        this._lastPinchDist = dist;

        // Pan con centro del pellizco
        const cx = (t0.clientX + t1.clientX) / 2;
        const cy = (t0.clientY + t1.clientY) / 2;
        if (this._lastPanX !== null) {
          const dx = -(cx - this._lastPanX);
          const dz = -(cy - this._lastPanZ);
          this._pan(dx, dz);
        }
        this._lastPanX = cx;
        this._lastPanZ = cy;

      } else if (e.touches.length === 1) {
        // Pan con un dedo
        const t = e.touches[0];
        if (this._lastPanX !== null) {
          const dx = -(t.clientX - this._lastPanX);
          const dz = -(t.clientY - this._lastPanZ);
          this._pan(dx, dz);
        }
        this._lastPanX = t.clientX;
        this._lastPanZ = t.clientY;
        this._lastPinchDist = null;
      }

      // Actualizar touches
      for (const t of e.changedTouches) {
        this._touches[t.identifier] = { x: t.clientX, y: t.clientY };
      }
    }, { passive: false });

    canvas.addEventListener('touchend', (e) => {
      if (!this._active) return;
      for (const t of e.changedTouches) delete this._touches[t.identifier];
      if (Object.keys(this._touches).length === 0) {
        this._lastPanX = null;
        this._lastPanZ = null;
        this._lastPinchDist = null;
      }
    }, { passive: true });

    // Botones de zoom
    this._buildZoomBtns();
  }

  _buildZoomBtns() {
    const wrap = document.createElement('div');
    Object.assign(wrap.style, {
      position     : 'fixed',
      right        : '12px',
      top          : '50%',
      transform    : 'translateY(-50%)',
      display      : 'none',
      flexDirection: 'column',
      gap          : '8px',
      zIndex       : '155',
      pointerEvents: 'all',
    });

    [['＋', -ZOOM_SPEED], ['－', ZOOM_SPEED]].forEach(([label, delta]) => {
      const btn = document.createElement('button');
      btn.textContent = label;
      Object.assign(btn.style, {
        width    : '40px',
        height   : '40px',
        borderRadius: '50%',
        border   : '1px solid rgba(100,200,255,0.4)',
        background: 'rgba(10,8,20,0.88)',
        color    : '#88ccff',
        fontSize : '20px',
        cursor   : 'pointer',
        WebkitTapHighlightColor: 'transparent',
      });
      btn.addEventListener('touchstart', (e) => { e.preventDefault(); this._zoom(delta); }, { passive: false });
      btn.addEventListener('click', () => this._zoom(delta));
      wrap.appendChild(btn);
    });

    this._zoomWrap = wrap;
    document.body.appendChild(wrap);

    // Mostrar/ocultar con la cámara
    const origActivate   = this.activate.bind(this);
    const origDeactivate = this.deactivate.bind(this);

    this.activate = (pos) => {
      origActivate(pos);
      wrap.style.display = 'flex';
    };
    this.deactivate = () => {
      origDeactivate();
      wrap.style.display = 'none';
    };
  }

  // ── Rotar vista ──────────────────────────────────────────────────────────

  rotate(angleDeg) {
    this._rotation += angleDeg * Math.PI / 180;
    this._updateCameraPos();
  }

  // ── Getters ──────────────────────────────────────────────────────────────

  getTarget()   { return this._target.clone(); }
  getHeight()   { return this._height; }
  }
