/**
 * core/narrative.js — Sistema de narrativa para Ashes of the Reborn
 */

const SPEAKER_COLORS = {
  protagonist : '#c9a84c',
  guardia     : '#a8c8a0',
  aelith      : '#d4a0c0',
  korrath     : '#e8a060',
  theron      : '#a0c0e8',
  aeondris    : '#c8b0ff',
  narrador    : '#9a8c7a',
  mika        : '#ffaabb',
  yuna        : '#aabbdd',
  voron       : '#bb99cc',
};

const SPEAKER_LABELS = {
  protagonist : 'Protagonista',
  guardia     : 'Guardia',
  aelith      : 'Aelith',
  korrath     : 'Korrath',
  theron      : 'Theron',
  aeondris    : 'Sor',
  narrador    : '',
  mika        : 'Mika',
  yuna        : 'Yuna',
  voron       : 'Voron',
};

const TYPEWRITER_SPEED = 40; // ms por carácter
const MIN_ADVANCE_TIME = 2500; // ms mínimo antes de poder avanzar

export class NarrativeSystem {
  constructor() {
    this._scene        = null;
    this._flags        = {};
    this._queue        = [];
    this._step         = 0;
    this._active       = false;
    this._onEndCb      = null;
    this._choiceResult = null;

    this.onPause  = null;
    this.onResume = null;

    // Typewriter
    this._typing       = false;
    this._typeTimer    = null;
    this._fullText     = '';
    this._typeIndex    = 0;

    // Tiempo mínimo para avanzar
    this._stepTime     = 0;

    this._buildUI();
    this._bindInput();
  }

  setScene(scene) { this._scene = scene; }
  setFlag(key, value) { this._flags[key] = value; }
  getFlag(key)        { return this._flags[key]; }
  getChoiceResult()   { return this._choiceResult; }

  play(steps, onEnd = null) {
    if (this._active) return;
    this._queue   = steps;
    this._step    = 0;
    this._active  = true;
    this._onEndCb = onEnd;
    this._showOverlay(true);
    if (this.onPause) this.onPause();
    this._next();
  }

  advance() {
    if (!this._active) return;
    const current = this._queue[this._step - 1];
    if (current?.type === 'choice') return;

    // Si está escribiendo — mostrar texto completo
    if (this._typing) {
      this._skipTypewriter();
      return;
    }

    // Tiempo mínimo para evitar avances accidentales
    if (Date.now() - this._stepTime < MIN_ADVANCE_TIME) return;

    this._next();
  }

  _next() {
    if (this._step >= this._queue.length) {
      this._end();
      return;
    }

    const step = this._queue[this._step++];
    this._stepTime = Date.now();

    switch (step.type) {
      case 'dialogue':
        this._showDialogue(step.speaker, step.text, step.stage);
        break;
      case 'narration':
        this._showNarration(step.text);
        break;
      case 'fade':
        this._fade(step.color || '#000', step.duration || 800, () => this._next());
        return;
      case 'wait':
        setTimeout(() => this._next(), step.ms || 1000);
        return;
      case 'title':
        this._showTitle(step.text, step.sub || '', () => this._next());
        return;
      case 'choice':
        this._showChoice(step.prompt, step.options);
        break;
      case 'action':
        if (typeof step.fn === 'function') step.fn(this);
        this._next();
        return;
      default:
        this._next();
    }
  }

  _end() {
    this._active = false;
    this._stopTypewriter();
    this._hideAll();
    this._showOverlay(false);
    if (this.onResume) this.onResume();
    if (this._onEndCb) this._onEndCb(this._choiceResult);
  }

  // ── Typewriter ───────────────────────────────────────────────────────────

  _startTypewriter(html, targetEl) {
    this._stopTypewriter();
    // Extraer texto plano para el efecto, mantener HTML al final
    this._fullText  = html;
    this._typeIndex = 0;
    this._typing    = true;
    targetEl.innerHTML = '';

    // Construir char a char — para HTML simple usamos texto plano
    const plain = html.replace(/<[^>]+>/g, '');
    this._typePlain = plain;
    this._typeEl    = targetEl;
    this._typeHtml  = html;

    this._typeTimer = setInterval(() => {
      this._typeIndex++;
      // Mostrar substring del texto plano
      targetEl.textContent = plain.substring(0, this._typeIndex);
      if (this._typeIndex >= plain.length) {
        this._stopTypewriter();
        // Restaurar HTML completo al terminar
        targetEl.innerHTML = html;
        this._hint.style.opacity = '1';
      }
    }, TYPEWRITER_SPEED);

    // Ocultar hint mientras escribe
    this._hint.style.opacity = '0.3';
  }

  _stopTypewriter() {
    if (this._typeTimer) {
      clearInterval(this._typeTimer);
      this._typeTimer = null;
    }
    this._typing = false;
  }

  _skipTypewriter() {
    this._stopTypewriter();
    if (this._typeEl) {
      this._typeEl.innerHTML = this._typeHtml;
    }
    this._hint.style.opacity = '1';
    this._stepTime = Date.now() - MIN_ADVANCE_TIME; // permitir avanzar inmediatamente
  }

  // ── Build UI ─────────────────────────────────────────────────────────────

  _buildUI() {
    this._overlay = this._el('div', {
      position     : 'fixed',
      inset        : '0',
      background   : 'rgba(0,0,0,0.55)',
      zIndex       : '800',
      display      : 'none',
      pointerEvents: 'none',
    });

    this._box = this._el('div', {
      position     : 'fixed',
      bottom       : '0',
      left         : '0',
      right        : '0',
      background   : 'linear-gradient(180deg, rgba(13,11,9,0.0) 0%, rgba(13,11,9,0.97) 18%)',
      padding      : '28px 24px 36px',
      zIndex       : '900',
      display      : 'none',
      pointerEvents: 'auto',
    });

    this._speakerEl = this._el('div', {
      fontFamily   : "'Cinzel', serif",
      fontSize     : '11px',
      letterSpacing: '3px',
      textTransform: 'uppercase',
      marginBottom : '8px',
      color        : '#c9a84c',
    });

    this._textEl = this._el('div', {
      fontFamily: "'Crimson Pro', Georgia, serif",
      fontSize  : '17px',
      lineHeight: '1.75',
      color     : '#e8dcc8',
      maxWidth  : '680px',
    });

    this._hint = this._el('div', {
      fontFamily   : "'Cinzel', serif",
      fontSize     : '9px',
      letterSpacing: '3px',
      color        : '#5a4e3a',
      marginTop    : '14px',
      textTransform: 'uppercase',
    });
    this._hint.textContent = '▼  toca para continuar';

    // Botón SKIP
    this._skipBtn = document.createElement('button');
    this._skipBtn.textContent = 'SKIP';
    Object.assign(this._skipBtn.style, {
      position     : 'fixed',
      top          : '14px',
      right        : '14px',
      zIndex       : '910',
      display      : 'none',
      background   : 'rgba(10,8,20,0.85)',
      border       : '1px solid rgba(201,168,76,0.3)',
      borderRadius : '8px',
      color        : 'rgba(201,168,76,0.7)',
      fontFamily   : "'Cinzel', serif",
      fontSize     : '10px',
      letterSpacing: '2px',
      padding      : '6px 14px',
      cursor       : 'pointer',
      pointerEvents: 'all',
      WebkitTapHighlightColor: 'transparent',
    });
    this._skipBtn.addEventListener('touchstart', (e) => {
      e.preventDefault();
      e.stopPropagation();
      this._end();
    }, { passive: false });
    this._skipBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this._end();
    });
    document.body.appendChild(this._skipBtn);

    this._choiceBox = this._el('div', {
      position     : 'fixed',
      bottom       : '0',
      left         : '0',
      right        : '0',
      background   : 'linear-gradient(180deg, rgba(13,11,9,0.0) 0%, rgba(13,11,9,0.97) 18%)',
      padding      : '24px 24px 40px',
      zIndex       : '900',
      display      : 'none',
      pointerEvents: 'auto',
    });

    this._choicePrompt  = this._el('div', {
      fontFamily   : "'Cinzel', serif",
      fontSize     : '10px',
      letterSpacing: '4px',
      color        : '#8a6f2e',
      textTransform: 'uppercase',
      marginBottom : '16px',
    });

    this._choiceOptions = this._el('div', { display: 'flex', flexDirection: 'column', gap: '10px' });

    this._fadeLayer = this._el('div', {
      position     : 'fixed',
      inset        : '0',
      zIndex       : '1000',
      opacity      : '0',
      pointerEvents: 'none',
      transition   : 'opacity 0.4s ease',
    });

    this._titleLayer = this._el('div', {
      position      : 'fixed',
      inset         : '0',
      zIndex        : '950',
      display       : 'none',
      flexDirection : 'column',
      alignItems    : 'center',
      justifyContent: 'center',
      background    : 'rgba(13,11,9,0.88)',
      pointerEvents : 'none',
    });
    this._titleText = this._el('div', {
      fontFamily   : "'Cinzel', serif",
      fontSize     : 'clamp(22px,4vw,40px)',
      fontWeight   : '600',
      color        : '#c9a84c',
      letterSpacing: '3px',
      textAlign    : 'center',
    });
    this._titleSub = this._el('div', {
      fontFamily   : "'Crimson Pro', serif",
      fontSize     : '15px',
      color        : '#9a8c7a',
      fontStyle    : 'italic',
      marginTop    : '10px',
      letterSpacing: '1px',
      textAlign    : 'center',
    });

    if (!document.getElementById('nar-styles')) {
      const s = document.createElement('style');
      s.id = 'nar-styles';
      s.textContent = `
        @keyframes nar-pulse { 0%,100%{opacity:.3} 50%{opacity:.9} }
        @keyframes nar-fadein { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }
        .nar-hint-pulse { animation: nar-pulse 2s ease-in-out infinite; }
        .nar-choice-btn {
          background: rgba(201,168,76,0.06);
          border: 1px solid rgba(201,168,76,0.18);
          border-radius: 8px;
          padding: 13px 18px;
          color: #e8dcc8;
          font-family: 'Crimson Pro', Georgia, serif;
          font-size: 17px;
          line-height: 1.5;
          text-align: left;
          cursor: pointer;
          transition: background .2s, border-color .2s;
          -webkit-tap-highlight-color: transparent;
        }
        .nar-choice-btn:active, .nar-choice-btn:hover {
          background: rgba(201,168,76,0.13);
          border-color: rgba(201,168,76,0.45);
        }
        .nar-choice-letter {
          font-family: 'Cinzel', serif;
          font-size: 11px;
          color: #c9a84c;
          margin-right: 10px;
          font-weight: 600;
        }
      `;
      document.head.appendChild(s);
    }

    this._hint.className = 'nar-hint-pulse';
    this._box.appendChild(this._speakerEl);
    this._box.appendChild(this._textEl);
    this._box.appendChild(this._hint);
    this._choiceBox.appendChild(this._choicePrompt);
    this._choiceBox.appendChild(this._choiceOptions);
    this._titleLayer.appendChild(this._titleText);
    this._titleLayer.appendChild(this._titleSub);

    document.body.appendChild(this._overlay);
    document.body.appendChild(this._box);
    document.body.appendChild(this._choiceBox);
    document.body.appendChild(this._fadeLayer);
    document.body.appendChild(this._titleLayer);
  }

  // ── Mostrar diálogo ──────────────────────────────────────────────────────

  _showDialogue(speaker, text, stage = '') {
    this._choiceBox.style.display = 'none';
    this._box.style.display = 'block';
    this._box.style.animation = 'nar-fadein .25s ease';

    const color = SPEAKER_COLORS[speaker] || '#e8dcc8';
    const label = SPEAKER_LABELS[speaker] ?? speaker;

    this._speakerEl.style.color   = color;
    this._speakerEl.textContent   = label;
    this._speakerEl.style.display = label ? 'block' : 'none';

    let html = '';
    if (stage) html += `<span style="font-style:italic;color:#9a8c7a;font-size:15px;">${stage}</span><br><br>`;
    html += text;

    this._startTypewriter(html, this._textEl);
    this._hint.style.display = 'block';
    this._skipBtn.style.display = 'block';
  }

  _showNarration(text) {
    this._choiceBox.style.display = 'none';
    this._box.style.display = 'block';
    this._speakerEl.style.display = 'none';
    const html = `<span style="font-style:italic;color:#9a8c7a;">${text}</span>`;
    this._startTypewriter(html, this._textEl);
    this._hint.style.display = 'block';
    this._skipBtn.style.display = 'block';
  }

  _showChoice(prompt, options) {
    this._box.style.display = 'none';
    this._choiceBox.style.display = 'block';
    this._skipBtn.style.display = 'none';
    this._choicePrompt.textContent = prompt || 'Decisión';
    this._choiceOptions.innerHTML = '';

    const letters = ['A', 'B', 'C', 'D'];
    options.forEach((opt, i) => {
      const btn = document.createElement('button');
      btn.className = 'nar-choice-btn';
      btn.innerHTML = `<span class="nar-choice-letter">${letters[i]}</span>${opt.label}`;
      btn.addEventListener('click', () => {
        this._choiceResult = opt.value ?? opt.label;
        if (opt.flag) this.setFlag(opt.flag.key, opt.flag.value);
        this._choiceBox.style.display = 'none';
        if (opt.then && Array.isArray(opt.then)) {
          this._queue.splice(this._step, 0, ...opt.then);
        }
        this._next();
      }, { once: true });
      this._choiceOptions.appendChild(btn);
    });
  }

  _showTitle(text, sub, cb) {
    this._titleText.textContent = text;
    this._titleSub.textContent  = sub;
    this._titleLayer.style.display = 'flex';
    this._titleLayer.style.opacity = '0';
    this._titleLayer.style.transition = 'opacity .5s ease';
    requestAnimationFrame(() => {
      this._titleLayer.style.opacity = '1';
      setTimeout(() => {
        this._titleLayer.style.opacity = '0';
        setTimeout(() => {
          this._titleLayer.style.display = 'none';
          if (cb) cb();
        }, 500);
      }, 1800);
    });
  }

  _fade(color, duration, cb) {
    this._fadeLayer.style.background = color;
    this._fadeLayer.style.transition = `opacity ${duration / 2}ms ease`;
    this._fadeLayer.style.opacity    = '1';
    setTimeout(() => {
      this._fadeLayer.style.opacity = '0';
      setTimeout(() => { if (cb) cb(); }, duration / 2);
    }, duration / 2);
  }

  _showOverlay(v) {
    this._overlay.style.display = v ? 'block' : 'none';
    this._skipBtn.style.display = v ? 'block' : 'none';
    if (!v) this._skipBtn.style.display = 'none';
  }

  _hideAll() {
    this._box.style.display        = 'none';
    this._choiceBox.style.display  = 'none';
    this._titleLayer.style.display = 'none';
    this._skipBtn.style.display    = 'none';
  }
_bindInput() {
  document.addEventListener('keydown', (e) => {
    if (e.code === 'Space' || e.code === 'Enter') this.advance();
  });

  let _lastTouch = 0;
  document.addEventListener('touchstart', (e) => {
    if (e.target.closest('.nar-choice-btn')) return;
    if (e.target === this._skipBtn) return;
    if (!this._active) return;
    const now = Date.now();
    if (now - _lastTouch < 300) return;
    _lastTouch = now;
    this.advance();
  }, { passive: true });

  document.addEventListener('click', (e) => {
    if (e.target.closest('.nar-choice-btn')) return;
    if (e.target === this._skipBtn) return;
    this.advance();
  });
}
  
  _el(tag, styles = {}) {
    const el = document.createElement(tag);
    Object.assign(el.style, styles);
    return el;
  }
      }
