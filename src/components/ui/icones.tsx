import type { SVGProps } from "react";

/**
 * Ícones em pixel, na mesma lógica do coração da marca: cada um é um
 * punhado de quadrados numa grade de 10 × 10, sem curva e sem traço.
 *
 * Antes eram linhas de 1,5 com ponta redonda numa grade de 24, o mesmo
 * traço dos pacotes de ícone prontos. Em pixel eles pertencem à DETERA e a
 * mais ninguém.
 *
 * Desenhados para 20px (2px de tela por quadrado), com `crispEdges` para os
 * quadrados não borrarem. Cada ícone é uma lista de `[x, y, largura, altura]`.
 */
type Blocos = readonly (readonly [number, number, number, number])[];

function IconePixel({ blocos, ...props }: SVGProps<SVGSVGElement> & { blocos: Blocos }) {
  return (
    <svg
      viewBox="0 0 10 10"
      fill="currentColor"
      shapeRendering="crispEdges"
      aria-hidden="true"
      {...props}
    >
      {blocos.map(([x, y, w, h]) => (
        <rect key={`${x}-${y}-${w}-${h}`} x={x} y={y} width={w} height={h} />
      ))}
    </svg>
  );
}

/** Balão de conversa com a ponta embaixo, à esquerda. */
const WHATSAPP: Blocos = [
  [2, 1, 6, 1],
  [1, 2, 1, 1],
  [8, 2, 1, 1],
  [0, 3, 1, 3],
  [9, 3, 1, 3],
  [1, 6, 1, 1],
  [8, 6, 1, 1],
  [3, 7, 5, 1],
  [2, 7, 1, 2],
  [1, 9, 1, 1],
  [3, 4, 1, 1],
  [5, 4, 1, 1],
  [7, 4, 1, 1],
];

/** Envelope com a aba em V. */
const EMAIL: Blocos = [
  [0, 2, 10, 1],
  [0, 8, 10, 1],
  [0, 3, 1, 5],
  [9, 3, 1, 5],
  [1, 3, 1, 1],
  [2, 4, 1, 1],
  [3, 5, 1, 1],
  [4, 6, 2, 1],
  [6, 5, 1, 1],
  [7, 4, 1, 1],
  [8, 3, 1, 1],
];

/** "in" dentro de uma moldura. */
const LINKEDIN: Blocos = [
  [0, 0, 10, 1],
  [0, 9, 10, 1],
  [0, 1, 1, 8],
  [9, 1, 1, 8],
  [2, 2, 1, 1],
  [2, 4, 1, 4],
  [4, 4, 1, 4],
  [5, 4, 2, 1],
  [7, 5, 1, 3],
];

/** Os sinais de código, `< >`. */
const GITHUB: Blocos = [
  [3, 2, 1, 1],
  [2, 3, 1, 1],
  [1, 4, 1, 2],
  [2, 6, 1, 1],
  [3, 7, 1, 1],
  [6, 2, 1, 1],
  [7, 3, 1, 1],
  [8, 4, 1, 2],
  [7, 6, 1, 1],
  [6, 7, 1, 1],
];

/** Abre em outra aba: a caixa aberta no canto e a saída na diagonal. */
const LINK_EXTERNO: Blocos = [
  [0, 2, 4, 1],
  [0, 3, 1, 7],
  [1, 9, 7, 1],
  [7, 6, 1, 3],
  [5, 1, 4, 1],
  [8, 2, 1, 3],
  [7, 2, 1, 1],
  [6, 3, 1, 1],
  [5, 4, 1, 1],
  [4, 5, 1, 1],
];

export function IconeWhatsapp(props: SVGProps<SVGSVGElement>) {
  return <IconePixel blocos={WHATSAPP} {...props} />;
}

export function IconeEmail(props: SVGProps<SVGSVGElement>) {
  return <IconePixel blocos={EMAIL} {...props} />;
}

export function IconeLinkedin(props: SVGProps<SVGSVGElement>) {
  return <IconePixel blocos={LINKEDIN} {...props} />;
}

export function IconeGithub(props: SVGProps<SVGSVGElement>) {
  return <IconePixel blocos={GITHUB} {...props} />;
}

export function IconeLinkExterno(props: SVGProps<SVGSVGElement>) {
  return <IconePixel blocos={LINK_EXTERNO} {...props} />;
}
