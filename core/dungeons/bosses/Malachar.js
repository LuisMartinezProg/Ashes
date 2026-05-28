// core/dungeons/bosses/Malachar.js — Ashes of the Reborn | Valiant Gaming
import * as THREE from 'three';
import { BaseEnemy, STATE } from '../../enemies/BaseEnemy.js';

const WEAK_POINTS     = 4;
const SEISMIC_COOLDOWN = 4.0;
const SEISMIC_DAMAGE   = 20;
const SEISMIC_RADIUS   = 5.0;
const CRACK_SPEED      = 6.0;

export class Malachar extends BaseEnemy {
  constructor(scene, position, player) {
    super(scene, position, player, {
      hp            : 800,
      damage        : 25,
      roamSpeed     : 0,
      chaseSpeed    : 1.8,
      detectRange   : 30,
      attackRange   : 3.0,
      attackCooldown: 3.0,
      respawnTime   : 0,
      deathDuration : 1500,
      name          : 'Malachar',
      isBoss        : true,
      drops         : { magicEnergy: 60, xp: 300 },
    });
    this._seismicTimer  = SEISMIC_COOLDOWN;
    this._weakPoints    = [];
    this._cracks        = [];
    this._activeWeakIdx = -1;
    this._phase         = 1;
    this._damagable     = false;
  }

  _buildMesh(pos) {
    this.mesh = new THREE.Group();

    // Cuerpo — golem masivo
    const stoneMat = new THREE.MeshStandardMaterial({
      color    : 0x887766,
      emissive : 0x332211,
      emissiveIntensity: 0.2,
      roughness: 0.95,
      metalness: 0.1,
    });

    const torso = new THREE.Mesh(new THREE.BoxGeometry(1.4, 1.8, 1.0), stoneMat);
    torso.position.y = 1.4;
    this.mesh.add(torso);

    const head = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.9, 0.9), stoneMat);
    head.position.y = 2.75;
    this.mesh.add(head);

    // Ojos brillantes
    const eyeMat = new THREE.MeshBasicMaterial({ color: 0xff6600 });
    for (const side of [-0.22, 0.22]) {
      const eye = new THREE.Mesh(new THREE.SphereGeometry(0.1, 6, 6), eyeMat);
      eye.position.set(side, 2.8, 0.46);
      this.mesh.add(eye);
    }

    // Brazos
    for (const side of [-1, 1]) {
      const arm = new THREE.Mesh(new THREE.BoxGeometry(0.5, 1.6, 0.5), stoneMat.clone());
      arm.position.set(side * 1.1, 1.2, 0);
      arm.rotation.z = side * 0.15;
      this.mesh.add(arm);
    }

    // Piernas
    for (const side of [-1, 1]) {
      const leg = new THREE.Mesh(new THREE.BoxGeometry(0.5, 1.2, 0.5), stoneMat.clone());
      leg.position.set(side * 0.45, 0.4, 0);
      this.mesh.add(leg);
    }

    // Puntos débiles — brillan en naranja
    const weakMat = new THREE.MeshBasicMaterial({ color: 0xff6600, transparent: true, opacity: 0 });
    const weakPositions = [
      [0, 1.4, 0.55], [0.72, 1.5, 0], [-0.72, 1.5, 0], [0, 2.75, 0.5],
    ];
    for (let i = 0; i < WEAK_POINTS; i++) {
      const wp = new THREE.Mesh(new THREE.SphereGeometry(0.18, 8, 8), weakMat.clone());
      wp.position.set(...weakPositions[i]);
      this.mesh.add(wp);
      this._weakPoints.push({ mesh: wp, active: false, idx: i });
    }

    // Luz naranja
    const light = new THREE.PointLight(0xff6600, 2, 15);
    light.position.y = 2;
    this.mesh.add(light);
    this._light = light;

    // Luz de suelo
    const groundLight = new THREE.PointLight(0x886644, 1, 8);
    groundLight.position.y = 0.2;
    this.mesh.add(groundLight);

    this.mesh.position.set(pos.x, 0, pos.z);
    this.mesh.scale.setScalar(1.6);
    this._materials = [stoneMat];
  }

  update(delta) {
    super.update(delta);
    if (!this.mesh || this.dead) return;

    // Fase 2 a mitad de HP
    if (this._phase === 1 && this.hp < this.maxHp * 0.5) {
      this._phase = 2;
      this._enterPhase2();
    }

    // Activar punto débil aleatorio
    if (this._activeWeakIdx === -1) {
      this._activateRandomWeak();
    }

    // Parpadeo de puntos débiles
    for (const wp of this._weakPoints) {
      if (wp.active) {
        wp.mesh.material.opacity = 0.6 + Math.sin(Date.now() * 0.006) * 0.4;
      }
    }

    // Golpe sísmico
    this._seismicTimer -= delta;
    if (this._seismicTimer <= 0) {
      this._seismicTimer = this._phase === 2
        ? SEISMIC_COOLDOWN * 0.6
        : SEISMIC_COOLDOWN;
      this._seismicAttack();
    }

    // Actualizar grietas
    this._updateCracks(delta);

    // Temblar en fase 2
    if (this._phase === 2 && this.mesh) {
      this.mesh.position.x += (Math.random() - 0.5) * 0.02;
      this.mesh.position.z += (Math.random() - 0.5) * 0.02;
    }
  }

  takeDamage(amount) {
    if (!this._damagable) {
      this._showImmune();
      return;
    }
    super.takeDamage(amount);
    // Desactivar punto débil al recibir daño
    this._deactivateCurrentWeak();
  }

  _activateRandomWeak() {
    const idx = Math.floor(Math.random() * WEAK_POINTS);
    this._activeWeakIdx = idx;
    const wp = this._weakPoints[idx];
    wp.active = true;
    wp.mesh.material.opacity = 1;
    this._damagable = true;

    // Se desactiva solo después de 4s
    setTimeout(() => {
      if (this.dead) return;
      this._deactivateCurrentWeak();
    }, 4000);
  }

  _deactivateCurrentWeak() {
    if (this._activeWeakIdx === -1) return;
    const wp = this._weakPoints[this._activeWeakIdx];
    wp.active = false;
    wp.mesh.material.opacity = 0;
    this._activeWeakIdx = -1;
    this._damagable = false;
    setTimeout(() => {
      if (!this.dead) this._activateRandomWeak();
    }, 1500);
  }

  _seismicAttack() {
    if (!this.mesh) return;
    const ox = this.mesh.position.x;
    const oz = this.mesh.position.z;

    // Lanzar grietas en 4 direcciones
    const dirs = [[1,0],[-1,0],[0,1],[0,-1]];
    for (const [dx, dz] of dirs) {
      this._spawnCrack(ox, oz, dx, dz);
    }

    // Onda de área
    const geo = new THREE.RingGeometry(0.2, 0.4, 20);
    const mat = new THREE.MeshBasicMaterial({
      color: 0xcc8844, transparent: true, opacity: 0.9, side: THREE.DoubleSide,
    });
    const ring = new THREE.Mesh(geo, mat);
    ring.rotation.x = -Math.PI / 2;
    ring.position.set(ox, 0.1, oz);
    this.scene.add(ring);

    const start = performance.now();
    const expand = () => {
      const t = (performance.now() - start) / 700;
      ring.scale.setScalar(1 + t * SEISMIC_RADIUS * 2);
      ring.material.opacity = Math.max(0, 0.9 - t);
      if (t < 1) requestAnimationFrame(expand);
      else { this.scene.remove(ring); geo.dispose(); mat.dispose(); }
    };
    requestAnimationFrame(expand);

    // Daño al jugador
    const player = window._partyManager?.getActiveCharacter()
                ?? window._player;
    if (player) {
      const pos = player.root?.position ?? player.position;
      const dx  = pos.x - ox;
      const dz  = pos.z - oz;
      if (Math.sqrt(dx*dx + dz*dz) < SEISMIC_RADIUS) {
        player.takeDamage?.(SEISMIC_DAMAGE);
      }
    }
  }

  _spawnCrack(ox, oz, dx, dz) {
    const geo = new THREE.PlaneGeometry(0.3, 0.8);
    const mat = new THREE.MeshBasicMaterial({
      color: 0xff6600, transparent: true, opacity: 0.85, side: THREE.DoubleSide,
    });
    const m = new THREE.Mesh(geo, mat);
    m.rotation.x = -Math.PI / 2;
    m.position.set(ox, 0.06, oz);
    this.scene.add(m);
    this._cracks.push({ mesh: m, dx, dz, life: 2.0, speed: CRACK_SPEED });
  }

  _updateCracks(delta) {
    const player = window._partyManager?.getActiveCharacter()
                ?? window._player;

    for (let i = this._cracks.length - 1; i >= 0; i--) {
      const c = this._cracks[i];
      c.life -= delta;
      c.mesh.position.x += c.dx * c.speed * delta;
      c.mesh.position.z += c.dz * c.speed * delta;

      if (player) {
        const pos = player.root?.position ?? player.position;
        const dx  = pos.x - c.mesh.position.x;
        const dz  = pos.z - c.mesh.position.z;
        if (Math.sqrt(dx*dx + dz*dz) < 0.5) {
          player.takeDamage?.(8);
          c.life = 0;
        }
      }

      c.mesh.material.opacity = Math.max(0, c.life * 0.4);
      if (c.life <= 0) {
        this.scene.remove(c.mesh);
        c.mesh.geometry.dispose();
        c.mesh.material.dispose();
        this._cracks.splice(i, 1);
      }
    }
  }

  _enterPhase2() {
    if (!this.mesh) return;
    // Brillar rojo
    this._materials[0].emissive.setHex(0x661100);
    this._materials[0].emissiveIntensity = 0.6;
    if (this._light) this._light.color.setHex(0xff2200);

    this._showPhaseLabel('¡SEGUNDA FASE!', '#ff6600');
  }

  _showImmune() {
    const el = document.createElement('div');
    Object.assign(el.style, {
      position: 'fixed', top: '42%', left: '50%',
      transform: 'translateX(-50%)',
      fontFamily: 'monospace', fontSize: '11px',
      color: '#888888', letterSpacing: '2px',
      pointerEvents: 'none', zIndex: '300',
      opacity: '1', transition: 'opacity 0.4s, top 0.4s',
    });
    el.textContent = '— INMUNE —';
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
      fontFamily: "'Cinzel',serif", fontSize: '20px',
      letterSpacing: '4px', color,
      textShadow: `0 0 20px ${color}`,
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
    this._materials[0]?.color.setHex(0x887766);
  }

  _startDeath() {
    for (const c of this._cracks) this.scene.remove(c.mesh);
    this._cracks = [];
    super._startDeath();
  }
}
