// skills/mika/stellarCollapse.js — Colapso Estelar (arcano de Mika)
import * as THREE from 'three';

const DAMAGE         = 320;
const AOE_RANGE      = 6.0;
const MAX_CAST_RANGE = 22;

export class StellarCollapse {
  constructor(scene, player) {
    this.scene    = scene;
    this.player   = player;
    this.cooldown = 18;
    this._timer   = 0;
    this.onCooldownUpdate = null;
  }

  isReady() { return this._timer <= 0; }
  getCooldownProgress() { return Math.min(1, 1 - this._timer / this.cooldown); }

  cast(enemies) {
    if (!this.isReady()) return false;
    const target = this._findTarget(enemies);
    if (!target) return false;

    const pos = target.mesh.position.clone();

    // Daño al objetivo principal
    target.takeDamage(DAMAGE);

    // Daño en área
    for (const e of enemies) {
      if (e === target || e.isDead() || !e.mesh) continue;
      const dx = pos.x - e.mesh.position.x;
      const dz = pos.z - e.mesh.position.z;
      if (Math.sqrt(dx*dx + dz*dz) <= AOE_RANGE) {
        e.takeDamage(Math.floor(DAMAGE * 0.5));
      }
    }

    // Aplicar aura astral para reacciones
    window._partyManager?.reactions?.applyElement(target, 'astral');

    this._spawnVFX(pos);
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
  }

  _findTarget(enemies) {
    let closest = null, minDist = Infinity;
    for (const e of enemies) {
      if (e.isDead() || !e.mesh) continue;
      const dx = this.player.position.x - e.mesh.position.x;
      const dz = this.player.position.z - e.mesh.position.z;
      const d  = Math.sqrt(dx*dx + dz*dz);
      if (d < minDist && d < MAX_CAST_RANGE) { minDist = d; closest = e; }
    }
    return closest;
  }

  _spawnVFX(pos) {
    // Esfera central astral
    const sGeo  = new THREE.SphereGeometry(1.0, 12, 12);
    const sMat  = new THREE.MeshBasicMaterial({
      color: 0xaaddff, transparent: true, opacity: 0.9,
    });
    const sphere = new THREE.Mesh(sGeo, sMat);
    sphere.position.copy(pos).add(new THREE.Vector3(0, 1, 0));
    this.scene.add(sphere);

    // Anillos expansivos
    [0.5, 1.5, 3.0, 5.0].forEach((r, i) => {
      setTimeout(() => {
        const rGeo = new THREE.RingGeometry(r - 0.1, r, 16);
        const rMat = new THREE.MeshBasicMaterial({
          color: 0x88aaff, transparent: true, opacity: 0.8, side: THREE.DoubleSide,
        });
        const ring = new THREE.Mesh(rGeo, rMat);
        ring.position.copy(pos).add(new THREE.Vector3(0, 0.1, 0));
        ring.rotation.x = -Math.PI / 2;
        this.scene.add(ring);

        const start = performance.now();
        const animate = () => {
          const t = Math.max(0, 1 - (performance.now() - start) / 700);
          ring.scale.setScalar(1 + (1 - t) * 3);
          ring.material.opacity = t * 0.8;
          if (t > 0) requestAnimationFrame(animate);
          else { this.scene.remove(ring); rGeo.dispose(); rMat.dispose(); }
        };
        requestAnimationFrame(animate);
      }, i * 100);
    });

    // Pilares de luz astral
    for (let p = 0; p < 5; p++) {
      const angle = (Math.PI * 2 / 5) * p;
      const dist  = 1.5 + Math.random() * (AOE_RANGE - 1.5);
      setTimeout(() => {
        const pGeo = new THREE.CylinderGeometry(0.1, 0.3, 6, 6);
        const pMat = new THREE.MeshBasicMaterial({
          color: 0xcceeFF, transparent: true, opacity: 0.85,
        });
        const pillar = new THREE.Mesh(pGeo, pMat);
        pillar.position.set(
          pos.x + Math.cos(angle) * dist, 3,
          pos.z + Math.sin(angle) * dist
        );
        this.scene.add(pillar);

        const start = performance.now();
        const animate = () => {
          const t = Math.max(0, 1 - (performance.now() - start) / 600);
          pillar.material.opacity = t * 0.85;
          pillar.scale.y = 0.3 + t * 0.7;
          if (t > 0) requestAnimationFrame(animate);
          else { this.scene.remove(pillar); pGeo.dispose(); pMat.dispose(); }
        };
        requestAnimationFrame(animate);
      }, p * 80);
    }

    // Animar esfera central
    const start = performance.now();
    const animSphere = () => {
      const t = Math.max(0, 1 - (performance.now() - start) / 500);
      sphere.scale.setScalar(1 + (1 - t) * 4);
      sphere.material.opacity = t * 0.9;
      if (t > 0) requestAnimationFrame(animSphere);
      else { this.scene.remove(sphere); sGeo.dispose(); sMat.dispose(); }
    };
    requestAnimationFrame(animSphere);
  }
}
