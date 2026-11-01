/**
 * Ponto único do GSAP e do Lenis no projeto. GSAP e Lenis entram pelo npm,
 * não por CDN: a CSP (`script-src 'self'`) bloquearia o script de fora em
 * silêncio e o site ficaria sem rolagem suave nem cena.
 */
import gsap from "gsap";
import type Lenis from "lenis";

/**
 * A instância do Lenis vive aqui, e não num contexto React: o menu, os
 * dossiês e o roteiro da missão param e retomam a rolagem sem provider em
 * volta da página.
 */
let lenisAtual: Lenis | null = null;
export const definirLenis = (lenis: Lenis | null) => {
  lenisAtual = lenis;
};
export const obterLenis = () => lenisAtual;

/**
 * Dentro da missão, o conteúdo de cada cena não está onde a rolagem leva até
 * ele: os cartões moram todos num palco fixo, e a posição de verdade de uma
 * cena é um ponto da rolagem calculado pelo roteiro. Quem resolve um link
 * `#projetos` para esse ponto é o roteiro, que se registra aqui.
 */
type Resolver = (alvo: HTMLElement) => number | null;
let resolverAtual: Resolver | null = null;
export const definirDestino = (resolver: Resolver | null) => {
  resolverAtual = resolver;
};
export const destinoDe = (alvo: HTMLElement) => resolverAtual?.(alvo) ?? null;

export const prefereMenosMovimento = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export { gsap };
