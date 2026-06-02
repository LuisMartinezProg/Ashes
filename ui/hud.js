// ui/hud.js — Ashes of the Reborn | Valiant Gaming

export class HUD {
  constructor(combatSystem, skillSystem = null) {
    this.combat            = combatSystem;
    this.skills            = skillSystem;
    this._enemies          = [];
    this._enemyLabels      = new Map();
    this._bossBarEl        = null;
    this._bossFillEl       = null;
    this._bossTextEl       = null;
    this._bossNameEl       = null;
    this._playerHpFill     = null;
    this._playerHpText     = null;
    this._playerHpName     = null;
    this._levelLabel       = null;
    this._energyFill       = null;
    this._staminaEl        = null;
    this._staminaArc       = null;
    this._staminaHideTimer = null;
    this._container        = null;
    this._collectBtn       = null;
    this._camera           = null;
    this._partyEl          = null;
    this._partyManager     = null;

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
    this._onPartySwitch(0);
  }

  _buildParty() {
    this._partyEl = document.createElement('div');
    Object.assign(this._partyEl.style, {
      position     : 'fixed',
      right        : '8px',
      top          : '12px',
      display      : 'flex',
      flexDirection: 'column',
      gap          : '6px',
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
      flexDirection: 'row',
      alignItems   : 'center',
      gap          : '5px',
      cursor       : 'pointer',
      background   : 'rgba(0,0,0,0.5)',
      borderRadius : '20px',
      padding      : '3px 8px 3px 3px',
      border       : `1px solid ${active ? color + '88' : 'rgba(255,255,255,0.1)'}`,
      transition   : 'border 0.2s',
    });

    const avatar = document.createElement('div');
    Object.assign(avatar.style, {
      width         : active ? '36px' : '28px',
      height        : active ? '36px' : '28px',
      borderRadius  : '50%',
      background    : `radial-gradient(circle at 35% 35%, ${color}, ${color}66)`,
      border        : `2px solid ${active ? color : color + '44'}`,
      boxShadow     : active ? `0 0 8px ${color}88` : 'none',
      transition    : 'all 0.2s',
      display       : 'flex',
      alignItems    : 'center',
      justifyContent: 'center',
      fontSize      : active ? '14px' : '11px',
      position      : 'relative',
      flexShrink    : '0',
    });
    avatar.textContent = idx === 0 ? '⚔️' : '🏹';

    const info = document.createElement('div');
    Object.assign(info.style, {
      display      : 'flex',
      flexDirection: 'column',
      gap          : '2px',
      minWidth     : '44px',
    });

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
      width       : '44px',
      height      : '3px',
      background  : '#333',
      borderRadius: '2px',
      overflow    : 'hidden',
    });
    const hpFill = document.createElement('div');
    Object.assign(hpFill.style, {
      height    : '100%',
      width     : '100%',
      background: color,
      transition: 'width 0.2s ease',
    });
    hpTrack.appendChild(hpFill);
    info.appendChild(label);
    info.appendChild(hpTrack);

    const coolOverlay = document.createElement('div');
    Object.assign(coolOverlay.style, {
      position      : 'absolute',
      inset         : '0',
      borderRadius  : '50%',
      background    : 'rgba(0,0,0,0.6)',
      display       : 'none',
      alignItems    : 'center',
      justifyContent: 'center',
      fontSize      : '8px',
      color         : '#fff',
      fontFamily    : 'monospace',
    });
    avatar.appendChild(coolOverlay);

    wrap.appendChild(avatar);
    wrap.appendChild(info);

    const onTap = (e) => {
      e.preventDefault();
      if (!this._partyManager) return;
      if (this._partyManager.getActiveIdx() === idx) return;
      this._partyManager.switchCharacter();
    };
    wrap.addEventListener('touchstart', onTap, { passive: false });
    wrap.addEventListener('click',      onTap);

    return { wrap, avatar, label, hpFill, hpTrack, coolOverlay, info };
  }

  _onPartySwitch(idx) {
    const cards  = [this._p1Card, this._p2Card];
    const colors = ['#88aaff', '#ff88aa'];
    const names  = ['KAEL', 'MIKA'];

    if (window._skillBar) {
      const mikaSys  = this._partyManager?.companion?.skillSystem;
      const mikaProg = window._mikaProgression;
      window._skillBar.setActiveCharacter(idx, mikaSys, mikaProg);
    }

    cards.forEach((card, i) => {
      const active = i === idx;
      const color  = colors[i];
      card.avatar.style.width      = active ? '36px' : '28px';
      card.avatar.style.height     = active ? '36px' : '28px';
      card.avatar.style.fontSize   = active ? '14px' : '11px';
      card.avatar.style.border     = `2px solid ${active ? color : color + '44'}`;
      card.avatar.style.boxShadow  = active ? `0 0 8px ${color}88` : 'none';
      card.label.style.color       = active ? color : color + '88';
      card.wrap.style.border       = `1px solid ${active ? color + '88' : 'rgba(255,255,255,0.1)'}`;
    });

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

    // ── Color de barra HP y energía según personaje activo ────────────────
    if (this._playerHpFill) {
      this._playerHpFill.style.background = idx === 0
        ? 'linear-gradient(90deg,#aa0000,#ff4444)'
        : 'linear-gradient(90deg,#aa0044,#ff88aa)';
    }
    if (this._playerHpName) {
      this._playerHpName.textContent = names[idx];
      this._playerHpName.style.color = colors[idx];
    }
    if (this._energyFill) {
      this._energyFill.style.background = idx === 0
        ? 'linear-gradient(90deg,#2244cc,#66aaff)'
        : 'linear-gradient(90deg,#aa2266,#ff88aa)';
    }

    // ── Stamina solo visible para Kael ────────────────────────────────────
    if (this._staminaEl) {
      this._staminaEl.style.display = idx === 0 ? 'block' : 'none';
    }

    // ── Nivel del personaje activo ────────────────────────────────────────
    if (this._levelLabel) {
      const prog = idx === 0
        ? window._prog
        : window._mikaProgression;
      if (prog) this._levelLabel.textContent = `Nv.${prog.getLevel()}`;
    }

    // ── HP de la barra principal según personaje activo ───────────────────
    if (idx === 0) {
      const p = window._player;
      if (p) {
        const pct = Math.max(0, p.hp / p.maxHp) * 100;
        if (this._playerHpFill) this._playerHpFill.style.width = `${pct}%`;
        if (this._playerHpText) this._playerHpText.textContent = `${Math.ceil(p.hp)}/${p.maxHp}`;
      }
    } else {
      const m = this._partyManager?.companion;
      if (m) {
        const maxHp = (window._effectiveStatsMika ?? window._mikaProgression?.getStats())?.maxHp ?? m.maxHp;
        const pct   = Math.max(0, m.hp / maxHp) * 100;
        if (this._playerHpFill) this._playerHpFill.style.width = `${pct}%`;
        if (this._playerHpText) this._playerHpText.textContent = `${Math.ceil(m.hp)}/${maxHp}`;
      }
    }

    // ── Energía: Mika usa su propia progressionMika ───────────────────────
    if (idx === 1 && window._mikaProgression) {
      const mikaProg = window._mikaProgression;
      mikaProg.onEnergyUpdate = (e, max) => this._updateEnergy(e, max);
      const e   = mikaProg.getMagicEnergy();
      const max = Math.max(mikaProg.getSkillSlots() * 200, 200);
      this._updateEnergy(e, max);
    } else if (idx === 0 && this.skills) {
      this.skills.onEnergyUpdate = (e, max) => this._updateEnergy(e, max);
    }
  }

  _updateMikaHp(hp, max) {
    if (!this._p2Card) return;

    // Usar maxHp efectivo de Mika si está disponible
    const effectiveMax = (window._effectiveStatsMika ?? window._mikaProgression?.getStats())?.maxHp ?? max;
    const pct = Math.max(0, hp / effectiveMax) * 100;
    this._p2Card.hpFill.style.width = `${pct}%`;

    if (this._partyManager?.getActiveIdx() === 1) {
      if (this._playerHpFill) this._playerHpFill.style.width = `${pct}%`;
      if (this._playerHpText) this._playerHpText.textContent = `${Math.ceil(hp)}/${effectiveMax}`;
    }
  }

  updateProtagonistHp(hp, max) {
    if (!this._p1Card) return;
    const pct = Math.max(0, hp / max) * 100;
    this._p1Card.hpFill.style.width = `${pct}%`;
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
  show() { this._container.style.display = 'block'; }
  hide() { this._container.style.display = 'none'; }
  setWeaponIcon(type) {
    if (window._skillBar) window._skillBar.setWeaponIcon(type);
  }

  updatePlayerHp(hp, max) {
    if (!this._playerHpFill) return;
    // Actualizar barra principal solo si el personaje activo es Kael
    if (!this._partyManager || this._partyManager.getActiveIdx() === 0) {
      const pct = Math.max(0, hp / max) * 100;
      this._playerHpFill.style.width = `${pct}%`;
      if (this._playerHpText) this._playerHpText.textContent = `${Math.ceil(hp)}/${max}`;
    }
    // Siempre actualizar la mini-card de Kael
    this.updateProtagonistHp(hp, max);
  }

  updateLevel(level) {
    // Solo actualizar si Kael es el activo, o si no hay partyManager todavía
    if (!this._partyManager || this._partyManager.getActiveIdx() === 0) {
      if (this._levelLabel) this._levelLabel.textContent = `Nv.${level}`;
    }
  }

  // Llamar esto cuando Mika sube de nivel
  updateMikaLevel(level) {
    if (this._partyManager?.getActiveIdx() === 1) {
      if (this._levelLabel) this._levelLabel.textContent = `Nv.${level}`;
    }
  }

  updateStamina(stamina, max) {
    if (!this._staminaArc) return;
    const pct = Math.max(0, stamina / max);
    this._staminaArc.style.strokeDashoffset = `${this._ARC_LEN * (1 - pct)}`;
    const color = pct > 0.5 ? '#f5d442' : pct > 0.25 ? '#f5a623' : '#e74c3c';
    this._staminaArc.style.stroke = color;
    if (pct >= 1) {
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
    document.body.appendChild(this._container);
  }

  _buildPlayerBlock() {
    const block = document.createElement('div');
    Object.assign(block.style, {
      position     : 'absolute',
      bottom       : '14px',
      left         : '50%',
      transform    : 'translateX(-50%)',
      display      : 'flex',
      flexDirection: 'column',
      gap          : '4px',
      width        : '32vw',
      maxWidth     : '200px',
      minWidth     : '130px',
    });

    const nameRow = document.createElement('div');
    Object.assign(nameRow.style, {
      display       : 'flex',
      justifyContent: 'space-between',
      alignItems    : 'center',
    });

    this._playerHpName = document.createElement('div');
    Object.assign(this._playerHpName.style, {
      color        : '#88aaff',
      fontSize     : '8px',
      fontFamily   : 'monospace',
      letterSpacing: '2px',
    });
    this._playerHpName.textContent = 'KAEL';

    this._levelLabel = document.createElement('div');
    Object.assign(this._levelLabel.style, {
      color        : 'rgba(201,168,76,0.8)',
      fontSize     : '8px',
      fontFamily   : 'monospace',
      letterSpacing: '1px',
    });
    this._levelLabel.textContent = 'Nv.1';

    nameRow.append(this._playerHpName, this._levelLabel);
    block.appendChild(nameRow);

    const hpTrack = this._makeTrack('9px', '#220000');
    this._playerHpFill = this._makeFill('linear-gradient(90deg,#aa0000,#ff4444)');
    hpTrack.appendChild(this._playerHpFill);

    this._playerHpText = document.createElement('div');
    Object.assign(this._playerHpText.style, {
      color        : 'rgba(255,180,180,0.8)',
      fontSize     : '7px',
      fontFamily   : 'monospace',
      textAlign    : 'center',
      letterSpacing: '0.5px',
    });
    this._playerHpText.textContent = '100/100';

    const enTrack = this._makeTrack('5px', '#1a1a2e');
    this._energyFill = this._makeFill('linear-gradient(90deg,#2244cc,#66aaff)');
    enTrack.appendChild(this._energyFill);

    block.appendChild(hpTrack);
    block.appendChild(this._playerHpText);
    block.appendChild(enTrack);
    this._container.appendChild(block);
  }

  _buildStamina() {
    const size     = 52;
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
    bgArc.setAttribute('fill', 'none');
    bgArc.setAttribute('stroke', 'rgba(255,255,255,0.12)');
    bgArc.setAttribute('stroke-width', '3.5');
    bgArc.setAttribute('stroke-linecap', 'round');
    bgArc.style.strokeDasharray = `${arcLen} ${arcGap}`;
    bgArc.style.transformOrigin = 'center';
    bgArc.style.transform = `rotate(${rotStart}deg)`;
    svg.appendChild(bgArc);

    this._staminaArc = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    this._staminaArc.setAttribute('cx', size / 2);
    this._staminaArc.setAttribute('cy', size / 2);
    this._staminaArc.setAttribute('r',  r);
    this._staminaArc.setAttribute('fill', 'none');
    this._staminaArc.setAttribute('stroke', '#f5d442');
    this._staminaArc.setAttribute('stroke-width', '3.5');
    this._staminaArc.setAttribute('stroke-linecap', 'round');
    this._staminaArc.style.strokeDasharray  = `${arcLen} ${circ}`;
    this._staminaArc.style.strokeDashoffset = '0';
    this._staminaArc.style.transformOrigin  = 'center';
    this._staminaArc.style.transform        = `rotate(${rotStart}deg)`;
    this._staminaArc.style.transition       = 'stroke-dashoffset 0.15s linear, stroke 0.3s';
    svg.appendChild(this._staminaArc);

    const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    label.setAttribute('x', '50%');
    label.setAttribute('y', '50%');
    label.setAttribute('text-anchor', 'middle');
    label.setAttribute('dominant-baseline', 'middle');
    label.setAttribute('fill', '#f5d442');
    label.setAttribute('font-size', '13');
    label.setAttribute('font-family', 'monospace');
    label.textContent = '⚡';
    svg.appendChild(label);

    this._staminaEl.appendChild(svg);
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
      width: '100%', height: '10px', background: '#333',
      borderRadius: '4px', overflow: 'hidden',
    });
    this._bossFillEl = document.createElement('div');
    Object.assign(this._bossFillEl.style, {
      height: '100%', width: '100%',
      background: 'linear-gradient(90deg,#7700cc,#cc44ff)',
      transition: 'width 0.15s ease',
    });
    this._bossTextEl = document.createElement('div');
    Object.assign(this._bossTextEl.style, {
      color: '#aaa', fontSize: '9px', fontFamily: 'monospace',
      marginTop: '3px', textAlign: 'right',
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
      bottom        : '160px',
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

  _updateBossBar(e) {
    const pct = Math.max(0, e.hp / e.maxHp) * 100;
    this._bossFillEl.style.width = `${pct}%`;
    this._bossTextEl.textContent = `${Math.ceil(e.hp)} / ${e.maxHp}`;
    this._bossNameEl.textContent = e._config?.name ?? 'JEFE';
    this._bossFillEl.style.background = pct > 50
      ? 'linear-gradient(90deg,#7700cc,#cc44ff)'
      : pct > 25 ? 'linear-gradient(90deg,#cc6600,#ff9900)'
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
    if (pos.z > 1) { el.style.display = 'none'; return; }
    const x = (pos.x *  0.5 + 0.5) * window.innerWidth;
    const y = (pos.y * -0.5 + 0.5) * window.innerHeight;
    const pct = Math.max(0, e.hp / e.maxHp) * 100;
    el.querySelector('.ef').style.width = `${pct}%`;
    el.querySelector('.ef').style.background = pct > 50
      ? 'linear-gradient(90deg,#cc2222,#ff4444)'
      : pct > 25 ? 'linear-gradient(90deg,#cc6600,#ff9900)'
      : 'linear-gradient(90deg,#882200,#cc2200)';
    el.querySelector('.et').textContent = `${Math.ceil(e.hp)}/${e.maxHp}`;
    el.querySelector('.en').textContent = e._config?.name ?? 'Enemigo';
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
      position: 'fixed', transform: 'translateX(-50%)', display: 'none',
      flexDirection: 'column', alignItems: 'center', gap: '2px',
      pointerEvents: 'none', zIndex: '90', minWidth: '80px',
    });
    const name = document.createElement('div');
    name.className = 'en';
    Object.assign(name.style, {
      color: '#ffddaa', fontSize: '9px', fontFamily: 'monospace',
      letterSpacing: '1px', textShadow: '0 1px 3px #000', textAlign: 'center',
    });
    const track = document.createElement('div');
    Object.assign(track.style, {
      width: '80px', height: '6px', background: '#222',
      borderRadius: '3px', overflow: 'hidden',
      border: '1px solid rgba(255,255,255,0.15)',
    });
    const fill = document.createElement('div');
    fill.className = 'ef';
    Object.assign(fill.style, {
      height: '100%', width: '100%',
      background: 'linear-gradient(90deg,#cc2222,#ff4444)',
      transition: 'width 0.15s ease',
    });
    const text = document.createElement('div');
    text.className = 'et';
    Object.assign(text.style, {
      color: '#aaa', fontSize: '8px', fontFamily: 'monospace', textAlign: 'center',
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
      res.depleted = true; res.mesh.visible = false;
      this._hideCollectBtn();
      setTimeout(() => { res.hp = res.maxHp; res.depleted = false; res.mesh.visible = true; }, 30000);
    }
  }

  _showFloating(text, color = '#c9a84c') {
    const el = document.createElement('div');
    Object.assign(el.style, {
      position: 'fixed', left: '50%', bottom: '180px',
      transform: 'translateX(-50%)', fontFamily: "'Cinzel',serif",
      fontSize: '13px', letterSpacing: '2px', color,
      pointerEvents: 'none', zIndex: '300',
      transition: 'bottom 0.8s ease, opacity 0.8s ease', opacity: '1',
    });
    el.textContent = text;
    document.body.appendChild(el);
    requestAnimationFrame(() => requestAnimationFrame(() => {
      el.style.bottom = '240px'; el.style.opacity = '0';
    }));
    setTimeout(() => el.remove(), 900);
  }

  _makeTrack(height, bg) {
    const t = document.createElement('div');
    Object.assign(t.style, {
      width: '100%', height, background: bg,
      borderRadius: '4px', overflow: 'hidden',
    });
    return t;
  }

  _makeFill(gradient) {
    const f = document.createElement('div');
    Object.assign(f.style, {
      height: '100%', width: '100%',
      background: gradient, transition: 'width 0.2s ease',
    });
    return f;
  }

  _updateEnergy(energy, maxEnergy) {
    if (!this._energyFill) return;
    const pct = Math.max(0, energy / maxEnergy) * 100;
    this._energyFill.style.width = `${pct}%`;
  }

  addMikaEnergy(amount) {
    if (this._mikaEnergy === undefined) return;
    this._mikaEnergy = Math.min(this._mikaEnergyMax, this._mikaEnergy + amount);
    if (window._partyManager?.getActiveIdx() === 1) {
      this._updateEnergy(this._mikaEnergy, this._mikaEnergyMax);
    }
  }
}
