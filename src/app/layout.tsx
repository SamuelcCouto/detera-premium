import type { Metadata, Viewport } from "next";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";

import { SmoothScroll } from "@/components/motion/smooth-scroll";
import { isPublicDomain, site } from "@/config/site";
import "./globals.css";

/**
 * Tipografia: uma família só, Oxanium, do leve ao pesado.
 *
 * Puxa a mesma personalidade do nome desenhado — os cantos chanfrados a
 * 45°, a proporção larga — e ainda assim se lê em parágrafo. Pesada nos
 * títulos, leve e espaçada no slogan e nos rótulos de estado, regular no
 * texto corrido. O próprio "DETERA" não usa fonte nenhuma: é o desenho
 * de `Letreiro`.
 *
 * Carregada por `@font-face` em `globals.css`, servida do próprio
 * `public/fonts`, e não por `next/font`: o carregador do Turbopack não
 * resolve os arquivos da Oxanium neste ambiente. O efeito é o mesmo —
 * woff2 do próprio domínio, sem CDN, sem custo de terceiro.
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
  themeColor: "#07080b",
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
    "background:#ff3b3b;color:#07080b;font-weight:700;padding:2px 8px;letter-spacing:.18em",
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

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="antialiased">
        {children}
        <SmoothScroll />
        <script dangerouslySetInnerHTML={{ __html: recadoConsole }} />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
