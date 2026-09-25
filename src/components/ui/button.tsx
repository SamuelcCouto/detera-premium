import Link from "next/link";
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";

import { cn } from "@/lib/utils/cn";

export type ButtonVariant = "determinacao" | "contorno" | "fantasma";
export type ButtonSize = "sm" | "md";

/**
 * As variantes e os estados vivem em `globals.css` (`.btn`), não em classes
 * utilitárias soltas: botão é o componente com mais estados do site — repouso,
 * hover, foco, pressionado, desabilitado — e espalhar isso por `hover:` daria
 * uma lista de classes que ninguém revisa.
 */
const variants: Record<ButtonVariant, string> = {
  determinacao: "btn--determinacao",
  contorno: "btn--contorno",
  fantasma: "btn--fantasma",
};

const sizes: Record<ButtonSize, string> = {
  sm: "h-10 px-4 text-[0.86rem]",
  md: "h-12 px-6 text-[0.95rem]",
};

export function buttonStyles({
  variant = "determinacao",
  size = "md",
  className,
}: {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
} = {}) {
  return cn(
    "btn",
    variants[variant],
    variant === "fantasma" ? "h-auto px-0" : sizes[size],
    "disabled:pointer-events-none disabled:opacity-50",
    className,
  );
}

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: ReactNode;
};

export function Button({
  variant,
  size,
  className,
  children,
  type = "button",
  ...rest
}: ButtonProps) {
  return (
    <button type={type} className={buttonStyles({ variant, size, className })} {...rest}>
      {children}
    </button>
  );
}

type ButtonLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  href: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: ReactNode;
};

/** `next/link` para rota interna; `<a>` para âncora e link externo. */
export function ButtonLink({
  href,
  variant,
  size,
  className,
  children,
  ...rest
}: ButtonLinkProps) {
  const classes = buttonStyles({ variant, size, className });
  const isPlainAnchor = /^(https?:|mailto:|tel:|#)/.test(href);

  if (isPlainAnchor) {
    const isExternal = href.startsWith("http");
    return (
      <a
        href={href}
        className={classes}
        target={isExternal ? "_blank" : undefined}
        rel={isExternal ? "noopener noreferrer" : undefined}
        {...rest}
      >
        {children}
      </a>
    );
  }

  return (
    <Link href={href} className={classes} {...rest}>
      {children}
    </Link>
  );
}
