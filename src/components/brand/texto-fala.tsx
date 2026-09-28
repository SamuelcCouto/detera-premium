import type { CSSProperties } from "react";

/**
 * Texto quebrado em letras para ser "falado": sair letra a letra, como a
 * caixa de diálogo de um jogo (ver `lib/fala.ts`).
 *
 * Cada letra é um `<span>` com o próprio índice em `--i`, e o bloco inteiro
 * (`data-fala`) diz pelo CSS quantas letras aparecem: `--fala` conta da
 * primeira para a frente (a fala) e `--resto` conta quantas sobram (o
 * apagar, que tira da última para trás). Uma letra aparece quando o índice
 * dela é menor que as duas contas.
 *
 * Assim a fala inteira é uma variável mudando num elemento só. Antes era um
 * tween por letra e dois `<span>` por letra: mais de mil tweens e 1.300
 * elementos só no manifesto, e o celular levava segundos para montar a
 * coreografia.
 *
 * - **Leitura por voz.** As letras vão num bloco `aria-hidden` e o texto
 *   inteiro num irmão `sr-only`; sem isso o leitor de tela soletraria.
 * - **Quebra de linha.** As letras são `inline`, lado a lado sem espaço
 *   entre elas: a palavra continua inteira e só quebra nos espaços.
 * - **Servidor.** Nada aqui é estado nem efeito. Sem JavaScript as duas
 *   contas valem "tudo" (no CSS), e o texto aparece inteiro, parado.
 */
export function TextoFala({ texto, className }: { texto: string; className?: string }) {
  let indice = 0;

  return (
    <>
      <span className="sr-only">{texto}</span>
      <span aria-hidden="true" data-fala className={className}>
        {Array.from(texto).map((letra, posicao) =>
          letra === " " ? (
            " "
          ) : (
            <span
              key={posicao}
              data-fala-letra
              style={{ "--i": indice++ } as CSSProperties}
            >
              {letra}
            </span>
          ),
        )}
      </span>
    </>
  );
}
