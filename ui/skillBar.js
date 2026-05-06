// ui/skillBar.js — Ashes of the Reborn | Valiant Gaming
// 4 botones de habilidades dinámicos según arma y subtipo activo

import { RARITY_COLORS } from '../core/skillData.js';

const RARITY_LABELS = {
  common   : 'C',
  rare     : 'R',
  epic     : 'E',
  legendary: 'L',
};

export class SkillBar {
  constructor(skillSystem, progression) {
    this.skillSystem = skillSystem;
    this.progression = progression;
    this._weapon     = null;
    this._buttons    = [];
    this._container  = null;
    this._cooldowns  = {}; // { skillId: progress 0-1 }

    this._build();
  }

  // ── API pública ───────────────────────────────────────────────────────────

  setWeapon(weaponType) {
    this._weapon = weaponType;
    this.refresh();
  }

  refresh() {
    if (!this._weapon) return;
    const skills = this.progression.getActiveSkills(this._weapon);
    skills.forEach((skill, i) => this._updateButton(i, skill));
  }

  // Llamar desde skillSystem cuando cambia cooldown
  setCooldown(skillId, progress) {
    this._cooldowns[skillId] = progress;
    const btn = this._buttons.find(b => b.dataset.skillId === skillId);
    if (btn) this._applyCondown(btn, progress);
  }

  show() { this._container.style.display = 'flex'; }
  hide() { this._container.style.display = 'none'; }

  // ── Build ─────────────────────────────────────────────────────────────────

  _build() {
    this._container = document.createElement('div');
    Object.assign(this._container.style, {
      position       : 'absolute',
      bottom         : '120px',
      right          : '24px',
      display        : 'flex',
      flexDirection  : 'column',
      gap            : '10px',
      pointerEvents  : 'all',
      alignItems     : 'flex-end',
    });

    for (let i = 0; i < 4; i++) {
      const btn = this._buildButton(i);
      this._buttons.push(btn);
      this._container.appendChild(btn);
    }

    document.body.appendChild(this._container);
  }

  _buildButton(index) {
    const wrap = document.createElement('div');
    Object.assign(wrap.style, {
      position        : 'relative',
      width           : '56px',
      height          : '56px',
      borderRadius    : '12px',
      overflow        : 'hidden',
      cursor          : 'pointer',
      userSelect      : 'none',
      WebkitUserSelect: 'none',
      WebkitTapHighlightColor: 'transparent',
      border          : '2px solid rgba(255,255,255,0.15)',
      background      : 'rgba(10,8,20,0.85)',
      transition      : 'transform 0.08s, border-color 0.2s',
      boxShadow       : '0 2px 8px rgba(0,0,0,0.5)',
    });

    // Icono
    const icon = document.createElement('div');
    icon.className = 'skill-icon';
    Object.assign(icon.style, {
      position  : 'absolute',
      inset     : '0',
      display   : 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize  : '22px',
      lineHeight: '1',
    });

    // Rareza (esquina superior izquierda)
    const rarity = document.createElement('div');
    rarity.className = 'skill-rarity';
    Object.assign(rarity.style, {
      position    : 'absolute',
      top         : '3px',
      left        : '5px',
      fontSize    : '8px',
      fontFamily  : 'monospace',
      fontWeight  : 'bold',
      letterSpacing: '0.05em',
      opacity     : '0.9',
    });

    // Cooldown overlay (sube desde abajo)
    const cooldown = document.createElement('div');
    cooldown.className = 'skill-cooldown';
    Object.assign(cooldown.style, {
      position      : 'absolute',
      bottom        : '0',
      left          : '0',
      width         : '100%',
      height        : '0%',
      background    : 'rgba(0,0,0,0.65)',
      transition    : 'height 0.1s linear',
      pointerEvents : 'none',
    });

    // Lock overlay
    const lock = document.createElement('div');
    lock.className = 'skill-lock';
    Object.assign(lock.style, {
      position      : 'absolute',
      inset         : '0',
      display       : 'flex',
      alignItems    : 'center',
      justifyContent: 'center',
      background    : 'rgba(0,0,0,0.6)',
      fontSize      : '18px',
      pointerEvents : 'none',
      opacity       : '0',
      transition    : 'opacity 0.2s',
    });
    lock.textContent = '🔒';

    // Número de slot (esquina inferior derecha)
    const slot = document.createElement('div');
    Object.assign(slot.style, {
      position   : 'absolute',
      bottom     : '3px',
      right      : '5px',
      fontSize   : '8px',
      fontFamily : 'monospace',
      color      : 'rgba(255,255,255,0.3)',
    });
    slot.textContent = index + 1;

    wrap.appendChild(icon);
    wrap.appendChild(rarity);
    wrap.appendChild(cooldown);
    wrap.appendChild(lock);
    wrap.appendChild(slot);

    // Eventos
    const onPress = (e) => {
      e.preventDefault();
      if (!wrap.dataset.skillId || wrap.dataset.locked === 'true') return;
      this._castSkill(wrap.dataset.skillId, wrap);
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

    // Icono
    btn.querySelector('.skill-icon').textContent = skill.icon;

    // Rareza
    const rarityEl = btn.querySelector('.skill-rarity');
    rarityEl.textContent   = RARITY_LABELS[skill.rarity];
    rarityEl.style.color   = RARITY_COLORS[skill.rarity];

    // Borde color rareza
    btn.style.borderColor = skill.available
      ? RARITY_COLORS[skill.rarity]
      : 'rgba(255,255,255,0.1)';

    // Lock
    const lockEl = btn.querySelector('.skill-lock');
    lockEl.style.opacity = skill.available ? '0' : '1';

    // Tooltip en el title para debug
    btn.title = skill.available
      ? `${skill.label} (${skill.cooldown}s)`
      : `🔒 ${skill.label} — ${skill.available ? '' : this._lockReason(skill)}`;

    // Restaurar cooldown si existe
    const progress = this._cooldowns[skill.id] ?? 1;
    this._applyCondown(btn, progress);
  }

  _lockReason(skill) {
    if (skill.rarity === 'common') return 'Desbloquea el subtipo';
    if (skill.currentXP < skill.xpRequired) {
      return `XP: ${skill.currentXP}/${skill.xpRequired}`;
    }
    if (!skill.trialPassed) {
      return `Supera la prueba (Nivel ${skill.trialLevel})`;
    }
    return 'Bloqueado';
  }

  _applyCondown(btn, progress) {
    const cooldownEl = btn.querySelector('.skill-cooldown');
    if (!cooldownEl) return;
    const coverPct = (1 - progress) * 100;
    cooldownEl.style.height = `${coverPct}%`;
    btn.style.opacity = progress < 1 ? '0.55' : '1';
  }

  _castSkill(skillId, btn) {
    // Por ahora solo fireball está implementado
    // En Fase 6 completa cada skillId llama su handler
    if (skillId === 'fireball') {
      const ok = this.skillSystem.castFireball();
      if (ok) this._animateBtn(btn);
    } else {
      // Placeholder para habilidades futuras
      console.log(`[SkillBar] Cast: ${skillId}`);
      this._animateBtn(btn);
    }
  }

  _animateBtn(btn) {
    btn.style.transform = 'scale(0.88)';
    setTimeout(() => { btn.style.transform = 'scale(1)'; }, 140);
  }
}
