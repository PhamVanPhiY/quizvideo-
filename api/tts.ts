// Vercel Serverless Function: High Quality TTS Audio Proxy
import type { IncomingMessage, ServerResponse } from 'http';

interface ExtendedRequest extends IncomingMessage {
  query?: Record<string, string>;
}

export default async function handler(req: ExtendedRequest, res: ServerResponse) {
  // Parse query params
  const url = new URL(req.url || '', `http://${req.headers.host || 'localhost'}`);
  const text = url.searchParams.get('text') || '';
  const lang = url.searchParams.get('lang') || 'en';

  if (!text.trim()) {
    res.statusCode = 400;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'Text parameter is required' }));
    return;
  }

  try {
    const targetUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(text.trim())}&tl=${lang}&client=tw-ob`;
    const response = await fetch(targetUrl, {
      headers: {
        'Referer': 'https://translate.google.com/',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
    });

    if (!response.ok) {
      res.statusCode = 502;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: 'Failed to fetch TTS audio stream' }));
      return;
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    res.statusCode = 200;
    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Content-Length', buffer.length.toString());
    res.setHeader('Cache-Control', 'public, max-age=31536000, s-maxage=31536000, immutable');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.end(buffer);
  } catch (err) {
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: (err as Error).message }));
  }
}
