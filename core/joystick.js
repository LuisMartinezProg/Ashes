// core/joystick.js — Ashes of the Reborn | Valiant Gaming

export class VirtualJoystick {
  constructor() {
    this.active  = false;
    this.touchId = null;
    this.baseX   = 0;
    this.baseY   = 0;
    this.stickX  = 0;
    this.stickY  = 0;
    this.radius  = 70;
    this.dx      = 0;
    this.dy      = 0;
    this._createCanvas();
    this._bindEvents();
  }

  _createCanvas() {
    this.canvas = document.createElement('canvas');
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
    window.addEventListener('resize', () => this._resize());
  }

  _resize() {
    const dpr = window.devicePixelRatio || 1;
    const w   = window.innerWidth  * 0.5;
    const h   = window.innerHeight;
    this.canvas.width  = w * dpr;
    this.canvas.height = h * dpr;
    this.canvas.style.width  = w + 'px';
    this.canvas.style.height = h + 'px';
    this.radius = Math.round(Math.min(w, h) * 0.18);
    this._updateBase();
    this._draw();
  }

  _updateBase() {
    const w = this.canvas.width  / (window.devicePixelRatio || 1);
    const h = this.canvas.height / (window.devicePixelRatio || 1);
    this.baseX = this.radius + 24;
    this.baseY = h - this.radius - 24;
    if (!this.active) { this.stickX = this.baseX; this.stickY = this.baseY; }
  }

  _bindEvents() {
    // Touch
    this.canvas.addEventListener('touchstart',  this._onStart.bind(this),     { passive: false });
    this.canvas.addEventListener('touchmove',   this._onMove.bind(this),      { passive: false });
    this.canvas.addEventListener('touchend',    this._onEnd.bind(this),       { passive: false });
    this.canvas.addEventListener('touchcancel', this._onEnd.bind(this),       { passive: false });

    // Mouse (PC)
    this.canvas.addEventListener('mousedown',   this._onMouseDown.bind(this));
    window.addEventListener('mousemove',        this._onMouseMove.bind(this));
    window.addEventListener('mouseup',          this._onMouseUp.bind(this));
  }

  // ── Touch ─────────────────────────────────────────────────────────────────
_onStart(e) {
  e.preventDefault();
  if (this.active) return;
  const touch = e.changedTouches[0];
  const rect  = this.canvas.getBoundingClientRect();
  this.active  = true;
  this.touchId = touch.identifier;
  this.baseX   = touch.clientX - rect.left;
  this.baseY   = touch.clientY - rect.top;
  this.stickX  = this.baseX;
  this.stickY  = this.baseY;
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
    const clamp = Math.min(dist, this.radius);
    const angle = Math.atan2(ddy, ddx);

    this.stickX = this.baseX + Math.cos(angle) * clamp;
    this.stickY = this.baseY + Math.sin(angle) * clamp;
    this.dx = dist > 8 ? Math.cos(angle) * Math.min(dist / this.radius, 1) : 0;
    this.dy = dist > 8 ? Math.sin(angle) * Math.min(dist / this.radius, 1) : 0;
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

  // ── Mouse (PC) ────────────────────────────────────────────────────────────
_onMouseDown(e) {
  if (this.active) return;
  const rect = this.canvas.getBoundingClientRect();
  this.active  = true;
  this.touchId = 'mouse';
  this.baseX   = e.clientX - rect.left;
  this.baseY   = e.clientY - rect.top;
  this.stickX  = this.baseX;
  this.stickY  = this.baseY;
  this._draw();
}
  

  _onMouseMove(e) {
    if (!this.active || this.touchId !== 'mouse') return;
    const rect = this.canvas.getBoundingClientRect();
    const rawX = e.clientX - rect.left;
    const rawY = e.clientY - rect.top;
    const ddx  = rawX - this.baseX;
    const ddy  = rawY - this.baseY;
    const dist = Math.sqrt(ddx * ddx + ddy * ddy);
    const clamp = Math.min(dist, this.radius);
    const angle = Math.atan2(ddy, ddx);
    this.stickX = this.baseX + Math.cos(angle) * clamp;
    this.stickY = this.baseY + Math.sin(angle) * clamp;
    this.dx = dist > 8 ? Math.cos(angle) * Math.min(dist / this.radius, 1) : 0;
    this.dy = dist > 8 ? Math.sin(angle) * Math.min(dist / this.radius, 1) : 0;
    this._draw();
  }

  _onMouseUp(e) {
    if (this.touchId !== 'mouse') return;
    this.active  = false;
    this.touchId = null;
    this.dx      = 0;
    this.dy      = 0;
    this.stickX  = this.baseX;
    this.stickY  = this.baseY;
    this._draw();
  }

  // ── Draw ──────────────────────────────────────────────────────────────────

  _draw() {
    const dpr = window.devicePixelRatio || 1;
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    const bx = this.baseX * dpr;
    const by = this.baseY * dpr;
    const r  = this.radius * dpr;

    ctx.beginPath();
    ctx.arc(bx, by, r, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(255,255,255,0.22)';
    ctx.lineWidth   = 2.5 * dpr;
    ctx.stroke();
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    ctx.fill();

    this._drawArrow(ctx, bx, by + r * 0.65, Math.PI,       dpr);
    this._drawArrow(ctx, bx + r * 0.65, by, Math.PI * 0.5, dpr);
    this._drawArrow(ctx, bx - r * 0.65, by, -Math.PI * 0.5, dpr);

    const sx = this.stickX * dpr;
    const sy = this.stickY * dpr;
    const sr = this.radius * 0.38 * dpr;

    const grad = ctx.createRadialGradient(
      sx - sr * 0.3, sy - sr * 0.3, sr * 0.1, sx, sy, sr
    );
    grad.addColorStop(0, 'rgba(220,190,120,0.9)');
    grad.addColorStop(1, 'rgba(120,80,30,0.7)');

    ctx.beginPath();
    ctx.arc(sx, sy, sr, 0, Math.PI * 2);
    ctx.fillStyle = grad;
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,200,100,0.5)';
    ctx.lineWidth   = 2 * dpr;
    ctx.stroke();
  }

  _drawArrow(ctx, x, y, rotation, dpr) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rotation);
    ctx.beginPath();
    const s = 6 * dpr;
    ctx.moveTo(0, -s);
    ctx.lineTo(s * 0.7, s * 0.5);
    ctx.lineTo(-s * 0.7, s * 0.5);
    ctx.closePath();
    ctx.fillStyle = 'rgba(255,255,255,0.35)';
    ctx.fill();
    ctx.restore();
  }

  getInput() { return { dx: this.dx, dy: this.dy }; }
  destroy()  { this.canvas.remove(); }
}
