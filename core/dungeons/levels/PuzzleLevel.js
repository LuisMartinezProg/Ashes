// core/dungeons/levels/PuzzleLevel.js — Ashes of the Reborn | Valiant Gaming
import * as THREE from 'three';

const PEDESTAL_COUNT  = 4;
const ACTIVATE_RANGE  = 2.5;
const MAX_ERRORS      = 5;

const ELEMENTS = ['fire', 'ice', 'wind', 'shadow'];

const ELEMENT_DATA = {
  fire  : { color: 0xff4444, emissive: 0xff2200, icon: '🔥', skillIds: ['fireball','fire_burst','fire_pillar','inferno'] },
  ice   : { color: 0x44aaff, emissive: 0x2288ff, icon: '❄️', skillIds: ['ice_shard','ice_spike','blizzard','absolute_zero'] },
  wind  : { color: 0x44ffaa, emissive: 0x22dd88, icon: '🌀', skillIds: ['gust','wind_blade','tornado','storm_god'] },
  shadow: { color: 0xaa44ff, emissive: 0x8822ff, icon: '🌑', skillIds: ['shadow_slash','nightfall','void_step','shadow_realm'] },
};

export class PuzzleLevel {
  constructor(scene, origin) {
    this.scene     = scene;
    this.origin    = origin;
    this._meshes   = [];
    this._pedestals = [];
    this._arrows    = [];
    this._enemies   = [];
    this._active    = false;
    this._completed = false;

    this._sequence  = [];
    this._progress  = [];
    this._errors    = 0;

    this.onComplete      = null;
    this.onFail          = null;
    this.onSpawnEnemy    = null;

    this._build();
    this._generateSequence();
    this._buildSequenceHint();
    this._buildTutorialHint();
  }

  // ── Construcción ──────────────────────────────────────────────────────────

  _build() {
    const ox = this.origin.x;
    const oz = this.origin.z;

    // Suelo central con runas
    const runeGeo = new THREE.CircleGeometry(8, 32);
    const runeMat = new THREE.MeshBasicMaterial({
      color      : 0x1a0a2a,
      transparent: true,
      opacity    : 0.9,
      side       : THREE.DoubleSide,
    });
    const rune = new THREE.Mesh(runeGeo, runeMat);
    rune.rotation.x = -Math.PI / 2;
    rune.position.set(ox, 0.02, oz);
    this.scene.add(rune);
    this._meshes.push(rune);

    // Líneas de runa decorativas
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2;
      const geo   = new THREE.PlaneGeometry(0.08, 7);
      const mat   = new THREE.MeshBasicMaterial({
        color      : 0x6633aa,
        transparent: true,
        opacity    : 0.4,
        side       : THREE.DoubleSide,
      });
      const m = new THREE.Mesh(geo, mat);
      m.rotation.x = -Math.PI / 2;
      m.rotation.z = angle;
      m.position.set(ox, 0.03, oz);
      this.scene.add(m);
      this._meshes.push(m);
    }

    // 4 pedestales en las esquinas
    const positions = [
      { ox: -5, oz: -5, element: 'fire'   },
      { ox:  5, oz: -5, element: 'ice'    },
      { ox: -5, oz:  5, element: 'wind'   },
      { ox:  5, oz:  5, element: 'shadow' },
    ];

    for (const def of positions) {
      const data  = ELEMENT_DATA[def.element];
      const group = new THREE.Group();
      group.position.set(ox + def.ox, 0, oz + def.oz);

      // Base
      const baseGeo = new THREE.CylinderGeometry(0.5, 0.65, 1.2, 8);
      const baseMat = new THREE.MeshStandardMaterial({
        color    : data.color,
        emissive : data.emissive,
        emissiveIntensity: 0.3,
        roughness: 0.5,
        metalness: 0.4,
      });
      const base = new THREE.Mesh(baseGeo, baseMat);
      base.position.y = 0.6;
      group.add(base);

      // Cristal encima
      const crystalGeo = new THREE.OctahedronGeometry(0.35, 0);
      const crystalMat = new THREE.MeshStandardMaterial({
        color    : data.color,
        emissive : data.emissive,
        emissiveIntensity: 0.8,
        transparent: true,
        opacity  : 0.85,
        roughness: 0.1,
      });
      const crystal = new THREE.Mesh(crystalGeo, crystalMat);
      crystal.position.y = 1.6;
      group.add(crystal);

      // Luz
      const light = new THREE.PointLight(data.color, 1.2, 5);
      light.position.y = 1.8;
      group.add(light);

      // Label
      const label = this._makeElementLabel(data.icon, def.element);
      label.position.set(0, 2.4, 0);
      group.add(label);

      this.scene.add(group);
      this._meshes.push(group);

      this._pedestals.push({
        element : def.element,
        group,
        base,
        crystal,
        light,
        baseMat,
        crystalMat,
        worldX  : ox + def.ox,
        worldZ  : oz + def.oz,
        activated: false,
        _pulse  : Math.random() * Math.PI * 2,
      });
    }

    // Luz central
    const centerLight = new THREE.PointLight(0x6633aa, 1.5, 12);
    centerLight.position.set(ox, 3, oz);
    this.scene.add(centerLight);
    this._meshes.push(centerLight);
  }

  _makeElementLabel(icon, element) {
    const canvas  = document.createElement('canvas');
    canvas.width  = 128;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = 'rgba(0,0,0,0)';
    ctx.fillRect(0, 0, 128, 64);
    ctx.font         = '28px monospace';
    ctx.textAlign    = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(icon, 64, 32);

    const tex = new THREE.CanvasTexture(canvas);
    const geo = new THREE.PlaneGeometry(1.2, 0.6);
    const mat = new THREE.MeshBasicMaterial({ map: tex, transparent: true, side: THREE.DoubleSide });
    return new THREE.Mesh(geo, mat);
  }

  // ── Secuencia ─────────────────────────────────────────────────────────────

  _generateSequence() {
    const shuffled = [...ELEMENTS].sort(() => Math.random() - 0.5);
    this._sequence = shuffled;
    this._progress = [];
  }

  _buildSequenceHint() {
    const canvas  = document.createElement('canvas');
    canvas.width  = 512;
    canvas.height = 96;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = 'rgba(0,0,0,0)';
    ctx.fillRect(0, 0, 512, 96);

    // Título
    ctx.font         = '16px monospace';
    ctx.fillStyle    = '#C9A84C';
    ctx.textAlign    = 'center';
    ctx.fillText('ACTIVA EN ORDEN', 256, 22);

    // Iconos de secuencia
    const icons = this._sequence.map(e => ELEMENT_DATA[e].icon);
    ctx.font = '30px monospace';
    icons.forEach((icon, i) => {
      ctx.fillText(icon, 90 + i * 110, 66);
    });

    // Flechas entre iconos
    ctx.font      = '18px monospace';
    ctx.fillStyle = '#888';
    for (let i = 0; i < icons.length - 1; i++) {
      ctx.fillText('→', 140 + i * 110, 66);
    }

    const tex = new THREE.CanvasTexture(canvas);
    const geo = new THREE.PlaneGeometry(9, 1.7);
    const mat = new THREE.MeshBasicMaterial({ map: tex, transparent: true, side: THREE.DoubleSide });
    const m   = new THREE.Mesh(geo, mat);
    m.position.set(this.origin.x, 3.5, this.origin.z - 9);
    m.rotation.y = Math.PI;
    this.scene.add(m);
    this._meshes.push(m);
    this._hintMesh = m;
  }

  _buildTutorialHint() {
    const canvas  = document.createElement('canvas');
    canvas.width  = 512;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle    = 'rgba(0,0,0,0)';
    ctx.fillRect(0, 0, 512, 64);
    ctx.font         = '18px monospace';
    ctx.fillStyle    = '#aaaaff';
    ctx.textAlign    = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('Usa tus habilidades elementales en los pedestales', 256, 32);

    const tex = new THREE.CanvasTexture(canvas);
    const geo = new THREE.PlaneGeometry(10, 1.2);
    const mat = new THREE.MeshBasicMaterial({ map: tex, transparent: true, side: THREE.DoubleSide });
    const m   = new THREE.Mesh(geo, mat);
    m.position.set(this.origin.x, 2.0, this.origin.z - 9);
    m.rotation.y = Math.PI;
    this.scene.add(m);
    this._meshes.push(m);
  }

  // ── Activación ────────────────────────────────────────────────────────────

  activate() { this._active = true; }

  tryActivatePedestal(skillId) {
    if (!this._active || this._completed) return;

    const element = this._getElementFromSkill(skillId);
    if (!element) return;

    const player = window._partyManager?.getActiveCharacter()
                ?? window._player;
    if (!player) return;

    const pos = player.root?.position ?? player.position;

    // Buscar pedestal cercano con ese elemento
    const pedestal = this._pedestals.find(p => {
      if (p.element !== element) return false;
      const dx   = pos.x - p.worldX;
      const dz   = pos.z - p.worldZ;
      return Math.sqrt(dx*dx + dz*dz) < ACTIVATE_RANGE;
    });

    if (!pedestal) return;

    const expected = this._sequence[this._progress.length];

    if (element === expected) {
      this._activatePedestal(pedestal);
      this._progress.push(element);
      this._updateHintProgress();

      if (this._progress.length === this._sequence.length) {
        setTimeout(() => this._complete(), 600);
      }
    } else {
      this._errors++;
      this._wrongPedestal(pedestal);
      this._progress = [];
      this._resetPedestals();
      this._spawnErrorEnemy();
      if (this._errors >= MAX_ERRORS) {
        if (this.onFail) this.onFail();
      }
    }
  }

  _getElementFromSkill(skillId) {
    for (const [element, data] of Object.entries(ELEMENT_DATA)) {
      if (data.skillIds.includes(skillId)) return element;
    }
    return null;
  }

  _activatePedestal(p) {
    p.activated = true;
    p.crystalMat.emissiveIntensity = 1.8;
    p.light.intensity = 3;
    p.baseMat.emissiveIntensity  = 0.8;

    // Partícula de éxito
    const geo = new THREE.SphereGeometry(0.15, 6, 6);
    const mat = new THREE.MeshBasicMaterial({
      color      : ELEMENT_DATA[p.element].color,
      transparent: true,
      opacity    : 0.9,
    });
    const particle = new THREE.Mesh(geo, mat);
    particle.position.set(p.worldX, 1.8, p.worldZ);
    this.scene.add(particle);

    const start = performance.now();
    const rise  = () => {
      const t = (performance.now() - start) / 800;
      particle.position.y = 1.8 + t * 2;
      particle.material.opacity = Math.max(0, 1 - t);
      if (t < 1) requestAnimationFrame(rise);
      else { this.scene.remove(particle); geo.dispose(); mat.dispose(); }
    };
    requestAnimationFrame(rise);
  }

  _wrongPedestal(p) {
    const origColor = ELEMENT_DATA[p.element].emissive;
    p.crystalMat.emissive.setHex(0xff0000);
    p.light.color.setHex(0xff0000);
    setTimeout(() => {
      p.crystalMat.emissive.setHex(origColor);
      p.light.color.setHex(ELEMENT_DATA[p.element].color);
    }, 400);

    // Flash rojo en pantalla
    const flash = document.createElement('div');
    Object.assign(flash.style, {
      position  : 'fixed', inset: '0',
      background: 'rgba(255,0,0,0.12)',
      pointerEvents: 'none', zIndex: '200',
      transition: 'opacity 0.4s',
    });
    document.body.appendChild(flash);
    requestAnimationFrame(() => requestAnimationFrame(() => {
      flash.style.opacity = '0';
    }));
    setTimeout(() => flash.remove(), 500);

    // Mostrar error count
    const errEl = document.createElement('div');
    Object.assign(errEl.style, {
      position     : 'fixed',
      top          : '38%',
      left         : '50%',
      transform    : 'translateX(-50%)',
      fontFamily   : 'monospace',
      fontSize     : '13px',
      color        : '#ff4444',
      letterSpacing: '2px',
      pointerEvents: 'none',
      zIndex       : '300',
      opacity      : '1',
      transition   : 'opacity 0.6s, top 0.6s',
    });
    errEl.textContent = `✗ Error ${this._errors}/${MAX_ERRORS}`;
    document.body.appendChild(errEl);
    requestAnimationFrame(() => requestAnimationFrame(() => {
      errEl.style.opacity = '0';
      errEl.style.top     = '32%';
    }));
    setTimeout(() => errEl.remove(), 700);
  }

  _resetPedestals() {
    for (const p of this._pedestals) {
      p.activated = false;
      p.crystalMat.emissiveIntensity = 0.8;
      p.light.intensity = 1.2;
      p.baseMat.emissiveIntensity  = 0.3;
    }
  }

  _spawnErrorEnemy() {
    if (!this.onSpawnEnemy) return;
    const tier = Math.min(this._errors, 3);
    const enemy = this.onSpawnEnemy(
      { x: this.origin.x, z: this.origin.z },
      tier
    );
    if (enemy) this._enemies.push(enemy);
  }

  _updateHintProgress() {
    // Tachar los iconos ya activados
    const canvas  = document.createElement('canvas');
    canvas.width  = 512;
    canvas.height = 96;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = 'rgba(0,0,0,0)';
    ctx.fillRect(0, 0, 512, 96);

    ctx.font      = '16px monospace';
    ctx.fillStyle = '#C9A84C';
    ctx.textAlign = 'center';
    ctx.fillText('ACTIVA EN ORDEN', 256, 22);

    ctx.font = '30px monospace';
    this._sequence.forEach((element, i) => {
      const icon = ELEMENT_DATA[element].icon;
      const done = i < this._progress.length;
      ctx.globalAlpha = done ? 0.35 : 1;
      ctx.fillText(icon, 90 + i * 110, 66);
      if (done) {
        ctx.font      = '22px monospace';
        ctx.fillStyle = '#44ff88';
        ctx.fillText('✓', 90 + i * 110, 42);
        ctx.font      = '30px monospace';
        ctx.fillStyle = '#C9A84C';
      }
      ctx.globalAlpha = 1;
    });

    ctx.font      = '18px monospace';
    ctx.fillStyle = '#888';
    for (let i = 0; i < this._sequence.length - 1; i++) {
      ctx.fillText('→', 140 + i * 110, 66);
    }

    if (this._hintMesh) {
      this._hintMesh.material.map.dispose();
      this._hintMesh.material.map = new THREE.CanvasTexture(canvas);
      this._hintMesh.material.needsUpdate = true;
    }
  }

  // ── Complete ──────────────────────────────────────────────────────────────

  _complete() {
    if (this._completed) return;
    this._completed = true;

    // Todos los pedestales brillan
    for (const p of this._pedestals) {
      p.crystalMat.emissiveIntensity = 2.5;
      p.light.intensity = 4;
    }

    const el = document.createElement('div');
    Object.assign(el.style, {
      position     : 'fixed',
      top          : '35%',
      left         : '50%',
      transform    : 'translateX(-50%)',
      fontFamily   : "'Cinzel',serif",
      fontSize     : '18px',
      letterSpacing: '3px',
      color        : '#aa88ff',
      textShadow   : '0 0 16px #aa88ff',
      pointerEvents: 'none',
      zIndex       : '300',
      opacity      : '1',
      transition   : 'opacity 1s, top 1s',
    });
    el.textContent = '✦ ACERTIJO RESUELTO ✦';
    document.body.appendChild(el);
    requestAnimationFrame(() => requestAnimationFrame(() => {
      el.style.opacity = '0';
      el.style.top     = '28%';
    }));
    setTimeout(() => el.remove(), 1200);

    if (this.onComplete) this.onComplete();
  }

  // ── Update ────────────────────────────────────────────────────────────────

  update(delta) {
    if (!this._active || this._completed) return;

    for (const p of this._pedestals) {
      p._pulse += delta * 2;
      if (!p.activated) {
        p.crystal.rotation.y += delta * 1.2;
        p.crystal.position.y  = 1.6 + Math.sin(p._pulse) * 0.08;
      }
    }

    // Limpiar enemigos muertos
    this._enemies = this._enemies.filter(e => !e.isDead?.());
  }

  // ── Destruir ──────────────────────────────────────────────────────────────

  destroy() {
    for (const m of this._meshes) {
      this.scene.remove(m);
      m.geometry?.dispose();
      m.material?.dispose();
    }
    this._meshes    = [];
    this._pedestals = [];
    this._enemies   = [];
  }
}
