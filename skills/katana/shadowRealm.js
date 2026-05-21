// skills/katana/shadowRealm.js — Reino de Sombras (Sombra - Legendaria)
import * as THREE from 'three';

const DAMAGE      = 200;
const RANGE       = 6.0;
const DURATION    = 1200;
const DOT_DAMAGE  = 15; // daño por tick
const DOT_TICKS   = 5;
const DOT_INTERVAL= 800; // ms entre ticks

export class ShadowRealm {
  constructor(scene, player) {
    this.scene    = scene;
    this.player   = player;
    this.cooldown = 25;
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

    // Daño inicial masivo + ralentiza fuerte
    inRange.forEach(e => {
      e.takeDamage(DAMAGE);
      e.applySlow?.(0.2, 4);
    });

    // DOT — daño por tick durante 4 segundos
    for (let tick = 1; tick <= DOT_TICKS; tick++) {
      setTimeout(() => {
        inRange.forEach(e => {
          if (!e.isDead()) e.takeDamage(DOT_DAMAGE);
        });
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

      if (fx.type === 'ring') {
        fx.mesh.rotation.y += delta * 3;
        fx.mesh.scale.setScalar(1 + (1 - t) * 1.5);
        fx.mesh.material.opacity = t * 0.5;
      } else if (fx.type === 'dome') {
        fx.mesh.material.opacity = t * 0.15;
        fx.mesh.scale.setScalar(1 + (1 - t) * 0.3);
      } else if (fx.type === 'particle') {
        fx.mesh.position.y += delta * 1.5;
        fx.mesh.material.opacity = t * 0.8;
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

    // Domo oscuro que cubre el área
    const domeGeo = new THREE.SphereGeometry(RANGE, 16, 16);
    const domeMat = new THREE.MeshBasicMaterial({
      color: 0x110022, transparent: true, opacity: 0.15,
      side: THREE.BackSide,
    });
    const dome = new THREE.Mesh(domeGeo, domeMat);
    dome.position.copy(origin).add(new THREE.Vector3(0, 0, 0));
    this.scene.add(dome);
    this._active.push({ mesh: dome, timer: DURATION, type: 'dome' });

    // Anillos concéntricos giratorios
    [RANGE * 0.4, RANGE * 0.7, RANGE].forEach((r, i) => {
      const rGeo = new THREE.TorusGeometry(r, 0.06, 6, 24);
      const rMat = new THREE.MeshBasicMaterial({ color: 0x8800cc, transparent: true, opacity: 0.5 });
      const ring = new THREE.Mesh(rGeo, rMat);
      ring.position.copy(origin).add(new THREE.Vector3(0, 0.1, 0));
      ring.rotation.x = -Math.PI / 2;
      this.scene.add(ring);
      this._active.push({ mesh: ring, timer: DURATION - i * 100, type: 'ring' });
    });

    // Partículas que suben
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2;
      const dist  = RANGE * (0.3 + Math.random() * 0.6);
      const pGeo  = new THREE.SphereGeometry(0.07, 4, 4);
      const pMat  = new THREE.MeshBasicMaterial({ color: 0xaa44ff, transparent: true, opacity: 0.8 });
      const p     = new THREE.Mesh(pGeo, pMat);
      p.position.copy(origin).add(new THREE.Vector3(
        Math.cos(angle) * dist, 0.2, Math.sin(angle) * dist
      ));
      this.scene.add(p);
      this._active.push({ mesh: p, timer: DURATION * (0.4 + Math.random() * 0.4), type: 'particle' });
    }
  }
}
