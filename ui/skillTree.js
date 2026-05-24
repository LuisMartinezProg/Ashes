// ui/skillTree.js — Ashes of the Reborn | Valiant Gaming

const CATEGORIES = {
  ofensiva: {
    label: 'Ofensiva', icon: '⚔️', color: '#ff4400',
    skills: [
      { id: 'of_01', nivel: 1, label: 'Bola de fuego',         icon: '🔥', tipo: 'Básica',     limitante: 'Ninguna',                        cost: 0  },
      { id: 'of_02', nivel: 2, label: 'Chispa en cadena',      icon: '⚡', tipo: 'Básica',     limitante: 'Necesita 2 enemigos cerca',       cost: 1  },
      { id: 'of_03', nivel: 2, label: 'Lanza de hielo',        icon: '🧊', tipo: 'Básica',     limitante: 'Congela solo 2 segundos',         cost: 1  },
      { id: 'of_04', nivel: 3, label: 'Meteoro pequeño',       icon: '🌑', tipo: 'Intermedia', limitante: '4 segundos antes de caer',        cost: 2  },
      { id: 'of_05', nivel: 3, label: 'Onda sísmica mágica',   icon: '🌊', tipo: 'Intermedia', limitante: 'No funciona en el aire',          cost: 2  },
      { id: 'of_06', nivel: 4, label: 'Lanza de plasma',       icon: '💜', tipo: 'Intermedia', limitante: 'Recarga de 10 segundos',          cost: 2  },
      { id: 'of_07', nivel: 4, label: 'Vortex de fuego',       icon: '🌪️', tipo: 'Intermedia', limitante: 'Solo desorienta, no mata directo', cost: 2 },
      { id: 'of_08', nivel: 5, label: 'Nova devastadora',      icon: '💥', tipo: 'Élite',      limitante: 'Sin energía 30 segundos',         cost: 3  },
      { id: 'of_09', nivel: 5, label: 'Colapso dimensional',   icon: '🕳️', tipo: 'Élite',      limitante: 'Una vez por batalla',             cost: 3  },
      { id: 'of_10', nivel: 5, label: 'Fragmentación cósmica', icon: '☄️', tipo: 'Élite',      limitante: 'Daña aliados cercanos',           cost: 3  },
    ],
  },
  defensiva: {
    label: 'Defensiva', icon: '🛡️', color: '#4488ff',
    skills: [
      { id: 'de_01', nivel: 1, label: 'Piel de piedra',           icon: '🪨', tipo: 'Básica',     limitante: 'Ralentiza el movimiento',         cost: 0 },
      { id: 'de_02', nivel: 2, label: 'Aura protectora',          icon: '✨', tipo: 'Básica',     limitante: 'Reducción pequeña y constante',   cost: 1 },
      { id: 'de_03', nivel: 2, label: 'Armadura de viento',       icon: '💨', tipo: 'Básica',     limitante: 'Solo desvía proyectiles débiles', cost: 1 },
      { id: 'de_04', nivel: 3, label: 'Muro de fuerza',           icon: '🧱', tipo: 'Intermedia', limitante: 'Tú tampoco puedes atravesarla',   cost: 2 },
      { id: 'de_05', nivel: 3, label: 'Barrera de grupo',         icon: '🔵', tipo: 'Intermedia', limitante: 'Se rompe con suficiente daño',    cost: 2 },
      { id: 'de_06', nivel: 4, label: 'Escudo de espejos',        icon: '🪞', tipo: 'Intermedia', limitante: 'No funciona contra daño físico',  cost: 2 },
      { id: 'de_07', nivel: 4, label: 'Campo de espinas',         icon: '🌵', tipo: 'Intermedia', limitante: 'Solo daña al acercarse',          cost: 2 },
      { id: 'de_08', nivel: 5, label: 'Fortaleza indestructible', icon: '🏰', tipo: 'Élite',      limitante: 'No puedes moverte ni atacar',     cost: 3 },
      { id: 'de_09', nivel: 5, label: 'Inversión de daño',        icon: '🔄', tipo: 'Élite',      limitante: 'Recarga de 60 segundos',          cost: 3 },
      { id: 'de_10', nivel: 5, label: 'Resurrección arcana',      icon: '💫', tipo: 'Élite',      limitante: 'Una vez por batalla',             cost: 3 },
    ],
  },
  movilidad: {
    label: 'Movilidad', icon: '💨', color: '#44cc44',
    skills: [
      { id: 'mo_01', nivel: 1, label: 'Carrera mágica',            icon: '🏃', tipo: 'Básica',     limitante: 'Dura 5 segundos',               cost: 0 },
      { id: 'mo_02', nivel: 2, label: 'Salto potenciado',          icon: '⬆️', tipo: 'Básica',     limitante: 'Sin recarga',                   cost: 1 },
      { id: 'mo_03', nivel: 2, label: 'Impulso de viento',         icon: '🌬️', tipo: 'Básica',     limitante: 'Solo en dirección que miras',   cost: 1 },
      { id: 'mo_04', nivel: 3, label: 'Vuelo mágico',              icon: '🦋', tipo: 'Intermedia', limitante: 'Consume energía constantemente', cost: 2 },
      { id: 'mo_05', nivel: 3, label: 'Dash aéreo',                icon: '💫', tipo: 'Intermedia', limitante: 'Solo horizontal en el aire',    cost: 2 },
      { id: 'mo_06', nivel: 4, label: 'Paso de sombra',            icon: '👤', tipo: 'Intermedia', limitante: 'Intangible solo 2 segundos',    cost: 2 },
      { id: 'mo_07', nivel: 4, label: 'Ola de impulso',            icon: '🌊', tipo: 'Intermedia', limitante: 'Dura 6 segundos',               cost: 2 },
      { id: 'mo_08', nivel: 5, label: 'Teletransporte de combate', icon: '⚡', tipo: 'Élite',      limitante: 'Recarga de 20 segundos',        cost: 3 },
      { id: 'mo_09', nivel: 5, label: 'Colapso espacial',          icon: '🕳️', tipo: 'Élite',      limitante: 'Solo a aliados visibles',       cost: 3 },
      { id: 'mo_10', nivel: 5, label: 'Parpadeo infinito',         icon: '✨', tipo: 'Élite',      limitante: 'Agota toda la energía',         cost: 3 },
    ],
  },
  soporte: {
    label: 'Soporte', icon: '💚', color: '#ffaa00',
    skills: [
      { id: 'so_01', nivel: 1, label: 'Curación leve',            icon: '💚', tipo: 'Básica',     limitante: 'Cantidad pequeña',              cost: 0 },
      { id: 'so_02', nivel: 2, label: 'Aura de regeneración',     icon: '🌿', tipo: 'Básica',     limitante: 'Lenta y continua',              cost: 1 },
      { id: 'so_03', nivel: 2, label: 'Vendaje mágico',           icon: '🩹', tipo: 'Básica',     limitante: 'Solo un aliado cercano',        cost: 1 },
      { id: 'so_04', nivel: 3, label: 'Grito de guerra',          icon: '📯', tipo: 'Intermedia', limitante: 'Dura 8 segundos',               cost: 2 },
      { id: 'so_05', nivel: 3, label: 'Visión táctica',           icon: '👁️', tipo: 'Intermedia', limitante: 'Solo en área definida',         cost: 2 },
      { id: 'so_06', nivel: 4, label: 'Comando de velocidad',     icon: '⚡', tipo: 'Intermedia', limitante: 'Dura 12 segundos',              cost: 2 },
      { id: 'so_07', nivel: 4, label: 'Escudo de tropas',         icon: '🛡️', tipo: 'Intermedia', limitante: 'Dura 10 segundos',              cost: 2 },
      { id: 'so_08', nivel: 5, label: 'Resurrección de aliado',   icon: '✝️', tipo: 'Élite',      limitante: 'Recarga de 90 segundos',        cost: 3 },
      { id: 'so_09', nivel: 5, label: 'Sacrificio heroico',       icon: '❤️', tipo: 'Élite',      limitante: 'Pierdes 50% de tu vida',        cost: 3 },
      { id: 'so_10', nivel: 5, label: 'Campo de curación masiva', icon: '🌟', tipo: 'Élite',      limitante: 'Una vez por batalla',           cost: 3 },
    ],
  },
  estrategica: {
    label: 'Estratégica', icon: '⭐', color: '#aa44ff',
    skills: [
      { id: 'es_01', nivel: 1, label: 'Sombra de combate',    icon: '👥', tipo: 'Básica',     limitante: 'Copia fantasmal temporal',             cost: 0 },
      { id: 'es_02', nivel: 2, label: 'Invocación menor',     icon: '👻', tipo: 'Básica',     limitante: 'Espíritu débil',                       cost: 1 },
      { id: 'es_03', nivel: 2, label: 'Niebla de guerra',     icon: '🌫️', tipo: 'Básica',     limitante: 'Dura 10 segundos',                     cost: 1 },
      { id: 'es_04', nivel: 3, label: 'Control del clima',    icon: '🌧️', tipo: 'Intermedia', limitante: 'Lluvia que ralentiza en área grande',   cost: 2 },
      { id: 'es_05', nivel: 3, label: 'Interferencia mágica', icon: '📡', tipo: 'Intermedia', limitante: 'Bloquea habilidades 8 segundos',        cost: 2 },
      { id: 'es_06', nivel: 4, label: 'Invocación de élite',  icon: '⚔️', tipo: 'Intermedia', limitante: 'Espíritu poderoso 20 segundos',         cost: 2 },
      { id: 'es_07', nivel: 4, label: 'Trampa espectral',     icon: '💣', tipo: 'Intermedia', limitante: 'Zona invisible que explota al pisarla', cost: 2 },
      { id: 'es_08', nivel: 5, label: 'Invocación de dragón', icon: '🐉', tipo: 'Élite',      limitante: 'Recarga de 120 segundos',               cost: 3 },
      { id: 'es_09', nivel: 5, label: 'Espíritu del caos',    icon: '🌀', tipo: 'Élite',      limitante: 'Ataca a todos, aliados y enemigos',     cost: 3 },
      { id: 'es_10', nivel: 5, label: 'Juicio final',         icon: '☀️', tipo: 'Élite',      limitante: 'Una vez por guerra',                    cost: 3 },
    ],
  },
};

const TIPO_COLORS = { 'Básica': '#aaaaaa', 'Intermedia': '#4488ff', 'Élite': '#ffaa00' };

const NIVEL_REQUIRED = { 'Básica': 0, 'Intermedia': 3, 'Élite': 7 };

// Categorías disponibles por tipo de arma
const WEAPON_CATEGORIES = {
  sword:   ['ofensiva', 'defensiva', 'movilidad'],
  katana:  ['ofensiva', 'movilidad', 'estrategica'],
  bow:     ['ofensiva', 'estrategica', 'soporte'],
  staff:   ['ofensiva', 'soporte', 'estrategica'],
  shield:  ['defensiva', 'soporte', 'movilidad'],
  default: ['ofensiva', 'defensiva', 'movilidad'],
};

export class SkillTree {
  constructor(progression) {
    this._progression  = progression ?? null;
    this._container    = null;
    this._canvas       = null;
    this._ctx          = null;
    this._category     = 'ofensiva';
    this._weaponType   = 'default';
    this._nodes        = [];
    this._selectedNode = null;
    this._visible      = false;
    this._skillPoints  = 3;
    this._worldLevel   = 1;
    this._unlocked     = { of_01: true, de_01: true, mo_01: true, so_01: true };

    this._zoom      = 1;
    this._panX      = 0;
    this._panY      = 0;
    this._isPanning = false;
    this._lastTouch = null;
    this._pinchDist = null;

    this._build();
  }

  // ── API pública ───────────────────────────────────────────────────────────

  open(weaponType) {
    const weapon  = weaponType ?? 'default';
    this._weaponType = WEAPON_CATEGORIES[weapon] ? weapon : 'default';

    const allowed = WEAPON_CATEGORIES[this._weaponType];

    // Si la categoría actual no está permitida para esta arma, cambia a la primera disponible
    if (!allowed.includes(this._category)) {
      this._category = allowed[0];
    }

    this._visible = true;
    this._container.style.display = 'flex';
    this._resetView();
    this._renderTree();
  }

  close() {
    this._visible      = false;
    this._selectedNode = null;
    this._container.style.display = 'none';
  }

  toggle(weaponType) { this._visible ? this.close() : this.open(weaponType); }

  setWorldLevel(level) {
    this._worldLevel = level;
    if (this._visible) this._renderTree();
  }

  addSkillPoints(n) {
    this._skillPoints += n;
    if (this._visible) this._renderTree();
  }

  // ── Build DOM ─────────────────────────────────────────────────────────────

  _build() {
    this._container = document.createElement('div');
    Object.assign(this._container.style, {
      position     : 'fixed',
      inset        : '0',
      display      : 'none',
      flexDirection: 'column',
      background   : 'radial-gradient(ellipse at center, #0d0a1a 0%, #04040a 100%)',
      zIndex       : '200',
      fontFamily   : "'Cinzel', serif",
      userSelect   : 'none',
      overflow     : 'hidden',
    });
    document.body.appendChild(this._container);

    // ── Header ──
    const header = document.createElement('div');
    Object.assign(header.style, {
      display       : 'flex',
      alignItems    : 'center',
      justifyContent: 'space-between',
      padding       : '10px 16px',
      borderBottom  : '1px solid rgba(201,168,76,0.3)',
      background    : 'rgba(0,0,0,0.5)',
      flexShrink    : '0',
      gap           : '10px',
    });

    const left = document.createElement('div');
    Object.assign(left.style, { display: 'flex', alignItems: 'center', gap: '12px', flex: '1', minWidth: '0' });

    const title = document.createElement('div');
    Object.assign(title.style, { color: '#c9a84c', fontSize: '12px', letterSpacing: '2px', whiteSpace: 'nowrap' });
    title.textContent = 'ÁRBOL DE HABILIDADES';

    this._pointsEl = document.createElement('div');
    Object.assign(this._pointsEl.style, {
      background: 'rgba(201,168,76,0.15)', border: '1px solid rgba(201,168,76,0.4)',
      borderRadius: '6px', padding: '3px 8px', color: '#c9a84c',
      fontSize: '9px', letterSpacing: '1px', whiteSpace: 'nowrap',
    });

    this._levelEl = document.createElement('div');
    Object.assign(this._levelEl.style, {
      background: 'rgba(100,180,255,0.1)', border: '1px solid rgba(100,180,255,0.3)',
      borderRadius: '6px', padding: '3px 8px', color: '#88ccff',
      fontSize: '9px', letterSpacing: '1px', whiteSpace: 'nowrap',
    });

    this._weaponEl = document.createElement('div');
    Object.assign(this._weaponEl.style, {
      background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.15)',
      borderRadius: '6px', padding: '3px 8px', color: '#aaaaaa',
      fontSize: '9px', letterSpacing: '1px', whiteSpace: 'nowrap',
    });

    left.appendChild(title);
    left.appendChild(this._pointsEl);
    left.appendChild(this._levelEl);
    left.appendChild(this._weaponEl);

    const closeBtn = document.createElement('button');
    closeBtn.textContent = '✕';
    Object.assign(closeBtn.style, {
      background: 'none', border: 'none', color: '#888',
      fontSize: '18px', cursor: 'pointer', padding: '4px 8px', flexShrink: '0',
    });
    closeBtn.addEventListener('click', () => this.close());

    header.appendChild(left);
    header.appendChild(closeBtn);
    this._container.appendChild(header);

    // ── Category tabs ──
    const tabs = document.createElement('div');
    Object.assign(tabs.style, {
      display: 'flex', gap: '4px', padding: '8px 12px',
      background: 'rgba(0,0,0,0.4)', flexShrink: '0',
      borderBottom: '1px solid rgba(255,255,255,0.05)',
      overflowX: 'auto',
    });

    this._tabs = {};
    Object.entries(CATEGORIES).forEach(([key, cat]) => {
      const tab = document.createElement('button');
      tab.innerHTML = `${cat.icon} <span style="font-size:9px;">${cat.label.toUpperCase()}</span>`;
      Object.assign(tab.style, {
        background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '6px', color: '#888', fontSize: '10px', padding: '5px 10px',
        cursor: 'pointer', letterSpacing: '1px', transition: 'all 0.2s',
        whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '4px',
      });

      tab.addEventListener('click', () => {
        const allowed = WEAPON_CATEGORIES[this._weaponType] ?? WEAPON_CATEGORIES.default;
        // Bloqueada si no está en las permitidas para esta arma
        if (!allowed.includes(key)) return;
        // Estratégica además requiere nivel de mundo 5
        if (key === 'estrategica' && this._worldLevel < 5) return;

        this._category     = key;
        this._selectedNode = null;
        this._resetView();
        this._renderTree();
        this._hidePanel();
      });

      tabs.appendChild(tab);
      this._tabs[key] = tab;
    });
    this._container.appendChild(tabs);

    // ── Body ──
    const body = document.createElement('div');
    Object.assign(body.style, { flex: '1', display: 'flex', overflow: 'hidden', position: 'relative' });
    this._container.appendChild(body);

    this._canvas = document.createElement('canvas');
    Object.assign(this._canvas.style, { flex: '1', display: 'block', touchAction: 'none' });
    body.appendChild(this._canvas);

    this._canvas.addEventListener('touchstart',  e => this._onTouchStart(e),  { passive: false });
    this._canvas.addEventListener('touchmove',   e => this._onTouchMove(e),   { passive: false });
    this._canvas.addEventListener('touchend',    e => this._onTouchEnd(e),    { passive: false });
    this._canvas.addEventListener('mousedown',   e => this._onMouseDown(e));
    this._canvas.addEventListener('mousemove',   e => this._onMouseMove(e));
    this._canvas.addEventListener('mouseup',     e => this._onMouseUp(e));
    this._canvas.addEventListener('wheel',       e => this._onWheel(e),       { passive: false });
    this._canvas.addEventListener('click',       e => this._onCanvasClick(e));

    this._panel = document.createElement('div');
    Object.assign(this._panel.style, {
      width: '0px', background: 'rgba(4,4,14,0.97)',
      borderLeft: '1px solid rgba(201,168,76,0.2)', overflow: 'hidden',
      transition: 'width 0.25s ease', flexShrink: '0',
      display: 'flex', flexDirection: 'column',
    });
    body.appendChild(this._panel);

    this._panelInner = document.createElement('div');
    Object.assign(this._panelInner.style, {
      width: '240px', padding: '16px', display: 'flex',
      flexDirection: 'column', gap: '10px', overflowY: 'auto',
      height: '100%', boxSizing: 'border-box',
    });
    this._panel.appendChild(this._panelInner);

    const hint = document.createElement('div');
    Object.assign(hint.style, {
      position: 'absolute', bottom: '12px', left: '50%',
      transform: 'translateX(-50%)',
      color: 'rgba(255,255,255,0.2)', fontSize: '9px',
      letterSpacing: '1px', pointerEvents: 'none',
      fontFamily: 'monospace',
    });
    hint.textContent = 'PELLIZCA PARA ZOOM · ARRASTRA PARA MOVER';
    body.appendChild(hint);

    window.addEventListener('resize', () => { if (this._visible) this._renderTree(); });
  }

  // ── Vista ─────────────────────────────────────────────────────────────────

  _resetView() {
    this._zoom = 1;
    this._panX = 0;
    this._panY = 0;
  }

  // ── Touch / Pan / Zoom ────────────────────────────────────────────────────

  _onTouchStart(e) {
    e.preventDefault();
    if (e.touches.length === 1) {
      this._isPanning = true;
      this._tapStart  = { x: e.touches[0].clientX, y: e.touches[0].clientY, t: Date.now() };
      this._lastTouch = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      this._didPan    = false;
    } else if (e.touches.length === 2) {
      this._isPanning = false;
      this._pinchDist = this._getTouchDist(e.touches);
    }
  }

  _onTouchMove(e) {
    e.preventDefault();
    if (e.touches.length === 1 && this._isPanning && this._lastTouch) {
      const dx = e.touches[0].clientX - this._lastTouch.x;
      const dy = e.touches[0].clientY - this._lastTouch.y;
      this._panX += dx;
      this._panY += dy;
      this._lastTouch = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      if (Math.abs(dx) > 3 || Math.abs(dy) > 3) this._didPan = true;
      this._renderTree();
    } else if (e.touches.length === 2 && this._pinchDist !== null) {
      const newDist   = this._getTouchDist(e.touches);
      const ratio     = newDist / this._pinchDist;
      this._zoom      = Math.max(0.4, Math.min(3, this._zoom * ratio));
      this._pinchDist = newDist;
      this._renderTree();
    }
  }

  _onTouchEnd(e) {
    e.preventDefault();
    if (!this._didPan && this._tapStart && e.changedTouches.length === 1) {
      const dt = Date.now() - this._tapStart.t;
      const dx = e.changedTouches[0].clientX - this._tapStart.x;
      const dy = e.changedTouches[0].clientY - this._tapStart.y;
      if (dt < 300 && Math.abs(dx) < 10 && Math.abs(dy) < 10) {
        this._handleTap(e.changedTouches[0].clientX, e.changedTouches[0].clientY);
      }
    }
    this._isPanning = false;
    this._pinchDist = null;
    this._lastTouch = null;
    this._tapStart  = null;
  }

  _onMouseDown(e) {
    this._isPanning = true;
    this._lastTouch = { x: e.clientX, y: e.clientY };
    this._didPan    = false;
  }

  _onMouseMove(e) {
    if (!this._isPanning || !this._lastTouch) return;
    const dx = e.clientX - this._lastTouch.x;
    const dy = e.clientY - this._lastTouch.y;
    this._panX += dx;
    this._panY += dy;
    this._lastTouch = { x: e.clientX, y: e.clientY };
    if (Math.abs(dx) > 2 || Math.abs(dy) > 2) this._didPan = true;
    this._renderTree();
  }

  _onMouseUp(e) { this._isPanning = false; }

  _onWheel(e) {
    e.preventDefault();
    const factor = e.deltaY < 0 ? 1.1 : 0.9;
    this._zoom   = Math.max(0.4, Math.min(3, this._zoom * factor));
    this._renderTree();
  }

  _onCanvasClick(e) {
    if (this._didPan) return;
    this._handleTap(e.clientX, e.clientY);
  }

  _handleTap(cx, cy) {
    const rect = this._canvas.getBoundingClientRect();
    const mx   = (cx - rect.left - this._panX) / this._zoom;
    const my   = (cy - rect.top  - this._panY) / this._zoom;

    const hit = this._nodes.find(n => {
      const dx = n.x - mx, dy = n.y - my;
      return Math.sqrt(dx * dx + dy * dy) <= n.r + 12;
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

  _getTouchDist(touches) {
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
  }

  // ── Render ────────────────────────────────────────────────────────────────

  _renderTree() {
    // Fallback seguro si la categoría es inválida
    if (!this._category || !CATEGORIES[this._category]) {
      this._category = 'ofensiva';
    }

    const cat     = CATEGORIES[this._category];
    const allowed = WEAPON_CATEGORIES[this._weaponType] ?? WEAPON_CATEGORIES.default;

    // Header info
    this._pointsEl.textContent = `✦ ${this._skillPoints} pts`;
    this._levelEl.textContent  = `NIV MUNDO ${this._worldLevel}`;
    this._weaponEl.textContent = `⚔ ${this._weaponType.toUpperCase()}`;

    // Tabs — activa, bloqueada por arma, bloqueada por nivel
    Object.entries(this._tabs).forEach(([key, tab]) => {
      const active    = key === this._category;
      const permitted = allowed.includes(key);
      const needsLvl  = key === 'estrategica' && this._worldLevel < 5;
      const blocked   = !permitted || needsLvl;
      const c         = CATEGORIES[key];

      tab.style.background  = active ? `${c.color}33` : 'rgba(255,255,255,0.05)';
      tab.style.borderColor = active ? `${c.color}99` : 'rgba(255,255,255,0.1)';
      tab.style.color       = active ? c.color : blocked ? '#444' : '#888';
      tab.style.opacity     = blocked ? '0.3' : '1';
      tab.style.cursor      = blocked ? 'not-allowed' : 'pointer';

      // Tooltip de por qué está bloqueada
      if (!permitted) {
        tab.title = `No disponible para ${this._weaponType}`;
      } else if (needsLvl) {
        tab.title = 'Requiere Nivel de Mundo 5';
      } else {
        tab.title = '';
      }
    });

    // Canvas setup
    const dpr = window.devicePixelRatio || 1;
    const W   = this._canvas.offsetWidth;
    const H   = this._canvas.offsetHeight;
    this._canvas.width  = W * dpr;
    this._canvas.height = H * dpr;
    const ctx = this._canvas.getContext('2d');
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, W, H);
    this._ctx = ctx;

    ctx.save();
    ctx.translate(this._panX, this._panY);
    ctx.scale(this._zoom, this._zoom);

    const skills  = cat.skills;
    const nodeR   = 28;
    const levelH  = 110;
    const padTop  = 60;

    const byLevel = {};
    skills.forEach(sk => {
      if (!byLevel[sk.nivel]) byLevel[sk.nivel] = [];
      byLevel[sk.nivel].push(sk);
    });

    this._nodes = [];
    const centerX = W / 2;

    Object.entries(byLevel).forEach(([lvl, sks]) => {
      const y       = padTop + (parseInt(lvl) - 1) * levelH;
      const cols    = sks.length;
      const spacing = Math.min(120, (W - 80) / Math.max(cols, 1));

      sks.forEach((sk, i) => {
        const x         = centerX + (i - (cols - 1) / 2) * spacing;
        const unlocked  = !!this._unlocked[sk.id];
        const canUnlock = !unlocked && this._worldLevel >= NIVEL_REQUIRED[sk.tipo]
                         && this._skillPoints >= sk.cost;
        const locked    = !unlocked && !canUnlock;

        this._nodes.push({ x, y, r: nodeR, skill: sk, unlocked, canUnlock, locked, nivel: parseInt(lvl) });
      });
    });

    // Líneas entre niveles
    const levels = Object.keys(byLevel).map(Number).sort((a, b) => a - b);
    for (let i = 0; i < levels.length - 1; i++) {
      const fromNodes = this._nodes.filter(n => n.nivel === levels[i]);
      const toNodes   = this._nodes.filter(n => n.nivel === levels[i + 1]);

      fromNodes.forEach(from => {
        toNodes.forEach(to => {
          const bothUnlocked = from.unlocked && to.unlocked;
          const grad = ctx.createLinearGradient(from.x, from.y, to.x, to.y);
          grad.addColorStop(0, bothUnlocked ? cat.color + 'cc' : 'rgba(80,80,80,0.25)');
          grad.addColorStop(1, bothUnlocked ? cat.color + 'cc' : 'rgba(80,80,80,0.25)');
          ctx.beginPath();
          ctx.strokeStyle = grad;
          ctx.lineWidth   = bothUnlocked ? 2.5 : 1.5;
          ctx.setLineDash(bothUnlocked ? [] : [5, 5]);
          ctx.moveTo(from.x, from.y);
          ctx.lineTo(to.x, to.y);
          ctx.stroke();
          ctx.setLineDash([]);
        });
      });
    }

    // Nodos
    this._nodes.forEach(n => this._drawNode(n, cat.color));

    // Labels de nivel
    levels.forEach(lvl => {
      const nodesInLevel = this._nodes.filter(n => n.nivel === lvl);
      if (!nodesInLevel.length) return;
      const y = nodesInLevel[0].y - nodeR - 20;
      ctx.font      = `bold 9px monospace`;
      ctx.fillStyle = 'rgba(201,168,76,0.4)';
      ctx.textAlign = 'left';
      ctx.fillText(`NIVEL ${lvl}`, 16, y + 4);
    });

    ctx.restore();
  }

  _drawNode(n, catColor) {
    const ctx        = this._ctx;
    const isSelected = this._selectedNode?.skill.id === n.skill.id;
    const r          = n.r + (isSelected ? 4 : 0);

    if (n.unlocked || n.canUnlock) {
      ctx.save();
      ctx.shadowColor = n.unlocked ? catColor : '#ffdd88';
      ctx.shadowBlur  = isSelected ? 24 : 14;
      ctx.beginPath();
      ctx.arc(n.x, n.y, r, 0, Math.PI * 2);
      ctx.strokeStyle = 'transparent';
      ctx.stroke();
      ctx.restore();
    }

    const grad = ctx.createRadialGradient(n.x - r * 0.3, n.y - r * 0.3, 0, n.x, n.y, r);
    if (n.unlocked) {
      grad.addColorStop(0, '#1e1238');
      grad.addColorStop(1, '#0a0818');
    } else if (n.canUnlock) {
      grad.addColorStop(0, '#1a1505');
      grad.addColorStop(1, '#0d0a02');
    } else {
      grad.addColorStop(0, '#111118');
      grad.addColorStop(1, '#08080f');
    }
    ctx.beginPath();
    ctx.arc(n.x, n.y, r, 0, Math.PI * 2);
    ctx.fillStyle = grad;
    ctx.fill();

    ctx.beginPath();
    ctx.arc(n.x, n.y, r, 0, Math.PI * 2);
    ctx.strokeStyle = n.unlocked
      ? catColor + (isSelected ? 'ff' : 'bb')
      : n.canUnlock ? '#ffdd8899' : 'rgba(80,80,80,0.35)';
    ctx.lineWidth = isSelected ? 3 : 1.5;
    ctx.stroke();

    ctx.textAlign    = 'center';
    ctx.textBaseline = 'middle';
    if (n.locked) {
      ctx.font        = `${Math.round(r * 0.8)}px serif`;
      ctx.globalAlpha = 0.18;
      ctx.fillText(n.skill.icon, n.x, n.y - 3);
      ctx.globalAlpha = 1;
      ctx.font        = `${Math.round(r * 0.5)}px serif`;
      ctx.fillText('🔒', n.x, n.y + 4);
    } else {
      ctx.font        = `${Math.round(r * 0.85)}px serif`;
      ctx.globalAlpha = n.canUnlock ? 0.7 : 1;
      ctx.fillText(n.skill.icon, n.x, n.y);
      ctx.globalAlpha = 1;
    }

    const badgeColor = TIPO_COLORS[n.skill.tipo];
    ctx.font      = `bold 7px monospace`;
    ctx.fillStyle = n.unlocked ? badgeColor : 'rgba(100,100,100,0.6)';
    ctx.textAlign = 'center';
    ctx.fillText(n.skill.tipo.toUpperCase(), n.x, n.y + r + 12);

    if (n.unlocked) {
      ctx.beginPath();
      ctx.arc(n.x + r * 0.65, n.y - r * 0.65, 8, 0, Math.PI * 2);
      ctx.fillStyle = catColor;
      ctx.fill();
      ctx.font      = 'bold 9px sans-serif';
      ctx.fillStyle = '#fff';
      ctx.textAlign = 'center';
      ctx.fillText('✓', n.x + r * 0.65, n.y - r * 0.65);
    }

    if (n.canUnlock && n.skill.cost > 0) {
      ctx.font      = 'bold 8px monospace';
      ctx.fillStyle = '#ffdd88';
      ctx.textAlign = 'center';
      ctx.fillText(`${n.skill.cost}pts`, n.x, n.y - r - 8);
    }
  }

  // ── Panel ─────────────────────────────────────────────────────────────────

  _showPanel(n) {
    this._panel.style.width = '240px';
    const skill = n.skill;
    const cat   = CATEGORIES[this._category];
    const color = TIPO_COLORS[skill.tipo];

    let statusHtml = '';
    if (n.unlocked) {
      statusHtml = `<div style="color:#4cff88;font-size:9px;letter-spacing:1px;">✓ DESBLOQUEADA</div>`;
    } else if (n.canUnlock) {
      statusHtml = `
        <div style="color:#ffdd88;font-size:9px;letter-spacing:1px;">⬆ LISTA PARA DESBLOQUEAR</div>
        <div style="color:#888;font-size:9px;margin-top:2px;">Coste: ${skill.cost} punto${skill.cost !== 1 ? 's' : ''}</div>
      `;
    } else {
      const reasons = [];
      if (this._worldLevel < NIVEL_REQUIRED[skill.tipo])
        reasons.push(`Nivel de mundo ${NIVEL_REQUIRED[skill.tipo]} requerido (actual: ${this._worldLevel})`);
      if (this._skillPoints < skill.cost)
        reasons.push(`Faltan ${skill.cost - this._skillPoints} puntos`);
      statusHtml = `
        <div style="color:#ff6644;font-size:9px;letter-spacing:1px;">🔒 BLOQUEADA</div>
        ${reasons.map(r => `<div style="color:#555;font-size:9px;margin-top:2px;">· ${r}</div>`).join('')}
      `;
    }

    let actionHtml = '';
    if (n.canUnlock) {
      actionHtml = `
        <button data-action="unlock" style="
          background:rgba(255,221,136,0.2);border:1px solid #ffdd8888;
          border-radius:6px;color:#ffdd88;font-family:'Cinzel',serif;
          font-size:9px;letter-spacing:2px;padding:10px;cursor:pointer;width:100%;
        ">✦ DESBLOQUEAR (${skill.cost} pts)</button>
      `;
    } else if (n.unlocked) {
      actionHtml = `
        <button data-action="equip" style="
          background:rgba(201,168,76,0.2);border:1px solid rgba(201,168,76,0.5);
          border-radius:6px;color:#c9a84c;font-family:'Cinzel',serif;
          font-size:9px;letter-spacing:2px;padding:10px;cursor:pointer;width:100%;
        ">EQUIPAR HABILIDAD</button>
      `;
    }

    this._panelInner.innerHTML = `
      <div style="text-align:center;">
        <div style="font-size:48px;margin-bottom:8px;">${skill.icon}</div>
        <div style="color:${cat.color};font-size:13px;letter-spacing:2px;margin-bottom:4px;">${skill.label}</div>
        <div style="color:${color};font-size:9px;letter-spacing:3px;">${skill.tipo.toUpperCase()}</div>
      </div>

      <div style="border-top:1px solid rgba(255,255,255,0.06);padding-top:10px;">
        <div style="color:#555;font-size:8px;letter-spacing:2px;margin-bottom:6px;">CATEGORÍA</div>
        <div style="color:${cat.color};font-size:10px;">${cat.icon} ${cat.label}</div>
      </div>

      <div style="border-top:1px solid rgba(255,255,255,0.06);padding-top:10px;">
        <div style="color:#555;font-size:8px;letter-spacing:2px;margin-bottom:6px;">LIMITANTE</div>
        <div style="color:#ff8866;font-size:10px;line-height:1.4;">⚠ ${skill.limitante}</div>
      </div>

      <div style="border-top:1px solid rgba(255,255,255,0.06);padding-top:10px;display:flex;flex-direction:column;gap:5px;">
        <div style="display:flex;justify-content:space-between;">
          <span style="color:#555;font-size:9px;">NIVEL REQUERIDO</span>
          <span style="color:#88ccff;font-size:10px;">${NIVEL_REQUIRED[skill.tipo] === 0 ? 'Disponible' : `Mundo ${NIVEL_REQUIRED[skill.tipo]}`}</span>
        </div>
        <div style="display:flex;justify-content:space-between;">
          <span style="color:#555;font-size:9px;">COSTE</span>
          <span style="color:#ffdd88;font-size:10px;">${skill.cost === 0 ? 'Gratis' : `${skill.cost} pts`}</span>
        </div>
      </div>

      <div style="border-top:1px solid rgba(255,255,255,0.06);padding-top:10px;">
        ${statusHtml}
      </div>

      <div style="margin-top:auto;padding-top:8px;">
        ${actionHtml}
      </div>
    `;

    const unlockBtn = this._panelInner.querySelector('[data-action="unlock"]');
    const equipBtn  = this._panelInner.querySelector('[data-action="equip"]');

    if (unlockBtn) {
      unlockBtn.addEventListener('click', () => {
        if (this._skillPoints < skill.cost) return;
        this._skillPoints       -= skill.cost;
        this._unlocked[skill.id] = true;
        this._selectedNode       = null;
        this._renderTree();
        const updated = this._nodes.find(nd => nd.skill.id === skill.id);
        if (updated) { this._selectedNode = updated; this._showPanel(updated); }
        this._showFeedback(skill, cat.color);
      });
    }

    if (equipBtn) {
      equipBtn.addEventListener('click', () => {
        window._skillSystem?.equipSkill?.(skill.id);
        this._showFeedback(skill, cat.color, 'EQUIPADA');
      });
    }
  }

  _hidePanel() {
    this._panel.style.width    = '0px';
    this._panelInner.innerHTML = '';
  }

  _showFeedback(skill, color, msg = 'DESBLOQUEADA') {
    const el = document.createElement('div');
    Object.assign(el.style, {
      position: 'fixed', top: '20%', left: '50%',
      transform: 'translateX(-50%) scale(0.85)',
      fontFamily: "'Cinzel',serif", textAlign: 'center',
      background: 'rgba(4,4,10,0.97)', border: `1px solid ${color}55`,
      borderRadius: '8px', padding: '14px 28px', zIndex: '600',
      pointerEvents: 'none', boxShadow: `0 0 24px ${color}44`,
      transition: 'transform 0.35s ease, opacity 0.35s ease', opacity: '0',
    });
    el.innerHTML = `${skill.icon} HABILIDAD ${msg}<br>
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
