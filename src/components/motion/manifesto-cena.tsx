"use client";

import { useRef, type ReactNode } from "react";

import { falar } from "@/lib/fala";
import { COM_MOVIMENTO, gsap, useGSAP } from "@/lib/motion";
import { montarCoracao } from "@/lib/montar-coracao";

/**
 * Altura mínima para o palco. Numa tela deitada de celular não cabe o título
 * e um par inteiro ao mesmo tempo; ali o manifesto fica como lista.
 */
const COM_PALCO = `${COM_MOVIMENTO} and (min-height: 560px)`;

/** Unidades da timeline. Só a proporção importa: o scrub estica. */
const GENERICA = 0.14;
const ESPECIFICA = 0.6;
const LEITURA = 0.26;
const FECHO = 0.45;

/**
 * O manifesto como diálogo: "transformando ideias em personalidade" dito,
 * não explicado.
 *
 * A seção fica fixada e vira uma caixa de fala. Para cada par, a ideia
 * genérica aparece em cinza, o coração vermelho marca quem vai falar e a
 * frase específica sai letra a letra embaixo dela, no ritmo da rolagem — com
 * a pausa depois de cada vírgula e ponto. Lida a frase, o losango do par
 * acende e fica aceso (salvo), e a fala avança de uma vez para o próximo par,
 * como uma caixa de diálogo que troca de página. No fim, o coração se monta
 * bloco a bloco ao lado da última frase: o gesto-assinatura de novo, agora
 * fechando o argumento.
 *
 * Sem JavaScript, com movimento reduzido ou em tela baixa, nada disto roda e
 * a seção é a lista de sempre: o modo palco é só a classe `manifesto--palco`,
 * que este componente põe e tira, com o layout no CSS.
 */
export function ManifestoCena({ children }: { children: ReactNode }) {
  const raiz = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add(COM_PALCO, () => {
        const secao = raiz.current!.querySelector<HTMLElement>(".manifesto")!;
        secao.classList.add("manifesto--palco");

        // O bloco de fala dentro de um elemento, e quantas letras ele tem.
        const falaDe = (el: Element, seletor: string) =>
          el.querySelector(`${seletor} [data-fala]`)!;
        const letras = (bloco: Element) => bloco.querySelectorAll("[data-fala-letra]").length;

        const pares = gsap.utils.toArray<HTMLElement>("[data-par]");
        const progresso = gsap.utils.toArray<HTMLElement>("[data-progresso-vivo]");
        const fecho = raiz.current!.querySelector<HTMLElement>("[data-fecho]")!;
        const marca = fecho.querySelector<SVGSVGElement>("[data-fecho-marca] svg")!;
        const falaDoFecho = falaDe(fecho, "[data-fecho-texto]");

        gsap.set(progresso, { opacity: 0 });
        gsap.set(fecho, { autoAlpha: 0 });
        pares.forEach((par, i) => {
          gsap.set(par, { autoAlpha: i === 0 ? 1 : 0 });
          gsap.set(par.querySelector("[data-voz]"), { opacity: 0 });
        });

        const tl = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: secao,
            start: "top top",
            end: "+=240%",
            pin: true,
            scrub: true,
            anticipatePin: 1,
          },
        });

        let t = 0;
        pares.forEach((par, i) => {
          const generica = falaDe(par, "[data-generico]");
          const especifica = falaDe(par, "[data-especifico]");

          // A primeira ideia genérica já está na tela quando a seção chega;
          // as outras são faladas quando o par entra.
          if (i > 0) {
            tl.set(par, { autoAlpha: 1 }, t);
            t = falar(tl, generica, { inicio: t, porLetra: GENERICA / letras(generica), pausa: 1 }) + 0.04;
          }
          tl.set(par.querySelector("[data-voz]"), { opacity: 1 }, t);
          t = falar(tl, especifica, {
            inicio: t + 0.02,
            porLetra: ESPECIFICA / letras(especifica),
            pausa: 4,
          });
          tl.set(progresso[i], { opacity: 1 }, t);
          t += LEITURA;
          // A fala avança de página: o par sai de uma vez, sem transição.
          tl.set(par, { autoAlpha: 0 }, t);
          t += 0.02;
        });

        tl.set(fecho, { autoAlpha: 1 }, t);
        t = montarCoracao(tl, marca, { inicio: t, passo: 0.02 });
        t = falar(tl, falaDoFecho, {
          inicio: t - 0.12,
          porLetra: FECHO / letras(falaDoFecho),
          pausa: 4,
        });
        tl.to({}, { duration: 0.35 }, t);

        return () => secao.classList.remove("manifesto--palco");
      });
    },
    { scope: raiz },
  );

  return <div ref={raiz}>{children}</div>;
}
