// ui/dialogue.js
// Ashes of the Reborn | Valiant Gaming

import { DIALOGUE_UI } from '../data/palette.js';

export class DialogueUI {
  constructor() {
    this._active   = false;
    this._lines    = [];
    this._idx      = 0;
    this._onClose  = null;
    this._onShop   = null;

    this._buildPanel();
    this._buildTalkBtn();
  }

  // ── API pública ──────────────────────────────────────────────────────────
  showTalkBtn(onTalk) {
    this._talkBtn.style.display = 'block';

    const handler = (e) => {
      e.preventDefault();
      this.hideTalkBtn();
      if (onTalk) onTalk();
    };

    if (this._talkHandler) {
      this._talkBtn.removeEventListener('touchstart', this._talkHandler);
      this._talkBtn.removeEventListener('mousedown', this._talkHandler);
    }
    this._talkHandler = handler;

    this._talkBtn.addEventListener('touchstart', handler, { passive: false });
    this._talkBtn.addEventListener('mousedown', handler);
  }

  hideTalkBtn() {
    this._talkBtn.style.display = 'none';
  }

  openDialogue(name, lines, onClose = null, onShop = null) {
    this._lines   = lines;
    this._idx     = 0;
    this._onClose = onClose;
    this._onShop  = onShop;
    this._active  = true;

    this._nameEl.textContent = name;
    this._shopBtn.style.display = onShop ? 'block' : 'none';
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
      border         : `1px solid ${DIALOGUE_UI.border}`,
      borderRadius   : '8px',
      padding        : '14px 16px',
      flexDirection  : 'column',
      gap            : '10px',
      zIndex         : '200',
      pointerEvents  : 'all',
      boxShadow      : `0 0 24px ${DIALOGUE_UI.glow}`,
    });

    const headerRow = document.createElement('div');
    Object.assign(headerRow.style, {
      display        : 'flex',
      justifyContent : 'space-between',
      alignItems     : 'center',
    });

    this._nameEl = document.createElement('div');
    Object.assign(this._nameEl.style, {
      color        : DIALOGUE_UI.name,
      fontFamily   : 'monospace',
      fontSize     : '11px',
      letterSpacing: '0.2em',
      textTransform: 'uppercase',
    });

    this._shopBtn = document.createElement('button');
    this._shopBtn.textContent = '🛒 Comprar';
    Object.assign(this._shopBtn.style, {
      display      : 'none',
      padding      : '5px 12px',
      background   : DIALOGUE_UI.shopBtnBg,
      border       : `1px solid ${DIALOGUE_UI.shopBtnBorder}`,
      borderRadius : '4px',
      color        : DIALOGUE_UI.name,
      fontFamily   : 'monospace',
      fontSize     : '10px',
      cursor       : 'pointer',
      pointerEvents: 'all',
      outline      : 'none',
      WebkitTapHighlightColor: 'transparent',
    });
    this._shopBtn.addEventListener('touchstart', (e) => {
      e.preventDefault();
      this.closeDialogue();
      if (this._onShop) this._onShop();
    }, { passive: false });
    this._shopBtn.addEventListener('mousedown', () => {
      this.closeDialogue();
      if (this._onShop) this._onShop();
    });

    headerRow.appendChild(this._nameEl);
    headerRow.appendChild(this._shopBtn);

    this._lineEl = document.createElement('div');
    Object.assign(this._lineEl.style, {
      color      : DIALOGUE_UI.text,
      fontFamily : 'monospace',
      fontSize   : '13px',
      lineHeight : '1.6',
      minHeight  : '40px',
    });

    this._nextBtn = document.createElement('button');
    Object.assign(this._nextBtn.style, {
      alignSelf       : 'flex-end',
      padding         : '6px 18px',
      background      : DIALOGUE_UI.nextBtnBg,
      border          : `1px solid ${DIALOGUE_UI.nextBtnBorder}`,
      borderRadius    : '4px',
      color           : DIALOGUE_UI.name,
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

    this._panel.appendChild(headerRow);
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
      background      : DIALOGUE_UI.talkBtnBg,
      border          : `1px solid ${DIALOGUE_UI.talkBtnBorder}`,
      borderRadius    : '20px',
      color           : DIALOGUE_UI.name,
      fontFamily      : 'monospace',
      fontSize        : '12px',
      letterSpacing   : '0.15em',
      cursor          : 'pointer',
      pointerEvents   : 'all',
      zIndex          : '200',
      outline         : 'none',
      WebkitTapHighlightColor: 'transparent',
      boxShadow       : `0 0 12px ${DIALOGUE_UI.glow}`,
    });
    document.body.appendChild(this._talkBtn);
  }

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
