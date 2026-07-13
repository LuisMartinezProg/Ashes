// ui/characterMenu.js — Ashes of the Reborn | Valiant Gaming

import { CHARACTER_MENU } from '../data/palette.js';

export class CharacterMenu {
  constructor(progression, skillBar) {
    this._progression  = progression;
    this._skillBar     = skillBar;
    this._open         = false;
    this._activeChar   = 0;
    this._equippedKael = { arma: null, armadura: null, accesorio: null };
    this._equippedMika = { arma: null, armadura: null, accesorio: null };
    this._subMenu      = null;
    this._buildUI();
  }

  // ── Helper: progression del personaje activo ──────────────────────────────
  _getProgression() {
    return this._activeChar === 1
      ? (window._mikaProgression ?? this._progression)
      : this._progression;
  }

  _getEquipped() {
    return this._activeChar === 1 ? this._equippedMika : this._equippedKael;
  }

  // ── Getter de effective stats según personaje ─────────────────────────────
  _getEffective() {
    return this._activeChar === 1
      ? (window._effectiveStatsMika ?? this._getProgression().getStats())
      : (window._effectiveStats     ?? this._progression.getStats());
  }

  _buildUI() {
    this._overlay = document.createElement('div');
    Object.assign(this._overlay.style, {
      position      : 'fixed', inset: '0',
      background    : 'rgba(4,4,10,0.96)',
      zIndex        : '400', display: 'none',
      flexDirection : 'column',
    });

    const top = document.createElement('div');
    Object.assign(top.style, {
      display  : 'flex',
      flex     : '1',
      overflow : 'hidden',
    });

    this._leftCol = document.createElement('div');
    Object.assign(this._leftCol.style, {
      width        : '72px',
      display      : 'flex',
      flexDirection: 'column',
      alignItems   : 'center',
      paddingTop   : '16px',
      gap          : '10px',
      borderRight  : '1px solid rgba(201,168,76,0.15)',
      background   : 'rgba(0,0,0,0.3)',
    });

    this._centerCol = document.createElement('div');
    Object.assign(this._centerCol.style, {
      flex           : '1',
      display        : 'flex',
      alignItems     : 'center',
      justifyContent : 'center',
    });

    this._rightCol = document.createElement('div');
    Object.assign(this._rightCol.style, {
      width         : '200px',
      display       : 'flex',
      flexDirection : 'column',
      justifyContent: 'center',
      padding       : '16px 14px',
      borderLeft    : '1px solid rgba(201,168,76,0.15)',
      background    : 'rgba(0,0,0,0.3)',
    });

    top.append(this._leftCol, this._centerCol, this._rightCol);

    const bottom = document.createElement('div');
    Object.assign(bottom.style, {
      display       : 'flex',
      justifyContent: 'center',
      alignItems    : 'center',
      gap           : '12px',
      padding       : '12px 16px',
      borderTop     : '1px solid rgba(201,168,76,0.2)',
      background    : 'rgba(0,0,0,0.4)',
    });

    const bottomBtns = [
      { label: '📊 Atributos',   action: () => this._openSub('atributos')   },
      { label: '⚔️ Equipo',      action: () => this._openSub('equipo')      },
      { label: '✨ Habilidades', action: () => this._openSub('habilidades') },
      { label: '📖 Talentos',    action: () => this._openSub('talentos')    },
    ];

    for (const { label, action } of bottomBtns) {
      const btn = document.createElement('button');
      Object.assign(btn.style, {
        flex         : '1',
        maxWidth     : '120px',
        padding      : '10px 8px',
        borderRadius : '10px',
        border       : `1px solid ${CHARACTER_MENU.border}`,
        background   : CHARACTER_MENU.goldFaint,
        color        : CHARACTER_MENU.gold,
        fontFamily   : 'monospace',
        fontSize     : '10px',
        letterSpacing: '0.5px',
        cursor       : 'pointer',
        pointerEvents: 'all',
        transition   : 'all 0.15s',
      });
      btn.textContent = label;
      btn.addEventListener('click', action);
      btn.addEventListener('touchstart', (e) => { e.preventDefault(); action(); }, { passive: false });
      btn.addEventListener('mouseenter', () => {
        btn.style.background = 'rgba(201,168,76,0.18)';
        btn.style.border     = '1px solid rgba(201,168,76,0.6)';
      });
      btn.addEventListener('mouseleave', () => {
        btn.style.background = CHARACTER_MENU.goldFaint;
        btn.style.border     = `1px solid ${CHARACTER_MENU.border}`;
      });
      bottom.appendChild(btn);
    }

    const closeBtn = document.createElement('button');
    Object.assign(closeBtn.style, {
      position     : 'absolute',
      top          : '10px',
      right        : '14px',
      background   : 'none',
      border       : 'none',
      color        : CHARACTER_MENU.gold,
      fontSize     : '22px',
      cursor       : 'pointer',
      pointerEvents: 'all',
      zIndex       : '401',
    });
    closeBtn.textContent = '✕';
    closeBtn.addEventListener('click', () => this.close());
    closeBtn.addEventListener('touchstart', (e) => { e.preventDefault(); this.close(); }, { passive: false });

    this._overlay.style.position = 'fixed';
    this._overlay.appendChild(closeBtn);
    this._overlay.append(top, bottom);
    document.body.appendChild(this._overlay);
  }

  _render() {
    this._renderLeft();
    this._renderCenter();
    this._renderRight();
  }

  _renderLeft() {
    this._leftCol.innerHTML = '';
    const chars = [
      { name: 'Kael', icon: '⚔️', idx: 0 },
      { name: 'Mika', icon: '🏹', idx: 1 },
    ];
    for (const c of chars) {
      const card   = document.createElement('div');
      const active = this._activeChar === c.idx;
      Object.assign(card.style, {
        width          : '52px',
        height         : '52px',
        borderRadius   : '50%',
        border         : active ? `2px solid ${CHARACTER_MENU.gold}` : '2px solid rgba(201,168,76,0.2)',
        background     : active ? 'rgba(201,168,76,0.18)' : 'rgba(201,168,76,0.05)',
        display        : 'flex',
        flexDirection  : 'column',
        alignItems     : 'center',
        justifyContent : 'center',
        cursor         : 'pointer',
        pointerEvents  : 'all',
        transition     : 'all 0.2s',
        boxShadow      : active ? '0 0 12px rgba(201,168,76,0.4)' : 'none',
      });

      const iconEl = document.createElement('div');
      iconEl.style.fontSize = '20px';
      iconEl.textContent    = c.icon;

      const nameEl = document.createElement('div');
      Object.assign(nameEl.style, {
        fontFamily: 'monospace',
        fontSize  : '7px',
        color     : active ? CHARACTER_MENU.gold : CHARACTER_MENU.goldDim,
        marginTop : '2px',
      });
      nameEl.textContent = c.name;

      card.append(iconEl, nameEl);
      card.addEventListener('click', () => this._selectChar(c.idx));
      card.addEventListener('touchstart', (e) => { e.preventDefault(); this._selectChar(c.idx); }, { passive: false });
      this._leftCol.appendChild(card);
    }
  }

  _renderCenter() {
    this._centerCol.innerHTML = '';
    const avatars = ['⚔️', '🏹'];
    const names   = ['KAEL', 'MIKA'];
    const prog    = this._getProgression();
    const level   = prog.getLevel();

    const wrap = document.createElement('div');
    Object.assign(wrap.style, {
      display      : 'flex',
      flexDirection: 'column',
      alignItems   : 'center',
      gap          : '6px',
    });

    const avatar = document.createElement('div');
    Object.assign(avatar.style, {
      fontSize  : '80px',
      lineHeight: '1',
      filter    : 'drop-shadow(0 0 20px rgba(201,168,76,0.5))',
    });
    avatar.textContent = avatars[this._activeChar];

    const nameEl = document.createElement('div');
    Object.assign(nameEl.style, {
      fontFamily   : "'Cinzel',serif",
      fontSize     : '16px',
      letterSpacing: '4px',
      color        : CHARACTER_MENU.gold,
    });
    nameEl.textContent = names[this._activeChar];

    const levelEl = document.createElement('div');
    Object.assign(levelEl.style, {
      fontFamily   : 'monospace',
      fontSize     : '11px',
      color        : CHARACTER_MENU.goldDim,
      letterSpacing: '2px',
    });
    levelEl.textContent = `Nv.${level}`;

    wrap.append(avatar, nameEl, levelEl);
    this._centerCol.appendChild(wrap);
  }

  _renderRight() {
    this._rightCol.innerHTML = '';
    const prog  = this._getProgression();
    const stats = prog.getStats();
    const eff   = this._getEffective();
    const char  = this._activeChar === 0 ? window._player : window._companion;

    const statDefs = [
      { icon: '❤️', label: 'HP',   value: `${Math.ceil(char?.hp ?? 0)} / ${eff.maxHp ?? stats.maxHp}` },
      { icon: '⚔️', label: 'ATK',  value: eff.atk  ?? stats.atk  },
      { icon: '🛡️', label: 'DEF',  value: eff.def  ?? stats.def  },
      { icon: '💨', label: 'VEL',  value: (stats.speed ?? 5).toFixed(1) },
      { icon: '✦',  label: 'ÉTER', value: window._dungeonManager?.getEtherFragments?.() ?? 0 },
      { icon: '⭐', label: 'REP',  value: prog.getReputation() },
    ];

    if (this._activeChar === 1 && stats.range !== undefined) {
      statDefs.splice(4, 0, { icon: '🏹', label: 'RANGO', value: stats.range.toFixed(1) });
    }

    for (const { icon, label, value } of statDefs) {
      const row = document.createElement('div');
      Object.assign(row.style, {
        display       : 'flex',
        justifyContent: 'space-between',
        alignItems    : 'center',
        padding       : '5px 0',
        borderBottom  : '1px solid rgba(201,168,76,0.08)',
      });
      const left = document.createElement('div');
      Object.assign(left.style, {
        fontFamily: 'monospace', fontSize: '10px', color: 'rgba(201,168,76,0.65)',
      });
      left.textContent = `${icon} ${label}`;
      const right = document.createElement('div');
      Object.assign(right.style, {
        fontFamily: 'monospace', fontSize: '11px', color: CHARACTER_MENU.gold, fontWeight: 'bold',
      });
      right.textContent = value;
      row.append(left, right);
      this._rightCol.appendChild(row);
    }
  }

  _selectChar(idx) {
    if (this._activeChar === idx) return;
    this._activeChar = idx;
    window._partyManager?.switchTo?.(idx);
    this._renderLeft();
    this._renderCenter();
    this._renderRight();
  }
