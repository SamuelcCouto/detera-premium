"use client";

import { useEffect } from "react";

/**
 * Rede de segurança para falha no próprio layout raiz — o único caso que o
 * `error.tsx` não alcança, porque ali o layout já quebrou.
 *
 * Substitui `<html>` e `<body>` inteiros, então não pode depender de nada do
 * sistema de design: se o CSS global não carregou, ele também não estaria
 * disponível aqui. Por isso o estilo vai inline, com as cores da marca
 * escritas na mão — é a única tela do projeto onde duplicar valor de cor é a
 * escolha certa.
 *
 * Como em `error.tsx`, o texto é genérico: nada de mensagem de exceção ou
 * stack trace na tela.
 */
export default function ErroGlobal({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="pt-BR">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          background: "#07080b",
          color: "#f2f3f5",
          fontFamily: "system-ui, -apple-system, sans-serif",
        }}
      >
        <main style={{ padding: "0 1.5rem", maxWidth: "40rem", margin: "0 auto" }}>
          <div
            aria-hidden="true"
            style={{
              width: 10,
              height: 10,
              background: "#ff3b3b",
              transform: "rotate(45deg)",
            }}
          />
          <h1 style={{ fontSize: "2rem", margin: "1.75rem 0 0", lineHeight: 1.1 }}>
            Alguma coisa quebrou aqui
          </h1>
          <p style={{ color: "#9ba1ac", lineHeight: 1.6, marginTop: "1rem" }}>
            O erro foi registrado do nosso lado. Tente recarregar a página.
          </p>
          <button
            type="button"
            onClick={reset}
            style={{
              marginTop: "2rem",
              padding: "0.75rem 1.5rem",
              border: 0,
              borderRadius: 2,
              background: "#ff3b3b",
              color: "#07080b",
              fontWeight: 600,
              fontSize: "0.95rem",
              cursor: "pointer",
            }}
          >
            Tentar de novo
          </button>
        </main>
      </body>
    </html>
  );
}
