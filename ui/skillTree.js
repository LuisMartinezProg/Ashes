/**
 * ui/skillTree.js — Árbol visual de habilidades
 */

import { SKILLS, SKILL_CATEGORIES, canCombine, getAvailableSkills } from '../data/skills.js';

export class SkillTree {
  constructor(progression) {
    this._prog     = progression;
    this._panel    = null;
    this._open     = false;
    this._active   = [null, null]; // dos slots activos
    this._unlocked = [];
    this._category = 'ofensiva';
    this._buildUI();
  }

  // ─────────────────────────────────────────────
  // UI
  // ─────────────────────────────────────────────
  _buildUI() {
    this._panel = document.createElement('div');
    Object.assign(this._panel.style, {
      position  : 'fixed', inset: '0',
      background: 'rgba(4,4,10,0.96)',
      zIndex    : '500', display: 'none',
      flexDirection: 'column',
    });
    document.body.appendChild(this._panel);
  }

  _render() {
    const level    = this._prog?._level || 1;
    const cats     = ['ofensiva','defensiva','movilidad','soporte','estrategica'];
    const catIcons = { ofensiva:'⚔️', defensiva:'🛡️', movilidad:'💨', soporte:'💚', estrategica:'🌀' };
    const catLocked = { estrategica: !this._prog?.getFlag?.('estrategica_desbloqueada') };

    this._panel.innerHTML = `
      <div style="display:flex;align-items:center;justify-content:space-between;
           padding:16px 20px;border-bottom:1px solid rgba(201,168,76,0.15);">
        <span style="font-family:'Cinzel',serif;font-size:11px;letter-spacing:4px;color:#c9a84c;">
          ÁRBOL DE HABILIDADES
        </span>
        <div style="display:flex;gap:8px;align-items:center;">
          <span style="font-family:monospace;font-size:11px;color:#8a6f2e;">
            NIV ${level}
          </span>
          <button id="skill-tree-close"
            style="background:none;border:none;color:#5a4e3a;font-size:20px;cursor:pointer;">✕</button>
        </div>
      </div>

      <!-- Slots activos -->
      <div style="padding:12px 20px;border-bottom:1px solid rgba(201,168,76,0.1);">
        <div style="font-family:'Cinzel',serif;font-size:9px;letter-spacing:3px;
             color:#5a4e3a;margin-bottom:8px;">HABILIDADES ACTIVAS</div>
        <div style="display:flex;gap:10px;">
          ${[0,1].map(i => {
            const sk = this._active[i] ? SKILLS[this._active[i]] : null;
            return `
              <div data-slot="${i}" style="flex:1;min-height:52px;
                border:1px solid rgba(201,168,76,${sk?'0.4':'0.15'});
                border-radius:8px;padding:8px 12px;
                background:rgba(201,168,76,${sk?'0.08':'0.02'});
                cursor:${sk?'pointer':'default'};">
                ${sk ? `
                  <div style="font-size:16px;">${sk.icon}</div>
                  <div style="font-family:'Cinzel',serif;font-size:9px;
                       letter-spacing:1px;color:#c9a84c;margin-top:2px;">${sk.name}</div>
                  <div style="font-size:9px;color:#5a4e3a;">${sk.type}</div>
                ` : `
                  <div style="font-family:'Cinzel',serif;font-size:9px;
                       letter-spacing:2px;color:#3a3028;">SLOT ${i+1} VACÍO</div>
                `}
              </div>
            `;
          }).join('')}
        </div>
      </div>

      <!-- Tabs de categoría -->
      <div style="display:flex;overflow-x:auto;border-bottom:1px solid rgba(201,168,76,0.1);
           padding:0 12px;">
        ${cats.map(c => `
          <button data-cat="${c}"
            style="font-family:'Cinzel',serif;font-size:9px;letter-spacing:2px;
                   color:${this._category===c?'#c9a84c':'#5a4e3a'};
                   background:none;border:none;
                   border-bottom:2px solid ${this._category===c?'#c9a84c':'transparent'};
                   padding:10px 12px;cursor:pointer;white-space:nowrap;
                   opacity:${catLocked[c]?'0.4':'1'};">
            ${catIcons[c]} ${c.toUpperCase()}
            ${catLocked[c]?'🔒':''}
          </button>
        `).join('')}
      </div>

      <!-- Árbol vertical -->
      <div id="skill-tree-list" style="flex:1;overflow-y:auto;padding:16px 20px;
           display:flex;flex-direction:column;align-items:center;gap:0;"></div>
    `;

    // Eventos
    this._panel.querySelector('#skill-tree-close').addEventListener('click', () => this.close());

    this._panel.querySelectorAll('[data-cat]').forEach(btn => {
      btn.addEventListener('click', () => {
        if (catLocked[btn.dataset.cat]) return;
        this._category = btn.dataset.cat;
        this._render();
      });
    });

    this._panel.querySelectorAll('[data-slot]').forEach(el => {
      el.addEventListener('click', () => {
        const i = parseInt(el.dataset.slot);
        if (this._active[i]) {
          this._active[i] = null;
          this._render();
        }
      });
    });

    this._renderTree();
  }

  _renderTree() {
    const container = this._panel.querySelector('#skill-tree-list');
    const level     = this._prog?._level || 1;
    const cat       = this._category;

    // Agrupar por nivel
    const byLevel = {};
    Object.values(SKILLS).filter(s => s.category === cat).forEach(s => {
      if (!byLevel[s.level]) byLevel[s.level] = [];
      byLevel[s.level].push(s);
    });

    container.innerHTML = '';

    Object.keys(byLevel).sort().forEach(lv => {
      const skills = byLevel[lv];
      const lvNum  = parseInt(lv);

      // Línea de nivel
      const lvLabel = document.createElement('div');
      Object.assign(lvLabel.style, {
        fontFamily: "'Cinzel',serif", fontSize: '9px',
        letterSpacing: '3px', color: '#5a4e3a',
        margin: '8px 0 4px', alignSelf: 'flex-start',
      });
      lvLabel.textContent = `NIVEL ${lvNum}`;
      container.appendChild(lvLabel);

      // Habilidades del nivel
      const row = document.createElement('div');
      Object.assign(row.style, {
        display: 'flex', gap: '10px', width: '100%',
        marginBottom: '4px',
      });

      skills.forEach(sk => {
        const isUnlocked  = this._unlocked.includes(sk.id);
        const isAvailable = sk.unlockLevel <= level && this._checkRequires(sk);
        const isActive    = this._active.includes(sk.id);
        const isLocked    = sk.unlockLevel > level;

        const card = document.createElement('div');
        Object.assign(card.style, {
          flex: '1', borderRadius: '8px', padding: '10px 12px',
          border: `1px solid rgba(201,168,76,${isActive?'0.6':isUnlocked?'0.25':'0.1'})`,
          background: `rgba(201,168,76,${isActive?'0.15':isUnlocked?'0.06':'0.02'})`,
          opacity: isLocked ? '0.4' : '1',
          cursor: isAvailable && !isLocked ? 'pointer' : 'default',
          transition: 'all .2s',
        });

        card.innerHTML = `
          <div style="display:flex;justify-content:space-between;align-items:flex-start;">
            <span style="font-size:18px;">${sk.icon}</span>
            <span style="font-family:monospace;font-size:9px;color:#5a4e3a;">
              ${isLocked ? `NIV ${sk.unlockLevel}` : sk.type.toUpperCase()}
            </span>
          </div>
          <div style="font-family:'Cinzel',serif;font-size:10px;letter-spacing:1px;
               color:${isActive?'#e8c97a':'#c9a84c'};margin:4px 0 2px;">${sk.name}</div>
          <div style="font-family:'Crimson Pro',serif;font-size:12px;color:#9a8c7a;
               line-height:1.4;">${sk.desc}</div>
          <div style="font-size:10px;color:#5a4e3a;margin-top:4px;font-style:italic;">
            ⚠ ${sk.limit}
          </div>
          ${isActive ? '<div style="font-size:9px;color:#2ecc71;margin-top:4px;">✓ ACTIVA</div>' : ''}
        `;

        if (isAvailable && !isLocked) {
          card.addEventListener('click', () => this._toggleSkill(sk.id));
        }

        row.appendChild(card);
      });

      container.appendChild(row);

      // Conector vertical entre niveles
      if (parseInt(lv) < Math.max(...Object.keys(byLevel).map(Number))) {
        const connector = document.createElement('div');
        Object.assign(connector.style, {
          width: '1px', height: '20px',
          background: 'linear-gradient(180deg, rgba(201,168,76,0.3), transparent)',
          margin: '0 auto',
        });
        container.appendChild(connector);
      }
    });
  }

  _checkRequires(sk) {
    if (!sk.requires) return true;
    const reqs = Array.isArray(sk.requires) ? sk.requires : [sk.requires];
    return reqs.some(r => this._unlocked.includes(r));
  }

  _toggleSkill(id) {
    if (this._active.includes(id)) {
      this._active = this._active.map(a => a === id ? null : a);
      this._render();
      return;
    }

    // Buscar slot vacío
    const emptySlot = this._active.indexOf(null);
    if (emptySlot === -1) {
      // Reemplazar slot 0
      this._tryAssign(0, id);
    } else {
      this._tryAssign(emptySlot, id);
    }
  }

  _tryAssign(slot, id) {
    const other = this._active[slot === 0 ? 1 : 0];
    if (!canCombine(id, other)) {
      this._showError('Combinación inválida — necesitas al menos una habilidad básica.');
      return;
    }
    if (!this._unlocked.includes(id)) this._unlocked.push(id);
    this._active[slot] = id;
    this._render();
    this._prog?.setFlag?.('active_skills', [...this._active]);
  }

  _showError(msg) {
    const el = document.createElement('div');
    Object.assign(el.style, {
      position: 'fixed', bottom: '120px', left: '50%',
      transform: 'translateX(-50%)',
      fontFamily: "'Cinzel',serif", fontSize: '10px',
      letterSpacing: '2px', color: '#e74c3c',
      background: 'rgba(13,11,9,0.95)',
      border: '1px solid rgba(231,76,60,0.4)',
      borderRadius: '6px', padding: '10px 20px',
      zIndex: '600', pointerEvents: 'none',
      transition: 'opacity .5s',
    });
    el.textContent = msg;
    document.body.appendChild(el);
    setTimeout(() => { el.style.opacity = '0'; setTimeout(() => el.remove(), 500); }, 2000);
  }

  // ─────────────────────────────────────────────
  // ABRIR / CERRAR
  // ─────────────────────────────────────────────
  open() {
    this._open = true;
    this._panel.style.display = 'flex';
    this._render();
  }

  close() {
    this._open = false;
    this._panel.style.display = 'none';
  }

  toggle() { this._open ? this.close() : this.open(); }
  isOpen() { return this._open; }
  getActiveSkills() { return [...this._active]; }
}
