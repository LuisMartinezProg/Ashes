// ui/bestiary.js — Ashes of the Reborn | Valiant Gaming
import { BESTIARY_DATA, getBestiaryList } from '../core/bestiary.js';

export class Bestiary {
  constructor() {
    this._el = this._build();
    document.body.appendChild(this._el);
  }

  _build() {
    const el = document.createElement('div');
    Object.assign(el.style, {
      position      : 'fixed',
      inset         : '0',
      background    : 'rgba(4,4,10,0.97)',
      zIndex        : '600',
      display       : 'none',
      flexDirection : 'column',
      overflowY     : 'auto',
    });

    // Header
    const header = document.createElement('div');
    Object.assign(header.style, {
      display        : 'flex',
      alignItems     : 'center',
      justifyContent : 'space-between',
      padding        : '16px 20px 10px',
      borderBottom   : '1px solid rgba(201,168,76,0.15)',
      position       : 'sticky',
      top            : '0',
      background     : 'rgba(4,4,10,0.98)',
      zIndex         : '1',
    });

    const titleEl = document.createElement('div');
    Object.assign(titleEl.style, {
      fontFamily   : "'Cinzel', Georgia, serif",
      fontSize     : '14px',
      letterSpacing: '4px',
      color        : '#C9A84C',
      textTransform: 'uppercase',
    });
    titleEl.textContent = '📖 Bestiario';

    const closeBtn = document.createElement('button');
    closeBtn.textContent = '✕';
    Object.assign(closeBtn.style, {
      background  : 'transparent',
      border      : '1px solid rgba(201,168,76,0.3)',
      borderRadius: '6px',
      color       : '#C9A84C',
      fontSize    : '14px',
      width       : '32px',
      height      : '32px',
      cursor      : 'pointer',
      pointerEvents: 'all',
    });
    closeBtn.addEventListener('click',      () => this.close());
    closeBtn.addEventListener('touchstart', (e) => { e.preventDefault(); this.close(); }, { passive: false });

    header.append(titleEl, closeBtn);

    // Grid
    this._grid = document.createElement('div');
    Object.assign(this._grid.style, {
      display             : 'grid',
      gridTemplateColumns : 'repeat(5, 1fr)',
      gap                 : '10px',
      padding             : '16px',
    });

    el.append(header, this._grid);
    return el;
  }

  _render() {
    this._grid.innerHTML = '';
    const list = getBestiaryList();

    for (const entry of list) {
      const card = document.createElement('div');
      Object.assign(card.style, {
        background   : entry.discovered
          ? 'linear-gradient(135deg, rgba(20,14,35,0.95), rgba(10,8,20,0.95))'
          : 'rgba(10,8,20,0.6)',
        border       : `1px solid ${entry.discovered ? 'rgba(201,168,76,0.3)' : 'rgba(255,255,255,0.06)'}`,
        borderRadius : '10px',
        padding      : '10px 8px',
        display      : 'flex',
        flexDirection: 'column',
        alignItems   : 'center',
        gap          : '6px',
        cursor       : entry.discovered ? 'pointer' : 'default',
        transition   : 'transform 0.15s',
      });

      // Foto de perfil (emoji grande en círculo)
      const avatar = document.createElement('div');
      Object.assign(avatar.style, {
        width        : '52px',
        height       : '52px',
        borderRadius : '50%',
        background   : entry.discovered
          ? 'radial-gradient(circle, rgba(201,168,76,0.15), rgba(10,8,20,0.8))'
          : 'rgba(255,255,255,0.04)',
        border       : `2px solid ${entry.discovered ? 'rgba(201,168,76,0.4)' : 'rgba(255,255,255,0.08)'}`,
        display      : 'flex',
        alignItems   : 'center',
        justifyContent: 'center',
        fontSize     : entry.discovered ? '26px' : '22px',
        filter       : entry.discovered ? 'none' : 'grayscale(1) brightness(0.2)',
      });
      avatar.textContent = entry.discovered ? entry.icon : '❓';

      // Boceto / modelo (emoji más pequeño como boceto)
      const sketch = document.createElement('div');
      Object.assign(sketch.style, {
        fontSize  : '13px',
        opacity   : entry.discovered ? '0.55' : '0.1',
        fontFamily: 'monospace',
        color     : '#C9A84C',
      });
      sketch.textContent = entry.discovered ? entry.icon : '···';

      // Nombre
      const nameEl = document.createElement('div');
      Object.assign(nameEl.style, {
        fontFamily   : 'Georgia, serif',
        fontSize     : '10px',
        color        : entry.discovered ? '#E8C97A' : 'rgba(255,255,255,0.15)',
        textAlign    : 'center',
        letterSpacing: '0.03em',
      });
      nameEl.textContent = entry.discovered ? entry.name : '???';

      // Tipo
      const typeEl = document.createElement('div');
      Object.assign(typeEl.style, {
        fontFamily: 'monospace',
        fontSize  : '8px',
        color     : entry.discovered ? 'rgba(160,130,200,0.7)' : 'transparent',
      });
      typeEl.textContent = entry.type;

      // Kills
      const killsEl = document.createElement('div');
      Object.assign(killsEl.style, {
        fontFamily: 'monospace',
        fontSize  : '8px',
        color     : entry.discovered ? 'rgba(201,168,76,0.45)' : 'transparent',
      });
      killsEl.textContent = entry.discovered ? `${entry.kills}×` : '';

      card.append(avatar, sketch, nameEl, typeEl, killsEl);

      // Hover detail
      if (entry.discovered) {
        card.addEventListener('mouseenter', () => {
          card.style.transform = 'scale(1.04)';
        });
        card.addEventListener('mouseleave', () => {
          card.style.transform = 'scale(1)';
        });
        card.addEventListener('click', () => this._showDetail(entry));
        card.addEventListener('touchstart', (e) => {
          e.preventDefault(); this._showDetail(entry);
        }, { passive: false });
      }

      this._grid.appendChild(card);
    }
  }

  _showDetail(entry) {
    // Panel de detalle flotante
    let panel = document.getElementById('bestiary-detail');
    if (panel) panel.remove();

    panel = document.createElement('div');
    panel.id = 'bestiary-detail';
    Object.assign(panel.style, {
      position     : 'fixed',
      inset        : '0',
      background   : 'rgba(4,4,10,0.92)',
      zIndex       : '700',
      display      : 'flex',
      alignItems   : 'center',
      justifyContent: 'center',
      padding      : '20px',
    });

    const box = document.createElement('div');
    Object.assign(box.style, {
      background   : 'linear-gradient(135deg, rgba(20,14,35,0.98), rgba(10,8,20,0.98))',
      border       : '1px solid rgba(201,168,76,0.35)',
      borderRadius : '14px',
      padding      : '20px',
      maxWidth     : '320px',
      width        : '100%',
      display      : 'flex',
      flexDirection: 'column',
      gap          : '10px',
    });

    // Fila superior: avatar grande + boceto
    const topRow = document.createElement('div');
    Object.assign(topRow.style, {
      display    : 'flex',
      gap        : '14px',
      alignItems : 'center',
    });

    const bigAvatar = document.createElement('div');
    Object.assign(bigAvatar.style, {
      width        : '72px',
      height       : '72px',
      borderRadius : '50%',
      background   : 'radial-gradient(circle, rgba(201,168,76,0.18), rgba(10,8,20,0.9))',
      border       : '2px solid rgba(201,168,76,0.5)',
      display      : 'flex',
      alignItems   : 'center',
      justifyContent: 'center',
      fontSize     : '38px',
      flexShrink   : '0',
    });
    bigAvatar.textContent = entry.icon;

    // Boceto al lado (emoji con estilo sepia/sketch)
    const sketchBig = document.createElement('div');
    Object.assign(sketchBig.style, {
      fontSize  : '48px',
      opacity   : '0.25',
      filter    : 'sepia(1) brightness(1.4)',
      flexShrink: '0',
    });
    sketchBig.textContent = entry.icon;

    const infoCol = document.createElement('div');
    Object.assign(infoCol.style, {
      display      : 'flex',
      flexDirection: 'column',
      gap          : '3px',
    });

    const dName = document.createElement('div');
    Object.assign(dName.style, {
      fontFamily   : 'Georgia, serif',
      fontSize     : '16px',
      color        : '#E8C97A',
      letterSpacing: '0.05em',
    });
    dName.textContent = entry.name;

    const dZone = document.createElement('div');
    Object.assign(dZone.style, {
      fontFamily: 'monospace', fontSize: '9px',
      color: 'rgba(201,168,76,0.5)',
    });
    dZone.textContent = entry.zone;

    const dType = document.createElement('div');
    Object.assign(dType.style, {
      fontFamily: 'monospace', fontSize: '9px',
      color: 'rgba(160,130,200,0.8)',
    });
    dType.textContent = entry.type;

    const dKills = document.createElement('div');
    Object.assign(dKills.style, {
      fontFamily: 'monospace', fontSize: '9px',
      color: 'rgba(201,168,76,0.6)',
    });
    dKills.textContent = `Eliminados: ${entry.kills}`;

    infoCol.append(dName, dZone, dType, dKills);
    topRow.append(bigAvatar, sketchBig, infoCol);

    // Stats
    const stats = document.createElement('div');
    Object.assign(stats.style, {
      display             : 'grid',
      gridTemplateColumns : '1fr 1fr 1fr',
      gap                 : '6px',
      borderTop           : '1px solid rgba(201,168,76,0.1)',
      paddingTop          : '10px',
    });

    const statItems = [
      { label: 'HP',  value: entry.hp  },
      { label: 'ATK', value: entry.atk },
      { label: 'DEF', value: entry.def },
    ];
    for (const s of statItems) {
      const st = document.createElement('div');
      Object.assign(st.style, {
        background   : 'rgba(201,168,76,0.06)',
        borderRadius : '6px',
        padding      : '6px',
        textAlign    : 'center',
        fontFamily   : 'monospace',
      });
      st.innerHTML = `
        <div style="font-size:7px;color:rgba(201,168,76,0.45);letter-spacing:1px;">${s.label}</div>
        <div style="font-size:13px;color:#E8C97A;margin-top:2px;">${s.value}</div>
      `;
      stats.appendChild(st);
    }

    // Debilidades
    const weakRow = document.createElement('div');
    Object.assign(weakRow.style, {
      fontFamily: 'monospace', fontSize: '9px',
      color: 'rgba(255,120,120,0.7)',
    });
    weakRow.textContent = `⚠ Débil: ${entry.weakness?.join(', ') ?? '—'}`;

    // Descripción
    const descEl = document.createElement('div');
    Object.assign(descEl.style, {
      fontFamily : 'monospace',
      fontSize   : '9.5px',
      color      : 'rgba(201,168,76,0.4)',
      lineHeight : '1.6',
      borderTop  : '1px solid rgba(201,168,76,0.1)',
      paddingTop : '8px',
    });
    descEl.textContent = entry.desc;

    // Cerrar
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

    box.append(topRow, stats, weakRow, descEl, closeRow);
    panel.appendChild(box);
    panel.addEventListener('click', (e) => { if (e.target === panel) panel.remove(); });
    document.body.appendChild(panel);
  }

  open() {
    this._render();
    this._el.style.display = 'flex';
  }

  close() {
    this._el.style.display = 'none';
    const detail = document.getElementById('bestiary-detail');
    if (detail) detail.remove();
  }
}
