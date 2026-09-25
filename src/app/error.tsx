"use client";

import { useEffect } from "react";

import { Simbolo } from "@/components/brand/wordmark";
import { ButtonLink, Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";

/**
 * Tela de erro da aplicação.
 *
 * O que aparece para quem está lendo é uma frase genérica — nunca a mensagem
 * da exceção, nunca o stack trace. Em produção o Next já poda o `error` que
 * chega aqui (sobra só um `digest`), mas depender disso seria confiar no
 * comportamento do framework para não vazar detalhe interno; a tela é
 * genérica por construção.
 *
 * O `digest` é mostrado de propósito: é um identificador opaco, sem conteúdo
 * sensível, que a pessoa pode citar no contato e a gente cruza com o log do
 * servidor.
 */
export default function Erro({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // O detalhe fica no console do navegador e no log da plataforma, não na
    // tela. Quando houver observabilidade de verdade, é aqui que ela entra.
    console.error(error);
  }, [error]);

  return (
    <main className="bg-vazio flex min-h-screen items-center">
      <Container>
        <Simbolo className="text-borda-viva h-12 w-[2.4rem]" />

        <p className="estado mt-8">Falha inesperada</p>

        <h1 className="text-display mt-4 max-w-[16ch]">Alguma coisa quebrou aqui</h1>

        <p className="text-lead text-texto-suave mt-5 max-w-[46ch]">
          O erro foi registrado do nosso lado. Você pode tentar de novo agora —
          e, se insistir, é só falar com a gente.
        </p>

        {error.digest ? (
          <p className="estado text-texto-fraco mt-6">
            Referência: <span className="tabular">{error.digest}</span>
          </p>
        ) : null}

        <div className="mt-9 flex flex-col gap-3 sm:flex-row">
          <Button variant="determinacao" onClick={reset}>
            Tentar de novo
          </Button>
          <ButtonLink href="/#contato" variant="contorno">
            Falar com a gente
          </ButtonLink>
        </div>
      </Container>
    </main>
  );
}
