// ui/hud.js — HUD de combate básico
// Fase 2: barra de vida del enemigo + botón de ataque táctil
//
// USO:
//   import { HUD } from './ui/hud.js';
//   const hud = new HUD(combatSystem);
//   hud.attachEnemyBar(enemyInstance); // muestra barra de vida de ese enemigo
//   hud.show();

export class HUD {
  constructor(combatSystem) {
    this.combat = combatSystem;
    this._enemyBarEl  = null;
    this._fillEl      = null;
    this._hpTextEl    = null;
    this._attackBtnEl = null;
    this._container   = null;

    this._build();
    this._bindAttackButton();
  }

  // ── API pública ─────────────────────────────────────────────────────────────

  /** Vincula la barra de HP a un enemigo específico. */
  attachEnemyBar(enemy) {
    enemy.hudBar = {
      update: (hp, maxHp) => this._updateBar(hp, maxHp),
    };
    this._updateBar(enemy.hp, enemy.maxHp);
    this._showEnemyBar(true);
  }

  detachEnemyBar() {
    this._showEnemyBar(false);
  }

  show() {
    this._container.style.display = 'block';
  }

  hide() {
    this._container.style.display = 'none';
  }

  // ── Construcción del DOM ────────────────────────────────────────────────────

  _build() {
    // Contenedor raíz
    this._container = document.createElement('div');
    this._container.id = 'hud-combat';
    Object.assign(this._container.style, {
      position      : 'fixed',
      inset         : '0',
      pointerEvents : 'none',
      zIndex        : '100',
    });

    // ── Barra de vida del enemigo (centro superior) ─────────────────────────
    this._enemyBarEl = document.createElement('div');
    Object.assign(this._enemyBarEl.style, {
      position        : 'absolute',
      top             : '18px',
      left            : '50%',
      transform       : 'translateX(-50%)',
      width           : '55vw',
      maxWidth        : '320px',
      background      : 'rgba(0,0,0,0.55)',
      border          : '1px solid rgba(255,255,255,0.15)',
      borderRadius    : '6px',
      padding         : '6px 10px',
      display         : 'none',
    });

    const label = document.createElement('div');
    Object.assign(label.style, {
      color      : '#ccc',
      fontSize   : '11px',
      fontFamily : 'monospace',
      marginBottom : '4px',
      letterSpacing: '1px',
    });
    label.textContent = 'ENEMIGO';

    const barTrack = document.createElement('div');
    Object.assign(barTrack.style, {
      width        : '100%',
      height       : '10px',
      background   : '#333',
      borderRadius : '4px',
      overflow     : 'hidden',
      position     : 'relative',
    });

    this._fillEl = document.createElement('div');
    Object.assign(this._fillEl.style, {
      height          : '100%',
      width           : '100%',
      background      : 'linear-gradient(90deg, #cc2222, #ff4444)',
      borderRadius    : '4px',
      transition      : 'width 0.15s ease',
    });

    this._hpTextEl = document.createElement('div');
    Object.assign(this._hpTextEl.style, {
      color      : '#aaa',
      fontSize   : '10px',
      fontFamily : 'monospace',
      marginTop  : '3px',
      textAlign  : 'right',
    });

    barTrack.appendChild(this._fillEl);
    this._enemyBarEl.appendChild(label);
    this._enemyBarEl.appendChild(barTrack);
    this._enemyBarEl.appendChild(this._hpTextEl);

    // ── Botón de ataque (esquina inferior derecha) ──────────────────────────
    this._attackBtnEl = document.createElement('button');
    this._attackBtnEl.id = 'btn-attack';
    this._attackBtnEl.textContent = '⚔';
    Object.assign(this._attackBtnEl.style, {
      position        : 'absolute',
      bottom          : '32px',
      right           : '32px',
      width           : '72px',
      height          : '72px',
      borderRadius    : '50%',
      border          : '2px solid rgba(255,200,100,0.6)',
      background      : 'rgba(180, 60, 30, 0.75)',
      color           : '#ffe',
      fontSize        : '28px',
      lineHeight      : '72px',
      textAlign       : 'center',
      cursor          : 'pointer',
      pointerEvents   : 'all',
      userSelect      : 'none',
      WebkitUserSelect: 'none',
      boxShadow       : '0 0 16px rgba(255,100,50,0.4)',
      transition      : 'transform 0.08s, background 0.08s',
      // Asegura que no haya outline en mobile
      outline         : 'none',
      WebkitTapHighlightColor: 'transparent',
    });

    // ── Ensambla ────────────────────────────────────────────────────────────
    this._container.appendChild(this._enemyBarEl);
    this._container.appendChild(this._attackBtnEl);
    document.body.appendChild(this._container);
  }

  // ── Botón de ataque ────────────────────────────────────────────────────────

  _bindAttackButton() {
    const btn = this._attackBtnEl;

    const press = (e) => {
      e.preventDefault();
      this.combat.triggerAttack();
      this._animatePress();
    };

    btn.addEventListener('touchstart', press, { passive: false });
    btn.addEventListener('mousedown',  press);
  }

  _animatePress() {
    const btn = this._attackBtnEl;
    btn.style.transform  = 'scale(0.88)';
    btn.style.background = 'rgba(220, 80, 40, 0.9)';
    setTimeout(() => {
      btn.style.transform  = 'scale(1)';
      btn.style.background = 'rgba(180, 60, 30, 0.75)';
    }, 140);
  }

  // ── Barra de vida ──────────────────────────────────────────────────────────

  _updateBar(hp, maxHp) {
    const pct = Math.max(0, hp / maxHp) * 100;
    this._fillEl.style.width = `${pct}%`;
    this._hpTextEl.textContent = `${hp} / ${maxHp}`;

    // Color según HP restante
    if (pct > 50) {
      this._fillEl.style.background = 'linear-gradient(90deg, #cc2222, #ff4444)';
    } else if (pct > 25) {
      this._fillEl.style.background = 'linear-gradient(90deg, #cc6600, #ff9900)';
    } else {
      this._fillEl.style.background = 'linear-gradient(90deg, #882200, #cc2200)';
    }

    // Si murió, oculta la barra tras un momento
    if (hp <= 0) {
      setTimeout(() => this._showEnemyBar(false), 900);
    }
  }

  _showEnemyBar(visible) {
    this._enemyBarEl.style.display = visible ? 'block' : 'none';
  }
      }
  
