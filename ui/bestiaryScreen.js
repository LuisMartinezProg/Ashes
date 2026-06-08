// ui/bestiaryScreen.js — Ashes of the Reborn | Valiant Gaming

import { getBestiaryList } from '../core/bestiary.js';
import { ITEMS } from '../data/items.js';

const ZONE_COLORS = {
  'Bosque':             '#2d5a1b',
  'Bosque Profundo':    '#1a4020',
  'Llanuras':           '#5a4a1b',
  'Camino':             '#3a3020',
  'Territorio Yami':    '#2a1040',
  'Mazmorras':          '#1a1a2a',
  'Mazmorra — Jefe':    '#3a0a0a',
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
    this._open = false;
    this._selected = null;
    this._page = 0;
    this._el = this._build();
    document.body.appendChild(this._el);
  }

  _build() {
    const el = document.createElement('div');
    el.id = 'bestiary-screen';
    Object.assign(el.style, {
      position: 'fixed',
      inset: '0',
      background: 'rgba(4,4,10,0.97)',
      zIndex: '600',
      display: 'none',
      flexDirection: 'column',
      fontFamily: 'monospace',
      overflow: 'hidden',
    });

    // ── Header ──────────────────────────────────────────────────
    const header = document.createElement('div');
    Object.assign(header.style, {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '14px 18px 10px',
      borderBottom: '1px solid rgba(201,168,76,0.2)',
      flexShrink: '0',
    });

    const htitle = document.createElement('div');
    Object.assign(htitle.style, {
      fontSize: '13px',
      letterSpacing: '0.35em',
      color: '#C9A84C',
      textTransform: 'uppercase',
    });
    htitle.textContent = '📖 Bestiario';

    const hcount = document.createElement('div');
    hcount.id = 'bs-count';
    Object.assign(hcount.style, {
      fontSize: '10px',
      color: 'rgba(201,168,76,0.45)',
      letterSpacing: '0.15em',
    });

    const closeBtn = document.createElement('button');
    closeBtn.textContent = '✕';
    Object.assign(closeBtn.style, {
      background: 'none',
      border: '1px solid rgba(201,168,76,0.3)',
      color: '#C9A84C',
      borderRadius: '6px',
      width: '30px',
      height: '30px',
      fontSize: '13px',
      cursor: 'pointer',
      WebkitTapHighlightColor: 'transparent',
    });
    closeBtn.onclick = () => this.close();

    header.append(htitle, hcount, closeBtn);

    // ── Body ────────────────────────────────────────────────────
    const body = document.createElement('div');
    body.id = 'bs-body';
    Object.assign(body.style, {
      display: 'flex',
      flex: '1',
      overflow: 'hidden',
    });

    // Lista izquierda
    const listPanel = document.createElement('div');
    listPanel.id = 'bs-list';
    Object.assign(listPanel.style, {
      width: '42%',
      borderRight: '1px solid rgba(201,168,76,0.15)',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
    });

    const listScroll = document.createElement('div');
    listScroll.id = 'bs-list-scroll';
    Object.assign(listScroll.style, {
      flex: '1',
      overflowY: 'auto',
      overflowX: 'hidden',
    });

    // Paginación
    const pagination = document.createElement('div');
    pagination.id = 'bs-pagination';
    Object.assign(pagination.style, {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '8px 12px',
      borderTop: '1px solid rgba(201,168,76,0.15)',
      flexShrink: '0',
    });

    const prevBtn = document.createElement('button');
    prevBtn.textContent = '◀';
    prevBtn.id = 'bs-prev';
    this._stylePageBtn(prevBtn);
    prevBtn.onclick = () => this._changePage(-1);

    const pageLabel = document.createElement('div');
    pageLabel.id = 'bs-page-label';
    Object.assign(pageLabel.style, {
      fontSize: '10px',
      color: 'rgba(201,168,76,0.5)',
      letterSpacing: '0.1em',
    });

    const nextBtn = document.createElement('button');
    nextBtn.textContent = '▶';
    nextBtn.id = 'bs-next';
    this._stylePageBtn(nextBtn);
    nextBtn.onclick = () => this._changePage(1);

    pagination.append(prevBtn, pageLabel, nextBtn);
    listPanel.append(listScroll, pagination);

    // Panel derecho
    const detailPanel = document.createElement('div');
    detailPanel.id = 'bs-detail';
    Object.assign(detailPanel.style, {
      flex: '1',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px 16px',
      gap: '12px',
    });

    const placeholder = document.createElement('div');
    placeholder.id = 'bs-placeholder';
    Object.assign(placeholder.style, {
      color: 'rgba(201,168,76,0.2)',
      fontSize: '11px',
      letterSpacing: '0.2em',
      textAlign: 'center',
    });
    placeholder.textContent = 'Selecciona un enemigo';
    detailPanel.appendChild(placeholder);

    body.append(listPanel, detailPanel);
    el.append(header, body);
    return el;
  }

  _stylePageBtn(btn) {
    Object.assign(btn.style, {
      background: 'none',
      border: '1px solid rgba(201,168,76,0.25)',
      color: '#C9A84C',
      borderRadius: '6px',
      width: '28px',
      height: '28px',
      fontSize: '11px',
      cursor: 'pointer',
      WebkitTapHighlightColor: 'transparent',
    });
  }

  _renderList() {
    const list = getBestiaryList();
    const total = list.length;
    const discovered = list.filter(e => e.discovered).length;

    // Contador
    this._el.querySelector('#bs-count').textContent =
      `${discovered} / ${total} descubiertos`;

    const PER_PAGE = 10;
    const totalPages = Math.ceil(total / PER_PAGE);
    if (this._page >= totalPages) this._page = 0;

    const start = this._page * PER_PAGE;
    const slice = list.slice(start, start + PER_PAGE);

    // Página label
    this._el.querySelector('#bs-page-label').textContent =
      `${this._page + 1} / ${totalPages}`;

    // Botones
    this._el.querySelector('#bs-prev').style.opacity =
      this._page === 0 ? '0.3' : '1';
    this._el.querySelector('#bs-next').style.opacity =
      this._page >= totalPages - 1 ? '0.3' : '1';

    const scroll = this._el.querySelector('#bs-list-scroll');
    scroll.innerHTML = '';

    slice.forEach((enemy, i) => {
      const row = document.createElement('div');
      const isSelected = this._selected === enemy.id;
      Object.assign(row.style, {
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        padding: '10px 14px',
        cursor: 'pointer',
        borderBottom: '1px solid rgba(201,168,76,0.08)',
        background: isSelected
          ? 'rgba(201,168,76,0.1)'
          : i % 2 === 0 ? 'rgba(255,255,255,0.01)' : 'transparent',
        transition: 'background 0.2s',
        WebkitTapHighlightColor: 'transparent',
      });

      // Icono / silueta
      const iconBox = document.createElement('div');
      Object.assign(iconBox.style, {
        width: '32px',
        height: '32px',
        borderRadius: '6px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '18px',
        flexShrink: '0',
        background: enemy.discovered
          ? (ZONE_COLORS[enemy.zone] || '#1a1a2a')
          : '#0a0a0a',
        border: `1px solid ${enemy.discovered
          ? 'rgba(201,168,76,0.2)'
          : 'rgba(100,100,100,0.2)'}`,
        filter: enemy.discovered ? 'none' : 'grayscale(1) brightness(0.2)',
      });
      iconBox.textContent = enemy.discovered ? enemy.icon : '?';

      // Nombre
      const nameEl = document.createElement('div');
      Object.assign(nameEl.style, {
        fontSize: '11px',
        color: enemy.discovered ? '#C9A84C' : 'rgba(100,100,100,0.5)',
        letterSpacing: '0.05em',
        flex: '1',
      });
      nameEl.textContent = enemy.discovered ? enemy.name : '???';

      // Kill count
      const killEl = document.createElement('div');
      Object.assign(killEl.style, {
        fontSize: '9px',
        color: 'rgba(201,168,76,0.35)',
      });
      killEl.textContent = enemy.discovered ? `×${enemy.kills}` : '';

      row.append(iconBox, nameEl, killEl);

      row.onclick = () => {
        if (!enemy.discovered) return;
        this._selected = enemy.id;
        this._renderList();
        this._renderDetail(enemy);
      };

      scroll.appendChild(row);
    });
  }

  _renderDetail(enemy) {
    const panel = this._el.querySelector('#bs-detail');
    panel.innerHTML = '';

    // Figura — cuadro de color con inicial
    const figure = document.createElement('div');
    Object.assign(figure.style, {
      width: '110px',
      height: '110px',
      borderRadius: '14px',
      background: `linear-gradient(135deg, ${ZONE_COLORS[enemy.zone] || '#1a1a2a'}, ${TYPE_COLORS[enemy.type] || '#1a1a2a'})`,
      border: '2px solid rgba(201,168,76,0.3)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '4px',
      boxShadow: '0 4px 20px rgba(0,0,0,0.6)',
      flexShrink: '0',
    });

    const figIcon = document.createElement('div');
    figIcon.style.fontSize = '36px';
    figIcon.textContent = enemy.icon;

    const figInitial = document.createElement('div');
    Object.assign(figInitial.style, {
      fontSize: '9px',
      letterSpacing: '0.2em',
      color: 'rgba(255,255,255,0.4)',
      textTransform: 'uppercase',
    });
    figInitial.textContent = enemy.name[0];

    figure.append(figIcon, figInitial);

    // Nombre y tipo
    const nameEl = document.createElement('div');
    Object.assign(nameEl.style, {
      fontSize: '15px',
      color: '#E8C97A',
      letterSpacing: '0.08em',
      textAlign: 'center',
      fontFamily: 'Georgia, serif',
    });
    nameEl.textContent = enemy.name;

    const badges = document.createElement('div');
    Object.assign(badges.style, {
      display: 'flex',
      gap: '6px',
      flexWrap: 'wrap',
      justifyContent: 'center',
    });

    [enemy.zone, enemy.type].forEach(label => {
      const b = document.createElement('div');
      Object.assign(b.style, {
        fontSize: '9px',
        padding: '2px 8px',
        borderRadius: '10px',
        background: 'rgba(201,168,76,0.1)',
        border: '1px solid rgba(201,168,76,0.2)',
        color: 'rgba(201,168,76,0.6)',
        letterSpacing: '0.1em',
      });
      b.textContent = label;
      badges.appendChild(b);
    });

    // Stats
    const stats = document.createElement('div');
    Object.assign(stats.style, {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr 1fr',
      gap: '6px',
      width: '100%',
    });

    [
      { label: 'HP',  value: enemy.hp  },
      { label: 'ATK', value: enemy.atk },
      { label: 'DEF', value: enemy.def },
    ].forEach(({ label, value }) => {
      const box = document.createElement('div');
      Object.assign(box.style, {
        background: 'rgba(201,168,76,0.05)',
        border: '1px solid rgba(201,168,76,0.15)',
        borderRadius: '6px',
        padding: '6px',
        textAlign: 'center',
      });
      const val = document.createElement('div');
      Object.assign(val.style, {
        fontSize: '13px',
        color: '#C9A84C',
      });
      val.textContent = value;
      const lbl = document.createElement('div');
      Object.assign(lbl.style, {
        fontSize: '8px',
        color: 'rgba(201,168,76,0.4)',
        letterSpacing: '0.15em',
        marginTop: '2px',
      });
      lbl.textContent = label;
      box.append(val, lbl);
      stats.appendChild(box);
    });

    // Kills
    const killsRow = document.createElement('div');
    Object.assign(killsRow.style, {
      fontSize: '10px',
      color: 'rgba(201,168,76,0.5)',
      letterSpacing: '0.1em',
    });
    killsRow.textContent = `Eliminados: ${enemy.kills}`;

    // Debilidades
    const weakRow = document.createElement('div');
    Object.assign(weakRow.style, {
      display: 'flex',
      gap: '5px',
      flexWrap: 'wrap',
      justifyContent: 'center',
    });

    const weakLabel = document.createElement('div');
    Object.assign(weakLabel.style, {
      fontSize: '9px',
      color: 'rgba(201,168,76,0.4)',
      letterSpacing: '0.15em',
      width: '100%',
      textAlign: 'center',
    });
    weakLabel.textContent = 'DEBILIDADES';
    weakRow.appendChild(weakLabel);

    enemy.weakness.forEach(w => {
      const tag = document.createElement('div');
      Object.assign(tag.style, {
        fontSize: '9px',
        padding: '2px 8px',
        borderRadius: '10px',
        background: 'rgba(200,80,80,0.15)',
        border: '1px solid rgba(200,80,80,0.3)',
        color: 'rgba(220,120,120,0.8)',
        letterSpacing: '0.1em',
        textTransform: 'capitalize',
      });
      tag.textContent = w;
      weakRow.appendChild(tag);
    });

    // Drops
    const dropsRow = document.createElement('div');
    Object.assign(dropsRow.style, {
      width: '100%',
    });

    const dropsLabel = document.createElement('div');
    Object.assign(dropsLabel.style, {
      fontSize: '9px',
      color: 'rgba(201,168,76,0.4)',
      letterSpacing: '0.15em',
      textAlign: 'center',
      marginBottom: '5px',
    });
    dropsLabel.textContent = 'DROPS';
    dropsRow.appendChild(dropsLabel);

    const dropsList = document.createElement('div');
    Object.assign(dropsList.style, {
      display: 'flex',
      flexDirection: 'column',
      gap: '3px',
    });

    enemy.drops.forEach(drop => {
      const item = ITEMS[drop.item];
      if (!item) return;
      const row = document.createElement('div');
      Object.assign(row.style, {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        fontSize: '9.5px',
        color: 'rgba(201,168,76,0.55)',
        padding: '2px 0',
        borderBottom: '1px solid rgba(201,168,76,0.06)',
      });

      const left = document.createElement('span');
      left.textContent = `${item.icon} ${item.name}`;

      const right = document.createElement('span');
      right.style.color = 'rgba(201,168,76,0.3)';
      right.textContent = `${Math.round(drop.chance * 100)}%`;

      row.append(left, right);
      dropsList.appendChild(row);
    });

    dropsRow.appendChild(dropsList);

    // Desc
    const desc = document.createElement('div');
    Object.assign(desc.style, {
      fontSize: '9.5px',
      color: 'rgba(201,168,76,0.35)',
      lineHeight: '1.6',
      textAlign: 'center',
      borderTop: '1px solid rgba(201,168,76,0.1)',
      paddingTop: '8px',
    });
    desc.textContent = enemy.desc;

    panel.append(figure, nameEl, badges, stats, killsRow, weakRow, dropsRow, desc);
  }

  _changePage(dir) {
    const list = getBestiaryList();
    const totalPages = Math.ceil(list.length / 10);
    this._page = Math.max(0, Math.min(totalPages - 1, this._page + dir));
    this._renderList();
  }

  open() {
    this._open = true;
    this._page = 0;
    this._selected = null;
    this._el.style.display = 'flex';
    this._renderList();
    const panel = this._el.querySelector('#bs-detail');
    panel.innerHTML = '';
    const ph = document.createElement('div');
    Object.assign(ph.style, {
      color: 'rgba(201,168,76,0.2)',
      fontSize: '11px',
      letterSpacing: '0.2em',
      textAlign: 'center',
    });
    ph.textContent = 'Selecciona un enemigo';
    panel.appendChild(ph);
  }

  close() {
    this._open = false;
    this._el.style.display = 'none';
  }

  isOpen() { return this._open; }
}
