#!/usr/bin/env node
/**
 * Boş bir space'e örnek içerik yükler (bir yayında yazı, bir taslak yazı, iki sayfa).
 *
 *   npm run contentful:setup   →   npm run contentful:seed
 *
 * Idempotent: bir içerik tipinde kayıt varsa o tip atlanır.
 */

const managementModule = await import('contentful-management');
const createClient = managementModule.createClient ?? managementModule.default?.createClient;

const read = (key) => process.env[key]?.trim() || process.env[`${key}_1`]?.trim();
const spaceId = read('CONTENTFUL_SPACE_ID');
const accessToken = read('CONTENTFUL_MANAGEMENT_TOKEN');
const environmentId = read('CONTENTFUL_ENVIRONMENT') || 'master';

function fail(message) {
  console.error(`\n  ✖ ${message}\n`);
  process.exit(1);
}

if (!spaceId || !accessToken || spaceId.startsWith('your')) fail('CONTENTFUL_SPACE_ID and CONTENTFUL_MANAGEMENT_TOKEN must be set in .env');

const client = createClient({ accessToken });
const environment = await (await client.getSpace(spaceId)).getEnvironment(environmentId);
const locale = (await environment.getLocales()).items.find((item) => item.default)?.code ?? 'en-US';
const today = new Date().toISOString().slice(0, 10);

// published: false → taslak olarak kalır.
const CONTENT = {
  posts: [
    { title: 'Hello world', slug: 'hello-world', excerpt: 'The first post on the new site.', body: '## Welcome\n\nThis post was created by the seed script. Edit it in the admin panel.', published_on: today },
    { title: 'A draft post', slug: 'a-draft-post', excerpt: 'Drafts are only visible in the admin and in preview.', body: 'Publish me from the admin panel.', published: false },
  ],
  pages: [
    { title: 'About', slug: 'about', body: '## About us\n\nTell your story here.', order: 1 },
    { title: 'Privacy', slug: 'privacy', body: '## Privacy policy\n\nDescribe how you handle personal data.', order: 2 },
  ],
};

console.log(`\n  Seeding ${spaceId}/${environmentId} (locale ${locale})...\n`);

for (const [contentType, rows] of Object.entries(CONTENT)) {
  const existing = await environment.getEntries({ content_type: contentType, limit: 1 });
  if (existing.total > 0) {
    console.log(`  • ${contentType}: ${existing.total} entries exist — skipped`);
    continue;
  }
  for (const { published, ...row } of rows) {
    const fields = Object.fromEntries(Object.entries(row).map(([key, value]) => [key, { [locale]: value }]));
    const entry = await environment.createEntry(contentType, { fields });
    if (published !== false) await entry.publish();
  }
  console.log(`  ✔ ${contentType}: ${rows.length} entries`);
}

console.log('\n  ✔ Seed complete.\n');
