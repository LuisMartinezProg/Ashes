/**
 * player.js — Alma del protagonista
 * Ashes of the Reborn | Valiant Gaming
 */

import * as THREE from 'three';

const MOVE_SPEED     = 5.0;
const SPRINT_SPEED   = 9.0;
const TURN_SPEED     = 8.0;
const GROUND_Y       = 0.0;

const STAMINA_MAX    = 100;
const STAMINA_SPRINT = 18;
const STAMINA_REGEN  = 25;
const STAMINA_DELAY  = 1.5;

const JUMP_FORCE     = 7.0;
const GRAVITY        = -18.0;

export class Player {
  constructor(scene) {
    this.scene       = scene;
    this.velocity    = new THREE.Vector3();
    this.facingAngle = 0;
    this.hp          = 100;
    this.maxHp       = 100;
    this._moveDir    = new THREE.Vector3();
    this._sprinting  = false;

    this.stamina       = STAMINA_MAX;
    this.maxStamina    = STAMINA_MAX;
    this._staminaTimer = 0;
    this.onStaminaUpdate = null;

    this._velocityY  = 0;
    this._onGround   = true;
    this._jumpLocked = false;

    this.root = new THREE.Group();
    this.root.position.set(0, GROUND_Y, -20);
    scene.add(this.root);

    this._buildMesh();
  }

  setSprinting(val) {
    if (val && this.stamina <= 0) return;
    this._sprinting = !!val;
  }

  isSprinting() { return this._sprinting; }

  jump() {
    if (!this._onGround || this._jumpLocked) return;
    this._velocityY  = JUMP_FORCE;
    this._onGround   = false;
    this._jumpLocked = true;
    setTimeout(() => { this._jumpLocked = false; }, 400);
  }

  _buildMesh() {
    const mat = new THREE.MeshStandardMaterial({
      color            : 0xffffff,
      transparent      : true,
      opacity          : 0.85,
      emissive         : 0xaaccff,
      emissiveIntensity: 0.6,
      roughness        : 0.1,
      metalness        : 0.0,
    });

    const sphere = new THREE.Mesh(new THREE.SphereGeometry(0.35, 16, 16), mat);
    sphere.position.y = 0.6;
    this.root.add(sphere);

    const halo = new THREE.Mesh(
      new THREE.SphereGeometry(0.52, 12, 12),
      new THREE.MeshBasicMaterial({ color: 0x88aaff, transparent: true, opacity: 0.12 })
    );
    halo.position.y = 0.6;
    this.root.add(halo);

    this.bodyMesh = sphere;
    this.headMesh = sphere;
  }

  update(delta, joystickInput, camera) {
    const { dx, dy } = joystickInput;
    const moving = Math.abs(dx) > 0.01 || Math.abs(dy) > 0.01;

    if (!this._onGround) {
      this._velocityY += GRAVITY * delta;
      this.root.position.y += this._velocityY * delta;
      if (this.root.position.y <= GROUND_Y) {
        this.root.position.y = GROUND_Y;
        this._velocityY      = 0;
        this._onGround       = true;
      }
    }

    if (this._sprinting && moving) {
      this.stamina -= STAMINA_SPRINT * delta;
      this._staminaTimer = STAMINA_DELAY;
      if (this.stamina <= 0) {
        this.stamina    = 0;
        this._sprinting = false;
      }
      this.onStaminaUpdate?.(this.stamina, this.maxStamina);
    } else {
      if (this._staminaTimer > 0) {
        this._staminaTimer -= delta;
      } else if (this.stamina < this.maxStamina) {
        this.stamina = Math.min(this.maxStamina, this.stamina + STAMINA_REGEN * delta);
        this.onStaminaUpdate?.(this.stamina, this.maxStamina);
      }
    }

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

        if (this._onGround) this.root.position.y = GROUND_Y;

        const targetAngle = Math.atan2(this._moveDir.x, this._moveDir.z);
        let diff = targetAngle - this.facingAngle;
        while (diff >  Math.PI) diff -= Math.PI * 2;
        while (diff < -Math.PI) diff += Math.PI * 2;
        this.facingAngle += diff * Math.min(TURN_SPEED * delta, 1);
        this.root.rotation.y = this.facingAngle;
      }
    }

    if (this._onGround) {
      const t = performance.now() * 0.001;
      this.bodyMesh.position.y = 0.6 + Math.sin(t * 2.2) * 0.06;
    }
  }

  get position() { return this.root.position; }

  get chestPosition() {
    return this.root.position.clone().add(new THREE.Vector3(0, 1.2, 0));
  }

  takeDamage(amount) {
    const def     = window._prog?.getStats?.()?.def ?? 5;
    const reduced = Math.max(1, Math.floor(amount * (1 - def / (def + 50))));
    this.hp       = Math.max(0, this.hp - reduced);
    if (this.onDamage) this.onDamage(this.hp, this.maxHp);
  }

  destroy() {
    this.scene.remove(this.root);
  }
}
