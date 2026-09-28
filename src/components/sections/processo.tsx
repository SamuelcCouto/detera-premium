import { CaminhoSalvo } from "@/components/motion/caminho-salvo";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { etapas } from "@/content/processo";

export function Processo() {
  return (
    <Section
      id="processo"
      alias="como-funciona"
      tone="camada"
      ceu={0.2}
      aria-labelledby="processo-titulo"
    >
      <Container className="relative">
        <div className="grid gap-10 md:grid-cols-[minmax(0,22rem)_1fr] md:gap-16">
          <div className="md:sticky md:top-28 md:self-start">
            {/* Volume de utilidade: a seção explica mecânica, não defende
                uma ideia. A força dela está no caminho. */}
            <h2 id="processo-titulo" className="text-title max-w-[16ch]">
              Como trabalhamos
            </h2>
            <p className="text-lead text-texto-suave mt-5 max-w-[38ch]">
              Do primeiro contato até bem depois da entrega. Sem etapa surpresa e
              sem começar nada antes de estar escrito.
            </p>
          </div>

          {/* A linha que liga as etapas fica no container e não em cada item,
              para ser contínua. O recuo à esquerda no desktop abre a calha por
              onde o laço de volta passa. */}
          <CaminhoSalvo className="relative md:pl-10">
            {/* O laço: do último nó, por fora, de volta ao primeiro. É o
                argumento da seção ("cada ciclo recomeça em descobrir")
                desenhado em vez de escrito. Só no desktop: no celular não há
                calha para ele passar, e o texto do fim diz o mesmo. As três
                medidas terminam no centro dos nós; os losangos são opacos e
                cobrem as pontas. */}
            <span
              aria-hidden="true"
              className="ciclo-volta absolute top-[2.05rem] bottom-[2rem] left-0 hidden w-11 md:block"
            />

            <span
              aria-hidden="true"
              className="from-borda via-borda absolute top-2 bottom-0 left-[3px] w-px bg-gradient-to-b to-transparent md:left-[calc(2.5rem+3px)]"
            />

            {/* O coração que percorre o laço (`CaminhoSalvo`). */}
            <span
              data-volta-alma
              aria-hidden="true"
              className="alma pointer-events-none invisible absolute top-0 left-0 hidden h-[10px] w-[12px] -translate-x-1/2 -translate-y-1/2 md:block"
            />

            <ol className="flex flex-col">
              {etapas.map((etapa) => (
                <li
                  key={etapa.numero}
                  data-etapa
                  className="etapa relative grid gap-x-6 gap-y-1.5 py-6 pl-8 sm:grid-cols-[3rem_1fr] sm:pl-10"
                >
                  {/* O nó da etapa: cinza, aceso quando salvo, e trocado pelo
                      coração enquanto a etapa está em leitura. */}
                  <span aria-hidden="true" className="etapa__no" />
                  <span aria-hidden="true" className="etapa__alma alma" />
                  {/* O número é o âncora visual da sequência: aqui a ordem é
                      conteúdo, e esta é a única lista da página que tem ordem
                      de verdade. */}
                  <span
                    aria-hidden="true"
                    className="font-display text-texto-fraco pt-0.5 text-[1.7rem] leading-none font-bold tabular-nums sm:pr-2 sm:text-right"
                  >
                    {etapa.numero}
                  </span>
                  <div>
                    <h3 className="text-heading">{etapa.titulo}</h3>
                    <p className="text-texto-suave mt-2 max-w-[54ch] leading-relaxed">
                      {etapa.texto}
                    </p>
                  </div>
                </li>
              ))}
            </ol>

            {/* O processo não fecha na quinta etapa: devolve para a primeira.
                O nó final é vermelho porque é o ponto vivo da sequência. No
                desktop o laço mostra a volta; aqui o texto diz o mesmo para
                quem está no celular, lê por voz ou imprime. */}
            <div data-volta className="relative pt-2 pl-8 sm:pl-10">
              <span
                aria-hidden="true"
                className="bg-determinacao absolute top-[1.1rem] left-0 h-[7px] w-[7px] rotate-45"
              />
              <p className="text-texto-suave text-[0.95rem]">
                <span className="font-display text-determinacao-viva mr-2 font-bold tabular-nums">
                  05 → 01
                </span>
                Cada ciclo de evolução recomeça em descobrir. Por isso a
                manutenção entra na conta como parte do projeto.
              </p>
            </div>
          </CaminhoSalvo>
        </div>
      </Container>
    </Section>
  );
}
