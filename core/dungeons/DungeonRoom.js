// core/dungeons/DungeonRoom.js — Ashes of the Reborn | Valiant Gaming
import * as THREE from 'three';

const ROOM_TYPES = {
  START   : 'start',
  COMBAT  : 'combat',
  PUZZLE  : 'puzzle',
  PLATFORM: 'platform',
  REWARD  : 'reward',
  BOSS    : 'boss',
  EMPTY   : 'empty',
};

const ACTIVATE_RANGE = 14;

export class DungeonRoom {
  constructor(scene, roomData, dungeonDef, level) {
    this.scene      = scene;
    this.data       = roomData;
    this.def        = dungeonDef;
    this.level      = level;
    this.type       = roomData.type;
    this.center     = roomData.center;
    this.cleared    = false;
    this.active     = false;
    this.locked     = roomData.locked ?? false;

    this._enemies   = [];
    this._meshes    = [];
    this._triggers  = [];
    this._doors     = [];
    this._onClear   = null;
    this._onEnter   = null;

    // Puzzle state
    this._puzzleOrder    = [];
    this._puzzleExpected = [];
    this._puzzleErrors   = 0;
    this._puzzleEnemies  = [];

    // Platform state
    this._platforms      = [];
    this._arrowTimers    = [];
    this._arrows         = [];
  }

  // ── Setup ─────────────────────────────────────────────────────────────────

  onClear(fn)  { this._onClear = fn; }
  onEnter(fn)  { this._onEnter = fn; }

  setupCombat(enemySpawner) {
    if (this.type !== ROOM_TYPES.COMBAT && this.type !== ROOM_TYPES.BOSS) return;
    this._enemySpawner = enemySpawner;
  }

  setupPuzzle() {
    if (this.type !== ROOM_TYPES.PUZZLE) return;
    const elements = ['fire', 'ice', 'wind', 'shadow'];
    this._puzzleExpected = [...elements].sort(() => Math.random() - 0.5);
    this._puzzleOrder    = [];
    this._puzzleErrors   = 0;
    this._buildPuzzleHints();
  }

  setupPlatforms() {
    if (this.type !== ROOM_TYPES.PLATFORM) return;
    this._buildPlatformTraps();
  }

  // ── Update ────────────────────────────────────────────────────────────────

  update(delta) {
    if (!this.active) return;

    this._checkDoors();

    if (this.type === ROOM_TYPES.PLATFORM) {
      this._updatePlatforms(delta);
      this._updateArrows(delta);
    }

    if (this.type === ROOM_TYPES.COMBAT || this.type === ROOM_TYPES.BOSS) {
      this._updateCombat();
    }

    if (this.type === ROOM_TYPES.PUZZLE) {
      this._updatePuzzle();
    }
  }

  // ── Activar sala ──────────────────────────────────────────────────────────

  activate() {
    if (this.active) return;
    this.active = true;
    if (this._onEnter) this._onEnter(this);

    if (this.type === ROOM_TYPES.COMBAT) this._spawnEnemies();
    if (this.type === ROOM_TYPES.BOSS)   this._lockRoom();
  }

  checkActivation(playerPos) {
    if (this.active || this.cleared) return;
    const dx   = playerPos.x - this.center.x;
    const dz   = playerPos.z - this.center.z;
    const dist = Math.sqrt(dx*dx + dz*dz);
    if (dist < ACTIVATE_RANGE) this.activate();
  }

  // ── Combate ───────────────────────────────────────────────────────────────

  _spawnEnemies() {
    if (!this._enemySpawner) return;
    const count = 2 + Math.floor(this.level * 0.8);
    const offsets = this._randomOffsets(count, 6);
    for (const [ox, oz] of offsets) {
      const enemy = this._enemySpawner({
        x: this.center.x + ox,
        z: this.center.z + oz,
      }, this.level);
      if (enemy) {
        this._enemies.push(enemy);
        enemy.onDeath = () => this._checkCombatClear();
      }
    }
    this._lockDoors();
  }

  _updateCombat() {
    if (this.cleared) return;
    const allDead = this._enemies.length > 0
      && this._enemies.every(e => e.isDead?.());
    if (allDead) this._clearRoom();
  }

  _checkCombatClear() {
    const allDead = this._enemies.every(e => e.isDead?.());
    if (allDead) this._clearRoom();
  }

  // ── Puertas ───────────────────────────────────────────────────────────────

  _lockDoors() {
    for (const door of this._doors) {
      door.mesh.visible = true;
      door.locked = true;
    }
  }

  _lockRoom() {
    this._buildBossBarrier();
  }

  _buildBossBarrier() {
    for (const conn of this.data.connections) {
      const dx = conn.center.x - this.center.x;
      const dz = conn.center.z - this.center.z;
      const mx = this.center.x + dx * 0.45;
      const mz = this.center.z + dz * 0.45;

      const geo = new THREE.BoxGeometry(4, 5, 0.4);
      const mat = new THREE.MeshBasicMaterial({
        color      : this.def.glowColor,
        transparent: true,
        opacity    : 0.6,
      });
      const barrier = new THREE.Mesh(geo, mat);
      barrier.position.set(mx, 2.5, mz);
      barrier.lookAt(this.center.x, 2.5, this.center.z);
      this.scene.add(barrier);
      this._meshes.push(barrier);
      this._doors.push({ mesh: barrier, locked: true, isBoss: true });
    }
  }

  _checkDoors() {
    if (!this.cleared) return;
    for (const door of this._doors) {
      if (door.locked) {
        door.locked      = false;
        door.mesh.visible = false;
      }
    }
  }

  // ── Puzzle ────────────────────────────────────────────────────────────────

  _buildPuzzleHints() {
    // Texto en el suelo con el orden esperado
    const canvas  = document.createElement('canvas');
    canvas.width  = 512;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = 'rgba(0,0,0,0)';
    ctx.fillRect(0, 0, 512, 128);

    const icons = { fire: '🔥', ice: '❄️', wind: '🌀', shadow: '🌑' };
    const text  = this._puzzleExpected.map(e => icons[e] ?? e).join('  →  ');

    ctx.font      = '36px monospace';
    ctx.fillStyle = '#C9A84C';
    ctx.textAlign = 'center';
    ctx.fillText(text, 256, 72);

    const tex = new THREE.CanvasTexture(canvas);
    const geo = new THREE.PlaneGeometry(8, 2);
    const mat = new THREE.MeshBasicMaterial({ map: tex, transparent: true, side: THREE.DoubleSide });
    const m   = new THREE.Mesh(geo, mat);
    m.rotation.x = -Math.PI / 2;
    m.position.set(this.center.x, 0.05, this.center.z - 6);
    this.scene.add(m);
    this._meshes.push(m);
  }

  activatePedestal(element) {
    if (this.cleared || this.type !== ROOM_TYPES.PUZZLE) return;

    const expected = this._puzzleExpected[this._puzzleOrder.length];
    if (element === expected) {
      this._puzzleOrder.push(element);
      this._flashPedestal(element, true);
      if (this._puzzleOrder.length === this._puzzleExpected.length) {
        this._clearRoom();
      }
    } else {
      this._puzzleErrors++;
      this._flashPedestal(element, false);
      this._spawnPuzzleEnemy();
      this._puzzleOrder = [];
    }
  }

  _spawnPuzzleEnemy() {
    if (!this._enemySpawner) return;
    const tier = Math.min(this._puzzleErrors, 3);
    const enemy = this._enemySpawner(
      { x: this.center.x, z: this.center.z },
      tier,
      'puzzle'
    );
    if (enemy) {
      this._puzzleEnemies.push(enemy);
      this._enemies.push(enemy);
    }
  }

  _flashPedestal(element, success) {
    const colors  = { fire: 0xff4444, ice: 0x4488ff, wind: 0x44ff88, shadow: 0x8844ff };
    const color   = success ? 0xffffff : 0xff0000;
    const el = document.createElement('div');
    Object.assign(el.style, {
      position    : 'fixed',
      top         : '40%',
      left        : '50%',
      transform   : 'translateX(-50%)',
      fontFamily  : 'monospace',
      fontSize    : '20px',
      color       : success ? '#44ff88' : '#ff4444',
      pointerEvents: 'none',
      zIndex      : '300',
      opacity     : '1',
      transition  : 'opacity 0.6s, top 0.6s',
    });
    el.textContent = success ? '✓' : '✗';
    document.body.appendChild(el);
    requestAnimationFrame(() => requestAnimationFrame(() => {
      el.style.opacity = '0';
      el.style.top     = '34%';
    }));
    setTimeout(() => el.remove(), 700);
  }

  _updatePuzzle() {
    this._puzzleEnemies = this._puzzleEnemies.filter(e => !e.isDead?.());
  }

  // ── Plataformas ───────────────────────────────────────────────────────────

  _buildPlatformTraps() {
    // Zonas de trampa en el suelo
    const trapPositions = [
      [-5, -5], [0, -3], [5, -5],
      [-5,  0], [5,  0],
      [-5,  5], [0,  3], [5,  5],
    ];
    for (const [ox, oz] of trapPositions) {
      const geo = new THREE.PlaneGeometry(3.5, 3.5);
      const mat = new THREE.MeshBasicMaterial({
        color      : 0x330000,
        transparent: true,
        opacity    : 0.5,
        side       : THREE.DoubleSide,
      });
      const m = new THREE.Mesh(geo, mat);
      m.rotation.x = -Math.PI / 2;
      m.position.set(this.center.x + ox, 0.02, this.center.z + oz);
      this.scene.add(m);
      this._meshes.push(m);
      this._platforms.push({ mesh: m, ox, oz, active: false });
    }
  }

  _updatePlatforms(delta) {
    const player = window._partyManager?.getActiveCharacter()
                ?? window._player;
    if (!player) return;

    const pos = player.root?.position ?? player.position;

    for (const trap of this._platforms) {
      const tx   = this.center.x + trap.ox;
      const tz   = this.center.z + trap.oz;
      const dx   = pos.x - tx;
      const dz   = pos.z - tz;
      const dist = Math.sqrt(dx*dx + dz*dz);

      if (dist < 1.8 && !trap.active) {
        trap.active = true;
        trap.mesh.material.color.setHex(0xff2200);
        this._launchArrows(tx, tz);
        setTimeout(() => {
          trap.active = false;
          trap.mesh.material.color.setHex(0x330000);
        }, 2000);
      }
    }
  }

  _launchArrows(fromX, fromZ) {
    const directions = [
    
[1,0],[-1,0],[0,1],[0,-1],
[0.7,0.7],[-0.7,0.7],[0.7,-0.7],[-0.7,-0.7],
      ];
    for (const [dx, dz] of directions) {
      const geo = new THREE.CylinderGeometry(0.05, 0.05, 0.8, 6);
      const mat = new THREE.MeshBasicMaterial({ color: 0xff8800 });
      const m   = new THREE.Mesh(geo, mat);
      m.position.set(fromX, 0.8, fromZ);
      m.rotation.z = Math.PI / 2;
      this.scene.add(m);
      this._meshes.push(m);
      this._arrows.push({
        mesh: m, dx, dz,
        speed: 8, life: 1.5,
        fromX, fromZ,
      });
    }
  }

  _updateArrows(delta) {
    const player = window._partyManager?.getActiveCharacter()
                ?? window._player;

    for (let i = this._arrows.length - 1; i >= 0; i--) {
      const a = this._arrows[i];
      a.life -= delta;
      a.mesh.position.x += a.dx * a.speed * delta;
      a.mesh.position.z += a.dz * a.speed * delta;

      // Hit al jugador
      if (player) {
        const pos = player.root?.position ?? player.position;
        const dx  = pos.x - a.mesh.position.x;
        const dz  = pos.z - a.mesh.position.z;
        if (Math.sqrt(dx*dx + dz*dz) < 0.6) {
          player.takeDamage?.(10);
          a.life = 0;
        }
      }

      if (a.life <= 0) {
        this.scene.remove(a.mesh);
        a.mesh.geometry.dispose();
        a.mesh.material.dispose();
        this._arrows.splice(i, 1);
      }
    }
  }

  // ── Recompensa ────────────────────────────────────────────────────────────

  _clearRoom() {
    if (this.cleared) return;
    this.cleared = true;
    this.active  = false;

    // Abrir puertas
    for (const door of this._doors) {
      door.locked       = false;
      door.mesh.visible = false;
    }

    // Flash verde
    const flash = document.createElement('div');
    Object.assign(flash.style, {
      position  : 'fixed', inset: '0',
      background: 'rgba(0,255,100,0.08)',
      pointerEvents: 'none', zIndex: '200',
      transition: 'opacity 0.5s',
    });
    document.body.appendChild(flash);
    requestAnimationFrame(() => requestAnimationFrame(() => {
      flash.style.opacity = '0';
    }));
    setTimeout(() => flash.remove(), 600);

    if (this._onClear) this._onClear(this);
  }

  // ── Helpers ───────────────────────────────────────────────────────────────

  _randomOffsets(count, radius) {
    const offsets = [];
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const r     = radius * (0.5 + Math.random() * 0.5);
      offsets.push([Math.cos(angle) * r, Math.sin(angle) * r]);
    }
    return offsets;
  }

  destroy() {
    for (const m of this._meshes) {
      this.scene.remove(m);
      m.geometry?.dispose();
      m.material?.dispose();
    }
    for (const a of this._arrows) {
      this.scene.remove(a.mesh);
    }
    this._meshes   = [];
    this._arrows   = [];
    this._enemies  = [];
    this._doors    = [];
    this._triggers = [];
  }
}
