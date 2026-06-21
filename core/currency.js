// core/currency.js — Ashes of the Reborn | Valiant Gaming
// Sistema de monedas: "monedas" (normal) y "oro" (premium)

const STORAGE_KEY = 'ashes_currency';

export class CurrencySystem {
  constructor() {
    this.monedas = 0;
    this.oro     = 0;

    this.onMonedasChange = null; // compatibilidad: callback único legacy
    this.onOroChange     = null; // compatibilidad: callback único legacy

    this._listeners = new Set(); // nuevos suscriptores múltiples

    this._load();
  }

  // ── Suscripción múltiple (nuevo) ────────────────────────────────────────
  // callback(monedas, oro) se llama en CUALQUIER cambio de cualquiera de los dos
  onChange(callback) {
    this._listeners.add(callback);
  }

  offChange(callback) {
    this._listeners.delete(callback);
  }

  _notify() {
    for (const cb of this._listeners) cb(this.monedas, this.oro);
  }

  // ── Monedas (normal) ────────────────────────────────────────────────────
  getMonedas() { return this.monedas; }

  addMonedas(amount) {
    if (amount <= 0) return;
    this.monedas += amount;
    this._save();
    this.onMonedasChange?.(this.monedas);
    this._notify();
  }

  spendMonedas(amount) {
    if (this.monedas < amount) return false;
    this.monedas -= amount;
    this._save();
    this.onMonedasChange?.(this.monedas);
    this._notify();
    return true;
  }

  hasMonedas(amount) { return this.monedas >= amount; }

  // ── Oro (premium) ────────────────────────────────────────────────────────
  getOro() { return this.oro; }

  addOro(amount) {
    if (amount <= 0) return;
    this.oro += amount;
    this._save();
    this.onOroChange?.(this.oro);
    this._notify();
  }

  spendOro(amount) {
    if (this.oro < amount) return false;
    this.oro -= amount;
    this._save();
    this.onOroChange?.(this.oro);
    this._notify();
    return true;
  }

  hasOro(amount) { return this.oro >= amount; }

  // ── Persistencia ─────────────────────────────────────────────────────────
  _save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        monedas: this.monedas,
        oro    : this.oro,
      }));
    } catch (e) {
      console.warn('[Currency] Error guardando:', e);
    }
  }

  _load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const data = JSON.parse(raw);
      this.monedas = data.monedas ?? 0;
      this.oro     = data.oro ?? 0;
    } catch (e) {
      console.warn('[Currency] Error cargando:', e);
    }
  }

  serialize() {
    return { monedas: this.monedas, oro: this.oro };
  }

  load(data) {
    if (!data) return;
    this.monedas = data.monedas ?? this.monedas;
    this.oro     = data.oro ?? this.oro;
    this._save();
  }
}
