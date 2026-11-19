/** Server action ile istemci formu arasında taşınan sonuç. `at` aynı mesajın tekrar gösterilmesini sağlar. */
export type ActionState = {
  ok: boolean;
  message: string;
  fieldErrors?: Record<string, string>;
  /** Kullanıcıya elle iletilmesi gereken bağlantı (ör. e-postası gönderilemeyen davet). */
  link?: string;
  at: number;
} | null;

export type FormActionHandler = (state: ActionState, formData: FormData) => Promise<ActionState>;
