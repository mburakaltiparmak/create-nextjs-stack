import { createClient, type Environment } from "contentful-management";

const SPACE_ID = process.env.CONTENTFUL_SPACE_ID;
const ENVIRONMENT_ID = process.env.CONTENTFUL_ENVIRONMENT || "master";
const MANAGEMENT_TOKEN = process.env.CONTENTFUL_MANAGEMENT_TOKEN;

let environmentPromise: Promise<Environment> | null = null;
let defaultLocalePromise: Promise<string> | null = null;

function requireEnv(name: string, value: string | undefined): string {
  if (!value) {
    throw new Error(
      `[Contentful] Missing environment variable: ${name}. Check your .env file.`,
    );
  }
  return value;
}

/**
 * Content Management API environment'ı. Admin paneli okuma ve yazma işlerinin
 * tamamını buradan yapar — böylece taslak kayıtlar da listede görünür.
 *
 * Bağlantı modül seviyesinde cache'lenir; her istekte yeniden kurulmaz.
 */
export function getEnvironment(): Promise<Environment> {
  if (!environmentPromise) {
    environmentPromise = (async () => {
      const client = createClient({
        accessToken: requireEnv("CONTENTFUL_MANAGEMENT_TOKEN", MANAGEMENT_TOKEN),
      });
      const space = await client.getSpace(requireEnv("CONTENTFUL_SPACE_ID", SPACE_ID));
      return space.getEnvironment(ENVIRONMENT_ID);
    })().catch((error) => {
      // Hatalı promise'i cache'te bırakma — sonraki istek yeniden denesin.
      environmentPromise = null;
      throw error;
    });
  }

  return environmentPromise;
}

/**
 * Contentful alanları locale ile anahtarlanır ({ title: { "en-US": "..." } }).
 * Bu template tek dilli olduğu için her yerde space'in default locale'i kullanılır.
 */
export function getDefaultLocale(): Promise<string> {
  if (!defaultLocalePromise) {
    defaultLocalePromise = (async () => {
      const environment = await getEnvironment();
      const locales = await environment.getLocales();
      return locales.items.find((locale) => locale.default)?.code ?? "en-US";
    })().catch((error) => {
      defaultLocalePromise = null;
      throw error;
    });
  }

  return defaultLocalePromise;
}

/**
 * Contentful CMA hataları iç içe JSON döndürür; forma taşınabilir tek satıra indirger.
 */
export function describeError(error: unknown, fallback: string): string {
  if (!error) return fallback;

  const message = (error as Error)?.message;
  if (!message) return fallback;

  // CMA hataları message alanında JSON string taşır.
  try {
    const parsed = JSON.parse(message);
    const details = parsed?.details?.errors?.[0];
    if (details?.name === "unique") {
      return `A record with this ${details.path?.[1] ?? "value"} already exists.`;
    }
    if (details?.details) return details.details;
    if (parsed?.message) return parsed.message;
  } catch {
    // JSON değilse düz mesajı kullan.
  }

  return message;
}
