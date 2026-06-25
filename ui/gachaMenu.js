// ui/gachaMenu.js
// Banner de Gacha — "Velo Umbral / Eco Astral".
// El cristal acumula grietas según el pity Épico actual (persiste entre pulls,
// no se reinicia con cada uno). Solo se rompe cuando un pull trae un Épico.

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

const PITY_EPICO_MAX = 90; // mismo valor que core/gacha.js (duplicado aquí solo para el dibujo visual)

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
    .gacha-header {
      display: flex; align-items: center; justify-content: space-between;
      padding: 14px 16px 10px;
      border-bottom: 1px solid rgba(157,127,232,0.2);
    }
    .gacha-title {
      font-family: Georgia, serif; letter-spacing: 0.15em;
      font-size: 14px; color: #9D7FE8; text-transform: uppercase;
    }
    .gacha-skip, .gacha-close {
      background: rgba(157,127,232,0.1);
      border: 1px solid rgba(157,127,232,0.35);
      color: #E8E4F0; border-radius: 8px;
      font-family: monospace; font-size: 11px;
      padding: 8px 10px; cursor: pointer;
    }
    .gacha-skip.active { background: rgba(157,127,232,0.35); color: #fff; }
    .gacha-body { flex: 1; overflow-y: auto; padding: 16px; }
    .gacha-banner {
      background: linear-gradient(180deg, #171025, #0F0A18);
      border: 1px solid rgba(232,201,122,0.3);
      border-radius: 12px;
      padding: 18px 14px;
      text-align: center;
      margin-bottom: 16px;
    }
    .gacha-banner-label {
      font-size: 10px; letter-spacing: 0.2em; color: #5C4A8A;
      text-transform: uppercase; margin-bottom: 6px;
    }
    .gacha-banner-name {
      font-family: Georgia, serif; font-size: 16px; color: #E8C97A;
    }
    .gacha-panel {
      background: rgba(255,255,255,0.03);
      border: 1px solid rgba(157,127,232,0.18);
      border-radius: 10px;
      padding: 12px; margin-bottom: 12px;
    }
    .gacha-panel-title {
      font-size: 11px; letter-spacing: 0.1em; color: #9D7FE8;
      text-transform: uppercase; margin-bottom: 10px;
    }
    .gacha-dots { display: flex; gap: 6px; margin-bottom: 8px; }
    .gacha-dot {
      width: 14px; height: 14px; border-radius: 50%;
      background: rgba(157,127,232,0.15);
      border: 1px solid rgba(157,127,232,0.3);
      transition: background 0.3s, box-shadow 0.3s;
    }
    .gacha-dot.lit {
      background: #9D7FE8;
      box-shadow: 0 0 8px rgba(157,127,232,0.8);
    }
    .gacha-bar-wrap {
      height: 6px; border-radius: 3px;
      background: rgba(232,201,122,0.12);
      overflow: hidden; margin-bottom: 6px;
    }
    .gacha-bar-fill {
      height: 100%; background: linear-gradient(90deg, #7A6030, #E8C97A);
      transition: width 0.4s ease;
    }
    .gacha-row { display: flex; justify-content: space-between; font-size: 11px; color: #B8B0C8; }
    .gacha-guarantee { color: #E8C97A; font-weight: bold; }
    .gacha-footer {
      padding: 12px 16px 18px;
      border-top: 1px solid rgba(157,127,232,0.2);
    }
    .gacha-gems-row {
      display: flex; justify-content: space-between; align-items: center;
      margin-bottom: 10px; font-size: 13px;
    }
    .gacha-gems-value { color: #E8C97A; font-weight: bold; }
    .gacha-pull-btns { display: flex; gap: 10px; }
    .gacha-pull-btn {
      flex: 1; padding: 14px 8px; border-radius: 10px;
      border: 1px solid rgba(157,127,232,0.5);
      background: rgba(157,127,232,0.12);
      color: #E8E4F0; font-family: monospace; font-size: 13px;
      cursor: pointer;
    }
    .gacha-pull-btn:active { background: rgba(157,127,232,0.3); }
    .gacha-pull-btn.disabled { opacity: 0.4; pointer-events: none; }
    .gacha-msg {
      font-size: 11px; color: #E89A9A; text-align: center;
      margin-top: 6px; min-height: 14px;
    }

    /* ---- Revelación: el cristal ---- */
    #gacha-reveal {
      position: fixed; inset: 0; z-index: 320;
      background: #050308;
      display: none;
      flex-direction: column; align-items: center; justify-content: flex-start;
      padding: 32px 16px 24px;
      overflow-y: auto;
    }
    #gacha-reveal.open { display: flex; }
    .gacha-stars {
      position: absolute; inset: 0; pointer-events: none;
      background-image:
        radial-gradient(1px 1px at 10% 20%, rgba(255,255,255,0.5), transparent),
        radial-gradient(1px 1px at 80% 15%, rgba(255,255,255,0.4), transparent),
        radial-gradient(1px 1px at 60% 70%, rgba(255,255,255,0.5), transparent),
        radial-gradient(1px 1px at 30% 85%, rgba(255,255,255,0.3), transparent),
        radial-gradient(1px 1px at 90% 60%, rgba(255,255,255,0.4), transparent),
        radial-gradient(1px 1px at 20% 50%, rgba(255,255,255,0.3), transparent);
    }
    #gacha-gem-wrap {
      position: relative; width: 220px; height: 280px;
      margin-top: 24px; flex-shrink: 0;
    }
    #gacha-gem-svg { width: 100%; height: 100%; overflow: visible; }
    .gem-glow {
      filter: drop-shadow(0 0 18px rgba(157,127,232,0.65)) drop-shadow(0 0 38px rgba(157,127,232,0.35));
    }
    #gem-rest-group {
      animation: gemPulse 2.6s ease-in-out infinite;
      transform-origin: 100px 135px;
    }
    @keyframes gemPulse {
      0%, 100% { filter: drop-shadow(0 0 14px rgba(157,127,232,0.55)) drop-shadow(0 0 30px rgba(157,127,232,0.25)); }
      50%      { filter: drop-shadow(0 0 22px rgba(157,127,232,0.8)) drop-shadow(0 0 46px rgba(157,127,232,0.4)); }
    }
    .gem-crack {
      fill: none;
      stroke: #E8E4F0;
      stroke-width: 1.4;
      stroke-linecap: round;
      stroke-dasharray: 40;
      stroke-dashoffset: 40;
      opacity: 0;
      filter: drop-shadow(0 0 4px rgba(255,255,255,0.9));
      transition: stroke-dashoffset 0.5s ease, opacity 0.15s ease;
    }
    .gem-crack.drawn {
      stroke-dashoffset: 0;
      opacity: 0.95;
    }
    .gem-crack.instant {
      transition: none !important;
    }
    .gem-fragment {
      transition: transform 0.6s cubic-bezier(0.2,0.8,0.3,1), opacity 0.6s ease 0.1s;
      transform: translate(0,0) rotate(0deg);
      opacity: 1;
    }
    /* Desplazamientos moderados — no es una explosión total */
    #gem-fragments.exploded .frag-tl { transform: translate(-13px,-7px) rotate(-9deg); }
    #gem-fragments.exploded .frag-tr { transform: translate(13px,-7px) rotate(9deg); }
    #gem-fragments.exploded .frag-l  { transform: translate(-17px,5px) rotate(-13deg); }
    #gem-fragments.exploded .frag-r  { transform: translate(17px,5px) rotate(13deg); }
    #gem-fragments.exploded .frag-bl { transform: translate(-11px,14px) rotate(-7deg); }
    #gem-fragments.exploded .frag-br { transform: translate(11px,14px) rotate(7deg); }
    .gem-core {
      transition: opacity 0.5s ease, transform 0.6s ease;
      transform-origin: 100px 150px;
    }
    #gem-fragments.exploded .gem-core { opacity: 0; transform: scale(1.25); }
    .gem-escape-crack {
      stroke: rgba(157,127,232,0.55);
      stroke-width: 1; fill: none;
      stroke-dasharray: 60; stroke-dashoffset: 60;
      opacity: 0;
    }
    #gem-fragments.exploded .gem-escape-crack {
      stroke-dashoffset: 0; opacity: 0.3;
      transition: stroke-dashoffset 0.9s ease, opacity 0.9s ease;
    }

    #gacha-result-single {
      text-align: center; margin-top: -130px;
      opacity: 0; transition: opacity 0.5s ease;
      pointer-events: none;
    }
    #gacha-result-single.show { opacity: 1; }
    .gacha-result-single-rarity {
      font-family: Georgia, serif; font-size: 20px; letter-spacing: 0.05em;
    }
    .gacha-result-single-sub {
      font-size: 11px; color: #B8B0C8; margin-top: 2px;
    }
    .gacha-result-single-name {
      font-size: 12px; color: #E8E4F0; margin-top: 8px;
    }
    .gacha-result-single-featured {
      font-size: 10px; color: #E8C97A; margin-top: 4px; letter-spacing: 0.1em;
    }

    #gacha-result-list {
      width: 100%; max-width: 320px; margin-top: 10px;
    }
    .gacha-result-line {
      display: flex; justify-content: space-between; align-items: center;
      padding: 9px 12px; border-radius: 8px; margin-bottom: 6px;
      background: rgba(255,255,255,0.04);
      font-size: 12px; opacity: 0; transform: translateY(6px);
      transition: opacity 0.3s ease, transform 0.3s ease;
    }
    .gacha-result-line.shown { opacity: 1; transform: translateY(0); }
    .gacha-result-rarity { font-family: Georgia, serif; font-weight: bold; }
    .gacha-result-featured { color: #E8C97A; font-size: 10px; margin-left: 6px; }

    #gacha-reveal-close {
      margin: 18px auto 8px; padding: 10px 22px; border-radius: 10px;
      border: 1px solid rgba(157,127,232,0.5);
      background: rgba(157,127,232,0.15);
      color: #E8E4F0; font-family: monospace; font-size: 12px;
      cursor: pointer; flex-shrink: 0;
    }
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

        <path class="gem-escape-crack" d="M100,18 C 90,-10 70,-30 50,-55"/>
        <path class="gem-escape-crack" d="M185,135 C 215,125 240,105 260,80"/>
        <path class="gem-escape-crack" d="M100,248 C 95,275 80,300 60,320"/>
        <path class="gem-escape-crack" d="M15,135 C -15,140 -45,130 -70,110"/>
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
      <div class="gacha-header">
        <div class="gacha-title">Eco Astral</div>
        <div style="display:flex; gap:8px;">
          <button class="gacha-skip" id="gacha-skip-btn">Saltar animación</button>
          <button class="gacha-close" id="gacha-close-btn">Cerrar</button>
        </div>
      </div>
      <div class="gacha-body">
        <div class="gacha-banner">
          <div class="gacha-banner-label">Velo destacado</div>
          <div class="gacha-banner-name" id="gacha-featured-epico"></div>
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
            <span id="gacha-pity-epico-text">0 / 90</span>
            <span id="gacha-guarantee-epico">no</span>
          </div>
        </div>
      </div>
      <div class="gacha-footer">
        <div class="gacha-gems-row">
          <span>Gemas</span>
          <span class="gacha-gems-value" id="gacha-gems-value">0</span>
        </div>
        <div class="gacha-pull-btns">
          <button class="gacha-pull-btn" id="gacha-pull1">Eco x1 (160)</button>
          <button class="gacha-pull-btn" id="gacha-pull10">Eco x10 (1600)</button>
        </div>
        <div class="gacha-msg" id="gacha-msg"></div>
      </div>
    `;
    document.body.appendChild(overlay);
    this._overlay = overlay;

    const reveal = document.createElement('div');
    reveal.id = 'gacha-reveal';
    reveal.innerHTML = `
      <div class="gacha-stars"></div>
      <div id="gacha-gem-wrap">${_gemSVG()}</div>
      <div id="gacha-result-single">
        <div class="gacha-result-single-rarity" id="gacha-result-single-rarity"></div>
        <div class="gacha-result-single-sub" id="gacha-result-single-sub"></div>
        <div class="gacha-result-single-name" id="gacha-result-single-name"></div>
        <div class="gacha-result-single-featured" id="gacha-result-single-featured"></div>
      </div>
      <div id="gacha-result-list"></div>
      <button id="gacha-reveal-close">Cerrar</button>
    `;
    document.body.appendChild(reveal);
    this._reveal = reveal;

    this._bindTap(overlay.querySelector('#gacha-close-btn'), () => this.close());
    this._bindTap(overlay.querySelector('#gacha-skip-btn'), () => this._toggleSkip());
    this._bindTap(overlay.querySelector('#gacha-pull1'), () => this._doPull(1));
    this._bindTap(overlay.querySelector('#gacha-pull10'), () => this._doPull(10));
    this._bindTap(reveal.querySelector('#gacha-reveal-close'), () => this._closeReveal());

    overlay.querySelector('#gacha-featured-epico').textContent = FEATURED_DISPLAY.epico;
  }

  _toggleSkip() {
    this._skipAnim = !this._skipAnim;
    this._overlay.querySelector('#gacha-skip-btn').classList.toggle('active', this._skipAnim);
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

  _refresh() {
    const g = this.gacha;
    this._overlay.querySelector('#gacha-gems-value').textContent = g.getGems();

    const dotsWrap = this._overlay.querySelector('#gacha-dots-raro');
    dotsWrap.innerHTML = '';
    const pityRaro = g.getPityRaro();
    for (let i = 0; i < 10; i++) {
      const dot = document.createElement('div');
      dot.className = 'gacha-dot' + (i < pityRaro ? ' lit' : '');
      dotsWrap.appendChild(dot);
    }
    this._overlay.querySelector('#gacha-guarantee-raro').textContent = g.isGuaranteedRaro() ? 'SÍ' : 'no';
    this._overlay.querySelector('#gacha-guarantee-raro').className = g.isGuaranteedRaro() ? 'gacha-guarantee' : '';

    const pityEpico = g.getPityEpico();
    this._overlay.querySelector('#gacha-bar-epico').style.width = `${Math.min(100, (pityEpico / PITY_EPICO_MAX) * 100)}%`;
    this._overlay.querySelector('#gacha-pity-epico-text').textContent = `${pityEpico} / ${PITY_EPICO_MAX}`;
    this._overlay.querySelector('#gacha-guarantee-epico').textContent = g.isGuaranteedEpico() ? 'SÍ' : 'no';
    this._overlay.querySelector('#gacha-guarantee-epico').className = g.isGuaranteedEpico() ? 'gacha-guarantee' : '';

    const canPull1 = g.canPull(1);
    const canPull10 = g.canPull(10);
    this._overlay.querySelector('#gacha-pull1').classList.toggle('disabled', !canPull1);
    this._overlay.querySelector('#gacha-pull10').classList.toggle('disabled', !canPull10);
  }

  _doPull(times) {
    const msg = this._overlay.querySelector('#gacha-msg');
    if (!this.gacha.canPull(times)) {
      msg.textContent = 'No tienes suficientes gemas.';
      return;
    }
    msg.textContent = '';

    const pityBefore = this.gacha.getPityEpico(); // estado del cristal ANTES de este pull
    const results = this.gacha.pull(times);
    this._refresh();
    if (!results) return;

    const hasEpico = results.some(r => r.rarity === 'epico');
    this._showReveal(results, times, pityBefore, hasEpico);
  }

  // Pone las grietas en un estado exacto, sin animación (para fijar el punto de partida).
  _setCracksInstant(count) {
    const cracks = Array.from(this._reveal.querySelectorAll('.gem-crack'));
    cracks.forEach((c, i) => {
      c.classList.add('instant');
      c.classList.toggle('drawn', i < count);
    });
    requestAnimationFrame(() => {
      cracks.forEach(c => c.classList.remove('instant'));
    });
    return cracks;
  }

  // Anima la aparición de grietas nuevas, una por una, desde "from" hasta "to".
  _animateCracksTo(cracks, from, to, baseDelay, stepDelay) {
    for (let i = from; i < to; i++) {
      setTimeout(() => cracks[i]?.classList.add('drawn'), baseDelay + (i - from) * stepDelay);
    }
    return baseDelay + Math.max(0, (to - from)) * stepDelay;
  }

  _showReveal(results, times, pityBefore, hasEpico) {
    this._reveal.classList.add('open');
    this._reveal.querySelector('#gacha-result-single').classList.remove('show');
    this._reveal.querySelector('#gacha-result-list').innerHTML = '';
    this._reveal.querySelector('#gem-fragments').classList.remove('exploded');

    const totalCracks = this._reveal.querySelectorAll('.gem-crack').length; // 8
    const beforeCount = Math.round((Math.min(pityBefore, PITY_EPICO_MAX) / PITY_EPICO_MAX) * totalCracks);

    if (this._skipAnim) {
      const targetCount = hasEpico ? totalCracks
        : Math.round((Math.min(this.gacha.getPityEpico(), PITY_EPICO_MAX) / PITY_EPICO_MAX) * totalCracks);
      this._setCracksInstant(targetCount);
      if (hasEpico) this._reveal.querySelector('#gem-fragments').classList.add('exploded');
      this._populateResults(results, times, true);
      return;
    }

    const cracks = this._setCracksInstant(beforeCount);

    if (!hasEpico) {
      const afterCount = Math.max(
        beforeCount,
        Math.round((Math.min(this.gacha.getPityEpico(), PITY_EPICO_MAX) / PITY_EPICO_MAX) * totalCracks)
      );
      const elapsed = this._animateCracksTo(cracks, beforeCount, afterCount, 300, 120);
      setTimeout(() => this._populateResults(results, times, false), elapsed + 350);
    } else {
      const elapsed = this._animateCracksTo(cracks, beforeCount, totalCracks, 300, 80);
      const breakDelay = elapsed + 450;
      setTimeout(() => {
        this._reveal.querySelector('#gem-fragments').classList.add('exploded');
      }, breakDelay);
      setTimeout(() => this._populateResults(results, times, false), breakDelay + 350);
    }
  }

  _populateResults(results, times, instant) {
    if (times === 1) {
      const item = results[0];
      const label = RARITY_LABELS[item.rarity] || item.rarity;
      const full = RARITY_FULL[item.rarity] || item.rarity;
      const color = RARITY_COLORS[item.rarity] || '#fff';

      const rEl = this._reveal.querySelector('#gacha-result-single-rarity');
      rEl.textContent = label;
      rEl.style.color = color;
      this._reveal.querySelector('#gacha-result-single-sub').textContent = `- ${full}`;
      this._reveal.querySelector('#gacha-result-single-name').textContent = item.name;
      this._reveal.querySelector('#gacha-result-single-featured').textContent =
        item.featured === true ? 'DESTACADO' : '';

      const wrap = this._reveal.querySelector('#gacha-result-single');
      if (instant) wrap.classList.add('show');
      else requestAnimationFrame(() => wrap.classList.add('show'));
    } else {
      const list = this._reveal.querySelector('#gacha-result-list');
      list.innerHTML = '';
      results.forEach((item, i) => {
        const line = document.createElement('div');
        line.className = 'gacha-result-line';
        const label = RARITY_LABELS[item.rarity] || item.rarity;
        const color = RARITY_COLORS[item.rarity] || '#fff';
        let featuredTag = '';
        if (item.featured === true) featuredTag = '<span class="gacha-result-featured">DESTACADO</span>';
        line.innerHTML = `
          <span><span class="gacha-result-rarity" style="color:${color}">${label}</span> — ${item.name}</span>
          ${featuredTag}
        `;
        list.appendChild(line);
        if (instant) {
          line.classList.add('shown');
        } else {
          setTimeout(() => line.classList.add('shown'), i * 90);
        }
      });
    }
  }

  _closeReveal() {
    this._reveal.classList.remove('open');
  }
}
