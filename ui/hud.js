// ui/hud.js — HUD de combate
// Fase 3: barra de vida enemigo + botón ataque + botón habilidad + barra energía
//
// USO:
//   const hud = new HUD(combatSystem, skillSystem);
//   hud.attachEnemyBar(enemy);
//   hud.show();

export class HUD {
  constructor(combatSystem, skillSystem = null) {
    this.combat = combatSystem;
    this.skills = skillSystem;

    this._enemyBarEl  = null;
    this._fillEl      = null;
    this._hpTextEl    = null;
    this._attackBtnEl = null;
    this._skillBtnEl  = null;
    this._skillCoolEl = null; // overlay de cooldown en el botón
    this._energyFill  = null;
    this._container   = null;

    this._build();
    this._bindButtons();

    // Conecta callbacks del skillSystem si existe
    if (this.skills) {
      this.skills.onEnergyUpdate = (e, max) => this._updateEnergy(e, max);
      this.skills.onSkillCooldown = (name, progress) => {
        if (name === 'fireball') this._updateSkillCooldown(progress);
      };
    }
  }

  // ── API pública ─────────────────────────────────────────────────────────────

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

  show() { this._container.style.display = 'block'; }
  hide() { this._container.style.display = 'none'; }

  // ── Construcción del DOM ────────────────────────────────────────────────────

  _build() {
    this._container = document.createElement('div');
    this._container.id = 'hud-combat';
    Object.assign(this._container.style, {
      position      : 'fixed',
      inset         : '0',
      pointerEvents : 'none',
      zIndex        : '100',
    });

    this._buildEnemyBar();
    this._buildEnergyBar();
    this._buildAttackButton();
    if (this.skills) this._buildSkillButton();

    document.body.appendChild(this._container);
  }

  // ── Barra de vida del enemigo ───────────────────────────────────────────────

  _buildEnemyBar() {
    this._enemyBarEl = document.createElement('div');
    Object.assign(this._enemyBarEl.style, {
      position     : 'absolute',
      top          : '18px',
      left         : '50%',
      transform    : 'translateX(-50%)',
      width        : '55vw',
      maxWidth     : '320px',
      background   : 'rgba(0,0,0,0.55)',
      border       : '1px solid rgba(255,255,255,0.15)',
      borderRadius : '6px',
      padding      : '6px 10px',
      display      : 'none',
    });

    const label = document.createElement('div');
    Object.assign(label.style, {
      color        : '#ccc',
      fontSize     : '11px',
      fontFamily   : 'monospace',
      marginBottom : '4px',
      letterSpacing: '1px',
    });
    label.textContent = 'ENEMIGO';

    const track = document.createElement('div');
    Object.assign(track.style, {
      width        : '100%',
      height       : '10px',
      background   : '#333',
      borderRadius : '4px',
      overflow     : 'hidden',
    });

    this._fillEl = document.createElement('div');
    Object.assign(this._fillEl.style, {
      height     : '100%',
      width      : '100%',
      background : 'linear-gradient(90deg, #cc2222, #ff4444)',
      borderRadius: '4px',
      transition : 'width 0.15s ease',
    });

    this._hpTextEl = document.createElement('div');
    Object.assign(this._hpTextEl.style, {
      color      : '#aaa',
      fontSize   : '10px',
      fontFamily : 'monospace',
      marginTop  : '3px',
      textAlign  : 'right',
    });

    track.appendChild(this._fillEl);
    this._enemyBarEl.appendChild(label);
    this._enemyBarEl.appendChild(track);
    this._enemyBarEl.appendChild(this._hpTextEl);
    this._container.appendChild(this._enemyBarEl);
  }

  // ── Barra de energía mágica (esquina inferior izquierda) ────────────────────

  _buildEnergyBar() {
    const wrap = document.createElement('div');
    Object.assign(wrap.style, {
      position     : 'absolute',
      bottom       : '32px',
      left         : '50%',
      transform    : 'translateX(-50%)',
      width        : '40vw',
      maxWidth     : '220px',
      background   : 'rgba(0,0,0,0.45)',
      border       : '1px solid rgba(100,150,255,0.2)',
      borderRadius : '4px',
      padding      : '4px 8px',
    });

    const label = document.createElement('div');
    Object.assign(label.style, {
      color        : 'rgba(150,180,255,0.7)',
      fontSize     : '9px',
      fontFamily   : 'monospace',
      marginBottom : '3px',
      letterSpacing: '1px',
    });
    label.textContent = 'ENERGÍA';

    const track = document.createElement('div');
    Object.assign(track.style, {
      width        : '100%',
      height       : '6px',
      background   : '#1a1a2e',
      borderRadius : '3px',
      overflow     : 'hidden',
    });

    this._energyFill = document.createElement('div');
    Object.assign(this._energyFill.style, {
      height     : '100%',
      width      : '100%',
      background : 'linear-gradient(90deg, #2244cc, #66aaff)',
      borderRadius: '3px',
      transition : 'width 0.1s ease',
    });

    track.appendChild(this._energyFill);
    wrap.appendChild(label);
    wrap.appendChild(track);
    this._container.appendChild(wrap);
  }

  // ── Botón de ataque ─────────────────────────────────────────────────────────

  _buildAttackButton() {
    this._attackBtnEl = document.createElement('button');
    this._attackBtnEl.textContent = '⚔';
    Object.assign(this._attackBtnEl.style, {
      position        : 'absolute',
      bottom          : '32px',
      right           : '32px',
      width           : '72px',
      height          : '72px',
      borderRadius    : '50%',
      border          : '2px solid rgba(255,200,100,0.6)',
      background      : 'rgba(180,60,30,0.75)',
      color           : '#ffe',
      fontSize        : '28px',
      lineHeight      : '72px',
      textAlign       : 'center',
      cursor          : 'pointer',
      pointerEvents   : 'all',
      userSelect      : 'none',
      WebkitUserSelect: 'none',
      outline         : 'none',
      WebkitTapHighlightColor: 'transparent',
      boxShadow       : '0 0 16px rgba(255,100,50,0.4)',
      transition      : 'transform 0.08s, background 0.08s',
    });
    this._container.appendChild(this._attackBtnEl);
  }

  // ── Botón de habilidad (junto al de ataque) ─────────────────────────────────

  _buildSkillButton() {
    this._skillBtnEl = document.createElement('button');
    this._skillBtnEl.textContent = '🔥';
    Object.assign(this._skillBtnEl.style, {
      position        : 'absolute',
      bottom          : '32px',
      right           : '116px',   // a la izquierda del botón de ataque
      width           : '64px',
      height          : '64px',
      borderRadius    : '50%',
      border          : '2px solid rgba(255,150,50,0.6)',
      background      : 'rgba(150,40,10,0.75)',
      color           : '#ffe',
      fontSize        : '24px',
      lineHeight      : '64px',
      textAlign       : 'center',
      cursor          : 'pointer',
      pointerEvents   : 'all',
      userSelect      : 'none',
      WebkitUserSelect: 'none',
      outline         : 'none',
      WebkitTapHighlightColor: 'transparent',
      boxShadow       : '0 0 12px rgba(255,80,20,0.4)',
      transition      : 'transform 0.08s',
      overflow        : 'hidden',
      position        : 'absolute',
    });

    // Overlay de cooldown (se llena de abajo hacia arriba)
    this._skillCoolEl = document.createElement('div');
    Object.assign(this._skillCoolEl.style, {
      position     : 'absolute',
      bottom       : '0',
      left         : '0',
      width        : '100%',
      height       : '0%',        // crece cuando está en cooldown
      background   : 'rgba(0,0,0,0.6)',
      borderRadius : '50%',
      transition   : 'height 0.1s linear',
      pointerEvents: 'none',
    });

    this._skillBtnEl.style.position = 'absolute';
    this._skillBtnEl.appendChild(this._skillCoolEl);
    this._container.appendChild(this._skillBtnEl);
  }

  // ── Eventos de botones ──────────────────────────────────────────────────────

  _bindButtons() {
    const pressAtk = (e) => {
      e.preventDefault();
      this.combat.triggerAttack();
      this._animateBtn(this._attackBtnEl, 'rgba(220,80,40,0.9)');
    };
    this._attackBtnEl.addEventListener('touchstart', pressAtk, { passive: false });
    this._attackBtnEl.addEventListener('mousedown',  pressAtk);

    if (this._skillBtnEl && this.skills) {
      const pressSkill = (e) => {
        e.preventDefault();
        const ok = this.skills.castFireball();
        if (ok) this._animateBtn(this._skillBtnEl, 'rgba(200,60,10,0.9)');
      };
      this._skillBtnEl.addEventListener('touchstart', pressSkill, { passive: false });
      this._skillBtnEl.addEventListener('mousedown',  pressSkill);
    }
  }

  _animateBtn(btn, activeColor) {
    const orig = btn.style.background;
    btn.style.transform  = 'scale(0.88)';
    btn.style.background = activeColor;
    setTimeout(() => {
      btn.style.transform  = 'scale(1)';
      btn.style.background = orig;
    }, 140);
  }

  // ── Updates ─────────────────────────────────────────────────────────────────

  _updateBar(hp, maxHp) {
    const pct = Math.max(0, hp / maxHp) * 100;
    this._fillEl.style.width = `${pct}%`;
    this._hpTextEl.textContent = `${hp} / ${maxHp}`;

    if (pct > 50) {
      this._fillEl.style.background = 'linear-gradient(90deg, #cc2222, #ff4444)';
    } else if (pct > 25) {
      this._fillEl.style.background = 'linear-gradient(90deg, #cc6600, #ff9900)';
    } else {
      this._fillEl.style.background = 'linear-gradient(90deg, #882200, #cc2200)';
    }

    if (hp <= 0) setTimeout(() => this._showEnemyBar(false), 900);
  }

  _updateEnergy(energy, maxEnergy) {
    const pct = Math.max(0, energy / maxEnergy) * 100;
    this._energyFill.style.width = `${pct}%`;
  }

  _updateSkillCooldown(progress) {
    if (!this._skillCoolEl) return;
    // progress 0 = recién usado (overlay lleno), 1 = listo (overlay vacío)
    const coverPct = (1 - progress) * 100;
    this._skillCoolEl.style.height = `${coverPct}%`;

    // Atenúa el botón cuando está en cooldown
    if (this._skillBtnEl) {
      this._skillBtnEl.style.opacity = progress < 1 ? '0.5' : '1';
    }
    _showEnemyBar(visible) {
    this._enemyBarEl.style.display = visible ? 'block' : 'none';
  }

  setWeaponIcon(type) {
    const icons = { fists: '✊', sword: '⚔️', magic: '🔮', bow: '🏹' };
    this._attackBtnEl.textContent = icons[type] ?? '⚔';
  }
  }
  }
  

