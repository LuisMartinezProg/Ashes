// skills/katana/godOfThunder.js — Dios del Trueno (Tormenta - Legendaria)
import * as THREE from 'three';

const DAMAGE      = 250;
const RANGE       = 7.0;
const DURATION    = 1500;
const DOT_DAMAGE  = 25;
const DOT_TICKS   = 6;
const DOT_INTERVAL= 500;

export class GodOfThunder {
  constructor(scene, player) {
    this.scene    = scene;
    this.player   = player;
    this.cooldown = 30;
    this._timer   = 0;
    this._active  = [];
    this.onCooldownUpdate = null;
  }

  isReady() { return this._timer <= 0; }
  getCooldownProgress() { return Math.min(1, 1 - this._timer / this.cooldown); }

  cast(enemies) {
    if (!this.isReady()) return false;
    const inRange = enemies.filter(e => {
      if (e.isDead() || !e.mesh) return false;
      const dx = this.player.position.x - e.mesh.position.x;
      const dz = this.player.position.z - e.mesh.position.z;
      return Math.sqrt(dx*dx + dz*dz) <= RANGE;
    });
    if (inRange.length === 0) return false;

    // Daño inicial masivo
    inRange.forEach(e => {
      e.takeDamage(DAMAGE);
      e.applySlow?.(0.3, 5);
    });

    // DOT eléctrico
    for (let tick = 1; tick <= DOT_TICKS; tick++) {
      setTimeout(() => {
        inRange.forEach(e => { if (!e.isDead()) e.takeDamage(DOT_DAMAGE); });
        this._spawnStrike();
      }, tick * DOT_INTERVAL);
    }

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
    for (let i = this._active.length - 1; i >= 0; i--) {
      const fx = this._active[i];
      fx.timer -= delta * 1000;
      const t = Math.max(0, fx.timer / DURATION);

      if (fx.type === 'cloud') {
        fx.mesh.rotation.y += delta * 1.5;
        fx.mesh.material.opacity = t * 0.5;
        fx.mesh.scale.setScalar(1 + (1 - t) * 0.4);
      } else if (fx.type === 'ring') {
        fx.mesh.scale.setScalar(1 + (1 - t) * 2.5);
        fx.mesh.material.opacity = t * 0.6;
      } else if (fx.type === 'pillar') {
        fx.mesh.material.opacity = t * 0.9;
        fx.mesh.scale.y = 1 + (1 - t) * 0.5;
      } else if (fx.type === 'bolt') {
        fx.mesh.material.opacity = t;
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

    // Nube masiva giratoria
    const cGeo  = new THREE.SphereGeometry(RANGE * 0.7, 10, 6);
    const cMat  = new THREE.MeshBasicMaterial({ color: 0x112233, transparent: true, opacity: 0.5 });
    const cloud = new THREE.Mesh(cGeo, cMat);
    cloud.scale.y = 0.25;
    cloud.position.copy(origin).add(new THREE.Vector3(0, 6, 0));
    this.scene.add(cloud);
    this._active.push({ mesh: cloud, timer: DURATION, type: 'cloud' });

    // Anillos en suelo
    [RANGE * 0.4, RANGE * 0.7, RANGE].forEach((r, i) => {
      const rGeo = new THREE.RingGeometry(r - 0.1, r, 12);
      const rMat = new THREE.MeshBasicMaterial({ color: 0xffff00, transparent: true, opacity: 0.6, side: THREE.DoubleSide });
      const ring = new THREE.Mesh(rGeo, rMat);
      ring.position.copy(origin).add(new THREE.Vector3(0, 0.05, 0));
      ring.rotation.x = -Math.PI / 2;
      this.scene.add(ring);
      this._active.push({ mesh: ring, timer: DURATION - i * 150, type: 'ring' });
    });

    // Pilar de luz central
    const pGeo   = new THREE.CylinderGeometry(0.3, 0.6, 8, 8);
    const pMat   = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.8 });
    const pillar = new THREE.Mesh(pGeo, pMat);
    pillar.position.copy(origin).add(new THREE.Vector3(0, 4, 0));
    this.scene.add(pillar);
    this._active.push({ mesh: pillar, timer: DURATION * 0.4, type: 'pillar' });
  }

  _spawnStrike() {
    const origin = this.player.position.clone();
    const angle  = Math.random() * Math.PI * 2;
    const dist   = Math.random() * RANGE * 0.9;

    const bGeo = new THREE.CylinderGeometry(0.06, 0.06, 5.0, 4);
    const bMat = new THREE.MeshBasicMaterial({ color: 0xffffaa, transparent: true, opacity: 1.0 });
    const bolt = new THREE.Mesh(bGeo, bMat);
    bolt.position.copy(origin).add(new THREE.Vector3(
      Math.cos(angle) * dist, 2.5, Math.sin(angle) * dist
    ));
    this.scene.add(bolt);
    this._active.push({ mesh: bolt, timer: 180, type: 'bolt' });
  }
                       }
