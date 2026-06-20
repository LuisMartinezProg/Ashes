// data/shops.js — Ashes of the Reborn | Valiant Gaming
// Requiere: import { ITEMS } from './items.js';

import { ITEMS } from './items.js';

// ── CONFIG GENERAL DE TIENDAS ─────────────────────────────────────
export const SHOP_CONFIG = {
  alquimista: { currency: 'monedas', sellback: false },
  armeria:    { currency: 'oro',     sellback: false },
  general:    { currency: 'mixto',   sellback: true   }, // mixto: ver precio por item
};

// % que la General paga al jugador por rareza al vender (sell-back)
export const SELLBACK_RATES = {
  comun:       0.60,
  poco_comun:  0.50,
  raro:        0.40,
  epico:       0.30,
  legendario:  0.125, // promedio del rango 10-15%
};

// ── STOCK POR TIPO (cantidad disponible por ciclo día/noche) ─────
export const STOCK_BY_TYPE = {
  consumibles: { min: 10, max: 20 },
  materiales:  { min: 5,  max: 10 },
  equipos:     { min: 1,  max: 3  },
};

function rollStock(section) {
  const range = STOCK_BY_TYPE[section] ?? { min: 1, max: 5 };
  return range.min + Math.floor(Math.random() * (range.max - range.min + 1));
}

// ── DESBLOQUEO POR RAREZA (proxy de progreso, sin campo de zona) ──
// comun/poco_comun/raro: disponibles desde el inicio
// epico: requiere haber derrotado al menos 1 boss de mazmorra
// legendario: no se vende nunca (solo drop/gacha)
function isUnlocked(rarity, bossesDefeated) {
  if (rarity === 'legendario') return false;
  if (rarity === 'epico') return bossesDefeated >= 1;
  return true; // comun, poco_comun, raro
}

// ── CATÁLOGO ALQUIMISTA (consumibles, paga con monedas) ───────────
export const ALQUIMISTA_CATALOG = [
  'pocionVida',
  'pocionVidaGrande',
  'pocionMana',
  'elixirFuerza',
  'elixirGuardia',
];

export const ALQUIMISTA_PRICES = {
  pocionVida:       18,
  pocionVidaGrande: 55,
  pocionMana:       15,
  elixirFuerza:     70,
  elixirGuardia:    70,
};

// ── CATÁLOGO ARMERÍA (armas + armaduras + accesorios, paga con oro) ─
export const ARMERIA_CATALOG = [
  'espadaHierro',
  'espadaRunica',
  'katanaOscura',
  'arcoElfico',
  'bastónCristal',
  'armaduraHierro',
  'armaduraRunica',
  'mantoDeSombra',
  'anilloFuerza',
  'amuletoCristal',
];

export const ARMERIA_PRICES = {
  espadaHierro:    65,
  armaduraHierro:  65,
  espadaRunica:    180,
  arcoElfico:      180,
  armaduraRunica:  190,
  anilloFuerza:    170,
  katanaOscura:    1200,
  bastónCristal:   1200,
  mantoDeSombra:   1100,
  amuletoCristal:  1100,
};

// ── CATÁLOGO GENERAL (materiales fijos, compra con monedas/oro) ───
export const GENERAL_CATALOG = [
  'madera',
  'piedra',
  'hierro',
  'mineral',
  'etherFragmento',
];

export const GENERAL_PRICES = {
  madera:         6,
  piedra:         6,
  hierro:         12,
  mineral:        45,
  etherFragmento: 65,
};

// Moneda usada para COMPRAR cada material en la General
export const GENERAL_CURRENCY = {
  madera:         'monedas',
  piedra:         'monedas',
  hierro:         'monedas',
  mineral:        'oro',
  etherFragmento: 'oro',
};

// ── GENERAR INVENTARIO ACTUAL DE UNA TIENDA ───────────────────────
// bossesDefeated: número de jefes de mazmorra derrotados (para desbloqueo épico)
export function generateShopInventory(shopType, bossesDefeated = 0) {
  let catalog, prices;

  if (shopType === 'alquimista') {
    catalog = ALQUIMISTA_CATALOG;
    prices = ALQUIMISTA_PRICES;
  } else if (shopType === 'armeria') {
    catalog = ARMERIA_CATALOG;
    prices = ARMERIA_PRICES;
  } else if (shopType === 'general') {
    catalog = GENERAL_CATALOG;
    prices = GENERAL_PRICES;
  } else {
    return [];
  }

  const inventory = [];
  for (const itemId of catalog) {
    const item = ITEMS[itemId];
    if (!item) continue;
    if (!isUnlocked(item.rarity, bossesDefeated)) continue;

    inventory.push({
      id: item.id,
      name: item.name,
      icon: item.icon,
      rarity: item.rarity,
      section: item.section,
      price: prices[itemId] ?? 0,
      currency: shopType === 'general' ? GENERAL_CURRENCY[itemId] : SHOP_CONFIG[shopType].currency,
      stock: rollStock(item.section),
    });
  }
  return inventory;
}

// ── COMPRAR ITEM ───────────────────────────────────────────────────
// playerCurrency: { monedas, oro } | inventoryState: array generado por generateShopInventory
export function buyItem(shopType, itemId, playerCurrency, inventoryState) {
  const slot = inventoryState.find(s => s.id === itemId);
  if (!slot) return { success: false, reason: 'no_disponible' };
  if (slot.stock <= 0) return { success: false, reason: 'sin_stock' };
  if (playerCurrency[slot.currency] < slot.price) return { success: false, reason: 'sin_fondos' };

  slot.stock -= 1;
  return {
    success: true,
    itemId,
    cost: slot.price,
    currency: slot.currency,
  };
}

// ── VENDER ITEM (sell-back, solo General) ─────────────────────────
export function sellItemToGeneral(itemId, baseValue) {
  const item = ITEMS[itemId];
  if (!item) return { success: false, reason: 'item_invalido' };

  const rate = SELLBACK_RATES[item.rarity] ?? 0.5;
  const payout = Math.round(baseValue * rate);

  return {
    success: true,
    itemId,
    payout,
    currency: 'monedas', // General siempre paga en monedas al comprar del jugador
    rate,
  };
}

// ── RESET DIARIO DE STOCK (llamar en el ciclo día/noche) ──────────
export function refreshShopStock(inventoryState) {
  for (const slot of inventoryState) {
    slot.stock = rollStock(slot.section);
  }
  return inventoryState;
}
