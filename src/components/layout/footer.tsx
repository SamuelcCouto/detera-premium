import { Wordmark } from "@/components/brand/wordmark";
import { Container } from "@/components/ui/container";
import {
  IconeEmail,
  IconeGithub,
  IconeLinkedin,
  IconeWhatsapp,
} from "@/components/ui/icones";
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

export function Footer() {
  return (
    <footer className="bg-vazio border-borda relative border-t">
      {/* Último trecho da trilha: some por fade em vez de bater num terminal. */}
      <span aria-hidden="true" className="trilha trilha--fim" />

      <Container className="py-16 md:py-20">
        <div className="grid gap-12 md:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <a href="#topo" className="text-texto inline-block">
              <Wordmark />
            </a>
            <p className="font-display text-texto mt-4 text-[1.05rem] font-bold">
              {site.slogan}
            </p>
            <p className="text-texto-suave mt-3 max-w-[34ch] text-[0.92rem] leading-relaxed">
              {site.tagline} para negócios que querem ter cara própria.
            </p>
            <p className="text-texto-fraco mt-4 text-[0.88rem]">{site.local.note}</p>
          </div>

          <nav aria-label="Seções do site">
            <h2 className="text-texto font-display text-[1rem] font-bold">Site</h2>
            <ul className="mt-4 flex flex-col gap-2.5 text-[0.92rem]">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="text-texto-suave hover:text-texto transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <h2 className="text-texto font-display text-[1rem] font-bold">Contato</h2>
            <ul className="mt-4 flex flex-col gap-2.5 text-[0.92rem]">
              <li>
                <a
                  href={whatsappUrl(
                    "Olá! Vim pelo site da DETERA e quero conversar sobre um projeto.",
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-texto-suave hover:text-texto transition-colors"
                >
                  {site.contact.phone}
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${site.contact.email}`}
                  className="text-texto-suave hover:text-texto break-all transition-colors"
                >
                  {site.contact.email}
                </a>
              </li>
            </ul>

            <ul className="mt-6 flex gap-2.5">
              {redes.map(({ href, rotulo, Icone }) => (
                <li key={rotulo}>
                  <a
                    href={href}
                    target={href.startsWith("http") ? "_blank" : undefined}
                    rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
                    aria-label={rotulo}
                    className="border-borda text-texto-suave hover:border-determinacao hover:text-determinacao flex h-10 w-10 items-center justify-center rounded-[2px] border transition-colors"
                  >
                    <Icone className="h-[18px] w-[18px]" />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-borda mt-14 flex flex-col gap-4 border-t pt-6 text-[0.85rem] md:flex-row md:items-center md:justify-between">
          <p className="text-texto-fraco">
            © {new Date().getFullYear()} {site.legalName} · Fundada por{" "}
            <a
              href={site.founderPortfolio}
              target="_blank"
              rel="noopener noreferrer"
              className="text-texto-suave hover:text-texto underline underline-offset-4 transition-colors"
            >
              {site.founder}
            </a>
          </p>

          <p className="estado">
            <span aria-hidden="true" className="bg-determinacao h-[6px] w-[6px] rotate-45" />
            {site.local.city} · {site.local.state}
          </p>
        </div>
      </Container>
    </footer>
  );
}
