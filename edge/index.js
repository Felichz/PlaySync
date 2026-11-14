// Front door of this project at its medanolabs.com address. Everything (pages, API calls, streamed
// responses and, where the app uses one, its WebSocket) is forwarded as it comes to the server that
// actually runs the app. The server's address is the ORIGIN secret, so no repo carries it:
//   npx wrangler secret put ORIGIN -c edge/wrangler.jsonc
export default {
  async fetch(request, env) {
    if (!env.ORIGIN) return new Response('Origin not configured', { status: 503 });

    const incoming = new URL(request.url);
    const origin = new URL(env.ORIGIN);
    const target = new URL(incoming.pathname + incoming.search, origin);

    const upstream = await fetch(new Request(target, request), { redirect: 'manual' });

    // An origin redirect that names itself is rewritten to this address, so a visitor never leaves it.
    const location = upstream.headers.get('location');
    if (location && location.startsWith(origin.origin)) {
      const headers = new Headers(upstream.headers);
      headers.set('location', incoming.origin + location.slice(origin.origin.length));
      return new Response(upstream.body, { status: upstream.status, statusText: upstream.statusText, headers });
    }
    return upstream;
  },
};
