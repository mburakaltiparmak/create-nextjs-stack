# Auth0 sign-in

Roles: **editor** (drafts), **publisher** (+ publish / unpublish), **administrator** (everything, all sites, users).

1. **Regular Web Application** — Allowed Callback URL `<APP_BASE_URL>/auth/callback`, Allowed Logout URL `<APP_BASE_URL>`.
   Copy domain, client ID and secret to `AUTH0_DOMAIN`, `AUTH0_CLIENT_ID`, `AUTH0_CLIENT_SECRET`;
   `AUTH0_SECRET=$(openssl rand -hex 32)`.
2. **Machine-to-Machine application** authorised for the Auth0 Management API with
   `read/create/update:users`, `read:roles`, `create:role_members`, `delete:role_members`, `read:users_app_metadata`,
   `update:users_app_metadata`, `create:user_tickets`, `delete:sessions`, `read:authentication_methods`,
   `delete:authentication_methods` → `AUTH0_MANAGEMENT_CLIENT_ID`, `AUTH0_MANAGEMENT_CLIENT_SECRET`.
3. **Roles** `editor`, `publisher`, `administrator` (User Management → Roles) → their IDs in `AUTH0_ROLE_*_ID`.
4. **Post Login Action** — paste `auth0/actions/add-claims.js`, set the namespace to match `AUTH0_ROLES_CLAIM` /
   `AUTH0_SITE_KEYS_CLAIM`, keep `SITES` in sync with `src/lib/sites.ts`, deploy and add it to the Login flow.
5. Create the first user in Auth0, assign the **administrator** role, sign in, then invite everyone else from **Users**.

Invitations are emailed through Resend (`RESEND_API_KEY`, `RESEND_FROM_EMAIL`); without it the link is shown to the
administrator to forward manually. Users can turn on two-step verification under **My account**.
