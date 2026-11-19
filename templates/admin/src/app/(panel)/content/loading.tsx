import { t } from "@/lib/i18n";
import { Loading, PageHeaderSkeleton, TableSkeleton, ToolbarSkeleton } from "@/components/skeletons";

export default function ContentLoading() {
  return <Loading label={t.loading.content}><PageHeaderSkeleton/><ToolbarSkeleton tabs={4} filters={2}/><TableSkeleton rows={8} columns={5}/></Loading>;
}
