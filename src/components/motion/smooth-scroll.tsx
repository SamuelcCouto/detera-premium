"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import "lenis/dist/lenis.css";

import { definirLenis, gsap, prefereMenosMovimento, ScrollTrigger } from "@/lib/motion";

/**
 * Rolagem suave ligada ao ScrollTrigger. Vai uma vez no layout raiz e não
 * renderiza nada: não envolve a página num provider, então as seções
 * continuam sendo componentes de servidor.
 *
 * As âncoras (`#solucoes`, `#servicos`, "Pular para o conteúdo") são
 * tratadas aqui, e não pela opção `anchors` do Lenis: aquela rola até o
 * alvo mas deixa o foco onde estava, e o link de pular conteúdo virava um
 * atalho que rola a tela e devolve o Tab para o topo da página.
 */
export function SmoothScroll() {
  useEffect(() => {
    let ativo = true;
    // As fontes mudam a altura do texto; as posições dos gatilhos são
    // recalculadas quando elas terminam de carregar.
    document.fonts.ready.then(() => {
      if (ativo) ScrollTrigger.refresh();
    });

    // Movimento reduzido: rolagem nativa, e a âncora cai no lugar pelo
    // `scroll-padding-top` do CSS.
    if (prefereMenosMovimento()) {
      return () => {
        ativo = false;
      };
    }

    const lenis = new Lenis({ lerp: 0.09 });
    definirLenis(lenis);
    lenis.on("scroll", ScrollTrigger.update);
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
      const link = (evento.target as Element | null)?.closest?.<HTMLAnchorElement>(
        'a[href^="#"]',
      );
      const id = link ? decodeURIComponent(link.hash.slice(1)) : "";
      const alvo = id ? document.getElementById(id) : null;
      if (!alvo) return;

      evento.preventDefault();
      // O menu do celular para o Lenis enquanto está aberto; o clique num
      // link dele precisa rolar antes de o React fechar o painel.
      lenis.start();
      // Seção fixada: a posição de verdade é a do "pin-spacer" em volta dela.
      // Medida durante o pin, a própria seção está `fixed` no topo da tela e
      // o destino sairia como "onde a pessoa já está".
      const destino = alvo.closest<HTMLElement>(".pin-spacer") ?? alvo;
      // Sem `offset`: o Lenis já desconta o `scroll-padding-top` do CSS (a
      // altura do cabeçalho), e somar os dois deixava cada seção parando
      // 72px abaixo do cabeçalho em vez de encostada nele.
      lenis.scrollTo(destino, { duration: 1.4 });
      history.pushState(null, "", `#${id}`);

      if (!alvo.hasAttribute("tabindex")) alvo.setAttribute("tabindex", "-1");
      // Na volta da fila, não agora: clicado no menu do celular, o `<main>`
      // ainda está `inert` neste instante (o React fecha o menu logo
      // depois), e foco em elemento inerte é ignorado sem aviso.
      window.setTimeout(() => alvo.focus({ preventScroll: true }), 0);
    };
    document.addEventListener("click", aoClicar);

    return () => {
      ativo = false;
      document.removeEventListener("click", aoClicar);
      gsap.ticker.remove(avancar);
      lenis.destroy();
      definirLenis(null);
    };
  }, []);

  return null;
}
