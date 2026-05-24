// core/partyManager.js — Cambio de personaje + reacciones | Ashes of the Reborn | Valiant Gaming
import * as THREE from 'three';
import { ReactionEngine, SUBTYPE_ELEMENT } from './reactions.js';

const SWITCH_COOLDOWN = 1.5;

export class PartyManager {
  constructor(scene, player, companion) {
    this.scene     = scene;
    this.player    = player;
    this.companion = companion;
    this.reactions = new ReactionEngine(scene);

    this._activeIdx   = 0;
    this._switchTimer = 0;
    this._enemies     = [];
    this._skillSystems = [null, null];

    this.onSwitch   = null;
    this.onReaction = null;

    this.companion.onSkillCast = (skillId, subtype) => {
      this._onSkillLaunched(subtype, this._enemies);
    };
  }

  setSkillSystems(playerSkillSystem, companionSkillSystem) {
    this._skillSystems[0] = playerSkillSystem;
    this._skillSystems[1] = companionSkillSystem;

    const origCast = playerSkillSystem.castSkill.bind(playerSkillSystem);
    playerSkillSystem.castSkill = (skillId) => {
      const result = origCast(skillId);
      if (result) {
        const subtype = this._getSubtypeFromSkill(skillId);
        if (subtype) this._onSkillLaunched(subtype, this._enemies);
      }
      return result;
    };
  }

  registerEnemies(list) {
    this._enemies = list;
    this.companion.registerEnemies(list);
    this.reactions._enemies = list;
  }

  canSwitch()      { return this._switchTimer <= 0; }
  getActiveIdx()   { return this._activeIdx; }
  getActiveCharacter() {
    return this._activeIdx === 0 ? this.player : this.companion;
  }

  switchCharacter() {
    if (!this.canSwitch()) return false;

    this._activeIdx   = this._activeIdx === 0 ? 1 : 0;
    this._switchTimer = SWITCH_COOLDOWN;

    if (this._activeIdx === 0) {
      // Volver al protagonista
      this.companion.deactivate();
      this.companion.root.visible = false;
      this.player.root.position.copy(this.companion.root.position); // protagonista aparece donde estaba Mika
      this.player.root.visible = true;
    } else {
      // Cambiar a Mika
      this.companion.root.position.copy(this.player.root.position);
      this.companion.activate();
      this.companion.root.visible = true;
      this.player.root.visible    = false;
    }

    window._thirdCam?.setTarget(this.getActiveCharacter());
    if (this.onSwitch) this.onSwitch(this._activeIdx);
    this._spawnSwitchVFX();
    return true;
  }

  

  update(delta, joystickInput, camera) {
    if (this._switchTimer > 0) {
      this._switchTimer -= delta;
      if (this._switchTimer < 0) this._switchTimer = 0;
    }

    // Solo actualiza el personaje activo — el inactivo no corre nada
    try {
      if (this._activeIdx === 0) {
        this.player.update(delta, joystickInput, camera);
      } else {
        this.companion.update(delta, joystickInput, camera);
      }
    } catch (err) {
      console.warn('[PartyManager] Error en update:', err);
    }

    this.reactions.update(delta);
  }

  _onSkillLaunched(subtype, enemies) {
    const element = SUBTYPE_ELEMENT[subtype] ?? subtype;
    const activeChar = this.getActiveCharacter();

    for (const e of enemies) {
      if (!e || e.isDead?.() || !e.mesh) continue;
      const dx   = activeChar.position.x - e.mesh.position.x;
      const dz   = activeChar.position.z - e.mesh.position.z;
      const dist = Math.sqrt(dx * dx + dz * dz);
      if (dist > 15) continue;

      const reaction = this.reactions.applyElement(e, element);
      if (reaction && this.onReaction) this.onReaction(reaction);
    }
  }

  _getSubtypeFromSkill(skillId) {
    const map = {
      fireball: 'fire', fire_burst: 'fire', fire_pillar: 'fire', inferno: 'fire',
      ice_shard: 'ice', ice_spike: 'ice', blizzard: 'ice', absolute_zero: 'ice',
      thorn: 'plant', vine_whip: 'plant', spore_cloud: 'plant', world_tree: 'plant',
      gust: 'wind', wind_blade: 'wind', tornado: 'wind', storm_god: 'wind',
      quick_slash: 'speed', flash_step: 'speed', blade_dance: 'speed', thousand_cuts: 'speed',
      shadow_slash: 'shadow', nightfall: 'shadow', void_step: 'shadow', shadow_realm: 'shadow',
      thunder_slash: 'storm', static_field: 'storm', thunder_storm: 'storm', god_of_thunder: 'storm',
      last_stand: 'honor', martyr: 'honor', sacred_blade: 'honor', legendary_stand: 'honor',
      cleave: 'strength', shockwave: 'strength', titan_strike: 'strength', earth_shatter: 'strength',
      shield_bash: 'defense', fortify: 'defense', iron_wall: 'defense', aegis: 'defense',
      war_cry: 'battle', rally: 'battle', berserker_rage: 'battle', warlord: 'battle',
      execute: 'execution', decapitate: 'execution', guillotine: 'execution', death_blow: 'execution',
      piercing_shot: 'precision', snipe: 'precision', bullseye: 'precision', divine_arrow: 'precision',
      poison_arrow: 'poison', plague_shot: 'poison', toxic_cloud: 'poison', death_plague: 'poison',
      rain_of_arrows: 'rain', storm_volley: 'rain', arrow_storm: 'rain', sky_collapse: 'rain',
      back_step: 'agility', roll_shot: 'agility', phantom_step: 'agility', void_dance: 'agility',
    };
    return map[skillId] ?? null;
  }

  _spawnSwitchVFX() {
    const activeChar = this.getActiveCharacter();
    const pos   = activeChar.position.clone();
    const color = this._activeIdx === 0 ? 0x88aaff : 0xff88aa;

    [0.3, 0.7, 1.2].forEach((r, i) => {
      const geo  = new THREE.RingGeometry(r - 0.07, r, 12);
      const mat  = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.7, side: THREE.DoubleSide });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.copy(pos).add(new THREE.Vector3(0, 0.05, 0));
      mesh.rotation.x = -Math.PI / 2;
      this.scene.add(mesh);

      const start = performance.now();
      const dur   = 500 - i * 60;
      const animate = () => {
        const t = Math.max(0, 1 - (performance.now() - start) / dur);
        mesh.scale.setScalar(1 + (1 - t) * 1.5);
        mesh.material.opacity = t * 0.7;
        if (t > 0) requestAnimationFrame(animate);
        else { this.scene.remove(mesh); geo.dispose(); mat.dispose(); }
      };
      requestAnimationFrame(animate);
    });
  }
}
