import { env } from "@/lib/utils/env";

/**
 * `NEXT_PUBLIC_SITE_URL` só é definida quando o domínio final está no ar.
 * Enquanto o site vive numa URL de preview da Vercel ele não deve ser
 * indexado: evita o domínio provisório ranquear e virar conteúdo duplicado.
 */
export const isPublicDomain = Boolean(env(process.env.NEXT_PUBLIC_SITE_URL));

function resolveSiteUrl(): string {
  const configured = env(process.env.NEXT_PUBLIC_SITE_URL);
  if (configured) return configured;

  // Preenchida pela Vercel no build; cobre o preview sem domínio próprio.
  const vercel = env(process.env.VERCEL_PROJECT_PRODUCTION_URL);
  if (vercel) return `https://${vercel}`;

  return "http://localhost:3000";
}

/**
 * Fonte única de verdade da marca e dos contatos.
 *
 * `name` usa "A" latino (U+0041) do início ao fim. O nome chegou escrito com
 * um "А" cirílico (U+0410) no lugar do último caractere — idêntico aos olhos e
 * outra palavra para busca, leitor de tela e copiar/colar. Se algum dia for
 * preciso reescrever a marca, é aqui, e só com caracteres latinos.
 */
export const site = {
  name: "DETERA",
  legalName: "DETERA",
  slogan: "Transformando ideias em personalidade",
  founder: "Samuel Couto",
  founderRole: "Fundador e responsável técnico",
  tagline: "Tecnologia, estratégia e crescimento digital",
  description:
    "A DETERA transforma ideias em negócios com personalidade digital própria: sites, sistemas, automações e a infraestrutura que sustentam tudo isso no ar.",
  url: resolveSiteUrl(),
  locale: "pt-BR",

  contact: {
    phone: "(62) 9 8475-0989",
    phoneE164: "+5562984750989",
    whatsapp: env(process.env.NEXT_PUBLIC_WHATSAPP_NUMBER) ?? "5562984750989",
    email: "deteraoficial@gmail.com",
    linkedin: "https://www.linkedin.com/in/samuel-couto-557547287/",
    github: "https://github.com/SamuelcCouto",
  },

  /**
   * Base em Goiânia, atendimento remoto. Serve para busca local: sem cidade
   * declarada, o Google não tem como associar a empresa a nenhuma região.
   */
  local: {
    city: "Goiânia",
    state: "GO",
    country: "BR",
    areaServed: "Brasil",
    note: "Base em Goiânia (GO). Atendimento remoto para todo o Brasil.",
  },

  /** Portfólio pessoal de infraestrutura — a origem técnica da operação. */
  founderPortfolio: "https://portfolio-five-psi-zv0twz8v1l.vercel.app/",
} as const;

export type Site = typeof site;
