/**
 * ui/buildMenu.js — Menú de construcción
 * USO:
 *   import { BuildMenu } from './ui/buildMenu.js';
 *   const buildMenu = new BuildMenu(building);
 *   buildMenu.show();
 */

import { STRUCTURES, TIERS } from '../data/structures.js';

export class BuildMenu {
  constructor(building) {
    this._building = building;
    this._open     = false;
    this._buildBtn = null;
    this._panel    = null;

    this._buildUI();
    building._onInventoryChange = () => this._updateInventoryDisplay();
    building._onBuildComplete   = () => this._refreshList();
  }

  // ─────────────────────────────────────────────
  // BOTÓN FIJO — esquina inferior derecha
  // ─────────────────────────────────────────────
  _buildUI() {
    // Botón de construcción
    this._buildBtn = document.createElement('button');
    this._buildBtn.innerHTML = '🏗';
    Object.assign(this._buildBtn.style, {
      position : 'fixed', bottom: '90px', right: '24px',
      width: '52px', height: '52px', borderRadius: '12px',
      border: '1px solid rgba(201,168,76,0.4)',
      background: 'rgba(10,8,20,0.88)', color: '#C9A84C',
      fontSize: '22px', cursor: 'pointer', zIndex: '150',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      WebkitTapHighlightColor: 'transparent',
      boxShadow: '0 2px 12px rgba(0,0,0,0.4)',
    });
    this._buildBtn.addEventListener('click',      () => this.toggle());
    this._buildBtn.addEventListener('touchstart', (e) => { e.preventDefault(); this.toggle(); }, { passive: false });
    document.body.appendChild(this._buildBtn);

    // Panel principal
    this._panel = document.createElement('div');
    Object.assign(this._panel.style, {
      position : 'fixed', bottom: '0', right: '0',
      width    : '100%', maxWidth: '420px',
      background: 'linear-gradient(180deg, rgba(13,11,9,0) 0%, rgba(13,11,9,0.98) 8%)',
      zIndex   : '140',
      display  : 'none',
      flexDirection: 'column',
      maxHeight: '70vh',
      borderTop: '1px solid rgba(201,168,76,0.2)',
    });
    document.body.appendChild(this._panel);

    this._renderPanel();
  }

  _renderPanel() {
    this._panel.innerHTML = `
      <div style="padding:16px 20px 8px; display:flex; justify-content:space-between; align-items:center;">
        <span style="font-family:'Cinzel',serif;font-size:11px;letter-spacing:3px;color:#c9a84c;text-transform:uppercase;">
          Construcción
        </span>
        <span id="build-town-name" style="font-family:'Cinzel',serif;font-size:10px;letter-spacing:2px;color:#8a6f2e;"></span>
        <button onclick="this.closest('.build-panel-root')._close()" 
          style="background:none;border:none;color:#5a4e3a;font-size:18px;cursor:pointer;">✕</button>
      </div>

      <!-- Inventario -->
      <div id="build-inventory" style="display:flex;gap:12px;padding:0 20px 12px;flex-wrap:wrap;"></div>

      <!-- Tabs de categoría -->
      <div id="build-tabs" style="display:flex;gap:0;border-bottom:1px solid rgba(201,168,76,0.15);padding:0 20px;overflow-x:auto;"></div>

      <!-- Lista de estructuras -->
      <div id="build-list" style="overflow-y:auto;padding:8px 16px 24px;display:flex;flex-direction:column;gap:8px;"></div>
    `;

    this._panel.classList.add('build-panel-root');
    this._panel._close = () => this.close();

    this._renderTabs();
    this._renderInventory();
    this._renderList('basico');
  }

  _renderInventory() {
    const el  = this._panel.querySelector('#build-inventory');
    const inv = this._building.getInventory();
    el.innerHTML = Object.entries(inv).map(([k, v]) => `
      <div style="font-family:'Cinzel',serif;font-size:10px;letter-spacing:2px;
           color:rgba(201,168,76,0.7);display:flex;align-items:center;gap:4px;">
        <span>${k === 'madera' ? '🪵' : k === 'piedra' ? '🪨' : k === 'hierro' ? '⚙️' : '💎'}</span>
        <span>${v}</span>
      </div>
    `).join('');
  }

  _renderTabs() {
    const tabs = this._panel.querySelector('#build-tabs');
    const cats = [
      { id: 'basico',    label: 'Básico' },
      { id: 'defensa',   label: 'Defensa' },
      { id: 'edificios', label: 'Edificios' },
      { id: 'herramientas', label: 'Herramientas' },
    ];
    tabs.innerHTML = cats.map(c => `
      <button data-cat="${c.id}"
        style="font-family:'Cinzel',serif;font-size:10px;letter-spacing:2px;
               color:#5a4e3a;background:none;border:none;border-bottom:2px solid transparent;
               padding:8px 14px;cursor:pointer;white-space:nowrap;
               transition:color .2s,border-color .2s;"
        onclick="this.parentElement.querySelectorAll('button').forEach(b=>b.style.cssText+=';color:#5a4e3a;border-bottom-color:transparent');
                 this.style.color='#c9a84c';this.style.borderBottomColor='#c9a84c';">
        ${c.label}
      </button>
    `).join('');

    // Activar primera tab
    tabs.querySelector('button').style.color = '#c9a84c';
    tabs.querySelector('button').style.borderBottomColor = '#c9a84c';

    tabs.querySelectorAll('button').forEach(btn => {
      btn.addEventListener('click', () => this._renderList(btn.dataset.cat));
    });
  }

  _renderList(cat) {
    const el   = this._panel.querySelector('#build-list');
    const map  = {
      basico      : ['fogata', 'refugio'],
      defensa     : ['muro', 'puerta', 'torre'],
      edificios   : ['casa_protagonista', 'herreria', 'fuente', 'enfermeria', 'casa_theron', 'casa_aelith', 'casa_korrath'],
      herramientas: [],
    };

    const ids = map[cat] || [];
    if (cat === 'herramientas') {
      this._renderToolList(el);
      return;
    }

    el.innerHTML = ids.map(id => {
      const def  = STRUCTURES[id];
      const tier = 'madera';
      const td   = def.tiers[tier];
      const canBuild = td && this._building.hasMaterials(td.cost);
      const locked   = def.blueprint && !this._building._prog?.getFlag?.('blueprint_' + id);

      return `
        <div style="background:rgba(201,168,76,${locked ? '0.02' : '0.05'});
             border:1px solid rgba(201,168,76,${locked ? '0.08' : '0.18'});
             border-radius:8px;padding:12px 14px;
             opacity:${locked ? '0.5' : '1'};">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px;">
            <span style="font-family:'Cinzel',serif;font-size:11px;letter-spacing:2px;color:#c9a84c;">
              ${def.icon} ${def.label}
            </span>
            ${locked
              ? '<span style="font-family:monospace;font-size:10px;color:#5a4e3a;">BOCETO REQUERIDO</span>'
              : `<button data-id="${id}" data-tier="${tier}"
                   style="font-family:'Cinzel',serif;font-size:9px;letter-spacing:2px;
                          color:${canBuild ? '#c9a84c' : '#5a4e3a'};
                          background:rgba(201,168,76,${canBuild ? '0.1' : '0.03'});
                          border:1px solid rgba(201,168,76,${canBuild ? '0.3' : '0.1'});
                          border-radius:4px;padding:5px 10px;cursor:pointer;">
                   CONSTRUIR
                 </button>`
            }
          </div>
          <div style="font-family:'Crimson Pro',serif;font-size:13px;color:#9a8c7a;margin-bottom:6px;">
            ${def.desc}
          </div>
          ${td ? `<div style="font-size:11px;color:#7a6030;">
            Costo: ${Object.entries(td.cost).map(([k,v])=>`${v} ${k}`).join(', ')}
            · HP: ${td.hp}
          </div>` : ''}
        </div>
      `;
    }).join('');

    // Eventos de construcción
    el.querySelectorAll('button[data-id]').forEach(btn => {
      btn.addEventListener('click', () => {
        this._building.startPlacing(btn.dataset.id, btn.dataset.tier);
        this.close();
        this._showPlacingHint();
      });
    });
  }

  _renderToolList(el) {
    const tools = [
      { id: 'hacha_madera', label: 'Hacha de madera', cost: { madera: 8 } },
      { id: 'pico_madera',  label: 'Pico de madera',  cost: { madera: 8 } },
      { id: 'hacha_piedra', label: 'Hacha de piedra',  cost: { madera: 4, piedra: 6 } },
      { id: 'pico_piedra',  label: 'Pico de piedra',   cost: { madera: 4, piedra: 6 } },
    ];
    const current = this._building.getTool();
    el.innerHTML = tools.map(t => {
      const can = this._building.hasMaterials(t.cost);
      const active = current === t.id;
      return `
        <div style="background:rgba(201,168,76,0.05);border:1px solid rgba(201,168,76,${active?'0.4':'0.15'});
             border-radius:8px;padding:12px 14px;display:flex;justify-content:space-between;align-items:center;">
          <div>
            <div style="font-family:'Cinzel',serif;font-size:11px;letter-spacing:2px;color:${active?'#e8c97a':'#c9a84c'};">
              ${t.label} ${active ? '✓' : ''}
            </div>
            <div style="font-size:11px;color:#7a6030;margin-top:2px;">
              Costo: ${Object.entries(t.cost).map(([k,v])=>`${v} ${k}`).join(', ')}
            </div>
          </div>
          <button data-tool="${t.id}"
            style="font-family:'Cinzel',serif;font-size:9px;letter-spacing:2px;
                   color:${can?'#c9a84c':'#5a4e3a'};
                   background:rgba(201,168,76,${can?'0.1':'0.03'});
                   border:1px solid rgba(201,168,76,${can?'0.3':'0.1'});
                   border-radius:4px;padding:5px 10px;cursor:pointer;">
            ${active ? 'ACTIVA' : 'CREAR'}
          </button>
        </div>
      `;
    }).join('');

    el.querySelectorAll('button[data-tool]').forEach(btn => {
      btn.addEventListener('click', () => {
        this._building.craftTool(btn.dataset.tool);
        this._renderToolList(el);
        this._renderInventory();
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

    // Botón confirmar
    const confirmBtn = document.createElement('button');
    confirmBtn.textContent = '✓';
    Object.assign(confirmBtn.style, {
      position: 'fixed', bottom: '90px', right: '24px',
      width: '52px', height: '52px', borderRadius: '12px',
      border: '1px solid rgba(46,204,113,0.5)',
      background: 'rgba(10,8,20,0.88)', color: '#2ecc71',
      fontSize: '22px', cursor: 'pointer', zIndex: '151',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    });
    confirmBtn.addEventListener('click', () => {
      this._building.confirmPlace();
      confirmBtn.remove();
      hint.remove();
      cancelBtn.remove();
    });

    // Botón cancelar
    const cancelBtn = document.createElement('button');
    cancelBtn.textContent = '✕';
    Object.assign(cancelBtn.style, {
      position: 'fixed', bottom: '90px', right: '84px',
      width: '52px', height: '52px', borderRadius: '12px',
      border: '1px solid rgba(231,76,60,0.5)',
      background: 'rgba(10,8,20,0.88)', color: '#e74c3c',
      fontSize: '22px', cursor: 'pointer', zIndex: '151',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    });
    cancelBtn.addEventListener('click', () => {
      this._building.cancelPlacing();
      confirmBtn.remove();
      hint.remove();
      cancelBtn.remove();
    });

    document.body.appendChild(confirmBtn);
    document.body.appendChild(cancelBtn);
  }

  _updateInventoryDisplay() {
    if (this._open) this._renderInventory();
  }

  _refreshList() {
    this._renderInventory();
  }

  // ─────────────────────────────────────────────
  // ABRIR / CERRAR
  // ─────────────────────────────────────────────
  toggle() { this._open ? this.close() : this.open(); }

  open() {
    this._open = true;
    this._panel.style.display = 'flex';
    this._renderInventory();
    const name = this._building.getTownName();
    const el = this._panel.querySelector('#build-town-name');
    if (el && name) el.textContent = name.toUpperCase();
  }

  close() {
    this._open = false;
    this._panel.style.display = 'none';
  }

  isOpen() { return this._open; }
}
