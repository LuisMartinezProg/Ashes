// core/skillData.js — Ashes of the Reborn | Valiant Gaming
// Define armas, subtipos y habilidades por rareza

export const SKILL_DATA = {

  magic: {
    label: 'Magia',
    subtypes: {
      fire: {
        label: 'Fuego',
        icon: '🔥',
        color: '#ff4400',
        skills: [
          { id: 'fireball',      rarity: 'common',    label: 'Bola de Fuego',    icon: '🔥', cost: 30, cooldown: 5  },
          { id: 'fire_burst',    rarity: 'rare',      label: 'Explosión Ígnea',  icon: '💥', cost: 45, cooldown: 8  },
          { id: 'fire_pillar',   rarity: 'epic',      label: 'Pilar de Llamas',  icon: '🌋', cost: 60, cooldown: 12 },
          { id: 'inferno',       rarity: 'legendary', label: 'Infierno',         icon: '☄️', cost: 80, cooldown: 20 },
        ],
      },
      ice: {
        label: 'Hielo',
        icon: '❄️',
        color: '#88ccff',
        skills: [
          { id: 'ice_shard',     rarity: 'common',    label: 'Fragmento de Hielo', icon: '❄️', cost: 30, cooldown: 5  },
          { id: 'ice_spike',     rarity: 'rare',      label: 'Lanza de Hielo',     icon: '🧊', cost: 45, cooldown: 8  },
          { id: 'blizzard',      rarity: 'epic',      label: 'Ventisca',           icon: '🌨️', cost: 60, cooldown: 12 },
          { id: 'absolute_zero', rarity: 'legendary', label: 'Cero Absoluto',      icon: '💠', cost: 80, cooldown: 20 },
        ],
      },
      plant: {
        label: 'Planta',
        icon: '🌿',
        color: '#44cc44',
        skills: [
          { id: 'thorn',         rarity: 'common',    label: 'Espina',           icon: '🌿', cost: 30, cooldown: 5  },
          { id: 'vine_whip',     rarity: 'rare',      label: 'Látigo de Enredadera', icon: '🍃', cost: 45, cooldown: 8  },
          { id: 'spore_cloud',   rarity: 'epic',      label: 'Nube de Esporas',  icon: '🌸', cost: 60, cooldown: 12 },
          { id: 'world_tree',    rarity: 'legendary', label: 'Árbol del Mundo',  icon: '🌳', cost: 80, cooldown: 20 },
        ],
      },
      wind: {
        label: 'Viento',
        icon: '🌪️',
        color: '#aaeeff',
        skills: [
          { id: 'gust',          rarity: 'common',    label: 'Ráfaga',           icon: '💨', cost: 30, cooldown: 5  },
          { id: 'wind_blade',    rarity: 'rare',      label: 'Cuchilla de Viento', icon: '🌀', cost: 45, cooldown: 8  },
          { id: 'tornado',       rarity: 'epic',      label: 'Tornado',          icon: '🌪️', cost: 60, cooldown: 12 },
          { id: 'storm_god',     rarity: 'legendary', label: 'Dios de la Tormenta', icon: '⚡', cost: 80, cooldown: 20 },
        ],
      },
    },
  },

  katana: {
    label: 'Katana',
    subtypes: {
      speed: {
        label: 'Velocidad',
        icon: '⚡',
        color: '#e8c9a0',
        skills: [
          { id: 'quick_slash',   rarity: 'common',    label: 'Tajo Rápido',      icon: '🗡️', cost: 20, cooldown: 3  },
          { id: 'flash_step',    rarity: 'rare',      label: 'Paso Relámpago',   icon: '💫', cost: 35, cooldown: 6  },
          { id: 'blade_dance',   rarity: 'epic',      label: 'Danza de Hojas',   icon: '✨', cost: 50, cooldown: 10 },
          { id: 'thousand_cuts', rarity: 'legendary', label: 'Mil Cortes',       icon: '🌟', cost: 70, cooldown: 18 },
        ],
      },
      shadow: {
        label: 'Sombra',
        icon: '🌑',
        color: '#8855cc',
        skills: [
          { id: 'shadow_slash',  rarity: 'common',    label: 'Tajo Sombrío',     icon: '🌑', cost: 25, cooldown: 4  },
          { id: 'vanish',        rarity: 'rare',      label: 'Desvanecerse',     icon: '👤', cost: 40, cooldown: 7  },
          { id: 'death_mark',    rarity: 'epic',      label: 'Marca de Muerte',  icon: '💀', cost: 55, cooldown: 11 },
          { id: 'void_blade',    rarity: 'legendary', label: 'Hoja del Vacío',   icon: '🕳️', cost: 75, cooldown: 19 },
        ],
      },
      storm: {
        label: 'Tormenta',
        icon: '⛈️',
        color: '#6699ff',
        skills: [
          { id: 'thunder_slash', rarity: 'common',    label: 'Tajo Trueno',      icon: '⚡', cost: 25, cooldown: 4  },
          { id: 'lightning_arc', rarity: 'rare',      label: 'Arco Relámpago',   icon: '🌩️', cost: 40, cooldown: 7  },
          { id: 'storm_rush',    rarity: 'epic',      label: 'Embestida Tormenta', icon: '⛈️', cost: 55, cooldown: 11 },
          { id: 'thunder_god',   rarity: 'legendary', label: 'Dios del Trueno',  icon: '🌪️', cost: 75, cooldown: 19 },
        ],
      },
      honor: {
        label: 'Honor',
        icon: '⚔️',
        color: '#ffdd88',
        skills: [
          { id: 'parry',         rarity: 'common',    label: 'Parada',           icon: '🛡️', cost: 20, cooldown: 3  },
          { id: 'counter',       rarity: 'rare',      label: 'Contraataque',     icon: '⚔️', cost: 35, cooldown: 6  },
          { id: 'bushido',       rarity: 'epic',      label: 'Bushido',          icon: '🏯', cost: 50, cooldown: 10 },
          { id: 'last_stand',    rarity: 'legendary', label: 'Último Bastión',   icon: '👑', cost: 70, cooldown: 18 },
        ],
      },
    },
  },

  sword: {
    label: 'Espada',
    subtypes: {
      strength: {
        label: 'Fuerza',
        icon: '💪',
        color: '#a8c8ff',
        skills: [
          { id: 'heavy_slash',   rarity: 'common',    label: 'Tajo Pesado',      icon: '⚔️', cost: 25, cooldown: 4  },
          { id: 'shockwave',     rarity: 'rare',      label: 'Onda de Choque',   icon: '💥', cost: 40, cooldown: 7  },
          { id: 'titan_strike',  rarity: 'epic',      label: 'Golpe Titán',      icon: '🗿', cost: 55, cooldown: 11 },
          { id: 'earth_shatter', rarity: 'legendary', label: 'Rompe Tierra',     icon: '🌍', cost: 75, cooldown: 19 },
        ],
      },
      defense: {
        label: 'Defensa',
        icon: '🛡️',
        color: '#cccccc',
        skills: [
          { id: 'shield_bash',   rarity: 'common',    label: 'Golpe de Escudo',  icon: '🛡️', cost: 20, cooldown: 3  },
          { id: 'fortify',       rarity: 'rare',      label: 'Fortificar',       icon: '🏰', cost: 35, cooldown: 6  },
          { id: 'iron_wall',     rarity: 'epic',      label: 'Muro de Hierro',   icon: '⚙️', cost: 50, cooldown: 10 },
          { id: 'aegis',         rarity: 'legendary', label: 'Égida',            icon: '✨', cost: 70, cooldown: 18 },
        ],
      },
      fire: {
        label: 'Fuego',
        icon: '🔥',
        color: '#ff8844',
        skills: [
          { id: 'flame_slash',   rarity: 'common',    label: 'Tajo Llameante',   icon: '🔥', cost: 30, cooldown: 5  },
          { id: 'fire_spin',     rarity: 'rare',      label: 'Giro de Fuego',    icon: '🌀', cost: 45, cooldown: 8  },
          { id: 'molten_blade',  rarity: 'epic',      label: 'Hoja Fundida',     icon: '🌋', cost: 60, cooldown: 12 },
          { id: 'phoenix_slash', rarity: 'legendary', label: 'Tajo Fénix',       icon: '🦅', cost: 80, cooldown: 20 },
        ],
      },
      chaos: {
        label: 'Caos',
        icon: '🌀',
        color: '#cc44cc',
        skills: [
          { id: 'wild_swing',    rarity: 'common',    label: 'Golpe Salvaje',    icon: '🌀', cost: 25, cooldown: 4  },
          { id: 'chaos_wave',    rarity: 'rare',      label: 'Ola de Caos',      icon: '🌊', cost: 40, cooldown: 7  },
          { id: 'entropy',       rarity: 'epic',      label: 'Entropía',         icon: '💫', cost: 55, cooldown: 11 },
          { id: 'void_storm',    rarity: 'legendary', label: 'Tormenta del Vacío', icon: '🕳️', cost: 75, cooldown: 19 },
        ],
      },
    },
  },

  bow: {
    label: 'Arco',
    subtypes: {
      precision: {
        label: 'Precisión',
        icon: '🎯',
        color: '#6dcc8a',
        skills: [
          { id: 'aimed_shot',    rarity: 'common',    label: 'Disparo Certero',  icon: '🏹', cost: 25, cooldown: 4  },
          { id: 'piercing',      rarity: 'rare',      label: 'Flecha Perforante', icon: '🎯', cost: 40, cooldown: 7  },
          { id: 'snipe',         rarity: 'epic',      label: 'Francotirador',    icon: '👁️', cost: 55, cooldown: 11 },
          { id: 'divine_arrow',  rarity: 'legendary', label: 'Flecha Divina',    icon: '✨', cost: 75, cooldown: 19 },
        ],
      },
      poison: {
        label: 'Veneno',
        icon: '☠️',
        color: '#88cc44',
        skills: [
          { id: 'poison_arrow',  rarity: 'common',    label: 'Flecha Venenosa',  icon: '☠️', cost: 25, cooldown: 4  },
          { id: 'plague_shot',   rarity: 'rare',      label: 'Disparo Plaga',    icon: '🤢', cost: 40, cooldown: 7  },
          { id: 'toxic_cloud',   rarity: 'epic',      label: 'Nube Tóxica',      icon: '💀', cost: 55, cooldown: 11 },
          { id: 'death_plague',  rarity: 'legendary', label: 'Plaga Mortal',     icon: '🦠', cost: 75, cooldown: 19 },
        ],
      },
      wind: {
        label: 'Viento',
        icon: '💨',
        color: '#aaeeff',
        skills: [
          { id: 'wind_shot',     rarity: 'common',    label: 'Disparo de Viento', icon: '💨', cost: 25, cooldown: 4  },
          { id: 'gale_arrow',    rarity: 'rare',      label: 'Flecha Vendaval',  icon: '🌀', cost: 40, cooldown: 7  },
          { id: 'cyclone_shot',  rarity: 'epic',      label: 'Disparo Ciclón',   icon: '🌪️', cost: 55, cooldown: 11 },
          { id: 'storm_arrow',   rarity: 'legendary', label: 'Flecha Tormenta',  icon: '⛈️', cost: 75, cooldown: 19 },
        ],
      },
      shadow: {
        label: 'Sombra',
        icon: '🌑',
        color: '#8855cc',
        skills: [
          { id: 'shadow_shot',   rarity: 'common',    label: 'Disparo Sombrío',  icon: '🌑', cost: 25, cooldown: 4  },
          { id: 'blind_arrow',   rarity: 'rare',      label: 'Flecha Ciega',     icon: '👁️', cost: 40, cooldown: 7  },
          { id: 'phantom_volley',rarity: 'epic',      label: 'Andanada Fantasma', icon: '👻', cost: 55, cooldown: 11 },
          { id: 'void_arrow',    rarity: 'legendary', label: 'Flecha del Vacío', icon: '🕳️', cost: 75, cooldown: 19 },
        ],
      },
    },
  },

};

// Rareza → color de borde en UI
export const RARITY_COLORS = {
  common   : '#aaaaaa',
  rare     : '#4488ff',
  epic     : '#aa44ff',
  legendary: '#ffaa00',
};

// Subtipos desbloqueados por defecto al inicio
// El resto se desbloquea por historia o XP especial
export const DEFAULT_UNLOCKED = {
  magic : ['fire', 'ice', 'plant', 'wind'],
  katana: ['speed', 'shadow', 'storm', 'honor'],
  sword : ['strength', 'defense', 'fire', 'chaos'],
  bow   : ['precision', 'poison', 'wind', 'shadow'],
};
  
