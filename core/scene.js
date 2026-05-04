// core/scene.js
// Ashes of the Reborn | Valiant Gaming
// Sombras desactivadas para compatibilidad móvil (Fase 1)

import * as THREE from 'three';

export async function initScene() {

  // ── RENDERER ──────────────────────────────
  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    powerPreference: 'high-performance',
  });

  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled   = false;  // desactivado hasta Fase 5
  renderer.toneMapping         = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.1;
  renderer.outputColorSpace    = THREE.SRGBColorSpace;

  document.getElementById('canvas-container').appendChild(renderer.domElement);

  // ── ESCENA ────────────────────────────────
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0A0D14);
  scene.fog = new THREE.FogExp2(0x0A0D14, 0.015);

  // ── CÁMARA ────────────────────────────────
  const aspect = window.innerWidth / window.innerHeight;
  const camera = new THREE.PerspectiveCamera(55, aspect, 0.1, 200);
  camera.position.set(0, 12, 16);
  camera.lookAt(0, 0, 0);

  // ── ILUMINACIÓN ───────────────────────────
  const ambientLight = new THREE.AmbientLight(0x1A2A4A, 1.5);
  scene.add(ambientLight);

  const moonLight = new THREE.DirectionalLight(0x8899CC, 1.5);
  moonLight.position.set(-10, 20, 10);
  moonLight.castShadow = false;
  scene.add(moonLight);

  const fillLight = new THREE.PointLight(0xC9A84C, 2.0, 30);
  fillLight.position.set(0, 1, 0);
  scene.add(fillLight);

  // ── SUELO ─────────────────────────────────
  const groundGeo = new THREE.PlaneGeometry(60, 60, 20, 20);
  const groundMat = new THREE.MeshStandardMaterial({
    color:     0x1A2A1A,
    roughness: 0.95,
    metalness: 0.0,
  });
  const ground = new THREE.Mesh(groundGeo, groundMat);
  ground.rotation.x   = -Math.PI / 2;
  ground.receiveShadow = false;
  scene.add(ground);

  // ── PLACEHOLDER JUGADOR (se quita en loop.js) ─
  const playerGeo = new THREE.CapsuleGeometry(0.4, 1.2, 4, 8);
  const playerMat = new THREE.MeshStandardMaterial({
    color:    0xC9A84C,
    roughness: 0.4,
    metalness: 0.3,
    emissive:  0x3A2A00,
    emissiveIntensity: 0.3,
  });
  const playerMesh = new THREE.Mesh(playerGeo, playerMat);
  playerMesh.position.set(0, 1.0, 0);
  playerMesh.castShadow    = false;
  playerMesh.receiveShadow = false;
  playerMesh.name = 'player_placeholder';
  scene.add(playerMesh);

  // ── PUEBLO PLACEHOLDER ─────────────────────
  buildPlaceholderTown(scene);

  // ── PARTÍCULAS ────────────────────────────
  buildAmbientParticles(scene);

  console.log('[SCENE] Inicializada correctamente.');
  return { scene, camera, renderer };
}

function buildPlaceholderTown(scene) {
  const structures = [
    [ 4,  4,  3, 2.5, 3,  0x3A2A1A],
    [-5,  3,  2.5, 2, 2.5, 0x2A1E12],
    [ 0,  6,  2, 3,   2,   0x2E2418],
    [-3, -4,  4, 1.2, 3,   0x1E2E1A],
    [ 5, -3,  1.5, 4, 1.5, 0x2A2A1E],
  ];

  structures.forEach(([x, z, w, h, d, color]) => {
    const geo  = new THREE.BoxGeometry(w, h, d);
    const mat  = new THREE.MeshStandardMaterial({ color, roughness: 0.9, metalness: 0.05 });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(x, h / 2, z);
    mesh.castShadow    = false;
    mesh.receiveShadow = false;
    scene.add(mesh);
  });

  const fireLight = new THREE.PointLight(0xFF6622, 2, 8);
  fireLight.position.set(0, 0.8, 0);
  scene.add(fireLight);

  const fireGeo = new THREE.SphereGeometry(0.15, 6, 6);
  const fireMat = new THREE.MeshBasicMaterial({ color: 0xFF8833 });
  const fire    = new THREE.Mesh(fireGeo, fireMat);
  fire.position.set(0, 0.5, 0);
  fire.name = 'campfire';
  scene.add(fire);

  scene.userData.fireLight = fireLight;
  scene.userData.fireMesh  = fire;
}

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
    color:           0xC9A84C,
    size:            0.05,
    transparent:     true,
    opacity:         0.35,
    sizeAttenuation: true,
  });

  const particles = new THREE.Points(geo, mat);
  particles.name  = 'ambient_particles';
  scene.add(particles);
}
