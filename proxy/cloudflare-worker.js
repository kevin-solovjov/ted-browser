const TED_API_ORIGIN = 'https://api.ted.europa.eu';

function corsHeaders(origin) {
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Accept',
    'Access-Control-Max-Age': '86400',
  };
}

export default {
  async fetch(request, env) {
    const allowedOrigin = env.ALLOWED_ORIGIN || 'https://kevin-solovjov.github.io';
    const requestUrl = new URL(request.url);
    const cors = corsHeaders(allowedOrigin);

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: cors });
    }

    if (!requestUrl.pathname.startsWith('/api/ted/')) {
      return new Response('Not found', { status: 404, headers: cors });
    }

    const upstreamPath = requestUrl.pathname.replace(/^\/api\/ted/, '');
    const upstreamUrl = new URL(upstreamPath + requestUrl.search, TED_API_ORIGIN);
    const upstreamHeaders = new Headers(request.headers);
    upstreamHeaders.delete('Host');
    upstreamHeaders.delete('Origin');

    const upstreamResponse = await fetch(upstreamUrl, {
      method: request.method,
      headers: upstreamHeaders,
      body: request.method === 'GET' || request.method === 'HEAD' ? undefined : request.body,
      redirect: 'follow',
    });

    const responseHeaders = new Headers(upstreamResponse.headers);
    for (const [key, value] of Object.entries(cors)) {
      responseHeaders.set(key, value);
    }

    return new Response(upstreamResponse.body, {
      status: upstreamResponse.status,
      statusText: upstreamResponse.statusText,
      headers: responseHeaders,
    });
  },
};
