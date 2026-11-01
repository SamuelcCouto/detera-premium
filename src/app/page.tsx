import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { Missao } from "@/components/missao/missao";
import { Palco3D } from "@/components/missao/palco-3d";
import { Contato } from "@/components/secoes/contato";
import { Perguntas } from "@/components/secoes/perguntas";
import { EmpresaJsonLd, PerguntasJsonLd } from "@/lib/seo/json-ld";

/**
 * A página é uma missão: chegada ao sistema DETERA, as quatro frentes como
 * planetas, a reentrada no planeta azul com o manifesto, o pouso onde estão
 * os projetos, a órbita do processo e o diário de bordo. Depois disso a
 * página volta a ser página, para as perguntas e o contato.
 *
 * O roteiro de cenas está em `src/lib/missao/cenas.ts`; o plano, em
 * `docs/design-plan.md`.
 */
export default function Home() {
  return (
    <>
      <a href="#conteudo" className="pular-conteudo">
        Pular para o conteúdo
      </a>

      <Palco3D />
      <Header />

      <main id="conteudo">
        <Missao />
        <Perguntas />
        <Contato />
      </main>

      <Footer />

      <EmpresaJsonLd />
      <PerguntasJsonLd />
    </>
  );
}
