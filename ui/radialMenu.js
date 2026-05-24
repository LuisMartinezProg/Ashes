/**
 * ui/radialMenu.js — Menú radial, botones se deslizan hacia la izquierda
 */

const HOLD_DELAY = 500; // ms para distinguir tap de hold

export class RadialMenu {
  constructor(items) {
    this._items      = items;
    this._open       = false;
    this._btn        = null;
    this._rays       = [];
    this._holdTimer  = null;
    this._didHold    = false;
    this._buildUI();
  }

  _buildUI() {
    this._btn = document.createElement('button');
    this._btn.innerHTML = `
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <path d="M14 2 L16 12 L26 14 L16 16 L14 26 L12 16 L2 14 L12 12 Z"
              fill="#C9A84C" opacity="0.9"/>
      </svg>
    `;
    Object.assign(this._btn.style, {
      position : 'fixed',
      top      : '10px',
      right    : '10px',
      width    : '44px',
      height   : '44px',
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

    // Click normal → abre el radial
    this._btn.addEventListener('click', () => {
      if (this._didHold) return; // fue hold, ignorar click
      this.toggle();
    });

    // Touch: distinguir tap (radial) de hold (skill tree)
    this._btn.addEventListener('touchstart', (e) => {
      e.preventDefault();
      this._didHold = false;

      this._holdTimer = setTimeout(() => {
        this._didHold = true;
        this._openSkillTree();
      }, HOLD_DELAY);

      // Feedback visual de carga
      this._btn.style.boxShadow = '0 0 0 0 rgba(201,168,76,0.6)';
      this._startHoldRing();

    }, { passive: false });

    this._btn.addEventListener('touchend', (e) => {
      e.preventDefault();
      clearTimeout(this._holdTimer);
      this._stopHoldRing();

      if (!this._didHold) {
        this.toggle();
      }
    });

    this._btn.addEventListener('touchmove', () => {
      clearTimeout(this._holdTimer);
      this._stopHoldRing();
    });

    // Mouse hold (desktop)
    this._btn.addEventListener('mousedown', () => {
      this._didHold = false;
      this._holdTimer = setTimeout(() => {
        this._didHold = true;
        this._openSkillTree();
      }, HOLD_DELAY);
      this._startHoldRing();
    });

    this._btn.addEventListener('mouseup', () => {
      clearTimeout(this._holdTimer);
      this._stopHoldRing();
    });

    document.body.appendChild(this._btn);

    this._overlay = document.createElement('div');
    Object.assign(this._overlay.style, {
      position: 'fixed', inset: '0',
      zIndex: '155', display: 'none',
    });
    this._overlay.addEventListener('click', () => this.close());
    document.body.appendChild(this._overlay);

    // Anillo de carga para el hold
    this._ring = document.createElement('div');
    Object.assign(this._ring.style, {
      position     : 'fixed',
      top          : '6px',
      right        : '6px',
      width        : '52px',
      height       : '52px',
      borderRadius : '50%',
      border       : '2px solid transparent',
      borderTopColor: '#c9a84c',
      zIndex       : '159',
      pointerEvents: 'none',
      display      : 'none',
      transition   : 'none',
    });
    document.body.appendChild(this._ring);
  }

  // ── Hold ring ─────────────────────────────────────────────────────────────

  _startHoldRing() {
    this._ring.style.display   = 'block';
    this._ring.style.animation = `radial-spin ${HOLD_DELAY}ms linear forwards`;

    // Inyectar keyframe si no existe
    if (!document.getElementById('radial-spin-style')) {
      const style = document.createElement('style');
      style.id = 'radial-spin-style';
      style.textContent = `
        @keyframes radial-spin {
          from { transform: rotate(0deg);   opacity: 1; }
          to   { transform: rotate(360deg); opacity: 1; }
        }
      `;
      document.head.appendChild(style);
    }
  }

  _stopHoldRing() {
    this._ring.style.display   = 'none';
    this._ring.style.animation = 'none';
  }

  // ── Skill tree ────────────────────────────────────────────────────────────

  _openSkillTree() {
    this._stopHoldRing();
    if (this._open) this.close();

    // Obtener arma activa del jugador
    const weapon = window._combat?._weaponType ?? 'katana';
    window._skillTree?.open(weapon);
  }

  // ── Radial normal ─────────────────────────────────────────────────────────

  _renderRays() {
    this._rays.forEach(r => r.remove());
    this._rays = [];

    const btnRect = this._btn.getBoundingClientRect();
    const btnCX   = btnRect.left + btnRect.width  / 2;
    const btnCY   = btnRect.top  + btnRect.height / 2;
    const size    = 56;
    const gap     = 8;

    this._items.forEach((item, i) => {
      const btn = document.createElement('button');
      btn.innerHTML = `
        <div style="font-size:22px;line-height:1;">${item.icon}</div>
        <div style="font-family:system-ui,sans-serif;font-size:8px;
             letter-spacing:0.5px;color:${item.locked ? '#555' : '#c9a84c'};
             margin-top:3px;white-space:nowrap;">${item.label}</div>
      `;

      const finalX = btnCX - (size + gap) * (i + 1) - size / 2;
      const finalY = btnCY - size / 2;

      Object.assign(btn.style, {
        position     : 'fixed',
        left         : `${btnCX - size / 2}px`,
        top          : `${finalY}px`,
        width        : `${size}px`,
        height       : `${size}px`,
        borderRadius : '12px',
        border       : `1px solid rgba(201,168,76,${item.locked ? '0.1' : '0.35'})`,
        background   : `rgba(10,8,20,${item.locked ? '0.6' : '0.92'})`,
        cursor       : item.locked ? 'not-allowed' : 'pointer',
        zIndex       : '160',
        display      : 'flex',
        flexDirection: 'column',
        alignItems   : 'center',
        justifyContent: 'center',
        opacity      : '0',
        WebkitTapHighlightColor: 'transparent',
        boxShadow    : '0 2px 12px rgba(0,0,0,0.6)',
        pointerEvents: 'all',
        transition   : `left ${0.18 + i * 0.05}s ease, opacity ${0.15 + i * 0.05}s ease`,
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

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          btn.style.left    = `${finalX}px`;
          btn.style.opacity = item.locked ? '0.45' : '1';
        });
      });
    });
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
