// ui/mapUI.js — Minimapa + Mapa completo
// Ashes of the Reborn | Valiant Gaming

export class MapUI {
  constructor(player) {
    this._player   = player;
    this._open     = false;
    this._minimap  = null;
    this._fullmap  = null;
    this._playerDot = null;

    // Límites del mundo
    this._world = {
      minX: -60, maxX: 60,
      minZ: -80, maxZ: 100,
    };

    // Zonas del mapa
    this._zones = [
      { label: 'Greymantle',  color: '#1A3A10', minZ: -80, maxZ: -40 },
      { label: 'Bosque claro',color: '#2A5A1A', minZ: -40, maxZ: -10 },
      { label: 'Planicie',    color: '#3A7A28', minZ: -10, maxZ:  30 },
      { label: 'Camino',      color: '#4A8A38', minZ:  30, maxZ:  60 },
      { label: 'Ironfell',    color: '#5A6A4A', minZ:  60, maxZ: 100 },
    ];

    this._buildMinimap();
    this._buildFullmap();
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
      pointerEvents: 'none',
      opacity      : '0.85',
    });

    // Toque para abrir mapa completo
    this._minimap.style.pointerEvents = 'all';
    this._minimap.style.cursor = 'pointer';
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

    // Fondo
    ctx.fillStyle = 'rgba(4,4,10,0.9)';
    ctx.beginPath();
    ctx.roundRect(0, 0, w, h, 8);
    ctx.fill();

    // Zonas
    this._zones.forEach(zone => {
      const y1 = this._worldToMini(0, zone.minZ, w, h).y;
      const y2 = this._worldToMini(0, zone.maxZ, w, h).y;
      ctx.fillStyle = zone.color;
      ctx.fillRect(0, y2, w, y1 - y2);
    });

    // Árboles (puntos verdes)
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

    // Ironfell
    const iron = this._worldToMini(0, 75, w, h);
    ctx.fillStyle = 'rgba(201,168,76,0.5)';
    ctx.fillRect(iron.x - 6, iron.y - 4, 12, 8);
    ctx.fillStyle = 'rgba(201,168,76,0.8)';
    ctx.font = `${Math.round(w * 0.07)}px monospace`;
    ctx.textAlign = 'center';
    ctx.fillText('?', iron.x, iron.y + 3);

    // Jugador
    if (this._player) {
      const pos = this._player.root.position;
      const p   = this._worldToMini(pos.x, pos.z, w, h);
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = 'rgba(201,168,76,0.9)';
      ctx.lineWidth   = 1;
      ctx.stroke();
    }

    // Norte
    ctx.fillStyle = 'rgba(201,168,76,0.5)';
    ctx.font = `${Math.round(w * 0.08)}px monospace`;
    ctx.textAlign = 'left';
    ctx.fillText('N', 4, 14);
  }

  _worldToMini(wx, wz, canvasW, canvasH) {
    const { minX, maxX, minZ, maxZ } = this._world;
    const x = ((wx - minX) / (maxX - minX)) * canvasW;
    const y = (1 - (wz - minZ) / (maxZ - minZ)) * canvasH; // invertido — norte arriba
    return { x, y };
  }

  // ── Mapa completo ─────────────────────────────────────────────────────────
  _buildFullmap() {
    this._fullmap = document.createElement('div');
    Object.assign(this._fullmap.style, {
      position     : 'fixed',
      inset        : '0',
      background   : 'rgba(4,4,10,0.97)',
      zIndex       : '500',
      display      : 'none',
      flexDirection: 'column',
      alignItems   : 'center',
      justifyContent: 'center',
      pointerEvents: 'all',
    });

    this._fullmap.innerHTML = `
      <div style="display:flex;align-items:center;justify-content:space-between;
           width:90%;max-width:500px;padding-bottom:12px;
           border-bottom:1px solid rgba(201,168,76,0.2);">
        <span style="font-family:'Cinzel',serif;font-size:11px;
             letter-spacing:4px;color:#c9a84c;">MAPA — SOLMARA</span>
        <button id="map-close"
          style="background:none;border:1px solid rgba(201,168,76,0.3);
          color:#c9a84c;font-size:18px;cursor:pointer;
          width:34px;height:34px;border-radius:50%;
          display:flex;align-items:center;justify-content:center;">✕</button>
      </div>
      <canvas id="map-canvas" style="margin-top:16px;border-radius:10px;
        border:1px solid rgba(201,168,76,0.25);"></canvas>
      <div id="map-legend" style="display:flex;gap:16px;margin-top:12px;flex-wrap:wrap;justify-content:center;"></div>
    `;

    document.body.appendChild(this._fullmap);

    this._fullmap.querySelector('#map-close').addEventListener('click', () => this.close());
    this._fullmap.querySelector('#map-close').addEventListener('touchstart', (e) => {
      e.preventDefault(); this.close();
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

    // Zonas
    this._zones.forEach(zone => {
      const y1 = this._worldToMap(0, zone.minZ, w, h).y;
      const y2 = this._worldToMap(0, zone.maxZ, w, h).y;
      ctx.fillStyle = zone.color;
      ctx.fillRect(0, y2, w, y1 - y2);

      // Label de zona
      const cy = (y1 + y2) / 2;
      ctx.fillStyle = 'rgba(255,255,255,0.25)';
      ctx.font = `${Math.round(w * 0.035)}px 'Cinzel',serif`;
      ctx.textAlign = 'center';
      ctx.fillText(zone.label.toUpperCase(), w / 2, cy);
    });

    // Árboles
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

    // Camino
    ctx.strokeStyle = 'rgba(200,168,120,0.6)';
    ctx.lineWidth   = Math.round(w * 0.015);
    ctx.setLineDash([]);
    const pStart = this._worldToMap(0, -20, w, h);
    const pEnd   = this._worldToMap(0,  65, w, h);
    ctx.beginPath();
    ctx.moveTo(pStart.x, pStart.y);
    ctx.lineTo(pEnd.x,   pEnd.y);
    ctx.stroke();

    // Ironfell — zona descubierta o no
    const iron = this._worldToMap(0, 75, w, h);
    const ironfellDiscovered = window._prog?.getFlag?.('ironfell_desbloqueada');

    if (ironfellDiscovered) {
      ctx.fillStyle = 'rgba(201,168,76,0.7)';
      ctx.fillRect(iron.x - 20, iron.y - 14, 40, 28);
      ctx.fillStyle = '#c9a84c';
      ctx.font = `bold ${Math.round(w * 0.04)}px 'Cinzel',serif`;
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

    // Jugador
    if (this._player) {
      const pos = this._player.root.position;
      const p   = this._worldToMap(pos.x, pos.z, w, h);

      // Pulso
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

    // Norte
    ctx.fillStyle = 'rgba(201,168,76,0.7)';
    ctx.font = `bold ${Math.round(w * 0.05)}px monospace`;
    ctx.textAlign = 'left';
    ctx.fillText('↑ N', 10, 30);

    // Leyenda
    const legend = this._fullmap.querySelector('#map-legend');
    legend.innerHTML = this._zones.map(z => `
      <div style="display:flex;align-items:center;gap:6px;">
        <div style="width:12px;height:12px;border-radius:2px;background:${z.color};
             border:1px solid rgba(255,255,255,0.2);"></div>
        <span style="font-family:'Cinzel',serif;font-size:9px;
             letter-spacing:2px;color:#8a7a5a;">${z.label.toUpperCase()}</span>
      </div>
    `).join('');
  }

  _worldToMap(wx, wz, canvasW, canvasH) {
    const { minX, maxX, minZ, maxZ } = this._world;
    const x = ((wx - minX) / (maxX - minX)) * canvasW;
    const y = (1 - (wz - minZ) / (maxZ - minZ)) * canvasH;
    return { x, y };
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
}
