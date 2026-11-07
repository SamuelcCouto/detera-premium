import { Dossie } from "@/components/missao/dossie";
import { IconeEmail, IconeGithub, IconeLinkedin, IconeWhatsapp } from "@/components/ui/icones";
import { site } from "@/config/site";
import { perguntas } from "@/content/perguntas";
import { FormularioContato } from "@/features/contato/form";
import { whatsappUrl } from "@/lib/utils/whatsapp";

const canais = [
  {
    href: whatsappUrl("Olá! Vim pelo site da DETERA e quero conversar sobre um projeto para a minha empresa."),
    rotulo: site.contact.phone,
    descricao: "WhatsApp, o caminho mais rápido",
    Icone: IconeWhatsapp,
  },
  {
    href: `mailto:${site.contact.email}`,
    rotulo: site.contact.email,
    descricao: "E-mail",
    Icone: IconeEmail,
  },
  { href: site.contact.linkedin, rotulo: "/in/samuel-couto", descricao: "LinkedIn", Icone: IconeLinkedin },
  { href: site.contact.github, rotulo: "/SamuelcCouto", descricao: "GitHub", Icone: IconeGithub },
];

/**
 * Depois da missão, a página volta a rolar como página: o contato é para
 * preencher com calma e não ganha cena. A cena 3D fica parada atrás, no pouso.
 * As perguntas ficam num dossiê: seguem na página (o Google lê o FAQ) sem
 * alongar o caminho até o formulário.
 */
export function Contato() {
  return (
    <section id="contato" className="secao" aria-labelledby="contato-titulo">
      <div className="secao__miolo secao__miolo--dupla">
        <div>
          <h2 id="contato-titulo" className="titulo-cena">
            Contato
          </h2>
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
          <div className="acoes">
            <Dossie rotulo="Perguntas frequentes" titulo="Perguntas frequentes">
              <dl className="dossie__lista">
                {perguntas.map((item) => (
                  <div key={item.pergunta}>
                    <dt>{item.pergunta}</dt>
                    <dd>{item.resposta}</dd>
                  </div>
                ))}
              </dl>
            </Dossie>
          </div>
        </div>

        <div className="painel">
          <h3>Mande os detalhes</h3>
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
