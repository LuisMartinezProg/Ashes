// ui/skillBar.js — Layout circular de habilidades
// Centro: ataque básico | Alrededor: 4 habilidades en arco

import { RARITY_COLORS } from '../core/skillData.js';

const RARITY_LABELS = {
  common   : 'C',
  rare     : 'R',
  epic     : 'E',
  legendary: 'L',
};

// Posiciones de los 4 botones alrededor del centro
// En arco semicircular hacia arriba-izquierda
const SKILL_POSITIONS = [
  { angle: 250, radius: 75  }, // habilidad 1 — más cerca, más abajo
  { angle: 230, radius: 130 }, // habilidad 2
  { angle: 215, radius: 185 }, // habilidad 3
  { angle: 205, radius: 240 }, // habilidad 4 — más lejos, más arriba
];
export class SkillBar {
  constructor(skillSystem, progression) {
    this.skillSystem = skillSystem;
    this.progression = progression;
    this._weapon     = null;
    this._buttons    = [];
    this._attackBtn  = null;
    this._container  = null;
    this._cooldowns  = {};

    this._build();
  }

  setWeapon(weaponType) {
    this._weapon = weaponType;
    this.refresh();
  }

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

  show() { this._container.style.display = 'block'; }
  hide() { this._container.style.display = 'none'; }

  // ─────────────────────────────────────────────
  // BUILD
  // ─────────────────────────────────────────────
  _build() {
    // Contenedor posicionado abajo derecha
    this._container = document.createElement('div');
    Object.assign(this._container.style, {
      position : 'fixed',
      bottom   : '20px',
      right    : '20px',
      width    : '300px',
      height   : '300px',
      pointerEvents: 'none',
      zIndex   : '120',
    });

    // ── Botón de ataque central ──
    this._attackBtn = document.createElement('button');
    Object.assign(this._attackBtn.style, {
      position  : 'absolute',
      bottom    : '0',
      right     : '0',
      width     : '72px',
      height    : '72px',
      borderRadius: '50%',
      border    : '2px solid rgba(255,200,100,0.6)',
      background: 'rgba(180,60,30,0.85)',
      color     : '#ffe',
      fontSize  : '28px',
      cursor    : 'pointer',
      pointerEvents: 'all',
      zIndex    : '121',
      display   : 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      WebkitTapHighlightColor: 'transparent',
      boxShadow : '0 0 16px rgba(255,100,50,0.4)',
      transition: 'transform 0.08s',
    });
    this._attackBtn.textContent = '⚔️';

    const onAtk = (e) => {
      e.preventDefault();
      // Importar combat desde window (se asigna en game.html)
      window._combat?.triggerAttack?.();
      this._animateBtn(this._attackBtn);
    };
    this._attackBtn.addEventListener('touchstart', onAtk, { passive: false });
    this._attackBtn.addEventListener('mousedown', onAtk);
    this._container.appendChild(this._attackBtn);

    // ── 4 botones de habilidades en arco ──
    SKILL_POSITIONS.forEach((pos, i) => {
      const btn = this._buildSkillButton(i, pos);
      this._buttons.push(btn);
      this._container.appendChild(btn);
    });

    document.body.appendChild(this._container);
  }

  _buildSkillButton(index, pos) {
    // Calcular posición relativa al centro del botón de ataque
    // Centro del ataque: bottom=36, right=36 (radio del botón)
    const rad = (pos.angle * Math.PI) / 180;
    const x   = Math.cos(rad) * pos.radius; // positivo = derecha
    const y   = Math.sin(rad) * pos.radius; // positivo = abajo

    // En CSS: right y bottom desde esquina del contenedor
    // El botón de ataque está en bottom:0, right:0
    // Centro del ataque: bottom:36, right:36
    const btnRight  = 36 - x - 24; // 24 = radio del skill btn
    const btnBottom = 36 - y - 24;

    const wrap = document.createElement('div');
    Object.assign(wrap.style, {
      position : 'absolute',
      right    : `${btnRight}px`,
      bottom   : `${btnBottom}px`,
      width    : '48px',
      height   : '48px',
      borderRadius: '12px',
      border   : '2px solid rgba(255,255,255,0.15)',
      background: 'rgba(10,8,20,0.88)',
      cursor   : 'pointer',
      pointerEvents: 'all',
      overflow : 'hidden',
      transition: 'transform 0.08s',
      boxShadow: '0 2px 8px rgba(0,0,0,0.5)',
      WebkitTapHighlightColor: 'transparent',
    });

    // Icono
    const icon = document.createElement('div');
    icon.className = 'skill-icon';
    Object.assign(icon.style, {
      position: 'absolute', inset: '0',
      display: 'flex', alignItems: 'center',
      justifyContent: 'center', fontSize: '20px',
    });

    // Rareza
    const rarity = document.createElement('div');
    rarity.className = 'skill-rarity';
    Object.assign(rarity.style, {
      position: 'absolute', top: '2px', left: '4px',
      fontSize: '7px', fontFamily: 'monospace',
      fontWeight: 'bold', opacity: '0.9',
    });

    // Número slot
    const slot = document.createElement('div');
    Object.assign(slot.style, {
      position: 'absolute', bottom: '2px', right: '4px',
      fontSize: '7px', fontFamily: 'monospace',
      color: 'rgba(255,255,255,0.3)',
    });
    slot.textContent = index + 1;

    // Cooldown overlay
    const cooldown = document.createElement('div');
    cooldown.className = 'skill-cooldown';
    Object.assign(cooldown.style, {
      position: 'absolute', bottom: '0', left: '0',
      width: '100%', height: '0%',
      background: 'rgba(0,0,0,0.65)',
      transition: 'height 0.1s linear',
      pointerEvents: 'none',
    });

    // Lock overlay
    const lock = document.createElement('div');
    lock.className = 'skill-lock';
    Object.assign(lock.style, {
      position: 'absolute', inset: '0',
      display: 'flex', alignItems: 'center',
      justifyContent: 'center',
      background: 'rgba(0,0,0,0.6)',
      fontSize: '14px', opacity: '0',
      transition: 'opacity 0.2s',
      pointerEvents: 'none',
    });
    lock.textContent = '🔒';

    wrap.appendChild(icon);
    wrap.appendChild(rarity);
    wrap.appendChild(slot);
    wrap.appendChild(cooldown);
    wrap.appendChild(lock);

    const onPress = (e) => {
      e.preventDefault();
      if (!wrap.dataset.skillId || wrap.dataset.locked === 'true') return;
      this._castSkill(wrap.dataset.skillId, wrap);
    };
    wrap.addEventListener('touchstart', onPress, { passive: false });
    wrap.addEventListener('mousedown', onPress);

    return wrap;
  }

  // ─────────────────────────────────────────────
  // UPDATE
  // ─────────────────────────────────────────────
  _updateButton(index, skill) {
    const btn = this._buttons[index];
    if (!btn) return;

    btn.dataset.skillId = skill.id;
    btn.dataset.locked  = skill.available ? 'false' : 'true';

    btn.querySelector('.skill-icon').textContent   = skill.icon;

    const rarityEl = btn.querySelector('.skill-rarity');
    rarityEl.textContent = RARITY_LABELS[skill.rarity];
    rarityEl.style.color = RARITY_COLORS[skill.rarity];

    btn.style.borderColor = skill.available
      ? RARITY_COLORS[skill.rarity]
      : 'rgba(255,255,255,0.1)';

    btn.querySelector('.skill-lock').style.opacity = skill.available ? '0' : '1';

    const progress = this._cooldowns[skill.id] ?? 1;
    this._applyCooldown(btn, progress);
  }

  setWeaponIcon(type) {
    const icons = { katana: '🗡️', sword: '⚔️', magic: '🔮', bow: '🏹' };
    if (this._attackBtn) this._attackBtn.textContent = icons[type] ?? '⚔️';
  }

  _applyCooldown(btn, progress) {
    const cooldownEl = btn.querySelector('.skill-cooldown');
    if (!cooldownEl) return;
    cooldownEl.style.height = `${(1 - progress) * 100}%`;
    btn.style.opacity = progress < 1 ? '0.55' : '1';
  }

  _castSkill(skillId, btn) {
    const ok = this.skillSystem.castSkill(skillId);
    if (ok) this._animateBtn(btn);
  }

  _animateBtn(btn) {
    btn.style.transform = 'scale(0.88)';
    setTimeout(() => { btn.style.transform = 'scale(1)'; }, 140);
  }
}
