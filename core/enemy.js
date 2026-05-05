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

const SPAWN_POINTS = [
  { x:  12, z:  5  },
  { x: -11, z:  6  },
  { x:   8, z: -12 },
  { x: -10, z: -10 },
  { x:   0, z:  15 },
];

// ── ESTADOS ──────────────────────────────────────────────────────────────────
const STATE = {
  PATROL:  'patrol',
  CHASE:   'chase',
  ATTACK:  'attack',
  WAITING: 'waiting',
  DEAD:    'dead',
};

export class Enemy {
  constructor(scene, position = { x: 0, z: 0 }, player = null) {
    this.scene   = scene;
    this.player  = player;
    this.hp      = ENEMY_MAX_HP;
    this.maxHp   = ENEMY_MAX_HP;
    this.dead    = false;
    this.hudBar  = null;

    // ── Estado ──────────────────────────────────────────────────────────────
    this._state       = STATE.PATROL;
    this._attackTimer = 0;
    this._waitTimer   = 0;

    // ── Waypoints de patrulla (triángulo alrededor del spawn) ────────────────
    const ox = position.x;
    const oz = position.z;
    this._waypoints = [
      new THREE.Vector3(ox,       0, oz      ),
      new THREE.Vector3(ox + 3,   0, oz + 2  ),
      new THREE.Vector3(ox - 2,   0, oz + 3.5),
    ];
    this._waypointIdx = 0;

    // ── Mesh ────────────────────────────────────────────────────────────────
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

    this._materials    = [bodyMat, headMat];
    this._flashTimeout = null;
    this._dying        = false;
    this._dyingTimer   = 0;

    scene.add(this.mesh);
  }

  // ── API pública ──────────────────────────────────────────────────────────

  isDead() { return this.dead; }

  takeDamage(amount) {
    if (this.dead) return;
    this.hp = Math.max(0, this.hp - amount);
    if (this.hudBar) this.hudBar.update(this.hp, this.maxHp);
    this._flashDamage();
    if (this.hp <= 0) this._startDeath();
  }

  update(delta) {
    if (this._dying) { this._updateDeathAnim(delta); return; }
    if (this.dead)   return;

    switch (this._state) {
      case STATE.PATROL:  this._updatePatrol(delta);  break;
      case STATE.WAITING: this._updateWaiting(delta); break;
      case STATE.CHASE:   this._updateChase(delta);   break;
      case STATE.ATTACK:  this._updateAttack(delta);  break;
    }
  }

  // ── Estados ──────────────────────────────────────────────────────────────

  _updatePatrol(delta) {
    const target = this._waypoints[this._waypointIdx];
    const dist   = this._distTo(target);

    if (dist < 0.3) {
      this._waypointIdx = (this._waypointIdx + 1) % this._waypoints.length;
      this._state      = STATE.WAITING;
      this._waitTimer  = PATROL_WAIT;
      return;
    }

    this._moveTo(target, PATROL_SPEED, delta);

    if (this._playerInRange(DETECT_RANGE)) {
      this._state = STATE.CHASE;
    }
  }

  _updateWaiting(delta) {
    this._waitTimer -= delta;

    if (this._playerInRange(DETECT_RANGE)) {
      this._state = STATE.CHASE;
      return;
    }

    if (this._waitTimer <= 0) {
      this._state = STATE.PATROL;
    }
  }

  _updateChase(delta) {
    if (!this.player) return;

    const playerPos = this.player.mesh.position;

    if (!this._playerInRange(DETECT_RANGE * 1.5)) {
      this._state = STATE.PATROL;
      return;
    }

    if (this._playerInRange(ATTACK_RANGE)) {
      this._state       = STATE.ATTACK;
      this._attackTimer = 0;
      return;
    }

    this._moveTo(playerPos, CHASE_SPEED, delta);
  }

  _updateAttack(delta) {
    if (!this.player) return;

    if (!this._playerInRange(ATTACK_RANGE * 1.3)) {
      this._state = STATE.CHASE;
      return;
    }

    this._attackTimer -= delta;

    if (this._attackTimer <= 0) {
      this._attackTimer = ATTACK_COOLDOWN;
      this._doAttack();
    }

    // Mirar al jugador mientras ataca
    const playerPos = this.player.mesh.position;
    this._lookAt(playerPos);
  }

  _doAttack() {
    if (!this.player || this.player.isDead?.()) return;
    this.player.takeDamage(ATTACK_DAMAGE);

    // Flash rojo en el enemigo al atacar
    for (const mat of this._materials) mat.color.setHex(0xff6600);
    setTimeout(() => {
      if (!this.dead) {
        this._materials[0].color.setHex(0xcc2222);
        this._materials[1].color.setHex(0xdd3333);
      }
    }, 80);
  }

  // ── Movimiento ───────────────────────────────────────────────────────────

  _moveTo(target, speed, delta) {
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
    const dx = target.x - this.mesh.position.x;
    const dz = target.z - this.mesh.position.z;
    if (Math.abs(dx) > 0.01 || Math.abs(dz) > 0.01) {
      this.mesh.rotation.y = Math.atan2(dx, dz);
    }
  }

  _distTo(target) {
    const dx = target.x - this.mesh.position.x;
    const dz = target.z - this.mesh.position.z;
    return Math.sqrt(dx*dx + dz*dz);
  }

  _playerInRange(range) {
    if (!this.player) return false;
    return this._distTo(this.player.mesh.position) <= range;
  }

  // ── Daño / Muerte ────────────────────────────────────────────────────────

  _flashDamage() {
    clearTimeout(this._flashTimeout);
    for (const mat of this._materials) mat.color.setHex(0xffffff);
    this._flashTimeout = setTimeout(() => {
      if (!this.dead) {
        this._materials[0].color.setHex(0xcc2222);
        this._materials[1].color.setHex(0xdd3333);
      }
    }, 120);
  }

  _startDeath() {
    this.dead        = true;
    this._dying      = true;
    this._dyingTimer = DEATH_DURATION;
    this._state      = STATE.DEAD;
    for (const mat of this._materials) mat.color.setHex(0x440000);
  }

  _updateDeathAnim(delta) {
    this._dyingTimer -= delta * 1000;
    this.mesh.position.y -= delta * 1.2;
    const t = Math.max(0, this._dyingTimer / DEATH_DURATION);
    this.mesh.scale.setScalar(t);
    if (this._dyingTimer <= 0) {
      this._dying = false;
      this.scene.remove(this.mesh);
    }
  }
}

// ── SPAWN ────────────────────────────────────────────────────────────────────

export function spawnEnemies(scene, player, customPoints = null) {
  const points = customPoints ?? SPAWN_POINTS;
  return points.map(p => new Enemy(scene, p, player));
}
