// core/resize.js
// ─────────────────────────────────────────────
//  Responsive — maneja cambios de tamaño y
//  orientación en móvil
//  Fase 0 — Base técnica
// ─────────────────────────────────────────────

/**
 * Escucha resize y orientationchange.
 * Actualiza cámara y renderer automáticamente.
 */
export function initResize(camera, renderer) {

  function onResize() {
    const w = window.innerWidth;
    const h = window.innerHeight;

    // Actualizar cámara
    camera.aspect = w / h;
    camera.updateProjectionMatrix();

    // Actualizar renderer
    renderer.setSize(w, h);

    // Pixel ratio máx 2 para no matar el móvil
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    console.log(`[RESIZE] ${w}x${h} | DPR: ${renderer.getPixelRatio().toFixed(1)}`);
  }

  window.addEventListener('resize',            onResize, { passive: true });
  window.addEventListener('orientationchange', onResize, { passive: true });

  // Llamar una vez al inicio para asegurar valores correctos
  onResize();

  console.log('[RESIZE] Handler inicializado.');
}
