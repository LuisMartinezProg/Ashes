/**
 * ui/buildMenu.js — Menú de construcción (estilo skillTree)
 */

import { STRUCTURES } from '../data/structures.js';

export class BuildMenu {
  constructor(building) {
    this._building = building;
    this._open     = false;
    this._panel    = null;
    this._buildBtn = null;
    this._category = 'basico';

    this._buildUI();
    building._onInventoryChange = () => { if (this._open) this._render(); };
    building._onBuildComplete   = () => { if (this._open) this._render(); };
  }

  _buildUI() {
    this._buildBtn = document.createElement('button');
    this._buildBtn.innerHTML = '🏗';
    Object.assign(this._buildBtn.style, {
      position: 'fixed', bottom: '90px', right: '24px',
      width: '52px', height: '52px', borderRadius: '12px',
      border: '1px solid rgba(201,168,76,0.4)',
      background: 'rgba(10,8,20,0.88)', color: '#C9A84C',
      fontSize: '22px', cursor: 'pointer', zIndex: '150',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      WebkitTapHighlightColor: 'transparent',
      boxShadow: '0 2px 12px rgba(0,0,0,0.4)',
    });
    this._buildBtn.addEventListener('click', () => this.toggle());
    this._buildBtn.addEventListener('touchstart', (e) => { e.preventDefault(); this.toggle(); }, { passive: false });
    document.body.appendChild(this._buildBtn);

    this._panel = document.createElement('div');
    Object.assign(this._panel.style, {
      position     : 'fixed',
      inset        : '0',
      background   : 'rgba(4,4,10,0.96)',
      zIndex       : '500',
      display      : 'none',
      flexDirection: 'column',
      pointerEvents: 'all',
    });
    document.body.appendChild(this._panel);
  }

  _render() {
    const inv  = this._building.getInventory();
    const name = this._building.getTownName();
    const cats = ['basico', 'defensa', 'edificios', 'herramientas'];
    const catIcons = { basico:'🔥', defensa:'🛡️', edificios:'🏠', herramientas:'⚒️' };

    this._panel.innerHTML = `
      <div style="display:flex;align-items:center;justify-content:space-between;
           padding:16px 20px;border-bottom:1px solid rgba(201,168,76,0.15);">
        <span style="font-family:'Cinzel',serif;font-size:11px;letter-spacing:4px;color:#c9a84c;">
          CONSTRUCCIÓN${name ? ' — ' + name.toUpperCase() : ''}
        </span>
        <button id="build-close"
          style="background:none;border:1px solid rgba(201,168,76,0.3);
          color:#c9a84c;font-size:20px;cursor:pointer;
          width:36px;height:36px;border-radius:50%;
          display:flex;align-items:center;justify-content:center;
          pointer-events:all;">✕</button>
      </div>

      <div style="padding:10px 20px;border-bottom:1px solid rgba(201,168,76,0.1);
           display:flex;gap:16px;flex-wrap:wrap;">
        ${Object.entries(inv).map(([k, v]) => `
          <div style="font-family:'Cinzel',serif;font-size:10px;letter-spacing:2px;
               color:rgba(201,168,76,0.8);display:flex;align-items:center;gap:6px;">
            <span>${k==='madera'?'🪵':k==='piedra'?'🪨':k==='hierro'?'⚙️':'💎'}</span>
            <span>${v}</span>
            <span style="color:#5a4e3a;font-size:9px;">${k.toUpperCase()}</span>
          </div>
        `).join('')}
      </div>

      <div style="display:flex;overflow-x:auto;border-bottom:1px solid rgba(201,168,76,0.1);
           padding:0 12px;">
        ${cats.map(c => `
          <button data-cat="${c}"
            style="font-family:'Cinzel',serif;font-size:9px;letter-spacing:2px;
                   color:${this._category===c?'#c9a84c':'#5a4e3a'};
                   background:none;border:none;
                   border-bottom:2px solid ${this._category===c?'#c9a84c':'transparent'};
                   padding:10px 12px;cursor:pointer;white-space:nowrap;
                   pointer-events:all;">
            ${catIcons[c]} ${c.toUpperCase()}
          </button>
        `).join('')}
      </div>

      <div id="build-list" style="flex:1;overflow-y:auto;padding:16px 20px;
           display:flex;flex-direction:column;gap:10px;"></div>
    `;

    this._panel.querySelector('#build-close')
      .addEventListener('click', () => this.close());
    this._panel.querySelector('#build-close')
      .addEventListener('touchstart', (e) => { e.preventDefault(); this.close(); }, { passive: false });

    this._panel.querySelectorAll('[data-cat]').forEach(btn => {
      btn.addEventListener('click', () => {
        this._category = btn.dataset.cat;
        this._render();
      });
    });

    this._renderList();
  }

  _renderList() {
    const el  = this._panel.querySelector('#build-list');
    const map = {
      basico      : ['fogata', 'refugio'],
      defensa     : ['muro', 'puerta', 'torre'],
      edificios   : ['casa_protagonista', 'herreria', 'fuente', 'enfermeria', 'casa_theron', 'casa_aelith', 'casa_korrath'],
      herramientas: null,
    };

    if (this._category === 'herramientas') {
      this._renderTools(el);
      return;
    }

    const ids = map[this._category] || [];
    el.innerHTML = '';

    ids.forEach(id => {
      const def      = STRUCTURES[id];
      const tier     = 'madera';
      const td       = def.tiers[tier];
      const canBuild = td && this._building.hasMaterials(td.cost);
      const locked   = def.blueprint && !this._building._prog?.getFlag?.('blueprint_' + id);

      const card = document.createElement('div');
      Object.assign(card.style, {
        borderRadius: '8px', padding: '12px 14px',
        border: `1px solid rgba(201,168,76,${locked?'0.08':'0.18'})`,
        background: `rgba(201,168,76,${locked?'0.02':'0.05'})`,
        opacity: locked ? '0.5' : '1',
      });

      card.innerHTML = `
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">
          <span style="font-family:'Cinzel',serif;font-size:11px;letter-spacing:2px;color:#c9a84c;">
            ${def.icon} ${def.label}
          </span>
          ${locked
            ? '<span style="font-family:monospace;font-size:9px;color:#5a4e3a;letter-spacing:1px;">BOCETO REQUERIDO</span>'
            : `<button data-id="${id}" data-tier="${tier}"
                 style="font-family:'Cinzel',serif;font-size:9px;letter-spacing:2px;
                        color:${canBuild?'#c9a84c':'#5a4e3a'};
                        background:rgba(201,168,76,${canBuild?'0.1':'0.03'});
                        border:1px solid rgba(201,168,76,${canBuild?'0.3':'0.1'});
                        border-radius:4px;padding:6px 12px;cursor:pointer;pointer-events:all;">
                 CONSTRUIR
               </button>`
          }
        </div>
        <div style="font-family:'Crimson Pro',serif;font-size:13px;color:#9a8c7a;
             line-height:1.4;margin-bottom:6px;">${def.desc}</div>
        ${td ? `<div style="font-size:10px;color:#5a4e3a;font-family:monospace;">
          ${Object.entries(td.cost).map(([k,v])=>`${v} ${k}`).join(' · ')} · HP: ${td.hp}
        </div>` : ''}
      `;

      el.appendChild(card);
    });

    el.querySelectorAll('button[data-id]').forEach(btn => {
      btn.addEventListener('click', () => {
        this._building.startPlacing(btn.dataset.id, btn.dataset.tier);
        this.close();
        this._showPlacingHint();
      });
      btn.addEventListener('touchstart', (e) => {
        e.preventDefault();
        this._building.startPlacing(btn.dataset.id, btn.dataset.tier);
        this.close();
        this._showPlacingHint();
      }, { passive: false });
    });
  }

  _renderTools(el) {
    const tools = [
      { id: 'hacha_madera', label: 'Hacha de madera', cost: { madera: 8 } },
      { id: 'pico_madera',  label: 'Pico de madera',  cost: { madera: 8 } },
      { id: 'hacha_piedra', label: 'Hacha de piedra',  cost: { madera: 4, piedra: 6 } },
      { id: 'pico_piedra',  label: 'Pico de piedra',   cost: { madera: 4, piedra: 6 } },
    ];
    const current = this._building.getTool();
    el.innerHTML = '';

    tools.forEach(t => {
      const can    = this._building.hasMaterials(t.cost);
      const active = current === t.id;

      const card = document.createElement('div');
      Object.assign(card.style, {
        borderRadius: '8px', padding: '12px 14px',
        border: `1px solid rgba(201,168,76,${active?'0.4':'0.15'})`,
        background: `rgba(201,168,76,${active?'0.08':'0.03'})`,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      });

      card.innerHTML = `
        <div>
          <div style="font-family:'Cinzel',serif;font-size:11px;letter-spacing:2px;
               color:${active?'#e8c97a':'#c9a84c'};">
            ${t.label} ${active?'✓':''}
          </div>
          <div style="font-size:10px;color:#5a4e3a;font-family:monospace;margin-top:4px;">
            ${Object.entries(t.cost).map(([k,v])=>`${v} ${k}`).join(' · ')}
          </div>
        </div>
        <button data-tool="${t.id}"
          style="font-family:'Cinzel',serif;font-size:9px;letter-spacing:2px;
                 color:${can?'#c9a84c':'#5a4e3a'};
                 background:rgba(201,168,76,${can?'0.1':'0.03'});
                 border:1px solid rgba(201,168,76,${can?'0.3':'0.1'});
                 border-radius:4px;padding:6px 12px;cursor:pointer;pointer-events:all;">
          ${active?'ACTIVA':'CREAR'}
        </button>
      `;

      el.appendChild(card);
    });

    el.querySelectorAll('button[data-tool]').forEach(btn => {
      btn.addEventListener('click', () => {
        this._building.craftTool(btn.dataset.tool);
        this._renderTools(el);
      });
    });
  }

  _showPlacingHint() {
    const hint = document.createElement('div');
    Object.assign(hint.style, {
      position: 'fixed', bottom: '160px', left: '50%',
      transform: 'translateX(-50%)',
      fontFamily: "'Cinzel',serif", fontSize: '11px',
      letterSpacing: '3px', color: '#c9a84c',
      background: 'rgba(13,11,9,0.9)',
      border: '1px solid rgba(201,168,76,0.3)',
      borderRadius: '6px', padding: '10px 20px',
      zIndex: '200', pointerEvents: 'none',
    });
    hint.textContent = 'MUÉVETE PARA POSICIONAR · TOCA ✓ PARA CONFIRMAR';
    document.body.appendChild(hint);

    const confirmBtn = document.createElement('button');
    confirmBtn.textContent = '✓';
    Object.assign(confirmBtn.style, {
      position: 'fixed', bottom: '90px', right: '24px',
      width: '52px', height: '52px', borderRadius: '12px',
      border: '1px solid rgba(46,204,113,0.5)',
      background: 'rgba(10,8,20,0.88)', color: '#2ecc71',
      fontSize: '22px', cursor: 'pointer', zIndex: '151',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      pointerEvents: 'all',
    });

    const cancelBtn = document.createElement('button');
    cancelBtn.textContent = '✕';
    Object.assign(cancelBtn.style, {
      position: 'fixed', bottom: '90px', right: '84px',
      width: '52px', height: '52px', borderRadius: '12px',
      border: '1px solid rgba(231,76,60,0.5)',
      background: 'rgba(10,8,20,0.88)', color: '#e74c3c',
      fontSize: '22px', cursor: 'pointer', zIndex: '151',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      pointerEvents: 'all',
    });

    const cleanup = () => {
      confirmBtn.remove();
      cancelBtn.remove();
      hint.remove();
    };

    confirmBtn.addEventListener('click', () => { this._building.confirmPlace(); cleanup(); });
    confirmBtn.addEventListener('touchstart', (e) => { e.preventDefault(); this._building.confirmPlace(); cleanup(); }, { passive: false });
    cancelBtn.addEventListener('click', () => { this._building.cancelPlacing(); cleanup(); });
    cancelBtn.addEventListener('touchstart', (e) => { e.preventDefault(); this._building.cancelPlacing(); cleanup(); }, { passive: false });

    document.body.appendChild(confirmBtn);
    document.body.appendChild(cancelBtn);
  }

  toggle() { this._open ? this.close() : this.open(); }

  open() {
    this._open = true;
    this._panel.style.display = 'flex';
    this._panel.style.pointerEvents = 'all';
    this._render();
  }

  close() {
    this._open = false;
    this._panel.style.display = 'none';
  }

  isOpen() { return this._open; }
}
