/**
 * data/storyEvents.js — Escenas narrativas Fase 1
 * Usa NarrativeSystem (core/narrative.js)
 *
 * USO desde game.html:
 *   import { STORY_EVENTS } from './data/storyEvents.js';
 *   narrative.play(STORY_EVENTS.escena05_guardia, () => {
 *     narrative.play(STORY_EVENTS.escena06_ironfell);
 *   });
 */

export const STORY_EVENTS = {

  // ─────────────────────────────────────────────
  // ESCENA 01 — Despertar en el bosque
  // ─────────────────────────────────────────────
  escena01_despertar: [
    { type: 'fade', color: '#000', duration: 1200 },
    { type: 'title', text: 'Escena 01', sub: 'Despertar' },
    { type: 'narration', text: 'Tierra húmeda. Olor a pino y barro. El sonido de pájaros que no reconoces.' },
    { type: 'narration', text: 'Abres los ojos. Estás en un bosque.' },
    { type: 'dialogue', speaker: 'protagonist', text: '¿Dónde...?' },
    { type: 'narration', text: 'Tu ropa está intacta. El frío de la mañana muerde los dedos. No hay heridas — no hay nada que explique cómo llegaste aquí.' },
    { type: 'dialogue', speaker: 'protagonist', text: 'Bien. Primero: levantarme. Después: entender.' },
    { type: 'action', fn: (nar) => nar.setFlag('escena01_done', true) },
  ],

  // ─────────────────────────────────────────────
  // ESCENA 02 — Primer día, supervivencia
  // ─────────────────────────────────────────────
  escena02_supervivencia: [
    { type: 'title', text: 'Escena 02', sub: 'Día 1 — Greymantle' },
    { type: 'narration', text: 'El bosque de Greymantle no es hostil — pero tampoco es seguro. Las criaturas se alejan si te mueves despacio. Las que no lo hacen, aprenden.' },
    { type: 'dialogue', speaker: 'protagonist', text: 'Necesito agua. Fuego. Saber dónde estoy.' },
    { type: 'narration', text: 'Encuentras un arroyo. El agua es clara. Eso es suficiente por ahora.' },
    { type: 'narration', text: 'Mientras sigues el arroyo hacia el norte, algo cruza el camino delante de ti — pequeño, verde, imposiblemente rápido. Un conejo. Pero no exactamente un conejo.' },
    { type: 'dialogue', speaker: 'protagonist', text: '...¿Qué eres tú?' },
    { type: 'narration', text: 'Se detiene. Te mira. Después sale corriendo hacia el norte. Por alguna razón, lo sigues.' },
    { type: 'action', fn: (nar) => nar.setFlag('vio_conejo_verde', true) },
  ],

  // ─────────────────────────────────────────────
  // ESCENA 03 — Primera noche
  // ─────────────────────────────────────────────
  escena03_primera_noche: [
    { type: 'title', text: 'Escena 03', sub: 'Noche 1 — Greymantle' },
    { type: 'narration', text: 'Construyes un refugio básico antes de que caiga el sol. No es gran cosa — cuatro palos y hojas — pero es tuyo.' },
    { type: 'dialogue', speaker: 'protagonist', text: 'Colombia. El bus. El tipo con la pistola.' },
    { type: 'narration', text: 'Lo repasas en orden. El atraco. La bala. El pasillo blanco. La mujer que no era una mujer.' },
    { type: 'dialogue', speaker: 'protagonist', text: '"Élite", dijo. Menos del uno por ciento.' },
    { type: 'narration', text: 'Lo que sea que eso signifique, estás aquí. Y por ahora, aquí es suficiente.' },
    { type: 'narration', text: 'Duermes. Sueñas con el pasillo blanco. Con ella. Con una pregunta que no recuerdas haber respondido.' },
    { type: 'fade', color: '#000', duration: 1000 },
    { type: 'action', fn: (nar) => nar.setFlag('noche1_done', true) },
  ],

  // ─────────────────────────────────────────────
  // ESCENA 04 — Descubrir Ironfell
  // ─────────────────────────────────────────────
  escena04_ironfell_vista: [
    { type: 'fade', color: '#000', duration: 800 },
    { type: 'title', text: 'Escena 04', sub: 'Día 2 — Borde del bosque' },
    { type: 'narration', text: 'Al borde del bosque, el terreno se abre. Y ahí está.' },
    { type: 'narration', text: 'Una ciudad. Muros de piedra oscura. Torres. Humo de chimeneas. El sonido lejano de metal contra metal.' },
    { type: 'dialogue', speaker: 'protagonist', text: 'Gente.' },
    { type: 'narration', text: 'No lo dices como alivio. Lo dices como dato. Gente significa preguntas que no sabes responder. Pero también significa comida, refugio y, quizás, respuestas.' },
    { type: 'dialogue', speaker: 'protagonist', text: 'Está bien. Vamos.' },
  ],

  // ─────────────────────────────────────────────
  // ESCENA 05 — El guardia
  // ─────────────────────────────────────────────
  escena05_guardia: [
    { type: 'title', text: 'Escena 05', sub: 'Puerta norte — Ironfell' },
    { type: 'dialogue', speaker: 'guardia', stage: '(mano en la empuñadura, sin sacarla)', text: 'Alto ahí. ¿De dónde vienes? No te he visto por aquí antes.' },
    { type: 'dialogue', speaker: 'protagonist', text: 'Del bosque. Llegué ayer. Me perdí.' },
    { type: 'dialogue', speaker: 'guardia', text: '¿Solo? ¿Por Greymantle?' },
    { type: 'dialogue', speaker: 'protagonist', text: 'Sí.' },
    { type: 'dialogue', speaker: 'guardia', stage: '(pausa, evaluando)', text: 'La gente que entra sola por Greymantle normalmente no sale entera. ¿Tienes magia?' },
    {
      type: 'choice',
      prompt: '¿Qué responde el protagonista?',
      options: [
        {
          label: '"Sí. Algo tengo."',
          value: 'A',
          flag: { key: 'admitted_magic', value: true },
          then: [
            { type: 'dialogue', speaker: 'guardia', text: 'Hmm. Tendrás que registrarte con el consejo. Pero puedes pasar.' },
            { type: 'dialogue', speaker: 'guardia', stage: '(más bajo, casi para sí mismo)', text: 'Hace tiempo no veíamos un mago que llegara caminando.' },
          ]
        },
        {
          label: '"No lo sé. Nunca lo probé."',
          value: 'B',
          flag: { key: 'admitted_magic', value: false },
          then: [
            { type: 'dialogue', speaker: 'guardia', text: 'Raro. Pero bien. Puedes entrar.' },
            { type: 'dialogue', speaker: 'guardia', stage: '(mirándote una vez más)', text: 'Mantente alejado de los barrios del norte por la noche. Los primeros días.' },
          ]
        },
      ]
    },
    { type: 'dialogue', speaker: 'protagonist', text: 'Entendido.' },
    { type: 'action', fn: (nar) => nar.setFlag('escena05_done', true) },
  ],

  // ─────────────────────────────────────────────
  // ESCENA 06 — Exploración libre de Ironfell
  // Trigger: automático al entrar a la ciudad
  // ─────────────────────────────────────────────
  escena06_entrada_ironfell: [
    { type: 'title', text: 'Escena 06', sub: 'Ironfell — Exploración libre' },
    { type: 'narration', text: 'Ironfell no te espera. Ya existía antes de que llegaras y lo sabe.' },
    { type: 'narration', text: 'La plaza principal está llena a esta hora. Enanos, humanos, elfos, draconoides — todos con cosas que hacer.' },
    { type: 'dialogue', speaker: 'protagonist', text: 'Bien. Primero: entender el lugar. Después: encontrar a quien mande.' },
    { type: 'action', fn: (nar) => {
      nar.setFlag('ironfell_desbloqueada', true);
      // Aquí se habilitaría la exploración libre en el gameloop
    }},
  ],

  // ─────────────────────────────────────────────
  // REACCIONES DE NPCs según elección del guardia
  // Se llaman individualmente cuando el jugador se acerca
  // ─────────────────────────────────────────────
  npc_vendedora_elfa_A: [
    { type: 'dialogue', speaker: 'guardia', text: 'Dicen que tienes magia. Interesante.' },
  ],
  npc_vendedora_elfa_B: [
    { type: 'dialogue', speaker: 'guardia', text: 'Ropa rara. ¿Eres de las tierras del este?' },
  ],
  npc_enano_herrero_A: [
    { type: 'dialogue', speaker: 'guardia', text: 'Un mago. Hace tiempo no veía uno por aquí.' },
  ],
  npc_enano_herrero_B: [
    { type: 'dialogue', speaker: 'guardia', text: 'Nuevo en el pueblo. Suerte que llegaste antes del invierno.' },
  ],

  // ─────────────────────────────────────────────
  // ESCENA 07 — Los tres generales
  // Trigger: acercarse menos de 5u a la sala de generales
  // ─────────────────────────────────────────────
  escena07_generales: [
    { type: 'fade', color: '#000', duration: 600 },
    { type: 'title', text: 'Escena 07', sub: 'Sala de generales — Ironfell' },
    { type: 'narration', text: 'La sala huele a piedra vieja y cera de vela. Mapas en las paredes. Una mesa larga en el centro con marcas de uso.' },
    { type: 'narration', text: 'Theron ya está ahí — de pie, mirando un mapa. Se voltea al escucharte entrar.' },
    { type: 'dialogue', speaker: 'theron', stage: '(con una sonrisa breve, no forzada)', text: 'Así que tú eres el que llegó por Greymantle.' },
    { type: 'dialogue', speaker: 'protagonist', text: 'Sí.' },
    { type: 'dialogue', speaker: 'theron', text: 'Theron. General del consejo — aunque ese título dice más de lo que hace. Siéntate.' },
    { type: 'dialogue', speaker: 'theron', text: '¿Cómo sobreviviste el bosque norte?' },
    {
      type: 'choice',
      prompt: '¿Qué responde el protagonista?',
      options: [
        {
          label: '"Tuve suerte."',
          value: 'suerte',
          then: [
            { type: 'dialogue', speaker: 'theron', stage: '(sonríe)', text: 'La suerte es subestimada. La mayoría de los generales que conozco llegaron aquí con suerte.' },
          ]
        },
        {
          label: '"No lo sé todavía."',
          value: 'no_se',
          then: [
            { type: 'dialogue', speaker: 'theron', stage: '(asiente, más serio)', text: 'Respuesta honesta. Me gustan las respuestas honestas.' },
          ]
        },
      ]
    },
    { type: 'narration', text: 'La puerta se abre sin que nadie llame.' },
    { type: 'dialogue', speaker: 'aelith', stage: '(desde la puerta, sin entrar del todo, evaluándote)', text: 'Así que tienes magia.' },
    { type: 'dialogue', speaker: 'protagonist', text: '...' },
    { type: 'dialogue', speaker: 'aelith', text: 'No es una pregunta.' },
    { type: 'narration', text: 'Se coloca en una esquina. No se acerca a la mesa. No hace más preguntas. Simplemente observa.' },
    { type: 'narration', text: 'Después entra Korrath.' },
    { type: 'narration', text: 'La sala cambia cuando entra. No hace nada — simplemente ocupa el espacio de una forma diferente. Te mira fijo durante tres segundos sin decir nada.' },
    {
      type: 'choice',
      prompt: '¿Qué hace el protagonista?',
      options: [
        {
          label: '(Sostener la mirada)',
          value: 'sostener',
          flag: { key: 'korrath_respeto', value: true },
          then: [
            { type: 'dialogue', speaker: 'korrath', stage: '(asiente, una sola vez)', text: '...' },
            { type: 'narration', text: 'No necesita decir nada más. Algo quedó establecido.' },
          ]
        },
        {
          label: '(Apartar la vista)',
          value: 'apartar',
          flag: { key: 'korrath_respeto', value: false },
          then: [
            { type: 'narration', text: 'Korrath no reacciona. Se sienta. Theron llena el silencio.' },
          ]
        },
      ]
    },
    { type: 'dialogue', speaker: 'theron', stage: '(con tono ligero, rompiendo la tensión)', text: 'Bien. Ahora que nos conocemos — ¿tienes hambre? Porque yo sí.' },
    { type: 'narration', text: 'Aelith pone los ojos en blanco. Korrath no reacciona. Pero la tensión se rompe.' },
    { type: 'fade', color: '#000', duration: 800 },
    { type: 'title', text: 'Noche 2', sub: 'Ironfell' },
    { type: 'action', fn: (nar) => {
      nar.setFlag('escena07_done', true);
      nar.setFlag('checkpoint_noche2', true);
      // Aquí se guardaría el checkpoint
    }},
  ],

  // ─────────────────────────────────────────────
  // ESCENA 08 — El mirador — Cierre de Fase 1
  // Trigger: día 3, amanecer, trigger automático
  // ─────────────────────────────────────────────
  escena08_mirador: [
    { type: 'fade', color: '#1a1200', duration: 1000 },
    { type: 'title', text: 'Escena 08', sub: 'Día 3 — Amanecer — El mirador' },
    { type: 'narration', text: 'El mirador más alto de Ironfell. La ciudad abajo todavía duerme. A lo lejos, las montañas. Y en algún lugar entre medio, Greymantle.' },
    { type: 'narration', text: 'Theron llega sin hacer ruido. Se coloca a tu lado y mira lo mismo que tú.' },
    { type: 'dialogue', speaker: 'theron', text: 'Buenos días.' },
    { type: 'dialogue', speaker: 'protagonist', text: 'Buenos días.' },
    { type: 'wait', ms: 800 },
    { type: 'dialogue', speaker: 'theron', text: 'La ciudad parece diferente desde aquí. Más manejable.' },
    { type: 'dialogue', speaker: 'protagonist', text: '¿Cuánto tiempo llevas aquí?' },
    { type: 'dialogue', speaker: 'theron', text: 'Dieciséis años. Ya no la veo — la conozco. Son cosas distintas.' },
    { type: 'dialogue', speaker: 'protagonist', text: '¿Qué hay al norte de las montañas?' },
    { type: 'dialogue', speaker: 'theron', stage: '(pausa breve)', text: 'Cosas que todavía no tienes que saber. Pero llegarás a ellas.' },
    { type: 'dialogue', speaker: 'protagonist', text: 'Necesito un lugar donde quedarme. Y algo que hacer.' },
    { type: 'dialogue', speaker: 'theron', text: 'Eso lo arreglo.' },
    { type: 'dialogue', speaker: 'theron', stage: '(sin voltear, mirando la ciudad)', text: 'No sé qué eres todavía. Nadie que llega por Greymantle solo es ordinario. Pero tampoco voy a pedirte que lo expliques antes de que tú mismo lo entiendas.' },
    { type: 'dialogue', speaker: 'protagonist', text: 'Me quedo.' },
    { type: 'narration', text: 'No lo dices como decisión épica. Lo dices como algo que ya sabías.' },
    { type: 'narration', text: 'Theron asiente. La ciudad empieza a despertar abajo.' },
    { type: 'fade', color: '#000', duration: 1500 },
    { type: 'action', fn: (nar) => {
      // Desbloqueos al completar Fase 1
      nar.setFlag('fase1_completa', true);
      nar.setFlag('construccion_desbloqueada', true);
      nar.setFlag('mapa_ironfell_revelado', true);
      nar.setFlag('relaciones_activas', true);
      nar.setFlag('crafteo_avanzado', true);
      // Guardar en localStorage
      try {
        const save = JSON.parse(localStorage.getItem('ashes_progression') || '{}');
        save.storyFlags = nar._flags;
        save.fase1_completa = true;
        localStorage.setItem('ashes_progression', JSON.stringify(save));
      } catch(e) { console.warn('[Narrative] Error al guardar Fase 1:', e); }
    }},
    { type: 'title', text: 'Fin de Fase 1', sub: 'Aeltherion te espera' },
  ],

};

// ─────────────────────────────────────────────
// HELPER — obtener reacción de NPC según flag
// Uso: getNPCReaction(narrative, 'vendedora_elfa')
// ─────────────────────────────────────────────
export function getNPCReaction(narrative, npcKey) {
  const opcion = narrative.getFlag('admitted_magic') ? 'A' : 'B';
  return STORY_EVENTS[`npc_${npcKey}_${opcion}`] || null;
  }
