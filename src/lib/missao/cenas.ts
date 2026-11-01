/**
 * O roteiro da missão: uma lista de cenas em que cada linha diz só o que
 * muda em relação à anterior. `montarCenas` acumula e devolve cada cena
 * completa.
 *
 * Uma função só (`interpolar`, em `estado.ts`) escreve o estado da cena a
 * partir da posição na rolagem. Na v2, vários trechos de rolagem escreviam a
 * mesma propriedade, e o último a ser criado decidia o estado ao carregar; com
 * um roteiro só, nenhuma propriedade tem dois donos.
 */

/** Para onde a câmera olha: o sistema, o núcleo, o cinturão ou um planeta (0 a 3). */
export type Foco = "sistema" | "nucleo" | "cinturao" | 0 | 1 | 2 | 3;

/** Como o cartão chega e sai da cena. */
export type Entrada = "lateral" | "queda" | "orbita";

export type Lado = "esq" | "dir" | "centro";

export type Cena = {
  /** Âncora e chave do conteúdo. */
  id: string;
  /** Nome do ato no instrumento de trajetória. */
  ato: string;
  /** Quanto a cena fica parada, em svh de rolagem. */
  hold: number;

  foco: Foco;
  /** Distância da câmera ao foco, em unidades do mundo. */
  dist: number;
  /** Ângulos da câmera em graus. Num planeta, `az = 0` é a câmera entre ele e o núcleo (face iluminada). */
  az: number;
  el: number;
  /** Deslocamento do enquadramento (fração da tela): tira o foco do centro, do lado oposto ao cartão. */
  ox: number;
  oy: number;

  /** Camada de atmosfera sobre a cena 3D: 0 é espaço, 1 é dentro do céu. */
  atmos: number;
  /** Céu: 0 é a descida azul, 1 é o crepúsculo. */
  ceu: number;
  plasma: number;
  tremor: number;
  nuvens: number;
  /** Relevo do solo ao crepúsculo e o quanto ele correu de lado. */
  relevo: number;
  relevoX: number;
  /** Altitude no altímetro, em km. `null` esconde o instrumento. */
  alt: number | null;
  /** Trajetória orbital do processo: visibilidade e posição da cápsula (0 a 4, uma queima por etapa). */
  trajetoria: number;
  orbita: number;
  /** Etiquetas dos planetas presas por linha de instrumento. */
  rotulos: number;
  /** Rastros na viagem até esta cena: intensidade e sentido (1 sobem, como quem desce; -1 descem). */
  rastro: number;
  sentido: number;

  lado: Lado;
  entrada: Entrada;
};

type Parcial = Partial<Cena> & Pick<Cena, "id">;

const PADRAO: Omit<Cena, "id"> = {
  ato: "Chegada",
  hold: 40,
  foco: "sistema",
  dist: 70,
  az: 25,
  el: 26,
  ox: 0,
  oy: 0,
  atmos: 0,
  ceu: 0,
  plasma: 0,
  tremor: 0,
  nuvens: 0,
  relevo: 0,
  relevoX: 0,
  alt: null,
  trajetoria: 0,
  orbita: 0,
  rotulos: 0,
  rastro: 0,
  sentido: 1,
  lado: "esq",
  entrada: "lateral",
};

/**
 * Valores que valem só para a cena em que aparecem e não passam adiante:
 * rastro é da viagem, e etiquetas e altímetro precisam ser pedidos.
 */
const NAO_HERDA: (keyof Cena)[] = ["rastro", "sentido", "rotulos"];

const ROTEIRO: Parcial[] = [
  // Chegada: o sistema inteiro, com as quatro frentes etiquetadas.
  { id: "topo", ato: "Chegada", hold: 30, foco: "sistema", dist: 78, az: 28, el: 24, ox: 0.2, rotulos: 1, lado: "esq", entrada: "queda" },
  { id: "sinais", hold: 70, foco: "cinturao", dist: 9, az: 70, el: 6, ox: -0.18, lado: "dir", entrada: "lateral" },

  // Sistema: um planeta por cena, em arco lateral, alternando os lados.
  { id: "solucoes", ato: "Sistema", hold: 55, foco: 0, dist: 5.2, az: 38, el: 10, ox: -0.2, lado: "dir", entrada: "lateral" },
  { id: "frente-crescimento", hold: 55, foco: 1, dist: 10.5, az: -32, el: 16, ox: 0.2, lado: "esq" },
  { id: "frente-tecnologia", hold: 55, foco: 2, dist: 7.8, az: 62, el: -6, ox: -0.24, lado: "dir" },
  { id: "frente-infraestrutura", hold: 55, foco: 3, dist: 7.2, az: 10, el: 12, ox: 0.2, lado: "esq" },

  // Reentrada: a câmera mergulha no planeta azul.
  { id: "personalidade", ato: "Reentrada", hold: 45, foco: 3, dist: 3.25, az: 0, el: 64, ox: 0, oy: 0.08, atmos: 0.25, alt: 140, lado: "centro", entrada: "queda", rastro: 0.5, sentido: 1 },
  { id: "par-1", hold: 40, atmos: 1, plasma: 0.5, tremor: 0.3, alt: 104, rastro: 0.6 },
  { id: "par-2", hold: 40, plasma: 0.95, tremor: 0.75, alt: 78 },
  { id: "par-3", hold: 40, plasma: 1, tremor: 1, alt: 52 },
  { id: "par-4", hold: 40, plasma: 0.55, tremor: 0.45, alt: 31 },
  { id: "fecho", hold: 50, plasma: 0, tremor: 0, nuvens: 1, ceu: 0.55, alt: 9, rastro: 0.3 },

  // Solo: o crepúsculo, com o relevo correndo de lado entre os projetos.
  { id: "projetos", ato: "Solo", hold: 60, nuvens: 0, ceu: 1, relevo: 1, relevoX: 0, alt: null, lado: "dir", entrada: "lateral" },
  { id: "case-fidele", hold: 60, relevoX: 1, lado: "esq" },
  { id: "em-obra", hold: 50, relevoX: 2, ceu: 0.82, lado: "dir" },

  // Trajetória: relançamento à órbita do planeta azul, uma queima por etapa.
  { id: "processo", ato: "Trajetória", hold: 45, atmos: 0, ceu: 0, relevo: 0, foco: 3, dist: 15, az: 30, el: 38, ox: 0.18, oy: 0, trajetoria: 1, orbita: 0, lado: "esq", entrada: "orbita", rastro: 1, sentido: -1 },
  { id: "etapa-2", hold: 40, orbita: 1, az: 70 },
  { id: "etapa-3", hold: 40, orbita: 2, az: 110 },
  { id: "etapa-4", hold: 40, orbita: 3, az: 150 },
  { id: "etapa-5", hold: 50, orbita: 4, az: 190 },

  // Diário de bordo, perto do núcleo, e o sinal: o sistema de longe.
  { id: "sobre", ato: "Diário", hold: 55, trajetoria: 0, foco: "nucleo", dist: 36, az: 140, el: 40, ox: 0.26, lado: "esq", entrada: "lateral" },
  { id: "sinal", ato: "Sinal", hold: 30, foco: "sistema", dist: 96, az: 200, el: 34, ox: 0, oy: 0.12, lado: "centro", entrada: "queda" },
];

export function montarCenas(): Cena[] {
  const cenas: Cena[] = [];
  let anterior: Omit<Cena, "id"> = PADRAO;
  for (const parcial of ROTEIRO) {
    const base = { ...anterior };
    for (const chave of NAO_HERDA) (base as Record<string, unknown>)[chave] = PADRAO[chave as keyof typeof PADRAO];
    const cena = { ...base, ...parcial } as Cena;
    cenas.push(cena);
    anterior = cena;
  }
  return cenas;
}

export const CENAS = montarCenas();

/** Rolagem de uma cena para a próxima, em svh. */
export const VIAGEM = 85;

/**
 * Onde cada cena começa na rolagem (em svh, a partir do topo da missão) e a
 * altura total da missão: as paradas, as viagens entre elas e uma tela no fim
 * para o palco sair de cena.
 */
export function medidas(cenas: Cena[] = CENAS) {
  const inicios: number[] = [];
  let y = 0;
  cenas.forEach((cena, i) => {
    inicios.push(y);
    y += cena.hold + (i < cenas.length - 1 ? VIAGEM : 0);
  });
  return { inicios, total: y + 100 };
}
