// core/branchMissions.js — Ashes of the Reborn | Valiant Gaming

/**
 * Cada rama tiene una misión con 3 objetivos:
 *   1. Daño total infligido con esa rama
 *   2. Enemigos eliminados con esa rama
 *   3. Jefe específico derrotado
 *
 * Al completar los 3, todas las habilidades de la rama se desbloquean.
 */

export const BRANCH_MISSIONS = {

  magic: {
    fire: {
      label   : 'Prueba del Fuego',
      icon    : '🔥',
      color   : '#ff4400',
      objectives: [
        { id: 'damage',   label: 'Infligir daño de fuego',     target: 5000,  unit: 'daño'    },
        { id: 'kills',    label: 'Eliminar enemigos con fuego', target: 30,    unit: 'enemigos' },
        { id: 'boss',     label: 'Derrotar al Señor de Ceniza', target: 1,    unit: 'jefe'    },
      ],
    },
    ice: {
      label   : 'Prueba del Hielo',
      icon    : '❄️',
      color   : '#88ccff',
      objectives: [
        { id: 'damage',   label: 'Infligir daño de hielo',      target: 4000,  unit: 'daño'    },
        { id: 'kills',    label: 'Congelar y eliminar enemigos', target: 25,    unit: 'enemigos' },
        { id: 'boss',     label: 'Derrotar al Coloso Glacial',   target: 1,    unit: 'jefe'    },
      ],
    },
    plant: {
      label   : 'Prueba de la Naturaleza',
      icon    : '🌿',
      color   : '#44cc44',
      objectives: [
        { id: 'damage',   label: 'Infligir daño de planta',     target: 3500,  unit: 'daño'    },
        { id: 'kills',    label: 'Eliminar con habilidades de planta', target: 20, unit: 'enemigos' },
        { id: 'boss',     label: 'Derrotar al Guardián del Bosque', target: 1, unit: 'jefe'    },
      ],
    },
    wind: {
      label   : 'Prueba del Viento',
      icon    : '🌪️',
      color   : '#aaeeff',
      objectives: [
        { id: 'damage',   label: 'Infligir daño de viento',     target: 4500,  unit: 'daño'    },
        { id: 'kills',    label: 'Eliminar con ráfagas',         target: 28,    unit: 'enemigos' },
        { id: 'boss',     label: 'Derrotar al Espíritu Ciclón',  target: 1,    unit: 'jefe'    },
      ],
    },
  },

  katana: {
    speed: {
      label   : 'Prueba de la Velocidad',
      icon    : '⚡',
      color   : '#e8c9a0',
      objectives: [
        { id: 'damage',   label: 'Infligir daño rápido',         target: 4000,  unit: 'daño'    },
        { id: 'kills',    label: 'Eliminar enemigos en menos de 3s', target: 20, unit: 'enemigos' },
        { id: 'boss',     label: 'Derrotar al Maestro del Rayo', target: 1,    unit: 'jefe'    },
      ],
    },
    shadow: {
      label   : 'Prueba de las Sombras',
      icon    : '🌑',
      color   : '#8855cc',
      objectives: [
        { id: 'damage',   label: 'Infligir daño sombrío',        target: 3500,  unit: 'daño'    },
        { id: 'kills',    label: 'Eliminar desde las sombras',   target: 18,    unit: 'enemigos' },
        { id: 'boss',     label: 'Derrotar al Espectro Oscuro',  target: 1,    unit: 'jefe'    },
      ],
    },
    storm: {
      label   : 'Prueba de la Tormenta',
      icon    : '⛈️',
      color   : '#6699ff',
      objectives: [
        { id: 'damage',   label: 'Infligir daño eléctrico',      target: 4500,  unit: 'daño'    },
        { id: 'kills',    label: 'Eliminar con tajos tormenta',  target: 25,    unit: 'enemigos' },
        { id: 'boss',     label: 'Derrotar al Titán Relámpago',  target: 1,    unit: 'jefe'    },
      ],
    },
    honor: {
      label   : 'Prueba del Honor',
      icon    : '⚔️',
      color   : '#ffdd88',
      objectives: [
        { id: 'damage',   label: 'Infligir daño honorable',      target: 5000,  unit: 'daño'    },
        { id: 'kills',    label: 'Eliminar sin recibir daño',    target: 15,    unit: 'enemigos' },
        { id: 'boss',     label: 'Derrotar al Guerrero Eterno',  target: 1,    unit: 'jefe'    },
      ],
    },
  },

  sword: {
    strength: {
      label   : 'Prueba de la Fuerza',
      icon    : '💪',
      color   : '#ffcc44',
      objectives: [
        { id: 'damage',   label: 'Infligir daño bruto',          target: 6000,  unit: 'daño'    },
        { id: 'kills',    label: 'Eliminar con golpes pesados',  target: 30,    unit: 'enemigos' },
        { id: 'boss',     label: 'Derrotar al Coloso de Piedra', target: 1,    unit: 'jefe'    },
      ],
    },
    defense: {
      label   : 'Prueba de la Defensa',
      icon    : '🛡️',
      color   : '#cccccc',
      objectives: [
        { id: 'damage',   label: 'Bloquear daño total',          target: 3000,  unit: 'daño'    },
        { id: 'kills',    label: 'Contraatacar y eliminar',      target: 20,    unit: 'enemigos' },
        { id: 'boss',     label: 'Derrotar al Señor Fortaleza',  target: 1,    unit: 'jefe'    },
      ],
    },
    battle: {
      label   : 'Prueba de la Batalla',
      icon    : '🔱',
      color   : '#ff6633',
      objectives: [
        { id: 'damage',   label: 'Infligir daño en combate grupal', target: 7000, unit: 'daño'  },
        { id: 'kills',    label: 'Eliminar en oleadas',           target: 35,    unit: 'enemigos' },
        { id: 'boss',     label: 'Derrotar al Comandante de Guerra', target: 1,  unit: 'jefe'   },
      ],
    },
    execution: {
      label   : 'Prueba de la Ejecución',
      icon    : '💀',
      color   : '#cc2222',
      objectives: [
        { id: 'damage',   label: 'Infligir daño letal',           target: 5000,  unit: 'daño'    },
        { id: 'kills',    label: 'Eliminar con golpe de gracia',  target: 25,    unit: 'enemigos' },
        { id: 'boss',     label: 'Derrotar al Verdugo Eterno',    target: 1,    unit: 'jefe'    },
      ],
    },
  },

  bow: {
    precision: {
      label   : 'Prueba de la Precisión',
      icon    : '🎯',
      color   : '#6dcc8a',
      objectives: [
        { id: 'damage',   label: 'Infligir daño a distancia',    target: 4000,  unit: 'daño'    },
        { id: 'kills',    label: 'Eliminar con tiro crítico',    target: 20,    unit: 'enemigos' },
        { id: 'boss',     label: 'Derrotar al Cazador Mayor',    target: 1,    unit: 'jefe'    },
      ],
    },
    poison: {
      label   : 'Prueba del Veneno',
      icon    : '☠️',
      color   : '#88cc44',
      objectives: [
        { id: 'damage',   label: 'Infligir daño de veneno',      target: 3500,  unit: 'daño'    },
        { id: 'kills',    label: 'Envenenar y eliminar',         target: 22,    unit: 'enemigos' },
        { id: 'boss',     label: 'Derrotar a la Araña Venenosa', target: 1,    unit: 'jefe'    },
      ],
    },
    rain: {
      label   : 'Prueba de la Lluvia',
      icon    : '🌧️',
      color   : '#4488ff',
      objectives: [
        { id: 'damage',   label: 'Infligir daño con lluvia de flechas', target: 6000, unit: 'daño' },
        { id: 'kills',    label: 'Eliminar múltiples enemigos a la vez', target: 30,  unit: 'enemigos' },
        { id: 'boss',     label: 'Derrotar al Señor de las Tormentas',  target: 1,   unit: 'jefe'  },
      ],
    },
    agility: {
      label   : 'Prueba de la Agilidad',
      icon    : '💨',
      color   : '#aaeeff',
      objectives: [
        { id: 'damage',   label: 'Infligir daño en movimiento',  target: 3000,  unit: 'daño'    },
        { id: 'kills',    label: 'Eliminar tras esquivar',       target: 18,    unit: 'enemigos' },
        { id: 'boss',     label: 'Derrotar al Espíritu Veloz',   target: 1,    unit: 'jefe'    },
      ],
    },
  },
};

// ─────────────────────────────────────────────────────────────────────────────

export class BranchMissionSystem {
  constructor(progression) {
    this._progression = progression;
    this._progress    = {};   // { 'magic.fire': { damage: 0, kills: 0, boss: 0 } }
    this._completed   = {};   // { 'magic.fire': true }

    this.onMissionComplete = null; // callback(weapon, subtypeId, missionDef)
    this.onObjectiveUpdate = null; // callback(weapon, subtypeId, objectiveId, current, target)
  }

  // ── Clave interna ─────────────────────────────────────────────────────────

  _key(weapon, subtypeId) { return `${weapon}.${subtypeId}`; }

  // ── Progreso ──────────────────────────────────────────────────────────────

  _getProgress(weapon, subtypeId) {
    const key = this._key(weapon, subtypeId);
    if (!this._progress[key]) {
      this._progress[key] = { damage: 0, kills: 0, boss: 0 };
    }
    return this._progress[key];
  }

  isCompleted(weapon, subtypeId) {
    return !!this._completed[this._key(weapon, subtypeId)];
  }

  getObjectiveProgress(weapon, subtypeId, objectiveId) {
    return this._getProgress(weapon, subtypeId)[objectiveId] ?? 0;
  }

  getMissionDef(weapon, subtypeId) {
    return BRANCH_MISSIONS[weapon]?.[subtypeId] ?? null;
  }

  // ── Registro de eventos desde el juego ───────────────────────────────────

  /**
   * Llamar cuando el jugador inflige daño con una rama activa.
   * weapon: 'magic' | 'katana' | 'sword' | 'bow'
   * subtypeId: 'fire' | 'speed' | etc.
   * amount: número de daño
   */
  registerDamage(weapon, subtypeId, amount) {
    if (this.isCompleted(weapon, subtypeId)) return;
    const prog = this._getProgress(weapon, subtypeId);
    prog.damage += amount;
    this._checkObjective(weapon, subtypeId, 'damage');
  }

  /**
   * Llamar cuando el jugador elimina un enemigo con una rama activa.
   */
  registerKill(weapon, subtypeId) {
    if (this.isCompleted(weapon, subtypeId)) return;
    const prog = this._getProgress(weapon, subtypeId);
    prog.kills += 1;
    this._checkObjective(weapon, subtypeId, 'kills');
  }

  /**
   * Llamar cuando el jugador derrota al jefe de esa rama.
   * bossId debe coincidir con el label del objetivo (o usar la clave de rama directamente).
   */
  registerBossKill(weapon, subtypeId) {
    if (this.isCompleted(weapon, subtypeId)) return;
    const prog = this._getProgress(weapon, subtypeId);
    prog.boss = 1;
    this._checkObjective(weapon, subtypeId, 'boss');
  }

  // ── Verificación ──────────────────────────────────────────────────────────

  _checkObjective(weapon, subtypeId, objectiveId) {
    const mission = this.getMissionDef(weapon, subtypeId);
    if (!mission) return;

    const prog = this._getProgress(weapon, subtypeId);
    const obj  = mission.objectives.find(o => o.id === objectiveId);
    if (!obj) return;

    const current = prog[objectiveId];
    if (this.onObjectiveUpdate) {
      this.onObjectiveUpdate(weapon, subtypeId, objectiveId, Math.min(current, obj.target), obj.target);
    }

    // ¿Todos los objetivos completados?
    const allDone = mission.objectives.every(o => (prog[o.id] ?? 0) >= o.target);
    if (allDone) {
      this._completeMission(weapon, subtypeId, mission);
    }
  }

  _completeMission(weapon, subtypeId, mission) {
    const key = this._key(weapon, subtypeId);
    if (this._completed[key]) return;
    this._completed[key] = true;

    // Desbloquear todas las habilidades de la rama en progression
    this._progression.passTrialForSkill(`${weapon}.${subtypeId}`); // marca global
    const subtype = require('../core/skillData.js').SKILL_DATA[weapon]?.subtypes[subtypeId];
    if (subtype) {
      subtype.skills.forEach(skill => {
        this._progression.passTrialForSkill(skill.id);
      });
    }

    if (this.onMissionComplete) {
      this.onMissionComplete(weapon, subtypeId, mission);
    }

    this._showCompletionNotification(mission);
  }

  // ── Notificación en juego ─────────────────────────────────────────────────

  _showCompletionNotification(mission) {
    const el = document.createElement('div');
    Object.assign(el.style, {
      position     : 'fixed',
      top          : '18%',
      left         : '50%',
      transform    : 'translateX(-50%) scale(0.85)',
      fontFamily   : "'Cinzel', serif",
      textAlign    : 'center',
      background   : 'rgba(4,4,12,0.97)',
      border       : `1px solid ${mission.color}66`,
      borderRadius : '10px',
      padding      : '18px 32px',
      zIndex       : '700',
      pointerEvents: 'none',
      boxShadow    : `0 0 40px ${mission.color}33`,
      transition   : 'transform 0.35s ease, opacity 0.35s ease',
      opacity      : '0',
    });

    el.innerHTML = `
      <div style="font-size:32px;margin-bottom:8px;">${mission.icon}</div>
      <div style="color:${mission.color};font-size:11px;letter-spacing:4px;margin-bottom:4px;">
        MISIÓN COMPLETADA
      </div>
      <div style="color:#fff;font-size:13px;letter-spacing:2px;margin-bottom:10px;">
        ${mission.label}
      </div>
      <div style="color:#888;font-size:9px;letter-spacing:2px;">
        ✦ TODAS LAS HABILIDADES DE LA RAMA DESBLOQUEADAS
      </div>
    `;

    document.body.appendChild(el);

    // Animación entrada
    requestAnimationFrame(() => {
      el.style.opacity   = '1';
      el.style.transform = 'translateX(-50%) scale(1)';
    });

    // Salida
    setTimeout(() => {
      el.style.opacity   = '0';
      el.style.transform = 'translateX(-50%) scale(0.9)';
      setTimeout(() => el.remove(), 500);
    }, 4000);
  }

  // ── Serialización ─────────────────────────────────────────────────────────

  serialize() {
    return {
      progress : this._progress,
      completed: this._completed,
    };
  }

  load(data) {
    if (!data) return;
    if (data.progress)  this._progress  = data.progress;
    if (data.completed) this._completed = data.completed;
  }
}
