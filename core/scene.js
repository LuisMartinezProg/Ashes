ufferAttribute(pos, 3));

  const particles = new THREE.// core/scene.js — Ashes of the Reborn | Valiant Gaming
import * as THREE from 'three';

export const FOREST_RESOURCES = [];

export async function initScene() {

  // ── RENDERER ──────────────────────────────
  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    powerPreference: 'high-performance',
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled    = false;
  renderer.toneMapping          = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure  = 1.4;
  renderer.outputColorSpace     = THREE.SRGBColorSpace;
  document.getElementById('canvas-container').appendChild(renderer.domElement);

  // ── ESCENA ────────────────────────────────
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x5A7A8A);
  scene.fog = new THREE.FogExp2(0x3A5A40, 0.014);

  // ── CÁMARA ────────────────────────────────
  const aspect = window.innerWidth / window.innerHeight;
  const camera = new THREE.PerspectiveCamera(55, aspect, 0.1, 400);
  camera.position.set(0, 12, 16);
  camera.lookAt(0, 0, 0);

  // ── ILUMINACIÓN ───────────────────────────
  scene.add(new THREE.AmbientLight(0xB0C8D0, 1.8));

  const sun = new THREE.DirectionalLight(0xFFE8A0, 2.0);
  sun.position.set(-20, 40, -10);
  sun.castShadow = false;
  scene.add(sun);

  scene.add(new THREE.HemisphereLight(0x88AA66, 0x2A3A1A, 1.0));

  // ── SUELO POR ZONAS ───────────────────────
  addGround(scene, 200, 80,  0, -60, 0x1E3A14, 0.98); // Bosque denso
  addGround(scene, 200, 30,  0, -25, 0x2A4A1E, 0.97); // Bosque claro
  addGround(scene, 200, 40,  0,  10, 0x4A7A3A, 0.95); // Planicie
  addGround(scene, 200, 30,  0,  45, 0x5A8A4A, 0.93); // Camino Ironfell
  addGround(scene, 200, 60,  0,  90, 0x6A9A5A, 0.90); // Ironfell

  // ── PLACEHOLDER JUGADOR ───────────────────
  const playerMesh = new THREE.Mesh(
    new THREE.SphereGeometry(0.35, 12, 12),
    new THREE.MeshStandardMaterial({
      color: 0xffffff, transparent: true, opacity: 0.85,
      emissive: 0xaaccff, emissiveIntensity: 0.6,
    })
  );
  playerMesh.position.set(0, 0.6, -20);
  playerMesh.name = 'player_placeholder';
  scene.add(playerMesh);

  // ── CONSTRUCCIÓN DEL MUNDO ────────────────
  buildForestDense(scene);
  buildForestLight(scene);
  buildPlains(scene);
  buildSouthPath(scene);
  buildMikaCarriage(scene);      // Carruaje en z≈47 (escena 6)
  buildIronfellHorizon(scene);
  buildIronfellInterior(scene);  // Ironfell interior (escena 6-7)
  buildForestParticles(scene);

  console.log('[SCENE] Mundo inicializado — Greymantle + Planicie + Ironfell');
  return { scene, camera, renderer };
}

// ── HELPER SUELO ─────────────────────────────────────────────────────────────
function addGround(scene, w, d, x, z, color, roughness) {
  const m = new THREE.Mesh(
    new THREE.PlaneGeometry(w, d),
    new THREE.MeshStandardMaterial({ color, roughness })
  );
  m.rotation.x = -Math.PI / 2;
  m.position.set(x, 0, z);
  scene.add(m);
}

// ── ÁRBOL ────────────────────────────────────────────────────────────────────
function buildTree(scene, x, z, scale = 1, dark = true) {
  const g = new THREE.Group();

  const trunkMat   = new THREE.MeshStandardMaterial({ color: 0x3A2008, roughness: 0.95 });
  const foliageMat = new THREE.MeshStandardMaterial({ color: dark ? 0x0E2E0E : 0x1A4A1A, roughness: 0.9 });
  const foliageMat2= new THREE.MeshStandardMaterial({ color: dark ? 0x163A16 : 0x2A5A20, roughness: 0.9 });

  const trunk = new THREE.Mesh(
    new THREE.CylinderGeometry(0.18 * scale, 0.28 * scale, 2.8 * scale, 6),
    trunkMat
  );
  trunk.position.y = 1.4 * scale;
  g.add(trunk);

  [[2.4, 2.0, 2.8], [1.9, 1.6, 4.4], [1.3, 1.3, 5.8]].forEach(([r, h, y], i) => {
    const cone = new THREE.Mesh(
      new THREE.ConeGeometry(r * scale, h * scale, 6),
      i % 2 === 0 ? foliageMat : foliageMat2
    );
    cone.position.y = y * scale;
    g.add(cone);
  });

  g.position.set(x, 0, z);

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
  const g   = new THREE.Group();
  const mat = new THREE.MeshStandardMaterial({ color: 0x5A5048, roughness: 0.95 });

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

// ── BOSQUE DENSO NORTE (z: -80 a -40) ────────────────────────────────────────
function buildForestDense(scene) {
  const trees = [
    [-12,-45],[10,-48],[-8,-55],[15,-50],[-18,-52],
    [5,-60],[-5,-62],[20,-58],[-22,-56],[12,-65],
    [-15,-65],[0,-70],[25,-52],[-25,-48],[18,-42],
    [-20,-44],[22,-68],[-20,-70],[5,-75],[-5,-72],
    [28,-55],[-28,-50],[15,-72],[-15,-68],[30,-62],
    [-30,-60],[8,-78],[-8,-76],[22,-75],[-22,-73],
  ];
  trees.forEach(([x, z]) => buildTree(scene, x, z, 0.9 + Math.random() * 0.7, true));

  const rocks = [
    [-6,-48],[8,-55],[-14,-62],[18,-45],[-3,-68],
    [22,-58],[-20,-65],[10,-72],[-10,-42],[16,-60],
    [25,-70],[-25,-68],[5,-52],[-5,-56],[20,-75],
  ];
  rocks.forEach(([x, z]) => buildRock(scene, x, z, 0.7 + Math.random() * 0.6));
}

// ── BOSQUE CLARO TRANSICIÓN (z: -40 a -10) ───────────────────────────────────
function buildForestLight(scene) {
  const trees = [
    [-12,-20],[10,-18],[-8,-35],[15,-30],[-18,-28],
    [25,-25],[-25,-22],[18,-15],[-20,-15],[8,-12],
    [-10,-12],[30,-20],[-30,-18],[28,-32],[-28,-28],
  ];
  trees.forEach(([x, z]) => buildTree(scene, x, z, 0.8 + Math.random() * 0.5, false));

  const rocks = [
    [-6,-25],[8,-32],[-14,-18],[18,-22],[-3,-38],
  ];
  rocks.forEach(([x, z]) => buildRock(scene, x, z, 0.6 + Math.random() * 0.4));
}

// ── PLANICIE (z: -10 a 30) ───────────────────────────────────────────────────
function buildPlains(scene) {
  const edgeTrees = [
    [-35, 0], [35, 5], [-32, 15], [32, 10],
    [-38, 25], [38, 20], [-30, 28], [30, 25],
  ];
  edgeTrees.forEach(([x, z]) => buildTree(scene, x, z, 1.0 + Math.random() * 0.3, false));

  const plainsRocks = [
    [-20, 5], [20, 8], [-15, 20], [18, 22],
  ];
  plainsRocks.forEach(([x, z]) => buildRock(scene, x, z, 0.5 + Math.random() * 0.3));
}

// ── CAMINO AL SUR ─────────────────────────────────────────────────────────────
function buildSouthPath(scene) {
  const pathMat = new THREE.MeshStandardMaterial({ color: 0xC8A87A, roughness: 0.98 });

  const path = new THREE.Mesh(new THREE.PlaneGeometry(4, 160), pathMat);
  path.rotation.x = -Math.PI / 2;
  path.position.set(0, 0.01, 30);
  scene.add(path);

  const postMat = new THREE.MeshStandardMaterial({ color: 0x6B4423, roughness: 0.9 });
  const post    = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.1, 2, 6), postMat);
  post.position.set(3, 1, -8);
  scene.add(post);

  const sign = new THREE.Mesh(
    new THREE.BoxGeometry(1.4, 0.4, 0.08),
    new THREE.MeshStandardMaterial({ color: 0x8B6340, roughness: 0.9 })
  );
  sign.position.set(3, 1.9, -8);
  scene.add(sign);

  [[-5,-5],[5,-5],[-5,10],[5,10],[-5,25],[5,25]].forEach(([x, z]) => {
    buildTree(scene, x, z, 0.9, false);
  });
}

// ── CARRUAJE DE MIKA (z≈47, escena 6) ────────────────────────────────────────
function buildMikaCarriage(scene) {
  const woodMat  = new THREE.MeshStandardMaterial({ color: 0x6B4423, roughness: 0.9 });
  const darkMat  = new THREE.MeshStandardMaterial({ color: 0x3A2810, roughness: 0.95 });
  const wheelMat = new THREE.MeshStandardMaterial({ color: 0x2A1A08, roughness: 0.9 });
  const roofMat  = new THREE.MeshStandardMaterial({ color: 0x8B2020, roughness: 0.85 });

  const g = new THREE.Group();

  // Cuerpo del carruaje
  const body = new THREE.Mesh(new THREE.BoxGeometry(3, 1.8, 2), woodMat);
  body.position.y = 1.4;
  g.add(body);

  // Techo
  const roof = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.2, 2.2), roofMat);
  roof.position.y = 2.4;
  g.add(roof);

  // Techo curvo (cono aplastado)
  const roofTop = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 1.6, 0.6, 8), roofMat);
  roofTop.position.y = 2.7;
  g.add(roofTop);

  // Ruedas (4)
  [[-1.2, 0.5, -1.1], [1.2, 0.5, -1.1], [-1.2, 0.5, 1.1], [1.2, 0.5, 1.1]].forEach(([wx, wy, wz]) => {
    const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 0.2, 10), wheelMat);
    wheel.rotation.x = Math.PI / 2;
    wheel.position.set(wx, wy, wz);
    g.add(wheel);
  });

  // Vara delantera
  const vara = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 3, 6), darkMat);
  vara.rotation.z = Math.PI / 2;
  vara.position.set(-2.8, 0.7, 0);
  g.add(vara);

  // Posicionado a la derecha del camino en z≈47
  g.position.set(5, 0, 47);
  g.rotation.y = Math.PI / 6; // ligero ángulo como si estuviera detenido
  scene.add(g);
}

// ── IRONFELL HORIZONTE (siluetas lejanas) ─────────────────────────────────────
function buildIronfellHorizon(scene) {
  const stoneMat = new THREE.MeshStandardMaterial({ color: 0x8A7A6A, roughness: 0.9 });
  const roofMat  = new THREE.MeshStandardMaterial({ color: 0x6A3A2A, roughness: 0.85 });

  const buildings = [
    [0, 75, 8, 12], [-15, 72, 6, 8], [15, 73, 7, 10],
    [-8, 78, 5, 6],  [8, 77, 5, 7],  [-22, 70, 4, 5],
    [22, 71, 4, 6],
  ];

  buildings.forEach(([x, z, w, h]) => {
    const body = new THREE.Mesh(new THREE.BoxGeometry(w, h, w), stoneMat);
    body.position.set(x, h / 2, z);
    scene.add(body);

    const roof = new THREE.Mesh(new THREE.ConeGeometry(w * 0.7, h * 0.4, 4), roofMat);
    roof.position.set(x, h + h * 0.2, z);
    scene.add(roof);
  });

  const wallMat = new THREE.MeshStandardMaterial({ color: 0x7A6A5A, roughness: 0.95 });
  [
    [0,    62, 60, 2.5, 0.8],
    [30,   68, 0.8, 2.5, 20],
    [-30,  68, 0.8, 2.5, 20],
  ].forEach(([x, z, w, h, d]) => {
    const wall = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), wallMat);
    wall.position.set(x, h / 2, z);
    scene.add(wall);
  });

  [-28, 28].forEach(x => {
    const tower = new THREE.Mesh(
      new THREE.CylinderGeometry(1.2, 1.4, 5, 8),
      wallMat
    );
    tower.position.set(x, 2.5, 62);
    scene.add(tower);
  });
}

// ── IRONFELL INTERIOR (z: 63 a 85) ───────────────────────────────────────────
function buildIronfellInterior(scene) {
  const stoneMat  = new THREE.MeshStandardMaterial({ color: 0x7A6A5A, roughness: 0.9 });
  const roofMat   = new THREE.MeshStandardMaterial({ color: 0x5A2A1A, roughness: 0.85 });
  const roofMat2  = new THREE.MeshStandardMaterial({ color: 0x2A4A6A, roughness: 0.85 }); // azul — tienda elfa
  const roofMat3  = new THREE.MeshStandardMaterial({ color: 0x4A6A2A, roughness: 0.85 }); // verde — academia
  const woodMat   = new THREE.MeshStandardMaterial({ color: 0x6B4423, roughness: 0.9 });
  const darkMat   = new THREE.MeshStandardMaterial({ color: 0x2A1A08, roughness: 0.95 });
  const goldMat   = new THREE.MeshStandardMaterial({ color: 0xC9A84C, roughness: 0.6 });
  const pathMat   = new THREE.MeshStandardMaterial({ color: 0xB8987A, roughness: 0.98 });

  // ── Suelo de adoquines ──
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(50, 30), pathMat);
  floor.rotation.x = -Math.PI / 2;
  floor.position.set(0, 0.005, 73);
  scene.add(floor);

  // ── Calle principal (continuación del camino) ──
  const mainStreet = new THREE.Mesh(new THREE.PlaneGeometry(5, 30), pathMat);
  mainStreet.rotation.x = -Math.PI / 2;
  mainStreet.position.set(0, 0.01, 73);
  scene.add(mainStreet);

  // ── Puerta de entrada ──
  _buildGate(scene, stoneMat, darkMat, goldMat);

  // ── EDIFICIOS IZQUIERDA ──

  // Casa común 1
  _buildBuilding(scene, -10, 67, 5, 4, stoneMat, roofMat);
  // Casa común 2
  _buildBuilding(scene, -16, 67, 4, 3.5, stoneMat, roofMat);
  // Casa común 3
  _buildBuilding(scene, -10, 74, 4, 3.5, stoneMat, roofMat);

  // Tienda elfa — techo azul, más llamativa (escena 7)
  _buildShop(scene, -16, 74, stoneMat, roofMat2, woodMat, goldMat);

  // Casa de Mika — techo distinto, cerca del mercado
  _buildBuilding(scene, -22, 71, 5, 4, stoneMat, roofMat);

  // ── EDIFICIOS DERECHA ──

  // Casa común 4
  _buildBuilding(scene, 10, 67, 5, 4, stoneMat, roofMat);
  // Casa común 5
  _buildBuilding(scene, 16, 67, 4, 3.5, stoneMat, roofMat);

  // Academia Veldris — más grande, techo verde, cartel (escena 7-8)
  _buildAcademia(scene, stoneMat, roofMat3, woodMat, goldMat);

  // Despacho de Voron — edificio central al fondo
  _buildBuilding(scene, 0, 82, 7, 6, stoneMat, roofMat);

  // ── Faroles decorativos ──
  [[-4,65],[4,65],[-4,72],[4,72],[-4,79],[4,79]].forEach(([x, z]) => {
    _buildLantern(scene, x, z, woodMat, goldMat);
  });

  // ── Fuente central ──
  _buildFountain(scene, 0, 73, stoneMat, goldMat);
}

// ── PUERTA DE ENTRADA ─────────────────────────────────────────────────────────
function _buildGate(scene, stoneMat, darkMat, goldMat) {
  // Pilares
  [-2.5, 2.5].forEach(x => {
    const pillar = new THREE.Mesh(new THREE.BoxGeometry(1.2, 4, 1.2), stoneMat);
    pillar.position.set(x, 2, 63);
    scene.add(pillar);

    // Antorcha en cada pilar
    const torch = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.5, 6), darkMat);
    torch.position.set(x, 3.8, 63);
    scene.add(torch);

    const flame = new THREE.Mesh(new THREE.SphereGeometry(0.12, 6, 6), goldMat);
    flame.position.set(x, 4.1, 63);
    scene.add(flame);
  });

  // Arco superior
  const arch = new THREE.Mesh(new THREE.BoxGeometry(6, 0.8, 1.0), stoneMat);
  arch.position.set(0, 4.2, 63);
  scene.add(arch);

  // Nombre de la ciudad — placa dorada
  const plaque = new THREE.Mesh(new THREE.BoxGeometry(2.5, 0.5, 0.1), goldMat);
  plaque.position.set(0, 3.6, 62.5);
  scene.add(plaque);
}

// ── EDIFICIO GENÉRICO ─────────────────────────────────────────────────────────
function _buildBuilding(scene, x, z, w, h, wallMat, roofMat) {
  const body = new THREE.Mesh(new THREE.BoxGeometry(w, h, w * 0.8), wallMat);
  body.position.set(x, h / 2, z);
  scene.add(body);

  const roof = new THREE.Mesh(new THREE.ConeGeometry(w * 0.75, h * 0.5, 4), roofMat);
  roof.position.set(x, h + h * 0.25, z);
  roof.rotation.y = Math.PI / 4;
  scene.add(roof);

  // Puerta
  const door = new THREE.Mesh(
    new THREE.BoxGeometry(0.7, 1.2, 0.1),
    new THREE.MeshStandardMaterial({ color: 0x3A2008, roughness: 0.9 })
  );
  door.position.set(x, 0.6, z - w * 0.4 - 0.05);
  scene.add(door);

  // Ventana
  const win = new THREE.Mesh(
    new THREE.BoxGeometry(0.5, 0.4, 0.1),
    new THREE.MeshStandardMaterial({ color: 0xAADDFF, roughness: 0.2, transparent: true, opacity: 0.6 })
  );
  win.position.set(x + 0.8, h * 0.6, z - w * 0.4 - 0.05);
  scene.add(win);
}

// ── TIENDA ELFA ───────────────────────────────────────────────────────────────
function _buildShop(scene, x, z, wallMat, roofMat, woodMat, goldMat) {
  // Edificio base
  const body = new THREE.Mesh(new THREE.BoxGeometry(6, 4, 5), wallMat);
  body.position.set(x, 2, z);
  scene.add(body);

  // Techo azul puntiagudo
  const roof = new THREE.Mesh(new THREE.ConeGeometry(4.5, 2.5, 4), roofMat);
  roof.position.set(x, 5.2, z);
  roof.rotation.y = Math.PI / 4;
  scene.add(roof);

  // Toldo de entrada
  const awning = new THREE.Mesh(new THREE.BoxGeometry(4, 0.15, 1.5), roofMat);
  awning.position.set(x, 2.2, z - 2.8);
  awning.rotation.x = -0.3;
  scene.add(awning);

  // Poste del toldo
  [-1.8, 1.8].forEach(ox => {
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 2, 6), woodMat);
    pole.position.set(x + ox, 1, z - 3.2);
    scene.add(pole);
  });

  // Letrero dorado
  const sign = new THREE.Mesh(new THREE.BoxGeometry(2.5, 0.5, 0.1), goldMat);
  sign.position.set(x, 3.2, z - 2.55);
  scene.add(sign);

  // Puerta
  const door = new THREE.Mesh(
    new THREE.BoxGeometry(1.0, 1.6, 0.1),
    new THREE.MeshStandardMaterial({ color: 0x3A2008, roughness: 0.9 })
  );
  door.position.set(x, 0.8, z - 2.55);
  scene.add(door);
}

// ── ACADEMIA VELDRIS ──────────────────────────────────────────────────────────
function _buildAcademia(scene, wallMat, roofMat, woodMat, goldMat) {
  const x = 14, z = 74;

  // Edificio principal — más grande
  const body = new THREE.Mesh(new THREE.BoxGeometry(9, 6, 7), wallMat);
  body.position.set(x, 3, z);
  scene.add(body);

  // Techo verde
  const roof = new THREE.Mesh(new THREE.ConeGeometry(6, 3, 4), roofMat);
  roof.position.set(x, 7.5, z);
  roof.rotation.y = Math.PI / 4;
  scene.add(roof);

  // Torre lateral izquierda
  const tower = new THREE.Mesh(new THREE.CylinderGeometry(1, 1.2, 8, 8), wallMat);
  tower.position.set(x - 5, 4, z);
  scene.add(tower);

  const towerRoof = new THREE.Mesh(new THREE.ConeGeometry(1.2, 2, 8), roofMat);
  towerRoof.position.set(x - 5, 9, z);
  scene.add(towerRoof);

  // Columnas de entrada
  [-2, 0, 2].forEach(ox => {
    const col = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.25, 5, 8), wallMat);
    col.position.set(x + ox, 2.5, z - 3.55);
    scene.add(col);
  });

  // Cartel de la Academia — visible desde el camino (escena 7)
  const signPost = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 3, 6), woodMat);
  signPost.position.set(x - 2, 1.5, z - 5);
  scene.add(signPost);

  const signBoard = new THREE.Mesh(new THREE.BoxGeometry(2.8, 0.7, 0.1), goldMat);
  signBoard.position.set(x - 2, 3.2, z - 5);
  scene.add(signBoard);

  // Puerta principal
  const door = new THREE.Mesh(
    new THREE.BoxGeometry(1.5, 2.5, 0.1),
    new THREE.MeshStandardMaterial({ color: 0x3A2008, roughness: 0.9 })
  );
  door.position.set(x, 1.25, z - 3.55);
  scene.add(door);

  // Ventanas
  [[-3, 4], [3, 4], [-3, 2], [3, 2]].forEach(([ox, oy]) => {
    const win = new THREE.Mesh(
      new THREE.BoxGeometry(0.8, 0.8, 0.1),
      new THREE.MeshStandardMaterial({ color: 0xAADDFF, roughness: 0.2, transparent: true, opacity: 0.6 })
    );
    win.position.set(x + ox, oy, z - 3.55);
    scene.add(win);
  });
}

// ── FAROL ─────────────────────────────────────────────────────────────────────
function _buildLantern(scene, x, z, woodMat, goldMat) {
  const post = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.08, 3, 6), woodMat);
  post.position.set(x, 1.5, z);
  scene.add(post);

  const lamp = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.3, 0.3), goldMat);
  lamp.position.set(x, 3.1, z);
  scene.add(lamp);
}

// ── FUENTE ────────────────────────────────────────────────────────────────────
function _buildFountain(scene, x, z, stoneMat, goldMat) {
  const base = new THREE.Mesh(new THREE.CylinderGeometry(1.8, 2, 0.4, 12), stoneMat);
  base.position.set(x, 0.2, z);
  scene.add(base);

  const basin = new THREE.Mesh(new THREE.CylinderGeometry(1.5, 1.5, 0.6, 12, 1, true), stoneMat);
  basin.position.set(x, 0.6, z);
  scene.add(basin);

  const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.2, 1.5, 8), stoneMat);
  pillar.position.set(x, 1.1, z);
  scene.add(pillar);

  const top = new THREE.Mesh(new THREE.SphereGeometry(0.25, 8, 8), goldMat);
  top.position.set(x, 1.9, z);
  scene.add(top);
}

// ── PARTÍCULAS ────────────────────────────────────────────────────────────────
function buildForestParticles(scene) {
  const count = 300;
  const geo   = new THREE.BufferGeometry();
  const pos   = new Float32Array(count * 3);

  for (let i = 0; i < count; i++) {
    pos[i*3]   = (Math.random() - 0.5) * 80;
    pos[i*3+1] = Math.random() * 12;
    pos[i*3+2] = -Math.random() * 80 - 5;
  }

  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));

  const particles = new THREE.Points(geo, new THREE.PointsMaterial({
    color: 0xAAFF88, size: 0.05,
    transparent: true, opacity: 0.35,
    sizeAttenuation: true,
  }));
  particles.name = 'ambient_particles';
  scene.add(particles);
}
