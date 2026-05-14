import { NextResponse } from 'next/server';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get('url');

  if (!url) {
    return NextResponse.json({ error: 'URL is required' }, { status: 400 });
  }

  try {
    // Intentem fer el fetch amb un User-Agent de navegador real per evitar bloquejos bàsics
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'es-ES,es;q=0.9,ca;q=0.8,en;q=0.7',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
      },
      redirect: 'follow'
    });

    if (!response.ok) {
      throw new Error(`Amazon returned ${response.status}`);
    }

    const html = await response.text();

    // Funció per decodificar entitats HTML bàsiques
    const decode = (str) => str.replace(/&#(\d+);/g, (match, dec) => String.fromCharCode(dec)).replace(/&quot;/g, '"').replace(/&amp;/g, '&');

    // Títol
    const titleMatch = html.match(/<span id="productTitle"[^>]*>([^<]+)<\/span>/i) || html.match(/<title>([^<]+)<\/title>/i);
    let title = titleMatch ? decode(titleMatch[1].trim()) : '';

    // Imatge
    const imageMatch = html.match(/id="landingImage"[^>]*src="([^"]+)"/i) || html.match(/["']large["']\s*:\s*["']([^"']+)["']/i);
    const image = imageMatch ? imageMatch[1] : '';

    // Preu (Intentem diversos selectors comuns)
    const priceSelectors = [
      /<span class="a-offscreen">([^<]+)<\/span>/i,
      /<span class="a-price-whole">([^<]+)<\/span>/i,
      /id="priceblock_ourprice"[^>]*>([^<]+)</i,
      /id="kindle-price"[^>]*>([^<]+)</i
    ];
    
    let price = '';
    for (const selector of priceSelectors) {
      const match = html.match(selector);
      if (match) {
        price = match[1].trim();
        // Si hem agafat el "whole", mirem si hi ha fracció
        if (selector.source.includes('a-price-whole')) {
          const fraction = html.match(/<span class="a-price-fraction">([^<]+)<\/span>/i);
          const symbol = html.match(/<span class="a-price-symbol">([^<]+)<\/span>/i);
          if (fraction) price += ',' + fraction[1].trim();
          if (symbol) price += symbol[1].trim();
        }
        break;
      }
    }

    return NextResponse.json({
      title: title.replace('Amazon.es: ', '').split(' : Amazon.es')[0],
      image,
      price,
      url: response.url
    });
  } catch (error) {
    console.error('Amazon scrape error:', error);
    return NextResponse.json({ error: 'Failed to fetch Amazon data' }, { status: 500 });
  }
}
