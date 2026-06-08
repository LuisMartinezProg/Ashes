// core/bestiary.js — Ashes of the Reborn | Valiant Gaming

import { ENEMY_DROPS } from '../data/items.js';

// ── Datos de cada enemigo ─────────────────────────────────────
export const BESTIARY_DATA = {
  // Animales
  Wolf: {
    name: 'Lobo',
    zone: 'Bosque',
    type: 'Animal',
    icon: '🐺',
    hp: 80,
    atk: 12,
    def: 4,
    weakness: ['fuego', 'luz'],
    desc: 'Lobo salvaje del bosque de Aeltherion. Ataca en manada.',
  },
  Bear: {
    name: 'Oso',
    zone: 'Bosque',
    type: 'Animal',
    icon: '🐻',
    hp: 220,
    atk: 22,
    def: 10,
    weakness: ['hielo', 'veneno'],
    desc: 'Oso territorial que protege su zona. Los lobos huyen ante él.',
  },

  // Bosque
  Mossling: {
    name: 'Mossling',
    zone: 'Bosque Profundo',
    type: 'Criatura',
    icon: '🌿',
    hp: 60,
    atk: 8,
    def: 5,
    weakness: ['fuego'],
    desc: 'Criatura vegetal nacida de la madera corrompida.',
  },
  Firefly: {
    name: 'Luciérnaga',
    zone: 'Bosque Profundo',
    type: 'Elemental',
    icon: '✨',
    hp: 45,
    atk: 14,
    def: 2,
    weakness: ['agua', 'viento'],
    desc: 'Elemental de luz que zumba en la oscuridad del bosque.',
  },
  CrystalSpider: {
    name: 'Araña de Cristal',
    zone: 'Bosque Profundo',
    type: 'Criatura',
    icon: '🕷️',
    hp: 75,
    atk: 16,
    def: 8,
    weakness: ['fuego', 'rayo'],
    desc: 'Araña con exoesqueleto cristalino. Sus hilos cortan como cuchillas.',
  },
  Troll: {
    name: 'Troll',
    zone: 'Bosque Profundo',
    type: 'Bestia',
    icon: '👹',
    hp: 180,
    atk: 28,
    def: 14,
    weakness: ['fuego', 'luz'],
    desc: 'Bestia enorme y lenta. Regenera HP si no se presiona.',
  },

  // Llanuras
  EarthGolem: {
    name: 'Gólem de Tierra',
    zone: 'Llanuras',
    type: 'Elemental',
    icon: '🪨',
    hp: 250,
    atk: 20,
    def: 22,
    weakness: ['rayo', 'agua'],
    desc: 'Constructo de roca animado por magia antigua.',
  },
  WanderingSpirit: {
    name: 'Espíritu Errante',
    zone: 'Llanuras',
    type: 'No-Muerto',
    icon: '👻',
    hp: 65,
    atk: 18,
    def: 3,
    weakness: ['luz', 'fuego'],
    desc: 'Alma perdida que vaga sin destino. Inmune a veneno.',
  },

  // Camino
  ShadowForest: {
    name: 'Sombra del Bosque',
    zone: 'Camino',
    type: 'Sombra',
    icon: '🌑',
    hp: 70,
    atk: 15,
    def: 6,
    weakness: ['luz'],
    desc: 'Sombra que toma forma entre los árboles del camino.',
  },
  StoneSnake: {
    name: 'Serpiente de Piedra',
    zone: 'Camino',
    type: 'Bestia',
    icon: '🐍',
    hp: 90,
    atk: 17,
    def: 12,
    weakness: ['rayo', 'fuego'],
    desc: 'Serpiente con escamas de roca. Su mordida inmoviliza.',
  },
  WarriorGhost: {
    name: 'Guerrero Fantasma',
    zone: 'Camino',
    type: 'No-Muerto',
    icon: '⚔️',
    hp: 120,
    atk: 24,
    def: 10,
    weakness: ['luz', 'magia'],
    desc: 'Espíritu de un guerrero caído que aún busca batalla.',
  },
  EliteMercenary: {
    name: 'Mercenario Élite',
    zone: 'Camino',
    type: 'Humano',
    icon: '🗡️',
    hp: 150,
    atk: 26,
    def: 16,
    weakness: ['veneno', 'magia'],
    desc: 'Soldado entrenado al servicio del mejor postor.',
  },
  Bandit: {
    name: 'Bandido',
    zone: 'Camino',
    type: 'Humano',
    icon: '🪃',
    hp: 70,
    atk: 13,
    def: 5,
    weakness: ['fuego', 'rayo'],
    desc: 'Ladrón que bloqueó el paso de Mika. Cobarde en solitario.',
  },

  // Ejército Yami
  ShadowSoldier: {
    name: 'Soldado Sombra',
    zone: 'Territorio Yami',
    type: 'Yami',
    icon: '🖤',
    hp: 100,
    atk: 18,
    def: 12,
    weakness: ['luz', 'fuego'],
    desc: 'Soldado del ejército Yami. Disciplinado y letal.',
  },
  DarkArcher: {
    name: 'Arquero Oscuro',
    zone: 'Territorio Yami',
    type: 'Yami',
    icon: '🏹',
    hp: 80,
    atk: 22,
    def: 7,
    weakness: ['luz', 'viento'],
    desc: 'Arquero Yami de larga distancia. Apunta a los puntos débiles.',
  },
  Berserker: {
    name: 'Berserker',
    zone: 'Territorio Yami',
    type: 'Yami',
    icon: '💢',
    hp: 160,
    atk: 32,
    def: 8,
    weakness: ['hielo', 'magia'],
    desc: 'Guerrero Yami que entra en furia al bajar su HP.',
  },
  YamiMage: {
    name: 'Mago Yami',
    zone: 'Territorio Yami',
    type: 'Yami',
    icon: '🔮',
    hp: 110,
    atk: 28,
    def: 6,
    weakness: ['rayo', 'viento'],
    desc: 'Hechicero del ejército Yami. Lanza maldiciones de oscuridad.',
  },
  ShadowCaptain: {
    name: 'Capitán Sombra',
    zone: 'Territorio Yami',
    type: 'Yami',
    icon: '👁️',
    hp: 300,
    atk: 38,
    def: 20,
    weakness: ['luz', 'fuego'],
    desc: 'Comandante de las tropas Yami. Lidera con brutalidad.',
  },

  // Mazmorras
  DungeonGuard: {
    name: 'Guardia de Mazmorra',
    zone: 'Mazmorras',
    type: 'No-Muerto',
    icon: '🛡️',
    hp: 130,
    atk: 20,
    def: 18,
    weakness: ['luz', 'fuego'],
    desc: 'Guardián eterno de las mazmorras de Aeltherion.',
  },
  RuneWarden: {
    name: 'Guardián Rúnico',
    zone: 'Mazmorras',
    type: 'Elemental',
    icon: '🔵',
    hp: 170,
    atk: 25,
    def: 15,
    weakness: ['oscuridad', 'rayo'],
    desc: 'Guardián sellado con runas ancestrales. Contraataca al ser dañado.',
  },
  AncientSentinel: {
    name: 'Centinela Antiguo',
    zone: 'Mazmorras',
    type: 'Constructo',
    icon: '⚙️',
    hp: 200,
    atk: 30,
    def: 25,
    weakness: ['rayo', 'magia'],
    desc: 'Máquina de guerra forjada en otra era. Nunca descansa.',
  },

  // Jefes
  Malachar: {
    name: 'Malachar',
    zone: 'Mazmorra — Jefe',
    type: 'Jefe',
    icon: '💀',
    hp: 800,
    atk: 55,
    def: 30,
    weakness: ['luz', 'fuego'],
    desc: 'Señor de las sombras encadenado en lo profundo. Primera prueba de Kael.',
  },
  Veyris: {
    name: 'Veyris',
    zone: 'Mazmorra — Jefe',
    type: 'Jefe',
    icon: '🌀',
    hp: 900,
    atk: 60,
    def: 28,
    weakness: ['rayo', 'hielo'],
    desc: 'Arcanista corrompido por el poder del vacío.',
  },
  Khazeron: {
    name: 'Khazeron',
    zone: 'Mazmorra — Jefe Final',
    type: 'Jefe Final',
    icon: '👑',
    hp: 1500,
    atk: 80,
    def: 40,
    weakness: ['luz'],
    desc: 'El origen de la oscuridad. Creador del ejército Yami.',
  },
};

// ── Lógica del Bestiario ──────────────────────────────────────
const SAVE_KEY = 'ashes_bestiary';

function _load() {
  try {
    return JSON.parse(localStorage.getItem(SAVE_KEY) || '{}');
  } catch {
    return {};
  }
}

function _save(data) {
  localStorage.setItem(SAVE_KEY, JSON.stringify(data));
}

// Registra un kill. Devuelve true si es el PRIMER kill (nuevo descubrimiento)
export function onKill(enemyType) {
  const data = _load();
  const isNew = !data[enemyType];
  data[enemyType] = (data[enemyType] || 0) + 1;
  _save(data);
  return isNew;
}

// Devuelve kills totales de un enemigo (0 si nunca fue matado)
export function getKills(enemyType) {
  const data = _load();
  return data[enemyType] || 0;
}

// Devuelve true si el enemigo ya fue descubierto
export function isDiscovered(enemyType) {
  return getKills(enemyType) > 0;
}

// Devuelve todos los datos + kills para mostrar en pantalla
export function getBestiaryList() {
  const data = _load();
  return Object.entries(BESTIARY_DATA).map(([id, info]) => ({
    id,
    ...info,
    kills: data[id] || 0,
    discovered: !!data[id],
    drops: ENEMY_DROPS[id] || ENEMY_DROPS.default,
  }));
}

// Resetea el bestiario (para debug)
export function resetBestiary() {
  localStorage.removeItem(SAVE_KEY);
}
