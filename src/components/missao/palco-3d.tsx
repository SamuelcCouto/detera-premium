"use client";

import { useEffect, useRef } from "react";

import { E } from "@/lib/missao/estado";
import { gsap, prefereMenosMovimento } from "@/lib/motion";

/**
 * O canvas da missão: fixo atrás da página inteira, um só. O Three.js é
 * importado sob demanda, depois da primeira pintura, para o texto da primeira
 * cena chegar antes dos ~600 KB da cena. O nome DETERA da abertura nasce das
 * estrelas dela; o `<svg>` do `<h1>` acende quando elas chegam, ou sozinho, se
 * a cena não vier.
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

      // O nome em estrelas fica onde o layout reservou o `<h1>`. A medida vem
      // da cadeia de `offset`, que ignora o `transform` do cartão: medido com
      // `getBoundingClientRect`, um recarregar no meio da rolagem acharia o nome
      // caído fora do lugar.
      const medirNome = () => {
        const h1 = document.querySelector<HTMLElement>("[data-nome]");
        if (!h1) return;
        let x = 0;
        let y = 0;
        for (let el: HTMLElement | null = h1; el; el = el.offsetParent as HTMLElement | null) {
          x += el.offsetLeft;
          y += el.offsetTop;
          if (el.hasAttribute("data-palco")) break;
        }
        mundo.posicionarNome(x + h1.offsetWidth / 2, y + h1.offsetHeight / 2, h1.offsetWidth);
      };
      const dimensionar = () => {
        mundo.dimensionar(canvas.clientWidth, canvas.clientHeight);
        medirNome();
      };
      dimensionar();
      document.fonts.ready.then(() => {
        if (!cancelado) medirNome();
      });
      const observador = new ResizeObserver(dimensionar);
      observador.observe(canvas);
      if (!html.classList.contains("linear")) html.classList.add("nome-em-estrelas");

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

      // Resolução adaptativa: a cada 45 quadros em movimento, se a média passa
      // de 25 ms, a cena desce um degrau, sem avisar ninguém. Nunca sobe de novo:
      // ficar trocando de resolução é pior que ficar um pouco mais suave.
      // Em navegador automatizado não adapta, para os testes compararem igual.
      const adapta = !navigator.webdriver;
      let quadros = 0;
      let soma = 0;
      let aquecendo = 30;
      let pulo = 0;
      let ultimoS = -1;
      let nomeAceso = false;
      canvas.classList.add("pronto");

      const tique = (tempo: number, delta: number) => {
        if (document.hidden) return;
        E.linear = html.classList.contains("linear");

        const dt = Math.min(delta, 50) / 1000;
        if (!reduzido) {
          velX += ((alvoX - E.mx) * 26 - velX * 7.5) * dt;
          velY += ((alvoY - E.my) * 26 - velY * 7.5) * dt;
          E.mx += velX * dt;
          E.my += velY * dt;
        }

        if (!nomeAceso && mundo.nomePronto) {
          nomeAceso = true;
          html.classList.add("nome-pronto");
        }

        // Nada se movendo além da órbita lenta: meio quadro, para poupar bateria.
        const parado =
          E.s === ultimoS &&
          E.tremor < 0.01 &&
          E.rastro < 0.01 &&
          mundo.nomePronto &&
          Math.abs(velX) + Math.abs(velY) < 0.002;
        ultimoS = E.s;
        if (parado && pulo++ % 2 === 0) return;

        if (adapta && !parado) {
          if (aquecendo > 0) aquecendo--;
          else {
            soma += delta;
            if (++quadros === 45) {
              if (soma / quadros > 25) mundo.reduzir();
              quadros = 0;
              soma = 0;
              aquecendo = 15;
            }
          }
        }

        mundo.quadro(tempo);
      };
      gsap.ticker.add(tique);

      limpar = () => {
        gsap.ticker.remove(tique);
        observador.disconnect();
        window.removeEventListener("pointermove", aoMover);
        html.classList.remove("nome-em-estrelas", "nome-pronto");
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
