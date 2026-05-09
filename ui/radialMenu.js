/**
 * ui/radialMenu.js — Menú radial tipo reloj
 * Botón central estrella de 4 puntas, despliega iconos alrededor
 */

export class RadialMenu {
  constructor(items) {
    this._items  = items; // [{icon, label, action, locked}]
    this._open   = false;
    this._btn    = null;
    this._rays   = [];
    this._buildUI();
  }

  _buildUI() {
    // Botón central — estrella de 4 puntas
    this._btn = document.createElement('button');
    this._btn.innerHTML = `
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <path d="M14 2 L16 12 L26 14 L16 16 L14 26 L12 16 L2 14 L12 12 Z"
              fill="#C9A84C" opacity="0.9"/>
      </svg>
    `;
    Object.assign(this._btn.style, {
      position : 'fixed', top: '12px', right: '14px',
      width: '44px', height: '44px', borderRadius: '50%',
      border: '1px solid rgba(201,168,76,0.4)',
      background: 'rgba(10,8,20,0.88)',
      cursor: 'pointer', zIndex: '160',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      WebkitTapHighlightColor: 'transparent',
      boxShadow: '0 2px 12px rgba(0,0,0,0.5)',
      transition: 'transform .2s, box-shadow .2s',
    });

    this._btn.addEventListener('click',      () => this.toggle());
    this._btn.addEventListener('touchstart', (e) => { e.preventDefault(); this.toggle(); }, { passive: false });
    document.body.appendChild(this._btn);

    // Overlay para cerrar al tocar fuera
    this._overlay = document.createElement('div');
    Object.assign(this._overlay.style, {
      position: 'fixed', inset: '0',
      zIndex: '155', display: 'none',
    });
    this._overlay.addEventListener('click', () => this.close());
    document.body.appendChild(this._overlay);
  }

  _renderRays() {
    this._rays.forEach(r => r.remove());
    this._rays = [];

    // Posiciones en arco alrededor del botón (esquina superior derecha)
    const cx = window.innerWidth  - 22;  // centro X del botón
    const cy = 34;                        // centro Y del botón
    const count  = this._items.length;
    // Arco desde 180° hasta 270° (abajo-izquierda del botón)
     const startA = Math.PI * 0.7
    const endA   = Math.PI * 1.5;
    const radius = 70;

    this._items.forEach((item, i) => {
      const angle = startA + (endA - startA) * (i / (count - 1 || 1));
      const x = cx + Math.cos(angle) * radius;
      const y = cy + Math.sin(angle) * radius;

      const btn = document.createElement('button');
      btn.innerHTML = `
        <div style="font-size:20px;line-height:1;">${item.icon}</div>
        <div style="font-family:'Cinzel',serif;font-size:7px;letter-spacing:1px;
             color:${item.locked?'#3a3028':'#c9a84c'};margin-top:3px;white-space:nowrap;">
          ${item.label}
        </div>
      `;
      Object.assign(btn.style, {
        position : 'fixed',
        left     : `${x - 28}px`,
        top      : `${y - 28}px`,
        width    : '56px', height: '56px',
        borderRadius: '12px',
        border   : `1px solid rgba(201,168,76,${item.locked?'0.1':'0.35'})`,
        background: `rgba(10,8,20,${item.locked?'0.6':'0.92'})`,
        cursor   : item.locked ? 'not-allowed' : 'pointer',
        zIndex   : '160',
        display  : 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        opacity  : item.locked ? '0.5' : '1',
        WebkitTapHighlightColor: 'transparent',
        animation: `radialIn .2s ease ${i * 0.05}s both`,
        boxShadow: '0 2px 12px rgba(0,0,0,0.5)',
      });

      if (!item.locked) {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          item.action?.();
          this.close();
        });
        btn.addEventListener('touchstart', (e) => {
          e.preventDefault();
          e.stopPropagation();
          item.action?.();
          this.close();
        }, { passive: false });
      }

      document.body.appendChild(btn);
      this._rays.push(btn);
    });

    // Inyectar animación
    if (!document.getElementById('radial-styles')) {
      const s = document.createElement('style');
      s.id = 'radial-styles';
      s.textContent = `
        @keyframes radialIn {
          from { opacity:0; transform:scale(0.5); }
          to   { opacity:1; transform:scale(1); }
        }
      `;
      document.head.appendChild(s);
    }
  }

  toggle() { this._open ? this.close() : this.open(); }

  open() {
    this._open = true;
    this._overlay.style.display = 'block';
    this._btn.style.transform   = 'rotate(45deg)';
    this._btn.style.boxShadow   = '0 0 20px rgba(201,168,76,0.3)';
    this._renderRays();
  }

  close() {
    this._open = false;
    this._overlay.style.display = 'none';
    this._btn.style.transform   = 'rotate(0deg)';
    this._btn.style.boxShadow   = '0 2px 12px rgba(0,0,0,0.5)';
    this._rays.forEach(r => r.remove());
    this._rays = [];
  }

  // Actualizar items en runtime
  setItems(items) {
    this._items = items;
    if (this._open) { this.close(); this.open(); }
  }
}
