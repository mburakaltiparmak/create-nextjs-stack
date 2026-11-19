#!/usr/bin/env node
/**
 * Uçtan uca şablon testi: her seçim kombinasyonu için proje üretir, bağımlılıkları kurar ve
 * typecheck + lint + test + production build çalıştırır.
 *
 *   npm run test:e2e                      tüm kombinasyonlar
 *   npm run test:e2e -- admin:contentful:auth0:en web:supabase   yalnız verilenler
 *
 * Kombinasyon biçimi: <web|admin>:<cms>[:<auth>:<lang>]. Ortam değişkenleri temizlenir (yalnız PATH/HOME…),
 * böylece kabuğunuzdaki gerçek anahtarlar build'e sızmaz; projeler .env.example'daki yer tutucularla derlenir.
 */
import { execFileSync } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const cli = path.join(root, "bin", "cli.js");

export const COMBINATIONS = [
  "admin:supabase:credentials:en",
  "admin:supabase:auth0:en",
  "admin:supabase:supabase:en",
  "admin:contentful:credentials:en",
  "admin:contentful:auth0:en",
  "admin:contentful:credentials:tr",
  "admin:supabase:auth0:tr",
  "web:supabase",
  "web:contentful",
];

const selected = process.argv.slice(2).filter((arg) => !arg.startsWith("-"));
const combos = selected.length ? selected : COMBINATIONS;

const cleanEnv = Object.fromEntries(["PATH", "HOME", "TMPDIR", "SHELL", "USER", "LANG", "npm_config_cache"].filter((key) => process.env[key]).map((key) => [key, process.env[key]]));
const run = (command, args, cwd, env = cleanEnv) => execFileSync(command, args, { cwd, env, stdio: "inherit" });

const workdir = mkdtempSync(path.join(tmpdir(), "cns-e2e-"));
const failures = [];

for (const combo of combos) {
  const [template, cms, auth = "credentials", lang = "en"] = combo.split(":");
  const name = combo.replaceAll(":", "-");
  const dir = path.join(workdir, name);
  console.log(`\n━━━ ${combo} ━━━`);
  try {
    const args = [cli, dir, "--template", template, "--cms", cms];
    if (template !== "web") args.push("--auth", auth, "--lang", lang);
    run("node", args, workdir, { ...cleanEnv, NODE_ENV: "test" });
    run("npm", ["install", "--no-audit", "--no-fund", "--loglevel=error"], dir);
    run("npm", ["run", "typecheck"], dir);
    run("npx", ["eslint", "--max-warnings=0"], dir);
    run("npm", ["test"], dir);
    run("npm", ["run", "build"], dir, { ...cleanEnv, NEXT_TELEMETRY_DISABLED: "1" });
    console.log(`✔ ${combo}`);
  } catch {
    failures.push(combo);
    console.error(`✖ ${combo}`);
  }
}

if (!process.argv.includes("--keep")) rmSync(workdir, { recursive: true, force: true });
else console.log(`\nProjects kept in ${workdir}`);

console.log(failures.length ? `\n✖ ${failures.length}/${combos.length} failed: ${failures.join(", ")}` : `\n✔ All ${combos.length} combinations passed`);
process.exitCode = failures.length ? 1 : 0;
