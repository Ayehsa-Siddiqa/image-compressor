-- Rich text articles, a separate FAQ section, and per-post SEO settings.
-- Run once in the Supabase SQL editor if you created the tables before this file existed.
-- (supabase/schema.sql already includes these columns for new projects.)

alter table blog_posts add column if not exists content_html text;
-- { "title": "...", "subtitle": "...", "items": [{ "question": "...", "answer": "..." }] }
alter table blog_posts add column if not exists faq jsonb;
-- { "title", "description", "keywords": [], "canonical", "ogImage": { src, width, height }, "noindex": false }
alter table blog_posts add column if not exists seo jsonb not null default '{}';

-- Make PostgREST (used by the app) see the new columns straight away.
notify pgrst, 'reload schema';
