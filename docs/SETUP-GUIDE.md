# Toolve Setup Guide

Follow the steps in order.

---

## Step 1: Install the tools

Install these on your computer:

1. **Node.js** (LTS version): <https://nodejs.org>
2. **Git**: <https://git-scm.com>
3. **VS Code**: <https://code.visualstudio.com>

---

## Step 2: Run the project

Open a terminal in the project folder and run:

```bash
npm install
npm run dev
```

Open <http://localhost:3000> in your browser. The site is running.

---

## Step 3: Create the database (Supabase)

1. Go to <https://supabase.com> and sign up.
2. Click **New project**.
3. Enter a name (for example `toolve`) and a database password. Save the password somewhere safe.
4. Click **Create new project** and wait about 2 minutes.
5. In the left menu, click **SQL Editor**, then **New query**.
6. Open the file `supabase/schema.sql` from the project, copy everything in it, and paste it into the editor.
7. Click **Run**.

The database is ready.

---

## Step 4: Get the two keys from Supabase

1. In Supabase, click **Project Settings** (the gear icon at the bottom left).
2. Copy the **Project URL** (it looks like `https://xxxx.supabase.co`).
3. Open **API Keys** and copy the **secret** key (or the **service_role** key).

⚠️ The secret key is private. Never share it or post it anywhere.

---

## Step 5: Add the keys on your computer

1. In the project folder, create a file named **`.env.local`**.
2. Paste this into it, using your own values:

```
SUPABASE_URL=https://xxxx.supabase.co  
SUPABASE_SERVICE_ROLE_KEY=your-secret-key
```

3. Save the file.
4. Stop `npm run dev` (Ctrl + C) and start it again.

---

## Step 6: Create your admin account

In the terminal, run this with your own email and name:

```bash
npm run admin:create -- you@example.com "Your Name"
```

Type a password when it asks.

Now go to <http://localhost:3000/dashboard> and sign in. Here you can write and publish blog posts.

---

## Step 7: Put the code on GitHub

1. Go to <https://github.com> and create a **New repository**.
2. In the terminal, run:

```bash
git add .
git commit -m "First version"
git branch -M main
git remote add origin https://github.com/YOUR-NAME/YOUR-REPO.git
git push -u origin main
```

Later, to send new changes, run only:

```bash
git add .
git commit -m "What I changed"
git push
```

---

## Step 8: Put the website online (Vercel)

1. Go to <https://vercel.com> and click **Sign Up**, then **Continue with GitHub**.
2. Click **Add New → Project**.
3. Pick your GitHub repository and click **Import**.
4. Open **Environment Variables** and add these three:

| Name | Value |
|---|---|
| `SUPABASE_URL` | your Project URL from Step 4 |
| `SUPABASE_SERVICE_ROLE_KEY` | your secret key from Step 4 |
| `NEXT_PUBLIC_SITE_URL` | `https://www.toolve.co` |

5. Click **Deploy** and wait 2–3 minutes.

The website is live. From now on, every `git push` updates it automatically.

> If you add or change a variable later, open **Deployments**, click **⋯** next to the latest deployment, then click **Redeploy**.

---

## Step 9: Connect the domain (toolve.co)

1. In Vercel, open your project, then **Settings → Domains**.
2. Type `toolve.co` and click **Add**.
3. Vercel shows a few DNS records. Add them where you bought the domain (Namecheap, GoDaddy, etc.).
4. Wait until Vercel shows **Valid Configuration**.

---

## Step 10: Google Search Console (with the real domain toolve.co)

Search Console tells Google your website exists. You prove to Google that you own **toolve.co** by adding one small record to the domain's settings.

### 10.1 Check the site is live first

Open these two links in your browser. Both must open (not show "page not found"):

- <https://www.toolve.co>
- <https://www.toolve.co/sitemap.xml>

If the sitemap doesn't open, run `git push` and wait for Vercel to finish deploying.

### 10.2 Add toolve.co to Google

1. Go to <https://search.google.com/search-console> and sign in with your Google account.
2. Click **Add property** (top left).
3. You will see two boxes. Use the **left** one, called **Domain**.
4. Type `toolve.co`. Don't include `https://` or `www`.
5. Click **Continue**.
6. Google shows a code like this:

   ```
   google-site-verification=AbCdEf123456...
   ```

   Click **Copy**. **Keep this page open.**

### 10.3 Find where your DNS is managed

DNS is the domain's settings page. It is in **one** of two places:

1. In Vercel, open **Domains** (top menu of your Vercel account) and click **toolve.co**.
2. Does it show a **DNS Records** section where you can add records?
   - **Yes:** your DNS is in **Vercel**. Follow **10.4 A**.
   - **No:** your DNS is at the company you bought the domain from. Follow **10.4 B**.

### 10.4 A: Add the code in Vercel

1. Vercel → **Domains** → **toolve.co** → **DNS Records**.
2. Fill in:
   - **Name:** leave it empty (or type `@`)
   - **Type:** `TXT`
   - **Value:** paste the code you copied
   - **TTL:** leave it as it is
3. Click **Add**.

### 10.4 B: Add the code where you bought the domain

1. Sign in to the company where you bought **toolve.co**.
2. Open your domains list, click **toolve.co**, and look for **DNS**, **Manage DNS** or **Advanced DNS**.
3. Click **Add record** (or **Add new record**).
4. Fill in:
   - **Type:** `TXT`
   - **Host / Name:** `@`
   - **Value / Content:** paste the code you copied
   - **TTL:** leave it as it is (Automatic)
5. Click **Save**.

Where to find it at common companies:

- **Namecheap:** Domain List → **Manage** → **Advanced DNS** → **Add New Record**
- **GoDaddy:** My Products → **DNS** → **Add New Record**
- **Hostinger:** Domains → **DNS / Nameservers** → **Add Record**
- **Cloudflare:** toolve.co → **DNS** → **Records** → **Add record**

### 10.5 Verify

1. Wait **10 minutes**. Sometimes it takes up to 1 hour.
2. Go back to the Google page you kept open and click **Verify**.
3. You should see **Ownership verified**. 🎉

If it says "not verified", wait a bit longer and click **Verify** again.

⚠️ Never delete this TXT record. If you delete it, Google removes your access.

### 10.6 Submit the sitemap

The sitemap is the list of all your pages. It updates by itself when you publish a blog post.

1. In Search Console, make sure **toolve.co** is selected at the top left.
2. In the left menu, click **Sitemaps**.
3. In the **Add a new sitemap** box, type `https://www.toolve.co/sitemap.xml`.
4. Click **Submit**.
5. The status should show **Success**. If it shows "Couldn't fetch", wait one day. That is normal for new sites.

### 10.7 Ask Google to add the home page

1. Click the search bar at the very top of Search Console.
2. Paste `https://www.toolve.co` and press **Enter**.
3. Click **Request indexing** and wait about a minute.

Do the same for each new blog post after you publish it, for example `https://www.toolve.co/blogs/your-post-name`.

### 10.8 After that

- Google usually starts showing toolve.co in **1–2 weeks**.
- Open **Performance** in the left menu to see which searches show your site and how many people click.
- Open **Pages** to see which pages Google has added.
- To check whether Google has added your site, search `site:toolve.co` on Google.

---

## About SEO

SEO is already built into the website. You don't need to set anything up.

The only SEO work is for each blog post: when you write it in the dashboard, fill in the **SEO** box on the right. It holds the SEO title, the meta description, keywords and the share image.

---

## Fix: "Run migration 002" error when saving a blog post

**What it means:** your database is missing 3 new columns, so the site can't save the article, FAQ and SEO. This only happens if the database was created **before** the rich text editor and SEO fields were added. You only do this fix **once**.

1. Go to <https://supabase.com> and open your **toolve** project.
2. In the left menu, click **SQL Editor**.
3. Click **New query**.
4. Copy and paste this:

```sql
alter table blog_posts add column if not exists content_html text;
alter table blog_posts add column if not exists faq jsonb;
alter table blog_posts add column if not exists seo jsonb not null default '{}';
notify pgrst, 'reload schema';
```

5. Click **Run**. It should say **Success. No rows returned**.
6. Go back to the dashboard and click **Save** on your post again.

This is the same code as the file `supabase/migrations/002_rich_text_and_seo.sql` in the project.

- Your existing posts and admin accounts **stay safe**. It only adds the new columns.
- Running it twice is **harmless**.
- A **brand-new** database made with Step 3 does **not** need this, because `schema.sql` already has these columns.

---

## If something goes wrong

- **The live site didn't change:** you forgot `git push`.
- **A new Vercel variable isn't working:** you need to **Redeploy** (see Step 8).
- **You can't sign in to the dashboard:** run Step 6 again. It also resets the password.
- **Saving a post shows an error about "migration 002":** in Supabase **SQL Editor**, run the file `supabase/migrations/002_rich_text_and_seo.sql`. Full steps are in the section **Fix: "Run migration 002" error** above.
