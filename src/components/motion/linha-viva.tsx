"use client";

import { useRef, type ReactNode } from "react";

import { COM_MOVIMENTO, gsap, useGSAP } from "@/lib/motion";

/**
 * A linha das etapas do processo se enchendo de vermelho com a rolagem: a
 * ponta acompanha a linha dos 60% da tela, e cada nó acende quando ela
 * chega nele.
 *
 * Os dois ganchos vêm do servidor, apagados pelo CSS (`opacity-0`): a
 * linha viva (`data-linha-viva`) e o nó vivo de cada etapa
 * (`data-no-vivo`). Sem JavaScript ou com movimento reduzido eles
 * continuam apagados, e a seção fica como sempre foi — linha e nós cinza,
 * só o último vermelho.
 */
export function LinhaViva({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(COM_MOVIMENTO, () => {
        gsap.set("[data-linha-viva]", { opacity: 1, transformOrigin: "50% 0%" });
        gsap.fromTo(
          "[data-linha-viva]",
          { scaleY: 0 },
          {
            scaleY: 1,
            ease: "none",
            scrollTrigger: {
              trigger: ref.current,
              start: "top 60%",
              end: "bottom 60%",
              scrub: true,
            },
          },
        );

        gsap.utils.toArray<HTMLElement>("[data-no-vivo]").forEach((no) => {
          gsap.fromTo(
            no,
            { opacity: 0 },
            {
              opacity: 1,
              duration: 0.25,
              scrollTrigger: {
                trigger: no,
                start: "center 60%",
                toggleActions: "play none none reverse",
              },
            },
          );
        });
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
