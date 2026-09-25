"use client";

import { useRef, type ReactNode } from "react";

import { COM_MOVIMENTO, gsap, useGSAP } from "@/lib/motion";

/**
 * Altura mínima para o palco. Numa tela deitada de celular não cabe o título
 * e um par inteiro ao mesmo tempo; ali o manifesto fica como lista.
 */
const COM_PALCO = `${COM_MOVIMENTO} and (min-height: 560px)`;

/** Unidades da timeline de cada par. Só a proporção importa: o scrub estica. */
const ENTRA = 0.35;
const CRISTALIZA = 0.7;
const FICA = 0.35;
const SAI = 0.35;

/**
 * O momento marcante: "de genérico a personalidade".
 *
 * A seção é fixada e vira um palco. Para cada par, a frase genérica entra
 * grande, em cinza; com a rolagem ela recua até virar rótulo e a frase
 * específica se resolve palavra por palavra, do blur para o nítido — o
 * contrário exato do hero, onde o nome se desfaz em blur. O nó vermelho
 * acende e o losango de progresso avança. Depois do quarto par, o fecho
 * ("…até virar reconhecível") entra com o coração da marca acendendo.
 *
 * Sem JavaScript, com movimento reduzido ou em tela baixa, nada disto roda e
 * a seção é a lista de antes. O modo palco é só uma classe
 * (`manifesto--palco`) que este componente põe e tira; o layout dele mora
 * no CSS. Por isso o HTML do servidor já é a versão legível.
 */
export function ManifestoCena({ children }: { children: ReactNode }) {
  const raiz = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add(COM_PALCO, () => {
        const secao = raiz.current!.querySelector<HTMLElement>(".manifesto")!;
        secao.classList.add("manifesto--palco");

        const pares = gsap.utils.toArray<HTMLElement>("[data-par]");
        const progresso = gsap.utils.toArray<HTMLElement>("[data-progresso-vivo]");

        // Antes do pin, a frase genérica desce até o centro do par: sozinha
        // na tela, ela ficaria alta demais, com o espaço da específica
        // (ainda invisível) sobrando embaixo.
        const descida = (par: HTMLElement) =>
          (par.querySelector<HTMLElement>("[data-especifico]")!.offsetHeight + 24) / 2;

        pares.forEach((par, indice) => {
          const generico = par.querySelector("[data-generico]");
          gsap.set(par, { autoAlpha: indice === 0 ? 1 : 0 });
          gsap.set(generico, {
            y: () => descida(par),
            opacity: indice === 0 ? 1 : 0,
            transformOrigin: "0% 100%",
          });
          gsap.set(par.querySelectorAll("[data-palavra]"), {
            opacity: 0,
            y: 14,
            filter: "blur(12px)",
          });
          gsap.set(par.querySelector("[data-no]"), { opacity: 0, scale: 0 });
        });
        gsap.set("[data-fecho]", { autoAlpha: 0, y: 30, filter: "blur(10px)" });
        gsap.set("[data-fecho-marca]", { scale: 0.6, filter: "drop-shadow(0 0 0px #ff3b3b)" });
        gsap.set(progresso, { opacity: 0 });

        const tl = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: secao,
            start: "top top",
            end: "+=320%",
            pin: true,
            scrub: true,
          },
        });

        pares.forEach((par, indice) => {
          const generico = par.querySelector("[data-generico]");
          const palavras = par.querySelectorAll("[data-palavra]");

          if (indice > 0) {
            tl.to(par, { autoAlpha: 1, duration: 0.01 }).fromTo(
              generico,
              { opacity: 0, filter: "blur(8px)" },
              { opacity: 1, filter: "blur(0px)", duration: ENTRA, ease: "power2.out" },
            );
          }

          tl.addLabel(`cristaliza-${indice}`)
            .to(
              generico,
              // Sobe rápido e assenta devagar (`out`), em 60% do tempo: tem
              // que sair da frente antes de a específica aparecer embaixo.
              { y: 0, scale: 0.56, opacity: 0.55, duration: CRISTALIZA * 0.6, ease: "power2.out" },
              `cristaliza-${indice}`,
            )
            .to(
              palavras,
              {
                opacity: 1,
                y: 0,
                filter: "blur(0px)",
                duration: CRISTALIZA * 0.4,
                ease: "power2.out",
                stagger: { amount: CRISTALIZA * 0.45 },
              },
              // Só depois que a genérica saiu da frente: começando junto,
              // no celular as primeiras palavras nasciam por baixo da última
              // linha dela, que ainda estava subindo.
              `cristaliza-${indice}+=${CRISTALIZA * 0.35}`,
            )
            .to(
              par.querySelector("[data-no]"),
              { opacity: 1, scale: 1, duration: 0.15, ease: "back.out(3)" },
              `cristaliza-${indice}+=${CRISTALIZA * 0.9}`,
            )
            .to(progresso[indice], { opacity: 1, duration: 0.12 }, "<")
            .to({}, { duration: FICA });

          tl.to(par, {
            autoAlpha: 0,
            y: -40,
            filter: "blur(6px)",
            duration: SAI,
            ease: "power1.in",
          });
        });

        tl.to("[data-fecho]", {
          autoAlpha: 1,
          y: 0,
          filter: "blur(0px)",
          duration: 0.45,
          ease: "power2.out",
        })
          .to(
            "[data-fecho-marca]",
            {
              scale: 1,
              filter: "drop-shadow(0 0 16px #ff3b3b)",
              duration: 0.35,
              ease: "power2.out",
            },
            "-=0.15",
          )
          .to({}, { duration: 0.4 });

        // O céu do manifesto sobe devagar durante o palco inteiro.
        tl.to("[data-manifesto-ceu]", { yPercent: -8, duration: tl.duration() }, 0);

        return () => secao.classList.remove("manifesto--palco");
      });
    },
    { scope: raiz },
  );

  return <div ref={raiz}>{children}</div>;
}
