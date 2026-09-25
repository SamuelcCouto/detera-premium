import { Revelar } from "@/components/motion/revelar";
import { ButtonLink } from "@/components/ui/button";
import { BotaoNucleo } from "@/components/ui/botao-nucleo";
import { Estrelas } from "@/components/sections/estrelas";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { site } from "@/config/site";
import { whatsappUrl } from "@/lib/utils/whatsapp";

/**
 * Faixa de decisão entre a metade comercial do site e a institucional. Quem
 * já se convenceu não precisa ler o resto para agir.
 */
export function Chamada() {
  return (
    <Section tone="vazio" space="compact" aria-labelledby="chamada-titulo">
      <Container>
        {/* A faixa abre do centro para as bordas ao entrar — o mesmo gesto
            da tela das prévias dos cases. */}
        <Revelar className="border-borda relative overflow-hidden rounded-[4px] border p-8 md:p-12">
          {/* O céu também entra na faixa de decisão: sem ele, o único bloco
              emoldurado da página seria o único trecho sem fundo vivo. */}
          <Estrelas quantidade={38} semente={14411} cadentes={2} cometas={0} />

          {/* Brilho contido dentro do bloco, do lado da ação. */}
          <div
            aria-hidden="true"
            className="aura absolute h-[22rem] w-[22rem]"
            style={
              {
                top: "50%",
                right: "-4rem",
                marginTop: "-11rem",
                "--aura-cor": "var(--color-determinacao)",
                "--aura-opacidade": 0.12,
              } as React.CSSProperties
            }
          />

          <div className="relative flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 id="chamada-titulo" className="text-title max-w-[22ch]">
                Reconheceu o seu negócio em alguma parte disso?
              </h2>
              <p className="text-texto-suave mt-3 max-w-[52ch] leading-relaxed">
                Se algum dos problemas lá em cima descreveu a sua operação, o
                próximo passo é curto: uma conversa para entender o caso e dizer o
                que valeria a pena construir, em que ordem e por quê.
              </p>
            </div>

            <div className="flex shrink-0 flex-col gap-3 sm:flex-row md:flex-col lg:flex-row">
              <BotaoNucleo
                href={whatsappUrl(
                  "Olá! Vim pelo site da DETERA e quero conversar sobre um projeto para a minha empresa.",
                )}
              >
                Vamos construir
              </BotaoNucleo>
              <ButtonLink href={`mailto:${site.contact.email}`} variant="contorno">
                Prefiro por e-mail
              </ButtonLink>
            </div>
          </div>
        </Revelar>
      </Container>
    </Section>
  );
}
