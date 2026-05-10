// ui/hud.js — Ashes of the Reborn | Valiant Gaming

export class HUD {
  constructor(combatSystem, skillSystem = null) {
    this.combat = combatSystem;
    this.skills = skillSystem;
    this._currentEnemy = null;
    this._enemies      = [];
    this._enemyBarEl   = null;
    this._fillEl       = null;
    this._hpTextEl     = null;
    this._playerHpFill = null;
    this._playerHpText = null;
    this._energyFill   = null;
    this._container    = null;

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
    document.body.appendChild(this._container);
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
