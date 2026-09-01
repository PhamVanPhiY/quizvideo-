// Vercel Edge Function: High-Speed TTS Audio Stream Proxy (Zero Lag)
export const config = {
  runtime: 'edge',
};

export default async function handler(request: Request) {
  const url = new URL(request.url);
  const text = url.searchParams.get('text') || '';
  const lang = url.searchParams.get('lang') || 'en';

  if (!text.trim()) {
    return new Response(JSON.stringify({ error: 'Text parameter is required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Clean markdown symbols, quotes, and brackets for flawless pronunciation
  const cleanText = text
    .replace(/[*_#`~[\](){}"]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  try {
    const targetUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(cleanText)}&tl=${lang || 'en'}&client=tw-ob`;
    const res = await fetch(targetUrl, {
      headers: {
        'Referer': 'https://translate.google.com/',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
    });

    if (!res.ok) {
      return new Response(JSON.stringify({ error: 'Failed to fetch TTS audio' }), {
        status: 502,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const audioData = await res.arrayBuffer();

    return new Response(audioData, {
      status: 200,
      headers: {
        'Content-Type': 'audio/mpeg',
        'Cache-Control': 'public, max-age=31536000, s-maxage=31536000, immutable',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
      },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
