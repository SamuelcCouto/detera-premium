import { site } from "@/config/site";
import { perguntas } from "@/content/perguntas";
import { pilares } from "@/content/pilares";

/**
 * Serializa para dentro de um `<script>` sem deixar o conteúdo fechar a tag.
 *
 * `JSON.stringify` escapa aspas, mas não escapa `<`. Um texto contendo
 * `</script>` encerraria o bloco no meio e o resto viraria HTML executável —
 * o caminho clássico de XSS via dados estruturados. Hoje tudo aqui vem de
 * arquivos estáticos do próprio repositório, então não há entrada hostil;
 * escapar mesmo assim é o que impede isso de virar falha no dia em que o
 * conteúdo passar a vir de um CMS ou de qualquer fonte externa.
 */
function serializar(dados: object): string {
  return JSON.stringify(dados).replace(/</g, "\\u003c");
}

function Bloco({ dados }: { dados: object }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: serializar(dados) }}
    />
  );
}

/**
 * Dados estruturados da DETERA. `slogan` entra no schema porque é parte da
 * identidade e não da decoração — é assim que a frase chega em painel de
 * busca e em prévia de link.
 */
export function EmpresaJsonLd() {
  const dados = {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    "@id": `${site.url}#empresa`,
    name: site.name,
    legalName: site.legalName,
    slogan: site.slogan,
    description: site.description,
    url: site.url,
    email: `mailto:${site.contact.email}`,
    telephone: site.contact.phoneE164,
    priceRange: "$$",
    founder: {
      "@type": "Person",
      name: site.founder,
      jobTitle: site.founderRole,
      url: site.founderPortfolio,
      sameAs: [site.contact.linkedin, site.contact.github],
    },
    address: {
      "@type": "PostalAddress",
      addressLocality: site.local.city,
      addressRegion: site.local.state,
      addressCountry: site.local.country,
    },
    areaServed: { "@type": "Country", name: site.local.areaServed },
    sameAs: [site.contact.linkedin, site.contact.github],
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Soluções digitais",
      itemListElement: pilares.map((pilar) => ({
        "@type": "OfferCatalog",
        name: pilar.nome,
        itemListElement: pilar.entregas.map((entrega) => ({
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: entrega.nome,
            description: entrega.texto,
          },
        })),
      })),
    },
  };

  return <Bloco dados={dados} />;
}

/** As mesmas respostas da seção de perguntas, legíveis para a busca. */
export function PerguntasJsonLd() {
  const dados = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "@id": `${site.url}#perguntas`,
    mainEntity: perguntas.map((item) => ({
      "@type": "Question",
      name: item.pergunta,
      acceptedAnswer: { "@type": "Answer", text: item.resposta },
    })),
  };

  return <Bloco dados={dados} />;
}
