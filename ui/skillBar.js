// ui/skillBar.js — Layout circular con labels de texto bajo cada botón
import { RARITY_COLORS } from '../core/skillData.js';

const RARITY_LABELS = { common:'C', rare:'R', epic:'E', legendary:'L' };

const SKILL_ANGLES  = [90, 30, 210, 270]; // arriba, arriba-derecha, abajo-izquierda, abajo
const SKILL_RADIUS  = 100;
const LABEL_OFFSET  = 38; // distancia extra hacia afuera para el label

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
    // El contenedor necesita espacio extra para los labels que sobresalen
    const SIZE    = 300;
    const CENTER  = SIZE / 2;

    this._container = document.createElement('div');
    Object.assign(this._container.style, {
      position     : 'fixed',
      bottom       : '10px',
      right        : '0px',
      width        : `${SIZE}px`,
      height       : `${SIZE}px`,
      pointerEvents: 'none',
      zIndex       : '120',
    });

    // Fondo circular oscuro — igual que imagen 1
    const bg = document.createElement('div');
    Object.assign(bg.style, {
      position     : 'absolute',
      // El círculo visible es más pequeño que el contenedor (dejar espacio a labels)
      inset        : '30px',
      borderRadius : '50%',
      background   : 'rgba(8,6,16,0.82)',
      border       : '1px solid rgba(255,255,255,0.10)',
      boxShadow    : '0 0 40px rgba(0,0,0,0.7)',
    });
    this._container.appendChild(bg);

    // Botón de ataque central
    this._attackBtn = document.createElement('button');
    this._attackBtn.textContent = '⚔️';
    Object.assign(this._attackBtn.style, {
      position     : 'absolute',
      width        : '76px',
      height       : '76px',
      left         : `${CENTER - 38}px`,
      top          : `${CENTER - 38}px`,
      borderRadius : '50%',
      border       : '2.5px solid rgba(255,200,80,0.85)',
      background   : 'rgba(160,50,20,0.95)',
      color        : '#fff',
      fontSize     : '28px',
      cursor       : 'pointer',
      pointerEvents: 'all',
      display      : 'flex',
      alignItems   : 'center',
      justifyContent: 'center',
      WebkitTapHighlightColor: 'transparent',
      boxShadow    : '0 0 22px rgba(255,100,50,0.55)',
      transition   : 'transform 0.08s',
      zIndex       : '3',
    });

    const onAtk = (e) => {
      e.preventDefault();
      window._combat?.triggerAttack?.();
      this._attackBtn.style.transform = 'scale(0.88)';
      setTimeout(() => this._attackBtn.style.transform = 'scale(1)', 140);
    };
    this._attackBtn.addEventListener('touchstart', onAtk, { passive: false });
    this._attackBtn.addEventListener('mousedown',  onAtk);
    this._container.appendChild(this._attackBtn);

    // 4 habilidades en círculo con label
    SKILL_ANGLES.forEach((angleDeg, i) => {
      const rad = (angleDeg * Math.PI) / 180;
      const bx  = CENTER + Math.cos(rad) * SKILL_RADIUS - 28; // -28 = mitad del botón (56px)
      const by  = CENTER - Math.sin(rad) * SKILL_RADIUS - 28;

      const { wrap, label } = this._buildSkillBtn(i, bx, by, rad);
      this._buttons.push(wrap);
      this._container.appendChild(wrap);
      this._container.appendChild(label); // label es hermano, posicionado aparte
      wrap._label = label; // referencia para _updateButton
    });

    document.body.appendChild(this._container);
  }

  _buildSkillBtn(index, x, y, angleRad) {
    // Wrapper del botón
    const wrap = document.createElement('div');
    Object.assign(wrap.style, {
      position     : 'absolute',
      left         : `${x}px`,
      top          : `${y}px`,
      width        : '56px',
      height       : '56px',
      borderRadius : '50%',
      border       : '2px solid rgba(255,255,255,0.22)',
      background   : 'rgba(18,14,32,0.95)',
      cursor       : 'pointer',
      pointerEvents: 'all',
      overflow     : 'hidden',
      WebkitTapHighlightColor: 'transparent',
      boxShadow    : '0 2px 12px rgba(0,0,0,0.7)',
      transition   : 'transform 0.08s',
      display      : 'flex',
      alignItems   : 'center',
      justifyContent: 'center',
      zIndex       : '3',
    });

    // Icono de la habilidad
    const icon = document.createElement('div');
    icon.className = 'skill-icon';
    icon.style.cssText = 'font-size:22px;line-height:1;position:absolute;filter:brightness(0) invert(1);';

    // Badge de rareza (esquina)
    const rarity = document.createElement('div');
    rarity.className = 'skill-rarity';
    rarity.style.cssText = 'position:absolute;top:3px;left:5px;font-size:7px;font-family:monospace;font-weight:bold;';

    // Overlay de cooldown
    const cooldown = document.createElement('div');
    cooldown.className = 'skill-cooldown';
    cooldown.style.cssText = 'position:absolute;bottom:0;left:0;width:100%;height:0%;background:rgba(0,0,0,0.65);transition:height 0.1s linear;pointer-events:none;';

    // Candado para habilidades bloqueadas
    const lock = document.createElement('div');
    lock.className = 'skill-lock';
    lock.style.cssText = 'position:absolute;inset:0;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,0.65);font-size:16px;opacity:0;pointer-events:none;';
    lock.textContent = '🔒';

    wrap.appendChild(icon);
    wrap.appendChild(rarity);
    wrap.appendChild(cooldown);
    wrap.appendChild(lock);

    // ── Label de texto (fuera del botón, como en imagen 1) ──
    // Posicionar el label empujándolo hacia afuera desde el centro
    const CENTER = 150; // SIZE/2
    const lx = CENTER + Math.cos(angleRad) * (SKILL_RADIUS + LABEL_OFFSET);
    const ly = CENTER - Math.sin(angleRad) * (SKILL_RADIUS + LABEL_OFFSET);

    const label = document.createElement('div');
    label.className = 'skill-label';
    Object.assign(label.style, {
      position    : 'absolute',
      left        : `${lx}px`,
      top         : `${ly}px`,
      transform   : 'translate(-50%, -50%)',
      color       : 'rgba(255,255,255,0.90)',
      fontSize    : '10px',
      fontFamily  : 'system-ui, sans-serif',
      fontWeight  : '500',
      textAlign   : 'center',
      whiteSpace  : 'nowrap',
      pointerEvents: 'none',
      textShadow  : '0 1px 4px rgba(0,0,0,0.9)',
      zIndex      : '4',
      maxWidth    : '70px',
      lineHeight  : '1.2',
    });

    // Eventos
    const onPress = (e) => {
      e.preventDefault();
      if (!wrap.dataset.skillId || wrap.dataset.locked === 'true') return;
      this.skillSystem.castSkill(wrap.dataset.skillId);
      wrap.style.transform = 'scale(0.88)';
      setTimeout(() => wrap.style.transform = 'scale(1)', 140);
    };
    wrap.addEventListener('touchstart', onPress, { passive: false });
    wrap.addEventListener('mousedown',  onPress);

    return { wrap, label };
  }

  _updateButton(index, skill) {
    const btn = this._buttons[index];
    if (!btn) return;

    btn.dataset.skillId = skill.id;
    btn.dataset.locked  = skill.available ? 'false' : 'true';

    btn.querySelector('.skill-icon').textContent   = skill.icon;
    const r = btn.querySelector('.skill-rarity');
    r.textContent  = RARITY_LABELS[skill.rarity];
    r.style.color  = RARITY_COLORS[skill.rarity];

    btn.style.borderColor = skill.available
      ? RARITY_COLORS[skill.rarity]
      : 'rgba(255,255,255,0.12)';

    btn.querySelector('.skill-lock').style.opacity = skill.available ? '0' : '1';

    // Actualizar label con el nombre de la habilidad
    if (btn._label) {
      btn._label.textContent = skill.name ?? skill.id;
      btn._label.style.opacity = skill.available ? '1' : '0.4';
    }

    this._applyCooldown(btn, this._cooldowns[skill.id] ?? 1);
  }

  _applyCooldown(btn, progress) {
    const el = btn.querySelector('.skill-cooldown');
    if (el) el.style.height = `${(1 - progress) * 100}%`;
    btn.style.opacity = progress < 1 ? '0.55' : '1';
  }
}
