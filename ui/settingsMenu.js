// ui/settingsMenu.js — Ashes of the Reborn | Valiant Gaming

const SAVE_KEY        = 'ashes_settings';
const CHAR_CHANGE_KEY = 'ashes_lastCharChange'; // timestamp ms del último cambio de arma+reliquia
const CHAR_CHANGE_COOLDOWN_MS = 7 * 24 * 60 * 60 * 1000; // 7 días exactos

const DEFAULTS = {
  musicVolume : 80,
  sfxVolume   : 80,
  language    : 'es',
  brightness  : 100,
  vibration   : true,
  uiScale     : 1.0,
};

// Mismo catálogo que index.html usa para la selección inicial — duplicado
// aquí por la misma razón que allá: evitar mezclar type="module" en un
// archivo que hoy es import ES module normal, pero que se instancia desde
// game.html's vanilla-ish boot flow. Si data/relics.js cambia estos
// valores, actualizar aquí también.
const CHARGEN_WEAPONS = [
  { id: 'sword',  icon: '⚔️', name: 'Espada' },
  { id: 'katana', icon: '🗡️', name: 'Katana' },
  { id: 'bow',    icon: '🏹', name: 'Arco'   },
];

const CHARGEN_KAEL_ELEMENTS = [
  { id: 'fuego',      icon: '🔥', name: 'Fuego',      color: '#ff5522' },
  { id: 'rayo',       icon: '⚡', name: 'Rayo',       color: '#ffe066' },
  { id: 'naturaleza', icon: '🌿', name: 'Naturaleza', color: '#5cb85c' },
];

export class SettingsMenu {
  constructor() {
    this._open     = false;
    this._settings = this._load();
    this._panel    = null;

    // Estado interno del sub-panel "Cambiar Arma y Reliquia" (paso 0=arma, 1=elemento)
    this._charChangeOpen   = false;
    this._charChangeStep   = 0;
    this._charChangeChoice = { weapon: null, element: null };
    this._charChangePanel  = null;
    this._cooldownInterval = null;

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

  // ── Cambiar Arma y Reliquia: cooldown de 7 días exactos ──────────────────

  _getLastCharChangeTime() {
    const raw = localStorage.getItem(CHAR_CHANGE_KEY);
    return raw ? parseInt(raw, 10) : null;
  }

  _getCharChangeRemainingMs() {
    const last = this._getLastCharChangeTime();
    if (last === null) return 0; // nunca cambió → disponible ya
    const elapsed = Date.now() - last;
    return Math.max(0, CHAR_CHANGE_COOLDOWN_MS - elapsed);
  }

  _canChangeCharacterNow() {
    return this._getCharChangeRemainingMs() <= 0;
  }

  _formatRemaining(ms) {
    const totalSec = Math.ceil(ms / 1000);
    const d = Math.floor(totalSec / 86400);
    const h = Math.floor((totalSec % 86400) / 3600);
    const m = Math.floor((totalSec % 3600) / 60);
    const s = totalSec % 60;
    if (d > 0) return `${d}d ${String(h).padStart(2,'0')}h ${String(m).padStart(2,'0')}m`;
    return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
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
    box.appendChild(this._makeCharChangeSection());
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

    this._buildCharChangePanel();
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

  // ── Sección "Cambiar Arma y Reliquia" dentro del panel principal ────────

  _makeCharChangeSection() {
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
    lbl.textContent = '⚔️ Arma y Reliquia';

    const btn = document.createElement('button');
    Object.assign(btn.style, {
      padding      : '10px',
      background   : 'rgba(123,79,191,0.14)',
      border       : '1px solid rgba(123,79,191,0.4)',
      borderRadius : '6px',
      color        : '#B98FE8',
      fontFamily   : 'monospace',
      fontSize     : '10px',
      letterSpacing: '1.5px',
      cursor       : 'pointer',
      pointerEvents: 'all',
      WebkitTapHighlightColor: 'transparent',
      textAlign    : 'center',
    });

    this._charChangeBtn = btn;
    this._refreshCharChangeButton();

    const onOpen = (e) => {
      e.preventDefault();
      if (!this._canChangeCharacterNow()) return; // botón deshabilitado, no hace nada
      this._openCharChangePanel();
    };
    btn.addEventListener('touchstart', onOpen, { passive: false });
    btn.addEventListener('click', onOpen);

    // Refresca el texto del botón cada segundo mientras el panel principal
    // esté abierto, para que el contador de cooldown avance en vivo.
    this._cooldownInterval = setInterval(() => this._refreshCharChangeButton(), 1000);

    wrap.appendChild(lbl);
    wrap.appendChild(btn);
    return wrap;
  }

  _refreshCharChangeButton() {
    if (!this._charChangeBtn) return;
    const remaining = this._getCharChangeRemainingMs();

    if (remaining <= 0) {
      this._charChangeBtn.textContent = 'CAMBIAR ARMA Y RELIQUIA';
      this._charChangeBtn.style.opacity = '1';
      this._charChangeBtn.style.cursor  = 'pointer';
      this._charChangeBtn.style.pointerEvents = 'all';
    } else {
      this._charChangeBtn.textContent = `DISPONIBLE EN ${this._formatRemaining(remaining)}`;
      this._charChangeBtn.style.opacity = '0.4';
      this._charChangeBtn.style.cursor  = 'default';
      this._charChangeBtn.style.pointerEvents = 'none';
    }
  }

  // ── Sub-panel "Cambiar Arma y Reliquia" — mismo patrón de 2 pasos que index.html ──

  _buildCharChangePanel() {
    this._charChangePanel = document.createElement('div');
    Object.assign(this._charChangePanel.style, {
      position      : 'fixed',
      inset         : '0',
      background    : 'rgba(4,4,14,0.97)',
      display       : 'none',
      flexDirection : 'column',
      alignItems    : 'center',
      justifyContent: 'center',
      zIndex        : '450', // por encima del panel de settings
      opacity       : '0',
      transition    : 'opacity 0.25s ease',
      pointerEvents : 'all',
      padding       : '20px',
    });

    document.body.appendChild(this._charChangePanel);
  }

  _openCharChangePanel() {
    this._charChangeStep   = 0;
    this._charChangeChoice = { weapon: null, element: null };
    this._charChangeOpen   = true;
    this._charChangePanel.style.display = 'flex';
    requestAnimationFrame(() => { this._charChangePanel.style.opacity = '1'; });
    this._renderCharChangeStep();
  }

  _closeCharChangePanel() {
    this._charChangeOpen = false;
    this._charChangePanel.style.opacity = '0';
    setTimeout(() => { this._charChangePanel.style.display = 'none'; }, 250);
  }

  _renderCharChangeStep() {
    this._charChangePanel.innerHTML = '';

    const box = document.createElement('div');
    Object.assign(box.style, {
      display      : 'flex',
      flexDirection: 'column',
      alignItems   : 'center',
      gap          : '18px',
      maxWidth     : '92vw',
    });

    const title = document.createElement('div');
    Object.assign(title.style, {
      color        : '#C9A84C',
      fontFamily   : "'Cinzel', serif",
      fontSize     : '13px',
      letterSpacing: '2px',
      textAlign    : 'center',
      textTransform: 'uppercase',
    });
    title.textContent = this._charChangeStep === 0 ? 'Elige tu nueva arma' : 'Elige tu nueva reliquia';
    box.appendChild(title);

    const warn = document.createElement('div');
    Object.assign(warn.style, {
      color     : 'rgba(255,180,120,0.75)',
      fontFamily: 'monospace',
      fontSize  : '9px',
      textAlign : 'center',
      fontStyle : 'italic',
      maxWidth  : '260px',
    });
    warn.textContent = 'Este cambio quedará bloqueado por 7 días una vez confirmado.';
    box.appendChild(warn);

    const cardsRow = document.createElement('div');
    Object.assign(cardsRow.style, {
      display : 'flex',
      gap     : '14px',
      flexWrap: 'wrap',
      justifyContent: 'center',
    });

    const options = this._charChangeStep === 0 ? CHARGEN_WEAPONS : CHARGEN_KAEL_ELEMENTS;
    options.forEach(opt => {
      cardsRow.appendChild(this._buildCharChangeCard(opt));
    });
    box.appendChild(cardsRow);

    const cancelBtn = document.createElement('button');
    cancelBtn.textContent = 'CANCELAR';
    Object.assign(cancelBtn.style, {
      padding      : '8px 20px',
      background   : 'rgba(255,255,255,0.05)',
      border       : '1px solid rgba(255,255,255,0.15)',
      borderRadius : '6px',
      color        : 'rgba(255,255,255,0.5)',
      fontFamily   : 'monospace',
      fontSize     : '10px',
      letterSpacing: '1.5px',
      cursor       : 'pointer',
      pointerEvents: 'all',
      WebkitTapHighlightColor: 'transparent',
    });
    const onCancel = (e) => { e.preventDefault(); this._closeCharChangePanel(); };
    cancelBtn.addEventListener('touchstart', onCancel, { passive: false });
    cancelBtn.addEventListener('click', onCancel);
    box.appendChild(cancelBtn);

    this._charChangePanel.appendChild(box);
  }

  _buildCharChangeCard(opt) {
    const card = document.createElement('button');
    Object.assign(card.style, {
      display       : 'flex',
      flexDirection : 'column',
      alignItems    : 'center',
      justifyContent: 'center',
      gap           : '8px',
      width         : '92px',
      height        : '92px',
      background    : 'rgba(12,10,20,0.75)',
      border        : '1px solid rgba(123,79,191,0.3)',
      borderRadius  : '12px',
      cursor        : 'pointer',
      pointerEvents : 'all',
      WebkitTapHighlightColor: 'transparent',
    });

    const icon = document.createElement('div');
    icon.style.fontSize = '26px';
    icon.textContent = opt.icon;

    const name = document.createElement('div');
    Object.assign(name.style, {
      color     : '#E8E0F5',
      fontFamily: "'Cinzel', serif",
      fontSize  : '9px',
      letterSpacing: '1px',
      textTransform: 'uppercase',
    });
    name.textContent = opt.name;

    card.appendChild(icon);
    card.appendChild(name);

    const onPick = (e) => {
      e.preventDefault();
      if (this._charChangeStep === 0) {
        this._charChangeChoice.weapon = opt.id;
        this._charChangeStep = 1;
        this._renderCharChangeStep();
      } else {
        this._charChangeChoice.element = opt.id;
        this._confirmCharChange();
      }
    };
    card.addEventListener('touchstart', onPick, { passive: false });
    card.addEventListener('click', onPick);

    return card;
  }

  // Aplica el cambio EN CALIENTE (sin recargar la página), reutilizando
  // combat.setWeapon() y progression.equipRelic() que ya existen.
  //
  // NOTA IMPORTANTE (sin resolver aún, ver registro del proyecto): esto
  // asume que window._itemDrops?.getRelicData?.(weapon, element) está
  // accesible — pero getRelicData vive en data/relics.js, un archivo
  // distinto al que expone window._itemDrops (que viene de data/items.js).
  // Si no está expuesto, cae al fallback {id, weapon, element} — el cambio
  // se guarda igual, pero la reliquia queda sin su effectId real hasta
  // que el jugador cierre y reabra el juego (game.html's boot normal la
  // carga completa desde ashesCharacter). Falta confirmar si getRelicData
  // está expuesto en algún window._* antes de que esto quede 100% correcto
  // en la misma sesión.
  _confirmCharChange() {
    const { weapon, element } = this._charChangeChoice;

    localStorage.setItem('ashesCharacter', JSON.stringify({
      weapon,
      relicElement: element,
    }));
    localStorage.setItem(CHAR_CHANGE_KEY, String(Date.now()));

    const prog = window._prog;
    if (prog && window._combat) {
      window._combat.setWeapon(weapon);
      window._hud?.setWeaponIcon?.(weapon);
      window._skillBar?.setWeapon?.(weapon);

      const relicData = window._itemDrops?.getRelicData?.(weapon, element)
        ?? { id: `relic_${weapon}_${element}`, weapon, element };
      prog.equipRelic(relicData);
    }

    this._refreshCharChangeButton();
    this._closeCharChangePanel();

    // Confirmación visual reutilizando el mismo patrón que las notificaciones
    // de level-up ya existentes en progression.js — no se crea un sistema
    // de notificaciones nuevo, se replica el estilo visual existente.
    const el = document.createElement('div');
    Object.assign(el.style, {
      position     : 'fixed',
      top          : '18%',
      left         : '50%',
      transform    : 'translateX(-50%)',
      fontFamily   : "'Cinzel', serif",
      fontSize     : '12px',
      letterSpacing: '2px',
      color        : '#B98FE8',
      background   : 'rgba(4,4,10,0.97)',
      border       : '1px solid rgba(185,143,232,0.5)',
      borderRadius : '10px',
      padding      : '12px 24px',
      zIndex       : '600',
      pointerEvents: 'none',
      textAlign    : 'center',
      opacity      : '1',
      transition   : 'opacity 1s',
    });
    el.textContent = '⚔️ Arma y reliquia actualizadas';
    document.body.appendChild(el);
    setTimeout(() => {
      el.style.opacity = '0';
      setTimeout(() => el.remove(), 1000);
    }, 2200);
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
