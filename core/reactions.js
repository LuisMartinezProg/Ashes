// core/reactions.js — Reacciones elementales | Ashes of the Reborn | Valiant Gaming
import * as THREE from 'three';

// ── Tabla de reacciones ─────────────────────────────────────────────────────
// aura: elemento aplicado primero al enemigo
// trigger: elemento que activa la reacción
export const REACTION_TABLE = {
  'fire+ice'   : 'vapor',
  'ice+fire'   : 'vapor',
  'storm+rain' : 'discharge',
  'rain+storm' : 'discharge',
  'ice+rain'   : 'blizzard',
  'rain+ice'   : 'blizzard',
  'wind+rain'  : 'cyclone',
  'rain+wind'  : 'cyclone',
  'execution+shadow': 'dark_sentence',
  'shadow+execution': 'dark_sentence',
};

// ── Elementos por subtipo de arma ────────────────────────────────────────────
export const SUBTYPE_ELEMENT = {
  // Magia
  fire      : 'fire',
  ice       : 'ice',
  plant     : 'plant',
  wind      : 'wind',
  // Katana
  speed     : 'speed',
  shadow    : 'shadow',
  storm     : 'storm',
  honor     : 'honor',
  // Espada
  strength  : 'strength',
  defense   : 'defense',
  battle    : 'battle',
  execution : 'execution',
  // Arco
  precision : 'precision',
  poison    : 'poison',
  rain      : 'rain',
  agility   : 'agility',
};

// ── Duración de auras en ms ──────────────────────────────────────────────────
export const AURA_DURATION = 4000;

// ── Motor de reacciones ──────────────────────────────────────────────────────
export class ReactionEngine {
  constructor(scene) {
    this.scene   = scene;
    this._active = []; // VFX activos
    // auras: Map<enemy, { element, timer }>
    this._auras  = new Map();
  }

  // Aplica un elemento a un enemigo. Retorna el nombre de la reacción si ocurre.
  applyElement(enemy, element) {
    if (!enemy || !element) return null;

    const existing = this._auras.get(enemy);

    if (existing) {
      const key1 = `${existing.element}+${element}`;
      const key2 = `${element}+${existing.element}`;
      const reaction = REACTION_TABLE[key1] || REACTION_TABLE[key2] || null;

      if (reaction) {
        this._auras.delete(enemy);
        this._triggerReaction(reaction, enemy);
        return reaction;
      }

      // Sin reacción — sobreescribe aura
      this._auras.set(enemy, { element, timer: AURA_DURATION });
      return null;
    }

    // Primera aplicación — solo guarda aura
    this._auras.set(enemy, { element, timer: AURA_DURATION });
    return null;
  }

  // Llama en el game loop
  update(delta) {
    // Actualizar timers de auras
    for (const [enemy, aura] of this._auras) {
      aura.timer -= delta * 1000;
      if (aura.timer <= 0) this._auras.delete(enemy);
    }

    // Actualizar VFX activos
    for (let i = this._active.length - 1; i >= 0; i--) {
      const fx = this._active[i];
      fx.timer -= delta * 1000;
      const t = Math.max(0, fx.timer / fx.maxTimer);

      if (fx.type === 'ring') {
        fx.mesh.scale.setScalar(1 + (1 - t) * fx.expandScale);
        fx.mesh.material.opacity = t * fx.baseOpacity;
      } else if (fx.type === 'sphere') {
        fx.mesh.material.opacity = t * fx.baseOpacity;
        fx.mesh.scale.setScalar(1 + (1 - t) * fx.expandScale);
      } else if (fx.type === 'pillar') {
        fx.mesh.material.opacity = t * fx.baseOpacity;
        fx.mesh.scale.y = 0.4 + t * 0.6;
      } else if (fx.type === 'rotate') {
        fx.mesh.rotation.y += delta * fx.rotSpeed;
        fx.mesh.material.opacity = t * fx.baseOpacity;
      } else if (fx.type === 'trail') {
        fx.mesh.material.opacity = t * fx.baseOpacity;
      }

      if (fx.timer <= 0) {
        this.scene.remove(fx.mesh);
        fx.mesh.geometry.dispose();
        fx.mesh.material.dispose();
        this._active.splice(i, 1);
      }
    }
  }

  getAura(enemy) {
    return this._auras.get(enemy)?.element ?? null;
  }

  clearAura(enemy) {
    this._auras.delete(enemy);
  }

  // ── Reacciones ─────────────────────────────────────────────────────────────

  _triggerReaction(reaction, enemy) {
    if (!enemy.mesh) return;
    const pos = enemy.mesh.position.clone();

    switch (reaction) {
      case 'vapor':         this._vapor(enemy, pos);         break;
      case 'discharge':     this._discharge(enemy, pos);     break;
      case 'blizzard':      this._blizzard(enemy, pos);      break;
      case 'cyclone':       this._cyclone(enemy, pos);       break;
      case 'dark_sentence': this._darkSentence(enemy, pos);  break;
    }
  }

  // ── Vapor (Fuego + Hielo) ────────────────────────────────────────────────
  // Daño masivo único, nube blanca expansiva
  _vapor(enemy, pos) {
    const DAMAGE = 280;
    enemy.takeDamage(DAMAGE);
    this._spawnFloatingText(pos, `VAPOR +${DAMAGE}`, '#ffffff');

    // Esfera blanca explosiva
    const geo  = new THREE.SphereGeometry(0.8, 12, 12);
    const mat  = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.9 });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.copy(pos).add(new THREE.Vector3(0, 1, 0));
    this.scene.add(mesh);
    this._active.push({ mesh, type: 'sphere', timer: 600, maxTimer: 600, expandScale: 4.0, baseOpacity: 0.9 });

    // Anillos de vapor
    [0.5, 1.2, 2.2, 3.5].forEach((r, i) => {
      const rGeo = new THREE.RingGeometry(r - 0.1, r, 14);
      const rMat = new THREE.MeshBasicMaterial({ color: 0xaaddff, transparent: true, opacity: 0.7, side: THREE.DoubleSide });
      const ring = new THREE.Mesh(rGeo, rMat);
      ring.position.copy(pos).add(new THREE.Vector3(0, 0.05, 0));
      ring.rotation.x = -Math.PI / 2;
      this.scene.add(ring);
      this._active.push({ mesh: ring, type: 'ring', timer: 700 - i * 60, maxTimer: 700, expandScale: 3.5, baseOpacity: 0.7 });
    });

    // Nube giratoria
    const cGeo  = new THREE.SphereGeometry(2.0, 10, 6);
    const cMat  = new THREE.MeshBasicMaterial({ color: 0xcceeff, transparent: true, opacity: 0.35 });
    const cloud = new THREE.Mesh(cGeo, cMat);
    cloud.scale.y = 0.3;
    cloud.position.copy(pos).add(new THREE.Vector3(0, 1.5, 0));
    this.scene.add(cloud);
    this._active.push({ mesh: cloud, type: 'rotate', timer: 1200, maxTimer: 1200, rotSpeed: 1.5, baseOpacity: 0.35 });
  }

  // ── Descarga (Tormenta + Lluvia) ─────────────────────────────────────────
  // AoE eléctrico, stun, rayos
  _discharge(enemy, pos) {
    const DAMAGE     = 200;
    const AOE_RANGE  = 5.0;
    const STUN_SEC   = 2.5;

    // Daño + stun al objetivo
    enemy.takeDamage(DAMAGE);
    enemy.applySlow?.(0, STUN_SEC);
    this._spawnFloatingText(pos, `DESCARGA +${DAMAGE}`, '#ffff44');

    // Buscar enemigos en AoE
    if (window._enemies) {
      for (const e of window._enemies) {
        if (e === enemy || e.isDead?.() || !e.mesh) continue;
        const dx = pos.x - e.mesh.position.x;
        const dz = pos.z - e.mesh.position.z;
        if (Math.sqrt(dx*dx + dz*dz) <= AOE_RANGE) {
          e.takeDamage(DAMAGE * 0.6);
          e.applySlow?.(0.3, 1.5);
        }
      }
    }

    // Zona eléctrica en suelo
    const zGeo = new THREE.CircleGeometry(AOE_RANGE, 16);
    const zMat = new THREE.MeshBasicMaterial({ color: 0xffff00, transparent: true, opacity: 0.2, side: THREE.DoubleSide });
    const zone = new THREE.Mesh(zGeo, zMat);
    zone.position.copy(pos).add(new THREE.Vector3(0, 0.06, 0));
    zone.rotation.x = -Math.PI / 2;
    this.scene.add(zone);
    this._active.push({ mesh: zone, type: 'ring', timer: 800, maxTimer: 800, expandScale: 0.3, baseOpacity: 0.2 });

    // Anillos eléctricos
    [0.6, 1.4, 2.8, 4.5].forEach((r, i) => {
      const rGeo = new THREE.RingGeometry(r - 0.1, r, 14);
      const rMat = new THREE.MeshBasicMaterial({ color: 0xffff44, transparent: true, opacity: 0.7, side: THREE.DoubleSide });
      const ring = new THREE.Mesh(rGeo, rMat);
      ring.position.copy(pos).add(new THREE.Vector3(0, 0.05, 0));
      ring.rotation.x = -Math.PI / 2;
      this.scene.add(ring);
      this._active.push({ mesh: ring, type: 'ring', timer: 600 - i * 60, maxTimer: 600, expandScale: 2.0, baseOpacity: 0.7 });
    });

    // Rayos verticales
    for (let b = 0; b < 5; b++) {
      const angle = (Math.PI * 2 / 5) * b;
      const dist  = Math.random() * AOE_RANGE * 0.8;
      setTimeout(() => {
        const bGeo = new THREE.CylinderGeometry(0.05, 0.05, 5, 4);
        const bMat = new THREE.MeshBasicMaterial({ color: 0xffffaa, transparent: true, opacity: 1.0 });
        const bolt = new THREE.Mesh(bGeo, bMat);
        bolt.position.set(
          pos.x + Math.cos(angle) * dist,
          2.5,
          pos.z + Math.sin(angle) * dist
        );
        this.scene.add(bolt);
        this._active.push({ mesh: bolt, type: 'trail', timer: 200, maxTimer: 200, baseOpacity: 1.0 });
      }, b * 80);
    }
  }

  // ── Ventisca (Hielo + Lluvia) ────────────────────────────────────────────
  // Congela área, slow fuerte
  _blizzard(enemy, pos) {
    const DAMAGE    = 150;
    const AOE_RANGE = 5.5;
    const SLOW      = 0.15;
    const SLOW_SEC  = 4.0;

    enemy.takeDamage(DAMAGE);
    enemy.applySlow?.(SLOW, SLOW_SEC);
    this._spawnFloatingText(pos, `VENTISCA +${DAMAGE}`, '#88ddff');

    if (window._enemies) {
      for (const e of window._enemies) {
        if (e === enemy || e.isDead?.() || !e.mesh) continue;
        const dx = pos.x - e.mesh.position.x;
        const dz = pos.z - e.mesh.position.z;
        if (Math.sqrt(dx*dx + dz*dz) <= AOE_RANGE) {
          e.takeDamage(DAMAGE * 0.7);
          e.applySlow?.(SLOW, SLOW_SEC);
        }
      }
    }

    // Zona de hielo
    const zGeo = new THREE.CircleGeometry(AOE_RANGE, 16);
    const zMat = new THREE.MeshBasicMaterial({ color: 0x88ccff, transparent: true, opacity: 0.25, side: THREE.DoubleSide });
    const zone = new THREE.Mesh(zGeo, zMat);
    zone.position.copy(pos).add(new THREE.Vector3(0, 0.06, 0));
    zone.rotation.x = -Math.PI / 2;
    this.scene.add(zone);
    this._active.push({ mesh: zone, type: 'ring', timer: 2000, maxTimer: 2000, expandScale: 0.1, baseOpacity: 0.25 });

    // Cristales de hielo verticales
    for (let c = 0; c < 6; c++) {
      const angle = (Math.PI * 2 / 6) * c;
      const dist  = 1.0 + Math.random() * (AOE_RANGE - 1);
      const cGeo  = new THREE.CylinderGeometry(0.08, 0.2, 1.2 + Math.random() * 1.5, 5);
      const cMat  = new THREE.MeshBasicMaterial({ color: 0xaaddff, transparent: true, opacity: 0.8 });
      const crystal = new THREE.Mesh(cGeo, cMat);
      crystal.position.set(
        pos.x + Math.cos(angle) * dist,
        0.6,
        pos.z + Math.sin(angle) * dist
      );
      this.scene.add(crystal);
      this._active.push({ mesh: crystal, type: 'pillar', timer: 1800, maxTimer: 1800, baseOpacity: 0.8 });
    }

    // Anillos de hielo
    [0.5, 1.5, 3.0, 5.0].forEach((r, i) => {
      const rGeo = new THREE.RingGeometry(r - 0.1, r, 14);
      const rMat = new THREE.MeshBasicMaterial({ color: 0x88ccff, transparent: true, opacity: 0.6, side: THREE.DoubleSide });
      const ring = new THREE.Mesh(rGeo, rMat);
      ring.position.copy(pos).add(new THREE.Vector3(0, 0.05, 0));
      ring.rotation.x = -Math.PI / 2;
      this.scene.add(ring);
      this._active.push({ mesh: ring, type: 'ring', timer: 700 - i * 60, maxTimer: 700, expandScale: 1.5, baseOpacity: 0.6 });
    });
  }

  // ── Ciclón (Viento + Lluvia) ─────────────────────────────────────────────
  // Succiona enemigos al centro
  _cyclone(enemy, pos) {
    const DAMAGE    = 120;
    const AOE_RANGE = 7.0;
    const PULL_STR  = 6.0;
    const DURATION  = 2000;

    enemy.takeDamage(DAMAGE);
    this._spawnFloatingText(pos, `CICLÓN +${DAMAGE}`, '#aaeeff');

    // Succionar enemigos
    if (window._enemies) {
      for (const e of window._enemies) {
        if (e.isDead?.() || !e.mesh) continue;
        const dx = pos.x - e.mesh.position.x;
        const dz = pos.z - e.mesh.position.z;
        const d  = Math.sqrt(dx*dx + dz*dz);
        if (d <= AOE_RANGE && d > 0.5) {
          // Pull gradual con setTimeout
          const steps = 8;
          for (let s = 1; s <= steps; s++) {
            setTimeout(() => {
              if (e.isDead?.() || !e.mesh) return;
              e.mesh.position.x += (dx / d) * (PULL_STR / steps);
              e.mesh.position.z += (dz / d) * (PULL_STR / steps);
              e.takeDamage(DAMAGE * 0.05);
            }, s * (DURATION / steps));
          }
        }
      }
    }

    // Tornado visual — columna giratoria
    const tGeo  = new THREE.CylinderGeometry(0.2, 2.0, 6, 8, 1, true);
    const tMat  = new THREE.MeshBasicMaterial({ color: 0x88ddff, transparent: true, opacity: 0.4, side: THREE.DoubleSide });
    const tornado = new THREE.Mesh(tGeo, tMat);
    tornado.position.copy(pos).add(new THREE.Vector3(0, 3, 0));
    this.scene.add(tornado);
    this._active.push({ mesh: tornado, type: 'rotate', timer: DURATION, maxTimer: DURATION, rotSpeed: 4.0, baseOpacity: 0.4 });

    // Anillos giratorios en suelo
    [1.0, 2.5, 4.5, 6.5].forEach((r, i) => {
      const rGeo = new THREE.RingGeometry(r - 0.15, r, 16);
      const rMat = new THREE.MeshBasicMaterial({ color: 0xaaeeff, transparent: true, opacity: 0.55, side: THREE.DoubleSide });
      const ring = new THREE.Mesh(rGeo, rMat);
      ring.position.copy(pos).add(new THREE.Vector3(0, 0.05, 0));
      ring.rotation.x = -Math.PI / 2;
      this.scene.add(ring);
      this._active.push({ mesh: ring, type: 'ring', timer: 800 - i * 70, maxTimer: 800, expandScale: 0.5, baseOpacity: 0.55 });
    });
  }

  // ── Sentencia Oscura (Ejecución + Sombra) ────────────────────────────────
  // Ejecución instantánea si HP < 20%, si no daño masivo + slow
  _darkSentence(enemy, pos) {
    const isLow = enemy.hp !== undefined && enemy.maxHp !== undefined
      ? (enemy.hp / enemy.maxHp) < 0.20
      : false;

    const DAMAGE = isLow ? enemy.hp * 10 : 350; // mata instantáneo si bajo
    enemy.takeDamage(DAMAGE);
    if (!isLow) enemy.applySlow?.(0.1, 3);

    const label = isLow ? `☠ SENTENCIA` : `OSCURIDAD +${DAMAGE}`;
    this._spawnFloatingText(pos, label, '#cc44ff');

    const color = isLow ? 0xff0000 : 0x8800cc;

    // Pilar oscuro
    const pGeo   = new THREE.CylinderGeometry(0.15, 0.6, 8, 7);
    const pMat   = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.9 });
    const pillar = new THREE.Mesh(pGeo, pMat);
    pillar.position.copy(pos).add(new THREE.Vector3(0, 4, 0));
    this.scene.add(pillar);
    this._active.push({ mesh: pillar, type: 'pillar', timer: 700, maxTimer: 700, baseOpacity: 0.9 });

    // Esfera oscura
    const sGeo   = new THREE.SphereGeometry(0.7, 10, 10);
    const sMat   = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.85 });
    const sphere = new THREE.Mesh(sGeo, sMat);
    sphere.position.copy(pos).add(new THREE.Vector3(0, 1, 0));
    this.scene.add(sphere);
    this._active.push({ mesh: sphere, type: 'sphere', timer: 500, maxTimer: 500, expandScale: 3.0, baseOpacity: 0.85 });

    // Anillos oscuros
    [0.4, 1.0, 2.0, 3.2].forEach((r, i) => {
      const rGeo = new THREE.RingGeometry(r - 0.1, r, 12);
      const rMat = new THREE.MeshBasicMaterial({ color: 0xcc44ff, transparent: true, opacity: 0.7, side: THREE.DoubleSide });
      const ring = new THREE.Mesh(rGeo, rMat);
      ring.position.copy(pos).add(new THREE.Vector3(0, 0.05, 0));
      ring.rotation.x = -Math.PI / 2;
      this.scene.add(ring);
      this._active.push({ mesh: ring, type: 'ring', timer: 600 - i * 60, maxTimer: 600, expandScale: 2.5, baseOpacity: 0.7 });
    });
  }

  // ── Texto flotante ────────────────────────────────────────────────────────
  _spawnFloatingText(pos, text, color) {
    const el = document.createElement('div');
    Object.assign(el.style, {
      position     : 'fixed',
      fontFamily   : "'Cinzel', serif",
      fontSize     : '14px',
      fontWeight   : 'bold',
      letterSpacing: '2px',
      color,
      pointerEvents: 'none',
      zIndex       : '300',
      textShadow   : '0 0 8px ' + color,
      transition   : 'bottom 1s ease, opacity 1s ease',
      opacity      : '1',
      left         : '50%',
      bottom       : '260px',
      transform    : 'translateX(-50%)',
    });
    el.textContent = text;
    document.body.appendChild(el);
    requestAnimationFrame(() => requestAnimationFrame(() => {
      el.style.bottom  = '320px';
      el.style.opacity = '0';
    }));
    setTimeout(() => el.remove(), 1100);
  }
        }
