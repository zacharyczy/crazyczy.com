'use client';
import { canApproachDoor } from './room-physics';
import { useContext, useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { getPosts, type Language } from '@/lib/content';
import { doorLabel } from '@/lib/room-guide';
import { Hotspot, InteractionContext } from './room-interaction';
import { WoodenDoor } from './room-furnishings';
import type { RoomView } from './room-navigation';

export const DOOR_VIEW: RoomView = {
  id: 'door',
  fov: 68,
  position: [3.8, 2.6, 7.5],
  eye: [3.8, 2.4, 3.4],
  width: 2,
  height: 4,
};
export function RoomDoor({
  lang,
  opening,
  onOpen,
  onOpened,
  onNear,
}: {
  lang: Language;
  opening: boolean;
  onOpen: () => void;
  onOpened: () => void;
  onNear: (near: boolean) => void;
}) {
  const { enabled, reducedMotion } = useContext(InteractionContext);
  const near = useRef(false);
  const vectors = useMemo(() => ({ direction: new THREE.Vector3() }), []);
  const preview = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 640;
    canvas.height = 1280;
    const c = canvas.getContext('2d')!;
    c.fillStyle = '#faf6ed';
    c.fillRect(0, 0, 640, 1280);
    c.fillStyle = '#79654d';
    c.font = '20px monospace';
    c.fillText('crazyczy.com', 52, 85);
    c.fillStyle = '#29251e';
    c.font = 'bold 72px Georgia';
    c.fillText(lang === 'zh' ? '写作' : 'Writing', 52, 230);
    c.font = '18px monospace';
    c.fillStyle = '#82705a';
    c.fillText(
      lang === 'zh' ? '文章与项目记录' : 'Notes on code & making',
      52,
      278,
    );
    getPosts(lang)
      .slice(0, 4)
      .forEach((post, index) => {
        const y = 380 + index * 205;
        c.fillStyle = '#d8cdbb';
        c.fillRect(52, y - 30, 536, 2);
        c.fillStyle = '#82705a';
        c.font = '17px monospace';
        c.fillText(post.publishDate, 52, y + 5);
        c.fillStyle = '#332e26';
        c.font = '25px Georgia';
        const words =
          lang === 'zh'
            ? Array.from(
                new Intl.Segmenter('zh', { granularity: 'grapheme' }).segment(
                  post.title,
                ),
                (item) => item.segment,
              )
            : post.title.split(' ');
        let line = '',
          row = 0;
        for (const word of words) {
          const next = line + (line && lang === 'en' ? ' ' : '') + word;
          if (c.measureText(next).width > 528 && line) {
            c.fillText(line, 52, y + 52 + row++ * 35);
            line = word;
          } else line = next;
        }
        c.fillText(line, 52, y + 52 + row * 35);
      });
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.magFilter = THREE.NearestFilter;
    return texture;
  }, [lang]);
  useEffect(() => () => preview.dispose(), [preview]);
  useFrame(({ camera, gl }) => {
    camera.getWorldDirection(vectors.direction);
    const next =
      enabled &&
      canApproachDoor(
        camera.position.x,
        camera.position.z,
        vectors.direction.x,
        vectors.direction.z,
      );
    if (next !== near.current) {
      near.current = next;
      onNear(next);
    }
    if (process.env.NODE_ENV !== 'production')
      gl.domElement.dataset.door = JSON.stringify({ near: next, opening });
  });
  return (
    <>
      <Hotspot
        label={doorLabel(lang)}
        onActivate={() => {
          if (near.current) onOpen();
        }}
      >
        <WoodenDoor
          opening={opening}
          reducedMotion={reducedMotion}
          onOpened={onOpened}
        />
      </Hotspot>
      <mesh
        name="writing-through-door"
        position={[3.8, 2.05, 6.86]}
        rotation={[0, Math.PI, 0]}
      >
        <planeGeometry args={[1.86, 4.06]} />
        <meshBasicMaterial map={preview} toneMapped={false} />
      </mesh>
      {opening && (
        <pointLight
          position={[3.8, 2.8, 6.2]}
          intensity={1.2}
          distance={3}
          color="#ffe6bd"
        />
      )}
    </>
  );
}
