// core/gachaBoard.js
// Tablero circular tipo "Fair" (inspirado en Neverness to Everness) para el Gachapon.
// La rareza REAL de cada pull la sigue decidiendo core/gacha.js (pity, 50/50, etc.)
// intacto. Este módulo NO decide rareza — solo:
//   1) mueve una ficha persistente por un tablero fijo con un dado libre (1-6)
//   2) determina qué "tipo de casilla" cae bajo la ficha, para darle un bonus
//      visual/menor (gemas o monedas del banner) por encima de la rareza real
//   3) gestiona la transformación fuerte del tablero cuando el pity Épico se acerca
//
// La posición de la ficha persiste en localStorage y nunca se resetea.

const STORAGE_KEY = 'valiant_gacha_board_v1';

// Cantidad de casillas del circuito. Con dado 1-6 y este tamaño, la ficha
// da una vuelta completa aprox. cada 6-7 tiradas en promedio.
export const BOARD_SIZE = 22;

// Umbral (en pity Épico) a partir del cual el tablero entra en modo "transformado".
// Reusa el mismo pity que ya tenés definido en core/gacha.js.
import { PITY_EPICO_THRESHOLD } from './gacha.js';
export const BOARD_TRANSFORM_THRESHOLD = Math.round(PITY_EPICO_THRESHOLD * 0.78); // ~70/90 en proporción NTE

// ---- Tipos de casilla (capa puramente visual/bonus, no afecta rareza real) ----
// 'plain'   -> casilla normal, sin bonus extra
// 'gems'    -> además de la rareza obtenida, suma un pequeño bonus de gemas
// 'coin'    -> además de la rareza obtenida, suma un pequeño bonus de "moneda del banner"
// 'echo'    -> casilla temática que resalta cuando la rareza real es Eco/Raro
// 'veil'    -> casilla temática que resalta cuando la rareza real es Velo/Épico (más densa cerca del transform)
const TILE_TYPES = ['plain', 'gems', 'coin', 'echo', 'veil'];

const TILE_LABELS = {
  plain: 'Eco perdido',
  gems: 'Fragmento brillante',
  coin: 'Reliquia menor',
  echo: 'Resonancia',
  veil: 'Velo dormido',
};

// Bonus fijos por tipo de casilla (independientes de la rareza real del pull)
const TILE_BONUS = {
  plain: null,
  gems: { kind: 'gems', amount: 5 },
  coin: { kind: 'bannerCoin', amount: 3 },
  echo: null,
  veil: null,
};

// Distribución base del circuito normal (22 casillas). Se recorre y repite
// el patrón hasta llenar BOARD_SIZE. Mayoría 'plain', algunas 'gems'/'coin',
// pocas 'echo'/'veil' repartidas para dar variedad visual.
const BASE_PATTERN = [
  'plain', 'gems', 'plain', 'echo', 'plain', 'coin',
  'plain', 'plain', 'gems', 'plain', 'veil', 'plain',
  'coin', 'plain', 'echo', 'plain', 'gems', 'plain',
  'plain', 'coin', 'plain', 'veil',
];

function _buildNormalBoard() {
  const tiles = [];
  for (let i = 0; i < BOARD_SIZE; i++) {
    const type = BASE_PATTERN[i % BASE_PATTERN.length];
    tiles.push({ index: i, type, label: TILE_LABELS[type] });
  }
  return tiles;
}

// Versión "transformada" del tablero: bastantes más casillas 'veil',
// para comunicar fuerte que el Épico está cerca (cambio de tema, no de rareza real).
const TRANSFORM_PATTERN = [
  'veil', 'gems', 'veil', 'echo', 'veil', 'coin',
  'veil', 'plain', 'veil', 'gems', 'veil', 'plain',
  'veil', 'coin', 'veil', 'echo', 'veil', 'gems',
  'veil', 'plain', 'veil', 'veil',
];

function _buildTransformedBoard() {
  const tiles = [];
  for (let i = 0; i < BOARD_SIZE; i++) {
    const type = TRANSFORM_PATTERN[i % TRANSFORM_PATTERN.length];
    tiles.push({ index: i, type, label: TILE_LABELS[type] });
  }
  return tiles;
}

function _loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { position: 0 };
    const parsed = JSON.parse(raw);
    if (typeof parsed.position !== 'number') return { position: 0 };
    return { position: ((parsed.position % BOARD_SIZE) + BOARD_SIZE) % BOARD_SIZE };
  } catch (e) {
    return { position: 0 };
  }
}

function _saveState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    // localStorage no disponible; la posición simplemente no persiste esta sesión.
  }
}

export class GachaBoard {
  constructor(gacha) {
    this.gacha = gacha; // referencia a la instancia de core/gacha.js (para leer pity actual)
    const state = _loadState();
    this.position = state.position;
    this._normalTiles = _buildNormalBoard();
    this._transformedTiles = _buildTransformedBoard();
  }

  // ¿El tablero debe mostrarse transformado ahora mismo?
  isTransformed() {
    return this.gacha.getPityEpico() >= BOARD_TRANSFORM_THRESHOLD;
  }

  // Devuelve el set de casillas activo según el estado de pity actual.
  getActiveTiles() {
    return this.isTransformed() ? this._transformedTiles : this._normalTiles;
  }

  getTile(index) {
    const tiles = this.getActiveTiles();
    return tiles[((index % BOARD_SIZE) + BOARD_SIZE) % BOARD_SIZE];
  }

  getCurrentPosition() {
    return this.position;
  }

  // Tira un dado libre 1-6 (sin trucos: no depende de la rareza del pull).
  rollDie() {
    return 1 + Math.floor(Math.random() * 6);
  }

  // Avanza la ficha `steps` casillas y persiste la nueva posición.
  // Devuelve { from, to, landedTile, passedTiles } donde:
  //   - from/to son índices de casilla
  //   - landedTile es la casilla final (con su tipo/bonus)
  //   - passedTiles es el array de casillas intermedias recorridas (para animar paso a paso)
  advance(steps) {
    const from = this.position;
    const passedTiles = [];
    for (let i = 1; i <= steps; i++) {
      passedTiles.push(this.getTile(from + i));
    }
    const to = ((from + steps) % BOARD_SIZE + BOARD_SIZE) % BOARD_SIZE;
    this.position = to;
    _saveState({ position: this.position });

    const landedTile = this.getTile(to);
    return { from, to, landedTile, passedTiles };
  }

  // Dado un resultado de pull ya calculado por core/gacha.js ({rarity, name, featured}),
  // ejecuta un turno completo del tablero: tira dado, mueve ficha, calcula bonus
  // de la casilla de aterrizaje. NO decide ni modifica la rareza real.
  playTurn(pullResult) {
    const steps = this.rollDie();
    const { from, to, landedTile, passedTiles } = this.advance(steps);
    const bonus = TILE_BONUS[landedTile.type] || null;

    return {
      diceValue: steps,
      from,
      to,
      landedTile,
      passedTiles,
      bonus, // { kind: 'gems'|'bannerCoin', amount } o null
      pull: pullResult, // el resultado real de rareza, sin modificar
    };
  }
}

export { TILE_LABELS, TILE_TYPES };
