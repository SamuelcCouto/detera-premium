# DETERA — site institucional

## Visão geral do código

Site de página única da DETERA, pré-renderizado estático e sem backend: o formulário de contato valida no navegador e abre o WhatsApp com a mensagem pronta. A v3 ("Reentrada") é uma missão espacial dirigida pela rolagem: um canvas Three.js fixo mostra o sistema DETERA (núcleo vermelho = estrela, quatro frentes = planetas), e um roteiro de cenas em `src/lib/missao/cenas.ts` move a câmera e os cartões num palco sticky (chegada, travessia entre planetas, reentrada com o manifesto, pouso com os projetos, órbita do processo). O texto continua em `src/content/`; a marca (símbolo e nome "DETERA") é geometria SVG em `marca-paths.ts`. Plano em `docs/design-plan.md`.

**Stack**: Next.js 16 (App Router + Turbopack), React 19, TypeScript estrito, Tailwind CSS v4 (tokens em `@theme` no `globals.css`), Three.js, Lenis + `gsap.ticker` (pelo npm; a CSP bloqueia CDN), zod, Vercel.
**Estrutura**: `src/app` (shell, script de modo no `<head>`, SEO, erros) · `src/components/{brand,layout,missao,motion,secoes,ui}` · `src/lib/missao` (cenas, estado, mundo 3D, shaders) · `src/content` (todo o texto) · `src/config` · `src/features/contato`.

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
