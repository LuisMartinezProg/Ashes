// core/scene.js
// ─────────────────────────────────────────────
//  Escena base de Aeltherion
//  Fase 0 — Base técnica
// ─────────────────────────────────────────────

import * as THREE from 'three';

/**
 * Inicializa la escena, cámara y renderer.
 * Retorna { scene, camera, renderer }
 */
export async function initScene() {

  // ── RENDERER ──────────────────────────────
  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    powerPreference: 'high-performance',
  });

  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // máx 2x para móvil
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type    = THREE.PCFSoftShadowMap;
  renderer.toneMapping       = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.1;
  renderer.outputColorSpace  = THREE.SRGBColorSpace;

  // Agregar canvas al DOM
  document.getElementById('canvas-container').appendChild(renderer.domElement);

  // ── ESCENA ────────────────────────────────
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0A0D14);  // noche de Aeltherion
  scene.fog = new THREE.FogExp2(0x0A0D14, 0.015);; // niebla atmosférica

  // ── CÁMARA ────────────────────────────────
  // Perspectiva isométrica suave — ideal para RPG de acción en móvil
  const aspect  = window.innerWidth / window.innerHeight;
  const camera  = new THREE.PerspectiveCamera(55, aspect, 0.1, 200);

  // Posición inicial: arriba y detrás del punto de origen
  camera.position.set(0, 12, 16);
  camera.lookAt(0, 0, 0);

  // ── ILUMINACIÓN ───────────────────────────

  // Luz ambiental — tono nocturno azul oscuro
  const ambientLight = new THREE.AmbientLight(0x1A2A4A, 0.8);
  scene.add(ambientLight);

  // Luz direccional principal — luna
  const moonLight = new THREE.DirectionalLight(0x8899CC, 1.2);
  moonLight.position.set(-10, 20, 10);
  moonLight.castShadow = true;
  moonLight.shadow.mapSize.width  = 1024; // bajo para móvil
  moonLight.shadow.mapSize.height = 1024;
  moonLight.shadow.camera.near   = 0.5;
  moonLight.shadow.camera.far    = 80;
  moonLight.shadow.camera.left   = -20;
  moonLight.shadow.camera.right  =  20;
  moonLight.shadow.camera.top    =  20;
  moonLight.shadow.camera.bottom = -20;
  moonLight.shadow.bias          = -0.001;
  scene.add(moonLight);

  // Luz de relleno — tono cálido dorado (fuego del pueblo)
  const fillLight = new THREE.PointLight(0xC9A84C, 1.5, 25);
  fillLight.position.set(0, 1, 0);
  scene.add(fillLight);

  // ── SUELO ─────────────────────────────────
  const groundGeo = new THREE.PlaneGeometry(60, 60, 20, 20);
  const groundMat = new THREE.MeshStandardMaterial({
    color:     0x1A2A1A,   // verde oscuro tierra
    roughness: 0.95,
    metalness: 0.0,
  });
  const ground = new THREE.Mesh(groundGeo, groundMat);
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  scene.add(ground);

  // ── OBJETO DE PRUEBA (placeholder jugador) ─
  // En Fase 1 esto se reemplaza por el modelo real
  const playerGeo = new THREE.CapsuleGeometry(0.4, 1.2, 4, 8);
  const playerMat = new THREE.MeshStandardMaterial({
    color:     0xC9A84C,
    roughness: 0.4,
    metalness: 0.3,
    emissive:  0x3A2A00,
    emissiveIntensity: 0.3,
  });
  const playerMesh = new THREE.Mesh(playerGeo, playerMat);
  playerMesh.position.set(0, 1.0, 0);
  playerMesh.castShadow    = true;
  playerMesh.receiveShadow = true;
  playerMesh.name = 'player_placeholder';
  scene.add(playerMesh);

  // ── ESTRUCTURA DE PRUEBA (Ironfell placeholder) ─
  buildPlaceholderTown(scene);

  // ── PARTÍCULAS DE AMBIENTE ─────────────────
  buildAmbientParticles(scene);

  console.log('[SCENE] Inicializada correctamente.');
  return { scene, camera, renderer };
}

// ─────────────────────────────────────────────
//  Pueblo placeholder — cajas simples
//  Se reemplaza en Fase 5 con modelos reales
// ─────────────────────────────────────────────
function buildPlaceholderTown(scene) {
  const structures = [
    // [x, z, ancho, alto, profundo, color]
    [ 4,  4,  3, 2.5, 3,  0x3A2A1A],  // casa 1
    [-5,  3,  2.5, 2, 2.5, 0x2A1E12], // casa 2
    [ 0,  6,  2, 3,   2,   0x2E2418], // torre
    [-3, -4,  4, 1.2, 3,   0x1E2E1A], // almacén
    [ 5, -3,  1.5, 4, 1.5, 0x2A2A1E], // poste de guardia
  ];

  structures.forEach(([x, z, w, h, d, color]) => {
    const geo  = new THREE.BoxGeometry(w, h, d);
    const mat  = new THREE.MeshStandardMaterial({
      color, roughness: 0.9, metalness: 0.05
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(x, h / 2, z);
    mesh.castShadow    = true;
    mesh.receiveShadow = true;
    scene.add(mesh);
  });

  // Fogata central
  const fireLight = new THREE.PointLight(0xFF6622, 2, 8);
  fireLight.position.set(0, 0.8, 0);
  scene.add(fireLight);

  // Animar la fogata en loop (guardada en userData del renderer)
  const fireGeo = new THREE.SphereGeometry(0.15, 6, 6);
  const fireMat = new THREE.MeshBasicMaterial({ color: 0xFF8833 });
  const fire    = new THREE.Mesh(fireGeo, fireMat);
  fire.position.set(0, 0.5, 0);
  fire.name = 'campfire';
  scene.add(fire);
  scene.userData.fireLight = fireLight;
  scene.userData.fireMesh  = fire;
}

// ─────────────────────────────────────────────
//  Partículas de polvo/ceniza flotante
// ─────────────────────────────────────────────
function buildAmbientParticles(scene) {
  const count = 120;
  const geo   = new THREE.BufferGeometry();
  const pos   = new Float32Array(count * 3);

  for (let i = 0; i < count; i++) {
    pos[i*3]   = (Math.random() - 0.5) * 40;
    pos[i*3+1] = Math.random() * 8;
    pos[i*3+2] = (Math.random() - 0.5) * 40;
  }

  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));

  const mat = new THREE.PointsMaterial({
    color: 0xC9A84C,
    size:  0.05,
    transparent: true,
    opacity: 0.35,
    sizeAttenuation: true,
  });

  const particles = new THREE.Points(geo, mat);
  particles.name  = 'ambient_particles';
  scene.add(particles);
                                           }
