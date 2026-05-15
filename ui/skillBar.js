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
  show()           { if (this._container) this._container.style.display = 'flex'; }
  hide()           { if (this._container) this._container.style.display = 'none'; }

  setWeaponIcon(type) {
    const icons = { katana:'🗡️', sword:'⚔️', magic:'🔮', bow:'🏹' };
    if (this._attackBtn) this._attackBtn.textContent = icons[type] ?? '⚔️';
  }

  refresh() {
    if (!this._weapon) return;
    const skills = this.progression.getActiveSkills(this._weapon).slice(0, 3);
    skills.forEach((sk, i) => this._updateButton(i, sk));
    // Ocultar botones sin habilidad asignada
    for (let i = skills.length; i < this._buttons.length; i++) {
      this._buttons[i].style.display = 'none';
    }
  }

  setCooldown(skillId, progress) {
    this._cooldowns[skillId] = progress;
    const btn = this._buttons.find(b => b.dataset.skillId === skillId);
    if (btn) this._applyCooldown(btn, progress);
  }

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
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const ref = Math.min(vw, vh);
    return {
      atk : Math.round(ref * 0.24),
      sk  : Math.round(ref * 0.13),
      gap : Math.round(ref * 0.025),
      mb  : Math.round(ref * 0.04),
      mr  : Math.round(ref * 0.03),
    };
  }

  _build() {
    const { atk, sk, gap, mb, mr } = this._sizes();
    const sbSize = Math.round(atk * 0.52);

    this._container = document.createElement('div');
    Object.assign(this._container.style, {
      position     : 'fixed',
      bottom       : `${mb}px`,
      right        : `${mr}px`,
      display      : 'none',
      flexDirection: 'column',
      alignItems   : 'flex-end',
      gap          : `${gap}px`,
      pointerEvents: 'none',
      zIndex       : '120',
    });

    const row1 = document.createElement('div');
    Object.assign(row1.style, { display: 'flex', gap: `${gap}px`, alignItems: 'center' });

    const row2 = document.createElement('div');
    Object.assign(row2.style, { display: 'flex', gap: `${gap}px`, alignItems: 'center' });

    for (let i = 0; i < 2; i++) {
      const btn = this._buildSkillBtn(sk);
      this._buttons.push(btn);
      row1.appendChild(btn);
    }

    const btn2 = this._buildSkillBtn(sk);
    this._buttons.push(btn2);
    row2.appendChild(btn2);

    // Botón ataque
    this._attackBtn = document.createElement('button');
    this._attackBtn.textContent = '⚔️';
    Object.assign(this._attackBtn.style, {
      width        : `${atk}px`,
      height       : `${atk}px`,
      borderRadius : '50%',
      border       : '3px solid rgba(255,200,80,0.9)',
      background   : 'radial-gradient(circle at 35% 35%, rgba(220,100,40,0.95), rgba(140,40,10,0.95))',
      color        : '#fff',
      fontSize     : `${Math.round(atk * 0.38)}px`,
      cursor       : 'pointer',
      pointerEvents: 'all',
      display      : 'flex',
      alignItems   : 'center',
      justifyContent: 'center',
      WebkitTapHighlightColor: 'transparent',
      boxShadow    : '0 0 20px rgba(255,120,40,0.6), inset 0 1px 0 rgba(255,255,255,0.2)',
      transition   : 'transform 0.08s',
      flexShrink   : '0',
    });

    const onAtk = (e) => {
      e.preventDefault();
      window._combat?.triggerAttack?.();
      this._attackBtn.style.transform = 'scale(0.88)';
      setTimeout(() => this._attackBtn.style.transform = 'scale(1)', 140);
    };
    this._attackBtn.addEventListener('touchstart', onAtk, { passive: false });
    this._attackBtn.addEventListener('mousedown',  onAtk);
    row2.appendChild(this._attackBtn);

    // Columna sprint + parry
    const col = document.createElement('div');
    Object.assign(col.style, {
      display      : 'flex',
      flexDirection: 'column',
      gap          : `${Math.round(gap * 0.6)}px`,
      pointerEvents: 'none',
    });

    this._sprintBtn = document.createElement('button');
    this._sprintBtn.textContent = '🏃';
    Object.assign(this._sprintBtn.style, {
      width        : `${sbSize}px`,
      height       : `${sbSize}px`,
      borderRadius : '50%',
      border       : '2px solid rgba(100,220,255,0.5)',
      background   : 'rgba(10,8,20,0.88)',
      color        : '#fff',
      fontSize     : `${Math.round(sbSize * 0.4)}px`,
      cursor       : 'pointer',
      pointerEvents: 'all',
      display      : 'flex',
      alignItems   : 'center',
      justifyContent: 'center',
      WebkitTapHighlightColor: 'transparent',
      boxShadow    : '0 2px 8px rgba(0,0,0,0.5)',
      transition   : 'transform 0.08s, border-color 0.1s',
    });

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

    this._parryBtn = document.createElement('button');
    this._parryBtn.textContent = '🛡️';
    Object.assign(this._parryBtn.style, {
      width        : `${sbSize}px`,
      height       : `${sbSize}px`,
      borderRadius : '50%',
      border       : '2px solid rgba(201,168,76,0.5)',
      background   : 'rgba(10,8,20,0.88)',
      color        : '#fff',
      fontSize     : `${Math.round(sbSize * 0.4)}px`,
      cursor       : 'pointer',
      pointerEvents: 'all',
      display      : 'flex',
      alignItems   : 'center',
      justifyContent: 'center',
      WebkitTapHighlightColor: 'transparent',
      boxShadow    : '0 2px 8px rgba(0,0,0,0.5)',
      transition   : 'transform 0.08s',
    });

    this._parryBtn.addEventListener('touchstart', (e) => {
      e.preventDefault();
      window._parry?.attemptParry?.();
      this._parryBtn.style.transform = 'scale(0.88)';
      setTimeout(() => this._parryBtn.style.transform = 'scale(1)', 180);
    }, { passive: false });

    col.appendChild(this._sprintBtn);
    col.appendChild(this._parryBtn);
    row2.appendChild(col);

    this._container.appendChild(row1);
    this._container.appendChild(row2);
    document.body.appendChild(this._container);
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
      position     : 'relative',
      flexShrink   : '0',
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
    // Siempre visible — bloqueadas se muestran en gris
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
