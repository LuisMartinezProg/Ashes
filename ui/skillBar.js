// ui/characterMenu.js — Ashes of the Reborn | Valiant Gaming

import { WEAPON_TREES, getTreeKey, WEAPON_CRYSTAL_MAP } from '../core/skillData.js';

export class CharacterMenu {
  constructor(progression, skillBar) {
    this._progression = progression;
    this._skillBar    = skillBar;
    this._open        = false;
    this._activeChar  = 0;
    this._equipped    = { arma: null, armadura: null, accesorio: null };
    this._subMenu     = null;
    this._buildUI();
  }

  // ── UI base ───────────────────────────────────────────────────────────────

  _buildUI() {
    this._overlay = document.createElement('div');
    Object.assign(this._overlay.style, {
      position     : 'fixed', inset: '0',
      background   : 'rgba(4,4,10,0.96)',
      zIndex       : '400', display: 'none',
      flexDirection: 'column',
    });

    const top = document.createElement('div');
    Object.assign(top.style, { display:'flex', flex:'1', overflow:'hidden' });

    this._leftCol = document.createElement('div');
    Object.assign(this._leftCol.style, {
      width        : '72px', display:'flex', flexDirection:'column',
      alignItems   : 'center', paddingTop:'16px', gap:'10px',
      borderRight  : '1px solid rgba(201,168,76,0.15)',
      background   : 'rgba(0,0,0,0.3)',
    });

    this._centerCol = document.createElement('div');
    Object.assign(this._centerCol.style, {
      flex:'1', display:'flex', alignItems:'center', justifyContent:'center',
    });

    this._rightCol = document.createElement('div');
    Object.assign(this._rightCol.style, {
      width         : '200px', display:'flex', flexDirection:'column',
      justifyContent: 'center', padding:'16px 14px',
      borderLeft    : '1px solid rgba(201,168,76,0.15)',
      background    : 'rgba(0,0,0,0.3)',
    });

    top.append(this._leftCol, this._centerCol, this._rightCol);

    const bottom = document.createElement('div');
    Object.assign(bottom.style, {
      display:'flex', justifyContent:'center', alignItems:'center',
      gap:'12px', padding:'12px 16px',
      borderTop :'1px solid rgba(201,168,76,0.2)',
      background: 'rgba(0,0,0,0.4)',
    });

    const bottomBtns = [
      { label:'📊 Atributos',   action:() => this._openSub('atributos')   },
      { label:'⚔️ Equipo',      action:() => this._openSub('equipo')      },
      { label:'✨ Habilidades', action:() => this._openSub('habilidades') },
      { label:'📖 Talentos',    action:() => this._openSub('talentos')    },
    ];

    for (const { label, action } of bottomBtns) {
      const btn = document.createElement('button');
      Object.assign(btn.style, {
        flex:'1', maxWidth:'120px', padding:'10px 8px',
        borderRadius:'10px', border:'1px solid rgba(201,168,76,0.35)',
        background:'rgba(201,168,76,0.08)', color:'#C9A84C',
        fontFamily:'monospace', fontSize:'10px', letterSpacing:'0.5px',
        cursor:'pointer', pointerEvents:'all', transition:'all 0.15s',
      });
      btn.textContent = label;
      btn.addEventListener('click', action);
      btn.addEventListener('touchstart', (e) => { e.preventDefault(); action(); }, { passive:false });
      btn.addEventListener('mouseenter', () => {
        btn.style.background = 'rgba(201,168,76,0.18)';
        btn.style.border     = '1px solid rgba(201,168,76,0.6)';
      });
      btn.addEventListener('mouseleave', () => {
        btn.style.background = 'rgba(201,168,76,0.08)';
        btn.style.border     = '1px solid rgba(201,168,76,0.35)';
      });
      bottom.appendChild(btn);
    }

    const closeBtn = document.createElement('button');
    Object.assign(closeBtn.style, {
      position:'absolute', top:'10px', right:'14px',
      background:'none', border:'none', color:'#C9A84C',
      fontSize:'22px', cursor:'pointer', pointerEvents:'all', zIndex:'401',
    });
    closeBtn.textContent = '✕';
    closeBtn.addEventListener('click', () => this.close());
    closeBtn.addEventListener('touchstart', (e) => { e.preventDefault(); this.close(); }, { passive:false });

    this._overlay.style.position = 'fixed';
    this._overlay.appendChild(closeBtn);
    this._overlay.append(top, bottom);
    document.body.appendChild(this._overlay);
  }

  // ── Render principal ──────────────────────────────────────────────────────

  _render() {
    this._renderLeft();
    this._renderCenter();
    this._renderRight();
  }

  _renderLeft() {
    this._leftCol.innerHTML = '';
    const chars = [
      { name:'Kael', icon:'⚔️', idx:0 },
      { name:'Mika', icon:'🏹', idx:1 },
    ];
    for (const c of chars) {
      const card   = document.createElement('div');
      const active = this._activeChar === c.idx;
      Object.assign(card.style, {
        width:'52px', height:'52px', borderRadius:'50%',
        border   : active ? '2px solid #C9A84C' : '2px solid rgba(201,168,76,0.2)',
        background: active ? 'rgba(201,168,76,0.18)' : 'rgba(201,168,76,0.05)',
        display:'flex', flexDirection:'column', alignItems:'center',
        justifyContent:'center', cursor:'pointer', pointerEvents:'all',
        transition:'all 0.2s',
        boxShadow: active ? '0 0 12px rgba(201,168,76,0.4)' : 'none',
      });
      const iconEl = document.createElement('div');
      iconEl.style.fontSize = '20px';
      iconEl.textContent    = c.icon;
      const nameEl = document.createElement('div');
      Object.assign(nameEl.style, {
        fontFamily:'monospace', fontSize:'7px', marginTop:'2px',
        color: active ? '#C9A84C' : 'rgba(201,168,76,0.5)',
      });
      nameEl.textContent = c.name;
      card.append(iconEl, nameEl);
      card.addEventListener('click', () => this._selectChar(c.idx));
      card.addEventListener('touchstart', (e) => { e.preventDefault(); this._selectChar(c.idx); }, { passive:false });
      this._leftCol.appendChild(card);
    }
  }

  _renderCenter() {
    this._centerCol.innerHTML = '';
    const avatars = ['⚔️','🏹'];
    const names   = ['KAEL','MIKA'];
    const level   = this._progression.getLevel();

    const wrap = document.createElement('div');
    Object.assign(wrap.style, {
      display:'flex', flexDirection:'column', alignItems:'center', gap:'6px',
    });

    const avatar = document.createElement('div');
    Object.assign(avatar.style, {
      fontSize:'80px', lineHeight:'1',
      filter:'drop-shadow(0 0 20px rgba(201,168,76,0.5))',
    });
    avatar.textContent = avatars[this._activeChar];

    const nameEl = document.createElement('div');
    Object.assign(nameEl.style, {
      fontFamily:"'Cinzel',serif", fontSize:'16px',
      letterSpacing:'4px', color:'#C9A84C',
    });
    nameEl.textContent = names[this._activeChar];

    const levelEl = document.createElement('div');
    Object.assign(levelEl.style, {
      fontFamily:'monospace', fontSize:'11px',
      color:'rgba(201,168,76,0.6)', letterSpacing:'2px',
    });
    levelEl.textContent = `Nv.${level}`;

    wrap.append(avatar, nameEl, levelEl);
    this._centerCol.appendChild(wrap);
  }

  _renderRight() {
    this._rightCol.innerHTML = '';
    const prog  = this._progression;
    const stats = prog.getStats();
    const eff   = window._effectiveStats ?? stats;
    const char  = this._activeChar === 0 ? window._player : window._companion;

    const statDefs = [
      { icon:'❤️', label:'HP',   value:`${char?.hp ?? '?'} / ${eff.maxHp ?? stats.maxHp}` },
      { icon:'⚔️', label:'ATK',  value: eff.atk   ?? stats.atk  },
      { icon:'🛡️', label:'DEF',  value: eff.def   ?? stats.def  },
      { icon:'💨', label:'VEL',  value:(stats.speed ?? 5).toFixed(1) },
      { icon:'✦',  label:'ÉTER', value: window._dungeonManager?.getEtherFragments?.() ?? 0 },
      { icon:'⭐', label:'REP',  value: prog.getReputation() },
    ];

    for (const { icon, label, value } of statDefs) {
      const row = document.createElement('div');
      Object.assign(row.style, {
        display:'flex', justifyContent:'space-between', alignItems:'center',
        padding:'5px 0', borderBottom:'1px solid rgba(201,168,76,0.08)',
      });
      const left = document.createElement('div');
      Object.assign(left.style, { fontFamily:'monospace', fontSize:'10px', color:'rgba(201,168,76,0.65)' });
      left.textContent = `${icon} ${label}`;
      const right = document.createElement('div');
      Object.assign(right.style, { fontFamily:'monospace', fontSize:'11px', color:'#C9A84C', fontWeight:'bold' });
      right.textContent = value;
      row.append(left, right);
      this._rightCol.appendChild(row);
    }
  }

  _selectChar(idx) {
    if (this._activeChar === idx) return;
    this._activeChar = idx;
    window._partyManager?.switchTo?.(idx);
    this._renderLeft();
    this._renderCenter();
    this._renderRight();
  }

  // ── Submenús ──────────────────────────────────────────────────────────────

  _openSub(type) {
    if (this._subMenu) { this._subMenu.remove(); this._subMenu = null; }

    const panel = document.createElement('div');
    Object.assign(panel.style, {
      position:'fixed', inset:'0',
      background:'rgba(4,4,10,0.97)',
      zIndex:'500', display:'flex', flexDirection:'column',
      alignItems:'center', paddingTop:'16px', overflowY:'auto',
    });

    const titles = {
      atributos  : '📊 ATRIBUTOS',
      equipo     : '⚔️ EQUIPO',
      habilidades: '✨ HABILIDADES',
      talentos   : '📖 TALENTOS',
    };

    const header = document.createElement('div');
    Object.assign(header.style, {
      width:'100%', maxWidth:'500px', display:'flex',
      justifyContent:'space-between', alignItems:'center',
      padding:'0 16px 12px',
      borderBottom:'1px solid rgba(201,168,76,0.2)',
    });

    const titleEl = document.createElement('div');
    Object.assign(titleEl.style, {
      fontFamily:"'Cinzel',serif", fontSize:'13px',
      letterSpacing:'3px', color:'#C9A84C',
    });
    titleEl.textContent = titles[type] ?? type.toUpperCase();

    const backBtn = document.createElement('button');
    Object.assign(backBtn.style, {
      background:'none', border:'none', color:'#C9A84C',
      fontSize:'20px', cursor:'pointer', pointerEvents:'all',
    });
    backBtn.textContent = '←';
    backBtn.addEventListener('click', () => { panel.remove(); this._subMenu = null; });
    backBtn.addEventListener('touchstart', (e) => { e.preventDefault(); panel.remove(); this._subMenu = null; }, { passive:false });

    header.append(titleEl, backBtn);

    const body = document.createElement('div');
    Object.assign(body.style, { width:'100%', maxWidth:'500px', padding:'16px' });

    if (type === 'atributos')   this._fillAtributos(body);
    if (type === 'equipo')      this._fillEquipo(body, panel);
    if (type === 'habilidades') this._fillHabilidades(body);
    if (type === 'talentos')    this._fillTalentos(body);

    panel.append(header, body);
    document.body.appendChild(panel);
    this._subMenu = panel;
  }

  // ── Atributos ─────────────────────────────────────────────────────────────

  _fillAtributos(body) {
    const prog  = this._progression;
    const stats = prog.getStats();
    const eff   = window._effectiveStats ?? stats;
    const char  = this._activeChar === 0 ? window._player : window._companion;

    const defs = [
      { icon:'❤️', label:'HP Máx',        value: eff.maxHp ?? stats.maxHp },
      { icon:'❤️', label:'HP Actual',      value: char?.hp ?? '?' },
      { icon:'⚔️', label:'ATK',            value: eff.atk  ?? stats.atk },
      { icon:'🛡️', label:'DEF',            value: eff.def  ?? stats.def },
      { icon:'💨', label:'VEL',            value:(stats.speed ?? 5).toFixed(1) },
      { icon:'✦',  label:'Éter',           value: window._dungeonManager?.getEtherFragments?.() ?? 0 },
      { icon:'⭐', label:'Reputación',     value: prog.getReputation() },
      { icon:'🪄', label:'Energía Mágica', value: prog.getMagicEnergy() },
    ];

    for (const { icon, label, value } of defs) {
      const row = document.createElement('div');
      Object.assign(row.style, {
        display:'flex', justifyContent:'space-between',
        padding:'10px 12px', borderRadius:'8px', marginBottom:'6px',
        background:'rgba(201,168,76,0.05)',
        border:'1px solid rgba(201,168,76,0.1)',
      });
      row.innerHTML = `
        <span style="font-family:monospace;font-size:11px;color:rgba(201,168,76,0.7)">${icon} ${label}</span>
        <span style="font-family:monospace;font-size:12px;color:#C9A84C;font-weight:bold">${value}</span>
      `;
      body.appendChild(row);
    }

    // ── Barra XP personaje ────────────────────────────────────────────────
    const sep = document.createElement('div');
    sep.style.cssText = 'border-top:1px solid rgba(201,168,76,0.15);margin-top:10px;padding-top:12px;';
    body.appendChild(sep);

    this._buildXPRow(sep, prog);
  }

  _buildXPRow(container, prog) {
    const level    = prog.getLevel();
    const maxLevel = 20;
    const atMax    = level >= maxLevel;
    const xp       = prog.getTotalXP();
    const next     = prog.getXPForNextLevel();
    const pct      = Math.round(prog.getXPProgress() * 100);

    const xpRow = document.createElement('div');
    Object.assign(xpRow.style, {
      display:'flex', alignItems:'center', gap:'8px', marginBottom:'4px',
    });

    const xpLabel = document.createElement('div');
    Object.assign(xpLabel.style, {
      fontFamily:'monospace', fontSize:'9px',
      color:'rgba(201,168,76,0.55)', letterSpacing:'1px', whiteSpace:'nowrap',
    });
    xpLabel.textContent = atMax ? 'NV. MÁX' : `${xp} / ${next} XP`;

    const xpBarWrap = document.createElement('div');
    Object.assign(xpBarWrap.style, {
      flex:'1', height:'5px', background:'rgba(201,168,76,0.12)',
      borderRadius:'3px', overflow:'hidden',
    });
    const xpFill = document.createElement('div');
    Object.assign(xpFill.style, {
      height:'100%', width: atMax ? '100%' : `${pct}%`,
      background: atMax
        ? 'linear-gradient(90deg,#C9A84C,#ffe8a0)'
        : 'linear-gradient(90deg,#7A6030,#C9A84C)',
      transition:'width 0.4s ease',
    });
    xpBarWrap.appendChild(xpFill);

    const plusBtn = document.createElement('button');
    Object.assign(plusBtn.style, {
      width:'22px', height:'22px', borderRadius:'50%',
      border: atMax ? '1px solid rgba(201,168,76,0.15)' : '1px solid rgba(201,168,76,0.6)',
      background: atMax ? 'rgba(201,168,76,0.04)' : 'rgba(201,168,76,0.15)',
      color: atMax ? 'rgba(201,168,76,0.2)' : '#C9A84C',
      fontSize:'14px', lineHeight:'1', cursor: atMax ? 'default' : 'pointer',
      pointerEvents:'all', display:'flex', alignItems:'center',
      justifyContent:'center', flexShrink:'0', transition:'all 0.15s',
    });
    plusBtn.textContent = '+';

    if (!atMax) {
      const open = () => this._openLevelUpPanel(container, prog);
      plusBtn.addEventListener('click', open);
      plusBtn.addEventListener('touchstart', (e) => { e.preventDefault(); open(); }, { passive:false });
      plusBtn.addEventListener('mouseenter', () => {
        plusBtn.style.background = 'rgba(201,168,76,0.3)';
        plusBtn.style.boxShadow  = '0 0 8px rgba(201,168,76,0.4)';
      });
      plusBtn.addEventListener('mouseleave', () => {
        plusBtn.style.background = 'rgba(201,168,76,0.15)';
        plusBtn.style.boxShadow  = 'none';
      });
    }

    xpRow.append(xpLabel, xpBarWrap, plusBtn);
    container.appendChild(xpRow);
  }

  _openLevelUpPanel(parentBody, prog) {
    const existing = document.getElementById('_levelup_panel');
    if (existing) existing.remove();

    const level      = prog.getLevel();
    const maxLevel   = 20;
    const nucleoCost = 1 + Math.floor(level / 5);
    const inv        = window._inventory;
    const nucleoQty  = inv?._items?.materiales?.find?.(i => i.id === 'nucleoArcano')?.qty ?? 0;
    const canConfirm = nucleoQty >= nucleoCost;

    const panel = document.createElement('div');
    panel.id = '_levelup_panel';
    Object.assign(panel.style, {
      position:'fixed', top:'50%', left:'50%',
      transform:'translate(-50%,-50%)',
      background:'rgba(4,4,10,0.98)',
      border:'1px solid rgba(201,168,76,0.4)',
      borderRadius:'16px', padding:'24px 28px',
      zIndex:'700', minWidth:'240px', maxWidth:'90vw',
      display:'flex', flexDirection:'column', alignItems:'center',
      gap:'14px', boxShadow:'0 0 40px rgba(201,168,76,0.2)',
    });

    const titleEl = document.createElement('div');
    Object.assign(titleEl.style, {
      fontFamily:"'Cinzel',serif", fontSize:'13px',
      letterSpacing:'3px', color:'#C9A84C', textAlign:'center',
    });
    titleEl.textContent = `SUBIR A NIVEL ${level + 1}`;

    const matRow = document.createElement('div');
    Object.assign(matRow.style, {
      display:'flex', alignItems:'center', justifyContent:'space-between',
      width:'100%', padding:'10px 14px', borderRadius:'10px',
      background:'rgba(201,168,76,0.06)',
      border:'1px solid rgba(201,168,76,0.15)',
    });
    matRow.innerHTML = `
      <div style="display:flex;align-items:center;gap:8px">
        <span style="font-size:20px">🔮</span>
        <span style="font-family:monospace;font-size:10px;color:#C9A84C">Núcleo Arcano</span>
      </div>
      <div style="font-family:monospace;font-size:11px;color:${canConfirm ? '#C9A84C' : '#ff6666'}">
        ${nucleoQty} / ${nucleoCost}
      </div>
    `;

    const warnEl = document.createElement('div');
    Object.assign(warnEl.style, {
      fontFamily:'monospace', fontSize:'9px',
      color:'#ff6666', textAlign:'center',
      display: canConfirm ? 'none' : 'block',
    });
    warnEl.textContent = 'Núcleos insuficientes';

    const btnRow = document.createElement('div');
    Object.assign(btnRow.style, { display:'flex', gap:'10px', width:'100%' });

    const cancelBtn = document.createElement('button');
    Object.assign(cancelBtn.style, {
      flex:'1', padding:'10px', borderRadius:'10px',
      border:'1px solid rgba(201,168,76,0.2)',
      background:'rgba(201,168,76,0.05)',
      color:'rgba(201,168,76,0.6)', fontFamily:'monospace',
      fontSize:'10px', cursor:'pointer', pointerEvents:'all',
    });
    cancelBtn.textContent = 'Cancelar';
    cancelBtn.addEventListener('click', () => panel.remove());
    cancelBtn.addEventListener('touchstart', (e) => { e.preventDefault(); panel.remove(); }, { passive:false });

    const confirmBtn = document.createElement('button');
    Object.assign(confirmBtn.style, {
      flex:'1', padding:'10px', borderRadius:'10px',
      border: canConfirm ? '1px solid rgba(201,168,76,0.7)' : '1px solid rgba(201,168,76,0.15)',
      background: canConfirm
        ? 'linear-gradient(135deg,rgba(122,96,48,0.6),rgba(201,168,76,0.3))'
        : 'rgba(201,168,76,0.04)',
      color: canConfirm ? '#ffe8a0' : 'rgba(201,168,76,0.25)',
      fontFamily:'monospace', fontSize:'10px',
      cursor: canConfirm ? 'pointer' : 'default', pointerEvents:'all',
      transition:'all 0.15s',
    });
    confirmBtn.textContent = '⬆ Confirmar';

    if (canConfirm) {
      const doLevelUp = () => {
        const mat = inv._items.materiales.find(i => i.id === 'nucleoArcano');
        if (mat) mat.qty -= nucleoCost;
        const needed = prog.getXPForNextLevel() - prog.getTotalXP();
        if (needed > 0) prog.addXP(window._combat?._weaponType ?? 'katana', needed);
        panel.remove();
        parentBody.innerHTML = '';
        this._fillAtributos(parentBody);
        this._renderCenter();
        this._renderRight();
      };
      confirmBtn.addEventListener('click', doLevelUp);
      confirmBtn.addEventListener('touchstart', (e) => { e.preventDefault(); doLevelUp(); }, { passive:false });
      confirmBtn.addEventListener('mouseenter', () => {
        confirmBtn.style.background = 'linear-gradient(135deg,rgba(201,168,76,0.5),rgba(255,220,100,0.3))';
        confirmBtn.style.boxShadow  = '0 0 12px rgba(201,168,76,0.4)';
      });
      confirmBtn.addEventListener('mouseleave', () => {
        confirmBtn.style.background = 'linear-gradient(135deg,rgba(122,96,48,0.6),rgba(201,168,76,0.3))';
        confirmBtn.style.boxShadow  = 'none';
      });
    }

    btnRow.append(cancelBtn, confirmBtn);
    panel.append(titleEl, matRow, warnEl, btnRow);
    document.body.appendChild(panel);
  }

  // ── Habilidades — árbol visual ────────────────────────────────────────────

  _fillHabilidades(body) {
    const charId  = this._activeChar === 0 ? 'kael' : 'mika';
    const weapon  = this._activeChar === 0
      ? (window._combat?._weaponType ?? 'katana')
      : 'bow';
    const treeKey = getTreeKey(charId, weapon);
    const tree    = WEAPON_TREES[treeKey];
    const prog    = this._progression;

    if (!tree) {
      body.innerHTML = '<div style="text-align:center;font-family:monospace;font-size:11px;color:rgba(201,168,76,0.3);padding:40px 0">Sin árbol disponible</div>';
      return;
    }

    // ── Cabecera árbol ────────────────────────────────────────────────────
    const treeHeader = document.createElement('div');
    Object.assign(treeHeader.style, {
      display:'flex', alignItems:'center', justifyContent:'space-between',
      marginBottom:'16px',
    });

    const weaponLv = prog.getWeaponLevel?.(weapon) ?? 1;
    const weaponXP = prog.getWeaponXP?.(weapon) ?? 0;
    const wNext    = prog.getWeaponXPForNext?.(weapon);
    const wPct     = prog.getWeaponXPProgress?.(weapon) ?? 0;
    const crystalId = WEAPON_CRYSTAL_MAP[weapon];
    const crystalQty = window._inventory?._items?.materiales?.find?.(i => i.id === crystalId)?.qty ?? 0;
    const crystalCost = prog.getWeaponCrystalCost?.(weapon) ?? 2;
    const canWLvUp   = prog.canLevelUpWeapon?.(weapon) ?? false;

    treeHeader.innerHTML = `
      <div>
        <div style="font-family:'Cinzel',serif;font-size:12px;color:#C9A84C;letter-spacing:2px">
          ${tree.icon} ${tree.label}
        </div>
        <div style="font-family:monospace;font-size:9px;color:rgba(201,168,76,0.5);margin-top:3px">
          Nv.${weaponLv} &nbsp;·&nbsp; ${weaponXP}/${wNext ?? '—'} XP
        </div>
      </div>
    `;

    // Barra XP arma + botón subir
    const wXpWrap = document.createElement('div');
    Object.assign(wXpWrap.style, {
      display:'flex', alignItems:'center', gap:'6px',
    });

    const wBar = document.createElement('div');
    Object.assign(wBar.style, {
      width:'80px', height:'4px',
      background:'rgba(136,170,255,0.15)',
      borderRadius:'2px', overflow:'hidden',
    });
    const wFill = document.createElement('div');
    Object.assign(wFill.style, {
      height:'100%', width:`${Math.round(wPct * 100)}%`,
      background:'linear-gradient(90deg,#4466cc,#88aaff)',
      transition:'width 0.4s ease',
    });
    wBar.appendChild(wFill);

    const wBtn = document.createElement('button');
    Object.assign(wBtn.style, {
      width:'22px', height:'22px', borderRadius:'50%',
      border: canWLvUp ? '1px solid rgba(136,170,255,0.8)' : '1px solid rgba(136,170,255,0.2)',
      background: canWLvUp ? 'rgba(136,170,255,0.2)' : 'rgba(136,170,255,0.04)',
      color: canWLvUp ? '#88aaff' : 'rgba(136,170,255,0.2)',
      fontSize:'14px', cursor: canWLvUp ? 'pointer' : 'default',
      pointerEvents:'all', display:'flex', alignItems:'center',
      justifyContent:'center', flexShrink:'0',
    });
    wBtn.textContent = '+';

    if (canWLvUp) {
      const doWLvUp = () => this._openWeaponLevelUpPanel(weapon, body);
      wBtn.addEventListener('click', doWLvUp);
      wBtn.addEventListener('touchstart', (e) => { e.preventDefault(); doWLvUp(); }, { passive:false });
    }

    wXpWrap.append(wBar, wBtn);
    treeHeader.appendChild(wXpWrap);
    body.appendChild(treeHeader);

    // ── Árbol de nodos ────────────────────────────────────────────────────
    const layers     = ['basico','nv1','nv2','nv3','arcano'];
    const layerLabels = {
      basico: 'BÁSICO',
      nv1   : 'NIVEL 1',
      nv2   : 'NIVEL 2',
      nv3   : 'NIVEL 3',
      arcano: 'ARCANO',
    };
    const layerColors = {
      basico: '#aaaaaa',
      nv1   : '#88ccff',
      nv2   : '#66aaff',
      nv3   : '#4488ff',
      arcano: '#cc44ff',
    };

    const loadout  = prog.getLoadout?.(charId, weapon) ?? { medio:null, arcano:null };

    for (const layerName of layers) {
      const skills = tree.layers[layerName];
      if (!skills?.length) continue;

      // Etiqueta de capa
      const layerLabel = document.createElement('div');
      Object.assign(layerLabel.style, {
        fontFamily:'monospace', fontSize:'8px',
        color: layerColors[layerName],
        letterSpacing:'2px', marginBottom:'6px', marginTop:'10px',
        textAlign:'center',
      });
      layerLabel.textContent = layerLabels[layerName];
      body.appendChild(layerLabel);

      // Línea conectora (excepto en básico)
      if (layerName !== 'basico') {
        const connector = document.createElement('div');
        Object.assign(connector.style, {
          width:'2px', height:'10px',
          background:`linear-gradient(180deg,${layerColors[layerName]}44,${layerColors[layerName]}88)`,
          margin:'0 auto -4px',
        });
        body.insertBefore(connector, layerLabel);
      }

      // Fila de nodos
      const row = document.createElement('div');
      Object.assign(row.style, {
        display:'flex', justifyContent:'center',
        gap:'8px', marginBottom:'4px',
      });

      for (const skill of skills) {
        const node = this._buildSkillNode(skill, layerName, layerColors[layerName], charId, weapon, loadout, body);
        row.appendChild(node);
      }

      body.appendChild(row);
    }
  }

  _buildSkillNode(skill, layerName, color, charId, weapon, loadout, body) {
    const prog      = this._progression;
    const unlocked  = prog.isSkillUnlocked?.(charId, weapon, skill.id) ?? skill.unlocked;
    const canUnlock = prog.canUnlockSkill?.(charId, weapon, skill.id) ?? false;

    const isBasico  = layerName === 'basico';
    const isArcano  = layerName === 'arcano';
    const isEquipped = isBasico
      || loadout.medio  === skill.id
      || loadout.arcano === skill.id;

    const node = document.createElement('div');
    Object.assign(node.style, {
      width:'68px', display:'flex', flexDirection:'column',
      alignItems:'center', gap:'4px',
      cursor: (unlocked || canUnlock) ? 'pointer' : 'default',
      pointerEvents:'all',
    });

    // Círculo del nodo
    const circle = document.createElement('div');
    Object.assign(circle.style, {
      width:'48px', height:'48px', borderRadius:'50%',
      display:'flex', alignItems:'center', justifyContent:'center',
      fontSize:'22px', transition:'all 0.2s',
      border: isEquipped
        ? `2px solid ${color}`
        : unlocked
          ? `2px solid ${color}88`
          : canUnlock
            ? `2px dashed ${color}66`
            : '2px solid rgba(255,255,255,0.1)',
      background: isEquipped
        ? `radial-gradient(circle at 35% 35%, ${color}44, ${color}22)`
        : unlocked
          ? `rgba(0,0,0,0.5)`
          : 'rgba(0,0,0,0.3)',
      opacity: unlocked || canUnlock ? '1' : '0.4',
      boxShadow: isEquipped ? `0 0 12px ${color}66` : 'none',
    });
    circle.textContent = skill.icon ?? '✨';

    // Nombre
    const nameEl = document.createElement('div');
    Object.assign(nameEl.style, {
      fontFamily:'monospace', fontSize:'7px',
      color: unlocked ? color : 'rgba(255,255,255,0.3)',
      textAlign:'center', lineHeight:'1.2',
      letterSpacing:'0.5px',
    });
    nameEl.textContent = skill.name;

    // Badge estado
    const badge = document.createElement('div');
    Object.assign(badge.style, {
      fontFamily:'monospace', fontSize:'6px',
      padding:'1px 4px', borderRadius:'4px',
      textAlign:'center',
    });
    if (isEquipped && unlocked) {
      badge.textContent = isBasico ? 'ACTIVO' : 'EQUIPADO';
      badge.style.background = `${color}33`;
      badge.style.color      = color;
    } else if (unlocked) {
      badge.textContent      = 'DESBLOQUEADO';
      badge.style.background = 'rgba(100,255,100,0.1)';
      badge.style.color      = '#44ff88';
    } else if (canUnlock) {
      badge.textContent      = `🔮×${skill.cost.cristales}`;
      badge.style.background = 'rgba(201,168,76,0.1)';
      badge.style.color      = '#C9A84C';
    } else {
      badge.textContent      = '🔒';
      badge.style.color      = 'rgba(255,255,255,0.2)';
    }

    node.append(circle, nameEl, badge);

    // Tap handler
    const onTap = () => {
      if (!unlocked && canUnlock) {
        this._openSkillUnlockPanel(skill, layerName, color, charId, weapon, body);
      } else if (unlocked && !isBasico) {
        this._openSkillEquipPanel(skill, layerName, color, charId, weapon, body);
      } else if (unlocked) {
        this._showSkillInfo(skill, color);
      }
    };
    node.addEventListener('click', onTap);
    node.addEventListener('touchstart', (e) => { e.preventDefault(); onTap(); }, { passive:false });

    return node;
  }

  _openSkillUnlockPanel(skill, layerName, color, charId, weapon, body) {
    const existing = document.getElementById('_skill_panel');
    if (existing) existing.remove();

    const prog       = this._progression;
    const crystalId  = WEAPON_CRYSTAL_MAP[weapon];
    const crystalQty = window._inventory?._items?.materiales?.find?.(i => i.id === crystalId)?.qty ?? 0;
    const canConfirm = crystalQty >= skill.cost.cristales;

    const panel = document.createElement('div');
    panel.id = '_skill_panel';
    Object.assign(panel.style, {
      position:'fixed', top:'50%', left:'50%',
      transform:'translate(-50%,-50%)',
      background:'rgba(4,4,10,0.98)',
      border:`1px solid ${color}66`,
      borderRadius:'16px', padding:'24px 24px',
      zIndex:'700', minWidth:'260px', maxWidth:'90vw',
      display:'flex', flexDirection:'column',
      alignItems:'center', gap:'12px',
      boxShadow:`0 0 30px ${color}22`,
    });

    panel.innerHTML = `
      <div style="font-family:'Cinzel',serif;font-size:13px;color:${color};letter-spacing:2px;text-align:center">
        ${skill.icon} ${skill.name.toUpperCase()}
      </div>
      <div style="font-family:monospace;font-size:9px;color:rgba(255,255,255,0.5);text-align:center;line-height:1.5">
        ${skill.desc}
      </div>
    `;

    // Costo
    const costRow = document.createElement('div');
    Object.assign(costRow.style, {
      display:'flex', alignItems:'center', justifyContent:'space-between',
      width:'100%', padding:'10px 14px', borderRadius:'10px',
      background:'rgba(201,168,76,0.06)',
      border:'1px solid rgba(201,168,76,0.15)',
    });

    const crystalIcons = { cristalKatana:'🔷', cristalEspada:'🔵', cristalMagia:'🟣', cristalArco:'🟢' };
    const crystalIcon  = crystalIcons[crystalId] ?? '💎';

    costRow.innerHTML = `
      <div style="display:flex;align-items:center;gap:8px">
        <span style="font-size:18px">${crystalIcon}</span>
        <span style="font-family:monospace;font-size:10px;color:#C9A84C">Cristal requerido</span>
      </div>
      <div style="font-family:monospace;font-size:11px;color:${canConfirm ? '#C9A84C' : '#ff6666'}">
        ${crystalQty} / ${skill.cost.cristales}
      </div>
    `;

    if (!canConfirm) {
      const warn = document.createElement('div');
      Object.assign(warn.style, {
        fontFamily:'monospace', fontSize:'9px',
        color:'#ff6666', textAlign:'center',
      });
      warn.textContent = 'Cristales insuficientes';
      panel.appendChild(costRow);
      panel.appendChild(warn);
    } else {
      panel.appendChild(costRow);
    }

    const btnRow = document.createElement('div');
    Object.assign(btnRow.style, { display:'flex', gap:'10px', width:'100%' });

    const cancelBtn = document.createElement('button');
    Object.assign(cancelBtn.style, {
      flex:'1', padding:'10px', borderRadius:'10px',
      border:'1px solid rgba(255,255,255,0.1)',
      background:'rgba(255,255,255,0.03)',
      color:'rgba(255,255,255,0.4)', fontFamily:'monospace',
      fontSize:'10px', cursor:'pointer', pointerEvents:'all',
    });
    cancelBtn.textContent = 'Cancelar';
    cancelBtn.addEventListener('click', () => panel.remove());
    cancelBtn.addEventListener('touchstart', (e) => { e.preventDefault(); panel.remove(); }, { passive:false });

    const confirmBtn = document.createElement('button');
    Object.assign(confirmBtn.style, {
      flex:'1', padding:'10px', borderRadius:'10px',
      border: canConfirm ? `1px solid ${color}88` : '1px solid rgba(255,255,255,0.1)',
      background: canConfirm ? `${color}22` : 'rgba(255,255,255,0.02)',
      color: canConfirm ? color : 'rgba(255,255,255,0.2)',
      fontFamily:'monospace', fontSize:'10px',
      cursor: canConfirm ? 'pointer' : 'default', pointerEvents:'all',
    });
    confirmBtn.textContent = '✓ Desbloquear';

    if (canConfirm) {
      const doUnlock = () => {
        prog.unlockSkill(charId, weapon, skill.id);
        panel.remove();
        body.innerHTML = '';
        this._fillHabilidades(body);
      };
      confirmBtn.addEventListener('click', doUnlock);
      confirmBtn.addEventListener('touchstart', (e) => { e.preventDefault(); doUnlock(); }, { passive:false });
    }

    btnRow.append(cancelBtn, confirmBtn);
    panel.appendChild(btnRow);
    document.body.appendChild(panel);
  }

  _openSkillEquipPanel(skill, layerName, color, charId, weapon, body) {
    const existing = document.getElementById('_skill_panel');
    if (existing) existing.remove();

    const prog    = this._progression;
    const loadout = prog.getLoadout?.(charId, weapon) ?? { medio:null, arcano:null };
    const isArcano = layerName === 'arcano';

    const panel = document.createElement('div');
    panel.id = '_skill_panel';
    Object.assign(panel.style, {
      position:'fixed', top:'50%', left:'50%',
      transform:'translate(-50%,-50%)',
      background:'rgba(4,4,10,0.98)',
      border:`1px solid ${color}66`,
      borderRadius:'16px', padding:'24px 24px',
      zIndex:'700', minWidth:'260px', maxWidth:'90vw',
      display:'flex', flexDirection:'column',
      alignItems:'center', gap:'12px',
      boxShadow:`0 0 30px ${color}22`,
    });

    const currentId  = isArcano ? loadout.arcano : loadout.medio;
    const isEquipped = currentId === skill.id;

    panel.innerHTML = `
      <div style="font-family:'Cinzel',serif;font-size:13px;color:${color};letter-spacing:2px;text-align:center">
        ${skill.icon} ${skill.name.toUpperCase()}
      </div>
      <div style="font-family:monospace;font-size:9px;color:rgba(255,255,255,0.5);text-align:center;line-height:1.5">
        ${skill.desc}
      </div>
      <div style="font-family:monospace;font-size:8px;color:${isEquipped ? '#44ff88' : 'rgba(255,255,255,0.3)'};letter-spacing:1px">
        ${isEquipped ? '✓ EQUIPADO EN LOADOUT' : `Slot: ${isArcano ? 'ARCANO' : 'MEDIO'}`}
      </div>
    `;

    const btnRow = document.createElement('div');
    Object.assign(btnRow.style, { display:'flex', gap:'10px', width:'100%' });

    const cancelBtn = document.createElement('button');
    Object.assign(cancelBtn.style, {
      flex:'1', padding:'10px', borderRadius:'10px',
      border:'1px solid rgba(255,255,255,0.1)',
      background:'rgba(255,255,255,0.03)',
      color:'rgba(255,255,255,0.4)', fontFamily:'monospace',
      fontSize:'10px', cursor:'pointer', pointerEvents:'all',
    });
    cancelBtn.textContent = 'Cancelar';
    cancelBtn.addEventListener('click', () => panel.remove());
    cancelBtn.addEventListener('touchstart', (e) => { e.preventDefault(); panel.remove(); }, { passive:false });

    const equipBtn = document.createElement('button');
    Object.assign(equipBtn.style, {
      flex:'1', padding:'10px', borderRadius:'10px',
      border: isEquipped ? '1px solid rgba(255,80,80,0.4)' : `1px solid ${color}88`,
      background: isEquipped ? 'rgba(255,80,80,0.08)' : `${color}22`,
      color: isEquipped ? '#ff8888' : color,
      fontFamily:'monospace', fontSize:'10px',
      cursor:'pointer', pointerEvents:'all',
    });
    equipBtn.textContent = isEquipped ? '✕ Desequipar' : '⚡ Equipar';

    const doEquip = () => {
      if (isEquipped) {
        if (isArcano) prog.setLoadoutArcano?.(charId, weapon, null);
        else          prog.setLoadoutMedio?.(charId, weapon, null);
      } else {
        if (isArcano) prog.setLoadoutArcano?.(charId, weapon, skill.id);
        else          prog.setLoadoutMedio?.(charId, weapon, skill.id);
      }
      panel.remove();
      body.innerHTML = '';
      this._fillHabilidades(body);
      this._skillBar?.refresh?.();
    };
    equipBtn.addEventListener('click', doEquip);
    equipBtn.addEventListener('touchstart', (e) => { e.preventDefault(); doEquip(); }, { passive:false });

    btnRow.append(cancelBtn, equipBtn);
    panel.appendChild(btnRow);
    document.body.appendChild(panel);
  }

  _showSkillInfo(skill, color) {
    const existing = document.getElementById('_skill_panel');
    if (existing) existing.remove();

    const panel = document.createElement('div');
    panel.id = '_skill_panel';
    Object.assign(panel.style, {
      position:'fixed', top:'50%', left:'50%',
      transform:'translate(-50%,-50%)',
      background:'rgba(4,4,10,0.98)',
      border:`1px solid ${color}44`,
      borderRadius:'16px', padding:'24px',
      zIndex:'700', minWidth:'220px', maxWidth:'85vw',
      display:'flex', flexDirection:'column',
      alignItems:'center', gap:'10px',
      boxShadow:`0 0 20px ${color}11`,
    });
    panel.innerHTML = `
      <div style="font-size:36px">${skill.icon}</div>
      <div style="font-family:'Cinzel',serif;font-size:12px;color:${color};letter-spacing:2px">${skill.name.toUpperCase()}</div>
      <div style="font-family:monospace;font-size:9px;color:rgba(255,255,255,0.5);text-align:center;line-height:1.5">${skill.desc}</div>
    `;
    const closeBtn = document.createElement('button');
    Object.assign(closeBtn.style, {
      marginTop:'4px', padding:'8px 20px', borderRadius:'10px',
      border:'1px solid rgba(255,255,255,0.15)',
      background:'rgba(255,255,255,0.04)',
      color:'rgba(255,255,255,0.5)', fontFamily:'monospace',
      fontSize:'10px', cursor:'pointer', pointerEvents:'all',
    });
    closeBtn.textContent = 'Cerrar';
    closeBtn.addEventListener('click', () => panel.remove());
    closeBtn.addEventListener('touchstart', (e) => { e.preventDefault(); panel.remove(); }, { passive:false });
    panel.appendChild(closeBtn);
    document.body.appendChild(panel);
    setTimeout(() => { if (panel.parentNode) panel.remove(); }, 4000);
  }

  _openWeaponLevelUpPanel(weapon, body) {
    const existing = document.getElementById('_wlvl_panel');
    if (existing) existing.remove();

    const prog       = this._progression;
    const lv         = prog.getWeaponLevel?.(weapon) ?? 1;
    const crystalId  = WEAPON_CRYSTAL_MAP[weapon];
    const crystalCost = prog.getWeaponCrystalCost?.(weapon) ?? 2;
    const inv        = window._inventory;
    const crystalQty = inv?._items?.materiales?.find?.(i => i.id === crystalId)?.qty ?? 0;
    const crystalIcons = { cristalKatana:'🔷', cristalEspada:'🔵', cristalMagia:'🟣', cristalArco:'🟢' };
    const crystalIcon  = crystalIcons[crystalId] ?? '💎';
    const canConfirm   = prog.canLevelUpWeapon?.(weapon) ?? false;

    const panel = document.createElement('div');
    panel.id = '_wlvl_panel';
    Object.assign(panel.style, {
      position:'fixed', top:'50%', left:'50%',
      transform:'translate(-50%,-50%)',
      background:'rgba(4,4,10,0.98)',
      border:'1px solid rgba(136,170,255,0.4)',
      borderRadius:'16px', padding:'24px 28px',
      zIndex:'700', minWidth:'240px', maxWidth:'90vw',
      display:'flex', flexDirection:'column',
      alignItems:'center', gap:'14px',
      boxShadow:'0 0 40px rgba(136,170,255,0.15)',
    });

    const titleEl = document.createElement('div');
    Object.assign(titleEl.style, {
      fontFamily:"'Cinzel',serif", fontSize:'13px',
      letterSpacing:'2px', color:'#88aaff', textAlign:'center',
    });
    titleEl.textContent = `ARMA NIVEL ${lv + 1}`;

    const matRow = document.createElement('div');
    Object.assign(matRow.style, {
      display:'flex', alignItems:'center', justifyContent:'space-between',
      width:'100%', padding:'10px 14px', borderRadius:'10px',
      background:'rgba(136,170,255,0.06)',
      border:'1px solid rgba(136,170,255,0.15)',
    });
    matRow.innerHTML = `
      <div style="display:flex;align-items:center;gap:8px">
        <span style="font-size:18px">${crystalIcon}</span>
        <span style="font-family:monospace;font-size:10px;color:#88aaff">Cristal requerido</span>
      </div>
      <div style="font-family:monospace;font-size:11px;color:${canConfirm ? '#88aaff' : '#ff6666'}">
        ${crystalQty} / ${crystalCost}
      </div>
    `;

    if (!canConfirm) {
      const warn = document.createElement('div');
      Object.assign(warn.style, {
        fontFamily:'monospace', fontSize:'9px',
        color:'#ff6666', textAlign:'center',
      });
      warn.textContent = 'XP o cristales insuficientes';
      panel.append(titleEl, matRow, warn);
    } else {
      panel.append(titleEl, matRow);
    }

    const btnRow = document.createElement('div');
    Object.assign(btnRow.style, { display:'flex', gap:'10px', width:'100%' });

    const cancelBtn = document.createElement('button');
    Object.assign(cancelBtn.style, {
      flex:'1', padding:'10px', borderRadius:'10px',
      border:'1px solid rgba(136,170,255,0.15)',
      background:'rgba(136,170,255,0.03)',
      color:'rgba(136,170,255,0.5)', fontFamily:'monospace',
      fontSize:'10px', cursor:'pointer', pointerEvents:'all',
    });
    cancelBtn.textContent = 'Cancelar';
    cancelBtn.addEventListener('click', () => panel.remove());
    cancelBtn.addEventListener('touchstart', (e) => { e.preventDefault(); panel.remove(); }, { passive:false });

    const confirmBtn = document.createElement('button');
    Object.assign(confirmBtn.style, {
      flex:'1', padding:'10px', borderRadius:'10px',
      border: canConfirm ? '1px solid rgba(136,170,255,0.7)' : '1px solid rgba(136,170,255,0.1)',
      background: canConfirm ? 'rgba(136,170,255,0.15)' : 'rgba(136,170,255,0.03)',
      color: canConfirm ? '#88aaff' : 'rgba(136,170,255,0.2)',
      fontFamily:'monospace', fontSize:'10px',
      cursor: canConfirm ? 'pointer' : 'default', pointerEvents:'all',
    });
    confirmBtn.textContent = '⬆ Confirmar';

    if (canConfirm) {
      const doWLvUp = () => {
        prog.levelUpWeapon?.(weapon);
        panel.remove();
        body.innerHTML = '';
        this._fillHabilidades(body);
      };
      confirmBtn.addEventListener('click', doWLvUp);
      confirmBtn.addEventListener('touchstart', (e) => { e.preventDefault(); doWLvUp(); }, { passive:false });
    }

    btnRow.append(cancelBtn, confirmBtn);
    panel.appendChild(btnRow);
    document.body.appendChild(panel);
  }

  // ── Equipo ────────────────────────────────────────────────────────────────

  _fillEquipo(body, panel) {
    const slots      = ['arma','armadura','accesorio'];
    const slotLabels = { arma:'⚔️ Arma', armadura:'🛡️ Armadura', accesorio:'💍 Accesorio' };

    for (const slot of slots) {
      const item = this._equipped[slot];
      const row  = document.createElement('div');
      Object.assign(row.style, {
        display:'flex', alignItems:'center', gap:'12px', padding:'12px',
        borderRadius:'12px', marginBottom:'10px',
        border:'1px solid rgba(201,168,76,0.2)',
        background:'rgba(201,168,76,0.04)',
      });

      const iconEl = document.createElement('div');
      iconEl.style.fontSize = '28px';
      iconEl.textContent    = item?.icon ?? slotLabels[slot].split(' ')[0];

      const info = document.createElement('div');
      info.style.flex = '1';
      info.innerHTML  = `
        <div style="font-family:monospace;font-size:11px;color:${item ? '#C9A84C' : 'rgba(201,168,76,0.3)'}">
          ${item ? item.name : `— ${slotLabels[slot]}`}
        </div>
        <div style="font-family:monospace;font-size:9px;color:rgba(255,255,255,0.4);margin-top:3px">
          ${item?.stats ? Object.entries(item.stats).map(([k,v]) => `${k}+${v}`).join(' ') : 'Sin equipo'}
        </div>
      `;

      const btn = document.createElement('button');
      Object.assign(btn.style, {
        background:'rgba(201,168,76,0.1)', border:'1px solid rgba(201,168,76,0.3)',
        borderRadius:'8px', padding:'6px 10px', color:'#C9A84C',
        fontFamily:'monospace', fontSize:'9px', cursor:'pointer', pointerEvents:'all',
      });
      btn.textContent = 'Cambiar';
      btn.addEventListener('click', () => this._openSlotPicker(slot, panel));
      btn.addEventListener('touchstart', (e) => { e.preventDefault(); this._openSlotPicker(slot, panel); }, { passive:false });

      row.append(iconEl, info, btn);
      body.appendChild(row);
    }

    const sep = document.createElement('div');
    sep.style.cssText = 'border-top:1px solid rgba(201,168,76,0.15);margin:8px 0;padding-top:10px;font-family:monospace;font-size:9px;color:rgba(201,168,76,0.5);letter-spacing:1px';
    sep.textContent   = 'BONUS TOTAL DE EQUIPO';
    body.appendChild(sep);

    const total = { ATK:0, DEF:0, HP:0, MAGIA:0 };
    for (const item of Object.values(this._equipped)) {
      if (!item?.stats) continue;
      for (const [k,v] of Object.entries(item.stats)) {
        if (total[k] !== undefined) total[k] += v;
      }
    }

    const bonusRow = document.createElement('div');
    bonusRow.style.cssText = 'display:flex;gap:8px;flex-wrap:wrap';
    for (const [stat, val] of Object.entries(total)) {
      if (!val) continue;
      const cell = document.createElement('div');
      cell.style.cssText = 'background:rgba(201,168,76,0.08);border:1px solid rgba(201,168,76,0.2);border-radius:8px;padding:6px 10px;font-family:monospace;font-size:10px;color:#C9A84C';
      cell.textContent   = `${stat} +${val}`;
      bonusRow.appendChild(cell);
    }
    body.appendChild(bonusRow);
  }

  _openSlotPicker(slot, parentPanel) {
    const inv = window._inventory;
    if (!inv) return;
    const items = inv._items.equipos.filter(i => i.slot === slot);

    const picker = document.createElement('div');
    Object.assign(picker.style, {
      position:'fixed', inset:'0',
      background:'rgba(4,4,10,0.98)',
      zIndex:'600', display:'flex', flexDirection:'column',
      alignItems:'center', paddingTop:'20px',
    });

    const titleEl = document.createElement('div');
    titleEl.style.cssText = "font-family:'Cinzel',serif;font-size:13px;color:#C9A84C;letter-spacing:2px;margin-bottom:16px";
    titleEl.textContent   = `ELEGIR ${slot.toUpperCase()}`;

    const list = document.createElement('div');
    list.style.cssText = 'width:100%;max-width:400px;padding:0 16px;overflow-y:auto;flex:1';

    [null, ...items].forEach(item => {
      const row = document.createElement('div');
      Object.assign(row.style, {
        display:'flex', alignItems:'center', gap:'12px', padding:'10px 12px',
        borderRadius:'10px', marginBottom:'8px',
        border: item ? '1px solid rgba(201,168,76,0.2)' : '1px solid rgba(255,80,80,0.2)',
        background:'rgba(201,168,76,0.04)',
        cursor:'pointer', pointerEvents:'all',
      });
      row.innerHTML = `
        <div style="font-size:22px">${item?.icon ?? '✕'}</div>
        <div style="flex:1">
          <div style="font-family:monospace;font-size:10px;color:${item ? '#C9A84C' : 'rgba(255,100,100,0.8)'}">
            ${item ? item.name : 'Desequipar'}
          </div>
          <div style="font-family:monospace;font-size:9px;color:rgba(255,255,255,0.4);margin-top:2px">
            ${item?.stats ? Object.entries(item.stats).map(([k,v]) => `${k}+${v}`).join(' ') : ''}
          </div>
        </div>
      `;
      const equip = () => {
        this._equipped[slot] = item ?? null;
        this._applyEquipStats();
        picker.remove();
        const newBody = parentPanel.querySelector('div:nth-child(2)');
        newBody.innerHTML = '';
        this._fillEquipo(newBody, parentPanel);
        this._renderRight();
      };
      row.addEventListener('click', equip);
      row.addEventListener('touchstart', (e) => { e.preventDefault(); equip(); }, { passive:false });
      list.appendChild(row);
    });

    const cancelBtn = document.createElement('button');
    cancelBtn.style.cssText = 'margin:16px;padding:10px 28px;border-radius:20px;border:1px solid rgba(201,168,76,0.3);background:rgba(10,8,20,0.9);color:#C9A84C;font-family:monospace;font-size:11px;cursor:pointer;pointer-events:all';
    cancelBtn.textContent   = '← Volver';
    cancelBtn.addEventListener('click', () => picker.remove());
    cancelBtn.addEventListener('touchstart', (e) => { e.preventDefault(); picker.remove(); }, { passive:false });

    picker.append(titleEl, list, cancelBtn);
    document.body.appendChild(picker);
  }

  _applyEquipStats() {
    const base = this._progression.getStats();
    let atk = base.atk, def = base.def, maxHp = base.maxHp;
    for (const item of Object.values(this._equipped)) {
      if (!item?.stats) continue;
      if (item.stats.ATK) atk   += item.stats.ATK;
      if (item.stats.DEF) def   += item.stats.DEF;
      if (item.stats.HP)  maxHp += item.stats.HP;
    }
    window._effectiveStats = { atk, def, maxHp };
    const player = window._player;
    if (player) {
      player.maxHp = maxHp;
      player.hp    = Math.min(player.hp, maxHp);
      player.onDamage?.(player.hp, player.maxHp);
    }
  }

  // ── Talentos ──────────────────────────────────────────────────────────────

  _fillTalentos(body) {
    const chars = [
      {
        name:'Kael', icon:'⚔️',
        skills:[
          { name:'Ataque Normal',   desc:'Combo de golpes con el arma equipada.',      icon:'⚔️' },
          { name:'Habilidad Élite', desc:'Ejecuta una técnica especial del arma.',     icon:'✦'  },
          { name:'Ultimate',        desc:'Libera el poder oscuro prestado. -50% ATK.', icon:'🌑' },
        ],
      },
      {
        name:'Mika', icon:'🏹',
        skills:[
          { name:'Ataque a Distancia', desc:'Dispara flechas precisas al enemigo.',      icon:'🏹' },
          { name:'Trampa de Viento',   desc:'Coloca una trampa que ralentiza enemigos.', icon:'🌀' },
          { name:'Lluvia de Flechas',  desc:'Lanza múltiples flechas en área.',          icon:'⬆️' },
        ],
      },
    ];

    const char   = chars[this._activeChar];
    const nameEl = document.createElement('div');
    nameEl.style.cssText = "font-family:'Cinzel',serif;font-size:13px;color:#C9A84C;letter-spacing:2px;margin-bottom:14px";
    nameEl.textContent   = `${char.icon} ${char.name.toUpperCase()}`;
    body.appendChild(nameEl);

    for (const skill of char.skills) {
      const row = document.createElement('div');
      Object.assign(row.style, {
        display:'flex', gap:'12px', alignItems:'center',
        padding:'12px', borderRadius:'12px', marginBottom:'10px',
        border:'1px solid rgba(201,168,76,0.2)',
        background:'rgba(201,168,76,0.05)',
      });
      row.innerHTML = `
        <div style="font-size:28px;min-width:36px;text-align:center">${skill.icon}</div>
        <div>
          <div style="font-family:monospace;font-size:11px;color:#C9A84C;margin-bottom:4px">${skill.name}</div>
          <div style="font-family:monospace;font-size:9px;color:rgba(255,255,255,0.5);line-height:1.4">${skill.desc}</div>
        </div>
      `;
      body.appendChild(row);
    }
  }

  // ── API pública ───────────────────────────────────────────────────────────

  open() {
    if (this._open) return;
    this._open = true;
    this._overlay.style.display = 'flex';
    this._render();
  }

  close() {
    this._open = false;
    this._overlay.style.display = 'none';
    if (this._subMenu) { this._subMenu.remove(); this._subMenu = null; }
    document.getElementById('_levelup_panel')?.remove();
    document.getElementById('_skill_panel')?.remove();
    document.getElementById('_wlvl_panel')?.remove();
  }

  isOpen() { return this._open; }
}
