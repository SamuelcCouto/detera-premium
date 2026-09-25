import type { ReactNode } from "react";

import { Contador } from "@/components/motion/contador";
import { PreviaCase } from "@/components/sections/case-preview";
import { Estrelas } from "@/components/sections/estrelas";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { IconeLinkExterno } from "@/components/ui/icones";
import { Section } from "@/components/ui/section";
import { cases, type Medicao } from "@/content/cases";
import { projetosEmConstrucao } from "@/content/em-construcao";

/**
 * Fuso fixo em UTC: `new Date("2026-09-22")` é meia-noite em UTC, e formatado
 * no fuso de Brasília viraria dia 21 num build feito aqui — o mesmo dado
 * saindo com datas diferentes dependendo de onde o site foi compilado.
 */
const formatarData = new Intl.DateTimeFormat("pt-BR", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

/**
 * As notas medidas do site no ar, com a origem logo abaixo: perfil, fonte,
 * data e o link do relatório. A procedência vem junto do número, não num
 * rodapé separado — número sem origem é exatamente o tipo de coisa que este
 * site se recusa a publicar.
 *
 * As notas não ganham as cores de semáforo do Google. O número de 0 a 100 já
 * se explica, e verde/laranja/vermelho trariam para dentro do card a
 * linguagem visual de outra ferramenta. Quem quiser a leitura colorida tem o
 * relatório a um clique.
 *
 * `@container`: o card muda de largura conforme a grade (coluna única no
 * celular, duas colunas estreitas no tablet, duas largas no desktop), e é a
 * largura do card — não a da tela — que decide se as quatro notas cabem
 * lado a lado ou vão em duas linhas.
 */
function NotasMedidas({ medicao }: { medicao: Medicao }) {
  const notas = [
    { rotulo: "Desempenho", valor: medicao.desempenho },
    { rotulo: "Acessibilidade", valor: medicao.acessibilidade },
    { rotulo: "Práticas recomendadas", valor: medicao.praticas },
    { rotulo: "SEO", valor: medicao.seo },
  ];

  return (
    <figure className="@container border-borda mt-5 border-t pt-4">
      <dl className="grid grid-cols-2 gap-x-4 gap-y-3 @md:grid-cols-4">
        {notas.map((nota) => (
          <div key={nota.rotulo} className="flex flex-col gap-1">
            {/* No DOM o rótulo vem antes (leitor de tela diz "Desempenho,
                91"); na tela o número sobe para cima dele. */}
            <dt className="text-texto-fraco text-[0.74rem] leading-tight">{nota.rotulo}</dt>
            {/* Conta até o valor medido quando entra na tela. O HTML já
                traz o número final — é ele que o buscador, o leitor de
                tela e quem não roda JavaScript recebem. */}
            <dd className="font-display text-texto order-first text-[1.6rem] leading-none font-bold tabular-nums">
              <Contador valor={nota.valor} />
            </dd>
          </div>
        ))}
      </dl>

      <figcaption className="text-texto-fraco mt-3.5 text-[0.8rem] leading-relaxed">
        Celular com 4G lento, simulado pelo PageSpeed Insights do Google em{" "}
        <time dateTime={medicao.data}>{formatarData.format(new Date(medicao.data))}</time>.{" "}
        <a
          href={medicao.relatorio}
          target="_blank"
          rel="noopener noreferrer"
          className="text-texto-suave hover:text-texto decoration-borda-viva inline-flex items-center gap-1 underline underline-offset-4 transition-colors"
        >
          Abrir o relatório
          <IconeLinkExterno className="h-3.5 w-3.5 shrink-0" />
        </a>
      </figcaption>
    </figure>
  );
}

/**
 * Rótulo de etapa do case, empilhado (não em coluna ao lado do texto): o card
 * divide a tela com outro, e uma coluna de rótulo fixa não sobraria largura
 * nenhuma numa faixa dessa largura.
 */
function Etapa({ rotulo, children }: { rotulo: string; children: ReactNode }) {
  return (
    <div className="border-borda border-t py-4">
      <dt className="font-display text-determinacao-viva text-[0.82rem] font-bold">
        {rotulo}
      </dt>
      <dd className="text-texto-suave mt-1.5 text-[0.92rem] leading-relaxed">{children}</dd>
    </div>
  );
}

export function Cases() {
  return (
    /* id herdado do site anterior: `#projetos` já circula em links. */
    <Section id="projetos" tone="camada" aria-labelledby="cases-titulo">
      {/* Céu discreto: os dois cases trazem imagem real e cheia de cor, e é
          nelas que o olho deve bater primeiro. */}
      <Estrelas
        quantidade={30}
        cadentes={2}
        cometas={1}
        nebulosa="determinacao"
        className="opacity-50"
      />

      <Container className="relative">
        <h2 id="cases-titulo" className="text-subdisplay max-w-[15ch]">
          O que já construímos
        </h2>
        <p className="text-lead text-texto-suave mt-5 max-w-[60ch]">
          Dois projetos, dois problemas diferentes. Nos dois, a parte mais longa do
          trabalho aconteceu antes da primeira linha de código.
        </p>

        <div className="mt-14 grid gap-8 md:grid-cols-2">
          {cases.map((caso) => (
            <article key={caso.id} data-surgir className="bloco flex flex-col">
              <PreviaCase
                href={caso.url}
                dominio={caso.urlRotulo}
                imagens={caso.imagens}
              />

              <div className="flex flex-1 flex-col p-5 sm:p-6">
                <p className="text-texto-fraco text-[0.78rem]">{caso.setor}</p>
                <h3 className="text-heading mt-1">{caso.cliente}</h3>
                <p className="text-texto-suave mt-2 text-[0.94rem] leading-relaxed">
                  {caso.resumo}
                </p>

                <ul className="mt-4 flex flex-wrap gap-1.5">
                  {caso.tecnologias.map((tec) => (
                    <li
                      key={tec}
                      className="border-borda text-texto-suave rounded-[2px] border px-2 py-0.5 text-[0.76rem]"
                    >
                      {tec}
                    </li>
                  ))}
                </ul>

                {caso.medicao ? <NotasMedidas medicao={caso.medicao} /> : null}

                {/*
                  A história inteira fica recolhida. Quem só quer saber quem é o
                  cliente e o que foi feito lê quatro linhas e vai embora; quem
                  quer o raciocínio abre. `<details>` faz isso sem JavaScript e
                  já vem com semântica de botão para leitor de tela.
                */}
                <details className="group/hist border-borda mt-5 border-t pt-4">
                  <summary className="text-texto hover:text-determinacao-viva flex cursor-pointer list-none items-center gap-2 text-[0.88rem] font-semibold transition-colors [&::-webkit-details-marker]:hidden">
                    <span
                      aria-hidden="true"
                      className="text-determinacao transition-transform duration-200 group-open/hist:rotate-90"
                    >
                      ▸
                    </span>
                    <span className="group-open/hist:hidden">Ver a história completa</span>
                    <span className="hidden group-open/hist:inline">Recolher a história</span>
                  </summary>

                  <dl className="mt-2">
                    <Etapa rotulo="Problema">{caso.desafio}</Etapa>
                    <Etapa rotulo="Estratégia">{caso.estrategia}</Etapa>
                    <Etapa rotulo="Construção">
                      <ul className="flex flex-col gap-2">
                        {caso.solucao.map((item) => (
                          <li key={item} className="relative pl-4">
                            <span
                              aria-hidden="true"
                              className="bg-borda-viva absolute top-[0.65em] left-0 h-px w-2.5"
                            />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </Etapa>
                    <Etapa rotulo="Resultado">{caso.impacto}</Etapa>
                  </dl>
                </details>

                {/* A prova mais forte de um site é o site. */}
                <ButtonLink
                  href={caso.url}
                  variant="contorno"
                  size="sm"
                  className="mt-5 h-auto flex-wrap justify-start py-2.5 text-left whitespace-normal"
                >
                  Ver o site no ar
                  <span className="text-texto-fraco font-normal">{caso.urlRotulo}</span>
                  <IconeLinkExterno className="h-4 w-4 shrink-0" />
                </ButtonLink>
              </div>
            </article>
          ))}
        </div>

        {/* Projetos que já estão no ar, mas ainda não fecharam um ciclo para
            virar estudo de caso — sem problema/estratégia/resultado, e por
            isso separados dos dois acima em vez de misturados a eles. */}
        {projetosEmConstrucao.length > 0 ? (
          <div className="border-borda mt-16 border-t pt-12">
            <h3 className="text-heading">Também em obra</h3>
            <p className="text-texto-suave mt-2 max-w-[52ch] text-[0.94rem] leading-relaxed">
              No ar e em desenvolvimento — ainda sem um ciclo fechado para contar
              como case.
            </p>

            <div className="mt-8 grid gap-6 sm:grid-cols-2">
              {projetosEmConstrucao.map((projeto) => (
                <article key={projeto.id} data-surgir className="bloco flex flex-col">
                  <PreviaCase
                    href={projeto.url}
                    dominio={projeto.urlRotulo}
                    imagens={projeto.imagens}
                    iframe={projeto.iframe}
                    emConstrucao
                  />
                  <div className="p-5">
                    <p className="text-texto-fraco text-[0.78rem]">{projeto.setor}</p>
                    <h4 className="font-display mt-1 text-[1.02rem] font-bold">
                      {projeto.cliente}
                    </h4>
                    <p className="text-texto-suave mt-2 text-[0.9rem] leading-relaxed">
                      {projeto.resumo}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        ) : null}
      </Container>
    </Section>
  );
}
