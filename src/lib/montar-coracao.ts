import type { gsap } from "@/lib/motion";

/**
 * O gesto-assinatura: o coração se monta bloco a bloco, a linha de energia
 * carrega de cima a baixo e o núcleo acende.
 *
 * Tudo em degraus (`steps`): cada faixa encaixa de lado em dois saltos, a
 * linha enche em seis, o núcleo aparece em três. Nada desliza liso nem quica
 * — pixel encaixa na grade, não escorrega até ela.
 *
 * Escreve na timeline recebida a partir de `inicio` e devolve o instante em
 * que o coração ficou pronto. Serve tanto para tempo (o hero ao carregar)
 * quanto para rolagem (o fecho do manifesto). O desenho vem de
 * `CoracaoBlocos`.
 */
export function montarCoracao(
  tl: gsap.core.Timeline,
  raiz: Element,
  { inicio = 0, passo = 0.045 }: { inicio?: number; passo?: number } = {},
) {
  const blocos = [...raiz.querySelectorAll<SVGGElement>("[data-bloco]")].sort((a, b) => {
    // Da base para o topo; na mesma faixa, a esquerda antes da direita.
    const faixa = Number(b.dataset.faixa) - Number(a.dataset.faixa);
    return faixa || (a.dataset.lado === "esq" ? -1 : 1);
  });

  blocos.forEach((bloco, i) => {
    tl.fromTo(
      bloco,
      // Dentro da metade espelhada, o mesmo `x` negativo vem da direita.
      { x: -5, opacity: 0 },
      { x: 0, opacity: 1, duration: passo * 2, ease: "steps(2)" },
      inicio + i * passo,
    );
  });

  // A origem vai no estado inicial também, não só no final. Declarada só no
  // final, o GSAP troca a origem com o elemento já em escala 0 e compensa a
  // troca com um deslocamento (`smoothOrigin`), e o núcleo terminava fora do
  // centro do coração.
  const carga = inicio + blocos.length * passo + passo;
  tl.fromTo(
    raiz.querySelector("[data-linha]"),
    { scaleY: 0, transformOrigin: "50% 0%" },
    { scaleY: 1, transformOrigin: "50% 0%", duration: 0.3, ease: "steps(6)" },
    carga,
  )
    .fromTo(
      raiz.querySelectorAll("[data-traco]"),
      { opacity: 0 },
      { opacity: 1, duration: 0.01, stagger: 0.07 },
      carga + 0.04,
    )
    .fromTo(
      raiz.querySelector("[data-nucleo]"),
      { scale: 0, transformOrigin: "50% 50%" },
      { scale: 1, transformOrigin: "50% 50%", duration: 0.18, ease: "steps(3)" },
      carga + 0.3,
    );

  return carga + 0.48;
}
