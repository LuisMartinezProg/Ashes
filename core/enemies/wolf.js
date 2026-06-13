// core/enemies/wolf.js — Lobo del bosque
import * as THREE from 'three';
import { BaseEnemy, STATE } from './BaseEnemy.js';

export class Wolf extends BaseEnemy {
  constructor(scene, position, player) {
    super(scene, position, player, {
      hp            : 30,
      damage        : 6,
      attackRange   : 2.5,
      detectRange   : 8,
      chaseSpeed    : 5.5,
      roamSpeed     : 1.5,
      attackCooldown: 1.5,
      deathDuration : 600,
      respawnTime   : 60,
    });
    this._fleeTarget = null;
  }

  _buildMesh(pos) {
    this.mesh = new THREE.Group();
    const bodyMat = new THREE.MeshStandardMaterial({ color: 0x5A4A3A, roughness: 0.9 });
    const headMat = new THREE.MeshStandardMaterial({ color: 0x6A5A4A, roughness: 0.9 });
    const earMat  = new THREE.MeshStandardMaterial({ color: 0x5A4A3A });

    const body = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.4, 1.2), bodyMat);
    body.position.y = 0.5;
    this.mesh.add(body);

    const head = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.35, 0.4), headMat);
    head.position.set(0, 0.65, 0.55);
    this.mesh.add(head);

    const earGeo = new THREE.ConeGeometry(0.08, 0.18, 4);
    [-0.12, 0.12].forEach(ex => {
      const ear = new THREE.Mesh(earGeo, earMat);
      ear.position.set(ex, 0.88, 0.5);
      this.mesh.add(ear);
    });

    const tail = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.03, 0.5, 5), bodyMat);
    tail.position.set(0, 0.7, -0.6);
    tail.rotation.x = Math.PI * 0.3;
    this.mesh.add(tail);

    this.mesh.position.set(pos.x, 0, pos.z);
    this._materials = [bodyMat, headMat];
  }

  _restoreColors() {
    this._materials[0]?.color.setHex(0x5A4A3A);
    this._materials[1]?.color.setHex(0x6A5A4A);
  }

  flee(fromPos) {
    this._state = 'flee';
    const dx  = this.mesh.position.x - fromPos.x;
    const dz  = this.mesh.position.z - fromPos.z;
    const len = Math.sqrt(dx*dx + dz*dz) || 1;
    this._fleeTarget = new THREE.Vector3(
      this.mesh.position.x + (dx/len) * 30,
      0,
      this.mesh.position.z + (dz/len) * 30
    );
  }

  startRoaming() {
    this._state      = STATE.ROAM;
    this._fleeTarget = null;
  }

  update(delta) {
    if (!this.mesh && this.dead) {
      this._respawnTimer -= delta;
      if (this._respawnTimer <= 0) this._respawn();
      return;
    }
    if (!this.mesh || this.dead) return;
    if (this._dying) { this._updateDeathAnim(delta); return; }

    if (this._state === 'flee') {
      if (!this._fleeTarget) { this._state = STATE.ROAM; return; }
      const dist = this._distTo(this._fleeTarget);
      if (dist < 2) { this._state = STATE.ROAM; return; }
      this._moveTo(this._fleeTarget, 5.5, delta);
      return;
    }

    super.update(delta);
  }
}
