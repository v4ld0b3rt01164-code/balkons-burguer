# Balkon's Burguer — AGENTS.md

## Stack
- Vite 6 + vanilla HTML/CSS/JS → pure static site
- Deployed to Cloudflare Pages (free tier) via `wrangler pages deploy dist/`

## Commands
```sh
npm run dev      # Vite dev server
npm run build    # outputs to dist/
npm run preview  # preview built dist/
npx wrangler pages deploy dist/ --project-name balkons-burguer --branch master
```

## Hero — video scrub

- Two `<video>` elements (hero-video-pc, hero-video-mobile), toggled via CSS `display: block/none` at 768px breakpoint
- JS controls `currentTime` based on scroll progress through `#hero-track` (height set to 3× viewport)
- Videos must be re-encoded with **every frame as keyframe** for smooth seeking:
  ```
  ffmpeg -i input.mp4 -g 1 -keyint_min 1 -sc_threshold 0 -c:v libx264 -preset slow -crf 23 -an output.mp4
  ```
- Loading overlay shows buffering progress, hides when both videos have `canplay` or `loadeddata`
- Logo positioned at top-center on mobile (`padding-top: 6rem`), left-center on desktop

## Cardápio

- Source: `public/cardapio.json` (copy of `cardapio_balkons_burguer.json` at root)
- Dynamically rendered by JS at runtime into tabbed categories
- Cardápio items get class `reveal visible` directly (IntersectionObserver runs before items exist)
- Category grouping in `main.js`:
  - Hambúrguers: Hambúrguers + Promoção do Dia
  - Porções: Porcões + Batatas
  - Adicionais: Molhos Especiais + Adicionais
- Price format: `R$ 9,99` (dot → comma)

## Key business data (used across the site)
- WhatsApp: (16) 99999-7398 → `https://wa.me/5516999997398`
- MenuDino orders: `https://balkonsburguer.menudino.com/`
- Google Maps (embed/link): uses `place_id:0x94bafd9d56a03797:0xae3dc0f076278890`
- Hours: Ter–Sáb 18h–00h, Dom 18h–00h, Seg Fechado

## Video workflow
1. Place source MP4 at project root (hero-pc.mp4 / hero-mobile.mp4)
2. Re-encode with ffmpeg (keyframe every frame, 1080p downscale)
3. Copy to `public/` — it serves from `/`
4. Add `<video>` element with `data-src` in `index.html`
5. JS reads `dataset.src` and starts loading on `DOMContentLoaded`

## File structure
```
index.html          # all sections (nav, hero, cardápio, história, localização, footer)
src/main.js         # hero scrub, nav, menu, cardápio renderer, scroll reveals, scroll arrow
src/style.css       # all styles (CSS custom properties for brand tokens)
public/             # static assets served at /
  hero-pc.mp4       # desktop landscape video
  hero-mobile.mp4   # mobile portrait video
  logo.png          # logo
  destaque.webp     # featured burger photo
  cardapio.json     # menu data
  favicon.png       # favicon (Balkon's logo)
  fonts/
    inter-black.woff2
  _headers          # security headers for Cloudflare
vite.config.js      # minimal: outDir, assetsInlineLimit: 0
```

## Brand tokens (in :root of style.css)
- `--orange: #E85D04`
- `--font-brand: 'BrandFont' (Inter Black 900 self-hosted), 'Arial Black', ...`
- `--bg: #0D0D0D`

## Notes
- No framework, no SSR, no Workers — pure static
- No test/lint/typecheck scripts
- Cardápio JSON is editable directly to update menu items
- Nav is fixed dark from page load (no transparency transition)
- Nav-logo click reloads page (`location.reload()`)
- Mobile hero has a bouncing scroll arrow that hides on first scroll
- Refresh always scrolls to top (`history.scrollRestoration = 'manual'` in `src/main.js:3`)
- Sections order: hero → featured → cardápio → história → localização → footer
