import {
  ALTURA_LETRAS,
  MARCA_LINHA,
  MARCA_METADE,
  MARCA_NUCLEO,
  MARCA_TRACOS,
  NOME_DETERA,
  NOME_DETERA_VIEWBOX,
} from "@/components/brand/marca-paths";
import { cn } from "@/lib/utils/cn";
import { site } from "@/config/site";

/**
 * O símbolo da DETERA: um coração de placas partido ao meio por uma linha de
 * energia — dentro dele vira núcleo, fora dele vira traço pontilhado, um
 * pulso que continua além da própria forma.
 *
 * A marca não fica parada: as duas metades respiram, o núcleo pulsa e os
 * traços piscam em sequência, como carga subindo e descendo pela linha. Tudo
 * em CSS, sem JavaScript — e o `prefers-reduced-motion` congela tudo.
 */
export function Simbolo({
  className,
  vivo = true,
}: {
  className?: string;
  /** Desliga o movimento onde a marca deve ficar quieta. */
  vivo?: boolean;
}) {
  return (
    <svg
      viewBox="0 0 32 40"
      className={cn("shrink-0", vivo && "marca-viva", className)}
      aria-hidden="true"
    >
      {/* Placas: a esquerda desenhada, a direita espelhada no eixo central —
          refletir garante a simetria que a olho nu nunca sai exata. */}
      <g fill="currentColor">
        <path className="marca-placa marca-placa--esq" d={MARCA_METADE} />
        <g transform="translate(32 0) scale(-1 1)">
          <path className="marca-placa marca-placa--dir" d={MARCA_METADE} />
        </g>
      </g>

      {/* A linha e os traços que continuam fora do coração. */}
      <g className="marca-energia fill-determinacao">
        {MARCA_TRACOS.map((traco) => (
          <rect
            key={traco.y}
            className="marca-traco"
            x={MARCA_LINHA.x}
            y={traco.y}
            width={MARCA_LINHA.largura}
            height={traco.altura}
          />
        ))}
        <rect
          className="marca-linha"
          x={MARCA_LINHA.x}
          y="6.6"
          width={MARCA_LINHA.largura}
          height="26.6"
        />
        <path className="marca-nucleo" d={MARCA_NUCLEO} />
      </g>
    </svg>
  );
}

/**
 * O nome "DETERA" desenhado — não é fonte, são os seis caminhos de
 * `NOME_DETERA`. É o que dá o chanfro exato dos terminais e o "A" de topo
 * reto, coisa que fonte nenhuma entrega. Debaixo do "A" vai o símbolo da
 * marca em miniatura — o mesmo coração de placas do cabeçalho, na mesma
 * geometria — em vez da tarja vermelha solta que estava ali antes.
 *
 * Com `animado`, cada letra cai como um meteoro (a mesma coreografia do
 * `TextoMeteoro`, agora em `<path>`) e uma luz vermelha atravessa o nome
 * depois que ele pousa. O símbolo cai junto com o "A", como parte do
 * mesmo grupo. Sem `animado`, é estático — o uso do rodapé.
 *
 * A palavra vai como `aria-label`: o leitor de tela diz "DETERA", não
 * soletra os caminhos.
 */
export function Letreiro({
  className,
  animado = false,
  atraso = 0,
  passo = 0.06,
}: {
  className?: string;
  /** Liga a queda em meteoro letra a letra e a luz que atravessa depois. */
  animado?: boolean;
  /** Segundos antes de a primeira letra cair. */
  atraso?: number;
  /** Intervalo entre uma letra e a seguinte. */
  passo?: number;
}) {
  // Sem `animado` (o rodapé) o símbolo embaixo do "A" nem entra — então a
  // caixa também não precisa do espaço extra por baixo. Recortar o viewBox
  // às letras evita sobra de área transparente puxando o alinhamento
  // vertical do rodapé para baixo do símbolo ao lado.
  const viewBox = animado ? NOME_DETERA_VIEWBOX : `0 0 716 ${ALTURA_LETRAS}`;

  return (
    <svg
      viewBox={viewBox}
      className={cn("letreiro-relevo block h-auto overflow-visible", className)}
      role="img"
      aria-label={site.name}
    >
      <g fill="currentColor" fillRule="evenodd">
        {NOME_DETERA.map((letra, indice) => {
          if (!animado) return <path key={indice} d={letra.d} />;

          const ultima = indice === NOME_DETERA.length - 1;

          // Duas camadas por letra, uma para cada animação. A de fora cai em
          // meteoro (CSS, ao carregar); a de dentro (`data-letra-desfaz`) é
          // do hero fixado, que desfaz o nome na rolagem. Numa camada só, a
          // rolagem gravaria como ponto de partida o quadro do meio da queda,
          // e a letra sumiria ao voltar ao topo.
          return (
            <g
              key={indice}
              className="letra-meteoro"
              style={{ animationDelay: `${(atraso + indice * passo).toFixed(3)}s` }}
            >
              <g data-letra-desfaz>
                <path d={letra.d} />
              </g>

              {/* O símbolo em miniatura, sob o "A" — só na versão animada
                  (o rodapé já mostra o símbolo em tamanho cheio ao lado do
                  nome; repeti-lo pequeno ali embaixo seria redundante).
                  `652` é o centro do "A" (as pernas vão de 596 a 708); a
                  escala de 1.3 dá 41.6 de largura por 52 de altura, o
                  suficiente pra continuar legível nesse tamanho.

                  Cai junto com o "A" (está na mesma camada de queda), mas
                  tem camada de rolagem própria: no hero fixado é o que fica
                  quando o nome se desfaz. */}
              {ultima ? (
                <g data-hero-coracao>
                  <g
                    className="marca-viva"
                    transform="translate(631 140) scale(1.3)"
                    fillRule="nonzero"
                  >
                    <g fill="currentColor">
                      <path className="marca-placa marca-placa--esq" d={MARCA_METADE} />
                      <g transform="translate(32 0) scale(-1 1)">
                        <path className="marca-placa marca-placa--dir" d={MARCA_METADE} />
                      </g>
                    </g>
                    <g className="marca-energia fill-determinacao">
                      {MARCA_TRACOS.map((traco) => (
                        <rect
                          key={traco.y}
                          className="marca-traco"
                          x={MARCA_LINHA.x}
                          y={traco.y}
                          width={MARCA_LINHA.largura}
                          height={traco.altura}
                        />
                      ))}
                      <rect
                        className="marca-linha"
                        x={MARCA_LINHA.x}
                        y="6.6"
                        width={MARCA_LINHA.largura}
                        height="26.6"
                      />
                      <path className="marca-nucleo" d={MARCA_NUCLEO} />
                    </g>
                  </g>
                </g>
              ) : null}
            </g>
          );
        })}
      </g>

      {/* A luz que atravessa o nome depois que ele pousa: uma faixa vermelha
          recortada nas próprias letras, deslizando da esquerda para a
          direita. Só existe quando `animado`. */}
      {animado ? (
        <>
          <defs>
            <clipPath id="letreiro-detera">
              {NOME_DETERA.map((letra, indice) => (
                <path key={indice} d={letra.d} />
              ))}
            </clipPath>
            <linearGradient id="letreiro-varredura" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0" stopColor="var(--color-determinacao-viva)" stopOpacity="0" />
              <stop offset="0.5" stopColor="var(--color-determinacao-viva)" stopOpacity="0.85" />
              <stop offset="1" stopColor="var(--color-determinacao-viva)" stopOpacity="0" />
            </linearGradient>
          </defs>
          <g className="marca-varredura" clipPath="url(#letreiro-detera)" aria-hidden="true">
            <rect x="-280" y="0" width="280" height="128" fill="url(#letreiro-varredura)" />
          </g>
        </>
      ) : null}
    </svg>
  );
}

/**
 * Assinatura completa: símbolo mais o nome desenhado. Usada onde a marca
 * precisa se apresentar por extenso — o cabeçalho carrega só o símbolo.
 */
export function Wordmark({
  className,
  tamanho = "md",
}: {
  className?: string;
  tamanho?: "sm" | "md";
}) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <Simbolo
        className={cn("text-texto", tamanho === "sm" ? "h-6 w-[1.2rem]" : "h-7 w-[1.4rem]")}
      />
      <Letreiro
        className={cn("text-texto", tamanho === "sm" ? "h-[0.72rem]" : "h-[0.82rem]")}
      />
    </span>
  );
}
