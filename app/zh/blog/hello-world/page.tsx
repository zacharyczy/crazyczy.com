import { permanentRedirect } from 'next/navigation';
export default function Page() {
  permanentRedirect('/blog/hello-world/zh/');
}
