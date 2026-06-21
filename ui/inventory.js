// ui/inventory.js — Ashes of the Reborn | Valiant Gaming

const SECTIONS = ['materiales', 'equipos', 'consumibles'];

const SECTION_LABELS = {
  materiales : '🪵 Materiales',
  equipos    : '⚔️ Equipos',
  consumibles: '🧪 Consumibles',
};

export class InventoryUI {
  constructor() {
    this._open    = false;
    this._section = 'materiales';
    this._items   = {
      materiales : [],
      equipos    : [],
      consumibles: [],
    };
    this._buildUI();
  }
const header = document.createElement('div');
    Object.assign(header.style, {
      width         : '100%',
      maxWidth      : '420px',
      display       : 'flex',
      alignItems    : 'center',
      justifyContent: 'space-between',
      padding       : '0 16px 12px',
      borderBottom  : '1px solid rgba(201,168,76,0.2)',
      gap           : '8px',
    });

    const title = document.createElement('div');
    Object.assign(title.style, {
      fontFamily   : "'Cinzel',serif",
      fontSize     : '14px',
      letterSpacing: '3px',
      color        : '#C9A84C',
    });
    title.textContent = 'INVENTARIO';

    // ── Contador de monedas/oro ───────────────────────────────────────────
    const currencyWrap = document.createElement('div');
    Object.assign(currencyWrap.style, {
      display    : 'flex',
      gap        : '10px',
      fontFamily : 'monospace',
      fontSize   : '11px',
      flex       : '1',
      justifyContent: 'center',
    });

    const monedasEl = document.createElement('div');
    monedasEl.style.color = '#EEE8D5';
    const oroEl = document.createElement('div');
    oroEl.style.color = '#FFD700';

    const refreshCurrency = () => {
      const currency = window._currency;
      monedasEl.textContent = `🪙 ${currency?.getMonedas() ?? 0}`;
      oroEl.textContent     = `✨ ${currency?.getOro() ?? 0}`;
    };
    refreshCurrency();

    if (window._currency) {
      const prevMonedas = window._currency.onMonedasChange;
      const prevOro     = window._currency.onOroChange;
      window._currency.onMonedasChange = (v) => { prevMonedas?.(v); refreshCurrency(); };
      window._currency.onOroChange     = (v) => { prevOro?.(v); refreshCurrency(); };
    }

    currencyWrap.append(monedasEl, oroEl);
    this._refreshCurrency = refreshCurrency;

    const closeBtn = document.createElement('button');
    Object.assign(closeBtn.style, {
      background   : 'none',
      border       : 'none',
      color        : '#C9A84C',
      fontSize     : '20px',
      cursor       : 'pointer',
      pointerEvents: 'all',
    });
    closeBtn.textContent = '✕';
    closeBtn.addEventListener('click', () => this.close());
    closeBtn.addEventListener('touchstart', (e) => { e.preventDefault(); this.close(); }, { passive: false });

    header.append(title, currencyWrap, closeBtn);

    this._tabBar = document.createElement('div');
    Object.assign(this._tabBar.style, {
      width         : '100%',
      maxWidth      : '420px',
      display       : 'flex',
      justifyContent: 'space-around',
      padding       : '10px 8px',
      gap           : '6px',
    });

    this._tabs = {};
    for (const sec of SECTIONS) {
      const tab = document.createElement('button');
      Object.assign(tab.style, {
        flex         : '1',
        padding      : '8px 4px',
        borderRadius : '10px',
        border       : '1px solid rgba(201,168,76,0.3)',
        background   : 'rgba(201,168,76,0.06)',
        color        : 'rgba(201,168,76,0.6)',
        fontFamily   : 'monospace',
        fontSize     : '10px',
        letterSpacing: '1px',
        cursor       : 'pointer',
        pointerEvents: 'all',
        transition   : 'all 0.2s',
      });
      tab.textContent = SECTION_LABELS[sec];
      tab.addEventListener('click', () => this._switchSection(sec));
      tab.addEventListener('touchstart', (e) => { e.preventDefault(); this._switchSection(sec); }, { passive: false });
      this._tabs[sec] = tab;
      this._tabBar.appendChild(tab);
    }

    this._grid = document.createElement('div');
    Object.assign(this._grid.style, {
      width              : '100%',
      maxWidth           : '420px',
      display            : 'grid',
      gridTemplateColumns: 'repeat(4, 1fr)',
      gap                : '8px',
      padding            : '12px 16px',
    });

    this._emptyMsg = document.createElement('div');
    Object.assign(this._emptyMsg.style, {
      width     : '100%',
      maxWidth  : '420px',
      textAlign : 'center',
      fontFamily: 'monospace',
      fontSize  : '11px',
      color     : 'rgba(201,168,76,0.3)',
      padding   : '40px 0',
      display   : 'none',
    });
    this._emptyMsg.textContent = 'Sin items';

    this._tooltip = document.createElement('div');
    Object.assign(this._tooltip.style, {
      position     : 'fixed',
      background   : 'rgba(4,4,10,0.97)',
      border       : '1px solid rgba(201,168,76,0.4)',
      borderRadius : '10px',
      padding      : '10px 14px',
      fontFamily   : 'monospace',
      fontSize     : '11px',
      color        : '#C9A84C',
      zIndex       : '500',
      display      : 'none',
      maxWidth     : '200px',
      pointerEvents: 'none',
    });

    this._overlay.append(header, this._tabBar, this._grid, this._emptyMsg);
    document.body.append(this._overlay, this._tooltip);

    this._switchSection('materiales');
  }

  _switchSection(sec) {
    this._section = sec;
    for (const [s, tab] of Object.entries(this._tabs)) {
      const active = s === sec;
      tab.style.background = active ? 'rgba(201,168,76,0.18)' : 'rgba(201,168,76,0.06)';
      tab.style.color      = active ? '#C9A84C' : 'rgba(201,168,76,0.5)';
      tab.style.border     = active
        ? '1px solid rgba(201,168,76,0.6)'
        : '1px solid rgba(201,168,76,0.2)';
    }
    this._renderGrid();
  }

  _renderGrid() {
    this._grid.innerHTML = '';
    const items = this._items[this._section];
    if (items.length === 0) {
      this._emptyMsg.style.display = 'block';
      this._grid.style.display     = 'none';
      return;
    }
    this._emptyMsg.style.display = 'none';
    this._grid.style.display     = 'grid';

    // Consumibles usan layout de lista para mostrar botón Usar
    if (this._section === 'consumibles') {
      this._grid.style.gridTemplateColumns = '1fr';
      for (const item of items) {
        this._grid.appendChild(this._buildConsumibleRow(item));
      }
    } else {
      this._grid.style.gridTemplateColumns = 'repeat(4, 1fr)';
      for (const item of items) {
        this._grid.appendChild(this._buildSlot(item));
      }
    }
  }

  // ── Slot estándar (materiales / equipos) ──────────────────────────────────
  _buildSlot(item) {
    const slot = document.createElement('div');
    Object.assign(slot.style, {
      background   : 'rgba(201,168,76,0.06)',
      border       : `1px solid ${this._rarityColor(item.rarity)}`,
      borderRadius : '10px',
      padding      : '8px 4px',
      display      : 'flex',
      flexDirection: 'column',
      alignItems   : 'center',
      gap          : '4px',
      cursor       : 'pointer',
      position     : 'relative',
      minHeight    : '72px',
    });

    const icon = document.createElement('div');
    icon.style.fontSize = '24px';
    icon.textContent = item.icon ?? '📦';

    const name = document.createElement('div');
    Object.assign(name.style, {
      fontFamily: 'monospace',
      fontSize  : '9px',
      color     : '#C9A84C',
      textAlign : 'center',
      lineHeight: '1.2',
    });
    name.textContent = item.name;

    if (item.qty > 1 || item.section === 'materiales') {
      const qty = document.createElement('div');
      Object.assign(qty.style, {
        position  : 'absolute',
        bottom    : '4px',
        right     : '6px',
        fontFamily: 'monospace',
        fontSize  : '9px',
        color     : 'rgba(255,255,255,0.6)',
      });
      qty.textContent = `x${item.qty}`;
      slot.appendChild(qty);
    }

    if (item.equipped) {
      const eq = document.createElement('div');
      Object.assign(eq.style, {
        position: 'absolute', top: '3px', right: '4px',
        fontSize: '8px', color: '#44ff88',
      });
      eq.textContent = '✓';
      slot.appendChild(eq);
    }

    slot.append(icon, name);
    slot.addEventListener('click', (e) => this._showTooltip(item, e));
    slot.addEventListener('touchstart', (e) => { e.preventDefault(); this._showTooltip(item, e); }, { passive: false });
    return slot;
  }

  // ── Fila de consumible con botón Usar ─────────────────────────────────────
  _buildConsumibleRow(item) {
    const row = document.createElement('div');
    Object.assign(row.style, {
      display     : 'flex',
      alignItems  : 'center',
      gap         : '12px',
      padding     : '10px 14px',
      borderRadius: '12px',
      border      : `1px solid ${this._rarityColor(item.rarity)}`,
      background  : 'rgba(201,168,76,0.04)',
      marginBottom: '2px',
    });

    const iconEl = document.createElement('div');
    iconEl.style.fontSize = '28px';
    iconEl.style.minWidth = '36px';
    iconEl.style.textAlign = 'center';
    iconEl.textContent = item.icon ?? '🧪';

    const info = document.createElement('div');
    info.style.flex = '1';

    const nameLine = document.createElement('div');
    Object.assign(nameLine.style, {
      fontFamily: 'monospace', fontSize: '11px', color: '#C9A84C',
    });
    nameLine.textContent = item.name;

    const descLine = document.createElement('div');
    Object.assign(descLine.style, {
      fontFamily: 'monospace', fontSize: '9px',
      color: 'rgba(255,255,255,0.45)', marginTop: '2px', lineHeight: '1.3',
    });
    descLine.textContent = item.desc ?? '';

    const qtyLine = document.createElement('div');
    Object.assign(qtyLine.style, {
      fontFamily: 'monospace', fontSize: '9px',
      color: 'rgba(201,168,76,0.5)', marginTop: '3px',
    });
    qtyLine.textContent = `x${item.qty ?? 1}`;

    info.append(nameLine, descLine, qtyLine);

    // ── Botón Usar ────────────────────────────────────────────────────────
    const useBtn = document.createElement('button');
    Object.assign(useBtn.style, {
      padding      : '8px 14px',
      borderRadius : '10px',
      border       : '1px solid rgba(201,168,76,0.5)',
      background   : 'rgba(201,168,76,0.12)',
      color        : '#C9A84C',
      fontFamily   : 'monospace',
      fontSize     : '10px',
      cursor       : 'pointer',
      pointerEvents: 'all',
      whiteSpace   : 'nowrap',
      transition   : 'all 0.15s',
      flexShrink   : '0',
    });
    useBtn.textContent = 'Usar';

    useBtn.addEventListener('mouseenter', () => {
      useBtn.style.background = 'rgba(201,168,76,0.25)';
      useBtn.style.border     = '1px solid rgba(201,168,76,0.8)';
    });
    useBtn.addEventListener('mouseleave', () => {
      useBtn.style.background = 'rgba(201,168,76,0.12)';
      useBtn.style.border     = '1px solid rgba(201,168,76,0.5)';
    });

    const doUse = () => this._useConsumible(item, qtyLine, useBtn, row);
    useBtn.addEventListener('click', doUse);
    useBtn.addEventListener('touchstart', (e) => { e.preventDefault(); doUse(); }, { passive: false });

    row.append(iconEl, info, useBtn);
    return row;
  }

  // ── Lógica de uso de consumibles ──────────────────────────────────────────
  _useConsumible(item, qtyEl, btn, rowEl) {
    if (!item.effect) return;
    if ((item.qty ?? 1) <= 0) return;

    const effect = item.effect;
    let used = false;

    if (effect.type === 'heal') {
      const target = this._getHealTarget();
      if (target) {
        const before = target.hp;
        target.hp = Math.min(target.hp + effect.value, target.maxHp);
        target.onDamage?.(target.hp, target.maxHp);
        this._showUseNotification(item.icon, item.name, `+${Math.ceil(target.hp - before)} HP`);
        used = true;
      }
    } else if (effect.type === 'mana') {
      const prog = window._prog;
      if (prog) {
        prog.addMagicEnergy(effect.value);
        this._showUseNotification(item.icon, item.name, `+${effect.value} Maná`);
        used = true;
      }
    } else if (effect.type === 'buff') {
      used = this._applyBuff(effect, item.icon, item.name);
    }

    if (!used) return;

    // Descontar del inventario
    item.qty = (item.qty ?? 1) - 1;

    if (item.qty <= 0) {
      // Eliminar del array y del DOM
      this._items.consumibles = this._items.consumibles.filter(i => i.id !== item.id);
      rowEl.style.transition = 'opacity 0.3s';
      rowEl.style.opacity    = '0';
      setTimeout(() => {
        rowEl.remove();
        if (this._items.consumibles.length === 0) {
          this._emptyMsg.style.display = 'block';
          this._grid.style.display     = 'none';
        }
      }, 300);
    } else {
      qtyEl.textContent = `x${item.qty}`;
    }
  }

  // ── Objetivo de curación: personaje activo en el party ────────────────────
  _getHealTarget() {
    const active = window._partyManager?.getActiveCharacter?.();
    if (active) return active;
    return window._player ?? null;
  }

  // ── Aplicar buff temporal ─────────────────────────────────────────────────
  _applyBuff(effect, icon, itemName) {
    const prog = window._prog;
    if (!prog) return false;

    const base   = prog.getStats();
    const eff    = window._effectiveStats ?? { ...base };
    const player = window._player;

    if (effect.stat === 'atk') {
      const bonus = Math.floor((eff.atk ?? base.atk) * effect.value);
      window._effectiveStats = { ...eff, atk: (eff.atk ?? base.atk) + bonus };
      this._showUseNotification(icon, itemName, `ATK +${bonus} (${effect.duration}s)`);

      setTimeout(() => {
        const cur = window._effectiveStats ?? {};
        window._effectiveStats = { ...cur, atk: Math.max((cur.atk ?? base.atk) - bonus, base.atk) };
      }, effect.duration * 1000);

    } else if (effect.stat === 'def') {
      const bonus = Math.floor((eff.def ?? base.def) * effect.value);
      window._effectiveStats = { ...eff, def: (eff.def ?? base.def) + bonus };
      this._showUseNotification(icon, itemName, `DEF +${bonus} (${effect.duration}s)`);

      setTimeout(() => {
        const cur = window._effectiveStats ?? {};
        window._effectiveStats = { ...cur, def: Math.max((cur.def ?? base.def) - bonus, base.def) };
      }, effect.duration * 1000);
    }

    // Indicador visual de buff activo en HUD
    this._showBuffIndicator(icon, itemName, effect.duration);
    return true;
  }

  // ── Notificación de uso (esquina inferior) ────────────────────────────────
  _showUseNotification(icon, name, detail) {
    const el = document.createElement('div');
    Object.assign(el.style, {
      position     : 'fixed',
      bottom       : '200px',
      left         : '50%',
      transform    : 'translateX(-50%)',
      background   : 'rgba(4,4,10,0.92)',
      border       : '1px solid rgba(201,168,76,0.5)',
      borderRadius : '20px',
      padding      : '8px 20px',
      fontFamily   : 'monospace',
      fontSize     : '11px',
      color        : '#C9A84C',
      pointerEvents: 'none',
      zIndex       : '600',
      opacity      : '1',
      transition   : 'opacity 0.7s, bottom 0.7s',
      whiteSpace   : 'nowrap',
      textAlign    : 'center',
    });
    el.textContent = `${icon} ${name}  ${detail}`;
    document.body.appendChild(el);
    requestAnimationFrame(() => requestAnimationFrame(() => {
      el.style.opacity = '0';
      el.style.bottom  = '240px';
    }));
    setTimeout(() => el.remove(), 750);
  }

  // ── Indicador de buff activo en pantalla ──────────────────────────────────
  _showBuffIndicator(icon, name, duration) {
    const id  = `_buff_${icon}`;
    const old = document.getElementById(id);
    if (old) old.remove();

    const el = document.createElement('div');
    el.id = id;
    Object.assign(el.style, {
      position     : 'fixed',
      top          : '60px',
      right        : '14px',
      background   : 'rgba(4,4,10,0.88)',
      border       : '1px solid rgba(201,168,76,0.4)',
      borderRadius : '10px',
      padding      : '6px 10px',
      fontFamily   : 'monospace',
      fontSize     : '10px',
      color        : '#C9A84C',
      pointerEvents: 'none',
      zIndex       : '200',
      display      : 'flex',
      alignItems   : 'center',
      gap          : '6px',
    });

    const iconEl = document.createElement('span');
    iconEl.textContent = icon;

    const timerEl = document.createElement('span');
    timerEl.style.color = 'rgba(201,168,76,0.7)';

    el.append(iconEl, timerEl);
    document.body.appendChild(el);

    let remaining = duration;
    const tick = setInterval(() => {
      remaining--;
      timerEl.textContent = `${remaining}s`;
      if (remaining <= 0) {
        clearInterval(tick);
        el.style.transition = 'opacity 0.5s';
        el.style.opacity    = '0';
        setTimeout(() => el.remove(), 500);
      }
    }, 1000);
    timerEl.textContent = `${remaining}s`;
  }

  _rarityColor(rarity) {
    switch (rarity) {
      case 'comun'     : return 'rgba(180,180,180,0.3)';
      case 'raro'      : return 'rgba(80,120,255,0.5)';
      case 'epico'     : return 'rgba(160,60,255,0.5)';
      case 'legendario': return 'rgba(255,160,0,0.6)';
      default          : return 'rgba(201,168,76,0.2)';
    }
  }

  _showTooltip(item, e) {
    const lines = [item.name];
    if (item.desc)  lines.push(item.desc);
    if (item.stats) {
      for (const [k, v] of Object.entries(item.stats)) {
        lines.push(`${k}: +${v}`);
      }
    }
    if (item.rarity) lines.push(`[${item.rarity}]`);
    this._tooltip.innerHTML = lines.map((l, i) =>
      `<div style="opacity:${i===0?1:0.7};margin-bottom:2px">${l}</div>`
    ).join('');
    const rect = e.target.getBoundingClientRect();
    this._tooltip.style.display = 'block';
    this._tooltip.style.left    = Math.min(rect.left, window.innerWidth - 220) + 'px';
    this._tooltip.style.top     = (rect.top - 10) + 'px';
    setTimeout(() => { this._tooltip.style.display = 'none'; }, 2000);
  }

  showDropNotification(name, qty, icon = '📦') {
    const el = document.createElement('div');
    Object.assign(el.style, {
      position     : 'fixed',
      bottom       : '180px',
      left         : '50%',
      transform    : 'translateX(-50%)',
      background   : 'rgba(4,4,10,0.88)',
      border       : '1px solid rgba(201,168,76,0.4)',
      borderRadius : '20px',
      padding      : '6px 16px',
      fontFamily   : 'monospace',
      fontSize     : '11px',
      color        : '#C9A84C',
      pointerEvents: 'none',
      zIndex       : '350',
      opacity      : '1',
      transition   : 'opacity 0.8s, bottom 0.8s',
      whiteSpace   : 'nowrap',
    });
    el.textContent = `${icon} +${qty} ${name}`;
    document.body.appendChild(el);
    requestAnimationFrame(() => requestAnimationFrame(() => {
      el.style.opacity = '0';
      el.style.bottom  = '220px';
    }));
    setTimeout(() => el.remove(), 900);
  }

  addItem(item) {
    const sec = item.section ?? 'materiales';
    if (!this._items[sec]) return;
    const existing = this._items[sec].find(i => i.id === item.id);
    if (existing) {
      existing.qty = (existing.qty ?? 1) + (item.qty ?? 1);
    } else {
      this._items[sec].push({ qty: 1, ...item });
    }
    if (this._open && this._section === sec) this._renderGrid();
  }

  removeItem(id, qty = 1) {
    for (const sec of SECTIONS) {
      const idx = this._items[sec].findIndex(i => i.id === id);
      if (idx === -1) continue;
      const item = this._items[sec][idx];
      item.qty -= qty;
      if (item.qty <= 0) this._items[sec].splice(idx, 1);
      if (this._open && this._section === sec) this._renderGrid();
      return true;
    }
    return false;
  }

  hasItem(id, qty = 1) {
    for (const sec of SECTIONS) {
      const item = this._items[sec].find(i => i.id === id);
      if (item && (item.qty ?? 1) >= qty) return true;
    }
    return false;
  }

  getItem(id) {
    for (const sec of SECTIONS) {
      const item = this._items[sec].find(i => i.id === id);
      if (item) return item;
    }
    return null;
  }

  syncMaterials(buildingSystem) {
    if (!buildingSystem) return;
    const icons = { madera:'🪵', piedra:'🪨', hierro:'⚙️', mineral:'💎' };
    for (const mat of ['madera', 'piedra', 'hierro', 'mineral']) {
      const qty = buildingSystem.getMaterial?.(mat) ?? 0;
      if (qty <= 0) continue;
      this.addItem({
        id     : mat,
        name   : mat.charAt(0).toUpperCase() + mat.slice(1),
        icon   : icons[mat] ?? '📦',
        section: 'materiales',
        rarity : 'comun',
        qty,
      });
    }
  }

  open() {
    this._open = true;
    this._overlay.style.display = 'flex';
    this._switchSection(this._section);
    this._refreshCurrency?.();
  }

close() {
    this._open = false;
    this._overlay.style.display = 'none';
    this._tooltip.style.display = 'none';
  }

  isOpen() { return this._open; }
}
