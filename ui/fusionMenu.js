// ui/fusionMenu.js — Ashes of the Reborn | Valiant Gaming

export class FusionMenu {
  constructor(progression, skillBar, skillSystem) {
    this.progression = progression;
    this.skillBar    = skillBar;
    this.skillSystem = skillSystem;
    this._weapon     = null;
    this._overlay    = null;
    this._selectedSchool = null;
  }

  setWeapon(weapon) { this._weapon = weapon; }

  open(weaponType) {
    this._weapon         = weaponType;
    this._selectedSchool = this.progression.getActiveSchool(weaponType) ?? null;

    this._overlay = document.createElement('div');
    this._overlay.id = 'fusion-menu-overlay';
    Object.assign(this._overlay.style, {
      position      : 'fixed',
      inset         : '0',
      background    : 'rgba(4,4,10,0.95)',
      zIndex        : '300',
      display       : 'flex',
      alignItems    : 'center',
      justifyContent: 'center',
      fontFamily    : "'Georgia', serif",
    });

    this._overlay.innerHTML = `
      <div style="background:rgba(10,8,20,0.9);border:1px solid rgba(201,168,76,0.3);border-radius:16px;padding:24px;max-width:400px;width:90%;">
        <h2 style="color:#C9A84C;text-align:center;margin:0 0 8px 0;font-size:1.2rem;">✦ FUSIÓN DE HABILIDADES ✦</h2>
        <p style="color:rgba(201,168,76,0.6);text-align:center;font-size:10px;margin-bottom:4px;letter-spacing:0.1em;">
          ARMA: ${weaponType.toUpperCase()}
        </p>
        <p style="color:rgba(100,200,255,0.6);text-align:center;font-size:9px;margin-bottom:20px;letter-spacing:0.1em;">
          COSTO: 50 ENERGÍA • DURACIÓN: 30 SEGUNDOS
        </p>
        <div id="fusion-schools" style="display:grid;grid-template-columns:repeat(2,1fr);gap:12px;margin-bottom:24px;">
          ${this._renderSchools()}
        </div>
        <button id="fusion-apply" style="width:100%;padding:12px;background:linear-gradient(135deg,#7A6030,#C9A84C);border:none;border-radius:8px;color:#04040A;font-family:monospace;font-weight:bold;letter-spacing:0.2em;cursor:pointer;font-size:13px;">
          ⚡ FUSIONAR ⚡
        </button>
        <button id="fusion-close" style="width:100%;margin-top:10px;padding:8px;background:rgba(10,8,20,0.5);border:1px solid rgba(201,168,76,0.3);border-radius:8px;color:rgba(201,168,76,0.6);font-family:monospace;cursor:pointer;">✖ CERRAR</button>
      </div>
    `;

    document.body.appendChild(this._overlay);

    this._overlay.querySelectorAll('.fusion-school-item').forEach(item => {
      const onSelect = (e) => {
        e.preventDefault();
        this._selectSchool(item.dataset.school);
      };
      item.addEventListener('click',      onSelect);
      item.addEventListener('touchstart', onSelect, { passive: false });
    });

    const applyBtn = this._overlay.querySelector('#fusion-apply');
    const onApply  = (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (!this._selectedSchool) {
        applyBtn.textContent = '✗ SELECCIONA UNA ESCUELA';
        setTimeout(() => applyBtn.textContent = '⚡ FUSIONAR ⚡', 1000);
        return;
      }

      // Verificar energía
      if (this.skillSystem && this.skillSystem.energy < 50) {
        applyBtn.textContent = '✗ SIN ENERGÍA';
        setTimeout(() => applyBtn.textContent = '⚡ FUSIONAR ⚡', 1000);
        return;
      }

      // Descontar energía
      if (this.skillSystem) {
        this.skillSystem.energy = Math.max(0, this.skillSystem.energy - 50);
        if (this.skillSystem.onEnergyUpdate) {
          this.skillSystem.onEnergyUpdate(this.skillSystem.energy, this.skillSystem.maxEnergy);
        }
      }

      this.progression.setActiveSchool(this._weapon, this._selectedSchool);
      localStorage.setItem('ashes_progression', JSON.stringify(this.progression.serialize()));

      if (this.skillSystem?.applyFusion) {
        this.skillSystem.applyFusion(this._weapon, this._selectedSchool);
      }
      if (this.skillBar) this.skillBar.refresh();

      applyBtn.textContent = '✓ FUSIÓN APLICADA — 30s';

      // Expirar después de 30 segundos
      setTimeout(() => {
        this.progression.setActiveSchool(this._weapon, null);
        localStorage.setItem('ashes_progression', JSON.stringify(this.progression.serialize()));
        console.log('[Fusion] Expirada');
      }, 30000);

      setTimeout(() => this.close(), 800);
    };
    applyBtn.addEventListener('click',      onApply);
    applyBtn.addEventListener('touchstart', onApply, { passive: false });

    const closeBtn = this._overlay.querySelector('#fusion-close');
    const onClose  = (e) => { e.preventDefault(); this.close(); };
    closeBtn.addEventListener('click',      onClose);
    closeBtn.addEventListener('touchstart', onClose, { passive: false });
  }

  _renderSchools() {
    const schools = [
      { id: 'fuego',   emoji: '🔥', name: 'Fuego',   desc: 'QUEMADURA',  effect: 'Daño por segundo al atacar',  color: '#ff6633' },
      { id: 'hielo',   emoji: '❄️', name: 'Hielo',   desc: 'RALENTIZAR', effect: 'Reduce velocidad enemiga',    color: '#66ccff' },
      { id: 'viento',  emoji: '💨', name: 'Viento',  desc: 'IMPULSO',    effect: 'Te lanza lejos al golpear',   color: '#aaeeff' },
      { id: 'soporte', emoji: '💚', name: 'Soporte', desc: 'VITALIDAD',  effect: 'Recuperas 5% del daño hecho', color: '#66ff88' },
    ];

    return schools.map(s => {
      const selected = this._selectedSchool === s.id;
      return `
        <div class="fusion-school-item" data-school="${s.id}" style="
          display:flex;flex-direction:column;align-items:center;text-align:center;
          padding:16px 8px;
          border:2px solid ${selected ? s.color : 'rgba(201,168,76,0.2)'};
          border-radius:12px;cursor:pointer;
          background:${selected ? s.color + '22' : 'rgba(10,8,20,0.5)'};
          transform:${selected ? 'scale(1.02)' : 'scale(1)'};
          transition:all 0.1s;
        ">
          <div style="font-size:2.2rem;margin-bottom:6px;">${s.emoji}</div>
          <div style="font-weight:bold;color:${s.color};font-size:0.9rem;letter-spacing:0.1em;">${s.name}</div>
          <div style="font-size:8px;font-family:monospace;color:${s.color}99;margin-top:4px;">${s.desc}</div>
          <div style="font-size:9px;color:rgba(201,168,76,0.5);margin-top:6px;">${s.effect}</div>
          ${selected ? '<div class="fusion-badge" style="margin-top:6px;color:#C9A84C;font-size:9px;">✓ SELECCIONADO</div>' : ''}
        </div>
      `;
    }).join('');
  }

  _selectSchool(school) {
    this._selectedSchool = school;
    const schoolsData = [
      { id: 'fuego',   color: '#ff6633' },
      { id: 'hielo',   color: '#66ccff' },
      { id: 'viento',  color: '#aaeeff' },
      { id: 'soporte', color: '#66ff88' },
    ];

    this._overlay.querySelectorAll('.fusion-school-item').forEach(item => {
      const sid      = item.dataset.school;
      const color    = schoolsData.find(s => s.id === sid)?.color ?? '#C9A84C';
      const selected = sid === school;

      item.style.border     = `2px solid ${selected ? color : 'rgba(201,168,76,0.2)'}`;
      item.style.background = selected ? color + '22' : 'rgba(10,8,20,0.5)';
      item.style.transform  = selected ? 'scale(1.02)' : 'scale(1)';

      let badge = item.querySelector('.fusion-badge');
      if (selected && !badge) {
        badge = document.createElement('div');
        badge.className   = 'fusion-badge';
        badge.style.cssText = 'margin-top:6px;color:#C9A84C;font-size:9px;';
        badge.textContent   = '✓ SELECCIONADO';
        item.appendChild(badge);
      } else if (!selected && badge) {
        badge.remove();
      }
    });
  }

  close() {
    if (this._overlay) {
      this._overlay.remove();
      this._overlay = null;
    }
  }
}
