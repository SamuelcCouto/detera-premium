# DETERA — site institucional

## Visão geral do código

Site de página única da DETERA, pré-renderizado estático e sem backend: o formulário de contato valida no navegador e abre o WhatsApp com a mensagem pronta. Cada seção é um componente de servidor fino sobre um arquivo de texto em `src/content/`, e o movimento entra por invólucros client em `src/components/motion/` que acham o que animar por `data-*`. A marca (símbolo e nome "DETERA") é geometria SVG traçada à mão, com uma fonte única em `marca-paths.ts` usada pelo site, pelo favicon, pela imagem de compartilhamento e pelo manual em `docs/identidade/`. A v2 tem movimento próprio inspirado em Undertale (coração que se monta em blocos, fala letra a letra, cursor-coração, céu em canvas); o plano está em `docs/design-plan.md`.

**Stack**: Next.js 16 (App Router + Turbopack), React 19, TypeScript estrito, Tailwind CSS v4 (tokens em `@theme` no `globals.css`), GSAP + ScrollTrigger + Lenis (pelo npm; a CSP bloqueia CDN), zod, Vercel.
**Estrutura**: `src/app` (shell, SEO, erros) · `src/components/{brand,layout,motion,sections,ui}` · `src/content` (todo o texto) · `src/config` (identidade, contato, navegação) · `src/features/contato` · `src/lib` (gestos compartilhados: `fala`, `montar-coracao`, `grade`) · `docs/identidade` (manual da marca e seus geradores).

Mapa detalhado da arquitetura, dos tokens, da CSP, das armadilhas e de onde mexer para cada tarefa: [docs/CODEBASE_MAP.md](docs/CODEBASE_MAP.md).

## Regras que não mudam

- Nunca inventar cliente, resultado, métrica ou certificação. Número só se for medido e verificável.
- "DETERA" sempre com A latino (U+0041), nunca o cirílico А (U+0410).
- Nada de `Math.random()` em código que roda no servidor — o céu usa PRNG com semente.
- Oxanium entra por `@font-face` em `globals.css`, não por `next/font` (o Turbopack não resolve os arquivos dela aqui).
- Identificadores, conteúdo e comentários em português; o comentário explica a alternativa rejeitada.

## Verificação

```bash
npx tsc --noEmit
npx eslint src --max-warnings=0
npm run build
```
