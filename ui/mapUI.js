// ui/mapUI.js — Minimapa + Mapa completo
// Ashes of the Reborn | Valiant Gaming

export class MapUI {
  constructor(player) {
    this._player  = player;
    this._open    = false;
    this._minimap = null;
    this._fullmap = null;

    this._world = {
      minX: -60, maxX: 60,
      minZ: -80, maxZ: 100,
    };

    this._zones = [
      { label: 'Greymantle',   color: '#1A3A10', minZ: -80, maxZ: -40 },
      { label: 'Bosque claro', color: '#2A5A1A', minZ: -40, maxZ: -10 },
      { label: 'Planicie',     color: '#3A7A28', minZ: -10, maxZ:  30 },
      { label: 'Camino',       color: '#4A8A38', minZ:  30, maxZ:  60 },
      { label: 'Ironfell',     color: '#5A6A4A', minZ:  60, maxZ: 100 },
    ];

    this._dungeons = [
      { x:   0, z: -120, color: '#C9A84C', label: 'Mazmorra I'   },
      { x: -30, z: -160, color: '#44aaff', label: 'Mazmorra II'  },
      { x:  30, z: -200, color: '#9933ff', label: 'Mazmorra III' },
    ];

    this._pins = JSON.parse(localStorage.getItem('ashes_map_pins') || '[]');

    this._buildMinimap();
    this._buildFullmap();
  }

  // ── Helpers dinámicos ─────────────────────────────────────────────────────

  _getFlag() {
    const bz = window._buildZone;
    if (!bz?.hasZone?.()) return null;
    return bz.getZoneCenter?.() ?? null;
  }

  _getStructures() {
    const b = window._building;
    if (!b?._placed) return [];
    return b._placed;
  }

  _getNearEnemies() {
    const enemies = window._enemies ?? [];
    const pp = this._player?.root?.position;
    if (!pp) return [];
    return enemies.filter(e => {
      if (e.isDead?.() || !e.mesh) return false;
      const dx = e.mesh.position.x - pp.x;
      const dz = e.mesh.position.z - pp.z;
      return Math.sqrt(dx*dx + dz*dz) < 30;
    });
  }

  _getNPCs() {
    return window._npcs ?? [];
  }

  // ── Minimapa ──────────────────────────────────────────────────────────────

  _buildMinimap() {
    const size = Math.round(Math.min(window.innerWidth, window.innerHeight) * 0.18);

    this._minimap = document.createElement('canvas');
    this._minimap.width  = size;
    this._minimap.height = size;
    Object.assign(this._minimap.style, {
      position     : 'fixed',
      top          : '60px',
      left         : '10px',
      width        : `${size}px`,
      height       : `${size}px`,
      borderRadius : '8px',
      border       : '1px solid rgba(201,168,76,0.4)',
      zIndex       : '120',
      opacity      : '0.85',
      pointerEvents: 'all',
      cursor       : 'pointer',
    });

    this._minimap.addEventListener('click', () => this.toggle());
    this._minimap.addEventListener('touchstart', (e) => {
      e.preventDefault(); this.toggle();
    }, { passive: false });

    document.body.appendChild(this._minimap);
    this._drawMinimap();
  }

  _drawMinimap() {
    const canvas = this._minimap;
    const ctx    = canvas.getContext('2d');
    const w      = canvas.width;
    const h      = canvas.height;

    ctx.clearRect(0, 0, w, h);

    ctx.fillStyle = 'rgba(4,4,10,0.9)';
    ctx.beginPath();
    ctx.roundRect(0, 0, w, h, 8);
    ctx.fill();

    this._zones.forEach(zone => {
      const y1 = this._worldToMini(0, zone.minZ, w, h).y;
      const y2 = this._worldToMini(0, zone.maxZ, w, h).y;
      ctx.fillStyle = zone.color;
      ctx.fillRect(0, y2, w, y1 - y2);
    });

    ctx.fillStyle = 'rgba(40,120,40,0.6)';
    [
      [-12,-45],[10,-48],[-8,-55],[15,-50],[-18,-52],
      [5,-60],[-5,-62],[20,-58],[-22,-56],[12,-65],
      [-12,-20],[10,-18],[-8,-35],[15,-30],[-18,-28],
    ].forEach(([x, z]) => {
      const p = this._worldToMini(x, z, w, h);
      ctx.beginPath();
      ctx.arc(p.x, p.y, 1.5, 0, Math.PI * 2);
      ctx.fill();
    });

    const iron = this._worldToMini(0, 75, w, h);
    ctx.fillStyle = 'rgba(201,168,76,0.5)';
    ctx.fillRect(iron.x - 6, iron.y - 4, 12, 8);
    ctx.fillStyle = 'rgba(201,168,76,0.8)';
    ctx.font = `${Math.round(w * 0.07)}px monospace`;
    ctx.textAlign = 'center';
    ctx.fillText('?', iron.x, iron.y + 3);

    const flag = this._getFlag();
    if (flag) {
      const fp = this._worldToMini(flag.x, flag.z, w, h);
      ctx.font = `${Math.round(w * 0.12)}px monospace`;
      ctx.textAlign = 'center';
      ctx.fillText('🚩', fp.x, fp.y + 4);
    }

    this._getStructures().forEach(s => {
      if (!s.position) return;
      const p = this._worldToMini(s.position.x, s.position.z, w, h);
      ctx.fillStyle = 'rgba(201,168,76,0.7)';
      ctx.fillRect(p.x - 2, p.y - 2, 4, 4);
    });

    ctx.fillStyle = 'rgba(255,60,60,0.85)';
    this._getNearEnemies().forEach(e => {
      const p = this._worldToMini(e.mesh.position.x, e.mesh.position.z, w, h);
      ctx.beginPath();
      ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
      ctx.fill();
    });

    // Pins
    this._drawPins(ctx, w, h, true);

    if (this._player) {
      const pos = this._player.root.position;
      const p   = this._worldToMini(pos.x, pos.z, w, h);
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = 'rgba(201,168,76,0.9)';
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    ctx.fillStyle = 'rgba(201,168,76,0.5)';
    ctx.font = `${Math.round(w * 0.08)}px monospace`;
    ctx.textAlign = 'left';
    ctx.fillText('N', 4, 14);
  }

  _worldToMini(wx, wz, canvasW, canvasH) {
    const { minX, maxX, minZ, maxZ } = this._world;
    const x = ((wx - minX) / (maxX - minX)) * canvasW;
    const y = (1 - (wz - minZ) / (maxZ - minZ)) * canvasH;
    return { x, y };
  }

  // ── Mapa completo ─────────────────────────────────────────────────────────

  _buildFullmap() {
    this._fullmap = document.createElement('div');
    Object.assign(this._fullmap.style, {
      position      : 'fixed',
      inset         : '0',
      background    : 'rgba(4,4,10,0.97)',
      zIndex        : '500',
      display       : 'none',
      flexDirection : 'column',
      alignItems    : 'center',
      justifyContent: 'center',
      pointerEvents : 'all',
    });

    this._fullmap.innerHTML = `
      <div style="display:flex;align-items:center;justify-content:space-between;
           width:90%;max-width:500px;padding-bottom:12px;
           border-bottom:1px solid rgba(201,168,76,0.2);">
        <span style="font-family:'Cinzel',serif;font-size:11px;
             letter-spacing:4px;color:#c9a84c;">MAPA — SOLMARA</span>
        <div style="display:flex;gap:8px;align-items:center;">
          <button id="map-pin-btn"
            style="background:rgba(201,168,76,0.15);border:1px solid rgba(201,168,76,0.4);
            color:#c9a84c;font-size:10px;cursor:pointer;padding:4px 12px;
            border-radius:20px;font-family:monospace;letter-spacing:1px;">
            📍 Pin
          </button>
          <button id="map-close"
            style="background:none;border:1px solid rgba(201,168,76,0.3);
            color:#c9a84c;font-size:18px;cursor:pointer;
            width:34px;height:34px;border-radius:50%;
            display:flex;align-items:center;justify-content:center;">✕</button>
        </div>
      </div>
      <canvas id="map-canvas" style="margin-top:16px;border-radius:10px;
        border:1px solid rgba(201,168,76,0.25);"></canvas>
      <div id="map-legend"
        style="display:flex;gap:16px;margin-top:12px;flex-wrap:wrap;justify-content:center;">
      </div>
    `;

    document.body.appendChild(this._fullmap);

    this._fullmap.querySelector('#map-close').addEventListener('click', () => this.close());
    this._fullmap.querySelector('#map-close').addEventListener('touchstart', (e) => {
      e.preventDefault(); this.close();
    }, { passive: false });

    this._fullmap.querySelector('#map-pin-btn').addEventListener('click', () => this._openPinModal());
    this._fullmap.querySelector('#map-pin-btn').addEventListener('touchstart', (e) => {
      e.preventDefault(); this._openPinModal();
    }, { passive: false });

    this._drawFullmap();
  }

  _drawFullmap() {
    const canvas = this._fullmap.querySelector('#map-canvas');
    const size   = Math.round(Math.min(window.innerWidth, window.innerHeight) * 0.75);
    canvas.width  = size;
    canvas.height = size;
    canvas.style.width  = `${size}px`;
    canvas.style.height = `${size}px`;

    const ctx = canvas.getContext('2d');
    const w   = size;
    const h   = size;

    this._zones.forEach(zone => {
      const y1 = this._worldToMap(0, zone.minZ, w, h).y;
      const y2 = this._worldToMap(0, zone.maxZ, w, h).y;
      ctx.fillStyle = zone.color;
      ctx.fillRect(0, y2, w, y1 - y2);
      const cy = (y1 + y2) / 2;
      ctx.fillStyle = 'rgba(255,255,255,0.25)';
      ctx.font = `${Math.round(w * 0.035)}px monospace`;
      ctx.textAlign = 'center';
      ctx.fillText(zone.label.toUpperCase(), w / 2, cy);
    });

    ctx.fillStyle = 'rgba(40,140,40,0.5)';
    [
      [-12,-45],[10,-48],[-8,-55],[15,-50],[-18,-52],
      [5,-60],[-5,-62],[20,-58],[-22,-56],[12,-65],
      [-12,-20],[10,-18],[-8,-35],[15,-30],
    ].forEach(([x, z]) => {
      const p = this._worldToMap(x, z, w, h);
      ctx.beginPath();
      ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
      ctx.fill();
    });

    ctx.strokeStyle = 'rgba(200,168,120,0.6)';
    ctx.lineWidth   = Math.round(w * 0.015);
    ctx.setLineDash([]);
    const pStart = this._worldToMap(0, -20, w, h);
    const pEnd   = this._worldToMap(0,  65, w, h);
    ctx.beginPath();
    ctx.moveTo(pStart.x, pStart.y);
    ctx.lineTo(pEnd.x,   pEnd.y);
    ctx.stroke();

    this._dungeons.forEach(d => {
      const p = this._worldToMap(d.x, d.z, w, h);
      if (p.y < 0 || p.y > h) return;
      ctx.fillStyle = d.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.6)';
      ctx.font = `${Math.round(w * 0.025)}px monospace`;
      ctx.textAlign = 'center';
      ctx.fillText(d.label, p.x, p.y - 9);
    });

    const iron = this._worldToMap(0, 75, w, h);
    const ironfellDiscovered = window._prog?.getFlag?.('ironfell_desbloqueada');
    if (ironfellDiscovered) {
      ctx.fillStyle = 'rgba(201,168,76,0.7)';
      ctx.fillRect(iron.x - 20, iron.y - 14, 40, 28);
      ctx.fillStyle = '#c9a84c';
      ctx.font = `bold ${Math.round(w * 0.04)}px monospace`;
      ctx.textAlign = 'center';
      ctx.fillText('IRONFELL', iron.x, iron.y + 5);
    } else {
      ctx.fillStyle = 'rgba(100,100,100,0.4)';
      ctx.fillRect(iron.x - 20, iron.y - 14, 40, 28);
      ctx.fillStyle = 'rgba(200,200,200,0.5)';
      ctx.font = `${Math.round(w * 0.06)}px monospace`;
      ctx.textAlign = 'center';
      ctx.fillText('?', iron.x, iron.y + 8);
    }

    const flag = this._getFlag();
    if (flag) {
      const fp = this._worldToMap(flag.x, flag.z, w, h);
      ctx.font = `${Math.round(w * 0.05)}px monospace`;
      ctx.textAlign = 'center';
      ctx.fillText('🚩', fp.x, fp.y);
      ctx.fillStyle = 'rgba(201,168,76,0.7)';
      ctx.font = `${Math.round(w * 0.025)}px monospace`;
      ctx.fillText('Base', fp.x, fp.y + 14);
    }

    this._getStructures().forEach(s => {
      if (!s.position) return;
      const p = this._worldToMap(s.position.x, s.position.z, w, h);
      ctx.fillStyle = 'rgba(201,168,76,0.8)';
      ctx.strokeStyle = 'rgba(201,168,76,0.4)';
      ctx.lineWidth = 1;
      ctx.fillRect(p.x - 3, p.y - 3, 6, 6);
      ctx.strokeRect(p.x - 3, p.y - 3, 6, 6);
    });

    ctx.fillStyle = 'rgba(100,200,255,0.85)';
    this._getNPCs().forEach(npc => {
      if (!npc.mesh) return;
      const p = this._worldToMap(npc.mesh.position.x, npc.mesh.position.z, w, h);
      ctx.beginPath();
      ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
      ctx.fill();
    });

    ctx.fillStyle = 'rgba(255,60,60,0.85)';
    this._getNearEnemies().forEach(e => {
      const p = this._worldToMap(e.mesh.position.x, e.mesh.position.z, w, h);
      ctx.beginPath();
      ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
      ctx.fill();
    });

    // Pins
    this._drawPins(ctx, w, h, false);

    if (this._player) {
      const pos = this._player.root.position;
      const p   = this._worldToMap(pos.x, pos.z, w, h);
      ctx.strokeStyle = 'rgba(255,255,255,0.3)';
      ctx.lineWidth   = 2;
      ctx.beginPath();
      ctx.arc(p.x, p.y, 10, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(p.x, p.y, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#c9a84c';
      ctx.lineWidth   = 2;
      ctx.stroke();
    }

    ctx.fillStyle = 'rgba(201,168,76,0.7)';
    ctx.font = `bold ${Math.round(w * 0.05)}px monospace`;
    ctx.textAlign = 'left';
    ctx.fillText('↑ N', 10, 30);

    const legend = this._fullmap.querySelector('#map-legend');
    if (legend) {
      legend.innerHTML = [
        ...this._zones.map(z => `
          <div style="display:flex;align-items:center;gap:6px;">
            <div style="width:12px;height:12px;border-radius:2px;background:${z.color};
                 border:1px solid rgba(255,255,255,0.2);"></div>
            <span style="font-family:monospace;font-size:9px;
                 letter-spacing:2px;color:#8a7a5a;">${z.label.toUpperCase()}</span>
          </div>
        `),
        `<div style="display:flex;align-items:center;gap:6px;">
          <div style="width:12px;height:12px;border-radius:50%;background:#fff;"></div>
          <span style="font-family:monospace;font-size:9px;letter-spacing:2px;color:#8a7a5a;">JUGADOR</span>
        </div>`,
        `<div style="display:flex;align-items:center;gap:6px;">
          <div style="width:12px;height:12px;border-radius:50%;background:rgba(255,60,60,0.85);"></div>
          <span style="font-family:monospace;font-size:9px;letter-spacing:2px;color:#8a7a5a;">ENEMIGOS</span>
        </div>`,
        `<div style="display:flex;align-items:center;gap:6px;">
          <div style="width:12px;height:12px;border-radius:50%;background:rgba(100,200,255,0.85);"></div>
          <span style="font-family:monospace;font-size:9px;letter-spacing:2px;color:#8a7a5a;">NPCs</span>
        </div>`,
        `<div style="display:flex;align-items:center;gap:6px;">
          <div style="width:12px;height:12px;background:rgba(201,168,76,0.8);border:1px solid rgba(201,168,76,0.4);"></div>
          <span style="font-family:monospace;font-size:9px;letter-spacing:2px;color:#8a7a5a;">ESTRUCTURAS</span>
        </div>`,
        `<div style="display:flex;align-items:center;gap:6px;">
          <span style="font-size:12px;">📍</span>
          <span style="font-family:monospace;font-size:9px;letter-spacing:2px;color:#8a7a5a;">PINS</span>
        </div>`,
      ].join('');
    }
  }

  _worldToMap(wx, wz, canvasW, canvasH) {
    const { minX, maxX, minZ, maxZ } = this._world;
    const x = ((wx - minX) / (maxX - minX)) * canvasW;
    const y = (1 - (wz - minZ) / (maxZ - minZ)) * canvasH;
    return { x, y };
  }

  // ── Pins ──────────────────────────────────────────────────────────────────

  _savePins() {
    localStorage.setItem('ashes_map_pins', JSON.stringify(this._pins));
  }

  _drawPins(ctx, w, h, isMini = false) {
    this._pins.forEach(pin => {
      const p = isMini
        ? this._worldToMini(pin.x, pin.z, w, h)
        : this._worldToMap(pin.x, pin.z, w, h);

      if (isMini) {
        ctx.font = `${Math.round(w * 0.1)}px monospace`;
        ctx.textAlign = 'center';
        ctx.fillText(pin.icon, p.x, p.y + 4);
      } else {
        ctx.font = `${Math.round(w * 0.04)}px monospace`;
        ctx.textAlign = 'center';
        ctx.fillText(pin.icon, p.x, p.y);
        ctx.fillStyle = pin.color;
        ctx.font = `${Math.round(w * 0.022)}px monospace`;
        ctx.fillText(pin.label, p.x, p.y + 14);
      }
    });
  }

  _openPinModal() {
    const existing = document.getElementById('pin-modal');
    if (existing) existing.remove();

    const pos = this._player?.root?.position;
    if (!pos) return;

    const PIN_TYPES = [
      { icon: '🏠', label: 'Refugio',      color: '#44aa88' },
      { icon: '⚔️', label: 'Combate',      color: '#ff4444' },
      { icon: '🏪', label: 'Comercio',     color: '#ffaa44' },
      { icon: '⛏️', label: 'Recursos',     color: '#aaaaff' },
      { icon: '🏛️', label: 'Monumento',    color: '#ffcc44' },
      { icon: '🚩', label: 'Base',         color: '#C9A84C' },
      { icon: '⚠️', label: 'Peligro',      color: '#ff6622' },
      { icon: '🔮', label: 'Lugar mágico', color: '#cc44ff' },
    ];

    let selectedType = PIN_TYPES[0];

    const modal = document.createElement('div');
    modal.id = 'pin-modal';
    Object.assign(modal.style, {
      position      : 'fixed',
      inset         : '0',
      background    : 'rgba(0,0,0,0.75)',
      zIndex        : '600',
      display       : 'flex',
      alignItems    : 'center',
      justifyContent: 'center',
      backdropFilter: 'blur(4px)',
    });

    const box = document.createElement('div');
    Object.assign(box.style, {
      background   : 'rgba(8,6,20,0.98)',
      border       : '1px solid rgba(201,168,76,0.3)',
      borderRadius : '14px',
      padding      : '18px',
      width        : '90vw',
      maxWidth     : '340px',
      fontFamily   : 'monospace',
      display      : 'flex',
      flexDirection: 'column',
      gap          : '12px',
    });

    const title = document.createElement('div');
    title.textContent = 'COLOCAR PIN';
    title.style.cssText = 'font-size:10px;color:#c9a84c;letter-spacing:3px;text-align:center;';
    box.appendChild(title);

    const coords = document.createElement('div');
    coords.textContent = `Posición: ${Math.round(pos.x)}, ${Math.round(pos.z)}`;
    coords.style.cssText = 'font-size:9px;color:#555577;text-align:center;';
    box.appendChild(coords);

    const typesGrid = document.createElement('div');
    typesGrid.style.cssText = 'display:grid;grid-template-columns:repeat(4,1fr);gap:6px;';

    PIN_TYPES.forEach(type => {
      const btn = document.createElement('button');
      btn.style.cssText = `
        background:rgba(10,8,24,0.9);
        border:2px solid rgba(255,255,255,0.08);
        border-radius:8px;padding:6px 2px;
        display:flex;flex-direction:column;align-items:center;gap:2px;
        cursor:pointer;WebkitTapHighlightColor:transparent;
        transition:border-color 0.1s;
      `;
      btn.innerHTML = `
        <div style="font-size:18px;">${type.icon}</div>
        <div style="font-size:7px;color:#666688;letter-spacing:0.5px;">${type.label}</div>
      `;
      const select = (e) => {
        e.preventDefault();
        selectedType = type;
        typesGrid.querySelectorAll('button').forEach(b => {
          b.style.borderColor = 'rgba(255,255,255,0.08)';
        });
        btn.style.borderColor = type.color;
      };
      btn.addEventListener('touchstart', select, { passive: false });
      btn.addEventListener('click', select);
      typesGrid.appendChild(btn);
    });

    typesGrid.querySelector('button').style.borderColor = PIN_TYPES[0].color;
    box.appendChild(typesGrid);

    const input = document.createElement('input');
    Object.assign(input.style, {
      background   : 'rgba(255,255,255,0.05)',
      border       : '1px solid rgba(201,168,76,0.3)',
      borderRadius : '8px',
      color        : '#ffffff',
      fontFamily   : 'monospace',
      fontSize     : '11px',
      padding      : '8px 10px',
      outline      : 'none',
      letterSpacing: '1px',
    });
    input.placeholder = 'Nombre del lugar...';
    input.maxLength   = 24;
    box.appendChild(input);

    const btnRow = document.createElement('div');
    btnRow.style.cssText = 'display:flex;gap:8px;';

    const cancelBtn = document.createElement('button');
    cancelBtn.textContent = 'Cancelar';
    cancelBtn.style.cssText = `
      flex:1;background:transparent;
      border:1px solid rgba(255,255,255,0.08);
      color:#555577;padding:7px;border-radius:8px;
      cursor:pointer;font-family:monospace;font-size:10px;
    `;
    const onCancel = (e) => { e.preventDefault(); modal.remove(); };
    cancelBtn.addEventListener('touchstart', onCancel, { passive: false });
    cancelBtn.addEventListener('click', onCancel);

    const confirmBtn = document.createElement('button');
    confirmBtn.textContent = 'Colocar';
    confirmBtn.style.cssText = `
      flex:1;background:rgba(201,168,76,0.15);
      border:1px solid rgba(201,168,76,0.4);
      color:#c9a84c;padding:7px;border-radius:8px;
      cursor:pointer;font-family:monospace;font-size:10px;
      letter-spacing:1px;
    `;
    const onConfirm = (e) => {
      e.preventDefault();
      const name = input.value.trim() || selectedType.label;
      this._pins.push({
        x    : pos.x,
        z    : pos.z,
        icon : selectedType.icon,
        color: selectedType.color,
        label: name,
      });
      this._savePins();
      modal.remove();
      this._drawFullmap();
      this._drawMinimap();
    };
    confirmBtn.addEventListener('touchstart', onConfirm, { passive: false });
    confirmBtn.addEventListener('click', onConfirm);

    btnRow.appendChild(cancelBtn);
    btnRow.appendChild(confirmBtn);
    box.appendChild(btnRow);

    modal.appendChild(box);
    modal.addEventListener('click', (e) => { if (e.target === modal) modal.remove(); });
    document.body.appendChild(modal);
    setTimeout(() => input.focus(), 100);
  }

  _removePin(idx) {
    this._pins.splice(idx, 1);
    this._savePins();
    this._drawFullmap();
    this._drawMinimap();
  }

  // ── Update ────────────────────────────────────────────────────────────────

  update() {
    if (this._minimap) this._drawMinimap();
    if (this._open)    this._drawFullmap();
  }

  // ── Abrir/Cerrar ──────────────────────────────────────────────────────────

  toggle() { this._open ? this.close() : this.open(); }

  open() {
    this._open = true;
    this._drawFullmap();
    this._fullmap.style.display = 'flex';
  }

  close() {
    this._open = false;
    this._fullmap.style.display = 'none';
  }

  isOpen() { return this._open; }
  hideMinimap() {
  if (this._minimap) this._minimap.style.display = 'none';
  if (this._open) this.close();
}

showMinimap() {
  if (this._minimap) this._minimap.style.display = 'block';
}
}

