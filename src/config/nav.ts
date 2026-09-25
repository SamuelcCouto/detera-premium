/**
 * Os ids `servicos`, `como-funciona`, `projetos`, `sobre` e `contato` vêm do
 * site anterior e continuam existindo como âncora: qualquer link já
 * compartilhado cai na seção certa mesmo depois da renomeação.
 */
export const navLinks = [
  { href: "#solucoes", label: "Soluções" },
  { href: "#projetos", label: "Projetos" },
  { href: "#processo", label: "Processo" },
  { href: "#sobre", label: "Sobre" },
  { href: "#contato", label: "Contato" },
] as const;

export type NavLink = (typeof navLinks)[number];
