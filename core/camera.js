/**
 * joystick.js — Virtual joystick táctil para móvil
 * Ashes of the Reborn | Valiant Gaming
 *
 * Devuelve un objeto { dx, dy } normalizado [-1, 1]
 * El joystick aparece donde el jugador toca la mitad izquierda de la pantalla.
 */

export class VirtualJoystick {
  constructor() {
    // Estado interno
    this.active   = false;
    this.touchId  = null;

    // Posición del "base" (donde empezó el toque)
    this.baseX = 0;
    this.baseY = 0;

    // Posición actual del pulgar
    this.stickX = 0;
    this.stickY = 0;

    // Radio máximo de desplazamiento (px)
    this.radius = 55;

    // Output normalizado
    this.dx = 0;
    this.dy = 0;

    // Canvas propio para dibujarse
    this._createCanvas();
    this._bindEvents();
  }

  // ─── DOM ────────────────────────────────────────────────────────────────────

  _createCanvas() {
    this.canvas = document.createElement('canvas');
    this.canvas.id = 'joystick-canvas';
    Object.assign(this.canvas.style, {
      position:      'fixed',
      bottom:        '0',
      left:          '0',
      width:         '50%',       // zona táctil = mitad izquierda
      height:        '100%',
      zIndex:        '100',
      pointerEvents: 'auto',
      touchAction:   'none',
    });
    // El canvas real se dimensiona en _resize
    document.body.appendChild(this.canvas);
    this.ctx = this.canvas.getContext('2d');
    this._resize();
  }

  _resize() {
    // La mitad izquierda de la pantalla
    this.canvas.width  = window.innerWidth  * 0.5 * (window.devicePixelRatio || 1);
    this.canvas.height = window.innerHeight * (window.devicePixelRatio || 1);
    this.canvas.style.width  = window.innerWidth * 0.5 + 'px';
    this.canvas.style.height = window.innerHeight + 'px';
    this._draw();
  }

  // ─── EVENTOS ────────────────────────────────────────────────────────────────

  _bindEvents() {
    this.canvas.addEventListener('touchstart',  this._onStart.bind(this),  { passive: false });
    this.canvas.addEventListener('touchmove',   this._onMove.bind(this),   { passive: false });
    this.canvas.addEventListener('touchend',    this._onEnd.bind(this),    { passive: false });
    this.canvas.addEventListener('touchcancel', this._onEnd.bind(this),    { passive: false });
    window.addEventListener('resize', this._resize.bind(this));
  }

  _onStart(e) {
    e.preventDefault();
    if (this.active) return;          // sólo un toque a la vez

    const touch = e.changedTouches[0];
    const rect  = this.canvas.getBoundingClientRect();

    this.active   = true;
    this.touchId  = touch.identifier;
    this.baseX    = touch.clientX - rect.left;
    this.baseY    = touch.clientY - rect.top;
    this.stickX   = this.baseX;
    this.stickY   = this.baseY;
    this._draw();
  }

  _onMove(e) {
    e.preventDefault();
    if (!this.active) return;

    // Busca el toque correcto por ID
    let touch = null;
    for (const t of e.changedTouches) {
      if (t.identifier === this.touchId) { touch = t; break; }
    }
    if (!touch) return;

    const rect = this.canvas.getBoundingClientRect();
    const rawX = touch.clientX - rect.left;
    const rawY = touch.clientY - rect.top;

    // Limitar al radio
    const ddx = rawX - this.baseX;
    const ddy = rawY - this.baseY;
    const dist = Math.sqrt(ddx * ddx + ddy * ddy);
    const clamped = Math.min(dist, this.radius);
    const angle   = Math.atan2(ddy, ddx);

    this.stickX = this.baseX + Math.cos(angle) * clamped;
    this.stickY = this.baseY + Math.sin(angle) * clamped;

    // Normalizar output
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
        this._draw();
        break;
      }
    }
  }

  // ─── RENDER ─────────────────────────────────────────────────────────────────

  _draw() {
    const dpr = window.devicePixelRatio || 1;
    const ctx  = this.ctx;
    const w    = this.canvas.width;
    const h    = this.canvas.height;

    ctx.clearRect(0, 0, w, h);

    if (!this.active) return;

    // Escalar para DPR
    const bx = this.baseX  * dpr;
    const by = this.baseY  * dpr;
    const sx = this.stickX * dpr;
    const sy = this.stickY * dpr;
    const r  = this.radius  * dpr;

    // Base (aro exterior)
    ctx.beginPath();
    ctx.arc(bx, by, r, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(255,255,255,0.18)';
    ctx.lineWidth   = 2 * dpr;
    ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,0.06)';
    ctx.fill();

    // Línea base → stick
    ctx.beginPath();
    ctx.moveTo(bx, by);
    ctx.lineTo(sx, sy);
    ctx.strokeStyle = 'rgba(255,255,255,0.12)';
    ctx.lineWidth   = 1.5 * dpr;
    ctx.stroke();

    // Stick (pulgar)
    const sr = 22 * dpr;
    const grad = ctx.createRadialGradient(sx - sr * 0.3, sy - sr * 0.3, sr * 0.1, sx, sy, sr);
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

  // ─── API PÚBLICA ────────────────────────────────────────────────────────────

  /** Retorna { dx, dy } normalizado, listo para mover al jugador */
  getInput() {
    return { dx: this.dx, dy: this.dy };
  }

  destroy() {
    this.canvas.remove();
  }
}
