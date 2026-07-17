// core/skillData.js — Ashes of the Reborn | Valiant Gaming
//
// Estructura: cada arma tiene 4 ramas. Cada rama tiene 9 skills en 3 tiers.
//   Tier 1 (skills 1-3) y Tier 2 (skills 4-6): desbloqueo temprano por XP de arma.
//   Tier 3 (skills 7-9): desbloqueo escalonado —
//     skill 7: requiere nivel de arma máximo (20)
//     skill 8: requiere nivel máximo + completar una mazmorra específica (pendiente definir cuál)
//     skill 9: requiere nivel máximo + completar esa mazmorra N veces (pendiente definir cuántas)
//
// unlockType: 'xp' (tiers 1-2) | 'level_cap' | 'level_cap+dungeon' | 'level_cap+dungeon_repeat'
// Los campos dungeonId/timesRequired quedan null hasta definir el contenido de mazmorras.

const MAX_WEAPON_LEVEL = 20; // mismo tope que WEAPON_LEVEL_XP en progression.js

// ── Plantilla de una rama vacía (esqueleto) ────────────────────────────────
function _emptyBranch(label, icon, color) {
  return {
    label, icon, color,
    skills: [
      // Tier 1 — desbloqueo temprano por XP
      { id: null, tier: 1, name: null, icon: null, desc: null, limitante: null,
        effect: null, unlockType: 'xp', cost: { xp: 50,  cristales: 1 } },
      { id: null, tier: 1, name: null, icon: null, desc: null, limitante: null,
        effect: null, unlockType: 'xp', cost: { xp: 100, cristales: 2 } },
      { id: null, tier: 1, name: null, icon: null, desc: null, limitante: null,
        effect: null, unlockType: 'xp', cost: { xp: 150, cristales: 2 } },

      // Tier 2 — desbloqueo temprano por XP (más caro)
      { id: null, tier: 2, name: null, icon: null, desc: null, limitante: null,
        effect: null, unlockType: 'xp', cost: { xp: 250, cristales: 3 } },
      { id: null, tier: 2, name: null, icon: null, desc: null, limitante: null,
        effect: null, unlockType: 'xp', cost: { xp: 350, cristales: 4 } },
      { id: null, tier: 2, name: null, icon: null, desc: null, limitante: null,
        effect: null, unlockType: 'xp', cost: { xp: 450, cristales: 4 } },

      // Tier 3 — las 3 más fuertes, desbloqueo escalonado
      { id: null, tier: 3, name: null, icon: null, desc: null, limitante: null,
        effect: null, unlockType: 'level_cap',
        cost: { levelRequired: MAX_WEAPON_LEVEL } },
      { id: null, tier: 3, name: null, icon: null, desc: null, limitante: null,
        effect: null, unlockType: 'level_cap+dungeon',
        cost: { levelRequired: MAX_WEAPON_LEVEL, dungeonId: null, timesRequired: 1 } },
      { id: null, tier: 3, name: null, icon: null, desc: null, limitante: null,
        effect: null, unlockType: 'level_cap+dungeon_repeat',
        cost: { levelRequired: MAX_WEAPON_LEVEL, dungeonId: null, timesRequired: null } },
    ],
  };
}

// ── Árbol por arma: 4 ramas cada una ───────────────────────────────────────
export const WEAPON_SKILL_TREES = {
katana: {
    label: 'Katana',
    icon : '🗡️',
    branches: {
      velocidad: {
        label: 'Velocidad', icon: '💨', color: '#6dcc8a',
        skills: [
          { id: 'katana_vel_1', tier: 1, name: 'Corte Rápido I',      icon: '💨', desc: 'Tajo veloz básico, ideal para combos iniciales.', limitante: 'Daño bajo', effect: 'quick_slash', unlockType: 'xp', cost: { xp: 50,  cristales: 1 } },
          { id: 'katana_vel_2', tier: 1, name: 'Corte Rápido II',     icon: '💨', desc: 'Versión afinada del corte rápido, más daño.',      limitante: 'Daño moderado', effect: 'quick_slash', unlockType: 'xp', cost: { xp: 100, cristales: 2 } },
          { id: 'katana_vel_3', tier: 1, name: 'Paso Fantasma I',     icon: '⚡', desc: 'Dash con corte que atraviesa al enemigo.',        limitante: 'Recarga corta', effect: 'flash_step', unlockType: 'xp', cost: { xp: 150, cristales: 2 } },
          { id: 'katana_vel_4', tier: 2, name: 'Paso Fantasma II',    icon: '⚡', desc: 'Dash mejorado, mayor alcance.',                   limitante: 'Recarga corta', effect: 'flash_step', unlockType: 'xp', cost: { xp: 250, cristales: 3 } },
          { id: 'katana_vel_5', tier: 2, name: 'Danza de Cuchillas I',icon: '🌀', desc: 'Serie de cortes giratorios en área.',             limitante: 'Vulnerable al girar', effect: 'blade_dance', unlockType: 'xp', cost: { xp: 350, cristales: 4 } },
          { id: 'katana_vel_6', tier: 2, name: 'Danza de Cuchillas II',icon: '🌀', desc: 'Danza mejorada, más golpes por giro.',           limitante: 'Vulnerable al girar', effect: 'blade_dance', unlockType: 'xp', cost: { xp: 450, cristales: 4 } },
          { id: 'katana_vel_7', tier: 3, name: 'Mil Cortes',          icon: '🌪️', desc: 'Ráfaga masiva de cortes casi instantáneos.',       limitante: 'Alto consumo de energía', effect: 'thousand_cuts', unlockType: 'level_cap', cost: { levelRequired: MAX_WEAPON_LEVEL } },
          { id: 'katana_vel_8', tier: 3, name: 'Mil Cortes: Furia',   icon: '🌪️', desc: 'Versión desatada, más cortes por uso.',           limitante: 'Requiere maestría probada', effect: 'thousand_cuts', unlockType: 'level_cap+dungeon', cost: { levelRequired: MAX_WEAPON_LEVEL, dungeonId: null, timesRequired: 1 } },
          { id: 'katana_vel_9', tier: 3, name: 'Mil Cortes: Trascendencia', icon: '🌪️', desc: 'La forma definitiva de la velocidad.',      limitante: 'Solo para maestros', effect: 'thousand_cuts', unlockType: 'level_cap+dungeon_repeat', cost: { levelRequired: MAX_WEAPON_LEVEL, dungeonId: null, timesRequired: null } },
        ],
      },
      sombra: {
        label: 'Sombra', icon: '🌑', color: '#8844cc',
        skills: [
          { id: 'katana_som_1', tier: 1, name: 'Tajo Sombrío I',      icon: '🌑', desc: 'Corte imbuido en sombra, daño oculto.',           limitante: 'Daño bajo', effect: 'shadow_slash', unlockType: 'xp', cost: { xp: 50,  cristales: 1 } },
          { id: 'katana_som_2', tier: 1, name: 'Tajo Sombrío II',     icon: '🌑', desc: 'Versión afinada, mayor penetración.',             limitante: 'Daño moderado', effect: 'shadow_slash', unlockType: 'xp', cost: { xp: 100, cristales: 2 } },
          { id: 'katana_som_3', tier: 1, name: 'Caída Nocturna I',    icon: '🌌', desc: 'Invoca oscuridad que debilita al enemigo.',        limitante: 'Área pequeña', effect: 'nightfall', unlockType: 'xp', cost: { xp: 150, cristales: 2 } },
          { id: 'katana_som_4', tier: 2, name: 'Caída Nocturna II',   icon: '🌌', desc: 'Oscuridad más amplia y duradera.',                limitante: 'Área pequeña', effect: 'nightfall', unlockType: 'xp', cost: { xp: 250, cristales: 3 } },
          { id: 'katana_som_5', tier: 2, name: 'Paso del Vacío I',    icon: '🕳️', desc: 'Se funde con las sombras brevemente.',            limitante: 'Ventana corta', effect: 'void_step', unlockType: 'xp', cost: { xp: 350, cristales: 4 } },
          { id: 'katana_som_6', tier: 2, name: 'Paso del Vacío II',   icon: '🕳️', desc: 'Mayor duración en el vacío.',                     limitante: 'Ventana corta', effect: 'void_step', unlockType: 'xp', cost: { xp: 450, cristales: 4 } },
          { id: 'katana_som_7', tier: 3, name: 'Reino de Sombras',    icon: '🌑', desc: 'Arrastra al enemigo a un reino de oscuridad total.', limitante: 'Un uso por combate', effect: 'shadow_realm', unlockType: 'level_cap', cost: { levelRequired: MAX_WEAPON_LEVEL } },
          { id: 'katana_som_8', tier: 3, name: 'Reino de Sombras: Abismo', icon: '🌑', desc: 'El reino se vuelve inescapable.',            limitante: 'Requiere maestría probada', effect: 'shadow_realm', unlockType: 'level_cap+dungeon', cost: { levelRequired: MAX_WEAPON_LEVEL, dungeonId: null, timesRequired: 1 } },
          { id: 'katana_som_9', tier: 3, name: 'Reino de Sombras: Eterno', icon: '🌑', desc: 'La sombra definitiva, sin escape posible.',   limitante: 'Solo para maestros', effect: 'shadow_realm', unlockType: 'level_cap+dungeon_repeat', cost: { levelRequired: MAX_WEAPON_LEVEL, dungeonId: null, timesRequired: null } },
        ],
      },
      tormenta: {
        label: 'Tormenta', icon: '⚡', color: '#4488ff',
        skills: [
          { id: 'katana_tor_1', tier: 1, name: 'Tajo de Trueno I',    icon: '⚡', desc: 'Corte cargado de electricidad.',                  limitante: 'Daño bajo', effect: 'thunder_slash', unlockType: 'xp', cost: { xp: 50,  cristales: 1 } },
          { id: 'katana_tor_2', tier: 1, name: 'Tajo de Trueno II',   icon: '⚡', desc: 'Descarga más potente al impactar.',               limitante: 'Daño moderado', effect: 'thunder_slash', unlockType: 'xp', cost: { xp: 100, cristales: 2 } },
          { id: 'katana_tor_3', tier: 1, name: 'Campo Estático I',    icon: '🔌', desc: 'Genera un campo que ralentiza enemigos.',         limitante: 'Radio pequeño', effect: 'static_field', unlockType: 'xp', cost: { xp: 150, cristales: 2 } },
          { id: 'katana_tor_4', tier: 2, name: 'Campo Estático II',   icon: '🔌', desc: 'Campo más amplio y duradero.',                    limitante: 'Radio pequeño', effect: 'static_field', unlockType: 'xp', cost: { xp: 250, cristales: 3 } },
          { id: 'katana_tor_5', tier: 2, name: 'Tormenta de Truenos I', icon: '⛈️', desc: 'Invoca rayos sobre el área de combate.',         limitante: 'Recarga larga', effect: 'thunder_storm', unlockType: 'xp', cost: { xp: 350, cristales: 4 } },
          { id: 'katana_tor_6', tier: 2, name: 'Tormenta de Truenos II', icon: '⛈️', desc: 'Más rayos, mayor cobertura.',                  limitante: 'Recarga larga', effect: 'thunder_storm', unlockType: 'xp', cost: { xp: 450, cristales: 4 } },
          { id: 'katana_tor_7', tier: 3, name: 'Dios del Trueno',     icon: '🌩️', desc: 'Se convierte en un canal de tormenta pura.',       limitante: 'Alto consumo de energía', effect: 'god_of_thunder', unlockType: 'level_cap', cost: { levelRequired: MAX_WEAPON_LEVEL } },
          { id: 'katana_tor_8', tier: 3, name: 'Dios del Trueno: Furia', icon: '🌩️', desc: 'La tormenta se intensifica sin control.',       limitante: 'Requiere maestría probada', effect: 'god_of_thunder', unlockType: 'level_cap+dungeon', cost: { levelRequired: MAX_WEAPON_LEVEL, dungeonId: null, timesRequired: 1 } },
          { id: 'katana_tor_9', tier: 3, name: 'Dios del Trueno: Absoluto', icon: '🌩️', desc: 'La forma definitiva de la tormenta.',        limitante: 'Solo para maestros', effect: 'god_of_thunder', unlockType: 'level_cap+dungeon_repeat', cost: { levelRequired: MAX_WEAPON_LEVEL, dungeonId: null, timesRequired: null } },
        ],
      },
      honor: {
        label: 'Honor', icon: '⚜️', color: '#e8c9a0',
        skills: [
          { id: 'katana_hon_1', tier: 1, name: 'Última Resistencia I', icon: '🛡️', desc: 'Resiste con honor un golpe crítico.',            limitante: 'Un uso por combate', effect: 'last_stand', unlockType: 'xp', cost: { xp: 50,  cristales: 1 } },
          { id: 'katana_hon_2', tier: 1, name: 'Última Resistencia II', icon: '🛡️', desc: 'Resistencia más efectiva.',                     limitante: 'Un uso por combate', effect: 'last_stand', unlockType: 'xp', cost: { xp: 100, cristales: 2 } },
          { id: 'katana_hon_3', tier: 1, name: 'Mártir I',              icon: '❤️', desc: 'Sacrifica vida propia por daño devastador.',      limitante: 'Consume HP', effect: 'martyr', unlockType: 'xp', cost: { xp: 150, cristales: 2 } },
          { id: 'katana_hon_4', tier: 2, name: 'Mártir II',             icon: '❤️', desc: 'Sacrificio más eficiente.',                       limitante: 'Consume HP', effect: 'martyr', unlockType: 'xp', cost: { xp: 250, cristales: 3 } },
          { id: 'katana_hon_5', tier: 2, name: 'Hoja Sagrada I',        icon: '⚜️', desc: 'Imbuye la katana con energía sagrada.',           limitante: 'Recarga media', effect: 'sacred_blade', unlockType: 'xp', cost: { xp: 350, cristales: 4 } },
          { id: 'katana_hon_6', tier: 2, name: 'Hoja Sagrada II',       icon: '⚜️', desc: 'Energía sagrada más intensa.',                    limitante: 'Recarga media', effect: 'sacred_blade', unlockType: 'xp', cost: { xp: 450, cristales: 4 } },
          { id: 'katana_hon_7', tier: 3, name: 'Resistencia Legendaria', icon: '👑', desc: 'El honor se vuelve leyenda viva.',               limitante: 'Un uso por batalla', effect: 'legendary_stand', unlockType: 'level_cap', cost: { levelRequired: MAX_WEAPON_LEVEL } },
          { id: 'katana_hon_8', tier: 3, name: 'Resistencia Legendaria: Gloria', icon: '👑', desc: 'La leyenda se hace gloria eterna.',      limitante: 'Requiere maestría probada', effect: 'legendary_stand', unlockType: 'level_cap+dungeon', cost: { levelRequired: MAX_WEAPON_LEVEL, dungeonId: null, timesRequired: 1 } },
          { id: 'katana_hon_9', tier: 3, name: 'Resistencia Legendaria: Inmortal', icon: '👑', desc: 'El honor definitivo, inquebrantable.',  limitante: 'Solo para maestros', effect: 'legendary_stand', unlockType: 'level_cap+dungeon_repeat', cost: { levelRequired: MAX_WEAPON_LEVEL, dungeonId: null, timesRequired: null } },
        ],
      },
    },
  },
  sword: {
    label: 'Espada',
    icon : '⚔️',
    branches: {
      fuerza: {
        label: 'Fuerza', icon: '💪', color: '#cc4444',
        skills: [
          { id: 'sword_fue_1', tier: 1, name: 'Tajo Brutal I',      icon: '💪', desc: 'Golpe de fuerza bruta con la espada.',            limitante: 'Daño bajo', effect: 'cleave', unlockType: 'xp', cost: { xp: 50,  cristales: 1 } },
          { id: 'sword_fue_2', tier: 1, name: 'Tajo Brutal II',     icon: '💪', desc: 'Golpe más contundente.',                          limitante: 'Daño moderado', effect: 'cleave', unlockType: 'xp', cost: { xp: 100, cristales: 2 } },
          { id: 'sword_fue_3', tier: 1, name: 'Corte Amplio I',     icon: '⚔️', desc: 'Barrido que golpea a varios enemigos a la vez.',  limitante: 'Alcance corto', effect: 'cleave', unlockType: 'xp', cost: { xp: 150, cristales: 2 } },
          { id: 'sword_fue_4', tier: 2, name: 'Corte Amplio II',    icon: '⚔️', desc: 'Barrido más amplio.',                             limitante: 'Alcance corto', effect: 'cleave', unlockType: 'xp', cost: { xp: 250, cristales: 3 } },
          { id: 'sword_fue_5', tier: 2, name: 'Golpe Devastador I', icon: '💥', desc: 'Ataque cargado de máxima potencia.',              limitante: 'Tiempo de carga', effect: 'cleave', unlockType: 'xp', cost: { xp: 350, cristales: 4 } },
          { id: 'sword_fue_6', tier: 2, name: 'Golpe Devastador II',icon: '💥', desc: 'Carga más rápida, más daño.',                    limitante: 'Tiempo de carga', effect: 'cleave', unlockType: 'xp', cost: { xp: 450, cristales: 4 } },
          { id: 'sword_fue_7', tier: 3, name: 'Furia Descomunal',   icon: '👹', desc: 'La fuerza bruta se desata sin límites.',          limitante: 'Alto consumo de energía', effect: 'cleave', unlockType: 'level_cap', cost: { levelRequired: MAX_WEAPON_LEVEL } },
          { id: 'sword_fue_8', tier: 3, name: 'Furia Descomunal: Ruina', icon: '👹', desc: 'La furia se vuelve destrucción pura.',        limitante: 'Requiere maestría probada', effect: 'cleave', unlockType: 'level_cap+dungeon', cost: { levelRequired: MAX_WEAPON_LEVEL, dungeonId: null, timesRequired: 1 } },
          { id: 'sword_fue_9', tier: 3, name: 'Furia Descomunal: Apocalipsis', icon: '👹', desc: 'La fuerza definitiva, nada la detiene.', limitante: 'Solo para maestros', effect: 'cleave', unlockType: 'level_cap+dungeon_repeat', cost: { levelRequired: MAX_WEAPON_LEVEL, dungeonId: null, timesRequired: null } },
        ],
      },
      defensa: {
        label: 'Defensa', icon: '🛡️', color: '#4488cc',
        skills: [
          { id: 'sword_def_1', tier: 1, name: 'Golpe de Escudo I',   icon: '🛡️', desc: 'Golpea con el escudo aturdiendo al enemigo.',     limitante: 'Aturdimiento corto', effect: 'shield_bash', unlockType: 'xp', cost: { xp: 50,  cristales: 1 } },
          { id: 'sword_def_2', tier: 1, name: 'Golpe de Escudo II',  icon: '🛡️', desc: 'Aturdimiento más largo.',                        limitante: 'Aturdimiento corto', effect: 'shield_bash', unlockType: 'xp', cost: { xp: 100, cristales: 2 } },
          { id: 'sword_def_3', tier: 1, name: 'Muro Personal I',     icon: '🧱', desc: 'Levanta el escudo para bloquear daño entrante.',  limitante: 'No puedes atacar mientras bloqueas', effect: 'shield_bash', unlockType: 'xp', cost: { xp: 150, cristales: 2 } },
          { id: 'sword_def_4', tier: 2, name: 'Muro Personal II',    icon: '🧱', desc: 'Bloqueo más eficiente.',                         limitante: 'No puedes atacar mientras bloqueas', effect: 'shield_bash', unlockType: 'xp', cost: { xp: 250, cristales: 3 } },
          { id: 'sword_def_5', tier: 2, name: 'Contragolpe I',       icon: '🔄', desc: 'Devuelve el golpe tras bloquear con el escudo.',   limitante: 'Ventana de tiempo corta', effect: 'shield_bash', unlockType: 'xp', cost: { xp: 350, cristales: 4 } },
          { id: 'sword_def_6', tier: 2, name: 'Contragolpe II',      icon: '🔄', desc: 'Ventana más amplia, más daño de retorno.',       limitante: 'Ventana de tiempo corta', effect: 'shield_bash', unlockType: 'xp', cost: { xp: 450, cristales: 4 } },
          { id: 'sword_def_7', tier: 3, name: 'Bastión Inquebrantable', icon: '🏰', desc: 'Se vuelve una fortaleza viviente por un instante.', limitante: 'Un uso por combate', effect: 'shield_bash', unlockType: 'level_cap', cost: { levelRequired: MAX_WEAPON_LEVEL } },
          { id: 'sword_def_8', tier: 3, name: 'Bastión Inquebrantable: Muralla', icon: '🏰', desc: 'La defensa se vuelve absoluta.',        limitante: 'Requiere maestría probada', effect: 'shield_bash', unlockType: 'level_cap+dungeon', cost: { levelRequired: MAX_WEAPON_LEVEL, dungeonId: null, timesRequired: 1 } },
          { id: 'sword_def_9', tier: 3, name: 'Bastión Inquebrantable: Eterno', icon: '🏰', desc: 'La defensa definitiva, nada la quiebra.', limitante: 'Solo para maestros', effect: 'shield_bash', unlockType: 'level_cap+dungeon_repeat', cost: { levelRequired: MAX_WEAPON_LEVEL, dungeonId: null, timesRequired: null } },
        ],
      },
      batalla: {
        label: 'Batalla', icon: '⚔️', color: '#ffcc44',
        skills: [
          { id: 'sword_bat_1', tier: 1, name: 'Grito de Guerra I',   icon: '📣', desc: 'Grito que aumenta el daño propio brevemente.',    limitante: 'Duración corta', effect: 'war_cry', unlockType: 'xp', cost: { xp: 50,  cristales: 1 } },
          { id: 'sword_bat_2', tier: 1, name: 'Grito de Guerra II',  icon: '📣', desc: 'Duración más larga, mayor bonus.',               limitante: 'Duración corta', effect: 'war_cry', unlockType: 'xp', cost: { xp: 100, cristales: 2 } },
          { id: 'sword_bat_3', tier: 1, name: 'Clamor de Batalla I', icon: '🔥', desc: 'El grito intimida y debilita a enemigos cercanos.', limitante: 'Radio pequeño', effect: 'war_cry', unlockType: 'xp', cost: { xp: 150, cristales: 2 } },
          { id: 'sword_bat_4', tier: 2, name: 'Clamor de Batalla II', icon: '🔥', desc: 'Radio más amplio.',                              limitante: 'Radio pequeño', effect: 'war_cry', unlockType: 'xp', cost: { xp: 250, cristales: 3 } },
          { id: 'sword_bat_5', tier: 2, name: 'Furia de Combate I',  icon: '⚡', desc: 'Entra en un estado de furia de batalla sostenida.', limitante: 'Consume energía con el tiempo', effect: 'war_cry', unlockType: 'xp', cost: { xp: 350, cristales: 4 } },
          { id: 'sword_bat_6', tier: 2, name: 'Furia de Combate II', icon: '⚡', desc: 'Furia más duradera.',                            limitante: 'Consume energía con el tiempo', effect: 'war_cry', unlockType: 'xp', cost: { xp: 450, cristales: 4 } },
          { id: 'sword_bat_7', tier: 3, name: 'Comandante de Guerra', icon: '🎖️', desc: 'Se convierte en el líder indiscutido del campo.', limitante: 'Alto consumo de energía', effect: 'war_cry', unlockType: 'level_cap', cost: { levelRequired: MAX_WEAPON_LEVEL } },
          { id: 'sword_bat_8', tier: 3, name: 'Comandante de Guerra: Legado', icon: '🎖️', desc: 'Su presencia inspira más allá del combate.', limitante: 'Requiere maestría probada', effect: 'war_cry', unlockType: 'level_cap+dungeon', cost: { levelRequired: MAX_WEAPON_LEVEL, dungeonId: null, timesRequired: 1 } },
          { id: 'sword_bat_9', tier: 3, name: 'Comandante de Guerra: Eterno', icon: '🎖️', desc: 'La batalla definitiva, un líder inmortal.', limitante: 'Solo para maestros', effect: 'war_cry', unlockType: 'level_cap+dungeon_repeat', cost: { levelRequired: MAX_WEAPON_LEVEL, dungeonId: null, timesRequired: null } },
        ],
      },
      ejecucion: {
        label: 'Ejecución', icon: '💀', color: '#8a1a1a',
        skills: [
          { id: 'sword_eje_1', tier: 1, name: 'Golpe de Gracia I',    icon: '💀', desc: 'Ataque letal contra enemigos debilitados.',       limitante: 'Solo efectivo con poca vida', effect: 'execute', unlockType: 'xp', cost: { xp: 50,  cristales: 1 } },
          { id: 'sword_eje_2', tier: 1, name: 'Golpe de Gracia II',   icon: '💀', desc: 'Umbral de ejecución más alto.',                  limitante: 'Solo efectivo con poca vida', effect: 'execute', unlockType: 'xp', cost: { xp: 100, cristales: 2 } },
          { id: 'sword_eje_3', tier: 1, name: 'Sentencia I',          icon: '⚖️', desc: 'Marca al enemigo para una muerte inevitable.',    limitante: 'Recarga media', effect: 'execute', unlockType: 'xp', cost: { xp: 150, cristales: 2 } },
          { id: 'sword_eje_4', tier: 2, name: 'Sentencia II',         icon: '⚖️', desc: 'Marca más letal.',                              limitante: 'Recarga media', effect: 'execute', unlockType: 'xp', cost: { xp: 250, cristales: 3 } },
          { id: 'sword_eje_5', tier: 2, name: 'Verdugo I',            icon: '🪓', desc: 'Cada golpe acerca al enemigo a su fin.',         limitante: 'Requiere golpes consecutivos', effect: 'execute', unlockType: 'xp', cost: { xp: 350, cristales: 4 } },
          { id: 'sword_eje_6', tier: 2, name: 'Verdugo II',           icon: '🪓', desc: 'Menos golpes necesarios para activar.',          limitante: 'Requiere golpes consecutivos', effect: 'execute', unlockType: 'xp', cost: { xp: 450, cristales: 4 } },
          { id: 'sword_eje_7', tier: 3, name: 'Verdugo Eterno',       icon: '☠️', desc: 'Ninguna vida escapa a su sentencia final.',       limitante: 'Un uso por combate', effect: 'execute', unlockType: 'level_cap', cost: { levelRequired: MAX_WEAPON_LEVEL } },
          { id: 'sword_eje_8', tier: 3, name: 'Verdugo Eterno: Condena', icon: '☠️', desc: 'La sentencia se vuelve absoluta.',            limitante: 'Requiere maestría probada', effect: 'execute', unlockType: 'level_cap+dungeon', cost: { levelRequired: MAX_WEAPON_LEVEL, dungeonId: null, timesRequired: 1 } },
          { id: 'sword_eje_9', tier: 3, name: 'Verdugo Eterno: Definitivo', icon: '☠️', desc: 'La ejecución final, sin excepciones.',       limitante: 'Solo para maestros', effect: 'execute', unlockType: 'level_cap+dungeon_repeat', cost: { levelRequired: MAX_WEAPON_LEVEL, dungeonId: null, timesRequired: null } },
        ],
      },
    },
  },
  
bow: {
    label: 'Arco',
    icon : '🏹',
    branches: {
      precision: {
        label: 'Precisión', icon: '🎯', color: '#6dcc8a',
        skills: [
          { id: 'bow_pre_1', tier: 1, name: 'Tiro Perforante I',   icon: '🎯', desc: 'Flecha que atraviesa al primer objetivo.',        limitante: 'Daño bajo', effect: 'piercing_shot', unlockType: 'xp', cost: { xp: 50,  cristales: 1 } },
          { id: 'bow_pre_2', tier: 1, name: 'Tiro Perforante II',  icon: '🎯', desc: 'Mayor penetración entre enemigos.',               limitante: 'Daño moderado', effect: 'piercing_shot', unlockType: 'xp', cost: { xp: 100, cristales: 2 } },
          { id: 'bow_pre_3', tier: 1, name: 'Tiro de Francotirador I', icon: '🔭', desc: 'Disparo cargado de alto daño a distancia.',    limitante: 'Tiempo de carga', effect: 'snipe', unlockType: 'xp', cost: { xp: 150, cristales: 2 } },
          { id: 'bow_pre_4', tier: 2, name: 'Tiro de Francotirador II', icon: '🔭', desc: 'Carga más rápida, más daño.',                 limitante: 'Tiempo de carga', effect: 'snipe', unlockType: 'xp', cost: { xp: 250, cristales: 3 } },
          { id: 'bow_pre_5', tier: 2, name: 'Diana I',              icon: '🎯', desc: 'Marca un punto débil para daño crítico garantizado.', limitante: 'Recarga media', effect: 'bullseye', unlockType: 'xp', cost: { xp: 350, cristales: 4 } },
          { id: 'bow_pre_6', tier: 2, name: 'Diana II',             icon: '🎯', desc: 'Marca más precisa, mayor crítico.',              limitante: 'Recarga media', effect: 'bullseye', unlockType: 'xp', cost: { xp: 450, cristales: 4 } },
          { id: 'bow_pre_7', tier: 3, name: 'Flecha Divina',        icon: '✨', desc: 'Invoca una flecha de luz pura, letal.',           limitante: 'Alto consumo de energía', effect: 'divine_arrow', unlockType: 'level_cap', cost: { levelRequired: MAX_WEAPON_LEVEL } },
          { id: 'bow_pre_8', tier: 3, name: 'Flecha Divina: Juicio', icon: '✨', desc: 'La luz se vuelve juicio implacable.',            limitante: 'Requiere maestría probada', effect: 'divine_arrow', unlockType: 'level_cap+dungeon', cost: { levelRequired: MAX_WEAPON_LEVEL, dungeonId: null, timesRequired: 1 } },
          { id: 'bow_pre_9', tier: 3, name: 'Flecha Divina: Trascendencia', icon: '✨', desc: 'La precisión definitiva, sin fallo posible.', limitante: 'Solo para maestros', effect: 'divine_arrow', unlockType: 'level_cap+dungeon_repeat', cost: { levelRequired: MAX_WEAPON_LEVEL, dungeonId: null, timesRequired: null } },
        ],
      },
      veneno: {
        label: 'Veneno', icon: '☠️', color: '#66aa44',
        skills: [
          { id: 'bow_ven_1', tier: 1, name: 'Flecha Envenenada I',   icon: '☠️', desc: 'Flecha que inflige veneno progresivo.',          limitante: 'Daño bajo por tick', effect: 'poison_arrow', unlockType: 'xp', cost: { xp: 50,  cristales: 1 } },
          { id: 'bow_ven_2', tier: 1, name: 'Flecha Envenenada II',  icon: '☠️', desc: 'Veneno más potente y duradero.',                 limitante: 'Daño bajo por tick', effect: 'poison_arrow', unlockType: 'xp', cost: { xp: 100, cristales: 2 } },
          { id: 'bow_ven_3', tier: 1, name: 'Disparo de Plaga I',    icon: '🦠', desc: 'Propaga plaga entre enemigos cercanos.',         limitante: 'Radio pequeño', effect: 'plague_shot', unlockType: 'xp', cost: { xp: 150, cristales: 2 } },
          { id: 'bow_ven_4', tier: 2, name: 'Disparo de Plaga II',   icon: '🦠', desc: 'Plaga se propaga más lejos.',                    limitante: 'Radio pequeño', effect: 'plague_shot', unlockType: 'xp', cost: { xp: 250, cristales: 3 } },
          { id: 'bow_ven_5', tier: 2, name: 'Nube Tóxica I',         icon: '☁️', desc: 'Crea una nube venenosa persistente.',            limitante: 'Recarga media', effect: 'toxic_cloud', unlockType: 'xp', cost: { xp: 350, cristales: 4 } },
          { id: 'bow_ven_6', tier: 2, name: 'Nube Tóxica II',        icon: '☁️', desc: 'Nube más grande y duradera.',                    limitante: 'Recarga media', effect: 'toxic_cloud', unlockType: 'xp', cost: { xp: 450, cristales: 4 } },
          { id: 'bow_ven_7', tier: 3, name: 'Plaga Mortal',          icon: '💀', desc: 'Libera una plaga devastadora e imparable.',       limitante: 'Un uso por combate', effect: 'death_plague', unlockType: 'level_cap', cost: { levelRequired: MAX_WEAPON_LEVEL } },
          { id: 'bow_ven_8', tier: 3, name: 'Plaga Mortal: Epidemia', icon: '💀', desc: 'La plaga se vuelve incontenible.',              limitante: 'Requiere maestría probada', effect: 'death_plague', unlockType: 'level_cap+dungeon', cost: { levelRequired: MAX_WEAPON_LEVEL, dungeonId: null, timesRequired: 1 } },
          { id: 'bow_ven_9', tier: 3, name: 'Plaga Mortal: Pandemia', icon: '💀', desc: 'El veneno definitivo, sin cura posible.',       limitante: 'Solo para maestros', effect: 'death_plague', unlockType: 'level_cap+dungeon_repeat', cost: { levelRequired: MAX_WEAPON_LEVEL, dungeonId: null, timesRequired: null } },
        ],
      },
      lluvia: {
        label: 'Lluvia', icon: '🌧️', color: '#5599cc',
        skills: [
          { id: 'bow_llu_1', tier: 1, name: 'Lluvia de Flechas I',   icon: '🌧️', desc: 'Dispara varias flechas en arco sobre un área.',   limitante: 'Dispersión amplia', effect: 'rain_of_arrows', unlockType: 'xp', cost: { xp: 50,  cristales: 1 } },
          { id: 'bow_llu_2', tier: 1, name: 'Lluvia de Flechas II',  icon: '🌧️', desc: 'Más flechas, mayor cobertura.',                   limitante: 'Dispersión amplia', effect: 'rain_of_arrows', unlockType: 'xp', cost: { xp: 100, cristales: 2 } },
          { id: 'bow_llu_3', tier: 1, name: 'Descarga de Tormenta I', icon: '⛈️', desc: 'Ráfaga rápida de disparos consecutivos.',         limitante: 'Consumo de energía', effect: 'storm_volley', unlockType: 'xp', cost: { xp: 150, cristales: 2 } },
          { id: 'bow_llu_4', tier: 2, name: 'Descarga de Tormenta II', icon: '⛈️', desc: 'Ráfaga más rápida y numerosa.',                 limitante: 'Consumo de energía', effect: 'storm_volley', unlockType: 'xp', cost: { xp: 250, cristales: 3 } },
          { id: 'bow_llu_5', tier: 2, name: 'Tormenta de Flechas I', icon: '🏹', desc: 'Satura el área con una tormenta de proyectiles.', limitante: 'Recarga larga', effect: 'arrow_storm', unlockType: 'xp', cost: { xp: 350, cristales: 4 } },
          { id: 'bow_llu_6', tier: 2, name: 'Tormenta de Flechas II', icon: '🏹', desc: 'Tormenta más densa y letal.',                    limitante: 'Recarga larga', effect: 'arrow_storm', unlockType: 'xp', cost: { xp: 450, cristales: 4 } },
          { id: 'bow_llu_7', tier: 3, name: 'Colapso Celestial',     icon: '☄️', desc: 'Hace caer una lluvia de flechas del cielo entero.', limitante: 'Alto consumo de energía', effect: 'sky_collapse', unlockType: 'level_cap', cost: { levelRequired: MAX_WEAPON_LEVEL } },
          { id: 'bow_llu_8', tier: 3, name: 'Colapso Celestial: Apocalipsis', icon: '☄️', desc: 'El cielo entero se desata en furia.',    limitante: 'Requiere maestría probada', effect: 'sky_collapse', unlockType: 'level_cap+dungeon', cost: { levelRequired: MAX_WEAPON_LEVEL, dungeonId: null, timesRequired: 1 } },
          { id: 'bow_llu_9', tier: 3, name: 'Colapso Celestial: Fin de los Días', icon: '☄️', desc: 'La lluvia definitiva, devastación total.', limitante: 'Solo para maestros', effect: 'sky_collapse', unlockType: 'level_cap+dungeon_repeat', cost: { levelRequired: MAX_WEAPON_LEVEL, dungeonId: null, timesRequired: null } },
        ],
      },
      agilidad: {
        label: 'Agilidad', icon: '💨', color: '#ccaa44',
        skills: [
          { id: 'bow_agi_1', tier: 1, name: 'Paso Atrás I',          icon: '💨', desc: 'Retrocede con un disparo simultáneo.',             limitante: 'Distancia corta', effect: 'back_step', unlockType: 'xp', cost: { xp: 50,  cristales: 1 } },
          { id: 'bow_agi_2', tier: 1, name: 'Paso Atrás II',         icon: '💨', desc: 'Retroceso más largo, mejor reposicionamiento.',   limitante: 'Distancia corta', effect: 'back_step', unlockType: 'xp', cost: { xp: 100, cristales: 2 } },
          { id: 'bow_agi_3', tier: 1, name: 'Tiro de Rodada I',      icon: '🤸', desc: 'Rueda esquivando mientras dispara.',               limitante: 'Recarga corta', effect: 'roll_shot', unlockType: 'xp', cost: { xp: 150, cristales: 2 } },
          { id: 'bow_agi_4', tier: 2, name: 'Tiro de Rodada II',     icon: '🤸', desc: 'Rodada más rápida, mayor invulnerabilidad.',       limitante: 'Recarga corta', effect: 'roll_shot', unlockType: 'xp', cost: { xp: 250, cristales: 3 } },
          { id: 'bow_agi_5', tier: 2, name: 'Paso Fantasma I',       icon: '👻', desc: 'Se desplaza brevemente intangible mientras dispara.', limitante: 'Ventana corta', effect: 'phantom_step', unlockType: 'xp', cost: { xp: 350, cristales: 4 } },
          { id: 'bow_agi_6', tier: 2, name: 'Paso Fantasma II',      icon: '👻', desc: 'Mayor duración de intangibilidad.',                limitante: 'Ventana corta', effect: 'phantom_step', unlockType: 'xp', cost: { xp: 450, cristales: 4 } },
          { id: 'bow_agi_7', tier: 3, name: 'Danza del Vacío',       icon: '🌀', desc: 'Se mueve entre planos disparando sin cesar.',       limitante: 'Alto consumo de energía', effect: 'void_dance', unlockType: 'level_cap', cost: { levelRequired: MAX_WEAPON_LEVEL } },
          { id: 'bow_agi_8', tier: 3, name: 'Danza del Vacío: Eco',  icon: '🌀', desc: 'El vacío resuena con cada movimiento.',            limitante: 'Requiere maestría probada', effect: 'void_dance', unlockType: 'level_cap+dungeon', cost: { levelRequired: MAX_WEAPON_LEVEL, dungeonId: null, timesRequired: 1 } },
          { id: 'bow_agi_9', tier: 3, name: 'Danza del Vacío: Infinito', icon: '🌀', desc: 'La agilidad definitiva, un paso siempre entre planos.', limitante: 'Solo para maestros', effect: 'void_dance', unlockType: 'level_cap+dungeon_repeat', cost: { levelRequired: MAX_WEAPON_LEVEL, dungeonId: null, timesRequired: null } },
        ],
      },
    },
  },
  magic: {
    label: 'Magia',
    icon : '🔮',
    branches: {
      fuego: {
        label: 'Fuego', icon: '🔥', color: '#ff6633',
        skills: [
          { id: 'magic_fue_1', tier: 1, name: 'Bola de Fuego I',    icon: '🔥', desc: 'Proyectil de fuego directo al enemigo.',           limitante: 'Recarga corta', effect: 'fireball', unlockType: 'xp', cost: { xp: 50,  cristales: 1 } },
          { id: 'magic_fue_2', tier: 1, name: 'Bola de Fuego II',   icon: '🔥', desc: 'Mayor daño de explosión.',                        limitante: 'Recarga corta', effect: 'fireball', unlockType: 'xp', cost: { xp: 100, cristales: 2 } },
          { id: 'magic_fue_3', tier: 1, name: 'Estallido Ígneo I',  icon: '💥', desc: 'La explosión de la bola de fuego se hace más amplia.', limitante: 'Recarga media', effect: 'fireball', unlockType: 'xp', cost: { xp: 150, cristales: 2 } },
          { id: 'magic_fue_4', tier: 2, name: 'Estallido Ígneo II', icon: '💥', desc: 'Explosión aún más amplia.',                       limitante: 'Recarga media', effect: 'fireball', unlockType: 'xp', cost: { xp: 250, cristales: 3 } },
          { id: 'magic_fue_5', tier: 2, name: 'Furia Ardiente I',   icon: '🔥', desc: 'Lanza múltiples bolas de fuego consecutivas.',    limitante: 'Alto consumo de energía', effect: 'fireball', unlockType: 'xp', cost: { xp: 350, cristales: 4 } },
          { id: 'magic_fue_6', tier: 2, name: 'Furia Ardiente II',  icon: '🔥', desc: 'Más proyectiles por uso.',                       limitante: 'Alto consumo de energía', effect: 'fireball', unlockType: 'xp', cost: { xp: 450, cristales: 4 } },
          { id: 'magic_fue_7', tier: 3, name: 'Infierno Absoluto',  icon: '🌋', desc: 'Convierte el campo de batalla en un mar de fuego.', limitante: 'Un uso por combate', effect: 'fireball', unlockType: 'level_cap', cost: { levelRequired: MAX_WEAPON_LEVEL } },
          { id: 'magic_fue_8', tier: 3, name: 'Infierno Absoluto: Cenizas', icon: '🌋', desc: 'El fuego no deja nada a su paso.',        limitante: 'Requiere maestría probada', effect: 'fireball', unlockType: 'level_cap+dungeon', cost: { levelRequired: MAX_WEAPON_LEVEL, dungeonId: null, timesRequired: 1 } },
          { id: 'magic_fue_9', tier: 3, name: 'Infierno Absoluto: Apocalipsis', icon: '🌋', desc: 'El fuego definitivo, todo arde.',      limitante: 'Solo para maestros', effect: 'fireball', unlockType: 'level_cap+dungeon_repeat', cost: { levelRequired: MAX_WEAPON_LEVEL, dungeonId: null, timesRequired: null } },
        ],
      },
      hielo: {
        label: 'Hielo', icon: '❄️', color: '#66ccff',
        skills: [
          { id: 'magic_hie_1', tier: 1, name: 'Fragmento de Hielo I',  icon: '❄️', desc: 'Proyectil helado que ralentiza al impactar.',    limitante: 'Recarga corta', effect: 'ice_shard', unlockType: 'xp', cost: { xp: 50,  cristales: 1 } },
          { id: 'magic_hie_2', tier: 1, name: 'Fragmento de Hielo II', icon: '❄️', desc: 'Mayor ralentización.',                         limitante: 'Recarga corta', effect: 'ice_shard', unlockType: 'xp', cost: { xp: 100, cristales: 2 } },
          { id: 'magic_hie_3', tier: 1, name: 'Lanza Glacial I',       icon: '🧊', desc: 'Fragmento más grande, mayor daño.',              limitante: 'Recarga media', effect: 'ice_shard', unlockType: 'xp', cost: { xp: 150, cristales: 2 } },
          { id: 'magic_hie_4', tier: 2, name: 'Lanza Glacial II',      icon: '🧊', desc: 'Daño y ralentización aumentados.',              limitante: 'Recarga media', effect: 'ice_shard', unlockType: 'xp', cost: { xp: 250, cristales: 3 } },
          { id: 'magic_hie_5', tier: 2, name: 'Ventisca Personal I',   icon: '🌨️', desc: 'Lanza varios fragmentos en abanico.',            limitante: 'Alto consumo de energía', effect: 'ice_shard', unlockType: 'xp', cost: { xp: 350, cristales: 4 } },
          { id: 'magic_hie_6', tier: 2, name: 'Ventisca Personal II',  icon: '🌨️', desc: 'Más fragmentos por uso.',                       limitante: 'Alto consumo de energía', effect: 'ice_shard', unlockType: 'xp', cost: { xp: 450, cristales: 4 } },
          { id: 'magic_hie_7', tier: 3, name: 'Era Glacial',           icon: '🧊', desc: 'Congela el campo de batalla entero.',            limitante: 'Un uso por combate', effect: 'ice_shard', unlockType: 'level_cap', cost: { levelRequired: MAX_WEAPON_LEVEL } },
          { id: 'magic_hie_8', tier: 3, name: 'Era Glacial: Escarcha Eterna', icon: '🧊', desc: 'El frío se vuelve permanente.',          limitante: 'Requiere maestría probada', effect: 'ice_shard', unlockType: 'level_cap+dungeon', cost: { levelRequired: MAX_WEAPON_LEVEL, dungeonId: null, timesRequired: 1 } },
          { id: 'magic_hie_9', tier: 3, name: 'Era Glacial: Cero Absoluto', icon: '🧊', desc: 'El hielo definitivo, todo se congela.',    limitante: 'Solo para maestros', effect: 'ice_shard', unlockType: 'level_cap+dungeon_repeat', cost: { levelRequired: MAX_WEAPON_LEVEL, dungeonId: null, timesRequired: null } },
        ],
      },
      viento: {
        label: 'Viento', icon: '🌬️', color: '#88ddaa',
        skills: [
          { id: 'magic_vie_1', tier: 1, name: 'Ráfaga I',            icon: '🌬️', desc: 'Ráfaga de viento que empuja al enemigo.',         limitante: 'Solo empuja, no daña mucho', effect: 'gust', unlockType: 'xp', cost: { xp: 50,  cristales: 1 } },
          { id: 'magic_vie_2', tier: 1, name: 'Ráfaga II',           icon: '🌬️', desc: 'Empuje más fuerte.',                            limitante: 'Solo empuja, no daña mucho', effect: 'gust', unlockType: 'xp', cost: { xp: 100, cristales: 2 } },
          { id: 'magic_vie_3', tier: 1, name: 'Corriente Cortante I', icon: '💨', desc: 'El viento se afila y comienza a herir.',         limitante: 'Recarga media', effect: 'gust', unlockType: 'xp', cost: { xp: 150, cristales: 2 } },
          { id: 'magic_vie_4', tier: 2, name: 'Corriente Cortante II', icon: '💨', desc: 'Mayor daño cortante.',                          limitante: 'Recarga media', effect: 'gust', unlockType: 'xp', cost: { xp: 250, cristales: 3 } },
          { id: 'magic_vie_5', tier: 2, name: 'Vendaval I',           icon: '🌪️', desc: 'Ráfaga amplia que arrastra a varios enemigos.',   limitante: 'Alto consumo de energía', effect: 'gust', unlockType: 'xp', cost: { xp: 350, cristales: 4 } },
          { id: 'magic_vie_6', tier: 2, name: 'Vendaval II',          icon: '🌪️', desc: 'Área más amplia.',                              limitante: 'Alto consumo de energía', effect: 'gust', unlockType: 'xp', cost: { xp: 450, cristales: 4 } },
          { id: 'magic_vie_7', tier: 3, name: 'Tempestad Absoluta',   icon: '🌀', desc: 'Convoca una tormenta de viento devastadora.',     limitante: 'Un uso por combate', effect: 'gust', unlockType: 'level_cap', cost: { levelRequired: MAX_WEAPON_LEVEL } },
          { id: 'magic_vie_8', tier: 3, name: 'Tempestad Absoluta: Huracán', icon: '🌀', desc: 'La tempestad se intensifica sin control.', limitante: 'Requiere maestría probada', effect: 'gust', unlockType: 'level_cap+dungeon', cost: { levelRequired: MAX_WEAPON_LEVEL, dungeonId: null, timesRequired: 1 } },
          { id: 'magic_vie_9', tier: 3, name: 'Tempestad Absoluta: Vórtice Final', icon: '🌀', desc: 'El viento definitivo, todo es arrastrado.', limitante: 'Solo para maestros', effect: 'gust', unlockType: 'level_cap+dungeon_repeat', cost: { levelRequired: MAX_WEAPON_LEVEL, dungeonId: null, timesRequired: null } },
        ],
      },
      naturaleza: {
        label: 'Naturaleza', icon: '🌿', color: '#66aa44',
        skills: [
          { id: 'magic_nat_1', tier: 1, name: 'Espina Certera I',    icon: '🌿', desc: 'Disparo de espinas afiladas.',                    limitante: 'Recarga corta', effect: 'thorn', unlockType: 'xp', cost: { xp: 50,  cristales: 1 } },
          { id: 'magic_nat_2', tier: 1, name: 'Espina Certera II',   icon: '🌿', desc: 'Mayor daño perforante.',                         limitante: 'Recarga corta', effect: 'thorn', unlockType: 'xp', cost: { xp: 100, cristales: 2 } },
          { id: 'magic_nat_3', tier: 1, name: 'Zarza Punzante I',    icon: '🌵', desc: 'Las espinas se multiplican al impactar.',        limitante: 'Recarga media', effect: 'thorn', unlockType: 'xp', cost: { xp: 150, cristales: 2 } },
          { id: 'magic_nat_4', tier: 2, name: 'Zarza Punzante II',   icon: '🌵', desc: 'Más espinas por impacto.',                       limitante: 'Recarga media', effect: 'thorn', unlockType: 'xp', cost: { xp: 250, cristales: 3 } },
          { id: 'magic_nat_5', tier: 2, name: 'Enredadera Salvaje I', icon: '🌱', desc: 'Enreda al enemigo mientras lo hiere.',           limitante: 'Alto consumo de energía', effect: 'thorn', unlockType: 'xp', cost: { xp: 350, cristales: 4 } },
          { id: 'magic_nat_6', tier: 2, name: 'Enredadera Salvaje II', icon: '🌱', desc: 'Enredo más duradero.',                          limitante: 'Alto consumo de energía', effect: 'thorn', unlockType: 'xp', cost: { xp: 450, cristales: 4 } },
          { id: 'magic_nat_7', tier: 3, name: 'Bosque Vengativo',     icon: '🌳', desc: 'La naturaleza entera se alza contra el enemigo.', limitante: 'Un uso por combate', effect: 'thorn', unlockType: 'level_cap', cost: { levelRequired: MAX_WEAPON_LEVEL } },
          { id: 'magic_nat_8', tier: 3, name: 'Bosque Vengativo: Raíces Eternas', icon: '🌳', desc: 'Las raíces no sueltan jamás.',       limitante: 'Requiere maestría probada', effect: 'thorn', unlockType: 'level_cap+dungeon', cost: { levelRequired: MAX_WEAPON_LEVEL, dungeonId: null, timesRequired: 1 } },
          { id: 'magic_nat_9', tier: 3, name: 'Bosque Vengativo: Gaia', icon: '🌳', desc: 'La naturaleza definitiva, imparable.',         limitante: 'Solo para maestros', effect: 'thorn', unlockType: 'level_cap+dungeon_repeat', cost: { levelRequired: MAX_WEAPON_LEVEL, dungeonId: null, timesRequired: null } },
        ],
      },
    },
  },

  
  

// ── Helpers de consulta ─────────────────────────────────────────────────────

export function getWeaponTree(weapon) {
  return WEAPON_SKILL_TREES[weapon] ?? null;
}

export function getBranch(weapon, branchId) {
  return WEAPON_SKILL_TREES[weapon]?.branches?.[branchId] ?? null;
}

export function getAllBranchIds(weapon) {
  const tree = WEAPON_SKILL_TREES[weapon];
  return tree ? Object.keys(tree.branches) : [];
}

export function getSkillById(weapon, branchId, skillId) {
  const branch = getBranch(weapon, branchId);
  return branch?.skills.find(s => s.id === skillId) ?? null;
}

// Devuelve si una skill puede desbloquearse dado el estado actual del arma.
// weaponState: { level, xp, dungeonCompletions: { [dungeonId]: count } }
export function canUnlockSkill(skill, weaponState) {
  if (skill.unlockType === 'xp') {
    return weaponState.xp >= skill.cost.xp;
  }
  if (skill.unlockType === 'level_cap') {
    return weaponState.level >= skill.cost.levelRequired;
  }
  if (skill.unlockType === 'level_cap+dungeon') {
    if (weaponState.level < skill.cost.levelRequired) return false;
    const count = weaponState.dungeonCompletions?.[skill.cost.dungeonId] ?? 0;
    return count >= (skill.cost.timesRequired ?? 1);
  }
  if (skill.unlockType === 'level_cap+dungeon_repeat') {
    if (weaponState.level < skill.cost.levelRequired) return false;
    const count = weaponState.dungeonCompletions?.[skill.cost.dungeonId] ?? 0;
    return count >= (skill.cost.timesRequired ?? 999);
  }
  return false;
}

// ── Compatibilidad con código legacy (mismos exports que el archivo viejo) ──
export const WEAPON_CRYSTAL_MAP = {
  katana: 'cristalKatana',
  sword : 'cristalEspada',
  magic : 'cristalMagia',
  bow   : 'cristalArco',
};

export const RARITY_COLORS = {
  common   : '#aaaaaa',
  rare     : '#4488ff',
  epic     : '#aa44ff',
  legendary: '#ffaa00',
};
