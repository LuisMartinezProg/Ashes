/**
 * ui/hudLayout.js — Layout completo del HUD
 * Reorganiza posiciones de todos los elementos existentes
 * NO reemplaza hud.js ni skillBar.js — solo reposiciona
 *
 * USO desde game.html:
 *   import { applyHudLayout } from './ui/hudLayout.js';
 *   applyHudLayout(hud, skillBar, buildMenu);
 */

export function applyHudLayout(hud, skillBar, buildMenu) {

  // ─────────────────────────────────────────────
  // 1. BARRAS HP Y ENERGÍA — abajo centro
  // ─────────────────────────────────────────────
  const hudContainer = document.getElementById('hud-combat');
  if (hudContainer) {
    // HP bar — subir un poco sobre energía
    const hpWrap = hudContainer.children[1]; // segundo hijo = HP
    if (hpWrap) {
      Object.assign(hpWrap.style, {
        bottom   : '72px',
        left     : '50%',
        transform: 'translateX(-50%)',
        width    : '50vw',
        maxWidth : '260px',
      });
    }

    // Energía bar — más abajo
    const energyWrap = hudContainer.children[2];
    if (energyWrap) {
      Object.assign(energyWrap.style, {
        bottom   : '44px',
        left     : '50%',
        transform: 'translateX(-50%)',
        width    : '50vw',
        maxWidth : '260px',
      });
    }

    // Botón ataque — esquina inferior derecha
    const atkBtn = hudContainer.querySelector('button');
    if (atkBtn) {
      Object.assign(atkBtn.style, {
        bottom: '24px',
        right : '24px',
        width : '68px',
        height: '68px',
      });
    }
  }

  // ─────────────────────────────────────────────
  // 2. SKILL BAR — columna vertical a la derecha
  //    arriba del botón de ataque
  // ─────────────────────────────────────────────
  if (skillBar?._container) {
    Object.assign(skillBar._container.style, {
      bottom       : '104px',
      right        : '24px',
      flexDirection: 'column',
      gap          : '8px',
      alignItems   : 'flex-end',
    });

    // Ajustar tamaño de cada botón
    skillBar._buttons.forEach(btn => {
      Object.assign(btn.style, {
        width : '52px',
        height: '52px',
      });
    });
  }

  // ─────────────────────────────────────────────
  // 3. QUITAR BOTÓN FIJO DEL BUILD MENU
  //    (ya está en el radial)
  // ─────────────────────────────────────────────
  if (buildMenu?._buildBtn) {
    buildMenu._buildBtn.style.display = 'none';
  }

  // ─────────────────────────────────────────────
  // 4. QUITAR BOTÓN ☰ DEL PAUSE MENU
  //    (mover al radial o dejar pequeño)
  // ─────────────────────────────────────────────
  // El pauseBtn se crea en game.html — lo reposicionamos
  setTimeout(() => {
    const pauseBtn = document.querySelector('button[style*="☰"]')
      || [...document.querySelectorAll('button')].find(b => b.textContent.trim() === '☰');
    if (pauseBtn) {
      Object.assign(pauseBtn.style, {
        top    : '12px',
        left   : '12px',
        width  : '36px',
        height : '36px',
        zIndex : '160',
      });
    }
  }, 500);

  // ─────────────────────────────────────────────
  // 5. LABEL DE FASE — quitar o mover
  // ─────────────────────────────────────────────
  const phaseLabel = document.getElementById('phase-label');
  if (phaseLabel) phaseLabel.style.display = 'none';

  // ─────────────────────────────────────────────
  // 6. FPS — esquina superior izquierda pequeño
  // ─────────────────────────────────────────────
  const fpsEl = document.getElementById('fps');
  if (fpsEl) {
    Object.assign(fpsEl.style, {
      top    : '56px',
      left   : '12px',
      fontSize: '9px',
      opacity : '0.4',
    });
  }

  // ─────────────────────────────────────────────
  // 7. RADIAL MENU — fijar posición exacta
  // ─────────────────────────────────────────────
  // El radialMenu ya se crea en la esquina superior derecha
  // Solo nos aseguramos que no tape nada importante

  console.log('[HUD] Layout aplicado');
}
