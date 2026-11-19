"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { toast } from "sonner";
import { errorNotices, notices } from "@/lib/labels";

/** Yönlendirmeli işlemlerden (?notice=) sonra bildirimi bir kez gösterir ve parametreyi adresten kaldırır. */
export default function FlashToast() {
  const params = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const notice = params.get("notice");
  useEffect(() => {
    if (!notice || !(notices[notice] || errorNotices[notice])) return;
    if (errorNotices[notice]) toast.error(errorNotices[notice], { duration: 10_000 });
    else toast.success(notices[notice]);
    const next = new URLSearchParams(params);
    next.delete("notice");
    router.replace(`${pathname}${next.size ? `?${next}` : ""}`, { scroll: false });
  }, [notice, params, pathname, router]);
  return null;
}
