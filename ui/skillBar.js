// ui/skillBar.js
import { RARITY_COLORS } from '../core/skillData.js';

const RARITY_LABELS = { common:'C', rare:'R', epic:'E', legendary:'L' };

// Arriba, derecha, abajo, izquierda
const SKILL_ANGLES = [90, 0, 270, 180];
const SKILL_RADIUS = 88;

export class SkillBar {
  constructor(skillSystem, progression) {
    this.skillSystem = skillSystem;
    this.progression = progression;
    this._weapon    = null;
    this._buttons   = [];
    this._labels    = [];
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

  show() {
    this._container.style.display = 'block';
    this._labels.forEach(l => l.style.display = 'block');
    this._repositionLabels();
  }
  hide() {
    this._container.style.display = 'none';
    this._labels.forEach(l => l.style.display = 'none');
  }

  _build() {
    const SIZE   = 220;
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

    const bg = document.createElement('div');
    Object.assign(bg.style, {
      position    : 'absolute',
      inset       : '0',
      borderRadius: '50%',
      background  : 'rgba(8,6,16,0.82)',
      border      : '1px solid rgba(255,255,255,0.08)',
      boxShadow   : '0 0 40px rgba(0,0,0,0.6)',
    });
    this._container.appendChild(bg);

    // Botón central de ataque
    this._attackBtn = document.createElement('button');
    this._attackBtn.textContent = '⚔️';
    Object.assign(this._attackBtn.style, {
      position     : 'absolute',
      width        : '72px',
      height       : '72px',
      left         : `${CENTER - 36}px`,
      top          : `${CENTER - 36}px`,
      borderRadius : '50%',
      border       : '2.5px solid rgba(255,200,80,0.85)',
      background   : 'rgba(160,50,20,0.95)',
      color        : '#fff',
      fontSize     : '26px',
      cursor       : 'pointer',
      pointerEvents: 'all',
      display      : 'flex',
      alignItems   : 'center',
      justifyContent: 'center',
      WebkitTapHighlightColor: 'transparent',
      boxShadow    : '0 0 22px rgba(255,100,50,0.55)',
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

    // 4 botones de habilidad
    SKILL_ANGLES.forEach((angleDeg, i) => {
      const rad = (angleDeg * Math.PI) / 180;
      const x   = CENTER + Math.cos(rad) * SKILL_RADIUS - 24;
      const y   = CENTER - Math.sin(rad) * SKILL_RADIUS - 24;
      const btn = this._buildSkillBtn(i, x, y);
      this._buttons.push(btn);
      this._container.appendChild(btn);

      // Label en el body para que no sea cortado por el contenedor
      const label = document.createElement('div');
      Object.assign(label.style, {
        position    : 'fixed',
        color       : 'rgba(255,255,255,0.95)',
        fontSize    : '10px',
        fontFamily  : 'system-ui, sans-serif',
        fontWeight  : '600',
        whiteSpace  : 'nowrap',
        pointerEvents: 'none',
        textShadow  : '0 1px 4px #000, 0 0 8px #000',
        zIndex      : '125',
        lineHeight  : '1.3',
        textAlign   : 'center',
      });
      document.body.appendChild(label);
      this._labels.push(label);
    });

    document.body.appendChild(this._container);

    // Reposicionar labels tras render y en resize
    // Usamos un pequeño delay para garantizar que el contenedor
    // ya tiene su posición final en pantalla
    setTimeout(() => this._repositionLabels(), 50);
    window.addEventListener('resize', () => this._repositionLabels());
  }

  _repositionLabels() {
    const rect   = this._container.getBoundingClientRect();
    const CENTER = 110; // SIZE / 2

    SKILL_ANGLES.forEach((angleDeg, i) => {
      const label = this._labels[i];
      if (!label) return;

      const rad = (angleDeg * Math.PI) / 180;

      // Centro del botón en viewport
      const btnCX = rect.left + CENTER + Math.cos(rad) * SKILL_RADIUS;
      const btnCY = rect.top  + CENTER - Math.sin(rad) * SKILL_RADIUS;

      // Dirección del label según ángulo
      // La rueda está en el borde derecho, así que:
      // Arriba (90°)   → label a la izquierda
      // Derecha (0°)   → label a la izquierda  
      // Abajo (270°)   → label debajo centrado
      // Izquierda(180°)→ label a la izquierda también (borde izquierdo del botón)
      const GAP = 30;
      let lx, ly, transform;

      const a = ((angleDeg % 360) + 360) % 360;

      if (a === 90) {
        // Arriba → label a la izquierda del botón
        lx = btnCX - GAP;
        ly = btnCY;
        transform = 'translate(-100%, -50%)';
      } else if (a === 0) {
        // Derecha → label a la izquierda (pantalla lo corta a la derecha)
        lx = btnCX - GAP;
        ly = btnCY;
        transform = 'translate(-100%, -50%)';
      } else if (a === 270) {
        // Abajo → label debajo, centrado
        lx = btnCX;
        ly = btnCY + GAP;
        transform = 'translate(-50%, 0%)';
      } else {
        // Izquierda (180°) → label a la izquierda del botón
        lx = btnCX - GAP;
        ly = btnCY;
        transform = 'translate(-100%, -50%)';
      }

      Object.assign(label.style, {
        left     : `${lx}px`,
        top      : `${ly}px`,
        transform: transform,
      });
    });
  }

  _buildSkillBtn(index, x, y) {
    const wrap = document.createElement('div');
    Object.assign(wrap.style, {
      position     : 'absolute',
      left         : `${x}px`,
      top          : `${y}px`,
      width        : '48px',
      height       : '48px',
      borderRadius : '50%',
      border       : '2px solid rgba(255,255,255,0.18)',
      background   : 'rgba(12,10,22,0.95)',
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
    icon.style.cssText = 'font-size:20px;line-height:1;position:absolute;';

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
    const btn   = this._buttons[index];
    const label = this._labels[index];
    if (!btn) return;

    btn.dataset.skillId = skill.id;
    btn.dataset.locked  = skill.available ? 'false' : 'true';

    // ✅ Usar skill.label (no skill.name — ese campo no existe en skillData.js)
    btn.querySelector('.skill-icon').textContent = skill.icon;

    const r = btn.querySelector('.skill-rarity');
    r.textContent = RARITY_LABELS[skill.rarity];
    r.style.color = RARITY_COLORS[skill.rarity];

    btn.style.borderColor = skill.available
      ? RARITY_COLORS[skill.rarity]
      : 'rgba(255,255,255,0.12)';

    btn.querySelector('.skill-lock').style.opacity = skill.available ? '0' : '1';

    // ✅ skill.label es el campo correcto
    if (label) {
      label.textContent = skill.label;
      label.style.opacity = skill.available ? '1' : '0.5';
    }

    this._applyCooldown(btn, this._cooldowns[skill.id] ?? 1);
  }

  _applyCooldown(btn, progress) {
    const el = btn.querySelector('.skill-cooldown');
    if (el) el.style.height = `${(1 - progress) * 100}%`;
    btn.style.opacity = progress < 1 ? '0.55' : '1';
  }
}
