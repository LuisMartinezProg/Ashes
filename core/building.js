/**
 * core/building.js — Sistema de construcción
 * USO desde game.html:
 *   import { BuildingSystem } from './core/building.js';
 *   const building = new BuildingSystem(scene, player);
 *   building.setProgression(progression);
 */

import * as THREE from 'three';
import { STRUCTURES, TOOLS } from '../data/structures.js';

export class BuildingSystem {
  constructor(scene, player) {
    this._scene      = scene;
    this._player     = player;
    this._prog       = null;
    this._inventory  = {};
    this._tool       = 'punos';
    this._built      = [];
    this._placing    = null;
    this._ghost      = null;
    this._townName   = null;

    this._initInventory();
    this._loadFromStorage();
  }

  setProgression(p) { this._prog = p; }
  setZone(zone)     { this._zone = zone; }

  // ─────────────────────────────────────────────
  // INVENTARIO
  // ─────────────────────────────────────────────
  _initInventory() {
    this._inventory = { madera: 0, piedra: 0, hierro: 0, mineral: 0 };
  }

  addMaterial(type, amount) {
    if (this._inventory[type] === undefined) return;
    this._inventory[type] += amount;
    this._saveToStorage();
    this._onInventoryChange?.();
  }

  getMaterial(type) { return this._inventory[type] || 0; }

  hasMaterials(cost) {
    return Object.entries(cost).every(([k, v]) => this._inventory[k] >= v);
  }

  consumeMaterials(cost) {
    if (!this.hasMaterials(cost)) return false;
    Object.entries(cost).forEach(([k, v]) => this._inventory[k] -= v);
    this._saveToStorage();
    return true;
  }

  // ─────────────────────────────────────────────
  // RECOLECCIÓN
  // ─────────────────────────────────────────────
  collect(resourceType) {
    const tool = TOOLS[this._tool];
    if (!tool.recolecta.includes(resourceType)) {
      console.log(`[Building] ${this._tool} no puede recolectar ${resourceType}`);
      return 0;
    }
    const amount = tool.multiplicador;
    this.addMaterial(resourceType, amount);
    // Sincronizar al InventoryUI
if (window._inventory) {
  window._inventory.addItem({
    id     : resourceType,
    name   : resourceType.charAt(0).toUpperCase() + resourceType.slice(1),
    icon   : { madera:'🪵', piedra:'🪨', hierro:'⚙️', mineral:'💎' }[resourceType] ?? '📦',
    section: 'materiales',
    rarity : 'comun',
    qty    : amount,
  });
}
    console.log(`[Building] +${amount} ${resourceType} (total: ${this._inventory[resourceType]})`);
    return amount;
  }

  setTool(toolId) {
    if (TOOLS[toolId]) this._tool = toolId;
  }

  craftTool(toolId) {
    const tool = TOOLS[toolId];
    if (!tool || !tool.cost) return false;
    if (!this.consumeMaterials(tool.cost)) return false;
    this.setTool(toolId);
    this._saveToStorage();
    return true;
  }

  // ─────────────────────────────────────────────
  // CONSTRUCCIÓN
  // ─────────────────────────────────────────────
  startPlacing(structureId, tier = 'madera') {
    const def = STRUCTURES[structureId];
    if (!def) return;
    if (!def.unlocked && !this._prog?.getFlag?.('blueprint_' + structureId)) return;

    const tierData = def.tiers[tier];
    if (!tierData) return;

    this._placing = { structureId, tier, def, tierData };
    this._showGhost(tierData.size, def);
  }

  _showGhost(size, def) {
    if (this._ghost) this._scene.remove(this._ghost);
    const geo = new THREE.BoxGeometry(...size);
    const mat = new THREE.MeshBasicMaterial({
      color: 0x44aaff,
      transparent: true,
      opacity: 0.4,
      wireframe: false,
    });
    this._ghost = new THREE.Mesh(geo, mat);
    this._ghost.name = 'build_ghost';
    this._scene.add(this._ghost);
  }

  updateGhostPosition() {
    if (!this._ghost || !this._placing) return;
    const pos = this._player.root.position.clone();
    pos.z -= 4;
    this._ghost.position.copy(pos);
    this._ghost.position.y = this._placing.tierData.size[1] / 2;
  }

  confirmPlace() {
    if (!this._placing || !this._ghost) return false;
    const { structureId, tier, def, tierData } = this._placing;

    if (!this.consumeMaterials(tierData.cost)) {
      console.warn('[Building] Materiales insuficientes');
      return false;
    }

    const data = { structureId, tier, def, tierData };
    this._placing = null;

    if (this._built.length === 0 && !this._townName) {
      this._requestTownName(() => this._placeStructure(
        data.structureId, data.tier, data.def, data.tierData
      ));
      return true;
    }

    this._placeStructure(data.structureId, data.tier, data.def, data.tierData);
    return true;
  }

  _placeStructure(structureId, tier, def, tierData) {
    const pos = this._ghost.position.clone();

    const geo = new THREE.BoxGeometry(...tierData.size);
    const mat = new THREE.MeshLambertMaterial({
      color: this._getTierColor(tier),
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.copy(pos);
    mesh.name = `structure_${structureId}_${Date.now()}`;
    mesh.castShadow    = false;
    mesh.receiveShadow = false;
    this._scene.add(mesh);

    const record = {
      id: structureId, tier,
      position: pos.toArray(),
      hp: tierData.hp, maxHp: tierData.hp,
      meshName: mesh.name,
    };
    this._built.push(record);
    this._saveToStorage();

    this._scene.remove(this._ghost);
    this._ghost.geometry.dispose();
    this._ghost.material.dispose();
    this._ghost   = null;
    this._placing = null;

    this._applyEffect(def.effect, mesh);

    console.log(`[Building] Construido: ${def.label} (${tier}) en`, pos);
    this._onBuildComplete?.(record);
  }

  cancelPlacing() {
    if (this._ghost) this._scene.remove(this._ghost);
    this._ghost   = null;
    this._placing = null;
  }

  isPlacing() { return this._placing !== null; }

  // ─────────────────────────────────────────────
  // EFECTOS
  // ─────────────────────────────────────────────
  _applyEffect(effect, mesh) {
    if (!effect) return;
    if (effect.type === 'regen') {
      const light = new THREE.PointLight(0xff6600, 1.5, effect.radius * 2);
      light.position.copy(mesh.position);
      light.position.y += 1;
      this._scene.add(light);
    }
  }

  // ─────────────────────────────────────────────
  // DAÑO A ESTRUCTURAS
  // ─────────────────────────────────────────────
  damageStructure(meshName, amount) {
    const record = this._built.find(b => b.meshName === meshName);
    if (!record) return;
    record.hp -= amount;
    if (record.hp <= 0) this._destroyStructure(record);
    this._saveToStorage();
  }

  _destroyStructure(record) {
    const mesh = this._scene.getObjectByName(record.meshName);
    if (mesh) this._scene.remove(mesh);
    this._built = this._built.filter(b => b.meshName !== record.meshName);
    this._saveToStorage();
    console.log(`[Building] Destruida: ${record.id}`);
  }

  // ─────────────────────────────────────────────
  // NOMBRE DEL PUEBLO
  // ─────────────────────────────────────────────
  _requestTownName(cb) {
    const overlay = document.createElement('div');
    Object.assign(overlay.style, {
      position: 'fixed', inset: '0',
      background: 'rgba(4,4,10,0.92)',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      zIndex: '900',
    });
    overlay.innerHTML = `
      <p style="font-family:'Cinzel',serif;font-size:11px;letter-spacing:4px;
         color:#8a6f2e;text-transform:uppercase;margin-bottom:12px;">
        Nombra tu pueblo
      </p>
      <input id="town-name-input" type="text" maxlength="24"
        placeholder="Nombre del pueblo..."
        style="background:rgba(201,168,76,0.06);border:1px solid rgba(201,168,76,0.3);
               border-radius:6px;padding:12px 18px;color:#e8dcc8;
               font-family:'Crimson Pro',Georgia,serif;font-size:18px;
               text-align:center;outline:none;width:260px;"/>
      <button id="town-name-confirm"
        style="margin-top:16px;font-family:'Cinzel',serif;font-size:11px;
               letter-spacing:3px;color:#c9a84c;background:transparent;
               border:1px solid rgba(201,168,76,0.4);padding:10px 28px;
               cursor:pointer;">
        CONFIRMAR
      </button>
    `;
    document.body.appendChild(overlay);

    const input = overlay.querySelector('#town-name-input');
    const btn   = overlay.querySelector('#town-name-confirm');
    input.focus();

    const confirm = () => {
      const name = input.value.trim() || 'Mi pueblo';
      this._townName = name;
      this._prog?.setFlag?.('town_name', name);
      this._saveToStorage();
      overlay.remove();
      cb?.();
    };

    btn.addEventListener('click', confirm);
    input.addEventListener('keydown', e => { if (e.key === 'Enter') confirm(); });
  }

  // ─────────────────────────────────────────────
  // HELPERS
  // ─────────────────────────────────────────────
  _getTierColor(tier) {
    return { madera: 0x8B6340, piedra: 0x888888, hierro: 0x8090a0, mineral: 0xb090ff }[tier] || 0xffffff;
  }

  getTownName()  { return this._townName; }
  getInventory() { return { ...this._inventory }; }
  getBuilt()     { return this._built; }
  getTool()      { return this._tool; }

  // ─────────────────────────────────────────────
  // PERSISTENCIA
  // ─────────────────────────────────────────────
  _saveToStorage() {
    try {
      const data = {
        inventory : this._inventory,
        tool      : this._tool,
        built     : this._built,
        townName  : this._townName,
      };
      localStorage.setItem('ashes_building', JSON.stringify(data));
    } catch(e) { console.warn('[Building] Error guardando:', e); }
  }

  _loadFromStorage() {
    try {
      const raw = localStorage.getItem('ashes_building');
      if (!raw) return;
      const data = JSON.parse(raw);
      if (data.inventory) this._inventory = data.inventory;
      if (data.tool)      this._tool      = data.tool;
      if (data.townName)  this._townName  = data.townName;
      if (data.built)     this._built     = data.built;
    } catch(e) { console.warn('[Building] Error cargando:', e); }
  }
}
