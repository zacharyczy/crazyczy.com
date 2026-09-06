'use client';

import { useCallback, useEffect, useMemo, useRef } from 'react';
import type { RefObject } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import * as THREE from 'three';
export type RoomView = { id?: string; position: [number, number, number]; width: number; height: number; eye?: [number, number, number]; padding?: number };

export type ViewMode = 'orbit' | 'fly';
export type MoveInput = { x: number; y: number; z: number };

type NavigationProps = {
  lifted: boolean;
  mode: ViewMode;
  resetId: number;
  paused: boolean;
  reducedMotion: boolean;
  movement: RefObject<MoveInput>;
  clearMovement: () => void;
  focus?: RoomView | null;
  views?: RoomView[];
  inputLocked?: boolean;
  onSettled?: (id: string | null) => void;
};

const HOME = new THREE.Vector3(0, 2.7, 4.35);
const TARGET = new THREE.Vector3(.2, 2.7, -2.5);
// A camera-sized margin keeps the near plane inside the physical walls.
const ROOM_MIN = new THREE.Vector3(-6.12, .24, -6.1);
const ROOM_MAX = new THREE.Vector3(6.12, 6.1, 6.3);
const TARGET_MIN = new THREE.Vector3(-6.38, .08, -6.4);
const TARGET_MAX = new THREE.Vector3(6.38, 6.38, 6.55);
type SavedView = { position: THREE.Vector3; target: THREE.Vector3; fov: number };
type CameraTween = { from: SavedView; to: SavedView; elapsed: number };
const MOVE_KEYS = new Set(['KeyW', 'KeyA', 'KeyS', 'KeyD', 'KeyQ', 'KeyE', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ShiftLeft', 'ShiftRight']);

export function RoomNavigation({ lifted, mode, resetId, paused, reducedMotion, movement, clearMovement, focus, views, inputLocked = false, onSettled }: NavigationProps) {
  const { camera, gl, size } = useThree();
  const controls = useRef<OrbitControlsImpl>(null);
  const savedViews = useRef<SavedView[]>([]);
  const previousPath = useRef<string[]>([]);
  const path = useMemo(() => views ?? (focus ? [focus] : []), [views, focus]);
  const tween = useRef<CameraTween | null>(null);
  const keys = useRef(new Set<string>());
  const transition = useRef({ started: false, elapsed: 0, from: new THREE.Vector3(), target: new THREE.Vector3() });
  const previousMode = useRef(mode);
  const scratch = useMemo(() => ({ direction: new THREE.Vector3(), right: new THREE.Vector3(), move: new THREE.Vector3(), euler: new THREE.Euler(0, 0, 0, 'YXZ') }), []);

  useEffect(() => {
    if (!resetId || !controls.current) return;
    savedViews.current = [];
    previousPath.current = [];
    tween.current = null;
    camera.position.copy(HOME);
    if (camera instanceof THREE.PerspectiveCamera) { Object.assign(camera, { fov: 49 }); camera.updateProjectionMatrix(); }
    camera.up.set(0, 1, 0);
    controls.current.target.copy(TARGET);
    camera.lookAt(TARGET);
    controls.current.update();
    transition.current.elapsed = 2;
    keys.current.clear();
    clearMovement();
  }, [camera, resetId, clearMovement]);

  useEffect(() => {
    if (mode === previousMode.current) return;
    if (mode === 'orbit' && controls.current) {
      camera.getWorldDirection(scratch.direction);
      controls.current.target.copy(camera.position).addScaledVector(scratch.direction, 4);
      controls.current.update();
    }
    previousMode.current = mode;
  }, [camera, mode, scratch]);

  const containCamera = useCallback(() => {
    camera.position.clamp(ROOM_MIN, ROOM_MAX);
    if (controls.current) {
      controls.current.target.clamp(TARGET_MIN, TARGET_MAX);
      if (mode === 'orbit') camera.lookAt(controls.current.target);
    }
  }, [camera, mode]);

  useEffect(() => {
    const orbit = controls.current;
    if (!orbit || !(camera instanceof THREE.PerspectiveCamera)) return;
    const current = () => ({ position: camera.position.clone(), target: orbit.target.clone(), fov: camera.fov });
    const oldDepth = previousPath.current.length;
    const active = path.at(-1);
    let destination: SavedView | undefined;
    if (path.length < oldDepth) {
      destination = savedViews.current[path.length];
      savedViews.current.length = path.length;
    } else if (path.length > oldDepth) {
      // Keep a separate return pose for each nested interaction (seat → TV).
      savedViews.current.push(tween.current?.to ?? current());
    }
    if (active && !destination) {
      const target = new THREE.Vector3(...active.position).add(new THREE.Vector3(0, 0, active.eye ? 0 : .001));
      if (active.eye) destination = { position: new THREE.Vector3(...active.eye).clamp(ROOM_MIN, ROOM_MAX), target, fov: 49 };
      else {
        const aspect = size.width / Math.max(1, size.height);
        const padding = active.id === 'television' && aspect < .8 ? 1.04 : (active.padding ?? 1.35);
        const framedHeight = Math.max(active.height + .15, (active.width + .15) / aspect) * padding;
        const maximumDistance = ROOM_MAX.z - target.z;
        const distance = Math.min(maximumDistance, framedHeight / (2 * Math.tan(THREE.MathUtils.degToRad(49 / 2))));
        const fov = Math.max(49, THREE.MathUtils.radToDeg(2 * Math.atan(framedHeight / (2 * distance))));
        destination = { position: target.clone().add(new THREE.Vector3(0, 0, distance)).clamp(ROOM_MIN, ROOM_MAX), target, fov };
      }
    }
    previousPath.current = path.map(item => item.id ?? 'artwork');
    if (!destination) return;
    tween.current = { from: current(), to: destination, elapsed: 0 };
    transition.current.started = true;
    transition.current.elapsed = 2;
    keys.current.clear(); clearMovement();
  }, [path, camera, size.width, size.height, clearMovement]);

  useEffect(() => {
    const canvas = gl.domElement;
    if (!lifted || mode !== 'fly' || paused || inputLocked) {
      keys.current.clear();
      clearMovement();
      return;
    }
    const clear = () => {
      keys.current.clear();
      clearMovement();
    };
    const down = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target?.closest('input, textarea, select, [contenteditable="true"]') || event.ctrlKey || event.metaKey || event.altKey) return;
      if (MOVE_KEYS.has(event.code)) {
        event.preventDefault();
        keys.current.add(event.code);
      }
    };
    const up = (event: KeyboardEvent) => { keys.current.delete(event.code); };
    let pointer: { id: number; x: number; y: number } | null = null;
    const start = (event: PointerEvent) => {
      if (pointer || event.button !== 0) return;
      pointer = { id: event.pointerId, x: event.clientX, y: event.clientY };
      canvas.setPointerCapture(event.pointerId);
    };
    const look = (event: PointerEvent) => {
      if (!pointer || pointer.id !== event.pointerId) return;
      const dx = event.clientX - pointer.x;
      const dy = event.clientY - pointer.y;
      pointer.x = event.clientX;
      pointer.y = event.clientY;
      scratch.euler.setFromQuaternion(camera.quaternion, 'YXZ');
      scratch.euler.set(THREE.MathUtils.clamp(scratch.euler.x - dy * .003, -Math.PI / 2 + .015, Math.PI / 2 - .015), scratch.euler.y - dx * .003, 0, 'YXZ');
      camera.quaternion.setFromEuler(scratch.euler);
    };
    const end = () => { pointer = null; };
    const resetInput = () => { clear(); end(); };
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    window.addEventListener('blur', resetInput);
    document.addEventListener('visibilitychange', resetInput);
    canvas.addEventListener('pointerdown', start);
    canvas.addEventListener('pointermove', look);
    canvas.addEventListener('pointerup', end);
    canvas.addEventListener('pointercancel', end);
    canvas.addEventListener('lostpointercapture', end);
    return () => {
      resetInput();
      window.removeEventListener('keydown', down);
      window.removeEventListener('keyup', up);
      window.removeEventListener('blur', resetInput);
      document.removeEventListener('visibilitychange', resetInput);
      canvas.removeEventListener('pointerdown', start);
      canvas.removeEventListener('pointermove', look);
      canvas.removeEventListener('pointerup', end);
      canvas.removeEventListener('pointercancel', end);
      canvas.removeEventListener('lostpointercapture', end);
    };
  }, [camera, gl, lifted, mode, paused, inputLocked, clearMovement, scratch]);

  useFrame((_, delta) => {
    const orbit = controls.current;
    if (!orbit) return;
    orbit.enabled = lifted && mode === 'orbit' && !paused && !inputLocked;
    if (!lifted) return;
    containCamera();
    if (paused) return;
    const move = tween.current;
    if (move) {
      orbit.enabled = false;
      move.elapsed = reducedMotion ? 1 : Math.min(1, move.elapsed + Math.min(delta, .05) / 1.05);
      const ease = move.elapsed * move.elapsed * (3 - 2 * move.elapsed);
      camera.position.lerpVectors(move.from.position, move.to.position, ease);
      orbit.target.lerpVectors(move.from.target, move.to.target, ease);
      if (camera instanceof THREE.PerspectiveCamera) {
        Object.assign(camera, { fov: THREE.MathUtils.lerp(move.from.fov, move.to.fov, ease) });
        camera.updateProjectionMatrix();
      }
      camera.lookAt(orbit.target);
      orbit.update();
      containCamera();
      if (move.elapsed >= 1) { tween.current = null; onSettled?.(path.at(-1)?.id ?? null); }
      return;
    }
    if (inputLocked) return;
    const intro = transition.current;
    if (!intro.started) {
      intro.started = true;
      intro.from.copy(camera.position);
      intro.target.copy(orbit.target);
    }
    if (intro.elapsed < 1.18) {
      orbit.enabled = false;
      intro.elapsed = reducedMotion ? 1.18 : intro.elapsed + Math.min(delta, .05);
      const ease = 1 - Math.pow(1 - Math.min(intro.elapsed / 1.18, 1), 3);
      camera.position.lerpVectors(intro.from, HOME, ease);
      orbit.target.lerpVectors(intro.target, TARGET, ease);
      camera.lookAt(orbit.target);
      orbit.update();
      return;
    }
    if (mode !== 'fly' || paused || inputLocked) return;
    const pressed = (a: string, b?: string) => Number(keys.current.has(a) || !!(b && keys.current.has(b)));
    const input = movement.current;
    const forward = pressed('KeyW', 'ArrowUp') - pressed('KeyS', 'ArrowDown') + input.z;
    const right = pressed('KeyD', 'ArrowRight') - pressed('KeyA', 'ArrowLeft') + input.x;
    const vertical = pressed('KeyE') - pressed('KeyQ') + input.y;
    camera.getWorldDirection(scratch.direction);
    scratch.right.crossVectors(scratch.direction, camera.up).normalize();
    scratch.move.copy(scratch.direction).multiplyScalar(forward).addScaledVector(scratch.right, right);
    scratch.move.setY(scratch.move.y + vertical);
    if (scratch.move.lengthSq() > 1) scratch.move.normalize();
    const speed = keys.current.has('ShiftLeft') || keys.current.has('ShiftRight') ? 6 : 3;
    camera.position.addScaledVector(scratch.move, Math.min(delta, .05) * speed);
    containCamera();
  });

  return <OrbitControls
    ref={controls} domElement={gl.domElement} onChange={containCamera} makeDefault target={[.35, 1.22, .18]}
    enabled={lifted && mode === 'orbit' && !paused && !inputLocked}
    enableRotate enableZoom enablePan enableDamping dampingFactor={.075}
    rotateSpeed={.6} zoomSpeed={1.15} panSpeed={.85}
    screenSpacePanning minDistance={.15} maxDistance={16}
    minPolarAngle={.015} maxPolarAngle={Math.PI - .015}
    touches={{ ONE: THREE.TOUCH.ROTATE, TWO: THREE.TOUCH.DOLLY_PAN }}
  />;
}
