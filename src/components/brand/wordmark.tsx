import { CoracaoBlocos } from "@/components/brand/coracao";
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
 * energia. Dentro dele a linha vira núcleo; fora dele, traço pontilhado, um
 * pulso que continua além da própria forma. O nome vem de DETERMINAÇÃO, e o
 * coração é a alma de Undertale, o jogo que inspirou a marca, desenhado em
 * placas.
 *
 * Três modos:
 * - parado (padrão), o uso de rodapé, erro e 404;
 * - `vivo`: as metades respiram, o núcleo pulsa e os traços piscam, em CSS.
 *   Só o cabeçalho usa: é a marca em repouso sempre à vista. Antes todo
 *   símbolo da página respirava, e loop em todo lugar é ruído;
 * - `montavel`: cortado em faixas para se montar bloco a bloco
 *   (`CoracaoBlocos`). O valor é o prefixo único dos `clipPath`.
 */
export function Simbolo({
  className,
  vivo = false,
  montavel,
}: {
  className?: string;
  vivo?: boolean;
  montavel?: string;
}) {
  return (
    <svg
      viewBox="0 0 32 40"
      className={cn("shrink-0", vivo && "marca-viva", className)}
      aria-hidden="true"
    >
      {montavel ? (
        <CoracaoBlocos id={montavel} />
      ) : (
        <>
          <g fill="currentColor">
            <path className="marca-placa marca-placa--esq" d={MARCA_METADE} />
            <g transform="translate(32 0) scale(-1 1)">
              <path className="marca-placa marca-placa--dir" d={MARCA_METADE} />
            </g>
          </g>
          <g className="fill-determinacao">
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
        </>
      )}
    </svg>
  );
}

/**
 * O nome "DETERA" desenhado: não é fonte, são os seis caminhos de
 * `NOME_DETERA`. É o que dá o chanfro exato dos terminais e o "A" de topo
 * reto, coisa que fonte nenhuma entrega.
 *
 * Com `animado` (o hero), cada letra tem duas camadas: a de dentro
 * (`data-letra-entra`) encaixa ao carregar, a de fora (`data-letra-desfaz`)
 * sai na rolagem. Numa camada só, a rolagem gravaria como ponto de partida
 * o quadro do meio da entrada, e a letra sumiria ao voltar ao topo. Embaixo
 * do "A" vai o coração em blocos, também em duas camadas: `data-coracao-entra`
 * (a montagem no centro da tela e a descida até o lugar dele) e
 * `data-hero-coracao` (a volta ao centro e a travessia do núcleo, na
 * rolagem).
 *
 * Sem `animado` é estático e sem o coração, o uso do rodapé.
 *
 * A palavra vai como `aria-label`: o leitor de tela diz "DETERA", não
 * soletra os caminhos.
 */
export function Letreiro({
  className,
  animado = false,
}: {
  className?: string;
  animado?: boolean;
}) {
  // Sem `animado` o símbolo embaixo do "A" nem entra, então a caixa também
  // não precisa do espaço extra por baixo: recortar o viewBox às letras
  // evita sobra transparente puxando o alinhamento do rodapé para baixo.
  const viewBox = animado ? NOME_DETERA_VIEWBOX : `0 0 716 ${ALTURA_LETRAS}`;

  return (
    <svg
      viewBox={viewBox}
      className={cn("block h-auto overflow-visible", className)}
      role="img"
      aria-label={site.name}
    >
      <g fill="currentColor" fillRule="evenodd">
        {NOME_DETERA.map((letra, indice) =>
          animado ? (
            <g key={indice} data-letra-desfaz>
              <g data-letra-entra>
                <path d={letra.d} />
              </g>
            </g>
          ) : (
            <path key={indice} d={letra.d} />
          ),
        )}
      </g>

      {/* O coração sob o "A". `652` é o centro do "A" (as pernas vão de 596
          a 708); a escala de 1,3 dá 41,6 de largura por 52 de altura, o
          suficiente para continuar legível nesse tamanho. */}
      {animado ? (
        <g data-hero-coracao>
          <g data-coracao-entra>
            <g transform="translate(631 140) scale(1.3)" fillRule="nonzero">
              <CoracaoBlocos id="hero-coracao" />
            </g>
          </g>
        </g>
      ) : null}
    </svg>
  );
}

/**
 * Assinatura completa: símbolo mais o nome desenhado. Usada onde a marca
 * precisa se apresentar por extenso; o cabeçalho carrega só o símbolo.
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
