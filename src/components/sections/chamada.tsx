import { TextoFala } from "@/components/brand/texto-fala";
import { Dialogo } from "@/components/motion/dialogo";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { site } from "@/config/site";
import { whatsappUrl } from "@/lib/utils/whatsapp";

/**
 * Faixa de decisão entre a metade comercial do site e a institucional. Quem
 * já se convenceu não precisa ler o resto para agir.
 *
 * É uma caixa de diálogo de jogo: moldura grossa e reta, a pergunta falada
 * letra a letra (`Dialogo`) e as duas saídas como escolhas de menu, com o
 * cursor-coração já na primeira. Passar o ponteiro ou o Tab por outra move o
 * coração para ela.
 */
export function Chamada() {
  return (
    <Section tone="vazio" space="compact" ceu={0.5} aria-labelledby="chamada-titulo">
      <Container>
        <Dialogo className="caixa-dialogo p-8 md:p-12">
          <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 id="chamada-titulo" data-dialogo-fala className="text-title max-w-[22ch]">
                <TextoFala texto="Reconheceu o seu negócio em alguma parte disso?" />
              </h2>
              <p
                data-dialogo-resto
                className="text-texto-suave mt-3 max-w-[52ch] leading-relaxed"
              >
                Se algum dos problemas lá em cima descreveu a sua operação, o
                próximo passo é curto: uma conversa para entender o caso e dizer o
                que valeria a pena construir, em que ordem e por quê.
              </p>
            </div>

            <ul
              data-dialogo-resto
              className="escolhas flex shrink-0 flex-col gap-4 pl-7 sm:flex-row md:flex-col lg:flex-row"
            >
              <li>
                <ButtonLink
                  href={whatsappUrl(
                    "Olá! Vim pelo site da DETERA e quero conversar sobre um projeto para a minha empresa.",
                  )}
                  className="escolha"
                  data-selecionada
                >
                  Vamos construir
                </ButtonLink>
              </li>
              <li>
                <ButtonLink
                  href={`mailto:${site.contact.email}`}
                  variant="contorno"
                  className="escolha"
                >
                  Prefiro por e-mail
                </ButtonLink>
              </li>
            </ul>
          </div>
        </Dialogo>
      </Container>
    </Section>
  );
}
