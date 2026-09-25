import { twMerge } from "tailwind-merge";

type ClassValue = string | number | null | undefined | false | ClassValue[];

/**
 * Junta classes condicionais e resolve conflitos do Tailwind mantendo a
 * última — sem isso, uma classe passada por prop perde para o estilo base do
 * componente e a diferença só aparece no mobile.
 */
export function cn(...inputs: ClassValue[]): string {
  const out: string[] = [];
  for (const input of inputs) {
    if (!input) continue;
    if (Array.isArray(input)) {
      const nested = cn(...input);
      if (nested) out.push(nested);
    } else {
      out.push(String(input));
    }
  }
  return twMerge(out.join(" "));
}
