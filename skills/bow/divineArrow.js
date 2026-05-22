// skills/bow/divineArrow.js — Flecha Divina (Precisión - Legendaria)
import * as THREE from 'three';

const DAMAGE         = 400;
const SPEED          = 26.0;
const MAX_RANGE      = 60;
const MAX_CAST_RANGE = 55;
const DOT_DAMAGE     = 40;
const DOT_TICKS      = 5;
const DOT_INTERVAL   = 600;
const STUN_DURATION  = 3000;
const DURATION_VFX   = 800;
const CRIT_MULT      = 3.0;

export class DivineArrow {
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
    const target = this._findTarget(enemies);
    if (!target) return false;
    this._spawnArrow(target, enemies);
    this._spawnChargeVFX();
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
      const p = this._active[i];

      if (p.type === 'vfx' || p.type === 'ring' || p.type === 'trail') {
        p.timer -= delta * 1000;
        const t = Math.max(0, p.timer / p.maxTimer);

        if (p.type === 'vfx') {
          p.mesh.material.opacity = t * 0.9;
          p.mesh.scale.setScalar(1 + (1 - t) * 1.2);
        } else if (p.type === 'ring') {
          p.mesh.scale.setScalar(1 + (1 - t) * 2.5);
          p.mesh.material.opacity = t * 0.65;
        } else if (p.type === 'trail') {
          p.mesh.material.opacity = t * 0.5;
        }

        if (p.timer <= 0) {
          this.scene.remove(p.mesh);
          p.mesh.geometry.dispose();
          p.mesh.material.dispose();
          this._active.splice(i, 1);
        }
        continue;
      }

      if (p.type === 'pillar') {
        p.timer -= delta * 1000;
        const t = Math.max(0, p.timer / p.maxTimer);
        p.mesh.material.opacity = t * 0.85;
        p.mesh.scale.y = 0.5 + t * 0.5;
        if (p.timer <= 0) {
          this.scene.remove(p.mesh);
          p.mesh.geometry.dispose();
          p.mesh.material.dispose();
          this._active.splice(i, 1);
        }
        continue;
      }

      // Flecha — movimiento
      p.mesh.position.addScaledVector(p.direction, SPEED * delta);
      p.traveled += SPEED * delta;

      // Estela de luz cada frame
      this._spawnTrail(p.mesh.position);

      for (const e of p.enemies) {
        if (e.isDead() || !e.mesh || p.hit.has(e)) continue;
        const dx = p.mesh.position.x - e.mesh.position.x;
        const dz = p.mesh.position.z - e.mesh.position.z;
        if (Math.sqrt(dx * dx + dz * dz) < 1.0) {
          const isFirst = p.hit.size === 0;
          const dmg = isFirst ? DAMAGE * CRIT_MULT : DAMAGE;
          e.takeDamage(dmg);
          if (isFirst) {
            // Stun + DOT sagrado
            e.applySlow?.(0, STUN_DURATION / 1000);
            this._spawnImpactVFX(e.mesh.position);
            for (let tick = 1; tick <= DOT_TICKS; tick++) {
              setTimeout(() => {
                if (!e.isDead()) e.takeDamage(DOT_DAMAGE);
              }, tick * DOT_INTERVAL);
            }
          }
          p.hit.add(e);
        }
      }

      if (p.traveled > MAX_RANGE) {
        this.scene.remove(p.mesh);
        p.mesh.geometry.dispose();
        p.mesh.material.dispose();
        this._active.splice(i, 1);
      }
    }
  }

  _findTarget(enemies) {
    let closest = null, minDist = Infinity;
    for (const e of enemies) {
      if (e.isDead() || !e.mesh) continue;
      const dx = this.player.position.x - e.mesh.position.x;
      const dz = this.player.position.z - e.mesh.position.z;
      const d  = Math.sqrt(dx * dx + dz * dz);
      if (d < minDist && d < MAX_CAST_RANGE) { minDist = d; closest = e; }
    }
    return closest;
  }

  _spawnArrow(target, enemies) {
    // Flecha blanca/dorada con aura sagrada
    const geo  = new THREE.CylinderGeometry(0.07, 0.07, 2.2, 6);
    const mat  = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.copy(this.player.position).add(new THREE.Vector3(0, 1.2, 0));
    const dir = new THREE.Vector3(
      target.mesh.position.x - mesh.position.x, 0,
      target.mesh.position.z - mesh.position.z
    ).normalize();
    mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);
    this.scene.add(mesh);
    this._active.push({ type: 'arrow', mesh, direction: dir, traveled: 0, enemies: [...enemies], hit: new Set() });
  }

  _spawnChargeVFX() {
    const origin = this.player.position.clone().add(new THREE.Vector3(0, 1.2, 0));

    // Esfera de carga blanca intensa
    const geo  = new THREE.SphereGeometry(0.55, 12, 12);
    const mat  = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.9 });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.copy(origin);
    this.scene.add(mesh);
    this._active.push({ type: 'vfx', mesh, timer: DURATION_VFX, maxTimer: DURATION_VFX });

    // Anillos sagrados en suelo
    [0.5, 1.0, 1.8].forEach((r, i) => {
      const rGeo = new THREE.RingGeometry(r - 0.08, r, 16);
      const rMat = new THREE.MeshBasicMaterial({ color: 0xffffaa, transparent: true, opacity: 0.65, side: THREE.DoubleSide });
      const ring = new THREE.Mesh(rGeo, rMat);
      ring.position.copy(this.player.position).add(new THREE.Vector3(0, 0.05, 0));
      ring.rotation.x = -Math.PI / 2;
      this.scene.add(ring);
      this._active.push({ type: 'ring', mesh: ring, timer: DURATION_VFX - i * 100, maxTimer: DURATION_VFX });
    });
  }

  _spawnTrail(pos) {
    const geo  = new THREE.SphereGeometry(0.08, 4, 4);
    const mat  = new THREE.MeshBasicMaterial({ color: 0xffffcc, transparent: true, opacity: 0.5 });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.copy(pos);
    this.scene.add(mesh);
    this._active.push({ type: 'trail', mesh, timer: 200, maxTimer: 200 });
  }

  _spawnImpactVFX(pos) {
    // Pilar de luz sagrada
    const pGeo   = new THREE.CylinderGeometry(0.2, 0.5, 9, 8);
    const pMat   = new THREE.MeshBasicMaterial({ color: 0xffffcc, transparent: true, opacity: 0.85 });
    const pillar = new THREE.Mesh(pGeo, pMat);
    pillar.position.copy(pos).add(new THREE.Vector3(0, 4.5, 0));
    this.scene.add(pillar);
    this._active.push({ type: 'pillar', mesh: pillar, timer: 700, maxTimer: 700 });

    // Anillos de impacto
    [0.5, 1.0, 1.8, 2.8].forEach((r, i) => {
      const rGeo = new THREE.RingGeometry(r - 0.08, r, 14);
      const rMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.7, side: THREE.DoubleSide });
      const ring = new THREE.Mesh(rGeo, rMat);
      ring.position.copy(pos).add(new THREE.Vector3(0, 0.05, 0));
      ring.rotation.x = -Math.PI / 2;
      this.scene.add(ring);
      this._active.push({ type: 'ring', mesh: ring, timer: DURATION_VFX - i * 70, maxTimer: DURATION_VFX });
    });
  }
    }
