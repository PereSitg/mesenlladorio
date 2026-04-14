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
    // Creem un nom únic per al fitxer per evitar duplicats
    const fileName = `${Date.now()}_${file.name.replace(/\s+/g, "_")}`;
    const storageRef = ref(storage, `${folder}/${fileName}`);
    
    // Pugem els bytes
    const snapshot = await uploadBytes(storageRef, file);
    
    // Obtenim la URL definitiva per guardar-la a la base de dades
    const downloadURL = await getDownloadURL(snapshot.ref);
    
    return downloadURL;
  } catch (error) {
    console.error("Error uploading image:", error);
    throw error;
  }
};
