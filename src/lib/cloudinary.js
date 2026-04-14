export const uploadToCloudinary = async (file) => {
  if (!file) return null;

  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

  if (!cloudName || !uploadPreset) {
    console.error("Falten les claus de Cloudinary a .env.local");
    return null;
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", uploadPreset);

  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      {
        method: "POST",
        body: formData,
      }
    );

    if (!response.ok) {
      throw new Error("Error en la pujada a Cloudinary");
    }

    const data = await response.json();
    return data.secure_url; // Retorna la URL segura (https)
  } catch (error) {
    console.error("Error uploadToCloudinary:", error);
    throw error;
  }
};
