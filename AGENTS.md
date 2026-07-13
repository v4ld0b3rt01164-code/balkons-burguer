# Balkon's Burguer — AGENTS.md

## Stack
- Vite 6 + vanilla HTML/CSS/JS + GSAP (ScrollTrigger)
- Deployed to Cloudflare Pages via `wrangler pages deploy dist/`

## Commands
```sh
npm run dev           # Vite dev server
npm run build         # outputs to dist/
npm run preview       # preview built dist/
npx wrangler pages deploy dist/ --project-name balkons-burguer --branch master
```

## Hero
- **Desktop:** `<video>` (hero-pc.mp4) scrubbed via rAF on scroll (`#hero-track` height = 3× viewport)
- **Mobile:** Canvas image sequence (135 JPEGs in `public/hero/mobile/`) scrubbed via GSAP ScrollTrigger
- CSS `display: block/none` at 768px breakpoint toggles between video and canvas
- Preloader (inline `<style>` + `DOMContentLoaded`) hides body until parse; loading overlay shows frame/video progress
- Videos must be re-encoded with every frame as keyframe:
  ```
  ffmpeg -i input.mp4 -g 1 -keyint_min 1 -sc_threshold 0 -c:v libx264 -preset slow -crf 23 -an output.mp4
  ```

## Cardápio
- Source: `public/cardapio.json`
- Rendered by JS into tabbed categories; hidden behind a "Ver nosso cardápio" toggle that slides up on click
- Category grouping: Hambúrguers (+ Promoção do Dia), Combos, Porções (+ Batatas), Sobremesas, Bebidas, Adicionais (+ Molhos)
- Price format: `R$ 9,99`

## Sections order
hero → cardápio → destaque → história → localização → footer

## Key business data
- WhatsApp: `https://wa.me/551699997398`
- MenuDino: `https://balkonsburguer.menudino.com/`
- Maps `place_id: 0x94bafd9d56a03797:0xae3dc0f076278890`
- Hours: Ter–Sáb 18h–00h, Dom 18h–00h, Seg Fechado

## File structure
```
index.html              # all sections
src/main.js             # GSAP setup, hero scrub, nav, menu, cardápio toggle/renderer, scroll reveals
src/style.css           # all styles (CSS custom properties for brand tokens)
public/
  hero-pc.mp4           # desktop video
  hero-mobile.mp4       # (unused, kept for reference)
  hero/mobile/          # 135 JPEG frames for mobile canvas sequence
  logo.png / destaque.webp / favicon.png
  cardapio.json
  fonts/inter-black.woff2
  _headers              # Cloudflare security headers
```

## Brand tokens (`:root` in style.css)
- `--orange: #E85D04` · `--bg: #0D0D0D`
- `--font-brand`: Inter Black 900 self-hosted
- `--font-heading`: Bebas Neue
