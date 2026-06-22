// ui/timeMenu.js — Ashes of the Reborn | Valiant Gaming
// Panel para saltar manualmente entre fases del ciclo día/noche.

const PHASES_UI = [
  { id: 'amanecer',  label: 'Amanecer',  icon: '🌅' },
  { id: 'dia',       label: 'Día',       icon: '☀️' },
  { id: 'atardecer', label: 'Atardecer', icon: '🌇' },
  { id: 'noche',     label: 'Noche',     icon: '🌙' },
];

export class TimeMenu {
  constructor(dayNightCycle) {
    this._dayNight = dayNightCycle;
    this._open     = false;
    this._buildUI();
  }

  _buildUI() {
    this._overlay = document.createElement('div');
    Object.assign(this._overlay.style, {
      position      : 'fixed',
      inset         : '0',
      background    : 'rgba(4,4,10,0.85)',
      zIndex        : '400',
      display       : 'none',
      flexDirection : 'column',
      alignItems    : 'center',
      justifyContent: 'center',
      pointerEvents : 'all',
    });
    this._overlay.addEventListener('click', (e) => {
      if (e.target === this._overlay) this.close();
    });

    const panel = document.createElement('div');
    Object.assign(panel.style, {
      width        : '88vw',
      maxWidth     : '340px',
      background   : 'rgba(10,8,20,0.95)',
      border       : '1px solid rgba(201,168,76,0.4)',
      borderRadius : '14px',
      padding      : '18px',
      display      : 'flex',
      flexDirection: 'column',
      gap          : '10px',
    });

    const title = document.createElement('div');
    Object.assign(title.style, {
      fontFamily   : "'Cinzel',serif",
      fontSize     : '13px',
      letterSpacing: '3px',
      color        : '#C9A84C',
      textAlign    : 'center',
      marginBottom : '8px',
    });
    title.textContent = 'SALTAR EL TIEMPO';

    panel.appendChild(title);

    for (const phase of PHASES_UI) {
      const btn = document.createElement('button');
      Object.assign(btn.style, {
        display      : 'flex',
        alignItems   : 'center',
        gap          : '10px',
        padding      : '12px 14px',
        borderRadius : '10px',
        border       : '1px solid rgba(201,168,76,0.3)',
        background   : 'rgba(201,168,76,0.08)',
        color        : '#EEE8D5',
        fontFamily   : 'monospace',
        fontSize     : '13px',
        cursor       : 'pointer',
        pointerEvents: 'all',
        WebkitTapHighlightColor: 'transparent',
      });
      btn.innerHTML = `<span style="font-size:18px">${phase.icon}</span> ${phase.label}`;

      const jump = (e) => {
        e.preventDefault();
        this._dayNight?.jumpToPhase(phase.id);
        this.close();
      };
      btn.addEventListener('click', jump);
      btn.addEventListener('touchstart', jump, { passive: false });

      panel.appendChild(btn);
    }

    this._overlay.appendChild(panel);
    document.body.appendChild(this._overlay);
  }

  open() {
    this._open = true;
    this._overlay.style.display = 'flex';
  }

  close() {
    this._open = false;
    this._overlay.style.display = 'none';
  }

  toggle() { this._open ? this.close() : this.open(); }
}
