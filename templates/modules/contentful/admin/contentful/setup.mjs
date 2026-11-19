#!/usr/bin/env node
/**
 * Content model'i kurar / günceller: contentful/migrations/NN-*.cjs dosyalarını sırayla uygular.
 *
 *   npm run contentful:setup      eksik migration'ları uygular
 *   npm run contentful:seed       boş space'e örnek içerik
 *
 * Her contentful/migrations/NN-*.cjs sırayla ele alınır ve şunu dışa aktarır:
 *   { contentTypes, createMigration(defaultLocale), isApplied?(types), flag? }
 * Idempotent: `isApplied` doğruysa (yoksa: oluşturduğu içerik tiplerinin hepsi varsa) atlanır.
 * `flag` tanımlı migration'lar yalnız o bayrakla çalışır (geri alınamaz değişiklikler).
 *
 * Diller Contentful locale'i değil alandır (title, title_tr …); space'in varsayılan locale'i olduğu gibi
 * kullanılır — en-US değilse admin ve web .env'ine CONTENTFUL_LOCALE verin.
 *
 * .env: CONTENTFUL_SPACE_ID, CONTENTFUL_MANAGEMENT_TOKEN (CONTENTFUL_ENVIRONMENT isteğe bağlı). Node 22.9+.
 */

import { readdirSync } from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const here = path.dirname(fileURLToPath(import.meta.url));
const migrations = readdirSync(path.join(here, 'migrations'))
  .filter((file) => /^\d+-.+\.cjs$/.test(file))
  .sort()
  .map((file) => ({ file, ...require(path.join(here, 'migrations', file)) }));

const managementModule = await import('contentful-management');
const migrationModule = await import('contentful-migration');
const createClient = managementModule.createClient ?? managementModule.default?.createClient;
const runMigration = migrationModule.runMigration ?? migrationModule.default?.runMigration;

const read = (key) => process.env[key]?.trim() || process.env[`${key}_1`]?.trim();
const spaceId = read('CONTENTFUL_SPACE_ID');
const accessToken = read('CONTENTFUL_MANAGEMENT_TOKEN');
const environmentId = read('CONTENTFUL_ENVIRONMENT') || 'master';

function fail(message) {
  console.error(`\n  ✖ ${message}\n`);
  process.exit(1);
}

if (!spaceId || !accessToken || spaceId.startsWith('your')) {
  fail('CONTENTFUL_SPACE_ID and CONTENTFUL_MANAGEMENT_TOKEN must be set in .env (Node 22.9+)');
}

const client = createClient({ accessToken });
const space = await client.getSpace(spaceId);
const environment = await space.getEnvironment(environmentId);
const { items: locales } = await environment.getLocales();
const defaultLocale = locales.find((locale) => locale.default)?.code ?? 'en-US';

console.log(`\n  Contentful ${spaceId}/${environmentId} (default locale ${defaultLocale})\n`);

for (const migration of migrations) {
  if (migration.flag && !process.argv.includes(migration.flag)) {
    console.log(`  • ${migration.file}: needs ${migration.flag} — skipped`);
    continue;
  }
  const { items: types } = await environment.getContentTypes({ limit: 1000 });
  const existing = new Set(types.map((type) => type.sys.id));
  const present = migration.contentTypes.filter((id) => existing.has(id));
  const applied = migration.isApplied ? migration.isApplied(types) : present.length === migration.contentTypes.length;
  if (applied) {
    console.log(`  • ${migration.file}: already applied — skipped`);
    continue;
  }
  if (!migration.isApplied && present.length) fail(`${migration.file}: only some content types exist (${present.join(', ')}). Fix the space manually.`);
  await runMigration({ migrationFunction: migration.createMigration(defaultLocale), spaceId, environmentId, accessToken, yes: true });
  console.log(`  ✔ ${migration.file} applied`);
}

console.log(`\n  Done. Default locale: ${defaultLocale}${defaultLocale === 'en-US' ? '' : ' — set CONTENTFUL_LOCALE in admin and web .env'}. Next: npm run contentful:seed\n`);
