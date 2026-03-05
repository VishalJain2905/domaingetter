# Deploying the Bookmarklet (Render, Vercel, Netlify)

Deploying gives you an **HTTPS URL** for the loader and `bookmarklet-core.js`, so the bookmarklet works on strict sites like Netflix (they block `http://localhost`).

---

## Render (recommended)

1. **Push the repo** to GitHub/GitLab/Bitbucket if you haven’t already.

2. **Create a Static Site on Render**
   - Go to [dashboard.render.com](https://dashboard.render.com) → **New** → **Static Site**
   - Connect your repo and pick the branch to deploy from.

3. **Configure the build**
   - **Name:** e.g. `bookmarklet-system`
   - **Build command:** `npm install && npm run build:static`
   - **Publish directory:** `public`

4. **Deploy**
   - Click **Create Static Site**. Render will run the build and publish the `public` folder.
   - After deploy you’ll get a URL like `https://bookmarklet-system.onrender.com`.

5. **Use the bookmarklet**
   - Open **https://your-app-name.onrender.com/install.html**
   - Drag **“Domain Bookmarklet (loader)”** to your bookmarks bar. The install page will point the loader at your Render URL, so it will fetch the core from HTTPS.
   - Use the bookmark on Netflix, YouTube, etc.; it will load the script from your Render site.

No environment variables are required: the install page uses the current origin so the loader always points at your deployed URL.

---

## Vercel

1. Install Vercel CLI (optional): `npm i -g vercel`
2. Build static files: `npm run build:static`
3. Deploy: from the project root run `vercel` and follow the prompts, or connect the repo in the Vercel dashboard.
4. Set **Output Directory** to `public` (or use the config below).

**vercel.json** (optional, in project root):

```json
{
  "buildCommand": "npm run build:static",
  "outputDirectory": "public"
}
```

Then open `https://your-project.vercel.app/install.html` and use the loader link.

---

## Netlify

1. Connect the repo in the [Netlify dashboard](https://app.netlify.com).
2. **Build command:** `npm run build:static`
3. **Publish directory:** `public`
4. Deploy. Then use `https://your-site.netlify.com/install.html` and drag the loader to your bookmarks bar.

---

## What gets deployed

- **install.html** – Install page; use this to add the loader bookmark.
- **build/** – `bookmarklet.js`, `bookmarklet-core.js`, `bookmarklet-loader.js`.
- **test/** – Demo page at `/test/` for testing without real sites.

The loader fetches `bookmarklet-core.js` from your deployed origin, so it works on HTTPS-only sites (e.g. Netflix) and avoids CORS issues when the deploy is on HTTPS.
