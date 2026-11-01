import type { Metadata, Viewport } from "next";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";

import { SmoothScroll } from "@/components/motion/smooth-scroll";
import { isPublicDomain, site } from "@/config/site";
import "./globals.css";

/**
 * Tipografia em dois papéis: Oxanium, a fonte da marca, nos títulos, nos
 * instrumentos e nos botões; Spectral, a voz do narrador da missão, no texto
 * corrido e nas frases do manifesto. As duas por `@font-face` em
 * `globals.css`, servidas do próprio `public/fonts`, e não por `next/font`:
 * o carregador do Turbopack não resolve os arquivos da Oxanium neste
 * ambiente, e a CSP só aceita fonte do próprio domínio.
 */
const titulo = `${site.name} — ${site.tagline}`;

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: titulo,
    template: `%s — ${site.name}`,
  },
  description: site.description,
  applicationName: site.name,
  authors: [{ name: site.founder, url: site.founderPortfolio }],
  creator: site.legalName,
  publisher: site.legalName,
  keywords: [
    "DETERA",
    "criação de sites Goiânia",
    "desenvolvimento de sites para empresas",
    "loja virtual sob medida",
    "landing page para campanha",
    "SEO local Goiânia",
    "sistema web sob medida",
    "automação de processos",
    "integração de sistemas",
    "infraestrutura e performance web",
  ],
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: site.url,
    siteName: site.name,
    title: titulo,
    description: site.description,
  },
  twitter: {
    card: "summary_large_image",
    title: titulo,
    description: site.description,
  },
  // Só libera a busca quando o domínio final estiver configurado: evita a URL
  // de preview ranquear e virar conteúdo duplicado do domínio real.
  robots: isPublicDomain
    ? { index: true, follow: true }
    : { index: false, follow: false },
  alternates: { canonical: "/" },
  category: "technology",
};

export const viewport: Viewport = {
  themeColor: "#050913",
  colorScheme: "dark",
};

/**
 * Recado para quem abre o console. Vai como script inline em vez de client
 * component: não custa hidratação nenhuma e roda uma vez só.
 *
 * O slogan vem de `site.slogan`, não digitado aqui de novo — assim o recado
 * nunca fica dizendo uma frase que o resto do site já trocou.
 */
const recadoConsole = ((): string => {
  const texto =
    `%c${site.name}%c  ${site.slogan}%c\n\n` +
    "Se você chegou até aqui, provavelmente também constrói coisas.\n" +
    `Quando quiser construir junto: ${site.contact.email}`;

  const argumentos = [
    texto,
    "background:#ff3b3b;color:#050913;font-weight:700;padding:2px 8px;letter-spacing:.18em",
    "color:#9ba1ac;padding-left:8px",
    "color:#6b717c",
  ];

  /**
   * Os valores entram via `JSON.stringify`, não por interpolação direta na
   * string do script.
   *
   * Interpolando, bastaria um dia alguém pôr uma aspa em `site.slogan` para
   * quebrar o literal e fechar o script — e o que viesse depois seria
   * executado. `JSON.stringify` produz o literal já escapado, e o `<` vira
   * `<` para o texto nunca conseguir fechar a tag `</script>`.
   */
  return `console.log(${argumentos.map((a) => JSON.stringify(a)).join(",")});`.replace(
    /</g,
    "\\u003c",
  );
})();

/**
 * Decide o modo da página antes da primeira pintura: com movimento reduzido,
 * tela baixa (até 520 px) ou sem WebGL, a missão vira leitura empilhada
 * (`linear`). Decidido aqui, e não depois da hidratação, para a página não
 * abrir num modo e trocar para o outro na frente da pessoa.
 */
const decidirModo = `(function(){var h=document.documentElement;h.classList.add("js");var g=false;try{var c=document.createElement("canvas");g=!!(c.getContext("webgl2")||c.getContext("webgl"))}catch(e){}if(!g)h.classList.add("sem-webgl");if(!g||matchMedia("(prefers-reduced-motion: reduce)").matches||innerHeight<=520)h.classList.add("linear")})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: decidirModo }} />
        {/* As duas fontes que a primeira cena usa: sem aviso, o navegador só as
            descobre depois de ler o CSS. */}
        <link
          rel="preload"
          href="/fonts/oxanium-latin.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          href="/fonts/spectral-latin-300-italic.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
      </head>
      <body>
        {children}
        <SmoothScroll />
        <script dangerouslySetInnerHTML={{ __html: recadoConsole }} />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
