export const navLinks = [
  { href: "#projetos", label: "Projetos" },
  { href: "#solucoes", label: "O que fazemos" },
  { href: "#contato", label: "Contato" },
] as const;

export type NavLink = (typeof navLinks)[number];
