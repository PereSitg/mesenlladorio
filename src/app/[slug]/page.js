import ReactMarkdown from 'react-markdown';
import { getPageBySlug } from '@/lib/firebase/pages';
import { notFound } from 'next/navigation';
import ShareButtons from '@/components/ShareButtons';

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const page = await getPageBySlug(slug);

  if (!page) {
    return {
      title: "Pàgina no trobada | Més enllà d'Orió",
    };
  }
  
  return {
    title: `${page.title} | Més enllà d'Orió`,
    robots: {
      index: page.isIndexed !== false,
      follow: true,
    },
    openGraph: {
      title: page.title,
      type: 'website',
    }
  };
}

export default async function DynamicPage({ params }) {
  const { slug } = await params;
  const page = await getPageBySlug(slug);

  if (!page) {
    notFound();
  }

  return (
    <article style={{ maxWidth: '800px', margin: '4rem auto', padding: '0 1.5rem' }}>
      <header style={{ marginBottom: '3rem', textAlign: 'center' }}>
        <h1 style={{ fontSize: '3.5rem', fontWeight: 800, color: 'var(--primary-dark)', marginBottom: '1rem', letterSpacing: '-0.02em' }}>
          {page.title}
        </h1>
        <div style={{ width: '60px', height: '4px', background: 'var(--primary-blue)', margin: '0 auto', borderRadius: '2px' }}></div>
      </header>

      <div className="markdown-content" style={{ fontSize: '1.2rem', lineHeight: 1.8, color: 'rgba(0,0,0,0.8)' }}>
        <ReactMarkdown>{page.content}</ReactMarkdown>
      </div>

      <ShareButtons 
        title={page.title} 
        excerpt="" 
      />

      <style dangerouslySetInnerHTML={{__html: `
        .markdown-content h2 { font-size: 1.8rem; margin-top: 2.5rem; margin-bottom: 1.2rem; color: var(--primary-dark); }
        .markdown-content h3 { font-size: 1.4rem; margin-top: 2rem; margin-bottom: 1rem; color: var(--primary-blue); }
        .markdown-content p { margin-bottom: 1.5rem; }
        .markdown-content ul, .markdown-content ol { margin-bottom: 1.5rem; padding-left: 1.5rem; }
        .markdown-content li { margin-bottom: 0.6rem; }
        .markdown-content strong { color: var(--primary-dark); }
        .markdown-content hr { margin: 3rem 0; border: 0; border-top: 1px solid var(--gray-200); }
      `}} />
    </article>
  );
}
