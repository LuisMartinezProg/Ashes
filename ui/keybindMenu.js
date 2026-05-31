// ui/keybindMenu.js — Menú de keybindings | Ashes of the Reborn

const ACTION_LABELS = {
  Adelante  : '⬆️ Adelante',
  Atrás     : '⬇️ Atrás',
  Izquierda : '⬅️ Izquierda',
  Derecha   : '➡️ Derecha',
  sprint    : '🏃 Sprint',
  attack    : '⚔️ Atacar',
  skill1    : '🔮 Habilidad 1',
  skill2    : '🔮 Habilidad 2',
  skill3    : '🔮 Habilidad 3',
  switch    : '🔄 Cambiar personaje',
  map       : '🗺️ Mapa',
};

export class KeybindMenu {
  constructor(keyboardControls) {
    this._kb           = keyboardControls;
    this._waiting      = null;
    this._pendingBind  = null;
    this._overlay      = null;
    this._rows         = {};
    this._confirmBtn   = null;
    this._build();
  }

  open() {
    this._refresh();
    this._overlay.style.display = 'flex';
  }

  close() {
    this._overlay.style.display = 'none';
    this._waiting     = null;
    this._pendingBind = null;
    if (this._confirmBtn) this._confirmBtn.style.display = 'none';
  }

  _build() {
    this._overlay = document.createElement('div');
    Object.assign(this._overlay.style, {
      position      : 'fixed', inset: '0',
      background    : 'rgba(4,4,10,0.95)',
      display       : 'none',
      flexDirection : 'column',
      alignItems    : 'center',
      justifyContent: 'center',
      zIndex        : '500',
      pointerEvents : 'all',
      overflowY     : 'auto',
    });

    const title = document.createElement('div');
    Object.assign(title.style, {
      fontFamily   : "'Cinzel', serif",
      fontSize     : '18px',
      color        : '#C9A84C',
      letterSpacing: '4px',
      marginBottom : '24px',
    });
    title.textContent = 'CONTROLES';
    this._overlay.appendChild(title);

    const mouseNote = document.createElement('div');
    Object.assign(mouseNote.style, {
      fontFamily   : 'monospace', fontSize: '10px',
      color        : 'rgba(201,168,76,0.6)',
      marginBottom : '16px', letterSpacing: '1px',
      textAlign    : 'center',
    });
    mouseNote.textContent = '🖱️ Click derecho + arrastrar = rotar cámara';
    this._overlay.appendChild(mouseNote);

    const table = document.createElement('div');
    Object.assign(table.style, {
      display      : 'flex', flexDirection: 'column',
      gap          : '10px', width: '320px',
    });

    for (const [action, label] of Object.entries(ACTION_LABELS)) {
      const row = document.createElement('div');
      Object.assign(row.style, {
        display       : 'flex', justifyContent: 'space-between',
        alignItems    : 'center',
        background    : 'rgba(255,255,255,0.04)',
        borderRadius  : '8px', padding: '8px 14px',
        border        : '1px solid rgba(201,168,76,0.15)',
      });

      const actionLabel = document.createElement('div');
      Object.assign(actionLabel.style, {
        fontFamily   : 'monospace', fontSize: '12px',
        color        : '#C9A84C', letterSpacing: '1px',
      });
      actionLabel.textContent = label;

      const keyBtn = document.createElement('button');
      Object.assign(keyBtn.style, {
        fontFamily  : 'monospace', fontSize: '11px',
        color       : '#fff',
        background  : 'rgba(255,255,255,0.08)',
        border      : '1px solid rgba(255,255,255,0.2)',
        borderRadius: '6px', padding: '4px 12px',
        cursor      : 'pointer', minWidth: '80px',
        textAlign   : 'center', transition: 'all 0.15s',
      });

      keyBtn.addEventListener('click', () => this._startListening(action, keyBtn));

      row.append(actionLabel, keyBtn);
      table.appendChild(row);
      this._rows[action] = keyBtn;
    }

    this._overlay.appendChild(table);

    // Botones inferiores
    const btnRow = document.createElement('div');
    Object.assign(btnRow.style, {
      display  : 'flex', gap: '12px', marginTop: '24px',
      flexWrap : 'wrap', justifyContent: 'center',
    });

    const resetBtn = document.createElement('button');
    resetBtn.textContent = 'RESET';
    Object.assign(resetBtn.style, {
      fontFamily   : 'monospace', fontSize: '11px',
      color        : '#C9A84C', background: 'transparent',
      border       : '1px solid rgba(201,168,76,0.4)',
      borderRadius : '8px', padding: '8px 20px',
      cursor       : 'pointer', letterSpacing: '2px',
    });
    resetBtn.addEventListener('click', () => {
      this._kb.resetDefaults();
      this._pendingBind = null;
      this._waiting     = null;
      if (this._confirmBtn) this._confirmBtn.style.display = 'none';
      this._refresh();
    });

    // Botón confirmar
    this._confirmBtn = document.createElement('button');
    this._confirmBtn.textContent = '✓ CONFIRMAR';
    Object.assign(this._confirmBtn.style, {
      fontFamily   : 'monospace', fontSize: '11px',
      color        : '#44ff88',
      background   : 'rgba(100,200,100,0.15)',
      border       : '1px solid rgba(100,200,100,0.4)',
      borderRadius : '8px', padding: '8px 20px',
      cursor       : 'pointer', letterSpacing: '2px',
      display      : 'none',
    });
    this._confirmBtn.addEventListener('click', () => {
      if (!this._pendingBind) return;
      this._kb.setBind(this._pendingBind.action, this._pendingBind.code);
      this._pendingBind           = null;
      this._waiting               = null;
      this._confirmBtn.style.display = 'none';
      this._refresh();
    });

    const closeBtn = document.createElement('button');
    closeBtn.textContent = 'CERRAR';
    Object.assign(closeBtn.style, {
      fontFamily   : 'monospace', fontSize: '11px',
      color        : '#fff',
      background   : 'rgba(201,168,76,0.2)',
      border       : '1px solid rgba(201,168,76,0.4)',
      borderRadius : '8px', padding: '8px 20px',
      cursor       : 'pointer', letterSpacing: '2px',
    });
    closeBtn.addEventListener('click', () => this.close());

    btnRow.append(resetBtn, this._confirmBtn, closeBtn);
    this._overlay.appendChild(btnRow);

    // Slider de tamaño UI
    const sizeRow = document.createElement('div');
    Object.assign(sizeRow.style, {
      display   : 'flex', alignItems: 'center',
      gap       : '10px', marginTop: '16px',
      fontFamily: 'monospace', fontSize: '10px',
      color     : 'rgba(201,168,76,0.7)',
    });

    const sizeLabel = document.createElement('span');
    sizeLabel.textContent = 'Tamaño UI';

    const slider = document.createElement('input');
    slider.type  = 'range';
    slider.min   = '50';
    slider.max   = '120';
    slider.value = localStorage.getItem('ashes_ui_scale') ?? '100';
    Object.assign(slider.style, { flex: '1', accentColor: '#C9A84C' });

    const valLabel = document.createElement('span');
    valLabel.textContent = `${slider.value}%`;

    slider.addEventListener('input', () => {
      valLabel.textContent = `${slider.value}%`;
      window._uiScale      = slider.value / 100;
      localStorage.setItem('ashes_ui_scale', slider.value);
      window._skillBar?._rebuild?.();
    });

    sizeRow.append(sizeLabel, slider, valLabel);
    this._overlay.appendChild(sizeRow);

    const hint = document.createElement('div');
    Object.assign(hint.style, {
      fontFamily   : 'monospace', fontSize: '9px',
      color        : 'rgba(255,255,255,0.3)',
      marginTop    : '16px', letterSpacing: '1px',
      textAlign    : 'center',
    });
    hint.textContent = 'Click en un botón → presiona tecla o click de mouse → confirmar';
    this._overlay.appendChild(hint);

    document.body.appendChild(this._overlay);

    // ── Listener de teclado ──────────────────────────────────────────────
    window.addEventListener('keydown', (e) => {
      if (!this._waiting) return;
      e.preventDefault();
      if (e.code === 'Escape') {
        this._cancelListening();
        return;
      }
      this._setPending(this._waiting, e.code);
    });

    // ── Listener de mouse ────────────────────────────────────────────────
    window.addEventListener('mousedown', (e) => {
      if (!this._waiting) return;
      // Solo capturar si el overlay está visible
      if (this._overlay.style.display === 'none') return;
      e.preventDefault();
      e.stopPropagation();
      const mouseNames = ['MouseLeft', 'MouseMiddle', 'MouseRight', 'MouseBack', 'MouseForward'];
      const code = mouseNames[e.button] ?? `Mouse${e.button}`;
      this._setPending(this._waiting, code);
    }, { capture: true });
  }

  _setPending(action, code) {
    this._pendingBind = { action, code };
    const btn = this._rows[action];
    if (btn) {
      btn.textContent      = `${this._formatKey(code)} ✓?`;
      btn.style.background = 'rgba(100,200,100,0.2)';
      btn.style.border     = '1px solid #44ff88';
      btn.style.color      = '#44ff88';
    }
    if (this._confirmBtn) this._confirmBtn.style.display = 'flex';
    this._waiting = null;
  }

  _startListening(action, btn) {
    // Cancelar pending anterior
    if (this._pendingBind) {
      this._refresh();
      this._pendingBind = null;
    }
    if (this._confirmBtn) this._confirmBtn.style.display = 'none';

    this._waiting = action;

    // Resetear todos los botones
    Object.values(this._rows).forEach(b => {
      b.style.background = 'rgba(255,255,255,0.08)';
      b.style.border     = '1px solid rgba(255,255,255,0.2)';
      b.style.color      = '#fff';
    });

    // Resaltar el activo
    btn.style.background = 'rgba(201,168,76,0.3)';
    btn.style.border     = '1px solid #C9A84C';
    btn.style.color      = '#C9A84C';
    btn.textContent      = '...';
  }

  _cancelListening() {
    this._waiting     = null;
    this._pendingBind = null;
    if (this._confirmBtn) this._confirmBtn.style.display = 'none';
    this._refresh();
  }

  _refresh() {
    const binds = this._kb.getBinds();
    for (const [action, btn] of Object.entries(this._rows)) {
      btn.textContent      = this._formatKey(binds[action]);
      btn.style.background = 'rgba(255,255,255,0.08)';
      btn.style.border     = '1px solid rgba(255,255,255,0.2)';
      btn.style.color      = '#fff';
    }
  }

  _formatKey(code) {
    if (!code) return '---';
    return code
      .replace('Key', '')
      .replace('Digit', '')
      .replace('ShiftLeft', 'Shift')
      .replace('ShiftRight', 'Shift')
      .replace('ControlLeft', 'Ctrl')
      .replace('ControlRight', 'Ctrl')
      .replace('AltLeft', 'Alt')
      .replace('AltRight', 'Alt')
      .replace('Space', 'Espacio')
      .replace('ArrowUp', '↑')
      .replace('ArrowDown', '↓')
      .replace('ArrowLeft', '←')
      .replace('ArrowRight', '→');
  }
}
