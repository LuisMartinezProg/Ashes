// core/enemies/Firefly.js — Luciérnaga gigante del bosque
import * as THREE from 'three';
import { BaseEnemy, STATE } from './BaseEnemy.js';

export class Firefly extends BaseEnemy {
  constructor(scene, position, player) {
    super(scene, position, player, {
      hp           : 25,
      damage       : 5,
      roamSpeed    : 2.5,
      chaseSpeed   : 4.5,
      detectRange  : 8,
      attackRange  : 2.0,
      attackCooldown: 2.0,
      respawnTime  : 30,
      drops        : { magicEnergy: 8, xp: 20 },
    });
    this._floatOffset = Math.random() * Math.PI * 2;
  }

  _buildMesh(pos) {
    this.mesh = new THREE.Group();

    // Cuerpo brillante
    const bodyMat = new THREE.MeshStandardMaterial({
      color: 0xFFDD00, emissive: 0xFFAA00, emissiveIntensity: 0.8,
      roughness: 0.2,
    });
    const body = new THREE.Mesh(new THREE.SphereGeometry(0.22, 8, 8), bodyMat);
    body.position.y = 1.2;
    this.mesh.add(body);

    // Alas translúcidas
    const wingMat = new THREE.MeshBasicMaterial({
      color: 0xAAFFFF, transparent: true, opacity: 0.4, side: THREE.DoubleSide,
    });
    [[-0.4, 0.1], [0.4, -0.1]].forEach(([wx, rot]) => {
      const wing = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.25), wingMat);
      wing.position.set(wx, 1.2, 0);
      wing.rotation.y = rot;
      this.mesh.add(wing);
    });

    // Luz puntual
    this._light = new THREE.PointLight(0xFFDD00, 1.5, 4);
    this._light.position.set(pos.x, 1.4, pos.z);
    this.scene.add(this._light);

    this.mesh.position.set(pos.x, 0, pos.z);
    this._materials = [bodyMat];
  }

  update(delta) {
    super.update(delta);
    // Flotar
    if (this.mesh) {
      this._floatOffset += delta * 2.5;
      this.mesh.position.y = Math.sin(this._floatOffset) * 0.3;
      if (this._light) {
        this._light.position.copy(this.mesh.position);
        this._light.position.y += 1.4;
      }
    }
  }

  _restoreColors() {
    this._materials[0]?.color.setHex(0xFFDD00);
    this._materials[0]?.emissive?.setHex(0xFFAA00);
  }

  _startDeath() {
    if (this._light) this.scene.remove(this._light);
    super._startDeath();
  }
}
