// ui/gachaBoardView.js
// Vista del tablero circular "Fair" (inspirado en Neverness to Everness).
// Se monta solo cuando el jugador hace un pull (evita tener el SVG pesado
// cargado todo el tiempo en la pantalla principal del Gachapon).
//
// Responsabilidades:
//   - Dibujar el círculo de casillas (BOARD_SIZE de core/gachaBoard.js)
//   - Cámara con pan libre (drag/touch) + auto-seguimiento de la ficha al tirar
//   - Animar dado + movimiento de ficha casilla por casilla
//   - Reproducir la secuencia completa de x1 o x10 tiradas automáticamente
//
// Este módulo NO decide rareza ni pity — solo consume los "turnos" que le
// da GachaBoard.playTurn() y los anima.

import { BOARD_SIZE } from './../core/gachaBoard.js';
import { GACHA_RARITY, GACHA_TILES } from '../data/palette.js';

const RARITY_LABELS = {
  comun: 'Polvo',
  raro: 'Eco',
  epico: 'Velo',
};

const TILE_TYPE_ICONS = {
  plain: '·',
  gems: '✦',
  coin: '◆',
  echo: '≈',
  veil: '✧',
};

let _stylesInjected = false;

function _injectStyles() {
  if (_stylesInjected) return;
  _stylesInjected = true;
  const style = document.createElement('style');
  style.textContent = `
    #gacha-board-overlay {
      position: fixed; inset: 0; z-index: 340;
      background: #0B0815;
      display: none;
      flex-direction: column;
      font-family: monospace;
      color: #E8E4F0;
      -webkit-tap-highlight-color: transparent;
    }
    #gacha-board-overlay.open { display: flex; }
    #gacha-board-overlay.transformed { background: #150B1A; }

    .gboard-topbar {
      display: flex; align-items: center; justify-content: space-between;
      padding: 10px 12px;
      border-bottom: 1px solid rgba(157,127,232,0.2);
      flex-shrink: 0;
    }
    .gboard-title {
      font-family: Georgia, serif; letter-spacing: 0.1em;
      font-size: 12px; color: #9D7FE8; text-transform: uppercase;
    }
    .gboard-overlay.transformed .gboard-title { color: #E8C97A; }
    .gboard-progress { font-size: 10px; color: #6E6280; }

    .gboard-viewport {
      flex: 1; position: relative; overflow: hidden;
      touch-action: none;
    }
    #gboard-svg { width: 100%; height: 100%; display: block; }

    .gboard-tile-bg {
      fill: rgba(255,255,255,0.03);
      stroke: rgba(157,127,232,0.25);
      stroke-width: 1.5;
      transition: fill 0.3s ease, stroke 0.3s ease;
    }
    .gboard-tile-bg.landed-comun { fill: rgba(184,175,208,0.25); stroke: #B8AFD0; }
    .gboard-tile-bg.landed-raro  { fill: rgba(157,127,232,0.3); stroke: #9D7FE8; }
    .gboard-tile-bg.landed-epico { fill: rgba(232,201,122,0.35); stroke: #E8C97A; }

    .gboard-tile-icon {
      font-size: 13px; text-anchor: middle; dominant-baseline: central;
      pointer-events: none;
    }
    .gboard-tile-label {
      font-size: 6px; text-anchor: middle; fill: #6E6280;
      pointer-events: none;
    }

    .gboard-token {
      transition: transform 0.32s cubic-bezier(0.3,0.7,0.4,1);
    }
    .gboard-token-glow {
      filter: drop-shadow(0 0 6px rgba(232,201,122,0.85));
    }

    .gboard-hud {
      flex-shrink: 0; padding: 10px 14px 14px;
      border-top: 1px solid rgba(157,127,232,0.2);
    }
    .gboard-dice-row {
      display: flex; align-items: center; justify-content: center;
      gap: 10px; margin-bottom: 8px;
    }
    .gboard-die {
      width: 34px; height: 34px; border-radius: 8px;
      background: rgba(157,127,232,0.15);
      border: 1px solid rgba(157,127,232,0.5);
      display: flex; align-items: center; justify-content: center;
      font-size: 16px; font-weight: bold; color: #E8E4F0;
      transition: transform 0.15s ease;
    }
    .gboard-die.rolling { animation: gboardDieShake 0.09s infinite; }
    @keyframes gboardDieShake {
      0% { transform: rotate(-8deg); } 50% { transform: rotate(8deg); } 100% { transform: rotate(-8deg); }
    }
    .gboard-turn-label { font-size: 10px; color: #B8B0C8; }

    .gboard-reveal {
      text-align: center; min-height: 46px;
      display: flex; flex-direction: column; align-items: center; justify-content: center;
    }
    .gboard-reveal-rarity {
      font-family: Georgia, serif; font-size: 15px; font-weight: bold;
    }
    .gboard-reveal-name { font-size: 11px; color: #E8E4F0; margin-top: 2px; }
    .gboard-reveal-bonus {
      font-size: 9px; color: #7FC8E8; margin-top: 3px;
    }
    .gboard-reveal-featured {
      font-size: 9px; color: #E8C97A; margin-top: 2px; letter-spacing: 0.08em;
    }

    .gboard-continue-btn {
      display: block; margin: 10px auto 0; padding: 9px 22px;
      border-radius: 8px; border: 1px solid rgba(232,201,122,0.45);
      background: rgba(232,201,122,0.12); color: #E8C97A;
      font-family: monospace; font-size: 11px; cursor: pointer;
      opacity: 0; pointer-events: none; transition: opacity 0.25s ease;
    }
    .gboard-continue-btn.visible { opacity: 1; pointer-events: auto; }

    .gboard-summary-list {
      max-height: 90px; overflow-y: auto; margin-top: 6px;
      font-size: 9px; text-align: left; padding: 0 8px;
    }
    .gboard-summary-line { display: flex; justify-content: space-between; padding: 2px 0; }

    .gboard-hint {
      position: absolute; bottom: 8px; left: 50%; transform: translateX(-50%);
      font-size: 8px; color: rgba(184,176,200,0.5);
      pointer-events: none;
    }
  `;
  document.head.appendChild(style);
}

// Geometría del círculo: coloca las BOARD_SIZE casillas en un anillo.
const TILE_RADIUS = 26;
const RING_RADIUS = 190;
const CENTER = { x: 0, y: 0 };

function _tilePosition(index) {
  const angle = (index / BOARD_SIZE) * Math.PI * 2 - Math.PI / 2;
  return {
    x: CENTER.x + Math.cos(angle) * RING_RADIUS,
    y: CENTER.y + Math.sin(angle) * RING_RADIUS,
  };
}

export class GachaBoardView {
  constructor(board) {
    this.board = board; // instancia de core/gachaBoard.js GachaBoard
    this._camera = { x: 0, y: 0, scale: 1 };
    this._dragging = false;
    this._dragStart = null;
    this._cameraStart = null;
    this._onFinished = null; // callback al terminar toda la secuencia
    _injectStyles();
    this._build();
  }

  _bindTap(el, handler) {
    const fn = (e) => { e.preventDefault(); handler(e); };
    el.addEventListener('click', fn);
    el.addEventListener('touchstart', fn, { passive: false });
  }

  _build() {
    const overlay = document.createElement('div');
    overlay.id = 'gacha-board-overlay';
    overlay.innerHTML = `
      <div class="gboard-topbar">
        <div class="gboard-title" id="gboard-title">Velo Umbral — Fair</div>
        <div class="gboard-progress" id="gboard-progress"></div>
      </div>
      <div class="gboard-viewport" id="gboard-viewport">
        <svg id="gboard-svg" viewBox="-260 -260 520 520">
          <g id="gboard-camera-group"></g>
        </svg>
        <div class="gboard-hint">Arrastra para explorar el tablero</div>
      </div>
      <div class="gboard-hud">
        <div class="gboard-dice-row">
          <div class="gboard-die" id="gboard-die">–</div>
          <div class="gboard-turn-label" id="gboard-turn-label"></div>
        </div>
        <div class="gboard-reveal" id="gboard-reveal"></div>
        <div class="gboard-summary-list" id="gboard-summary-list"></div>
        <button class="gboard-continue-btn" id="gboard-continue-btn">Continuar</button>
      </div>
    `;
    document.body.appendChild(overlay);
    this._overlay = overlay;
    this._svg = overlay.querySelector('#gboard-svg');
    this._cameraGroup = overlay.querySelector('#gboard-camera-group');
    this._viewport = overlay.querySelector('#gboard-viewport');
    this._dieEl = overlay.querySelector('#gboard-die');
    this._turnLabelEl = overlay.querySelector('#gboard-turn-label');
    this._revealEl = overlay.querySelector('#gboard-reveal');
    this._summaryListEl = overlay.querySelector('#gboard-summary-list');
    this._continueBtn = overlay.querySelector('#gboard-continue-btn');
    this._progressEl = overlay.querySelector('#gboard-progress');

    this._bindTap(this._continueBtn, () => this._close());
    this._bindDrag();

    this._drawStaticTiles();
    this._drawToken();
  }

  _bindDrag() {
    const start = (clientX, clientY) => {
      this._dragging = true;
      this._dragStart = { x: clientX, y: clientY };
      this._cameraStart = { x: this._camera.x, y: this._camera.y };
    };
    const move = (clientX, clientY) => {
      if (!this._dragging) return;
      const dx = clientX - this._dragStart.x;
      const dy = clientY - this._dragStart.y;
      this._camera.x = this._cameraStart.x - dx;
      this._camera.y = this._cameraStart.y - dy;
      this._applyCamera(false);
    };
    const end = () => { this._dragging = false; };

    this._viewport.addEventListener('mousedown', (e) => start(e.clientX, e.clientY));
    window.addEventListener('mousemove', (e) => move(e.clientX, e.clientY));
    window.addEventListener('mouseup', end);

    this._viewport.addEventListener('touchstart', (e) => {
      const t = e.touches[0];
      start(t.clientX, t.clientY);
    }, { passive: true });
    this._viewport.addEventListener('touchmove', (e) => {
      const t = e.touches[0];
      move(t.clientX, t.clientY);
    }, { passive: true });
    this._viewport.addEventListener('touchend', end);
  }

  // Centra la cámara sobre una casilla (usado al iniciar/seguir la animación).
  // animate=true anima el viewBox; false lo aplica instantáneo (para el drag manual).
  _centerOnTile(index, animate) {
    const pos = _tilePosition(index);
    this._camera.x = pos.x;
    this._camera.y = pos.y;
    this._applyCamera(animate);
  }

  _applyCamera(animate) {
    const vb = `${this._camera.x - 130} ${this._camera.y - 130} 260 260`;
    if (animate) {
      this._svg.style.transition = 'all 0.4s ease';
    } else {
      this._svg.style.transition = 'none';
    }
    this._svg.setAttribute('viewBox', vb);
  }

  _drawStaticTiles() {
    this._cameraGroup.innerHTML = '';
    const tiles = this.board.getActiveTiles();
    tiles.forEach((tile) => {
      const pos = _tilePosition(tile.index);
      const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      g.setAttribute('data-tile-index', tile.index);

      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      circle.setAttribute('cx', pos.x);
      circle.setAttribute('cy', pos.y);
      circle.setAttribute('r', TILE_RADIUS);
      circle.setAttribute('class', 'gboard-tile-bg');
      circle.id = `gboard-tile-bg-${tile.index}`;
      g.appendChild(circle);

      const icon = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      icon.setAttribute('x', pos.x);
      icon.setAttribute('y', pos.y - 4);
      icon.setAttribute('class', 'gboard-tile-icon');
      icon.setAttribute('fill', GACHA_TILES[tile.type] || '#6E6280');
      icon.textContent = TILE_TYPE_ICONS[tile.type] || '·';
      g.appendChild(icon);

      const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      label.setAttribute('x', pos.x);
      label.setAttribute('y', pos.y + 14);
      label.setAttribute('class', 'gboard-tile-label');
      label.textContent = tile.label;
      g.appendChild(label);

      // línea conectando con la próxima casilla, para dar sensación de circuito
      const nextPos = _tilePosition(tile.index + 1);
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', pos.x);
      line.setAttribute('y1', pos.y);
      line.setAttribute('x2', nextPos.x);
      line.setAttribute('y2', nextPos.y);
      line.setAttribute('stroke', 'rgba(157,127,232,0.15)');
      line.setAttribute('stroke-width', '2');
      this._cameraGroup.insertBefore(line, this._cameraGroup.firstChild);

      this._cameraGroup.appendChild(g);
    });
  }

  _drawToken() {
    const pos = _tilePosition(this.board.getCurrentPosition());
    const token = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    token.id = 'gboard-token';
    token.setAttribute('class', 'gboard-token gboard-token-glow');
    token.setAttribute('transform', `translate(${pos.x}, ${pos.y})`);
    token.innerHTML = `
      <circle r="9" fill="#E8C97A" stroke="#1A1428" stroke-width="1.5"/>
      <circle r="4" fill="#0B0815"/>
    `;
    this._cameraGroup.appendChild(token);
    this._tokenEl = token;
  }

  _moveTokenTo(index) {
    const pos = _tilePosition(index);
    this._tokenEl.setAttribute('transform', `translate(${pos.x}, ${pos.y})`);
  }

  _clearLandedHighlights() {
    for (let i = 0; i < BOARD_SIZE; i++) {
      const el = this._overlay.querySelector(`#gboard-tile-bg-${i}`);
      if (el) el.classList.remove('landed-comun', 'landed-raro', 'landed-epico');
    }
  }

  _highlightTile(index, rarity) {
    const el = this._overlay.querySelector(`#gboard-tile-bg-${index}`);
    if (el) el.classList.add(`landed-${rarity}`);
  }

  // Abre la vista y reproduce automáticamente `times` turnos completos.
  open({ times, getPullResult, onEachBonus, onFinished }) {
    this._overlay.classList.toggle('transformed', this.board.isTransformed());
    this._overlay.classList.add('open');
    this._drawStaticTiles();
    this._clearLandedHighlights();
    this._revealEl.innerHTML = '';
    this._summaryListEl.innerHTML = '';
    this._continueBtn.classList.remove('visible');
    this._centerOnTile(this.board.getCurrentPosition(), false);
    this._runSequence(times, getPullResult, onEachBonus, onFinished);
  }

  _close() {
    this._overlay.classList.remove('open');
  }

  async _runSequence(times, getPullResult, onEachBonus, onFinished) {
    const summary = [];
    for (let i = 1; i <= times; i++) {
      this._turnLabelEl.textContent = times > 1 ? `Tirada ${i} / ${times}` : '';
      this._progressEl.textContent = times > 1 ? `${i}/${times}` : '';

      const pullResult = getPullResult();
      const turn = this.board.playTurn(pullResult);

      await this._animateTurn(turn);

      if (turn.bonus && typeof onEachBonus === 'function') onEachBonus(turn.bonus);
      summary.push({ rarity: turn.pull.rarity, name: turn.pull.name, featured: turn.pull.featured, bonus: turn.bonus });

      // pequeña pausa entre tiradas del x10 para que se lea la revelación
      await _wait(times > 1 ? 550 : 0);
    }

    this._renderSummary(summary);
    this._continueBtn.classList.add('visible');
    if (typeof onFinished === 'function') onFinished(summary);
  }

  async _animateTurn(turn) {
    this._revealEl.innerHTML = '';
    await this._rollDie(turn.diceValue);

    // mueve la ficha paso a paso por cada casilla intermedia, cámara siguiendo
    let current = turn.from;
    for (const tile of turn.passedTiles) {
      current = tile.index;
      this._moveTokenTo(current);
      this._centerOnTile(current, true);
      await _wait(180);
    }

    this._highlightTile(turn.to, turn.pull.rarity);
    this._renderReveal(turn);
    await _wait(250);
  }

  async _rollDie(finalValue) {
    this._dieEl.classList.add('rolling');
    const spins = 6;
    for (let i = 0; i < spins; i++) {
      this._dieEl.textContent = String(1 + Math.floor(Math.random() * 6));
      await _wait(60);
    }
    this._dieEl.classList.remove('rolling');
    this._dieEl.textContent = String(finalValue);
  }

  _renderReveal(turn) {
    const color = GACHA_RARITY[turn.pull.rarity] || '#fff';
    const label = RARITY_LABELS[turn.pull.rarity] || turn.pull.rarity;
    let bonusHtml = '';
    if (turn.bonus) {
      const bonusText = turn.bonus.kind === 'gems'
        ? `+${turn.bonus.amount} deseos extra`
        : `+${turn.bonus.amount} monedas de banner`;
      bonusHtml = `<div class="gboard-reveal-bonus">${bonusText}</div>`;
    }
    this._revealEl.innerHTML = `
      <div class="gboard-reveal-rarity" style="color:${color}">${label}</div>
      <div class="gboard-reveal-name">${turn.pull.name}</div>
      ${turn.pull.featured === true ? '<div class="gboard-reveal-featured">DESTACADO</div>' : ''}
      ${bonusHtml}
    `;
  }

  _renderSummary(summary) {
    if (summary.length <= 1) return; // el reveal individual ya alcanza para x1
    this._summaryListEl.innerHTML = summary.map(item => {
      const color = GACHA_RARITY[item.rarity] || '#fff';
      const label = RARITY_LABELS[item.rarity] || item.rarity;
      return `
        <div class="gboard-summary-line">
          <span style="color:${color}">${label}</span>
          <span>${item.name}${item.featured ? ' ★' : ''}</span>
        </div>
      `;
    }).join('');
  }
}

function _wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
