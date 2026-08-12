#!/usr/bin/env node
/**
 * Contentful'daki content model'den TypeScript tipleri üretir.
 *
 *   npm run contentful:types   → src/lib/contentful/generated/
 *
 * Elle yazılmış düz satır tipleri src/lib/contentful/types.ts içinde durur;
 * bu script ham Contentful entry şekillerini (sys + locale'li fields) üretir.
 * İkisi bir arada kullanılır: servis katmanı ham tipi düzleştirilmişe çevirir.
 *
 * Gerekli .env değişkenleri:
 *   CONTENTFUL_SPACE_ID
 *   CONTENTFUL_MANAGEMENT_TOKEN
 *   CONTENTFUL_ENVIRONMENT (opsiyonel, varsayılan: master)
 */

import { spawnSync } from 'node:child_process';

const spaceId = process.env.CONTENTFUL_SPACE_ID;
const token = process.env.CONTENTFUL_MANAGEMENT_TOKEN;
const environment = process.env.CONTENTFUL_ENVIRONMENT || 'master';
const outDir = 'src/lib/contentful/generated';

if (!spaceId || !token) {
  console.error(
    '\n  ✖ CONTENTFUL_SPACE_ID and CONTENTFUL_MANAGEMENT_TOKEN must be set in .env\n',
  );
  process.exit(1);
}

console.log(`\n  Generating types from ${spaceId}/${environment} → ${outDir}\n`);

const result = spawnSync(
  'npx',
  [
    '--no-install',
    'cf-content-types-generator',
    '--spaceId', spaceId,
    '--token', token,
    '--environment', environment,
    '--out', outDir,
    '--v10',
  ],
  { stdio: 'inherit', shell: process.platform === 'win32' },
);

if (result.status !== 0) {
  console.error('\n  ✖ Type generation failed.\n');
  process.exit(result.status ?? 1);
}

console.log('\n  ✔ Types generated.\n');
