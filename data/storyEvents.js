
/**
 * data/storyEvents.js — Escenas Arco 1
 * Requiere: core/narrative.js
 */

export const STORY_EVENTS = {

  prologo: [
    { type: 'fade', color: '#000', duration: 1000 },
    { type: 'narration', text: 'El protagonista está en la parte trasera del bus. Último día antes del vuelo. Iba a festejar con sus amigos esa noche. Todo estaba bien.' },
    { type: 'narration', text: 'El bus frena de golpe. No es una parada normal.' },
    { type: 'narration', text: 'Dos hombres encapuchados. Armas visibles. Los pasajeros se congelan.' },
    { type: 'dialogue', speaker: 'narrador', stage: '(gritando, cámara inestable)', text: '¡Todo el mundo quieto! ¡Manos donde las vea! ¡Esto es un atraco!' },
    { type: 'narration', text: 'El protagonista mira el tiquete. La mochila. El reloj. Años de trabajo. La fiesta de esta noche. El vuelo de mañana.' },
    { type: 'dialogue', speaker: 'narrador', stage: '(acercándose, apuntando directo)', text: 'Tú. La mochila. Ya.' },
    { type: 'narration', text: 'El protagonista no la suelta. Un segundo de duda — uno solo. Suficiente.' },
    { type: 'fade', color: '#000', duration: 2000 },
    { type: 'wait', ms: 2000 },
    { type: 'fade', color: '#ffffff', duration: 1500 },
    { type: 'dialogue', speaker: 'protagonist', stage: '(mirando alrededor, desorientado)', text: '¿Qué...? ¿Dónde...?' },
    { type: 'narration', text: 'Una presencia. No llega caminando — simplemente está ahí. Sor. Una figura de luz blanca sin forma fija.' },
    { type: 'dialogue', speaker: 'sor', text: 'Bienvenido. Llevas tiempo sin estar consciente de mí, pero yo sí he estado consciente de ti.' },
    { type: 'dialogue', speaker: 'protagonist', stage: '(frunce el ceño)', text: '¿Perdón? ¿Quién eres? ¿Dónde estoy? ¿Qué fue lo que pasó en el bus?' },
    { type: 'dialogue', speaker: 'sor', text: 'Eso ya no importa.' },
    { type: 'dialogue', speaker: 'protagonist', stage: '(con calma tensa — no grita, pero no cede)', text: 'A mí sí me importa. Estaba en un bus. Había un robo. Y ahora estoy aquí, en... esto. ¿Qué es "esto", exactamente?' },
    { type: 'dialogue', speaker: 'sor', stage: '(sin inmutarse)', text: 'Un espacio entre lo que eras y lo que serás. No tienes acceso a lo que pasó porque en este momento no es relevante para lo que viene.' },
    { type: 'dialogue', speaker: 'protagonist', stage: '(larga pausa. La mira fijo.)', text: '¿Estoy muerto?' },
    { type: 'dialogue', speaker: 'sor', text: 'Sí.' },
    { type: 'narration', text: 'Silencio. El protagonista lo procesa. No llora. No entra en pánico. Solo asiente despacio.' },
    { type: 'dialogue', speaker: 'protagonist', text: 'Okay.' },
    { type: 'dialogue', speaker: 'protagonist', stage: '(pausa)', text: '¿Y tú qué quieres de mí?' },
    { type: 'dialogue', speaker: 'sor', text: 'Enviarte a otro mundo. Uno que necesita alguien como tú.' },
    { type: 'dialogue', speaker: 'protagonist', stage: '(sin cambiar la expresión)', text: '¿Y por qué yo?' },
    { type: 'dialogue', speaker: 'sor', text: 'Porque observé a muchos. Y tú eres el tipo de persona que actúa con firmeza sin necesitar hacerle daño a nadie para lograrlo. Eso es más difícil de encontrar de lo que crees.' },
    { type: 'dialogue', speaker: 'protagonist', stage: '(con un tono completamente plano)', text: 'Me estuviste observando.' },
    { type: 'dialogue', speaker: 'sor', text: 'Sí.' },
    { type: 'dialogue', speaker: 'protagonist', text: '¿Cuánto tiempo?' },
    { type: 'dialogue', speaker: 'sor', text: 'El suficiente.' },
    { type: 'dialogue', speaker: 'protagonist', stage: '(suspira)', text: 'Eso es raro. Pero bueno. ¿Y qué me das para ir a este otro mundo? ¿Poderes? ¿Una espada legendaria? ¿Algo?' },
    { type: 'narration', text: 'Aparece una mochila en el suelo frente al protagonista. La levanta. La abre. Comida para tres días. Un cuchillo.' },
    { type: 'dialogue', speaker: 'protagonist', stage: '(la mira. Mira a Sor. Vuelve a mirar la mochila.)', text: '¿En serio?' },
    { type: 'dialogue', speaker: 'sor', text: 'El resto depende de ti.' },
    { type: 'dialogue', speaker: 'protagonist', stage: '(se cuelga la mochila. Una pausa larga.)', text: '¿Hay algo más que deba saber antes de que me mandes?' },
    { type: 'dialogue', speaker: 'sor', text: 'Hay un conflicto. Otros antes que tú intentaron resolverlo. No pudieron.' },
    { type: 'dialogue', speaker: 'sor', stage: '(pausa)', text: 'Tú puedes.' },
    { type: 'dialogue', speaker: 'protagonist', stage: '(con total sequedad)', text: 'Qué motivador. Gracias.' },
    { type: 'narration', text: 'Sor no responde. La luz del pasaje aumenta lentamente hasta cubrirlo todo.' },
    { type: 'fade', color: '#ffffff', duration: 1500 },
    { type: 'action', fn: (nar) => nar.setFlag('prologo_done', true) },
  ],

  escena01_despertar: [
    { type: 'fade', color: '#000', duration: 1000 },
    { type: 'title', text: 'Escena 01', sub: 'Despertar' },
    { type: 'narration', text: 'El protagonista abre los ojos. Respira con dificultad. Mira sus manos.' },
    { type: 'dialogue', speaker: 'protagonist', stage: '(voz ronca, casi un susurro)', text: 'Frío... tierra...' },
    { type: 'narration', text: 'Se incorpora. Mira las manos. Las cierra. Las abre. Todo se mueve. No está soñando.' },
    { type: 'dialogue', speaker: 'protagonist', text: 'Esto no es... ningún hospital.' },
    { type: 'dialogue', speaker: 'protagonist', stage: '(en voz baja, procesando)', text: 'Ese tipo... Sor. Dijo que me iba a enviar a otro mundo.' },
    { type: 'dialogue', speaker: 'protagonist', stage: '(pausa)', text: 'Lo dijo completamente en serio.' },
    { type: 'narration', text: 'Silencio. El protagonista mira el cielo unos segundos. Luego suelta una pequeña risa — no de alegría, sino de alguien que acaba de aceptar algo absurdo.' },
    { type: 'dialogue', speaker: 'protagonist', stage: '(respira hondo)', text: 'Bueno. Supongo que lo primero es no morir. Otra vez.' },
    { type: 'action', fn: (nar) => nar.setFlag('escena01_done', true) },
  ],

  escena02_supervivencia: [
    { type: 'title', text: 'Escena 02', sub: 'Día 1 — Greymantle' },
    { type: 'dialogue', speaker: 'protagonist', stage: '(al tocar el árbol caído)', text: 'Madera seca. Bien, algo es algo.' },
    { type: 'dialogue', speaker: 'protagonist', stage: '(al ver la corriente de agua)', text: 'Agua. Parece limpia. En este mundo quién sabe, pero no tengo muchas opciones.' },
    { type: 'dialogue', speaker: 'protagonist', stage: '(si intenta entrar al bosque denso)', text: 'No. No sin saber qué hay ahí. Primero necesito pasar la noche.' },
    { type: 'narration', text: 'El protagonista trabaja solo. El sol de Solmara se mueve lento. Las sombras cambian. Poco a poco, un refugio mínimo toma forma entre los árboles.' },
    { type: 'wait', ms: 500 },
    { type: 'title', text: 'Día 2', sub: 'Solmara' },
    { type: 'narration', text: 'El protagonista abre la mochila. Cuenta las raciones. Una. Le queda una.' },
    { type: 'dialogue', speaker: 'protagonist', stage: '(mirando el bosque)', text: 'Necesito encontrar algo hoy.' },
    { type: 'narration', text: 'En el borde del bosque, algo se mueve. El protagonista se detiene.' },
    { type: 'dialogue', speaker: 'protagonist', stage: '(mirando entre los árboles)', text: '¿Verde? ¿Qué clase de conejo es verde?' },
    { type: 'narration', text: 'El protagonista lo sigue. El bosque se hace más espeso, luego más escaso. El terreno sube. Los árboles se separan.' },
    { type: 'narration', text: 'Frente al protagonista: una planicie amplia en la ladera de la montaña de Greymantle. Hierba alta, tierra firme. Silencioso. Enorme. De nadie.' },
    { type: 'dialogue', speaker: 'protagonist', stage: '(mirando el espacio, sin moverse)', text: 'Esto es... grande.' },
    { type: 'dialogue', speaker: 'protagonist', stage: '(mira hacia abajo — solo niebla y nubes)', text: 'Nadie sabe que esto existe.' },
    { type: 'dialogue', speaker: 'protagonist', stage: '(pausa larga. Mira el conejo. Mira la planicie.)', text: 'Bien.' },
    { type: 'narration', text: 'El conejo sigue quieto. El protagonista recuerda que tiene hambre. Saca el cuchillo.' },
    { type: 'action', fn: (nar) => { nar.setFlag('vio_conejo_verde', true); nar.setFlag('planicie_descubierta', true); } },
  ],

  escena03_primera_noche: [
    { type: 'title', text: 'Escena 03', sub: 'Noche 1 — Greymantle' },
    { type: 'narration', text: 'El protagonista mira las dos lunas. Tarda varios segundos. Las procesa.' },
    { type: 'dialogue', speaker: 'protagonist', text: 'Dos lunas.' },
    { type: 'dialogue', speaker: 'protagonist', stage: '(larga pausa)', text: 'Definitivamente no estoy en casa.' },
    { type: 'narration', text: '"¿Qué se supone que hago ahora? Sor dijo que había un conflicto. Que las otras personas que mandó antes fracasaron. Todas."' },
    { type: 'dialogue', speaker: 'protagonist', stage: '(en voz muy baja, casi para las llamas)', text: '¿Por qué yo? ¿Qué tengo yo que no tuvieron ellos?' },
    { type: 'narration', text: 'No hay respuesta. Solo el chisporrotear del fuego y el sonido extraño del bosque nocturno de Solmara.' },
    { type: 'dialogue', speaker: 'protagonist', stage: '(se recuesta, mira las estrellas)', text: 'Bueno. Una cosa a la vez.' },
    { type: 'narration', text: 'Cierra los ojos.' },
    { type: 'fade', color: '#000', duration: 1000 },
    { type: 'title', text: 'Día 2', sub: 'Solmara' },
    { type: 'action', fn: (nar) => nar.setFlag('noche1_done', true) },
  ],

  escena04_descubrimiento: [
    { type: 'title', text: 'Escena 04', sub: 'Día 2 — Borde del bosque' },
    { type: 'dialogue', speaker: 'protagonist', stage: '(al encontrar el sendero)', text: '¿Un camino? Alguien lo hizo. No apareció solo.' },
    { type: 'narration', text: 'El jugador sigue el camino. El bosque se va abriendo lentamente. La luz aumenta. Y entonces...' },
    { type: 'narration', text: 'Ironfell: una ciudad construida entre las faldas de las montañas. Humo de chimeneas. Muros de piedra con runas. Mercado activo. Gente moviéndose.' },
    { type: 'dialogue', speaker: 'protagonist', stage: '(en voz baja, sin moverse)', text: '...Hay gente aquí.' },
    { type: 'dialogue', speaker: 'protagonist', stage: '(pausa. Una pequeña sonrisa involuntaria.)', text: 'Sor no me dijo nada de esto.' },
  ],

  escena05_guardia: [
    { type: 'title', text: 'Escena 05', sub: 'Puerta norte — Ironfell' },
    { type: 'dialogue', speaker: 'yuna', stage: '(mano en la empuñadura, sin sacarla)', text: 'Alto. ¿De dónde vienes? No te he visto por aquí.' },
    { type: 'dialogue', speaker: 'protagonist', stage: '(un segundo de pausa — procesando)', text: 'Del bosque. Llegué hace unos días.' },
    { type: 'dialogue', speaker: 'yuna', text: '¿Solo? ¿Por el bosque norte?' },
    { type: 'dialogue', speaker: 'yuna', stage: '(frunce el ceño)', text: 'La gente que cruza el bosque norte normalmente no llega entera. ¿Tienes magia?' },
    {
      type: 'choice',
      prompt: '¿Qué responde el protagonista?',
      options: [
        {
          label: '"Sí. Algo tengo."',
          value: 'A',
          flag: { key: 'admitted_magic', value: true },
          then: [
            { type: 'dialogue', speaker: 'yuna', stage: '(levanta una mano hacia adentro sin apartar los ojos del protagonista)', text: '¡Maren! Ven un momento. Trae el medidor.' },
            { type: 'dialogue', speaker: 'yuna', stage: '(al protagonista, con más respeto pero también más precaución)', text: 'Si de verdad tienes magia y sobreviviste al bosque norte... eso no es común. Espera aquí.' },
          ]
        },
        {
          label: '"No lo sé. Nunca lo había probado."',
          value: 'B',
          flag: { key: 'admitted_magic', value: false },
          then: [
            { type: 'dialogue', speaker: 'yuna', stage: '(suspira, se hace a un lado)', text: 'Sin magia, sin armas visibles, sin amenaza aparente. Puedes entrar. Pero te presento con Shin primero — él decide qué hacer contigo.' },
            { type: 'dialogue', speaker: 'yuna', stage: '(en voz más baja, casi amistoso)', text: 'Y come algo. Pareces recién caído del cielo.' },
          ]
        },
      ]
    },
    { type: 'action', fn: (nar) => nar.setFlag('escena05_done', true) },
  ],

  escena06_entrada_ironfell: [
    { type: 'title', text: 'Escena 06', sub: 'Ironfell — Exploración libre' },
    { type: 'narration', text: 'El protagonista entra a Ironfell por primera vez. La ciudad es pequeña pero viva.' },
    { type: 'action', fn: (nar) => nar.setFlag('ironfell_desbloqueada', true) },
  ],

  npc_vendedora_elfa: [
    { type: 'dialogue', speaker: 'narrador', stage: '(al pasar cerca)', text: 'Ropa rara. ¿Eres de las tierras del este?' },
  ],
  npc_enano_herrero: [
    { type: 'dialogue', speaker: 'narrador', stage: '(sin levantar la vista del yunque)', text: 'Nuevo en el pueblo. Suerte que llegaste antes del invierno.' },
  ],
  npc_nino_humano: [
    { type: 'dialogue', speaker: 'narrador', stage: '(acercándose con curiosidad descarada)', text: '¿Tú tienes magia? ¿Puedes hacer fuego? ¡Hazlo!' },
  ],

  escena07_generales: [
    { type: 'fade', color: '#000', duration: 600 },
    { type: 'title', text: 'Escena 07', sub: 'Sala de reunión — Ironfell' },
    { type: 'narration', text: 'Shin ya está ahí cuando el protagonista entra. Mika llega un minuto después, con cara de que preferiría estar en otra parte. Korrath casi no cabe por la puerta.' },
    { type: 'dialogue', speaker: 'shin', stage: '(se levanta, extiende la mano, sonrisa genuina)', text: 'Shin. Me encargo de las relaciones con los otros pueblos — o intento hacerlo. Bienvenido a Ironfell.' },
    { type: 'dialogue', speaker: 'shin', stage: '(pausa, más directo)', text: 'El guardia dijo que saliste del bosque norte sin un rasguño. ¿Cómo?' },
    { type: 'dialogue', speaker: 'protagonist', text: 'Honestamente... no estoy seguro todavía.' },
    { type: 'dialogue', speaker: 'mika', stage: '(desde la esquina, sin acercarse, evaluándolo)', text: 'Magia latente. Se nota. No la ha usado, o no sabe cómo usarla todavía.' },
    { type: 'dialogue', speaker: 'mika', stage: '(al protagonista, fría pero no hostil)', text: 'Mika. Si en algún momento decides que sabes lo que haces, avísame.' },
    { type: 'dialogue', speaker: 'korrath', stage: '(entra al salón, llena el espacio, voz como piedras rodando)', text: 'Korrath.' },
    { type: 'dialogue', speaker: 'korrath', stage: '(mira al protagonista un segundo, asiente)', text: 'Sobreviviste el bosque. Eso ya dice algo.' },
    { type: 'dialogue', speaker: 'korrath', stage: '(se sienta, la silla cruje)', text: 'El resto lo veremos en el campo.' },
    {
      type: 'choice',
      prompt: '¿Cómo reacciona el protagonista a Korrath?',
      options: [
        {
          label: '(Sostener la mirada)',
          value: 'sostener',
          flag: { key: 'korrath_respeto', value: true },
          then: [
            { type: 'narration', text: 'Korrath asiente una vez más. Algo quedó establecido sin palabras.' },
          ]
        },
        {
          label: '(Apartar la vista)',
          value: 'apartar',
          flag: { key: 'korrath_respeto', value: false },
          then: [
            { type: 'narration', text: 'Korrath no reacciona. Shin llena el silencio.' },
          ]
        },
      ]
    },
    { type: 'dialogue', speaker: 'shin', stage: '(con una sonrisa cómoda, rompiendo la tensión)', text: 'Bienvenido al equipo más raro de Solmara.' },
    { type: 'fade', color: '#000', duration: 800 },
    { type: 'action', fn: (nar) => {
      nar.setFlag('escena07_done', true);
      nar.setFlag('checkpoint_noche2', true);
    }},
  ],

  escena08_mirador: [
    { type: 'fade', color: '#1a1200', duration: 1000 },
    { type: 'title', text: 'Escena 08', sub: 'Día 3 — El mirador' },
    { type: 'dialogue', speaker: 'shin', text: '¿Dormiste?' },
    { type: 'dialogue', speaker: 'protagonist', stage: '(pausa, mirando el pueblo)', text: 'Algo. Este lugar... ¿cuánto tiempo lleva aquí?' },
    { type: 'dialogue', speaker: 'shin', text: 'Generaciones. Pero nunca terminó de crecer. El jefe anterior... digamos que no tenía las mejores prioridades.' },
    { type: 'dialogue', speaker: 'shin', stage: '(pausa)', text: 'La gente aquí tiene talento, recursos, voluntad. Solo faltaba alguien que supiera qué hacer con todo eso.' },
    { type: 'dialogue', speaker: 'protagonist', stage: '(sin apartar la vista del horizonte)', text: '¿Y creen que ese alguien soy yo?' },
    { type: 'dialogue', speaker: 'shin', stage: '(con honestidad tranquila)', text: 'No lo sé todavía. Pero apareciste del bosque norte con vida, sin magia entrenada, y tu primera pregunta fue sobre el pueblo — no sobre ti mismo.' },
    { type: 'dialogue', speaker: 'shin', stage: '(leve sonrisa)', text: 'Eso ya es más de lo que esperaba.' },
    { type: 'narration', text: 'El protagonista no responde. Sigue mirando Ironfell. Y algo en su expresión cambia, apenas perceptible.' },
    { type: 'dialogue', speaker: 'protagonist', stage: '(por fin, mirando la ciudad)', text: 'Necesito un lugar donde quedarme. Y algo que hacer mientras entiendo dónde estoy.' },
    { type: 'dialogue', speaker: 'shin', stage: '(asiente, sin promesas grandes)', text: 'Eso lo podemos arreglar.' },
    { type: 'fade', color: '#000', duration: 1500 },
    { type: 'action', fn: (nar) => {
      nar.setFlag('fase1_completa', true);
      nar.setFlag('construccion_desbloqueada', true);
      nar.setFlag('mapa_ironfell_revelado', true);
      nar.setFlag('relaciones_activas', true);
      try {
        const save = JSON.parse(localStorage.getItem('ashes_progression') || '{}');
        save.storyFlags = nar._flags;
        save.fase1_completa = true;
        localStorage.setItem('ashes_progression', JSON.stringify(save));
      } catch(e) { console.warn('[Narrative] Error guardando Fase 1:', e); }
    }},
    { type: 'title', text: 'Fin de Fase 1', sub: 'Lo que construye a partir de aquí es suyo.' },
  ],

  escena09_planicie: [
    { type: 'title', text: 'Escena 09', sub: 'Días 3–5 — La planicie' },
    { type: 'narration', text: 'Días pasan. El protagonista trabaja sin apuro. Lo que antes era una planicie vacía empieza a tener forma — pequeña, imperfecta, pero suya.' },
    { type: 'dialogue', speaker: 'protagonist', stage: '(mirando lo que ha construido, manos sucias)', text: 'No está mal. Para ser improvisado.' },
    { type: 'narration', text: 'En algún momento mientras trabaja — algo sale de sus manos que no debería salir. Un destello breve. Medio segundo. El protagonista para. Mira su mano. El efecto ya desapareció.' },
    { type: 'dialogue', speaker: 'protagonist', stage: '(mirando la mano, frunce el ceño)', text: '¿Qué fue eso?' },
    { type: 'dialogue', speaker: 'protagonist', stage: '(mira hacia el bosque, vuelve al trabajo)', text: '...Nada.' },
    { type: 'narration', text: 'Sigue trabajando. Pero algo quedó en el fondo de su cabeza.' },
    { type: 'action', fn: (nar) => nar.setFlag('magia_espontanea', true) },
  ],

  escena10_descubrimiento_ironfell: [
    { type: 'title', text: 'Escena 10', sub: 'Día 5 — El sendero' },
    { type: 'narration', text: 'Explorando más allá del bosque, el protagonista encuentra el sendero que lleva a Ironfell.' },
    { type: 'dialogue', speaker: 'protagonist', stage: '(en voz muy baja)', text: '...Hay gente aquí.' },
    { type: 'dialogue', speaker: 'protagonist', stage: '(pausa)', text: 'Sor definitivamente se olvidó de mencionar esto también.' },
  ],

  escena11_guardia_idioma: [
    { type: 'title', text: 'Escena 11', sub: 'Día 5 — La puerta norte' },
    { type: 'dialogue', speaker: 'yuna', stage: '(mano en la empuñadura, sin sacarla)', text: 'Alto. ¿De dónde vienes? No te he visto por aquí.' },
    { type: 'narration', text: 'El protagonista lo entiende. Perfectamente. Como si el guardia hubiera hablado en español toda la vida.' },
    { type: 'narration', text: '"Espera. ¿Lo estoy entendiendo? ¿Cómo lo estoy entendiendo?"' },
    { type: 'dialogue', speaker: 'protagonist', stage: '(un segundo de pausa — procesando)', text: 'Del bosque. Llegué hace unos días.' },
    { type: 'dialogue', speaker: 'protagonist', stage: '(en voz muy baja, casi para sí mismo)', text: 'Y aparentemente entiendo lo que dices. Interesante.' },
    { type: 'dialogue', speaker: 'yuna', stage: '(frunce el ceño)', text: '¿Estás bien?' },
    { type: 'dialogue', speaker: 'protagonist', text: 'Sí. Perdón. ¿Puedo entrar?' },
    { type: 'narration', text: '"Sor te dio la traducción pero se le olvidó mencionártelo. Típico."' },
    {
      type: 'choice',
      prompt: '¿Qué responde el protagonista?',
      options: [
        {
          label: '"Sí. Algo tengo."',
          value: 'A',
          flag: { key: 'admitted_magic', value: true },
          then: [
            { type: 'dialogue', speaker: 'yuna', stage: '(levanta una mano hacia adentro)', text: '¡Maren! Ven un momento. Trae el medidor.' },
            { type: 'dialogue', speaker: 'yuna', stage: '(con más respeto pero también más precaución)', text: 'Si de verdad tienes magia y sobreviviste al bosque norte... eso no es común. Espera aquí.' },
          ]
        },
        {
          label: '"No lo sé. Nunca lo había probado."',
          value: 'B',
          flag: { key: 'admitted_magic', value: false },
          then: [
            { type: 'dialogue', speaker: 'yuna', stage: '(suspira, se hace a un lado)', text: 'Sin magia, sin armas visibles. Puedes entrar. Pero te presento con Shin primero.' },
            { type: 'dialogue', speaker: 'yuna', stage: '(casi amistoso)', text: 'Y come algo. Pareces recién caído del cielo.' },
          ]
        },
      ]
    },
    { type: 'action', fn: (nar) => nar.setFlag('escena11_done', true) },
  ],

  escena12_mercado: [
    { type: 'title', text: 'Escena 12', sub: 'Ironfell — El mercado' },
    { type: 'narration', text: 'El mercado de Ironfell huele a cuero y especias y algo que el protagonista no puede identificar pero que le da hambre.' },
    { type: 'dialogue', speaker: 'narrador', stage: '(al ver que el protagonista se acerca con carne del bosque)', text: '¿Conejo verde? No es fácil de atrapar. ¿Cuánto quieres por él?' },
    { type: 'dialogue', speaker: 'protagonist', stage: '(mira la carne, mira al carnicero)', text: 'Honestamente no sé cuánto vale aquí.' },
    { type: 'dialogue', speaker: 'narrador', stage: '(una sonrisa — sabe que puede aprovecharse, pero no lo hace)', text: 'Justo entonces. Te doy precio justo. Aquí no estafamos a los que no conocen.' },
    { type: 'narration', text: 'Con algo de moneda encima, el mercado se abre de otra forma. El protagonista recorre los puestos. Elige según lo que necesita.' },
    { type: 'action', fn: (nar) => nar.setFlag('mercado_visitado', true) },
  ],

  escena13_planicie_herramientas: [
    { type: 'title', text: 'Escena 13', sub: 'Días 5–7 — De vuelta a la planicie' },
    { type: 'narration', text: 'El protagonista vuelve a su planicie con las herramientas nuevas. La diferencia es inmediata — lo que antes tardaba horas tarda minutos.' },
    { type: 'dialogue', speaker: 'protagonist', stage: '(mirando el pueblo al final del día, desde afuera)', text: 'Esto ya parece algo.' },
    { type: 'dialogue', speaker: 'protagonist', stage: '(pausa — se sienta en una roca, cansado)', text: 'No sé cómo se llama todavía. Pero es algo.' },
  ],

  escena14_academia: [
    { type: 'title', text: 'Escena 14', sub: 'Día 7 — Academia Veldris' },
    { type: 'narration', text: 'Al volver a Ironfell, algo que no había notado antes llama su atención — un edificio mediano, más iluminado que los demás.' },
    { type: 'narration', text: '"Academia Veldris."' },
    { type: 'dialogue', speaker: 'protagonist', stage: '(leyendo el letrero)', text: '¿Academia? ¿Aquí?' },
    { type: 'narration', text: 'Entra. La recepcionista lo ve llegar con la misma calma con la que ve llegar a todo el mundo.' },
    { type: 'dialogue', speaker: 'narrador', text: 'Bienvenido a la Academia Veldris. ¿Primera vez?' },
    { type: 'dialogue', speaker: 'protagonist', text: 'Sí. ¿Qué enseñan aquí exactamente?' },
    { type: 'dialogue', speaker: 'narrador', text: 'Tres áreas principales. Magia — teoría y práctica. Oficios — construcción, herrería, alquimia. Historia — el mundo, los conflictos, los pueblos.' },
    { type: 'dialogue', speaker: 'narrador', stage: '(pausa, lo mira)', text: 'Las inscripciones están abiertas. Son gratuitas.' },
    { type: 'dialogue', speaker: 'protagonist', stage: '(una pausa. La mira.)', text: '¿Gratis?' },
    { type: 'dialogue', speaker: 'narrador', text: 'Gratis.' },
    {
      type: 'choice',
      prompt: '¿En qué área te inscribes primero?',
      options: [
        {
          label: 'Magia',
          value: 'magia',
          flag: { key: 'academia_primera_area', value: 'magia' },
          then: [
            { type: 'dialogue', speaker: 'protagonist', stage: '(sin dudarlo más)', text: 'Me inscribo. En magia primero.' },
            { type: 'dialogue', speaker: 'protagonist', stage: '(casi como reflexión)', text: 'Tengo mis razones.' },
          ]
        },
        {
          label: 'Oficios',
          value: 'oficios',
          flag: { key: 'academia_primera_area', value: 'oficios' },
          then: [
            { type: 'dialogue', speaker: 'protagonist', text: 'Oficios. Necesito construir mejor.' },
          ]
        },
        {
          label: 'Historia',
          value: 'historia',
          flag: { key: 'academia_primera_area', value: 'historia' },
          then: [
            { type: 'dialogue', speaker: 'protagonist', text: 'Historia. Necesito entender dónde estoy.' },
          ]
        },
      ]
    },
    { type: 'action', fn: (nar) => nar.setFlag('academia_desbloqueada', true) },
  ],

  escena15_mika_mercado: [
    { type: 'title', text: 'Escena 15', sub: 'Día 8 — Mika en el mercado' },
    { type: 'dialogue', speaker: 'mika', stage: '(desde un puesto cercano, sin acercarse)', text: 'Tú. El del bosque norte.' },
    { type: 'dialogue', speaker: 'protagonist', stage: '(se voltea)', text: 'Mika.' },
    { type: 'dialogue', speaker: 'mika', text: '¿Cómo vas?' },
    { type: 'dialogue', speaker: 'protagonist', text: 'Bien. Construyendo. Aprendiendo cómo funciona esto.' },
    { type: 'dialogue', speaker: 'protagonist', stage: '(pausa)', text: '¿Y tú qué haces aquí?' },
    { type: 'dialogue', speaker: 'mika', text: 'Lo mismo que tú — lo que necesito.' },
    { type: 'dialogue', speaker: 'mika', stage: '(por fin lo mira directamente)', text: 'Si necesitas saber dónde están las cosas del pueblo, pregúntale a Shin. Él sabe dónde hay todo.' },
    { type: 'dialogue', speaker: 'mika', text: 'O pregúntame a mí. Si no estoy ocupada.' },
    { type: 'dialogue', speaker: 'protagonist', stage: '(con una leve sonrisa)', text: '¿Eso fue una oferta de ayuda?' },
    { type: 'dialogue', speaker: 'mika', stage: '(se da la vuelta para irse)', text: 'Fue información. Haz lo que quieras con ella.' },
    { type: 'narration', text: 'Se va sin mirar atrás. El protagonista la ve alejarse. Luego vuelve a sus compras.' },
    { type: 'action', fn: (nar) => nar.setFlag('mika_desbloqueada', true) },
    { type: 'title', text: 'Fin de Fase 2', sub: 'El pueblo existe. La Academia espera.' },
  ],

};

export function getNPCReaction(narrative, npcKey) {
  const conMagia = narrative.getFlag('admitted_magic');
  const variantes = {
    vendedora_elfa: {
      true:  [{ type: 'dialogue', speaker: 'narrador', text: 'Dicen que tienes magia. Interesante.' }],
      false: [{ type: 'dialogue', speaker: 'narrador', text: 'Ropa rara. ¿Eres de las tierras del este?' }],
    },
    enano_herrero: {
      true:  [{ type: 'dialogue', speaker: 'narrador', text: 'Un mago. Hace tiempo no veía uno por aquí.' }],
      false: [{ type: 'dialogue', speaker: 'narrador', text: 'Nuevo en el pueblo. Suerte que llegaste antes del invierno.' }],
    },
    nino_humano: {
      true:  [{ type: 'dialogue', speaker: 'narrador', text: '¡Muéstrame un hechizo! ¡Anda!' }],
      false: [{ type: 'dialogue', speaker: 'narrador', text: '¿Tú tienes magia? ¿Puedes hacer fuego? ¡Hazlo!' }],
    },
  };
  const set = variantes[npcKey];
  if (!set) return null;
  return set[String(conMagia)] ?? set['false'];
}
