"use client";

import { useRef, type ReactNode } from "react";

import { falar } from "@/lib/fala";
import { COM_MOVIMENTO, gsap, ScrollTrigger, useGSAP } from "@/lib/motion";

/**
 * Uma caixa de diálogo: quando ela chega a 70% da tela, a pergunta
 * (`data-dialogo-fala`) é falada letra a letra e o que vem depois
 * (`data-dialogo-resto`) aparece em seguida, uma peça de cada vez.
 *
 * Toca uma vez só, por tempo, e não pela rolagem: é a página falando com a
 * pessoa, e fala não volta para trás quando ela rola para cima.
 */
export function Dialogo({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(COM_MOVIMENTO, () => {
        const fala = ref.current!.querySelector("[data-dialogo-fala] [data-fala]")!;
        const resto = gsap.utils.toArray<HTMLElement>("[data-dialogo-resto]");
        gsap.set(resto, { opacity: 0 });

        const tl = gsap.timeline({ paused: true });
        const fim = falar(tl, fala, { porLetra: 0.026 });
        tl.to(resto, { opacity: 1, duration: 0.01, stagger: 0.14 }, fim + 0.12);

        ScrollTrigger.create({
          trigger: ref.current,
          start: "top 70%",
          once: true,
          onEnter: () => tl.play(),
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
