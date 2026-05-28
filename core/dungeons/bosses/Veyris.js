// core/dungeons/bosses/Veyris.js — Ashes of the Reborn | Valiant Gaming
import * as THREE from 'three';
import { BaseEnemy, STATE } from '../../enemies/BaseEnemy.js';

const MIRROR_COUNT    = 4;
const SHARD_DAMAGE    = 14;
const SHARD_SPEED     = 8.0;
const REFLECT_RANGE   = 3.0;

export class Veyris extends BaseEnemy {
  constructor(scene, position, player) {
    super(scene, position, player, {
      hp            : 650,
      damage        : 20,
      roamSpeed     : 0,
      chaseSpeed    : 2.5,
      detectRange   : 30,
      attackRange   : 6.0,
      attackCooldown: 2.5,
      respawnTime   : 0,
      deathDuration : 1500,
      name          : 'Veyris',
      isBoss        : true,
      drops         : { magicEnergy: 70, xp: 300 },
    });
    this._mirrors       = [];
    this._shards        = [];
    this._shardTimer    = 2.5;
    this._phase         = 1;
    this._immune        = true;
  }

  _buildMesh(pos) {
    this.mesh = new THREE.Group();

    // Cuerpo — araña de cristal
    const crystalMat = new THREE.MeshStandardMaterial({
      color      : 0x88ccff,
      emissive   : 0x2266aa,
      emissiveIntensity: 0.7,
      transparent: true,
      opacity    : 0.85,
      roughness  : 0.1,
      metalness  : 0.3,
    });

    const body = new THREE.Mesh(new THREE.SphereGeometry(0.7, 12, 12), crystalMat);
    body.position.y = 1.2;
    this.mesh.add(body);

    // Patas de cristal
    for (let i = 0; i < 6; i++) {
      const angle  = (i / 6) * Math.PI * 2;
      const legMat = crystalMat.clone();
      legMat.opacity = 0.7;
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.1, 1.4, 6), legMat);
      leg.position.set(Math.cos(angle) * 0.9, 0.7, Math.sin(angle) * 0.9);
      leg.rotation.z = Math.cos(angle) * 0.6;
      leg.rotation.x = Math.sin(angle) * 0.6;
      this.mesh.add(leg);
    }

    // Ojos
    const eyeMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    for (let i = 0; i < 4; i++) {
      const angle = (i / 4) * Math.PI - Math.PI * 0.25;
      const eye   = new THREE.Mesh(new THREE.SphereGeometry(0.08, 6, 6), eyeMat);
      eye.position.set(Math.cos(angle) * 0.5, 1.4, Math.sin(angle) * 0.3 + 0.55);
      this.mesh.add(eye);
    }

    // Luz central
    const light = new THREE.PointLight(0x88ccff, 2.5, 14);
    light.position.y = 1.5;
    this.mesh.add(light);
    this._light = light;

    this.mesh.position.set(pos.x, 0, pos.z);
    this.mesh.scale.setScalar(1.5);
    this._materials = [crystalMat];

    // Espejos alrededor de la sala
    this._spawnMirrors(pos);
  }

  _spawnMirrors(pos) {
    for (let i = 0; i < MIRROR_COUNT; i++) {
      const angle = (i / MIRROR_COUNT) * Math.PI * 2;
      const r     = 8;
      const mx    = pos.x + Math.cos(angle) * r;
      const mz    = pos.z + Math.sin(angle) * r;

      const geo = new THREE.BoxGeometry(0.15, 3.5, 2.0);
      const mat = new THREE.MeshStandardMaterial({
        color      : 0xaaddff,
        emissive   : 0x4499cc,
        emissiveIntensity: 0.6,
        transparent: true,
        opacity    : 0.75,
        roughness  : 0.05,
        metalness  : 0.8,
      });
      const m = new THREE.Mesh(geo, mat);
      m.position.set(mx, 1.75, mz);
      m.lookAt(pos.x, 1.75, pos.z);
      this.scene.add(m);

      const light = new THREE.PointLight(0x88ccff, 1, 5);
      light.position.set(mx, 2, mz);
      this.scene.add(light);

      this._mirrors.push({
        mesh   : m,
        light,
        broken : false,
        worldX : mx,
        worldZ : mz,
        hp     : 60,
      });
    }
  }

  update(delta) {
    super.update(delta);
    if (!this.mesh || this.dead) return;

    // Flotar
    this.mesh.position.y = Math.sin(Date.now() * 0.0015) * 0.2;
    this.mesh.rotation.y += delta * 0.5;

    // Inmune mientras queden espejos
    const brokenCount = this._mirrors.filter(m => m.broken).length;
    this._immune = brokenCount < MIRROR_COUNT;

    // Fase 2
    if (this._phase === 1 && this.hp < this.maxHp * 0.5) {
      this._phase = 2;
      this._enterPhase2();
    }

    // Fragmentos
    this._shardTimer -= delta;
    if (this._shardTimer <= 0) {
      this._shardTimer = this._phase === 2 ? 1.5 : 2.5;
      this._launchShards();
    }

    // Animar espejos
    for (const mirror of this._mirrors) {
      if (!mirror.broken) {
        mirror.mesh.material.emissiveIntensity = 0.4 + Math.sin(Date.now() * 0.003) * 0.3;
      }
    }

    this._updateShards(delta);
  }

  takeDamage(amount) {
    if (this._immune) {
      this._showImmune();
      return;
    }
    super.takeDamage(amount);
  }

  breakMirror(mirrorIdx) {
    const mirror = this._mirrors[mirrorIdx];
    if (!mirror || mirror.broken) return;
    mirror.hp -= 30;
    if (mirror.hp <= 0) {
      mirror.broken = true;
      mirror.mesh.material.opacity = 0.15;
      mirror.mesh.material.emissiveIntensity = 0.1;
      mirror.light.intensity = 0;
      this._showPhaseLabel(`Espejo roto (${this._mirrors.filter(m=>m.broken).length}/${MIRROR_COUNT})`, '#88ccff');

      if (this._mirrors.every(m => m.broken)) {
        this._immune = false;
        this._showPhaseLabel('¡VEYRIS EXPUESTA!', '#ffffff');
      }
    }
  }

  _launchShards() {
    if (!this.mesh) return;
    const count = this._phase === 2 ? 8 : 5;
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const dx    = Math.cos(angle);
      const dz    = Math.sin(angle);

      const geo = new THREE.ConeGeometry(0.1, 0.6, 5);
      const mat = new THREE.MeshBasicMaterial({ color: 0x88ccff, transparent: true, opacity: 0.9 });
      const m   = new THREE.Mesh(geo, mat);
      m.position.set(
        this.mesh.position.x,
        1.2,
        this.mesh.position.z
      );
      m.rotation.z = Math.atan2(dz, dx);
      this.scene.add(m);
      this._shards.push({ mesh: m, dx, dz, life: 2.0 });
    }
  }

  _updateShards(delta) {
    const player = window._partyManager?.getActiveCharacter()
                ?? window._player;

    for (let i = this._shards.length - 1; i >= 0; i--) {
      const s = this._shards[i];
      s.life -= delta;
      s.mesh.position.x += s.dx * SHARD_SPEED * delta;
      s.mesh.position.z += s.dz * SHARD_SPEED * delta;

      if (player) {
        const pos = player.root?.position ?? player.position;
        const dx  = pos.x - s.mesh.position.x;
        const dz  = pos.z - s.mesh.position.z;
        if (Math.sqrt(dx*dx + dz*dz) < 0.5) {
          player.takeDamage?.(SHARD_DAMAGE);
          s.life = 0;
        }
      }

      s.mesh.material.opacity = Math.max(0, s.life * 0.45);
      if (s.life <= 0) {
        this.scene.remove(s.mesh);
        s.mesh.geometry.dispose();
        s.mesh.material.dispose();
        this._shards.splice(i, 1);
      }
    }
  }

  _enterPhase2() {
    if (this._light) this._light.color.setHex(0xffffff);
    this._materials[0].emissive.setHex(0xaaccff);
    this._materials[0].emissiveIntensity = 1.2;
    this._showPhaseLabel('¡SEGUNDA FASE!', '#88ccff');
  }

  _showImmune() {
    const el = document.createElement('div');
    Object.assign(el.style, {
      position: 'fixed', top: '42%', left: '50%',
      transform: 'translateX(-50%)',
      fontFamily: 'monospace', fontSize: '11px',
      color: '#88ccff', letterSpacing: '2px',
      pointerEvents: 'none', zIndex: '300',
      opacity: '1', transition: 'opacity 0.4s, top 0.4s',
    });
    el.textContent = '— ROMPE LOS ESPEJOS —';
    document.body.appendChild(el);
    requestAnimationFrame(() => requestAnimationFrame(() => {
      el.style.opacity = '0'; el.style.top = '36%';
    }));
    setTimeout(() => el.remove(), 500);
  }

  _showPhaseLabel(text, color) {
    const el = document.createElement('div');
    Object.assign(el.style, {
      position: 'fixed', top: '32%', left: '50%',
      transform: 'translateX(-50%)',
      fontFamily: "'Cinzel',serif", fontSize: '18px',
      letterSpacing: '3px', color,
      textShadow: `0 0 16px ${color}`,
      pointerEvents: 'none', zIndex: '300',
      opacity: '1', transition: 'opacity 1.2s, top 1.2s',
    });
    el.textContent = text;
    document.body.appendChild(el);
    requestAnimationFrame(() => requestAnimationFrame(() => {
      el.style.opacity = '0'; el.style.top = '24%';
    }));
    setTimeout(() => el.remove(), 1400);
  }

  _restoreColors() {
    this._materials[0]?.color.setHex(0x88ccff);
  }

  _startDeath() {
    for (const s of this._shards) this.scene.remove(s.mesh);
    for (const m of this._mirrors) {
      this.scene.remove(m.mesh);
      this.scene.remove(m.light);
    }
    this._shards  = [];
    this._mirrors = [];
    super._startDeath();
  }
}
