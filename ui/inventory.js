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

  // ── Construir UI ──────────────────────────────────────────────────────────

  _buildUI() {
    this._overlay = document.createElement('div');
    Object.assign(this._overlay.style, {
      position      : 'fixed', inset: '0',
      background    : 'rgba(4,4,10,0.92)',
      zIndex        : '400',
      display       : 'none',
      flexDirection : 'column',
      alignItems    : 'center',
      justifyContent: 'flex-start',
      paddingTop    : '20px',
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
    title.textContent = 'INVENTARIO';

    const closeBtn = document.createElement('button');
    Object.assign(closeBtn.style, {
      background  : 'none',
      border      : 'none',
      color       : '#C9A84C',
      fontSize    : '20px',
      cursor      : 'pointer',
      pointerEvents: 'all',
    });
    closeBtn.textContent = '✕';
    closeBtn.addEventListener('click', () => this.close());
    closeBtn.addEventListener('touchstart', (e) => { e.preventDefault(); this.close(); }, { passive: false });

    header.append(title, closeBtn);

    // Tabs
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
        flex          : '1',
        padding       : '8px 4px',
        borderRadius  : '10px',
        border        : '1px solid rgba(201,168,76,0.3)',
        background    : 'rgba(201,168,76,0.06)',
        color         : 'rgba(201,168,76,0.6)',
        fontFamily    : 'monospace',
        fontSize      : '10px',
        letterSpacing : '1px',
        cursor        : 'pointer',
        pointerEvents : 'all',
        transition    : 'all 0.2s',
      });
      tab.textContent = SECTION_LABELS[sec];
      tab.addEventListener('click', () => this._switchSection(sec));
      tab.addEventListener('touchstart', (e) => { e.preventDefault(); this._switchSection(sec); }, { passive: false });
      this._tabs[sec] = tab;
      this._tabBar.appendChild(tab);
    }

    // Grid de items
    this._grid = document.createElement('div');
    Object.assign(this._grid.style, {
      width        : '100%',
      maxWidth     : '420px',
      display      : 'grid',
      gridTemplateColumns: 'repeat(4, 1fr)',
      gap          : '8px',
      padding      : '12px 16px',
    });

    // Empty state
    this._emptyMsg = document.createElement('div');
    Object.assign(this._emptyMsg.style, {
      width        : '100%',
      maxWidth     : '420px',
      textAlign    : 'center',
      fontFamily   : 'monospace',
      fontSize     : '11px',
      color        : 'rgba(201,168,76,0.3)',
      padding      : '40px 0',
      display      : 'none',
    });
    this._emptyMsg.textContent = 'Sin items';

    // Tooltip
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

  // ── Secciones ─────────────────────────────────────────────────────────────

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

  // ── Render grid ───────────────────────────────────────────────────────────

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

    for (const item of items) {
      const slot = this._buildSlot(item);
      this._grid.appendChild(slot);
    }
  }

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
      fontFamily : 'monospace',
      fontSize   : '9px',
      color      : '#C9A84C',
      textAlign  : 'center',
      lineHeight : '1.2',
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
        position    : 'absolute',
        top         : '3px',
        right       : '4px',
        fontSize    : '8px',
        color       : '#44ff88',
      });
      eq.textContent = '✓';
      slot.appendChild(eq);
    }

    slot.append(icon, name);

    // Tooltip en tap
    slot.addEventListener('click', (e) => this._showTooltip(item, e));
    slot.addEventListener('touchstart', (e) => { e.preventDefault(); this._showTooltip(item, e); }, { passive: false });

    return slot;
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

  // ── Tooltip ───────────────────────────────────────────────────────────────

  _showTooltip(item, e) {
    const lines = [item.name];
    if (item.desc)   lines.push(item.desc);
    if (item.stats)  {
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

  // ── API pública ───────────────────────────────────────────────────────────

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
    const mats = ['madera', 'piedra', 'hierro', 'mineral'];
    for (const mat of mats) {
      const qty = buildingSystem.getMaterial?.(mat) ?? 0;
      if (qty <= 0) continue;
      const icons = { madera:'🪵', piedra:'🪨', hierro:'⚙️', mineral:'💎' };
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
  }

  close() {
    this._open = false;
    this._overlay.style.display  = 'none';
    this._tooltip.style.display  = 'none';
  }

  isOpen() { return this._open; }
}
