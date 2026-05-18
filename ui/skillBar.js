// ui/skillBar.js — Ashes of the Reborn | Valiant Gaming
import { RARITY_COLORS } from '../core/skillData.js';

const RARITY_LABELS = { common:'C', rare:'R', epic:'E', legendary:'L' };

// Coordenadas base HUD designer (800×450) → se escalan al tamaño real
const BASE_W = 800;
const BASE_H = 450;

export class SkillBar {
  constructor(skillSystem, progression) {
    this.skillSystem = skillSystem;
    this.progression = progression;
    this._weapon    = null;
    this._buttons   = [];
    this._attackBtn = null;
    this._sprintBtn = null;
    this._parryBtn  = null;
    this._buildBtn  = null;
    this._container = null;
    this._cooldowns = {};
    this._enemyNear = false;

    this._build();
    window.addEventListener('resize', () => this._rebuild());

    // Revisar enemigos cercanos cada 500ms
    setInterval(() => this._checkEnemyProximity(), 500);
  }

  // ── API pública ──────────────────────────────────────────────────────────

  setWeapon(type)  { this._weapon = type; this.refresh(); }

  setWeaponIcon(type) {
    const icons = { katana:'🗡️', sword:'⚔️', magic:'🔮', bow:'🏹' };
    if (this._attackBtn) this._attackBtn.textContent = icons[type] ?? '⚔️';
  }

  refresh() {
    if (!this._weapon) return;
    const skills = this.progression.getActiveSkills(this._weapon).slice(0, 3);
    skills.forEach((sk, i) => this._updateButton(i, sk));
    for (let i = skills.length; i < this._buttons.length; i++) {
      this._buttons[i].style.display = 'none';
    }
  }

  setCooldown(skillId, progress) {
    this._cooldowns[skillId] = progress;
    const btn = this._buttons.find(b => b.dataset.skillId === skillId);
    if (btn) this._applyCooldown(btn, progress);
  }

  show() { if (this._container) this._container.style.display = 'block'; }
  hide() { if (this._container) this._container.style.display = 'none'; }

  // ── Detección de enemigos ────────────────────────────────────────────────

  _checkEnemyProximity() {
    const playerPos = window._player?.root?.position;
    const enemies   = window._combat?._enemies ?? [];
    if (!playerPos) return;

    let near = false;
    for (const e of enemies) {
      if (!e.mesh || e.isDead?.()) continue;
      if (e.mesh.position.distanceTo(playerPos) < 12) { near = true; break; }
    }

    if (near !== this._enemyNear) {
      this._enemyNear = near;
      this._updateActionBtn();
    }
  }

  _updateActionBtn() {
    if (!this._sprintBtn) return;
    if (this._enemyNear) {
      this._sprintBtn.textContent   = '🛡️';
      this._sprintBtn.style.borderColor = 'rgba(201,168,76,0.7)';
      this._sprintBtn.title = 'Parry';
    } else {
      this._sprintBtn.textContent   = '🏃';
      this._sprintBtn.style.borderColor = 'rgba(100,220,255,0.5)';
      this._sprintBtn.title = 'Sprint';
    }
  }

  // ── Build ────────────────────────────────────────────────────────────────

  _rebuild() {
    try {
      if (this._container) this._container.remove();
      this._buttons   = [];
      this._attackBtn = null;
      this._sprintBtn = null;
      this._parryBtn  = null;
      this._buildBtn  = null;
      this._build();
      if (this._weapon) this.refresh();
      this.show();
    } catch(e) {
      console.error('[SkillBar._rebuild]', e);
    }
  }

  // Convierte coordenadas del HUD designer (800×450) a px reales
  _px(x, y) {
    const sw = window.innerWidth;
    const sh = window.innerHeight;
    return {
      left  : Math.round((x / BASE_W) * sw),
      top   : Math.round((y / BASE_H) * sh),
    };
  }

  // Tamaño base escalado
  _sz(baseSize) {
    const ref = Math.min(window.innerWidth, window.innerHeight);
    return Math.round(ref * baseSize);
  }

  _build() {
    // Contenedor fixed que cubre toda la pantalla
    this._container = document.createElement('div');
    Object.assign(this._container.style, {
      position     : 'fixed',
      inset        : '0',
      display      : 'none',
      pointerEvents: 'none',
      zIndex       : '120',
    });
    document.body.appendChild(this._container);

    const atkSize  = this._sz(0.19);  // ataque grande
    const skSize   = this._sz(0.12);  // habilidades
    const sbSize   = this._sz(0.10);  // sprint/parry/build
    const fontSize = (s) => `${Math.round(s * 0.42)}px`;

    // ── Habilidad 1 — x:558 y:403 ────────────────────────────────────────
    const sk1 = this._buildSkillBtn(skSize);
    this._placeBtn(sk1, 558, 403, skSize);
    this._buttons.push(sk1);
    this._container.appendChild(sk1);

    // ── Habilidad 2 — x:584 y:313 ────────────────────────────────────────
    const sk2 = this._buildSkillBtn(skSize);
    this._placeBtn(sk2, 584, 313, skSize);
    this._buttons.push(sk2);
    this._container.appendChild(sk2);

    // ── Habilidad 3 — x:668 y:263 ────────────────────────────────────────
    const sk3 = this._buildSkillBtn(skSize);
    this._placeBtn(sk3, 668, 263, skSize);
    this._buttons.push(sk3);
    this._container.appendChild(sk3);

    // ── Ataque básico — x:679 y:379 ──────────────────────────────────────
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
    this._placeBtn(this._attackBtn, 679, 379, atkSize);
    const onAtk = (e) => {
      e.preventDefault();
      window._combat?.triggerAttack?.();
      this._attackBtn.style.transform = 'scale(0.88)';
      setTimeout(() => this._attackBtn.style.transform = 'scale(1)', 140);
    };
    this._attackBtn.addEventListener('touchstart', onAtk, { passive: false });
    this._attackBtn.addEventListener('mousedown',  onAtk);
    this._container.appendChild(this._attackBtn);

    // ── Sprint/Parry — x:755 y:302 ───────────────────────────────────────
    this._sprintBtn = this._buildSmallBtn('🏃', sbSize, 'rgba(100,220,255,0.5)');
    this._placeBtn(this._sprintBtn, 755, 302, sbSize);
    this._sprintBtn.addEventListener('touchstart', (e) => {
      e.preventDefault();
      if (this._enemyNear) {
        window._parry?.attemptParry?.();
        this._sprintBtn.style.transform = 'scale(0.88)';
        setTimeout(() => this._sprintBtn.style.transform = 'scale(1)', 180);
      } else {
        window._player?.setSprinting?.(true);
        this._sprintBtn.style.borderColor = 'rgba(100,220,255,0.9)';
        this._sprintBtn.style.transform   = 'scale(0.92)';
      }
    }, { passive: false });
    this._sprintBtn.addEventListener('touchend', () => {
      if (!this._enemyNear) {
        window._player?.setSprinting?.(false);
        this._sprintBtn.style.borderColor = 'rgba(100,220,255,0.5)';
        this._sprintBtn.style.transform   = 'scale(1)';
      }
    });
    this._container.appendChild(this._sprintBtn);

    // ── Construcción 🏗️ — arriba de sprint (~x:755 y:220) ────────────────
    this._buildBtn = this._buildSmallBtn('🏗️', sbSize, 'rgba(201,168,76,0.5)');
    this._placeBtn(this._buildBtn, 755, 215, sbSize);
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
  }

  // Posiciona un botón usando coordenadas HUD designer
  _placeBtn(el, hx, hy, size) {
    const sw = window.innerWidth;
    const sh = window.innerHeight;
    const left = Math.round((hx / BASE_W) * sw) - size / 2;
    const top  = Math.round((hy / BASE_H) * sh) - size / 2;
    el.style.left = `${left}px`;
    el.style.top  = `${top}px`;
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
    icon.style.cssText = `font-size:${Math.round(size*0.45)}px;line-height:1;`;

    const rarity = document.createElement('div');
    rarity.className = 'skill-rarity';
    rarity.style.cssText = 'position:absolute;top:2px;left:4px;font-size:7px;font-family:monospace;font-weight:bold;';

    const cooldown = document.createElement('div');
    cooldown.className = 'skill-cooldown';
    cooldown.style.cssText = 'position:absolute;bottom:0;left:0;width:100%;height:0%;background:rgba(0,0,0,0.65);transition:height 0.1s linear;pointer-events:none;';

    wrap.appendChild(icon);
    wrap.appendChild(rarity);
    wrap.appendChild(cooldown);

    const onPress = (e) => {
      e.preventDefault();
      if (!wrap.dataset.skillId) return;
      this.skillSystem.castSkill(wrap.dataset.skillId);
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
    btn.querySelector('.skill-icon').textContent = skill.icon;
    const r = btn.querySelector('.skill-rarity');
    r.textContent = RARITY_LABELS[skill.rarity];
    r.style.color = RARITY_COLORS[skill.rarity];
    btn.style.display     = 'flex';
    btn.style.borderColor = skill.available ? RARITY_COLORS[skill.rarity] : 'rgba(255,255,255,0.1)';
    btn.style.opacity     = skill.available ? '1' : '0.4';
    this._applyCooldown(btn, this._cooldowns[skill.id] ?? 1);
  }

  _applyCooldown(btn, progress) {
    const el = btn.querySelector('.skill-cooldown');
    if (el) el.style.height = `${(1 - progress) * 100}%`;
    if (btn.style.opacity !== '0.4') {
      btn.style.opacity = progress < 1 ? '0.55' : '1';
    }
  }
}
