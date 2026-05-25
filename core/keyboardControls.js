// core/keyboardControls.js — Controles de teclado | Ashes of the Reborn

const DEFAULT_BINDS = {
  attack   : 'KeyJ',
  skill1   : 'KeyU',
  skill2   : 'KeyI',
  skill3   : 'KeyO',
  sprint   : 'ShiftLeft',
  switch   : 'KeyQ',
  map      : 'KeyM',
};

export class KeyboardControls {
  constructor() {
    this._binds   = { ...DEFAULT_BINDS };
    this._pressed = new Set();
    this._load();
    this._bindEvents();
  }

  _bindEvents() {
    window.addEventListener('keydown', (e) => {
      this._pressed.add(e.code);
      this._onKeyDown(e.code);
    });
    window.addEventListener('keyup', (e) => {
      this._pressed.delete(e.code);
      this._onKeyUp(e.code);
    });
  }

  _onKeyDown(code) {
    if (code === this._binds.attack) {
      window._combat?.triggerAttack?.();
    }
    if (code === this._binds.skill1) {
      const bar = window._skillBar;
      if (bar?._buttons[0]?.dataset.skillId) {
        const sys = bar._activeSkillSystem ?? bar.skillSystem;
        sys?.castSkill(bar._buttons[0].dataset.skillId);
      }
    }
    if (code === this._binds.skill2) {
      const bar = window._skillBar;
      if (bar?._buttons[1]?.dataset.skillId) {
        const sys = bar._activeSkillSystem ?? bar.skillSystem;
        sys?.castSkill(bar._buttons[1].dataset.skillId);
      }
    }
    if (code === this._binds.skill3) {
      const bar = window._skillBar;
      if (bar?._buttons[2]?.dataset.skillId) {
        const sys = bar._activeSkillSystem ?? bar.skillSystem;
        sys?.castSkill(bar._buttons[2].dataset.skillId);
      }
    }
    if (code === this._binds.sprint) {
      const activeChar = window._partyManager?.getActiveCharacter() ?? window._player;
      activeChar?.setSprinting?.(true);
    }
    if (code === this._binds.switch) {
      window._partyManager?.switchCharacter?.();
    }
    if (code === this._binds.map) {
      window._mapUI?.toggle?.();
    }
  }

  _onKeyUp(code) {
    if (code === this._binds.sprint) {
      const activeChar = window._partyManager?.getActiveCharacter() ?? window._player;
      activeChar?.setSprinting?.(false);
    }
  }

  getBinds()  { return { ...this._binds }; }

  setBind(action, code) {
    this._binds[action] = code;
    this._save();
  }

  resetDefaults() {
    this._binds = { ...DEFAULT_BINDS };
    this._save();
  }

  _save() {
    localStorage.setItem('ashes_keybinds', JSON.stringify(this._binds));
  }

  _load() {
    try {
      const saved = localStorage.getItem('ashes_keybinds');
      if (saved) this._binds = { ...DEFAULT_BINDS, ...JSON.parse(saved) };
    } catch(e) {}
  }
}
