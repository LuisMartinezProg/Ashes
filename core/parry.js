/**
 * core/parry.js — Sistema de parry contextual
 * Ashes of the Reborn | Valiant Gaming
 */

export class ParrySystem {
  constructor(player, combat) {
    this._player       = player;
    this._combat       = combat;
    this._windowTime   = 0.5;
    this._windowAccum  = 0;
    this._active       = false;
    this._currentEnemy = null;
    this._btn          = null;

    this._buildBtn();
  }

  // ── Llamado por BaseEnemy/_updateAttack cuando _attackTimer <= 0.5 ────────
  signalAttack(enemy) {
    if (this._currentEnemy === enemy && this._active) return;
    this._currentEnemy = enemy;
    this._active       = true;
    this._windowAccum  = 0;
    this._showBtn(enemy);
  }

  // ── Llamado por el jugador al presionar el botón ──────────────────────────
  attemptParry() {
    if (!this._active || !this._currentEnemy) return false;

    this._active      = false;
    this._windowAccum = 0;
    this._hideBtn();
    this._onParrySuccess(this._currentEnemy);
    return true;
  }

  // ── También expuesto como attemptParry para compatibilidad con skillBar ───
  tryParry() { return this.attemptParry(); }

  update(delta) {
    if (!this._active) return;
    this._windowAccum += delta;

    // Mover botón con el enemigo
    if (this._currentEnemy?.mesh) {
      this._positionBtn(this._currentEnemy);
    }

    // Venana expirada — esconder botón
    if (this._windowAccum >= this._windowTime) {
      this._active       = false;
      this._windowAccum  = 0;
      this._currentEnemy = null;
      this._hideBtn();
    }
  }

  // ── Interceptar daño — llamado desde BaseEnemy antes de takeDamage ────────
  interceptDamage(enemy) {
    if (!this._active || this._currentEnemy !== enemy) return false;
    return this.attemptParry();
  }

  _onParrySuccess(enemy) {
    // Brillo dorado en pantalla
    const flash = document.createElement('div');
    Object.assign(flash.style, {
      position  : 'fixed', inset: '0',
      background: 'radial-gradient(circle at center, rgba(201,168,76,0.35), transparent 70%)',
      zIndex    : '500', pointerEvents: 'none',
      opacity   : '1', transition: 'opacity 0.35s ease',
    });
    document.body.appendChild(flash);
    requestAnimationFrame(() => {
      flash.style.opacity = '0';
      setTimeout(() => flash.remove(), 350);
    });

    // Texto PARRY
    const txt = document.createElement('div');
    Object.assign(txt.style, {
      position     : 'fixed', top: '35%', left: '50%',
      transform    : 'translateX(-50%)',
      fontFamily   : "'Cinzel', serif", fontSize: '22px',
      color        : '#C9A84C', letterSpacing: '6px',
      zIndex       : '600', pointerEvents: 'none',
      textShadow   : '0 0 16px rgba(201,168,76,0.8)',
      opacity      : '1',
      transition   : 'opacity 0.5s ease, transform 0.5s ease',
    });
    txt.textContent = 'PARRY';
    document.body.appendChild(txt);
    requestAnimationFrame(() => {
      txt.style.opacity   = '0';
      txt.style.transform = 'translateX(-50%) translateY(-24px)';
      setTimeout(() => txt.remove(), 500);
    });

    // ── Contraataque 40% ──────────────────────────────────────────────────
    const isBoss     = enemy._config?.isBoss ?? false;
    const enemyHp    = enemy.maxHp ?? 0;
    const isElite    = enemyHp >= 200; // proxy de nivel alto

    if (!isBoss && !isElite && Math.random() < 0.40) {
      this._doCounterAttack(enemy);
    }
  }

  _doCounterAttack(enemy) {
    const weapon  = window._combat?._weaponType ?? 'katana';
    const prog    = window._partyManager?.getActiveCharacter() === window._companion
      ? window._mikaProgression
      : window._prog;

    const eff     = window._partyManager?.getActiveCharacter() === window._companion
      ? (window._effectiveStatsMika ?? prog?.getStats())
      : (window._effectiveStats     ?? prog?.getStats());

    const baseAtk = prog?.getStats()?.atk ?? 10;
    const effAtk  = eff?.atk ?? baseAtk;

    // Daño de contraataque: 150% del ATK efectivo
    const dmg = Math.floor(effAtk * 1.5);

    enemy.takeDamage?.(dmg);

    // VFX contraataque
    const el = document.createElement('div');
    Object.assign(el.style, {
      position     : 'fixed', top: '42%', left: '50%',
      transform    : 'translateX(-50%)',
      fontFamily   : "'Cinzel', serif", fontSize: '16px',
      color        : weapon === 'magic' ? '#88aaff'
                   : weapon === 'bow'   ? '#88ffaa'
                   : '#ff8844',
      letterSpacing: '4px',
      zIndex       : '600', pointerEvents: 'none',
      textShadow   : '0 0 12px currentColor',
      opacity      : '1',
      transition   : 'opacity 0.5s ease, transform 0.5s ease',
    });
    el.textContent = `⚡ CONTRAATAQUE -${dmg}`;
    document.body.appendChild(el);
    requestAnimationFrame(() => {
      el.style.opacity   = '0';
      el.style.transform = 'translateX(-50%) translateY(-20px)';
      setTimeout(() => el.remove(), 500);
    });
  }

  _buildBtn() {
    this._btn = document.createElement('button');
    this._btn.textContent = '🛡️';
    Object.assign(this._btn.style, {
      position      : 'fixed',
      width         : '52px',
      height        : '52px',
      borderRadius  : '50%',
      border        : '2px solid rgba(201,168,76,0.8)',
      background    : 'rgba(10,8,20,0.88)',
      color         : '#C9A84C',
      fontSize      : '22px',
      cursor        : 'pointer',
      pointerEvents : 'all',
      display       : 'none',
      alignItems    : 'center',
      justifyContent: 'center',
      zIndex        : '200',
      WebkitTapHighlightColor: 'transparent',
      boxShadow     : '0 0 16px rgba(201,168,76,0.5)',
      transform     : 'translate(-50%, -50%)',
      transition    : 'opacity 0.15s',
    });

    const onPress = (e) => {
      e.preventDefault();
      this.attemptParry();
      this._btn.style.transform = 'translate(-50%, -50%) scale(0.88)';
      setTimeout(() => {
        this._btn.style.transform = 'translate(-50%, -50%) scale(1)';
      }, 140);
    };
    this._btn.addEventListener('touchstart', onPress, { passive: false });
    this._btn.addEventListener('click', onPress);
    document.body.appendChild(this._btn);
  }

  _showBtn(enemy) {
    this._btn.style.display = 'flex';
    this._positionBtn(enemy);

    // Pulso de aparición
    this._btn.style.opacity = '0';
    requestAnimationFrame(() => {
      this._btn.style.transition = 'opacity 0.12s';
      this._btn.style.opacity    = '1';
    });
  }

  _hideBtn() {
    this._btn.style.display = 'none';
  }

  _positionBtn(enemy) {
    if (!enemy?.mesh || !window._camera) return;
    const camera = window._camera;
    const pos = enemy.mesh.position.clone();
    pos.y += 2.5;
    pos.project(camera);
    if (pos.z > 1) { this._hideBtn(); return; }
    const x = (pos.x *  0.5 + 0.5) * window.innerWidth;
    const y = (pos.y * -0.5 + 0.5) * window.innerHeight;
    this._btn.style.left = `${x}px`;
    this._btn.style.top  = `${y}px`;
  }
}
