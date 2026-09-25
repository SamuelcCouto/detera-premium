import type { SVGProps } from "react";

/**
 * Ícones desenhados no mesmo traço do resto do site: linha de 1,5, ponta reta,
 * nada preenchido. Ficam aqui em vez de virar dependência — são seis formas.
 */
const base = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.5,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": true,
} satisfies SVGProps<SVGSVGElement>;

export function IconeWhatsapp(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <path d="M20.5 11.6a8.4 8.4 0 0 1-12.4 7.4L3.5 20.5l1.6-4.5A8.4 8.4 0 1 1 20.5 11.6Z" />
      <path d="M8.9 8.4c.3-.6.6-.6.9-.6h.6c.2 0 .5 0 .7.6l.7 1.6c.1.3 0 .5-.1.7l-.5.6c-.2.2-.3.4-.1.7a6.6 6.6 0 0 0 3 2.6c.3.1.5.1.7-.1l.6-.7c.2-.2.4-.2.6-.1l1.6.8c.3.1.4.3.4.5v.7c0 .5-.5 1.1-1.1 1.3-.6.2-1.4.2-3.6-.8a10.4 10.4 0 0 1-4.5-4.5c-.9-1.9-.7-2.8-.5-3.3Z" />
    </svg>
  );
}

export function IconeEmail(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <rect x="3" y="5" width="18" height="14" rx="1" />
      <path d="m3 7 9 6 9-6" />
    </svg>
  );
}

export function IconeLinkedin(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <rect x="3" y="3" width="18" height="18" rx="1" />
      <path d="M7.5 10.5V17M7.5 7.2v.1M11.5 17v-3.6a2.1 2.1 0 0 1 4.2 0V17" />
    </svg>
  );
}

export function IconeGithub(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <path d="m9 18-5-6 5-6M15 6l5 6-5 6" />
    </svg>
  );
}

export function IconeSeta(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <path d="M5 12h13M13 6.5 18.5 12 13 17.5" />
    </svg>
  );
}

export function IconeLinkExterno(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <path d="M13.5 5.5H18.5V10.5" />
      <path d="M18.5 5.5 11 13" />
      <path d="M17 14.5v3a1 1 0 0 1-1 1H6.5a1 1 0 0 1-1-1V8a1 1 0 0 1 1-1h3" />
    </svg>
  );
}
