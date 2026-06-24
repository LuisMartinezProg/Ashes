// core/gacha.js
// Sistema de Gacha estilo Genshin — doble pity (Épico 90 / Raro 10) + 50/50 con garantía.

const GEMS_KEY = 'ashes_gemas';
const PITY_KEY = 'ashes_gacha_pity'; // ahora guarda un objeto { epico, raro, guaranteeEpico, guaranteeRaro }
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

const PITY_EPICO_THRESHOLD = 90;
const PITY_RARO_THRESHOLD = 10; // estilo Genshin: garantiza 4★ cada 10 pulls

// Pool de recompensas. Raro y Épico tienen split featured/offRate para el 50/50.
const POOL = {
  [RARITY.COMUN]: [
    { id: 'frag_comun_kael', name: 'Fragmento Común de Kael', type: 'fragmento_reliquia' },
    { id: 'frag_comun_mika', name: 'Fragmento Común de Mika', type: 'fragmento_reliquia' },
    { id: 'mat_hierro', name: 'Mineral de Hierro', type: 'material' },
  ],
  [RARITY.RARO]: {
    featured: [
      { id: 'frag_raro_kael', name: 'Fragmento Raro de Kael', type: 'fragmento_reliquia' },
    ],
    offRate: [
      { id: 'frag_raro_mika', name: 'Fragmento Raro de Mika', type: 'fragmento_reliquia' },
      { id: 'mat_cristal', name: 'Cristal Astral', type: 'material' },
    ],
  },
  [RARITY.EPICO]: {
    featured: [
      { id: 'reliquia_alba_eterna', name: 'Reliquia: Alba Eterna', type: 'reliquia' },
    ],
    offRate: [
      { id: 'reliquia_velo_umbral', name: 'Reliquia: Velo Umbral', type: 'reliquia' },
      { id: 'reliquia_eco_astral', name: 'Reliquia: Eco Astral', type: 'reliquia' },
    ],
  },
};

export class GachaSystem {
  constructor() {
    this._gems = this._loadGems();
    const pity = this._loadPity();
    this._pityEpico = pity.epico;
    this._pityRaro = pity.raro;
    this._guaranteeEpico = pity.guaranteeEpico;
    this._guaranteeRaro = pity.guaranteeRaro;
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

  // ---------- Pity (doble, estilo Genshin) ----------
  _loadPity() {
    const saved = localStorage.getItem(PITY_KEY);
    if (!saved) return { epico: 0, raro: 0, guaranteeEpico: false, guaranteeRaro: false };
    try {
      const parsed = JSON.parse(saved);
      return {
        epico: parsed.epico || 0,
        raro: parsed.raro || 0,
        guaranteeEpico: !!parsed.guaranteeEpico,
        guaranteeRaro: !!parsed.guaranteeRaro,
      };
    } catch (e) {
      return { epico: 0, raro: 0, guaranteeEpico: false, guaranteeRaro: false };
    }
  }

  _savePity() {
    localStorage.setItem(PITY_KEY, JSON.stringify({
      epico: this._pityEpico,
      raro: this._pityRaro,
      guaranteeEpico: this._guaranteeEpico,
      guaranteeRaro: this._guaranteeRaro,
    }));
  }

  getPityEpico() { return this._pityEpico; }
  getPityRaro() { return this._pityRaro; }
  getPityEpicoRemaining() { return Math.max(0, PITY_EPICO_THRESHOLD - this._pityEpico); }
  getPityRaroRemaining() { return Math.max(0, PITY_RARO_THRESHOLD - this._pityRaro); }
  isGuaranteedEpico() { return this._guaranteeEpico; }
  isGuaranteedRaro() { return this._guaranteeRaro; }

  // ---------- Pulls ----------
  canPull(times = 1) {
    return this._gems >= PULL_COST * times;
  }

  getCost(times = 1) {
    return PULL_COST * times;
  }

  pullOnce() {
    this._pityEpico++;
    this._pityRaro++;

    const epicoForced = this._pityEpico >= PITY_EPICO_THRESHOLD;
    const raroForced  = this._pityRaro  >= PITY_RARO_THRESHOLD;

    let rarity;
    if (epicoForced) {
      rarity = RARITY.EPICO;
    } else {
      const roll = Math.random();
      if (roll < RATES[RARITY.EPICO]) {
        rarity = RARITY.EPICO;
      } else if (raroForced || roll < RATES[RARITY.EPICO] + RATES[RARITY.RARO]) {
        rarity = RARITY.RARO;
      } else {
        rarity = RARITY.COMUN;
      }
    }

    // Un Épico satisface también la garantía de Raro (como en Genshin: 5★ cumple el "al menos 4★").
    if (rarity === RARITY.EPICO) {
      this._pityEpico = 0;
      this._pityRaro = 0;
    } else if (rarity === RARITY.RARO) {
      this._pityRaro = 0;
    }

    let item;
    if (rarity === RARITY.EPICO) {
      item = this._rollFeatured(RARITY.EPICO);
    } else if (rarity === RARITY.RARO) {
      item = this._rollFeatured(RARITY.RARO);
    } else {
      const pool = POOL[RARITY.COMUN];
      const base = pool[Math.floor(Math.random() * pool.length)];
      item = { ...base, rarity };
    }

    this._savePity();
    return item;
  }

  // 50/50 con garantía: si pierdes, el siguiente de esa rareza es featured seguro.
  _rollFeatured(rarity) {
    const isEpico = rarity === RARITY.EPICO;
    let isFeatured;

    if (isEpico ? this._guaranteeEpico : this._guaranteeRaro) {
      isFeatured = true;
      if (isEpico) this._guaranteeEpico = false;
      else this._guaranteeRaro = false;
    } else {
      isFeatured = Math.random() < 0.5;
      if (!isFeatured) {
        if (isEpico) this._guaranteeEpico = true;
        else this._guaranteeRaro = true;
      }
    }

    const pool = POOL[rarity];
    const sourceList = isFeatured ? pool.featured : pool.offRate;
    const base = sourceList[Math.floor(Math.random() * sourceList.length)];
    return { ...base, rarity, featured: isFeatured };
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

export { RARITY, RATES, PULL_COST, PITY_EPICO_THRESHOLD, PITY_RARO_THRESHOLD };
