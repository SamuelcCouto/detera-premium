# Plano de design — DETERA premium

Refazer o site existente "com cara premium": a identidade fica (tema escuro, Oxanium, vermelho = determinação, azul = sistema, o coração de placas, o céu estrelado) e mudam a estrutura e o movimento. Nenhum texto novo com número, cliente ou resultado; o conteúdo continua vindo de `src/content/`.

## Tema
Sujeito: a DETERA, que faz sites, crescimento, sistemas e infraestrutura para empresas, com base em Goiânia.
Público: donos de pequenas e médias empresas (clínica, loja, indústria) cujo digital trava em algum dos quatro sintomas.
Função da página: levar a pessoa a abrir a conversa no WhatsApp já sabendo o que a DETERA faz e por que ela é diferente.
Detalhe que só este site teria: o coração de placas cortado pela linha de energia, o nome desenhado à mão (não é fonte), o laço 05 → 01 do processo e as notas do PageSpeed com o link do relatório.

Não há `briefing.md`, mas o site atual já responde às três perguntas que a skill exige: a ação principal (conversa no WhatsApp, com mensagem por origem), os serviços (as quatro frentes de `pilares.ts`) e a mídia (fotos dos cases, sem vídeo).

## Paleta (a atual, sem mudança)
| Token | Hex | Papel |
|-------|-----|-------|
| `--color-vazio` / `--color-camada` | #07080b / #0e1015 | fundo e fundo alternado |
| `--color-texto` | #f2f3f5 | texto |
| `--color-texto-suave` | #9ba1ac | texto secundário |
| `--color-determinacao` | #ff3b3b | ação, núcleo, estado ativo |
| `--color-sistema` | #4c7dff | infraestrutura, continuidade (só onde já é azul hoje) |
| `--color-borda` | #23262e | linhas finas |

## Tipografia
Uma família só: Oxanium. A skill pede duas fontes; a regra do projeto (uma família, com papéis diferentes por peso) vale acima dela.
- Display (títulos, números): Oxanium 700–800.
- Texto (corpo, navegação, botões): Oxanium 400–600.
- O nome "DETERA" continua sendo o desenho de `marca-paths.ts`, não texto.

Escala:
- Nome no hero: cresce de `clamp(4.9rem, …, 11rem)` para cerca de `min(clamp(5.5rem, 1rem + 19vw, 17rem), 30svh)` de altura, uns 960 px de largura num notebook. O teto em `svh` garante que o hero fixado caiba numa tela de 720 px de altura.
- Frase genérica do manifesto: `clamp(2.2rem, 1rem + 4.2vw, 4.5rem)`.
- h2 continuam nos três degraus atuais (display, subdisplay, title).

## Mapa de seções
| Ordem | Seção | Padrão | Conteúdo |
|-------|-------|--------|----------|
| — | Cabeçalho | Fixo, transparente sobre o hero e vidro fosco depois dele. O menu do celular deixa o resto `inert`, pausa o Lenis e devolve o foco | Símbolo, navegação, CTA |
| 1 | Hero | **Fixado #1** (`+=90%`): o nome se desfaz letra a letra com blur e o céu ganha profundidade. O coração sob o "A" não se desfaz: vai ao centro, cresce e acende (ajuste feito depois dos prints — o fim do pin era uma tela de céu vazio) | Nome, slogan, frase, 2 CTAs, trilha de frentes |
| 2 | Cases | Sem pin. A foto da prévia abre por `clip-path` do centro, a revelação da skill adaptada. As notas do PageSpeed contam até o valor medido (o HTML já traz o valor final) | 2 cases + 2 em obra |
| 3 | Diagnóstico | Sem pin. O filete de cada sintoma se desenha na rolagem | 4 sintomas |
| 4 | Soluções | Editorial sticky, que já existe; sem efeito novo | 4 frentes |
| 5 | Personalidade | **Fixado #2, o momento marcante** (`≈ +=300%`) | 4 pares + fecho |
| 6 | Processo | Editorial sticky, que já existe. A linha das etapas se enche de vermelho e cada nó acende; o laço 05 → 01 fica | 5 etapas |
| 7 | Chamada | Sem pin. O bloco abre por `clip-path` do centro ao entrar | CTA |
| 8 | Sobre | Editorial sticky novo: a frase-tese fica presa à esquerda enquanto o texto e o fundador rolam | Texto + fundador |
| 9 | Perguntas | Sem mudança (`<details>` nativo) | FAQ |
| 10 | Contato | Sem mudança | Canais + formulário |
| 11 | Rodapé | Grade, que já existe | — |

São dois trechos fixados, no hero e no manifesto.

No celular, o hero tem que caber em 100svh. A trilha de frentes vira uma grade 2×2 só com os nomes, e as promessas continuam em Soluções.

## Momento marcante
**"De genérico a personalidade"**: a seção Personalidade fixada.

O h2 (o slogan) e quatro losangos de progresso ficam à esquerda. O palco fica à direita. Para cada um dos quatro pares:
1. A frase genérica ("Um site institucional.") entra grande, em cinza.
2. Com a rolagem, ela recua (encolhe e apaga até virar rótulo). A frase específica se cristaliza palavra por palavra, do blur para o nítido e do cinza para o branco. O nó vermelho acende e o losango de progresso avança.
3. O par sai e o próximo entra.

Depois do quarto par entra a frase de fecho ("…até virar reconhecível.") e o núcleo do coração acende ao lado dela.

Por quê: é o slogan acontecendo, e não sendo explicado. É o único momento do site que mostra o que "transformando ideias em personalidade" quer dizer. O movimento também rima com o hero: lá o nome se desfaz em blur, aqui o texto genérico se resolve em nitidez.

## Animações atuais: ficam, saem, mudam
| Animação | Decisão | Motivo |
|----------|---------|--------|
| Queda em meteoro do nome e do slogan + `.entrar` do CTA | **Fica**, como a única entrada orquestrada ao carregar | É a assinatura do hero. Passa para a camada de dentro de cada letra; a de fora fica para o desfazer da rolagem |
| Marca viva (placas respirando, núcleo, traços) | **Fica** | É pequena e é a marca |
| Luz vermelha varrendo o nome | **Fica**, mas some quando o desfazer começa | O `clipPath` usa os contornos parados e deixaria um fantasma de luz onde as letras já saíram |
| Estrelas piscando, cadentes, cometas | **Ficam** | São o céu |
| `ceu-deriva` (céu subindo e descendo em loop de 7s) | **Sai** | No hero e no manifesto, o céu passa a andar com a rolagem (parallax). Nas outras seções ele fica parado e só pisca |
| `aura-deriva` (brilhos e nebulosas balançando) | **Sai** | As auras ficam paradas. A do hero passa a responder à rolagem. Borrão de 40rem se mexendo disputa com os trechos fixados |
| `[data-surgir]` (surgir por `view()`) | **Fica** fora dos trechos fixados e **sai** dos itens do manifesto | Dentro de um pin, `view()` congela (o elemento está `fixed`); ali quem manda é o GSAP |
| `ciclo-volta` (laço 05 → 01) | **Fica** | Já é conduzido pela rolagem |
| Rodízio de fotos da prévia, recados e barra "em obra" | **Ficam** | São conteúdo, não enfeite |
| Brilho do botão-núcleo | **Fica** | É interação, não loop |
| Jogo da nave (≥ 1680px) | **Fica**, e some junto com o desfazer do hero | É personalidade da marca e não disputa o centro da tela |
| `scroll-behavior: smooth` do CSS | **Sai** | Quem rola é o Lenis, e com o CSS ligado os dois brigam |

## Mídia
| Peça | Origem | Status |
|------|--------|--------|
| Mídia do hero | O céu (CSS, semente fixa) + o nome desenhado | Já existe |
| Vídeo | Não usa: não há vídeo real, e inventar mídia contraria a marca | — |
| 3D | Não usa: o Three.js pesaria cerca de 150 kB para fazer o que o SVG da marca já faz | — |
| Fotos | As dos cases em `public/cases/` | Já existem |

## Técnica
- `npm install gsap @gsap/react lenis` (3.15.0 / 2.1.2 / 1.3.26, as versões testadas pela skill). Sem `three`. A CSP não muda: tudo sai do bundle, `'self'`.
- Da referência Next.js: `lib/motion.ts`, `components/motion/smooth-scroll.tsx` e `contador.tsx`. As coreografias entram como componentes cliente finos em volta das seções, que continuam no servidor com o texto de `src/content/`.
- Cada letra do nome no hero ganha duas camadas: o `<g>` de fora é da rolagem e o de dentro é da queda. O `Letreiro` do rodapé, o favicon e a imagem OG não mudam (`marca-paths.ts` intacto).
- Só `transform`, `opacity`, `filter` e `clip-path`. Gatilhos criados na ordem da página; `invalidateOnRefresh`; `refresh()` depois das fontes; `ignoreMobileResize`.
- Âncoras (`#solucoes`, `#servicos`…) passam pelo Lenis, com o deslocamento do cabeçalho.
- Movimento reduzido: sem Lenis e sem pin, e o manifesto vira a lista de hoje. O `@media print` ganha os estados finais dos elementos novos.

## Revisão contra o briefing
O que parecia genérico e foi trocado: hero com várias coisas empilhadas e entrando por tempo, sem relação com a rolagem. O manifesto era uma lista que dizia "genérico × específico" em vez de mostrar a transformação.
Enfeite cortado: deriva em loop do céu e das auras, e o símbolo repetido acima do nome no hero (o coração já está sob o "A" e no cabeçalho).

## Verificação
`npx tsc --noEmit`, `npx eslint src --max-warnings=0` e `npm run build`. Depois, `prints.mjs` no build de produção em 1280×720, 1440×900 e 390×844, e de novo com `--reduce`. Também: teclado (Tab pelos CTAs do hero e pelo menu), console limpo e CSP no `npm run start`.
