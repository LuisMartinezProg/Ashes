// core/scene.js — Ashes of the Reborn | Valiant Gaming
import * as THREE from 'three';
import { WaypointSystem } from './waypoints.js';
export const FOREST_RESOURCES   = [];
export const SCENE_ANIMATABLES  = [];

export async function initScene() {

  const renderer = new THREE.WebGLRenderer({
    antialias       : true,
    powerPreference : 'high-performance',
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled   = false;
  renderer.toneMapping         = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.4;
  renderer.outputColorSpace    = THREE.SRGBColorSpace;
  document.getElementById('canvas-container').appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x5A7A8A);
  scene.fog = new THREE.FogExp2(0x3A5A40, 0.014);

  const aspect = window.innerWidth / window.innerHeight;
  const camera = new THREE.PerspectiveCamera(55, aspect, 0.1, 400);
  camera.position.set(0, 12, 16);
  camera.lookAt(0, 0, 0);

  const ambientLight = new THREE.AmbientLight(0xB0C8D0, 1.8);
  scene.add(ambientLight);

  const sun = new THREE.DirectionalLight(0xFFE8A0, 2.0);
  sun.position.set(-20, 40, -10);
  sun.castShadow = false;
  scene.add(sun);

  const hemiLight = new THREE.HemisphereLight(0x88AA66, 0x2A3A1A, 1.0);
  scene.add(hemiLight);
  
  const worldGroup = new THREE.Group();
  worldGroup.name = 'world';
  scene.add(worldGroup);
  window._worldGroup = worldGroup;

  addGround(worldGroup, 200, 80,  0,  -60, 0x1E3A14, 0.98);
  addGround(worldGroup, 200, 30,  0,  -25, 0x2A4A1E, 0.97);
  addGround(worldGroup, 200, 40,  0,   10, 0x4A7A3A, 0.95);
  addGround(worldGroup, 200, 30,  0,   45, 0x5A8A4A, 0.93);
  addGround(worldGroup, 200, 60,  0,   90, 0x6A9A5A, 0.90);
  addGround(worldGroup, 200, 120, 0, -160, 0x1a1a1a, 0.99);

  

  buildForestDense(worldGroup);
  buildForestLight(worldGroup);
  buildPlains(worldGroup);
  buildSouthPath(worldGroup);
  buildMikaCarriage(worldGroup);
  buildIronfellHorizon(worldGroup);
  buildIronfellInterior(worldGroup);
  buildForestParticles(scene);

  buildDungeonEntrance(worldGroup, {
    x: 0,   z: -120,
    color: 0x8B7355, glow: 0xC9A84C, torchColor: 0xff6600,
  });
  buildDungeonEntrance(worldGroup, {
    x: -30, z: -160,
    color: 0x445566, glow: 0x44aaff, torchColor: 0x44aaff,
  });
  buildDungeonEntrance(worldGroup, {
    x: 30,  z: -200,
    color: 0x1a0a2a, glow: 0x9933ff, torchColor: 0x9933ff,
  });
window._waypoints = new WaypointSystem();
window._waypoints.buildAll(worldGroup);
console.log('[SCENE] Mundo inicializado');
  return { scene, camera, renderer, lights: { ambient: ambientLight, sun, hemisphere: hemiLight } };
}

function addGround(parent, w, d, x, z, color, roughness) {
  const m = new THREE.Mesh(
    new THREE.PlaneGeometry(w, d),
    new THREE.MeshStandardMaterial({ color, roughness })
  );
  m.rotation.x = -Math.PI / 2;
  m.position.set(x, 0, z);
  parent.add(m);
}

function buildDungeonEntrance(parent, cfg) {
  const { x, z, color, glow, torchColor } = cfg;

  const floorMat = new THREE.MeshStandardMaterial({ color: 0x2a2a2a, roughness: 0.98 });
  const floor    = new THREE.Mesh(new THREE.CircleGeometry(18, 32), floorMat);
  floor.rotation.x = -Math.PI / 2;
  floor.position.set(x, 0.01, z);
  parent.add(floor);

  for (let i = 0; i < 14; i++) {
    const angle  = (i / 14) * Math.PI * 2;
    const radius = 14 + Math.random() * 3;
    buildDarkTree(parent, x + Math.cos(angle) * radius, z + Math.sin(angle) * radius, 0.9 + Math.random() * 0.6);
  }

  for (let i = 0; i < 8; i++) {
    const angle  = (i / 8) * Math.PI * 2 + 0.3;
    const radius = 8 + Math.random() * 4;
    buildEntranceRock(parent, x + Math.cos(angle) * radius, z + Math.sin(angle) * radius, color);
  }

  const rockMat = new THREE.MeshStandardMaterial({ color, roughness: 0.97, metalness: 0.05 });

  const mainRock = new THREE.Mesh(new THREE.SphereGeometry(7, 10, 8), rockMat);
  mainRock.scale.set(1.4, 0.9, 1.1);
  mainRock.position.set(x, 3.2, z - 2);
  parent.add(mainRock);

  const rockL = new THREE.Mesh(new THREE.SphereGeometry(4.5, 8, 7), rockMat);
  rockL.scale.set(1.0, 0.85, 0.9);
  rockL.position.set(x - 6, 2.2, z - 1);
  parent.add(rockL);

  const rockR = new THREE.Mesh(new THREE.SphereGeometry(4.5, 8, 7), rockMat);
  rockR.scale.set(1.0, 0.85, 0.9);
  rockR.position.set(x + 6, 2.2, z - 1);
  parent.add(rockR);

  const rockTop = new THREE.Mesh(new THREE.SphereGeometry(3.5, 8, 6), rockMat);
  rockTop.scale.set(1.2, 0.7, 1.0);
  rockTop.position.set(x, 5.8, z - 1.5);
  parent.add(rockTop);

  const caveMat  = new THREE.MeshBasicMaterial({ color: 0x000000, side: THREE.DoubleSide });
  const caveHole = new THREE.Mesh(new THREE.CircleGeometry(2.2, 16), caveMat);
  caveHole.scale.y = 3.0 / 2.2;
  caveHole.position.set(x, 3.0, z - 5.5);
  caveHole.rotation.x = -0.1;
  parent.add(caveHole);

  const glowMat  = new THREE.MeshBasicMaterial({ color: glow, transparent: true, opacity: 0.18, side: THREE.DoubleSide });
  const glowMesh = new THREE.Mesh(new THREE.CircleGeometry(1.8, 16), glowMat);
  glowMesh.scale.y = 2.6 / 1.8;
  glowMesh.position.set(x, 3.0, z - 5.3);
  glowMesh.rotation.x = -0.1;
  parent.add(glowMesh);

  const startPhase = Math.random() * Math.PI * 2;
  const _pulse = () => {
    if (!parent.visible) return;
    const t = Date.now() * 0.001 + startPhase;
    glowMesh.material.opacity = 0.12 + Math.sin(t * 1.8) * 0.08;
    requestAnimationFrame(_pulse);
  };
  requestAnimationFrame(_pulse);

  const pillarMat = new THREE.MeshStandardMaterial({ color, roughness: 0.95 });
  for (const side of [-1, 1]) {
    const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.7, 5.5, 8), pillarMat);
    pillar.position.set(x + side * 3.2, 2.75, z - 5.0);
    parent.add(pillar);

    const cap = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.4, 1.3), pillarMat);
    cap.position.set(x + side * 3.2, 5.7, z - 5.0);
    parent.add(cap);

    const torchBase = new THREE.Mesh(
      new THREE.CylinderGeometry(0.07, 0.09, 0.7, 6),
      new THREE.MeshStandardMaterial({ color: 0x3a2008, roughness: 0.9 })
    );
    torchBase.position.set(x + side * 3.2, 4.8, z - 4.8);
    parent.add(torchBase);

    const flame = new THREE.Mesh(
      new THREE.SphereGeometry(0.18, 8, 8),
      new THREE.MeshStandardMaterial({ color: torchColor, emissive: torchColor, emissiveIntensity: 2.0 })
    );
    flame.position.set(x + side * 3.2, 5.25, z - 4.8);
    parent.add(flame);
  }

  const stepMat = new THREE.MeshStandardMaterial({ color: 0x333333, roughness: 0.97 });
  for (let s = 0; s < 3; s++) {
    const step = new THREE.Mesh(new THREE.BoxGeometry(4.5 - s * 0.4, 0.25, 0.7), stepMat);
    step.position.set(x, s * 0.25, z - 4.0 + s * 0.7);
    parent.add(step);
  }

  const fogGeo = new THREE.BufferGeometry();
  const fogPos = new Float32Array(20 * 3);
  for (let i = 0; i < 20; i++) {
    fogPos[i*3]   = x + (Math.random() - 0.5) * 5;
    fogPos[i*3+1] = Math.random() * 4;
    fogPos[i*3+2] = z - 3 - Math.random() * 5;
  }
  fogGeo.setAttribute('position', new THREE.BufferAttribute(fogPos, 3));
  const fogParticles = new THREE.Points(fogGeo, new THREE.PointsMaterial({
    color: glow, size: 0.12, transparent: true, opacity: 0.25, sizeAttenuation: true,
  }));
  parent.add(fogParticles);

  const _animFog = () => {
    if (!parent.visible) return;
    const pos = fogParticles.geometry.attributes.position;
    for (let i = 0; i < 20; i++) {
      pos.setY(i, pos.getY(i) + 0.003);
      if (pos.getY(i) > 4.5) pos.setY(i, 0);
    }
    pos.needsUpdate = true;
    requestAnimationFrame(_animFog);
  };
  requestAnimationFrame(_animFog);
}

function buildDarkTree(parent, x, z, scale = 1) {
  const g = new THREE.Group();
  const trunkMat    = new THREE.MeshStandardMaterial({ color: 0x1a0f05, roughness: 0.98 });
  const foliageMat  = new THREE.MeshStandardMaterial({ color: 0x080f08, roughness: 0.95 });
  const foliageMat2 = new THREE.MeshStandardMaterial({ color: 0x0a140a, roughness: 0.95 });

  const trunk = new THREE.Mesh(
    new THREE.CylinderGeometry(0.16 * scale, 0.26 * scale, 3.2 * scale, 6), trunkMat
  );
  trunk.position.y = 1.6 * scale;
  g.add(trunk);

  for (let i = 0; i < 3; i++) {
    const angle  = (i / 3) * Math.PI * 2;
    const branch = new THREE.Mesh(
      new THREE.CylinderGeometry(0.06 * scale, 0.1 * scale, 1.4 * scale, 5), trunkMat
    );
    branch.position.set(Math.cos(angle) * 0.5 * scale, (2.8 + i * 0.4) * scale, Math.sin(angle) * 0.5 * scale);
    branch.rotation.z = Math.cos(angle) * 0.5;
    branch.rotation.x = Math.sin(angle) * 0.5;
    g.add(branch);
  }

  [[2.2,1.8,2.6],[1.7,1.4,4.0],[1.1,1.1,5.2]].forEach(([r,h,y],i) => {
    const cone = new THREE.Mesh(
      new THREE.ConeGeometry(r*scale, h*scale, 6),
      i % 2 === 0 ? foliageMat : foliageMat2
    );
    cone.position.y = y * scale;
    g.add(cone);
  });

  g.position.set(x, 0, z);
  parent.add(g);
  return g;
}

function buildEntranceRock(parent, x, z, color) {
  const g   = new THREE.Group();
  const mat = new THREE.MeshStandardMaterial({ color, roughness: 0.97 });
  [[0,0.4,0,0.7],[-0.4,0.25,0.3,0.45],[0.35,0.2,-0.2,0.38]].forEach(([rx,ry,rz,r]) => {
    const rock = new THREE.Mesh(new THREE.SphereGeometry(r, 6, 5), mat);
    rock.position.set(rx, ry, rz);
    rock.scale.y = 0.65;
    g.add(rock);
  });
  g.position.set(x, 0, z);
  parent.add(g);
  return g;
}

function buildTree(parent, x, z, scale = 1, dark = true) {
  const g = new THREE.Group();
  const trunkMat    = new THREE.MeshStandardMaterial({ color: 0x3A2008, roughness: 0.95 });
  const foliageMat  = new THREE.MeshStandardMaterial({ color: dark ? 0x0E2E0E : 0x1A4A1A, roughness: 0.9 });
  const foliageMat2 = new THREE.MeshStandardMaterial({ color: dark ? 0x163A16 : 0x2A5A20, roughness: 0.9 });

  const trunk = new THREE.Mesh(
    new THREE.CylinderGeometry(0.18*scale, 0.28*scale, 2.8*scale, 6), trunkMat
  );
  trunk.position.y = 1.4 * scale;
  g.add(trunk);

  [[2.4,2.0,2.8],[1.9,1.6,4.4],[1.3,1.3,5.8]].forEach(([r,h,y],i) => {
    const cone = new THREE.Mesh(
      new THREE.ConeGeometry(r*scale, h*scale, 6),
      i % 2 === 0 ? foliageMat : foliageMat2
    );
    cone.position.y = y * scale;
    g.add(cone);
  });

  g.position.set(x, 0, z);
  FOREST_RESOURCES.push({
    type: 'madera', mesh: g, hp: 5, maxHp: 5,
    position: new THREE.Vector3(x, 0, z), depleted: false,
  });
  parent.add(g);
  return g;
}

function buildRock(parent, x, z, scale = 1) {
  const g   = new THREE.Group();
  const mat = new THREE.MeshStandardMaterial({ color: 0x5A5048, roughness: 0.95 });
  [[0,0.3,0,0.5],[-0.3,0.2,0.2,0.35],[0.25,0.15,-0.15,0.3]].forEach(([rx,ry,rz,r]) => {
    const rock = new THREE.Mesh(new THREE.SphereGeometry(r*scale, 6, 5), mat);
    rock.position.set(rx*scale, ry*scale, rz*scale);
    rock.scale.y = 0.7;
    g.add(rock);
  });
  g.position.set(x, 0, z);
  FOREST_RESOURCES.push({
    type: 'piedra', mesh: g, hp: 8, maxHp: 8,
    position: new THREE.Vector3(x, 0, z), depleted: false,
  });
  parent.add(g);
  return g;
}

function buildForestDense(parent) {
  const trees = [
    [-12,-45],[10,-48],[-8,-55],[15,-50],[-18,-52],
    [5,-60],[-5,-62],[20,-58],[-22,-56],[12,-65],
    [-15,-65],[0,-70],[25,-52],[-25,-48],[18,-42],
    [-20,-44],[22,-68],[-20,-70],[5,-75],[-5,-72],
    [28,-55],[-28,-50],[15,-72],[-15,-68],[30,-62],
    [-30,-60],[8,-78],[-8,-76],[22,-75],[-22,-73],
  ];
  trees.forEach(([x,z]) => buildTree(parent, x, z, 0.9+Math.random()*0.7, true));

  const rocks = [
    [-6,-48],[8,-55],[-14,-62],[18,-45],[-3,-68],
    [22,-58],[-20,-65],[10,-72],[-10,-42],[16,-60],
    [25,-70],[-25,-68],[5,-52],[-5,-56],[20,-75],
  ];
  rocks.forEach(([x,z]) => buildRock(parent, x, z, 0.7+Math.random()*0.6));
}

function buildForestLight(parent) {
  const trees = [
    [-12,-20],[10,-18],[-8,-35],[15,-30],[-18,-28],
    [25,-25],[-25,-22],[18,-15],[-20,-15],[8,-12],
    [-10,-12],[30,-20],[-30,-18],[28,-32],[-28,-28],
  ];
  trees.forEach(([x,z]) => buildTree(parent, x, z, 0.8+Math.random()*0.5, false));

  const rocks = [[-6,-25],[8,-32],[-14,-18],[18,-22],[-3,-38]];
  rocks.forEach(([x,z]) => buildRock(parent, x, z, 0.6+Math.random()*0.4));
}

function buildPlains(parent) {
  const edgeTrees = [
    [-35,0],[35,5],[-32,15],[32,10],[-38,25],[38,20],[-30,28],[30,25],
  ];
  edgeTrees.forEach(([x,z]) => buildTree(parent, x, z, 1.0+Math.random()*0.3, false));

  const rocks = [[-20,5],[20,8],[-15,20],[18,22]];
  rocks.forEach(([x,z]) => buildRock(parent, x, z, 0.5+Math.random()*0.3));
}

function buildSouthPath(parent) {
  const pathMat = new THREE.MeshStandardMaterial({ color: 0xC8A87A, roughness: 0.98 });
  const path    = new THREE.Mesh(new THREE.PlaneGeometry(4, 160), pathMat);
  path.rotation.x = -Math.PI / 2;
  path.position.set(0, 0.01, 30);
  parent.add(path);

  const postMat = new THREE.MeshStandardMaterial({ color: 0x6B4423, roughness: 0.9 });
  const post    = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.1, 2, 6), postMat);
  post.position.set(3, 1, -8);
  parent.add(post);

  const sign = new THREE.Mesh(
    new THREE.BoxGeometry(1.4, 0.4, 0.08),
    new THREE.MeshStandardMaterial({ color: 0x8B6340, roughness: 0.9 })
  );
  sign.position.set(3, 1.9, -8);
  parent.add(sign);

  [[-5,-5],[5,-5],[-5,10],[5,10],[-5,25],[5,25]].forEach(([x,z]) => {
    buildTree(parent, x, z, 0.9, false);
  });
}

function buildMikaCarriage(parent) {
  const woodMat  = new THREE.MeshStandardMaterial({ color: 0x6B4423, roughness: 0.9 });
  const darkMat  = new THREE.MeshStandardMaterial({ color: 0x3A2810, roughness: 0.95 });
  const wheelMat = new THREE.MeshStandardMaterial({ color: 0x2A1A08, roughness: 0.9 });
  const roofMat  = new THREE.MeshStandardMaterial({ color: 0x8B2020, roughness: 0.85 });

  const g = new THREE.Group();

  const body = new THREE.Mesh(new THREE.BoxGeometry(3, 1.8, 2), woodMat);
  body.position.y = 1.4;
  g.add(body);

  const roof = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.2, 2.2), roofMat);
  roof.position.y = 2.4;
  g.add(roof);

  const roofTop = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 1.6, 0.6, 8), roofMat);
  roofTop.position.y = 2.7;
  g.add(roofTop);

  [[-1.2,0.5,-1.1],[1.2,0.5,-1.1],[-1.2,0.5,1.1],[1.2,0.5,1.1]].forEach(([wx,wy,wz]) => {
    const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 0.2, 10), wheelMat);
    wheel.rotation.x = Math.PI / 2;
    wheel.position.set(wx, wy, wz);
    g.add(wheel);
  });

  const vara = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 3, 6), darkMat);
  vara.rotation.z = Math.PI / 2;
  vara.position.set(-2.8, 0.7, 0);
  g.add(vara);

  g.position.set(5, 0, 47);
  g.rotation.y = Math.PI / 6;
  parent.add(g);
}

function buildIronfellHorizon(parent) {
  const stoneMat = new THREE.MeshStandardMaterial({ color: 0x8A7A6A, roughness: 0.9 });
  const roofMat  = new THREE.MeshStandardMaterial({ color: 0x6A3A2A, roughness: 0.85 });

  [[0,75,8,12],[-15,72,6,8],[15,73,7,10],[-8,78,5,6],[8,77,5,7],[-22,70,4,5],[22,71,4,6]]
  .forEach(([x,z,w,h]) => {
    const body = new THREE.Mesh(new THREE.BoxGeometry(w,h,w), stoneMat);
    body.position.set(x, h/2, z);
    parent.add(body);
    const roof = new THREE.Mesh(new THREE.ConeGeometry(w*0.7, h*0.4, 4), roofMat);
    roof.position.set(x, h+h*0.2, z);
    parent.add(roof);
  });

  const wallMat = new THREE.MeshStandardMaterial({ color: 0x7A6A5A, roughness: 0.95 });
  [[0,62,60,2.5,0.8],[30,68,0.8,2.5,20],[-30,68,0.8,2.5,20]].forEach(([x,z,w,h,d]) => {
    const wall = new THREE.Mesh(new THREE.BoxGeometry(w,h,d), wallMat);
    wall.position.set(x, h/2, z);
    parent.add(wall);
  });

  [-28,28].forEach(x => {
    const tower = new THREE.Mesh(new THREE.CylinderGeometry(1.2,1.4,5,8), wallMat);
    tower.position.set(x, 2.5, 62);
    parent.add(tower);
  });
}

function buildIronfellInterior(parent) {
  const stoneMat = new THREE.MeshStandardMaterial({ color: 0x7A6A5A, roughness: 0.9 });
  const roofMat  = new THREE.MeshStandardMaterial({ color: 0x5A2A1A, roughness: 0.85 });
  const roofMat2 = new THREE.MeshStandardMaterial({ color: 0x2A4A6A, roughness: 0.85 });
  const roofMat3 = new THREE.MeshStandardMaterial({ color: 0x4A6A2A, roughness: 0.85 });
  const woodMat  = new THREE.MeshStandardMaterial({ color: 0x6B4423, roughness: 0.9 });
  const darkMat  = new THREE.MeshStandardMaterial({ color: 0x2A1A08, roughness: 0.95 });
  const goldMat  = new THREE.MeshStandardMaterial({ color: 0xC9A84C, roughness: 0.6 });
  const pathMat  = new THREE.MeshStandardMaterial({ color: 0xB8987A, roughness: 0.98 });

  const floor = new THREE.Mesh(new THREE.PlaneGeometry(50, 30), pathMat);
  floor.rotation.x = -Math.PI / 2;
  floor.position.set(0, 0.005, 73);
  parent.add(floor);

  const mainStreet = new THREE.Mesh(new THREE.PlaneGeometry(5, 30), pathMat);
  mainStreet.rotation.x = -Math.PI / 2;
  mainStreet.position.set(0, 0.01, 73);
  parent.add(mainStreet);

  _buildGate(parent, stoneMat, darkMat, goldMat);
  _buildBuilding(parent, -10, 67, 5, 4, stoneMat, roofMat);
  _buildBuilding(parent, -16, 67, 4, 3.5, stoneMat, roofMat);
  _buildBuilding(parent, -10, 74, 4, 3.5, stoneMat, roofMat);
  _buildShop(parent, -16, 74, stoneMat, roofMat2, woodMat, goldMat);
  _buildBuilding(parent, -22, 71, 5, 4, stoneMat, roofMat);
  _buildBuilding(parent, 10, 67, 5, 4, stoneMat, roofMat);
  _buildBuilding(parent, 16, 67, 4, 3.5, stoneMat, roofMat);
  _buildAcademia(parent, stoneMat, roofMat3, woodMat, goldMat);
  _buildBuilding(parent, 0, 82, 7, 6, stoneMat, roofMat);

  [[-4,65],[4,65],[-4,72],[4,72],[-4,79],[4,79]].forEach(([x,z]) => {
    _buildLantern(parent, x, z, woodMat, goldMat);
  });
  _buildFountain(parent, 0, 73, stoneMat, goldMat);
}

function _buildGate(parent, stoneMat, darkMat, goldMat) {
  [-2.5,2.5].forEach(x => {
    const pillar = new THREE.Mesh(new THREE.BoxGeometry(1.2,4,1.2), stoneMat);
    pillar.position.set(x, 2, 63);
    parent.add(pillar);
    const torch = new THREE.Mesh(new THREE.CylinderGeometry(0.08,0.08,0.5,6), darkMat);
    torch.position.set(x, 3.8, 63);
    parent.add(torch);
    const flame = new THREE.Mesh(new THREE.SphereGeometry(0.12,6,6), goldMat);
    flame.position.set(x, 4.1, 63);
    parent.add(flame);
  });
  const arch = new THREE.Mesh(new THREE.BoxGeometry(6,0.8,1.0), stoneMat);
  arch.position.set(0, 4.2, 63);
  parent.add(arch);
  const plaque = new THREE.Mesh(new THREE.BoxGeometry(2.5,0.5,0.1), goldMat);
  plaque.position.set(0, 3.6, 62.5);
  parent.add(plaque);
}

function _buildBuilding(parent, x, z, w, h, wallMat, roofMat) {
  const body = new THREE.Mesh(new THREE.BoxGeometry(w,h,w*0.8), wallMat);
  body.position.set(x, h/2, z);
  parent.add(body);
  const roof = new THREE.Mesh(new THREE.ConeGeometry(w*0.75,h*0.5,4), roofMat);
  roof.position.set(x, h+h*0.25, z);
  roof.rotation.y = Math.PI/4;
  parent.add(roof);
  const door = new THREE.Mesh(
    new THREE.BoxGeometry(0.7,1.2,0.1),
    new THREE.MeshStandardMaterial({ color: 0x3A2008, roughness: 0.9 })
  );
  door.position.set(x, 0.6, z-w*0.4-0.05);
  parent.add(door);
  const win = new THREE.Mesh(
    new THREE.BoxGeometry(0.5,0.4,0.1),
    new THREE.MeshStandardMaterial({ color: 0xAADDFF, roughness: 0.2, transparent: true, opacity: 0.6 })
  );
  win.position.set(x+0.8, h*0.6, z-w*0.4-0.05);
  parent.add(win);
}

function _buildShop(parent, x, z, wallMat, roofMat, woodMat, goldMat) {
  const body = new THREE.Mesh(new THREE.BoxGeometry(6,4,5), wallMat);
  body.position.set(x, 2, z);
  parent.add(body);
  const roof = new THREE.Mesh(new THREE.ConeGeometry(4.5,2.5,4), roofMat);
  roof.position.set(x, 5.2, z);
  roof.rotation.y = Math.PI/4;
  parent.add(roof);
  const awning = new THREE.Mesh(new THREE.BoxGeometry(4,0.15,1.5), roofMat);
  awning.position.set(x, 2.2, z-2.8);
  awning.rotation.x = -0.3;
  parent.add(awning);
  [-1.8,1.8].forEach(ox => {
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.05,0.05,2,6), woodMat);
    pole.position.set(x+ox, 1, z-3.2);
    parent.add(pole);
  });
  const sign = new THREE.Mesh(new THREE.BoxGeometry(2.5,0.5,0.1), goldMat);
  sign.position.set(x, 3.2, z-2.55);
  parent.add(sign);
  const door = new THREE.Mesh(
    new THREE.BoxGeometry(1.0,1.6,0.1),
    new THREE.MeshStandardMaterial({ color: 0x3A2008, roughness: 0.9 })
  );
  door.position.set(x, 0.8, z-2.55);
  parent.add(door);
}

function _buildAcademia(parent, wallMat, roofMat, woodMat, goldMat) {
  const x = 14, z = 74;
  const body = new THREE.Mesh(new THREE.BoxGeometry(9,6,7), wallMat);
  body.position.set(x, 3, z);
  parent.add(body);
  const roof = new THREE.Mesh(new THREE.ConeGeometry(6,3,4), roofMat);
  roof.position.set(x, 7.5, z);
  roof.rotation.y = Math.PI/4;
  parent.add(roof);
  const tower = new THREE.Mesh(new THREE.CylinderGeometry(1,1.2,8,8), wallMat);
  tower.position.set(x-5, 4, z);
  parent.add(tower);
  const towerRoof = new THREE.Mesh(new THREE.ConeGeometry(1.2,2,8), roofMat);
  towerRoof.position.set(x-5, 9, z);
  parent.add(towerRoof);
  [-2,0,2].forEach(ox => {
    const col = new THREE.Mesh(new THREE.CylinderGeometry(0.2,0.25,5,8), wallMat);
    col.position.set(x+ox, 2.5, z-3.55);
    parent.add(col);
  });
  const signPost = new THREE.Mesh(new THREE.CylinderGeometry(0.07,0.07,3,6), woodMat);
  signPost.position.set(x-2, 1.5, z-5);
  parent.add(signPost);
  const signBoard = new THREE.Mesh(new THREE.BoxGeometry(2.8,0.7,0.1), goldMat);
  signBoard.position.set(x-2, 3.2, z-5);
  parent.add(signBoard);
  const door = new THREE.Mesh(
    new THREE.BoxGeometry(1.5,2.5,0.1),
    new THREE.MeshStandardMaterial({ color: 0x3A2008, roughness: 0.9 })
  );
  door.position.set(x, 1.25, z-3.55);
  parent.add(door);
  [[-3,4],[3,4],[-3,2],[3,2]].forEach(([ox,oy]) => {
    const win = new THREE.Mesh(
      new THREE.BoxGeometry(0.8,0.8,0.1),
      new THREE.MeshStandardMaterial({ color: 0xAADDFF, roughness: 0.2, transparent: true, opacity: 0.6 })
    );
    win.position.set(x+ox, oy, z-3.55);
    parent.add(win);
  });
}

function _buildLantern(parent, x, z, woodMat, goldMat) {
  const post = new THREE.Mesh(new THREE.CylinderGeometry(0.06,0.08,3,6), woodMat);
  post.position.set(x, 1.5, z);
  parent.add(post);
  const lamp = new THREE.Mesh(new THREE.BoxGeometry(0.3,0.3,0.3), goldMat);
  lamp.position.set(x, 3.1, z);
  parent.add(lamp);
}

function _buildFountain(parent, x, z, stoneMat, goldMat) {
  const base = new THREE.Mesh(new THREE.CylinderGeometry(1.8,2,0.4,12), stoneMat);
  base.position.set(x, 0.2, z);
  parent.add(base);
  const basin = new THREE.Mesh(new THREE.CylinderGeometry(1.5,1.5,0.6,12,1,true), stoneMat);
  basin.position.set(x, 0.6, z);
  parent.add(basin);
  const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.15,0.2,1.5,8), stoneMat);
  pillar.position.set(x, 1.1, z);
  parent.add(pillar);
  const top = new THREE.Mesh(new THREE.SphereGeometry(0.25,8,8), goldMat);
  top.position.set(x, 1.9, z);
  parent.add(top);
}

function buildForestParticles(scene) {
  const count = 80;
  const geo   = new THREE.BufferGeometry();
  const pos   = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    pos[i*3]   = (Math.random() - 0.5) * 80;
    pos[i*3+1] = Math.random() * 12;
    pos[i*3+2] = -Math.random() * 80 - 5;
  }
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const particles = new THREE.Points(geo, new THREE.PointsMaterial({
    color: 0xAAFF88, size: 0.05, transparent: true, opacity: 0.35, sizeAttenuation: true,
  }));
  particles.name = 'ambient_particles';
  scene.add(particles);
}
