// ui/skillTree.js — Ashes of the Reborn | Valiant Gaming

import { SKILLTREE_RARITY, SKILLTREE_CATEGORIES } from '../data/palette.js';

const RARITY = SKILLTREE_RARITY;

// ── Umbrales de nivel de personaje por rareza ────────────────────────────────
// El nodo núcleo de cada categoría se desbloquea desde nivel 1 (ver _unlocked
// inicial más abajo). Las demás rarezas se desbloquean TODAS de una vez al
// alcanzar el nivel de personaje correspondiente — sin costo ni elección.
const RARITY_LEVEL_REQ = {
  comun: 20, rara: 30, epica: 40, legendaria: 60, mitica: 70, divina: 80,
};

// ── Categorías con árbol de nodos (colores desde palette, estructura local) ──
const CATEGORIES = {
  ofensiva: {
    ...SKILLTREE_CATEGORIES.ofensiva,
    tree: {
      nucleo: { id: 'of_nucleo', label: 'Llama Primordial',      icon: '🔥', rareza: 'comun',      limitante: 'Habilidad base',                       req: [] },
      nodes: [
        { id: 'of_c1', label: 'Golpe Ígneo',          icon: '👊', rareza: 'comun',      limitante: 'Daño básico de fuego',                 req: ['of_nucleo'], col: 0 },
        { id: 'of_c2', label: 'Destello Menor',        icon: '✨', rareza: 'comun',      limitante: 'Cegado 1 segundo',                     req: ['of_nucleo'], col: 1 },
        { id: 'of_c3', label: 'Empuje de Fuerza',      icon: '💨', rareza: 'comun',      limitante: 'Solo empuja, no daña',                 req: ['of_nucleo'], col: 2 },
        { id: 'of_r1', label: 'Chispa en Cadena',      icon: '⚡', rareza: 'rara',       limitante: 'Necesita 2 enemigos cerca',             req: ['of_c1'],     col: 0 },
        { id: 'of_r2', label: 'Lanza de Hielo',        icon: '🧊', rareza: 'rara',       limitante: 'Congela solo 2 segundos',               req: ['of_c2'],     col: 1 },
        { id: 'of_r3', label: 'Onda Sísmica',          icon: '🌊', rareza: 'rara',       limitante: 'No funciona en el aire',                req: ['of_c3'],     col: 2 },
        { id: 'of_e1', label: 'Meteoro Pequeño',       icon: '🌑', rareza: 'epica',      limitante: '4 segundos antes de caer',              req: ['of_r1'],     col: 0 },
        { id: 'of_e2', label: 'Lanza de Plasma',       icon: '💜', rareza: 'epica',      limitante: 'Recarga de 10 segundos',                req: ['of_r2'],     col: 1 },
        { id: 'of_e3', label: 'Vortex de Fuego',       icon: '🌪️', rareza: 'epica',      limitante: 'Solo desorienta, no mata directo',      req: ['of_r3'],     col: 2 },
        { id: 'of_l1', label: 'Nova Devastadora',      icon: '💥', rareza: 'legendaria', limitante: 'Sin energía 30 segundos',               req: ['of_e1','of_e2'], col: 0 },
        { id: 'of_l2', label: 'Colapso Dimensional',   icon: '🕳️', rareza: 'legendaria', limitante: 'Una vez por batalla',                   req: ['of_e2','of_e3'], col: 2 },
        { id: 'of_m1', label: 'Fragmentación Cósmica', icon: '☄️', rareza: 'mitica',     limitante: 'Daña aliados cercanos',                 req: ['of_l1'],     col: 0 },
        { id: 'of_m2', label: 'Tormenta de Plasma',    icon: '🌠', rareza: 'mitica',     limitante: 'Consume toda la energía',               req: ['of_l2'],     col: 2 },
        { id: 'of_d1', label: 'Juicio del Cosmos',     icon: '🌌', rareza: 'divina',     limitante: 'Una vez por guerra. Daña a todos',      req: ['of_m1','of_m2'], col: 1 },
      ],
    },
  },
  defensiva: {
    ...SKILLTREE_CATEGORIES.defensiva,
    tree: {
      nucleo: { id: 'de_nucleo', label: 'Manto Pétreo',          icon: '🪨', rareza: 'comun',      limitante: 'Defensa base',                         req: [] },
      nodes: [
        { id: 'de_c1', label: 'Piel de Piedra',        icon: '🗿', rareza: 'comun',      limitante: 'Ralentiza el movimiento',               req: ['de_nucleo'], col: 0 },
        { id: 'de_c2', label: 'Aura Protectora',        icon: '✨', rareza: 'comun',      limitante: 'Reducción pequeña y constante',         req: ['de_nucleo'], col: 1 },
        { id: 'de_c3', label: 'Armadura de Viento',     icon: '💨', rareza: 'comun',      limitante: 'Solo desvía proyectiles débiles',       req: ['de_nucleo'], col: 2 },
        { id: 'de_r1', label: 'Muro de Fuerza',         icon: '🧱', rareza: 'rara',       limitante: 'Tú tampoco puedes atravesarla',         req: ['de_c1'],     col: 0 },
        { id: 'de_r2', label: 'Barrera de Grupo',       icon: '🔵', rareza: 'rara',       limitante: 'Se rompe con suficiente daño',          req: ['de_c2'],     col: 1 },
        { id: 'de_r3', label: 'Escudo de Espejos',      icon: '🪞', rareza: 'rara',       limitante: 'No funciona contra daño físico',        req: ['de_c3'],     col: 2 },
        { id: 'de_e1', label: 'Campo de Espinas',       icon: '🌵', rareza: 'epica',      limitante: 'Solo daña al acercarse',                req: ['de_r1'],     col: 0 },
        { id: 'de_e2', label: 'Fortaleza Arcana',       icon: '🏰', rareza: 'epica',      limitante: 'No puedes moverte ni atacar',           req: ['de_r2'],     col: 1 },
        { id: 'de_e3', label: 'Inversión de Daño',      icon: '🔄', rareza: 'epica',      limitante: 'Recarga de 60 segundos',                req: ['de_r3'],     col: 2 },
        { id: 'de_l1', label: 'Égida Inmortal',         icon: '⚜️', rareza: 'legendaria', limitante: 'Solo activa con menos del 20% de vida', req: ['de_e1','de_e2'], col: 0 },
        { id: 'de_l2', label: 'Reflejo Absoluto',       icon: '🌀', rareza: 'legendaria', limitante: 'Devuelve el 200% del daño recibido',    req: ['de_e2','de_e3'], col: 2 },
        { id: 'de_m1', label: 'Resurrección Arcana',    icon: '💫', rareza: 'mitica',     limitante: 'Una vez por batalla',                   req: ['de_l1'],     col: 0 },
        { id: 'de_m2', label: 'Bastión Eterno',         icon: '🔱', rareza: 'mitica',     limitante: 'Indestructible 10 segundos',            req: ['de_l2'],     col: 2 },
        { id: 'de_d1', label: 'Escudo del Renacido',    icon: '👁️', rareza: 'divina',     limitante: 'Absorbe cualquier daño una vez',        req: ['de_m1','de_m2'], col: 1 },
      ],
    },
  },
  movilidad: {
    ...SKILLTREE_CATEGORIES.movilidad,
    tree: {
      nucleo: { id: 'mo_nucleo', label: 'Paso Veloz',             icon: '🏃', rareza: 'comun',      limitante: 'Velocidad base',                       req: [] },
      nodes: [
        { id: 'mo_c1', label: 'Carrera Mágica',         icon: '✦',  rareza: 'comun',      limitante: 'Dura 5 segundos',                       req: ['mo_nucleo'], col: 0 },
        { id: 'mo_c2', label: 'Salto Potenciado',        icon: '⬆️', rareza: 'comun',      limitante: 'Sin recarga',                           req: ['mo_nucleo'], col: 1 },
        { id: 'mo_c3', label: 'Impulso de Viento',       icon: '🌬️', rareza: 'comun',      limitante: 'Solo en dirección que miras',           req: ['mo_nucleo'], col: 2 },
        { id: 'mo_r1', label: 'Vuelo Mágico',            icon: '🦋', rareza: 'rara',       limitante: 'Consume energía constantemente',        req: ['mo_c1'],     col: 0 },
        { id: 'mo_r2', label: 'Dash Aéreo',              icon: '💫', rareza: 'rara',       limitante: 'Solo horizontal en el aire',            req: ['mo_c2'],     col: 1 },
        { id: 'mo_r3', label: 'Paso de Sombra',          icon: '👤', rareza: 'rara',       limitante: 'Intangible solo 2 segundos',            req: ['mo_c3'],     col: 2 },
        { id: 'mo_e1', label: 'Ola de Impulso',          icon: '🌊', rareza: 'epica',      limitante: 'Dura 6 segundos',                       req: ['mo_r1'],     col: 0 },
        { id: 'mo_e2', label: 'Teletransporte',          icon: '⚡', rareza: 'epica',      limitante: 'Recarga de 20 segundos',                req: ['mo_r2'],     col: 1 },
        { id: 'mo_e3', label: 'Colapso Espacial',        icon: '🕳️', rareza: 'epica',      limitante: 'Solo a aliados visibles',               req: ['mo_r3'],     col: 2 },
        { id: 'mo_l1', label: 'Parpadeo de Sombras',     icon: '🌑', rareza: 'legendaria', limitante: 'Atraviesa muros',                       req: ['mo_e1','mo_e2'], col: 0 },
        { id: 'mo_l2', label: 'Vuelo Etéreo',            icon: '🕊️', rareza: 'legendaria', limitante: 'Indetectable mientras vuela',           req: ['mo_e2','mo_e3'], col: 2 },
        { id: 'mo_m1', label: 'Parpadeo Infinito',       icon: '✨', rareza: 'mitica',     limitante: 'Agota toda la energía',                 req: ['mo_l1'],     col: 0 },
        { id: 'mo_m2', label: 'Dominio Espacial',        icon: '🌌', rareza: 'mitica',     limitante: 'Ralentiza el tiempo 5 segundos',        req: ['mo_l2'],     col: 2 },
        { id: 'mo_d1', label: 'Señor del Espacio',       icon: '♾️', rareza: 'divina',     limitante: 'Teletransporte ilimitado 30 segundos',  req: ['mo_m1','mo_m2'], col: 1 },
      ],
    },
  },
  soporte: {
    ...SKILLTREE_CATEGORIES.soporte,
    tree: {
      nucleo: { id: 'so_nucleo', label: 'Toque Sanador',          icon: '💚', rareza: 'comun',      limitante: 'Curación base',                        req: [] },
      nodes: [
        { id: 'so_c1', label: 'Curación Leve',          icon: '🌿', rareza: 'comun',      limitante: 'Cantidad pequeña',                      req: ['so_nucleo'], col: 0 },
        { id: 'so_c2', label: 'Vendaje Mágico',          icon: '🩹', rareza: 'comun',      limitante: 'Solo un aliado cercano',                req: ['so_nucleo'], col: 1 },
        { id: 'so_c3', label: 'Aura de Calma',           icon: '☮️', rareza: 'comun',      limitante: 'Reduce el pánico del grupo',            req: ['so_nucleo'], col: 2 },
        { id: 'so_r1', label: 'Aura de Regeneración',    icon: '🔆', rareza: 'rara',       limitante: 'Lenta y continua',                      req: ['so_c1'],     col: 0 },
        { id: 'so_r2', label: 'Grito de Guerra',         icon: '📯', rareza: 'rara',       limitante: 'Dura 8 segundos',                       req: ['so_c2'],     col: 1 },
        { id: 'so_r3', label: 'Visión Táctica',          icon: '👁️', rareza: 'rara',       limitante: 'Solo en área definida',                 req: ['so_c3'],     col: 2 },
        { id: 'so_e1', label: 'Comando de Velocidad',    icon: '⚡', rareza: 'epica',      limitante: 'Dura 12 segundos',                      req: ['so_r1'],     col: 0 },
        { id: 'so_e2', label: 'Escudo de Tropas',        icon: '🛡️', rareza: 'epica',      limitante: 'Dura 10 segundos',                      req: ['so_r2'],     col: 1 },
        { id: 'so_e3', label: 'Mente Colmena',           icon: '🧠', rareza: 'epica',      limitante: 'Comparte visión con aliados',           req: ['so_r3'],     col: 2 },
        { id: 'so_l1', label: 'Resurrección de Aliado',  icon: '✝️', rareza: 'legendaria', limitante: 'Recarga de 90 segundos',                req: ['so_e1','so_e2'], col: 0 },
        { id: 'so_l2', label: 'Sacrificio Heroico',      icon: '❤️', rareza: 'legendaria', limitante: 'Pierdes 50% de tu vida',                req: ['so_e2','so_e3'], col: 2 },
        { id: 'so_m1', label: 'Campo de Curación Masiva',icon: '🌟', rareza: 'mitica',     limitante: 'Una vez por batalla',                   req: ['so_l1'],     col: 0 },
        { id: 'so_m2', label: 'Alma Compartida',         icon: '🫀', rareza: 'mitica',     limitante: 'Comparte tu vida con aliados',          req: ['so_l2'],     col: 2 },
        { id: 'so_d1', label: 'Guardián Eterno',         icon: '👼', rareza: 'divina',     limitante: 'El grupo es inmortal 15 segundos',      req: ['so_m1','so_m2'], col: 1 },
      ],
    },
  },
  estrategica: {
    ...SKILLTREE_CATEGORIES.estrategica,
    tree: {
      nucleo: { id: 'es_nucleo', label: 'Mente Táctica',          icon: '🧩', rareza: 'comun',      limitante: 'Estrategia base',                      req: [] },
      nodes: [
        { id: 'es_c1', label: 'Sombra de Combate',      icon: '👥', rareza: 'comun',      limitante: 'Copia fantasmal temporal',              req: ['es_nucleo'], col: 0 },
        { id: 'es_c2', label: 'Niebla de Guerra',        icon: '🌫️', rareza: 'comun',      limitante: 'Dura 10 segundos',                      req: ['es_nucleo'], col: 1 },
        { id: 'es_c3', label: 'Trampa Básica',           icon: '🪤', rareza: 'comun',      limitante: 'Daño mínimo',                           req: ['es_nucleo'], col: 2 },
        { id: 'es_r1', label: 'Invocación Menor',        icon: '👻', rareza: 'rara',       limitante: 'Espíritu débil',                        req: ['es_c1'],     col: 0 },
        { id: 'es_r2', label: 'Control del Clima',       icon: '🌧️', rareza: 'rara',       limitante: 'Lluvia que ralentiza en área',          req: ['es_c2'],     col: 1 },
        { id: 'es_r3', label: 'Interferencia Mágica',    icon: '📡', rareza: 'rara',       limitante: 'Bloquea habilidades 8 segundos',        req: ['es_c3'],     col: 2 },
        { id: 'es_e1', label: 'Invocación de Élite',     icon: '⚔️', rareza: 'epica',      limitante: 'Espíritu poderoso 20 segundos',         req: ['es_r1'],     col: 0 },
        { id: 'es_e2', label: 'Trampa Espectral',        icon: '💣', rareza: 'epica',      limitante: 'Zona invisible que explota al pisarla', req: ['es_r2'],     col: 1 },
        { id: 'es_e3', label: 'Distorsión Temporal',     icon: '⏱️', rareza: 'epica',      limitante: 'Ralentiza enemigos 50%',                req: ['es_r3'],     col: 2 },
        { id: 'es_l1', label: 'Invocación de Dragón',    icon: '🐉', rareza: 'legendaria', limitante: 'Recarga de 120 segundos',               req: ['es_e1','es_e2'], col: 0 },
        { id: 'es_l2', label: 'Espíritu del Caos',       icon: '🌀', rareza: 'legendaria', limitante: 'Ataca a todos, aliados y enemigos',     req: ['es_e2','es_e3'], col: 2 },
        { id: 'es_m1', label: 'Señor de Espíritus',      icon: '👁️', rareza: 'mitica',     limitante: 'Controla 3 invocaciones a la vez',      req: ['es_l1'],     col: 0 },
        { id: 'es_m2', label: 'Colapso del Tiempo',      icon: '⌛', rareza: 'mitica',     limitante: 'Revierte el tiempo 5 segundos',         req: ['es_l2'],     col: 2 },
        { id: 'es_d1', label: 'Juicio Final',            icon: '☀️', rareza: 'divina',     limitante: 'Una vez por guerra',                    req: ['es_m1','es_m2'], col: 1 },
      ],
    },
  },
};

// Categorías por arma
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
    this._progression   = progression ?? null;
    this._container     = null;
    this._canvas        = null;
    this._ctx           = null;
    this._category      = 'ofensiva';
    this._weaponType    = 'default';
    this._nodes         = [];
    this._selectedNode  = null;
    this._visible       = false;
    this._characterLevel = 1;

    // Núcleo desbloqueado desde el inicio; el resto se calcula por nivel
    // en _isRarityUnlocked() a partir de RARITY_LEVEL_REQ.
    this._unlocked = {
      of_nucleo: true, de_nucleo: true,
      mo_nucleo: true, so_nucleo: true, es_nucleo: true,
    };

    this._zoom      = 1;
    this._panX      = 0;
    this._panY      = 0;
    this._isPanning = false;
    this._lastTouch = null;
    this._pinchDist = null;
    this._didPan    = false;
    this._tapStart  = null;

    this._particleTime = 0;
    this._animFrame    = null;

    this._build();
    this._startAnimation();
  }

  // ── API pública ───────────────────────────────────────────────────────────

  open(weaponType) {
    const weapon     = weaponType ?? 'default';
    this._weaponType = WEAPON_CATEGORIES[weapon] ? weapon : 'default';
    const allowed    = WEAPON_CATEGORIES[this._weaponType];
    if (!allowed.includes(this._category)) this._category = allowed[0];
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

  // Llamar cada vez que el nivel de personaje cambie (ver onLevelUp en
  // progression.js). Todas las skills de rarezas ya alcanzadas se
  // desbloquean automáticamente, sin costo ni elección.
  setCharacterLevel(level) {
    this._characterLevel = level;
    this._syncUnlocksFromLevel();
    if (this._visible) this._renderTree();
  }

  _syncUnlocksFromLevel() {
    for (const [rareza, reqLevel] of Object.entries(RARITY_LEVEL_REQ)) {
      if (this._characterLevel < reqLevel) continue;
      for (const cat of Object.values(CATEGORIES)) {
        cat.tree.nodes.forEach(n => {
          if (n.rareza === rareza) this._unlocked[n.id] = true;
        });
      }
    }
  }

  // ── Animación continua ────────────────────────────────────────────────────

  _startAnimation() {
    const loop = (t) => {
      this._particleTime = t;
      if (this._visible) this._renderTree();
      this._animFrame = requestAnimationFrame(loop);
    };
    this._animFrame = requestAnimationFrame(loop);
  }
  // ── Build DOM ─────────────────────────────────────────────────────────────

  _build() {
    this._container = document.createElement('div');
    Object.assign(this._container.style, {
      position: 'fixed', inset: '0', display: 'none',
      flexDirection: 'column',
      background: 'radial-gradient(ellipse at center, #0d0a1a 0%, #04040a 100%)',
      zIndex: '200', fontFamily: "'Cinzel', serif",
      userSelect: 'none', overflow: 'hidden',
    });
    document.body.appendChild(this._container);

    // Header
    const header = document.createElement('div');
    Object.assign(header.style, {
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '8px 14px', borderBottom: '1px solid rgba(201,168,76,0.3)',
      background: 'rgba(0,0,0,0.6)', flexShrink: '0', gap: '8px',
    });

    const left = document.createElement('div');
    Object.assign(left.style, { display: 'flex', alignItems: 'center', gap: '10px', flex: '1', minWidth: '0' });

    const title = document.createElement('div');
    Object.assign(title.style, { color: '#c9a84c', fontSize: '11px', letterSpacing: '3px', whiteSpace: 'nowrap' });
    title.textContent = 'ÁRBOL DE HABILIDADES';

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

    // Tabs
    const tabs = document.createElement('div');
    Object.assign(tabs.style, {
      display: 'flex', gap: '4px', padding: '6px 10px',
      background: 'rgba(0,0,0,0.4)', flexShrink: '0',
      borderBottom: '1px solid rgba(255,255,255,0.05)', overflowX: 'auto',
    });

    this._tabs = {};
    Object.entries(CATEGORIES).forEach(([key, cat]) => {
      const tab = document.createElement('button');
      tab.innerHTML = `${cat.icon} <span style="font-size:8px;">${cat.label.toUpperCase()}</span>`;
      Object.assign(tab.style, {
        background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '6px', color: '#888', fontSize: '10px', padding: '4px 10px',
        cursor: 'pointer', letterSpacing: '1px', transition: 'all 0.2s',
        whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '4px',
      });

      tab.addEventListener('click', () => {
        const allowed = WEAPON_CATEGORIES[this._weaponType] ?? WEAPON_CATEGORIES.default;
        if (!allowed.includes(key)) return;
        this._category     = key;
        this._selectedNode = null;
        this._resetView();
        this._hidePanel();
      });

      tabs.appendChild(tab);
      this._tabs[key] = tab;
    });
    this._container.appendChild(tabs);

    // Body
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

    // Panel lateral
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
      width: '220px', padding: '14px', display: 'flex',
      flexDirection: 'column', gap: '10px', overflowY: 'auto',
      height: '100%', boxSizing: 'border-box',
    });
    this._panel.appendChild(this._panelInner);

    const hint = document.createElement('div');
    Object.assign(hint.style, {
      position: 'absolute', bottom: '8px', left: '50%',
      transform: 'translateX(-50%)',
      color: 'rgba(255,255,255,0.15)', fontSize: '8px',
      letterSpacing: '1px', pointerEvents: 'none', fontFamily: 'monospace',
    });
    hint.textContent = 'PELLIZCA PARA ZOOM · ARRASTRA PARA MOVER';
    body.appendChild(hint);

    window.addEventListener('resize', () => { if (this._visible) this._renderTree(); });
  }

  // ── Vista ─────────────────────────────────────────────────────────────────

  _resetView() { this._zoom = 1; this._panX = 0; this._panY = 0; }

  // ── Touch / Mouse ─────────────────────────────────────────────────────────

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
      this._panX += dx; this._panY += dy;
      this._lastTouch = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      if (Math.abs(dx) > 3 || Math.abs(dy) > 3) this._didPan = true;
    } else if (e.touches.length === 2 && this._pinchDist !== null) {
      const nd    = this._getTouchDist(e.touches);
      this._zoom  = Math.max(0.3, Math.min(4, this._zoom * (nd / this._pinchDist)));
      this._pinchDist = nd;
    }
  }

  _onTouchEnd(e) {
    e.preventDefault();
    if (!this._didPan && this._tapStart && e.changedTouches.length === 1) {
      const dt = Date.now() - this._tapStart.t;
      const dx = e.changedTouches[0].clientX - this._tapStart.x;
      const dy = e.changedTouches[0].clientY - this._tapStart.y;
      if (dt < 300 && Math.abs(dx) < 10 && Math.abs(dy) < 10)
        this._handleTap(e.changedTouches[0].clientX, e.changedTouches[0].clientY);
    }
    this._isPanning = false; this._pinchDist = null;
    this._lastTouch = null;  this._tapStart  = null;
  }

  _onMouseDown(e) { this._isPanning = true; this._lastTouch = { x: e.clientX, y: e.clientY }; this._didPan = false; }

  _onMouseMove(e) {
    if (!this._isPanning || !this._lastTouch) return;
    const dx = e.clientX - this._lastTouch.x;
    const dy = e.clientY - this._lastTouch.y;
    this._panX += dx; this._panY += dy;
    this._lastTouch = { x: e.clientX, y: e.clientY };
    if (Math.abs(dx) > 2 || Math.abs(dy) > 2) this._didPan = true;
  }

  _onMouseUp() { this._isPanning = false; }

  _onWheel(e) {
    e.preventDefault();
    this._zoom = Math.max(0.3, Math.min(4, this._zoom * (e.deltaY < 0 ? 1.1 : 0.9)));
  }

  _onCanvasClick(e) { if (!this._didPan) this._handleTap(e.clientX, e.clientY); }

  _handleTap(cx, cy) {
    const rect = this._canvas.getBoundingClientRect();
    const mx   = (cx - rect.left - this._panX) / this._zoom;
    const my   = (cy - rect.top  - this._panY) / this._zoom;
    const hit  = this._nodes.find(n => {
      const dx = n.x - mx, dy = n.y - my;
      return Math.sqrt(dx * dx + dy * dy) <= n.r + 10;
    });
    if (hit) { this._selectedNode = hit; this._showPanel(hit); }
    else      { this._selectedNode = null; this._hidePanel(); }
  }

  _getTouchDist(t) {
    const dx = t[0].clientX - t[1].clientX, dy = t[0].clientY - t[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
  }

  // ── Layout del árbol ──────────────────────────────────────────────────────

  _buildLayout() {
    if (!CATEGORIES[this._category]) this._category = 'ofensiva';
    const cat   = CATEGORIES[this._category];
    const tree  = cat.tree;
    const W     = this._canvas.offsetWidth;
    const H     = this._canvas.offsetHeight;

    const RARITY_LEVEL = { comun: 1, rara: 2, epica: 3, legendaria: 4, mitica: 5, divina: 6 };

    const levels    = 7;
    const padLeft   = 80;
    const padRight  = 60;
    const levelW    = (W - padLeft - padRight) / (levels - 1);

    const byLevel = { 0: [{ ...tree.nucleo, _isNucleo: true }] };
    tree.nodes.forEach(n => {
      const lv = RARITY_LEVEL[n.rareza];
      if (!byLevel[lv]) byLevel[lv] = [];
      byLevel[lv].push(n);
    });

    const nodes = [];
    Object.entries(byLevel).forEach(([lv, sks]) => {
      const x      = padLeft + parseInt(lv) * levelW;
      const count  = sks.length;
      const spread = Math.min(H * 0.55, count * 90);
      const startY = H / 2 - spread / 2 + spread / (count * 2);

      sks.forEach((sk, i) => {
        const y        = startY + i * (spread / count);
        const r        = RARITY[sk.rareza]?.size ?? 24;
        const unlocked = !!this._unlocked[sk.id];

        const reqMet    = (sk.req ?? []).every(rid => this._unlocked[rid]);
        const levelReq  = RARITY_LEVEL_REQ[sk.rareza] ?? 0;
        const canUnlock = !unlocked && reqMet && this._characterLevel >= levelReq;
        const locked    = !unlocked && !canUnlock;

        nodes.push({
          x, y, r,
          skill: sk, unlocked, canUnlock, locked,
          level: parseInt(lv), isNucleo: !!sk._isNucleo,
        });
      });
    });

    return nodes;
  }
  // ── Render ────────────────────────────────────────────────────────────────

  _renderTree() {
    if (!this._visible) return;
    const cat     = CATEGORIES[this._category] ?? CATEGORIES.ofensiva;
    const allowed = WEAPON_CATEGORIES[this._weaponType] ?? WEAPON_CATEGORIES.default;
    const t       = this._particleTime * 0.001;

    // Header
    this._levelEl.textContent  = `NIV. ${this._characterLevel}`;
    this._weaponEl.textContent = `⚔ ${this._weaponType.toUpperCase()}`;

    // Tabs
    Object.entries(this._tabs).forEach(([key, tab]) => {
      const active    = key === this._category;
      const permitted = allowed.includes(key);
      const blocked   = !permitted;
      const c         = CATEGORIES[key];
      tab.style.background  = active ? `${c.color}33` : 'rgba(255,255,255,0.05)';
      tab.style.borderColor = active ? `${c.color}99` : 'rgba(255,255,255,0.1)';
      tab.style.color       = active ? c.color : blocked ? '#333' : '#888';
      tab.style.opacity     = blocked ? '0.3' : '1';
      tab.style.cursor      = blocked ? 'not-allowed' : 'pointer';
    });

    // Canvas
    const dpr = window.devicePixelRatio || 1;
    const W   = this._canvas.offsetWidth;
    const H   = this._canvas.offsetHeight;
    this._canvas.width  = W * dpr;
    this._canvas.height = H * dpr;
    const ctx = this._canvas.getContext('2d');
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, W, H);
    this._ctx = ctx;

    // Fondo estrellado sutil
    this._drawStars(ctx, W, H, t);

    ctx.save();
    ctx.translate(this._panX, this._panY);
    ctx.scale(this._zoom, this._zoom);

    // Calcular nodos
    this._nodes = this._buildLayout();

    // Dibujar conexiones
    this._nodes.forEach(to => {
      const reqs = to.skill.req ?? [];
      reqs.forEach(rid => {
        const from = this._nodes.find(n => n.skill.id === rid);
        if (!from) return;
        this._drawConnection(ctx, from, to, cat.color, t);
      });
    });

    // Dibujar nodos
    this._nodes.forEach(n => this._drawNode(ctx, n, cat.color, t));

    ctx.restore();
  }

  _drawStars(ctx, W, H, t) {
    ctx.save();
    const seed = 42;
    for (let i = 0; i < 80; i++) {
      const x    = ((Math.sin(i * 127.1 + seed) * 0.5 + 0.5)) * W;
      const y    = ((Math.cos(i * 311.7 + seed) * 0.5 + 0.5)) * H;
      const size = 0.5 + (Math.sin(i * 73.1) * 0.5 + 0.5) * 1.5;
      const bri  = 0.1 + Math.sin(t * 0.8 + i) * 0.05;
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,255,255,${bri})`;
      ctx.fill();
    }
    ctx.restore();
  }

  _drawConnection(ctx, from, to, catColor, t) {
    const bothUnlocked = from.unlocked && to.unlocked;
    const anyUnlocked  = from.unlocked || to.unlocked;

    ctx.save();
    ctx.beginPath();
    ctx.moveTo(from.x, from.y);

    const cpx = (from.x + to.x) / 2;
    ctx.bezierCurveTo(cpx, from.y, cpx, to.y, to.x, to.y);

    if (bothUnlocked) {
      const grad = ctx.createLinearGradient(from.x, from.y, to.x, to.y);
      grad.addColorStop(0,   catColor + 'ff');
      grad.addColorStop(0.5, catColor + 'aa');
      grad.addColorStop(1,   catColor + 'ff');
      ctx.strokeStyle = grad;
      ctx.lineWidth   = 3;
      ctx.shadowColor = catColor;
      ctx.shadowBlur  = 10;
    } else if (anyUnlocked) {
      ctx.strokeStyle = 'rgba(150,150,150,0.4)';
      ctx.lineWidth   = 1.5;
      ctx.setLineDash([6, 4]);
    } else {
      ctx.strokeStyle = 'rgba(60,60,60,0.3)';
      ctx.lineWidth   = 1;
      ctx.setLineDash([4, 6]);
    }
    ctx.stroke();
    ctx.setLineDash([]);

    if (bothUnlocked) {
      const progress = (t * 0.4 + from.x * 0.01) % 1;
      const bx = this._bezierPoint(from.x, cpx, cpx, to.x, progress);
      const by = this._bezierPoint(from.y, from.y, to.y, to.y, progress);
      ctx.beginPath();
      ctx.arc(bx, by, 3, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = catColor;
      ctx.shadowBlur  = 12;
      ctx.fill();
    }

    ctx.restore();
  }

  _bezierPoint(p0, p1, p2, p3, t) {
    const mt = 1 - t;
    return mt*mt*mt*p0 + 3*mt*mt*t*p1 + 3*mt*t*t*p2 + t*t*t*p3;
  }

  _drawNode(ctx, n, catColor, t) {
    const r        = n.r;
    const rar      = RARITY[n.skill.rareza];
    const color    = rar.color;
    const glow     = rar.glow;
    const isSel    = this._selectedNode?.skill.id === n.skill.id;
    const pulse    = Math.sin(t * 2 + n.x * 0.05) * 0.5 + 0.5;

    ctx.save();

    if (n.unlocked) {
      ctx.shadowColor = color;
      ctx.shadowBlur  = isSel ? 40 : 20 + pulse * 10;
    } else if (n.canUnlock) {
      ctx.shadowColor = '#ffdd88';
      ctx.shadowBlur  = 15 + pulse * 8;
    }

    if (n.skill.rareza === 'legendaria' || n.skill.rareza === 'mitica' || n.skill.rareza === 'divina') {
      const segments = n.skill.rareza === 'divina' ? 8 : n.skill.rareza === 'mitica' ? 6 : 4;
      ctx.beginPath();
      for (let i = 0; i < segments; i++) {
        const angle = (i / segments) * Math.PI * 2 + t * (n.skill.rareza === 'divina' ? 0.5 : 0.3);
        const ox    = n.x + Math.cos(angle) * (r + 8);
        const oy    = n.y + Math.sin(angle) * (r + 8);
        ctx.beginPath();
        ctx.arc(ox, oy, 2.5, 0, Math.PI * 2);
        ctx.fillStyle = n.unlocked ? color : 'rgba(100,100,100,0.3)';
        ctx.fill();
      }
    }

    const grad = ctx.createRadialGradient(n.x - r*0.3, n.y - r*0.3, 0, n.x, n.y, r);
    if (n.unlocked) {
      grad.addColorStop(0, n.isNucleo ? '#2a1a40' : '#1a1030');
      grad.addColorStop(1, '#06040f');
    } else if (n.canUnlock) {
      grad.addColorStop(0, '#1a1505');
      grad.addColorStop(1, '#0a0800');
    } else {
      grad.addColorStop(0, '#0e0e18');
      grad.addColorStop(1, '#060610');
    }

    ctx.beginPath();
    ctx.arc(n.x, n.y, r, 0, Math.PI * 2);
    ctx.fillStyle = grad;
    ctx.fill();

    ctx.beginPath();
    ctx.arc(n.x, n.y, r, 0, Math.PI * 2);
    ctx.strokeStyle = n.unlocked
      ? color + (isSel ? 'ff' : 'cc')
      : n.canUnlock ? '#ffdd8866' : 'rgba(60,60,60,0.4)';
    ctx.lineWidth = n.isNucleo ? 3 : isSel ? 2.5 : 1.5;
    ctx.stroke();

    ctx.textAlign    = 'center';
    ctx.textBaseline = 'middle';
    if (n.locked && !n.isNucleo) {
      ctx.font        = `${Math.round(r * 0.75)}px serif`;
      ctx.globalAlpha = 0.12;
      ctx.fillText(n.skill.icon, n.x, n.y - 2);
      ctx.globalAlpha = 1;
      ctx.font        = `${Math.round(r * 0.5)}px serif`;
      ctx.fillText('🔒', n.x, n.y + 4);
    } else {
      ctx.font        = `${Math.round(r * (n.isNucleo ? 0.9 : 0.8))}px serif`;
      ctx.globalAlpha = n.canUnlock ? 0.65 : 1;
      ctx.fillText(n.skill.icon, n.x, n.y);
      ctx.globalAlpha = 1;
    }

    ctx.font      = `bold 6px monospace`;
    ctx.fillStyle = n.unlocked ? color : 'rgba(80,80,80,0.5)';
    ctx.textAlign = 'center';
    ctx.fillText(RARITY[n.skill.rareza].label.toUpperCase(), n.x, n.y + r + 10);

    if (n.unlocked || n.canUnlock || isSel) {
      ctx.font      = `bold 7px monospace`;
      ctx.fillStyle = n.unlocked ? '#ffffff99' : '#ffdd8866';
      ctx.textAlign = 'center';
      const label   = n.skill.label.length > 14
        ? n.skill.label.substring(0, 13) + '…'
        : n.skill.label;
      ctx.fillText(label, n.x, n.y - r - 8);
    }

    if (n.unlocked) {
      ctx.beginPath();
      ctx.arc(n.x + r * 0.68, n.y - r * 0.68, 7, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.shadowColor = color;
      ctx.shadowBlur  = 8;
      ctx.fill();
      ctx.font      = 'bold 8px sans-serif';
      ctx.fillStyle = '#000';
      ctx.shadowBlur = 0;
      ctx.textAlign = 'center';
      ctx.fillText('✓', n.x + r * 0.68, n.y - r * 0.68);
    }

    if (n.isNucleo && n.unlocked) {
      const rOuter = r + 10 + Math.sin(t * 1.5) * 3;
      ctx.beginPath();
      ctx.arc(n.x, n.y, rOuter, 0, Math.PI * 2);
      ctx.strokeStyle = color + '44';
      ctx.lineWidth   = 1.5;
      ctx.stroke();
    }

    ctx.restore();
  }

  // ── Panel ─────────────────────────────────────────────────────────────────

  _showPanel(n) {
    this._panel.style.width = '220px';
    const skill    = n.skill;
    const cat      = CATEGORIES[this._category];
    const rar      = RARITY[skill.rareza];
    const levelReq = RARITY_LEVEL_REQ[skill.rareza] ?? 0;

    let statusHtml = '';
    if (n.unlocked) {
      statusHtml = `<div style="color:#4cff88;font-size:9px;letter-spacing:1px;">✓ DESBLOQUEADA</div>`;
    } else if (n.canUnlock) {
      // Todas las skills de esta rareza se desbloquean solas al alcanzar
      // el nivel — si llegamos acá con canUnlock=true es un estado
      // transitorio de un frame (el próximo _syncUnlocksFromLevel lo cierra).
      statusHtml = `
        <div style="color:#ffdd88;font-size:9px;letter-spacing:1px;">⬆ DESBLOQUEANDO...</div>
      `;
    } else {
      const reasons = [];
      const reqs    = skill.req ?? [];
      const missingReqs = reqs.filter(rid => !this._unlocked[rid]);
      if (missingReqs.length) {
        const names = missingReqs.map(rid => {
          const allNodes = [cat.tree.nucleo, ...cat.tree.nodes];
          return allNodes.find(n => n.id === rid)?.label ?? rid;
        });
        reasons.push(`Requiere: ${names.join(', ')}`);
      }
      if (this._characterLevel < levelReq)
        reasons.push(`Nivel de personaje ${levelReq} requerido`);
      statusHtml = `
        <div style="color:#ff6644;font-size:9px;letter-spacing:1px;">🔒 BLOQUEADA</div>
        ${reasons.map(r => `<div style="color:#555;font-size:9px;margin-top:3px;">· ${r}</div>`).join('')}
      `;
    }

    let actionHtml = '';
    if (n.unlocked) {
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
        <div style="font-size:44px;margin-bottom:6px;">${skill.icon}</div>
        <div style="color:${cat.color};font-size:12px;letter-spacing:2px;margin-bottom:4px;">${skill.label}</div>
        <div style="color:${rar.color};font-size:9px;letter-spacing:3px;text-shadow:0 0 8px ${rar.glow};">
          ${rar.label.toUpperCase()}
        </div>
      </div>

      <div style="border-top:1px solid rgba(255,255,255,0.06);padding-top:8px;">
        <div style="color:#555;font-size:7px;letter-spacing:2px;margin-bottom:4px;">CATEGORÍA</div>
        <div style="color:${cat.color};font-size:10px;">${cat.icon} ${cat.label}</div>
      </div>

      <div style="border-top:1px solid rgba(255,255,255,0.06);padding-top:8px;">
        <div style="color:#555;font-size:7px;letter-spacing:2px;margin-bottom:4px;">LIMITANTE</div>
        <div style="color:#ff8866;font-size:9px;line-height:1.5;">⚠ ${skill.limitante}</div>
      </div>

      <div style="border-top:1px solid rgba(255,255,255,0.06);padding-top:8px;display:flex;flex-direction:column;gap:4px;">
        <div style="display:flex;justify-content:space-between;">
          <span style="color:#555;font-size:8px;">NIV. PERSONAJE REQ.</span>
          <span style="color:#88ccff;font-size:9px;">${levelReq === 0 ? 'Disponible' : `Nivel ${levelReq}`}</span>
        </div>
        <div style="display:flex;justify-content:space-between;">
          <span style="color:#555;font-size:8px;">RAREZA</span>
          <span style="color:${rar.color};font-size:9px;">${rar.label}</span>
        </div>
      </div>

      <div style="border-top:1px solid rgba(255,255,255,0.06);padding-top:8px;">
        ${statusHtml}
      </div>

      <div style="margin-top:auto;padding-top:8px;">
        ${actionHtml}
      </div>
    `;

    const equipBtn = this._panelInner.querySelector('[data-action="equip"]');

    if (equipBtn) {
      equipBtn.addEventListener('click', () => {
        window._skillSystem?.equipSkill?.(skill.id);
        this._showFeedback(skill, rar.color, cat.color, 'EQUIPADA');
      });
    }
  }

  _hidePanel() {
    this._panel.style.width    = '0px';
    this._panelInner.innerHTML = '';
  }

  _showFeedback(skill, rarColor, catColor, msg = 'DESBLOQUEADA') {
    const el = document.createElement('div');
    Object.assign(el.style, {
      position: 'fixed', top: '20%', left: '50%',
      transform: 'translateX(-50%) scale(0.85)',
      fontFamily: "'Cinzel',serif", textAlign: 'center',
      background: 'rgba(4,4,10,0.97)',
      border: `1px solid ${rarColor}66`,
      borderRadius: '8px', padding: '14px 28px', zIndex: '600',
      pointerEvents: 'none',
      boxShadow: `0 0 30px ${rarColor}44, 0 0 60px ${catColor}22`,
      transition: 'transform 0.35s ease, opacity 0.35s ease', opacity: '0',
    });
    el.innerHTML = `
      <div style="font-size:32px;margin-bottom:6px;">${skill.icon}</div>
      <div style="color:${rarColor};font-size:11px;letter-spacing:3px;">HABILIDAD ${msg}</div>
      <div style="color:#888;font-size:9px;margin-top:4px;">${skill.label}</div>
      <div style="color:${rarColor};font-size:8px;margin-top:2px;opacity:0.7;">${RARITY[skill.rareza].label.toUpperCase()}</div>
    `;
    document.body.appendChild(el);
    requestAnimationFrame(() => {
      el.style.opacity   = '1';
      el.style.transform = 'translateX(-50%) scale(1)';
    });
    setTimeout(() => {
      el.style.opacity   = '0';
      el.style.transform = 'translateX(-50%) scale(0.9)';
      setTimeout(() => el.remove(), 500);
    }, 2800);
  }

  // ── Serialización ─────────────────────────────────────────────────────────

  serialize() {
    return {
      unlocked      : this._unlocked,
      characterLevel: this._characterLevel,
    };
  }

  load(data) {
    if (!data) return;
    if (data.unlocked)                     this._unlocked       = data.unlocked;
    if (data.characterLevel !== undefined) this._characterLevel = data.characterLevel;
    // Por si el save es de una versión anterior con menos rarezas
    // desbloqueadas de las que el nivel cargado ya justificaría.
    this._syncUnlocksFromLevel();
  }
}
