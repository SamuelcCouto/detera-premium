import { Estrelas } from "@/components/sections/estrelas";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { perguntas } from "@/content/perguntas";

/**
 * `<details>` nativo: abre e fecha sem JavaScript, já vem com semântica de
 * botão para leitor de tela e o conteúdo continua no HTML entregue — o que
 * importa porque essas respostas também servem para a busca.
 */
export function Perguntas() {
  return (
    <Section id="perguntas" tone="vazio" aria-labelledby="perguntas-titulo">
      {/* O ponto mais quieto da página: a pessoa chega aqui para tirar uma
          dúvida objetiva, não para ser impressionada. */}
      <Estrelas
        quantidade={16}
        semente={5150}
        cadentes={1}
        cometas={0}
        className="opacity-35"
      />

      <Container className="relative">
        <div className="grid gap-10 md:grid-cols-[minmax(0,20rem)_1fr] md:gap-16">
          <div className="md:sticky md:top-28 md:self-start">
            <h2 id="perguntas-titulo" className="text-title max-w-[16ch]">
              Antes de falar com a gente
            </h2>
            <p className="text-lead text-texto-suave mt-5 max-w-[34ch]">
              As dúvidas que mais aparecem na primeira conversa, respondidas aqui
              para você não precisar perguntar.
            </p>
          </div>

          <div className="border-borda border-t">
            {perguntas.map((item) => (
              <details key={item.pergunta} className="border-borda group border-b">
                <summary className="flex cursor-pointer list-none items-start justify-between gap-6 py-6 [&::-webkit-details-marker]:hidden">
                  <h3 className="text-heading font-display group-hover:text-determinacao-viva font-bold transition-colors">
                    {item.pergunta}
                  </h3>
                  {/* Cruz que vira traço ao abrir: o estado do bloco fica
                      visível sem depender de texto. */}
                  <span
                    aria-hidden="true"
                    className="text-determinacao relative mt-2 h-[14px] w-[14px] shrink-0"
                  >
                    <span className="absolute top-1/2 left-0 h-px w-full -translate-y-1/2 bg-current" />
                    <span className="absolute top-0 left-1/2 h-full w-px -translate-x-1/2 bg-current transition-transform duration-200 group-open:scale-y-0" />
                  </span>
                </summary>
                <p className="text-texto-suave max-w-[62ch] pb-6 leading-relaxed">
                  {item.resposta}
                </p>
              </details>
            ))}
          </div>
        </div>
      </Container>
    </Section>
  );
}
