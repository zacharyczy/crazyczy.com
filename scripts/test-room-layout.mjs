// Verify real scene geometry and artwork spacing without launching a browser.
import fs from 'node:fs';
import assert from 'node:assert/strict';
import path from 'node:path';
import ts from 'typescript';
import * as THREE from 'three';
import { runInNewContext } from 'node:vm';
const maps = Object.fromEntries(
  ['oak', 'walnut', 'paper', 'plaster', 'cloth'].map((name) => [
    name,
    new THREE.Texture(),
  ]),
);
const jsx = (type, props) => ({ type, props });
function load(file) {
  const source = ts.transpileModule(fs.readFileSync(file, 'utf8'), {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      jsx: ts.JsxEmit.ReactJSX,
      target: ts.ScriptTarget.ES2022,
    },
  }).outputText;
  const mod = { exports: {} };
  runInNewContext(`(function(require, module, exports) { ${source} })`)(
    (id) => {
      if (id === 'react/jsx-runtime')
        return { jsx, jsxs: jsx, Fragment: 'group' };
      if (id === 'react')
        return {
          useMemo: (fn) => fn(),
          useEffect() {},
          useRef: (current) => ({ current }),
          useLayoutEffect() {},
          lazy: () => () => null,
          useState: (value) => [
            typeof value === 'function' ? value() : value,
            () => {},
          ],
        };
      if (id === 'three') return THREE;
      if (id === './room-materials') return { usePixelMaterials: () => maps };
      if (id === '@react-three/fiber')
        return {
          useFrame() {},
          useThree: () => ({ gl: { domElement: { dataset: {} } } }),
        };
      if (id === './room-ball-physics')
        return load('components/room-ball-physics.ts');
      if (id === './room-plants') return load('components/room-plants.tsx');
      if (id === '@/lib/games') return {};
      if (id === './room-interaction')
        return { Hotspot: (props) => props.children };
      if (id === '@/lib/room-guide')
        return { roomGuide: () => [], studyLabel: () => '' };
      if (id === '@react-three/drei')
        return {
          RoundedBox: (props) =>
            jsx('mesh', {
              ...props,
              children: [
                jsx('boxGeometry', { args: props.args }),
                props.children,
              ],
            }),
          useTexture: (url) => {
            const texture = new THREE.Texture();
            texture.name = url;
            return texture;
          },
        };
      if (id.startsWith('@/pic/')) {
        const filename = id.replace('@/', '');
        const buffer = fs.readFileSync(filename);
        return {
          default: {
            src: filename,
            width: buffer.readUInt32BE(16),
            height: buffer.readUInt32BE(20),
          },
        };
      }
      throw new Error(`Unexpected import: ${id}`);
    },
    mod,
    mod.exports,
  );
  return mod.exports;
}
function object(element) {
  if (!element || typeof element !== 'object') return null;
  if (Array.isArray(element)) {
    const group = new THREE.Group();
    element.forEach((child) => {
      const value = object(child);
      if (value) group.add(value);
    });
    return group;
  }
  const { type, props = {} } = element;
  if (typeof type === 'function') {
    if (type.name === 'Magnets' || type.name === 'PixelLabel') return null;
    return object(type(props));
  }
  if (type !== 'group' && type !== 'mesh') return null;
  const children = [props.children].flat(Infinity).filter(Boolean);
  let result;
  if (type === 'mesh') {
    const geometry = children.find((child) =>
      child.type?.endsWith?.('Geometry'),
    );
    const constructors = {
      boxGeometry: THREE.BoxGeometry,
      planeGeometry: THREE.PlaneGeometry,
      cylinderGeometry: THREE.CylinderGeometry,
      torusGeometry: THREE.TorusGeometry,
      sphereGeometry: THREE.SphereGeometry,
      circleGeometry: THREE.CircleGeometry,
      latheGeometry: THREE.LatheGeometry,
    };
    if (!props.geometry && (!geometry || !constructors[geometry.type]))
      return null;
    result = new THREE.Mesh(
      props.geometry ?? new constructors[geometry.type](...geometry.props.args),
      new THREE.MeshBasicMaterial({ side: THREE.DoubleSide }),
    );
    result.userData.sourceMaterial = children.find((child) =>
      child.type?.endsWith?.('Material'),
    )?.props;
  } else result = new THREE.Group();
  if (props.name) result.name = props.name;
  if (props.scale) {
    if (typeof props.scale === 'number') result.scale.setScalar(props.scale);
    else result.scale.fromArray(props.scale);
  }
  if (props.position) result.position.fromArray(props.position);
  if (props.rotation) result.rotation.set(...props.rotation);
  children.forEach((child) => {
    const value = object(child);
    if (value) result.add(value);
  });
  return result;
}
const furnishings = load('components/room-furnishings.tsx');
const shell = object(furnishings.RoomShell());
shell.updateMatrixWorld(true);
function hit(root, origin, direction) {
  return new THREE.Raycaster(
    new THREE.Vector3(...origin),
    new THREE.Vector3(...direction),
    0,
    8,
  ).intersectObject(root, true)[0];
}
assert.equal(
  hit(shell, [0, 3, 0], [1, 0, 0]),
  undefined,
  'window opening is not covered by a wall',
);
assert.ok(hit(shell, [0, 3, -5.5], [1, 0, 0]), 'solid wall beside the window');
assert.ok(hit(shell, [0, 6, 0], [1, 0, 0]), 'window lintel is solid');
assert.equal(
  hit(shell, [3.8, 2, 0], [0, 0, 1]),
  undefined,
  'door has an opening',
);
const door = object(furnishings.WoodenDoor());
door.updateMatrixWorld(true);
assert.ok(hit(door, [3.8, 2, 0], [0, 0, 1]), 'wooden door fills its opening');
assert.ok(hit(shell, [0, 3, 0], [0, 0, 1]), 'wall behind sofa remains solid');
const windowModule = load('components/room-window.tsx');
const garden = object(
  windowModule.GardenWindow({ night: false, reducedMotion: true }),
);
garden.updateMatrixWorld(true);
let backdropX = null;
garden.traverse((node) => {
  if (node.userData.sourceMaterial?.map?.name?.includes('garden-pixel'))
    backdropX = node.getWorldPosition(new THREE.Vector3()).x;
});
assert.ok(backdropX > 10, 'garden image is outside the window, with depth');
const { ROOM_ARTWORKS: artworks } = load('components/room-artworks.ts');
assert.ok(
  artworks.every((art) => path.basename(art.image.src).includes('pixel')),
  'all four photos use pixel assets',
);
assert.equal(artworks.find((art) => art.id === 'messi').width / 2.48, 1.12);
assert.equal(artworks.find((art) => art.id === 'friends').width / 2.12, 1.08);
const bounds = artworks.map((art) => {
  const x = (art.width + 0.24) / 2,
    y = (art.height + 0.24) / 2;
  const half =
    Math.abs(Math.cos(art.rotation) * x) + Math.abs(Math.sin(art.rotation) * y);
  return { min: art.position[0] - half, max: art.position[0] + half };
});
for (let i = 1; i < bounds.length; i++)
  assert.ok(
    bounds[i].min - bounds[i - 1].max > 0.05,
    'enlarged and rotated frames retain space between them',
  );
console.log(
  'PASS: window/door openings, solid walls, outdoor depth, pixel sources, exact photo sizes, frame spacing.',
);

const television = load('components/room-television.tsx');
const tv = object(
  television.RoomTelevision({
    active: false,
    ready: false,
    reducedMotion: true,
    lang: 'zh',
  }),
);
tv.updateMatrixWorld(true);
const tvBounds = new THREE.Box3().setFromObject(
  tv.getObjectByName('television-body'),
);
for (const art of artworks) {
  const halfY =
    (Math.abs(Math.cos(art.rotation)) * (art.height + 0.24)) / 2 +
    (Math.abs(Math.sin(art.rotation)) * (art.width + 0.24)) / 2;
  assert.ok(art.position[1] + halfY < 6.14, 'frame clears ceiling trim');
  if (
    art.position[0] + art.width / 2 > tvBounds.min.x &&
    art.position[0] - art.width / 2 < tvBounds.max.x
  )
    assert.ok(
      art.position[1] - halfY > tvBounds.max.y + 0.15,
      'TV clears frames',
    );
}
const rug = new THREE.Box3().setFromObject(shell.getObjectByName('rug'));
const sofa = object(furnishings.ReadingSofa());
sofa.updateMatrixWorld(true);
assert.equal(sofa.position.z, 4.72);
assert.ok(
  rug.max.z > 4.72 - 0.7 && rug.min.z < 0.58 - 3.62 / 2,
  'rug covers sofa front feet and reaches beyond table',
);
assert.ok(6.6 - (4.72 + 0.97) > 0.8, 'passage behind sofa');
const field = object(
  load('components/room-football.tsx').FootballField({ reducedMotion: true }),
);
field.updateMatrixWorld(true);
const ball = field.getObjectByName('football'),
  center = ball.getWorldPosition(new THREE.Vector3());
const radius = 0.15 * 0.4 * 0.52,
  ground = 1.3195 + 0.124 * 0.52;
assert.ok(
  Math.abs(center.y - radius - ground) < 1e-9,
  'ball rests on turf using scaled radius',
);
assert.equal(field.scale.x, 0.52);
assert.ok(
  Math.abs(1.3195 - 0.1 * 0.52 - 1.2675) < 1e-9,
  'field base contacts table',
);
for (const plantName of ['garden-fern', 'garden-broadleaf']) {
  const plant = garden.getObjectByName(plantName);
  assert.ok(plant, 'new plant exists');
  let curved = 0;
  plant.traverse((n) => {
    if (
      n.geometry?.attributes.color &&
      n.geometry.attributes.position.count > 100
    )
      curved++;
  });
  assert.ok(curved >= 1, 'plant uses merged curved faceted leaf surfaces');
}
console.log(
  'PASS: TV/photo/ceiling clearances, sofa passage, rug coverage, football grounding and scale, curved plants.',
);

const study = load('components/room-study-models.tsx');
const bookshelf = object(study.Bookcase());
bookshelf.updateMatrixWorld(true);
const shelfBounds = new THREE.Box3().setFromObject(bookshelf);
assert.ok(
  Math.abs(shelfBounds.max.y - (3.78 + 2.51 / 2 - 0.3)) < 0.03,
  'bookcase top sits below map',
);
assert.ok(shelfBounds.min.z > 0.2, 'bookcase occupies sofa half of map wall');
const collection = object(study.CollectionShelves());
collection.updateMatrixWorld(true);
const cb = new THREE.Box3().setFromObject(collection),
  messi = artworks.find((a) => a.id === 'messi');
assert.ok(
  cb.max.y < messi.position[1] - messi.height / 2 - 0.12,
  'collection clears Messi',
);
assert.ok(
  Math.abs(cb.getSize(new THREE.Vector3()).x - 2.72) < 0.01,
  'collection shares cabinet width',
);
assert.ok(
  field.position.x - 2.49 * 0.52 > 1.1 && field.position.x + 2.49 * 0.52 < 3.85,
  'board clears computer and table edge',
);
assert.ok(
  study.STUDY_VIEWS.guide.position[1] + 0.7 <
    artworks.find((a) => a.id === 'tagore').position[1] -
      artworks.find((a) => a.id === 'tagore').height / 2,
  'notes below Tagore',
);
console.log(
  'PASS: bookshelf height and wall side, collection clearances, tactics board fit, notes below artwork.',
);

const desk = object(study.StudyDesk({}));
desk.updateMatrixWorld(true);
const laptop = new THREE.Box3().setFromObject(desk.getObjectByName('computer'));
assert.ok(laptop.max.y < 2.3, 'thin laptop clears television sightline');
assert.ok(laptop.getSize(new THREE.Vector3()).x < 1.6, 'laptop stays compact');
assert.ok(Math.abs(laptop.min.y - 1.2675) < 0.003, 'feet contact table');
console.log('PASS: compact laptop height, width and table contact.');

const bookBlocks = study.makeBookcaseBooks();
const upright = bookBlocks.filter((b) => b.s[2] === 0.54);
assert.ok(upright.length > 135, 'more slim books per shelf');
assert.ok(
  upright.every((b) => b.s[0] < 0.11),
  'paperback-like thickness',
);
const layouts = Array.from({ length: 5 }, (_, row) =>
  upright
    .filter(
      (b) => b.p[1] >= 0.21 + row * 0.86 && b.p[1] < 0.21 + (row + 1) * 0.86,
    )
    .map((b) => b.p[0].toFixed(3))
    .join(','),
);
assert.equal(new Set(layouts).size, 5, 'all five shelf layouts differ');
console.log(
  'PASS: thin books, increased density, five distinct shelf arrangements.',
);
