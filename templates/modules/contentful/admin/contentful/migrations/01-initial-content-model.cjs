/**
 * İlk content model — Supabase varyantındaki tabloların birebir karşılığı.
 *
 * Alan ID'leri kasıtlı olarak snake_case'dir (featured_image_url, category_id):
 * Supabase sütun adlarıyla aynı kalır, böylece admin formu ve web bileşenleri
 * iki veri kaynağı arasında değişmeden çalışır.
 *
 * Çalıştırmak için:  npm run contentful:setup
 * Yeni bir migration eklerken bu dosyayı kopyalayıp 02-, 03- diye numaralandır.
 */

function createMigration(defaultLocale = 'en-US') {
  const localized = (value) => ({ [defaultLocale]: value });

  return function migrationFunction(migration) {
    // ─── categories ────────────────────────────────────────────────────────────
    const categories = migration
      .createContentType('categories')
      .name('Categories')
      .displayField('title')
      .description('Product categories');

    categories.createField('title').name('Title').type('Symbol').required(true);
    categories
      .createField('slug')
      .name('Slug')
      .type('Symbol')
      .required(true)
      .validations([{ unique: true }]);
    categories.createField('description').name('Description').type('Text');
    categories
      .createField('featured')
      .name('Featured')
      .type('Boolean')
      .defaultValue(localized(false));
    categories
      .createField('published')
      .name('Published')
      .type('Boolean')
      .defaultValue(localized(true));

    categories.changeFieldControl('slug', 'builtin', 'slugEditor');

    // ─── clients ───────────────────────────────────────────────────────────────
    const clients = migration
      .createContentType('clients')
      .name('Clients')
      .displayField('name')
      .description('Client / partner logos');

    clients.createField('name').name('Name').type('Symbol').required(true);
    clients
      .createField('logo_url')
      .name('Logo URL')
      .type('Symbol')
      .validations([{ regexp: { pattern: '^https?://' } }]);
    clients
      .createField('website')
      .name('Website')
      .type('Symbol')
      .validations([{ regexp: { pattern: '^https?://' } }]);

    // ─── products ──────────────────────────────────────────────────────────────
    const products = migration
      .createContentType('products')
      .name('Products')
      .displayField('title')
      .description('Product catalogue');

    products.createField('title').name('Title').type('Symbol').required(true);
    products
      .createField('slug')
      .name('Slug')
      .type('Symbol')
      .required(true)
      .validations([{ unique: true }]);
    products.createField('description').name('Description').type('Text');
    products
      .createField('body')
      .name('Body')
      .type('RichText')
      .description('Long-form content — edited here in Contentful, rendered by <RichText />');
    products
      .createField('featured_image_url')
      .name('Featured Image URL')
      .type('Symbol')
      .description('Uploaded through the admin panel (Cloudinary)');
    products
      .createField('category_id')
      .name('Category')
      .type('Link')
      .linkType('Entry')
      .validations([{ linkContentType: ['categories'] }]);
    products
      .createField('featured')
      .name('Featured')
      .type('Boolean')
      .defaultValue(localized(false));
    products
      .createField('published')
      .name('Published')
      .type('Boolean')
      .defaultValue(localized(true));

    products.changeFieldControl('slug', 'builtin', 'slugEditor');
    products.changeFieldControl('featured_image_url', 'builtin', 'urlEditor');

    // ─── projects ──────────────────────────────────────────────────────────────
    const projects = migration
      .createContentType('projects')
      .name('Projects')
      .displayField('title')
      .description('Case studies / reference projects');

    projects.createField('title').name('Title').type('Symbol').required(true);
    projects
      .createField('slug')
      .name('Slug')
      .type('Symbol')
      .required(true)
      .validations([{ unique: true }]);
    projects.createField('description').name('Description').type('Text');
    projects
      .createField('body')
      .name('Body')
      .type('RichText')
      .description('Long-form content — edited here in Contentful, rendered by <RichText />');
    projects
      .createField('client_id')
      .name('Client')
      .type('Link')
      .linkType('Entry')
      .validations([{ linkContentType: ['clients'] }]);
    projects
      .createField('featured_image_url')
      .name('Featured Image URL')
      .type('Symbol')
      .description('Uploaded through the admin panel (Cloudinary)');
    projects
      .createField('published')
      .name('Published')
      .type('Boolean')
      .defaultValue(localized(true));

    projects.changeFieldControl('slug', 'builtin', 'slugEditor');
    projects.changeFieldControl('featured_image_url', 'builtin', 'urlEditor');
  };
}

// contentful-migration CLI doğrudan bir migration fonksiyonu bekler.
module.exports = createMigration();
// setup.mjs space'in gerçek default locale'ini tespit edip buradan üretir.
module.exports.createMigration = createMigration;
