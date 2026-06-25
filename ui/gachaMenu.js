// ui/gachaMenu.js
// Banner de Gacha — estética "Velo Umbral / Eco Astral".
// Revelación tipo grieta de luz, sin cartas que se voltean.
// Las rarezas internas (comun/raro/epico) no cambian; aquí solo se renombran para mostrar.

const RARITY_LABELS = {
  comun: 'Polvo',
  raro: 'Eco',
  epico: 'Velo',
};

const RARITY_COLORS = {
  comun: '#9C95AE',
  raro: '#9D7FE8',
  epico: '#E8C97A',
};

// Placeholder de nombres del featured actual. Si cambias el POOL en core/gacha.js,
// actualiza esto también (por ahora son dos fuentes separadas, a propósito, hasta que se decida el diseño final).
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

    /* ---- Revelación: grieta de luz ---- */
    #gacha-reveal {
      position: fixed; inset: 0; z-index: 320;
      background: rgba(5,3,8,0.96);
      display: none;
      flex-direction: column; align-items: center; justify-content: center;
      padding: 24px 16px;
    }
    #gacha-reveal.open { display: flex; }
    .gacha-crack {
      height: 3px; width: 4px;
      background: #E8E4F0;
      box-shadow: 0 0 16px 4px rgba(157,127,232,0.9), 0 0 40px 10px rgba(157,127,232,0.4);
      transition: width 0.35s ease;
      margin-bottom: 18px;
    }
    .gacha-crack.expand { width: 86vw; max-width: 360px; }
    #gacha-reveal-content {
      width: 86vw; max-width: 360px;
      max-height: 0; overflow-y: auto;
      opacity: 0;
      transition: max-height 0.4s ease, opacity 0.4s ease;
    }
    #gacha-reveal-content.show { max-height: 60vh; opacity: 1; }
    .gacha-result-line {
      display: flex; justify-content: space-between; align-items: center;
      padding: 10px 12px; border-radius: 8px; margin-bottom: 6px;
      background: rgba(255,255,255,0.04);
      font-size: 12px; opacity: 0; transform: translateY(6px);
      transition: opacity 0.3s ease, transform 0.3s ease;
    }
    .gacha-result-line.shown { opacity: 1; transform: translateY(0); }
    .gacha-result-rarity { font-family: Georgia, serif; font-weight: bold; }
    .gacha-result-featured { color: #E8C97A; font-size: 10px; margin-left: 6px; }
    #gacha-reveal-close {
      margin-top: 16px; padding: 10px 22px; border-radius: 10px;
      border: 1px solid rgba(157,127,232,0.5);
      background: rgba(157,127,232,0.15);
      color: #E8E4F0; font-family: monospace; font-size: 12px;
      cursor: pointer;
    }
  `;
  document.head.appendChild(style);
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
      <div class="gacha-crack" id="gacha-crack"></div>
      <div id="gacha-reveal-content"></div>
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
    this._overlay.querySelector('#gacha-bar-epico').style.width = `${Math.min(100, (pityEpico / 90) * 100)}%`;
    this._overlay.querySelector('#gacha-pity-epico-text').textContent = `${pityEpico} / 90`;
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
    const results = this.gacha.pull(times);
    this._refresh();
    if (results) this._showReveal(results);
  }

  _showReveal(results) {
    const content = this._reveal.querySelector('#gacha-reveal-content');
    const crack = this._reveal.querySelector('#gacha-crack');
    content.innerHTML = '';
    content.classList.remove('show');
    crack.classList.remove('expand');

    results.forEach(item => {
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
      content.appendChild(line);
    });

    this._reveal.classList.add('open');

    if (this._skipAnim) {
      crack.classList.add('expand');
      content.classList.add('show');
      content.querySelectorAll('.gacha-result-line').forEach(l => l.classList.add('shown'));
      return;
    }

    requestAnimationFrame(() => {
      crack.classList.add('expand');
      setTimeout(() => {
        content.classList.add('show');
        const lines = content.querySelectorAll('.gacha-result-line');
        lines.forEach((l, i) => {
          setTimeout(() => l.classList.add('shown'), i * 90);
        });
      }, 380);
    });
  }

  _closeReveal() {
    this._reveal.classList.remove('open');
  }
}
