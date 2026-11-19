import { t } from "@/lib/i18n";
import { Loading, PageHeaderSkeleton, TableSkeleton, ToolbarSkeleton } from "@/components/skeletons";

export default function LeadsLoading() {
  return <Loading label={t.loading.leads}><PageHeaderSkeleton/><ToolbarSkeleton tabs={4}/><TableSkeleton rows={8} columns={4}/></Loading>;
}
