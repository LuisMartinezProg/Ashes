// core/enemies/BaseEnemy.js — Clase base para todos los enemigos
import * as THREE from 'three';

export const STATE = {
  ROAM   : 'roam',
  CHASE  : 'chase',
  ATTACK : 'attack',
  DEAD   : 'dead',
};

export class BaseEnemy {
  constructor(scene, position, player, config) {
    this.scene = scene;
    this.player   = player;
    this.hp       = config.hp;
    this.maxHp    = config.hp;
    this.dead     = false;
    this.onDeath  = null;

    this._config       = config;
    this._state        = STATE.ROAM;
    this._spawnPos     = { ...position };
    this._attackTimer  = 0;
    this._roamTimer    = 0;
    this._roamTarget   = new THREE.Vector3(position.x, 0, position.z);
    this._respawnTimer = 0;
    this._dying        = false;
    this._dyingTimer   = 0;
    this._slowFactor   = 1;
    this._slowTimer    = 0;
    this._burnDPS      = 0;
    this._burnTimer    = 0;
    this._burnAccum    = 0;
    this._materials    = [];

    this._buildMesh(position);
    this.scene.add(this.mesh);
  }

  _buildMesh(pos) {}

  isDead() { return this.dead; }

  applyBurn(dps, duration) { this._burnDPS = dps; this._burnTimer = duration; }
  applySlow(factor, duration) { this._slowFactor = factor; this._slowTimer = duration; }

  takeDamage(amount) {
    if (this.dead) return;
    this.hp = Math.max(0, this.hp - amount);
    this._flash();
    if (this.hp <= 0) this._startDeath();
  }

  // ── Obtener personaje activo ──────────────────────────────────────────────
  _getActiveTarget() {
    const active = window._partyManager?.getActiveCharacter();
    if (active) return active;
    return this.player;
  }

  _getActivePosition() {
    const target = this._getActiveTarget();
    return target.root?.position ?? target.position;
  }

  update(delta) {
    if (!this.mesh && this.dead) {
      this._respawnTimer -= delta;
      if (this._respawnTimer <= 0) this._respawn();
      return;
    }
    if (!this.mesh || this.dead) return;
    if (this._dying) { this._updateDeathAnim(delta); return; }

    if (this._burnTimer > 0) {
      this._burnTimer -= delta;
      this._burnAccum += this._burnDPS * delta;
      if (this._burnAccum >= 1) {
        this.takeDamage(Math.floor(this._burnAccum));
        this._burnAccum = 0;
      }
      if (this._burnTimer <= 0) this._burnDPS = 0;
    }
    if (this._slowTimer > 0) {
      this._slowTimer -= delta;
      if (this._slowTimer <= 0) this._slowFactor = 1;
    }

    switch (this._state) {
      case STATE.ROAM:   this._updateRoam(delta);   break;
      case STATE.CHASE:  this._updateChase(delta);  break;
      case STATE.ATTACK: this._updateAttack(delta); break;
    }
  }

  _updateRoam(delta) {
    const detectRange = this._config.detectRange ?? 6;
    if (this._distToPlayer() < detectRange) {
      this._state = STATE.CHASE;
      return;
    }
    this._roamTimer -= delta;
    if (this._roamTimer <= 0) {
      this._roamTimer = 2 + Math.random() * 3;
      this._roamTarget = new THREE.Vector3(
        this._spawnPos.x + (Math.random() - 0.5) * 14,
        0,
        this._spawnPos.z + (Math.random() - 0.5) * 14
      );
    }
    if (this._distTo(this._roamTarget) > 0.5) {
      this._moveTo(this._roamTarget, this._config.roamSpeed ?? 1.5, delta);
    }
  }

  _updateChase(delta) {
    const attackRange = this._config.attackRange ?? 1.5;
    const detectRange = this._config.detectRange ?? 6;
    const chaseSpeed  = this._config.chaseSpeed  ?? 3.5;

    if (this._distToPlayer() > detectRange * 1.6) {
      this._state = STATE.ROAM;
      return;
    }
    if (this._distToPlayer() < attackRange) {
      this._state = STATE.ATTACK;
      return;
    }
    this._moveTo(this._getActivePosition(), chaseSpeed * this._slowFactor, delta);
  }
_updateAttack(delta) {
  const attackRange = this._config.attackRange ?? 1.5;

  if (this._distToPlayer() > attackRange * 1.4) {
    this._state = STATE.CHASE;
    return;
  }
  this._attackTimer -= delta;

  // ── Señal de parry cuando faltan 0.5s ────────────────────────────────
  if (this._attackTimer <= 0.5 && this._attackTimer > 0) {
    window._parry?.signalAttack?.(this);
  }

  if (this._attackTimer <= 0) {
    this._attackTimer = this._config.attackCooldown ?? 1.5;
    const target = this._getActiveTarget();
    // Si el parry intercepta, cancelar daño
    const parried = window._parry?.interceptDamage?.(this) ?? false;
    if (!parried) target.takeDamage?.(this._config.damage ?? 8);
    this._onAttackVFX?.();
  }
  this._lookAt(this._getActivePosition());
}
  

  _flash() {
    for (const mat of this._materials) mat.color.setHex(0xffffff);
    setTimeout(() => {
      if (!this.dead) this._restoreColors();
    }, 110);
  }

  _restoreColors() {}

  _startDeath() {
    this.dead        = true;
    this._dying      = true;
    this._dyingTimer = this._config.deathDuration ?? 700;
    this._state      = STATE.DEAD;
    this._onDrop?.();
    if (this.onDeath) this.onDeath();
  }
  _onDrop() {
  const drops = this._config.drops ?? {};

  // Drops legacy — materiales de construcción
  if (drops.madera)      window._building?.addMaterial?.('madera',  drops.madera);
  if (drops.piedra)      window._building?.addMaterial?.('piedra',  drops.piedra);
  if (drops.hierro)      window._building?.addMaterial?.('hierro',  drops.hierro);
  if (drops.magicEnergy) window._prog?.addMagicEnergy?.(drops.magicEnergy);
  if (drops.xp)          window._prog?.addXP?.(window._combat?._weaponType ?? 'katana', drops.xp);

  // Drops de inventario por tabla
  if (window._inventory && window._itemDrops) {
    const { rollDrops, ITEMS } = window._itemDrops;
    const enemyType = this.constructor.name;
    const rolled = rollDrops(enemyType);
    for (const drop of rolled) {
      const itemDef = ITEMS[drop.id];
      if (!itemDef) continue;
      window._inventory.addItem({ ...itemDef, qty: drop.qty });
      window._inventory.showDropNotification?.(itemDef.name, drop.qty, itemDef.icon);
      // Sincronizar materiales al building system también
      if (itemDef.section === 'materiales') {
        window._building?.addMaterial?.(drop.id, drop.qty);
      }
    }
  }

  // Drops de moneda
  if (window._currency && window._itemDrops?.rollCurrency) {
    const { rollCurrency } = window._itemDrops;
    const enemyType = this.constructor.name;
    const { monedas, oro } = rollCurrency(enemyType);
    if (monedas > 0) window._currency.addMonedas(monedas);
    if (oro > 0) {
      window._currency.addOro(oro);
      window._inventory?.showDropNotification?.('Oro', oro, '🥇');
    }
  }
  }
  
  

  _updateDeathAnim(delta) {
    if (!this.mesh) return;
    this._dyingTimer -= delta * 1000;
    this.mesh.position.y -= delta * 1.0;
    this.mesh.scale.setScalar(Math.max(0, this._dyingTimer / (this._config.deathDuration ?? 700)));
    if (this._dyingTimer <= 0) {
      this._dying = false;
      this.scene.remove(this.mesh);
      this.mesh = null;
      this._respawnTimer = this._config.respawnTime ?? 45;
    }
  }

  _respawn() {
    this.hp     = this.maxHp;
    this.dead   = false;
    this._dying = false;
    this._state = STATE.ROAM;
    this._buildMesh(this._spawnPos);
    this.scene.add(this.mesh);
  }

  _moveTo(target, speed, delta) {
    if (!this.mesh) return;
    const dx   = target.x - this.mesh.position.x;
    const dz   = target.z - this.mesh.position.z;
    const dist = Math.sqrt(dx*dx + dz*dz);
    if (dist < 0.05) return;
    const step = Math.min(speed * delta, dist);
    this.mesh.position.x += (dx/dist) * step;
    this.mesh.position.z += (dz/dist) * step;
    this._lookAt(target);
  }

  _lookAt(target) {
    if (!this.mesh) return;
    const dx = target.x - this.mesh.position.x;
    const dz = target.z - this.mesh.position.z;
    if (Math.abs(dx) > 0.01 || Math.abs(dz) > 0.01) {
      this.mesh.rotation.y = Math.atan2(dx, dz);
    }
  }

  _distTo(target) {
    if (!this.mesh) return Infinity;
    const dx = target.x - this.mesh.position.x;
    const dz = target.z - this.mesh.position.z;
    return Math.sqrt(dx*dx + dz*dz);
  }

  _distToPlayer() {
    if (!this.mesh) return Infinity;
    return this._distTo(this._getActivePosition());
  }
}
