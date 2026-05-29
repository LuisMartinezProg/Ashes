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

const ROOM_SIZE  = 24;
const WALL_H     = 5;
const CORRIDOR_W = 5;
const ACTIVATE_RANGE = 16;

export class DungeonRoom {
  constructor(scene, roomData, dungeonDef, level) {
    this.scene   = scene;
    this.data    = roomData;
    this.def     = dungeonDef;
    this.level   = level;
    this.type    = roomData.type;
    this.center  = roomData.center;
    this.cleared = false;
    this.active  = false;
    this.locked  = roomData.locked ?? false;

    this._enemies        = [];
    this._meshes         = [];
    this._doors          = [];
    this._onClear        = null;
    this._onEnter        = null;
    this._enemySpawner   = null;

    this._puzzleOrder    = [];
    this._puzzleExpected = [];
    this._puzzleErrors   = 0;
    this._puzzleEnemies  = [];

    this._platforms  = [];
    this._arrows     = [];

    this._buildGeometry();
  }

  // ── Construir geometría de la sala ────────────────────────────────────────

  _buildGeometry() {
    const { worldX, worldZ, type } = this.data;
    const color = this._roomColor(type);
    const cx = worldX + ROOM_SIZE / 2;
    const cz = worldZ + ROOM_SIZE / 2;

    // Suelo
    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(ROOM_SIZE, ROOM_SIZE),
      new THREE.MeshStandardMaterial({ color: color.floor, roughness: 0.9, metalness: 0.1 })
    );
    floor.rotation.x = -Math.PI / 2;
    floor.position.set(cx, 0, cz);
    this.scene.add(floor);
    this._meshes.push(floor);

    // Techo semitransparente
    const ceil = new THREE.Mesh(
      new THREE.PlaneGeometry(ROOM_SIZE, ROOM_SIZE),
      new THREE.MeshBasicMaterial({ color: color.floor, transparent: true, opacity: 0.35, side: THREE.DoubleSide })
    );
    ceil.rotation.x = Math.PI / 2;
    ceil.position.set(cx, WALL_H, cz);
    this.scene.add(ceil);
    this._meshes.push(ceil);

    // Paredes
    this._buildWalls(color.wall);

    // Decoración
    this._decorateRoom(color);
  }

  _buildWalls(color) {
    const { worldX, worldZ } = this.data;
    const cx = worldX + ROOM_SIZE / 2;
    const cz = worldZ + ROOM_SIZE / 2;
    const mat = new THREE.MeshStandardMaterial({ color, roughness: 0.85, metalness: 0.1 });

    const sides = [
      { pos: [cx, WALL_H/2, worldZ],            rot: [0,0,0],             axis:'z', dir:-1 },
      { pos: [cx, WALL_H/2, worldZ+ROOM_SIZE],  rot: [0,Math.PI,0],       axis:'z', dir: 1 },
      { pos: [worldX, WALL_H/2, cz],            rot: [0,Math.PI/2,0],     axis:'x', dir:-1 },
      { pos: [worldX+ROOM_SIZE, WALL_H/2, cz],  rot: [0,-Math.PI/2,0],    axis:'x', dir: 1 },
    ];

    for (const side of sides) {
      const hasConn = this.data.connections.some(n => {
        if (side.axis === 'z') return side.dir === -1 ? n.row < this.data.row : n.row > this.data.row;
        return side.dir === -1 ? n.col < this.data.col : n.col > this.data.col;
      });

      if (hasConn) {
        const segW = (ROOM_SIZE - CORRIDOR_W) / 2;
        for (const offset of [-1, 1]) {
          const seg = new THREE.Mesh(new THREE.BoxGeometry(segW, WALL_H, 0.4), mat);
          const shift = offset * (segW / 2 + CORRIDOR_W / 2);
          seg.position.set(
            side.pos[0] + (side.axis === 'x' ? 0 : shift),
            side.pos[1],
            side.pos[2] + (side.axis === 'z' ? 0 : shift)
          );
          seg.rotation.set(...side.rot);
          this.scene.add(seg);
          this._meshes.push(seg);
        }
      } else {
        const wall = new THREE.Mesh(new THREE.BoxGeometry(ROOM_SIZE, WALL_H, 0.4), mat);
        wall.position.set(...side.pos);
        wall.rotation.set(...side.rot);
        this.scene.add(wall);
        this._meshes.push(wall);
      }
    }
  }

  _decorateRoom(color) {
    const cx = this.center.x;
    const cz = this.center.z;

    switch (this.type) {
      case ROOM_TYPES.START: {
        const m = new THREE.Mesh(
          new THREE.CylinderGeometry(1.5, 1.5, 0.1, 16),
          new THREE.MeshBasicMaterial({ color: 0x88aaff, transparent: true, opacity: 0.5 })
        );
        m.position.set(cx, 0.05, cz);
        this.scene.add(m);
        this._meshes.push(m);
        break;
      }
      case ROOM_TYPES.BOSS: {
        const m = new THREE.Mesh(
          new THREE.CylinderGeometry(4, 4.5, 0.5, 16),
          new THREE.MeshStandardMaterial({
            color: this.def.glowColor, emissive: this.def.glowColor,
            emissiveIntensity: 0.5, roughness: 0.4,
          })
        );
        m.position.set(cx, 0.25, cz);
        this.scene.add(m);
        this._meshes.push(m);
        break;
      }
      case ROOM_TYPES.REWARD: {
        const m = new THREE.Mesh(
          new THREE.BoxGeometry(1, 0.8, 0.7),
          new THREE.MeshStandardMaterial({ color: 0xC9A84C, emissive: 0xC9A84C, emissiveIntensity: 0.4 })
        );
        m.position.set(cx, 0.4, cz);
        this.scene.add(m);
        this._meshes.push(m);
        break;
      }
      case ROOM_TYPES.PLATFORM: {
        [[-4,0.4,-4],[-1,0.8,-2],[2,1.2,0],[4,0.4,2],[1,0.8,4]].forEach(([px,py,pz]) => {
          const m = new THREE.Mesh(
            new THREE.BoxGeometry(3, 0.3, 3),
            new THREE.MeshStandardMaterial({ color: color.wall, roughness: 0.7 })
          );
          m.position.set(cx+px, py, cz+pz);
          this.scene.add(m);
          this._meshes.push(m);
        });
        break;
      }
      case ROOM_TYPES.PUZZLE: {
        const colors = [0xff4444, 0x4444ff, 0x44ff44, 0xffaa00];
        [[-4,0,-4],[4,0,-4],[-4,0,4],[4,0,4]].forEach(([ox,oy,oz], i) => {
          const m = new THREE.Mesh(
            new THREE.CylinderGeometry(0.4, 0.5, 1.2, 8),
            new THREE.MeshStandardMaterial({ color: colors[i], emissive: colors[i], emissiveIntensity: 0.4 })
          );
          m.position.set(cx+ox, 0.6, cz+oz);
          this.scene.add(m);
          this._meshes.push(m);
        });
        break;
      }
      case ROOM_TYPES.COMBAT: {
        [[-7,0,-7],[7,0,-7],[-7,0,7],[7,0,7]].forEach(([ox,oy,oz]) => {
          const torch = new THREE.Mesh(
            new THREE.CylinderGeometry(0.1, 0.12, 1.2, 6),
            new THREE.MeshStandardMaterial({ color: 0x5a3a1a })
          );
          torch.position.set(cx+ox, 0.6, cz+oz);
          this.scene.add(torch);
          this._meshes.push(torch);

          const flame = new THREE.Mesh(
            new THREE.SphereGeometry(0.15, 6, 6),
            new THREE.MeshStandardMaterial({ color: 0xff6600, emissive: 0xff6600, emissiveIntensity: 2.0 })
          );
          flame.position.set(cx+ox, 1.4, cz+oz);
          this.scene.add(flame);
          this._meshes.push(flame);
        });
        break;
      }
    }
  }

  _roomColor(type) {
    switch (type) {
      case ROOM_TYPES.BOSS:     return { floor: 0x1a0a2a, wall: 0x2a0a3a };
      case ROOM_TYPES.REWARD:   return { floor: 0x2a2010, wall: 0x3a3020 };
      case ROOM_TYPES.START:    return { floor: 0x0a1a0a, wall: 0x1a2a1a };
      case ROOM_TYPES.PLATFORM: return { floor: 0x101828, wall: 0x182030 };
      case ROOM_TYPES.PUZZLE:   return { floor: 0x180a28, wall: 0x280a38 };
      default:                  return { floor: this.def.color, wall: this.def.color };
    }
  }

  // ── Setup ─────────────────────────────────────────────────────────────────

  onClear(fn) { this._onClear = fn; }
  onEnter(fn) { this._onEnter = fn; }

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

  activate() {
    if (this.active) return;
    this.active = true;
    if (this._onEnter) this._onEnter(this);
    if (this.type === ROOM_TYPES.COMBAT) this._spawnEnemies();
    if (this.type === ROOM_TYPES.BOSS)   this._lockRoom();
  }

  checkActivation(playerPos) {
    if (this.active || this.cleared) return;
    const dx = playerPos.x - this.center.x;
    const dz = playerPos.z - this.center.z;
    if (Math.sqrt(dx*dx + dz*dz) < ACTIVATE_RANGE) this.activate();
  }

  // ── Combate ───────────────────────────────────────────────────────────────

  _spawnEnemies() {
    if (!this._enemySpawner) return;
    const count = 2 + Math.floor(this.level * 0.8);
    for (const [ox, oz] of this._randomOffsets(count, 6)) {
      const enemy = this._enemySpawner({ x: this.center.x+ox, z: this.center.z+oz }, this.level);
      if (enemy) {
        this._enemies.push(enemy);
        enemy.onDeath = () => this._checkCombatClear();
      }
    }
    this._lockDoors();
  }

  _updateCombat() {
    if (this.cleared) return;
    if (this._enemies.length > 0 && this._enemies.every(e => e.isDead?.())) {
      this._clearRoom();
    }
  }

  _checkCombatClear() {
    if (this._enemies.every(e => e.isDead?.())) this._clearRoom();
  }

  // ── Puertas ───────────────────────────────────────────────────────────────

  _lockDoors() {
    for (const door of this._doors) { door.mesh.visible = true; door.locked = true; }
  }

  _lockRoom() { this._buildBossBarrier(); }

  _buildBossBarrier() {
    for (const conn of this.data.connections) {
      const dx = conn.center.x - this.center.x;
      const dz = conn.center.z - this.center.z;
      const barrier = new THREE.Mesh(
        new THREE.BoxGeometry(4, 5, 0.4),
        new THREE.MeshBasicMaterial({ color: this.def.glowColor, transparent: true, opacity: 0.6 })
      );
      barrier.position.set(this.center.x + dx*0.45, 2.5, this.center.z + dz*0.45);
      barrier.lookAt(this.center.x, 2.5, this.center.z);
      this.scene.add(barrier);
      this._meshes.push(barrier);
      this._doors.push({ mesh: barrier, locked: true, isBoss: true });
    }
  }

  _checkDoors() {
    if (!this.cleared) return;
    for (const door of this._doors) {
      if (door.locked) { door.locked = false; door.mesh.visible = false; }
    }
  }

  // ── Puzzle ────────────────────────────────────────────────────────────────

  _buildPuzzleHints() {
    const canvas = document.createElement('canvas');
    canvas.width = 512; canvas.height = 128;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = 'rgba(0,0,0,0)';
    ctx.fillRect(0, 0, 512, 128);
    const icons = { fire:'🔥', ice:'❄️', wind:'🌀', shadow:'🌑' };
    ctx.font = '36px monospace';
    ctx.fillStyle = '#C9A84C';
    ctx.textAlign = 'center';
    ctx.fillText(this._puzzleExpected.map(e => icons[e]??e).join('  →  '), 256, 72);
    const m = new THREE.Mesh(
      new THREE.PlaneGeometry(8, 2),
      new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(canvas), transparent: true, side: THREE.DoubleSide })
    );
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
      this._flashPedestal(true);
      if (this._puzzleOrder.length === this._puzzleExpected.length) this._clearRoom();
    } else {
      this._puzzleErrors++;
      this._flashPedestal(false);
      this._spawnPuzzleEnemy();
      this._puzzleOrder = [];
    }
  }

  _spawnPuzzleEnemy() {
    if (!this._enemySpawner) return;
    const enemy = this._enemySpawner({ x: this.center.x, z: this.center.z }, Math.min(this._puzzleErrors, 3), 'puzzle');
    if (enemy) { this._puzzleEnemies.push(enemy); this._enemies.push(enemy); }
  }

  _flashPedestal(success) {
    const el = document.createElement('div');
    Object.assign(el.style, {
      position:'fixed', top:'40%', left:'50%', transform:'translateX(-50%)',
      fontFamily:'monospace', fontSize:'20px',
      color: success ? '#44ff88' : '#ff4444',
      pointerEvents:'none', zIndex:'300',
      opacity:'1', transition:'opacity 0.6s, top 0.6s',
    });
    el.textContent = success ? '✓' : '✗';
    document.body.appendChild(el);
    requestAnimationFrame(() => requestAnimationFrame(() => {
      el.style.opacity = '0'; el.style.top = '34%';
    }));
    setTimeout(() => el.remove(), 700);
  }

  _updatePuzzle() {
    this._puzzleEnemies = this._puzzleEnemies.filter(e => !e.isDead?.());
  }

  // ── Plataformas ───────────────────────────────────────────────────────────

  _buildPlatformTraps() {
    [[-5,-5],[0,-3],[5,-5],[-5,0],[5,0],[-5,5],[0,3],[5,5]].forEach(([ox,oz]) => {
      const m = new THREE.Mesh(
        new THREE.PlaneGeometry(3.5, 3.5),
        new THREE.MeshBasicMaterial({ color: 0x330000, transparent: true, opacity: 0.5, side: THREE.DoubleSide })
      );
      m.rotation.x = -Math.PI / 2;
      m.position.set(this.center.x+ox, 0.02, this.center.z+oz);
      this.scene.add(m);
      this._meshes.push(m);
      this._platforms.push({ mesh: m, ox, oz, active: false });
    });
  }

  _updatePlatforms(delta) {
    const player = window._partyManager?.getActiveCharacter() ?? window._player;
    if (!player) return;
    const pos = player.root?.position ?? player.position;
    for (const trap of this._platforms) {
      const tx = this.center.x + trap.ox;
      const tz = this.center.z + trap.oz;
      const dx = pos.x - tx, dz = pos.z - tz;
      if (Math.sqrt(dx*dx+dz*dz) < 1.8 && !trap.active) {
        trap.active = true;
        trap.mesh.material.color.setHex(0xff2200);
        this._launchArrows(tx, tz);
        setTimeout(() => { trap.active = false; trap.mesh.material.color.setHex(0x330000); }, 2000);
      }
    }
  }

  _launchArrows(fromX, fromZ) {
    [[1,0],[-1,0],[0,1],[0,-1],[0.7,0.7],[-0.7,0.7],[0.7,-0.7],[-0.7,-0.7]].forEach(([dx,dz]) => {
      const m = new THREE.Mesh(
        new THREE.CylinderGeometry(0.05, 0.05, 0.8, 6),
        new THREE.MeshBasicMaterial({ color: 0xff8800 })
      );
      m.position.set(fromX, 0.8, fromZ);
      m.rotation.z = Math.PI / 2;
      this.scene.add(m);
      this._meshes.push(m);
      this._arrows.push({ mesh: m, dx, dz, speed: 8, life: 1.5 });
    });
  }

  _updateArrows(delta) {
    const player = window._partyManager?.getActiveCharacter() ?? window._player;
    for (let i = this._arrows.length - 1; i >= 0; i--) {
      const a = this._arrows[i];
      a.life -= delta;
      a.mesh.position.x += a.dx * a.speed * delta;
      a.mesh.position.z += a.dz * a.speed * delta;
      if (player) {
        const pos = player.root?.position ?? player.position;
        const dx = pos.x - a.mesh.position.x, dz = pos.z - a.mesh.position.z;
        if (Math.sqrt(dx*dx+dz*dz) < 0.6) { player.takeDamage?.(10); a.life = 0; }
      }
      if (a.life <= 0) {
        this.scene.remove(a.mesh);
        a.mesh.geometry.dispose();
        a.mesh.material.dispose();
        this._arrows.splice(i, 1);
      }
    }
  }

  // ── Clear ─────────────────────────────────────────────────────────────────

  _clearRoom() {
    if (this.cleared) return;
    this.cleared = true;
    this.active  = false;
    for (const door of this._doors) { door.locked = false; door.mesh.visible = false; }
    const flash = document.createElement('div');
    Object.assign(flash.style, {
      position:'fixed', inset:'0',
      background:'rgba(0,255,100,0.08)',
      pointerEvents:'none', zIndex:'200', transition:'opacity 0.5s',
    });
    document.body.appendChild(flash);
    requestAnimationFrame(() => requestAnimationFrame(() => { flash.style.opacity = '0'; }));
    setTimeout(() => flash.remove(), 600);
    if (this._onClear) this._onClear(this);
  }

  // ── Helpers ───────────────────────────────────────────────────────────────

  _randomOffsets(count, radius) {
    return Array.from({ length: count }, (_, i) => {
      const angle = (i / count) * Math.PI * 2;
      const r = radius * (0.5 + Math.random() * 0.5);
      return [Math.cos(angle) * r, Math.sin(angle) * r];
    });
  }

  destroy() {
    for (const m of this._meshes) {
      this.scene.remove(m);
      m.geometry?.dispose();
      if (Array.isArray(m.material)) m.material.forEach(mat => mat.dispose());
      else m.material?.dispose();
    }
    for (const a of this._arrows) this.scene.remove(a.mesh);
    this._meshes  = [];
    this._arrows  = [];
    this._enemies = [];
    this._doors   = [];
  }
}
