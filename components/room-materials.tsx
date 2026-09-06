'use client';
import { createContext, useContext, useEffect, useMemo } from 'react';
import type { ReactNode } from 'react';
import * as THREE from 'three';

type Surface = 'walnut' | 'oak' | 'plaster' | 'cloth' | 'paper';
type Palette = Record<Surface, THREE.DataTexture>;
const Materials = createContext<Palette | null>(null);
function texture(kind: Surface) {
  const size = 64;
  const pixels = new Uint8Array(size * size * 4);
  const base = { walnut: [106, 70, 44], oak: [164, 117, 68], plaster: [214, 205, 183], cloth: [216, 202, 174], paper: [232, 219, 185] }[kind];
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
    const noise = ((x * 73 + y * 151 + x * y * 11) % 31) / 31 - .5;
    const grain = Math.sin((x + Math.sin(y * .14) * 1.6) * 1.3);
    const value = kind === 'walnut' || kind === 'oak' ? grain * 12 + noise * 9 : kind === 'cloth' ? ((x % 2) - (y % 2)) * 7 + noise * 6 : noise * 9;
    const offset = (y * size + x) * 4;
    for (let channel = 0; channel < 3; channel++) pixels[offset + channel] = Math.max(0, Math.min(255, base[channel] + value));
    pixels[offset + 3] = 255;
  }
  const result = new THREE.DataTexture(pixels, size, size, THREE.RGBAFormat);
  result.colorSpace = THREE.SRGBColorSpace;
  result.magFilter = THREE.NearestFilter;
  result.minFilter = THREE.LinearMipmapLinearFilter;
  result.generateMipmaps = true;
  result.wrapS = result.wrapT = THREE.RepeatWrapping;
  result.anisotropy = 4;
  result.needsUpdate = true;
  return result;
}
export function PixelMaterials({ children }: { children: ReactNode }) {
  const maps = useMemo(() => Object.fromEntries(['walnut', 'oak', 'plaster', 'cloth', 'paper'].map((kind) => [kind, texture(kind as Surface)])) as Palette, []);
  useEffect(() => () => Object.values(maps).forEach((map) => map.dispose()), [maps]);
  return <Materials.Provider value={maps}>{children}</Materials.Provider>;
}
export function usePixelMaterials() {
  const maps = useContext(Materials);
  if (!maps) throw new Error('Room materials provider is missing');
  return maps;
}
