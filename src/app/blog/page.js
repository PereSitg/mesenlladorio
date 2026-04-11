import Link from 'next/link';

export const metadata = {
  title: "Blog i Articles | Més enllà d'Orió",
  description: "Llegeix els últims articles i notícies sobre el cosmos i el viatge espacial.",
};

export default async function BlogIndex() {
  const mockPosts = [
    {
      id: "1",
      title: "Els Misteris de la Via Làctia",
      slug: "misteris-via-lactia",
      excerpt: "Un viatge visual a través de la nostra pròpia galàxia: estrelles, pols i forats negres.",
      imageUrl: "https://images.unsplash.com/photo-1444703686981-a3abbc4d4fe3?w=800&q=80",
      date: "10 d'Abril, 2026"
    },
    {
      id: "2",
      title: "Com funciona el James Webb?",
      slug: "com-funciona-james-webb",
      excerpt: "Desglossem la tecnologia que ens ha permès veure més lluny i clar que mai en la història humana.",
      imageUrl: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&q=80",
      date: "5 d'Abril, 2026"
    }
  ];

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '2rem 1rem' }}>
      <h1 style={{ fontSize: '3.5rem', color: 'var(--primary-dark)', marginBottom: '1rem', fontWeight: 800, letterSpacing: '-0.02em', textAlign: 'center' }}>
        El Nostre Blog
      </h1>
      <p style={{ fontSize: '1.25rem', color: 'rgba(0,0,0,0.6)', marginBottom: '3rem', textAlign: 'center' }}>
        Artícles diaris per entendre l&apos;espectacle més gran del món: l&apos;univers.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '2.5rem' }}>
        {mockPosts.map(post => (
          <Link href={`/blog/${post.slug}`} key={post.id} className="card" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column', textDecoration: 'none', border: 'none', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
             <div style={{ width: '100%', aspectRatio: '16/9', overflow: 'hidden' }}>
               <img src={post.imageUrl} alt={post.title} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)' }} className="zoom-on-hover" />
             </div>
             <div style={{ padding: '2rem', background: 'white', flex: 1, display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '0.9rem', color: 'var(--primary-blue)', fontWeight: 600, marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{post.date}</span>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '1rem', color: 'var(--foreground)', lineHeight: 1.3 }}>{post.title}</h2>
                <p style={{ color: 'rgba(0,0,0,0.7)', lineHeight: 1.6, marginBottom: '1.5rem', flex: 1 }}>{post.excerpt}</p>
                <div style={{ fontWeight: 600, color: 'var(--primary-dark)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>Llegir article completa <span style={{fontSize: '1.2rem'}}>&rarr;</span></div>
             </div>
          </Link>
        ))}
      </div>
      <style dangerouslySetInnerHTML={{__html: `
        .zoom-on-hover:hover {
           transform: scale(1.08);
        }
      `}} />
    </div>
  );
}
