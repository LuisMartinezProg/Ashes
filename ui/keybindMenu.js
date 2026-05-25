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
    this._kb      = keyboardControls;
    this._waiting = null;
    this._overlay = null;
    this._rows    = {};
    this._build();
  }

  open() {
    this._refresh();
    this._overlay.style.display = 'flex';
  }

  close() {
    this._overlay.style.display = 'none';
    this._waiting = null;
  }

  _build() {
    this._overlay = document.createElement('div');
    Object.assign(this._overlay.style, {
      position      : 'fixed',
      inset         : '0',
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

    // Nota de mouse
    const mouseNote = document.createElement('div');
    Object.assign(mouseNote.style, {
      fontFamily   : 'monospace',
      fontSize     : '10px',
      color        : 'rgba(201,168,76,0.6)',
      marginBottom : '16px',
      letterSpacing: '1px',
    });
    mouseNote.textContent = '🖱️ Click derecho + arrastrar = rotar cámara';
    this._overlay.appendChild(mouseNote);

    const table = document.createElement('div');
    Object.assign(table.style, {
      display      : 'flex',
      flexDirection: 'column',
      gap          : '10px',
      width        : '320px',
    });

    for (const [action, label] of Object.entries(ACTION_LABELS)) {
      const row = document.createElement('div');
      Object.assign(row.style, {
        display       : 'flex',
        justifyContent: 'space-between',
        alignItems    : 'center',
        background    : 'rgba(255,255,255,0.04)',
        borderRadius  : '8px',
        padding       : '8px 14px',
        border        : '1px solid rgba(201,168,76,0.15)',
      });

      const actionLabel = document.createElement('div');
      Object.assign(actionLabel.style, {
        fontFamily   : 'monospace',
        fontSize     : '12px',
        color        : '#C9A84C',
        letterSpacing: '1px',
      });
      actionLabel.textContent = label;

      const keyBtn = document.createElement('button');
      Object.assign(keyBtn.style, {
        fontFamily  : 'monospace',
        fontSize    : '11px',
        color       : '#fff',
        background  : 'rgba(255,255,255,0.08)',
        border      : '1px solid rgba(255,255,255,0.2)',
        borderRadius: '6px',
        padding     : '4px 12px',
        cursor      : 'pointer',
        minWidth    : '80px',
        textAlign   : 'center',
        transition  : 'background 0.15s, border 0.15s',
      });

      keyBtn.addEventListener('click', () => this._startListening(action, keyBtn));

      row.appendChild(actionLabel);
      row.appendChild(keyBtn);
      table.appendChild(row);
      this._rows[action] = keyBtn;
    }

    this._overlay.appendChild(table);

    const btnRow = document.createElement('div');
    Object.assign(btnRow.style, {
      display  : 'flex',
      gap      : '12px',
      marginTop: '24px',
    });

    const resetBtn = document.createElement('button');
    resetBtn.textContent = 'RESET';
    Object.assign(resetBtn.style, {
      fontFamily   : 'monospace',
      fontSize     : '11px',
      color        : '#C9A84C',
      background   : 'transparent',
      border       : '1px solid rgba(201,168,76,0.4)',
      borderRadius : '8px',
      padding      : '8px 20px',
      cursor       : 'pointer',
      letterSpacing: '2px',
    });
    resetBtn.addEventListener('click', () => {
      this._kb.resetDefaults(); // ← nombre correcto
      this._refresh();
    });

    const closeBtn = document.createElement('button');
    closeBtn.textContent = 'CERRAR';
    Object.assign(closeBtn.style, {
      fontFamily   : 'monospace',
      fontSize     : '11px',
      color        : '#fff',
      background   : 'rgba(201,168,76,0.2)',
      border       : '1px solid rgba(201,168,76,0.4)',
      borderRadius : '8px',
      padding      : '8px 20px',
      cursor       : 'pointer',
      letterSpacing: '2px',
    });
    closeBtn.addEventListener('click', () => this.close());

    btnRow.appendChild(resetBtn);
    btnRow.appendChild(closeBtn);
    this._overlay.appendChild(btnRow);

    const hint = document.createElement('div');
    Object.assign(hint.style, {
      fontFamily   : 'monospace',
      fontSize     : '9px',
      color        : 'rgba(255,255,255,0.3)',
      marginTop    : '16px',
      letterSpacing: '1px',
    });
    hint.textContent = 'Haz click en un botón y presiona la tecla que quieres asignar';
    this._overlay.appendChild(hint);

    document.body.appendChild(this._overlay);

    window.addEventListener('keydown', (e) => {
      if (!this._waiting) return;
      e.preventDefault();
      if (e.code === 'Escape') { this._cancelListening(); return; }
      this._kb.setBind(this._waiting, e.code);
      this._refresh();
      this._waiting = null;
    });
  }

  _startListening(action, btn) {
    this._waiting = action;
    Object.values(this._rows).forEach(b => {
      b.style.background = 'rgba(255,255,255,0.08)';
      b.style.border     = '1px solid rgba(255,255,255,0.2)';
      b.style.color      = '#fff';
    });
    btn.style.background = 'rgba(201,168,76,0.3)';
    btn.style.border     = '1px solid #C9A84C';
    btn.style.color      = '#C9A84C';
    btn.textContent      = '...';
  }

  _cancelListening() {
    this._waiting = null;
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
