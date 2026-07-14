// ui/inventory.js — Ashes of the Reborn | Valiant Gaming

import { getEquippedBy } from '../core/relics.js';
import { RARITY_COLOR } from '../data/palette.js';

const SECTIONS = ['materiales', 'armas', 'armaduras', 'accesorios', 'reliquias', 'consumibles'];

const SECTION_LABELS = {
  materiales : '🪵 Materiales',
  armas      : '⚔️ Armas',
  armaduras  : '🛡️ Armaduras',
  accesorios : '📿 Accesorios',
  reliquias  : '💠 Reliquias',
  consumibles: '🧪 Consumibles',
};

// Slots de equipo que usan progression.js (arma/armadura/accesorio)
const EQUIP_SECTIONS = {
  armas      : { slot: 'arma',      equipFn: 'equipWeapon',     unequipFn: 'unequipWeapon',     getFn: 'getEquippedWeapon'     },
  armaduras  : { slot: 'armadura',  equipFn: 'equipArmor',      unequipFn: 'unequipArmor',      getFn: 'getEquippedArmor'      },
  accesorios : { slot: 'accesorio', equipFn: 'equipAccessory',  unequipFn: 'unequipAccessory',  getFn: 'getEquippedAccessory'  },
};

// Progression activa por personaje (ajustar según tus globals reales)
function _getProgression(charId) {
  if (charId === 'mika') return window._mikaProgression;
  return window._prog; // kael por defecto
}

export class InventoryUI {
  constructor() {
    this._open    = false;
    this._section = 'materiales';
    this._items   = {
      materiales : [],
      armas      : [],
      armaduras  : [],
      accesorios : [],
      reliquias  : [],
      consumibles: [],
    };
    this._buildUI();
  }

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
    window._currency?.onChange(refreshCurrency);

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

    // ── Tab bar (scrolleable horizontalmente: ahora hay 6 tabs) ───────────
    this._tabBarWrap = document.createElement('div');
    Object.assign(this._tabBarWrap.style, {
      width      : '100%',
      maxWidth   : '420px',
      overflowX  : 'auto',
      overflowY  : 'hidden',
      WebkitOverflowScrolling: 'touch',
    });

    this._tabBar = document.createElement('div');
    Object.assign(this._tabBar.style, {
      display       : 'flex',
      padding       : '10px 8px',
      gap           : '6px',
      minWidth      : 'max-content',
    });

    this._tabs = {};
    for (const sec of SECTIONS) {
      const tab = document.createElement('button');
      Object.assign(tab.style, {
        padding      : '8px 10px',
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
        whiteSpace   : 'nowrap',
        flexShrink   : '0',
      });
      tab.textContent = SECTION_LABELS[sec];
      tab.addEventListener('click', () => this._switchSection(sec));
      tab.addEventListener('touchstart', (e) => { e.preventDefault(); this._switchSection(sec); }, { passive: false });
      this._tabs[sec] = tab;
      this._tabBar.appendChild(tab);
    }
    this._tabBarWrap.appendChild(this._tabBar);

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
      maxWidth     : '220px',
      pointerEvents: 'none',
    });

    this._overlay.append(header, this._tabBarWrap, this._grid, this._emptyMsg);
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

  // Orden por rareza (mayor a menor) dentro de cada tab
  _sortByRarity(items) {
    const order = { legendario: 0, epico: 1, raro: 2, comun: 3 };
    return [...items].sort((a, b) => (order[a.rarity] ?? 4) - (order[b.rarity] ?? 4));
  }

  _renderGrid() {
    this._grid.innerHTML = '';
    const items = this._sortByRarity(this._items[this._section]);
    if (items.length === 0) {
      this._emptyMsg.style.display = 'block';
      this._grid.style.display     = 'none';
      return;
    }
    this._emptyMsg.style.display = 'none';
    this._grid.style.display     = 'grid';

    if (this._section === 'consumibles') {
      this._grid.style.gridTemplateColumns = '1fr';
      for (const item of items) {
        this._grid.appendChild(this._buildConsumibleRow(item));
      }
    } else if (this._section === 'reliquias') {
      this._grid.style.gridTemplateColumns = 'repeat(4, 1fr)';
      for (const item of items) {
        this._grid.appendChild(this._buildRelicSlot(item));
      }
    } else if (EQUIP_SECTIONS[this._section]) {
      this._grid.style.gridTemplateColumns = 'repeat(4, 1fr)';
      for (const item of items) {
        this._grid.appendChild(this._buildEquipSlot(item, this._section));
      }
    } else {
      this._grid.style.gridTemplateColumns = 'repeat(4, 1fr)';
      for (const item of items) {
        this._grid.appendChild(this._buildSlot(item));
      }
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
// ── Slot de equipo (armas / armaduras / accesorios) ──────────────────────

  _buildEquipSlot(item, section) {
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

    // ── Indicador de equipado (badge por personaje) ──────────────────────
    const cfg = EQUIP_SECTIONS[section];
    const equippedOnKael = _getProgression('kael')?.[cfg.getFn]?.()?.id === item.id;
    const equippedOnMika = _getProgression('mika')?.[cfg.getFn]?.()?.id === item.id;

    if (equippedOnKael || equippedOnMika) {
      const badge = document.createElement('div');
      Object.assign(badge.style, {
        position  : 'absolute',
        top       : '3px',
        right     : '4px',
        fontSize  : '8px',
        color     : '#44ff88',
        display   : 'flex',
        gap       : '2px',
      });
      if (equippedOnKael && equippedOnMika) {
        badge.textContent = '✓✓';
      } else {
        badge.textContent = '✓';
      }
      slot.appendChild(badge);

      slot.style.border = `1.5px solid #44ff88`;
    }

    slot.append(icon, name);
    slot.addEventListener('click', (e) => this._showEquipTooltip(item, section, e));
    slot.addEventListener('touchstart', (e) => { e.preventDefault(); this._showEquipTooltip(item, section, e); }, { passive: false });
    return slot;
  }
  

  _showEquipTooltip(item, section, e) {
    const cfg = EQUIP_SECTIONS[section];
    const lines = [item.name];
    if (item.desc) lines.push(item.desc);
    if (item.stats) {
      for (const [k, v] of Object.entries(item.stats)) lines.push(`${k}: +${v}`);
    }
    if (item.rarity) lines.push(`[${item.rarity}]`);

    this._tooltip.innerHTML = lines.map((l, i) =>
      `<div style="opacity:${i===0?1:0.7};margin-bottom:2px">${l}</div>`
    ).join('');

    const actions = document.createElement('div');
    Object.assign(actions.style, { display: 'flex', gap: '6px', marginTop: '8px', flexWrap: 'wrap' });

    const makeBtn = (label, onClick) => {
      const b = document.createElement('button');
      Object.assign(b.style, {
        flex         : '1',
        minWidth     : '90px',
        padding      : '6px 8px',
        borderRadius : '8px',
        border       : '1px solid rgba(201,168,76,0.5)',
        background   : 'rgba(201,168,76,0.12)',
        color        : '#C9A84C',
        fontFamily   : 'monospace',
        fontSize     : '9px',
        cursor       : 'pointer',
        pointerEvents: 'all',
      });
      b.textContent = label;
      b.addEventListener('click', onClick);
      b.addEventListener('touchstart', (ev) => { ev.preventDefault(); onClick(); }, { passive: false });
      return b;
    };

    // Kael
    const kaelProg = _getProgression('kael');
    const kaelEquipped = kaelProg?.[cfg.getFn]?.();
    if (kaelEquipped?.id === item.id) {
      actions.appendChild(makeBtn('Quitar de Kael', () => {
        kaelProg[cfg.unequipFn]?.();
        this._closeTooltip();
        this._renderGrid();
      }));
    } else {
      actions.appendChild(makeBtn('Equipar a Kael', () => {
        kaelProg?.[cfg.equipFn]?.(item);
        this._closeTooltip();
        this._renderGrid();
      }));
    }

    // Mika — solo aplica si el arma es tipo 'bow' (su único weaponType), o si es armadura/accesorio (universal)
    const mikaProg = _getProgression('mika');
    const mikaCanUse = section !== 'armas' || item.weaponType === 'bow';
    if (mikaCanUse) {
      const mikaEquipped = mikaProg?.[cfg.getFn]?.();
      if (mikaEquipped?.id === item.id) {
        actions.appendChild(makeBtn('Quitar de Mika', () => {
          mikaProg[cfg.unequipFn]?.();
          this._closeTooltip();
          this._renderGrid();
        }));
      } else {
        actions.appendChild(makeBtn('Equipar a Mika', () => {
          mikaProg?.[cfg.equipFn]?.(item);
          this._closeTooltip();
          this._renderGrid();
        }));
      }
    }

    this._tooltip.appendChild(actions);

    const rect = e.target.closest('div').getBoundingClientRect();
    this._tooltip.style.display       = 'block';
    this._tooltip.style.pointerEvents = 'all';
    this._tooltip.style.left          = Math.min(rect.left, window.innerWidth - 230) + 'px';
    this._tooltip.style.top           = (rect.top - 10) + 'px';
  }

  // ── Slot de reliquia ──────────────────────────────────────────────────────

  _buildRelicSlot(item) {
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
    icon.textContent = item.icon ?? '💠';

    const name = document.createElement('div');
    Object.assign(name.style, {
      fontFamily: 'monospace',
      fontSize  : '9px',
      color     : '#C9A84C',
      textAlign : 'center',
      lineHeight: '1.2',
    });
    name.textContent = item.name;

    const equippedBy = getEquippedBy(item.id);
    if (equippedBy) {
      const badge = document.createElement('div');
      Object.assign(badge.style, {
        position: 'absolute', top: '3px', left: '4px',
        fontSize: '11px',
      });
      badge.textContent = equippedBy === 'mika' ? '🏹' : '🗡️';
      slot.appendChild(badge);
    }

    slot.append(icon, name);
    slot.addEventListener('click', (e) => this._showRelicTooltip(item, e));
    slot.addEventListener('touchstart', (e) => { e.preventDefault(); this._showRelicTooltip(item, e); }, { passive: false });
    return slot;
  }

  _showRelicTooltip(item, e) {
    const equippedBy = getEquippedBy(item.id);

    const lines = [item.name, `Arma: ${item.weapon} | Elemento: ${item.element}`];
    if (item.stats) {
      for (const [k, v] of Object.entries(item.stats)) lines.push(`${k}: +${v}`);
    }
    if (item.rarity) lines.push(`[${item.rarity}]`);

    this._tooltip.innerHTML = lines.map((l, i) =>
      `<div style="opacity:${i===0?1:0.7};margin-bottom:2px">${l}</div>`
    ).join('');

    const actions = document.createElement('div');
    Object.assign(actions.style, { display: 'flex', gap: '6px', marginTop: '8px' });

    const makeBtn = (label, onClick) => {
      const b = document.createElement('button');
      Object.assign(b.style, {
        flex         : '1',
        padding      : '6px 8px',
        borderRadius : '8px',
        border       : '1px solid rgba(201,168,76,0.5)',
        background   : 'rgba(201,168,76,0.12)',
        color        : '#C9A84C',
        fontFamily   : 'monospace',
        fontSize     : '9px',
        cursor       : 'pointer',
        pointerEvents: 'all',
      });
      b.textContent = label;
      b.addEventListener('click', onClick);
      b.addEventListener('touchstart', (ev) => { ev.preventDefault(); onClick(); }, { passive: false });
      return b;
    };

    if (equippedBy === 'kael') {
      actions.appendChild(makeBtn('Quitar de Kael', () => {
        window._prog?.unequipRelic?.();
        this._closeTooltip();
        this._renderGrid();
      }));
    } else {
      actions.appendChild(makeBtn('Equipar a Kael', () => {
        window._prog?.equipRelic?.(item);
        this._closeTooltip();
        this._renderGrid();
      }));
    }

    if (equippedBy === 'mika') {
      actions.appendChild(makeBtn('Quitar de Mika', () => {
        window._mikaProgression?.unequipRelic?.();
        this._closeTooltip();
        this._renderGrid();
      }));
    } else {
      actions.appendChild(makeBtn('Equipar a Mika', () => {
        window._mikaProgression?.equipRelic?.(item);
        this._closeTooltip();
        this._renderGrid();
      }));
    }

    this._tooltip.appendChild(actions);

    const rect = e.target.closest('div').getBoundingClientRect();
    this._tooltip.style.display       = 'block';
    this._tooltip.style.pointerEvents = 'all';
    this._tooltip.style.left          = Math.min(rect.left, window.innerWidth - 230) + 'px';
    this._tooltip.style.top           = (rect.top - 10) + 'px';
  }

  _closeTooltip() {
    this._tooltip.style.display       = 'none';
    this._tooltip.style.pointerEvents = 'none';
  }

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

    item.qty = (item.qty ?? 1) - 1;

    if (item.qty <= 0) {
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

  _getHealTarget() {
    const active = window._partyManager?.getActiveCharacter?.();
    if (active) return active;
    return window._player ?? null;
  }

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

    this._showBuffIndicator(icon, itemName, effect.duration);
    return true;
  }

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
    return RARITY_COLOR[rarity] ?? 'rgba(201,168,76,0.2)';
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
      if (sec === 'reliquias') return;
      if (EQUIP_SECTIONS[sec]) return;
      existing.qty = (existing.qty ?? 1) + (item.qty ?? 1);
    } else {
      this._items[sec].push({ qty: 1, ...item });
    }
    if (this._open && this._section === sec) this._renderGrid();
  }

  removeUniqueItem(id, section) {
    const sec = section ?? SECTIONS.find(s => this._items[s]?.some(i => i.id === id));
    if (!sec || !this._items[sec]) return false;
    const idx = this._items[sec].findIndex(i => i.id === id);
    if (idx === -1) return false;
    this._items[sec].splice(idx, 1);
    if (this._open && this._section === sec) this._renderGrid();
    return true;
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
    this._closeTooltip();
  }

  isOpen() { return this._open; }
}
