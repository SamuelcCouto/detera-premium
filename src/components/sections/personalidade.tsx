import { TextoFala } from "@/components/brand/texto-fala";
import { Simbolo } from "@/components/brand/wordmark";
import { ManifestoCena } from "@/components/motion/manifesto-cena";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { transformacoes } from "@/content/personalidade";
import { site } from "@/config/site";

/**
 * O manifesto. É o único lugar do site onde o slogan é explicado; depois
 * daqui ele não precisa mais ser repetido, só sustentado pelo resto.
 *
 * Com movimento, `ManifestoCena` fixa a seção e transforma a lista numa
 * caixa de fala. O HTML abaixo é a lista legível de sempre; o palco é só a
 * classe `manifesto--palco` por cima (ver o CSS). Os `data-*` são os ganchos
 * da coreografia; as classes `manifesto__*` são o layout do palco.
 */
export function Personalidade() {
  return (
    <ManifestoCena>
      <Section
        id="personalidade"
        tone="vazio"
        space="generous"
        ceu={0.85}
        aria-labelledby="personalidade-titulo"
        className="manifesto overflow-hidden"
      >
        <Container className="manifesto__grade relative">
          <div className="manifesto__cabeca max-w-[60ch]">
            <h2 id="personalidade-titulo" className="text-subdisplay">
              {site.slogan}
            </h2>
            <p className="manifesto__lead text-lead text-texto-suave mt-5">
              É a frase que orienta cada projeto. Quatro decisões que separam o
              que só funciona do que também tem cara própria.
            </p>

            {/* Um losango por par, aceso quando a frase dele termina: o
                progresso salvo. Só existe no palco; na lista, a ordem já está
                na própria lista. */}
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
                  <p
                    data-generico
                    className="manifesto__generico font-display text-texto-fraco text-[1.35rem] leading-snug font-bold"
                  >
                    <TextoFala texto={item.generico} />
                  </p>

                  <p
                    data-especifico
                    className="manifesto__especifico text-texto-suave max-w-[62ch] leading-relaxed"
                  >
                    {/* O coração vermelho marca quem fala, como a alma na
                        caixa de diálogo. Só aparece no palco. */}
                    <span data-voz aria-hidden="true" className="manifesto__voz" />
                    <TextoFala texto={item.especifico} />
                  </p>
                </li>
              ))}
            </ul>

            <div data-fecho className="manifesto__fecho mt-12">
              <span data-fecho-marca aria-hidden="true" className="manifesto__fecho-marca">
                <Simbolo montavel="fecho-coracao" className="text-texto h-24 w-[4.8rem]" />
              </span>
              <p data-fecho-texto className="text-texto-suave max-w-[62ch] leading-relaxed">
                <TextoFala texto="Personalidade é a mesma decisão repetida em cada parte do projeto, até virar reconhecível." />
              </p>
            </div>
          </div>
        </Container>
      </Section>
    </ManifestoCena>
  );
}
