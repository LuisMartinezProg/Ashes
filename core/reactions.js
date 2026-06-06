// core/reactions.js — Reacciones elementales | Ashes of the Reborn | Valiant Gaming
import * as THREE from 'three';

// ── Tabla de reacciones ─────────────────────────────────────────────────────
export const REACTION_TABLE = {
  // Reacciones originales
  'fire+ice'        : 'vapor',
  'ice+fire'        : 'vapor',
  'storm+rain'      : 'discharge',
  'rain+storm'      : 'discharge',
  'ice+rain'        : 'blizzard',
  'rain+ice'        : 'blizzard',
  'wind+rain'       : 'cyclone',
  'rain+wind'       : 'cyclone',
  'execution+shadow': 'dark_sentence',
  'shadow+execution': 'dark_sentence',

  // ── Nuevas reacciones elementales ─────────────────────────────────────────
  'umbral+astral'   : 'eclipse',
  'astral+umbral'   : 'eclipse',
  'umbral+elemental': 'dark_condemnation',
  'elemental+umbral': 'dark_condemnation',
  'astral+elemental': 'solar_nova',
  'elemental+astral': 'solar_nova',
  'arcanum+umbral'  : 'fracture',
  'umbral+arcanum'  : 'fracture',
  'vital+astral'    : 'resurgence',
  'astral+vital'    : 'resurgence',
  'elemental+arcanum': 'overload',
  'arcanum+elemental': 'overload',
};

// ── Elementos por subtipo ────────────────────────────────────────────────────
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
  // ── Elementos de personajes ───────────────────────────────────────────────
  umbral    : 'umbral',
  astral    : 'astral',
  elemental : 'elemental',
  arcanum   : 'arcanum',
  vital     : 'vital',
  spiritual : 'spiritual',
};

export const AURA_DURATION = 4000;

export class ReactionEngine {
  constructor(scene) {
    this.scene   = scene;
    this._active = [];
    this._auras  = new Map();
  }

  applyElement(enemy, element) {
    if (!enemy || !element) return null;

    const existing = this._auras.get(enemy);

    if (existing) {
      // Mismo elemento — neutro, sin reacción
      if (existing.element === element) return null;

      const key1     = `${existing.element}+${element}`;
      const key2     = `${element}+${existing.element}`;
      const reaction = REACTION_TABLE[key1] || REACTION_TABLE[key2] || null;

      if (reaction) {
        this._auras.delete(enemy);
        this._triggerReaction(reaction, enemy);
        return reaction;
      }

      this._auras.set(enemy, { element, timer: AURA_DURATION });
      return null;
    }

    this._auras.set(enemy, { element, timer: AURA_DURATION });
    return null;
  }

  update(delta) {
    for (const [enemy, aura] of this._auras) {
      aura.timer -= delta * 1000;
      if (aura.timer <= 0) this._auras.delete(enemy);
    }

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

  getAura(enemy)   { return this._auras.get(enemy)?.element ?? null; }
  clearAura(enemy) { this._auras.delete(enemy); }

  _triggerReaction(reaction, enemy) {
    if (!enemy.mesh) return;
    const pos = enemy.mesh.position.clone();

    switch (reaction) {
      case 'vapor'            : this._vapor(enemy, pos);           break;
      case 'discharge'        : this._discharge(enemy, pos);       break;
      case 'blizzard'         : this._blizzard(enemy, pos);        break;
      case 'cyclone'          : this._cyclone(enemy, pos);         break;
      case 'dark_sentence'    : this._darkSentence(enemy, pos);    break;
      case 'eclipse'          : this._eclipse(enemy, pos);         break;
      case 'dark_condemnation': this._darkCondemnation(enemy, pos);break;
      case 'solar_nova'       : this._solarNova(enemy, pos);       break;
      case 'fracture'         : this._fracture(enemy, pos);        break;
      case 'resurgence'       : this._resurgence(enemy, pos);      break;
      case 'overload'         : this._overload(enemy, pos);        break;
    }
  }

  // ── Reacciones originales (sin cambios) ──────────────────────────────────

  _vapor(enemy, pos) {
    const DAMAGE = 280;
    enemy.takeDamage(DAMAGE);
    this._spawnFloatingText(pos, `VAPOR +${DAMAGE}`, '#ffffff');
    const geo  = new THREE.SphereGeometry(0.8, 12, 12);
    const mat  = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.9 });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.copy(pos).add(new THREE.Vector3(0, 1, 0));
    this.scene.add(mesh);
    this._active.push({ mesh, type: 'sphere', timer: 600, maxTimer: 600, expandScale: 4.0, baseOpacity: 0.9 });
    [0.5, 1.2, 2.2, 3.5].forEach((r, i) => {
      const rGeo = new THREE.RingGeometry(r - 0.1, r, 14);
      const rMat = new THREE.MeshBasicMaterial({ color: 0xaaddff, transparent: true, opacity: 0.7, side: THREE.DoubleSide });
      const ring = new THREE.Mesh(rGeo, rMat);
      ring.position.copy(pos).add(new THREE.Vector3(0, 0.05, 0));
      ring.rotation.x = -Math.PI / 2;
      this.scene.add(ring);
      this._active.push({ mesh: ring, type: 'ring', timer: 700 - i * 60, maxTimer: 700, expandScale: 3.5, baseOpacity: 0.7 });
    });
  }

  _discharge(enemy, pos) {
    const DAMAGE = 200; const AOE_RANGE = 5.0; const STUN_SEC = 2.5;
    enemy.takeDamage(DAMAGE);
    enemy.applySlow?.(0, STUN_SEC);
    this._spawnFloatingText(pos, `DESCARGA +${DAMAGE}`, '#ffff44');
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
    [0.6, 1.4, 2.8, 4.5].forEach((r, i) => {
      const rGeo = new THREE.RingGeometry(r - 0.1, r, 14);
      const rMat = new THREE.MeshBasicMaterial({ color: 0xffff44, transparent: true, opacity: 0.7, side: THREE.DoubleSide });
      const ring = new THREE.Mesh(rGeo, rMat);
      ring.position.copy(pos).add(new THREE.Vector3(0, 0.05, 0));
      ring.rotation.x = -Math.PI / 2;
      this.scene.add(ring);
      this._active.push({ mesh: ring, type: 'ring', timer: 600 - i * 60, maxTimer: 600, expandScale: 2.0, baseOpacity: 0.7 });
    });
  }

  _blizzard(enemy, pos) {
    const DAMAGE = 150; const AOE_RANGE = 5.5; const SLOW = 0.15; const SLOW_SEC = 4.0;
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

  _cyclone(enemy, pos) {
    const DAMAGE = 120; const AOE_RANGE = 7.0; const PULL_STR = 6.0; const DURATION = 2000;
    enemy.takeDamage(DAMAGE);
    this._spawnFloatingText(pos, `CICLÓN +${DAMAGE}`, '#aaeeff');
    if (window._enemies) {
      for (const e of window._enemies) {
        if (e.isDead?.() || !e.mesh) continue;
        const dx = pos.x - e.mesh.position.x;
        const dz = pos.z - e.mesh.position.z;
        const d  = Math.sqrt(dx*dx + dz*dz);
        if (d <= AOE_RANGE && d > 0.5) {
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
    const tGeo    = new THREE.CylinderGeometry(0.2, 2.0, 6, 8, 1, true);
    const tMat    = new THREE.MeshBasicMaterial({ color: 0x88ddff, transparent: true, opacity: 0.4, side: THREE.DoubleSide });
    const tornado = new THREE.Mesh(tGeo, tMat);
    tornado.position.copy(pos).add(new THREE.Vector3(0, 3, 0));
    this.scene.add(tornado);
    this._active.push({ mesh: tornado, type: 'rotate', timer: DURATION, maxTimer: DURATION, rotSpeed: 4.0, baseOpacity: 0.4 });
  }

  _darkSentence(enemy, pos) {
    const isLow  = enemy.hp !== undefined && enemy.maxHp !== undefined ? (enemy.hp / enemy.maxHp) < 0.20 : false;
    const DAMAGE = isLow ? enemy.hp * 10 : 350;
    enemy.takeDamage(DAMAGE);
    if (!isLow) enemy.applySlow?.(0.1, 3);
    this._spawnFloatingText(pos, isLow ? `☠ SENTENCIA` : `OSCURIDAD +${DAMAGE}`, '#cc44ff');
    const color  = isLow ? 0xff0000 : 0x8800cc;
    const pGeo   = new THREE.CylinderGeometry(0.15, 0.6, 8, 7);
    const pMat   = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.9 });
    const pillar = new THREE.Mesh(pGeo, pMat);
    pillar.position.copy(pos).add(new THREE.Vector3(0, 4, 0));
    this.scene.add(pillar);
    this._active.push({ mesh: pillar, type: 'pillar', timer: 700, maxTimer: 700, baseOpacity: 0.9 });
  }

  // ── Eclipse (Umbral + Astral) ─────────────────────────────────────────────
  // Daño masivo + ceguera (slow total)
  _eclipse(enemy, pos) {
    const DAMAGE   = 380;
    const BLIND_SEC = 3.0;
    enemy.takeDamage(DAMAGE);
    enemy.applySlow?.(0, BLIND_SEC);
    this._spawnFloatingText(pos, `⭐ ECLIPSE +${DAMAGE}`, '#ffeebb');

    // Esfera negra con halo dorado
    const sGeo   = new THREE.SphereGeometry(1.0, 12, 12);
    const sMat   = new THREE.MeshBasicMaterial({ color: 0x000011, transparent: true, opacity: 0.95 });
    const sphere = new THREE.Mesh(sGeo, sMat);
    sphere.position.copy(pos).add(new THREE.Vector3(0, 1.5, 0));
    this.scene.add(sphere);
    this._active.push({ mesh: sphere, type: 'sphere', timer: 800, maxTimer: 800, expandScale: 5.0, baseOpacity: 0.95 });

    // Anillos dorados
    [0.5, 1.5, 3.0, 5.5].forEach((r, i) => {
      const rGeo = new THREE.RingGeometry(r - 0.12, r, 16);
      const rMat = new THREE.MeshBasicMaterial({ color: 0xffdd88, transparent: true, opacity: 0.8, side: THREE.DoubleSide });
      const ring = new THREE.Mesh(rGeo, rMat);
      ring.position.copy(pos).add(new THREE.Vector3(0, 0.05, 0));
      ring.rotation.x = -Math.PI / 2;
      this.scene.add(ring);
      this._active.push({ mesh: ring, type: 'ring', timer: 900 - i * 70, maxTimer: 900, expandScale: 4.0, baseOpacity: 0.8 });
    });
  }

  // ── Condena Oscura (Umbral + Elemental) ───────────────────────────────────
  // Quema + reducción de DEF
  _darkCondemnation(enemy, pos) {
    const DAMAGE = 220;
    enemy.takeDamage(DAMAGE);
    enemy.applyBurn?.(15, 4);
    enemy.applySlow?.(0.6, 3);
    this._spawnFloatingText(pos, `🔥 CONDENA OSCURA +${DAMAGE}`, '#ff6622');

    // Pilar de fuego oscuro
    const pGeo   = new THREE.CylinderGeometry(0.2, 0.8, 7, 8);
    const pMat   = new THREE.MeshBasicMaterial({ color: 0x880022, transparent: true, opacity: 0.85 });
    const pillar = new THREE.Mesh(pGeo, pMat);
    pillar.position.copy(pos).add(new THREE.Vector3(0, 3.5, 0));
    this.scene.add(pillar);
    this._active.push({ mesh: pillar, type: 'pillar', timer: 800, maxTimer: 800, baseOpacity: 0.85 });

    [0.4, 1.2, 2.4].forEach((r, i) => {
      const rGeo = new THREE.RingGeometry(r - 0.1, r, 12);
      const rMat = new THREE.MeshBasicMaterial({ color: 0xff4400, transparent: true, opacity: 0.7, side: THREE.DoubleSide });
      const ring = new THREE.Mesh(rGeo, rMat);
      ring.position.copy(pos).add(new THREE.Vector3(0, 0.05, 0));
      ring.rotation.x = -Math.PI / 2;
      this.scene.add(ring);
      this._active.push({ mesh: ring, type: 'ring', timer: 600 - i * 80, maxTimer: 600, expandScale: 2.5, baseOpacity: 0.7 });
    });
  }

  // ── Nova Solar (Astral + Elemental) ───────────────────────────────────────
  // Explosión en área, daño a todos los enemigos cercanos
  _solarNova(enemy, pos) {
    const DAMAGE    = 260;
    const AOE_RANGE = 6.0;
    enemy.takeDamage(DAMAGE);
    this._spawnFloatingText(pos, `⚡ NOVA SOLAR +${DAMAGE}`, '#ffee44');

    if (window._enemies) {
      for (const e of window._enemies) {
        if (e === enemy || e.isDead?.() || !e.mesh) continue;
        const dx = pos.x - e.mesh.position.x;
        const dz = pos.z - e.mesh.position.z;
        if (Math.sqrt(dx*dx + dz*dz) <= AOE_RANGE) {
          e.takeDamage(Math.floor(DAMAGE * 0.65));
        }
      }
    }

    // Esfera solar expansiva
    const sGeo   = new THREE.SphereGeometry(0.6, 12, 12);
    const sMat   = new THREE.MeshBasicMaterial({ color: 0xffee44, transparent: true, opacity: 0.95 });
    const sphere = new THREE.Mesh(sGeo, sMat);
    sphere.position.copy(pos).add(new THREE.Vector3(0, 1, 0));
    this.scene.add(sphere);
    this._active.push({ mesh: sphere, type: 'sphere', timer: 500, maxTimer: 500, expandScale: 6.0, baseOpacity: 0.95 });

    [0.8, 2.0, 4.0, 6.0].forEach((r, i) => {
      const rGeo = new THREE.RingGeometry(r - 0.12, r, 16);
      const rMat = new THREE.MeshBasicMaterial({ color: 0xffcc00, transparent: true, opacity: 0.75, side: THREE.DoubleSide });
      const ring = new THREE.Mesh(rGeo, rMat);
      ring.position.copy(pos).add(new THREE.Vector3(0, 0.05, 0));
      ring.rotation.x = -Math.PI / 2;
      this.scene.add(ring);
      this._active.push({ mesh: ring, type: 'ring', timer: 700 - i * 60, maxTimer: 700, expandScale: 2.5, baseOpacity: 0.75 });
    });
  }

  // ── Fractura (Arcanum + Umbral) ───────────────────────────────────────────
  // Rompe defensa del enemigo permanentemente en el combate
  _fracture(enemy, pos) {
    const DAMAGE = 180;
    enemy.takeDamage(DAMAGE);
    // Aplicar debuff de DEF como slow permanente hasta muerte
    enemy.applySlow?.(0.4, 999);
    this._spawnFloatingText(pos, `💠 FRACTURA +${DAMAGE}`, '#88aaff');

    // Cristales que explotan
    for (let c = 0; c < 8; c++) {
      const angle = (Math.PI * 2 / 8) * c;
      const cGeo  = new THREE.CylinderGeometry(0.06, 0.15, 0.8 + Math.random(), 5);
      const cMat  = new THREE.MeshBasicMaterial({ color: 0x4488ff, transparent: true, opacity: 0.85 });
      const crystal = new THREE.Mesh(cGeo, cMat);
      crystal.position.set(
        pos.x + Math.cos(angle) * (0.5 + Math.random()),
        0.5 + Math.random(),
        pos.z + Math.sin(angle) * (0.5 + Math.random())
      );
      this.scene.add(crystal);
      this._active.push({ mesh: crystal, type: 'pillar', timer: 600, maxTimer: 600, baseOpacity: 0.85 });
    }

    [0.3, 0.9, 1.8].forEach((r, i) => {
      const rGeo = new THREE.RingGeometry(r - 0.08, r, 12);
      const rMat = new THREE.MeshBasicMaterial({ color: 0x6699ff, transparent: true, opacity: 0.7, side: THREE.DoubleSide });
      const ring = new THREE.Mesh(rGeo, rMat);
      ring.position.copy(pos).add(new THREE.Vector3(0, 0.05, 0));
      ring.rotation.x = -Math.PI / 2;
      this.scene.add(ring);
      this._active.push({ mesh: ring, type: 'ring', timer: 500 - i * 60, maxTimer: 500, expandScale: 3.0, baseOpacity: 0.7 });
    });
  }

  // ── Resurgir (Vital + Astral) ─────────────────────────────────────────────
  // Cura al personaje activo del party
  _resurgence(enemy, pos) {
    const HEAL = 150;
    const active = window._partyManager?.getActiveCharacter?.();
    if (active) {
      active.hp = Math.min(active.maxHp, (active.hp ?? 0) + HEAL);
      active.onDamage?.(active.hp, active.maxHp);
    }
    // Pequeño daño al enemigo también
    enemy.takeDamage(80);
    this._spawnFloatingText(pos, `💚 RESURGIR +${HEAL} HP`, '#44ff88');

    // Aura verde curativa
    const sGeo   = new THREE.SphereGeometry(1.5, 12, 12);
    const sMat   = new THREE.MeshBasicMaterial({ color: 0x44ff88, transparent: true, opacity: 0.4 });
    const sphere = new THREE.Mesh(sGeo, sMat);
    sphere.position.copy(pos).add(new THREE.Vector3(0, 1, 0));
    this.scene.add(sphere);
    this._active.push({ mesh: sphere, type: 'sphere', timer: 700, maxTimer: 700, expandScale: 3.0, baseOpacity: 0.4 });

    [0.5, 1.5, 3.0].forEach((r, i) => {
      const rGeo = new THREE.RingGeometry(r - 0.1, r, 14);
      const rMat = new THREE.MeshBasicMaterial({ color: 0x44ff88, transparent: true, opacity: 0.6, side: THREE.DoubleSide });
      const ring = new THREE.Mesh(rGeo, rMat);
      ring.position.copy(pos).add(new THREE.Vector3(0, 0.05, 0));
      ring.rotation.x = -Math.PI / 2;
      this.scene.add(ring);
      this._active.push({ mesh: ring, type: 'ring', timer: 600 - i * 70, maxTimer: 600, expandScale: 2.0, baseOpacity: 0.6 });
    });
  }

  // ── Sobrecarga (Elemental + Arcanum) ─────────────────────────────────────
  // Explosión mágica masiva en área grande
  _overload(enemy, pos) {
    const DAMAGE    = 300;
    const AOE_RANGE = 8.0;
    enemy.takeDamage(DAMAGE);
    this._spawnFloatingText(pos, `🌀 SOBRECARGA +${DAMAGE}`, '#aa44ff');

    if (window._enemies) {
      for (const e of window._enemies) {
        if (e === enemy || e.isDead?.() || !e.mesh) continue;
        const dx = pos.x - e.mesh.position.x;
        const dz = pos.z - e.mesh.position.z;
        if (Math.sqrt(dx*dx + dz*dz) <= AOE_RANGE) {
          e.takeDamage(Math.floor(DAMAGE * 0.55));
          e.applySlow?.(0.3, 2);
        }
      }
    }

    // Esfera arcana giratoria
    const sGeo   = new THREE.SphereGeometry(0.8, 12, 12);
    const sMat   = new THREE.MeshBasicMaterial({ color: 0x8833ff, transparent: true, opacity: 0.9 });
    const sphere = new THREE.Mesh(sGeo, sMat);
    sphere.position.copy(pos).add(new THREE.Vector3(0, 1, 0));
    this.scene.add(sphere);
    this._active.push({ mesh: sphere, type: 'sphere', timer: 600, maxTimer: 600, expandScale: 7.0, baseOpacity: 0.9 });

    [1.0, 2.5, 4.5, 7.0].forEach((r, i) => {
      const rGeo = new THREE.RingGeometry(r - 0.12, r, 16);
      const rMat = new THREE.MeshBasicMaterial({ color: 0xaa44ff, transparent: true, opacity: 0.75, side: THREE.DoubleSide });
      const ring = new THREE.Mesh(rGeo, rMat);
      ring.position.copy(pos).add(new THREE.Vector3(0, 0.05, 0));
      ring.rotation.x = -Math.PI / 2;
      this.scene.add(ring);
      this._active.push({ mesh: ring, type: 'ring', timer: 800 - i * 70, maxTimer: 800, expandScale: 2.0, baseOpacity: 0.75 });
    });
  }

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
