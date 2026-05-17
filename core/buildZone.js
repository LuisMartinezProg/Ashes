// core/buildZone.js — Zona de construcción elegida por el jugador
// Ashes of the Reborn | Valiant Gaming

import * as THREE from 'three';

const RADIUS_TIERS = [
  { rep:    0, radius:  8 },
  { rep:   50, radius: 12 },
  { rep:  150, radius: 18 },
  { rep:  300, radius: 26 },
  { rep:  600, radius: 36 },
  { rep: 1000, radius: 48 },
];

export class BuildZone {
  constructor(scene) {
    this._scene      = scene;
    this._center     = null;
    this._radius     = 8;
    this._border     = null;
    this._grid       = null;
    this._flag       = null;
    this._previewFlag   = null;
    this._previewCircle = null;
    this._choosing   = false;
    this._onChosen   = null;
    this._prog       = null;
    this._choosingUI = null;

    this._loadFromStorage();
  }

  // ── Progresión ───────────────────────────────────────────────────────────

  setProgression(prog) {
    this._prog = prog;
    prog.onReputationGain = () => this._updateRadius();
    this._updateRadius();
  }

  _updateRadius() {
    const rep = this._prog ? this._prog.getReputation() : 0;
    let radius = RADIUS_TIERS[0].radius;
    for (const tier of RADIUS_TIERS) {
      if (rep >= tier.rep) radius = tier.radius;
    }
    if (radius !== this._radius) {
      this._radius = radius;
      if (this._center) this._rebuildMarker();
      this._showRadiusNotification(radius);
    }
  }

  // ── API pública ──────────────────────────────────────────────────────────

  getRadius() { return this._radius; }
  hasZone()   { return this._center !== null; }
  getCenter() { return this._center ? { ...this._center } : null; }

  isInsideZone(x, z) {
    if (!this._center) return false;
    const dx = x - this._center.x;
    const dz = z - this._center.z;
    return Math.sqrt(dx * dx + dz * dz) <= this._radius;
  }

  // ── Colocar bandera ──────────────────────────────────────────────────────

  startChoosing(playerPos, onChosen) {
    if (this._center) return;
    this._choosing = true;
    this._onChosen = onChosen;
    const cx = Math.max(-50, Math.min(50, playerPos.x));
    const cz = Math.max(-20, Math.min(60, playerPos.z));
    this._showPreview(cx, cz);
    this._showChoosingUI();
  }

  movePreview(dx, dz) {
    if (!this._choosing || !this._previewFlag) return;
    const nx = Math.max(-50, Math.min(50, this._previewFlag.position.x + dx));
    const nz = Math.max(-20, Math.min(60, this._previewFlag.position.z + dz));
    this._setPreviewPos(nx, nz);
  }

  confirmZone() {
    if (!this._choosing || !this._previewFlag) return;
    this._center = {
      x: this._previewFlag.position.x,
      z: this._previewFlag.position.z,
    };
    this._choosing = false;
    this._hideChoosingUI();
    this._removePreview();
    this._buildFlag();
    this._buildMarker();
    this._saveToStorage();
    if (this._onChosen) this._onChosen(this._center);
    console.log('[BuildZone] Zona confirmada:', this._center);
  }

  cancelChoosing() {
    if (!this._choosing) return;
    this._choosing = false;
    this._hideChoosingUI();
    this._removePreview();
  }

  // ── Preview ──────────────────────────────────────────────────────────────

  _showPreview(cx, cz) {
    this._removePreview();

    this._previewFlag = this._createFlagMesh(0x88ccff, 0.5);
    this._previewFlag.position.set(cx, 0, cz);
    this._scene.add(this._previewFlag);

    this._previewCircle = this._createCircleMesh(this._radius, 0x44aaff, 0.15);
    this._previewCircle.position.set(cx, 0.05, cz);
    this._scene.add(this._previewCircle);
  }

  _setPreviewPos(x, z) {
    if (this._previewFlag)   this._previewFlag.position.set(x, 0, z);
    if (this._previewCircle) this._previewCircle.position.set(x, 0.05, z);
  }

  _removePreview() {
    if (this._previewFlag)   { this._scene.remove(this._previewFlag);   this._previewFlag   = null; }
    if (this._previewCircle) { this._scene.remove(this._previewCircle); this._previewCircle = null; }
  }

  // ── Bandera permanente ───────────────────────────────────────────────────

  _buildFlag() {
    if (this._flag) this._scene.remove(this._flag);
    this._flag = this._createFlagMesh(0xc9a84c, 1.0);
    this._flag.position.set(this._center.x, 0, this._center.z);
    this._scene.add(this._flag);
  }

  _createFlagMesh(color, opacity) {
    const group = new THREE.Group();

    const poleGeo = new THREE.CylinderGeometry(0.05, 0.05, 2.5, 8);
    const poleMat = new THREE.MeshLambertMaterial({ color: 0x8B6340 });
    const pole    = new THREE.Mesh(poleGeo, poleMat);
    pole.position.y = 1.25;
    group.add(pole);

    const flagGeo = new THREE.PlaneGeometry(0.8, 0.5);
    const flagMat = new THREE.MeshBasicMaterial({
      color, transparent: true, opacity, side: THREE.DoubleSide,
    });
    const flag = new THREE.Mesh(flagGeo, flagMat);
    flag.position.set(0.4, 2.2, 0);
    group.add(flag);

    return group;
  }

  // ── Marcador circular ────────────────────────────────────────────────────

  _buildMarker() {
    if (this._border) this._scene.remove(this._border);
    if (this._grid)   this._scene.remove(this._grid);

    const { x, z } = this._center;

    this._border = this._createCircleMesh(this._radius, 0x336688, 0.35);
    this._border.position.set(x, 0.06, z);
    this._scene.add(this._border);

    const grid = new THREE.GridHelper(
      this._radius * 2,
      Math.floor(this._radius),
      0x224455, 0x224455
    );
    grid.position.set(x, 0.05, z);
    grid.material.opacity     = 0.12;
    grid.material.transparent = true;
    this._grid = grid;
    this._scene.add(this._grid);
  }

  _rebuildMarker() { this._buildMarker(); }

  _createCircleMesh(radius, color, opacity) {
    const geo = new THREE.CircleGeometry(radius, 64);
    const mat = new THREE.MeshBasicMaterial({
      color, transparent: true, opacity,
      side: THREE.DoubleSide, depthWrite: false,
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.rotation.x = -Math.PI / 2;
    return mesh;
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
    label.textContent = 'ELIGE DÓNDE CLAVAR TU BANDERA';

    const dpad = document.createElement('div');
    Object.assign(dpad.style, {
      display             : 'grid',
      gridTemplateColumns : 'repeat(3, 44px)',
      gridTemplateRows    : 'repeat(3, 44px)',
      gap                 : '4px',
    });

    const dirs = [
      { label:'↖', dx:-2, dz:-2, col:1, row:1 },
      { label:'↑', dx: 0, dz:-2, col:2, row:1 },
      { label:'↗', dx: 2, dz:-2, col:3, row:1 },
      { label:'←', dx:-2, dz: 0, col:1, row:2 },
      { label:'·', dx: 0, dz: 0, col:2, row:2 },
      { label:'→', dx: 2, dz: 0, col:3, row:2 },
      { label:'↙', dx:-2, dz: 2, col:1, row:3 },
      { label:'↓', dx: 0, dz: 2, col:2, row:3 },
      { label:'↘', dx: 2, dz: 2, col:3, row:3 },
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

    const btnRow = document.createElement('div');
    Object.assign(btnRow.style, { display: 'flex', gap: '12px' });

    const confirmBtn = document.createElement('button');
    confirmBtn.textContent = '🚩 CLAVAR BANDERA';
    Object.assign(confirmBtn.style, {
      padding      : '10px 20px',
      borderRadius : '8px',
      border       : '1px solid rgba(46,204,113,0.5)',
      background   : 'rgba(10,8,20,0.88)',
      color        : '#2ecc71',
      fontFamily   : 'monospace',
      fontSize     : '11px',
      letterSpacing: '1px',
      cursor       : 'pointer',
      pointerEvents: 'all',
      WebkitTapHighlightColor: 'transparent',
    });
    confirmBtn.addEventListener('touchstart', (e) => { e.preventDefault(); this.confirmZone(); }, { passive: false });
    confirmBtn.addEventListener('click', () => this.confirmZone());

    const cancelBtn = document.createElement('button');
    cancelBtn.textContent = '✕ CANCELAR';
    Object.assign(cancelBtn.style, {
      padding      : '10px 20px',
      borderRadius : '8px',
      border       : '1px solid rgba(231,76,60,0.4)',
      background   : 'rgba(10,8,20,0.88)',
      color        : '#e74c3c',
      fontFamily   : 'monospace',
      fontSize     : '11px',
      letterSpacing: '1px',
      cursor       : 'pointer',
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
    if (this._choosingUI) { this._choosingUI.remove(); this._choosingUI = null; }
  }

  // ── Notificación ─────────────────────────────────────────────────────────

  _showRadiusNotification(radius) {
    const el = document.createElement('div');
    Object.assign(el.style, {
      position     : 'fixed',
      top          : '20%',
      left         : '50%',
      transform    : 'translateX(-50%)',
      fontFamily   : "'Cinzel',serif",
      fontSize     : '11px',
      letterSpacing: '3px',
      color        : '#c9a84c',
      background   : 'rgba(4,4,10,0.95)',
      border       : '1px solid rgba(201,168,76,0.5)',
      borderRadius : '8px',
      padding      : '14px 28px',
      zIndex       : '600',
      pointerEvents: 'none',
      textAlign    : 'center',
    });
    el.innerHTML = `🚩 ZONA EXPANDIDA<br><span style="font-size:10px;color:#8a6f2e;">Radio: ${radius} unidades</span>`;
    document.body.appendChild(el);
    setTimeout(() => {
      el.style.transition = 'opacity 0.8s';
      el.style.opacity    = '0';
      setTimeout(() => el.remove(), 800);
    }, 3000);
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
      if (this._center) {
        this._buildFlag();
        this._buildMarker();
      }
    } catch(e) {}
  }
               }
