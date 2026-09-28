import {
  MARCA_LINHA,
  MARCA_METADE,
  MARCA_NUCLEO,
  MARCA_TRACOS,
} from "@/components/brand/marca-paths";

/**
 * O coração da marca cortado em faixas, para poder se montar bloco a bloco —
 * o gesto-assinatura da DETERA.
 *
 * Mesma geometria de `marca-paths.ts` (sistema `0 0 32 40`), sem nenhum
 * ponto novo: cada placa é o mesmo caminho repetido e recortado por uma faixa
 * horizontal. Parado, as faixas se encostam e o desenho é idêntico ao do
 * `Simbolo`; em movimento, cada faixa encaixa de lado, da base para o topo,
 * alternando esquerda e direita, como blocos empilhados.
 *
 * Os ganchos da coreografia são `data-*`: `data-bloco` (com `data-faixa` e
 * `data-lado`), `data-linha`, `data-traco` e `data-nucleo`. A animação mora
 * em `lib/montar-coracao.ts`, fora daqui — este componente é só desenho e
 * roda no servidor.
 *
 * `id` precisa ser único na página: é o prefixo dos `clipPath`.
 */
export const FAIXAS_DO_CORACAO = 7;
const TOPO = 11.4;
const BASE = 29.8;
const ALTURA = (BASE - TOPO) / FAIXAS_DO_CORACAO;
const FAIXAS = Array.from({ length: FAIXAS_DO_CORACAO }, (_, i) => i);

export function CoracaoBlocos({ id }: { id: string }) {
  return (
    <>
      <defs>
        {FAIXAS.map((i) => (
          <clipPath key={i} id={`${id}-faixa-${i}`}>
            {/* 0,1 de sobra em cima e embaixo: sem ela, a borda suavizada de
                duas faixas vizinhas deixava um fio escuro entre elas, e com o
                coração crescido no centro da tela o fio virava uma listra. */}
            <rect x="0" y={TOPO + i * ALTURA - 0.1} width="32" height={ALTURA + 0.2} />
          </clipPath>
        ))}
      </defs>

      <g fill="currentColor">
        {FAIXAS.map((i) => (
          <g key={i} data-bloco data-lado="esq" data-faixa={i} clipPath={`url(#${id}-faixa-${i})`}>
            <path d={MARCA_METADE} />
          </g>
        ))}
        {/* A metade direita é a esquerda espelhada: refletir garante a
            simetria que a olho nu nunca sai exata. Dentro do espelho, o
            `x` negativo da coreografia vira "vem da direita" sozinho. */}
        <g transform="translate(32 0) scale(-1 1)">
          {FAIXAS.map((i) => (
            <g key={i} data-bloco data-lado="dir" data-faixa={i} clipPath={`url(#${id}-faixa-${i})`}>
              <path d={MARCA_METADE} />
            </g>
          ))}
        </g>
      </g>

      <g className="fill-determinacao">
        {MARCA_TRACOS.map((traco) => (
          <rect
            key={traco.y}
            data-traco
            x={MARCA_LINHA.x}
            y={traco.y}
            width={MARCA_LINHA.largura}
            height={traco.altura}
          />
        ))}
        <rect data-linha x={MARCA_LINHA.x} y="6.6" width={MARCA_LINHA.largura} height="26.6" />
        <path data-nucleo d={MARCA_NUCLEO} />
      </g>
    </>
  );
}
