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
- **Desktop:** Canvas image sequence (202 JPEGs em `hero/desktop/`, 1920×1080 Full HD) — ScrollTrigger scrub no scroll
- **Mobile:** Canvas image sequence (135 JPEGs em `hero/mobile/`, 1080×1920) — ScrollTrigger scrub no scroll
- CSS `display: block/none` em 768px alterna entre canvas desktop/mobile
- Preloader (inline `<style>` + `DOMContentLoaded`) esconde body; loading overlay mostra progresso dos frames
- Scroll fica travado (`position: fixed` no body) até todos os frames carregarem
- Frames otimizados com ffmpeg (resize + compressão):
  ```
  # Desktop: 4K→1080p + compressão JPEG q:v 3
  ffmpeg -i input.mp4 -vf "fps=30,scale=1920:1080" -q:v 3 hero/desktop/ezgif-frame-%03d.jpg
  # Mobile: manter 1080x1920 + compressão
  ffmpeg -i input.mp4 -vf "fps=30,scale=1080:1920" -q:v 3 hero/mobile/ezgif-frame-%03d.jpg
  ```

## Cardápio
- Source: `cardapio.json`
- Renderizado por JS em tabs; aberto via toggle "Ver nosso cardápio"
- Apresentado como página oculta estilo bottom sheet: desliza de baixo para cima, cobre a tela, fundo vermelho (#C1121F), cards pretos
- Fecha pelo botão X, clicando no backdrop ou pressionando ESC; scroll do body é bloqueado enquanto aberto
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
hero/desktop/           # 202 JPEG frames para hero desktop (1920×1080, ~13MB)
hero/mobile/            # 135 JPEG frames para hero mobile (1080×1920, ~5.5MB)
logo.png / logo.webp    # logo original + versão WebP (88% menor)
destaque.webp           # foto destaque (já WebP)
favicon.png             # favicon (mantido PNG)
2d.png / 3d.png         # assets não referenciados no código (backup)
burger-destaque.png     # asset não referenciado no código (backup)
cardapio.json
fonts/inter-black.woff2
_headers                # Cloudflare security headers
```

## Media optimization notes
- **WebP**: `logo.png` → `logo.webp` (1.64MB → 203KB, 88% reduction); servido via `<picture>` com fallback PNG
- **Hero desktop**: Resolução reduzida de 4K (3840×2160) para Full HD (1920×1080) — 18MB → 13MB
- **Hero mobile**: Mantido original (já bem comprimido a 1080×1920, ~5.5MB)
- **PNGs não referenciados**: `2d.png`, `3d.png`, `burger-destaque.png` existem no repo mas não são usados no HTML/JS/CSS

## Brand tokens (`:root` in style.css)
- `--orange: #E85D04` · `--bg: #0D0D0D`
- `--font-brand`: Inter Black 900 self-hosted
- `--font-heading`: Bebas Neue (Google Fonts)
- `--font-body`: Inter (Google Fonts)
