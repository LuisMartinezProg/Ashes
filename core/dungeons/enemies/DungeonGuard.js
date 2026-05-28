// core/dungeons/enemies/DungeonGuard.js — Ashes of the Reborn | Valiant Gaming
import * as THREE from 'three';
import { BaseEnemy, STATE } from '../../enemies/BaseEnemy.js';

export class DungeonGuard extends BaseEnemy {
  constructor(scene, position, player) {
    super(scene, position, player, {
      hp            : 120,
      damage        : 12,
      roamSpeed     : 1.2,
      chaseSpeed    : 2.8,
      detectRange   : 10,
      attackRange   : 1.8,
      attackCooldown: 2.0,
      respawnTime   : 0,
      deathDuration : 600,
      name          : 'Guardián',
      drops         : { magicEnergy: 10, xp: 35 },
    });
    this._shieldAngle = 0;
    this._blocking    = false;
    this._blockTimer  = 0;
  }

  _buildMesh(pos) {
    this.mesh = new THREE.Group();

    // Cuerpo
    const bodyMat = new THREE.MeshStandardMaterial({
      color    : 0x556677,
      emissive : 0x223344,
      emissiveIntensity: 0.3,
      roughness: 0.4,
      metalness: 0.7,
    });
    const body = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.38, 1.1, 10), bodyMat);
    body.position.y = 0.55;
    this.mesh.add(body);

    // Cabeza con casco
    const headMat = new THREE.MeshStandardMaterial({
      color    : 0x445566,
      emissive : 0x112233,
      emissiveIntensity: 0.2,
      roughness: 0.3,
      metalness: 0.8,
    });
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.28, 10, 10), headMat);
    head.position.y = 1.38;
    this.mesh.add(head);

    // Escudo
    const shieldMat = new THREE.MeshStandardMaterial({
      color    : 0x3366aa,
      emissive : 0x112244,
      emissiveIntensity: 0.4,
      roughness: 0.3,
      metalness: 0.6,
    });
    const shield = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.75, 0.1), shieldMat);
    shield.position.set(0.55, 0.85, 0);
    this.mesh.add(shield);
    this._shieldMesh = shield;

    // Espada
    const swordMat = new THREE.MeshStandardMaterial({
      color    : 0xaabbcc,
      emissive : 0x334455,
      emissiveIntensity: 0.2,
      metalness: 0.9,
      roughness: 0.1,
    });
    const sword = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.85, 0.08), swordMat);
    sword.position.set(-0.52, 1.0, 0);
    this.mesh.add(sword);
    this._swordMesh = sword;

    // Luz tenue
    const light = new THREE.PointLight(0x3366aa, 0.8, 4);
    light.position.y = 1;
    this.mesh.add(light);
    this._light = light;

    this.mesh.position.set(pos.x, 0, pos.z);
    this._materials = [bodyMat, headMat, shieldMat, swordMat];
  }

  update(delta) {
    super.update(delta);
    if (!this.mesh || this.dead) return;

    // Rotar escudo
    this._shieldAngle += delta * 1.5;
    if (this._shieldMesh) {
      this._shieldMesh.position.x = Math.cos(this._shieldAngle) * 0.55;
      this._shieldMesh.position.z = Math.sin(this._shieldAngle) * 0.55;
    }

    // Bloqueo — reduce daño entrante temporalmente
    if (this._blocking) {
      this._blockTimer -= delta;
      if (this._blockTimer <= 0) this._blocking = false;
    }

    // Activar bloqueo aleatoriamente
    if (!this._blocking && Math.random() < delta * 0.4) {
      this._blocking   = true;
      this._blockTimer = 1.2;
      if (this._light) this._light.color.setHex(0x66aaff);
    } else if (!this._blocking && this._light) {
      this._light.color.setHex(0x3366aa);
    }
  }

  takeDamage(amount) {
    // Bloqueo reduce daño 60%
    const reduced = this._blocking ? Math.ceil(amount * 0.4) : amount;
    super.takeDamage(reduced);
    if (this._blocking) this._showBlockVFX();
  }

  _showBlockVFX() {
    const el = document.createElement('div');
    Object.assign(el.style, {
      position     : 'fixed',
      top          : '42%',
      left         : '50%',
      transform    : 'translateX(-50%)',
      fontFamily   : 'monospace',
      fontSize     : '12px',
      color        : '#66aaff',
      letterSpacing: '2px',
      pointerEvents: 'none',
      zIndex       : '300',
      opacity      : '1',
      transition   : 'opacity 0.5s, top 0.5s',
    });
    el.textContent = '🛡 BLOQUEADO';
    document.body.appendChild(el);
    requestAnimationFrame(() => requestAnimationFrame(() => {
      el.style.opacity = '0';
      el.style.top     = '36%';
    }));
    setTimeout(() => el.remove(), 600);
  }

  _restoreColors() {
    this._materials[0]?.color.setHex(0x556677);
    this._materials[1]?.color.setHex(0x445566);
    this._materials[2]?.color.setHex(0x3366aa);
    this._materials[3]?.color.setHex(0xaabbcc);
  }
}
