// core/dungeons/levels/PuzzleLevel.js — Ashes of the Reborn | Valiant Gaming
import * as THREE from 'three';

const ACTIVATE_RANGE = 1.8;
const MAX_ERRORS     = 3;

const ELEMENTS = {
  umbral: { color: 0x8833ff, emissive: 0x441188, icon: '🌑', label: 'Umbral' },
  astral: { color: 0xffdd44, emissive: 0xaa8800, icon: '✨', label: 'Astral' },
  fire  : { color: 0xff4422, emissive: 0xaa1100, icon: '🔥', label: 'Fuego'  },
  ice   : { color: 0x44aaff, emissive: 0x2266aa, icon: '❄️', label: 'Hielo'  },
};

export class PuzzleLevel {
  constructor(scene, origin, difficulty = 1) {
    this.scene       = scene;
    this.origin      = origin;
    this.difficulty  = difficulty;
    this._meshes     = [];
    this._pedestals  = [];
    this._enemies    = [];
    this._active     = false;
    this._completed  = false;
    this._progress   = [];
    this._sequence   = [];
    this._errors     = 0;
    this._timeLeft   = 0;
    this._timerActive = false;

    // Puzzle 3 — dardos
    this._dartMode      = false;
    this._darts         = [];
    this._dartWarnings  = [];
    this._dartTimer     = 0;
    this._dartSurvived  = 0;
    this._dartTarget    = 30;
    this._dartHits      = 0;
    this._dartMaxHits   = 5;
    this._cenitCamera   = null;
    this._origCamPos    = null;
    this._origCamRot    = null;

    this.onComplete   = null;
    this.onFail       = null;
    this.onSpawnEnemy = null;

    this._build();
  }

  // ── Construcción ──────────────────────────────────────────────────────────

  _build() {
    const ox = this.origin.x;
    const oz = this.origin.z;

    // Suelo de runa
    const runeGeo = new THREE.CircleGeometry(9, 32);
    const runeMat = new THREE.MeshBasicMaterial({
      color: 0x1a0a2a, transparent: true, opacity: 0.9, side: THREE.DoubleSide,
    });
    const rune = new THREE.Mesh(runeGeo, runeMat);
    rune.rotation.x = -Math.PI / 2;
    rune.position.set(ox, 0.02, oz);
    this.scene.add(rune);
    this._meshes.push(rune);

    // Líneas decorativas
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2;
      const geo   = new THREE.PlaneGeometry(0.08, 8);
      const mat   = new THREE.MeshBasicMaterial({
        color: 0x6633aa, transparent: true, opacity: 0.35, side: THREE.DoubleSide,
      });
      const m = new THREE.Mesh(geo, mat);
      m.rotation.x = -Math.PI / 2;
      m.rotation.z = angle;
      m.position.set(ox, 0.03, oz);
      this.scene.add(m);
      this._meshes.push(m);
    }

    // Luz central
    const centerLight = new THREE.PointLight(0x6633aa, 1.5, 14);
    centerLight.position.set(ox, 3, oz);
    this.scene.add(centerLight);
    this._meshes.push(centerLight);

    if (this.difficulty <= 1) {
      this._buildPuzzle1();
    } else if (this.difficulty <= 3) {
      this._buildPuzzle2();
    } else {
      this._buildPuzzle3();
    }
  }

  // ── Puzzle 1 — Pisar pedestales (2 elementos, sin tiempo) ─────────────────

  _buildPuzzle1() {
    const elements = ['umbral', 'umbral'];
    const positions = [
      { ox: -4, oz: -4 },
      { ox:  4, oz:  4 },
    ];
    this._sequence = ['umbral', 'umbral'];
    this._buildPedestals(elements, positions);
    this._buildHint('Pisa los pedestales en orden', this._sequence);
  }

  // ── Puzzle 2 — Pedestales con tiempo (3 elementos) ────────────────────────

  _buildPuzzle2() {
    const elements  = ['umbral', 'astral', 'umbral'];
    const positions = [
      { ox: -5, oz: -5 },
      { ox:  5, oz: -5 },
      { ox:  0, oz:  5 },
    ];
    const shuffled  = [...elements].sort(() => Math.random() - 0.5);
    this._sequence  = shuffled;
    this._timeLeft  = 15;
    this._buildPedestals(elements, positions);
    this._buildHint('15 segundos — pisa en orden', this._sequence);
    this._buildTimer();
  }

  // ── Puzzle 3 — Lluvia de dardos ───────────────────────────────────────────

  _buildPuzzle3() {
    this._dartMode   = true;
    this._dartTarget = 30;
    this._dartHits   = 0;
    this._dartMaxHits = 5;
    this._buildDartFloor();
    this._buildDartHint();
    this._buildDartTimer();
  }

  _buildDartFloor() {
    const ox = this.origin.x;
    const oz = this.origin.z;
    const geo = new THREE.PlaneGeometry(20, 20);
    const mat = new THREE.MeshStandardMaterial({ color: 0x1a1a2a, roughness: 0.9 });
    const m   = new THREE.Mesh(geo, mat);
    m.rotation.x = -Math.PI / 2;
    m.position.set(ox, 0.04, oz);
    this.scene.add(m);
    this._meshes.push(m);

    // Grid de referencia
    for (let i = -4; i <= 4; i++) {
      for (const axis of ['x', 'z']) {
        const g = new THREE.PlaneGeometry(axis === 'x' ? 20 : 0.04, axis === 'z' ? 20 : 0.04);
        const mat2 = new THREE.MeshBasicMaterial({
          color: 0x332244, transparent: true, opacity: 0.3, side: THREE.DoubleSide,
        });
        const line = new THREE.Mesh(g, mat2);
        line.rotation.x = -Math.PI / 2;
        line.position.set(
          axis === 'z' ? ox + i * 2 : ox,
          0.05,
          axis === 'x' ? oz + i * 2 : oz
        );
        this.scene.add(line);
        this._meshes.push(line);
      }
    }
  }

  _buildDartHint() {
    const el = document.createElement('div');
    el.id = 'puzzle3-hint';
    Object.assign(el.style, {
      position: 'fixed', top: '15%', left: '50%',
      transform: 'translateX(-50%)',
      fontFamily: "'Cinzel',serif", fontSize: '12px',
      letterSpacing: '2px', color: '#ff8844',
      textShadow: '0 0 10px #ff4400',
      pointerEvents: 'none', zIndex: '300',
      textAlign: 'center', lineHeight: '1.6',
    });
    el.innerHTML = '⚠ ESQUIVA LOS DARDOS<br><span style="font-size:10px;color:#aaa;">Sobrevive 30 segundos</span>';
    document.body.appendChild(el);
    this._dartHintEl = el;
  }

  _buildDartTimer() {
    const el = document.createElement('div');
    el.id = 'puzzle3-timer';
    Object.assign(el.style, {
      position: 'fixed', top: '22%', left: '50%',
      transform: 'translateX(-50%)',
      fontFamily: 'monospace', fontSize: '20px',
      letterSpacing: '4px', color: '#ff8844',
      pointerEvents: 'none', zIndex: '300',
    });
    el.textContent = '30';
    document.body.appendChild(el);
    this._dartTimerEl = el;

    // Barra de vida del puzzle
    const hpEl = document.createElement('div');
    hpEl.id = 'puzzle3-hp';
    Object.assign(hpEl.style, {
      position: 'fixed', top: '28%', left: '50%',
      transform: 'translateX(-50%)',
      fontFamily: 'monospace', fontSize: '10px',
      color: '#ff4444', letterSpacing: '2px',
      pointerEvents: 'none', zIndex: '300',
    });
    hpEl.textContent = `Vidas: ${'❤️'.repeat(this._dartMaxHits - this._dartHits)}`;
    document.body.appendChild(hpEl);
    this._dartHpEl = hpEl;
  }

  // ── Construir pedestales ──────────────────────────────────────────────────

  _buildPedestals(elements, positions) {
    const ox = this.origin.x;
    const oz = this.origin.z;

    for (let i = 0; i < elements.length; i++) {
      const key  = elements[i];
      const data = ELEMENTS[key];
      const def  = positions[i];
      const wx   = ox + def.ox;
      const wz   = oz + def.oz;

      const group = new THREE.Group();
      group.position.set(wx, 0, wz);

      const baseGeo = new THREE.CylinderGeometry(0.6, 0.75, 1.2, 8);
      const baseMat = new THREE.MeshStandardMaterial({
        color: data.color, emissive: data.emissive,
        emissiveIntensity: 0.3, roughness: 0.5, metalness: 0.4,
      });
      const base = new THREE.Mesh(baseGeo, baseMat);
      base.position.y = 0.6;
      group.add(base);

      const crystalGeo = new THREE.OctahedronGeometry(0.4, 0);
      const crystalMat = new THREE.MeshStandardMaterial({
        color: data.color, emissive: data.emissive,
        emissiveIntensity: 0.8, transparent: true, opacity: 0.85, roughness: 0.1,
      });
      const crystal = new THREE.Mesh(crystalGeo, crystalMat);
      crystal.position.y = 1.7;
      group.add(crystal);

      const light = new THREE.PointLight(data.color, 1.2, 5);
      light.position.y = 2;
      group.add(light);

      // Número de orden
      const numEl = this._makeOrderLabel(i + 1, data.color);
      numEl.position.set(0, 2.8, 0);
      group.add(numEl);

      // Zona de activación en el suelo
      const zoneGeo = new THREE.CircleGeometry(ACTIVATE_RANGE, 16);
      const zoneMat = new THREE.MeshBasicMaterial({
        color: data.color, transparent: true, opacity: 0.15, side: THREE.DoubleSide,
      });
      const zone = new THREE.Mesh(zoneGeo, zoneMat);
      zone.rotation.x = -Math.PI / 2;
      zone.position.set(wx, 0.06, wz);
      this.scene.add(zone);
      this._meshes.push(zone);

      this.scene.add(group);
      this._meshes.push(group);

      this._pedestals.push({
        element: key, group, base, crystal, light,
        baseMat, crystalMat, zoneMat,
        worldX: wx, worldZ: wz,
        activated: false, orderIdx: i,
        _pulse: Math.random() * Math.PI * 2,
      });
    }
  }

  _makeOrderLabel(num, color) {
    const canvas  = document.createElement('canvas');
    canvas.width  = 64; canvas.height = 64;
    const ctx     = canvas.getContext('2d');
    ctx.fillStyle = 'rgba(0,0,0,0)';
    ctx.fillRect(0, 0, 64, 64);
    ctx.font         = 'bold 36px monospace';
    ctx.fillStyle    = `#${color.toString(16).padStart(6, '0')}`;
    ctx.textAlign    = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(num, 32, 32);
    const tex = new THREE.CanvasTexture(canvas);
    const geo = new THREE.PlaneGeometry(0.8, 0.8);
    const mat = new THREE.MeshBasicMaterial({ map: tex, transparent: true, side: THREE.DoubleSide });
    return new THREE.Mesh(geo, mat);
  }

  _buildHint(title, sequence) {
    const canvas  = document.createElement('canvas');
    canvas.width  = 512; canvas.height = 96;
    const ctx     = canvas.getContext('2d');
    ctx.fillStyle = 'rgba(0,0,0,0)';
    ctx.fillRect(0, 0, 512, 96);
    ctx.font      = '16px monospace';
    ctx.fillStyle = '#C9A84C';
    ctx.textAlign = 'center';
    ctx.fillText(title.toUpperCase(), 256, 22);
    ctx.font = '28px monospace';
    sequence.forEach((key, i) => {
      ctx.fillText(ELEMENTS[key]?.icon ?? '?', 80 + i * 120, 66);
    });
    if (sequence.length > 1) {
      ctx.font = '18px monospace';
      ctx.fillStyle = '#888';
      for (let i = 0; i < sequence.length - 1; i++) {
        ctx.fillText('→', 130 + i * 120, 66);
      }
    }
    const tex = new THREE.CanvasTexture(canvas);
    const geo = new THREE.PlaneGeometry(9, 1.7);
    const mat = new THREE.MeshBasicMaterial({ map: tex, transparent: true, side: THREE.DoubleSide });
    const m   = new THREE.Mesh(geo, mat);
    m.position.set(this.origin.x, 3.5, this.origin.z - 10);
    m.rotation.y = Math.PI;
    this.scene.add(m);
    this._meshes.push(m);
    this._hintMesh = m;
  }

  _buildTimer() {
    this._timerEl = document.createElement('div');
    Object.assign(this._timerEl.style, {
      position: 'fixed', top: '18%', left: '50%',
      transform: 'translateX(-50%)',
      fontFamily: 'monospace', fontSize: '22px',
      letterSpacing: '4px', color: '#ffdd44',
      pointerEvents: 'none', zIndex: '300',
      display: 'none',
    });
    document.body.appendChild(this._timerEl);
  }

  // ── Activar ───────────────────────────────────────────────────────────────

  activate() {
    this._active = true;
    if (this._dartMode) {
      this._activateCenitCamera();
    }
    if (this.difficulty >= 2 && !this._dartMode) {
      this._timerActive = true;
      if (this._timerEl) this._timerEl.style.display = 'block';
    }
  }

  // ── Cámara cenital ────────────────────────────────────────────────────────

  _activateCenitCamera() {
    const cam = window._camera;
    if (!cam) return;
    this._origCamPos = cam.position.clone();
    this._origCamRot = cam.rotation.clone();
    cam.position.set(this.origin.x, 22, this.origin.z);
    cam.lookAt(this.origin.x, 0, this.origin.z);
    cam.rotation.z = 0;
    // Bloquear control de cámara
    if (window._thirdCam) window._thirdCam._dragActive = false;
    this._cenitActive = true;
  }

  _restoreCenitCamera() {
    if (!this._cenitActive) return;
    const cam = window._camera;
    if (!cam || !this._origCamPos) return;
    cam.position.copy(this._origCamPos);
    cam.rotation.copy(this._origCamRot);
    this._cenitActive = false;
    if (window._thirdCam) window._thirdCam._snapToPlayer();
  }

  // ── Update ────────────────────────────────────────────────────────────────

  update(delta) {
    if (!this._active || this._completed) return;

    // Animar cristales
    for (const p of this._pedestals) {
      if (!p.activated) {
        p._pulse += delta * 2;
        p.crystal.rotation.y  += delta * 1.2;
        p.crystal.position.y   = 1.7 + Math.sin(p._pulse) * 0.08;
        p.zoneMat.opacity       = 0.1 + Math.sin(p._pulse) * 0.07;
      }
    }

    if (this._dartMode) {
      this._updateDarts(delta);
      return;
    }

    // Timer puzzle 2
    if (this._timerActive && this._timeLeft > 0) {
      this._timeLeft -= delta;
      if (this._timerEl) {
        this._timerEl.textContent = Math.ceil(this._timeLeft);
        this._timerEl.style.color = this._timeLeft < 5 ? '#ff4444' : '#ffdd44';
      }
      if (this._timeLeft <= 0) {
        this._resetPuzzle();
        this._timeLeft   = 15;
        this._timerActive = true;
        this._showFeedback('¡Tiempo!', '#ff4444');
        this._spawnPenaltyEnemy();
      }
    }

    // Chequear pisada en pedestales
    this._checkPlayerOnPedestal();
  }

  _checkPlayerOnPedestal() {
    const player = window._partyManager?.getActiveCharacter() ?? window._player;
    if (!player) return;
    const pos = player.root?.position ?? player.position;

    for (const p of this._pedestals) {
      if (p.activated) continue;
      const dx   = pos.x - p.worldX;
      const dz   = pos.z - p.worldZ;
      const dist = Math.sqrt(dx*dx + dz*dz);
      if (dist < ACTIVATE_RANGE) {
        this._tryActivate(p);
        break;
      }
    }
  }

  _tryActivate(pedestal) {
    const expected = this._sequence[this._progress.length];
    if (!expected) return;

    if (pedestal.element === expected && !pedestal.activated) {
      // Correcto
      pedestal.activated = true;
      pedestal.crystalMat.emissiveIntensity = 2.0;
      pedestal.light.intensity = 3.5;
      pedestal.zoneMat.opacity = 0.4;
      this._progress.push(pedestal.element);
      this._showFeedback('✓', '#44ff88');
      this._updateHintProgress();

      if (this._progress.length === this._sequence.length) {
        setTimeout(() => this._complete(), 500);
      }
    } else if (!pedestal.activated) {
      // Incorrecto
      this._errors++;
      this._flashError(pedestal);
      this._resetPuzzle();
      this._spawnPenaltyEnemy();
      this._showFeedback(`✗ Error ${this._errors}/${MAX_ERRORS}`, '#ff4444');
      if (this._errors >= MAX_ERRORS && this.onFail) this.onFail();
    }
  }

  _resetPuzzle() {
    this._progress = [];
    for (const p of this._pedestals) {
      p.activated = false;
      p.crystalMat.emissiveIntensity = 0.8;
      p.light.intensity = 1.2;
      p.zoneMat.opacity = 0.15;
    }
    if (this.difficulty >= 3 && !this._dartMode) {
      // Puzzle 2 — reordenar secuencia en cada fallo
      this._sequence = [...this._sequence].sort(() => Math.random() - 0.5);
      this._updateHint();
    }
  }

  _flashError(p) {
    p.crystalMat.emissive.setHex(0xff0000);
    p.light.color.setHex(0xff0000);
    setTimeout(() => {
      p.crystalMat.emissive.setHex(ELEMENTS[p.element].emissive);
      p.light.color.setHex(ELEMENTS[p.element].color);
    }, 400);
  }

  _spawnPenaltyEnemy() {
    if (!this.onSpawnEnemy) return;
    const tier  = Math.min(this._errors, 3);
    const enemy = this.onSpawnEnemy(
      { x: this.origin.x + (Math.random() - 0.5) * 6, z: this.origin.z + (Math.random() - 0.5) * 6 },
      tier
    );
    if (enemy) this._enemies.push(enemy);
  }

  // ── Dardos (Puzzle 3) ─────────────────────────────────────────────────────

  _updateDarts(delta) {
    this._dartSurvived += delta;
    this._dartTimer    -= delta;

    // Actualizar timer visual
    const remaining = Math.max(0, this._dartTarget - this._dartSurvived);
    if (this._dartTimerEl) this._dartTimerEl.textContent = Math.ceil(remaining);

    // Completado
    if (this._dartSurvived >= this._dartTarget) {
      this._completeDarts();
      return;
    }

    // Spawear warning + dardo
    if (this._dartTimer <= 0) {
      this._dartTimer = 0.8 + Math.random() * 0.6;
      this._spawnDartWarning();
    }

    // Mover dardos activos
    this._updateActiveDarts(delta);

    // Mover warnings
    this._updateWarnings(delta);
  }

  _spawnDartWarning() {
    const ox   = this.origin.x;
    const oz   = this.origin.z;
    const side = Math.floor(Math.random() * 4);
    const size = 9;

    let sx, sz, dx, dz;
    if (side === 0) { sx = ox - size; sz = oz + (Math.random() - 0.5) * size * 2; dx = 1;  dz = 0;  }
    else if (side === 1) { sx = ox + size; sz = oz + (Math.random() - 0.5) * size * 2; dx = -1; dz = 0;  }
    else if (side === 2) { sx = ox + (Math.random() - 0.5) * size * 2; sz = oz - size; dx = 0;  dz = 1;  }
    else                 { sx = ox + (Math.random() - 0.5) * size * 2; sz = oz + size; dx = 0;  dz = -1; }

    // Línea de advertencia en el suelo
    const geo = new THREE.PlaneGeometry(dx !== 0 ? size * 2 : 0.3, dz !== 0 ? size * 2 : 0.3);
    const mat = new THREE.MeshBasicMaterial({
      color: 0xff4400, transparent: true, opacity: 0.6, side: THREE.DoubleSide,
    });
    const m = new THREE.Mesh(geo, mat);
    m.rotation.x = -Math.PI / 2;
    m.position.set(sx + dx * size, 0.08, sz + dz * size);
    this.scene.add(m);
    this._meshes.push(m);

    this._dartWarnings.push({ mesh: m, life: 0.5, sx, sz, dx, dz });
  }

  _updateWarnings(delta) {
    for (let i = this._dartWarnings.length - 1; i >= 0; i--) {
      const w = this._dartWarnings[i];
      w.life -= delta;
      w.mesh.material.opacity = Math.max(0, w.life * 1.2);
      if (w.life <= 0) {
        this.scene.remove(w.mesh);
        w.mesh.geometry.dispose();
        w.mesh.material.dispose();
        // Spawear el dardo real
        this._spawnDart(w.sx, w.sz, w.dx, w.dz);
        this._dartWarnings.splice(i, 1);
      }
    }
  }

  _spawnDart(sx, sz, dx, dz) {
    const geo = new THREE.CylinderGeometry(0.06, 0.06, 1.2, 6);
    const mat = new THREE.MeshBasicMaterial({ color: 0xff6600 });
    const m   = new THREE.Mesh(geo, mat);
    m.rotation.z = Math.PI / 2;
    m.position.set(sx, 0.8, sz);
    if (dz !== 0) m.rotation.z = 0;
    this.scene.add(m);

    const light = new THREE.PointLight(0xff4400, 1, 3);
    m.add(light);

    this._darts.push({ mesh: m, dx, dz, speed: 12, life: 2.5 });
  }

  _updateActiveDarts(delta) {
    const player = window._partyManager?.getActiveCharacter() ?? window._player;

    for (let i = this._darts.length - 1; i >= 0; i--) {
      const d = this._darts[i];
      d.life -= delta;
      d.mesh.position.x += d.dx * d.speed * delta;
      d.mesh.position.z += d.dz * d.speed * delta;

      if (player) {
        const pos = player.root?.position ?? player.position;
        const ddx = pos.x - d.mesh.position.x;
        const ddz = pos.z - d.mesh.position.z;
        if (Math.sqrt(ddx*ddx + ddz*ddz) < 0.6) {
          player.takeDamage?.(15);
          this._dartHits++;
          if (this._dartHpEl) {
            const remaining = Math.max(0, this._dartMaxHits - this._dartHits);
            this._dartHpEl.textContent = `Vidas: ${'❤️'.repeat(remaining)}`;
          }
          d.life = 0;
          if (this._dartHits >= this._dartMaxHits) {
            this._failDarts();
            return;
          }
        }
      }

      if (d.life <= 0) {
        this.scene.remove(d.mesh);
        d.mesh.geometry.dispose();
        d.mesh.material.dispose();
        this._darts.splice(i, 1);
      }
    }
  }

  _completeDarts() {
    if (this._completed) return;
    this._completed = true;
    this._restoreCenitCamera();
    this._removeDartUI();
    this._showFeedback('✦ SUPERADO ✦', '#44ff88');
    if (this.onComplete) this.onComplete();
  }

  _failDarts() {
    this._restoreCenitCamera();
    this._removeDartUI();
    this._showFeedback('¡Fallaste!', '#ff4444');
    // Resetear para intentar de nuevo
    this._dartSurvived = 0;
    this._dartHits     = 0;
    this._completed    = false;
    for (const d of this._darts) { this.scene.remove(d.mesh); }
    this._darts = [];
    if (this.onFail) this.onFail();
  }

  _removeDartUI() {
    this._dartHintEl?.remove();
    this._dartTimerEl?.remove();
    this._dartHpEl?.remove();
    this._dartHintEl  = null;
    this._dartTimerEl = null;
    this._dartHpEl    = null;
  }

  // ── Completar ─────────────────────────────────────────────────────────────

  _complete() {
    if (this._completed) return;
    this._completed = true;
    if (this._timerEl) { this._timerEl.style.display = 'none'; }
    for (const p of this._pedestals) {
      p.crystalMat.emissiveIntensity = 2.5;
      p.light.intensity = 4;
    }
    this._showFeedback('✦ ACERTIJO RESUELTO ✦', '#aa88ff');
    if (this.onComplete) this.onComplete();
  }

  // ── Helpers visuales ──────────────────────────────────────────────────────

  _updateHintProgress() {
    if (!this._hintMesh) return;
    const canvas  = document.createElement('canvas');
    canvas.width  = 512; canvas.height = 96;
    const ctx     = canvas.getContext('2d');
    ctx.fillStyle = 'rgba(0,0,0,0)';
    ctx.fillRect(0, 0, 512, 96);
    ctx.font      = '16px monospace';
    ctx.fillStyle = '#C9A84C';
    ctx.textAlign = 'center';
    ctx.fillText('ACTIVA EN ORDEN', 256, 22);
    ctx.font = '28px monospace';
    this._sequence.forEach((key, i) => {
      const done = i < this._progress.length;
      ctx.globalAlpha = done ? 0.3 : 1;
      ctx.fillText(ELEMENTS[key]?.icon ?? '?', 80 + i * 120, 66);
      if (done) {
        ctx.font = '20px monospace';
        ctx.fillStyle = '#44ff88';
        ctx.globalAlpha = 1;
        ctx.fillText('✓', 80 + i * 120, 44);
        ctx.font = '28px monospace';
        ctx.fillStyle = '#C9A84C';
      }
      ctx.globalAlpha = 1;
    });
    if (this._sequence.length > 1) {
      ctx.font = '18px monospace';
      ctx.fillStyle = '#888';
      for (let i = 0; i < this._sequence.length - 1; i++) {
        ctx.fillText('→', 130 + i * 120, 66);
      }
    }
    this._hintMesh.material.map.dispose();
    this._hintMesh.material.map = new THREE.CanvasTexture(canvas);
    this._hintMesh.material.needsUpdate = true;
  }

  _updateHint() {
    if (!this._hintMesh) return;
    const canvas  = document.createElement('canvas');
    canvas.width  = 512; canvas.height = 96;
    const ctx     = canvas.getContext('2d');
    ctx.fillStyle = 'rgba(0,0,0,0)';
    ctx.fillRect(0, 0, 512, 96);
    ctx.font      = '16px monospace';
    ctx.fillStyle = '#ff8844';
    ctx.textAlign = 'center';
    ctx.fillText('NUEVO ORDEN', 256, 22);
    ctx.font = '28px monospace';
    this._sequence.forEach((key, i) => {
      ctx.fillText(ELEMENTS[key]?.icon ?? '?', 80 + i * 120, 66);
    });
    this._hintMesh.material.map.dispose();
    this._hintMesh.material.map = new THREE.CanvasTexture(canvas);
    this._hintMesh.material.needsUpdate = true;
  }

  _showFeedback(text, color) {
    const el = document.createElement('div');
    Object.assign(el.style, {
      position: 'fixed', top: '40%', left: '50%',
      transform: 'translateX(-50%)',
      fontFamily: "'Cinzel',serif", fontSize: '16px',
      letterSpacing: '3px', color,
      textShadow: `0 0 12px ${color}`,
      pointerEvents: 'none', zIndex: '300',
      opacity: '1', transition: 'opacity 0.8s, top 0.8s',
    });
    el.textContent = text;
    document.body.appendChild(el);
    requestAnimationFrame(() => requestAnimationFrame(() => {
      el.style.opacity = '0'; el.style.top = '33%';
    }));
    setTimeout(() => el.remove(), 900);
  }

  // ── Destruir ──────────────────────────────────────────────────────────────

  destroy() {
    this._restoreCenitCamera();
    this._removeDartUI();
    if (this._timerEl) { this._timerEl.remove(); this._timerEl = null; }
    for (const d of this._darts) {
      this.scene.remove(d.mesh);
      d.mesh.geometry?.dispose();
      d.mesh.material?.dispose();
    }
    for (const w of this._dartWarnings) {
      this.scene.remove(w.mesh);
      w.mesh.geometry?.dispose();
      w.mesh.material?.dispose();
    }
    for (const m of this._meshes) {
      this.scene.remove(m);
      m.geometry?.dispose();
      if (Array.isArray(m.material)) m.material.forEach(mt => mt.dispose());
      else m.material?.dispose();
    }
    this._darts        = [];
    this._dartWarnings = [];
    this._meshes       = [];
    this._pedestals    = [];
    this._enemies      = [];
  }
}
