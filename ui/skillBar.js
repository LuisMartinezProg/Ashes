// ui/skillBar.js
import { RARITY_COLORS } from '../core/skillData.js';

const RARITY_LABELS = { common:'C', rare:'R', epic:'E', legendary:'L' };

const SKILL_ANGLES = [140, 180, 220];

export class SkillBar {
  constructor(skillSystem, progression) {
    this.skillSystem = skillSystem;
    this.progression = progression;
    this._weapon    = null;
    this._buttons   = [];
    this._attackBtn = null;
    this._container = null;
    this._cooldowns = {};
    this._build();
    window.addEventListener('resize', () => this._rebuild());
  }

  setWeapon(weaponType) { this._weapon = weaponType; this.refresh(); }

  refresh() {
    if (!this._weapon) return;
    const skills = this.progression.getActiveSkills(this._weapon).slice(0, 3);
    skills.forEach((skill, i) => this._updateButton(i, skill));
  }

  setCooldown(skillId, progress) {
    this._cooldowns[skillId] = progress;
    const btn = this._buttons.find(b => b.dataset.skillId === skillId);
    if (btn) this._applyCooldown(btn, progress);
  }

  setWeaponIcon(type) {
    const icons = { katana:'🗡️', sword:'⚔️', magic:'🔮', bow:'🏹' };
    if (this._attackBtn) this._attackBtn.textContent = icons[type] ?? '⚔️';
  }

  show() { this._container.style.display = 'block'; }
  hide() { this._container.style.display = 'none'; }

  _sizes() {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  return {
    attackSize : Math.round(vw * 0.18),
    skillSize  : Math.round(vw * 0.13),
    radius     : Math.round(vw * 0.30),
    marginR    : Math.round(vw * 0.03),
    marginB    : Math.round(vh * 0.03),
  };
  }
    

  _rebuild() {
    if (this._container) this._container.remove();
    this._buttons = [];
    this._attackBtn = null;
    this._build();
    if (this._weapon) this.refresh();
  }

  _build() {
    const { attackSize, skillSize, radius, marginR, marginB } = this._sizes();
    const half = attackSize / 2;

    // Contenedor — lo hacemos grande para que el arco no se corte
    const SIZE = radius * 2 + skillSize + 20;

    this._container = document.createElement('div');
    Object.assign(this._container.style, {
      position     : 'fixed',
      bottom       : `${marginB}px`,
      right        : `${marginR}px`,
      width        : `${SIZE}px`,
      height       : `${SIZE}px`,
      pointerEvents: 'none',
      zIndex       : '120',
    });

    // El botón de ataque va en la esquina inferior derecha del contenedor
    const PIVOT_X = SIZE - half - 10;
    const PIVOT_Y = SIZE - half - 10;

    // Botón central de ataque
    this._attackBtn = document.createElement('button');
    this._attackBtn.textContent = '⚔️';
    Object.assign(this._attackBtn.style, {
      position     : 'absolute',
      width        : `${attackSize}px`,
      height       : `${attackSize}px`,
      left         : `${PIVOT_X - half}px`,
      top          : `${PIVOT_Y - half}px`,
      borderRadius : '50%',
      border       : '2.5px solid rgba(255,200,80,0.85)',
      background   : 'rgba(160,50,20,0.95)',
      color        : '#fff',
      fontSize     : `${Math.round(attackSize * 0.4)}px`,
      cursor       : 'pointer',
      pointerEvents: 'all',
      display      : 'flex',
      alignItems   : 'center',
      justifyContent: 'center',
      WebkitTapHighlightColor: 'transparent',
      boxShadow    : '0 0 24px rgba(255,100,50,0.6)',
      transition   : 'transform 0.08s',
      zIndex       : '2',
    });

    const onAtk = (e) => {
      e.preventDefault();
      window._combat?.triggerAttack?.();
      this._attackBtn.style.transform = 'scale(0.88)';
      setTimeout(() => this._attackBtn.style.transform = 'scale(1)', 140);
    };
    this._attackBtn.addEventListener('touchstart', onAtk, { passive: false });
    this._attackBtn.addEventListener('mousedown', onAtk);
    this._container.appendChild(this._attackBtn);

    // 3 botones en arco izquierdo
    SKILL_ANGLES.forEach((angleDeg, i) => {
      const rad = (angleDeg * Math.PI) / 180;
      const x   = PIVOT_X + Math.cos(rad) * radius - skillSize / 2;
      const y   = PIVOT_Y - Math.sin(rad) * radius - skillSize / 2;
      const btn = this._buildSkillBtn(skillSize, x, y);
      this._buttons.push(btn);
      this._container.appendChild(btn);
    });

    document.body.appendChild(this._container);
  }

  _buildSkillBtn(size, x, y) {
    const wrap = document.createElement('div');
    Object.assign(wrap.style, {
      position     : 'absolute',
      left         : `${x}px`,
      top          : `${y}px`,
      width        : `${size}px`,
      height       : `${size}px`,
      borderRadius : '50%',
      border       : '2px solid rgba(255,255,255,0.18)',
      background   : 'rgba(12,10,22,0.92)',
      cursor       : 'pointer',
      pointerEvents: 'all',
      overflow     : 'hidden',
      WebkitTapHighlightColor: 'transparent',
      boxShadow    : '0 2px 10px rgba(0,0,0,0.7)',
      transition   : 'transform 0.08s',
      display      : 'none', // oculto hasta que se desbloquee
      alignItems   : 'center',
      justifyContent: 'center',
      zIndex       : '2',
    });

    const icon = document.createElement('div');
    icon.className = 'skill-icon';
    icon.style.cssText = `font-size:${Math.round(size * 0.45)}px;line-height:1;position:absolute;`;

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

    if (skill.available) {
      btn.style.display     = 'flex';
      btn.style.borderColor = RARITY_COLORS[skill.rarity];
      btn.style.opacity     = '1';
    } else {
      btn.style.display = 'none';
    }

    this._applyCooldown(btn, this._cooldowns[skill.id] ?? 1);
  }

  _applyCooldown(btn, progress) {
    const el = btn.querySelector('.skill-cooldown');
    if (el) el.style.height = `${(1 - progress) * 100}%`;
    btn.style.opacity = progress < 1 ? '0.55' : '1';
  }
}
