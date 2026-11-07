import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { Missao } from "@/components/missao/missao";
import { Palco3D } from "@/components/missao/palco-3d";
import { Contato } from "@/components/secoes/contato";
import { EmpresaJsonLd, PerguntasJsonLd } from "@/lib/seo/json-ld";

/**
 * A página é uma missão curta: a Via Láctea com a apresentação, o zoom até o
 * sistema solar, um planeta por projeto, o que a DETERA faz, o planeta de quem
 * está lendo e a reentrada até o contato.
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
        <Contato />
      </main>

      <Footer />

      <EmpresaJsonLd />
      <PerguntasJsonLd />
    </>
  );
}
