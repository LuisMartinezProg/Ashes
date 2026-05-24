// ui/skillTree.js — Ashes of the Reborn | Valiant Gaming
import { SKILL_DATA, RARITY_COLORS } from '../core/skillData.js';

const RARITY_LABELS   = { common: 'Común', rare: 'Raro', epic: 'Épico', legendary: 'Legendario' };
const XP_REQUIRED     = { common: 0, rare: 100, epic: 300, legendary: 700 };
const TRIAL_LEVEL     = { common: 0, rare: 2, epic: 5, legendary: 10 };
const SKILL_POINTS_COST = { common: 0, rare: 1, epic: 2, legendary: 3 };

export class SkillTree {
  constructor(progression) {
    this._progression    = progression;
    this._container      = null;
    this._canvas         = null;
    this._ctx            = null;
    this._weapon         = null;
    this._nodes          = [];
    this._selectedNode   = null;
    this._visible        = false;
    this._skillPoints    = 0;
    this._unlockedSkills = {};

    this._build();
  }

  // ── API pública ───────────────────────────────────────────────────────────

  open(weapon) {
    this._weapon  = weapon;
    this._visible = true;
    this._container.style.display = 'flex';
    this._renderTree();
  }

  close() {
    this._visible      = false;
    this._selectedNode = null;
    this._container.style.display = 'none';
  }

  toggle(weapon) {
    this._visible ? this.close() : this.open(weapon);
  }

  addSkillPoints(amount) {
    this._skillPoints += amount;
    if (this._visible) this._renderTree();
  }

  getSkillPoints()          { return this._skillPoints; }
  isSkillConfirmed(skillId) { return !!this._unlockedSkills[skillId]; }

  // ── Build DOM ─────────────────────────────────────────────────────────────

  _build() {
    this._container = document.createElement('div');
    Object.assign(this._container.style, {
      position      : 'fixed',
      inset         : '0',
      display       : 'none',
      flexDirection : 'column',
      background    : 'radial-gradient(ellipse at center, #0d0a1a 0%, #04040a 100%)',
      zIndex        : '200',
      fontFamily    : "'Cinzel', serif",
      userSelect    : 'none',
    });
    document.body.appendChild(this._container);

    // Header
    const header = document.createElement('div');
    Object.assign(header.style, {
      display        : 'flex',
      alignItems     : 'center',
      justifyContent : 'space-between',
      padding        : '12px 20px',
      borderBottom   : '1px solid rgba(201,168,76,0.3)',
      background     : 'rgba(0,0,0,0.4)',
      flexShrink     : '0',
    });

    const left = document.createElement('div');
    Object.assign(left.style, { display: 'flex', alignItems: 'center', gap: '16px' });

    this._titleEl = document.createElement('div');
    Object.assign(this._titleEl.style, {
      color        : '#c9a84c',
      fontSize     : '14px',
      letterSpacing: '3px',
    });
    this._titleEl.textContent = 'ÁRBOL DE HABILIDADES';

    this._pointsEl = document.createElement('div');
    Object.assign(this._pointsEl.style, {
      background   : 'rgba(201,168,76,0.15)',
      border       : '1px solid rgba(201,168,76,0.4)',
      borderRadius : '6px',
      padding      : '4px 10px',
      color        : '#c9a84c',
      fontSize     : '10px',
      letterSpacing: '1px',
    });

    left.appendChild(this._titleEl);
    left.appendChild(this._pointsEl);

    const closeBtn = document.createElement('button');
    closeBtn.textContent = '✕';
    Object.assign(closeBtn.style, {
      background: 'none',
      border    : 'none',
      color     : '#888',
      fontSize  : '18px',
      cursor    : 'pointer',
      padding   : '4px 8px',
    });
    closeBtn.addEventListener('click', () => this.close());

    header.appendChild(left);
    header.appendChild(closeBtn);
    this._container.appendChild(header);

    // XP bar
    this._xpBar = document.createElement('div');
    Object.assign(this._xpBar.style, {
      padding     : '8px 20px',
      background  : 'rgba(0,0,0,0.3)',
      flexShrink  : '0',
      borderBottom: '1px solid rgba(255,255,255,0.05)',
    });
    this._container.appendChild(this._xpBar);

    // Weapon tabs
    const tabs = document.createElement('div');
    Object.assign(tabs.style, {
      display     : 'flex',
      gap         : '6px',
      padding     : '10px 16px',
      background  : 'rgba(0,0,0,0.3)',
      flexShrink  : '0',
      borderBottom: '1px solid rgba(255,255,255,0.05)',
      overflowX   : 'auto',
    });

    const weaponIcons  = { magic: '🔮', katana: '🗡️', sword: '⚔️', bow: '🏹' };
    const weaponLabels = { magic: 'Magia', katana: 'Katana', sword: 'Espada', bow: 'Arco' };

    this._tabs = {};
    Object.keys(SKILL_DATA).forEach(w => {
      const tab = document.createElement('button');
      tab.textContent = `${weaponIcons[w]} ${weaponLabels[w]}`;
      Object.assign(tab.style, {
        background   : 'rgba(255,255,255,0.05)',
        border       : '1px solid rgba(255,255,255,0.1)',
        borderRadius : '6px',
        color        : '#888',
        fontSize     : '11px',
        padding      : '6px 12px',
        cursor       : 'pointer',
        letterSpacing: '1px',
        transition   : 'all 0.2s',
        whiteSpace   : 'nowrap',
      });
      tab.addEventListener('click', () => {
        this._weapon       = w;
        this._selectedNode = null;
        this._renderTree();
        this._hidePanel();
      });
      tabs.appendChild(tab);
      this._tabs[w] = tab;
    });
    this._container.appendChild(tabs);

    // Body
    const body = document.createElement('div');
    Object.assign(body.style, {
      flex    : '1',
      display : 'flex',
      overflow: 'hidden',
      position: 'relative',
    });
    this._container.appendChild(body);

    // Canvas
    this._canvas = document.createElement('canvas');
    Object.assign(this._canvas.style, {
      flex   : '1',
      display: 'block',
      cursor : 'pointer',
    });
    body.appendChild(this._canvas);
    this._canvas.addEventListener('click', e => this._onCanvasClick(e));

    // Panel lateral
    this._panel = document.createElement('div');
    Object.assign(this._panel.style, {
      width        : '0px',
      background   : 'rgba(4,4,14,0.97)',
      borderLeft   : '1px solid rgba(201,168,76,0.2)',
      overflow     : 'hidden',
      transition   : 'width 0.25s ease',
      flexShrink   : '0',
      display      : 'flex',
      flexDirection: 'column',
    });
    body.appendChild(this._panel);

    this._panelInner = document.createElement('div');
    Object.assign(this._panelInner.style, {
      width        : '230px',
      padding      : '20px 16px',
      display      : 'flex',
      flexDirection: 'column',
      gap          : '12px',
      overflowY    : 'auto',
      height       : '100%',
      boxSizing    : 'border-box',
    });
    this._panel.appendChild(this._panelInner);

    window.addEventListener('resize', () => {
      if (this._visible) this._renderTree();
    });
  }

  // ── Render ────────────────────────────────────────────────────────────────

  _renderTree() {
    if (!this._weapon) return;

    this._pointsEl.textContent = `✦ ${this._skillPoints} punto${this._skillPoints !== 1 ? 's' : ''} disponible${this._skillPoints !== 1 ? 's' : ''}`;

    Object.entries(this._tabs).forEach(([w, tab]) => {
      const active = w === this._weapon;
      tab.style.background  = active ? 'rgba(201,168,76,0.2)' : 'rgba(255,255,255,0.05)';
      tab.style.borderColor = active ? 'rgba(201,168,76,0.6)' : 'rgba(255,255,255,0.1)';
      tab.style.color       = active ? '#c9a84c' : '#888';
    });

    const xp    = this._progression.getXP(this._weapon);
    const xpPct = Math.min((xp / 700) * 100, 100);
    this._xpBar.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:5px;">
        <span style="color:#888;font-size:9px;letter-spacing:2px;">EXPERIENCIA</span>
        <span style="color:#c9a84c;font-size:10px;">${xp} / 700 XP</span>
      </div>
      <div style="background:rgba(255,255,255,0.08);border-radius:4px;height:4px;overflow:hidden;">
        <div style="background:linear-gradient(90deg,#c9a84c,#ffdd88);height:100%;width:${xpPct}%;transition:width 0.4s;border-radius:4px;"></div>
      </div>
    `;

    const dpr = window.devicePixelRatio || 1;
    const W   = this._canvas.offsetWidth;
    const H   = this._canvas.offsetHeight;
    this._canvas.width  = W * dpr;
    this._canvas.height = H * dpr;
    this._ctx = this._canvas.getContext('2d');
    this._ctx.scale(dpr, dpr);
    this._ctx.clearRect(0, 0, W, H);

    const weaponData = SKILL_DATA[this._weapon];
    const subtypes   = Object.entries(weaponData.subtypes);
    const cols       = subtypes.length;
    const padX       = 60;
    const padY       = 60;
    const colW       = (W - padX * 2) / cols;
    const rowH       = (H - padY * 2) / 4;
    const nodeR      = Math.min(colW * 0.18, 30);

    this._nodes = [];

    subtypes.forEach(([subtypeId, subtype], col) => {
      const cx       = padX + colW * col + colW / 2;
      const unlocked = this._progression.isSubtypeUnlocked(this._weapon, subtypeId);

      subtype.skills.forEach((skill, row) => {
        const cy        = padY + rowH * row + rowH / 2;
        const xpReady   = xp >= XP_REQUIRED[skill.rarity];
        const hasTrial  = this._progression.hasPassedTrial(skill.id);
        const confirmed = !!this._unlockedSkills[skill.id];
        const available = this._progression.isSkillAvailable(this._weapon, subtypeId, skill.id) || confirmed;
        const canUnlock = unlocked && xpReady
          && (TRIAL_LEVEL[skill.rarity] === 0 || hasTrial)
          && !confirmed && !available;

        this._nodes.push({
          x: cx, y: cy, r: nodeR,
          skill, subtypeId, subtype,
          unlocked, available, canUnlock, xpReady, hasTrial, confirmed,
          col, row,
        });
      });
    });

    // Líneas verticales
    subtypes.forEach(([subtypeId], col) => {
      const colNodes = this._nodes.filter(n => n.col === col);
      for (let i = 0; i < colNodes.length - 1; i++) {
        const a    = colNodes[i];
        const b    = colNodes[i + 1];
        const grad = this._ctx.createLinearGradient(a.x, a.y, b.x, b.y);
        grad.addColorStop(0, a.available ? RARITY_COLORS[a.skill.rarity] + 'bb' : 'rgba(80,80,80,0.3)');
        grad.addColorStop(1, b.available ? RARITY_COLORS[b.skill.rarity] + 'bb' : 'rgba(80,80,80,0.3)');
        this._ctx.beginPath();
        this._ctx.strokeStyle = grad;
        this._ctx.lineWidth   = 2.5;
        this._ctx.setLineDash(a.available && b.available ? [] : [5, 5]);
        this._ctx.moveTo(a.x, a.y);
        this._ctx.lineTo(b.x, b.y);
        this._ctx.stroke();
        this._ctx.setLineDash([]);
      }
    });

    // Líneas horizontales superiores
    const topNodes = this._nodes.filter(n => n.row === 0);
    for (let i = 0; i < topNodes.length - 1; i++) {
      const a = topNodes[i];
      const b = topNodes[i + 1];
      this._ctx.beginPath();
      this._ctx.strokeStyle = 'rgba(201,168,76,0.15)';
      this._ctx.lineWidth   = 1.5;
      this._ctx.setLineDash([4, 6]);
      this._ctx.moveTo(a.x, a.y);
      this._ctx.lineTo(b.x, b.y);
      this._ctx.stroke();
      this._ctx.setLineDash([]);
    }

    this._nodes.forEach(n => this._drawNode(n));

    if (this._selectedNode) {
      const updated = this._nodes.find(n => n.skill.id === this._selectedNode.skill.id);
      if (updated) { this._selectedNode = updated; this._showPanel(updated); }
    }
  }

  _drawNode(n) {
    const ctx        = this._ctx;
    const color      = RARITY_COLORS[n.skill.rarity];
    const isSelected = this._selectedNode?.skill.id === n.skill.id;
    const r          = n.r + (isSelected ? 4 : 0);

    // Pulso dorado para listos a desbloquear
    if (n.canUnlock) {
      ctx.save();
      ctx.shadowColor = '#ffdd88';
      ctx.shadowBlur  = 20;
      ctx.beginPath();
      ctx.arc(n.x, n.y, r + 2, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(255,221,136,0.5)';
      ctx.lineWidth   = 2;
      ctx.stroke();
      ctx.restore();
    }

    // Glow
    if (n.available) {
      ctx.save();
      ctx.shadowColor = color;
      ctx.shadowBlur  = isSelected ? 22 : 12;
      ctx.beginPath();
      ctx.arc(n.x, n.y, r, 0, Math.PI * 2);
      ctx.fillStyle = 'transparent';
      ctx.fill();
      ctx.restore();
    }

    // Fondo
    ctx.beginPath();
    ctx.arc(n.x, n.y, r, 0, Math.PI * 2);
    const grad = ctx.createRadialGradient(n.x - r * 0.3, n.y - r * 0.3, 0, n.x, n.y, r);
    if (n.available) {
      grad.addColorStop(0, '#1a1030');
      grad.addColorStop(1, '#0a0818');
    } else if (n.canUnlock) {
      grad.addColorStop(0, '#1a1505');
      grad.addColorStop(1, '#0d0e02');
    } else {
      grad.addColorStop(0, '#111118');
      grad.addColorStop(1, '#08080f');
    }
    ctx.fillStyle = grad;
    ctx.fill();

    // Borde
    ctx.beginPath();
    ctx.arc(n.x, n.y, r, 0, Math.PI * 2);
    ctx.strokeStyle = n.available
      ? color + (isSelected ? 'ff' : 'cc')
      : n.canUnlock ? '#ffdd8899' : 'rgba(80,80,80,0.4)';
    ctx.lineWidth = isSelected ? 2.5 : 1.5;
    ctx.stroke();

    // Icono
    ctx.textAlign    = 'center';
    ctx.textBaseline = 'middle';
    if (!n.available && !n.canUnlock) {
      ctx.font        = `${Math.round(r * 0.85)}px serif`;
      ctx.globalAlpha = 0.2;
      ctx.fillText(n.skill.icon, n.x, n.y);
      ctx.globalAlpha = 1;
      ctx.font        = `${Math.round(r * 0.5)}px serif`;
      ctx.fillText('🔒', n.x, n.y);
    } else {
      ctx.font        = `${Math.round(r * 0.85)}px serif`;
      ctx.globalAlpha = n.canUnlock ? 0.65 : 1;
      ctx.fillText(n.skill.icon, n.x, n.y);
      ctx.globalAlpha = 1;
    }

    // Punto rareza
    ctx.beginPath();
    ctx.arc(n.x, n.y + r + 5, 3, 0, Math.PI * 2);
    ctx.fillStyle = n.available ? color : n.canUnlock ? '#ffdd88' : 'rgba(80,80,80,0.4)';
    ctx.fill();

    // Label subtype
    if (n.row === 0) {
      ctx.font      = `9px 'Cinzel', serif`;
      ctx.textAlign = 'center';
      ctx.fillStyle = n.subtype.color + (n.unlocked ? 'dd' : '44');
      ctx.fillText(n.subtype.label.toUpperCase(), n.x, n.y - r - 14);
    }
  }

  // ── Click ─────────────────────────────────────────────────────────────────

  _onCanvasClick(e) {
    const rect = this._canvas.getBoundingClientRect();
    const mx   = e.clientX - rect.left;
    const my   = e.clientY - rect.top;
    const hit  = this._nodes.find(n => {
      const dx = n.x - mx, dy = n.y - my;
      return Math.sqrt(dx * dx + dy * dy) <= n.r + 10;
    });
    if (hit) {
      this._selectedNode = hit;
      this._renderTree();
      this._showPanel(hit);
    } else {
      this._selectedNode = null;
      this._renderTree();
      this._hidePanel();
    }
  }

  // ── Panel ─────────────────────────────────────────────────────────────────

  _showPanel(n) {
    this._panel.style.width = '230px';
    const skill    = n.skill;
    const color    = RARITY_COLORS[skill.rarity];
    const xp       = this._progression.getXP(this._weapon);
    const xpNeeded = XP_REQUIRED[skill.rarity];
    const trialLvl = TRIAL_LEVEL[skill.rarity];
    const hasTrial = n.hasTrial;
    const cost     = SKILL_POINTS_COST[skill.rarity];
    const xpPct    = xpNeeded > 0 ? Math.min((xp / xpNeeded) * 100, 100) : 100;

    const activeSubtype = this._progression.getActiveSubtype(this._weapon);
    const isActive      = activeSubtype === n.subtypeId;

    const mission     = window._branchMissions?.getMissionDef(this._weapon, n.subtypeId);
    const missionDone = window._branchMissions?.isCompleted(this._weapon, n.subtypeId);

    let statusHtml = '';
    if (n.available) {
      statusHtml = `<div style="color:#4cff88;font-size:9px;letter-spacing:1px;">✓ DESBLOQUEADA</div>`;
    } else if (n.canUnlock) {
      statusHtml = `
        <div style="color:#ffdd88;font-size:9px;letter-spacing:1px;">⬆ LISTA PARA DESBLOQUEAR</div>
        <div style="color:#888;font-size:9px;margin-top:3px;">Coste: ${cost} punto${cost !== 1 ? 's' : ''}</div>
      `;
    } else {
      const reasons = [];
      if (xp < xpNeeded) reasons.push(`Faltan ${xpNeeded - xp} XP`);
      if (trialLvl > 0 && !hasTrial) reasons.push(`Completa la misión de rama`);
      statusHtml = `
        <div style="color:#ff6644;font-size:9px;letter-spacing:1px;">🔒 BLOQUEADA</div>
        ${reasons.map(r => `<div style="color:#555;font-size:9px;margin-top:3px;">· ${r}</div>`).join('')}
      `;
    }

    let actionsHtml = '';
    if (n.available) {
      actionsHtml = `
        <button data-action="activate" style="
          background:${isActive ? 'rgba(80,80,80,0.1)' : 'rgba(201,168,76,0.2)'};
          border:1px solid ${isActive ? '#444' : color + '88'};
          border-radius:6px;color:${isActive ? '#555' : '#c9a84c'};
          font-family:'Cinzel',serif;font-size:9px;letter-spacing:2px;
          padding:10px;cursor:${isActive ? 'default' : 'pointer'};width:100%;
        ">${isActive ? '✓ RAMA ACTIVA' : 'ACTIVAR RAMA'}</button>
      `;
    } else if (n.canUnlock) {
      const canAfford = this._skillPoints >= cost;
      actionsHtml = `
        <button data-action="unlock" ${!canAfford ? 'disabled' : ''} style="
          background:${canAfford ? 'rgba(255,221,136,0.2)' : 'rgba(80,80,80,0.1)'};
          border:1px solid ${canAfford ? '#ffdd8888' : '#333'};
          border-radius:6px;color:${canAfford ? '#ffdd88' : '#444'};
          font-family:'Cinzel',serif;font-size:9px;letter-spacing:2px;
          padding:10px;cursor:${canAfford ? 'pointer' : 'not-allowed'};width:100%;
        ">${canAfford ? `✦ DESBLOQUEAR (${cost} pts)` : 'SIN PUNTOS SUFICIENTES'}</button>
      `;
    }

    this._panelInner.innerHTML = `
      <div style="text-align:center;">
        <div style="font-size:44px;margin-bottom:8px;">${skill.icon}</div>
        <div style="color:${color};font-size:13px;letter-spacing:2px;margin-bottom:4px;">${skill.label}</div>
        <div style="color:${color}88;font-size:9px;letter-spacing:3px;">${RARITY_LABELS[skill.rarity].toUpperCase()}</div>
      </div>

      <div style="border-top:1px solid rgba(255,255,255,0.06);padding-top:12px;">
        <div style="color:#555;font-size:8px;letter-spacing:2px;margin-bottom:6px;">RAMA</div>
        <div style="color:${n.subtype.color};font-size:10px;">${n.subtype.icon} ${n.subtype.label}</div>
      </div>

      <div style="border-top:1px solid rgba(255,255,255,0.06);padding-top:12px;display:flex;flex-direction:column;gap:6px;">
        <div style="display:flex;justify-content:space-between;">
          <span style="color:#555;font-size:9px;">COSTE</span>
          <span style="color:#c9a84c;font-size:10px;">${skill.cost} ✦</span>
        </div>
        <div style="display:flex;justify-content:space-between;">
          <span style="color:#555;font-size:9px;">RECARGA</span>
          <span style="color:#4488ff;font-size:10px;">${skill.cooldown}s</span>
        </div>
        <div style="display:flex;justify-content:space-between;">
          <span style="color:#555;font-size:9px;">XP REQUERIDA</span>
          <span style="color:#888;font-size:10px;">${xpNeeded}</span>
        </div>
        ${trialLvl > 0 ? `
        <div style="display:flex;justify-content:space-between;">
          <span style="color:#555;font-size:9px;">MISIÓN</span>
          <span style="color:${missionDone ? '#4cff88' : '#ff6644'};font-size:10px;">
            ${missionDone ? '✓ Completada' : 'Pendiente'}
          </span>
        </div>` : ''}
      </div>

      ${xpNeeded > 0 ? `
      <div>
        <div style="display:flex;justify-content:space-between;margin-bottom:4px;">
          <span style="color:#555;font-size:8px;letter-spacing:1px;">PROGRESO XP</span>
          <span style="color:#888;font-size:8px;">${Math.round(xpPct)}%</span>
        </div>
        <div style="background:rgba(255,255,255,0.06);border-radius:3px;height:3px;overflow:hidden;">
          <div style="background:linear-gradient(90deg,${color}88,${color});height:100%;width:${xpPct}%;border-radius:3px;"></div>
        </div>
      </div>` : ''}

      ${mission ? `
      <div style="border-top:1px solid rgba(255,255,255,0.06);padding-top:12px;">
        <div style="display:flex;align-items:center;gap:6px;margin-bottom:8px;">
          <span style="font-size:14px;">${mission.icon}</span>
          <span style="color:${missionDone ? '#4cff88' : mission.color};font-size:9px;letter-spacing:2px;">
            ${missionDone ? '✓ MISIÓN COMPLETADA' : mission.label.toUpperCase()}
          </span>
        </div>
        ${mission.objectives.map(obj => {
          const current = window._branchMissions?.getObjectiveProgress(this._weapon, n.subtypeId, obj.id) ?? 0;
          const pct     = Math.min((current / obj.target) * 100, 100);
          return `
            <div style="margin-bottom:8px;">
              <div style="display:flex;justify-content:space-between;margin-bottom:3px;">
                <span style="color:#555;font-size:8px;">${obj.label}</span>
                <span style="color:#888;font-size:8px;">${Math.min(current, obj.target)} / ${obj.target}</span>
              </div>
              <div style="background:rgba(255,255,255,0.06);border-radius:3px;height:3px;overflow:hidden;">
                <div style="background:${missionDone ? '#4cff88' : mission.color};height:100%;width:${pct}%;border-radius:3px;"></div>
              </div>
            </div>
          `;
        }).join('')}
      </div>` : ''}

      <div style="border-top:1px solid rgba(255,255,255,0.06);padding-top:12px;">
        ${statusHtml}
      </div>

      <div style="margin-top:auto;padding-top:8px;">
        ${actionsHtml}
      </div>
    `;

    const unlockBtn   = this._panelInner.querySelector('[data-action="unlock"]');
    const activateBtn = this._panelInner.querySelector('[data-action="activate"]');

    if (unlockBtn) {
      unlockBtn.addEventListener('click', () => {
        if (this._skillPoints < cost) return;
        this._skillPoints -= cost;
        this._unlockedSkills[skill.id] = true;
        this._progression.passTrialForSkill(skill.id);
        this._selectedNode = null;
        this._renderTree();
        const updated = this._nodes.find(n => n.skill.id === skill.id);
        if (updated) { this._selectedNode = updated; this._showPanel(updated); }
        this._showUnlockFeedback(skill);
      });
    }

    if (activateBtn && !isActive) {
      activateBtn.addEventListener('click', () => {
        this._progression.setActiveSubtype(this._weapon, n.subtypeId);
        this._renderTree();
      });
    }
  }

  _hidePanel() {
    this._panel.style.width    = '0px';
    this._panelInner.innerHTML = '';
  }

  _showUnlockFeedback(skill) {
    const color = RARITY_COLORS[skill.rarity];
    const el    = document.createElement('div');
    Object.assign(el.style, {
      position     : 'fixed',
      top          : '20%',
      left         : '50%',
      transform    : 'translateX(-50%) scale(0.85)',
      fontFamily   : "'Cinzel',serif",
      textAlign    : 'center',
      background   : 'rgba(4,4,10,0.97)',
      border       : `1px solid ${color}55`,
      borderRadius : '8px',
      padding      : '14px 28px',
      zIndex       : '600',
      pointerEvents: 'none',
      boxShadow    : `0 0 24px ${color}44`,
      transition   : 'transform 0.35s ease, opacity 0.35s ease',
      opacity      : '0',
    });
    el.innerHTML = `${skill.icon} HABILIDAD DESBLOQUEADA<br>
      <span style="font-size:10px;color:#888;">${skill.label}</span>`;
    document.body.appendChild(el);
    requestAnimationFrame(() => {
      el.style.opacity   = '1';
      el.style.transform = 'translateX(-50%) scale(1)';
    });
    setTimeout(() => {
      el.style.opacity   = '0';
      el.style.transform = 'translateX(-50%) scale(0.9)';
      setTimeout(() => el.remove(), 500);
    }, 2500);
  }
}
