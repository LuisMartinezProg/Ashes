// ui/subtypeMenu.js — Ashes of the Reborn | Valiant Gaming
// Menú para cambiar subtipo de arma fuera de combate

import { SKILL_DATA, RARITY_COLORS } from '../core/skillData.js';

export class SubtypeMenu {
  constructor(progression, skillBar) {
    this.progression = progression;
    this.skillBar    = skillBar;
    this._weapon     = null;
    this._container  = null;
    this._overlay    = null;
    this._isOpen     = false;

    this._build();
  }

  // ── API pública ───────────────────────────────────────────────────────────

  setWeapon(weaponType) {
    this._weapon = weaponType;
  }

  open(weapon) {
    if (this._isOpen) return;
    this._weapon  = weapon ?? this._weapon;
    this._isOpen  = true;
    this._render();
    this._overlay.style.display = 'flex';
    requestAnimationFrame(() => {
      this._overlay.style.opacity = '1';
      this._container.style.transform = 'translateY(0)';
    });
  }

  close() {
    if (!this._isOpen) return;
    this._overlay.style.opacity = '0';
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

    // Cerrar al tocar fondo
    this._overlay.addEventListener('click', (e) => {
      if (e.target === this._overlay) this.close();
    });

    this._container = document.createElement('div');
    Object.assign(this._container.style, {
      width          : '100%',
      maxWidth       : '480px',
      background     : '#08060f',
      borderTop      : '1px solid rgba(201,168,76,0.25)',
      borderRadius   : '16px 16px 0 0',
      padding        : '20px 16px 32px',
      transform      : 'translateY(40px)',
      transition     : 'transform 0.3s ease',
      maxHeight      : '75vh',
      overflowY      : 'auto',
    });

    this._overlay.appendChild(this._container);
    document.body.appendChild(this._overlay);
  }

  _render() {
    if (!this._weapon) return;
    const weaponData = SKILL_DATA[this._weapon];
    if (!weaponData) return;

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
    title.textContent = `${weaponData.label} — Subtipo`;

    const closeBtn = document.createElement('button');
    Object.assign(closeBtn.style, {
      background  : 'none',
      border      : '1px solid rgba(255,255,255,0.15)',
      borderRadius: '6px',
      color       : 'rgba(255,255,255,0.5)',
      fontFamily  : 'monospace',
      fontSize    : '11px',
      padding     : '4px 10px',
      cursor      : 'pointer',
      pointerEvents: 'all',
    });
    closeBtn.textContent = 'CERRAR';
    closeBtn.addEventListener('click', () => this.close());
    closeBtn.addEventListener('touchstart', (e) => { e.preventDefault(); this.close(); }, { passive: false });

    header.appendChild(title);
    header.appendChild(closeBtn);
    this._container.appendChild(header);

    // XP actual
    const xp = this.progression.getXP(this._weapon);
    const xpBar = this._buildXPBar(xp);
    this._container.appendChild(xpBar);

    // Grid de subtipos
    const grid = document.createElement('div');
    Object.assign(grid.style, {
      display             : 'grid',
      gridTemplateColumns : 'repeat(2, 1fr)',
      gap                 : '10px',
      marginTop           : '16px',
    });

    const activeSubtype = this.progression.getActiveSubtype(this._weapon);

    Object.entries(weaponData.subtypes).forEach(([subtypeId, subtype]) => {
      const card = this._buildSubtypeCard(subtypeId, subtype, activeSubtype, xp);
      grid.appendChild(card);
    });

    this._container.appendChild(grid);
  }

  _buildXPBar(xp) {
    const wrap = document.createElement('div');
    Object.assign(wrap.style, {
      background   : 'rgba(255,255,255,0.05)',
      borderRadius : '6px',
      padding      : '8px 12px',
    });

    const label = document.createElement('div');
    Object.assign(label.style, {
      fontFamily   : 'monospace',
      fontSize     : '9px',
      letterSpacing: '0.2em',
      color        : 'rgba(201,168,76,0.6)',
      marginBottom : '6px',
    });
    label.textContent = `ESENCIA: ${Math.floor(xp)} XP`;

    const track = document.createElement('div');
    Object.assign(track.style, {
      width       : '100%',
      height      : '3px',
      background  : 'rgba(255,255,255,0.08)',
      borderRadius: '2px',
      overflow    : 'hidden',
    });

    const fill = document.createElement('div');
    const pct  = Math.min(100, (xp / 700) * 100); // 700 = legendary max
    Object.assign(fill.style, {
      height    : '100%',
      width     : `${pct}%`,
      background: 'linear-gradient(90deg, #7A6030, #C9A84C)',
      transition: 'width 0.4s ease',
    });

    track.appendChild(fill);
    wrap.appendChild(label);
    wrap.appendChild(track);
    return wrap;
  }

  _buildSubtypeCard(subtypeId, subtype, activeSubtype, xp) {
    const isUnlocked = this.progression.isSubtypeUnlocked(this._weapon, subtypeId);
    const isActive   = subtypeId === activeSubtype;

    const card = document.createElement('div');
    Object.assign(card.style, {
      background   : isActive
        ? 'rgba(201,168,76,0.12)'
        : 'rgba(255,255,255,0.04)',
      border       : `1px solid ${isActive
        ? 'rgba(201,168,76,0.5)'
        : isUnlocked
          ? 'rgba(255,255,255,0.12)'
          : 'rgba(255,255,255,0.05)'}`,
      borderRadius : '10px',
      padding      : '12px',
      cursor       : isUnlocked ? 'pointer' : 'default',
      opacity      : isUnlocked ? '1' : '0.45',
      transition   : 'transform 0.15s, border-color 0.15s',
      pointerEvents: 'all',
      userSelect   : 'none',
      WebkitUserSelect: 'none',
      WebkitTapHighlightColor: 'transparent',
    });

    // Icono + nombre
    const top = document.createElement('div');
    Object.assign(top.style, {
      display       : 'flex',
      alignItems    : 'center',
      gap           : '8px',
      marginBottom  : '10px',
    });

    const icon = document.createElement('div');
    icon.style.fontSize = '20px';
    icon.textContent    = isUnlocked ? subtype.icon : '🔒';

    const name = document.createElement('div');
    Object.assign(name.style, {
      fontFamily   : 'Georgia, serif',
      fontSize     : '12px',
      color        : isActive ? '#C9A84C' : '#ccc',
      letterSpacing: '0.05em',
    });
    name.textContent = subtype.label;

    top.appendChild(icon);
    top.appendChild(name);
    card.appendChild(top);

    // Las 4 habilidades del subtipo
    subtype.skills.forEach(skill => {
      const row = this._buildSkillRow(skill, xp);
      card.appendChild(row);
    });

    // Indicador activo
    if (isActive) {
      const badge = document.createElement('div');
      Object.assign(badge.style, {
        marginTop    : '10px',
        fontFamily   : 'monospace',
        fontSize     : '8px',
        letterSpacing: '0.2em',
        color        : '#C9A84C',
        textAlign    : 'center',
      });
      badge.textContent = '✓ ACTIVO';
      card.appendChild(badge);
    }

    // Evento seleccionar
    if (isUnlocked && !isActive) {
      const select = (e) => {
        e.preventDefault();
        this.progression.setActiveSubtype(this._weapon, subtypeId);
        this.skillBar.setWeapon(this._weapon);
        this.close();
        console.log(`[SubtypeMenu] Subtipo activo: ${subtypeId}`);
      };
      card.addEventListener('click', select);
      card.addEventListener('touchstart', select, { passive: false });

      card.addEventListener('mouseenter', () => {
        card.style.transform   = 'translateY(-2px)';
        card.style.borderColor = 'rgba(255,255,255,0.25)';
      });
      card.addEventListener('mouseleave', () => {
        card.style.transform   = 'translateY(0)';
        card.style.borderColor = 'rgba(255,255,255,0.12)';
      });
    }

    return card;
  }

  _buildSkillRow(skill, xp) {
    const isAvailable = skill.rarity === 'common' ||
      (xp >= this._xpRequired(skill.rarity) &&
       this.progression.hasPassedTrial(skill.id));

    const row = document.createElement('div');
    Object.assign(row.style, {
      display      : 'flex',
      alignItems   : 'center',
      gap          : '6px',
      marginBottom : '4px',
      opacity      : isAvailable ? '1' : '0.4',
    });

    const dot = document.createElement('div');
    Object.assign(dot.style, {
      width       : '6px',
      height      : '6px',
      borderRadius: '50%',
      background  : isAvailable
        ? RARITY_COLORS[skill.rarity]
        : 'rgba(255,255,255,0.2)',
      flexShrink  : '0',
    });

    const label = document.createElement('div');
    Object.assign(label.style, {
      fontFamily  : 'monospace',
      fontSize    : '9px',
      color       : isAvailable ? '#ccc' : 'rgba(255,255,255,0.3)',
      letterSpacing: '0.05em',
    });
    label.textContent = skill.label;

    row.appendChild(dot);
    row.appendChild(label);
    return row;
  }

  _xpRequired(rarity) {
    const map = { common: 0, rare: 100, epic: 300, legendary: 700 };
    return map[rarity] ?? 0;
  }
      }
