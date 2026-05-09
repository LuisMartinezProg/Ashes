/**
 * core/parry.js — Sistema de parry
 * Se desbloquea al aprobar el examen de la Academia (flag: parry_desbloqueado)
 */

export class ParrySystem {
  constructor(player) {
    this._player      = player;
    this._progression = null;
    this._active      = false;
    this._cooldown    = 0;
    this._windowTime  = 0.18;
    this._cooldownMax = 2.0;
    this._windowAccum = 0;
    this._btn = null;
    this._buildBtn();
  }

  setProgression(p) { this._progression = p; }

  update(delta) {
    if (!this._isUnlocked()) return;
    if (this._cooldown > 0) {
      this._cooldown -= delta;
      this._updateBtnCooldown();
    }
    if (this._active) {
      this._windowAccum += delta;
      if (this._windowAccum >= this._windowTime) {
        this._active      = false;
        this._windowAccum = 0;
        this._btn.style.background = 'rgba(10,8,20,0.85)';
      }
    }
  }

  activate() {
    if (!this._isUnlocked()) return;
    if (this._cooldown > 0) return;
    this._active      = true;
    this._windowAccum = 0;
    this._cooldown    = this._cooldownMax;
    this._btn.style.background = 'rgba(201,168,76,0.3)';
  }

  tryParry() {
    if (!this._isUnlocked()) return false;
    if (!this._active) return false;
    this._active      = false;
    this._windowAccum = 0;
    this._cooldown    = this._cooldownMax * 0.5;
    this._onParrySuccess();
    return true;
  }

  _onParrySuccess() {
    const flash = document.createElement('div');
    Object.assign(flash.style, {
      position: 'fixed', inset: '0',
      background: 'rgba(201,168,76,0.15)',
      zIndex: '500', pointerEvents: 'none',
      transition: 'opacity 0.3s ease',
    });
    document.body.appendChild(flash);
    requestAnimationFrame(() => {
      flash.style.opacity = '0';
      setTimeout(() => flash.remove(), 300);
    });

    const txt = document.createElement('div');
    Object.assign(txt.style, {
      position: 'fixed', top: '35%', left: '50%',
      transform: 'translateX(-50%)',
      fontFamily: "'Cinzel', serif", fontSize: '22px',
      color: '#c9a84c', letterSpacing: '6px',
      zIndex: '600', pointerEvents: 'none',
      transition: 'opacity 0.5s ease, transform 0.5s ease',
    });
    txt.textContent = 'PARRY';
    document.body.appendChild(txt);
    requestAnimationFrame(() => {
      txt.style.opacity   = '0';
      txt.style.transform = 'translateX(-50%) translateY(-20px)';
      setTimeout(() => txt.remove(), 500);
    });
  }

  _isUnlocked() {
    if (!this._progression) return false;
    return this._progression._flags?.parry_desbloqueado === true
        || this._progression.storyFlags?.parry_desbloqueado === true;
  }

  _buildBtn() {
    this._btn = document.createElement('button');
    this._btn.innerHTML = '🛡';
    Object.assign(this._btn.style, {
      position: 'fixed', bottom: '140px', right: '24px',
      width: '56px', height: '56px', borderRadius: '50%',
      border: '1px solid rgba(201,168,76,0.4)',
      background: 'rgba(10,8,20,0.85)', color: '#C9A84C',
      fontSize: '22px', cursor: 'pointer', zIndex: '150',
      display: 'none', alignItems: 'center', justifyContent: 'center',
      WebkitTapHighlightColor: 'transparent',
      transition: 'background 0.1s ease',
    });
    this._btn.addEventListener('touchstart', (e) => { e.preventDefault(); this.activate(); }, { passive: false });
    this._btn.addEventListener('click', () => this.activate());
    document.body.appendChild(this._btn);
  }

  _updateBtnCooldown() {
    const pct = Math.max(0, this._cooldown / this._cooldownMax);
    this._btn.style.opacity = 0.4 + (1 - pct) * 0.6 + '';
  }

  show() { this._btn.style.display = 'flex'; }
  hide() { this._btn.style.display = 'none'; }
}
