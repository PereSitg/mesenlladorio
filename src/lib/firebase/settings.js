import { db } from './config';
import { doc, getDoc, setDoc } from 'firebase/firestore';

const SETTINGS_COLLECTION = 'settings';
const HOME_SEO_DOC = 'homeSEO';

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
