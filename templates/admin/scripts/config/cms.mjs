// Supabase + Cloudinary
export const required = ["NEXT_PUBLIC_SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY", "CLOUDINARY_CLOUD_NAME", "CLOUDINARY_API_KEY", "CLOUDINARY_API_SECRET"];
export const check = (has) => (has("REVALIDATION_SECRET") ? [] : ["REVALIDATION_SECRET yok: yayınlanan içerik sitede önbellek süresi dolunca görünür."]);
