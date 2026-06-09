// core/dungeons/DungeonGenerator.js — Ashes of the Reborn | Valiant Gaming
import * as THREE from 'three';

const ROOM_SIZE  = 24;
const CORRIDOR_W = 5;
const WALL_H     = 5;

const ROOM_TYPES = {
  START   : 'start',
  COMBAT  : 'combat',
  PUZZLE  : 'puzzle',
  REWARD  : 'reward',
  PLATFORM: 'platform',
  BOSS    : 'boss',
  EMPTY   : 'empty',
};

export { ROOM_TYPES, ROOM_SIZE, CORRIDOR_W, WALL_H };

// Flujo fijo por piso:
// start > puzzle_easy > combat_easy > puzzle_mid > combat_mid >
// puzzle_hard > combat_hard1 > combat_hard2 > combat_hard3 > boss
const FLOOR_SEQUENCE = [
  { type: ROOM_TYPES.START,   difficulty: 0 },
  { type: ROOM_TYPES.PUZZLE,  difficulty: 1 },
  { type: ROOM_TYPES.COMBAT,  difficulty: 2 },
  { type: ROOM_TYPES.PUZZLE,  difficulty: 3 },
  { type: ROOM_TYPES.COMBAT,  difficulty: 4 },
  { type: ROOM_TYPES.PUZZLE,  difficulty: 5 },
  { type: ROOM_TYPES.COMBAT,  difficulty: 6 },
  { type: ROOM_TYPES.COMBAT,  difficulty: 7 },
  { type: ROOM_TYPES.COMBAT,  difficulty: 8 },
  { type: ROOM_TYPES.BOSS,    difficulty: 10 },
];

export class DungeonGenerator {
  constructor(scene, dungeonDef, level) {
    this.scene  = window._dungeonScene ?? scene;
    this.def    = dungeonDef;
    this.level  = level;
    this._rooms = [];
  }

  generate(originX = 0, originZ = -130) {
    this._rooms = [];
    const spacing = ROOM_SIZE + CORRIDOR_W;

    for (let i = 0; i < FLOOR_SEQUENCE.length; i++) {
      const seq  = FLOOR_SEQUENCE[i];
      const wx   = originX;
      const wz   = originZ + i * spacing;

      const room = {
        id         : `room_${i}`,
        type       : seq.type,
        difficulty : seq.difficulty,
        floorLevel : this.level,
        row        : i,
        col        : 0,
        worldX     : wx,
        worldZ     : wz,
        center     : new THREE.Vector3(wx + ROOM_SIZE / 2, 0, wz + ROOM_SIZE / 2),
        cleared    : false,
        locked     : seq.type === ROOM_TYPES.BOSS,
        connections: [],
      };

      // Conectar con la sala anterior
      if (i > 0) {
        const prev = this._rooms[i - 1];
        prev.connections.push(room);
        room.connections.push(prev);
      }

      this._rooms.push(room);
    }

    return {
      rooms: this._rooms,
      start: this._rooms[0],
      boss : this._rooms[this._rooms.length - 1],
    };
  }

  destroy() {
    this._rooms = [];
  }
}
