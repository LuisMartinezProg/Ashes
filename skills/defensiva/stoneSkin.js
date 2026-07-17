// skills/defensiva/stoneSkin.js — Habilidad: Piel de Piedra
const DURATION      = 6;     // segundos que dura el escudo
const DAMAGE_REDUCT = 0.35;  // 35% menos daño recibido mientras está activo
const SPEED_PENALTY = 0.20;  // 20% menos velocidad (la "limitante" del nodo)

export class StoneSkin {
  constructor(scene, player) {
    this.scene    = scene;
    this.player   = player;
    this.cooldown = 12;
    this._timer   = 0;
    this._active  = false;
    this._activeTimer = 0;
    this.onCooldownUpdate = null;
  }

  isReady() { return this._timer <= 0; }
  getCooldownProgress() { return Math.min(1, 1 - this._timer / this.cooldown); }

  cast() {
    if (!this.isReady()) return false;
    this._active = true;
    this._activeTimer = DURATION;
    if (this.player) {
      this.player._damageReduction = (this.player._damageReduction ?? 0) + DAMAGE_REDUCT;
      this.player._speedMultiplier = (this.player._speedMultiplier ?? 1) * (1 - SPEED_PENALTY);
    }
    this._timer = this.cooldown;
    if (this.onCooldownUpdate) this.onCooldownUpdate(0);
    return true;
  }

  update(delta) {
    if (this._timer > 0) {
      this._timer -= delta;
      if (this._timer < 0) this._timer = 0;
      if (this.onCooldownUpdate) this.onCooldownUpdate(this.getCooldownProgress());
    }
    if (this._active) {
      this._activeTimer -= delta;
      if (this._activeTimer <= 0) {
        this._active = false;
        if (this.player) {
          this.player._damageReduction = Math.max(0, (this.player._damageReduction ?? 0) - DAMAGE_REDUCT);
          this.player._speedMultiplier = (this.player._speedMultiplier ?? 1) / (1 - SPEED_PENALTY);
        }
      }
    }
  }
}
