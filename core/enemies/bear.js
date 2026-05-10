// core/enemies/bear.js — Oso mini-jefe del bosque
import * as THREE from 'three';

const STATE = {
  IDLE   : 'idle',
  CHASE  : 'chase',
  ATTACK : 'attack',
  MAGIC  : 'magic',
  DEAD   : 'dead',
};

const BEAR_HP        = 300;
const MAGIC_HP_THRESH = 0.4; // lanza magia al 40% HP
const RESPAWN_TIME   = 300;  // 5 minutos

export class Bear {
  constructor(scene, position, player, onWolvesEvent) {
    this.scene          = scene;
    this.player         = player;
    this.onWolvesEvent  = onWolvesEvent; // callback cuando aparece el oso
    this.hp             = BEAR_HP;
    this.maxHp          = BEAR_HP;
    this.dead           = false;
    this.onDeath        = null;
    this._state         = STATE.IDLE;
    this._spawnPos      = { ...position };
    this._attackTimer   = 0;
    this._magicTimer    = 0;
    this._magicPhase    = false;
    this._dying         = false;
    this._dyingTimer    = 0;
    this._respawnTimer  = 0;
    this._activated     = false; // se activa con la cinemática

    // Proyectiles mágicos
    this._projectiles = [];

    this._buildMesh(position);
    scene.add(this.mesh);
  }

  _buildMesh(pos) {
    this.mesh = new THREE.Group();

    // Cuerpo grande
    const bodyGeo = new THREE.BoxGeometry(1.4, 1.2, 2.0);
    const bodyMat = new THREE.MeshStandardMaterial({ color: 0x3A2A1A, roughness: 0.95 });
    const body    = new THREE.Mesh(bodyGeo, bodyMat);
    body.position.y = 1.0;
    this.mesh.add(body);

    // Cabeza
    const headGeo = new THREE.SphereGeometry(0.55, 8, 8);
    const headMat = new THREE.MeshStandardMaterial({ color: 0x4A3A2A, roughness: 0.95 });
    const head    = new THREE.Mesh(headGeo, headMat);
    head.position.set(0, 1.8, 0.8);
    this.mesh.add(head);

    // Orejas
    const earGeo = new THREE.SphereGeometry(0.18, 6, 6);
    [-0.4, 0.4].forEach(ex => {
      const ear = new THREE.Mesh(earGeo, bodyMat);
      ear.position.set(ex, 2.2, 0.6);
      this.mesh.add(ear);
    });

    // Patas delanteras
    const legGeo = new THREE.BoxGeometry(0.35, 0.9, 0.35);
    [-0.5, 0.5].forEach(lx => {
      const leg = new THREE.Mesh(legGeo, bodyMat);
      leg.position.set(lx, 0.45, 0.6);
      this.mesh.add(leg);
    });

    // Patas traseras
    [-0.5, 0.5].forEach(lx => {
      const leg = new THREE.Mesh(legGeo, bodyMat);
      leg.position.set(lx, 0.45, -0.6);
      this.mesh.add(leg);
    });

    this.mesh.position.set(pos.x, 0, pos.z);
    this._materials = [bodyMat, headMat];
  }

  isDead() { return this.dead; }

  activate() {
    this._activated = true;
    this._state = STATE.CHASE;
    // Llamar evento de lobos
    if (this.onWolvesEvent) this.onWolvesEvent();
  }

  takeDamage(amount) {
    if (this.dead || !this._activated) return;
    this.hp = Math.max(0, this.hp - amount);

    // Flash
    for (const mat of this._materials) mat.color.setHex(0xffffff);
    setTimeout(() => {
      if (!this.dead) {
        this._materials[0]?.color.setHex(0x3A2A1A);
        this._materials[1]?.color.setHex(0x4A3A2A);
      }
    }, 120);

    // Activar fase mágica
    if (!this._magicPhase && this.hp / this.maxHp <= MAGIC_HP_THRESH) {
      this._magicPhase = true;
      this._state = STATE.MAGIC;
    }

    if (this.hp <= 0) this._startDeath();
  }

  update(delta) {
    if (!this.mesh && this.dead) {
      this._respawnTimer -= delta;
      if (this._respawnTimer <= 0) this._respawn();
      return;
    }
    if (!this.mesh || this.dead || !this._activated) return;
    if (this._dying) { this._updateDeathAnim(delta); return; }

    // Actualizar proyectiles
    this._updateProjectiles(delta);

    switch (this._state) {
      case STATE.CHASE:  this._updateChase(delta);  break;
      case STATE.ATTACK: this._updateAttack(delta); break;
      case STATE.MAGIC:  this._updateMagic(delta);  break;
    }
  }

  _updateChase(delta) {
    if (!this.player) return;
    const dist = this._distTo(this.player.root.position);
    if (dist < 2.2) {
      this._state = STATE.ATTACK;
      return;
    }
    this._moveTo(this.player.root.position, 2.8, delta);
  }

  _updateAttack(delta) {
    if (!this.player) return;
    const dist = this._distTo(this.player.root.position);
    if (dist > 3.0) {
      this._state = this._magicPhase ? STATE.MAGIC : STATE.CHASE;
      return;
    }
    this._attackTimer -= delta;
    if (this._attackTimer <= 0) {
      this._attackTimer = 1.8;
      this.player.takeDamage?.(18);
      // Shake visual
      for (const mat of this._materials) mat.color.setHex(0xff4400);
      setTimeout(() => {
        if (!this.dead) {
          this._materials[0]?.color.setHex(0x3A2A1A);
          this._materials[1]?.color.setHex(0x4A3A2A);
        }
      }, 150);
    }
    this._lookAt(this.player.root.position);
  }

  _updateMagic(delta) {
    if (!this.player) return;
    this._magicTimer -= delta;

    // Perseguir lento mientras lanza magia
    const dist = this._distTo(this.player.root.position);
    if (dist > 2.2) this._moveTo(this.player.root.position, 1.5, delta);

    if (this._magicTimer <= 0) {
      this._magicTimer = 2.5;
      this._shootMagic();
    }

    // Si está cerca atacar también
    if (dist < 2.2) {
      this._attackTimer -= delta;
      if (this._attackTimer <= 0) {
        this._attackTimer = 2.0;
        this.player.takeDamage?.(14);
      }
    }
  }

  _shootMagic() {
    if (!this.player || !this.mesh) return;

    const origin = this.mesh.position.clone();
    origin.y = 1.5;

    const target = this.player.root.position.clone();
    target.y = 1.0;

    const dir = target.clone().sub(origin).normalize();

    const geo = new THREE.SphereGeometry(0.2, 6, 6);
    const mat = new THREE.MeshBasicMaterial({ color: 0x8800ff });
    const proj = new THREE.Mesh(geo, mat);
    proj.position.copy(origin);

    this.scene.add(proj);
    this._projectiles.push({ mesh: proj, dir, speed: 8, life: 3 });
  }

  _updateProjectiles(delta) {
    for (let i = this._projectiles.length - 1; i >= 0; i--) {
      const p = this._projectiles[i];
      p.life -= delta;
      p.mesh.position.addScaledVector(p.dir, p.speed * delta);

      // Colisión con jugador
      if (this.player) {
        const dist = p.mesh.position.distanceTo(this.player.root.position);
        if (dist < 1.2) {
          this.player.takeDamage?.(12);
          this.scene.remove(p.mesh);
          this._projectiles.splice(i, 1);
          continue;
        }
      }

      if (p.life <= 0) {
        this.scene.remove(p.mesh);
        this._projectiles.splice(i, 1);
      }
    }
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

  _startDeath() {
    this.dead   = true;
    this._dying = true;
    this._dyingTimer = 1200;
    this._state = STATE.DEAD;

    // Limpiar proyectiles
    for (const p of this._projectiles) this.scene.remove(p.mesh);
    this._projectiles = [];

    if (this.onDeath) this.onDeath();
  }

  _updateDeathAnim(delta) {
    if (!this.mesh) return;
    this._dyingTimer -= delta * 1000;
    this.mesh.position.y -= delta * 0.8;
    this.mesh.scale.setScalar(Math.max(0, this._dyingTimer / 1200));
    if (this._dyingTimer <= 0) {
      this._dying = false;
      this.scene.remove(this.mesh);
      this.mesh = null;
      this._respawnTimer = RESPAWN_TIME;
      console.log('[Bear] Respawn en 5 minutos, posición más al norte');
    }
  }

  _respawn() {
    this.hp         = this.maxHp;
    this.dead       = false;
    this._dying     = false;
    this._magicPhase = false;
    this._activated = false;
    this._state     = STATE.IDLE;

    // Respawn más al norte
    const newPos = {
      x: this._spawnPos.x + (Math.random() - 0.5) * 20,
      z: this._spawnPos.z - 20
    };
    this._spawnPos = newPos;
    this._buildMesh(newPos);
    this.scene.add(this.mesh);
    console.log('[Bear] Respawneado más al norte');
  }
        }
