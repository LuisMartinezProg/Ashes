import * as THREE from 'three';
import { BaseEnemy } from './BaseEnemy.js';

export class ShadowCaptain extends BaseEnemy {
  constructor(scene, position, player) {
    super(scene, position, player, {
      name: 'Shadow Captain',
      hp: 350,
      damage: 38,
      defense: 20,
      roamSpeed: 1.3,
      chaseSpeed: 3.8,
      detectRange: 20,
      attackRange: 2.2,
      attackCooldown: 1.1,
      respawnTime: 90,
      isBoss: true,
      drops: { hierro: 5, magicEnergy: 40, xp: 150 }
    });
    this._materials = [];
    this._phase = 'normal';
    this._visorMat = null;
    this._capeMat  = null;
  }

  _buildMesh(pos) {
    const group = new THREE.Group();

    const armorMat  = new THREE.MeshStandardMaterial({ color: 0x080818 });
    const darkMat   = new THREE.MeshStandardMaterial({ color: 0x110022 });
    const visorMat  = new THREE.MeshStandardMaterial({ color: 0x8800ff, emissive: 0x8800ff, emissiveIntensity: 1 });
    const capeMat   = new THREE.MeshStandardMaterial({ color: 0x1a0033, side: THREE.DoubleSide });
    const bladeMat  = new THREE.MeshStandardMaterial({ color: 0x222244, emissive: 0x220044, emissiveIntensity: 0.5 });

    this._visorMat = visorMat;
    this._capeMat  = capeMat;

    // Cuerpo armado
    const body = new THREE.Mesh(new THREE.BoxGeometry(0.75, 1.3, 0.5), armorMat);
    body.position.y = 0.95;
    group.add(body);
    this._materials.push(armorMat);

    // Hombreras grandes
    [-0.55, 0.55].forEach(x => {
      const sh = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.25, 0.45), darkMat);
      sh.position.set(x, 1.45, 0);
      group.add(sh);
      // Picos en hombreras
      const spike = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.25, 4), darkMat);
      spike.position.set(x, 1.65, 0);
      group.add(spike);
    });
    this._materials.push(darkMat);

    // Capa
    const cape = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 1.4), capeMat);
    cape.position.set(0, 0.9, -0.3);
    cape.rotation.x = 0.2;
    group.add(cape);

    // Cabeza con casco
    const head = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.48, 0.48), armorMat);
    head.position.y = 1.85;
    group.add(head);

    // Cuernos del casco
    [-0.18, 0.18].forEach(x => {
      const horn = new THREE.Mesh(new THREE.ConeGeometry(0.05, 0.3, 4), darkMat);
      horn.position.set(x, 2.2, 0);
      group.add(horn);
    });

    // Visor
    const visor = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.1, 0.08), visorMat);
    visor.position.set(0, 1.88, 0.26);
    group.add(visor);

    // Espada grande oscura
    const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.4, 5),
      new THREE.MeshStandardMaterial({ color: 0x111111 }));
    handle.position.set(0.7, 0.9, 0);
    handle.rotation.z = -0.2;
    group.add(handle);

    const blade = new THREE.Mesh(new THREE.BoxGeometry(0.12, 1.6, 0.08), bladeMat);
    blade.position.set(0.75, 1.6, 0);
    blade.rotation.z = -0.2;
    group.add(blade);

    // Guardamanos
    const guard = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.1, 0.12), darkMat);
    guard.position.set(0.72, 1.1, 0);
    group.add(guard);

    group.position.set(pos.x, pos.y ?? 0, pos.z);
    this.mesh = group;
  }

  _restoreColors() {
    this._materials[0].color.setHex(0x080818);
    this._materials[1].color.setHex(0x110022);
  }

  _checkPhase2() {
    if (this._phase === 'normal' && this.hp <= this.maxHp * 0.5) {
      this._phase = 'phase2';
      this._config.chaseSpeed     *= 1.4;
      this._config.damage          = Math.floor(this._config.damage * 1.3);
      this._config.attackCooldown *= 0.75;
      if (this._visorMat) {
        this._visorMat.color.setHex(0xff0066);
        this._visorMat.emissive.setHex(0xff0066);
      }
      if (this._capeMat) {
        this._capeMat.color.setHex(0x330011);
      }
    }
  }

  update(delta) {
    super.update(delta);
    if (!this.mesh || this.dead) return;
    this._checkPhase2();
    const t = performance.now() * 0.002;
    if (this._visorMat) {
      this._visorMat.emissiveIntensity = this._phase === 'phase2'
        ? 1.0 + Math.sin(t * 5) * 0.8
        : 0.8 + Math.sin(t) * 0.3;
    }
  }
  }
