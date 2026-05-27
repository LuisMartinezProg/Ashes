// core/dungeons/DungeonGenerator.js — Ashes of the Reborn | Valiant Gaming
import * as THREE from 'three';

const ROOM_SIZE    = 20;
const CORRIDOR_W   = 4;
const WALL_H       = 5;
const GRID_COLS    = 4;
const GRID_ROWS    = 3;

const ROOM_TYPES = {
  START   : 'start',
  COMBAT  : 'combat',
  PUZZLE  : 'puzzle',
  PLATFORM: 'platform',
  REWARD  : 'reward',
  BOSS    : 'boss',
  EMPTY   : 'empty',
};

export class DungeonGenerator {
  constructor(scene, dungeonDef, level) {
    this.scene      = scene;
    this.def        = dungeonDef;
    this.level      = level;
    this._meshes    = [];
    this._rooms     = [];
    this._corridors = [];
    this._grid      = [];
  }

  // ── Generar mazmorra completa ─────────────────────────────────────────────

  generate(originX = 0, originZ = -130) {
    this._origin = { x: originX, z: originZ };
    this._initGrid();
    this._placeRooms();
    this._connectRooms();
    this._buildGeometry();
    return {
      rooms    : this._rooms,
      corridors: this._corridors,
      start    : this._rooms.find(r => r.type === ROOM_TYPES.START),
      boss     : this._rooms.find(r => r.type === ROOM_TYPES.BOSS),
    };
  }

  // ── Grid ──────────────────────────────────────────────────────────────────

  _initGrid() {
    this._grid = [];
    for (let row = 0; row < GRID_ROWS; row++) {
      this._grid[row] = [];
      for (let col = 0; col < GRID_COLS; col++) {
        this._grid[row][col] = null;
      }
    }
  }

  _placeRooms() {
    // Sala inicio — esquina inferior izquierda
    this._addRoom(GRID_ROWS - 1, 0, ROOM_TYPES.START);

    // Sala jefe — esquina superior derecha
    this._addRoom(0, GRID_COLS - 1, ROOM_TYPES.BOSS);

    // Sala recompensa — justo antes del jefe
    this._addRoom(0, GRID_COLS - 2, ROOM_TYPES.REWARD);

    // Sala tutorial nivel 1 — plataformas
    if (this.level <= 2) {
      this._addRoom(GRID_ROWS - 1, 1, ROOM_TYPES.PLATFORM);
      this._addRoom(GRID_ROWS - 2, 1, ROOM_TYPES.PUZZLE);
    }

    // Llenar el resto aleatoriamente
    const combatWeight = Math.min(0.3 + this.level * 0.08, 0.85);
    for (let row = 0; row < GRID_ROWS; row++) {
      for (let col = 0; col < GRID_COLS; col++) {
        if (this._grid[row][col]) continue;
        const roll = Math.random();
        if (roll < combatWeight) {
          this._addRoom(row, col, ROOM_TYPES.COMBAT);
        } else {
          this._addRoom(row, col, ROOM_TYPES.EMPTY);
        }
      }
    }
  }

  _addRoom(row, col, type) {
    const wx = this._origin.x + col * (ROOM_SIZE + CORRIDOR_W);
    const wz = this._origin.z + row * (ROOM_SIZE + CORRIDOR_W);
    const room = {
      id       : `room_${row}_${col}`,
      type,
      row, col,
      worldX   : wx,
      worldZ   : wz,
      center   : new THREE.Vector3(wx + ROOM_SIZE / 2, 0, wz + ROOM_SIZE / 2),
      cleared  : false,
      locked   : type === ROOM_TYPES.BOSS,
      enemies  : [],
      connections: [],
    };
    this._grid[row][col] = room;
    this._rooms.push(room);
    return room;
  }

  // ── Conectar salas ────────────────────────────────────────────────────────

  _connectRooms() {
    // Conectar en L desde START hasta BOSS garantizando camino
    const path = this._findPath(
      { row: GRID_ROWS - 1, col: 0 },
      { row: 0,             col: GRID_COLS - 1 }
    );

    for (let i = 0; i < path.length - 1; i++) {
      this._connect(path[i], path[i + 1]);
    }

    // Conexiones aleatorias adicionales para ramificar
    for (let row = 0; row < GRID_ROWS; row++) {
      for (let col = 0; col < GRID_COLS; col++) {
        const room = this._grid[row][col];
        if (!room) continue;
        const neighbors = this._getNeighbors(row, col);
        for (const n of neighbors) {
          if (Math.random() < 0.35 && !this._isConnected(room, n)) {
            this._connect(room, n);
          }
        }
      }
    }
  }

  _findPath(from, to) {
    const path = [this._grid[from.row][from.col]];
    let cur = { ...from };
    while (cur.row !== to.row || cur.col !== to.col) {
      if (cur.row > to.row && Math.random() < 0.6) {
        cur.row--;
      } else if (cur.col < to.col) {
        cur.col++;
      } else {
        cur.row--;
      }
      path.push(this._grid[cur.row][cur.col]);
    }
    return path;
  }

  _connect(a, b) {
    if (!a || !b) return;
    if (this._isConnected(a, b)) return;
    a.connections.push(b);
    b.connections.push(a);
    this._corridors.push({ from: a, to: b });
  }

  _isConnected(a, b) {
    return a.connections.includes(b);
  }

  _getNeighbors(row, col) {
    const dirs = [[-1,0],[1,0],[0,-1],[0,1]];
    return dirs
      .map(([dr, dc]) => this._grid[row + dr]?.[col + dc])
      .filter(Boolean);
  }

  // ── Geometría ─────────────────────────────────────────────────────────────

  _buildGeometry() {
    for (const room of this._rooms) {
      this._buildRoom(room);
    }
    for (const cor of this._corridors) {
      this._buildCorridor(cor.from, cor.to);
    }
  }

  _buildRoom(room) {
    const { worldX, worldZ, type } = room;
    const color = this._roomColor(type);

    // Suelo
    const floorGeo = new THREE.PlaneGeometry(ROOM_SIZE, ROOM_SIZE);
    const floorMat = new THREE.MeshStandardMaterial({
      color    : color.floor,
      roughness: 0.9,
      metalness: 0.1,
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.set(worldX + ROOM_SIZE / 2, 0, worldZ + ROOM_SIZE / 2);
    this.scene.add(floor);
    this._meshes.push(floor);

    // Paredes — 4 lados, dejando huecos donde hay conexiones
    this._buildWalls(room, color.wall);

    // Techo semitransparente
    const ceilGeo = new THREE.PlaneGeometry(ROOM_SIZE, ROOM_SIZE);
    const ceilMat = new THREE.MeshBasicMaterial({
      color      : color.floor,
      transparent: true,
      opacity    : 0.4,
      side       : THREE.DoubleSide,
    });
    const ceil = new THREE.Mesh(ceilGeo, ceilMat);
    ceil.rotation.x = Math.PI / 2;
    ceil.position.set(worldX + ROOM_SIZE / 2, WALL_H, worldZ + ROOM_SIZE / 2);
    this.scene.add(ceil);
    this._meshes.push(ceil);

    // Decoración según tipo
    this._decorateRoom(room, color);
  }

  _buildWalls(room, color) {
    const { worldX, worldZ } = room;
    const cx = worldX + ROOM_SIZE / 2;
    const cz = worldZ + ROOM_SIZE / 2;

    const sides = [
      { pos: [cx,            WALL_H / 2, worldZ],            rot: [0, 0, 0],            axis: 'z', dir: -1 },
      { pos: [cx,            WALL_H / 2, worldZ + ROOM_SIZE], rot: [0, Math.PI, 0],     axis: 'z', dir:  1 },
      { pos: [worldX,        WALL_H / 2, cz],                 rot: [0, Math.PI / 2, 0], axis: 'x', dir: -1 },
      { pos: [worldX + ROOM_SIZE, WALL_H / 2, cz],            rot: [0, -Math.PI / 2, 0],axis: 'x', dir:  1 },
    ];

    const mat = new THREE.MeshStandardMaterial({ color, roughness: 0.85, metalness: 0.1 });

    for (const side of sides) {
      const hasConnection = room.connections.some(n => {
        if (side.axis === 'z') return side.dir === -1 ? n.row < room.row : n.row > room.row;
        return side.dir === -1 ? n.col < room.col : n.col > room.col;
      });

      if (hasConnection) {
        // Pared con hueco — dos segmentos laterales
        const segW = (ROOM_SIZE - CORRIDOR_W) / 2;
        for (const offset of [-1, 1]) {
          const segGeo = new THREE.BoxGeometry(segW, WALL_H, 0.4);
          const seg    = new THREE.Mesh(segGeo, mat);
          const shift  = offset * (segW / 2 + CORRIDOR_W / 2);
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
        const wallGeo = new THREE.BoxGeometry(ROOM_SIZE, WALL_H, 0.4);
        const wall    = new THREE.Mesh(wallGeo, mat);
        wall.position.set(...side.pos);
        wall.rotation.set(...side.rot);
        this.scene.add(wall);
        this._meshes.push(wall);
      }
    }
  }

  _buildCorridor(a, b) {
    const ax = a.worldX + ROOM_SIZE / 2;
    const az = a.worldZ + ROOM_SIZE / 2;
    const bx = b.worldX + ROOM_SIZE / 2;
    const bz = b.worldZ + ROOM_SIZE / 2;

    const dx  = bx - ax;
    const dz  = bz - az;
    const len = Math.sqrt(dx*dx + dz*dz) - ROOM_SIZE;
    if (len <= 0) return;

    const mx = (ax + bx) / 2;
    const mz = (az + bz) / 2;

    const color = this._roomColor(ROOM_TYPES.EMPTY);

    const floorGeo = new THREE.PlaneGeometry(
      Math.abs(dx) > Math.abs(dz) ? len : CORRIDOR_W,
      Math.abs(dx) > Math.abs(dz) ? CORRIDOR_W : len
    );
    const floorMat = new THREE.MeshStandardMaterial({ color: color.floor, roughness: 0.9 });
    const floor    = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.set(mx, 0, mz);
    this.scene.add(floor);
    this._meshes.push(floor);
  }

  _decorateRoom(room, color) {
    const cx = room.worldX + ROOM_SIZE / 2;
    const cz = room.worldZ + ROOM_SIZE / 2;

    switch (room.type) {
      case ROOM_TYPES.START: {
        // Círculo de bienvenida
        const geo = new THREE.CylinderGeometry(1.5, 1.5, 0.1, 16);
        const mat = new THREE.MeshBasicMaterial({ color: 0x88aaff, transparent: true, opacity: 0.5 });
        const m   = new THREE.Mesh(geo, mat);
        m.position.set(cx, 0.05, cz);
        this.scene.add(m);
        this._meshes.push(m);
        break;
      }
      case ROOM_TYPES.BOSS: {
        // Plataforma central elevada
        const geo = new THREE.CylinderGeometry(4, 4.5, 0.5, 16);
        const mat = new THREE.MeshStandardMaterial({
          color    : this.def.glowColor,
          emissive : this.def.glowColor,
          emissiveIntensity: 0.3,
          roughness: 0.4,
        });
        const m   = new THREE.Mesh(geo, mat);
        m.position.set(cx, 0.25, cz);
        this.scene.add(m);
        this._meshes.push(m);

        // Luz del jefe
        const light = new THREE.PointLight(this.def.glowColor, 3, 20);
        light.position.set(cx, 4, cz);
        this.scene.add(light);
        this._meshes.push(light);
        break;
      }
      case ROOM_TYPES.REWARD: {
        // Cofre visual
        const geo = new THREE.BoxGeometry(1, 0.8, 0.7);
        const mat = new THREE.MeshStandardMaterial({ color: 0xC9A84C, emissive: 0xC9A84C, emissiveIntensity: 0.4 });
        const m   = new THREE.Mesh(geo, mat);
        m.position.set(cx, 0.4, cz);
        this.scene.add(m);
        this._meshes.push(m);
        break;
      }
      case ROOM_TYPES.PLATFORM: {
        // Plataformas flotantes
        const positions = [
          [-4, 0.4, -4], [-1, 0.8, -2], [2, 1.2, 0],
          [4, 0.4, 2],   [1, 0.8, 4],
        ];
        for (const [px, py, pz] of positions) {
          const geo = new THREE.BoxGeometry(3, 0.3, 3);
          const mat = new THREE.MeshStandardMaterial({ color: color.wall, roughness: 0.7 });
          const m   = new THREE.Mesh(geo, mat);
          m.position.set(cx + px, py, cz + pz);
          this.scene.add(m);
          this._meshes.push(m);
        }
        break;
      }
      case ROOM_TYPES.PUZZLE: {
        // 4 pedestales
        const offsets = [[-4,0,-4],[4,0,-4],[-4,0,4],[4,0,4]];
        const colors  = [0xff4444, 0x4444ff, 0x44ff44, 0xffaa00];
        for (let i = 0; i < 4; i++) {
          const geo = new THREE.CylinderGeometry(0.4, 0.5, 1.2, 8);
          const mat = new THREE.MeshStandardMaterial({
            color    : colors[i],
            emissive : colors[i],
            emissiveIntensity: 0.4,
          });
          const m   = new THREE.Mesh(geo, mat);
          m.position.set(cx + offsets[i][0], 0.6, cz + offsets[i][2]);
          this.scene.add(m);
          this._meshes.push(m);
        }
        break;
      }
      case ROOM_TYPES.COMBAT: {
        // Antorchas en las esquinas
        const corners = [[-7,0,-7],[7,0,-7],[-7,0,7],[7,0,7]];
        for (const [ox, oy, oz] of corners) {
          const geo   = new THREE.CylinderGeometry(0.1, 0.12, 1.2, 6);
          const mat   = new THREE.MeshStandardMaterial({ color: 0x5a3a1a });
          const torch = new THREE.Mesh(geo, mat);
          torch.position.set(cx + ox, 0.6, cz + oz);
          this.scene.add(torch);
          this._meshes.push(torch);

          const light = new THREE.PointLight(0xff6600, 1.2, 6);
          light.position.set(cx + ox, 1.4, cz + oz);
          this.scene.add(light);
          this._meshes.push(light);
        }
        break;
      }
    }
  }

  _roomColor(type) {
    const base = this.def.color;
    switch (type) {
      case ROOM_TYPES.BOSS:     return { floor: 0x1a0a2a, wall: 0x2a0a3a };
      case ROOM_TYPES.REWARD:   return { floor: 0x2a2010, wall: 0x3a3020 };
      case ROOM_TYPES.START:    return { floor: 0x0a1a0a, wall: 0x1a2a1a };
      case ROOM_TYPES.PLATFORM: return { floor: 0x101828, wall: 0x182030 };
      case ROOM_TYPES.PUZZLE:   return { floor: 0x180a28, wall: 0x280a38 };
      default:                  return { floor: base,     wall: base     };
    }
  }

  // ── Destruir ──────────────────────────────────────────────────────────────

  destroy() {
    for (const m of this._meshes) {
      this.scene.remove(m);
      m.geometry?.dispose();
      m.material?.dispose();
    }
    this._meshes    = [];
    this._rooms     = [];
    this._corridors = [];
  }
}
