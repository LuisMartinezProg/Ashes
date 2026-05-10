// ui/hud.js — Ashes of the Reborn | Valiant Gaming

export class HUD {
  constructor(combatSystem, skillSystem = null) {
    this.combat = combatSystem;
    this.skills = skillSystem;
    this._currentEnemy  = null;
    this._enemies       = [];
    this._enemyBarEl    = null;
    this._fillEl        = null;
    this._hpTextEl      = null;
    this._playerHpFill  = null;
    this._playerHpText  = null;
    this._energyFill    = null;
    this._container     = null;
    this._collectBtn    = null;
    this._collectTimer  = null;

    this._build();

    if (this.skills) {
      this.skills.onEnergyUpdate = (e, max) => this._updateEnergy(e, max);
    }
  }

  setEnemies(list) { this._enemies = list; }
  show()           { this._container.style.display = 'block'; }
  hide()           { this._container.style.display = 'none'; }

  setWeaponIcon(type) {
    if (window._skillBar) window._skillBar.setWeaponIcon(type);
  }

  updatePlayerHp(hp, max) {
    if (!this._playerHpFill) return;
    const pct = Math.max(0, hp / max) * 100;
    this._playerHpFill.style.width = `${pct}%`;
    if (this._playerHpText) this._playerHpText.textContent = `${Math.ceil(hp)}/${max}`;
  }

  updateEnemyBar(playerPosition) {
    if (this._currentEnemy && this._currentEnemy.isDead()) this._currentEnemy = null;
    if (!this._currentEnemy) {
      let closest = null, minDist = Infinity;
      for (const e of this._enemies) {
        if (e.isDead()) continue;
        const d = playerPosition.distanceTo(e.mesh.position);
        if (d < minDist) { minDist = d; closest = e; }
      }
      this._currentEnemy = minDist <= 8 ? closest : null;
    }
    if (this._currentEnemy && !this._currentEnemy.isDead()) {
      this._updateBar(this._currentEnemy.hp, this._currentEnemy.maxHp);
      this._enemyBarEl.style.display = 'block';
    } else {
      this._enemyBarEl.style.display = 'none';
    }
  }

  // ── Recolección ──────────────────────────────────────────────────────────
  showCollectBtn(resource) {
    if (!resource) {
      this._hideCollectBtn();
      return;
    }
    const labels = { madera: '🪓 Talar', piedra: '⛏ Picar' };
    this._collectBtn.textContent  = labels[resource.type] ?? '🖐 Recolectar';
    this._collectBtn.style.display = 'flex';
    this._currentResource = resource;
  }

  _hideCollectBtn() {
    this._collectBtn.style.display = 'none';
    this._currentResource = null;
  }

  _onCollect() {
    const res = this._currentResource;
    if (!res || res.depleted) return;

    const tool    = window._building?.getTool?.() ?? 'punos';
    const toolMap = { punos: 1, hacha_madera: 2, hacha_piedra: 4, pico_madera: 2, pico_piedra: 4 };
    const power   = toolMap[tool] ?? 1;

    // Solo herramienta correcta
    const needsAxe  = res.type === 'madera';
    const needsPick = res.type === 'piedra';
    const hasAxe    = tool.includes('hacha');
    const hasPick   = tool.includes('pico');

    if (needsAxe && !hasAxe && tool !== 'punos') return;
    if (needsPick && !hasPick && tool !== 'punos') return;

    // Animar botón
    this._collectBtn.style.transform = 'scale(0.88)';
    setTimeout(() => this._collectBtn.style.transform = 'scale(1)', 140);

    // Reducir HP del recurso
    res.hp -= power;

    // Dar material
    const amount = power;
    window._building?.addMaterial?.(res.type, amount);

    // Feedback visual
    this._showFloating(`+${amount} ${res.type}`, res.type === 'madera' ? '#8B6340' : '#888078');

    // Agotar recurso
    if (res.hp <= 0) {
      res.depleted = true;
      res.mesh.visible = false;
      this._hideCollectBtn();

      // Regenerar después de 30 segundos
      setTimeout(() => {
        res.hp       = res.maxHp;
        res.depleted = false;
        res.mesh.visible = true;
      }, 30000);
    }
  }

  _showFloating(text, color = '#c9a84c') {
    const el = document.createElement('div');
    Object.assign(el.style, {
      position  : 'fixed',
      left      : '50%',
      bottom    : '220px',
      transform : 'translateX(-50%)',
      fontFamily: "'Cinzel',serif",
      fontSize  : '13px',
      letterSpacing: '2px',
      color,
      pointerEvents: 'none',
      zIndex    : '300',
      transition: 'bottom 0.8s ease, opacity 0.8s ease',
      opacity   : '1',
    });
    el.textContent = text;
    document.body.appendChild(el);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        el.style.bottom  = '280px';
        el.style.opacity = '0';
      });
    });
    setTimeout(() => el.remove(), 900);
  }

  // ── Build ────────────────────────────────────────────────────────────────
  _build() {
    this._container = document.createElement('div');
    this._container.id = 'hud-combat';
    Object.assign(this._container.style, {
      position     : 'fixed',
      inset        : '0',
      pointerEvents: 'none',
      zIndex       : '100',
      display      : 'none',
    });

    this._buildPlayerBlock();
    this._buildEnemyBar();
    this._buildCollectBtn();
    document.body.appendChild(this._container);
  }

  _buildCollectBtn() {
    this._collectBtn = document.createElement('button');
    Object.assign(this._collectBtn.style, {
      position     : 'fixed',
      bottom       : '200px',
      left         : '50%',
      transform    : 'translateX(-50%)',
      display      : 'none',
      alignItems   : 'center',
      justifyContent: 'center',
      fontFamily   : "'Cinzel',serif",
      fontSize     : '12px',
      letterSpacing: '2px',
      color        : '#c9a84c',
      background   : 'rgba(10,8,20,0.92)',
      border       : '1px solid rgba(201,168,76,0.4)',
      borderRadius : '24px',
      padding      : '10px 24px',
      cursor       : 'pointer',
      pointerEvents: 'all',
      zIndex       : '150',
      boxShadow    : '0 2px 12px rgba(0,0,0,0.5)',
      transition   : 'transform 0.1s',
      whiteSpace   : 'nowrap',
    });

    this._collectBtn.addEventListener('touchstart', (e) => {
      e.preventDefault();
      this._onCollect();
    }, { passive: false });
    this._collectBtn.addEventListener('click', () => this._onCollect());

    document.body.appendChild(this._collectBtn);
  }

  _buildPlayerBlock() {
    const block = document.createElement('div');
    Object.assign(block.style, {
      position     : 'absolute',
      bottom       : '12px',
      left         : '50%',
      transform    : 'translateX(-50%)',
      display      : 'flex',
      flexDirection: 'column',
      gap          : '6px',
      width        : '52vw',
      maxWidth     : '280px',
    });

    const hpWrap  = this._makeBarWrap('rgba(255,50,50,0.15)', 'rgba(255,80,80,0.3)');
    const hpTrack = this._makeTrack('12px', '#220000');
    this._playerHpFill = this._makeFill('linear-gradient(90deg,#aa0000,#ff4444)');
    hpTrack.appendChild(this._playerHpFill);

    this._playerHpText = document.createElement('div');
    Object.assign(this._playerHpText.style, {
      color        : 'rgba(255,180,180,0.9)',
      fontSize     : '9px',
      fontFamily   : 'monospace',
      textAlign    : 'center',
      marginTop    : '2px',
      letterSpacing: '0.5px',
    });
    this._playerHpText.textContent = '100/100';

    hpWrap.appendChild(hpTrack);
    hpWrap.appendChild(this._playerHpText);

    const enWrap  = this._makeBarWrap('rgba(50,100,255,0.1)', 'rgba(80,130,255,0.25)');
    const enTrack = this._makeTrack('8px', '#1a1a2e');
    this._energyFill = this._makeFill('linear-gradient(90deg,#2244cc,#66aaff)');
    enTrack.appendChild(this._energyFill);

    const enText = document.createElement('div');
    Object.assign(enText.style, {
      color        : 'rgba(150,180,255,0.7)',
      fontSize     : '8px',
      fontFamily   : 'monospace',
      textAlign    : 'center',
      marginTop    : '2px',
      letterSpacing: '0.5px',
    });
    enText.textContent = 'ENERGÍA';

    enWrap.appendChild(enTrack);
    enWrap.appendChild(enText);

    block.appendChild(hpWrap);
    block.appendChild(enWrap);
    this._container.appendChild(block);
  }

  _makeBarWrap(bg, border) {
    const w = document.createElement('div');
    Object.assign(w.style, {
      background  : bg,
      border      : `1px solid ${border}`,
      borderRadius: '4px',
      padding     : '4px 8px',
    });
    return w;
  }

  _makeTrack(height, bg) {
    const t = document.createElement('div');
    Object.assign(t.style, {
      width       : '100%',
      height,
      background  : bg,
      borderRadius: '4px',
      overflow    : 'hidden',
    });
    return t;
  }

  _makeFill(gradient) {
    const f = document.createElement('div');
    Object.assign(f.style, {
      height    : '100%',
      width     : '100%',
      background: gradient,
      transition: 'width 0.2s ease',
    });
    return f;
  }

  _buildEnemyBar() {
    this._enemyBarEl = document.createElement('div');
    Object.assign(this._enemyBarEl.style, {
      position    : 'absolute',
      top         : '12px',
      left        : '50%',
      transform   : 'translateX(-50%)',
      width       : '50vw',
      maxWidth    : '280px',
      background  : 'rgba(0,0,0,0.6)',
      border      : '1px solid rgba(255,255,255,0.15)',
      borderRadius: '6px',
      padding     : '6px 10px',
      display     : 'none',
    });

    const label = document.createElement('div');
    Object.assign(label.style, {
      color        : '#ccc',
      fontSize     : '10px',
      fontFamily   : 'monospace',
      marginBottom : '4px',
      letterSpacing: '1px',
    });
    label.textContent = 'ENEMIGO';

    const track = document.createElement('div');
    Object.assign(track.style, {
      width       : '100%',
      height      : '10px',
      background  : '#333',
      borderRadius: '4px',
      overflow    : 'hidden',
    });

    this._fillEl = document.createElement('div');
    Object.assign(this._fillEl.style, {
      height      : '100%',
      width       : '100%',
      background  : 'linear-gradient(90deg,#cc2222,#ff4444)',
      borderRadius: '4px',
      transition  : 'width 0.15s ease',
    });

    this._hpTextEl = document.createElement('div');
    Object.assign(this._hpTextEl.style, {
      color     : '#aaa',
      fontSize  : '9px',
      fontFamily: 'monospace',
      marginTop : '3px',
      textAlign : 'right',
    });

    track.appendChild(this._fillEl);
    this._enemyBarEl.appendChild(label);
    this._enemyBarEl.appendChild(track);
    this._enemyBarEl.appendChild(this._hpTextEl);
    this._container.appendChild(this._enemyBarEl);
  }

  _updateBar(hp, maxHp) {
    const pct = Math.max(0, hp / maxHp) * 100;
    this._fillEl.style.width = `${pct}%`;
    this._hpTextEl.textContent = `${Math.ceil(hp)} / ${maxHp}`;
    this._fillEl.style.background = pct > 50
      ? 'linear-gradient(90deg,#cc2222,#ff4444)'
      : pct > 25
        ? 'linear-gradient(90deg,#cc6600,#ff9900)'
        : 'linear-gradient(90deg,#882200,#cc2200)';
  }

  _updateEnergy(energy, maxEnergy) {
    const pct = Math.max(0, energy / maxEnergy) * 100;
    this._energyFill.style.width = `${pct}%`;
  }
                                          }
