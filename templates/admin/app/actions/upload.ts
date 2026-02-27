"use server";

import { v2 as cloudinary } from "cloudinary";

// Parse CLOUDINARY_URL manually to ensure config is correct
// This runs when the module is loaded
if (process.env.CLOUDINARY_URL) {
  const matcher = /cloudinary:\/\/([^:]+):([^@]+)@(.+)/;
  const match = process.env.CLOUDINARY_URL.match(matcher);
  if (match) {
    const [, apiKey, apiSecret, cloudName] = match;
    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
    });
  }
} else {
  cloudinary.config({
    cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

export async function uploadImage(formData: FormData) {
  const file = formData.get("file") as File;

  if (!file) {
    return { error: "No file provided" };
  }


  try {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Try using upload instead of upload_stream for better error handling
    const base64 = `data:${file.type};base64,${buffer.toString('base64')}`;
    
    const result = await cloudinary.uploader.upload(base64, {
      folder: "admin_uploads",
      resource_type: "auto"
    });

    return { url: result.secure_url };
  } catch (error) {
    console.error("Upload error:", error);
    return { error: "Failed to upload image" };
  }
}
