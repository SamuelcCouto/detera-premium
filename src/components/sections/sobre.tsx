import { Estrelas } from "@/components/sections/estrelas";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { site } from "@/config/site";

/**
 * A seção conta a história da DETERA, não a de uma pessoa. Samuel entra como
 * fundador e responsável técnico — importante para a confiança, e não como o
 * produto que está sendo vendido.
 *
 * Editorial com coluna presa: o título e a frase-tese ficam parados à
 * esquerda enquanto o argumento e o fundador rolam à direita. A tese é o
 * que a seção inteira sustenta, então ela fica à vista durante toda a
 * leitura em vez de passar no primeiro parágrafo e sumir.
 *
 * `sticky` puro, sem JavaScript. Só gruda porque nenhum ancestral tem
 * `overflow: hidden` — o do céu fica no próprio `Estrelas`, que é irmão
 * da coluna, não pai.
 */
export function Sobre() {
  return (
    <Section id="sobre" tone="camada" aria-labelledby="sobre-titulo">
      <Estrelas
        quantidade={40}
        semente={62029}
        cadentes={2}
        cometas={1}
        nebulosa="determinacao"
        className="opacity-60"
      />

      <Container className="relative">
        <div className="grid gap-12 md:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] md:gap-16">
          <div className="md:sticky md:top-28 md:self-start">
            <h2 id="sobre-titulo" className="text-display max-w-[14ch]">
              Por que a DETERA existe
            </h2>
            <p className="font-display text-title mt-10 max-w-[22ch] leading-tight font-bold">
              Tecnologia sem estratégia vira ferramenta parada. Estratégia sem
              tecnologia vira promessa.
            </p>
          </div>

          <div>
            <p className="text-texto-suave max-w-[56ch] leading-relaxed">
              A maior parte do mercado escolhe um lado. De um lado, quem faz site
              bonito e não sabe o que acontece com ele depois. Do outro, quem
              entende de servidor e nunca se perguntou se aquela página vende. Os
              dois entregam metade do problema resolvido — e a conta dessa metade
              sobra para o cliente.
            </p>
            <p className="text-texto-suave mt-5 max-w-[56ch] leading-relaxed">
              A DETERA foi montada para não escolher. Estratégia, conteúdo,
              desenvolvimento, publicação e continuidade são partes do mesmo
              trabalho, porque na operação do cliente elas são inseparáveis: não
              adianta o site converter se ele sai do ar, e não adianta estar no ar
              se ninguém chega nele.
            </p>
            <p className="text-texto-suave mt-5 max-w-[56ch] leading-relaxed">
              O nome vem de determinação, e não é enfeite: é o critério de
              entrega. Um projeto só está bom quando aguenta a próxima mudança do
              negócio sem precisar recomeçar.
            </p>

            <div className="border-borda mt-12 border-t pt-8">
              {/* O nome vem primeiro e o papel vem em frase, não em etiqueta
                  espaçada por cima do título: a informação é a mesma e some
                  um vício de layout que aparecia sem precisar existir. */}
              <div className="flex items-center gap-3">
                <span
                  aria-hidden="true"
                  className="bg-sistema h-[7px] w-[7px] rotate-45"
                />
                <h3 className="text-heading">{site.founder}</h3>
              </div>
              <p className="text-texto-fraco mt-1.5 text-[0.9rem]">
                Fundador da {site.name}
              </p>
              <p className="text-texto-suave mt-4 max-w-[46ch] leading-relaxed">
                Mais de quatro anos em infraestrutura e cloud — hoje liderando um
                time responsável pela sustentação e disponibilidade de ambientes de
                produção — somados ao desenvolvimento web que virou a operação da
                DETERA.
              </p>
              <p className="text-texto-suave mt-4 max-w-[46ch] leading-relaxed">
                Na prática: quem projeta a página é quem entende o que acontece com
                ela às três da manhã de um domingo.
              </p>

              <a
                href={site.founderPortfolio}
                target="_blank"
                rel="noopener noreferrer"
                className="text-texto decoration-sistema hover:text-sistema-viva mt-6 inline-block font-semibold underline underline-offset-[6px] transition-colors"
              >
                Ver a trajetória técnica completa
              </a>
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
}
