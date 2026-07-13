// ui/bestiaryPopup.js — Ashes of the Reborn | Valiant Gaming

import { BESTIARY_DATA } from '../core/bestiary.js';
import { BESTIARY_POPUP } from '../data/palette.js';

export class BestiaryPopup {
  constructor() {
    this._queue = [];
    this._showing = false;
    this._el = this._build();
    document.body.appendChild(this._el);
  }

  _build() {
    const el = document.createElement('div');
    el.id = 'bestiary-popup';
    Object.assign(el.style, {
      position: 'fixed',
      top: '18%',
      right: '-320px',
      width: '260px',
      background: BESTIARY_POPUP.bg,
      border: `1px solid ${BESTIARY_POPUP.border}`,
      borderRadius: '10px',
      padding: '12px 14px',
      zIndex: '500',
      pointerEvents: 'none',
      transition: 'right 0.45s cubic-bezier(0.22,1,0.36,1)',
      boxShadow: '0 4px 24px rgba(0,0,0,0.7), inset 0 0 40px rgba(201,168,76,0.03)',
      display: 'flex',
      flexDirection: 'column',
      gap: '6px',
    });

    // Título
    const title = document.createElement('div');
    title.id = 'bp-title';
    Object.assign(title.style, {
      fontFamily: 'monospace',
      fontSize: '9px',
      letterSpacing: '0.25em',
      color: BESTIARY_POPUP.title,
      textTransform: 'uppercase',
    });
    title.textContent = 'Enemigo descubierto';

    // Fila principal
    const row = document.createElement('div');
    Object.assign(row.style, {
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
    });

    // Icono
    const iconBox = document.createElement('div');
    iconBox.id = 'bp-icon';
    Object.assign(iconBox.style, {
      width: '42px',
      height: '42px',
      borderRadius: '8px',
      background: 'rgba(201,168,76,0.08)',
      border: '1px solid rgba(201,168,76,0.2)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '22px',
      flexShrink: '0',
    });

    // Info derecha
    const info = document.createElement('div');
    Object.assign(info.style, {
      display: 'flex',
      flexDirection: 'column',
      gap: '3px',
    });

    const name = document.createElement('div');
    name.id = 'bp-name';
    Object.assign(name.style, {
      fontFamily: 'Georgia, serif',
      fontSize: '14px',
      color: BESTIARY_POPUP.name,
      letterSpacing: '0.05em',
    });

    const zone = document.createElement('div');
    zone.id = 'bp-zone';
    Object.assign(zone.style, {
      fontFamily: 'monospace',
      fontSize: '10px',
      color: BESTIARY_POPUP.zone,
    });

    const type = document.createElement('div');
    type.id = 'bp-type';
    Object.assign(type.style, {
      fontFamily: 'monospace',
      fontSize: '10px',
      color: BESTIARY_POPUP.type,
    });

    info.append(name, zone, type);
    row.append(iconBox, info);

    // Desc
    const desc = document.createElement('div');
    desc.id = 'bp-desc';
    Object.assign(desc.style, {
      fontFamily: 'monospace',
      fontSize: '9.5px',
      color: BESTIARY_POPUP.desc,
      lineHeight: '1.5',
      borderTop: '1px solid rgba(201,168,76,0.1)',
      paddingTop: '6px',
      marginTop: '2px',
    });

    // Barra de progreso (se vacía mientras se muestra)
    const barWrap = document.createElement('div');
    Object.assign(barWrap.style, {
      height: '2px',
      background: 'rgba(201,168,76,0.1)',
      borderRadius: '2px',
      overflow: 'hidden',
      marginTop: '4px',
    });
    const bar = document.createElement('div');
    bar.id = 'bp-bar';
    Object.assign(bar.style, {
      height: '100%',
      width: '100%',
      background: BESTIARY_POPUP.barGradient,
      borderRadius: '2px',
      transition: 'width linear',
    });
    barWrap.appendChild(bar);

    el.append(title, row, desc, barWrap);
    return el;
  }

  // Muestra el popup para un tipo de enemigo
  show(enemyType) {
    const data = BESTIARY_DATA[enemyType];
    if (!data) return;
    this._queue.push({ enemyType, data });
    if (!this._showing) this._next();
  }

  _next() {
    if (!this._queue.length) { this._showing = false; return; }
    this._showing = true;
    const { data } = this._queue.shift();

    // Rellena datos
    this._el.querySelector('#bp-icon').textContent = data.icon;
    this._el.querySelector('#bp-name').textContent = data.name;
    this._el.querySelector('#bp-zone').textContent = data.zone;
    this._el.querySelector('#bp-type').textContent = data.type;
    this._el.querySelector('#bp-desc').textContent = data.desc;

    // Barra reset
    const bar = this._el.querySelector('#bp-bar');
    bar.style.transition = 'none';
    bar.style.width = '100%';

    // Entra desde la derecha
    requestAnimationFrame(() => {
      this._el.style.right = '12px';

      // Inicia cuenta regresiva en la barra
      setTimeout(() => {
        bar.style.transition = 'width 3.2s linear';
        bar.style.width = '0%';
      }, 80);

      // Sale después de 3.5s
      setTimeout(() => {
        this._el.style.right = '-320px';
        setTimeout(() => this._next(), 500);
      }, 3500);
    });
  }
}
