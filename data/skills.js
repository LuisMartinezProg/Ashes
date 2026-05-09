/**
 * data/skills.js — 50 habilidades mágicas completas
 * Aplican a todas las armas
 */

export const SKILL_TYPES = {
  BASIC       : 'basica',
  INTERMEDIATE: 'intermedia',
  ELITE       : 'elite',
};

export const SKILL_CATEGORIES = {
  OFFENSIVE : 'ofensiva',
  DEFENSIVE : 'defensiva',
  MOBILITY  : 'movilidad',
  SUPPORT   : 'soporte',
  STRATEGIC : 'estrategica',
};

export const SKILLS = {

  // ─────────────────────────────────────────────
  // OFENSIVAS
  // ─────────────────────────────────────────────
  bola_fuego: {
    id: 'bola_fuego', name: 'Bola de fuego',
    category: 'ofensiva', type: 'basica', level: 1,
    desc: 'Proyectil de fuego directo al enemigo.',
    limit: 'Ninguna', icon: '🔥',
    unlockLevel: 1, cost: 0,
  },
  chispa_cadena: {
    id: 'chispa_cadena', name: 'Chispa en cadena',
    category: 'ofensiva', type: 'basica', level: 2,
    desc: 'Rayo que salta entre enemigos cercanos.',
    limit: 'Necesita 2 enemigos cerca', icon: '⚡',
    unlockLevel: 3, cost: 1,
    requires: 'bola_fuego',
  },
  lanza_hielo: {
    id: 'lanza_hielo', name: 'Lanza de hielo',
    category: 'ofensiva', type: 'basica', level: 2,
    desc: 'Proyectil que congela al impactar.',
    limit: 'Congela solo 2 segundos', icon: '🧊',
    unlockLevel: 3, cost: 1,
    requires: 'bola_fuego',
  },
  meteoro: {
    id: 'meteoro', name: 'Meteoro pequeño',
    category: 'ofensiva', type: 'intermedia', level: 3,
    desc: 'Invoca un meteoro que cae en zona objetivo.',
    limit: '4 segundos antes de caer', icon: '☄️',
    unlockLevel: 5, cost: 2,
    requires: ['chispa_cadena', 'lanza_hielo'],
  },
  onda_sismica: {
    id: 'onda_sismica', name: 'Onda sísmica mágica',
    category: 'ofensiva', type: 'intermedia', level: 3,
    desc: 'Onda de tierra que empuja enemigos.',
    limit: 'No funciona en el aire', icon: '🌊',
    unlockLevel: 5, cost: 2,
    requires: ['chispa_cadena', 'lanza_hielo'],
  },
  lanza_plasma: {
    id: 'lanza_plasma', name: 'Lanza de plasma',
    category: 'ofensiva', type: 'intermedia', level: 4,
    desc: 'Proyectil de plasma de alto daño.',
    limit: 'Recarga de 10 segundos', icon: '💫',
    unlockLevel: 7, cost: 3,
    requires: ['meteoro', 'onda_sismica'],
  },
  vortex_fuego: {
    id: 'vortex_fuego', name: 'Vortex de fuego',
    category: 'ofensiva', type: 'intermedia', level: 4,
    desc: 'Torbellino de fuego que desorienta.',
    limit: 'Solo desorienta, no mata directo', icon: '🌪️',
    unlockLevel: 7, cost: 3,
    requires: ['meteoro', 'onda_sismica'],
  },
  nova: {
    id: 'nova', name: 'Nova devastadora',
    category: 'ofensiva', type: 'elite', level: 5,
    desc: 'Explosión masiva de energía en área.',
    limit: 'Sin energía 30 segundos', icon: '💥',
    unlockLevel: 10, cost: 5,
    requires: ['lanza_plasma', 'vortex_fuego'],
  },
  colapso_dimensional: {
    id: 'colapso_dimensional', name: 'Colapso dimensional',
    category: 'ofensiva', type: 'elite', level: 5,
    desc: 'Desgarra el espacio en zona objetivo.',
    limit: 'Una vez por batalla', icon: '🌌',
    unlockLevel: 10, cost: 5,
    requires: ['lanza_plasma', 'vortex_fuego'],
  },
  fragmentacion: {
    id: 'fragmentacion', name: 'Fragmentación cósmica',
    category: 'ofensiva', type: 'elite', level: 5,
    desc: 'Fragmentos de energía en todas direcciones.',
    limit: 'Daña aliados cercanos', icon: '✨',
    unlockLevel: 12, cost: 5,
    requires: ['nova', 'colapso_dimensional'],
  },

  // ─────────────────────────────────────────────
  // DEFENSIVAS
  // ─────────────────────────────────────────────
  piel_piedra: {
    id: 'piel_piedra', name: 'Piel de piedra',
    category: 'defensiva', type: 'basica', level: 1,
    desc: 'Endurece la piel, reduce daño recibido.',
    limit: 'Ralentiza el movimiento', icon: '🪨',
    unlockLevel: 1, cost: 0,
  },
  aura_protectora: {
    id: 'aura_protectora', name: 'Aura protectora',
    category: 'defensiva', type: 'basica', level: 2,
    desc: 'Aura que reduce daño constante.',
    limit: 'Reducción pequeña y constante', icon: '🛡️',
    unlockLevel: 3, cost: 1,
    requires: 'piel_piedra',
  },
  armadura_viento: {
    id: 'armadura_viento', name: 'Armadura de viento',
    category: 'defensiva', type: 'basica', level: 2,
    desc: 'Desvía proyectiles débiles automáticamente.',
    limit: 'Solo desvía proyectiles débiles', icon: '💨',
    unlockLevel: 3, cost: 1,
    requires: 'piel_piedra',
  },
  muro_fuerza: {
    id: 'muro_fuerza', name: 'Muro de fuerza',
    category: 'defensiva', type: 'intermedia', level: 3,
    desc: 'Barrera sólida que bloquea todo.',
    limit: 'Tú tampoco puedes atravesarla', icon: '🧱',
    unlockLevel: 5, cost: 2,
    requires: ['aura_protectora', 'armadura_viento'],
  },
  barrera_grupo: {
    id: 'barrera_grupo', name: 'Barrera de grupo',
    category: 'defensiva', type: 'intermedia', level: 3,
    desc: 'Escudo que protege a aliados cercanos.',
    limit: 'Se rompe con suficiente daño', icon: '🔵',
    unlockLevel: 5, cost: 2,
    requires: ['aura_protectora', 'armadura_viento'],
  },
  escudo_espejos: {
    id: 'escudo_espejos', name: 'Escudo de espejos',
    category: 'defensiva', type: 'intermedia', level: 4,
    desc: 'Refleja daño mágico al atacante.',
    limit: 'No funciona contra daño físico', icon: '🪞',
    unlockLevel: 7, cost: 3,
    requires: ['muro_fuerza', 'barrera_grupo'],
  },
  campo_espinas: {
    id: 'campo_espinas', name: 'Campo de espinas',
    category: 'defensiva', type: 'intermedia', level: 4,
    desc: 'Zona de espinas que daña al acercarse.',
    limit: 'Solo daña al acercarse', icon: '🌵',
    unlockLevel: 7, cost: 3,
    requires: ['muro_fuerza', 'barrera_grupo'],
  },
  fortaleza: {
    id: 'fortaleza', name: 'Fortaleza indestructible',
    category: 'defensiva', type: 'elite', level: 5,
    desc: 'Inmunidad total pero sin moverse.',
    limit: 'No puedes moverte ni atacar', icon: '🏰',
    unlockLevel: 10, cost: 5,
    requires: ['escudo_espejos', 'campo_espinas'],
  },
  inversion_dano: {
    id: 'inversion_dano', name: 'Inversión de daño',
    category: 'defensiva', type: 'elite', level: 5,
    desc: 'Convierte daño recibido en curación.',
    limit: 'Recarga de 60 segundos', icon: '♻️',
    unlockLevel: 10, cost: 5,
    requires: ['escudo_espejos', 'campo_espinas'],
  },
  resurreccion_arcana: {
    id: 'resurreccion_arcana', name: 'Resurrección arcana',
    category: 'defensiva', type: 'elite', level: 5,
    desc: 'Revive automáticamente con 30% HP.',
    limit: 'Una vez por batalla', icon: '💫',
    unlockLevel: 12, cost: 5,
    requires: ['fortaleza', 'inversion_dano'],
  },

  // ─────────────────────────────────────────────
  // MOVILIDAD
  // ─────────────────────────────────────────────
  carrera_magica: {
    id: 'carrera_magica', name: 'Carrera mágica',
    category: 'movilidad', type: 'basica', level: 1,
    desc: 'Aumenta velocidad de movimiento.',
    limit: 'Dura 5 segundos', icon: '💨',
    unlockLevel: 1, cost: 0,
  },
  salto_potenciado: {
    id: 'salto_potenciado', name: 'Salto potenciado',
    category: 'movilidad', type: 'basica', level: 2,
    desc: 'Salto de gran altura.',
    limit: 'Sin recarga', icon: '⬆️',
    unlockLevel: 3, cost: 1,
    requires: 'carrera_magica',
  },
  impulso_viento: {
    id: 'impulso_viento', name: 'Impulso de viento',
    category: 'movilidad', type: 'basica', level: 2,
    desc: 'Dash rápido en dirección que miras.',
    limit: 'Solo en dirección que miras', icon: '🌬️',
    unlockLevel: 3, cost: 1,
    requires: 'carrera_magica',
  },
  vuelo_magico: {
    id: 'vuelo_magico', name: 'Vuelo mágico',
    category: 'movilidad', type: 'intermedia', level: 3,
    desc: 'Levitación libre consumiendo energía.',
    limit: 'Consume energía constantemente', icon: '🦅',
    unlockLevel: 5, cost: 2,
    requires: ['salto_potenciado', 'impulso_viento'],
  },
  dash_aereo: {
    id: 'dash_aereo', name: 'Dash aéreo',
    category: 'movilidad', type: 'intermedia', level: 3,
    desc: 'Movimiento horizontal rápido en el aire.',
    limit: 'Solo horizontal en el aire', icon: '➡️',
    unlockLevel: 5, cost: 2,
    requires: ['salto_potenciado', 'impulso_viento'],
  },
  paso_sombra: {
    id: 'paso_sombra', name: 'Paso de sombra',
    category: 'movilidad', type: 'intermedia', level: 4,
    desc: 'Movimiento intangible breve.',
    limit: 'Intangible solo 2 segundos', icon: '👤',
    unlockLevel: 7, cost: 3,
    requires: ['vuelo_magico', 'dash_aereo'],
  },
  ola_impulso: {
    id: 'ola_impulso', name: 'Ola de impulso',
    category: 'movilidad', type: 'intermedia', level: 4,
    desc: 'Impulso de energía que empuja al jugador.',
    limit: 'Dura 6 segundos', icon: '🌊',
    unlockLevel: 7, cost: 3,
    requires: ['vuelo_magico', 'dash_aereo'],
  },
  teletransporte: {
    id: 'teletransporte', name: 'Teletransporte de combate',
    category: 'movilidad', type: 'elite', level: 5,
    desc: 'Aparece instantáneamente en punto objetivo.',
    limit: 'Recarga de 20 segundos', icon: '🔮',
    unlockLevel: 10, cost: 5,
    requires: ['paso_sombra', 'ola_impulso'],
  },
  colapso_espacial: {
    id: 'colapso_espacial', name: 'Colapso espacial',
    category: 'movilidad', type: 'elite', level: 5,
    desc: 'Teletransporta a un aliado visible.',
    limit: 'Solo a aliados visibles', icon: '🌀',
    unlockLevel: 10, cost: 5,
    requires: ['paso_sombra', 'ola_impulso'],
  },
  parpadeo_infinito: {
    id: 'parpadeo_infinito', name: 'Parpadeo infinito',
    category: 'movilidad', type: 'elite', level: 5,
    desc: 'Serie de teletransportes rápidos.',
    limit: 'Agota toda la energía', icon: '⚡',
    unlockLevel: 12, cost: 5,
    requires: ['teletransporte', 'colapso_espacial'],
  },

  // ─────────────────────────────────────────────
  // SOPORTE
  // ─────────────────────────────────────────────
  curacion_leve: {
    id: 'curacion_leve', name: 'Curación leve',
    category: 'soporte', type: 'basica', level: 1,
    desc: 'Recupera una pequeña cantidad de HP.',
    limit: 'Cantidad pequeña', icon: '💚',
    unlockLevel: 1, cost: 0,
  },
  aura_regeneracion: {
    id: 'aura_regeneracion', name: 'Aura de regeneración',
    category: 'soporte', type: 'basica', level: 2,
    desc: 'Regeneración lenta continua de HP.',
    limit: 'Lenta y continua', icon: '🌿',
    unlockLevel: 3, cost: 1,
    requires: 'curacion_leve',
  },
  vendaje_magico: {
    id: 'vendaje_magico', name: 'Vendaje mágico',
    category: 'soporte', type: 'basica', level: 2,
    desc: 'Cura instantánea a un aliado cercano.',
    limit: 'Solo un aliado cercano', icon: '🩹',
    unlockLevel: 3, cost: 1,
    requires: 'curacion_leve',
  },
  grito_guerra: {
    id: 'grito_guerra', name: 'Grito de guerra',
    category: 'soporte', type: 'intermedia', level: 3,
    desc: 'Aumenta daño de aliados cercanos.',
    limit: 'Dura 8 segundos', icon: '📣',
    unlockLevel: 5, cost: 2,
    requires: ['aura_regeneracion', 'vendaje_magico'],
  },
  vision_tactica: {
    id: 'vision_tactica', name: 'Visión táctica',
    category: 'soporte', type: 'intermedia', level: 3,
    desc: 'Revela enemigos en área definida.',
    limit: 'Solo en área definida', icon: '👁️',
    unlockLevel: 5, cost: 2,
    requires: ['aura_regeneracion', 'vendaje_magico'],
  },
  comando_velocidad: {
    id: 'comando_velocidad', name: 'Comando de velocidad',
    category: 'soporte', type: 'intermedia', level: 4,
    desc: 'Aumenta velocidad de aliados.',
    limit: 'Dura 12 segundos', icon: '⚡',
    unlockLevel: 7, cost: 3,
    requires: ['grito_guerra', 'vision_tactica'],
  },
  escudo_tropas: {
    id: 'escudo_tropas', name: 'Escudo de tropas',
    category: 'soporte', type: 'intermedia', level: 4,
    desc: 'Escudo colectivo para aliados cercanos.',
    limit: 'Dura 10 segundos', icon: '🛡️',
    unlockLevel: 7, cost: 3,
    requires: ['grito_guerra', 'vision_tactica'],
  },
  resurreccion_aliado: {
    id: 'resurreccion_aliado', name: 'Resurrección de aliado',
    category: 'soporte', type: 'elite', level: 5,
    desc: 'Revive a un aliado caído.',
    limit: 'Recarga de 90 segundos', icon: '💛',
    unlockLevel: 10, cost: 5,
    requires: ['comando_velocidad', 'escudo_tropas'],
  },
  sacrificio_heroico: {
    id: 'sacrificio_heroico', name: 'Sacrificio heroico',
    category: 'soporte', type: 'elite', level: 5,
    desc: 'Sacrifica 50% de tu vida para curar aliados.',
    limit: 'Pierdes 50% de tu vida', icon: '❤️',
    unlockLevel: 10, cost: 5,
    requires: ['comando_velocidad', 'escudo_tropas'],
  },
  campo_curacion: {
    id: 'campo_curacion', name: 'Campo de curación masiva',
    category: 'soporte', type: 'elite', level: 5,
    desc: 'Zona que cura masivamente a todos los aliados.',
    limit: 'Una vez por batalla', icon: '💊',
    unlockLevel: 12, cost: 5,
    requires: ['resurreccion_aliado', 'sacrificio_heroico'],
  },

  // ─────────────────────────────────────────────
  // ESTRATÉGICAS — bloqueadas hasta evento historia
  // ─────────────────────────────────────────────
  sombra_combate: {
    id: 'sombra_combate', name: 'Sombra de combate',
    category: 'estrategica', type: 'basica', level: 1,
    desc: 'Crea una copia fantasmal que combate.',
    limit: 'Copia fantasmal temporal', icon: '👥',
    unlockLevel: 15, cost: 0,
    categoryLocked: true,
  },
  invocacion_menor: {
    id: 'invocacion_menor', name: 'Invocación menor',
    category: 'estrategica', type: 'basica', level: 2,
    desc: 'Invoca un espíritu débil de combate.',
    limit: 'Espíritu débil', icon: '👻',
    unlockLevel: 15, cost: 1,
    categoryLocked: true,
    requires: 'sombra_combate',
  },
  niebla_guerra: {
    id: 'niebla_guerra', name: 'Niebla de guerra',
    category: 'estrategica', type: 'basica', level: 2,
    desc: 'Niebla que oculta al jugador y aliados.',
    limit: 'Dura 10 segundos', icon: '🌫️',
    unlockLevel: 15, cost: 1,
    categoryLocked: true,
    requires: 'sombra_combate',
  },
  control_clima: {
    id: 'control_clima', name: 'Control del clima',
    category: 'estrategica', type: 'intermedia', level: 3,
    desc: 'Lluvia que ralentiza enemigos en área.',
    limit: 'Área grande', icon: '🌧️',
    unlockLevel: 18, cost: 2,
    categoryLocked: true,
    requires: ['invocacion_menor', 'niebla_guerra'],
  },
  interferencia_magica: {
    id: 'interferencia_magica', name: 'Interferencia mágica',
    category: 'estrategica', type: 'intermedia', level: 3,
    desc: 'Bloquea habilidades enemigas.',
    limit: 'Bloquea 8 segundos', icon: '📡',
    unlockLevel: 18, cost: 2,
    categoryLocked: true,
    requires: ['invocacion_menor', 'niebla_guerra'],
  },
  invocacion_elite: {
    id: 'invocacion_elite', name: 'Invocación de élite',
    category: 'estrategica', type: 'intermedia', level: 4,
    desc: 'Espíritu poderoso que combate 20 segundos.',
    limit: 'Espíritu poderoso 20 segundos', icon: '⚔️',
    unlockLevel: 20, cost: 3,
    categoryLocked: true,
    requires: ['control_clima', 'interferencia_magica'],
  },
  trampa_espectral: {
    id: 'trampa_espectral', name: 'Trampa espectral',
    category: 'estrategica', type: 'intermedia', level: 4,
    desc: 'Zona invisible que explota al pisarla.',
    limit: 'Invisible hasta activarse', icon: '💣',
    unlockLevel: 20, cost: 3,
    categoryLocked: true,
    requires: ['control_clima', 'interferencia_magica'],
  },
  invocacion_dragon: {
    id: 'invocacion_dragon', name: 'Invocación de dragón',
    category: 'estrategica', type: 'elite', level: 5,
    desc: 'Dragón espectral que ataca enemigos.',
    limit: 'Recarga de 120 segundos', icon: '🐉',
    unlockLevel: 25, cost: 5,
    categoryLocked: true,
    requires: ['invocacion_elite', 'trampa_espectral'],
  },
  espiritu_caos: {
    id: 'espiritu_caos', name: 'Espíritu del caos',
    category: 'estrategica', type: 'elite', level: 5,
    desc: 'Ataca a todos sin distinción.',
    limit: 'Ataca aliados y enemigos', icon: '🌀',
    unlockLevel: 25, cost: 5,
    categoryLocked: true,
    requires: ['invocacion_elite', 'trampa_espectral'],
  },
  juicio_final: {
    id: 'juicio_final', name: 'Juicio final',
    category: 'estrategica', type: 'elite', level: 5,
    desc: 'Devastación masiva en área enorme.',
    limit: 'Una vez por guerra', icon: '☄️',
    unlockLevel: 30, cost: 5,
    categoryLocked: true,
    requires: ['invocacion_dragon', 'espiritu_caos'],
  },
};

// ─────────────────────────────────────────────
// REGLAS DE COMBINACIÓN
// ─────────────────────────────────────────────
export function canCombine(skill1, skill2) {
  if (!skill1 || !skill2) return true;
  const s1 = SKILLS[skill1];
  const s2 = SKILLS[skill2];
  if (!s1 || !s2) return true;
  // Siempre debe haber al menos una básica
  const hasBacica = s1.type === 'basica' || s2.type === 'basica';
  // No puede haber dos no-básicas
  const bothAdvanced = s1.type !== 'basica' && s2.type !== 'basica';
  return hasBacica && !bothAdvanced;
}

// Obtener habilidades disponibles por categoría y nivel del jugador
export function getAvailableSkills(category, playerLevel, unlockedSkills = []) {
  return Object.values(SKILLS).filter(s => {
    if (s.category !== category) return false;
    if (s.categoryLocked) return false;
    if (s.unlockLevel > playerLevel) return false;
    if (s.requires) {
      const reqs = Array.isArray(s.requires) ? s.requires : [s.requires];
      if (!reqs.some(r => unlockedSkills.includes(r))) return false;
    }
    return true;
  });
}
