import { Fragment } from "react";

/**
 * Texto que entra letra por letra, cada uma caindo como um meteoro.
 *
 * Três cuidados que fazem a diferença entre isto e um efeito de template:
 *
 * 1. **Leitura por voz.** As letras vão dentro de um bloco `aria-hidden` e o
 *    texto inteiro vai num irmão `sr-only`. Sem isso, o leitor de tela
 *    soletraria "D-E-T-E-R-A" em vez de dizer a palavra.
 * 2. **Quebra de linha.** A divisão é por palavra primeiro, letra depois. Se
 *    cada letra fosse um `inline-block` solto, a frase quebraria no meio das
 *    palavras assim que a tela apertasse.
 * 3. **Custo zero no cliente.** Nada aqui é estado nem efeito: é HTML com
 *    `animation-delay` calculado na renderização. Roda no servidor.
 */
export function TextoMeteoro({
  texto,
  className,
  atraso = 0,
  passo = 0.045,
  animar = true,
  mudo = false,
}: {
  texto: string;
  className?: string;
  /** Segundos antes da primeira letra cair. */
  atraso?: number;
  /** Intervalo entre uma letra e a seguinte. */
  passo?: number;
  /**
   * `false` monta a mesma estrutura sem movimento nenhum. É o que a cópia
   * sobreposta da luz usa: ela precisa ocupar exatamente as mesmas caixas do
   * texto de baixo, e qualquer diferença de layout desalinharia as duas.
   */
  animar?: boolean;
  /** Omite a cópia lida em voz alta — para quem já tem uma na página. */
  mudo?: boolean;
}) {
  const palavras = texto.split(" ");
  let contador = 0;

  return (
    <>
      {mudo ? null : <span className="sr-only">{texto}</span>}

      <span aria-hidden="true" className={className}>
        {palavras.map((palavra, indicePalavra) => (
          <Fragment key={`${palavra}-${indicePalavra}`}>
            {indicePalavra > 0 ? " " : null}
            <span className="inline-block whitespace-nowrap">
              {Array.from(palavra).map((letra, indiceLetra) => {
                const ordem = contador++;
                if (!animar) {
                  return (
                    <span key={indiceLetra} className="inline-block">
                      {letra}
                    </span>
                  );
                }
                // Duas camadas, como no `Letreiro`: a queda anima a de
                // dentro e a rolagem do hero, a de fora.
                return (
                  <span key={indiceLetra} data-letra-desfaz className="inline-block">
                    <span
                      className="meteoro"
                      style={{ animationDelay: `${(atraso + ordem * passo).toFixed(3)}s` }}
                    >
                      {letra}
                    </span>
                  </span>
                );
              })}
            </span>
          </Fragment>
        ))}
      </span>
    </>
  );
}
