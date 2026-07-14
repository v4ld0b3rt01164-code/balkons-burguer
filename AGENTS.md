# Balkon's Burguer — AGENTS.md

## Stack
- HTML5 + CSS3 + JS puro (sem framework, sem build)
- GSAP + ScrollTrigger via CDN
- Deployed to Cloudflare Pages via `wrangler pages deploy .`

## Commands
```sh
npx wrangler pages deploy . --project-name balkons-burguer --branch master
```

## Hero
- **Desktop:** Canvas image sequence (202 JPEGs em `hero/desktop/`) — ScrollTrigger scrub no scroll
- **Mobile:** Canvas image sequence (135 JPEGs em `hero/mobile/`) — ScrollTrigger scrub no scroll
- CSS `display: block/none` em 768px alterna entre canvas desktop/mobile
- Preloader (inline `<style>` + `DOMContentLoaded`) esconde body; loading overlay mostra progresso dos frames
- Scroll fica travado (`position: fixed` no body) até todos os frames carregarem
- Frames extraídos do vídeo com ffmpeg (keyframe em cada frame):
  ```
  ffmpeg -i input.mp4 -vf "fps=30,scale=1920:-1" -q:v 2 frame-%03d.jpg
  ffmpeg -i input.mp4 -vf "fps=30,scale=1080:-1" -q:v 2 frame-%03d.jpg
  ```

## Cardápio
- Source: `cardapio.json`
- Renderizado por JS em tabs; escondido atrás de toggle "Ver nosso cardápio" que desliza da esquerda
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
index.html              # todas as seções + metas + JSON-LD
style.css               # todos os estilos (CSS custom properties para brand tokens)
main.js                 # hero scrub, nav, menu, cardápio toggle/renderer, scroll reveals
hero/desktop/           # 202 JPEG frames para hero desktop
hero/mobile/            # 135 JPEG frames para hero mobile
logo.png / destaque.webp / favicon.png / burger-destaque.png
cardapio.json
fonts/inter-black.woff2
_headers                # Cloudflare security headers
```

## Brand tokens (`:root` in style.css)
- `--orange: #E85D04` · `--bg: #0D0D0D`
- `--font-brand`: Inter Black 900 self-hosted
- `--font-heading`: Bebas Neue (Google Fonts)
- `--font-body`: Inter (Google Fonts)
