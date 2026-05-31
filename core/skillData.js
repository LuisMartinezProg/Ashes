// core/skillData.js — Ashes of the Reborn | Valiant Gaming

// ── Estructura del árbol por personaje/arma ───────────────────────────────
// Cada arma tiene 5 capas: basico, nv1 (x3), nv2 (x3), nv3 (x3), arcano (x3 elige 1)
// Loadout activo: 1 básico (siempre) + 1 de nv1/nv2/nv3 + 1 arcano

export const WEAPON_TREES = {

  // ── KAEL — KATANA ─────────────────────────────────────────────
  kael_katana: {
    label : 'Katana',
    icon  : '🗡️',
    color : '#e8c9a0',
    layers: {
      basico: [
        {
          id         : 'golpe_basico',
          name       : 'Golpe Básico',
          icon       : '⚔️',
          desc       : 'Combo de tres golpes rápidos con la katana.',
          effect     : { type: 'damage', multiplier: 1.0 },
          cost       : { xp: 0, cristales: 0 },
          unlocked   : true,
        },
      ],
      nv1: [
        {
          id         : 'corte_doble',
          name       : 'Corte Doble',
          icon       : '✂️',
          desc       : 'Dos tajos en cruz que infligen sangrado.',
          effect     : { type: 'damage', multiplier: 1.4, apply: 'bleed', duration: 3 },
          cost       : { xp: 100, cristales: 2 },
          unlocked   : false,
        },
        {
          id         : 'dash_katana',
          name       : 'Dash',
          icon       : '💨',
          desc       : 'Avanza rápidamente hacia el enemigo.',
          effect     : { type: 'mobility', distance: 3.5 },
          cost       : { xp: 100, cristales: 2 },
          unlocked   : false,
        },
        {
          id         : 'parada_perfecta',
          name       : 'Parada Perfecta',
          icon       : '🛡️',
          desc       : 'Bloquea un ataque y contraataca al instante.',
          effect     : { type: 'parry', counterMultiplier: 1.8 },
          cost       : { xp: 100, cristales: 2 },
          unlocked   : false,
        },
      ],
      nv2: [
        {
          id         : 'golpe_giratorio',
          name       : 'Golpe Giratorio',
          icon       : '🌀',
          desc       : 'Giro de 360° que golpea a todos los enemigos cercanos.',
          effect     : { type: 'damage_aoe', multiplier: 1.2, radius: 2.5 },
          cost       : { xp: 300, cristales: 4 },
          unlocked   : false,
        },
        {
          id         : 'paso_fantasma',
          name       : 'Paso Fantasma',
          icon       : '👻',
          desc       : 'Atraviesa enemigos dejando una estela de daño.',
          effect     : { type: 'mobility_damage', multiplier: 0.8, distance: 5 },
          cost       : { xp: 300, cristales: 4 },
          unlocked   : false,
        },
        {
          id         : 'contraataque',
          name       : 'Contraataque',
          icon       : '↩️',
          desc       : 'Al recibir daño, responde con un golpe automático.',
          effect     : { type: 'reactive', multiplier: 1.5 },
          cost       : { xp: 300, cristales: 4 },
          unlocked   : false,
        },
      ],
      nv3: [
        {
          id         : 'golpe_cargado',
          name       : 'Golpe Cargado',
          icon       : '⚡',
          desc       : 'Carga energía y libera un golpe devastador.',
          effect     : { type: 'damage', multiplier: 2.5, chargeTime: 1.2 },
          cost       : { xp: 600, cristales: 6 },
          unlocked   : false,
        },
        {
          id         : 'esquiva_avanzada',
          name       : 'Esquiva Avanzada',
          icon       : '🌬️',
          desc       : 'Esquiva con invencibilidad breve y posiciona para contraatacar.',
          effect     : { type: 'mobility', iframes: 0.4, counterWindow: 0.6 },
          cost       : { xp: 600, cristales: 6 },
          unlocked   : false,
        },
        {
          id         : 'absorcion_dano',
          name       : 'Absorción de Daño',
          icon       : '🌑',
          desc       : 'Convierte el 15% del daño recibido en HP.',
          effect     : { type: 'passive', absorbPct: 0.15 },
          cost       : { xp: 600, cristales: 6 },
          unlocked   : false,
        },
      ],
      arcano: [
        {
          id         : 'devastacion',
          name       : 'Devastación',
          icon       : '💥',
          desc       : 'Libera toda la energía acumulada en un golpe que ignora DEF.',
          effect     : { type: 'damage', multiplier: 4.0, ignoresDef: true },
          cost       : { xp: 1200, cristales: 10 },
          unlocked   : false,
        },
        {
          id         : 'torbellino_oscuro',
          name       : 'Torbellino Oscuro',
          icon       : '🌪️',
          desc       : 'Torbellino de sombras que drena vida de todos los enemigos cercanos.',
          effect     : { type: 'damage_aoe_drain', multiplier: 2.0, radius: 4, drainPct: 0.3 },
          cost       : { xp: 1200, cristales: 10 },
          unlocked   : false,
        },
        {
          id         : 'filo_del_vacio',
          name       : 'Filo del Vacío',
          icon       : '🕳️',
          desc       : 'Un tajo que abre una grieta dimensional, dañando al enemigo dos veces.',
          effect     : { type: 'damage_double', multiplier: 1.8 },
          cost       : { xp: 1200, cristales: 10 },
          unlocked   : false,
        },
      ],
    },
  },

  // ── KAEL — SWORD ─────────────────────────────────────────────
  kael_sword: {
    label : 'Espada',
    icon  : '⚔️',
    color : '#ffcc44',
    layers: {
      basico: [
        {
          id         : 'golpe_basico',
          name       : 'Golpe Básico',
          icon       : '⚔️',
          desc       : 'Combo de dos golpes contundentes con la espada.',
          effect     : { type: 'damage', multiplier: 1.0 },
          cost       : { xp: 0, cristales: 0 },
          unlocked   : true,
        },
      ],
      nv1: [
        {
          id         : 'estocada',
          name       : 'Estocada',
          icon       : '🗡️',
          desc       : 'Embestida hacia adelante que perfora la defensa.',
          effect     : { type: 'damage', multiplier: 1.6, piercesDef: 0.3 },
          cost       : { xp: 100, cristales: 2 },
          unlocked   : false,
        },
        {
          id         : 'bloqueo',
          name       : 'Bloqueo',
          icon       : '🛡️',
          desc       : 'Reduce el daño recibido un 50% por 2 segundos.',
          effect     : { type: 'defense', damageReduction: 0.5, duration: 2 },
          cost       : { xp: 100, cristales: 2 },
          unlocked   : false,
        },
        {
          id         : 'rodar',
          name       : 'Rodar',
          icon       : '🔄',
          desc       : 'Rueda lateralmente esquivando ataques.',
          effect     : { type: 'mobility', iframes: 0.3 },
          cost       : { xp: 100, cristales: 2 },
          unlocked   : false,
        },
      ],
      nv2: [
        {
          id         : 'corte_doble_espada',
          name       : 'Corte Doble',
          icon       : '✂️',
          desc       : 'Dos golpes amplios que cubren un arco de 180°.',
          effect     : { type: 'damage_arc', multiplier: 1.3, angle: 180 },
          cost       : { xp: 300, cristales: 4 },
          unlocked   : false,
        },
        {
          id         : 'postura_defensiva',
          name       : 'Postura Defensiva',
          icon       : '🏰',
          desc       : 'Aumenta DEF un 30% y reduce velocidad un 20% por 5s.',
          effect     : { type: 'buff', defBonus: 0.3, speedPenalty: 0.2, duration: 5 },
          cost       : { xp: 300, cristales: 4 },
          unlocked   : false,
        },
        {
          id         : 'deslizamiento',
          name       : 'Deslizamiento',
          icon       : '💫',
          desc       : 'Deslizamiento rápido que evita proyectiles.',
          effect     : { type: 'mobility', distance: 4, projectileImmune: true },
          cost       : { xp: 300, cristales: 4 },
          unlocked   : false,
        },
      ],
      nv3: [
        {
          id         : 'golpe_cargado_espada',
          name       : 'Golpe Cargado',
          icon       : '⚡',
          desc       : 'Golpe de tierra que crea una onda de choque.',
          effect     : { type: 'damage_aoe', multiplier: 2.2, radius: 3 },
          cost       : { xp: 600, cristales: 6 },
          unlocked   : false,
        },
        {
          id         : 'contraataque_espada',
          name       : 'Contraataque',
          icon       : '↩️',
          desc       : 'Bloquea y responde con un golpe que aturde al enemigo.',
          effect     : { type: 'parry', counterMultiplier: 2.0, stunDuration: 1.5 },
          cost       : { xp: 600, cristales: 6 },
          unlocked   : false,
        },
        {
          id         : 'escudo_energia',
          name       : 'Escudo de Energía',
          icon       : '✨',
          desc       : 'Barrera que absorbe hasta 80 de daño.',
          effect     : { type: 'shield', absorbAmount: 80 },
          cost       : { xp: 600, cristales: 6 },
          unlocked   : false,
        },
      ],
      arcano: [
        {
          id         : 'devastacion_espada',
          name       : 'Devastación',
          icon       : '💥',
          desc       : 'Golpe que destruye la postura del enemigo e ignora DEF.',
          effect     : { type: 'damage', multiplier: 4.0, ignoresDef: true },
          cost       : { xp: 1200, cristales: 10 },
          unlocked   : false,
        },
        {
          id         : 'juicio_acero',
          name       : 'Juicio de Acero',
          icon       : '⚖️',
          desc       : 'Golpe sagrado que hace más daño cuanto más HP tenga el enemigo.',
          effect     : { type: 'damage_scaling_enemy_hp', baseMultiplier: 2.0, maxMultiplier: 5.0 },
          cost       : { xp: 1200, cristales: 10 },
          unlocked   : false,
        },
        {
          id         : 'bastion_inquebrantable',
          name       : 'Bastión Inquebrantable',
          icon       : '🏯',
          desc       : 'Durante 8s eres invulnerable pero no puedes moverte.',
          effect     : { type: 'defense', invulnerable: true, duration: 8, immobilized: true },
          cost       : { xp: 1200, cristales: 10 },
          unlocked   : false,
        },
      ],
    },
  },

  // ── KAEL — MAGIC ─────────────────────────────────────────────
  kael_magic: {
    label : 'Magia',
    icon  : '🔮',
    color : '#aa44ff',
    layers: {
      basico: [
        {
          id         : 'explosion_magica',
          name       : 'Explosión Mágica',
          icon       : '💥',
          desc       : 'Proyectil de energía arcana que explota al impacto.',
          effect     : { type: 'damage', multiplier: 1.0, isProjectile: true },
          cost       : { xp: 0, cristales: 0 },
          unlocked   : true,
        },
      ],
      nv1: [
        {
          id         : 'rafaga_energia',
          name       : 'Ráfaga de Energía',
          icon       : '⚡',
          desc       : 'Tres proyectiles rápidos en abanico.',
          effect     : { type: 'damage_multi', projectiles: 3, multiplier: 0.7 },
          cost       : { xp: 100, cristales: 2 },
          unlocked   : false,
        },
        {
          id         : 'barrera_magica',
          name       : 'Barrera Mágica',
          icon       : '🔵',
          desc       : 'Escudo arcano que absorbe 60 de daño.',
          effect     : { type: 'shield', absorbAmount: 60 },
          cost       : { xp: 100, cristales: 2 },
          unlocked   : false,
        },
        {
          id         : 'sprint_magico',
          name       : 'Sprint Mágico',
          icon       : '🌟',
          desc       : 'Velocidad aumentada un 40% por 3 segundos.',
          effect     : { type: 'buff', speedBonus: 0.4, duration: 3 },
          cost       : { xp: 100, cristales: 2 },
          unlocked   : false,
        },
      ],
      nv2: [
        {
          id         : 'proyectil_veloz',
          name       : 'Proyectil Veloz',
          icon       : '🎯',
          desc       : 'Proyectil de alta velocidad que perfora enemigos.',
          effect     : { type: 'damage_pierce', multiplier: 1.5, pierceCount: 3 },
          cost       : { xp: 300, cristales: 4 },
          unlocked   : false,
        },
        {
          id         : 'escudo_energia_magic',
          name       : 'Escudo de Energía',
          icon       : '✨',
          desc       : 'Cúpula de energía que refleja proyectiles.',
          effect     : { type: 'shield_reflect', duration: 3 },
          cost       : { xp: 300, cristales: 4 },
          unlocked   : false,
        },
        {
          id         : 'teletransporte_corto',
          name       : 'Teletransporte Corto',
          icon       : '🌀',
          desc       : 'Se teletransporta detrás del enemigo más cercano.',
          effect     : { type: 'teleport', range: 6 },
          cost       : { xp: 300, cristales: 4 },
          unlocked   : false,
        },
      ],
      nv3: [
        {
          id         : 'golpe_cargado_magic',
          name       : 'Golpe Cargado',
          icon       : '🌋',
          desc       : 'Acumula energía y lanza una explosión masiva en área.',
          effect     : { type: 'damage_aoe', multiplier: 3.0, radius: 5 },
          cost       : { xp: 600, cristales: 6 },
          unlocked   : false,
        },
        {
          id         : 'reflejo_proyectil',
          name       : 'Reflejo de Proyectil',
          icon       : '↗️',
          desc       : 'Devuelve el próximo proyectil recibido al enemigo.',
          effect     : { type: 'reactive_projectile', multiplier: 2.0 },
          cost       : { xp: 600, cristales: 6 },
          unlocked   : false,
        },
        {
          id         : 'debilitamiento',
          name       : 'Debilitamiento',
          icon       : '💀',
          desc       : 'Reduce ATK y DEF del enemigo un 25% por 8 segundos.',
          effect     : { type: 'debuff', atkReduction: 0.25, defReduction: 0.25, duration: 8 },
          cost       : { xp: 600, cristales: 6 },
          unlocked   : false,
        },
      ],
      arcano: [
        {
          id         : 'devastacion_magic',
          name       : 'Devastación',
          icon       : '☄️',
          desc       : 'Meteorito arcano que cae sobre todos los enemigos en pantalla.',
          effect     : { type: 'damage_all', multiplier: 3.5 },
          cost       : { xp: 1200, cristales: 10 },
          unlocked   : false,
        },
        {
          id         : 'nova_arcana',
          name       : 'Nova Arcana',
          icon       : '🌠',
          desc       : 'Explosión de energía pura que paraliza y daña en área.',
          effect     : { type: 'damage_aoe_stun', multiplier: 2.5, radius: 6, stunDuration: 2 },
          cost       : { xp: 1200, cristales: 10 },
          unlocked   : false,
        },
        {
          id         : 'singularidad',
          name       : 'Singularidad',
          icon       : '🕳️',
          desc       : 'Crea un agujero negro que atrae y aplasta a todos los enemigos.',
          effect     : { type: 'damage_pull_aoe', multiplier: 3.0, radius: 8, pullForce: 5 },
          cost       : { xp: 1200, cristales: 10 },
          unlocked   : false,
        },
      ],
    },
  },

  // ── KAEL — BOW ───────────────────────────────────────────────
  kael_bow: {
    label : 'Arco',
    icon  : '🏹',
    color : '#6dcc8a',
    layers: {
      basico: [
        {
          id         : 'proyectil_veloz_bow',
          name       : 'Proyectil Veloz',
          icon       : '🏹',
          desc       : 'Disparo preciso de alta velocidad.',
          effect     : { type: 'damage', multiplier: 1.0, isProjectile: true },
          cost       : { xp: 0, cristales: 0 },
          unlocked   : true,
        },
      ],
      nv1: [
        {
          id         : 'lluvia_flechas',
          name       : 'Lluvia de Flechas',
          icon       : '🌧️',
          desc       : 'Lanza cinco flechas en arco que caen sobre el área.',
          effect     : { type: 'damage_aoe', multiplier: 0.6, projectiles: 5, radius: 3 },
          cost       : { xp: 100, cristales: 2 },
          unlocked   : false,
        },
        {
          id         : 'rodar_bow',
          name       : 'Rodar',
          icon       : '🔄',
          desc       : 'Rueda lateralmente mientras dispara una flecha.',
          effect     : { type: 'mobility_damage', iframes: 0.3, multiplier: 0.8 },
          cost       : { xp: 100, cristales: 2 },
          unlocked   : false,
        },
        {
          id         : 'trampa',
          name       : 'Trampa',
          icon       : '🪤',
          desc       : 'Coloca una trampa que inmoviliza al primer enemigo que la pisa.',
          effect     : { type: 'trap', immobilizeDuration: 3, triggerRadius: 1 },
          cost       : { xp: 100, cristales: 2 },
          unlocked   : false,
        },
      ],
      nv2: [
        {
          id         : 'golpe_cargado_bow',
          name       : 'Golpe Cargado',
          icon       : '🎯',
          desc       : 'Flecha cargada que perfora hasta 5 enemigos en línea.',
          effect     : { type: 'damage_pierce', multiplier: 2.0, pierceCount: 5 },
          cost       : { xp: 300, cristales: 4 },
          unlocked   : false,
        },
        {
          id         : 'dash_bow',
          name       : 'Dash',
          icon       : '💨',
          desc       : 'Retroceso rápido creando distancia del enemigo.',
          effect     : { type: 'mobility', distance: 4, direction: 'backward' },
          cost       : { xp: 300, cristales: 4 },
          unlocked   : false,
        },
        {
          id         : 'vision_tactica',
          name       : 'Visión Táctica',
          icon       : '👁️',
          desc       : 'Revela la posición de todos los enemigos por 10 segundos.',
          effect     : { type: 'utility', revealDuration: 10 },
          cost       : { xp: 300, cristales: 4 },
          unlocked   : false,
        },
      ],
      nv3: [
        {
          id         : 'rafaga_energia_bow',
          name       : 'Ráfaga de Energía',
          icon       : '⚡',
          desc       : 'Dispara diez flechas energéticas en todas direcciones.',
          effect     : { type: 'damage_radial', projectiles: 10, multiplier: 0.9 },
          cost       : { xp: 600, cristales: 6 },
          unlocked   : false,
        },
        {
          id         : 'paso_fantasma_bow',
          name       : 'Paso Fantasma',
          icon       : '👻',
          desc       : 'Se vuelve intangible por 2s y sus flechas atraviesan todo.',
          effect     : { type: 'mobility_buff', intangible: true, duration: 2, piercingShots: true },
          cost       : { xp: 600, cristales: 6 },
          unlocked   : false,
        },
        {
          id         : 'marcado',
          name       : 'Marcado',
          icon       : '🔴',
          desc       : 'Marca al enemigo: recibe 50% más de daño por 6 segundos.',
          effect     : { type: 'debuff', damageAmp: 0.5, duration: 6 },
          cost       : { xp: 600, cristales: 6 },
          unlocked   : false,
        },
      ],
      arcano: [
        {
          id         : 'devastacion_bow',
          name       : 'Devastación',
          icon       : '💥',
          desc       : 'Flecha que explota al impacto dañando a todos en área.',
          effect     : { type: 'damage_aoe', multiplier: 4.0, radius: 5 },
          cost       : { xp: 1200, cristales: 10 },
          unlocked   : false,
        },
        {
          id         : 'tiro_espectral',
          name       : 'Tiro Espectral',
          icon       : '👻',
          desc       : 'Flecha espectral que ignora DEF y atraviesa paredes.',
          effect     : { type: 'damage', multiplier: 3.5, ignoresDef: true, wallPierce: true },
          cost       : { xp: 1200, cristales: 10 },
          unlocked   : false,
        },
        {
          id         : 'tormenta_flechas_bow',
          name       : 'Tormenta de Flechas',
          icon       : '🌪️',
          desc       : 'Invoca una tormenta de 20 flechas sobre todos los enemigos.',
          effect     : { type: 'damage_all', projectiles: 20, multiplier: 0.8 },
          cost       : { xp: 1200, cristales: 10 },
          unlocked   : false,
        },
      ],
    },
  },

  // ── MIKA — BOW ───────────────────────────────────────────────
  mika_bow: {
    label : 'Arco de Mika',
    icon  : '🏹',
    color : '#ff88aa',
    layers: {
      basico: [
        {
          id         : 'proyectil_veloz_mika',
          name       : 'Proyectil Veloz',
          icon       : '🏹',
          desc       : 'Disparo preciso con el arco de Mika.',
          effect     : { type: 'damage', multiplier: 1.0, isProjectile: true },
          cost       : { xp: 0, cristales: 0 },
          unlocked   : true,
        },
      ],
      nv1: [
        {
          id         : 'lluvia_flechas_mika',
          name       : 'Lluvia de Flechas',
          icon       : '🌧️',
          desc       : 'Dispara múltiples flechas que caen en área.',
          effect     : { type: 'damage_aoe', multiplier: 0.6, projectiles: 5, radius: 3 },
          cost       : { xp: 100, cristales: 2 },
          unlocked   : false,
        },
        {
          id         : 'esquiva_avanzada_mika',
          name       : 'Esquiva Avanzada',
          icon       : '💨',
          desc       : 'Esquiva ágil con invencibilidad y disparo automático.',
          effect     : { type: 'mobility_damage', iframes: 0.5, multiplier: 0.9 },
          cost       : { xp: 100, cristales: 2 },
          unlocked   : false,
        },
        {
          id         : 'seneuelo',
          name       : 'Señuelo',
          icon       : '🪆',
          desc       : 'Lanza un señuelo que atrae la atención de los enemigos por 4s.',
          effect     : { type: 'utility', tauntDuration: 4, tauntRadius: 6 },
          cost       : { xp: 100, cristales: 2 },
          unlocked   : false,
        },
      ],
      nv2: [
        {
          id         : 'rafaga_energia_mika',
          name       : 'Ráfaga de Energía',
          icon       : '⚡',
          desc       : 'Ráfaga de flechas eléctricas que paralizan al impacto.',
          effect     : { type: 'damage_multi', projectiles: 4, multiplier: 0.8, apply: 'stun', stunDuration: 0.5 },
          cost       : { xp: 300, cristales: 4 },
          unlocked   : false,
        },
        {
          id         : 'marcado_mika',
          name       : 'Marcado',
          icon       : '🔴',
          desc       : 'Marca al objetivo: recibe 40% más de daño por 8 segundos.',
          effect     : { type: 'debuff', damageAmp: 0.4, duration: 8 },
          cost       : { xp: 300, cristales: 4 },
          unlocked   : false,
        },
        {
          id         : 'vision_tactica_mika',
          name       : 'Visión Táctica',
          icon       : '👁️',
          desc       : 'Revela posición de enemigos y aumenta precisión por 12s.',
          effect     : { type: 'utility', revealDuration: 12, accuracyBonus: 0.2 },
          cost       : { xp: 300, cristales: 4 },
          unlocked   : false,
        },
      ],
      nv3: [
        {
          id         : 'golpe_cargado_mika',
          name       : 'Golpe Cargado',
          icon       : '🎯',
          desc       : 'Flecha cargada de máximo poder que aturde al impacto.',
          effect     : { type: 'damage', multiplier: 2.8, stunDuration: 2 },
          cost       : { xp: 600, cristales: 6 },
          unlocked   : false,
        },
        {
          id         : 'zona_peligro',
          name       : 'Zona de Peligro',
          icon       : '⚠️',
          desc       : 'Crea una zona que ralentiza y daña a los enemigos dentro.',
          effect     : { type: 'zone', radius: 4, slowPct: 0.4, tickDamage: 0.3, duration: 6 },
          cost       : { xp: 600, cristales: 6 },
          unlocked   : false,
        },
        {
          id         : 'coordinacion',
          name       : 'Coordinación',
          icon       : '🤝',
          desc       : 'Sincroniza con Kael: el siguiente ataque de Kael hace 80% más de daño.',
          effect     : { type: 'buff_ally', damageAmp: 0.8, duration: 5 },
          cost       : { xp: 600, cristales: 6 },
          unlocked   : false,
        },
      ],
      arcano: [
        {
          id         : 'tormenta_flechas_mika',
          name       : 'Tormenta de Flechas',
          icon       : '🌪️',
          desc       : 'Invoca una tormenta de flechas sobre el campo de batalla.',
          effect     : { type: 'damage_all', projectiles: 20, multiplier: 0.8 },
          cost       : { xp: 1200, cristales: 10 },
          unlocked   : false,
        },
        {
          id         : 'purificacion',
          name       : 'Purificación',
          icon       : '✨',
          desc       : 'Cura a Kael y Mika un 40% de HP y elimina estados negativos.',
          effect     : { type: 'heal_party', healPct: 0.4, cleanse: true },
          cost       : { xp: 1200, cristales: 10 },
          unlocked   : false,
        },
        {
          id         : 'flecha_destino',
          name       : 'Flecha del Destino',
          icon       : '🌟',
          desc       : 'Flecha guiada que siempre impacta y hace daño crítico garantizado.',
          effect     : { type: 'damage', multiplier: 5.0, guaranteed_crit: true, homing: true },
          cost       : { xp: 1200, cristales: 10 },
          unlocked   : false,
        },
      ],
    },
  },
};

// ── Helpers ───────────────────────────────────────────────────────────────

export function getTreeKey(charId, weapon) {
  return `${charId}_${weapon}`;
}

export function getTree(charId, weapon) {
  return WEAPON_TREES[getTreeKey(charId, weapon)] ?? null;
}

export function getLayerOrder() {
  return ['basico', 'nv1', 'nv2', 'nv3', 'arcano'];
}

// Cristal requerido por arma
export const WEAPON_CRYSTAL_MAP = {
  katana: 'cristalKatana',
  sword : 'cristalEspada',
  magic : 'cristalMagia',
  bow   : 'cristalArco',
};

// Colores de rareza (mantenidos para compatibilidad)
export const RARITY_COLORS = {
  common   : '#aaaaaa',
  rare     : '#4488ff',
  epic     : '#aa44ff',
  legendary: '#ffaa00',
};

export const DEFAULT_UNLOCKED = {
  magic : ['fire', 'ice', 'plant', 'wind'],
  katana: ['speed', 'shadow', 'storm', 'honor'],
  sword : ['strength', 'defense', 'battle', 'execution'],
  bow   : ['precision', 'poison', 'rain', 'agility'],
};

// SKILL_DATA mantenido para compatibilidad con sistemas existentes
export const SKILL_DATA = {
  magic : { label: 'Magia',  subtypes: {} },
  katana: { label: 'Katana', subtypes: {} },
  sword : { label: 'Espada', subtypes: {} },
  bow   : { label: 'Arco',   subtypes: {} },
};
