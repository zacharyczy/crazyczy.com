'use client';
import { createContext, useContext } from 'react';
import type { ReactNode } from 'react';
export const InteractionContext = createContext({
  enabled: false,
  reducedMotion: false,
  setTip: (_tip: string) => {},
});
export function Hotspot({
  label,
  onActivate,
  children,
}: {
  label: string;
  onActivate: () => void;
  children: ReactNode;
}) {
  const { enabled, setTip } = useContext(InteractionContext);
  return (
    <group
      userData={{
        roomAction: enabled ? onActivate : undefined,
        roomLabel: label,
      }}
      onPointerOver={(e) => {
        if (enabled && !document.pointerLockElement) {
          e.stopPropagation();
          setTip(label);
        }
      }}
      onPointerOut={() => setTip('')}
      onClick={(e) => {
        e.stopPropagation();
        if (
          enabled &&
          !document.pointerLockElement &&
          e.delta <= 5 &&
          performance.now() >
            Number(
              e.nativeEvent.target instanceof HTMLElement
                ? (e.nativeEvent.target.dataset.dragUntil ?? 0)
                : 0,
            )
        ) {
          setTip('');
          onActivate();
        }
      }}
    >
      {children}
    </group>
  );
}
