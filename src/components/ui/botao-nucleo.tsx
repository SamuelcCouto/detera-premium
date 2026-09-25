"use client";

import { useRef } from "react";
import type { AnchorHTMLAttributes, PointerEvent, ReactNode } from "react";

import { buttonStyles } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";

type Props = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "children"> & {
  href: string;
  children: ReactNode;
};

/**
 * O botão de determinação, com um reflexo que acompanha o cursor — o
 * núcleo da marca reagindo a quem está ali.
 *
 * É o único tratamento assim no site. Os dois ou três CTAs mais importantes
 * da página merecem esse refinamento; passá-lo para todo botão banalizaria
 * o gesto e viraria ruído visual.
 */
export function BotaoNucleo({ href, children, className, ...rest }: Props) {
  const ref = useRef<HTMLAnchorElement>(null);

  function mover(evento: PointerEvent<HTMLAnchorElement>) {
    if (evento.pointerType !== "mouse") return;
    const area = ref.current?.getBoundingClientRect();
    if (!area) return;
    const x = ((evento.clientX - area.left) / area.width) * 100;
    const y = ((evento.clientY - area.top) / area.height) * 100;
    ref.current!.style.setProperty("--mx", `${x}%`);
    ref.current!.style.setProperty("--my", `${y}%`);
  }

  const isExternal = href.startsWith("http");

  return (
    <a
      ref={ref}
      href={href}
      onPointerMove={mover}
      target={isExternal ? "_blank" : undefined}
      rel={isExternal ? "noopener noreferrer" : undefined}
      className={cn(buttonStyles({ variant: "determinacao" }), "btn-nucleo", className)}
      {...rest}
    >
      {children}
    </a>
  );
}
