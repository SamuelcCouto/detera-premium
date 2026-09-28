"use client";

import { useRef, useState } from "react";

import type { ImagemPrevia } from "@/content/cases";
import { criarGrade } from "@/lib/grade";
import { COM_MOVIMENTO, gsap, useGSAP } from "@/lib/motion";
import { cn } from "@/lib/utils/cn";

/** Semente da ordem dos blocos, tirada do domínio: cada print monta diferente. */
const sementeDe = (texto: string) =>
  [...texto].reduce((soma, letra) => (soma * 31 + letra.charCodeAt(0)) | 0, 7);

/** Frases que se revezam na obra. Piada discreta: nunca termina. */
const recadosDeObra = ["levantando as paredes", "conferindo o prumo", "quase lá"];

/**
 * Duração de uma volta completa do rodízio — de fotos e de recados.
 *
 * O ciclo é fixo e o intervalo entre um item e o próximo é que se ajusta ao
 * número deles. Antes era o contrário (4s por item), e três recados davam
 * uma volta de 12 segundos: quem passasse os olhos pelo card não via a
 * segunda frase nunca.
 */
const CICLO = 6.9;

/**
 * A moldura de navegador em volta da prévia do projeto: pontos, barra de
 * endereço com o domínio real, e o conteúdo dentro.
 *
 * Três modos, nessa ordem de preferência:
 *
 * 1. `imagens` — uma ou mais fotos servidas do nosso próprio `public/`. Mais
 *    de uma vira um slideshow em fade, feito só com `animation-delay`
 *    escalonado: sem estado, sem timer, sem re-render.
 * 2. `iframe` — o site de verdade, reduzido e sem interação. Serve para
 *    projeto que não tem imagem nenhuma para emprestar: é a prévia mais
 *    honesta possível, porque é literalmente o site.
 * 3. Nenhum dos dois — um aviso, que também cobre o caso de a imagem falhar.
 */
export function PreviaCase({
  href,
  dominio,
  imagens,
  iframe = false,
  emConstrucao = false,
}: {
  href: string;
  dominio: string;
  imagens?: ImagemPrevia[];
  iframe?: boolean;
  /** Marca o projeto como ainda em obra: selo, barra e recados. */
  emConstrucao?: boolean;
}) {
  const [falhou, setFalhou] = useState(false);
  const temImagens = Boolean(imagens?.length) && !falhou;
  const tela = useRef<HTMLDivElement>(null);

  /*
    O print se monta bloco a bloco enquanto o card entra: uma grade de blocos
    da cor da tela desligada cobre a imagem, e os blocos apagam um de cada
    vez, numa ordem sorteada pelo domínio, até a imagem inteira aparecer —
    como um jogo antigo desenhando a tela. Amarrado à rolagem: voltando, a
    tela desmonta.

    Substitui a cortina que abria do centro, que era o gesto de outra marca.
    A grade é uma camada própria (`data-montagem`), então não disputa nada
    com o zoom do hover e o rodízio, que são das fotos.
  */
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(COM_MOVIMENTO, () => {
        const el = tela.current!;
        const cobertura = el.querySelector<HTMLElement>("[data-montagem]")!;
        const grade = criarGrade(cobertura, {
          lado: el.clientWidth / 10,
          semente: sementeDe(dominio),
          classe: "grade-bloco grade-bloco--tela",
        });
        gsap.to(grade.blocos, {
          opacity: 0,
          duration: 0.01,
          ease: "none",
          stagger: { amount: 1 },
          scrollTrigger: { trigger: el, start: "top 88%", end: "top 42%", scrub: true },
        });
        return () => grade.remover();
      });
    },
    { scope: tela },
  );

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Abrir ${dominio} em uma nova aba`}
      className="bloco group relative block overflow-hidden"
    >
      {/* A faixa com o domínio de verdade. Sem as três bolinhas de janela:
          elas só enfeitavam, e o endereço é a informação. */}
      {/* Passando o ponteiro ou o foco no card, o cursor-coração marca o
          domínio: o card inteiro é a escolha. */}
      <div className="border-borda bg-camada-alta relative flex items-center gap-1.5 border-b py-2.5 pr-3.5 pl-7">
        <span className="alma-marca text-texto-fraco min-w-0 text-[0.8rem]">
          <span className="block truncate">{dominio}</span>
        </span>

        {emConstrucao ? (
          <span className="estado text-sistema-viva ml-auto shrink-0 pl-2">
            <span aria-hidden="true" className="bg-sistema h-[5px] w-[5px] rotate-45" />
            Em obra
          </span>
        ) : null}

        {/* A barra que enche e recomeça: o projeto avança, mas obra é obra. */}
        {emConstrucao ? (
          <span
            aria-hidden="true"
            className="bg-borda absolute inset-x-0 -bottom-px h-[2px] overflow-hidden"
          >
            <span className="bg-sistema obra-barra block h-full w-full origin-left" />
          </span>
        ) : null}
      </div>

      <div ref={tela} className="bg-camada-alta relative aspect-[16/9] overflow-hidden">
        <div className="absolute inset-0">
          {temImagens ? (
            imagens!.map((imagem, indice) => (
              // eslint-disable-next-line @next/next/no-img-element -- o slideshow empilha as fotos e cruza opacidade; `next/image` com `fill` aqui só acrescentaria camadas sem ganho
              <img
                key={imagem.url}
                src={imagem.url}
                alt={imagem.alt}
                loading="lazy"
                onError={() => setFalhou(true)}
                style={{
                  objectPosition: imagem.pos ?? "50% 50%",
                  animationDelay: `${(indice * CICLO) / imagens!.length}s`,
                  animationDuration: `${CICLO}s`,
                }}
                className={cn(
                  "absolute inset-0 h-full w-full object-cover",
                  // A primeira foto é a camada de baixo e nunca some.
                  indice > 0 && "previa-slide",
                )}
              />
            ))
          ) : iframe && !falhou ? (
            <>
              {/*
                1280px renderizados e reduzidos à metade: o site aparece com o
                layout de desktop, não com o mobile espremido. A escala é fixa e
                generosa de propósito — 640px cobrem o card mais largo possível
                (o container trava em 1216px, então cada coluna dá ~596px), e o
                que sobra é cortado pelo `overflow`. Sobrar é melhor que faltar:
                faltando, apareceria faixa vazia na moldura.
                `pointer-events` desligado para o clique pertencer ao link.
              */}
              <iframe
                src={href}
                title={`Prévia do site ${dominio}`}
                loading="lazy"
                tabIndex={-1}
                aria-hidden="true"
                /**
                 * `sandbox` vazio: nenhuma permissão. A prévia precisa só de
                 * HTML e CSS, e sem `allow-scripts` o JavaScript do site de
                 * terceiro simplesmente não roda dentro da nossa página — nem
                 * animação, nem analytics, nem cookie dele. Se aquele projeto
                 * for comprometido um dia, o código invasor não tem onde
                 * executar aqui. Também tira a página do alcance da LGPD por
                 * rastreamento de terceiro embutido.
                 */
                sandbox=""
                referrerPolicy="no-referrer"
                onError={() => setFalhou(true)}
                className="pointer-events-none absolute top-0 left-0 h-[800px] w-[1280px] origin-top-left border-0"
                style={{ transform: "scale(0.5)" }}
              />
              <span className="from-vazio/40 pointer-events-none absolute inset-0 bg-gradient-to-t to-transparent" />
            </>
          ) : (
            <span className="text-texto-fraco absolute inset-0 flex items-center justify-center p-6 text-center text-[0.85rem]">
              Pré-visualização indisponível. Clique para ver o site no ar.
            </span>
          )}
        </div>

        {/* A cobertura que se desmonta em blocos (preenchida pelo cliente). */}
        <div data-montagem aria-hidden="true" className="montagem" />

        {/* Os recados só aparecem na obra, e um de cada vez. */}
        {emConstrucao ? (
          <span className="pointer-events-none absolute right-3 bottom-3 left-3 flex justify-end">
            <span className="bg-vazio/80 border-borda relative h-[1.4rem] overflow-hidden rounded-[2px] border px-2 backdrop-blur-sm">
              <span className="sr-only">Projeto em construção</span>
              {recadosDeObra.map((recado, indice) => (
                <span
                  key={recado}
                  aria-hidden="true"
                  style={{
                    animationDelay: `${(indice * CICLO) / recadosDeObra.length}s`,
                    animationDuration: `${CICLO}s`,
                  }}
                  className={cn(
                    "estado text-texto-fraco absolute inset-0 flex items-center justify-center whitespace-nowrap",
                    indice > 0 && "obra-recado",
                  )}
                >
                  {recado}
                </span>
              ))}
              {/* Fantasma invisível: dá largura ao balão sem depender de JS. */}
              <span aria-hidden="true" className="estado invisible">
                {recadosDeObra[0]}
              </span>
            </span>
          </span>
        ) : null}
      </div>
    </a>
  );
}
