// ui/skillBar.js — Ashes of the Reborn | Valiant Gaming

import { activateRelic, isRelicActive, getRelicCooldownPct, getEquippedRelic } from '../core/relics.js';

const BASE_W = 800;
const BASE_H = 450;

const LAYER_COLORS = {
  basico: 'rgba(200,200,200,0.6)',
  medio : 'rgba(100,180,255,0.8)',
  arcano: 'rgba(180,80,255,0.9)',
};

export class SkillBar {
  constructor(skillSystem, progression) {
    this.skillSystem        = skillSystem;
    this.progression        = progression;
    this._activeSkillSystem = skillSystem;
    this._activeProgression = progression;
    this._activeCharId      = 'kael';
    this._weapon            = null;
    this._activeWeapon      = null;
    this._buttons           = [];
    this._attackBtn         = null;
    this._sprintBtn         = null;
    this._buildBtn          = null;
    this._jumpBtn           = null;
    this._relicBtn          = null;
    this._container         = null;
    this._cooldowns         = {};
    this._enemyNear         = false;
    this._sprinting         = false;
    this._visible           = false;

    this._build();
    this._resizeHandler = () => this._rebuild();
    window.addEventListener('resize', this._resizeHandler);
    this._proximityInterval   = setInterval(() => this._checkEnemyProximity(), 500);
    this._relicUpdateInterval = setInterval(() => this._updateRelicBtn(), 100);
  }

  setWeapon(type) {
    this._weapon       = type;
    this._activeWeapon = type;
    this.refresh();
  }

  setWeaponIcon(type) {
    const icons = { katana:'🗡️', sword:'⚔️', magic:'🔮', bow:'🏹' };
    if (this._attackBtn) this._attackBtn.textContent = icons[type] ?? '⚔️';
  }

  setActiveCharacter(idx, mikaSkillSystem, mikaProgression) {
    if (idx === 1 && mikaSkillSystem) {
      this._activeSkillSystem = mikaSkillSystem;
      this._activeWeapon      = 'bow';
      this._activeCharId      = 'mika';
      this._activeProgression = mikaProgression ?? this.progression;
      if (this._attackBtn) this._attackBtn.textContent = '🏹';

      const MIKA_SKILLS = window._MIKA_SKILLS ?? [];
      MIKA_SKILLS.forEach((sk, i) => {
        this._updateButton(i, sk);
        this._buttons[i].style.display = 'flex';
      });
      for (let i = MIKA_SKILLS.length; i < this._buttons.length; i++) {
        this._buttons[i].style.display = 'none';
      }
    } else {
      this._activeSkillSystem = this.skillSystem;
      this._activeWeapon      = this._weapon;
      this._activeCharId      = 'kael';
      this._activeProgression = this.progression;
      const icons = { katana:'🗡️', sword:'⚔️', magic:'🔮', bow:'🏹' };
      if (this._attackBtn) this._attackBtn.textContent = icons[this._weapon] ?? '⚔️';
      this.refresh();
    }
    this._updateActionBtn();
  }

  refresh() {
    const weapon = this._activeWeapon ?? this._weapon;
    const prog   = this._activeProgression ?? this.progression;
    const charId = this._activeCharId ?? 'kael';
    if (!weapon) return;

    const skills = prog.getActiveLoadoutSkills
      ? prog.getActiveLoadoutSkills(charId, weapon)
      : prog.getActiveSkills(weapon);

    skills.forEach((sk, i) => {
      this._updateButton(i, sk);
      this._buttons[i].style.display = 'flex';
    });
    for (let i = skills.length; i < this._buttons.length; i++) {
      this._buttons[i].style.display = 'none';
    }
  }

  setCooldown(skillId, progress) {
    this._cooldowns[skillId] = progress;
    const btn = this._buttons.find(b => b.dataset.skillId === skillId);
    if (btn) this._applyCooldown(btn, progress);
  }

  show() {
    if (this._container) {
      this._container.style.display = 'block';
      this._visible = true;
    }
  }

  hide() {
    if (this._container) {
      this._container.style.display = 'none';
      this._visible = false;
    }
  }

  destroy() {
    clearInterval(this._proximityInterval);
    clearInterval(this._relicUpdateInterval);
    window.removeEventListener('resize', this._resizeHandler);
    this._container?.remove();
  }

  _checkEnemyProximity() {
    const playerPos = window._player?.root?.position;
    const enemies   = window._enemies ?? [];
    if (!playerPos) return;
    let near = false;
    for (const e of enemies) {
      if (!e.mesh || e.isDead?.()) continue;
      if (e.mesh.position.distanceTo(playerPos) < 12) { near = true; break; }
    }
    if (near !== this._enemyNear) {
      this._enemyNear = near;
      if (near) window._tutorial?.notifyNearEnemy?.();   
      this._updateActionBtn();
    }
  }

  _updateActionBtn() {
    if (!this._sprintBtn) return;
    if (this._sprinting) return;
    this._sprintBtn.textContent       = '🏃';
    this._sprintBtn.style.borderColor = 'rgba(100,220,255,0.5)';
    this._sprintBtn.title             = 'Sprint';
  }

  // ── Reliquia: aparece/desaparece según estado ───────────────────────────
  _updateRelicBtn() {
    if (!this._relicBtn) return;

    const charId = this._activeCharId ?? 'kael';
    const relic  = getEquippedRelic(charId);

    // Sin reliquia equipada: el botón no se muestra
    if (!relic) {
      this._relicBtn.style.display = 'none';
      return;
    }
    window._tutorial?.notifyHasRelic?.();   //
    // Activa: el botón desaparece por completo durante los 7s de efecto
    if (isRelicActive(charId)) {
      this._relicBtn.style.display = 'none';
      return;
    }

    // En cooldown o lista: visible, con overlay de progreso
    this._relicBtn.style.display = 'flex';
    const pct = getRelicCooldownPct(charId); // 0 a 1, 1 = lista
    const overlay = this._relicBtn.querySelector('.relic-cooldown');
    if (overlay) overlay.style.height = `${(1 - pct) * 100}%`;
    this._relicBtn.style.opacity = pct < 1 ? '0.55' : '1';
  }

  _rebuild() {
    try {
      const wasVisible = this._visible;
      if (this._container) this._container.remove();
      this._buttons   = [];
      this._attackBtn = null;
      this._sprintBtn = null;
      this._buildBtn  = null;
      this._jumpBtn   = null;
      this._relicBtn  = null;
      this._build();
      if (this._weapon || this._activeWeapon) this.refresh();
      this._updateActionBtn();
      if (wasVisible) this.show();
    } catch(e) {
      console.error('[SkillBar._rebuild]', e);
    }
  }

  _scale() {
    const uiScale = window._uiScale ?? 1;
    const isPC    = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    if (isPC) return 0.75 * uiScale;
    const isLandscape = window.innerWidth > window.innerHeight;
    return (isLandscape
      ? window.innerHeight / 450
      : window.innerWidth  / 480) * uiScale;
  }

  _placeFromBottomRight(el, hx, hy, size) {
    const s      = this._scale();
    const right  = Math.round((BASE_W - hx) * s) - size / 2;
    const bottom = Math.round((BASE_H - hy) * s) - size / 2;
    el.style.right  = `${right}px`;
    el.style.bottom = `${bottom}px`;
    el.style.left   = 'auto';
    el.style.top    = 'auto';
  }

  _sz(baseSize) {
    return Math.round(this._scale() * baseSize);
  }

  _build() {
    this._container = document.createElement('div');
    Object.assign(this._container.style, {
      position     : 'fixed',
      inset        : '0',
      display      : 'none',
      pointerEvents: 'none',
      zIndex       : '120',
    });
    document.body.appendChild(this._container);

    const atkSize = this._sz(85);
    const skSize  = this._sz(58);
    const sbSize  = this._sz(48);

    const sk1 = this._buildSkillBtn(skSize);
    this._placeFromBottomRight(sk1, 558, 403, skSize);
    this._buttons.push(sk1);
    this._container.appendChild(sk1);

    const sk2 = this._buildSkillBtn(skSize);
    this._placeFromBottomRight(sk2, 584, 313, skSize);
    this._buttons.push(sk2);
    this._container.appendChild(sk2);

    const sk3 = this._buildSkillBtn(skSize);
    this._placeFromBottomRight(sk3, 668, 263, skSize);
    this._buttons.push(sk3);
    this._container.appendChild(sk3);

    // Botón ataque principal
    this._attackBtn = document.createElement('button');
    this._attackBtn.textContent = '⚔️';
    Object.assign(this._attackBtn.style, {
      position      : 'fixed',
      width         : `${atkSize}px`,
      height        : `${atkSize}px`,
      borderRadius  : '50%',
      border        : '3px solid rgba(255,200,80,0.9)',
      background    : 'radial-gradient(circle at 35% 35%, rgba(220,100,40,0.95), rgba(140,40,10,0.95))',
      color         : '#fff',
      fontSize      : `${Math.round(atkSize * 0.38)}px`,
      cursor        : 'pointer',
      pointerEvents : 'all',
      display       : 'flex',
      alignItems    : 'center',
      justifyContent: 'center',
      WebkitTapHighlightColor: 'transparent',
      boxShadow     : '0 0 24px rgba(255,120,40,0.7), inset 0 1px 0 rgba(255,255,255,0.2)',
      transition    : 'transform 0.08s',
      zIndex        : '121',
    });
    this._placeFromBottomRight(this._attackBtn, 679, 379, atkSize);

    const onAtk = (e) => {
      e.preventDefault();
      window._combat?.triggerAttack?.();
      this._attackBtn.style.transform = 'scale(0.88)';
      setTimeout(() => this._attackBtn.style.transform = 'scale(1)', 140);
    };
    this._attackBtn.addEventListener('touchstart', onAtk, { passive: false });
    this._attackBtn.addEventListener('click', onAtk);
    this._container.appendChild(this._attackBtn);

    // Botón sprint
    this._sprintBtn = this._buildSmallBtn('🏃', sbSize, 'rgba(100,220,255,0.5)');
    this._placeFromBottomRight(this._sprintBtn, 755, 302, sbSize);
    this._sprintBtn.addEventListener('touchstart', (e) => {
      e.preventDefault();
      this._sprinting = true;
      const activeChar = window._partyManager?.getActiveCharacter() ?? window._player;
      activeChar?.setSprinting?.(true);
      this._sprintBtn.style.borderColor = 'rgba(100,220,255,0.9)';
      this._sprintBtn.style.transform   = 'scale(0.92)';
    }, { passive: false });
    this._sprintBtn.addEventListener('touchend', () => {
      this._sprinting = false;
      const activeChar = window._partyManager?.getActiveCharacter() ?? window._player;
      activeChar?.setSprinting?.(false);
      this._sprintBtn.style.borderColor = 'rgba(100,220,255,0.5)';
      this._sprintBtn.style.transform   = 'scale(1)';
    });
    this._container.appendChild(this._sprintBtn);

    // Botón construcción
    this._buildBtn = this._buildSmallBtn('🏗️', sbSize, 'rgba(201,168,76,0.5)');
    this._placeFromBottomRight(this._buildBtn, 755, 215, sbSize);
    this._buildBtn.style.color = '#C9A84C';
    const onBuild = (e) => {
      e.preventDefault();
      window._buildMenu?.open?.();
      this._buildBtn.style.transform = 'scale(0.88)';
      setTimeout(() => this._buildBtn.style.transform = 'scale(1)', 140);
    };
    this._buildBtn.addEventListener('touchstart', onBuild, { passive: false });
    this._buildBtn.addEventListener('click', onBuild);
    this._container.appendChild(this._buildBtn);

    // Botón saltar
    this._jumpBtn = this._buildSmallBtn('⬆', sbSize, 'rgba(136,170,255,0.5)');
    this._placeFromBottomRight(this._jumpBtn, 755, 390, sbSize);
    const onJump = (e) => {
      e.preventDefault();
      const active = window._partyManager?.getActiveCharacter() ?? window._player;
      active?.jump?.();
      this._jumpBtn.style.transform = 'scale(0.88)';
      setTimeout(() => this._jumpBtn.style.transform = 'scale(1)', 140);
    };
    this._jumpBtn.addEventListener('touchstart', onJump, { passive: false });
    this._jumpBtn.addEventListener('click', onJump);
    this._container.appendChild(this._jumpBtn);

    // Botón reliquia
    this._relicBtn = this._buildSmallBtn('💠', skSize, 'rgba(180,80,255,0.5)');
    this._placeFromBottomRight(this._relicBtn, 600, 200, skSize);
    this._relicBtn.style.overflow = 'hidden';

    const relicCooldown = document.createElement('div');
    relicCooldown.className = 'relic-cooldown';
    relicCooldown.style.cssText = `
      position:absolute;bottom:0;left:0;
      width:100%;height:0%;
      background:rgba(0,0,0,0.65);
      transition:height 0.1s linear;
      pointer-events:none;
    `;
    this._relicBtn.appendChild(relicCooldown);

    const onRelic = (e) => {
      e.preventDefault();
      const charId = this._activeCharId ?? 'kael';
      const ok = activateRelic(charId);
      if (ok) {
        this._relicBtn.style.transform = 'scale(0.88)';
        setTimeout(() => this._relicBtn.style.transform = 'scale(1)', 140);
      }
    };
    this._relicBtn.addEventListener('touchstart', onRelic, { passive: false });
    this._relicBtn.addEventListener('click', onRelic);
    this._container.appendChild(this._relicBtn);
    this._updateRelicBtn();
  }

  _buildSmallBtn(icon, size, borderColor) {
    const btn = document.createElement('button');
    btn.textContent = icon;
    Object.assign(btn.style, {
      position      : 'fixed',
      width         : `${size}px`,
      height        : `${size}px`,
      borderRadius  : '50%',
      border        : `2px solid ${borderColor}`,
      background    : 'rgba(10,8,20,0.88)',
      color         : '#fff',
      fontSize      : `${Math.round(size * 0.4)}px`,
      cursor        : 'pointer',
      pointerEvents : 'all',
      display       : 'flex',
      alignItems    : 'center',
      justifyContent: 'center',
      WebkitTapHighlightColor: 'transparent',
      boxShadow     : '0 2px 8px rgba(0,0,0,0.5)',
      transition    : 'transform 0.08s, border-color 0.1s',
      zIndex        : '121',
    });
    return btn;
  }

  _buildSkillBtn(size) {
    const wrap = document.createElement('div');
    Object.assign(wrap.style, {
      position      : 'fixed',
      width         : `${size}px`,
      height        : `${size}px`,
      borderRadius  : '50%',
      border        : '2px solid rgba(255,255,255,0.15)',
      background    : 'rgba(12,10,22,0.88)',
      cursor        : 'pointer',
      pointerEvents : 'all',
      overflow      : 'hidden',
      WebkitTapHighlightColor: 'transparent',
      boxShadow     : '0 2px 10px rgba(0,0,0,0.6)',
      transition    : 'transform 0.08s',
      display       : 'none',
      alignItems    : 'center',
      justifyContent: 'center',
      zIndex        : '121',
    });

    const icon = document.createElement('div');
    icon.className = 'skill-icon';
    icon.style.cssText = `font-size:${Math.round(size * 0.45)}px;line-height:1;pointer-events:none;`;

    const layerDot = document.createElement('div');
    layerDot.className = 'skill-layer';
    layerDot.style.cssText = `
      position:absolute;bottom:3px;right:3px;
      width:6px;height:6px;border-radius:50%;
      background:rgba(200,200,200,0.6);
      pointer-events:none;
    `;

    const cooldown = document.createElement('div');
    cooldown.className = 'skill-cooldown';
    cooldown.style.cssText = `
      position:absolute;bottom:0;left:0;
      width:100%;height:0%;
      background:rgba(0,0,0,0.65);
      transition:height 0.1s linear;
      pointer-events:none;
    `;

    wrap.appendChild(icon);
    wrap.appendChild(layerDot);
    wrap.appendChild(cooldown);

    const onPress = (e) => {
      e.preventDefault();
      if (!wrap.dataset.skillId) return;
      const sys = this._activeSkillSystem ?? this.skillSystem;
      sys.castSkill?.(wrap.dataset.skillId);
      wrap.style.transform = 'scale(0.88)';
      setTimeout(() => wrap.style.transform = 'scale(1)', 140);
    };
    wrap.addEventListener('touchstart', onPress, { passive: false });
    wrap.addEventListener('mousedown',  onPress);
    return wrap;
  }

  _updateButton(index, skill) {
    const btn = this._buttons[index];
    if (!btn) return;
    btn.dataset.skillId = skill.id;
    btn.querySelector('.skill-icon').textContent = skill.icon ?? '✨';
    const layer      = skill.layer ?? 'basico';
    const layerColor = LAYER_COLORS[layer] ?? LAYER_COLORS.basico;
    btn.style.borderColor = layerColor;
    btn.style.opacity     = '1';
    const dot = btn.querySelector('.skill-layer');
    if (dot) dot.style.background = layerColor;
    this._applyCooldown(btn, this._cooldowns[skill.id] ?? 1);
  }

  _applyCooldown(btn, progress) {
    const el = btn.querySelector('.skill-cooldown');
    if (el) el.style.height = `${(1 - progress) * 100}%`;
    btn.style.opacity = progress < 1 ? '0.55' : '1';
  }
}
