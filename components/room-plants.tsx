'use client';
import { useEffect, useMemo } from 'react';
import * as THREE from 'three';
import { usePixelMaterials } from './room-materials';

type Point = [number, number, number];
function combine(parts: THREE.BufferGeometry[]) {
  const merged = new THREE.BufferGeometry();
  for (const name of Object.keys(parts[0].attributes)) {
    const count = parts.reduce((sum, part) => sum + part.getAttribute(name).array.length, 0);
    const values = new Float32Array(count); let offset = 0;
    for(const part of parts) { const valuesPart = part.getAttribute(name); values.set(valuesPart.array, offset); offset += valuesPart.array.length; }
    merged.setAttribute(name, new THREE.BufferAttribute(values, parts[0].getAttribute(name).itemSize));
  }
  parts.forEach(part => part.dispose()); return merged;
}
// Curved, lightly faceted surfaces retain a pixel texture without cuboid leaves.
function leaf(start: THREE.Vector3, end: THREE.Vector3, width: number, bend: number) {
  const vertices: number[] = [], uvs: number[] = [], colors: number[] = [];
  const axis = end.clone().sub(start), side = new THREE.Vector3(axis.z, 0, -axis.x).normalize();
  if (side.lengthSq() < .1) side.set(1, 0, 0);
  const point = (t: number, across: number) => start.clone().addScaledVector(axis, t)
    .addScaledVector(side, Math.sin(Math.PI * t) ** .8 * width * across)
    .add(new THREE.Vector3(0, Math.sin(Math.PI * t) * bend - Math.abs(across) * Math.sin(Math.PI * t) * width * .18, 0));
  for (let row = 0; row < 12; row++) for (let col = 0; col < 4; col++) {
    for (const [r, c] of [[row,col],[row+1,col],[row,col+1],[row,col+1],[row+1,col],[row+1,col+1]]) {
      vertices.push(...point(r / 12, c / 2 - 1).toArray()); uvs.push(c / 4, r / 12);
      const color = new THREE.Color((row + col) % 3 === 0 ? '#68984c' : col < 2 ? '#3b7147' : '#518548'); colors.push(...color.toArray());
    }
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
  geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3)); geometry.computeVertexNormals();
  return { geometry, point };
}
function Pot({ fern }: { fern: boolean }) {
  const maps = usePixelMaterials();
  const profile = useMemo(() => [.0,.04,.1,.46,.5,.56].map((y,i) => new THREE.Vector2([.25,.29,.29,.38,.4,.4][i],y)), []);
  return <group>
    <mesh castShadow receiveShadow><latheGeometry args={[profile, 24]} /><meshStandardMaterial map={maps.plaster} color={fern ? '#abaf87' : '#cb7957'} roughness={.93} side={THREE.DoubleSide} /></mesh>
    <mesh position={[0,.54,0]} rotation={[Math.PI / 2,0,0]} castShadow><torusGeometry args={[.384,.035,6,32]} /><meshStandardMaterial map={maps.plaster} color={fern ? '#a1a980' : '#d69368'} /></mesh>
    <mesh position={[0,.502,0]} rotation={[-Math.PI / 2,0,0]} receiveShadow><circleGeometry args={[.35,24]} /><meshStandardMaterial map={maps.walnut} color="#433325" roughness={1} /></mesh>
    <mesh position={[0,.024,0]}><cylinderGeometry args={[.35,.33,.045,24]} /><meshStandardMaterial map={maps.plaster} color={fern ? '#8c9975' : '#b76d4b'} /></mesh>
    {Array.from({length:17},(_,i)=><mesh key={i} position={[Math.sin(i*2.4)*(.08+i%4*.06),.512,Math.cos(i*2.4)*(.08+i%4*.06)]}><boxGeometry args={[.022,.018,.028]} /><meshStandardMaterial color={i%2 ? '#75654a' : '#312d21'} /></mesh>)}
  </group>;
}
export function GardenPlant({ position, fern = false }: { position: Point; fern?: boolean }) {
  const maps = usePixelMaterials();
  const parts = useMemo(() => {
    const leaves: THREE.BufferGeometry[] = [], stems: THREE.TubeGeometry[] = [], veins: number[] = [];
    const add = (start: THREE.Vector3, end: THREE.Vector3, width: number, bend: number, detail: boolean) => {
      const shape = leaf(start,end,width,bend); leaves.push(shape.geometry);
      for(let i=0;i<12;i++) veins.push(...shape.point(i/12,0).add(new THREE.Vector3(0,.005,0)).toArray(),...shape.point((i+1)/12,0).add(new THREE.Vector3(0,.005,0)).toArray());
      if(detail) for(let i=2;i<10;i+=2) for(const side of [-1,1]) veins.push(...shape.point(i/12,0).add(new THREE.Vector3(0,.006,0)).toArray(),...shape.point((i+1)/12,.85*side).add(new THREE.Vector3(0,.006,0)).toArray());
    };
    for(let i=0;i<(fern ? 11 : 9);i++) {
      const angle=i*2.399, reach=fern ? .95+(i%3)*.15 : .62+(i%3)*.18;
      const end=new THREE.Vector3(Math.cos(angle)*reach,fern ? .95+i%3*.17 : 1.25+(i%4)*.36,Math.sin(angle)*reach);
      const base=new THREE.Vector3(Math.cos(angle)*.07,.5,Math.sin(angle)*.07);
      const middle=base.clone().lerp(end,.52).add(new THREE.Vector3(0,fern ? .62 : .4,0));
      const curve=new THREE.QuadraticBezierCurve3(base,middle,end);
      stems.push(new THREE.TubeGeometry(curve,16,fern ? .008 : .013,5,false));
      if(fern) {
        const side=new THREE.Vector3(-Math.sin(angle),0,Math.cos(angle));
        for(let k=3;k<16;k++) {
          const t=k/17, root=curve.getPoint(t), span=Math.sin(t*Math.PI)*.34;
          for(const sign of [-1,1]) add(root,root.clone().addScaledVector(side,span*sign).add(new THREE.Vector3(Math.cos(angle)*.14,-.05,Math.sin(angle)*.14)),.046*(1-t*.6),.035,false);
        }
      } else {
        const tip=end.clone().add(new THREE.Vector3(Math.cos(angle)*.62,-.25,Math.sin(angle)*.62));
        add(curve.getPoint(.72),tip,.21+(i%3)*.04,.23,true);
      }
    }
    const veinGeometry=new THREE.BufferGeometry(); veinGeometry.setAttribute('position',new THREE.Float32BufferAttribute(veins,3));
    const leafGeometry = combine(leaves);
    const stemGeometry = combine(stems.map(g => g.toNonIndexed())); stems.forEach(g => g.dispose());
    return {leafGeometry,stemGeometry,veinGeometry};
  },[fern]);
  useEffect(()=>()=>{ parts.leafGeometry.dispose();parts.stemGeometry.dispose();parts.veinGeometry.dispose(); },[parts]);
  return <group name={fern ? 'garden-fern' : 'garden-broadleaf'} position={position}>
    <Pot fern={fern} />
    <mesh geometry={parts.stemGeometry} castShadow><meshStandardMaterial color="#66864b" roughness={.9} /></mesh>
    <mesh geometry={parts.leafGeometry} castShadow receiveShadow><meshStandardMaterial map={maps.plaster} vertexColors side={THREE.DoubleSide} roughness={.82} /></mesh>
    <lineSegments geometry={parts.veinGeometry}><lineBasicMaterial color="#a9b875" transparent opacity={.45} /></lineSegments>
  </group>;
}
