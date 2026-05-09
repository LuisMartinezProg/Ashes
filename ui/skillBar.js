// ui/skillBar.js — Layout circular tipo rueda
import { RARITY_COLORS } from '../core/skillData.js';

const RARITY_LABELS = { common:'C', rare:'R', epic:'E', legendary:'L' };

// Posiciones de las 4 habilidades alrededor del centro
// Ángulos: arriba-izquierda, arriba, arriba-derecha, abajo-derecha
const SKILL_ANGLES = [135, 60, 0, 270]; // grados
const SKILL_RADIUS = 88; // distancia del centro

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
  }

  setWeapon(weaponType) { this._weapon = weaponType; this.refresh(); }

  refresh() {
    if (!this._weapon) return;
    const skills = this.progression.getActiveSkills(this._weapon);
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

  _build() {
    const SIZE   = 220; // tamaño del contenedor
    const CENTER = SIZE / 2;

    this._container = document.createElement('div');
    Object.assign(this._container.style, {
      position : 'fixed',
      bottom   : '20px',
      right    : '10px',
      width    : `${SIZE}px`,
      height   : `${SIZE}px`,
      pointerEvents: 'none',
      zIndex   : '120',
    });

    // Fondo oscuro circular
    const bg = document.createElement('div');
    Object.assign(bg.style, {
      position : 'absolute',
      inset    : '0',
      borderRadius: '50%',
      background: 'rgba(8,6,16,0.72)',
      border   : '1px solid rgba(255,255,255,0.06)',
    });
    this._container.appendChild(bg);

    // Botón de ataque — centro
    this._attackBtn = document.createElement('button');
    this._attackBtn.textContent = '⚔️';
    Object.assign(this._attackBtn.style, {
      position : 'absolute',
      width    : '72px',
      height   : '72px',
      left     : `${CENTER - 36}px`,
      top      : `${CENTER - 36}px`,
      borderRadius: '50%',
      border   : '2px solid rgba(255,200,100,0.7)',
      background: 'rgba(160,50,20,0.9)',
      color    : '#ffe',
      fontSize : '26px',
      cursor   : 'pointer',
      pointerEvents: 'all',
      display  : 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      WebkitTapHighlightColor: 'transparent',
      boxShadow: '0 0 18px rgba(255,100,50,0.5)',
      transition: 'transform 0.08s',
      zIndex   : '2',
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

    // 4 habilidades en círculo
    SKILL_ANGLES.forEach((angleDeg, i) => {
      const rad = (angleDeg * Math.PI) / 180;
      const x   = CENTER + Math.cos(rad) * SKILL_RADIUS - 24;
      const y   = CENTER - Math.sin(rad) * SKILL_RADIUS - 24;

      const btn = this._buildSkillBtn(i, x, y);
      this._buttons.push(btn);
      this._container.appendChild(btn);
    });

    document.body.appendChild(this._container);
  }

  _buildSkillBtn(index, x, y) {
    const wrap = document.createElement('div');
    Object.assign(wrap.style, {
      position : 'absolute',
      left     : `${x}px`,
      top      : `${y}px`,
      width    : '48px',
      height   : '48px',
      borderRadius: '50%',
      border   : '2px solid rgba(255,255,255,0.18)',
      background: 'rgba(12,10,22,0.9)',
      cursor   : 'pointer',
      pointerEvents: 'all',
      overflow : 'hidden',
      WebkitTapHighlightColor: 'transparent',
      boxShadow: '0 2px 8px rgba(0,0,0,0.6)',
      transition: 'transform 0.08s',
      display  : 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex   : '2',
    });

    const icon = document.createElement('div');
    icon.className = 'skill-icon';
    icon.style.cssText = 'font-size:20px;line-height:1;position:absolute;';

    const rarity = document.createElement('div');
    rarity.className = 'skill-rarity';
    rarity.style.cssText = 'position:absolute;top:2px;left:4px;font-size:7px;font-family:monospace;font-weight:bold;';

    const cooldown = document.createElement('div');
    cooldown.className = 'skill-cooldown';
    cooldown.style.cssText = 'position:absolute;bottom:0;left:0;width:100%;height:0%;background:rgba(0,0,0,0.65);transition:height 0.1s linear;pointer-events:none;';

    const lock = document.createElement('div');
    lock.className = 'skill-lock';
    lock.style.cssText = 'position:absolute;inset:0;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,0.6);font-size:14px;opacity:0;pointer-events:none;';
    lock.textContent = '🔒';

    wrap.appendChild(icon);
    wrap.appendChild(rarity);
    wrap.appendChild(cooldown);
    wrap.appendChild(lock);

    const onPress = (e) => {
      e.preventDefault();
      if (!wrap.dataset.skillId || wrap.dataset.locked === 'true') return;
      this.skillSystem.castSkill(wrap.dataset.skillId);
      wrap.style.transform = 'scale(0.88)';
      setTimeout(() => wrap.style.transform = 'scale(1)', 140);
    };
    wrap.addEventListener('touchstart', onPress, { passive: false });
    wrap.addEventListener('mousedown', onPress);

    return wrap;
  }

  _updateButton(index, skill) {
    const btn = this._buttons[index];
    if (!btn) return;
    btn.dataset.skillId = skill.id;
    btn.dataset.locked  = skill.available ? 'false' : 'true';
    btn.querySelector('.skill-icon').textContent   = skill.icon;
    const r = btn.querySelector('.skill-rarity');
    r.textContent = RARITY_LABELS[skill.rarity];
    r.style.color = RARITY_COLORS[skill.rarity];
    btn.style.borderColor = skill.available ? RARITY_COLORS[skill.rarity] : 'rgba(255,255,255,0.1)';
    btn.querySelector('.skill-lock').style.opacity = skill.available ? '0' : '1';
    this._applyCooldown(btn, this._cooldowns[skill.id] ?? 1);
  }

  _applyCooldown(btn, progress) {
    const el = btn.querySelector('.skill-cooldown');
    if (el) el.style.height = `${(1 - progress) * 100}%`;
    btn.style.opacity = progress < 1 ? '0.55' : '1';
  }
}
