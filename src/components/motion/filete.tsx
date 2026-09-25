"use client";

import { useRef } from "react";

import { COM_MOVIMENTO, gsap, useGSAP } from "@/lib/motion";
import { cn } from "@/lib/utils/cn";

/**
 * Linha fina que se desenha da esquerda para a direita enquanto entra na
 * tela, conduzida pela rolagem.
 *
 * Por `scaleX`, não por `width`: a largura é a final desde o começo e só o
 * `transform` muda, então a rolagem não recalcula layout nenhum. Sem
 * JavaScript ou com movimento reduzido, a linha já está inteira.
 */
export function Filete({ className }: { className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(COM_MOVIMENTO, () => {
        gsap.fromTo(
          ref.current,
          { scaleX: 0 },
          {
            scaleX: 1,
            ease: "none",
            scrollTrigger: { trigger: ref.current, start: "top 92%", end: "top 62%", scrub: true },
          },
        );
      });
    },
    { scope: ref },
  );

  return (
    <div ref={ref} data-desenhar aria-hidden="true" className={cn("origin-left", className)} />
  );
}
