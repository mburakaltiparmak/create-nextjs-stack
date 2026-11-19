import { z } from "zod";

/** İletişim formu — tarayıcıda ve /api/contact'ta aynı şema. */
export const contactSchema = z.object({
  name: z.string().trim().min(2, "Please enter your name.").max(100),
  email: z.string().trim().email("Please enter a valid email address.").max(200),
  company: z.string().trim().max(150).optional().or(z.literal("")),
  phone: z.string().trim().max(50).optional().or(z.literal("")),
  subject: z.string().trim().max(150).optional().or(z.literal("")),
  message: z.string().trim().min(10, "Please write at least 10 characters.").max(5000),
  privacy: z.literal(true, { errorMap: () => ({ message: "Please accept the privacy notice." }) }),
  /** Honeypot — insanlar görmez; doluysa istek sessizce kabul edilir ama hiçbir şey kaydedilmez. */
  website: z.string().max(500).optional(),
  locale: z.string().trim().max(10).default("en"),
});

export type ContactInput = z.infer<typeof contactSchema>;
