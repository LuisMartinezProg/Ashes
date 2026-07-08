// ui/settingsMenu.js — Ashes of the Reborn | Valiant Gaming

const SAVE_KEY = 'ashes_settings';

const DEFAULTS = {
  musicVolume : 80,
  sfxVolume   : 80,
  language    : 'es',
  brightness  : 100,
  vibration   : true,
  uiScale     : 1.0,
};

export class SettingsMenu {
  constructor() {
    this._open     = false;
    this._settings = this._load();
    this._panel    = null;

    this._build();
    this._apply();
  }

  open() {
    if (this._open) return;
    this._open = true;
    this._panel.style.display = 'flex';
    requestAnimationFrame(() => { this._panel.style.opacity = '1'; });
  }

  close() {
    if (!this._open) return;
    this._open = false;
    this._panel.style.opacity = '0';
    setTimeout(() => { this._panel.style.display = 'none'; }, 250);
  }

  toggle() {
    this._open ? this.close() : this.open();
  }

  get(key) {
    return this._settings[key] ?? DEFAULTS[key];
  }

  _load() {
    try {
      const saved = localStorage.getItem(SAVE_KEY);
      return saved ? { ...DEFAULTS, ...JSON.parse(saved) } : { ...DEFAULTS };
    } catch {
      return { ...DEFAULTS };
    }
  }

  _save() {
    localStorage.setItem(SAVE_KEY, JSON.stringify(this._settings));
  }

  _apply() {
    const container = document.getElementById('canvas-container');
    if (container) {
      container.style.filter = `brightness(${this._settings.brightness / 100})`;
    }
    window._uiScale = this._settings.uiScale;
    window._skillBar?._rebuild?.();
    window._audioMusicVolume = this._settings.musicVolume / 100;
    window._audioSfxVolume   = this._settings.sfxVolume   / 100;
    window._vibrationEnabled = this._settings.vibration;
  }

  _set(key, value) {
    this._settings[key] = value;
    this._save();
    this._apply();
  }

  _build() {
    this._panel = document.createElement('div');
    Object.assign(this._panel.style, {
      position      : 'fixed',
      inset         : '0',
      background    : 'rgba(4,4,14,0.92)',
      display       : 'none',
      flexDirection : 'column',
      alignItems    : 'center',
      justifyContent: 'center',
      zIndex        : '400',
      opacity       : '0',
      transition    : 'opacity 0.25s ease',
      pointerEvents : 'all',
      overflowY     : 'auto',
    });

    const box = document.createElement('div');
    Object.assign(box.style, {
      width        : '88vw',
      maxWidth     : '380px',
      background   : 'rgba(8,6,20,0.98)',
      border       : '1px solid rgba(201,168,76,0.3)',
      borderRadius : '12px',
      padding      : '20px 20px 16px',
      display      : 'flex',
      flexDirection: 'column',
      gap          : '16px',
    });

    const title = document.createElement('div');
    Object.assign(title.style, {
      color        : '#C9A84C',
      fontFamily   : "'Cinzel', serif",
      fontSize     : '14px',
      letterSpacing: '3px',
      textAlign    : 'center',
      textTransform: 'uppercase',
      marginBottom : '4px',
    });
    title.textContent = 'Configuración';
    box.appendChild(title);

    box.appendChild(this._makeSeparator());

    box.appendChild(this._makeSlider({
      label  : '🎵 Música',
      key    : 'musicVolume',
      min    : 0,
      max    : 100,
      step   : 5,
      suffix : '%',
      note   : '(disponible cuando se implemente el audio)',
    }));

    box.appendChild(this._makeSlider({
      label  : '🔊 Efectos',
      key    : 'sfxVolume',
      min    : 0,
      max    : 100,
      step   : 5,
      suffix : '%',
      note   : '(disponible cuando se implemente el audio)',
    }));

    box.appendChild(this._makeSeparator());

    box.appendChild(this._makeSlider({
      label  : '☀️ Brillo',
      key    : 'brightness',
      min    : 30,
      max    : 150,
      step   : 5,
      suffix : '%',
    }));

    box.appendChild(this._makeSlider({
      label   : '🖥️ Tamaño UI',
      key     : 'uiScale',
      min     : 0.7,
      max     : 1.4,
      step    : 0.05,
      suffix  : 'x',
      decimals: 2,
    }));

    box.appendChild(this._makeToggle({
      label: '📳 Vibración',
      key  : 'vibration',
    }));

    box.appendChild(this._makeSeparator());
    box.appendChild(this._makeLanguage());
    box.appendChild(this._makeSeparator());

    const closeBtn = document.createElement('button');
    closeBtn.textContent = 'CERRAR';
    Object.assign(closeBtn.style, {
      padding      : '10px',
      background   : 'rgba(201,168,76,0.12)',
      border       : '1px solid rgba(201,168,76,0.4)',
      borderRadius : '6px',
      color        : '#C9A84C',
      fontFamily   : 'monospace',
      fontSize     : '11px',
      letterSpacing: '2px',
      cursor       : 'pointer',
      pointerEvents: 'all',
      WebkitTapHighlightColor: 'transparent',
    });
    const onClose = (e) => { e.preventDefault(); this.close(); };
    closeBtn.addEventListener('touchstart', onClose, { passive: false });
    closeBtn.addEventListener('click', onClose);
    box.appendChild(closeBtn);

    this._panel.appendChild(box);
    document.body.appendChild(this._panel);
  }

  _makeSlider({ label, key, min, max, step, suffix = '', note = '', decimals = 0 }) {
    const wrap = document.createElement('div');
    Object.assign(wrap.style, {
      display      : 'flex',
      flexDirection: 'column',
      gap          : '6px',
    });

    const row = document.createElement('div');
    Object.assign(row.style, {
      display        : 'flex',
      justifyContent : 'space-between',
      alignItems     : 'center',
    });

    const lbl = document.createElement('div');
    Object.assign(lbl.style, {
      color     : 'rgba(255,245,220,0.8)',
      fontFamily: 'monospace',
      fontSize  : '11px',
    });
    lbl.textContent = label;

    const val = document.createElement('div');
    Object.assign(val.style, {
      color    : '#C9A84C',
      fontFamily: 'monospace',
      fontSize : '11px',
      minWidth : '40px',
      textAlign: 'right',
    });

    const current = this._settings[key] ?? DEFAULTS[key];
    val.textContent = `${decimals > 0 ? Number(current).toFixed(decimals) : current}${suffix}`;

    row.appendChild(lbl);
    row.appendChild(val);

    const slider = document.createElement('input');
    slider.type  = 'range';
    slider.min   = min;
    slider.max   = max;
    slider.step  = step;
    slider.value = current;
    Object.assign(slider.style, {
      width      : '100%',
      accentColor: '#C9A84C',
      cursor     : 'pointer',
    });

    slider.addEventListener('input', () => {
      const v = parseFloat(slider.value);
      val.textContent = `${decimals > 0 ? v.toFixed(decimals) : v}${suffix}`;
      this._set(key, v);
    });

    wrap.appendChild(row);
    wrap.appendChild(slider);

    if (note) {
      const noteEl = document.createElement('div');
      Object.assign(noteEl.style, {
        color     : 'rgba(255,255,255,0.25)',
        fontFamily: 'monospace',
        fontSize  : '9px',
        fontStyle : 'italic',
      });
      noteEl.textContent = note;
      wrap.appendChild(noteEl);
    }

    return wrap;
  }

  _makeToggle({ label, key }) {
    const wrap = document.createElement('div');
    Object.assign(wrap.style, {
      display        : 'flex',
      justifyContent : 'space-between',
      alignItems     : 'center',
    });

    const lbl = document.createElement('div');
    Object.assign(lbl.style, {
      color     : 'rgba(255,245,220,0.8)',
      fontFamily: 'monospace',
      fontSize  : '11px',
    });
    lbl.textContent = label;

    const current = this._settings[key] ?? DEFAULTS[key];
    const btn = document.createElement('button');
    btn.textContent = current ? 'ON' : 'OFF';
    Object.assign(btn.style, {
      padding      : '4px 14px',
      background   : current ? 'rgba(201,168,76,0.2)' : 'rgba(255,255,255,0.05)',
      border       : `1px solid ${current ? 'rgba(201,168,76,0.5)' : 'rgba(255,255,255,0.15)'}`,
      borderRadius : '20px',
      color        : current ? '#C9A84C' : 'rgba(255,255,255,0.3)',
      fontFamily   : 'monospace',
      fontSize     : '10px',
      cursor       : 'pointer',
      pointerEvents: 'all',
      WebkitTapHighlightColor: 'transparent',
      transition   : 'all 0.15s',
    });

    const onToggle = (e) => {
      e.preventDefault();
      const newVal = !(this._settings[key] ?? DEFAULTS[key]);
      this._set(key, newVal);
      btn.textContent      = newVal ? 'ON' : 'OFF';
      btn.style.background = newVal ? 'rgba(201,168,76,0.2)' : 'rgba(255,255,255,0.05)';
      btn.style.border     = `1px solid ${newVal ? 'rgba(201,168,76,0.5)' : 'rgba(255,255,255,0.15)'}`;
      btn.style.color      = newVal ? '#C9A84C' : 'rgba(255,255,255,0.3)';
      if (newVal && navigator.vibrate) navigator.vibrate(80);
    };
    btn.addEventListener('touchstart', onToggle, { passive: false });
    btn.addEventListener('click', onToggle);

    wrap.appendChild(lbl);
    wrap.appendChild(btn);
    return wrap;
  }

  _makeLanguage() {
    const wrap = document.createElement('div');
    Object.assign(wrap.style, {
      display      : 'flex',
      flexDirection: 'column',
      gap          : '8px',
    });

    const lbl = document.createElement('div');
    Object.assign(lbl.style, {
      color     : 'rgba(255,245,220,0.8)',
      fontFamily: 'monospace',
      fontSize  : '11px',
    });
    lbl.textContent = '🌍 Idioma';

    const row = document.createElement('div');
    Object.assign(row.style, {
      display: 'flex',
      gap    : '8px',
    });

    const langs = [
      { code: 'es', label: 'Español', available: true  },
      { code: 'en', label: 'English', available: false },
      { code: 'ja', label: '日本語',   available: false },
    ];

    for (const lang of langs) {
      const btn = document.createElement('button');
      btn.textContent = lang.label;
      const isActive = this._settings.language === lang.code;
      Object.assign(btn.style, {
        flex         : '1',
        padding      : '6px 4px',
        background   : isActive ? 'rgba(201,168,76,0.2)' : 'rgba(255,255,255,0.03)',
        border       : `1px solid ${isActive ? 'rgba(201,168,76,0.5)' : 'rgba(255,255,255,0.1)'}`,
        borderRadius : '6px',
        color        : lang.available ? (isActive ? '#C9A84C' : 'rgba(255,255,255,0.4)') : 'rgba(255,255,255,0.15)',
        fontFamily   : 'monospace',
        fontSize     : '10px',
        cursor       : lang.available ? 'pointer' : 'default',
        pointerEvents: lang.available ? 'all' : 'none',
        WebkitTapHighlightColor: 'transparent',
      });

      if (!lang.available) {
        const soon = document.createElement('div');
        Object.assign(soon.style, {
          fontSize : '8px',
          color    : 'rgba(255,255,255,0.2)',
          marginTop: '2px',
        });
        soon.textContent = 'Próximamente';
        btn.appendChild(document.createElement('br'));
        btn.appendChild(soon);
      }

      if (lang.available) {
        const onLang = (e) => {
          e.preventDefault();
          this._set('language', lang.code);
          row.querySelectorAll('button').forEach((b, i) => {
            const active = langs[i].code === lang.code;
            b.style.background = active ? 'rgba(201,168,76,0.2)' : 'rgba(255,255,255,0.03)';
            b.style.border     = `1px solid ${active ? 'rgba(201,168,76,0.5)' : 'rgba(255,255,255,0.1)'}`;
            b.style.color      = active ? '#C9A84C' : 'rgba(255,255,255,0.4)';
          });
        };
        btn.addEventListener('touchstart', onLang, { passive: false });
        btn.addEventListener('click', onLang);
      }

      row.appendChild(btn);
    }

    wrap.appendChild(lbl);
    wrap.appendChild(row);
    return wrap;
  }

  _makeSeparator() {
    const sep = document.createElement('div');
    Object.assign(sep.style, {
      width     : '100%',
      height    : '1px',
      background: 'rgba(201,168,76,0.1)',
    });
    return sep;
  }
}
