import { t } from "@/lib/i18n";
import type { Metadata } from "next";
import { changeUserAccess, inviteUser, resendInvitation } from "@/app/user-actions";
import { PageHeader } from "@/components/Page";
import InviteDialog from "@/components/users/InviteDialog";
import UsersTable from "@/components/users/UsersTable";
import { requirePrincipal, roles, type Role } from "@/lib/authorization";
import { relativeTime } from "@/lib/entry-view";
import { invitationPending, invitationTtlDays, listUsers, userRoles } from "@/lib/management";

export const metadata: Metadata = { title: t.users.title };

export default async function UsersPage() {
  const principal = await requirePrincipal("users");
  const users = await listUsers();
  const withRoles = await Promise.all(users.map(async (user) => ({ user, roles: await userRoles(user.user_id) })));
  const rows = withRoles.map(({ user, roles: assigned }) => {
    const role = assigned.map((item) => item.name.toLowerCase()).find((name): name is Role => roles.includes(name as Role)) ?? null;
    const pending = invitationPending(user);
    return { id: user.user_id, email: user.email, role, sites: user.app_metadata?.siteKeys ?? [], blocked: Boolean(user.blocked), pending, mfa: Boolean(user.multifactor?.length), activity: pending ? t.users.invitedAgo(relativeTime(user.created_at)) : t.users.lastLogin(relativeTime(user.last_login)), self: user.user_id === principal.id };
  }).sort((a, b) => a.email.localeCompare(b.email, "tr"));

  return <>
    <PageHeader title={t.users.title} description={t.users.description}>
      <InviteDialog ttlDays={invitationTtlDays} action={inviteUser}/>
    </PageHeader>
    <UsersTable rows={rows} actions={{ access: changeUserAccess, resend: resendInvitation }}/>
  </>;
}
