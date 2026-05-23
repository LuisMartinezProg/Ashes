// core/companion.js — Mika | Ashes of the Reborn | Valiant Gaming
import * as THREE from 'three';
import { SkillSystem } from './skillSystem.js';

const MOVE_SPEED   = 4.5;
const FOLLOW_DIST  = 3.5;  // distancia a la que sigue al jugador
const ATTACK_RANGE = 12.0; // rango para atacar enemigos
const GROUND_Y     = 0.0;

export class Companion {
  constructor(scene, playerPosition) {
    this.scene       = scene;
    this.hp          = 80;
    this.maxHp       = 80;
    this.facingAngle = 0;
    this._moveDir    = new THREE.Vector3();
    this._attackTimer = 0;
    this._enemies    = [];
    this.isActive    = false; // true = controlado por jugador

    // Referencia a posición del jugador para IA
    this._playerPos  = playerPosition;

    this.root = new THREE.Group();
    // Spawnea cerca del jugador
    this.root.position.set(
      playerPosition.x + 1.5,
      GROUND_Y,
      playerPosition.z + 1.5
    );
    scene.add(this.root);
    this.root.visible = false;
    this._buildMesh();

    // Su propio SkillSystem con arco
    this.skillSystem = new SkillSystem(scene, this.root.position);
    this.activeSubtype = 'precision'; // subtipo activo de Mika
    this.activeSkillId = 'piercing_shot'; // habilidad activa

    // Callbacks
    this.onDamage      = null;
    this.onSkillCast   = null; // (skillId, element) — para partyManager
  }

  _buildMesh() {
    // Mika — esfera rosa/coral con aura
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

    // Indicador de nombre flotante
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

  // Llamado desde partyManager al cambiar a Mika
  activate() {
    this.isActive = true;
    this.bodyMesh.material.emissiveIntensity = 0.9;
  }

  // Llamado al cambiar de vuelta al protagonista
  deactivate() {
    this.isActive = false;
    this.bodyMesh.material.emissiveIntensity = 0.5;
  }

  registerEnemies(list) {
    this._enemies = list;
    this.skillSystem.registerEnemies(list);
  }

  // Lanza la habilidad activa de Mika (llamado por partyManager o jugador)
  castSkill() {
    const result = this.skillSystem.castSkill(this.activeSkillId);
    if (result && this.onSkillCast) {
      this.onSkillCast(this.activeSkillId, this.activeSubtype);
    }
    return result;
  }

  setActiveSkill(skillId, subtype) {
    this.activeSkillId  = skillId;
    this.activeSubtype  = subtype;
  }

  takeDamage(amount) {
    this.hp = Math.max(0, this.hp - amount);
    if (this.onDamage) this.onDamage(this.hp, this.maxHp);
  }

  heal(amount) {
    this.hp = Math.min(this.maxHp, this.hp + amount);
    if (this.onDamage) this.onDamage(this.hp, this.maxHp);
  }

  get position() { return this.root.position; }
get chestPosition() {
  return new THREE.Vector3(
    this.root.position.x,
    this.root.position.y + 0.8,
    this.root.position.z
  );
}
  // ── Update ────────────────────────────────────────────────────────────────
  update(delta, joystickInput, camera) {
    if (this.isActive) {
      this._updateControlled(delta, joystickInput, camera);
    } else {
      this._updateAI(delta);
    }

    // Bob flotante
    const t = performance.now() * 0.001;
    this.bodyMesh.position.y = 0.6 + Math.sin(t * 2.0 + 1.5) * 0.06;

    // Actualizar SkillSystem
    this.skillSystem.update(delta);

    // Actualizar nametag
    this._updateNameTag(camera);
  }

  // Controlado por el jugador — mismo sistema que player.js
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
        this.root.position.addScaledVector(this._moveDir, MOVE_SPEED * Math.min(len, 1) * delta);
        this.root.position.y = GROUND_Y;

        const targetAngle = Math.atan2(this._moveDir.x, this._moveDir.z);
        let diff = targetAngle - this.facingAngle;
        while (diff >  Math.PI) diff -= Math.PI * 2;
        while (diff < -Math.PI) diff += Math.PI * 2;
        this.facingAngle += diff * Math.min(8 * delta, 1);
        this.root.rotation.y = this.facingAngle;
      }
    }
  }

  // IA — sigue al jugador y ataca enemigos cercanos
  _updateAI(delta) {
    const px = this._playerPos.x;
    const pz = this._playerPos.z;
    const dx = px - this.root.position.x;
    const dz = pz - this.root.position.z;
    const distToPlayer = Math.sqrt(dx*dx + dz*dz);

    // Seguir al jugador si está lejos
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

    // Atacar enemigo más cercano automáticamente
    this._attackTimer -= delta;
    if (this._attackTimer <= 0) {
      const target = this._findNearestEnemy();
      if (target) {
        this.castSkill();
        this._attackTimer = 3.5; // ataca cada 3.5s en IA
      } else {
        this._attackTimer = 1.0;
      }
    }
  }

  _findNearestEnemy() {
    let closest = null, minDist = Infinity;
    for (const e of this._enemies) {
      if (e.isDead?.() || !e.mesh) continue;
      const dx = this.root.position.x - e.mesh.position.x;
      const dz = this.root.position.z - e.mesh.position.z;
      const d  = Math.sqrt(dx*dx + dz*dz);
      if (d < minDist && d <= ATTACK_RANGE) { minDist = d; closest = e; }
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
  }
          }
