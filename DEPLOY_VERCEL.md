# Deploying Shop Track to Vercel

The project already contains `vercel.json`, so Vercel builds it with the correct
server preset (`NITRO_PRESET=vercel`) instead of the default Cloudflare target.

## 1. Push the code to GitHub

In Lovable, use the GitHub button (top right) to connect and push this project to a repository.

## 2. Import into Vercel

1. Go to vercel.com → **Add New → Project** → import the repo.
2. Leave the framework preset as **Other** — `vercel.json` supplies the build settings.
3. Build command: `npm run build` (already set)
4. Install command: `npm install` (already set)
5. Output: handled automatically (`.vercel/output`).

## 3. Environment variables

In Vercel → **Settings → Environment Variables**, add these for Production
(and Preview if you want preview deploys to work). Copy the values from the
project's `.env` file:

| Name | Value |
| --- | --- |
| `VITE_SUPABASE_URL` | from `.env` |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | from `.env` |
| `VITE_SUPABASE_PROJECT_ID` | from `.env` |

These are publishable keys, safe to expose in the browser bundle.

## 4. Deploy

Click **Deploy**. Every push to the default branch redeploys automatically.

## Notes

- The database stays on Lovable Cloud. The Vercel app just connects to it, so no
  data migration is required and both the Lovable and Vercel URLs read the same data.
- Local/Lovable builds are unaffected: `NITRO_PRESET` is only set inside Vercel's
  build environment, so Lovable keeps using its own target.
- If you later add auth with redirect URLs, add the Vercel domain to the allowed
  redirect URLs in the backend auth settings.
