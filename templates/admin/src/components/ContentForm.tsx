"use client";

import { t } from "@/lib/i18n";
import { CircleAlert, CircleCheck, Languages, LoaderCircle } from "lucide-react";
import { useState } from "react";
import { saveContent } from "@/app/actions";
import { ActionForm, FormField, SubmitButton } from "@/components/ActionForm";
import ImageField from "@/components/content/ImageField";
import ListEditor from "@/components/content/ListEditor";
import MarkdownEditor from "@/components/content/MarkdownEditor";
import { AppLink as Link } from "@/components/shell/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FieldGroup } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useSlugCheck, type SlugStatus } from "@/hooks/use-slug-check";
import { findType, type FieldDef, type RefOptions } from "@/lib/content-model";
import type { ContentEntry } from "@/lib/content-entry";
import type { ImageOption } from "@/lib/media";
import { getSite, type SiteKey } from "@/lib/sites";
import { cn } from "@/lib/utils";

const slugStatusView: Partial<Record<SlugStatus, { icon: typeof CircleCheck; text: string; className: string }>> = {
  checking: { icon: LoaderCircle, text: t.form.slugChecking, className: "text-muted-foreground [&_svg]:animate-spin" },
  available: { icon: CircleCheck, text: t.form.slugAvailable, className: "text-success" },
  taken: { icon: CircleAlert, text: t.form.slugTaken, className: "text-destructive" },
};

/** Yan sütunda (Görünüm kartı) gösterilen alan türleri. */
const asideKinds = new Set(["image", "number", "url", "boolean", "date"]);

const turkish: Record<string, string> = { ç: "c", ğ: "g", ı: "i", İ: "i", ö: "o", ş: "s", ü: "u", ä: "a", õ: "o", š: "s", ž: "z", ß: "ss" };
export function slugify(value: string) {
  return value.replace(/[çğıİöşüäõšžß]/gi, (char) => turkish[char] ?? turkish[char.toLowerCase()] ?? char).toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80);
}

export default function ContentForm({ siteKey, entry, initialType, siteUrl, assets, refOptions = {} }: { siteKey: SiteKey; entry?: ContentEntry; initialType?: string; siteUrl: string; assets: ImageOption[]; refOptions?: RefOptions }) {
  const site = getSite(siteKey);
  const { model } = site;
  const primary = model.primaryLocale;
  const [typeId, setTypeId] = useState<string>(entry?.type || (initialType && findType(model, initialType) ? initialType : model.types[0].id));
  const [locale, setLocale] = useState<string>(primary);
  const type = findType(model, typeId) ?? model.types[0];

  const key = (id: string, at: string, localized?: boolean) => (localized ? model.fieldKey(id, at) : id);
  const raw = (field: FieldDef | { id: string; localized?: boolean }, at: string = primary) => entry?.fields[key(field.id, at, field.localized)];
  const text = (field: FieldDef | { id: string; localized?: boolean }, at?: string) => { const value = raw(field, at); return value === undefined || value === null ? "" : String(value); };
  const list = (field: FieldDef, at?: string) => { const value = raw(field, at); return Array.isArray(value) ? value.map(String) : []; };

  // Yeni kayıtta adres, elle değiştirilene kadar başlıktan (ana dil) türetilir.
  const titleDef = type.fields.find((field) => field.id === type.titleField);
  const hasSlug = type.fields.some((field) => field.kind === "slug");
  const [title, setTitle] = useState(titleDef ? text(titleDef) : "");
  const [slug, setSlug] = useState(text({ id: "slug" }));
  const [slugTouched, setSlugTouched] = useState(Boolean(entry));
  const selectDef = type.fields.find((field) => field.kind === "select");
  const [selectValue, setSelectValue] = useState(selectDef ? text(selectDef) || selectDef.options?.[0]?.value || "" : "");
  const slugStatus = useSlugCheck({ siteKey, type: type.id, slug, savedSlug: entry ? text({ id: "slug" }) : undefined, exceptId: entry?.id, enabled: hasSlug });
  const slugView = slugStatusView[slugStatus];

  const localized = type.fields.filter((field) => field.localized);
  const plain = type.fields.filter((field) => !field.localized && !asideKinds.has(field.kind));
  const aside = type.fields.filter((field) => !field.localized && asideKinds.has(field.kind));
  const filled = (field: FieldDef, at: string) => (field.kind === "list" ? list(field, at).length > 0 : Boolean(text(field, at)));
  const missing = (at: string) => at !== primary && localized.some((field) => filled(field, primary) && !filled(field, at));
  const path = type.path({ slug, kind: selectValue });
  const slugPrefix = type.path({ slug: "\u0000", kind: selectValue }).split("\u0000")[0] || "/";

  function onTitle(value: string) {
    setTitle(value);
    if (!slugTouched) setSlug(slugify(value));
  }

  function control(field: FieldDef, at?: string) {
    const name = at ? `${field.id}.${at}` : field.id;
    const lang = at ?? undefined;
    const isTitle = field.id === type.titleField && (!field.localized || at === primary);
    const ctlKey = `${site.key}-${type.id}-${name}`;

    switch (field.kind) {
      case "markdown":
        return <MarkdownEditor key={ctlKey} name={name} defaultValue={text(field, at)} rows={field.rows ?? 12}/>;
      case "textarea":
        return <Textarea key={ctlKey} name={name} lang={lang} maxLength={field.max} rows={field.rows ?? 3} defaultValue={text(field, at)} placeholder={field.placeholder}/>;
      case "list":
        return <ListEditor key={ctlKey} name={name} defaultValue={list(field, at)} addLabel={t.form.addItem} emptyLabel={t.form.noItems}/>;
      case "select":
        return <Select name={name} value={selectValue} onValueChange={setSelectValue}>
          <SelectTrigger className="w-full sm:w-64"><SelectValue/></SelectTrigger>
          <SelectContent>{field.options?.map((option) => <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>)}</SelectContent>
        </Select>;
      case "slug":
        return <InputGroup>
          <InputGroupAddon className="font-mono text-xs text-muted-foreground">{slugPrefix}</InputGroupAddon>
          <InputGroupInput name={name} required pattern="[a-z0-9]+(?:-[a-z0-9]+)*" value={slug} onChange={(event) => { setSlugTouched(true); setSlug(event.target.value); }} placeholder={t.form.slugPlaceholder} className="font-mono text-sm" aria-invalid={slugStatus === "taken" || undefined} aria-describedby="slug-status"/>
          {/* Sabit genişlikli alan; durum değişince giriş kutusu kaymaz. */}
          <InputGroupAddon align="inline-end" id="slug-status" aria-live="polite" className={cn("w-32 justify-end text-xs", slugView?.className)}>{slugView && <><slugView.icon/>{slugView.text}</>}</InputGroupAddon>
        </InputGroup>;
      case "image":
        return <ImageField key={ctlKey} name={name} siteKey={siteKey} siteUrl={siteUrl} defaultValue={text(field)} options={assets}/>;
      case "reference": {
        const options = refOptions[field.id] ?? [];
        const current = text(field);
        return <Select key={ctlKey} name={name} defaultValue={current || undefined} disabled={!options.length}>
          <SelectTrigger className="w-full sm:w-80"><SelectValue placeholder={options.length ? t.form.choose : t.form.createReferenceFirst}/></SelectTrigger>
          <SelectContent>{options.map((option) => <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>)}</SelectContent>
        </Select>;
      }
      case "boolean":
        return <Switch key={ctlKey} name={name} defaultChecked={raw(field) === true}/>;
      case "number":
        return <Input key={ctlKey} type="number" name={name} min={0} max={10_000} defaultValue={text(field) || "10"} className="w-28"/>;
      case "date":
        return <Input key={ctlKey} type="date" name={name} defaultValue={text(field).slice(0, 10)} className="w-48"/>;
      default:
        return <Input key={isTitle ? `${ctlKey}-title` : ctlKey} name={name} lang={lang} type={field.kind === "url" ? "url" : "text"} maxLength={field.max} placeholder={field.placeholder}
          {...(isTitle ? { value: title, onChange: (event: React.ChangeEvent<HTMLInputElement>) => onTitle(event.target.value) } : { defaultValue: text(field, at) })}
          className={isTitle ? "h-10 text-base" : undefined}/>;
    }
  }

  const label = (field: FieldDef) => <>{field.label}{field.required && field.kind !== "number" && field.kind !== "boolean" && <span className="ml-0.5 text-destructive" aria-hidden>*</span>}</>;

  return <ActionForm action={saveContent} feedback="toast" className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
    <input type="hidden" name="siteKey" value={site.key}/>
    <input type="hidden" name="contentType" value={type.id}/>
    {entry && <><input type="hidden" name="id" value={entry.id}/><input type="hidden" name="version" value={entry.version}/></>}

    <div className="grid min-w-0 gap-6">
      <Card>
        <CardHeader><CardTitle>{t.form.basics}</CardTitle><CardDescription>{type.hint}</CardDescription></CardHeader>
        <CardContent><FieldGroup>
          {!entry && !(initialType && findType(model, initialType)) && <FormField name="type" label={t.form.contentType}>
            <Select value={type.id} onValueChange={(next) => { setTypeId(next); setTitle(""); setSlug(""); setSlugTouched(false); }}>
              <SelectTrigger className="w-full sm:w-64"><SelectValue/></SelectTrigger>
              <SelectContent>{model.types.map((item) => <SelectItem key={item.id} value={item.id}>{item.label}</SelectItem>)}</SelectContent>
            </Select>
          </FormField>}
          {plain.map((field) => <FormField key={`${type.id}-${field.id}`} name={field.id} label={label(field)} description={field.help}>{control(field)}</FormField>)}
        </FieldGroup></CardContent>
      </Card>

      {localized.length > 0 && <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Languages className="size-4 text-muted-foreground"/>{t.form.texts}</CardTitle>
          <CardDescription>{t.form.textsHint(model.localeLabels[primary])}</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6">
          <Tabs value={locale} onValueChange={setLocale}>
            <TabsList aria-label={t.form.contentLanguage}>
              {model.locales.map((item) => <TabsTrigger key={item} value={item} title={model.localeLabels[item]} className="gap-1.5">
                {item.toUpperCase()}{missing(item) && <span className="size-1.5 rounded-full bg-warning" aria-label={t.form.missingTranslation}/>}
              </TabsTrigger>)}
            </TabsList>
          </Tabs>
          {/* Sekme değişince değerler kaybolmasın diye tüm diller render edilir; yalnız seçili olan görünür. */}
          {model.locales.map((item) => <FieldGroup key={item} hidden={item !== locale} lang={item}>
            {localized.map((field) => <FormField key={`${type.id}-${field.id}-${item}`} name={item === primary ? field.id : `${field.id}.${item}`} label={<>{label(field)}<span className="ml-2 rounded bg-muted px-1.5 py-0.5 text-[10px] font-semibold text-muted-foreground">{item.toUpperCase()}</span></>} description={item === primary ? field.help : t.form.fallbackHint(model.localeLabels[primary])}>
              {control(field, item)}
            </FormField>)}
          </FieldGroup>)}
        </CardContent>
      </Card>}
    </div>

    <aside className="grid content-start gap-6 lg:sticky lg:top-20">
      <Card>
        <CardHeader><CardTitle>{t.form.save}</CardTitle><CardDescription>{entry ? t.form.saveHintExisting : t.form.saveHintNew}</CardDescription></CardHeader>
        <CardContent className="grid gap-2">
          <SubmitButton size="lg" pendingLabel={t.form.saving}>{entry ? t.form.saveChanges : t.form.createDraft}</SubmitButton>
          <Button variant="ghost" asChild><Link href={`/content?site=${site.key}&type=${type.id}`}>{t.common.cancel}</Link></Button>
          {path && <p className="truncate pt-1 text-center font-mono text-xs text-muted-foreground" title={`${siteUrl}${path}`}>{siteUrl.replace(/^https?:\/\//, "")}{path}</p>}
        </CardContent>
      </Card>

      {aside.length > 0 && <Card>
        <CardHeader><CardTitle>{t.form.appearance}</CardTitle></CardHeader>
        <CardContent><FieldGroup>
          {aside.map((field) => <FormField key={`${type.id}-${field.id}`} name={field.id} label={label(field)} description={field.help}>{control(field)}</FormField>)}
        </FieldGroup></CardContent>
      </Card>}
    </aside>
  </ActionForm>;
}
