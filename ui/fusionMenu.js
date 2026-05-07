// ui/fusionMenu.js — Versión con logs de depuración

export class FusionMenu {
  constructor(progression, skillBar, skillSystem) {
    console.log("[FusionMenu] Constructor llamado");
    this.progression = progression;
    this.skillBar = skillBar;
    this.skillSystem = skillSystem;
    this._weapon = null;
    this._overlay = null;
    this._selectedSchool = null;
  }

  setWeapon(weapon) {
    console.log("[FusionMenu] setWeapon:", weapon);
    this._weapon = weapon;
  }

  open(weaponType) {
    console.log("[FusionMenu] open llamado con:", weaponType);
    this._weapon = weaponType;
    this._selectedSchool = this.progression.getActiveSchool?.(weaponType) || 'planta';
    
    console.log("[FusionMenu] Escuela seleccionada:", this._selectedSchool);
    
    this._overlay = document.createElement('div');
    this._overlay.id = 'fusion-menu-overlay';
    Object.assign(this._overlay.style, {
      position: 'fixed',
      inset: '0',
      background: 'rgba(4,4,10,0.95)',
      zIndex: '300',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: "'Georgia', serif",
    });

    this._overlay.innerHTML = `
      <div style="background: rgba(10,8,20,0.9); border: 1px solid rgba(201,168,76,0.3); border-radius: 16px; padding: 24px; max-width: 400px; width: 90%;">
        <h2 style="color: #C9A84C; text-align: center; margin: 0 0 8px 0;">FUSIÓN — ELIGE ESCUELA MÁGICA</h2>
        <p style="color: rgba(201,168,76,0.6); text-align: center; font-size: 12px; margin-bottom: 20px;">
          ARMA ACTIVA: ${weaponType.toUpperCase()} • +25% DAÑO BASE EN FUSIÓN
        </p>
        
        <div id="fusion-schools" style="display: flex; flex-direction: column; gap: 12px; margin-bottom: 24px;">
          ${this._renderSchools()}
        </div>
        
        <button id="fusion-apply" style="
          width: 100%;
          padding: 12px;
          background: linear-gradient(135deg, #7A6030, #C9A84C);
          border: none;
          border-radius: 8px;
          color: #04040A;
          font-family: monospace;
          font-weight: bold;
          letter-spacing: 0.2em;
          cursor: pointer;
          transition: transform 0.1s, opacity 0.2s;
        ">APLICAR FUSIÓN</button>
        
        <button id="fusion-close" style="
          width: 100%;
          margin-top: 10px;
          padding: 8px;
          background: transparent;
          border: 1px solid rgba(201,168,76,0.3);
          border-radius: 8px;
          color: rgba(201,168,76,0.7);
          font-family: monospace;
          cursor: pointer;
        ">CERRAR</button>
      </div>
    `;

    document.body.appendChild(this._overlay);

    const items = this._overlay.querySelectorAll('.fusion-school-item');
    items.forEach(item => {
      const onSelect = (e) => {
        e.preventDefault();
        const school = item.dataset.school;
        console.log("[FusionMenu] Escuela seleccionada:", school);
        this._selectSchool(school);
      };
      item.addEventListener('click', onSelect);
      item.addEventListener('touchstart', onSelect, { passive: false });
    });

    const applyBtn = this._overlay.querySelector('#fusion-apply');
    console.log("[FusionMenu] Botón APLICAR encontrado:", applyBtn);
    
    const onApply = (e) => {
      console.log("[FusionMenu] Botón APLICAR presionado");
      e.preventDefault();
      e.stopPropagation();
      if (this._selectedSchool) {
        console.log("[FusionMenu] Aplicando fusión:", this._weapon, this._selectedSchool);
        if (this.progression.setActiveSchool) {
          this.progression.setActiveSchool(this._weapon, this._selectedSchool);
        }
        if (this.skillSystem && this.skillSystem.applyFusion) {
          this.skillSystem.applyFusion(this._weapon, this._selectedSchool);
        }
        if (this.skillBar) this.skillBar.refresh();
        console.log(`[FusionMenu] Aplicada fusión: ${this._weapon} + ${this._selectedSchool}`);
        this.close();
      } else {
        console.log("[FusionMenu] No hay escuela seleccionada");
      }
    };
    
    applyBtn.addEventListener('click', onApply);
    applyBtn.addEventListener('touchstart', onApply, { passive: false });

    const closeBtn = this._overlay.querySelector('#fusion-close');
    const onClose = (e) => {
      console.log("[FusionMenu] Botón CERRAR presionado");
      e.preventDefault();
      this.close();
    };
    closeBtn.addEventListener('click', onClose);
    closeBtn.addEventListener('touchstart', onClose, { passive: false });
  }

  _renderSchools() {
    const schools = [
      { id: 'fuego', name: 'Fuego', desc: 'QUEMADURA — Daño por segundo al impactar' },
      { id: 'hielo', name: 'Hielo', desc: 'RALENTIZAR — Reduce velocidad del enemigo' },
      { id: 'planta', name: 'Planta', desc: '+25% daño base' },
      { id: 'viento', name: 'Viento', desc: '+25% daño base' }
    ];
    
    return schools.map(school => `
      <div class="fusion-school-item" data-school="${school.id}" style="
        padding: 12px;
        border: 1px solid rgba(201,168,76,0.2);
        border-radius: 8px;
        cursor: pointer;
        transition: all 0.1s;
        background: ${this._selectedSchool === school.id ? 'rgba(201,168,76,0.15)' : 'transparent'};
      ">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <strong style="color: #C9A84C;">${school.name}</strong>
          <span style="color: ${this._selectedSchool === school.id ? '#C9A84C' : 'transparent'};">✓</span>
        </div>
        <div style="font-size: 11px; color: rgba(201,168,76,0.6); margin-top: 4px;">${school.desc}</div>
      </div>
    `).join('');
  }

  _selectSchool(school) {
    this._selectedSchool = school;
    console.log("[FusionMenu] _selectSchool:", school);
    const items = this._overlay.querySelectorAll('.fusion-school-item');
    items.forEach(item => {
      const bg = item.dataset.school === school ? 'rgba(201,168,76,0.15)' : 'transparent';
      item.style.background = bg;
      const check = item.querySelector('span');
      if (check) check.style.color = item.dataset.school === school ? '#C9A84C' : 'transparent';
    });
  }

  close() {
    console.log("[FusionMenu] close llamado");
    if (this._overlay) {
      this._overlay.remove();
      this._overlay = null;
    }
  }
}
