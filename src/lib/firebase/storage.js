import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "./config";

/**
 * Puja una imatge a Firebase Storage i retorna la URL de descàrrega.
 * @param {File} file - El fitxer de la imatge.
 * @param {string} folder - Carpeta on es guardarà (ex: 'posts').
 * @returns {Promise<string>} - La URL pública de la imatge.
 */
export const uploadImage = async (file, folder = "posts") => {
  if (!file) return null;

  try {
    const fileName = `${Date.now()}_${file.name.replace(/\s+/g, "_")}`;
    const storageRef = ref(storage, `${folder}/${fileName}`);
    
    // Pugem els bytes i esperem el resultat
    const snapshot = await uploadBytes(storageRef, file);
    
    // Retornem la URL de descàrrega
    return await getDownloadURL(snapshot.ref);
  } catch (error) {
    console.error("Error a uploadImage:", error);
    if (error.code === 'storage/unauthorized') {
      throw new Error("No tens permisos de Firebase Storage per pujar imatges.");
    }
    throw error;
  }
};
