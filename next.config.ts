import type { NextConfig } from "next";
import { PHASE_DEVELOPMENT_SERVER } from "next/constants";

/**
 * Content-Security-Policy.
 *
 * Uma decisão consciente aqui: `script-src` mantém `'unsafe-inline'`. O
 * Next emite scripts inline de hidratação com conteúdo diferente a cada
 * build, e a página tem dois scripts inline próprios (dados estruturados e
 * o recado do console). Trocar isso por nonce exige middleware, e middleware
 * tira a página da renderização estática — caro demais para um site que não
 * recebe entrada de usuário nem renderiza conteúdo de terceiros.
 *
 * O restante da política continua valendo e é onde está a proteção real:
 * `object-src`, `base-uri` e `form-action` fecham vetores clássicos de
 * sequestro de página; `frame-ancestors` impede clickjacking; `frame-src` e
 * `img-src` limitam terceiros ao que a página realmente usa — se uma
 * dependência comprometida tentar buscar outro domínio, o navegador barra.
 */
function montarCsp(desenvolvimento: boolean): string {
  return [
    "default-src 'self'",
    // Em desenvolvimento o React Refresh precisa de eval e os scripts de
    // analytics vêm de CDN. Em produção nada disso é liberado: a Vercel
    // serve os dois na própria origem, então `'self'` cobre.
    `script-src 'self' 'unsafe-inline'${
      desenvolvimento ? " 'unsafe-eval' https://va.vercel-scripts.com" : ""
    }`,
    "style-src 'self' 'unsafe-inline'",
    // A única imagem externa é a prévia do Yasmin G Studio.
    "img-src 'self' data: https://yasmin-g-studio.vercel.app",
    "font-src 'self'",
    // A única página de terceiro embutida é a prévia ao vivo do Keep New.
    "frame-src https://keepnew.vercel.app",
    `connect-src 'self'${desenvolvimento ? " ws: wss:" : ""}`,
    "form-action 'self'",
    "base-uri 'self'",
    "object-src 'none'",
    "frame-ancestors 'none'",
    "upgrade-insecure-requests",
  ].join("; ");
}

/**
 * A configuração é exportada como função da fase, e não como objeto.
 *
 * A primeira versão decidia a CSP por `process.env.NODE_ENV` — e no `next
 * start` a variável ainda não valia "production" quando este arquivo era
 * avaliado, então o build de produção saía servindo `'unsafe-eval'`. A fase
 * vem do próprio Next e não depende de ordem de inicialização.
 */
function construirConfig(desenvolvimento: boolean): NextConfig {
  return {
    reactStrictMode: true,
    images: {
      formats: ["image/avif", "image/webp"],
      remotePatterns: [],
    },

    /**
     * O site anterior era uma página única com estas âncoras. Quem tiver o link
     * antigo salvo cai na seção equivalente em vez de num 404.
     *
     * `#servicos` virou a seção de pilares e `#projetos` virou a de cases: os ids
     * foram preservados de propósito, para não quebrar link nenhum já publicado.
     *
     * Temporário (307) enquanto a estrutura ainda está em ajuste — um 308 fica
     * cacheado no navegador e trava a decisão.
     */
    async redirects() {
      return [
        { source: "/sobre", destination: "/#sobre", permanent: false },
        { source: "/servicos", destination: "/#solucoes", permanent: false },
        { source: "/solucoes", destination: "/#solucoes", permanent: false },
        { source: "/projetos", destination: "/#projetos", permanent: false },
        {
          source: "/como-funciona",
          destination: "/#processo",
          permanent: false,
        },
        { source: "/processo", destination: "/#processo", permanent: false },
        { source: "/contato", destination: "/#contato", permanent: false },
      ];
    },

    async headers() {
      return [
        {
          source: "/:path*",
          headers: [
            {
              key: "Content-Security-Policy",
              value: montarCsp(desenvolvimento),
            },
            { key: "X-Content-Type-Options", value: "nosniff" },
            {
              key: "Referrer-Policy",
              value: "strict-origin-when-cross-origin",
            },
            /**
             * `DENY`, não `SAMEORIGIN`: o site não embute a si mesmo em lugar
             * nenhum, então permitir a própria origem só amplia a superfície à
             * toa. Fica junto do `frame-ancestors` da CSP porque navegador
             * antigo ignora a CSP e ainda respeita este.
             */
            { key: "X-Frame-Options", value: "DENY" },
            {
              key: "Permissions-Policy",
              value:
                "camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()",
            },
            /**
             * HSTS: dois anos, incluindo subdomínios.
             *
             * Sem `preload` de propósito. Entrar na lista de preload dos
             * navegadores é praticamente irreversível e obriga todo subdomínio
             * — inclusive os que ainda não existem — a servir HTTPS para
             * sempre. É uma decisão de negócio, não de build; quando a DETERA
             * quiser, basta acrescentar a diretiva e submeter o domínio.
             */
            {
              key: "Strict-Transport-Security",
              value: "max-age=63072000; includeSubDomains",
            },
          ],
        },
      ];
    },
  };
}

export default function config(phase: string): NextConfig {
  return construirConfig(phase === PHASE_DEVELOPMENT_SERVER);
}
