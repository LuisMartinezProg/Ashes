// skills/katana/legendaryStand.js — Bastión Legendario (Honor - Legendaria)
import * as THREE from 'three';

const DAMAGE_BASE    = 300;
const DAMAGE_LOW_HP  = 500;
const LOW_HP_THRESH  = 0.25;
const RANGE          = 6.0;
const DURATION       = 1400;
const HEAL_PCT       = 0.25;
const INVINCIBLE_TIME= 3; // segundos de invencibilidad

export class LegendaryStand {
  constructor(scene, player) {
    this.scene        = scene;
    this.player       = player;
    this.cooldown     = 35;
    this._timer       = 0;
    this._active      = [];
    this._invincible  = false;
    this._invTimer    = 0;
    this.onCooldownUpdate = null;
  }

  isReady() { return this._timer <= 0; }
  getCooldownProgress() { return Math.min(1, 1 - this._timer / this.cooldown); }

  isInvincible() { return this._invincible; }

  cast(enemies) {
    if (!this.isReady()) return false;
    const inRange = enemies.filter(e => {
      if (e.isDead() || !e.mesh) return false;
      const dx = this.player.position.x - e.mesh.position.x;
      const dz = this.player.position.z - e.mesh.position.z;
      return Math.sqrt(dx*dx + dz*dz) <= RANGE;
    });
    if (inRange.length === 0) return false;

    const playerHp    = window._player?.hp ?? 100;
    const playerMaxHp = window._player?.maxHp ?? 100;
    const isLowHp     = playerHp / playerMaxHp <= LOW_HP_THRESH;
    const dmg         = isLowHp ? DAMAGE_LOW_HP : DAMAGE_BASE;

    inRange.forEach(e => e.takeDamage(dmg));

    // Curación masiva
    const heal = Math.floor(dmg * HEAL_PCT * inRange.length);
    if (window._player && heal > 0) {
      window._player.hp = Math.min(playerMaxHp, window._player.hp + heal);
      window._player.onDamage?.(window._player.hp, playerMaxHp);
    }

    // Invencibilidad temporal
    this._invincible = true;
    this._invTimer   = INVINCIBLE_TIME;

    this._spawnEffect(isLowHp);
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

    if (this._invincible) {
      this._invTimer -= delta;
      if (this._invTimer <= 0) {
        this._invincible = false;
        this._removeInvFx();
      } else if (this._invFx) {
        // Pulsar aura
        this._invFx.material.opacity = 0.2 + Math.sin(Date.now() * 0.008) * 0.1;
        this._invFx.position.copy(this.player.position).add(new THREE.Vector3(0, 0.9, 0));
      }
    }

    for (let i = this._active.length - 1; i >= 0; i--) {
      const fx = this._active[i];
      fx.timer -= delta * 1000;
      const t = Math.max(0, fx.timer / DURATION);

      if (fx.type === 'ring') {
        fx.mesh.scale.setScalar(1 + (1 - t) * 2.5);
        fx.mesh.material.opacity = t * 0.6;
      } else if (fx.type === 'pillar') {
        fx.mesh.material.opacity = t * 0.8;
        fx.mesh.scale.y = t * 1.5;
      } else if (fx.type === 'particle') {
        fx.mesh.position.y += delta * 2.5;
        fx.mesh.rotation.y  += delta * 4;
        fx.mesh.material.opacity = t * 0.9;
      } else if (fx.type === 'inv') {
        return; // manejado arriba
      }

      if (fx.timer <= 0) {
        this.scene.remove(fx.mesh);
        fx.mesh.geometry.dispose();
        fx.mesh.material.dispose();
        this._active.splice(i, 1);
      }
    }
  }

  _spawnEffect(isLowHp) {
    const origin = this.player.position.clone();
    const color  = isLowHp ? 0xff2200 : 0xffdd44;
    const color2 = isLowHp ? 0xff6600 : 0xffffff;

    // Anillos concéntricos
    [RANGE * 0.35, RANGE * 0.65, RANGE].forEach((r, i) => {
      const rGeo = new THREE.RingGeometry(r - 0.1, r, 14);
      const rMat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.7, side: THREE.DoubleSide });
      const ring = new THREE.Mesh(rGeo, rMat);
      ring.position.copy(origin).add(new THREE.Vector3(0, 0.05, 0));
      ring.rotation.x = -Math.PI / 2;
      this.scene.add(ring);
      this._active.push({ mesh: ring, timer: DURATION - i * 100, type: 'ring' });
    });

    // Pilar de luz central
    const pGeo   = new THREE.CylinderGeometry(0.2, 0.8, 10, 8);
    const pMat   = new THREE.MeshBasicMaterial({ color: color2, transparent: true, opacity: 0.7 });
    const pillar = new THREE.Mesh(pGeo, pMat);
    pillar.position.copy(origin).add(new THREE.Vector3(0, 5, 0));
    this.scene.add(pillar);
    this._active.push({ mesh: pillar, timer: DURATION * 0.5, type: 'pillar' });

    // Partículas que suben girando
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2;
      const pGeo2 = new THREE.BoxGeometry(0.12, 0.12, 0.12);
      const pMat2 = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.9 });
      const p     = new THREE.Mesh(pGeo2, pMat2);
      p.position.copy(origin).add(new THREE.Vector3(
        Math.cos(angle) * 1.2, 0.3, Math.sin(angle) * 1.2
      ));
      this.scene.add(p);
      this._active.push({ mesh: p, timer: DURATION * (0.3 + Math.random() * 0.4), type: 'particle' });
    }

    // Aura de invencibilidad
    const sGeo  = new THREE.SphereGeometry(1.3, 14, 14);
    const sMat  = new THREE.MeshBasicMaterial({ color: color2, transparent: true, opacity: 0.2, side: THREE.DoubleSide });
    this._invFx = new THREE.Mesh(sGeo, sMat);
    this._invFx.position.copy(origin).add(new THREE.Vector3(0, 0.9, 0));
    this.scene.add(this._invFx);
    this._active.push({ mesh: this._invFx, timer: INVINCIBLE_TIME * 1000, type: 'inv' });
  }

  _removeInvFx() {
    if (!this._invFx) return;
    this.scene.remove(this._invFx);
    this._invFx.geometry.dispose();
    this._invFx.material.dispose();
    this._invFx = null;
    this._active = this._active.filter(fx => fx.type !== 'inv');
  }
    }
