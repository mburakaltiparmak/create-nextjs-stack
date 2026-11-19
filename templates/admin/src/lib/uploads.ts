// Vercel sunucu fonksiyonları 4,5 MB üzerindeki istek gövdesini reddeder; sınır bunun altında tutulur.
export const maxUploadBytes = 4 * 1024 * 1024;
export const uploadTypes = ["image/jpeg", "image/png", "image/webp", "image/svg+xml"];
