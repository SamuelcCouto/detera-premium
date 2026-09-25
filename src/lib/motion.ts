/**
 * Ponto único do GSAP no projeto. Todo componente animado importa daqui, para
 * os plugins serem registrados uma vez só e só no navegador — no servidor não
 * existe `window`, e o ScrollTrigger precisa dele.
 *
 * GSAP e Lenis entram pelo npm, não por CDN: a CSP (`script-src 'self'`)
 * bloquearia o script de fora em silêncio e o site ficaria sem animação
 * nenhuma, sem erro óbvio no console.
 */
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import type Lenis from "lenis";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, useGSAP);
  // No celular a barra do navegador aparece e some durante a rolagem e muda a
  // altura da janela. Sem isto, cada mudança recalcularia todos os trechos
  // fixados no meio do gesto e a página daria um salto.
  ScrollTrigger.config({ ignoreMobileResize: true });
  // Só para o QA: o `prints.mjs` da skill procura `window.ScrollTrigger` para
  // achar os trechos fixados. Importado pelo npm, o plugin não fica global.
  (window as unknown as { ScrollTrigger?: typeof ScrollTrigger }).ScrollTrigger =
    ScrollTrigger;
}

/**
 * A instância do Lenis vive aqui, e não num contexto React, para o menu e os
 * links de âncora rolarem a página sem precisar de provider — as seções
 * continuam sendo componentes de servidor.
 */
let lenisAtual: Lenis | null = null;
export const definirLenis = (lenis: Lenis | null) => {
  lenisAtual = lenis;
};
export const obterLenis = () => lenisAtual;

export const prefereMenosMovimento = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** Condição do `gsap.matchMedia()`: só anima quem não pediu menos movimento. */
export const COM_MOVIMENTO = "(prefers-reduced-motion: no-preference)";

export { gsap, ScrollTrigger, useGSAP };
