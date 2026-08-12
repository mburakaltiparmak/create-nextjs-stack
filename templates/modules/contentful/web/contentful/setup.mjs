#!/usr/bin/env node
/**
 * Boş bir Contentful space'inde content model'i tek komutla kurar.
 *
 *   npm run contentful:setup
 *
 * Gerekli .env değişkenleri:
 *   CONTENTFUL_SPACE_ID
 *   CONTENTFUL_MANAGEMENT_TOKEN   (Settings → API keys → Content management tokens)
 *   CONTENTFUL_ENVIRONMENT        (opsiyonel, varsayılan: master)
 *
 * Script idempotent DEĞİLDİR: content type'lar zaten varsa Contentful hata döner.
 * Model değişikliği için migrations/ altına yeni bir dosya ekleyip çalıştır.
 */

import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const here = path.dirname(fileURLToPath(import.meta.url));

const { createMigration } = require(
  path.join(here, 'migrations', '01-initial-content-model.cjs'),
);

// contentful-management / contentful-migration hem CJS hem ESM dağıtıyor;
// hangi biçimde geldiğinden bağımsız çalışsın.
const managementModule = await import('contentful-management');
const migrationModule = await import('contentful-migration');

const createClient =
  managementModule.createClient ?? managementModule.default?.createClient;
const runMigration =
  migrationModule.runMigration ?? migrationModule.default?.runMigration;

const spaceId = process.env.CONTENTFUL_SPACE_ID;
const accessToken = process.env.CONTENTFUL_MANAGEMENT_TOKEN;
const environmentId = process.env.CONTENTFUL_ENVIRONMENT || 'master';

function fail(message) {
  console.error(`\n  ✖ ${message}\n`);
  process.exit(1);
}

if (!spaceId || !accessToken) {
  fail(
    'CONTENTFUL_SPACE_ID and CONTENTFUL_MANAGEMENT_TOKEN must be set in .env\n' +
      '    (this script is run with `node --env-file=.env`, which needs Node 20.6+)',
  );
}

console.log(`\n  Setting up content model in ${spaceId}/${environmentId}...\n`);

const client = createClient({ accessToken });
const space = await client.getSpace(spaceId);
const environment = await space.getEnvironment(environmentId);

const locales = await environment.getLocales();
const defaultLocale = locales.items.find((locale) => locale.default)?.code ?? 'en-US';

console.log(`  Default locale: ${defaultLocale}`);

await runMigration({
  migrationFunction: createMigration(defaultLocale),
  spaceId,
  environmentId,
  accessToken,
  yes: true,
});

console.log('\n  ✔ Content model created.\n');
console.log('  Next: add some entries in Contentful, then run `npm run dev`.\n');
