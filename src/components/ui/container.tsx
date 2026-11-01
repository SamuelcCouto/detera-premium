import type { ReactNode } from "react";

import { cn } from "@/lib/utils/cn";

const larguras = {
  narrow: "max-w-[44rem]",
  default: "max-w-[76rem]",
  wide: "max-w-[88rem]",
} as const;

export function Container({
  children,
  className,
  size = "default",
}: {
  children: ReactNode;
  className?: string;
  size?: keyof typeof larguras;
}) {
  return (
    <div className={cn("mx-auto w-full px-5 sm:px-8", larguras[size], className)}>{children}</div>
  );
}
