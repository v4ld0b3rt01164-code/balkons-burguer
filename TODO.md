# Melhorias Pendentes — Balkon's Burguer

## 🟡 SEO

- [ ] Criar `robots.txt` na raiz do projeto
  - Permitir indexação por todos os crawlers
  - Apontar para o sitemap
  - Bloquear rotas desnecessárias (se houver)

- [ ] Criar `sitemap.xml` na raiz do projeto
  - Incluir todas as páginas/index.html
  - Definir `<lastmod>` com a data de última atualização
  - Definir `<changefreq>` e `<priority>` apropriadamente

## 🟡 Performance

- [ ] Avaliar uso de sprite sheets ou vídeo para reduzir ~337 requests HTTP do hero
  - Atualmente cada frame é uma requisição separada
  - Conexões lentas podem causar lag inicial no carregamento

## 🟡 Analytics

- [ ] Integrar Google Analytics ou Plausible para métricas de访问

## 🟡 PWA

- [ ] Adicionar `manifest.json` e service worker para experiência offline

---

*Última atualização: 19/07/2026*
