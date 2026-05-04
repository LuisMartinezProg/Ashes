// skills/fireball.js — Habilidad: Bola de Fuego
// Fase 3: proyectil lento y potente con efecto de explosión al impacto
//
// USO desde skillSystem.js:
//   import { Fireball } from './skills/fireball.js';
//   const skill = new Fireball(scene, playerGroup);
//   skill.cast(enemies); // lanza hacia el enemigo más cercano

import * as THREE from 'three';

const DAMAGE        = 55;
const SPEED         = 4.5;    // unidades/segundo — lento pero visible
const MAX_RANGE     = 20;     // se destruye si viaja más
const EXPLOSION_DUR = 400;    // ms que dura la explosión visual

export class Fireball {
  constructor(scene, player) {
    this.scene    = scene;
    this.player   = player;
    this.cooldown = 5;        // segundos — editable
    this._timer   = 0;        // tiempo restante de cooldown
    this._active  = [];       // proyectiles activos

    // Callback que llama skillSystem cuando el cooldown cambia
    this.onCooldownUpdate = null;
  }

  // ── API pública ─────────────────────────────────────────────────────────────

  /** Retorna true si está lista para lanzar */
  isReady() {
    return this._timer <= 0;
  }

  /** Retorna progreso del cooldown 0-1 (1 = lista) */
  getCooldownProgress() {
    return Math.min(1, 1 - this._timer / this.cooldown);
  }

  /** Lanza la bola de fuego hacia el enemigo más cercano */
  cast(enemies) {
    if (!this.isReady()) return false;

    const target = this._findTarget(enemies);
    if (!target) return false;

    this._spawnProjectile(target);
    this._timer = this.cooldown;

    if (this.onCooldownUpdate) this.onCooldownUpdate(0); // inicia en 0%
    return true;
  }

  /** Llamado cada frame desde skillSystem */
  update(delta) {
    // Actualiza cooldown
    if (this._timer > 0) {
      this._timer -= delta;
      if (this._timer < 0) this._timer = 0;
      if (this.onCooldownUpdate) {
        this.onCooldownUpdate(this.getCooldownProgress());
      }
    }

    // Mueve proyectiles activos
    for (let i = this._active.length - 1; i >= 0; i--) {
      const p = this._active[i];

      if (p.exploding) {
        this._updateExplosion(p, delta, i);
        continue;
      }

      // Mueve en línea recta hacia la dirección calculada al lanzar
      p.mesh.position.addScaledVector(p.direction, SPEED * delta);
      p.traveled += SPEED * delta;

      // Rota la bola sobre sí misma (efecto visual)
      p.mesh.rotation.x += delta * 3;
      p.mesh.rotation.y += delta * 2;

      // Comprueba colisión con enemigos
      let hit = false;
      for (const e of p.enemies) {
        if (e.isDead()) continue;
        if (p.mesh.position.distanceTo(e.mesh.position) < 0.8) {
          e.takeDamage(DAMAGE);
          hit = true;
          break;
        }
      }

      if (hit || p.traveled > MAX_RANGE) {
        this._explode(p, i);
      }
    }
  }

  // ── Internos ────────────────────────────────────────────────────────────────

  _findTarget(enemies) {
    let closest = null, minDist = Infinity;
    for (const e of enemies) {
      if (e.isDead()) continue;
      const d = this.player.position.distanceTo(e.mesh.position);
      if (d < minDist) { minDist = d; closest = e; }
    }
    return closest;
  }

  _spawnProjectile(target) {
    // Esfera principal
    const geo  = new THREE.SphereGeometry(0.22, 10, 10);
    const mat  = new THREE.MeshBasicMaterial({ color: 0xFF4400 });
    const mesh = new THREE.Mesh(geo, mat);

    // Halo exterior (más grande, semi-transparente)
    const haloGeo = new THREE.SphereGeometry(0.35, 8, 8);
    const haloMat = new THREE.MeshBasicMaterial({
      color       : 0xFF8800,
      transparent : true,
      opacity     : 0.4,
    });
    const halo = new THREE.Mesh(haloGeo, haloMat);
    mesh.add(halo);

    // Sale desde el pecho del jugador
    mesh.position.copy(this.player.position).add(new THREE.Vector3(0, 1.0, 0));

    // Dirección hacia el objetivo (ignora Y para ir horizontal)
    const dir = target.mesh.position.clone()
      .sub(mesh.position)
      .setY(0)
      .normalize();

    this.scene.add(mesh);

    this._active.push({
      mesh,
      direction  : dir,
      traveled   : 0,
      enemies    : [...this.scene.children
        .filter(c => c.userData?.isEnemy)
        .map(c => c.userData.enemyRef)
        .filter(Boolean)],
      // Guardamos referencia directa a todos los enemigos activos
      enemyList  : target ? [target] : [],
      exploding  : false,
      explodeTimer: 0,
    });

    // Guardamos la lista de enemigos en el proyectil para colisión
    this._active[this._active.length - 1].enemies = this.scene._enemyList ?? [target];
  }

  _explode(projectile, index) {
    projectile.exploding     = true;
    projectile.explodeTimer  = EXPLOSION_DUR;

    // Cambia a esfera de explosión grande
    projectile.mesh.scale.setScalar(3);
    projectile.mesh.material.color.setHex(0xFFAA00);
    if (projectile.mesh.children[0]) {
      projectile.mesh.children[0].material.opacity = 0.6;
      projectile.mesh.children[0].scale.setScalar(1.5);
    }
  }

  _updateExplosion(projectile, delta, index) {
    const ms = delta * 1000;
    projectile.explodeTimer -= ms;

    // Expande y desvanece
    const t = Math.max(0, projectile.explodeTimer / EXPLOSION_DUR);
    projectile.mesh.scale.setScalar(3 + (1 - t) * 2);
    projectile.mesh.material.color.setHex(
      t > 0.5 ? 0xFFAA00 : 0xFF4400
    );

    if (projectile.explodeTimer <= 0) {
      this.scene.remove(projectile.mesh);
      projectile.mesh.geometry.dispose();
      projectile.mesh.material.dispose();
      this._active.splice(index, 1);
    }
  }
      }


