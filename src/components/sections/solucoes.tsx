import { Estrelas } from "@/components/sections/estrelas";
import { Container } from "@/components/ui/container";
import { IconeSeta } from "@/components/ui/icones";
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
      aria-labelledby="solucoes-titulo"
    >
      {/* A seção mais densa da página: quatro frentes com cinco entregas
          cada. Céu no mínimo — aqui o fundo só precisa não ser preto
          chapado, e qualquer coisa além disso disputa com a leitura. */}
      <Estrelas
        quantidade={22}
        semente={81213}
        cadentes={1}
        cometas={0}
        className="opacity-40"
      />

      <Container className="relative">
        <h2 id="solucoes-titulo" className="text-display max-w-[15ch]">
          Quatro frentes, um sistema
        </h2>
        <p className="text-lead text-texto-suave mt-5 max-w-[60ch]">
          Não trabalhamos com uma lista de serviços soltos. O que a DETERA entrega
          se organiza em quatro frentes que se apoiam — e nenhuma delas se sustenta
          sozinha por muito tempo.
        </p>

        <div className="mt-16 flex flex-col gap-16 md:gap-24">
          {pilares.map((pilar) => {
            const ehSistema = pilar.acento === "sistema";
            return (
              <article
                key={pilar.id}
                id={pilar.id}
                data-surgir
                className="grid gap-8 md:grid-cols-[minmax(0,20rem)_1fr] md:gap-14"
              >
                <div className="md:sticky md:top-28 md:self-start">
                  {/* Sem numeração: o próprio texto da seção diz que as
                      quatro frentes se apoiam em vez de virem em ordem, e
                      numerar sugeria uma sequência que não existe. Quem
                      identifica a frente é o losango — vermelho para as que
                      movem, azul para a que sustenta. */}
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
                      "text-texto mt-6 inline-flex items-center gap-2 font-semibold underline underline-offset-[6px] transition-colors",
                      ehSistema
                        ? "decoration-sistema hover:text-sistema-viva"
                        : "decoration-determinacao hover:text-determinacao-viva",
                    )}
                  >
                    {pilar.ctaTexto}
                    <IconeSeta className="h-[18px] w-[18px]" />
                  </a>
                </div>

                <dl className="border-borda border-t">
                  {pilar.entregas.map((entrega) => (
                    <div
                      key={entrega.nome}
                      className="border-borda grid gap-1.5 border-b py-5 sm:grid-cols-[minmax(0,13rem)_1fr] sm:gap-8"
                    >
                      <dt className="font-display text-[1.02rem] font-bold">
                        {entrega.nome}
                      </dt>
                      <dd className="text-texto-suave max-w-[52ch] leading-relaxed">
                        {entrega.texto}
                      </dd>
                    </div>
                  ))}
                </dl>
              </article>
            );
          })}
        </div>
      </Container>
    </Section>
  );
}
