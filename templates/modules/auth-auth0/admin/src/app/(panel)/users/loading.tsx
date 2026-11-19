import { t } from "@/lib/i18n";
import { Loading, PageHeaderSkeleton, TableSkeleton } from "@/components/skeletons";
import { Skeleton } from "@/components/ui/skeleton";

export default function UsersLoading() {
  return <Loading label={t.users.loading}><PageHeaderSkeleton/><Skeleton className="h-8 w-72"/><TableSkeleton rows={5} columns={5} avatar/></Loading>;
}
