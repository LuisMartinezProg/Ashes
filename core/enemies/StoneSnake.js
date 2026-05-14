// enemies/StoneSnake.js — Ashes of the Reborn | Valiant Gaming
import * as THREE from 'three';
import { BaseEnemy } from './BaseEnemy.js';

export class StoneSnake extends BaseEnemy {
  constructor(scene, position) {
    super(scene, position, {
      name     : 'StoneSnake',
      hp       : 80,
      maxHp    : 80,
      speed    : 1.8,
      damage   : 12,
      xpReward : 40,
      drops    : [
        { type: 'piedra', chance: 0.9, amount: 2 },
        { type: 'escama', chance: 0.5, amount: 1 },
      ],
    });

    this._buildMesh(scene);
    this._phase      = 'patrol';
    this._burrowTimer = 0;
    this._burrowCD   = 0;
    this._attackTimer = 0;
    this._patrolTarget = new THREE.Vector3(position.x, 0, position.z);
    this._origin = position.clone();
  }

  _buildMesh(scene) {
    const g = new THREE.Group();

    const mat = new THREE.MeshStandardMaterial({ color: 0x7A6A50, roughness: 0.95 });
    const darkMat = new THREE.MeshStandardMaterial({ color: 0x4A3A28, roughness: 0.95 });

    // Cuerpo — segmentos de cilindro que forman la serpiente
    const segments = [
      { x: 0,    z: 0,    r: 0.35, h: 0.5 },
      { x: 0.4,  z: 0.2,  r: 0.30, h: 0.45 },
      { x: 0.8,  z: 0.35, r: 0.25, h: 0.40 },
      { x: 1.2,  z: 0.4,  r: 0.20, h: 0.35 },
      { x: 1.55, z: 0.35, r: 0.14, h: 0.28 },
    ];

    segments.forEach((s, i) => {
      const seg = new THREE.Mesh(
        new THREE.CylinderGeometry(s.r, s.r * 1.1, s.h, 7),
        i % 2 === 0 ? mat : darkMat
      );
      seg.rotation.z = Math.PI / 2;
      seg.position.set(s.x, 0.25, s.z);
      g.add(seg);
    });

    // Cabeza
    const head = new THREE.Mesh(
      new THREE.SphereGeometry(0.38, 8, 6),
      mat
    );
    head.scale.set(1.2, 0.7, 1.0);
    head.position.set(-0.4, 0.3, 0);
    g.add(head);

    // Ojos
    const eyeMat = new THREE.MeshStandardMaterial({ color: 0xFF4400, emissive: 0xFF2200, emissiveIntensity: 0.8 });
    [-0.12, 0.12].forEach(oz => {
      const eye = new THREE.Mesh(new THREE.SphereGeometry(0.07, 5, 5), eyeMat);
      eye.position.set(-0.65, 0.42, oz);
      g.add(eye);
    });

    // Piedras decorativas en el cuerpo
    const stoneMat = new THREE.MeshStandardMaterial({ color: 0x9A8A70, roughness: 1.0 });
    [[0.2, 0.45, 0.1], [0.7, 0.42, 0.15], [1.1, 0.38, -0.1]].forEach(([x, y, z]) => {
      const stone = new THREE.Mesh(new THREE.SphereGeometry(0.1, 5, 4), stoneMat);
      stone.position.set(x, y, z);
      stone.scale.y = 0.6;
      g.add(stone);
    });

    g.position.copy(this.position);
    scene.add(g);
    this.mesh = g;
  }

  update(delta, playerPos) {
    if (this.isDead()) return;

    const distToPlayer = this.position.distanceTo(playerPos);

    // ── Burrow cooldown ──
    if (this._burrowCD > 0) this._burrowCD -= delta;

    switch (this._phase) {

      case 'patrol':
        this._doPatrol(delta);
        if (distToPlayer < 10) this._phase = 'chase';
        break;

      case 'chase':
        this._doChase(delta, playerPos);
        if (distToPlayer < 1.8) {
          this._phase = 'attack';
          this._attackTimer = 0;
        }
        if (distToPlayer > 18) this._phase = 'patrol';
        // Burrow si HP < 40%
        if (this.hp < this.maxHp * 0.4 && this._burrowCD <= 0) {
          this._phase = 'burrow';
          this._burrowTimer = 2.0;
        }
        break;

      case 'attack':
        this._attackTimer -= delta;
        if (this._attackTimer <= 0) {
          this._attackTimer = 1.4;
          if (distToPlayer < 2.2) {
            window._combat?.takeDamage?.(this.damage);
          }
        }
        if (distToPlayer > 2.5) this._phase = 'chase';
        break;

      case 'burrow':
        // Se hunde en el suelo y reaparece cerca del jugador
        this._burrowTimer -= delta;
        this.mesh.position.y = Math.max(-0.8, this.mesh.position.y - delta * 1.2);
        if (this._burrowTimer <= 0) {
          // Reaparece a 4 unidades del jugador en dirección aleatoria
          const angle = Math.random() * Math.PI * 2;
          this.position.set(
            playerPos.x + Math.cos(angle) * 4,
            0,
            playerPos.z + Math.sin(angle) * 4
          );
          this.mesh.position.copy(this.position);
          this.mesh.position.y = 0;
          this._burrowCD = 8.0;
          this._phase = 'chase';
        }
        break;
    }

    // Actualiza posición del mesh
    if (this._phase !== 'burrow') {
      this.mesh.position.copy(this.position);
      this.mesh.position.y = 0;
    }
  }

  _doPatrol(delta) {
    const dist = this.position.distanceTo(this._patrolTarget);
    if (dist < 1.0) {
      // Nuevo punto de patrulla cerca del origen
      const angle = Math.random() * Math.PI * 2;
      this._patrolTarget.set(
        this._origin.x + Math.cos(angle) * 6,
        0,
        this._origin.z + Math.sin(angle) * 6
      );
    }
    const dir = this._patrolTarget.clone().sub(this.position).normalize();
    this.position.addScaledVector(dir, this.speed * 0.4 * delta);
    this.mesh.lookAt(this._patrolTarget);
  }

  _doChase(delta, playerPos) {
    const dir = playerPos.clone().sub(this.position).normalize();
    this.position.addScaledVector(dir, this.speed * delta);
    this.mesh.lookAt(playerPos);
  }
      }
