import { Loading, PageHeaderSkeleton, TableSkeleton } from "@/components/skeletons";

// Kendine özgü iskeleti olmayan sayfalar için genel yedek.
export default function PanelLoading() {
  return <Loading><PageHeaderSkeleton/><TableSkeleton/></Loading>;
}
