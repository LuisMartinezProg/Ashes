/**
 * player.js — Cápsula jugador + lógica de movimiento
 * Ashes of the Reborn | Valiant Gaming
 */

import * as THREE from 'three';

const MOVE_SPEED   = 5.0;
const SPRINT_SPEED = 9.0;
const TURN_SPEED   = 8.0;
const CAPSULE_H    = 1.8;
const CAPSULE_R    = 0.35;
const GROUND_Y     = 0.0;

export class Player {
  constructor(scene) {
    this.scene       = scene;
    this.velocity    = new THREE.Vector3();
    this.facingAngle = 0;
    this.hp          = 100;
    this.maxHp       = 100;
    this._moveDir    = new THREE.Vector3();
    this._sprinting  = false;

    this.root = new THREE.Group();
    this.root.position.set(0, GROUND_Y, 0);
    scene.add(this.root);

    this._buildMesh();
    this._buildDirectionArrow();
  }

  setSprinting(val) { this._sprinting = val; }

  _buildMesh() {
    const mat = new THREE.MeshStandardMaterial({
      color: 0xc8a87a, roughness: 0.6, metalness: 0.1,
    });

    const bodyGeo = new THREE.CylinderGeometry(CAPSULE_R, CAPSULE_R, CAPSULE_H - CAPSULE_R * 2, 16);
    const body    = new THREE.Mesh(bodyGeo, mat);
    body.position.y = CAPSULE_H * 0.5;
    body.castShadow = false;
    this.root.add(body);

    const headGeo = new THREE.SphereGeometry(CAPSULE_R, 16, 12);
    const head    = new THREE.Mesh(headGeo, mat);
    head.position.y = CAPSULE_H - CAPSULE_R;
    head.castShadow = false;
    this.root.add(head);

    const footGeo = new THREE.SphereGeometry(CAPSULE_R, 16, 12);
    const foot    = new THREE.Mesh(footGeo, mat);
    foot.position.y = CAPSULE_R;
    foot.castShadow = false;
    this.root.add(foot);

    this.bodyMesh = body;
    this.headMesh = head;
  }

  _buildDirectionArrow() {
    const geo = new THREE.ConeGeometry(0.12, 0.35, 8);
    const mat = new THREE.MeshStandardMaterial({
      color: 0xff9900, roughness: 0.4,
      emissive: 0xff6600, emissiveIntensity: 0.3,
    });
    this.arrow = new THREE.Mesh(geo, mat);
    this.arrow.rotation.x = Math.PI * 0.5;
    this.arrow.position.set(0, 0.8, CAPSULE_R + 0.18);
    this.root.add(this.arrow);
  }

  update(delta, joystickInput, camera) {
    const { dx, dy } = joystickInput;
    const moving = Math.abs(dx) > 0.01 || Math.abs(dy) > 0.01;

    if (moving) {
      const camFwd = new THREE.Vector3();
      camera.getWorldDirection(camFwd);
      camFwd.y = 0;
      camFwd.normalize();

      const camRight = new THREE.Vector3();
      camRight.crossVectors(camFwd, new THREE.Vector3(0, 1, 0)).normalize();

      this._moveDir.set(0, 0, 0);
      this._moveDir.addScaledVector(camRight, dx);
      this._moveDir.addScaledVector(camFwd, -dy);

      const len = this._moveDir.length();
      if (len > 0.001) {
        this._moveDir.divideScalar(len);

        const speed = (this._sprinting ? SPRINT_SPEED : MOVE_SPEED) * Math.min(len, 1);
        this.root.position.addScaledVector(this._moveDir, speed * delta);
        this.root.position.y = GROUND_Y;

        const targetAngle = Math.atan2(this._moveDir.x, this._moveDir.z);
        let diff = targetAngle - this.facingAngle;
        while (diff >  Math.PI) diff -= Math.PI * 2;
        while (diff < -Math.PI) diff += Math.PI * 2;
        this.facingAngle += diff * Math.min(TURN_SPEED * delta, 1);
        this.root.rotation.y = this.facingAngle;
      }
    }

    const t = performance.now() * 0.001;
    const bobSpeed = this._sprinting ? 3.5 : 1.8;
    const bobAmp   = this._sprinting ? 0.022 : 0.012;
    this.bodyMesh.position.y = CAPSULE_H * 0.5 + Math.sin(t * bobSpeed) * bobAmp;
  }

  get position()      { return this.root.position; }
  get chestPosition() { return this.root.position.clone().add(new THREE.Vector3(0, CAPSULE_H * 0.65, 0)); }

  takeDamage(amount) {
    this.hp = Math.max(0, this.hp - amount);
    if (this.onDamage) this.onDamage(this.hp, this.maxHp);
  }

  destroy() { this.scene.remove(this.root); }
    }
