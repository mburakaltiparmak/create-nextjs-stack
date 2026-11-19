/**
 * İletişim formu talepleri ve site ayarları.
 *
 *   lead          Web sitesi (/api/contact) yazar, admin "Talepler" ekranında yönetir. Asla yayınlanmaz;
 *                 Delivery API talepleri hiç döndürmez.
 *   siteSettings  Tekil kayıt (entry ID "siteSettings"): talep saklama süresi.
 */

function createMigration() {
  return function migrationFunction(migration) {
    const lead = migration.createContentType('lead').name('Lead').displayField('name').description('Contact form submission — never published');
    lead.createField('submission_id').name('Submission ID').type('Symbol').required(true).validations([{ unique: true }]);
    lead.createField('name').name('Name').type('Symbol').required(true);
    lead.createField('company').name('Company').type('Symbol');
    lead.createField('email').name('Email').type('Symbol').required(true);
    lead.createField('phone').name('Phone').type('Symbol');
    lead.createField('subject').name('Subject').type('Symbol');
    lead.createField('message').name('Message').type('Text').required(true);
    lead.createField('locale').name('Site language').type('Symbol');
    lead.createField('consent').name('Privacy notice acknowledged').type('Boolean');
    lead.createField('submitted_at').name('Submitted at').type('Date').required(true);
    lead.createField('status').name('Status').type('Symbol').required(true).validations([{ in: ['new', 'contacted', 'closed'] }]);
    lead.createField('notification_status').name('Email notification').type('Symbol').validations([{ in: ['pending', 'sent', 'failed', 'skipped'] }]);
    lead.createField('internal_note').name('Internal note').type('Text');

    const settings = migration.createContentType('siteSettings').name('Site settings').displayField('internal_name').description('Singleton (entry ID "siteSettings") — managed from the admin');
    settings.createField('internal_name').name('Internal name').type('Symbol').required(true);
    settings.createField('lead_retention_days').name('Lead retention (days)').type('Integer').validations([{ range: { min: 1, max: 3650 } }]);
  };
}

module.exports = { contentTypes: ['lead', 'siteSettings'], createMigration };
