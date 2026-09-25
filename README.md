# DETERA

Site institucional da DETERA — tecnologia, estratégia e crescimento digital.
Slogan da marca: **transformando ideias em personalidade**.

Este repositório é exclusivo da DETERA. O portfólio pessoal que existia antes
neste código foi devolvido a uma pasta própria (`portfolio-fullstack/`, fora
deste repositório) quando a marca foi desvinculada dele.

## Stack

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS 4 · zod · Vercel.

É a mesma stack dos outros projetos da casa (`sencis`, `fidele`, `YasminGS`), de
propósito: o que se aprende em um projeto vale nos outros.

## Rodando

```bash
npm install
npm run dev
```

`npm run build` para o build de produção, `npm run typecheck` e `npm run lint`
antes de publicar.

## Variáveis de ambiente

| Variável | Para quê |
| --- | --- |
| `NEXT_PUBLIC_SITE_URL` | URL canônica do domínio final, com protocolo. **Enquanto não estiver definida, o site é publicado com `noindex`** — ver abaixo. |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | Número do WhatsApp em formato internacional sem símbolos (`5562984750989`). Opcional: há um padrão em `src/config/site.ts`. |

### Sobre o `noindex`

`src/config/site.ts` só considera o site público quando `NEXT_PUBLIC_SITE_URL`
existe. Sem ela, `robots.ts` bloqueia os rastreadores e a página sai com
`noindex`. É proposital: uma URL de preview da Vercel indexada compete com o
domínio real depois e vira conteúdo duplicado.

Quando o domínio da DETERA entrar no ar, defina a variável na Vercel e refaça o
deploy. Só isso libera a indexação.

### O "A" de DETERA

O nome usa **A latino (U+0041)** do começo ao fim. Ele chegou escrito com um
**А cirílico (U+0410)** no último caractere — idêntico aos olhos e outra palavra
para busca, leitor de tela e copiar/colar. Se for reescrever a marca em algum
lugar, confira o caractere.

## Identidade visual

**A marca.** Um coração construído em blocos (grade, não curva), partido ao
meio por uma linha de energia: dentro do coração ela vira núcleo, fora dele
vira traço pontilhado — um pulso que continua além da própria forma. O
wordmark fecha com um ponto quadrado em determinação, o "fim de frase" que a
marca serve para contradizer. Vive em `src/components/brand/wordmark.tsx`; o
mesmo desenho se repete, simplificado, no favicon (`src/app/icon.tsx`) e na
imagem de compartilhamento (`src/app/opengraph-image.tsx`) — os três precisam
ser atualizados juntos se a marca mudar.

**Cor.** Preto com desvio de azul (`--color-vazio` `#07080b`, `--color-camada`
`#0e1015`) e dois acentos com significado fixo:

- **vermelho** (`--color-determinacao`) = ação, estado ativo, o núcleo da marca;
- **azul** (`--color-sistema`) = infraestrutura, dado, o que sustenta.

Acento nunca é decoração. Se um elemento não é ação nem sistema, ele é cinza.

`--color-contorno` (`#5c626d`) é separado das bordas decorativas de propósito:
limite de componente interativo precisa de 3:1 contra o fundo (WCAG 1.4.11), e o
filete que separa dois blocos não.

**Tipografia.** Uma família só, Oxanium, do peso 200 ao 800: os cantos
chanfrados e a proporção larga puxam a personalidade do nome desenhado, e ainda
assim ela se lê em parágrafo. O próprio "DETERA" não é fonte — é o desenho de
`NOME_DETERA` em `marca-paths.ts`. Os títulos de seção têm três volumes
(`display`, `subdisplay`, `title`), atribuídos pelo peso do que a seção diz.
Servida pelo próprio domínio por `@font-face` em `globals.css`, e não por
`next/font`: o carregador do Turbopack não resolve os arquivos da Oxanium neste
ambiente.

**Forma.** Raio curto (2px e 4px) e borda no lugar de sombra — sobre preto,
sombra não existe.

**A trilha.** O filete vertical que atravessa a página, marcado por losangos a
cada seção e sumindo por fade no rodapé em vez de bater num terminal — a mesma
personalidade atravessando presença, crescimento, tecnologia e infraestrutura
como faces de uma coisa só. Aparece a partir de 1280px; no mobile viraria
sujeira ao lado do texto.

**O fundo vivo.** Hero, manifesto e a faixa final têm um céu de estrelas
piscando (`src/components/sections/estrelas.tsx`, puro CSS, posições geradas
por semente fixa — nunca `Math.random()` no cliente) sob uma luz vermelha
ambiente à deriva (`.aura` em `globals.css`). Nada disso depende de mouse: é a
razão de existir, depois de uma versão anterior responder só ao cursor e
funcionar apenas no desktop.

## Movimento

- **Entrada do hero**: CSS puro, uma sequência só.
- **Revelação por scroll**: `animation-timeline: view()` — sem JavaScript, sem
  `IntersectionObserver`, sem biblioteca. Fica dentro de um `@supports`, então
  navegador sem suporte mostra o conteúdo normalmente.
- **Impressão**: há um `@media print` que zera as animações e esconde os
  degradês e o céu de estrelas. Sem ele a timeline nunca progride e a página
  sairia em branco no papel.
- `prefers-reduced-motion` neutraliza tudo.

## Onde mexer no conteúdo

O texto do site não vive dentro dos componentes. Está em `src/content/`:

| Arquivo | Seção |
| --- | --- |
| `diagnostico.ts` | Os quatro sintomas de "onde o digital costuma travar" |
| `pilares.ts` | Presença digital, Crescimento, Tecnologia, Infraestrutura |
| `personalidade.ts` | O manifesto "transformando ideias em personalidade" |
| `cases.ts` | Os estudos de caso (problema, estratégia, construção, resultado) |
| `em-construcao.ts` | Projetos no ar sem case fechado ainda (domínio de preview) |
| `processo.ts` | As cinco etapas, de descobrir a evoluir |
| `perguntas.ts` | As perguntas frequentes |

Marca, contatos e dados institucionais ficam em `src/config/site.ts` —
inclusive o slogan (`site.slogan`), lido de lá em todo lugar que ele aparece
(hero, rodapé, metadados, recado do console) para nunca haver duas versões da
mesma frase no site.

## Cases: como funciona a prévia com moldura de navegador

`src/components/sections/case-preview.tsx` hotlinka uma imagem que já vive no
site do próprio cliente — não uma cópia salva neste repositório. Isso tem um
efeito colateral bom (a prévia acompanha se o cliente trocar a imagem lá) e um
risco conhecido (se o arquivo sumir, `onError` troca o quadro por um aviso em
vez de deixar o ícone de imagem quebrada aparecer). Quando não existe imagem
nenhuma (`imagemUrl` ausente, caso do Keep New em `em-construcao.ts`), o mesmo
aviso aparece direto.

Os dois cases com estudo completo (Sencis, FIDÈLE) apontam para o domínio
oficial do cliente. Os projetos em `em-construcao.ts` apontam para o domínio de
preview da Vercel — só migram para `cases.ts`, com domínio próprio, quando
fecharem um ciclo real para virar case.

## Decisões que valem saber

- **Sem backend.** O formulário de contato valida com zod no cliente e monta uma
  mensagem de WhatsApp já preenchida. Nenhum dado é armazenado. Se um dia
  precisar de e-mail transacional, o lugar é uma rota em `src/app/api/`.
- **Âncoras antigas preservadas.** `#servicos` e `#como-funciona` continuam
  existindo como alias das seções renomeadas (`#solucoes`, `#processo`), e
  `next.config.ts` redireciona as rotas equivalentes. Nenhum link já
  compartilhado quebra.
- **Referências discretas.** O coração em blocos, os pontos de continuação da
  trilha, o laço `05 → 01` no processo e o recado no console são homenagens
  conceituais à ideia de determinação e de retomada. Nenhum asset, nome, texto
  ou interface de terceiros foi usado, e nada disso depende de reconhecimento
  para funcionar como design.
