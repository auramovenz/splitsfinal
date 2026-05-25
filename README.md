# Auramove Swim Split Calculator

A React web app for swimmers and coaches to calculate race splits, pacing, and lap breakdowns across all standard pool events.

Built for [auramovenz.com](https://auramovenz.com).

---

## What it does

- Select any standard swim event (Freestyle, Backstroke, Breaststroke, Butterfly, IM) in 25m or 50m pools
- Enter a target time to see front-half / back-half splits
- Shows negative/positive/even split badge and difference in seconds
- Lap-by-lap breakdown with per-lap pace
- IM leg time estimates
- Pace stats (per 100m, per 50m)
- Mobile-friendly, dark navy UI

---

## Project structure

```
auramove-splits/
├── public/
│   └── index.html        # HTML shell
├── src/
│   ├── App.jsx           # All app logic and UI (single-file React component)
│   └── index.js          # React entry point
├── package.json          # Dependencies and build scripts
└── README.md             # This file
```

---

## Tech stack

- **React 18** (Create React App)
- **No external UI libraries** — all styles are inline
- **No backend / API** — fully static, runs in the browser

---

## Deploying to Vercel (step-by-step)

This app deploys to Vercel with zero configuration needed.

### 1. Push to GitHub

1. Go to [github.com](https://github.com) and create a new repository (e.g. `auramove-splits`)
2. Upload all files from this folder into that repository (drag-and-drop via the GitHub web UI works fine)
3. Make sure the `package.json` and `src/` folder are at the **root** of the repository — not inside a subfolder

### 2. Deploy on Vercel

1. Go to [vercel.com](https://vercel.com) and sign in with your GitHub account
2. Click **Add New → Project**
3. Select your `auramove-splits` repository
4. Vercel will auto-detect it as a Create React App project
5. Leave all settings as default — no changes needed
6. Click **Deploy**

Vercel gives you a live URL (e.g. `auramove-splits.vercel.app`) within about 60 seconds.

### 3. Embed in Squarespace

Once deployed, embed the app in any Squarespace page using a **Code Block**:

```html
<iframe
  src="https://your-vercel-url.vercel.app"
  width="100%"
  height="800"
  style="border:none; border-radius:12px;"
  title="Swim Split Calculator"
></iframe>
```

Replace `your-vercel-url.vercel.app` with your actual Vercel URL.

**Squarespace steps:**
1. Edit the page where you want the calculator
2. Add a block → choose **Code**
3. Paste the iframe code above
4. Adjust `height` if needed (800px works well on desktop)

---

## Re-deploying after changes

Every time you push a new commit to GitHub, Vercel automatically rebuilds and redeploys. No manual steps needed.

---

## Local development (optional)

If you ever want to run this on your own computer:

```bash
npm install
npm start
```

Then open [http://localhost:3000](http://localhost:3000).

To build a production version:

```bash
npm run build
```

