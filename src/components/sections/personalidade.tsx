import { Fragment } from "react";

import { Simbolo } from "@/components/brand/wordmark";
import { ManifestoCena } from "@/components/motion/manifesto-cena";
import { Estrelas } from "@/components/sections/estrelas";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { transformacoes } from "@/content/personalidade";
import { site } from "@/config/site";

/**
 * O manifesto. É o único lugar do site onde o slogan é explicado — depois
 * daqui ele não precisa mais ser repetido, só sustentado pelo resto.
 *
 * Com movimento, `ManifestoCena` fixa a seção e transforma cada frase
 * genérica na específica diante da pessoa — o slogan acontecendo, em vez de
 * explicado. O HTML abaixo é a lista legível de sempre; o palco é só uma
 * classe que o componente de cliente põe por cima (ver `.manifesto--palco`
 * no CSS). Os `data-*` são os ganchos da coreografia; as classes
 * `manifesto__*` são o layout do palco.
 */
export function Personalidade() {
  return (
    <ManifestoCena>
      <Section
        id="personalidade"
        tone="vazio"
        space="generous"
        aria-labelledby="personalidade-titulo"
        className="manifesto overflow-hidden"
      >
        {/* O manifesto também respira — mais contido que o hero, azul de
            sistema, quase imperceptível, apenas para a seção não ficar
            plana entre dois blocos que já têm brilho. */}
        <div
          aria-hidden="true"
          className="aura absolute h-[24rem] w-[24rem]"
          style={
            {
              right: "-6rem",
              bottom: "-6rem",
              "--aura-cor": "var(--color-sistema)",
              "--aura-opacidade": 0.09,
            } as React.CSSProperties
          }
        />

        {/* Mais alto que a seção por baixo: no palco o céu sobe 8% com a
            rolagem, e sem a sobra apareceria uma faixa preta no rodapé. */}
        <div
          data-manifesto-ceu
          aria-hidden="true"
          className="absolute inset-x-0 top-0 -bottom-[12%]"
        >
          <Estrelas
            quantidade={44}
            semente={771}
            cadentes={3}
            cometas={1}
            nebulosa="sistema"
            className="opacity-65"
          />
        </div>

        <Container className="manifesto__grade relative">
          <div className="manifesto__cabeca max-w-[60ch]">
            <h2 id="personalidade-titulo" className="text-subdisplay">
              {site.slogan}
            </h2>
            <p className="manifesto__lead text-lead text-texto-suave mt-5">
              É a frase que orienta cada projeto. Quatro decisões que separam o
              que só funciona do que também tem cara própria.
            </p>

            {/* Um losango por par, aceso quando a frase dele se resolve. Só
                existe no palco: na lista, a ordem já está na própria lista. */}
            <div aria-hidden="true" className="manifesto__progresso">
              {transformacoes.map((item) => (
                <span
                  key={item.generico}
                  className="border-borda-viva relative h-[9px] w-[9px] rotate-45 border"
                >
                  <span data-progresso-vivo className="bg-determinacao absolute inset-0" />
                </span>
              ))}
            </div>
          </div>

          <div className="manifesto__palco">
            <ul className="manifesto__pares mt-16 flex flex-col">
              {transformacoes.map((item) => (
                <li
                  key={item.generico}
                  data-par
                  className="manifesto__par border-borda grid gap-4 border-t py-9 md:grid-cols-[minmax(0,24rem)_1fr] md:gap-14"
                >
                  <div className="relative">
                    {/* O nó marca o ponto onde a entrega ficaria genérica. */}
                    <span
                      aria-hidden="true"
                      className="manifesto__no-lista bg-determinacao absolute top-[0.6em] -left-[calc(0.75rem+3px)] hidden h-[6px] w-[6px] rotate-45 md:block"
                    />
                    <p
                      data-generico
                      className="manifesto__generico font-display text-texto-fraco text-[1.35rem] leading-snug font-bold"
                    >
                      {item.generico}
                    </p>
                  </div>

                  <div className="manifesto__especifico-caixa relative">
                    {/* O nó do palco: acende quando a frase se resolve. */}
                    <span data-no aria-hidden="true" className="manifesto__no">
                      <span className="bg-determinacao block h-[7px] w-[7px] rotate-45" />
                    </span>
                    {/* Quebrada em palavras para se resolver uma a uma. O
                        leitor de tela lê a cópia inteira, não as palavras
                        soltas. */}
                    <p
                      data-especifico
                      className="manifesto__especifico text-texto-suave max-w-[62ch] leading-relaxed"
                    >
                      <span className="sr-only">{item.especifico}</span>
                      <span aria-hidden="true">
                        {item.especifico.split(" ").map((palavra, indice) => (
                          <Fragment key={indice}>
                            {indice > 0 ? " " : null}
                            <span data-palavra className="inline-block">
                              {palavra}
                            </span>
                          </Fragment>
                        ))}
                      </span>
                    </p>
                  </div>
                </li>
              ))}
            </ul>

            <div data-fecho className="manifesto__fecho mt-12">
              <span data-fecho-marca aria-hidden="true" className="manifesto__fecho-marca">
                <Simbolo className="text-texto h-14 w-11" />
              </span>
              <p className="text-texto-suave max-w-[62ch] leading-relaxed">
                Personalidade não é um efeito visual aplicado no fim. É a mesma
                decisão repetida em cada parte do projeto — até virar reconhecível.
              </p>
            </div>
          </div>
        </Container>
      </Section>
    </ManifestoCena>
  );
}
