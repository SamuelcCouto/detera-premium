import { TextoMeteoro } from "@/components/brand/texto-meteoro";
import { Letreiro } from "@/components/brand/wordmark";
import { HeroCena } from "@/components/motion/hero-cena";
import { Estrelas } from "@/components/sections/estrelas";
import { Nave } from "@/components/sections/nave";
import { ButtonLink } from "@/components/ui/button";
import { BotaoNucleo } from "@/components/ui/botao-nucleo";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { pilares } from "@/content/pilares";
import { site } from "@/config/site";
import { whatsappUrl } from "@/lib/utils/whatsapp";

const mensagemHero =
  "Olá! Vim pelo site da DETERA e quero conversar sobre um projeto para a minha empresa.";

/**
 * Ritmo da entrada do título, num lugar só para as três partes não saírem
 * de sincronia quando uma delas mudar.
 *
 * `QUEDA` tem que acompanhar a duração de `meteoro-cai` no CSS — é dela que
 * sai o instante em que a última letra pousa, e é nesse instante que a luz
 * vermelha começa a primeira passagem.
 *
 * Esta é a única animação da página que roda por tempo, ao carregar. Todo o
 * resto acontece pela rolagem.
 */
const QUEDA = 0.66;
const PASSO_NOME = 0.06;
const ABERTURA = 0.12;
const FIM_DO_NOME = ABERTURA + 5 * PASSO_NOME + QUEDA;

/**
 * A trilha de frentes: as quatro áreas ligadas por uma linha com nós, e a
 * linha segue depois da última em vez de parar nela.
 *
 * É o argumento comercial e a filosofia da marca no mesmo desenho — e resolve
 * a primeira dobra sem depender de ilustração.
 *
 * No celular vira uma grade 2×2 só com os nomes. Com a promessa de cada uma,
 * a lista vertical sozinha passava de meia tela e empurrava o hero para
 * além de 100svh; as promessas continuam inteiras em Soluções.
 */
function TrilhaDeFrentes() {
  return (
    <ul className="grid grid-cols-2 gap-x-4 gap-y-2.5 md:grid-cols-4 md:gap-0">
      {pilares.map((pilar, indice) => (
        <li
          key={pilar.id}
          className="border-borda relative border-l py-1 pl-4 md:border-l-0 md:border-t md:py-0 md:pt-5 md:pl-0"
        >
          {/* O nó sobre a linha. No celular ele fica na vertical, à esquerda. */}
          <span
            aria-hidden="true"
            className={`bg-vazio absolute top-[0.7rem] -left-[4px] h-[7px] w-[7px] rotate-45 border md:top-0 md:left-0 md:-translate-y-1/2 ${
              pilar.acento === "sistema" ? "border-sistema" : "border-determinacao"
            }`}
          />
          <a
            href={`#${pilar.id}`}
            className="hover:text-texto text-texto-suave block transition-colors md:pr-6"
          >
            <span className="text-texto font-display block text-[0.98rem] font-bold">
              {pilar.nome}
            </span>
            <span className="mt-1 hidden text-[0.85rem] leading-snug md:block">
              {pilar.promessa}
            </span>
          </a>

          {/* Depois da quarta frente a linha continua. */}
          {indice === pilares.length - 1 ? (
            <span
              aria-hidden="true"
              className="from-borda absolute -top-px right-0 hidden h-px w-16 translate-x-full bg-gradient-to-r to-transparent md:block"
            />
          ) : null}
        </li>
      ))}
    </ul>
  );
}

/**
 * O hero ocupa a tela inteira e é fixado na rolagem (`HeroCena`): o nome se
 * desfaz letra a letra e o céu avança. Tudo o que se move na rolagem é
 * marcado com `data-hero-*`; as classes aqui são só visual.
 *
 * Cada coisa que também entra ao carregar (`.entrar`, `.meteoro`,
 * `.letra-meteoro`) tem um invólucro próprio para a rolagem. Entrada e
 * rolagem nunca animam o mesmo elemento.
 */
export function Hero() {
  return (
    <HeroCena>
      <Section
        id="topo"
        aria-labelledby="hero-titulo"
        tone="vazio"
        space="none"
        className="hero-palco flex min-h-svh flex-col overflow-hidden"
      >
        {/*
          A mídia do hero é o próprio céu: estrelas piscando por baixo de uma
          luz vermelha ambiente, com cadentes e cometas cruzando. Duas camadas
          em volta dele — a de fora desce devagar depois que o hero é solto
          (parallax), a de dentro avança durante o trecho fixado. Nenhuma
          delas anda sozinha em loop: o céu se move quando a pessoa rola.
        */}
        <div data-hero-ceu-paralaxe aria-hidden="true" className="absolute inset-0">
          <div data-hero-ceu className="absolute inset-0">
            <Estrelas quantidade={96} cadentes={5} cometas={2} />
          </div>
        </div>
        <div
          data-hero-aura
          aria-hidden="true"
          className="aura absolute h-[40rem] w-[40rem]"
          style={
            {
              top: "-14rem",
              left: "50%",
              marginLeft: "-20rem",
              "--aura-cor": "var(--color-determinacao)",
              "--aura-opacidade": 0.16,
            } as React.CSSProperties
          }
        />
        <div
          aria-hidden="true"
          className="aura absolute h-[26rem] w-[26rem]"
          style={
            {
              bottom: "-8rem",
              right: "8%",
              "--aura-cor": "var(--color-determinacao)",
              "--aura-opacidade": 0.14,
            } as React.CSSProperties
          }
        />

        {/*
          A margem esquerda inteira é a área de jogo.

          A largura sai de conta, não de palpite: `100%` aqui é a seção (a
          largura da janela) e `76rem` é o container do conteúdo, então
          `(100% - 76rem) / 2` é exatamente a sobra de um lado. Somam-se os
          `2.5rem` de respiro interno do container, que também são espaço vazio,
          e o painel encosta no texto sem nunca invadi-lo — em qualquer
          resolução, sem media query de largura fixa.

          O recuo da direita não é folga estética: a página tem uma trilha
          vertical correndo rente ao container, e a área de jogo encostada nela
          viraria um traço grosso só. Os 3rem separam as duas coisas.

          Some por completo abaixo de 1680px: ali a sobra não comporta a área de
          jogo, e quem entra pelo celular não tem teclado nem margem nenhuma.
          Na rolagem, some junto com o nome.
        */}
        <div
          data-hero-nave
          className="pointer-events-none absolute inset-y-0 left-0 z-10 hidden [@media(min-width:1680px)]:block"
          style={{ width: "calc((100% - 76rem) / 2 + 2.5rem)" }}
        >
          <div className="pointer-events-auto absolute inset-y-24 right-12 left-8">
            <Nave />
          </div>
        </div>

        {/* O respiro de cima desconta o cabeçalho, que agora é fixo e fica
            por cima do hero em vez de empurrá-lo para baixo. */}
        <Container className="relative flex flex-1 flex-col justify-center pt-[calc(4.5rem+1.5rem)] pb-8">
          <h1 id="hero-titulo">
            {/* O nome é o desenho de `Letreiro`, letra por letra caindo em
                meteoro, com o símbolo da marca embaixo do "A".

                Maior que antes: é a única mídia do hero, e o tamanho é o
                efeito. O teto em `svh` é o que garante que o hero inteiro
                caiba numa tela de 720px de altura — sem ele, o trecho
                fixado cortaria a trilha de frentes em notebook. */}
            <span data-hero-nome className="block">
              <Letreiro
                animado
                atraso={ABERTURA}
                passo={PASSO_NOME}
                className="text-texto h-[min(clamp(4.5rem,0.9rem+19vw,17rem),30svh)] w-auto"
              />
            </span>

            {/* O slogan desceu de `display` para um degrau abaixo: com o nome
                neste tamanho, os dois no mesmo volume disputavam o olho. */}
            <span
              data-hero-slogan
              className="text-texto mt-5 block text-[clamp(1.3rem,0.85rem+1.7vw,2.4rem)] leading-tight font-normal tracking-[-0.01em]"
              style={{ filter: "drop-shadow(0 3px 9px rgba(2, 3, 5, 0.6))" }}
            >
              <TextoMeteoro texto={site.slogan} atraso={FIM_DO_NOME - 0.34} passo={0.015} />
            </span>
          </h1>

          <div data-hero-resto className="mt-7">
            <p
              className="entrar text-lead text-texto-suave max-w-[56ch]"
              style={{ animationDelay: "1.15s" }}
            >
              Toda ideia de negócio começa parecida com as outras. O nosso trabalho é
              tecnologia, estratégia e design aplicados até ela virar algo que só a
              sua empresa tem.
            </p>
          </div>

          <div data-hero-resto className="mt-8">
            <div
              className="entrar flex flex-col gap-3 sm:flex-row"
              style={{ animationDelay: "1.3s" }}
            >
              <BotaoNucleo href={whatsappUrl(mensagemHero)}>Vamos construir</BotaoNucleo>
              <ButtonLink href="#solucoes" variant="contorno">
                Conhecer a DETERA
              </ButtonLink>
            </div>
          </div>
        </Container>

        <Container className="relative pb-8 md:pb-10">
          <div data-hero-resto>
            <div className="entrar" style={{ animationDelay: "1.45s" }}>
              <TrilhaDeFrentes />
            </div>
          </div>
        </Container>
      </Section>
    </HeroCena>
  );
}
