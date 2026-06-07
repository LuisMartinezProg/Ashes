// core/dungeons/DungeonManager.js — Ashes of the Reborn | Valiant Gaming
import * as THREE from 'three';
import { DungeonGenerator } from './DungeonGenerator.js';
import { DungeonRoom }      from './DungeonRoom.js';
import { DungeonGuard }     from './enemies/DungeonGuard.js';
import { RuneWarden }       from './enemies/RuneWarden.js';
import { AncientSentinel }  from './enemies/AncientSentinel.js';
import { Malachar }         from './bosses/Malachar.js';
import { Veyris }           from './bosses/Veyris.js';
import { Khazeron }         from './bosses/Khazeron.js';
import { PlatformLevel }    from './levels/PlatformLevel.js';
import { PuzzleLevel }      from './levels/PuzzleLevel.js';

const DUNGEON_DEFS = [
  {
    id       : 'ruins',
    name     : 'Ruinas de Piedra',
    position : { x: 0,   z: -120 },
    color    : 0x8B7355,
    glowColor: 0xC9A84C,
    boss     : 'malachar',
    reward   : { etherFragments: 30, material: 'hierro',  amount: 20 },
  },
  {
    id       : 'crystal',
    name     : 'Caverna de Cristal',
    position : { x: -30, z: -160 },
    color    : 0x445566,
    glowColor: 0x44aaff,
    boss     : 'veyris',
    reward   : { etherFragments: 50, material: 'mineral', amount: 15 },
  },
  {
    id       : 'fortress',
    name     : 'Fortaleza Oscura',
    position : { x: 30,  z: -200 },
    color    : 0x1a0a2a,
    glowColor: 0x9933ff,
    boss     : 'khazeron',
    reward   : { etherFragments: 80, material: 'mineral', amount: 30 },
  },
];

const ENTER_RANGE  = 5;
const DOOR_RANGE   = 3.5;
const CHECK_RATE   = 0.3;

export class DungeonManager {
  constructor(scene, player) {
    this.scene  = scene;
    this.player = player;

    this._portals        = [];
    this._active         = null;
    this._roomPlan       = [];   // datos puros de todas las salas del piso
    this._currentRoom    = null; // DungeonRoom activa
    this._activeEnemies  = [];
    this._activePlatform = null;
    this._activePuzzle   = null;
    this._checkTimer     = 0;
    this._etherFragments = 0;
    this._currentLevel   = 1;
    this._stairPos       = null;
    this._stairReady     = false;
    this._nearDungeon    = null;

    this.onEnter  = null;
    this.onExit   = null;
    this.onReward = null;

    this._buildPortals();
    this._buildUI();
  }

  // ── Portales ──────────────────────────────────────────────────────────────

  _buildPortals() {
    for (const def of DUNGEON_DEFS) {
      const group = new THREE.Group();
      group.position.set(def.position.x, 0, def.position.z);

      const baseMat = new THREE.MeshStandardMaterial({ color: def.color, roughness: 0.6, metalness: 0.3 });
      const base    = new THREE.Mesh(new THREE.CylinderGeometry(2.5, 2.8, 0.3, 16), baseMat);
      base.position.y = 0.15;
      group.add(base);

      const archMat = new THREE.MeshStandardMaterial({
        color: def.glowColor, emissive: def.glowColor,
        emissiveIntensity: 0.8, roughness: 0.2, metalness: 0.6,
      });
      const arch = new THREE.Mesh(new THREE.TorusGeometry(2.2, 0.22, 10, 32, Math.PI), archMat);
      arch.position.y = 2.2;
      arch.rotation.z = Math.PI;
      group.add(arch);

      const portalMat = new THREE.MeshBasicMaterial({
        color: def.glowColor, transparent: true, opacity: 0.3, side: THREE.DoubleSide,
      });
      const portal = new THREE.Mesh(new THREE.CircleGeometry(2.0, 32), portalMat);
      portal.position.y = 2.2;
      portal.rotation.y = Math.PI / 2;
      group.add(portal);

      const light = new THREE.PointLight(def.glowColor, 2, 12);
      light.position.y = 2;
      group.add(light);

      group.add(this._makeLabel(def.name));
      this.scene.add(group);

      this._portals.push({
        def, group, arch, portal, portalMat, light,
        cleared: false, _pulse: Math.random() * Math.PI * 2,
      });
    }
  }

  _makeLabel(name) {
    const canvas = document.createElement('canvas');
    canvas.width = 256; canvas.height = 64;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = 'rgba(0,0,0,0)';
    ctx.fillRect(0, 0, 256, 64);
    ctx.font = 'bold 22px monospace';
    ctx.fillStyle = '#C9A84C';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(name, 128, 32);
    const mesh = new THREE.Mesh(
      new THREE.PlaneGeometry(4, 1),
      new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(canvas), transparent: true, side: THREE.DoubleSide })
    );
    mesh.position.y = 5.2;
    return mesh;
  }

  // ── UI ────────────────────────────────────────────────────────────────────

  _buildUI() {
    this._etherEl = document.createElement('div');
    Object.assign(this._etherEl.style, {
      position: 'fixed', top: '44px', right: '8px',
      fontFamily: 'monospace', fontSize: '10px',
      color: '#cc88ff', letterSpacing: '1px',
      pointerEvents: 'none', zIndex: '120',
      display: 'none', textShadow: '0 0 8px #9933ff',
    });
    this._etherEl.textContent = '✦ 0';
    document.body.appendChild(this._etherEl);

    this._enterBtn = document.createElement('button');
    Object.assign(this._enterBtn.style, {
      position: 'fixed', bottom: '200px', left: '50%',
      transform: 'translateX(-50%)', display: 'none',
      fontFamily: "'Cinzel',serif", fontSize: '12px',
      letterSpacing: '2px', color: '#C9A84C',
      background: 'rgba(10,8,20,0.92)',
      border: '1px solid rgba(201,168,76,0.5)',
      borderRadius: '24px', padding: '10px 28px',
      cursor: 'pointer', pointerEvents: 'all',
      zIndex: '150', whiteSpace: 'nowrap',
    });
    this._enterBtn.textContent = '⚔ Entrar a la Mazmorra';
    this._enterBtn.addEventListener('click', () => this._enterDungeon());
    this._enterBtn.addEventListener('touchstart', (e) => { e.preventDefault(); this._enterDungeon(); }, { passive: false });
    document.body.appendChild(this._enterBtn);

    this._exitBtn = document.createElement('button');
    Object.assign(this._exitBtn.style, {
      position: 'fixed', top: '60px', left: '14px',
      display: 'none', fontFamily: 'monospace', fontSize: '10px',
      letterSpacing: '1px', color: '#ff8888',
      background: 'rgba(10,8,20,0.85)',
      border: '1px solid rgba(255,100,100,0.3)',
      borderRadius: '16px', padding: '6px 14px',
      cursor: 'pointer', pointerEvents: 'all',
      zIndex: '150', whiteSpace: 'nowrap',
    });
    this._exitBtn.textContent = '← Salir';
    this._exitBtn.addEventListener('click', () => this.exitDungeon());
    this._exitBtn.addEventListener('touchstart', (e) => { e.preventDefault(); this.exitDungeon(); }, { passive: false });
    document.body.appendChild(this._exitBtn);

    this._levelEl = document.createElement('div');
    Object.assign(this._levelEl.style, {
      position: 'fixed', top: '60px', left: '50%',
      transform: 'translateX(-50%)',
      fontFamily: 'monospace', fontSize: '10px',
      color: '#C9A84C', letterSpacing: '2px',
      pointerEvents: 'none', zIndex: '120', display: 'none',
    });
    document.body.appendChild(this._levelEl);

    this._stairBtn = document.createElement('button');
    Object.assign(this._stairBtn.style, {
      position: 'fixed', bottom: '200px', left: '50%',
      transform: 'translateX(-50%)', display: 'none',
      fontFamily: "'Cinzel',serif", fontSize: '12px',
      letterSpacing: '2px', color: '#C9A84C',
      background: 'rgba(10,8,20,0.92)',
      border: '1px solid rgba(201,168,76,0.5)',
      borderRadius: '24px', padding: '10px 28px',
      cursor: 'pointer', pointerEvents: 'all',
      zIndex: '150', whiteSpace: 'nowrap',
    });
    this._stairBtn.textContent = '▼ Bajar al siguiente piso';
    this._stairBtn.addEventListener('click', () => this._descend());
    this._stairBtn.addEventListener('touchstart', (e) => { e.preventDefault(); this._descend(); }, { passive: false });
    document.body.appendChild(this._stairBtn);

    this._doorBtn = document.createElement('button');
    Object.assign(this._doorBtn.style, {
      position: 'fixed', bottom: '260px', left: '50%',
      transform: 'translateX(-50%)', display: 'none',
      fontFamily: "'Cinzel',serif", fontSize: '12px',
      letterSpacing: '2px', color: '#88ccff',
      background: 'rgba(10,8,20,0.92)',
      border: '1px solid rgba(100,180,255,0.5)',
      borderRadius: '24px', padding: '10px 28px',
      cursor: 'pointer', pointerEvents: 'all',
      zIndex: '150', whiteSpace: 'nowrap',
    });
    this._doorBtn.textContent = '▶ Avanzar';
    this._doorBtn.addEventListener('click', () => this._enterNextRoom());
    this._doorBtn.addEventListener('touchstart', (e) => { e.preventDefault(); this._enterNextRoom(); }, { passive: false });
    document.body.appendChild(this._doorBtn);
  }

  // ── Update ────────────────────────────────────────────────────────────────

  update(delta, camera) {
    this._checkTimer += delta;

    if (!this._active) {
      for (const d of this._portals) {
        d._pulse += delta * 1.8;
        const pulse = Math.sin(d._pulse) * 0.5 + 0.5;
        d.portalMat.opacity               = 0.2 + pulse * 0.25;
        d.light.intensity                 = 1.5 + pulse * 1.5;
        d.arch.material.emissiveIntensity = 0.5 + pulse * 0.5;
        if (camera && d.label) d.label.lookAt(camera.position);
      }
    }

    if (this._checkTimer >= CHECK_RATE) {
      this._checkTimer = 0;
      if (!this._active) {
        this._checkProximity();
      } else {
        this._checkStairProximity();
        this._checkDoorProximity();
      }
    }

    if (this._active && this._currentRoom) {
      const pos = window._partyManager?.getActiveCharacter()?.root?.position
               ?? this.player.root.position;

      this._currentRoom.checkActivation(pos);
      this._currentRoom.update(delta);

      for (const e of this._activeEnemies) {
        if (e && typeof e.isDead === 'function') e.update(delta);
      }

      if (this._activePlatform) this._activePlatform.update(delta);
      if (this._activePuzzle)   this._activePuzzle.update(delta);
    }
  }

  // ── Proximidad ────────────────────────────────────────────────────────────

  _checkProximity() {
    const pos = window._partyManager?.getActiveCharacter()?.root?.position
             ?? this.player.root.position;
    let nearest = null, minDist = Infinity;
    for (const d of this._portals) {
      const dx = pos.x - d.def.position.x;
      const dz = pos.z - d.def.position.z;
      const dist = Math.sqrt(dx*dx + dz*dz);
      if (dist < ENTER_RANGE && dist < minDist) { minDist = dist; nearest = d; }
    }
    if (nearest && nearest !== this._nearDungeon) {
      this._nearDungeon = nearest;
      this._enterBtn.style.display = 'flex';
      this._enterBtn.textContent = `⚔ Entrar — ${nearest.def.name}`;
    } else if (!nearest && this._nearDungeon) {
      this._nearDungeon = null;
      this._enterBtn.style.display = 'none';
    }
  }

  _checkStairProximity() {
    if (!this._stairPos || !this._stairReady) return;
    const pos = window._partyManager?.getActiveCharacter()?.root?.position
             ?? this.player.root.position;
    const dx = pos.x - this._stairPos.x;
    const dz = pos.z - this._stairPos.z;
    this._stairBtn.style.display =
      Math.sqrt(dx*dx + dz*dz) < 2.5 ? 'flex' : 'none';
  }

  _checkDoorProximity() {
    if (!this._currentRoom || !this._currentRoom.cleared) {
      this._doorBtn.style.display = 'none';
      return;
    }
    const pos = window._partyManager?.getActiveCharacter()?.root?.position
             ?? this.player.root.position;
    const connections = this._currentRoom.data.connections;
    let nearest = null, minDist = Infinity;
    for (const conn of connections) {
      const dx = pos.x - conn.center.x;
      const dz = pos.z - conn.center.z;
      const dist = Math.sqrt(dx*dx + dz*dz);
      if (dist < DOOR_RANGE * 3 && dist < minDist) {
        minDist = dist; nearest = conn;
      }
    }
    if (nearest) {
      this._doorBtn.style.display = 'flex';
      this._pendingNextRoom = nearest;
    } else {
      this._doorBtn.style.display = 'none';
      this._pendingNextRoom = null;
    }
  }

  // ── Entrar mazmorra ───────────────────────────────────────────────────────

  _enterDungeon() {
    if (!this._nearDungeon || this._active) return;
    this._active       = this._nearDungeon;
    this._currentLevel = 1;

    window._activeScene = window._dungeonScene;
    window._dungeonScene.fog = new THREE.FogExp2(0x0a0a12, 0.025);
    if (window._worldGroup) window._worldGroup.visible = false;

    this._enterBtn.style.display = 'none';
    this._exitBtn.style.display  = 'flex';
    this._etherEl.style.display  = 'block';
    this._updateLevelHUD();

    this._generateFloor(this._currentLevel);
    if (this.onEnter) this.onEnter(this._active.def);
  }

  // ── Generar piso — solo planifica, no construye ───────────────────────────

  _generateFloor(level) {
    this._destroyCurrentRoom();

    const gen    = new DungeonGenerator(this.scene, this._active.def, level);
    const result = gen.generate(
      this._active.def.position.x,
      this._active.def.position.z - 20
    );

    this._roomPlan     = result.rooms;
    this._stairPos     = null;
    this._stairReady   = false;
    this._stairBtn.style.display = 'none';
    this._doorBtn.style.display  = 'none';

    this._loadRoom(result.start, level);
  }

  // ── Cargar una sola sala ──────────────────────────────────────────────────

  _loadRoom(roomData, level) {
    this._destroyCurrentRoom();

    const dungeonScene = window._dungeonScene ?? this.scene;
    const room = new DungeonRoom(dungeonScene, roomData, this._active.def, level ?? this._currentLevel);

    room.setupCombat((position, lvl, mode) => {
      return this._spawnDungeonEnemy(position, lvl ?? this._currentLevel, mode);
    });

    if (roomData.type === 'platform') {
      room.setupPlatforms();
      this._activePlatform = new PlatformLevel(dungeonScene, {
        x: roomData.center.x, z: roomData.center.z,
      });
      this._activePlatform.activate();
      this._activePlatform.onComplete = () => {
        this.giveLevelReward(this._currentLevel);
        this._stairPos   = { x: roomData.center.x, z: roomData.center.z + 8 };
        this._stairReady = true;
        this._showFloating('¡Nivel superado! Baja las escaleras', '#44ff88');
      };
      this._activePlatform.onFail = () => this._showFloating('Intenta de nuevo', '#ff8888');
    }

    if (roomData.type === 'puzzle') {
      room.setupPuzzle();
      this._activePuzzle = new PuzzleLevel(dungeonScene, {
        x: roomData.center.x, z: roomData.center.z,
      });
      this._activePuzzle.activate();
      this._activePuzzle.onComplete = () => {
        this.giveLevelReward(this._currentLevel);
        this._stairPos   = { x: roomData.center.x, z: roomData.center.z + 8 };
        this._stairReady = true;
        this._showFloating('¡Acertijo resuelto! Baja las escaleras', '#aa88ff');
      };
      this._activePuzzle.onFail = () => this._showFloating('¡Demasiados errores!', '#ff4444');
      this._activePuzzle.onSpawnEnemy = (position, tier) => {
        return this._spawnDungeonEnemy(position, tier, 'puzzle');
      };
    }

    room.onClear((clearedRoom) => {
      if (clearedRoom.type === 'combat') {
        this.giveLevelReward(this._currentLevel);
        if (this._currentLevel < 8) {
          this._stairPos   = { x: clearedRoom.center.x, z: clearedRoom.center.z + 6 };
          this._stairReady = true;
          this._showFloating(`Piso ${this._currentLevel} limpio — sigue adelante`, '#C9A84C');
        }
      }
      if (clearedRoom.type === 'boss') {
        this.giveBossReward(this._active.def.id);
      }
    });

    this._currentRoom = room;

    // Teletransportar jugador al centro de la sala
    const cx = roomData.center.x;
const cz = roomData.center.z + 4;
if (this.player.root) this.player.root.position.set(cx, 0, cz);
if (window._companion?.root) window._companion.root.position.set(cx + 1, 0, cz);
if (window._thirdCam) {
  window._thirdCam._camera.position.set(cx, 8, cz + 12);
  window._thirdCam._camera.lookAt(cx, 0, cz);
}
  

  // ── Avanzar a sala siguiente ──────────────────────────────────────────────

  _enterNextRoom() {
    if (!this._pendingNextRoom) return;
    this._doorBtn.style.display = 'none';
    this._loadRoom(this._pendingNextRoom, this._currentLevel);
    this._pendingNextRoom = null;
  }

  // ── Destruir sala actual ──────────────────────────────────────────────────

  _destroyCurrentRoom() {
    if (this._currentRoom) {
      this._currentRoom.destroy();
      this._currentRoom = null;
    }
    if (this._activePlatform) { this._activePlatform.destroy(); this._activePlatform = null; }
    if (this._activePuzzle)   { this._activePuzzle.destroy();   this._activePuzzle   = null; }

    for (const e of this._activeEnemies) {
      if (e.mesh) (window._dungeonScene ?? this.scene).remove(e.mesh);
    }
    this._activeEnemies = [];
  }

  // ── Descender piso ────────────────────────────────────────────────────────

  _descend() {
    if (!this._stairReady) return;
    this._stairBtn.style.display = 'none';
    this._currentLevel = Math.min(this._currentLevel + 1, 8);
    this._updateLevelHUD();
    this._generateFloor(this._currentLevel);
    this._showFloating(`Piso ${this._currentLevel}`, '#C9A84C');
  }

  // ── Salir ─────────────────────────────────────────────────────────────────

  exitDungeon() {
    if (!this._active) return;
    this._destroyCurrentRoom();

    window._activeScene = window._worldScene;
    if (window._worldGroup) window._worldGroup.visible = true;
    window._worldScene.fog = new THREE.FogExp2(0x3A5A40, 0.014);

    const activeChar = window._partyManager?.getActiveCharacter() ?? this.player;
    if (activeChar.root) {
      activeChar.root.position.set(
        this._active.def.position.x, 0,
        this._active.def.position.z + 8
      );
    }

    this._exitBtn.style.display  = 'none';
    this._etherEl.style.display  = 'none';
    this._levelEl.style.display  = 'none';
    this._stairBtn.style.display = 'none';
    this._doorBtn.style.display  = 'none';
    this._active = null;
    this._roomPlan = [];

    if (this.onExit) this.onExit();
  }

  // ── Spawn enemigos ────────────────────────────────────────────────────────

  _spawnDungeonEnemy(position, level, mode) {
    const dungeonScene = window._dungeonScene ?? this.scene;
    let enemy;

    if (mode === 'puzzle') {
      const tier = Math.min(level, 3);
      if (tier <= 1)       enemy = new DungeonGuard(dungeonScene, position, this.player);
      else if (tier === 2) enemy = new RuneWarden(dungeonScene, position, this.player);
      else                 enemy = new AncientSentinel(dungeonScene, position, this.player);
    } else {
      const roll = Math.random();
      if (level <= 3) {
        enemy = new DungeonGuard(dungeonScene, position, this.player);
      } else if (level <= 5) {
        enemy = roll < 0.5
          ? new DungeonGuard(dungeonScene, position, this.player)
          : new RuneWarden(dungeonScene, position, this.player);
      } else {
        if (roll < 0.3)       enemy = new DungeonGuard(dungeonScene, position, this.player);
        else if (roll < 0.65) enemy = new RuneWarden(dungeonScene, position, this.player);
        else                  enemy = new AncientSentinel(dungeonScene, position, this.player);
      }
    }

    if (enemy) {
      this._activeEnemies.push(enemy);
      window._combat?.registerEnemy?.(enemy);
      enemy.onDeath = () => {
        window._prog?.addXP?.(window._combat?._weaponType ?? 'katana', 30 + level * 5);
      };
    }
    return enemy ?? null;
  }

  // ── Recompensas ───────────────────────────────────────────────────────────

  giveReward(reward) {
    if (reward.etherFragments) {
      this._etherFragments += reward.etherFragments;
      this._etherEl.textContent = `✦ ${this._etherFragments}`;
      this._flashEther();
    }
    if (reward.material && reward.amount)
      window._building?.addMaterial?.(reward.material, reward.amount);
    if (reward.xp)          window._prog?.addXP?.(window._combat?._weaponType ?? 'katana', reward.xp);
    if (reward.magicEnergy) window._prog?.addMagicEnergy?.(reward.magicEnergy);
    if (this.onReward) this.onReward(reward);
  }

  giveLevelReward(level) {
    const xp       = 20 + level * 10;
    const energy   = 5  + level * 3;
    const material = level >= 6 ? 'mineral' : level >= 4 ? 'hierro' : 'piedra';
    const amount   = 3  + level * 2;
    this.giveReward({ xp, magicEnergy: energy, material, amount });
    this._showFloating(`+${amount} ${material}  +${xp} XP`, '#C9A84C');
  }

  giveBossReward(dungeonId) {
    const def = DUNGEON_DEFS.find(d => d.id === dungeonId);
    if (!def) return;
    this.giveReward(def.reward);
    this._showFloating(`¡${def.name} conquistada! +${def.reward.etherFragments} ✦`, '#cc88ff');
    const portal = this._portals.find(p => p.def.id === dungeonId);
    if (portal) {
      portal.cleared = true;
      portal.portalMat.color.setHex(0x444444);
      portal.light.color.setHex(0x888888);
    }
  }

  getEtherFragments() { return this._etherFragments; }
  spendEther(amount) {
    if (this._etherFragments < amount) return false;
    this._etherFragments -= amount;
    this._etherEl.textContent = `✦ ${this._etherFragments}`;
    return true;
  }

  // ── HUD / VFX ─────────────────────────────────────────────────────────────

  _updateLevelHUD() {
    this._levelEl.style.display = 'block';
    this._levelEl.textContent   = `PISO ${this._currentLevel} / 8`;
  }

  _flashEther() {
    this._etherEl.style.color = '#ffffff';
    setTimeout(() => { this._etherEl.style.color = '#cc88ff'; }, 300);
  }

  _showFloating(text, color = '#C9A84C') {
    const el = document.createElement('div');
    Object.assign(el.style, {
      position: 'fixed', left: '50%', top: '30%',
      transform: 'translateX(-50%)',
      fontFamily: "'Cinzel',serif", fontSize: '14px',
      letterSpacing: '2px', color,
      textShadow: `0 0 12px ${color}`,
      pointerEvents: 'none', zIndex: '300',
      opacity: '1', transition: 'top 1s ease, opacity 1s ease',
      whiteSpace: 'nowrap',
    });
    el.textContent = text;
    document.body.appendChild(el);
    requestAnimationFrame(() => requestAnimationFrame(() => {
      el.style.top = '22%'; el.style.opacity = '0';
    }));
    setTimeout(() => el.remove(), 1100);
  }

  destroy() {
    this.exitDungeon();
    for (const d of this._portals) this.scene.remove(d.group);
    this._enterBtn.remove();
    this._exitBtn.remove();
    this._etherEl.remove();
    this._levelEl.remove();
    this._stairBtn.remove();
    this._doorBtn.remove();
  }
}
