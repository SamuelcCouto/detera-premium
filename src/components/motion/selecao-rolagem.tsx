"use client";

import { useRef, type ReactNode } from "react";

import { gsap, ScrollTrigger, useGSAP } from "@/lib/motion";

/**
 * O cursor-coração guiado pela rolagem: numa lista longa, a opção "escolhida"
 * é a que a pessoa está lendo.
 *
 * - A partir de 768px, a entrega (`data-entrega`) que cruza a linha dos 55%
 *   da tela ganha `data-selecionada`, e o coração salta para ela.
 * - No celular as entregas são um carrossel (`.deslize`): a escolhida é o
 *   card que encaixou na tela.
 *
 * Marcar a leitura não é movimento — o coração troca de lugar de uma vez,
 * sem viajar —, então vale também com movimento reduzido.
 */
export function SelecaoRolagem({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add("(min-width: 768px)", () => {
        const itens = gsap.utils.toArray<HTMLElement>("[data-entrega]");
        itens.forEach((item) => {
          ScrollTrigger.create({
            trigger: item,
            start: "top 55%",
            end: "bottom 55%",
            onToggle: ({ isActive }) => {
              if (isActive) item.dataset.selecionada = "";
              else delete item.dataset.selecionada;
            },
          });
        });
        return () => itens.forEach((item) => delete item.dataset.selecionada);
      });

      mm.add("(max-width: 767px)", () => {
        const faixas = gsap.utils.toArray<HTMLElement>(".deslize");
        const observadores = faixas.map((faixa) => {
          const cards = [...faixa.querySelectorAll<HTMLElement>(":scope > [data-entrega]")];
          const observador = new IntersectionObserver(
            (entradas) => {
              const encaixado = entradas.find((entrada) => entrada.intersectionRatio >= 0.7);
              if (!encaixado) return;
              cards.forEach((card) => delete card.dataset.selecionada);
              (encaixado.target as HTMLElement).dataset.selecionada = "";
            },
            { root: faixa, threshold: [0.7] },
          );
          cards.forEach((card) => observador.observe(card));
          return observador;
        });
        return () => observadores.forEach((observador) => observador.disconnect());
      });
    },
    { scope: ref },
  );

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
