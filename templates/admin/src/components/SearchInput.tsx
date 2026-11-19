"use client";

import { t } from "@/lib/i18n";
import { LoaderCircle, Search, X } from "lucide-react";
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from "@/components/ui/input-group";
import { cn } from "@/lib/utils";

/** Arama kutusu: yazarken (debounce beklerken) dönen gösterge, temizle düğmesi ve Esc ile temizleme. */
export default function SearchInput({ value, onChange, searching = false, placeholder, label, className }: { value: string; onChange: (value: string) => void; searching?: boolean; placeholder: string; label: string; className?: string }) {
  return <InputGroup className={cn("w-full sm:w-72", className)}>
    <InputGroupAddon>{searching ? <LoaderCircle className="animate-spin" aria-hidden/> : <Search aria-hidden/>}</InputGroupAddon>
    <InputGroupInput type="search" placeholder={placeholder} aria-label={label} value={value} onChange={(event) => onChange(event.target.value)}
      onKeyDown={(event) => { if (event.key === "Escape" && value) { event.preventDefault(); onChange(""); } }}
      className="[&::-webkit-search-cancel-button]:hidden"/>
    {value && <InputGroupAddon align="inline-end"><InputGroupButton size="icon-xs" aria-label={t.common.clearSearch} onClick={() => onChange("")}><X/></InputGroupButton></InputGroupAddon>}
  </InputGroup>;
}
