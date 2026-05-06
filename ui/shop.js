// ui/shop.js
// Ashes of the Reborn | Valiant Gaming

import { SHOPS }    from '../data/dialogues.js';
import { inventory } from '../core/inventory.js';

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
    this._onClose  = onClose;
    this._active   = true;
    this._shopId   = shopId;
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

    const goldEl = document.createElement('div');
    Object.assign(goldEl.style, {
      color      : '#FFD700',
      fontFamily : 'monospace',
      fontSize   : '13px',
    });
    goldEl.textContent = `🪙 ${inventory.getGold()}`;
    inventory.onGoldChange = (g) => { goldEl.textContent = `🪙 ${g}`; };

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
    header.appendChild(goldEl);
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

    for (const item of shop.items) {
      list.appendChild(this._buildItemCard(item));
    }

    this._panel.appendChild(list);
  }

  _buildItemCard(item) {
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

    const buyBtn = document.createElement('button');
    const owned  = item.id === 'sword' || item.id === 'bow' || item.id === 'magic'
      ? inventory.hasWeapon(item.id)
      : false;

    buyBtn.textContent = owned ? 'COMPRADO' : `🪙 ${item.price}`;
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
        const ok = inventory.spendGold(item.price);
        if (!ok) {
          buyBtn.textContent = 'SIN ORO';
          setTimeout(() => { buyBtn.textContent = `🪙 ${item.price}`; }, 1000);
          return;
        }
        // Arma o item
        if (['sword','bow','magic'].includes(item.id)) {
          inventory.addWeapon(item.id);
          buyBtn.textContent = 'COMPRADO';
          buyBtn.style.background = 'rgba(80,80,80,0.4)';
          buyBtn.style.color = '#666';
          buyBtn.style.cursor = 'default';
          buyBtn.removeEventListener('touchstart', buy);
          buyBtn.removeEventListener('mousedown', buy);
        } else {
          inventory.addItem(item.id);
          buyBtn.textContent = '✓';
          setTimeout(() => { buyBtn.textContent = `🪙 ${item.price}`; }, 800);
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
