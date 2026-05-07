// ui/fusionMenu.js — Estilo igual al de habilidades

export class FusionMenu {
  constructor(progression, skillBar, skillSystem) {
    this.progression = progression;
    this.skillBar = skillBar;
    this.skillSystem = skillSystem;
    this._weapon = null;
    this._overlay = null;
    this._selectedSchool = null;
  }

  setWeapon(weapon) {
    this._weapon = weapon;
  }

  open(weaponType) {
    this._weapon = weaponType;
    this._selectedSchool = this.progression.getActiveSchool?.(weaponType) || 'planta';
    
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
        <h2 style="color: #C9A84C; text-align: center; margin: 0 0 8px 0; font-size: 1.2rem;">✦ FUSIÓN DE HABILIDADES ✦</h2>
        <p style="color: rgba(201,168,76,0.6); text-align: center; font-size: 10px; margin-bottom: 20px; letter-spacing: 0.1em;">
          ARMA: ${weaponType.toUpperCase()} • DAÑO +25%
        </p>
        
        <div id="fusion-schools" style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; margin-bottom: 24px;">
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
          transition: all 0.1s;
        ">⚡ FUSIONAR ⚡</button>
        
        <button id="fusion-close" style="
          width: 100%;
          margin-top: 10px;
          padding: 8px;
          background: rgba(10,8,20,0.5);
          border: 1px solid rgba(201,168,76,0.3);
          border-radius: 8px;
          color: rgba(201,168,76,0.6);
          font-family: monospace;
          cursor: pointer;
        ">✖ CERRAR</button>
      </div>
    `;

    document.body.appendChild(this._overlay);

    const items = this._overlay.querySelectorAll('.fusion-school-item');
    items.forEach(item => {
      const onSelect = (e) => {
        e.preventDefault();
        const school = item.dataset.school;
        this._selectSchool(school);
      };
      item.addEventListener('click', onSelect);
      item.addEventListener('touchstart', onSelect, { passive: false });
    });

    const applyBtn = this._overlay.querySelector('#fusion-apply');
    const onApply = (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (this._selectedSchool) {
        if (this.progression.setActiveSchool) {
          this.progression.setActiveSchool(this._weapon, this._selectedSchool);
        }
        if (this.skillSystem && this.skillSystem.applyFusion) {
          this.skillSystem.applyFusion(this._weapon, this._selectedSchool);
        }
        if (this.skillBar) this.skillBar.refresh();
        this.close();
      }
    };
    applyBtn.addEventListener('click', onApply);
    applyBtn.addEventListener('touchstart', onApply, { passive: false });

    const closeBtn = this._overlay.querySelector('#fusion-close');
    const onClose = (e) => {
      e.preventDefault();
      this.close();
    };
    closeBtn.addEventListener('click', onClose);
    closeBtn.addEventListener('touchstart', onClose, { passive: false });
  }

  _renderSchools() {
    const schools = [
      { id: 'fuego', emoji: '🔥', name: 'Fuego', desc: 'QUEMADURA', effect: 'Daño por segundo', color: '#ff6633' },
      { id: 'hielo', emoji: '❄️', name: 'Hielo', desc: 'RALENTIZAR', effect: 'Reduce velocidad', color: '#66ccff' },
      { id: 'planta', emoji: '🌿', name: 'Planta', desc: 'VITALIDAD', effect: '+25% daño base', color: '#66ff66' },
      { id: 'viento', emoji: '💨', name: 'Viento', desc: 'CORTANTE', effect: '+25% daño base', color: '#ccaa88' }
    ];
    
    return schools.map(school => `
      <div class="fusion-school-item" data-school="${school.id}" style="
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
        padding: 16px 8px;
        border: 2px solid ${this._selectedSchool === school.id ? school.color : 'rgba(201,168,76,0.2)'};
        border-radius: 12px;
        cursor: pointer;
        transition: all 0.1s;
        background: ${this._selectedSchool === school.id ? `${school.color}10` : 'rgba(10,8,20,0.5)'};
        transform: ${this._selectedSchool === school.id ? 'scale(1.02)' : 'scale(1)'};
      ">
        <div style="font-size: 2.2rem; margin-bottom: 6px;">${school.emoji}</div>
        <div style="font-weight: bold; color: ${school.color}; font-size: 0.9rem; letter-spacing: 0.1em;">${school.name}</div>
        <div style="font-size: 8px; font-family: monospace; color: ${school.color}80; margin-top: 4px;">${school.desc}</div>
        <div style="font-size: 9px; color: rgba(201,168,76,0.5); margin-top: 6px;">${school.effect}</div>
        ${this._selectedSchool === school.id ? '<div style="margin-top: 6px; color: #C9A84C;">✓ SELECCIONADO</div>' : ''}
      </div>
    `).join('');
  }

  _selectSchool(school) {
    this._selectedSchool = school;
    const items = this._overlay.querySelectorAll('.fusion-school-item');
    const schoolsData = [
      { id: 'fuego', color: '#ff6633' },
      { id: 'hielo', color: '#66ccff' },
      { id: 'planta', color: '#66ff66' },
      { id: 'viento', color: '#ccaa88' }
    ];
    
    items.forEach(item => {
      const schoolId = item.dataset.school;
      const schoolColor = schoolsData.find(s => s.id === schoolId)?.color || '#C9A84C';
      const isSelected = schoolId === school;
      
      item.style.border = `2px solid ${isSelected ? schoolColor : 'rgba(201,168,76,0.2)'}`;
      item.style.background = isSelected ? `${schoolColor}10` : 'rgba(10,8,20,0.5)';
      item.style.transform = isSelected ? 'scale(1.02)' : 'scale(1)';
      
      const checkDiv = item.querySelector('div:last-child');
      if (checkDiv && checkDiv.innerHTML.includes('SELECCIONADO')) {
        if (!isSelected) checkDiv.remove();
      } else if (isSelected) {
        const newCheck = document.createElement('div');
        newCheck.style.cssText = 'margin-top: 6px; color: #C9A84C; font-size: 9px;';
        newCheck.innerHTML = '✓ SELECCIONADO';
        item.appendChild(newCheck);
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
