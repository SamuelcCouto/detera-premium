"use client";

import { useEffect, useRef } from "react";

import { E } from "@/lib/missao/estado";
import { gsap, prefereMenosMovimento } from "@/lib/motion";

/**
 * O canvas da missão: fixo atrás da página inteira, um só. O Three.js é
 * importado sob demanda, depois da primeira pintura, para o texto da primeira
 * cena chegar antes dos ~600 KB da cena.
 *
 * Sem WebGL, o `<html>` ganha `sem-webgl` e `linear`, e a página vira a
 * leitura empilhada de sempre, sobre o fundo de CSS.
 */
export function Palco3D() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const html = document.documentElement;
    if (html.classList.contains("sem-webgl")) return;

    let cancelado = false;
    let limpar = () => {};

    import("@/lib/missao/mundo").then(({ Mundo }) => {
      if (cancelado) return;
      const leve =
        window.matchMedia("(pointer: coarse)").matches || (navigator.hardwareConcurrency || 8) <= 4;

      let mundo: InstanceType<typeof Mundo>;
      try {
        mundo = new Mundo(canvas, leve);
      } catch {
        html.classList.add("sem-webgl", "linear");
        return;
      }

      const dimensionar = () => mundo.dimensionar(canvas.clientWidth, canvas.clientHeight);
      dimensionar();
      const observador = new ResizeObserver(dimensionar);
      observador.observe(canvas);

      // O cursor puxa a câmera como uma massa presa por mola: chega atrasado e
      // passa um pouco do ponto antes de assentar.
      let alvoX = 0;
      let alvoY = 0;
      let velX = 0;
      let velY = 0;
      const aoMover = (e: PointerEvent) => {
        if (e.pointerType !== "mouse") return;
        alvoX = (e.clientX / window.innerWidth) * 2 - 1;
        alvoY = (e.clientY / window.innerHeight) * 2 - 1;
      };
      window.addEventListener("pointermove", aoMover, { passive: true });

      const reduzido = prefereMenosMovimento();
      const inicio = performance.now();
      E.chegada = reduzido || html.classList.contains("linear") ? 1 : 0;

      // Desempenho: se os primeiros quadros passam de ~28 ms em média, a cena
      // passa ao modo de resolução 1 sem avisar ninguém.
      let quadros = 0;
      let soma = 0;
      let anterior = 0;
      canvas.classList.add("pronto");

      const tique = (tempo: number, delta: number) => {
        if (document.hidden) return;
        E.linear = html.classList.contains("linear");
        if (E.chegada < 1) E.chegada = Math.min(1, (performance.now() - inicio) / 3200);

        const dt = Math.min(delta, 50) / 1000;
        if (!reduzido) {
          velX += ((alvoX - E.mx) * 26 - velX * 7.5) * dt;
          velY += ((alvoY - E.my) * 26 - velY * 7.5) * dt;
          E.mx += velX * dt;
          E.my += velY * dt;
        }

        if (quadros < 120 && anterior) {
          soma += tempo * 1000 - anterior;
          quadros++;
          if (quadros === 120 && soma / quadros > 28) {
            mundo.aliviar();
          }
        }
        anterior = tempo * 1000;

        mundo.quadro(tempo);
      };
      gsap.ticker.add(tique);

      limpar = () => {
        gsap.ticker.remove(tique);
        observador.disconnect();
        window.removeEventListener("pointermove", aoMover);
        mundo.descartar();
      };
    });

    return () => {
      cancelado = true;
      limpar();
    };
  }, []);

  return <canvas ref={ref} className="palco-3d" aria-hidden="true" />;
}
