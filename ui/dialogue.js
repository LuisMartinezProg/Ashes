// ui/tutorial.js — Tutorial con Lumi | Ashes of the Reborn | Valiant Gaming
//
// Sistema de tutorial contextual. Lumi (ser de luz) guía al jugador paso a paso.
// Los textos son placeholder — el contenido narrativo final se define después.
// La mecánica (cuándo aparece cada paso, cómo resalta botones, cómo se salta)
// es lo que este archivo implementa.

const LUMI_NAME  = '✨ LUMI';
const SAVE_KEY   = 'ashes_tutorial_done';
const STEP_DELAY = 800; // ms entre que se completa un paso y aparece el siguiente

// ── Pasos del tutorial ────────────────────────────────────────────────────
// trigger: cuándo se activa este paso (se evalúa en checkTriggers())
// lines  : lo que dice Lumi (placeholder, editable después)
// highlight: selector CSS del elemento a resaltar (opcional)

const STEPS = [
  {
    id       : 'move',
    lines    : [
      '¡Hola! Soy Lumi, tu guía en Aeltherion.',
      'Usa el joystick de la izquierda para moverte por el mundo.',
    ],
    highlight: null, // el joystick no tiene un selector fijo — se resalta por posición
    trigger  : 'auto', // aparece automáticamente al inicio
  },
  {
    id       : 'attack',
    lines    : [
      '¡Bien! Ahora prueba atacar con el botón naranja de la derecha.',
      'Encadena golpes para hacer un combo.',
    ],
    highlight: null,
    trigger  : 'moved', // se activa cuando el jugador se mueve por primera vez
  },
  {
    id       : 'skill',
    lines    : [
      '¡Excelente! También tienes habilidades especiales.',
      'Los botones azules cerca del ataque son tus skills — ¡prueba una!',
    ],
    highlight: null,
    trigger  : 'attacked',
  },
  {
    id       : 'energy',
    lines    : [
      'Las skills gastan energía — esa barra azul debajo de tu vida.',
      'Se recarga sola con el tiempo, y más rápido al atacar.',
    ],
    highlight: null,
    trigger  : 'usedSkill',
  },
  {
    id       : 'party',
    lines    : [
      '¡Atención! No estás solo — Mika te acompaña.',
      'Toca su carta en la esquina superior derecha para cambiar a ella.',
      'Si uno cae en combate, el otro toma el control automáticamente.',
    ],
    highlight: null,
    trigger  : 'nearEnemy',
  },
  {
    id       : 'switched',
    lines    : [
      'Cada personaje tiene su estilo — Kael es melee, Mika es arquera.',
      '¡Úsalos juntos para reacciones elementales!',
    ],
    highlight: null,
    trigger  : 'switched',
  },
  {
    id       : 'relic',
    lines    : [
      'Las reliquias son poderosas — cuando equipes una, verás este botón.',
      'Actívala en combate para potenciar tus ataques con energía elemental.',
    ],
    highlight: null,
    trigger  : 'hasRelic',
  },
  {
    id       : 'dungeon',
    lines    : [
      'Ves ese portal brillante a lo lejos? Es una mazmorra.',
      'Entra para enfrentar enemigos más fuertes y conseguir reliquias y botín.',
    ],
    highlight: null,
    trigger  : 'nearDungeon',
  },
  {
    id       : 'build',
    lines    : [
      'Por último — puedes construir tu propio pueblo.',
      'Recolecta madera y piedra, clava una bandera y empieza a construir.',
      '¡Eso es todo por ahora! Aeltherion te espera, Kael. ¡Mucha suerte! ✨',
    ],
    highlight: null,
    trigger  : 'nearBuild',
  },
];

export class TutorialSystem {
  constructor(dialogueUI) {
    this._dialogue    = dialogueUI;
    this._stepIdx     = 0;
    this._done        = false;
    this._stepActive  = false;
    this._flags       = {
      moved     : false,
      attacked  : false,
      usedSkill : false,
      nearEnemy : false,
      switched  : false,
      hasRelic  : false,
      nearDungeon: false,
      nearBuild : false,
    };

    // Si ya completó el tutorial antes, no hacer nada
    if (localStorage.getItem(SAVE_KEY) === '1') {
      this._done = true;
      return;
    }

    this._buildSkipBtn();
    this._buildLumiOrb();

    // Paso 1 es automático — aparece al inicio con un pequeño delay
    setTimeout(() => this._showStep(0), 1200);
  }

  // ── API pública: notificar eventos del juego ─────────────────────────────

  notifyMoved()       { this._setFlag('moved'); }
  notifyAttacked()    { this._setFlag('attacked'); }
  notifyUsedSkill()   { this._setFlag('usedSkill'); }
  notifyNearEnemy()   { this._setFlag('nearEnemy'); }
  notifySwitched()    { this._setFlag('switched'); }
  notifyHasRelic()    { this._setFlag('hasRelic'); }
  notifyNearDungeon() { this._setFlag('nearDungeon'); }
  notifyNearBuild()   { this._setFlag('nearBuild'); }

  isDone() { return this._done; }

  skip() {
    this._done = true;
    localStorage.setItem(SAVE_KEY, '1');
    this._skipBtn?.remove();
    this._lumiOrb?.remove();
    if (this._dialogue.isActive()) this._dialogue.closeDialogue();
  }

  // ── Internos ─────────────────────────────────────────────────────────────

  _setFlag(flag) {
    if (this._done || this._stepActive) return;
    if (this._flags[flag]) return; // ya activado
    this._flags[flag] = true;
    this._checkNext();
  }

  _checkNext() {
    if (this._done || this._stepActive) return;
    const next = STEPS[this._stepIdx];
    if (!next) return;
    if (next.trigger === 'auto') return; // los auto se muestran solos
    if (this._flags[next.trigger]) {
      setTimeout(() => this._showStep(this._stepIdx), STEP_DELAY);
    }
  }

  _showStep(idx) {
    if (this._done) return;
    const step = STEPS[idx];
    if (!step) return;

    this._stepActive = true;
    this._lumiOrb.style.display = 'flex';

    this._dialogue.openDialogue(
      LUMI_NAME,
      step.lines,
      () => {
        // onClose: paso completado
        this._stepActive = false;
        this._stepIdx    = idx + 1;

        if (this._stepIdx >= STEPS.length) {
          // Tutorial completo
          this._done = true;
          localStorage.setItem(SAVE_KEY, '1');
          this._skipBtn?.remove();
          this._lumiOrb.style.display = 'none';
        } else {
          // Verificar si el siguiente paso ya tiene su trigger listo
          // (puede pasar si el jugador fue rápido)
          this._checkNext();
        }
      }
    );
  }

  // ── Lumi orbe visual ─────────────────────────────────────────────────────

  _buildLumiOrb() {
    this._lumiOrb = document.createElement('div');
    Object.assign(this._lumiOrb.style, {
      position      : 'fixed',
      bottom        : '172px',  // justo encima del panel de diálogo
      left          : '50%',
      transform     : 'translateX(-50%)',
      display       : 'none',
      alignItems    : 'center',
      justifyContent: 'center',
      width         : '38px',
      height        : '38px',
      borderRadius  : '50%',
      background    : 'radial-gradient(circle at 35% 35%, #fffbe6, #ffe066 60%, #ffd700)',
      boxShadow     : '0 0 18px 6px rgba(255,220,50,0.55), 0 0 6px 2px rgba(255,255,255,0.7)',
      pointerEvents : 'none',
      zIndex        : '201',
      fontSize      : '18px',
      animation     : 'lumiFloat 2s ease-in-out infinite',
    });
    this._lumiOrb.textContent = '✨';

    // Animación flotante via keyframes inyectados una sola vez
    if (!document.getElementById('lumi-style')) {
      const style = document.createElement('style');
      style.id = 'lumi-style';
      style.textContent = `
        @keyframes lumiFloat {
          0%, 100% { transform: translateX(-50%) translateY(0px); }
          50%       { transform: translateX(-50%) translateY(-6px); }
        }
      `;
      document.head.appendChild(style);
    }

    document.body.appendChild(this._lumiOrb);
  }

  // ── Botón saltar ─────────────────────────────────────────────────────────

  _buildSkipBtn() {
    this._skipBtn = document.createElement('button');
    this._skipBtn.textContent = 'Saltar tutorial';
    Object.assign(this._skipBtn.style, {
      position   : 'fixed',
      top        : '52px',
      right      : '14px',
      padding    : '5px 12px',
      background : 'rgba(10,8,20,0.75)',
      border     : '1px solid rgba(255,255,255,0.15)',
      borderRadius: '12px',
      color      : 'rgba(255,255,255,0.45)',
      fontFamily : 'monospace',
      fontSize   : '9px',
      letterSpacing: '1px',
      cursor     : 'pointer',
      pointerEvents: 'all',
      zIndex     : '300',
      WebkitTapHighlightColor: 'transparent',
    });

    const onSkip = (e) => { e.preventDefault(); this.skip(); };
    this._skipBtn.addEventListener('touchstart', onSkip, { passive: false });
    this._skipBtn.addEventListener('click', onSkip);
    document.body.appendChild(this._skipBtn);
  }
}
