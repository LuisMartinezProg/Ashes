// core/scene.js — Ashes of the Reborn | Valiant Gaming
import * as THREE from 'three';

// Recursos del bosque accesibles globalmente para el sistema de recolección
export const FOREST_RESOURCES = [];

export async function initScene() {

  // ── RENDERER ──────────────────────────────
  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    powerPreference: 'high-performance',
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled   = false;
  renderer.toneMapping         = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.4;
  renderer.outputColorSpace    = THREE.SRGBColorSpace;
  document.getElementById('canvas-container').appendChild(renderer.domElement);

  // ── ESCENA ────────────────────────────────
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x6A8FA0);
  scene.fog = new THREE.FogExp2(0x4A6A50, 0.018); // niebla densa del bosque

  // ── CÁMARA ────────────────────────────────
  const aspect = window.innerWidth / window.innerHeight;
  const camera = new THREE.PerspectiveCamera(55, aspect, 0.1, 300);
  camera.position.set(0, 12, 16);
  camera.lookAt(0, 0, 0);

  // ── ILUMINACIÓN ───────────────────────────
  // Luz ambiente fría del bosque
  const ambientLight = new THREE.AmbientLight(0xB0C8D0, 2.0);
  scene.add(ambientLight);

  // Sol filtrado entre árboles
  const sunLight = new THREE.DirectionalLight(0xFFE8A0, 2.0);
  sunLight.position.set(-20, 40, -10);
  sunLight.castShadow = false;
  scene.add(sunLight);

  // Luz de relleno verde del bosque
  const fillLight = new THREE.HemisphereLight(0x88AA66, 0x2A3A1A, 1.2);
  scene.add(fillLight);

  // ── SUELO GRANDE ──────────────────────────
  // Bosque (norte) — verde oscuro
  const forestGround = new THREE.Mesh(
    new THREE.PlaneGeometry(200, 150),
    new THREE.MeshStandardMaterial({ color: 0x2A4A1E, roughness: 0.98 })
  );
  forestGround.rotation.x = -Math.PI / 2;
  forestGround.position.set(0, 0, -50); // norte
  scene.add(forestGround);

  // Planicie (sur) — verde claro
  const plainsGround = new THREE.Mesh(
    new THREE.PlaneGeometry(200, 150),
    new THREE.MeshStandardMaterial({ color: 0x4A7A3A, roughness: 0.95 })
  );
  plainsGround.rotation.x = -Math.PI / 2;
  plainsGround.position.set(0, 0, 80); // sur
  scene.add(plainsGround);

  // Transición bosque → planicie
  const transGround = new THREE.Mesh(
    new THREE.PlaneGeometry(200, 40),
    new THREE.MeshStandardMaterial({ color: 0x3A6028, roughness: 0.96 })
  );
  transGround.rotation.x = -Math.PI / 2;
  transGround.position.set(0, 0, 15);
  scene.add(transGround);

  // ── PLACEHOLDER JUGADOR ───────────────────
  const playerMesh = new THREE.Mesh(
    new THREE.CapsuleGeometry(0.4, 1.2, 4, 8),
    new THREE.MeshStandardMaterial({
      color: 0xC9A84C, roughness: 0.4, metalness: 0.3,
      emissive: 0x3A2A00, emissiveIntensity: 0.3,
    })
  );
  playerMesh.position.set(0, 1.0, -30); // spawn en bosque
  playerMesh.name = 'player_placeholder';
  scene.add(playerMesh);

  // ── BOSQUE ────────────────────────────────
  buildForest(scene);

  // ── CAMINO SUR ────────────────────────────
  buildSouthPath(scene);

  // ── PARTÍCULAS BOSQUE ─────────────────────
  buildForestParticles(scene);

  console.log('[SCENE] Mapa nuevo inicializado — Bosque + Planicie');
  return { scene, camera, renderer };
}

// ── ÁRBOL ────────────────────────────────────────────────────────────────────
function buildTree(scene, x, z, scale = 1) {
  const g = new THREE.Group();

  // Tronco
  const trunkGeo = new THREE.CylinderGeometry(0.2 * scale, 0.3 * scale, 2.5 * scale, 7);
  const trunkMat = new THREE.MeshStandardMaterial({ color: 0x4A2E10, roughness: 0.95 });
  const trunk    = new THREE.Mesh(trunkGeo, trunkMat);
  trunk.position.y = 1.25 * scale;
  g.add(trunk);

  // Copa — 3 capas
  const foliageMat = new THREE.MeshStandardMaterial({ color: 0x1A4A1A, roughness: 0.9 });
  const foliageMat2 = new THREE.MeshStandardMaterial({ color: 0x2A5A20, roughness: 0.9 });

  [[2.2, 1.8, 2.5], [1.8, 1.5, 4.0], [1.2, 1.2, 5.2]].forEach(([r, h, y], i) => {
    const cone = new THREE.Mesh(
      new THREE.ConeGeometry(r * scale, h * scale, 7),
      i % 2 === 0 ? foliageMat : foliageMat2
    );
    cone.position.y = y * scale;
    g.add(cone);
  });

  g.position.set(x, 0, z);

  // Registrar como recurso recolectable
  FOREST_RESOURCES.push({
    type    : 'madera',
    mesh    : g,
    hp      : 5,
    maxHp   : 5,
    position: new THREE.Vector3(x, 0, z),
    depleted: false,
  });

  scene.add(g);
  return g;
}

// ── ROCA ─────────────────────────────────────────────────────────────────────
function buildRock(scene, x, z, scale = 1) {
  const g = new THREE.Group();
  const mat = new THREE.MeshStandardMaterial({ color: 0x6A6058, roughness: 0.95 });

  // 2-3 esferas irregulares
  [[0, 0.3, 0, 0.5], [-0.3, 0.2, 0.2, 0.35], [0.25, 0.15, -0.15, 0.3]].forEach(([rx, ry, rz, r]) => {
    const rock = new THREE.Mesh(new THREE.SphereGeometry(r * scale, 6, 5), mat);
    rock.position.set(rx * scale, ry * scale, rz * scale);
    rock.scale.y = 0.7;
    g.add(rock);
  });

  g.position.set(x, 0, z);

  FOREST_RESOURCES.push({
    type    : 'piedra',
    mesh    : g,
    hp      : 8,
    maxHp   : 8,
    position: new THREE.Vector3(x, 0, z),
    depleted: false,
  });

  scene.add(g);
  return g;
}

// ── BOSQUE COMPLETO ───────────────────────────────────────────────────────────
function buildForest(scene) {
  // Árboles densos — zona norte (z negativo)
  const treePositions = [
    // Claro de spawn — sin árboles cerca del jugador (radio 8)
    [-12, -20], [10, -18], [-8, -35], [15, -30], [-18, -28],
    [5, -45], [-5, -42], [20, -40], [-22, -38], [12, -50],
    [-15, -50], [0, -55], [25, -25], [-25, -22], [18, -15],
    [-20, -15], [8, -12], [-10, -12], [22, -55], [-20, -55],
    [30, -35], [-30, -32], [28, -20], [-28, -18], [5, -60],
    [-5, -62], [15, -65], [-15, -63], [25, -60], [-25, -58],
  ];

  treePositions.forEach(([x, z]) => {
    const scale = 0.8 + Math.random() * 0.6;
    buildTree(scene, x, z, scale);
  });

  // Rocas dispersas en el bosque
  const rockPositions = [
    [-6, -25], [8, -32], [-14, -40], [18, -22], [-3, -48],
    [22, -45], [-20, -43], [10, -58], [-10, -20], [16, -38],
  ];

  rockPositions.forEach(([x, z]) => {
    const scale = 0.7 + Math.random() * 0.5;
    buildRock(scene, x, z, scale);
  });

  // Árboles dispersos en borde de planicie
  const edgeTrees = [
    [-30, 0], [30, 5], [-25, 8], [28, -5], [-35, -10], [35, -8],
  ];
  edgeTrees.forEach(([x, z]) => {
    buildTree(scene, x, z, 1.0 + Math.random() * 0.3);
  });
}

// ── CAMINO HACIA EL SUR ───────────────────────────────────────────────────────
function buildSouthPath(scene) {
  const pathMat = new THREE.MeshStandardMaterial({ color: 0xC8A87A, roughness: 0.98 });

  // Camino desde spawn hasta planicie
  const path = new THREE.Mesh(new THREE.PlaneGeometry(4, 120), pathMat);
  path.rotation.x = -Math.PI / 2;
  path.position.set(0, 0.01, 20); // del bosque a la planicie
  scene.add(path);

  // Señal de dirección (palo simple)
  const postMat = new THREE.MeshStandardMaterial({ color: 0x6B4423, roughness: 0.9 });
  const post = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.1, 2, 6), postMat);
  post.position.set(3, 1, -5);
  scene.add(post);

  const sign = new THREE.Mesh(
    new THREE.BoxGeometry(1.2, 0.4, 0.08),
    new THREE.MeshStandardMaterial({ color: 0x8B6340, roughness: 0.9 })
  );
  sign.position.set(3, 1.8, -5);
  scene.add(sign);
}

// ── PARTÍCULAS BOSQUE ─────────────────────────────────────────────────────────
function buildForestParticles(scene) {
  const count = 200;
  const geo   = new THREE.BufferGeometry();
  const pos   = new Float32Array(count * 3);

  for (let i = 0; i < count; i++) {
    pos[i*3]   = (Math.random() - 0.5) * 60;
    pos[i*3+1] = Math.random() * 10;
    pos[i*3+2] = -Math.random() * 70 - 5;
  }

  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));

  const particles = new THREE.Points(geo, new THREE.PointsMaterial({
    color: 0xAAFF88, size: 0.05,
    transparent: true, opacity: 0.4,
    sizeAttenuation: true,
  }));
  particles.name = 'ambient_particles';
  scene.add(particles);
  }
