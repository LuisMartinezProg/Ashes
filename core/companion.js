// core/companion.js — Mika | Ashes of the Reborn | Valiant Gaming
import * as THREE from 'three';
import { SkillSystem } from './skillSystem.js';
import { BowWeapon   } from './weapons/bow.js';

const MOVE_SPEED   = 4.5;
const SPRINT_SPEED = 8.0;
const FOLLOW_DIST  = 3.5;
const ATTACK_RANGE = 12.0;
const GROUND_Y     = 0.0;

const JUMP_FORCE = 7.0;
const GRAVITY    = -18.0;

export class Companion {
  constructor(scene, playerPosition) {
    this.scene        = scene;
    this.facingAngle  = 0;
    this._moveDir     = new THREE.Vector3();
    this._attackTimer = 0;
    this._enemies     = [];
    this.isActive     = false;
    this._sprinting   = false;
    this._playerPos   = playerPosition;

    this._velocityY   = 0;
    this._onGround    = true;
    this._jumpLocked  = false;
    this._attacking   = false;
    this._bowCombo    = 0;

    const mikaStats = window._mikaProgression?.getStats?.() ?? { maxHp: 80 };
    this.maxHp      = mikaStats.maxHp;
    this.hp         = this.maxHp;

    this.root = new THREE.Group();
    this.root.position.set(
      playerPosition.x + 1.5,
      GROUND_Y,
      playerPosition.z + 1.5
    );
    scene.add(this.root);
    this.root.visible = false;
    this._buildMesh();

    this.skillSystem   = new SkillSystem(scene, this.root);
    this.activeSubtype = 'precision';
    this.activeSkillId = 'piercing_shot';

    this._bow = new BowWeapon(this.root);
    this._bow.setScene(scene);

    this.onDamage    = null;
    this.onSkillCast = null;
  }

  getStats() {
    return window._mikaProgression?.getStats?.() ?? {
      maxHp: this.maxHp,
      atk  : 7,
      def  : 3,
      speed: 6,
      range: 8,
    };
  }

  syncStatsFromProgression() {
    const stats   = this.getStats();
    const prevMax = this.maxHp;
    this.maxHp    = stats.maxHp;
    if (this.maxHp > prevMax) {
      this.hp = Math.min(this.hp + (this.maxHp - prevMax), this.maxHp);
    }
    this.hp = Math.min(this.hp, this.maxHp);
    if (this.onDamage) this.onDamage(this.hp, this.maxHp);
  }

  _buildMesh() {
    const mat = new THREE.MeshStandardMaterial({
      color            : 0xff88aa,
      transparent      : true,
      opacity          : 0.85,
      emissive         : 0xff4488,
      emissiveIntensity: 0.5,
      roughness        : 0.1,
      metalness        : 0.0,
    });

    const sphere = new THREE.Mesh(new THREE.SphereGeometry(0.35, 16, 16), mat);
    sphere.position.y = 0.6;
    this.root.add(sphere);

    const halo = new THREE.Mesh(
      new THREE.SphereGeometry(0.52, 12, 12),
      new THREE.MeshBasicMaterial({ color: 0xff88aa, transparent: true, opacity: 0.12 })
    );
    halo.position.y = 0.6;
    this.root.add(halo);

    this._nameTag = document.createElement('div');
    Object.assign(this._nameTag.style, {
      position     : 'fixed',
      fontFamily   : 'monospace',
      fontSize     : '9px',
      color        : '#ff88aa',
      pointerEvents: 'none',
      zIndex       : '95',
      textShadow   : '0 1px 3px #000',
      letterSpacing: '1px',
      display      : 'none',
    });
    this._nameTag.textContent = 'MIKA';
    document.body.appendChild(this._nameTag);

    this.bodyMesh = sphere;
  }

  activate()   { this.isActive = true;  this.bodyMesh.material.emissiveIntensity = 0.9; }
  deactivate() { this.isActive = false; this.bodyMesh.material.emissiveIntensity = 0.5; }

  setSprinting(val) { this._sprinting = !!val; }
  isSprinting()     { return this._sprinting; }

  jump() {
    if (!this._onGround || this._jumpLocked) return;
    this._velocityY  = JUMP_FORCE;
    this._onGround   = false;
    this._jumpLocked = true;
    setTimeout(() => { this._jumpLocked = false; }, 400);
  }

  registerEnemies(list) {
    this._enemies = list;
    this.skillSystem.registerEnemies(list);
  }

  attackBasic() {
    if (this._attacking) return;
    this._attacking = true;
    this._bow.execute(this._bowCombo, this._enemies);
    this._bowCombo = (this._bowCombo + 1) % 2;
    setTimeout(() => { this._attacking = false; }, this._bow.getAnimDuration(this._bowCombo));
  }

  castSkill() {
    const result = this.skillSystem.castSkill(this.activeSkillId);
    if (result && this.onSkillCast) {
      this.onSkillCast(this.activeSkillId, this.activeSubtype);
    }
    return result;
  }

  setActiveSkill(skillId, subtype) {
    this.activeSkillId = skillId;
    this.activeSubtype = subtype;
  }

  takeDamage(amount) {
    const def    = this.getStats().def ?? 3;
    const actual = Math.max(1, amount - Math.floor(def * 0.5));
    this.hp      = Math.max(0, this.hp - actual);
    if (this.onDamage) this.onDamage(this.hp, this.maxHp);
  }

  heal(amount) {
    this.hp = Math.min(this.maxHp, this.hp + amount);
    if (this.onDamage) this.onDamage(this.hp, this.maxHp);
  }

  get position()      { return this.root.position; }
  get chestPosition() {
    return new THREE.Vector3(
      this.root.position.x,
      this.root.position.y + 1.2,
      this.root.position.z
    );
  }

  update(delta, joystickInput, camera) {
    if (!this._onGround) {
      this._velocityY += GRAVITY * delta;
      this.root.position.y += this._velocityY * delta;
      if (this.root.position.y <= GROUND_Y) {
        this.root.position.y = GROUND_Y;
        this._velocityY      = 0;
        this._onGround       = true;
      }
    }

    if (this.isActive) {
      this._updateControlled(delta, joystickInput, camera);
    } else {
      this._updateAI(delta);
    }

    if (this._onGround) {
      const t = performance.now() * 0.001;
      this.bodyMesh.position.y = 0.6 + Math.sin(t * 2.0 + 1.5) * 0.06;
    }

    this.skillSystem.update(delta);
    this._bow.update(delta, this._enemies);
    this._updateNameTag(camera);
  }

  _updateControlled(delta, joystickInput, camera) {
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
        const spd   = this.getStats().speed ?? MOVE_SPEED;
        const speed = ((this._sprinting ? spd * 1.8 : spd) * Math.min(len, 1)) * delta;
        this.root.position.addScaledVector(this._moveDir, speed);

        if (this._onGround) this.root.position.y = GROUND_Y;

        if (this._sprinting) {
          const player = window._player;
          if (player) {
            player.stamina -= 18 * delta;
            player._staminaTimer = 1.5;
            if (player.stamina <= 0) {
              player.stamina  = 0;
              this._sprinting = false;
            }
            player.onStaminaUpdate?.(player.stamina, player.maxStamina);
          }
        }

        const targetAngle = Math.atan2(this._moveDir.x, this._moveDir.z);
        let diff = targetAngle - this.facingAngle;
        while (diff >  Math.PI) diff -= Math.PI * 2;
        while (diff < -Math.PI) diff += Math.PI * 2;
        this.facingAngle += diff * Math.min(8 * delta, 1);
        this.root.rotation.y = this.facingAngle;
      }
    }
  }

  _updateAI(delta) {
    const px = this._playerPos.x;
    const pz = this._playerPos.z;
    const dx = px - this.root.position.x;
    const dz = pz - this.root.position.z;
    const distToPlayer = Math.sqrt(dx*dx + dz*dz);

    if (distToPlayer > FOLLOW_DIST) {
      const speed = Math.min(MOVE_SPEED * delta, distToPlayer - FOLLOW_DIST + 0.01);
      const nx = dx / distToPlayer;
      const nz = dz / distToPlayer;
      this.root.position.x += nx * speed;
      this.root.position.z += nz * speed;
      this.root.position.y  = GROUND_Y;

      const targetAngle = Math.atan2(nx, nz);
      let diff = targetAngle - this.facingAngle;
      while (diff >  Math.PI) diff -= Math.PI * 2;
      while (diff < -Math.PI) diff += Math.PI * 2;
      this.facingAngle += diff * Math.min(6 * delta, 1);
      this.root.rotation.y = this.facingAngle;
    }

    this._attackTimer -= delta;
    if (this._attackTimer <= 0) {
      const target = this._findNearestEnemy();
      if (target) {
        this.castSkill();
        this._attackTimer = 3.5;
      } else {
        this._attackTimer = 1.0;
      }
    }
  }

  _findNearestEnemy() {
    let closest = null, minDist = Infinity;
    const range = this.getStats().range ?? ATTACK_RANGE;
    for (const e of this._enemies) {
      if (e.isDead?.() || !e.mesh) continue;
      const dx = this.root.position.x - e.mesh.position.x;
      const dz = this.root.position.z - e.mesh.position.z;
      const d  = Math.sqrt(dx*dx + dz*dz);
      if (d < minDist && d <= range) { minDist = d; closest = e; }
    }
    return closest;
  }

  _updateNameTag(camera) {
    if (!camera || !this.root.visible) {
      this._nameTag.style.display = 'none';
      return;
    }
    const pos = this.root.position.clone().add(new THREE.Vector3(0, 1.8, 0));
    pos.project(camera);
    if (pos.z > 1) { this._nameTag.style.display = 'none'; return; }
    const x = (pos.x *  0.5 + 0.5) * window.innerWidth;
    const y = (pos.y * -0.5 + 0.5) * window.innerHeight;
    this._nameTag.style.left    = `${x - 16}px`;
    this._nameTag.style.top     = `${y}px`;
    this._nameTag.style.display = 'block';
  }

  destroy() {
    this.scene.remove(this.root);
    this._nameTag.remove();
    this._bow.destroy();
  }
}
