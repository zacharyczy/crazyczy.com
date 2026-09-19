'use client';
import { LanguageButtons } from './site-language';
import { useEffect, useRef } from 'react';
import type { Language } from '@/lib/content';
import { RoomGuideContent } from './room-guide-content';
export function RoomOnboarding({
  lang,
  onClose,
  onLanguage,
}: {
  lang: Language;
  onClose: () => void;
  onLanguage: (lang: Language) => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = ref.current;
    dialog?.showModal();
    return () => dialog?.close();
  }, []);
  return (
    <dialog
      ref={ref}
      className="room-onboarding"
      aria-label="README"
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
    >
      <button
        className="onboarding-close"
        onClick={onClose}
        aria-label={lang === 'zh' ? '关闭指南' : 'Close guide'}
      >
        ×
      </button>
      <LanguageButtons lang={lang} onChange={onLanguage} />
      <RoomGuideContent lang={lang} />
      <button className="onboarding-start" onClick={onClose}>
        {lang === 'zh' ? '知道了，开始探索' : 'Got it — let’s explore'}
      </button>
    </dialog>
  );
}
