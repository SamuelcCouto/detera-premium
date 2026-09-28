import type { gsap } from "@/lib/motion";

/**
 * A fala: o texto sai letra a letra, como a caixa de diálogo de um jogo, e
 * segura um pouco a mais depois da pontuação — é essa pausa que faz a
 * sequência ser lida como alguém falando, e não como uma máquina de escrever
 * de metrônomo.
 *
 * Trabalha sobre um bloco de `TextoFala` (`[data-fala]`): em vez de um tween
 * por letra, um tween só anda por uma linha do tempo das letras e escreve no
 * bloco quantas já apareceram (`--fala`). O CSS faz o resto. Cada letra
 * aparece de uma vez: no mundo de pixel não existe meia letra.
 *
 * Funciona igual numa timeline por tempo (o slogan ao carregar) e numa
 * amarrada à rolagem (o manifesto): voltando a rolagem, a conta volta junto.
 *
 * Devolve o instante em que a última letra entrou.
 */
export function falar(
  tl: gsap.core.Timeline,
  bloco: Element,
  { inicio = 0, porLetra = 0.028, pausa = 6 }: { inicio?: number; porLetra?: number; pausa?: number } = {},
) {
  const alvo = bloco as HTMLElement;
  const letras = [...alvo.querySelectorAll("[data-fala-letra]")].map((el) => el.textContent ?? "");

  // O instante de cada letra. `pausa` é medida em letras: depois de vírgula
  // ou ponto, a próxima demora o tempo de algumas letras para vir.
  const instantes: number[] = [];
  let t = 0;
  letras.forEach((letra) => {
    instantes.push(t);
    t += /[.,;:!?]/.test(letra) ? porLetra * pausa : porLetra;
  });

  const relogio = { t: 0 };
  let mostradas = -1;
  const aplicar = () => {
    let n = 0;
    while (n < instantes.length && instantes[n] <= relogio.t) n++;
    if (n === mostradas) return;
    mostradas = n;
    alvo.style.setProperty("--fala", String(n));
  };

  alvo.style.setProperty("--fala", "0");
  tl.fromTo(
    relogio,
    { t: -0.0001 },
    { t, duration: t, ease: "none", onUpdate: aplicar, onReverseComplete: aplicar },
    inicio,
  );
  return inicio + t;
}

/**
 * O contrário da fala: some da última letra para a primeira, como apagando.
 * Escreve em `--resto` quantas letras sobram, sem mexer na conta da fala.
 */
export function apagar(
  tl: gsap.core.Timeline,
  bloco: Element,
  { inicio = 0, porLetra = 0.02 }: { inicio?: number; porLetra?: number } = {},
) {
  const alvo = bloco as HTMLElement;
  const total = alvo.querySelectorAll("[data-fala-letra]").length;
  const conta = { r: total };
  const aplicar = () => alvo.style.setProperty("--resto", String(Math.round(conta.r)));

  alvo.style.setProperty("--resto", String(total));
  const duracao = total * porLetra;
  tl.fromTo(
    conta,
    { r: total },
    { r: 0, duration: duracao, ease: "none", onUpdate: aplicar, onReverseComplete: aplicar },
    inicio,
  );
  return inicio + duracao;
}
