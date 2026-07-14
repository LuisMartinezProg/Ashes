// ui/weaponSelect.js — Ashes of the Reborn | Valiant Gaming

import { WEAPON_ACCENTS } from '../data/palette.js';

const WEAPONS = [
  {
    type  : 'katana',
    name  : 'Katana del Alba',
    label : 'ESPADACHÍN',
    icon  : '🗡️',
    range : 'CUERPO A CUERPO',
    stats : { VEL: 90, ALC: 45, DMG: 70 },
    accent: WEAPON_ACCENTS.katana.accent,
    glow  : WEAPON_ACCENTS.katana.glow,
    desc  : 'Corte veloz + tajo descendente. Elegante y letal.',
  },
  {
    type  : 'sword',
    name  : 'Espada de Cinzas',
    label : 'GUERRERO',
    icon  : '⚔️',
    range : 'CUERPO A CUERPO',
    stats : { VEL: 65, ALC: 70, DMG: 80 },
    accent: WEAPON_ACCENTS.sword.accent,
    glow  : WEAPON_ACCENTS.sword.glow,
    desc  : 'Golpe de arco amplio. Corta a través de varios enemigos.',
  },
  {
    type  : 'magic',
    name  : 'Núcleo Arcano',
    label : 'ARCANISTA',
    icon  : '🔮',
    range : 'PROYECTIL GUIADO',
    stats : { VEL: 50, ALC: 90, DMG: 75 },
    accent: WEAPON_ACCENTS.magic.accent,
    glow  : WEAPON_ACCENTS.magic.glow,
    desc  : 'Orbe que persigue al objetivo. Drena energía arcana.',
  },
  {
    type  : 'bow',
    name  : 'Arco del Exilio',
    label : 'EXPLORADOR',
    icon  : '🏹',
    range : 'LÍNEA RECTA',
    stats : { VEL: 70, ALC: 85, DMG: 60 },
    accent: WEAPON_ACCENTS.bow.accent,
    glow  : WEAPON_ACCENTS.bow.glow,
    desc  : 'Flecha en línea recta. Carga para un disparo devastador.',
  },
];

export function showWeaponSelect() {
  return new Promise((resolve) => {
    const overlay = document.createElement('div');
    overlay.id = 'weapon-select-overlay';
    Object.assign(overlay.style, {
      position      : 'fixed',
      inset         : '0',
      zIndex        : '200',
      background    : '#04040A',
      display       : 'flex',
      flexDirection : 'column',
      alignItems    : 'center',
      justifyContent: 'center',
      fontFamily    : "'Georgia', 'Times New Roman', serif",
      overflow      : 'hidden',
    });

    overlay.innerHTML = `
      <style>
        #weapon-select-overlay * { box-sizing: border-box; margin: 0; padding: 0; }
        #ws-bg {
          position: absolute; inset: 0; z-index: 0;
          background:
            radial-gradient(ellipse 80% 60% at 50% 40%, rgba(60,35,10,0.18) 0%, transparent 70%),
            radial-gradient(ellipse 120% 80% at 50% 100%, rgba(10,5,30,0.9) 0%, transparent 60%);
        }
        #ws-vignette {
          position: absolute; inset: 0; z-index: 2;
          background: radial-gradient(ellipse 100% 100% at 50% 50%, transparent 40%, rgba(2,2,8,0.88) 100%);
          pointer-events: none;
        }
        #ws-content {
          position: relative; z-index: 10;
          width: 100%; max-width: 900px;
          padding: 0 16px;
          display: flex; flex-direction: column; align-items: center;
        }
        #ws-eyebrow {
          font-family: monospace; font-size: 10px;
          letter-spacing: 0.35em; color: rgba(201,168,76,0.5);
          text-transform: uppercase; margin-bottom: 8px;
          animation: ws-fade-down 0.6s ease both;
        }
        #ws-title {
          font-size: clamp(1.3rem, 4vw, 2rem);
          letter-spacing: 0.12em; color: #C9A84C;
          text-transform: uppercase;
          text-shadow: 0 0 30px rgba(201,168,76,0.3);
          margin-bottom: 4px;
          animation: ws-fade-down 0.6s 0.08s ease both;
        }
        #ws-sub {
          font-family: monospace; font-size: 11px;
          color: rgba(180,160,120,0.5); letter-spacing: 0.2em;
          margin-bottom: 24px;
          animation: ws-fade-down 0.5s 0.15s ease both;
        }
        #ws-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 10px; width: 100%;
          animation: ws-fade-up 0.6s 0.2s ease both;
        }
        @media (max-width: 640px) {
          #ws-grid { grid-template-columns: repeat(2, 1fr); }
        }
        .ws-card {
          position: relative;
          background: rgba(10,8,20,0.85);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 8px; padding: 16px 12px 12px;
          cursor: pointer; display: flex; flex-direction: column;
          align-items: center; gap: 0;
          transition: transform 0.18s ease, border-color 0.18s ease, box-shadow 0.18s ease;
          -webkit-tap-highlight-color: transparent; user-select: none;
        }
        .ws-card:hover, .ws-card:active { transform: translateY(-3px); }
        .ws-card.selected              { transform: translateY(-4px); }
        .ws-card-icon {
          font-size: 2.2rem; line-height: 1; margin-bottom: 10px;
          transition: transform 0.2s ease;
        }
        .ws-card:hover .ws-card-icon, .ws-card.selected .ws-card-icon { transform: scale(1.12); }
        .ws-card-label {
          font-family: monospace; font-size: 9px;
          letter-spacing: 0.25em; color: rgba(180,160,120,0.55);
          margin-bottom: 4px;
        }
        .ws-card-name {
          font-size: 0.85rem; letter-spacing: 0.05em;
          color: #ddd; text-align: center;
          margin-bottom: 8px; line-height: 1.3;
        }
        .ws-card-range {
          font-family: monospace; font-size: 8px;
          letter-spacing: 0.12em; color: rgba(160,145,110,0.45);
          margin-bottom: 10px;
        }
        .ws-stats { width: 100%; display: flex; flex-direction: column; gap: 5px; margin-bottom: 10px; }
        .ws-stat  { display: flex; align-items: center; gap: 6px; }
        .ws-stat-label {
          font-family: monospace; font-size: 8px;
          letter-spacing: 0.08em; color: rgba(180,160,120,0.5);
          width: 28px; flex-shrink: 0;
        }
        .ws-stat-track { flex: 1; height: 3px; background: rgba(255,255,255,0.06); border-radius: 2px; overflow: hidden; }
        .ws-stat-fill  { height: 100%; border-radius: 2px; width: 0%; transition: width 0.45s 0.35s ease; }
        .ws-card-desc {
          font-family: monospace; font-size: 9px; line-height: 1.5;
          color: rgba(180,160,120,0.4); text-align: center; letter-spacing: 0.02em;
        }
        .ws-check {
          position: absolute; top: 8px; right: 10px;
          font-size: 13px; opacity: 0; transition: opacity 0.15s ease;
        }
        .ws-card.selected .ws-check { opacity: 1; }
        #ws-confirm-wrap { margin-top: 20px; animation: ws-fade-up 0.5s 0.35s ease both; }
        #ws-confirm {
          font-family: 'Georgia', serif; font-size: 13px;
          letter-spacing: 0.25em; text-transform: uppercase;
          color: #04040A;
          background: linear-gradient(135deg, #7A6030, #C9A84C, #E8C97A);
          border: none; border-radius: 4px; padding: 14px 42px;
          cursor: pointer; opacity: 0; pointer-events: none;
          transition: opacity 0.25s ease, transform 0.15s ease, box-shadow 0.15s ease;
          -webkit-tap-highlight-color: transparent;
        }
        #ws-confirm.ready { opacity: 1; pointer-events: all; }
        #ws-confirm:hover { transform: translateY(-2px); box-shadow: 0 4px 24px rgba(201,168,76,0.35); }
        #ws-confirm:active { transform: scale(0.96); }
        @keyframes ws-fade-down {
          from { opacity: 0; transform: translateY(-14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes ws-fade-up {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        #weapon-select-overlay.leaving { animation: ws-out 0.45s ease forwards; }
        @keyframes ws-out { to { opacity: 0; } }
      </style>

      <div id="ws-bg"></div>
      <div id="ws-vignette"></div>

      <div id="ws-content">
        <div id="ws-eyebrow">Ashes of the Reborn</div>
        <div id="ws-title">Elige tu Camino</div>
        <div id="ws-sub">El arma define al guerrero</div>
        <div id="ws-grid"></div>
        <div id="ws-confirm-wrap">
          <button id="ws-confirm">Comenzar</button>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);

    const grid       = overlay.querySelector('#ws-grid');
    const confirmBtn = overlay.querySelector('#ws-confirm');
    let selectedType = null;

    WEAPONS.forEach((w) => {
      const card = document.createElement('div');
      card.className = 'ws-card';
      card.dataset.type = w.type;

      card.innerHTML = `
        <span class="ws-check" style="color:${w.accent}">✓</span>
        <div class="ws-card-icon">${w.icon}</div>
        <div class="ws-card-label">${w.label}</div>
        <div class="ws-card-name">${w.name}</div>
        <div class="ws-card-range">${w.range}</div>
        <div class="ws-stats">
          ${Object.entries(w.stats).map(([k, v]) => `
            <div class="ws-stat">
              <span class="ws-stat-label">${k}</span>
              <div class="ws-stat-track">
                <div class="ws-stat-fill" data-val="${v}" style="background:${w.accent}"></div>
              </div>
            </div>`).join('')}
        </div>
        <div class="ws-card-desc">${w.desc}</div>
      `;

      card.addEventListener('mouseenter', () => {
        if (selectedType === w.type) return;
        card.style.borderColor = `${w.accent}66`;
        card.style.boxShadow   = `0 0 18px ${w.glow}`;
      });
      card.addEventListener('mouseleave', () => {
        if (selectedType === w.type) return;
        card.style.borderColor = 'rgba(255,255,255,0.07)';
        card.style.boxShadow   = '';
      });

      const select = (e) => {
        e.preventDefault();
        if (selectedType) {
          const prev = grid.querySelector(`[data-type="${selectedType}"]`);
          if (prev) {
            prev.classList.remove('selected');
            prev.style.borderColor = 'rgba(255,255,255,0.07)';
            prev.style.boxShadow   = '';
            prev.style.background  = 'rgba(10,8,20,0.85)';
          }
        }
        selectedType = w.type;
        card.classList.add('selected');
        card.style.borderColor = w.accent;
        card.style.boxShadow   = `0 0 28px ${w.glow}, 0 0 56px ${w.glow}`;
        card.style.background  = 'rgba(12,10,24,0.95)';
        confirmBtn.classList.add('ready');
      };

      card.addEventListener('click', select);
      card.addEventListener('touchstart', select, { passive: false });
      grid.appendChild(card);
    });

    requestAnimationFrame(() => requestAnimationFrame(() => {
      overlay.querySelectorAll('.ws-stat-fill').forEach(el => {
        el.style.width = el.dataset.val + '%';
      });
    }));

    const confirm = (e) => {
      e.preventDefault();
      if (!selectedType) return;
      overlay.classList.add('leaving');
      setTimeout(() => { overlay.remove(); resolve(selectedType); }, 450);
    };
    confirmBtn.addEventListener('click', confirm);
    confirmBtn.addEventListener('touchstart', confirm, { passive: false });
  });
}
