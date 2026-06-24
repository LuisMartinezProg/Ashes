// ui/timeMenu.js — Ashes of the Reborn | Valiant Gaming
// Panel "Ambiente": reloj circular (fases del día) + selector de clima.
// El reloj se conecta a DayNightCycle.getProgress() real, no a un timer falso.

const PHASES_UI = [
  { id: 'amanecer',  icon: '🌅', label: 'Amanecer',  angle: 0   },
  { id: 'dia',       icon: '☀️', label: 'Día',       angle: 90  },
  { id: 'atardecer', icon: '🌇', label: 'Atardecer', angle: 180 },
  { id: 'noche',     icon: '🌙', label: 'Noche',     angle: 270 },
];

const WEATHER_UI = [
  { id: 'despejado', icon: '🌤️', label: 'Despejado' },
  { id: 'lluvia',    icon: '🌧️', label: 'Lluvia'    },
  { id: 'niebla',    icon: '🌫️', label: 'Niebla'    },
];

const CENTER = 70;
const RING_RADIUS = 70;
const UPDATE_INTERVAL_MS = 250;

function pointOnRing(angleDeg, radius) {
  const rad = (angleDeg - 90) * Math.PI / 180;
  return {
    x: CENTER + radius * Math.cos(rad),
    y: CENTER + radius * Math.sin(rad),
  };
}

function phaseFromProgress(progress) {
  const p = progress;
  if (p >= 0.95 || p < 0.10) return 'amanecer';
  if (p >= 0.10 && p < 0.45) return 'dia';
  if (p >= 0.45 && p < 0.55) return 'atardecer';
  return 'noche';
}

export class TimeMenu {
  constructor(dayNightCycle, weatherSystem = null) {
    this._dayNight = dayNightCycle;
    this._weather  = weatherSystem;
    this._open     = false;
    this._weatherBtns = {};
    this._phaseDots    = {};
    this._refreshInterval = null;

    this._buildUI();
    this._syncWeatherHighlight();
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

    const headerRow = document.createElement('div');
    Object.assign(headerRow.style, {
      width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    });

    const spacer = document.createElement('div');
    spacer.style.width = '48px';

    const title = document.createElement('div');
    Object.assign(title.style, {
      fontFamily   : "'Cinzel',serif",
      fontSize     : '13px',
      letterSpacing: '3px',
      color        : '#C9A84C',
      flex         : '1',
      textAlign    : 'center',
    });
    title.textContent = 'AMBIENTE';

    this._gameTimeEl = document.createElement('div');
    Object.assign(this._gameTimeEl.style, {
      fontFamily   : 'monospace',
      fontSize     : '12px',
      color        : 'rgba(201,168,76,0.85)',
      letterSpacing: '1px',
      background   : 'rgba(201,168,76,0.08)',
      border       : '1px solid rgba(201,168,76,0.25)',
      borderRadius : '6px',
      padding      : '3px 8px',
      minWidth     : '48px',
      textAlign    : 'center',
    });
    this._gameTimeEl.textContent = '--:--';

    headerRow.append(spacer, title, this._gameTimeEl);
    panel.appendChild(headerRow);

    const dialWrap = document.createElement('div');
    Object.assign(dialWrap.style, {
      position: 'relative', width: '140px', height: '140px', margin: '4px 0',
    });

    const ring = document.createElement('div');
    Object.assign(ring.style, {
      position: 'absolute', inset: '0', borderRadius: '50%',
      border: '1px dashed rgba(201,168,76,0.25)',
    });
    dialWrap.appendChild(ring);

    for (let i = 0; i < 60; i++) {
      const angle = i * 6;
      const { x, y } = pointOnRing(angle, RING_RADIUS);
      const isMajor = i % 5 === 0;
      const tick = document.createElement('div');
      Object.assign(tick.style, {
        position  : 'absolute',
        left      : `${x}px`,
        top       : `${y}px`,
        width     : isMajor ? '2.5px' : '1.5px',
        height    : isMajor ? '12px'  : '8px',
        background: isMajor ? 'rgba(201,168,76,0.55)' : 'rgba(201,168,76,0.3)',
        transform : `translate(-50%, -50%) rotate(${angle}deg)`,
      });
      dialWrap.appendChild(tick);
    }

    this._hand = document.createElement('div');
    Object.assign(this._hand.style, {
      position        : 'absolute', left: '50%', top: '50%',
      width: '3px', height: '48px',
      background      : 'linear-gradient(to top, #C9A84C, rgba(201,168,76,0.3))',
      borderRadius    : '3px',
      transformOrigin : '50% 100%',
      transform       : 'translate(-50%, -100%) rotate(90deg)',
      transition      : 'transform 1.4s cubic-bezier(.4,1.6,.4,1)',
      zIndex          : '2',
    });
    dialWrap.appendChild(this._hand);

    this._secondHand = document.createElement('div');
    Object.assign(this._secondHand.style, {
      position        : 'absolute', left: '50%', top: '50%',
      width: '1.5px', height: '58px',
      background      : 'rgba(180, 220, 255, 0.65)',
      transformOrigin : '50% 100%',
      transform       : 'translate(-50%, -100%) rotate(0deg)',
      zIndex          : '3',
    });
    dialWrap.appendChild(this._secondHand);

    const pivot = document.createElement('div');
    Object.assign(pivot.style, {
      position: 'absolute', top: '50%', left: '50%',
      width: '8px', height: '8px',
      background: '#C9A84C', borderRadius: '50%',
      transform: 'translate(-50%, -50%)', zIndex: '4',
    });
    dialWrap.appendChild(pivot);

    for (const phase of PHASES_UI) {
      const { x, y } = pointOnRing(phase.angle, RING_RADIUS);
      const dot = document.createElement('button');
      Object.assign(dot.style, {
        position     : 'absolute',
        left         : `${x}px`,
        top          : `${y}px`,
        transform    : 'translate(-50%, -50%)',
        width        : '32px', height: '32px',
        borderRadius : '50%',
        border       : '1px solid rgba(201,168,76,0.4)',
        background   : 'rgba(20,16,30,0.92)',
        display      : 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize     : '14px',
        cursor       : 'pointer',
        pointerEvents: 'all',
        zIndex       : '5',
        WebkitTapHighlightColor: 'transparent',
      });
      dot.textContent = phase.icon;

      const jump = (e) => {
        e.preventDefault();
        this._dayNight?.jumpToPhase(phase.id);
        this._syncToDayNight();
      };
      dot.addEventListener('click', jump);
      dot.addEventListener('touchstart', jump, { passive: false });

      this._phaseDots[phase.id] = dot;
      dialWrap.appendChild(dot);
    }

    panel.appendChild(dialWrap);

    this._phaseLabel = document.createElement('div');
    Object.assign(this._phaseLabel.style, {
      fontFamily: 'monospace', fontSize: '12px', letterSpacing: '1px',
      color: '#EEE8D5', marginTop: '2px',
    });
    this._phaseLabel.textContent = 'Día';
    panel.appendChild(this._phaseLabel);

    const divider = document.createElement('div');
    Object.assign(divider.style, {
      width: '100%', height: '1px', background: 'rgba(201,168,76,0.2)', margin: '6px 0',
    });
    panel.appendChild(divider);

    const bottomRow = document.createElement('div');
    Object.assign(bottomRow.style, { width: '100%', display: 'flex', justifyContent: 'flex-start' });

    const weatherCol = document.createElement('div');
    Object.assign(weatherCol.style, { display: 'flex', flexDirection: 'column', gap: '6px', alignItems: 'flex-start' });

    const weatherLabel = document.createElement('div');
    Object.assign(weatherLabel.style, {
      fontSize: '9px', letterSpacing: '2px', color: 'rgba(201,168,76,0.55)', fontFamily: 'monospace',
    });
    weatherLabel.textContent = 'CLIMA';
    weatherCol.appendChild(weatherLabel);

    const weatherRow = document.createElement('div');
    Object.assign(weatherRow.style, { display: 'flex', gap: '6px' });

    for (const w of WEATHER_UI) {
      const btn = document.createElement('button');
      Object.assign(btn.style, {
        display      : 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px',
        padding      : '8px 10px', borderRadius: '8px',
        border       : '1px solid rgba(201,168,76,0.3)',
        background   : 'rgba(201,168,76,0.08)',
        color        : '#EEE8D5', fontFamily: 'monospace', fontSize: '8px',
        cursor       : 'pointer', pointerEvents: 'all',
        WebkitTapHighlightColor: 'transparent',
      });
      btn.innerHTML = `<span style="font-size:16px">${w.icon}</span><span>${w.label}</span>`;

      const setW = (e) => {
        e.preventDefault();
        this._weather?.setWeather(w.id);
        this._syncWeatherHighlight();
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
  }

  _syncToDayNight() {
    if (!this._dayNight) return;
    const progress = this._dayNight.getProgress();
    const phaseId  = phaseFromProgress(progress);
    const phase    = PHASES_UI.find(p => p.id === phaseId) ?? PHASES_UI[1];

    this._hand.style.transform = `translate(-50%, -100%) rotate(${phase.angle}deg)`;
    this._secondHand.style.transform = `translate(-50%, -100%) rotate(${progress * 360}deg)`;
    this._phaseLabel.textContent = phase.label;

    for (const [id, dot] of Object.entries(this._phaseDots)) {
      const active = id === phaseId;
      dot.style.borderColor = active ? 'rgba(201,168,76,0.9)' : 'rgba(201,168,76,0.4)';
      dot.style.boxShadow   = active ? '0 0 8px rgba(201,168,76,0.4)' : 'none';
    }

    const totalHours = progress * 24;
    const hh = Math.floor(totalHours).toString().padStart(2, '0');
    const mm = Math.floor((totalHours % 1) * 60).toString().padStart(2, '0');
    this._gameTimeEl.textContent = `${hh}:${mm}`;
  }

  _syncWeatherHighlight() {
    const current = this._weather?.getWeather?.() ?? 'despejado';
    for (const [id, btn] of Object.entries(this._weatherBtns)) {
      const active = id === current;
      btn.style.background = active ? 'rgba(201,168,76,0.25)' : 'rgba(201,168,76,0.08)';
      btn.style.border     = active
        ? '1px solid rgba(201,168,76,0.7)'
        : '1px solid rgba(201,168,76,0.3)';
    }
  }

  open() {
    this._open = true;
    this._overlay.style.display = 'flex';
    this._syncToDayNight();
    this._syncWeatherHighlight();
    this._refreshInterval = setInterval(() => this._syncToDayNight(), UPDATE_INTERVAL_MS);
  }

  close() {
    this._open = false;
    this._overlay.style.display = 'none';
    if (this._refreshInterval) {
      clearInterval(this._refreshInterval);
      this._refreshInterval = null;
    }
  }

  toggle() { this._open ? this.close() : this.open(); }
}
