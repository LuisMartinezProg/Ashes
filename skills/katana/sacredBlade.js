// skills/katana/sacredBlade.js — Hoja Sagrada (Honor - Épica)
import * as THREE from 'three';

const DAMAGE      = 160;
const RANGE       = 5.0;
const DURATION    = 800;
const SHIELD_TIME = 4;   // segundos de escudo tras lanzar

export class SacredBlade {
  constructor(scene, player) {
    this.scene    = scene;
    this.player   = player;
    this.cooldown = 16;
    this._timer   = 0;
    this._active  = [];
    this._shielded    = false;
    this._shieldTimer = 0;
    this.onCooldownUpdate = null;
  }

  isReady() { return this._timer <= 0; }
  getCooldownProgress() { return Math.min(1, 1 - this._timer / this.cooldown); }

  // Llamar desde combat.js al recibir daño
  absorbDamage(amount) {
    if (!this._shielded) return amount;
    return 0; // absorbe todo el daño
  }

  cast(enemies) {
    if (!this.isReady()) return false;
    const inRange = enemies.filter(e => {
      if (e.isDead() || !e.mesh) return false;
      const dx = this.player.position.x - e.mesh.position.x;
      const dz = this.player.position.z - e.mesh.position.z;
      return Math.sqrt(dx*dx + dz*dz) <= RANGE;
    });
    if (inRange.length === 0) return false;

    // Daño + curación proporcional a enemigos golpeados
    inRange.forEach(e => e.takeDamage(DAMAGE));
    const heal = Math.floor(DAMAGE * 0.1 * inRange.length);
    if (window._player && heal > 0) {
      window._player.hp = Math.min(window._player.maxHp, window._player.hp + heal);
      window._player.onDamage?.(window._player.hp, window._player.maxHp);
    }

    // Activar escudo temporal
    this._shielded    = true;
    this._shieldTimer = SHIELD_TIME;

    this._spawnEffect();
    this._timer = this.cooldown;
    if (this.onCooldownUpdate) this.onCooldownUpdate(0);
    return true;
  }

  update(delta) {
    if (this._timer > 0) {
      this._timer -= delta;
      if (this._timer < 0) this._timer = 0;
      if (this.onCooldownUpdate) this.onCooldownUpdate(this.getCooldownProgress());
    }

    // Escudo
    if (this._shielded) {
      this._shieldTimer -= delta;
      if (this._shieldTimer <= 0) {
        this._shielded = false;
        this._removeShieldFx();
      }
    }

    for (let i = this._active.length - 1; i >= 0; i--) {
      const fx = this._active[i];
      fx.timer -= delta * 1000;
      const t = Math.max(0, fx.timer / DURATION);

      if (fx.type === 'ring') {
        fx.mesh.scale.setScalar(1 + (1 - t) * 1.8);
        fx.mesh.material.opacity = t * 0.6;
      } else if (fx.type === 'shield') {
        // El escudo pulsa mientras esté activo
        fx.mesh.material.opacity = 0.15 + Math.sin(Date.now() * 0.005) * 0.08;
        return; // no remover por timer
      } else if (fx.type === 'particle') {
        fx.mesh.position.y += delta * 1.8;
        fx.mesh.material.opacity = t * 0.9;
      }

      if (fx.timer <= 0) {
        this.scene.remove(fx.mesh);
        fx.mesh.geometry.dispose();
        fx.mesh.material.dispose();
        this._active.splice(i, 1);
      }
    }
  }

  _spawnEffect() {
    const origin = this.player.position.clone();

    // Anillo dorado expansivo
    const rGeo = new THREE.RingGeometry(0.1, RANGE, 12);
    const rMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.7, side: THREE.DoubleSide });
    const ring = new THREE.Mesh(rGeo, rMat);
    ring.position.copy(origin).add(new THREE.Vector3(0, 0.1, 0));
    ring.rotation.x = -Math.PI / 2;
    this.scene.add(ring);
    this._active.push({ mesh: ring, timer: DURATION, type: 'ring' });

    // Partículas doradas que suben
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const pGeo  = new THREE.SphereGeometry(0.06, 4, 4);
      const pMat  = new THREE.MeshBasicMaterial({ color: 0xffdd44, transparent: true, opacity: 0.9 });
      const p     = new THREE.Mesh(pGeo, pMat);
      p.position.copy(origin).add(new THREE.Vector3(
        Math.cos(angle) * 0.8, 0.5, Math.sin(angle) * 0.8
      ));
      this.scene.add(p);
      this._active.push({ mesh: p, timer: DURATION * 0.5, type: 'particle' });
    }

    // Escudo esférico alrededor del jugador
    const sGeo    = new THREE.SphereGeometry(1.1, 12, 12);
    const sMat    = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.15, side: THREE.DoubleSide });
    this._shieldFx = new THREE.Mesh(sGeo, sMat);
    this._shieldFx.position.copy(origin).add(new THREE.Vector3(0, 0.8, 0));
    this.scene.add(this._shieldFx);
    this._active.push({ mesh: this._shieldFx, timer: SHIELD_TIME * 1000, type: 'shield' });
  }

  _removeShieldFx() {
    if (!this._shieldFx) return;
    this.scene.remove(this._shieldFx);
    this._shieldFx.geometry.dispose();
    this._shieldFx.material.dispose();
    this._shieldFx = null;
    this._active = this._active.filter(fx => fx.type !== 'shield');
  }
                         }
