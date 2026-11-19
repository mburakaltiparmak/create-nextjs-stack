// Giriş: Auth.js credentials (tek yönetici)
export const required = ["AUTH_SECRET", "ADMIN_EMAIL"];
export const check = (has) => (has("ADMIN_PASSWORD_HASH") ? [] : ["ADMIN_PASSWORD_HASH yok: production'da düz metin ADMIN_PASSWORD yerine `npm run auth:hash` çıktısını kullanın."]);
