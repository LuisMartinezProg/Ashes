// core/enemy.js — Fase 5b | Patrulla + Detección + Ataque
import * as THREE from 'three';

const ENEMY_MAX_HP    = 80;
const DEATH_DURATION  = 800;
const PATROL_SPEED    = 1.8;
const CHASE_SPEED     = 3.2;
const DETECT_RANGE    = 6.0;
const ATTACK_RANGE    = 1.4;
const ATTACK_COOLDOWN = 1.2;
const ATTACK_DAMAGE   = 8;
const PATROL_WAIT     = 1.5;
const RESPAWN_TIME    = 30;

const SPAWN_POINTS = [
  { x:  12, z:  5  },
  { x: -11, z:  6  },
  { x:   8, z: -12 },
  { x: -10, z: -10 },
  { x:   0, z:  15 },
];

const STATE = {
  PATROL:  'patrol',
  CHASE:   'chase',
  ATTACK:  'attack',
  WAITING: 'waiting',
  DEAD:    'dead',
};

export class Enemy {
  constructor(scene, position = { x: 0, z: 0 }, player = null) {
    this.scene    = scene;
    this.player   = player;
    this.hp       = ENEMY_MAX_HP;
    this.maxHp    = ENEMY_MAX_HP;
    this.dead     = false;
    this.hudBar   = null;
    this.onDeath  = null;
    this._burnDPS    = 0;
    this._burnTimer  = 0;
    this._burnAccum  = 0;
    this._slowFactor = 1;
    this._slowTimer  = 0;
    this._spawnPos    = { x: position.x, z: position.z };
    this._state       = STATE.PATROL;
    this._attackTimer = 0;
    this._waitTimer   = 0;
    this._respawnTimer = 0;

    const ox = position.x;
    const oz = position.z;
    this._waypoints = [
      new THREE.Vector3(ox,       0, oz      ),
      new THREE.Vector3(ox + 3,   0, oz + 2  ),
      new THREE.Vector3(ox - 2,   0, oz + 3.5),
    ];
    this._waypointIdx = 0;

    this.mesh = null;
    this._materials    = [];
    this._flashTimeout = null;
    this._dying        = false;
    this._dyingTimer   = 0;

    this._buildMesh(position);
    scene.add(this.mesh);
  }

  _buildMesh(position) {
    this.mesh = new THREE.Group();

    const bodyGeo = new THREE.CylinderGeometry(0.3, 0.3, 1.0, 10);
    const bodyMat = new THREE.MeshBasicMaterial({ color: 0xcc2222 });
    const body    = new THREE.Mesh(bodyGeo, bodyMat);
    body.position.y = 0.5;

    const headGeo = new THREE.SphereGeometry(0.3, 10, 10);
    const headMat = new THREE.MeshBasicMaterial({ color: 0xdd3333 });
    const head    = new THREE.Mesh(headGeo, headMat);
    head.position.y = 1.3;

    this.mesh.add(body, head);
    this.mesh.position.set(position.x, 0, position.z);
    this._materials = [bodyMat, headMat];
  }

  isDead() { return this.dead; }

  applyBurn(dps, duration) {
    this._burnDPS   = dps;
    this._burnTimer = duration;
  }

  applySlow(factor, duration) {
    this._slowFactor = factor;
    this._slowTimer  = duration;
  }

  // ── Personaje activo ─────────────────────────────────────────────────────
  _getActiveTarget() {
    return window._partyManager?.getActiveCharacter() ?? this.player;
  }

  _getActivePosition() {
    const t = this._getActiveTarget();
    return t.root?.position ?? t.position;
  }

  takeDamage(amount) {
    if (this.dead) return;
    this.hp = Math.max(0, this.hp - amount);
    if (this.hudBar) this.hudBar.update(this.hp, this.maxHp);
    this._flashDamage();
    if (this.hp <= 0) this._startDeath();
  }

  update(delta) {
    if (!this.mesh && this.dead) {
      this._respawnTimer -= delta;
      if (this._respawnTimer <= 0) this._respawn();
      return;
    }
    if (!this.mesh)  return;
    if (this._dying) { this._updateDeathAnim(delta); return; }
    if (this.dead)   return;

    if (this._burnTimer > 0) {
      this._burnTimer -= delta;
      this._burnAccum += this._burnDPS * delta;
      if (this._burnAccum >= 1) {
        this.takeDamage(Math.floor(this._burnAccum));
        this._burnAccum = 0;
      }
      for (const mat of this._materials) mat.color.setHex(0xff6600);
      setTimeout(() => {
        if (!this.dead) {
          this._materials[0]?.color.setHex(0xcc2222);
          this._materials[1]?.color.setHex(0xdd3333);
        }
      }, 100);
      if (this._burnTimer <= 0) this._burnDPS = 0;
    }

    if (this._slowTimer > 0) {
      this._slowTimer -= delta;
      if (this._slowTimer <= 0) this._slowFactor = 1;
    }

    switch (this._state) {
      case STATE.PATROL:  this._updatePatrol(delta);  break;
      case STATE.WAITING: this._updateWaiting(delta); break;
      case STATE.CHASE:   this._updateChase(delta);   break;
      case STATE.ATTACK:  this._updateAttack(delta);  break;
    }
  }

  _updatePatrol(delta) {
    const target = this._waypoints[this._waypointIdx];
    const dist   = this._distTo(target);

    if (dist < 0.3) {
      this._waypointIdx = (this._waypointIdx + 1) % this._waypoints.length;
      this._state       = STATE.WAITING;
      this._waitTimer   = PATROL_WAIT;
      return;
    }

    this._moveTo(target, PATROL_SPEED, delta);

    if (this._distTo(this._getActivePosition()) <= DETECT_RANGE) {
      this._state = STATE.CHASE;
    }
  }

  _updateWaiting(delta) {
    this._waitTimer -= delta;

    if (this._distTo(this._getActivePosition()) <= DETECT_RANGE) {
      this._state = STATE.CHASE;
      return;
    }

    if (this._waitTimer <= 0) {
      this._state = STATE.PATROL;
    }
  }

  _updateChase(delta) {
    const activePos = this._getActivePosition();

    if (this._distTo(activePos) > DETECT_RANGE * 1.5) {
      this._state = STATE.PATROL;
      return;
    }

    if (this._distTo(activePos) <= ATTACK_RANGE) {
      this._state       = STATE.ATTACK;
      this._attackTimer = 0;
      return;
    }

    this._moveTo(activePos, CHASE_SPEED * this._slowFactor, delta);
  }

  _updateAttack(delta) {
    const activePos = this._getActivePosition();

    if (this._distTo(activePos) > ATTACK_RANGE * 1.3) {
      this._state = STATE.CHASE;
      return;
    }

    this._attackTimer -= delta;
    if (this._attackTimer <= 0) {
      this._attackTimer = ATTACK_COOLDOWN;
      this._doAttack();
    }

    this._lookAt(activePos);
  }

  _doAttack() {
    const target = this._getActiveTarget();
    if (!target) return;
    target.takeDamage?.(ATTACK_DAMAGE);

    for (const mat of this._materials) mat.color.setHex(0xff6600);
    setTimeout(() => {
      if (!this.dead) {
        this._materials[0]?.color.setHex(0xcc2222);
        this._materials[1]?.color.setHex(0xdd3333);
      }
    }, 80);
  }

  _moveTo(target, speed, delta) {
    if (!this.mesh) return;
    const pos  = this.mesh.position;
    const dx   = target.x - pos.x;
    const dz   = target.z - pos.z;
    const dist = Math.sqrt(dx*dx + dz*dz);
    if (dist < 0.01) return;
    const step = Math.min(speed * delta, dist);
    pos.x += (dx / dist) * step;
    pos.z += (dz / dist) * step;
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

  _flashDamage() {
    clearTimeout(this._flashTimeout);
    for (const mat of this._materials) mat.color.setHex(0xffffff);
    this._flashTimeout = setTimeout(() => {
      if (!this.dead) {
        this._materials[0]?.color.setHex(0xcc2222);
        this._materials[1]?.color.setHex(0xdd3333);
      }
    }, 120);
  }

  _startDeath() {
    this.dead        = true;
    this._dying      = true;
    this._dyingTimer = DEATH_DURATION;
    this._state      = STATE.DEAD;
    for (const mat of this._materials) mat.color.setHex(0x440000);
    if (this.onDeath) this.onDeath();
  }

  _updateDeathAnim(delta) {
    if (!this.mesh) return;
    this._dyingTimer -= delta * 1000;
    this.mesh.position.y -= delta * 1.2;
    const t = Math.max(0, this._dyingTimer / DEATH_DURATION);
    this.mesh.scale.setScalar(t);
    if (this._dyingTimer <= 0) {
      this._dying = false;
      this.scene.remove(this.mesh);
      this.mesh          = null;
      this._respawnTimer = RESPAWN_TIME;
    }
  }

  _respawn() {
    this.hp           = ENEMY_MAX_HP;
    this.dead         = false;
    this._dying       = false;
    this._dyingTimer  = 0;
    this._attackTimer = 0;
    this._waitTimer   = 0;
    this._waypointIdx = 0;
    this._burnAccum   = 0;
    this._state       = STATE.PATROL;
    this._buildMesh(this._spawnPos);
    this.scene.add(this.mesh);
  }
}

export function spawnEnemies(scene, player, customPoints = null) {
  const points = customPoints ?? SPAWN_POINTS;
  return points.map(p => new Enemy(scene, p, player));
}
