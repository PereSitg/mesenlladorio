import { db } from './config';
import { doc, getDoc, setDoc } from 'firebase/firestore';

const SETTINGS_COLLECTION = 'settings';
const HOME_SEO_DOC = 'homeSEO';
const BLOG_SEO_DOC = 'blogSEO';
const YOUTUBE_SEO_DOC = 'youtubeSEO';

export const getHomeSEO = async () => {
  try {
    const docRef = doc(db, SETTINGS_COLLECTION, HOME_SEO_DOC);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data();
    }
    // Retornem valors per defecte si no existeix
    return {
      title: "Més enllà d'Orió - Tecnologia, Estafes i Coses Random",
      description: "Tecnologia, històries increïbles, criptomonedes i curiositats. Parlem de tot allò que ens fascina i ens explota el cap.",
      imageUrl: "https://mesenlladorio.vercel.app/og-image.jpg"
    };
  } catch (error) {
    console.error("Error getHomeSEO:", error);
    return null;
  }
};

export const updateHomeSEO = async (data) => {
  try {
    const docRef = doc(db, SETTINGS_COLLECTION, HOME_SEO_DOC);
    await setDoc(docRef, {
      ...data,
      updatedAt: new Date().toISOString()
    }, { merge: true });
    return true;
  } catch (error) {
    console.error("Error updateHomeSEO:", error);
    throw error;
  }
};

export const getBlogSEO = async () => {
  try {
    const docRef = doc(db, SETTINGS_COLLECTION, BLOG_SEO_DOC);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) return docSnap.data();
    return {
      title: "Blog i Articles | Més enllà d'Orió",
      description: "Tecnologia, històries, criptomonedes i coses random."
    };
  } catch (error) {
    console.error("Error getBlogSEO:", error);
    return null;
  }
};

export const updateBlogSEO = async (data) => {
  try {
    const docRef = doc(db, SETTINGS_COLLECTION, BLOG_SEO_DOC);
    await setDoc(docRef, { ...data, updatedAt: new Date().toISOString() }, { merge: true });
    return true;
  } catch (error) {
    console.error("Error updateBlogSEO:", error);
    throw error;
  }
};

export const getYoutubeSEO = async () => {
  try {
    const docRef = doc(db, SETTINGS_COLLECTION, YOUTUBE_SEO_DOC);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) return docSnap.data();
    return {
      title: "Canal de YouTube - Més enllà d'Orió",
      description: "Explora tots els vídeos del nostre canal de YouTube sobre tecnologia, estafes i curiositats."
    };
  } catch (error) {
    console.error("Error getYoutubeSEO:", error);
    return null;
  }
};

export const updateYoutubeSEO = async (data) => {
  try {
    const docRef = doc(db, SETTINGS_COLLECTION, YOUTUBE_SEO_DOC);
    await setDoc(docRef, { ...data, updatedAt: new Date().toISOString() }, { merge: true });
    return true;
  } catch (error) {
    console.error("Error updateYoutubeSEO:", error);
    throw error;
  }
};

