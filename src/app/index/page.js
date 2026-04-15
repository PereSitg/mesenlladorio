import { getAllPosts } from "@/lib/firebase/posts";
import { getAllPages } from "@/lib/firebase/pages";
import Link from "next/link";

export const metadata = {
  title: "Índex de Continguts | Més enllà d'Orió",
  description: "Llistat complert de tots els articles, vídeos i pàgines independents del web.",
};

export default async function IndexPage() {
  const posts = await getAllPosts();
  const pages = await getAllPages();

  // Filtrem només els que estan indexats
  const indexedPosts = posts.filter(p => p.isIndexed !== false);
  const indexedPages = pages.filter(p => p.isIndexed !== false);

  return (
    <div className="layout-container" style={{ padding: '4rem 1.5rem', maxWidth: '900px', margin: '0 auto' }}>
      <header style={{ textAlign: 'center', marginBottom: '4rem' }}>
        <h1 style={{ fontSize: '3rem', color: 'var(--primary-dark)', marginBottom: '1rem' }}>Índex de Continguts</h1>
        <p style={{ color: 'var(--gray-500)', fontSize: '1.2rem' }}>Tot el que hem publicat, organitzat per a tu.</p>
        <div style={{ width: '80px', height: '4px', background: 'var(--primary-blue)', margin: '1.5rem auto', borderRadius: '2px' }}></div>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '3rem' }}>
        
        {/* ARTICLES SECTION */}
        <section>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '1.5rem', borderBottom: '2px solid var(--gray-100)', paddingBottom: '0.8rem' }}>
            <span style={{ fontSize: '1.5rem' }}>📝</span>
            <h2 style={{ fontSize: '1.8rem', margin: 0, color: 'var(--primary-dark)' }}>Articles del Blog</h2>
          </div>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {indexedPosts.length > 0 ? indexedPosts.map(post => (
              <li key={post.id} style={{ marginBottom: '1.2rem' }}>
                <Link href={`/blog/${post.slug}`} style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--primary-blue)', textDecoration: 'none', display: 'block', transition: 'transform 0.2s ease' }} className="index-link">
                  {post.title}
                </Link>
                <span style={{ fontSize: '0.850rem', color: 'var(--gray-500)' }}>
                  {new Date(post.createdAt).toLocaleDateString('ca-ES', { day: 'numeric', month: 'long', year: 'numeric' })}
                </span>
              </li>
            )) : (
              <p style={{ color: 'var(--gray-400)' }}>No hi ha articles publicats encara.</p>
            )}
          </ul>
        </section>

        {/* PAGES SECTION */}
        <section>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '1.5rem', borderBottom: '2px solid var(--gray-100)', paddingBottom: '0.8rem' }}>
            <span style={{ fontSize: '1.5rem' }}>📄</span>
            <h2 style={{ fontSize: '1.8rem', margin: 0, color: 'var(--primary-dark)' }}>Pàgines</h2>
          </div>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {indexedPages.length > 0 ? indexedPages.map(page => (
              <li key={page.id} style={{ marginBottom: '1.2rem' }}>
                <Link href={`/${page.slug}`} style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--primary-blue)', textDecoration: 'none', display: 'block' }} className="index-link">
                  {page.title}
                </Link>
              </li>
            )) : (
              <p style={{ color: 'var(--gray-400)' }}>No hi ha pàgines independents.</p>
            )}
          </ul>
        </section>

      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .index-link:hover { color: var(--primary-dark) !important; text-decoration: underline !important; }
      `}} />
    </div>
  );
}
