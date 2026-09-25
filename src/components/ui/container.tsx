import type { ElementType, ReactNode } from "react";

import { cn } from "@/lib/utils/cn";

type ContainerProps = {
  as?: ElementType;
  children: ReactNode;
  className?: string;
  /** `narrow` para blocos de leitura; `wide` para faixas editoriais. */
  width?: "default" | "wide" | "narrow";
};

const widths = {
  narrow: "max-w-[44rem]",
  default: "max-w-[76rem]",
  wide: "max-w-[88rem]",
} as const;

export function Container({
  as: Tag = "div",
  children,
  className,
  width = "default",
}: ContainerProps) {
  return (
    <Tag className={cn("mx-auto w-full px-6 md:px-10", widths[width], className)}>
      {children}
    </Tag>
  );
}
