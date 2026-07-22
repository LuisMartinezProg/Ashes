// ui/skillBar.js — Ashes of the Reborn | Valiant Gaming
//
// Los 3 botones de skill fijos ya NO son un "loadout manual" — se
// auto-llenan con las 3 skills MÁS FUERTES ya desbloqueadas del arma
// activa (ver _getTopUnlockedSkills). "Más fuerte" = tier desc, luego
// posición dentro del tier desc (la versión II/más evolucionada).
// Sin elección del jugador; se recalcula en cada refresh().
//
// Nuevo: botón 🌳 abre el panel de árbol de habilidades (4 ramas × 9
// slots del arma activa) con desbloqueo real vía progression.unlockTreeSkill().
// Tier 3 se muestra bloqueado con candado distinto (🔒 Pendiente) — pausado
// a propósito hasta que exista contenido narrativo de jefes.

import { activateRelic, isRelicActive, getRelicCooldownPct, getEquippedRelic } from '../core/relics.js';
import { SKILL_LAYERS } from '../data/palette.js';
import { getWeaponTree, getAllBranchIds, getBranch } from '../core/skillData.js';

const BASE_W = 800;
const BASE_H = 450;

const WEAPON_ICONS = { katana:'🗡️', sword:'⚔️', magic:'🔮', bow:'🏹' };

export class SkillBar {
  constructor(skillSystem, progression) {
    this.skillSystem        = skillSystem;
    this.progression        = progression;
    this._activeSkillSystem = skillSystem;
    this._activeProgression = progression;
    this._activeCharId      = 'kael';
    this._weapon            = null;
    this._activeWeapon      = null;
    this._buttons           = [];
    this._attackBtn         = null;
    this._sprintBtn         = null;
    this._buildBtn          = null;
    this._jumpBtn           = null;
    this._relicBtn          = null;
    this._treeBtn           = null;
    this._container         = null;
    this._cooldowns         = {};
    this._enemyNear         = false;
    this._sprinting         = false;
    this._visible           = false;

    // ── Panel de árbol de habilidades (modal, separado del container HUD) ──
    this._treePanel         = null;
    this._treeVisible       = false;
    this._treeActiveBranch  = null;
    this._treeUpdateInterval = null;

    this._build();
    this._buildTreePanel();
    this._resizeHandler = () => this._rebuild();
    window.addEventListener('resize', this._resizeHandler);
    this._proximityInterval   = setInterval(() => this._checkEnemyProximity(), 500);
    this._relicUpdateInterval = setInterval(() => this._updateRelicBtn(), 100);
  }

  setWeapon(type) {
    this._weapon       = type;
    this._activeWeapon = type;
    if (this._treeVisible) this._renderTreePanel(); // el arma activa cambió, refrescar si está abierto
    this.refresh();
  }

  setWeaponIcon(type) {
    if (this._attackBtn) this._attackBtn.textContent = WEAPON_ICONS[type] ?? '⚔️';
  }

  setActiveCharacter(idx, mikaSkillSystem, mikaProgression) {
    if (idx === 1 && mikaSkillSystem) {
      this._activeSkillSystem = mikaSkillSystem;
      this._activeWeapon      = 'bow';
      this._activeCharId      = 'mika';
      this._activeProgression = mikaProgression ?? this.progression;
      if (this._attackBtn) this._attackBtn.textContent = '🏹';
      this.refresh();
    } else {
      this._activeSkillSystem = this.skillSystem;
      this._activeWeapon      = this._weapon;
      this._activeCharId      = 'kael';
      this._activeProgression = this.progression;
      if (this._attackBtn) this._attackBtn.textContent = WEAPON_ICONS[this._weapon] ?? '⚔️';
      this.refresh();
    }
    if (this._treeVisible) this._renderTreePanel();
    this._updateActionBtn();
  }

  // ── Auto-llenado de los 3 botones de combate ────────────────────────────
  // Recorre las 4 ramas del arma activa, junta las skills desbloqueadas
  // (hasPassedTrial), y ordena por tier desc + posición-en-tier desc.
  // Devuelve como máximo 3 entradas { id, branchId, icon, name, layer }
  // listas para _updateButton(). Nunca lanza si falta progression o weapon.
  _getTopUnlockedSkills(weapon, prog) {
    if (!weapon || !prog) return [];
    const branchIds = getAllBranchIds(weapon);
    const unlocked  = [];

    for (const branchId of branchIds) {
      const branch = getBranch(weapon, branchId);
      if (!branch) continue;
      branch.skills.forEach((skill, idxInBranch) => {
        if (!skill?.id) return;
        if (!prog.hasPassedTrial(skill.id)) return;
        // idxInTier: posición dentro de su propio tier (0,1,2), usado como
        // desempate — mayor posición = versión más evolucionada (ej. la "II").
        const tierStartIdx = { 1: 0, 2: 3, 3: 6 }[skill.tier] ?? 0;
        const idxInTier = idxInBranch - tierStartIdx;
        unlocked.push({
          id      : skill.id,
          branchId,
          icon    : skill.icon,
          name    : skill.name,
          tier    : skill.tier,
          idxInTier,
          layer   : skill.tier >= 3 ? 'arcano' : (skill.tier === 2 ? 'nv2' : 'basico'),
        });
      });
    }

    unlocked.sort((a, b) => {
      if (b.tier !== a.tier) return b.tier - a.tier;
      return b.idxInTier - a.idxInTier;
    });

    return unlocked.slice(0, 3);
  }

  refresh() {
    const weapon = this._activeWeapon ?? this._weapon;
    const prog   = this._activeProgression ?? this.progression;
    if (!weapon || !prog) return;

    const skills = this._getTopUnlockedSkills(weapon, prog);

    skills.forEach((sk, i) => {
      this._updateButton(i, sk);
      this._buttons[i].style.display = 'flex';
    });
    for (let i = skills.length; i < this._buttons.length; i++) {
      this._buttons[i].style.display = 'none';
    }
  }

  setCooldown(skillId, progress) {
    this._cooldowns[skillId] = progress;
    const btn = this._buttons.find(b => b.dataset.skillId === skillId);
    if (btn) this._applyCooldown(btn, progress);
  }

  show() {
    if (this._container) {
      this._container.style.display = 'block';
      this._visible = true;
    }
  }

  hide() {
    if (this._container) {
      this._container.style.display = 'none';
      this._visible = false;
    }
    this._hideTreePanel();
  }

  destroy() {
    clearInterval(this._proximityInterval);
    clearInterval(this._relicUpdateInterval);
    clearInterval(this._treeUpdateInterval);
    window.removeEventListener('resize', this._resizeHandler);
    this._container?.remove();
    this._treePanel?.remove();
  }

  _checkEnemyProximity() {
    const playerPos = window._player?.root?.position;
    const enemies   = window._enemies ?? [];
    if (!playerPos) return;
    let near = false;
    for (const e of enemies) {
      if (!e.mesh || e.isDead?.()) continue;
      if (e.mesh.position.distanceTo(playerPos) < 12) { near = true; break; }
    }
    if (near !== this._enemyNear) {
      this._enemyNear = near;
      if (near) window._tutorial?.notifyNearEnemy?.();   
      this._updateActionBtn();
    }
  }

  _updateActionBtn() {
    if (!this._sprintBtn) return;
    if (this._sprinting) return;
    this._sprintBtn.textContent       = '🏃';
    this._sprintBtn.style.borderColor = 'rgba(100,220,255,0.5)';
    this._sprintBtn.title             = 'Sprint';
  }

  // ── Reliquia: aparece/desaparece según estado ───────────────────────────
  _updateRelicBtn() {
    if (!this._relicBtn) return;

    const charId = this._activeCharId ?? 'kael';
    const relic  = getEquippedRelic(charId);

    // Sin reliquia equipada: el botón no se muestra
    if (!relic) {
      this._relicBtn.style.display = 'none';
      return;
    }
    window._tutorial?.notifyHasRelic?.();   //
    // Activa: el botón desaparece por completo durante los 7s de efecto
    if (isRelicActive(charId)) {
      this._relicBtn.style.display = 'none';
      return;
    }

    // En cooldown o lista: visible, con overlay de progreso
    this._relicBtn.style.display = 'flex';
    const pct = getRelicCooldownPct(charId); // 0 a 1, 1 = lista
    const overlay = this._relicBtn.querySelector('.relic-cooldown');
    if (overlay) overlay.style.height = `${(1 - pct) * 100}%`;
    this._relicBtn.style.opacity = pct < 1 ? '0.55' : '1';
  }

  _rebuild() {
    try {
      const wasVisible = this._visible;
      const wasTreeVisible = this._treeVisible;
      if (this._container) this._container.remove();
      if (this._treePanel) this._treePanel.remove();
      this._buttons   = [];
      this._attackBtn = null;
      this._sprintBtn = null;
      this._buildBtn  = null;
      this._jumpBtn   = null;
      this._relicBtn  = null;
      this._treeBtn   = null;
      this._treePanel = null;
      this._build();
      this._buildTreePanel();
      if (this._weapon || this._activeWeapon) this.refresh();
      this._updateActionBtn();
      if (wasVisible) this.show();
      if (wasTreeVisible) this._showTreePanel();
    } catch(e) {
      console.error('[SkillBar._rebuild]', e);
    }
  }

  _scale() {
    const uiScale = window._uiScale ?? 1;
    const isPC    = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    if (isPC) return 0.75 * uiScale;
    const isLandscape = window.innerWidth > window.innerHeight;
    return (isLandscape
      ? window.innerHeight / 450
      : window.innerWidth  / 480) * uiScale;
  }

  _placeFromBottomRight(el, hx, hy, size) {
    const s      = this._scale();
    const right  = Math.round((BASE_W - hx) * s) - size / 2;
    const bottom = Math.round((BASE_H - hy) * s) - size / 2;
    el.style.right  = `${right}px`;
    el.style.bottom = `${bottom}px`;
    el.style.left   = 'auto';
    el.style.top    = 'auto';
  }

  _sz(baseSize) {
    return Math.round(this._scale() * baseSize);
  }

  _build() {
    this._container = document.createElement('div');
    Object.assign(this._container.style, {
      position     : 'fixed',
      inset        : '0',
      display      : 'none',
      pointerEvents: 'none',
      zIndex       : '120',
    });
    document.body.appendChild(this._container);

    const atkSize = this._sz(85);
    const skSize  = this._sz(58);
    const sbSize  = this._sz(48);

    const sk1 = this._buildSkillBtn(skSize);
    this._placeFromBottomRight(sk1, 558, 403, skSize);
    this._buttons.push(sk1);
    this._container.appendChild(sk1);

    const sk2 = this._buildSkillBtn(skSize);
    this._placeFromBottomRight(sk2, 584, 313, skSize);
    this._buttons.push(sk2);
    this._container.appendChild(sk2);

    const sk3 = this._buildSkillBtn(skSize);
    this._placeFromBottomRight(sk3, 668, 263, skSize);
    this._buttons.push(sk3);
    this._container.appendChild(sk3);

    // Botón ataque principal
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
    this._placeFromBottomRight(this._attackBtn, 679, 379, atkSize);

    const onAtk = (e) => {
      e.preventDefault();
      window._combat?.triggerAttack?.();
      this._attackBtn.style.transform = 'scale(0.88)';
      setTimeout(() => this._attackBtn.style.transform = 'scale(1)', 140);
    };
    this._attackBtn.addEventListener('touchstart', onAtk, { passive: false });
    this._attackBtn.addEventListener('click', onAtk);
    this._container.appendChild(this._attackBtn);

    // Botón sprint
    this._sprintBtn = this._buildSmallBtn('🏃', sbSize, 'rgba(100,220,255,0.5)');
    this._placeFromBottomRight(this._sprintBtn, 755, 302, sbSize);
    this._sprintBtn.addEventListener('touchstart', (e) => {
      e.preventDefault();
      this._sprinting = true;
      const activeChar = window._partyManager?.getActiveCharacter() ?? window._player;
      activeChar?.setSprinting?.(true);
      this._sprintBtn.style.borderColor = 'rgba(100,220,255,0.9)';
      this._sprintBtn.style.transform   = 'scale(0.92)';
    }, { passive: false });
    this._sprintBtn.addEventListener('touchend', () => {
      this._sprinting = false;
      const activeChar = window._partyManager?.getActiveCharacter() ?? window._player;
      activeChar?.setSprinting?.(false);
      this._sprintBtn.style.borderColor = 'rgba(100,220,255,0.5)';
      this._sprintBtn.style.transform   = 'scale(1)';
    });
    this._container.appendChild(this._sprintBtn);

    // Botón construcción
    this._buildBtn = this._buildSmallBtn('🏗️', sbSize, 'rgba(201,168,76,0.5)');
    this._placeFromBottomRight(this._buildBtn, 755, 215, sbSize);
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

    // Botón saltar
    this._jumpBtn = this._buildSmallBtn('⬆', sbSize, 'rgba(136,170,255,0.5)');
    this._placeFromBottomRight(this._jumpBtn, 755, 390, sbSize);
    const onJump = (e) => {
      e.preventDefault();
      const active = window._partyManager?.getActiveCharacter() ?? window._player;
      active?.jump?.();
      this._jumpBtn.style.transform = 'scale(0.88)';
      setTimeout(() => this._jumpBtn.style.transform = 'scale(1)', 140);
    };
    this._jumpBtn.addEventListener('touchstart', onJump, { passive: false });
    this._jumpBtn.addEventListener('click', onJump);
    this._container.appendChild(this._jumpBtn);

    // Botón reliquia
    this._relicBtn = this._buildSmallBtn('💠', skSize, 'rgba(180,80,255,0.5)');
    this._placeFromBottomRight(this._relicBtn, 600, 200, skSize);
    this._relicBtn.style.overflow = 'hidden';

    const relicCooldown = document.createElement('div');
    relicCooldown.className = 'relic-cooldown';
    relicCooldown.style.cssText = `
      position:absolute;bottom:0;left:0;
      width:100%;height:0%;
      background:rgba(0,0,0,0.65);
      transition:height 0.1s linear;
      pointer-events:none;
    `;
    this._relicBtn.appendChild(relicCooldown);

    const onRelic = (e) => {
      e.preventDefault();
      const charId = this._activeCharId ?? 'kael';
      const ok = activateRelic(charId);
      if (ok) {
        this._relicBtn.style.transform = 'scale(0.88)';
        setTimeout(() => this._relicBtn.style.transform = 'scale(1)', 140);
      }
    };
    this._relicBtn.addEventListener('touchstart', onRelic, { passive: false });
    this._relicBtn.addEventListener('click', onRelic);
    this._container.appendChild(this._relicBtn);
    this._updateRelicBtn();

    // Botón árbol de habilidades (nuevo) — junto a la reliquia, un poco
    // más arriba para no chocar en pantallas angostas.
    this._treeBtn = this._buildSmallBtn('🌳', skSize, 'rgba(120,220,140,0.5)');
    this._placeFromBottomRight(this._treeBtn, 600, 270, skSize);
    const onTree = (e) => {
      e.preventDefault();
      this._toggleTreePanel();
      this._treeBtn.style.transform = 'scale(0.88)';
      setTimeout(() => this._treeBtn.style.transform = 'scale(1)', 140);
    };
    this._treeBtn.addEventListener('touchstart', onTree, { passive: false });
    this._treeBtn.addEventListener('click', onTree);
    this._container.appendChild(this._treeBtn);
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
    icon.style.cssText = `font-size:${Math.round(size * 0.45)}px;line-height:1;pointer-events:none;`;

    const layerDot = document.createElement('div');
    layerDot.className = 'skill-layer';
    layerDot.style.cssText = `
      position:absolute;bottom:3px;right:3px;
      width:6px;height:6px;border-radius:50%;
      background:${SKILL_LAYERS.basico};
      pointer-events:none;
    `;

    const cooldown = document.createElement('div');
    cooldown.className = 'skill-cooldown';
    cooldown.style.cssText = `
      position:absolute;bottom:0;left:0;
      width:100%;height:0%;
      background:rgba(0,0,0,0.65);
      transition:height 0.1s linear;
      pointer-events:none;
    `;

    wrap.appendChild(icon);
    wrap.appendChild(layerDot);
    wrap.appendChild(cooldown);

    // El botón ahora llama a castTreeSkill(weapon, branchId, slotId, prog)
    // en vez de castSkill(skillId) directo — necesita weapon+branchId+slotId,
    // guardados en el dataset por _updateButton().
    const onPress = (e) => {
      e.preventDefault();
      if (!wrap.dataset.skillId) return;
      const sys    = this._activeSkillSystem ?? this.skillSystem;
      const prog   = this._activeProgression ?? this.progression;
      const weapon = this._activeWeapon ?? this._weapon;
      sys.castTreeSkill?.(weapon, wrap.dataset.branchId, wrap.dataset.skillId, prog);
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
    btn.dataset.skillId  = skill.id;
    btn.dataset.branchId = skill.branchId;
    btn.querySelector('.skill-icon').textContent = skill.icon ?? '✨';
    const layer      = skill.layer ?? 'basico';
    const layerColor = SKILL_LAYERS[layer] ?? SKILL_LAYERS.basico;
    btn.style.borderColor = layerColor;
    btn.style.opacity     = '1';
    const dot = btn.querySelector('.skill-layer');
    if (dot) dot.style.background = layerColor;
    this._applyCooldown(btn, this._cooldowns[skill.id] ?? 1);
  }

  _applyCooldown(btn, progress) {
    const el = btn.querySelector('.skill-cooldown');
    if (el) el.style.height = `${(1 - progress) * 100}%`;
    btn.style.opacity = progress < 1 ? '0.55' : '1';
  }

  // ══════════════════════════════════════════════════════════════════════
  // Panel de árbol de habilidades — 4 ramas × 9 slots del arma activa,
  // con estado visual y desbloqueo real vía progression.unlockTreeSkill().
  // ══════════════════════════════════════════════════════════════════════

  _buildTreePanel() {
    this._treePanel = document.createElement('div');
    Object.assign(this._treePanel.style, {
      position      : 'fixed',
      inset         : '0',
      display       : 'none',
      background    : 'rgba(4,4,10,0.92)',
      zIndex        : '500',
      overflowY     : 'auto',
      fontFamily    : "'Cinzel',serif",
      padding       : '16px',
      boxSizing     : 'border-box',
    });
    document.body.appendChild(this._treePanel);
  }

  _toggleTreePanel() {
    if (this._treeVisible) this._hideTreePanel();
    else this._showTreePanel();
  }

  _showTreePanel() {
    if (!this._treePanel) return;
    this._treeVisible = true;
    this._treePanel.style.display = 'block';
    this._renderTreePanel();
    // Refresca cada 800ms mientras está abierto — así si el jugador gana
    // xp/reputación/cristales en otra pantalla y vuelve, ve el estado real
    // sin tener que cerrar y reabrir.
    this._treeUpdateInterval = setInterval(() => {
      if (this._treeVisible) this._renderTreePanel();
    }, 800);
  }

  _hideTreePanel() {
    if (!this._treePanel) return;
    this._treeVisible = false;
    this._treePanel.style.display = 'none';
    clearInterval(this._treeUpdateInterval);
  }

  _renderTreePanel() {
    const weapon = this._activeWeapon ?? this._weapon;
    const prog   = this._activeProgression ?? this.progression;
    this._treePanel.innerHTML = '';

    if (!weapon || !prog) {
      this._treePanel.textContent = 'Sin arma activa.';
      return;
    }

    const tree = getWeaponTree(weapon);
    if (!tree) {
      this._treePanel.textContent = 'Árbol de habilidades no disponible para esta arma.';
      return;
    }

    const branchIds = getAllBranchIds(weapon);
    if (!this._treeActiveBranch || !branchIds.includes(this._treeActiveBranch)) {
      this._treeActiveBranch = branchIds[0];
    }

    // ── Header: título + botón cerrar ──────────────────────────────────
    const header = document.createElement('div');
    header.style.cssText = `
      display:flex;justify-content:space-between;align-items:center;
      margin-bottom:14px;color:#eee;
    `;
    header.innerHTML = `<div style="font-size:15px;letter-spacing:2px;">
      ${tree.icon ?? ''} ${tree.label ?? weapon.toUpperCase()} — ÁRBOL DE HABILIDADES
    </div>`;
    const closeBtn = document.createElement('button');
    closeBtn.textContent = '✕';
    closeBtn.style.cssText = `
      background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.2);
      color:#fff;border-radius:8px;padding:6px 12px;cursor:pointer;font-size:14px;
    `;
    closeBtn.addEventListener('click', () => this._hideTreePanel());
    header.appendChild(closeBtn);
    this._treePanel.appendChild(header);

    // ── Tabs de rama ────────────────────────────────────────────────────
    const tabRow = document.createElement('div');
    tabRow.style.cssText = 'display:flex;gap:8px;margin-bottom:16px;flex-wrap:wrap;';
    branchIds.forEach(branchId => {
      const branch = getBranch(weapon, branchId);
      const tab = document.createElement('button');
      const isActive = branchId === this._treeActiveBranch;
      tab.textContent = `${branch.icon ?? ''} ${branch.label ?? branchId}`;
      tab.style.cssText = `
        background:${isActive ? (branch.color ?? '#8844cc') + '33' : 'rgba(255,255,255,0.05)'};
        border:1px solid ${isActive ? (branch.color ?? '#8844cc') : 'rgba(255,255,255,0.15)'};
        color:#eee;border-radius:10px;padding:8px 14px;cursor:pointer;font-size:12px;
        letter-spacing:1px;
      `;
      tab.addEventListener('click', () => {
        this._treeActiveBranch = branchId;
        this._renderTreePanel();
      });
      tabRow.appendChild(tab);
    });
    this._treePanel.appendChild(tabRow);

    // ── Grid de slots de la rama activa ────────────────────────────────
    const branch = getBranch(weapon, this._treeActiveBranch);
    const grid = document.createElement('div');
    grid.style.cssText = `
      display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));
      gap:10px;
    `;

    branch.skills.forEach(skill => {
      grid.appendChild(this._renderSkillSlot(weapon, this._treeActiveBranch, skill, prog, branch.color));
    });

    this._treePanel.appendChild(grid);
  }

  _renderSkillSlot(weapon, branchId, skill, prog, branchColor) {
    const card = document.createElement('div');
    const unlocked = skill.id ? prog.hasPassedTrial(skill.id) : false;
    const isTier3  = skill.tier === 3;
    const canUnlock = !unlocked && !isTier3 && skill.id
      ? prog.canUnlockTreeSkill(weapon, branchId, skill.id)
      : false;

    let borderColor = 'rgba(255,255,255,0.15)';
    let bg          = 'rgba(255,255,255,0.03)';
    let opacity     = '0.45';
    if (unlocked) {
      borderColor = branchColor ?? '#8affc1';
      bg          = (branchColor ?? '#8affc1') + '18';
      opacity     = '1';
    } else if (canUnlock) {
      borderColor = '#ffd166';
      bg          = 'rgba(255,209,102,0.1)';
      opacity     = '0.9';
    }

    card.style.cssText = `
      border:2px solid ${borderColor};background:${bg};border-radius:12px;
      padding:10px;color:#eee;opacity:${opacity};display:flex;flex-direction:column;
      gap:6px;min-height:150px;
    `;

    const title = document.createElement('div');
    title.style.cssText = 'font-size:12px;letter-spacing:1px;display:flex;justify-content:space-between;';
    title.innerHTML = `<span>${skill.icon ?? '✨'} ${skill.name ?? 'Tier ' + skill.tier}</span>
      <span style="font-size:9px;color:#999;">T${skill.tier}</span>`;
    card.appendChild(title);

    const desc = document.createElement('div');
    desc.style.cssText = 'font-size:10px;color:#bbb;flex-grow:1;';
    desc.textContent = skill.desc ?? '';
    card.appendChild(desc);

    if (skill.limitante) {
      const lim = document.createElement('div');
      lim.style.cssText = 'font-size:9px;color:#e08a8a;';
      lim.textContent = `⚠ ${skill.limitante}`;
      card.appendChild(lim);
    }

    if (isTier3) {
      // Tier 3: pausado, candado explícito distinto al de "aún no cumples requisitos"
      const lock = document.createElement('div');
      lock.style.cssText = 'font-size:10px;color:#888;text-align:center;margin-top:auto;';
      lock.textContent = '🔒 Pendiente (contenido narrativo)';
      card.appendChild(lock);
    } else if (unlocked) {
      const badge = document.createElement('div');
      badge.style.cssText = `font-size:10px;color:${branchColor ?? '#8affc1'};text-align:center;margin-top:auto;`;
      badge.textContent = '✓ Desbloqueada';
      card.appendChild(badge);
    } else {
      // Costo + botón de desbloqueo
      const cost = document.createElement('div');
      cost.style.cssText = 'font-size:9px;color:#999;';
      cost.textContent = `XP ${skill.cost?.xp ?? 0} · Rep ${skill.cost?.reputacion ?? 0} · 💎${skill.cost?.cristales ?? 0}`;
      card.appendChild(cost);

      const btn = document.createElement('button');
      btn.textContent = canUnlock ? 'Desbloquear' : 'Bloqueada';
      btn.disabled = !canUnlock;
      btn.style.cssText = `
        margin-top:4px;font-size:10px;padding:6px;border-radius:8px;
        border:1px solid ${canUnlock ? '#ffd166' : 'rgba(255,255,255,0.15)'};
        background:${canUnlock ? 'rgba(255,209,102,0.15)' : 'rgba(255,255,255,0.05)'};
        color:${canUnlock ? '#ffd166' : '#777'};
        cursor:${canUnlock ? 'pointer' : 'not-allowed'};
      `;
      if (canUnlock) {
        btn.addEventListener('click', () => {
          const result = prog.unlockTreeSkill(weapon, branchId, skill.id);
          if (result.ok) {
            this._renderTreePanel(); // refresca el panel al instante
            this.refresh();          // los 3 botones de combate pueden cambiar
          }
        });
      }
      card.appendChild(btn);
    }

    return card;
  }
}
