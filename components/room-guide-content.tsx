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
          ? '随时点击电视右侧墙上的便签，即可再次查看这份指南。先熟悉下面的操作，再开始探索吧。'
          : 'You can read this guide again anytime: click the sticky notes on the wall to the right of the TV. Here is how to explore the room.'}
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
