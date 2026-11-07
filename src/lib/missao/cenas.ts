/**
 * O roteiro da missão: uma lista de cenas em que cada linha diz só o que
 * muda em relação à anterior. `montarCenas` acumula e devolve cada cena
 * completa.
 *
 * Uma função só (`interpolar`, em `estado.ts`) escreve o estado da cena a
 * partir da posição na rolagem. Na v2, vários trechos de rolagem escreviam a
 * mesma propriedade, e o último a ser criado decidia o estado ao carregar; com
 * um roteiro só, nenhuma propriedade tem dois donos.
 *
 * O roteiro é curto de propósito. A primeira versão tinha 22 cenas e quase
 * ninguém veria o fim: agora a apresentação leva direto aos projetos, e o que
 * é para ler com calma fica em dossiês.
 */

/** Para onde a câmera olha: o sistema, o núcleo ou um planeta (0 a 4). */
export type Foco = "sistema" | "nucleo" | 0 | 1 | 2 | 3 | 4;

/** Como o cartão chega e sai da cena. */
export type Entrada = "lateral" | "queda";

export type Lado = "esq" | "dir" | "centro";

export type Cena = {
  /** Âncora e chave do conteúdo. */
  id: string;
  /** Quanto a cena fica parada, em svh de rolagem. */
  hold: number;
  /** Rolagem até a próxima cena, em svh. */
  viagem: number;

  foco: Foco;
  /** Distância da câmera ao foco, em unidades do mundo. */
  dist: number;
  /** Ângulos da câmera em graus. Num planeta, `az = 0` é a câmera entre ele e o núcleo (face iluminada). */
  az: number;
  el: number;
  /** Deslocamento do enquadramento (fração da tela): tira o foco do centro, do lado oposto ao cartão. */
  ox: number;
  oy: number;

  /** A Via Láctea: 1 é a galáxia inteira, 0 é já dentro do sistema solar. */
  galaxia: number;
  /** Camada de atmosfera sobre a cena 3D: 0 é espaço, 1 é dentro do céu. */
  atmos: number;
  /** Céu: 0 é a descida azul, 1 é o crepúsculo. */
  ceu: number;
  plasma: number;
  tremor: number;
  relevo: number;
  /** Nuvens rasgadas na viagem até esta cena. */
  nuvens: number;
  /** Altitude no altímetro, em km. `null` esconde o instrumento. */
  alt: number | null;
  /** Etiquetas dos planetas presas por linha de instrumento. */
  rotulos: number;
  /** Rastros na viagem até esta cena. */
  rastro: number;

  lado: Lado;
  entrada: Entrada;
  /** Cartão com fundo sólido: céu claro atrás, ou planeta que pode passar por trás do texto. */
  painel: boolean;
};

type Parcial = Partial<Cena> & Pick<Cena, "id">;

const PADRAO: Omit<Cena, "id"> = {
  hold: 30,
  viagem: 70,
  foco: "sistema",
  dist: 100,
  az: 28,
  el: 26,
  ox: 0,
  oy: 0,
  galaxia: 0,
  atmos: 0,
  ceu: 0,
  plasma: 0,
  tremor: 0,
  relevo: 0,
  nuvens: 0,
  alt: null,
  rotulos: 0,
  rastro: 0,
  lado: "esq",
  entrada: "lateral",
  painel: false,
};

/** Valores que valem só para a cena em que aparecem e não passam adiante. */
const NAO_HERDA: (keyof Cena)[] = ["rastro", "rotulos", "nuvens", "viagem", "hold", "painel"];

const ROTEIRO: Parcial[] = [
  // A apresentação na Via Láctea. A viagem daqui é a primeira transição: o
  // zoom atravessa a galáxia até o sistema solar, e por isso é a mais longa.
  { id: "topo", hold: 12, viagem: 190, galaxia: 1, dist: 1300, az: 28, el: 30, ox: 0.2, entrada: "queda" },

  // O sistema solar: cada planeta é um projeto.
  { id: "projetos", hold: 22, galaxia: 0, dist: 98, az: 28, el: 27, ox: 0.2, rotulos: 1 },
  { id: "projeto-sencis", foco: 0, dist: 6.4, az: 38, el: 10, ox: -0.25, lado: "dir" },
  { id: "projeto-fidele", foco: 1, dist: 14, az: -32, el: 20, ox: 0.25, lado: "esq" },
  { id: "projeto-yasmin", foco: 2, dist: 7.8, az: 62, el: -6, ox: -0.22, lado: "dir" },
  { id: "projeto-keepnew", foco: 3, dist: 6.6, az: 24, el: 12, ox: 0.2, lado: "esq" },

  // O que a DETERA faz, junto do núcleo que dá nome à empresa.
  { id: "solucoes", foco: "nucleo", dist: 36, az: 140, el: 34, ox: 0.26, lado: "esq", painel: true },

  // O planeta azul ainda não tem projeto: é o de quem está lendo.
  { id: "seu-projeto", foco: 4, dist: 8.6, az: 10, el: 12, ox: -0.25, lado: "dir" },

  // A reentrada, o gesto da marca, e o pouso direto no contato.
  { id: "reentrada", hold: 40, viagem: 90, dist: 3.25, az: 0, el: 64, ox: 0, atmos: 1, plasma: 1, tremor: 0.9, alt: 62, rastro: 0.7, lado: "centro", entrada: "queda" },
  { id: "sinal", hold: 20, atmos: 1, ceu: 1, relevo: 1, plasma: 0, tremor: 0, nuvens: 1, alt: null, painel: true },
];

export function montarCenas(): Cena[] {
  const cenas: Cena[] = [];
  let anterior: Omit<Cena, "id"> = PADRAO;
  for (const parcial of ROTEIRO) {
    const base = { ...anterior };
    for (const chave of NAO_HERDA) {
      (base as Record<string, unknown>)[chave] = PADRAO[chave as keyof typeof PADRAO];
    }
    const cena = { ...base, ...parcial } as Cena;
    cenas.push(cena);
    anterior = cena;
  }
  return cenas;
}

export const CENAS = montarCenas();

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
    y += cena.hold + (i < cenas.length - 1 ? cena.viagem : 0);
  });
  return { inicios, total: y + 100 };
}
