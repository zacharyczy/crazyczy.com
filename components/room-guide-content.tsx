import type { Language } from '@/lib/content';
import { roomGuide } from '@/lib/room-guide';
export function RoomGuideContent({ lang }: { lang: Language }) {
  return (
    <>
      <h1>
        {lang === 'zh'
          ? 'README · 房间使用指南'
          : 'README · Make yourself at home'}
      </h1>
      <p className="guide-reopen">
        {lang === 'zh'
          ? '随时点击操作栏的手册图标，或电视右侧墙上的便签，都能查看这份指南。操作栏可展开或收起。'
          : 'Read this guide anytime using the manual icon in the dock, or the sticky notes to the right of the TV. Expand or collapse the dock whenever you like.'}
      </p>
      <div className="guide-grid">
        {roomGuide(lang).map((n) => (
          <article key={n.id}>
            <h2>{n.title}</h2>
            <p>{n.text}</p>
          </article>
        ))}
      </div>
    </>
  );
}
