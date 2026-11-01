import type { CSSProperties } from "react";

import {
  ALTURA_LETRAS,
  MARCA_LINHA,
  MARCA_METADE,
  MARCA_NUCLEO,
  MARCA_TRACOS,
  NOME_DETERA,
} from "@/components/brand/marca-paths";
import { site } from "@/config/site";
import { cn } from "@/lib/utils/cn";

/**
 * O símbolo: o coração de placas, metade direita espelhada da esquerda, com a
 * linha de energia e o núcleo em vermelho. Decoração para o leitor de tela;
 * o nome ao lado é que diz quem é.
 */
export function Simbolo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 40" className={cn("shrink-0", className)} aria-hidden="true">
      <g fill="currentColor">
        <path d={MARCA_METADE} />
        <g transform="translate(32 0) scale(-1 1)">
          <path d={MARCA_METADE} />
        </g>
      </g>
      <g className="fill-determinacao">
        {MARCA_TRACOS.map((traco) => (
          <rect
            key={traco.y}
            x={MARCA_LINHA.x}
            y={traco.y}
            width={MARCA_LINHA.largura}
            height={traco.altura}
          />
        ))}
        <rect x={MARCA_LINHA.x} y="6.6" width={MARCA_LINHA.largura} height="26.6" />
        <path d={MARCA_NUCLEO} />
      </g>
    </svg>
  );
}

/**
 * O nome "DETERA" desenhado: seis caminhos de `NOME_DETERA`, não uma fonte.
 *
 * Com `caindo` (a primeira cena), cada letra recebe a posição na fila em
 * `--i` e a classe `letra-cai`: o CSS faz a queda com gravidade ao carregar.
 * A queda mora na letra e o movimento da cena mora no cartão em volta dela,
 * então a rolagem nunca grava o meio da queda como ponto de partida.
 */
export function Letreiro({ className, caindo = false }: { className?: string; caindo?: boolean }) {
  return (
    <svg
      viewBox={`0 0 716 ${ALTURA_LETRAS}`}
      className={cn("block h-auto overflow-visible", className)}
      role="img"
      aria-label={site.name}
    >
      <g fill="currentColor" fillRule="evenodd">
        {NOME_DETERA.map((letra, indice) => (
          <path
            key={indice}
            d={letra.d}
            className={caindo ? "letra-cai" : undefined}
            style={caindo ? ({ "--i": indice } as CSSProperties) : undefined}
          />
        ))}
      </g>
    </svg>
  );
}
