// ui/skillBar.js
import { RARITY_COLORS } from '../core/skillData.js';

const RARITY_LABELS = { common:'C', rare:'R', epic:'E', legendary:'L' };

// 3 habilidades en arco izquierdo según spec doc
const SKILL_ANGLES = [140, 180, 220];
const SKILL_RADIUS = 120;

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
    // Solo las primeras 3 habilidades del subtipo activo
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

  _build() {
    // Contenedor grande para que el radio de 120px no corte los botones
    const SIZE   = 320;
    const CENTER = SIZE / 2;

    this._container = document.createElement('div');
    Object.assign(this._container.style, {
      position     : 'fixed',
      bottom       : '20px',
      right        : '10px',
      width        : `${SIZE}px`,
      height       : `${SIZE}px`,
      pointerEvents: 'none',
      zIndex       : '120',
    });

    // Fondo circular oscuro centrado en el botón de ataque
    // El botón de ataque estará en el centro-derecha del contenedor
    // para que el arco izquierdo tenga espacio
    const PIVOT_X = SIZE - 80; // centro del botón de ataque dentro del contenedor
    const PIVOT_Y = CENTER;

    const bg = document.createElement('div');
    Object.assign(bg.style, {
      position     : 'absolute',
      width        : '200px',
      height       : '200px',
      right        : '0px',
      top          : `${PIVOT_Y - 100}px`,
      borderRadius : '50%',
      background   : 'rgba(8,6,16,0.75)',
      border       : '1px solid rgba(255,255,255,0.07)',
      boxShadow    : '0 0 40px rgba(0,0,0,0.6)',
    });
    this._container.appendChild(bg);

    // Botón central de ataque — 1.5x más grande que los de habilidad
    this._attackBtn = document.createElement('button');
    this._attackBtn.textContent = '⚔️';
    Object.assign(this._attackBtn.style, {
      position     : 'absolute',
      width        : '80px',   // 1.5x de 52px
      height       : '80px',
      left         : `${PIVOT_X - 40}px`,
      top          : `${PIVOT_Y - 40}px`,
      borderRadius : '50%',
      border       : '2.5px solid rgba(255,200,80,0.85)',
      background   : 'rgba(160,50,20,0.95)',
      color        : '#fff',
      fontSize     : '30px',
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

    // 3 botones de habilidad en arco izquierdo
    SKILL_ANGLES.forEach((angleDeg, i) => {
      const rad = (angleDeg * Math.PI) / 180;
      // Posición relativa al PIVOT (centro del botón de ataque)
      const x = PIVOT_X + Math.cos(rad) * SKILL_RADIUS - 26;
      const y = PIVOT_Y - Math.sin(rad) * SKILL_RADIUS - 26; // -sin porque Y crece hacia abajo

      const btn = this._buildSkillBtn(i, x, y);
      this._buttons.push(btn);
      this._container.appendChild(btn);
    });

    document.body.appendChild(this._container);
  }

  _buildSkillBtn(index, x, y) {
    const wrap = document.createElement('div');
    Object.assign(wrap.style, {
      position     : 'absolute',
      left         : `${x}px`,
      top          : `${y}px`,
      width        : '52px',
      height       : '52px',
      borderRadius : '50%',
      border       : '2px solid rgba(255,255,255,0.18)',
      background   : 'rgba(12,10,22,0.92)',
      cursor       : 'pointer',
      pointerEvents: 'all',
      overflow     : 'hidden',
      WebkitTapHighlightColor: 'transparent',
      boxShadow    : '0 2px 10px rgba(0,0,0,0.7)',
      transition   : 'transform 0.08s',
      display      : 'flex',
      alignItems   : 'center',
      justifyContent: 'center',
      zIndex       : '2',
    });

    const icon = document.createElement('div');
    icon.className = 'skill-icon';
    icon.style.cssText = 'font-size:22px;line-height:1;position:absolute;';

    const rarity = document.createElement('div');
    rarity.className = 'skill-rarity';
    rarity.style.cssText = 'position:absolute;top:2px;left:4px;font-size:7px;font-family:monospace;font-weight:bold;';

    const cooldown = document.createElement('div');
    cooldown.className = 'skill-cooldown';
    cooldown.style.cssText = 'position:absolute;bottom:0;left:0;width:100%;height:0%;background:rgba(0,0,0,0.65);transition:height 0.1s linear;pointer-events:none;';

    const lock = document.createElement('div');
    lock.className = 'skill-lock';
    lock.style.cssText = 'position:absolute;inset:0;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,0.65);font-size:14px;opacity:0;pointer-events:none;';
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
    wrap.addEventListener('mousedown',  onPress);

    return wrap;
  }

  _updateButton(index, skill) {
    const btn = this._buttons[index];
    if (!btn) return;

    btn.dataset.skillId = skill.id;
    btn.dataset.locked  = skill.available ? 'false' : 'true';

    btn.querySelector('.skill-icon').textContent = skill.icon;

    const r = btn.querySelector('.skill-rarity');
    r.textContent = RARITY_LABELS[skill.rarity];
    r.style.color = RARITY_COLORS[skill.rarity];

    btn.style.borderColor = skill.available
      ? RARITY_COLORS[skill.rarity]
      : 'rgba(255,255,255,0.12)';

    btn.querySelector('.skill-lock').style.opacity = skill.available ? '0' : '1';

    this._applyCooldown(btn, this._cooldowns[skill.id] ?? 1);
  }

  _applyCooldown(btn, progress) {
    const el = btn.querySelector('.skill-cooldown');
    if (el) el.style.height = `${(1 - progress) * 100}%`;
    btn.style.opacity = progress < 1 ? '0.55' : '1';
  }
                        }
