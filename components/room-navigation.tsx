'use client';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import type { RefObject } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { STANDING, CROUCHING, walkStep, turnAngles } from './room-physics';
export type RoomView = {
  id?: string;
  position: [number, number, number];
  width: number;
  height: number;
  eye?: [number, number, number];
  normal?: [number, number, number];
  padding?: number;
};
export type ViewMode = 'pointer' | 'drag';
export type MoveInput = { x: number; y: number; z: number };
type Pose = {
  position: THREE.Vector3;
  quaternion: THREE.Quaternion;
  fov: number;
};
type Props = {
  lifted: boolean;
  mode: ViewMode;
  resetId: number;
  paused: boolean;
  reducedMotion: boolean;
  movement: RefObject<MoveInput>;
  clearMovement: () => void;
  views?: RoomView[];
  inputLocked?: boolean;
  onSettled?: (id: string | null) => void;
  crouching: boolean;
  onLockChange: (locked: boolean) => void;
  onLockFailure: () => void;
  onTip: (tip: string) => void;
};
const HOME = new THREE.Vector3(5.35, STANDING, 6.05);
const MIN = new THREE.Vector3(-6.12, 0.24, -6.1),
  MAX = new THREE.Vector3(6.12, 6.1, 6.3);
export function RoomNavigation({
  lifted,
  mode,
  resetId,
  paused,
  reducedMotion,
  movement,
  clearMovement,
  views = [],
  inputLocked = false,
  onSettled,
  crouching,
  onLockChange,
  onLockFailure,
  onTip,
}: Props) {
  const { camera, gl, scene, size } = useThree();
  const keys = useRef(new Set<string>()),
    saved = useRef<Pose[]>([]),
    previous = useRef<string[]>([]);
  const tween = useRef<{
      from: Pose;
      to: Pose;
      t: number;
      intro?: boolean;
    } | null>(null),
    started = useRef(false);
  const action = useRef<(() => void) | undefined>(undefined),
    lastTip = useRef('');
  const scratch = useMemo(
    () => ({
      direction: new THREE.Vector3(),
      right: new THREE.Vector3(),
      euler: new THREE.Euler(0, 0, 0, 'YXZ'),
      ray: new THREE.Raycaster(),
      center: new THREE.Vector2(),
      dummy: new THREE.PerspectiveCamera(),
    }),
    [],
  );
  const current = useCallback(
    () => ({
      position: camera.position.clone(),
      quaternion: camera.quaternion.clone(),
      fov: (camera as THREE.PerspectiveCamera).fov,
    }),
    [camera],
  );
  useEffect(() => {
    if (!lifted) return;
    scratch.dummy.position.copy(HOME);
    scratch.dummy.lookAt(-0.25, 2.9, -3.8);
    const destination = {
      position: HOME.clone(),
      quaternion: scratch.dummy.quaternion.clone(),
      fov: 49,
    };
    saved.current = [];
    previous.current = [];
    tween.current = { from: current(), to: destination, t: 0, intro: true };
    started.current = true;
    keys.current.clear();
    clearMovement();
  }, [resetId, lifted, camera, clearMovement, current, scratch]);
  useEffect(() => {
    if (!lifted) return;
    const old = previous.current;
    const ids = views.map((v) => v.id ?? 'object');
    let common = 0;
    while (
      common < old.length &&
      common < ids.length &&
      old[common] === ids[common]
    )
      common++;
    let destination: Pose | undefined;
    if (common < old.length) {
      destination = saved.current[common];
      saved.current.length = common;
    }
    for (let i = common; i < views.length; i++) {
      saved.current.push(destination ?? tween.current?.to ?? current());
      destination = undefined;
    }
    const active = views.at(-1);
    if (active) {
      const target = new THREE.Vector3(...active.position),
        normal = new THREE.Vector3(...(active.normal ?? [0, 0, 1])).normalize();
      const h =
        Math.max(
          active.height + 0.15,
          (active.width + 0.15) / (size.width / Math.max(1, size.height)),
        ) * (active.padding ?? 1.18);
      const distance = h / (2 * Math.tan(THREE.MathUtils.degToRad(49 / 2)));
      const eye = active.eye
        ? new THREE.Vector3(...active.eye)
        : target.clone().addScaledVector(normal, distance);
      eye.clamp(MIN, MAX);
      scratch.dummy.position.copy(eye);
      scratch.dummy.up.set(0, 1, 0);
      scratch.dummy.lookAt(target);
      const fov = active.eye
        ? 49
        : Math.max(
            49,
            Math.min(
              105,
              THREE.MathUtils.radToDeg(
                2 * Math.atan(h / (2 * eye.distanceTo(target))),
              ),
            ),
          );
      destination = {
        position: eye,
        quaternion: scratch.dummy.quaternion.clone(),
        fov,
      };
    }
    previous.current = ids;
    if (destination) tween.current = { from: current(), to: destination, t: 0 };
    keys.current.clear();
    clearMovement();
  }, [
    views,
    size.width,
    size.height,
    lifted,
    camera,
    clearMovement,
    scratch,
    current,
  ]);
  useEffect(() => {
    const canvas = gl.domElement;
    Object.assign(canvas, { tabIndex: 0 });
    const blocked = () => !lifted || paused || inputLocked || !!tween.current;
    const clear = () => {
      keys.current.clear();
      clearMovement();
      pointers.clear();
    };
    const pointers = new Map<
      number,
      { x: number; y: number; startX: number; startY: number }
    >();
    let pinch = 0;
    const rotate = (dx: number, dy: number, drag: boolean) => {
      scratch.euler.setFromQuaternion(camera.quaternion, 'YXZ');
      const a = turnAngles(scratch.euler.y, scratch.euler.x, dx, dy, drag);
      scratch.euler.set(a.pitch, a.yaw, 0, 'YXZ');
      camera.quaternion.setFromEuler(scratch.euler);
    };
    const move = (distance: number) => {
      camera.getWorldDirection(scratch.direction);
      scratch.direction.setY(0);
      scratch.direction.normalize();
      const p = walkStep(
        camera.position.x,
        camera.position.z,
        scratch.direction.x * distance,
        scratch.direction.z * distance,
      );
      camera.position.set(p.x, camera.position.y, p.z);
    };
    const down = (e: KeyboardEvent) => {
      if (
        blocked() ||
        e.ctrlKey ||
        e.metaKey ||
        e.altKey ||
        (e.target as HTMLElement)?.closest(
          'input,textarea,select,button,a,[contenteditable=true]',
        )
      )
        return;
      if (
        [
          'KeyW',
          'KeyA',
          'KeyS',
          'KeyD',
          'ArrowUp',
          'ArrowDown',
          'ArrowLeft',
          'ArrowRight',
          'ShiftLeft',
          'ShiftRight',
        ].includes(e.code)
      ) {
        e.preventDefault();
        keys.current.add(e.code);
      }
      if (
        e.code === 'KeyE' &&
        !e.repeat &&
        document.pointerLockElement === canvas
      )
        action.current?.();
    };
    const up = (e: KeyboardEvent) => keys.current.delete(e.code);
    const lock = () => {
      if (mode !== 'pointer' || blocked() || document.pointerLockElement)
        return;
      try {
        const result = canvas.requestPointerLock();
        result?.catch(onLockFailure);
      } catch {
        onLockFailure();
      }
    };
    const start = (e: PointerEvent) => {
      if (blocked() || e.button !== 0) return;
      canvas.focus({ preventScroll: true });
      if (mode === 'pointer' && e.pointerType === 'mouse') {
        if (document.pointerLockElement === canvas) action.current?.();
        else lock();
        return;
      }
      canvas.setPointerCapture(e.pointerId);
      pointers.set(e.pointerId, {
        x: e.clientX,
        y: e.clientY,
        startX: e.clientX,
        startY: e.clientY,
      });
      if (pointers.size === 2) {
        const a = [...pointers.values()];
        pinch = Math.hypot(a[0].x - a[1].x, a[0].y - a[1].y);
      }
    };
    const look = (e: PointerEvent) => {
      if (blocked()) return;
      if (document.pointerLockElement === canvas) {
        rotate(e.movementX, e.movementY, false);
        return;
      }
      const p = pointers.get(e.pointerId);
      if (!p) return;
      const dx = e.clientX - p.x,
        dy = e.clientY - p.y;
      p.x = e.clientX;
      p.y = e.clientY;
      if (Math.hypot(p.x - p.startX, p.y - p.startY) > 5)
        Object.assign(canvas.dataset, {
          dragUntil: String(performance.now() + 400),
        });
      if (pointers.size === 2) {
        const a = [...pointers.values()],
          next = Math.hypot(a[0].x - a[1].x, a[0].y - a[1].y);
        move((next - pinch) * 0.012);
        pinch = next;
      } else rotate(dx, dy, true);
    };
    const end = (e: PointerEvent) => {
      pointers.delete(e.pointerId);
      pinch = 0;
    };
    const wheel = (e: WheelEvent) => {
      if (blocked()) return;
      e.preventDefault();
      move(-Math.max(-120, Math.min(120, e.deltaY)) * 0.005);
    };
    const changed = () => {
      const locked = document.pointerLockElement === canvas;
      onLockChange(locked);
      if (locked) canvas.focus({ preventScroll: true });
      else clear();
    };
    const blur = () => {
      clear();
      if (document.pointerLockElement === canvas) document.exitPointerLock();
    };
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    window.addEventListener('blur', blur);
    document.addEventListener('visibilitychange', blur);
    document.addEventListener('pointerlockchange', changed);
    document.addEventListener('pointerlockerror', onLockFailure);
    canvas.addEventListener('pointerdown', start);
    canvas.addEventListener('pointermove', look);
    canvas.addEventListener('pointerup', end);
    canvas.addEventListener('pointercancel', end);
    canvas.addEventListener('lostpointercapture', end);
    canvas.addEventListener('wheel', wheel, { passive: false });
    if (paused || inputLocked || mode === 'drag') blur();
    return () => {
      clear();
      window.removeEventListener('keydown', down);
      window.removeEventListener('keyup', up);
      window.removeEventListener('blur', blur);
      document.removeEventListener('visibilitychange', blur);
      document.removeEventListener('pointerlockchange', changed);
      document.removeEventListener('pointerlockerror', onLockFailure);
      canvas.removeEventListener('pointerdown', start);
      canvas.removeEventListener('pointermove', look);
      canvas.removeEventListener('pointerup', end);
      canvas.removeEventListener('pointercancel', end);
      canvas.removeEventListener('lostpointercapture', end);
      canvas.removeEventListener('wheel', wheel);
    };
  }, [
    camera,
    gl,
    lifted,
    mode,
    paused,
    inputLocked,
    clearMovement,
    onLockChange,
    onLockFailure,
    scratch,
  ]);
  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.04);
    if (!lifted || !started.current || paused) return;
    if (tween.current) {
      const t = tween.current;
      t.t = reducedMotion ? 1 : Math.min(1, t.t + dt / (t.intro ? 1.18 : 0.8));
      const e = t.intro ? 1 - Math.pow(1 - t.t, 3) : t.t * t.t * (3 - 2 * t.t);
      camera.position.lerpVectors(t.from.position, t.to.position, e);
      camera.quaternion.slerpQuaternions(t.from.quaternion, t.to.quaternion, e);
      const c = camera as THREE.PerspectiveCamera;
      Object.assign(c, { fov: THREE.MathUtils.lerp(t.from.fov, t.to.fov, e) });
      c.updateProjectionMatrix();
      if (process.env.NODE_ENV === 'development')
        Object.assign(gl.domElement.dataset, {
          transition: JSON.stringify({
            progress: t.t,
            intro: !!t.intro,
            x: c.position.x,
            y: c.position.y,
            z: c.position.z,
          }),
        });
      if (t.t === 1) {
        tween.current = null;
        onSettled?.(views.at(-1)?.id ?? null);
      }
      return;
    }
    if (!inputLocked) {
      camera.position.setY(
        reducedMotion
          ? crouching
            ? CROUCHING
            : STANDING
          : THREE.MathUtils.damp(
              camera.position.y,
              crouching ? CROUCHING : STANDING,
              14,
              dt,
            ),
      );
      const k = keys.current,
        forward =
          Number(k.has('KeyW') || k.has('ArrowUp')) -
          Number(k.has('KeyS') || k.has('ArrowDown')) +
          movement.current.z,
        right =
          Number(k.has('KeyD') || k.has('ArrowRight')) -
          Number(k.has('KeyA') || k.has('ArrowLeft')) +
          movement.current.x;
      camera.getWorldDirection(scratch.direction);
      scratch.direction.setY(0);
      scratch.direction.normalize();
      scratch.right.crossVectors(scratch.direction, camera.up).normalize();
      scratch.direction
        .multiplyScalar(forward)
        .addScaledVector(scratch.right, right);
      if (scratch.direction.lengthSq() > 1) scratch.direction.normalize();
      const speed = k.has('ShiftLeft') || k.has('ShiftRight') ? 4.2 : 2.4;
      const p = walkStep(
        camera.position.x,
        camera.position.z,
        scratch.direction.x * dt * speed,
        scratch.direction.z * dt * speed,
      );
      camera.position.set(p.x, camera.position.y, p.z);
    }
    if (document.pointerLockElement === gl.domElement && !inputLocked) {
      scratch.ray.setFromCamera(scratch.center, camera);
      const hits = scratch.ray.intersectObjects(scene.children, true);
      action.current = undefined;
      let tip = '';
      for (const hit of hits) {
        let node: THREE.Object3D | null = hit.object;
        if (node.userData.ignoreRoomRay) continue;
        while (node) {
          if (node.userData.roomAction) {
            action.current = node.userData.roomAction;
            tip = node.userData.roomLabel;
            break;
          }
          node = node.parent;
        }
        break;
      }
      if (tip !== lastTip.current) {
        lastTip.current = tip;
        onTip(tip);
      }
    }
    const c = camera as THREE.PerspectiveCamera;
    if (process.env.NODE_ENV === 'development')
      Object.assign(gl.domElement.dataset, {
        pose: JSON.stringify({
          x: camera.position.x,
          y: camera.position.y,
          z: camera.position.z,
          yaw: new THREE.Euler().setFromQuaternion(camera.quaternion, 'YXZ').y,
          pitch: new THREE.Euler().setFromQuaternion(camera.quaternion, 'YXZ')
            .x,
          fov: c.fov,
          view: views.at(-1)?.id ?? null,
          calls: gl.info.render.calls,
          triangles: gl.info.render.triangles,
        }),
      });
  });
  return null;
}
