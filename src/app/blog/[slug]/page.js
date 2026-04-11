export async function generateMetadata({ params }) {
  const { slug } = await params;
  
  const title = `Desvetllant: ${slug.replace(/-/g, ' ')}`;
  const description = "Lectura sobre l'univers i com els fenòmens espacials afecten la nostra pròpia galàxia.";
  const imageUrl = "https://images.unsplash.com/photo-1444703686981-a3abbc4d4fe3?w=1200&q=80";

  return {
    title: `${title} | Més enllà d'Orió`,
    description: description,
    openGraph: {
      title: title,
      description: description,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: `Imatge: ${title}`,
        },
      ],
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title: title,
      description: description,
      images: [imageUrl],
    },
  };
}

export default async function BlogPost({ params }) {
  const { slug } = await params;

  const title = `Explicació: ${slug.replace(/-/g, ' ')}`;
  const content = "El contingut de l'article estaria aquí. Els usuaris des del dashboard pujarien fotos i explicació, que es guardaria a Firebase i es renderitzaria directament en aquest component amb Server-Side-Rendering per l'SEO correcte i que Google l'indexi ràpidament.";
  const imageUrl = "https://images.unsplash.com/photo-1444703686981-a3abbc4d4fe3?w=1200&q=80";

  return (
    <article style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem 1rem' }}>
      <div style={{ marginBottom: '3rem', borderRadius: '24px', overflow: 'hidden', boxShadow: '0 15px 30px -5px rgba(0,0,0,0.1)' }}>
        <img src={imageUrl} alt={title} style={{ width: '100%', maxHeight: '450px', objectFit: 'cover', display: 'block' }} />
      </div>
      <h1 style={{ fontSize: '3.5rem', fontWeight: 800, color: 'var(--primary-dark)', marginBottom: '1.5rem', lineHeight: 1.1, letterSpacing: '-0.02em' }}>
        {title}
      </h1>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: 'rgba(0,0,0,0.6)', marginBottom: '3rem', paddingBottom: '2.5rem', borderBottom: '1px solid var(--gray-200)', fontSize: '1.1rem' }}>
         <span style={{ fontWeight: 600, color: 'var(--primary-blue)' }}>Per Més enllà d&apos;Orió</span>
         <span>&bull;</span>
         <span>Abril 2026</span>
      </div>
      <div style={{ fontSize: '1.25rem', lineHeight: 1.8, color: 'rgba(0,0,0,0.85)' }}>
        <p>{content}</p>
        <p style={{ marginTop: '2rem', padding: '1.5rem', background: 'var(--accent)', borderRadius: '12px', borderLeft: '4px solid var(--primary-blue)' }}>Aquesta pàgina ja genera dinàmicament totes les metadades ('generateMetadata' a Next.js) de forma que quan es comparteix a qualsevol Xarxa Social (Twitter/X, Facebook, WhatsApp o LinkedIn), surt automàticament aquesta fotografia gegant, el títol del post i una petita explicació sota gràcies a l'etiqueta *OpenGraph* (og:image / twitter:card).</p>
      </div>
    </article>
  );
}
