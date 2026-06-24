// ui/timeMenu.js — Ashes of the Reborn | Valiant Gaming
// Panel "Ambiente": dial tipo reloj con manecilla, marcas y display de hora.

const PHASES_UI = [
  { id: 'amanecer',  label: 'Amanecer',  icon: '🌅', angle: 0   },
  { id: 'dia',       label: 'Día',       icon: '☀️', angle: 90  },
  { id: 'atardecer', label: 'Atardecer', icon: '🌇', angle: 180 },
  { id: 'noche',     label: 'Noche',     icon: '🌙', angle: 270 },
];

const WEATHER_UI = [
  { id: 'despejado', label: 'Despejado', icon: '🌤️' },
  { id: 'lluvia',    label: 'Lluvia',    icon: '🌧️' },
  { id: 'niebla',    label: 'Niebla',    icon: '🌫️' },
];

const DIAL_SIZE   = 140;
const CENTER      = DIAL_SIZE / 2;        // 70
const RING_RADIUS = CENTER;               // 70 — puntos y marcas sobre el mismo círculo

function pointOnRing(angleDeg, radius) {
  const rad = (angleDeg - 90) * Math.PI / 180;
  return {
    x: CENTER + radius * Math.cos(rad),
    y: CENTER + radius * Math.sin(rad),
  };
}

export class TimeMenu {
  constructor(dayNightCycle, weatherSystem = null) {
    this._dayNight    = dayNightCycle;
    this._weather     = weatherSystem;
    this._open        = false;
    this._weatherBtns = {};
    this._demoProgress = 0.25;
    this._demoTimer    = null;
    this._buildUI();

    // Sincronizar etiqueta y manecilla si la fase cambia externamente
    if (this._dayNight) {
      const orig = this._dayNight.onPhaseChange;
      this._dayNight.onPhaseChange = (name) => {
        orig?.(name);
        this._updatePhaseLabel(name);
      };
    }
    if (this._weather) {
      const orig = this._weather.onWeatherChange;
      this._weather.onWeatherChange = (name) => {
        orig?.(name);
        this._updateWeatherHighlight(name);
      };
    }
  }

  _buildUI() {
    // ── Overlay ────────────────────────────────────────────────────────
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

    // ── Panel ──────────────────────────────────────────────────────────
    const panel = document.createElement('div');
    Object.assign(panel.style, {
      width        : '92vw',
      maxWidth     : '360px',
      background   : 'rgba(10,8,20,0.96)',
      border       : '1px solid rgba(201,168,76,0.4)',
      borderRadius : '16px',
      padding      : '16px 20px',
      display      : 'flex',
      flexDirection: 'column',
      alignItems   : 'center',
      gap          : '10px',
    });

    // ── Header: título + display de hora ──────────────────────────────
    const headerRow = document.createElement('div');
    Object.assign(headerRow.style, {
      width         : '100%',
      display       : 'flex',
      alignItems    : 'center',
      justifyContent: 'space-between',
    });

    const spacer = document.createElement('div');
    spacer.style.width = '48px';

    const title = document.createElement('div');
    Object.assign(title.style, {
      fontFamily   : 'Georgia, serif',
      fontSize     : '13px',
      letterSpacing: '3px',
      color        : '#C9A84C',
      flex         : '1',
      textAlign    : 'center',
    });
    title.textContent = 'AMBIENTE';

    this._gameTime = document.createElement('div');
    Object.assign(this._gameTime.style, {
      fontSize    : '12px',
      color       : 'rgba(201,168,76,0.85)',
      letterSpacing: '1px',
      background  : 'rgba(201,168,76,0.08)',
      border      : '1px solid rgba(201,168,76,0.25)',
      borderRadius: '6px',
      padding     : '3px 8px',
      minWidth    : '48px',
      textAlign   : 'center',
      fontFamily  : 'monospace',
    });
    this._gameTime.textContent = '06:00';

    headerRow.appendChild(spacer);
    headerRow.appendChild(title);
    headerRow.appendChild(this._gameTime);
    panel.appendChild(headerRow);

    // ── Dial ───────────────────────────────────────────────────────────
    const dialWrap = document.createElement('div');
    Object.assign(dialWrap.style, {
      position: 'relative',
      width   : `${DIAL_SIZE}px`,
      height  : `${DIAL_SIZE}px`,
      margin  : '4px 0',
    });

    // Anillo
    const ring = document.createElement('div');
    Object.assign(ring.style, {
      position    : 'absolute',
      inset       : '0',
      borderRadius: '50%',
      border      : '1px dashed rgba(201,168,76,0.25)',
    });
    dialWrap.appendChild(ring);

    // Marcas de minutos (60 total, cada 5ª más gruesa)
    for (let i = 0; i < 60; i++) {
      const angle = i * 6;
      const { x, y } = pointOnRing(angle, RING_RADIUS);
      const isMajor = i % 5 === 0;
      const tick = document.createElement('div');
      Object.assign(tick.style, {
        position : 'absolute',
        width    : isMajor ? '2.5px' : '1.5px',
        height   : isMajor ? '12px'  : '8px',
        background: isMajor
          ? 'rgba(201,168,76,0.55)'
          : 'rgba(201,168,76,0.3)',
        left     : x + 'px',
        top      : y + 'px',
        transform: `translate(-50%, -50%) rotate(${angle}deg)`,
      });
      dialWrap.appendChild(tick);
    }

    // Manecilla principal (fase)
    this._hand = document.createElement('div');
    Object.assign(this._hand.style, {
      position       : 'absolute',
      left           : '50%',
      top            : '50%',
      width          : '3px',
      height         : '48px',
      background     : 'linear-gradient(to top, #C9A84C, rgba(201,168,76,0.3))',
      borderRadius   : '3px',
      transformOrigin: '50% 100%',
      transform      : 'translate(-50%, -100%) rotate(90deg)',
      transition     : 'transform 1.4s cubic-bezier(.4,1.6,.4,1)',
      zIndex         : '2',
    });
    dialWrap.appendChild(this._hand);

    // Manecilla de segundos (animación de demo)
    this._secondHand = document.createElement('div');
    Object.assign(this._secondHand.style, {
      position       : 'absolute',
      left           : '50%',
      top            : '50%',
      width          : '1.5px',
      height         : '58px',
      background     : 'rgba(180,220,255,0.65)',
      transformOrigin: '50% 100%',
      transform      : 'translate(-50%, -100%) rotate(0deg)',
      zIndex         : '3',
    });
    dialWrap.appendChild(this._secondHand);

    // Pivote central
    const pivot = document.createElement('div');
    Object.assign(pivot.style, {
      position    : 'absolute',
      top         : '50%',
      left        : '50%',
      width       : '8px',
      height      : '8px',
      background  : '#C9A84C',
      borderRadius: '50%',
      transform   : 'translate(-50%, -50%)',
      zIndex      : '4',
    });
    dialWrap.appendChild(pivot);

    // Puntos de fase
    for (const phase of PHASES_UI) {
      const { x, y } = pointOnRing(phase.angle, RING_RADIUS);
      const dot = document.createElement('div');
      Object.assign(dot.style, {
        position    : 'absolute',
        width       : '32px',
        height      : '32px',
        borderRadius: '50%',
        border      : '1px solid rgba(201,168,76,0.4)',
        background  : 'rgba(20,16,30,0.92)',
        display     : 'flex',
        alignItems  : 'center',
        justifyContent: 'center',
        fontSize    : '14px',
        cursor      : 'pointer',
        zIndex      : '5',
        left        : x + 'px',
        top         : y + 'px',
        transform   : 'translate(-50%, -50%)',
        WebkitTapHighlightColor: 'transparent',
      });
      dot.textContent = phase.icon;
      dot._phaseId = phase.id;

      const activate = (e) => {
        e.preventDefault();
        this._dayNight?.jumpToPhase(phase.id);
        // Resaltar dot activo
        dialWrap.querySelectorAll('[data-dot]').forEach(d => {
          d.style.borderColor = 'rgba(201,168,76,0.4)';
          d.style.boxShadow   = 'none';
        });
        dot.style.borderColor = 'rgba(201,168,76,0.9)';
        dot.style.boxShadow   = '0 0 8px rgba(201,168,76,0.4)';
        // Mover manecilla
        this._hand.style.transform =
          `translate(-50%, -100%) rotate(${phase.angle}deg)`;
        this._updatePhaseLabel(phase.id);
      };
      dot.setAttribute('data-dot', phase.id);
      dot.addEventListener('click', activate);
      dot.addEventListener('touchstart', activate, { passive: false });

      dialWrap.appendChild(dot);
    }

    panel.appendChild(dialWrap);

    // ── Etiqueta de fase ───────────────────────────────────────────────
    this._phaseLabel = document.createElement('div');
    Object.assign(this._phaseLabel.style, {
      color        : '#EEE8D5',
      fontSize     : '12px',
      letterSpacing: '1px',
      fontFamily   : 'monospace',
      marginTop    : '2px',
    });
    this._phaseLabel.textContent = 'Día';
    panel.appendChild(this._phaseLabel);

    // ── Divisor ────────────────────────────────────────────────────────
    const divider = document.createElement('div');
    Object.assign(divider.style, {
      width     : '100%',
      height    : '1px',
      background: 'rgba(201,168,76,0.2)',
      margin    : '6px 0',
    });
    panel.appendChild(divider);

    // ── Selector de clima ──────────────────────────────────────────────
    const bottomRow = document.createElement('div');
    Object.assign(bottomRow.style, {
      width          : '100%',
      display        : 'flex',
      justifyContent : 'flex-start',
    });

    const weatherCol = document.createElement('div');
    Object.assign(weatherCol.style, {
      display      : 'flex',
      flexDirection: 'column',
      gap          : '6px',
      alignItems   : 'flex-start',
    });

    const weatherLabel = document.createElement('div');
    Object.assign(weatherLabel.style, {
      fontSize     : '9px',
      letterSpacing: '2px',
      color        : 'rgba(201,168,76,0.55)',
      fontFamily   : 'monospace',
    });
    weatherLabel.textContent = 'CLIMA';
    weatherCol.appendChild(weatherLabel);

    const weatherRow = document.createElement('div');
    Object.assign(weatherRow.style, { display: 'flex', gap: '6px' });

    for (const w of WEATHER_UI) {
      const btn = document.createElement('button');
      Object.assign(btn.style, {
        display      : 'flex',
        flexDirection: 'column',
        alignItems   : 'center',
        gap          : '3px',
        padding      : '8px 10px',
        borderRadius : '8px',
        border       : '1px solid rgba(201,168,76,0.3)',
        background   : 'rgba(201,168,76,0.08)',
        color        : '#EEE8D5',
        fontSize     : '8px',
        fontFamily   : 'monospace',
        cursor       : 'pointer',
        pointerEvents: 'all',
        WebkitTapHighlightColor: 'transparent',
      });
      btn.innerHTML =
        `<span style="font-size:16px">${w.icon}</span><span>${w.label}</span>`;

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

    weatherCol.appendChild(weatherRow);
    bottomRow.appendChild(weatherCol);
    panel.appendChild(bottomRow);

    this._overlay.appendChild(panel);
    document.body.appendChild(this._overlay);

    // Estado inicial
    this._updateWeatherHighlight(this._weather?.getWeather?.() ?? 'despejado');
  }

  // ── Animación de demo (manecilla de segundos + display de hora) ──────
  _startDemo() {
    this._demoTimer = setInterval(() => {
      this._demoProgress += 0.0015;
      if (this._demoProgress >= 1) this._demoProgress = 0;

      const totalDeg   = this._demoProgress * 360;
      const totalHours = this._demoProgress * 24;
      const hh = Math.floor(totalHours).toString().padStart(2, '0');
      const mm = Math.floor((totalHours % 1) * 60).toString().padStart(2, '0');

      this._secondHand.style.transform =
        `translate(-50%, -100%) rotate(${totalDeg}deg)`;
      this._gameTime.textContent = `${hh}:${mm}`;
    }, 100);
  }

  _stopDemo() {
    clearInterval(this._demoTimer);
    this._demoTimer = null;
  }

  // ── Helpers ───────────────────────────────────────────────────────────
  _updatePhaseLabel(phaseId) {
    const phase = PHASES_UI.find(p => p.id === phaseId);
    if (!phase) return;
    this._phaseLabel.textContent = phase.label;
    this._hand.style.transform =
      `translate(-50%, -100%) rotate(${phase.angle}deg)`;
  }

  _updateWeatherHighlight(weatherId) {
    for (const [id, btn] of Object.entries(this._weatherBtns)) {
      const active = id === weatherId;
      btn.style.background   = active
        ? 'rgba(201,168,76,0.25)' : 'rgba(201,168,76,0.08)';
      btn.style.borderColor  = active
        ? 'rgba(201,168,76,0.7)'  : 'rgba(201,168,76,0.3)';
    }
  }

  // ── API pública ───────────────────────────────────────────────────────
  open() {
    this._open = true;
    this._overlay.style.display = 'flex';
    this._startDemo();
  }

  close() {
    this._open = false;
    this._overlay.style.display = 'none';
    this._stopDemo();
  }

  toggle() { this._open ? this.close() : this.open(); }
}
