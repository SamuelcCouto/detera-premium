import { TextoFala } from "@/components/brand/texto-fala";
import { Letreiro } from "@/components/brand/wordmark";
import { HeroCena } from "@/components/motion/hero-cena";
import { Nave } from "@/components/sections/nave";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { pilares } from "@/content/pilares";
import { site } from "@/config/site";
import { whatsappUrl } from "@/lib/utils/whatsapp";

const mensagemHero =
  "Olá! Vim pelo site da DETERA e quero conversar sobre um projeto para a minha empresa.";

/**
 * A trilha de frentes: as quatro áreas ligadas por uma linha com nós, e a
 * linha segue depois da última em vez de parar nela. É o argumento
 * comercial e a filosofia da marca no mesmo desenho.
 *
 * Só a partir de 768px. No celular o hero é fixado e precisa caber inteiro
 * em 100svh, e as quatro frentes aparecem logo abaixo, em Soluções.
 *
 * Cada frente é uma escolha: o cursor-coração marca a que está sob o ponteiro
 * ou o foco (`.escolha`).
 */
function TrilhaDeFrentes() {
  return (
    <ul className="grid grid-cols-4">
      {pilares.map((pilar, indice) => (
        <li key={pilar.id} className="border-borda relative border-t pt-5">
          <span
            aria-hidden="true"
            className={`bg-vazio absolute top-0 left-0 h-[7px] w-[7px] -translate-y-1/2 rotate-45 border ${
              pilar.acento === "sistema" ? "border-sistema" : "border-determinacao"
            }`}
          />
          <a href={`#${pilar.id}`} className="escolha text-texto-suave block pr-6">
            <span className="text-texto font-display block text-[0.98rem] font-bold">
              {pilar.nome}
            </span>
            <span className="mt-1 block text-[0.85rem] leading-snug">{pilar.promessa}</span>
          </a>

          {indice === pilares.length - 1 ? (
            <span
              aria-hidden="true"
              className="from-borda absolute -top-px right-0 h-px w-16 translate-x-full bg-gradient-to-r to-transparent"
            />
          ) : null}
        </li>
      ))}
    </ul>
  );
}

/**
 * O hero ocupa a tela inteira e é fixado na rolagem (`HeroCena`). O que se
 * move é achado por `data-*`; as classes aqui são só visual.
 *
 * - `data-intro`: invólucro escondido pelo CSS até a entrada começar;
 * - `data-entra`: peça que aparece na entrada;
 * - `data-hero-resto`, `data-hero-nome`, `data-hero-slogan`: o que a
 *   rolagem tira de cena;
 * - `data-travessia`: a camada de blocos vermelhos da travessia do núcleo,
 *   preenchida pelo cliente.
 *
 * O fundo é o céu (`CeuVivo`), a mídia do hero. Não há mais brilho radial
 * nem estrelas por seção.
 */
export function Hero() {
  return (
    <HeroCena>
      <Section
        id="topo"
        aria-labelledby="hero-titulo"
        tone="vazio"
        space="none"
        ceu={1}
        className="hero-palco flex min-h-svh flex-col overflow-hidden"
      >
        {/*
          A margem esquerda inteira é a área do jogo da nave, só a partir de
          1680px. A largura é a sobra exata de um lado do container de 76rem,
          mais o respiro interno dele; o recuo da direita separa a área da
          trilha vertical da página. Some junto com o nome na rolagem.
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

        {/* O respiro de cima desconta o cabeçalho, que é fixo e fica por
            cima do hero. */}
        <Container className="relative flex flex-1 flex-col justify-center pt-[calc(4.5rem+1.5rem)] pb-8">
          <h1 id="hero-titulo">
            {/* O nome desenhado, com o coração em blocos embaixo do "A". No
                celular ocupa a largura inteira; a partir de 768px a altura
                manda, com teto em `svh` para o hero caber numa tela de 720px. */}
            <span data-hero-nome data-intro className="block">
              <Letreiro
                animado
                className="text-texto h-auto w-full md:h-[min(clamp(4.5rem,0.9rem+19vw,17rem),30svh)] md:w-auto"
              />
            </span>

            <span
              data-hero-slogan
              data-intro
              className="text-texto mt-5 block text-[clamp(1.3rem,0.85rem+1.7vw,2.4rem)] leading-tight font-normal tracking-[-0.01em]"
            >
              <TextoFala texto={site.slogan} />
            </span>
          </h1>

          <div data-hero-resto className="mt-7">
            <p data-intro data-entra className="text-lead text-texto-suave max-w-[56ch]">
              Toda ideia de negócio começa parecida com as outras. O nosso trabalho é
              tecnologia, estratégia e design aplicados até ela virar algo que só a
              sua empresa tem.
            </p>
          </div>

          <div data-hero-resto className="mt-8">
            <div data-intro data-entra className="flex flex-col gap-3 sm:flex-row">
              <ButtonLink href={whatsappUrl(mensagemHero)}>Vamos construir</ButtonLink>
              <ButtonLink href="#solucoes" variant="contorno">
                Conhecer a DETERA
              </ButtonLink>
            </div>
          </div>
        </Container>

        <Container className="relative hidden pb-10 md:block">
          <div data-hero-resto>
            <div data-intro data-entra>
              <TrilhaDeFrentes />
            </div>
          </div>
        </Container>

        <div data-travessia aria-hidden="true" className="travessia" />
      </Section>
    </HeroCena>
  );
}
