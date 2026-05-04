
/**
 * player.js — Cápsula jugador + lógica de movimiento
 * Ashes of the Reborn | Valiant Gaming
 *
 * Depende de Three.js (global o importado antes).
 * Recibe el input del joystick y meve l cápsula en el mundo.
 */

import * as THREE from 'three';

// ─── Constantes ─────────────────────────────────────────────────────────────

const MOVE_SPEED   = 5.0;   // unidades/seg
const TURN_SPEED   = 8.0;   // rad/seg (giro suave)
const CAPSULE_H    = 1.8;   // altura total de la cápsula
const CAPSULE_R    = 0.35;  // radio
const GROUND_Y     = 0.0;   // nivel del suelo

// ─── Player ──────────────────────────────────────────────────────────────────

export class Player {
  /**
   * @param {THREE.Scene} scene
   */
  constructor(scene) {
    this.scene    = scene;
    this.velocity = new THREE.Vector3();

    // Dirección de cara actual (en radianes, sobre eje Y)
    this.facingAngle = 0;

    // Vector de movimiento world-space (calculado cada frame)
    this._moveDir = new THREE.Vector3();

    // Mesh raíz — el "actor" que mueve la cámara
    this.root = new THREE.Group();
    this.root.position.set(0, GROUND_Y, 0);
    scene.add(this.root);

    // ── Geometría placeholder ──────────────────────────────────────────────
    this._buildMesh();

    // ── Marcador de dirección (flecha pequeña) ─────────────────────────────
    this._buildDirectionArrow();
  }

  // ─── Construcción visual ─────────────────────────────────────────────────

  _buildMesh() {
    const mat = new THREE.MeshStandardMaterial({
      color:     0xc8a87a,
      roughness: 0.6,
      metalness: 0.1,
    });

    // Cuerpo (cilindro)
    const bodyGeo = new THREE.CylinderGeometry(
      CAPSULE_R, CAPSULE_R,
      CAPSULE_H - CAPSULE_R * 2,
      16
    );
    const body = new THREE.Mesh(bodyGeo, mat);
    body.position.y = CAPSULE_H * 0.5;
    body.castShadow = true;
    this.root.add(body);

    // Cabeza (esfera superior)
    const headGeo = new THREE.SphereGeometry(CAPSULE_R, 16, 12);
    const head    = new THREE.Mesh(headGeo, mat);
    head.position.y = CAPSULE_H - CAPSULE_R;
    head.castShadow = true;
    this.root.add(head);

    // Pie (esfera inferior)
    const footGeo = new THREE.SphereGeometry(CAPSULE_R, 16, 12);
    const foot    = new THREE.Mesh(footGeo, mat);
    foot.position.y = CAPSULE_R;
    foot.castShadow = true;
    this.root.add(foot);

    // Referencia al mesh principal para animaciones futuras
    this.bodyMesh = body;
    this.headMesh = head;
  }

  _buildDirectionArrow() {
    // Cono pequeño apuntando hacia donde mira el jugador
    const geo = new THREE.ConeGeometry(0.12, 0.35, 8);
    const mat = new THREE.MeshStandardMaterial({
      color:     0xff9900,
      roughness: 0.4,
      emissive:  0xff6600,
      emissiveIntensity: 0.3,
    });
    this.arrow = new THREE.Mesh(geo, mat);
    // El cono apunta en +Y por defecto; lo giramos para que apunte en +Z
    this.arrow.rotation.x = Math.PI * 0.5;
    this.arrow.position.set(0, 0.8, CAPSULE_R + 0.18);
    this.root.add(this.arrow);
  }

  // ─── Update ──────────────────────────────────────────────────────────────

  /**
   * Llamado cada frame desde loop.js
   * @param {number} delta         — segundos desde el último frame
   * @param {{ dx: number, dy: number }} joystickInput — input normalizado
   * @param {THREE.Camera} camera  — para transformar el input a espacio mundo
   */
  update(delta, joystickInput, camera) {
    const { dx, dy } = joystickInput;
    const moving = Math.abs(dx) > 0.01 || Math.abs(dy) > 0.01;

    if (moving) {
      // ── Convertir input de pantalla a espacio mundo ──────────────────────
      // Tomamos la dirección "hacia adelante" de la cámara, ignorando Y
      const camFwd = new THREE.Vector3();
      camera.getWorldDirection(camFwd);
      camFwd.y = 0;
      camFwd.normalize();

      const camRight = new THREE.Vector3();
      camRight.crossVectors(camFwd, new THREE.Vector3(0, 1, 0)).normalize();

      // dx joystick → movimiento lateral (derecha = +dx)
      // dy joystick → movimiento profundidad (arriba en joystick = -dy en canvas = avanzar)
      this._moveDir.set(0, 0, 0);
      this._moveDir.addScaledVector(camRight, dx);
      this._moveDir.addScaledVector(camFwd,  -dy);  // -dy: arriba en joystick = adelante

      const len = this._moveDir.length();
      if (len > 0.001) {
        this._moveDir.divideScalar(len); // normalizar

        // ── Mover posición ───────────────────────────────────────────────
        const speed = MOVE_SPEED * Math.min(len, 1);
        this.root.position.addScaledVector(this._moveDir, speed * delta);
        this.root.position.y = GROUND_Y; // mantener en el suelo

        // ── Rotar suavemente hacia la dirección de movimiento ────────────
        const targetAngle = Math.atan2(this._moveDir.x, this._moveDir.z);
        // Interpolación angular
        let diff = targetAngle - this.facingAngle;
        // Normalizar a [-π, π]
        while (diff >  Math.PI) diff -= Math.PI * 2;
        while (diff < -Math.PI) diff += Math.PI * 2;
        this.facingAngle += diff * Math.min(TURN_SPEED * delta, 1);
        this.root.rotation.y = this.facingAngle;
      }
    }

    // Animación sutil de idle: pequeño bob vertical
    const t = performance.now() * 0.001;
    this.bodyMesh.position.y = CAPSULE_H * 0.5 + Math.sin(t * 1.8) * 0.012;
  }

  // ─── API ─────────────────────────────────────────────────────────────────

  /** Posición world del jugador (el pie) */
  get position() {
    return this.root.position;
  }

  /** Punto de interés para la cámara (a la altura del pecho) */
  get chestPosition() {
    return this.root.position.clone().add(new THREE.Vector3(0, CAPSULE_H * 0.65, 0));
  }

  destroy() {
    this.scene.remove(this.root);
  }
}
