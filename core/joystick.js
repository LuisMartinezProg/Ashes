/**
 * joystick.js — Virtual joystick táctil para móvil
 * Ashes of the Reborn | Valiant Gaming
 */

export class VirtualJoystick {
  constructor() {
    this.active   = false;
    this.touchId  = null;
    this.baseX    = 0;
    this.baseY    = 0;
    this.stickX   = 0;
    this.stickY   = 0;
    this.radius   = 55;
    this.dx       = 0;
    this.dy       = 0;
    this._createCanvas();
    this._bindEvents();
  }

  _createCanvas() {
    this.canvas = document.createElement('canvas');
    this.canvas.id = 'joystick-canvas';
    Object.assign(this.canvas.style, {
      position     : 'fixed',
      bottom       : '0',
      left         : '0',
      width        : '50%',
      height       : '100%',
      zIndex       : '100',
      pointerEvents: 'auto',
      touchAction  : 'none',
    });
    document.body.appendChild(this.canvas);
    this.ctx = this.canvas.getContext('2d');
    this._resize();
  }

  _resize() {
    const dpr = window.devicePixelRatio || 1;
    this.canvas.width  = window.innerWidth  * 0.5 * dpr;
    this.canvas.height = window.innerHeight * dpr;
    this.canvas.style.width  = window.innerWidth * 0.5 + 'px';
    this.canvas.style.height = window.innerHeight + 'px';

    // Recalcular posición fija de la base
    this._updateBase();
    this._draw();
  }

  _updateBase() {
    // Fijo en esquina inferior izquierda
    this.baseX = 110;
    this.baseY = (this.canvas.height / (window.devicePixelRatio || 1)) - 130;
    if (!this.active) {
      this.stickX = this.baseX;
      this.stickY = this.baseY;
    }
  }

  _bindEvents() {
    this.canvas.addEventListener('touchstart',  this._onStart.bind(this),  { passive: false });
    this.canvas.addEventListener('touchmove',   this._onMove.bind(this),   { passive: false });
    this.canvas.addEventListener('touchend',    this._onEnd.bind(this),    { passive: false });
    this.canvas.addEventListener('touchcancel', this._onEnd.bind(this),    { passive: false });
    window.addEventListener('resize', this._resize.bind(this));
  }

  _onStart(e) {
    e.preventDefault();
    if (this.active) return;

    const touch = e.changedTouches[0];
    this.active  = true;
    this.touchId = touch.identifier;

    // Base FIJA — ignorar dónde tocó el jugador
    this.stickX = this.baseX;
    this.stickY = this.baseY;
    this._draw();
  }

  _onMove(e) {
    e.preventDefault();
    if (!this.active) return;

    let touch = null;
    for (const t of e.changedTouches) {
      if (t.identifier === this.touchId) { touch = t; break; }
    }
    if (!touch) return;

    const rect = this.canvas.getBoundingClientRect();
    const rawX = touch.clientX - rect.left;
    const rawY = touch.clientY - rect.top;

    const ddx  = rawX - this.baseX;
    const ddy  = rawY - this.baseY;
    const dist = Math.sqrt(ddx * ddx + ddy * ddy);
    const clamped = Math.min(dist, this.radius);
    const angle   = Math.atan2(ddy, ddx);

    this.stickX = this.baseX + Math.cos(angle) * clamped;
    this.stickY = this.baseY + Math.sin(angle) * clamped;

    this.dx = (dist > 8) ? Math.cos(angle) * Math.min(dist / this.radius, 1) : 0;
    this.dy = (dist > 8) ? Math.sin(angle) * Math.min(dist / this.radius, 1) : 0;

    this._draw();
  }

  _onEnd(e) {
    e.preventDefault();
    for (const t of e.changedTouches) {
      if (t.identifier === this.touchId) {
        this.active  = false;
        this.touchId = null;
        this.dx      = 0;
        this.dy      = 0;
        this.stickX  = this.baseX;
        this.stickY  = this.baseY;
        this._draw();
        break;
      }
    }
  }

  _draw() {
    const dpr = window.devicePixelRatio || 1;
    const ctx  = this.ctx;
    const w    = this.canvas.width;
    const h    = this.canvas.height;

    ctx.clearRect(0, 0, w, h);

    const bx = this.baseX * dpr;
    const by = this.baseY * dpr;
    const r  = this.radius * dpr;

    // Base — siempre visible
    ctx.beginPath();
    ctx.arc(bx, by, r, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(255,255,255,0.18)';
    ctx.lineWidth   = 2 * dpr;
    ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,0.06)';
    ctx.fill();

    // Stick — siempre visible (en centro cuando inactivo)
    const sx = this.stickX * dpr;
    const sy = this.stickY * dpr;

    if (this.active) {
      // Línea base → stick
      ctx.beginPath();
      ctx.moveTo(bx, by);
      ctx.lineTo(sx, sy);
      ctx.strokeStyle = 'rgba(255,255,255,0.12)';
      ctx.lineWidth   = 1.5 * dpr;
      ctx.stroke();
    }

    // Stick
    const sr   = 22 * dpr;
    const grad = ctx.createRadialGradient(
      sx - sr * 0.3, sy - sr * 0.3, sr * 0.1,
      sx, sy, sr
    );
    grad.addColorStop(0, 'rgba(255,200,100,0.85)');
    grad.addColorStop(1, 'rgba(200,100,30,0.55)');

    ctx.beginPath();
    ctx.arc(sx, sy, sr, 0, Math.PI * 2);
    ctx.fillStyle = grad;
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,200,100,0.45)';
    ctx.lineWidth   = 1.5 * dpr;
    ctx.stroke();
  }

  getInput() { return { dx: this.dx, dy: this.dy }; }
  destroy()  { this.canvas.remove(); }
      }
