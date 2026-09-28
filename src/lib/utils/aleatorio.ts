/**
 * Gerador determinístico (xorshift). Nunca `Math.random()` em código que
 * possa rodar no servidor: uma sequência diferente a cada carregamento faria
 * o céu e a ordem dos blocos "pularem" sem motivo, e divergiria entre o HTML
 * do servidor e o navegador. Com semente fixa, o resultado é sempre o mesmo.
 */
export function criarGerador(semente: number) {
  let estado = semente || 1;
  return () => {
    estado ^= estado << 13;
    estado ^= estado >>> 17;
    estado ^= estado << 5;
    estado |= 0;
    return (estado >>> 0) / 4294967295;
  };
}

/** Os índices de 0 a `n - 1` embaralhados, sempre na mesma ordem para a mesma semente. */
export function ordemSorteada(n: number, semente: number) {
  const aleatorio = criarGerador(semente);
  const ordem = Array.from({ length: n }, (_, i) => i);
  for (let i = n - 1; i > 0; i--) {
    const j = Math.floor(aleatorio() * (i + 1));
    [ordem[i], ordem[j]] = [ordem[j], ordem[i]];
  }
  return ordem;
}
