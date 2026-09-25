# DETERA — site institucional

## Visão geral do código

Site de página única da DETERA, pré-renderizado estático e sem backend: o formulário de contato valida no navegador e abre o WhatsApp com a mensagem pronta. Cada seção é um componente fino sobre um arquivo de texto em `src/content/`; a marca (símbolo e nome "DETERA") é geometria SVG traçada à mão, com uma fonte única em `marca-paths.ts` usada pelo site, pelo favicon e pela imagem de compartilhamento.

**Stack**: Next.js 16 (App Router + Turbopack), React 19, TypeScript estrito, Tailwind CSS v4 (tokens em `@theme` no `globals.css`), zod, Vercel.
**Estrutura**: `src/app` (shell, SEO, erros) · `src/components/{brand,layout,sections,ui}` · `src/content` (todo o texto) · `src/config` (identidade, contato, navegação) · `src/features/contato` · `src/lib`.

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
