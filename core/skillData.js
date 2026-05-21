// core/skillData.js — Ashes of the Reborn | Valiant Gaming

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
          { id: 'thorn',         rarity: 'common',    label: 'Espina',               icon: '🌿', cost: 30, cooldown: 5  },
          { id: 'vine_whip',     rarity: 'rare',      label: 'Látigo de Enredadera', icon: '🍃', cost: 45, cooldown: 8  },
          { id: 'spore_cloud',   rarity: 'epic',      label: 'Nube de Esporas',      icon: '🌸', cost: 60, cooldown: 12 },
          { id: 'world_tree',    rarity: 'legendary', label: 'Árbol del Mundo',      icon: '🌳', cost: 80, cooldown: 20 },
        ],
      },
      wind: {
        label: 'Viento',
        icon: '🌪️',
        color: '#aaeeff',
        skills: [
          { id: 'gust',          rarity: 'common',    label: 'Ráfaga',              icon: '💨', cost: 30, cooldown: 5  },
          { id: 'wind_blade',    rarity: 'rare',      label: 'Cuchilla de Viento',  icon: '🌀', cost: 45, cooldown: 8  },
          { id: 'tornado',       rarity: 'epic',      label: 'Tornado',             icon: '🌪️', cost: 60, cooldown: 12 },
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
          { id: 'quick_slash',   rarity: 'common',    label: 'Tajo Rápido',    icon: '🗡️', cost: 20, cooldown: 3  },
          { id: 'flash_step',    rarity: 'rare',      label: 'Paso Relámpago', icon: '💫', cost: 35, cooldown: 6  },
          { id: 'blade_dance',   rarity: 'epic',      label: 'Danza de Hojas', icon: '✨', cost: 50, cooldown: 10 },
          { id: 'thousand_cuts', rarity: 'legendary', label: 'Mil Cortes',     icon: '🌟', cost: 70, cooldown: 18 },
        ],
      },
      shadow: {
        label: 'Sombra',
        icon: '🌑',
        color: '#8855cc',
        skills: [
          { id: 'shadow_slash', rarity: 'common',    label: 'Tajo Sombrío',    icon: '🌑', cost: 25, cooldown: 4  },
          { id: 'nightfall',    rarity: 'rare',      label: 'Caída Nocturna',  icon: '🌒', cost: 35, cooldown: 7  },
          { id: 'void_step',    rarity: 'epic',      label: 'Paso del Vacío',  icon: '👤', cost: 45, cooldown: 12 },
          { id: 'shadow_realm', rarity: 'legendary', label: 'Reino de Sombras',icon: '🕳️', cost: 60, cooldown: 25 },
        ],
      },
      storm: {
        label: 'Tormenta',
        icon: '⛈️',
        color: '#6699ff',
        skills: [
          { id: 'thunder_slash',  rarity: 'common',    label: 'Tajo Trueno',          icon: '⚡', cost: 25, cooldown: 4  },
          { id: 'static_field',   rarity: 'rare',      label: 'Campo Estático',       icon: '🌩️', cost: 35, cooldown: 7  },
          { id: 'thunder_storm',  rarity: 'epic',      label: 'Tormenta Eléctrica',   icon: '⛈️', cost: 50, cooldown: 15 },
          { id: 'god_of_thunder', rarity: 'legendary', label: 'Dios del Trueno',      icon: '🌪️', cost: 70, cooldown: 30 },
        ],
      },
      honor: {
        label: 'Honor',
        icon: '⚔️',
        color: '#ffdd88',
        skills: [
          { id: 'last_stand',     rarity: 'common',    label: 'Último Bastión',   icon: '👑', cost: 30, cooldown: 10 },
          { id: 'martyr',         rarity: 'rare',      label: 'Mártir',           icon: '✝️', cost: 35, cooldown: 8  },
          { id: 'sacred_blade',   rarity: 'epic',      label: 'Hoja Sagrada',     icon: '🏯', cost: 50, cooldown: 16 },
          { id: 'legendary_stand',rarity: 'legendary', label: 'Bastión Legendario',icon: '🌟', cost: 70, cooldown: 35 },
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
        color: '#ffcc44',
        skills: [
          { id: 'cleave',        rarity: 'common',    label: 'Barrido',            icon: '⚔️', cost: 25, cooldown: 4  },
          { id: 'shockwave',     rarity: 'rare',      label: 'Onda de Choque',     icon: '💥', cost: 40, cooldown: 7  },
          { id: 'titan_strike',  rarity: 'epic',      label: 'Golpe Titán',        icon: '🗿', cost: 55, cooldown: 11 },
          { id: 'earth_shatter', rarity: 'legendary', label: 'Rompe Tierra',       icon: '🌍', cost: 75, cooldown: 19 },
        ],
      },
      defense: {
        label: 'Defensa',
        icon: '🛡️',
        color: '#cccccc',
        skills: [
          { id: 'shield_bash',   rarity: 'common',    label: 'Golpe de Escudo',    icon: '🛡️', cost: 20, cooldown: 3  },
          { id: 'fortify',       rarity: 'rare',      label: 'Fortificar',         icon: '🏰', cost: 35, cooldown: 6  },
          { id: 'iron_wall',     rarity: 'epic',      label: 'Muro de Hierro',     icon: '⚙️', cost: 50, cooldown: 10 },
          { id: 'aegis',         rarity: 'legendary', label: 'Égida',              icon: '✨', cost: 70, cooldown: 18 },
        ],
      },
      battle: {
        label: 'Batalla',
        icon: '🔱',
        color: '#ff6633',
        skills: [
          { id: 'war_cry',        rarity: 'common',    label: 'Grito de Guerra',    icon: '📯', cost: 35, cooldown: 12 },
          { id: 'rally',          rarity: 'rare',      label: 'Reunir Fuerzas',     icon: '🔱', cost: 45, cooldown: 14 },
          { id: 'berserker_rage', rarity: 'epic',      label: 'Furia Berserker',    icon: '😤', cost: 60, cooldown: 18 },
          { id: 'warlord',        rarity: 'legendary', label: 'Señor de la Guerra', icon: '👑', cost: 80, cooldown: 25 },
        ],
      },
      execution: {
        label: 'Ejecución',
        icon: '💀',
        color: '#cc2222',
        skills: [
          { id: 'execute',       rarity: 'common',    label: 'Ejecución',    icon: '💀', cost: 35, cooldown: 8  },
          { id: 'decapitate',    rarity: 'rare',      label: 'Decapitar',    icon: '🗡️', cost: 50, cooldown: 12 },
          { id: 'guillotine',    rarity: 'epic',      label: 'Guillotina',   icon: '⚰️', cost: 65, cooldown: 16 },
          { id: 'death_blow',    rarity: 'legendary', label: 'Golpe Mortal', icon: '☠️', cost: 85, cooldown: 22 },
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
          { id: 'piercing_shot', rarity: 'common',    label: 'Flecha Perforante', icon: '🏹', cost: 25, cooldown: 4  },
          { id: 'snipe',         rarity: 'rare',      label: 'Francotirador',     icon: '🎯', cost: 40, cooldown: 7  },
          { id: 'bullseye',      rarity: 'epic',      label: 'Diana',             icon: '👁️', cost: 55, cooldown: 11 },
          { id: 'divine_arrow',  rarity: 'legendary', label: 'Flecha Divina',     icon: '✨', cost: 75, cooldown: 19 },
        ],
      },
      poison: {
        label: 'Veneno',
        icon: '☠️',
        color: '#88cc44',
        skills: [
          { id: 'poison_arrow',  rarity: 'common',    label: 'Flecha Venenosa', icon: '☠️', cost: 25, cooldown: 4  },
          { id: 'plague_shot',   rarity: 'rare',      label: 'Disparo Plaga',   icon: '🤢', cost: 40, cooldown: 7  },
          { id: 'toxic_cloud',   rarity: 'epic',      label: 'Nube Tóxica',     icon: '💀', cost: 55, cooldown: 11 },
          { id: 'death_plague',  rarity: 'legendary', label: 'Plaga Mortal',    icon: '🦠', cost: 75, cooldown: 19 },
        ],
      },
      rain: {
        label: 'Lluvia',
        icon: '🌧️',
        color: '#4488ff',
        skills: [
          { id: 'rain_of_arrows', rarity: 'common',    label: 'Lluvia de Flechas',   icon: '🌧️', cost: 40, cooldown: 8  },
          { id: 'storm_volley',   rarity: 'rare',      label: 'Andanada Tormenta',   icon: '⛈️', cost: 55, cooldown: 12 },
          { id: 'arrow_storm',    rarity: 'epic',      label: 'Tormenta de Flechas', icon: '🌪️', cost: 70, cooldown: 16 },
          { id: 'sky_collapse',   rarity: 'legendary', label: 'Colapso del Cielo',   icon: '☄️', cost: 90, cooldown: 22 },
        ],
      },
      agility: {
        label: 'Agilidad',
        icon: '💨',
        color: '#aaeeff',
        skills: [
          { id: 'back_step',     rarity: 'common',    label: 'Paso Atrás',        icon: '💨', cost: 25, cooldown: 5  },
          { id: 'roll_shot',     rarity: 'rare',      label: 'Disparo en Rodada', icon: '🌀', cost: 40, cooldown: 8  },
          { id: 'phantom_step',  rarity: 'epic',      label: 'Paso Fantasma',     icon: '👻', cost: 55, cooldown: 12 },
          { id: 'void_dance',    rarity: 'legendary', label: 'Danza del Vacío',   icon: '🕳️', cost: 75, cooldown: 18 },
        ],
      },
    },
  },

};

export const RARITY_COLORS = {
  common   : '#aaaaaa',
  rare     : '#4488ff',
  epic     : '#aa44ff',
  legendary: '#ffaa00',
};

export const DEFAULT_UNLOCKED = {
  magic : ['fire', 'ice', 'plant', 'wind'],
  katana: ['speed', 'shadow', 'storm', 'honor'],
  sword : ['strength', 'defense', 'battle', 'execution'],
  bow   : ['precision', 'poison', 'rain', 'agility'],
};
