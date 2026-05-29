// core/worldLOD.js — Ashes of the Reborn

const LOD_CHECK_INTERVAL = 10; // frames
let _lodFrame = 0;

// Llama esto UNA VEZ después de buildear el mundo
export function registerLODObjects(worldGroup) {
  const lod = [];

  worldGroup.traverse(obj => {
    if (!obj.isMesh && obj.type !== 'Group') return;
    if (!obj.parent) return;

    const p = obj.position;

    // Partículas ambientales — distancia corta
    if (obj.isPoints) {
      lod.push({ obj, dist: 50 });
      return;
    }

    // Objetos muy al sur (bosque denso z < -40)
    if (p.z < -40 && p.z > -115) {
      lod.push({ obj, dist: 70 });
      return;
    }

    // Entradas de mazmorra (z < -115)
    if (p.z < -115) {
      lod.push({ obj, dist: 90 });
      return;
    }

    // Ironfell (z > 60)
    if (p.z > 60) {
      lod.push({ obj, dist: 85 });
      return;
    }

    // Bosque ligero / llanuras
    if (p.z < -10 && p.z >= -40) {
      lod.push({ obj, dist: 55 });
      return;
    }
  });

  window._lodObjects = lod;
  console.log(`[LOD] ${lod.length} objetos registrados`);
}

export function updateWorldLOD(playerPos) {
  _lodFrame++;
  if (_lodFrame % LOD_CHECK_INTERVAL !== 0) return;

  const list = window._lodObjects;
  if (!list) return;

  const px = playerPos.x;
  const pz = playerPos.z;

  for (let i = 0; i < list.length; i++) {
    const { obj, dist } = list[i];
    const ox = obj.position.x;
    const oz = obj.position.z;
    const d2 = (px - ox) * (px - ox) + (pz - oz) * (pz - oz);
    obj.visible = d2 < dist * dist;
  }
}
