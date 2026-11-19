"use client";

import { t } from "@/lib/i18n";
import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

/**
 * Madde listesi (Contentful Array<Symbol>). Değer gizli alanda JSON dizisi olarak gönderilir;
 * boş satırlar kaydedilmez. Enter yeni satır açar.
 */
export default function ListEditor({ name, defaultValue, addLabel = t.form.addRow, emptyLabel = t.form.noRows }: { name: string; defaultValue: string[]; addLabel?: string; emptyLabel?: string }) {
  // Satır kimlikleri: başlangıç satırları 0..n-1, yeniler olay işleyicisinde sayaçtan.
  const nextId = useRef(defaultValue.length);
  const [items, setItems] = useState(() => defaultValue.map((value, index) => ({ id: index, value })));
  const inputs = useRef(new Map<number, HTMLInputElement>());
  const json = JSON.stringify(items.map((item) => item.value.trim()).filter(Boolean));

  const update = (id: number, value: string) => setItems((current) => current.map((item) => (item.id === id ? { ...item, value } : item)));
  const move = (index: number, offset: number) => setItems((current) => { const next = [...current]; const [item] = next.splice(index, 1); next.splice(index + offset, 0, item); return next; });
  function add(after?: number) {
    const id = nextId.current++;
    setItems((current) => {
      const next = [...current];
      next.splice(after === undefined ? next.length : after + 1, 0, { id, value: "" });
      return next;
    });
    requestAnimationFrame(() => inputs.current.get(id)?.focus());
  }

  return <div className="space-y-2">
    <input type="hidden" name={name} value={json}/>
    {items.length === 0 && <p className="rounded-lg border border-dashed px-3 py-4 text-center text-sm text-muted-foreground">{emptyLabel}</p>}
    {items.map((item, index) => <div key={item.id} className="group flex items-center gap-2">
      <span className="w-5 shrink-0 text-center text-xs tabular-nums text-muted-foreground">{index + 1}</span>
      <Input
        ref={(node) => { if (node) inputs.current.set(item.id, node); else inputs.current.delete(item.id); }}
        value={item.value}
        maxLength={500}
        aria-label={`Madde ${index + 1}`}
        onChange={(event) => update(item.id, event.target.value)}
        onKeyDown={(event) => { if (event.key === "Enter") { event.preventDefault(); add(index); } }}
      />
      <div className="flex shrink-0 opacity-60 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100">
        <Button type="button" variant="ghost" size="icon-xs" aria-label={t.form.moveUp} disabled={index === 0} onClick={() => move(index, -1)}><ArrowUp/></Button>
        <Button type="button" variant="ghost" size="icon-xs" aria-label={t.form.moveDown} disabled={index === items.length - 1} onClick={() => move(index, 1)}><ArrowDown/></Button>
        <Button type="button" variant="ghost" size="icon-xs" aria-label={t.form.removeItem} className="text-destructive hover:text-destructive" onClick={() => setItems((current) => current.filter((other) => other.id !== item.id))}><Trash2/></Button>
      </div>
    </div>)}
    <Button type="button" variant="outline" size="sm" onClick={() => add()}><Plus/>{addLabel}</Button>
  </div>;
}
