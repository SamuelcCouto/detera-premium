import { Estrelas } from "@/components/sections/estrelas";
import { Container } from "@/components/ui/container";
import {
  IconeEmail,
  IconeGithub,
  IconeLinkedin,
  IconeWhatsapp,
} from "@/components/ui/icones";
import { Section } from "@/components/ui/section";
import { site } from "@/config/site";
import { FormularioContato } from "@/features/contato/form";
import { whatsappUrl } from "@/lib/utils/whatsapp";

const canais = [
  {
    href: whatsappUrl(
      "Olá! Vim pelo site da DETERA e quero conversar sobre um projeto para a minha empresa.",
    ),
    rotulo: site.contact.phone,
    descricao: "WhatsApp — costuma ser o caminho mais rápido",
    Icone: IconeWhatsapp,
  },
  {
    href: `mailto:${site.contact.email}`,
    rotulo: site.contact.email,
    descricao: "E-mail, para escopo mais detalhado",
    Icone: IconeEmail,
  },
  {
    href: site.contact.linkedin,
    rotulo: "/in/samuel-couto",
    descricao: "LinkedIn",
    Icone: IconeLinkedin,
  },
  {
    href: site.contact.github,
    rotulo: "/SamuelcCouto",
    descricao: "GitHub",
    Icone: IconeGithub,
  },
];

export function Contato() {
  return (
    <Section
      id="contato"
      tone="camada"
      space="generous"
      aria-labelledby="contato-titulo"
    >
      <Estrelas
        quantidade={72}
        semente={9137}
        cadentes={4}
        cometas={2}
        nebulosa="mista"
      />

      <Container className="relative">
        <div className="grid gap-14 md:grid-cols-2 md:gap-20">
          <div>
            <h2 id="contato-titulo" className="text-subdisplay">
              E agora?
            </h2>
            <p className="text-lead mt-6 max-w-[46ch]">
              Conte o que você está tentando construir. A gente descobre junto o
              que precisa acontecer para tirar isso do lugar.
            </p>
            <p className="text-texto-suave mt-4 max-w-[46ch] leading-relaxed">
              A primeira conversa é um diagnóstico, não uma apresentação de
              proposta — inclusive quando a resposta honesta for que não somos a
              melhor escolha para o seu caso.
            </p>

            <ul className="mt-10 flex flex-col">
              {canais.map(({ href, rotulo, descricao, Icone }) => (
                <li key={rotulo} className="border-borda border-b">
                  <a
                    href={href}
                    target={href.startsWith("http") ? "_blank" : undefined}
                    rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
                    className="group flex items-center gap-4 py-4"
                  >
                    <Icone className="text-determinacao h-5 w-5 shrink-0" />
                    <span className="min-w-0">
                      <span className="text-texto group-hover:text-determinacao-viva block font-semibold break-all transition-colors">
                        {rotulo}
                      </span>
                      <span className="text-texto-fraco block text-[0.85rem]">
                        {descricao}
                      </span>
                    </span>
                  </a>
                </li>
              ))}
            </ul>

            <p className="text-texto-fraco mt-6 text-[0.9rem]">{site.local.note}</p>
          </div>

          <div className="bloco p-6 sm:p-8">
            <h3 className="text-heading">Ou mande os detalhes por aqui</h3>
            <p className="text-texto-fraco mt-2 mb-7 max-w-[42ch] text-[0.9rem]">
              O formulário monta a mensagem e abre o WhatsApp com tudo preenchido.
              Nada é armazenado neste site.
            </p>
            <FormularioContato />
          </div>
        </div>
      </Container>
    </Section>
  );
}
