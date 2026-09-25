"use client";

import { useRef, type ReactNode } from "react";

import { COM_MOVIMENTO, gsap, useGSAP } from "@/lib/motion";

/**
 * Tela onde o hero cabe inteiro em 100svh. Abaixo disso (celular, notebook
 * deitado de altura curta) ele não é fixado: com pin, o que passasse da
 * altura da tela ficaria escondido durante o trecho fixado e já sairia
 * desfeito dele — a trilha de frentes nunca seria vista.
 */
const AMPLO = "(min-width: 768px) and (min-height: 640px)";

/**
 * Centro do símbolo sob o "A", em unidades do `viewBox` do `Letreiro`
 * (`translate(631 140) scale(1.3)` sobre a caixa de 32 × 40 do símbolo), e
 * a largura desse `viewBox`. Com os dois se converte pixel de tela em
 * unidade do SVG.
 */
const CORACAO = { x: 631 + 16 * 1.3, y: 140 + 20 * 1.3 };
const LARGURA_NOME = 716;

/**
 * O hero fixado: a seção fica parada por 90% da altura da tela enquanto o
 * nome se desfaz letra por letra, da esquerda para a direita, com blur — e o
 * céu atrás avança, como se a câmera entrasse nele. O coração sob o "A" é o
 * que não se desfaz: vai para o centro da tela, cresce e acende. Sem ele, o
 * fim do trecho fixado era uma tela inteira de céu vazio subindo.
 *
 * Só coreografia. O conteúdo inteiro vem de `hero.tsx`, que continua sendo
 * componente de servidor; aqui ele chega como `children` e é encontrado pelos
 * atributos `data-hero-*`, não pelas classes de estilo — o visual pode mudar
 * sem quebrar a animação.
 *
 * O `div` de fora é deste componente e fica fora do pin: o GSAP põe o
 * "pin-spacer" entre ele e a `<section>`, e o `useGSAP` desfaz isso antes de
 * o React remover os nós. O marco `data-fim-do-hero` no fim dele é o que o
 * cabeçalho observa para virar vidro fosco.
 */
export function HeroCena({ children }: { children: ReactNode }) {
  const raiz = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add({ movimento: COM_MOVIMENTO, amplo: AMPLO }, (contexto) => {
        const { movimento, amplo } = contexto.conditions as {
          movimento: boolean;
          amplo: boolean;
        };
        if (!movimento) return;

        const palco = raiz.current!.querySelector<HTMLElement>(".hero-palco")!;
        const nome = raiz.current!.querySelector<SVGSVGElement>("[data-hero-nome] svg")!;

        // Quanto o coração anda, em unidades do SVG, até o centro da tela.
        // Medido em relação ao palco, e não à janela: durante o pin o palco
        // está `fixed` no topo e a janela já rolou, então somar `scrollY`
        // daria o dobro do caminho.
        const rumoDoCoracao = () => {
          const caixa = nome.getBoundingClientRect();
          const base = palco.getBoundingClientRect();
          const escala = caixa.width / LARGURA_NOME;
          return {
            x: (palco.clientWidth / 2 - (caixa.left - base.left + CORACAO.x * escala)) / escala,
            y:
              (window.innerHeight * 0.52 - (caixa.top - base.top + CORACAO.y * escala)) /
              escala,
          };
        };

        const tl = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: amplo
            ? {
                trigger: palco,
                start: "top top",
                end: "+=90%",
                pin: true,
                scrub: true,
                // O caminho do coração depende do tamanho da tela.
                invalidateOnRefresh: true,
              }
            : // Sem pin, o nome se desfaz enquanto a seção sobe normalmente.
              { trigger: palco, start: "top top", end: "60% top", scrub: true },
        });

        tl
          // A luz vermelha é recortada pelos contornos parados das letras:
          // se continuasse, varreria o lugar vazio onde o nome estava.
          .to(".marca-varredura", { opacity: 0, duration: 0.08 }, 0)
          .to(
            "[data-hero-nome] [data-letra-desfaz]",
            {
              opacity: 0,
              filter: "blur(14px)",
              xPercent: 18,
              ease: "power1.in",
              duration: 0.4,
              stagger: 0.06,
            },
            0.02,
          )
          .to(
            "[data-hero-slogan] [data-letra-desfaz]",
            {
              opacity: 0,
              filter: "blur(8px)",
              x: 10,
              ease: "power1.in",
              duration: 0.3,
              stagger: { amount: 0.3 },
            },
            0.08,
          )
          .to(
            "[data-hero-resto]",
            {
              opacity: 0,
              y: -18,
              filter: "blur(4px)",
              ease: "power1.in",
              duration: 0.3,
              stagger: 0.05,
            },
            0.14,
          )
          .to("[data-hero-nave]", { opacity: 0, duration: 0.3 }, 0)
          .fromTo("[data-hero-ceu]", { scale: 1 }, { scale: 1.14, duration: 1 }, 0)
          .to("[data-hero-aura]", { scale: 1.45, opacity: 0.3, duration: 1 }, 0);

        if (amplo) {
          tl.to(
            "[data-hero-coracao]",
            {
              x: () => rumoDoCoracao().x,
              y: () => rumoDoCoracao().y,
              scale: 2.8,
              transformOrigin: "50% 50%",
              duration: 0.55,
              ease: "power2.inOut",
            },
            0.35,
          ).fromTo(
            "[data-hero-coracao]",
            { filter: "drop-shadow(0 0 0px rgba(255, 59, 59, 0))" },
            { filter: "drop-shadow(0 0 7px rgba(255, 59, 59, 0.85))", duration: 0.3 },
            0.62,
          );
        } else {
          // Sem pin o hero sobe enquanto se desfaz; um coração viajando pela
          // tela nessa hora pareceria solto. Some junto com o nome.
          tl.to(
            "[data-hero-coracao]",
            { opacity: 0, filter: "blur(10px)", ease: "power1.in", duration: 0.3 },
            0.3,
          );
        }

        // Depois de solto, o céu desce mais devagar que a página. É outra
        // camada (`-paralaxe`), não a mesma do avanço acima: duas animações
        // no `transform` do mesmo elemento brigariam pelo valor inicial.
        if (amplo) {
          gsap.to("[data-hero-ceu-paralaxe]", {
            yPercent: 28,
            ease: "none",
            scrollTrigger: {
              trigger: raiz.current,
              start: "bottom bottom",
              end: "bottom top",
              scrub: true,
            },
          });
        }
      });
    },
    { scope: raiz },
  );

  return (
    <div ref={raiz} className="relative">
      {children}
      <span
        data-fim-do-hero
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-px"
      />
    </div>
  );
}
