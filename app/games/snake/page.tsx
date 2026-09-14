import { languageAlternates } from '@/lib/routes';
import type { Metadata } from 'next';
import { GamePage } from '@/components/game-page';
import { SnakeGame } from '@/components/snake-game';
export const metadata: Metadata = {
  title: 'Snake',
  description: 'A pixel Snake game for keyboard and touch.',
  alternates: languageAlternates('en', 'games/snake'),
};
export default function Page() {
  return (
    <GamePage
      lang="en"
      slug="snake"
      title="Snake"
      description="Eat pixels, avoid the walls and yourself. Use arrows, WASD, swipe, or the on-screen controls."
    >
      <SnakeGame lang="en" />
    </GamePage>
  );
}
