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
    this._el       = this._build();
    document.body.appendChild(this._el);
  }

  _build() {
    const el = document.createElement('div');
    el.id = 'bestiary-screen';
    Object.assign(el.style, {
      position     : 'fixed',
      inset        : '0',
      background   : 'rgba(4,4,10,0.97)',
      zIndex       : '600',
      display      : 'none',
      flexDirection: 'column',
      fontFamily   : 'monospace',
      overflow     : 'hidden',
    });

    // ── Header ─────────────────────────────────────────────────
    const header = document.createElement('div');
    Object.assign(header.style, {
      display        : 'flex',
      alignItems     : 'center',
      justifyContent : 'space-between',
      padding        : '14px 18px 10px',
      borderBottom   : '1px solid rgba(201,168,76,0.2)',
      flexShrink     : '0',
    });

    const htitle = document.createElement('div');
    Object.assign(htitle.style, {
      fontSize     : '13px',
      letterSpacing: '0.35em',
      color        : '#C9A84C',
      textTransform: 'uppercase',
    });
    htitle.textContent = '📖 Bestiario';

    this._countEl = document.createElement('div');
    Object.assign(this._countEl.style, {
      fontSize     : '10px',
      color        : 'rgba(201,168,76,0.45)',
      letterSpacing: '0.15em',
    });

    const closeBtn = document.createElement('button');
    closeBtn.textContent = '✕';
    Object.assign(closeBtn.style, {
      background  : 'none',
      border      : '1px solid rgba(201,168,76,0.3)',
      color       : '#C9A84C',
      borderRadius: '6px',
      width       : '30px',
      height      : '30px',
      fontSize    : '13px',
      cursor      : 'pointer',
      WebkitTapHighlightColor: 'transparent',
    });
    closeBtn.addEventListener('click',      () => this.close());
    closeBtn.addEventListener('touchstart', (e) => { e.preventDefault(); this.close(); }, { passive: false });

    header.append(htitle, this._countEl, closeBtn);

    // ── Grid scroll ────────────────────────────────────────────
    this._grid = document.createElement('div');
    Object.assign(this._grid.style, {
      display            : 'grid',
      gridTemplateColumns: 'repeat(5, 1fr)',
      gap                : '10px',
      padding            : '14px',
      overflowY          : 'auto',
      flex               : '1',
    });

    el.append(header, this._grid);
    return el;
  }

  _render() {
    this._grid.innerHTML = '';
    const list       = getBestiaryList();
    const discovered = list.filter(e => e.discovered).length;
    this._countEl.textContent = `${discovered} / ${list.length} descubiertos`;

    for (const enemy of list) {
      const card = document.createElement('div');
      Object.assign(card.style, {
        display      : 'flex',
        flexDirection: 'column',
        alignItems   : 'center',
        gap          : '5px',
        padding      : '10px 6px',
        borderRadius : '10px',
        background   : enemy.discovered
          ? `linear-gradient(135deg, ${ZONE_COLORS[enemy.zone] || '#1a1a2a'}cc, rgba(10,8,20,0.95))`
          : 'rgba(10,8,20,0.5)',
        border       : `1px solid ${enemy.discovered ? 'rgba(201,168,76,0.25)' : 'rgba(255,255,255,0.05)'}`,
        cursor       : enemy.discovered ? 'pointer' : 'default',
        transition   : 'transform 0.15s',
        WebkitTapHighlightColor: 'transparent',
      });

      // ── Foto de perfil ──────────────────────────────────────
      const avatar = document.createElement('div');
      Object.assign(avatar.style, {
        width         : '48px',
        height        : '48px',
        borderRadius  : '50%',
        background    : enemy.discovered
          ? `radial-gradient(circle at 35% 35%, ${ZONE_COLORS[enemy.zone] || '#333'}cc, #0a0a14)`
          : 'rgba(255,255,255,0.04)',
        border        : `2px solid ${enemy.discovered ? 'rgba(201,168,76,0.45)' : 'rgba(255,255,255,0.07)'}`,
        display       : 'flex',
        alignItems    : 'center',
        justifyContent: 'center',
        fontSize      : '24px',
        flexShrink    : '0',
        boxShadow     : enemy.discovered ? '0 2px 10px rgba(0,0,0,0.6)' : 'none',
      });
      avatar.textContent = enemy.discovered ? enemy.icon : '?';

      // ── Boceto al lado ──────────────────────────────────────
      const sketchRow = document.createElement('div');
      Object.assign(sketchRow.style, {
        display    : 'flex',
        alignItems : 'center',
        gap        : '4px',
      });

      const sketch = document.createElement('div');
      Object.assign(sketch.style, {
        fontSize  : '18px',
        opacity   : '0.2',
        filter    : 'sepia(1) contrast(0.5)',
        lineHeight: '1',
      });
      sketch.textContent = enemy.discovered ? enemy.icon : '···';

      sketchRow.appendChild(sketch);

      // ── Nombre ──────────────────────────────────────────────
      const nameEl = document.createElement('div');
      Object.assign(nameEl.style, {
        fontSize     : '9px',
        color        : enemy.discovered ? '#E8C97A' : 'rgba(255,255,255,0.12)',
        textAlign    : 'center',
        letterSpacing: '0.03em',
        lineHeight   : '1.3',
      });
      nameEl.textContent = enemy.discovered ? enemy.name : '???';

      // ── Tipo badge ──────────────────────────────────────────
      const typeBadge = document.createElement('div');
      Object.assign(typeBadge.style, {
        fontSize    : '7px',
        padding     : '1px 6px',
        borderRadius: '8px',
        background  : enemy.discovered
          ? (TYPE_COLORS[enemy.type] || '#222') + '88'
          : 'transparent',
        border      : `1px solid ${enemy.discovered ? 'rgba(255,255,255,0.1)' : 'transparent'}`,
        color       : enemy.discovered ? 'rgba(255,255,255,0.5)' : 'transparent',
      });
      typeBadge.textContent = enemy.type;

      // ── Kill count ──────────────────────────────────────────
      const killEl = document.createElement('div');
      Object.assign(killEl.style, {
        fontSize: '8px',
        color   : 'rgba(201,168,76,0.4)',
      });
      killEl.textContent = enemy.discovered ? `×${enemy.kills}` : '';

      card.append(avatar, sketchRow, nameEl, typeBadge, killEl);

      if (enemy.discovered) {
        card.addEventListener('mouseenter', () => card.style.transform = 'scale(1.05)');
        card.addEventListener('mouseleave', () => card.style.transform = 'scale(1)');
        card.addEventListener('click',      () => this._showDetail(enemy));
        card.addEventListener('touchstart', (e) => { e.preventDefault(); this._showDetail(enemy); }, { passive: false });
      }

      this._grid.appendChild(card);
    }
  }

  _showDetail(enemy) {
    let panel = document.getElementById('bs-detail-overlay');
    if (panel) panel.remove();

    panel = document.createElement('div');
    panel.id = 'bs-detail-overlay';
    Object.assign(panel.style, {
      position       : 'fixed',
      inset          : '0',
      background     : 'rgba(4,4,10,0.88)',
      zIndex         : '700',
      display        : 'flex',
      alignItems     : 'center',
      justifyContent : 'center',
      padding        : '20px',
    });

    const box = document.createElement('div');
    Object.assign(box.style, {
      background   : 'linear-gradient(135deg, rgba(20,14,35,0.99), rgba(10,8,20,0.99))',
      border       : '1px solid rgba(201,168,76,0.3)',
      borderRadius : '14px',
      padding      : '18px',
      maxWidth     : '340px',
      width        : '100%',
      display      : 'flex',
      flexDirection: 'column',
      gap          : '10px',
      maxHeight    : '85vh',
      overflowY    : 'auto',
    });

    // ── Fila superior: avatar + boceto + info ───────────────
    const topRow = document.createElement('div');
    Object.assign(topRow.style, {
      display    : 'flex',
      gap        : '12px',
      alignItems : 'center',
    });

    const bigAvatar = document.createElement('div');
    Object.assign(bigAvatar.style, {
      width         : '68px',
      height        : '68px',
      borderRadius  : '50%',
      background    : `radial-gradient(circle at 35% 35%, ${ZONE_COLORS[enemy.zone] || '#333'}cc, #0a0a14)`,
      border        : '2px solid rgba(201,168,76,0.5)',
      display       : 'flex',
      alignItems    : 'center',
      justifyContent: 'center',
      fontSize      : '34px',
      flexShrink    : '0',
      boxShadow     : '0 4px 16px rgba(0,0,0,0.7)',
    });
    bigAvatar.textContent = enemy.icon;

    const bigSketch = document.createElement('div');
    Object.assign(bigSketch.style, {
      fontSize  : '44px',
      opacity   : '0.18',
      filter    : 'sepia(1) contrast(0.4)',
      flexShrink: '0',
      lineHeight: '1',
    });
    bigSketch.textContent = enemy.icon;

    const infoCol = document.createElement('div');
    Object.assign(infoCol.style, {
      display      : 'flex',
      flexDirection: 'column',
      gap          : '3px',
      flex         : '1',
    });

    const dName = document.createElement('div');
    Object.assign(dName.style, {
      fontFamily   : 'Georgia, serif',
      fontSize     : '15px',
      color        : '#E8C97A',
      letterSpacing: '0.05em',
    });
    dName.textContent = enemy.name;

    [[enemy.zone, 'rgba(201,168,76,0.5)'], [enemy.type, 'rgba(160,130,200,0.7)'], [`×${enemy.kills} eliminados`, 'rgba(201,168,76,0.35)']].forEach(([text, color]) => {
      const d = document.createElement('div');
      Object.assign(d.style, { fontSize: '9px', color, fontFamily: 'monospace' });
      d.textContent = text;
      infoCol.appendChild(d);
    });

    infoCol.insertBefore(dName, infoCol.firstChild);
    topRow.append(bigAvatar, bigSketch, infoCol);

    // ── Stats ───────────────────────────────────────────────
    const stats = document.createElement('div');
    Object.assign(stats.style, {
      display            : 'grid',
      gridTemplateColumns: '1fr 1fr 1fr',
      gap                : '6px',
      borderTop          : '1px solid rgba(201,168,76,0.1)',
      paddingTop         : '10px',
    });

    [{ label: 'HP', value: enemy.hp }, { label: 'ATK', value: enemy.atk }, { label: 'DEF', value: enemy.def }].forEach(({ label, value }) => {
      const st = document.createElement('div');
      Object.assign(st.style, {
        background  : 'rgba(201,168,76,0.06)',
        borderRadius: '6px',
        padding     : '6px',
        textAlign   : 'center',
      });
      st.innerHTML = `<div style="font-size:13px;color:#C9A84C;">${value}</div><div style="font-size:7px;color:rgba(201,168,76,0.4);letter-spacing:1px;margin-top:2px;">${label}</div>`;
      stats.appendChild(st);
    });

    // ── Debilidades ─────────────────────────────────────────
    const weakWrap = document.createElement('div');
    Object.assign(weakWrap.style, { display: 'flex', gap: '5px', flexWrap: 'wrap', alignItems: 'center' });
    const weakTitle = document.createElement('div');
    Object.assign(weakTitle.style, { fontSize: '8px', color: 'rgba(201,168,76,0.4)', letterSpacing: '0.15em' });
    weakTitle.textContent = 'DÉBIL A:';
    weakWrap.appendChild(weakTitle);
    enemy.weakness.forEach(w => {
      const tag = document.createElement('div');
      Object.assign(tag.style, {
        fontSize: '8px', padding: '2px 7px', borderRadius: '8px',
        background: 'rgba(200,80,80,0.15)', border: '1px solid rgba(200,80,80,0.3)',
        color: 'rgba(220,120,120,0.8)', textTransform: 'capitalize',
      });
      tag.textContent = w;
      weakWrap.appendChild(tag);
    });

    // ── Drops ───────────────────────────────────────────────
    const dropsWrap = document.createElement('div');
    const dropsTitle = document.createElement('div');
    Object.assign(dropsTitle.style, { fontSize: '8px', color: 'rgba(201,168,76,0.4)', letterSpacing: '0.15em', marginBottom: '5px' });
    dropsTitle.textContent = 'DROPS';
    dropsWrap.appendChild(dropsTitle);

    if (enemy.drops?.length) {
      enemy.drops.forEach(drop => {
        const item = ITEMS[drop.item];
        if (!item) return;
        const row = document.createElement('div');
        Object.assign(row.style, {
          display: 'flex', justifyContent: 'space-between',
          fontSize: '9.5px', color: 'rgba(201,168,76,0.55)',
          padding: '3px 0', borderBottom: '1px solid rgba(201,168,76,0.06)',
        });
        row.innerHTML = `<span>${item.icon} ${item.name}</span><span style="color:rgba(201,168,76,0.3)">${Math.round(drop.chance * 100)}%</span>`;
        dropsWrap.appendChild(row);
      });
    } else {
      const none = document.createElement('div');
      Object.assign(none.style, { fontSize: '9px', color: 'rgba(201,168,76,0.25)' });
      none.textContent = 'Sin drops registrados';
      dropsWrap.appendChild(none);
    }

    // ── Descripción ─────────────────────────────────────────
    const desc = document.createElement('div');
    Object.assign(desc.style, {
      fontSize  : '9.5px',
      color     : 'rgba(201,168,76,0.38)',
      lineHeight: '1.6',
      borderTop : '1px solid rgba(201,168,76,0.1)',
      paddingTop: '8px',
    });
    desc.textContent = enemy.desc;

    // ── Cerrar ──────────────────────────────────────────────
    const closeRow = document.createElement('div');
    Object.assign(closeRow.style, { textAlign: 'right' });
    const closeD = document.createElement('button');
    closeD.textContent = '✕ Cerrar';
    Object.assign(closeD.style, {
      background  : 'transparent',
      border      : '1px solid rgba(201,168,76,0.3)',
      borderRadius: '6px',
      color       : '#C9A84C',
      fontFamily  : 'monospace',
      fontSize    : '10px',
      padding     : '6px 14px',
      cursor      : 'pointer',
      pointerEvents: 'all',
    });
    closeD.addEventListener('click',      () => panel.remove());
    closeD.addEventListener('touchstart', (e) => { e.preventDefault(); panel.remove(); }, { passive: false });
    closeRow.appendChild(closeD);

    box.append(topRow, stats, weakWrap, dropsWrap, desc, closeRow);
    panel.appendChild(box);
    panel.addEventListener('click', (e) => { if (e.target === panel) panel.remove(); });
    document.body.appendChild(panel);
  }

  open() {
    this._open = true;
    this._el.style.display = 'flex';
    this._render();
  }

  close() {
    this._open = false;
    this._el.style.display = 'none';
    const detail = document.getElementById('bs-detail-overlay');
    if (detail) detail.remove();
  }

  isOpen() { return this._open; }
}
