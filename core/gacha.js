// core/gacha.js
// Sistema de Gacha — banner de Reliquias/Fragmentos con pity (90 pulls) y 50/50.
// Gemas y pity persistidos en localStorage de forma independiente por ahora.

const GEMS_KEY = 'ashes_gemas';
const PITY_KEY = 'ashes_gacha_pity';
const PULL_COST = 160;

const RARITY = {
  COMUN: 'comun',
  RARO: 'raro',
  EPICO: 'epico',
};

const RATES = {
  [RARITY.EPICO]: 0.05,
  [RARITY.RARO]: 0.25,
  [RARITY.COMUN]: 0.70,
};

const PITY_THRESHOLD = 90;

// Pool de recompensas por rareza. `featured` = ítem destacado del banner actual.
const POOL = {
  [RARITY.COMUN]: [
    { id: 'frag_comun_kael', name: 'Fragmento Común de Kael', type: 'fragmento_reliquia' },
    { id: 'frag_comun_mika', name: 'Fragmento Común de Mika', type: 'fragmento_reliquia' },
    { id: 'mat_hierro', name: 'Mineral de Hierro', type: 'material' },
  ],
  [RARITY.RARO]: [
    { id: 'frag_raro_kael', name: 'Fragmento Raro de Kael', type: 'fragmento_reliquia' },
    { id: 'frag_raro_mika', name: 'Fragmento Raro de Mika', type: 'fragmento_reliquia' },
    { id: 'mat_cristal', name: 'Cristal Astral', type: 'material' },
  ],
  [RARITY.EPICO]: {
    featured: { id: 'reliquia_alba_eterna', name: 'Reliquia: Alba Eterna', type: 'reliquia' },
    offRate: [
      { id: 'reliquia_velo_umbral', name: 'Reliquia: Velo Umbral', type: 'reliquia' },
      { id: 'reliquia_eco_astral', name: 'Reliquia: Eco Astral', type: 'reliquia' },
    ],
  },
};

export class GachaSystem {
  constructor() {
    this._gems = this._loadGems();
    this._pity = this._loadPity();
    this._subscribers = [];
    this.onPullResult = null; // callback(results) -> lo usará la UI
  }

  // ---------- Gemas ----------
  _loadGems() {
    const saved = localStorage.getItem(GEMS_KEY);
    return saved ? (parseInt(saved, 10) || 0) : 0;
  }

  _saveGems() {
    localStorage.setItem(GEMS_KEY, String(this._gems));
    this._notify();
  }

  getGems() {
    return this._gems;
  }

  addGems(amount) {
    if (amount <= 0) return;
    this._gems += amount;
    this._saveGems();
  }

  _spendGems(amount) {
    if (this._gems < amount) return false;
    this._gems -= amount;
    this._saveGems();
    return true;
  }

  onChange(cb) {
    if (typeof cb === 'function') this._subscribers.push(cb);
  }

  offChange(cb) {
    this._subscribers = this._subscribers.filter(s => s !== cb);
  }

  _notify() {
    this._subscribers.forEach(cb => cb(this._gems));
  }

  // ---------- Pity ----------
  _loadPity() {
    const saved = localStorage.getItem(PITY_KEY);
    return saved ? (parseInt(saved, 10) || 0) : 0;
  }

  _savePity() {
    localStorage.setItem(PITY_KEY, String(this._pity));
  }

  getPity() {
    return this._pity;
  }

  getPityRemaining() {
    return Math.max(0, PITY_THRESHOLD - this._pity);
  }

  // ---------- Pulls ----------
  canPull(times = 1) {
    return this._gems >= PULL_COST * times;
  }

  getCost(times = 1) {
    return PULL_COST * times;
  }

  pullOnce() {
    this._pity++;

    let rarity;
    if (this._pity >= PITY_THRESHOLD) {
      rarity = RARITY.EPICO;
    } else {
      const roll = Math.random();
      if (roll < RATES[RARITY.EPICO]) {
        rarity = RARITY.EPICO;
      } else if (roll < RATES[RARITY.EPICO] + RATES[RARITY.RARO]) {
        rarity = RARITY.RARO;
      } else {
        rarity = RARITY.COMUN;
      }
    }

    let item;
    if (rarity === RARITY.EPICO) {
      this._pity = 0;
      const isFeatured = Math.random() < 0.5; // 50/50
      const base = isFeatured
        ? POOL[RARITY.EPICO].featured
        : POOL[RARITY.EPICO].offRate[Math.floor(Math.random() * POOL[RARITY.EPICO].offRate.length)];
      item = { ...base, rarity, featured: isFeatured };
    } else {
      const pool = POOL[rarity];
      const base = pool[Math.floor(Math.random() * pool.length)];
      item = { ...base, rarity };
    }

    this._savePity();
    return item;
  }

  pull(times = 1) {
    if (!this._spendGems(PULL_COST * times)) return null;

    const results = [];
    for (let i = 0; i < times; i++) {
      results.push(this.pullOnce());
    }

    this._deliverToInventory(results);

    if (typeof this.onPullResult === 'function') this.onPullResult(results);

    return results;
  }

  _deliverToInventory(results) {
    const inv = window._inventory;
    results.forEach(item => {
      if (inv && typeof inv.addItem === 'function') {
        inv.addItem(item);
      } else {
        console.log('[Gacha] Item obtenido (sin enganche a inventario aún):', item.name);
      }
    });
  }
}

export { RARITY, RATES, PULL_COST, PITY_THRESHOLD };
