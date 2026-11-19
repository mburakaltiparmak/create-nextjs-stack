import nextEnv from "@next/env";
const { loadEnvConfig } = nextEnv;

/**
 * Production için gereken ortam değişkenlerini denetler. Eksikleri listeler; `--strict` veya
 * VERCEL_ENV=production'da eksik varsa çıkış kodu 1 olur. Liste `required` dizisindedir — veri kaynağı ve
 * giriş yöntemi modülleri bu dosyayı kendi listeleriyle değiştirebilir (scripts/config-requirements.mjs).
 */
loadEnvConfig(process.cwd());
const { required, check } = await import("./config-requirements.mjs");

const placeholder = (value) => !value || /^(your[-_]|change-me$)/.test(value);
const has = (key) => !placeholder(process.env[key]?.trim() || process.env[`${key}_1`]?.trim());
const missing = required.filter((key) => !has(key));
const warnings = check ? check(has) : [];
if (missing.length) process.stdout.write(`Eksik yapılandırma (${missing.length}):\n${missing.map((key) => `- ${key}`).join("\n")}\n`);
else process.stdout.write("Tüm production değişkenleri tanımlı.\n");
for (const warning of warnings) process.stdout.write(`! ${warning}\n`);
if ((process.env.CRON_SECRET ?? "").trim().length > 0 && process.env.CRON_SECRET.trim().length < 32) process.stdout.write("CRON_SECRET en az 32 karakter olmalı.\n");
if (missing.length && (process.argv.includes("--strict") || process.env.VERCEL_ENV === "production")) process.exitCode = 1;
