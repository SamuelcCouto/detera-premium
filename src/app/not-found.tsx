import type { Metadata } from "next";

import { Simbolo } from "@/components/brand/wordmark";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";

export const metadata: Metadata = {
  title: "Página não encontrada",
  robots: { index: false, follow: false },
};

/**
 * Tela vazia é convite para agir, não pedido de desculpas.
 */
export default function NaoEncontrada() {
  return (
    <main className="bg-vazio flex min-h-screen items-center">
      <Container>
        <Simbolo className="text-borda-viva h-10 w-8" vivo />

        <p className="estado mt-8">Rota inexistente</p>

        <h1 className="text-display mt-4 max-w-[16ch]">Você saiu do caminho</h1>

        <p className="text-lead text-texto-suave mt-5 max-w-[46ch]">
          Este endereço não existe, ou não existe mais. O que não quer dizer que
          acabou: dá para voltar e seguir de onde parou.
        </p>

        <div className="mt-9 flex flex-col gap-3 sm:flex-row">
          <ButtonLink href="/" variant="determinacao">
            Continuar
          </ButtonLink>
          <ButtonLink href="/#contato" variant="contorno">
            Falar com a gente
          </ButtonLink>
        </div>
      </Container>
    </main>
  );
}
