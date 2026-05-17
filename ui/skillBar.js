style.opacity = progress < 1 ? '0.55' : '1';
    }
  }
}
// ui/skillBar.js — Ashes of the Reborn | Valiant Gaming
import { RARITY_COLORS } from '../core/skillData.js';

const RARITY_LABELS = { common:'C', rare:'R', epic:'E', legendary:'L' };

export class SkillBar {
  constructor(skillSystem, progression) {
    this.skillSystem = skillSystem;
    this.progression = progression;
    this._weapon    = null;
    this._buttons   = [];
    this._attackBtn = null;
    this._sprintBtn = null;
    this._parryBtn  = null;
    this._container = null;
    this._cooldowns = {};
    this._build();
    window.addEventListener('resize', () => this._rebuild());
  }

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

  _rebuild() {
    try {
      if (this._container) this._container.remove();
      this._buttons   = [];
      this._attackBtn = null;
      this._sprintBtn = null;
      this._parryBtn  = null;
      this._build();
      if (this._weapon) this.refresh();
      this.show();
    } catch(e) {
      console.error('[SkillBar._rebuild]', e);
    }
  }

  _sizes() {
    const ref = Math.min(window.innerWidth, window.innerHeight);
    return {
      atk : Math.round(ref * 0.20),  // botón ataque
      sk  : Math.round(ref * 0.13),  // botones habilidad
      sb  : Math.round(ref * 0.11),  // sprint/parry
      gap : Math.round(ref * 0.022),
      mb  : Math.round(ref * 0.035),
      mr  : Math.round(ref * 0.025),
    };
  }

  _build() {
    const { atk, sk, sb, gap, mb, mr } = this._sizes();

    // ── Contenedor raíz ───────────────────────────────────────────────────
    this._container = document.createElement('div');
    Object.assign(this._container.style, {
      position     : 'fixed',
      bottom       : `${mb}px`,
      right        : `${mr}px`,
      display      : 'none',
      pointerEvents: 'none',
      zIndex       : '120',
    });

    // ── Panel radial SVG de fondo ─────────────────────────────────────────
    const panelSize = atk * 3.2;
    const panel = document.createElement('div');
    Object.assign(panel.style, {
      position      : 'relative',
      width         : `${panelSize}px`,
      height        : `${panelSize}px`,
    });

    // Fondo semicírculo oscuro
    const bg = document.createElement('div');
    Object.assign(bg.style, {
      position     : 'absolute',
      inset        : '0',
      borderRadius : '50%',
      background   : 'radial-gradient(circle at 60% 60%, rgba(10,8,20,0.7), rgba(4,4,10,0.4))',
      border       : '1px solid rgba(201,168,76,0.1)',
    });
    panel.appendChild(bg);

    // Centro del panel
    const cx = panelSize * 0.58;
    const cy = panelSize * 0.58;

    // ── Botón ATAQUE — centro ─────────────────────────────────────────────
    this._attackBtn = document.createElement('button');
    this._attackBtn.textContent = '⚔️';
    Object.assign(this._attackBtn.style, {
      position      : 'absolute',
      width         : `${atk}px`,
      height        : `${atk}px`,
      left          : `${cx - atk/2}px`,
      top           : `${cy - atk/2}px`,
      borderRadius  : '50%',
      border        : '3px solid rgba(255,200,80,0.9)',
      background    : 'radial-gradient(circle at 35% 35%, rgba(220,100,40,0.95), rgba(140,40,10,0.95))',
      color         : '#fff',
      fontSize      : `${Math.round(atk * 0.38)}px`,
      cursor        : 'pointer',
      pointerEvents : 'all',
      display       : 'flex',
      alignItems    : 'center',
      justifyContent: 'center',
      WebkitTapHighlightColor: 'transparent',
      boxShadow     : '0 0 24px rgba(255,120,40,0.7), inset 0 1px 0 rgba(255,255,255,0.2)',
      transition    : 'transform 0.08s',
      zIndex        : '2',
    });
    const onAtk = (e) => {
      e.preventDefault();
      window._combat?.triggerAttack?.();
      this._attackBtn.style.transform = 'scale(0.88)';
      setTimeout(() => this._attackBtn.style.transform = 'scale(1)', 140);
    };
    this._attackBtn.addEventListener('touchstart', onAtk, { passive: false });
    this._attackBtn.addEventListener('mousedown',  onAtk);
    panel.appendChild(this._attackBtn);

    // ── Posiciones radiales para las 3 habilidades ────────────────────────
    // Arriba-izquierda, izquierda-centro, abajo-izquierda
    const skillRadius = atk * 1.08;
    const skillAngles = [-130, 180, -210]; // grados desde centro

    for (let i = 0; i < 3; i++) {
      const btn = this._buildSkillBtn(sk);
      const rad = skillAngles[i] * Math.PI / 180;
      const bx  = cx + Math.cos(rad) * skillRadius - sk/2;
      const by  = cy + Math.sin(rad) * skillRadius - sk/2;
      btn.style.position = 'absolute';
      btn.style.left     = `${bx}px`;
      btn.style.top      = `${by}px`;
      this._buttons.push(btn);
      panel.appendChild(btn);
    }

    // ── Botón CONSTRUCCIÓN — arriba del ataque ────────────────────────────
    const buildRadius = atk * 1.1;
    const buildAngle  = -90 * Math.PI / 180; // arriba
    const bldX = cx + Math.cos(buildAngle) * buildRadius - sk/2;
    const bldY = cy + Math.sin(buildAngle) * buildRadius - sk/2;

    const buildBtn = document.createElement('button');
    buildBtn.textContent = '🏗';
    Object.assign(buildBtn.style, {
      position      : 'absolute',
      left          : `${bldX}px`,
      top           : `${bldY}px`,
      width         : `${sk}px`,
      height        : `${sk}px`,
      borderRadius  : '50%',
      border        : '2px solid rgba(201,168,76,0.6)',
      background    : 'rgba(10,8,20,0.88)',
      color         : '#C9A84C',
      fontSize      : `${Math.round(sk * 0.42)}px`,
      cursor        : 'pointer',
      pointerEvents : 'all',
      display       : 'flex',
      alignItems    : 'center',
      justifyContent: 'center',
      WebkitTapHighlightColor: 'transparent',
      boxShadow     : '0 2px 10px rgba(0,0,0,0.5)',
      transition    : 'transform 0.08s',
      zIndex        : '2',
    });
    const onBuild = (e) => {
      e.preventDefault();
      window._buildMenu?.open?.() ?? window._building && console.log('[Build] abre menú');
      buildBtn.style.transform = 'scale(0.88)';
      setTimeout(() => buildBtn.style.transform = 'scale(1)', 140);
    };
    buildBtn.addEventListener('touchstart', onBuild, { passive: false });
    buildBtn.addEventListener('click', onBuild);
    panel.appendChild(buildBtn);
    this._buildBtn = buildBtn;

    // ── SPRINT — derecha arriba ───────────────────────────────────────────
    const sprintAngle = -40 * Math.PI / 180;
    const sprintR     = atk * 1.05;
    const spX = cx + Math.cos(sprintAngle) * sprintR - sb/2;
    const spY = cy + Math.sin(sprintAngle) * sprintR - sb/2;

    this._sprintBtn = this._buildSmallBtn('🏃', sb, 'rgba(100,220,255,0.5)', spX, spY);
    this._sprintBtn.addEventListener('touchstart', (e) => {
      e.preventDefault();
      window._player?.setSprinting?.(true);
      this._sprintBtn.style.borderColor = 'rgba(100,220,255,0.9)';
      this._sprintBtn.style.transform   = 'scale(0.92)';
    }, { passive: false });
    this._sprintBtn.addEventListener('touchend', () => {
      window._player?.setSprinting?.(false);
      this._sprintBtn.style.borderColor = 'rgba(100,220,255,0.5)';
      this._sprintBtn.style.transform   = 'scale(1)';
    });
    panel.appendChild(this._sprintBtn);

    // ── PARRY — derecha abajo ─────────────────────────────────────────────
    const parryAngle = 40 * Math.PI / 180;
    const parryR     = atk * 1.05;
    const paX = cx + Math.cos(parryAngle) * parryR - sb/2;
    const paY = cy + Math.sin(parryAngle) * parryR - sb/2;

    this._parryBtn = this._buildSmallBtn('🛡️', sb, 'rgba(201,168,76,0.5)', paX, paY);
    this._parryBtn.addEventListener('touchstart', (e) => {
      e.preventDefault();
      window._parry?.attemptParry?.();
      this._parryBtn.style.transform = 'scale(0.88)';
      setTimeout(() => this._parryBtn.style.transform = 'scale(1)', 180);
    }, { passive: false });
    panel.appendChild(this._parryBtn);

    this._container.appendChild(panel);
    document.body.appendChild(this._container);
  }

  _buildSmallBtn(icon, size, borderColor, x, y) {
    const btn = document.createElement('button');
    btn.textContent = icon;
    Object.assign(btn.style, {
      position      : 'absolute',
      left          : `${x}px`,
      top           : `${y}px`,
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
      zIndex        : '2',
    });
    return btn;
  }

  _buildSkillBtn(size) {
    const wrap = document.createElement('div');
    Object.assign(wrap.style, {
      width        : `${size}px`,
      height       : `${size}px`,
      borderRadius : '50%',
      border       : '2px solid rgba(255,255,255,0.15)',
      background   : 'rgba(12,10,22,0.88)',
      cursor       : 'pointer',
      pointerEvents: 'all',
      overflow     : 'hidden',
      WebkitTapHighlightColor: 'transparent',
      boxShadow    : '0 2px 10px rgba(0,0,0,0.6)',
      transition   : 'transform 0.08s',
      display      : 'none',
      alignItems   : 'center',
      justifyContent: 'center',
      position     : 'absolute',
      flexShrink   : '0',
      zIndex       : '2',
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
    btn.dataset.skillId   = skill.id;
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
