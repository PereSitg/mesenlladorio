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
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept-Language': 'ca-ES,ca;q=0.9,es;q=0.8,en;q=0.7',
      },
      redirect: 'follow'
    });

    const html = await response.text();

    // Extracció molt bàsica mitjançant regex (com que no tenim un parser DOM al servidor Next.js fàcilment)
    const titleMatch = html.match(/<span id="productTitle"[^>]*>([^<]+)<\/span>/i) || html.match(/<title>([^<]+)<\/title>/i);
    const title = titleMatch ? titleMatch[1].trim() : 'Producte Amazon';

    // Imatge (busquem la principal)
    const imageMatch = html.match(/["']large["']\s*:\s*["']([^"']+)["']/i) || html.match(/id="landingImage"[^>]*src="([^"]+)"/i);
    const image = imageMatch ? imageMatch[1] : '';

    // Preu (Amazon té moltes variacions, busquem la més comuna)
    const priceMatch = html.match(/<span class="a-price-whole">([^<]+)<\/span>/i);
    const priceFractionMatch = html.match(/<span class="a-price-fraction">([^<]+)<\/span>/i);
    const symbolMatch = html.match(/<span class="a-price-symbol">([^<]+)<\/span>/i);
    
    let price = '';
    if (priceMatch) {
      price = `${priceMatch[1].trim()}${priceFractionMatch ? ',' + priceFractionMatch[1].trim() : ''}${symbolMatch ? symbolMatch[1].trim() : '€'}`;
    }

    return NextResponse.json({
      title: title.replace('Amazon.es: ', '').split(': ')[0],
      image,
      price,
      url: response.url // La URL final després de redirects
    });
  } catch (error) {
    console.error('Amazon scrape error:', error);
    return NextResponse.json({ error: 'Failed to fetch Amazon data' }, { status: 500 });
  }
}
