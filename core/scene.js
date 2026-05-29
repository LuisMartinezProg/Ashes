// core/scene.js — Ashes of the Reborn | Valiant Gaming
import * as THREE from 'three';

export const FOREST_RESOURCES = [];

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

  scene.add(new THREE.AmbientLight(0xB0C8D0, 1.8));
  const sun = new THREE.DirectionalLight(0xFFE8A0, 2.0);
  sun.position.set(-20, 40, -10);
  sun.castShadow = false;
  scene.add(sun);
  scene.add(new THREE.HemisphereLight(0x88AA66, 0x2A3A1A, 1.0));

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

  const playerMesh = new THREE.Mesh(
    new THREE.SphereGeometry(0.35, 12, 12),
    new THREE.MeshStandardMaterial({
      color: 0xffffff, transparent: true, opacity: 0.85,
      emissive: 0xaaccff, emissiveIntensity: 0.6,
    })
  );
  playerMesh.position.set(0, 0.6, -20);
  playerMesh.name = 'player_placeholder';
  worldGroup.add(playerMesh);

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

  console.log('[SCENE] Mundo inicializado');
  return { scene, camera, renderer };
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
    const radius = 14
