// ui/characterMenu.js — Ashes of the Reborn | Valiant Gaming

const TABS = ['personaje', 'equipamiento', 'habilidades'];
const TAB_LABELS = {
  personaje    : '👤 Personaje',
  equipamiento : '⚔️ Equipo',
  habilidades  : '✨ Habilidades',
};

const SLOT_LABELS = {
  arma     : '⚔️ Arma',
  armadura : '🛡️ Armadura',
  accesorio: '💍 Accesorio',
};

export class CharacterMenu {
  constructor(progression, skillBar) {
    this._progression = progression;
    this._skillBar    = skillBar;
    this._open        = false;
    this._tab         = 'personaje';
    this._equipped    = { arma: null, armadura: null, accesorio: null };
    this._buildUI();
  }

  // ── UI base ───────────────────────────────────────────────────────────────

  _buildUI() {
    this._overlay = document.createElement('div');
    Object.assign(this._overlay.style, {
      position      : 'fixed', inset: '0',
      background    : 'rgba(4,4,10,0.95)',
      zIndex        : '400',
      display       : 'none',
      flexDirection : 'column',
      alignItems    : 'center',
      paddingTop    : '16px',
      overflowY     : 'auto',
    });

    // Header
    const header = document.createElement('div');
    Object.assign(header.style, {
      width         : '100%',
      maxWidth      : '420px',
      display       : 'flex',
      alignItems    : 'center',
      justifyContent: 'space-between',
      padding       : '0 16px 12px',
      borderBottom  : '1px solid rgba(201,168,76,0.2)',
    });

    const title = document.createElement('div');
    Object.assign(title.style, {
      fontFamily   : "'Cinzel',serif",
      fontSize     : '14px',
      letterSpacing: '3px',
      color        : '#C9A84C',
    });
    title.textContent = 'PERSONAJE';

    const closeBtn = document.createElement('button');
    Object.assign(closeBtn.style, {
      background   : 'none', border: 'none',
      color        : '#C9A84C', fontSize: '20px',
      cursor       : 'pointer', pointerEvents: 'all',
    });
    closeBtn.textContent = '✕';
    closeBtn.addEventListener('click', () => this.close());
    closeBtn.addEventListener('touchstart', (e) => { e.preventDefault(); this.close(); }, { passive: false });
    header.append(title, closeBtn);

    // Tabs
    const tabBar = document.createElement('div');
    Object.assign(tabBar.style, {
      width  : '100%', maxWidth: '420px',
      display: 'flex', padding: '10px 8px', gap: '6px',
    });

    this._tabs = {};
    for (const tab of TABS) {
      const btn = document.createElement('button');
      Object.assign(btn.style, {
        flex         : '1', padding: '8px 4px',
        borderRadius : '10px',
        border       : '1px solid rgba(201,168,76,0.3)',
        background   : 'rgba(201,168,76,0.06)',
        color        : 'rgba(201,168,76,0.6)',
        fontFamily   : 'monospace', fontSize: '9px',
        letterSpacing: '1px', cursor: 'pointer',
        pointerEvents: 'all', transition: 'all 0.2s',
      });
      btn.textContent = TAB_LABELS[tab];
      btn.addEventListener('click', () => this._switchTab(tab));
      btn.addEventListener('touchstart', (e) => { e.preventDefault(); this._switchTab(tab); }, { passive: false });
      this._tabs[tab] = btn;
      tabBar.appendChild(btn);
    }

    // Contenido
    this._content = document.createElement('div');
    Object.assign(this._content.style, {
      width   : '100%', maxWidth: '420px',
      padding : '12px 16px', flex: '1',
    });

    // Tooltip
    this._tooltip = document.createElement('div');
    Object.assign(this._tooltip.style, {
      position     : 'fixed',
      background   : 'rgba(4,4,10,0.97)',
      border       : '1px solid rgba(201,168,76,0.4)',
      borderRadius : '10px', padding: '10px 14px',
      fontFamily   : 'monospace', fontSize: '11px',
      color        : '#C9A84C', zIndex: '500',
      display      : 'none', maxWidth: '200px',
      pointerEvents: 'none',
    });

    this._overlay.append(header, tabBar, this._content);
    document.body.append(this._overlay, this._tooltip);
    this._switchTab('personaje');
  }

  // ── Tabs ──────────────────────────────────────────────────────────────────

  _switchTab(tab) {
    this._tab = tab;
    for (const [t, btn] of Object.entries(this._tabs)) {
      const active = t === tab;
      btn.style.background = active ? 'rgba(201,168,76,0.18)' : 'rgba(201,168,76,0.06)';
      btn.style.color      = active ? '#C9A84C' : 'rgba(201,168,76,0.5)';
      btn.style.border     = active
        ? '1px solid rgba(201,168,76,0.6)'
        : '1px solid rgba(201,168,76,0.2)';
    }
    this._content.innerHTML = '';
    if (tab === 'personaje')    this._renderPersonaje();
    if (tab === 'equipamiento') this._renderEquipamiento();
    if (tab === 'habilidades')  this._renderHabilidades();
  }

  // ── Tab Personaje ─────────────────────────────────────────────────────────

  _renderPersonaje() {
    const prog  = this._progression;
    const level = prog.getLevel();
    const stats = prog.getStats();
    const xp    = prog.getTotalXP();
    const next  = prog.getXPForNextLevel();
    const pct   = Math.round(prog.getXPProgress() * 100);

    // Selector de personaje
    const charRow = document.createElement('div');
    Object.assign(charRow.style, {
      display: 'flex', gap: '10px',
      marginBottom: '16px',
    });

    ['Kael', 'Mika'].forEach((name, idx) => {
      const card = document.createElement('div');
      const isActive = (window._partyManager?.getActiveIndex?.() ?? 0) === idx;
      Object.assign(card.style, {
        flex         : '1', padding: '10px',
        borderRadius : '12px', textAlign: 'center',
        border       : isActive
          ? '1px solid rgba(201,168,76,0.8)'
          : '1px solid rgba(201,168,76,0.2)',
        background   : isActive
          ? 'rgba(201,168,76,0.12)'
          : 'rgba(201,168,76,0.04)',
        cursor       : 'pointer', pointerEvents: 'all',
      });

      const avatar = document.createElement('div');
      avatar.style.fontSize = '32px';
      avatar.textContent = idx === 0 ? '⚔️' : '🏹';

      const nameEl = document.createElement('div');
      Object.assign(nameEl.style, {
        fontFamily: "'Cinzel',serif", fontSize: '11px',
        color     : '#C9A84C', marginTop: '4px',
        letterSpacing: '1px',
      });
      nameEl.textContent = name;

      const hpEl = document.createElement('div');
      Object.assign(hpEl.style, {
        fontFamily: 'monospace', fontSize: '9px',
        color     : 'rgba(255,255,255,0.5)', marginTop: '2px',
      });
      const char = idx === 0
        ? window._player
        : window._companion;
      hpEl.textContent = char
        ? `HP ${char.hp ?? '?'}/${char.maxHp ?? '?'}`
        : 'HP —';

      card.append(avatar, nameEl, hpEl);
      card.addEventListener('click', () => {
        window._partyManager?.switchTo?.(idx);
        this._renderPersonaje();
      });
      card.addEventListener('touchstart', (e) => {
        e.preventDefault();
        window._partyManager?.switchTo?.(idx);
        this._renderPersonaje();
      }, { passive: false });
      charRow.appendChild(card);
    });

    // Nivel y XP
    const levelRow = document.createElement('div');
    Object.assign(levelRow.style, {
      display       : 'flex',
      justifyContent: 'space-between',
      alignItems    : 'center',
      marginBottom  : '6px',
    });

    const levelEl = document.createElement('div');
    Object.assign(levelEl.style, {
      fontFamily   : "'Cinzel',serif",
      fontSize     : '18px', color: '#C9A84C',
      letterSpacing: '2px',
    });
    levelEl.textContent = `NIVEL ${level}`;

    const xpEl = document.createElement('div');
    Object.assign(xpEl.style, {
      fontFamily: 'monospace', fontSize: '9px',
      color     : 'rgba(201,168,76,0.6)',
    });
    xpEl.textContent = next ? `${xp} / ${next} XP` : 'NIVEL MÁX';

    levelRow.append(levelEl, xpEl);

    // Barra XP
    const xpBarWrap = document.createElement('div');
    Object.assign(xpBarWrap.style, {
      width       : '100%', height: '4px',
      background  : 'rgba(201,168,76,0.15)',
      borderRadius: '2px', marginBottom: '16px',
      overflow    : 'hidden',
    });
    const xpBarFill = document.createElement('div');
    Object.assign(xpBarFill.style, {
      height     : '100%', width: `${pct}%`,
      background : 'linear-gradient(90deg, #7A6030, #C9A84C)',
      borderRadius: '2px',
      boxShadow  : '0 0 6px rgba(201,168,76,0.5)',
      transition : 'width 0.4s ease',
    });
    xpBarWrap.appendChild(xpBarFill);

    // Stats
    const statsGrid = document.createElement('div');
    Object.assign(statsGrid.style, {
      display             : 'grid',
      gridTemplateColumns : '1fr 1fr',
      gap                 : '8px',
    });

    const statDefs = [
      { label: '❤️ HP',    value: `${window._player?.hp ?? stats.maxHp} / ${stats.maxHp}` },
      { label: '⚔️ ATK',   value: stats.atk },
      { label: '🛡️ DEF',   value: stats.def },
      { label: '💨 VEL',   value: stats.speed.toFixed(1) },
      { label: '✦ Éter',   value: window._dungeonManager?.getEtherFragments?.() ?? 0 },
      { label: '⭐ Rep',    value: prog.getReputation() },
    ];

    for (const { label, value } of statDefs) {
      const cell = document.createElement('div');
      Object.assign(cell.style, {
        background  : 'rgba(201,168,76,0.06)',
        border      : '1px solid rgba(201,168,76,0.15)',
        borderRadius: '8px', padding: '8px 10px',
        display     : 'flex', justifyContent: 'space-between',
        alignItems  : 'center',
      });
      const lbl = document.createElement('span');
      Object.assign(lbl.style, {
        fontFamily: 'monospace', fontSize: '9px',
        color     : 'rgba(201,168,76,0.7)',
      });
      lbl.textContent = label;

      const val = document.createElement('span');
      Object.assign(val.style, {
        fontFamily: 'monospace', fontSize: '11px',
        color     : '#C9A84C', fontWeight: 'bold',
      });
      val.textContent = value;
      cell.append(lbl, val);
      statsGrid.appendChild(cell);
    }

    this._content.append(charRow, levelRow, xpBarWrap, statsGrid);
  }

  // ── Tab Equipamiento ──────────────────────────────────────────────────────

  _renderEquipamiento() {
    const slots = ['arma', 'armadura', 'accesorio'];

    // Stats totales del equipo
    const totalStats = { ATK: 0, DEF: 0, HP: 0, MAGIA: 0, VEL: 0 };
    for (const slot of slots) {
      const item = this._equipped[slot];
      if (item?.stats) {
        for (const [k, v] of Object.entries(item.stats)) {
          if (totalStats[k] !== undefined) totalStats[k] += v;
        }
      }
    }

    // Slots de equipo
    for (const slot of slots) {
      const item = this._equipped[slot];
      const row  = document.createElement('div');
      Object.assign(row.style, {
        display      : 'flex', gap: '10px',
        alignItems   : 'center', marginBottom: '10px',
        padding      : '10px 12px', borderRadius: '12px',
        border       : '1px solid rgba(201,168,76,0.2)',
        background   : 'rgba(201,168,76,0.04)',
        cursor       : 'pointer', pointerEvents: 'all',
      });

      const slotIcon = document.createElement('div');
      slotIcon.style.fontSize = '22px';
      slotIcon.textContent = item ? (item.icon ?? '📦') : SLOT_LABELS[slot];

      const info = document.createElement('div');
      info.style.flex = '1';

      const nameEl = document.createElement('div');
      Object.assign(nameEl.style, {
        fontFamily: 'monospace', fontSize: '10px',
        color     : item ? '#C9A84C' : 'rgba(201,168,76,0.3)',
      });
      nameEl.textContent = item ? item.name : `— ${SLOT_LABELS[slot]}`;

      const statsEl = document.createElement('div');
      Object.assign(statsEl.style, {
        fontFamily: 'monospace', fontSize: '9px',
        color     : 'rgba(255,255,255,0.4)', marginTop: '2px',
      });
      statsEl.textContent = item?.stats
        ? Object.entries(item.stats).map(([k,v]) => `${k}+${v}`).join(' ')
        : 'Sin equipo';

      info.append(nameEl, statsEl);

      const changeBtn = document.createElement('button');
      Object.assign(changeBtn.style, {
        background  : 'rgba(201,168,76,0.1)',
        border      : '1px solid rgba(201,168,76,0.3)',
        borderRadius: '8px', padding: '4px 8px',
        color       : '#C9A84C', fontFamily: 'monospace',
        fontSize    : '9px', cursor: 'pointer',
        pointerEvents: 'all',
      });
      changeBtn.textContent = 'Cambiar';
      changeBtn.addEventListener('click', () => this._openSlotPicker(slot));
      changeBtn.addEventListener('touchstart', (e) => { e.preventDefault(); this._openSlotPicker(slot); }, { passive: false });

      row.append(slotIcon, info, changeBtn);
      this._content.appendChild(row);
    }

    // Stats totales del equipo
    const sep = document.createElement('div');
    Object.assign(sep.style, {
      borderTop  : '1px solid rgba(201,168,76,0.15)',
      margin     : '8px 0', paddingTop: '10px',
      fontFamily : 'monospace', fontSize: '9px',
      color      : 'rgba(201,168,76,0.5)',
      letterSpacing: '1px',
    });
    sep.textContent = 'BONUS DE EQUIPO';
    this._content.appendChild(sep);

    const bonusGrid = document.createElement('div');
    Object.assign(bonusGrid.style, {
      display             : 'grid',
      gridTemplateColumns : 'repeat(3, 1fr)',
      gap                 : '6px',
    });

    for (const [stat, val] of Object.entries(totalStats)) {
      if (val === 0) continue;
      const cell = document.createElement('div');
      Object.assign(cell.style, {
        background  : 'rgba(201,168,76,0.06)',
        border      : '1px solid rgba(201,168,76,0.15)',
        borderRadius: '8px', padding: '6px',
        textAlign   : 'center', fontFamily: 'monospace',
      });
      cell.innerHTML = `<div style="font-size:9px;color:rgba(201,168,76,0.6)">${stat}</div>
                        <div style="font-size:12px;color:#C9A84C;font-weight:bold">+${val}</div>`;
      bonusGrid.appendChild(cell);
    }
    this._content.appendChild(bonusGrid);
  }

  _openSlotPicker(slot) {
    const inv = window._inventory;
    if (!inv) return;

    const items = inv._items.equipos.filter(i => i.slot === slot);

    const picker = document.createElement('div');
    Object.assign(picker.style, {
      position  : 'fixed', inset: '0',
      background: 'rgba(4,4,10,0.97)',
      zIndex    : '600', display: 'flex',
      flexDirection: 'column', alignItems: 'center',
      paddingTop: '20px',
    });

    const pickerTitle = document.createElement('div');
    Object.assign(pickerTitle.style, {
      fontFamily   : "'Cinzel',serif", fontSize: '13px',
      color        : '#C9A84C', letterSpacing: '2px',
      marginBottom : '16px',
    });
    pickerTitle.textContent = `ELEGIR ${SLOT_LABELS[slot].toUpperCase()}`;

    const list = document.createElement('div');
    Object.assign(list.style, {
      width  : '100%', maxWidth: '380px',
      padding: '0 16px', overflowY: 'auto',
    });

    if (items.length === 0) {
      const empty = document.createElement('div');
      Object.assign(empty.style, {
        textAlign : 'center', fontFamily: 'monospace',
        fontSize  : '11px', color: 'rgba(201,168,76,0.3)',
        padding   : '40px 0',
      });
      empty.textContent = 'Sin items disponibles';
      list.appendChild(empty);
    }

    // Opción desequipar
    const unequipRow = this._buildPickerRow(null, slot, picker);
    list.appendChild(unequipRow);

    for (const item of items) {
      const row = this._buildPickerRow(item, slot, picker);
      list.appendChild(row);
    }

    const cancelBtn = document.createElement('button');
    Object.assign(cancelBtn.style, {
      marginTop   : '16px', padding: '10px 28px',
      borderRadius: '20px',
      border      : '1px solid rgba(201,168,76,0.3)',
      background  : 'rgba(10,8,20,0.9)', color: '#C9A84C',
      fontFamily  : 'monospace', fontSize: '11px',
      cursor      : 'pointer', pointerEvents: 'all',
    });
    cancelBtn.textContent = 'Cancelar';
    cancelBtn.addEventListener('click', () => picker.remove());
    cancelBtn.addEventListener('touchstart', (e) => { e.preventDefault(); picker.remove(); }, { passive: false });

    picker.append(pickerTitle, list, cancelBtn);
    document.body.appendChild(picker);
  }

  _buildPickerRow(item, slot, picker) {
    const row = document.createElement('div');
    Object.assign(row.style, {
      display      : 'flex', alignItems: 'center',
      gap          : '10px', padding: '10px 12px',
      borderRadius : '10px', marginBottom: '8px',
      border       : item
        ? '1px solid rgba(201,168,76,0.2)'
        : '1px solid rgba(255,80,80,0.2)',
      background   : 'rgba(201,168,76,0.04)',
      cursor       : 'pointer', pointerEvents: 'all',
    });

    const icon = document.createElement('div');
    icon.style.fontSize = '22px';
    icon.textContent = item ? (item.icon ?? '📦') : '✕';

    const info = document.createElement('div');
    info.style.flex = '1';

    const nameEl = document.createElement('div');
    Object.assign(nameEl.style, {
      fontFamily: 'monospace', fontSize: '10px',
      color     : item ? '#C9A84C' : 'rgba(255,100,100,0.8)',
    });
    nameEl.textContent = item ? item.name : 'Desequipar';

    const statsEl = document.createElement('div');
    Object.assign(statsEl.style, {
      fontFamily: 'monospace', fontSize: '9px',
      color     : 'rgba(255,255,255,0.4)', marginTop: '2px',
    });
    statsEl.textContent = item?.stats
      ? Object.entries(item.stats).map(([k,v]) => `${k}+${v}`).join(' ')
      : '';

    info.append(nameEl, statsEl);
    row.append(icon, info);

    const equip = () => {
      this._equipped[slot] = item ?? null;
      this._applyEquipStats();
      picker.remove();
      this._renderEquipamiento();
    };
    row.addEventListener('click', equip);
    row.addEventListener('touchstart', (e) => { e.preventDefault(); equip(); }, { passive: false });

    return row;
  }

  _applyEquipStats() {
    const base  = this._progression.getStats();
    let atk     = base.atk;
    let def     = base.def;
    let maxHp   = base.maxHp;

    for (const item of Object.values(this._equipped)) {
      if (!item?.stats) continue;
      if (item.stats.ATK)   atk   += item.stats.ATK;
      if (item.stats.DEF)   def   += item.stats.DEF;
      if (item.stats.HP)    maxHp += item.stats.HP;
    }

    // Guardar stats efectivos
    window._effectiveStats = { atk, def, maxHp };

    // Aplicar HP al jugador
    const player = window._player;
    if (player) {
      player.maxHp = maxHp;
      player.hp    = Math.min(player.hp, maxHp);
      player.onDamage?.(player.hp, player.maxHp);
    }
  }

  // ── Tab Habilidades ───────────────────────────────────────────────────────

  _renderHabilidades() {
    const weapon = window._partyManager?.getActiveCharacter() === window._companion
      ? 'bow'
      : window._combat?._weaponType ?? 'katana';

    const prog   = this._progression;
    const skills = prog.getActiveSkills(weapon);

    if (skills.length === 0) {
      const empty = document.createElement('div');
      Object.assign(empty.style, {
        textAlign : 'center', fontFamily: 'monospace',
        fontSize  : '11px', color: 'rgba(201,168,76,0.3)',
        padding   : '40px 0',
      });
      empty.textContent = 'Sin habilidades activas';
      this._content.appendChild(empty);
      return;
    }

    const weaponLabel = document.createElement('div');
    Object.assign(weaponLabel.style, {
      fontFamily   : 'monospace', fontSize: '9px',
      color        : 'rgba(201,168,76,0.5)', letterSpacing: '2px',
      marginBottom : '10px',
    });
    const icons = { katana:'🗡️', sword:'⚔️', magic:'🔮', bow:'🏹' };
    weaponLabel.textContent = `${icons[weapon] ?? '⚔️'} ${weapon.toUpperCase()}`;
    this._content.appendChild(weaponLabel);

    for (const skill of skills) {
      const row = document.createElement('div');
      Object.assign(row.style, {
        display      : 'flex', gap: '12px', alignItems: 'center',
        padding      : '10px 12px', borderRadius: '12px',
        marginBottom : '8px',
        border       : skill.available
          ? '1px solid rgba(201,168,76,0.3)'
          : '1px solid rgba(255,255,255,0.08)',
        background   : skill.available
          ? 'rgba(201,168,76,0.06)'
          : 'rgba(255,255,255,0.02)',
        opacity      : skill.available ? '1' : '0.5',
      });

      const iconEl = document.createElement('div');
      iconEl.style.cssText = 'font-size:28px;min-width:36px;text-align:center;';
      iconEl.textContent = skill.icon ?? '✨';

      const info = document.createElement('div');
      info.style.flex = '1';

      const nameRow = document.createElement('div');
      Object.assign(nameRow.style, {
        display       : 'flex', justifyContent: 'space-between',
        alignItems    : 'center', marginBottom: '3px',
      });

      const nameEl = document.createElement('div');
      Object.assign(nameEl.style, {
        fontFamily: 'monospace', fontSize: '11px', color: '#C9A84C',
      });
      nameEl.textContent = skill.name ?? skill.id;

      const rarityEl = document.createElement('div');
      Object.assign(rarityEl.style, {
        fontFamily  : 'monospace', fontSize: '8px',
        padding     : '2px 6px', borderRadius: '4px',
        background  : 'rgba(201,168,76,0.12)',
        color       : '#C9A84C', letterSpacing: '1px',
      });
      rarityEl.textContent = (skill.rarity ?? 'common').toUpperCase();

      nameRow.append(nameEl, rarityEl);

      const descEl = document.createElement('div');
      Object.assign(descEl.style, {
        fontFamily: 'monospace', fontSize: '9px',
        color     : 'rgba(255,255,255,0.45)', lineHeight: '1.4',
      });
      descEl.textContent = skill.description ?? skill.desc ?? '—';

      const reqEl = document.createElement('div');
      Object.assign(reqEl.style, {
        fontFamily : 'monospace', fontSize: '8px',
        color      : skill.available ? '#44ff88' : 'rgba(255,100,100,0.7)',
        marginTop  : '3px',
      });
      reqEl.textContent = skill.available
        ? '✓ Disponible'
        : `Requiere ${skill.xpRequired} XP`;

      info.append(nameRow, descEl, reqEl);
      row.append(iconEl, info);
      this._content.appendChild(row);
    }
  }

  // ── API pública ───────────────────────────────────────────────────────────

  open(tab = 'personaje') {
    this._open = true;
    this._overlay.style.display = 'flex';
    this._switchTab(tab);
  }

  close() {
    this._open = false;
    this._overlay.style.display = 'none';
  }

  isOpen() { return this._open; }
}
