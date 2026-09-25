"use client";

import { useRef } from "react";

import { COM_MOVIMENTO, gsap, useGSAP } from "@/lib/motion";

/**
 * Número que conta de 0 até `valor` na primeira vez que aparece na tela.
 *
 * Só serve para número medido — hoje, as notas do PageSpeed dos cases. O
 * HTML do servidor já traz o valor final: sem JavaScript, com movimento
 * reduzido ou na impressão, aparece o número certo, sem animação. Contar a
 * partir do valor final ao contrário (zerar no servidor) faria o buscador e
 * quem não roda JS lerem "0".
 */
export function Contador({ valor }: { valor: number }) {
  const ref = useRef<HTMLSpanElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(COM_MOVIMENTO, () => {
        const el = ref.current!;
        const estado = { v: 0 };
        el.textContent = "0";
        gsap.to(estado, {
          v: valor,
          duration: 1.4,
          ease: "power2.out",
          onUpdate: () => {
            el.textContent = String(Math.round(estado.v));
          },
          scrollTrigger: { trigger: el, start: "top 88%", once: true },
        });
        // Ao desfazer (desmontar ou trocar a preferência), volta ao valor final.
        return () => {
          el.textContent = String(valor);
        };
      });
    },
    { dependencies: [valor] },
  );

  return (
    <span ref={ref} className="tabular-nums">
      {valor}
    </span>
  );
}
