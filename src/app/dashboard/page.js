"use client";

import { useEffect, useState } from "react";
import { auth, provider } from "@/lib/firebase/config";
import { signInWithPopup, signOut, onAuthStateChanged } from "firebase/auth";
import { getAllPosts, createPost, updatePost, deletePost } from "@/lib/firebase/posts";
import { uploadImage } from "@/lib/firebase/storage";

export default function Dashboard() {
  const AUTHORIZED_EMAIL = "mesenlladorio@gmail.com";
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Estats per a la gestió d'articles
  const [view, setView] = useState('menu'); // 'menu', 'list', 'form'
  const [posts, setPosts] = useState([]);
  const [currentPost, setCurrentPost] = useState(null);
  const [submitLoading, setSubmitLoading] = useState(false);

  // Camps del formulari
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    imageUrl: ""
  });
  const [imageFile, setImageFile] = useState(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (usr) => {
      if (usr && usr.email !== AUTHORIZED_EMAIL) {
        signOut(auth);
        setUser(null);
        setError("Accés denegat. Aquest compte no està autoritzat.");
      } else {
        setUser(usr);
        setError(null);
        if (usr) loadPosts();
      }
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const loadPosts = async () => {
    const data = await getAllPosts();
    setPosts(data);
  };

  const handleLogin = async () => {
    setError(null);
    try {
      const result = await signInWithPopup(auth, provider);
      if (result.user.email !== AUTHORIZED_EMAIL) {
        await signOut(auth);
        setError("Accés denegat. Només el compte oficial pot entrar.");
      }
    } catch (err) {
      console.error(err);
      setError("S'ha produït un error al connectar amb Google.");
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    setView('menu');
  };

  const openForm = (post = null) => {
    if (post) {
      setCurrentPost(post);
      setFormData({
        title: post.title,
        slug: post.slug,
        excerpt: post.excerpt,
        content: post.content,
        imageUrl: post.imageUrl
      });
    } else {
      setCurrentPost(null);
      setFormData({ title: "", slug: "", excerpt: "", content: "", imageUrl: "" });
    }
    setImageFile(null);
    setView('form');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitLoading(true);
    try {
      let finalImageUrl = formData.imageUrl;
      
      // Si hem seleccionat un fitxer nou, el pugem a Storage
      if (imageFile) {
        finalImageUrl = await uploadImage(imageFile);
      }

      const postPayload = { ...formData, imageUrl: finalImageUrl };

      if (currentPost) {
        await updatePost(currentPost.id, postPayload);
      } else {
        await createPost(postPayload);
      }

      await loadPosts();
      setView('list');
    } catch (err) {
      console.error(err);
      alert("Error al guardar l'article.");
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (confirm("Estàs segur que vols esborrar aquest article?")) {
      await deletePost(id);
      await loadPosts();
    }
  };

  if (loading) return <div className="layout-container" style={{ padding: '4rem 1rem', textAlign: 'center' }}>Carregant...</div>;

  if (!user) {
    return (
      <div className="layout-container" style={{ padding: '4rem 1rem', textAlign: 'center', maxWidth: '600px', margin: '0 auto' }}>
        <div className="card">
          <h1 style={{ fontSize: '2rem', marginBottom: '1rem', color: 'var(--primary-dark)' }}>Accés Administració</h1>
          {error && <div style={{ background: '#FEE2E2', color: '#B91C1C', padding: '0.75rem', borderRadius: '0.5rem', marginBottom: '1.5rem' }}>{error}</div>}
          <p style={{ marginBottom: '2rem', color: 'rgba(0,0,0,0.7)' }}>Has d&apos;iniciar sessió amb un compte autoritzat.</p>
          <button onClick={handleLogin} className="btn" style={{ background: '#DB4437' }}>Entrar amb Google</button>
        </div>
      </div>
    );
  }

  return (
    <div className="layout-container" style={{ padding: '2rem 1rem' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.8rem', color: 'var(--primary-dark)', cursor: 'pointer' }} onClick={() => setView('menu')}>Panell de Control</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span style={{ fontSize: '0.85rem' }}>Hola, <strong>{user.email}</strong></span>
          <button onClick={handleLogout} className="btn" style={{ background: 'transparent', border: '1px solid var(--primary-blue)', color: 'var(--primary-blue)', padding: '0.3rem 0.8rem', fontSize: '0.8rem' }}>Sortir</button>
        </div>
      </header>

      {view === 'menu' && (
        <div className="grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
          <div className="card" onClick={() => openForm()} style={{ cursor: 'pointer', textAlign: 'center', padding: '3rem' }}>
            <span style={{ fontSize: '3rem' }}>📝</span>
            <h2 style={{ marginTop: '1rem' }}>Nou Article</h2>
            <p style={{ color: 'rgba(0,0,0,0.6)' }}>Crea un nou post amb format Markdown.</p>
          </div>
          <div className="card" onClick={() => setView('list')} style={{ cursor: 'pointer', textAlign: 'center', padding: '3rem' }}>
            <span style={{ fontSize: '3rem' }}>📚</span>
            <h2 style={{ marginTop: '1rem' }}>Gestionar Articles</h2>
            <p style={{ color: 'rgba(0,0,0,0.6)' }}>Edita o esborra les teves publicacions ({posts.length}).</p>
          </div>
        </div>
      )}

      {view === 'list' && (
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h2>Articles Publicats</h2>
            <button className="btn" onClick={() => openForm()}>+ Nou</button>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--gray-200)', textAlign: 'left' }}>
                  <th style={{ padding: '1rem' }}>Títol</th>
                  <th style={{ padding: '1rem' }}>Data</th>
                  <th style={{ padding: '1rem' }}>Accions</th>
                </tr>
              </thead>
              <tbody>
                {posts.map(post => (
                  <tr key={post.id} style={{ borderBottom: '1px solid var(--gray-100)' }}>
                    <td style={{ padding: '1rem' }}>{post.title}</td>
                    <td style={{ padding: '1rem', fontSize: '0.8rem' }}>{new Date(post.createdAt).toLocaleDateString()}</td>
                    <td style={{ padding: '1rem', display: 'flex', gap: '0.5rem' }}>
                      <button onClick={() => openForm(post)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>✏️</button>
                      <button onClick={() => handleDelete(post.id)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>🗑️</button>
                    </td>
                  </tr>
                ))}
                {posts.length === 0 && <tr><td colSpan="3" style={{ padding: '2rem', textAlign: 'center' }}>No hi ha cap article encara.</td></tr>}
              </tbody>
            </table>
          </div>
          <button className="btn" style={{ background: 'var(--foreground)', marginTop: '1.5rem' }} onClick={() => setView('menu')}>Tornar</button>
        </div>
      )}

      {view === 'form' && (
        <div className="card" style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h2>{currentPost ? 'Editar Article' : 'Nou Article'}</h2>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginTop: '1.5rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontWeight: 600 }}>Títol:</label>
              <input type="text" value={formData.title} onChange={e => {
                const val = e.target.value;
                setFormData({...formData, title: val, slug: val.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '')});
              }} required style={{ padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--gray-300)' }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontWeight: 600 }}>Slug (URL):</label>
              <input type="text" value={formData.slug} onChange={e => setFormData({...formData, slug: e.target.value})} required style={{ padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--gray-300)' }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontWeight: 600 }}>Extracte (Resum):</label>
              <textarea value={formData.excerpt} onChange={e => setFormData({...formData, excerpt: e.target.value})} required style={{ padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--gray-300)', minHeight: '80px' }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontWeight: 600 }}>Foto de portada:</label>
              {formData.imageUrl && <img src={formData.imageUrl} style={{ width: '100px', height: '60px', objectFit: 'cover', borderRadius: '4px' }} alt="Preview" />}
              <input type="file" accept="image/*" onChange={e => setImageFile(e.target.files[0])} style={{ fontSize: '0.9rem' }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontWeight: 600 }}>Contingut (Markdown):</label>
              <textarea value={formData.content} onChange={e => setFormData({...formData, content: e.target.value})} required style={{ padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--gray-300)', minHeight: '300px', fontFamily: 'monospace' }} placeholder="# Títol h1\n\nText amb **negreta** i [enllaços](...)" />
            </div>
            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
              <button type="submit" className="btn" disabled={submitLoading} style={{ flex: 1 }}>{submitLoading ? 'Guardant...' : 'Publicar Article'}</button>
              <button type="button" className="btn" style={{ background: 'var(--gray-200)', color: 'black' }} onClick={() => setView('list')}>Cancel·lar</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
