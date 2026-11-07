"use client";

import { useEffect } from "react";

import { CENAS, medidas } from "@/lib/missao/cenas";
import { E, interpolar } from "@/lib/missao/estado";
import { definirDestino, gsap, obterLenis } from "@/lib/motion";

/**
 * Transforma a rolagem em posição no roteiro.
 *
 * A missão é uma seção alta com um palco `sticky` de uma tela. Cada cena tem
 * uma parada (a rolagem anda, a cena não) e uma viagem até a próxima. Em vez
 * de pin e snap do ScrollTrigger (o snap com Lenis salta para lugares
 * errados), a posição sai de uma conta: onde está a rolagem dentro da missão,
 * em svh, comparada com o início de cada cena.
 *
 * Cada cartão perto da posição atual recebe `transform` e `opacity` direto, e
 * nada mais: são as duas propriedades que a GPU compõe sem o navegador
 * recalcular estilo. A primeira versão escrevia variáveis CSS nos cartões e no
 * `<html>` a cada quadro; variável herda, então a página inteira tinha o estilo
 * recalculado o tempo todo, e era isso que mais travava no celular.
 */
export function Roteiro() {
  useEffect(() => {
    const html = document.documentElement;
    const missao = document.querySelector<HTMLElement>("[data-missao]");
    const palco = document.querySelector<HTMLElement>("[data-palco]");
    if (!missao || !palco) return;
    const cartoes = [...missao.querySelectorAll<HTMLElement>("[data-cena]")];
    const { inicios, total } = medidas();

    let topo = 0;
    let unidade = 1;
    const medir = () => {
      topo = missao.getBoundingClientRect().top + window.scrollY;
      unidade = missao.offsetHeight / total;
    };
    medir();
    const observador = new ResizeObserver(medir);
    observador.observe(missao);

    const yDaCena = (i: number) => topo + inicios[i] * unidade + 2;
    // Só para o QA: os scripts de prints leem onde cada cena começa.
    (window as unknown as { __missao?: object }).__missao = { yDaCena, cenas: CENAS.length };

    // Links para dentro da missão (`#projetos`, `#processo`) caem no começo da
    // parada da cena, não no topo do palco.
    definirDestino((alvo) => {
      if (html.classList.contains("linear")) return null;
      const cena = alvo.closest<HTMLElement>("[data-cena]");
      return cena ? yDaCena(Number(cena.dataset.cena)) : null;
    });

    const posicaoNaRolagem = (y: number) => {
      const local = (y - topo) / unidade;
      for (let i = CENAS.length - 1; i >= 0; i--) {
        if (local < inicios[i]) continue;
        const parada = inicios[i] + CENAS[i].hold;
        if (i === CENAS.length - 1 || local <= parada) return i;
        const proxima = inicios[i + 1];
        return i + Math.min(1, (local - parada) / (proxima - parada));
      }
      return 0;
    };

    // Tab dentro de um cartão que está fora de cena leva a rolagem até ele.
    const aoFocar = (e: FocusEvent) => {
      if (html.classList.contains("linear")) return;
      const cena = (e.target as Element | null)?.closest?.<HTMLElement>("[data-cena]");
      if (!cena) return;
      const i = Number(cena.dataset.cena);
      const lenis = obterLenis();
      if (Math.abs(E.s - i) < 0.5 || lenis?.isScrolling === "smooth") return;
      if (lenis) lenis.scrollTo(yDaCena(i), { duration: 1.2 });
      else window.scrollTo(0, yDaCena(i));
    };
    missao.addEventListener("focusin", aoFocar);

    // Endereço com âncora ao abrir (#processo): o navegador não sabe onde a
    // cena mora; o roteiro leva até lá depois de medir.
    if (location.hash) {
      const alvo = document.getElementById(decodeURIComponent(location.hash.slice(1)));
      const cena = alvo?.closest<HTMLElement>("[data-cena]");
      if (cena && !html.classList.contains("linear")) {
        requestAnimationFrame(() => window.scrollTo(0, yDaCena(Number(cena.dataset.cena))));
      }
    }

    const cabecalho = document.querySelector<HTMLElement>(".cabecalho");
    const estreito = window.matchMedia("(max-width: 760px), (max-aspect-ratio: 4/5)");
    const ativos = new Set<HTMLElement>();
    let anterior = -1;
    let plasmaAnterior = -1;

    const tirarDeCena = (cena: HTMLElement) => {
      cena.dataset.fora = "";
      const cartao = cena.firstElementChild as HTMLElement;
      cartao.style.removeProperty("transform");
      cartao.style.removeProperty("opacity");
      cartao.style.removeProperty("will-change");
      ativos.delete(cena);
    };

    const tique = (tempo: number) => {
      if (html.classList.contains("linear")) {
        if (ativos.size) [...ativos].forEach(tirarDeCena);
        palco.style.removeProperty("transform");
        interpolar(0);
        return;
      }

      const s = posicaoNaRolagem(window.scrollY);

      if (s !== anterior) {
        anterior = s;
        interpolar(s);

        for (const cena of cartoes) {
          const i = Number(cena.dataset.cena);
          const d = s - i;
          const a = Math.abs(d);
          // Da metade da viagem para lá o cartão já está invisível.
          if (a >= 0.5) {
            if (ativos.has(cena)) tirarDeCena(cena);
            continue;
          }
          if (!ativos.has(cena)) {
            delete cena.dataset.fora;
            (cena.firstElementChild as HTMLElement).style.willChange = "transform, opacity";
            ativos.add(cena);
          }
          // O cartão que sai some cedo e o que chega aparece tarde: no meio da
          // viagem a tela é só da cena. Com a mesma curva para os dois, eles se
          // cruzavam no centro e um texto passava por cima do outro.
          const o =
            d > 0
              ? 1 - Math.min(1, Math.max(0, (a - 0.04) / 0.34))
              : 1 - Math.min(1, Math.max(0, (a - 0.12) / 0.36));
          const cartao = cena.firstElementChild as HTMLElement;
          cartao.style.opacity = o.toFixed(3);
          if (cena.dataset.entrada === "queda") {
            // Queda com gravidade: chega acelerando (posição ∝ tempo²) e sai
            // caindo do repouso, também acelerando.
            const q = d < 0 ? -1 + (1 + d) * (1 + d) : d * d;
            cartao.style.transform = `translate3d(0, ${(q * 72).toFixed(2)}svh, 0)`;
          } else if (cena.dataset.entrada === "lateral") {
            // Lateral: chega de um lado e sai pelo outro, no sentido da viagem.
            const longe = estreito.matches ? 70 : 36;
            cartao.style.transform = `translate3d(${(d * -longe).toFixed(2)}vw, 0, 0)`;
          }
        }
      }

      // O cabeçalho escurece por trás quando o plasma toma as bordas da tela.
      const plasma = Math.round(E.plasma * 50) / 50;
      if (cabecalho && plasma !== plasmaAnterior) {
        plasmaAnterior = plasma;
        cabecalho.style.backgroundColor = plasma > 0 ? `rgb(5 9 19 / ${(plasma * 0.9).toFixed(2)})` : "";
      }

      // O quadro inteiro treme na reentrada, cartões junto.
      if (E.tremor > 0.01) {
        const k = E.tremor * 5;
        palco.style.transform = `translate3d(${(Math.sin(tempo * 47) * Math.sin(tempo * 11) * k).toFixed(2)}px, ${(Math.cos(tempo * 53) * Math.sin(tempo * 7) * k).toFixed(2)}px, 0)`;
      } else if (palco.style.transform) {
        palco.style.removeProperty("transform");
      }
    };
    gsap.ticker.add(tique);

    return () => {
      gsap.ticker.remove(tique);
      observador.disconnect();
      missao.removeEventListener("focusin", aoFocar);
      definirDestino(null);
    };
  }, []);

  return null;
}
