// ui/mainMenu.js — Ashes of the Reborn | Valiant Gaming
//
// Menú principal. Fondo: la escena 3D del mundo ya renderizada, con overlay
// oscuro + UI encima. Muestra "Continuar" solo si hay partida guardada.

import { hasSaveGame, getSaveInfo, loadGame, deleteSaveGame } from '../core/saveSystem.js';

const ACCENT       = '#EDD47A'; // Acento global MochiGo
const BG_DARK       = 'rgba(4,4,10,0.55)';

export class MainMenu {
  constructor() {
    this._onContinue  = null; // callback()
    this._onNewGame   = null; // callback()
    this._onSettings  = null; // callback()
    this._visible     = false;
    this._buildUI();
  }

  _buildUI() {
    this._overlay = document.createElement('div');
    Object.assign(this._overlay.style, {
      position       : 'fixed',
      inset          : '0',
      background     : `linear-gradient(180deg, rgba(4,4,10,0.35) 0%, ${BG_DARK} 55%, rgba(4,4,10,0.85) 100%)`,
      zIndex         : '700',
      display        : 'none',
      flexDirection  : 'column',
      alignItems     : 'center',
      justifyContent : 'flex-end',
      paddingBottom  : '14vh',
    });

    // ── Título / logo (texto por ahora, reemplazable por logo real después) ──
    const title = document.createElement('div');
    Object.assign(title.style, {
      position     : 'absolute',
      top          : '16vh',
      left         : '50%',
      transform    : 'translateX(-50%)',
      fontFamily   : "'Cinzel', serif",
      fontSize     : 'clamp(28px, 6vw, 46px)',
      letterSpacing: '6px',
      color        : ACCENT,
      textAlign    : 'center',
      textShadow   : '0 4px 24px rgba(0,0,0,0.6)',
    });
    title.innerHTML = `ASHES<br><span style="font-size:0.5em;letter-spacing:10px;opacity:0.75">OF THE REBORN</span>`;

    // ── Contenedor de botones ──────────────────────────────────────────────
    this._btnWrap = document.createElement('div');
    Object.assign(this._btnWrap.style, {
      display       : 'flex',
      flexDirection : 'column',
      gap           : '12px',
      width         : '78vw',
      maxWidth      : '320px',
    });

    this._overlay.append(title, this._btnWrap);
    document.body.appendChild(this._overlay);

    this._renderButtons();
  }

  _renderButtons() {
    this._btnWrap.innerHTML = '';

    const hasSave = hasSaveGame();
    const info    = hasSave ? getSaveInfo() : null;

    if (hasSave) {
      const label = info
        ? `Continuar — Nv.${info.level} · ${this._formatTime(info.timestamp)}`
        : 'Continuar';
      this._btnWrap.appendChild(this._makeButton(label, () => this._handleContinue(), true));
    }

    this._btnWrap.appendChild(this._makeButton(
      hasSave ? 'Nueva Partida' : 'Jugar',
      () => this._handleNewGame(),
      !hasSave // si no hay save, este es el botón principal (más destacado)
    ));

    this._btnWrap.appendChild(this._makeButton('Configuración', () => {
      this._onSettings?.();
    }));
  }

  _makeButton(label, onClick, primary = false) {
    const btn = document.createElement('button');
    Object.assign(btn.style, {
      padding      : '14px 20px',
      borderRadius : '10px',
      border       : primary ? `1.5px solid ${ACCENT}` : '1px solid rgba(237,212,122,0.35)',
      background   : primary ? 'rgba(237,212,122,0.16)' : 'rgba(10,8,20,0.55)',
      color        : primary ? ACCENT : 'rgba(237,212,122,0.75)',
      fontFamily   : "'Cinzel', serif",
      fontSize     : '13px',
      letterSpacing: '2px',
      textTransform: 'uppercase',
      cursor       : 'pointer',
      pointerEvents: 'all',
      WebkitTapHighlightColor: 'transparent',
      transition   : 'background 0.2s, border-color 0.2s',
    });
    btn.textContent = label;

    const activate = () => onClick();
    btn.addEventListener('click', activate);
    btn.addEventListener('touchstart', (e) => { e.preventDefault(); activate(); }, { passive: false });

    return btn;
  }

  _handleContinue() {
    const ok = loadGame();
    if (ok) {
      this.hide();
      this._onContinue?.();
    } else {
      // Save corrupto o inexistente pese al chequeo: re-renderiza sin "Continuar"
      this._renderButtons();
    }
  }

  _handleNewGame() {
    if (hasSaveGame()) {
      this._confirmOverwrite(() => {
        deleteSaveGame();
        this.hide();
        this._onNewGame?.();
      });
    } else {
      this.hide();
      this._onNewGame?.();
    }
  }

  _confirmOverwrite(onConfirm) {
    const box = document.createElement('div');
    Object.assign(box.style, {
      position      : 'fixed',
      inset         : '0',
      background    : 'rgba(0,0,0,0.7)',
      zIndex        : '750',
      display       : 'flex',
      alignItems    : 'center',
      justifyContent: 'center',
    });

    const panel = document.createElement('div');
    Object.assign(panel.style, {
      background   : 'rgba(10,8,20,0.97)',
      border       : `1px solid ${ACCENT}`,
      borderRadius : '12px',
      padding      : '22px 20px',
      maxWidth     : '300px',
      textAlign    : 'center',
    });

    const msg = document.createElement('div');
    Object.assign(msg.style, {
      fontFamily: "'Crimson Pro', serif",
      fontSize  : '14px',
      color     : '#e8dcc8',
      marginBottom: '18px',
      lineHeight: '1.5',
    });
    msg.textContent = 'Iniciar una nueva partida borrará tu progreso guardado. ¿Continuar?';

    const actions = document.createElement('div');
    Object.assign(actions.style, { display: 'flex', gap: '10px' });

    const cancelBtn = this._makeButton('Cancelar', () => box.remove());
    const confirmBtn = this._makeButton('Borrar y Empezar', () => {
      box.remove();
      onConfirm();
    }, true);

    actions.append(cancelBtn, confirmBtn);
    panel.append(msg, actions);
    box.appendChild(panel);
    document.body.appendChild(box);
  }

  _formatTime(timestamp) {
    if (!timestamp) return '';
    const diffMs = Date.now() - timestamp;
    const mins   = Math.floor(diffMs / 60000);
    if (mins < 1)   return 'ahora mismo';
    if (mins < 60)  return `hace ${mins} min`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `hace ${hours}h`;
    const days = Math.floor(hours / 24);
    return `hace ${days}d`;
  }

  // ── API pública ────────────────────────────────────────────────────────

  onContinue(cb) { this._onContinue = cb; }
  onNewGame(cb)  { this._onNewGame  = cb; }
  onSettings(cb) { this._onSettings = cb; }

  show() {
    this._renderButtons(); // re-chequea si hay save cada vez que se muestra
    this._overlay.style.display = 'flex';
    this._visible = true;
  }

  hide() {
    this._overlay.style.display = 'none';
    this._visible = false;
  }

  isVisible() { return this._visible; }
}
