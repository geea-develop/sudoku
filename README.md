# 🎮 Web Game Template

A Next.js starter template for simple web games — mobile-first, deployed to GitHub Pages.

## What's Included

- **Next.js 15** + React 19 + TypeScript + Tailwind CSS
- **Static export** to GitHub Pages (zero server needed)
- **GitHub Actions** CI/CD — push to main and it deploys
- **Mobile-first** — viewport locked, no scroll, touch-optimized
- **PWA-ready** — manifest.json + icons (replace with your own)
- **No-cache headers** — users always see the latest
- **Build tag** — shows git hash at the bottom
- **Sound effects** — Web Audio API helper (`lib/sound.ts`)
- **Haptic feedback** — Vibration API helper (`lib/haptic.ts`)

## Quick Start

```bash
# 1. Use this template (click "Use this template" on GitHub)
# 2. Clone your new repo
git clone git@github.com:YOUR_USER/YOUR_GAME.git
cd YOUR_GAME

# 3. Install & run
npm install
npm run dev
```

## Setup GitHub Pages

1. Go to your repo → Settings → Pages
2. Set Source to **GitHub Actions**
3. Push to `main` — it deploys automatically

## Project Structure

```
app/
  layout.tsx    — root layout (meta, PWA, no-cache)
  page.tsx      — your game goes here
  globals.css   — Tailwind + body styles
lib/
  sound.ts      — playTone(), playAscending(), playDescending()
  haptic.ts     — hapticTap(), hapticMedium(), hapticDouble(), hapticCelebration()
public/
  manifest.json — PWA manifest (edit name/colors)
  icon-192.png  — replace with your icon
  icon-512.png  — replace with your icon
```

## Customize

1. Edit `app/page.tsx` — build your game
2. Edit `app/layout.tsx` — change title/description
3. Edit `public/manifest.json` — change app name
4. Replace `public/icon-*.png` — your app icon

## License

[MIT](LICENSE)
