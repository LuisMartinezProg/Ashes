// ui/partyMenu.js — Menú de equipo | Ashes of the Reborn | Valiant Gaming

const ELEMENTS = [
  { id: 'umbral',    label: 'Umbral',    icon: '🌑', color: '#8855ff' },
  { id: 'astral',    label: 'Astral',    icon: '✨', color: '#44aaff' },
  { id: 'elemental', label: 'Elemental', icon: '🔥', color: '#ff6622' },
  { id: 'arcanum',   label: 'Arcanum',   icon: '💠', color: '#4488ff' },
  { id: 'vital',     label: 'Vital',     icon: '❤️', color: '#44ff88' },
  { id: 'spiritual', label: 'Espiritual',icon: '👁️', color: '#ffcc44' },
];

const REACTIONS = {
  'umbral+astral'    : { name: 'Eclipse',          icon: '⭐', color: '#ffeebb', desc: 'Daño masivo + ceguera 3s.' },
  'umbral+elemental' : { name: 'Condena Oscura',   icon: '🔥', color: '#ff6622', desc: 'Quema continua + reducción DEF.' },
  'umbral+arcanum'   : { name: 'Fractura',         icon: '💠', color: '#88aaff', desc: 'Rompe defensa permanentemente.' },
  'astral+elemental' : { name: 'Nova Solar',       icon: '⚡', color: '#ffee44', desc: 'Explosión en área masiva.' },
  'astral+vital'     : { name: 'Resurgir',         icon: '💚', color: '#44ff88', desc: 'Cura masiva al personaje activo.' },
  'elemental+arcanum': { name: 'Sobrecarga',       icon: '💥', color: '#ff88ff', desc: 'Explosión mágica + stun.' },
};

const ALL_CHARS = [
  { id:'kael', name:'Kael', element:'umbral',    icon:'🗡️', color:'#8855ff', unlocked:true,  avatar:'K' },
  { id:'mika', name:'Mika', element:'astral',    icon:'🏹', color:'#44aaff', unlocked:true,  avatar:'M' },
  { id:'zara', name:'Zara', element:'elemental', icon:'🔮', color:'#ff6622', unlocked:false, avatar:'Z' },
  { id:'rhen', name:'Rhen', element:'arcanum',   icon:'⚔️', color:'#4488ff', unlocked:false, avatar:'R' },
  { id:'lyra', name:'Lyra', element:'vital',     icon:'🌿', color:'#44ff88', unlocked:false, avatar:'L' },
  { id:'oryn', name:'Oryn', element:'spiritual', icon:'🌀', color:'#ffcc44', unlocked:false, avatar:'O' },
  { id:'dusk', name:'Dusk', element:'umbral',    icon:'🌙', color:'#553388', unlocked:false, avatar:'D' },
  { id:'vael', name:'Vael', element:'astral',    icon:'🌟', color:'#88ddff', unlocked:false, avatar:'V' },
];

export class PartyMenu {
  constructor() {
    this._team        = ['kael', 'mika']; // equipo activo (max 4)
    this._activeIdx   = 0;               // índice del personaje controlado
    this._panelOpen   = false;
    this._floatBtn    = null;
    this._panel       = null;
    this._reactionTip = null;
    this._buildFloat();
    this._buildPanel();
    this._buildReactionTip();
    this._updateFloat();
  }

  // ── API pública ──────────────────────────────────────────────────────────

  getTeam()   { return this._team.map(id => ALL_CHARS.find(c => c.id === id)); }
  getActive() { return ALL_CHARS.find(c => c.id === this._team[this._activeIdx]); }

  switchTo(idx) {
    if (idx < 0 || idx >= this._team.length) return;
    this._activeIdx = idx;
    this._updateFloat();
    // Notificar al partyManager existente
    if (idx === 0) window._partyManager?.switchTo?.(0);
    if (idx === 1) window._partyManager?.switchTo?.(1);
    // Futuros: switchTo(2), switchTo(3)
  }

  open()   { this._panelOpen = true;  this._panel.style.display = 'flex'; this._renderPanel(); }
  close()  { this._panelOpen = false; this._panel.style.display = 'none'; this._updateFloat(); }
  toggle() { this._panelOpen ? this.close() : this.open(); }
  destroy(){ this._floatBtn?.remove(); this._panel?.remove(); this._reactionTip?.remove(); }

  // ── Botón flotante ───────────────────────────────────────────────────────

  _buildFloat() {
    this._floatBtn = document.createElement('div');
    Object.assign(this._floatBtn.style, {
      position       : 'fixed',
      bottom         : '90px',
      left           : '12px',
      display        : 'flex',
      flexDirection  : 'column',
      gap            : '4px',
      zIndex         : '130',
      pointerEvents  : 'all',
    });
    document.body.appendChild(this._floatBtn);
  }

  _updateFloat() {
    this._floatBtn.innerHTML = '';
    const team = this._team.map(id => ALL_CHARS.find(c => c.id === id));

    team.forEach((char, i) => {
      const btn = document.createElement('button');
      const isActive = i === this._activeIdx;
      btn.textContent = char.avatar;
      Object.assign(btn.style, {
        width          : isActive ? '44px' : '36px',
        height         : isActive ? '44px' : '36px',
        borderRadius   : '50%',
        border         : `2px solid ${isActive ? char.color : 'rgba(255,255,255,0.2)'}`,
        background     : `radial-gradient(circle at 35% 35%, ${char.color}66, rgba(8,6,18,0.95))`,
        color          : '#fff',
        fontSize       : isActive ? '16px' : '13px',
        fontFamily     : 'monospace',
        fontWeight     : 'bold',
        cursor         : 'pointer',
        WebkitTapHighlightColor: 'transparent',
        boxShadow      : isActive ? `0 0 14px ${char.color}88` : '0 2px 6px rgba(0,0,0,0.5)',
        transition     : 'all 0.15s',
        letterSpacing  : '1px',
      });

      // Tap rápido → switch de personaje
      const onTap = (e) => {
        e.preventDefault();
        if (this._panelOpen) return;
        this.switchTo(i);
      };
      btn.addEventListener('touchstart', onTap, { passive: false });
      btn.addEventListener('click', onTap);

      // Hold → abrir panel
      let holdT = null;
      const onHoldStart = (e) => {
        e.preventDefault();
        holdT = setTimeout(() => { holdT = null; this.open(); }, 400);
      };
      const onHoldEnd = () => { if (holdT) { clearTimeout(holdT); holdT = null; } };
      btn.addEventListener('touchstart', onHoldStart, { passive: false });
      btn.addEventListener('touchend',   onHoldEnd);
      btn.addEventListener('mousedown',  onHoldStart);
      btn.addEventListener('mouseup',    onHoldEnd);

      this._floatBtn.appendChild(btn);
    });

    // Botón para abrir panel completo
    const manageBtn = document.createElement('button');
    manageBtn.textContent = '⚔';
    Object.assign(manageBtn.style, {
      width          : '30px',
      height         : '30px',
      borderRadius   : '50%',
      border         : '1px solid rgba(201,168,76,0.4)',
      background     : 'rgba(10,8,20,0.88)',
      color          : '#c9a84c',
      fontSize       : '13px',
      cursor         : 'pointer',
      WebkitTapHighlightColor: 'transparent',
      boxShadow      : '0 2px 6px rgba(0,0,0,0.5)',
      alignSelf      : 'center',
    });
    const onManage = (e) => { e.preventDefault(); this.toggle(); };
    manageBtn.addEventListener('touchstart', onManage, { passive: false });
    manageBtn.addEventListener('click', onManage);
    this._floatBtn.appendChild(manageBtn);
  }

  // ── Panel completo ───────────────────────────────────────────────────────

  _buildPanel() {
    this._panel = document.createElement('div');
    Object.assign(this._panel.style, {
      position      : 'fixed',
      inset         : '0',
      display       : 'none',
      flexDirection : 'column',
      background    : 'rgba(4,2,12,0.94)',
      zIndex        : '200',
      fontFamily    : 'monospace',
      backdropFilter: 'blur(6px)',
      overflowY     : 'auto',
    });

    // Header
    const header = document.createElement('div');
    Object.assign(header.style, {
      display       : 'flex',
      alignItems    : 'center',
      justifyContent: 'space-between',
      padding       : '12px 16px 8px',
      borderBottom  : '1px solid rgba(255,255,255,0.06)',
    });
    header.innerHTML = `<div style="color:#aaaacc;font-size:10px;letter-spacing:4px;">— EQUIPO —</div>`;
    const closeBtn = document.createElement('button');
    closeBtn.textContent = '✕';
    Object.assign(closeBtn.style, {
      background: 'transparent', border: 'none',
      color: '#666688', fontSize: '16px', cursor: 'pointer',
      WebkitTapHighlightColor: 'transparent',
    });
    const onClose = (e) => { e.preventDefault(); this.close(); };
    closeBtn.addEventListener('touchstart', onClose, { passive: false });
    closeBtn.addEventListener('click', onClose);
    header.appendChild(closeBtn);
    this._panel.appendChild(header);

    // Contenido
    this._panelBody = document.createElement('div');
    Object.assign(this._panelBody.style, {
      flex   : '1',
      padding: '12px 14px',
      display: 'flex',
      flexDirection: 'column',
      gap    : '16px',
    });
    this._panel.appendChild(this._panelBody);
    document.body.appendChild(this._panel);
  }

  _renderPanel() {
    this._panelBody.innerHTML = '';

    // ── Sección: Slots del equipo (máx 4) ───────────────────────────────
    const slotsTitle = document.createElement('div');
    slotsTitle.textContent = 'EQUIPO ACTIVO';
    slotsTitle.style.cssText = 'font-size:9px;color:#666688;letter-spacing:3px;';
    this._panelBody.appendChild(slotsTitle);

    const slotsRow = document.createElement('div');
    Object.assign(slotsRow.style, {
      display: 'grid',
      gridTemplateColumns: 'repeat(4, 1fr)',
      gap    : '8px',
    });

    for (let i = 0; i < 4; i++) {
      const slot = document.createElement('div');
      const charId = this._team[i];
      const char   = charId ? ALL_CHARS.find(c => c.id === charId) : null;
      const isActive = i === this._activeIdx;

      Object.assign(slot.style, {
        background  : char
          ? `linear-gradient(135deg, ${char.color}22, rgba(10,8,24,0.95))`
          : 'rgba(10,8,24,0.6)',
        border      : `2px solid ${isActive && char ? char.color : 'rgba(255,255,255,0.08)'}`,
        borderRadius: '10px',
        padding     : '10px 6px',
        display     : 'flex',
        flexDirection: 'column',
        alignItems  : 'center',
        gap         : '4px',
        minHeight   : '80px',
        cursor      : char ? 'pointer' : 'default',
        position    : 'relative',
        WebkitTapHighlightColor: 'transparent',
      });

      if (char) {
        // Avatar
        const avatar = document.createElement('div');
        avatar.textContent = char.avatar;
        avatar.style.cssText = `
          width:36px;height:36px;border-radius:50%;
          background:radial-gradient(circle at 35% 35%, ${char.color}66, rgba(8,6,18,0.95));
          border:2px solid ${char.color};
          display:flex;align-items:center;justify-content:center;
          font-size:14px;font-weight:bold;color:#fff;
          box-shadow:0 0 10px ${char.color}66;
        `;
        slot.appendChild(avatar);

        const name = document.createElement('div');
        name.textContent = char.name;
        name.style.cssText = `font-size:9px;color:#fff;letter-spacing:1px;`;
        slot.appendChild(name);

        const el = ELEMENTS.find(e => e.id === char.element);
        const elBadge = document.createElement('div');
        elBadge.textContent = el?.icon ?? '';
        elBadge.style.cssText = `font-size:11px;`;
        slot.appendChild(elBadge);

        // Botón quitar
        const removeBtn = document.createElement('div');
        removeBtn.textContent = '✕';
        removeBtn.style.cssText = `
          position:absolute;top:4px;right:6px;
          font-size:9px;color:#666688;cursor:pointer;
        `;
        const onRemove = (e) => {
          e.preventDefault();
          e.stopPropagation();
          if (this._team.length <= 1) return;
          this._team.splice(i, 1);
          if (this._activeIdx >= this._team.length) this._activeIdx = 0;
          this._renderPanel();
        };
        removeBtn.addEventListener('touchstart', onRemove, { passive: false });
        removeBtn.addEventListener('click', onRemove);
        slot.appendChild(removeBtn);

        // Tap → activar este personaje
        const onActivate = (e) => {
          e.preventDefault();
          this.switchTo(i);
          this._renderPanel();
        };
        slot.addEventListener('touchstart', onActivate, { passive: false });
        slot.addEventListener('click', onActivate);

      } else {
        // Slot vacío con +
        const plus = document.createElement('div');
        plus.textContent = '+';
        plus.style.cssText = `
          font-size:24px;color:rgba(255,255,255,0.2);
          display:flex;align-items:center;justify-content:center;
          width:100%;height:100%;
        `;
        slot.appendChild(plus);

        // Al presionar + → mostrar selector de personaje
        const onAdd = (e) => {
          e.preventDefault();
          this._showCharPicker(i);
        };
        slot.style.cursor = 'pointer';
        slot.addEventListener('touchstart', onAdd, { passive: false });
        slot.addEventListener('click', onAdd);
      }

      slotsRow.appendChild(slot);
    }
    this._panelBody.appendChild(slotsRow);

    // ── Sección: Todos los personajes ────────────────────────────────────
    const allTitle = document.createElement('div');
    allTitle.textContent = 'PERSONAJES';
    allTitle.style.cssText = 'font-size:9px;color:#666688;letter-spacing:3px;margin-top:4px;';
    this._panelBody.appendChild(allTitle);

    const grid = document.createElement('div');
    Object.assign(grid.style, {
      display: 'grid',
      gridTemplateColumns: 'repeat(4, 1fr)',
      gap    : '8px',
    });

    ALL_CHARS.forEach(char => {
      const inTeam = this._team.includes(char.id);
      const card   = document.createElement('div');
      Object.assign(card.style, {
        background  : inTeam
          ? `linear-gradient(135deg, ${char.color}33, rgba(10,8,24,0.95))`
          : 'rgba(10,8,24,0.7)',
        border      : `2px solid ${inTeam ? char.color : 'rgba(255,255,255,0.07)'}`,
        borderRadius: '10px',
        padding     : '8px 4px',
        display     : 'flex',
        flexDirection: 'column',
        alignItems  : 'center',
        gap         : '3px',
        opacity     : char.unlocked ? '1' : '0.4',
        cursor      : char.unlocked ? 'pointer' : 'default',
        position    : 'relative',
        WebkitTapHighlightColor: 'transparent',
      });

      const avatar = document.createElement('div');
      avatar.textContent = char.avatar;
      avatar.style.cssText = `
        width:32px;height:32px;border-radius:50%;
        background:radial-gradient(circle at 35% 35%, ${char.color}55, rgba(8,6,18,0.95));
        border:2px solid ${inTeam ? char.color : 'rgba(255,255,255,0.15)'};
        display:flex;align-items:center;justify-content:center;
        font-size:13px;font-weight:bold;color:#fff;
      `;
      card.appendChild(avatar);

      const el = ELEMENTS.find(e => e.id === char.element);
      card.innerHTML += `
        <div style="font-size:9px;color:${char.unlocked ? '#fff' : '#555'};letter-spacing:1px;">${char.name}</div>
        <div style="font-size:11px;">${el?.icon ?? ''}</div>
      `;
      card.querySelector('div').appendChild(avatar);

      if (!char.unlocked) {
        const lock = document.createElement('div');
        lock.textContent = '🔒';
        lock.style.cssText = 'position:absolute;top:3px;right:4px;font-size:9px;';
        card.appendChild(lock);
      }

      if (char.unlocked) {
        const onToggle = (e) => {
          e.preventDefault();
          if (inTeam) {
            if (this._team.length <= 1) return;
            this._team = this._team.filter(id => id !== char.id);
            if (this._activeIdx >= this._team.length) this._activeIdx = 0;
          } else {
            if (this._team.length >= 4) return;
            this._team.push(char.id);
          }
          this._renderPanel();
        };
        card.addEventListener('touchstart', onToggle, { passive: false });
        card.addEventListener('click', onToggle);
      }

      grid.appendChild(card);
    });
    this._panelBody.appendChild(grid);

    // ── Sección: Círculo de elementos ────────────────────────────────────
    const elTitle = document.createElement('div');
    elTitle.textContent = 'ELEMENTOS ACTIVOS';
    elTitle.style.cssText = 'font-size:9px;color:#666688;letter-spacing:3px;margin-top:4px;';
    this._panelBody.appendChild(elTitle);

    this._panelBody.appendChild(this._buildElementCircle());
  }

  // ── Selector rápido de personaje para slot ───────────────────────────────

  _showCharPicker(slotIdx) {
    const existing = document.getElementById('char-picker');
    if (existing) existing.remove();

    const picker = document.createElement('div');
    picker.id = 'char-picker';
    Object.assign(picker.style, {
      position      : 'fixed',
      inset         : '0',
      background    : 'rgba(0,0,0,0.7)',
      zIndex        : '210',
      display       : 'flex',
      alignItems    : 'center',
      justifyContent: 'center',
      backdropFilter: 'blur(4px)',
    });

    const box = document.createElement('div');
    Object.assign(box.style, {
      background  : 'rgba(8,6,20,0.98)',
      border      : '1px solid rgba(255,255,255,0.1)',
      borderRadius: '14px',
      padding     : '16px',
      width       : '280px',
      fontFamily  : 'monospace',
    });

    const title = document.createElement('div');
    title.textContent = 'SELECCIONAR PERSONAJE';
    title.style.cssText = 'font-size:9px;color:#666688;letter-spacing:3px;margin-bottom:12px;text-align:center;';
    box.appendChild(title);

    const grid = document.createElement('div');
    grid.style.cssText = 'display:grid;grid-template-columns:repeat(4,1fr);gap:8px;';

    ALL_CHARS.forEach(char => {
      if (!char.unlocked || this._team.includes(char.id)) return;
      const btn = document.createElement('button');
      btn.style.cssText = `
        background:radial-gradient(circle at 35% 35%, ${char.color}44, rgba(8,6,18,0.95));
        border:2px solid ${char.color};
        border-radius:10px;padding:8px 4px;
        display:flex;flex-direction:column;align-items:center;gap:3px;
        cursor:pointer;WebkitTapHighlightColor:transparent;
      `;
      const el = ELEMENTS.find(e => e.id === char.element);
      btn.innerHTML = `
        <div style="font-size:18px;font-weight:bold;color:#fff;">${char.avatar}</div>
        <div style="font-size:8px;color:#fff;letter-spacing:1px;">${char.name}</div>
        <div style="font-size:10px;">${el?.icon ?? ''}</div>
      `;
      const onPick = (e) => {
        e.preventDefault();
        this._team[slotIdx] = char.id;
        picker.remove();
        this._renderPanel();
      };
      btn.addEventListener('touchstart', onPick, { passive: false });
      btn.addEventListener('click', onPick);
      grid.appendChild(btn);
    });

    box.appendChild(grid);

    const cancelBtn = document.createElement('button');
    cancelBtn.textContent = 'Cancelar';
    cancelBtn.style.cssText = `
      margin-top:12px;width:100%;background:transparent;
      border:1px solid rgba(255,255,255,0.1);color:#666688;
      padding:6px;border-radius:8px;cursor:pointer;
      font-family:monospace;font-size:10px;letter-spacing:2px;
    `;
    const onCancel = (e) => { e.preventDefault(); picker.remove(); };
    cancelBtn.addEventListener('touchstart', onCancel, { passive: false });
    cancelBtn.addEventListener('click', onCancel);
    box.appendChild(cancelBtn);

    picker.appendChild(box);
    picker.addEventListener('click', (e) => { if (e.target === picker) picker.remove(); });
    document.body.appendChild(picker);
  }

  // ── Círculo de elementos ─────────────────────────────────────────────────

  _buildElementCircle() {
    const activeElements = this._team
      .map(id => ALL_CHARS.find(c => c.id === id)?.element)
      .filter(Boolean);

    const wrap = document.createElement('div');
    wrap.style.cssText = `
      position:relative;
      width:200px;height:200px;
      margin:0 auto;
    `;

    const cx = 100, cy = 100, r = 72;

    ELEMENTS.forEach((el, i) => {
      const angle = (Math.PI * 2 / ELEMENTS.length) * i - Math.PI / 2;
      const x = cx + r * Math.cos(angle) - 22;
      const y = cy + r * Math.sin(angle) - 22;
      const isActive = activeElements.includes(el.id);

      const node = document.createElement('div');
      node.style.cssText = `
        position:absolute;
        left:${x}px;top:${y}px;
        width:44px;height:44px;
        border-radius:50%;
        border:2px solid ${isActive ? el.color : 'rgba(255,255,255,0.1)'};
        background:${isActive
          ? `radial-gradient(circle at 35% 35%, ${el.color}44, rgba(8,6,18,0.95))`
          : 'rgba(8,6,18,0.8)'};
        display:flex;flex-direction:column;align-items:center;justify-content:center;
        cursor:pointer;
        box-shadow:${isActive ? `0 0 14px ${el.color}88` : 'none'};
        transition:box-shadow 0.2s;
        WebkitTapHighlightColor:transparent;
        gap:1px;
      `;
      node.innerHTML = `
        <div style="font-size:16px;">${el.icon}</div>
        <div style="font-size:7px;color:${isActive ? el.color : '#444466'};letter-spacing:0.5px;">${el.label}</div>
      `;

      // Al presionar → mostrar reacciones de este elemento
      const onPress = (e) => {
        e.preventDefault();
        this._showReactions(el, node);
      };
      node.addEventListener('touchstart', onPress, { passive: false });
      node.addEventListener('click', onPress);
      wrap.appendChild(node);
    });

    return wrap;
  }

  // ── Tooltip de reacciones ────────────────────────────────────────────────

  _buildReactionTip() {
    this._reactionTip = document.createElement('div');
    Object.assign(this._reactionTip.style, {
      position      : 'fixed',
      background    : 'rgba(8,6,20,0.97)',
      border        : '1px solid rgba(255,255,255,0.12)',
      borderRadius  : '12px',
      padding       : '12px',
      zIndex        : '220',
      fontFamily    : 'monospace',
      width         : '220px',
      display       : 'none',
      flexDirection : 'column',
      gap           : '8px',
      boxShadow     : '0 4px 20px rgba(0,0,0,0.6)',
    });
    document.body.appendChild(this._reactionTip);
  }

  _showReactions(el, node) {
    const tip = this._reactionTip;
    tip.innerHTML = '';

    const title = document.createElement('div');
    title.innerHTML = `<span style="font-size:16px;">${el.icon}</span> <span style="font-size:10px;color:${el.color};letter-spacing:2px;">${el.label.toUpperCase()}</span>`;
    title.style.cssText = 'display:flex;align-items:center;gap:6px;padding-bottom:6px;border-bottom:1px solid rgba(255,255,255,0.06);';
    tip.appendChild(title);

    // Buscar reacciones que involucren este elemento
    let found = false;
    Object.entries(REACTIONS).forEach(([key, rxn]) => {
      const [a, b] = key.split('+');
      if (a !== el.id && b !== el.id) return;
      found = true;
      const otherId = a === el.id ? b : a;
      const other   = ELEMENTS.find(e => e.id === otherId);

      const row = document.createElement('div');
      row.style.cssText = `
        display:flex;align-items:flex-start;gap:8px;
        background:rgba(255,255,255,0.03);
        border-radius:8px;padding:6px 8px;
      `;
      row.innerHTML = `
        <div style="font-size:18px;">${rxn.icon}</div>
        <div style="display:flex;flex-direction:column;gap:2px;">
          <div style="font-size:9px;color:${rxn.color};letter-spacing:1px;">${rxn.name}</div>
          <div style="font-size:8px;color:#555577;">
            ${el.icon} + ${other?.icon ?? ''} ${other?.label ?? ''}
          </div>
          <div style="font-size:8px;color:#888899;line-height:1.4;">${rxn.desc}</div>
        </div>
      `;
      tip.appendChild(row);
    });

    if (!found) {
      const none = document.createElement('div');
      none.textContent = 'Sin reacciones disponibles.';
      none.style.cssText = 'font-size:9px;color:#444466;text-align:center;padding:8px 0;';
      tip.appendChild(none);
    }

    const closeR = document.createElement('button');
    closeR.textContent = 'Cerrar';
    closeR.style.cssText = `
      background:transparent;border:1px solid rgba(255,255,255,0.08);
      color:#444466;padding:4px;border-radius:6px;cursor:pointer;
      font-family:monospace;font-size:9px;letter-spacing:1px;
      margin-top:2px;
    `;
    const onCloseR = (e) => { e.preventDefault(); tip.style.display = 'none'; };
    closeR.addEventListener('touchstart', onCloseR, { passive: false });
    closeR.addEventListener('click', onCloseR);
    tip.appendChild(closeR);

    // Posicionar cerca del nodo presionado
    const rect = node.getBoundingClientRect();
    tip.style.display = 'flex';
    tip.style.left = `${Math.min(rect.left, window.innerWidth - 240)}px`;
    tip.style.top  = `${Math.max(rect.top - 20, 10)}px`;
  }
}
