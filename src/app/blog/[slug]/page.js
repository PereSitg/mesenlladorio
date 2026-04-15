import ReactMarkdown from 'react-markdown';
import { getPostBySlug } from '@/lib/firebase/posts';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';
import ShareButtons from '@/components/ShareButtons';

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    return {
      title: "Article no trobat | Més enllà d'Orió",
    };
  }
  
  const title = post.seoTitle || post.title;
  const description = post.seoDescription || post.excerpt;
  const imageUrl = post.imageUrl || "https://images.unsplash.com/photo-1444703686981-a3abbc4d4fe3?w=1200&q=80";
  const absoluteUrl = `https://mesenlladorio.vercel.app/blog/${slug}`;

  return {
    title: `${title} | Més enllà d'Orió`,
    description: description,
    metadataBase: new URL('https://mesenlladorio.vercel.app'),
    robots: {
      index: post.isIndexed !== false,
      follow: true,
    },
    openGraph: {
      title: title,
      description: description,
      url: absoluteUrl,
      siteName: "Més enllà d'Orió",
      images: [
        {
          url: imageUrl,
          secureUrl: imageUrl,
          width: 1200,
          height: 630,
          alt: title,
          type: 'image/png',
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
  const post = await getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  return (
    <article style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem 1rem' }}>
      <div style={{ marginBottom: '3rem', borderRadius: '24px', overflow: 'hidden', boxShadow: '0 15px 30px -5px rgba(0,0,0,0.1)' }}>
        <img src={post.imageUrl || "https://images.unsplash.com/photo-1444703686981-a3abbc4d4fe3?w=1200&q=80"} alt={post.title} style={{ width: '100%', maxHeight: '450px', objectFit: 'cover', display: 'block' }} />
      </div>
      <h1 style={{ fontSize: '3.5rem', fontWeight: 800, color: 'var(--primary-dark)', marginBottom: '1.5rem', lineHeight: 1.1, letterSpacing: '-0.02em' }}>
        {post.title}
      </h1>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: 'rgba(0,0,0,0.6)', marginBottom: '3rem', paddingBottom: '2.5rem', borderBottom: '1px solid var(--gray-200)', fontSize: '1.1rem' }}>
         <span style={{ fontWeight: 600, color: 'var(--primary-blue)' }}>Per Més enllà d&apos;Orió</span>
         <span>&bull;</span>
         <span>{new Date(post.createdAt).toLocaleDateString('ca-ES', { month: 'long', year: 'numeric' })}</span>
      </div>
      <div className="markdown-content" style={{ fontSize: '1.25rem', lineHeight: 1.8, color: 'rgba(0,0,0,0.85)' }}>
        <ReactMarkdown>{post.content}</ReactMarkdown>
      </div>

      <ShareButtons 
        title={post.title} 
        excerpt={post.excerpt} 
      />
      
      <style dangerouslySetInnerHTML={{__html: `
        .markdown-content h2 { font-size: 2rem; margin-top: 2rem; margin-bottom: 1rem; color: var(--primary-dark); }
        .markdown-content h3 { font-size: 1.5rem; margin-top: 1.5rem; margin-bottom: 0.75rem; color: var(--primary-blue); }
        .markdown-content p { margin-bottom: 1.5rem; }
        .markdown-content ul, .markdown-content ol { margin-bottom: 1.5rem; padding-left: 1.5rem; }
        .markdown-content li { margin-bottom: 0.5rem; }
        .markdown-content strong { color: var(--primary-dark); }
        .markdown-content img { 
          max-width: 100%; 
          height: auto; 
          border-radius: 16px; 
          margin: 2rem auto; 
          display: block; 
          box-shadow: 0 10px 25px rgba(0,0,0,0.1); 
        }
      `}} />
    </article>
  );
}
