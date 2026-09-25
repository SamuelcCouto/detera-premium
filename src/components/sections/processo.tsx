import { LinhaViva } from "@/components/motion/linha-viva";
import { Estrelas } from "@/components/sections/estrelas";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { etapas } from "@/content/processo";

export function Processo() {
  return (
    <Section
      id="processo"
      alias="como-funciona"
      tone="camada"
      aria-labelledby="processo-titulo"
    >
      {/* Céu quase apagado: esta seção passou a ter um desenho próprio — o
          ciclo se fechando — e duas coisas em movimento no mesmo lugar
          brigam. Quem carrega a seção agora é a volta, não o fundo. */}
      <Estrelas
        quantidade={20}
        semente={4242}
        cadentes={1}
        cometas={0}
        className="opacity-40"
      />

      <Container className="relative">
        <div className="grid gap-10 md:grid-cols-[minmax(0,22rem)_1fr] md:gap-16">
          <div className="md:sticky md:top-28 md:self-start">
            {/* Volume de utilidade: a seção explica mecânica, não defende
                uma ideia. A força dela está no desenho do ciclo. */}
            <h2 id="processo-titulo" className="text-title max-w-[16ch]">
              Como trabalhamos
            </h2>
            <p className="text-lead text-texto-suave mt-5 max-w-[38ch]">
              Do primeiro contato até bem depois da entrega. Sem etapa surpresa e
              sem começar nada antes de estar escrito.
            </p>
          </div>

          {/* A linha que liga as etapas fica no container e não em cada item:
              assim ela é contínua e não se quebra no espaço entre uma e outra.

              O recuo à esquerda no desktop abre a calha onde o caminho de
              volta é desenhado — ele precisa passar por fora da linha das
              etapas, senão os dois viram um traço grosso só. */}
          <LinhaViva className="relative md:pl-10">
            {/*
              O ciclo fechando: do último nó, por fora, de volta ao primeiro.
              É o argumento da seção ("cada ciclo recomeça em descobrir")
              desenhado em vez de escrito — e se desenha de baixo para cima
              conforme a pessoa rola, no sentido da própria volta.

              Só no desktop: no celular não existe calha à esquerda para ele
              passar, e o texto logo abaixo já diz a mesma coisa.
            */}
            {/* As três medidas terminam no centro dos nós, não perto deles:
                `44px` de largura leva os braços até o eixo da linha das
                etapas, e os recuos vertical batem no centro do primeiro
                losango e no do nó vermelho. Os próprios losangos são
                opacos, então cobrem a ponta e a volta parece encostar. */}
            <span
              aria-hidden="true"
              className="ciclo-volta absolute top-[2.05rem] bottom-[2rem] left-0 hidden w-11 md:block"
            />

            <span
              aria-hidden="true"
              className="from-borda via-borda absolute top-2 bottom-0 left-[3px] w-px bg-gradient-to-b to-transparent md:left-[calc(2.5rem+3px)]"
            />

            {/* A mesma linha em vermelho, por cima, enchendo com a rolagem
                (`LinhaViva`). Apagada até o JavaScript assumir. */}
            <span
              data-linha-viva
              aria-hidden="true"
              className="from-determinacao via-determinacao/70 absolute top-2 bottom-0 left-[3px] w-px bg-gradient-to-b to-transparent opacity-0 md:left-[calc(2.5rem+3px)]"
            />

            <ol className="flex flex-col">
              {etapas.map((etapa) => (
                <li
                  key={etapa.numero}
                  data-surgir
                  className="relative grid gap-x-6 gap-y-1.5 py-6 pl-8 sm:grid-cols-[3rem_1fr] sm:pl-10"
                >
                  <span
                    aria-hidden="true"
                    className="bg-camada border-borda-viva absolute top-[1.85rem] left-0 h-[7px] w-[7px] rotate-45 border"
                  />
                  {/* O nó aceso, por cima do cinza, quando a linha vermelha
                      chega à etapa. */}
                  <span
                    data-no-vivo
                    aria-hidden="true"
                    className="bg-determinacao absolute top-[1.85rem] left-0 h-[7px] w-[7px] rotate-45 opacity-0 shadow-[0_0_8px_var(--color-determinacao)]"
                  />
                  {/* O número da etapa deixou de ser etiqueta micro e virou
                      o âncora visual da sequência: aqui a ordem é conteúdo,
                      não enfeite — esta é a única lista da página que tem
                      ordem de verdade. */}
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

            {/*
              O processo não fecha na quinta etapa: ele devolve para a primeira.
              O nó final é vermelho porque é o único ponto vivo da sequência —
              e é ele que explica por que "evoluir" não é uma etapa opcional.

              No desktop o caminho desenhado acima já mostra a volta; aqui o
              texto continua dizendo, para quem está no celular, para quem
              lê por voz e para quem imprime.
            */}
            <div className="relative pt-2 pl-8 sm:pl-10">
              <span
                aria-hidden="true"
                className="bg-determinacao absolute top-[1.1rem] left-0 h-[7px] w-[7px] rotate-45"
              />
              <p className="text-texto-suave text-[0.95rem]">
                <span className="font-display text-determinacao-viva mr-2 font-bold tabular-nums">
                  05 → 01
                </span>
                Cada ciclo de evolução recomeça em descobrir. É por isso que a
                conta de manutenção não é um custo solto no fim do projeto.
              </p>
            </div>
          </LinhaViva>
        </div>
      </Container>
    </Section>
  );
}
