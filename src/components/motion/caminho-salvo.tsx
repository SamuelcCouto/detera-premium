"use client";

import { useRef, type ReactNode } from "react";

import { COM_MOVIMENTO, gsap, ScrollTrigger, useGSAP } from "@/lib/motion";

/**
 * O processo como um caminho de pontos de salvamento.
 *
 * Conforme a rolagem passa pela linha dos 60% da tela, o coração salta para
 * a etapa que está ali (`data-selecionada`) — de uma vez, como o cursor de um
 * menu de jogo, sem viajar entre uma e outra. Cada etapa alcançada fica salva
 * (`data-salvo`): o losango acende e continua aceso. Voltando a rolagem, o
 * salvamento é desfeito.
 *
 * No fim, quando o nó vermelho do "05 → 01" chega, um coração percorre o
 * laço de volta à primeira etapa em degraus de grade: para a esquerda, para
 * cima, para a direita. O desenho do laço já existia; agora alguém anda nele.
 * Só a partir de 768px, onde o laço aparece.
 *
 * Substitui a linha vermelha que enchia ao lado das etapas: era uma faixa
 * colorida na lateral, e não dizia nada que o nó aceso não diga melhor.
 */
export function CaminhoSalvo({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add(COM_MOVIMENTO, () => {
        const etapas = gsap.utils.toArray<HTMLElement>("[data-etapa]");
        etapas.forEach((etapa) => {
          ScrollTrigger.create({
            trigger: etapa,
            start: "top 60%",
            end: "bottom 60%",
            onToggle: ({ isActive }) => {
              if (isActive) etapa.dataset.selecionada = "";
              else delete etapa.dataset.selecionada;
            },
            onEnter: () => {
              etapa.dataset.salvo = "";
            },
            onLeaveBack: () => {
              delete etapa.dataset.salvo;
            },
          });
        });

        return () =>
          etapas.forEach((etapa) => {
            delete etapa.dataset.selecionada;
            delete etapa.dataset.salvo;
          });
      });

      mm.add(`${COM_MOVIMENTO} and (min-width: 768px)`, () => {
        const caminho = ref.current!;
        const alma = caminho.querySelector<HTMLElement>("[data-volta-alma]")!;
        const volta = caminho.querySelector<HTMLElement>("[data-volta]")!;
        const laco = caminho.querySelector<HTMLElement>(".ciclo-volta")!;

        // As três pernas do laço, medidas do próprio desenho: a de baixo
        // (do nó vermelho até a calha), a vertical e a de cima (da calha até
        // o primeiro losango).
        const topo = () => laco.offsetTop;
        const base = () => laco.offsetTop + laco.offsetHeight;
        const direita = () => laco.offsetWidth;

        gsap.set(alma, { x: direita, y: base, autoAlpha: 0 });
        gsap
          .timeline({
            scrollTrigger: {
              trigger: volta,
              start: "top 60%",
              toggleActions: "play none none reverse",
              invalidateOnRefresh: true,
            },
          })
          .set(alma, { autoAlpha: 1 })
          .to(alma, { x: 0, duration: 0.18, ease: "steps(3)" })
          .to(alma, { y: topo, duration: 0.7, ease: "steps(14)" })
          .to(alma, { x: direita, duration: 0.18, ease: "steps(3)" })
          .set(alma, { autoAlpha: 0 }, "+=0.25");
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
