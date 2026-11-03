# Toolve – Image Compressor

A Next.js site that compresses JPG, PNG and WebP images entirely in the browser. Built from the Figma file "Product" (node 1:2).

## Run it

```bash
npm install
npm run dev        # http://localhost:3000
npm run build && npm start   # production
npm run lint
```

## Admin dashboard (blog)

`/dashboard` (the admin dashboard) lets admins write, edit, publish, unpublish and delete blog posts, upload their images, and manage admin accounts. Posts are stored in Supabase (Postgres + Storage). Without the database connected, the site shows the built-in posts from `src/content/blogs.ts`.

1. Create a free project at [supabase.com](https://supabase.com).
2. In **SQL Editor**, run [`supabase/schema.sql`](supabase/schema.sql). It creates the tables and the public `blog-images` storage bucket.
3. Copy `.env.example` to `.env.local` and fill in `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` (**Project Settings → API**). Add the same two variables on your host (e.g. Vercel → Settings → Environment Variables). The service-role key is a secret: never expose it to the browser.
4. Create the first admin: `npm run admin:create -- you@example.com "Your Name"` (asks for a password).
5. Restart `npm run dev`, sign in at `/dashboard/login`, and click **Import the 3 existing posts** to move the current posts into the database. The public blog then shows only published database posts.

Saving in the dashboard updates the public pages straight away (no rebuild). Article bodies use simple Markdown (`##` headings, `-` lists, `**bold**`, `[links](/path)`, and a `:::faq` block); the editor has a preview and a formatting guide. Images can be up to 4 MB.

## How compression works

- Images are decoded with `createImageBitmap` and re-encoded on a canvas inside a Web Worker (`OffscreenCanvas`), falling back to the main thread in older browsers. Nothing is uploaded.
- **JPG / WebP:** re-encoded at the chosen quality (default 80).
- **PNG:** the colour palette is reduced with `upng-js` and transparency is kept. Quality 100 re-saves the PNG losslessly.
- Every image keeps its format and its pixel dimensions. If the result isn't smaller than the original, the original file is kept and the image is labelled "Already optimized".
- Limits: 100 images per batch, 50 MB per image, 100 megapixels per image (`src/lib/compression/limits.ts`).

## Project structure

```
src/
  app/                     routes: / , /blogs , /blogs/[slug] , /dashboard (admin), 404, icon
  components/
    layout/                header, footer, logo
    compressor/            drop zone, image grid/tiles, comparison slider, size summary,
                           advanced options, completion (thank-you) panel
    home/                  how it works, privacy, FAQ, feature highlights
    blog/                  blog card, carousel, guides section, article renderer
    ui/                    shared heading, rating badge, FAQ accordion, brand icons, button styles
  lib/
    compression/           encoder, worker, worker client, limits, state hook
    download.ts, format.ts
  content/                 blog posts and FAQ copy
  config/site.ts           links, social profiles, feedback email, rating
  assets/blog/             images exported from the Figma file
```

## Forms (Login, Sign Up, Contact)

`/login`, `/signup` and the form on `/contact` are complete on the front end. Each one submits to a server action in `src/lib/forms/actions.ts`, which validates every field on the server and returns per-field errors.

The database isn't connected yet. Each action has a `CONNECT YOUR BACKEND HERE` comment: save the data or verify the user there, then return `{ status: "success", message }` or `redirect("/")`. Until then, valid submissions show "…isn't available yet" and never claim success.

## Configuration (`src/config/site.ts`)

Links shown in the design that have no destination yet are `null` and stay hidden until you set them:

- `account.login` / `account.signUp`: there is no account system.
- `mainNav` "About" and the footer Company/Legal links.
- `social`: profile URLs for the footer icons and the "Follow us for updates" card.
- `FEEDBACK_EMAIL`: turns on the "How was your experience?" form, "Give Suggestions" and footer "Feedback". These open the visitor's email app.
- `rating`: the 4.8/5 (3,480) figure comes from the design. Replace it with real numbers.

Set `NEXT_PUBLIC_SITE_URL` in production so social preview images get absolute URLs.
