"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import "lenis/dist/lenis.css";

import { definirLenis, destinoDe, gsap, prefereMenosMovimento } from "@/lib/motion";

/**
 * Rolagem suave, uma vez no layout raiz, sem renderizar nada.
 *
 * As âncoras são tratadas aqui, e não pela opção `anchors` do Lenis: aquela
 * rola até o alvo mas deixa o foco onde estava, e dentro da missão o alvo nem
 * está onde parece (ver `definirDestino`).
 */
export function SmoothScroll() {
  useEffect(() => {
    // Movimento reduzido: rolagem nativa, e a âncora cai no lugar pelo
    // `scroll-padding-top` do CSS.
    if (prefereMenosMovimento()) return;

    const lenis = new Lenis({ lerp: 0.085 });
    definirLenis(lenis);
    const avancar = (tempo: number) => lenis.raf(tempo * 1000);
    gsap.ticker.add(avancar);
    gsap.ticker.lagSmoothing(0);

    const aoClicar = (evento: MouseEvent) => {
      if (
        evento.defaultPrevented ||
        evento.button !== 0 ||
        evento.metaKey ||
        evento.ctrlKey ||
        evento.shiftKey ||
        evento.altKey
      ) {
        return;
      }
      const link = (evento.target as Element | null)?.closest?.<HTMLAnchorElement>('a[href^="#"]');
      const id = link ? decodeURIComponent(link.hash.slice(1)) : "";
      const alvo = id ? document.getElementById(id) : null;
      if (!alvo) return;

      evento.preventDefault();
      // O menu do celular para o Lenis enquanto está aberto.
      lenis.start();
      const y = destinoDe(alvo);
      // Sem `offset`: o Lenis já desconta o `scroll-padding-top` do CSS.
      lenis.scrollTo(y ?? alvo, { duration: y === null ? 1.4 : 2.2 });
      history.pushState(null, "", `#${id}`);

      if (!alvo.hasAttribute("tabindex")) alvo.setAttribute("tabindex", "-1");
      // Na volta da fila: clicado no menu do celular, o `<main>` ainda está
      // `inert` neste instante, e foco em elemento inerte é ignorado.
      window.setTimeout(() => alvo.focus({ preventScroll: true }), 0);
    };
    document.addEventListener("click", aoClicar);

    return () => {
      document.removeEventListener("click", aoClicar);
      gsap.ticker.remove(avancar);
      lenis.destroy();
      definirLenis(null);
    };
  }, []);

  return null;
}
