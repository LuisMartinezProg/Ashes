// core/dungeons/DungeonGenerator.js — Ashes of the Reborn | Valiant Gaming
import * as THREE from 'three';

const ROOM_SIZE  = 24;
const CORRIDOR_W = 5;
const WALL_H     = 5;
const GRID_COLS  = 4;
const GRID_ROWS  = 3;

const ROOM_TYPES = {
  START   : 'start',
  COMBAT  : 'combat',
  PUZZLE  : 'puzzle',
  PLATFORM: 'platform',
  REWARD  : 'reward',
  BOSS    : 'boss',
  EMPTY   : 'empty',
};

export { ROOM_TYPES, ROOM_SIZE, CORRIDOR_W, WALL_H };

export class DungeonGenerator {
  constructor(scene, dungeonDef, level) {
    this.scene  = window._dungeonScene ?? scene;
    this.def    = dungeonDef;
    this.level  = level;
    this._rooms = [];
    this._grid  = [];
  }

  generate(originX = 0, originZ = -130) {
    this._origin = { x: originX, z: originZ };
    this._initGrid();
    this._placeRooms();
    this._connectRooms();
    return {
      rooms: this._rooms,
      start: this._rooms.find(r => r.type === ROOM_TYPES.START),
      boss : this._rooms.find(r => r.type === ROOM_TYPES.BOSS),
    };
  }

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
    this._addRoom(GRID_ROWS - 1, 0, ROOM_TYPES.START);
    this._addRoom(0, GRID_COLS - 1, ROOM_TYPES.BOSS);
    this._addRoom(0, GRID_COLS - 2, ROOM_TYPES.REWARD);

    if (this.level <= 2) {
      this._addRoom(GRID_ROWS - 1, 1, ROOM_TYPES.PLATFORM);
      this._addRoom(GRID_ROWS - 2, 1, ROOM_TYPES.PUZZLE);
    }

    const combatWeight = Math.min(0.3 + this.level * 0.08, 0.85);
    for (let row = 0; row < GRID_ROWS; row++) {
      for (let col = 0; col < GRID_COLS; col++) {
        if (this._grid[row][col]) continue;
        this._addRoom(row, col,
          Math.random() < combatWeight ? ROOM_TYPES.COMBAT : ROOM_TYPES.EMPTY
        );
      }
    }
  }

  _addRoom(row, col, type) {
    const wx = this._origin.x + col * (ROOM_SIZE + CORRIDOR_W);
    const wz = this._origin.z + row * (ROOM_SIZE + CORRIDOR_W);
    const room = {
      id         : `room_${row}_${col}`,
      type,
      row, col,
      worldX     : wx,
      worldZ     : wz,
      center     : new THREE.Vector3(wx + ROOM_SIZE / 2, 0, wz + ROOM_SIZE / 2),
      cleared    : false,
      locked     : type === ROOM_TYPES.BOSS,
      connections: [],
    };
    this._grid[row][col] = room;
    this._rooms.push(room);
    return room;
  }

  _connectRooms() {
    const path = this._findPath(
      { row: GRID_ROWS - 1, col: 0 },
      { row: 0,             col: GRID_COLS - 1 }
    );
    for (let i = 0; i < path.length - 1; i++) {
      this._connect(path[i], path[i + 1]);
    }
    for (let row = 0; row < GRID_ROWS; row++) {
      for (let col = 0; col < GRID_COLS; col++) {
        const room = this._grid[row][col];
        if (!room) continue;
        for (const n of this._getNeighbors(row, col)) {
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
      if (cur.row > to.row && Math.random() < 0.6) cur.row--;
      else if (cur.col < to.col) cur.col++;
      else cur.row--;
      path.push(this._grid[cur.row][cur.col]);
    }
    return path;
  }

  _connect(a, b) {
    if (!a || !b || this._isConnected(a, b)) return;
    a.connections.push(b);
    b.connections.push(a);
  }

  _isConnected(a, b) { return a.connections.includes(b); }

  _getNeighbors(row, col) {
    return [[-1,0],[1,0],[0,-1],[0,1]]
      .map(([dr,dc]) => this._grid[row+dr]?.[col+dc])
      .filter(Boolean);
  }

  // Sin geometría — destroy es no-op
  destroy() {
    this._rooms = [];
    this._grid  = [];
  }
}
