// data/items.js — Ashes of the Reborn | Valiant Gaming

export const ITEMS = {

  // ── MATERIALES ────────────────────────────────────────────────
  madera: {
    id: 'madera', name: 'Madera', icon: '🪵',
    section: 'materiales', rarity: 'comun',
    desc: 'Madera del bosque de Aeltherion.',
  },
  piedra: {
    id: 'piedra', name: 'Piedra', icon: '🪨',
    section: 'materiales', rarity: 'comun',
    desc: 'Roca sólida del terreno.',
  },
  hierro: {
    id: 'hierro', name: 'Hierro', icon: '⚙️',
    section: 'materiales', rarity: 'comun',
    desc: 'Metal forjable de las ruinas.',
  },
  mineral: {
    id: 'mineral', name: 'Mineral', icon: '💎',
    section: 'materiales', rarity: 'raro',
    desc: 'Cristal energético de las mazmorras.',
  },
  etherFragmento: {
    id: 'etherFragmento', name: 'Fragmento Éter', icon: '✦',
    section: 'materiales', rarity: 'epico',
    desc: 'Energía pura de otro plano.',
  },
  nucleoArcano: {
    id: 'nucleoArcano', name: 'Núcleo Arcano', icon: '🔮',
    section: 'materiales', rarity: 'legendario',
    desc: 'Cristal de poder condensado. Permite ascender de nivel.',
  },

  // ── CONSUMIBLES ───────────────────────────────────────────────
  pocionVida: {
    id: 'pocionVida', name: 'Poción de Vida', icon: '🧪',
    section: 'consumibles', rarity: 'comun',
    desc: 'Restaura 50 HP al usarse.',
    effect: { type: 'heal', value: 50 },
  },
  pocionVidaGrande: {
    id: 'pocionVidaGrande', name: 'Poción Mayor', icon: '🍶',
    section: 'consumibles', rarity: 'raro',
    desc: 'Restaura 150 HP al usarse.',
    effect: { type: 'heal', value: 150 },
  },
  pocionMana: {
    id: 'pocionMana', name: 'Poción de Maná', icon: '💙',
    section: 'consumibles', rarity: 'comun',
    desc: 'Restaura 30 de energía mágica.',
    effect: { type: 'mana', value: 30 },
  },
  elixirFuerza: {
    id: 'elixirFuerza', name: 'Elixir de Fuerza', icon: '⚡',
    section: 'consumibles', rarity: 'raro',
    desc: 'Aumenta ATK 20% por 60s.',
    effect: { type: 'buff', stat: 'atk', value: 0.2, duration: 60 },
  },
  elixirGuardia: {
    id: 'elixirGuardia', name: 'Elixir de Guardia', icon: '🛡️',
    section: 'consumibles', rarity: 'raro',
    desc: 'Reduce daño recibido 20% por 60s.',
    effect: { type: 'buff', stat: 'def', value: 0.2, duration: 60 },
  },

  // ── EQUIPOS — ARMAS ───────────────────────────────────────────
  espadaHierro: {
    id: 'espadaHierro', name: 'Espada de Hierro', icon: '⚔️',
    section: 'equipos', rarity: 'comun',
    desc: 'Espada forjada con hierro de las ruinas.',
    slot: 'arma', weaponType: 'sword',
    stats: { ATK: 12, VEL: 2 },
  },
  espadaRunica: {
    id: 'espadaRunica', name: 'Espada Rúnica', icon: '🗡️',
    section: 'equipos', rarity: 'raro',
    desc: 'Grabada con runas antiguas.',
    slot: 'arma', weaponType: 'sword',
    stats: { ATK: 22, VEL: 3, MAGIA: 5 },
  },
  katanaOscura: {
    id: 'katanaOscura', name: 'Katana Oscura', icon: '🔪',
    section: 'equipos', rarity: 'epico',
    desc: 'Forjada en las sombras de Khazeron.',
    slot: 'arma', weaponType: 'katana',
    stats: { ATK: 35, VEL: 8, CRIT: 10 },
  },
  arcoElfico: {
    id: 'arcoElfico', name: 'Arco Élfico', icon: '🏹',
    section: 'equipos', rarity: 'raro',
    desc: 'Ligero y preciso.',
    slot: 'arma', weaponType: 'bow',
    stats: { ATK: 18, VEL: 6, RANGO: 5 },
  },
  bastónCristal: {
    id: 'bastónCristal', name: 'Bastón de Cristal', icon: '🔮',
    section: 'equipos', rarity: 'epico',
    desc: 'Amplifica la magia elemental.',
    slot: 'arma', weaponType: 'magic',
    stats: { MAGIA: 40, ATK: 10, MANA: 20 },
  },

  // ── EQUIPOS — ARMADURAS ───────────────────────────────────────
  armaduraHierro: {
    id: 'armaduraHierro', name: 'Armadura de Hierro', icon: '🥋',
    section: 'equipos', rarity: 'comun',
    desc: 'Protección básica forjada en hierro.',
    slot: 'armadura',
    stats: { DEF: 15, HP: 20 },
  },
  armaduraRunica: {
    id: 'armaduraRunica', name: 'Armadura Rúnica', icon: '🛡️',
    section: 'equipos', rarity: 'raro',
    desc: 'Reforzada con inscripciones mágicas.',
    slot: 'armadura',
    stats: { DEF: 28, HP: 40, MAGIA: 8 },
  },
  mantoDeSombra: {
    id: 'mantoDeSombra', name: 'Manto de Sombra', icon: '🌑',
    section: 'equipos', rarity: 'epico',
    desc: 'Reduce la detección enemiga.',
    slot: 'armadura',
    stats: { DEF: 20, VEL: 5, SIGILO: 10 },
  },

  // ── EQUIPOS — ACCESORIOS ──────────────────────────────────────
  anilloFuerza: {
    id: 'anilloFuerza', name: 'Anillo de Fuerza', icon: '💍',
    section: 'equipos', rarity: 'raro',
    desc: 'Incrementa el poder de ataque.',
    slot: 'accesorio',
    stats: { ATK: 10, CRIT: 5 },
  },
  amuletoCristal: {
    id: 'amuletoCristal', name: 'Amuleto de Cristal', icon: '📿',
    section: 'equipos', rarity: 'epico',
    desc: 'Amplifica la energía mágica.',
    slot: 'accesorio',
    stats: { MAGIA: 15, MANA: 25 },
  },
};

export const ENEMY_DROPS = {
  // ── Mazmorras ─────────────────────────────────────────────────
  DungeonGuard: [
    { item: 'hierro',       qty: [1,3], chance: 0.7  },
    { item: 'pocionVida',   qty: [1,1], chance: 0.3  },
    { item: 'espadaHierro', qty: [1,1], chance: 0.05 },
  ],
  RuneWarden: [
    { item: 'mineral',      qty: [1,2], chance: 0.6  },
    { item: 'pocionMana',   qty: [1,1], chance: 0.4  },
    { item: 'espadaRunica', qty: [1,1], chance: 0.04 },
  ],
  AncientSentinel: [
    { item: 'mineral',        qty: [2,4], chance: 0.7  },
    { item: 'elixirFuerza',   qty: [1,1], chance: 0.25 },
    { item: 'armaduraRunica', qty: [1,1], chance: 0.04 },
  ],
  Malachar: [
    { item: 'etherFragmento',   qty: [3,5], chance: 1.0  },
    { item: 'katanaOscura',     qty: [1,1], chance: 0.15 },
    { item: 'pocionVidaGrande', qty: [2,3], chance: 1.0  },
    { item: 'nucleoArcano', qty: [1,2], chance: 0.6 },
  ],
  Veyris: [
    { item: 'etherFragmento', qty: [3,5], chance: 1.0  },
    { item: 'bastónCristal',  qty: [1,1], chance: 0.15 },
    { item: 'amuletoCristal', qty: [1,1], chance: 0.2  },
    { item: 'nucleoArcano', qty: [1,2], chance: 0.6 },
  ],
  Khazeron: [
    { item: 'etherFragmento', qty: [5,8], chance: 1.0  },
    { item: 'mantoDeSombra',  qty: [1,1], chance: 0.2  },
    { item: 'katanaOscura',   qty: [1,1], chance: 0.25 },
    { item: 'nucleoArcano', qty: [1,2], chance: 0.6 },
  ],

  // ── Animales ──────────────────────────────────────────────────
  Wolf: [
    { item: 'madera',     qty: [1,2], chance: 0.5 },
    { item: 'pocionVida', qty: [1,1], chance: 0.2 },
  ],
  Bear: [
    { item: 'madera',           qty: [2,4], chance: 0.8  },
    { item: 'piedra',           qty: [1,3], chance: 0.6  },
    { item: 'pocionVidaGrande', qty: [1,1], chance: 0.15 },
  ],

  // ── Bosque ────────────────────────────────────────────────────
  Mossling: [
    { item: 'madera',     qty: [1,2], chance: 0.8  },
    { item: 'piedra',     qty: [1,1], chance: 0.3  },
    { item: 'pocionVida', qty: [1,1], chance: 0.15 },
  ],
  Firefly: [
    { item: 'mineral',    qty: [1,1], chance: 0.4  },
    { item: 'pocionMana', qty: [1,1], chance: 0.25 },
  ],
  CrystalSpider: [
    { item: 'mineral',    qty: [1,2], chance: 0.6 },
    { item: 'piedra',     qty: [1,2], chance: 0.5 },
    { item: 'pocionVida', qty: [1,1], chance: 0.2 },
  ],
  Troll: [
    { item: 'madera',           qty: [2,4], chance: 0.9 },
    { item: 'piedra',           qty: [2,3], chance: 0.7 },
    { item: 'hierro',           qty: [1,2], chance: 0.3 },
    { item: 'pocionVidaGrande', qty: [1,1], chance: 0.1 },
  ],

  // ── Llanuras ──────────────────────────────────────────────────
  EarthGolem: [
    { item: 'piedra',        qty: [3,5], chance: 0.9 },
    { item: 'hierro',        qty: [1,3], chance: 0.5 },
    { item: 'elixirGuardia', qty: [1,1], chance: 0.1 },
  ],
  WanderingSpirit: [
    { item: 'mineral',    qty: [1,2], chance: 0.5 },
    { item: 'pocionMana', qty: [1,2], chance: 0.4 },
  ],

  // ── Camino ────────────────────────────────────────────────────
  ShadowForest: [
    { item: 'madera',     qty: [1,3], chance: 0.7 },
    { item: 'pocionVida', qty: [1,1], chance: 0.2 },
  ],
  StoneSnake: [
    { item: 'piedra', qty: [2,4], chance: 0.8 },
    { item: 'hierro', qty: [1,2], chance: 0.4 },
  ],
  WarriorGhost: [
    { item: 'hierro',       qty: [1,3], chance: 0.6  },
    { item: 'elixirFuerza', qty: [1,1], chance: 0.12 },
    { item: 'espadaHierro', qty: [1,1], chance: 0.04 },
  ],
  EliteMercenary: [
    { item: 'hierro',           qty: [2,4], chance: 0.8  },
    { item: 'pocionVidaGrande', qty: [1,1], chance: 0.2  },
    { item: 'armaduraHierro',   qty: [1,1], chance: 0.05 },
  ],
  Bandit: [
    { item: 'piedra',     qty: [1,2], chance: 0.5  },
    { item: 'madera',     qty: [1,2], chance: 0.5  },
    { item: 'pocionVida', qty: [1,1], chance: 0.25 },
  ],

  // ── Ejército Yami ─────────────────────────────────────────────
  ShadowSoldier: [
    { item: 'hierro',   qty: [1,2], chance: 0.6 },
    { item: 'mineral',  qty: [1,1], chance: 0.3 },
  ],
  DarkArcher: [
    { item: 'mineral',    qty: [1,2], chance: 0.5  },
    { item: 'arcoElfico', qty: [1,1], chance: 0.03 },
  ],
  Berserker: [
    { item: 'hierro',       qty: [2,4], chance: 0.8  },
    { item: 'elixirFuerza', qty: [1,1], chance: 0.15 },
  ],
  YamiMage: [
    { item: 'mineral',       qty: [2,3], chance: 0.7  },
    { item: 'pocionMana',    qty: [1,2], chance: 0.5  },
    { item: 'bastónCristal', qty: [1,1], chance: 0.03 },
  ],
  ShadowCaptain: [
    { item: 'hierro',           qty: [3,5], chance: 0.9  },
    { item: 'mineral',          qty: [2,3], chance: 0.7  },
    { item: 'etherFragmento',   qty: [1,2], chance: 0.4  },
    { item: 'mantoDeSombra',    qty: [1,1], chance: 0.06 },
    { item: 'nucleoArcano', qty: [1,1], chance: 0.2 },
  ],

  // ── Default ───────────────────────────────────────────────────
  default: [
    { item: 'piedra',     qty: [1,2], chance: 0.4  },
    { item: 'pocionVida', qty: [1,1], chance: 0.15 },
  ],
};

export function rollDrops(enemyType) {
  const table = ENEMY_DROPS[enemyType] ?? ENEMY_DROPS.default;
  const result = [];
  for (const entry of table) {
    if (Math.random() < entry.chance) {
      const qty = entry.qty[0] + Math.floor(Math.random() * (entry.qty[1] - entry.qty[0] + 1));
      result.push({ id: entry.item, qty });
    }
  }
  return result;
}
