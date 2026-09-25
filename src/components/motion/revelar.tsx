"use client";

import { useRef, type ReactNode } from "react";

import { COM_MOVIMENTO, gsap, useGSAP } from "@/lib/motion";

/**
 * Bloco que abre do centro para as bordas por `clip-path` enquanto entra na
 * tela — a revelação da skill, sem trecho fixado. É o mesmo gesto da tela
 * das prévias dos cases, para a página ter um vocabulário só de abertura.
 *
 * O recorte é dono do `clip-path` deste `div` e de mais nada: quem estiver
 * dentro pode ter as próprias animações. Sem JavaScript ou com movimento
 * reduzido, o bloco já está aberto.
 */
export function Revelar({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(COM_MOVIMENTO, () => {
        gsap.fromTo(
          ref.current,
          { clipPath: "inset(0% 50% 0% 50%)" },
          {
            clipPath: "inset(0% 0% 0% 0%)",
            ease: "power2.inOut",
            scrollTrigger: { trigger: ref.current, start: "top 92%", end: "top 55%", scrub: true },
          },
        );
      });
    },
    { scope: ref },
  );

  return (
    <div ref={ref} data-revelar className={className}>
      {children}
    </div>
  );
}
