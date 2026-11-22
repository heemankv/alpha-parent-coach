import { answer } from '../local-server.js';

export const maxDuration = 60;

export async function POST(request) {
  let body;
  try {
    const text = await request.text();
    if (text.length > 20000) return Response.json({ error: 'Request too large' }, { status: 413 });
    body = JSON.parse(text);
  } catch {
    return Response.json({ error: 'Invalid JSON request.' }, { status: 400 });
  }
  const { status, payload } = await answer(body, request.headers.get('x-vercel-ip-country'));
  return Response.json(payload, { status, headers: { 'Cache-Control': 'no-store' } });
}
