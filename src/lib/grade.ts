import { ordemSorteada } from "@/lib/utils/aleatorio";

/**
 * A grade de blocos: o vocabulário de pixel da DETERA para abrir e fechar
 * coisas. A travessia do núcleo no hero, a montagem dos prints dos cases e o
 * menu do celular usam a mesma peça — blocos quadrados que acendem ou
 * apagam um de cada vez, numa ordem sorteada com semente.
 *
 * Os blocos são criados aqui, direto no DOM, dentro de um contêiner vazio que
 * o React renderiza sem filhos. Não são estado do React porque dependem do
 * tamanho real do contêiner (quadrados de verdade, em qualquer tela) e porque
 * a coreografia precisa deles já no mesmo quadro em que é montada: um bloco
 * criado por estado só existiria no render seguinte, depois do `useGSAP`.
 *
 * Devolve os blocos já na ordem em que devem acender, e uma função que os
 * remove.
 */
export function criarGrade(
  conteiner: HTMLElement,
  { lado, semente, classe = "grade-bloco" }: { lado: number; semente: number; classe?: string },
) {
  const { width, height } = conteiner.getBoundingClientRect();
  const colunas = Math.max(1, Math.round(width / lado));
  const linhas = Math.max(1, Math.round(height / lado));

  conteiner.style.setProperty("--grade-colunas", String(colunas));
  conteiner.style.setProperty("--grade-linhas", String(linhas));

  const fragmento = document.createDocumentFragment();
  const blocos: HTMLElement[] = [];
  for (let i = 0; i < colunas * linhas; i++) {
    const bloco = document.createElement("span");
    bloco.className = classe;
    fragmento.appendChild(bloco);
    blocos.push(bloco);
  }
  conteiner.appendChild(fragmento);

  const emOrdem = ordemSorteada(blocos.length, semente).map((i) => blocos[i]);

  return {
    blocos: emOrdem,
    remover: () => blocos.forEach((bloco) => bloco.remove()),
  };
}
