import { Filete } from "@/components/motion/filete";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { sintomas } from "@/content/diagnostico";

export function Diagnostico() {
  return (
    <Section id="diagnostico" tone="vazio" ceu={0.55} aria-labelledby="diagnostico-titulo">

      <Container className="relative">
        <h2 id="diagnostico-titulo" className="text-subdisplay max-w-[16ch]">
          Onde o digital costuma travar
        </h2>
        <p className="text-lead text-texto-suave mt-5 max-w-[58ch]">
          Antes de falar de solução, vale reconhecer o problema. Em quase toda
          conversa inicial, pelo menos um destes quatro aparece.
        </p>

        <ul className="mt-14 grid gap-x-12 gap-y-10 md:grid-cols-2">
          {sintomas.map((sintoma) => (
            <li key={sintoma.titulo}>
              {/* O filete de cada sintoma se desenha na rolagem, em degraus. */}
              <Filete className="bg-borda h-px w-full" />
              <h3 className="text-heading mt-5">{sintoma.titulo}</h3>
              <p className="text-texto-suave mt-2.5 max-w-[48ch] leading-relaxed">
                {sintoma.texto}
              </p>
            </li>
          ))}
        </ul>
      </Container>
    </Section>
  );
}
