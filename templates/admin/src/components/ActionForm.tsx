"use client";

import { t } from "@/lib/i18n";
import { CircleAlert, CircleCheck } from "lucide-react";
import { unstable_rethrow } from "next/navigation";
import { createContext, useCallback, useContext, useEffect, useId, useRef, useState, useTransition, type ComponentProps, type FormEvent, type ReactNode } from "react";
import { toast } from "sonner";
import ActionMessage from "@/components/ActionMessage";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Field, FieldContent, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field";
import { Spinner } from "@/components/ui/spinner";
import { useDelayedFlag, useElapsedSeconds } from "@/hooks/use-timing";
import type { ActionState, FormActionHandler } from "@/lib/action-state";
import { cn } from "@/lib/utils";

type FormContextValue = { pending: boolean; state: ActionState; register: (name: string) => () => void };
const FormContext = createContext<FormContextValue>({ pending: false, state: null, register: () => () => {} });

export type Confirmation = { title: string; description: string; action?: string; destructive?: boolean };

type ActionFormProps = Omit<ComponentProps<"form">, "action" | "onSubmit"> & {
  action: FormActionHandler;
  /** Gönderimden önce onay diyaloğu (geri alınamaz işlemler için). */
  confirm?: Confirmation;
  /** "inline" sonucu formun içinde, "toast" köşe bildiriminde gösterir (satır işlemleri, diyaloglar). */
  feedback?: "inline" | "toast";
  resetOnSuccess?: boolean;
  onSuccess?: (state: NonNullable<ActionState>) => void;
  /** Bir gönderim bittikten sonra yenisinin kabul edilmesi için geçmesi gereken süre (ms); çift tıklamayı yutar. */
  throttle?: number;
  children: ReactNode;
};

const unreachable: NonNullable<ActionState> = { ok: false, message: t.errors.unreachable, at: 0 };

/** Bağlantı içeren sonuçlar kullanıcı kapatana kadar kalır; kopyalama düğmesi taşır. */
export function notify(state: NonNullable<ActionState>) {
  const description = Object.values(state.fieldErrors ?? {}).join(" · ") || undefined;
  if (state.link) {
    const link = state.link;
    toast.warning(state.message, { duration: Infinity, description: link, action: { label: t.common.copyLink, onClick: () => { void navigator.clipboard.writeText(link); } } });
  } else if (state.ok) toast.success(state.message, { description });
  else toast.error(state.message, { description, duration: 10_000 });
}

/**
 * Server action'ı çağırır ve sonucu gösterir. Gönderim elle yapılır; böylece React hata sonrası formu
 * sıfırlamaz, girilen değerler kaybolmaz. Toast, işlemden sonra form ekrandan kalksa da gösterilir.
 */
export function ActionForm({ action, confirm, feedback = "inline", resetOnSuccess, onSuccess, throttle = 800, children, className, ref, ...props }: ActionFormProps) {
  const [state, setState] = useState<ActionState>(null);
  const [pending, startTransition] = useTransition();
  const [awaiting, setAwaiting] = useState<FormData | null>(null);
  const form = useRef<HTMLFormElement>(null);
  const [fields, setFields] = useState<ReadonlySet<string>>(() => new Set());
  // React durumu bir sonraki render'a kadar güncellenmez; aynı karede gelen ikinci tıklamayı ref yakalar.
  const inFlight = useRef(false);
  const lastFinished = useRef(0);

  // Kayıt sürerken sayfadan ayrılmak işlemi yarıda bırakabilir; tarayıcı uyarı gösterir.
  useEffect(() => {
    if (!pending) return;
    const warn = (event: BeforeUnloadEvent) => { event.preventDefault(); };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [pending]);

  useEffect(() => {
    const element = form.current;
    if (!element || !state) return;
    element.querySelectorAll("[aria-invalid]").forEach((field) => field.removeAttribute("aria-invalid"));
    for (const name of Object.keys(state.fieldErrors ?? {})) element.querySelector(`[name="${CSS.escape(name)}"]`)?.setAttribute("aria-invalid", "true");
    if (state.ok && resetOnSuccess) element.reset();
  }, [state, resetOnSuccess]);

  function send(data: FormData) {
    inFlight.current = true;
    startTransition(async () => {
      let result: ActionState;
      try {
        result = await action(state, data);
      } catch (error) {
        unstable_rethrow(error);
        result = { ...unreachable, at: Date.now() };
      } finally {
        inFlight.current = false;
        lastFinished.current = Date.now();
      }
      if (!result) return;
      if (feedback === "toast") notify(result);
      setState(result);
      if (result.ok) onSuccess?.(result);
    });
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending || inFlight.current || Date.now() - lastFinished.current < throttle) return;
    const data = new FormData(event.currentTarget, (event.nativeEvent as SubmitEvent).submitter);
    if (confirm) setAwaiting(data);
    else send(data);
  }

  // FormField'lar kendini kaydeder; özet bildiriminde yalnız alanı olmayan hatalar listelenir.
  const register = useCallback((name: string) => {
    setFields((current) => new Set(current).add(name));
    return () => setFields((current) => { const next = new Set(current); next.delete(name); return next; });
  }, []);

  // Satır menüleri gibi dış tetikleyiciler formu ref üzerinden requestSubmit() ile gönderir.
  const attach = (node: HTMLFormElement | null) => {
    form.current = node;
    if (typeof ref === "function") ref(node);
    else if (ref) ref.current = node;
  };

  return <form ref={attach} {...props} className={className} onSubmit={submit} aria-busy={pending}>
    <FormContext value={{ pending, state, register }}>
      {/* Gönderim sürerken alanlar kilitlenir; FormData gönderimden önce alındığı için değerler kaybolmaz. */}
      <fieldset disabled={pending} className="contents">{children}</fieldset>
      {feedback === "inline" && <Feedback state={state} renderedFields={fields}/>}
    </FormContext>
    {confirm && <AlertDialog open={awaiting !== null} onOpenChange={(open) => { if (!open) setAwaiting(null); }}>
      <AlertDialogContent>
        <AlertDialogHeader><AlertDialogTitle>{confirm.title}</AlertDialogTitle><AlertDialogDescription>{confirm.description}</AlertDialogDescription></AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{t.common.cancel}</AlertDialogCancel>
          <AlertDialogAction className={confirm.destructive ? "bg-destructive! text-white! hover:bg-destructive/90!" : undefined} onClick={() => { if (awaiting) send(awaiting); setAwaiting(null); }}>{confirm.action ?? t.common.continue}</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>}
  </form>;
}

export function useFormPending() { return useContext(FormContext).pending; }

/**
 * Gönderim başlar başlamaz kilitlenir; spinner yalnız işlem kısa sürmezse görünür (titreme olmaz).
 * Uzun süren işlemlerde geçen süre gösterilir.
 */
export function SubmitButton({ children, pendingLabel, ...props }: ComponentProps<typeof Button> & { pendingLabel?: string }) {
  const pending = useFormPending();
  const busy = useDelayedFlag(pending, 150, 400);
  const elapsed = useElapsedSeconds(pending);
  return <Button {...props} type="submit" disabled={pending || props.disabled} aria-busy={pending}>
    {busy && <Spinner data-icon="inline-start"/>}
    {busy ? pendingLabel ?? children : children}
    {busy && elapsed >= 5 && <span className="tabular-nums opacity-70">{t.common.secondsShort(elapsed)}</span>}
  </Button>;
}

/** Etiket, açıklama ve sunucudan dönen alan hatasını bir arada gösterir. */
export function FormField({ name, label, description, className, orientation, children }: { name: string; label?: ReactNode; description?: ReactNode; className?: string; orientation?: "vertical" | "horizontal"; children: ReactNode }) {
  const { state, register } = useContext(FormContext);
  const id = useId();
  useEffect(() => register(name), [name, register]);
  const error = state?.fieldErrors?.[name];
  const label_ = label && <FieldLabel htmlFor={`${id}-${name}`}>{label}</FieldLabel>;
  const help = <>
    {description && !error && <FieldDescription>{description}</FieldDescription>}
    {error && <FieldError>{error.replace(/^[^:]+: /, "")}</FieldError>}
  </>;
  // Yatay alanlarda (anahtar, onay kutusu) metin solda, denetim sağda durur.
  if (orientation === "horizontal") return <Field className={className} orientation="horizontal" data-invalid={error ? true : undefined}>
    <FieldContent>{label_}{help}</FieldContent>
    <FieldControl id={`${id}-${name}`}>{children}</FieldControl>
  </Field>;
  return <Field className={className} data-invalid={error ? true : undefined}>
    {label_}
    <FieldControl id={`${id}-${name}`}>{children}</FieldControl>
    {help}
  </Field>;
}

// Etiketin tıklanınca alana odaklanması için ilk denetime id verilir.
function FieldControl({ id, children }: { id: string; children: ReactNode }) {
  const wrapper = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const control = wrapper.current?.querySelector<HTMLElement>("input:not([type=hidden]),textarea,select,button[role=combobox]");
    if (control && !control.id) control.id = id;
  }, [id]);
  return <div ref={wrapper} className="contents">{children}</div>;
}

function Feedback({ state, renderedFields }: { state: ActionState; renderedFields: ReadonlySet<string> }) {
  const box = useRef<HTMLDivElement>(null);
  useEffect(() => { if (state && !state.ok) box.current?.scrollIntoView({ block: "nearest", behavior: "smooth" }); }, [state]);
  if (!state) return null;
  // Formda kendi alanı olan hatalar alanın altında gösterilir; burada yalnız kalanlar listelenir.
  const rest = Object.fromEntries(Object.entries(state.fieldErrors ?? {}).filter(([name]) => !renderedFields.has(name)));
  const Icon = state.ok ? CircleCheck : CircleAlert;
  return <div ref={box} role={state.ok ? "status" : "alert"} className={cn("flex gap-3 rounded-lg border px-4 py-3 text-sm", state.ok ? "border-success/30 bg-success/10 text-success" : "border-destructive/30 bg-destructive/10 text-destructive")}>
    <Icon className="mt-0.5 size-4 shrink-0"/>
    <div className="min-w-0 flex-1"><ActionMessage state={{ ...state, fieldErrors: rest }}/></div>
  </div>;
}
