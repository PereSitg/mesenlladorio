import Link from 'next/link';
import { getAllPosts } from '@/lib/firebase/posts';

import { getBlogSEO } from '@/lib/firebase/settings';

export const dynamic = 'force-dynamic';

export async function generateMetadata() {
  const seo = await getBlogSEO();
  const imageUrl = "/og-image.jpg"; // Blog index default image
  
  return {
    title: seo?.title || "Blog i Articles | Més enllà d'Orió",
    description: seo?.description || "Tecnologia, històries, criptomonedes i coses random.",
    openGraph: {
      title: seo?.title,
      description: seo?.description,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: seo?.title || "Blog | Més enllà d'Orió",
        }
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: seo?.title,
      description: seo?.description,
      images: [imageUrl],
    }
  };
}


export default async function BlogIndex() {
  const posts = await getAllPosts();

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1rem' }}>
      <h1 style={{ fontSize: '3.5rem', color: 'var(--primary-dark)', marginBottom: '1rem', fontWeight: 800, letterSpacing: '-0.02em', textAlign: 'center' }}>
        El Nostre Blog
      </h1>
      <p style={{ fontSize: '1.25rem', color: 'rgba(0,0,0,0.6)', marginBottom: '3rem', textAlign: 'center' }}>
        Artícles per entendre tot allò que ens passa pel cap.
      </p>

      {posts.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: 'rgba(0,0,0,0.5)' }}>
          <p>Encara no hi ha articles publicats. Torna aviat!</p>
        </div>
      ) : (
        <div className="blog-grid">
          {posts.map(post => (
            <Link href={`/blog/${post.slug}`} key={post.id} className="card" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column', textDecoration: 'none', border: 'none', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
               <div style={{ width: '100%', aspectRatio: '16/9', overflow: 'hidden' }}>
                 <img src={post.imageUrl || "/og-image.jpg"} alt={post.title} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)' }} className="zoom-on-hover" />
               </div>
               <div style={{ padding: '2rem', background: 'white', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '0.9rem', color: 'var(--primary-blue)', fontWeight: 600, marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    {new Date(post.createdAt).toLocaleDateString('ca-ES', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </span>
                  <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '1rem', color: 'var(--foreground)', lineHeight: 1.3 }}>{post.title}</h2>
                  <p style={{ color: 'rgba(0,0,0,0.7)', lineHeight: 1.6, marginBottom: '1.5rem', flex: 1 }}>{post.excerpt}</p>
                  <div style={{ fontWeight: 600, color: 'var(--primary-dark)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    Llegir article complet <span style={{fontSize: '1.2rem'}}>&rarr;</span>
                  </div>
               </div>
            </Link>
          ))}
        </div>
      )}
      <style dangerouslySetInnerHTML={{__html: `
        .blog-grid {
           display: grid;
           grid-template-columns: repeat(3, 1fr);
           gap: 2.5rem;
        }
        @media (max-width: 1024px) {
           .blog-grid {
              grid-template-columns: repeat(2, 1fr);
           }
        }
        @media (max-width: 640px) {
           .blog-grid {
              grid-template-columns: 1fr;
           }
        }
        .zoom-on-hover:hover {
           transform: scale(1.08);
        }
      `}} />
    </div>
  );
}
