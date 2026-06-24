// ui/timeMenu.js — Ashes of the Reborn | Valiant Gaming
// Panel "Ambiente": saltar fases del día (manual) + cambiar clima (manual).

const PHASES_UI = [
  { id: 'amanecer',  label: 'Amanecer',  icon: '🌅' },
  { id: 'dia',       label: 'Día',       icon: '☀️' },
  { id: 'atardecer', label: 'Atardecer', icon: '🌇' },
  { id: 'noche',     label: 'Noche',     icon: '🌙' },
];

const WEATHER_UI = [
  { id: 'despejado', label: 'Despejado', icon: '🌤️' },
  { id: 'lluvia',    label: 'Lluvia',    icon: '🌧️' },
  { id: 'niebla',    label: 'Niebla',    icon: '🌫️' },
];

export class TimeMenu {
  constructor(dayNightCycle, weatherSystem = null) {
    this._dayNight = dayNightCycle;
    this._weather  = weatherSystem;
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
      maxHeight    : '85vh',
      overflowY    : 'auto',
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
      fontSize     : '14px',
      letterSpacing: '3px',
      color        : '#C9A84C',
      textAlign    : 'center',
      marginBottom : '4px',
    });
    title.textContent = 'AMBIENTE';
    panel.appendChild(title);

    // ── Sección: Fases del día ──────────────────────────────────────────
    panel.appendChild(this._buildSectionLabel('🕐 Hora del día'));
    for (const phase of PHASES_UI) {
      panel.appendChild(this._buildButton(phase.icon, phase.label, (e) => {
        e.preventDefault();
        this._dayNight?.jumpToPhase(phase.id);
        this.close();
      }));
    }

    // ── Separador ────────────────────────────────────────────────────────
    const divider = document.createElement('div');
    Object.assign(divider.style, {
      height: '1px',
      background: 'rgba(201,168,76,0.2)',
      margin: '8px 0',
    });
    panel.appendChild(divider);

    // ── Sección: Clima ───────────────────────────────────────────────────
    panel.appendChild(this._buildSectionLabel('☁️ Clima'));
    for (const w of WEATHER_UI) {
      panel.appendChild(this._buildButton(w.icon, w.label, (e) => {
        e.preventDefault();
        this._weather?.setWeather(w.id);
        this.close();
      }));
    }

    this._overlay.appendChild(panel);
    document.body.appendChild(this._overlay);
  }

  _buildSectionLabel(text) {
    const label = document.createElement('div');
    Object.assign(label.style, {
      fontFamily   : 'monospace',
      fontSize     : '10px',
      letterSpacing: '2px',
      color        : 'rgba(201,168,76,0.55)',
      marginTop    : '4px',
      marginBottom : '2px',
    });
    label.textContent = text;
    return label;
  }

  _buildButton(icon, labelText, onActivate) {
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
    btn.innerHTML = `<span style="font-size:18px">${icon}</span> ${labelText}`;
    btn.addEventListener('click', onActivate);
    btn.addEventListener('touchstart', onActivate, { passive: false });
    return btn;
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
