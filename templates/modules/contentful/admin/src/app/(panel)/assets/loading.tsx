import { t } from "@/lib/i18n";
import { Loading, MediaGridSkeleton, PageHeaderSkeleton } from "@/components/skeletons";
import { Skeleton } from "@/components/ui/skeleton";

export default function AssetsLoading() {
  return <Loading label={t.loading.media}><PageHeaderSkeleton/><Skeleton className="h-8 w-72"/><MediaGridSkeleton/></Loading>;
}
