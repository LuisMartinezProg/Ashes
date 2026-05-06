// core/inventory.js
// Ashes of the Reborn | Valiant Gaming

const STARTING_GOLD = 200;

class Inventory {
  constructor() {
    this.gold  = STARTING_GOLD;
    this.items = [];
    this.weapons = ['fists']; // arma inicial
    this.onGoldChange = null;
  }

  getGold() { return this.gold; }

  addGold(amount) {
    this.gold += amount;
    if (this.onGoldChange) this.onGoldChange(this.gold);
  }

  spendGold(amount) {
    if (this.gold < amount) return false;
    this.gold -= amount;
    if (this.onGoldChange) this.onGoldChange(this.gold);
    return true;
  }

  hasWeapon(id) { return this.weapons.includes(id); }

  addWeapon(id) {
    if (!this.hasWeapon(id)) this.weapons.push(id);
  }

  addItem(id) {
    const existing = this.items.find(i => i.id === id);
    if (existing) {
      existing.qty++;
    } else {
      this.items.push({ id, qty: 1 });
    }
  }

  useItem(id) {
    const item = this.items.find(i => i.id === id);
    if (!item || item.qty <= 0) return false;
    item.qty--;
    if (item.qty === 0) this.items = this.items.filter(i => i.id !== id);
    return true;
  }

  getItems() { return [...this.items]; }
  getWeapons() { return [...this.weapons]; }
}

// Singleton global
export const inventory = new Inventory();
