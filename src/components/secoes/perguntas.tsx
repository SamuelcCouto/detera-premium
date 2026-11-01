import { perguntas } from "@/content/perguntas";

/**
 * Depois da missão, a página volta a rolar como página: perguntas e contato
 * são para ler e responder com calma, e não ganham cena. A cena 3D fica
 * parada atrás, no sistema visto de longe.
 */
export function Perguntas() {
  return (
    <section id="perguntas" className="secao" aria-labelledby="perguntas-titulo">
      <div className="secao__miolo secao__miolo--dupla">
        <div>
          <h2 id="perguntas-titulo" className="titulo-cena">
            Antes de abrir a conversa
          </h2>
          <p className="texto">As perguntas que chegam antes de quase todo projeto.</p>
        </div>
        <div className="perguntas">
          {perguntas.map((item) => (
            <details key={item.pergunta}>
              <summary>{item.pergunta}</summary>
              <p>{item.resposta}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
