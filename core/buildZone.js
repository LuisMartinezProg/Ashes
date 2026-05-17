// core/buildZone.js — Zona de construcción elegida por el jugador
// Ashes of the Reborn | Valiant Gaming

import * as THREE from 'three';

const ZONE_SIZE    = 40; // tamaño de la zona en unidades
const ZONE_COLOR   = 0x44aaff;
const ZONE_OPACITY = 0.15;
const GRID_COLOR   = 0x2266aa;
const GRID_DIVS    = 20; // divisiones de la cuadrícula

export class BuildZone {
  constructor(scene) {
    this._scene    = scene;
    this._center   = null; // { x, z }
    this._mesh     = null; // plano visual
    this._grid     = null; // cuadrícula
    this._border   = null; // borde
    this._choosing = false;
    this._onChosen = null;

    this._loadFromStorage();
  }

  // ── API pública ──────────────────────────────────────────────────────────

  hasZone()   { return this._center !== null; }
  getCenter() { return this._center ? { ...this._center } : null; }
  getSize()   { return ZONE_SIZE; }

  isInsideZone(x, z) {
    if (!this._center) return false;
    const half = ZONE_SIZE / 2;
    return (
      x >= this._center.x - half &&
      x <= this._center.x + half &&
      z >= this._center.z - half &&
      z <= this._center.z + half
    );
  }

  // ── Elegir zona ──────────────────────────────────────────────────────────

  startChoosing(playerPos, onChosen) {
    this._choosing = true;
    this._onChosen = onChosen;

    // Centrar preview en el jugador (dentro de la planicie)
    const cx = Math.max(-30, Math.min(30, playerPos.x));
    const cz = Math.max(-10, Math.min(30, playerPos.z));

    this._showPreview(cx, cz);
    this._showChoosingUI();
  }

  movePreview(dx, dz) {
    if (!this._choosing || !this._mesh) return;
    const nx = Math.max(-30, Math.min(30, this._mesh.position.x + dx));
    const nz = Math.max(-10, Math.min(30, this._mesh.position.z + dz));
    this._setPreviewPos(nx, nz);
  }

  confirmZone() {
    if (!this._choosing || !this._mesh) return;
    this._center = {
      x: this._mesh.position.x,
      z: this._mesh.position.z,
    };
    this._choosing = false;
    this._hideChoosingUI();
    this._buildPermanentMarker();
    this._saveToStorage();
    if (this._onChosen) this._onChosen(this._center);
    console.log('[BuildZone] Zona elegida:', this._center);
  }

  cancelChoosing() {
    if (!this._choosing) return;
    this._choosing = false;
    this._hideChoosingUI();
    this._removePreview();
  }

  // ── Visual preview ───────────────────────────────────────────────────────

  _showPreview(cx, cz) {
    this._removePreview();

    // Plano semitransparente
    const geo = new THREE.PlaneGeometry(ZONE_SIZE, ZONE_SIZE);
    const mat = new THREE.MeshBasicMaterial({
      color      : ZONE_COLOR,
      transparent: true,
      opacity    : ZONE_OPACITY,
      side       : THREE.DoubleSide,
      depthWrite : false,
    });
    this._mesh = new THREE.Mesh(geo, mat);
    this._mesh.rotation.x = -Math.PI / 2;
    this._mesh.position.set(cx, 0.05, cz);
    this._scene.add(this._mesh);

    // Cuadrícula
    const gridHelper = new THREE.GridHelper(ZONE_SIZE, GRID_DIVS, GRID_COLOR, GRID_COLOR);
    gridHelper.position.set(cx, 0.06, cz);
    gridHelper.material.opacity    = 0.3;
    gridHelper.material.transparent = true;
    this._grid = gridHelper;
    this._scene.add(this._grid);

    // Borde
    const borderGeo = new THREE.EdgesGeometry(new THREE.BoxGeometry(ZONE_SIZE, 0.1, ZONE_SIZE));
    const borderMat = new THREE.LineBasicMaterial({ color: ZONE_COLOR, linewidth: 2 });
    this._border = new THREE.LineSegments(borderGeo, borderMat);
    this._border.position.set(cx, 0.1, cz);
    this._scene.add(this._border);
  }

  _setPreviewPos(x, z) {
    if (this._mesh)   this._mesh.position.set(x, 0.05, z);
    if (this._grid)   this._grid.position.set(x, 0.06, z);
    if (this._border) this._border.position.set(x, 0.1, z);
  }

  _removePreview() {
    [this._mesh, this._grid, this._border].forEach(obj => {
      if (obj) this._scene.remove(obj);
    });
    this._mesh = this._grid = this._border = null;
  }

  // ── Marcador permanente ──────────────────────────────────────────────────

  _buildPermanentMarker() {
    this._removePreview();
    const { x, z } = this._center;

    // Borde permanente sutil
    const borderGeo = new THREE.EdgesGeometry(new THREE.BoxGeometry(ZONE_SIZE, 0.1, ZONE_SIZE));
    const borderMat = new THREE.LineBasicMaterial({
      color      : 0x336688,
      transparent: true,
      opacity    : 0.4,
    });
    this._border = new THREE.LineSegments(borderGeo, borderMat);
    this._border.position.set(x, 0.08, z);
    this._scene.add(this._border);

    // Cuadrícula sutil permanente
    const grid = new THREE.GridHelper(ZONE_SIZE, GRID_DIVS, 0x224455, 0x224455);
    grid.position.set(x, 0.07, z);
    grid.material.opacity     = 0.15;
    grid.material.transparent = true;
    this._grid = grid;
    this._scene.add(this._grid);
  }

  // ── UI de elección ───────────────────────────────────────────────────────

  _showChoosingUI() {
    this._choosingUI = document.createElement('div');
    Object.assign(this._choosingUI.style, {
      position     : 'fixed',
      bottom       : '140px',
      left         : '50%',
      transform    : 'translateX(-50%)',
      display      : 'flex',
      flexDirection: 'column',
      alignItems   : 'center',
      gap          : '10px',
      zIndex       : '200',
      pointerEvents: 'all',
    });

    // Instrucción
    const label = document.createElement('div');
    Object.assign(label.style, {
      color        : '#88ccff',
      fontFamily   : 'monospace',
      fontSize     : '11px',
      letterSpacing: '2px',
      background   : 'rgba(10,8,20,0.9)',
      padding      : '8px 16px',
      borderRadius : '6px',
      border       : '1px solid rgba(100,200,255,0.3)',
    });
    label.textContent = 'MUEVE LA ZONA · USA VISTA 2D PARA ACOMODAR';

    // Botones DPAD para mover zona
    const dpad = document.createElement('div');
    Object.assign(dpad.style, {
      display             : 'grid',
      gridTemplateColumns : 'repeat(3, 44px)',
      gridTemplateRows    : 'repeat(3, 44px)',
      gap                 : '4px',
    });

    const dirs = [
      { label: '↖', dx: -2, dz: -2, col: 1, row: 1 },
      { label: '↑', dx:  0, dz: -2, col: 2, row: 1 },
      { label: '↗', dx:  2, dz: -2, col: 3, row: 1 },
      { label: '←', dx: -2, dz:  0, col: 1, row: 2 },
      { label: '·', dx:  0, dz:  0, col: 2, row: 2 },
      { label: '→', dx:  2, dz:  0, col: 3, row: 2 },
      { label: '↙', dx: -2, dz:  2, col: 1, row: 3 },
      { label: '↓', dx:  0, dz:  2, col: 2, row: 3 },
      { label: '↘', dx:  2, dz:  2, col: 3, row: 3 },
    ];

    dirs.forEach(d => {
      const btn = document.createElement('button');
      btn.textContent = d.label;
      Object.assign(btn.style, {
        gridColumn  : `${d.col}`,
        gridRow     : `${d.row}`,
        width       : '44px',
        height      : '44px',
        borderRadius: '8px',
        border      : '1px solid rgba(100,200,255,0.3)',
        background  : d.label === '·' ? 'transparent' : 'rgba(10,8,20,0.88)',
        color       : '#88ccff',
        fontSize    : '18px',
        cursor      : d.label === '·' ? 'default' : 'pointer',
        pointerEvents: d.label === '·' ? 'none' : 'all',
        WebkitTapHighlightColor: 'transparent',
      });
      if (d.label !== '·') {
        btn.addEventListener('touchstart', (e) => { e.preventDefault(); this.movePreview(d.dx, d.dz); }, { passive: false });
        btn.addEventListener('click', () => this.movePreview(d.dx, d.dz));
      }
      dpad.appendChild(btn);
    });

    // Botones confirmar / cancelar
    const btnRow = document.createElement('div');
    Object.assign(btnRow.style, { display: 'flex', gap: '12px' });

    const confirmBtn = document.createElement('button');
    confirmBtn.textContent = '✓ CONFIRMAR ZONA';
    Object.assign(confirmBtn.style, {
      padding    : '10px 20px',
      borderRadius: '8px',
      border     : '1px solid rgba(46,204,113,0.5)',
      background : 'rgba(10,8,20,0.88)',
      color      : '#2ecc71',
      fontFamily : 'monospace',
      fontSize   : '11px',
      letterSpacing: '1px',
      cursor     : 'pointer',
      pointerEvents: 'all',
      WebkitTapHighlightColor: 'transparent',
    });
    confirmBtn.addEventListener('touchstart', (e) => { e.preventDefault(); this.confirmZone(); }, { passive: false });
    confirmBtn.addEventListener('click', () => this.confirmZone());

    const cancelBtn = document.createElement('button');
    cancelBtn.textContent = '✕ CANCELAR';
    Object.assign(cancelBtn.style, {
      padding    : '10px 20px',
      borderRadius: '8px',
      border     : '1px solid rgba(231,76,60,0.4)',
      background : 'rgba(10,8,20,0.88)',
      color      : '#e74c3c',
      fontFamily : 'monospace',
      fontSize   : '11px',
      letterSpacing: '1px',
      cursor     : 'pointer',
      pointerEvents: 'all',
      WebkitTapHighlightColor: 'transparent',
    });
    cancelBtn.addEventListener('touchstart', (e) => { e.preventDefault(); this.cancelChoosing(); }, { passive: false });
    cancelBtn.addEventListener('click', () => this.cancelChoosing());

    btnRow.appendChild(confirmBtn);
    btnRow.appendChild(cancelBtn);

    this._choosingUI.appendChild(label);
    this._choosingUI.appendChild(dpad);
    this._choosingUI.appendChild(btnRow);
    document.body.appendChild(this._choosingUI);
  }

  _hideChoosingUI() {
    if (this._choosingUI) {
      this._choosingUI.remove();
      this._choosingUI = null;
    }
  }

  // ── Persistencia ─────────────────────────────────────────────────────────

  _saveToStorage() {
    try {
      localStorage.setItem('ashes_buildzone', JSON.stringify(this._center));
    } catch(e) {}
  }

  _loadFromStorage() {
    try {
      const raw = localStorage.getItem('ashes_buildzone');
      if (!raw) return;
      this._center = JSON.parse(raw);
      if (this._center) this._buildPermanentMarker();
    } catch(e) {}
  }
      }
