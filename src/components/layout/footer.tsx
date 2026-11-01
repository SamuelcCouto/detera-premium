import { Letreiro } from "@/components/brand/wordmark";
import { IconeEmail, IconeGithub, IconeLinkedin, IconeWhatsapp } from "@/components/ui/icones";
import { navLinks } from "@/config/nav";
import { site } from "@/config/site";
import { whatsappUrl } from "@/lib/utils/whatsapp";

const redes = [
  {
    href: whatsappUrl("Olá! Vim pelo site da DETERA e quero conversar sobre um projeto."),
    rotulo: "WhatsApp",
    Icone: IconeWhatsapp,
  },
  { href: `mailto:${site.contact.email}`, rotulo: "E-mail", Icone: IconeEmail },
  { href: site.contact.linkedin, rotulo: "LinkedIn", Icone: IconeLinkedin },
  { href: site.contact.github, rotulo: "GitHub", Icone: IconeGithub },
];

/**
 * O fim da página, quieto: o nome grande, os destinos e os canais. O ano é
 * fixo no texto, e não `new Date()`: a página é pré-renderizada e uma data
 * calculada no servidor ficaria congelada no dia do build de qualquer jeito.
 */
export function Footer() {
  return (
    <footer className="rodape">
      <div className="rodape__miolo">
        <a href="#topo" className="rodape__nome" aria-label={`${site.name}, voltar ao início`}>
          <Letreiro className="w-full" />
        </a>

        <div className="rodape__grade">
          <p className="promessa">{site.slogan}</p>

          <nav aria-label="Seções do site">
            <ul>
              {navLinks.map((link) => (
                <li key={link.href}>
                  <a href={link.href}>{link.label}</a>
                </li>
              ))}
            </ul>
          </nav>

          <ul className="rodape__redes">
            {redes.map(({ href, rotulo, Icone }) => (
              <li key={rotulo}>
                <a
                  href={href}
                  target={href.startsWith("http") ? "_blank" : undefined}
                  rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
                  aria-label={rotulo}
                >
                  <Icone className="h-5 w-5" />
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div className="rodape__linha">
          <p>
            © 2026 {site.legalName}. Fundada por{" "}
            <a href={site.founderPortfolio} target="_blank" rel="noopener noreferrer">
              {site.founder}
            </a>
            .
          </p>
          <p>{site.local.note}</p>
        </div>
      </div>
    </footer>
  );
}
