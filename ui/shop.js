// ui/shop.js
// Ashes of the Reborn | Valiant Gaming

import { SHOPS }     from '../data/dialogues.js';
import { ITEMS }     from '../data/items.js';
import { inventory } from '../core/inventory.js';

const WEAPON_IDS = ['espadaHierro', 'espadaRunica', 'katanaOscura', 'arcoElfico', 'bastónCristal'];

export class ShopUI {
  constructor() {
    this._active  = false;
    this._onClose = null;
    this._build();
  }

  // ── API pública ──────────────────────────────────────────────────────────

  open(shopId, onClose = null) {
    const shop = SHOPS[shopId];
    if (!shop) return;
    this._onClose = onClose;
    this._active  = true;
    this._shopId  = shopId;
    this._render(shop);
    this._panel.style.display = 'flex';
  }

  close() {
    this._active = false;
    this._panel.style.display = 'none';
    if (this._onClose) this._onClose();
  }

  isActive() { return this._active; }

  // ── Build DOM ────────────────────────────────────────────────────────────

  _build() {
    this._panel = document.createElement('div');
    Object.assign(this._panel.style, {
      display        : 'none',
      position       : 'fixed',
      inset          : '0',
      background     : 'rgba(4,4,14,0.96)',
      flexDirection  : 'column',
      alignItems     : 'center',
      justifyContent : 'flex-start',
      zIndex         : '300',
      pointerEvents  : 'all',
      overflowY      : 'auto',
      padding        : '24px 16px',
    });

    document.body.appendChild(this._panel);
  }

  _render(shop) {
    this._panel.innerHTML = '';

    // Header
    const header = document.createElement('div');
    Object.assign(header.style, {
      width          : '100%',
      maxWidth       : '420px',
      display        : 'flex',
      justifyContent : 'space-between',
      alignItems     : 'center',
      marginBottom   : '16px',
      gap            : '8px',
    });

    const title = document.createElement('div');
    Object.assign(title.style, {
      color        : '#C9A84C',
      fontFamily   : 'monospace',
      fontSize     : '14px',
      letterSpacing: '0.3em',
      textTransform: 'uppercase',
    });
    title.textContent = shop.title;

    // Header de monedas: monedas + oro
    const currencyWrap = document.createElement('div');
    Object.assign(currencyWrap.style, {
      display: 'flex',
      gap: '10px',
      fontFamily: 'monospace',
      fontSize: '12px',
    });

    const monedasEl = document.createElement('div');
    monedasEl.style.color = '#EEE8D5';
    const oroEl = document.createElement('div');
    oroEl.style.color = '#FFD700';

    const currency = window._currency;
    const refreshCurrency = () => {
      const currency = window._currency;
      monedasEl.textContent = `🪙 ${currency?.getMonedas() ?? 0}`;
      oroEl.textContent     = `✨ ${currency?.getOro() ?? 0}`;
    };
    refreshCurrency();
    window._currency?.onChange(refreshCurrency);

    currencyWrap.appendChild(monedasEl);
    currencyWrap.appendChild(oroEl);

    const closeBtn = document.createElement('button');
    closeBtn.textContent = '✕';
    Object.assign(closeBtn.style, {
      background   : 'transparent',
      border       : '1px solid rgba(201,168,76,0.4)',
      color        : '#C9A84C',
      fontFamily   : 'monospace',
      fontSize     : '14px',
      padding      : '4px 10px',
      borderRadius : '4px',
      cursor       : 'pointer',
      pointerEvents: 'all',
    });
    closeBtn.addEventListener('touchstart', (e) => { e.preventDefault(); this.close(); }, { passive: false });
    closeBtn.addEventListener('mousedown', () => this.close());

    header.appendChild(title);
    header.appendChild(currencyWrap);
    header.appendChild(closeBtn);
    this._panel.appendChild(header);

    // Items
    const list = document.createElement('div');
    Object.assign(list.style, {
      width    : '100%',
      maxWidth : '420px',
      display  : 'flex',
      flexDirection: 'column',
      gap      : '10px',
    });

    for (const shopItem of shop.items) {
      list.appendChild(this._buildItemCard(shopItem));
    }

    this._panel.appendChild(list);
  }

  _buildItemCard(shopItem) {
    const item = ITEMS[shopItem.id];
    if (!item) {
      console.warn('[ShopUI] Item no encontrado en ITEMS:', shopItem.id);
      return document.createElement('div');
    }

    const card = document.createElement('div');
    Object.assign(card.style, {
      background   : 'rgba(255,255,255,0.04)',
      border       : '1px solid rgba(201,168,76,0.2)',
      borderRadius : '8px',
      padding      : '12px 14px',
      display      : 'flex',
      alignItems   : 'center',
      gap          : '12px',
    });

    const icon = document.createElement('div');
    icon.textContent = item.icon;
    Object.assign(icon.style, { fontSize: '28px' });

    const info = document.createElement('div');
    Object.assign(info.style, { flex: '1' });

    const name = document.createElement('div');
    name.textContent = item.name;
    Object.assign(name.style, {
      color      : '#EEE8D5',
      fontFamily : 'monospace',
      fontSize   : '13px',
    });

    const desc = document.createElement('div');
    desc.textContent = item.desc;
    Object.assign(desc.style, {
      color      : 'rgba(255,255,255,0.4)',
      fontFamily : 'monospace',
      fontSize   : '10px',
      marginTop  : '3px',
    });

    info.appendChild(name);
    info.appendChild(desc);

    const isWeaponOrGear = item.section === 'equipos';
    const owned = isWeaponOrGear
      ? inventory.getItems().some(i => i.id === item.id)
      : false;

    const currencyIcon = shopItem.currency === 'oro' ? '✨' : '🪙';
    const buyBtn = document.createElement('button');
    buyBtn.textContent = owned ? 'COMPRADO' : `${currencyIcon} ${shopItem.price}`;
    Object.assign(buyBtn.style, {
      background   : owned ? 'rgba(80,80,80,0.4)' : 'rgba(201,168,76,0.15)',
      border       : `1px solid ${owned ? 'rgba(255,255,255,0.1)' : 'rgba(201,168,76,0.5)'}`,
      color        : owned ? '#666' : '#C9A84C',
      fontFamily   : 'monospace',
      fontSize     : '11px',
      padding      : '8px 12px',
      borderRadius : '6px',
      cursor       : owned ? 'default' : 'pointer',
      pointerEvents: 'all',
      minWidth     : '80px',
      textAlign    : 'center',
    });

    if (!owned) {
      const buy = (e) => {
        e.preventDefault();
        const currency = window._currency;
        if (!currency) {
          console.warn('[ShopUI] window._currency no está disponible');
          return;
        }

        const spendFn = shopItem.currency === 'oro'
          ? currency.spendOro.bind(currency)
          : currency.spendMonedas.bind(currency);

        const ok = spendFn(shopItem.price);
        if (!ok) {
          const label = shopItem.currency === 'oro' ? 'SIN ORO' : 'SIN MONEDAS';
          buyBtn.textContent = label;
          setTimeout(() => { buyBtn.textContent = `${currencyIcon} ${shopItem.price}`; }, 1000);
          return;
        }

        inventory.addItem(item.id);

        if (isWeaponOrGear) {
          buyBtn.textContent = 'COMPRADO';
          buyBtn.style.background = 'rgba(80,80,80,0.4)';
          buyBtn.style.color = '#666';
          buyBtn.style.cursor = 'default';
          buyBtn.removeEventListener('touchstart', buy);
          buyBtn.removeEventListener('mousedown', buy);
        } else {
          buyBtn.textContent = '✓';
          setTimeout(() => { buyBtn.textContent = `${currencyIcon} ${shopItem.price}`; }, 800);
        }
      };
      buyBtn.addEventListener('touchstart', buy, { passive: false });
      buyBtn.addEventListener('mousedown', buy);
    }

    card.appendChild(icon);
    card.appendChild(info);
    card.appendChild(buyBtn);
    return card;
  }
}
