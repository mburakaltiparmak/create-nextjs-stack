/**
 * Adds the MindOfis admin claims to the ID token used by the admin app.
 *
 * This file is the source of truth for the deployed Auth0 Post Login Action
 * (Auth0 → Actions → Library → "Add MindOfis claims" → Login flow).
 * The namespace must match AUTH0_ROLES_CLAIM / AUTH0_SITE_KEYS_CLAIM in the admin's environment.
 *
 *   roles     Auth0 roles (editor | publisher | administrator)
 *   siteKeys  sites the user may manage (app_metadata.siteKeys); administrators get every site.
 *             Keep SITES in sync with admin/src/lib/sites.ts. Without this claim the admin reads
 *             app_metadata live from the Management API, so it is an optimisation, not a requirement.
 *
 * Two-step verification is optional: only users who enrolled an authenticator app (Hesabım →
 * Güvenlik in the admin) are challenged. The tenant MFA policy stays "never".
 */
const SITES = ["main"];

exports.onExecutePostLogin = async (event, api) => {
  if (event.user.multifactor?.length) api.authentication.challengeWith({ type: "otp" });

  const namespace = "https://example.com"; // AUTH0_ROLES_CLAIM / AUTH0_SITE_KEYS_CLAIM ile aynı
  const roles = event.authorization?.roles ?? [];
  const assigned = Array.isArray(event.user.app_metadata?.siteKeys) ? event.user.app_metadata.siteKeys : [];
  const siteKeys = roles.includes("administrator") ? SITES : assigned.filter((key) => SITES.includes(key));

  api.idToken.setCustomClaim(`${namespace}/roles`, roles);
  api.idToken.setCustomClaim(`${namespace}/siteKeys`, siteKeys);
};
