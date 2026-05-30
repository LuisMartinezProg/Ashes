// ui/characterMenu.js — Ashes of the Reborn | Valiant Gaming

export class CharacterMenu {
  constructor(progression, skillBar) {
    this._progression  = progression;
    this._skillBar     = skillBar;
    this._open         = false;
    this._activeChar   = 0; // 0 = Kael, 1 = Mika
    this._equipped     = { arma: null, armadura: null, accesorio: null };
    this._subMenu      = null;
    this._buildUI();
  }

  // ── UI base ───────────────────────────────────────────────────────────────

  _buildUI() {
    this._overlay = document.createElement('div');
    Object.assign(this._overlay.style, {
      position      : 'fixed', inset: '0',
      background    : 'rgba(4,4,10,0.96)',
      zIndex        : '400', display: 'none',
      flexDirection : 'column',
    });

    // ── Fila superior ─────────────────────────────────────────────────────
    const top = document.createElement('div');
    Object.assign(top.style, {
      display   : 'flex',
      flex      : '1',
      overflow  : 'hidden',
    });

    // Columna izquierda — selector personajes
    this._leftCol = document.createElement('div');
    Object.assign(this._leftCol.style, {
      width          : '72px',
      display        : 'flex',
      flexDirection  : 'column',
      alignItems     : 'center',
      paddingTop     : '16px',
      gap            : '10px',
      borderRight    : '1px solid rgba(201,168,76,0.15)',
      background     : 'rgba(0,0,0,0.3)',
    });

    // Columna centro — avatar
    this._centerCol = document.createElement('div');
    Object.assign(this._centerCol.style, {
      flex           : '1',
      display        : 'flex',
      alignItems     : 'center',
      justifyContent : 'center',
    });

    // Columna derecha — stats
    this._rightCol = document.createElement('div');
    Object.assign(this._rightCol.style, {
      width          : '200px',
      display        : 'flex',
      flexDirection  : 'column',
      justifyContent : 'center',
      padding        : '16px 14px',
      borderLeft     : '1px solid rgba(201,168,76,0.15)',
      background     : 'rgba(0,0,0,0.3)',
    });

    top.append(this._leftCol, this._centerCol, this._rightCol);

    // ── Fila inferior — botones ───────────────────────────────────────────
    const bottom = document.createElement('div');
    Object.assign(bottom.style, {
      display        : 'flex',
      justifyContent : 'center',
      alignItems     : 'center',
      gap            : '12px',
      padding        : '12px 16px',
      borderTop      : '1px solid rgba(201,168,76,0.2)',
      background     : 'rgba(0,0,0,0.4)',
    });

    const bottomBtns = [
      { label: '📊 Atributos',  action: () => this._openSub('atributos')  },
      { label: '⚔️ Equipo',     action: () => this._openSub('equipo')     },
      { label: '✨ Habilidades', action: () => this._openSub('habilidades')},
      { label: '📖 Talentos',   action: () => this._openSub('talentos')   },
    ];

    for (const { label, action } of bottomBtns) {
      const btn = document.createElement('button');
      Object.assign(btn.style, {
        flex         : '1',
        maxWidth     : '120px',
        padding      : '10px 8px',
        borderRadius : '10px',
        border       : '1px solid rgba(201,168,76,0.35)',
        background   : 'rgba(201,168,76,0.08)',
        color        : '#C9A84C',
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
        btn.style.background = 'rgba(201,168,76,0.08)';
        btn.style.border     = '1px solid rgba(201,168,76,0.35)';
      });
      bottom.appendChild(btn);
    }

    // Botón cerrar
    const closeBtn = document.createElement('button');
    Object.assign(closeBtn.style, {
      position     : 'absolute',
      top          : '10px',
      right        : '14px',
      background   : 'none',
      border       : 'none',
      color        : '#C9A84C',
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

  // ── Render contenido ──────────────────────────────────────────────────────

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
      const card = document.createElement('div');
      const active = this._activeChar === c.idx;
      Object.assign(card.style, {
        width        : '52px',
        height       : '52px',
        borderRadius : '50%',
        border       : active
          ? '2px solid #C9A84C'
          : '2px solid rgba(201,168,76,0.2)',
        background   : active
          ? 'rgba(201,168,76,0.18)'
          : 'rgba(201,168,76,0.05)',
        display      : 'flex',
        flexDirection: 'column',
        alignItems   : 'center',
        justifyContent: 'center',
        cursor       : 'pointer',
        pointerEvents: 'all',
        transition   : 'all 0.2s',
        boxShadow    : active ? '0 0 12px rgba(201,168,76,0.4)' : 'none',
      });

      const iconEl = document.createElement('div');
      iconEl.style.fontSize = '20px';
      iconEl.textContent = c.icon;

      const nameEl = document.createElement('div');
      Object.assign(nameEl.style, {
        fontFamily: 'monospace',
        fontSize  : '7px',
        color     : active ? '#C9A84C' : 'rgba(201,168,76,0.5)',
        marginTop : '2px',
      });
      nameEl.textContent = c.name;

      card.append(iconEl, nameEl);

      card.addEventListener('click', () => this._selectChar(c.idx));
      card.addEventListener('touchstart', (e) => {
        e.preventDefault();
        this._selectChar(c.idx);
      }, { passive: false });

      this._leftCol.appendChild(card);
    }
  }

  _renderCenter() {
    this._centerCol.innerHTML = '';
    const avatars = ['⚔️', '🏹'];
    const names   = ['KAEL', 'MIKA'];

    const wrap = document.createElement('div');
    Object.assign(wrap.style, {
      display       : 'flex',
      flexDirection : 'column',
      alignItems    : 'center',
      gap           : '8px',
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
      color        : '#C9A84C',
    });
    nameEl.textContent = names[this._activeChar];

    // Barra XP
    const prog    = this._progression;
    const level   = prog.getLevel();
    const pct     = Math.round(prog.getXPProgress() * 100);
    const xp      = prog.getTotalXP();
    const next    = prog.getXPForNextLevel();

    const levelEl = document.createElement('div');
    Object.assign(levelEl.style, {
      fontFamily   : 'monospace',
      fontSize     : '11px',
      color        : 'rgba(201,168,76,0.7)',
      letterSpacing: '1px',
    });
    levelEl.textContent = `Nivel ${level}  ${xp}/${next ?? '—'} XP`;

    const xpBarWrap = document.createElement('div');
    Object.assign(xpBarWrap.style, {
      width       : '160px',
      height      : '3px',
      background  : 'rgba(201,168,76,0.15)',
      borderRadius: '2px',
      overflow    : 'hidden',
    });
    const xpFill = document.createElement('div');
    Object.assign(xpFill.style, {
      height    : '100%',
      width     : `${pct}%`,
      background: 'linear-gradient(90deg,#7A6030,#C9A84C)',
      transition: 'width 0.4s ease',
    });
    xpBarWrap.appendChild(xpFill);

    wrap.append(avatar, nameEl, levelEl, xpBarWrap);
    this._centerCol.appendChild(wrap);
  }

  _renderRight() {
    this._rightCol.innerHTML = '';
    const prog   = this._progression;
    const stats  = prog.getStats();
    const eff    = window._effectiveStats ?? stats;
    const char   = this._activeChar === 0 ? window._player : window._companion;

    const statDefs = [
      { icon: '❤️', label: 'HP',   value: `${char?.hp ?? '?'} / ${eff.maxHp ?? stats.maxHp}` },
      { icon: '⚔️', label: 'ATK',  value: eff.atk  ?? stats.atk },
      { icon: '🛡️', label: 'DEF',  value: eff.def  ?? stats.def },
      { icon: '💨', label: 'VEL',  value: (stats.speed ?? 5).toFixed(1) },
      { icon: '✦',  label: 'ÉTER', value: window._dungeonManager?.getEtherFragments?.() ?? 0 },
      { icon: '⭐', label: 'REP',  value: prog.getReputation() },
    ];

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
        fontFamily: 'monospace',
        fontSize  : '10px',
        color     : 'rgba(201,168,76,0.65)',
      });
      left.textContent = `${icon} ${label}`;

      const right = document.createElement('div');
      Object.assign(right.style, {
        fontFamily: 'monospace',
        fontSize  : '11px',
        color     : '#C9A84C',
        fontWeight: 'bold',
      });
      right.textContent = value;

      row.append(left, right);
      this._rightCol.appendChild(row);
    }
  }

  // ── Selector personaje ────────────────────────────────────────────────────

  _selectChar(idx) {
    if (this._activeChar === idx) return;
    this._activeChar = idx;
    window._partyManager?.switchTo?.(idx);
    // Solo actualiza contenido, NO reabre el menú
    this._renderLeft();
    this._renderCenter();
    this._renderRight();
  }

  // ── Submenús ──────────────────────────────────────────────────────────────

  _openSub(type) {
    if (this._subMenu) { this._subMenu.remove(); this._subMenu = null; }

    const panel = document.createElement('div');
    Object.assign(panel.style, {
      position     : 'fixed', inset: '0',
      background   : 'rgba(4,4,10,0.97)',
      zIndex       : '500',
      display      : 'flex',
      flexDirection: 'column',
      alignItems   : 'center',
      paddingTop   : '16px',
      overflowY    : 'auto',
    });

    // Header submenú
    const header = document.createElement('div');
    Object.assign(header.style, {
      width         : '100%',
      maxWidth      : '500px',
      display       : 'flex',
      justifyContent: 'space-between',
      alignItems    : 'center',
      padding       : '0 16px 12px',
      borderBottom  : '1px solid rgba(201,168,76,0.2)',
    });

    const titles = {
      atributos  : '📊 ATRIBUTOS',
      equipo     : '⚔️ EQUIPO',
      habilidades: '✨ HABILIDADES',
      talentos   : '📖 TALENTOS',
    };

    const titleEl = document.createElement('div');
    Object.assign(titleEl.style, {
      fontFamily   : "'Cinzel',serif",
      fontSize     : '13px',
      letterSpacing: '3px',
      color        : '#C9A84C',
    });
    titleEl.textContent = titles[type] ?? type.toUpperCase();

    const backBtn = document.createElement('button');
    Object.assign(backBtn.style, {
      background: 'none', border: 'none',
      color: '#C9A84C', fontSize: '20px',
      cursor: 'pointer', pointerEvents: 'all',
    });
    backBtn.textContent = '←';
    backBtn.addEventListener('click', () => { panel.remove(); this._subMenu = null; });
    backBtn.addEventListener('touchstart', (e) => {
      e.preventDefault(); panel.remove(); this._subMenu = null;
    }, { passive: false });

    header.append(titleEl, backBtn);

    const body = document.createElement('div');
    Object.assign(body.style, {
      width  : '100%', maxWidth: '500px',
      padding: '16px',
    });

    if (type === 'atributos')   this._fillAtributos(body);
    if (type === 'equipo')      this._fillEquipo(body, panel);
    if (type === 'habilidades') this._fillHabilidades(body);
    if (type === 'talentos')    this._fillTalentos(body);

    panel.append(header, body);
    document.body.appendChild(panel);
    this._subMenu = panel;
  }

  // ── Atributos ─────────────────────────────────────────────────────────────

  _fillAtributos(body) {
    const prog  = this._progression;
    const stats = prog.getStats();
    const eff   = window._effectiveStats ?? stats;
    const char  = this._activeChar === 0 ? window._player : window._companion;

    const defs = [
      { icon:'❤️', label:'HP Máx',    value: eff.maxHp ?? stats.maxHp },
      { icon:'❤️', label:'HP Actual', value: char?.hp ?? '?' },
      { icon:'⚔️', label:'ATK',       value: eff.atk  ?? stats.atk },
      { icon:'🛡️', label:'DEF',       value: eff.def  ?? stats.def },
      { icon:'💨', label:'VEL',       value: (stats.speed ?? 5).toFixed(1) },
      { icon:'✦',  label:'Éter',      value: window._dungeonManager?.getEtherFragments?.() ?? 0 },
      { icon:'⭐', label:'Reputación',value: prog.getReputation() },
      { icon:'🪄', label:'Energía Mágica', value: prog.getMagicEnergy() },
    ];

    for (const { icon, label, value } of defs) {
      const row = document.createElement('div');
      Object.assign(row.style, {
        display       : 'flex',
        justifyContent: 'space-between',
        padding       : '10px 12px',
        borderRadius  : '8px',
        marginBottom  : '6px',
        background    : 'rgba(201,168,76,0.05)',
        border        : '1px solid rgba(201,168,76,0.1)',
      });
      row.innerHTML = `
        <span style="font-family:monospace;font-size:11px;color:rgba(201,168,76,0.7)">${icon} ${label}</span>
        <span style="font-family:monospace;font-size:12px;color:#C9A84C;font-weight:bold">${value}</span>
      `;
      body.appendChild(row);
    }
  }

  // ── Equipo ────────────────────────────────────────────────────────────────

  _fillEquipo(body, panel) {
    const slots = ['arma', 'armadura', 'accesorio'];
    const slotLabels = { arma:'⚔️ Arma', armadura:'🛡️ Armadura', accesorio:'💍 Accesorio' };

    for (const slot of slots) {
      const item = this._equipped[slot];
      const row  = document.createElement('div');
      Object.assign(row.style, {
        display      : 'flex', alignItems: 'center',
        gap          : '12px', padding: '12px',
        borderRadius : '12px', marginBottom: '10px',
        border       : '1px solid rgba(201,168,76,0.2)',
        background   : 'rgba(201,168,76,0.04)',
      });

      const iconEl = document.createElement('div');
      iconEl.style.fontSize = '28px';
      iconEl.textContent = item?.icon ?? slotLabels[slot].split(' ')[0];

      const info = document.createElement('div');
      info.style.flex = '1';
      info.innerHTML = `
        <div style="font-family:monospace;font-size:11px;color:${item ? '#C9A84C' : 'rgba(201,168,76,0.3)'}">
          ${item ? item.name : `— ${slotLabels[slot]}`}
        </div>
        <div style="font-family:monospace;font-size:9px;color:rgba(255,255,255,0.4);margin-top:3px">
          ${item?.stats ? Object.entries(item.stats).map(([k,v])=>`${k}+${v}`).join(' ') : 'Sin equipo'}
        </div>
      `;

      const btn = document.createElement('button');
      Object.assign(btn.style, {
        background  : 'rgba(201,168,76,0.1)',
        border      : '1px solid rgba(201,168,76,0.3)',
        borderRadius: '8px', padding: '6px 10px',
        color       : '#C9A84C', fontFamily: 'monospace',
        fontSize    : '9px', cursor: 'pointer', pointerEvents: 'all',
      });
      btn.textContent = 'Cambiar';
      btn.addEventListener('click', () => this._openSlotPicker(slot, panel));
      btn.addEventListener('touchstart', (e) => {
        e.preventDefault(); this._openSlotPicker(slot, panel);
      }, { passive: false });

      row.append(iconEl, info, btn);
      body.appendChild(row);
    }

    // Bonus total
    const sep = document.createElement('div');
    sep.style.cssText = 'border-top:1px solid rgba(201,168,76,0.15);margin:8px 0;padding-top:10px;font-family:monospace;font-size:9px;color:rgba(201,168,76,0.5);letter-spacing:1px';
    sep.textContent = 'BONUS TOTAL DE EQUIPO';
    body.appendChild(sep);

    const total = { ATK:0, DEF:0, HP:0, MAGIA:0 };
    for (const item of Object.values(this._equipped)) {
      if (!item?.stats) continue;
      for (const [k,v] of Object.entries(item.stats)) {
        if (total[k] !== undefined) total[k] += v;
      }
    }

    const bonusRow = document.createElement('div');
    bonusRow.style.cssText = 'display:flex;gap:8px;flex-wrap:wrap';
    for (const [stat, val] of Object.entries(total)) {
      if (!val) continue;
      const cell = document.createElement('div');
      cell.style.cssText = 'background:rgba(201,168,76,0.08);border:1px solid rgba(201,168,76,0.2);border-radius:8px;padding:6px 10px;font-family:monospace;font-size:10px;color:#C9A84C';
      cell.textContent = `${stat} +${val}`;
      bonusRow.appendChild(cell);
    }
    body.appendChild(bonusRow);
  }

  _openSlotPicker(slot, parentPanel) {
    const inv = window._inventory;
    if (!inv) return;
    const items = inv._items.equipos.filter(i => i.slot === slot);

    const picker = document.createElement('div');
    Object.assign(picker.style, {
      position     : 'fixed', inset: '0',
      background   : 'rgba(4,4,10,0.98)',
      zIndex       : '600', display: 'flex',
      flexDirection: 'column', alignItems: 'center',
      paddingTop   : '20px',
    });

    const titleEl = document.createElement('div');
    titleEl.style.cssText = "font-family:'Cinzel',serif;font-size:13px;color:#C9A84C;letter-spacing:2px;margin-bottom:16px";
    titleEl.textContent = `ELEGIR ${slot.toUpperCase()}`;

    const list = document.createElement('div');
    list.style.cssText = 'width:100%;max-width:400px;padding:0 16px;overflow-y:auto;flex:1';

    // Opción desequipar
    [null, ...items].forEach(item => {
      const row = document.createElement('div');
      Object.assign(row.style, {
        display      : 'flex', alignItems: 'center',
        gap          : '12px', padding: '10px 12px',
        borderRadius : '10px', marginBottom: '8px',
        border       : item
          ? '1px solid rgba(201,168,76,0.2)'
          : '1px solid rgba(255,80,80,0.2)',
        background   : 'rgba(201,168,76,0.04)',
        cursor       : 'pointer', pointerEvents: 'all',
      });

      row.innerHTML = `
        <div style="font-size:22px">${item?.icon ?? '✕'}</div>
        <div style="flex:1">
          <div style="font-family:monospace;font-size:10px;color:${item ? '#C9A84C' : 'rgba(255,100,100,0.8)'}">
            ${item ? item.name : 'Desequipar'}
          </div>
          <div style="font-family:monospace;font-size:9px;color:rgba(255,255,255,0.4);margin-top:2px">
            ${item?.stats ? Object.entries(item.stats).map(([k,v])=>`${k}+${v}`).join(' ') : ''}
          </div>
        </div>
      `;

      const equip = () => {
        this._equipped[slot] = item ?? null;
        this._applyEquipStats();
        picker.remove();
        // Refrescar panel de equipo sin cerrar submenú
        parentPanel.querySelector('div:nth-child(2)').innerHTML = '';
        const newBody = parentPanel.querySelector('div:nth-child(2)');
        this._fillEquipo(newBody, parentPanel);
        this._renderRight();
      };
      row.addEventListener('click', equip);
      row.addEventListener('touchstart', (e) => { e.preventDefault(); equip(); }, { passive: false });
      list.appendChild(row);
    });

    const cancelBtn = document.createElement('button');
    cancelBtn.style.cssText = 'margin:16px;padding:10px 28px;border-radius:20px;border:1px solid rgba(201,168,76,0.3);background:rgba(10,8,20,0.9);color:#C9A84C;font-family:monospace;font-size:11px;cursor:pointer;pointer-events:all';
    cancelBtn.textContent = '← Volver';
    cancelBtn.addEventListener('click', () => picker.remove());
    cancelBtn.addEventListener('touchstart', (e) => { e.preventDefault(); picker.remove(); }, { passive: false });

    picker.append(titleEl, list, cancelBtn);
    document.body.appendChild(picker);
  }

  _applyEquipStats() {
    const base = this._progression.getStats();
    let atk = base.atk, def = base.def, maxHp = base.maxHp;
    for (const item of Object.values(this._equipped)) {
      if (!item?.stats) continue;
      if (item.stats.ATK) atk   += item.stats.ATK;
      if (item.stats.DEF) def   += item.stats.DEF;
      if (item.stats.HP)  maxHp += item.stats.HP;
    }
    window._effectiveStats = { atk, def, maxHp };
    const player = window._player;
    if (player) {
      player.maxHp = maxHp;
      player.hp    = Math.min(player.hp, maxHp);
      player.onDamage?.(player.hp, player.maxHp);
    }
  }

  // ── Habilidades ───────────────────────────────────────────────────────────

  _fillHabilidades(body) {
    const weapon = this._activeChar === 1 ? 'bow' : (window._combat?._weaponType ?? 'katana');
    const skills = this._progression.getActiveSkills(weapon);
    const icons  = { katana:'🗡️', sword:'⚔️', magic:'🔮', bow:'🏹' };

    const label = document.createElement('div');
    label.style.cssText = 'font-family:monospace;font-size:9px;color:rgba(201,168,76,0.5);letter-spacing:2px;margin-bottom:12px';
    label.textContent = `${icons[weapon] ?? '⚔️'} ${weapon.toUpperCase()}`;
    body.appendChild(label);

    if (!skills.length) {
      body.innerHTML += '<div style="text-align:center;font-family:monospace;font-size:11px;color:rgba(201,168,76,0.3);padding:40px 0">Sin habilidades activas</div>';
      return;
    }

    for (const skill of skills) {
      const row = document.createElement('div');
      Object.assign(row.style, {
        display      : 'flex', gap: '12px', alignItems: 'center',
        padding      : '10px 12px', borderRadius: '12px',
        marginBottom : '8px',
        border       : `1px solid ${skill.available ? 'rgba(201,168,76,0.3)' : 'rgba(255,255,255,0.08)'}`,
        background   : skill.available ? 'rgba(201,168,76,0.06)' : 'rgba(255,255,255,0.02)',
        opacity      : skill.available ? '1' : '0.5',
      });

      row.innerHTML = `
        <div style="font-size:28px;min-width:36px;text-align:center">${skill.icon ?? '✨'}</div>
        <div style="flex:1">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:3px">
            <span style="font-family:monospace;font-size:11px;color:#C9A84C">${skill.name ?? skill.id}</span>
            <span style="font-family:monospace;font-size:8px;padding:2px 6px;border-radius:4px;background:rgba(201,168,76,0.12);color:#C9A84C">${(skill.rarity ?? 'common').toUpperCase()}</span>
          </div>
          <div style="font-family:monospace;font-size:9px;color:rgba(255,255,255,0.45);line-height:1.4">${skill.description ?? skill.desc ?? '—'}</div>
          <div style="font-family:monospace;font-size:8px;color:${skill.available ? '#44ff88' : 'rgba(255,100,100,0.7)'};margin-top:3px">
            ${skill.available ? '✓ Disponible' : `Requiere ${skill.xpRequired} XP`}
          </div>
        </div>
      `;
      body.appendChild(row);
    }
  }

  // ── Talentos ──────────────────────────────────────────────────────────────

  _fillTalentos(body) {
    const chars = [
      {
        name  : 'Kael',
        icon  : '⚔️',
        skills: [
          { name: 'Ataque Normal',   desc: 'Combo de golpes con el arma equipada.',        icon: '⚔️' },
          { name: 'Habilidad Élite', desc: 'Ejecuta una técnica especial del arma.',       icon: '✦'  },
          { name: 'Ultimate',        desc: 'Libera el poder oscuro prestado. -50% ATK.',   icon: '🌑' },
        ],
      },
      {
        name  : 'Mika',
        icon  : '🏹',
        skills: [
          { name: 'Ataque a Distancia', desc: 'Dispara flechas precisas al enemigo.',      icon: '🏹' },
          { name: 'Trampa de Viento',   desc: 'Coloca una trampa que ralentiza enemigos.', icon: '🌀' },
          { name: 'Lluvia de Flechas',  desc: 'Lanza múltiples flechas en área.',          icon: '⬆️' },
        ],
      },
    ];

    const char = chars[this._activeChar];

    const nameEl = document.createElement('div');
    nameEl.style.cssText = "font-family:'Cinzel',serif;font-size:13px;color:#C9A84C;letter-spacing:2px;margin-bottom:14px";
    nameEl.textContent = `${char.icon} ${char.name.toUpperCase()}`;
    body.appendChild(nameEl);

    for (const skill of char.skills) {
      const row = document.createElement('div');
      Object.assign(row.style, {
        display      : 'flex', gap: '12px', alignItems: 'center',
        padding      : '12px', borderRadius: '12px',
        marginBottom : '10px',
        border       : '1px solid rgba(201,168,76,0.2)',
        background   : 'rgba(201,168,76,0.05)',
      });
      row.innerHTML = `
        <div style="font-size:28px;min-width:36px;text-align:center">${skill.icon}</div>
        <div>
          <div style="font-family:monospace;font-size:11px;color:#C9A84C;margin-bottom:4px">${skill.name}</div>
          <div style="font-family:monospace;font-size:9px;color:rgba(255,255,255,0.5);line-height:1.4">${skill.desc}</div>
        </div>
      `;
      body.appendChild(row);
    }
  }

  // ── API pública ───────────────────────────────────────────────────────────

  open() {
    if (this._open) return;
    this._open = true;
    this._overlay.style.display = 'flex';
    this._render();
  }

  close() {
    this._open = false;
    this._overlay.style.display = 'none';
    if (this._subMenu) { this._subMenu.remove(); this._subMenu = null; }
  }

  isOpen() { return this._open; }
}
