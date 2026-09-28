import { SelecaoRolagem } from "@/components/motion/selecao-rolagem";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { pilares } from "@/content/pilares";
import { cn } from "@/lib/utils/cn";
import { whatsappUrl } from "@/lib/utils/whatsapp";

export function Solucoes() {
  return (
    <Section
      id="solucoes"
      alias="servicos"
      tone="camada"
      ceu={0.2}
      aria-labelledby="solucoes-titulo"
    >
      <Container className="relative">
        <h2 id="solucoes-titulo" className="text-display max-w-[15ch]">
          Quatro frentes, um sistema
        </h2>
        <p className="text-lead text-texto-suave mt-5 max-w-[60ch]">
          O que a DETERA entrega se organiza em quatro frentes que se apoiam.
          Nenhuma delas se sustenta sozinha por muito tempo.
        </p>

        {/* O cursor-coração acompanha a leitura das entregas
            (`SelecaoRolagem`): no desktop, a que cruza o meio da tela; no
            celular, o card encaixado no carrossel. */}
        <SelecaoRolagem className="mt-16 flex flex-col gap-16 md:gap-24">
          {pilares.map((pilar) => {
            const ehSistema = pilar.acento === "sistema";
            return (
              <article
                key={pilar.id}
                id={pilar.id}
                className="grid grid-cols-[minmax(0,1fr)] gap-8 md:grid-cols-[minmax(0,20rem)_minmax(0,1fr)] md:gap-14"
              >
                <div className="md:sticky md:top-28 md:self-start">
                  {/* Sem numeração: as quatro frentes se apoiam em vez de
                      virem em ordem. Quem identifica a frente é o losango,
                      vermelho para as que movem e azul para a que sustenta. */}
                  <div className="flex items-center gap-3">
                    <span
                      aria-hidden="true"
                      className={cn(
                        "h-[7px] w-[7px] rotate-45",
                        ehSistema ? "bg-sistema" : "bg-determinacao",
                      )}
                    />
                    <h3 className="text-title">{pilar.nome}</h3>
                  </div>
                  <p
                    className={cn(
                      "font-display mt-3 text-[1.15rem] leading-snug font-bold",
                      ehSistema ? "text-sistema-viva" : "text-determinacao-viva",
                    )}
                  >
                    {pilar.promessa}
                  </p>
                  <p className="text-texto-suave mt-4 leading-relaxed">
                    {pilar.descricao}
                  </p>

                  <a
                    href={whatsappUrl(pilar.mensagemWhatsapp)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn(
                      "escolha text-texto mt-6 inline-block font-semibold underline underline-offset-[6px]",
                      ehSistema ? "decoration-sistema" : "decoration-determinacao",
                    )}
                  >
                    {pilar.ctaTexto}
                  </a>
                </div>

                {/*
                  No celular as entregas viram um carrossel de deslizar
                  (`.deslize`): empilhadas, as quatro frentes davam mais de
                  seis telas de lista seguida. Rolagem nativa com encaixe, e a
                  ponta do próximo card aparecendo para dizer que há mais.

                  `min-w-0`, e as colunas da grade em `minmax(0, …)`: item de
                  grade não encolhe abaixo do próprio conteúdo por padrão, e o
                  conteúdo aqui é a faixa inteira de cards. Sem isso a faixa
                  alargava a página toda no celular.
                */}
                <div className="min-w-0">
                  <p
                    aria-hidden="true"
                    className="text-texto-fraco mb-3 text-[0.8rem] md:hidden"
                  >
                    Deslize para ver as {pilar.entregas.length} entregas
                  </p>
                  <dl className="deslize border-borda md:border-t">
                    {pilar.entregas.map((entrega) => (
                      <div
                        key={entrega.nome}
                        data-entrega
                        className="entrega border-borda max-md:bg-camada-alta grid content-start gap-1.5 border-b py-5 max-md:rounded-[4px] max-md:border max-md:p-5 max-md:pl-9 md:grid-cols-[minmax(0,13rem)_1fr] md:gap-8"
                      >
                        <dt className="alma-marca font-display text-[1.02rem] font-bold">
                          {entrega.nome}
                        </dt>
                        <dd className="text-texto-suave max-w-[52ch] leading-relaxed">
                          {entrega.texto}
                        </dd>
                      </div>
                    ))}
                  </dl>
                </div>
              </article>
            );
          })}
        </SelecaoRolagem>
      </Container>
    </Section>
  );
}
