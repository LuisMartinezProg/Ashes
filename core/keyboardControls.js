/**
 * keyboardControls.js — Teclado + Mouse | Ashes of the Reborn
 */

const DEFAULTS = {
  attack : 'Space',
  skill1 : 'Digit1',
  skill2 : 'Digit2',
  skill3 : 'Digit3',
  sprint : 'ShiftLeft',
  switch : 'KeyQ',
  map    : 'KeyM',
  Adelante  : 'KeyW',
  Atrás     : 'KeyS',
  Izquierda : 'KeyA',
  Derecha   : 'KeyD',
};

export class KeyboardControls {
  constructor() {
    // Cargar desde localStorage o usar defaults
    this._binds = { ...DEFAULTS };
    try {
      const saved = localStorage.getItem('ashes_keybinds');
      if (saved) Object.assign(this._binds, JSON.parse(saved));
    } catch(e) {
      console.warn('[Keybinds] Error al cargar:', e);
    }

    this._keys = {};
    this._mouseActive = false;
    this._lastX = 0;
    this._mouseDeltaX = 0;

    window.addEventListener('keydown', e => {
      this._keys[e.code] = true;
      if (e.code === this._binds['sprint']) {
        window._player?.setSprinting(true);
      }
    });

    window.addEventListener('keyup', e => {
      this._keys[e.code] = false;
      if (e.code === this._binds['sprint']) {
        window._player?.setSprinting(false);
      }
    });

    window.addEventListener('mousedown', e => {
      if (e.button === 2) { this._mouseActive = true; this._lastX = e.clientX; }
    });
    window.addEventListener('mouseup', e => {
      if (e.button === 2) { this._mouseActive = false; this._mouseDeltaX = 0; }
    });
    window.addEventListener('mousemove', e => {
      if (!this._mouseActive) return;
      this._mouseDeltaX = (e.clientX - this._lastX) * 0.005;
      this._lastX = e.clientX;
    });
    window.addEventListener('contextmenu', e => e.preventDefault());
  }

  // Usado por keybindMenu
  setBind(action, code) {
    this._binds[action] = code;
    localStorage.setItem('ashes_keybinds', JSON.stringify(this._binds));
  }

  // Usado por keybindMenu
  getBinds() {
    return { ...this._binds };
  }

  // Usado por el botón RESET
  resetDefaults() {
    this._binds = { ...DEFAULTS };
    localStorage.removeItem('ashes_keybinds');
  }

  getInput() {
    let dx = 0, dy = 0;

    if (this._keys[this._binds['Adelante']])   dy -= 1;
    if (this._keys[this._binds['Atrás']])      dy += 1;
    if (this._keys[this._binds['Izquierda']])  dx -= 1;
    if (this._keys[this._binds['Derecha']])    dx += 1;

    // Flechas como fallback siempre
    if (this._keys['ArrowUp'])    dy -= 1;
    if (this._keys['ArrowDown'])  dy += 1;
    if (this._keys['ArrowLeft'])  dx -= 1;
    if (this._keys['ArrowRight']) dx += 1;

    const len = Math.sqrt(dx * dx + dy * dy);
    if (len > 1) { dx /= len; dy /= len; }
    return { dx, dy };
  }

  getCameraRotation() {
    const delta = this._mouseDeltaX;
    this._mouseDeltaX = 0;
    return delta;
  }
}
