// data/shops.js — Ashes of the Reborn | Valiant Gaming
// Esqueleto de estructura — PENDIENTE validar antes de llenar precios reales

import { ITEMS } from './items.js';

// ─────────────────────────────────────────────────────────────────
// CONFIG GENERAL DE TIENDAS
// ─────────────────────────────────────────────────────────────────
export const SHOP_CONFIG = {
  cycleHours: 1,        // 1 hora real = 1 ciclo día/noche (coincide con town day/night)
  rotationOnCycle: true, // alquimista y armería rotan qué venden cada ciclo
};

// ─────────────────────────────────────────────────────────────────
// STOCK POR TIPO (cuántas unidades por slot, se repone cada ciclo)
// ─────────────────────────────────────────────────────────────────
export const STOCK_BY_TYPE = {
  consumibles: { min: 10, max: 20 },
  materialesComunes: { min: 8, max: 15 },
  materialesRaros: { min: 3, max: 6 },
  equipos: {
    comun: { min: 3, max: 3 },
    raro: { min: 1, max: 2 },
    epico: { min: 1, max: 1 },
    legendario: { min: 0, max: 0 }, // no se vende, solo drop/gacha
  },
};

// ─────────────────────────────────────────────────────────────────
// SELL-BACK (solo General compra) — % del "valor base" del item
// valorBase se define más abajo en VALUE_TABLE
// ─────────────────────────────────────────────────────────────────
export const SELLBACK_RATE = {
  comun: 0.60,
  raro: 0.40,
  epico: 0.30,
  legendario: 0.125, // punto medio de 10-15%
};

// ─────────────────────────────────────────────────────────────────
// VALOR BASE POR RAREZA (referencia para precio compra/venta)
// Esto reemplaza mi tabla anterior de "tiers" que no existían en items.js
// ─────────────────────────────────────────────────────────────────
export const VALUE_TABLE = {
  // materiales: precio unitario
  materiales: {
    comun: { moneda: 'monedas', precio: 8 },
    raro: { moneda: 'oro', precio: 25 },
    epico: { moneda: 'oro', precio: 60 },
    legendario: { moneda: 'oro', precio: 150 },
  },
  // consumibles: precio unitario
  consumibles: {
    comun: { moneda: 'monedas', precio: 20 },
    raro: { moneda: 'monedas', precio: 70 },
  },
  // equipos: precio unitario
  equipos: {
    comun: { moneda: 'oro', precio: 60 },
    raro: { moneda: 'oro', precio: 250 },
    epico: { moneda: 'oro', precio: 900 },
    legendario: { moneda: 'oro', precio: null }, // no se vende
  },
};

// ─────────────────────────────────────────────────────────────────
// CATÁLOGO FIJO POR TIENDA (qué SECCIONES/rarezas puede vender cada una)
// Las listas concretas de itemIds se generan dinámicamente en runtime
// filtrando ITEMS por section + rarity + progreso del jugador
// ─────────────────────────────────────────────────────────────────
export const SHOPS = {
  alquimista: {
    id: 'alquimista',
    name: 'Alquimista',
    sections: ['consumibles'],
    moneda: 'monedas',
    slotsRotativos: 8,
    rotates: true,
    sellback: false,
  },

  armeria: {
    id: 'armeria',
    name: 'Armería',
    sections: ['equipos'],
    moneda: 'oro',
    slotsRotativos: 6,
    rotates: true,
    sellback: false,
    excludeRarity: ['legendario'], // legendario nunca en venta
  },

  general: {
    id: 'general',
    name: 'Tienda General',
    sections: ['materiales'],
    moneda: 'mixta', // comunes=monedas, raros+=oro (ver VALUE_TABLE)
    slotsFijos: true, // catálogo fijo, no rota
    rotates: false,
    sellback: true,        // ÚNICA tienda que compra del jugador
    sellbackSections: 'all', // compra cualquier section (materiales/consumibles/equipos)
    recetas: true, // vende planos de crafting (ver RECIPES)
  },
};

// ─────────────────────────────────────────────────────────────────
// DESBLOQUEO PROGRESIVO — qué rareza/zona habilita qué catálogo
// ─────────────────────────────────────────────────────────────────
export const UNLOCK_PROGRESSION = [
  { zone: 1, dungeon: null, unlocks: ['comun'] },
  { zone: 2, dungeon: 'dungeon1', unlocks: ['raro'] },
  { zone: 3, dungeon: 'dungeon2', unlocks: ['epico'] },
  { zone: 'ascension1', dungeon: null, unlocks: ['legendario_materiales'] }, // solo materiales, nunca equipo legendario
];

// ─────────────────────────────────────────────────────────────────
// RECETAS / PLANOS — vendidas solo en General, desbloqueo permanente
// PLACEHOLDER: 5 ejemplos, faltan IDs reales de craft output
// ─────────────────────────────────────────────────────────────────
export const RECIPES = {
  recetaEspadaHierro: {
    id: 'recetaEspadaHierro',
    name: 'Plano: Espada de Hierro',
    resultItem: 'espadaHierro',
    rarity: 'comun',
    moneda: 'monedas',
    precio: 100,
    materiales: { hierro: 5, madera: 2 },
  },
  recetaArmaduraHierro: {
    id: 'recetaArmaduraHierro',
    name: 'Plano: Armadura de Hierro',
    resultItem: 'armaduraHierro',
    rarity: 'comun',
    moneda: 'monedas',
    precio: 120,
    materiales: { hierro: 6, piedra: 4 },
  },
  recetaEspadaRunica: {
    id: 'recetaEspadaRunica',
    name: 'Plano: Espada Rúnica',
    resultItem: 'espadaRunica',
    rarity: 'raro',
    moneda: 'oro',
    precio: 200,
    materiales: { mineral: 4, cristalEspada: 2 },
  },
  recetaArmaduraRunica: {
    id: 'recetaArmaduraRunica',
    name: 'Plano: Armadura Rúnica',
    resultItem: 'armaduraRunica',
    rarity: 'raro',
    moneda: 'oro',
    precio: 220,
    materiales: { mineral: 5, hierro: 5 },
  },
  recetaKatanaOscura: {
    id: 'recetaKatanaOscura',
    name: 'Plano: Katana Oscura',
    resultItem: 'katanaOscura',
    rarity: 'epico',
    moneda: 'oro',
    precio: 800,
    materiales: { etherFragmento: 5, cristalKatana: 3, nucleoArcano: 1 },
  },
};

// ─────────────────────────────────────────────────────────────────
// FUNCIONES PENDIENTES DE IMPLEMENTAR (firmas, sin lógica aún)
// ─────────────────────────────────────────────────────────────────
// generateShopStock(shopId, playerProgress) -> array de items con stock actual
// purchaseItem(shopId, itemId, qty, playerCurrency) -> resultado compra
// sellItemToGeneral(itemId, qty, playerInventory) -> monedas/oro ganados
// buyRecipe(recipeId, playerCurrency) -> desbloquea receta permanente
// craftFromRecipe(recipeId, playerMaterials) -> crea item, consume materiales
// rotateShopStock(shopId) -> se llama cada cycleHours, recalcula slots rotativos
