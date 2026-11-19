"use client";

/* eslint-disable @next/next/no-img-element */
import { ImageOff } from "lucide-react";
import { useState, type ComponentProps } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

/** Görsel inene kadar iskelet gösterir, sonra yumuşakça belirir; yüklenemezse yer tutucu gösterir. */
export default function LazyImage({ className, wrapperClassName, alt, ...props }: ComponentProps<"img"> & { wrapperClassName?: string }) {
  const [status, setStatus] = useState<"loading" | "loaded" | "error">("loading");
  // Önbellekten gelen görsel, React olay dinleyicisini bağlamadan yüklenmiş olabilir.
  const check = (node: HTMLImageElement | null) => { if (node?.complete && status === "loading") setStatus(node.naturalWidth ? "loaded" : "error"); };
  return <div className={cn("relative overflow-hidden", wrapperClassName)}>
    {status === "loading" && <Skeleton className="absolute inset-0 rounded-none"/>}
    {status === "error" ? <div className="flex size-full items-center justify-center bg-muted text-muted-foreground" role="img" aria-label={alt}><ImageOff className="size-5"/></div>
      : <img ref={check} alt={alt} loading="lazy" decoding="async" {...props} onLoad={() => setStatus("loaded")} onError={() => setStatus("error")} className={cn("transition-opacity duration-300", status === "loaded" ? "opacity-100" : "opacity-0", className)}/>}
  </div>;
}
