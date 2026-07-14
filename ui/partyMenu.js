// ui/partyMenu.js — Menú de equipo | Ashes of the Reborn | Valiant Gaming

import { PARTY_ELEMENTS, PARTY_REACTIONS, PARTY_CHARACTERS } from '../data/palette.js';

const ELEMENTS   = PARTY_ELEMENTS;
const REACTIONS  = PARTY_REACTIONS;
const ALL_CHARS  = PARTY_CHARACTERS;

export class PartyMenu {
  constructor() {
    this._team       = ['kael', 'mika'];
    this._activeIdx  = 0;
    this._panelOpen  = false;
    this._floatBtn   = null;
    this._panel      = null;
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
    if (idx === 0) window._partyManager?.switchTo?.(0);
    if (idx === 1) window._partyManager?.switchTo?.(1);
  }

  open()   { this._panelOpen = true;  this._panel.style.display = 'flex'; this._renderPanel(); }
  close()  { this._panelOpen = false; this._panel.style.display = 'none'; this._reactionTip.style.display = 'none'; this._updateFloat(); }
  toggle() { this._panelOpen ? this.close() : this.open(); }
  destroy(){ this._floatBtn?.remove(); this._panel?.remove(); this._reactionTip?.remove(); }

  // ── Botón flotante ───────────────────────────────────────────────────────

  _buildFloat() {
    this._floatBtn = document.createElement('div');
    Object.assign(this._floatBtn.style, {
      position     : 'fixed',
      bottom       : '90px',
      left         : '12px',
      display      : 'none',
      flexDirection: 'column',
      gap          : '2px',
      zIndex       : '130',
      pointerEvents: 'all',
    });
    document.body.appendChild(this._floatBtn);
  }

  _updateFloat() {
    this._floatBtn.innerHTML = '';
    const team = this._team.map(id => ALL_CHARS.find(c => c.id === id));

    // Grid de 4 por fila
    const grid = document.createElement('div');
    Object.assign(grid.style, {
      display             : 'grid',
      gridTemplateColumns : 'repeat(4, 36px)',
      gap                 : '3px',
    });

    team.forEach((char, i) => {
      const isActive = i === this._activeIdx;
      const btn = document.createElement('button');
      btn.textContent = char.avatar;
      Object.assign(btn.style, {
        width          : '36px',
        height         : '36px',
        borderRadius   : '50%',
        border         : `2px solid ${isActive ? char.color : 'rgba(255,255,255,0.2)'}`,
        background     : `radial-gradient(circle at 35% 35%, ${char.color}66, rgba(8,6,18,0.95))`,
        color          : '#fff',
        fontSize       : '13px',
        fontFamily     : 'monospace',
        fontWeight     : 'bold',
        cursor         : 'pointer',
        WebkitTapHighlightColor: 'transparent',
        boxShadow      : isActive ? `0 0 12px ${char.color}88` : '0 2px 6px rgba(0,0,0,0.5)',
        transition     : 'all 0.15s',
        pointerEvents  : 'all',
      });

      // Tap → switch
      let holdT = null;
      let didHold = false;

      const onStart = (e) => {
        e.preventDefault();
        didHold = false;
        holdT = setTimeout(() => {
          didHold = true;
          this.open();
        }, 400);
      };
      const onEnd = (e) => {
        e.preventDefault();
        clearTimeout(holdT);
        if (!didHold) this.switchTo(i);
      };

      btn.addEventListener('touchstart', onStart, { passive: false });
      btn.addEventListener('touchend',   onEnd,   { passive: false });
      btn.addEventListener('mousedown',  onStart);
      btn.addEventListener('mouseup',    onEnd);

      grid.appendChild(btn);
    });

    this._floatBtn.appendChild(grid);
  }

  // ── Panel ────────────────────────────────────────────────────────────────

  _buildPanel() {
    this._panel = document.createElement('div');
    Object.assign(this._panel.style, {
      position      : 'fixed',
      inset         : '0',
      display       : 'none',
      flexDirection : 'column',
      background    : 'rgba(4,2,12,0.96)',
      zIndex         : '200',
      fontFamily    : 'monospace',
      backdropFilter: 'blur(8px)',
    });

    // Header
    const header = document.createElement('div');
    Object.assign(header.style, {
      display        : 'flex',
      alignItems     : 'center',
      justifyContent : 'space-between',
      padding        : '10px 16px 8px',
      borderBottom   : '1px solid rgba(255,255,255,0.06)',
      flexShrink     : '0',
    });

    const titleEl = document.createElement('div');
    titleEl.textContent = '— EQUIPO —';
    titleEl.style.cssText = 'color:#aaaacc;font-size:10px;letter-spacing:4px;';
    header.appendChild(titleEl);

    const closeBtn = document.createElement('button');
    closeBtn.textContent = '✕';
    Object.assign(closeBtn.style, {
      background: 'transparent', border: 'none',
      color: '#666688', fontSize: '18px', cursor: 'pointer',
      WebkitTapHighlightColor: 'transparent', padding: '4px 8px',
    });
    const onClose = (e) => { e.preventDefault(); this.close(); };
    closeBtn.addEventListener('touchstart', onClose, { passive: false });
    closeBtn.addEventListener('click', onClose);
    header.appendChild(closeBtn);
    this._panel.appendChild(header);

    // Cuerpo
    this._panelBody = document.createElement('div');
    Object.assign(this._panelBody.style, {
      flex          : '1',
      display       : 'flex',
      flexDirection : 'row',
      padding       : '16px',
      gap           : '16px',
      overflowY     : 'auto',
    });
    this._panel.appendChild(this._panelBody);

    document.body.appendChild(this._panel);
  }

  _renderPanel() {
    this._panelBody.innerHTML = '';

    // ── Columna izquierda: 4 slots grandes ──────────────────────────────
    const slotsCol = document.createElement('div');
    Object.assign(slotsCol.style, {
      display       : 'flex',
      flexDirection : 'column',
      gap           : '10px',
      flex          : '1',
    });

    const slotsTitle = document.createElement('div');
    slotsTitle.textContent = 'EQUIPO ACTIVO';
    slotsTitle.style.cssText = 'font-size:9px;color:#666688;letter-spacing:3px;';
    slotsCol.appendChild(slotsTitle);

    // 4 slots en fila horizontal
    const slotsRow = document.createElement('div');
    Object.assign(slotsRow.style, {
      display             : 'grid',
      gridTemplateColumns : 'repeat(4, 1fr)',
      gap                 : '10px',
    });

    for (let i = 0; i < 4; i++) {
      const charId = this._team[i];
      const char   = charId ? ALL_CHARS.find(c => c.id === charId) : null;
      const isActive = i === this._activeIdx;

      const slot = document.createElement('div');
      Object.assign(slot.style, {
        background   : char
          ? `linear-gradient(160deg, ${char.color}33, rgba(8,6,20,0.98))`
          : 'rgba(10,8,24,0.6)',
        border       : `2px solid ${isActive && char ? char.color : 'rgba(255,255,255,0.08)'}`,
        borderRadius : '14px',
        padding      : '14px 8px',
        display      : 'flex',
        flexDirection: 'column',
        alignItems   : 'center',
        justifyContent: 'center',
        gap          : '6px',
        minHeight    : '120px',
        cursor       : char ? 'pointer' : 'pointer',
        position     : 'relative',
        boxShadow    : isActive && char ? `0 0 18px ${char.color}44` : 'none',
        WebkitTapHighlightColor: 'transparent',
        transition   : 'border-color 0.15s, box-shadow 0.15s',
      });

      if (char) {
        // Avatar grande
        const avatar = document.createElement('div');
        avatar.textContent = char.avatar;
        avatar.style.cssText = `
          width:54px;height:54px;border-radius:50%;
          background:radial-gradient(circle at 35% 35%, ${char.color}66, rgba(8,6,18,0.95));
          border:3px solid ${char.color};
          display:flex;align-items:center;justify-content:center;
          font-size:20px;font-weight:bold;color:#fff;
          box-shadow:0 0 16px ${char.color}66;
        `;
        slot.appendChild(avatar);

        const name = document.createElement('div');
        name.textContent = char.name;
        name.style.cssText = `font-size:10px;color:#fff;letter-spacing:2px;`;
        slot.appendChild(name);

        const el = ELEMENTS.find(e => e.id === char.element);
        const elRow = document.createElement('div');
        elRow.style.cssText = 'display:flex;align-items:center;gap:4px;';
        elRow.innerHTML = `
          <span style="font-size:13px;">${el?.icon ?? ''}</span>
          <span style="font-size:8px;color:${char.color};letter-spacing:1px;">${el?.label ?? ''}</span>
        `;
        slot.appendChild(elRow);

        if (isActive) {
          const activeBadge = document.createElement('div');
          activeBadge.textContent = 'ACTIVO';
          activeBadge.style.cssText = `
            font-size:7px;color:${char.color};letter-spacing:2px;
            border:1px solid ${char.color}88;border-radius:4px;padding:1px 5px;
          `;
          slot.appendChild(activeBadge);
        }

        // Botón quitar
        const removeBtn = document.createElement('div');
        removeBtn.textContent = '✕';
        removeBtn.style.cssText = `
          position:absolute;top:6px;right:8px;
          font-size:10px;color:#444466;cursor:pointer;padding:2px;
        `;
        const onRemove = (e) => {
          e.preventDefault(); e.stopPropagation();
          if (this._team.length <= 1) return;
          this._team.splice(i, 1);
          if (this._activeIdx >= this._team.length) this._activeIdx = 0;
          this._renderPanel();
          this._updateFloat();
        };
        removeBtn.addEventListener('touchstart', onRemove, { passive: false });
        removeBtn.addEventListener('click', onRemove);
        slot.appendChild(removeBtn);

        const onActivate = (e) => {
          e.preventDefault();
          this.switchTo(i);
          this._renderPanel();
        };
        slot.addEventListener('touchstart', onActivate, { passive: false });
        slot.addEventListener('click', onActivate);

      } else {
        // Slot vacío
        const plus = document.createElement('div');
        plus.textContent = '+';
        plus.style.cssText = `
          font-size:32px;color:rgba(255,255,255,0.15);
          line-height:1;
        `;
        slot.appendChild(plus);

        const hint = document.createElement('div');
        hint.textContent = 'Añadir';
        hint.style.cssText = 'font-size:8px;color:#333355;letter-spacing:1px;';
        slot.appendChild(hint);

        const onAdd = (e) => {
          e.preventDefault();
          this._showCharPicker(i);
        };
        slot.addEventListener('touchstart', onAdd, { passive: false });
        slot.addEventListener('click', onAdd);
      }

      slotsRow.appendChild(slot);
    }
    slotsCol.appendChild(slotsRow);

    // Botón para abrir picker de personajes
    const pickerBtn = document.createElement('button');
    pickerBtn.textContent = '+ Personajes';
    Object.assign(pickerBtn.style, {
      alignSelf    : 'flex-start',
      background   : 'rgba(10,8,24,0.8)',
      border       : '1px solid rgba(201,168,76,0.3)',
      color        : '#c9a84c',
      padding      : '6px 16px',
      borderRadius : '20px',
      cursor       : 'pointer',
      fontSize     : '10px',
      letterSpacing: '2px',
      fontFamily   : 'monospace',
      WebkitTapHighlightColor: 'transparent',
    });
    const onPickerOpen = (e) => {
      e.preventDefault();
      this._showCharPicker(this._team.length < 4 ? this._team.length : -1);
    };
    pickerBtn.addEventListener('touchstart', onPickerOpen, { passive: false });
    pickerBtn.addEventListener('click', onPickerOpen);
    slotsCol.appendChild(pickerBtn);

    this._panelBody.appendChild(slotsCol);

    // ── Columna derecha: círculo de elementos ────────────────────────────
    const elCol = document.createElement('div');
    Object.assign(elCol.style, {
      display       : 'flex',
      flexDirection : 'column',
      alignItems    : 'center',
      gap           : '8px',
      minWidth      : '220px',
    });

    const elTitle = document.createElement('div');
    elTitle.textContent = 'ELEMENTOS';
    elTitle.style.cssText = 'font-size:9px;color:#666688;letter-spacing:3px;';
    elCol.appendChild(elTitle);

    elCol.appendChild(this._buildElementCircle());
    this._panelBody.appendChild(elCol);
  }
