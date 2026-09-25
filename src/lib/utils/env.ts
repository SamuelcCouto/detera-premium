/**
 * Variável de ambiente só conta quando tem conteúdo de verdade: a Vercel
 * entrega string vazia para variável declarada e não preenchida, e um `??`
 * simples deixaria essa string vazia passar como se fosse valor.
 */
export function env(value: string | undefined): string | undefined {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}
