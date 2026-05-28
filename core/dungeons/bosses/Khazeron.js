// core/dungeons/bosses/Khazeron.js — Ashes of the Reborn | Valiant Gaming
import * as THREE from 'three';
import { BaseEnemy, STATE } from '../../enemies/BaseEnemy.js';

const SHADOW_DAMAGE    = 18;
const PORTAL_DAMAGE    = 25;
const INVISIBLE_TIME   = 5.0;
const FOOTPRINT_LIFE   = 2.5;

export class Khazeron extends BaseEnemy {
  constructor(scene, position, player) {
    super(scene, position, player, {
      hp            : 900,
      damage        : 28,
      roamSpeed     : 0,
      chaseSpeed    : 3.0,
      detectRange   : 30,
      attackRange   : 2.5,
      attackCooldown: 2.2,
      respawnTime   : 0,
      deathDuration : 1500,
      name          : 'Kha\'zeron',
      isBoss        : true,
      drops         : { magicEnergy: 80, xp: 300 },
    });
    this._invisible      = false;
    this._invisTimer     = 0;
    this._invisCooldown  = 12.0;
    this._footprints     = [];
    this._shadowZones    = [];
    this._portals        = [];
    this._phase          = 1;
    this._shadowTimer    = 3.0;
    this._lastPos        = null;
  }

  _buildMesh(pos) {
    this.mesh = new THREE.Group();

    // Armadura sombría
    const armorMat = new THREE.MeshStandardMaterial({
      color    : 0x1a0a2a,
      emissive : 0x330066,
      emissiveIntensity: 0.5,
      roughness: 0.3,
      metalness: 0.8,
    });

    const torso = new THREE.Mesh(new THREE.BoxGeometry(1.0, 1.4, 0.7), armorMat);
    torso.position.y = 1.3;
    this.mesh.add(torso);

    const head = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.65, 0.65), armorMat.clone());
    head.position.y = 2.35;
    this.mesh.add(head);

    // Capa de sombra
    const capeMat = new THREE.MeshBasicMaterial({
      color      : 0x110022,
      transparent: true,
      opacity    : 0.7,
      side       : THREE.DoubleSide,
    });
    const cape = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 1.8), capeMat);
    cape.position.set(0, 1.2, -0.4);
    this.mesh.add(cape);
    this._capeMesh = cape;

    // Ojos violetas
    const eyeMat = new THREE.MeshBasicMaterial({ color: 0xcc44ff });
    for (const side of [-0.18, 0.18]) {
      const eye = new THREE.Mesh(new THREE.SphereGeometry(0.09, 6, 6), eyeMat);
      eye.position.set(side, 2.4, 0.34);
      this.mesh.add(eye);
    }

    // Espada de sombra
    const swordMat = new THREE.MeshStandardMaterial({
      color    : 0x4400aa,
      emissive : 0x220066,
      emissiveIntensity: 0.8,
      roughness: 0.1,
      metalness: 0.5,
    });
    const sword = new THREE.Mesh(new THREE.BoxGeometry(0.1, 1.4, 0.1), swordMat);
    sword.position.set(0.65, 1.3, 0);
    this.mesh.add(sword);

    // Brazos
    const armMat = armorMat.clone();
    for (const side of [-1, 1]) {
      const arm = new THREE.Mesh(new THREE.BoxGeometry(0.32, 1.1, 0.32), armMat);
      arm.position.set(side * 0.76, 1.1, 0);
      this.mesh.add(arm);
    }

    // Luz violeta
    const light = new THREE.PointLight(0xcc44ff, 2.5, 16);
    light.position.y = 2;
    this.mesh.add(light);
    this._light = light;

    this.mesh.position.set(pos.x, 0, pos.z);
    this.mesh.scale.setScalar(1.5);
    this._materials = [armorMat];

    // Portales en las 4 esquinas de la sala
    this._spawnPortals(pos);
  }

  _spawnPortals(pos) {
    const corners = [[-9,-9],[9,-9],[-9,9],[9,9]];
    for (const [ox, oz] of corners) {
      const geo = new THREE.TorusGeometry(1.2, 0.2, 8, 24);
      const mat = new THREE.MeshBasicMaterial({
        color      : 0x9933ff,
        transparent: true,
        opacity    : 0.8,
      });
      const m = new THREE.Mesh(geo, mat);
      m.position.set(pos.x + ox, 1.2, pos.z + oz);
      m.rotation.x = Math.PI / 2;
      this.scene.add(m);

      const innerGeo = new THREE.CircleGeometry(1.0, 24);
      const innerMat = new THREE.MeshBasicMaterial({
        color      : 0x220044,
        transparent: true,
        opacity    : 0.6,
        side       : THREE.DoubleSide,
      });
      const inner = new THREE.Mesh(innerGeo, innerMat);
      inner.position.set(pos.x + ox, 1.2, pos.z + oz);
      inner.rotation.x = Math.PI / 2;
      this.scene.add(inner);

      const light = new THREE.PointLight(0x9933ff, 1.5, 6);
      light.position.set(pos.x + ox, 1.5, pos.z + oz);
      this.scene.add(light);

      this._portals.push({
        mesh: m, inner, light,
        worldX: pos.x + ox,
        worldZ: pos.z + oz,
        _angle: Math.random() * Math.PI * 2,
      });
    }
  }

  update(delta) {
    super.update(delta);
    if (!this.mesh || this.dead) return;

    // Fase 2
    if (this._phase === 1 && this.hp < this.maxHp * 0.5) {
      this._phase = 2;
      this._enterPhase2();
    }

    // Animar portales
    for (const p of this._portals) {
      p._angle += delta * 1.5;
      p.mesh.rotation.z = p._angle;
      p.light.intensity = 1.2 + Math.sin(p._angle * 2) * 0.5;
      this._checkPortalCollision(p, delta);
    }

    // Invisibilidad
    if (!this._invisible) {
      this._invisTimer -= delta;
      if (this._invisTimer <= 0) {
        this._goInvisible();
      }
    }

    // Zonas de sombra
    this._shadowTimer -= delta;
    if (this._shadowTimer <= 0) {
      this._shadowTimer = this._phase === 2 ? 2.0 : 3.5;
      this._spawnShadowZone();
    }

    // Huellas si invisible
    if (this._invisible && this.mesh) {
      this._spawnFootprint();
    }

    // Actualizar huellas y zonas
    this._updateFootprints(delta);
    this._updateShadowZones(delta);

    // Capa ondulante
    if (this._capeMesh) {
      this._capeMesh.material.opacity = 0.5 + Math.sin(Date.now() * 0.003) * 0.2;
    }

    this._lastPos = this.mesh.position.clone();
  }

  _goInvisible() {
    if (!this.mesh) return;
    this._invisible = true;
    this._invisTimer = INVISIBLE_TIME;
    this.mesh.traverse(child => {
      if (child.material) {
        child.material.transparent = true;
        child.material.opacity     = 0.08;
      }
    });
    if (this._light) this._light.intensity = 0.3;
    this._showPhaseLabel('¡DESAPARECIÓ!', '#cc44ff');

    setTimeout(() => {
      if (this.dead) return;
      this._reappear();
    }, INVISIBLE_TIME * 1000);
  }

  _reappear() {
    if (!this.mesh) return;
    this._invisible  = false;
    this._invisTimer = this._phase === 2 ? 8.0 : 12.0;
    this.mesh.traverse(child => {
      if (child.material) {
        child.material.opacity = child.material._origOpacity ?? 1.0;
      }
    });
    if (this._light) this._light.intensity = 2.5;

    // Daño de reaparición si está cerca del jugador
    const player = window._partyManager?.getActiveCharacter()
                ?? window._player;
    if (player && this.mesh) {
      const pos = player.root?.position ?? player.position;
      const dx  = pos.x - this.mesh.position.x;
      const dz  = pos.z - this.mesh.position.z;
      if (Math.sqrt(dx*dx + dz*dz) < 3) {
        player.takeDamage?.(SHADOW_DAMAGE);
        this._showPhaseLabel('¡EMBOSCADA!', '#ff44ff');
      }
    }
  }

  _spawnFootprint() {
    if (!this.mesh) return;
    const geo = new THREE.PlaneGeometry(0.4, 0.6);
    const mat = new THREE.MeshBasicMaterial({
      color      : 0x9933ff,
      transparent: true,
      opacity    : 0.5,
      side       : THREE.DoubleSide,
    });
    const m = new THREE.Mesh(geo, mat);
    m.rotation.x = -Math.PI / 2;
    m.position.set(
      this.mesh.position.x + (Math.random() - 0.5) * 0.3,
      0.04,
      this.mesh.position.z + (Math.random() - 0.5) * 0.3
    );
    this.scene.add(m);
    this._footprints.push({ mesh: m, life: FOOTPRINT_LIFE });
  }

  _updateFootprints(delta) {
    for (let i = this._footprints.length - 1; i >= 0; i--) {
      const f = this._footprints[i];
      f.life -= delta;
      f.mesh.material.opacity = Math.max(0, f.life / FOOTPRINT_LIFE * 0.5);
      if (f.life <= 0) {
        this.scene.remove(f.mesh);
        f.mesh.geometry.dispose();
        f.mesh.material.dispose();
        this._footprints.splice(i, 1);
      }
    }
  }

  _spawnShadowZone() {
    if (!this.mesh) return;
    const target = this._getActivePosition();
    const geo = new THREE.CircleGeometry(2.5, 16);
    const mat = new THREE.MeshBasicMaterial({
      color      : 0x330044,
      transparent: true,
      opacity    : 0.6,
      side       : THREE.DoubleSide,
    });
    const m = new THREE.Mesh(geo, mat);
    m.rotation.x = -Math.PI / 2;
    m.position.set(target.x, 0.05, target.z);
    this.scene.add(m);

    // Advertencia antes de activarse
    m.material.color.setHex(0xaa0044);
    setTimeout(() => {
      if (m.parent) m.material.color.setHex(0x330044);
    }, 600);

    this._shadowZones.push({ mesh: m, life: 4.0, active: false, activateIn: 0.7 });
  }

  _updateShadowZones(delta) {
    const player = window._partyManager?.getActiveCharacter()
                ?? window._player;

    for (let i = this._shadowZones.length - 1; i >= 0; i--) {
      const z = this._shadowZones[i];
      z.life -= delta;

      if (!z.active) {
        z.activateIn -= delta;
        if (z.activateIn <= 0) z.active = true;
      }

      if (z.active && player) {
        const pos = player.root?.position ?? player.position;
        const dx  = pos.x - z.mesh.position.x;
        const dz  = pos.z - z.mesh.position.z;
        if (Math.sqrt(dx*dx + dz*dz) < 2.5) {
          player.takeDamage?.(12 * delta);
        }
      }

      z.mesh.material.opacity = Math.max(0, z.life / 4.0 * 0.6);
      if (z.life <= 0) {
        this.scene.remove(z.mesh);
        z.mesh.geometry.dispose();
        z.mesh.material.dispose();
        this._shadowZones.splice(i, 1);
      }
    }
  }

  _checkPortalCollision(portal, delta) {
    const player = window._partyManager?.getActiveCharacter()
                ?? window._player;
    if (!player) return;
    const pos = player.root?.position ?? player.position;
    const dx  = pos.x - portal.worldX;
    const dz  = pos.z - portal.worldZ;
    if (Math.sqrt(dx*dx + dz*dz) < 1.2) {
      // Teletransportar al centro con daño
      if (player.root) {
        player.root.position.set(
          this.mesh.position.x,
          0,
          this.mesh.position.z
        );
      }
      player.takeDamage?.(PORTAL_DAMAGE);
    }
  }

  _enterPhase2() {
    this._materials[0].emissive.setHex(0x660099);
    this._materials[0].emissiveIntensity = 1.0;
    if (this._light) this._light.color.setHex(0xff44ff);
    this._showPhaseLabel('¡SEGUNDA FASE!', '#cc44ff');
    // Portales más agresivos
    for (const p of this._portals) {
      p.light.intensity = 3;
      p.mesh.material.color.setHex(0xff44ff);
    }
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
    this._materials[0]?.color.setHex(0x1a0a2a);
  }

  _startDeath() {
    for (const f of this._footprints) this.scene.remove(f.mesh);
    for (const z of this._shadowZones) this.scene.remove(z.mesh);
    for (const p of this._portals) {
      this.scene.remove(p.mesh);
      this.scene.remove(p.inner);
      this.scene.remove(p.light);
    }
    this._footprints  = [];
    this._shadowZones = [];
    this._portals     = [];
    super._startDeath();
  }
}
