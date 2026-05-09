/**
 * ui/radialMenu.js — adaptativo
 */
export class RadialMenu {
  constructor(items) {
    this._items = items;
    this._open  = false;
    this._btn   = null;
    this._rays  = [];
    this._buildUI();
    window.addEventListener('resize', () => this._reposition());
  }

  _btnSize() {
    return Math.round(Math.min(window.innerWidth, window.innerHeight) * 0.075);
  }

  _buildUI() {
    const size = this._btnSize();

    this._btn = document.createElement('button');
    this._btn.innerHTML = `
      <svg width="24" height="24" viewBox="0 0 28 28" fill="none">
        <path d="M14 2 L16 12 L26 14 L16 16 L14 26 L12 16 L2 14 L12 12 Z"
              fill="#C9A84C" opacity="0.9"/>
      </svg>
    `;
    Object.assign(this._btn.style, {
      position : 'fixed',
      width    : `${size}px`,
      height   : `${size}px`,
      borderRadius: '50%',
      border   : '1px solid rgba(201,168,76,0.4)',
      background: 'rgba(10,8,20,0.88)',
      cursor   : 'pointer',
      zIndex   : '160',
      display  : 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      WebkitTapHighlightColor: 'transparent',
      boxShadow: '0 2px 12px rgba(0,0,0,0.5)',
      transition: 'transform .2s, box-shadow .2s',
    });

    this._reposition();

    this._btn.addEventListener('click', () => this.toggle());
    this._btn.addEventListener('touchstart', (e) => {
      e.preventDefault(); this.toggle();
    }, { passive: false });
    document.body.appendChild(this._btn);

    this._overlay = document.createElement('div');
    Object.assign(this._overlay.style, {
      position: 'fixed', inset: '0',
      zIndex: '155', display: 'none',
    });
    this._overlay.addEventListener('click', () => this.close());
    document.body.appendChild(this._overlay);
  }

  _reposition() {
    // El botón ⭐ va justo encima del botón de ataque
    // El botón de ataque está en bottom + marginB + attackSize/2
    const short     = Math.min(window.innerWidth, window.innerHeight);
    const attackSize = Math.round(short * 0.13);
    const marginB   = Math.round(short * 0.04);
    const marginR   = Math.round(short * 0.04);
    const btnSize   = this._btnSize();

    // Posición del centro del botón de ataque desde el borde
    const atkCenterFromBottom = marginB + attackSize / 2;
    const atkCenterFromRight  = marginR + attackSize / 2;

    // ⭐ va encima del botón de ataque con un pequeño gap
    const gap = Math.round(short * 0.02);
    const bottomPos = atkCenterFromBottom + attackSize / 2 + gap;
    const rightPos  = atkCenterFromRight  - btnSize / 2;

    Object.assign(this._btn.style, {
      bottom: `${bottomPos}px`,
      right : `${rightPos}px`,
    });
  }

  _renderRays() {
    this._rays.forEach(r => r.remove());
    this._rays = [];

    const btnRect = this._btn.getBoundingClientRect();
    const cx = btnRect.left + btnRect.width  / 2;
    const cy = btnRect.top  + btnRect.height / 2;

    const short  = Math.min(window.innerWidth, window.innerHeight);
    const radius = Math.round(short * 0.18);
    const count  = this._items.length;
    const startA = Math.PI * 0.65;
    const endA   = Math.PI * 1.35;
    const btnW   = Math.round(short * 0.12);

    this._items.forEach((item, i) => {
      const angle = count > 1
        ? startA + (endA - startA) * (i / (count - 1))
        : Math.PI;

      const x = cx + Math.cos(angle) * radius;
      const y = cy + Math.sin(angle) * radius;

      const btn = document.createElement('button');
      btn.innerHTML = `
        <div style="font-size:${Math.round(btnW * 0.35)}px;line-height:1;">${item.icon}</div>
        <div style="font-family:system-ui,sans-serif;font-size:${Math.round(btnW * 0.13)}px;
             color:${item.locked ? '#555' : '#c9a84c'};margin-top:3px;white-space:nowrap;">
          ${item.label}
        </div>
      `;
      Object.assign(btn.style, {
        position     : 'fixed',
        left         : `${x - btnW / 2}px`,
        top          : `${y - btnW / 2}px`,
        width        : `${btnW}px`,
        height       : `${btnW}px`,
        borderRadius : '12px',
        border       : `1px solid rgba(201,168,76,${item.locked ? '0.1' : '0.35'})`,
        background   : `rgba(10,8,20,${item.locked ? '0.6' : '0.92'})`,
        cursor       : item.locked ? 'not-allowed' : 'pointer',
        zIndex       : '160',
        display      : 'flex',
        flexDirection: 'column',
        alignItems   : 'center',
        justifyContent: 'center',
        opacity      : item.locked ? '0.45' : '1',
        WebkitTapHighlightColor: 'transparent',
        animation    : `radialIn .18s ease ${i * 0.05}s both`,
        boxShadow    : '0 2px 12px rgba(0,0,0,0.6)',
        pointerEvents: 'all',
      });

      if (!item.locked) {
        btn.addEventListener('click', (e) => {
          e.stopPropagation(); item.action?.(); this.close();
        });
        btn.addEventListener('touchstart', (e) => {
          e.preventDefault(); e.stopPropagation();
          item.action?.(); this.close();
        }, { passive: false });
      }

      document.body.appendChild(btn);
      this._rays.push(btn);
    });

    if (!document.getElementById('radial-styles')) {
      const s = document.createElement('style');
      s.id = 'radial-styles';
      s.textContent = `@keyframes radialIn {
        from { opacity:0; transform:scale(0.4); }
        to   { opacity:1; transform:scale(1); }
      }`;
      document.head.appendChild(s);
    }
  }

  toggle() { this._open ? this.close() : this.open(); }

  open() {
    this._open = true;
    this._overlay.style.display = 'block';
    this._btn.style.transform   = 'rotate(45deg)';
    this._btn.style.boxShadow   = '0 0 20px rgba(201,168,76,0.4)';
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

  setItems(items) {
    this._items = items;
    if (this._open) { this.close(); this.open(); }
  }
}
