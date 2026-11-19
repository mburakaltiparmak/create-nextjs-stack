-- Örnek içerik (isteğe bağlı). schema.sql'den sonra çalıştırın; tekrar çalıştırmak çoğaltmaz.
insert into public.posts (title, slug, excerpt, body, published_on, status) values
  ('Hello world', 'hello-world', 'The first post on the new site.', E'## Welcome\n\nThis post was created by the seed script. Edit it in the admin panel.', current_date, 'published'),
  ('A draft post', 'a-draft-post', 'Drafts are only visible in the admin and in preview.', E'Publish me from the admin panel.', null, 'draft')
on conflict (slug) do nothing;

insert into public.pages (title, slug, body, "order", status) values
  ('About', 'about', E'## About us\n\nTell your story here.', 1, 'published'),
  ('Privacy', 'privacy', E'## Privacy policy\n\nDescribe how you handle personal data.', 2, 'published')
on conflict (slug) do nothing;

insert into public.site_settings (id) values ('site') on conflict (id) do nothing;
