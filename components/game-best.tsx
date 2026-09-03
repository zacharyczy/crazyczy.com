'use client';

import { useEffect, useState } from 'react';

export function GameBest({ storageKey, lang }: { storageKey: string; lang: 'zh' | 'en' }) {
  const [best, setBest] = useState(0);
  useEffect(() => {
    const frame = requestAnimationFrame(() => setBest(Number(localStorage.getItem(storageKey) || 0)));
    return () => cancelAnimationFrame(frame);
  }, [storageKey]);
  return <span>{lang === 'zh' ? '本机最高分' : 'Local best'}: {best}</span>;
}
