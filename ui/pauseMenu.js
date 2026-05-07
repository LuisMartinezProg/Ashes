// ui/pauseMenu.js — Ashes of the Reborn | Valiant Gaming

export class PauseMenu {
  constructor({ onSubtype, onFusion, onResume, getFusionUnlocked }) {
    this._onSubtype          = onSubtype;
    this._onFusion           = onFusion;
    this._onResume           = onResume;
    this._getFusionUnlocked  = getFusionUnlocked;
    this._isOpen             = false;
    this._overlay            = null;
    this._container          = null;

    this._build();
  }

  // ── API pública ───────────────────────────────────────────────────────────

  open() {
    if (this._isOpen) return;
    this._isOpen = true;
    this._render();
    this._overlay.style.display = 'flex';
    requestAnimationFrame(() => {
      this._overlay.style.opacity     = '1';
      this._container.style.transform = 'translateY(0)';
    });
  }

  close() {
    if (!this._isOpen) return;
    this._overlay.style.opacity     = '0';
    this._container.style.transform = 'translateY(40px)';
    setTimeout(() => {
      this._overlay.style.display = 'none';
      this._isOpen = false;
    }, 300);
  }

  isOpen() { return this._isOpen; }

  // ── Build ─────────────────────────────────────────────────────────────────

  _build() {
    this._overlay = document.createElement('div');
    Object.assign(this._overlay.style, {
      position      : 'fixed',
      inset         : '0',
      zIndex        : '300',
      background    : 'rgba(2,2,10,0.88)',
      display       : 'none',
      alignItems    : 'flex-end',
      justifyContent: 'center',
      opacity       : '0',
      transition    : 'opacity 0.3s ease',
    });

    this._overlay.addEventListener('click', (e) => {
      if (e.target === this._overlay) this.close();
    });

    this._container = document.createElement('div');
    Object.assign(this._container.style, {
      width        : '100%',
      maxWidth     : '480px',
      background   : '#08060f',
      borderTop    : '1px solid rgba(201,168,76,0.25)',
      borderRadius : '16px 16px 0 0',
      padding      : '24px 16px 40px',
      transform    : 'translateY(40px)',
      transition   : 'transform 0.3s ease',
    });

    this._overlay.appendChild(this._container);
    document.body.appendChild(this._overlay);
  }

  _render() {
    this._container.innerHTML = '';

    // Título
    const title = document.createElement('div');
    Object.assign(title.style, {
      fontFamily   : 'Georgia, serif',
      fontSize     : '13px',
      letterSpacing: '0.3em',
      color        : '#C9A84C',
      textTransform: 'uppercase',
      textAlign    : 'center',
      marginBottom : '24px',
    });
    title.textContent = 'MENÚ';
    this._container.appendChild(title);

    // Opciones
    const options = [
      {
        icon   : '⚗',
        label  : 'Habilidades',
        sub    : 'Cambiar subtipo de arma',
        action : this._onSubtype,
        show   : true,
      },
      {
        icon   : '🔮',
        label  : 'Fusión Arma + Magia',
        sub    : 'Combina tu arma con una escuela mágica',
        action : this._onFusion,
        show   : this._getFusionUnlocked(),
        locked : !this._getFusionUnlocked(),
      },
      {
        icon   : '▶',
        label  : 'Continuar',
        sub    : 'Volver al juego',
        action : this._onResume,
        show   : true,
      },
    ];

    options.forEach(opt => {
      if (!opt.show && opt.locked !== true) return;
      const btn = this._buildOption(opt);
      this._container.appendChild(btn);
    });
  }

  _buildOption({ icon, label, sub, action, locked }) {
    const btn = document.createElement('div');
    Object.assign(btn.style, {
      display        : 'flex',
      alignItems     : 'center',
      gap            : '14px',
      padding        : '14px 12px',
      borderRadius   : '10px',
      marginBottom   : '8px',
      background     : locked ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.05)',
      border         : `1px solid ${locked ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.1)'}`,
      cursor         : locked ? 'default' : 'pointer',
      opacity        : locked ? '0.4' : '1',
      transition     : 'background 0.15s, transform 0.1s',
      pointerEvents  : 'all',
      userSelect     : 'none',
      WebkitUserSelect: 'none',
      WebkitTapHighlightColor: 'transparent',
    });

    const iconEl = document.createElement('div');
    Object.assign(iconEl.style, {
      fontSize      : '22px',
      width         : '32px',
      textAlign     : 'center',
      flexShrink    : '0',
    });
    iconEl.textContent = locked ? '🔒' : icon;

    const textWrap = document.createElement('div');

    const labelEl = document.createElement('div');
    Object.assign(labelEl.style, {
      fontFamily   : 'Georgia, serif',
      fontSize     : '13px',
      color        : '#ddd',
      letterSpacing: '0.05em',
      marginBottom : '2px',
    });
    labelEl.textContent = label;

    const subEl = document.createElement('div');
    Object.assign(subEl.style, {
      fontFamily  : 'monospace',
      fontSize    : '9px',
      color       : 'rgba(180,160,120,0.5)',
      letterSpacing: '0.05em',
    });
    subEl.textContent = locked ? 'Asiste a la Escuela de Fusión para desbloquear' : sub;

    textWrap.appendChild(labelEl);
    textWrap.appendChild(subEl);
    btn.appendChild(iconEl);
    btn.appendChild(textWrap);

    if (!locked) {
      const press = (e) => {
        e.preventDefault();
        btn.style.transform = 'scale(0.97)';
        setTimeout(() => { btn.style.transform = 'scale(1)'; }, 120);
        action();
      };
      btn.addEventListener('click', press);
      btn.addEventListener('touchstart', press, { passive: false });

      btn.addEventListener('mouseenter', () => {
        btn.style.background = 'rgba(255,255,255,0.09)';
      });
      btn.addEventListener('mouseleave', () => {
        btn.style.background = 'rgba(255,255,255,0.05)';
      });
    }

    return btn;
  }
      }
