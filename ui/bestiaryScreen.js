// ui/bestiaryScreen.js — Ashes of the Reborn | Valiant Gaming

import { getBestiaryList } from '../core/bestiary.js';
import { ITEMS } from '../data/items.js';

const ZONE_COLORS = {
  'Bosque':                '#2d5a1b',
  'Bosque Profundo':       '#1a4020',
  'Llanuras':              '#5a4a1b',
  'Camino':                '#3a3020',
  'Territorio Yami':       '#2a1040',
  'Mazmorras':             '#1a1a2a',
  'Mazmorra — Jefe':       '#3a0a0a',
  'Mazmorra — Jefe Final': '#4a0000',
};

const TYPE_COLORS = {
  'Animal':     '#4a7a30',
  'Criatura':   '#306a40',
  'Elemental':  '#304a7a',
  'Bestia':     '#6a3020',
  'No-Muerto':  '#504060',
  'Humano':     '#504030',
  'Sombra':     '#302040',
  'Yami':       '#401040',
  'Constructo': '#304050',
  'Jefe':       '#6a1010',
  'Jefe Final': '#8a0808',
};

export class BestiaryScreen {
  constructor() {
    this._open     = false;
    this._selected = null;
    this._el       = this._build();
    document.body.appendChild(this._el);
  }

  _build() {
    const el = document.createElement('div');
    el.id = 'bestiary-screen';
    Object.assign(el.style, {
      position     : 'fixed',
      inset        : '0',
      background   : 'linear-gradient(160deg, #04040e 0%, #0a0614 50%, #06040e 100%)',
      zIndex       : '600',
      display      : 'none',
      flexDirection: 'column',
      fontFamily   : 'monospace',
      overflow     : 'hidden',
    });

    // ── Header ─────────────────────────────────────────────
    const header = document.createElement('div');
    Object.assign(header.style, {
      display        : 'flex',
      alignItems     : 'center',
      justifyContent : 'space-between',
      padding        : '10px 16px 8px',
      borderBottom   : '1px solid rgba(201,168,76,0.12)',
      flexShrink     : '0',
      background     : 'rgba(4,2,12,0.8)',
    });

    const htitle = document.createElement('div');
    Object.assign(htitle.style, {
      fontSize     : '11px',
      letterSpacing: '0.4em',
      color        : 'rgba(201,168,76,0.7)',
      textTransform: 'uppercase',
    });
    htitle.textContent = '✦ Bestiario';

    this._countEl = document.createElement('div');
    Object.assign(this._countEl.style, {
      fontSize     : '9px',
      color        : 'rgba(201,168,76,0.3)',
      letterSpacing: '0.15em',
    });

    const closeBtn = document.createElement('button');
    closeBtn.textContent = '✕';
    Object.assign(closeBtn.style, {
      background  : 'none',
      border      : '1px solid rgba(201,168,76,0.2)',
      color       : 'rgba(201,168,76,0.6)',
      borderRadius: '4px',
      width       : '26px',
      height      : '26px',
      fontSize    : '11px',
      cursor      : 'pointer',
      WebkitTapHighlightColor: 'transparent',
    });
    closeBtn.addEventListener('click',      () => this.close());
    closeBtn.addEventListener('touchstart', (e) => { e.preventDefault(); this.close(); }, { passive: false });

    header.append(htitle, this._countEl, closeBtn);

    // ── Body ────────────────────────────────────────────────
    const body = document.createElement('div');
    Object.assign(body.style, {
      display : 'flex',
      flex    : '1',
      overflow: 'hidden',
    });

    // ── Izquierda: grilla ───────────────────────────────────
    const leftPanel = document.createElement('div');
    Object.assign(leftPanel.style, {
      width       : '50%',
      borderRight : '1px solid rgba(201,168,76,0.08)',
      overflowY   : 'auto',
      padding     : '10px 8px',
      background  : 'rgba(2,2,10,0.4)',
    });

    this._grid = document.createElement('div');
    Object.assign(this._grid.style, {
      display            : 'grid',
      gridTemplateColumns: 'repeat(5, 1fr)',
      gap                : '5px',
    });

    leftPanel.appendChild(this._grid);

    // ── Derecha ─────────────────────────────────────────────
    const rightPanel = document.createElement('div');
    Object.assign(rightPanel.style, {
      width        : '50%',
      display      : 'flex',
      flexDirection: 'column',
      overflow     : 'hidden',
    });

    // Boceto (80%)
    this._sketchPanel = document.createElement('div');
    Object.assign(this._sketchPanel.style, {
      flex           : '8',
      display        : 'flex',
      alignItems     : 'center',
      justifyContent : 'center',
      position       : 'relative',
      overflow       : 'hidden',
      background     : 'radial-gradient(ellipse at center, rgba(80,40,120,0.08) 0%, rgba(4,2,12,0) 70%)',
    });

    // Placeholder boceto
    this._sketchEmpty = document.createElement('div');
    Object.assign(this._sketchEmpty.style, {
      display      : 'flex',
      flexDirection: 'column',
      alignItems   : 'center',
      gap          : '8px',
      opacity      : '0.2',
    });
    this._sketchEmpty.innerHTML = `
      <div style="font-size:48px;">📖</div>
      <div style="font-size:9px;letter-spacing:0.3em;color:#C9A84C;">SELECCIONA</div>
    `;
    this._sketchPanel.appendChild(this._sketchEmpty);

    // Contenido boceto (oculto hasta selección)
    this._sketchContent = document.createElement('div');
    Object.assign(this._sketchContent.style, {
      display      : 'none',
      flexDirection: 'column',
      alignItems   : 'center',
      justifyContent: 'center',
      width        : '100%',
      height       : '100%',
      position     : 'relative',
    });

    // Fondo decorativo tipo abismo
    this._sketchBg = document.createElement('div');
    Object.assign(this._sketchBg.style, {
      position    : 'absolute',
      inset       : '0',
      opacity     : '0.06',
      backgroundImage: `
        radial-gradient(circle at 50% 50%, rgba(201,168,76,0.4) 0%, transparent 60%),
        repeating-linear-gradient(0deg, transparent, transparent 30px, rgba(201,168,76,0.03) 30px, rgba(201,168,76,0.03) 31px),
        repeating-linear-gradient(90deg, transparent, transparent 30px, rgba(201,168,76,0.03) 30px, rgba(201,168,76,0.03) 31px)
      `,
    });

    // Anillo decorativo
    this._sketchRing = document.createElement('div');
    Object.assign(this._sketchRing.style, {
      position    : 'absolute',
      width       : '160px',
      height      : '160px',
      borderRadius: '50%',
      border      : '1px solid rgba(201,168,76,0.12)',
      boxShadow   : '0 0 40px rgba(100,60,200,0.08), inset 0 0 40px rgba(100,60,200,0.04)',
    });

    // Emoji boceto grande
    this._sketchIcon = document.createElement('div');
    Object.assign(this._sketchIcon.style, {
      fontSize  : '80px',
      filter    : 'drop-shadow(0 0 20px rgba(201,168,76,0.15))',
      position  : 'relative',
      zIndex    : '1',
      lineHeight: '1',
      transition: 'all 0.3s ease',
    });

    // Tipo badge sobre el boceto
    this._sketchTypeBadge = document.createElement('div');
    Object.assign(this._sketchTypeBadge.style, {
      position    : 'absolute',
      top         : '12px',
      right       : '12px',
      fontSize    : '8px',
      padding     : '3px 8px',
      borderRadius: '10px',
      letterSpacing: '0.15em',
      border      : '1px solid rgba(255,255,255,0.08)',
      color       : 'rgba(255,255,255,0.35)',
      background  : 'rgba(0,0,0,0.4)',
    });

    // Kills badge
    this._sketchKillsBadge = document.createElement('div');
    Object.assign(this._sketchKillsBadge.style, {
      position    : 'absolute',
      top         : '12px',
      left        : '12px',
      fontSize    : '8px',
      padding     : '3px 8px',
      borderRadius: '10px',
      letterSpacing: '0.1em',
      border      : '1px solid rgba(201,168,76,0.15)',
      color       : 'rgba(201,168,76,0.4)',
      background  : 'rgba(0,0,0,0.4)',
    });

    this._sketchContent.append(
      this._sketchBg, this._sketchRing,
      this._sketchIcon, this._sketchTypeBadge, this._sketchKillsBadge
    );
    this._sketchPanel.append(this._sketchEmpty, this._sketchContent);

    // ── Info panel (20%) ────────────────────────────────────
    this._infoPanel = document.createElement('div');
    Object.assign(this._infoPanel.style, {
      flex        : '2',
      borderTop   : '1px solid rgba(201,168,76,0.1)',
      padding     : '8px 12px',
      display     : 'flex',
      flexDirection: 'column',
      gap         : '5px',
      background  : 'rgba(4,2,12,0.6)',
      overflow    : 'hidden',
    });

    // Placeholder info
    this._infoEmpty = document.createElement('div');
    Object.assign(this._infoEmpty.style, {
      color       : 'rgba(201,168,76,0.15)',
      fontSize    : '9px',
      letterSpacing: '0.2em',
      margin      : 'auto',
    });
    this._infoEmpty.textContent = '— elige un enemigo —';
    this._infoPanel.appendChild(this._infoEmpty);

    // Contenido info
    this._infoContent = document.createElement('div');
    Object.assign(this._infoContent.style, {
      display      : 'none',
      flexDirection: 'column',
      gap          : '5px',
      height       : '100%',
    });

    // Fila nombre + zona
    const infoTop = document.createElement('div');
    Object.assign(infoTop.style, {
      display    : 'flex',
      alignItems : 'baseline',
      gap        : '8px',
    });
    this._infoName = document.createElement('div');
    Object.assign(this._infoName.style, {
      fontFamily   : 'Georgia, serif',
      fontSize     : '13px',
      color        : '#E8C97A',
      letterSpacing: '0.05em',
    });
    this._infoZone = document.createElement('div');
    Object.assign(this._infoZone.style, {
      fontSize: '8px',
      color   : 'rgba(201,168,76,0.35)',
    });
    infoTop.append(this._infoName, this._infoZone);

    // Stats row
    this._statsRow = document.createElement('div');
    Object.assign(this._statsRow.style, {
      display: 'flex',
      gap    : '6px',
    });

    // Desc
    this._infoDesc = document.createElement('div');
    Object.assign(this._infoDesc.style, {
      fontSize  : '8.5px',
      color     : 'rgba(201,168,76,0.3)',
      lineHeight: '1.5',
      overflow  : 'hidden',
      display   : '-webkit-box',
      WebkitLineClamp: '2',
      WebkitBoxOrient: 'vertical',
    });

    // Weak row
    this._weakRow = document.createElement('div');
    Object.assign(this._weakRow.style, {
      display : 'flex',
      gap     : '4px',
      flexWrap: 'wrap',
      alignItems: 'center',
    });

    this._infoContent.append(infoTop, this._statsRow, this._weakRow, this._infoDesc);
    this._infoPanel.append(this._infoEmpty, this._infoContent);

    rightPanel.append(this._sketchPanel, this._infoPanel);
    body.append(leftPanel, rightPanel);
    el.append(header, body);
    return el;
  }

  _render() {
    this._grid.innerHTML = '';
    const list       = getBestiaryList();
    const discovered = list.filter(e => e.discovered).length;
    this._countEl.textContent = `${discovered} / ${list.length}`;

    for (const enemy of list) {
      const card = document.createElement('div');
      const isSelected = this._selected === enemy.id;
      Object.assign(card.style, {
        aspectRatio   : '1',
        borderRadius  : '6px',
        display       : 'flex',
        alignItems    : 'center',
        justifyContent: 'center',
        fontSize      : '18px',
        cursor        : enemy.discovered ? 'pointer' : 'default',
        background    : isSelected
          ? `linear-gradient(135deg, ${ZONE_COLORS[enemy.zone] || '#1a1a2a'}cc, rgba(100,60,200,0.2))`
          : enemy.discovered
            ? `linear-gradient(135deg, ${ZONE_COLORS[enemy.zone] || '#1a1a2a'}66, rgba(10,8,20,0.8))`
            : 'rgba(8,6,16,0.8)',
        border        : `1px solid ${isSelected
          ? 'rgba(201,168,76,0.5)'
          : enemy.discovered
            ? 'rgba(201,168,76,0.12)'
            : 'rgba(255,255,255,0.04)'}`,
        boxShadow     : isSelected ? '0 0 12px rgba(201,168,76,0.2), inset 0 0 8px rgba(100,60,200,0.1)' : 'none',
        transition    : 'all 0.15s',
        filter        : enemy.discovered ? 'none' : 'brightness(0.3)',
        WebkitTapHighlightColor: 'transparent',
      });
      card.textContent = enemy.discovered ? enemy.icon : '?';

      if (enemy.discovered) {
        card.addEventListener('mouseenter', () => {
          if (!isSelected) card.style.border = '1px solid rgba(201,168,76,0.3)';
        });
        card.addEventListener('mouseleave', () => {
          if (!isSelected) card.style.border = '1px solid rgba(201,168,76,0.12)';
        });
        card.addEventListener('click',      () => this._select(enemy));
        card.addEventListener('touchstart', (e) => { e.preventDefault(); this._select(enemy); }, { passive: false });
      }

      this._grid.appendChild(card);
    }
  }

  _select(enemy) {
    this._selected = enemy.id;
    this._render();

    // ── Boceto ──────────────────────────────────────────────
    this._sketchEmpty.style.display  = 'none';
    this._sketchContent.style.display = 'flex';
    this._sketchIcon.textContent      = enemy.icon;
    this._sketchTypeBadge.textContent = enemy.type;
    this._sketchTypeBadge.style.background =
      (TYPE_COLORS[enemy.type] || '#222') + '44';
    this._sketchKillsBadge.textContent = `×${enemy.kills}`;
    this._sketchBg.style.background = `
      radial-gradient(circle at 50% 50%, ${ZONE_COLORS[enemy.zone] || '#1a1a2a'}33 0%, transparent 65%),
      repeating-linear-gradient(0deg, transparent, transparent 30px, rgba(201,168,76,0.02) 30px, rgba(201,168,76,0.02) 31px),
      repeating-linear-gradient(90deg, transparent, transparent 30px, rgba(201,168,76,0.02) 30px, rgba(201,168,76,0.02) 31px)
    `;
    this._sketchRing.style.borderColor =
      (ZONE_COLORS[enemy.zone] || '#C9A84C') + '22';

    // ── Info ─────────────────────────────────────────────────
    this._infoEmpty.style.display   = 'none';
    this._infoContent.style.display = 'flex';
    this._infoName.textContent = enemy.name;
    this._infoZone.textContent = enemy.zone;
    this._infoDesc.textContent = enemy.desc;

    // Stats
    this._statsRow.innerHTML = '';
    [{ l: 'HP', v: enemy.hp }, { l: 'ATK', v: enemy.atk }, { l: 'DEF', v: enemy.def }].forEach(({ l, v }) => {
      const s = document.createElement('div');
      Object.assign(s.style, {
        background  : 'rgba(201,168,76,0.05)',
        border      : '1px solid rgba(201,168,76,0.1)',
        borderRadius: '4px',
        padding     : '3px 6px',
        textAlign   : 'center',
        minWidth    : '36px',
      });
      s.innerHTML = `<div style="font-size:11px;color:#C9A84C;">${v}</div><div style="font-size:7px;color:rgba(201,168,76,0.35);letter-spacing:1px;">${l}</div>`;
      this._statsRow.appendChild(s);
    });

    // Weak
    this._weakRow.innerHTML = '';
    const wl = document.createElement('div');
    Object.assign(wl.style, { fontSize: '7px', color: 'rgba(201,168,76,0.3)', letterSpacing: '0.15em' });
    wl.textContent = 'DÉBIL:';
    this._weakRow.appendChild(wl);
    enemy.weakness.forEach(w => {
      const tag = document.createElement('div');
      Object.assign(tag.style, {
        fontSize: '7px', padding: '1px 5px', borderRadius: '6px',
        background: 'rgba(200,80,80,0.12)', border: '1px solid rgba(200,80,80,0.25)',
        color: 'rgba(220,120,120,0.7)', textTransform: 'capitalize',
      });
      tag.textContent = w;
      this._weakRow.appendChild(tag);
    });
  }

  open() {
    this._open     = true;
    this._selected = null;
    this._el.style.display = 'flex';
    this._sketchEmpty.style.display   = 'flex';
    this._sketchContent.style.display = 'none';
    this._infoEmpty.style.display     = 'block';
    this._infoContent.style.display   = 'none';
    this._render();
  }

  close() {
    this._open = false;
    this._el.style.display = 'none';
  }

  isOpen() { return this._open; }
}
