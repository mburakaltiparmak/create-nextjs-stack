// Giriş: Auth0 (roller, davetler, MFA) + Resend (davet e-postaları)
export const required = [
  "APP_BASE_URL", "AUTH0_DOMAIN", "AUTH0_CLIENT_ID", "AUTH0_CLIENT_SECRET", "AUTH0_SECRET",
  "AUTH0_MANAGEMENT_CLIENT_ID", "AUTH0_MANAGEMENT_CLIENT_SECRET",
  "AUTH0_ROLE_EDITOR_ID", "AUTH0_ROLE_PUBLISHER_ID", "AUTH0_ROLE_ADMINISTRATOR_ID",
];
export const check = (has) => (has("RESEND_API_KEY") && has("RESEND_FROM_EMAIL") ? [] : ["Resend yok: davet bağlantıları e-postayla gitmez, yöneticiye gösterilir."]);
