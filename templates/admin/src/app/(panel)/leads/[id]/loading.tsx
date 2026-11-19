import { t } from "@/lib/i18n";
import { FormCardSkeleton, Loading, PageHeaderSkeleton } from "@/components/skeletons";

export default function LeadLoading() {
  return <Loading label={t.loading.lead}>
    <PageHeaderSkeleton actions={2}/>
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
      <div className="grid content-start gap-6"><FormCardSkeleton fields={2}/><FormCardSkeleton fields={2}/></div>
      <FormCardSkeleton fields={2}/>
    </div>
  </Loading>;
}
