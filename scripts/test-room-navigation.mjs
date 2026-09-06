// Camera/input regression tests with a real Three.js camera and synthetic input events.
// No browser or renderer is needed: node scripts/test-room-navigation.mjs
import fs from 'node:fs';
import assert from 'node:assert/strict';
import ts from 'typescript';
import * as THREE from 'three';
import { runInNewContext } from 'node:vm';
class Surface extends EventTarget {
  closest() { return null; }
  setPointerCapture() {}
}
global.window = new Surface();
global.document = new Surface();
const canvas = new Surface();
const size = { width: 900, height: 600 };
const camera = new THREE.PerspectiveCamera(49, 1.5, .05, 150);
camera.position.set(.35, 6.2, 4.45);
const movement = { current: { x: 0, y: 0, z: 0 } };
const clearMovement = () => { movement.current = { x: 0, y: 0, z: 0 }; };
const orbit = { target: new THREE.Vector3(.35, 1.22, .18), enabled: false, update() { camera.lookAt(this.target); } };
const slots = [];
let index = 0, effects = [], frame, controlProps;
const React = {
  useRef(value) { const i = index++; return slots[i] ||= { current: value }; },
  useMemo(fn, deps) {
    const i = index++; const old = slots[i];
    if (!old || deps.some((value, n) => value !== old.deps[n])) slots[i] = { deps, value: fn() };
    return slots[i].value;
  },
  useCallback(fn, deps) {
    const i = index++;
    const old = slots[i];
    if (!old || deps.some((value, n) => value !== old.deps[n])) slots[i] = { deps, fn };
    return slots[i].fn;
  },
  useEffect(fn, deps) {
    const i = index++;
    const old = slots[i];
    if (!old || deps.some((value, n) => value !== old.deps[n])) {
      effects.push(() => { old?.cleanup?.(); slots[i] = { deps, cleanup: fn() }; });
    }
  },
};
const Orbit = Symbol('Orbit');
const jsx = (type, props) => {
  if (type === Orbit) { props.ref.current = orbit; controlProps = props; orbit.enabled = props.enabled; }
  return null;
};
const source = ts.transpileModule(fs.readFileSync('components/room-navigation.tsx', 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, target: ts.ScriptTarget.ES2022 } }).outputText;
const moduleObject = { exports: {} };
runInNewContext(`(function(require, module, exports) { ${source} })`, { window, document })((id) => {
  if (id === 'react') return React;
  if (id === 'react/jsx-runtime') return { jsx, jsxs: jsx };
  if (id === '@react-three/fiber') return { useThree: () => ({ camera, size, gl: { domElement: canvas } }), useFrame: (fn) => { frame = fn; } };
  if (id === '@react-three/drei') return { OrbitControls: Orbit };
  if (id === 'three') return THREE;
  throw new Error(`Unexpected import: ${id}`);
}, moduleObject, moduleObject.exports);
const props = { lifted: true, mode: 'fly', resetId: 0, paused: false, reducedMotion: false, movement, clearMovement, focus: null };
function render(change = {}) { Object.assign(props, change); index = 0; effects = []; moduleObject.exports.RoomNavigation(props); effects.forEach((fn) => fn()); }
function tick(count = 1, delta = 1 / 60) { for (let i = 0; i < count; i++) frame({}, delta); }
function send(target, type, values = {}) { const event = new Event(type, { cancelable: true }); Object.entries(values).forEach(([key, value]) => Object.defineProperty(event, key, { value })); target.dispatchEvent(event); }
function key(code, down = true) { send(window, down ? 'keydown' : 'keyup', { code }); }
function near(a, b, message, tolerance = 1e-6) { assert.ok(Math.abs(a - b) < tolerance, `${message}: ${a} vs ${b}`); }
render(); tick(90);
near(camera.position.distanceTo(new THREE.Vector3(0, 2.7, 4.35)), 0, 'intro ends at home');
assert.ok(controlProps.minPolarAngle < .02 && controlProps.maxPolarAngle > Math.PI - .02, 'orbit supports nearly full vertical rotation');
const before = camera.position.clone(); key('KeyW'); tick(60); key('KeyW', false);
near(camera.position.distanceTo(before), 3, 'forward travels three units per second');
const diagonal = camera.position.clone(); key('KeyW'); key('KeyD'); tick(60); key('KeyW', false); key('KeyD', false);
near(camera.position.distanceTo(diagonal), 3, 'diagonal input is normalized');
const elevation = camera.position.y; key('KeyE'); tick(30); key('KeyE', false);
near(camera.position.y - elevation, 1.5, 'vertical motion');
const direction = camera.getWorldDirection(new THREE.Vector3());
send(canvas, 'pointerdown', { pointerId: 7, button: 0, clientX: 10, clientY: 10 });
send(canvas, 'pointermove', { pointerId: 7, clientX: 310, clientY: 60 });
send(canvas, 'pointerup');
assert.ok(camera.getWorldDirection(new THREE.Vector3()).distanceTo(direction) > .5, 'drag turns viewpoint');
key('KeyW'); send(window, 'blur'); const stopped = camera.position.clone(); tick(20);
near(camera.position.distanceTo(stopped), 0, 'blur clears stuck keys');
movement.current.z = 1; tick(10); assert.ok(camera.position.distanceTo(stopped) > .1, 'touch movement works');
render({ paused: true }); const paused = camera.position.clone(); key('KeyW'); tick(30);
near(camera.position.distanceTo(paused), 0, 'dialog pauses movement');
assert.equal(movement.current.z, 0, 'dialog clears touch input');
render({ paused: false }); key('KeyW', false);
const facing = camera.getWorldDirection(new THREE.Vector3()); render({ mode: 'orbit' });
near(camera.getWorldDirection(new THREE.Vector3()).distanceTo(facing), 0, 'mode switch preserves facing');
render({ resetId: 1 }); near(camera.position.distanceTo(new THREE.Vector3(0, 2.7, 4.35)), 0, 'reset restores home');
render({ mode: 'fly' }); camera.position.set(0, .21, 0); key('KeyQ'); tick(30); key('KeyQ', false);
near(camera.position.y, .24, 'movement cannot sink through floor');
// Zoom, panning, and flight all stop inside the room, including the ceiling.
render({ mode: 'orbit' });
for (const attempt of [[100, 2, 0], [-100, 2, 0], [0, 100, 0], [0, -100, 0], [0, 2, -100], [0, 2, 100]]) {
  camera.position.set(...attempt); controlProps.onChange();
  assert.ok(camera.position.x >= -6.12 && camera.position.x <= 6.12);
  assert.ok(camera.position.y >= .24 && camera.position.y <= 6.1);
  assert.ok(camera.position.z >= -6.1 && camera.position.z <= 6.3);
}
render({ resetId: 2 });
const original = camera.position.clone();
const originalFacing = camera.getWorldDirection(new THREE.Vector3());
const photo = { position: [3.77, 4.18, -6.32], width: 3.18, height: 3.18 * 1070 / 1470 };
render({ focus: photo }); tick(80);
near(camera.position.x, 3.77, 'focus lines up with photo center');
near(camera.position.y, 4.18, 'focus camera height');
const checkPhoto = () => {
  camera.updateMatrixWorld(true);
  for (const x of [-1, 1]) for (const y of [-1, 1]) {
    const corner = new THREE.Vector3(photo.position[0] + x * photo.width / 2, photo.position[1] + y * photo.height / 2, photo.position[2] + .1).project(camera);
    assert.ok(Math.abs(corner.x) < .9 && Math.abs(corner.y) < .9, 'whole photo fits the viewpoint');
  }
};
checkPhoto();
size.width = 320; size.height = 800; camera.aspect = .4; camera.updateProjectionMatrix();
render(); tick(80); checkPhoto();
assert.ok(camera.position.z <= 6.3, 'portrait framing remains inside wall');
render({ focus: null }); tick(80);
near(camera.position.distanceTo(original), 0, 'closing focus restores previous position');
near(camera.getWorldDirection(new THREE.Vector3()).distanceTo(originalFacing), 0, 'closing focus restores previous facing');
render({ focus: photo }); tick(80); render({ focus: null, resetId: 3 }); tick(80);
near(camera.position.distanceTo(new THREE.Vector3(0, 2.7, 4.35)), 0, 'reset overrides saved photo return');
render({ paused: true });
console.log('PASS: movement, drag, touch, pause, mode handoff, six room boundaries, photo fit on desktop/portrait, return view, reset.');

render({ paused:false, focus:null, views:[], resetId:4, mode:'fly', inputLocked:false });tick(80);
const roomPose=camera.position.clone(),roomDirection=camera.getWorldDirection(new THREE.Vector3());
const seat={id:'seat',position:[.55,1.99,-5.115],eye:[.35,1.92,4.78],width:2.08,height:1.56};
const tv={id:'television',position:[.55,1.99,-5.115],width:2.08,height:1.56,padding:1.18};
render({ views:[seat], mode:'orbit', inputLocked:true });tick(80);
const seatedPose=camera.position.clone(),seatedFacing=camera.getWorldDirection(new THREE.Vector3());
near(seatedPose.distanceTo(new THREE.Vector3(...seat.eye)),0,'natural seat eye position');
render({views:[seat,tv]});tick(80);const tvPose=camera.position.clone();key('KeyW');movement.current.z=1;tick(40);key('KeyW',false);
near(camera.position.distanceTo(tvPose),0,'TV blocks keyboard and touch locomotion');assert.equal(orbit.enabled,false,'TV blocks orbit zoom and drag');
render({views:[seat]});tick(80);near(camera.position.distanceTo(seatedPose),0,'TV exit returns to seat');near(camera.getWorldDirection(new THREE.Vector3()).distanceTo(seatedFacing),0,'TV exit restores seated orientation');
render({views:[],mode:'fly',inputLocked:false});tick(80);near(camera.position.distanceTo(roomPose),0,'standing restores room pose');near(camera.getWorldDirection(new THREE.Vector3()).distanceTo(roomDirection),0,'standing restores room orientation');
render({views:[seat],inputLocked:true,reducedMotion:true});tick();near(camera.position.distanceTo(new THREE.Vector3(...seat.eye)),0,'reduced motion skips camera transition');
console.log('PASS: nested seat/TV return poses, locked game input, reduced motion.');
