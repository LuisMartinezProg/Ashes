/**
 * core/triggers.js — Triggers de mundo para narrativa
 */

export class WorldTriggers {
  constructor(narrative, player) {
    this._narrative = narrative;
    this._player    = player;
    this._fired     = new Set();
  }

  update(playerPos) {
    if (this._narrative._active) return;
    this._check(playerPos);
  }

  _check(pos) {
    const nar = this._narrative;

    // ── Puerta norte de Ironfell (sur del mapa) ──
    if (!this._fired.has('escena05')
      && !nar.getFlag('escena05_done')
      && this._near(pos, 0, 0, 60, 6)) {
      this._fire('escena05', () => {
        import('../data/storyEvents.js').then(({ STORY_EVENTS }) => {
          nar.play(STORY_EVENTS.escena05_guardia);
        });
      });
    }

    // ── Sala de generales ──
    if (!this._fired.has('escena07')
      && !nar.getFlag('escena07_done')
      && nar.getFlag('ironfell_desbloqueada')
      && this._near(pos, 10, 0, 70, 5)) {
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
      && !nar.getFlag('escena14_done')
      && nar.getFlag('ironfell_desbloqueada')
      && this._near(pos, -15, 0, 65, 4)) {
      this._fire('escena14', () => {
        import('../data/storyEvents.js').then(({ STORY_EVENTS }) => {
          nar.play(STORY_EVENTS.escena14_academia);
        });
      });
    }

    // ── Aelith en el mercado ──
    if (!this._fired.has('escena15')
      && !nar.getFlag('escena15_done')
      && nar.getFlag('mercado_visitado')
      && nar.getFlag('academia_desbloqueada')
      && this._near(pos, 5, 0, 55, 5)) {
      this._fire('escena15', () => {
        import('../data/storyEvents.js').then(({ STORY_EVENTS }) => {
          nar.play(STORY_EVENTS.escena15_aelith_mercado);
        });
      });
    }
  }

  _fire(key, fn) {
    this._fired.add(key);
    this._narrative.setFlag('trigger_' + key, true);
    fn();
  }

  _near(pos, tx, ty, tz, radius) {
    const dx = pos.x - tx;
    const dz = pos.z - tz;
    return Math.sqrt(dx * dx + dz * dz) < radius;
  }

  setTriggerPos(key, x, y, z) {
    this['_pos_' + key] = { x, y, z };
  }
}
