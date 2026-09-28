import type { ReactNode } from "react";

import { cn } from "@/lib/utils/cn";

type Tone = "vazio" | "camada";

type SectionProps = {
  id?: string;
  children: ReactNode;
  tone?: Tone;
  className?: string;
  /** Só a Section define respiro vertical — evita margem brigando com margem. */
  space?: "none" | "compact" | "default" | "generous";
  /**
   * Desenha o trecho da trilha desta seção. `fim` faz a linha sumir por fade
   * em vez de bater num terminal — é o último trecho da página.
   */
  trilha?: boolean | "fim";
  /**
   * Id extra ancorado no topo da seção. Serve para os endereços do site
   * anterior (`#servicos`, `#como-funciona`) continuarem caindo no lugar
   * certo depois da renomeação das seções.
   */
  alias?: string;
  /**
   * Densidade do céu nesta seção, de 0 a 1 (`CeuVivo`). Cheio onde a marca
   * fala, quase apagado onde se lê muito.
   */
  ceu?: number;
  "aria-labelledby"?: string;
  "aria-label"?: string;
};

/**
 * O céu agora é um canvas só, fixo atrás da página (`CeuVivo`). Por isso a
 * seção "vazio" é transparente — o fundo dela é o próprio céu — e a
 * "camada" é quase opaca: separa a seção de leitura sem apagar o céu de vez.
 */
const tones: Record<Tone, string> = {
  vazio: "bg-transparent",
  camada: "bg-camada/90",
};

const spaces = {
  none: "",
  compact: "py-14 md:py-20",
  default: "py-20 md:py-28",
  generous: "py-24 md:py-36",
} as const;

export function Section({
  id,
  children,
  tone = "vazio",
  className,
  space = "default",
  trilha = true,
  alias,
  ceu = 0.3,
  ...rest
}: SectionProps) {
  return (
    <section
      id={id}
      data-ceu={ceu}
      className={cn("relative", tones[tone], spaces[space], className)}
      {...rest}
    >
      {alias ? <span id={alias} aria-hidden="true" /> : null}
      {trilha ? (
        <span
          aria-hidden="true"
          className={cn("trilha", trilha === "fim" && "trilha--fim")}
        />
      ) : null}
      {children}
    </section>
  );
}
