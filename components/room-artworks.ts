import messi from '@/pic/梅西-pixel.png';
import jay from '@/pic/Jay-pixel.png';
import friends from '@/pic/老友记五人-pixel.png';
import tagore from '@/pic/tagore-stray-birds-pixel.png';

export const ROOM_ARTWORKS = [
  { id: 'messi', title: 'Lionel Messi', image: messi, width: 2.48 * 1.12, position: [-4.22, 4.87, -6.32] as [number, number, number], rotation: -.025 },
  { id: 'jay', title: 'Jay Chou', image: jay, width: 1.46, position: [-1.7, 5.2, -6.32] as [number, number, number], rotation: .035 },
  { id: 'friends', title: 'Friends', image: friends, width: 2.12 * 1.08, position: [.56, 4.25, -6.32] as [number, number, number], rotation: -.02 },
  { id: 'tagore', title: 'Rabindranath Tagore · Stray Birds', image: tagore, width: 3.18, position: [3.77, 4.78, -6.32] as [number, number, number], rotation: .012 },
].map((art) => ({ ...art, height: art.width * art.image.height / art.image.width }));
export type RoomArtwork = typeof ROOM_ARTWORKS[number];
