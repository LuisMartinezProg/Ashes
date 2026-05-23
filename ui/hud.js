// ui/hud.js — Ashes of the Reborn | Valiant Gaming

export class HUD {
  constructor(combatSystem, skillSystem = null) {
    this.combat         = combatSystem;
    this.skills         = skillSystem;
    this._enemies       = [];
    this._enemyLabels   = new Map();
    this._bossBarEl     = null;
    this._bossFillEl    = null;
    this._bossTextEl    = null;
    this._bossNameEl    = null;
    this._playerHpFill  = null;
    this._playerHpText  = null;
    this._playerHpName  = null;
    this._energyFill    = null;
    this._staminaEl     = null;
    this._staminaSvg    = null;
    this._staminaArc    = null;
    this._staminaHideTimer = null;
    this._container     = null;
    this._collectBtn    = null;
    this._camera        = null;

    this._partyEl      = null;
    this._partyManager = null;
    this._mikaSkillBtn = null;

    this._ARC_R   = 24;
    this._ARC_LEN = 2 * Math.PI * 24 * 0.75;

    this._build();

    if (this.skills) {
      this.skills.onEnergyUpdate = (e, max) => this._updateEnergy(e, max);
    }
  }

  setPartyManager(pm) {
    this._partyManager = pm;
    pm.onSwitch   = (idx) => this._onPartySwitch(idx);
    pm.onReaction = (name) => this._showReactionLabel(name);
    pm.companion.onDamage = (hp, max) => this._updateMikaHp(hp, max);
  }

  _buildParty() {
    this._partyEl = document.createElement('div');
    Object.assign(this._partyEl.style, {
      position     : 'fixed',
      right        : '10px',
      bottom       : '120px',
      display      : 'flex',
      flexDirection: 'column',
      gap          : '8px',
      pointerEvents: 'all',
      zIndex       : '120',
    });

    this._p1Card = this._makePartyCard({ name: 'KAEL', color: '#88aaff', active: true,  idx: 0 });
    this._p2Card = this._makePartyCard({ name: 'MIKA', color: '#ff88aa', active: false, idx: 1 });

    this._partyEl.appendChild(this._p1Card.wrap);
    this._partyEl.appendChild(this._p2Card.wrap);
    this._container.appendChild(this._partyEl);
  }

  _makePartyCard({ name, color, active, idx }) {
    const wrap = document.createElement('div');
    Object.assign(wrap.style, {
      display      : 'flex',
      flexDirection: 'column',
      alignItems   : 'center',
      gap          : '3px',
      cursor       : 'pointer',
      transition   : 'transform 0.15s',
    });

    const avatar = document.createElement('div');
    Object.assign(avatar.style, {
      width         : active ? '44px' : '36px',
      height        : active ? '44px' : '36px',
      borderRadius  : '50%',
      background    : `radial-gradient(circle at 35% 35%, ${color}, ${color}66)`,
      border        : `2px solid ${active ? color : color + '55'}`,
      boxShadow     : active ? `0 0 10px ${color}88` : 'none',
      transition    : 'all 0.2s',
      display       : 'flex',
      alignItems    : 'center',
      justifyContent: 'center',
      fontSize      : '16px',
      position      : 'relative',
    });
    avatar.textContent = idx === 0 ? '⚔️' : '🏹';

    const label = document.createElement('div');
    Object.assign(label.style, {
      fontFamily   : 'monospace',
      fontSize     : '7px',
      color        : active ? color : color + '88',
      letterSpacing: '1px',
      transition   : 'color 0.2s',
    });
    label.textContent = name;

    const hpTrack = document.createElement('div');
    Object.assign(hpTrack.style, {
      width       : active ? '44px' : '36px',
      height      : '3px',
      background  : '#222',
      borderRadius: '2px',
      overflow    : 'hidden',
      transition  : 'width 0.2s',
    });
    const hpFill = document.createElement('div');
    Object.assign(hpFill.style, {
      height    : '100%',
      width     : '100%',
      background: color,
      transition: 'width 0.2s ease',
    });
    hpTrack.appendChild(hpFill);

    const coolOverlay = document.createElement('div');
    Object.assign(coolOverlay.style, {
      position      : 'absolute',
      inset         : '0',
      borderRadius  : '50%',
      background    : 'rgba(0,0,0,0.55)',
      display       : 'none',
      alignItems    : 'center',
      justifyContent: 'center',
      fontSize      : '9px',
      color         : '#fff',
      fontFamily    : 'monospace',
    });
    avatar.appendChild(coolOverlay);

    wrap.appendChild(avatar);
    wrap.appendChild(label);
    wrap.appendChild(hpTrack);

    const onTap = (e) => {
      e.preventDefault();
      if (!this._partyManager) return;
      if (this._partyManager.getActiveIdx() === idx) return;
      this._partyManager.switchCharacter();
    };
    wrap.addEventListener('touchstart', onTap, { passive: false });
    wrap.addEventListener('click',      onTap);

    return { wrap, avatar, label, hpFill, hpTrack, coolOverlay };
  }

  _onPartySwitch(idx) {
    const cards  = [this._p1Card, this._p2Card];
    const colors = ['#88aaff', '#ff88aa'];
    const names  = ['KAEL', 'MIKA'];
     if (window._skillBar) {
  const mikaSys = this._partyManager?.companion?.skillSystem;
  window._skillBar.setActiveCharacter(idx, mikaSys);
     }
    // Actualizar cards
    cards.forEach((card, i) => {
      const active = i === idx;
      const color  = colors[i];
      card.avatar.style.width     = active ? '44px' : '36px';
      card.avatar.style.height    = active ? '44px' : '36px';
      card.avatar.style.border    = `2px solid ${active ? color : color + '55'}`;
      card.avatar.style.boxShadow = active ? `0 0 10px ${color}88` : 'none';
      card.label.style.color      = active ? color : color + '88';
      card.hpTrack.style.width    = active ? '44px' : '36px';
    });

    // Cooldown en el que sale
    const prevIdx  = idx === 0 ? 1 : 0;
    const prevCard = cards[prevIdx];
    prevCard.coolOverlay.style.display = 'flex';
    let cd = 1.5;
    const tick = setInterval(() => {
      cd -= 0.1;
      prevCard.coolOverlay.textContent = cd > 0 ? cd.toFixed(1) : '';
      if (cd <= 0) {
        clearInterval(tick);
        prevCard.coolOverlay.style.display = 'none';
      }
    }, 100);

    // Cambiar color y nombre de la barra HP central
    const color = colors[idx];
    if (this._playerHpFill) {
      this._playerHpFill.style.background =
        idx === 0
          ? 'linear-gradient(90deg,#aa0000,#ff4444)'
          : 'linear-gradient(90deg,#aa0044,#ff88aa)';
    }
    if (this._playerHpName) {
      this._playerHpName.textContent = names[idx];
      this._playerHpName.style.color = color;
    }
    if (this._energyFill) {
      this._energyFill.style.background =
        idx === 0
          ? 'linear-gradient(90deg,#2244cc,#66aaff)'
          : 'linear-gradient(90deg,#aa2266,#ff88aa)';
    }

    // Botón 🏹 — solo visible cuando Mika NO está activa
    if (this._mikaSkillBtn) {
      this._mikaSkillBtn.style.display = idx === 1 ? 'none' : 'flex';
    }

    // Stamina — solo relevante para el protagonista
    if (this._staminaEl) {
      this._staminaEl.style.display = idx === 0 ? 'block' : 'none';
    }
  }

  _updateMikaHp(hp, max) {
    if (!this._p2Card) return;
    const pct = Math.max(0, hp / max) * 100;
    this._p2Card.hpFill.style.width = `${pct}%`;
    // Si Mika está activa, actualizar también la barra central
    if (this._partyManager?.getActiveIdx() === 1) {
      if (this._playerHpFill) this._playerHpFill.style.width = `${pct}%`;
      if (this._playerHpText) this._playerHpText.textContent = `${Math.ceil(hp)}/${max}`;
    }
  }

  updateProtagonistHp(hp, max) {
    if (!this._p1Card) return;
    const pct = Math.max(0, hp / max) * 100;
    this._p1Card.hpFill.style.width = `${pct}%`;
  }
_buildMikaSkillBtn() {
  this._mikaSkillBtn = document.createElement('button');
  Object.assign(this._mikaSkillBtn.style, {
    position      : 'fixed',
    right         : '62px',
    bottom        : '62px',
    width         : '46px',
    height        : '46px',
    borderRadius  : '50%',
    background    : 'radial-gradient(circle at 35% 35%, #ff88aa, #cc4477)',
    border        : '2px solid #ff88aaaa',
    color         : '#fff',
    fontSize      : '18px',
    display       : 'none',
    alignItems    : 'center',
    justifyContent: 'center',
    cursor        : 'pointer',
    pointerEvents : 'all',
    zIndex        : '130',
    boxShadow     : '0 0 8px #ff88aa66',
    transition    : 'transform 0.1s, opacity 0.2s',
  });
  this._mikaSkillBtn.textContent = '🏹';

  const onTap = (e) => {
    e.preventDefault();
    if (!this._partyManager) return;
    const ok = this._partyManager.castCompanionSkill();
    if (ok) {
      this._mikaSkillBtn.style.transform = 'scale(0.85)';
      setTimeout(() => this._mikaSkillBtn.style.transform = 'scale(1)', 150);
    }
  };
  this._mikaSkillBtn.addEventListener('touchstart', onTap, { passive: false });
  this._mikaSkillBtn.addEventListener('click',      onTap);
  this._container.appendChild(this._mikaSkillBtn);
}
  
  

  _showReactionLabel(name) {
    const labels = {
      vapor         : { text: '💨 VAPOR',           color: '#aaddff' },
      discharge     : { text: '⚡ DESCARGA',         color: '#ffff44' },
      blizzard      : { text: '❄️ VENTISCA',         color: '#88ccff' },
      cyclone       : { text: '🌪️ CICLÓN',           color: '#aaeeff' },
      dark_sentence : { text: '☠️ SENTENCIA OSCURA', color: '#cc44ff' },
    };
    const data = labels[name] ?? { text: name.toUpperCase(), color: '#ffffff' };

    const el = document.createElement('div');
    Object.assign(el.style, {
      position     : 'fixed',
      top          : '38%',
      left         : '50%',
      transform    : 'translateX(-50%)',
      fontFamily   : "'Cinzel', serif",
      fontSize     : '16px',
      fontWeight   : 'bold',
      letterSpacing: '3px',
      color        : data.color,
      textShadow   : `0 0 12px ${data.color}`,
      pointerEvents: 'none',
      zIndex       : '300',
      opacity      : '1',
      transition   : 'opacity 0.8s ease, top 0.8s ease',
    });
    el.textContent = data.text;
    document.body.appendChild(el);
    requestAnimationFrame(() => requestAnimationFrame(() => {
      el.style.opacity = '0';
      el.style.top     = '32%';
    }));
    setTimeout(() => el.remove(), 900);
  }

  setEnemies(list) {
    for (const el of this._enemyLabels.values()) el.remove();
    this._enemyLabels.clear();
    this._enemies = list;
  }

  setCamera(camera) { this._camera = camera; }
show() {
  this._container.style.display = 'block';
  if (this._partyEl) this._partyEl.style.display = 'flex';
  // 🏹 solo visible si protagonista activo
  if (this._mikaSkillBtn) {
    const idx = this._partyManager?.getActiveIdx() ?? 0;
    this._mikaSkillBtn.style.display = idx === 0 ? 'flex' : 'none';
  }
}
  

  hide() {
    this._container.style.display = 'none';
    if (this._partyEl)      this._partyEl.style.display      = 'none';
    if (this._mikaSkillBtn) this._mikaSkillBtn.style.display = 'none';
  }

  setWeaponIcon(type) {
    if (window._skillBar) window._skillBar.setWeaponIcon(type);
  }

  updatePlayerHp(hp, max) {
    if (!this._playerHpFill) return;
    // Solo actualizar barra central si el protagonista está activo
    if (!this._partyManager || this._partyManager.getActiveIdx() === 0) {
      const pct = Math.max(0, hp / max) * 100;
      this._playerHpFill.style.width = `${pct}%`;
      if (this._playerHpText) this._playerHpText.textContent = `${Math.ceil(hp)}/${max}`;
    }
    this.updateProtagonistHp(hp, max);
  }

  updateStamina(stamina, max) {
    if (!this._staminaArc) return;
    const pct  = Math.max(0, stamina / max);
    const full = pct >= 1;
    this._staminaArc.style.strokeDashoffset = `${this._ARC_LEN * (1 - pct)}`;
    const color = pct > 0.5 ? '#f5d442' : pct > 0.25 ? '#f5a623' : '#e74c3c';
    this._staminaArc.style.stroke = color;
    if (full) {
      if (this._staminaHideTimer) clearTimeout(this._staminaHideTimer);
      this._staminaHideTimer = setTimeout(() => {
        if (this._staminaEl) this._staminaEl.style.opacity = '0';
      }, 1500);
    } else {
      if (this._staminaHideTimer) clearTimeout(this._staminaHideTimer);
      if (this._staminaEl) this._staminaEl.style.opacity = '1';
    }
  }

  updateEnemyBar(playerPosition) {
    if (!this._camera) return;
    let bossFound = false;
    for (const e of this._enemies) {
      if (!e.mesh) continue;
      if (e._config?.isBoss) {
        if (!e.isDead() && e.mesh) {
          const dist = playerPosition.distanceTo(e.mesh.position);
          if (dist <= 30) { bossFound = true; this._updateBossBar(e); }
        }
        this._hideLabel(e);
        continue;
      }
      if (e.isDead?.()) { this._hideLabel(e); continue; }
      const dist = playerPosition.distanceTo(e.mesh.position);
      if (dist <= 20) this._updateFloatingLabel(e);
      else this._hideLabel(e);
    }
    if (!bossFound) this._bossBarEl.style.display = 'none';
  }

  _updateBossBar(e) {
    const pct = Math.max(0, e.hp / e.maxHp) * 100;
    this._bossFillEl.style.width   = `${pct}%`;
    this._bossTextEl.textContent   = `${Math.ceil(e.hp)} / ${e.maxHp}`;
    this._bossNameEl.textContent   = e._config?.name ?? 'JEFE';
    this._bossFillEl.style.background = pct > 50
      ? 'linear-gradient(90deg,#7700cc,#cc44ff)'
      : pct > 25
        ? 'linear-gradient(90deg,#cc6600,#ff9900)'
        : 'linear-gradient(90deg,#882200,#cc2200)';
    this._bossBarEl.style.display = 'block';
  }

  _updateFloatingLabel(e) {
    let el = this._enemyLabels.get(e);
    if (!el) {
      el = this._makeFloatingLabel();
      this._enemyLabels.set(e, el);
      document.body.appendChild(el);
    }
    const pos = e.mesh.position.clone();
    pos.y += 2.2;
    pos.project(this._camera);
    const x = (pos.x *  0.5 + 0.5) * window.innerWidth;
    const y = (pos.y * -0.5 + 0.5) * window.innerHeight;
    if (pos.z > 1) { el.style.display = 'none'; return; }
    const pct  = Math.max(0, e.hp / e.maxHp) * 100;
    const fill = el.querySelector('.ef');
    const text = el.querySelector('.et');
    const name = el.querySelector('.en');
    fill.style.width = `${pct}%`;
    fill.style.background = pct > 50
      ? 'linear-gradient(90deg,#cc2222,#ff4444)'
      : pct > 25
        ? 'linear-gradient(90deg,#cc6600,#ff9900)'
        : 'linear-gradient(90deg,#882200,#cc2200)';
    text.textContent = `${Math.ceil(e.hp)}/${e.maxHp}`;
    name.textContent = e._config?.name ?? 'Enemigo';
    el.style.display = 'block';
    el.style.left    = `${x}px`;
    el.style.top     = `${y}px`;
  }

  _hideLabel(e) {
    const el = this._enemyLabels.get(e);
    if (el) el.style.display = 'none';
  }

  _makeFloatingLabel() {
    const wrap = document.createElement('div');
    Object.assign(wrap.style, {
      position     : 'fixed',
      transform    : 'translateX(-50%)',
      display      : 'none',
      flexDirection: 'column',
      alignItems   : 'center',
      gap          : '2px',
      pointerEvents: 'none',
      zIndex       : '90',
      minWidth     : '80px',
    });
    const name = document.createElement('div');
    name.className = 'en';
    Object.assign(name.style, {
      color        : '#ffddaa',
      fontSize     : '9px',
      fontFamily   : 'monospace',
      letterSpacing: '1px',
      textShadow   : '0 1px 3px #000',
      textAlign    : 'center',
    });
    const track = document.createElement('div');
    Object.assign(track.style, {
      width       : '80px',
      height      : '6px',
      background  : '#222',
      borderRadius: '3px',
      overflow    : 'hidden',
      border      : '1px solid rgba(255,255,255,0.15)',
    });
    const fill = document.createElement('div');
    fill.className = 'ef';
    Object.assign(fill.style, {
      height    : '100%',
      width     : '100%',
      background: 'linear-gradient(90deg,#cc2222,#ff4444)',
      transition: 'width 0.15s ease',
    });
    const text = document.createElement('div');
    text.className = 'et';
    Object.assign(text.style, {
      color     : '#aaa',
      fontSize  : '8px',
      fontFamily: 'monospace',
      textAlign : 'center',
    });
    track.appendChild(fill);
    wrap.appendChild(name);
    wrap.appendChild(track);
    wrap.appendChild(text);
    return wrap;
  }

  showCollectBtn(resource) {
    if (!resource) { this._hideCollectBtn(); return; }
    const labels = { madera: '🪓 Talar', piedra: '⛏ Picar' };
    this._collectBtn.textContent   = labels[resource.type] ?? '🖐 Recolectar';
    this._collectBtn.style.display = 'flex';
    this._currentResource = resource;
  }

  _hideCollectBtn() {
    this._collectBtn.style.display = 'none';
    this._currentResource = null;
  }

  _onCollect() {
    const now = Date.now();
    if (this._lastCollect && now - this._lastCollect < 800) return;
    this._lastCollect = now;
    const res = this._currentResource;
    if (!res || res.depleted) return;
    const tool    = window._building?.getTool?.() ?? 'punos';
    const toolMap = { punos: 1, hacha_madera: 2, hacha_piedra: 4, pico_madera: 2, pico_piedra: 4 };
    const power   = toolMap[tool] ?? 1;
    const needsAxe  = res.type === 'madera';
    const needsPick = res.type === 'piedra';
    const hasAxe    = tool.includes('hacha');
    const hasPick   = tool.includes('pico');
    if (needsAxe && !hasAxe && tool !== 'punos') return;
    if (needsPick && !hasPick && tool !== 'punos') return;
    this._collectBtn.style.transform = 'scale(0.88)';
    setTimeout(() => this._collectBtn.style.transform = 'scale(1)', 140);
    res.hp -= power;
    window._building?.addMaterial?.(res.type, power);
    this._showFloating(`+${power} ${res.type}`, res.type === 'madera' ? '#8B6340' : '#888078');
    if (res.hp <= 0) {
      res.depleted     = true;
      res.mesh.visible = false;
      this._hideCollectBtn();
      setTimeout(() => {
        res.hp           = res.maxHp;
        res.depleted     = false;
        res.mesh.visible = true;
      }, 30000);
    }
  }

  _showFloating(text, color = '#c9a84c') {
    const el = document.createElement('div');
    Object.assign(el.style, {
      position     : 'fixed',
      left         : '50%',
      bottom       : '220px',
      transform    : 'translateX(-50%)',
      fontFamily   : "'Cinzel',serif",
      fontSize     : '13px',
      letterSpacing: '2px',
      color,
      pointerEvents: 'none',
      zIndex       : '300',
      transition   : 'bottom 0.8s ease, opacity 0.8s ease',
      opacity      : '1',
    });
    el.textContent = text;
    document.body.appendChild(el);
    requestAnimationFrame(() => requestAnimationFrame(() => {
      el.style.bottom  = '280px';
      el.style.opacity = '0';
    }));
    setTimeout(() => el.remove(), 900);
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
    this._buildBossBar();
    this._buildStamina();
    this._buildCollectBtn();
    this._buildParty();
    this._buildMikaSkillBtn();
    document.body.appendChild(this._container);
  }

  _buildStamina() {
    const size     = 56;
    const r        = this._ARC_R;
    const circ     = 2 * Math.PI * r;
    const arcLen   = this._ARC_LEN;
    const arcGap   = circ - arcLen;
    const rotStart = 135;
    this._staminaEl = document.createElement('div');
    Object.assign(this._staminaEl.style, {
      position     : 'fixed',
      right        : '22%',
      top          : '62%',
      width        : `${size}px`,
      height       : `${size}px`,
      opacity      : '0',
      transition   : 'opacity 0.4s ease',
      pointerEvents: 'none',
      zIndex       : '110',
    });
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width',   size);
    svg.setAttribute('height',  size);
    svg.setAttribute('viewBox', `0 0 ${size} ${size}`);
    const bgArc = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    bgArc.setAttribute('cx', size / 2);
    bgArc.setAttribute('cy', size / 2);
    bgArc.setAttribute('r',  r);
    bgArc.setAttribute('fill',           'none');
    bgArc.setAttribute('stroke',         'rgba(255,255,255,0.12)');
    bgArc.setAttribute('stroke-width',   '3.5');
    bgArc.setAttribute('stroke-linecap', 'round');
    bgArc.style.strokeDasharray  = `${arcLen} ${arcGap}`;
    bgArc.style.transformOrigin  = 'center';
    bgArc.style.transform        = `rotate(${rotStart}deg)`;
    svg.appendChild(bgArc);
    this._staminaArc = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    this._staminaArc.setAttribute('cx', size / 2);
    this._staminaArc.setAttribute('cy', size / 2);
    this._staminaArc.setAttribute('r',  r);
    this._staminaArc.setAttribute('fill',           'none');
    this._staminaArc.setAttribute('stroke',         '#f5d442');
    this._staminaArc.setAttribute('stroke-width',   '3.5');
    this._staminaArc.setAttribute('stroke-linecap', 'round');
    this._staminaArc.style.strokeDasharray  = `${arcLen} ${circ}`;
    this._staminaArc.style.strokeDashoffset = '0';
    this._staminaArc.style.transformOrigin  = 'center';
    this._staminaArc.style.transform        = `rotate(${rotStart}deg)`;
    this._staminaArc.style.transition       = 'stroke-dashoffset 0.15s linear, stroke 0.3s';
    svg.appendChild(this._staminaArc);
    const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    label.setAttribute('x',                 '50%');
    label.setAttribute('y',                 '50%');
    label.setAttribute('text-anchor',       'middle');
    label.setAttribute('dominant-baseline', 'middle');
    label.setAttribute('fill',              '#f5d442');
    label.setAttribute('font-size',         '13');
    label.setAttribute('font-family',       'monospace');
    label.textContent = '⚡';
    svg.appendChild(label);
    this._staminaEl.appendChild(svg);
    this._staminaSvg = svg;
    this._container.appendChild(this._staminaEl);
  }

  _buildBossBar() {
    this._bossBarEl = document.createElement('div');
    Object.assign(this._bossBarEl.style, {
      position    : 'absolute',
      top         : '12px',
      left        : '50%',
      transform   : 'translateX(-50%)',
      width       : '50vw',
      maxWidth    : '280px',
      background  : 'rgba(0,0,0,0.7)',
      border      : '1px solid rgba(180,100,255,0.3)',
      borderRadius: '6px',
      padding     : '6px 10px',
      display     : 'none',
    });
    this._bossNameEl = document.createElement('div');
    Object.assign(this._bossNameEl.style, {
      color        : '#cc88ff',
      fontSize     : '10px',
      fontFamily   : 'monospace',
      marginBottom : '4px',
      letterSpacing: '2px',
      textAlign    : 'center',
    });
    this._bossNameEl.textContent = 'JEFE';
    const track = document.createElement('div');
    Object.assign(track.style, {
      width       : '100%',
      height      : '10px',
      background  : '#333',
      borderRadius: '4px',
      overflow    : 'hidden',
    });
    this._bossFillEl = document.createElement('div');
    Object.assign(this._bossFillEl.style, {
      height    : '100%',
      width     : '100%',
      background: 'linear-gradient(90deg,#7700cc,#cc44ff)',
      transition: 'width 0.15s ease',
    });
    this._bossTextEl = document.createElement('div');
    Object.assign(this._bossTextEl.style, {
      color     : '#aaa',
      fontSize  : '9px',
      fontFamily: 'monospace',
      marginTop : '3px',
      textAlign : 'right',
    });
    track.appendChild(this._bossFillEl);
    this._bossBarEl.appendChild(this._bossNameEl);
    this._bossBarEl.appendChild(track);
    this._bossBarEl.appendChild(this._bossTextEl);
    this._container.appendChild(this._bossBarEl);
  }

  _buildCollectBtn() {
    this._collectBtn = document.createElement('button');
    Object.assign(this._collectBtn.style, {
      position      : 'fixed',
      bottom        : '200px',
      left          : '50%',
      transform     : 'translateX(-50%)',
      display       : 'none',
      alignItems    : 'center',
      justifyContent: 'center',
      fontFamily    : "'Cinzel',serif",
      fontSize      : '12px',
      letterSpacing : '2px',
      color         : '#c9a84c',
      background    : 'rgba(10,8,20,0.92)',
      border        : '1px solid rgba(201,168,76,0.4)',
      borderRadius  : '24px',
      padding       : '10px 24px',
      cursor        : 'pointer',
      pointerEvents : 'all',
      zIndex        : '150',
      boxShadow     : '0 2px 12px rgba(0,0,0,0.5)',
      transition    : 'transform 0.1s',
      whiteSpace    : 'nowrap',
    });
    this._collectBtn.addEventListener('touchstart', e => { e.preventDefault(); this._onCollect(); }, { passive: false });
    this._collectBtn.addEventListener('click', () => this._onCollect());
    document.body.appendChild(this._collectBtn);
  }

  _buildPlayerBlock() {
    const block = document.createElement('div');
    Object.assign(block.style, {
      position     : 'absolute',
      bottom       : '18px',
      left         : '50%',
      transform    : 'translateX(-50%)',
      display      : 'flex',
      flexDirection: 'column',
      gap          : '5px',
      width        : '32vw',
      maxWidth     : '200px',
      minWidth     : '140px',
    });

    // Nombre del personaje activo
    this._playerHpName = document.createElement('div');
    Object.assign(this._playerHpName.style, {
      color        : '#88aaff',
      fontSize     : '8px',
      fontFamily   : 'monospace',
      textAlign    : 'center',
      letterSpacing: '2px',
    });
    this._playerHpName.textContent = 'KAEL';

    const hpWrap  = this._makeBarWrap('rgba(255,50,50,0.15)', 'rgba(255,80,80,0.3)');
    const hpTrack = this._makeTrack('10px', '#220000');
    this._playerHpFill = this._makeFill('linear-gradient(90deg,#aa0000,#ff4444)');
    hpTrack.appendChild(this._playerHpFill);
    this._playerHpText = document.createElement('div');
    Object.assign(this._playerHpText.style, {
      color        : 'rgba(255,180,180,0.9)',
      fontSize     : '8px',
      fontFamily   : 'monospace',
      textAlign    : 'center',
      marginTop    : '2px',
      letterSpacing: '0.5px',
    });
    this._playerHpText.textContent = '100/100';
    hpWrap.appendChild(hpTrack);
    hpWrap.appendChild(this._playerHpText);

    const enWrap  = this._makeBarWrap('rgba(50,100,255,0.1)', 'rgba(80,130,255,0.25)');
    const enTrack = this._makeTrack('7px', '#1a1a2e');
    this._energyFill = this._makeFill('linear-gradient(90deg,#2244cc,#66aaff)');
    enTrack.appendChild(this._energyFill);
    const enText = document.createElement('div');
    Object.assign(enText.style, {
      color        : 'rgba(150,180,255,0.7)',
      fontSize     : '7px',
      fontFamily   : 'monospace',
      textAlign    : 'center',
      marginTop    : '2px',
      letterSpacing: '0.5px',
    });
    enText.textContent = 'ENERGÍA';
    enWrap.appendChild(enTrack);
    enWrap.appendChild(enText);

    block.appendChild(this._playerHpName);
    block.appendChild(hpWrap);
    block.appendChild(enWrap);
    this._container.appendChild(block);
  }

  _makeBarWrap(bg, border) {
    const w = document.createElement('div');
    Object.assign(w.style, {
      background  : 'rgba(0,0,0,0.75)',
      border      : `1px solid ${border}`,
      borderRadius: '4px',
      padding     : '3px 7px',
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

  _updateEnergy(energy, maxEnergy) {
    const pct = Math.max(0, energy / maxEnergy) * 100;
    this._energyFill.style.width = `${pct}%`;
  }
}
