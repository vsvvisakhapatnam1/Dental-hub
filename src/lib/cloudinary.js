const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "";
const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "";

/**
 * Check if Cloudinary is configured in .env
 */
export function isCloudinaryConfigured() {
  return Boolean(CLOUD_NAME && UPLOAD_PRESET);
}

/**
 * Upload an image or video file directly to Cloudinary
 * @param {File|Blob} file - The image or video file to upload
 * @param {string} resourceType - 'image' or 'video' or 'auto'
 * @returns {Promise<{ url: string, public_id: string, secure_url: string }>}
 */
export async function uploadToCloudinary(file, resourceType = "auto") {
  if (!CLOUD_NAME || !UPLOAD_PRESET) {
    console.warn(
      `[Cloudinary] Missing credentials. Add NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME and NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET in .env`
    );
    // Return a dummy object so uploads during local testing degrade gracefully
    return {
      url: URL.createObjectURL(file),
      secure_url: URL.createObjectURL(file),
      public_id: "local_preview_" + Date.now(),
      is_mock: true,
    };
  }

  const endpoint = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/${resourceType}/upload`;
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", UPLOAD_PRESET);

  try {
    const res = await fetch(endpoint, {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData?.error?.message || "Failed to upload to Cloudinary");
    }

    const data = await res.json();
    return {
      url: data.url,
      secure_url: data.secure_url,
      public_id: data.public_id,
      format: data.format,
      resource_type: data.resource_type,
    };
  } catch (error) {
    console.error("[Cloudinary] Upload failed:", error);
    throw error;
  }
}

export default {
  uploadToCloudinary,
  isCloudinaryConfigured,
};
