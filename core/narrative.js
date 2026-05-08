/**
 * core/narrative.js — Sistema de narrativa para Ashes of the Reborn
 * Maneja: cutscenes, diálogos, decisiones, eventos de historia, flags
 *
 * USO desde game.html:
 *   import { NarrativeSystem } from './core/narrative.js';
 *   const narrative = new NarrativeSystem();
 *   narrative.setScene(scene);
 *   narrative.onPause  = () => pauseLoop();
 *   narrative.onResume = () => resumeLoop();
 *   narrative.play(SCENES.prologue, () => console.log('listo'));
 */

// ─────────────────────────────────────────────
// COLORES Y NOMBRES POR PERSONAJE
// ─────────────────────────────────────────────
const SPEAKER_COLORS = {
  protagonist : '#c9a84c',
  guardia     : '#a8c8a0',
  aelith      : '#d4a0c0',
  korrath     : '#e8a060',
  theron      : '#a0c0e8',
  aeondris    : '#c8b0ff',
  narrador    : '#9a8c7a',
};

const SPEAKER_LABELS = {
  protagonist : 'Protagonista',
  guardia     : 'Guardia',
  aelith      : 'Aelith',
  korrath     : 'Korrath',
  theron      : 'Theron',
  aeondris    : 'Sor',
  narrador    : '',
};

// ─────────────────────────────────────────────
// NARRATIVE SYSTEM
// ─────────────────────────────────────────────
export class NarrativeSystem {
  constructor() {
    this._scene        = null;
    this._flags        = {};      // flags de historia: { fusion_unlocked: true, ... }
    this._queue        = [];      // pasos de la escena actual
    this._step         = 0;
    this._active       = false;
    this._onEndCb      = null;
    this._choiceResult = null;    // resultado de la última decisión del jugador

    // Conectar desde game.html
    this.onPause  = null;   // () => {} — pausa el gameloop
    this.onResume = null;   // () => {} — reanuda el gameloop

    this._buildUI();
    this._bindInput();
  }

  // ── Conectar escena Three.js ──
  setScene(scene) { this._scene = scene; }

  // ── Leer / escribir flags ──
  setFlag(key, value) { this._flags[key] = value; }
  getFlag(key)        { return this._flags[key]; }

  // ── Último resultado de elección ──
  getChoiceResult()   { return this._choiceResult; }

  // ─────────────────────────────────────────────
  // REPRODUCIR UNA SECUENCIA
  // @param steps  Array de pasos (ver formato abajo)
  // @param onEnd  Callback opcional al terminar
  // ─────────────────────────────────────────────
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

  // ── Avanzar manualmente (botón o tap) ──
  advance() {
    if (!this._active) return;
    const current = this._queue[this._step - 1];
    // No avanzar si hay una elección esperando respuesta
    if (current && current.type === 'choice') return;
    this._next();
  }

  // ─────────────────────────────────────────────
  // PASO SIGUIENTE
  // ─────────────────────────────────────────────
  _next() {
    if (this._step >= this._queue.length) {
      this._end();
      return;
    }

    const step = this._queue[this._step++];

    switch (step.type) {

      // Diálogo normal
      case 'dialogue':
        this._showDialogue(step.speaker, step.text, step.stage);
        break;

      // Narración (sin personaje)
      case 'narration':
        this._showNarration(step.text);
        break;

      // Fundido a negro / blanco
      case 'fade':
        this._fade(step.color || '#000', step.duration || 800, () => this._next());
        return; // no espera input

      // Pausa automática (milisegundos)
      case 'wait':
        setTimeout(() => this._next(), step.ms || 1000);
        return;

      // Texto centrado tipo título de escena
      case 'title':
        this._showTitle(step.text, step.sub || '', () => this._next());
        return;

      // Elección del jugador
      case 'choice':
        this._showChoice(step.prompt, step.options);
        break;

      // Ejecutar función arbitraria (ej: desbloquear fusión)
      case 'action':
        if (typeof step.fn === 'function') step.fn(this);
        this._next();
        return;

      default:
        this._next();
    }
  }

  // ─────────────────────────────────────────────
  // FIN DE SECUENCIA
  // ─────────────────────────────────────────────
  _end() {
    this._active = false;
    this._hideAll();
    this._showOverlay(false);
    if (this.onResume) this.onResume();
    if (this._onEndCb) this._onEndCb(this._choiceResult);
  }

  // ─────────────────────────────────────────────
  // UI — CONSTRUCCIÓN
  // ─────────────────────────────────────────────
  _buildUI() {
    // Overlay oscuro de fondo
    this._overlay = this._el('div', {
      position   : 'fixed',
      inset      : '0',
      background : 'rgba(0,0,0,0.55)',
      zIndex     : '800',
      display    : 'none',
      pointerEvents: 'none',
    });

    // Caja de diálogo (abajo)
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

    // Nombre del personaje
    this._speakerEl = this._el('div', {
      fontFamily   : "'Cinzel', serif",
      fontSize     : '11px',
      letterSpacing: '3px',
      textTransform: 'uppercase',
      marginBottom : '8px',
      color        : '#c9a84c',
    });

    // Texto del diálogo
    this._textEl = this._el('div', {
      fontFamily  : "'Crimson Pro', Georgia, serif",
      fontSize    : '17px',
      lineHeight  : '1.75',
      color       : '#e8dcc8',
      maxWidth    : '680px',
    });

    // Indicador "toca para continuar"
    this._hint = this._el('div', {
      fontFamily   : "'Cinzel', serif",
      fontSize     : '9px',
      letterSpacing: '3px',
      color        : '#5a4e3a',
      marginTop    : '14px',
      textTransform: 'uppercase',
      animation    : 'nar-pulse 2s ease-in-out infinite',
    });
    this._hint.textContent = '▼  toca para continuar';

    // Caja de elección
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

    // Título de la elección
    this._choicePrompt = this._el('div', {
      fontFamily   : "'Cinzel', serif",
      fontSize     : '10px',
      letterSpacing: '4px',
      color        : '#8a6f2e',
      textTransform: 'uppercase',
      marginBottom : '16px',
    });

    // Contenedor de botones
    this._choiceOptions = this._el('div', { display: 'flex', flexDirection: 'column', gap: '10px' });

    // Capa de fundido
    this._fadeLayer = this._el('div', {
      position   : 'fixed',
      inset      : '0',
      zIndex     : '1000',
      opacity    : '0',
      pointerEvents: 'none',
      transition : 'opacity 0.4s ease',
    });

    // Título de escena
    this._titleLayer = this._el('div', {
      position       : 'fixed',
      inset          : '0',
      zIndex         : '950',
      display        : 'none',
      flexDirection  : 'column',
      alignItems     : 'center',
      justifyContent : 'center',
      background     : 'rgba(13,11,9,0.88)',
      pointerEvents  : 'none',
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

    // Inyectar keyframes de animación
    if (!document.getElementById('nar-styles')) {
      const s = document.createElement('style');
      s.id = 'nar-styles';
      s.textContent = `
        @keyframes nar-pulse { 0%,100%{opacity:.3} 50%{opacity:.9} }
        @keyframes nar-fadein { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }
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

    // Ensamblar
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

  // ─────────────────────────────────────────────
  // UI — MOSTRAR DIÁLOGO
  // ─────────────────────────────────────────────
  _showDialogue(speaker, text, stage = '') {
    this._choiceBox.style.display = 'none';
    this._box.style.display = 'block';
    this._box.style.animation = 'nar-fadein .25s ease';

    const color = SPEAKER_COLORS[speaker] || '#e8dcc8';
    const label = SPEAKER_LABELS[speaker] ?? speaker;

    this._speakerEl.style.color = color;
    this._speakerEl.textContent = label;
    this._speakerEl.style.display = label ? 'block' : 'none';

    // stage direction en itálica + gris, resto normal
    let html = '';
    if (stage) html += `<span style="font-style:italic;color:#9a8c7a;font-size:15px;">${stage}</span><br><br>`;
    html += text;
    this._textEl.innerHTML = html;
    this._hint.style.display = 'block';
  }

  // ─────────────────────────────────────────────
  // UI — NARRACIÓN
  // ─────────────────────────────────────────────
  _showNarration(text) {
    this._choiceBox.style.display = 'none';
    this._box.style.display = 'block';
    this._speakerEl.style.display = 'none';
    this._textEl.innerHTML = `<span style="font-style:italic;color:#9a8c7a;">${text}</span>`;
    this._hint.style.display = 'block';
  }

  // ─────────────────────────────────────────────
  // UI — ELECCIÓN
  // ─────────────────────────────────────────────
  _showChoice(prompt, options) {
    this._box.style.display = 'none';
    this._choiceBox.style.display = 'block';
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
        // Ejecutar rama específica o continuar
        if (opt.then && Array.isArray(opt.then)) {
          // Insertar pasos extra después del punto actual
          this._queue.splice(this._step, 0, ...opt.then);
        }
        this._next();
      }, { once: true });
      this._choiceOptions.appendChild(btn);
    });
  }

  // ─────────────────────────────────────────────
  // UI — TÍTULO DE ESCENA
  // ─────────────────────────────────────────────
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

  // ─────────────────────────────────────────────
  // UI — FUNDIDO
  // ─────────────────────────────────────────────
  _fade(color, duration, cb) {
    this._fadeLayer.style.background  = color;
    this._fadeLayer.style.transition  = `opacity ${duration / 2}ms ease`;
    this._fadeLayer.style.opacity     = '1';
    setTimeout(() => {
      this._fadeLayer.style.opacity = '0';
      setTimeout(() => { if (cb) cb(); }, duration / 2);
    }, duration / 2);
  }

  // ─────────────────────────────────────────────
  // UI — OVERLAY y OCULTAR TODO
  // ─────────────────────────────────────────────
  _showOverlay(v) {
    this._overlay.style.display = v ? 'block' : 'none';
  }

  _hideAll() {
    this._box.style.display       = 'none';
    this._choiceBox.style.display = 'none';
    this._titleLayer.style.display = 'none';
  }

  // ─────────────────────────────────────────────
  // INPUT — teclado (espacio/enter) + tap
  // ─────────────────────────────────────────────
  _bindInput() {
    document.addEventListener('keydown', (e) => {
      if (e.code === 'Space' || e.code === 'Enter') this.advance();
    });
    document.addEventListener('touchend', (e) => {
      // Solo avanzar si el tap no fue sobre un botón de elección
      if (e.target.closest('.nar-choice-btn')) return;
      this.advance();
    }, { passive: true });
    document.addEventListener('click', (e) => {
      if (e.target.closest('.nar-choice-btn')) return;
      this.advance();
    });
  }

  // ─────────────────────────────────────────────
  // HELPER — crear elemento con estilos inline
  // ─────────────────────────────────────────────
  _el(tag, styles = {}) {
    const el = document.createElement(tag);
    Object.assign(el.style, styles);
    return el;
  }
      }
