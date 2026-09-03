import Link from 'next/link';
export default function NotFound() {
  return <main className="grid min-h-screen place-items-center px-6"><div className="text-center"><p className="font-mono text-xs uppercase tracking-[.2em] text-cyan-300">Error / 404</p><h1 className="mt-5 text-7xl font-semibold tracking-[-.08em] text-white">Lost signal.</h1><p className="mt-5 text-slate-500">这个页面不存在 · This page does not exist.</p><Link href="/zh/" className="primary-pill mt-9">返回首页 / Go home</Link></div></main>;
}
