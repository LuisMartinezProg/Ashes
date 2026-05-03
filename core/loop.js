// core/loop.js
// ─────────────────────────────────────────────
//  Game loop principal
//  Fase 0 — Base técnica
// ─────────────────────────────────────────────

import * as THREE from 'three';

const clock   = new THREE.Clock();
let   frameCount = 0;
let   lastFPS    = performance.now();

const fpsEl    = document.getElementById('fps');
const statusEl = document.getElementById('status');

/**
 * Inicia el render loop.
 * En fases futuras se le pasarán: player, enemies, ui, etc.
 */
export function startLoop(scene, camera, renderer) {

  const player    = scene.getObjectByName('player_placeholder');
  const particles = scene.getObjectByName('ambient_particles');
  const fireMesh  = scene.userData.fireMesh;
  const fireLight = scene.userData.fireLight;

  let time = 0;

  function update(delta) {
    time += delta;

    // ── Animar fogata ──────────────────────
    if (fireMesh && fireLight) {
      const flicker = 1.5 + Math.sin(time * 12) * 0.4 + Math.sin(time * 7.3) * 0.2;
      fireLight.intensity = flicker;
      fireMesh.scale.setScalar(0.9 + Math.sin(time * 9) * 0.15);
    }

    // ── Animar partículas ambiente ─────────
    if (particles) {
      const pos = particles.geometry.attributes.position;
      for (let i = 0; i < pos.count; i++) {
        pos.setY(i, pos.getY(i) + 0.004);
        pos.setX(i, pos.getX(i) + Math.sin(time + i) * 0.001);
        // reset si sube mucho
        if (pos.getY(i) > 8) pos.setY(i, 0);
      }
      pos.needsUpdate = true;
    }

    // ── Animar placeholder del jugador ─────
    // Solo una respiración sutil — se reemplaza en Fase 1
    if (player) {
      player.position.y = 1.0 + Math.sin(time * 1.8) * 0.04;
    }

    // ── Rotar cámara lentamente (demo Fase 0) ─
    // En Fase 1 la cámara seguirá al jugador en vez de rotar
    camera.position.x = Math.sin(time * 0.08) * 18;
    camera.position.z = Math.cos(time * 0.08) * 18;
    camera.position.y = 12 + Math.sin(time * 0.12) * 1.5;
    camera.lookAt(0, 1, 0);
  }

  function render() {
    const delta = clock.getDelta();

    // ── FPS counter ────────────────────────
    frameCount++;
    const now = performance.now();
    if (now - lastFPS >= 1000) {
      const fps = Math.round(frameCount * 1000 / (now - lastFPS));
      if (fpsEl) fpsEl.textContent = fps + ' FPS';
      frameCount = 0;
      lastFPS = now;

      // Advertencia de rendimiento en móvil
      if (fps < 30 && statusEl) {
        statusEl.textContent = '⚠ RENDIMIENTO BAJO — ' + fps + ' FPS';
        statusEl.style.color = 'rgba(200,80,40,0.7)';
      } else if (statusEl) {
        statusEl.textContent = 'ESCENA CARGADA';
        statusEl.style.color = 'rgba(201,168,76,0.5)';
      }
    }

    update(delta);
    renderer.render(scene, camera);
    requestAnimationFrame(render);
  }

  requestAnimationFrame(render);
  console.log('[LOOP] Game loop iniciado.');
}
