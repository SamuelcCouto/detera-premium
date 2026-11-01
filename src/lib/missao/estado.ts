import { CENAS, type Cena } from "@/lib/missao/cenas";

/**
 * O estado que a cena 3D e os instrumentos leem a cada quadro. Mora fora do
 * React: a rolagem muda isto sessenta vezes por segundo, e passar por estado
 * do React re-renderizaria a página inteira a cada quadro.
 */
export const E = {
  /** Posição fracionária no roteiro: 3,4 é 40% da viagem da cena 3 para a 4. */
  s: 0,
  /** As duas cenas vizinhas e a mistura entre elas, já suavizada. */
  a: 0,
  b: 0,
  t: 0,
  /** Velocidade da rolagem, em cenas por segundo (com sinal). */
  vel: 0,

  atmos: 0,
  ceu: 0,
  plasma: 0,
  tremor: 0,
  nuvens: 0,
  relevo: 0,
  relevoX: 0,
  alt: 0,
  altVisivel: 0,
  trajetoria: 0,
  orbita: 0,
  rotulos: 0,
  rastro: 0,
  sentido: 1,

  /** Chegada ao carregar: 0 no primeiro quadro, 1 quando a câmera assenta. */
  chegada: 0,
  /** Cursor, de -1 a 1 em cada eixo, já com a mola aplicada. */
  mx: 0,
  my: 0,
  /** Modo linear: sem cena dirigida, a câmera fica parada na pose do sistema. */
  linear: false,

  /** Posições projetadas dos planetas na tela (px), escritas pela cena 3D para as etiquetas. */
  projecoes: [] as { x: number; y: number; r: number; visivel: boolean }[],
};

const suave = (t: number) => t * t * t * (t * (t * 6 - 15) + 10);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

const NUMERICOS = [
  "atmos",
  "ceu",
  "plasma",
  "tremor",
  "nuvens",
  "relevo",
  "relevoX",
  "trajetoria",
  "orbita",
  "rotulos",
] as const satisfies readonly (keyof Cena & keyof typeof E)[];

/** Escreve em `E` o estado da posição `s` do roteiro. */
export function interpolar(s: number, cenas: Cena[] = CENAS) {
  const max = cenas.length - 1;
  const sc = Math.min(Math.max(s, 0), max);
  const a = Math.floor(sc);
  const b = Math.min(a + 1, max);
  const t = suave(sc - a);
  const A = cenas[a];
  const B = cenas[b];

  E.s = sc;
  E.a = a;
  E.b = b;
  E.t = t;
  for (const chave of NUMERICOS) E[chave] = lerp(A[chave], B[chave], t);

  // O altímetro aparece e some junto com a atmosfera; sem leitura, segura a última.
  const altA = A.alt ?? B.alt;
  const altB = B.alt ?? A.alt;
  E.alt = altA !== null && altB !== null ? lerp(altA, altB, t) : E.alt;
  E.altVisivel = lerp(A.alt === null ? 0 : 1, B.alt === null ? 0 : 1, t);

  // Rastros só durante a viagem até a cena que os pede, no meio dela mais forte.
  const viagem = Math.sin(Math.PI * (sc - a));
  E.rastro = Math.max(B.rastro * viagem, E.plasma * 0.9);
  E.sentido = B.rastro > 0 ? B.sentido : 1;
}
