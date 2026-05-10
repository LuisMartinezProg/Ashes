// core/enemies/wolf.js — Lobo del bosque
import * as THREE from 'three';

const STATE = {
  ROAM    : 'roam',
  FLEE    : 'flee',
  ATTACK  : 'attack',
  DEAD    : 'dead',
};

export class Wolf {
  constructor(scene, position, player) {
    this.scene    = scene;
    this.player   = player;
    this.hp       = 30;
    this.maxHp    = 30;
    this.dead     = false;
    this.onDeath  = null;
    this._state   = STATE.ROAM;
    this._spawnPos = { ...position };
    this._fleeTarget = null;
    this._attackTimer = 0;
    this._roamTimer   = 0;
    this._roamTarget  = new THREE.Vector3(position.x, 0, position.z);
    this._respawnTimer = 0;
    this._dying       = false;
    this._dyingTimer  = 0;

    this._buildMesh(position);
    scene.add(this.mesh);
  }

  _buildMesh(pos) {
    this.mesh = new THREE.Group();

    // Cuerpo
    const bodyGeo = new THREE.BoxGeometry(0.7, 0.4, 1.2);
    const bodyMat = new THREE.MeshStandardMaterial({ color: 0x5A4A3A, roughness: 0.9 });
    const body    = new THREE.Mesh(bodyGeo, bodyMat);
    body.position.y = 0.5;
    this.mesh.add(body);

    // Cabeza
    const headGeo = new THREE.BoxGeometry(0.4, 0.35, 0.4);
    const headMat = new THREE.MeshStandardMaterial({ color: 0x6A5A4A, roughness: 0.9 });
    const head    = new THREE.Mesh(headGeo, headMat);
    head.position.set(0, 0.65, 0.55);
    this.mesh.add(head);

    // Orejas
    const earGeo = new THREE.ConeGeometry(0.08, 0.18, 4);
    const earMat = new THREE.MeshStandardMaterial({ color: 0x5A4A3A });
    [-0.12, 0.12].forEach(ex => {
      const ear = new THREE.Mesh(earGeo, earMat);
      ear.position.set(ex, 0.88, 0.5);
      this.mesh.add(ear);
    });

    // Cola
    const tailGeo = new THREE.CylinderGeometry(0.06, 0.03, 0.5, 5);
    const tail    = new THREE.Mesh(tailGeo, bodyMat);
    tail.position.set(0, 0.7, -0.6);
    tail.rotation.x = Math.PI * 0.3;
    this.mesh.add(tail);

    this.mesh.position.set(pos.x, 0, pos.z);
    this._materials = [bodyMat, headMat];
  }

  isDead() { return this.dead; }

  flee(fromPos) {
    this._state = STATE.FLEE;
    // Huir en dirección opuesta al oso
    const dx = this.mesh.position.x - fromPos.x;
    const dz = this.mesh.position.z - fromPos.z;
    const len = Math.sqrt(dx*dx + dz*dz) || 1;
    this._fleeTarget = new THREE.Vector3(
      this.mesh.position.x + (dx/len) * 30,
      0,
      this.mesh.position.z + (dz/len) * 30
    );
  }

  startRoaming() {
    this._state = STATE.ROAM;
    this._fleeTarget = null;
  }

  takeDamage(amount) {
    if (this.dead) return;
    this.hp = Math.max(0, this.hp - amount);
    this._flash();
    if (this.hp <= 0) this._startDeath();
  }

  update(delta) {
    if (!this.mesh && this.dead) {
      this._respawnTimer -= delta;
      if (this._respawnTimer <= 0) this._respawn();
      return;
    }
    if (!this.mesh || this.dead) return;
    if (this._dying) { this._updateDeathAnim(delta); return; }

    switch (this._state) {
      case STATE.FLEE:   this._updateFlee(delta);   break;
      case STATE.ROAM:   this._updateRoam(delta);   break;
      case STATE.ATTACK: this._updateAttack(delta); break;
    }
  }

  _updateFlee(delta) {
    if (!this._fleeTarget) return;
    const dist = this._distTo(this._fleeTarget);
    if (dist < 2) {
      this._state = STATE.ROAM;
      return;
    }
    this._moveTo(this._fleeTarget, 5.5, delta);
  }

  _updateRoam(delta) {
    // Atacar si jugador está cerca
    if (this._distToPlayer() < 2.5) {
      this._state = STATE.ATTACK;
      return;
    }

    // Nuevo punto de merodeo cada 3s
    this._roamTimer -= delta;
    if (this._roamTimer <= 0) {
      this._roamTimer = 2 + Math.random() * 3;
      this._roamTarget = new THREE.Vector3(
        this._spawnPos.x + (Math.random() - 0.5) * 16,
        0,
        this._spawnPos.z + (Math.random() - 0.5) * 16
      );
    }

    const dist = this._distTo(this._roamTarget);
    if (dist > 0.5) this._moveTo(this._roamTarget, 1.5, delta);
  }

  _updateAttack(delta) {
    if (this._distToPlayer() > 3.5) {
      this._state = STATE.ROAM;
      return;
    }
    this._attackTimer -= delta;
    if (this._attackTimer <= 0) {
      this._attackTimer = 1.5;
      this.player?.takeDamage?.(6);
      this._flash();
    }
    if (this.player) this._lookAt(this.player.root.position);
  }

  _distToPlayer() {
    if (!this.player || !this.mesh) return Infinity;
    return this._distTo(this.player.root.position);
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

  _flash() {
    for (const mat of this._materials) mat.color.setHex(0xffffff);
    setTimeout(() => {
      if (!this.dead) {
        this._materials[0]?.color.setHex(0x5A4A3A);
        this._materials[1]?.color.setHex(0x6A5A4A);
      }
    }, 100);
  }

  _startDeath() {
    this.dead    = true;
    this._dying  = true;
    this._dyingTimer = 600;
    this._state  = STATE.DEAD;
    if (this.onDeath) this.onDeath();
  }

  _updateDeathAnim(delta) {
    if (!this.mesh) return;
    this._dyingTimer -= delta * 1000;
    this.mesh.position.y -= delta * 1.0;
    this.mesh.scale.setScalar(Math.max(0, this._dyingTimer / 600));
    if (this._dyingTimer <= 0) {
      this._dying = false;
      this.scene.remove(this.mesh);
      this.mesh = null;
      this._respawnTimer = 60;
    }
  }

  _respawn() {
    this.hp    = this.maxHp;
    this.dead  = false;
    this._dying = false;
    this._state = STATE.ROAM;
    this._buildMesh(this._spawnPos);
    this.scene.add(this.mesh);
  }
              }
