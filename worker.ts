import handler from 'vinext/server/fetch-handler';
import { visitorLocation } from './lib/visitor-location';
import { parseSitePath } from './lib/routes';

const worker = {
  async fetch(request: Request, env: unknown, ctx: ExecutionContext) {
    const url = new URL(request.url);
    // Read the original edge request, before framework Request reconstruction.
    if (url.pathname.replace(/\/$/, '') === '/api/visitor-location') {
      if (request.method !== 'GET' && request.method !== 'HEAD')
        return new Response(null, {
          status: 405,
          headers: { Allow: 'GET, HEAD' },
        });
      const cf = (request as Request & { cf?: Record<string, unknown> }).cf;
      return new Response(
        request.method === 'HEAD'
          ? null
          : JSON.stringify({
              location: ['localhost', '127.0.0.1', '[::1]'].includes(
                url.hostname,
              )
                ? null
                : visitorLocation(cf),
            }),
        {
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'private, no-store',
            'CDN-Cache-Control': 'no-store',
          },
        },
      );
    }
    const headers = new Headers(request.headers);
    headers.set('x-site-language', parseSitePath(url.pathname).lang);
    return handler.fetch(new Request(request, { headers }), env, ctx);
  },
};

export default worker;
