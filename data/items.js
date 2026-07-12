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
  cristalKatana: {
    id: 'cristalKatana', name: 'Cristal de Katana', icon: '🔷',
    section: 'materiales', rarity: 'raro',
    desc: 'Cristal afilado imbuido con el espíritu de la katana.',
  },
  cristalEspada: {
    id: 'cristalEspada', name: 'Cristal de Espada', icon: '🔵',
    section: 'materiales', rarity: 'raro',
    desc: 'Cristal de acero forjado con honor de batalla.',
  },
  cristalMagia: {
    id: 'cristalMagia', name: 'Cristal de Magia', icon: '🟣',
    section: 'materiales', rarity: 'raro',
    desc: 'Cristal imbuido con energía arcana pura.',
  },
  cristalArco: {
    id: 'cristalArco', name: 'Cristal de Arco', icon: '🟢',
    section: 'materiales', rarity: 'raro',
    desc: 'Cristal ligero resonante con la precisión del arco.',
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

  // ── ARMAS ─────────────────────────────────────────────────────
  espadaHierro: {
    id: 'espadaHierro', name: 'Espada de Hierro', icon: '⚔️',
    section: 'armas', rarity: 'comun',
    desc: 'Espada forjada con hierro de las ruinas.',
    slot: 'arma', weaponType: 'sword',
    stats: { ATK: 12, VEL: 2 },
  },
  espadaRunica: {
    id: 'espadaRunica', name: 'Espada Rúnica', icon: '🗡️',
    section: 'armas', rarity: 'raro',
    desc: 'Grabada con runas antiguas.',
    slot: 'arma', weaponType: 'sword',
    stats: { ATK: 22, VEL: 3, MAGIA: 5 },
  },
  katanaOscura: {
    id: 'katanaOscura', name: 'Katana Oscura', icon: '🔪',
    section: 'armas', rarity: 'epico',
    desc: 'Forjada en las sombras de Khazeron.',
    slot: 'arma', weaponType: 'katana',
    stats: { ATK: 35, VEL: 8, CRIT: 10 },
  },
  arcoElfico: {
    id: 'arcoElfico', name: 'Arco Élfico', icon: '🏹',
    section: 'armas', rarity: 'raro',
    desc: 'Ligero y preciso.',
    slot: 'arma', weaponType: 'bow',
    stats: { ATK: 18, VEL: 6, RANGO: 5 },
  },
  bastónCristal: {
    id: 'bastónCristal', name: 'Bastón de Cristal', icon: '🔮',
    section: 'armas', rarity: 'epico',
    desc: 'Amplifica la magia elemental.',
    slot: 'arma', weaponType: 'magic',
    stats: { MAGIA: 40, ATK: 10, MANA: 20 },
  },

  // ── ARMADURAS ─────────────────────────────────────────────────
  armaduraHierro: {
    id: 'armaduraHierro', name: 'Armadura de Hierro', icon: '🥋',
    section: 'armaduras', rarity: 'comun',
    desc: 'Protección básica forjada en hierro.',
    slot: 'armadura',
    stats: { DEF: 15, HP: 20 },
  },
  armaduraRunica: {
    id: 'armaduraRunica', name: 'Armadura Rúnica', icon: '🛡️',
    section: 'armaduras', rarity: 'raro',
    desc: 'Reforzada con inscripciones mágicas.',
    slot: 'armadura',
    stats: { DEF: 28, HP: 40, MAGIA: 8 },
  },
  mantoDeSombra: {
    id: 'mantoDeSombra', name: 'Manto de Sombra', icon: '🌑',
    section: 'armaduras', rarity: 'epico',
    desc: 'Reduce la detección enemiga.',
    slot: 'armadura',
    stats: { DEF: 20, VEL: 5, SIGILO: 10 },
  },

  // ── ACCESORIOS ────────────────────────────────────────────────
  anilloFuerza: {
    id: 'anilloFuerza', name: 'Anillo de Fuerza', icon: '💍',
    section: 'accesorios', rarity: 'raro',
    desc: 'Incrementa el poder de ataque.',
    slot: 'accesorio',
    stats: { ATK: 10, CRIT: 5 },
  },
  amuletoCristal: {
    id: 'amuletoCristal', name: 'Amuleto de Cristal', icon: '📿',
    section: 'accesorios', rarity: 'epico',
    desc: 'Amplifica la energía mágica.',
    slot: 'accesorio',
    stats: { MAGIA: 15, MANA: 25 },
  },
};

export const WEAPON_CRYSTAL = {
  katana: 'cristalKatana',
  sword : 'cristalEspada',
  magic : 'cristalMagia',
  bow   : 'cristalArco',
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
    { item: 'nucleoArcano',     qty: [1,2], chance: 0.6  },
    { item: 'katanaOscura',     qty: [1,1], chance: 0.15 },
    { item: 'pocionVidaGrande', qty: [2,3], chance: 1.0  },
    { item: 'cristalKatana',    qty: [2,3], chance: 0.8  },
    { item: 'cristalEspada',    qty: [2,3], chance: 0.8  },
  ],
  Veyris: [
    { item: 'etherFragmento', qty: [3,5], chance: 1.0  },
    { item: 'nucleoArcano',   qty: [1,2], chance: 0.6  },
    { item: 'bastónCristal',  qty: [1,1], chance: 0.15 },
    { item: 'amuletoCristal', qty: [1,1], chance: 0.2  },
    { item: 'cristalMagia',   qty: [2,3], chance: 0.8  },
    { item: 'cristalArco',    qty: [2,3], chance: 0.8  },
  ],
  Khazeron: [
    { item: 'etherFragmento', qty: [5,8], chance: 1.0  },
    { item: 'nucleoArcano',   qty: [1,2], chance: 0.6  },
    { item: 'mantoDeSombra',  qty: [1,1], chance: 0.2  },
    { item: 'katanaOscura',   qty: [1,1], chance: 0.25 },
    { item: 'cristalKatana',  qty: [3,5], chance: 1.0  },
    { item: 'cristalEspada',  qty: [3,5], chance: 1.0  },
    { item: 'cristalMagia',   qty: [3,5], chance: 1.0  },
    { item: 'cristalArco',    qty: [3,5], chance: 1.0  },
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
    { item: 'hierro',  qty: [1,2], chance: 0.6 },
    { item: 'mineral', qty: [1,1], chance: 0.3 },
  ],
  DarkArcher: [
    { item: 'mineral',    qty: [1,2], chance: 0.5  },
    { item: 'cristalArco',qty: [1,1], chance: 0.15 },
    { item: 'arcoElfico', qty: [1,1], chance: 0.03 },
  ],
  Berserker: [
    { item: 'hierro',        qty: [2,4], chance: 0.8  },
    { item: 'elixirFuerza',  qty: [1,1], chance: 0.15 },
    { item: 'cristalEspada', qty: [1,1], chance: 0.15 },
  ],
  YamiMage: [
    { item: 'mineral',       qty: [2,3], chance: 0.7  },
    { item: 'pocionMana',    qty: [1,2], chance: 0.5  },
    { item: 'cristalMagia',  qty: [1,1], chance: 0.15 },
    { item: 'bastónCristal', qty: [1,1], chance: 0.03 },
  ],
  ShadowCaptain: [
    { item: 'hierro',        qty: [3,5], chance: 0.9  },
    { item: 'mineral',       qty: [2,3], chance: 0.7  },
    { item: 'etherFragmento',qty: [1,2], chance: 0.4  },
    { item: 'nucleoArcano',  qty: [1,1], chance: 0.2  },
    { item: 'cristalKatana', qty: [1,2], chance: 0.25 },
    { item: 'mantoDeSombra', qty: [1,1], chance: 0.06 },
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
// ── DROPS DE MONEDA (separado de ENEMY_DROPS) ──────────────────────
export const CURRENCY_DROPS = {
  // ── Mundo abierto — solo monedas, oro casi nulo ──────────────────
  Wolf:            { monedas: [2, 5],   oro: [0, 0],  oroChance: 0 },
  Bear:            { monedas: [8, 15],  oro: [0, 1],  oroChance: 0.05 },
  Mossling:        { monedas: [1, 3],   oro: [0, 0],  oroChance: 0 },
  Firefly:         { monedas: [1, 2],   oro: [0, 0],  oroChance: 0 },
  CrystalSpider:   { monedas: [2, 4],   oro: [0, 0],  oroChance: 0 },
  Troll:           { monedas: [6, 10],  oro: [0, 1],  oroChance: 0.04 },
  EarthGolem:      { monedas: [8, 14],  oro: [0, 1],  oroChance: 0.06 },
  WanderingSpirit: { monedas: [2, 4],   oro: [0, 0],  oroChance: 0 },
  ShadowForest:    { monedas: [3, 6],   oro: [0, 0],  oroChance: 0 },
  StoneSnake:      { monedas: [4, 7],   oro: [0, 0],  oroChance: 0 },
  WarriorGhost:    { monedas: [5, 9],   oro: [0, 1],  oroChance: 0.03 },
  EliteMercenary:  { monedas: [10, 16], oro: [0, 1],  oroChance: 0.08 },
  Bandit:          { monedas: [3, 6],   oro: [0, 0],  oroChance: 0 },
  ShadowSoldier:   { monedas: [4, 7],   oro: [0, 0],  oroChance: 0 },
  DarkArcher:      { monedas: [5, 8],   oro: [0, 1],  oroChance: 0.04 },
  Berserker:       { monedas: [9, 14],  oro: [0, 1],  oroChance: 0.07 },
  YamiMage:        { monedas: [8, 13],  oro: [0, 1],  oroChance: 0.06 },
  ShadowCaptain:   { monedas: [20, 30], oro: [2, 4],  oroChance: 1.0 },

  // ── Mazmorras — fuente principal de oro ──────────────────────────
  DungeonGuard:    { monedas: [4, 8],   oro: [1, 2],  oroChance: 0.5  },
  RuneWarden:      { monedas: [6, 10],  oro: [2, 3],  oroChance: 0.6  },
  AncientSentinel: { monedas: [8, 14],  oro: [3, 5],  oroChance: 0.7  },

  // ── Jefes de mazmorra — oro garantizado, cantidad alta ────────────
  Malachar:  { monedas: [40, 60], oro: [15, 25], oroChance: 1.0 },
  Veyris:    { monedas: [40, 60], oro: [15, 25], oroChance: 1.0 },
  Khazeron:  { monedas: [60, 90], oro: [25, 40], oroChance: 1.0 },

  default: { monedas: [1, 3], oro: [0, 0], oroChance: 0 },
};

export function rollCurrency(enemyType) {
  const table = CURRENCY_DROPS[enemyType] ?? CURRENCY_DROPS.default;
  const monedas = table.monedas[0] + Math.floor(Math.random() * (table.monedas[1] - table.monedas[0] + 1));
  let oro = 0;
  if (Math.random() < table.oroChance) {
    oro = table.oro[0] + Math.floor(Math.random() * (table.oro[1] - table.oro[0] + 1));
  }
  return { monedas, oro };
                    }
