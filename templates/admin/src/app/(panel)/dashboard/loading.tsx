import { t } from "@/lib/i18n";
import { ListCardSkeleton, Loading, PageHeaderSkeleton, StatCardsSkeleton } from "@/components/skeletons";

export default function DashboardLoading() {
  return <Loading label={t.loading.dashboard}>
    <PageHeaderSkeleton/>
    <StatCardsSkeleton/>
    <div className="grid gap-6 lg:grid-cols-5"><ListCardSkeleton className="lg:col-span-3" rows={6}/><ListCardSkeleton className="lg:col-span-2" rows={6}/></div>
  </Loading>;
}
