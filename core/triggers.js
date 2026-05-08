/**
 * core/triggers.js — Triggers de mundo para narrativa
 * Conecta posiciones del jugador con escenas de STORY_EVENTS
 *
 * USO desde game.html:
 *   import { WorldTriggers } from './core/triggers.js';
 *   const triggers = new WorldTriggers(narrative, player);
 *   // En el loop:
 *   triggers.update(player.root.position);
 */

export class WorldTriggers {
  constructor(narrative, player) {
    this._narrative = narrative;
    this._player    = player;
    this._fired     = new Set(); // triggers que ya se dispararon
  }

  // Llamar desde loop.js en cada frame
  update(playerPos) {
    if (!this._narrative._active === false) return; // no interrumpir escena activa
    this._check(playerPos);
  }

  _check(pos) {
    const nar = this._narrative;

    // ── Puerta norte de Ironfell ──
    // Ajusta estas coordenadas a las reales de tu escena
    if (!this._fired.has('escena05') && this._near(pos, 0, 0, -30, 4)) {
      this._fire('escena05', () => {
        import('../data/storyEvents.js').then(({ STORY_EVENTS }) => {
          nar.play(STORY_EVENTS.escena05_guardia);
        });
      });
    }

    // ── Sala de generales (<5u de la puerta) ──
    if (!this._fired.has('escena07')
      && nar.getFlag('ironfell_desbloqueada')
      && this._near(pos, 10, 0, -40, 5)) {
      this._fire('escena07', () => {
        import('../data/storyEvents.js').then(({ STORY_EVENTS }) => {
          nar.play(STORY_EVENTS.escena07_generales, () => {
            nar.play(STORY_EVENTS.escena08_mirador);
          });
        });
      });
    }

    // ── Academia Veldris ──
    if (!this._fired.has('escena14')
      && nar.getFlag('ironfell_desbloqueada')
      && this._near(pos, -15, 0, -35, 4)) {
      this._fire('escena14', () => {
        import('../data/storyEvents.js').then(({ STORY_EVENTS }) => {
          nar.play(STORY_EVENTS.escena14_academia);
        });
      });
    }

    // ── Aelith en el mercado (día 8+) ──
    if (!this._fired.has('escena15')
      && nar.getFlag('mercado_visitado')
      && nar.getFlag('academia_desbloqueada')
      && this._near(pos, 5, 0, -25, 5)) {
      this._fire('escena15', () => {
        import('../data/storyEvents.js').then(({ STORY_EVENTS }) => {
          nar.play(STORY_EVENTS.escena15_aelith_mercado);
        });
      });
    }
  }

  // Disparar una vez y guardar en flags
  _fire(key, fn) {
    this._fired.add(key);
    this._narrative.setFlag('trigger_' + key, true);
    fn();
  }

  // Distancia horizontal al punto (ignora Y)
  _near(pos, tx, ty, tz, radius) {
    const dx = pos.x - tx;
    const dz = pos.z - tz;
    return Math.sqrt(dx * dx + dz * dz) < radius;
  }

  // Actualizar coordenadas de un trigger en runtime (para cuando conozcas las reales)
  setTriggerPos(key, x, y, z) {
    this['_pos_' + key] = { x, y, z };
  }
}
