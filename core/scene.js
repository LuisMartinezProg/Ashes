// core/scene.js
// Ashes of the Reborn | Valiant Gaming

import * as THREE from 'three';

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
  renderer.toneMappingExposure = 1.6;
  renderer.outputColorSpace    = THREE.SRGBColorSpace;

  document.getElementById('canvas-container').appendChild(renderer.domElement);

  // ── ESCENA ────────────────────────────────
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x87CEEB);
  scene.fog = new THREE.FogExp2(0xB0D4F1, 0.008);

  // ── CÁMARA ────────────────────────────────
  const aspect = window.innerWidth / window.innerHeight;
  const camera = new THREE.PerspectiveCamera(55, aspect, 0.1, 200);
  camera.position.set(0, 12, 16);
  camera.lookAt(0, 0, 0);

  // ── ILUMINACIÓN ───────────────────────────
  const ambientLight = new THREE.AmbientLight(0xFFF5E0, 3.5);
  scene.add(ambientLight);

  const sunLight = new THREE.DirectionalLight(0xFFD580, 3.0);
  sunLight.position.set(-10, 20, 10);
  sunLight.castShadow = false;
  scene.add(sunLight);

  const fillLight = new THREE.PointLight(0xFFAA44, 2.0, 30);
  fillLight.position.set(0, 1, 0);
  scene.add(fillLight);

  // ── SUELO ─────────────────────────────────
  const groundGeo = new THREE.PlaneGeometry(80, 80, 1, 1);
  const groundMat = new THREE.MeshStandardMaterial({
    color:     0x4A7A3A,
    roughness: 0.95,
    metalness: 0.0,
  });
  const ground = new THREE.Mesh(groundGeo, groundMat);
  ground.rotation.x = -Math.PI / 2;
  scene.add(ground);

  // ── CAMINOS ───────────────────────────────
  buildPaths(scene);

  // ── PLACEHOLDER JUGADOR (se quita en loop.js) ─
  const playerGeo = new THREE.CapsuleGeometry(0.4, 1.2, 4, 8);
  const playerMat = new THREE.MeshStandardMaterial({
    color:             0xC9A84C,
    roughness:         0.4,
    metalness:         0.3,
    emissive:          0x3A2A00,
    emissiveIntensity: 0.3,
  });
  const playerMesh = new THREE.Mesh(playerGeo, playerMat);
  playerMesh.position.set(0, 1.0, 0);
  playerMesh.name = 'player_placeholder';
  scene.add(playerMesh);

  // ── PUEBLO DETALLADO ──────────────────────
  buildDetailedTown(scene);

  // ── PARTÍCULAS ────────────────────────────
  buildAmbientParticles(scene);

  console.log('[SCENE] Inicializada correctamente.');
  return { scene, camera, renderer };
}

// ── MATERIALES COMPARTIDOS ────────────────────────────────────────────────────

const MAT = {
  wall:      new THREE.MeshStandardMaterial({ color: 0xD4B896, roughness: 0.9 }),
  wallDark:  new THREE.MeshStandardMaterial({ color: 0xA8896A, roughness: 0.9 }),
  roof:      new THREE.MeshStandardMaterial({ color: 0x8B3A2A, roughness: 0.85 }),
  roofDark:  new THREE.MeshStandardMaterial({ color: 0x6B2A1A, roughness: 0.85 }),
  wood:      new THREE.MeshStandardMaterial({ color: 0x6B4423, roughness: 0.95 }),
  window:    new THREE.MeshStandardMaterial({ color: 0x88AACC, roughness: 0.2, metalness: 0.3 }),
  door:      new THREE.MeshStandardMaterial({ color: 0x4A2E10, roughness: 0.9 }),
  stone:     new THREE.MeshStandardMaterial({ color: 0x888078, roughness: 0.95 }),
  stoneDark: new THREE.MeshStandardMaterial({ color: 0x605850, roughness: 0.95 }),
  path:      new THREE.MeshStandardMaterial({ color: 0xC8A87A, roughness: 0.98 }),
  fire:      new THREE.MeshBasicMaterial({ color: 0xFF8833 }),
  ember:     new THREE.MeshBasicMaterial({ color: 0xFF4400 }),
};

// ── HELPERS ───────────────────────────────────────────────────────────────────

function box(w, h, d, mat, x, y, z, parent) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
  m.position.set(x, y, z);
  parent.add(m);
  return m;
}

function addToScene(group, scene, x, z, rotY = 0) {
  group.position.set(x, 0, z);
  group.rotation.y = rotY;
  scene.add(group);
}

// ── EDIFICIO: CASA ESTÁNDAR ───────────────────────────────────────────────────
// w=ancho, d=profundidad, h=altura paredes
function buildHouse(w, h, d, wallMat, roofMat) {
  const g = new THREE.Group();

  // Paredes
  box(w,     h,     d,     wallMat, 0, h/2,  0,    g); // cuerpo principal

  // Marco de puerta (más oscuro)
  box(0.9,   h*0.55, 0.05, MAT.door,   0,  h*0.275, d/2+0.01, g);

  // Ventanas laterales
  box(0.6,   0.5,   0.05,  MAT.window,  w*0.28,  h*0.6,  d/2+0.01, g);
  box(0.6,   0.5,   0.05,  MAT.window, -w*0.28,  h*0.6,  d/2+0.01, g);

  // Marco de ventana (madera)
  box(0.7,   0.08,  0.06,  MAT.wood,    w*0.28,  h*0.6+0.3, d/2+0.02, g);
  box(0.7,   0.08,  0.06,  MAT.wood,   -w*0.28,  h*0.6+0.3, d/2+0.02, g);
  box(0.7,   0.08,  0.06,  MAT.wood,    w*0.28,  h*0.6-0.3, d/2+0.02, g);
  box(0.7,   0.08,  0.06,  MAT.wood,   -w*0.28,  h*0.6-0.3, d/2+0.02, g);

  // Vigas horizontales decorativas
  box(w+0.1,  0.12,  0.12,  MAT.wood,  0, h*0.35, d/2+0.04, g);
  box(w+0.1,  0.12,  0.12,  MAT.wood,  0, h*0.72, d/2+0.04, g);

  // Techo a dos aguas (prisma triangular con 2 BoxGeometry rotados)
  const roofH = h * 0.55;
  const roofW = w + 0.4;
  const roofD = d + 0.4;

  // Lado izquierdo del techo
  const r1 = new THREE.Mesh(new THREE.BoxGeometry(roofW, 0.12, roofD), roofMat);
  r1.position.set(0, h + roofH * 0.5, 0);
  r1.rotation.z = Math.atan2(roofH, roofW * 0.5);
  g.add(r1);

  // Lado derecho del techo
  const r2 = new THREE.Mesh(new THREE.BoxGeometry(roofW, 0.12, roofD), roofMat);
  r2.position.set(0, h + roofH * 0.5, 0);
  r2.rotation.z = -Math.atan2(roofH, roofW * 0.5);
  g.add(r2);

  // Cumbrera del techo
  box(0.2, 0.2, roofD, MAT.roofDark, 0, h + roofH, 0, g);

  // Alero frontal/trasero del techo
  box(roofW, roofH, 0.15, roofMat, 0, h + roofH*0.5, d/2+0.08, g);
  box(roofW, roofH, 0.15, roofMat, 0, h + roofH*0.5, -d/2-0.08, g);

  // Base de piedra
  box(w+0.2, 0.3, d+0.2, MAT.stone, 0, 0.15, 0, g);

  return g;
}

// ── EDIFICIO: TORRE ───────────────────────────────────────────────────────────
function buildTower(r, h) {
  const g = new THREE.Group();

  // Cuerpo cilíndrico (aproximado con 8 lados)
  const bodyGeo = new THREE.CylinderGeometry(r, r*1.1, h, 8);
  const body    = new THREE.Mesh(bodyGeo, MAT.stoneDark);
  body.position.y = h/2;
  g.add(body);

  // Almenas (merlones)
  for (let i = 0; i < 8; i++) {
    const angle = (i / 8) * Math.PI * 2;
    const mx = Math.cos(angle) * r * 0.85;
    const mz = Math.sin(angle) * r * 0.85;
    box(0.3, 0.5, 0.3, MAT.stone, mx, h + 0.25, mz, g);
  }

  // Techo cónico
  const coneGeo = new THREE.ConeGeometry(r+0.1, h*0.4, 8);
  const cone    = new THREE.Mesh(coneGeo, MAT.roof);
  cone.position.y = h + h*0.2;
  g.add(cone);

  // Ventanas (ranuras)
  for (let i = 0; i < 4; i++) {
    const angle = (i / 4) * Math.PI * 2;
    const wx = Math.cos(angle) * (r + 0.01);
    const wz = Math.sin(angle) * (r + 0.01);
    const win = new THREE.Mesh(
      new THREE.BoxGeometry(0.25, 0.6, 0.05),
      MAT.window
    );
    win.position.set(wx, h * 0.6, wz);
    win.rotation.y = angle;
    g.add(win);
  }

  return g;
}

// ── EDIFICIO: HERRERÍA ────────────────────────────────────────────────────────
function buildSmith(scene, x, z) {
  const g = new THREE.Group();

  // Cuerpo principal
  box(5, 3.5, 4, MAT.wallDark, 0, 1.75, 0, g);

  // Techo plano con voladizo
  box(5.8, 0.2, 5, MAT.wood, 0, 3.6, 0.4, g);

  // Chimenea
  box(0.7, 2.5, 0.7, MAT.stoneDark, 1.5, 4.85, -1.2, g);
  box(1.0, 0.3, 1.0, MAT.stone,     1.5, 6.1,  -1.2, g); // remate

  // Humo (partícula estática oscura)
  const smokeGeo = new THREE.SphereGeometry(0.3, 5, 5);
  const smokeMat = new THREE.MeshBasicMaterial({ color: 0x666666, transparent: true, opacity: 0.4 });
  for (let i = 0; i < 3; i++) {
    const s = new THREE.Mesh(smokeGeo, smokeMat);
    s.position.set(1.5, 6.5 + i*0.6, -1.2);
    s.scale.setScalar(1 + i*0.3);
    g.add(s);
  }

  // Ventana
  box(0.8, 0.6, 0.05, MAT.window, -1.5, 2.2, 2.01, g);

  // Puerta ancha
  box(1.4, 2.2, 0.05, MAT.door, 0.8, 1.1, 2.01, g);

  // Yunque (decorativo)
  box(0.5, 0.4, 0.3, MAT.stoneDark, -1.5, 0.2, 1.5, g);
  box(0.8, 0.15, 0.5, MAT.stoneDark, -1.5, 0.45, 1.5, g);

  addToScene(g, scene, x, z);
}

// ── EDIFICIO: POZO ────────────────────────────────────────────────────────────
function buildWell(scene, x, z) {
  const g = new THREE.Group();

  // Base circular
  const baseGeo = new THREE.CylinderGeometry(0.9, 1.0, 0.6, 12);
  g.add(Object.assign(new THREE.Mesh(baseGeo, MAT.stone), { position: new THREE.Vector3(0, 0.3, 0) }));

  // Borde del pozo
  const rimGeo = new THREE.TorusGeometry(0.9, 0.1, 6, 12);
  const rim    = new THREE.Mesh(rimGeo, MAT.stoneDark);
  rim.rotation.x = Math.PI/2;
  rim.position.y = 0.65;
  g.add(rim);

  // Postes de madera
  box(0.12, 1.4, 0.12, MAT.wood, -0.75, 1.3, 0, g);
  box(0.12, 1.4, 0.12, MAT.wood,  0.75, 1.3, 0, g);

  // Travesaño
  box(1.62, 0.12, 0.12, MAT.wood, 0, 2.05, 0, g);

  // Techo pequeño
  box(2.0, 0.08, 1.2, MAT.roof, 0, 2.2, 0, g);

  addToScene(g, scene, x, z);
}

// ── MURO PERIMETRAL ───────────────────────────────────────────────────────────
function buildWalls(scene) {
  const wallH = 2.2;
  const wallT = 0.5;
  const size  = 18;

  // 4 lados
  const segs = [
    [ size*2+wallT, wallH, wallT,  0,        wallH/2,  size  ],
    [ size*2+wallT, wallH, wallT,  0,        wallH/2, -size  ],
    [ wallT,        wallH, size*2, size,     wallH/2,   0    ],
    [ wallT,        wallH, size*2, -size,    wallH/2,   0    ],
  ];

  segs.forEach(([w,h,d, x,y,z]) => {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w,h,d), MAT.stone);
    m.position.set(x,y,z);
    scene.add(m);
  });

  // Torres en esquinas
  [-size, size].forEach(cx => {
    [-size, size].forEach(cz => {
      const t = buildTower(1.2, 5);
      addToScene(t, scene, cx, cz);
    });
  });

  // Puerta de entrada (hueco en el muro sur)
  const gateL = new THREE.Mesh(new THREE.BoxGeometry(wallT, wallH, 3.5), MAT.stoneDark);
  gateL.position.set(size, wallH/2, -2.5);
  scene.add(gateL);
  const gateR = new THREE.Mesh(new THREE.BoxGeometry(wallT, wallH, 3.5), MAT.stoneDark);
  gateR.position.set(size, wallH/2,  2.5);
  scene.add(gateR);
  const gateTop = new THREE.Mesh(new THREE.BoxGeometry(wallT, 0.6, 7), MAT.stone);
  gateTop.position.set(size, wallH+0.3, 0);
  scene.add(gateTop);
}

// ── CAMINOS ───────────────────────────────────────────────────────────────────
function buildPaths(scene) {
  // Camino principal N-S
  const p1 = new THREE.Mesh(new THREE.PlaneGeometry(3, 36), MAT.path);
  p1.rotation.x = -Math.PI/2;
  p1.position.set(0, 0.01, 0);
  scene.add(p1);

  // Camino E-O
  const p2 = new THREE.Mesh(new THREE.PlaneGeometry(36, 3), MAT.path);
  p2.rotation.x = -Math.PI/2;
  p2.position.set(0, 0.01, 0);
  scene.add(p2);

  // Plaza central
  const plaza = new THREE.Mesh(new THREE.CircleGeometry(5, 16), MAT.path);
  plaza.rotation.x = -Math.PI/2;
  plaza.position.set(0, 0.02, 0);
  scene.add(plaza);
}

// ── FOGATA CENTRAL ────────────────────────────────────────────────────────────
function buildCampfire(scene) {
  // Piedras alrededor
  for (let i = 0; i < 8; i++) {
    const angle = (i/8) * Math.PI * 2;
    const stone = new THREE.Mesh(
      new THREE.SphereGeometry(0.18, 5, 4),
      MAT.stone
    );
    stone.position.set(Math.cos(angle)*0.55, 0.1, Math.sin(angle)*0.55);
    stone.scale.y = 0.6;
    scene.add(stone);
  }

  // Troncos
  for (let i = 0; i < 3; i++) {
    const angle = (i/3) * Math.PI * 2;
    const log = new THREE.Mesh(
      new THREE.CylinderGeometry(0.06, 0.08, 0.7, 6),
      MAT.wood
    );
    log.position.set(Math.cos(angle)*0.2, 0.12, Math.sin(angle)*0.2);
    log.rotation.z = Math.PI * 0.3;
    log.rotation.y = angle;
    scene.add(log);
  }

  // Llama
  const fireGeo = new THREE.SphereGeometry(0.15, 6, 6);
  const fire    = new THREE.Mesh(fireGeo, MAT.fire);
  fire.position.set(0, 0.4, 0);
  fire.name = 'campfire';
  scene.add(fire);

  // Halo interior
  const halo = new THREE.Mesh(
    new THREE.SphereGeometry(0.22, 6, 6),
    new THREE.MeshBasicMaterial({ color: 0xFF2200, transparent: true, opacity: 0.35 })
  );
  halo.position.set(0, 0.4, 0);
  scene.add(halo);

  // Luz
  const fireLight = new THREE.PointLight(0xFF6622, 2.5, 10);
  fireLight.position.set(0, 0.8, 0);
  scene.add(fireLight);

  scene.userData.fireLight = fireLight;
  scene.userData.fireMesh  = fire;
}

// ── PUEBLO DETALLADO ──────────────────────────────────────────────────────────
function buildDetailedTown(scene) {

  // Fogata central
  buildCampfire(scene);

  // Casas alrededor de la plaza
  addToScene(buildHouse(4, 3, 3.5, MAT.wall,     MAT.roof),     scene,  8,  8);
  addToScene(buildHouse(3, 2.8, 3, MAT.wallDark,  MAT.roofDark), scene, -9,  7, Math.PI*0.05);
  addToScene(buildHouse(5, 3.2, 4, MAT.wall,      MAT.roof),     scene,  9, -8, Math.PI);
  addToScene(buildHouse(3.5, 3, 3, MAT.wallDark,  MAT.roofDark), scene, -8, -9, -Math.PI*0.05);
  addToScene(buildHouse(4, 2.6, 3, MAT.wall,      MAT.roof),     scene,  0,  12, Math.PI*0.5);
  addToScene(buildHouse(3, 3,   3, MAT.wallDark,  MAT.roof),     scene, 14,   2, -Math.PI*0.3);
  addToScene(buildHouse(4, 2.8, 3, MAT.wall,      MAT.roofDark), scene,-13,   1, Math.PI*0.2);

  // Herrería
  buildSmith(scene, -10, -14);

  // Pozo central (ligeramente desplazado de la fogata)
  buildWell(scene, 3, -3);

  // Muro perimetral con torres
  buildWalls(scene);
}

// ── PARTÍCULAS AMBIENTE ───────────────────────────────────────────────────────
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
    color:           0xFFE566,
    size:            0.06,
    transparent:     true,
    opacity:         0.5,
    sizeAttenuation: true,
  });

  const particles = new THREE.Points(geo, mat);
  particles.name  = 'ambient_particles';
  scene.add(particles);
    }
