// core/dungeons/DungeonManager.js — Ashes of the Reborn | Valiant Gaming
import * as THREE from 'three';

const DUNGEON_DEFS = [
  {
    id       : 'ruins',
    name     : 'Ruinas de Piedra',
    position : { x: 0,   z: -120 },
    color    : 0x8B7355,
    glowColor: 0xC9A84C,
    boss     : 'malachar',
    enemies  : ['dungeon_guard', 'rune_warden', 'ancient_sentinel'],
    reward   : { etherFragments: 30, material: 'hierro', amount: 20 },
  },
  {
    id       : 'crystal',
    name     : 'Caverna de Cristal',
    position : { x: -30, z: -160 },
    color    : 0x88ccff,
    glowColor: 0x44aaff,
    boss     : 'veyris',
    enemies  : ['dungeon_guard', 'rune_warden', 'ancient_sentinel'],
    reward   : { etherFragments: 50, material: 'mineral', amount: 15 },
  },
  {
    id       : 'fortress',
    name     : 'Fortaleza Oscura',
    position : { x: 30,  z: -200 },
    color    : 0x2a0a3a,
    glowColor: 0x9933ff,
    boss     : 'khazeron',
    enemies  : ['dungeon_guard', 'rune_warden', 'ancient_sentinel'],
    reward   : { etherFragments: 80, material: 'mineral', amount: 30 },
  },
];

const ENTER_RANGE  = 5;
const CHECK_RATE   = 0.4;

export class DungeonManager {
  constructor(scene, player) {
    this.scene    = scene;
    this.player   = player;
    this._dungeons = [];
    this._active   = null;
    this._checkTimer = 0;
    this._etherFragments = 0;

    this.onEnter  = null; // (dungeonDef)
    this.onExit   = null;
    this.onReward = null; // (reward)

    this._buildPortals();
    this._buildUI();
  }

  // ── Portales en el mundo ──────────────────────────────────────────────────

  _buildPortals() {
    for (const def of DUNGEON_DEFS) {
      const group = new THREE.Group();
      group.position.set(def.position.x, 0, def.position.z);

      // Base del portal
      const baseGeo = new THREE.CylinderGeometry(2.5, 2.8, 0.3, 16);
      const baseMat = new THREE.MeshStandardMaterial({
        color    : def.color,
        roughness: 0.6,
        metalness: 0.3,
      });
      const base = new THREE.Mesh(baseGeo, baseMat);
      base.position.y = 0.15;
      group.add(base);

      // Arco del portal
      const archGeo = new THREE.TorusGeometry(2.2, 0.22, 10, 32, Math.PI);
      const archMat = new THREE.MeshStandardMaterial({
        color    : def.glowColor,
        emissive : def.glowColor,
        emissiveIntensity: 0.8,
        roughness: 0.2,
        metalness: 0.6,
      });
      const arch = new THREE.Mesh(archGeo, archMat);
      arch.position.y = 2.2;
      arch.rotation.z = Math.PI;
      group.add(arch);

      // Interior del portal
      const portalGeo = new THREE.CircleGeometry(2.0, 32);
      const portalMat = new THREE.MeshBasicMaterial({
        color      : def.glowColor,
        transparent: true,
        opacity    : 0.3,
        side       : THREE.DoubleSide,
      });
      const portal = new THREE.Mesh(portalGeo, portalMat);
      portal.position.y = 2.2;
      portal.rotation.y = Math.PI / 2;
      group.add(portal);

      // Luz puntual
      const light = new THREE.PointLight(def.glowColor, 2, 12);
      light.position.y = 2;
      group.add(light);

      // Label flotante
      const label = this._makeLabel(def.name);
      group.add(label);

      this.scene.add(group);

      this._dungeons.push({
        def,
        group,
        arch,
        portal,
        portalMat,
        light,
        label,
        cleared  : false,
        _pulse   : Math.random() * Math.PI * 2,
      });
    }
  }

  _makeLabel(name) {
    const canvas  = document.createElement('canvas');
    canvas.width  = 256;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle    = 'rgba(0,0,0,0)';
    ctx.fillRect(0, 0, 256, 64);
    ctx.font         = 'bold 22px monospace';
    ctx.fillStyle    = '#C9A84C';
    ctx.textAlign    = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(name, 128, 32);

    const tex  = new THREE.CanvasTexture(canvas);
    const geo  = new THREE.PlaneGeometry(4, 1);
    const mat  = new THREE.MeshBasicMaterial({ map: tex, transparent: true, side: THREE.DoubleSide });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.y   = 5.2;
    mesh.rotation.y   = 0;
    mesh._billboard   = true;
    return mesh;
  }

  // ── UI de Fragmentos de Éter ──────────────────────────────────────────────

  _buildUI() {
    this._etherEl = document.createElement('div');
    Object.assign(this._etherEl.style, {
      position     : 'fixed',
      top          : '44px',
      right        : '8px',
      fontFamily   : 'monospace',
      fontSize     : '10px',
      color        : '#cc88ff',
      letterSpacing: '1px',
      pointerEvents: 'none',
      zIndex       : '120',
      display      : 'none',
      textShadow   : '0 0 8px #9933ff',
    });
    this._etherEl.textContent = '✦ 0';
    document.body.appendChild(this._etherEl);

    // Botón entrar
    this._enterBtn = document.createElement('button');
    Object.assign(this._enterBtn.style, {
      position      : 'fixed',
      bottom        : '200px',
      left          : '50%',
      transform     : 'translateX(-50%)',
      display       : 'none',
      alignItems    : 'center',
      justifyContent: 'center',
      fontFamily    : "'Cinzel',serif",
      fontSize      : '12px',
      letterSpacing : '2px',
      color         : '#C9A84C',
      background    : 'rgba(10,8,20,0.92)',
      border        : '1px solid rgba(201,168,76,0.5)',
      borderRadius  : '24px',
      padding       : '10px 28px',
      cursor        : 'pointer',
      pointerEvents : 'all',
      zIndex        : '150',
      whiteSpace    : 'nowrap',
    });
    this._enterBtn.textContent = '⚔ Entrar a la Mazmorra';
    this._enterBtn.addEventListener('click',      () => this._enterDungeon());
    this._enterBtn.addEventListener('touchstart', (e) => { e.preventDefault(); this._enterDungeon(); }, { passive: false });
    document.body.appendChild(this._enterBtn);
  }

  // ── Update ────────────────────────────────────────────────────────────────

  update(delta, camera) {
    this._checkTimer += delta;

    // Animar portales
    for (const d of this._dungeons) {
      d._pulse += delta * 1.8;
      const pulse = Math.sin(d._pulse) * 0.5 + 0.5;
      d.portalMat.opacity     = 0.2 + pulse * 0.25;
      d.light.intensity       = 1.5 + pulse * 1.5;
      d.arch.material.emissiveIntensity = 0.5 + pulse * 0.5;

      // Billboard label
      if (camera && d.label) {
        d.label.lookAt(camera.position);
      }
    }

    // Chequear proximidad
    if (this._checkTimer >= CHECK_RATE) {
      this._checkTimer = 0;
      this._checkProximity();
    }
  }

  _checkProximity() {
    const pos = window._partyManager?.getActiveCharacter()?.root?.position
              ?? this.player.root.position;

    let nearest = null;
    let minDist  = Infinity;

    for (const d of this._dungeons) {
      const dx   = pos.x - d.def.position.x;
      const dz   = pos.z - d.def.position.z;
      const dist = Math.sqrt(dx*dx + dz*dz);
      if (dist < ENTER_RANGE && dist < minDist) {
        minDist  = dist;
        nearest  = d;
      }
    }

    if (nearest && nearest !== this._nearDungeon) {
      this._nearDungeon = nearest;
      this._enterBtn.style.display = 'flex';
      this._enterBtn.textContent   = `⚔ Entrar — ${nearest.def.name}`;
    } else if (!nearest && this._nearDungeon) {
      this._nearDungeon = null;
      this._enterBtn.style.display = 'none';
    }
  }

  // ── Entrar / Salir ────────────────────────────────────────────────────────

  _enterDungeon() {
    if (!this._nearDungeon || this._active) return;
    this._active = this._nearDungeon;
    this._enterBtn.style.display = 'none';
    this._etherEl.style.display  = 'block';
    if (this.onEnter) this.onEnter(this._active.def);
  }

  exitDungeon() {
    if (!this._active) return;
    this._active = null;
    this._etherEl.style.display = 'none';
    if (this.onExit) this.onExit();
  }

  // ── Recompensas ───────────────────────────────────────────────────────────

  giveReward(reward) {
    if (reward.etherFragments) {
      this._etherFragments += reward.etherFragments;
      this._etherEl.textContent = `✦ ${this._etherFragments}`;
      this._flashEther();
    }
    if (reward.material && reward.amount) {
      window._building?.addMaterial?.(reward.material, reward.amount);
    }
    if (reward.xp) {
      window._prog?.addXP?.(window._combat?._weaponType ?? 'katana', reward.xp);
    }
    if (reward.magicEnergy) {
      window._prog?.addMagicEnergy?.(reward.magicEnergy);
    }
    if (this.onReward) this.onReward(reward);
  }

  giveLevelReward(level) {
    const xp       = 20 + level * 10;
    const energy   = 5  + level * 3;
    const material = level >= 6 ? 'mineral' : level >= 4 ? 'hierro' : 'piedra';
    const amount   = 3  + level * 2;
    this.giveReward({ xp, magicEnergy: energy, material, amount });
    this._showFloating(`Nivel ${level} completado — +${amount} ${material}`);
  }

  giveBossReward(dungeonId) {
    const def = DUNGEON_DEFS.find(d => d.id === dungeonId);
    if (!def) return;
    this.giveReward(def.reward);
    this._showFloating(`¡Jefe derrotado! +${def.reward.etherFragments} ✦`, '#cc88ff');
    if (this._active) {
      this._active.cleared = true;
      this._active.portalMat.color.setHex(0x444444);
      this._active.light.color.setHex(0x888888);
    }
  }

  getEtherFragments() { return this._etherFragments; }
  spendEther(amount) {
    if (this._etherFragments < amount) return false;
    this._etherFragments -= amount;
    this._etherEl.textContent = `✦ ${this._etherFragments}`;
    return true;
  }

  // ── VFX ──────────────────────────────────────────────────────────────────

  _flashEther() {
    this._etherEl.style.color = '#ffffff';
    setTimeout(() => { this._etherEl.style.color = '#cc88ff'; }, 300);
  }

  _showFloating(text, color = '#C9A84C') {
    const el = document.createElement('div');
    Object.assign(el.style, {
      position    : 'fixed',
      left        : '50%',
      top         : '30%',
      transform   : 'translateX(-50%)',
      fontFamily  : "'Cinzel',serif",
      fontSize    : '14px',
      letterSpacing: '2px',
      color,
      textShadow  : `0 0 12px ${color}`,
      pointerEvents: 'none',
      zIndex      : '300',
      opacity     : '1',
      transition  : 'top 1s ease, opacity 1s ease',
      whiteSpace  : 'nowrap',
    });
    el.textContent = text;
    document.body.appendChild(el);
    requestAnimationFrame(() => requestAnimationFrame(() => {
      el.style.top     = '22%';
      el.style.opacity = '0';
    }));
    setTimeout(() => el.remove(), 1100);
  }

  destroy() {
    for (const d of this._dungeons) this.scene.remove(d.group);
    this._enterBtn.remove();
    this._etherEl.remove();
  }
}
