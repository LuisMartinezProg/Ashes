/**
 * ui/buildMenu.js — Menú de construcción estilo Valheim/Minecraft
 * Ashes of the Reborn | Valiant Gaming
 */

import { STRUCTURES } from '../data/structures.js';
import { BUILD_TIERS, HUD_MATERIALS } from '../data/palette.js';

const CATEGORY_MAP = {
  basico      : ['fogata', 'refugio', 'escalera'],
  defensa     : ['muro', 'puerta', 'torre'],
  edificios   : ['casa_protagonista', 'herreria', 'fuente', 'enfermeria', 'casa_theron', 'casa_aelith', 'casa_korrath'],
  herramientas: [],
};

const CATEGORY_ICONS = {
  basico      : '🔥',
  defensa     : '🛡️',
  edificios   : '🏠',
  herramientas: '⚒️',
};

const MATERIAL_ICONS = {
  madera : HUD_MATERIALS.madera.icon,
  piedra : HUD_MATERIALS.piedra.icon,
  hierro : HUD_MATERIALS.hierro.icon,
  mineral: HUD_MATERIALS.mineral.icon,
};

export class BuildMenu {
  constructor(building) {
    this._building  = building;
    this._open      = false;
    this._panel     = null;
    this._buildBtn  = null;
    this._category  = 'basico';
    this._selected  = null; // estructura seleccionada
    this._selectedTier = 'madera';

    this._buildUI();
    building._onInventoryChange = () => { if (this._open) this._render(); };
    building._onBuildComplete   = () => { if (this._open) this._render(); };
  }

  _buildUI() {
    this._buildBtn = document.createElement('button');
    this._buildBtn.innerHTML = '🏗';
    Object.assign(this._buildBtn.style, {
      position : 'fixed', bottom: '160px', left: '50%',
      transform: 'translateX(-50%)',
      width    : '52px', height: '52px', borderRadius: '12px',
      border   : '1px solid rgba(201,168,76,0.4)',
      background: 'rgba(10,8,20,0.88)', color: '#C9A84C',
      fontSize : '22px', cursor: 'pointer', zIndex: '150',
      display  : 'flex', alignItems: 'center', justifyContent: 'center',
      WebkitTapHighlightColor: 'transparent',
      boxShadow: '0 2px 12px rgba(0,0,0,0.4)',
    });
    this._buildBtn.addEventListener('click', () => this.toggle());
    this._buildBtn.addEventListener('touchstart', (e) => {
      e.preventDefault(); this.toggle();
    }, { passive: false });
    document.body.appendChild(this._buildBtn);

    this._panel = document.createElement('div');
    Object.assign(this._panel.style, {
      position      : 'fixed',
      inset         : '0',
      background    : 'rgba(4,3,8,0.97)',
      zIndex        : '500',
      display       : 'none',
      flexDirection : 'column',
      pointerEvents : 'all',
      fontFamily    : 'monospace',
    });
    document.body.appendChild(this._panel);
  }

  _render() {
    const inv  = this._building.getInventory();
    const name = this._building.getTownName();

    this._panel.innerHTML = '';

    // ── Header ────────────────────────────────────────────────────────────
    const header = document.createElement('div');
    Object.assign(header.style, {
      display        : 'flex',
      alignItems     : 'center',
      justifyContent : 'space-between',
      padding        : '12px 16px',
      borderBottom   : '2px solid rgba(201,168,76,0.2)',
      background     : 'rgba(0,0,0,0.4)',
      flexShrink     : '0',
    });
    header.innerHTML = `
      <div style="display:flex;flex-direction:column;gap:2px;">
        <span style="font-size:11px;letter-spacing:4px;color:#c9a84c;">
          ⚒ CONSTRUCCIÓN${name ? ' — ' + name.toUpperCase() : ''}
        </span>
        <span style="font-size:9px;color:#555577;letter-spacing:2px;">
          MATERIALES: ${Object.entries(inv).map(([k,v]) =>
            `${MATERIAL_ICONS[k]} ${v}`
          ).join('  ')}
        </span>
      </div>
      <button id="build-close" style="
        background:rgba(201,168,76,0.1);
        border:1px solid rgba(201,168,76,0.3);
        color:#c9a84c;font-size:16px;cursor:pointer;
        width:34px;height:34px;border-radius:50%;
        display:flex;align-items:center;justify-content:center;
        pointer-events:all;">✕</button>
    `;
    this._panel.appendChild(header);
    header.querySelector('#build-close').addEventListener('click', () => this.close());
    header.querySelector('#build-close').addEventListener('touchstart', (e) => {
      e.preventDefault(); this.close();
    }, { passive: false });

    // ── Tabs de categoría ─────────────────────────────────────────────────
    const tabs = document.createElement('div');
    Object.assign(tabs.style, {
      display        : 'flex',
      borderBottom   : '1px solid rgba(201,168,76,0.15)',
      background     : 'rgba(0,0,0,0.3)',
      flexShrink     : '0',
      overflowX      : 'auto',
    });

    Object.keys(CATEGORY_MAP).forEach(cat => {
      const tab = document.createElement('button');
      const isActive = cat === this._category;
      tab.style.cssText = `
        flex:1;padding:10px 4px;
        background:${isActive ? 'rgba(201,168,76,0.12)' : 'transparent'};
        border:none;
        border-bottom:2px solid ${isActive ? '#c9a84c' : 'transparent'};
        color:${isActive ? '#c9a84c' : '#555577'};
        font-size:9px;letter-spacing:1px;
        cursor:pointer;font-family:monospace;
        display:flex;flex-direction:column;align-items:center;gap:2px;
        pointer-events:all;
        WebkitTapHighlightColor:transparent;
        transition:all 0.1s;
      `;
      tab.innerHTML = `
        <span style="font-size:18px;">${CATEGORY_ICONS[cat]}</span>
        <span>${cat.toUpperCase()}</span>
      `;
      const onTab = (e) => {
        e.preventDefault();
        this._category = cat;
        this._selected = null;
        this._render();
      };
      tab.addEventListener('click', onTab);
      tab.addEventListener('touchstart', onTab, { passive: false });
      tabs.appendChild(tab);
    });
    this._panel.appendChild(tabs);

    // ── Contenido principal ───────────────────────────────────────────────
    const body = document.createElement('div');
    Object.assign(body.style, {
      flex          : '1',
      display       : 'flex',
      flexDirection : 'row',
      overflow      : 'hidden',
      gap           : '0',
    });
    this._panel.appendChild(body);

    if (this._category === 'herramientas') {
      this._renderTools(body);
      return;
    }

    // ── Lista de estructuras (izquierda) ──────────────────────────────────
    const listCol = document.createElement('div');
    Object.assign(listCol.style, {
      width     : '45%',
      overflowY : 'auto',
      borderRight: '1px solid rgba(201,168,76,0.1)',
      padding   : '10px 8px',
      display   : 'flex',
      flexDirection: 'column',
      gap       : '6px',
    });

    const ids = CATEGORY_MAP[this._category] || [];
    ids.forEach(id => {
      const def    = STRUCTURES[id];
      if (!def) return;
      const locked = def.blueprint &&
        !this._building._prog?.getFlag?.('blueprint_' + id);
      const isSelected = this._selected === id;

      const card = document.createElement('div');
      Object.assign(card.style, {
        background   : isSelected
          ? 'rgba(201,168,76,0.15)'
          : 'rgba(255,255,255,0.03)',
        border       : `1px solid ${isSelected
          ? 'rgba(201,168,76,0.5)'
          : 'rgba(255,255,255,0.06)'}`,
        borderRadius : '8px',
        padding      : '10px',
        cursor       : locked ? 'default' : 'pointer',
        opacity      : locked ? '0.4' : '1',
        display      : 'flex',
        alignItems   : 'center',
        gap          : '10px',
        transition   : 'all 0.1s',
        WebkitTapHighlightColor: 'transparent',
      });

      // Icono grande
      const iconBox = document.createElement('div');
      iconBox.style.cssText = `
        width:44px;height:44px;border-radius:8px;
        background:rgba(0,0,0,0.4);
        border:1px solid rgba(201,168,76,0.2);
        display:flex;align-items:center;justify-content:center;
        font-size:22px;flex-shrink:0;
      `;
      iconBox.textContent = def.icon;
      card.appendChild(iconBox);

      // Info
      const info = document.createElement('div');
      info.style.cssText = 'flex:1;min-width:0;';
      info.innerHTML = `
        <div style="font-size:10px;color:#c9a84c;letter-spacing:1px;
             white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">
          ${def.label}
        </div>
        <div style="font-size:8px;color:#555577;margin-top:2px;
             white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">
          ${locked ? '🔒 BOCETO REQUERIDO' : def.desc}
        </div>
      `;
      card.appendChild(info);

      if (!locked) {
        const onSelect = (e) => {
          e.preventDefault();
          this._selected     = id;
          this._selectedTier = Object.keys(def.tiers)[0];
          this._render();
        };
        card.addEventListener('click', onSelect);
        card.addEventListener('touchstart', onSelect, { passive: false });
      }

      listCol.appendChild(card);
    });
    body.appendChild(listCol);

    // ── Panel derecho: crafteo 3x3 ────────────────────────────────────────
    const craftCol = document.createElement('div');
    Object.assign(craftCol.style, {
      flex          : '1',
      overflowY     : 'auto',
      padding       : '12px',
      display       : 'flex',
      flexDirection : 'column',
      gap           : '12px',
      alignItems    : 'center',
    });

    if (!this._selected) {
      const hint = document.createElement('div');
      hint.style.cssText = `
        flex:1;display:flex;align-items:center;justify-content:center;
        font-size:10px;color:#333355;letter-spacing:2px;text-align:center;
      `;
      hint.textContent = 'Selecciona una\nestructura';
      craftCol.appendChild(hint);
    } else {
      const def = STRUCTURES[this._selected];
      this._renderCraftPanel(craftCol, def);
    }

    body.appendChild(craftCol);
  }
  // ── Panel de crafteo con cuadrícula 3x3 ──────────────────────────────────

  _renderCraftPanel(container, def) {
    const inv = this._building.getInventory();

    // Título
    const title = document.createElement('div');
    title.style.cssText = `
      font-size:12px;color:#c9a84c;letter-spacing:2px;
      text-align:center;padding-bottom:8px;
      border-bottom:1px solid rgba(201,168,76,0.15);
      width:100%;
    `;
    title.textContent = `${def.icon} ${def.label.toUpperCase()}`;
    container.appendChild(title);

    // Selector de tier
    const tierRow = document.createElement('div');
    tierRow.style.cssText = 'display:flex;gap:6px;justify-content:center;flex-wrap:wrap;';

    Object.keys(def.tiers).forEach(tier => {
      const btn = document.createElement('button');
      const isActive = tier === this._selectedTier;
      const tierColor = BUILD_TIERS[tier] ?? '#888888';
      btn.style.cssText = `
        padding:4px 10px;border-radius:6px;
        background:${isActive
          ? `rgba(${this._hexToRgb(tierColor)},0.3)`
          : 'rgba(255,255,255,0.04)'};
        border:1px solid ${isActive ? tierColor : 'rgba(255,255,255,0.08)'};
        color:${isActive ? tierColor : '#555577'};
        font-size:9px;letter-spacing:1px;cursor:pointer;
        font-family:monospace;
        WebkitTapHighlightColor:transparent;
      `;
      btn.textContent = tier.toUpperCase();
      const onTier = (e) => {
        e.preventDefault();
        this._selectedTier = tier;
        this._render();
      };
      btn.addEventListener('click', onTier);
      btn.addEventListener('touchstart', onTier, { passive: false });
      tierRow.appendChild(btn);
    });
    container.appendChild(tierRow);

    // Cuadrícula 3x3
    const tierData = def.tiers[this._selectedTier];
    const cost     = tierData.cost;

    const gridWrap = document.createElement('div');
    gridWrap.style.cssText = 'display:flex;flex-direction:column;align-items:center;gap:8px;';

    const gridLabel = document.createElement('div');
    gridLabel.style.cssText = 'font-size:9px;color:#444466;letter-spacing:2px;';
    gridLabel.textContent = 'MATERIALES REQUERIDOS';
    gridWrap.appendChild(gridLabel);

    const grid = document.createElement('div');
    grid.style.cssText = `
      display:grid;
      grid-template-columns:repeat(3,1fr);
      gap:4px;
      background:rgba(0,0,0,0.5);
      border:2px solid rgba(201,168,76,0.2);
      border-radius:8px;
      padding:8px;
    `;

    // Construir slots 3x3
    const costEntries = Object.entries(cost);
    for (let i = 0; i < 9; i++) {
      const slot = document.createElement('div');
      slot.style.cssText = `
        width:52px;height:52px;
        border-radius:6px;
        border:1px solid rgba(255,255,255,0.06);
        background:rgba(255,255,255,0.03);
        display:flex;flex-direction:column;
        align-items:center;justify-content:center;
        gap:2px;font-size:9px;
      `;

      if (i < costEntries.length) {
        const [mat, qty] = costEntries[i];
        const have    = inv[mat] ?? 0;
        const canPay  = have >= qty;
        slot.style.border = `1px solid ${canPay
          ? 'rgba(100,200,100,0.3)'
          : 'rgba(200,80,80,0.3)'}`;
        slot.style.background = canPay
          ? 'rgba(100,200,100,0.06)'
          : 'rgba(200,80,80,0.06)';
        slot.innerHTML = `
          <span style="font-size:20px;">${MATERIAL_ICONS[mat] ?? '?'}</span>
          <span style="color:${canPay ? '#44ff88' : '#ff4444'};font-size:8px;">
            ${have}/${qty}
          </span>
          <span style="color:#444466;font-size:7px;letter-spacing:0.5px;">
            ${mat.toUpperCase()}
          </span>
        `;
      }

      grid.appendChild(slot);
    }
    gridWrap.appendChild(grid);
    container.appendChild(gridWrap);

    // Stats de la estructura
    const stats = document.createElement('div');
    stats.style.cssText = `
      width:100%;background:rgba(0,0,0,0.3);
      border:1px solid rgba(255,255,255,0.06);
      border-radius:8px;padding:10px;
      display:flex;flex-direction:column;gap:4px;
    `;
    stats.innerHTML = `
      <div style="font-size:9px;color:#888899;letter-spacing:2px;
           border-bottom:1px solid rgba(255,255,255,0.05);
           padding-bottom:4px;margin-bottom:2px;">
        ESTADÍSTICAS
      </div>
      <div style="display:flex;justify-content:space-between;font-size:9px;">
        <span style="color:#555577;">HP</span>
        <span style="color:#c9a84c;">${tierData.hp}</span>
      </div>
      <div style="display:flex;justify-content:space-between;font-size:9px;">
        <span style="color:#555577;">TAMAÑO</span>
        <span style="color:#c9a84c;">${tierData.size[0]}×${tierData.size[2]}</span>
      </div>
      ${def.effect ? `
      <div style="display:flex;justify-content:space-between;font-size:9px;">
        <span style="color:#555577;">EFECTO</span>
        <span style="color:#88aaff;">${def.effect.type.toUpperCase()}</span>
      </div>` : ''}
    `;
    container.appendChild(stats);

    // Descripción
    const desc = document.createElement('div');
    desc.style.cssText = `
      font-size:9px;color:#555577;line-height:1.5;
      text-align:center;padding:0 4px;
    `;
    desc.textContent = def.desc;
    container.appendChild(desc);

    // Botón construir
    const canBuild = this._building.hasMaterials(cost);
    const buildBtn = document.createElement('button');
    buildBtn.style.cssText = `
      width:100%;padding:12px;
      background:${canBuild
        ? 'linear-gradient(135deg, rgba(201,168,76,0.25), rgba(201,168,76,0.1))'
        : 'rgba(255,255,255,0.03)'};
      border:2px solid ${canBuild
        ? 'rgba(201,168,76,0.6)'
        : 'rgba(255,255,255,0.08)'};
      border-radius:10px;
      color:${canBuild ? '#c9a84c' : '#333355'};
      font-size:11px;letter-spacing:3px;
      cursor:${canBuild ? 'pointer' : 'default'};
      font-family:monospace;
      WebkitTapHighlightColor:transparent;
      transition:all 0.1s;
    `;
    buildBtn.textContent = canBuild ? '⚒ CONSTRUIR' : '✕ MATERIALES INSUFICIENTES';

    if (canBuild) {
      const onBuild = (e) => {
        e.preventDefault();
        this._building.startPlacing(this._selected, this._selectedTier);
        this.close();
        this._showPlacingHint();
      };
      buildBtn.addEventListener('click', onBuild);
      buildBtn.addEventListener('touchstart', onBuild, { passive: false });
    }
    container.appendChild(buildBtn);
  }

  // ── Herramientas ──────────────────────────────────────────────────────────

  _renderTools(container) {
    const tools = [
      { id: 'hacha_madera', label: 'Hacha de madera', icon: '🪓', cost: { madera: 8 },          desc: 'Tala árboles x2' },
      { id: 'pico_madera',  label: 'Pico de madera',  icon: '⛏️', cost: { madera: 8 },          desc: 'Extrae piedra x1' },
      { id: 'hacha_piedra', label: 'Hacha de piedra', icon: '🪓', cost: { madera: 4, piedra: 6 }, desc: 'Tala árboles x3' },
      { id: 'pico_piedra',  label: 'Pico de piedra',  icon: '⛏️', cost: { madera: 4, piedra: 6 }, desc: 'Extrae piedra/hierro x2' },
    ];

    const inv     = this._building.getInventory();
    const current = this._building.getTool();

    const wrap = document.createElement('div');
    Object.assign(wrap.style, {
      flex         : '1',
      overflowY    : 'auto',
      padding      : '12px',
      display      : 'flex',
      flexDirection: 'column',
      gap          : '8px',
    });

    tools.forEach(t => {
      const can    = this._building.hasMaterials(t.cost);
      const active = current === t.id;

      const card = document.createElement('div');
      Object.assign(card.style, {
        background   : active
          ? 'rgba(201,168,76,0.1)'
          : 'rgba(255,255,255,0.03)',
        border       : `1px solid ${active
          ? 'rgba(201,168,76,0.4)'
          : 'rgba(255,255,255,0.06)'}`,
        borderRadius : '10px',
        padding      : '12px',
        display      : 'flex',
        alignItems   : 'center',
        gap          : '12px',
      });

      // Icono
      const iconBox = document.createElement('div');
      iconBox.style.cssText = `
        width:48px;height:48px;border-radius:8px;
        background:rgba(0,0,0,0.4);
        border:1px solid ${active ? 'rgba(201,168,76,0.3)' : 'rgba(255,255,255,0.06)'};
        display:flex;align-items:center;justify-content:center;
        font-size:24px;flex-shrink:0;
      `;
      iconBox.textContent = t.icon;
      card.appendChild(iconBox);

      // Info
      const info = document.createElement('div');
      info.style.cssText = 'flex:1;';
      info.innerHTML = `
        <div style="font-size:10px;color:${active ? '#e8c97a' : '#c9a84c'};
             letter-spacing:1px;">
          ${t.label} ${active ? '✓ ACTIVA' : ''}
        </div>
        <div style="font-size:8px;color:#555577;margin-top:2px;">${t.desc}</div>
        <div style="display:flex;gap:8px;margin-top:4px;">
          ${Object.entries(t.cost).map(([mat, qty]) => {
            const have   = inv[mat] ?? 0;
            const canPay = have >= qty;
            return `<span style="font-size:8px;color:${canPay ? '#44ff88' : '#ff4444'};">
              ${MATERIAL_ICONS[mat]} ${have}/${qty}
            </span>`;
          }).join('')}
        </div>
      `;
      card.appendChild(info);

      // Botón
      const btn = document.createElement('button');
      btn.style.cssText = `
        padding:8px 12px;border-radius:6px;
        background:${can && !active ? 'rgba(201,168,76,0.15)' : 'rgba(255,255,255,0.03)'};
        border:1px solid ${can && !active ? 'rgba(201,168,76,0.4)' : 'rgba(255,255,255,0.08)'};
        color:${can && !active ? '#c9a84c' : '#333355'};
        font-size:9px;letter-spacing:1px;
        cursor:${can && !active ? 'pointer' : 'default'};
        font-family:monospace;
        WebkitTapHighlightColor:transparent;
        white-space:nowrap;
      `;
      btn.textContent = active ? 'ACTIVA' : can ? 'CREAR' : 'FALTA';

      if (can && !active) {
        const onCraft = (e) => {
          e.preventDefault();
          this._building.craftTool(t.id);
          this._render();
        };
        btn.addEventListener('click', onCraft);
        btn.addEventListener('touchstart', onCraft, { passive: false });
      }
      card.appendChild(btn);
      wrap.appendChild(card);
    });

    container.appendChild(wrap);
  }

  // ── Hint de colocación ────────────────────────────────────────────────────

  _showPlacingHint() {
    const hint = document.createElement('div');
    Object.assign(hint.style, {
      position  : 'fixed', bottom: '160px', left: '50%',
      transform : 'translateX(-50%)',
      fontFamily: 'monospace', fontSize: '10px',
      letterSpacing: '2px', color: '#c9a84c',
      background: 'rgba(4,3,8,0.95)',
      border    : '1px solid rgba(201,168,76,0.3)',
      borderRadius: '6px', padding: '10px 20px',
      zIndex    : '200', pointerEvents: 'none',
      whiteSpace: 'nowrap',
    });
    hint.textContent = 'MUÉVETE PARA POSICIONAR · ✓ CONFIRMAR';
    document.body.appendChild(hint);

    const confirmBtn = document.createElement('button');
    confirmBtn.textContent = '✓';
    Object.assign(confirmBtn.style, {
      position: 'fixed', bottom: '90px', right: '24px',
      width: '52px', height: '52px', borderRadius: '12px',
      border: '2px solid rgba(46,204,113,0.6)',
      background: 'rgba(46,204,113,0.15)', color: '#2ecc71',
      fontSize: '22px', cursor: 'pointer', zIndex: '151',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      pointerEvents: 'all', boxShadow: '0 0 12px rgba(46,204,113,0.3)',
    });

    const cancelBtn = document.createElement('button');
    cancelBtn.textContent = '✕';
    Object.assign(cancelBtn.style, {
      position: 'fixed', bottom: '90px', right: '84px',
      width: '52px', height: '52px', borderRadius: '12px',
      border: '2px solid rgba(231,76,60,0.6)',
      background: 'rgba(231,76,60,0.15)', color: '#e74c3c',
      fontSize: '22px', cursor: 'pointer', zIndex: '151',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      pointerEvents: 'all', boxShadow: '0 0 12px rgba(231,76,60,0.3)',
    });

    const cleanup = () => { confirmBtn.remove(); cancelBtn.remove(); hint.remove(); };

    confirmBtn.addEventListener('click', () => { this._building.confirmPlace(); cleanup(); });
    confirmBtn.addEventListener('touchstart', (e) => {
      e.preventDefault(); this._building.confirmPlace(); cleanup();
    }, { passive: false });

    cancelBtn.addEventListener('click', () => { this._building.cancelPlacing(); cleanup(); });
    cancelBtn.addEventListener('touchstart', (e) => {
      e.preventDefault(); this._building.cancelPlacing(); cleanup();
    }, { passive: false });

    document.body.appendChild(confirmBtn);
    document.body.appendChild(cancelBtn);
  }

  // ── Helper color ──────────────────────────────────────────────────────────

  _hexToRgb(hex) {
    const r = parseInt(hex.slice(1,3), 16);
    const g = parseInt(hex.slice(3,5), 16);
    const b = parseInt(hex.slice(5,7), 16);
    return `${r},${g},${b}`;
  }

  // ── Open/Close ────────────────────────────────────────────────────────────

  toggle() { this._open ? this.close() : this.open(); }

  open() {
    this._open = true;
    this._panel.style.display = 'flex';
    this._render();
  }

  close() {
    this._open = false;
    this._panel.style.display = 'none';
  }

  isOpen() { return this._open; }
}
