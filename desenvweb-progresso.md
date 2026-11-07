# Progresso do projeto

Mantido pela skill desenvwebpremium. Atualize ao fim de cada etapa. Este arquivo vive no projeto; não vai para o caderno de aprendizados.

- Projeto: DETERA v3 "Reentrada" (versão de teste; o site oficial é outro projeto)
- Tipo: institucional, página única
- Stack: Next.js 16, React 19, TypeScript, Tailwind v4, GSAP + Lenis, Three.js
- Início: 2026-11-01

| Etapa | Skill | Situação | Aprovado em | Notas (o que foi decidido, o que falta) |
|---|---|---|---|---|
| 0 Preparar | — | concluída | 2026-11-01 | Briefing vem do conteúdo real do site (src/content, src/config). Ação principal: conversa no WhatsApp |
| 1 Identidade | identidade-visual | concluída | 2026-11-01 (usuário pediu para ir direto) | Modo completar: marca mantida (nome desenhado, símbolo, vermelho, azul, Oxanium); paleta cósmica + Spectral como voz do narrador. docs/design-plan.md |
| 2 Movimento e construção | site-premium | concluída | 2026-11-01 (ir direto) | Gesto-assinatura: a reentrada. Palco sticky + keyframes de estado + Three.js. QA com prints desktop/celular, teclado, âncoras, dossiê, movimento reduzido. Aguarda o olhar do usuário |
| 3 Mapa | cartographer | concluída | 2026-11-01 | docs/CODEBASE_MAP.md e CLAUDE.md atualizados para a v3 |
| 4 Ajustes | — | em andamento | 2026-11-07 | Enxugamento pedido pelo usuário: 22 → 10 cenas, abertura na Via Láctea com zoom até o sistema solar, cada projeto é um planeta, resto em dossiês |
| 5 Celular | mobile | concluída | 2026-11-01 | 0 problemas graves em 11 tamanhos (1920×1080 derruba o Chromium headless com WebGL por software; checado por prints). Falta teste em aparelho real |
| 6 Segurança e publicação | seguranca-web | concluída | 2026-11-01 | Sem backend nem coleta (formulário abre o WhatsApp). Publicado por push no main |
| 7 Fechar | — | | | |

## Decisões do cliente
- 2026-11-01: v2 recusada ("cara de site feito por IA"). Pedido: experiência totalmente diferente, imersão no cosmos, gravidade, entrada em atmosfera, sistemas solares, transições horizontais e verticais, cinematográfica. Liberdade total de ferramenta. Publicar direto sobrescrevendo (versão de teste).
- 2026-11-07: "ficou bom", mas enxugar texto e animações porque dificilmente alguém vê o site até o fim; "o que já construímos" com cada projeto um planeta; começar na Via Láctea, com a primeira transição indo direto ao sistema solar e aos projetos.

- 2026-11-07: abertura ainda com "cara de IA" e Yasmin/Keep New sem imagem. Celular "extremamente travado", decisão delegada: um modelo só, otimizado, com resolução adaptativa.

## Pendências
- Teste em celular de verdade (em pé e deitado) e num notebook comum: o headless usa WebGL por software e não mede FPS real.
- O manual de identidade em docs/identidade é da v2 (não reflete a paleta cósmica nem a Spectral).
