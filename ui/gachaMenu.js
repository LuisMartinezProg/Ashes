// ui/gachaMenu.js
// Banner de Gacha — "Velo Umbral / Eco Astral".
// Layout: [Banners] [Cristal] [Gemas + Showcase + Stats + Pulls]
// El cristal vive siempre visible (no es un overlay aparte) y acumula
// grietas según el pity Épico actual. Historial en pantalla separada.

import { PULL_COST, PITY_EPICO_THRESHOLD, PITY_RARO_THRESHOLD } from './../core/gacha.js';

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
    .gacha-topbar-actions button.active { background: rgba(157,127,232,0.35); color: #fff; }

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
    .gacha-banner-tab.disabled {
      opacity: 0.45; pointer-events: none;
    }
    .gacha-banner-tab small { display: block; font-size: 8px; color: #6E6280; margin-top: 2px; }

    /* ---- Columna cristal ---- */
    .gacha-col-gem {
      flex: 0 0 34%;
      display: flex; align-items: center; justify-content: center;
      overflow: visible;
    }
    #gacha-gem-wrap {
      position: relative; width: 130px; height: 175px;
      overflow: visible;
    }
    #gacha-gem-svg { width: 100%; height: 100%; overflow: visible; }
    .gem-glow {
      filter: drop-shadow(0 0 12px rgba(157,127,232,0.6)) drop-shadow(0 0 26px rgba(157,127,232,0.3));
    }
    #gem-rest-group {
      animation: gemPulse 2.6s ease-in-out infinite;
      transform-origin: 100px 135px;
    }
    @keyframes gemPulse {
      0%, 100% { filter: drop-shadow(0 0 10px rgba(157,127,232,0.5)) drop-shadow(0 0 20px rgba(157,127,232,0.22)); }
      50%      { filter: drop-shadow(0 0 16px rgba(157,127,232,0.75)) drop-shadow(0 0 32px rgba(157,127,232,0.38)); }
    }
    .gem-crack {
      fill: none; stroke: #E8E4F0; stroke-width: 1.4; stroke-linecap: round;
      stroke-dasharray: 40; stroke-dashoffset: 40; opacity: 0;
      filter: drop-shadow(0 0 4px rgba(255,255,255,0.9));
      transition: stroke-dashoffset 0.5s ease, opacity 0.15s ease;
    }
    .gem-crack.drawn { stroke-dashoffset: 0; opacity: 0.95; }
    .gem-crack.instant { transition: none !important; }
    .gem-fragment {
      transition: transform 0.6s cubic-bezier(0.2,0.8,0.3,1), opacity 0.6s ease 0.1s;
      transform: translate(0,0) rotate(0deg); opacity: 1;
    }
    #gem-fragments.exploded .frag-tl { transform: translate(-9px,-5px) rotate(-8deg); }
    #gem-fragments.exploded .frag-tr { transform: translate(9px,-5px) rotate(8deg); }
    #gem-fragments.exploded .frag-l  { transform: translate(-12px,4px) rotate(-12deg); }
    #gem-fragments.exploded .frag-r  { transform: translate(12px,4px) rotate(12deg); }
    #gem-fragments.exploded .frag-bl { transform: translate(-8px,10px) rotate(-6deg); }
    #gem-fragments.exploded .frag-br { transform: translate(8px,10px) rotate(6deg); }
    .gem-core { transition: opacity 0.5s ease, transform 0.6s ease; transform-origin: 100px 150px; }
    #gem-fragments.exploded .gem-core { opacity: 0; transform: scale(1.2); }
    .gem-escape-crack {
      stroke: rgba(157,127,232,0.5); stroke-width: 1; fill: none;
      stroke-dasharray: 30; stroke-dashoffset: 30; opacity: 0;
    }
    #gem-fragments.exploded .gem-escape-crack {
      stroke-dashoffset: 0; opacity: 0.28;
      transition: stroke-dashoffset 0.8s ease, opacity 0.8s ease;
    }

    /* ---- Columna info (derecha) ---- */
    .gacha-col-info {
      flex: 1; display: flex; flex-direction: column;
      overflow-y: auto; min-width: 0;
    }
    .gacha-gems-row {
      display: flex; justify-content: flex-end; align-items: center;
      gap: 5px; font-size: 12px; margin-bottom: 8px;
    }
    .gacha-gems-value { color: #E8C97A; font-weight: bold; }

    .gacha-showcase {
      display: flex; justify-content: center;
      margin-bottom: 10px;
    }
    .gacha-showcase-frame {
      transform: rotate(-4deg);
      background: linear-gradient(160deg, #1B1330, #100A1C);
      border: 1px solid rgba(232,201,122,0.35);
      border-radius: 10px;
      padding: 12px 14px;
      text-align: center;
      min-width: 140px;
      transition: opacity 0.3s ease;
    }
    .gacha-showcase-label {
      font-size: 9px; letter-spacing: 0.16em; color: #5C4A8A;
      text-transform: uppercase; margin-bottom: 4px;
    }
    .gacha-showcase-name {
      font-family: Georgia, serif; font-size: 13px; color: #E8C97A;
    }
    .gacha-showcase-rarity {
      font-family: Georgia, serif; font-size: 15px; margin-top: 2px;
    }
    .gacha-showcase-featured {
      font-size: 9px; color: #E8C97A; margin-top: 4px; letter-spacing: 0.1em;
    }
    .gacha-showcase-continue {
      display: block; margin: 8px auto 0; padding: 5px 10px;
      border-radius: 6px; border: 1px solid rgba(232,201,122,0.4);
      background: rgba(232,201,122,0.1); color: #E8C97A;
      font-family: monospace; font-size: 9px; cursor: pointer;
      transform: rotate(4deg);
    }

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
  `;
  document.head.appendChild(style);
}

function _gemSVG() {
  return `
  <svg id="gacha-gem-svg" viewBox="0 0 200 270">
    <defs>
      <linearGradient id="facetA" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#7A63B8"/>
        <stop offset="100%" stop-color="#4A3C75"/>
      </linearGradient>
      <linearGradient id="facetB" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#5C4A8A"/>
        <stop offset="100%" stop-color="#332760"/>
      </linearGradient>
      <radialGradient id="coreGlow" cx="50%" cy="40%" r="60%">
        <stop offset="0%" stop-color="#EAE6FF"/>
        <stop offset="45%" stop-color="#9D7FE8"/>
        <stop offset="100%" stop-color="#5C4A8A"/>
      </radialGradient>
    </defs>

    <g id="gem-rest-group" class="gem-glow">
      <g id="gem-fragments">
        <g class="gem-fragment frag-tl">
          <polygon points="100,18 45,85 100,110" fill="url(#facetA)" stroke="#1A1428" stroke-width="1.5"/>
          <polygon points="45,85 15,135 75,150 100,110" fill="url(#facetB)" stroke="#1A1428" stroke-width="1.5"/>
        </g>
        <g class="gem-fragment frag-tr">
          <polygon points="100,18 155,85 100,110" fill="url(#facetB)" stroke="#1A1428" stroke-width="1.5"/>
          <polygon points="155,85 185,135 125,150 100,110" fill="url(#facetA)" stroke="#1A1428" stroke-width="1.5"/>
        </g>
        <g class="gem-fragment frag-l">
          <polygon points="15,135 50,195 75,150" fill="url(#facetA)" stroke="#1A1428" stroke-width="1.5"/>
        </g>
        <g class="gem-fragment frag-r">
          <polygon points="185,135 150,195 125,150" fill="url(#facetB)" stroke="#1A1428" stroke-width="1.5"/>
        </g>
        <g class="gem-fragment frag-bl">
          <polygon points="50,195 100,248 100,190 75,150" fill="url(#facetB)" stroke="#1A1428" stroke-width="1.5"/>
        </g>
        <g class="gem-fragment frag-br">
          <polygon points="150,195 100,248 100,190 125,150" fill="url(#facetA)" stroke="#1A1428" stroke-width="1.5"/>
        </g>
        <polygon class="gem-fragment gem-core" points="100,110 125,150 100,190 75,150" fill="url(#coreGlow)"/>

        <path class="gem-escape-crack" d="M100,18 C 95,0 85,-12 75,-25"/>
        <path class="gem-escape-crack" d="M185,135 C 200,130 215,118 225,105"/>
        <path class="gem-escape-crack" d="M100,248 C 97,262 90,275 80,285"/>
        <path class="gem-escape-crack" d="M15,135 C 0,138 -15,132 -28,122"/>
      </g>

      <g id="gem-cracks">
        <path class="gem-crack" d="M100,18 L100,110"/>
        <path class="gem-crack" d="M45,85 L100,110"/>
        <path class="gem-crack" d="M155,85 L100,110"/>
        <path class="gem-crack" d="M15,135 L75,150"/>
        <path class="gem-crack" d="M185,135 L125,150"/>
        <path class="gem-crack" d="M75,150 L100,190"/>
        <path class="gem-crack" d="M125,150 L100,190"/>
        <path class="gem-crack" d="M100,190 L100,248"/>
      </g>
    </g>
  </svg>`;
}

export class GachaMenu {
  constructor(gacha) {
    this.gacha = gacha;
    this._skipAnim = false;
    this._history = []; // { rarity, name, featured } más reciente primero
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
          <button id="gacha-history-btn">Historial</button>
          <button id="gacha-skip-btn">Saltar animación</button>
          <button id="gacha-close-btn">Cerrar</button>
        </div>
      </div>
      <div class="gacha-main">
        <div class="gacha-col-banners">
          <button class="gacha-banner-tab active" id="gacha-tab-promo">Promocional</button>
          <button class="gacha-banner-tab disabled" id="gacha-tab-standard">Permanente<small>próximamente</small></button>
        </div>

        <div class="gacha-col-gem">
          <div id="gacha-gem-wrap">${_gemSVG()}</div>
        </div>

        <div class="gacha-col-info">
          <div class="gacha-gems-row">
            <span>Gemas</span>
            <span class="gacha-gems-value" id="gacha-gems-value">0</span>
          </div>

          <div class="gacha-showcase">
            <div class="gacha-showcase-frame" id="gacha-showcase-frame">
              <div class="gacha-showcase-label" id="gacha-showcase-label">Velo destacado</div>
              <div class="gacha-showcase-name" id="gacha-showcase-name"></div>
            </div>
          </div>

          <div class="gacha-panel">
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

    // Cache de nodos de grietas (evita re-querySelectorAll en cada pull)
    this._gemCracks = Array.from(overlay.querySelectorAll('.gem-crack'));
    this._gemFragments = overlay.querySelector('#gem-fragments');

    this._bindTap(overlay.querySelector('#gacha-close-btn'), () => this.close());
    this._bindTap(overlay.querySelector('#gacha-skip-btn'), () => this._toggleSkip());
    this._bindTap(overlay.querySelector('#gacha-pull1'), () => this._doPull(1));
    this._bindTap(overlay.querySelector('#gacha-pull10'), () => this._doPull(10));
    this._bindTap(overlay.querySelector('#gacha-history-btn'), () => this._openHistory());
    this._bindTap(overlay.querySelector('#gacha-tab-standard'), () => {
      this._showMsg('Banner permanente: próximamente.');
    });
    this._bindTap(history.querySelector('#gacha-history-close-btn'), () => this._closeHistory());

    overlay.querySelector('#gacha-showcase-name').textContent = FEATURED_DISPLAY.epico;
  }

  _showMsg(text) {
    const msg = this._overlay.querySelector('#gacha-msg');
    msg.textContent = text;
  }

  _toggleSkip() {
    this._skipAnim = !this._skipAnim;
    this._overlay.querySelector('#gacha-skip-btn').classList.toggle('active', this._skipAnim);
  }

  open() {
    this._overlay.classList.add('open');
    this._refresh();
    this._syncGemToPity();
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

  _refresh() {
    const g = this.gacha;
    this._overlay.querySelector('#gacha-gems-value').textContent = g.getGems();

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

  // Pone las grietas en el estado exacto correspondiente al pity actual, sin animar.
  _syncGemToPity() {
    const pity = this.gacha.getPityEpico();
    const count = Math.round((Math.min(pity, PITY_EPICO_THRESHOLD) / PITY_EPICO_THRESHOLD) * this._gemCracks.length);
    this._setCracksInstant(count);
  }

  _setCracksInstant(count) {
    this._gemCracks.forEach((c, i) => {
      c.classList.add('instant');
      c.classList.toggle('drawn', i < count);
    });
    requestAnimationFrame(() => {
      this._gemCracks.forEach(c => c.classList.remove('instant'));
    });
  }

  _animateCracksTo(from, to, baseDelay, stepDelay) {
    for (let i = from; i < to; i++) {
      setTimeout(() => this._gemCracks[i]?.classList.add('drawn'), baseDelay + (i - from) * stepDelay);
    }
    return baseDelay + Math.max(0, (to - from)) * stepDelay;
  }

  _doPull(times) {
    if (!this.gacha.canPull(times)) {
      this._showMsg('No tienes suficientes gemas.');
      return;
    }
    this._showMsg('');

    const pityBefore = this.gacha.getPityEpico();
    const results = this.gacha.pull(times);
    this._refresh();
    if (!results) return;

    results.forEach(r => this._history.unshift({ rarity: r.rarity, name: r.name, featured: r.featured }));
    if (this._history.length > 200) this._history.length = 200;

    const hasEpico = results.some(r => r.rarity === 'epico');
    this._playReveal(results, times, pityBefore, hasEpico);
  }

  _playReveal(results, times, pityBefore, hasEpico) {
    this._gemFragments.classList.remove('exploded');
    const totalCracks = this._gemCracks.length;
    const beforeCount = Math.round((Math.min(pityBefore, PITY_EPICO_THRESHOLD) / PITY_EPICO_THRESHOLD) * totalCracks);

    if (this._skipAnim) {
      const targetCount = hasEpico ? totalCracks
        : Math.round((Math.min(this.gacha.getPityEpico(), PITY_EPICO_THRESHOLD) / PITY_EPICO_THRESHOLD) * totalCracks);
      this._setCracksInstant(targetCount);
      if (hasEpico) this._gemFragments.classList.add('exploded');
      this._showResultInShowcase(results, times);
      return;
    }

    this._setCracksInstant(beforeCount);

    if (!hasEpico) {
      const afterCount = Math.max(
        beforeCount,
        Math.round((Math.min(this.gacha.getPityEpico(), PITY_EPICO_THRESHOLD) / PITY_EPICO_THRESHOLD) * totalCracks)
      );
      const elapsed = this._animateCracksTo(beforeCount, afterCount, 200, 110);
      setTimeout(() => this._showResultInShowcase(results, times), elapsed + 300);
    } else {
      const elapsed = this._animateCracksTo(beforeCount, totalCracks, 200, 75);
      const breakDelay = elapsed + 400;
      setTimeout(() => this._gemFragments.classList.add('exploded'), breakDelay);
      setTimeout(() => this._showResultInShowcase(results, times), breakDelay + 300);
    }
  }

  // Reemplaza el contenido del showcase con el/los resultado(s), con botón para volver al featured.
  _showResultInShowcase(results, times) {
    const frame = this._overlay.querySelector('#gacha-showcase-frame');
    frame.innerHTML = '';

    if (times === 1) {
      const item = results[0];
      const color = RARITY_COLORS[item.rarity] || '#fff';
      frame.innerHTML = `
        <div class="gacha-showcase-label">${RARITY_FULL[item.rarity] || item.rarity}</div>
        <div class="gacha-showcase-rarity" style="color:${color}">${RARITY_LABELS[item.rarity] || item.rarity}</div>
        <div class="gacha-showcase-name">${item.name}</div>
        ${item.featured === true ? '<div class="gacha-showcase-featured">DESTACADO</div>' : ''}
        <button class="gacha-showcase-continue" id="gacha-showcase-continue">Continuar</button>
      `;
    } else {
      const rows = results.map(item => {
        const color = RARITY_COLORS[item.rarity] || '#fff';
        const tag = item.featured === true ? ' ★' : '';
        return `<div style="font-size:10px; margin-bottom:3px;">
          <span style="color:${color}; font-family:Georgia,serif;">${RARITY_LABELS[item.rarity] || item.rarity}</span>
          — ${item.name}${tag}
        </div>`;
      }).join('');
      frame.innerHTML = `
        <div class="gacha-showcase-label">Resultados x${times}</div>
        <div style="max-height:140px; overflow-y:auto; text-align:left; margin-top:6px;">${rows}</div>
        <button class="gacha-showcase-continue" id="gacha-showcase-continue">Continuar</button>
      `;
    }

    this._bindTap(frame.querySelector('#gacha-showcase-continue'), () => this._resetShowcase());
  }

  _resetShowcase() {
    const frame = this._overlay.querySelector('#gacha-showcase-frame');
    frame.innerHTML = `
      <div class="gacha-showcase-label" id="gacha-showcase-label">Velo destacado</div>
      <div class="gacha-showcase-name" id="gacha-showcase-name">${FEATURED_DISPLAY.epico}</div>
    `;
  }
}
