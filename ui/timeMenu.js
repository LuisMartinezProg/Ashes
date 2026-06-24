// ui/timeMenu.js — Ashes of the Reborn | Valiant Gaming
// Panel "Ambiente": dial circular de fases del día + selector de clima.

const PHASES_UI = [
  { id: 'amanecer',  label: 'Amanecer',  icon: '🌅', angle: 0   }, // 12 en punto
  { id: 'dia',       label: 'Día',       icon: '☀️', angle: 90  }, // 3 en punto
  { id: 'atardecer', label: 'Atardecer', icon: '🌇', angle: 180 }, // 6 en punto
  { id: 'noche',     label: 'Noche',     icon: '🌙', angle: 270 }, // 9 en punto
];

const WEATHER_UI = [
  { id: 'despejado', label: 'Despejado', icon: '🌤️' },
  { id: 'lluvia',    label: 'Lluvia',    icon: '🌧️' },
  { id: 'niebla',    label: 'Niebla',    icon: '🌫️' },
];

const DIAL_SIZE = 190;
const DOT_SIZE  = 52;

export class TimeMenu {
  constructor(dayNightCycle, weatherSystem = null) {
    this._dayNight = dayNightCycle;
    this._weather  = weatherSystem;
    this._open     = false;
    this._weatherBtns = {};
    this._buildUI();

    // Mantener el texto de estado y el resaltado de clima sincronizados,
    // incluso si la fase/clima cambia por otra vía (ciclo automático, etc).
    const origPhaseCb = this._dayNight?.onPhaseChange;
    if (this._dayNight) {
      this._dayNight.onPhaseChange = (name) => {
        origPhaseCb?.(name);
        this._updatePhaseLabel(name);
      };
    }
    const origWeatherCb = this._weather?.onWeatherChange;
    if (this._weather) {
      this._weather.onWeatherChange = (name) => {
        origWeatherCb?.(name);
        this._updateWeatherHighlight(name);
      };
    }
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
      width        : '90vw',
      maxWidth     : '360px',
      background   : 'rgba(10,8,20,0.96)',
      border       : '1px solid rgba(201,168,76,0.4)',
      borderRadius : '18px',
      padding      : '22px 18px',
      display      : 'flex',
      flexDirection: 'column',
      alignItems   : 'center',
      gap          : '14px',
    });

    const title = document.createElement('div');
    Object.assign(title.style, {
      fontFamily   : "'Cinzel',serif",
      fontSize     : '14px',
      letterSpacing: '3px',
      color        : '#C9A84C',
    });
    title.textContent = 'AMBIENTE';
    panel.appendChild(title);

    // ── Dial circular de fases ───────────────────────────────────────────
    const dialWrap = document.createElement('div');
    Object.assign(dialWrap.style, {
      position: 'relative',
      width   : `${DIAL_SIZE}px`,
      height  : `${DIAL_SIZE}px`,
      margin  : '8px 0',
    });

    const ring = document.createElement('div');
    Object.assign(ring.style, {
      position    : 'absolute',
      inset       : '0',
      borderRadius: '50%',
      border      : '1px dashed rgba(201,168,76,0.3)',
    });
    dialWrap.appendChild(ring);

    // Icono central: muestra la fase actual en grande
    this._centerIcon = document.createElement('div');
    Object.assign(this._centerIcon.style, {
      position : 'absolute',
      top      : '50%',
      left     : '50%',
      transform: 'translate(-50%, -50%)',
      fontSize : '34px',
      pointerEvents: 'none',
    });
    this._centerIcon.textContent = '☀️';
    dialWrap.appendChild(this._centerIcon);

    const radius = DIAL_SIZE / 2;
    for (const phase of PHASES_UI) {
      const rad = (phase.angle - 90) * (Math.PI / 180); // -90 para que angle=0 quede arriba
      const x = radius + radius * Math.cos(rad) - DOT_SIZE / 2;
      const y = radius + radius * Math.sin(rad) - DOT_SIZE / 2;

      const dot = document.createElement('button');
      Object.assign(dot.style, {
        position     : 'absolute',
        left         : `${x}px`,
        top          : `${y}px`,
        width        : `${DOT_SIZE}px`,
        height       : `${DOT_SIZE}px`,
        borderRadius : '50%',
        border       : '1px solid rgba(201,168,76,0.4)',
        background   : 'rgba(201,168,76,0.1)',
        display      : 'flex',
        flexDirection: 'column',
        alignItems   : 'center',
        justifyContent: 'center',
        cursor       : 'pointer',
        pointerEvents: 'all',
        WebkitTapHighlightColor: 'transparent',
      });
      dot.innerHTML = `<span style="font-size:20px;line-height:1">${phase.icon}</span>`;

      const jump = (e) => {
        e.preventDefault();
        this._dayNight?.jumpToPhase(phase.id);
        this._updatePhaseLabel(phase.id);
      };
      dot.addEventListener('click', jump);
      dot.addEventListener('touchstart', jump, { passive: false });

      dialWrap.appendChild(dot);
    }

    panel.appendChild(dialWrap);

    // ── Texto de estado: fase actual ─────────────────────────────────────
    this._phaseLabel = document.createElement('div');
    Object.assign(this._phaseLabel.style, {
      fontFamily   : 'monospace',
      fontSize     : '13px',
      letterSpacing: '1px',
      color        : '#EEE8D5',
    });
    this._phaseLabel.textContent = 'Día';
    panel.appendChild(this._phaseLabel);

    // ── Separador ────────────────────────────────────────────────────────
    const divider = document.createElement('div');
    Object.assign(divider.style, {
      width: '100%',
      height: '1px',
      background: 'rgba(201,168,76,0.2)',
      margin: '4px 0',
    });
    panel.appendChild(divider);

    // ── Selector de clima ────────────────────────────────────────────────
    const weatherLabel = document.createElement('div');
    Object.assign(weatherLabel.style, {
      fontFamily   : 'monospace',
      fontSize     : '10px',
      letterSpacing: '2px',
      color        : 'rgba(201,168,76,0.55)',
    });
    weatherLabel.textContent = 'CLIMA';
    panel.appendChild(weatherLabel);

    const weatherRow = document.createElement('div');
    Object.assign(weatherRow.style, {
      display: 'flex',
      gap: '8px',
      width: '100%',
    });

    for (const w of WEATHER_UI) {
      const btn = document.createElement('button');
      Object.assign(btn.style, {
        flex         : '1',
        display      : 'flex',
        flexDirection: 'column',
        alignItems   : 'center',
        gap          : '4px',
        padding      : '10px 4px',
        borderRadius : '10px',
        border       : '1px solid rgba(201,168,76,0.3)',
        background   : 'rgba(201,168,76,0.08)',
        color        : '#EEE8D5',
        fontFamily   : 'monospace',
        fontSize     : '9px',
        cursor       : 'pointer',
        pointerEvents: 'all',
        WebkitTapHighlightColor: 'transparent',
      });
      btn.innerHTML = `<span style="font-size:20px">${w.icon}</span><span>${w.label}</span>`;

      const setW = (e) => {
        e.preventDefault();
        this._weather?.setWeather(w.id);
        this._updateWeatherHighlight(w.id);
      };
      btn.addEventListener('click', setW);
      btn.addEventListener('touchstart', setW, { passive: false });

      this._weatherBtns[w.id] = btn;
      weatherRow.appendChild(btn);
    }
    panel.appendChild(weatherRow);

    this._overlay.appendChild(panel);
    document.body.appendChild(this._overlay);

    // Estado inicial resaltado
    this._updateWeatherHighlight(this._weather?.getWeather?.() ?? 'despejado');
  }

  _updatePhaseLabel(phaseId) {
    const phase = PHASES_UI.find(p => p.id === phaseId);
    if (!phase) return;
    this._phaseLabel.textContent = phase.label;
    this._centerIcon.textContent = phase.icon;
  }

  _updateWeatherHighlight(weatherId) {
    for (const [id, btn] of Object.entries(this._weatherBtns)) {
      const active = id === weatherId;
      btn.style.background = active ? 'rgba(201,168,76,0.25)' : 'rgba(201,168,76,0.08)';
      btn.style.border      = active
        ? '1px solid rgba(201,168,76,0.7)'
        : '1px solid rgba(201,168,76,0.3)';
    }
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
