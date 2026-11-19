/**
 * İçerik modeli: posts ve pages. Admin modeli (src/lib/models/site.ts) ile alan ID'leri birebir aynıdır.
 *
 * Diller Contentful locale'i değil ayrı alandır (title, title_tr …): space tek locale ile çalışır.
 * Çok dilli bir alan eklemek için alanı her dil için ayrı oluşturun ve modelde `localized: true` verin.
 *
 * Yeni bir içerik tipi: bu dosyayı kopyalayıp 03-…cjs diye numaralandırın, `contentTypes`'a ID'sini yazın
 * ve `npm run contentful:setup` çalıştırın (uygulanmış migration'lar atlanır).
 */

const SLUG = [{ unique: true }, { regexp: { pattern: '^[a-z0-9]+(?:-[a-z0-9]+)*$' } }];
const IMAGE = [{ linkMimetypeGroup: ['image'] }, { assetFileSize: { max: 5 * 1024 * 1024 } }];

function createMigration() {
  return function migrationFunction(migration) {
    const posts = migration.createContentType('posts').name('Posts').displayField('title').description('Blog posts — /blog/<slug>');
    posts.createField('title').name('Title').type('Symbol').required(true);
    posts.createField('slug').name('Slug').type('Symbol').required(true).validations(SLUG);
    posts.changeFieldControl('slug', 'builtin', 'slugEditor');
    posts.createField('excerpt').name('Excerpt').type('Text');
    posts.createField('body').name('Body (Markdown)').type('Text');
    posts.changeFieldControl('body', 'builtin', 'markdown');
    posts.createField('cover_image').name('Cover image').type('Link').linkType('Asset').validations(IMAGE);
    posts.createField('published_on').name('Published on').type('Date');

    const pages = migration.createContentType('pages').name('Pages').displayField('title').description('Stand-alone pages — /<slug>');
    pages.createField('title').name('Title').type('Symbol').required(true);
    pages.createField('slug').name('Slug').type('Symbol').required(true).validations(SLUG);
    pages.changeFieldControl('slug', 'builtin', 'slugEditor');
    pages.createField('body').name('Body (Markdown)').type('Text');
    pages.changeFieldControl('body', 'builtin', 'markdown');
    pages.createField('order').name('Menu order').type('Integer');
  };
}

module.exports = { contentTypes: ['posts', 'pages'], createMigration };
