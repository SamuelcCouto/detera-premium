/**
 * A geometria da marca, em um lugar só.
 *
 * O símbolo aparece em três lugares que não compartilham runtime — o site
 * (SVG no DOM), o favicon e a imagem de compartilhamento (ambos desenhados
 * pelo `next/og`). Com os caminhos duplicados em cada arquivo, bastava
 * ajustar um deles para a marca ficar diferente de si mesma sem ninguém
 * notar. Todos leem daqui.
 *
 * Sistema de coordenadas do símbolo: `viewBox="0 0 32 40"`, centro em x = 16.
 */

/**
 * O nome "DETERA" desenhado — não é fonte, são seis letras vetorizadas,
 * traçadas em cima do render que o Samuel mandou: o que uma fonte não dá
 * é o chanfro a 45° em cada terminal (inclusive na ponta do braço do
 * meio do "E" e no pé afunilado do "T"), a proporção larga e o "A" de
 * topo reto — sem barra, sem tarja: o símbolo é que vai embaixo dele.
 *
 * O relevo — a sombra macia que faz o nome flutuar — não está aqui: é um
 * `filter` de CSS em cima do SVG inteiro (`.letreiro-relevo`).
 *
 * Sistema de coordenadas: `viewBox="0 0 716 202"`. As letras ocupam
 * y 0–128; o espaço de y 128 a 202 é reservado para o símbolo pequeno sob
 * o "A" (`ALTURA_LETRAS` marca essa divisa). Cada letra é um caminho
 * fechado; D, E do meio, R e A carregam o contador como segundo
 * subcaminho, então precisam de `fill-rule: evenodd`.
 */
export const NOME_DETERA_VIEWBOX = "0 0 716 202" as const;
export const ALTURA_LETRAS = 128;

export const NOME_DETERA = [
  { nome: "D", d: "M0 0 H62 L94 32 V96 L62 128 H0 Z M20 20 V108 H54 L74 88 V40 L54 20 Z" },
  {
    nome: "E",
    d: "M116 16 L132 0 H210 V22 H138 V52 H188 L200 64 L188 76 H138 V106 H210 V128 H132 L116 112 Z",
  },
  { nome: "T", d: "M250 0 H322 L338 16 V22 H297 V128 H275 V22 H234 V16 Z" },
  {
    nome: "E",
    d: "M358 16 L374 0 H452 V22 H380 V52 H430 L442 64 L430 76 H380 V106 H452 V128 H374 L358 112 Z",
  },
  {
    nome: "R",
    d: "M476 0 H540 L568 28 V56 L548 76 L572 128 H548 L526 80 H496 V128 H476 Z M496 20 V60 H532 L544 48 V32 L532 20 Z",
  },
  {
    nome: "A",
    d: "M596 128 L628 0 H676 L708 128 H681 L672 92 H632 L623 128 Z M642 68 H662 L652 24 Z",
  },
] as const;

/** Metade esquerda do coração, em placa chanfrada. A direita é espelhada. */
export const MARCA_METADE =
  "M14.6 14.2 L12.8 11.4 L10.8 11.4 L9.2 12.8 L6.6 12.8 L6.6 15.2 " +
  "L5 15.2 L5 19 L6.6 19 L6.6 20.6 L9.6 23.6 L9.6 24.8 L14.6 29.8 Z";

/**
 * O núcleo: cruz de braços escalonados, larga o bastante para atravessar as
 * duas placas. Braço fino demais vira bolinha quando a marca encolhe para o
 * tamanho do cabeçalho — a cruz precisa continuar legível em 40px.
 */
export const MARCA_NUCLEO =
  "M14.6 15.4 L17.4 15.4 L17.4 17 L18.8 17 L18.8 18.2 L20.6 18.2 " +
  "L20.6 21.8 L18.8 21.8 L18.8 23 L17.4 23 L17.4 24.6 L14.6 24.6 " +
  "L14.6 23 L13.2 23 L13.2 21.8 L11.4 21.8 L11.4 18.2 L13.2 18.2 " +
  "L13.2 17 L14.6 17 Z";

/** A linha de energia que atravessa a marca, e os traços que a continuam. */
export const MARCA_LINHA = { x: 15.35, largura: 1.3 } as const;

export const MARCA_TRACOS = [
  { y: 1.4, altura: 1.4 },
  { y: 3.9, altura: 1.4 },
  { y: 34.7, altura: 1.4 },
  { y: 37.2, altura: 1.4 },
] as const;
