// ui/partyMenu.js — Menú de equipo | Ashes of the Reborn | Valiant Gaming

const PARTY_CHARS = [
  {
    id      : 'kael',
    name    : 'Kael',
    element : 'umbral',
    elementLabel: 'Poder Umbral',
    elementColor: '#8855ff',
    elementIcon : '🌑',
    weapon  : 'katana',
    icon    : '🗡️',
    unlocked: true,
    desc    : 'Guerrero de las sombras. Domina la katana con velocidad absoluta.',
    effects : [
      {
        name: 'Aura Umbral',
        icon: '🌑',
        desc: 'Sus ataques aplican Umbral al enemigo. Base de las reacciones de oscuridad.',
      },
      {
        name: 'Eclipse',
        icon: '⭐',
        desc: 'Umbral + Astral: daño masivo y ceguera total por 3s.',
        reaction: true,
        with: 'Mika',
      },
      {
        name: 'Condena Oscura',
        icon: '🔥',
        desc: 'Umbral + Elemental: quema continua y reducción de DEF.',
        reaction: true,
        with: 'Zara',
      },
      {
        name: 'Fractura',
        icon: '💠',
        desc: 'Arcanum + Umbral: rompe la defensa del enemigo permanentemente.',
        reaction: true,
        with: 'Rhen',
      },
    ],
  },
  {
    id      : 'mika',
    name    : 'Mika',
    element : 'astral',
    elementLabel: 'Poder Astral',
    elementColor: '#44aaff',
    elementIcon : '✨',
    weapon  : 'bow',
    icon    : '🏹',
    unlocked: true,
    desc    : 'Arquera de la luz estelar. Ataca desde lejos con precisión astral.',
    effects : [
      {
        name: 'Aura Astral',
        icon: '✨',
        desc: 'Sus flechas aplican Astral al enemigo. Cataliza reacciones de luz.',
      },
      {
        name: 'Eclipse',
        icon: '⭐',
        desc: 'Astral + Umbral: daño masivo y ceguera total por 3s.',
        reaction: true,
        with: 'Kael',
      },
      {
        name: 'Nova Solar',
        icon: '⚡',
        desc: 'Astral + Elemental: explosión en área que daña a todos los enemigos cercanos.',
        reaction: true,
        with: 'Zara',
      },
      {
        name: 'Resurgir',
        icon: '💚',
        desc: 'Vital + Astral: cura al personaje activo del equipo.',
        reaction: true,
        with: 'Lyra',
      },
    ],
  },
  {
    id      : 'zara',
    name    : 'Zara',
    element : 'elemental',
    elementLabel: 'Dominio Elemental',
    elementColor: '#ff6622',
    elementIcon : '🔥',
    weapon  : 'magic',
    icon    : '🔮',
    unlocked: false,
    desc    : 'Maga del fuego y la naturaleza. Controla múltiples elementos a la vez.',
    effects : [
      {
        name: 'Aura Elemental',
        icon: '🔥',
        desc: 'Sus hechizos aplican Elemental al enemigo.',
      },
      {
        name: 'Condena Oscura',
        icon: '🔥',
        desc: 'Elemental + Umbral: quema continua y reducción de DEF.',
        reaction: true,
        with: 'Kael',
      },
      {
        name: 'Nova Solar',
        icon: '⚡',
        desc: 'Elemental + Astral: explosión en área masiva.',
        reaction: true,
        with: 'Mika',
      },
      {
        name: 'Sobrecarga',
        icon: '💥',
        desc: 'Elemental + Arcanum: explosión mágica que aturde al enemigo.',
        reaction: true,
        with: 'Rhen',
      },
    ],
  },
  {
    id      : 'rhen',
    name    : 'Rhen',
    element : 'arcanum',
    elementLabel: 'Arcanum',
    elementColor: '#4488ff',
    elementIcon : '💠',
    weapon  : 'sword',
    icon    : '⚔️',
    unlocked: false,
    desc    : 'Espadachín arcano. Combina magia rúnica con golpes pesados.',
    effects : [
      {
        name: 'Aura Arcanum',
        icon: '💠',
        desc: 'Sus ataques aplican Arcanum al enemigo.',
      },
      {
        name: 'Fractura',
        icon: '💠',
        desc: 'Arcanum + Umbral: rompe defensa del enemigo permanentemente.',
        reaction: true,
        with: 'Kael',
      },
      {
        name: 'Sobrecarga',
        icon: '💥',
        desc: 'Arcanum + Elemental: explosión mágica que aturde al enemigo.',
        reaction: true,
        with: 'Zara',
      },
    ],
  },
  {
    id      : 'lyra',
    name    : 'Lyra',
    element : 'vital',
    elementLabel: 'Esencia Vital',
    elementColor: '#44ff88',
    elementIcon : '❤️',
    weapon  : 'bow',
    icon    : '🌿',
    unlocked: false,
    desc    : 'Sanadora del bosque. Mantiene al equipo con vida en los momentos críticos.',
    effects : [
      {
        name: 'Aura Vital',
        icon: '❤️',
        desc: 'Sus habilidades aplican Vital al enemigo y curan aliados.',
      },
      {
        name: 'Resurgir',
        icon: '💚',
        desc: 'Vital + Astral: cura masiva al personaje activo.',
        reaction: true,
        with: 'Mika',
      },
    ],
  },
  {
    id      : 'oryn',
    name    : 'Oryn',
    element : 'spiritual',
    elementLabel: 'Vínculo Espiritual',
    elementColor: '#ffcc44',
    elementIcon : '👁️',
    weapon  : 'magic',
    icon    : '🌀',
    unlocked: false,
    desc    : 'Invocador espiritual. Potencia las habilidades de todo el equipo.',
    effects : [
      {
        name: 'Aura Espiritual',
        icon: '👁️',
        desc: 'Amplifica el daño de reacciones elementales del equipo en un 25%.',
      },
      {
        name: 'Vínculo',
        icon: '🔗',
        desc: 'Pasivo: cuando un aliado activa una reacción, Oryn regenera energía.',
      },
    ],
  },
  {
    id      : 'dusk',
    name    : 'Dusk',
    element : 'umbral',
    elementLabel: 'Poder Umbral',
    elementColor: '#553388',
    elementIcon : '🌑',
    weapon  : 'katana',
    icon    : '🌙',
    unlocked: false,
    desc    : 'Asesino del crepúsculo. Especialista en ataques desde las sombras.',
    effects : [
      {
        name: 'Sombra Profunda',
        icon: '🌑',
        desc: 'Variante Umbral más oscura. Sus ataques aplican Umbral potenciado.',
      },
      {
        name: 'Eclipse',
        icon: '⭐',
        desc: 'Umbral + Astral: ceguera y daño masivo igual que Kael.',
        reaction: true,
        with: 'Mika',
      },
    ],
  },
  {
    id      : 'vael',
    name    : 'Vael',
    element : 'astral',
    elementLabel: 'Poder Astral',
    elementColor: '#88ddff',
    elementIcon : '✨',
    weapon  : 'sword',
    icon    : '🌟',
    unlocked: false,
    desc    : 'Paladín de las estrellas. Combina luz astral con la fuerza de la espada.',
    effects : [
      {
        name: 'Luz Estelar',
        icon: '✨',
        desc: 'Variante Astral con espada. Aplica Astral en área con cada golpe.',
      },
      {
        name: 'Nova Solar',
        icon: '⚡',
        desc: 'Astral + Elemental: explosión en área igual que Mika.',
        reaction: true,
        with: 'Zara',
      },
    ],
  },
];

export class PartyMenu {
  constructor() {
    this._open      = false;
    this._selected  = 0;
    this._container = null;
    this._build();
  }

  open() {
    this._open = true;
    this._container.style.display = 'flex';
    this._renderCards();
    this._renderDetail(PARTY_CHARS[this._selected]);
  }

  close() {
    this._open = false;
    this._container.style.display = 'none';
  }

  toggle() { this._open ? this.close() : this.open(); }

  destroy() { this._container?.remove(); }

  _build() {
    this._container = document.createElement('div');
    Object.assign(this._container.style, {
      position       : 'fixed',
      inset          : '0',
      display        : 'none',
      background     : 'rgba(4,2,12,0.92)',
      zIndex         : '200',
      fontFamily     : 'monospace',
      flexDirection  : 'column',
      alignItems     : 'center',
      justifyContent : 'center',
      backdropFilter : 'blur(6px)',
    });

    // Título
    const title = document.createElement('div');
    title.textContent = '— EQUIPO —';
    Object.assign(title.style, {
      color         : '#aaaacc',
      fontSize      : '11px',
      letterSpacing : '4px',
      marginBottom  : '16px',
    });
    this._container.appendChild(title);

    // Layout principal
    const layout = document.createElement('div');
    Object.assign(layout.style, {
      display  : 'flex',
      gap      : '16px',
      width    : '96vw',
      maxWidth : '820px',
      height   : '72vh',
    });
    this._container.appendChild(layout);

    // Panel izquierdo — tarjetas
    this._cardsPanel = document.createElement('div');
    Object.assign(this._cardsPanel.style, {
      display       : 'grid',
      gridTemplateColumns: 'repeat(4, 1fr)',
      gap           : '8px',
      flex          : '1',
      alignContent  : 'start',
    });
    layout.appendChild(this._cardsPanel);

    // Panel derecho — detalle
    this._detailPanel = document.createElement('div');
    Object.assign(this._detailPanel.style, {
      width      : '220px',
      minWidth   : '180px',
      background : 'rgba(10,8,24,0.9)',
      border     : '1px solid rgba(255,255,255,0.08)',
      borderRadius: '12px',
      padding    : '16px',
      overflowY  : 'auto',
      display    : 'flex',
      flexDirection: 'column',
      gap        : '10px',
    });
    layout.appendChild(this._detailPanel);

    // Botón cerrar
    const closeBtn = document.createElement('button');
    closeBtn.textContent = '✕ Cerrar';
    Object.assign(closeBtn.style, {
      marginTop    : '14px',
      background   : 'transparent',
      border       : '1px solid rgba(255,255,255,0.15)',
      color        : '#aaaacc',
      padding      : '6px 20px',
      borderRadius : '20px',
      cursor       : 'pointer',
      fontSize     : '11px',
      letterSpacing: '2px',
    });
    closeBtn.addEventListener('click', () => this.close());
    closeBtn.addEventListener('touchstart', (e) => { e.preventDefault(); this.close(); }, { passive: false });
    this._container.appendChild(closeBtn);

    document.body.appendChild(this._container);
  }

  _renderCards() {
    this._cardsPanel.innerHTML = '';
    PARTY_CHARS.forEach((char, i) => {
      const card = document.createElement('div');
      const isSelected = i === this._selected;
      Object.assign(card.style, {
        background   : isSelected
          ? `linear-gradient(135deg, ${char.elementColor}33, rgba(10,8,24,0.95))`
          : 'rgba(10,8,24,0.8)',
        border       : `2px solid ${isSelected ? char.elementColor : 'rgba(255,255,255,0.08)'}`,
        borderRadius : '10px',
        padding      : '10px 6px',
        cursor       : char.unlocked ? 'pointer' : 'default',
        display      : 'flex',
        flexDirection: 'column',
        alignItems   : 'center',
        gap          : '4px',
        opacity      : char.unlocked ? '1' : '0.45',
        position     : 'relative',
        transition   : 'border-color 0.15s, background 0.15s',
        userSelect   : 'none',
        WebkitTapHighlightColor: 'transparent',
      });

      // Icono elemento
      const elIcon = document.createElement('div');
      elIcon.textContent = char.elementIcon;
      elIcon.style.cssText = `
        font-size:22px;
        filter: drop-shadow(0 0 6px ${char.elementColor});
      `;
      card.appendChild(elIcon);

      // Icono arma
      const wpIcon = document.createElement('div');
      wpIcon.textContent = char.icon;
      wpIcon.style.cssText = 'font-size:14px;opacity:0.7;';
      card.appendChild(wpIcon);

      // Nombre
      const name = document.createElement('div');
      name.textContent = char.name;
      name.style.cssText = `
        font-size:10px;
        color:${char.unlocked ? '#ffffff' : '#666688'};
        letter-spacing:1px;
        text-align:center;
      `;
      card.appendChild(name);

      // Elemento label
      const elLabel = document.createElement('div');
      elLabel.textContent = char.elementLabel;
      elLabel.style.cssText = `
        font-size:8px;
        color:${char.elementColor};
        text-align:center;
        opacity:0.85;
      `;
      card.appendChild(elLabel);

      // Candado si bloqueado
      if (!char.unlocked) {
        const lock = document.createElement('div');
        lock.textContent = '🔒';
        lock.style.cssText = `
          position:absolute;top:4px;right:4px;
          font-size:10px;opacity:0.7;
        `;
        card.appendChild(lock);
      }

      // Indicador activo (Kael o Mika)
      if (char.unlocked && (char.id === 'kael' || char.id === 'mika')) {
        const activeDot = document.createElement('div');
        activeDot.style.cssText = `
          width:6px;height:6px;border-radius:50%;
          background:${char.elementColor};
          box-shadow:0 0 6px ${char.elementColor};
          margin-top:2px;
        `;
        card.appendChild(activeDot);
      }

      card.addEventListener('click', () => {
        this._selected = i;
        this._renderCards();
        this._renderDetail(char);
        if (char.unlocked) this._switchCharacter(char);
      });
      card.addEventListener('touchstart', (e) => {
        e.preventDefault();
        this._selected = i;
        this._renderCards();
        this._renderDetail(char);
        if (char.unlocked) this._switchCharacter(char);
      }, { passive: false });

      this._cardsPanel.appendChild(card);
    });
  }

  _renderDetail(char) {
    this._detailPanel.innerHTML = '';

    // Header del personaje
    const header = document.createElement('div');
    header.style.cssText = `
      display:flex;align-items:center;gap:10px;
      padding-bottom:10px;
      border-bottom:1px solid rgba(255,255,255,0.07);
    `;

    const bigIcon = document.createElement('div');
    bigIcon.textContent = char.elementIcon;
    bigIcon.style.cssText = `
      font-size:32px;
      filter:drop-shadow(0 0 10px ${char.elementColor});
    `;
    header.appendChild(bigIcon);

    const headerText = document.createElement('div');
    headerText.innerHTML = `
      <div style="font-size:14px;color:#ffffff;letter-spacing:2px;">${char.name}</div>
      <div style="font-size:9px;color:${char.elementColor};margin-top:2px;">${char.elementLabel}</div>
      <div style="font-size:9px;color:#666688;margin-top:1px;">${char.icon} ${char.weapon.toUpperCase()}</div>
    `;
    header.appendChild(headerText);
    this._detailPanel.appendChild(header);

    // Descripción
    const desc = document.createElement('div');
    desc.textContent = char.desc;
    desc.style.cssText = `
      font-size:9px;color:#8888aa;line-height:1.5;
      padding:6px 0;
      border-bottom:1px solid rgba(255,255,255,0.07);
    `;
    this._detailPanel.appendChild(desc);

    // Estado
    const status = document.createElement('div');
    status.style.cssText = 'display:flex;align-items:center;gap:6px;';
    const dot = document.createElement('div');
    dot.style.cssText = `
      width:8px;height:8px;border-radius:50%;
      background:${char.unlocked ? char.elementColor : '#444466'};
      box-shadow:${char.unlocked ? `0 0 8px ${char.elementColor}` : 'none'};
    `;
    const statusText = document.createElement('div');
    statusText.textContent = char.unlocked ? 'DISPONIBLE' : 'BLOQUEADO';
    statusText.style.cssText = `
      font-size:9px;
      color:${char.unlocked ? char.elementColor : '#444466'};
      letter-spacing:2px;
    `;
    status.appendChild(dot);
    status.appendChild(statusText);
    this._detailPanel.appendChild(status);

    // Título efectos
    const effectsTitle = document.createElement('div');
    effectsTitle.textContent = 'EFECTOS & REACCIONES';
    effectsTitle.style.cssText = `
      font-size:8px;color:#666688;letter-spacing:3px;
      padding-top:4px;
    `;
    this._detailPanel.appendChild(effectsTitle);

    // Lista de efectos
    char.effects.forEach(fx => {
      const fxCard = document.createElement('div');
      Object.assign(fxCard.style, {
        background   : fx.reaction
          ? 'rgba(255,255,255,0.04)'
          : 'rgba(255,255,255,0.02)',
        border       : `1px solid ${fx.reaction ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.05)'}`,
        borderRadius : '7px',
        padding      : '7px 8px',
        display      : 'flex',
        flexDirection: 'column',
        gap          : '3px',
      });

      const fxHeader = document.createElement('div');
      fxHeader.style.cssText = 'display:flex;align-items:center;gap:6px;';

      const fxIcon = document.createElement('div');
      fxIcon.textContent = fx.icon;
      fxIcon.style.cssText = 'font-size:13px;';
      fxHeader.appendChild(fxIcon);

      const fxName = document.createElement('div');
      fxName.style.cssText = 'display:flex;flex-direction:column;gap:1px;';
      fxName.innerHTML = `
        <span style="font-size:9px;color:#ccccee;letter-spacing:1px;">${fx.name}</span>
        ${fx.reaction && fx.with
          ? `<span style="font-size:8px;color:#666688;">con ${fx.with}</span>`
          : ''}
      `;
      fxHeader.appendChild(fxName);

      if (fx.reaction) {
        const badge = document.createElement('div');
        badge.textContent = 'RXN';
        badge.style.cssText = `
          margin-left:auto;
          font-size:7px;color:#ffcc44;
          border:1px solid rgba(255,204,68,0.4);
          border-radius:3px;padding:1px 4px;
          letter-spacing:1px;
        `;
        fxHeader.appendChild(badge);
      }

      fxCard.appendChild(fxHeader);

      const fxDesc = document.createElement('div');
      fxDesc.textContent = fx.desc;
      fxDesc.style.cssText = 'font-size:8px;color:#666688;line-height:1.4;padding-left:2px;';
      fxCard.appendChild(fxDesc);

      this._detailPanel.appendChild(fxCard);
    });
  }

  _switchCharacter(char) {
    if (!char.unlocked) return;
    if (char.id === 'kael') {
      window._partyManager?.switchTo?.(0);
    } else if (char.id === 'mika') {
      window._partyManager?.switchTo?.(1);
    }
    // Futuros personajes: switchTo(2), switchTo(3)...
  }
}
