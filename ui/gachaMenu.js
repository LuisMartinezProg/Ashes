// ui/gachaMenu.js
// Banner de Gacha — "Velo Umbral / Eco Astral".
// Pantalla principal LIVIANA (sin tablero cargado): banners + showcase del
// personaje/arma en promoción + contadores + pity + botones de pull.
// Al tocar Pull 1x/10x se abre la vista del tablero (ui/gachaBoardView.js),
// que recién ahí monta el SVG pesado y anima la secuencia completa.
// Historial y Probabilidades viven en pantallas propias, como antes.

import { PULL_COST, PITY_EPICO_THRESHOLD, PITY_RARO_THRESHOLD } from './../core/gacha.js';
import { GachaBoard } from './../core/gachaBoard.js';
import { GachaBoardView } from './gachaBoardView.js';

const RARITY_LABELS = {
  comun: 'Polvo',
  raro: 'Eco',
  epico: 'Velo',
};

const RARITY_FULL = {
  comun: 'Común',
  raro: 'Raro',
  epico: 'Épico',
};

const RARITY_COLORS = {
  comun: '#B8AFD0',
  raro: '#9D7FE8',
  epico: '#E8C97A',
};

const FEATURED_DISPLAY = {
  raro: 'Fragmento Raro de Kael',
  epico: 'Reliquia: Alba Eterna',
};

// Placeholders de ejemplo para el panel de probabilidades (hasta tener assets reales)
const RATE_EXAMPLES = {
  epico: { name: 'Kael', sub: 'Velo — Personaje' },
  raro: { name: 'Mika', sub: 'Eco — Personaje' },
};

let _stylesInjected = false;

function _injectStyles() {
  if (_stylesInjected) return;
  _stylesInjected = true;
  const style = document.createElement('style');
  style.textContent = `
    #gacha-overlay {
      position: fixed; inset: 0; z-index: 300;
      background: #0B0815;
      display: none;
      flex-direction: column;
      font-family: monospace;
      color: #E8E4F0;
      -webkit-tap-highlight-color: transparent;
    }
    #gacha-overlay.open { display: flex; }

    .gacha-topbar {
      display: flex; align-items: center; justify-content: space-between;
      padding: 10px 12px;
      border-bottom: 1px solid rgba(157,127,232,0.2);
      flex-shrink: 0;
    }
    .gacha-title {
      font-family: Georgia, serif; letter-spacing: 0.12em;
      font-size: 13px; color: #9D7FE8; text-transform: uppercase;
    }
    .gacha-topbar-actions { display: flex; gap: 6px; }
    .gacha-topbar-actions button {
      background: rgba(157,127,232,0.1);
      border: 1px solid rgba(157,127,232,0.35);
      color: #E8E4F0; border-radius: 7px;
      font-family: monospace; font-size: 10px;
      padding: 7px 8px; cursor: pointer;
    }

    .gacha-main {
      flex: 1; display: flex; overflow: hidden;
      padding: 10px 8px;
      gap: 8px;
    }

    /* ---- Columna banners ---- */
    .gacha-col-banners {
      flex: 0 0 62px;
      display: flex; flex-direction: column; gap: 6px;
    }
    .gacha-banner-tab {
      background: rgba(255,255,255,0.03);
      border: 1px solid rgba(157,127,232,0.25);
      border-radius: 8px;
      color: #B8B0C8; font-family: monospace; font-size: 9px;
      padding: 8px 4px; line-height: 1.3;
      cursor: pointer; text-align: center;
    }
    .gacha-banner-tab.active {
      border-color: #E8C97A; color: #E8C97A;
      background: rgba(232,201,122,0.08);
    }
    .gacha-banner-tab.disabled { opacity: 0.45; pointer-events: none; }
    .gacha-banner-tab small { display: block; font-size: 8px; color: #6E6280; margin-top: 2px; }

    /* ---- Columna showcase (reemplaza la columna del cristal) ---- */
    .gacha-col-showcase {
      flex: 0 0 34%;
      display: flex; align-items: center; justify-content: center;
    }
    .gacha-showcase-main {
      background: linear-gradient(160deg, #1B1330, #100A1C);
      border: 1px solid rgba(232,201,122,0.35);
      border-radius: 12px;
      padding: 14px 10px;
      text-align: center;
      width: 100%;
    }
    .gacha-showcase-main-label {
      font-size: 9px; letter-spacing: 0.16em; color: #5C4A8A;
      text-transform: uppercase; margin-bottom: 8px;
    }
    .gacha-showcase-duo {
      display: flex; align-items: flex-end; justify-content: center;
      gap: 10px; margin-bottom: 6px;
    }
    .gacha-placeholder-box {
      display: flex; align-items: center; justify-content: center;
      border-radius: 6px; font-size: 18px;
      border: 1px solid rgba(255,255,255,0.15);
    }
    .gacha-ph-character {
      width: 64px; height: 78px;
      background: linear-gradient(160deg, rgba(232,201,122,0.18), rgba(232,201,122,0.05));
    }
    .gacha-ph-weapon {
      width: 38px; height: 52px;
      background: linear-gradient(160deg, rgba(157,127,232,0.2), rgba(157,127,232,0.05));
    }
    .gacha-showcase-main-name {
      font-family: Georgia, serif; font-size: 14px; color: #E8C97A;
    }

    /* ---- Columna info (derecha) ---- */
    .gacha-col-info {
      flex: 1; display: flex; flex-direction: column;
      overflow-y: auto; min-width: 0;
    }

    .gacha-currency-row {
      display: flex; justify-content: flex-end; align-items: center;
      gap: 10px; font-size: 11px; margin-bottom: 8px;
    }
    .gacha-currency-chip {
      display: flex; align-items: center; gap: 4px;
      background: rgba(255,255,255,0.03);
      border: 1px solid rgba(157,127,232,0.2);
      border-radius: 14px; padding: 3px 9px;
    }
    .gacha-currency-icon { font-size: 11px; }
    .gacha-currency-label { color: #6E6280; font-size: 9px; }
    .gacha-deseos-value { color: #E8C97A; font-weight: bold; }
    .gacha-banner-coin-value { color: #9D7FE8; font-weight: bold; }

    .gacha-panel {
      background: rgba(255,255,255,0.03);
      border: 1px solid rgba(157,127,232,0.18);
      border-radius: 9px;
      padding: 9px 10px; margin-bottom: 8px;
    }
    .gacha-panel-title {
      font-size: 9px; letter-spacing: 0.08em; color: #9D7FE8;
      text-transform: uppercase; margin-bottom: 7px;
    }
    .gacha-dots { display: flex; gap: 4px; margin-bottom: 6px; flex-wrap: wrap; }
    .gacha-dot {
      width: 11px; height: 11px; border-radius: 50%;
      background: rgba(157,127,232,0.15);
      border: 1px solid rgba(157,127,232,0.3);
      transition: background 0.3s, box-shadow 0.3s;
    }
    .gacha-dot.lit { background: #9D7FE8; box-shadow: 0 0 6px rgba(157,127,232,0.8); }
    .gacha-bar-wrap {
      height: 5px; border-radius: 3px;
      background: rgba(232,201,122,0.12);
      overflow: hidden; margin-bottom: 5px;
    }
    .gacha-bar-fill {
      height: 100%; background: linear-gradient(90deg, #7A6030, #E8C97A);
      transition: width 0.4s ease;
    }
    .gacha-row { display: flex; justify-content: space-between; font-size: 10px; color: #B8B0C8; }
    .gacha-row.small-top { margin-bottom: 4px; }
    .gacha-guarantee { color: #E8C97A; font-weight: bold; }

    .gacha-pull-btns { display: flex; gap: 8px; margin-top: 2px; }
    .gacha-pull-btn {
      flex: 1; padding: 11px 6px; border-radius: 9px;
      border: 1px solid rgba(157,127,232,0.5);
      background: rgba(157,127,232,0.12);
      color: #E8E4F0; font-family: monospace; font-size: 11px;
      cursor: pointer;
    }
    .gacha-pull-btn:active { background: rgba(157,127,232,0.3); }
    .gacha-pull-btn.disabled { opacity: 0.4; pointer-events: none; }
    .gacha-msg {
      font-size: 10px; color: #E89A9A; text-align: center;
      margin-top: 5px; min-height: 13px;
    }

    /* ---- Historial (pantalla aparte) ---- */
    #gacha-history {
      position: fixed; inset: 0; z-index: 330;
      background: #0B0815; display: none;
      flex-direction: column; color: #E8E4F0; font-family: monospace;
    }
    #gacha-history.open { display: flex; }
    .gacha-history-header {
      display: flex; justify-content: space-between; align-items: center;
      padding: 12px 14px; border-bottom: 1px solid rgba(157,127,232,0.2);
    }
    .gacha-history-header button {
      background: rgba(157,127,232,0.1); border: 1px solid rgba(157,127,232,0.35);
      color: #E8E4F0; border-radius: 7px; font-family: monospace;
      font-size: 11px; padding: 7px 10px; cursor: pointer;
    }
    .gacha-history-list { flex: 1; overflow-y: auto; padding: 12px 14px; }
    .gacha-history-line {
      display: flex; justify-content: space-between; align-items: center;
      padding: 8px 10px; border-radius: 7px; margin-bottom: 5px;
      background: rgba(255,255,255,0.03); font-size: 11px;
    }
    .gacha-history-rarity { font-family: Georgia, serif; font-weight: bold; }
    .gacha-history-featured { color: #E8C97A; font-size: 9px; margin-left: 5px; }
    .gacha-history-empty { color: #6E6280; text-align: center; margin-top: 30px; font-size: 11px; }

    /* ---- Probabilidades (pantalla aparte) ---- */
    #gacha-rates {
      position: fixed; inset: 0; z-index: 330;
      background: #0B0815; display: none;
      flex-direction: column; color: #E8E4F0; font-family: monospace;
    }
    #gacha-rates.open { display: flex; }
    .gacha-rates-header {
      display: flex; justify-content: space-between; align-items: center;
      padding: 12px 14px; border-bottom: 1px solid rgba(157,127,232,0.2);
    }
    .gacha-rates-header button {
      background: rgba(157,127,232,0.1); border: 1px solid rgba(157,127,232,0.35);
      color: #E8E4F0; border-radius: 7px; font-family: monospace;
      font-size: 11px; padding: 7px 10px; cursor: pointer;
    }
    .gacha-rates-body { flex: 1; overflow-y: auto; padding: 14px; }
    .gacha-rates-blurb {
      font-size: 10px; color: #B8B0C8; line-height: 1.5;
      margin-bottom: 12px;
    }
    .gacha-rates-row {
      display: flex; align-items: center; gap: 10px;
      background: rgba(255,255,255,0.03);
      border: 1px solid rgba(157,127,232,0.15);
      border-radius: 8px; padding: 8px 10px; margin-bottom: 8px;
    }
    .gacha-rates-ph {
      width: 38px; height: 46px; border-radius: 5px; flex-shrink: 0;
    }
    .gacha-rates-info { flex: 1; }
    .gacha-rates-rarity-label {
      font-family: Georgia, serif; font-size: 12px; font-weight: bold;
    }
    .gacha-rates-example { font-size: 9px; color: #6E6280; margin-top: 1px; }
    .gacha-rates-pct { font-size: 13px; font-weight: bold; }
  `;
  document.head.appendChild(style);
}

function _placeholderStyle(rarity) {
  const color = RARITY_COLORS[rarity] || '#7A63B8';
  return `background: linear-gradient(160deg, ${color}55, ${color}15); border-color: ${color}88;`;
}

export class GachaMenu {
  constructor(gacha) {
    this.gacha = gacha;
    this._history = []; // { rarity, name, featured } más reciente primero
    this._totalPulls = 0;
    this._bannerCoins = 0; // placeholder — no hay lógica real en core/gacha.js todavía

    this.board = new GachaBoard(this.gacha);
    this.boardView = new GachaBoardView(this.board);

    _injectStyles();
    this._build();
    this._refresh();
  }

  _bindTap(el, handler) {
    const fn = (e) => { e.preventDefault(); handler(e); };
    el.addEventListener('click', fn);
    el.addEventListener('touchstart', fn, { passive: false });
  }

  _build() {
    const overlay = document.createElement('div');
    overlay.id = 'gacha-overlay';
    overlay.innerHTML = `
      <div class="gacha-topbar">
        <div class="gacha-title">Eco Astral</div>
        <div class="gacha-topbar-actions">
          <button id="gacha-rates-btn">Probabilidades</button>
          <button id="gacha-history-btn">Historial</button>
          <button id="gacha-close-btn">Cerrar</button>
        </div>
      </div>
      <div class="gacha-main">
        <div class="gacha-col-banners">
          <button class="gacha-banner-tab active" id="gacha-tab-promo">Promocional</button>
          <button class="gacha-banner-tab disabled" id="gacha-tab-initial">Inicial<small>próximamente</small></button>
          <button class="gacha-banner-tab disabled" id="gacha-tab-standard">Permanente<small>próximamente</small></button>
        </div>

        <div class="gacha-col-showcase">
          <div class="gacha-showcase-main">
            <div class="gacha-showcase-main-label">Velo destacado</div>
            <div class="gacha-showcase-duo">
              <div class="gacha-placeholder-box gacha-ph-character" style="${_placeholderStyle('epico')}">★</div>
              <div class="gacha-placeholder-box gacha-ph-weapon" style="${_placeholderStyle('epico')}">⚔</div>
            </div>
            <div class="gacha-showcase-main-name">${FEATURED_DISPLAY.epico}</div>
          </div>
        </div>

        <div class="gacha-col-info">
          <div class="gacha-currency-row">
            <div class="gacha-currency-chip">
              <span class="gacha-currency-icon">🪙</span>
              <span class="gacha-currency-label">Banner</span>
              <span class="gacha-banner-coin-value" id="gacha-banner-coin-value">0</span>
            </div>
            <div class="gacha-currency-chip">
              <span class="gacha-currency-icon">✦</span>
              <span class="gacha-currency-label">Deseos</span>
              <span class="gacha-deseos-value" id="gacha-deseos-value">0</span>
            </div>
          </div>

          <div class="gacha-panel">
            <div class="gacha-row small-top">
              <span>Tiradas totales (banner)</span>
              <span id="gacha-total-pulls">0</span>
            </div>
            <div class="gacha-panel-title">Eco — garantía cada 10</div>
            <div class="gacha-dots" id="gacha-dots-raro"></div>
            <div class="gacha-row">
              <span>Garantía Eco</span>
              <span id="gacha-guarantee-raro">no</span>
            </div>
          </div>

          <div class="gacha-panel">
            <div class="gacha-panel-title">Velo — garantía cada 90</div>
            <div class="gacha-bar-wrap"><div class="gacha-bar-fill" id="gacha-bar-epico"></div></div>
            <div class="gacha-row">
              <span id="gacha-pity-epico-text">Faltan 90</span>
              <span id="gacha-guarantee-epico">no</span>
            </div>
          </div>

          <div class="gacha-pull-btns">
            <button class="gacha-pull-btn" id="gacha-pull1">Eco x1 (${PULL_COST})</button>
            <button class="gacha-pull-btn" id="gacha-pull10">Eco x10 (${PULL_COST * 10})</button>
          </div>
          <div class="gacha-msg" id="gacha-msg"></div>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);
    this._overlay = overlay;

    const history = document.createElement('div');
    history.id = 'gacha-history';
    history.innerHTML = `
      <div class="gacha-history-header">
        <div class="gacha-title">Historial</div>
        <button id="gacha-history-close-btn">Cerrar</button>
      </div>
      <div class="gacha-history-list" id="gacha-history-list"></div>
    `;
    document.body.appendChild(history);
    this._history_el = history;

    const rates = document.createElement('div');
    rates.id = 'gacha-rates';
    rates.innerHTML = `
      <div class="gacha-rates-header">
        <div class="gacha-title">Probabilidades</div>
        <button id="gacha-rates-close-btn">Cerrar</button>
      </div>
      <div class="gacha-rates-body">
        <div class="gacha-rates-blurb">
          Cada tirada tiene una probabilidad fija por rareza. El pity Eco garantiza
          al menos un Raro cada 10 tiradas. El pity Velo garantiza un Épico cada 90
          tiradas como máximo, con 50/50 a favor del personaje destacado (con
          garantía si se pierde el 50/50 dos veces seguidas). El tablero es solo
          la puesta en escena: la rareza ya está decidida antes de tirar el dado.
        </div>
        <div id="gacha-rates-list"></div>
      </div>
    `;
    document.body.appendChild(rates);
    this._rates_el = rates;

    this._bindTap(overlay.querySelector('#gacha-close-btn'), () => this.close());
    this._bindTap(overlay.querySelector('#gacha-pull1'), () => this._doPull(1));
    this._bindTap(overlay.querySelector('#gacha-pull10'), () => this._doPull(10));
    this._bindTap(overlay.querySelector('#gacha-history-btn'), () => this._openHistory());
    this._bindTap(overlay.querySelector('#gacha-rates-btn'), () => this._openRates());
    this._bindTap(overlay.querySelector('#gacha-tab-standard'), () => {
      this._showMsg('Banner permanente: próximamente.');
    });
    this._bindTap(overlay.querySelector('#gacha-tab-initial'), () => {
      this._showMsg('Banner inicial: próximamente.');
    });
    this._bindTap(history.querySelector('#gacha-history-close-btn'), () => this._closeHistory());
    this._bindTap(rates.querySelector('#gacha-rates-close-btn'), () => this._closeRates());

    this._buildRatesList();
  }

  _buildRatesList() {
    const list = this._rates_el.querySelector('#gacha-rates-list');
    const g = this.gacha;
    const rows = [
      { rarity: 'epico', pct: g.getRateEpico ? g.getRateEpico() : 0.6 },
      { rarity: 'raro', pct: g.getRateRaro ? g.getRateRaro() : 5.1 },
      { rarity: 'comun', pct: g.getRateComun ? g.getRateComun() : 94.3 },
    ];
    list.innerHTML = rows.map(r => {
      const color = RARITY_COLORS[r.rarity];
      const example = RATE_EXAMPLES[r.rarity];
      return `
        <div class="gacha-rates-row">
          <div class="gacha-rates-ph" style="${_placeholderStyle(r.rarity)}"></div>
          <div class="gacha-rates-info">
            <div class="gacha-rates-rarity-label" style="color:${color}">
              ${RARITY_FULL[r.rarity]} (${RARITY_LABELS[r.rarity]})
            </div>
            ${example ? `<div class="gacha-rates-example">Ej: ${example.name} — ${example.sub}</div>` : ''}
          </div>
          <div class="gacha-rates-pct" style="color:${color}">${r.pct}%</div>
        </div>
      `;
    }).join('');
  }

  _showMsg(text) {
    this._overlay.querySelector('#gacha-msg').textContent = text;
  }

  open() {
    this._overlay.classList.add('open');
    this._refresh();
  }

  close() {
    this._overlay.classList.remove('open');
  }

  toggle() {
    if (this._overlay.classList.contains('open')) this.close();
    else this.open();
  }

  _openHistory() {
    const list = this._history_el.querySelector('#gacha-history-list');
    list.innerHTML = '';
    if (this._history.length === 0) {
      list.innerHTML = '<div class="gacha-history-empty">Todavía no has hecho ninguna tirada.</div>';
    } else {
      this._history.forEach(item => {
        const line = document.createElement('div');
        line.className = 'gacha-history-line';
        const label = RARITY_LABELS[item.rarity] || item.rarity;
        const color = RARITY_COLORS[item.rarity] || '#fff';
        let tag = '';
        if (item.featured === true) tag = '<span class="gacha-history-featured">DESTACADO</span>';
        line.innerHTML = `
          <span><span class="gacha-history-rarity" style="color:${color}">${label}</span> — ${item.name}</span>
          ${tag}
        `;
        list.appendChild(line);
      });
    }
    this._history_el.classList.add('open');
  }

  _closeHistory() {
    this._history_el.classList.remove('open');
  }

  _openRates() {
    this._rates_el.classList.add('open');
  }

  _closeRates() {
    this._rates_el.classList.remove('open');
  }

  _refresh() {
    const g = this.gacha;
    this._overlay.querySelector('#gacha-deseos-value').textContent = g.getGems();
    this._overlay.querySelector('#gacha-banner-coin-value').textContent = this._bannerCoins;
    this._overlay.querySelector('#gacha-total-pulls').textContent = this._totalPulls;

    const dotsWrap = this._overlay.querySelector('#gacha-dots-raro');
    dotsWrap.innerHTML = '';
    const pityRaro = g.getPityRaro();
    for (let i = 0; i < PITY_RARO_THRESHOLD; i++) {
      const dot = document.createElement('div');
      dot.className = 'gacha-dot' + (i < pityRaro ? ' lit' : '');
      dotsWrap.appendChild(dot);
    }
    this._overlay.querySelector('#gacha-guarantee-raro').textContent = g.isGuaranteedRaro() ? 'SÍ' : 'no';
    this._overlay.querySelector('#gacha-guarantee-raro').className = g.isGuaranteedRaro() ? 'gacha-guarantee' : '';

    const pityEpico = g.getPityEpico();
    this._overlay.querySelector('#gacha-bar-epico').style.width = `${Math.min(100, (pityEpico / PITY_EPICO_THRESHOLD) * 100)}%`;
    this._overlay.querySelector('#gacha-pity-epico-text').textContent = `Faltan ${g.getPityEpicoRemaining()}`;
    this._overlay.querySelector('#gacha-guarantee-epico').textContent = g.isGuaranteedEpico() ? 'SÍ' : 'no';
    this._overlay.querySelector('#gacha-guarantee-epico').className = g.isGuaranteedEpico() ? 'gacha-guarantee' : '';

    this._overlay.querySelector('#gacha-pull1').classList.toggle('disabled', !g.canPull(1));
    this._overlay.querySelector('#gacha-pull10').classList.toggle('disabled', !g.canPull(10));
  }

  _doPull(times) {
    if (!this.gacha.canPull(times)) {
      this._showMsg('No tienes suficientes gemas.');
      return;
    }
    this._showMsg('');

    // Reserva/gasta las gemas correspondientes a la tanda completa de una vez,
    // igual que antes — el tablero solo anima, no vuelve a cobrar por turno.
    const results = this.gacha.pull(times);
    if (!results) return;
    let cursor = 0;

    this.boardView.open({
      times,
      getPullResult: () => results[cursor++],
      onEachBonus: (bonus) => {
        if (bonus.kind === 'gems') {
          // Bonus de casilla: se refleja en el contador de Deseos.
          // (getGems() ya lee de core/gacha.js; este bonus se guarda aparte
          // hasta que core/gacha.js exponga un método para sumarlo directo.)
          this._pendingGemBonus = (this._pendingGemBonus || 0) + bonus.amount;
        }
        if (bonus.kind === 'bannerCoin') {
          this._bannerCoins += bonus.amount;
        }
        this._refresh();
      },
      onFinished: (summary) => {
        this._totalPulls += times;
        summary.forEach(item => this._history.unshift({ rarity: item.rarity, name: item.name, featured: item.featured }));
        if (this._history.length > 200) this._history.length = 200;
        this._refresh();
      },
    });
  }
}
