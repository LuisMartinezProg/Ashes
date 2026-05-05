// ui/dialogue.js
// Ashes of the Reborn | Valiant Gaming

export class DialogueUI {
  constructor() {
    this._active   = false;
    this._lines    = [];
    this._idx      = 0;
    this._onClose  = null;

    this._buildPanel();
    this._buildTalkBtn();
  }

  // ── API pública ──────────────────────────────────────────────────────────

  showTalkBtn(onTalk) {
    this._talkBtn.style.display = 'block';
    this._talkBtn.onclick = () => {
      this.hideTalkBtn();
      if (onTalk) onTalk();
    };
  }

  hideTalkBtn() {
    this._talkBtn.style.display = 'none';
  }

  openDialogue(name, lines, onClose = null) {
    this._lines   = lines;
    this._idx     = 0;
    this._onClose = onClose;
    this._active  = true;

    this._nameEl.textContent = name;
    this._showLine();
    this._panel.style.display = 'flex';
  }

  closeDialogue() {
    this._active = false;
    this._panel.style.display = 'none';
    if (this._onClose) this._onClose();
  }

  isActive() { return this._active; }

  // ── Construcción DOM ─────────────────────────────────────────────────────

  _buildPanel() {
    this._panel = document.createElement('div');
    Object.assign(this._panel.style, {
      display        : 'none',
      position       : 'fixed',
      bottom         : '120px',
      left           : '50%',
      transform      : 'translateX(-50%)',
      width          : '88vw',
      maxWidth       : '420px',
      background     : 'rgba(4,4,14,0.92)',
      border         : '1px solid rgba(201,168,76,0.35)',
      borderRadius   : '8px',
      padding        : '14px 16px',
      flexDirection  : 'column',
      gap            : '10px',
      zIndex         : '200',
      pointerEvents  : 'all',
      boxShadow      : '0 0 24px rgba(201,168,76,0.1)',
    });

    // Nombre del NPC
    this._nameEl = document.createElement('div');
    Object.assign(this._nameEl.style, {
      color        : '#C9A84C',
      fontFamily   : 'monospace',
      fontSize     : '11px',
      letterSpacing: '0.2em',
      textTransform: 'uppercase',
    });

    // Texto de la línea
    this._lineEl = document.createElement('div');
    Object.assign(this._lineEl.style, {
      color      : 'rgba(255,245,220,0.88)',
      fontFamily : 'monospace',
      fontSize   : '13px',
      lineHeight : '1.6',
      minHeight  : '40px',
    });

    // Botón siguiente/cerrar
    this._nextBtn = document.createElement('button');
    Object.assign(this._nextBtn.style, {
      alignSelf       : 'flex-end',
      padding         : '6px 18px',
      background      : 'rgba(201,168,76,0.15)',
      border          : '1px solid rgba(201,168,76,0.4)',
      borderRadius    : '4px',
      color           : '#C9A84C',
      fontFamily      : 'monospace',
      fontSize        : '11px',
      letterSpacing   : '0.15em',
      cursor          : 'pointer',
      pointerEvents   : 'all',
      outline         : 'none',
      WebkitTapHighlightColor: 'transparent',
    });

    this._nextBtn.addEventListener('touchstart', (e) => {
      e.preventDefault();
      this._advance();
    }, { passive: false });
    this._nextBtn.addEventListener('mousedown', () => this._advance());

    this._panel.appendChild(this._nameEl);
    this._panel.appendChild(this._lineEl);
    this._panel.appendChild(this._nextBtn);
    document.body.appendChild(this._panel);
  }

  _buildTalkBtn() {
    this._talkBtn = document.createElement('button');
    this._talkBtn.textContent = '💬 Hablar';
    Object.assign(this._talkBtn.style, {
      display         : 'none',
      position        : 'fixed',
      bottom          : '180px',
      left            : '50%',
      transform       : 'translateX(-50%)',
      padding         : '10px 24px',
      background      : 'rgba(4,4,14,0.85)',
      border          : '1px solid rgba(201,168,76,0.5)',
      borderRadius    : '20px',
      color           : '#C9A84C',
      fontFamily      : 'monospace',
      fontSize        : '12px',
      letterSpacing   : '0.15em',
      cursor          : 'pointer',
      pointerEvents   : 'all',
      zIndex          : '200',
      outline         : 'none',
      WebkitTapHighlightColor: 'transparent',
      boxShadow       : '0 0 12px rgba(201,168,76,0.2)',
    });
    document.body.appendChild(this._talkBtn);
  }

  // ── Lógica de diálogo ────────────────────────────────────────────────────

  _showLine() {
    this._lineEl.textContent = this._lines[this._idx];
    const isLast = this._idx >= this._lines.length - 1;
    this._nextBtn.textContent = isLast ? 'CERRAR' : 'SIGUIENTE ▶';
  }

  _advance() {
    this._idx++;
    if (this._idx >= this._lines.length) {
      this.closeDialogue();
    } else {
      this._showLine();
    }
  }
}
