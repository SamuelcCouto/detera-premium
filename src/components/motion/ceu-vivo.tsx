"use client";

import { useEffect, useRef } from "react";

import { prefereMenosMovimento, ScrollTrigger } from "@/lib/motion";
import { criarGerador } from "@/lib/utils/aleatorio";

type Estrela = {
  /** Posição normalizada (0–1) no campo; o campo é mais alto que a tela. */
  x: number;
  y: number;
  /** Quanto a estrela anda com a rolagem: longe anda pouco, perto anda mais. */
  profundidade: number;
  tamanho: 1 | 2;
  cor: string;
  brilho: number;
  /** Densidade mínima em que a estrela aparece. É o que apaga o céu onde se lê. */
  limiar: number;
  fase: number;
  ritmo: number;
};

type Risco = { x: number; y: number; nasceu: number };

const CORES = {
  clara: "242, 243, 245",
  determinacao: "255, 107, 107",
  sistema: "124, 160, 255",
};
const FUNDO = "#07080b";
/** Folga acima e abaixo da tela: a estrela nasce e some fora da vista. */
const MARGEM = 120;

/**
 * O céu vivo: um canvas só, fixo atrás da página inteira.
 *
 * Substitui o céu de antes, em que cada estrela era um elemento com a própria
 * animação de CSS: eram 174 animações rodando o tempo todo, compostas uma a
 * uma pela placa de vídeo, e só elas deixavam a página pronta para animar
 * 12 segundos mais tarde num celular simulado. Aqui é uma camada e algumas
 * centenas de retângulos por quadro.
 *
 * - **Profundidade.** Três camadas andam com a rolagem em velocidades
 *   diferentes; a página parece atravessar o céu em vez de deslizar por cima
 *   de um papel de parede.
 * - **Rastro.** Rolando rápido, cada estrela estica na direção contrária à do
 *   movimento, proporcional à velocidade e à proximidade.
 * - **Pixel.** Estrela é quadrado de 1 ou 2 px, e o cintilar anda em cinco
 *   degraus de brilho, não numa onda lisa.
 * - **Densidade.** Cada seção declara a sua em `data-ceu` (0–1): cheio no
 *   hero, no manifesto e no contato, quase apagado onde se lê muito. O céu
 *   passa de uma para outra aos poucos.
 * - **Economia.** Parado, desenha a 30 quadros por segundo; aba oculta, não
 *   desenha. Resolução limitada a 1,5× no celular e 2× no resto. Com
 *   movimento reduzido, desenha uma vez e fica parado.
 *
 * Nenhuma aleatoriedade de `Math.random()`: o campo sai de uma semente, igual
 * em toda visita.
 */
export function CeuVivo() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d", { alpha: false });
    if (!canvas || !ctx) return;

    const reduzido = prefereMenosMovimento();
    const celular = window.matchMedia("(max-width: 767px)").matches;
    const dpr = Math.min(window.devicePixelRatio || 1, celular ? 1.5 : 2);

    let largura = 0;
    let altura = 0;
    const redimensionar = () => {
      largura = canvas.clientWidth;
      altura = canvas.clientHeight;
      canvas.width = Math.round(largura * dpr);
      canvas.height = Math.round(altura * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    redimensionar();

    // O campo: quantidade pela área da tela, entre 90 e 260.
    const aleatorio = criarGerador(20260927);
    const quantidade = Math.round(
      Math.min(260, Math.max(90, (largura * altura) / 5200)),
    );
    const estrelas: Estrela[] = Array.from({ length: quantidade }, () => {
      const camada = aleatorio();
      const perto = camada > 0.86;
      const meio = !perto && camada > 0.5;
      const tom = aleatorio();
      return {
        x: aleatorio(),
        y: aleatorio(),
        profundidade: perto ? 0.3 : meio ? 0.13 : 0.05,
        tamanho: perto ? 2 : 1,
        cor: tom > 0.9 ? CORES.determinacao : tom > 0.85 ? CORES.sistema : CORES.clara,
        brilho: perto ? 0.75 + aleatorio() * 0.25 : meio ? 0.5 + aleatorio() * 0.3 : 0.3 + aleatorio() * 0.3,
        limiar: aleatorio(),
        fase: aleatorio() * Math.PI * 2,
        ritmo: 0.6 + aleatorio() * 1.8,
      };
    });

    // Onde cada seção começa e termina no documento, com a densidade dela.
    // Medido de novo a cada `refresh` do ScrollTrigger, porque os trechos
    // fixados acrescentam espaço; no quadro a quadro é só comparação com o
    // `scrollY`, sem ler layout.
    let faixas: { topo: number; base: number; densidade: number }[] = [];
    const medirSecoes = () => {
      faixas = [...document.querySelectorAll<HTMLElement>("[data-ceu]")].map((secao) => {
        const caixa = (secao.closest<HTMLElement>(".pin-spacer") ?? secao).getBoundingClientRect();
        return {
          topo: caixa.top + window.scrollY,
          base: caixa.bottom + window.scrollY,
          densidade: Number(secao.dataset.ceu) || 0,
        };
      });
    };
    medirSecoes();
    ScrollTrigger.addEventListener("refresh", medirSecoes);

    const densidadeEm = (y: number) =>
      faixas.find((faixa) => y >= faixa.topo && y < faixa.base)?.densidade ?? 0.3;

    let densidade = reduzido ? 0.55 : densidadeEm(window.scrollY + altura / 2);
    let rolagemAnterior = window.scrollY;
    let quadro = 0;
    let riscos: Risco[] = [];
    let proximoRisco = 3 + aleatorio() * 5;

    const desenhar = (tempo: number) => {
      const rolagem = reduzido ? 0 : window.scrollY;
      const velocidade = rolagem - rolagemAnterior;
      rolagemAnterior = rolagem;

      ctx.fillStyle = FUNDO;
      ctx.fillRect(0, 0, largura, altura);

      const alturaCampo = altura + MARGEM * 2;
      for (const estrela of estrelas) {
        const presenca = Math.min(1, Math.max(0, (densidade - estrela.limiar) * 5));
        if (presenca <= 0) continue;

        const bruto = estrela.y * alturaCampo - rolagem * estrela.profundidade;
        const y = (((bruto % alturaCampo) + alturaCampo) % alturaCampo) - MARGEM;
        if (y < -4 || y > altura + 4) continue;
        const x = Math.round(estrela.x * largura);

        const onda = reduzido ? 1 : 0.62 + 0.38 * Math.sin(tempo * estrela.ritmo + estrela.fase);
        // Cinco degraus de brilho: estrela de pixel pisca em passos.
        const brilho = Math.round(estrela.brilho * onda * presenca * 5) / 5;
        if (brilho <= 0) continue;

        const lado = estrela.tamanho;
        const rastro = Math.min(26, Math.abs(velocidade) * estrela.profundidade * 1.6);
        ctx.fillStyle = `rgba(${estrela.cor}, ${brilho})`;
        ctx.fillRect(x, Math.round(y), lado, lado);
        if (rastro >= 2) {
          ctx.fillStyle = `rgba(${estrela.cor}, ${brilho * 0.45})`;
          // Rolando para baixo o céu sobe, e o rastro fica embaixo da estrela.
          ctx.fillRect(x, Math.round(velocidade > 0 ? y + lado : y - rastro), lado, Math.round(rastro));
        }
      }

      // Estrela cadente: rara, só onde o céu está cheio. Anda em degraus de
      // 6 px, como um pixel se deslocando na grade, e some em 0,7 s.
      if (!reduzido) {
        if (tempo > proximoRisco && densidade > 0.6) {
          riscos.push({ x: 0.1 + aleatorio() * 0.7, y: 0.05 + aleatorio() * 0.4, nasceu: tempo });
          proximoRisco = tempo + 6 + aleatorio() * 7;
        }
        riscos = riscos.filter((risco) => tempo - risco.nasceu < 0.7);
        for (const risco of riscos) {
          const vida = (tempo - risco.nasceu) / 0.7;
          const passos = Math.floor(vida * 14);
          for (let i = 0; i < 5; i++) {
            const p = passos - i;
            if (p < 0) continue;
            ctx.fillStyle = `rgba(${CORES.clara}, ${(1 - vida) * (1 - i / 5)})`;
            ctx.fillRect(
              Math.round(risco.x * largura + p * 6),
              Math.round(risco.y * altura + p * 3),
              2,
              2,
            );
          }
        }
      }
    };

    if (reduzido) {
      desenhar(0);
      const redesenhar = () => {
        redimensionar();
        desenhar(0);
      };
      window.addEventListener("resize", redesenhar);
      return () => {
        window.removeEventListener("resize", redesenhar);
        ScrollTrigger.removeEventListener("refresh", medirSecoes);
      };
    }

    let pedido = 0;
    const laco = (agora: number) => {
      pedido = requestAnimationFrame(laco);
      if (document.hidden) return;
      quadro++;

      const alvo = densidadeEm(window.scrollY + altura / 2);
      densidade += (alvo - densidade) * 0.06;

      const parado = Math.abs(window.scrollY - rolagemAnterior) < 0.5 && riscos.length === 0;
      // Parado, meio quadro basta para o cintilar.
      if (parado && quadro % 2) return;
      desenhar(agora / 1000);
    };
    pedido = requestAnimationFrame(laco);

    // No celular a barra do navegador muda a altura da tela a cada gesto;
    // refazer o canvas nessas horas piscaria o céu. Só largura nova ou uma
    // mudança grande de altura (girar o aparelho) refazem.
    let larguraAnterior = window.innerWidth;
    let alturaAnterior = window.innerHeight;
    const aoRedimensionar = () => {
      if (
        window.innerWidth === larguraAnterior &&
        Math.abs(window.innerHeight - alturaAnterior) < 120
      ) {
        return;
      }
      larguraAnterior = window.innerWidth;
      alturaAnterior = window.innerHeight;
      redimensionar();
    };
    window.addEventListener("resize", aoRedimensionar);

    return () => {
      cancelAnimationFrame(pedido);
      window.removeEventListener("resize", aoRedimensionar);
      ScrollTrigger.removeEventListener("refresh", medirSecoes);
    };
  }, []);

  return <canvas ref={ref} aria-hidden="true" className="ceu-vivo" />;
}
