// core/dungeons/levels/PlatformLevel.js — Ashes of the Reborn | Valiant Gaming
import * as THREE from 'three';

const PLATFORM_COUNT  = 8;
const FALL_ZONE_Y     = -3;
const ARROW_DAMAGE    = 10;
const ARROW_SPEED     = 9;
const ARROW_DURATION  = 1.8;
const RESPAWN_DELAY   = 2000;

export class PlatformLevel {
  constructor(scene, origin) {
    this.scene    = scene;
    this.origin   = origin;
    this._meshes  = [];
    this._platforms = [];
    this._trapZones = [];
    this._arrows    = [];
    this._active    = false;
    this._completed = false;

    this.onComplete = null;
    this.onFail     = null;

    this._build();
    this._buildTutorialHint();
  }

  // ── Construcción ──────────────────────────────────────────────────────────

  _build() {
    const ox = this.origin.x;
    const oz = this.origin.z;

    // Suelo de caída — zona peligrosa
    const floorGeo = new THREE.PlaneGeometry(40, 40);
    const floorMat = new THREE.MeshBasicMaterial({
      color      : 0x110000,
      transparent: true,
      opacity    : 0.9,
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.set(ox, FALL_ZONE_Y, oz);
    this.scene.add(floor);
    this._meshes.push(floor);

    // Plataformas en zigzag
    const platformDefs = [
      { ox: -8,  oy: 0,   oz: -8,  w: 5, d: 5, safe: true  },
      { ox: -3,  oy: 0.5, oz: -5,  w: 4, d: 4, safe: false },
      { ox:  3,  oy: 1.0, oz: -2,  w: 4, d: 4, safe: false },
      { ox: -1,  oy: 1.5, oz:  2,  w: 3, d: 3, safe: false },
      { ox:  5,  oy: 2.0, oz:  4,  w: 3, d: 3, safe: false },
      { ox:  2,  oy: 2.5, oz:  7,  w: 3, d: 3, safe: false },
      { ox: -3,  oy: 3.0, oz:  9,  w: 4, d: 4, safe: false },
      { ox:  0,  oy: 3.5, oz: 13,  w: 6, d: 5, safe: true  },
    ];

    for (let i = 0; i < platformDefs.length; i++) {
      const def = platformDefs[i];
      const geo = new THREE.BoxGeometry(def.w, 0.4, def.d);
      const mat = new THREE.MeshStandardMaterial({
        color    : def.safe ? 0x44aa44 : 0x4466aa,
        emissive : def.safe ? 0x224422 : 0x223344,
        emissiveIntensity: 0.3,
        roughness: 0.7,
      });
      const m = new THREE.Mesh(geo, mat);
      m.position.set(ox + def.ox, def.oy, oz + def.oz);
      this.scene.add(m);
      this._meshes.push(m);
      this._platforms.push({
        mesh: m, ...def,
        worldX: ox + def.ox,
        worldZ: oz + def.oz,
        _timer: 0,
        _falling: false,
      });
    }

    // Zonas de trampa en el suelo de caída
    const trapDefs = [
      { ox: -6, oz: -4 }, { ox: 0,  oz: -6 }, { ox:  6, oz: -4 },
      { ox: -6, oz:  0 }, { ox: 6,  oz:  0 },
      { ox: -6, oz:  4 }, { ox: 0,  oz:  6 }, { ox:  6, oz:  4 },
    ];
    for (const def of trapDefs) {
      const geo = new THREE.PlaneGeometry(4, 4);
      const mat = new THREE.MeshBasicMaterial({
        color      : 0x660000,
        transparent: true,
        opacity    : 0.6,
        side       : THREE.DoubleSide,
      });
      const m = new THREE.Mesh(geo, mat);
      m.rotation.x = -Math.PI / 2;
      m.position.set(ox + def.ox, FALL_ZONE_Y + 0.05, oz + def.oz);
      this.scene.add(m);
      this._meshes.push(m);
      this._trapZones.push({
        mesh: m,
        worldX: ox + def.ox,
        worldZ: oz + def.oz,
        _firing: false,
      });
    }

    // Meta — plataforma final con brillo
    const goalGeo = new THREE.CylinderGeometry(1.5, 1.5, 0.1, 16);
    const goalMat = new THREE.MeshBasicMaterial({ color: 0xffdd44, transparent: true, opacity: 0.8 });
    this._goalMesh = new THREE.Mesh(goalGeo, goalMat);
    this._goalMesh.position.set(ox, 3.6, oz + 13);
    this.scene.add(this._goalMesh);
    this._meshes.push(this._goalMesh);

    const goalLight = new THREE.PointLight(0xffdd44, 2, 8);
    goalLight.position.set(ox, 4.5, oz + 13);
    this.scene.add(goalLight);
    this._meshes.push(goalLight);
  }

  _buildTutorialHint() {
    const canvas  = document.createElement('canvas');
    canvas.width  = 512;
    canvas.height = 80;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = 'rgba(0,0,0,0)';
    ctx.fillRect(0, 0, 512, 80);
    ctx.font         = 'bold 20px monospace';
    ctx.fillStyle    = '#88aaff';
    ctx.textAlign    = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('Sprint para cruzar — evita caer', 256, 40);

    const tex = new THREE.CanvasTexture(canvas);
    const geo = new THREE.PlaneGeometry(8, 1.2);
    const mat = new THREE.MeshBasicMaterial({ map: tex, transparent: true, side: THREE.DoubleSide });
    const m   = new THREE.Mesh(geo, mat);
    m.position.set(this.origin.x, 2.5, this.origin.z - 6);
    m.rotation.y = Math.PI;
    this.scene.add(m);
    this._meshes.push(m);
  }

  // ── Update ────────────────────────────────────────────────────────────────

  activate() { this._active = true; }

  update(delta) {
    if (!this._active || this._completed) return;

    const player = window._partyManager?.getActiveCharacter()
                ?? window._player;
    if (!player) return;

    const pos = player.root?.position ?? player.position;

    this._updatePlatforms(delta, pos);
    this._updateTrapZones(pos);
    this._updateArrows(delta, player, pos);
    this._checkGoal(pos);
    this._checkFall(player, pos);
    this._animateGoal(delta);
  }

  _updatePlatforms(delta, pos) {
    for (const p of this._platforms) {
      if (p.safe) continue;
      const dx   = pos.x - p.worldX;
      const dz   = pos.z - p.worldZ;
      const dist = Math.sqrt(dx*dx + dz*dz);

      if (dist < 2.2 && !p._falling) {
        p._timer += delta;
        // Vibrar
        p.mesh.position.x = p.worldX + Math.sin(p._timer * 30) * 0.04;
        if (p._timer > 0.8) {
          p._falling = true;
          this._dropPlatform(p);
        }
      }
    }
  }

  _dropPlatform(p) {
    const start = performance.now();
    const origY = p.mesh.position.y;
    const fall  = () => {
      const t = (performance.now() - start) / 1000;
      p.mesh.position.y = origY - t * t * 4;
      if (p.mesh.position.y > FALL_ZONE_Y - 2) {
        requestAnimationFrame(fall);
      } else {
        // Reaparecer después
        setTimeout(() => {
          p._falling       = false;
          p._timer         = 0;
          p.mesh.position.y = origY;
          p.mesh.position.x = p.worldX;
        }, RESPAWN_DELAY + Math.random() * 1000);
      }
    };
    requestAnimationFrame(fall);
  }

  _updateTrapZones(pos) {
    if (pos.y > FALL_ZONE_Y + 1.5) return;

    for (const trap of this._trapZones) {
      const dx   = pos.x - trap.worldX;
      const dz   = pos.z - trap.worldZ;
      const dist = Math.sqrt(dx*dx + dz*dz);

      if (dist < 2 && !trap._firing) {
        trap._firing = true;
        trap.mesh.material.color.setHex(0xff2200);
        this._launchArrowsFrom(trap.worldX, FALL_ZONE_Y + 0.8, trap.worldZ);
        setTimeout(() => {
          trap._firing = false;
          trap.mesh.material.color.setHex(0x660000);
        }, 2200);
      }
    }
  }

  _launchArrowsFrom(x, y, z) {
    const dirs = [
      [1,0],[-1,0],[0,1],[0,-1],
      [0.7,0.7],[-0.7,0.7],[0.7,-0.7],[-0.7,-0.7],
    ];
    for (const [dx, dz] of dirs) {
      const geo = new THREE.CylinderGeometry(0.05, 0.05, 0.8, 6);
      const mat = new THREE.MeshBasicMaterial({ color: 0xff8800 });
      const m   = new THREE.Mesh(geo, mat);
      m.rotation.z = Math.PI / 2;
      m.position.set(x, y, z);

      const angle = Math.atan2(dz, dx);
      m.rotation.y = -angle;

      this.scene.add(m);
      this._meshes.push(m);
      this._arrows.push({ mesh: m, dx, dz, life: ARROW_DURATION });
    }
  }

  _updateArrows(delta, player, pos) {
    for (let i = this._arrows.length - 1; i >= 0; i--) {
      const a = this._arrows[i];
      a.life -= delta;
      a.mesh.position.x += a.dx * ARROW_SPEED * delta;
      a.mesh.position.z += a.dz * ARROW_SPEED * delta;

      const dx   = pos.x - a.mesh.position.x;
      const dz   = pos.z - a.mesh.position.z;
      const dist = Math.sqrt(dx*dx + dz*dz);
      if (dist < 0.5) {
        player.takeDamage?.(ARROW_DAMAGE);
        a.life = 0;
      }

      if (a.life <= 0) {
        this.scene.remove(a.mesh);
        a.mesh.geometry.dispose();
        a.mesh.material.dispose();
        this._arrows.splice(i, 1);
      }
    }
  }

  _checkGoal(pos) {
    const gx   = this.origin.x;
    const gz   = this.origin.z + 13;
    const dx   = pos.x - gx;
    const dz   = pos.z - gz;
    const dist = Math.sqrt(dx*dx + dz*dz);
    if (dist < 2.5 && pos.y > 3.0) {
      this._completed = true;
      this._showComplete();
      if (this.onComplete) this.onComplete();
    }
  }

  _checkFall(player, pos) {
    if (pos.y < FALL_ZONE_Y + 0.5) {
      this._respawnPlayer(player);
    }
  }

  _respawnPlayer(player) {
    const start = this._platforms[0];
    if (player.root) {
      player.root.position.set(
        this.origin.x + start.ox,
        start.oy + 0.5,
        this.origin.z + start.oz
      );
    }
    player.takeDamage?.(5);
    if (this.onFail) this.onFail();
  }

  _animateGoal(delta) {
    if (!this._goalMesh) return;
    this._goalMesh.rotation.y += delta * 1.5;
    this._goalMesh.material.opacity = 0.6 + Math.sin(Date.now() * 0.003) * 0.2;
  }

  _showComplete() {
    const el = document.createElement('div');
    Object.assign(el.style, {
      position     : 'fixed',
      top          : '35%',
      left         : '50%',
      transform    : 'translateX(-50%)',
      fontFamily   : "'Cinzel',serif",
      fontSize     : '18px',
      letterSpacing: '3px',
      color        : '#44ff88',
      textShadow   : '0 0 16px #44ff88',
      pointerEvents: 'none',
      zIndex       : '300',
      opacity      : '1',
      transition   : 'opacity 1s, top 1s',
    });
    el.textContent = '✦ NIVEL SUPERADO ✦';
    document.body.appendChild(el);
    requestAnimationFrame(() => requestAnimationFrame(() => {
      el.style.opacity = '0';
      el.style.top     = '28%';
    }));
    setTimeout(() => el.remove(), 1200);
  }

  // ── Destruir ──────────────────────────────────────────────────────────────

  destroy() {
    for (const m of this._meshes) {
      this.scene.remove(m);
      m.geometry?.dispose();
      m.material?.dispose();
    }
    for (const a of this._arrows) {
      this.scene.remove(a.mesh);
    }
    this._meshes    = [];
    this._arrows    = [];
    this._platforms = [];
    this._trapZones = [];
  }
}
