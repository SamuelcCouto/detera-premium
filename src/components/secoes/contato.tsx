import { IconeEmail, IconeGithub, IconeLinkedin, IconeWhatsapp } from "@/components/ui/icones";
import { site } from "@/config/site";
import { FormularioContato } from "@/features/contato/form";
import { whatsappUrl } from "@/lib/utils/whatsapp";

const canais = [
  {
    href: whatsappUrl("Olá! Vim pelo site da DETERA e quero conversar sobre um projeto para a minha empresa."),
    rotulo: site.contact.phone,
    descricao: "WhatsApp, costuma ser o caminho mais rápido",
    Icone: IconeWhatsapp,
  },
  {
    href: `mailto:${site.contact.email}`,
    rotulo: site.contact.email,
    descricao: "E-mail, para escopo mais detalhado",
    Icone: IconeEmail,
  },
  { href: site.contact.linkedin, rotulo: "/in/samuel-couto", descricao: "LinkedIn", Icone: IconeLinkedin },
  { href: site.contact.github, rotulo: "/SamuelcCouto", descricao: "GitHub", Icone: IconeGithub },
];

export function Contato() {
  return (
    <section id="contato" className="secao" aria-labelledby="contato-titulo">
      <div className="secao__miolo secao__miolo--dupla">
        <div>
          <h2 id="contato-titulo" className="titulo-cena">
            E agora?
          </h2>
          <p className="promessa">
            Conte o que você está tentando construir. A gente descobre junto o que precisa
            acontecer para tirar isso do lugar.
          </p>
          <ul className="canais">
            {canais.map(({ href, rotulo, descricao, Icone }) => (
              <li key={rotulo}>
                <a
                  href={href}
                  target={href.startsWith("http") ? "_blank" : undefined}
                  rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
                >
                  <Icone className="canais__icone" />
                  <span>
                    <span className="canais__rotulo">{rotulo}</span>
                    <span className="canais__descricao">{descricao}</span>
                  </span>
                </a>
              </li>
            ))}
          </ul>
          <p className="nota">{site.local.note}</p>
        </div>

        <div className="painel">
          <h3>Ou mande os detalhes por aqui</h3>
          <p className="nota">
            O formulário monta a mensagem e abre o WhatsApp com tudo preenchido. Nada é armazenado
            neste site.
          </p>
          <FormularioContato />
        </div>
      </div>
    </section>
  );
}
