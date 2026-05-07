// ui/fusionMenu.js — Ashes of the Reborn | Valiant Gaming

import { SKILL_DATA } from '../core/skillData.js';

// Efectos especiales por combinación arma+magia
const FUSION_EFFECTS = {
  'katana+fire' : { label: 'Quemadura',  desc: 'Daño por segundo al impactar',      color: '#ff6600' },
  'katana+ice'  : { label: 'Ralentizar', desc: 'Reduce velocidad del enemigo',       color: '#88ccff' },
  'sword+wind'  : { label: 'Empuje',     desc: 'Lanza al enemigo hacia atrás',       color: '#aaffee' },
  'sword+plant' : { label: 'Enredar',    desc: 'Inmoviliza al enemigo brevemente',   color: '#44cc44' },
  'bow+poison'  : { label: 'Veneno',     desc: 'Daño acumulativo por segundo',       color: '#88cc44' },
  'bow+wind'    : { label: 'Perforar',   desc: 'La flecha atraviesa varios enemigos', color: '#aaeeff' },
};

const MAGIC_SCHOOLS = ['fire', 'ice', 'plant', 'wind'];

const MAGIC_LABELS = {
  fire : { label: 'Fuego',  icon: '🔥', color: '#ff4400' },
  ice  : { label: 'Hielo',  icon: '❄️', color: '#88ccff' },
  plant: { label: 'Planta', icon: '🌿', color: '#44cc44' },
  wind : { label: 'Viento', icon: '🌪️', color: '#aaeeff' },
};

export class FusionMenu {
  constructor(progression, skillBar, skillSystem) {
    this.progression = progression;
    this.skillBar    = skillBar;
    this.skillSystem = skillSystem;
    this._weapon     = null;
    this._selected   = null;
    this._isOpen     = false;
    this._overlay    = null;
    this._container  = null;

    this._build();
  }

  // ── API pública ───────────────────────────────────────────────────────────

  setWeapon(weapon) { this._weapon = weapon; }

  open(weapon) {
    if (this._isOpen) return;
    this._weapon  = weapon ?? this._weapon;
    this._isOpen  = true;
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
      padding      : '20px 16px 36px',
      transform    : 'translateY(40px)',
      transition   : 'transform 0.3s ease',
      maxHeight    : '80vh',
      overflowY    : 'auto',
    });

    this._overlay.appendChild(this._container);
    document.body.appendChild(this._overlay);
  }

  _render() {
    if (!this._weapon) return;
    this._container.innerHTML = '';

    // Header
    const header = document.createElement('div');
    Object.assign(header.style, {
      display        : 'flex',
      alignItems     : 'center',
      justifyContent : 'space-between',
      marginBottom   : '16px',
    });

    const title = document.createElement('div');
    Object.assign(title.style, {
      fontFamily   : 'Georgia, serif',
      fontSize     : '14px',
      letterSpacing: '0.2em',
      color        : '#C9A84C',
      textTransform: 'uppercase',
    });
    title.textContent = 'Fusión — Elige Escuela Mágica';

    const closeBtn = document.createElement('button');
    Object.assign(closeBtn.style, {
      background   : 'none',
      border       : '1px solid rgba(255,255,255,0.15)',
      borderRadius : '6px',
      color        : 'rgba(255,255,255,0.5)',
      fontFamily   : 'monospace',
      fontSize     : '11px',
      padding      : '4px 10px',
      cursor       : 'pointer',
      pointerEvents: 'all',
    });
    closeBtn.textContent = 'CERRAR';
    const doClose = (e) => { e.preventDefault(); this.close(); };
    closeBtn.addEventListener('click', doClose);
    closeBtn.addEventListener('touchstart', doClose, { passive: false });

    header.appendChild(title);
    header.appendChild(closeBtn);
    this._container.appendChild(header);

    // Info del arma activa
    const weaponData = SKILL_DATA[this._weapon];
    const weaponInfo = document.createElement('div');
    Object.assign(weaponInfo.style, {
      fontFamily   : 'monospace',
      fontSize     : '10px',
      color        : 'rgba(201,168,76,0.6)',
      letterSpacing: '0.15em',
      marginBottom : '16px',
      padding      : '8px 12px',
      background   : 'rgba(201,168,76,0.06)',
      borderRadius : '6px',
    });
    weaponInfo.textContent = `ARMA ACTIVA: ${weaponData?.label?.toUpperCase() ?? this._weapon.toUpperCase()}  •  +25% DAÑO BASE EN FUSIÓN`;
    this._container.appendChild(weaponInfo);

    // Grid de escuelas mágicas
    const grid = document.createElement('div');
    Object.assign(grid.style, {
      display             : 'grid',
      gridTemplateColumns : 'repeat(2, 1fr)',
      gap                 : '10px',
      marginBottom        : '20px',
    });

    const activeFusion = this.progression.getActiveFusion(this._weapon);

    MAGIC_SCHOOLS.forEach(school => {
      const card = this._buildSchoolCard(school, activeFusion);
      grid.appendChild(card);
    });

    this._container.appendChild(grid);

    // Botón aplicar
    const applyBtn = document.createElement('button');
    Object.assign(applyBtn.style, {
      width          : '100%',
      padding        : '14px',
      background     : 'linear-gradient(135deg, #7A6030, #C9A84C)',
      border         : 'none',
      borderRadius   : '8px',
      color          : '#04040A',
      fontFamily     : 'Georgia, serif',
      fontSize       : '13px',
      letterSpacing  : '0.2em',
      textTransform  : 'uppercase',
      cursor         : 'pointer',
      pointerEvents  : 'all',
      opacity        : this._selected ? '1' : '0.4',
      transition     : 'opacity 0.2s, transform 0.1s',
      WebkitTapHighlightColor: 'transparent',
    });
    applyBtn.textContent   = 'APLICAR FUSIÓN';
    applyBtn.id            = 'fusion-apply-btn';

    const doApply = (e) => {
      e.preventDefault();
      if (!this._selected) return;
      this.progression.setActiveFusion(this._weapon, this._selected);
      this.skillSystem.applyFusion(this._weapon, this._selected);
      this.skillBar.setWeapon(this._weapon);
      console.log(`[Fusion] ${this._weapon} + ${this._selected}`);
      applyBtn.textContent = '✓ FUSIÓN APLICADA';
      setTimeout(() => this.close(), 800);
    };
    applyBtn.addEventListener('click', doApply);
    applyBtn.addEventListener('touchstart', doApply, { passive: false });

    this._container.appendChild(applyBtn);
  }

  _buildSchoolCard(school, activeFusion) {
    const info      = MAGIC_LABELS[school];
    const fusionKey = `${this._weapon}+${school}`;
    const effect    = FUSION_EFFECTS[fusionKey];
    const isActive  = activeFusion === school;
    const isSelected = this._selected === school;

    const card = document.createElement('div');
    Object.assign(card.style, {
      background   : isActive || isSelected
        ? `rgba(${this._hexToRgb(info.color)},0.12)`
        : 'rgba(255,255,255,0.04)',
      border       : `1px solid ${isActive || isSelected ? info.color : 'rgba(255,255,255,0.1)'}`,
      borderRadius : '10px',
      padding      : '14px 12px',
      cursor       : 'pointer',
      transition   : 'transform 0.15s, border-color 0.15s',
      pointerEvents: 'all',
      userSelect   : 'none',
      WebkitUserSelect: 'none',
      WebkitTapHighlightColor: 'transparent',
    });

    // Icono + nombre
    const top = document.createElement('div');
    Object.assign(top.style, {
      display      : 'flex',
      alignItems   : 'center',
      gap          : '8px',
      marginBottom : '8px',
    });

    const icon = document.createElement('div');
    icon.style.fontSize  = '20px';
    icon.textContent     = info.icon;

    const name = document.createElement('div');
    Object.assign(name.style, {
      fontFamily   : 'Georgia, serif',
      fontSize     : '13px',
      color        : isActive || isSelected ? info.color : '#ccc',
    });
    name.textContent = info.label;

    top.appendChild(icon);
    top.appendChild(name);
    card.appendChild(top);

    // Efecto especial si existe
    if (effect) {
      const effectEl = document.createElement('div');
      Object.assign(effectEl.style, {
        display      : 'flex',
        alignItems   : 'center',
        gap          : '6px',
        marginBottom : '6px',
      });

      const dot = document.createElement('div');
      Object.assign(dot.style, {
        width       : '6px',
        height      : '6px',
        borderRadius: '50%',
        background  : effect.color,
        flexShrink  : '0',
      });

      const effectLabel = document.createElement('div');
      Object.assign(effectLabel.style, {
        fontFamily  : 'monospace',
        fontSize    : '9px',
        color       : effect.color,
        letterSpacing: '0.1em',
        fontWeight  : 'bold',
      });
      effectLabel.textContent = effect.label.toUpperCase();

      effectEl.appendChild(dot);
      effectEl.appendChild(effectLabel);
      card.appendChild(effectEl);

      const effectDesc = document.createElement('div');
      Object.assign(effectDesc.style, {
        fontFamily  : 'monospace',
        fontSize    : '9px',
        color       : 'rgba(180,160,120,0.5)',
        lineHeight  : '1.4',
      });
      effectDesc.textContent = effect.desc;
      card.appendChild(effectDesc);
    } else {
      const noEffect = document.createElement('div');
      Object.assign(noEffect.style, {
        fontFamily : 'monospace',
        fontSize   : '9px',
        color      : 'rgba(255,255,255,0.2)',
      });
      noEffect.textContent = '+25% daño base';
      card.appendChild(noEffect);
    }

    // Badge activo
    if (isActive) {
      const badge = document.createElement('div');
      Object.assign(badge.style, {
        marginTop    : '8px',
        fontFamily   : 'monospace',
        fontSize     : '8px',
        letterSpacing: '0.2em',
        color        : '#C9A84C',
      });
      badge.textContent = '✓ ACTIVO';
      card.appendChild(badge);
    }

    // Evento seleccionar
    const select = (e) => {
      e.preventDefault();
      this._selected = school;
      this._render();
    };
    card.addEventListener('click', select);
    card.addEventListener('touchstart', select, { passive: false });

    return card;
  }

  _hexToRgb(hex) {
    const r = parseInt(hex.slice(1,3),16);
    const g = parseInt(hex.slice(3,5),16);
    const b = parseInt(hex.slice(5,7),16);
    return `${r},${g},${b}`;
  }
  }
